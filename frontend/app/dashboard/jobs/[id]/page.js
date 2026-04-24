// app/dashboard/jobs/[id]/page.js
'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import gsap from 'gsap';
import api from '@/lib/api';

const statusConfig = {
    draft: { color: 'bg-slate-100 text-slate-600', label: 'Draft' },
    active: { color: 'bg-blue-50 text-blue-700 border border-blue-200', label: 'Active' },
    processing: { color: 'bg-amber-50 text-amber-700 border border-amber-200', label: '⚙️ Processing...' },
    screened: { color: 'bg-violet-50 text-violet-700 border border-violet-200', label: '✓ Screened' },
    interview_scheduled: { color: 'bg-emerald-50 text-emerald-700 border border-emerald-200', label: '📅 Interview Scheduled' },
    closed: { color: 'bg-red-50 text-red-600', label: 'Closed' },
    archived: { color: 'bg-slate-100 text-slate-500', label: 'Archived' },
};

const scoreColor = (score) => {
    if (score >= 75) return 'text-emerald-600';
    if (score >= 55) return 'text-amber-600';
    return 'text-red-500';
};

const scoreBg = (score) => {
    if (score >= 75) return 'bg-emerald-500';
    if (score >= 55) return 'bg-amber-500';
    return 'bg-red-500';
};

export default function JobDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const pageRef = useRef(null);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [screening, setScreening] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [activeTab, setActiveTab] = useState('screening'); // screening | interview
    const [interviewResults, setInterviewResults] = useState(null);
    const [loadingResults, setLoadingResults] = useState(false);
    const pollRef = useRef(null);

    const fetchData = async () => {
        try {
            const res = await api.get(`/api/v1/jobs/${id}/results`);
            setData(res.data);
            return res.data.job.status;
        } catch {
            return null;
        }
    };

    useEffect(() => {
        fetchData().then(status => {
            setLoading(false);
            if (status === 'processing') {
                pollRef.current = setInterval(async () => {
                    const s = await fetchData();
                    if (s !== 'processing') clearInterval(pollRef.current);
                }, 5000);
            }
        });
        return () => clearInterval(pollRef.current);
    }, [id]);

    useEffect(() => {
        if (loading || !pageRef.current) return;
        const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

        tl.fromTo('.dash-orb', { opacity: 0, scale: 0.5 }, { opacity: 0.25, scale: 1, duration: 2.5, stagger: 0.3 }, 0);
        tl.fromTo('.page-header', { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 1 }, 0.1);
        tl.fromTo('.job-content', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.1 }, 0.2);

        return () => tl.kill();
    }, [loading]);

    const handleScreen = async () => {
        setScreening(true);
        try {
            await api.post(`/api/v1/jobs/${id}/screen`);
            await fetchData();
            pollRef.current = setInterval(async () => {
                const s = await fetchData();
                if (s !== 'processing') {
                    clearInterval(pollRef.current);
                    setScreening(false);
                }
            }, 5000);
        } catch (err) {
            alert(err.response?.data?.detail || 'Screening failed');
            setScreening(false);
        }
    };

    const handleDownload = async (resumeId, fileName) => {
        try {
            const res = await api.get(`/api/v1/jobs/${id}/resumes/${resumeId}/download`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            a.click();
        } catch {
            alert('Download failed');
        }
    };

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        if (tabId === 'interview' && !interviewResults) {
            setLoadingResults(true);
            api.get(`/api/v1/jobs/${id}/interview/results`)
                .then(res => setInterviewResults(res.data))
                .catch(() => { })
                .finally(() => setLoadingResults(false));
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-screen bg-slate-50">
            <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!data) return (
        <div className="p-8 text-center text-slate-400">Job not found</div>
    );

    const { job, metrics, candidates } = data;
    const filteredCandidates = candidates.filter(c => {
        if (filter === 'all') return true;
        return c.status === filter;
    });
    const status = statusConfig[job.status] || statusConfig.active;
    const isProcessing = job.status === 'processing';
    const isCompleted = job.status === 'completed';
    const showTabs = job.status === 'interview_scheduled' || job.status === 'closed';

    return (
        <div ref={pageRef} className="min-h-screen bg-slate-50 relative overflow-hidden">
            {/* Background Orbs */}
            <div className="dash-orb" style={{ position: 'absolute', top: '-5%', right: '-5%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%', zIndex: 0, filter: 'blur(60px)' }} />
            <div className="dash-orb" style={{ position: 'absolute', bottom: '-15%', left: '-5%', width: '45vw', height: '45vw', background: 'radial-gradient(circle, rgba(192,38,211,0.1) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%', zIndex: 0, filter: 'blur(80px)' }} />

            {/* Candidate Report Modal */}
            {selectedCandidate && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                    onClick={() => setSelectedCandidate(null)}>
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                        onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between"
                            style={{ background: selectedCandidate.status === 'shortlisted' ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
                            <div>
                                <h3 className="text-xl font-bold text-white">{selectedCandidate.name}</h3>
                                <p className="text-white/70 text-sm">{selectedCandidate.email}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="text-center">
                                    <div className="text-3xl font-extrabold text-white">{selectedCandidate.match_score}%</div>
                                    <div className="text-white/70 text-xs">Match Score</div>
                                </div>
                                <button onClick={() => setSelectedCandidate(null)}
                                    className="w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center border-none cursor-pointer hover:bg-white/30 text-lg">
                                    ×
                                </button>
                            </div>
                        </div>

                        <div className="p-6 flex flex-col gap-5">
                            {/* Status */}
                            <div className={`px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2
                ${selectedCandidate.status === 'shortlisted' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                {selectedCandidate.status === 'shortlisted' ? '✅ Shortlisted for Interview' : '❌ Not Selected'}
                                {selectedCandidate.status === 'rejected' && selectedCandidate.rejection_reason && (
                                    <span className="font-normal ml-1">— {selectedCandidate.rejection_reason}</span>
                                )}
                            </div>

                            {/* Score Breakdown */}
                            <div>
                                <h4 className="text-sm font-bold text-[#0a1628] mb-3">Score Breakdown</h4>
                                {[
                                    { label: 'Skills Match', score: selectedCandidate.skills_score, weight: '35%' },
                                    { label: 'Experience', score: selectedCandidate.experience_score, weight: '25%' },
                                    { label: 'Project Match', score: Math.round((selectedCandidate.score_breakdown?.projects?.score ?? 0) * 100), weight: '20%' },
                                    { label: 'Education', score: selectedCandidate.education_score, weight: '10%' },
                                    { label: 'Semantic Match', score: selectedCandidate.semantic_score, weight: '10%' },
                                ].map(item => (
                                    <div key={item.label} className="mb-3">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-sm text-slate-600">{item.label}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-slate-400">weight {item.weight}</span>
                                                <span className={`text-sm font-bold ${scoreColor(item.score)}`}>{item.score}%</span>
                                            </div>
                                        </div>
                                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full transition-all ${scoreBg(item.score)}`}
                                                style={{ width: `${item.score}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Parsed Info */}
                            {selectedCandidate.score_breakdown && (
                                <div className="grid grid-cols-2 gap-3">
                                    {selectedCandidate.score_breakdown.skills && (
                                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                                            <p className="text-xs font-bold text-slate-500 mb-2">SKILLS</p>
                                            <p className="text-xs text-slate-600">
                                                ✅ Matched: {selectedCandidate.score_breakdown.skills.matched_required?.join(', ') || 'None'}
                                            </p>
                                            {selectedCandidate.score_breakdown.skills.missing_required?.length > 0 && (
                                                <p className="text-xs text-red-500 mt-1">
                                                    ❌ Missing: {selectedCandidate.score_breakdown.skills.missing_required.join(', ')}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                    {selectedCandidate.score_breakdown.experience && (
                                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                                            <p className="text-xs font-bold text-slate-500 mb-2">EXPERIENCE</p>
                                            <p className="text-xs text-slate-600">
                                                {selectedCandidate.score_breakdown.experience.total_years} years actual
                                            </p>
                                            <p className="text-xs text-slate-400 mt-1">
                                                Min required: {selectedCandidate.score_breakdown.experience.expected_min} years
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Projects Section */}
                            {selectedCandidate.score_breakdown?.projects && (
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                                    <p className="text-xs font-bold text-slate-500 mb-2">PROJECTS</p>
                                    <p className="text-xs text-slate-600">
                                        {selectedCandidate.score_breakdown.projects.relevant_projects} of{' '}
                                        {selectedCandidate.score_breakdown.projects.total_projects} projects relevant
                                    </p>
                                    {selectedCandidate.score_breakdown.projects.matched_techs?.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {selectedCandidate.score_breakdown.projects.matched_techs.map((t, i) => (
                                                <span key={i} className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-xs rounded border border-emerald-200">
                                                    {t}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    {selectedCandidate.score_breakdown.projects.relevant_projects === 0 && (
                                        <p className="text-xs text-red-500 mt-1">❌ No relevant projects found</p>
                                    )}
                                </div>
                            )}

                            {/* Experience Relevance */}
                            {selectedCandidate.score_breakdown?.experience && (
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                                    <p className="text-xs font-bold text-slate-500 mb-2">EXPERIENCE</p>
                                    <p className="text-xs text-slate-600">
                                        {selectedCandidate.score_breakdown.experience.relevant_years ?? 0} relevant years
                                        {' '}(of {selectedCandidate.score_breakdown.experience.total_years ?? 0} total)
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1">
                                        Relevance: {Math.round((selectedCandidate.score_breakdown.experience.relevance_ratio ?? 0) * 100)}%
                                        {' '}• Min required: {selectedCandidate.score_breakdown.experience.expected_min ?? 0} years
                                    </p>
                                </div>
                            )}

                            {/* Download */}
                            <button
                                onClick={() => handleDownload(selectedCandidate.id, selectedCandidate.file_name)}
                                className="w-full py-2.5 border-2 border-blue-200 text-blue-600 text-sm font-semibold rounded-xl hover:bg-blue-50 transition-colors bg-transparent cursor-pointer">
                                📄 Download Resume
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="relative z-10 p-8 max-w-6xl mx-auto">
                {/* Back */}
                <button onClick={() => router.push('/dashboard/jobs')}
                    className="flex items-center gap-2 text-sm text-slate-400 hover:text-blue-600 transition-colors bg-transparent border-none cursor-pointer mb-6">
                    ← Back to Jobs
                </button>

                {/* Job Header */}
                <div className="page-header bg-white/80 backdrop-blur-xl rounded-3xl border border-white/80 shadow-[0_8px_32px_rgba(139,92,246,0.05)] overflow-hidden mb-6">
                    <div className="p-8" style={{ background: 'linear-gradient(135deg, #0a1628, #162847)' }}>
                        <div className="flex items-start justify-between flex-wrap gap-4">
                            <div>
                                <div className="flex items-center gap-3 mb-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${status.color}`}>
                                        {status.label}
                                    </span>
                                    {job.department && (
                                        <span className="text-white/50 text-sm">📁 {job.department}</span>
                                    )}
                                    {job.location && (
                                        <span className="text-white/50 text-sm">📍 {job.location}</span>
                                    )}
                                </div>
                                <h1 className="text-3xl font-extrabold text-white mb-2"
                                    style={{ fontFamily: 'Syne, sans-serif' }}>{job.title}</h1>
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {job.skills.map((s, i) => (
                                        <span key={i}
                                            className={`px-2.5 py-1 rounded-full text-xs font-semibold
                        ${s.is_required ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-white/10 text-white/60'}`}>
                                            {s.skill_name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-3 flex-wrap">
                                {job.status === 'active' && (
                                    <button onClick={handleScreen} disabled={screening}
                                        className="px-6 py-2.5 text-white text-sm font-semibold rounded-xl border-none cursor-pointer disabled:opacity-60 transition-all hover:-translate-y-0.5"
                                        style={{ background: 'linear-gradient(135deg, #2563eb, #1e40af)', boxShadow: '0 3px 16px rgba(37,99,235,0.4)' }}>
                                        {screening ? '⚙️ Starting...' : '🚀 Start Screening'}
                                    </button>
                                )}

                                {job.status === 'screened' && (
                                    <button onClick={() => router.push(`/dashboard/jobs/${id}/schedule`)}
                                        className="px-6 py-2.5 text-white text-sm font-semibold rounded-xl border-none cursor-pointer transition-all hover:-translate-y-0.5"
                                        style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                                        📅 Schedule Interviews
                                    </button>
                                )}

                                {job.status === 'interview_scheduled' && (
                                    <button onClick={() => router.push(`/dashboard/jobs/${id}/schedule`)}
                                        className="px-6 py-2.5 text-white text-sm font-semibold rounded-xl border-none cursor-pointer transition-all hover:-translate-y-0.5"
                                        style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                                        🔄 Reschedule Interview
                                    </button>
                                )}
                                {isCompleted && (
                                    <button
                                        onClick={() => router.push(`/dashboard/jobs/${id}/schedule`)}
                                        className="px-6 py-2.5 text-white text-sm font-semibold rounded-xl border-none cursor-pointer transition-all hover:-translate-y-0.5"
                                        style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                                        📅 Schedule Interviews
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Job Description */}
                        <div className="mt-6 pt-6 border-t border-white/10">
                            <p className="text-white/70 text-sm leading-relaxed">{job.description}</p>
                        </div>
                    </div>
                </div>

                {/* Processing Banner */}
                {isProcessing && (
                    <div className="job-content bg-amber-50/80 backdrop-blur-md border border-amber-200 rounded-2xl p-5 mb-6 flex items-center gap-4 shadow-sm">
                        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                        <div>
                            <p className="font-semibold text-amber-800">Screening in Progress</p>
                            <p className="text-sm text-amber-600">AI is analyzing all resumes. You can leave this page — results will be ready when you return.</p>
                        </div>
                    </div>
                )}

                {/* Tabs — sirf interview_scheduled ya baad ke status pe dikho */}
                {showTabs && (
                    <div className="job-content flex gap-1 bg-white/70 backdrop-blur-xl rounded-2xl border border-white/80 shadow-[0_4px_16px_rgba(139,92,246,0.05)] p-1.5 mb-6">
                        {[
                            { id: 'screening', label: '📄 Resume Screening' },
                            { id: 'interview', label: '🎯 Interview Results' },
                        ].map(tab => (
                            <button key={tab.id}
                                onClick={() => handleTabChange(tab.id)}
                                className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold transition-all border-none cursor-pointer
                                    ${activeTab === tab.id ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/25' : 'bg-transparent text-slate-500 hover:text-violet-600 hover:bg-violet-50/50'}`}>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                )}

                {/* ── SCREENING TAB ── */}
                {(!showTabs || activeTab === 'screening') && (
                    <>
                        {/* Metrics */}
                        {(isCompleted || metrics.total_resumes > 0) && (
                            <div className="job-content grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                                {[
                                    { label: 'Total Resumes', value: metrics.total_resumes, icon: '📄', color: 'text-slate-700' },
                                    { label: 'Shortlisted', value: metrics.shortlisted, icon: '✅', color: 'text-emerald-600' },
                                    { label: 'Rejected', value: metrics.rejected, icon: '❌', color: 'text-red-500' },
                                    { label: 'Avg Score', value: `${metrics.avg_score}%`, icon: '📊', color: 'text-violet-600' },
                                    { label: 'Top Score', value: `${metrics.max_score}%`, icon: '🏆', color: 'text-amber-600' },
                                    { label: 'Min Score', value: `${metrics.min_score}%`, icon: '📉', color: 'text-slate-500' },
                                ].map(m => (
                                    <div key={m.label} className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/80 p-4 text-center shadow-[0_8px_32px_rgba(139,92,246,0.05)] hover:-translate-y-1 transition-transform">
                                        <div className="text-2xl mb-1">{m.icon}</div>
                                        <div className={`text-2xl font-extrabold ${m.color}`}
                                            style={{ fontFamily: 'Syne, sans-serif' }}>{m.value}</div>
                                        <div className="text-xs text-slate-400 mt-1">{m.label}</div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Candidates */}
                        {candidates.length > 0 && (
                            <div className="job-content bg-white/80 backdrop-blur-xl rounded-3xl border border-white/80 shadow-[0_8px_32px_rgba(139,92,246,0.05)] overflow-hidden">
                                <div className="p-6 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
                                    <h2 className="text-lg font-bold text-[#0a1628]" style={{ fontFamily: 'Syne, sans-serif' }}>
                                        Candidates ({filteredCandidates.length})
                                    </h2>
                                    <div className="flex gap-2 bg-slate-50 p-1 rounded-xl">
                                        {['all', 'shortlisted', 'rejected', 'pending'].map(f => (
                                            <button key={f} onClick={() => setFilter(f)}
                                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all border-none cursor-pointer capitalize
                                                    ${filter === f ? 'bg-violet-600 text-white shadow-md' : 'bg-transparent text-slate-500 hover:text-slate-800'}`}>
                                                {f}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="divide-y divide-slate-100">
                                    {filteredCandidates.length === 0 ? (
                                        <div className="p-12 text-center text-slate-400">No candidates in this category</div>
                                    ) : (
                                        filteredCandidates.map((c, idx) => (
                                            <div key={c.id} className="flex items-center gap-4 p-5 hover:bg-slate-50 transition-colors">
                                                {/* Rank */}
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-500 flex-shrink-0">
                                                    {idx + 1}
                                                </div>

                                                {/* Avatar */}
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0
                          ${c.status === 'shortlisted' ? 'bg-emerald-500' : c.status === 'rejected' ? 'bg-red-400' : 'bg-slate-400'}`}>
                                                    {c.name.charAt(0).toUpperCase()}
                                                </div>

                                                {/* Info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <p className="font-semibold text-[#0a1628] text-sm">{c.name}</p>
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold
                              ${c.status === 'shortlisted' ? 'bg-emerald-50 text-emerald-700' :
                                                                c.status === 'rejected' ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
                                                            {c.status}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-slate-400 truncate">{c.email || 'No email'}</p>
                                                </div>

                                                {/* Score Bar */}
                                                <div className="hidden md:flex flex-col items-end gap-1 w-32">
                                                    <span className={`text-lg font-extrabold ${scoreColor(c.match_score)}`}
                                                        style={{ fontFamily: 'Syne, sans-serif' }}>
                                                        {c.match_score}%
                                                    </span>
                                                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                        <div className={`h-full rounded-full ${scoreBg(c.match_score)}`}
                                                            style={{ width: `${c.match_score}%` }} />
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex gap-2 flex-shrink-0">
                                                    <button onClick={() => setSelectedCandidate(c)}
                                                        className="px-3 py-1.5 text-xs font-semibold text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors bg-transparent cursor-pointer">
                                                        Report
                                                    </button>
                                                    <button onClick={() => handleDownload(c.id, c.file_name)}
                                                        className="px-3 py-1.5 text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors bg-transparent cursor-pointer">
                                                        Resume
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Empty state */}
                        {candidates.length === 0 && !isProcessing && (
                            <div className="job-content bg-white rounded-2xl border border-slate-200 p-16 text-center">
                                <div className="text-5xl mb-4">📭</div>
                                <h3 className="text-lg font-bold text-[#0a1628] mb-2">No resumes yet</h3>
                                <p className="text-slate-400 text-sm">Upload resumes first, then start screening.</p>
                            </div>
                        )}
                    </>
                )}

                {/* ── INTERVIEW RESULTS TAB ── */}
                {showTabs && activeTab === 'interview' && (
                    <div className="job-content">
                        {loadingResults ? (
                            <div className="flex items-center justify-center py-16">
                                <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : !interviewResults ? (
                            <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/80 p-16 text-center shadow-[0_8px_32px_rgba(139,92,246,0.05)]">
                                <div className="text-5xl mb-4">🎯</div>
                                <h3 className="text-lg font-bold text-[#0a1628] mb-2">No Interview Data Yet</h3>
                                <p className="text-slate-400 text-sm">Interview results will appear here after candidates complete their interviews.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {/* Interview Info */}
                                <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/80 p-5 flex items-center justify-around flex-wrap gap-6 shadow-[0_8px_32px_rgba(139,92,246,0.05)]">
                                    {[
                                        { label: 'Date', value: interviewResults.interview.scheduled_date, icon: '📅' },
                                        { label: 'Time', value: interviewResults.interview.start_time, icon: '⏰' },
                                        { label: 'Duration', value: `${interviewResults.interview.duration_minutes} min`, icon: '⏱️' },
                                        { label: 'Total Candidates', value: interviewResults.candidates.length, icon: '👥' },
                                        { label: 'Interviewed', value: interviewResults.candidates.filter(c => c.interviewed).length, icon: '✅' },
                                    ].map(item => (
                                        <div key={item.label} className="text-center px-4">
                                            <div className="text-2xl mb-1">{item.icon}</div>
                                            <div className="text-xl font-extrabold text-[#0a1628]" style={{ fontFamily: 'Syne, sans-serif' }}>{item.value}</div>
                                            <div className="text-xs text-slate-400 uppercase tracking-wider mt-1">{item.label}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Ranked List */}
                                <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/80 shadow-[0_8px_32px_rgba(139,92,246,0.05)] overflow-hidden">
                                    <div className="p-6 border-b border-slate-100/50">
                                        <h2 className="text-lg font-bold text-[#0a1628]" style={{ fontFamily: 'Syne, sans-serif' }}>
                                            🏆 Final Candidate Rankings
                                        </h2>
                                        <p className="text-slate-400 text-xs mt-1">Sorted by interview performance score</p>
                                    </div>
                                    <div className="divide-y divide-slate-100">
                                        {interviewResults.candidates.map((c, idx) => (
                                            <div key={c.candidate_id} className="flex items-center gap-4 p-5 hover:bg-slate-50 transition-colors">
                                                {/* Rank */}
                                                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-extrabold flex-shrink-0
                                                    ${idx === 0 ? 'bg-amber-100 text-amber-700' : idx === 1 ? 'bg-slate-100 text-slate-600' : idx === 2 ? 'bg-orange-50 text-orange-600' : 'bg-slate-50 text-slate-400'}`}>
                                                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                                                </div>

                                                {/* Avatar */}
                                                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                                                    style={{ background: c.interviewed ? 'linear-gradient(135deg, #2563eb, #1e40af)' : '#94a3b8' }}>
                                                    {c.name.charAt(0).toUpperCase()}
                                                </div>

                                                {/* Info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <p className="font-semibold text-[#0a1628] text-sm">{c.name}</p>
                                                        {!c.interviewed && (
                                                            <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded-full">Not interviewed</span>
                                                        )}
                                                        {c.tab_switches > 0 && (
                                                            <span className="px-2 py-0.5 bg-red-50 text-red-500 text-xs rounded-full">⚠️ {c.tab_switches} tab switch</span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-slate-400">{c.email}</p>
                                                </div>

                                                {/* Score breakdown */}
                                                {c.interviewed && (
                                                    <div className="hidden lg:flex items-center gap-4 text-xs text-slate-400">
                                                        <div className="text-center">
                                                            <div className="font-bold text-blue-600">{c.verbal_score ?? '—'}%</div>
                                                            <div>Verbal</div>
                                                        </div>
                                                        <div className="text-center">
                                                            <div className="font-bold text-amber-600">{c.mcq_score ?? '—'}%</div>
                                                            <div>MCQ</div>
                                                        </div>
                                                        <div className="text-center">
                                                            <div className="font-bold text-violet-600">{c.coding_score ?? '—'}%</div>
                                                            <div>Coding</div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Final Score */}
                                                <div className="flex items-center gap-3">
                                                    {c.interviewed ? (
                                                        <div className="text-right">
                                                            <div className={`text-xl font-extrabold ${c.final_score >= 70 ? 'text-emerald-600' : c.final_score >= 50 ? 'text-amber-600' : 'text-red-500'}`}
                                                                style={{ fontFamily: 'Syne, sans-serif' }}>
                                                                {c.final_score}%
                                                            </div>
                                                            <div className="text-xs text-slate-400">Final Score</div>
                                                        </div>
                                                    ) : (
                                                        <div className="text-slate-300 text-sm font-medium">—</div>
                                                    )}

                                                    <button
                                                        onClick={() => router.push(`/dashboard/jobs/${id}/interview/${c.interview_id}/candidate/${c.candidate_id}`)}
                                                        className="px-4 py-1.5 text-xs font-semibold text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors bg-transparent cursor-pointer">
                                                        See Detail
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}