// app/interview/room/page.js
'use client';
import { useState, useEffect, useRef, useCallback } from 'react';

const sections_CONFIG = [
    { id: 'verbal', label: 'Verbal', icon: '🗣️', color: 'blue' },
    { id: 'mcq', label: 'MCQ', icon: '📝', color: 'amber' },
    { id: 'coding', label: 'Coding', icon: '💻', color: 'violet' },
];

const LANGUAGES = ['JavaScript', 'Python', 'Java', 'C++'];
const CODE_STUBS = {
    JavaScript: `function sumEven(arr) {\n  // Write your solution here\n  \n}`,
    Python: `def sum_even(arr):\n    # Write your solution here\n    pass`,
    Java: `public int sumEven(int[] arr) {\n    // Write your solution here\n    return 0;\n}`,
    'C++': `int sumEven(vector<int>& arr) {\n    // Write your solution here\n    return 0;\n}`,
};

function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function timerColor(sec, total) {
    const ratio = sec / total;
    if (ratio > 0.5) return '#10b981';
    if (ratio > 0.25) return '#f59e0b';
    return '#ef4444';
}

export default function InterviewRoomPage() {
    const [username, setUsername] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [sections, setSections] = useState([]);
    const [questionsLoading, setQuestionsLoading] = useState(true);

    // ── FETCH QUESTIONS ───────────────────────────────────
    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const user = localStorage.getItem('interview_username');
                if (!user) {
                    setQuestionsLoading(false);
                    return;
                }
                setUsername(user);

                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/jobs/interview/candidate-questions?username=${user}`
                );
                const data = await res.json();

                if (data && data.length > 0) {
                    setQuestions(data);

                    const verbal = data.filter(q => q.type === 'verbal');
                    const mcq = data.filter(q => q.type === 'mcq');
                    const coding = data.filter(q => q.type === 'coding');

                    const built = [];
                    if (verbal.length > 0) built.push({ ...sections_CONFIG.find(s => s.id === 'verbal'), questions: verbal });
                    if (mcq.length > 0) built.push({ ...sections_CONFIG.find(s => s.id === 'mcq'), questions: mcq });
                    if (coding.length > 0) built.push({ ...sections_CONFIG.find(s => s.id === 'coding'), questions: coding });
                    console.log(data);

                    setSections(built);
                }
            } catch (e) {
                console.error('Questions fetch failed:', e);
            } finally {
                setQuestionsLoading(false);
            }
        };
        fetchQuestions();
    }, []);

    const [phase, setPhase] = useState('guide');
    const [permError, setPermError] = useState('');
    const [sectionIdx, setSectionIdx] = useState(0);
    const [qIdx, setQIdx] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [tabSwitches, setTabSwitches] = useState(0);
    const [transcript, setTranscript] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);
    const [language, setLanguage] = useState('JavaScript');
    const [code, setCode] = useState(CODE_STUBS['JavaScript']);
    const [camReady, setCamReady] = useState(false);

    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const recordedChunksRef = useRef([]);
    const timerRef = useRef(null);
    const recognitionRef = useRef(null);
    const answersRef = useRef({});
    const transcriptRef = useRef('');
    const selectedOptionRef = useRef(null);
    const codeRef = useRef(CODE_STUBS['JavaScript']);
    const tabSwitchesRef = useRef(0);
    // ── Keep sections in a ref so advanceQuestion never has stale closure ──
    const sectionsRef = useRef([]);

    useEffect(() => { answersRef.current = answers; }, [answers]);
    useEffect(() => { transcriptRef.current = transcript; }, [transcript]);
    useEffect(() => { selectedOptionRef.current = selectedOption; }, [selectedOption]);
    useEffect(() => { codeRef.current = code; }, [code]);
    useEffect(() => { tabSwitchesRef.current = tabSwitches; }, [tabSwitches]);
    useEffect(() => { sectionsRef.current = sections; }, [sections]);

    const currentSection = sections[sectionIdx];
    const currentQ = currentSection?.questions[qIdx];

    // Tab switch detection
    useEffect(() => {
        const handler = () => {
            if (document.hidden && phase === 'interview') setTabSwitches(p => p + 1);
        };
        document.addEventListener('visibilitychange', handler);
        return () => document.removeEventListener('visibilitychange', handler);
    }, [phase]);

    // ── CAMERA ────────────────────────────────────────────
    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.onloadedmetadata = () => videoRef.current.play();
            }
            const mr = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9,opus' });
            mr.ondataavailable = e => { if (e.data.size > 0) recordedChunksRef.current.push(e.data); };
            mr.start(1000);
            mediaRecorderRef.current = mr;
            setCamReady(true);
            return true;
        } catch {
            setPermError('Camera or microphone access denied. Please allow access and try again.');
            return false;
        }
    };

    const stopCamera = () => {
        streamRef.current?.getTracks().forEach(t => t.stop());
        mediaRecorderRef.current?.stop();
    };

    // Re-attach stream when phase switches to interview
    useEffect(() => {
        if (phase === 'interview' && videoRef.current && streamRef.current) {
            videoRef.current.srcObject = streamRef.current;
            videoRef.current.play().catch(() => { });
        }
    }, [phase]);

    // ── SPEECH ────────────────────────────────────────────
    const speakQuestion = useCallback((text) => {
        if (!('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 1;
        setTimeout(() => window.speechSynthesis.speak(utterance), 600);
    }, []);

    const startListening = useCallback(() => {
        if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) return;
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        const rec = new SR();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = 'en-US';
        let final = '';
        rec.onresult = e => {
            let interim = '';
            for (let i = e.resultIndex; i < e.results.length; i++) {
                if (e.results[i].isFinal) final += e.results[i][0].transcript + ' ';
                else interim += e.results[i][0].transcript;
            }
            setTranscript(final + interim);
            transcriptRef.current = final + interim;
        };
        rec.onerror = () => setIsListening(false);
        rec.onend = () => setIsListening(false);
        recognitionRef.current = rec;
        rec.start();
        setIsListening(true);
    }, []);

    const stopListening = useCallback(() => {
        recognitionRef.current?.stop();
        setIsListening(false);
    }, []);

    // ── SAVE ANSWER ───────────────────────────────────────
    const saveCurrentAnswerFromRefs = useCallback((q) => {
        if (!q) return;
        const answer =
            q.type === 'verbal' ? transcriptRef.current :
                q.type === 'mcq' ? selectedOptionRef.current :
                    codeRef.current;

        const hasAnswer =
            q.type === 'verbal' ? (transcriptRef.current?.trim().length > 0) :
                q.type === 'mcq' ? (selectedOptionRef.current !== null) :
                    (codeRef.current?.trim() !== CODE_STUBS[language]?.trim());

        setAnswers(prev => ({
            ...prev,
            [q.id]: { answer, answered: hasAnswer, type: q.type, question: q.text, options: q.options }
        }));
    }, [language]);

    // ── SUBMIT ────────────────────────────────────────────
    const submitInterview = useCallback(async (finalAnswers, finalTabSwitches) => {
        try {
            const user = localStorage.getItem('interview_username');
            const answersPayload = sectionsRef.current
                .flatMap(s => s.questions)
                .map(q => ({
                    id: q.id,
                    type: q.type,
                    question: q.text,
                    options: q.options || [],
                    correct: q.correct ?? null,
                    ...(finalAnswers[q.id] || { answered: false, answer: null })
                }));

            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/jobs/interview/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: user, answers: answersPayload, tab_switches: finalTabSwitches })
            });

            if (recordedChunksRef.current.length > 0) {
                const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
                const formData = new FormData();
                formData.append('file', blob, `${user}.webm`);
                await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/jobs/interview/upload-video?username=${user}`,
                    { method: 'POST', body: formData }
                );
            }
        } catch (e) {
            console.error('Submit failed:', e);
        }
    }, []);

    // ── ADVANCE QUESTION — uses ref, never stale ──────────
    const advanceQuestion = useCallback((currentSectionIdx, currentQIdx) => {
        const latestSections = sectionsRef.current;
        const section = latestSections[currentSectionIdx];
        if (!section) return;

        if (currentQIdx < section.questions.length - 1) {
            setQIdx(currentQIdx + 1);
        } else if (currentSectionIdx < latestSections.length - 1) {
            setSectionIdx(currentSectionIdx + 1);
            setQIdx(0);
        } else {
            stopCamera();
            window.speechSynthesis?.cancel();
            const finalAnswers = answersRef.current;
            const finalTabSwitches = tabSwitchesRef.current;
            setPhase('finished');
            submitInterview(finalAnswers, finalTabSwitches);
        }
    }, [submitInterview]);

    // ── TIMER ─────────────────────────────────────────────
    const startTimer = useCallback((seconds, q, sIdx, qI) => {
        clearInterval(timerRef.current);
        setTimeLeft(seconds);
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    saveCurrentAnswerFromRefs(q);
                    setTimeout(() => advanceQuestion(sIdx, qI), 100);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, [saveCurrentAnswerFromRefs, advanceQuestion]);

    // ── QUESTION CHANGE EFFECT ────────────────────────────
    useEffect(() => {
        if (phase === 'interview' && currentQ) {
            setTranscript('');
            transcriptRef.current = '';
            setSelectedOption(null);
            selectedOptionRef.current = null;
            if (currentQ.type === 'coding') {
                setCode(CODE_STUBS[language]);
                codeRef.current = CODE_STUBS[language];
            }
            startTimer(currentQ.timeSeconds, currentQ, sectionIdx, qIdx);
            speakQuestion(currentQ.text);
            if (currentQ.type === 'verbal') startListening();
            else stopListening();
        }
        return () => clearInterval(timerRef.current);
    }, [phase, sectionIdx, qIdx]);

    const handleNext = () => {
        clearInterval(timerRef.current);
        window.speechSynthesis?.cancel();
        stopListening();
        saveCurrentAnswerFromRefs(currentQ);
        setTimeout(() => advanceQuestion(sectionIdx, qIdx), 50);
    };

    const handleRequestPermission = async () => {
        const ok = await startCamera();
        if (ok) setPhase('interview');
    };

    const handleLangChange = (lang) => {
        setLanguage(lang);
        setCode(CODE_STUBS[lang]);
        codeRef.current = CODE_STUBS[lang];
    };

    // ══════════════════════════════════════════════════════
    // ── GUIDE PHASE ───────────────────────────────────────
    // ══════════════════════════════════════════════════════

    // Loading state
    if (phase === 'guide' && questionsLoading) return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: '#faf9ff' }}>
            <div className="text-center">
                <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-slate-500 font-medium">Loading your interview...</p>
            </div>
        </div>
    );

    // No questions found
    if (phase === 'guide' && !questionsLoading && sections.length === 0) return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: '#faf9ff' }}>
            <div className="text-center">
                <div className="text-5xl mb-4">⚠️</div>
                <p className="text-slate-700 font-bold text-lg">No questions found</p>
                <p className="text-slate-400 text-sm mt-2">Please contact the hiring team.</p>
            </div>
        </div>
    );

    // ── FIX: Guide screen with sections loaded ────────────
    if (phase === 'guide' && sections.length > 0) return (
        <div className="min-h-screen flex items-center justify-center px-4 py-10 relative overflow-hidden"
            style={{ background: '#faf9ff', color: '#1a1535' }}>
            <div className="fixed inset-0 pointer-events-none z-0"
                style={{
                    backgroundImage: 'linear-gradient(rgba(127, 165, 130,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(127, 165, 130,0.04) 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }} />
            <div className="pointer-events-none absolute inset-0 z-0">
                <div className="absolute top-0 right-0 h-[500px] w-[500px] rounded-full blur-[100px]" style={{ background: 'rgba(127, 165, 130,0.1)' }} />
                <div className="absolute bottom-10 left-10 h-[400px] w-[400px] rounded-full blur-[100px]" style={{ background: 'rgba(192,38,211,0.08)' }} />
            </div>

            <div className="relative z-10 bg-white/80 backdrop-blur-3xl rounded-3xl shadow-xl max-w-2xl w-full overflow-hidden border" style={{ borderColor: 'rgba(127, 165, 130,0.15)' }}>
                <div className="px-8 py-8 text-center bg-violet-50/50 border-b border-violet-100/50">
                    <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center text-2xl shadow-lg bg-white border border-violet-100">🧠</div>
                    <h1 className="text-3xl font-extrabold mb-1 tracking-tight text-slate-900">Virtual Interview Guidelines</h1>
                    <p className="text-slate-500 font-medium text-sm">Please read carefully before starting</p>
                </div>
                <div className="p-8">
                    {/* Section overview */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        {sections.map((s, i) => (
                            <div key={s.id} className="p-4 rounded-2xl border bg-white shadow-sm" style={{ borderColor: 'rgba(127, 165, 130,0.1)' }}>
                                <div className="text-2xl mb-2">{s.icon}</div>
                                <div className="text-xs font-bold text-violet-600 mb-1">Section {i + 1}</div>
                                <div className="text-sm font-bold text-slate-800">{s.label}</div>
                                <div className="text-xs text-slate-500 mt-1">{s.questions.length} question{s.questions.length !== 1 ? 's' : ''}</div>
                            </div>
                        ))}
                    </div>

                    {/* Rules */}
                    <div className="flex flex-col gap-3 mb-8">
                        {[
                            { icon: '🎥', text: 'Camera and microphone will be active throughout. Your video will be recorded.' },
                            { icon: '🔊', text: 'Each question will be read aloud automatically. Make sure your speakers are on.' },
                            { icon: '🗣️', text: 'Verbal section: Speak clearly. Your speech will be transcribed in real-time.' },
                            { icon: '📝', text: 'MCQ section: Select the best answer. Each question has a time limit.' },
                            { icon: '💻', text: 'Coding section: Write working code. Choose your preferred language.' },
                            { icon: '⏱️', text: 'Each question has its own timer. Auto-submit happens when time runs out.' },
                            { icon: '🚫', text: 'Tab switching is monitored and flagged to the hiring team.' },
                        ].map((rule, i) => (
                            <div key={i} className="flex items-start gap-4 p-3 bg-violet-50/30 rounded-xl border border-violet-100">
                                <span className="text-lg flex-shrink-0">{rule.icon}</span>
                                <p className="text-sm font-medium text-slate-600 leading-relaxed pt-0.5">{rule.text}</p>
                            </div>
                        ))}
                    </div>

                    <button onClick={() => setPhase('permission')}
                        className="w-full py-4 text-white font-bold text-sm rounded-xl cursor-pointer transition-all hover:-translate-y-0.5 shadow-lg"
                        style={{ background: 'linear-gradient(135deg, #7FA582, #F4A28C)', boxShadow: '0 8px 24px rgba(127, 165, 130,0.25)' }}>
                        I Understand — Continue →
                    </button>
                </div>
            </div>
        </div>
    );

    // ── PERMISSION ────────────────────────────────────────
    if (phase === 'permission') return (
        <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
            style={{ background: '#faf9ff', color: '#1a1535' }}>
            <div className="fixed inset-0 pointer-events-none z-0"
                style={{
                    backgroundImage: 'linear-gradient(rgba(127, 165, 130,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(127, 165, 130,0.04) 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }} />
            <div className="pointer-events-none absolute inset-0 z-0">
                <div className="absolute top-20 right-10 h-[400px] w-[400px] rounded-full blur-[100px]" style={{ background: 'rgba(127, 165, 130,0.1)' }} />
            </div>

            <div className="relative z-10 bg-white/80 backdrop-blur-3xl rounded-3xl shadow-xl max-w-md w-full overflow-hidden border" style={{ borderColor: 'rgba(127, 165, 130,0.15)' }}>
                <div className="px-8 py-6 text-center bg-violet-50/50 border-b border-violet-100/50">
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">System Check</h2>
                    <p className="text-slate-500 font-medium text-sm mt-1">Preview your camera before starting</p>
                </div>
                <div className="p-8">
                    <div className="relative rounded-2xl overflow-hidden bg-slate-900 border mb-6 shadow-inner" style={{ aspectRatio: '4/3', borderColor: 'rgba(127, 165, 130,0.15)' }}>
                        <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover scale-x-[-1]" />
                        {!camReady && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-800">
                                <div className="text-4xl mb-3 opacity-50">📷</div>
                                <p className="text-slate-300 text-sm font-medium">Preview appears after allowing access</p>
                            </div>
                        )}
                        {camReady && (
                            <div className="absolute bottom-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md bg-black/40 border border-white/10">
                                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="text-white text-xs font-semibold tracking-wide">Ready</span>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-center gap-6 mb-6">
                        {[{ icon: '📷', label: 'Camera' }, { icon: '🎙️', label: 'Microphone' }].map(item => (
                            <div key={item.label} className="flex flex-col items-center gap-2">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all shadow-sm
                                    ${camReady ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-400 border'}`}>
                                    {item.icon}
                                </div>
                                <div className="text-center">
                                    <span className="block text-xs font-bold text-slate-700">{item.label}</span>
                                    <span className={`block text-[10px] font-bold uppercase tracking-wider mt-0.5 ${camReady ? 'text-emerald-500' : 'text-slate-400'}`}>
                                        {camReady ? 'Working' : 'Pending'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {permError && (
                        <div className="mb-4 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-sm font-medium text-center">{permError}</div>
                    )}

                    {!camReady ? (
                        <button onClick={handleRequestPermission}
                            className="w-full py-4 text-white font-bold text-sm rounded-xl cursor-pointer transition-all hover:-translate-y-0.5 shadow-lg"
                            style={{ background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)' }}>
                            Enable Devices →
                        </button>
                    ) : (
                        <button onClick={() => setPhase('interview')}
                            className="w-full py-4 text-white font-bold text-sm rounded-xl cursor-pointer transition-all hover:-translate-y-0.5 shadow-lg"
                            style={{ background: 'linear-gradient(135deg, #7FA582, #F4A28C)', boxShadow: '0 8px 24px rgba(127, 165, 130,0.3)' }}>
                            🚀 Enter Interview Room
                        </button>
                    )}
                </div>
            </div>
        </div>
    );

    // ── FINISHED ──────────────────────────────────────────
    if (phase === 'finished') {
        const answeredCount = Object.values(answers).filter(a => a.answered).length;
        const videoBlob = recordedChunksRef.current.length > 0
            ? new Blob(recordedChunksRef.current, { type: 'video/webm' })
            : null;

        return (
            <div className="min-h-screen relative overflow-hidden" style={{ background: '#faf9ff', color: '#1a1535' }}>
                <div className="fixed inset-0 pointer-events-none z-0"
                    style={{
                        backgroundImage: 'linear-gradient(rgba(127, 165, 130,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(127, 165, 130,0.04) 1px, transparent 1px)',
                        backgroundSize: '40px 40px'
                    }} />

                <div className="relative z-10 flex items-center justify-between px-8 py-4 bg-white/70 backdrop-blur-md border-b border-violet-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-md bg-white border border-violet-100">🧠</div>
                        <span className="font-extrabold text-slate-800 tracking-tight">Hire Karo</span>
                    </div>
                    <div className="px-4 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full">
                        <span className="text-emerald-600 text-xs font-bold tracking-wide">✓ Interview Submitted</span>
                    </div>
                </div>

                <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
                    <div className="text-center mb-10">
                        <div className="text-6xl mb-4 drop-shadow-md">🎉</div>
                        <h1 className="text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">Interview Complete!</h1>
                        <p className="text-slate-500 font-medium">Your responses have been securely recorded.</p>

                        <div className="flex justify-center gap-6 mt-8">
                            {[
                                { label: 'Answered', value: `${answeredCount}/${questions.length}`, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
                                { label: 'Not Answered', value: questions.length - answeredCount, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-100' },
                                { label: 'Tab Switches', value: tabSwitches, color: tabSwitches > 0 ? 'text-amber-600' : 'text-slate-600', bg: tabSwitches > 0 ? 'bg-amber-50 border-amber-100' : 'bg-slate-50 border-slate-200' },
                            ].map(s => (
                                <div key={s.label} className={`px-8 py-5 rounded-2xl border ${s.bg} shadow-sm`}>
                                    <div className={`text-3xl font-extrabold mb-1 ${s.color}`}>{s.value}</div>
                                    <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">{s.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {videoBlob && (
                        <div className="bg-white rounded-3xl p-8 mb-8 shadow-xl border border-violet-100">
                            <h2 className="text-slate-900 font-bold mb-5 flex items-center gap-2"><span className="text-xl">🎬</span> Session Recording</h2>
                            <video controls className="w-full rounded-2xl max-h-80 bg-slate-900 shadow-inner"
                                src={URL.createObjectURL(videoBlob)} />
                        </div>
                    )}

                    <div className="mb-4 flex items-center justify-between px-2">
                        <h2 className="text-slate-900 font-bold text-lg">📋 Response Summary</h2>
                    </div>
                    <div className="flex flex-col gap-5">
                        {questions.map((q, idx) => {
                            const ans = answers[q.id];
                            const hasAnswer = ans?.answered;
                            const sectionInfo = sections.find(s => s.id === q.type);
                            const sText = sectionInfo?.color === 'blue' ? '#2563eb' : sectionInfo?.color === 'amber' ? '#d97706' : '#7FA582';
                            const sBg = sectionInfo?.color === 'blue' ? '#eff6ff' : sectionInfo?.color === 'amber' ? '#fffbeb' : '#F3F7EF';
                            const sBorder = sectionInfo?.color === 'blue' ? '#bfdbfe' : sectionInfo?.color === 'amber' ? '#fde68a' : '#C7D9C0';

                            return (
                                <div key={q.id} className={`rounded-3xl border p-6 bg-white shadow-sm hover:shadow-md transition-shadow
                                    ${hasAnswer ? 'border-violet-100' : 'border-rose-100 bg-rose-50/30'}`}>
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider"
                                            style={{ background: hasAnswer ? '#10b98120' : '#f43f5e20', color: hasAnswer ? '#059669' : '#e11d48', border: `1px solid ${hasAnswer ? '#10b98140' : '#f43f5e40'}` }}>
                                            {hasAnswer ? '✓ Saved' : '✗ Missed'}
                                        </span>
                                        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Q{idx + 1}</span>
                                        <span className="text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider border" style={{ background: sBg, color: sText, borderColor: sBorder }}>
                                            {sectionInfo?.label}
                                        </span>
                                    </div>
                                    <p className="text-slate-800 text-base font-semibold mb-4 leading-relaxed">{q.text}</p>

                                    {hasAnswer ? (
                                        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
                                            {q.type === 'mcq' ? (
                                                <p className="text-slate-700 text-sm font-medium">
                                                    Selected: <strong className="text-emerald-600">{String.fromCharCode(65 + ans.answer)}) {q.options?.[ans.answer]}</strong>
                                                </p>
                                            ) : q.type === 'coding' ? (
                                                <pre className="text-slate-800 text-xs font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap">{ans.answer}</pre>
                                            ) : (
                                                <p className="text-slate-600 text-sm leading-relaxed italic">"{ans.answer}"</p>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="bg-rose-50 rounded-2xl p-4 border border-rose-100">
                                            <p className="text-rose-600 font-medium text-sm">No answer provided — time expired or candidate skipped.</p>
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

    // ── INTERVIEW ROOM ────────────────────────────────────
    if (phase !== 'interview' || !currentQ) return null;

    const totalTime = currentQ.timeSeconds;
    const progress = (timeLeft / totalTime) * 100;
    const color = timerColor(timeLeft, totalTime);
    const sectionColor = currentSection.color;
    const sectionBg = sectionColor === 'blue' ? '#eff6ff' : sectionColor === 'amber' ? '#fffbeb' : '#F3F7EF';
    const sectionBorder = sectionColor === 'blue' ? '#bfdbfe' : sectionColor === 'amber' ? '#fde68a' : '#C7D9C0';
    const sectionText = sectionColor === 'blue' ? '#1d4ed8' : sectionColor === 'amber' ? '#d97706' : '#7FA582';

    const overallQNum = sections.slice(0, sectionIdx).reduce((acc, s) => acc + s.questions.length, 0) + qIdx + 1;

    return (
        <div className="h-screen flex flex-col overflow-hidden" style={{ background: '#faf9ff', color: '#1a1535' }}>
            {/* Top Bar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-violet-100 bg-white/80 backdrop-blur-md flex-shrink-0 z-10 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm bg-white border border-violet-100 shadow-sm">🧠</div>
                    <div className="flex flex-col">
                        <span className="text-slate-900 font-bold text-sm leading-none">Hire Karo</span>
                        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Live Evaluation</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {sections.map((s, i) => (
                        <div key={s.id} className="flex items-center gap-2">
                            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all border
                                ${i === sectionIdx ? 'bg-violet-100 text-violet-700 border-violet-200 shadow-sm'
                                    : i < sectionIdx ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                                        : 'text-slate-400 bg-slate-50 border-transparent'}`}>
                                {i < sectionIdx ? '✓' : s.icon} {s.label}
                            </div>
                            {i < sections.length - 1 && <span className="text-slate-300">›</span>}
                        </div>
                    ))}
                </div>

                <div className="flex items-center gap-4">
                    {tabSwitches > 0 && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 border border-rose-200 rounded-full shadow-sm">
                            <span className="text-rose-600 text-xs font-bold uppercase tracking-wider">⚠️ {tabSwitches} Warning{tabSwitches > 1 ? 's' : ''}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border shadow-sm bg-white" style={{ borderColor: color + '40' }}>
                        <div className="w-2.5 h-2.5 rounded-full animate-pulse shadow-sm" style={{ background: color }} />
                        <span className="text-sm font-extrabold tracking-wider" style={{ color }}>{formatTime(timeLeft)}</span>
                    </div>
                </div>
            </div>

            {/* Main Workspace */}
            <div className="flex flex-1 gap-5 p-5 overflow-hidden">

                {/* Left Panel */}
                <div className="w-72 flex flex-col gap-4 flex-shrink-0">
                    <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-200 shadow-md" style={{ aspectRatio: '4/3' }}>
                        <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover scale-x-[-1]" />
                        <div className="absolute bottom-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10">
                            <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                            <span className="text-white text-xs font-bold tracking-widest">LIVE</span>
                        </div>
                        {currentQ.type === 'verbal' && (
                            <div className="absolute top-3 right-3 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10">
                                <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`} />
                                <span className="text-white text-[10px] font-bold uppercase tracking-wider">{isListening ? 'Mic On' : 'Mic Off'}</span>
                            </div>
                        )}
                    </div>

                    <div className="p-5 rounded-3xl border shadow-sm" style={{ background: sectionBg, borderColor: sectionBorder }}>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-2xl">{currentSection.icon}</span>
                            <span className="font-extrabold text-base tracking-tight" style={{ color: sectionText }}>{currentSection.label}</span>
                        </div>
                        <div className="flex flex-col gap-3">
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-bold uppercase tracking-wider" style={{ color: sectionText + '80' }}>Question</span>
                                <span className="font-extrabold px-2 py-1 bg-white/50 rounded-md" style={{ color: sectionText }}>{qIdx + 1} of {currentSection.questions.length}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-bold uppercase tracking-wider" style={{ color: sectionText + '80' }}>Allocated</span>
                                <span className="font-extrabold px-2 py-1 bg-white/50 rounded-md" style={{ color: sectionText }}>{formatTime(currentQ.timeSeconds)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-5 bg-white rounded-3xl border border-violet-100 shadow-sm mt-auto">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Overall Progress</p>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
                            <div className="h-full rounded-full transition-all duration-700 ease-out"
                                style={{ width: `${(overallQNum / questions.length) * 100}%`, background: 'linear-gradient(90deg, #7FA582, #F4A28C)' }} />
                        </div>
                        <p className="text-xs font-bold text-slate-600">{Math.round((overallQNum / questions.length) * 100)}% Complete</p>
                    </div>
                </div>

                {/* Right Panel */}
                <div className="flex-1 flex flex-col gap-4 min-w-0 overflow-hidden">
                    <div className="bg-white border border-violet-100 shadow-sm rounded-3xl p-6 flex-shrink-0 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-50 to-transparent rounded-bl-[100px] pointer-events-none opacity-50" />
                        <div className="flex items-start justify-between gap-6 relative z-10">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border"
                                        style={{ background: sectionBg, color: sectionText, borderColor: sectionBorder }}>
                                        {currentSection.label} Module
                                    </span>
                                    <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Question {overallQNum}</span>
                                </div>
                                <p className="text-slate-800 text-xl font-bold leading-relaxed">{currentQ.text}</p>
                            </div>
                            <div className="flex-shrink-0 relative w-16 h-16 flex items-center justify-center bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
                                <svg className="w-12 h-12 -rotate-90" viewBox="0 0 64 64">
                                    <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="5" />
                                    <circle cx="32" cy="32" r="28" fill="none" stroke={color} strokeWidth="5"
                                        strokeDasharray={`${2 * Math.PI * 28}`}
                                        strokeDashoffset={`${2 * Math.PI * 28 * (1 - progress / 100)}`}
                                        strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s linear' }} />
                                </svg>
                                <span className="absolute text-[11px] font-extrabold tracking-tight" style={{ color }}>
                                    {timeLeft < 60 ? `${timeLeft}s` : `${Math.ceil(timeLeft / 60)}m`}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 bg-white border border-violet-100 shadow-sm rounded-3xl p-6 flex flex-col overflow-hidden">
                        {/* VERBAL */}
                        {currentQ.type === 'verbal' && (
                            <>
                                <div className="flex items-center justify-between mb-4 flex-shrink-0 pb-4 border-b border-slate-100">
                                    <p className="text-slate-500 font-medium text-sm">Dictation is transcribed below automatically.</p>
                                    <button onClick={isListening ? stopListening : startListening}
                                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all hover:scale-105"
                                        style={{
                                            background: isListening ? '#fef2f2' : '#ecfdf5',
                                            color: isListening ? '#ef4444' : '#10b981',
                                            border: `1px solid ${isListening ? '#fecaca' : '#a7f3d0'}`
                                        }}>
                                        {isListening ? '⏹ Pause' : '🎙 Start Speaking'}
                                    </button>
                                </div>
                                <div className="flex-1 bg-slate-50 rounded-2xl border border-slate-200 p-6 overflow-y-auto shadow-inner">
                                    {transcript ? (
                                        <p className="text-slate-800 text-base leading-relaxed tracking-wide">{transcript}</p>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full opacity-60">
                                            <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-xl mb-3">🎙️</div>
                                            <p className="text-slate-500 text-sm font-medium">
                                                {isListening ? 'Listening carefully... begin speaking.' : 'Click "Start Speaking" when ready.'}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {/* MCQ */}
                        {currentQ.type === 'mcq' && (
                            <div className="flex flex-col gap-3 flex-1 overflow-y-auto pr-2">
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Select the best answer</p>
                                {currentQ.options && currentQ.options.length > 0 ? (
                                    currentQ.options.map((opt, i) => (
                                        <button type="button" key={i} onClick={() => setSelectedOption(i)}
                                            className="flex items-center gap-5 p-5 rounded-2xl text-left transition-all outline-none group cursor-pointer"
                                            style={{
                                                background: selectedOption === i ? '#eff6ff' : '#ffffff',
                                                border: selectedOption === i ? '2px solid #3b82f6' : '2px solid #e2e8f0',
                                                boxShadow: selectedOption === i ? '0 4px 16px rgba(59,130,246,0.15)' : '0 2px 4px rgba(0,0,0,0.02)',
                                                transform: selectedOption === i ? 'scale(1.01)' : 'scale(1)',
                                                cursor: 'pointer'
                                            }}>
                                            <span className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-all
                                                ${selectedOption === i ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'}`}>
                                                {String.fromCharCode(65 + i)}
                                            </span>
                                            <span className={`text-base font-semibold ${selectedOption === i ? 'text-blue-900' : 'text-slate-700'}`}>{opt}</span>
                                            {selectedOption === i && (
                                                <span className="ml-auto text-blue-500 text-lg">✓</span>
                                            )}
                                        </button>
                                    ))
                                ) : (
                                    <div className="flex items-center justify-center py-8 text-slate-400 text-sm">
                                        No options available for this question
                                    </div>
                                )}
                            </div>
                        )}

                        {/* CODING */}
                        {currentQ.type === 'coding' && (
                            <div className="flex flex-col flex-1 gap-4 overflow-hidden">
                                <div className="flex items-center justify-between flex-shrink-0">
                                    <div className="flex items-center gap-3">
                                        <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Compiler</span>
                                        <div className="flex bg-slate-100 p-1 rounded-xl">
                                            {LANGUAGES.map(lang => (
                                                <button key={lang} onClick={() => handleLangChange(lang)}
                                                    className="px-4 py-1.5 rounded-lg text-xs font-bold transition-all"
                                                    style={{
                                                        background: language === lang ? '#ffffff' : 'transparent',
                                                        color: language === lang ? '#1a1535' : '#64608a',
                                                        boxShadow: language === lang ? '0 2px 6px rgba(0,0,0,0.05)' : 'none'
                                                    }}>
                                                    {lang}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-1 relative rounded-2xl overflow-hidden border shadow-inner min-h-0 bg-[#0f172a] border-slate-700">
                                    <div className="flex items-center justify-between px-4 py-2 bg-[#1e293b] border-b border-slate-700">
                                        <div className="flex items-center gap-3">
                                            <div className="flex gap-1.5">
                                                <div className="w-3 h-3 rounded-full bg-rose-500" />
                                                <div className="w-3 h-3 rounded-full bg-amber-500" />
                                                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                            </div>
                                            <span className="text-slate-400 text-xs font-mono font-medium">
                                                solution.{language === 'JavaScript' ? 'js' : language === 'Python' ? 'py' : language === 'Java' ? 'java' : 'cpp'}
                                            </span>
                                        </div>
                                    </div>
                                    <textarea value={code} onChange={e => { setCode(e.target.value); codeRef.current = e.target.value; }}
                                        spellCheck={false}
                                        className="w-full p-5 text-sm font-mono text-emerald-400 bg-transparent border-none outline-none resize-none"
                                        style={{ height: 'calc(100% - 40px)', lineHeight: '1.6', tabSize: 2 }}
                                        onKeyDown={e => {
                                            if (e.key === 'Tab') {
                                                e.preventDefault();
                                                const s = e.target.selectionStart;
                                                const updated = code.substring(0, s) + '  ' + code.substring(e.target.selectionEnd);
                                                setCode(updated);
                                                codeRef.current = updated;
                                                setTimeout(() => { e.target.selectionStart = e.target.selectionEnd = s + 2; }, 0);
                                            }
                                        }} />
                                </div>
                            </div>
                        )}

                        {/* Footer Actions */}
                        <div className="flex items-center justify-between mt-auto pt-5 border-t border-slate-100 flex-shrink-0">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                Auto-saves continuously
                            </span>
                            <button onClick={handleNext}
                                className="flex items-center gap-2 px-8 py-3.5 text-white font-bold text-sm rounded-xl transition-all shadow-lg hover:-translate-y-0.5 hover:shadow-xl"
                                style={{ background: 'linear-gradient(135deg, #7FA582, #F4A28C)' }}>
                                {sectionIdx === sections.length - 1 && qIdx === currentSection.questions.length - 1
                                    ? 'Submit Interview ✓'
                                    : 'Next Question →'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}