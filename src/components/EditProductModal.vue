<template>
  <v-dialog v-model="dialog" max-width="700" persistent scrollable>
    <v-card rounded="lg" class="edit-modal">
      <v-card-title class="modal-header pa-4">
        <div class="d-flex align-center">
          <v-icon size="32" color="white" class="mr-3">mdi-pencil-box</v-icon>
          <div>
            <h4 class="text-white font-weight-bold">Editar Producto</h4>
            <p class="text-caption text-white mb-0 mt-1 opacity-90">
              ID: {{ product?.id }} - {{ product?.title }}
            </p>
          </div>
          <v-spacer />
          <v-btn icon="mdi-close" variant="text" color="white" @click="closeModal" :disabled="loading" />
        </div>

      </v-card-title>

      <v-card-text class="pa-6">
        <v-form ref="formRef" v-model="formValid">
          <v-row>
            <!-- Título -->
            <v-col cols="12">
              <v-text-field v-model="formData.title" label="Título del producto *" prepend-inner-icon="mdi-tag"
                :rules="[rules.required, rules.minLength(3)]" :disabled="loading" variant="outlined" color="primary"
                density="comfortable" hint="Nombre descriptivo del producto" persistent-hint />
            </v-col>

            <!-- Descripción -->
            <v-col cols="12">
              <v-textarea v-model="formData.description" label="Descripción" prepend-inner-icon="mdi-text"
                :rules="[rules.minLength(10)]" :disabled="loading" variant="outlined" color="primary"
                density="comfortable" rows="3" auto-grow hint="Descripción detallada del producto" persistent-hint />
            </v-col>

            <!-- Precio y Stock -->
            <v-col cols="12" sm="6">
              <v-text-field v-model.number="formData.price" label="Precio (USD) *" prepend-inner-icon="mdi-currency-usd"
                :rules="[rules.required, rules.minValue(0)]" :disabled="loading" variant="outlined" color="primary"
                density="comfortable" type="number" step="0.01" min="0" />
            </v-col>

            <v-col cols="12" sm="6">
              <v-text-field v-model.number="formData.stock" label="Stock (unidades) *"
                prepend-inner-icon="mdi-package-variant" :rules="[rules.required, rules.minValue(0)]"
                :disabled="loading" variant="outlined" color="primary" density="comfortable" type="number" min="0" />
            </v-col>

            <!-- Marca y Categoría -->
            <v-col cols="12" sm="6">
              <v-text-field v-model="formData.brand" label="Marca" prepend-inner-icon="mdi-tag-heart"
                :disabled="loading" variant="outlined" color="primary" density="comfortable" />
            </v-col>

            <v-col cols="12" sm="6">
              <v-text-field v-model="formData.category" label="Categoría *" prepend-inner-icon="mdi-shape"
                :rules="[rules.required]" :disabled="loading" variant="outlined" color="primary"
                density="comfortable" />
            </v-col>

            <!-- Rating y Descuento -->
            <v-col cols="12" sm="6">
              <v-text-field v-model.number="formData.rating" label="Valoración" prepend-inner-icon="mdi-star"
                :rules="[rules.minValue(0), rules.maxValue(5)]" :disabled="loading" variant="outlined" color="primary"
                density="comfortable" type="number" step="0.1" min="0" max="5" hint="Calificación de 0 a 5"
                persistent-hint />
            </v-col>

            <v-col cols="12" sm="6">
              <v-text-field v-model.number="formData.discountPercentage" label="Descuento (%)"
                prepend-inner-icon="mdi-percent" :rules="[rules.minValue(0), rules.maxValue(100)]" :disabled="loading"
                variant="outlined" color="primary" density="comfortable" type="number" step="0.01" min="0" max="100" />
            </v-col>
          </v-row>

          <v-alert v-if="error" type="error" variant="tonal" closable class="mt-4" @click:close="error = ''">
            {{ error }}
          </v-alert>
        </v-form>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-6">
        <v-spacer />
        <v-btn variant="flat" color="grey-darken-1" @click="closeModal" :disabled="loading">
          Cancelar
        </v-btn>
        <v-btn color="success" variant="flat" @click="saveProduct" :loading="loading" :disabled="!formValid || loading"
          prepend-icon="mdi-content-save">
          Guardar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Product } from '../types/product.types'

interface Props {
  modelValue: boolean
  product: Product | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'save', data: Partial<Product>): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const dialog = ref(false)
const formRef = ref()
const formValid = ref(false)
const loading = ref(false)
const error = ref('')

interface FormData {
  title: string
  description: string
  price: number
  stock: number
  brand: string
  category: string
  rating: number
  discountPercentage: number
}

const formData = ref<FormData>({
  title: '',
  description: '',
  price: 0,
  stock: 0,
  brand: '',
  category: '',
  rating: 0,
  discountPercentage: 0
})

// Reglas de validación
const rules = {
  required: (v: any) => !!v || 'Este campo es requerido',
  minLength: (min: number) => (v: string) =>
    !v || v.length >= min || `Mínimo ${min} caracteres`,
  minValue: (min: number) => (v: number) =>
    v >= min || `El valor mínimo es ${min}`,
  maxValue: (max: number) => (v: number) =>
    v <= max || `El valor máximo es ${max}`,
}

// Watch para sincronizar el dialog
watch(() => props.modelValue, (newVal) => {
  dialog.value = newVal
  if (newVal && props.product) {
    loadProductData()
  }
})

watch(dialog, (newVal) => {
  if (!newVal) {
    emit('update:modelValue', false)
    resetForm()
  }
})

const loadProductData = () => {
  if (!props.product) return

  formData.value = {
    title: props.product.title || '',
    description: props.product.description || '',
    price: props.product.price || 0,
    stock: props.product.stock || 0,
    brand: props.product.brand || '',
    category: props.product.category || '',
    rating: props.product.rating || 0,
    discountPercentage: props.product.discountPercentage || 0
  }
}

const saveProduct = async () => {
  const { valid } = await formRef.value.validate()

  if (!valid) return

  loading.value = true
  error.value = ''

  emit('save', formData.value)

  // El loading se maneja desde el componente padre
  setTimeout(() => {
    loading.value = false
  }, 100)
}

const closeModal = () => {
  if (loading.value) return
  dialog.value = false
}

const resetForm = () => {
  formData.value = {
    title: '',
    description: '',
    price: 0,
    stock: 0,
    brand: '',
    category: '',
    rating: 0,
    discountPercentage: 0
  }
  error.value = ''
  formRef.value?.resetValidation()
}

defineExpose({
  setLoading: (value: boolean) => {
    loading.value = value
  },
  setError: (message: string) => {
    error.value = message
  }
})
</script>

<style scoped>
.edit-modal {
  border: 2px solid #F2EAD3;
}

.modal-header {
  background-color: #0C1618;
}

:deep(.v-field) {
  border-radius: 8px;
}

:deep(.v-field--focused) {
  box-shadow: 0 0 0 2px rgba(244, 153, 26, 0.2);
}

:deep(.v-messages__message) {
  font-size: 0.75rem;
}
</style>