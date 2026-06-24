'use client';

import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { io as socketIO } from 'socket.io-client';
import { Send } from 'lucide-react';
import { COLORS, RADIUS, PageHeader } from '../_components/AdminUI';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'admin';
  time: string;
}

interface ChatRoom {
  roomId: string;
  messages: Message[];
  unread: number;
}

export default function AdminChatPage() {
  const { data: session } = useSession();
  const [rooms, setRooms] = useState<Record<string, ChatRoom>>({});
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const socketRef = useRef<any>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/chat')
      .then(r => r.json())
      .then((data: { roomId: string; messages: Message[] }[]) => {
        const initial: Record<string, ChatRoom> = {};
        data.forEach(room => {
          initial[room.roomId] = { roomId: room.roomId, messages: room.messages, unread: 0 };
        });
        setRooms(initial);
      });
  }, []);

  useEffect(() => {
    const socket = socketIO();
    socketRef.current = socket;
    socket.emit('join-admin');

    socket.on('chat-message', ({ roomId, message }: { roomId: string; message: Message }) => {
      setRooms(prev => {
        const room = prev[roomId] ?? { roomId, messages: [], unread: 0 };
        return {
          ...prev,
          [roomId]: {
            ...room,
            messages: [...room.messages, message],
            unread: activeRoom === roomId ? 0 : room.unread + 1,
          },
        };
      });
    });

    return () => { socket.disconnect(); };
  }, []);

  useEffect(() => {
    if (!activeRoom) return;
    fetch(`/api/chat/${encodeURIComponent(activeRoom)}`)
      .then(r => r.json())
      .then(data => {
        const msgs = data.map((m: any) => ({ id: m._id, text: m.text, sender: m.sender, time: m.time }));
        setRooms(prev => ({
          ...prev,
          [activeRoom]: { ...prev[activeRoom] ?? { roomId: activeRoom, unread: 0 }, messages: msgs },
        }));
      });
  }, [activeRoom]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [rooms, activeRoom]);

  const send = () => {
    if (!input.trim() || !activeRoom) return;
    const msg: Message = {
      id: Date.now().toString(),
      text: input.trim(),
      sender: 'admin',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    socketRef.current?.emit('chat-message', { roomId: activeRoom, message: msg });
    setRooms(prev => ({
      ...prev,
      [activeRoom]: {
        ...prev[activeRoom],
        messages: [...(prev[activeRoom]?.messages ?? []), msg],
      },
    }));
    setInput('');
    fetch(`/api/chat/${encodeURIComponent(activeRoom)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: msg.text, sender: msg.sender, time: msg.time }),
    });
  };

  const roomList = Object.values(rooms);
  const activeMessages = activeRoom ? rooms[activeRoom]?.messages ?? [] : [];

  return (
    <div>
      <PageHeader title="Live Chat" subtitle="Customer conversations" />

      <div style={{
        display: 'flex',
        height: 'calc(100vh - 180px)',
        background: '#111',
        border: `1px solid ${COLORS.line}`,
        borderRadius: RADIUS.lg,
        overflow: 'hidden',
      }}>
        {/* Rooms List */}
        <div style={{
          width: 260,
          borderRight: `1px solid ${COLORS.line}`,
          overflowY: 'auto',
          background: '#0f0f0f',
        }}>
          <div style={{ padding: '14px 16px', borderBottom: `1px solid ${COLORS.line}`, fontSize: '0.75rem', fontWeight: 600, color: COLORS.textMid, letterSpacing: '0.05em' }}>
            CONVERSATIONS
          </div>
          {roomList.length === 0 && (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: COLORS.textMid, fontSize: '0.78rem' }}>
              No messages yet
            </div>
          )}
          {roomList.map(room => (
            <div
              key={room.roomId}
              onClick={() => {
                setActiveRoom(room.roomId);
                setRooms(prev => ({ ...prev, [room.roomId]: { ...prev[room.roomId], unread: 0 } }));
              }}
              style={{
                padding: '12px 16px',
                cursor: 'pointer',
                borderBottom: `1px solid ${COLORS.line}`,
                background: activeRoom === room.roomId ? 'rgba(212,255,63,0.06)' : 'transparent',
                borderLeft: activeRoom === room.roomId ? `3px solid ${COLORS.accent}` : '3px solid transparent',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.text, marginBottom: 2 }}>
                  {room.roomId.includes('@') ? room.roomId.split('@')[0] : room.roomId}
                </div>
                <div style={{ fontSize: '0.7rem', color: COLORS.textMid, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>
                  {room.messages[room.messages.length - 1]?.text ?? '...'}
                </div>
              </div>
              {room.unread > 0 && (
                <span style={{
                  background: COLORS.accent,
                  color: '#0a0a0a',
                  borderRadius: '50%',
                  width: 18,
                  height: 18,
                  fontSize: '0.62rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {room.unread}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Chat Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {!activeRoom ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.textMid, fontSize: '0.82rem' }}>
              Select a conversation to start chatting
            </div>
          ) : (
            <>
              {/* Header */}
              <div style={{ padding: '14px 20px', borderBottom: `1px solid ${COLORS.line}`, background: '#0f0f0f', fontSize: '0.85rem', fontWeight: 600, color: COLORS.text }}>
                {activeRoom}
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {activeMessages.map(msg => (
                  <div key={msg.id} style={{ display: 'flex', justifyContent: msg.sender === 'admin' ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      maxWidth: '65%',
                      padding: '8px 14px',
                      borderRadius: msg.sender === 'admin' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                      background: msg.sender === 'admin' ? COLORS.accent : '#1e1e1e',
                      color: msg.sender === 'admin' ? '#0a0a0a' : COLORS.text,
                      fontSize: '0.82rem',
                      lineHeight: 1.5,
                    }}>
                      <div>{msg.text}</div>
                      <div style={{ fontSize: '0.6rem', opacity: 0.5, marginTop: 3, textAlign: 'right' }}>{msg.time}</div>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div style={{ padding: '12px 16px', borderTop: `1px solid ${COLORS.line}`, background: '#0f0f0f', display: 'flex', gap: 8 }}>
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && send()}
                  placeholder="Reply..."
                  style={{
                    flex: 1,
                    background: '#1a1a1a',
                    border: `1px solid ${COLORS.line}`,
                    borderRadius: RADIUS.md,
                    padding: '8px 14px',
                    color: COLORS.text,
                    fontSize: '0.82rem',
                    outline: 'none',
                    fontFamily: 'inherit',
                  }}
                />
                <button
                  onClick={send}
                  style={{
                    width: 38, height: 38,
                    borderRadius: RADIUS.md,
                    background: COLORS.accent,
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}