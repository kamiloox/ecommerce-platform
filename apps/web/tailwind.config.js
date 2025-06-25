import {heroui} from "@heroui/react";


/** @type {import('tailwindcss').Config} */
const config = {
  content: {
    relative: true,
    files: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "../../node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"
  ]
  },
  theme: {
    extend: {},
  },
  darkMode: "class",
  plugins: [heroui()]
}

export default config;
