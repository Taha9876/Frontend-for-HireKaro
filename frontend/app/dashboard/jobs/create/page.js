'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';
import JobForm from '@/components/dashboard/JobForm';
import ResumeUpload from '@/components/dashboard/ResumeUpload';
import Questions from '@/components/dashboard/Questions';

const steps = [
    { number: 1, label: 'Job Details' },
    { number: 2, label: 'Upload Resumes' },
    { number: 3, label: 'Interview Questions' },
];

export default function CreateJobPage() {
    const router = useRouter();
    const pageRef = useRef(null);
    const [currentStep, setCurrentStep] = useState(1);
    const [jobId, setJobId] = useState(null);

    useEffect(() => {
        if (!pageRef.current) return;
        const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

        tl.fromTo('.dash-orb', { opacity: 0, scale: 0.5 }, { opacity: 0.25, scale: 1, duration: 2.5, stagger: 0.3 }, 0);
        tl.fromTo('.page-header', { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 1 }, 0.1);
        tl.fromTo('.stepper', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8 }, 0.3);
        tl.fromTo('.step-content', { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.8 }, 0.5);

        return () => tl.kill();
    }, [currentStep]);

    return (
        <div ref={pageRef} className="min-h-screen p-6 lg:p-10 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #fafbff 0%, #f3f0ff 100%)' }}>
            {/* Background Orbs */}
            <div className="dash-orb" style={{ position: 'absolute', top: '-10%', left: '-5%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%', zIndex: 0, filter: 'blur(60px)' }} />
            <div className="dash-orb" style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(192,38,211,0.1) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%', zIndex: 0, filter: 'blur(80px)' }} />

            <div style={{ position: 'relative', zIndex: 1, maxWidth: 1000, margin: '0 auto' }}>

            {/* Header */}
            <div className="page-header mb-8">
                <button onClick={() => router.push('/dashboard/jobs')}
                    className="flex items-center gap-2 text-sm text-slate-400 hover:text-purple-600 transition-colors bg-transparent border-none cursor-pointer mb-4">
                    ← Back to Jobs
                </button>
                <h1 className="text-3xl font-extrabold text-[#0a1628]"
                    style={{ fontFamily: 'Syne, sans-serif' }}>
                    Create New Job
                </h1>
                <p className="text-slate-400 mt-1 text-sm">Fill in the details to post a new position</p>
            </div>

            {/* Stepper */}
            <div className="stepper flex items-center gap-0 mb-10 bg-white/70 backdrop-blur-xl p-4 rounded-3xl border border-white/80 shadow-[0_8px_32px_rgba(139,92,246,0.05)]">
                {steps.map((step, idx) => (
                    <div key={step.number} className="flex items-center flex-1 last:flex-none">
                        <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all
                ${currentStep === step.number
                                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30'
                                    : currentStep > step.number
                                        ? 'bg-emerald-500 text-white'
                                        : 'bg-slate-200 text-slate-400'
                                }`}>
                                {currentStep > step.number ? '✓' : step.number}
                            </div>
                            <span className={`text-sm font-medium hidden sm:block
                ${currentStep === step.number ? 'text-purple-600' : currentStep > step.number ? 'text-emerald-500' : 'text-slate-400'}`}>
                                {step.label}
                            </span>
                        </div>
                        {idx < steps.length - 1 && (
                            <div className={`flex-1 h-0.5 mx-3 rounded transition-all
                ${currentStep > step.number ? 'bg-emerald-400' : 'bg-slate-200'}`} />
                        )}
                    </div>
                ))}
            </div>

            {/* Step Content */}
            <div className="step-content">
                {currentStep === 1 && (
                    <JobForm onSuccess={(id) => { setJobId(id); setCurrentStep(2); }} />
                )}
                {currentStep === 2 && (
                    <ResumeUpload jobId={jobId} onSuccess={() => setCurrentStep(3)} />
                )}
                {currentStep === 3 && (
                    <Questions jobId={jobId} onSuccess={() => router.push('/dashboard/jobs')} />
                )}
            </div>

            </div>
        </div>
    );
}