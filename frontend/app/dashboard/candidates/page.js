'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';
import api from '@/lib/api';
import {
    Users, Search, Filter, Download, FileText, CheckCircle,
    XCircle, Clock, Briefcase, ChevronDown, Mail, Phone, Award
} from 'lucide-react';

const statusColors = {
    shortlisted: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: CheckCircle },
    rejected: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200', icon: XCircle },
    pending: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: Clock },
    processing: { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', icon: Clock },
};

const scoreColor = (score) => {
    if (score >= 75) return 'text-emerald-600';
    if (score >= 55) return 'text-amber-600';
    return 'text-red-500';
};

const scoreBg = (score) => {
    if (score >= 75) return 'bg-gradient-to-r from-emerald-500 to-emerald-400';
    if (score >= 55) return 'bg-gradient-to-r from-amber-500 to-amber-400';
    return 'bg-gradient-to-r from-red-500 to-red-400';
};

export default function CandidatesPage() {
    const pageRef = useRef(null);
    const router = useRouter();
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [showFilter, setShowFilter] = useState(false);

    useEffect(() => {
        fetchCandidates();
    }, []);

    useEffect(() => {
        if (!pageRef.current || loading) return;
        const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
        tl.fromTo('.dash-orb', { opacity: 0, scale: 0.5 }, { opacity: 0.25, scale: 1, duration: 2.5, stagger: 0.3 }, 0);
        tl.fromTo('.page-header', { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 1 }, 0.1);
        tl.fromTo('.candidate-card', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.08 }, 0.3);
        return () => tl.kill();
    }, [loading]);

    const fetchCandidates = async () => {
        try {
            const res = await api.get('/api/v1/candidates');
            setCandidates(res.data);
        } catch (err) {
            console.error('Failed to fetch candidates:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredCandidates = candidates.filter(c => {
        const matchesSearch = search === '' ||
            c.candidate_name.toLowerCase().includes(search.toLowerCase()) ||
            c.candidate_email.toLowerCase().includes(search.toLowerCase()) ||
            c.job_title.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === 'all' || c.status === filter;
        return matchesSearch && matchesFilter;
    });

    const stats = {
        total: candidates.length,
        shortlisted: candidates.filter(c => c.status === 'shortlisted').length,
        rejected: candidates.filter(c => c.status === 'rejected').length,
        pending: candidates.filter(c => c.status === 'pending').length,
    };

    const handleDownload = async (candidateId, jobId, fileName) => {
        try {
            const res = await api.get(`/api/v1/jobs/${jobId}/resumes/${candidateId}/download`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName || 'resume.pdf';
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Download failed:', err);
        }
    };

    return (
        <div ref={pageRef} style={{ minHeight: '100vh', padding: '32px', background: 'linear-gradient(135deg, #fafbff 0%, #f3f0ff 100%)', position: 'relative', overflow: 'hidden' }}>
            {/* Background Orbs */}
            <div className="dash-orb" style={{ position: 'absolute', top: '-10%', left: '-5%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%', zIndex: 0, filter: 'blur(60px)' }} />
            <div className="dash-orb" style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(192,38,211,0.1) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%', zIndex: 0, filter: 'blur(80px)' }} />

            <div style={{ maxWidth: 1400, margin: '0 auto', position: 'relative', zIndex: 1 }}>
                {/* Header */}
                <div className="page-header" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 20, borderRadius: 24, padding: '24px 32px', marginBottom: 32, background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.8)', boxShadow: '0 8px 32px rgba(139,92,246,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ width: 56, height: 56, borderRadius: 18, background: 'linear-gradient(135deg, #8b5cf6, #c026d3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 8px 24px rgba(139,92,246,0.3)' }}>
                            <Users size={28} />
                        </div>
                        <div>
                            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.5px', fontFamily: 'Syne, sans-serif' }}>Candidates Talent Pool</h1>
                            <p style={{ fontSize: 14, color: '#64608a', margin: '4px 0 0', fontWeight: 500 }}>
                                Browse, search, and manage all applicants
                                <span style={{ margin: '0 10px', color: '#c4b5fd' }}>•</span>
                                <span style={{ fontWeight: 700, color: '#8b5cf6' }}>{candidates.length} total</span>
                            </p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ position: 'relative' }}>
                            <Search style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
                            <input
                                type="text"
                                placeholder="Search candidates..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                style={{ paddingLeft: 42, paddingRight: 16, paddingTop: 12, paddingBottom: 12, width: 280, background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(139,92,246,0.15)', borderRadius: 14, fontSize: 14, fontWeight: 500, color: '#0f172a', outline: 'none' }}
                            />
                        </div>
                        <div style={{ position: 'relative' }}>
                            <button
                                onClick={() => setShowFilter(!showFilter)}
                                style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 14, background: showFilter ? 'linear-gradient(135deg, #8b5cf6, #c026d3)' : 'rgba(255,255,255,0.8)', color: showFilter ? '#fff' : '#64608a', border: '1px solid rgba(139,92,246,0.15)', cursor: 'pointer', transition: 'all 0.2s' }}
                            >
                                <Filter size={20} />
                            </button>
                            {showFilter && (
                                <div style={{ position: 'absolute', top: '110%', right: 0, background: '#fff', borderRadius: 16, padding: 8, boxShadow: '0 12px 40px rgba(0,0,0,0.12)', border: '1px solid rgba(139,92,246,0.1)', zIndex: 50, minWidth: 160 }}>
                                    {['all', 'shortlisted', 'rejected', 'pending'].map(f => (
                                        <button key={f} onClick={() => { setFilter(f); setShowFilter(false); }}
                                            style={{ display: 'block', width: '100%', padding: '10px 16px', textAlign: 'left', background: filter === f ? 'rgba(139,92,246,0.08)' : 'transparent', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: filter === f ? 700 : 500, color: filter === f ? '#8b5cf6' : '#64608a', cursor: 'pointer', textTransform: 'capitalize' }}>
                                            {f === 'all' ? 'All Candidates' : f}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 32 }}>
                    {[
                        { label: 'Total Candidates', value: stats.total, icon: <Users size={22} />, gradient: 'linear-gradient(135deg, #8b5cf6, #c026d3)' },
                        { label: 'Shortlisted', value: stats.shortlisted, icon: <CheckCircle size={22} />, gradient: 'linear-gradient(135deg, #10b981, #059669)' },
                        { label: 'Rejected', value: stats.rejected, icon: <XCircle size={22} />, gradient: 'linear-gradient(135deg, #ef4444, #dc2626)' },
                        { label: 'Pending Review', value: stats.pending, icon: <Clock size={22} />, gradient: 'linear-gradient(135deg, #f59e0b, #d97706)' },
                    ].map((s) => (
                        <div key={s.label} className="candidate-card" style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(20px)', borderRadius: 20, padding: '20px 24px', border: '1px solid rgba(255,255,255,0.8)', boxShadow: '0 8px 32px rgba(139,92,246,0.05)', display: 'flex', alignItems: 'center', gap: 16 }}>
                            <div style={{ width: 44, height: 44, borderRadius: 14, background: s.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: `0 4px 16px rgba(0,0,0,0.15)`, flexShrink: 0 }}>
                                {s.icon}
                            </div>
                            <div>
                                <p style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', margin: 0, lineHeight: 1, fontFamily: 'Syne, sans-serif' }}>{s.value}</p>
                                <p style={{ fontSize: 13, color: '#64608a', fontWeight: 600, margin: '4px 0 0' }}>{s.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Candidates List */}
                {loading ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 80 }}>
                        <div style={{ width: 40, height: 40, border: '4px solid #8b5cf6', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                    </div>
                ) : filteredCandidates.length === 0 ? (
                    <div className="candidate-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 32px', textAlign: 'center', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(20px)', borderRadius: 24, border: '1px solid rgba(255,255,255,0.8)', boxShadow: '0 8px 32px rgba(139,92,246,0.05)' }}>
                        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(139,92,246,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c4b5fd', marginBottom: 20 }}>
                            <Users size={40} />
                        </div>
                        <h3 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '0 0 8px', fontFamily: 'Syne, sans-serif' }}>
                            {candidates.length === 0 ? 'Talent Pool is Empty' : 'No Matching Candidates'}
                        </h3>
                        <p style={{ fontSize: 15, color: '#64608a', maxWidth: 400, lineHeight: 1.6, fontWeight: 500 }}>
                            {candidates.length === 0
                                ? 'Once you upload resumes to your job postings and run screening, candidates will appear here automatically.'
                                : 'Try adjusting your search or filter criteria.'}
                        </p>
                    </div>
                ) : (
                    <div className="candidate-card" style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(20px)', borderRadius: 24, border: '1px solid rgba(255,255,255,0.8)', boxShadow: '0 8px 32px rgba(139,92,246,0.05)', overflow: 'hidden' }}>
                        {/* Table Header */}
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 0.8fr 0.6fr 0.6fr 0.6fr 1fr 0.8fr', gap: 8, padding: '16px 24px', background: 'rgba(139,92,246,0.04)', borderBottom: '1px solid rgba(139,92,246,0.1)' }}>
                            {['Candidate', 'Applied For', 'Status', 'Skills', 'Exp', 'Edu', 'Score', 'Actions'].map((h) => (
                                <span key={h} style={{ fontSize: 11, fontWeight: 800, color: '#64608a', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</span>
                            ))}
                        </div>

                        {/* Candidate Rows */}
                        {filteredCandidates.map((c, idx) => {
                            const st = statusColors[c.status] || statusColors.pending;
                            const StatusIcon = st.icon;
                            return (
                                <div key={c.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 0.8fr 0.6fr 0.6fr 0.6fr 1fr 0.8fr', gap: 8, padding: '16px 24px', alignItems: 'center', borderBottom: idx < filteredCandidates.length - 1 ? '1px solid rgba(139,92,246,0.06)' : 'none', transition: 'background 0.2s', cursor: 'default' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(139,92,246,0.03)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    {/* Candidate Info */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={{ width: 40, height: 40, borderRadius: 12, background: c.status === 'shortlisted' ? 'linear-gradient(135deg, #10b981, #059669)' : c.status === 'rejected' ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #8b5cf6, #c026d3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 16, flexShrink: 0 }}>
                                            {c.candidate_name.charAt(0).toUpperCase()}
                                        </div>
                                        <div style={{ minWidth: 0 }}>
                                            <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.candidate_name}</p>
                                            <p style={{ fontSize: 12, color: '#94a3b8', margin: '2px 0 0', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
                                                {c.candidate_email ? <><Mail size={10} /> {c.candidate_email}</> : 'No email'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Job Title */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <Briefcase size={14} style={{ color: '#8b5cf6', flexShrink: 0 }} />
                                        <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.job_title}</span>
                                    </div>

                                    {/* Status Badge */}
                                    <div>
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700, textTransform: 'capitalize' }}
                                            className={`${st.bg} ${st.text} border ${st.border}`}>
                                            <StatusIcon size={12} /> {c.status}
                                        </span>
                                    </div>

                                    {/* Skills */}
                                    <span style={{ fontSize: 14, fontWeight: 800, color: '#8b5cf6' }}>{c.skills_score}%</span>

                                    {/* Experience */}
                                    <span style={{ fontSize: 14, fontWeight: 800, color: '#c026d3' }}>{c.experience_score}%</span>

                                    {/* Education */}
                                    <span style={{ fontSize: 14, fontWeight: 800, color: '#7c3aed' }}>{c.education_score}%</span>

                                    {/* Overall Score */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <span style={{ fontSize: 18, fontWeight: 800 }} className={scoreColor(c.match_score)}>{c.match_score}%</span>
                                        <div style={{ flex: 1, height: 6, background: 'rgba(139,92,246,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                                            <div style={{ width: `${c.match_score}%`, height: '100%', borderRadius: 3 }} className={scoreBg(c.match_score)} />
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button
                                            onClick={() => router.push(`/dashboard/jobs/${c.job_id}`)}
                                            style={{ width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10, background: 'rgba(139,92,246,0.1)', color: '#8b5cf6', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}
                                            title="View Job"
                                        >
                                            <Briefcase size={14} />
                                        </button>
                                        <button
                                            onClick={() => handleDownload(c.id, c.job_id, c.file_name)}
                                            style={{ width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10, background: 'rgba(192,38,211,0.1)', color: '#c026d3', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}
                                            title="Download Resume"
                                        >
                                            <Download size={14} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <style jsx>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}