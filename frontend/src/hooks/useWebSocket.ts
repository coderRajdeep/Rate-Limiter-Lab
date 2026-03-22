import { useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useStore } from '../store/useStore';
import type { RateLimiterState } from '../services/api';

export function useWebSocket(algorithmName: string | undefined) {
  const clientRef = useRef<Client | null>(null);
  const setCurrentState = useStore((s) => s.setCurrentState);
  const addStatsPoint = useStore((s) => s.addStatsPoint);

  const connect = useCallback(() => {
    if (!algorithmName) return;

    const client = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe(`/topic/state/${algorithmName}`, (message) => {
          const state: RateLimiterState = JSON.parse(message.body);
          setCurrentState(state);
          addStatsPoint(state.acceptedCount, state.rejectedCount);
        });
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame);
      },
    });

    client.activate();
    clientRef.current = client;
  }, [algorithmName, setCurrentState, addStatsPoint]);

  const disconnect = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.deactivate();
      clientRef.current = null;
    }
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return { disconnect };
}
