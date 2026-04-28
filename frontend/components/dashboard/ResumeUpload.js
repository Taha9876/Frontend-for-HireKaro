'use client';
import { useState, useRef } from 'react';
import api from '@/lib/api';
import { UploadCloud, FileText, CheckCircle, X, FileUp } from 'lucide-react';

export default function ResumeUpload({ jobId, onSuccess }) {
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploaded, setUploaded] = useState(false);
    const [error, setError] = useState('');
    const [dragOver, setDragOver] = useState(false);
    const inputRef = useRef();

    const handleFiles = (newFiles) => {
        const pdfs = Array.from(newFiles).filter(f => f.type === 'application/pdf');
        if (pdfs.length !== newFiles.length) setError('Only PDF files are allowed');
        else setError('');
        setFiles(prev => {
            const existing = prev.map(f => f.name);
            const unique = pdfs.filter(f => !existing.includes(f.name));
            return [...prev, ...unique];
        });
    };

    const removeFile = (idx) => setFiles(files.filter((_, i) => i !== idx));

    const formatSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const handleUpload = async () => {
        if (files.length === 0) { setError('Please select at least one resume'); return; }
        setUploading(true);
        setError('');
        try {
            const formData = new FormData();
            files.forEach(f => formData.append('files', f));
            await api.post(`/api/v1/jobs/${jobId}/resumes`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            // ← Question generation trigger karo background mein
            await api.post(`/api/v1/jobs/${jobId}/questions/generate`);
            setUploaded(true);
            setTimeout(() => onSuccess(), 1000);
        } catch (err) {
            setError(err.response?.data?.detail || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="backdrop-blur-xl bg-white/70 rounded-3xl border border-white/80 shadow-[0_8px_32px_rgba(139,92,246,0.05)] overflow-hidden">
            <div className="px-8 py-6 border-b border-white/40"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #9333ea, #c026d3)' }}>
                <h2 className="text-xl font-extrabold text-white flex items-center gap-2" style={{ fontFamily: 'Syne, sans-serif' }}>
                    <FileUp size={24} /> Upload Resumes
                </h2>
                <p className="text-white/80 text-sm mt-1">Upload all received resumes for this position (PDF only)</p>
            </div>

            <div className="p-8 flex flex-col gap-6">
                {error && (
                    <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                        {error}
                    </div>
                )}

                {uploaded && (
                    <div className="px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm font-semibold flex justify-center items-center gap-2">
                        <CheckCircle size={18} /> Resumes uploaded successfully! Moving to next step...
                    </div>
                )}

                {/* Drop Zone */}
                <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
                    onClick={() => inputRef.current.click()}
                    className={`border-2 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-all
            ${dragOver ? 'border-purple-500 bg-purple-50/50' : 'border-purple-200/50 hover:border-purple-400 hover:bg-purple-50/30'}`}>
                    <input ref={inputRef} type="file" accept=".pdf" multiple className="hidden"
                        onChange={(e) => handleFiles(e.target.files)} />
                    <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mb-4 shadow-inner">
                        <UploadCloud size={32} />
                    </div>
                    <p className="text-lg font-bold text-[#0a1628] mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>
                        Drop PDF files here or click to browse
                    </p>
                    <p className="text-sm text-slate-500 font-medium">Supports multiple files • PDF only • Max 5MB each</p>
                </div>

                {/* File Preview */}
                {files.length > 0 && (
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-semibold text-slate-700">
                                {files.length} file{files.length > 1 ? 's' : ''} selected
                            </p>
                            <button onClick={() => setFiles([])}
                                className="text-xs text-red-400 hover:text-red-600 bg-transparent border-none cursor-pointer">
                                Clear all
                            </button>
                        </div>
                        {files.map((file, idx) => (
                            <div key={idx}
                                className="flex items-center gap-3 px-4 py-3 bg-white/80 rounded-2xl border border-white shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 flex-shrink-0">
                                    <FileText size={18} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-[#0a1628] truncate">{file.name}</p>
                                    <p className="text-xs text-slate-500 font-medium">{formatSize(file.size)}</p>
                                </div>
                                <button onClick={() => removeFile(idx)}
                                    className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 border-none cursor-pointer transition-all">
                                    <X size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Upload Button */}
                <div className="flex justify-between items-center pt-2">
                    <p className="text-xs text-slate-400">
                        {files.length > 0 ? `${files.length} resume${files.length > 1 ? 's' : ''} ready to upload` : 'No files selected'}
                    </p>
                    <button onClick={handleUpload}
                        disabled={uploading || uploaded || files.length === 0}
                        className="px-8 py-3 text-white font-bold rounded-xl transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed border-none cursor-pointer"
                        style={{ background: 'linear-gradient(135deg, #9333ea, #db2777)', boxShadow: '0 4px 20px rgba(219,39,119,0.3)' }}>
                        {uploading ? 'Uploading...' : uploaded ? '✓ Uploaded!' : `Upload ${files.length > 0 ? files.length : ''} Resume${files.length > 1 ? 's' : ''} →`}
                    </button>
                </div>
            </div>
        </div>
    );
}