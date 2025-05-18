// tailwind.config.js

export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/layouts/**/*.{js,ts,jsx,tsx}',
  ],
  safelist: [
    'dark:bg-gray-900',
    'dark:bg-gray-800',
    'dark:bg-zinc-800',
    'dark:text-white',
    'dark:text-gray-100',
    'dark:text-gray-300',
    'dark:border-gray-700',
    'dark:border-gray-600',
    'dark:hover:bg-gray-800',
    'dark:hover:bg-gray-700',
    'dark:hover:text-white',
    'dark:text-red-400',
    'dark:text-blue-300',
    'dark:text-purple-300',
    'dark:bg-purple-900',
    'dark:text-gray-200',
    'dark:text-green-400',
    'dark:text-yellow-500',
  ],
  theme: {
    extend: {
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'shake': 'shake 0.5s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-8px)' },
          '50%': { transform: 'translateX(8px)' },
          '75%': { transform: 'translateX(-4px)' },
        },
      },
    },
  },
  plugins: [],
};