export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  devServer: {
    port: 3001,
  },

  ssr: false,

  experimental: {
    viteEnvironmentApi: true,
  },

  modules: ["@pinia/nuxt", "@nuxtjs/tailwindcss", "@nuxt/eslint"],

  runtimeConfig: {
    public: {
      apiUrl: process.env.NUXT_PUBLIC_API_URL ?? "http://localhost:3000",
    },
  },

  typescript: {
    strict: true,
  },
});
