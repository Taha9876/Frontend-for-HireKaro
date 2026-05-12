// app/dashboard/jobs/[id]/edit/page.js
'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import gsap from 'gsap';
import api from '@/lib/api';
import { Briefcase, Plus, ChevronRight, ArrowLeft, Save } from 'lucide-react';

const inputClass = "w-full px-3.5 py-2.5 text-sm text-gray-900 bg-white/60 backdrop-blur-sm border border-white/40 rounded-xl outline-none transition-all focus:border-purple-500 focus:bg-white focus:shadow-[0_0_0_3px_rgba(127, 165, 130,0.1)]";
const labelClass = "block text-xs font-semibold text-gray-600 mb-1.5";

export default function EditJobPage() {
    const { id } = useParams();
    const router = useRouter();
    const pageRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [form, setForm] = useState({
        title: '', department: '', location: '',
        job_type: 'onsite', experience_level: 'mid',
        salary_min: '', salary_max: '', salary_currency: 'PKR', salary_visible: false,
        description: '', responsibilities: '', requirements: '',
        total_positions: 1, deadline: '',
    });

    const [skills, setSkills] = useState([]);
    const [skillInput, setSkillInput] = useState({ skill_name: '', is_required: true, proficiency_level: 'intermediate' });

    useEffect(() => {
        const fetchJob = async () => {
            try {
                const res = await api.get(`/api/v1/jobs/${id}`);
                const job = res.data;
                setForm({
                    title: job.title || '',
                    department: job.department || '',
                    location: job.location || '',
                    job_type: job.job_type || 'onsite',
                    experience_level: job.experience_level || 'mid',
                    salary_min: job.salary_min || '',
                    salary_max: job.salary_max || '',
                    salary_currency: job.salary_currency || 'PKR',
                    salary_visible: job.salary_visible || false,
                    description: job.description || '',
                    responsibilities: job.responsibilities || '',
                    requirements: job.requirements || '',
                    total_positions: job.total_positions || 1,
                    deadline: job.deadline ? job.deadline.slice(0, 16) : '',
                });
                setSkills(job.skills || []);
            } catch (err) {
                setError('Failed to load job details');
            } finally {
                setLoading(false);
            }
        };
        fetchJob();
    }, [id]);

    useEffect(() => {
        if (loading || !pageRef.current) return;
        const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
        tl.fromTo('.edit-header', { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.8 }, 0.1);
        tl.fromTo('.edit-form', { opacity: 0, y: 30, scale: 0.98 }, { opacity: 1, y: 0, scale: 1, duration: 0.8 }, 0.3);
        return () => tl.kill();
    }, [loading]);

    const handleChange = (e) => {
        const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setForm({ ...form, [e.target.name]: val });
        setError('');
        setSuccess('');
    };

    const addSkill = async () => {
        if (!skillInput.skill_name.trim()) return;
        const exists = skills.find(s => s.skill_name.toLowerCase() === skillInput.skill_name.toLowerCase());
        if (exists) return;
        try {
            const res = await api.post(`/api/v1/jobs/${id}/skills`, skillInput);
            setSkills([...skills, res.data]);
            setSkillInput({ skill_name: '', is_required: true, proficiency_level: 'intermediate' });
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to add skill');
        }
    };

    const removeSkill = async (skillId) => {
        try {
            await api.delete(`/api/v1/jobs/${id}/skills/${skillId}`);
            setSkills(skills.filter(s => s.id !== skillId));
        } catch (err) {
            setError('Failed to remove skill');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');
        try {
            const payload = {
                title: form.title,
                department: form.department || null,
                location: form.location || null,
                job_type: form.job_type,
                experience_level: form.experience_level,
                salary_min: form.salary_min ? parseFloat(form.salary_min) : null,
                salary_max: form.salary_max ? parseFloat(form.salary_max) : null,
                salary_currency: form.salary_currency,
                salary_visible: form.salary_visible,
                description: form.description,
                responsibilities: form.responsibilities || null,
                requirements: form.requirements || null,
                total_positions: parseInt(form.total_positions),
                deadline: form.deadline || null,
            };
            await api.patch(`/api/v1/jobs/${id}`, payload);
            setSuccess('Job updated successfully!');
            setTimeout(() => router.push(`/dashboard/jobs/${id}`), 1200);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to update job');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-screen" style={{ background: '#FBF8F2' }}>
            <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div ref={pageRef} className="min-h-screen relative overflow-hidden" style={{ background: '#FBF8F2' }}>
            {/* Background Orbs */}
            <div className="pointer-events-none absolute inset-0 z-0">
                <div className="absolute w-[500px] h-[500px] top-[-10%] right-[-5%] rounded-full bg-gradient-to-br from-[#9DBF9E]/25 to-[#F4A28C]/20 blur-3xl" />
                <div className="absolute w-[400px] h-[400px] bottom-[10%] left-[-10%] rounded-full bg-gradient-to-br from-violet-400/20 to-purple-400/20 blur-3xl" />
            </div>

            <div className="relative z-10 p-6 lg:p-10 max-w-4xl mx-auto">
                {/* Header */}
                <div className="edit-header mb-8">
                    <button onClick={() => router.push(`/dashboard/jobs/${id}`)}
                        className="flex items-center gap-2 text-sm text-gray-500 hover:text-purple-600 transition-colors bg-transparent border-none cursor-pointer mb-4">
                        <ArrowLeft size={16} /> Back to Job Details
                    </button>
                    <div className="flex items-center gap-4 p-6 rounded-3xl backdrop-blur-md bg-white/50 border border-white/40 shadow-lg">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
                            <Briefcase size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-extrabold text-gray-900 m-0 tracking-tight">Edit Job</h1>
                            <p className="text-gray-500 text-sm mt-1 font-medium">Update the job posting details</p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div className="edit-form backdrop-blur-md bg-white/50 rounded-3xl border border-white/40 shadow-xl overflow-hidden">
                    <div className="px-8 py-6 border-b border-purple-100/50"
                        style={{ background: 'linear-gradient(135deg, rgba(127, 165, 130,0.08), rgba(244, 162, 140,0.05))' }}>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
                                <Briefcase size={20} />
                            </div>
                            <div>
                                <h2 className="text-xl font-extrabold text-gray-900 m-0">Job Details</h2>
                                <p className="text-gray-500 text-xs mt-0.5 font-medium">Update the position information</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-6">
                        {error && (
                            <div className="px-4 py-3 backdrop-blur-md bg-red-50/80 border border-red-200 rounded-xl text-red-600 text-sm font-medium flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-600" /> {error}
                            </div>
                        )}
                        {success && (
                            <div className="px-4 py-3 backdrop-blur-md bg-emerald-50/80 border border-emerald-200 rounded-xl text-emerald-600 text-sm font-medium flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" /> {success}
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
                                        <div className={`w-12 h-6 rounded-full transition-colors duration-300 ${form.salary_visible ? 'bg-purple-600' : 'bg-gray-200 group-hover:bg-gray-300'}`} />
                                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300 ${form.salary_visible ? 'translate-x-6' : ''}`} />
                                    </div>
                                    <span className="text-sm font-bold text-gray-700">Show salary to candidates</span>
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
                        <div className="backdrop-blur-sm bg-purple-50/30 p-5 rounded-2xl border border-purple-100/50">
                            <label className={labelClass}>Skills</label>

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
                                <label className="flex items-center gap-2 text-sm font-bold text-gray-600 whitespace-nowrap cursor-pointer px-2">
                                    <input
                                        type="checkbox"
                                        checked={skillInput.is_required}
                                        onChange={(e) => setSkillInput({ ...skillInput, is_required: e.target.checked })}
                                        className="accent-purple-600 w-4 h-4 rounded"
                                    />
                                    Required
                                </label>
                                <button
                                    type="button"
                                    onClick={addSkill}
                                    className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold rounded-xl hover:opacity-90 transition-all cursor-pointer border-none whitespace-nowrap flex items-center gap-2 shadow-lg shadow-purple-500/25">
                                    <Plus size={16} /> Add
                                </button>
                            </div>

                            {/* Skills Tags */}
                            {skills.length > 0 && (
                                <div className="flex flex-wrap gap-2 pt-2">
                                    {skills.map((skill) => (
                                        <div key={skill.id}
                                            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all
                                                ${skill.is_required
                                                    ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                                    : 'bg-white text-gray-600 border border-gray-200 shadow-sm'
                                                }`}>
                                            <span>{skill.skill_name}</span>
                                            <span className="opacity-40 font-semibold">• {skill.proficiency_level}</span>
                                            {skill.is_required && <span className="text-purple-400 opacity-80 px-1">req</span>}
                                            <button
                                                type="button"
                                                onClick={() => removeSkill(skill.id)}
                                                className="opacity-40 hover:opacity-100 hover:text-red-500 hover:bg-red-50 rounded-md w-5 h-5 flex items-center justify-center transition-all bg-transparent border-none cursor-pointer">
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Submit */}
                        <div className="flex justify-between items-center pt-4 border-t border-purple-100/50 mt-2">
                            <button type="button" onClick={() => router.push(`/dashboard/jobs/${id}`)}
                                className="px-6 py-3 text-sm font-semibold text-gray-500 hover:text-gray-700 bg-transparent border border-gray-200 rounded-full cursor-pointer transition-all hover:border-gray-300">
                                Cancel
                            </button>
                            <button type="submit" disabled={saving}
                                className="flex items-center gap-2 px-8 py-3.5 text-white text-sm font-bold rounded-full transition-all hover:scale-105 disabled:opacity-60 disabled:hover:scale-100 disabled:cursor-not-allowed border-none cursor-pointer shadow-lg shadow-purple-500/30"
                                style={{ background: 'linear-gradient(135deg, #7FA582, #9DBF9E)' }}>
                                <Save size={18} /> {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
