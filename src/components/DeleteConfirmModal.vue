<template>
    <v-dialog v-model="dialog" max-width="500" persistent>
        <v-card rounded="lg" class="delete-modal">
            <v-card-title class="modal-header pa-4">
                <div class="d-flex align-center">
                    <v-icon size="32" color="white" class="mr-3">mdi-alert-circle</v-icon>
                    <h4 class="text-white font-weight-bold">Confirmar Eliminación</h4>
                </div>
            </v-card-title>

            <v-card-text class="pa-6">
                <v-alert type="warning" variant="tonal" prominent border="start" class="mb-4">
                    <v-alert-title class="font-weight-bold mb-2">
                        <h5>¿Estás seguro de eliminar este producto?</h5>
                    </v-alert-title>
                    <div class="text-subtitle-2">
                        Esta acción no se puede deshacer. El producto será eliminado permanentemente del sistema.
                    </div>
                </v-alert>

                <v-card variant="outlined" class="product-info">
                    <v-card-text class="pa-4">
                        <div class="d-flex align-start">
                            <v-avatar size="80" rounded="lg" class="mr-4">
                                <v-img :src="product?.thumbnail" :alt="product?.title" cover />
                            </v-avatar>

                            <div class="flex-grow-1">
                                <div class="text-h7 font-weight-bold mb-1">
                                    {{ product?.title }}
                                </div>
                                <div class="text-caption text-medium-emphasis mb-2">
                                    ID: {{ product?.id }}
                                </div>

                                <v-chip size="small" color="secondary" variant="tonal" class="mr-2 mb-1">
                                    {{ product?.category }}
                                </v-chip>

                                <v-chip size="small" color="primary" variant="tonal" class="mb-1">
                                    ${{ product?.price?.toFixed(2) }}
                                </v-chip>

                                <div class="mt-2 text-caption">
                                    <v-icon size="small" class="mr-1">mdi-package-variant</v-icon>
                                    Stock: {{ product?.stock }} unidades
                                </div>
                            </div>
                        </div>
                    </v-card-text>
                </v-card>
            </v-card-text>

            <v-divider />

            <v-card-actions class="pa-6">
                <v-spacer />
                <v-btn variant="flat" color="grey-darken-1" @click="cancel" :disabled="loading">
                    Cancelar
                </v-btn>
                <v-btn color="error" variant="flat" @click="confirm" :loading="loading" :disabled="loading"
                    prepend-icon="mdi-delete">
                    Eliminar
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
    (e: 'confirm'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const dialog = ref(false)
const loading = ref(false)

watch(() => props.modelValue, (newVal) => {
    dialog.value = newVal
})

watch(dialog, (newVal) => {
    if (!newVal) {
        emit('update:modelValue', false)
    }
})

const confirm = () => {
    loading.value = true
    emit('confirm')
}

const cancel = () => {
    if (loading.value) return
    dialog.value = false
}

defineExpose({
    setLoading: (value: boolean) => {
        loading.value = value
    }
})
</script>

<style scoped>
.delete-modal {
    border: 2px solid #F2EAD3;
}

.modal-header {
    background: linear-gradient(135deg, #ef5350 0%, #e53935 100%);
}

.product-info {
    background-color: #F9F5F0;
    border: 1px solid #F2EAD3;
}

:deep(.v-avatar) {
    border: 2px solid #F2EAD3;
}
</style>