'use client';
import { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';

const typeColors = {
    verbal: 'bg-blue-50 text-blue-700 border-blue-200',
    coding: 'bg-violet-50 text-violet-700 border-violet-200',
    mcq: 'bg-amber-50 text-amber-700 border-amber-200',
};
const typeIcons = { verbal: '🗣️', coding: '💻', mcq: '📝' };

export default function Questions({ jobId, onSuccess }) {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [newQ, setNewQ] = useState({ question_text: '', question_type: 'verbal', difficulty: 'medium' });
    const [saving, setSaving] = useState(false);
    const [addLoading, setAddLoading] = useState(false);
    const pollRef = useRef(null);
    const pollCount = useRef(0);

    const fetchQuestions = async () => {
        try {
            const res = await api.get(`/api/v1/jobs/${jobId}/questions`);
            setQuestions(res.data);
            return res.data.length;
        } catch {
            return 0;
        }
    };

    useEffect(() => {
        // Pehle ek baar fetch karo
        fetchQuestions().then(count => {
            setLoading(false);
            // Agar koi questions nahi hain toh poll karo
            if (count === 0) {
                pollRef.current = setInterval(async () => {
                    pollCount.current += 1;
                    const n = await fetchQuestions();
                    if (n > 0 || pollCount.current >= 20) {
                        clearInterval(pollRef.current);
                    }
                }, 3000); // har 3 seconds
            }
        });

        return () => clearInterval(pollRef.current);
    }, [jobId]);

    const handleAddQuestion = async () => {
        if (!newQ.question_text.trim()) return;
        setAddLoading(true);
        try {
            const res = await api.post(`/api/v1/jobs/${jobId}/questions`, newQ);
            setQuestions(prev => [...prev, res.data]);
            setNewQ({ question_text: '', question_type: 'verbal', difficulty: 'medium' });
            setShowAdd(false);
        } catch (err) {
            console.error(err);
        } finally {
            setAddLoading(false);
        }
    };

    const handleDelete = async (questionId) => {
        try {
            await api.delete(`/api/v1/jobs/${jobId}/questions/${questionId}`);
            setQuestions(prev => prev.filter(q => q.id !== questionId));
        } catch (err) {
            console.error(err);
        }
    };

    const handleFinish = async () => {
        setSaving(true);
        await new Promise(r => setTimeout(r, 600));
        setSaving(false);
        onSuccess();
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-8 py-5 border-b border-slate-100"
                style={{ background: 'linear-gradient(135deg, #0a1628, #0f1f3d)' }}>
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
                            💬 Interview Questions
                        </h2>
                        <p className="text-white/50 text-xs mt-0.5">AI-generated questions — review, add or remove</p>
                    </div>
                    <div className="px-3 py-1 rounded-full text-xs font-semibold text-white/70 border border-white/20">
                        {questions.length} questions
                    </div>
                </div>
            </div>

            <div className="p-8 flex flex-col gap-4">

                {/* Loading State */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-16 gap-4">
                        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm text-slate-400">Loading questions...</p>
                    </div>
                )}

                {/* Generating State — questions abhi aa rahe hain */}
                {!loading && questions.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 gap-4">
                        <div className="text-5xl animate-bounce">🤖</div>
                        <div>
                            <p className="text-base font-semibold text-[#0a1628] text-center mb-1">
                                AI is generating your questions...
                            </p>
                            <p className="text-sm text-slate-400 text-center">
                                This usually takes 10–20 seconds. Page will update automatically.
                            </p>
                        </div>
                        <div className="flex gap-1.5 mt-2">
                            {[0, 1, 2].map(i => (
                                <div key={i} className="w-2 h-2 rounded-full bg-blue-600 animate-bounce"
                                    style={{ animationDelay: `${i * 0.15}s` }} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Questions List */}
                {!loading && questions.length > 0 && (
                    <>
                        <div className="flex items-start gap-3 px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl">
                            <span className="text-blue-500 text-lg">🤖</span>
                            <p className="text-sm text-blue-700">
                                These questions were generated by AI based on your job description and requirements.
                                <span className="font-semibold"> You can add custom questions or remove any that aren't relevant.</span>
                            </p>
                        </div>

                        <div className="flex flex-col gap-3">
                            {questions.map((q, idx) => (
                                <div key={q.id}
                                    className="flex gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 group hover:border-blue-200 hover:bg-blue-50/30 transition-all">
                                    <div className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-500 flex-shrink-0 mt-0.5">
                                        {idx + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-[#0a1628] leading-relaxed whitespace-pre-line">{q.question_text}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${typeColors[q.question_type]}`}>
                                                {typeIcons[q.question_type]} {q.question_type}
                                            </span>
                                            <span className="text-xs text-slate-400">{q.difficulty}</span>
                                            {!q.ai_generated && (
                                                <span className="text-xs text-emerald-600 font-medium">• custom</span>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(q.id)}
                                        className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg bg-red-50 text-red-400 hover:bg-red-500 hover:text-white flex items-center justify-center text-base border-none cursor-pointer transition-all flex-shrink-0">
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* Add Question */}
                {!loading && (
                    <>
                        {showAdd ? (
                            <div className="p-4 bg-slate-50 rounded-xl border-2 border-blue-200 flex flex-col gap-3">
                                <textarea
                                    value={newQ.question_text}
                                    onChange={(e) => setNewQ({ ...newQ, question_text: e.target.value })}
                                    rows={3}
                                    placeholder="Type your interview question here..."
                                    className="w-full px-3.5 py-2.5 text-sm text-[#0a1628] bg-white border border-slate-200 rounded-lg outline-none resize-none focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.1)] transition-all"
                                />
                                <div className="flex items-center gap-3 flex-wrap">
                                    <select
                                        value={newQ.question_type}
                                        onChange={(e) => setNewQ({ ...newQ, question_type: e.target.value })}
                                        className="px-3 py-2 text-sm text-[#0a1628] bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-500 cursor-pointer">
                                        <option value="verbal">🗣️ Verbal</option>
                                        <option value="coding">💻 Coding</option>
                                        <option value="mcq">📝 MCQ</option>
                                    </select>
                                    <select
                                        value={newQ.difficulty}
                                        onChange={(e) => setNewQ({ ...newQ, difficulty: e.target.value })}
                                        className="px-3 py-2 text-sm text-[#0a1628] bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-500 cursor-pointer">
                                        <option value="easy">Easy</option>
                                        <option value="medium">Medium</option>
                                        <option value="hard">Hard</option>
                                    </select>
                                    <button
                                        onClick={handleAddQuestion}
                                        disabled={addLoading}
                                        className="px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors border-none cursor-pointer disabled:opacity-60">
                                        {addLoading ? 'Adding...' : 'Add Question'}
                                    </button>
                                    <button
                                        onClick={() => { setShowAdd(false); setNewQ({ question_text: '', question_type: 'verbal', difficulty: 'medium' }); }}
                                        className="px-4 py-2 text-sm text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer">
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => setShowAdd(true)}
                                className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-sm font-medium text-slate-400 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50/50 transition-all bg-transparent cursor-pointer">
                                + Add Custom Question
                            </button>
                        )}
                    </>
                )}

                {/* Finish Button */}
                {!loading && questions.length > 0 && (
                    <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                        <p className="text-xs text-slate-400">{questions.length} questions total</p>
                        <button
                            onClick={handleFinish}
                            disabled={saving}
                            className="px-8 py-3 text-white font-semibold rounded-xl transition-all hover:-translate-y-0.5 disabled:opacity-60 border-none cursor-pointer"
                            style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 3px 16px rgba(16,185,129,0.35)' }}>
                            {saving ? 'Saving...' : '✓ Finish & Save Job'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}