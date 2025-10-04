<template>
  <v-app>
    <v-container fluid class="pa-0 fill-height">
      <v-row no-gutters class="fill-height">
        <v-col cols="12" md="6" class="d-none d-md-flex left-section">
          <div class="image-container">
            <img src="../assets/images/arte_login.png" alt="Arte Login" class="illustration" width="100%" />
          </div>
        </v-col>
        <!-- Sección Derecha - Formulario -->
        <v-col cols="12" md="6" class="right-section d-flex align-center justify-center">
          <div class="form-wrapper">
            <div class="logo-container mb-8">
              <div class="logo-circle">
                <v-icon size="48" color="white">mdi-shield-lock</v-icon>
              </div>
              <h2 class="app-title mt-4">CRUD Productos</h2>
              <p class="app-subtitle">Accede a tu cuenta</p>
            </div>

            <v-form ref="formRef" v-model="formValid" @submit.prevent="handleLogin">
              <v-text-field v-model="credentials.username" label="Usuario" placeholder="Ingresa tu usuario"
                prepend-inner-icon="mdi-account-outline" :rules="usernameRules" :disabled="loading" variant="outlined"
                color="primary" class="mb-4 custom-input" density="comfortable" hide-details="auto" />

              <v-text-field v-model="credentials.password" label="Contraseña" placeholder="Ingresa tu contraseña"
                prepend-inner-icon="mdi-lock-outline"
                :append-inner-icon="showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
                :type="showPassword ? 'text' : 'password'" :rules="passwordRules" :disabled="loading" variant="outlined"
                color="primary" class="mb-2 custom-input" density="comfortable" hide-details="auto"
                @click:append-inner="showPassword = !showPassword" />

              <v-alert v-if="error" type="error" variant="tonal" closable density="compact" class="mb-4 custom-alert"
                @click:close="error = ''">
                {{ error }}
              </v-alert>

              <v-btn type="submit" color="primary" size="x-large" block flat :loading="loading"
                :disabled="!formValid || loading" class="mb-6 login-button" elevation="0">
                <span class="button-text">Iniciar Sesión</span>
              </v-btn>

              <v-divider class="my-6">
                <span class="divider-text">Credenciales de prueba</span>
              </v-divider>

              <v-card variant="tonal" color="accent" class="pa-4 test-credentials">
                <div class="text-center">
                  <v-chip size="small" color="secondary" variant="flat" class="mb-3">
                    <v-icon start size="small">mdi-information-outline</v-icon>
                    Datos de acceso
                  </v-chip>
                  <div class="credentials-grid">
                    <div class="credential-item">
                      <span class="credential-label">Usuario:</span>
                      <span class="credential-value">emilys</span>
                    </div>
                    <div class="credential-item">
                      <span class="credential-label">Contraseña:</span>
                      <span class="credential-value">emilyspass</span>
                    </div>
                  </div>
                </div>
              </v-card>
            </v-form>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </v-app>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { AuthService } from '../services/auth.service'
import type { LoginCredentials } from '../types/auth.types'

const router = useRouter()
const formRef = ref()
const formValid = ref(false)
const loading = ref(false)
const error = ref('')
const showPassword = ref(false)

const credentials = ref<LoginCredentials>({
  username: '',
  password: ''
})

const usernameRules = [
  (v: string) => !!v || 'El usuario es requerido',
  (v: string) => v.length >= 3 || 'El usuario debe tener al menos 3 caracteres'
]

const passwordRules = [
  (v: string) => !!v || 'La contraseña es requerida',
  (v: string) => v.length >= 6 || 'La contraseña debe tener al menos 6 caracteres'
]

const handleLogin = async () => {
  const { valid } = await formRef.value.validate()

  if (!valid) return

  loading.value = true
  error.value = ''

  try {
    const response = await AuthService.login(credentials.value)

    AuthService.saveToken(response.accessToken)
    AuthService.saveUser(response)

    router.push('/dashboard')
  } catch (err) {
    if (err instanceof Error) {
      error.value = err.message
    } else {
      error.value = 'Ha ocurrido un error inesperado'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.fill-height {
  min-height: 100vh;
}

.left-section {
  background: linear-gradient(135deg, rgba(0, 70, 67, 0.95) 0%, rgba(0, 70, 67, 0.85) 100%);
  position: relative;
  overflow: hidden;
}

.image-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  position: relative;
}

.overlay-content {
  position: relative;
  z-index: 2;
  text-align: center;
  color: #F9F5F0;
  max-width: 500px;
}

.decorative-line {
  width: 80px;
  height: 4px;
  background: linear-gradient(90deg, transparent, #F4991A, transparent);
  margin: 0 auto;
  border-radius: 2px;
  animation: expandLine 2s ease-in-out infinite;
}

@keyframes expandLine {

  0%,
  100% {
    width: 80px;
  }

  50% {
    width: 120px;
  }
}

.right-section {
  background-color: #F9F5F0;
  padding: 2rem 1rem;
  min-height: 100vh;
}

.form-wrapper {
  width: 100%;
  max-width: 460px;
  padding: 2rem;
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.logo-container {
  text-align: center;
}

.logo-circle {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #F4991A 0%, #d98515 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  box-shadow: 0 8px 24px rgba(244, 153, 26, 0.3);
  transition: transform 0.3s ease;
}

.logo-circle:hover {
  transform: scale(1.05) rotate(5deg);
}

.app-title {
  font-size: 2rem;
  font-weight: 700;
  color: #0C1618;
  margin: 0;
}

.app-subtitle {
  font-size: 1rem;
  color: #666;
  margin: 0.5rem 0 0;
  font-weight: 400;
}

:deep(.custom-input .v-field) {
  border-radius: 12px;
  background-color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
}

:deep(.custom-input .v-field:hover) {
  box-shadow: 0 4px 12px rgba(244, 153, 26, 0.15);
}

:deep(.custom-input .v-field--focused) {
  box-shadow: 0 4px 16px rgba(244, 153, 26, 0.25);
}

:deep(.custom-input .v-field__outline) {
  color: #E5E5E5;
}

:deep(.custom-input .v-field--focused .v-field__outline) {
  color: #F4991A;
}

:deep(.login-button.v-btn.v-btn--disabled) {
  pointer-events: all !important;
  cursor: not-allowed !important;
}

.login-button {
  border-radius: 12px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: none;
  box-shadow: 0 4px 16px rgba(244, 153, 26, 0.3);
  transition: all 0.3s ease;
  color: white;
}

.login-button:hover {
  box-shadow: 0 6px 24px rgba(244, 153, 26, 0.4);
  transform: translateY(-2px);
}

.login-button:active {
  transform: translateY(0);
}

.button-text {
  font-size: 1rem;
  color: white;
}

/* Alert Personalizada */
:deep(.custom-alert) {
  border-radius: 12px;
}

.divider-text {
  padding: 0 1rem;
  font-size: 0.75rem;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
}

/* Credenciales de Prueba */
.test-credentials {
  border-radius: 12px;
  border: 1px solid #F2EAD3;
}

.credentials-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.credential-item {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
}

.credential-label {
  font-size: 0.875rem;
  color: #666;
  font-weight: 500;
}

.credential-value {
  font-size: 0.875rem;
  color: #344F1F;
  font-weight: 700;
  background-color: rgba(255, 255, 255, 0.7);
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-family: 'Courier New', monospace;
}

/* Responsive Design */
@media (max-width: 959px) {
  .right-section {
    min-height: 100vh;
  }

  .form-wrapper {
    padding: 1.5rem;
  }

  .app-title {
    font-size: 1.75rem;
  }
}

@media (max-width: 599px) {
  .form-wrapper {
    padding: 1rem;
  }

  .logo-circle {
    width: 70px;
    height: 70px;
  }

  .logo-circle :deep(.v-icon) {
    font-size: 40px !important;
  }

  .app-title {
    font-size: 1.5rem;
  }

  .credentials-grid {
    gap: 0.5rem;
  }

  .credential-item {
    flex-direction: column;
    gap: 0.25rem;
  }
}

/* Altura mínima para dispositivos que son pequeños */
@media (max-height: 700px) {
  .right-section {
    min-height: auto;
    padding: 1rem;
  }

  .form-wrapper {
    padding: 1rem;
  }

  .logo-container {
    margin-bottom: 1.5rem !important;
  }
}
</style>