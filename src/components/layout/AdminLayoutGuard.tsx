"use client";

import { usePathname } from "next/navigation";

export function AdminLayoutGuard({
  children,
  navbar,
  footer,
  cursor,
  cart,
  search,
}: {
  children: React.ReactNode;
  navbar: React.ReactNode;
  footer: React.ReactNode;
  cursor: React.ReactNode;
  cart: React.ReactNode;
  search: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) return <>{children}</>;

  return (
    <>
      {cursor}
      {navbar}
      {children}
      {footer}
      {cart}
      {search}
    </>
  );
}