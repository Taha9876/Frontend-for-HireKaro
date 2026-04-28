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
    <footer className="relative bg-white border-t border-gray-200 overflow-hidden pt-20 z-10">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-6 pb-16 sm:grid-cols-2 lg:grid-cols-4 md:px-10">
        {/* Brand */}
        <div className="md:col-span-1">
          <div className="mb-6 inline-flex items-center gap-3">
            <motion.div 
              className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold text-white shadow-md bg-gradient-to-r from-purple-600 to-pink-600"
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.5 }}
            >
              BH
            </motion.div>
            <p className="text-xl font-bold tracking-tight text-gray-900">Hire Karo</p>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-gray-500">
            Professional AI hiring platform to screen resumes, run interviews, and shortlist the best candidates faster. The future of talent acquisition.
          </p>
          <div className="mt-8 flex gap-4">
            {['X', 'In', 'Fb'].map((social) => (
              <motion.span 
                key={social} 
                whileHover={{ scale: 1.1 }}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-xs font-semibold text-gray-600 cursor-pointer transition-colors hover:text-purple-600 hover:border-purple-200 hover:bg-purple-50"
              >
                {social}
              </motion.span>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <p className="mb-6 text-xs font-bold uppercase tracking-widest text-gray-900">Company</p>
          <ul className="space-y-4 list-none p-0 m-0">
            {quickLinks.map((item) => (
              <li key={item.href}>
                <Link className="text-sm font-medium text-gray-500 no-underline transition-colors hover:text-purple-600" href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Application Links */}
        <div>
          <p className="mb-6 text-xs font-bold uppercase tracking-widest text-gray-900">Application</p>
          <ul className="space-y-4 list-none p-0 m-0">
            {appLinks.map((item) => (
              <li key={item.label}>
                <Link className="text-sm font-medium text-gray-500 no-underline transition-colors hover:text-purple-600" href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <div>
          <p className="mb-6 text-xs font-bold uppercase tracking-widest text-gray-900">Get Started</p>
          <p className="mb-6 text-sm leading-relaxed text-gray-500">Build a smarter hiring workflow with modern, AI-first recruitment tooling.</p>
          <Link href="/auth/signup">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center rounded-full px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 shadow-md hover:shadow-lg transition-all"
            >
              Start Free Trial
            </motion.button>
          </Link>
        </div>
      </div>

      <div className="border-t border-gray-100 bg-gray-50">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-4 px-6 py-6 text-xs md:flex-row md:px-10 text-gray-500">
          <p>© {new Date().getFullYear()} Hire Karo. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="text-xs transition hover:text-purple-600 cursor-pointer font-medium">Privacy Policy</span>
            <span className="text-xs transition hover:text-purple-600 cursor-pointer font-medium">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
