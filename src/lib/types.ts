export type Member = {
    id: string;
    name: string;
    email?: string | null; // Google Email
    order: number; // 0-indexed position in the rotation
    avatar?: string | null; // Optional emoji or image URL
};

export type HistoryItem = {
    id: string;
    memberId: string;
    timestamp: string; // ISO date string
};

export type Room = {
    id: string;
    name: string; // Room name (e.g. "Family", "Trip to Kyoto")
    ownerId: string; // ID of the creator (email)
    members: Member[];
    currentMemberId: string | null;
    history: HistoryItem[];
    inviteCode: string; // Simple code for invitation
};

export type AppState = {
    rooms: Room[]; // List of all rooms
};
