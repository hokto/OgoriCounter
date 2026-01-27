'use client';

import React, { useState } from 'react';
import { Room } from '@/lib/types';
import { motion } from 'framer-motion';
import { signIn, signOut } from 'next-auth/react';
import Link from 'next/link';
import { createRoomAction, joinRoomAction } from '@/lib/actions';

import { useRouter } from 'next/navigation';

interface ClientDashboardProps {
    rooms: Room[];
    session: any;
}

export default function ClientDashboard({ rooms, session }: ClientDashboardProps) {
    const [isCreating, setIsCreating] = useState(false);
    const [isJoining, setIsJoining] = useState(false);
    const [inputName, setInputName] = useState('');
    const [inputCode, setInputCode] = useState('');
    const router = useRouter();

    if (!session) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <button onClick={() => signIn('google')} className="glass" style={{ padding: '1rem 2rem', borderRadius: '99px', background: '#ffffff', color: '#333', border: 'none', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    Sign in with Google
                </button>
            </div>
        );
    }

    const handleCreate = async () => {
        if (!inputName) return;
        const room = await createRoomAction(inputName);
        setInputName('');
        setIsCreating(false);
        if (room) {
            router.refresh(); // Update the list in the background
            router.push(`/rooms/${room.id}`);
        }
    };

    const handleJoin = async () => {
        if (!inputCode) return;
        const room = await joinRoomAction(inputCode);
        setInputCode('');
        setIsJoining(false);
        if (room) {
            router.refresh();
            router.push(`/rooms/${room.id}`);
        } else {
            alert("Invalid Invite Code");
        }
    };

    return (
        <div className="container">
            <header className="header">
                <h1 className="text-gradient" style={{ fontSize: '1.5rem' }}>Your Rooms</h1>
                <div className="header-user">
                    <div className="header-user">
                        <span style={{ fontSize: '0.8rem' }}>{session.user.name}</span>
                        <img
                            src={session.user.image || ''}
                            alt="avatar"
                            style={{ width: 32, height: 32, borderRadius: '50%' }}
                        />
                    </div>
                    <button
                        onClick={() => signOut()}
                        className="btn-ghost"
                        style={{ background: '#ffffff', color: '#333', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', fontSize: '0.7rem', padding: '0.4rem 0.8rem' }}
                    >
                        Sign Out
                    </button>
                </div>
            </header>

            <div className="room-list">
                {rooms.length === 0 && (
                    <div style={{ textAlign: 'center', opacity: 0.6, padding: '2rem' }}>
                        No rooms yet. Create or join one!
                    </div>
                )}

                {rooms.map(room => (
                    <Link href={`/rooms/${room.id}`} key={room.id}>
                        <div className="glass room-card">
                            <h2 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{room.name}</h2>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', opacity: 0.7 }}>
                                <span>{room.members.length} members</span>
                                {room.currentMemberId && (
                                    <span>Turn: {room.members.find(m => m.id === room.currentMemberId)?.name}</span>
                                )}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            <div className="action-buttons">
                <button
                    onClick={() => setIsCreating(true)}
                    className="btn-primary"
                >
                    Create Room
                </button>
                <button
                    onClick={() => setIsJoining(true)}
                    className="btn-secondary"
                >
                    Join Room
                </button>
            </div>

            {/* Modal for Create */}
            {isCreating && (
                <div
                    onClick={() => setIsCreating(false)}
                    className="modal-overlay"
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        className="glass modal-content"
                    >
                        <h2 style={{ marginBottom: '1rem' }}>Create Room</h2>
                        <input
                            type="text"
                            value={inputName}
                            onChange={e => setInputName(e.target.value)}
                            placeholder="Room Name"
                            className="input-field"
                            autoFocus
                        />
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setIsCreating(false)}
                                className="btn-ghost"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreate}
                                disabled={!inputName}
                                className="btn-primary"
                            >
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal for Join */}
            {isJoining && (
                <div
                    onClick={() => setIsJoining(false)}
                    className="modal-overlay"
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        className="glass modal-content"
                    >
                        <h2 style={{ marginBottom: '1rem' }}>Join Room</h2>
                        <input
                            type="text"
                            value={inputCode}
                            onChange={e => setInputCode(e.target.value)}
                            placeholder="Invite Code"
                            className="input-field"
                            autoFocus
                        />
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setIsJoining(false)}
                                className="btn-ghost"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleJoin}
                                disabled={!inputCode}
                                className="btn-primary"
                            >
                                Join
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
