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
    gradientCSS: 'linear-gradient(to bottom right, #a855f7, #ec4899)',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Zm3.75 11.625a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
      </svg>
    ),
  },
  {
    title: 'Automatic Question Generation',
    desc: 'The system automatically generates tailored interview questions based purely on the job role and description. HR can easily edit, remove, or add questions as needed.',
    gradientCSS: 'linear-gradient(to bottom right, #8b5cf6, #a855f7)',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
      </svg>
    ),
  },
  {
    title: 'AI Answer Evaluation',
    desc: 'During structured interviews, the AI evaluates candidate answers and assigns a score based on relevance, clarity, and correctness, ensuring an objective review.',
    gradientCSS: 'linear-gradient(to bottom right, #ec4899, #f43f5e)',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.745 3.745 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
      </svg>
    ),
  },
  {
    title: 'Behavioral Video Analysis',
    desc: 'The system analyzes recorded interview videos to estimate candidate confidence levels, eye contact, and overall facial engagement for a complete profile.',
    gradientCSS: 'linear-gradient(to bottom right, #9333ea, #8b5cf6)',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
      </svg>
    ),
  },
  {
    title: 'Automated Shortlisting',
    desc: 'Candidates with scores above the defined threshold are shortlisted automatically. Other candidates receive automated, polite rejection emails.',
    gradientCSS: 'linear-gradient(to bottom right, #db2777, #9333ea)',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" />
      </svg>
    ),
  },
  {
    title: 'Final Candidate Ranking',
    desc: 'Combines the semantic resume score, interview answer evaluation, and behavioral analysis to generate a final ranked list for HR decision making.',
    gradientCSS: 'linear-gradient(to bottom right, #7c3aed, #ec4899)',
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
    <div className="faq-item rounded-2xl overflow-hidden backdrop-blur-md bg-white/60 border border-white/30 shadow-lg transition-all hover:shadow-xl">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-7 py-6 text-left bg-transparent border-none cursor-pointer outline-none"
        id={`faq-toggle-${index}`}
      >
        <span className="text-base font-semibold pr-4 text-gray-900">{faq.q}</span>
        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-lg transition-all duration-300 flex-shrink-0 ${open ? 'bg-purple-600 text-white rotate-45' : 'bg-purple-50 text-purple-600'}`}>+</span>
      </button>
      <div ref={answerRef} style={{ maxHeight: 0, overflow: 'hidden' }}>
        <p className="px-7 pb-6 text-sm leading-relaxed text-gray-600">{faq.a}</p>
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
      {/* Animated Background from Pricing Page */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-violet-100 -z-10">
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute w-[600px] h-[600px] top-[-10%] right-[-5%] rounded-full bg-gradient-to-br from-purple-400/20 to-pink-400/20 blur-3xl pointer-events-none"
            animate={{
              x: mousePosition.x * 0.02,
              y: mousePosition.y * 0.02,
              scale: [1, 1.1, 1]
            }}
            transition={{ type: "spring", stiffness: 100, damping: 20, scale: { duration: 4, repeat: Infinity } }}
          />
          <motion.div
            className="absolute w-[500px] h-[500px] bottom-[20%] left-[-10%] rounded-full bg-gradient-to-br from-violet-400/20 to-purple-400/20 blur-3xl pointer-events-none"
            animate={{
              x: mousePosition.x * -0.02,
              y: mousePosition.y * -0.02,
              scale: [1, 1.15, 1]
            }}
            transition={{ type: "spring", stiffness: 100, damping: 20, scale: { duration: 5, repeat: Infinity, delay: 1 } }}
          />
          <motion.div
            className="absolute w-[400px] h-[400px] top-[40%] right-[30%] rounded-full bg-gradient-to-br from-pink-400/20 to-violet-400/20 blur-3xl pointer-events-none"
            animate={{
              x: mousePosition.x * 0.03,
              y: mousePosition.y * 0.03,
              scale: [1, 1.2, 1]
            }}
            transition={{ type: "spring", stiffness: 100, damping: 20, scale: { duration: 6, repeat: Infinity, delay: 2 } }}
          />
        </div>
      </div>

      {/* ═══ HERO ═══ */}
      <section className="relative px-4 sm:px-6 pb-16 md:pb-24 pt-28 md:pt-40 md:px-10 z-10" id="hero-section">
        <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-12 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <motion.div
              className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full backdrop-blur-md bg-white/70 border border-purple-200/50 shadow-sm mb-7"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <div className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
              <span className="text-purple-700 font-semibold text-sm tracking-wide">AI-Powered HR Recruitment Platform</span>
            </motion.div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[4rem] font-extrabold leading-[1.08] tracking-tight text-gray-900 mb-6">
              Hire smarter with{' '}
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-violet-600 bg-clip-text text-transparent">
                AI-driven
              </span>{' '}
              recruitment
            </h1>

            <p className="text-base sm:text-lg text-gray-500 max-w-xl mb-8 sm:mb-10 leading-relaxed font-medium">
              Screen resumes semantically, auto-generate interview questions, evaluate candidate answers with AI, and rank talent objectively — all in one platform.
            </p>

            <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 sm:gap-4 mb-6">
              <Link href="/auth/signup">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto px-9 py-4 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold shadow-lg shadow-purple-500/25 hover:shadow-xl transition-all text-base"
                >
                  Start Free Trial
                </motion.button>
              </Link>
              <Link href="#how-it-works">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto px-9 py-4 rounded-full backdrop-blur-md bg-white/60 border border-gray-200/60 text-gray-700 font-semibold shadow-sm hover:shadow-md transition-all text-base"
                >
                  See How it Works
                </motion.button>
              </Link>
            </div>

            <p className="text-sm text-gray-400 font-medium">No credit card required &middot; 14-day free trial &middot; Cancel anytime</p>
          </motion.div>

          <motion.div
            className="hero-image relative flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <div className="relative group w-full">
              <div className="absolute -inset-4 bg-gradient-to-r from-purple-400/30 via-pink-400/30 to-violet-400/30 rounded-[2rem] blur-2xl opacity-70 group-hover:opacity-90 transition-opacity duration-500" />
              <div className="relative rounded-[1.5rem] overflow-hidden shadow-2xl border border-white/40 bg-white/60 backdrop-blur-md">
                <div className="flex items-center gap-2 px-4 py-2.5 bg-white/80 border-b border-gray-200/60">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  </div>
                  <div className="flex-1 mx-3">
                    <div className="flex items-center justify-center gap-2 px-3 py-1 rounded-lg bg-gray-100/80 border border-gray-200/50 max-w-[200px] mx-auto">
                      <span className="text-[10px] text-gray-400 font-medium">hirekaro.app/dashboard</span>
                    </div>
                  </div>
                </div>
                <div className="relative w-full h-[260px] sm:h-[340px] lg:h-[500px]">
                  <Image src="/images/hero.png" alt="Hire Karo Platform" fill className="object-cover object-top" priority />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ TRUSTED LOGOS ═══ */}
      <section className="relative py-12 px-0 bg-white/30 backdrop-blur-sm border-y border-white/30 z-10 overflow-hidden">
        <div className="mx-auto max-w-7xl px-6">
          <p className="trusted-heading text-center text-xs font-semibold uppercase tracking-[0.2em] mb-8 text-purple-600/70">Trusted by innovative teams at</p>
        </div>
        {/* Infinite Marquee Fix */}
        <div className="flex w-[200%] md:w-[150%]">
          <div className="flex whitespace-nowrap" ref={marqueeRef}>
            {[...trustedLogos, ...trustedLogos, ...trustedLogos, ...trustedLogos].map((name, idx) => (
              <span key={idx} className="text-2xl font-bold text-gray-400 mx-10 uppercase tracking-widest cursor-default transition-colors hover:text-purple-500">
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
              <div className="stat-card h-full backdrop-blur-md bg-white/60 border border-white/30 shadow-xl hover:shadow-2xl rounded-3xl p-8 transition-all hover:-translate-y-2 text-center group">
                <p className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                  <span className="counter-value" data-target={stat.value}>0</span>{stat.suffix}
                </p>
                <p className="text-base font-bold text-gray-900 mb-1">{stat.label}</p>
                <p className="text-xs text-gray-500 font-medium">{stat.desc}</p>
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
            <span className="inline-flex rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-[0.14em] mb-4 bg-pink-100 text-pink-700 border border-pink-200">Uniqueness</span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">Deeper AI automation across the <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">recruitment pipeline</span></h2>
            <p className="mt-4 mx-auto max-w-2xl text-lg text-gray-600">While most ATS platforms focus only on resume storage, Hire Karo introduces features that reduce manual HR effort while improving the quality of candidate selection.</p>
          </FadeIn>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                className="feature-card group relative backdrop-blur-md bg-white/60 border border-white/30 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all overflow-hidden"
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
                <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section id="how-it-works" className="hiw-section py-16 sm:py-24 px-4 sm:px-6 md:px-10 bg-white/30 backdrop-blur-sm border-y border-white/40 z-10 relative">
        <div className="mx-auto max-w-7xl">
          <FadeIn className="hiw-heading text-center mb-16">
            <span className="inline-flex rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-[0.14em] bg-purple-100 text-purple-700 border border-purple-200">System Workflow</span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl text-gray-900">
              The AI <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Hiring Process</span>
            </h2>
          </FadeIn>
          <div className="relative grid gap-8 md:grid-cols-4">
            {howItWorks.map((step, i) => (
              <FadeIn key={step.step} delay={i * 0.12} className="h-full">
              <div className="hiw-step h-full relative text-center z-10 backdrop-blur-md bg-white/60 p-8 rounded-3xl border border-white/50 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg flex items-center justify-center mx-auto mb-5 shadow-md">
                  {step.step}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
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
              <span className="inline-flex rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-[0.14em] mb-4 bg-violet-100 text-violet-700 border border-violet-200">Dashboard</span>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                Your hiring command <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">center</span>
              </h2>
              <p className="mt-4 mx-auto max-w-2xl text-lg text-gray-600">
                Monitor your entire AI recruitment pipeline, track parsed resumes, analyze video behaviors, and make data-driven decisions — all from one beautiful dashboard.
              </p>
            </div>
          </FadeIn>

          <div className="grid gap-12 lg:grid-cols-5 items-center">
            {/* Dashboard Screenshot */}
            <FadeIn className="lg:col-span-3 dash-screenshot">
              <div className="relative group">
                {/* Glow effect behind */}
                <div className="absolute -inset-4 bg-gradient-to-r from-purple-400/20 via-pink-400/20 to-violet-400/20 rounded-[2.5rem] blur-2xl opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

                {/* Browser chrome mockup */}
                <div className="relative rounded-[1.5rem] overflow-hidden shadow-2xl border border-white/40 bg-white/60 backdrop-blur-md">
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
                    <Image
                      src="/images/dashboard-preview.png"
                      alt="Hire Karo Dashboard Preview"
                      width={1200}
                      height={800}
                      className="w-full h-auto"
                      quality={90}
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
                  className="dash-feature flex items-start gap-4 p-5 rounded-2xl backdrop-blur-md bg-white/50 border border-white/30 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
                >
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">{item.title}</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
                </FadeIn>
              ))}

              <Link href="/auth/signup" className="dash-feature">
                <button
                  className="mt-2 w-full px-8 py-4 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium shadow-lg hover:shadow-xl transition-all text-base hover:-translate-y-0.5"
                >
                  Try the Dashboard Free →
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ WHY CHOOSE US ═══ */}
      <section className="why-choose-section py-20 sm:py-32 px-4 sm:px-6 md:px-10 z-10 relative bg-white/40 backdrop-blur-sm border-y border-white/40">
        <div className="max-w-7xl mx-auto">
          <FadeIn className="why-choose-heading text-center mb-16">
            <span className="inline-flex rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-[0.14em] mb-4 bg-purple-100 text-purple-700 border border-purple-200">The Problem vs. Our Solution</span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
              Stop wasting time <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">interviewing poorly matched applicants</span>
            </h2>
            <p className="mt-4 mx-auto max-w-2xl text-lg text-gray-600">
              The proposed system allows HR teams to identify the best candidates quickly and efficiently by completely automating the early stages of the hiring process.
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
              <div className="why-choose-card h-full relative p-8 rounded-2xl bg-white/60 backdrop-blur-md border border-white/40 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">{item.stat}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section className="testimonials-section py-32 px-0 overflow-hidden z-10 relative">
        <FadeIn className="testimonials-heading mx-auto max-w-7xl px-6 mb-16 text-center">
          <span className="inline-flex rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-[0.14em] mb-4 bg-pink-100 text-pink-700 border border-pink-200">Success Stories</span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900">Trusted by the <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Best</span></h2>
        </FadeIn>

        <div className="flex w-[300%] md:w-[200%]">
          <div className="flex gap-6 whitespace-nowrap px-6" ref={testimonialsRef}>
            {[...testimonials, ...testimonials, ...testimonials].map((t, i) => (
              <div key={i} className="inline-block w-[450px] md:w-[500px] p-8 rounded-3xl border border-white/40 bg-white/60 backdrop-blur-md shadow-xl whitespace-normal shrink-0 hover:-translate-y-1 transition-transform">
                <p className="text-gray-800 text-lg mb-8 leading-relaxed font-medium">"{t.quote}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold shadow-md">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{t.name}</div>
                    <div className="text-gray-600 text-sm">{t.role}</div>
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
            <span className="inline-flex rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-[0.14em] bg-purple-100 text-purple-700 border border-purple-200">FAQ</span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl text-gray-900">
              Frequently asked <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">questions</span>
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
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-95" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15)_0%,transparent_50%)]" />
          <div className="relative z-10">
            <span className="inline-flex rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest mb-6 bg-white/20 text-white/90 border border-white/20">Ready to transform hiring?</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-6 leading-tight">Let AI handle the pipeline.<br />You make the final call.</h2>
            <p className="text-base sm:text-lg max-w-2xl mx-auto text-white/80 font-medium mb-8 sm:mb-10">
              Join 500+ companies already using our AI hiring assistant to completely reinvent their recruitment pipeline.
            </p>
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center justify-center gap-3 sm:gap-5">
              <Link href="/auth/signup">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto rounded-full bg-white px-10 py-4 text-base font-bold text-purple-600 shadow-xl transition-all hover:shadow-2xl"
                >
                  Start Free Trial
                </motion.button>
              </Link>
              <Link href="/contact">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto rounded-full px-10 py-4 text-base font-bold text-white border border-white/30 backdrop-blur-md bg-white/10 transition-all shadow-xl hover:bg-white/20"
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