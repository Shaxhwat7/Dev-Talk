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

      const handleUserCount = (count: number) => {
        console.log('Received user count:', count);
        setCount(count);
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
        console.log('🚪 Joining room:', code);
        socket.emit('join', code);
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
    <div className="p-6">
      <Toaster />
      <h1 className="text-2xl mb-4">Room Code: {code}</h1>
      <div className="flex items-center gap-2 mb-2">
        <p>Users in the room: {count}</p>
        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
        <span className="text-sm text-gray-600">
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>
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
          onKeyPress={handleKeyPress}
          disabled={!isConnected}
        />
        <Button onClick={sendMessage} disabled={!isConnected}>
          Send
        </Button>
      </div>
    </div>
  );
}