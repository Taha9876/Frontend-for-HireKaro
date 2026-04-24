'use client';
import { useState } from 'react';
import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div className="flex h-screen overflow-hidden bg-gradient-to-b from-violet-50 to-white">
            {/* Hide top navbar inside dashboard */}
            <style>{`nav.fixed { display: none !important; }`}</style>
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}