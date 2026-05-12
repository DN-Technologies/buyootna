/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your components files
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Cairo_400Regular"],
        cairo: ["Cairo_400Regular"],
        "cairo-medium": ["Cairo_500Medium"],
        "cairo-semibold": ["Cairo_600SemiBold"],
        "cairo-bold": ["Cairo_700Bold"],
        "readex-pro": ["ReadexPro_400Regular"],
        "readex-pro-bold": ["ReadexPro_700Bold"],
        "readex-pro-medium": ["ReadexPro_500Medium"],
        "readex-pro-semibold": ["ReadexPro_600SemiBold"],
        "readex-pro-extralight": ["ReadexPro_200ExtraLight"],
        "readex-pro-light": ["ReadexPro_300Light"],
      },
    },
  },
  plugins: [],
};
