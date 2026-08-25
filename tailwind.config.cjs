/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./index.html", "./src/**/*.{svelte,js,ts}"],
	theme: {
		extend: {
			colors: {
				// The captain's palette
				brand: "#e62020", // the red everything uses
				grape: "#9932cc", // active / story accents
				parchment: "#e0e2c6", // the list overlay beige
			},
			fontFamily: {
				sans: ['"Open Sans"', "ui-sans-serif", "system-ui", "sans-serif"],
				mono: ['"Courier New"', "ui-monospace", "monospace"],
			},
		},
	},
	plugins: [],
};
