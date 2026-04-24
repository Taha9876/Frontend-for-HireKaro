'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';
import api from '@/lib/api';

export default function SignupPage() {
    const router = useRouter();
    const pageRef = useRef(null);
    const [step, setStep] = useState('signup'); // signup | otp | success
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [email, setEmail] = useState('');
    const otpIds = ['otp-0', 'otp-1', 'otp-2', 'otp-3', 'otp-4', 'otp-5'];
    const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
    const [resendTimer, setResendTimer] = useState(0);

    const [form, setForm] = useState({
        company_name: '',
        email: '',
        password: '',
        industry: '',
        company_size: '',
    });

    useEffect(() => {
        if (!pageRef.current) return;
        const ctx = gsap.context(() => {
            gsap.from('.auth-enter', { opacity: 0, y: 22, duration: 0.7, stagger: 0.08, ease: 'power3.out' });
        }, pageRef);
        return () => ctx.revert();
    }, []);

    useEffect(() => {
        if (resendTimer <= 0) return;
        const t = setInterval(() => setResendTimer(p => p - 1), 1000);
        return () => clearInterval(t);
    }, [resendTimer]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.post('/api/v1/auth/signup', {
                email: form.email,
                password: form.password,
                company_name: form.company_name,
                industry: form.industry,
                company_size: form.company_size
            });
            setEmail(form.email);
            setStep('otp');
            setResendTimer(60);
        } catch (err) {
            setError(err.response?.data?.detail || err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (val, idx) => {
        if (val && !/^\d$/.test(val)) return;
        const updated = [...otpValues];
        updated[idx] = val;
        setOtpValues(updated);
        setError('');
        if (val && idx < 5) {
            document.getElementById(`otp-${idx + 1}`)?.focus();
        }
    };

    const handleOtpKeyDown = (e, idx) => {
        if (e.key === 'Backspace') {
            if (otpValues[idx]) {
                const updated = [...otpValues];
                updated[idx] = '';
                setOtpValues(updated);
            } else if (idx > 0) {
                document.getElementById(`otp-${idx - 1}`)?.focus();
            }
        }
    };

    const handleOtpPaste = (e) => {
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (pasted.length === 6) {
            setOtpValues(pasted.split(''));
            document.getElementById('otp-5')?.focus();
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        const otpCode = otpValues.join('');
        if (otpCode.length < 6) {
            setError('Please enter the complete 6-digit code');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await api.post('/api/v1/auth/verify-otp', {
                email,
                otp: otpCode,
            });
            setStep('success');
            setTimeout(() => router.push('/auth/login'), 2500);
        } catch (err) {
            setError(err.response?.data?.detail || 'Invalid or expired OTP. Please try again.');
            setOtpValues(['', '', '', '', '', '']);
            document.getElementById('otp-0')?.focus();
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (resendTimer > 0) return;
        setLoading(true);
        setError('');
        try {
            await api.post('/api/v1/auth/resend-otp', { email });
            setResendTimer(60);
            setOtpValues(['', '', '', '', '', '']);
            document.getElementById('otp-0')?.focus();
        } catch (err) {
            setError('Could not resend code. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div ref={pageRef} className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-white px-4 pb-12 pt-28 text-slate-900">
            <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-[2.5rem] border border-violet-100/80 bg-white/80 shadow-2xl shadow-violet-100/30 backdrop-blur-3xl lg:grid-cols-2">
                
                {/* ── LEFT SIDE (Same as Login) ── */}
                <div className="auth-enter relative hidden flex-col justify-between overflow-hidden rounded-l-[2.5rem] rounded-r-none bg-gradient-to-br from-white via-pink-50 to-purple-50 p-8 lg:flex">
                    <div className="pointer-events-none absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-pink-100/20 via-purple-100/20 to-transparent" />
                    <div className="relative z-10 flex flex-col gap-8">
                        <div>
                          <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-purple-600 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 ring-1 ring-purple-500/30">BH</div>
                          <h2 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900">Start your team.</h2>
                          <p className="mt-4 max-w-sm text-sm text-slate-600">Create a verified hiring workspace with candidate intelligence, interview tracking, and real-time team collaboration.</p>
                        </div>
                        <div className="grid gap-4">
                            <div className="rounded-[1.75rem] border border-purple-200/50 bg-white/90 p-6 shadow-lg backdrop-blur-2xl">
                                <p className="text-xs uppercase tracking-[0.28em] text-purple-700 font-semibold">Built for scale</p>
                                <p className="mt-3 text-sm text-gray-700">A modern recruitment hub that keeps your team aligned and your hiring decisions consistent.</p>
                            </div>
                            <div className="rounded-[1.75rem] border border-purple-200/50 bg-white/90 p-6 shadow-lg backdrop-blur-2xl">
                                <p className="text-xs uppercase tracking-[0.28em] text-purple-700 font-semibold">Conversion focused</p>
                                <p className="mt-3 text-sm text-gray-700">A clean onboarding experience designed to reduce friction and convert more teams.</p>
                            </div>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-[1.75rem] bg-white/95 p-5 shadow-lg border border-purple-200/50">
                                <p className="text-3xl font-bold text-purple-600">+22%</p>
                                <p className="mt-1 text-sm text-gray-600">Faster team activation</p>
                            </div>
                            <div className="rounded-[1.75rem] bg-white/95 p-5 shadow-lg border border-purple-200/50">
                                <p className="text-3xl font-bold text-purple-600">98%</p>
                                <p className="mt-1 text-sm text-gray-600">Clean onboarding completion</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── RIGHT SIDE (Form/OTP/Success) ── */}
                <div className="auth-enter relative p-8 md:p-12 bg-gradient-to-br from-pink-50 via-fuchsia-50 to-violet-100/70 rounded-r-[2.5rem] rounded-l-none">
                    <div className="pointer-events-none absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-pink-200/30 via-fuchsia-100/30 to-transparent" />
                    <div className="relative z-10 flex flex-col gap-8 h-full justify-center">
                        
                        {/* ── STEP 1: SIGNUP FORM ── */}
                        {step === 'signup' && (
                            <>
                                <div className="max-w-xl">
                                    <p className="text-sm font-semibold uppercase tracking-[0.28em] text-fuchsia-700">Premium onboarding</p>
                                    <h3 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">Create account</h3>
                                    <p className="mt-3 text-sm text-slate-600">Set up your hiring workspace, manage teams, and unlock AI-assisted recruitment workflows.</p>
                                </div>
                                <div className="rounded-[2rem] border border-white/70 bg-white/90 p-8 shadow-[0_35px_120px_-40px_rgba(124,58,237,0.35)] backdrop-blur-2xl">
                                    {error && (
                                        <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                                            {error}
                                        </div>
                                    )}

                                    <form onSubmit={handleSignup} className="flex flex-col gap-5">
                                        <div>
                                            <label htmlFor="company_name" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Company Name</label>
                                            <input id="company_name" name="company_name" required value={form.company_name}
                                                onChange={handleChange} placeholder="Acme Corporation"
                                                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-200/20"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="signup_email" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Work Email</label>
                                            <input id="signup_email" name="email" type="email" required value={form.email}
                                                onChange={handleChange} placeholder="you@company.com"
                                                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-200/20"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label htmlFor="industry" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Industry</label>
                                                <select id="industry" name="industry" value={form.industry} onChange={handleChange}
                                                    className="w-full cursor-pointer rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-200/20">
                                                    <option value="">Select</option>
                                                    <option>Technology</option>
                                                    <option>Finance</option>
                                                    <option>Healthcare</option>
                                                    <option>Education</option>
                                                    <option>Other</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label htmlFor="company_size" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Company Size</label>
                                                <select id="company_size" name="company_size" value={form.company_size} onChange={handleChange}
                                                    className="w-full cursor-pointer rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-200/20">
                                                    <option value="">Select</option>
                                                    <option>1–50</option>
                                                    <option>51–200</option>
                                                    <option>201–500</option>
                                                    <option>500+</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label htmlFor="signup_password" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Password</label>
                                            <input id="signup_password" name="password" type="password" required value={form.password}
                                                onChange={handleChange} placeholder="Min. 8 characters"
                                                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-200/20"
                                            />
                                        </div>

                                        <button type="submit" disabled={loading}
                                            className="mt-1 w-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-500 py-3 text-sm font-semibold text-white shadow-2xl shadow-violet-500/20 transition duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60">
                                            {loading ? 'Creating Account...' : 'Create Account →'}
                                        </button>
                                    </form>
                                </div>
                                <p className="text-center text-sm text-slate-500">
                                    Already have an account?{' '}
                                    <Link href="/auth/login" className="font-semibold text-violet-600 hover:text-violet-700">Log in</Link>
                                </p>
                            </>
                        )}

                        {/* ── STEP 2: OTP VERIFICATION ── */}
                        {step === 'otp' && (
                            <>
                                <div className="text-center mb-2">
                                    <h3 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 mb-2">Check your inbox</h3>
                                    <p className="text-sm text-slate-600">We sent a 6-digit code to</p>
                                    <p className="text-sm font-semibold text-violet-700">{email}</p>
                                </div>
                                <div className="rounded-[2rem] border border-white/70 bg-white/90 p-8 shadow-[0_35px_120px_-40px_rgba(124,58,237,0.35)] backdrop-blur-2xl">
                                    {error && (
                                        <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm text-center">
                                            {error}
                                        </div>
                                    )}

                                    <form onSubmit={handleVerify}>
                                        <div className="flex gap-2 sm:gap-3 justify-center mb-8">
                                            {otpValues.map((val, idx) => (
                                                <input
                                                    key={idx}
                                                    id={`otp-${idx}`}
                                                    type="text"
                                                    inputMode="numeric"
                                                    maxLength={1}
                                                    value={val}
                                                    onChange={(e) => handleOtpChange(e.target.value, idx)}
                                                    onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                                                    onPaste={idx === 0 ? handleOtpPaste : undefined}
                                                    autoFocus={idx === 0}
                                                    className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl outline-none transition-all focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-200/30"
                                                />
                                            ))}
                                        </div>

                                        <button type="submit" disabled={loading || otpValues.join('').length < 6}
                                            className="w-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-500 py-3 text-sm font-semibold text-white shadow-2xl shadow-violet-500/20 transition duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60">
                                            {loading ? 'Verifying...' : 'Verify Email →'}
                                        </button>
                                    </form>

                                    <div className="text-center text-sm text-slate-500 mt-6">
                                        Didn&apos;t receive it?{' '}
                                        {resendTimer > 0 ? (
                                            <span className="text-slate-400">Resend in {resendTimer}s</span>
                                        ) : (
                                            <button onClick={handleResend} disabled={loading} className="font-semibold text-violet-600 hover:text-violet-700 bg-transparent border-none cursor-pointer">
                                                Resend code
                                            </button>
                                        )}
                                    </div>
                                    
                                    <div className="text-center mt-4">
                                        <button onClick={() => { setStep('signup'); setError(''); }} className="text-xs font-semibold text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer transition">
                                            ← Back to signup
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* ── STEP 3: SUCCESS ── */}
                        {step === 'success' && (
                            <div className="text-center py-12">
                                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-green-100 text-green-500 text-4xl mb-6 shadow-lg shadow-green-100/50">
                                    ✓
                                </div>
                                <h3 className="text-3xl font-semibold tracking-tight text-slate-900 mb-2">Verified!</h3>
                                <p className="text-sm text-slate-600">Redirecting you to login...</p>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}