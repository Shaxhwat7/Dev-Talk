'use client';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { Toaster, toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const socket = io('http://localhost:3001', {
  autoConnect: false, 
});

export default function RoomPage() {
  const { code } = useParams();
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState<string[]>([]);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!socket.connected) socket.connect();

    socket.emit('join', code);

    const onMessage = (msg: string) => setChat((prev) => [...prev, msg]);
    const onError = (msg: string) => toast.error(msg);
    const onUserCount = (count: number) => setCount(count);

    socket.on('message', onMessage);
    socket.on('error', onError);
    socket.on('user-count', onUserCount);

    return () => {
      socket.off('message', onMessage);
      socket.off('error', onError);
      socket.off('user-count', onUserCount);
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
      <h1 className="text-2xl font-bold mb-2">Room Code: {code}</h1>
      <p className="text-sm text-muted-foreground mb-4">
        Users in the room: {count}
      </p>

      <div className="border rounded h-60 overflow-y-auto mb-4 p-2">
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
