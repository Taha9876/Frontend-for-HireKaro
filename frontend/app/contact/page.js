'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { createContactSubmission } from '@/lib/database';

const contactMethods = [
  {
    icon: 'email',
    title: 'Email Us',
    value: 'hello@brainahire.com',
    description: 'Get a response within 24 hours',
    color: 'from-purple-600 to-pink-600',
    stats: '2hr avg response',
    availability: '24/7'
  },
  {
    icon: 'phone',
    title: 'Call Us',
    value: '+1 (555) 123-4567',
    description: 'Mon-Fri from 9am to 6pm EST',
    color: 'from-blue-600 to-cyan-600',
    stats: '< 1min wait time',
    availability: 'Business hours'
  },
  {
    icon: 'chat',
    title: 'Live Chat',
    value: 'Available Now',
    description: 'Chat with our team instantly',
    color: 'from-green-600 to-emerald-600',
    stats: 'Instant response',
    availability: '24/7'
  },
  {
    icon: 'location',
    title: 'Visit Us',
    value: '123 Tech Street, SF',
    description: 'Schedule a meeting at our office',
    color: 'from-orange-600 to-red-600',
    stats: '4 global offices',
    availability: 'By appointment'
  }
];

const offices = [
  {
    city: 'San Francisco',
    address: '123 Tech Street, Suite 100',
    phone: '+1 (555) 123-4567',
    email: 'sf@brainahire.com',
    image: 'SF'
  },
  {
    city: 'New York',
    address: '456 Broadway, Floor 15',
    phone: '+1 (555) 987-6543',
    email: 'ny@brainahire.com',
    image: 'NY'
  },
  {
    city: 'London',
    address: '789 Oxford Street, Level 5',
    phone: '+44 20 1234 5678',
    email: 'london@brainahire.com',
    image: 'LDN'
  },
  {
    city: 'Singapore',
    address: '321 Marina Bay, Tower 2',
    phone: '+65 6123 4567',
    email: 'asia@brainahire.com',
    image: 'SG'
  }
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [formErrors, setFormErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [focusedField, setFocusedField] = useState(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const validateField = (name, value) => {
    const errors = {};
    switch (name) {
      case 'name':
        if (!value.trim()) errors.name = 'Name is required';
        else if (value.length < 2) errors.name = 'Name must be at least 2 characters';
        break;
      case 'email':
        if (!value.trim()) errors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) errors.email = 'Please enter a valid email';
        break;
      case 'subject':
        if (!value) errors.subject = 'Please select a subject';
        break;
      case 'message':
        if (!value.trim()) errors.message = 'Message is required';
        else if (value.length < 10) errors.message = 'Message must be at least 10 characters';
        break;
    }
    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Real-time validation
    if (touchedFields[name]) {
      const errors = validateField(name, value);
      setFormErrors({ ...formErrors, ...errors });
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouchedFields({ ...touchedFields, [name]: true });
    const errors = validateField(name, value);
    setFormErrors({ ...formErrors, ...errors });
  };

  const handleFocus = (e) => {
    setFocusedField(e.target.name);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    const errors = {};
    Object.keys(formData).forEach(key => {
      const fieldErrors = validateField(key, formData[key]);
      Object.assign(errors, fieldErrors);
    });
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setTouchedFields({
        name: true,
        email: true,
        subject: true,
        message: true
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      await createContactSubmission(formData);
      setIsSubmitted(true);
      setFormData({
        name: '',
        email: '',
        company: '',
        phone: '',
        subject: '',
        message: ''
      });
      setFormErrors({});
      setTouchedFields({});
      setTimeout(() => setIsSubmitted(false), 5000);
    } catch (error) {
      console.error('Failed to submit contact form:', error);
      // You could set an error state here to show the user
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <motion.div 
            className="absolute w-[300px] h-[300px] top-[60%] left-[20%] rounded-full bg-gradient-to-br from-blue-400/15 to-cyan-400/15 blur-3xl"
            animate={{
              x: mousePosition.x * -0.015,
              y: mousePosition.y * -0.015,
              scale: [1, 1.25, 1]
            }}
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 20,
              scale: { duration: 7, repeat: Infinity, delay: 3 }
            }}
          />
        </div>
      </div>

      {/* Professional Header */}
      <header className="relative z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <nav className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <motion.div 
                className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center"
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.5 }}
              >
                <span className="text-white font-bold text-sm">BH</span>
              </motion.div>
              <span className="font-bold text-xl" style={{ color: '#1a1535' }}>Brain-A-Hire</span>
            </Link>
            <div className="flex items-center gap-6">
              <Link href="/about" className="text-gray-600 hover:text-purple-600 transition-colors">About</Link>
              <Link href="/pricing" className="text-gray-600 hover:text-purple-600 transition-colors">Pricing</Link>
              <Link href="/contact" className="text-purple-600 font-medium">Contact</Link>
              <Link href="/auth/login" className="text-gray-600 hover:text-purple-600 transition-colors">Login</Link>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium hover:shadow-lg transition-shadow"
              >
                Get Started
              </motion.button>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 px-6 py-20">
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
              <span className="text-purple-700 font-semibold">Get in Touch</span>
            </motion.div>
            
            <motion.h1 
              className="text-6xl font-bold mb-6"
              style={{ color: '#1a1535' }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Let's<br/>
              <motion.span 
                className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                Connect
              </motion.span>
            </motion.h1>
            
            <motion.p 
              className="text-xl text-gray-600 max-w-4xl mx-auto mb-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Ready to transform your hiring process? Our team is here to help you succeed. 
              Reach out through any of the channels below or fill out the form.
            </motion.p>
          </motion.div>

          {/* Contact Methods Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {contactMethods.map((method, index) => (
              <motion.div
                key={method.title}
                className="backdrop-blur-md bg-white/40 rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <motion.div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${method.color} flex items-center justify-center mb-4`}
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                >
                  {method.icon === 'email' && (
                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  )}
                  {method.icon === 'phone' && (
                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  )}
                  {method.icon === 'chat' && (
                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  )}
                  {method.icon === 'location' && (
                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </motion.div>
                <h3 className="text-xl font-bold mb-2" style={{ color: '#1a1535' }}>{method.title}</h3>
                <p className="text-purple-600 font-medium mb-2">{method.value}</p>
                <p className="text-gray-600 text-sm mb-3">{method.description}</p>
                
                {/* Stats and Availability */}
                <div className="flex items-center justify-between mb-2">
                  <motion.div 
                    className="text-xs font-semibold bg-purple-100 text-purple-700 px-2 py-1 rounded-full"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    {method.stats}
                  </motion.div>
                  <motion.div 
                    className="text-xs font-medium bg-green-100 text-green-700 px-2 py-1 rounded-full"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    {method.availability}
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Contact Form */}
          <motion.div
            className="max-w-2xl mx-auto backdrop-blur-md bg-white/40 rounded-3xl p-8 border border-white/20 shadow-xl"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2 className="text-3xl font-bold mb-6" style={{ color: '#1a1535' }}>Send us a message</h2>
              <p className="text-gray-600 mb-8">
                Fill out the form below and our team will get back to you within 24 hours.
              </p>
            </motion.div>

            {!isSubmitted ? (
              <motion.form
                onSubmit={handleSubmit}
                className="space-y-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <div className="grid md:grid-cols-2 gap-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                    <motion.input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                      whileFocus={{ scale: 1.02 }}
                      placeholder="John Doe"
                    />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                    <motion.input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                      whileFocus={{ scale: 1.02 }}
                      placeholder="john@company.com"
                    />
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
                  <motion.select
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                    whileFocus={{ scale: 1.02 }}
                  >
                    <option value="">Select a subject</option>
                    <option value="demo">Request a Demo</option>
                    <option value="pricing">Pricing Inquiry</option>
                    <option value="support">Technical Support</option>
                    <option value="other">Other</option>
                  </motion.select>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.9 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                  <motion.textarea
                    name="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all resize-none"
                    whileFocus={{ scale: 1.02 }}
                    placeholder="Tell us about your hiring needs..."
                  />
                </motion.div>

                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.0 }}
                >
                  {isSubmitting ? (
                    <motion.div
                      className="flex items-center justify-center gap-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <motion.div
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity }}
                      />
                      Sending...
                    </motion.div>
                  ) : (
                    'Send Message'
                  )}
                </motion.button>
              </motion.form>
            ) : (
              <motion.div
                className="text-center py-12"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  className="w-20 h-20 rounded-full bg-gradient-to-r from-green-600 to-emerald-600 flex items-center justify-center mx-auto mb-6"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, delay: 0.2 }}
                >
                  <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
                <h3 className="text-2xl font-bold mb-4" style={{ color: '#1a1535' }}>Message Sent Successfully!</h3>
                <p className="text-gray-600">
                  Thank you for reaching out. Our team will get back to you within 24 hours.
                </p>
              </motion.div>
            )}
          </motion.div>

          {/* Office Locations */}
          <motion.div
            className="mt-20"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4" style={{ color: '#1a1535' }}>Our Offices</h2>
              <p className="text-xl text-gray-600">Visit us at any of our global locations</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {offices.map((office, index) => (
                <motion.div
                  key={office.city}
                  className="backdrop-blur-md bg-white/40 rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                >
                  <motion.div
                    className="w-16 h-16 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center mx-auto mb-4"
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <span className="text-white text-xl font-bold">{office.image}</span>
                  </motion.div>
                  <h3 className="text-xl font-bold mb-2" style={{ color: '#1a1535' }}>{office.city}</h3>
                  <p className="text-gray-600 text-sm mb-3">{office.address}</p>
                  <p className="text-purple-600 text-sm mb-1">{office.phone}</p>
                  <p className="text-purple-600 text-sm">{office.email}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Final CTA */}
          <motion.div
            className="mt-20 backdrop-blur-md bg-gradient-to-r from-purple-600/90 to-pink-600/90 rounded-3xl p-16 border border-white/20 shadow-xl text-center"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            <motion.h2 
              className="text-4xl font-bold text-white mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.4 }}
            >
              Ready to Transform Your Hiring?
            </motion.h2>
            <motion.p 
              className="text-xl text-white/90 mb-8 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.6 }}
            >
              Join hundreds of companies already using Brain-A-Hire to build exceptional teams.
            </motion.p>
            <motion.div
              className="flex justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.8 }}
            >
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
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}