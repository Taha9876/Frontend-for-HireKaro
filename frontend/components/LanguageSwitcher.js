'use client';
import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Globe } from 'lucide-react';

const LANGUAGES = [
    { code: 'en', name: 'English',  country: 'gb' },
    { code: 'fr', name: 'French',   country: 'fr' },
    { code: 'de', name: 'German',   country: 'de' },
    { code: 'es', name: 'Spanish',  country: 'es' },
    { code: 'lv', name: 'Latvian',  country: 'lv' },
    { code: 'ar', name: 'Arabic',   country: 'sa' },
    { code: 'ja', name: 'Japanese', country: 'jp' },
];

const flagUrl = (country, size = 40) => `https://flagcdn.com/w${size}/${country}.png`;
const flagUrl2x = (country, size = 40) => `https://flagcdn.com/w${size * 2}/${country}.png 2x`;

const COOKIE_NAME = 'googtrans';

function setCookie(name, value) {
    // Set on current host and parent domain so Google Translate picks it up
    document.cookie = `${name}=${value}; path=/`;
    const host = window.location.hostname;
    if (host && host !== 'localhost') {
        document.cookie = `${name}=${value}; path=/; domain=.${host}`;
        const parts = host.split('.');
        if (parts.length > 1) {
            const parent = parts.slice(-2).join('.');
            document.cookie = `${name}=${value}; path=/; domain=.${parent}`;
        }
    }
}

function getCookie(name) {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
}

export default function LanguageSwitcher({ variant = 'inline' }) {
    const [open, setOpen] = useState(false);
    const [current, setCurrent] = useState('en');
    const ref = useRef(null);

    // Initialize: load saved lang & inject Google Translate script
    useEffect(() => {
        const saved = localStorage.getItem('site_lang');
        const cookieLang = getCookie(COOKIE_NAME);
        const initial = saved || (cookieLang ? cookieLang.split('/').pop() : 'en') || 'en';
        setCurrent(initial);

        if (window.__gtInjected) return;
        window.__gtInjected = true;

        window.googleTranslateElementInit = () => {
            new window.google.translate.TranslateElement(
                {
                    pageLanguage: 'en',
                    includedLanguages: LANGUAGES.map(l => l.code).join(','),
                    autoDisplay: false,
                    layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
                },
                'google_translate_hidden'
            );
        };

        const script = document.createElement('script');
        script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        script.async = true;
        document.body.appendChild(script);
    }, []);

    // Close on outside click
    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const switchTo = (code) => {
        setCurrent(code);
        setOpen(false);
        localStorage.setItem('site_lang', code);

        if (code === 'en') {
            setCookie(COOKIE_NAME, '/en/en');
        } else {
            setCookie(COOKIE_NAME, `/en/${code}`);
        }
        // Reload so Google Translate applies the new language globally
        window.location.reload();
    };

    const active = LANGUAGES.find(l => l.code === current) || LANGUAGES[0];

    const containerClass = variant === 'floating'
        ? 'fixed bottom-6 right-6 z-[9999]'
        : 'relative inline-block';

    const openUpward = variant === 'floating' || variant === 'floating-inline';

    return (
        <>
            {/* Hidden Google Translate host element */}
            <div id="google_translate_hidden" style={{ display: 'none' }} />

            <div ref={ref} className={containerClass}>
                <button
                    onClick={() => setOpen(o => !o)}
                    className="notranslate flex items-center gap-2 px-3 py-2 rounded-full bg-white/90 backdrop-blur-xl border border-gray-200 hover:border-purple-300 hover:shadow-md hover:shadow-purple-500/10 transition-all cursor-pointer text-sm font-semibold text-gray-700"
                    aria-label="Change language"
                >
                    <img
                        src={flagUrl(active.country, 40)}
                        srcSet={flagUrl2x(active.country, 40)}
                        alt={active.name}
                        width={22}
                        height={16}
                        className="rounded-sm shadow-sm object-cover"
                        style={{ width: 22, height: 16 }}
                    />
                    <span className="hidden sm:inline text-xs font-bold uppercase tracking-wider">{active.code}</span>
                    <ChevronDown size={14} className={`text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} />
                </button>

                {open && (
                    <div className={`notranslate absolute ${openUpward ? 'bottom-full mb-2 right-0' : 'top-full mt-2 right-0'} w-52 bg-white/95 backdrop-blur-xl border border-violet-200 rounded-2xl shadow-2xl shadow-violet-500/20 overflow-hidden z-[9999]`}>
                        <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                            Select Language
                        </div>
                        <ul className="list-none p-1 m-0 max-h-80 overflow-y-auto">
                            {LANGUAGES.map(l => (
                                <li key={l.code}>
                                    <button
                                        onClick={() => switchTo(l.code)}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-medium cursor-pointer transition-colors border-none bg-transparent ${current === l.code ? 'bg-gradient-to-r from-violet-50 to-pink-50 text-violet-700' : 'text-slate-700 hover:bg-slate-50'}`}
                                    >
                                        <img
                                            src={flagUrl(l.country, 40)}
                                            srcSet={flagUrl2x(l.country, 40)}
                                            alt={l.name}
                                            width={26}
                                            height={19}
                                            className="rounded shadow-sm object-cover flex-shrink-0"
                                            style={{ width: 26, height: 19 }}
                                        />
                                        <span className="flex-1">{l.name}</span>
                                        {current === l.code && (
                                            <span className="w-2 h-2 rounded-full bg-gradient-to-br from-violet-500 to-pink-500" />
                                        )}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </>
    );
}
