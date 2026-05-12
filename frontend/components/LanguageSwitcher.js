'use client';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
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
    const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
    const ref = useRef(null);
    const buttonRef = useRef(null);
    const dropdownRef = useRef(null);

    // Initialize: cookie is the source of truth (it's what Google Translate actually uses).
    // localStorage is only a hint and is ignored if it doesn't match a real translation cookie.
    useEffect(() => {
        const cookieLang = getCookie(COOKIE_NAME);
        let initial = 'en';
        if (cookieLang) {
            const parts = cookieLang.split('/').filter(Boolean);
            const target = parts[parts.length - 1];
            if (target) initial = target;
        }
        // Sync localStorage with the cookie-derived value to avoid stale UI state
        localStorage.setItem('site_lang', initial);
        setCurrent(initial);
    }, []);

    // Calculate dropdown position when opening
    useEffect(() => {
        if (open && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            const openUpward = variant === 'floating';
            setDropdownPos({
                top: openUpward ? rect.top - 320 - 8 : rect.bottom + 8,
                left: Math.max(8, rect.right - 208),
            });
        }
    }, [open, variant]);

    // Close on outside click, scroll or resize
    useEffect(() => {
        const handler = (e) => {
            // The dropdown is rendered via createPortal to document.body, so it's NOT inside `ref`.
            // We must also check `dropdownRef` or clicks on language items get treated as "outside"
            // and React unmounts the menu before the click handler can fire.
            const inTrigger = ref.current && ref.current.contains(e.target);
            const inDropdown = dropdownRef.current && dropdownRef.current.contains(e.target);
            if (!inTrigger && !inDropdown) setOpen(false);
        };
        const close = () => setOpen(false);
        document.addEventListener('mousedown', handler);
        window.addEventListener('scroll', close, true);
        window.addEventListener('resize', close);
        return () => {
            document.removeEventListener('mousedown', handler);
            window.removeEventListener('scroll', close, true);
            window.removeEventListener('resize', close);
        };
    }, []);

    const switchTo = (code) => {
        setCurrent(code);
        setOpen(false);
        localStorage.setItem('site_lang', code);

        // Google Translate cookie format MUST be /<source>/<target> where <source>
        // matches pageLanguage configured in GoogleTranslateProvider ('en').
        // Using /auto/<code> causes the widget to silently ignore the cookie.
        if (code === 'en') {
            // Clear translation by setting source = target = en
            setCookie(COOKIE_NAME, '/en/en');
        } else {
            setCookie(COOKIE_NAME, `/en/${code}`);
        }

        // Reload is the most reliable trigger across SPA navigations.
        window.location.reload();
    };

    const active = LANGUAGES.find(l => l.code === current) || LANGUAGES[0];

    const containerClass = variant === 'floating'
        ? 'fixed bottom-6 right-6 z-[9999]'
        : 'relative inline-block z-50';

    const openUpward = variant === 'floating';

    return (
        <>
            <div ref={ref} className={containerClass}>
                <button
                    ref={buttonRef}
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

                {open && typeof document !== 'undefined' && createPortal(
                    <div ref={dropdownRef} className="notranslate fixed w-52 bg-white/95 backdrop-blur-xl border border-[#e8e5df] rounded-2xl shadow-2xl overflow-hidden"
                        style={{ top: dropdownPos.top, left: dropdownPos.left, zIndex: 99999 }}>
                        <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-[#64608a] border-b border-[#e8e5df]">
                            Select Language
                        </div>
                        <ul className="list-none p-1 m-0 max-h-80 overflow-y-auto">
                            {LANGUAGES.map(l => (
                                <li key={l.code}>
                                    <button
                                        onClick={() => switchTo(l.code)}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-medium cursor-pointer transition-colors border-none bg-transparent ${current === l.code ? 'bg-[#FDFCF9] text-[#1C1B2E] font-bold' : 'text-[#1C1B2E] hover:bg-[#FDFCF9]'}`}
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
                                            <span className="w-2 h-2 rounded-full" style={{ background: '#7FA582' }} />
                                        )}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>,
                    document.body
                )}
            </div>
        </>
    );
}
