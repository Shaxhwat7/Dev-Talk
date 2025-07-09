'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { Toaster, toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PaperPlaneIcon } from '@radix-ui/react-icons';
import { motion } from 'framer-motion';

const socket = io('http://localhost:3001', {
  autoConnect: false,
});

export default function RoomPage() {
  const { code } = useParams();
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState<string[]>([]);
  const [count, setCount] = useState(0);
  const chatRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [chat]);

  const sendMessage = () => {
    if (!message.trim()) return;
    socket.emit('message', { code, msg: message });
    setChat((prev) => [...prev, `You: ${message}`]);
    setMessage('');
  };

  return (
    <div className="pt-24 px-4 md:px-10 min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white">
      <Toaster />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-3xl mx-auto w-full space-y-4"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <h1 className="text-3xl font-bold">Room Code: <span className="text-cyan-400">{code}</span></h1>
          <p className="text-sm text-gray-300 mt-2 md:mt-0">
            Users in room: <span className="font-medium text-white">{count}</span>
          </p>
        </div>

        {/* Chat Box */}
        <div
          ref={chatRef}
          className="bg-white/10 border border-white/10 backdrop-blur-md rounded-lg h-80 overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-indigo-500"
        >
          {chat.length === 0 && (
            <p className="text-gray-400 italic text-center mt-10">No messages yet...</p>
          )}
          {chat.map((msg, idx) => (
            <div key={idx} className="bg-white/5 p-2 rounded text-sm">{msg}</div>
          ))}
        </div>

        {/* Message Input */}
        <div className="flex space-x-2">
          <Input
            className="bg-indigo-800 text-white placeholder-gray-300"
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          />
          <Button
            onClick={sendMessage}
            className="bg-cyan-500 hover:bg-cyan-400 text-white"
          >
            <PaperPlaneIcon className="w-4 h-4 mr-1" /> Send
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
