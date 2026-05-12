// app/dashboard/jobs/[id]/page.js
'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import gsap from 'gsap';
import api from '@/lib/api';
// No icons used on this page — editorial style

const statusConfig = {
    draft: { bg: 'rgba(28,27,46,0.06)', color: '#64608a', label: 'Draft' },
    active: { bg: 'rgba(127,165,130,0.10)', color: '#4a7c4f', label: 'Active' },
    processing: { bg: 'rgba(244,162,140,0.15)', color: '#c06a4e', label: 'Processing...' },
    screened: { bg: 'rgba(233,194,106,0.15)', color: '#9a7e2e', label: 'Screened' },
    interview_scheduled: { bg: 'rgba(127,165,130,0.10)', color: '#4a7c4f', label: 'Interview Scheduled' },
    closed: { bg: 'rgba(220,80,60,0.08)', color: '#b33a2a', label: 'Closed' },
    archived: { bg: 'rgba(28,27,46,0.06)', color: '#64608a', label: 'Archived' },
};

const scoreColor = (score) => {
    if (score >= 75) return '#4a7c4f';
    if (score >= 55) return '#c06a4e';
    return '#b33a2a';
};

const scoreBg = (score) => {
    if (score >= 75) return '#7FA582';
    if (score >= 55) return '#F4A28C';
    return '#E88A72';
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
        <div className="flex items-center justify-center h-screen bg-[#FBF8F2]">
            <div className="w-10 h-10 border-4 border-[#1C1B2E] border-t-transparent rounded-full animate-spin" />
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
        <div ref={pageRef} className="min-h-screen relative overflow-hidden" style={{ background: '#FBF8F2' }}>
            {/* Background Orbs */}
            <div className="pointer-events-none absolute inset-0 z-0">
                <div className="absolute w-[500px] h-[500px] top-[-10%] right-[-5%] rounded-full bg-gradient-to-br from-[#9DBF9E]/25 to-[#F4A28C]/20 blur-3xl" />
                <div className="absolute w-[400px] h-[400px] bottom-[10%] left-[-10%] rounded-full bg-gradient-to-br from-[#F4D58D]/25 to-[#9DBF9E]/20 blur-3xl" />
                <div className="absolute w-[300px] h-[300px] top-[40%] right-[20%] rounded-full bg-gradient-to-br from-[#F4D58D]/20 to-[#F4A28C]/15 blur-3xl" />
            </div>

            {/* Candidate Report Modal */}
            {selectedCandidate && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
                    onClick={() => setSelectedCandidate(null)}>
                    <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                        style={{ boxShadow: '0 25px 80px rgba(0,0,0,0.25)' }}
                        onClick={e => e.stopPropagation()}>
                        <div className="p-8 border-b border-white/10 flex items-center justify-between relative overflow-hidden"
                            style={{ background: selectedCandidate.status === 'shortlisted' ? 'linear-gradient(135deg, #1C1B2E 0%, #2D4A3E 50%, #7FA582 100%)' : 'linear-gradient(135deg, #1C1B2E 0%, #8E4530 50%, #E88A72 100%)' }}>
                            <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full blur-3xl opacity-25 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.30), transparent 70%)' }} />
                            <div className="relative z-10">
                                <h3 className="text-2xl font-extrabold text-white mb-1" style={{ fontFamily: 'Syne, sans-serif', letterSpacing: '-0.02em', lineHeight: 1.1 }}>{selectedCandidate.name}</h3>
                                <p className="text-white/80 text-sm" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', letterSpacing: '0.01em' }}>{selectedCandidate.email}</p>
                            </div>
                            <div className="flex items-center gap-5 relative z-10">
                                <div className="text-center px-5 py-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
                                    <div className="text-4xl font-extrabold text-white" style={{ fontFamily: 'Syne, sans-serif', letterSpacing: '-0.02em' }}>{selectedCandidate.match_score}%</div>
                                    <div className="text-white/80 text-xs font-semibold" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Match Score</div>
                                </div>
                                <button onClick={() => setSelectedCandidate(null)}
                                    className="w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center border-none cursor-pointer hover:bg-white/30 hover:scale-110 transition-all text-xl font-light" style={{ backdropFilter: 'blur(10px)' }}>
                                    ×
                                </button>
                            </div>
                        </div>

                        <div className="p-8 flex flex-col gap-6">
                            {/* Status */}
                            <div className="px-5 py-4 rounded-xl text-sm font-semibold flex items-center gap-3"
                                style={selectedCandidate.status === 'shortlisted'
                                    ? { background: 'linear-gradient(135deg, rgba(127,165,130,0.12), rgba(127,165,130,0.06))', color: '#4a7c4f', border: '1px solid rgba(127,165,130,0.25)', boxShadow: '0 2px 12px rgba(127,165,130,0.15)' }
                                    : { background: 'linear-gradient(135deg, rgba(220,80,60,0.10), rgba(220,80,60,0.05))', color: '#b33a2a', border: '1px solid rgba(220,80,60,0.20)', boxShadow: '0 2px 12px rgba(220,80,60,0.12)' }}>
                                {selectedCandidate.status === 'shortlisted' ? 'Shortlisted for Interview' : 'Not Selected'}
                                {selectedCandidate.status === 'rejected' && selectedCandidate.rejection_reason && (
                                    <span className="font-normal ml-1">— {selectedCandidate.rejection_reason}</span>
                                )}
                            </div>

                            {/* Score Breakdown */}
                            <div className="p-5 rounded-2xl" style={{ background: 'linear-gradient(135deg, #FDFCF9, #F5F3ED)', border: '1px solid #e8e5df' }}>
                                <h4 style={{ fontSize: 12, fontWeight: 800, color: '#1C1B2E', margin: '0 0 20px', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'Syne, sans-serif' }}>Score Breakdown</h4>
                                {[
                                    { label: 'Skills Match', score: selectedCandidate.skills_score, weight: '35%' },
                                    { label: 'Experience', score: selectedCandidate.experience_score, weight: '25%' },
                                    { label: 'Project Match', score: Math.round((selectedCandidate.score_breakdown?.projects?.score ?? 0) * 100), weight: '20%' },
                                    { label: 'Education', score: selectedCandidate.education_score, weight: '10%' },
                                    { label: 'Semantic Match', score: selectedCandidate.semantic_score, weight: '10%' },
                                ].map(item => (
                                    <div key={item.label} className="mb-5" style={{ marginBottom: item.label === 'Semantic Match' ? '0' : '20px' }}>
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-sm text-[#64608a] font-semibold" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', letterSpacing: '0.01em' }}>{item.label}</span>
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs text-[#94a3b8] font-medium">weight {item.weight}</span>
                                                <span style={{ fontSize: 17, fontWeight: 800, color: scoreColor(item.score), fontFamily: 'Syne, sans-serif', letterSpacing: '-0.01em' }}>{item.score}%</span>
                                            </div>
                                        </div>
                                        <div className="h-3 bg-[#f3f1ec] rounded-full overflow-hidden" style={{ boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.08)' }}>
                                            <div className="h-full rounded-full transition-all"
                                                style={{ width: `${item.score}%`, background: `linear-gradient(90deg, ${scoreBg(item.score)}, ${item.score >= 75 ? '#9DBF9E' : item.score >= 55 ? '#F4D58D' : '#F4A28C'})`, boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }} />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Parsed Info */}
                            {selectedCandidate.score_breakdown && (
                                <div className="grid grid-cols-2 gap-5">
                                    {selectedCandidate.score_breakdown.skills && (
                                        <div className="p-5 rounded-2xl" style={{ background: 'linear-gradient(135deg, #FDFCF9, #F5F3ED)', border: '1px solid #e8e5df', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                                            <p style={{ fontSize: 10, fontWeight: 800, color: '#64608a', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'Syne, sans-serif' }}>Skills</p>
                                            <p className="text-sm text-[#1C1B2E] font-medium" style={{ fontFamily: 'Syne, sans-serif' }}>
                                                Matched: {selectedCandidate.score_breakdown.skills.matched_required?.join(', ') || 'None'}
                                            </p>
                                            {selectedCandidate.score_breakdown.skills.missing_required?.length > 0 && (
                                                <p className="text-sm mt-2" style={{ color: '#b33a2a', fontWeight: 500, fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                                                    Missing: {selectedCandidate.score_breakdown.skills.missing_required.join(', ')}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                    {selectedCandidate.score_breakdown.experience && (
                                        <div className="p-5 rounded-2xl" style={{ background: 'linear-gradient(135deg, #FDFCF9, #F5F3ED)', border: '1px solid #e8e5df', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                                            <p style={{ fontSize: 10, fontWeight: 800, color: '#64608a', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'Syne, sans-serif' }}>Experience</p>
                                            <p className="text-sm text-[#1C1B2E] font-medium" style={{ fontFamily: 'Syne, sans-serif' }}>
                                                {selectedCandidate.score_breakdown.experience.total_years} years actual
                                            </p>
                                            <p className="text-sm text-[#94a3b8] mt-2" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                                                Min required: {selectedCandidate.score_breakdown.experience.expected_min} years
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Projects Section */}
                            {selectedCandidate.score_breakdown?.projects && (
                                <div className="p-5 rounded-2xl" style={{ background: 'linear-gradient(135deg, #FDFCF9, #F5F3ED)', border: '1px solid #e8e5df', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                                    <p style={{ fontSize: 10, fontWeight: 800, color: '#64608a', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'Syne, sans-serif' }}>Projects</p>
                                    <p className="text-sm text-[#1C1B2E] font-medium" style={{ fontFamily: 'Syne, sans-serif' }}>
                                        {selectedCandidate.score_breakdown.projects.relevant_projects} of{' '}
                                        {selectedCandidate.score_breakdown.projects.total_projects} projects relevant
                                    </p>
                                    {selectedCandidate.score_breakdown.projects.matched_techs?.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {selectedCandidate.score_breakdown.projects.matched_techs.map((t, i) => (
                                                <span key={i} className="px-2 py-1 text-sm rounded" style={{ background: 'rgba(127,165,130,0.10)', color: '#4a7c4f', border: '1px solid rgba(127,165,130,0.15)', fontWeight: 500 }}>
                                                    {t}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    {selectedCandidate.score_breakdown.projects.relevant_projects === 0 && (
                                        <p className="text-sm mt-2" style={{ color: '#b33a2a', fontWeight: 500, fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}>No relevant projects found</p>
                                    )}
                                </div>
                            )}

                            {/* Experience Relevance */}
                            {selectedCandidate.score_breakdown?.experience && (
                                <div className="p-5 rounded-2xl" style={{ background: 'linear-gradient(135deg, #FDFCF9, #F5F3ED)', border: '1px solid #e8e5df', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                                    <p style={{ fontSize: 10, fontWeight: 800, color: '#64608a', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'Syne, sans-serif' }}>Experience</p>
                                    <p className="text-sm text-[#1C1B2E] font-medium" style={{ fontFamily: 'Syne, sans-serif' }}>
                                        {selectedCandidate.score_breakdown.experience.relevant_years ?? 0} relevant years
                                        {' '}(of {selectedCandidate.score_breakdown.experience.total_years ?? 0} total)
                                    </p>
                                    <p className="text-sm text-[#94a3b8] mt-2" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                                        Relevance: {Math.round((selectedCandidate.score_breakdown.experience.relevance_ratio ?? 0) * 100)}%
                                        {' '}• Min required: {selectedCandidate.score_breakdown.experience.expected_min ?? 0} years
                                    </p>
                                </div>
                            )}

                            {/* Download */}
                            <button
                                onClick={() => handleDownload(selectedCandidate.id, selectedCandidate.file_name)}
                                className="w-full py-4 text-white text-sm font-semibold rounded-xl cursor-pointer transition-all hover:scale-[1.02] shadow-lg"
                                style={{ background: 'linear-gradient(135deg, #1C1B2E, #2D4A3E)', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                                Download Resume
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="relative z-10 px-10 py-8 max-w-6xl mx-auto">
                {/* Back */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                    <button onClick={() => router.push('/dashboard/jobs')}
                        className="text-sm text-[#64608a] hover:text-[#1C1B2E] transition-colors bg-transparent border-none cursor-pointer font-medium" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                        ← Back to Jobs
                    </button>
                </div>

                {/* Job Header */}
                <div className="page-header rounded-2xl border border-[#e8e5df] overflow-hidden mb-8" style={{ background: '#fff' }}>
                    <div className="p-8 relative">
                        <div className="flex items-start justify-between flex-wrap gap-4">
                            <div>
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="px-3 py-1 rounded-full text-[11px] font-semibold" style={{ background: status.bg, color: status.color }}>
                                        {status.label}
                                    </span>
                                    {job.department && (
                                        <span className="text-[#64608a] text-xs font-medium">{job.department}</span>
                                    )}
                                    {job.location && (
                                        <span className="text-[#64608a] text-xs font-medium">· {job.location}</span>
                                    )}
                                </div>
                                <h1 className="text-3xl font-bold text-[#1C1B2E] mb-3" style={{ fontFamily: 'Syne, sans-serif', letterSpacing: '-0.01em', lineHeight: 1.2 }}>{job.title}</h1>
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {job.skills.map((s, i) => (
                                        <span key={i}
                                            className={`px-3 py-1 rounded-full text-[11px] font-medium
                        ${s.is_required ? 'bg-[#1C1B2E] text-white' : 'bg-[#FDFCF9] text-[#64608a] border border-[#e8e5df]'}`} style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                                            {s.skill_name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-2 flex-wrap">
                                <button onClick={() => router.push(`/dashboard/jobs/${id}/edit`)}
                                    className="px-4 py-2 text-[#1C1B2E] text-xs font-medium rounded-lg border border-[#e8e5df] cursor-pointer transition-colors hover:bg-[#FDFCF9] bg-white" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                                    Edit Job
                                </button>

                                {job.status === 'active' && (
                                    <button onClick={handleScreen} disabled={screening}
                                        className="px-5 py-2 text-white text-xs font-medium rounded-lg border-none cursor-pointer disabled:opacity-60 transition-colors"
                                        style={{ background: '#1C1B2E', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                                        {screening ? 'Starting…' : 'Start Screening'}
                                    </button>
                                )}

                                {(job.status === 'screened' || isCompleted) && (
                                    <button onClick={() => router.push(`/dashboard/jobs/${id}/schedule`)}
                                        className="px-5 py-2 text-white text-xs font-medium rounded-lg border-none cursor-pointer transition-colors"
                                        style={{ background: '#7FA582', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                                        Schedule Interviews
                                    </button>
                                )}

                                {job.status === 'interview_scheduled' && (
                                    <button onClick={() => router.push(`/dashboard/jobs/${id}/schedule`)}
                                        className="px-5 py-2 text-white text-xs font-medium rounded-lg border-none cursor-pointer transition-colors"
                                        style={{ background: '#7FA582', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                                        Reschedule Interview
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Job Description */}
                        <div className="mt-6 pt-6 border-t border-[#e8e5df]">
                            <p className="text-[#64608a] text-sm leading-relaxed max-w-3xl" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', lineHeight: 1.7 }}>{job.description}</p>
                        </div>
                    </div>
                </div>

                {/* Processing Banner */}
                {isProcessing && (
                    <div className="job-content bg-amber-50/80 backdrop-blur-md border border-amber-200 rounded-2xl p-5 mb-6 flex items-center gap-4 shadow-sm">
                        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                        <div>
                            <p className="font-semibold text-amber-800" style={{ fontFamily: 'Syne, sans-serif' }}>Screening in Progress</p>
                            <p className="text-sm text-amber-600" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}>AI is analyzing all resumes. You can leave this page — results will be ready when you return.</p>
                        </div>
                    </div>
                )}

                {/* Tabs */}
                {showTabs && (
                    <div className="job-content flex gap-1 bg-white rounded-2xl border border-[#e8e5df] p-1.5 mb-6">
                        {[
                            { id: 'screening', label: 'Resume Screening' },
                            { id: 'interview', label: 'Interview Results' },
                        ].map(tab => (
                            <button key={tab.id}
                                onClick={() => handleTabChange(tab.id)}
                                className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all border-none cursor-pointer
                                    ${activeTab === tab.id ? 'bg-[#1C1B2E] text-white' : 'bg-transparent text-[#64608a] hover:text-[#1C1B2E]'}`}>
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
                            <div className="job-content grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8 bg-white rounded-2xl border border-[#e8e5df] p-6">
                                {[
                                    { label: 'Total Resumes', value: metrics.total_resumes, accent: '#1C1B2E', sub: 'Uploaded' },
                                    { label: 'Shortlisted', value: metrics.shortlisted, accent: '#7FA582', sub: 'Passed screening' },
                                    { label: 'Rejected', value: metrics.rejected, accent: '#E88A72', sub: 'Did not match' },
                                    { label: 'Avg Score', value: `${metrics.avg_score}%`, accent: '#E9C26A', sub: 'Overall average' },
                                    { label: 'Top Score', value: `${metrics.max_score}%`, accent: '#E9C26A', sub: 'Highest match' },
                                    { label: 'Min Score', value: `${metrics.min_score}%`, accent: '#807E94', sub: 'Lowest match' },
                                ].map((m, i) => (
                                    <div key={m.label} className="flex flex-col">
                                        <p style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px' }}>{m.label}</p>
                                        <p style={{ fontSize: 24, fontWeight: 700, color: m.accent, lineHeight: 1, fontFamily: 'Syne, sans-serif' }}>{m.value}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Candidates */}
                        {candidates.length > 0 && (
                            <div className="job-content bg-white rounded-2xl border border-[#e8e5df] overflow-hidden">
                                <div className="p-6 border-b border-[#e8e5df] flex items-center justify-between flex-wrap gap-4">
                                    <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1C1B2E', margin: 0, fontFamily: 'Syne, sans-serif' }}>
                                        Candidates ({filteredCandidates.length})
                                    </h2>
                                    <div className="flex gap-1 bg-[#FDFCF9] p-1.5 rounded-xl border border-[#e8e5df]">
                                        {['all', 'shortlisted', 'rejected', 'pending'].map(f => (
                                            <button key={f} onClick={() => setFilter(f)}
                                                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all border-none cursor-pointer capitalize
                                                    ${filter === f ? 'bg-[#1C1B2E] text-white' : 'bg-transparent text-[#64608a] hover:text-[#1C1B2E]'}`}>
                                                {f === 'all' ? 'All' : f}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="divide-y divide-[#f3f1ec]">
                                    {filteredCandidates.length === 0 ? (
                                        <div className="p-16 text-center text-[#807E94]">No candidates in this category</div>
                                    ) : (
                                        filteredCandidates.map((c, idx) => (
                                            <div key={c.id} 
                                                style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 24px', borderBottom: idx < filteredCandidates.length - 1 ? '1px solid #f3f1ec' : 'none', transition: 'background-color 0.2s', cursor: 'pointer' }}
                                                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#FDFCF9'; }}
                                                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
                                                {/* Rank */}
                                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold flex-shrink-0"
                                                    style={{ background: idx === 0 ? '#f3e9c8' : idx === 1 ? '#f3f1ec' : idx === 2 ? '#f3e5d8' : '#f9f8f5', color: idx === 0 ? '#9a7e2e' : '#64608a' }}>
                                                    {idx + 1}
                                                </div>

                                                {/* Avatar */}
                                                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                                                    style={{ background: '#1C1B2E' }}>
                                                    {c.name.charAt(0).toUpperCase()}
                                                </div>

                                                {/* Info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <p className="font-semibold text-[#1C1B2E] text-sm">{c.name}</p>
                                                        <span className="px-2.5 py-1 rounded-md text-[10px] font-semibold capitalize"
                                                            style={c.status === 'shortlisted' ? { background: 'rgba(127,165,130,0.10)', color: '#4a7c4f' } :
                                                                c.status === 'rejected' ? { background: 'rgba(244,162,140,0.15)', color: '#c06a4e' } :
                                                                    { background: 'rgba(28,27,46,0.04)', color: '#64608a' }}>
                                                            {c.status}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-xs text-[#94a3b8]">
                                                        <span className="truncate">{c.email || 'No email'}</span>
                                                        {c.phone && <span>{c.phone}</span>}
                                                    </div>
                                                </div>

                                                {/* Score Breakdown Mini */}
                                                <div className="hidden lg:flex items-center gap-6 text-[10px] text-[#94a3b8] uppercase tracking-wider">
                                                    <div className="text-center">
                                                        <div className="font-extrabold text-[#1C1B2E] text-sm" style={{ fontFamily: 'Syne, sans-serif' }}>{c.skills_score}%</div>
                                                        <div>Skills</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="font-extrabold text-[#1C1B2E] text-sm" style={{ fontFamily: 'Syne, sans-serif' }}>{c.experience_score}%</div>
                                                        <div>Exp</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="font-extrabold text-[#1C1B2E] text-sm" style={{ fontFamily: 'Syne, sans-serif' }}>{c.education_score}%</div>
                                                        <div>Edu</div>
                                                    </div>
                                                </div>

                                                {/* Score Bar */}
                                                <div className="hidden md:flex flex-col items-end gap-2 w-32">
                                                    <span style={{ fontSize: 18, fontWeight: 800, color: '#1C1B2E', fontFamily: 'Syne, sans-serif' }}>
                                                        {c.match_score}%
                                                    </span>
                                                    <div className="w-full h-1.5 bg-[#f3f1ec] rounded-full overflow-hidden">
                                                        <div className="h-full rounded-full"
                                                            style={{ width: `${c.match_score}%`, background: c.match_score >= 75 ? '#7FA582' : c.match_score >= 55 ? '#F4A28C' : '#E88A72' }} />
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex gap-2 flex-shrink-0">
                                                    <button onClick={() => setSelectedCandidate(c)}
                                                        className="px-4 py-2 text-xs font-semibold text-white bg-[#1C1B2E] rounded-lg border-none cursor-pointer hover:opacity-80 transition-opacity">
                                                        Report
                                                    </button>
                                                    <button onClick={() => handleDownload(c.id, c.file_name)}
                                                        className="px-4 py-2 text-xs font-semibold text-[#1C1B2E] border border-[#e8e5df] rounded-lg hover:bg-[#FDFCF9] bg-white cursor-pointer">
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
                            <div className="job-content bg-white rounded-2xl border border-[#e8e5df] p-16 text-center">
                                <h3 className="text-lg font-bold text-[#1C1B2E] mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>No resumes yet</h3>
                                <p className="text-[#807E94] text-sm" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}>Upload resumes first, then start screening.</p>
                            </div>
                        )}
                    </>
                )}

                {/* ── INTERVIEW RESULTS TAB ── */}
                {showTabs && activeTab === 'interview' && (
                    <div className="job-content">
                        {loadingResults ? (
                            <div className="flex items-center justify-center py-16">
                                <div className="w-8 h-8 border-4 border-[#1C1B2E] border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : !interviewResults ? (
                            <div className="bg-white rounded-2xl border border-[#e8e5df] p-16 text-center">
                                                                <h3 className="text-lg font-bold text-[#1C1B2E] mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>No Interview Data Yet</h3>
                                <p className="text-[#807E94] text-sm" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}>Interview results will appear here after candidates complete their interviews.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {/* Interview Info */}
                                <div className="bg-white rounded-2xl border border-[#e8e5df] p-6 grid grid-cols-2 md:grid-cols-5 gap-4">
                                    {[
                                        { label: 'Date', value: interviewResults.interview.scheduled_date, accent: '#1C1B2E', sub: 'Scheduled' },
                                        { label: 'Time', value: interviewResults.interview.start_time, accent: '#7FA582', sub: 'Start time' },
                                        { label: 'Duration', value: `${interviewResults.interview.duration_minutes} min`, accent: '#F4A28C', sub: 'Length' },
                                        { label: 'Total', value: interviewResults.candidates.length, accent: '#E9C26A', sub: 'Candidates' },
                                        { label: 'Interviewed', value: interviewResults.candidates.filter(c => c.interviewed).length, accent: '#807E94', sub: 'Completed' },
                                    ].map((item, i) => (
                                        <div key={item.label} className="flex flex-col">
                                            <span style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px' }}>{item.label}</span>
                                            <span style={{ fontSize: 20, fontWeight: 700, color: item.accent, fontFamily: 'Syne, sans-serif' }}>{item.value}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Ranked List */}
                                <div className="bg-white rounded-2xl border border-[#e8e5df] overflow-hidden">
                                    <div className="p-6 border-b border-[#e8e5df]">
                                        <h2 style={{ fontSize: 15, fontWeight: 600, color: '#1C1B2E', margin: 0, fontFamily: 'Syne, sans-serif' }}>Candidate Rankings</h2>
                                    </div>
                                    <div className="divide-y divide-[#f3f1ec]">
                                        {interviewResults.candidates.map((c, idx) => (
                                            <div key={c.candidate_id} 
                                                style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 24px', borderBottom: idx < interviewResults.candidates.length - 1 ? '1px solid #f3f1ec' : 'none', transition: 'background-color 0.2s', cursor: 'pointer' }}
                                                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#FDFCF9'; }}
                                                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
                                                {/* Rank */}
                                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0"
                                                    style={{ background: '#f3f1ec', color: '#64608a' }}>
                                                    {idx + 1}
                                                </div>

                                                {/* Avatar */}
                                                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-medium flex-shrink-0"
                                                    style={{ background: '#f3f1ec', color: '#64608a' }}>
                                                    {c.name.charAt(0).toUpperCase()}
                                                </div>

                                                {/* Info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <p className="font-semibold text-[#1C1B2E] text-sm">{c.name}</p>
                                                        {!c.interviewed && (
                                                            <span className="px-2.5 py-1 text-[10px] rounded-md font-medium" style={{ background: 'rgba(28,27,46,0.04)', color: '#64608a' }}>Not interviewed</span>
                                                        )}
                                                        {c.tab_switches > 0 && (
                                                            <span className="px-2.5 py-1 text-[10px] rounded-md font-medium" style={{ background: 'rgba(244,162,140,0.15)', color: '#c06a4e', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}>{c.tab_switches} tab switch</span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-[#94a3b8]" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}>{c.email}</p>
                                                </div>

                                                {/* Score breakdown */}
                                                {c.interviewed && (
                                                    <div className="hidden lg:flex items-center gap-5 text-xs text-[#94a3b8]">
                                                        <div className="text-center">
                                                            <div className="font-semibold text-[#1C1B2E] text-sm" style={{ fontFamily: 'Syne, sans-serif' }}>{c.verbal_score ?? '—'}%</div>
                                                            <div style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', fontSize: 11 }}>Verbal</div>
                                                        </div>
                                                        <div className="text-center">
                                                            <div className="font-semibold text-[#1C1B2E] text-sm" style={{ fontFamily: 'Syne, sans-serif' }}>{c.mcq_score ?? '—'}%</div>
                                                            <div style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', fontSize: 11 }}>MCQ</div>
                                                        </div>
                                                        <div className="text-center">
                                                            <div className="font-semibold text-[#1C1B2E] text-sm" style={{ fontFamily: 'Syne, sans-serif' }}>{c.coding_score ?? '—'}%</div>
                                                            <div style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', fontSize: 11 }}>Coding</div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Final Score */}
                                                <div className="flex items-center gap-3">
                                                    {c.interviewed ? (
                                                        <div className="text-right">
                                                            <div style={{ fontSize: 18, fontWeight: 700, color: '#1C1B2E', fontFamily: 'Syne, sans-serif' }}>
                                                                {c.final_score}%
                                                            </div>
                                                            <div style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', fontSize: 11, color: '#94a3b8' }}>Final</div>
                                                        </div>
                                                    ) : (
                                                        <div className="text-[#94a3b8] text-sm font-medium">—</div>
                                                    )}

                                                    <button
                                                        onClick={() => router.push(`/dashboard/jobs/${id}/interview/${c.interview_id}/candidate/${c.candidate_id}`)}
                                                        className="px-3 py-1.5 text-xs font-medium text-[#64608a] hover:text-[#1C1B2E] cursor-pointer bg-transparent border-none"
                                                        style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                                                        View →
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