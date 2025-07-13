import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

let globalSocket: Socket | null = null;
let isInitializing = false;

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current || isInitializing) return;
    
    initRef.current = true;
    isInitializing = true;

    const initSocket = async () => {
      if (!globalSocket || globalSocket.disconnected) {
        console.log('🔌 Creating new socket connection');
        
        if (globalSocket) {
          globalSocket.removeAllListeners();
          globalSocket.disconnect();
        }

        globalSocket = io('http://localhost:3001', {
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionAttempts: 5,
          timeout: 20000,
        });

        globalSocket.on('connect', () => {
          console.log('✅ Socket connected:', globalSocket?.id);
          setIsConnected(true);
        });

        globalSocket.on('disconnect', (reason) => {
          console.log('❌ Socket disconnected:', reason);
          setIsConnected(false);
        });

        globalSocket.on('connect_error', (error) => {
          console.error('🔥 Socket connection error:', error);
          setIsConnected(false);
        });

      } else {
        console.log('♻️ Reusing existing socket connection');
        setIsConnected(globalSocket.connected);
      }
      
      isInitializing = false;
    };

    initSocket();

    return () => {
      initRef.current = false;
    };
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (globalSocket) {
        console.log('🧹 Page unloading, disconnecting socket');
        globalSocket.disconnect();
        globalSocket = null;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return {
    socket: globalSocket,
    isConnected,
  };
};