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
    const isMyTurn = currentMember?.id === myId;

    return (
        <div className="room-view-container">
            <Link href="/" className="back-link">← Back to Rooms</Link>

            <h1 className="text-gradient" style={{ marginBottom: '2rem', fontSize: '2rem' }}>{room.name}</h1>

            {currentMember && <TurnIndicator member={currentMember} />}

            <OgoriButton
                isActive={isMyTurn}
                onPay={() => onTurnComplete(room.id)}
                disabled={!isMyTurn}
            />

            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                <p style={{ opacity: 0.5, fontSize: '0.8rem' }}>Invite Code:</p>
                <p style={{ fontSize: '1.2rem', fontWeight: 'bold', letterSpacing: '2px' }}>{room.inviteCode}</p>
            </div>
        </div>
    );
}
