# sgrai-web

Plataforma web del Sistema de Gestion de Recursos para Atencion de Incidentes (SGRAI), desarrollada para la Direccion de Gestion de Riesgos de Desastres de la Municipalidad de Valdivia.

Este repositorio contiene el cliente de presentacion web del sistema. Agrupa todos los roles que operan desde navegador/escritorio, incluyendo el portal publico de reporte de incidentes. No contiene logica de negocio propia; toda regla de negocio, validacion de datos y calculo vive en `sgrai-api`.

## Roles y vistas

| Rol | Vista principal | Descripcion |
|---|---|---|
| Informante | Portal Informante | Reporte guiado de incidentes por parte de ciudadanos |
| Call Center | Centro Call Center | Recepcion y verificacion manual de avisos |
| Encargado | Centro de Mando | Asignacion de patrullas, cuadrillas, recursos y misiones |
| Supervisor | Dashboard Estrategico | Estadisticas, reportes SENAPRED, seguimiento |
| Administrador | Panel Administrador | Gestion de usuarios, permisos y recursos |
| Asistente Social | Panel Asistente Social | Gestion de fichas FIBE y eventos de asistencia social |

## Stack tecnologico

- **Framework:** Next.js (React) con TypeScript, usado exclusivamente como frontend.
- **Mapas (GIS):** Leaflet + OpenStreetMap.
- **Tiempo real:** cliente Socket.io.
- **Cliente API:** openapi-fetch con tipos generados desde el spec OpenAPI de sgrai-api.
- **Estilos:** CSS vanilla con tokens de la paleta institucional de la Municipalidad de Valdivia.
- **Infraestructura:** Docker, servido detras de Caddy junto con sgrai-api y sgrai-pwa.

## Estructura del proyecto

```
sgrai-web/
  src/
    app/                          Rutas de la aplicacion (App Router)
      (informante)/               Portal Informante
      (callcenter)/               Centro Call Center
      (mando)/                    Centro de Mando (Encargado)
      (dashboard)/                Dashboard Estrategico (Supervisor)
      (admin)/                    Panel Administrador
      (asistente-social)/         Panel Asistente Social
    components/
      ui/                         Componentes UI reutilizables
      maps/                       Componentes de mapa (Leaflet)
      layout/                     Componentes de layout (header, sidebar, footer)
    lib/
      api/                        Cliente API tipado (openapi-fetch)
      socket/                     Configuracion del cliente Socket.io
    hooks/                        Custom React hooks
    types/                        Tipos TypeScript (incluido api-generated.d.ts)
    styles/                       Estilos globales y tokens CSS
  docs/
    manuales-usuario/             Manuales de usuario por funcionalidad
      assets/                     Capturas de pantalla para los manuales
  public/                         Archivos estaticos
```

## Requisitos previos

- Node.js >= 24
- npm >= 12

## Desarrollo local

1. Clonar el repositorio:

   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd sgrai-web
   ```

2. Instalar dependencias:

   ```bash
   npm install
   ```

3. Copiar el archivo de variables de entorno y completar los valores:

   ```bash
   cp .env.example .env.local
   ```

4. Iniciar el servidor de desarrollo:

   ```bash
   npm run dev
   ```

   La aplicacion estara disponible en `http://localhost:3000`.

## Scripts disponibles

| Script | Descripcion |
|---|---|
| `npm run dev` | Inicia el servidor de desarrollo de Next.js |
| `npm run build` | Genera el build de produccion |
| `npm run start` | Inicia el servidor de produccion (requiere build previo) |
| `npm run lint` | Ejecuta ESLint sobre el codigo fuente |
| `npm run generate-api-types` | Regenera los tipos TypeScript desde el spec OpenAPI de sgrai-api |

## Generacion de tipos de la API

Los tipos de request/response de la API no se escriben a mano. Se generan automaticamente desde el spec OpenAPI que expone sgrai-api:

```bash
npm run generate-api-types
```

Si sgrai-api cambia un endpoint, la proxima regeneracion de tipos hara que el codigo desactualizado falle al compilar, en lugar de romperse silenciosamente en produccion.

## Docker

Para construir y levantar el contenedor:

```bash
docker compose up --build
```

## Flujo de trabajo de desarrollo

- **Ramas:** Gitflow (main, develop, feature/*, release/*, hotfix/*).
- **Versionado:** SemVer.
- **Commits:** Conventional Commits.
- **Integracion:** toda funcionalidad nace en una rama nueva, pasa por PR con Pair Review y PO Review obligatorias antes de merge.

## Documentacion adicional

- `GEMINI.md` — contexto arquitectonico detallado del repositorio.
- `docs/manuales-usuario/` — manuales de usuario por funcionalidad.
