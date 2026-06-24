'use client';
import { usePathname } from 'next/navigation';
import LiveChat from './LiveChat';

export default function LiveChatWrapper() {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) return null;
  return <LiveChat />;
}