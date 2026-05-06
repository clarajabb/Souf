import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { messagesApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Message, User } from '../types';

interface Props {
  partner: Partial<User>;
}

export default function MessageThread({ partner }: Props) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadMessages = async () => {
    try {
      const res = await messagesApi.getThread(partner.id!);
      setMessages(res.data);
      await messagesApi.markRead(partner.id!);
    } catch {
      // silently fail for polling
    }
  };

  useEffect(() => {
    if (!partner.id) return;
    loadMessages();

    // Poll every 3 seconds
    pollRef.current = setInterval(loadMessages, 3000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [partner.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSending(true);
    const text = content.trim();
    setContent('');

    try {
      const res = await messagesApi.send(partner.id!, text);
      setMessages((prev) => [...prev, res.data]);
    } catch {
      toast.error(t('common.error'));
      setContent(text);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric' });

  // Group by date
  const grouped: Record<string, Message[]> = {};
  for (const msg of messages) {
    const d = new Date(msg.createdAt).toDateString();
    if (!grouped[d]) grouped[d] = [];
    grouped[d].push(msg);
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white">
        <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-semibold overflow-hidden flex-shrink-0">
          {partner.avatarUrl ? (
            <img src={partner.avatarUrl} alt={partner.name} className="w-full h-full object-cover" />
          ) : (
            (partner.name ?? '?')[0].toUpperCase()
          )}
        </div>
        <div>
          <p className="font-medium text-sm text-gray-900">{partner.name}</p>
          {partner.country && <p className="text-xs text-gray-400">{partner.country}</p>}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-8">Start the conversation below.</p>
        )}

        {Object.entries(grouped).map(([date, msgs]) => (
          <div key={date}>
            <div className="text-center my-3">
              <span className="bg-white text-gray-400 text-xs px-3 py-1 rounded-full shadow-sm">
                {formatDate(msgs[0].createdAt)}
              </span>
            </div>
            <div className="space-y-2">
              {msgs.map((msg) => {
                const mine = msg.senderId === user?.id;
                return (
                  <div key={msg.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
                        mine
                          ? 'bg-brand-600 text-white rounded-br-sm'
                          : 'bg-white text-gray-800 shadow-sm rounded-bl-sm'
                      }`}
                    >
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      <p className={`text-right mt-0.5 text-xs ${mine ? 'text-brand-200' : 'text-gray-400'}`}>
                        {formatTime(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={send} className="p-3 border-t border-gray-100 bg-white flex gap-2">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={t('messages.typeMessage')}
          className="input flex-1"
          disabled={sending}
        />
        <button type="submit" disabled={sending || !content.trim()} className="btn-primary px-4">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </form>
    </div>
  );
}
