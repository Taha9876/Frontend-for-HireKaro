'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import gsap from 'gsap';
import {
    ArrowLeft, Download, Video, MessageSquare, ListChecks, Code2,
    CheckCircle2, XCircle, Sparkles, AlertTriangle, User, Mail, Trophy
} from 'lucide-react';
import api from '@/lib/api';

const typeMeta = {
    verbal: { label: 'Verbal', Icon: MessageSquare, chip: 'bg-pink-50 text-pink-700 border-pink-200' },
    mcq: { label: 'MCQ', Icon: ListChecks, chip: 'bg-amber-50 text-amber-700 border-amber-200' },
    coding: { label: 'Coding', Icon: Code2, chip: 'bg-violet-50 text-violet-700 border-violet-200' },
};

function ScoreBar({ score }) {
    const gradient = score >= 70
        ? 'from-emerald-400 to-teal-500'
        : score >= 50
            ? 'from-amber-400 to-orange-500'
            : 'from-rose-400 to-pink-500';
    const text = score >= 70 ? 'text-emerald-600' : score >= 50 ? 'text-amber-600' : 'text-rose-500';
    return (
        <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full bg-gradient-to-r ${gradient} transition-all`} style={{ width: `${score}%` }} />
            </div>
            <span className={`text-sm font-bold w-12 text-right ${text}`}>{score}%</span>
        </div>
    );
}

function StatCard({ label, value, suffix = '%', Icon, accent }) {
    return (
        <div className="relative p-5 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_4px_20px_rgba(139,92,246,0.05)] overflow-hidden">
            <div className={`absolute -top-6 -right-6 w-20 h-20 rounded-full bg-gradient-to-br ${accent} opacity-20 blur-xl`} />
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${accent} flex items-center justify-center text-white shadow-md mb-3`}>
                <Icon size={18} />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
                {value ?? 0}{suffix}
            </div>
            <div className="text-xs text-slate-500 mt-1 font-medium">{label}</div>
        </div>
    );
}

export default function CandidateDetailPage() {
    const { id, interviewId, candidateId } = useParams();
    const router = useRouter();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const pageRef = useRef(null);

    useEffect(() => {
        api.get(`/api/v1/jobs/interview/${interviewId}/candidate/${candidateId}/detail`)
            .then(res => setData(res.data))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [interviewId, candidateId]);

    useEffect(() => {
        if (loading || !pageRef.current) return;
        const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
        tl.fromTo('.dash-orb', { opacity: 0, scale: 0.5 }, { opacity: 0.25, scale: 1, duration: 2.2, stagger: 0.3 }, 0);
        tl.fromTo('.fade-up', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.08 }, 0.1);
        return () => tl.kill();
    }, [loading]);

    const handleVideoDownload = () => {
        if (!data?.result?.video_path) return;
        const url = `${process.env.NEXT_PUBLIC_API_URL}/${data.result.video_path}`;
        const a = document.createElement('a');
        a.href = url;
        a.download = `interview_${data.candidate.name || 'candidate'}.webm`;
        a.click();
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen" style={{ background: 'linear-gradient(135deg, #fafbff 0%, #f3f0ff 100%)' }}>
            <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!data) return (
        <div className="flex items-center justify-center min-h-screen p-8" style={{ background: 'linear-gradient(135deg, #fafbff 0%, #f3f0ff 100%)' }}>
            <div className="text-slate-500 text-center bg-white/60 backdrop-blur-xl border border-white/80 rounded-3xl p-12 shadow-sm">
                <AlertTriangle className="mx-auto mb-3 text-pink-500" size={32} />
                Data not found
            </div>
        </div>
    );

    const { candidate, result, answers } = data;
    const finalScore = result?.final_score ?? 0;
    const scoreColor = finalScore >= 70 ? 'text-emerald-300' : finalScore >= 50 ? 'text-amber-300' : 'text-rose-300';

    return (
        <div ref={pageRef} style={{ minHeight: '100vh', padding: '32px', background: 'linear-gradient(135deg, #fafbff 0%, #f3f0ff 100%)', position: 'relative', overflow: 'hidden' }}>
            {/* Background Orbs */}
            <div className="dash-orb" style={{ position: 'absolute', top: '10%', right: '0%', width: '35vw', height: '35vw', background: 'radial-gradient(circle, rgba(236,72,153,0.12) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%', zIndex: 0, filter: 'blur(60px)' }} />
            <div className="dash-orb" style={{ position: 'absolute', bottom: '-5%', left: '-15%', width: '45vw', height: '45vw', background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%', zIndex: 0, filter: 'blur(80px)' }} />

            <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative', zIndex: 1 }}>
                {/* Back Button */}
                <button onClick={() => router.back()}
                    className="fade-up flex items-center gap-2 text-sm text-slate-600 hover:text-pink-600 transition-colors bg-white/60 backdrop-blur-xl border border-white/80 rounded-full px-4 py-2 mb-6 cursor-pointer shadow-sm">
                    <ArrowLeft size={16} /> Back to Rankings
                </button>

                {/* Header Card */}
                <div className="fade-up relative mb-6 rounded-3xl overflow-hidden border border-white/80 shadow-[0_8px_32px_rgba(139,92,246,0.08)]">
                    <div className="relative p-8" style={{ background: 'linear-gradient(135deg, #1a0b2e 0%, #2d1b4e 50%, #4a1d5f 100%)' }}>
                        <div className="absolute top-0 right-0 w-64 h-64 rounded-full" style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.3) 0%, transparent 70%)', filter: 'blur(40px)' }} />
                        <div className="absolute bottom-0 left-1/3 w-64 h-64 rounded-full" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)', filter: 'blur(40px)' }} />

                        <div className="relative flex items-start justify-between flex-wrap gap-6">
                            <div className="flex items-center gap-5">
                                <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-3xl font-extrabold text-white shadow-2xl shadow-pink-500/40"
                                    style={{ background: 'linear-gradient(135deg, #ec4899, #8b5cf6)', fontFamily: 'Syne, sans-serif' }}>
                                    {candidate.name?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 text-pink-200/80 text-xs font-semibold uppercase tracking-wider mb-1">
                                        <User size={12} /> Candidate Report
                                    </div>
                                    <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
                                        {candidate.name}
                                    </h1>
                                    <p className="text-white/60 text-sm flex items-center gap-2 mt-1">
                                        <Mail size={14} /> {candidate.email}
                                    </p>
                                </div>
                            </div>
                            {result && (
                                <div className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20">
                                    <Trophy className={scoreColor} size={28} />
                                    <div>
                                        <div className={`text-4xl font-extrabold ${scoreColor} leading-none`} style={{ fontFamily: 'Syne, sans-serif' }}>
                                            {finalScore}%
                                        </div>
                                        <div className="text-white/50 text-xs mt-1 uppercase tracking-wider">Final Score</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                {result && (
                    <div className="fade-up grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <StatCard label="Verbal Score" value={result.verbal_score} Icon={MessageSquare} accent="from-pink-500 to-rose-500" />
                        <StatCard label="MCQ Score" value={result.mcq_score} Icon={ListChecks} accent="from-amber-500 to-orange-500" />
                        <StatCard label="Coding Score" value={result.coding_score} Icon={Code2} accent="from-violet-500 to-indigo-500" />
                        <StatCard label="Tab Switches" value={result.tab_switches} suffix="" Icon={AlertTriangle} accent={result.tab_switches > 0 ? 'from-red-500 to-rose-600' : 'from-emerald-500 to-teal-600'} />
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Video */}
                    <div className="lg:col-span-1 fade-up">
                        <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/80 shadow-[0_4px_20px_rgba(139,92,246,0.05)] p-6 sticky top-6">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-500 to-violet-600 flex items-center justify-center text-white shadow-md">
                                    <Video size={16} />
                                </div>
                                <h2 className="font-bold text-slate-900 text-sm tracking-tight">Interview Recording</h2>
                            </div>
                            {result?.video_path ? (
                                <>
                                    <div className="bg-slate-900 rounded-2xl overflow-hidden mb-4 border border-slate-200" style={{ aspectRatio: '4/3' }}>
                                        <video
                                            controls
                                            className="w-full h-full bg-black"
                                            src={`${process.env.NEXT_PUBLIC_API_URL}/${result.video_path}`}
                                        />
                                    </div>
                                    <button onClick={handleVideoDownload}
                                        className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold text-white rounded-xl transition-transform hover:scale-[1.02] shadow-lg shadow-pink-500/30 cursor-pointer"
                                        style={{ background: 'linear-gradient(135deg, #ec4899, #8b5cf6)' }}>
                                        <Download size={16} /> Download Video
                                    </button>
                                </>
                            ) : (
                                <div className="bg-slate-50/80 rounded-2xl p-10 text-center border border-dashed border-slate-300">
                                    <div className="w-14 h-14 mx-auto bg-white rounded-2xl flex items-center justify-center text-slate-400 mb-3 shadow-inner">
                                        <Video size={24} />
                                    </div>
                                    <p className="text-slate-500 text-sm font-medium">Video not available</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Answers */}
                    <div className="lg:col-span-2 flex flex-col gap-4">
                        <div className="fade-up flex items-center gap-2">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
                                <Sparkles size={16} />
                            </div>
                            <h2 className="font-bold text-slate-900 text-base tracking-tight">Question Responses</h2>
                            <span className="ml-auto text-xs text-slate-500 bg-white/60 backdrop-blur-xl border border-white/80 rounded-full px-3 py-1 font-semibold">
                                {answers.length} Questions
                            </span>
                        </div>

                        {answers.map((ans, idx) => {
                            const meta = typeMeta[ans.question_type] || typeMeta.verbal;
                            const { Icon } = meta;
                            const hasAnswer = ans.answer_text && ans.answer_text !== 'None' && ans.answer_text !== 'null';

                            return (
                                <div key={ans.id} className="fade-up bg-white/70 backdrop-blur-xl rounded-3xl border border-white/80 shadow-[0_4px_20px_rgba(139,92,246,0.05)] p-6 hover:shadow-[0_8px_32px_rgba(139,92,246,0.08)] transition-shadow">
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${meta.chip}`}>
                                            <Icon size={12} /> {meta.label}
                                        </span>
                                        <span className="text-slate-400 text-xs font-bold">Q{idx + 1}</span>
                                        <span className={`ml-auto inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${hasAnswer ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-600 border border-rose-200'}`}>
                                            {hasAnswer ? <><CheckCircle2 size={12} /> Answered</> : <><XCircle size={12} /> Skipped</>}
                                        </span>
                                    </div>

                                    <p className="text-slate-900 text-sm font-semibold mb-4 leading-relaxed">{ans.question_text}</p>

                                    {hasAnswer ? (
                                        <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200 mb-4">
                                            {ans.question_type === 'coding' ? (
                                                <pre className="text-sm font-mono text-slate-800 overflow-x-auto whitespace-pre-wrap leading-relaxed">{ans.answer_text}</pre>
                                            ) : ans.question_type === 'mcq' ? (
                                                <p className="text-sm text-slate-700">
                                                    Selected: <strong className="text-slate-900">{ans.answer_text}</strong>
                                                    {ans.is_correct !== null && (
                                                        <span className={`ml-2 inline-flex items-center gap-1 font-bold ${ans.is_correct ? 'text-emerald-600' : 'text-rose-500'}`}>
                                                            {ans.is_correct ? <><CheckCircle2 size={12} /> Correct</> : <><XCircle size={12} /> Incorrect</>}
                                                        </span>
                                                    )}
                                                </p>
                                            ) : (
                                                <p className="text-sm text-slate-700 leading-relaxed italic">&ldquo;{ans.answer_text}&rdquo;</p>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="bg-rose-50/60 rounded-2xl p-4 border border-rose-200 mb-4">
                                            <p className="text-rose-500 text-sm font-medium">No answer provided</p>
                                        </div>
                                    )}

                                    {ans.ai_score !== null && (
                                        <div className="flex flex-col gap-3 pt-3 border-t border-slate-100">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold uppercase tracking-wider">
                                                    <Sparkles size={12} className="text-violet-500" /> AI Score
                                                </div>
                                            </div>
                                            <ScoreBar score={ans.ai_score} />
                                            {ans.ai_feedback && (
                                                <div className="flex gap-2 text-xs text-slate-600 leading-relaxed bg-gradient-to-br from-violet-50/60 to-pink-50/60 rounded-xl p-3 border border-violet-100">
                                                    <MessageSquare size={14} className="text-violet-500 flex-shrink-0 mt-0.5" />
                                                    <span>{ans.ai_feedback}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
