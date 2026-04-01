'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { Socket } from 'socket.io-client';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import { useAuth } from './lib/auth-context';
import { api, type BackendMessage, type Room } from './lib/api';
import { getSocket, disconnectSocket } from './lib/socket';
import type { Conversation, Message } from './data/conversations';

const COLORS = [
  'bg-violet-500', 'bg-emerald-500', 'bg-orange-500',
  'bg-pink-500', 'bg-blue-500', 'bg-teal-500',
];

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  return words.length >= 2
    ? `${words[0][0]}${words[1][0]}`.toUpperCase()
    : name.slice(0, 2).toUpperCase();
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function mapMessage(msg: BackendMessage, currentUserId: string): Message {
  return {
    id: msg.id,
    content: msg.text,
    sender: msg.senderId === currentUserId ? 'me' : 'them',
    timestamp: formatTime(msg.timestamp),
  };
}

function roomToConversation(room: Room, index: number): Conversation {
  return {
    id: room.id,
    name: room.name,
    initials: getInitials(room.name),
    color: COLORS[index % COLORS.length],
    lastMessage: '',
    time: '',
    unread: 0,
    online: false,
    messages: [],
  };
}

export default function Home() {
  const router = useRouter();
  const { user, token, loading, clearAuth } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [showSidebar, setShowSidebar] = useState(true);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const socketRef = useRef<Socket | null>(null);
  const currentRoomRef = useRef<string>('');

  // Redirect to login when not authenticated
  useEffect(() => {
    if (!loading && !token) {
      router.push('/login');
    }
  }, [loading, token, router]);

  // Load rooms and connect socket once authenticated
  useEffect(() => {
    if (!token || !user) return;

    let active = true;

    api.getRooms(token)
      .then((rooms) => {
        if (!active) return;
        const convs = rooms.map(roomToConversation);
        setConversations(convs);
        if (convs.length > 0) setSelectedId(convs[0].id);
      })
      .catch((err) => {
        if (!active) return;
        if ((err as Error).message?.toLowerCase().includes('unauthorized')) {
          clearAuth();
          router.push('/login');
        }
      })
      .finally(() => { if (active) setLoadingRooms(false); });

    const socket = getSocket(token);
    socketRef.current = socket;
    socket.connect();

    socket.on('message:new', (msg: BackendMessage) => {
      if (msg.senderId === user.id) return; // already added locally on send
      setConversations((prev) =>
        prev.map((c) =>
          c.id === msg.roomId
            ? {
                ...c,
                messages: [...c.messages, mapMessage(msg, user.id)],
                lastMessage: msg.text,
                time: formatTime(msg.timestamp),
                unread: currentRoomRef.current !== msg.roomId ? c.unread + 1 : 0,
              }
            : c,
        ),
      );
    });

    return () => {
      active = false;
      socket.off('message:new');
      disconnectSocket();
    };
  }, [token, user, clearAuth, router]);

  // Join the selected room and load its messages
  useEffect(() => {
    if (!selectedId || !token || !user || !socketRef.current) return;

    const socket = socketRef.current;
    const prev = currentRoomRef.current;

    if (prev && prev !== selectedId) {
      socket.emit('room:leave', prev);
    }
    currentRoomRef.current = selectedId;

    api.getRoomMessages(selectedId, token).then((msgs) => {
      const mapped = msgs.map((m) => mapMessage(m, user.id));
      const last = mapped[mapped.length - 1];
      setConversations((cs) =>
        cs.map((c) =>
          c.id === selectedId
            ? {
                ...c,
                messages: mapped,
                lastMessage: last?.content ?? c.lastMessage,
                time: last?.timestamp ?? c.time,
              }
            : c,
        ),
      );
    });

    socket.emit('room:join', selectedId);
  }, [selectedId, token, user]);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setShowSidebar(false);
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c)),
    );
  };

  const handleSendMessage = useCallback(
    (content: string) => {
      if (!selectedId || !socketRef.current) return;
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedId
            ? {
                ...c,
                messages: [...c.messages, { id: `local-${Date.now()}`, content, sender: 'me', timestamp: time }],
                lastMessage: content,
                time,
              }
            : c,
        ),
      );
      socketRef.current.emit('message:send', { roomId: selectedId, text: content });
    },
    [selectedId],
  );

  const handleNewRoom = useCallback(
    async (name: string) => {
      if (!token) return;
      const room = await api.createRoom(name, token);
      const newConv = roomToConversation(room, conversations.length);
      setConversations((prev) => [...prev, newConv]);
      setSelectedId(newConv.id);
      setShowSidebar(false);
    },
    [token, conversations.length],
  );

  const handleLogout = () => {
    disconnectSocket();
    clearAuth();
    router.push('/login');
  };

  if (loading || loadingRooms) {
    return (
      <div className="flex-1 flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="w-6 h-6 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  const selectedConversation = conversations.find((c) => c.id === selectedId);

  return (
    <div className="flex flex-1 overflow-hidden">
      <Sidebar
        conversations={conversations}
        selectedId={selectedId}
        onSelect={handleSelect}
        onNewRoom={handleNewRoom}
        onLogout={handleLogout}
        visible={showSidebar}
      />
      <div className={`flex-1 min-w-0 ${showSidebar ? 'hidden sm:flex' : 'flex'}`}>
        {selectedConversation ? (
          <ChatWindow
            conversation={selectedConversation}
            onSendMessage={handleSendMessage}
            onBack={() => setShowSidebar(true)}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-sm text-zinc-400">
            {conversations.length === 0 ? 'Create a room to get started.' : 'Select a conversation.'}
          </div>
        )}
      </div>
    </div>
  );
}
