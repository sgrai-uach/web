# SGRAI — Web (Frontend Institucional)

Frontend web institucional para el **Sistema de Gestión de Recursos para Atención de Incidentes (SGRAI)** de la Municipalidad de Valdivia. Provee las interfaces para Call Center, Encargados de Emergencia, Supervisores y Operadores Comunales.

---

## 📋 Requisitos Previos

- **Node.js**: v20+ (administrado preferentemente con [fnm](https://github.com/Schniz/fnm))
- **npm**: v10+
- **SGRAI API**: Backend corriendo localmente en el puerto `3000` (ver documentación en `../api`)

---

## ⚙️ Configuración del Entorno

1. Copia el archivo de variables de entorno de ejemplo:

   ```bash
   cp .env.example .env.local
   ```

2. Verifica o ajusta los valores en `.env.local`:

   ```env
   # URL base de la API REST
   NEXT_PUBLIC_API_URL=http://localhost:3000

   # URL del servidor Socket.io
   NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
   ```

---

## 🚀 Instalación y Ejecución

### 1. Instalar dependencias

```bash
npm install
```

> **Nota para usuarios de fnm:** Si tu sesión de terminal no carga Node automáticamente:
> ```bash
> export PATH="$HOME/.local/share/fnm:$PATH" && eval "$(fnm env)" && npm install
> ```

### 2. Iniciar servidor de desarrollo

```bash
npm run dev
```

La aplicación estará disponible por defecto en:
👉 **[http://localhost:3000](http://localhost:3000)** (o en el puerto `3001` si el puerto 3000 está ocupado por la API).

---

## 📜 Scripts Disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia el servidor de desarrollo con Turbopack |
| `npm run build` | Compila la aplicación para producción |
| `npm run start` | Arranca el servidor compilado en producción |
| `npm run lint` | Ejecuta ESLint para validar el código |
| `npm run generate-api-types` | Genera los tipos TypeScript desde OpenAPI |

---

## 🗺️ Vistas Principales

- `/callcenter`: Módulo de recepción, filtrado, verificación y descarte de avisos de emergencia en tiempo real vía WebSockets.
