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
            <v-container class="product-detail-container py-8">
                <!-- Breadcrumbs y Botón Volver -->
                <v-row class="mb-6">
                    <v-col cols="12">
                        <div class="d-flex align-center justify-space-between">
                            <v-breadcrumbs :items="breadcrumbs" class="pa-0">
                                <template v-slot:divider>
                                    <v-icon>mdi-chevron-right</v-icon>
                                </template>
                            </v-breadcrumbs>

                            <v-btn color="secondary" prepend-icon="mdi-arrow-left" variant="tonal" @click="goBack">
                                Volver
                            </v-btn>
                        </div>
                    </v-col>
                </v-row>

                <!-- Loading State -->
                <v-row v-if="loading">
                    <v-col cols="12">
                        <v-card class="pa-6" rounded="lg">
                            <v-skeleton-loader type="article, actions" />
                        </v-card>
                    </v-col>
                </v-row>

                <!-- Error State -->
                <v-row v-else-if="error">
                    <v-col cols="12">
                        <v-alert type="error" variant="tonal" prominent border="start">
                            <v-alert-title class="text-h6">Error al cargar el producto</v-alert-title>
                            <div class="mt-2">{{ error }}</div>
                            <template v-slot:append>
                                <v-btn color="error" variant="text" @click="loadProduct">
                                    Reintentar
                                </v-btn>
                            </template>
                        </v-alert>
                    </v-col>
                </v-row>

                <!-- Product Detail -->
                <v-row v-else-if="product">
                    <v-col cols="12">
                        <v-card class="product-detail-card" elevation="4" rounded="lg">
                            <v-row no-gutters>
                                <!-- Galería de Imágenes -->
                                <v-col cols="12" md="6" class="gallery-section">
                                    <div class="pa-6">
                                        <!-- Imagen Principal -->
                                        <v-card class="main-image-card" elevation="2" rounded="lg">
                                            <v-img :src="selectedImage" :alt="product.title" aspect-ratio="1" cover
                                                class="main-image">
                                                <template v-slot:placeholder>
                                                    <v-row class="fill-height ma-0" align="center" justify="center">
                                                        <v-progress-circular indeterminate color="primary" size="64" />
                                                    </v-row>
                                                </template>
                                            </v-img>

                                            <!-- Badges sobre la imagen -->
                                            <div class="image-badges">
                                                <v-chip v-if="product.discountPercentage > 0" color="error"
                                                    variant="flat" class="discount-badge">
                                                    <v-icon start>mdi-tag</v-icon>
                                                    -{{ product.discountPercentage.toFixed(0) }}% OFF
                                                </v-chip>

                                                <v-chip :color="getStockColor(product.stock)" variant="flat"
                                                    class="stock-badge">
                                                    <v-icon start>mdi-package-variant</v-icon>
                                                    {{ getStockText(product.stock) }}
                                                </v-chip>
                                            </div>
                                        </v-card>

                                        <!-- Miniaturas -->
                                        <div class="thumbnails-container mt-4">
                                            <v-slide-group show-arrows>
                                                <v-slide-group-item v-for="(image, index) in product.images"
                                                    :key="index">
                                                    <v-card
                                                        :class="['thumbnail-card', { 'thumbnail-selected': selectedImage === image }]"
                                                        elevation="2" rounded="lg" @click="selectedImage = image">
                                                        <v-img :src="image" :alt="`${product.title} - ${index + 1}`"
                                                            aspect-ratio="1" cover class="thumbnail-image" />
                                                    </v-card>
                                                </v-slide-group-item>
                                            </v-slide-group>
                                        </div>
                                    </div>
                                </v-col>

                                <!-- Información del Producto -->
                                <v-col cols="12" md="6" class="info-section">
                                    <div class="pa-6">
                                        <!-- Categoría -->
                                        <v-chip color="secondary" variant="tonal" class="mb-3 text-capitalize">
                                            {{ product.category }}
                                        </v-chip>

                                        <!-- Título -->
                                        <h1 class="text-h5 font-weight-bold mb-2">
                                            {{ product.title }}
                                        </h1>

                                        <!-- Marca -->
                                        <div class="text-subtitle-1 text-medium-emphasis mb-4">
                                            <v-icon size="small" class="mr-1">mdi-tag-heart</v-icon>
                                            {{ product.brand || 'Sin marca' }}
                                        </div>

                                        <v-divider class="my-4" />

                                        <!-- Precio -->
                                        <div class="price-section mb-4">
                                            <div class=" align-items-end mb-2">
                                                <span class="text-h4 font-weight-bold text-primary">
                                                    ${{ product.price.toFixed(2) }}
                                                </span>
                                                <span v-if="product.discountPercentage > 0"
                                                    class="text-h6 text-decoration-line-through text-medium-emphasis ml-3">
                                                    ${{ originalPrice.toFixed(2) }}
                                                </span>
                                            </div>
                                            <div class="text-caption text-medium-emphasis text-center">
                                                Impuestos incluidos
                                            </div>
                                        </div>

                                        <!-- Stock Info -->
                                        <v-alert :type="product.stock > 20 ? 'success' : 'warning'" variant="tonal"
                                            density="compact" class="mb-6">
                                            <div class="d-flex align-center text-left">
                                                <span class="font-weight-medium">
                                                    {{ product.stock }} unidades disponibles
                                                </span>
                                            </div>
                                            <div class="text-caption mt-1 text-left">
                                                {{ product.availabilityStatus }}
                                            </div>
                                        </v-alert>

                                        <v-divider class="my-4" />

                                        <!-- Descripción -->
                                        <div class="mb-6">
                                            <h3 class="text-h6 font-weight-bold mb-3">Descripción</h3>
                                            <p class="text-body-1">{{ product.description }}</p>
                                        </div>


                                    </div>
                                </v-col>
                            </v-row>
                            <v-divider />
                            <v-row class="pa-6">
                                <v-col cols="12" md="12">
                                    <!-- Especificaciones -->
                                    <div class="mb-6">
                                        <h3 class="text-h6 font-weight-bold mb-3">Especificaciones</h3>
                                        <v-row>
                                            <v-col cols="12" md="6">
                                                <v-list density="compact" class="specs-list">
                                                    <v-list-item v-if="product.sku">
                                                        <template v-slot:prepend>
                                                            <v-icon>mdi-barcode</v-icon>
                                                        </template>
                                                        <v-list-item-title>SKU</v-list-item-title>
                                                        <v-list-item-subtitle>{{ product.sku }}</v-list-item-subtitle>
                                                    </v-list-item>

                                                    <v-list-item v-if="product.weight">
                                                        <template v-slot:prepend>
                                                            <v-icon>mdi-weight</v-icon>
                                                        </template>
                                                        <v-list-item-title>Peso</v-list-item-title>
                                                        <v-list-item-subtitle>{{ product.weight }}
                                                            kg</v-list-item-subtitle>
                                                    </v-list-item>

                                                    <v-list-item v-if="product.dimensions">
                                                        <template v-slot:prepend>
                                                            <v-icon>mdi-ruler</v-icon>
                                                        </template>
                                                        <v-list-item-title>Dimensiones</v-list-item-title>
                                                        <v-list-item-subtitle>
                                                            {{ product.dimensions.width }} x
                                                            {{ product.dimensions.height }} x
                                                            {{ product.dimensions.depth }} cm
                                                        </v-list-item-subtitle>
                                                    </v-list-item>

                                                    <v-list-item v-if="product.warrantyInformation">
                                                        <template v-slot:prepend>
                                                            <v-icon>mdi-shield-check</v-icon>
                                                        </template>
                                                        <v-list-item-title>Garantía</v-list-item-title>
                                                        <v-list-item-subtitle>{{ product.warrantyInformation
                                                        }}</v-list-item-subtitle>
                                                    </v-list-item>


                                                </v-list>
                                            </v-col>

                                            <v-col cols="12" md="6">
                                                <v-list density="compact" class="specs-list">

                                                    <v-list-item v-if="product.shippingInformation">
                                                        <template v-slot:prepend>
                                                            <v-icon>mdi-truck-delivery</v-icon>
                                                        </template>
                                                        <v-list-item-title>Envío</v-list-item-title>
                                                        <v-list-item-subtitle>{{ product.shippingInformation
                                                        }}</v-list-item-subtitle>
                                                    </v-list-item>

                                                    <v-list-item v-if="product.returnPolicy">
                                                        <template v-slot:prepend>
                                                            <v-icon>mdi-keyboard-return</v-icon>
                                                        </template>
                                                        <v-list-item-title>Política de devolución</v-list-item-title>
                                                        <v-list-item-subtitle>{{ product.returnPolicy
                                                        }}</v-list-item-subtitle>
                                                    </v-list-item>

                                                    <v-list-item v-if="product.minimumOrderQuantity">
                                                        <template v-slot:prepend>
                                                            <v-icon>mdi-cart</v-icon>
                                                        </template>
                                                        <v-list-item-title>Cantidad mínima</v-list-item-title>
                                                        <v-list-item-subtitle>{{ product.minimumOrderQuantity }}
                                                            unidades</v-list-item-subtitle>
                                                    </v-list-item>
                                                </v-list>
                                            </v-col>
                                        </v-row>
                                    </div>

                                    <!-- Reviews -->
                                    <div v-if="product.reviews && product.reviews.length > 0">
                                        <h3 class="text-h6 font-weight-bold mb-3">Reseñas de clientes</h3>

                                        <!-- Rating y Reviews -->
                                        <div class="align-center mb-6 text-center">
                                            <v-rating :model-value="product.rating" color="warning"
                                                active-color="warning" half-increments readonly density="compact" />
                                            <span class="text-h6 ml-2 font-weight-bold">
                                                {{ product.rating.toFixed(1) }}
                                            </span>
                                            <span class="text-body-2 text-medium-emphasis ml-2">
                                                ({{ product.reviews?.length || 0 }} reseñas)
                                            </span>
                                        </div>

                                        <v-card v-for="(review, index) in product.reviews" :key="index"
                                            class="mx-auto my-4 text-left" color="grey-lighten-4">
                                            <v-card-title>
                                                {{ review.reviewerName }}
                                            </v-card-title>

                                            <v-card-subtitle>
                                                <v-rating :model-value="review.rating" color="warning"
                                                    active-color="warning" readonly density="compact" size="small" />({{
                                                        review.rating.toFixed(1) }})
                                            </v-card-subtitle>

                                            <v-card-text>
                                                {{ review.comment }}
                                                <p class="text-muted text-right"><i>{{ formatDate(review.date) }}</i>
                                                </p>
                                            </v-card-text>
                                        </v-card>
                                    </div>
                                </v-col>
                            </v-row>
                        </v-card>
                    </v-col>
                </v-row>
            </v-container>
        </v-main>
    </v-app>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { AuthService } from '../services/auth.service'
import { ProductService } from '../services/product.service'
import type { Product } from '../types/product.types'
import type { LoginResponse } from '../types/auth.types'

const router = useRouter()
const route = useRoute()
const user = ref<LoginResponse | null>(null)
const token = ref<string | null>(null)

const product = ref<Product | null>(null)
const loading = ref(false)
const error = ref('')
const selectedImage = ref('')

const breadcrumbs = computed(() => [
    {
        title: 'Dashboard',
        disabled: false,
        href: '/dashboard',
    },
    {
        title: product.value?.title || 'Cargando...',
        disabled: true,
    },
])

const originalPrice = computed(() => {
    if (!product.value) return 0
    const discount = product.value.discountPercentage / 100
    return product.value.price / (1 - discount)
})

const loadProduct = async () => {
    loading.value = true
    error.value = ''

    try {
        const productId = Number(route.params.id)
        if (isNaN(productId)) {
            throw new Error('ID de producto inválido')
        }

        const data = await ProductService.getProductById(productId)
        product.value = data
        selectedImage.value = data.thumbnail || data.images[0]
    } catch (err) {
        console.error('Error al cargar producto:', err)
        error.value = err instanceof Error ? err.message : 'Error desconocido'
    } finally {
        loading.value = false
    }
}

const goBack = () => {
    router.push('/dashboard')
}

const getStockColor = (stock: number): string => {
    if (stock > 50) return 'success'
    if (stock > 20) return 'warning'
    return 'error'
}

const getStockText = (stock: number): string => {
    if (stock > 50) return 'Disponible'
    if (stock > 20) return 'Pocas unidades'
    return 'Stock bajo'
}

const getStockIcon = (stock: number): string => {
    if (stock > 50) return 'mdi-check-circle'
    else if (stock > 20) return 'mdi-alert'
    return 'mdi-alert-circle'
}

const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
}

onMounted(() => {
    loadProduct()
    user.value = AuthService.getUser()
    token.value = AuthService.getToken()
})

const handleLogout = () => {
    AuthService.logout()
    router.push('/login')
}
</script>

<style scoped>
.product-detail-container {
    background-color: #F9F5F0;
    min-height: 100vh;
}

.product-detail-card {
    border: 1px solid #F2EAD3;
    overflow: hidden;
}

.gallery-section {
    background-color: #FFFFFF;
}

.main-image-card {
    position: relative;
    border: 2px solid #F2EAD3;
    overflow: hidden;
}

.main-image {
    cursor: zoom-in;
}

.image-badges {
    position: absolute;
    top: 16px;
    right: 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.discount-badge,
.stock-badge {
    font-weight: 700;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.thumbnails-container {
    max-width: 100%;
}

.thumbnail-card {
    width: 80px;
    height: 80px;
    margin-right: 8px;
    cursor: pointer;
    border: 2px solid transparent;
    transition: all 0.3s ease;
}

.thumbnail-card:hover {
    border-color: #F4991A;
    transform: scale(1.05);
}

.thumbnail-selected {
    border-color: #F4991A !important;
    box-shadow: 0 4px 12px rgba(244, 153, 26, 0.4);
}

.thumbnail-image {
    width: 100%;
    height: 100%;
}

.price-section {
    padding: 16px;
    background: linear-gradient(135deg, rgba(244, 153, 26, 0.1) 0%, rgba(244, 153, 26, 0.05) 100%);
    border-radius: 12px;
    border: 1px solid #F2EAD3;
}

.specs-list {
    background-color: transparent;
    text-align: left;
}

.specs-list :deep(.v-list-item) {
    border-bottom: 1px solid #F2EAD3;
}

.specs-list :deep(.v-list-item:last-child) {
    border-bottom: none;
}

:deep(.v-breadcrumbs-item--link) {
    color: #F4991A !important;
}

:deep(.v-breadcrumbs-item--link:hover) {
    text-decoration: underline;
}

/* Responsive */
@media (max-width: 960px) {
    .info-section {
        background-color: #FFFFFF;
    }

    .price-section {
        background: linear-gradient(135deg, rgba(244, 153, 26, 0.15) 0%, rgba(244, 153, 26, 0.08) 100%);
    }
}

@media (max-width: 600px) {
    .thumbnail-card {
        width: 60px;
        height: 60px;
    }

    .image-badges {
        top: 8px;
        right: 8px;
    }
}
</style>