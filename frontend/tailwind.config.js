/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/context/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/services/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        // Harmony palette: Premium dark-mode ready colors
        brand: {
          50: '#f5f7ff',
          100: '#ebf0ff',
          200: '#d6e0ff',
          300: '#b3c7ff',
          400: '#80a1ff',
          500: '#4d70fc',
          600: '#3350eb',
          700: '#253ccf',
          800: '#2233a7',
          900: '#212f85',
          950: '#181e4f',
        },
        slate: {
          850: '#1e293b',
          950: '#0f172a',
        }
      },
    },
  },
  plugins: [],
}
