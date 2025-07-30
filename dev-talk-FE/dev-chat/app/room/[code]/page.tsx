'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { Toaster, toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSocket } from '@/hooks/useSocket';
import axios from 'axios';

export default function RoomPage() {
  const { code } = useParams();
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState<string[]>([]);
  const [count, setCount] = useState(0);
  const { socket, isConnected } = useSocket();

  const hasJoinedRoom = useRef(false);
  const currentRoom = useRef<string | null>(null);
  const listenersAttached = useRef(false);
  const [user, setuser] = useState<string | null>(null)
    useEffect(() => {
    const storedUser = localStorage.getItem("user");
    setuser(storedUser);
  }, []);
  useEffect(() => {
    if (!socket || !code) return;

    if (currentRoom.current !== code) {
      hasJoinedRoom.current = false;
      currentRoom.current = code as string;
      setChat([]);
      setCount(0);
    }

    if (!listenersAttached.current) {
      const handleError = (msg: string) => {
        console.error('Socket error:', msg);
        toast.error(msg);
      };

      const handleMessage = (msg: string) => {
        setChat((prev) => [...prev, msg]);
      };

      const handleUserCount = (users: String[]) => {
        setCount(users.length);
      };

      socket.on('error', handleError);
      socket.on('message', handleMessage);
      socket.on('user-count', handleUserCount);
      listenersAttached.current = true;

      return () => {
        socket.off('error', handleError);
        socket.off('message', handleMessage);
        socket.off('user-count', handleUserCount);
        listenersAttached.current = false;
      };
    }
  }, [socket, code]);

  useEffect(() => {
    if (!socket || !code || !isConnected) return;

    const joinAndFetch = async () => {
      if (!hasJoinedRoom.current) {
        socket.emit('join', {
          code,
          user
        });
        hasJoinedRoom.current = true;

        try {
          const response = await axios.get(`http://localhost:3001/api/chat-history/${code}`);
          const history = response.data;
          const formatted = history.map((m: any) =>
            `${m.sender === socket.id ? 'You' : 'Stranger'}: ${m.text}`
          );
          setChat((prev) => [...formatted, ...prev]);
        } catch (err) {
          toast.error('Failed to load previous messages');
          console.error('Fetch history error:', err);
        }
      }
    };

    joinAndFetch();
  }, [socket, code, isConnected]);

  const sendMessage = () => {
    if (!message || !socket?.connected) return;

    socket.emit('message', { code, msg: message });
    setChat((prev) => [...prev, `You: ${message}`]);
    setMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white flex flex-col items-center p-6 relative z-10">
      <Toaster />
      <div className="w-full max-w-3xl bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 mt-24 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">
            Room Code: <span className="text-purple-400">{code}</span>
          </h1>
          <div className="flex items-center gap-2 text-sm">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
            <span className="ml-4">Users: {count}</span>
          </div>
        </div>

        <div className="h-80 overflow-y-auto p-4 bg-white/10 rounded-lg border border-white/10 mb-6 space-y-2">
          {chat.map((msg, idx) => (
            <div key={idx} className="text-sm text-gray-200">
              {msg}
            </div>
          ))}
        </div>

        <div className="flex gap-2 mt-4">
          <Input
            type="text"
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={!isConnected}
            className="flex-1 bg-white/10 text-white placeholder-gray-300 border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <Button
            onClick={sendMessage}
            disabled={!isConnected}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4"
          >
            Send
          </Button>
        </div>

      </div>
    </main>
  );
}
