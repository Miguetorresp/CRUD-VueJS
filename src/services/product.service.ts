import type { ProductsResponse, ProductQueryParams, Product } from '../types/product.types'
import { AuthService } from './auth.service'

const API_URL = 'https://dummyjson.com/products'

export class ProductService {
  static async getProducts(params?: ProductQueryParams): Promise<ProductsResponse> {
    try {
      const token = AuthService.getToken()
      
      // Construir query params
      const queryParams = new URLSearchParams()
      if (params?.limit) queryParams.append('limit', params.limit.toString())
      if (params?.skip) queryParams.append('skip', params.skip.toString())
      if (params?.select) queryParams.append('select', params.select)

      const url = queryParams.toString() 
        ? `${API_URL}?${queryParams.toString()}`
        : API_URL

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Error al obtener los productos')
      }

      const data: ProductsResponse = await response.json()
      return data
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Error desconocido al obtener productos')
    }
  }

  static async getProductById(id: number): Promise<Product> {
    try {
      const token = AuthService.getToken()

      const response = await fetch(`${API_URL}/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Error al obtener el producto')
      }

      const data: Product = await response.json()
      return data
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Error desconocido al obtener el producto')
    }
  }
  
  static async searchProducts(query: string, params?: ProductQueryParams): Promise<ProductsResponse> {
    try {
      const token = AuthService.getToken()
      
      const queryParams = new URLSearchParams({ q: query })
      if (params?.limit) queryParams.append('limit', params.limit.toString())
      if (params?.skip) queryParams.append('skip', params.skip.toString())

      const response = await fetch(`${API_URL}/search?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Error al buscar productos')
      }

      const data: ProductsResponse = await response.json()
      return data
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Error desconocido al buscar productos')
    }
  }

  static async updateProduct(id: number, productData: Partial<Product>): Promise<Product> {
    try {
      const token = AuthService.getToken()

      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      })

      if (!response.ok) {
        throw new Error('Error al actualizar el producto')
      }

      const data: Product = await response.json()
      return data
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Error desconocido al actualizar el producto')
    }
  }

  static async deleteProduct(id: number): Promise<{ id: number; isDeleted: boolean }> {
    try {
      const token = AuthService.getToken()

      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Error al eliminar el producto')
      }

      const data = await response.json()
      return data
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Error desconocido al eliminar el producto')
    }
  }
}