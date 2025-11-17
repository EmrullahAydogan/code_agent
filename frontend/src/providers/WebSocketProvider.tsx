import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { WebSocketEvent, WebSocketEventType } from '@local-code-agent/shared';

interface WebSocketContextType {
  socket: Socket | null;
  connected: boolean;
  subscribe: (event: WebSocketEventType, callback: (data: WebSocketEvent) => void) => () => void;
}

const WebSocketContext = createContext<WebSocketContextType>({
  socket: null,
  connected: false,
  subscribe: () => () => {},
});

export const useWebSocket = () => useContext(WebSocketContext);

interface Props {
  children: React.ReactNode;
}

export const WebSocketProvider: React.FC<Props> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const newSocket = io('http://localhost:3000');

    newSocket.on('connect', () => {
      console.log('WebSocket connected');
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const subscribe = (event: WebSocketEventType, callback: (data: WebSocketEvent) => void) => {
    if (!socket) return () => {};

    socket.on(event, callback);

    return () => {
      socket.off(event, callback);
    };
  };

  return (
    <WebSocketContext.Provider value={{ socket, connected, subscribe }}>
      {children}
    </WebSocketContext.Provider>
  );
};
