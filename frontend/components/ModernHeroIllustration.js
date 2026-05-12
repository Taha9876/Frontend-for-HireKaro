'use client';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function ModernHeroIllustration() {
  const [activeIndex, setActiveIndex] = useState(0);

  const steps = [
    { icon: 'upload', title: 'Upload Resumes', desc: 'Drag & drop candidate files' },
    { icon: 'ai', title: 'AI Analysis', desc: 'Smart parsing & scoring' },
    { icon: 'match', title: 'Perfect Matches', desc: 'Top candidates identified' }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % steps.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-blue-50 rounded-[2rem] opacity-50" />
      
      {/* Main illustration container */}
      <div className="relative w-full h-full max-w-md mx-auto p-8">
        
        {/* Central processing hub */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        >
          <div className="w-32 h-32 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 opacity-20 blur-xl" />
        </motion.div>

        {/* Animated cards showing the process */}
        <div className="relative grid grid-cols-3 gap-4 items-center">
          {steps.map((step, index) => (
            <motion.div
              key={step.icon}
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: activeIndex === index ? 1 : 0.3,
                y: activeIndex === index ? 0 : 10,
                scale: activeIndex === index ? 1.05 : 0.95
              }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <div className={`bg-white rounded-2xl p-6 shadow-lg border-2 transition-all duration-300 ${
                activeIndex === index 
                  ? 'border-purple-500 shadow-purple-200' 
                  : 'border-gray-200'
              }`}>
                
                {/* Icon */}
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-all duration-300 ${
                  activeIndex === index
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {step.icon === 'upload' && (
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  )}
                  {step.icon === 'ai' && (
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  )}
                  {step.icon === 'match' && (
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>

                {/* Content */}
                <h3 className={`font-bold text-lg mb-2 transition-colors duration-300 ${
                  activeIndex === index ? 'text-purple-900' : 'text-gray-700'
                }`}>
                  {step.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {step.desc}
                </p>

                {/* Active indicator */}
                {activeIndex === index && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-purple-500 rounded-full"
                  />
                )}
              </div>
            </motion.div>
          ))}

          {/* Connection lines */}
          <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: -1 }}>
            <motion.line
              x1="33%"
              y1="50%"
              x2="67%"
              y2="50%"
              stroke={activeIndex === 1 ? "#7FA582" : "#e5e7eb"}
              strokeWidth="2"
              strokeDasharray={activeIndex === 1 ? "0" : "5,5"}
              animate={{ strokeDashoffset: activeIndex === 1 ? 0 : 10 }}
              transition={{ duration: 0.5 }}
            />
          </svg>
        </div>

        {/* Floating elements */}
        <div className="absolute top-8 left-8">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center"
          >
            <span className="text-blue-600 font-bold">CV</span>
          </motion.div>
        </div>

        <div className="absolute top-16 right-12">
          <motion.div
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center"
          >
            <span className="text-green-600 font-bold">AI</span>
          </motion.div>
        </div>

        <div className="absolute bottom-12 left-16">
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center"
          >
            <span className="text-purple-600 font-bold">95%</span>
          </motion.div>
        </div>

        <div className="absolute bottom-20 right-8">
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
            className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center"
          >
            <span className="text-orange-600 font-bold">A+</span>
          </motion.div>
        </div>

        {/* Progress indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2">
          {steps.map((_, index) => (
            <motion.div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                activeIndex === index ? 'bg-purple-500' : 'bg-gray-300'
              }`}
              animate={{ scale: activeIndex === index ? 1.5 : 1 }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>

        {/* Stats badges */}
        <div className="absolute top-4 right-4 space-y-2">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white px-3 py-1 rounded-full shadow-md border border-green-200"
          >
            <span className="text-xs font-semibold text-green-700">98% Accuracy</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white px-3 py-1 rounded-full shadow-md border border-blue-200"
          >
            <span className="text-xs font-semibold text-blue-700">10x Faster</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9 }}
            className="bg-white px-3 py-1 rounded-full shadow-md border border-purple-200"
          >
            <span className="text-xs font-semibold text-purple-700">500+ Teams</span>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
