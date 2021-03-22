module.exports = {
    purge: [
        './pages/**/*.{js,ts,jsx,tsx}',
        './components/**/*.{js,ts,jsx,tsx}'
    ],
    darkMode: false, // or 'media' or 'class'
    theme: {
        extend: {},
        colors: {
            greenandgray: {
                base03: '#002b36',
                base02: '#073642',
                base01: '#586e75',
                DEFAULT: '#586e75',
                base00: '#657b83',
                base0: '#839496',
                base1: '#93a1a1',
                base3: '#fdf6e3',
                white: '#ffffff'
            }
        },
        fontFamily: {
            mono: ['Fira\\ Code', 'Monaco', 'monospace']
        }
    },
    variants: {
        extend: {},
    },
    plugins: [],
}
