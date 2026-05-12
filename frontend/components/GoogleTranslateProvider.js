'use client';
import { useEffect } from 'react';

// Languages supported by the LanguageSwitcher dropdown
const INCLUDED_LANGUAGES = 'en,fr,de,es,lv,ar,ja';
const COOKIE_NAME = 'googtrans';

function readTargetLangFromCookie() {
    if (typeof document === 'undefined') return null;
    const m = document.cookie.match(new RegExp('(^| )' + COOKIE_NAME + '=([^;]+)'));
    if (!m) return null;
    const value = decodeURIComponent(m[2]); // e.g. /auto/lv
    const parts = value.split('/').filter(Boolean);
    return parts[parts.length - 1] || null;
}

function forceTranslate(target) {
    if (!target || target === 'en') return false;
    const select = document.querySelector('.goog-te-combo');
    if (!select) return false;
    if (select.value === target) {
        // Already set; dispatch change anyway to re-apply on dynamic content
        select.dispatchEvent(new Event('change'));
        return true;
    }
    select.value = target;
    select.dispatchEvent(new Event('change'));
    return true;
}

export default function GoogleTranslateProvider() {
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const log = (...args) => console.log('[GTranslate]', ...args);

        const applyFromCookie = () => {
            const target = readTargetLangFromCookie();
            log('applyFromCookie target =', target);
            if (!target || target === 'en') return;
            // Poll for the .goog-te-combo to appear (widget injects it asynchronously)
            let attempts = 0;
            const maxAttempts = 80; // ~8s
            const interval = setInterval(() => {
                attempts++;
                const ok = forceTranslate(target);
                if (ok) {
                    log('translation triggered after', attempts, 'attempts');
                    clearInterval(interval);
                } else if (attempts >= maxAttempts) {
                    log('gave up waiting for .goog-te-combo after', attempts, 'attempts. Widget likely failed to load.');
                    clearInterval(interval);
                }
            }, 100);
        };

        // Always (re)define the init callback. HMR-safe because we re-bind on every mount.
        window.googleTranslateElementInit = () => {
            try {
                if (!window.google || !window.google.translate || !window.google.translate.TranslateElement) {
                    log('init: google.translate not available');
                    return;
                }
                log('init: creating TranslateElement');
                new window.google.translate.TranslateElement(
                    {
                        pageLanguage: 'en',
                        includedLanguages: INCLUDED_LANGUAGES,
                        autoDisplay: false,
                        layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
                    },
                    'google_translate_element'
                );
                applyFromCookie();
            } catch (err) {
                console.warn('[GTranslate] init failed:', err);
            }
        };

        // If the widget is already loaded (e.g. HMR), just re-apply translation.
        if (window.google && window.google.translate && window.google.translate.TranslateElement) {
            log('widget already loaded, re-applying');
            applyFromCookie();
            return;
        }

        // Inject the script if not already present
        const existing = document.querySelector('script[data-gtranslate]');
        if (!existing) {
            log('injecting script');
            const script = document.createElement('script');
            script.src = 'https://translate.googleapis.com/translate_a/element.js?cb=googleTranslateElementInit';
            script.async = true;
            script.setAttribute('data-gtranslate', '1');
            script.onerror = () => {
                console.warn('[GTranslate] primary host failed, trying fallback');
                const fallback = document.createElement('script');
                fallback.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
                fallback.async = true;
                fallback.setAttribute('data-gtranslate', '1');
                fallback.onerror = () => console.warn('[GTranslate] fallback host also failed. Likely blocked by network/ad-blocker.');
                document.body.appendChild(fallback);
            };
            document.body.appendChild(script);
        } else {
            log('script already present, applying from cookie');
            applyFromCookie();
        }
    }, []);

    // Visible but tiny / unobtrusive host element. Google Translate sometimes refuses
    // to initialize into elements with zero dimensions or display:none, so keep it in flow
    // but visually hidden via clipping.
    return (
        <div
            id="google_translate_element"
            aria-hidden="true"
            style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                width: 1,
                height: 1,
                overflow: 'hidden',
                opacity: 0,
                pointerEvents: 'none',
                zIndex: -1,
            }}
        />
    );
}
