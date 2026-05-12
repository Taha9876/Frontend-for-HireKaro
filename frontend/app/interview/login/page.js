'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function InterviewLoginPage() {
    const router = useRouter();
    const [form, setForm] = useState({ username: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState(null);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/api/v1/jobs/interview/candidate-login', form);
            localStorage.setItem("interview_username", form.username);
            localStorage.setItem("interview_job_id", res.data.job_id);      // ← add
            localStorage.setItem("interview_id", res.data.interview_id);    // ← add
            setResult(res.data);

        } catch (err) {
            setError(err.response?.data?.detail || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
    };

    if (result) {
        const access = result.access;
        return (
            <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
                style={{ background: '#faf9ff' }}>

                {/* Aesthetic background flares */}
                <div className="pointer-events-none absolute inset-0 z-0">
                    <div className="absolute right-0 top-0 h-[500px] w-[500px] rounded-full blur-[100px]" style={{ background: 'rgba(127, 165, 130,0.12)' }} />
                    <div className="absolute bottom-10 left-10 h-[400px] w-[400px] rounded-full blur-[100px]" style={{ background: 'rgba(192,38,211,0.08)' }} />
                </div>

                {/* Subtile grid pattern */}
                <div className="fixed inset-0 pointer-events-none z-0"
                    style={{
                        backgroundImage: 'linear-gradient(rgba(127, 165, 130,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(127, 165, 130,0.04) 1px, transparent 1px)',
                        backgroundSize: '40px 40px'
                    }} />

                <div className="relative z-10 bg-white/70 backdrop-blur-2xl rounded-3xl shadow-xl max-w-md w-full overflow-hidden border" style={{ borderColor: 'rgba(127, 165, 130,0.15)' }}>
                    <div className={`p-8 text-center relative overflow-hidden ${access.accessible
                        ? 'bg-gradient-to-br from-emerald-50 to-emerald-100/50'
                        : access.reason === 'not_started'
                            ? 'bg-gradient-to-br from-amber-50 to-amber-100/50'
                            : 'bg-gradient-to-br from-rose-50 to-rose-100/50'}`}>

                        <div className="text-5xl mb-3 relative z-10">
                            {access.accessible ? '🚀' : access.reason === 'not_started' ? '⏳' : '🔒'}
                        </div>
                        <h2 className="text-2xl font-bold mb-1 relative z-10" style={{ color: '#1a1535' }}>
                            {access.accessible ? 'Ready to Begin!' : access.reason === 'not_started' ? 'Not Yet Started' : 'Time Expired'}
                        </h2>
                        <p className="text-sm font-medium relative z-10" style={{ color: '#64608a' }}>Welcome, {result.candidate_name}</p>
                    </div>

                    <div className="p-8">
                        <div className="flex flex-col gap-3 mb-8">
                            {[
                                { label: 'Position', value: result.job_title, icon: '💼' },
                                { label: 'Date', value: formatDate(result.scheduled_date), icon: '📅' },
                                { label: 'Time', value: result.start_time, icon: '⏰' },
                                { label: 'Duration', value: `${result.duration_minutes} minutes`, icon: '⏱️' },
                            ].map(item => (
                                <div key={item.label} className="flex items-center gap-4 py-2.5 border-b border-violet-100/50 last:border-0">
                                    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-violet-50 text-base">{item.icon}</span>
                                    <span className="text-sm font-medium w-20" style={{ color: '#8a85a3' }}>{item.label}</span>
                                    <span className="text-sm font-bold text-slate-800">{item.value}</span>
                                </div>
                            ))}
                        </div>

                        {access.accessible ? (
                            <button
                                onClick={() => router.push('/interview/room')}
                                className="w-full py-3.5 text-white font-bold text-sm rounded-xl cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2"
                                style={{ background: 'linear-gradient(135deg, #7FA582, #F4A28C)', boxShadow: '0 8px 24px rgba(127, 165, 130,0.25)' }}>
                                Start Interview <span className="ml-1">→</span>
                            </button>
                        ) : (
                            <div className={`p-4 rounded-xl text-center text-sm font-semibold
                                ${access.reason === 'not_started'
                                    ? 'bg-amber-50 text-amber-600 border border-amber-200'
                                    : 'bg-rose-50 text-rose-600 border border-rose-200'}`}>
                                {access.message}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
            style={{ background: '#faf9ff' }}>

            {/* Aesthetic background flares */}
            <div className="pointer-events-none absolute inset-0 z-0">
                <div className="absolute top-[-10%] right-[-5%] h-[600px] w-[600px] rounded-full blur-[120px]" style={{ background: 'rgba(127, 165, 130,0.1)' }} />
                <div className="absolute bottom-[-10%] left-[-5%] h-[500px] w-[500px] rounded-full blur-[100px]" style={{ background: 'rgba(192,38,211,0.08)' }} />
            </div>

            {/* Subtile grid pattern */}
            <div className="fixed inset-0 pointer-events-none z-0"
                style={{
                    backgroundImage: 'linear-gradient(rgba(127, 165, 130,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(127, 165, 130,0.04) 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }} />

            <div className="relative z-10 w-full max-w-md">

                {/* Branding above box */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 shadow-lg text-2xl bg-white border" style={{ borderColor: 'rgba(127, 165, 130,0.15)', boxShadow: '0 10px 30px rgba(127, 165, 130,0.15)' }}>
                        🧠
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight mb-2" style={{ color: '#1a1535' }}>
                        Interview <span className="gradient-text">Portal</span>
                    </h1>
                    <p className="text-sm font-medium" style={{ color: '#8a85a3' }}>Validate your credentials to enter the secure room</p>
                </div>

                {/* Login Box */}
                <div className="bg-white/70 backdrop-blur-2xl rounded-3xl shadow-xl overflow-hidden border p-8" style={{ borderColor: 'rgba(127, 165, 130,0.15)' }}>

                    {error && (
                        <div className="mb-6 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-sm font-medium text-center shadow-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="flex flex-col gap-5">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#64608a' }}>Username</label>
                            <input
                                type="text" required value={form.username}
                                onChange={e => setForm({ ...form, username: e.target.value })}
                                placeholder="Enter interview username"
                                className="w-full px-4 py-3.5 text-sm font-medium bg-white border rounded-xl outline-none transition-all focus:bg-white placeholder:text-slate-300"
                                style={{ borderColor: 'rgba(127, 165, 130,0.2)', color: '#1a1535' }}
                                onFocus={(e) => { e.target.style.borderColor = '#7FA582'; e.target.style.boxShadow = '0 0 0 4px rgba(127, 165, 130,0.1)'; }}
                                onBlur={(e) => { e.target.style.borderColor = 'rgba(127, 165, 130,0.2)'; e.target.style.boxShadow = 'none'; }}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#64608a' }}>Code / Password</label>
                            <input
                                type="password" required value={form.password}
                                onChange={e => setForm({ ...form, password: e.target.value })}
                                placeholder="••••••••"
                                className="w-full px-4 py-3.5 text-sm font-medium bg-white border rounded-xl outline-none transition-all focus:bg-white placeholder:text-slate-300"
                                style={{ borderColor: 'rgba(127, 165, 130,0.2)', color: '#1a1535' }}
                                onFocus={(e) => { e.target.style.borderColor = '#7FA582'; e.target.style.boxShadow = '0 0 0 4px rgba(127, 165, 130,0.1)'; }}
                                onBlur={(e) => { e.target.style.borderColor = 'rgba(127, 165, 130,0.2)'; e.target.style.boxShadow = 'none'; }}
                            />
                        </div>
                        <button type="submit" disabled={loading}
                            className="w-full mt-2 py-3.5 text-white font-bold text-sm rounded-xl cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                            style={{ background: 'linear-gradient(135deg, #7FA582, #F4A28C)', boxShadow: '0 8px 24px rgba(127, 165, 130,0.25)' }}>
                            {loading ? 'Verifying...' : 'Access Interview'}
                        </button>
                    </form>

                    <p className="text-center text-xs font-medium mt-8" style={{ color: '#8a85a3' }}>
                        Credentials were sent to your email securely.
                    </p>
                </div>
            </div>
        </div>
    );
}