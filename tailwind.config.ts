import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#000000",
        charcoal: "#1c1c1e",
        brand: "#fc3030", // Bright Red Neon
        "brand-dark": "#c40000",
        chalk: "#ffffff",
        "neon-amber": "#ffb000",
        "neon-amber-dark": "#b05000",
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
        'glass-button': '0 4px 15px rgba(252, 48, 48, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.2)',
        'glass-hover': '0 12px 40px 0 rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.2)',
        
        // Vintage Pinball Mechanics
        'neon-red': '0 0 15px 5px rgba(252, 48, 48, 0.6), inset 0 0 10px 2px rgba(252, 48, 48, 0.8)',
        'neon-amber': '0 0 15px 5px rgba(255, 176, 0, 0.6), inset 0 0 10px 2px rgba(255, 176, 0, 0.8)',
        'chrome-bumper': 'inset 0 4px 6px rgba(255,255,255,0.7), inset 0 -4px 6px rgba(0,0,0,0.5), 0 5px 15px rgba(0,0,0,0.6)',
        'chrome-bumper-pressed': 'inset 0 6px 12px rgba(0,0,0,0.8), inset 0 -2px 4px rgba(255,255,255,0.3)',
      },
      backgroundImage: {
        'chrome': 'linear-gradient(135deg, #a0a0a0 0%, #e8e8e8 25%, #666 50%, #dcdcdc 75%, #888 100%)',
        'bumper-red': 'radial-gradient(circle at 30% 30%, #ff6b6b 0%, #fc3030 50%, #8b0000 100%)',
        'bumper-off': 'radial-gradient(circle at 30% 30%, #555 0%, #222 50%, #000 100%)',
        'dot-grid': 'radial-gradient(rgba(0,0,0,0.9) 15%, transparent 16%)',
      },
      backgroundSize: {
        'dots': '4px 4px',
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "Liberation Mono", "Courier New", "monospace"], // Pinball LCD
      },
      animation: {
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in': 'fadeIn 0.8s ease-out forwards',
        'pulse-neon-red': 'pulseNeonRed 1.5s infinite alternate',
        'pulse-neon-amber': 'pulseNeonAmber 1.2s infinite alternate',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(15px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        pulseNeonRed: {
          '0%': { textShadow: '0 0 5px #fc3030, 0 0 10px #fc3030', color: '#ffb3b3' },
          '100%': { textShadow: '0 0 2px #c40000, 0 0 5px #c40000', color: '#fc3030' },
        },
        pulseNeonAmber: {
          '0%': { textShadow: '0 0 5px #ffb000, 0 0 10px #ffb000', color: '#ffe6a0' },
          '100%': { textShadow: '0 0 2px #b05000, 0 0 5px #b05000', color: '#ffb000' },
        }
      }
    },
  },
  plugins: [],
};

export default config;
