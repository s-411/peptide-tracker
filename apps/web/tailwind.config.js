/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#ff3427',
        'primary-hover': '#e62e22',
        dark: '#1f1f1f',
        dark2: '#2a2a2a',
        gray: '#ababab',
        white: '#ffffff',
        error: '#ff6b6b',
        success: '#51cf66',
        warning: '#00A1FE',
      },
      fontFamily: {
        heading: ['Antonio', 'Arial Black', 'sans-serif'],
        body: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        h1: '2.5rem',
        h2: '2rem',
        h3: '1.5rem',
        h4: '1.25rem',
        h5: '1rem',
        h6: '0.875rem',
        body: '1rem',
        small: '0.875rem',
        xs: '0.75rem',
      },
      borderRadius: {
        button: '100px',
        card: '0.5rem',
        input: '0.5rem',
        modal: '0.5rem',
      },
    },
  },
  plugins: [],
}