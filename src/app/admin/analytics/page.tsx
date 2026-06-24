"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  COLORS,
  fadeUp,
  staggerContainer,
  rowFade,
  PageHeader,
  Card,
  SectionLabel,
  StatCard,
} from "../_components/AdminUI";

interface AnalyticsData {
  revenueByMonth: { month: string; revenue: number }[];
  topProducts: { name: string; sold: number; revenue: number }[];
  totalRevenue: number;
  totalOrders: number;
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: COLORS.bg,
        border: `1px solid ${COLORS.lineStrong}`,
        borderRadius: 8,
        padding: "0.6rem 0.9rem",
        fontSize: "0.8rem",
      }}
    >
      <div style={{ color: COLORS.textLow, marginBottom: 4 }}>{label}</div>
      <div style={{ color: COLORS.accent, fontWeight: 700 }}>${payload[0].value.toLocaleString()}</div>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div style={{ color: COLORS.textMid, padding: 24 }}>Loading…</div>;
  }
  if (!data) {
    return <div style={{ color: COLORS.textMid, padding: 24 }}>Unable to load analytics.</div>;
  }

  const avgOrder = data.totalOrders > 0 ? Math.round(data.totalRevenue / data.totalOrders) : 0;
  const top = data.topProducts[0];

  return (
    <div>
      <PageHeader eyebrow="Insights" title="Analytics Overview" subtitle="Revenue, demand, and leaderboard trends." />

      {/* Stat cards */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}
      >
        <StatCard label="Total Revenue" value={`$${data.totalRevenue.toLocaleString()}`} accent />
        <StatCard label="Total Orders" value={data.totalOrders} />
        <StatCard label="Avg Order Value" value={`$${avgOrder}`} />
        <StatCard label="Top Product" value={top?.name ?? "—"} sub={top ? `${top.sold} sold` : undefined} />
      </motion.div>

      {/* Chart + breakdown */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16, marginBottom: 24 }}
      >
        {/* Revenue area chart */}
        <motion.div variants={fadeUp}>
          <Card hover={false} style={{ height: "100%" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <SectionLabel eyebrow="Revenue" title="Monthly Trend" />
              <span
                style={{
                  fontSize: "0.7rem",
                  color: COLORS.textLow,
                  border: `1px solid ${COLORS.line}`,
                  borderRadius: 6,
                  padding: "0.3rem 0.75rem",
                }}
              >
                Monthly
              </span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={data.revenueByMonth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.accent} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={COLORS.accent} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: COLORS.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: COLORS.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ stroke: `${COLORS.accent}22`, strokeWidth: 1 }} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke={COLORS.accent}
                  strokeWidth={2}
                  fill="url(#revenueGrad)"
                  dot={false}
                  activeDot={{ r: 4, fill: COLORS.accent, stroke: COLORS.bg, strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        {/* Revenue by product */}
        <motion.div variants={fadeUp}>
          <Card hover={false} style={{ height: "100%" }}>
            <SectionLabel eyebrow="Breakdown" title="By Product" />
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {data.topProducts.slice(0, 4).map((p, i) => {
                const barColors = [COLORS.accent, "#4ade80", "#60a5fa", "#a78bfa"];
                const pct = data.totalRevenue > 0 ? Math.round((p.revenue / data.totalRevenue) * 100) : 0;
                return (
                  <div key={i}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: "0.78rem" }}>
                      <span style={{ color: COLORS.textMid }}>{p.name}</span>
                      <span style={{ color: barColors[i], fontWeight: 600 }}>{pct}%</span>
                    </div>
                    <div style={{ height: 4, background: "#1e1e1e", borderRadius: 4, overflow: "hidden" }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        style={{ height: "100%", background: barColors[i] }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 24, paddingTop: 16, borderTop: `1px solid ${COLORS.line}` }}>
              <div style={{ fontSize: "0.65rem", color: COLORS.muted, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                Total
              </div>
              <div style={{ fontSize: "1.4rem", fontWeight: 800, color: COLORS.accent }}>
                ${data.totalRevenue.toLocaleString()}
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>

      {/* Top products leaderboard */}
      <Card hover={false}>
        <SectionLabel eyebrow="Leaderboard" title="Top Products" />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2rem 1fr 100px 100px 1fr",
            gap: 16,
            padding: "0.5rem 0",
            borderBottom: `1px solid ${COLORS.line}`,
            marginBottom: 8,
          }}
        >
          {["#", "Product", "Sold", "Revenue", "Share"].map((h, i) => (
            <div
              key={i}
              style={{
                fontSize: "0.65rem",
                color: COLORS.muted,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              {h}
            </div>
          ))}
        </div>

        <motion.div variants={staggerContainer} initial="hidden" animate="show">
          {data.topProducts.map((p, i) => {
            const pct = data.totalRevenue > 0 ? Math.round((p.revenue / data.totalRevenue) * 100) : 0;
            return (
              <motion.div
                key={i}
                variants={rowFade}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2rem 1fr 100px 100px 1fr",
                  gap: 16,
                  padding: "0.85rem 0",
                  borderBottom: i < data.topProducts.length - 1 ? `1px solid ${COLORS.line}` : "none",
                  alignItems: "center",
                }}
              >
                <div style={{ fontSize: "0.78rem", color: COLORS.muted, fontWeight: 700 }}>
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div style={{ fontWeight: 500, fontSize: "0.875rem" }}>{p.name}</div>
                <div style={{ fontSize: "0.85rem", color: COLORS.textMid }}>{p.sold}</div>
                <div style={{ fontSize: "0.85rem", color: COLORS.accent, fontWeight: 600 }}>
                  ${p.revenue.toLocaleString()}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ flex: 1, height: 3, background: "#1e1e1e", borderRadius: 3, overflow: "hidden" }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 * i }}
                      style={{ height: "100%", background: COLORS.accent }}
                    />
                  </div>
                  <span style={{ fontSize: "0.7rem", color: COLORS.textLow, minWidth: 32 }}>{pct}%</span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </Card>
    </div>
  );
}
