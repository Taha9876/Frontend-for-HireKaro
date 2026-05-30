'use client';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function ConditionalNavbar() {
    const pathname = usePathname();

    // Hide navbar on dashboard, panel-room, and interview sub-routes
    if (pathname?.startsWith('/dashboard')) return null;
    if (pathname?.startsWith('/panel-room')) return null;
    if (pathname?.startsWith('/interview')) return null;

    return <Navbar />;
}