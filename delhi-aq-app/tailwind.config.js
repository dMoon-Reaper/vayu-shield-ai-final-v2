/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Newsreader', 'Georgia', 'serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      colors: {
        paper: "#F8F7F4",
        ink: "#111111",
        stratosphere: {
          950: "#060B19",
          900: "#0B132B",
          800: "#0F172A",
          700: "#1E293B",
        },
        stone: {
          muted: "#6E6D68",
          light: "#E5E4DE",
          faint: "#EFEFEA",
        },
        vermilion: "#E13C2A",
        forest: "#15803D",
        // Semantic Atmospheric Accents
        biolum: {
          cyan: "#00F5D4",
          cobalt: "#3B82F6",
          amber: "#F59E0B",
          crimson: "#F43F5E",
          emerald: "#10B981",
          purple: "#A855F7",
        },
        // PM2.5 standard reference bands
        pm: {
          good: "#15803D",
          satisfactory: "#4D7C0F",
          moderate: "#B45309",
          poor: "#C2410C",
          verypoor: "#E13C2A",
          severe: "#7F1D1D",
        }
      },
      borderWidth: {
        hairline: '1px',
      }
    },
  },
  plugins: [],
}
