'use client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Toaster, toast } from 'sonner';
import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Input } from '@/components/ui/input';

const socket = io('http://localhost:3001');

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [existingCode, setExistingCode] = useState('');

  useEffect(() => {
    socket.on('error', (msg: string) => {
      toast.error(msg);
    });

    return () => {
      socket.off('error');
    };
  }, []);

  const createRoom = () => {
    const code = Math.random().toString(36).substring(2, 8);
    setLoading(true);

    socket.emit('create-room', code);
    toast.success(`Room created! Code: ${code}`);
    router.push(`/room/${code}`);
  };

  const handleJoin = () => {
    if (!existingCode.trim()) {
      toast.error('Please enter a valid room code');
      return;
    }

    socket.emit('join', existingCode);
    toast.success(`Joining room: ${existingCode}`);
    router.push(`/room/${existingCode}`);
  };

  return (
    <div className="flex flex-col items-center mt-20 space-y-6">
      <Toaster />
      <h1 className="text-4xl font-bold">Welcome to Dev Talk</h1>

      <Button onClick={createRoom} disabled={loading}>
        {loading ? 'Creating...' : 'Create Room'}
      </Button>

      <div className="flex space-x-2">
        <Input
          placeholder="Join Existing Room"
          value={existingCode}
          onChange={(e) => setExistingCode(e.target.value)}
        />
        <Button onClick={handleJoin}>Join</Button>
      </div>
    </div>
  );
}
