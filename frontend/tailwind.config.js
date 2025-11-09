import { join } from "path";

/** @type {import('tailwindcss').Config} */
export default {
  content: [join("./index.html"), join("./src/**/*.{js,ts,jsx,tsx}")],
  theme: {
    extend: {},
  },
  plugins: [],
};
