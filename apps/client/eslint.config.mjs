import nextPlugin from "@next/eslint-plugin-next";

// Minimal flat config using Next.js core web vitals rules
export default [
  {
    plugins: {
      "@next/next": nextPlugin,
    },
    rules: {
      ...nextPlugin.configs["core-web-vitals"].rules,
    },
  },
];
