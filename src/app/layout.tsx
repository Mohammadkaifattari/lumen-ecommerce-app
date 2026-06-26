import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { SearchOverlay } from "@/components/layout/SearchOverlay";
import { PageTransition } from "@/components/layout/PageTransition";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { AuthSessionProvider } from "@/components/layout/AuthSessionProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { AdminLayoutGuard } from "@/components/layout/AdminLayoutGuard";
import LiveChatWrapper from "@/components/chat/LiveChatWrapper";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://lumen.store"),
  title: {
    default: "LUMEN — Premium Performance",
    template: "%s · LUMEN",
  },
  description:
    "Premium performance footwear, apparel, and equipment. Engineered for the relentless.",
  keywords: ["sneakers", "performance", "apparel", "premium", "athletic"],
  openGraph: {
    title: "LUMEN — Premium Performance",
    description: "Engineered for the relentless.",
    type: "website",
    siteName: "LUMEN",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        {/* Pre-hydration theme script — prevents dark-mode flash. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('lumen-theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark');}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="font-sans antialiased">
        <AuthSessionProvider>
          <QueryProvider>
          <ThemeProvider>
            <AdminLayoutGuard
              navbar={<Navbar />}
              footer={<Footer />}
              cursor={<CustomCursor />}
              cart={<CartDrawer />}
              search={<SearchOverlay />}
            >
              <PageTransition>
                <main className="min-h-screen">{children}</main>
              </PageTransition>
            </AdminLayoutGuard>
            <LiveChatWrapper />
          </ThemeProvider>
          </QueryProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}