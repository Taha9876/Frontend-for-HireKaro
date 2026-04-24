'use client';
import { useState, useRef } from 'react';
import api from '@/lib/api';

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
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-8 py-5 border-b border-slate-100"
                style={{ background: 'linear-gradient(135deg, #0a1628, #0f1f3d)' }}>
                <h2 className="text-lg font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
                    📄 Upload Resumes
                </h2>
                <p className="text-white/50 text-xs mt-0.5">Upload all received resumes for this position (PDF only)</p>
            </div>

            <div className="p-8 flex flex-col gap-6">
                {error && (
                    <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                        {error}
                    </div>
                )}

                {uploaded && (
                    <div className="px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-sm font-medium text-center">
                        ✅ Resumes uploaded successfully! Moving to next step...
                    </div>
                )}

                {/* Drop Zone */}
                <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
                    onClick={() => inputRef.current.click()}
                    className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all
            ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'}`}>
                    <input ref={inputRef} type="file" accept=".pdf" multiple className="hidden"
                        onChange={(e) => handleFiles(e.target.files)} />
                    <div className="text-5xl mb-3">📁</div>
                    <p className="text-base font-semibold text-[#0a1628] mb-1">
                        Drop PDF files here or click to browse
                    </p>
                    <p className="text-sm text-slate-400">Supports multiple files • PDF only • Max 5MB each</p>
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
                                className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl border border-slate-200">
                                <div className="w-9 h-9 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center text-sm flex-shrink-0">
                                    📄
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-[#0a1628] truncate">{file.name}</p>
                                    <p className="text-xs text-slate-400">{formatSize(file.size)}</p>
                                </div>
                                <button onClick={() => removeFile(idx)}
                                    className="text-slate-300 hover:text-red-500 text-xl bg-transparent border-none cursor-pointer transition-colors leading-none">
                                    ×
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
                        className="px-8 py-3 text-white font-semibold rounded-xl transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed border-none cursor-pointer"
                        style={{ background: 'linear-gradient(135deg, #2563eb, #1e40af)', boxShadow: '0 3px 16px rgba(37,99,235,0.35)' }}>
                        {uploading ? 'Uploading...' : uploaded ? '✓ Uploaded!' : `Upload ${files.length > 0 ? files.length : ''} Resume${files.length > 1 ? 's' : ''} →`}
                    </button>
                </div>
            </div>
        </div>
    );
}