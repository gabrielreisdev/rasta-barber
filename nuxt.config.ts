// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@nuxtjs/supabase'
  ],

  supabase: {
    redirect: false, // Desativa redirecionamento automático nativo para controlarmos via middleware customizado
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY
  },

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      title: 'Rasta Barber | Estilo, Precisão & Agendamento Online',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Agende seu corte e barba no Rasta Barber com facilidade e veja o status do barbeiro em tempo real.' },
        { name: 'theme-color', content: '#0B0F19' }
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/rastabarberlogo.png' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Cinzel:wght@600;700;900&display=swap' }
      ]
    }
  }
})
