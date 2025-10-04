<template>
  <v-app>
    <v-app-bar color="primary" prominent>
      <v-toolbar-title class="text-left">CRUD Productos</v-toolbar-title>
      <v-spacer />

      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn icon v-bind="props">
            <v-avatar size="40">
              <v-img :src="user?.image" :alt="user?.firstName" />
            </v-avatar>
          </v-btn>
        </template>
        <v-list>
          <v-list-item>
            <v-list-item-title>{{ user?.firstName }} {{ user?.lastName }}</v-list-item-title>
            <v-list-item-subtitle>{{ user?.email }}</v-list-item-subtitle>
          </v-list-item>
          <v-divider />
          <v-list-item @click="handleLogout" class="bg-error text-white">
            <template v-slot:prepend>
              <v-icon>mdi-logout</v-icon>
            </template>
            <v-list-item-title>Cerrar Sesión</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <v-main>
      <v-container>
        <v-alert type="success" variant="tonal" closable prominent border="start" class="mb-6">
          <v-alert-title class="text-h6">
            ¡Bienvenido/a, {{ user?.firstName }}!
          </v-alert-title>
        </v-alert>
        <!-- Tabla de Productos -->
        <v-row class="mt-4">
          <v-col cols="12">
            <ProductsTable />
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { AuthService } from '../services/auth.service'
import type { LoginResponse } from '../types/auth.types'
import ProductsTable from '../components/ProductsTable.vue'

const router = useRouter()
const user = ref<LoginResponse | null>(null)
const token = ref<string | null>(null)

onMounted(() => {
  user.value = AuthService.getUser()
  token.value = AuthService.getToken()
})

const handleLogout = () => {
  AuthService.logout()
  router.push('/login')
}
</script>