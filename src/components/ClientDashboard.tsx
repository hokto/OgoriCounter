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
            <div className="login-container">
                <div style={{ textAlign: 'center' }}>
                    <h1 className="login-title text-gradient">奢りカウンター</h1>
                    <p className="login-subtitle">次は誰の番？をシンプルに管理</p>
                </div>
                <button onClick={() => signIn('google')} className="btn-signin">
                    <svg width="20" height="20" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Googleでサインイン
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
                        className="btn-signout"
                    >
                        ログアウト
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
