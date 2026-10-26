# Director de Enlaces 

Aplicación para guardar enlaces, organizarlos por etiquetas, añadir comentarios y votar.

Incluye una versión con JavaScript Vanilla y otra con React.
Ambas utilizan el mismo backend y la misma base de datos.

## Tecnologías

- HTML, CSS y JavaScript.
- React, React Router y Vite.
- Node.js y Express.
- PostgreSQL.

## Requisitos

- Node.js 22.12 o superior compatible con las dependencias.
- PostgreSQL.
- npm.

## Instalación

Desde la raíz del proyecto:

```bash
cd backend
npm install
cd ../frontend
npm install
cd ..
```

## Base de datos

Crea la base y sus tablas:

```bash
psql -U postgres -c "CREATE DATABASE link_organizer;"
psql -U postgres -d link_organizer -v ON_ERROR_STOP=1 -f backend/database/schema.sql
```

## Configuración

Copia `backend/.env.example` como `backend/.env` y completa
los datos de tu instalación:

```dotenv
PORT=3000
PGHOST=localhost
PGPORT=5432
PGDATABASE=link_organizer
PGUSER=postgres
PGPASSWORD=TU_PASSWORD
CLIENT_ORIGINS=http://localhost:5173,http://localhost:5500
```

Copia `frontend/.env.example` como `frontend/.env`:

```dotenv
VITE_API_URL=http://localhost:3000/api
```

## Ejecutar

Abre una terminal por cada aplicación.

### Backend

Desde la raíz:

```bash
cd backend
npm run dev
```

API: http://localhost:3000/api

### React

Desde la raíz:

```bash
cd frontend
npm run dev
```

Abre http://localhost:5173.

### Vanilla

Desde la raíz:

```bash
npx serve vanilla -l 5500
```

Abre http://localhost:5500.

El backend debe estar iniciado para usar cualquiera de las interfaces.

## Estructura

```text
backend/     API REST y esquema de PostgreSQL
frontend/    Aplicación React
vanilla/     Aplicación con JavaScript puro
```

React incluye dos vistas: listado con filtros y detalle con
comentarios y votos. La navegación no recarga toda la página.

## API

| Método | Ruta | Función |
|---|---|---|
| GET | /api/links | Listar enlaces |
| GET | /api/links?tag=react | Filtrar por etiqueta |
| GET | /api/links/:id | Consultar detalle |
| POST | /api/links | Guardar enlace |
| GET | /api/tags | Listar etiquetas |
| GET | /api/links/:id/comments | Consultar comentarios |
| POST | /api/links/:id/comments | Añadir comentario |
| POST | /api/links/:id/vote | Votar con value: 1 o -1 |

## Despliegue

1. Crea una base PostgreSQL en el proveedor elegido y aplica `backend/database/schema.sql`.
2. Publica el backend con `backend` como directorio de trabajo, `npm install` para instalar y `npm start` para ejecutar.
3. Configura sus variables de entorno con los datos del proveedor.Si exige TLS, configura la conexión según sus instrucciones.
 4. Configura `VITE_API_URL` con la URL pública del backend, incluyendo `/api`.
5. Ejecuta `npm run build` dentro de `frontend` y publica la carpeta `frontend/dist`.
6. Configura el hosting para servir `index.html` cuando se visiteuna ruta de React como `/links/1`.
 7. Para publicar Vanilla, cambia la URL de la API en `vanilla/js/api.js` y publica la carpeta `vanilla`.
8. Añade los orígenes públicos de las interfaces a `CLIENT_ORIGINS`.

Si cambia `VITE_API_URL`, vuelve a compilar React.

