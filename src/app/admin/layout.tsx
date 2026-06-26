"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  BarChart2,
  LogOut,
  MessageSquare,
  Bell,
  Menu,
  X,
  User,
  Settings
} from "lucide-react";
import { pusherClient } from "@/lib/pusherClient";
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
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
    setShowMobileMenu(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    document.body.classList.add("admin-page");
    return () => document.body.classList.remove("admin-page");
  }, []);

  useEffect(() => {
    if ((session?.user as any)?.role !== 'admin') return;
    const channel = pusherClient.subscribe('admin-channel');
    channel.bind('new-order', (data: any) => { addOrder(data); });
    channel.bind('chat-message', ({ roomId, message }: any) => {
      if (message.sender === 'user') { addChat({ roomId, message }); }
    });
    channel.bind('new-user', (data: any) => { addUser(data); });
    return () => { pusherClient.unsubscribe('admin-channel'); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const currentPage = NAV.find((n) => n.href === pathname)?.label || "Dashboard";

  const SidebarContent = () => (
    <>
      <div
        style={{
          height: "72px",
          display: "flex",
          alignItems: "center",
          padding: "0 24px",
          borderBottom: `1px solid ${COLORS.line}`,
        }}
      >
        <Link
          href="/admin"
          style={{
            fontSize: "18px",
            fontWeight: 800,
            letterSpacing: "-0.02em",
            textDecoration: "none",
            color: COLORS.text,
          }}
        >
          LUMEN <span style={{ color: COLORS.accent }}>ADMIN</span>
        </Link>
      </div>

      <nav style={{ flex: 1, padding: "24px 16px", display: "flex", flexDirection: "column", gap: 4, overflowY: "auto" }}>
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
                gap: 14,
                padding: "12px 16px",
                borderRadius: RADIUS.md,
                fontSize: "15px",
                fontWeight: 500,
                textDecoration: "none",
                color: active ? COLORS.text : COLORS.textLow,
                background: active ? `linear-gradient(90deg, ${COLORS.accent}11 0%, transparent 100%)` : "transparent",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.color = COLORS.text;
                  e.currentTarget.style.background = `rgba(255,255,255,0.02)`;
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.color = COLORS.textLow;
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              {active && (
                <motion.span
                  layoutId="admin-nav-active"
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 8,
                    bottom: 8,
                    width: 3,
                    borderRadius: "0 4px 4px 0",
                    background: COLORS.accent,
                  }}
                />
              )}
              <item.icon style={{ width: 18, height: 18, color: active ? COLORS.accent : "inherit" }} />
              {item.label}
              
              {item.badgeKey === "orders" && orderNotifs.length > 0 && (
                <span style={{ marginLeft: 'auto', background: COLORS.accent, color: '#0a0a0a', borderRadius: 999, padding: '2px 8px', fontSize: '0.7rem', fontWeight: 700 }}>{orderNotifs.length}</span>
              )}
              {item.badgeKey === "chat" && chatNotifs.length > 0 && (
                <span style={{ marginLeft: 'auto', background: '#60a5fa', color: '#0a0a0a', borderRadius: 999, padding: '2px 8px', fontSize: '0.7rem', fontWeight: 700 }}>{chatNotifs.length}</span>
              )}
              {item.badgeKey === "users" && userNotifs.length > 0 && (
                <span style={{ marginLeft: 'auto', background: '#a78bfa', color: '#0a0a0a', borderRadius: 999, padding: '2px 8px', fontSize: '0.7rem', fontWeight: 700 }}>{userNotifs.length}</span>
              )}
            </Link>
          );
        })}
      </nav>

      <div style={{ padding: "20px", borderTop: `1px solid ${COLORS.line}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: COLORS.accent, color: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
            {session?.user?.email?.charAt(0).toUpperCase() || "A"}
          </div>
          <div style={{ overflow: "hidden" }}>
            <div style={{ fontSize: "14px", fontWeight: 600, color: COLORS.text, whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
              {session?.user?.name || "Admin User"}
            </div>
            <div style={{ fontSize: "12px", color: COLORS.textLow, whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
              {session?.user?.email || "admin@lumen.com"}
            </div>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            width: "100%",
            padding: "10px",
            borderRadius: RADIUS.md,
            fontSize: "14px",
            fontWeight: 500,
            cursor: "pointer",
            backgroundColor: "rgba(255,80,80,0.1)",
            border: `1px solid ${COLORS.danger}33`,
            color: COLORS.danger,
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(255,80,80,0.2)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "rgba(255,80,80,0.1)"; }}
        >
          <LogOut style={{ width: 16, height: 16 }} /> Logout
        </button>
      </div>
    </>
  );

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
      {/* Desktop Sidebar */}
      {!isMobile && (
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
          <SidebarContent />
        </aside>
      )}

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobile && showMobileMenu && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileMenu(false)}
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 90,
                background: "rgba(0,0,0,0.6)",
                backdropFilter: "blur(4px)",
              }}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              style={{
                position: "fixed",
                left: 0,
                top: 0,
                bottom: 0,
                zIndex: 100,
                width: "280px",
                backgroundColor: COLORS.sidebar,
                borderRight: `1px solid ${COLORS.line}`,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <button
                onClick={() => setShowMobileMenu(false)}
                style={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  background: "transparent",
                  border: "none",
                  color: COLORS.text,
                  cursor: "pointer",
                }}
              >
                <X style={{ width: 24, height: 24 }} />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", marginLeft: isMobile ? 0 : "240px", width: "100%" }}>
        {/* Topbar */}
        <header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 30,
            height: "72px",
            backgroundColor: `${COLORS.bg}f2`,
            backdropFilter: "blur(12px)",
            borderBottom: `1px solid ${COLORS.line}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 24px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {isMobile && (
              <button
                onClick={() => setShowMobileMenu(true)}
                style={{ background: "transparent", border: "none", color: COLORS.text, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <Menu style={{ width: 24, height: 24 }} />
              </button>
            )}
            <h1 style={{ fontSize: "20px", fontWeight: 600, margin: 0, color: COLORS.text }}>{currentPage}</h1>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            {/* Notification Bell */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setShowNotif((p) => !p)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: COLORS.text,
                  cursor: "pointer",
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Bell style={{ width: 22, height: 22 }} />
                {totalNotifs > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: -4,
                      right: -4,
                      background: COLORS.danger,
                      color: "#fff",
                      borderRadius: "50%",
                      width: 16,
                      height: 16,
                      fontSize: "10px",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {totalNotifs}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotif && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      position: "absolute",
                      right: 0,
                      top: "140%",
                      width: 340,
                      background: COLORS.card,
                      border: `1px solid ${COLORS.line}`,
                      borderRadius: RADIUS.lg,
                      overflow: "hidden",
                      boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
                      maxHeight: 480,
                      overflowY: "auto",
                      zIndex: 50,
                    }}
                  >
                    {/* Header */}
                    <div style={{ padding: "16px 20px", borderBottom: `1px solid ${COLORS.line}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: COLORS.cardHover }}>
                      <span style={{ fontSize: "14px", fontWeight: 600 }}>Notifications</span>
                      <button onClick={() => { clearAll(); setShowNotif(false); }} style={{ background: "none", border: "none", color: COLORS.accent, cursor: "pointer", fontSize: "12px", fontWeight: 500 }}>Clear all</button>
                    </div>

                    {totalNotifs === 0 && (
                      <div style={{ padding: "40px 20px", textAlign: "center", color: COLORS.textMid, fontSize: "14px" }}>No new notifications</div>
                    )}

                    {/* Orders */}
                    {orderNotifs.length > 0 && (
                      <>
                        <div style={{ padding: "8px 20px", background: COLORS.bg, fontSize: "11px", fontWeight: 700, color: COLORS.textLow, textTransform: "uppercase", letterSpacing: "0.05em" }}>Orders</div>
                        {orderNotifs.map((n, i) => (
                          <Link key={i} href="/admin/orders" onClick={() => setShowNotif(false)} style={{ display: "block", padding: "14px 20px", borderBottom: `1px solid ${COLORS.line}`, textDecoration: "none" }}>
                            <div style={{ fontSize: "14px", fontWeight: 600, color: COLORS.text, marginBottom: 4 }}>New Order <span style={{ color: COLORS.accent }}>${n.total}</span></div>
                            <div style={{ fontSize: "12px", color: COLORS.textLow }}>ID: #{n.orderId?.toString().slice(-8).toUpperCase()}</div>
                          </Link>
                        ))}
                      </>
                    )}

                    {/* Chats */}
                    {chatNotifs.length > 0 && (
                      <>
                        <div style={{ padding: "8px 20px", background: COLORS.bg, fontSize: "11px", fontWeight: 700, color: COLORS.textLow, textTransform: "uppercase", letterSpacing: "0.05em" }}>Messages</div>
                        {chatNotifs.map((n, i) => (
                          <Link key={i} href="/admin/chat" onClick={() => setShowNotif(false)} style={{ display: "block", padding: "14px 20px", borderBottom: `1px solid ${COLORS.line}`, textDecoration: "none" }}>
                            <div style={{ fontSize: "14px", fontWeight: 600, color: COLORS.text, marginBottom: 4 }}>{n.roomId.includes('@') ? n.roomId.split('@')[0] : n.roomId}</div>
                            <div style={{ fontSize: "13px", color: COLORS.textMid, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.message?.text}</div>
                          </Link>
                        ))}
                      </>
                    )}

                    {/* Users */}
                    {userNotifs.length > 0 && (
                      <>
                        <div style={{ padding: "8px 20px", background: COLORS.bg, fontSize: "11px", fontWeight: 700, color: COLORS.textLow, textTransform: "uppercase", letterSpacing: "0.05em" }}>Users</div>
                        {userNotifs.map((n, i) => (
                          <Link key={i} href="/admin/users" onClick={() => setShowNotif(false)} style={{ display: "block", padding: "14px 20px", borderBottom: i < userNotifs.length - 1 ? `1px solid ${COLORS.line}` : 'none', textDecoration: "none" }}>
                            <div style={{ fontSize: "14px", fontWeight: 600, color: COLORS.text, marginBottom: 4 }}>{n.name}</div>
                            <div style={{ fontSize: "12px", color: COLORS.textLow }}>{n.email}</div>
                          </Link>
                        ))}
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Dropdown */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setShowProfileDropdown((p) => !p)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: COLORS.accent, color: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "14px" }}>
                  {session?.user?.email?.charAt(0).toUpperCase() || "A"}
                </div>
              </button>

              <AnimatePresence>
                {showProfileDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      position: "absolute",
                      right: 0,
                      top: "140%",
                      width: 220,
                      background: COLORS.card,
                      border: `1px solid ${COLORS.line}`,
                      borderRadius: RADIUS.lg,
                      overflow: "hidden",
                      boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
                      zIndex: 50,
                      padding: "8px",
                    }}
                  >
                    <div style={{ padding: "12px", borderBottom: `1px solid ${COLORS.line}`, marginBottom: "8px" }}>
                      <div style={{ fontSize: "14px", fontWeight: 600, color: COLORS.text }}>{session?.user?.name || "Admin"}</div>
                      <div style={{ fontSize: "12px", color: COLORS.textLow }}>{session?.user?.email}</div>
                    </div>
                    <button
                      onClick={() => {}}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        background: "transparent",
                        border: "none",
                        color: COLORS.text,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        fontSize: "14px",
                        borderRadius: RADIUS.md,
                        textAlign: "left",
                        transition: "background 0.2s",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = COLORS.cardHover; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                    >
                      <User style={{ width: 16, height: 16 }} /> Profile
                    </button>
                    <button
                      onClick={() => {}}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        background: "transparent",
                        border: "none",
                        color: COLORS.text,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        fontSize: "14px",
                        borderRadius: RADIUS.md,
                        textAlign: "left",
                        transition: "background 0.2s",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = COLORS.cardHover; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                    >
                      <Settings style={{ width: 16, height: 16 }} /> Settings
                    </button>
                    <button
                      onClick={() => signOut({ callbackUrl: "/login" })}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        background: "transparent",
                        border: "none",
                        color: COLORS.danger,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        fontSize: "14px",
                        borderRadius: RADIUS.md,
                        textAlign: "left",
                        marginTop: "4px",
                        transition: "background 0.2s",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,80,80,0.1)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                    >
                      <LogOut style={{ width: 16, height: 16 }} /> Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main style={{ flex: 1, padding: isMobile ? "20px 16px" : "32px 40px", minWidth: 0, position: "relative", overflowX: "hidden" }}>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}