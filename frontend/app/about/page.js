'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

const teamMembers = [
  {
    name: 'Sarah Chen',
    role: 'CEO & Co-Founder',
    image: 'SC',
    bio: 'Former VP of Talent at TechFlow with 15+ years in HR tech. Passionate about eliminating bias in hiring.'
  },
  {
    name: 'Marcus Rodriguez',
    role: 'CTO & Co-Founder',
    image: 'MR',
    bio: 'AI/ML expert from Google. Built scalable systems processing millions of documents daily.'
  },
  {
    name: 'Emily Watson',
    role: 'Head of Product',
    image: 'EW',
    bio: 'Product leader from Microsoft. Focused on user experience and enterprise solutions.'
  },
  {
    name: 'David Kim',
    role: 'Head of Engineering',
    image: 'DK',
    bio: 'Full-stack architect from Amazon. Expert in distributed systems and security.'
  }
];

const milestones = [
  {
    year: '2022',
    title: 'Founded',
    description: 'Brain-A-Hire founded with mission to revolutionize hiring'
  },
  {
    year: '2023',
    title: 'Seed Round',
    description: 'Raised $5M to build AI-powered screening platform'
  },
  {
    year: '2024',
    title: 'Product Launch',
    description: 'Launched with 100+ beta customers and 98% satisfaction'
  },
  {
    year: '2025',
    title: 'Series A',
    description: 'Raised $25M, expanded to 500+ customers globally'
  }
];

const values = [
  {
    title: 'Innovation First',
    description: 'We push boundaries with cutting-edge AI to solve real hiring challenges.',
    icon: 'lightbulb'
  },
  {
    title: 'Bias-Free Hiring',
    description: 'Our AI is designed to eliminate unconscious bias and promote diversity.',
    icon: 'balance'
  },
  {
    title: 'Customer Success',
    description: 'We succeed when our customers succeed. Your hiring goals are our goals.',
    icon: 'heart'
  },
  {
    title: 'Transparency',
    description: 'Open communication about how our AI works and why candidates match.',
    icon: 'eye'
  }
];

export default function AboutPage() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen relative">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-violet-100">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-[600px] h-[600px] top-[-10%] right-[-5%] rounded-full bg-gradient-to-br from-purple-400/20 to-pink-400/20 blur-3xl animate-pulse"></div>
          <div className="absolute w-[500px] h-[500px] bottom-[20%] left-[-10%] rounded-full bg-gradient-to-br from-violet-400/20 to-purple-400/20 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute w-[400px] h-[400px] top-[40%] right-[30%] rounded-full bg-gradient-to-br from-pink-400/20 to-violet-400/20 blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
      </div>

      {/* Professional Header */}
      <header className="relative z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <nav className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">BH</span>
              </div>
              <span className="font-bold text-xl" style={{ color: '#1a1535' }}>Brain-A-Hire</span>
            </Link>
            <div className="flex items-center gap-6">
              <Link href="/about" className="text-purple-600 font-medium">About</Link>
              <Link href="/pricing" className="text-gray-600 hover:text-purple-600 transition-colors">Pricing</Link>
              <Link href="/auth/login" className="text-gray-600 hover:text-purple-600 transition-colors">Login</Link>
              <Link href="/auth/signup" className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium hover:shadow-lg transition-shadow">
                Get Started
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section with Frosted Glass */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div 
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full backdrop-blur-md bg-white/60 border border-white/20 shadow-lg mb-8"
              whileHover={{ scale: 1.05, y: -2 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <div className="w-2 h-2 rounded-full bg-purple-600 animate-pulse"></div>
              <span className="text-purple-700 font-semibold">Our Story</span>
            </motion.div>
            
            <motion.h1 
              className="text-6xl font-bold mb-6"
              style={{ color: '#1a1535' }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Transforming hiring with<br/>
              <motion.span 
                className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                intelligent AI
              </motion.span>
            </motion.h1>
            
            <motion.p 
              className="text-xl text-gray-600 max-w-4xl mx-auto mb-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              We're a team of passionate technologists and HR experts dedicated to making hiring more efficient, 
              fair, and data-driven. Our mission is to help companies build exceptional teams while eliminating bias.
            </motion.p>
            
            <motion.div 
              className="flex justify-center gap-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Start Free Trial
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 rounded-full backdrop-blur-md bg-white/60 border border-white/20 font-semibold shadow-lg hover:shadow-xl transition-all"
                style={{ color: '#1a1535' }}
              >
                Watch Demo
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision with Frosted Glass */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8">
          <motion.div
            className="backdrop-blur-md bg-white/40 rounded-3xl p-8 border border-white/20 shadow-xl"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.div 
              className="w-16 h-16 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center mb-6"
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.5 }}
            >
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </motion.div>
            <h2 className="text-3xl font-bold mb-6" style={{ color: '#1a1535' }}>Our Mission</h2>
            <p className="text-lg text-gray-700 mb-6">
              To revolutionize the hiring process by leveraging advanced AI technology that screens, matches, 
              and evaluates candidates with unprecedented accuracy and fairness.
            </p>
            <p className="text-lg text-gray-700">
              We believe great hires build great companies. Our platform empowers HR teams to make data-driven 
              decisions while saving countless hours and eliminating human bias.
            </p>
          </motion.div>
          
          <motion.div
            className="backdrop-blur-md bg-white/40 rounded-3xl p-8 border border-white/20 shadow-xl"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <motion.div 
              className="w-16 h-16 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center mb-6"
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.5 }}
            >
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </motion.div>
            <h2 className="text-3xl font-bold mb-6" style={{ color: '#1a1535' }}>Our Vision</h2>
            <p className="text-lg text-gray-700 mb-6">
              A world where every hiring decision is backed by intelligent insights, where talent is recognized 
              regardless of background, and where companies build diverse, high-performing teams effortlessly.
            </p>
            <p className="text-lg text-gray-700">
              We're building the future of recruitment - one where AI and human expertise work together to 
              create perfect matches between talent and opportunity.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="backdrop-blur-md bg-white/40 rounded-3xl p-12 border border-white/20 shadow-xl"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="grid md:grid-cols-4 gap-8">
              {[
                { number: '500+', label: 'Companies' },
                { number: '50K+', label: 'Candidates' },
                { number: '98%', label: 'Satisfaction' },
                { number: '75%', label: 'Time Saved' }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="text-center"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <motion.div
                    className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2"
                    whileHover={{ scale: 1.2 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    {stat.number}
                  </motion.div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Core Values with Enhanced Frosted Glass */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4" style={{ color: '#1a1535' }}>Our Core Values</h2>
            <p className="text-xl text-gray-600">The principles that guide everything we do</p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                className="backdrop-blur-md bg-white/40 rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <motion.div 
                  className="w-14 h-14 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center mb-4"
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                >
                  {value.icon === 'lightbulb' && (
                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  )}
                  {value.icon === 'balance' && (
                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                    </svg>
                  )}
                  {value.icon === 'heart' && (
                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  )}
                  {value.icon === 'eye' && (
                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </motion.div>
                <h3 className="text-xl font-bold mb-3" style={{ color: '#1a1535' }}>
                  {value.title}
                </h3>
                <p className="text-gray-700">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Timeline */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4" style={{ color: '#1a1535' }}>Our Journey</h2>
            <p className="text-xl text-gray-600">Key milestones in our growth story</p>
          </motion.div>
          
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-purple-600 to-pink-600 rounded-full"></div>
            
            {milestones.map((milestone, index) => (
              <motion.div
                key={milestone.year}
                className={`flex items-center mb-12 ${index % 2 === 0 ? 'flex-row-reverse' : ''}`}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <div className="w-1/2"></div>
                <motion.div
                  className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 border-4 border-white shadow-lg z-10"
                  whileHover={{ scale: 1.3 }}
                  transition={{ type: "spring", stiffness: 400 }}
                ></motion.div>
                <motion.div
                  className="w-1/2 backdrop-blur-md bg-white/40 rounded-2xl p-6 border border-white/20 shadow-xl"
                  whileHover={{ scale: 1.05, y: -5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <div className="text-2xl font-bold text-purple-600 mb-2">{milestone.year}</div>
                  <div className="text-xl font-bold mb-2" style={{ color: '#1a1535' }}>{milestone.title}</div>
                  <div className="text-gray-700">{milestone.description}</div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4" style={{ color: '#1a1535' }}>Meet Our Team</h2>
            <p className="text-xl text-gray-600">The brilliant minds behind Brain-A-Hire</p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.name}
                className="backdrop-blur-md bg-white/40 rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <motion.div
                  className="w-20 h-20 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center mx-auto mb-4"
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                >
                  <span className="text-white text-2xl font-bold">{member.image}</span>
                </motion.div>
                <h3 className="text-xl font-bold mb-1" style={{ color: '#1a1535' }}>{member.name}</h3>
                <p className="text-purple-600 font-medium mb-3">{member.role}</p>
                <p className="text-gray-700 text-sm">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="backdrop-blur-md bg-white/40 rounded-3xl p-12 border border-white/20 shadow-xl"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl font-bold mb-6" style={{ color: '#1a1535' }}>Cutting-Edge Technology</h2>
                <p className="text-lg text-gray-700 mb-6">
                  Our AI-powered platform leverages state-of-the-art machine learning algorithms to analyze 
                  resumes, assess skills, and predict candidate success with remarkable accuracy.
                </p>
                <p className="text-lg text-gray-700 mb-6">
                  We use natural language processing, computer vision, and predictive analytics to provide 
                  comprehensive insights that help you make better hiring decisions.
                </p>
                <div className="flex flex-wrap gap-3">
                  {['Machine Learning', 'NLP', 'Computer Vision', 'Predictive Analytics'].map((tech) => (
                    <motion.span
                      key={tech}
                      className="px-4 py-2 rounded-full backdrop-blur-md bg-purple-100/60 text-purple-700 font-medium"
                      whileHover={{ scale: 1.1, y: -2 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      {tech}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
              
              <motion.div
                className="grid grid-cols-2 gap-4"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
              >
                {[
                  { icon: 'brain', label: 'AI Processing', value: '99.9%' },
                  { icon: 'shield', label: 'Data Security', value: '256-bit' },
                  { icon: 'zap', label: 'Speed', value: '0.1s' },
                  { icon: 'globe', label: 'Global Reach', value: '50+' }
                ].map((item, index) => (
                  <motion.div
                    key={item.label}
                    className="backdrop-blur-md bg-white/60 rounded-2xl p-4 border border-white/20 text-center"
                    whileHover={{ scale: 1.05, y: -3 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <div className="text-3xl font-bold text-purple-600 mb-1">{item.value}</div>
                    <div className="text-sm text-gray-700">{item.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="backdrop-blur-md bg-gradient-to-r from-purple-600/90 to-pink-600/90 rounded-3xl p-16 border border-white/20 shadow-xl text-center"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Transform Your Hiring?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join hundreds of companies already using Brain-A-Hire to build exceptional teams 
              with the power of AI.
            </p>
            <div className="flex justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 rounded-full bg-white text-purple-600 font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Start Free Trial
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 rounded-full backdrop-blur-md bg-white/20 border border-white/30 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Schedule Demo
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}