'use client';

import React from 'react';
import { Room } from '@/lib/types';
import { OgoriButton } from '@/components/ui/OgoriButton';
import { TurnIndicator } from '@/components/ui/TurnIndicator';
import Link from 'next/link';

interface RoomViewProps {
    room: Room;
    onTurnComplete: (roomId: string) => Promise<void>;
    session: any;
}

export default function RoomView({ room, onTurnComplete, session }: RoomViewProps) {
    // If not logged in, show login page (though page level should handle this)
    if (!session) return null;

    const myId = room.members.find(m => m.email === session.user?.email)?.id;
    const currentMember = room.members.find(m => m.id === room.currentMemberId);

    // New logic: the NEXT person in rotation has the button permission.
    // They press the button to confirm the current person paid.
    const sortedMembers = [...room.members].sort((a, b) => a.order - b.order);
    const currentIndex = sortedMembers.findIndex(m => m.id === room.currentMemberId);
    const nextIndex = currentIndex !== -1 ? (currentIndex + 1) % sortedMembers.length : -1;
    const nextMember = nextIndex !== -1 ? sortedMembers[nextIndex] : null;
    const isMyConfirmTurn = nextMember?.id === myId;
    const isCurrentPayer = currentMember?.id === myId;

    return (
        <div className="room-view-container">
            <Link href="/" className="back-link">← Back to Rooms</Link>

            <h1 className="text-gradient" style={{ marginBottom: '2rem', fontSize: '2rem' }}>{room.name}</h1>

            {currentMember && <TurnIndicator member={currentMember} />}

            <OgoriButton
                isActive={isMyConfirmTurn}
                onPay={() => onTurnComplete(room.id)}
                disabled={!isMyConfirmTurn}
                currentPayerName={currentMember?.name}
                isCurrentPayer={isCurrentPayer}
            />

            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                <p style={{ opacity: 0.5, fontSize: '0.8rem' }}>Invite Code:</p>
                <p style={{ fontSize: '1.2rem', fontWeight: 'bold', letterSpacing: '2px' }}>{room.inviteCode}</p>
            </div>
        </div>
    );
}
