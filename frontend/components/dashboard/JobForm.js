'use client';
import { useState } from 'react';
import api from '@/lib/api';
import { Briefcase, Plus, ChevronRight } from 'lucide-react';

const inputClass = "w-full px-3.5 py-2.5 text-sm text-[#0a1628] bg-slate-50 border border-slate-200 rounded-lg outline-none transition-all focus:border-blue-500 focus:bg-white focus:shadow-[0_0_0_3px_rgba(37,99,235,0.1)]";
const labelClass = "block text-xs font-semibold text-slate-600 mb-1.5";

export default function JobForm({ onSuccess }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [skills, setSkills] = useState([]);
    const [skillInput, setSkillInput] = useState({ skill_name: '', is_required: true, proficiency_level: 'intermediate' });

    const [form, setForm] = useState({
        title: '', department: '', location: '',
        job_type: 'onsite', experience_level: 'mid',
        salary_min: '', salary_max: '', salary_currency: 'PKR', salary_visible: false,
        description: '', responsibilities: '', requirements: '',
        total_positions: 1, deadline: '',
    });

    const handleChange = (e) => {
        const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setForm({ ...form, [e.target.name]: val });
        setError('');
    };

    const addSkill = () => {
        if (!skillInput.skill_name.trim()) return;
        const exists = skills.find(s => s.skill_name.toLowerCase() === skillInput.skill_name.toLowerCase());
        if (exists) return;
        setSkills([...skills, { ...skillInput }]);
        setSkillInput({ skill_name: '', is_required: true, proficiency_level: 'intermediate' });
    };

    const removeSkill = (idx) => setSkills(skills.filter((_, i) => i !== idx));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (skills.length === 0) { setError('Please add at least one skill'); return; }
        setLoading(true);
        setError('');
        try {
            const payload = {
                ...form,
                salary_min: form.salary_min ? parseFloat(form.salary_min) : null,
                salary_max: form.salary_max ? parseFloat(form.salary_max) : null,
                total_positions: parseInt(form.total_positions),
                deadline: form.deadline || null,
                skills,
            };
            const res = await api.post('/api/v1/jobs', payload);
            // Publish job
            await api.post(`/api/v1/jobs/${res.data.id}/publish`);

            onSuccess(res.data.id);
        } catch (err) {
            setError(err.response?.data?.detail || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/80 shadow-[0_8px_32px_rgba(139,92,246,0.05)] overflow-hidden">
            <div className="px-8 py-6 border-b border-white/40"
                style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(192,38,211,0.05))' }}>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center text-white shadow-lg shadow-violet-500/30">
                        <Briefcase size={20} />
                    </div>
                    <div>
                        <h2 className="text-xl font-extrabold text-slate-900 m-0">Job Details</h2>
                        <p className="text-slate-500 text-xs mt-0.5 font-medium">Fill in the position information</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-6">
                {error && (
                    <div className="px-4 py-3 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-xl text-red-600 text-sm font-medium flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-600" /> {error}
                    </div>
                )}

                {/* Row 1 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <label className={labelClass}>Job Title *</label>
                        <input name="title" required value={form.title} onChange={handleChange}
                            placeholder="e.g. Senior Python Developer" className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>Department</label>
                        <input name="department" value={form.department} onChange={handleChange}
                            placeholder="e.g. Engineering" className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>Location</label>
                        <input name="location" value={form.location} onChange={handleChange}
                            placeholder="e.g. Karachi / Remote" className={inputClass} />
                    </div>
                </div>

                {/* Row 2 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className={labelClass}>Job Type</label>
                        <select name="job_type" value={form.job_type} onChange={handleChange} className={inputClass}>
                            <option value="onsite">Onsite</option>
                            <option value="remote">Remote</option>
                            <option value="hybrid">Hybrid</option>
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>Experience Level</label>
                        <select name="experience_level" value={form.experience_level} onChange={handleChange} className={inputClass}>
                            <option value="junior">Junior</option>
                            <option value="mid">Mid</option>
                            <option value="senior">Senior</option>
                            <option value="lead">Lead</option>
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>Total Positions</label>
                        <input name="total_positions" type="number" min="1" value={form.total_positions}
                            onChange={handleChange} className={inputClass} />
                    </div>
                </div>

                {/* Salary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className={labelClass}>Min Salary</label>
                        <input name="salary_min" type="number" value={form.salary_min}
                            onChange={handleChange} placeholder="50000" className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>Max Salary</label>
                        <input name="salary_max" type="number" value={form.salary_max}
                            onChange={handleChange} placeholder="100000" className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>Currency</label>
                        <select name="salary_currency" value={form.salary_currency} onChange={handleChange} className={inputClass}>
                            <option value="PKR">PKR</option>
                            <option value="USD">USD</option>
                            <option value="AED">AED</option>
                        </select>
                    </div>
                </div>

                {/* Deadline + Salary Visible */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className={labelClass}>Application Deadline</label>
                        <input name="deadline" type="datetime-local" value={form.deadline}
                            onChange={handleChange} className={inputClass} />
                    </div>
                    <div className="flex items-end h-full pb-2">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <div className="relative">
                                <input type="checkbox" name="salary_visible" checked={form.salary_visible}
                                    onChange={handleChange} className="sr-only" />
                                <div className={`w-12 h-6 rounded-full transition-colors duration-300 ${form.salary_visible ? 'bg-violet-600' : 'bg-slate-200 group-hover:bg-slate-300'}`} />
                                <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300 ${form.salary_visible ? 'translate-x-6' : ''}`} />
                            </div>
                            <span className="text-sm font-bold text-slate-700">Show salary to candidates</span>
                        </label>
                    </div>
                </div>

                {/* Description */}
                <div>
                    <label className={labelClass}>Job Description *</label>
                    <textarea name="description" required value={form.description} onChange={handleChange}
                        rows={4} placeholder="Describe the role, team, and what the candidate will be working on..."
                        className={inputClass + ' resize-none'} />
                </div>

                <div>
                    <label className={labelClass}>Responsibilities</label>
                    <textarea name="responsibilities" value={form.responsibilities} onChange={handleChange}
                        rows={3} placeholder="Key responsibilities of this role..."
                        className={inputClass + ' resize-none'} />
                </div>

                <div>
                    <label className={labelClass}>Requirements</label>
                    <textarea name="requirements" value={form.requirements} onChange={handleChange}
                        rows={3} placeholder="Required qualifications, experience, education..."
                        className={inputClass + ' resize-none'} />
                </div>

                {/* Skills */}
                <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
                    <label className={labelClass}>Skills Required *</label>

                    {/* Input Row */}
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_140px_auto_auto] gap-3 mb-4 items-center">
                        <input
                            value={skillInput.skill_name}
                            onChange={(e) => setSkillInput({ ...skillInput, skill_name: e.target.value })}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                            placeholder="e.g. Python, React, SQL..."
                            className={inputClass}
                        />
                        <select
                            value={skillInput.proficiency_level}
                            onChange={(e) => setSkillInput({ ...skillInput, proficiency_level: e.target.value })}
                            className={inputClass}>
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="expert">Expert</option>
                        </select>
                        <label className="flex items-center gap-2 text-sm font-bold text-slate-600 whitespace-nowrap cursor-pointer px-2">
                            <input
                                type="checkbox"
                                checked={skillInput.is_required}
                                onChange={(e) => setSkillInput({ ...skillInput, is_required: e.target.checked })}
                                className="accent-violet-600 w-4 h-4 rounded"
                            />
                            Required
                        </label>
                        <button
                            type="button"
                            onClick={addSkill}
                            className="px-5 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-colors cursor-pointer border-none whitespace-nowrap flex items-center gap-2">
                            <Plus size={16} /> Add Skill
                        </button>
                    </div>

                    {/* Skills Tags */}
                    {skills.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-2">
                            {skills.map((skill, idx) => (
                                <div key={idx}
                                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all
            ${skill.is_required
                                            ? 'bg-violet-50 text-violet-700 border border-violet-200'
                                            : 'bg-white text-slate-600 border border-slate-200 shadow-sm'
                                        }`}>
                                    <span>{skill.skill_name}</span>
                                    <span className="opacity-40 font-semibold">• {skill.proficiency_level}</span>
                                    {skill.is_required && <span className="text-violet-400 opacity-80 px-1">req</span>}
                                    <button
                                        type="button"
                                        onClick={() => removeSkill(idx)}
                                        className="opacity-40 hover:opacity-100 hover:text-red-500 hover:bg-red-50 rounded-md w-5 h-5 flex items-center justify-center transition-all bg-transparent border-none cursor-pointer">
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Submit */}
                <div className="flex justify-end pt-4 border-t border-slate-100 mt-2">
                    <button type="submit" disabled={loading}
                        className="flex items-center gap-2 px-8 py-3.5 text-white text-sm font-bold rounded-full transition-all hover:scale-105 disabled:opacity-60 disabled:hover:scale-100 disabled:cursor-not-allowed border-none cursor-pointer shadow-lg shadow-violet-500/30"
                        style={{ background: 'linear-gradient(135deg, #8b5cf6, #c026d3)' }}>
                        {loading ? 'Processing...' : 'Save & Continue'} <ChevronRight size={18} />
                    </button>
                </div>
            </form>
        </div>
    );
}