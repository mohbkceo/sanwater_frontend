export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "rgb(0 80 164 / <alpha-value>)",
          foreground: "rgb(255 255 255 / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "rgb(0 174 239 / <alpha-value>)",
          foreground: "rgb(0 80 164 / <alpha-value>)",
        },
      },
      
    },
    fontFamily: {
        mainFont: ['Poppins-Medium']
      }
  },
  plugins: [],
}