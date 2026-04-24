'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const PREVIEW_DATA = [
  { name: 'Mon', applications: 38, interviews: 10 },
  { name: 'Tue', applications: 65, interviews: 18 },
  { name: 'Wed', applications: 84, interviews: 23 },
  { name: 'Thu', applications: 72, interviews: 16 },
  { name: 'Fri', applications: 98, interviews: 28 },
  { name: 'Sat', applications: 112, interviews: 32 },
  { name: 'Sun', applications: 130, interviews: 39 },
];

const METRICS = [
  { label: 'Active roles', value: '12', accent: '#8b5cf6' },
  { label: 'New applications', value: '284', accent: '#c026d3' },
  { label: 'Interview-ready', value: '63', accent: '#0ea5e9' },
];

const JOBS = [
  { title: 'Senior React Engineer', pipeline: '24 resumes', status: 'Screening' },
  { title: 'Product Designer', pipeline: '17 resumes', status: 'Interview' },
  { title: 'Data Analyst', pipeline: '12 resumes', status: 'Shortlist' },
];

const statusMap = {
  Screening: { bg: 'rgba(139,92,246,0.12)', color: '#7c3aed' },
  Interview: { bg: 'rgba(192,38,211,0.12)', color: '#c026d3' },
  Shortlist: { bg: 'rgba(14,165,233,0.12)', color: '#0ea5e9' },
};

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-2xl border border-violet-100 bg-white p-3 text-sm shadow-xl">
        <p className="font-semibold text-slate-900 mb-2">{label}</p>
        {payload.map((entry) => (
          <p key={entry.name} className="text-xs font-semibold" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }

  return null;
}

export default function DashboardPreview() {
  return (
    <motion.div
      className="dashboard-preview relative overflow-hidden rounded-[2.5rem] border border-white/70 bg-white/95 shadow-[0_35px_120px_-40px_rgba(124,58,237,0.32)]"
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.9, ease: 'power3.out' }}
    >
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-purple-deep/20 via-transparent to-pink-violet/10 pointer-events-none" />
      <div className="relative z-10 p-6 md:p-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] font-semibold text-violet-600">Real hiring intelligence</p>
            <h3 className="mt-3 text-3xl md:text-4xl font-extrabold text-slate-950">Live HR analytics, candidate workflows, and hiring velocity.</h3>
          </div>
          <div className="rounded-full bg-violet-50 px-5 py-3 text-sm font-semibold text-violet-700 shadow-sm">
            Updated 2 min ago
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-[280px_1fr]">
          <aside className="rounded-[2rem] bg-violet-50/70 p-6 shadow-sm border border-violet-100">
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-700">Today</p>
              <p className="mt-3 text-4xl font-extrabold text-slate-950">9 hires</p>
              <p className="mt-2 text-sm text-slate-500">Closing the loop on your fastest roles.</p>
            </div>
            <div className="space-y-4">
              {METRICS.map((metric) => (
                <div key={metric.label} className="rounded-3xl bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm font-medium text-slate-700">{metric.label}</p>
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: metric.accent }} />
                  </div>
                  <p className="mt-3 text-2xl font-bold text-slate-950">{metric.value}</p>
                </div>
              ))}
            </div>
          </aside>

          <main className="space-y-6">
            <div className="rounded-[2rem] border border-violet-100 bg-slate-50 p-5 shadow-sm">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-500">Candidate engagement</p>
                  <p className="text-xs uppercase tracking-[0.18em] text-violet-600">Applications + interviews</p>
                </div>
                <div className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm">7-day trend</div>
              </div>
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={PREVIEW_DATA} margin={{ top: 10, right: 10, left: -18, bottom: 0 }}>
                    <defs>
                      <linearGradient id="previewApps" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="previewInterviews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#c026d3" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#c026d3" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(139,92,246,0.12)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#7c3aed', fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#7c3aed', fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="applications" stroke="#8b5cf6" strokeWidth={3} fill="url(#previewApps)" />
                    <Area type="monotone" dataKey="interviews" stroke="#c026d3" strokeWidth={3} fill="url(#previewInterviews)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {JOBS.map((job) => (
                <div key={job.title} className="rounded-[2rem] bg-white p-5 shadow-sm border border-violet-100">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-base font-semibold text-slate-950">{job.title}</p>
                      <p className="text-xs text-slate-500 mt-1">{job.pipeline}</p>
                    </div>
                    <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold" style={{ background: statusMap[job.status].bg, color: statusMap[job.status].color }}>
                      {job.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
    </motion.div>
  );
}
