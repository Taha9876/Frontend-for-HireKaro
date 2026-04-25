'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';

const typeColors = {
    verbal: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: '🗣️' },
    mcq: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: '📝' },
    coding: { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', icon: '💻' },
};

function ScoreBar({ score, color }) {
    const bg = score >= 70 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-500' : 'bg-red-500';
    return (
        <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${bg} transition-all`} style={{ width: `${score}%` }} />
            </div>
            <span className={`text-sm font-bold w-12 text-right ${score >= 70 ? 'text-emerald-600' : score >= 50 ? 'text-amber-600' : 'text-red-500'}`}>
                {score}%
            </span>
        </div>
    );
}

export default function CandidateDetailPage() {
    const { id, interviewId, candidateId } = useParams();
    const router = useRouter();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get(`/api/v1/jobs/interview/${interviewId}/candidate/${candidateId}/detail`)
            .then(res => setData(res.data))
            .catch(() => { })
            .finally(() => setLoading(false));




    }, [interviewId, candidateId]);

    const handleVideoDownload = () => {
        // const url = `${process.env.NEXT_PUBLIC_API_URL}/${data.result.video_path}`;
        // const a = document.createElement('a');
        // a.href = url;
        // a.download = `interview_${data.candidate.username}.webm`;
        // a.click();
        console.log(data);
    };

    if (loading) return (
        <div className="flex items-center justify-center h-screen bg-slate-50">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!data) return (
        <div className="p-8 text-slate-400 text-center">Data not found</div>
    );

    const { candidate, result, answers } = data;

    return (
        <div className="min-h-screen bg-slate-50 p-6 lg:p-8">
            <button onClick={() => router.back()}
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-blue-600 transition-colors bg-transparent border-none cursor-pointer mb-6">
                ← Back to Rankings
            </button>

            {/* Header */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
                <div className="p-6" style={{ background: 'linear-gradient(135deg, #0a1628, #162847)' }}>
                    <div className="flex items-start justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold text-white"
                                style={{ background: 'linear-gradient(135deg, #2563eb, #00d4ff)' }}>
                                {candidate.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h1 className="text-2xl font-extrabold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
                                    {candidate.name}
                                </h1>
                                <p className="text-white/50 text-sm">{candidate.email}</p>
                            </div>
                        </div>
                        {result && (
                            <div className="text-right">
                                <div className={`text-4xl font-extrabold ${result.final_score >= 70 ? 'text-emerald-400' : result.final_score >= 50 ? 'text-amber-400' : 'text-red-400'}`}
                                    style={{ fontFamily: 'Syne, sans-serif' }}>
                                    {result.final_score}%
                                </div>
                                <div className="text-white/40 text-xs">Final Score</div>
                            </div>
                        )}
                    </div>
                </div>

                {result && (
                    <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: 'Verbal Score', value: result.verbal_score, color: 'text-blue-600' },
                            { label: 'MCQ Score', value: result.mcq_score, color: 'text-amber-600' },
                            { label: 'Coding Score', value: result.coding_score, color: 'text-violet-600' },
                            { label: 'Tab Switches', value: result.tab_switches, color: result.tab_switches > 0 ? 'text-red-500' : 'text-emerald-600' },
                        ].map(item => (
                            <div key={item.label} className="text-center p-3 bg-slate-50 rounded-xl">
                                <div className={`text-2xl font-extrabold ${item.color}`} style={{ fontFamily: 'Syne, sans-serif' }}>
                                    {item.label === 'Tab Switches' ? item.value : `${item.value ?? 0}%`}
                                </div>
                                <div className="text-xs text-slate-400 mt-1">{item.label}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Video */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                        <h2 className="font-bold text-[#0a1628] text-sm mb-4">🎬 Interview Recording</h2>
                        {result?.video_path ? (
                            <>
                                <div className="bg-slate-900 rounded-xl overflow-hidden mb-3" style={{ aspectRatio: '4/3' }}>
                                    <video
                                        controls
                                        className="w-full rounded-xl max-h-72 bg-black"
                                        src={`${process.env.NEXT_PUBLIC_API_URL}/${result.video_path}`}
                                    />
                                </div>
                                <button onClick={handleVideoDownload}
                                    className="w-full py-2.5 text-sm font-semibold text-blue-600 border border-blue-200 rounded-xl hover:bg-blue-50 transition-colors bg-transparent cursor-pointer">
                                    📥 Download Video
                                </button>
                            </>
                        ) : (
                            <div className="bg-slate-50 rounded-xl p-8 text-center border border-slate-200">
                                <div className="text-3xl mb-2">🎬</div>
                                <p className="text-slate-400 text-sm">Video not available</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Answers */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                    <h2 className="font-bold text-[#0a1628] text-base">📋 Question Responses</h2>
                    {answers.map((ans, idx) => {
                        const tc = typeColors[ans.question_type] || typeColors.verbal;
                        const hasAnswer = ans.answer_text && ans.answer_text !== 'None' && ans.answer_text !== 'null';

                        return (
                            <div key={ans.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${tc.bg} ${tc.text} ${tc.border}`}>
                                        {tc.icon} {ans.question_type}
                                    </span>
                                    <span className="text-slate-400 text-xs">Q{idx + 1}</span>
                                    <span className={`ml-auto px-2.5 py-0.5 rounded-full text-xs font-bold
                                        ${hasAnswer ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                                        {hasAnswer ? '✓ Answered' : '✗ Skipped'}
                                    </span>
                                </div>

                                <p className="text-[#0a1628] text-sm font-semibold mb-3 leading-relaxed">{ans.question_text}</p>

                                {/* Answer */}
                                {hasAnswer ? (
                                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-3">
                                        {ans.question_type === 'coding' ? (
                                            <pre className="text-sm font-mono text-slate-700 overflow-x-auto whitespace-pre-wrap leading-relaxed">{ans.answer_text}</pre>
                                        ) : ans.question_type === 'mcq' ? (
                                            <p className="text-sm text-slate-700">
                                                Selected: <strong>{ans.answer_text}</strong>
                                                {ans.is_correct !== null && (
                                                    <span className={`ml-2 font-bold ${ans.is_correct ? 'text-emerald-600' : 'text-red-500'}`}>
                                                        {ans.is_correct ? '✓ Correct' : '✗ Incorrect'}
                                                    </span>
                                                )}
                                            </p>
                                        ) : (
                                            <p className="text-sm text-slate-700 leading-relaxed italic">"{ans.answer_text}"</p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="bg-red-50 rounded-xl p-3 border border-red-200 mb-3">
                                        <p className="text-red-500 text-sm">No answer provided</p>
                                    </div>
                                )}

                                {/* AI Score */}
                                {ans.ai_score !== null && (
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center justify-between text-xs text-slate-400">
                                            <span>AI Score</span>
                                        </div>
                                        <ScoreBar score={ans.ai_score} />
                                        {ans.ai_feedback && (
                                            <p className="text-xs text-slate-500 leading-relaxed bg-slate-50 rounded-lg p-3 border border-slate-200">
                                                💬 {ans.ai_feedback}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}