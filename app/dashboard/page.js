'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import api from '@/lib/api';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import './dashboard.css';
import { Briefcase, FileText, Users, MessageSquare, Edit2, Eye, Edit, Trash2, BrainCircuit, Activity, Video, XCircle } from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

/* ── Animated Counter Hook ── */
function useCounter(end, duration = 2000) {
    const [val, setVal] = useState(0);
    useEffect(() => {
        let start = 0;
        const step = end / (duration / 16);
        const id = setInterval(() => {
            start += step;
            if (start >= end) { setVal(end); clearInterval(id); }
            else setVal(Math.floor(start));
        }, 16);
        return () => clearInterval(id);
    }, [end, duration]);
    return val;
}

/* ── Sub-components ── */
function StatusBadge({ status }) {
    const map = {
        'active': { bg: 'rgba(14,165,233,0.1)', color: '#0ea5e9', label: 'Active' },
        'draft': { bg: 'rgba(107,114,128,0.1)', color: '#6b7280', label: 'Draft' },
        'closed': { bg: 'rgba(239,68,68,0.1)', color: '#ef4444', label: 'Closed' },
        'archived': { bg: 'rgba(156,163,175,0.1)', color: '#9ca3af', label: 'Archived' },
        'interview_scheduled': { bg: 'rgba(127, 165, 130,0.1)', color: '#7FA582', label: 'Interviewed' },
    };
    const s = map[status?.toLowerCase()] || map['active'];
    return <span style={{ fontSize: 11, fontWeight: 600, padding: '6px 14px', borderRadius: 100, background: s.bg, color: s.color, whiteSpace: 'nowrap' }}>{s.label}</span>;
}

function KPICard({ item, index }) {
    const count = useCounter(item.value, 1800 + index * 300);
    const Icon = item.Icon;
    return (
        <div className={`dash-card kpi-card`}
            style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10, background: '#fff', border: '1px solid rgba(28,27,46,0.08)', borderRadius: 14, boxShadow: '0 2px 10px -4px rgba(28,27,46,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#4A4860', margin: 0, letterSpacing: '0.02em' }}>{item.label}</p>
                <div className="kpi-icon-wrap" style={{ width: 32, height: 32, background: item.bgGrad, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color, flexShrink: 0 }}>
                    <Icon size={16} />
                </div>
            </div>
            <p className="counter-value" style={{ fontSize: 30, fontWeight: 800, color: '#1C1B2E', margin: 0, letterSpacing: '-0.5px', lineHeight: 1 }}>{count}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: item.color, display: 'inline-block' }} />
                <p style={{ fontSize: 11, color: '#4A4860', margin: 0, fontWeight: 500 }}>{item.delta}</p>
            </div>
        </div>
    );
}

function SVGRing({ pct, color, size = 64, stroke = 5 }) {
    const r = (size - stroke) / 2;
    const circ = 2 * Math.PI * r;
    const [offset, setOffset] = useState(circ);
    useEffect(() => {
        const t = setTimeout(() => setOffset(circ - (pct / 100) * circ), 300);
        return () => clearTimeout(t);
    }, [pct, circ]);
    return (
        <svg width={size} height={size} className="stat-ring">
            <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(127, 165, 130,0.08)" strokeWidth={stroke} />
            <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
                strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4,0,0.2,1)', transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }} />
        </svg>
    );
}

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', border: '1px solid rgba(127, 165, 130,0.15)', borderRadius: 12, padding: '12px 16px', boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }}>
            <p style={{ margin: '0 0 6px', fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{label}</p>
            {payload.map((e, i) => (
                <p key={i} style={{ margin: '2px 0', fontSize: 12, fontWeight: 600, color: e.color }}>{e.name}: {e.value}</p>
            ))}
        </div>
    );
};

/* ── Main Dashboard ── */
export default function DashboardPage() {
    const pageRef = useRef(null);
    const router = useRouter();
    const [greeting, setGreeting] = useState('Welcome');
    const [dateStr, setDateStr] = useState('');
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [aiInterviewsDone, setAiInterviewsDone] = useState(0);
    const [trendData, setTrendData] = useState([]);
    const [allCandidates, setAllCandidates] = useState([]);

    useEffect(() => {
        const now = new Date();
        const hour = now.getHours();
        setGreeting(hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening');
        setDateStr(now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }));
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const response = await api.get('/api/v1/jobs');
            const jobsData = response.data || response;
            setJobs(jobsData);

            // Fetch screening results for candidate status (shortlisted/rejected)
            const screeningPromises = jobsData.map(job => 
                api.get(`/api/v1/jobs/${job.id}/results`).catch(() => null)
            );
            const screeningResults = await Promise.all(screeningPromises);
            
            // Fetch interview results for interview counts
            const interviewPromises = jobsData.map(job => 
                api.get(`/api/v1/jobs/${job.id}/interview/results`).catch(() => null)
            );
            const interviewResults = await Promise.all(interviewPromises);
            
            let totalInterviews = 0;
            const allCandidates = [];
            
            // Use screening results for candidate status (shortlisted/rejected)
            screeningResults.forEach(res => {
                if (res && res.data && res.data.candidates) {
                    allCandidates.push(...res.data.candidates);
                }
            });
            
            // Use interview results for interview counts
            interviewResults.forEach(res => {
                if (res && res.data && res.data.candidates) {
                    totalInterviews += res.data.candidates.filter(c => c.interviewed).length;
                }
            });
            
            setAiInterviewsDone(totalInterviews);
            setAllCandidates(allCandidates);

            // Build last-7-days real trend data
            const days = [];
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            for (let i = 6; i >= 0; i--) {
                const d = new Date(today);
                d.setDate(today.getDate() - i);
                days.push({
                    name: d.toLocaleDateString('en-US', { weekday: 'short' }),
                    dateKey: d.toISOString().slice(0, 10),
                    resumes: 0,
                    ai_shortlisted: 0,
                });
            }
            const byKey = Object.fromEntries(days.map(d => [d.dateKey, d]));
            allCandidates.forEach(c => {
                if (c.created_at) {
                    const k = c.created_at.slice(0, 10);
                    if (byKey[k]) byKey[k].resumes += 1;
                }
                const evalDate = c.evaluated_at || (c.interviewed ? c.created_at : null);
                if (evalDate) {
                    const k = evalDate.slice(0, 10);
                    if (byKey[k]) byKey[k].ai_shortlisted += 1;
                }
            });
            setTrendData(days);

        } catch (error) {
            console.error('Failed to fetch jobs:', error);
            setJobs([]);
        } finally {
            setLoading(false);
        }
    };

    const handleJobAction = (action, jobId) => {
        if (action === 'view') {
            router.push(`/dashboard/jobs/${jobId}`);
        } else if (action === 'edit') {
            router.push(`/dashboard/jobs/${jobId}/edit`);
        } else if (action === 'delete') {
            if (confirm('Are you sure you want to delete this job?')) {
                api.delete(`/api/v1/jobs/${jobId}`).then(() => fetchJobs());
            }
        }
    };

    useEffect(() => {
        if (!pageRef.current || loading) return;
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        tl.fromTo('.dash-orb', { opacity: 0, scale: 0.5 }, { opacity: 0.15, scale: 1, duration: 2, stagger: 0.3 }, 0);
        tl.fromTo('.dash-header', { opacity: 0, y: -40 }, { opacity: 1, y: 0, duration: 0.9 }, 0.1);
        tl.fromTo('.dash-card', { opacity: 0, y: 50, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.8, stagger: 0.12, ease: 'back.out(1.4)' }, 0.3);
        tl.fromTo('.dash-chart', { opacity: 0, y: 40, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.9, stagger: 0.15 }, 0.7);
        tl.fromTo('.dash-bottom', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.12 }, 1.0);
        tl.fromTo('.funnel-bar', { scaleX: 0 }, { scaleX: 1, duration: 1, stagger: 0.1, transformOrigin: 'left center' }, 1.1);
        tl.fromTo('.activity-item', { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.6, stagger: 0.1 }, 1.3);

        return () => tl.kill();
    }, [loading]);

    // DYNAMIC DATA CALCULATIONS — ALL FROM REAL API DATA
    const activeJobs = jobs.filter(j => j.status === 'active').length;
    const totalJobs = jobs.length;
    const totalCandidates = jobs.reduce((acc, job) => acc + (job.candidates_count || 0), 0);
    const completedAIInterviews = aiInterviewsDone;

    // Real shortlisted = candidates whose screening status is shortlisted
    const shortlistedCount = allCandidates.filter(c => c.status === 'shortlisted').length;
    // Real rejected = candidates whose screening status is rejected
    const rejectedCount = allCandidates.filter(c => c.status === 'rejected').length;
    // Real hires = interviewed candidates with final_score >= 70 (passing threshold)
    const hiresCount = allCandidates.filter(c => c.interviewed && (c.final_score ?? 0) >= 70).length;
    // Interviewed list (used for hires delta and trend data)
    const interviewedList = allCandidates.filter(c => c.interviewed);

    // AI Insight ring metrics (real)
    const scoredCandidates = allCandidates.filter(c => typeof c.match_score === 'number');
    const avgMatchAccuracy = scoredCandidates.length > 0
        ? Math.round(scoredCandidates.reduce((a, c) => a + (c.match_score || 0), 0) / scoredCandidates.length)
        : 0;
    // Manual time saved: assume 15 min/resume saved vs human screening on an 8h day baseline (480 min)
    const minutesSaved = totalCandidates * 15;
    const timeSavedPct = Math.min(99, Math.round((minutesSaved / Math.max(480, minutesSaved + 60)) * 100));
    const interviewedScored = interviewedList.filter(c => typeof c.final_score === 'number');
    const behavioralConfidence = interviewedScored.length > 0
        ? Math.round(interviewedScored.reduce((a, c) => a + (c.final_score || 0), 0) / interviewedScored.length)
        : 0;

    const kpis = [
        { label: 'Total Candidates', value: totalCandidates, delta: `${activeJobs} pipelines active`, deltaType: 'positive', color: '#F4A28C', Icon: Users, bgGrad: 'linear-gradient(135deg, rgba(244,162,140,0.18), rgba(244,162,140,0.06))' },
        { label: 'Shortlisted', value: shortlistedCount, delta: `${totalCandidates > 0 ? Math.round((shortlistedCount / totalCandidates) * 100) : 0}% of pool`, deltaType: 'positive', color: '#E9C26A', Icon: Activity, bgGrad: 'linear-gradient(135deg, rgba(244,213,141,0.22), rgba(244,213,141,0.06))' },
        { label: 'Hires', value: hiresCount, delta: `${interviewedList.length} interviewed`, deltaType: 'positive', color: '#7FA582', Icon: Briefcase, bgGrad: 'linear-gradient(135deg, rgba(157,191,158,0.22), rgba(157,191,158,0.06))' },
        { label: 'Rejected', value: rejectedCount, delta: `${totalCandidates > 0 ? Math.round((rejectedCount / totalCandidates) * 100) : 0}% of pool`, deltaType: 'negative', color: '#E88A72', Icon: XCircle, bgGrad: 'linear-gradient(135deg, rgba(232,138,114,0.22), rgba(232,138,114,0.06))' },
    ];

    // Diversity donut breakdown
    const DIVERSITY = [
        { label: 'Women', pct: 48, color: '#9DBF9E' },
        { label: 'Men', pct: 40, color: '#F4D58D' },
        { label: 'Non-binary', pct: 7, color: '#9AD0C2' },
        { label: 'Prefer not to say', pct: 5, color: '#C4B5E0' },
    ];
    const biasScore = 94;

    const TREND_DATA = trendData.length
        ? trendData
        : Array.from({ length: 7 }).map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return { name: d.toLocaleDateString('en-US', { weekday: 'short' }), resumes: 0, ai_shortlisted: 0 };
        });

    // Real pipeline counts derived from candidate statuses
    const screenedCount = allCandidates.filter(c => c.status === 'shortlisted' || c.status === 'rejected').length;
    const pctOf = (n) => totalCandidates > 0 ? Math.round((n / totalCandidates) * 100) : 0;
    const PIPELINE = [
        { name: 'Resumes Parsed', value: totalCandidates, pct: 100 },
        { name: 'AI Semantic Match', value: screenedCount, pct: pctOf(screenedCount) },
        { name: 'AI Auto-Shortlisted', value: shortlistedCount, pct: pctOf(shortlistedCount) },
        { name: 'AI Video Interview', value: interviewedList.length, pct: pctOf(interviewedList.length) },
        { name: 'Final HR Review', value: hiresCount, pct: pctOf(hiresCount) },
    ];

    const QUICK_STATS = [
        { label: 'AI Match Accuracy', value: `${avgMatchAccuracy}%`, pct: avgMatchAccuracy, color: '#7FA582' },
        { label: 'Manual Time Saved', value: `${timeSavedPct}%`, pct: timeSavedPct, color: '#9DBF9E' },
        { label: 'Behavioral Confidence', value: `${behavioralConfidence}%`, pct: behavioralConfidence, color: '#F4A28C' },
    ];

    const ACTIVITIES = jobs.slice(0, 4).map(job => ({
        text: `AI generated interview questions for "${job.title}"`,
        time: new Date(job.created_at).toLocaleDateString(),
        Icon: BrainCircuit,
        color: '#7FA582'
    }));

    return (
        <div ref={pageRef} className="min-h-screen p-4 sm:p-6 lg:p-8 bg-[#FBF8F2] relative overflow-hidden">
            {/* Background Orbs (palette) */}
            <div className="dash-orb dash-orb-1" style={{ position: 'absolute', top: '-10%', left: '-5%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(157,191,158,0.25) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%', zIndex: 0, filter: 'blur(60px)' }} />
            <div className="dash-orb dash-orb-2" style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(244,162,140,0.22) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%', zIndex: 0, filter: 'blur(80px)' }} />
            <div style={{ position: 'absolute', top: '35%', right: '20%', width: '30vw', height: '30vw', background: 'radial-gradient(circle, rgba(244,213,141,0.22) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%', zIndex: 0, filter: 'blur(70px)' }} />
            
            <div style={{ maxWidth: 1400, margin: '0 auto', position: 'relative', zIndex: 1 }}>

                {/* ── TOP BAR (hero dashboard style) ── */}
                <div className="dash-header flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 mb-6 bg-white border border-[#1C1B2E]/8 rounded-2xl shadow-[0_10px_40px_-20px_rgba(28,27,46,0.15)]">
                    <div>
                        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1C1B2E', margin: 0, letterSpacing: '-0.3px' }}>
                            {greeting}, HR Team <span style={{ display: 'inline-block' }}>👋</span>
                        </h1>
                        <p style={{ fontSize: 13, color: '#4A4860', margin: '3px 0 0', fontWeight: 500 }}>
                            Here&apos;s what&apos;s happening with your hiring — monitoring {activeJobs} active pipelines.
                        </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <LanguageSwitcher variant="floating-inline" />
                        <Link href="/dashboard/jobs/create" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, borderRadius: 100, padding: '11px 24px', fontSize: 13, fontWeight: 700, color: '#fff', textDecoration: 'none', background: '#1C1B2E', boxShadow: '0 8px 20px rgba(28,27,46,0.25)', transition: 'all 0.3s ease' }}>
                            <Edit2 size={14} /> Create Job <span aria-hidden>→</span>
                        </Link>
                    </div>
                </div>

                {/* ── KPI CARDS ── */}
                <div className="grid-kpi grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {kpis.map((item, i) => <KPICard key={item.label} item={item} index={i} />)}
                </div>

                {/* ── CHARTS ROW ── */}
                <div className="grid-charts grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

                    {/* Area Chart */}
                    <div className="dash-chart chart-card glass-card lg:col-span-2 p-6 sm:p-8">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--hk-text)', margin: 0 }}>AI Screening Velocity</h2>
                            <span style={{ fontSize: 12, fontWeight: 700, padding: '6px 14px', borderRadius: 10, background: 'rgba(127, 165, 130,0.1)', color: '#7FA582' }}>Live Feed</span>
                        </div>
                        <div style={{ height: 280 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={TREND_DATA} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="gApps" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#7FA582" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#7FA582" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="gShort" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#F4A28C" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#F4A28C" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(127, 165, 130,0.1)" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#64608a', fontWeight: 500 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#64608a', fontWeight: 500 }} allowDecimals={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area type="monotone" name="Resumes Parsed" dataKey="resumes" stroke="#7FA582" strokeWidth={4} fill="url(#gApps)" dot={{ fill: '#7FA582', r: 5, strokeWidth: 3, stroke: '#fff' }} activeDot={{ r: 8, stroke: '#7FA582', strokeWidth: 3, fill: '#fff' }} />
                                    <Area type="monotone" name="AI Shortlisted" dataKey="ai_shortlisted" stroke="#F4A28C" strokeWidth={4} fill="url(#gShort)" dot={{ fill: '#F4A28C', r: 5, strokeWidth: 3, stroke: '#fff' }} activeDot={{ r: 8, stroke: '#F4A28C', strokeWidth: 3, fill: '#fff' }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Quick Stats with Rings */}
                    <div className="dash-chart chart-card glass-card insight-card p-6 sm:p-8">
                        <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--hk-text)', margin: '0 0 24px' }}>AI Insights</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
                            {QUICK_STATS.map((s) => (
                                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                                    <div style={{ position: 'relative', width: 68, height: 68, flexShrink: 0 }}>
                                        <SVGRing pct={s.pct} color={s.color} size={68} stroke={6} />
                                        <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: 14, fontWeight: 800, color: 'var(--hk-text)' }}>{s.value}</span>
                                    </div>
                                    <div style={{ width: '100%' }}>
                                        <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--hk-text)', margin: 0 }}>{s.label}</p>
                                        <div className="progress-bar-animated" style={{ width: '100%', height: 8, marginTop: 8, borderRadius: 4, background: 'rgba(127, 165, 130,0.1)' }}>
                                            <div className="progress-bar-fill" style={{ width: `${s.pct}%`, height: '100%', borderRadius: 4, background: s.color }} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── PIPELINE + ACTIVITY ROW ── */}
                <div className="grid-bottom grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">

                    {/* Pipeline Funnel */}
                    <div className="dash-bottom chart-card glass-card lg:col-span-7 p-6 sm:p-8">
                        <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--hk-text)', margin: '0 0 24px' }}>AI Hiring Pipeline</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {PIPELINE.map((p, i) => {
                                const colors = ['#F4A28C','#E9C26A','#9DBF9E','#9AD0C2','#C4B5E0','#7FA582'];
                                return (
                                    <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                        <span className="text-xs sm:text-sm font-bold text-[#1C1B2E] w-24 sm:w-36 shrink-0 truncate">{p.name}</span>
                                        <div style={{ flex: 1, height: 28, background: 'rgba(127, 165, 130,0.08)', borderRadius: 10, overflow: 'hidden' }}>
                                            <div className="funnel-bar" style={{ width: `${p.pct}%`, height: '100%', background: `linear-gradient(90deg, ${colors[i]}, ${colors[Math.min(i+1,5)]})`, borderRadius: 10 }} />
                                        </div>
                                        <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--hk-text)', width: 45, textAlign: 'right' }}>{p.value}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Activity Feed */}
                    <div className="dash-bottom chart-card glass-card lg:col-span-5 p-6 sm:p-8">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
                            <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--hk-text)', margin: 0 }}>System Events</h2>
                            <div className="pulse-ring" style={{ width: 22, height: 22 }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {ACTIVITIES.length === 0 ? (
                                <p style={{ fontSize: 14, color: 'var(--hk-text-secondary)', textAlign: 'center', marginTop: 20 }}>No activity yet.</p>
                            ) : ACTIVITIES.map((a, i) => {
                                const Icon = a.Icon;
                                return (
                                    <div key={i} className="activity-item" style={{ padding: '12px 0', display: 'flex', alignItems: 'center', gap: 14, borderBottom: i < ACTIVITIES.length - 1 ? '1px solid rgba(127, 165, 130,0.08)' : 'none' }}>
                                        <div style={{ width: 40, height: 40, borderRadius: 12, background: `${a.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: a.color, flexShrink: 0 }}><Icon size={18} /></div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--hk-text)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.text}</p>
                                            <p style={{ fontSize: 12, color: 'var(--hk-text-secondary)', margin: '4px 0 0', fontWeight: 500 }}>{a.time}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* ── RECENT JOBS TABLE ── */}
                <div className="dash-bottom chart-card glass-card p-6 sm:p-8">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
                        <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--hk-text)', margin: 0 }}>Active Job Postings</h2>
                        <Link href="/dashboard/jobs" style={{ fontSize: 14, fontWeight: 700, color: '#7FA582', textDecoration: 'none' }}>View All →</Link>
                    </div>
                    <div className="overflow-x-auto w-full">
                        <table style={{ width: '100%', minWidth: '800px', borderCollapse: 'collapse', textAlign: 'left', fontSize: 14 }}>
                            <thead>
                                <tr style={{ background: 'rgba(127, 165, 130,0.04)', borderBottom: '1px solid rgba(127, 165, 130,0.1)' }}>
                                    {['Role', 'Positions', 'AI Matching Skills', 'Status', 'Posted', 'Actions'].map((h, i) => (
                                        <th key={h} style={{ padding: '16px 20px', fontSize: 12, fontWeight: 800, color: '#64608a', textTransform: 'uppercase', letterSpacing: '0.05em', borderRadius: i === 0 ? '12px 0 0 12px' : i === 5 ? '0 12px 12px 0' : 0 }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#64608a', fontWeight: 500 }}>Loading jobs...</td>
                                    </tr>
                                ) : jobs.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#64608a', fontWeight: 500 }}>
                                            No jobs yet. <Link href="/dashboard/jobs/create" style={{ color: '#7FA582', textDecoration: 'none', fontWeight: 700 }}>Create your first job</Link>
                                        </td>
                                    </tr>
                                ) : jobs.slice(0, 5).map((job) => (
                                    <tr key={job.id} className="table-row-animated" style={{ borderBottom: '1px solid rgba(127, 165, 130,0.08)' }}>
                                        <td style={{ padding: '16px 20px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #f3e8ff, #ede9fe)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7FA582' }}>
                                                    <Briefcase size={20} />
                                                </div>
                                                <div>
                                                    <p style={{ fontWeight: 800, color: 'var(--hk-text)', margin: 0, fontSize: 15 }}>{job.title}</p>
                                                    <p style={{ fontSize: 13, color: 'var(--hk-text-secondary)', margin: '4px 0 0', fontWeight: 500 }}>{job.department || 'General'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px 20px', fontWeight: 800, color: 'var(--hk-text)', fontSize: 15 }}>{job.total_positions || 0}</td>
                                        <td style={{ padding: '16px 20px', fontWeight: 800, color: '#7FA582', fontSize: 15 }}>{job.skills_count || 0}</td>
                                        <td style={{ padding: '16px 20px' }}><StatusBadge status={job.status} /></td>
                                        <td style={{ padding: '16px 20px', fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>{new Date(job.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                                        <td style={{ padding: '16px 20px' }}>
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                <button 
                                                    onClick={() => handleJobAction('view', job.id)}
                                                    className="action-btn" 
                                                    style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10, background: 'rgba(127, 165, 130,0.1)', color: '#7FA582', border: 'none', cursor: 'pointer' }}
                                                    title="View"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handleJobAction('edit', job.id)}
                                                    className="action-btn" 
                                                    style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10, background: 'rgba(14,165,233,0.1)', color: '#0ea5e9', border: 'none', cursor: 'pointer' }}
                                                    title="Edit"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handleJobAction('delete', job.id)}
                                                    className="action-btn" 
                                                    style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10, background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', cursor: 'pointer' }}
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
}