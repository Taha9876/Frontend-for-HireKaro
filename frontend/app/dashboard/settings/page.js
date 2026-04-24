'use client';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Settings, User, Building, Lock, Bell, Shield, Paintbrush } from 'lucide-react';

export default function SettingsPage() {
    const pageRef = useRef(null);

    useEffect(() => {
        if (!pageRef.current) return;
        const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

        tl.fromTo('.dash-orb', { opacity: 0, scale: 0.5 }, { opacity: 0.25, scale: 1, duration: 2.5, stagger: 0.3 }, 0);
        tl.fromTo('.page-header', { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 1 }, 0.1);
        tl.fromTo('.settings-nav', { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.8 }, 0.3);
        tl.fromTo('.settings-content', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8 }, 0.4);

        return () => tl.kill();
    }, []);

    const SECTIONS = [
        { id: 'profile', label: 'My Profile', icon: User, active: true },
        { id: 'company', label: 'Company Info', icon: Building, active: false },
        { id: 'security', label: 'Security', icon: Lock, active: false },
        { id: 'notifications', label: 'Notifications', icon: Bell, active: false },
        { id: 'permissions', label: 'Roles & Permissions', icon: Shield, active: false },
        { id: 'appearance', label: 'Appearance', icon: Paintbrush, active: false },
    ];

    return (
        <div ref={pageRef} style={{ minHeight: '100vh', padding: '32px', background: 'linear-gradient(135deg, #fafbff 0%, #f3f0ff 100%)', position: 'relative', overflow: 'hidden' }}>
            {/* Background Orbs */}
            <div className="dash-orb" style={{ position: 'absolute', top: '20%', right: '-5%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%', zIndex: 0, filter: 'blur(60px)' }} />
            <div className="dash-orb" style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: '45vw', height: '45vw', background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%', zIndex: 0, filter: 'blur(80px)' }} />

            <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
                {/* Header */}
                <div className="page-header flex items-center gap-4 mb-8 p-6 rounded-3xl bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_8px_32px_rgba(139,92,246,0.05)]">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white shadow-lg shadow-slate-500/30">
                        <Settings size={26} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-900 m-0 tracking-tight">Settings & Preferences</h1>
                        <p className="text-slate-500 text-sm mt-1 font-medium">Manage your account and platform configuration</p>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar Nav */}
                    <div className="settings-nav w-full md:w-64 flex flex-col gap-2">
                        {SECTIONS.map((sec) => (
                            <button key={sec.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${sec.active ? 'bg-white shadow-md text-violet-700 border border-violet-100' : 'text-slate-600 hover:bg-white/50 hover:text-slate-900'}`}>
                                <sec.icon size={18} className={sec.active ? 'text-violet-600' : 'text-slate-400'} />
                                {sec.label}
                            </button>
                        ))}
                    </div>

                    {/* Content Area */}
                    <div className="settings-content flex-1 bg-white/70 backdrop-blur-xl rounded-3xl border border-white/80 shadow-[0_8px_32px_rgba(139,92,246,0.05)] p-8">
                        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white text-2xl font-bold shadow-inner">
                                HR
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Admin User</h2>
                                <p className="text-slate-500 font-medium text-sm">admin@company.com</p>
                                <button className="mt-2 text-xs font-bold text-violet-600 bg-violet-50 px-3 py-1.5 rounded-lg hover:bg-violet-100 transition-colors">Change Photo</button>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">First Name</label>
                                    <input type="text" defaultValue="Admin" className="px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 font-medium" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Last Name</label>
                                    <input type="text" defaultValue="User" className="px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 font-medium" />
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                                <input type="email" defaultValue="admin@company.com" className="px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 font-medium" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Timezone</label>
                                <select className="px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 font-medium text-slate-700">
                                    <option>Pacific Time (PT)</option>
                                    <option>Eastern Time (ET)</option>
                                    <option>Coordinated Universal Time (UTC)</option>
                                </select>
                            </div>

                            <div className="pt-6 mt-8 border-t border-slate-100 flex justify-end gap-3">
                                <button className="px-6 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">Cancel</button>
                                <button className="px-6 py-3 rounded-xl font-bold text-white shadow-lg shadow-violet-500/30 transition-transform hover:scale-105" style={{ background: 'linear-gradient(135deg, #8b5cf6, #c026d3)' }}>Save Changes</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}