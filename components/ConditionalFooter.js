'use client';
import { usePathname } from 'next/navigation';
import Footer from '@/components/Footer';

export default function ConditionalFooter() {
  const pathname = usePathname();

  // Hide footer on dashboard, panel-room, and interview sub-routes
  if (pathname?.startsWith('/dashboard')) return null;
  if (pathname?.startsWith('/panel-room')) return null;
  if (pathname?.startsWith('/interview')) return null;

  return <Footer />;
}
