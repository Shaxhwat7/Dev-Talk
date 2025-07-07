'use client';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { Toaster, toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const socket = io('http://localhost:3001');

export default function RoomPage() {
  const { code } = useParams();
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState<string[]>([]);

  useEffect(() => {
    socket.emit('join', code);

    socket.on('error', (msg) => toast.error(msg));

    socket.on('message', (msg) => {
      setChat((prev) => [...prev, msg]);
    });

    return () => {
      socket.disconnect();
    };
  }, [code]);

  const sendMessage = () => {
    if (!message) return;
    socket.emit('message', { code, msg: message });
    setChat((prev) => [...prev, `You: ${message}`]);
    setMessage('');
  };

  return (
    <div className="p-6">
      <Toaster />
      <h1 className="text-2xl mb-4">Room Code: {code}</h1>
      <div className="border h-60 overflow-y-auto mb-4 p-2">
        {chat.map((msg, idx) => (
          <div key={idx}>{msg}</div>
        ))}
      </div>
      <div className="flex space-x-2">
        <Input
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <Button onClick={sendMessage}>Send</Button>
      </div>
    </div>
  );
}
