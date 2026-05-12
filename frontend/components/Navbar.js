'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function Navbar() {
    const router = useRouter();
    const [loggedIn, setLoggedIn] = useState(() => !!Cookies.get('access_token'));
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        handleScroll();
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');
        setLoggedIn(false);
        router.push('/');
    };

    const navLinks = [
        { label: 'Platform', href: '/' },
        { label: 'Features', href: '/#features' },
        { label: 'Pricing', href: '/pricing' },
        { label: 'About Us', href: '/about' },
        { label: 'Contact', href: '/contact' },
    ];

    return (
        <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md border-b border-gray-200/50 py-3 shadow-sm' : 'bg-transparent py-5 border-b border-transparent'}`}>
            <nav className="mx-auto grid w-full max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-6 px-6 md:px-10">
                <Link href="/" translate="no" className="notranslate flex items-center gap-2.5 no-underline group justify-self-start">
                    <motion.div 
                        className="notranslate flex h-9 w-9 items-center justify-center rounded-lg text-[13px] font-bold text-white shadow-md"
                        style={{ background: 'linear-gradient(135deg, #F4A28C, #E9C26A 50%, #A693CC)' }}
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.5 }}
                    >
                        HK
                    </motion.div>
                    <span className="notranslate text-lg font-bold tracking-tight text-[#1C1B2E]">
                        Hire Karo
                    </span>
                </Link>

                <ul className="hidden list-none items-center justify-center gap-8 p-0 md:flex m-0">
                    {navLinks.map((item) => (
                        <li key={item.href}>
                            <Link href={item.href} className="text-sm font-medium text-[#4A4860] no-underline transition-all hover:text-[#1C1B2E]">
                                {item.label}
                            </Link>
                        </li>
                    ))}
                </ul>

                <div className="flex items-center justify-end gap-3 justify-self-end">
                    <LanguageSwitcher />
                    {loggedIn ? (
                        <>
                            <Link href="/dashboard" className="hidden sm:inline-flex rounded-full border border-gray-200 px-5 py-2 text-sm font-medium text-gray-700 no-underline transition hover:bg-gray-50">
                                Dashboard
                            </Link>
                            <motion.button 
                                onClick={handleLogout} 
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                className="rounded-full px-5 py-2 text-sm font-semibold text-white border-none cursor-pointer bg-[#1C1B2E] hover:shadow-lg transition-all"
                            >
                                Logout
                            </motion.button>
                        </>
                    ) : (
                        <>
                            <Link href="/auth/login" className="hidden sm:inline-flex text-sm font-medium text-[#4A4860] no-underline transition hover:text-[#1C1B2E]">
                                Login
                            </Link>
                            <Link href="/auth/signup">
                                <motion.button
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold text-white bg-[#1C1B2E] hover:shadow-lg transition-all"
                                >
                                    Book a Demo <span aria-hidden>→</span>
                                </motion.button>
                            </Link>
                        </>
                    )}

                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="md:hidden ml-2 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 cursor-pointer"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            {mobileOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                            )}
                        </svg>
                    </button>
                </div>
            </nav>

            {mobileOpen && (
                <div className="md:hidden mt-4 mx-4 sm:mx-6 rounded-2xl border border-gray-100 p-4 shadow-xl bg-white/95 backdrop-blur-md">
                    <ul className="list-none p-0 m-0 space-y-1">
                        {navLinks.map((item) => (
                            <li key={item.href}>
                                <Link href={item.href} onClick={() => setMobileOpen(false)} className="block rounded-xl px-4 py-3 text-sm font-medium text-[#1C1B2E] no-underline transition hover:bg-[#F4D58D]/30">
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                        <li className="border-t border-gray-100 mt-2 pt-2">
                            {loggedIn ? (
                                <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="block rounded-xl px-4 py-3 text-sm font-semibold text-[#1C1B2E] no-underline transition hover:bg-[#9AD0C2]/30">
                                    Dashboard
                                </Link>
                            ) : (
                                <Link href="/auth/login" onClick={() => setMobileOpen(false)} className="block rounded-xl px-4 py-3 text-sm font-semibold text-[#1C1B2E] no-underline transition hover:bg-[#9AD0C2]/30">
                                    Login
                                </Link>
                            )}
                        </li>
                    </ul>
                </div>
            )}
        </header>
    );
}