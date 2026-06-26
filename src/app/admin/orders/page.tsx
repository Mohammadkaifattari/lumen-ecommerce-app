"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import {
  COLORS,
  STATUS,
  PageHeader,
  Table,
  TableRow,
  Td,
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
        <Table columns={["Order ID", "Date", "Items", "Total", "Status", "Action"]}>
          {orders.map((order, index) => (
            <TableRow key={order._id} index={index}>
              <Td>
                <span style={{ fontFamily: "monospace", color: COLORS.text }}>
                  #{order._id.slice(-8).toUpperCase()}
                </span>
              </Td>
              <Td style={{ color: COLORS.textLow }}>
                {new Date(order.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </Td>
              <Td>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {order.items.map((item, i) => (
                    <div key={i} style={{ fontSize: "0.8rem", color: COLORS.textMid }}>
                      {item.quantity}x {item.name}
                    </div>
                  ))}
                </div>
              </Td>
              <Td style={{ fontWeight: 600, color: COLORS.accent }}>
                ${order.total.toLocaleString()}
              </Td>
              <Td>
                <Badge status={order.status} />
              </Td>
              <Td>
                <Select
                  value={order.status}
                  onChange={(v) => updateStatus(order._id, v)}
                  options={STATUS_OPTIONS}
                  colorMap={STATUS}
                />
              </Td>
            </TableRow>
          ))}
        </Table>
      )}
    </div>
  );
}

