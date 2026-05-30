'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

/* ─── Currency config per language ─── */
const CURRENCY_MAP = {
  en: { symbol: '£', code: 'GBP', rate: 0.79, position: 'before', period: '/month' },
  fr: { symbol: '€', code: 'EUR', rate: 0.92, position: 'before', period: '/mois' },
  de: { symbol: '€', code: 'EUR', rate: 0.92, position: 'before', period: '/Monat' },
  es: { symbol: '€', code: 'EUR', rate: 0.92, position: 'before', period: '/mes' },
  lv: { symbol: '€', code: 'EUR', rate: 0.92, position: 'before', period: '/mēnesī' },
  ar: { symbol: 'ر.س', code: 'SAR', rate: 3.75, position: 'after', period: '/شهر' },
  ja: { symbol: '¥', code: 'JPY', rate: 155, position: 'before', period: '/月' },
};

/* Base prices in USD */
const BASE_PRICES_USD = [49, 149]; // Starter, Professional (Enterprise is custom)

function getCookie(name) {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

function getLanguageFromCookie() {
  const cookieLang = getCookie('googtrans');
  if (cookieLang) {
    const parts = cookieLang.split('/').filter(Boolean);
    const target = parts[parts.length - 1];
    if (target && CURRENCY_MAP[target]) return target;
  }
  return 'en';
}

function formatPrice(usdAmount, lang) {
  const curr = CURRENCY_MAP[lang] || CURRENCY_MAP.en;
  const converted = Math.round(usdAmount * curr.rate);

  // Format with locale-appropriate thousand separators
  const formatted = lang === 'ja'
    ? converted.toLocaleString('ja-JP')
    : converted.toLocaleString('en-US');

  return curr.position === 'before'
    ? `${curr.symbol}${formatted}`
    : `${formatted} ${curr.symbol}`;
}

const pricingPlansBase = [
  {
    name: 'Starter',
    usd: 49,
    description: 'Perfect for small teams getting started',
    features: [
      'Up to 50 resume screenings per month',
      'Basic AI scoring',
      '3 user accounts',
      'Email support',
      'Standard reporting',
      '1 job posting'
    ],
    highlighted: false,
    cta: 'Start Free Trial'
  },
  {
    name: 'Professional',
    usd: 149,
    description: 'Ideal for growing companies',
    features: [
      'Up to 500 resume screenings per month',
      'Advanced AI scoring & matching',
      '10 user accounts',
      'Priority email & chat support',
      'Advanced analytics & reporting',
      '5 job postings',
      'Custom scorecards',
      'API access'
    ],
    highlighted: true,
    cta: 'Start Free Trial',
    badge: 'Most Popular'
  },
  {
    name: 'Enterprise',
    usd: null, // Custom
    description: 'For large organizations with custom needs',
    features: [
      'Unlimited resume screenings',
      'Enterprise-grade AI matching',
      'Unlimited user accounts',
      'Dedicated account manager',
      'Custom integrations',
      'Unlimited job postings',
      'Advanced security & compliance',
      'Custom workflows',
      'SLA guarantee',
      'On-premise option'
    ],
    highlighted: false,
    cta: 'Contact Sales'
  }
];

const faqs = [
  {
    q: 'Can I change my plan anytime?',
    a: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect at the next billing cycle.'
  },
  {
    q: 'Is there a free trial available?',
    a: 'Yes! All plans come with a 14-day free trial. No credit card required to start.'
  },
  {
    q: 'What happens if I exceed my screening limit?',
    a: 'You\'ll be notified when you approach your limit. Additional screenings can be purchased at $1 per screening.'
  },
  {
    q: 'Do you offer discounts for annual billing?',
    a: 'Yes, annual billing saves you 20% compared to monthly billing.'
  },
  {
    q: 'What integrations are available?',
    a: 'We integrate with all major ATS platforms including Greenhouse, Lever, Workday, and more.'
  }
];

export default function PricingPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [lang, setLang] = useState('en');

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Detect language from cookie on mount
  useEffect(() => {
    setLang(getLanguageFromCookie());
  }, []);

  const curr = CURRENCY_MAP[lang] || CURRENCY_MAP.en;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-violet-100">
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            className="absolute w-[600px] h-[600px] top-[-10%] right-[-5%] rounded-full bg-gradient-to-br from-purple-400/20 to-pink-400/20 blur-3xl"
            animate={{
              x: mousePosition.x * 0.02,
              y: mousePosition.y * 0.02,
              scale: [1, 1.1, 1]
            }}
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 20,
              scale: { duration: 4, repeat: Infinity }
            }}
          />
          <motion.div 
            className="absolute w-[500px] h-[500px] bottom-[20%] left-[-10%] rounded-full bg-gradient-to-br from-violet-400/20 to-purple-400/20 blur-3xl"
            animate={{
              x: mousePosition.x * -0.02,
              y: mousePosition.y * -0.02,
              scale: [1, 1.15, 1]
            }}
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 20,
              scale: { duration: 5, repeat: Infinity, delay: 1 }
            }}
          />
          <motion.div 
            className="absolute w-[400px] h-[400px] top-[40%] right-[30%] rounded-full bg-gradient-to-br from-pink-400/20 to-violet-400/20 blur-3xl"
            animate={{
              x: mousePosition.x * 0.03,
              y: mousePosition.y * 0.03,
              scale: [1, 1.2, 1]
            }}
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 20,
              scale: { duration: 6, repeat: Infinity, delay: 2 }
            }}
          />
        </div>
      </div>
      {/* Hero Section */}
      <section className="relative z-10 px-4 sm:px-6 pt-32 pb-12 md:pt-40 md:pb-20">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div 
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full backdrop-blur-md bg-white/60 border border-white/20 shadow-lg mb-8"
              whileHover={{ scale: 1.05, y: -2 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <motion.div 
                className="w-2 h-2 rounded-full bg-purple-600"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="text-purple-700 font-semibold">Transparent Pricing</span>
            </motion.div>
            
            <motion.h1 
              className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight"
              style={{ color: '#1a1535' }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Simple pricing for<br/>
              <motion.span 
                className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                teams of all sizes
              </motion.span>
            </motion.h1>
            
            <motion.p 
              className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-6 px-2"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Choose the perfect plan for your hiring needs. No hidden fees, cancel anytime.
            </motion.p>

            {/* Currency indicator pill */}
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 backdrop-blur-md border border-purple-200/40 shadow-sm text-sm text-gray-600 font-medium"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              Prices shown in <span className="font-bold text-purple-700">{curr.code}</span>
              <span className="text-[10px] text-gray-400">• Change via language selector</span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-20">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {pricingPlansBase.map((plan, index) => {
            const displayPrice = plan.usd ? formatPrice(plan.usd, lang) : 'Custom';
            const displayPeriod = plan.usd ? curr.period : '';

            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05, y: -10 }}
                className={`relative rounded-3xl p-8 transition-all flex flex-col h-full ${
                  plan.highlighted 
                    ? 'backdrop-blur-md bg-gradient-to-br from-purple-600/90 to-pink-600/90 text-white shadow-2xl scale-105 border border-white/20' 
                    : 'backdrop-blur-md bg-white/40 shadow-xl hover:shadow-2xl border border-white/20'
                }`}
              >
                {plan.badge && (
                  <motion.div
                    className="absolute -top-4 left-1/2 transform -translate-x-1/2"
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    viewport={{ once: true }}
                  >
                    <motion.span 
                      className="bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm font-bold shadow-lg"
                      whileHover={{ scale: 1.1 }}
                    >
                      {plan.badge}
                    </motion.span>
                  </motion.div>
                )}
                
                <div className="text-center mb-8">
                  <motion.h3 
                    className={`text-2xl font-bold mb-2 ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    viewport={{ once: true }}
                  >
                    {plan.name}
                  </motion.h3>
                  <motion.div 
                    className="mb-4"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    viewport={{ once: true }}
                  >
                    <span className={`text-4xl sm:text-5xl font-bold ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                      {displayPrice}
                    </span>
                    <span className={`text-lg ${plan.highlighted ? 'text-purple-100' : 'text-gray-600'}`}>
                      {displayPeriod}
                    </span>
                  </motion.div>
                  <motion.p 
                    className={`${plan.highlighted ? 'text-purple-100' : 'text-gray-600'}`}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    viewport={{ once: true }}
                  >
                    {plan.description}
                  </motion.p>
                </div>

                <ul className="space-y-4 mb-8 flex-grow">
                  {plan.features.map((feature, i) => (
                    <motion.li 
                      key={i} 
                      className="flex items-start gap-3"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.7 + i * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <motion.svg 
                        className={`w-5 h-5 mt-0.5 flex-shrink-0 ${plan.highlighted ? 'text-white' : 'text-purple-600'}`}
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 400, delay: 0.7 + i * 0.1 }}
                        viewport={{ once: true }}
                      >
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </motion.svg>
                      <span className={`text-sm ${plan.highlighted ? 'text-white' : 'text-gray-700'}`}>
                        {feature}
                      </span>
                    </motion.li>
                  ))}
                </ul>

                <div className="mt-auto">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.2 }}
                    viewport={{ once: true }}
                  >
                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className={`block w-full py-3 rounded-full font-medium text-center transition-all ${
                        plan.highlighted 
                          ? 'bg-white text-purple-600 hover:bg-gray-100 shadow-lg' 
                          : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg'
                      }`}
                    >
                      {plan.cta}
                    </motion.button>
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

        {/* FAQ Section */}
      <section className="relative z-10 px-4 sm:px-6 py-16 md:py-20">
        <div className="max-w-3xl mx-auto">
          <motion.div
            className="text-center mb-12 md:mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: '#1a1535' }}>Frequently Asked Questions</h2>
            <p className="text-base sm:text-xl text-gray-600">Common questions about our pricing</p>
          </motion.div>
          
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="backdrop-blur-md bg-white/40 rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all"
                whileHover={{ scale: 1.02, y: -2 }}
              >
                <h3 className="text-lg font-semibold mb-3" style={{ color: '#1a1535' }}>
                  {faq.q}
                </h3>
                <p className="text-gray-600">
                  {faq.a}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

        {/* CTA Section */}
      <section className="relative z-10 px-4 sm:px-6 py-16 md:py-20 pb-24">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="backdrop-blur-md bg-gradient-to-r from-purple-600/90 to-pink-600/90 rounded-3xl p-8 sm:p-12 md:p-16 border border-white/20 shadow-xl text-center"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.h2 
              className="text-3xl sm:text-4xl font-bold text-white mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Ready to Transform Your Hiring?
            </motion.h2>
            <motion.p 
              className="text-base sm:text-xl text-white/90 mb-8 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              Join 500+ companies already using Hire Karo to build exceptional teams.
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
            >
              <Link href="/auth/signup">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto px-8 py-4 rounded-full bg-white text-purple-600 font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  Start Free Trial
                </motion.button>
              </Link>
              <Link href="/contact">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto px-8 py-4 rounded-full backdrop-blur-md bg-white/20 border border-white/30 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  Schedule Demo
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
      </div>
  );
}