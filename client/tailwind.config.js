/** @type {import('tailwindcss').Config} */
export default {
    content: ["./client/index.html", "./client/src/**/*.{svelte,js,ts}"],
    theme: {
        extend: {
            colors: {
                primary: "#bb86fc",
                "primary-variant": "#3700b3",
                secondary: "#03dac6",
                background: "#121212",
                surface: "#1e1e1e",
                "surface-light": "#2d2d2d",
                "surface-lighter": "#3d3d3d",
                error: "#cf6679",
                "on-primary": "#000000",
                "on-secondary": "#000000",
                "on-background": "#e1e1e1",
                "on-surface": "#e1e1e1",
                "on-error": "#000000",
            },
        },
    },
    plugins: [],
};
