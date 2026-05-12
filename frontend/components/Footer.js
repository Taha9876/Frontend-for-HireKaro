'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';

const quickLinks = [
  { label: 'Platform', href: '/' },
  { label: 'Features', href: '/#features' },
  { label: 'About Us', href: '/about' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Contact', href: '/contact' },
];

const appLinks = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Interviews', href: '/interview' },
  { label: 'Sign In', href: '/auth/login' },
  { label: 'Sign Up', href: '/auth/signup' },
];

export default function Footer() {
  return (
    <footer className="relative bg-white border-t border-[#e8e5df] overflow-hidden pt-20 z-10">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-6 pb-16 sm:grid-cols-2 lg:grid-cols-4 md:px-10">
        {/* Brand */}
        <div className="md:col-span-1">
          <div translate="no" className="notranslate mb-6 inline-flex items-center gap-3">
            <motion.div 
              className="notranslate flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold text-white shadow-md"
              style={{ background: 'linear-gradient(135deg, #F4A28C, #E9C26A 50%, #7FA582)' }}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              HK
            </motion.div>
            <p className="notranslate text-xl font-bold tracking-tight text-[#1C1B2E]">Hire Karo</p>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-[#64608a]">
            Professional AI hiring platform to screen resumes, run interviews, and shortlist the best candidates faster. The future of talent acquisition.
          </p>
          <div className="mt-8 flex gap-4">
            {['X', 'In', 'Fb'].map((social) => (
              <motion.span 
                key={social} 
                whileHover={{ scale: 1.1 }}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#e8e5df] bg-[#FDFCF9] text-xs font-semibold text-[#64608a] cursor-pointer transition-colors hover:text-[#1C1B2E] hover:border-[#1C1B2E]/20 hover:bg-[#f3f1ec]"
              >
                {social}
              </motion.span>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <p className="mb-6 text-xs font-bold uppercase tracking-widest text-[#1C1B2E]">Company</p>
          <ul className="space-y-4 list-none p-0 m-0">
            {quickLinks.map((item) => (
              <li key={item.href}>
                <Link className="text-sm font-medium text-[#64608a] no-underline transition-colors hover:text-[#1C1B2E]" href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Application Links */}
        <div>
          <p className="mb-6 text-xs font-bold uppercase tracking-widest text-[#1C1B2E]">Application</p>
          <ul className="space-y-4 list-none p-0 m-0">
            {appLinks.map((item) => (
              <li key={item.label}>
                <Link className="text-sm font-medium text-[#64608a] no-underline transition-colors hover:text-[#1C1B2E]" href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <div>
          <p className="mb-6 text-xs font-bold uppercase tracking-widest text-[#1C1B2E]">Get Started</p>
          <p className="mb-6 text-sm leading-relaxed text-[#64608a]">Build a smarter hiring workflow with modern, AI-first recruitment tooling.</p>
          <Link href="/auth/signup">
            <motion.button 
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center rounded-full px-6 py-3 text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all"
              style={{ background: '#1C1B2E' }}
            >
              Start Free Trial
            </motion.button>
          </Link>
        </div>
      </div>

      <div className="border-t border-[#e8e5df] bg-[#FDFCF9]">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-4 px-6 py-6 text-xs md:flex-row md:px-10 text-[#94a3b8]">
          <p>© {new Date().getFullYear()} Hire Karo. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="text-xs transition hover:text-[#1C1B2E] cursor-pointer font-medium">Privacy Policy</span>
            <span className="text-xs transition hover:text-[#1C1B2E] cursor-pointer font-medium">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
