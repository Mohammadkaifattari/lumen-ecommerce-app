import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://luma:luma1122@ac-m7n0wvw-shard-00-00.uwglgi6.mongodb.net:27017,ac-m7n0wvw-shard-00-01.uwglgi6.mongodb.net:27017,ac-m7n0wvw-shard-00-02.uwglgi6.mongodb.net:27017/luma?ssl=true&authSource=admin&retryWrites=true&w=majority";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    password: { type: String, required: true },
    image: { type: String },
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: true }
);

const UserModel = mongoose.models.User || mongoose.model("User", UserSchema);

async function seedAdmin() {
  await mongoose.connect(MONGODB_URI);

  const email = "admin@lumen.com";
  const existing = await UserModel.findOne({ email });

  if (existing) {
    existing.role = "admin";
    await existing.save();
    console.log(`✅ User ${email} updated to admin`);
  } else {
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await UserModel.create({
      name: "Admin",
      email,
      password: hashedPassword,
      role: "admin",
    });
    console.log(`✅ Admin created: ${email} / admin123`);
  }

  process.exit(0);
}

seedAdmin().catch((e) => {
  console.error(e);
  process.exit(1);
});
