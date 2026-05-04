'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import api from '@/lib/api';
import './dashboard.css';
import { Briefcase, FileText, Users, MessageSquare, Edit2, Eye, Edit, Trash2, BrainCircuit, Activity, Video } from 'lucide-react';
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
        'interview_scheduled': { bg: 'rgba(139,92,246,0.1)', color: '#8b5cf6', label: 'Interviewed' },
    };
    const s = map[status?.toLowerCase()] || map['active'];
    return <span style={{ fontSize: 11, fontWeight: 600, padding: '6px 14px', borderRadius: 100, background: s.bg, color: s.color, whiteSpace: 'nowrap' }}>{s.label}</span>;
}

function KPICard({ item, index }) {
    const count = useCounter(item.value, 1800 + index * 300);
    const Icon = item.Icon;
    return (
        <div className={`dash-card kpi-card glass-card`}
            style={{ padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 170 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--hk-text-secondary)', margin: 0 }}>{item.label}</p>
                <div className="kpi-icon-wrap" style={{ width: 48, height: 48, background: item.bgGrad, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color, flexShrink: 0 }}>
                    <Icon size={24} />
                </div>
            </div>
            <p className="counter-value" style={{ fontSize: 40, fontWeight: 800, color: 'var(--hk-text)', margin: '0 0 8px', letterSpacing: '-1px' }}>{count}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {item.deltaType === 'positive' && <span style={{ color: '#10b981', fontSize: 14, fontWeight: 'bold' }}>↑</span>}
                <p style={{ fontSize: 12, color: 'var(--hk-text-secondary)', margin: 0, fontWeight: 500 }}>{item.delta}</p>
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
            <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(139,92,246,0.08)" strokeWidth={stroke} />
            <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
                strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4,0,0.2,1)', transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }} />
        </svg>
    );
}

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', border: '1px solid rgba(139,92,246,0.15)', borderRadius: 12, padding: '12px 16px', boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }}>
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

            // Fetch actual interview data concurrently
            const interviewPromises = jobsData.map(job => 
                api.get(`/api/v1/jobs/${job.id}/interview/results`).catch(() => null)
            );
            const interviewResults = await Promise.all(interviewPromises);
            
            let totalInterviews = 0;
            const allCandidates = [];
            interviewResults.forEach(res => {
                if (res && res.data && res.data.candidates) {
                    totalInterviews += res.data.candidates.filter(c => c.interviewed).length;
                    allCandidates.push(...res.data.candidates);
                }
            });
            setAiInterviewsDone(totalInterviews);

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

    // DYNAMIC DATA CALCULATIONS
    const activeJobs = jobs.filter(j => j.status === 'active').length;
    const totalJobs = jobs.length;
    const totalCandidates = jobs.reduce((acc, job) => acc + (job.candidates_count || 0), 0);
    const completedAIInterviews = aiInterviewsDone; 

    const kpis = [
        { label: 'AI Screened Resumes', value: totalCandidates, delta: 'Semantic match completed', deltaType: 'positive', color: '#8b5cf6', Icon: BrainCircuit, bgGrad: 'linear-gradient(135deg, #f3e8ff, #ede9fe)' },
        { label: 'Active Positions', value: activeJobs, delta: 'Generating AI questions', deltaType: 'positive', color: '#0ea5e9', Icon: Briefcase, bgGrad: 'linear-gradient(135deg, #cffafe, #ecfeff)' },
        { label: 'AI Interviews Done', value: completedAIInterviews, delta: 'Evaluations ready', deltaType: 'positive', color: '#c026d3', Icon: Video, bgGrad: 'linear-gradient(135deg, #fce7f3, #fdf2f8)' },
        { label: 'Ranked Shortlists', value: totalJobs, delta: 'Based on behavior & skills', deltaType: 'info', color: '#10b981', Icon: Activity, bgGrad: 'linear-gradient(135deg, #d1fae5, #ecfdf5)' },
    ];

    const TREND_DATA = trendData.length
        ? trendData
        : Array.from({ length: 7 }).map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return { name: d.toLocaleDateString('en-US', { weekday: 'short' }), resumes: 0, ai_shortlisted: 0 };
        });

    const PIPELINE = [
        { name: 'Resumes Parsed', value: totalCandidates, pct: 100 },
        { name: 'AI Semantic Match', value: Math.floor(totalCandidates * 0.7), pct: 70 },
        { name: 'AI Auto-Shortlisted', value: Math.floor(totalCandidates * 0.35), pct: 35 },
        { name: 'AI Video Interview', value: Math.floor(totalCandidates * 0.20), pct: 20 },
        { name: 'Final HR Review', value: Math.floor(totalCandidates * 0.08), pct: 8 },
    ];

    const QUICK_STATS = [
        { label: 'AI Match Accuracy', value: '94%', pct: 94, color: '#8b5cf6' },
        { label: 'Manual Time Saved', value: '82%', pct: 82, color: '#10b981' },
        { label: 'Behavioral Confidence', value: '76%', pct: 76, color: '#c026d3' },
    ];

    const ACTIVITIES = jobs.slice(0, 4).map(job => ({
        text: `AI generated interview questions for "${job.title}"`,
        time: new Date(job.created_at).toLocaleDateString(),
        Icon: BrainCircuit,
        color: '#8b5cf6'
    }));

    return (
        <div ref={pageRef} style={{ minHeight: '100vh', padding: '32px', background: 'linear-gradient(135deg, #fafbff 0%, #f3f0ff 100%)', position: 'relative', overflow: 'hidden' }}>
            {/* Background Orbs */}
            <div className="dash-orb dash-orb-1" style={{ position: 'absolute', top: '-10%', left: '-5%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%', zIndex: 0, filter: 'blur(60px)' }} />
            <div className="dash-orb dash-orb-2" style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(192,38,211,0.1) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%', zIndex: 0, filter: 'blur(80px)' }} />
            
            <div style={{ maxWidth: 1400, margin: '0 auto', position: 'relative', zIndex: 1 }}>

                {/* ── HEADER ── */}
                <div className="dash-header header-card glass-card" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 20, padding: '24px 32px', marginBottom: 32 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ width: 56, height: 56, borderRadius: 18, background: 'linear-gradient(135deg, #8b5cf6, #c026d3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 8px 24px rgba(139,92,246,0.3)' }}>
                            <BrainCircuit size={28} />
                        </div>
                        <div>
                            <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--hk-text)', margin: 0, letterSpacing: '-0.5px' }}>{greeting}, HR Team <span style={{ display: 'inline-block', animation: 'orbFloat 3s ease-in-out infinite' }}>✨</span></h1>
                            <p style={{ fontSize: 14, color: 'var(--hk-text-secondary)', margin: '4px 0 0', fontWeight: 500 }}>
                                AI Engine is monitoring {activeJobs} pipelines.
                                <span style={{ margin: '0 10px', color: '#c4b5fd' }}>•</span>
                                <span className="badge-live" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 10px #10b981' }} /> System Live
                                </span>
                            </p>
                        </div>
                    </div>
                    <Link href="/dashboard/jobs/create" className="post-job-btn" style={{ borderRadius: 100, padding: '14px 32px', fontSize: 15, fontWeight: 700, color: '#fff', textDecoration: 'none', background: 'linear-gradient(135deg, #8b5cf6, #c026d3)', border: 'none', cursor: 'pointer', boxShadow: '0 8px 24px rgba(139,92,246,0.4)', transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Edit2 size={18} /> Create New Job
                    </Link>
                </div>

                {/* ── KPI CARDS ── */}
                <div className="grid-kpi" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, marginBottom: 32 }}>
                    {kpis.map((item, i) => <KPICard key={item.label} item={item} index={i} />)}
                </div>

                {/* ── CHARTS ROW ── */}
                <div className="grid-charts" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 32 }}>

                    {/* Area Chart */}
                    <div className="dash-chart chart-card glass-card" style={{ padding: 28 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--hk-text)', margin: 0 }}>AI Screening Velocity</h2>
                            <span style={{ fontSize: 12, fontWeight: 700, padding: '6px 14px', borderRadius: 10, background: 'rgba(139,92,246,0.1)', color: '#8b5cf6' }}>Live Feed</span>
                        </div>
                        <div style={{ height: 280 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={TREND_DATA} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="gApps" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="gShort" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#c026d3" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#c026d3" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(139,92,246,0.1)" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#64608a', fontWeight: 500 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#64608a', fontWeight: 500 }} allowDecimals={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area type="monotone" name="Resumes Parsed" dataKey="resumes" stroke="#8b5cf6" strokeWidth={4} fill="url(#gApps)" dot={{ fill: '#8b5cf6', r: 5, strokeWidth: 3, stroke: '#fff' }} activeDot={{ r: 8, stroke: '#8b5cf6', strokeWidth: 3, fill: '#fff' }} />
                                    <Area type="monotone" name="AI Shortlisted" dataKey="ai_shortlisted" stroke="#c026d3" strokeWidth={4} fill="url(#gShort)" dot={{ fill: '#c026d3', r: 5, strokeWidth: 3, stroke: '#fff' }} activeDot={{ r: 8, stroke: '#c026d3', strokeWidth: 3, fill: '#fff' }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Quick Stats with Rings */}
                    <div className="dash-chart chart-card glass-card insight-card" style={{ padding: 28 }}>
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
                                        <div className="progress-bar-animated" style={{ width: '100%', height: 8, marginTop: 8, borderRadius: 4, background: 'rgba(139,92,246,0.1)' }}>
                                            <div className="progress-bar-fill" style={{ width: `${s.pct}%`, height: '100%', borderRadius: 4, background: s.color }} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── PIPELINE + ACTIVITY ROW ── */}
                <div className="grid-bottom" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24, marginBottom: 32 }}>

                    {/* Pipeline Funnel */}
                    <div className="dash-bottom chart-card glass-card" style={{ padding: 28 }}>
                        <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--hk-text)', margin: '0 0 24px' }}>AI Hiring Pipeline</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {PIPELINE.map((p, i) => {
                                const colors = ['#c026d3','#b524d9','#a322dd','#9120e1','#7f1ee5','#6d1ce8'];
                                return (
                                    <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--hk-text)', width: 140, flexShrink: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</span>
                                        <div style={{ flex: 1, height: 28, background: 'rgba(139,92,246,0.08)', borderRadius: 10, overflow: 'hidden' }}>
                                            <div className="funnel-bar" style={{ width: `${p.pct}%`, height: '100%', background: `linear-gradient(90deg, ${colors[i]}, ${colors[Math.min(i+1,5)]})`, borderRadius: 10 }} />
                                        </div>
                                        <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--hk-text)', width: 45, textAlign: 'right' }}>{p.value}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Activity Feed */}
                    <div className="dash-bottom chart-card glass-card" style={{ padding: 28 }}>
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
                                    <div key={i} className="activity-item" style={{ padding: '12px 0', display: 'flex', alignItems: 'center', gap: 14, borderBottom: i < ACTIVITIES.length - 1 ? '1px solid rgba(139,92,246,0.08)' : 'none' }}>
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
                <div className="dash-bottom chart-card glass-card" style={{ padding: 28 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
                        <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--hk-text)', margin: 0 }}>Active Job Postings</h2>
                        <Link href="/dashboard/jobs" style={{ fontSize: 14, fontWeight: 700, color: '#8b5cf6', textDecoration: 'none' }}>View All →</Link>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 14 }}>
                            <thead>
                                <tr style={{ background: 'rgba(139,92,246,0.04)', borderBottom: '1px solid rgba(139,92,246,0.1)' }}>
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
                                            No jobs yet. <Link href="/dashboard/jobs/create" style={{ color: '#8b5cf6', textDecoration: 'none', fontWeight: 700 }}>Create your first job</Link>
                                        </td>
                                    </tr>
                                ) : jobs.slice(0, 5).map((job) => (
                                    <tr key={job.id} className="table-row-animated" style={{ borderBottom: '1px solid rgba(139,92,246,0.08)' }}>
                                        <td style={{ padding: '16px 20px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #f3e8ff, #ede9fe)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b5cf6' }}>
                                                    <Briefcase size={20} />
                                                </div>
                                                <div>
                                                    <p style={{ fontWeight: 800, color: 'var(--hk-text)', margin: 0, fontSize: 15 }}>{job.title}</p>
                                                    <p style={{ fontSize: 13, color: 'var(--hk-text-secondary)', margin: '4px 0 0', fontWeight: 500 }}>{job.department || 'General'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px 20px', fontWeight: 800, color: 'var(--hk-text)', fontSize: 15 }}>{job.total_positions || 0}</td>
                                        <td style={{ padding: '16px 20px', fontWeight: 800, color: '#8b5cf6', fontSize: 15 }}>{job.skills_count || 0}</td>
                                        <td style={{ padding: '16px 20px' }}><StatusBadge status={job.status} /></td>
                                        <td style={{ padding: '16px 20px', fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>{new Date(job.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                                        <td style={{ padding: '16px 20px' }}>
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                <button 
                                                    onClick={() => handleJobAction('view', job.id)}
                                                    className="action-btn" 
                                                    style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10, background: 'rgba(139,92,246,0.1)', color: '#8b5cf6', border: 'none', cursor: 'pointer' }}
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