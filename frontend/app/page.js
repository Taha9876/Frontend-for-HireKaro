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
  { value: 10, suffix: 'x', label: 'Faster Screening' },
  { value: 98, suffix: '%', label: 'Match Precision' },
  { value: 500, suffix: '+', label: 'Hiring Teams' },
  { value: 24, suffix: '/7', label: 'AI Availability' },
];

const features = [
  {
    title: 'AI Resume Screening',
    desc: 'Instantly parse and score every resume against role-specific criteria with transparent AI signals.',
    gradientCSS: 'linear-gradient(to bottom right, #a855f7, #ec4899)',
    iconPath: 'M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z',
  },
  {
    title: 'Smart Candidate Matching',
    desc: 'AI-powered matching engine that evaluates skills, experience, and culture fit simultaneously.',
    gradientCSS: 'linear-gradient(to bottom right, #8b5cf6, #a855f7)',
    iconPath: 'M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z',
  },
  {
    title: 'Structured Interviews',
    desc: 'Generate role-specific interview plans, evaluation rubrics, and standardized scorecards automatically.',
    gradientCSS: 'linear-gradient(to bottom right, #ec4899, #f43f5e)',
    iconPath: 'M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155',
  },
  {
    title: 'Pipeline Analytics',
    desc: 'Real-time dashboards with hiring funnel metrics, bottleneck detection, and executive-ready reports.',
    gradientCSS: 'linear-gradient(to bottom right, #9333ea, #8b5cf6)',
    iconPath: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z',
  },
  {
    title: 'Bias-Free Evaluation',
    desc: 'Structured scoring removes unconscious bias and ensures every candidate is evaluated fairly.',
    gradientCSS: 'linear-gradient(to bottom right, #db2777, #9333ea)',
    iconPath: 'M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z',
  },
  {
    title: 'One-Click Integration',
    desc: 'Seamlessly connects with your existing ATS, calendar, and communication tools in minutes.',
    gradientCSS: 'linear-gradient(to bottom right, #7c3aed, #ec4899)',
    iconPath: 'M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z',
  },
];

const howItWorks = [
  { step: '01', title: 'Upload Resumes', desc: 'Drag and drop candidate resumes or connect your ATS. Our AI processes them instantly.', icon: '📄' },
  { step: '02', title: 'AI Screens & Scores', desc: 'Advanced NLP evaluates every resume against your role criteria with transparent scoring.', icon: '🧠' },
  { step: '03', title: 'Hire Top Talent', desc: 'Review ranked candidates, run structured interviews, and make confident hiring decisions.', icon: '🏆' },
];

const testimonials = [
  { quote: 'Brain-A-Hire cut our screening time by 80%. We went from spending days on resumes to shortlisting in hours.', name: 'Sarah Chen', role: 'VP of People, TechFlow', avatar: 'SC' },
  { quote: 'The structured interview feature transformed how we evaluate candidates. Much more consistent and fair.', name: 'Marcus Rodriguez', role: 'Head of Talent, ScaleUp', avatar: 'MR' },
  { quote: 'Finally a hiring tool that actually feels modern. The AI matching is incredibly accurate.', name: 'Emily Watson', role: 'Recruiting Lead, NovaTech', avatar: 'EW' },
  { quote: 'It literally feels like magic. A $90,000 value for a fraction of the cost. Completely changed our workflow.', name: 'David Kim', role: 'Founder, NextGen', avatar: 'DK' }
];

const faqs = [
  { q: 'How does the AI resume screening work?', a: 'Our AI uses advanced natural language processing to parse resumes, extract key skills and experiences, and score each candidate against your specific role requirements — all in seconds.' },
  { q: 'Is my data secure?', a: 'Absolutely. We use enterprise-grade encryption (AES-256), SOC 2 Type II compliant infrastructure, and never share or sell candidate data. Your data stays yours.' },
  { q: 'Can I integrate with my existing ATS?', a: 'Yes! Brain-A-Hire integrates with all major ATS platforms including Greenhouse, Lever, Workday, and more. Setup takes just a few minutes.' },
  { q: 'What makes Brain-A-Hire different?', a: 'We combine transparent AI scoring with structured interview workflows — something no other tool does. You get full visibility into why each candidate was ranked the way they were.' },
  { q: 'Is there a free trial?', a: 'Yes! Start with our free trial — no credit card required. Screen up to 50 resumes and experience the full platform before committing.' },
];

const trustedLogos = ['Google', 'Microsoft', 'Stripe', 'Shopify', 'Slack', 'Notion', 'Linear', 'Figma'];

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
    <div className="faq-item rounded-2xl overflow-hidden backdrop-blur-md bg-white/40 border border-white/20 shadow-lg transition-all hover:shadow-xl">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 text-left bg-transparent border-none cursor-pointer outline-none"
        id={`faq-toggle-${index}`}
      >
        <span className="text-base font-semibold pr-4 text-gray-900">{faq.q}</span>
        <span className={`text-2xl transition-transform duration-300 flex-shrink-0 text-purple-600 ${open ? 'rotate-45' : ''}`}>+</span>
      </button>
      <div ref={answerRef} style={{ maxHeight: 0, overflow: 'hidden' }}>
        <p className="px-6 pb-5 text-sm leading-relaxed text-gray-600">{faq.a}</p>
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

      /* ── Stats cards ── */
      gsap.fromTo('.stat-card',
        { opacity: 0, y: 35 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out',
          scrollTrigger: { trigger: '#stats-section', start: 'top 95%', toggleActions: 'play none none reset' },
        }
      );

      /* ── Features heading + cards ── */
      gsap.fromTo('.features-heading',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out',
          scrollTrigger: { trigger: '.features-heading', start: 'top 95%', toggleActions: 'play none none reset' },
        }
      );
      gsap.fromTo('.feature-card',
        { opacity: 0, y: 35, scale: 0.97 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.08, ease: 'power3.out',
          scrollTrigger: { trigger: '.features-section', start: 'top 85%', toggleActions: 'play none none reset' },
        }
      );

      /* ── How it works ── */
      gsap.fromTo('.hiw-heading',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out',
          scrollTrigger: { trigger: '.hiw-heading', start: 'top 95%', toggleActions: 'play none none reset' },
        }
      );
      gsap.fromTo('.hiw-step',
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.7, stagger: 0.2, ease: 'power3.out',
          scrollTrigger: { trigger: '.hiw-section', start: 'top 90%', toggleActions: 'play none none reset' },
        }
      );

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

      /* ── Trusted logos heading ── */
      gsap.fromTo('.trusted-heading',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out',
          scrollTrigger: { trigger: '.trusted-heading', start: 'top 95%', toggleActions: 'play none none reset' },
        }
      );

      /* ── Dashboard Preview ── */
      gsap.fromTo('.dash-heading',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out',
          scrollTrigger: { trigger: '.dash-heading', start: 'top 90%', toggleActions: 'play none none reset' },
        }
      );
      gsap.fromTo('.dash-screenshot',
        { opacity: 0, y: 40, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: '.dashboard-preview-section', start: 'top 80%', toggleActions: 'play none none reset' },
        }
      );
      gsap.fromTo('.dash-feature',
        { opacity: 0, x: 30 },
        { opacity: 1, x: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out',
          scrollTrigger: { trigger: '.dashboard-preview-section', start: 'top 75%', toggleActions: 'play none none reset' },
        }
      );

      /* ── Why Choose Us ── */
      gsap.fromTo('.why-choose-heading',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out',
          scrollTrigger: { trigger: '.why-choose-heading', start: 'top 95%', toggleActions: 'play none none reset' },
        }
      );
      gsap.fromTo('.why-choose-card',
        { opacity: 0, y: 35, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.1, ease: 'power3.out',
          scrollTrigger: { trigger: '.why-choose-section', start: 'top 85%', toggleActions: 'play none none reset' },
        }
      );

      /* ── Testimonials heading ── */
      gsap.fromTo('.testimonials-heading',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out',
          scrollTrigger: { trigger: '.testimonials-heading', start: 'top 95%', toggleActions: 'play none none reset' },
        }
      );

      /* ── FAQ heading + items ── */
      gsap.fromTo('.faq-heading',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out',
          scrollTrigger: { trigger: '.faq-heading', start: 'top 95%', toggleActions: 'play none none reset' },
        }
      );
      gsap.fromTo('.faq-item',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power3.out',
          scrollTrigger: { trigger: '.faq-section', start: 'top 90%', toggleActions: 'play none none reset' },
        }
      );

      /* ── Final CTA ── */
      gsap.fromTo('.final-cta',
        { opacity: 0, y: 40, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: '.final-cta', start: 'top 90%', toggleActions: 'play none none reset' },
        }
      );

    }, rootRef);

    return () => ctx.revert();
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
      <section className="relative px-6 pb-20 pt-32 md:pt-40 md:px-10 z-10" id="hero-section">
        <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-16 lg:grid-cols-2">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full backdrop-blur-md bg-white/60 border border-white/20 shadow-md mb-6"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <div className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
                <span className="text-purple-700 font-semibold text-sm">AI-Powered Hiring Platform</span>
              </motion.div>

              <h1 className="text-5xl md:text-6xl lg:text-[4rem] font-bold leading-[1.1] tracking-tight text-gray-900 mb-6">
                Hire top talent with<br />
                <span className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  intelligent AI
                </span>
              </h1>

              <p className="text-xl text-gray-600 max-w-xl mb-10 leading-relaxed">
                Brain-A-Hire helps your team screen resumes, shortlist candidates, and run structured interviews — all powered by advanced AI that eliminates bias and saves hours.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <Link href="/auth/signup">
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium shadow-lg hover:shadow-xl transition-all text-lg"
                  >
                    Start Free Trial
                  </motion.button>
                </Link>
                <Link href="#how-it-works">
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 rounded-full backdrop-blur-md bg-white/40 border border-white/40 text-gray-800 font-medium shadow-sm hover:shadow-md transition-all text-lg"
                  >
                    See How it Works
                  </motion.button>
                </Link>
              </div>

              <div className="mt-10 flex items-center gap-4">
                <div className="flex -space-x-3">
                  {['#9333ea', '#db2777', '#7c3aed', '#e879f9'].map((bg, i) => (
                    <div key={i} className="h-10 w-10 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-sm" style={{ background: bg }}>
                      {['JD', 'AK', 'RM', 'LS'][i]}
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">500+ hiring teams</p>
                  <p className="text-xs text-gray-500">trust Brain-A-Hire</p>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            className="hero-image relative flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <div className="relative w-full h-[400px] lg:h-[550px] rounded-xl overflow-hidden shadow-2xl border border-white/40 bg-white/20 backdrop-blur-md">
              <Image src="/images/hero.png" alt="Hero Interface" fill className="object-cover" priority />
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
      <section id="stats-section" className="py-20 px-6 md:px-10 z-10 relative">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
            {counters.map((stat) => (
              <div key={stat.label} className="stat-card backdrop-blur-md bg-white/40 border border-white/20 shadow-xl hover:shadow-2xl rounded-3xl p-8 transition-all hover:-translate-y-2 text-center group">
                <p className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
                  <span className="counter-value" data-target={stat.value}>0</span>{stat.suffix}
                </p>
                <p className="text-sm font-semibold uppercase tracking-wider text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section id="features" className="features-section py-32 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="features-heading text-center mb-16">
            <span className="inline-flex rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-[0.14em] mb-4 bg-pink-100 text-pink-700 border border-pink-200">Features</span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">Everything you need to <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">hire smarter</span></h2>
            <p className="mt-4 mx-auto max-w-2xl text-lg text-gray-600">From AI resume screening to structured interviews, Brain-A-Hire gives you the complete toolkit for modern, professional hiring.</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                className="feature-card group relative backdrop-blur-md bg-white/50 border border-white/30 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all overflow-hidden"
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 pointer-events-none" style={{ background: f.gradientCSS }}></div>
                <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl shadow-md" style={{ background: f.gradientCSS }}>
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={f.iconPath} />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="hiw-section py-24 px-6 md:px-10 bg-white/30 backdrop-blur-sm border-y border-white/40 z-10 relative">
        <div className="mx-auto max-w-7xl">
          <div className="hiw-heading text-center mb-16">
            <span className="inline-flex rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-[0.14em] bg-purple-100 text-purple-700 border border-purple-200">How It Works</span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl text-gray-900">
              Three steps to <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">better hiring</span>
            </h2>
          </div>
          <div className="relative grid gap-8 md:grid-cols-3">
            {howItWorks.map((step) => (
              <div key={step.step} className="hiw-step relative text-center z-10 backdrop-blur-md bg-white/60 p-8 rounded-3xl border border-white/50 shadow-lg hover:shadow-xl transition-shadow">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl text-2xl shadow-md border border-purple-100 bg-gradient-to-br from-purple-50 to-pink-50 text-purple-600">
                  {step.icon}
                </div>
                <div className="inline-flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold tracking-widest text-pink-600">STEP</span>
                  <span className="text-xs font-bold text-pink-600">{step.step}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900">{step.title}</h3>
                <p className="mt-3 text-sm text-gray-600 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ DASHBOARD PREVIEW ═══ */}
      <section className="dashboard-preview-section py-32 px-6 md:px-10 z-10 relative" id="dashboard-preview">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 dash-heading">
            <div>
              <span className="inline-flex rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-[0.14em] mb-4 bg-violet-100 text-violet-700 border border-violet-200">Dashboard</span>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                Your hiring command <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">center</span>
              </h2>
              <p className="mt-4 mx-auto max-w-2xl text-lg text-gray-600">
                Monitor your entire hiring pipeline, track key metrics, and make data-driven decisions — all from one beautiful, intuitive dashboard.
              </p>
            </div>
          </div>

          <div className="grid gap-12 lg:grid-cols-5 items-center">
            {/* Dashboard Screenshot */}
            <div className="lg:col-span-3 dash-screenshot">
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
                        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span className="text-xs text-gray-400 font-medium">brain-a-hire.app/dashboard</span>
                      </div>
                    </div>
                  </div>
                  {/* Screenshot */}
                  <div className="relative">
                    <Image
                      src="/images/dashboard-preview.png"
                      alt="Brain-A-Hire Dashboard Preview"
                      width={1200}
                      height={800}
                      className="w-full h-auto"
                      quality={90}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Feature highlights */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {[
                {
                  icon: '📊',
                  title: 'Real-Time Analytics',
                  desc: 'Track applications, shortlists, and interview schedules with live-updating KPI cards and trend charts.'
                },
                {
                  icon: '🎯',
                  title: 'Pipeline Visualization',
                  desc: 'See your entire hiring funnel at a glance — from application to offer — with visual progress tracking.'
                },
                {
                  icon: '⚡',
                  title: 'Quick Actions',
                  desc: 'Post new jobs, review candidates, and schedule interviews directly from the dashboard in just one click.'
                },
                {
                  icon: '📈',
                  title: 'Performance Insights',
                  desc: 'Weekly engagement trends and conversion metrics help you optimize your recruiting strategy.'
                }
              ].map((item, i) => (
                <div
                  key={item.title}
                  className="dash-feature flex items-start gap-4 p-5 rounded-2xl backdrop-blur-md bg-white/50 border border-white/30 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 flex items-center justify-center text-xl shadow-sm">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">{item.title}</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
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
      <section className="why-choose-section py-32 px-6 md:px-10 z-10 relative bg-white/40 backdrop-blur-sm border-y border-white/40">
        <div className="max-w-7xl mx-auto">
          <div className="why-choose-heading text-center mb-16">
            <span className="inline-flex rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-[0.14em] mb-4 bg-purple-100 text-purple-700 border border-purple-200">Why Brain-A-Hire</span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
              Built for <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">modern hiring teams</span>
            </h2>
            <p className="mt-4 mx-auto max-w-2xl text-lg text-gray-600">
              Enterprise-grade AI hiring platform that combines cutting-edge technology with intuitive design.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: '98% Match Accuracy',
                desc: 'Our AI achieves industry-leading accuracy in matching candidates to job requirements.',
                icon: '🎯',
                stat: '98%'
              },
              {
                title: '10x Faster Screening',
                desc: 'Reduce resume screening time from hours to minutes with intelligent automation.',
                icon: '⚡',
                stat: '10x'
              },
              {
                title: 'Bias-Free Evaluation',
                desc: 'Structured scoring eliminates unconscious bias and ensures fair candidate assessment.',
                icon: '⚖️',
                stat: '100%'
              },
              {
                title: 'Enterprise Security',
                desc: 'SOC 2 Type II compliant with AES-256 encryption to protect your sensitive data.',
                icon: '🔒',
                stat: 'SOC 2'
              }
            ].map((item, i) => (
              <div key={item.title} className="why-choose-card relative p-8 rounded-2xl bg-white/60 backdrop-blur-md border border-white/40 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="text-4xl mb-4">{item.icon}</div>
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">{item.stat}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section className="testimonials-section py-32 px-0 overflow-hidden z-10 relative">
        <div className="testimonials-heading mx-auto max-w-7xl px-6 mb-16 text-center">
          <span className="inline-flex rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-[0.14em] mb-4 bg-pink-100 text-pink-700 border border-pink-200">Success Stories</span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900">Trusted by the <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Best</span></h2>
        </div>

        <div className="flex w-[300%] md:w-[200%]">
          <div className="flex gap-6 whitespace-nowrap px-6" ref={testimonialsRef}>
            {[...testimonials, ...testimonials, ...testimonials].map((t, i) => (
              <div key={i} className="inline-block w-[450px] md:w-[500px] p-8 rounded-3xl border border-white/40 bg-white/60 backdrop-blur-md shadow-xl whitespace-normal shrink-0 hover:-translate-y-1 transition-transform">
                <div className="flex gap-1 mb-6">
                  {[1, 2, 3, 4, 5].map(star => <svg key={star} className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}
                </div>
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
      <section className="faq-section py-20 px-6 md:px-10 z-10 relative">
        <div className="mx-auto max-w-3xl">
          <div className="faq-heading text-center mb-14">
            <span className="inline-flex rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-[0.14em] bg-purple-100 text-purple-700 border border-purple-200">FAQ</span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl text-gray-900">
              Frequently asked <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">questions</span>
            </h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <FAQItem key={i} faq={faq} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="pb-24 px-6 md:px-10 z-10 relative">
        <div className="final-cta mx-auto w-full max-w-5xl relative overflow-hidden rounded-[3rem] p-12 md:p-20 text-center shadow-2xl backdrop-blur-xl bg-gradient-to-r from-purple-600/90 to-pink-600/90 border border-white/30">
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6">Ready to Transform Your Hiring?</h2>
            <p className="text-xl max-w-2xl mx-auto text-white/90 font-medium">
              Join 500+ companies already using Brain-A-Hire to build exceptional teams.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-5">
              <Link href="/auth/signup">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="rounded-full bg-white px-10 py-4 text-base font-bold text-purple-600 shadow-xl transition-all"
                >
                  Start Free Trial
                </motion.button>
              </Link>
              <Link href="/contact">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="rounded-full px-10 py-4 text-base font-bold text-white border border-white/40 backdrop-blur-md bg-white/20 transition-all shadow-xl"
                >
                  Contact Sales
                </motion.button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}