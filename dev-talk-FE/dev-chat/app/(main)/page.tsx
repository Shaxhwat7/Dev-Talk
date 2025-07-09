'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Toaster, toast } from 'sonner';
import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

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
    <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 px-4">
      <Toaster />
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="shadow-2xl border border-indigo-700 backdrop-blur-md bg-white/5">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl font-extrabold text-white tracking-tight flex justify-center items-center gap-2">
              <Sparkles className="text-cyan-400 w-6 h-6" /> Dev Talk
            </CardTitle>
            <p className="text-sm text-gray-300 mt-2">Real-time chat with a room code ✨</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <Button
              onClick={createRoom}
              disabled={loading}
              className="w-full text-lg font-medium bg-cyan-500 hover:bg-cyan-400 text-white"
            >
              {loading ? (
                <Loader2 className="animate-spin w-4 h-4 mr-2" />
              ) : (
                '🚀 Create New Room'
              )}
            </Button>
            <Separator className="bg-indigo-600" />
            <div className="space-y-2">
              <Input
                className="bg-indigo-800 text-white placeholder-gray-300"
                placeholder="Enter existing room code"
                value={existingCode}
                onChange={(e) => setExistingCode(e.target.value)}
              />
              <Button
                onClick={handleJoin}
                className="w-full bg-transparent border border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-white"
              >
                Join Room
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </main>
  );
}