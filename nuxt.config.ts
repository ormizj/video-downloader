// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  modules: ['nuxt-electron'],
  future: {
    compatibilityVersion: 4,
  },
  app: { 
    cdnURL: './',
    head: {
      title: 'Video Downloader',
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }
      ]
    }
  },
  electron: {
    disableDefaultOptions: true,
    build: [
      {
        entry: 'electron/main.ts',
      },
    ],
  },
});
