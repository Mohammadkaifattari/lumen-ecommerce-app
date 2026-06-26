import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { UserModel } from "@/models/User";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required.");
        }

        await connectDB();

        const user = await UserModel.findOne({
          email: credentials.email.toLowerCase(),
        });

        if (!user) {
          throw new Error("No account found with this email.");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error("Incorrect password.");
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role ?? "user",
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role ?? "user";
      }
      if (account?.provider === "google") {
        await connectDB();
        let dbUser = await UserModel.findOne({ email: token.email });
        if (!dbUser) {
          dbUser = await UserModel.create({
            name: token.name,
            email: token.email,
            password: "google-oauth",
            role: "user",
          });
        }
        token.id = dbUser._id.toString();
        token.role = dbUser.role ?? "user";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role ?? "user";
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
  if (url.includes("/login") || url.includes("/register")) {
    return `${baseUrl}/account`;
  }
  if (url.startsWith(baseUrl)) return url;
  if (url.startsWith("/")) return `${baseUrl}${url}`;
  return `${baseUrl}/account`;
},
  },
};