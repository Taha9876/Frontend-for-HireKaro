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
    const [fieldErrors, setFieldErrors] = useState({ email: '', password: '' });
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
        // Clear field-specific error on change
        if (e.target.name === 'email' || e.target.name === 'password') {
            setFieldErrors(prev => ({ ...prev, [e.target.name]: '' }));
        }
    };

    const validateForm = () => {
        const errors = { email: '', password: '' };
        let isValid = true;

        // Email validation: must contain @ with text before and after
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(form.email)) {
            errors.email = 'Please enter a valid email address (e.g. you@company.com)';
            isValid = false;
        }

        // Password validation: min 8 chars, at least 1 letter, 1 digit, 1 special character
        const minLength = form.password.length >= 8;
        const hasLetter = /[a-zA-Z]/.test(form.password);
        const hasDigit = /\d/.test(form.password);
        const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(form.password);

        if (!minLength || !hasLetter || !hasDigit || !hasSpecial) {
            const missing = [];
            if (!minLength) missing.push('at least 8 characters');
            if (!hasLetter) missing.push('a letter');
            if (!hasDigit) missing.push('a number');
            if (!hasSpecial) missing.push('a special character (!@#$%…)');
            errors.password = `Password must contain ${missing.join(', ')}`;
            isValid = false;
        }

        setFieldErrors(errors);
        return isValid;
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');
        if (!validateForm()) return;
        setLoading(true);
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

    const inputCls = "w-full rounded-xl border border-[#1C1B2E]/10 bg-white px-4 py-3 text-sm text-[#1C1B2E] placeholder:text-[#807E94] outline-none transition focus:border-[#7FA582] focus:ring-4 focus:ring-[#9DBF9E]/20";
    const inputErrorCls = "w-full rounded-xl border border-[#E88A72] bg-white px-4 py-3 text-sm text-[#1C1B2E] placeholder:text-[#807E94] outline-none transition focus:border-[#E88A72] focus:ring-4 focus:ring-[#F4A28C]/20";
    const labelCls = "mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#4A4860]";
    const fieldErrorCls = "mt-1.5 flex items-start gap-1.5 text-xs text-[#B85A3F]";
    const primaryBtn = "w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#1C1B2E] py-3 text-sm font-semibold text-white shadow-lg shadow-[#1C1B2E]/20 transition duration-300 hover:-translate-y-0.5 hover:shadow-2xl disabled:cursor-not-allowed disabled:opacity-60";

    return (
        <div ref={pageRef} className="relative min-h-screen overflow-hidden bg-white px-4 pb-12 pt-28 text-[#1C1B2E]">
            {/* Hero-style layered ribbon background */}
            <div className="absolute inset-0 -z-0 overflow-hidden pointer-events-none" aria-hidden="true">
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
                    <defs>
                        <linearGradient id="sSage" x1="0%" x2="100%"><stop offset="0%" stopColor="#9DBF9E" stopOpacity="0"/><stop offset="25%" stopColor="#9DBF9E" stopOpacity="0.75"/><stop offset="80%" stopColor="#7FA582" stopOpacity="0.75"/><stop offset="100%" stopColor="#7FA582" stopOpacity="0"/></linearGradient>
                        <linearGradient id="sMint" x1="0%" x2="100%"><stop offset="0%" stopColor="#9AD0C2" stopOpacity="0"/><stop offset="25%" stopColor="#9AD0C2" stopOpacity="0.70"/><stop offset="80%" stopColor="#BFE3D6" stopOpacity="0.70"/><stop offset="100%" stopColor="#9AD0C2" stopOpacity="0"/></linearGradient>
                        <linearGradient id="sYellow" x1="0%" x2="100%"><stop offset="0%" stopColor="#F4D58D" stopOpacity="0"/><stop offset="25%" stopColor="#F4D58D" stopOpacity="0.75"/><stop offset="80%" stopColor="#F8E2A8" stopOpacity="0.75"/><stop offset="100%" stopColor="#F4D58D" stopOpacity="0"/></linearGradient>
                        <linearGradient id="sCoral" x1="0%" x2="100%"><stop offset="0%" stopColor="#F4A28C" stopOpacity="0"/><stop offset="25%" stopColor="#F4A28C" stopOpacity="0.78"/><stop offset="80%" stopColor="#F4B58A" stopOpacity="0.72"/><stop offset="100%" stopColor="#F4A28C" stopOpacity="0"/></linearGradient>
                        <filter id="sSoft" x="-10%" y="-50%" width="120%" height="200%"><feGaussianBlur stdDeviation="22"/></filter>
                    </defs>
                    <g transform="rotate(-12 720 450)" filter="url(#sSoft)">
                        <rect x="-300" y="500" width="2200" height="80" fill="url(#sSage)"/>
                        <rect x="-300" y="595" width="2200" height="75" fill="url(#sMint)"/>
                        <rect x="-300" y="685" width="2200" height="85" fill="url(#sYellow)"/>
                        <rect x="-300" y="785" width="2200" height="95" fill="url(#sCoral)"/>
                    </g>
                </svg>
            </div>

            <div className="relative z-10 mx-auto grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-[#1C1B2E]/10 bg-white/85 shadow-[0_40px_120px_-40px_rgba(28,27,46,0.25)] backdrop-blur-xl lg:grid-cols-[1.05fr_1fr]">

                {/* ── LEFT: brand panel ── */}
                <div className="auth-enter relative hidden flex-col justify-between overflow-hidden bg-[#FBF8F2] p-10 lg:flex">
                    <div className="absolute inset-0 pointer-events-none opacity-60" aria-hidden="true">
                        <div className="absolute -top-10 -right-10 w-60 h-60 rounded-full blur-3xl" style={{ background: 'radial-gradient(circle, rgba(244,213,141,0.55), rgba(244,213,141,0) 70%)' }}/>
                        <div className="absolute -bottom-10 -left-10 w-72 h-72 rounded-full blur-3xl" style={{ background: 'radial-gradient(circle, rgba(157,191,158,0.55), rgba(157,191,158,0) 70%)' }}/>
                        <div className="absolute top-1/2 right-1/4 w-48 h-48 rounded-full blur-3xl" style={{ background: 'radial-gradient(circle, rgba(244,162,140,0.40), rgba(244,162,140,0) 70%)' }}/>
                    </div>
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
                                <span className="italic bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(95deg,#F4A28C 0%,#F4D58D 45%,#9DBF9E 80%,#C4B5E0 100%)' }}>Start</span> your team.
                            </h2>
                            <p className="mt-4 max-w-sm text-sm text-[#4A4860] leading-relaxed">Create a verified hiring workspace with candidate intelligence, interview tracking, and real-time team collaboration — fairness built in.</p>
                        </div>

                        <div className="grid gap-3">
                            <div className="rounded-2xl border border-[#1C1B2E]/8 bg-white/90 p-5 shadow-sm">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#7FA582]" />
                                    <p className="text-[10px] uppercase tracking-[0.22em] text-[#4A4860] font-semibold">Built for scale</p>
                                </div>
                                <p className="text-sm text-[#1C1B2E] leading-snug">A modern recruitment hub that keeps your team aligned and your hiring decisions consistent.</p>
                            </div>
                            <div className="rounded-2xl border border-[#1C1B2E]/8 bg-white/90 p-5 shadow-sm">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#E9C26A]" />
                                    <p className="text-[10px] uppercase tracking-[0.22em] text-[#4A4860] font-semibold">Conversion focused</p>
                                </div>
                                <p className="text-sm text-[#1C1B2E] leading-snug">A clean onboarding experience designed to reduce friction and convert more teams.</p>
                            </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-2xl bg-white p-5 border border-[#1C1B2E]/8 shadow-sm">
                                <p className="text-3xl font-extrabold bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg,#7FA582,#F4D58D)' }}>+22%</p>
                                <p className="mt-1 text-xs text-[#4A4860]">Faster team activation</p>
                            </div>
                            <div className="rounded-2xl bg-white p-5 border border-[#1C1B2E]/8 shadow-sm">
                                <p className="text-3xl font-extrabold bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg,#F4A28C,#E9C26A)' }}>98%</p>
                                <p className="mt-1 text-xs text-[#4A4860]">Clean onboarding completion</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── RIGHT: Form / OTP / Success ── */}
                <div className="auth-enter relative p-6 sm:p-8 md:p-12 bg-white">
                    <div className="relative z-10 flex flex-col gap-8 h-full justify-center">

                        {/* ── STEP 1: SIGNUP FORM ── */}
                        {step === 'signup' && (
                            <>
                                <div className="max-w-xl">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#7FA582]">Premium onboarding</p>
                                    <h3
                                        className="mt-2 text-4xl font-medium tracking-[-0.02em] text-[#1C1B2E]"
                                        style={{ fontFamily: 'var(--font-serif), ui-serif, Georgia, serif' }}
                                    >
                                        Create account
                                    </h3>
                                    <p className="mt-3 text-sm text-[#4A4860]">Set up your hiring workspace, manage teams, and unlock AI-assisted recruitment workflows.</p>
                                </div>

                                <div className="rounded-2xl border border-[#1C1B2E]/10 bg-[#FBF8F2]/60 p-6 sm:p-8 shadow-[0_30px_90px_-40px_rgba(28,27,46,0.25)] backdrop-blur-xl">
                                    {error && (
                                        <div className="mb-5 px-4 py-3 bg-[#F4A28C]/20 border border-[#E88A72]/40 rounded-lg text-[#B85A3F] text-sm">
                                            {error}
                                        </div>
                                    )}

                                    <form onSubmit={handleSignup} className="flex flex-col gap-4">
                                        <div>
                                            <label htmlFor="company_name" className={labelCls}>Company Name</label>
                                            <input id="company_name" name="company_name" required value={form.company_name}
                                                onChange={handleChange} placeholder="Acme Corporation" className={inputCls}/>
                                        </div>
                                        <div>
                                            <label htmlFor="signup_email" className={labelCls}>Work Email</label>
                                            <input id="signup_email" name="email" type="email" required value={form.email}
                                                onChange={handleChange} placeholder="you@company.com" className={fieldErrors.email ? inputErrorCls : inputCls}/>
                                            {fieldErrors.email && (
                                                <p className={fieldErrorCls}>
                                                    <svg className="w-3.5 h-3.5 mt-0.5 shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/></svg>
                                                    {fieldErrors.email}
                                                </p>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label htmlFor="industry" className={labelCls}>Industry</label>
                                                <select id="industry" name="industry" value={form.industry} onChange={handleChange} className={`${inputCls} cursor-pointer`}>
                                                    <option value="">Select</option>
                                                    <option>Technology</option>
                                                    <option>Finance</option>
                                                    <option>Healthcare</option>
                                                    <option>Education</option>
                                                    <option>Other</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label htmlFor="company_size" className={labelCls}>Company Size</label>
                                                <select id="company_size" name="company_size" value={form.company_size} onChange={handleChange} className={`${inputCls} cursor-pointer`}>
                                                    <option value="">Select</option>
                                                    <option>1–50</option>
                                                    <option>51–200</option>
                                                    <option>201–500</option>
                                                    <option>500+</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label htmlFor="signup_password" className={labelCls}>Password</label>
                                            <input id="signup_password" name="password" type="password" required value={form.password}
                                                onChange={handleChange} placeholder="Min. 8 characters" className={fieldErrors.password ? inputErrorCls : inputCls}/>
                                            {fieldErrors.password && (
                                                <p className={fieldErrorCls}>
                                                    <svg className="w-3.5 h-3.5 mt-0.5 shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/></svg>
                                                    {fieldErrors.password}
                                                </p>
                                            )}
                                            <p className="mt-1.5 text-[10px] text-[#807E94]">Min. 8 chars, with letters, numbers & a special character</p>
                                        </div>

                                        <button type="submit" disabled={loading} className={`${primaryBtn} mt-2`}>
                                            {loading ? 'Creating Account…' : <>Create Account <span aria-hidden>→</span></>}
                                        </button>
                                    </form>
                                </div>

                                <p className="text-center text-sm text-[#4A4860]">
                                    Already have an account?{' '}
                                    <Link href="/auth/login" className="font-semibold text-[#1C1B2E] underline decoration-[#7FA582] decoration-2 underline-offset-4 hover:decoration-[#F4A28C]">Log in</Link>
                                </p>
                            </>
                        )}

                        {/* ── STEP 2: OTP VERIFICATION ── */}
                        {step === 'otp' && (
                            <>
                                <div className="text-center mb-2">
                                    <h3 className="text-4xl font-medium tracking-[-0.02em] text-[#1C1B2E] mb-2" style={{ fontFamily: 'var(--font-serif), ui-serif, Georgia, serif' }}>Check your inbox</h3>
                                    <p className="text-sm text-[#4A4860]">We sent a 6-digit code to</p>
                                    <p className="text-sm font-semibold text-[#7FA582]">{email}</p>
                                </div>

                                <div className="rounded-2xl border border-[#1C1B2E]/10 bg-[#FBF8F2]/60 p-6 sm:p-8 shadow-[0_30px_90px_-40px_rgba(28,27,46,0.25)] backdrop-blur-xl">
                                    {error && (
                                        <div className="mb-5 px-4 py-3 bg-[#F4A28C]/20 border border-[#E88A72]/40 rounded-lg text-[#B85A3F] text-sm text-center">
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
                                                    className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold text-[#1C1B2E] bg-white border border-[#1C1B2E]/10 rounded-xl outline-none transition-all focus:border-[#7FA582] focus:ring-4 focus:ring-[#9DBF9E]/25"
                                                />
                                            ))}
                                        </div>

                                        <button type="submit" disabled={loading || otpValues.join('').length < 6} className={primaryBtn}>
                                            {loading ? 'Verifying…' : <>Verify Email <span aria-hidden>→</span></>}
                                        </button>
                                    </form>

                                    <div className="text-center text-sm text-[#4A4860] mt-6">
                                        Didn&apos;t receive it?{' '}
                                        {resendTimer > 0 ? (
                                            <span className="text-[#807E94]">Resend in {resendTimer}s</span>
                                        ) : (
                                            <button onClick={handleResend} disabled={loading} className="font-semibold text-[#7FA582] hover:text-[#1C1B2E] bg-transparent border-none cursor-pointer transition">
                                                Resend code
                                            </button>
                                        )}
                                    </div>

                                    <div className="text-center mt-4">
                                        <button onClick={() => { setStep('signup'); setError(''); }} className="text-xs font-semibold text-[#807E94] hover:text-[#1C1B2E] bg-transparent border-none cursor-pointer transition">
                                            ← Back to signup
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* ── STEP 3: SUCCESS ── */}
                        {step === 'success' && (
                            <div className="text-center py-12">
                                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-[#9DBF9E]/25 border border-[#7FA582]/40 text-[#7FA582] text-4xl mb-6 shadow-sm">
                                    ✓
                                </div>
                                <h3 className="text-4xl font-medium tracking-[-0.02em] text-[#1C1B2E] mb-2" style={{ fontFamily: 'var(--font-serif), ui-serif, Georgia, serif' }}>Verified!</h3>
                                <p className="text-sm text-[#4A4860]">Redirecting you to login…</p>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}