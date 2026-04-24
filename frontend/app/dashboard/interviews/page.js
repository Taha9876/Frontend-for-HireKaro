'use client';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Calendar, Video, Clock, Filter, Plus } from 'lucide-react';

export default function InterviewsPage() {
    const pageRef = useRef(null);

    useEffect(() => {
        if (!pageRef.current) return;
        const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

        tl.fromTo('.dash-orb', { opacity: 0, scale: 0.5 }, { opacity: 0.25, scale: 1, duration: 2.5, stagger: 0.3 }, 0);
        tl.fromTo('.page-header', { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 1 }, 0.1);
        tl.fromTo('.search-bar', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8 }, 0.3);
        tl.fromTo('.empty-state', { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.8 }, 0.5);

        return () => tl.kill();
    }, []);

    return (
        <div ref={pageRef} style={{ minHeight: '100vh', padding: '32px', background: 'linear-gradient(135deg, #fafbff 0%, #f3f0ff 100%)', position: 'relative', overflow: 'hidden' }}>
            {/* Background Orbs */}
            <div className="dash-orb" style={{ position: 'absolute', top: '15%', right: '5%', width: '35vw', height: '35vw', background: 'radial-gradient(circle, rgba(236,72,153,0.1) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%', zIndex: 0, filter: 'blur(60px)' }} />
            <div className="dash-orb" style={{ position: 'absolute', bottom: '-5%', left: '-15%', width: '45vw', height: '45vw', background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%', zIndex: 0, filter: 'blur(80px)' }} />

            <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
                {/* Header */}
                <div className="page-header flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8 p-6 rounded-3xl bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_8px_32px_rgba(139,92,246,0.05)]">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-pink-500/30">
                            <Calendar size={26} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-extrabold text-slate-900 m-0 tracking-tight">Interview Schedule</h1>
                            <p className="text-slate-500 text-sm mt-1 font-medium">Manage upcoming and past technical interviews</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3 w-full md:w-auto search-bar">
                        <button className="p-3 bg-white/80 border border-slate-200 rounded-xl text-slate-600 hover:text-pink-600 hover:border-pink-200 transition-colors">
                            <Filter size={20} />
                        </button>
                        <button className="flex items-center gap-2 px-6 py-3 text-white text-sm font-bold rounded-full transition-transform hover:scale-105 shadow-lg shadow-pink-500/30"
                            style={{ background: 'linear-gradient(135deg, #ec4899, #8b5cf6)' }}>
                            <Plus size={18} strokeWidth={3} /> Schedule
                        </button>
                    </div>
                </div>

                {/* Empty State */}
                <div className="empty-state flex flex-col items-center justify-center py-32 text-center bg-white/50 backdrop-blur-xl rounded-3xl border border-white/80 shadow-sm">
                    <div className="w-24 h-24 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 mb-6 shadow-inner relative">
                        <Video size={40} className="absolute z-10" />
                        <Clock size={20} className="absolute bottom-4 right-4 bg-white rounded-full text-violet-500 p-0.5" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">No Interviews Scheduled</h3>
                    <p className="text-slate-500 text-base mb-8 max-w-md">You have no upcoming interviews for the next 7 days. Schedule one from a candidate's profile.</p>
                </div>
            </div>
        </div>
    );
}