'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import gsap from 'gsap';
import api from '@/lib/api';

export default function ScheduleInterviewPage() {
    const { id } = useParams();
    const router = useRouter();
    const pageRef = useRef(null);

    const [durationData, setDurationData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [useCustomDuration, setUseCustomDuration] = useState(false);
    const [customDuration, setCustomDuration] = useState(45);
    const [error, setError] = useState('');

    const today = new Date().toISOString().split('T')[0];

    const [form, setForm] = useState({
        scheduled_date: '',
        start_time: '',
    });

    useEffect(() => {
        if (!pageRef.current || loading || success) return;
        const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

        tl.fromTo('.dash-orb', { opacity: 0, scale: 0.5 }, { opacity: 0.25, scale: 1, duration: 2.5, stagger: 0.3 }, 0);
        tl.fromTo('.page-header', { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 1 }, 0.1);
        tl.fromTo('.form-card', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.1 }, 0.2);
        tl.fromTo('.summary-card', { opacity: 0, x: 30 }, { opacity: 1, x: 0, duration: 0.8, stagger: 0.1 }, 0.3);

        return () => tl.kill();
    }, [loading, success]);

    useEffect(() => {
        api.get(`/api/v1/jobs/${id}/interview/duration`)
            .then(res => {
                setDurationData(res.data);
                setCustomDuration(res.data.suggested_duration);
            })
            .catch(() => setDurationData({ suggested_duration: 45, breakdown: {} }))
            .finally(() => setLoading(false));
    }, [id]);

    const finalDuration = useCustomDuration ? customDuration : durationData?.suggested_duration || 45;

    const getEndTime = () => {
        if (!form.start_time) return '';
        const [h, m] = form.start_time.split(':').map(Number);
        const total = h * 60 + m + finalDuration;
        const endH = Math.floor(total / 60) % 24;
        const endM = total % 60;
        return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
    };

    const handleSubmit = async () => {
        if (!form.scheduled_date || !form.start_time) {
            setError('Please select both date and time');
            return;
        }
        setSubmitting(true);
        setError('');
        try {
            const payload = {
                scheduled_date: form.scheduled_date,
                start_time: form.start_time,
                custom_duration: useCustomDuration ? customDuration : null,
            };
            await api.post(`/api/v1/jobs/${id}/interview/schedule`, payload);
            setSuccess(true);
            setTimeout(() => router.push(`/dashboard/jobs/${id}`), 3000);
        } catch (err) {
            setError(err.response?.data?.detail || 'Something went wrong');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-screen bg-slate-50">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (success) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-12 max-w-md w-full text-center">
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-4xl mx-auto mb-6
          animate-bounce">
                    ✅
                </div>
                <h2 className="text-2xl font-extrabold text-[#0a1628] mb-3"
                    style={{ fontFamily: 'Syne, sans-serif' }}>
                    Interview Scheduled!
                </h2>
                <p className="text-slate-400 text-sm leading-relaxed mb-2">
                    All shortlisted candidates are being notified via email with their login credentials.
                </p>
                <p className="text-slate-400 text-sm">Redirecting back...</p>
            </div>
        </div>
    );

    const breakdown = durationData?.breakdown || {};

    return (
        <div ref={pageRef} className="min-h-screen bg-slate-50 p-6 lg:p-10 relative overflow-hidden">
            {/* Background Orbs */}
            <div className="dash-orb" style={{ position: 'absolute', top: '-10%', right: '-5%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%', zIndex: 0, filter: 'blur(60px)' }} />
            <div className="dash-orb" style={{ position: 'absolute', bottom: '-20%', left: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%', zIndex: 0, filter: 'blur(80px)' }} />

            <div style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto' }}>
                {/* Back */}
                <button onClick={() => router.push(`/dashboard/jobs/${id}`)}
                    className="flex items-center gap-2 text-sm text-slate-400 hover:text-blue-600 transition-colors bg-transparent border-none cursor-pointer mb-6 relative z-10">
                    ← Back to Job
                </button>

                {/* Header */}
                <div className="page-header mb-8">
                    <h1 className="text-3xl font-extrabold text-[#0a1628]"
                        style={{ fontFamily: 'Syne, sans-serif' }}>
                        Schedule Interview
                    </h1>
                    <p className="text-slate-400 mt-1 text-sm">
                        Set date and time — all shortlisted candidates will receive login credentials via email
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl">

                    {/* Left — Form */}
                    <div className="flex flex-col gap-5">

                        {/* Date */}
                        <div className="form-card bg-white/70 backdrop-blur-xl rounded-2xl border border-white/80 shadow-[0_8px_32px_rgba(59,130,246,0.05)] p-6">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-lg shadow-inner">
                                    📅
                                </div>
                                <div>
                                    <h3 className="font-bold text-[#0a1628] text-sm">Interview Date</h3>
                                    <p className="text-xs text-slate-400">Select the date for the interview</p>
                                </div>
                            </div>
                            <input
                                type="date"
                                min={today}
                                value={form.scheduled_date}
                                onChange={e => setForm({ ...form, scheduled_date: e.target.value })}
                                className="w-full px-4 py-3 text-sm text-[#0a1628] bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.1)] transition-all cursor-pointer"
                            />
                        </div>

                        {/* Time */}
                        <div className="form-card bg-white/70 backdrop-blur-xl rounded-2xl border border-white/80 shadow-[0_8px_32px_rgba(139,92,246,0.05)] p-6">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-10 h-10 rounded-xl bg-violet-50 border border-violet-200 flex items-center justify-center text-lg">
                                    ⏰
                                </div>
                                <div>
                                    <h3 className="font-bold text-[#0a1628] text-sm">Start Time</h3>
                                    <p className="text-xs text-slate-400">When should the interview begin?</p>
                                </div>
                            </div>
                            <input
                                type="time"
                                value={form.start_time}
                                onChange={e => setForm({ ...form, start_time: e.target.value })}
                                className="w-full px-4 py-3 text-sm text-[#0a1628] bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white focus:shadow-[0_0_0_3px_rgba(37,99,235,0.1)] transition-all cursor-pointer"
                            />
                            {form.start_time && (
                                <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                                    <span>Start: <strong className="text-[#0a1628]">{form.start_time}</strong></span>
                                    <span>→</span>
                                    <span>End: <strong className="text-[#0a1628]">{getEndTime()}</strong></span>
                                </div>
                            )}
                        </div>

                        {/* Duration */}
                        <div className="form-card bg-white/70 backdrop-blur-xl rounded-2xl border border-white/80 shadow-[0_8px_32px_rgba(245,158,11,0.05)] p-6">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-lg">
                                    ⏱️
                                </div>
                                <div>
                                    <h3 className="font-bold text-[#0a1628] text-sm">Duration</h3>
                                    <p className="text-xs text-slate-400">AI-calculated based on your questions</p>
                                </div>
                            </div>

                            {/* Suggested */}
                            <div className={`p-4 rounded-xl border-2 mb-4 cursor-pointer transition-all
              ${!useCustomDuration ? 'border-blue-500 bg-blue-50/80 shadow-md' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'}`}
                                onClick={() => setUseCustomDuration(false)}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
                      ${!useCustomDuration ? 'border-blue-500 bg-blue-500' : 'border-slate-300'}`}>
                                                {!useCustomDuration && <div className="w-2 h-2 bg-white rounded-full" />}
                                            </div>
                                            <span className="text-sm font-semibold text-[#0a1628]">
                                                AI Suggested: {durationData?.suggested_duration} minutes
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-400 mt-1 ml-6">
                                            Based on {breakdown.total_questions || 0} questions
                                            ({breakdown.verbal || 0} verbal · {breakdown.coding || 0} coding · {breakdown.mcq || 0} MCQ)
                                        </p>
                                    </div>
                                    <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                                        Recommended
                                    </span>
                                </div>
                            </div>

                            {/* Custom */}
                            <div className={`p-4 rounded-xl border-2 cursor-pointer transition-all
              ${useCustomDuration ? 'border-blue-500 bg-blue-50/80 shadow-md' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'}`}
                                onClick={() => setUseCustomDuration(true)}>
                                <div className="flex items-center gap-2 mb-3">
                                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
                  ${useCustomDuration ? 'border-blue-500 bg-blue-500' : 'border-slate-300'}`}>
                                        {useCustomDuration && <div className="w-2 h-2 bg-white rounded-full" />}
                                    </div>
                                    <span className="text-sm font-semibold text-[#0a1628]">Set Custom Duration</span>
                                </div>
                                {useCustomDuration && (
                                    <div className="ml-6">
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="range" min="15" max="180" step="15"
                                                value={customDuration}
                                                onChange={e => setCustomDuration(parseInt(e.target.value))}
                                                onClick={e => e.stopPropagation()}
                                                className="flex-1 accent-blue-600"
                                            />
                                            <span className="text-lg font-extrabold text-blue-600 w-20 text-right"
                                                style={{ fontFamily: 'Syne, sans-serif' }}>
                                                {customDuration} min
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-xs text-slate-400 mt-1">
                                            <span>15 min</span>
                                            <span>180 min</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="form-card px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Submit */}
                        <button onClick={handleSubmit} disabled={submitting}
                            className="form-card w-full py-4 text-white font-bold text-base rounded-xl transition-all hover:-translate-y-1 disabled:opacity-60 disabled:cursor-not-allowed border-none cursor-pointer"
                            style={{ background: 'linear-gradient(135deg, #2563eb, #1e40af)', boxShadow: '0 8px 24px rgba(37,99,235,0.3)', fontFamily: 'Syne, sans-serif' }}>
                            {submitting ? '⚙️ Scheduling...' : '📅 Confirm & Send Invitations →'}
                        </button>
                    </div>

                    {/* Right — Summary */}
                    <div className="flex flex-col gap-5">

                        {/* Summary Card */}
                        <div className="summary-card bg-white/70 backdrop-blur-xl rounded-2xl border border-white/80 shadow-[0_8px_32px_rgba(59,130,246,0.05)] overflow-hidden">
                            <div className="px-6 py-5" style={{ background: 'linear-gradient(135deg, #0a1628, #162847)' }}>
                                <h3 className="text-white font-bold text-base" style={{ fontFamily: 'Syne, sans-serif' }}>
                                    📋 Interview Summary
                                </h3>
                                <p className="text-white/50 text-xs mt-0.5">Review before confirming</p>
                            </div>
                            <div className="p-6 flex flex-col gap-4">
                                {[
                                    { icon: '📅', label: 'Date', value: form.scheduled_date || '—' },
                                    { icon: '⏰', label: 'Start Time', value: form.start_time || '—' },
                                    { icon: '🏁', label: 'End Time', value: form.start_time ? getEndTime() : '—' },
                                    { icon: '⏱️', label: 'Duration', value: `${finalDuration} minutes` },
                                ].map(item => (
                                    <div key={item.label} className="flex items-center justify-between py-2 border-b border-slate-100/50 last:border-0">
                                        <div className="flex items-center gap-2">
                                            <span>{item.icon}</span>
                                            <span className="text-sm text-slate-500">{item.label}</span>
                                        </div>
                                        <span className="text-sm font-semibold text-[#0a1628]">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* What happens next */}
                        <div className="summary-card bg-white/70 backdrop-blur-xl rounded-2xl border border-white/80 shadow-[0_8px_32px_rgba(139,92,246,0.05)] p-6">
                            <h3 className="font-bold text-[#0a1628] text-sm mb-4">What happens after confirming?</h3>
                            <div className="flex flex-col gap-3">
                                {[
                                    { step: '1', text: 'Interview is scheduled in the system', color: 'bg-blue-600' },
                                    { step: '2', text: 'Unique login credentials generated for each candidate', color: 'bg-violet-600' },
                                    { step: '3', text: 'Email sent to all shortlisted candidates', color: 'bg-amber-500' },
                                    { step: '4', text: 'Candidates can login only during scheduled time', color: 'bg-emerald-500' },
                                ].map(item => (
                                    <div key={item.step} className="flex items-start gap-3">
                                        <div className={`w-6 h-6 rounded-full ${item.color} text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5`}>
                                            {item.step}
                                        </div>
                                        <p className="text-sm text-slate-500 leading-relaxed">{item.text}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}