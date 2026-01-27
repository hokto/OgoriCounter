'use server';

import { getUserRooms, rotateTurn, createRoom, joinRoom, getRoom } from './store';
import { revalidatePath } from 'next/cache';
import { auth } from './auth';

export async function fetchMyRooms() {
    const session = await auth();
    // session.user.id is now typed in next-auth.d.ts
    if (!session?.user?.id) return [];

    return await getUserRooms(session.user.id);
}

export async function createRoomAction(name: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Not authenticated");

    const room = await createRoom(name, session.user.id);
    revalidatePath('/');
    return room;
}

export async function joinRoomAction(code: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Not authenticated");

    const room = await joinRoom(code, session.user.id);
    if (room) {
        revalidatePath('/');
        return room;
    }
    return null;
}

export async function nextTurn(roomId: string) {
    await rotateTurn(roomId);
    revalidatePath(`/rooms/${roomId}`);
}

export async function fetchRoom(roomId: string) {
    return await getRoom(roomId);
}
