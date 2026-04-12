/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // BACKGROUND / TEXT
        background: "#262624",
        foreground: "#c3c0b6",

        // PRIMARY
        primary: "#d97757",
        "primary-foreground": "#ffffff",

        // SECONDARY
        secondary: "#faf9f5",
        "secondary-foreground": "#30302e",

        // ACCENT
        accent: "#1a1915",
        "accent-foreground": "#f5f4ee",

        // CARD
        card: "#262624",
        "card-foreground": "#faf9f5",

        // POPOVER
        popover: "#30302e",
        "popover-foreground": "#e5e5e2",

        // MUTED
        muted: "#1b1b19",
        "muted-foreground": "#b7b5a9",

        // UI
        border: "#3e3e38",
        input: "#52514a",
        ring: "#d97757",

        // STATUS
        destructive: "#ef4444",
        "destructive-foreground": "#ffffff",
      },
      borderRadius: {
        lg: 12,
        xl: 16,
      },
    },
  },
  plugins: [],
};