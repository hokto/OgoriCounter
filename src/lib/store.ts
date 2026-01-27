import { prisma } from '@/lib/db';
import { Room, Member } from './types';
import crypto from 'crypto';

// Helper to map Prisma Room (with relations) to App Room Type
function mapToAppRoom(pRoom: any): Room {
    const members = pRoom.members.map((rm: any) => ({
        id: rm.user.id,
        name: rm.user.name || 'Unknown',
        email: rm.user.email,
        avatar: rm.user.image,
        order: rm.order
    })).sort((a: Member, b: Member) => a.order - b.order);

    const history = pRoom.turns.map((t: any) => ({
        id: t.id,
        memberId: t.userId,
        timestamp: t.createdAt.toISOString()
    })).sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Derive ownerId from the first member (creator usually order 0) for compatibility
    const ownerId = members.length > 0 ? members[0].id : 'system';

    return {
        id: pRoom.id,
        name: pRoom.name,
        ownerId: ownerId,
        inviteCode: pRoom.inviteCode,
        members,
        currentMemberId: pRoom.currentTurnUserId,
        history
    };
}

// Fetch user's rooms
export async function getUserRooms(userId: string): Promise<Room[]> {
    const rooms = await prisma.room.findMany({
        where: {
            members: {
                some: { userId: userId }
            }
        },
        include: {
            members: { include: { user: true } },
            turns: true
        },
        orderBy: { updatedAt: 'desc' }
    });
    return rooms.map(mapToAppRoom);
}

export async function createRoom(name: string, userId: string): Promise<Room> {
    const inviteCode = crypto.randomBytes(3).toString('hex').toUpperCase();

    const room = await prisma.room.create({
        data: {
            name,
            inviteCode,
            members: {
                create: {
                    userId: userId,
                    order: 0
                }
            },
            // Initially no current member set? Or set to creator?
            // currentTurnUserId: userId // Can't set immediately easily in one go if ID not known?
            // Actually we can connect. But wait, we need User ID.
        },
        include: {
            members: { include: { user: true } },
            turns: true
        }
    });

    // Update current turn to the creator
    const updatedRoom = await prisma.room.update({
        where: { id: room.id },
        data: { currentTurnUserId: userId },
        include: {
            members: { include: { user: true } },
            turns: true
        }
    });

    return mapToAppRoom(updatedRoom);
}

export async function joinRoom(code: string, userId: string): Promise<Room | null> {
    // Find room by invite code (or ID)
    const room = await prisma.room.findFirst({
        where: {
            OR: [
                { inviteCode: code },
                { id: code }
            ]
        },
        include: { members: true } // Check membership order
    });

    if (!room) return null;

    // Check if already member
    const isMember = room.members.some(m => m.userId === userId);

    if (!isMember) {
        await prisma.roomMember.create({
            data: {
                roomId: room.id,
                userId: userId,
                order: room.members.length // Next order
            }
        });
    }

    return getRoom(room.id);
}

export async function getRoom(roomId: string): Promise<Room | null> {
    const room = await prisma.room.findUnique({
        where: { id: roomId },
        include: {
            members: { include: { user: true } },
            turns: { orderBy: { createdAt: 'desc' } }
        }
    });

    if (!room) return null;
    return mapToAppRoom(room);
}

// --- Turn Logic ---

export async function rotateTurn(roomId: string): Promise<Room | null> {
    const room = await prisma.room.findUnique({
        where: { id: roomId },
        include: { members: true }
    });

    if (!room || !room.currentTurnUserId || room.members.length === 0) return null; // Should re-fetch room at end anyway

    // Sort members by order
    const members = room.members.sort((a: any, b: any) => a.order - b.order);
    const currentIndex = members.findIndex(m => m.userId === room.currentTurnUserId);

    if (currentIndex === -1) {
        // Fallback
        await prisma.room.update({
            where: { id: roomId },
            data: { currentTurnUserId: members[0].userId }
        });
        return getRoom(roomId);
    }

    const nextIndex = (currentIndex + 1) % members.length;
    const nextUserId = members[nextIndex].userId;

    // Transaction: Create Turn and Update Room
    await prisma.$transaction([
        prisma.turn.create({
            data: {
                roomId: roomId,
                userId: room.currentTurnUserId, // User who finished their turn (paid)
            }
        }),
        prisma.room.update({
            where: { id: roomId },
            data: { currentTurnUserId: nextUserId }
        })
    ]);

    return getRoom(roomId);
}
