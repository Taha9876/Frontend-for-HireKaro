'use client';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function HRHeroImage() {
  const [hoveredDoc, setHoveredDoc] = useState(null);

  const documents = [
    { id: 1, name: 'John Doe - Resume', score: 92, color: '#7FA582' },
    { id: 2, name: 'Sarah Smith - CV', score: 87, color: '#F4A28C' },
    { id: 3, name: 'Mike Johnson - Resume', score: 78, color: '#06b6d4' },
    { id: 4, name: 'Emily Brown - CV', score: 95, color: '#10b981' },
  ];

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-blue-50 rounded-[2rem] opacity-50" />
      
      {/* Main illustration container */}
      <div className="relative w-full h-full max-w-lg mx-auto p-6">
        
        {/* Central AI Processing Hub */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        >
          <div className="w-40 h-40 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 opacity-20 blur-2xl" />
        </motion.div>

        {/* AI Brain/Analysis Center */}
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10"
        >
          <div className="relative">
            {/* Brain/AI Icon */}
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-500 shadow-2xl flex items-center justify-center">
              <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
              </svg>
            </div>
            
            {/* Scanning Effect */}
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-2xl bg-purple-400 blur-xl"
            />
          </div>
        </motion.div>

        {/* Floating Documents around the center */}
        <div className="relative w-full h-full">
          {documents.map((doc, index) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: 1, 
                scale: hoveredDoc === doc.id ? 1.1 : 1,
                x: index % 2 === 0 ? -50 : 50,
                y: index < 2 ? -60 : 60
              }}
              transition={{ 
                duration: 0.8, 
                delay: index * 0.2,
                type: "spring"
              }}
              onMouseEnter={() => setHoveredDoc(doc.id)}
              onMouseLeave={() => setHoveredDoc(null)}
              className="absolute"
              style={{
                left: '50%',
                top: '50%',
              }}
            >
              <div className="relative bg-white rounded-xl shadow-lg p-4 border-2 border-purple-100 hover:border-purple-300 transition-colors cursor-pointer"
                   style={{ width: '160px' }}>
                {/* Document Icon */}
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                       style={{ backgroundColor: `${doc.color}20` }}>
                    <svg className="w-5 h-5" style={{ color: doc.color }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-gray-800 truncate">{doc.name}</div>
                    <div className="text-xs text-gray-500">CV Analysis</div>
                  </div>
                </div>
                
                {/* Score Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Match Score</span>
                    <span className="font-bold" style={{ color: doc.color }}>{doc.score}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${doc.score}%` }}
                      transition={{ duration: 1.5, delay: index * 0.3 + 0.5 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: doc.color }}
                    />
                  </div>
                </div>

                {/* Analysis Indicators */}
                <div className="mt-3 flex gap-1">
                  {['Skills', 'Exp', 'Fit'].map((label, i) => (
                    <motion.div
                      key={label}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.2 + i * 0.1 + 1 }}
                      className="px-2 py-1 text-xs rounded-full"
                      style={{ 
                        backgroundColor: `${doc.color}15`,
                        color: doc.color 
                      }}
                    >
                      {label}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Connection Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
          {documents.map((doc, index) => (
            <motion.line
              key={doc.id}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, delay: index * 0.2 + 0.5 }}
              x1="50%"
              y1="50%"
              x2={index % 2 === 0 ? "30%" : "70%"}
              y2={index < 2 ? "30%" : "70%"}
              stroke={doc.color}
              strokeWidth="2"
              strokeDasharray="5,5"
              opacity="0.3"
            />
          ))}
        </svg>

        {/* Floating Elements */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.5
            }}
            className="absolute w-2 h-2 rounded-full bg-purple-400"
            style={{
              left: `${20 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
