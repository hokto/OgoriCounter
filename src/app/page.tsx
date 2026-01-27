import { fetchMyRooms } from '@/lib/actions';
import { auth } from '@/lib/auth';
import ClientDashboard from '@/components/ClientDashboard';

export default async function Home() {
  const session = await auth();
  const rooms = await fetchMyRooms();

  return (
    <ClientDashboard
      rooms={rooms}
      session={session}
    />
  );
}
