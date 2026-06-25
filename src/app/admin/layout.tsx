"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  BarChart2,
  LogOut,
  MessageSquare,
  Bell,
} from "lucide-react";
import { io as socketIO } from "socket.io-client";
import { COLORS, RADIUS } from "./_components/AdminUI";
import { useNotificationStore } from "@/store/notificationStore";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, badgeKey: null },
  { href: "/admin/products", label: "Products", icon: Package, badgeKey: null },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag, badgeKey: "orders" },
  { href: "/admin/users", label: "Users", icon: Users, badgeKey: "users" },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart2, badgeKey: null },
  { href: "/admin/chat", label: "Live Chat", icon: MessageSquare, badgeKey: "chat" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { orderNotifs, chatNotifs, userNotifs, addOrder, addChat, addUser, clearOrders, clearChat, clearUsers } = useNotificationStore();
  const [showNotif, setShowNotif] = useState(false);
  const socketRef = useRef<any>(null);

  const totalNotifs = orderNotifs.length + chatNotifs.length + userNotifs.length;

  function clearAll() {
    clearOrders();
    clearChat();
    clearUsers();
  }

  useEffect(() => {
    if (pathname === '/admin/orders') clearOrders();
    else if (pathname === '/admin/chat') clearChat();
    else if (pathname === '/admin/users') clearUsers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    document.body.classList.add("admin-page");
    return () => document.body.classList.remove("admin-page");
  }, []);

  useEffect(() => {
    if ((session?.user as any)?.role !== 'admin') return;
    const socket = socketIO();
    socketRef.current = socket;
    socket.emit('join-admin');
    socket.on('new-order', (data: any) => { addOrder(data); });
    socket.on('chat-message', ({ roomId, message }: any) => {
      if (message.sender === 'user') { addChat({ roomId, message }); }
    });
    socket.on('new-user', (data: any) => { addUser(data); });
    return () => { socket.disconnect(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: COLORS.bg,
        color: COLORS.text,
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          zIndex: 40,
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          width: "240px",
          backgroundColor: COLORS.sidebar,
          borderRight: `1px solid ${COLORS.line}`,
        }}
      >
        {/* Logo + Bell */}
        <div
          style={{
            height: "64px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 16px 0 24px",
            borderBottom: `1px solid ${COLORS.line}`,
          }}
        >
          <Link
            href="/admin"
            style={{
              fontSize: "18px",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              textDecoration: "none",
              color: COLORS.text,
            }}
          >
            LUMEN <span style={{ color: COLORS.accent }}>Admin</span>
          </Link>

          {/* Bell */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowNotif(p => !p)}
              style={{
                position: 'relative',
                background: '#111',
                border: `1px solid ${COLORS.line}`,
                borderRadius: RADIUS.md,
                padding: '8px',
                cursor: 'pointer',
                color: COLORS.text,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Bell style={{ width: 18, height: 18 }} />
              {totalNotifs > 0 && (
                <span style={{
                  position: 'absolute',
                  top: -6,
                  right: -6,
                  background: COLORS.accent,
                  color: '#0a0a0a',
                  borderRadius: '50%',
                  width: 18,
                  height: 18,
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {totalNotifs}
                </span>
              )}
            </button>

            {showNotif && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '110%',
                  width: 320,
                  background: '#111',
                  border: `1px solid ${COLORS.line}`,
                  borderRadius: RADIUS.md,
                  overflow: 'hidden',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                  maxHeight: 480,
                  overflowY: 'auto',
                  zIndex: 50,
                }}
              >
                {/* Header */}
                <div style={{ padding: '12px 16px', borderBottom: `1px solid ${COLORS.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Notifications</span>
                  <button onClick={() => { clearAll(); setShowNotif(false); }} style={{ background: 'none', border: 'none', color: COLORS.textMid, cursor: 'pointer', fontSize: '0.72rem' }}>Clear all</button>
                </div>

                {totalNotifs === 0 && (
                  <div style={{ padding: '2rem', textAlign: 'center', color: COLORS.textMid, fontSize: '0.78rem' }}>Koi notification nahi</div>
                )}

                {/* Orders */}
                {orderNotifs.length > 0 && (
                  <>
                    <div style={{ padding: '8px 16px', background: '#0f0f0f', fontSize: '0.68rem', fontWeight: 700, color: COLORS.textMid, letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 6 }}>
                      🛒 ORDERS ({orderNotifs.length})
                    </div>
                    {orderNotifs.map((n, i) => (
                      <Link key={i} href="/admin/orders" onClick={() => setShowNotif(false)} style={{ display: 'block', padding: '10px 16px', borderBottom: `1px solid ${COLORS.line}`, textDecoration: 'none' }}>
                        <div style={{ fontSize: '0.78rem', fontWeight: 600, color: COLORS.accent }}>${n.total} order received</div>
                        <div style={{ fontSize: '0.7rem', color: COLORS.textMid }}>#{n.orderId?.toString().slice(-8).toUpperCase()}</div>
                      </Link>
                    ))}
                  </>
                )}

                {/* Chats */}
                {chatNotifs.length > 0 && (
                  <>
                    <div style={{ padding: '8px 16px', background: '#0f0f0f', fontSize: '0.68rem', fontWeight: 700, color: COLORS.textMid, letterSpacing: '0.05em' }}>
                      💬 CHAT ({chatNotifs.length})
                    </div>
                    {chatNotifs.map((n, i) => (
                      <Link key={i} href="/admin/chat" onClick={() => setShowNotif(false)} style={{ display: 'block', padding: '10px 16px', borderBottom: `1px solid ${COLORS.line}`, textDecoration: 'none' }}>
                        <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#60a5fa' }}>{n.roomId.includes('@') ? n.roomId.split('@')[0] : n.roomId}</div>
                        <div style={{ fontSize: '0.7rem', color: COLORS.textMid, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 260 }}>{n.message?.text}</div>
                      </Link>
                    ))}
                  </>
                )}

                {/* Users */}
                {userNotifs.length > 0 && (
                  <>
                    <div style={{ padding: '8px 16px', background: '#0f0f0f', fontSize: '0.68rem', fontWeight: 700, color: COLORS.textMid, letterSpacing: '0.05em' }}>
                      👤 NEW USERS ({userNotifs.length})
                    </div>
                    {userNotifs.map((n, i) => (
                      <Link key={i} href="/admin/users" onClick={() => setShowNotif(false)} style={{ display: 'block', padding: '10px 16px', borderBottom: i < userNotifs.length - 1 ? `1px solid ${COLORS.line}` : 'none', textDecoration: 'none' }}>
                        <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#a78bfa' }}>{n.name}</div>
                        <div style={{ fontSize: '0.7rem', color: COLORS.textMid }}>{n.email}</div>
                      </Link>
                    ))}
                  </>
                )}
              </motion.div>
            )}
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 14px",
                  borderRadius: RADIUS.md,
                  fontSize: "14px",
                  fontWeight: 500,
                  textDecoration: "none",
                  color: active ? "#0a0a0a" : "rgba(255,255,255,0.6)",
                  background: active ? COLORS.accent : "transparent",
                  transition: "color 0.2s ease, background 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                    e.currentTarget.style.color = COLORS.text;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "rgba(255,255,255,0.6)";
                  }
                }}
              >
                {active && (
                  <motion.span
                    layoutId="admin-nav-active"
                    style={{
                      position: "absolute",
                      left: -12,
                      top: 8,
                      bottom: 8,
                      width: 3,
                      borderRadius: 3,
                      background: COLORS.accent,
                    }}
                  />
                )}
                <item.icon style={{ width: 16, height: 16 }} />
                {item.label}
                {item.badgeKey === "orders" && orderNotifs.length > 0 && (
                  <span style={{ marginLeft: 'auto', background: '#d4ff3f', color: '#0a0a0a', borderRadius: 999, padding: '1px 7px', fontSize: '0.65rem', fontWeight: 700 }}>{orderNotifs.length}</span>
                )}
                {item.badgeKey === "chat" && chatNotifs.length > 0 && (
                  <span style={{ marginLeft: 'auto', background: '#60a5fa', color: '#0a0a0a', borderRadius: 999, padding: '1px 7px', fontSize: '0.65rem', fontWeight: 700 }}>{chatNotifs.length}</span>
                )}
                {item.badgeKey === "users" && userNotifs.length > 0 && (
                  <span style={{ marginLeft: 'auto', background: '#a78bfa', color: '#0a0a0a', borderRadius: 999, padding: '1px 7px', fontSize: '0.65rem', fontWeight: 700 }}>{userNotifs.length}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User + signout */}
        <div style={{ borderTop: `1px solid ${COLORS.line}`, padding: 16 }}>
          <p
            style={{
              fontSize: "12px",
              color: "rgba(255,255,255,0.4)",
              marginBottom: 8,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {session?.user?.email ?? "—"}
          </p>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              width: "100%",
              padding: "8px 12px",
              borderRadius: RADIUS.md,
              fontSize: "14px",
              fontWeight: 500,
              cursor: "pointer",
              backgroundColor: "transparent",
              border: "none",
              color: "rgba(255,255,255,0.5)",
              transition: "color 0.2s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = COLORS.text)}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}
          >
            <LogOut style={{ width: 16, height: 16 }} /> Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ marginLeft: "240px", flex: 1, padding: "32px 40px", minWidth: 0, position: "relative" }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}