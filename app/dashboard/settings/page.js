'use client';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import api from '@/lib/api';
import {
    User, Mail, Building2, Users2, Calendar, Shield,
    Save, Loader2, CheckCircle, Camera, Briefcase
} from 'lucide-react';

export default function SettingsPage() {
    const pageRef = useRef(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [form, setForm] = useState({ company_name: '', industry: '', company_size: '' });

    useEffect(() => {
        fetchProfile();
    }, []);

    useEffect(() => {
        if (!pageRef.current || loading) return;
        const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
        tl.fromTo('.dash-orb', { opacity: 0, scale: 0.5 }, { opacity: 0.25, scale: 1, duration: 2.5, stagger: 0.3 }, 0);
        tl.fromTo('.page-header', { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 1 }, 0.1);
        tl.fromTo('.profile-card', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8 }, 0.3);
        tl.fromTo('.detail-card', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.1 }, 0.5);
        return () => tl.kill();
    }, [loading]);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/api/v1/auth/profile');
            setProfile(res.data);
            setForm({
                company_name: res.data.company_name || '',
                industry: res.data.industry || '',
                company_size: res.data.company_size || '',
            });
        } catch (err) {
            console.error('Failed to fetch profile:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setSaved(false);
        try {
            const res = await api.put('/api/v1/auth/profile', form);
            setProfile(res.data);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            console.error('Failed to save profile:', err);
        } finally {
            setSaving(false);
        }
    };

    const getInitials = (name) => {
        if (!name) return 'AB';
        return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FBF8F2' }}>
                <div style={{ width: 40, height: 40, border: '4px solid #7FA582', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div ref={pageRef} className="min-h-screen p-4 sm:p-6 lg:p-8 bg-[#FBF8F2] relative overflow-hidden">
            {/* Background Orbs */}
            <div className="dash-orb" style={{ position: 'absolute', top: '-10%', left: '-5%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(127, 165, 130,0.15) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%', zIndex: 0, filter: 'blur(60px)' }} />
            <div className="dash-orb" style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(244,162,140,0.18) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%', zIndex: 0, filter: 'blur(80px)' }} />

            <div style={{ maxWidth: 900, margin: '0 auto', position: 'relative', zIndex: 1 }}>

                {/* Header */}
                <div className="page-header flex flex-col sm:flex-row sm:items-center gap-4 p-5 sm:p-6 mb-8 bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_8px_32px_rgba(127, 165, 130,0.05)] rounded-3xl">
                    <div style={{ width: 56, height: 56, borderRadius: 18, background: 'linear-gradient(135deg, #7FA582, #9DBF9E)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 8px 24px rgba(127, 165, 130,0.3)', flexShrink: 0 }}>
                        <User size={28} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.5px', fontFamily: 'Syne, sans-serif' }}>My Profile</h1>
                        <p style={{ fontSize: 14, color: '#64608a', margin: '4px 0 0', fontWeight: 500 }}>Manage your company profile and account details</p>
                    </div>
                </div>

                {/* Profile Hero Card */}
                <div className="profile-card" style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(20px)', borderRadius: 24, border: '1px solid rgba(255,255,255,0.8)', boxShadow: '0 8px 32px rgba(127, 165, 130,0.05)', overflow: 'hidden', marginBottom: 28 }}>
                    {/* Full Banner with content inside */}
                    <div style={{ padding: '32px 24px sm:40px 36px', background: 'linear-gradient(135deg, #1C1B2E, #7FA582, #F4A28C, #E88A72)', position: 'relative' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")', opacity: 0.5 }} />
                        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
                            <div style={{ position: 'relative', flexShrink: 0 }}>
                                <div style={{ width: 88, height: 88, borderRadius: 22, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 32, fontWeight: 800, fontFamily: 'Syne, sans-serif', border: '3px solid rgba(255,255,255,0.4)', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
                                    {getInitials(profile?.company_name)}
                                </div>
                                <div style={{ position: 'absolute', bottom: -4, right: -4, width: 28, height: 28, borderRadius: 8, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', cursor: 'pointer', color: '#7FA582' }}>
                                    <Camera size={14} />
                                </div>
                            </div>
                            <div style={{ flex: 1, minWidth: 200 }}>
                                <h2 style={{ fontSize: 26, fontWeight: 800, color: '#fff', margin: 0, fontFamily: 'Syne, sans-serif', letterSpacing: '-0.5px' }}>{profile?.company_name || 'Company'}</h2>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 10 }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>
                                        <Mail size={14} /> {profile?.email}
                                    </span>
                                    {profile?.industry && (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>
                                            <Briefcase size={14} /> {profile.industry}
                                        </span>
                                    )}
                                    {profile?.company_size && (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>
                                            <Users2 size={14} /> {profile.company_size}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 12, background: profile?.is_verified ? 'rgba(255,255,255,0.2)' : 'rgba(239,68,68,0.3)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.3)' }}>
                                <Shield size={16} style={{ color: '#fff' }} />
                                <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>
                                    {profile?.is_verified ? 'Verified' : 'Unverified'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info Cards Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 28 }}>
                    {[
                        { label: 'Account ID', value: `#${profile?.id || '—'}`, icon: <Shield size={20} />, color: '#7FA582' },
                        { label: 'Member Since', value: formatDate(profile?.created_at), icon: <Calendar size={20} />, color: '#F4A28C' },
                        { label: 'Industry', value: profile?.industry || 'Not set', icon: <Building2 size={20} />, color: '#1C1B2E' },
                        { label: 'Team Size', value: profile?.company_size || 'Not set', icon: <Users2 size={20} />, color: '#E88A72' },
                    ].map((item) => (
                        <div key={item.label} className="detail-card" style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(20px)', borderRadius: 20, padding: '20px', border: '1px solid rgba(255,255,255,0.8)', boxShadow: '0 4px 16px rgba(127, 165, 130,0.04)' }}>
                            <div style={{ width: 40, height: 40, borderRadius: 12, background: `${item.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color, marginBottom: 12 }}>
                                {item.icon}
                            </div>
                            <p style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px' }}>{item.label}</p>
                            <p style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>{item.value}</p>
                        </div>
                    ))}
                </div>

                {/* Edit Form */}
                <div className="detail-card" style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(20px)', borderRadius: 24, border: '1px solid rgba(255,255,255,0.8)', boxShadow: '0 8px 32px rgba(127, 165, 130,0.05)', overflow: 'hidden' }}>
                    <div style={{ padding: '24px 32px', borderBottom: '1px solid rgba(127, 165, 130,0.08)' }}>
                        <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0, fontFamily: 'Syne, sans-serif' }}>Edit Profile</h3>
                        <p style={{ fontSize: 13, color: '#64608a', margin: '4px 0 0', fontWeight: 500 }}>Update your company information</p>
                    </div>

                    <div style={{ padding: '24px sm:32px', display: 'flex', flexDirection: 'column', gap: 24 }}>
                        {/* Company Name */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <label style={{ fontSize: 12, fontWeight: 800, color: '#64608a', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Company Name</label>
                            <div style={{ position: 'relative' }}>
                                <Building2 size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#BBD4A6' }} />
                                <input
                                    type="text"
                                    value={form.company_name}
                                    onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                                    style={{ width: '100%', padding: '14px 16px 14px 48px', background: 'rgba(255,255,255,0.8)', border: '2px solid rgba(127, 165, 130,0.12)', borderRadius: 16, fontSize: 15, fontWeight: 600, color: '#0f172a', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' }}
                                    onFocus={e => e.target.style.borderColor = '#7FA582'}
                                    onBlur={e => e.target.style.borderColor = 'rgba(127, 165, 130,0.12)'}
                                />
                            </div>
                        </div>

                        {/* Two Column Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* Industry */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <label style={{ fontSize: 12, fontWeight: 800, color: '#64608a', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Industry</label>
                                <div style={{ position: 'relative' }}>
                                    <Briefcase size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#BBD4A6' }} />
                                    <input
                                        type="text"
                                        value={form.industry}
                                        onChange={(e) => setForm({ ...form, industry: e.target.value })}
                                        placeholder="e.g. Technology, Healthcare"
                                        style={{ width: '100%', padding: '14px 16px 14px 48px', background: 'rgba(255,255,255,0.8)', border: '2px solid rgba(127, 165, 130,0.12)', borderRadius: 16, fontSize: 15, fontWeight: 600, color: '#0f172a', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' }}
                                        onFocus={e => e.target.style.borderColor = '#7FA582'}
                                        onBlur={e => e.target.style.borderColor = 'rgba(127, 165, 130,0.12)'}
                                    />
                                </div>
                            </div>

                            {/* Company Size */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <label style={{ fontSize: 12, fontWeight: 800, color: '#64608a', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Company Size</label>
                                <div style={{ position: 'relative' }}>
                                    <Users2 size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#BBD4A6', zIndex: 1 }} />
                                    <select
                                        value={form.company_size}
                                        onChange={(e) => setForm({ ...form, company_size: e.target.value })}
                                        style={{ width: '100%', padding: '14px 16px 14px 48px', background: 'rgba(255,255,255,0.8)', border: '2px solid rgba(127, 165, 130,0.12)', borderRadius: 16, fontSize: 15, fontWeight: 600, color: '#0f172a', outline: 'none', transition: 'border-color 0.2s', appearance: 'none', cursor: 'pointer', boxSizing: 'border-box' }}
                                        onFocus={e => e.target.style.borderColor = '#7FA582'}
                                        onBlur={e => e.target.style.borderColor = 'rgba(127, 165, 130,0.12)'}
                                    >
                                        <option value="">Select size</option>
                                        <option value="1-10">1-10 employees</option>
                                        <option value="11-50">11-50 employees</option>
                                        <option value="51-200">51-200 employees</option>
                                        <option value="201-500">201-500 employees</option>
                                        <option value="501-1000">501-1000 employees</option>
                                        <option value="1000+">1000+ employees</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Email (read-only) */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <label style={{ fontSize: 12, fontWeight: 800, color: '#64608a', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#BBD4A6' }} />
                                <input
                                    type="email"
                                    value={profile?.email || ''}
                                    readOnly
                                    style={{ width: '100%', padding: '14px 16px 14px 48px', background: 'rgba(127, 165, 130,0.04)', border: '2px solid rgba(127, 165, 130,0.08)', borderRadius: 16, fontSize: 15, fontWeight: 600, color: '#94a3b8', cursor: 'not-allowed', boxSizing: 'border-box' }}
                                />
                            </div>
                            <p style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500, margin: 0 }}>Email cannot be changed. Contact support for assistance.</p>
                        </div>

                        {/* Save Button Row */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 16, paddingTop: 16, borderTop: '1px solid rgba(127, 165, 130,0.08)', marginTop: 8 }}>
                            {saved && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 700, color: '#10b981' }}>
                                    <CheckCircle size={18} /> Profile updated successfully
                                </span>
                            )}
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 32px', background: 'linear-gradient(135deg, #7FA582, #9DBF9E)', color: '#fff', fontWeight: 800, fontSize: 15, border: 'none', borderRadius: 16, cursor: saving ? 'wait' : 'pointer', boxShadow: '0 8px 24px rgba(127, 165, 130,0.3)', transition: 'all 0.3s', opacity: saving ? 0.7 : 1 }}
                            >
                                {saving ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Saving...</> : <><Save size={18} /> Save Changes</>}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}