/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your components files
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        cairo: ["Cairo_400Regular"],
        "cairo-bold": ["Cairo_700Bold"],
        "cairo-extrabold": ["Cairo_800ExtraBold"],
        "cairo-black": ["Cairo_900Black"],
        "cairo-medium": ["Cairo_500Medium"],
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
