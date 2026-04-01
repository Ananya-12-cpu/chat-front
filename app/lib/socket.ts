import { io, Socket } from 'socket.io-client';
import type { BackendMessage } from './api';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:4000';

let socket: Socket | null = null;

export function getSocket(token: string): Socket {
  if (socket && socket.connected) return socket;

  socket?.disconnect();
  socket = io(WS_URL, {
    auth: { token },
    autoConnect: false,
  });

  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}

export type { BackendMessage };
