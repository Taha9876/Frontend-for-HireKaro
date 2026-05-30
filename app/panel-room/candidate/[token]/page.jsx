'use client';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';

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

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
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

  if (ended)
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900 p-8">
        <div className="bg-slate-800 rounded-3xl p-10 text-center max-w-md">
          <div className="text-5xl mb-4">🎯</div>
          <h2 className="text-white font-bold text-2xl mb-2">
            Interview Complete!
          </h2>
          <p className="text-slate-400 text-sm">
            Thank you for attending. You will be notified about the results.
          </p>
        </div>
      </div>
    );

  if (waiting)
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900 p-8">
        <div className="bg-slate-800 rounded-3xl p-10 text-center max-w-md">
          <div className="text-5xl mb-6">⏳</div>
          <h2 className="text-white font-bold text-2xl mb-3">Waiting Room</h2>
          <p className="text-slate-400 text-sm mb-6">
            Please wait — the panel has not joined yet. This page will
            automatically refresh.
          </p>
          <div className="flex items-center justify-center gap-2 text-emerald-400 text-sm font-medium">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Checking every 5 seconds...
          </div>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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
        </div>
        <span style={{ color: '#94a3b8', fontSize: 12 }}>
          You are the candidate
        </span>
      </div>

      {/* Video iframe */}
      <div
        ref={roomRef}
        style={{ flex: 1, overflow: 'hidden', position: 'relative', zIndex: 1 }}
      />

      {/* Controls */}
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
          onClick={handleLeave}
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
          <PhoneOff size={18} /> Leave
        </button>
      </div>
    </div>
  );
}
