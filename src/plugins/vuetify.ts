import 'vuetify/styles/main.css'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'

export default createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'customLight',
    themes: {
      customLight: {
        dark: false,
        colors: {
          primary: '#0C1618',      // Naranja vibrante
          secondary: '#004643',    // Verde oscuro
          accent: '##FAF4D3',       // Beige claro
          background: '#F9F5F0',   // Fondo principal
          surface: '#FFFFFF',
          error: '#D32F2F',
          info: '#2196F3',
          success: '#344F1F',
          warning: '#F4991A',
        },
      },
    },
  },
})