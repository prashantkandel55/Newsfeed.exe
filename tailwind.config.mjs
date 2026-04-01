/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                base: 'var(--bg-base)',
                surface: 'var(--bg-surface)',
                elevated: 'var(--bg-elevated)',
                overlay: 'var(--bg-overlay)',
                'border-subtle': 'var(--border-subtle)',
                'border-default': 'var(--border-default)',
                'border-strong': 'var(--border-strong)',
                'text-primary': 'var(--text-primary)',
                'text-secondary': 'var(--text-secondary)',
                'text-muted': 'var(--text-muted)',
                'accent-primary': 'var(--accent-primary)',
                'accent-glow': 'var(--accent-glow)'
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                serif: ['"Instrument Serif"', 'serif'],
                mono: ['"DM Mono"', 'monospace'],
            },
            keyframes: {
                marquee: {
                    '0%': { transform: 'translateX(100%)' },
                    '100%': { transform: 'translateX(-100%)' },
                }
            },
            animation: {
                'marquee': 'marquee 30s linear infinite',
            }
        },
    },
    plugins: [],
}
