import { fetchRoom, nextTurn } from '@/lib/actions';
import { auth } from '@/lib/auth';
import RoomView from '@/components/RoomView';
import { notFound } from 'next/navigation';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await auth();
    const room = await fetchRoom(id);

    if (!room) {
        return notFound();
    }

    return (
        <RoomView
            room={room}
            onTurnComplete={nextTurn}
            session={session}
        />
    );
}
