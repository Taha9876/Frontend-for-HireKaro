'use client';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CandidatePanelRoom() {
  const { token } = useParams();
  const [roomData, setRoomData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [waiting, setWaiting] = useState(false);
  const [callFrame, setCallFrame] = useState(null);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [ended, setEnded] = useState(false);
  const roomRef = useRef(null);

  const checkAccess = async () => {
    try {
      const res = await api.get(`/api/v1/panel/room/candidate/${token}`);
      if (res.data.accessible) {
        setRoomData(res.data);
        setWaiting(false);
      } else {
        setWaiting(true);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid or expired link');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAccess();
  }, [token]);

  useEffect(() => {
    if (!waiting) return;
    const interval = setInterval(checkAccess, 5000);
    return () => clearInterval(interval);
  }, [waiting]);

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
        userName: roomData.candidate_name,
      });

      frame.on('left-meeting', () => setEnded(true));
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
  const handleLeave = () => {
    callFrame?.leave();
    setEnded(true);
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

  if (ended)
    return (
      <div className="flex items-center justify-center min-h-screen p-8 relative overflow-hidden bg-[#FBF8F2]">
        <AmbientBg />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 bg-white/70 backdrop-blur-xl border border-[#1C1B2E]/10 rounded-3xl p-10 text-center max-w-md shadow-xl"
        >
          <div className="text-5xl mb-4">🎯</div>
          <h2 className="text-[#1C1B2E] font-bold text-2xl mb-2">
            Interview Complete!
          </h2>
          <p className="text-[#4A4860] text-sm">
            Thank you for attending. You will be notified about the results.
          </p>
        </motion.div>
      </div>
    );

  if (waiting)
    return (
      <div className="flex items-center justify-center min-h-screen p-8 relative overflow-hidden bg-[#FBF8F2]">
        <AmbientBg />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 bg-white/70 backdrop-blur-xl border border-[#1C1B2E]/10 rounded-3xl p-10 text-center max-w-md shadow-xl"
        >
          <div className="text-5xl mb-6">⏳</div>
          <h2 className="text-[#1C1B2E] font-bold text-2xl mb-3">Waiting Room</h2>
          <p className="text-[#4A4860] text-sm mb-6 leading-relaxed">
            Please wait — the panel has not joined yet. This page will
            automatically refresh.
          </p>
          <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-[#9AD0C2]/20 border border-[#7BB8A8]/30 text-[#1C1B2E] text-xs font-semibold">
            <div className="w-2 h-2 rounded-full bg-[#7BB8A8] animate-pulse" />
            Checking every 5 seconds...
          </div>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#7BB8A8',
              boxShadow: '0 0 8px #7BB8A8'
            }}
          />
          <span style={{ color: '#1C1B2E', fontWeight: 800, fontSize: 15, tracking: '-0.01em' }}>
            Panel Interview
          </span>
        </div>
        <span style={{ color: '#4A4860', fontSize: 12, fontWeight: 500 }}>
          You are the candidate
        </span>
      </div>

      {/* Video iframe */}
      <div
        ref={roomRef}
        className="m-4 md:m-6 rounded-2xl overflow-hidden shadow-lg border border-[#1C1B2E]/10 bg-[#1C1B2E]/5"
        style={{ flex: 1, position: 'relative', zIndex: 1 }}
      />

      {/* Controls */}
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
          onClick={handleLeave}
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
          <PhoneOff size={18} /> Leave
        </motion.button>
      </div>
    </div>
  );
}
