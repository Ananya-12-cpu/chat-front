const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export type User = { id: string; username: string };
export type AuthResponse = { token: string; user: User };

export type Room = {
  id: string;
  name: string;
  createdBy: string;
  memberCount: number;
};

export type BackendMessage = {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
};

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const { headers: extraHeaders, ...rest } = options;
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
    ...rest,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? 'Request failed');
  return data as T;
}

function authHeader(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` };
}

export const api = {
  register: (username: string, password: string) =>
    request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  login: (username: string, password: string) =>
    request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  getRooms: (token: string) =>
    request<Room[]>('/api/rooms', { headers: authHeader(token) }),

  createRoom: (name: string, token: string) =>
    request<Room>('/api/rooms', {
      method: 'POST',
      headers: authHeader(token),
      body: JSON.stringify({ name }),
    }),

  getRoomMessages: (roomId: string, token: string) =>
    request<BackendMessage[]>(`/api/rooms/${roomId}/messages`, {
      headers: authHeader(token),
    }),
};
