'use client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Toaster, toast } from 'sonner';
import { useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001');

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const createRoom = () => {
    const code = Math.random().toString(36).substring(2, 8);
    setLoading(true);

    socket.emit('create-room', code);

    toast.success(`Room created! Code: ${code}`);
    router.push(`/room/${code}`);
  };

  return (
    <div className="flex flex-col items-center mt-20 space-y-6">
      <Toaster />
      <h1 className="text-4xl font-bold">Welcome to Dev Talk</h1>
      <Button onClick={createRoom} disabled={loading}>
        {loading ? 'Creating...' : 'Create Room'}
      </Button>
    </div>
  );
}
