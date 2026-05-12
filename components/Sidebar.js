'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Cookies from 'js-cookie';

const menuItems = [
    { label: 'Overview', href: '/dashboard', dot: '#7FA582' },
    { label: 'Candidates', href: '/dashboard/candidates', dot: '#F4A28C' },
    { label: 'Jobs', href: '/dashboard/jobs', dot: '#E9C26A' },
    { label: 'Interviews', href: '/dashboard/interviews', dot: '#9AD0C2' },
    { label: 'Settings', href: '/dashboard/settings', dot: '#C4B5E0' },
];

// Collapse icon (like ChatGPT/Claude sidebar toggle)
function CollapseIcon({ isOpen }) {
    return <span className="text-xs font-semibold">{isOpen ? '<<' : '>>'}</span>;
}

export default function Sidebar({ isOpen, setIsOpen }) {
    const pathname = usePathname();
    const [company, setCompany] = useState({ name: 'Your Company' });

    useEffect(() => {
        const name = Cookies.get('company_name');
        if (name) setCompany({ name });
    }, []);

    const handleLogout = () => {
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');
        Cookies.remove('company_name');
        window.location.href = '/';
    };

    const isActive = (href) => {
        if (href === '/dashboard') return pathname === '/dashboard';
        return pathname.startsWith(href);
    };

    return (
        <>
            {/* Mobile backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}
            <aside
                className={`flex h-full flex-shrink-0 flex-col border-r border-[#1C1B2E]/10 bg-[#FBF8F2] shadow-xl shadow-[#1C1B2E]/5 transition-all fixed lg:relative inset-y-0 left-0 z-40 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
                style={{ width: isOpen ? 252 : 82 }}
            >
                {/* ── HEADER ── */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isOpen ? 'space-between' : 'center',
                    padding: '20px 16px 16px',
                    borderBottom: '1px solid rgba(127, 165, 130,0.12)',
                    minHeight: 68,
                }}>
                    {isOpen && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
                            <div style={{
                                width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                                background: 'linear-gradient(135deg, #F4A28C, #E9C26A 50%, #A693CC)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 12, fontWeight: 700, color: 'white',
                                boxShadow: '0 2px 8px rgba(28, 27, 46,0.25)',
                            }}>
                                HK
                            </div>
                            <span style={{
                                fontWeight: 700,
                                fontSize: 17, color: '#1C1B2E', letterSpacing: '-0.5px',
                                whiteSpace: 'nowrap',
                            }}>
                                Hire Karo
                            </span>
                        </div>
                    )}
                    <button
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#1C1B2E]/10 bg-white text-[#4A4860] transition hover:text-[#1C1B2E] hover:border-[#7FA582]/40"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        <CollapseIcon isOpen={isOpen} />
                    </button>
                </div>

                {/* ── COMPANY ── */}
                <div style={{
                    padding: '14px 12px 10px',
                    borderBottom: '1px solid rgba(127, 165, 130,0.1)',
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '10px 12px',
                        borderRadius: 10,
                        background: 'rgba(255,255,255,0.7)',
                        border: '1px solid rgba(28, 27, 46,0.08)',
                        justifyContent: isOpen ? 'flex-start' : 'center',
                        overflow: 'hidden',
                    }}>
                        <div style={{
                            width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                            background: 'linear-gradient(135deg, #9DBF9E, #F4D58D)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 13, fontWeight: 800, color: '#1C1B2E',
                        }}>
                            {company.name.charAt(0).toUpperCase()}
                        </div>
                        {isOpen && (
                            <div style={{ overflow: 'hidden' }}>
                                <p style={{
                                    margin: 0,
                                    fontWeight: 700, fontSize: 13, color: '#1C1B2E',
                                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                }}>
                                    {company.name}
                                </p>
                                <p style={{
                                    margin: 0,
                                    fontSize: 11, color: '#807E94', marginTop: 1,
                                }}>
                                    HR Admin
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── SECTION LABEL ── */}
                {isOpen && (
                    <div style={{
                        padding: '14px 16px 6px',
                    }}>
                        <span style={{
                            fontSize: 10, fontWeight: 700, color: '#807E94',
                            textTransform: 'uppercase', letterSpacing: '0.18em',
                        }}>
                            Main Menu
                        </span>
                    </div>
                )}

                {/* ── NAV ITEMS ── */}
                <nav style={{
                    flex: 1, display: 'flex', flexDirection: 'column', gap: 2,
                    padding: isOpen ? '6px 10px' : '14px 10px',
                    overflowY: 'auto',
                }}>
                    {menuItems.map((item) => {
                        const active = isActive(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-2.5 rounded-lg border px-3 py-2 text-[13px] font-medium no-underline transition ${active
                                        ? 'border-[#7FA582]/40 bg-[#9DBF9E]/25 text-[#1C1B2E]'
                                        : 'border-transparent text-[#4A4860] hover:bg-white/60 hover:text-[#1C1B2E]'
                                    }`}
                                style={{ justifyContent: isOpen ? 'flex-start' : 'center', whiteSpace: 'nowrap' }}
                            >
                                <span
                                    className="inline-block rounded-full flex-shrink-0"
                                    style={{
                                        width: 6, height: 6,
                                        background: active ? item.dot : 'rgba(128,126,148,0.35)',
                                    }}
                                />
                                {isOpen ? <span>{item.label}</span> : null}
                            </Link>
                        );
                    })}
                </nav>

                {/* ── CERTIFIED FAIR HIRING CARD ── */}
                {isOpen && (
                    <div style={{ padding: '8px 12px' }}>
                        <div className="rounded-xl border border-[#1C1B2E]/10 bg-white p-3">
                            <div className="flex items-center gap-1.5 mb-1">
                                <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#807E94]">Certified</span>
                                <svg viewBox="0 0 24 24" className="w-3 h-3">
                                    <defs>
                                        <linearGradient id="sbPride" x1="0" x2="1" y1="0" y2="1">
                                            <stop offset="0%" stopColor="#E53935"/>
                                            <stop offset="20%" stopColor="#FB8C00"/>
                                            <stop offset="40%" stopColor="#FDD835"/>
                                            <stop offset="60%" stopColor="#43A047"/>
                                            <stop offset="80%" stopColor="#1E88E5"/>
                                            <stop offset="100%" stopColor="#8E24AA"/>
                                        </linearGradient>
                                    </defs>
                                    <path fill="url(#sbPride)" d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 5a5.5 5.5 0 0 1 9.5 7c-2.5 4.5-9.5 9-9.5 9z"/>
                                </svg>
                            </div>
                            <div className="text-[12px] font-bold text-[#1C1B2E] leading-tight mb-1">Fair Hiring</div>
                            <div className="text-[10px] text-[#4A4860] leading-snug">We support LGBTQ+ Inclusion</div>
                        </div>
                    </div>
                )}

                {/* ── BOTTOM ACTIONS ── */}
                <div style={{
                    padding: '10px 10px 16px',
                    borderTop: '1px solid rgba(28, 27, 46, 0.08)',
                    display: 'flex', flexDirection: 'column', gap: 6,
                }}>
                    {isOpen ? (
                        <Link href="/dashboard/jobs/create" className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#1C1B2E] px-4 py-2.5 text-sm font-semibold text-white no-underline shadow-md shadow-[#1C1B2E]/20 transition hover:-translate-y-0.5 hover:shadow-xl">
                            Create Job <span aria-hidden>→</span>
                        </Link>
                    ) : (
                        <Link href="/dashboard/jobs/create" className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-[#1C1B2E] text-xs font-semibold text-white no-underline">+</Link>
                    )}

                    {isOpen ? (
                        <button className="flex w-full items-center gap-2 rounded-lg border border-transparent px-3 py-2 text-sm font-medium text-[#4A4860] transition hover:border-[#F4A28C]/40 hover:bg-[#F4A28C]/10 hover:text-[#E88A72]" onClick={handleLogout}>
                            Log Out
                        </button>
                    ) : (
                        <button className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl text-[10px] font-semibold text-[#4A4860] transition hover:bg-[#F4A28C]/15 hover:text-[#E88A72]" onClick={handleLogout}>
                            OUT
                        </button>
                    )}
                </div>
            </aside>
        </>
    );
}