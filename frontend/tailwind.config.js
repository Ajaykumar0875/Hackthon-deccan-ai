/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/user/**/*.{js,ts,jsx,tsx}",
    "./src/app/signin/**/*.{js,ts,jsx,tsx}",
    "./src/app/apply/**/*.{js,ts,jsx,tsx}",
  ],
  corePlugins: {
    // Preflight disabled — prevents Tailwind base reset from
    // overriding the admin dark theme in globals.css
    preflight: false,
  },
  theme: {
    extend: {},
  },
  plugins: [],
};
