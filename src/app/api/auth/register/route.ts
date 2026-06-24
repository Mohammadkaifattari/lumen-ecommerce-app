import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { UserModel } from "@/models/User";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return Response.json(
        { error: "Name, email, and password are required." },
        { status: 400 }
      );
    }

    await connectDB();

    const existing = await UserModel.findOne({ email: email.toLowerCase() });
    if (existing) {
      return Response.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await UserModel.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    // Admin ko notify karo
    if (global.io) {
      global.io.to('admin-room').emit('new-user', {
        userId: user._id.toString(),
        name: user.name,
        email: user.email,
        time: new Date().toISOString(),
      });
    }

    return Response.json({
      status: "✅ Account created",
      user: { id: user._id.toString(), name: user.name, email: user.email },
    });
  } catch (err: any) {
    return Response.json(
      { error: "Registration failed", details: err.message },
      { status: 500 }
    );
  }
}