/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        saffron: {
          DEFAULT: "#FF8C00",
          50: "#FFF7E6",
          100: "#FFEBC2", 
          600: "#E09F3E",
          700: "#C87900"
        },
        gold: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
        }
      },
      backgroundImage: {
        saffronGradient: "linear-gradient(135deg, #FF9933 0%, #8B0000 100%)"
      },
      boxShadow: {
        glow: "0 0 20px rgba(255, 153, 51, 0.25)"
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
     require("tailwindcss"),
    require("autoprefixer"),
    require("tailwindcss-filters"),
  ]
}