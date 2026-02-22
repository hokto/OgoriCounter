'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Room } from '@/lib/types';
import { OgoriButton } from '@/components/ui/OgoriButton';
import { TurnIndicator } from '@/components/ui/TurnIndicator';
import { fetchRoom } from '@/lib/actions';
import Link from 'next/link';

const POLL_INTERVAL = 5000; // 5 seconds

interface RoomViewProps {
    room: Room;
    onTurnComplete: (roomId: string) => Promise<void>;
    session: any;
}

export default function RoomView({ room: initialRoom, onTurnComplete, session }: RoomViewProps) {
    const [room, setRoom] = useState<Room>(initialRoom);

    // Polling: fetch latest room data every 5 seconds
    const pollRoom = useCallback(async () => {
        try {
            const updatedRoom = await fetchRoom(room.id);
            if (updatedRoom) {
                setRoom(updatedRoom);
            }
        } catch (e) {
            // Silently ignore polling errors
        }
    }, [room.id]);

    useEffect(() => {
        if (!session) return; // Don't poll if not logged in

        let intervalId: ReturnType<typeof setInterval> | null = null;

        const startPolling = () => {
            if (!intervalId) {
                intervalId = setInterval(pollRoom, POLL_INTERVAL);
            }
        };

        const stopPolling = () => {
            if (intervalId) {
                clearInterval(intervalId);
                intervalId = null;
            }
        };

        // Visibility change handler: pause polling when tab is hidden
        const handleVisibilityChange = () => {
            if (document.hidden) {
                stopPolling();
            } else {
                // Immediately fetch when tab becomes visible again
                pollRoom();
                startPolling();
            }
        };

        // Start polling
        startPolling();
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            stopPolling();
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [pollRoom, session]);

    // Early return AFTER hooks
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

    const handleTurnComplete = async (roomId: string) => {
        await onTurnComplete(roomId);
        // Immediately poll after action for instant feedback
        await pollRoom();
    };

    return (
        <div className="room-view-container">
            <Link href="/" className="back-link">← Back to Rooms</Link>

            <h1 className="text-gradient" style={{ marginBottom: '2rem', fontSize: '2rem' }}>{room.name}</h1>

            {currentMember && <TurnIndicator member={currentMember} />}

            <OgoriButton
                isActive={isMyConfirmTurn}
                onPay={() => handleTurnComplete(room.id)}
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
