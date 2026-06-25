'use client';

import { useEffect, useRef, useState } from 'react';
import { pusherClient } from '@/lib/pusherClient';
import { MessageCircle, X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'admin';
  time: string;
}

export default function LiveChat() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [online, setOnline] = useState(false);
  
  const bottomRef = useRef<HTMLDivElement>(null);
  const roomId = session?.user?.email ?? 'guest';

  useEffect(() => {
    fetch(`/api/chat/${encodeURIComponent(roomId)}`)
      .then(r => r.json())
      .then(data => setMessages(data.map((m: any) => ({ id: m._id, text: m.text, sender: m.sender, time: m.time }))));
  }, [roomId]);

  useEffect(() => {
    setOnline(true);
    const channel = pusherClient.subscribe(`chat-${roomId}`);
    channel.bind('chat-message', ({ message }: { roomId: string; message: Message }) => {
      setMessages(prev => [...prev, message]);
    });
    return () => { pusherClient.unsubscribe(`chat-${roomId}`); setOnline(false); };
  }, [roomId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = () => {
    if (!input.trim()) return;
    const msg: Message = {
      id: Date.now().toString(),
      text: input.trim(),
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, msg]);
    setInput('');
    fetch(`/api/chat/${encodeURIComponent(roomId)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: msg.text, sender: msg.sender, time: msg.time }),
    });
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setOpen(p => !p)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          zIndex: 999,
          width: 52,
          height: 52,
          borderRadius: '50%',
          background: '#d4ff3f',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 24px rgba(212,255,63,0.3)',
        }}
      >
        {open
          ? <X style={{ width: 20, height: 20, color: '#0a0a0a' }} />
          : <MessageCircle style={{ width: 20, height: 20, color: '#0a0a0a' }} />
        }
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'fixed',
              bottom: '5.5rem',
              right: '2rem',
              zIndex: 998,
              width: 340,
              height: 460,
              background: '#111',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 16,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '14px 16px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: '#0f0f0f',
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: online ? '#22c55e' : '#555',
              }} />
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fafafa' }}>LUMEN Support</div>
                <div style={{ fontSize: '0.68rem', color: '#555' }}>{online ? 'Online' : 'Offline'}</div>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {messages.length === 0 && (
                <div style={{ textAlign: 'center', color: '#444', fontSize: '0.78rem', marginTop: '2rem' }}>
                  Ask us anything — we are here to help.
                </div>
              )}
              {messages.map(msg => (
                <div key={msg.id} style={{
                  display: 'flex',
                  justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                }}>
                  <div style={{
                    maxWidth: '75%',
                    padding: '8px 12px',
                    borderRadius: msg.sender === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                    background: msg.sender === 'user' ? '#d4ff3f' : '#1e1e1e',
                    color: msg.sender === 'user' ? '#0a0a0a' : '#fafafa',
                    fontSize: '0.82rem',
                    lineHeight: 1.45,
                  }}>
                    <div>{msg.text}</div>
                    <div style={{ fontSize: '0.6rem', opacity: 0.5, marginTop: 3, textAlign: 'right' }}>{msg.time}</div>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div style={{
              padding: '10px 12px',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              display: 'flex',
              gap: 8,
              background: '#0f0f0f',
            }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send()}
                placeholder="Message..."
                style={{
                  flex: 1,
                  background: '#1a1a1a',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 10,
                  padding: '8px 12px',
                  color: '#fafafa',
                  fontSize: '0.82rem',
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
              />
              <button
                onClick={send}
                style={{
                  width: 36, height: 36,
                  borderRadius: 10,
                  background: '#d4ff3f',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Send style={{ width: 15, height: 15, color: '#0a0a0a' }} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}