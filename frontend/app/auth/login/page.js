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
            const res = await fetch(process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/login` : 'http://localhost:8000/api/v1/auth/login', {
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
        <div ref={pageRef} className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-white px-4 pb-12 pt-28 text-slate-900">
            <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-[2.5rem] border border-violet-100/80 bg-white/80 shadow-2xl shadow-violet-100/30 backdrop-blur-3xl lg:grid-cols-2">
                <div className="auth-enter relative hidden flex-col justify-between overflow-hidden rounded-l-[2.5rem] rounded-r-none bg-gradient-to-br from-white via-pink-50 to-purple-50 p-8 lg:flex">
                    <div className="pointer-events-none absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-pink-100/20 via-purple-100/20 to-transparent" />
                    <div className="relative z-10 flex flex-col gap-8">
                        <div>
                          <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-purple-600 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 ring-1 ring-purple-500/30">BH</div>
                          <h2 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900">Welcome back.</h2>
                          <p className="mt-4 max-w-sm text-sm text-slate-600">Get instant access to your AI hiring workspace and move faster from candidate screening to offer.</p>
                        </div>
                        <div className="grid gap-4">
                            <div className="rounded-[1.75rem] border border-purple-200/50 bg-white/90 p-6 shadow-lg backdrop-blur-2xl">
                                <p className="text-xs uppercase tracking-[0.28em] text-purple-700 font-semibold">Trusted performance</p>
                                <p className="mt-3 text-sm text-gray-700">AI-first screening, interview scheduling, and candidate insights in one polished workspace.</p>
                            </div>
                            <div className="rounded-[1.75rem] border border-purple-200/50 bg-white/90 p-6 shadow-lg backdrop-blur-2xl">
                                <p className="text-xs uppercase tracking-[0.28em] text-purple-700 font-semibold">Team-ready</p>
                                <p className="mt-3 text-sm text-gray-700">Built for recruiting teams that need speed, clarity, and consistent decision-making.</p>
                            </div>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-[1.75rem] bg-white/95 p-5 shadow-lg border border-purple-200/50">
                                <p className="text-3xl font-bold text-purple-600">+38%</p>
                                <p className="mt-1 text-sm text-gray-600">Faster candidate screening</p>
                            </div>
                            <div className="rounded-[1.75rem] bg-white/95 p-5 shadow-lg border border-purple-200/50">
                                <p className="text-3xl font-bold text-purple-600">4.9/5</p>
                                <p className="mt-1 text-sm text-gray-600">Average recruiter satisfaction</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="auth-enter relative p-8 md:p-12 bg-gradient-to-br from-pink-50 via-fuchsia-50 to-violet-100/70 rounded-r-[2.5rem] rounded-l-none">
                    <div className="pointer-events-none absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-pink-200/30 via-fuchsia-100/30 to-transparent" />
                    <div className="relative z-10 flex flex-col gap-8">
                        <div className="max-w-xl">
                            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-fuchsia-700">Secure access</p>
                            <h3 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">Sign in</h3>
                            <p className="mt-3 text-sm text-slate-600">Access your Hire Karo workspace and keep hiring moving fast.</p>
                        </div>
                        <div className="rounded-[2rem] border border-white/70 bg-white/90 p-8 shadow-[0_35px_120px_-40px_rgba(124,58,237,0.35)] backdrop-blur-2xl">
                            {error && (
                                <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleLogin} className="flex flex-col gap-5">
                                <div>
                                    <label htmlFor="email" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Work Email</label>
                                    <input id="email" name="email" type="email" required value={form.email}
                                        onChange={handleChange} placeholder="company@example.com"
                                        className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-200/20"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="password" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Password</label>
                                    <input id="password" name="password" type="password" required value={form.password}
                                        onChange={handleChange} placeholder="••••••••"
                                        className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-200/20"
                                    />
                                </div>

                                <div className="flex items-center justify-between gap-4 text-sm text-slate-500">
                                    <button type="button" className="font-medium text-fuchsia-700 hover:text-fuchsia-800">
                                        Forgot password?
                                    </button>
                                </div>

                                <button type="submit" disabled={loading}
                                    className="mt-4 w-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-500 py-3 text-sm font-semibold text-white shadow-2xl shadow-violet-500/20 transition duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60">
                                    {loading ? 'Signing In...' : 'Sign In →'}
                                </button>
                            </form>
                        </div>

                        <p className="text-center text-sm text-slate-500">
                            Don&apos;t have an account?{' '}
                            <Link href="/auth/signup" className="font-semibold text-violet-600 hover:text-violet-700">Sign up free</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}