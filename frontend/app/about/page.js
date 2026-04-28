'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

const teamMembers = [
  { name: 'Sarah Chen', role: 'CEO & Co-Founder', image: 'SC', bio: 'Former VP of Talent at TechFlow with 15+ years in HR tech. Passionate about eliminating bias in hiring.' },
  { name: 'Marcus Rodriguez', role: 'CTO & Co-Founder', image: 'MR', bio: 'AI/ML expert from Google. Built scalable systems processing millions of documents daily.' },
  { name: 'Emily Watson', role: 'Head of Product', image: 'EW', bio: 'Product leader from Microsoft. Focused on user experience and enterprise solutions.' },
  { name: 'David Kim', role: 'Head of Engineering', image: 'DK', bio: 'Full-stack architect from Amazon. Expert in distributed systems and security.' },
  { name: 'Aisha Patel', role: 'Head of AI Research', image: 'AP', bio: 'PhD in Machine Learning from Stanford. Published 20+ papers on NLP and computer vision.' },
  { name: 'James Lee', role: 'VP of Sales', image: 'JL', bio: 'Former Director at Salesforce. Scaled multiple SaaS products from 0 to $50M ARR.' },
];

const milestones = [
  { year: '2022', title: 'Founded', description: 'Hire Karo founded with the mission to revolutionize hiring through AI' },
  { year: '2023', title: 'Seed Round', description: 'Raised $5M to build AI-powered screening and interview platform' },
  { year: '2024', title: 'Product Launch', description: 'Launched with 100+ beta customers achieving 98% satisfaction' },
  { year: '2025', title: 'Series A', description: 'Raised $25M, expanded to 500+ customers across 30+ countries' },
];

const values = [
  {
    title: 'Innovation First',
    description: 'We push boundaries with cutting-edge AI to solve real hiring challenges that matter.',
    icon: (
      <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
      </svg>
    ),
  },
  {
    title: 'Bias-Free Hiring',
    description: 'Our AI is designed to eliminate unconscious bias and promote workforce diversity.',
    icon: (
      <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0 0 12 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 0 1-2.031.352 5.988 5.988 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971Zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 0 1-2.031.352 5.989 5.989 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971Z" />
      </svg>
    ),
  },
  {
    title: 'Customer Success',
    description: 'We succeed when our customers succeed. Your hiring goals are our priority.',
    icon: (
      <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
      </svg>
    ),
  },
  {
    title: 'Transparency',
    description: 'Open communication about how our AI works and why candidates are matched.',
    icon: (
      <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      </svg>
    ),
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.1 } }),
};

export default function AboutPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => setMousePosition({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <div className="fixed inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-violet-100 -z-10">
        <motion.div className="absolute w-[600px] h-[600px] top-[-10%] right-[-5%] rounded-full bg-gradient-to-br from-purple-400/20 to-pink-400/20 blur-3xl pointer-events-none"
          animate={{ x: mousePosition.x * 0.02, y: mousePosition.y * 0.02, scale: [1, 1.1, 1] }}
          transition={{ type: "spring", stiffness: 100, damping: 20, scale: { duration: 4, repeat: Infinity } }}
        />
        <motion.div className="absolute w-[500px] h-[500px] bottom-[20%] left-[-10%] rounded-full bg-gradient-to-br from-violet-400/20 to-purple-400/20 blur-3xl pointer-events-none"
          animate={{ x: mousePosition.x * -0.02, y: mousePosition.y * -0.02, scale: [1, 1.15, 1] }}
          transition={{ type: "spring", stiffness: 100, damping: 20, scale: { duration: 5, repeat: Infinity, delay: 1 } }}
        />
      </div>

      <section className="relative z-10 px-6 pt-36 pb-24 md:pt-44">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full backdrop-blur-md bg-white/70 border border-purple-200/50 shadow-sm mb-8">
              <div className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
              <span className="text-purple-700 font-semibold text-sm tracking-wide">About Hire Karo</span>
            </div>
          </motion.div>

          <motion.h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.08] tracking-tight text-gray-900 mb-7"
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}>
            Building the future of{' '}
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-violet-600 bg-clip-text text-transparent">intelligent hiring</span>
          </motion.h1>

          <motion.p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed font-medium"
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.25 }}>
            A team of passionate technologists and HR experts dedicated to making hiring more efficient, fair, and data-driven for companies worldwide.
          </motion.p>
        </div>
      </section>

      <section className="relative z-10 px-6 pb-20">
        <div className="max-w-5xl mx-auto">
          <motion.div className="backdrop-blur-md bg-white/60 rounded-3xl p-10 border border-white/30 shadow-xl"
            initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} viewport={{ once: true }}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { number: '500+', label: 'Companies Trust Us' },
                { number: '50K+', label: 'Candidates Screened' },
                { number: '98%', label: 'Customer Satisfaction' },
                { number: '80%', label: 'Time Saved on Avg' },
              ].map((stat, i) => (
                <motion.div key={stat.label} className="text-center" custom={i} initial="hidden" whileInView="visible" variants={fadeUp} viewport={{ once: true }}>
                  <div className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-1">{stat.number}</div>
                  <div className="text-sm text-gray-500 font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8">
          <motion.div className="backdrop-blur-md bg-white/60 rounded-3xl p-10 border border-white/30 shadow-xl"
            initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }} viewport={{ once: true }}>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center mb-6 shadow-md">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
              </svg>
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              To revolutionize hiring by leveraging advanced AI that screens, matches, and evaluates candidates with unprecedented accuracy and fairness.
            </p>
            <p className="text-gray-600 leading-relaxed">
              We believe great hires build great companies. Our platform empowers HR teams to make data-driven decisions while saving hours and eliminating human bias.
            </p>
          </motion.div>

          <motion.div className="backdrop-blur-md bg-white/60 rounded-3xl p-10 border border-white/30 shadow-xl"
            initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.15 }} viewport={{ once: true }}>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-pink-600 to-violet-600 flex items-center justify-center mb-6 shadow-md">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Our Vision</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              A world where every hiring decision is backed by intelligent insights, where talent is recognized regardless of background, and where companies build diverse, high-performing teams effortlessly.
            </p>
            <p className="text-gray-600 leading-relaxed">
              We&apos;re building the future of recruitment &mdash; where AI and human expertise work together to create perfect matches between talent and opportunity.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <motion.div className="text-center mb-16" initial="hidden" whileInView="visible" variants={fadeUp} viewport={{ once: true }}>
            <span className="inline-flex rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-[0.14em] mb-4 bg-purple-100 text-purple-700 border border-purple-200">What We Stand For</span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900">Our Core <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Values</span></h2>
            <p className="mt-4 text-lg text-gray-500 max-w-xl mx-auto">The principles that guide every product decision and customer interaction.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <motion.div key={v.title} className="backdrop-blur-md bg-white/60 rounded-3xl p-7 border border-white/30 shadow-lg hover:shadow-xl transition-all"
                custom={i} initial="hidden" whileInView="visible" variants={fadeUp} viewport={{ once: true }} whileHover={{ y: -6 }}>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center mb-5 shadow-md">{v.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{v.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{v.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <motion.div className="text-center mb-16" initial="hidden" whileInView="visible" variants={fadeUp} viewport={{ once: true }}>
            <span className="inline-flex rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-[0.14em] mb-4 bg-pink-100 text-pink-700 border border-pink-200">Our Journey</span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900">Key <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Milestones</span></h2>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-6">
            {milestones.map((m, i) => (
              <motion.div key={m.year} className="backdrop-blur-md bg-white/60 rounded-3xl p-7 border border-white/30 shadow-lg text-center"
                custom={i} initial="hidden" whileInView="visible" variants={fadeUp} viewport={{ once: true }} whileHover={{ y: -6 }}>
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-sm flex items-center justify-center mx-auto mb-4 shadow-md">{m.year}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{m.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{m.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <motion.div className="text-center mb-16" initial="hidden" whileInView="visible" variants={fadeUp} viewport={{ once: true }}>
            <span className="inline-flex rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-[0.14em] mb-4 bg-violet-100 text-violet-700 border border-violet-200">Leadership</span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900">Meet the <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Team</span></h2>
            <p className="mt-4 text-lg text-gray-500 max-w-xl mx-auto">The brilliant minds driving Hire Karo&apos;s mission to transform recruitment.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamMembers.map((member, i) => (
              <motion.div key={member.name} className="backdrop-blur-md bg-white/60 rounded-3xl p-7 border border-white/30 shadow-lg hover:shadow-xl transition-all text-center"
                custom={i} initial="hidden" whileInView="visible" variants={fadeUp} viewport={{ once: true }} whileHover={{ y: -6 }}>
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center mx-auto mb-5 shadow-md">
                  <span className="text-white text-2xl font-bold">{member.image}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900">{member.name}</h3>
                <p className="text-purple-600 font-semibold text-sm mb-3">{member.role}</p>
                <p className="text-sm text-gray-600 leading-relaxed">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 px-6 py-20 pb-28">
        <div className="max-w-5xl mx-auto">
          <motion.div className="relative overflow-hidden rounded-[3rem] p-14 md:p-20 text-center shadow-2xl"
            initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} viewport={{ once: true }}>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-95" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15)_0%,transparent_50%)]" />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-5 leading-tight">Ready to join us?</h2>
              <p className="text-lg text-white/80 max-w-2xl mx-auto mb-10 font-medium">Start building exceptional teams with AI-powered recruitment. Free for 14 days.</p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/auth/signup">
                  <motion.button whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }} className="rounded-full bg-white px-10 py-4 text-base font-bold text-purple-600 shadow-xl transition-all hover:shadow-2xl">
                    Start Free Trial
                  </motion.button>
                </Link>
                <Link href="/contact">
                  <motion.button whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }} className="rounded-full px-10 py-4 text-base font-bold text-white border border-white/30 bg-white/10 backdrop-blur-md transition-all shadow-xl hover:bg-white/20">
                    Contact Sales
                  </motion.button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
