import tailwindcss from '@tailwindcss/vite';

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

  modules: ["@pinia/nuxt", "@nuxt/eslint"],

  vite: {
    plugins: [tailwindcss()],
  },

  components: [
    { path: '~/modules/shared/components/ui', pathPrefix: false, extensions: ['vue'] },
    { path: '~/modules/shared/components', extensions: ['vue'] },
    '~/components',
  ],

  css: ["~/assets/css/main.css"],

  runtimeConfig: {
    public: {
      apiUrl: process.env.NUXT_PUBLIC_API_URL ?? "http://localhost:3000",
    },
  },

  typescript: {
    strict: true,
  },
});
