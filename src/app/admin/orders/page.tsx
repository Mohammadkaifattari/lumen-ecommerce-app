"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import {
  COLORS,
  fadeUp,
  staggerContainer,
  STATUS,
  PageHeader,
  Card,
  Select,
  Badge,
  EmptyState,
} from "../_components/AdminUI";

interface Order {
  _id: string;
  userId: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  status: string;
  createdAt: string;
}

/** The 4 real statuses from the Order model enum (no ghost `pending`). */
const STATUS_OPTIONS = ["Processing", "Shipped", "Delivered", "Cancelled"];

export default function AdminOrdersPage() {
  const { status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((data) => {
        setOrders(data.orders || []);
        setLoading(false);
      });
  }, []);

  async function updateStatus(id: string, newStatus: string) {
    await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setOrders((prev) => prev.map((o) => (o._id === id ? { ...o, status: newStatus } : o)));
  }

  if (loading) {
    return <div style={{ color: COLORS.textMid, padding: 24 }}>Loading…</div>;
  }

  return (
    <div>
      <PageHeader
        eyebrow="Fulfilment"
        title="Orders"
        subtitle={`${orders.length} ${orders.length === 1 ? "order" : "orders"} total`}
      />

      {orders.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag style={{ width: 32, height: 32 }} />}
          title="No orders yet"
          message="Incoming orders will appear here."
        />
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          style={{ display: "flex", flexDirection: "column", gap: 12 }}
        >
          {orders.map((order) => (
            <motion.div key={order._id} variants={fadeUp}>
              <Card hover={false}>
                {/* Top row: order id + date + total */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <span style={{ fontFamily: "monospace", fontSize: "0.78rem", color: COLORS.textMid }}>
                    #{order._id.slice(-8).toUpperCase()}
                  </span>
                  <span style={{ fontSize: "0.78rem", color: COLORS.textLow }}>
                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>

                {/* Line items */}
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
                  {order.items.map((item, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "0.85rem",
                      }}
                    >
                      <span>
                        {item.name} <span style={{ color: COLORS.textLow }}>× {item.quantity}</span>
                      </span>
                      <span style={{ color: COLORS.accent }}>
                        ${(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Bottom row: total + status select */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderTop: `1px solid ${COLORS.line}`,
                    paddingTop: 12,
                  }}
                >
                  <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>
                    Total <span style={{ color: COLORS.accent }}>${order.total.toLocaleString()}</span>
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <Badge status={order.status} />
                    <Select
                      value={order.status}
                      onChange={(v) => updateStatus(order._id, v)}
                      options={STATUS_OPTIONS}
                      colorMap={STATUS}
                    />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
