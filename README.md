# Plataforma de Control de Ludópatas (MINCETUR)

Sistema web completo para la gestión y verificación de personas inscritas en el Registro de Ludópatas (MINCETUR).

## Características

### 🛡️ Módulo de Seguridad (Cliente)
- Interfaz ultra-minimalista diseñada para uso rápido.
- Escaneo de DNI con lector de código de barras (simplemente escanee, no requiere clicks).
- Verificación instantánea con alertas visuales grandes (ROJO/VERDE).
- Muestra foto y datos si está prohibido.

### 👤 Módulo Administrador
- Acceso seguro con correo y contraseña.
- **Carga de PDF**: Sube la base oficial de MINCETUR (PDF) y el sistema extrae automáticamente los datos.
- **Historial**: Visualización de la última actualización.
- **Gestión**: Tabla de registros con búsqueda y exportación a Excel.

## Tecnologías
- **Frontend**: React, Tailwind CSS, Vite.
- **Backend**: Node.js, Express.
- **Base de Datos**: SQLite (vía Prisma ORM).
- **PDF Parsing**: Procesamiento de texto de PDF.

## Instalación y Ejecución

### Requisitos previos
- Node.js (v18 o superior)

### Pasos

1. **Instalar dependencias**:
   ```bash
   # En la carpeta raíz
   cd server
   npm install
   npx prisma migrate dev --name init
   npx prisma generate
   npx ts-node prisma/seed.ts  # Crea el usuario admin inicial
   
   cd ../client
   npm install
   ```

2. **Iniciar el servidor (Backend)**:
   ```bash
   cd server
   npm run dev
   ```
   El servidor correrá en `http://localhost:3000`.

3. **Iniciar el cliente (Frontend)**:
   ```bash
   cd client
   npm run dev
   ```
   La aplicación abrirá en `http://localhost:5173`.

## Credenciales de Acceso

- **Usuario Admin**: `admin@admin.com`
- **Contraseña**: `admin`

## Uso

1. Ingrese a `http://localhost:5173/login` para acceder al panel administrativo.
2. Suba el PDF de MINCETUR.
3. El personal de seguridad debe usar `http://localhost:5173/security` (o la raíz `/`) para verificar DNIs.
