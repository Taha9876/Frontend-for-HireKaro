'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { createContactSubmission } from '@/lib/database';

const contactMethods = [
  {
    title: 'Email Us',
    value: 'hello@hirekaro.com',
    description: 'Get a response within 24 hours',
    badge: '2hr avg response',
    icon: (
      <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
      </svg>
    ),
  },
  {
    title: 'Call Us',
    value: '+1 (555) 123-4567',
    description: 'Mon–Fri, 9am to 6pm EST',
    badge: '< 1 min wait',
    icon: (
      <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
      </svg>
    ),
  },
  {
    title: 'Live Chat',
    value: 'Available Now',
    description: 'Chat with our team instantly',
    badge: 'Instant response',
    icon: (
      <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
      </svg>
    ),
  },
  {
    title: 'Visit Us',
    value: '123 Tech Street, SF',
    description: 'Schedule a meeting at our office',
    badge: '4 global offices',
    icon: (
      <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
      </svg>
    ),
  },
];

const offices = [
  { city: 'San Francisco', address: '123 Tech Street, Suite 100', phone: '+1 (555) 123-4567', email: 'sf@hirekaro.com', abbr: 'SF' },
  { city: 'New York', address: '456 Broadway, Floor 15', phone: '+1 (555) 987-6543', email: 'ny@hirekaro.com', abbr: 'NY' },
  { city: 'London', address: '789 Oxford Street, Level 5', phone: '+44 20 1234 5678', email: 'london@hirekaro.com', abbr: 'LDN' },
  { city: 'Singapore', address: '321 Marina Bay, Tower 2', phone: '+65 6123 4567', email: 'asia@hirekaro.com', abbr: 'SG' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.1 } }),
};

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', company: '', phone: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => setMousePosition({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createContactSubmission(formData);
      setIsSubmitted(true);
      setFormData({ name: '', email: '', company: '', phone: '', subject: '', message: '' });
      setTimeout(() => setIsSubmitted(false), 6000);
    } catch (error) {
      console.error('Failed to submit contact form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-violet-100 -z-10">
        <motion.div className="absolute w-[600px] h-[600px] top-[-10%] right-[-5%] rounded-full bg-gradient-to-br from-purple-400/20 to-pink-400/20 blur-3xl pointer-events-none"
          animate={{ x: mousePosition.x * 0.02, y: mousePosition.y * 0.02, scale: [1, 1.1, 1] }}
          transition={{ type: 'spring', stiffness: 100, damping: 20, scale: { duration: 4, repeat: Infinity } }}
        />
        <motion.div className="absolute w-[500px] h-[500px] bottom-[20%] left-[-10%] rounded-full bg-gradient-to-br from-violet-400/20 to-purple-400/20 blur-3xl pointer-events-none"
          animate={{ x: mousePosition.x * -0.02, y: mousePosition.y * -0.02, scale: [1, 1.15, 1] }}
          transition={{ type: 'spring', stiffness: 100, damping: 20, scale: { duration: 5, repeat: Infinity, delay: 1 } }}
        />
      </div>

      {/* ═══ HERO ═══ */}
      <section className="relative z-10 px-4 sm:px-6 pt-32 pb-12 sm:pt-36 sm:pb-16 md:pt-44">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full backdrop-blur-md bg-white/70 border border-purple-200/50 shadow-sm mb-8">
              <div className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
              <span className="text-purple-700 font-semibold text-sm tracking-wide">Get in Touch</span>
            </div>
          </motion.div>

          <motion.h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.08] tracking-tight text-gray-900 mb-6"
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}>
            Let&apos;s{' '}
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-violet-600 bg-clip-text text-transparent">connect</span>
          </motion.h1>

          <motion.p className="text-base sm:text-lg md:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed font-medium"
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.25 }}>
            Ready to transform your hiring process? Our team is here to help. Reach out through any channel below or send us a message.
          </motion.p>
        </div>
      </section>

      {/* ═══ CONTACT METHODS ═══ */}
      <section className="relative z-10 px-4 sm:px-6 pb-12 sm:pb-16">
        <div className="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {contactMethods.map((m, i) => (
            <motion.div key={m.title} className="backdrop-blur-md bg-white/60 rounded-3xl p-7 border border-white/30 shadow-lg hover:shadow-xl transition-all"
              custom={i} initial="hidden" whileInView="visible" variants={fadeUp} viewport={{ once: true }} whileHover={{ y: -6 }}>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center mb-5 shadow-md">
                {m.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">{m.title}</h3>
              <p className="text-purple-600 font-semibold text-sm mb-2">{m.value}</p>
              <p className="text-gray-500 text-sm leading-relaxed mb-4">{m.description}</p>
              <span className="inline-flex px-3 py-1 rounded-full bg-purple-50 text-purple-700 font-semibold text-xs border border-purple-100">{m.badge}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══ FORM + SIDEBAR ═══ */}
      <section className="relative z-10 px-4 sm:px-6 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-5 gap-8 lg:gap-10 items-start">

          {/* Sidebar info */}
          <motion.div className="lg:col-span-2 space-y-6"
            initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }} viewport={{ once: true }}>
            <div className="backdrop-blur-md bg-white/60 rounded-3xl p-8 border border-white/30 shadow-xl">
              <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Why teams choose us</h2>
              <p className="text-gray-500 text-sm mb-6">We&apos;re not just a vendor — we&apos;re your hiring partner.</p>
              <ul className="space-y-4">
                {[
                  { label: 'Dedicated onboarding', desc: 'White-glove setup with your team' },
                  { label: 'Enterprise SLA', desc: '99.9% uptime guarantee' },
                  { label: 'Data privacy', desc: 'GDPR & SOC2 compliant' },
                  { label: '24/7 support', desc: 'Real humans, real fast' },
                ].map((item) => (
                  <li key={item.label} className="flex items-start gap-3">
                    <div className="mt-1 w-5 h-5 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{item.label}</p>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="backdrop-blur-md bg-white/60 rounded-3xl p-8 border border-white/30 shadow-xl">
              <p className="text-gray-500 text-sm italic mb-4">&ldquo;Hire Karo&apos;s team helped us go live in 2 days. The support is unlike anything I&apos;ve experienced with enterprise software.&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-sm">MR</div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Marcus Rodriguez</p>
                  <p className="text-xs text-gray-500">Head of Talent, ScaleUp</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div className="lg:col-span-3 backdrop-blur-md bg-white/60 rounded-3xl p-6 sm:p-10 border border-white/30 shadow-xl"
            initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.1 }} viewport={{ once: true }}>
            {!isSubmitted ? (
              <>
                <h2 className="text-2xl font-extrabold text-gray-900 mb-1">Send us a message</h2>
                <p className="text-gray-500 text-sm mb-8">We&apos;ll get back to you within 24 hours.</p>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name *</label>
                      <input type="text" name="name" required value={formData.name} onChange={handleChange}
                        className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-sm"
                        placeholder="John Doe" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address *</label>
                      <input type="email" name="email" required value={formData.email} onChange={handleChange}
                        className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-sm"
                        placeholder="john@company.com" />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Company</label>
                      <input type="text" name="company" value={formData.company} onChange={handleChange}
                        className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-sm"
                        placeholder="Acme Inc." />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone</label>
                      <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                        className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-sm"
                        placeholder="+1 (555) 000-0000" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Subject *</label>
                    <select name="subject" required value={formData.subject} onChange={handleChange}
                      className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-sm">
                      <option value="">Select a subject</option>
                      <option value="demo">Request a Demo</option>
                      <option value="pricing">Pricing Inquiry</option>
                      <option value="support">Technical Support</option>
                      <option value="partnership">Partnership</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Message *</label>
                    <textarea name="message" required rows={5} value={formData.message} onChange={handleChange}
                      className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all resize-none text-sm"
                      placeholder="Tell us about your hiring needs..." />
                  </div>
                  <motion.button type="submit" disabled={isSubmitting}
                    whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
                    className="w-full py-4 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold shadow-lg shadow-purple-500/25 hover:shadow-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    {isSubmitting ? (
                      <>
                        <motion.div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                          animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} />
                        Sending...
                      </>
                    ) : 'Send Message'}
                  </motion.button>
                </form>
              </>
            ) : (
              <motion.div className="text-center py-16" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
                <motion.div className="w-20 h-20 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-6 shadow-lg"
                  initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, delay: 0.2 }}>
                  <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                </motion.div>
                <h3 className="text-2xl font-extrabold text-gray-900 mb-3">Message Sent!</h3>
                <p className="text-gray-500">Thanks for reaching out. We&apos;ll get back to you within 24 hours.</p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* ═══ OFFICES ═══ */}
      <section className="relative z-10 px-4 sm:px-6 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto">
          <motion.div className="text-center mb-10 sm:mb-14" initial="hidden" whileInView="visible" variants={fadeUp} viewport={{ once: true }}>
            <span className="inline-flex rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-[0.14em] mb-4 bg-purple-100 text-purple-700 border border-purple-200">Global Presence</span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900">Our <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Offices</span></h2>
            <p className="mt-4 text-lg text-gray-500 max-w-xl mx-auto">Visit us at any of our global locations.</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {offices.map((office, i) => (
              <motion.div key={office.city} className="backdrop-blur-md bg-white/60 rounded-3xl p-7 border border-white/30 shadow-lg hover:shadow-xl transition-all text-center"
                custom={i} initial="hidden" whileInView="visible" variants={fadeUp} viewport={{ once: true }} whileHover={{ y: -6 }}>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center mx-auto mb-5 shadow-md">
                  <span className="text-white text-lg font-bold">{office.abbr}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{office.city}</h3>
                <p className="text-gray-500 text-sm mb-3 leading-relaxed">{office.address}</p>
                <p className="text-purple-600 text-sm font-semibold mb-1">{office.phone}</p>
                <p className="text-purple-600 text-sm">{office.email}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="relative z-10 px-4 sm:px-6 py-12 sm:py-16 pb-24 sm:pb-28">
        <div className="max-w-5xl mx-auto">
          <motion.div className="relative overflow-hidden rounded-[2rem] sm:rounded-[3rem] p-8 sm:p-14 md:p-20 text-center shadow-2xl"
            initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} viewport={{ once: true }}>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-95" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15)_0%,transparent_50%)]" />
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-5 leading-tight">Ready to get started?</h2>
              <p className="text-base sm:text-lg text-white/80 max-w-2xl mx-auto mb-8 sm:mb-10 font-medium">Join 500+ companies already using Hire Karo to build exceptional teams with AI.</p>
              <div className="flex flex-col sm:flex-row sm:flex-wrap justify-center gap-3 sm:gap-4">
                <Link href="/auth/signup">
                  <motion.button whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}
                    className="w-full sm:w-auto rounded-full bg-white px-10 py-4 text-base font-bold text-purple-600 shadow-xl transition-all hover:shadow-2xl">
                    Start Free Trial
                  </motion.button>
                </Link>
                <Link href="/pricing">
                  <motion.button whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}
                    className="w-full sm:w-auto rounded-full px-10 py-4 text-base font-bold text-white border border-white/30 bg-white/10 backdrop-blur-md transition-all shadow-xl hover:bg-white/20">
                    View Pricing
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
