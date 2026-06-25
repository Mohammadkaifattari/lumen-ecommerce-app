"use client";

import { useState, useEffect, useRef } from "react";
import { pusherClient } from "@/lib/pusherClient";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package, Heart, User as UserIcon, ChevronDown, LogOut, MapPin, CheckCircle2, Truck, Clock,
} from "lucide-react";
import { MOCK_ORDERS, getAllProducts } from "@/lib/data";
import { useWishlist } from "@/store/wishlist";
import { ProductCard } from "@/components/product/ProductCard";
import { cn, formatPrice } from "@/lib/utils";
import type { Order } from "@/types";

type Tab = "orders" | "wishlist" | "profile";

const STATUS_META: Record<Order["status"], { icon: React.ComponentType<{ className?: string }>; color: string }> = {
  Processing: { icon: Clock, color: "text-amber-500" },
  Shipped: { icon: Truck, color: "text-blue-500" },
  Delivered: { icon: CheckCircle2, color: "text-green-500" },
  Cancelled: { icon: Clock, color: "text-ink-muted" },
};

export default function AccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("orders");
  const [orders, setOrders] = useState<any[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const wishlistIds = useWishlist((s) => s.ids);

  useEffect(() => {
    setMounted(true);
    fetch("/api/orders")
      .then((r) => r.json())
      .then((data) => {
        setOrders(data.orders ?? []);
        setExpanded(data.orders?.[0]?._id ?? null);
      });

    const channel = pusherClient.subscribe('orders-channel');
    channel.bind('order-status-updated', (data: { orderId: string; status: string }) => {
      setOrders((prev) =>
        prev.map((o) => o._id === data.orderId ? { ...o, status: data.status } : o)
      );
    });
    return () => { pusherClient.unsubscribe('orders-channel'); };
  }, []);
  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  if (status === "loading" || status === "unauthenticated") return null;

  const wishlistProducts = mounted
    ? getAllProducts().filter((p) => wishlistIds.includes(p.id))
    : [];

  const tabs = [
    { id: "orders" as const, label: "Orders", icon: Package },
    { id: "wishlist" as const, label: "Wishlist", icon: Heart, count: wishlistProducts.length },
    { id: "profile" as const, label: "Profile", icon: UserIcon },
  ];

  return (
    <div className="container-edge py-12 pt-28 lg:py-16 lg:pt-32">
      {/* Header */}
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow mb-3">Account</p>
          <h1 className="text-display-lg font-bold tracking-tight">
            Welcome, {session?.user?.name?.split(" ")[0] ?? "there"}.
          </h1>
          <p className="mt-2 text-ink-muted dark:text-paper/60">{session?.user?.email}</p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-2 text-sm text-ink-muted hover:text-ink dark:text-paper/60 dark:hover:text-paper"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>

      <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
        {/* Sidebar tabs */}
        <aside>
          <nav className="flex gap-2 lg:flex-col">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                  tab === t.id
                    ? "bg-ink text-paper dark:bg-paper dark:text-ink"
                    : "hover:bg-ink/5 dark:hover:bg-paper/5"
                )}
              >
                <t.icon className="h-4 w-4" />
                {t.label}
                {t.count !== undefined && t.count > 0 && (
                  <span className="ml-auto rounded-full bg-accent px-2 text-xs font-bold text-ink">
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <div className="min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
            >
              {tab === "orders" && (
                <OrdersTab orders={orders} expanded={expanded} setExpanded={setExpanded} />
              )}

              {tab === "wishlist" && (
                <WishlistTab products={wishlistProducts} mounted={mounted} />
              )}

              {tab === "profile" && <ProfileTab session={session} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function OrdersTab({
  orders,
  expanded,
  setExpanded,
}: {
  orders: (Order & { _id: string })[];
  expanded: string | null;
  setExpanded: (id: string | null) => void;
}) {
  return (
    <div className="space-y-4">
      <h2 className="mb-2 text-2xl font-semibold">Order history</h2>
      {orders.map((order) => {
        const StatusIcon = STATUS_META[order.status].icon;
        const isOpen = expanded === order._id;
        return (
          <div
            key={order._id}
            className="overflow-hidden rounded-2xl border border-ink/10 dark:border-paper/10"
          >
            {/* Row */}
            <button
              onClick={() => setExpanded(isOpen ? null : order._id)}
              className="flex w-full items-center justify-between gap-4 p-5 text-left transition-colors hover:bg-ink/[0.02] dark:hover:bg-paper/[0.02]"
            >
              <div className="flex items-center gap-4">
                <div className="hidden flex-col items-center sm:flex">
                  <StatusIcon className={cn("h-5 w-5", STATUS_META[order.status].color)} />
                </div>
                <div>
                  <p className="font-medium">#{order._id.toString().slice(-8).toUpperCase()}</p>
                  <p className="text-sm text-ink-muted dark:text-paper/60">
                    Placed {new Date(order.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} · {order.items.length} item{order.items.length > 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={cn("hidden text-sm font-medium sm:inline", STATUS_META[order.status].color)}>
                  {order.status}
                </span>
                <span className="font-medium">{formatPrice(order.total)}</span>
                <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
                  <ChevronDown className="h-4 w-4" />
                </motion.span>
              </div>
            </button>

            {/* Expanded detail */}
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="border-t border-ink/10 dark:border-paper/10"
                >
                  <div className="p-5">
                    {/* Tracking timeline */}
                    <div className="mb-6 flex items-center gap-2">
                      {["Processing", "Shipped", "Delivered"].map((s, i) => {
                        const orderIdx = ["Processing", "Shipped", "Delivered"].indexOf(order.status);
                        const reached = i <= orderIdx;
                        return (
                          <div key={s} className="flex flex-1 items-center gap-2">
                            <div className={cn("flex h-7 w-7 flex-none items-center justify-center rounded-full border-2 text-[10px] font-bold", reached ? "border-accent bg-accent text-ink" : "border-ink/20 text-ink-muted dark:border-paper/20 dark:text-paper/50")}>
                              {i + 1}
                            </div>
                            <span className={cn("hidden text-xs sm:block", reached ? "font-medium" : "text-ink-muted dark:text-paper/50")}>{s}</span>
                            {i < 2 && <div className={cn("h-px flex-1", i < orderIdx ? "bg-accent" : "bg-ink/10 dark:bg-paper/10")} />}
                          </div>
                        );
                      })}
                    </div>

                    <div className="grid gap-6 sm:grid-cols-[1fr_auto]">
                      {/* Items */}
                      <div className="space-y-3">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex gap-3">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={item.image} alt={item.name} className="h-16 w-16 flex-none rounded-lg object-cover" />
                            <div className="flex-1 text-sm">
                              <Link href={`/product/${item.slug}`} className="font-medium hover:underline">{item.name}</Link>
                              <p className="text-xs text-ink-muted dark:text-paper/60">
                                {item.color} · Size {item.size} · Qty {item.quantity}
                              </p>
                            </div>
                            <span className="text-sm font-medium">{formatPrice(item.price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>

                      {/* Shipping address */}
                      <div className="rounded-xl bg-ink/5 p-4 text-sm dark:bg-paper/5 sm:w-56">
                        <p className="mb-2 flex items-center gap-2 font-medium">
                          <MapPin className="h-4 w-4" /> Shipping
                        </p>
                        <p className="text-ink-muted dark:text-paper/60">
                          {order.shippingAddress.fullName}<br />
                          {order.shippingAddress.line1}<br />
                          {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}<br />
                          {order.shippingAddress.country}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

function WishlistTab({
  products,
  mounted,
}: {
  products: ReturnType<typeof getAllProducts>;
  mounted: boolean;
}) {
  if (!mounted) return <div className="h-64" />;
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-ink/15 py-20 text-center dark:border-paper/15">
        <Heart className="h-12 w-12 text-ink-muted dark:text-paper/40" />
        <div>
          <p className="text-lg font-medium">Your wishlist is empty</p>
          <p className="text-sm text-ink-muted dark:text-paper/60">Tap the heart on any product to save it here.</p>
        </div>
        <Link href="/shop" className="btn-primary mt-2">Browse products</Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-6 text-2xl font-semibold">Saved items ({products.length})</h2>
      <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-3">
        {products.map((p, i) => (
          <ProductCard key={p.id} product={p} index={i} />
        ))}
      </div>
    </div>
  );
}

function ProfileTab({ session }: { session: any }) {
  const [firstName, ...lastParts] = (session?.user?.name ?? "").split(" ");
  const lastName = lastParts.join(" ");

  return (
    <div className="max-w-lg">
      <h2 className="mb-6 text-2xl font-semibold">Profile details</h2>
      <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
        <ProfileField label="First name" defaultValue={firstName || ""} />
        <ProfileField label="Last name" defaultValue={lastName || ""} />
        <ProfileField label="Email" defaultValue={session?.user?.email ?? ""} type="email" />
        <ProfileField label="Phone" defaultValue="" />

        <div className="rounded-xl border border-ink/10 p-5 dark:border-paper/10">
          <p className="mb-2 flex items-center gap-2 font-medium">
            <MapPin className="h-4 w-4" /> Default address
          </p>
          <p className="text-sm text-ink-muted dark:text-paper/60">
            418 Pine Street, Apt 7B<br />Brooklyn, NY 11215<br />United States
          </p>
        </div>

        <button type="submit" className="btn-primary">Save changes</button>
      </form>
    </div>
  );
}

function ProfileField({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs uppercase tracking-wider text-ink-muted dark:text-paper/50">{label}</span>
      <input
        {...props}
        className="w-full rounded-xl border border-ink/15 bg-transparent px-4 py-3 text-sm outline-none transition-colors focus:border-ink dark:border-paper/20 dark:focus:border-paper"
      />
    </label>
  );
}
