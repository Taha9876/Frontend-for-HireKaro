'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';
import api from '@/lib/api';
import { Search, Filter } from 'lucide-react';

const statusStyles = {
    shortlisted: { bg: 'rgba(127,165,130,0.10)', color: '#4a7c4f', label: 'Shortlisted' },
    rejected: { bg: 'rgba(220,80,60,0.08)', color: '#b33a2a', label: 'Rejected' },
    pending: { bg: 'rgba(244,162,140,0.15)', color: '#c06a4e', label: 'Pending' },
    processing: { bg: 'rgba(28,27,46,0.06)', color: '#64608a', label: 'Processing' },
};

const scoreColor = (score) => {
    if (score >= 75) return '#4a7c4f';
    if (score >= 55) return '#c06a4e';
    return '#b33a2a';
};

const scoreBgColor = (score) => {
    if (score >= 75) return '#7FA582';
    if (score >= 55) return '#F4A28C';
    return '#dc5043';
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
        <div ref={pageRef} style={{ minHeight: '100vh', padding: '32px 40px', background: '#FBF8F2', position: 'relative', overflow: 'hidden' }}>
            {/* Background Orbs */}
            <div className="dash-orb" style={{ position: 'absolute', top: '-10%', left: '-5%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(127,165,130,0.10) 0%, transparent 70%)', borderRadius: '50%', zIndex: 0, filter: 'blur(60px)' }} />
            <div className="dash-orb" style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(244,162,140,0.08) 0%, transparent 70%)', borderRadius: '50%', zIndex: 0, filter: 'blur(80px)' }} />

            <div style={{ maxWidth: 1400, margin: '0 auto', position: 'relative', zIndex: 1 }}>
                {/* Header */}
                <div className="page-header" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20, marginBottom: 28 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ width: 3, height: 48, borderRadius: 2, background: 'linear-gradient(180deg, #7FA582, #F4A28C)' }} />
                        <div>
                            <h1 style={{ fontSize: 30, fontWeight: 800, color: '#1C1B2E', margin: 0, letterSpacing: '-0.8px', fontFamily: 'Syne, sans-serif' }}>Candidates</h1>
                            <p style={{ fontSize: 13, color: '#64608a', margin: '4px 0 0', fontWeight: 500 }}>
                                Browse and manage all applicants
                                <span style={{ margin: '0 8px', color: '#ccc' }}>·</span>
                                <span style={{ fontWeight: 700, color: '#1C1B2E' }}>{candidates.length} total</span>
                            </p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ position: 'relative' }}>
                            <Search style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={16} />
                            <input
                                type="text"
                                placeholder="Search candidates..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                style={{ paddingLeft: 40, paddingRight: 16, paddingTop: 11, paddingBottom: 11, width: 280, background: '#fff', border: '1px solid #e8e5df', borderRadius: 12, fontSize: 13, fontWeight: 500, color: '#1C1B2E', outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s' }}
                                onFocus={e => { e.target.style.borderColor = '#7FA582'; e.target.style.boxShadow = '0 0 0 3px rgba(127,165,130,0.10)'; }}
                                onBlur={e => { e.target.style.borderColor = '#e8e5df'; e.target.style.boxShadow = 'none'; }}
                            />
                        </div>
                        <div style={{ position: 'relative' }}>
                            <button
                                onClick={() => setShowFilter(!showFilter)}
                                style={{ width: 42, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 12, background: showFilter ? '#1C1B2E' : '#fff', color: showFilter ? '#fff' : '#64608a', border: '1px solid #e8e5df', cursor: 'pointer', transition: 'all 0.2s' }}
                            >
                                <Filter size={16} />
                            </button>
                            {showFilter && (
                                <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: '#fff', borderRadius: 14, padding: 6, boxShadow: '0 16px 48px rgba(0,0,0,0.12)', border: '1px solid #e8e5df', zIndex: 50, minWidth: 180 }}>
                                    {['all', 'shortlisted', 'rejected', 'pending'].map(f => (
                                        <button key={f} onClick={() => { setFilter(f); setShowFilter(false); }}
                                            style={{ display: 'block', width: '100%', padding: '10px 16px', textAlign: 'left', background: filter === f ? '#1C1B2E' : 'transparent', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: filter === f ? 700 : 500, color: filter === f ? '#fff' : '#64608a', cursor: 'pointer', textTransform: 'capitalize', transition: 'all 0.15s' }}>
                                            {f === 'all' ? 'All Candidates' : f}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stats Bar */}
                <div className="candidate-card" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, marginBottom: 24, background: '#fff', borderRadius: 18, border: '1px solid #e8e5df', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
                    {[
                        { label: 'Total', value: stats.total, accent: '#1C1B2E', sub: 'Applicants' },
                        { label: 'Shortlisted', value: stats.shortlisted, accent: '#7FA582', sub: 'Passed screening' },
                        { label: 'Rejected', value: stats.rejected, accent: '#dc5043', sub: 'Did not match' },
                        { label: 'Pending', value: stats.pending, accent: '#F4A28C', sub: 'Awaiting review' },
                    ].map((s, i) => (
                        <div key={s.label} style={{ padding: '24px 28px', borderRight: i < 3 ? '1px solid #e8e5df' : 'none', position: 'relative', transition: 'all 0.2s', cursor: 'default' }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#FDFCF9'; e.currentTarget.style.borderLeft = '3px solid ' + s.accent; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderLeft = 'none'; }}>
                            <p style={{ fontSize: 11, fontWeight: 700, color: '#64608a', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 10px' }}>{s.label}</p>
                            <p style={{ fontSize: 34, fontWeight: 800, color: s.accent, margin: 0, lineHeight: 1, fontFamily: 'Syne, sans-serif' }}>{s.value}</p>
                            <p style={{ fontSize: 12, color: '#94a3b8', margin: '6px 0 0', fontWeight: 500 }}>{s.sub}</p>
                        </div>
                    ))}
                </div>

                {/* Candidates Table */}
                {loading ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 100 }}>
                        <div style={{ width: 40, height: 40, border: '3px solid #1C1B2E', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                    </div>
                ) : filteredCandidates.length === 0 ? (
                    <div className="candidate-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 32px', textAlign: 'center', background: '#fff', borderRadius: 18, border: '1px solid #e8e5df', boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
                        <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, #FDFCF9, #F5F3ED)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, border: '1px solid #e8e5df', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
                            <Search size={22} style={{ color: '#94a3b8' }} />
                        </div>
                        <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1C1B2E', margin: '0 0 6px', fontFamily: 'Syne, sans-serif' }}>
                            {candidates.length === 0 ? 'No Candidates Yet' : 'No Matching Candidates'}
                        </h3>
                        <p style={{ fontSize: 14, color: '#64608a', maxWidth: 360, lineHeight: 1.6, fontWeight: 500, margin: 0 }}>
                            {candidates.length === 0
                                ? 'Upload resumes and run screening to see candidates here.'
                                : 'Try adjusting your search or filter criteria.'}
                        </p>
                    </div>
                ) : (
                    <div className="candidate-card" style={{ background: '#fff', borderRadius: 18, border: '1px solid #e8e5df', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
                        {/* Table Header */}
                        <div style={{ display: 'grid', gridTemplateColumns: '2.2fr 1.3fr 0.9fr 0.7fr 0.7fr 0.7fr 1.1fr 1fr', gap: 12, padding: '18px 32px', borderBottom: '1px solid #e8e5df', background: '#FDFCF9' }}>
                            {['Candidate', 'Applied For', 'Status', 'Skills', 'Exp', 'Edu', 'Match Score', 'Actions'].map((h) => (
                                <span key={h} style={{ fontSize: 10, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</span>
                            ))}
                        </div>

                        {/* Candidate Rows */}
                        {filteredCandidates.map((c, idx) => {
                            const st = statusStyles[c.status] || statusStyles.pending;
                            return (
                                <div key={c.id}
                                    style={{ display: 'grid', gridTemplateColumns: '2.2fr 1.3fr 0.9fr 0.7fr 0.7fr 0.7fr 1.1fr 1fr', gap: 12, padding: '16px 32px', alignItems: 'center', borderBottom: idx < filteredCandidates.length - 1 ? '1px solid #f3f1ec' : 'none', transition: 'all 0.2s', cursor: 'pointer', borderLeft: '3px solid transparent' }}
                                    onMouseEnter={e => { e.currentTarget.style.background = '#FDFCF9'; e.currentTarget.style.paddingLeft = '36px'; e.currentTarget.style.paddingRight = '28px'; e.currentTarget.style.borderLeft = '3px solid #7FA582'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.paddingLeft = '32px'; e.currentTarget.style.paddingRight = '32px'; e.currentTarget.style.borderLeft = '3px solid transparent'; }}>
                                    {/* Candidate Info */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                        <div style={{ width: 40, height: 40, borderRadius: 12, background: '#1C1B2E', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 15, flexShrink: 0, fontFamily: 'Syne, sans-serif' }}>
                                            {c.candidate_name.charAt(0).toUpperCase()}
                                        </div>
                                        <div style={{ minWidth: 0 }}>
                                            <p style={{ fontSize: 14, fontWeight: 700, color: '#1C1B2E', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.candidate_name}</p>
                                            <p style={{ fontSize: 12, color: '#94a3b8', margin: '3px 0 0', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {c.candidate_email || 'No email'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Job Title */}
                                    <span style={{ fontSize: 13, fontWeight: 600, color: '#1C1B2E', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.job_title}</span>

                                    {/* Status Badge */}
                                    <div>
                                        <span style={{ display: 'inline-block', padding: '5px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700, background: st.bg, color: st.color, textTransform: 'capitalize', letterSpacing: '0.02em' }}>
                                            {c.status}
                                        </span>
                                    </div>

                                    {/* Skills */}
                                    <span style={{ fontSize: 13, fontWeight: 700, color: '#1C1B2E' }}>{c.skills_score}%</span>

                                    {/* Experience */}
                                    <span style={{ fontSize: 13, fontWeight: 700, color: '#1C1B2E' }}>{c.experience_score}%</span>

                                    {/* Education */}
                                    <span style={{ fontSize: 13, fontWeight: 700, color: '#1C1B2E' }}>{c.education_score}%</span>

                                    {/* Overall Score */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <span style={{ fontSize: 15, fontWeight: 800, color: scoreColor(c.match_score), fontFamily: 'Syne, sans-serif', minWidth: 38 }}>{c.match_score}%</span>
                                        <div style={{ flex: 1, height: 5, background: '#f3f1ec', borderRadius: 3, overflow: 'hidden', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04)' }}>
                                            <div style={{ width: `${c.match_score}%`, height: '100%', borderRadius: 3, background: `linear-gradient(90deg, ${scoreBgColor(c.match_score)}, ${c.match_score >= 75 ? '#9DBF9E' : c.match_score >= 55 ? '#F4D58D' : '#F4A28C'})`, transition: 'width 0.5s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }} />
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button
                                            onClick={() => router.push(`/dashboard/jobs/${c.job_id}`)}
                                            style={{ padding: '7px 14px', fontSize: 12, fontWeight: 700, color: '#fff', background: '#1C1B2E', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, transition: 'opacity 0.2s' }}
                                            onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                                            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                                        >
                                            View
                                        </button>
                                        <button
                                            onClick={() => handleDownload(c.id, c.job_id, c.file_name)}
                                            style={{ padding: '7px 14px', fontSize: 12, fontWeight: 700, color: '#1C1B2E', background: '#fff', border: '1px solid #e8e5df', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, transition: 'all 0.2s' }}
                                            onMouseEnter={e => { e.currentTarget.style.background = '#FDFCF9'; e.currentTarget.style.borderColor = '#7FA582'; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#e8e5df'; }}
                                        >
                                            Resume
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