'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import gsap from 'gsap';
import api from '@/lib/api';

const typeMeta = {
    verbal: { label: 'Verbal', bg: 'rgba(244,162,140,0.15)', color: '#c06a4e' },
    mcq: { label: 'MCQ', bg: 'rgba(233,194,106,0.15)', color: '#9a7e2e' },
    coding: { label: 'Coding', bg: 'rgba(127,165,130,0.10)', color: '#4a7c4f' },
};

const INTER = 'Inter, -apple-system, BlinkMacSystemFont, sans-serif';
const SYNE = 'Syne, sans-serif';

function ScoreBar({ score }) {
    const bg = score >= 70 ? '#7FA582' : score >= 50 ? '#F4A28C' : '#E88A72';
    const color = score >= 70 ? '#4a7c4f' : score >= 50 ? '#c06a4e' : '#b33a2a';
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1, height: 3, background: '#f3f1ec', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ width: `${score}%`, height: '100%', borderRadius: 2, background: bg, transition: 'width 0.4s ease' }} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color, fontFamily: SYNE, width: 42, textAlign: 'right' }}>{score}%</span>
        </div>
    );
}

function StatCard({ label, value, suffix = '%', accent }) {
    return (
        <div style={{ padding: '20px 24px' }}>
            <p style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px', fontFamily: INTER }}>{label}</p>
            <p style={{ fontSize: 24, fontWeight: 700, color: accent, lineHeight: 1, fontFamily: SYNE }}>
                {value ?? 0}{suffix}
            </p>
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
        <div className="flex items-center justify-center min-h-screen" style={{ background: '#FBF8F2' }}>
            <div className="w-10 h-10 border-4 border-[#1C1B2E] border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!data) return (
        <div className="flex items-center justify-center min-h-screen p-8" style={{ background: '#FBF8F2' }}>
            <div className="text-[#64608a] text-center bg-white rounded-2xl border border-[#e8e5df] p-12">
                Data not found
            </div>
        </div>
    );

    const { candidate, result, answers } = data;
    const finalScore = result?.final_score ?? 0;
    const finalScoreColor = finalScore >= 70 ? '#7FA582' : finalScore >= 50 ? '#F4A28C' : '#E88A72';

    return (
        <div ref={pageRef} style={{ minHeight: '100vh', padding: '32px 36px', background: '#FBF8F2', position: 'relative', fontFamily: INTER }}>
            <div style={{ maxWidth: 1240, margin: '0 auto', position: 'relative', zIndex: 1 }}>
                {/* Back Button */}
                <button onClick={() => router.back()}
                    className="fade-up text-sm text-[#64608a] hover:text-[#1C1B2E] transition-colors bg-transparent border-none px-0 py-1 mb-6 cursor-pointer font-medium"
                    style={{ fontFamily: INTER }}>
                    ← Back to Rankings
                </button>

                {/* Header */}
                <div className="fade-up mb-8">
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12, fontFamily: INTER }}>
                        Candidate Report
                    </div>
                    <div className="flex items-end justify-between flex-wrap gap-6">
                        <div>
                            <h1 style={{ fontSize: 36, fontWeight: 700, color: '#1C1B2E', margin: 0, fontFamily: SYNE, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                                {candidate.name}
                            </h1>
                            <p style={{ fontSize: 14, color: '#64608a', margin: '8px 0 0', fontFamily: INTER }}>
                                {candidate.email}
                            </p>
                        </div>
                        {result && (
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: 48, fontWeight: 700, color: finalScoreColor, lineHeight: 1, fontFamily: SYNE, letterSpacing: '-0.02em' }}>
                                    {finalScore}<span style={{ fontSize: 24, color: '#94a3b8', fontWeight: 500 }}>%</span>
                                </div>
                                <div style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 6, fontFamily: INTER }}>Final Score</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Stats Grid */}
                {result && (
                    <div className="fade-up grid grid-cols-2 md:grid-cols-4 mb-8 bg-white rounded-2xl border border-[#e8e5df] overflow-hidden" style={{ borderCollapse: 'collapse' }}>
                        <div style={{ borderRight: '1px solid #f3f1ec' }}>
                            <StatCard label="Verbal" value={result.verbal_score} accent="#1C1B2E" />
                        </div>
                        <div style={{ borderRight: '1px solid #f3f1ec' }}>
                            <StatCard label="MCQ" value={result.mcq_score} accent="#1C1B2E" />
                        </div>
                        <div style={{ borderRight: '1px solid #f3f1ec' }}>
                            <StatCard label="Coding" value={result.coding_score} accent="#1C1B2E" />
                        </div>
                        <StatCard label="Tab Switches" value={result.tab_switches} suffix="" accent={result.tab_switches > 0 ? '#c06a4e' : '#1C1B2E'} />
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Video */}
                    <div className="lg:col-span-1 fade-up">
                        <div className="bg-white rounded-2xl border border-[#e8e5df] p-5 sticky top-6">
                            <h2 style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', margin: '0 0 14px', fontFamily: INTER, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Interview Recording</h2>
                            {result?.video_path ? (
                                <>
                                    <div className="bg-[#1C1B2E] rounded-xl overflow-hidden mb-3" style={{ aspectRatio: '4/3' }}>
                                        <video
                                            controls
                                            className="w-full h-full"
                                            src={`${process.env.NEXT_PUBLIC_API_URL}/${result.video_path}`}
                                        />
                                    </div>
                                    <button onClick={handleVideoDownload}
                                        className="w-full py-2 text-xs font-medium text-[#1C1B2E] border border-[#e8e5df] rounded-lg cursor-pointer bg-white hover:bg-[#FDFCF9] transition-colors"
                                        style={{ fontFamily: INTER }}>
                                        Download Video
                                    </button>
                                </>
                            ) : (
                                <div className="bg-[#FDFCF9] rounded-xl p-10 text-center border border-dashed border-[#e8e5df]">
                                    <p style={{ color: '#94a3b8', fontSize: 13, fontFamily: INTER, margin: 0 }}>Video not available</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Answers */}
                    <div className="lg:col-span-2 flex flex-col gap-4">
                        <div className="fade-up flex items-center justify-between">
                            <h2 style={{ fontSize: 18, fontWeight: 600, color: '#1C1B2E', margin: 0, fontFamily: SYNE, letterSpacing: '-0.01em' }}>Question Responses</h2>
                            <span style={{ fontSize: 12, color: '#94a3b8', fontFamily: INTER, fontWeight: 500 }}>
                                {answers.length} {answers.length === 1 ? 'question' : 'questions'}
                            </span>
                        </div>

                        {answers.map((ans, idx) => {
                            const meta = typeMeta[ans.question_type] || typeMeta.verbal;
                            const hasAnswer = ans.answer_text && ans.answer_text !== 'None' && ans.answer_text !== 'null';

                            return (
                                <div key={ans.id} className="fade-up bg-white rounded-2xl border border-[#e8e5df] p-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <span style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8', fontFamily: INTER, letterSpacing: '0.05em' }}>Q{String(idx + 1).padStart(2, '0')}</span>
                                        <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#e8e5df' }} />
                                        <span style={{ fontSize: 10, fontWeight: 600, color: meta.color, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: INTER }}>
                                            {meta.label}
                                        </span>
                                        <span className="ml-auto" style={{ fontSize: 10, fontWeight: 600, color: hasAnswer ? '#4a7c4f' : '#b33a2a', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: INTER }}>
                                            {hasAnswer ? 'Answered' : 'Skipped'}
                                        </span>
                                    </div>

                                    <p style={{ fontSize: 15, fontWeight: 600, color: '#1C1B2E', margin: '0 0 16px', lineHeight: 1.5, fontFamily: SYNE, letterSpacing: '-0.005em' }}>{ans.question_text}</p>

                                    {hasAnswer ? (
                                        <div style={{ background: '#FDFCF9', borderRadius: 12, padding: 16, border: '1px solid #f3f1ec', marginBottom: ans.ai_score !== null ? 16 : 0 }}>
                                            {ans.question_type === 'coding' ? (
                                                <pre style={{ fontSize: 13, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', color: '#1C1B2E', overflowX: 'auto', whiteSpace: 'pre-wrap', lineHeight: 1.6, margin: 0 }}>{ans.answer_text}</pre>
                                            ) : ans.question_type === 'mcq' ? (
                                                <p style={{ fontSize: 13, color: '#1C1B2E', margin: 0, fontFamily: INTER }}>
                                                    <span style={{ color: '#94a3b8' }}>Selected: </span>
                                                    <strong>{ans.answer_text}</strong>
                                                    {ans.is_correct !== null && (
                                                        <span className="ml-2 font-semibold" style={{ color: ans.is_correct ? '#4a7c4f' : '#b33a2a' }}>
                                                            · {ans.is_correct ? 'Correct' : 'Incorrect'}
                                                        </span>
                                                    )}
                                                </p>
                                            ) : (
                                                <p style={{ fontSize: 13, color: '#1C1B2E', lineHeight: 1.7, fontFamily: INTER, margin: 0 }}>{ans.answer_text}</p>
                                            )}
                                        </div>
                                    ) : (
                                        <div style={{ padding: '12px 0', marginBottom: ans.ai_score !== null ? 16 : 0 }}>
                                            <p style={{ fontSize: 13, color: '#94a3b8', fontFamily: INTER, fontStyle: 'italic', margin: 0 }}>No answer provided</p>
                                        </div>
                                    )}

                                    {ans.ai_score !== null && (
                                        <div className="flex flex-col gap-3 pt-4 border-t border-[#f3f1ec]">
                                            <div className="flex items-center justify-between">
                                                <span style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: INTER }}>AI Score</span>
                                            </div>
                                            <ScoreBar score={ans.ai_score} />
                                            {ans.ai_feedback && (
                                                <div style={{ fontSize: 12, color: '#64608a', lineHeight: 1.6, fontFamily: INTER, marginTop: 4 }}>
                                                    {ans.ai_feedback}
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
