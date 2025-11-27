/** @type {import('tailwindcss').Config} */
module.exports = {
    prefix: "tw-discordia-",
    // Limit scope to Extension Root
    important: "#discordia-root",
    corePlugins: {
        preflight: false,
    },
    content: ['./src/**/*.{js,jsx,ts,tsx}'],
    theme: {
        extend: {},
    },
    plugins: [],
};
