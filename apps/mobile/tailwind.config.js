/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your components files
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
    './src/app/**/*.{js,jsx,ts,tsx}',
    './src/components/**/*.{js,jsx,ts,tsx}',
    './src/core/components/**/*.{js,jsx,ts,tsx}',
    './src/features/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Cairo_400Regular'],
        cairo: ['Cairo_400Regular'],
        // Same as `cairo`: 42 places use this name, and an undefined class is
        // dropped silently, so they showed the phone's system font instead
        'cairo-regular': ['Cairo_400Regular'],
        'cairo-medium': ['Cairo_500Medium'],
        'cairo-semibold': ['Cairo_600SemiBold'],
        'cairo-bold': ['Cairo_700Bold'],
        'readex-pro': ['ReadexPro_400Regular'],
        'readex-pro-bold': ['ReadexPro_700Bold'],
        'readex-pro-medium': ['ReadexPro_500Medium'],
        'readex-pro-semibold': ['ReadexPro_600SemiBold'],
        'readex-pro-extralight': ['ReadexPro_200ExtraLight'],
        'readex-pro-light': ['ReadexPro_300Light'],
        almarai: ['Almarai_400Regular'],
        'almarai-regular': ['Almarai_400Regular'],
        'almarai-bold': ['Almarai_700Bold'],
      },
      colors: {
        primary: '#0B2239',
        secondary: '#15304D',
        accent: '#F1F5F9',
        charcoal: '#111111',
        'gray-medium': '#6B6A6A',
        danger: '#DC2626',
      },
    },
  },
  plugins: [],
};
