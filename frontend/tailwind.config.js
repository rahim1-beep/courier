/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        canvas: "var(--bg-canvas)",
        base: "var(--bg-base)",
        surface: "var(--bg-surface)",
        elevated: "var(--bg-elevated)",
        overlay: "var(--bg-overlay)",
        glass: "var(--bg-glass)",
        "glass-hover": "var(--bg-glass-hover)",
        
        brand: {
          50: "var(--brand-50)",
          100: "var(--brand-100)",
          300: "var(--brand-300)",
          400: "var(--brand-400)",
          500: "var(--brand-500)",
          600: "var(--brand-600)",
          700: "var(--brand-700)",
          glow: "var(--brand-glow)",
          subtle: "var(--brand-subtle)",
        },
        accent: {
          400: "var(--accent-400)",
          500: "var(--accent-500)",
          glow: "var(--accent-glow)",
          subtle: "var(--accent-subtle)",
        },
        sky: {
          400: "var(--sky-400)",
          500: "var(--sky-500)",
          glow: "var(--sky-glow)",
          subtle: "var(--sky-subtle)",
        },
        amber: {
          400: "var(--amber-400)",
          500: "var(--amber-500)",
          glow: "var(--amber-glow)",
          subtle: "var(--amber-subtle)",
        },
        rose: {
          400: "var(--rose-400)",
          500: "var(--rose-500)",
          glow: "var(--rose-glow)",
          subtle: "var(--rose-subtle)",
        },
        violet: {
          400: "var(--violet-400)",
          500: "var(--violet-500)",
          glow: "var(--violet-glow)",
          subtle: "var(--violet-subtle)",
        },
        
        primary: "var(--text-primary)",
        secondary: "var(--text-secondary)",
        muted: "var(--text-muted)",
        inverse: "var(--text-inverse)",
        
      },
      borderColor: {
        default: "var(--border-default)",
        subtle: "var(--border-subtle)",
        strong: "var(--border-strong)",
        focus: "var(--border-focus)",
        brand: "var(--border-brand)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        brand: "var(--shadow-brand)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
