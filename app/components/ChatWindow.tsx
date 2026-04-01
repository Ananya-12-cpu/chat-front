'use client';

import { useOptimistic, useActionState, useEffect, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Conversation, Message } from '../data/conversations';

type ChatWindowProps = {
  conversation: Conversation;
  onSendMessage: (content: string) => void;
  onBack: () => void;
};

// Separate component so useFormStatus can read the parent <form>'s pending state
function MessageInput({
  onKeyDown,
}: {
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}) {
  const { pending } = useFormStatus();
  const [hasContent, setHasContent] = useState(false);

  // Reset the "has content" flag once the form submission completes
  useEffect(() => {
    if (!pending) setHasContent(false);
  }, [pending]);

  return (
    <>
      <button
        type="button"
        aria-label="Add emoji"
        className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors mb-0.5"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500">
          <circle cx="12" cy="12" r="10" />
          <path d="M8 14s1.5 2 4 2 4-2 4-2" />
          <line x1="9" y1="9" x2="9.01" y2="9" />
          <line x1="15" y1="9" x2="15.01" y2="9" />
        </svg>
      </button>

      <div className="flex-1 bg-zinc-100 dark:bg-zinc-800 rounded-2xl px-4 py-2.5">
        <textarea
          name="message"
          placeholder="Type a message..."
          rows={1}
          disabled={pending}
          onChange={(e) => setHasContent(e.target.value.trim().length > 0)}
          onKeyDown={onKeyDown}
          className="w-full bg-transparent text-sm text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 outline-none resize-none leading-relaxed max-h-32 disabled:opacity-50"
        />
      </div>

      <button
        type="submit"
        disabled={!hasContent || pending}
        aria-label="Send message"
        className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-full bg-violet-500 hover:bg-violet-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors mb-0.5"
      >
        {pending ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white animate-spin">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeDashoffset="12" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="translate-x-0.5">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        )}
      </button>
    </>
  );
}

export default function ChatWindow({ conversation, onSendMessage, onBack }: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Show new messages optimistically while the action is in flight
  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    conversation.messages,
    (state: Message[], newMsg: Message) => [...state, newMsg],
  );

  // useActionState handles form state + pending signal consumed by useFormStatus
  const [, formAction] = useActionState(
    async (_: null, formData: FormData) => {
      const content = formData.get('message')?.toString().trim();
      if (!content) return null;

      const timestamp = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });

      // Display the message immediately before the state update propagates
      addOptimisticMessage({ id: `optimistic-${Date.now()}`, content, sender: 'me', timestamp });

      onSendMessage(content);
      return null;
    },
    null,
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [optimisticMessages]);

  // Allow Shift+Enter for newlines; plain Enter submits
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      formRef.current?.requestSubmit();
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <button
          onClick={onBack}
          aria-label="Back to conversations"
          className="sm:hidden w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors -ml-1"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-600 dark:text-zinc-400">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <div className="relative flex-shrink-0">
          <div className={`w-9 h-9 rounded-full ${conversation.color} flex items-center justify-center text-white font-medium text-xs select-none`}>
            {conversation.initials}
          </div>
          {conversation.online && (
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-zinc-900 rounded-full" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 truncate">{conversation.name}</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{conversation.online ? 'Active now' : 'Offline'}</p>
        </div>

        <div className="flex items-center gap-0.5">
          <button aria-label="Voice call" className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500 dark:text-zinc-400">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.28l3-.01a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6.16 6.16l1.89-1.89a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          </button>
          <button aria-label="Video call" className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500 dark:text-zinc-400">
              <polygon points="23 7 16 12 23 17 23 7" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
          </button>
          <button aria-label="More options" className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500 dark:text-zinc-400">
              <circle cx="12" cy="5" r="1" fill="currentColor" />
              <circle cx="12" cy="12" r="1" fill="currentColor" />
              <circle cx="12" cy="19" r="1" fill="currentColor" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages — rendered from optimistic state for instant feedback */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
        {optimisticMessages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
            <div className="max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
              <div
                className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  msg.sender === 'me'
                    ? 'bg-violet-500 text-white rounded-br-md'
                    : 'bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 shadow-sm rounded-bl-md'
                }`}
              >
                {msg.content}
              </div>
              <p className={`text-xs text-zinc-400 mt-1 ${msg.sender === 'me' ? 'text-right' : 'text-left'}`}>
                {msg.timestamp}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input — native form action drives useFormStatus inside MessageInput */}
      <form
        ref={formRef}
        action={formAction}
        className="flex items-end gap-2 px-4 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
      >
        <MessageInput onKeyDown={handleKeyDown} />
      </form>
    </div>
  );
}
