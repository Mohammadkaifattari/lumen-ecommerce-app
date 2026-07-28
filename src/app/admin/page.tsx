import { connectDB } from "@/lib/mongodb";
import { UserModel } from "@/models/User";
import { OrderModel } from "@/models/Order";
import { ProductModel } from "@/models/Product";
import { DashboardClient, type DashboardData } from "./_components/DashboardClient";

export const dynamic = "force-dynamic";

async function getStats() {
  await connectDB();
  const [totalUsers, totalOrders, totalProducts, orders] = await Promise.all([
    UserModel.countDocuments(),
    OrderModel.countDocuments(),
    ProductModel.countDocuments(),
    OrderModel.find({}, { total: 1, createdAt: 1, items: 1 }).lean(),
  ]);
  const revenue = orders.reduce((sum, o) => sum + (o.total ?? 0), 0);
  const avgOrder = totalOrders > 0 ? revenue / totalOrders : 0;

  const recentOrdersRaw = await OrderModel.find({})
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  // Serialize Mongoose docs (_id ObjectId → string) for the client boundary.
  const recentOrders = recentOrdersRaw.map((o: any) => ({
    _id: o._id.toString(),
    total: o.total,
    status: o.status,
    items: (o.items ?? []).map((i: any) => ({ name: i.name })),
  }));

  return { totalUsers, totalOrders, totalProducts, revenue, avgOrder, recentOrders };
}

export default async function AdminDashboard() {
  const stats = await getStats();
  return <DashboardClient data={stats as DashboardData} />;
}
