// // import type { Config } from "tailwindcss";
// // import animatePlugin from "tailwindcss-animate";

// // const config: Config = {
// //   darkMode: "class",
// //   content: [
// //     "./app/**/*.{js,ts,jsx,tsx,mdx}",
// //     "./pages/**/*.{js,ts,jsx,tsx,mdx}",
// //     "./components/**/*.{js,ts,jsx,tsx,mdx}",
// //   ],
// //   theme: {
// //     extend: {
// //       colors: {
// //         background: "hsl(var(--background, 0 0% 100%))",
// //         foreground: "hsl(var(--foreground, 222.2 84% 4.9%))",
// //         card: {
// //           DEFAULT: "hsl(var(--card, 0 0% 100%))",
// //           foreground: "hsl(var(--card-foreground, 222.2 84% 4.9%))",
// //         },
// //         popover: {
// //           DEFAULT: "hsl(var(--popover, 0 0% 100%))",
// //           foreground: "hsl(var(--popover-foreground, 222.2 84% 4.9%))",
// //         },
// //         primary: {
// //           DEFAULT: "hsl(var(--primary, 221.2 83.2% 53.3%))",
// //           foreground: "hsl(var(--primary-foreground, 210 40% 98%))",
// //         },
// //         secondary: {
// //           DEFAULT: "hsl(var(--secondary, 210 40% 96.1%))",
// //           foreground: "hsl(var(--secondary-foreground, 222.2 47.4% 11.2%))",
// //         },
// //         muted: {
// //           DEFAULT: "hsl(var(--muted, 210 40% 96.1%))",
// //           foreground: "hsl(var(--muted-foreground, 215.4 16.3% 46.9%))",
// //         },
// //         accent: {
// //           DEFAULT: "hsl(var(--accent, 210 40% 96.1%))",
// //           foreground: "hsl(var(--accent-foreground, 222.2 47.4% 11.2%))",
// //         },
// //         destructive: {
// //           DEFAULT: "hsl(var(--destructive, 0 84.2% 60.2%))",
// //           foreground: "hsl(var(--destructive-foreground, 210 40% 98%))",
// //         },
// //         border: "hsl(var(--border, 214.3 31.8% 91.4%))",
// //         input: "hsl(var(--input, 214.3 31.8% 91.4%))",
// //         ring: "hsl(var(--ring, 221.2 83.2% 53.3%))",
// //         chart: {
// //           "1": "hsl(var(--chart-1, 200 70% 50%))",
// //           "2": "hsl(var(--chart-2, 160 70% 50%))",
// //           "3": "hsl(var(--chart-3, 120 70% 50%))",
// //           "4": "hsl(var(--chart-4, 80 70% 50%))",
// //           "5": "hsl(var(--chart-5, 40 70% 50%))",
// //         },
// //         sidebar: {
// //           DEFAULT: "hsl(var(--sidebar-background, 240 5% 96%))",
// //           foreground: "hsl(var(--sidebar-foreground, 222.2 84% 4.9%))",
// //           primary: "hsl(var(--sidebar-primary, 221.2 83.2% 53.3%))",
// //           "primary-foreground": "hsl(var(--sidebar-primary-foreground, 210 40% 98%))",
// //           accent: "hsl(var(--sidebar-accent, 210 40% 96.1%))",
// //           "accent-foreground": "hsl(var(--sidebar-accent-foreground, 222.2 47.4% 11.2%))",
// //           border: "hsl(var(--sidebar-border, 214.3 31.8% 91.4%))",
// //           ring: "hsl(var(--sidebar-ring, 221.2 83.2% 53.3%))",
// //         },
// //       },
// //       borderRadius: {
// //         lg: "var(--radius, 0.5rem)",
// //         md: "calc(var(--radius, 0.5rem) - 2px)",
// //         sm: "calc(var(--radius, 0.5rem) - 4px)",
// //       },
// //       keyframes: {
// //         "accordion-down": {
// //           from: { height: "0" },
// //           to: { height: "var(--radix-accordion-content-height)" },
// //         },
// //         "accordion-up": {
// //           from: { height: "var(--radix-accordion-content-height)" },
// //           to: { height: "0" },
// //         },
// //       },
// //       animation: {
// //         "accordion-down": "accordion-down 0.2s ease-out",
// //         "accordion-up": "accordion-up 0.2s ease-out",
// //       },
// //     },
// //   },
// //   plugins: [animatePlugin],
// // };

// // export default config;

// import type { Config } from "tailwindcss";

// const config: Config = {
//   content: [
//     "./pages/**/*.{js,ts,jsx,tsx,mdx}",
//     "./components/**/*.{js,ts,jsx,tsx,mdx}",
//     "./app/**/*.{js,ts,jsx,tsx,mdx}",
//   ],
//   theme: {
//     extend: {
//       colors: {
//         background: "hsl(var(--background))",
//         foreground: "hsl(var(--foreground))",
//         card: {
//           DEFAULT: "hsl(var(--card))",
//           foreground: "hsl(var(--card-foreground))",
//         },
//         popover: {
//           DEFAULT: "hsl(var(--popover))",
//           foreground: "hsl(var(--popover-foreground))",
//         },
//         primary: {
//           DEFAULT: "hsl(var(--primary))",
//           foreground: "hsl(var(--primary-foreground))",
//         },
//         secondary: {
//           DEFAULT: "hsl(var(--secondary))",
//           foreground: "hsl(var(--secondary-foreground))",
//         },
//         muted: {
//           DEFAULT: "hsl(var(--muted))",
//           foreground: "hsl(var(--muted-foreground))",
//         },
//         accent: {
//           DEFAULT: "hsl(var(--accent))",
//           foreground: "hsl(var(--accent-foreground))",
//         },
//         destructive: {
//           DEFAULT: "hsl(var(--destructive))",
//           foreground: "hsl(var(--destructive-foreground))",
//         },
//         border: "hsl(var(--border))",
//         input: "hsl(var(--input))",
//         ring: "hsl(var(--ring))",
//         chart: {
//           "1": "hsl(var(--chart-1))",
//           "2": "hsl(var(--chart-2))",
//           "3": "hsl(var(--chart-3))",
//           "4": "hsl(var(--chart-4))",
//           "5": "hsl(var(--chart-5))",
//         },
//         sidebar: {
//           DEFAULT: "hsl(var(--sidebar-background))",
//           foreground: "hsl(var(--sidebar-foreground))",
//           primary: "hsl(var(--sidebar-primary))",
//           "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
//           accent: "hsl(var(--sidebar-accent))",
//           "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
//           border: "hsl(var(--sidebar-border))",
//           ring: "hsl(var(--sidebar-ring))",
//         },
//       },
//       borderRadius: {
//         lg: "var(--radius, 0.5rem)",
//         md: "calc(var(--radius, 0.5rem) - 2px)",
//         sm: "calc(var(--radius, 0.5rem) - 4px)",
//       },
//       keyframes: {
//         "accordion-down": {
//           from: { height: "0" },
//           to: { height: "var(--radix-accordion-content-height)" },
//         },
//         "accordion-up": {
//           from: { height: "var(--radix-accordion-content-height)" },
//           to: { height: "0" },
//         },
//       },
//       animation: {
//         "accordion-down": "accordion-down 0.2s ease-out",
//         "accordion-up": "accordion-up 0.2s ease-out",
//       },
//     },
//   },
//   plugins: [],
// };

// export default config;

// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
      },
    },
  },
  plugins: [],
};

export default config;
