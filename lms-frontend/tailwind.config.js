/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom light-theme palette featuring primary indigo accents and soft slate backgrounds
        brand: {
          50: '#eef2ff',   // Soft container background
          100: '#e0e7ff',  // Soft highlight borders
          500: '#6366f1',  // Indigo primary action accent
          600: '#4f46e5',  // Indigo hover state
          700: '#4338ca',  // Darker action headings
        },
        accent: {
          success: '#10b981', // Emerald green for passing scores/correct choice
          warning: '#f59e0b', // Amber for warnings/medium difficulty
          danger: '#ef4444',  // Rose red for wrong options/negative marks
        }
      },
      fontFamily: {
        // High-contrast clean sans font family
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
