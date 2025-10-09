// /** @type {import('tailwindcss').Config} */
// export default {
//   content: [
//     "./index.html",
//     "./src/**/*.{js,ts,jsx,tsx}",
//   ],
//   theme: {
//     extend: {
//       colors:{
//         primary: '#FD9A08', 
//         secondary: '#4D2719',
//         color5:" #96D172"
//       },
//     },
//   },
//   plugins: [],
// }

/** @type {import('tailwindcss').Config} */
 module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        rotateOne: "rotateOne 1s linear infinite",
        rotateTwo: "rotateTwo 1s linear infinite",
        rotateThree: "rotateThree 1s linear infinite",
      },
      keyframes: {
        rotateOne: {
          "0%": { transform: "rotateX(35deg) rotateY(-45deg) rotateZ(0deg)" },
          "100%": { transform: "rotateX(35deg) rotateY(-45deg) rotateZ(360deg)" },
        },
        rotateTwo: {
          "0%": { transform: "rotateX(50deg) rotateY(10deg) rotateZ(0deg)" },
          "100%": { transform: "rotateX(50deg) rotateY(10deg) rotateZ(360deg)" },
        },
        rotateThree: {
          "0%": { transform: "rotateX(35deg) rotateY(55deg) rotateZ(0deg)" },
          "100%": { transform: "rotateX(35deg) rotateY(55deg) rotateZ(360deg)" },
        },
      },
    },
  },
  plugins: [],
};
