import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { OrderModel } from '@/models/Order';

export async function GET() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();

  const orders = await OrderModel.find({}).lean();

  // Total stats
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

  // Revenue by month
  const monthMap: Record<string, number> = {};
  orders.forEach(o => {
    const d = new Date(o.createdAt);
    const key = d.toLocaleString('default', { month: 'short', year: '2-digit' });
    monthMap[key] = (monthMap[key] || 0) + o.total;
  });
  const revenueByMonth = Object.entries(monthMap).map(([month, revenue]) => ({ month, revenue }));

  // Top products
  const productMap: Record<string, { name: string; sold: number; revenue: number }> = {};
  orders.forEach(o => {
    o.items.forEach((item: any) => {
      if (!productMap[item.name]) {
        productMap[item.name] = { name: item.name, sold: 0, revenue: 0 };
      }
      productMap[item.name].sold += item.quantity;
      productMap[item.name].revenue += item.price * item.quantity;
    });
  });
  const topProducts = Object.values(productMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return NextResponse.json({ totalRevenue, totalOrders, revenueByMonth, topProducts });
}