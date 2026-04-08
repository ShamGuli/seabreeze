'use client';

import { useRef, useEffect, useState, FormEvent } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '@/store/chatStore';
import { useLang } from '@/context/LanguageContext';

export default function AiChat() {
  const { t, lang } = useLang();
  const isChatOpen = useChatStore((s) => s.isChatOpen);
  const toggleChat = useChatStore((s) => s.toggleChat);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
      body: { lang },
    }),
  });

  const isLoading = status === 'streaming' || status === 'submitted';

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Focus input when panel opens
  useEffect(() => {
    if (isChatOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isChatOpen]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const text = inputValue.trim();
    if (!text || isLoading) return;
    sendMessage({ text });
    setInputValue('');
  };

  // Extract text from message parts
  const getMessageText = (msg: typeof messages[number]): string => {
    return msg.parts
      .filter((p): p is Extract<typeof p, { type: 'text' }> => p.type === 'text')
      .map((p) => p.text)
      .join('');
  };

  // Render text with clickable links
  const renderWithLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    return parts.map((part, i) =>
      urlRegex.test(part) ? (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#60A5FA', textDecoration: 'underline' }}
        >
          {part}
        </a>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  const panelStyle: React.CSSProperties = isMobile
    ? { position: 'fixed', top: 60, left: 0, right: 0, bottom: 0, borderRadius: '16px 16px 0 0' }
    : { position: 'absolute', bottom: 84, right: 24, width: 360, height: 'min(520px, calc(100vh - 120px))', borderRadius: 16 };

  return (
    <>
      {/* ── FAB Button ── */}
      <button
        onClick={toggleChat}
        style={{
          position: 'absolute',
          bottom: 24,
          right: 24,
          zIndex: 100,
          width: 48,
          height: 48,
          borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.2)',
          background: isChatOpen ? 'rgba(0,150,255,0.5)' : 'rgba(15,15,30,0.85)',
          backdropFilter: 'blur(10px)',
          color: 'white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 0.2s',
        }}
        title={t('chatTitle')}
      >
        {isChatOpen ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>

      {/* ── Chat Panel ── */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            style={{
              ...panelStyle,
              zIndex: 150,
              background: 'rgba(15, 20, 35, 0.92)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '14px 16px',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: '#10B981',
                  boxShadow: '0 0 6px rgba(16,185,129,0.5)',
                }} />
                <span style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>
                  {t('chatTitle')}
                </span>
              </div>
              <button
                onClick={toggleChat}
                style={{
                  width: 28, height: 28, borderRadius: '50%',
                  border: 'none',
                  background: 'rgba(255,255,255,0.08)',
                  color: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="chat-scroll" style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}>
              {/* Welcome message */}
              {messages.length === 0 && !isLoading && (
                <div style={{
                  background: 'rgba(255,255,255,0.06)',
                  borderRadius: '16px 16px 16px 4px',
                  padding: '10px 14px',
                  color: 'rgba(255,255,255,0.85)',
                  fontSize: 13,
                  lineHeight: 1.6,
                  maxWidth: '85%',
                }}>
                  {t('chatWelcome')}
                </div>
              )}

              {/* Message bubbles */}
              {messages.map((msg) => {
                const text = getMessageText(msg);
                if (!text) return null;
                return (
                  <div
                    key={msg.id}
                    style={{
                      display: 'flex',
                      justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    }}
                  >
                    <div style={{
                      background: msg.role === 'user'
                        ? 'rgba(0,120,255,0.3)'
                        : 'rgba(255,255,255,0.06)',
                      borderRadius: msg.role === 'user'
                        ? '16px 16px 4px 16px'
                        : '16px 16px 16px 4px',
                      padding: '10px 14px',
                      color: 'rgba(255,255,255,0.9)',
                      fontSize: 13,
                      lineHeight: 1.6,
                      maxWidth: '85%',
                      wordBreak: 'break-word',
                      whiteSpace: 'pre-wrap',
                    }}>
                      {msg.role === 'assistant' ? renderWithLinks(text) : text}
                    </div>
                  </div>
                );
              })}

              {/* Typing indicator */}
              {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <div style={{
                    background: 'rgba(255,255,255,0.06)',
                    borderRadius: '16px 16px 16px 4px',
                    padding: '12px 18px',
                    display: 'flex',
                    gap: 4,
                    alignItems: 'center',
                  }}>
                    <span className="chat-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.5)', display: 'inline-block' }} />
                    <span className="chat-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.5)', display: 'inline-block' }} />
                    <span className="chat-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.5)', display: 'inline-block' }} />
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div style={{
                  background: 'rgba(239,68,68,0.15)',
                  borderRadius: 12,
                  padding: '8px 12px',
                  color: '#EF4444',
                  fontSize: 12,
                  textAlign: 'center',
                }}>
                  {t('chatError')}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <form
              onSubmit={onSubmit}
              style={{
                padding: '12px 16px',
                borderTop: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                gap: 8,
                alignItems: 'center',
                flexShrink: 0,
              }}
            >
              <input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={t('chatPlaceholder')}
                disabled={isLoading}
                style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 12,
                  padding: '10px 14px',
                  color: '#fff',
                  fontSize: 13,
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  border: 'none',
                  background: inputValue.trim() ? '#3B82F6' : 'rgba(255,255,255,0.08)',
                  color: '#fff',
                  cursor: inputValue.trim() ? 'pointer' : 'default',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.2s',
                  flexShrink: 0,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </form>

            {/* Footer */}
            <div style={{
              padding: '6px 16px 10px',
              textAlign: 'center',
              color: 'rgba(255,255,255,0.25)',
              fontSize: 10,
              flexShrink: 0,
            }}>
              {t('chatPoweredBy')}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
