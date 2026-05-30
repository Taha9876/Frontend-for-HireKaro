'use client';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Users } from 'lucide-react';

export default function PanelMemberRoom() {
  const { token } = useParams();
  const [roomData, setRoomData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [callFrame, setCallFrame] = useState(null);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [showScoreForm, setShowScoreForm] = useState(false);
  const [score, setScore] = useState(70);
  const [feedback, setFeedback] = useState('');
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const roomRef = useRef(null);

  useEffect(() => {
    api
      .get(`/api/v1/panel/room/panel/${token}`)
      .then(res => {
        setRoomData(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.response?.data?.detail || 'Invalid or expired link');
        setLoading(false);
      });
  }, [token]);

  useEffect(() => {
    if (!roomData || !roomRef.current) return;

    const initCall = async () => {
      const DailyIframe = (await import('@daily-co/daily-js')).default;
      const frame = DailyIframe.createFrame(roomRef.current, {
        showLeaveButton: false,
        showFullscreenButton: false,
        iframeStyle: {
          width: '100%',
          height: '100%',
          border: 'none',
        },
      });

      await frame.join({
        url: roomData.daily_room_url,
        token: roomData.daily_token,
        userName: roomData.member_name,
      });

      frame.on('left-meeting', () => setShowScoreForm(true));
      setCallFrame(frame);
    };

    initCall();
    return () => {
      callFrame?.destroy();
    };
  }, [roomData]);

  const toggleMic = () => {
    if (!callFrame) return;
    callFrame.setLocalAudio(!micOn);
    setMicOn(!micOn);
  };
  const toggleCam = () => {
    if (!callFrame) return;
    callFrame.setLocalVideo(!camOn);
    setCamOn(!camOn);
  };

  const handleEndInterview = async () => {
    try {
      await api.post(`/api/v1/panel/room/panel/${token}/end`);
    } catch (e) {}
    callFrame?.leave();
    setShowScoreForm(true);
  };

  const handleSubmitScore = async () => {
    if (!score) return;
    setSubmitting(true);
    try {
      await api.post(`/api/v1/panel/room/panel/${token}/score`, {
        score: parseFloat(score),
        feedback: feedback,
      });
      setScoreSubmitted(true);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to submit score');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900 p-8">
        <div className="bg-slate-800 rounded-3xl p-10 text-center max-w-md">
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="text-white font-bold text-xl mb-2">Access Denied</h2>
          <p className="text-slate-400 text-sm">{error}</p>
        </div>
      </div>
    );

  if (scoreSubmitted)
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900 p-8">
        <div className="bg-slate-800 rounded-3xl p-10 text-center max-w-md">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-white font-bold text-2xl mb-2">
            Score Submitted!
          </h2>
          <p className="text-slate-400 text-sm">
            Thank you. Your score has been recorded.
          </p>
          <div className="mt-6 px-6 py-3 bg-blue-600 rounded-xl text-white font-bold text-lg">
            Score: {score}/100
          </div>
        </div>
      </div>
    );

  if (showScoreForm)
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900 p-8">
        <div className="bg-slate-800 rounded-3xl p-8 max-w-md w-full">
          <h2 className="text-white font-bold text-xl mb-2">
            Rate the Candidate
          </h2>
          <p className="text-slate-400 text-sm mb-6">
            Candidate:{' '}
            <strong className="text-white">{roomData?.candidate_name}</strong>
          </p>
          <div className="mb-6">
            <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-3">
              Score:{' '}
              <span className="text-blue-400 text-2xl font-extrabold ml-2">
                {score}
              </span>
              /100
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={score}
              onChange={e => setScore(e.target.value)}
              className="w-full accent-blue-500"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>0 — Poor</span>
              <span>50 — Average</span>
              <span>100 — Excellent</span>
            </div>
          </div>
          <div className="mb-6">
            <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-2">
              Feedback (optional)
            </label>
            <textarea
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              placeholder="Add your observations about the candidate..."
              rows={4}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white text-sm outline-none focus:border-blue-500 transition-all resize-none placeholder:text-slate-500"
            />
          </div>
          <button
            onClick={handleSubmitScore}
            disabled={submitting}
            className="w-full py-3.5 text-white font-bold rounded-xl disabled:opacity-60 cursor-pointer transition-all hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)' }}
          >
            {submitting ? 'Submitting...' : 'Submit Score →'}
          </button>
        </div>
      </div>
    );

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#0f172a',
      }}
    >
      {/* Top Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 24px',
          background: '#1e293b',
          borderBottom: '1px solid #334155',
          flexShrink: 0,
          height: '56px',
          zIndex: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#34d399',
            }}
          />
          <span style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>
            Panel Interview
          </span>
          <span style={{ color: '#94a3b8', fontSize: 12 }}>
            · {roomData?.candidate_name}
          </span>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            color: '#94a3b8',
            fontSize: 12,
          }}
        >
          <Users size={14} />
          <span>You are a panelist</span>
        </div>
      </div>

      {/* Video iframe container */}
      <div
        ref={roomRef}
        style={{
          flex: 1,
          overflow: 'hidden',
          position: 'relative',
          zIndex: 1,
        }}
      />

      {/* Controls Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          padding: '16px 24px',
          background: '#1e293b',
          borderTop: '1px solid #334155',
          flexShrink: 0,
          height: '80px',
          zIndex: 20,
        }}
      >
        <button
          onClick={toggleMic}
          style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: micOn ? '#334155' : '#ef4444',
            color: 'white',
          }}
        >
          {micOn ? <Mic size={20} /> : <MicOff size={20} />}
        </button>
        <button
          onClick={toggleCam}
          style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: camOn ? '#334155' : '#ef4444',
            color: 'white',
          }}
        >
          {camOn ? <Video size={20} /> : <VideoOff size={20} />}
        </button>
        <button
          onClick={handleEndInterview}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '12px 24px',
            borderRadius: 50,
            border: 'none',
            cursor: 'pointer',
            background: '#dc2626',
            color: 'white',
            fontWeight: 700,
            fontSize: 14,
          }}
        >
          <PhoneOff size={18} /> End Interview
        </button>
      </div>
    </div>
  );
}
