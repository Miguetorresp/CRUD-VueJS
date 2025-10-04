<template>
    <v-card class="products-table-card" elevation="3" rounded="lg">
        <v-card-title class="d-flex align-center justify-space-between pa-6 card-header">
            <div class="d-flex align-center">
                <v-icon size="32" color="primary" class="mr-3">mdi-package-variant</v-icon>
                <div>
                    <h2 class="text-h5 font-weight-bold">Catálogo de Productos</h2>
                    <p class="text-caption text-medium-emphasis mb-0 text-left">
                        Total: {{ totalProducts }} productos
                    </p>
                </div>
            </div>

            <v-select v-model="itemsPerPage" :items="[10, 20, 30, 50]" label="Por página" density="compact"
                variant="outlined" hide-details class="items-per-page-select"
                @update:model-value="onItemsPerPageChange" />
        </v-card-title>

        <v-divider />

        <!-- Tabla de Productos -->
        <v-card-text class="pa-0" :style="{ margin: '10px' }">
            <v-data-table :headers="headers" :items="products" :loading="loading" :items-per-page="itemsPerPage"
                hide-default-footer class="products-table">
                <!-- Loading -->
                <template v-slot:loading>
                    <v-skeleton-loader v-for="i in 5" :key="i" type="table-row" class="mx-4 my-2" />
                </template>

                <!-- Imagen -->
                <template v-slot:item.thumbnail="{ item }">
                    <div class="py-3">
                        <v-avatar size="60" rounded="lg" class="product-thumbnail">
                            <v-img :src="item.thumbnail" :alt="item.title" cover>
                                <template v-slot:placeholder>
                                    <v-row class="fill-height ma-0" align="center" justify="center">
                                        <v-progress-circular indeterminate color="primary" size="24" />
                                    </v-row>
                                </template>
                            </v-img>
                        </v-avatar>
                    </div>
                </template>

                <!-- Título -->
                <template v-slot:item.title="{ item }">
                    <div class="product-title">
                        <span class="font-weight-bold">{{ item.title }}</span>
                        <div class="text-caption text-medium-emphasis">
                            {{ item.brand || 'Sin marca' }}
                        </div>
                    </div>
                </template>

                <!-- Categoría -->
                <template v-slot:item.category="{ item }">
                    <v-chip size="small" color="secondary" variant="tonal" class="text-capitalize">
                        {{ item.category }}
                    </v-chip>
                </template>

                <!-- Precio -->
                <template v-slot:item.price="{ item }">
                    <div class="price-container">
                        <span class="font-weight-bold text-primary">
                            ${{ item.price.toFixed(2) }}
                        </span>
                        <v-chip v-if="item.discountPercentage > 0" size="x-small" color="error" variant="flat"
                            class="ml-2">
                            -{{ item.discountPercentage.toFixed(0) }}%
                        </v-chip>
                    </div>
                </template>

                <!-- Rating -->
                <template v-slot:item.rating="{ item }">
                    <div class="d-flex align-center">
                        <v-rating :model-value="item.rating" color="warning" active-color="warning" half-increments
                            readonly density="compact" size="small" />
                    </div>
                </template>

                <!-- Stock -->
                <template v-slot:item.stock="{ item }">
                    <v-chip :color="getStockColor(item.stock)" variant="flat" size="small" class="font-weight-bold">
                        <v-icon start size="small">
                            {{ getStockIcon(item.stock) }}
                        </v-icon>
                        {{ item.stock }} unid.
                    </v-chip>
                </template>

                <!-- Acciones -->
                <template v-slot:item.actions="{ item }">
                    <div class="d-flex justify-center ga-2">
                        <v-tooltip text="Editar producto" location="top">
                            <template v-slot:activator="{ props }">
                                <v-btn v-bind="props" icon="mdi-pencil" size="small" color="primary" variant="tonal"
                                    @click="openEditModal(item)" />
                            </template>
                        </v-tooltip>

                        <v-tooltip text="Eliminar producto" location="top">
                            <template v-slot:activator="{ props }">
                                <v-btn v-bind="props" icon="mdi-delete" size="small" color="error" variant="tonal"
                                    @click="openDeleteModal(item)" />
                            </template>
                        </v-tooltip>
                        <v-tooltip text="Ver detalles" location="top">
                            <template v-slot:activator="{ props }">
                                <v-btn v-bind="props" icon="mdi-eye" size="small" color="info" variant="tonal"
                                    @click="viewProduct(item)" />
                            </template>
                        </v-tooltip>
                    </div>
                </template>

                <!-- Sin Datos -->
                <template v-slot:no-data>
                    <div class="text-center py-8">
                        <v-icon size="64" color="grey-lighten-2">mdi-package-variant-closed</v-icon>
                        <p class="text-h6 text-medium-emphasis mt-4">No hay productos disponibles</p>
                    </div>
                </template>
            </v-data-table>
        </v-card-text>

        <v-divider />

        <!-- Paginación -->
        <v-card-actions class="pa-4 d-flex justify-space-between align-center">
            <div class="text-caption text-medium-emphasis">
                Mostrando {{ startItem }} - {{ endItem }} de {{ totalProducts }}
            </div>

            <v-pagination v-model="currentPage" :length="totalPages" :total-visible="7"
                @update:model-value="onPageChange" density="comfortable" rounded="circle" active-color="primary" />
        </v-card-actions>

        <!-- Modales -->
        <EditProductModal v-model="showEditModal" :product="selectedProduct" @save="handleUpdateProduct"
            ref="editModalRef" />

        <DeleteConfirmModal v-model="showDeleteModal" :product="selectedProduct" @confirm="handleDeleteProduct"
            ref="deleteModalRef" />

        <!-- Snackbar de Notificaciones -->
        <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000" location="top right" elevation="24">
            <div class="d-flex align-center">
                <v-icon :icon="snackbar.icon" class="mr-2" />
                {{ snackbar.message }}
            </div>
            <template v-slot:actions>
                <v-btn variant="text" @click="snackbar.show = false" icon="mdi-close" />
            </template>
        </v-snackbar>
    </v-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ProductService } from '../services/product.service'
import type { Product } from '../types/product.types'
import EditProductModal from './EditProductModal.vue'
import DeleteConfirmModal from './DeleteConfirmModal.vue'
const router = useRouter()

// Estado
const products = ref<Product[]>([])
const loading = ref(false)
const totalProducts = ref(0)
const currentPage = ref(1)
const itemsPerPage = ref(10)
const selectedProduct = ref<Product | null>(null)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const editModalRef = ref()
const deleteModalRef = ref()

// Snackbar
const snackbar = ref({
    show: false,
    message: '',
    color: 'success',
    icon: 'mdi-check-circle'
})

// Headers de la tabla
const headers = [
    { title: 'Imagen', key: 'thumbnail', sortable: false, width: '100px' },
    { title: 'Producto', key: 'title', sortable: true },
    { title: 'Categoría', key: 'category', sortable: true },
    { title: 'Precio', key: 'price', sortable: true },
    { title: 'Valoración', key: 'rating', sortable: false },
    { title: 'Stock', key: 'stock', sortable: true },
    { title: 'Acciones', key: 'actions', sortable: false, align: 'center', width: '150px' },
]

// Computed
const totalPages = computed(() => {
    return Math.ceil(totalProducts.value / itemsPerPage.value)
})

const startItem = computed(() => {
    return ((currentPage.value - 1) * itemsPerPage.value) + 1
})

const endItem = computed(() => {
    const end = currentPage.value * itemsPerPage.value
    return end > totalProducts.value ? totalProducts.value : end
})

// Métodos
const loadProducts = async () => {
    loading.value = true

    try {
        const skip = (currentPage.value - 1) * itemsPerPage.value
        const response = await ProductService.getProducts({
            limit: itemsPerPage.value,
            skip: skip
        })

        products.value = response.products
        totalProducts.value = response.total
    } catch (error) {
        console.error('Error al cargar productos:', error)
        // Aquí podrías mostrar un snackbar de error
    } finally {
        loading.value = false
    }
}

const onPageChange = (page: number) => {
    currentPage.value = page
    loadProducts()
}

const onItemsPerPageChange = () => {
    currentPage.value = 1
    loadProducts()
}

const getStockColor = (stock: number): string => {
    if (stock > 50) return 'success'
    if (stock > 20) return 'warning'
    return 'error'
}

const getStockIcon = (stock: number): string => {
    if (stock > 50) return 'mdi-check-circle'
    if (stock > 20) return 'mdi-alert'
    return 'mdi-alert-circle'
}

// Navegación para el detalle del producto
const viewProduct = (product: Product) => {
    router.push(`/product/${product.id}`)
}

// Modales
const openEditModal = (product: Product) => {
    selectedProduct.value = product
    showEditModal.value = true
    console.log('Editar producto:', product)
}

const openDeleteModal = (product: Product) => {
    selectedProduct.value = product
    showDeleteModal.value = true
}

const handleUpdateProduct = async (productData: Partial<Product>) => {
    if (!selectedProduct.value) return

    editModalRef.value?.setLoading(true)

    try {
        await ProductService.updateProduct(selectedProduct.value.id, productData)

        // Actualizar el producto en la lista local
        const index = products.value.findIndex(p => p.id === selectedProduct.value!.id)
        if (index !== -1) {
            products.value[index] = { ...products.value[index], ...productData }
        }

        showSnackbar('Producto actualizado correctamente', 'success', 'mdi-check-circle')
        showEditModal.value = false

    } catch (error) {
        console.error('Error al actualizar producto:', error)
        editModalRef.value?.setError(error instanceof Error ? error.message : 'Error al actualizar el producto')
    } finally {
        editModalRef.value?.setLoading(false)
    }
}

const handleDeleteProduct = async () => {
    if (!selectedProduct.value) return

    deleteModalRef.value?.setLoading(true)

    try {
        await ProductService.deleteProduct(selectedProduct.value.id)

        // Eliminar el producto en la lista local
        const index = products.value.findIndex(p => p.id === selectedProduct.value!.id)
        if (index !== -1) {
            products.value.splice(index, 1)
        }

        showSnackbar('Producto eliminado correctamente', 'success', 'mdi-check-circle')
        showDeleteModal.value = false


    } catch (error) {
        console.error('Error al eliminar producto:', error)
        showSnackbar('Error al eliminar el producto', 'error', 'mdi-alert-circle')
    } finally {
        deleteModalRef.value?.setLoading(false)
    }
}

const showSnackbar = (message: string, color: string, icon: string) => {
    snackbar.value = {
        show: true,
        message,
        color,
        icon
    }
}

// Lifecycle
onMounted(() => {
    loadProducts()
})
</script>

<style scoped>
.products-table-card {
    border: 1px solid #F2EAD3;
    overflow: hidden;
}

.card-header {
    background: linear-gradient(135deg, #F9F5F0 0%, #F2EAD3 100%);
}

.products-table :deep(.v-data-table__th) {
    background-color: #F9F5F0 !important;
    font-weight: 600 !important;
    color: #344F1F !important;
    text-transform: uppercase;
    font-size: 0.75rem;
    letter-spacing: 0.5px;
}

.products-table :deep(.v-data-table__td) {
    border-bottom: 1px solid #F2EAD3 !important;
}

.products-table :deep(tr:hover) {
    background-color: rgba(244, 153, 26, 0.05) !important;
}

.product-thumbnail {
    border: 2px solid #F2EAD3;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s ease;
}

.product-thumbnail:hover {
    transform: scale(1.05);
}

.product-title {
    min-width: 200px;
}

.price-container {
    display: flex;
    align-items: center;
}

.items-per-page-select {
    max-width: 120px;
}

:deep(.v-pagination__item) {
    border-radius: 50%;
}

:deep(.v-pagination__item--is-active) {
    background-color: #F4991A !important;
}

/* Responsive */
@media (max-width: 960px) {

    .products-table :deep(.v-data-table__th),
    .products-table :deep(.v-data-table__td) {
        padding: 0 8px !important;
    }

    .product-title {
        min-width: 150px;
    }
}

@media (max-width: 600px) {
    .card-header {
        flex-direction: column;
        gap: 1rem;
        align-items: flex-start !important;
    }

    .items-per-page-select {
        max-width: 100px;
    }
}
</style>