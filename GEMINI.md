@AGENTS.md

# GEMINI.md — sgrai-web

Este archivo da contexto arquitectónico a cualquier asistente de IA que trabaje sobre este repositorio, que es la **plataforma web** del Sistema de Gestión de Recursos para Atención de Incidentes (SGRAI), de la Dirección de Gestión de Riesgos de Desastres de la Municipalidad de Valdivia.

## 1. Rol de este repositorio en el sistema

`sgrai-web` es el cliente de **presentación web** del sistema. Según el diagrama de componentes, agrupa **todos los roles que operan desde navegador/escritorio**, incluyendo el portal público de reporte de incidentes:

- **Portal Informante** — reporte guiado de incidentes por parte de ciudadanos.
- **Centro Call Center** — recepción y verificación manual de avisos.
- **Centro de Mando (Encargado)** — asignación de patrullas, cuadrillas, recursos y misiones.
- **Dashboard Estratégico (Supervisor)** — estadísticas, reportes SENAPRED, seguimiento.
- **Panel Administrador** — gestión de usuarios, permisos y recursos.
- **Panel Asistente Social** — gestión de fichas FIBE y eventos de asistencia social.

Este repositorio **no contiene lógica de negocio propia**. Toda regla de negocio, validación de datos y cálculo vive en `sgrai-api`. Este repositorio consume esa API vía **HTTPS/REST** y Socket.io para actualizaciones en tiempo real (ej. estado de incidentes, ubicación de cuadrillas en el mapa).

> Nota importante: el rol **Informante** vive en este repositorio (web), **no** en `sgrai-pwa`. La PWA de terreno está reservada para Patrulla Verificadora y Delegado de Cuadrilla, que sí necesitan soporte offline y acceso nativo a GPS/cámara. El Informante reporta desde un navegador estándar, sin esos requisitos.

## 2. Stack tecnológico de este repositorio

- **Framework:** Next.js (React) con TypeScript, usado aquí exclusivamente como **frontend** (renderizado de UI, no API Routes de negocio).
- **Mapas (GIS):** Leaflet + OpenStreetMap — usado en Centro de Mando y Dashboard Estratégico para la vista cartográfica de incidentes, cuadrillas, patrullas y asistentes sociales en terreno.
- **Tiempo real:** cliente de Socket.io, para reflejar en el mapa y en los listados cambios de estado sin recargar.
- **Infraestructura:** Docker, servido detrás de Caddy junto con `sgrai-api` y `sgrai-pwa` en el mismo despliegue On-Premise.

## 3. Guía visual: paleta de colores y estilo de UI

Toda interfaz de este repositorio debe usar la paleta y el estilo visual del sitio institucional de la Municipalidad de Valdivia (www.valdivia.cl) como base, para mantener consistencia con la identidad municipal. **No** tomes como referencia los colores de banners de noticias/campañas puntuales (ej. el rojo navideño del banner "Fondo Navidades Comunitarias") — esos son contenido editorial variable, no parte de la paleta de marca.

### Paleta de colores

| Token | Uso | Aproximación |
|---|---|---|
| `--color-primary-teal` | Encabezados de sección, texto de enlaces, íconos de sección (ej. "Noticias", "Servicios Municipales") | `#1B6F7D` |
| `--color-primary-teal-dark` | Barra de navegación principal, franjas oscuras de acento | `#14505A` |
| `--color-accent-mint` | Botones de acción principal ("Ingresa aquí", CTAs destacados) | `#4FAE9B` |
| `--color-sage` | Franjas utilitarias superior/inferior (aviso de noticias, bloque de enlaces institucionales al pie) | `#A9CBA4` |
| `--color-charcoal` | Bloques de enlaces secundarios (ej. "DOM Digital", "Licencia de Conducir"), panel lateral "¿Qué necesitas?" | `#3B3F45` |
| `--color-charcoal-dark` | Fondo del footer | `#24272B` |
| `--color-bg-light` | Fondo de secciones de contenido (detrás de tarjetas de noticias/servicios) | `#ECEFF3` |
| `--color-white` | Fondo de tarjetas, fondo principal | `#FFFFFF` |
| `--color-text-dark` | Texto sobre fondos claros | `#2B2B2B` |
| `--color-text-light` | Texto sobre fondos oscuros (charcoal, teal-dark) | `#FFFFFF` |

### Estilo de componentes (observado del sitio de referencia)

- **Botones: esquinas rectas, no redondeadas.** Nada de `border-radius` grande ni estilo "pill" — los bloques de enlace y los CTA son rectángulos sólidos y planos (ver bloques tipo "DOM Digital", "Ordenanzas Municipales", franjas de "Ingresa aquí").
- **Dos estilos de botón/bloque:**
  - *Primario* (acción principal, ej. "Más información", "Ingresa aquí"): fondo `--color-accent-mint` o `--color-primary-teal`, texto blanco, sin sombra, sin degradado.
  - *Secundario* (enlace utilitario/informativo, ej. accesos del panel "¿Qué necesitas?", bloques de trámites): fondo `--color-charcoal`, texto blanco.
- **Diseño plano (flat):** sin sombras pronunciadas ni degradados; el contraste se logra por bloques de color sólido, no por elevación.
- **Tarjetas:** fondo blanco, imagen en la parte superior, texto debajo, fecha o etiqueta corta en el color de acento; bordes rectos.
- **Encabezados de sección:** ícono simple + texto en negrita en `--color-primary-teal`, casi siempre acompañados de un enlace "Ver todos" al final de la sección.
- **Carruseles:** para contenido tipo galería (noticias, servicios, videos, álbumes), con flechas de navegación circulares a los costados y paginación por puntos — esta es la única excepción a "no redondeado", ya que son controles de navegación, no botones de acción.
- **Franjas de acento:** bandas de color sólido (sage o teal oscuro) usadas para agrupar accesos institucionales, tanto en la parte superior como en el pie de página, antes del footer oscuro.
- **Jerarquía por bloques de color, no por tipografía extensa:** se prioriza el uso de bloques de color plano para diferenciar tipos de contenido (informativo vs. transaccional vs. institucional) por sobre variaciones tipográficas.

Aplica esta guía a los paneles de todos los roles de este repositorio (Informante, Call Center, Encargado, Supervisor, Administrador, Asistente Social), ajustando qué colores predominan según el contexto (ej. el Centro de Mando, al ser una vista densa en datos, puede apoyarse más en `--color-bg-light` y `--color-charcoal` para tablas/paneles, reservando `--color-accent-mint` solo para acciones de asignación).

## 4. Comunicación con el backend

Este repositorio consume `sgrai-api` como único origen de datos y lógica. Reglas para cualquier cambio en este repositorio:

- Nunca dupliques reglas de negocio en el cliente (ej. validaciones de transición de estado de incidente) — deben vivir en `sgrai-api`; en el frontend solo se reflejan para UX (feedback inmediato), nunca como fuente de verdad.
- Los cambios de UI que impliquen un endpoint nuevo o modificado en `sgrai-api` requieren coordinación con ese repositorio antes de mergear.
- **Nunca escribas a mano los tipos de request/response de la API.** Se generan automáticamente desde el spec OpenAPI que expone `sgrai-api`, para que este repositorio nunca pueda divergir silenciosamente del contrato real.

### Cómo consumir la API en este repositorio

1. Como parte del build (idealmente automatizado en CI, antes de compilar), se generan los tipos desde el spec de `sgrai-api`:

   ```bash
   npx openapi-typescript https://api.sgrai.cl/openapi.json -o src/types/api-generated.d.ts
   ```

   Ese archivo `api-generated.d.ts` es generado, **no se edita a mano**.

2. Las llamadas a la API se hacen con un cliente tipado (ej. `openapi-fetch`) que usa esos tipos generados:

   ```typescript
   import createClient from 'openapi-fetch';
   import type { paths } from '@/types/api-generated';

   const client = createClient<paths>({ baseUrl: process.env.NEXT_PUBLIC_API_URL });

   const { data, error } = await client.POST('/incidentes', {
     body: { tipo: 'Inundación', descripcion: 'Agua entra a la vivienda', lat: -39.8, lng: -73.2 },
   });
   ```

3. Si `sgrai-api` cambia un endpoint (ej. renombra un campo o agrega uno obligatorio), la próxima regeneración de tipos hará que el código que quedó desactualizado **falle al compilar** en vez de romperse silenciosamente en producción. Si ves un error de tipos después de regenerar, es señal de que hay que revisar el uso de ese endpoint, no de "forzar" el tipo con `as any`.

## 5. Reglas de negocio relevantes para la UI de este repositorio

- Ciclo de vida de incidente a reflejar en listados/tableros: `Reportado → Verificando → En Atención → No Abordable / Resuelto`.
- Cuando el Encargado asigna una cuadrilla u otro recurso a un incidente ya evaluado, la UI debe reflejar que la **patrulla verificadora queda liberada** (disponible nuevamente).
- Las cuadrillas pueden rechazar una misión con justificación — el Centro de Mando debe mostrar el motivo del rechazo, no solo el estado "rechazada".
- Se pueden crear eventos de **prevención** o **recuperación** sobre "puntos críticos" sin exigir un incidente formal previo — no bloquees ese flujo en el formulario exigiendo un incidente asociado.
- No existe módulo de "Albergues" en la UI. Los casos vulnerables se marcan con un indicador "requiere asistencia social" a nivel de incidente, que deriva a la vista de Asistencia Social (levantamiento de Ficha FIBE).
- Todos los listados (incidentes, recursos, personal, misiones, avisos) deben soportar **filtros por delegación, estado y otros atributos** — es un requisito transversal repetido en varias historias de usuario (Encargado, Supervisor, Call Center).

## 6. Roles y vistas de este repositorio

| Rol | Vista principal | Acciones clave |
|---|---|---|
| Informante | Portal Informante | Reportar incidente guiado, ver estado del reporte, botón de llamada directa |
| Call Center | Centro Call Center | Ver bandeja de avisos, verificarlos, ingresar reportes manuales, filtrar bandeja |
| Encargado | Centro de Mando | Ver/asignar recursos, patrullas, cuadrillas; tablero Kanban de incidentes; timeline de misión; crear eventos ATP; asignar asistentes sociales |
| Supervisor | Dashboard Estratégico | Resumen estadístico, reportes para SENAPRED, listados de incidentes/misiones/recursos, vista cartográfica |
| Administrador | Panel Administrador | Gestión de permisos por perfil, alta/edición/baja de recursos y personal |
| Asistente Social | Panel Asistente Social | Gestión de fichas FIBE derivadas de incidentes o eventos de asistencia social |

## 7. Manuales de usuario

Cada funcionalidad de cara a un rol debe entregarse junto con su manual de usuario, no como una tarea aparte para después.

- **Ubicación estándar:** `/docs/manuales-usuario/` en la raíz de este repositorio.
- **Convención de nombre:** un archivo por historia de usuario o por funcionalidad agrupada, siguiendo el ID del backlog: `H<numero>-<slug-corto>.md` (ej. `H1-reportar-incidente.md`, `H18-dashboard-kpis-encargado.md`). Si varias HU conforman una sola pantalla/flujo coherente para el usuario final, se puede consolidar en un solo manual (ej. `H14-H34-centro-de-mando-encargado.md`), indicando en el encabezado qué HU cubre.
- **Cuándo se crea:** como parte del mismo PR que implementa la funcionalidad — no se abre un PR aparte de documentación después. Si el PR no incluye el manual correspondiente, no debería pasar la Pair Review.
- **Contenido mínimo de cada manual:**
  - Rol(es) al que está dirigido.
  - Objetivo de la funcionalidad en una o dos frases (qué problema resuelve para ese rol).
  - Pasos numerados para completar el flujo, con capturas de pantalla (guardadas en `/docs/manuales-usuario/assets/<mismo-slug>/`).
  - Casos especiales o mensajes de error esperables y qué hacer ante ellos.
- Si la funcionalidad involucra datos o acciones que también afectan `sgrai-api` o `sgrai-pwa` (ej. un incidente que después ve la Patrulla Verificadora), menciona brevemente esa relación al final del manual, con un link relativo al manual correspondiente en el otro repositorio si ya existe.

## 8. Flujo de trabajo de desarrollo (aplica a los 3 repositorios)

- **Ramas:** Gitflow.
- **Versionado:** SemVer.
- **Commits:** Conventional Commits.
- **Integración:** toda funcionalidad nace en una rama nueva → PR → **Pair Review** obligatoria (otro desarrollador) → **PO Review** obligatoria → merge solo con ambas aprobaciones.
