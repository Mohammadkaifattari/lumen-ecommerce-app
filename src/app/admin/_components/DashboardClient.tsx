"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight, ShoppingBag } from "lucide-react";
import {
  COLORS,
  fadeUp,
  staggerContainer,
  rowFade,
  PageHeader,
  StatCard,
  Card,
  SectionLabel,
  Badge,
  Table,
  TableRow,
  Td,
  EmptyState,
} from "../_components/AdminUI";

export interface DashboardData {
  totalUsers: number;
  totalOrders: number;
  totalProducts: number;
  revenue: number;
  avgOrder: number;
  recentOrders: Array<{
    _id: string;
    total: number;
    status: string;
    items?: Array<{ name: string }>;
  }>;
}

export function DashboardClient({ data }: { data: DashboardData }) {
  const { totalUsers, totalOrders, totalProducts, revenue, avgOrder, recentOrders } = data;

  return (
    <div style={{ maxWidth: 1100 }}>
      <PageHeader eyebrow="LUMEN Admin" title="Dashboard" subtitle="Store performance at a glance." />

      {/* Stat cards — staggered fade-up */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16, marginBottom: 24 }}
      >
        <StatCard label="Total Revenue" value={`$${revenue.toFixed(0)}`} sub="All time" accent />
        <StatCard label="Total Orders" value={totalOrders} sub="All time" />
        <StatCard label="Avg Order" value={`$${avgOrder.toFixed(0)}`} sub="Per order" />
        <StatCard label="Products" value={totalProducts} sub="In catalog" />
        <StatCard label="Users" value={totalUsers} sub="Registered" />
      </motion.div>

      {/* Recent orders */}
      <Card hover={false}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <SectionLabel eyebrow="Latest" title="Recent Orders" />
          <Link
            href="/admin/orders"
            style={{
              fontSize: "0.72rem",
              color: COLORS.accent,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              border: `1px solid ${COLORS.accentSoft}`,
              borderRadius: 6,
              padding: "0.3rem 0.75rem",
            }}
          >
            View All <ArrowUpRight style={{ width: 12, height: 12 }} />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag style={{ width: 32, height: 32 }} />}
            title="No orders yet"
            message="New orders will appear here."
          />
        ) : (
          <Table columns={["Order ID", "Items", "Total", "Status"]}>
            {recentOrders.map((order) => (
              <TableRow key={order._id}>
                <Td style={{ fontFamily: "monospace", color: COLORS.textMid, width: 120 }}>
                  #{order._id.toString().slice(-8).toUpperCase()}
                </Td>
                <Td style={{ color: COLORS.textMid }}>
                  {order.items?.slice(0, 2).map((i) => i.name).join(", ")}
                  {(order.items?.length ?? 0) > 2 ? ` +${order.items!.length - 2}` : ""}
                </Td>
                <Td style={{ color: COLORS.accent, fontWeight: 600, width: 100 }}>
                  ${order.total?.toFixed(0)}
                </Td>
                <Td style={{ width: 110 }}>
                  <Badge status={order.status} />
                </Td>
              </TableRow>
            ))}
          </Table>
        )}
      </Card>
    </div>
  );
}
