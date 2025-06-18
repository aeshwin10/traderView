import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface PriceUpdate {
  type: 'priceUpdate';
  data: { [ticker: string]: number };
  timestamp: string;
}

interface WebSocketState {
  connected: boolean;
  prices: { [ticker: string]: number };
  lastUpdate: string | null;
}

export const useWebSocket = (token: string | null) => {
  const [state, setState] = useState<WebSocketState>({
    connected: false,
    prices: {},
    lastUpdate: null,
  });
  
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!token) {
      // Disconnect if no token
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setState({
        connected: false,
        prices: {},
        lastUpdate: null,
      });
      return;
    }

    // Create socket connection
    const socket = io(process.env.REACT_APP_WS_URL || 'http://localhost:5000', {
      transports: ['websocket'],
    });

    socketRef.current = socket;

    // Handle connection
    socket.on('connect', () => {
      console.log('WebSocket connected');
      setState(prev => ({ ...prev, connected: true }));
      
      // Authenticate with token
      socket.emit('authenticate', token);
    });

    // Handle authentication response
    socket.on('authenticated', (response: { success: boolean; userId?: number; error?: string }) => {
      if (response.success) {
        console.log('WebSocket authenticated for user:', response.userId);
      } else {
        console.error('WebSocket authentication failed:', response.error);
      }
    });

    // Handle price updates
    socket.on('priceUpdate', (update: PriceUpdate) => {
      console.log('Price update received:', update);
      setState(prev => ({
        ...prev,
        prices: { ...prev.prices, ...update.data },
        lastUpdate: update.timestamp,
      }));
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setState(prev => ({ ...prev, connected: false }));
    });

    // Handle connection errors
    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setState(prev => ({ ...prev, connected: false }));
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, [token]);

  return state;
}; 