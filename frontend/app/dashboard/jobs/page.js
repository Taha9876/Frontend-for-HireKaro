'use client';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import api from '@/lib/api';
import { Briefcase, MapPin, Users, Hammer, Plus, Eye, Folder, ChevronRight, Rocket } from 'lucide-react';

export default function JobsPage() {
    const pageRef = useRef(null);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/api/v1/jobs')
            .then(res => setJobs(res.data))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (loading || !pageRef.current) return;
        const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

        tl.fromTo('.dash-orb', { opacity: 0, scale: 0.5 }, { opacity: 0.25, scale: 1, duration: 2.5, stagger: 0.3 }, 0);
        tl.fromTo('.page-header', { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 1 }, 0.1);
        tl.fromTo('.job-card', { opacity: 0, y: 30, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.8, stagger: 0.1 }, 0.2);

        return () => tl.kill();
    }, [loading]);

    const statusColors = {
        draft: 'bg-amber-100/50 text-amber-700 border-amber-200',
        active: 'bg-emerald-100/50 text-emerald-700 border-emerald-200',
        processing: 'bg-blue-100/50 text-blue-700 border-blue-200',
        closed: 'bg-red-100/50 text-red-700 border-red-200',
    };

    return (
        <div ref={pageRef} style={{ minHeight: '100vh', padding: '32px', background: '#FBF8F2', position: 'relative', overflow: 'hidden' }}>
            {/* Background Orbs */}
            <div className="dash-orb" style={{ position: 'absolute', top: '-10%', right: '-5%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(127, 165, 130,0.15) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%', zIndex: 0, filter: 'blur(60px)' }} />
            <div className="dash-orb" style={{ position: 'absolute', bottom: '-20%', left: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(244,162,140,0.18) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%', zIndex: 0, filter: 'blur(80px)' }} />

            <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
                {/* Header */}
                <div className="page-header flex items-center justify-between mb-8 p-6 rounded-3xl bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_8px_32px_rgba(127, 165, 130,0.05)]">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center text-white shadow-lg shadow-violet-500/30">
                            <Briefcase size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-extrabold text-slate-900 m-0 tracking-tight">Job Postings</h1>
                            <p className="text-slate-500 text-sm mt-1 font-medium">Manage and track your recruitment pipeline</p>
                        </div>
                    </div>
                    <Link href="/dashboard/jobs/create"
                        className="flex items-center gap-2 px-6 py-3 text-white text-sm font-bold rounded-full no-underline transition-all hover:scale-105"
                        style={{ background: 'linear-gradient(135deg, #7FA582, #9DBF9E)', boxShadow: '0 8px 24px rgba(127, 165, 130,0.35)' }}>
                        <Plus size={18} strokeWidth={3} /> Post New Job
                    </Link>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex items-center justify-center py-32">
                        <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : jobs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 text-center bg-white/50 backdrop-blur-xl rounded-3xl border border-white/80 shadow-sm">
                        <div className="w-24 h-24 bg-violet-100 rounded-full flex items-center justify-center text-violet-600 mb-6 shadow-inner">
                            <Rocket size={48} />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">No jobs posted yet</h3>
                        <p className="text-slate-500 text-base mb-8 max-w-md">Start building your dream team by creating your very first job posting.</p>
                        <Link href="/dashboard/jobs/create"
                            className="px-8 py-3.5 text-white text-base font-bold rounded-full no-underline transition-transform hover:scale-105 shadow-lg shadow-violet-500/30"
                            style={{ background: 'linear-gradient(135deg, #7FA582, #9DBF9E)' }}>
                            Create First Job
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {jobs.map((job) => (
                            <div key={job.id}
                                className="job-card group flex flex-col p-6 bg-white/70 backdrop-blur-xl rounded-3xl border border-white/80 hover:border-violet-300 hover:shadow-[0_8px_30px_rgba(127, 165, 130,0.12)] transition-all duration-300">
                                
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center text-violet-600 group-hover:bg-violet-600 group-hover:text-white transition-colors duration-300">
                                        <Briefcase size={20} />
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${statusColors[job.status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                        {job.status}
                                    </span>
                                </div>
                                
                                <div className="flex-1">
                                    <h3 className="font-bold text-slate-900 text-lg mb-1 line-clamp-1">{job.title}</h3>
                                    <div className="flex items-center gap-2 text-sm text-slate-500 font-medium mb-5">
                                        <Folder size={14} /> {job.department || 'General'}
                                    </div>

                                    <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs font-medium text-slate-600">
                                        {job.location && (
                                            <div className="flex items-center gap-1.5"><MapPin size={14} className="text-violet-500" /> {job.location}</div>
                                        )}
                                        <div className="flex items-center gap-1.5"><Users size={14} className="text-fuchsia-500" /> {job.total_positions} Role{job.total_positions > 1 ? 's' : ''}</div>
                                        <div className="flex items-center gap-1.5"><Hammer size={14} className="text-blue-500" /> {job.skills_count} Skills</div>
                                    </div>
                                </div>

                                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                                    <span className="text-xs font-medium text-slate-400">
                                        Posted {new Date(job.created_at).toLocaleDateString()}
                                    </span>
                                    <Link href={`/dashboard/jobs/${job.id}`}
                                        className="flex items-center gap-1 px-4 py-2 text-sm font-bold text-violet-700 bg-violet-50 hover:bg-violet-600 hover:text-white rounded-xl transition-colors no-underline">
                                        <Eye size={16} /> View <ChevronRight size={16} />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}