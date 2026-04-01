'use client';

import { useState, useTransition } from 'react';
import { Conversation } from '../data/conversations';

type SidebarProps = {
  conversations: Conversation[];
  selectedId: string;
  onSelect: (id: string) => void;
  onNewRoom: (name: string) => Promise<void>;
  onLogout: () => void;
  visible: boolean;
};

export default function Sidebar({ conversations, selectedId, onSelect, onNewRoom, onLogout, visible }: SidebarProps) {
  const [isPending, startTransition] = useTransition();
  const [creating, setCreating] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [createError, setCreateError] = useState('');
  const [createPending, setCreatePending] = useState(false);

  const handleSelect = (id: string) => {
    startTransition(() => {
      onSelect(id);
    });
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = roomName.trim();
    if (!name) return;
    setCreateError('');
    setCreatePending(true);
    try {
      await onNewRoom(name);
      setRoomName('');
      setCreating(false);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create room');
    } finally {
      setCreatePending(false);
    }
  };

  return (
    <div
      className={`
        w-full sm:w-80 flex-shrink-0 flex flex-col
        border-r border-zinc-200 dark:border-zinc-800
        bg-white dark:bg-zinc-900
        ${visible ? 'flex' : 'hidden sm:flex'}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-zinc-800">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Messages</h1>
        <div className="flex items-center gap-1">
          <button
            aria-label="New room"
            onClick={() => { setCreating((v) => !v); setCreateError(''); setRoomName(''); }}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-600 dark:text-zinc-400">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
          <button
            aria-label="Log out"
            onClick={onLogout}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-600 dark:text-zinc-400">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </div>

      {/* New room form */}
      {creating && (
        <form onSubmit={handleCreateRoom} className="px-4 pt-3 pb-2 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex gap-2">
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Room name…"
              autoFocus
              disabled={createPending}
              className="flex-1 px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={createPending || !roomName.trim()}
              className="px-3 py-2 rounded-xl bg-violet-500 hover:bg-violet-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
            >
              {createPending ? '…' : 'Create'}
            </button>
          </div>
          {createError && <p className="mt-1.5 text-xs text-red-500">{createError}</p>}
        </form>
      )}

      {/* Search */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 rounded-full px-3 py-2">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400 flex-shrink-0">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search conversations..."
            className="bg-transparent text-sm text-zinc-700 dark:text-zinc-300 placeholder-zinc-400 outline-none w-full"
          />
        </div>
      </div>

      {/* Conversation list */}
      <div className={`flex-1 overflow-y-auto transition-opacity ${isPending ? 'opacity-60' : 'opacity-100'}`}>
        {conversations.length === 0 && (
          <p className="px-5 py-4 text-sm text-zinc-400">No rooms yet. Create one above.</p>
        )}
        {conversations.map((conv) => (
          <button
            key={conv.id}
            onClick={() => handleSelect(conv.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left ${
              selectedId === conv.id
                ? 'bg-violet-50 dark:bg-violet-950/30'
                : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
            }`}
          >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className={`w-12 h-12 rounded-full ${conv.color} flex items-center justify-center text-white font-medium text-sm select-none`}>
                {conv.initials}
              </div>
              {conv.online && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-zinc-900 rounded-full" />
              )}
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 truncate">
                  {conv.name}
                </span>
                <span className="text-xs text-zinc-400 flex-shrink-0 ml-2">{conv.time}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate">{conv.lastMessage}</p>
                {conv.unread > 0 && (
                  <span className="flex-shrink-0 min-w-5 h-5 flex items-center justify-center bg-violet-500 text-white text-xs font-medium rounded-full px-1.5">
                    {conv.unread}
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
