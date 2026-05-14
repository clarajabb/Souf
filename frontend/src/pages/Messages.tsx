import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { messagesApi } from '../api/client';
import { Conversation, User } from '../types';
import MessageThread from '../components/MessageThread';

export default function Messages() {
  const { t } = useTranslation();
  const { userId } = useParams<{ userId?: string }>();

  const { data: conversations = [] } = useQuery<Conversation[]>({
    queryKey: ['conversations'],
    queryFn: () => messagesApi.getConversations().then((r) => r.data),
    refetchInterval: 5000,
  });

  const [activePartner, setActivePartner] = useState<Partial<User> | null>(() => {
    if (userId) return { id: userId };
    return null;
  });

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('messages.title')}</h1>

      <div className="card overflow-hidden" style={{ height: 'calc(100vh - 200px)', minHeight: '500px' }}>
        <div className="flex h-full">
          {/* Conversation list */}
          <div className={`flex flex-col border-r border-gray-100 ${activePartner ? 'hidden sm:flex' : 'flex'} sm:w-72 w-full`}>
            <div className="p-3 border-b border-gray-100">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Conversations</p>
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="p-6 text-center text-gray-400 text-sm">
                  {t('messages.noConversations')}
                </div>
              ) : (
                conversations.map((conv) => {
                  const isActive = activePartner?.id === conv.partner.id;
                  const unread = !conv.latestMessage.isRead && conv.latestMessage.receiverId !== conv.partner.id;
                  return (
                    <button
                      key={conv.partner.id}
                      onClick={() => setActivePartner(conv.partner)}
                      className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left ${
                        isActive ? 'bg-brand-50 border-r-2 border-brand-500' : ''
                      }`}
                    >
                      <div className="relative flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-semibold overflow-hidden">
                          {conv.partner.avatarUrl ? (
                            <img src={conv.partner.avatarUrl} alt={conv.partner.name} className="w-full h-full object-cover" />
                          ) : (
                            (conv.partner.name ?? '?')[0].toUpperCase()
                          )}
                        </div>
                        {unread && (
                          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-brand-500 rounded-full border-2 border-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`text-sm truncate ${unread ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                            {conv.partner.name}
                          </p>
                          <span className="text-xs text-gray-400 flex-shrink-0 ml-1">
                            {formatTime(conv.latestMessage.createdAt)}
                          </span>
                        </div>
                        <p className={`text-xs truncate mt-0.5 ${unread ? 'text-gray-700' : 'text-gray-400'}`}>
                          {conv.latestMessage.content}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Thread area */}
          <div className={`flex-1 flex flex-col ${activePartner ? 'flex' : 'hidden sm:flex'}`}>
            {activePartner ? (
              <>
                {/* Mobile back button */}
                <div className="sm:hidden px-4 py-2 border-b border-gray-100">
                  <button
                    onClick={() => setActivePartner(null)}
                    className="text-sm text-brand-600 hover:underline"
                  >
                    ← Back
                  </button>
                </div>
                <div className="flex-1 min-h-0">
                  <MessageThread partner={activePartner} />
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <p className="text-sm">{t('messages.selectConversation')}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
