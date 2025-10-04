# CRUD-VueJS

Aplicación de ejemplo: CRUD de productos construida con Vue 3 + TypeScript y Vuetify 3. Consume la API pública de DummyJSON para autenticación y gestión de productos.

## Resumen

Este proyecto es una pequeña interfaz administrativa para listar, ver, editar y eliminar productos. Incluye:

- Login con llamadas a `https://dummyjson.com/auth/login`.
- Listado paginado de productos (`https://dummyjson.com/products`).
- Vista de detalle de producto con galería, especificaciones y reseñas.
- Modales para editar y confirmar eliminación.
- Protección de rutas (guardado en `localStorage` de token y redirección según estado de autenticación).

El objetivo es servir como ejemplo práctico de integración con una API REST, uso de Vuetify 3 y buenas prácticas con composición API de Vue 3 y TypeScript.

## Stack

- Vue 3
- TypeScript
- Vite
- Vuetify 3
- DummyJSON (API pública de pruebas)

---

💻 Desarrollado por Dev. Miguel Torres
