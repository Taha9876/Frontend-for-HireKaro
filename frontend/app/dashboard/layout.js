'use client';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // Auto-close sidebar on mobile/tablet
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setSidebarOpen(false);
            } else {
                setSidebarOpen(true);
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="flex h-screen overflow-hidden bg-gradient-to-b from-violet-50 to-white">
            {/* Hide top navbar inside dashboard */}
            <style>{`nav.fixed { display: none !important; }`}</style>
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            {/* Mobile hamburger button (visible when sidebar closed) */}
            {!sidebarOpen && (
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="lg:hidden fixed top-4 left-4 z-30 flex h-11 w-11 items-center justify-center rounded-xl border border-violet-200 bg-white shadow-lg text-slate-700 hover:text-violet-600"
                    aria-label="Open menu"
                >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                    </svg>
                </button>
            )}

            <main className="flex-1 overflow-y-auto w-full pt-16 lg:pt-0">
                {children}
            </main>
        </div>
    );
}