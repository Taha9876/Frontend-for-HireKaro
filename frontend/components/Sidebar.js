'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Cookies from 'js-cookie';

const menuItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Jobs', href: '/dashboard/jobs' },
    { label: 'Candidates', href: '/dashboard/candidates' },
    { label: 'Interviews', href: '/dashboard/interviews' },
    { label: 'Settings', href: '/dashboard/settings' },
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
        <aside
            className="flex h-full flex-shrink-0 flex-col border-r border-violet-100 bg-white shadow-xl shadow-violet-100/60 transition-all"
            style={{ width: isOpen ? 252 : 82 }}
        >
                {/* ── HEADER ── */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isOpen ? 'space-between' : 'center',
                    padding: '20px 16px 16px',
                    borderBottom: '1px solid rgba(139,92,246,0.12)',
                    minHeight: 68,
                }}>
                    {isOpen && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
                            <div style={{
                                width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                                background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 12, fontWeight: 700, color: 'white',
                                boxShadow: '0 2px 8px rgba(124,58,237,0.35)',
                            }}>
                                BH
                            </div>
                            <span style={{
                                fontWeight: 700,
                                fontSize: 17, color: '#0f172a', letterSpacing: '-0.5px',
                                whiteSpace: 'nowrap',
                            }}>
                                Brain<span style={{ color: '#7c3aed' }}>-A-</span>Hire
                            </span>
                        </div>
                    )}
                    <button
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-violet-200 bg-white text-slate-500 transition hover:text-violet-600"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        <CollapseIcon isOpen={isOpen} />
                    </button>
                </div>

                {/* ── COMPANY ── */}
                <div style={{
                    padding: '14px 12px 10px',
                    borderBottom: '1px solid rgba(139,92,246,0.1)',
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '10px 12px',
                        borderRadius: 10,
                        background: 'rgba(124,58,237,0.05)',
                        border: '1px solid rgba(124,58,237,0.12)',
                        justifyContent: isOpen ? 'flex-start' : 'center',
                        overflow: 'hidden',
                    }}>
                        <div style={{
                            width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                            background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 13, fontWeight: 800, color: 'white',
                        }}>
                            {company.name.charAt(0).toUpperCase()}
                        </div>
                        {isOpen && (
                            <div style={{ overflow: 'hidden' }}>
                                <p style={{
                                    margin: 0,
                                    fontWeight: 600, fontSize: 13, color: '#0f172a',
                                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                }}>
                                    {company.name}
                                </p>
                                <p style={{
                                    margin: 0,
                                    fontSize: 11, color: '#94a3b8', marginTop: 1,
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
                            fontSize: 10, fontWeight: 700, color: '#cbd5e1',
                            textTransform: 'uppercase', letterSpacing: '0.1em',
                            fontFamily: 'DM Sans, sans-serif',
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
                    {menuItems.map((item) => (
                        <div key={item.href}>
                            <Link
                                href={item.href}
                                className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-medium no-underline transition ${isActive(item.href)
                                        ? 'border-violet-200 bg-violet-50 text-violet-700'
                                        : 'border-transparent text-slate-600 hover:border-violet-100 hover:bg-violet-50/60 hover:text-violet-700'
                                    }`}
                                style={{ justifyContent: isOpen ? 'flex-start' : 'center', whiteSpace: 'nowrap' }}
                            >
                                {isOpen ? <span>{item.label}</span> : <span>{item.label.slice(0, 1)}</span>}
                            </Link>
                        </div>
                    ))}
                </nav>

                {/* ── BOTTOM ACTIONS ── */}
                <div style={{
                    padding: '10px 10px 16px',
                    borderTop: '1px solid rgba(139,92,246,0.1)',
                    display: 'flex', flexDirection: 'column', gap: 6,
                }}>
                    {/* Create Job */}
                    {isOpen ? (
                        <Link href="/dashboard/jobs/create" className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-500 px-4 py-2.5 text-sm font-semibold text-white no-underline shadow-lg shadow-violet-300/50 transition hover:-translate-y-0.5">
                            Create Job
                        </Link>
                    ) : (
                        <Link href="/dashboard/jobs/create" className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-indigo-500 text-xs font-semibold text-white no-underline">NEW</Link>
                    )}

                    {/* Logout */}
                    {isOpen ? (
                        <button className="flex w-full items-center gap-2 rounded-xl border border-transparent px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:border-red-100 hover:bg-red-50 hover:text-red-500" onClick={handleLogout}>
                            Log Out
                        </button>
                    ) : (
                        <div>
                            <button className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl text-[10px] font-semibold text-slate-500 transition hover:bg-red-50 hover:text-red-500" onClick={handleLogout}>
                                OUT
                            </button>
                        </div>
                    )}
                </div>
        </aside>
    );
}