'use client';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Users } from 'lucide-react';
import { motion } from 'framer-motion';

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
          borderRadius: '16px',
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

  // Ambient backgrounds helper
  const AmbientBg = () => (
    <>
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden bg-[#FBF8F2]">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#C4B5E0]/20 to-[#9AD0C2]/20 blur-3xl" />
        <div className="absolute bottom-[20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-[#F4A28C]/20 to-[#F4D58D]/20 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#1C1B2E 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
      </div>
    </>
  );

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen relative overflow-hidden bg-[#FBF8F2]">
        <AmbientBg />
        <div className="relative z-10 w-10 h-10 border-4 border-[#1C1B2E] border-t-transparent rounded-full animate-spin" />
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen p-8 relative overflow-hidden bg-[#FBF8F2]">
        <AmbientBg />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 bg-white/70 backdrop-blur-xl border border-red-200/50 rounded-3xl p-10 text-center max-w-md shadow-xl"
        >
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="text-[#1C1B2E] font-bold text-xl mb-2">Access Denied</h2>
          <p className="text-[#4A4860] text-sm">{error}</p>
        </motion.div>
      </div>
    );

  if (scoreSubmitted)
    return (
      <div className="flex items-center justify-center min-h-screen p-8 relative overflow-hidden bg-[#FBF8F2]">
        <AmbientBg />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 bg-white/70 backdrop-blur-xl border border-[#1C1B2E]/10 rounded-3xl p-10 text-center max-w-md shadow-xl"
        >
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-[#1C1B2E] font-bold text-2xl mb-2">
            Score Submitted!
          </h2>
          <p className="text-[#4A4860] text-sm mb-6">
            Thank you. Your score has been recorded.
          </p>
          <div className="inline-block px-8 py-3 bg-[#7FA582] text-white font-extrabold rounded-2xl text-xl shadow-md">
            Score: {score}/100
          </div>
        </motion.div>
      </div>
    );

  if (showScoreForm)
    return (
      <div className="flex items-center justify-center min-h-screen p-8 relative overflow-hidden bg-[#FBF8F2]">
        <AmbientBg />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 bg-white/70 backdrop-blur-xl border border-[#1C1B2E]/10 rounded-3xl p-8 max-w-md w-full shadow-2xl"
        >
          <h2 className="text-[#1C1B2E] font-extrabold text-2xl mb-1 tracking-tight">
            Rate the Candidate
          </h2>
          <p className="text-[#4A4860] text-sm mb-6 font-medium">
            Candidate:{' '}
            <strong className="text-[#1C1B2E] font-bold">{roomData?.candidate_name}</strong>
          </p>
          
          <div className="mb-6">
            <label className="text-[#4A4860] text-xs font-bold uppercase tracking-wider block mb-3">
              Score:{' '}
              <span className="text-[#7FA582] text-3xl font-black ml-1">
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
              className="w-full accent-[#7FA582] h-2 bg-[#1C1B2E]/10 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-[#807E94] mt-2 font-medium">
              <span>0 — Poor</span>
              <span>50 — Average</span>
              <span>100 — Excellent</span>
            </div>
          </div>

          <div className="mb-6">
            <label className="text-[#4A4860] text-xs font-bold uppercase tracking-wider block mb-2">
              Feedback (optional)
            </label>
            <textarea
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              placeholder="Add your observations about the candidate..."
              rows={4}
              className="w-full px-4 py-3 bg-[#FBF8F2] border border-[#1C1B2E]/10 rounded-xl text-[#1C1B2E] text-sm outline-none focus:border-[#7FA582] transition-all resize-none placeholder:text-[#807E94] focus:bg-white"
            />
          </div>

          <button
            onClick={handleSubmitScore}
            disabled={submitting}
            className="w-full py-4 text-white font-bold rounded-2xl disabled:opacity-60 cursor-pointer transition-all hover:-translate-y-0.5 shadow-md"
            style={{ background: 'linear-gradient(135deg, #1C1B2E, #7FA582)' }}
          >
            {submitting ? 'Submitting...' : 'Submit Score →'}
          </button>
        </motion.div>
      </div>
    );

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#FBF8F2',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <AmbientBg />

      {/* Top Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 24px',
          background: 'rgba(255, 255, 255, 0.75)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(28, 27, 46, 0.08)',
          flexShrink: 0,
          height: '60px',
          zIndex: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#7BB8A8',
              boxShadow: '0 0 8px #7BB8A8'
            }}
          />
          <span style={{ color: '#1C1B2E', fontWeight: 850, fontSize: 15 }}>
            Panel Interview
          </span>
          <span style={{ color: '#4A4860', fontSize: 12, fontWeight: 500 }}>
            · {roomData?.candidate_name}
          </span>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            color: '#4A4860',
            fontSize: 12,
            fontWeight: 500
          }}
        >
          <Users size={14} />
          <span>You are a panelist</span>
        </div>
      </div>

      {/* Video iframe container */}
      <div
        ref={roomRef}
        className="m-4 md:m-6 rounded-2xl overflow-hidden shadow-lg border border-[#1C1B2E]/10 bg-[#1C1B2E]/5"
        style={{
          flex: 1,
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
          background: 'rgba(255, 255, 255, 0.75)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(28, 27, 46, 0.08)',
          flexShrink: 0,
          height: '84px',
          zIndex: 20,
        }}
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
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
            background: micOn ? '#1C1B2E' : '#E88A72',
            color: 'white',
            boxShadow: '0 4px 12px rgba(28, 27, 46, 0.1)',
            transition: 'background-color 0.2s'
          }}
        >
          {micOn ? <Mic size={20} /> : <MicOff size={20} />}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
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
            background: camOn ? '#1C1B2E' : '#E88A72',
            color: 'white',
            boxShadow: '0 4px 12px rgba(28, 27, 46, 0.1)',
            transition: 'background-color 0.2s'
          }}
        >
          {camOn ? <Video size={20} /> : <VideoOff size={20} />}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05, y: -1 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleEndInterview}
          className="bg-gradient-to-r from-[#F4A28C] to-[#E88A72] hover:shadow-lg transition-all"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '12px 24px',
            borderRadius: 50,
            border: 'none',
            cursor: 'pointer',
            color: 'white',
            fontWeight: 700,
            fontSize: 14,
          }}
        >
          <PhoneOff size={18} /> End Interview
        </motion.button>
      </div>
    </div>
  );
}
