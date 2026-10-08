import colors from 'vuetify/es5/util/colors'

export default {
  // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
  ssr: false,

  // Target: https://go.nuxtjs.dev/config-target

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    titleTemplate: '%s ',
    title: 'Nova',
    htmlAttrs: {
      lang: 'en'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
      { name: 'format-detection', content: 'telephone=no' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/applogo.png' }
    ]
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
  '~/plugins/wire-api-auth.client.js'
],

axios: {
    baseURL: process.env.API_BASE_URL || 'https://novaserver-production-b5fd.up.railway.app',
    credentials: true
  },


  router: {
    middleware: ["auth","subscription"],
  },
  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  googleFonts: {
    download: true,
    families: {
      Lato: true,
    },
    display: "Lato",
  },

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/vuetify
    '@nuxtjs/vuetify',
    "@nuxtjs/google-fonts",
    '@nuxtjs/moment',
    '@nuxtjs/dayjs',

  ],
  moment: {
    timezone: false
  },

  // Modules: https://go.nuxtjs.dev/config-modules
  // Modules: https://go.nuxtjs.dev/config-modules
  
  modules: [

    [
      "@nuxtjs/firebase",
      {
        config: {
            apiKey: "AIzaSyA_qIwsg-SaDHxq05Zx_DCo2J0EIOCpZCk",
            authDomain: "nova-10793.firebaseapp.com",
            projectId: "nova-10793",
            storageBucket: "nova-10793.firebasestorage.app",
            messagingSenderId: "672854023062",
            appId: "1:672854023062:web:03b94e6dba086c431d9bb7",
            measurementId: "G-6JNW8VTBQT"
        },
        services: {
          auth: {
            persistence: "local", // default
            initialize: {
              nAuthStateChangedMutation: "ON_AUTH_STATE_CHANGED_MUTATION",
              subscribeManually: false,
            },
            ssr: false,
          },
          storage: true,
          firestore: true,

        },
      },
    ],
  ],

  // Vuetify module configuration: https://go.nuxtjs.dev/config-vuetify
  vuetify: {
    customVariables: ['~/assets/variables.scss'],
    theme: {
      dark: false,
      themes: {
        dark: {
        primary:   '#4A3B8C',
        secondary: '#56C2D9',
        accent:    '#E86A8A',
        error:     '#E74C3C',
        info:      '#7EC8E3',
        success:   '#2ECC71',
        warning:   '#F39C12',
        background:'#FFFFFF'
        }
      },light: {
        primary:   '#4A3B8C',
        secondary: '#56C2D9',
        accent:    '#E86A8A',
        error:     '#E74C3C',
        info:      '#7EC8E3',
        success:   '#2ECC71',
        warning:   '#F39C12',
        background:'#FFFFFF'
      }
    }
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
  }
}
