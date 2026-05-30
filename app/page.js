'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';

gsap.registerPlugin(ScrollTrigger);

/* ─── Data ─── */
const counters = [
  { value: 80, suffix: '%', label: 'Faster Screening', desc: 'Reduce time-to-shortlist' },
  { value: 95, suffix: '%', label: 'Match Precision', desc: 'Semantic AI accuracy' },
  { value: 100, suffix: '%', label: 'Bias-Free Selection', desc: 'Objective AI evaluation' },
  { value: 24, suffix: '/7', label: 'AI Availability', desc: 'Always-on automation' },
];

const features = [
  {
    title: 'AI Semantic Resume Matching',
    desc: 'Goes beyond simple keyword matching. AI converts job descriptions and resumes into embeddings and performs semantic similarity matching to identify the most relevant candidates.',
    gradientCSS: 'linear-gradient(135deg, #F4A28C, #E88A72)',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Zm3.75 11.625a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
      </svg>
    ),
  },
  {
    title: 'Automatic Question Generation',
    desc: 'The system automatically generates tailored interview questions based purely on the job role and description. HR can easily edit, remove, or add questions as needed.',
    gradientCSS: 'linear-gradient(135deg, #9DBF9E, #7FA582)',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
      </svg>
    ),
  },
  {
    title: 'AI Answer Evaluation',
    desc: 'During structured interviews, the AI evaluates candidate answers and assigns a score based on relevance, clarity, and correctness, ensuring an objective review.',
    gradientCSS: 'linear-gradient(135deg, #F4D58D, #E9C26A)',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.745 3.745 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
      </svg>
    ),
  },
  {
    title: 'Behavioral Video Analysis',
    desc: 'The system analyzes recorded interview videos to estimate candidate confidence levels, eye contact, and overall facial engagement for a complete profile.',
    gradientCSS: 'linear-gradient(135deg, #9AD0C2, #7BB8A8)',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
      </svg>
    ),
  },
  {
    title: 'Automated Shortlisting',
    desc: 'Candidates with scores above the defined threshold are shortlisted automatically. Other candidates receive automated, polite rejection emails.',
    gradientCSS: 'linear-gradient(135deg, #C4B5E0, #A693CC)',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" />
      </svg>
    ),
  },
  {
    title: 'Final Candidate Ranking',
    desc: 'Combines the semantic resume score, interview answer evaluation, and behavioral analysis to generate a final ranked list for HR decision making.',
    gradientCSS: 'linear-gradient(135deg, #F4A28C, #C4B5E0)',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
      </svg>
    ),
  },
];

const howItWorks = [
  { step: '01', title: 'Job & Question Prep', desc: 'HR creates a job posting with required skills. The system automatically generates relevant interview questions based on the role.' },
  { step: '02', title: 'Upload & Match', desc: 'HR uploads resumes. AI extracts text, converts it into embeddings, and performs semantic matching to find the best fit.' },
  { step: '03', title: 'Auto-Shortlist & Interview', desc: 'Top candidates are automatically invited to a structured video interview, while others receive automated rejection emails.' },
  { step: '04', title: 'Evaluate & Rank', desc: 'AI evaluates interview answers and analyzes candidate behavior, generating a final ranked list for quick HR decision making.' },
];

const testimonials = [
  { quote: 'Hire Karo entirely automated our early recruitment pipeline. The semantic matching is spot on, and the video behavioral analysis saves us countless hours.', name: 'Sarah Chen', role: 'VP of People, TechFlow', avatar: 'SC' },
  { quote: 'We used to waste time interviewing poorly matched applicants. Now, the AI auto-shortlists and evaluates answers, leaving us with only the best candidates.', name: 'Marcus Rodriguez', role: 'Head of Talent, ScaleUp', avatar: 'MR' },
  { quote: 'It literally feels like having an extra team of recruiters. Generating questions automatically and ranking candidates across 3 dimensions is a game changer.', name: 'Emily Watson', role: 'Recruiting Lead, NovaTech', avatar: 'EW' },
];

const faqs = [
  { q: 'How is Hire Karo different from traditional ATS platforms?', a: 'Many Applicant Tracking Systems focus only on resume storage and manual shortlisting. Hire Karo introduces deeper AI automation: semantic matching, automatic question generation, answer evaluation, and video behavioral analysis.' },
  { q: 'How does the semantic resume matching work?', a: 'Our AI converts both the job description and candidate resumes into mathematical embeddings. It then performs a semantic similarity search, scoring candidates on actual context and meaning, not just simple keyword matching.' },
  { q: 'What is evaluated in the behavioral video analysis?', a: 'During the AI-led video interview, our computer vision models analyze the candidate\'s confidence levels, eye contact, and facial engagement to provide a comprehensive behavioral score.' },
  { q: 'How does the system generate interview questions?', a: 'When HR creates a job, they input a title, description, and required skills. The AI instantly generates tailored interview questions specific to that role, which HR can modify if desired.' },
  { q: 'What happens to candidates who aren\'t shortlisted?', a: 'Candidates who score below the defined threshold during the resume matching phase are automatically sent courteous rejection emails, saving your HR team from manual follow-ups.' },
  { q: 'Is the final ranking purely AI-based?', a: 'Yes. The final candidate ranking combines the resume semantic score, the AI answer evaluation score, and the behavioral video score. HR retains complete access to review all details and make the final hiring decision.' },
];

const trustedLogos = ['Google', 'Microsoft', 'Stripe', 'Shopify', 'Slack', 'Notion', 'Linear', 'Figma'];

/* ─── FadeIn wrapper ─── */
function FadeIn({ children, delay = 0, y = 30, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay, ease: 'easeOut' }}
      viewport={{ once: true, margin: '-80px' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── FAQ Item ─── */
function FAQItem({ faq, index }) {
  const [open, setOpen] = useState(false);
  const answerRef = useRef(null);

  useEffect(() => {
    if (!answerRef.current) return;
    if (open) {
      gsap.to(answerRef.current, { maxHeight: answerRef.current.scrollHeight, duration: 0.4, ease: 'power2.out' });
    } else {
      gsap.to(answerRef.current, { maxHeight: 0, duration: 0.3, ease: 'power2.in' });
    }
  }, [open]);

  return (
    <div className="faq-item rounded-2xl overflow-hidden backdrop-blur-md bg-white/70 border border-[#1C1B2E]/8 shadow-lg transition-all hover:shadow-xl">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-7 py-6 text-left bg-transparent border-none cursor-pointer outline-none"
        id={`faq-toggle-${index}`}
      >
        <span className="text-base font-semibold pr-4 text-[#1C1B2E]">{faq.q}</span>
        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-lg transition-all duration-300 flex-shrink-0 ${open ? 'bg-[#1C1B2E] text-white rotate-45' : 'bg-[#F4D58D]/40 text-[#1C1B2E]'}`}>+</span>
      </button>
      <div ref={answerRef} style={{ maxHeight: 0, overflow: 'hidden' }}>
        <p className="px-7 pb-6 text-sm leading-relaxed text-[#4A4860]">{faq.a}</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════ */
export default function HomePage() {
  const rootRef = useRef(null);
  const marqueeRef = useRef(null);
  const testimonialsRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    if (!rootRef.current) return;

    const ctx = gsap.context(() => {

      /* ── Counter animations ── */
      ScrollTrigger.create({
        trigger: '#stats-section',
        start: 'top 85%',
        onEnter: () => {
          document.querySelectorAll('.counter-value').forEach((node) => {
            const target = Number(node.getAttribute('data-target') || 0);
            const proxy = { value: 0 };
            gsap.to(proxy, {
              value: target,
              duration: 2.2,
              ease: 'power2.out',
              onUpdate: () => { node.textContent = Math.round(proxy.value).toString(); },
            });
          });
        },
        onLeaveBack: () => {
          document.querySelectorAll('.counter-value').forEach((node) => {
            node.textContent = '0';
          });
        },
      });

      /* ── Marquees ── */
      if (marqueeRef.current) {
        gsap.to(marqueeRef.current, {
          xPercent: -50,
          duration: 25,
          ease: 'none',
          repeat: -1,
        });
      }

      if (testimonialsRef.current) {
        gsap.to(testimonialsRef.current, {
          xPercent: -50,
          duration: 35,
          ease: 'none',
          repeat: -1,
        });
      }


    }, rootRef);

    /* Also refresh on window load for late image layout */
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener('load', onLoad);

    return () => {
      window.removeEventListener('load', onLoad);
      ctx.revert();
    };
  }, []);

  return (
    <div ref={rootRef} className="min-h-screen overflow-x-hidden relative">
      {/* Page-wide cream background with subtle palette ambient — carries hero theme across all sections */}
      <div className="fixed inset-0 -z-10 bg-[#FBF8F2] overflow-hidden">
        <div
          className="absolute top-[10%] -left-[10%] w-[650px] h-[650px] rounded-full blur-3xl opacity-40 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(157,191,158,0.45), rgba(157,191,158,0) 70%)' }}
        />
        <div
          className="absolute top-[40%] -right-[10%] w-[700px] h-[700px] rounded-full blur-3xl opacity-40 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(244,162,140,0.40), rgba(244,162,140,0) 70%)' }}
        />
        <div
          className="absolute top-[70%] left-[20%] w-[600px] h-[600px] rounded-full blur-3xl opacity-35 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(244,213,141,0.45), rgba(244,213,141,0) 70%)' }}
        />
        <div
          className="absolute bottom-[5%] right-[15%] w-[550px] h-[550px] rounded-full blur-3xl opacity-30 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(196,181,224,0.40), rgba(196,181,224,0) 70%)' }}
        />
        <div
          className="absolute top-[25%] left-[40%] w-[500px] h-[500px] rounded-full blur-3xl opacity-30 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(154,208,194,0.40), rgba(154,208,194,0) 70%)' }}
        />
      </div>

      {/* ═══ HERO ═══ */}
      <section className="relative px-4 sm:px-6 pb-16 md:pb-24 pt-24 md:pt-32 md:px-10 z-10 overflow-hidden bg-white" id="hero-section">
        {/* Layered pastel ribbon background — tilted bands rising left → right */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 1440 900"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              {/* Each band fades at left & right edges for that ribbon look */}
              <linearGradient id="lyrSage" x1="0%" x2="100%">
                <stop offset="0%" stopColor="#9DBF9E" stopOpacity="0" />
                <stop offset="20%" stopColor="#9DBF9E" stopOpacity="0.85" />
                <stop offset="80%" stopColor="#7FA582" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#7FA582" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="lyrMint" x1="0%" x2="100%">
                <stop offset="0%" stopColor="#9AD0C2" stopOpacity="0" />
                <stop offset="25%" stopColor="#9AD0C2" stopOpacity="0.80" />
                <stop offset="80%" stopColor="#BFE3D6" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#9AD0C2" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="lyrYellow" x1="0%" x2="100%">
                <stop offset="0%" stopColor="#F4D58D" stopOpacity="0" />
                <stop offset="25%" stopColor="#F4D58D" stopOpacity="0.85" />
                <stop offset="80%" stopColor="#F8E2A8" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#F4D58D" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="lyrCoral" x1="0%" x2="100%">
                <stop offset="0%" stopColor="#F4A28C" stopOpacity="0" />
                <stop offset="25%" stopColor="#F4A28C" stopOpacity="0.85" />
                <stop offset="80%" stopColor="#F4B58A" stopOpacity="0.80" />
                <stop offset="100%" stopColor="#F4A28C" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="lyrLilac" x1="0%" x2="100%">
                <stop offset="0%" stopColor="#C4B5E0" stopOpacity="0" />
                <stop offset="30%" stopColor="#C4B5E0" stopOpacity="0.75" />
                <stop offset="80%" stopColor="#A693CC" stopOpacity="0.65" />
                <stop offset="100%" stopColor="#C4B5E0" stopOpacity="0" />
              </linearGradient>

              <filter id="lyrSoft" x="-10%" y="-50%" width="120%" height="200%">
                <feGaussianBlur stdDeviation="22" />
              </filter>
            </defs>

            {/* Tilt the whole stack so bands rise from left to right */}
            <g transform="rotate(-12 720 450)" filter="url(#lyrSoft)">
              {/* Lilac (back, top) */}
              <rect x="-300" y="430" width="2200" height="70" fill="url(#lyrLilac)" />
              {/* Sage */}
              <rect x="-300" y="510" width="2200" height="80" fill="url(#lyrSage)" />
              {/* Mint */}
              <rect x="-300" y="600" width="2200" height="75" fill="url(#lyrMint)" />
              {/* Yellow */}
              <rect x="-300" y="685" width="2200" height="85" fill="url(#lyrYellow)" />
              {/* Coral (front, bottom) */}
              <rect x="-300" y="780" width="2200" height="95" fill="url(#lyrCoral)" />
            </g>

            {/* Crisp ribbon outlines along the seams for layered definition */}
            <g transform="rotate(-12 720 450)" opacity="0.5" fill="none" strokeLinecap="round">
              <path d="M-200,500 L 1700,500" stroke="#A693CC" strokeWidth="1" />
              <path d="M-200,590 L 1700,590" stroke="#7FA582" strokeWidth="1" />
              <path d="M-200,675 L 1700,675" stroke="#7BB8A8" strokeWidth="1" />
              <path d="M-200,770 L 1700,770" stroke="#E9C26A" strokeWidth="1" />
              <path d="M-200,875 L 1700,875" stroke="#E88A72" strokeWidth="1" />
            </g>
          </svg>
        </div>

        <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-10 lg:gap-12 lg:grid-cols-[1.1fr_1fr]">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <motion.div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F3F3EE] border border-[#1C1B2E]/10 shadow-sm mb-7"
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <svg className="w-3 h-3 text-[#7FA582]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l4 10-4 10-4-10 4-10z"/>
              </svg>
              <span className="text-[#1C1B2E] font-semibold text-[10.5px] tracking-[0.22em] uppercase">AI-Powered. Human-Centered.</span>
            </motion.div>

            <h1
              className="text-[2.5rem] sm:text-[3rem] md:text-[3.5rem] lg:text-[4rem] font-medium leading-[1.05] tracking-[-0.025em] text-[#1C1B2E] mb-6"
              style={{ fontFamily: 'var(--font-serif), ui-serif, Georgia, serif', fontFeatureSettings: '"ss01","ss02"' }}
            >
              <span
                className="bg-clip-text text-transparent italic"
                style={{
                  backgroundImage:
                    'linear-gradient(95deg,#F4A28C 0%,#F4B58A 20%,#F4D58D 45%,#BBD4A6 70%,#9DBF9E 88%,#C4B5E0 100%)',
                  fontFamily: 'var(--font-serif), ui-serif, Georgia, serif',
                }}
              >
                Fairer
              </span>{' '}decisions.<br/>
              Stronger people.<br/>
              Better organisations.
            </h1>

            <p className="text-[15px] sm:text-base text-[#4A4860] max-w-lg mb-7 leading-[1.65]">
              Hire Karo uses ethical AI to remove bias, promote diversity, and help organisations build workplaces where everyone has an equal opportunity to thrive.
            </p>

            <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 mb-9">
              <Link href="/auth/signup">
                <motion.button
                  whileHover={{ scale: 1.03, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#1C1B2E] text-white font-semibold shadow-md shadow-[#1C1B2E]/15 hover:shadow-xl transition-all text-sm"
                >
                  Book a Demo
                  <span aria-hidden>→</span>
                </motion.button>
              </Link>
              <Link href="#features">
                <motion.button
                  whileHover={{ scale: 1.03, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white border border-[#1C1B2E]/12 text-[#1C1B2E] font-semibold shadow-sm hover:shadow-md transition-all text-sm"
                >
                  Explore Platform
                </motion.button>
              </Link>
            </div>

            {/* Trust pillars row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-5 gap-y-5 max-w-xl">
              {[
                {
                  title: 'Bias Reduction',
                  sub: 'Built-in fairness',
                  bg: '#9AD0C2',
                  ring: '#7BB8A8',
                  icon: (
                    <svg className="w-5 h-5 text-[#1C1B2E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-4z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4"/>
                    </svg>
                  ),
                },
                {
                  title: 'Diversity & Inclusion',
                  sub: 'Every voice matters',
                  bg: '#F4D58D',
                  ring: '#E9C26A',
                  icon: (
                    <svg className="w-5 h-5 text-[#1C1B2E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <circle cx="9" cy="8" r="3"/>
                      <circle cx="17" cy="9" r="2.5"/>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 19c.8-3 3.3-5 6-5s5.2 2 6 5M14 19c.6-2.2 2.2-3.6 4-3.6s3.4 1.4 4 3.6"/>
                    </svg>
                  ),
                },
                {
                  title: 'Data Security',
                  sub: 'UK & EU Compliant',
                  bg: '#F4A28C',
                  ring: '#E88A72',
                  icon: (
                    <svg className="w-5 h-5 text-[#1C1B2E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <rect x="4" y="10" width="16" height="10" rx="2"/>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 10V7a4 4 0 1 1 8 0v3"/>
                    </svg>
                  ),
                },
                {
                  title: 'Fair & Transparent',
                  sub: 'Explainable AI',
                  bg: '#C4B5E0',
                  ring: '#A693CC',
                  icon: (
                    <svg className="w-5 h-5 text-[#1C1B2E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M5 8h14M7 8l-3 7a4 4 0 0 0 8 0L9 8M17 8l-3 7a4 4 0 0 0 8 0l-3-7"/>
                    </svg>
                  ),
                },
              ].map((p) => (
                <div key={p.title} className="flex flex-col items-start gap-1.5">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ background: `${p.bg}40`, boxShadow: `inset 0 0 0 1px ${p.ring}50` }}
                  >
                    {p.icon}
                  </div>
                  <div>
                    <div className="text-[13px] font-bold text-[#1C1B2E] leading-tight">{p.title}</div>
                    <div className="text-[11px] text-[#4A4860] mt-0.5">{p.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="hero-image relative flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <div className="relative group w-full max-w-[560px] mx-auto">
              {/* Ambient glow */}
              <div className="absolute -inset-6 rounded-[2rem] blur-3xl opacity-80 group-hover:opacity-100 transition-opacity duration-500" style={{ background: 'linear-gradient(135deg, rgba(127,165,130,0.45), rgba(157,191,158,0.40) 45%, rgba(244,213,141,0.30) 80%, rgba(196,181,224,0.25))' }} />

              {/* Dashboard mockup */}
              <div className="relative rounded-[1.5rem] overflow-hidden shadow-2xl border border-[#1C1B2E]/10 bg-white/85 backdrop-blur-xl">
                {/* Top bar */}
                <div className="flex items-center gap-3 px-5 py-3.5 bg-white border-b border-[#1C1B2E]/8">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[11px] font-bold" style={{ background: 'linear-gradient(135deg,#F4A28C,#E9C26A 50%,#A693CC)' }}>HK</div>
                    <span className="text-sm font-bold text-[#1C1B2E]">HireKaro</span>
                  </div>
                  <div className="flex-1" />
                  <div className="hidden sm:flex items-center gap-1 text-[10px] font-medium text-[#4A4860] bg-[#FBF8F2] border border-[#1C1B2E]/8 rounded-md px-2 py-1">All Departments <span className="text-[#807E94]">▾</span></div>
                  <div className="w-7 h-7 rounded-full bg-[#FBF8F2] border border-[#1C1B2E]/8 flex items-center justify-center text-[#4A4860]">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0a3 3 0 01-6 0"/></svg>
                  </div>
                  <div className="w-7 h-7 rounded-full" style={{ background: 'linear-gradient(135deg,#F4A28C,#C4B5E0)' }} />
                </div>

                {/* Body: sidebar + content */}
                <div className="flex bg-[#FBF8F2]/60">
                  {/* Sidebar */}
                  <div className="hidden sm:flex flex-col justify-between gap-3 py-4 px-3 border-r border-[#1C1B2E]/6 min-w-[150px]">
                    <div className="flex flex-col gap-0.5">
                      {[
                        { label: 'Overview', active: true, color: '#7FA582' },
                        { label: 'Candidates' },
                        { label: 'Jobs' },
                        { label: 'Assessments' },
                        { label: 'Analytics' },
                        { label: 'Diversity' },
                        { label: 'Reports' },
                        { label: 'Settings' },
                      ].map((n) => (
                        <div key={n.label} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] font-medium ${n.active ? 'bg-[#9DBF9E]/25 text-[#1C1B2E]' : 'text-[#4A4860]'}`}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: n.active ? (n.color || '#7FA582') : '#CFCDD9' }} />
                          {n.label}
                        </div>
                      ))}
                    </div>

                    {/* Certified Fair Hiring / LGBTQ+ Inclusion card */}
                    <div className="rounded-lg bg-white border border-[#1C1B2E]/8 p-2.5">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[8px] font-semibold uppercase tracking-wider text-[#807E94]">Certified</span>
                        <svg viewBox="0 0 24 24" className="w-3 h-3">
                          <defs>
                            <linearGradient id="prideHeart" x1="0" x2="1" y1="0" y2="1">
                              <stop offset="0%" stopColor="#E53935"/>
                              <stop offset="20%" stopColor="#FB8C00"/>
                              <stop offset="40%" stopColor="#FDD835"/>
                              <stop offset="60%" stopColor="#43A047"/>
                              <stop offset="80%" stopColor="#1E88E5"/>
                              <stop offset="100%" stopColor="#8E24AA"/>
                            </linearGradient>
                          </defs>
                          <path fill="url(#prideHeart)" d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 5a5.5 5.5 0 0 1 9.5 7c-2.5 4.5-9.5 9-9.5 9z"/>
                        </svg>
                      </div>
                      <div className="text-[11px] font-bold text-[#1C1B2E] leading-tight mb-1">Fair Hiring</div>
                      <div className="text-[9px] text-[#4A4860] leading-snug">We support<br/>LGBTQ+ Inclusion</div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-4 space-y-3">
                    <div>
                      <div className="text-sm font-bold text-[#1C1B2E]">Welcome back, Alex <span>👋</span></div>
                      <div className="text-[10px] text-[#4A4860]">Here&apos;s what&apos;s happening with your hiring.</div>
                    </div>

                    {/* KPI cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { label: 'Total Candidates', value: '1,248', trend: '↑ 12%', dot: '#F4A28C' },
                        { label: 'Shortlisted', value: '342', trend: '↑ 8%', dot: '#F4D58D' },
                        { label: 'Hires', value: '56', trend: '↑ 15%', dot: '#9DBF9E' },
                        { label: 'Diversity Index', value: '85', trend: 'Excellent', dot: '#C4B5E0' },
                      ].map((k) => (
                        <div key={k.label} className="rounded-lg bg-white border border-[#1C1B2E]/8 p-2.5">
                          <div className="text-[9px] text-[#4A4860] mb-0.5 truncate">{k.label}</div>
                          <div className="text-base font-extrabold text-[#1C1B2E] leading-tight">{k.value}</div>
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: k.dot }} />
                            <span className="text-[8.5px] text-[#4A4860] font-medium">{k.trend}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Two-up: Gauge + Donut */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {/* Bias-free gauge */}
                      <div className="rounded-lg bg-white border border-[#1C1B2E]/8 p-3">
                        <div className="text-[10px] font-semibold text-[#1C1B2E] mb-1">Bias Free Hiring Score</div>
                        <div className="relative h-20 flex items-center justify-center">
                          <svg viewBox="0 0 120 70" className="w-full h-full">
                            <defs>
                              <linearGradient id="gaugeGrad" x1="0" x2="1">
                                <stop offset="0%" stopColor="#F4A28C"/>
                                <stop offset="50%" stopColor="#F4D58D"/>
                                <stop offset="100%" stopColor="#7FA582"/>
                              </linearGradient>
                            </defs>
                            <path d="M10,60 A50,50 0 0 1 110,60" fill="none" stroke="#F1EFE6" strokeWidth="10" strokeLinecap="round"/>
                            <path d="M10,60 A50,50 0 0 1 110,60" fill="none" stroke="url(#gaugeGrad)" strokeWidth="10" strokeLinecap="round" strokeDasharray="157" strokeDashoffset="9"/>
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
                            <div className="text-xl font-extrabold text-[#1C1B2E] leading-none">94%</div>
                            <div className="text-[9px] font-semibold text-[#7FA582]">Excellent</div>
                          </div>
                        </div>
                      </div>

                      {/* Diversity donut */}
                      <div className="rounded-lg bg-white border border-[#1C1B2E]/8 p-3">
                        <div className="text-[10px] font-semibold text-[#1C1B2E] mb-1">Diversity Overview</div>
                        <div className="flex items-center gap-3">
                          <svg viewBox="0 0 42 42" className="w-16 h-16 -rotate-90">
                            <circle cx="21" cy="21" r="15.915" fill="none" stroke="#F1EFE6" strokeWidth="5"/>
                            <circle cx="21" cy="21" r="15.915" fill="none" stroke="#9DBF9E" strokeWidth="5" strokeDasharray="48 52" strokeDashoffset="0"/>
                            <circle cx="21" cy="21" r="15.915" fill="none" stroke="#F4D58D" strokeWidth="5" strokeDasharray="40 60" strokeDashoffset="-48"/>
                            <circle cx="21" cy="21" r="15.915" fill="none" stroke="#9AD0C2" strokeWidth="5" strokeDasharray="7 93" strokeDashoffset="-88"/>
                            <circle cx="21" cy="21" r="15.915" fill="none" stroke="#C4B5E0" strokeWidth="5" strokeDasharray="5 95" strokeDashoffset="-95"/>
                          </svg>
                          <div className="flex flex-col gap-0.5 text-[9px]">
                            <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#9DBF9E]"/><span className="text-[#4A4860]">Women</span><span className="font-bold text-[#1C1B2E] ml-auto">48%</span></div>
                            <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#F4D58D]"/><span className="text-[#4A4860]">Men</span><span className="font-bold text-[#1C1B2E] ml-auto">40%</span></div>
                            <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#9AD0C2]"/><span className="text-[#4A4860]">Non-binary</span><span className="font-bold text-[#1C1B2E] ml-auto">7%</span></div>
                            <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#C4B5E0]"/><span className="text-[#4A4860]">Other</span><span className="font-bold text-[#1C1B2E] ml-auto">5%</span></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Recent activity + AI Insight */}
                    <div className="grid grid-cols-1 sm:grid-cols-[1.5fr_1fr] gap-2">
                      <div className="rounded-lg bg-white border border-[#1C1B2E]/8 p-3">
                        <div className="text-[10px] font-semibold text-[#1C1B2E] mb-2">Recent Activity</div>
                        <div className="space-y-1.5">
                          {[
                            { c: '#F4A28C', name: 'Jane Cooper', act: 'shortlisted for Senior Policy Advisor', time: '2h' },
                            { c: '#9DBF9E', name: 'John Smith', act: 'completed the technical assessment', time: '5h' },
                          ].map((a) => (
                            <div key={a.name} className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-[#1C1B2E] shrink-0" style={{ background: a.c }}>{a.name[0]}</div>
                              <div className="text-[9px] text-[#4A4860] flex-1 leading-snug"><span className="font-bold text-[#1C1B2E]">{a.name}</span> {a.act}</div>
                              <div className="text-[8px] text-[#807E94] shrink-0">{a.time}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-lg bg-white border border-[#1C1B2E]/8 p-3 flex flex-col">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="inline-flex items-center justify-center w-4 h-4 rounded-md bg-[#F4D58D]/60 text-[7px] font-extrabold text-[#1C1B2E]">AI</span>
                          <span className="text-[10px] font-semibold text-[#1C1B2E]">AI Insight</span>
                        </div>
                        <p className="text-[9px] text-[#4A4860] leading-snug flex-1">
                          Your JD for Policy Advisor is inclusive and appealing to a diverse talent pool.
                        </p>
                        <button className="mt-2 inline-flex items-center justify-center gap-1 text-[9px] font-semibold text-[#1C1B2E] bg-[#FBF8F2] border border-[#1C1B2E]/10 rounded-md px-2 py-1 hover:bg-white transition">
                          View Insight
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating micro-badges */}
              <motion.div
                className="absolute -left-3 sm:-left-6 top-10 hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-white shadow-xl border border-[#1C1B2E]/8"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <div className="w-7 h-7 rounded-lg bg-[#9AD0C2]/40 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-[#1C1B2E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-[#1C1B2E] leading-tight">Bias check passed</div>
                  <div className="text-[9px] text-[#4A4860]">Audit-ready</div>
                </div>
              </motion.div>

              <motion.div
                className="absolute -right-3 sm:-right-6 bottom-10 hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-white shadow-xl border border-[#1C1B2E]/8"
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
              >
                <div className="w-7 h-7 rounded-lg bg-[#F4D58D]/50 flex items-center justify-center text-[11px] font-bold text-[#1C1B2E]">AI</div>
                <div>
                  <div className="text-[10px] font-bold text-[#1C1B2E] leading-tight">94% match score</div>
                  <div className="text-[9px] text-[#4A4860]">Semantic ranking</div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ TRUSTED LOGOS ═══ */}
      <section className="relative py-12 px-0 bg-white/40 backdrop-blur-sm border-y border-[#1C1B2E]/5 z-10 overflow-hidden">
        <div className="mx-auto max-w-7xl px-6">
          <div className="trusted-heading text-center mb-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#4A4860]">Trusted by forward-thinking teams</p>
            <p className="mt-2 text-sm text-[#807E94]">Building inclusive, bias-free hiring with organisations that put people first.</p>
          </div>
        </div>
        <div className="flex w-[200%] md:w-[150%]">
          <div className="flex whitespace-nowrap" ref={marqueeRef}>
            {[...trustedLogos, ...trustedLogos, ...trustedLogos, ...trustedLogos].map((name, idx) => (
              <span key={idx} className="text-2xl font-bold text-[#1C1B2E]/30 mx-10 uppercase tracking-widest cursor-default transition-colors hover:text-[#1C1B2E]">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ STATS / COUNTERS ═══ */}
      <section id="stats-section" className="py-16 sm:py-24 px-4 sm:px-6 md:px-10 z-10 relative">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
            {counters.map((stat, i) => (
              <FadeIn key={stat.label} delay={i * 0.1} className="h-full">
              <div className="stat-card h-full backdrop-blur-md bg-white/70 border border-[#1C1B2E]/8 shadow-xl hover:shadow-2xl rounded-3xl p-8 transition-all hover:-translate-y-2 text-center group">
                <p className="text-5xl md:text-6xl font-extrabold bg-clip-text text-transparent mb-2" style={{ backgroundImage: 'linear-gradient(135deg,#7FA582,#9DBF9E,#F4D58D)' }}>
                  <span className="counter-value" data-target={stat.value}>0</span>{stat.suffix}
                </p>
                <p className="text-base font-bold text-[#1C1B2E] mb-1">{stat.label}</p>
                <p className="text-xs text-[#4A4860] font-medium">{stat.desc}</p>
              </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section id="features" className="features-section py-32 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <FadeIn className="features-heading text-center mb-16">
            <span className="inline-flex rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-[0.14em] mb-4 bg-[#F4A28C]/25 text-[#1C1B2E] border border-[#E88A72]/40">Capabilities</span>
            <h2 className="text-4xl md:text-5xl font-bold text-[#1C1B2E] leading-tight">Ethical AI across the <span className="italic font-serif bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg,#7FA582,#9DBF9E,#F4D58D)' }}>recruitment pipeline</span></h2>
            <p className="mt-4 mx-auto max-w-2xl text-lg text-[#4A4860]">Beyond keyword search and storage — Hire Karo automates resume understanding, interview generation, behavioural review and ranking, with fairness baked in.</p>
          </FadeIn>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                className="feature-card group relative backdrop-blur-md bg-white/70 border border-[#1C1B2E]/8 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all overflow-hidden"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ duration: 0.6, delay: i * 0.08, ease: 'easeOut' }}
              >
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 pointer-events-none" style={{ background: f.gradientCSS }}></div>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 text-white shadow-md" style={{ background: f.gradientCSS }}>
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold text-[#1C1B2E] mb-2">{f.title}</h3>
                <p className="text-[#4A4860] text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section id="how-it-works" className="hiw-section py-16 sm:py-24 px-4 sm:px-6 md:px-10 bg-white/40 backdrop-blur-sm border-y border-[#1C1B2E]/5 z-10 relative">
        <div className="mx-auto max-w-7xl">
          <FadeIn className="hiw-heading text-center mb-16">
            <span className="inline-flex rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-[0.14em] bg-[#9DBF9E]/30 text-[#1C1B2E] border border-[#7FA582]/40">System Workflow</span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl text-[#1C1B2E]">
              The fair <span className="italic font-serif bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg,#7FA582,#9DBF9E,#F4D58D)' }}>hiring process</span>
            </h2>
          </FadeIn>
          <div className="relative grid gap-8 md:grid-cols-4">
            {howItWorks.map((step, i) => (
              <FadeIn key={step.step} delay={i * 0.12} className="h-full">
              <div className="hiw-step h-full relative text-center z-10 backdrop-blur-md bg-white/70 p-8 rounded-3xl border border-[#1C1B2E]/8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="w-12 h-12 rounded-full bg-[#1C1B2E] text-white font-bold text-lg flex items-center justify-center mx-auto mb-5 shadow-md" style={{ boxShadow: `0 0 0 4px ${['#F4A28C','#9DBF9E','#F4D58D','#9AD0C2'][i]}55` }}>
                  {step.step}
                </div>
                <h3 className="text-lg font-bold text-[#1C1B2E] mb-2">{step.title}</h3>
                <p className="text-sm text-[#4A4860] leading-relaxed">{step.desc}</p>
              </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ DASHBOARD PREVIEW ═══ */}
      <section className="dashboard-preview-section py-20 sm:py-32 px-4 sm:px-6 md:px-10 z-10 relative" id="dashboard-preview">
        <div className="max-w-7xl mx-auto">
          <FadeIn className="text-center mb-16 dash-heading">
            <div>
              <span className="inline-flex rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-[0.14em] mb-4 bg-[#C4B5E0]/30 text-[#1C1B2E] border border-[#A693CC]/40">Dashboard</span>
              <h2 className="text-4xl md:text-5xl font-bold text-[#1C1B2E] leading-tight">
                Your hiring command <span className="italic font-serif bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg,#7FA582,#9DBF9E,#F4D58D)' }}>center</span>
              </h2>
              <p className="mt-4 mx-auto max-w-2xl text-lg text-[#4A4860]">
                Monitor your entire AI recruitment pipeline, track parsed resumes, review behavioural analysis, and make data-driven decisions — all from one transparent dashboard.
              </p>
            </div>
          </FadeIn>

          <div className="grid gap-12 lg:grid-cols-5 items-center">
            {/* Dashboard Screenshot */}
            <FadeIn className="lg:col-span-3 dash-screenshot">
              <div className="relative group">
                {/* Glow effect behind */}
                <div className="absolute -inset-4 rounded-[2.5rem] blur-2xl opacity-60 group-hover:opacity-80 transition-opacity duration-500" style={{ background: 'linear-gradient(135deg, rgba(244,162,140,0.30), rgba(244,213,141,0.25) 50%, rgba(196,181,224,0.30))' }} />

                {/* Browser chrome mockup */}
                <div className="relative rounded-[1.5rem] overflow-hidden shadow-2xl border border-[#1C1B2E]/8 bg-white/70 backdrop-blur-md">
                  {/* Top bar */}
                  <div className="flex items-center gap-2 px-5 py-3.5 bg-white/80 border-b border-gray-200/60">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-rose-400" />
                      <div className="w-3 h-3 rounded-full bg-amber-400" />
                      <div className="w-3 h-3 rounded-full bg-emerald-400" />
                    </div>
                    <div className="flex-1 mx-4">
                      <div className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-gray-100/80 border border-gray-200/50 max-w-md mx-auto">
                        <span className="text-xs text-gray-400 font-medium">hirekaro.app/dashboard</span>
                      </div>
                    </div>
                  </div>
                  {/* Screenshot */}
                  <div className="relative">
                    <img
                      src="/images/dashboard-preview.png"
                      alt="Hire Karo Dashboard Preview"
                      className="w-full h-auto"
                    />
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Feature highlights */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {[
                {
                  title: 'Real-Time AI Analytics',
                  desc: 'Track AI resume shortlists and interview evaluations with live-updating KPI cards and trend charts.'
                },
                {
                  title: 'Semantic Pipeline',
                  desc: 'See exactly how candidates progress through your AI matching and video assessment phases.'
                },
                {
                  title: 'Automated Workflows',
                  desc: 'Generate interview questions instantly and trigger automatic rejection emails to non-shortlisted applicants.'
                },
                {
                  title: 'Objective Rankings',
                  desc: 'Review the final candidate rankings generated from a combination of resume, answer, and behavior scores.'
                }
              ].map((item, i) => (
                <FadeIn key={item.title} delay={i * 0.1}>
                <div
                  className="dash-feature flex items-start gap-4 p-5 rounded-2xl backdrop-blur-md bg-white/70 border border-[#1C1B2E]/8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
                >
                  <div className="w-1 self-stretch rounded-full" style={{ background: ['#F4A28C','#9DBF9E','#F4D58D','#9AD0C2'][i] }} />
                  <div>
                    <h4 className="font-bold text-[#1C1B2E] mb-1">{item.title}</h4>
                    <p className="text-sm text-[#4A4860] leading-relaxed">{item.desc}</p>
                  </div>
                </div>
                </FadeIn>
              ))}

              <Link href="/auth/signup" className="dash-feature">
                <button
                  className="mt-2 w-full px-8 py-4 rounded-full bg-[#1C1B2E] text-white font-semibold shadow-lg hover:shadow-xl transition-all text-base hover:-translate-y-0.5"
                >
                  Try the Dashboard Free →
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ WHY CHOOSE US ═══ */}
      <section className="why-choose-section py-20 sm:py-32 px-4 sm:px-6 md:px-10 z-10 relative bg-white/50 backdrop-blur-sm border-y border-[#1C1B2E]/5">
        <div className="max-w-7xl mx-auto">
          <FadeIn className="why-choose-heading text-center mb-16">
            <span className="inline-flex rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-[0.14em] mb-4 bg-[#9AD0C2]/30 text-[#1C1B2E] border border-[#7BB8A8]/40">Problem vs. Solution</span>
            <h2 className="text-4xl md:text-5xl font-bold text-[#1C1B2E] leading-tight">
              Stop wasting time <span className="italic font-serif bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg,#7FA582,#9DBF9E,#F4D58D)' }}>interviewing the wrong applicants</span>
            </h2>
            <p className="mt-4 mx-auto max-w-2xl text-lg text-[#4A4860]">
              Hire Karo lets HR teams identify the best candidates fast — fairly automating the early stages of recruitment without sacrificing transparency.
            </p>
          </FadeIn>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: 'Beyond ATS Storage',
                desc: 'Unlike traditional ATS, we introduce deeper AI automation across the entire recruitment pipeline.',
                stat: 'AI-First'
              },
              {
                title: 'Eliminate Bias',
                desc: 'AI scores candidates based entirely on answers and video behavior, completely removing human bias.',
                stat: '100%'
              },
              {
                title: 'Save Manual Hours',
                desc: 'Automatically shortlist candidates and send polite rejection emails to those who don\'t meet the criteria.',
                stat: '80%'
              },
              {
                title: 'Hire the Best',
                desc: 'With semantic matching and comprehensive scoring, ensure you never miss a strong candidate.',
                stat: 'Top 1%'
              }
            ].map((item, i) => (
              <FadeIn key={item.title} delay={i * 0.1} className="h-full">
              <div className="why-choose-card h-full relative p-8 rounded-2xl bg-white/70 backdrop-blur-md border border-[#1C1B2E]/8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1" style={{ background: ['#F4A28C','#9DBF9E','#F4D58D','#C4B5E0'][i] }} />
                <div className="text-3xl font-bold bg-clip-text text-transparent mb-2" style={{ backgroundImage: 'linear-gradient(135deg,#7FA582,#9DBF9E,#F4D58D)' }}>{item.stat}</div>
                <h3 className="text-lg font-bold text-[#1C1B2E] mb-2">{item.title}</h3>
                <p className="text-sm text-[#4A4860] leading-relaxed">{item.desc}</p>
              </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section className="testimonials-section py-32 px-0 overflow-hidden z-10 relative">
        <FadeIn className="testimonials-heading mx-auto max-w-7xl px-6 mb-16 text-center">
          <span className="inline-flex rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-[0.14em] mb-4 bg-[#F4D58D]/40 text-[#1C1B2E] border border-[#E9C26A]/40">Success Stories</span>
          <h2 className="text-4xl md:text-5xl font-bold text-[#1C1B2E]">Trusted by the <span className="italic font-serif bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg,#7FA582,#9DBF9E,#F4D58D)' }}>best</span></h2>
        </FadeIn>

        <div className="flex w-[300%] md:w-[200%]">
          <div className="flex gap-6 whitespace-nowrap px-6" ref={testimonialsRef}>
            {[...testimonials, ...testimonials, ...testimonials].map((t, i) => (
              <div key={i} className="inline-block w-[450px] md:w-[500px] p-8 rounded-3xl border border-[#1C1B2E]/8 bg-white/70 backdrop-blur-md shadow-xl whitespace-normal shrink-0 hover:-translate-y-1 transition-transform">
                <p className="text-[#1C1B2E] text-lg mb-8 leading-relaxed font-medium">“{t.quote}”</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-[#1C1B2E] font-bold shadow-md" style={{ background: ['#F4A28C','#9DBF9E','#F4D58D','#9AD0C2','#C4B5E0'][i % 5] }}>
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-[#1C1B2E]">{t.name}</div>
                    <div className="text-[#4A4860] text-sm">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="faq-section py-16 sm:py-20 px-4 sm:px-6 md:px-10 z-10 relative">
        <div className="mx-auto max-w-3xl">
          <FadeIn className="faq-heading text-center mb-14">
            <span className="inline-flex rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-[0.14em] bg-[#C4B5E0]/30 text-[#1C1B2E] border border-[#A693CC]/40">FAQ</span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl text-[#1C1B2E]">
              Frequently asked <span className="italic font-serif bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg,#7FA582,#9DBF9E,#F4D58D)' }}>questions</span>
            </h2>
          </FadeIn>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <FadeIn key={i} delay={i * 0.05}>
                <FAQItem faq={faq} index={i} />
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="pb-20 sm:pb-28 pt-8 px-4 sm:px-6 md:px-10 z-10 relative">
        <FadeIn className="final-cta mx-auto w-full max-w-5xl relative overflow-hidden rounded-[2rem] sm:rounded-[3rem] p-8 sm:p-14 md:p-20 text-center shadow-2xl">
          <div className="absolute inset-0" style={{ background: '#1C1B2E' }} />
          <div className="absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full blur-3xl opacity-50" style={{ background: 'radial-gradient(circle, rgba(244,162,140,0.55), transparent 70%)' }} />
          <div className="absolute -bottom-24 -right-24 w-[420px] h-[420px] rounded-full blur-3xl opacity-50" style={{ background: 'radial-gradient(circle, rgba(196,181,224,0.55), transparent 70%)' }} />
          <div className="absolute top-1/3 left-1/2 w-[300px] h-[300px] rounded-full blur-3xl opacity-40" style={{ background: 'radial-gradient(circle, rgba(244,213,141,0.45), transparent 70%)' }} />
          <div className="relative z-10">
            <span className="inline-flex rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest mb-6 bg-white/10 text-white/90 border border-white/20">Ready to hire fairly?</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-6 leading-tight">Let ethical AI handle the pipeline.<br />You make the final, fair call.</h2>
            <p className="text-base sm:text-lg max-w-2xl mx-auto text-white/75 font-medium mb-8 sm:mb-10">
              Join 500+ teams using Hire Karo to build diverse, high-performing organisations — with transparency at every step.
            </p>
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center justify-center gap-3 sm:gap-5">
              <Link href="/auth/signup">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-white px-10 py-4 text-base font-bold text-[#1C1B2E] shadow-xl transition-all hover:shadow-2xl"
                >
                  Book a Demo <span aria-hidden>→</span>
                </motion.button>
              </Link>
              <Link href="/contact">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto rounded-full px-10 py-4 text-base font-bold text-white border border-white/25 backdrop-blur-md bg-white/5 transition-all shadow-xl hover:bg-white/10"
                >
                  Contact Sales
                </motion.button>
              </Link>
            </div>
          </div>
        </FadeIn>
      </section>
    </div>
  );
}