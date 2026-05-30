'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';

export default function LoginPage() {
    const pageRef = useRef(null);
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({ email: '', password: '' });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError('');
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            // Backend Auth
            const res = await fetch('/api/v1/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: form.email, password: form.password })
            });
            
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.detail || 'Backend auth failed');
            }
            
            const data = await res.json();
            
            // Store Backend Tokens
            document.cookie = `access_token=${data.access_token}; path=/; max-age=86400`;
            document.cookie = `refresh_token=${data.refresh_token}; path=/; max-age=86400`;
            if (data.company_name) {
                document.cookie = `company_name=${data.company_name}; path=/; max-age=86400`;
            }

            // Small delay to ensure cookies are persisted
            await new Promise((r) => setTimeout(r, 300));

            // Use router for client-side navigation + refresh server state
            router.push('/dashboard');
            router.refresh();
        } catch (err) {
            console.error('Login error:', err);
            setError(err.message || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!pageRef.current) return;
        const ctx = gsap.context(() => {
            gsap.from('.auth-enter', { opacity: 0, y: 22, duration: 0.7, stagger: 0.08, ease: 'power3.out' });
        }, pageRef);
        return () => ctx.revert();
    }, []);

    return (
        <div ref={pageRef} className="relative min-h-screen overflow-hidden bg-white px-4 pb-12 pt-28 text-[#1C1B2E]">
            {/* Hero-style layered ribbon background */}
            <AuthBackground />

            <div className="relative z-10 mx-auto grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-[#1C1B2E]/10 bg-white/85 shadow-[0_40px_120px_-40px_rgba(28,27,46,0.25)] backdrop-blur-xl lg:grid-cols-[1.05fr_1fr]">

                {/* ── LEFT: brand panel ── */}
                <div className="auth-enter relative hidden flex-col justify-between overflow-hidden bg-[#FBF8F2] p-10 lg:flex">
                    <AuthPanelRibbons />
                    <div className="relative z-10 flex flex-col gap-8">
                        <div>
                            <div className="mb-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F3F3EE] border border-[#1C1B2E]/10 shadow-sm">
                                <svg className="w-3 h-3 text-[#7FA582]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l4 10-4 10-4-10 4-10z"/></svg>
                                <span className="text-[10px] font-semibold tracking-[0.22em] uppercase text-[#1C1B2E]">AI-Powered. Human-Centered.</span>
                            </div>
                            <h2
                                className="mt-4 text-5xl font-medium leading-[1.05] tracking-[-0.025em] text-[#1C1B2E]"
                                style={{ fontFamily: 'var(--font-serif), ui-serif, Georgia, serif' }}
                            >
                                <span className="italic bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(95deg,#F4A28C 0%,#F4D58D 45%,#9DBF9E 80%,#C4B5E0 100%)' }}>Welcome</span> back.
                            </h2>
                            <p className="mt-4 max-w-sm text-sm text-[#4A4860] leading-relaxed">Get instant access to your Hire Karo workspace and keep moving from candidate screening to offer — fairly and fast.</p>
                        </div>

                        <div className="grid gap-3">
                            <div className="rounded-2xl border border-[#1C1B2E]/8 bg-white/90 p-5 shadow-sm">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#7FA582]" />
                                    <p className="text-[10px] uppercase tracking-[0.22em] text-[#4A4860] font-semibold">Trusted performance</p>
                                </div>
                                <p className="text-sm text-[#1C1B2E] leading-snug">AI-first screening, interview scheduling, and candidate insights in one polished workspace.</p>
                            </div>
                            <div className="rounded-2xl border border-[#1C1B2E]/8 bg-white/90 p-5 shadow-sm">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#E9C26A]" />
                                    <p className="text-[10px] uppercase tracking-[0.22em] text-[#4A4860] font-semibold">Team-ready</p>
                                </div>
                                <p className="text-sm text-[#1C1B2E] leading-snug">Built for recruiting teams that need speed, clarity, and consistent decision-making.</p>
                            </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-2xl bg-white p-5 border border-[#1C1B2E]/8 shadow-sm">
                                <p className="text-3xl font-extrabold bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg,#7FA582,#F4D58D)' }}>+38%</p>
                                <p className="mt-1 text-xs text-[#4A4860]">Faster candidate screening</p>
                            </div>
                            <div className="rounded-2xl bg-white p-5 border border-[#1C1B2E]/8 shadow-sm">
                                <p className="text-3xl font-extrabold bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg,#F4A28C,#E9C26A)' }}>4.9/5</p>
                                <p className="mt-1 text-xs text-[#4A4860]">Average recruiter satisfaction</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── RIGHT: sign-in form ── */}
                <div className="auth-enter relative p-6 sm:p-8 md:p-12 bg-white">
                    <div className="relative z-10 flex flex-col gap-8">
                        <div className="max-w-xl">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#7FA582]">Secure access</p>
                            <h3
                                className="mt-2 text-4xl font-medium tracking-[-0.02em] text-[#1C1B2E]"
                                style={{ fontFamily: 'var(--font-serif), ui-serif, Georgia, serif' }}
                            >
                                Sign in
                            </h3>
                            <p className="mt-3 text-sm text-[#4A4860]">Access your workspace and keep hiring moving fast.</p>
                        </div>

                        <div className="rounded-2xl border border-[#1C1B2E]/10 bg-[#FBF8F2]/60 p-6 sm:p-8 shadow-[0_30px_90px_-40px_rgba(28,27,46,0.25)] backdrop-blur-xl">
                            {error && (
                                <div className="mb-5 px-4 py-3 bg-[#F4A28C]/20 border border-[#E88A72]/40 rounded-lg text-[#B85A3F] text-sm">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleLogin} className="flex flex-col gap-5">
                                <div>
                                    <label htmlFor="email" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#4A4860]">Work Email</label>
                                    <input id="email" name="email" type="email" required value={form.email}
                                        onChange={handleChange} placeholder="company@example.com"
                                        className="w-full rounded-xl border border-[#1C1B2E]/10 bg-white px-4 py-3 text-sm text-[#1C1B2E] placeholder:text-[#807E94] outline-none transition focus:border-[#7FA582] focus:ring-4 focus:ring-[#9DBF9E]/20"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="password" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#4A4860]">Password</label>
                                    <input id="password" name="password" type="password" required value={form.password}
                                        onChange={handleChange} placeholder="••••••••"
                                        className="w-full rounded-xl border border-[#1C1B2E]/10 bg-white px-4 py-3 text-sm text-[#1C1B2E] placeholder:text-[#807E94] outline-none transition focus:border-[#7FA582] focus:ring-4 focus:ring-[#9DBF9E]/20"
                                    />
                                </div>

                                <div className="flex items-center justify-between gap-4 text-sm text-[#4A4860]">
                                    <button type="button" className="font-semibold text-[#7FA582] hover:text-[#1C1B2E] transition">
                                        Forgot password?
                                    </button>
                                </div>

                                <button type="submit" disabled={loading}
                                    className="mt-2 w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#1C1B2E] py-3 text-sm font-semibold text-white shadow-lg shadow-[#1C1B2E]/20 transition duration-300 hover:-translate-y-0.5 hover:shadow-2xl disabled:cursor-not-allowed disabled:opacity-60">
                                    {loading ? 'Signing In…' : <>Sign In <span aria-hidden>→</span></>}
                                </button>
                            </form>
                        </div>

                        <p className="text-center text-sm text-[#4A4860]">
                            Don&apos;t have an account?{' '}
                            <Link href="/auth/signup" className="font-semibold text-[#1C1B2E] underline decoration-[#7FA582] decoration-2 underline-offset-4 hover:decoration-[#F4A28C]">Sign up free</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ─── Shared auth theme bits ─── */
function AuthBackground() {
    return (
        <div className="absolute inset-0 -z-0 overflow-hidden pointer-events-none" aria-hidden="true">
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
                <defs>
                    <linearGradient id="aSage" x1="0%" x2="100%"><stop offset="0%" stopColor="#9DBF9E" stopOpacity="0"/><stop offset="25%" stopColor="#9DBF9E" stopOpacity="0.75"/><stop offset="80%" stopColor="#7FA582" stopOpacity="0.75"/><stop offset="100%" stopColor="#7FA582" stopOpacity="0"/></linearGradient>
                    <linearGradient id="aMint" x1="0%" x2="100%"><stop offset="0%" stopColor="#9AD0C2" stopOpacity="0"/><stop offset="25%" stopColor="#9AD0C2" stopOpacity="0.70"/><stop offset="80%" stopColor="#BFE3D6" stopOpacity="0.70"/><stop offset="100%" stopColor="#9AD0C2" stopOpacity="0"/></linearGradient>
                    <linearGradient id="aYellow" x1="0%" x2="100%"><stop offset="0%" stopColor="#F4D58D" stopOpacity="0"/><stop offset="25%" stopColor="#F4D58D" stopOpacity="0.75"/><stop offset="80%" stopColor="#F8E2A8" stopOpacity="0.75"/><stop offset="100%" stopColor="#F4D58D" stopOpacity="0"/></linearGradient>
                    <linearGradient id="aCoral" x1="0%" x2="100%"><stop offset="0%" stopColor="#F4A28C" stopOpacity="0"/><stop offset="25%" stopColor="#F4A28C" stopOpacity="0.78"/><stop offset="80%" stopColor="#F4B58A" stopOpacity="0.72"/><stop offset="100%" stopColor="#F4A28C" stopOpacity="0"/></linearGradient>
                    <filter id="aSoft" x="-10%" y="-50%" width="120%" height="200%"><feGaussianBlur stdDeviation="22"/></filter>
                </defs>
                <g transform="rotate(-12 720 450)" filter="url(#aSoft)">
                    <rect x="-300" y="500" width="2200" height="80" fill="url(#aSage)"/>
                    <rect x="-300" y="595" width="2200" height="75" fill="url(#aMint)"/>
                    <rect x="-300" y="685" width="2200" height="85" fill="url(#aYellow)"/>
                    <rect x="-300" y="785" width="2200" height="95" fill="url(#aCoral)"/>
                </g>
            </svg>
        </div>
    );
}

function AuthPanelRibbons() {
    return (
        <div className="absolute inset-0 pointer-events-none opacity-60" aria-hidden="true">
            <div className="absolute -top-10 -right-10 w-60 h-60 rounded-full blur-3xl" style={{ background: 'radial-gradient(circle, rgba(244,213,141,0.55), rgba(244,213,141,0) 70%)' }}/>
            <div className="absolute -bottom-10 -left-10 w-72 h-72 rounded-full blur-3xl" style={{ background: 'radial-gradient(circle, rgba(157,191,158,0.55), rgba(157,191,158,0) 70%)' }}/>
            <div className="absolute top-1/2 right-1/4 w-48 h-48 rounded-full blur-3xl" style={{ background: 'radial-gradient(circle, rgba(244,162,140,0.40), rgba(244,162,140,0) 70%)' }}/>
        </div>
    );
}