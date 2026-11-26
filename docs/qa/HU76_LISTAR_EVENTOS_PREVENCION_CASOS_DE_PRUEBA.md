# Informe y Matriz de Casos de Prueba (QA): HU-76 — Listado y Supervisión de Eventos Preventivos en Puntos Críticos

> **Documento Oficial de Aseguramiento de Calidad (QA) — Frontend Web**  
> **Proyecto:** Sistema de Gestión de Recursos para Atención de Incidentes (SGRAI) — Dirección de Gestión de Riesgos de Desastres, Municipalidad de Valdivia.  
> **Módulo:** Centro de Mando / Supervisión de Obras de Mitigación Preventiva (`sgrai-web` — `/gestion/centro-incidentes?tab=prevencion`).  
> **Historia de Usuario:** HU-76 — *"Como Encargado Quiero consultar un listado de los eventos y misiones preventivas desplegadas en puntos críticos comunales Para supervisar las obras de mitigación activas (limpieza de sumideros, fajas cortafuego) y asegurar la protección anticipada de sectores vulnerables."*  
> **Desarrollador Asignado:** zetastormy  
> **Equipo Auditor:** Aseguramiento de Calidad (QA) — Proyecto SGRAI  
> **Servicio Web Auditado:** `sgrai-web` (Next.js 16.3.4 App Router + React 19.2.8 + TypeScript 5 + Vitest v3.2.7 + Testing Library + CSS Modules / Vanilla CSS).  
> **Rama Git Evaluada:** `feature/H76-listar-eventos-prevencion`  
> **Commits Clave Evaluados:**  
> * `feat(mando): implementar listado de eventos preventivos y drawer postgis en centro de incidentes (HU-76)`  
> * `fix(prevencion): inicializar estado de carga segun autoLoad en useEventosPrevencion`  
> * `fix(build): cargar Noto Sans localmente con next/font/local para evitar fallo en build Docker CI`  
> * `merge: sincronizar con develop resolviendo conflicto en layout.tsx`  
> * `fix(mando): resolver observaciones de QA para listado de eventos preventivos (HU-76)`  
>  
> **Fecha de Auditoría Inicial QA:** 25 de Noviembre de 2026 17:33.  
> **Fecha de Re-Test #1 QA:** 26 de Noviembre de 2026 15:05.  
> **Estado de Certificación:** 🔴 **CAMBIOS SOLICITADOS (`CHANGES REQUESTED`) — 6 DEFECTOS CORREGIDOS, 2 DEFECTOS ABIERTOS (1 REMANENTE EN MANUAL + 1 REGRESIÓN CSS EN RE-TEST #1)**.

---

## 1. Resumen Ejecutivo de Pruebas (Re-Test #1)

| Métrica | Resultado | Observaciones Técnicas |
|---|:---:|---|
| **Total de Casos de Prueba Ejecutados** | **28** | 20 Casos Funcionales/UI/Integración/Seguridad/Calidad + 8 Defectos Gestionados (7 de auditoría inicial + 1 regresión en Re-Test #1) |
| **Casos Aprobados (`APROBADO` / `CORREGIDO`)** | **26** | 20 casos base aprobados + 6 defectos verificados y cerrados (`BUG-H76-WEB-01`, `02`, `03`, `04`, `05` y `07`) |
| **Defectos Abiertos (`ABIERTO`)** | **2** | 1 Alta (`BUG-H76-WEB-08`: clases CSS inexistentes en `EventosPrevencionFiltros.tsx` y borde de badge) y 1 Media (`BUG-H76-WEB-06`: capturas del manual copiadas de H38) |
| **Casos Bloqueados (`BLOQUEADO`)** | **0** | Sin bloqueos de entorno; backend `sgrai-api` y PostGIS operativos para evidencia HTTP real |
| **Tasa de Aprobación Global (% Pass)** | **92.9%** | No alcanza el 100% requerido para certificación; se requiere Re-Test #2 tras subsanar los 2 defectos abiertos |
| **Análisis Estático de Código (`npm run lint`)** | 🟢 **0 errores** | Ejecución de ESLint sin errores bloqueantes (`exit code 0`) |
| **Chequeo de Tipos Estáticos (`npx tsc --noEmit`)** | 🟢 **0 errores** | Compilación TypeScript limpia tras regeneración de tipos Next.js (`next typegen`) |
| **Compilación de Producción (`npm run build`)** | 🟢 **Exit 0** | Build Webpack de Next.js 16.3.4 completado (49/49 páginas generadas, tipografía local Noto Sans oficial de `develop` operativa) |
| **Suite Automatizada del Módulo Prevención (Vitest)** | 🟢 **44/44 tests pass** | 7 suites ejecutadas (`prevencionService` 12, `useEventosPrevencion` 7, `EventosPrevencionFiltros` 6, `EventoPrevencionDrawer` 6, `EventosPrevencionView` 5, `EventosPrevencionTabla` 4, `KanbanViewSwitcher` 4); cero advertencias `act(...)` |
| **Suite Global del Proyecto (Vitest)** | 🟢 **1032/1032 tests pass** | 143 archivos de prueba ejecutados sin regresiones en módulos existentes |
| **Control de Acceso Perimetral (RBAC)** | 🟢 **PROTEGIDO** | `autoLoad`, catálogos, WebSocket y `replaceState` condicionados a `isMounted && puedeLeer`; `prevencion:eventos:leer` validado estrictamente (`BUG-H76-WEB-01` cerrado) |
| **Concurrencia, Debounce y Contrato H34/OpenAPI** | 🟢 **VERIFICADO** | Debounce 300 ms y guardia `requestIdRef` verificados; `recursos`, `creadoPorId`, `errors` 400 y `500` incorporados; sincronización URL y `KanbanBoard` corregidos (`BUG-H76-WEB-02`, `03`, `04`, `05`, `07` cerrados) |
| **Guía Visual CSS Modules y Manual de Usuario** | 🔴 **CON HALLAZGOS** | Regresión de clases CSS inexistentes (`styles.filtrosBar` / `styles.filtrosHeader`) en `EventosPrevencionFiltros.tsx` (`BUG-H76-WEB-08`) y capturas de HU-38 reutilizadas en el manual de HU-76 (`BUG-H76-WEB-06`) |

> **Nota de Alineación de Dominio (Estado `EN_CURSO` vs `EN_EJECUCION`):** En el backend `sgrai-api` (`evento-prevencion.schema.ts` y tabla PostgreSQL `evento_prevencion`), el valor canónico del enum de estado en ejecución es `EN_CURSO`, el cual la interfaz web mapea consistentemente a la etiqueta visible **"En Ejecución"** (`ESTADOS_PREVENCION`). Se valida que el envío del valor `EN_EJECUCION` al endpoint retorna `400 Bad Request` conforme al contrato real de `sgrai-api`.

---

## 2. Registro Técnico de Defectos Detectados y Validación de Re-Test #1

| ID Defecto | Descripción Técnica del Defecto | Severidad | Módulo / Archivo Afectado | Fecha Detección | Estado | Commit del Fix (Sin Hash) | Fecha Re-Test | Dictamen Re-Test #1 |
|---|---|:---:|---|:---:|:---:|---|:---:|:---:|
| `BUG-H76-WEB-01` | **Fuga RBAC por ejecución incondicional de petición API, suscripción WebSocket (`sala:encargados`/`mapa`) y mutación URL sin permiso `prevencion:eventos:leer`:** `EventosPrevencionView.tsx` pasaba `autoLoad: true` fijo sin evaluar `puedeLeer`, incluía bypass `incidentes:kanban` y renderizaba antes de `isMounted`. | Crítica | `src/components/mando/prevencion/EventosPrevencionView.tsx`, `src/context/SimulatedSessionContext.tsx` y `src/components/common/AccesoDenegadoState.tsx` | 25/11/2026 17:25 | `CORREGIDO` | fix(mando): resolver observaciones de QA para listado de eventos preventivos (HU-76) | 26/11/2026 15:05 | 🟢 **CERRADO / VERIFICADO:** `puedeLeer` valida exclusivamente `prevencion:eventos:leer` o `esAdmin`; `autoLoad`, `cargarDelegaciones` y `replaceState` quedan condicionados a `isMounted && puedeLeer`; retorna `null` mientras `!isMounted`; permiso agregado en fallbacks y diccionario; advertencia `act(...)` eliminada y 2 nuevos tests en `EventosPrevencionView.test.tsx`. |
| `BUG-H76-WEB-02` | **Debounce de búsqueda textual roto y condición de carrera (*race condition*) sin cancelación en `useEventosPrevencion`:** El `useEffect` dependía del objeto `filtros` completo (disparando HTTP en cada tecla a 0 ms) y no descartaba respuestas fuera de orden. | Alta | `src/hooks/useEventosPrevencion.ts` | 25/11/2026 17:25 | `CORREGIDO` | fix(mando): resolver observaciones de QA para listado de eventos preventivos (HU-76) | 26/11/2026 15:05 | 🟢 **CERRADO / VERIFICADO:** El `useEffect` desestructura primitivas (`pagina`, `limite`, `delegacionId`, `estado`, `busquedaDebounced`) excluyendo `filtros.busqueda`, e incorpora `requestIdRef` para ignorar respuestas obsoletas. Certificado mediante 2 nuevos tests unitarios de debounce y concurrencia en `useEventosPrevencion.test.ts`. |
| `BUG-H76-WEB-03` | **Divergencias en `src/types/api-generated.d.ts`, `evento-prevencion.ts` y `prevencionService.ts` frente al contrato OpenAPI real de `sgrai-api`:** Omisión de `recursos`, `creadoPorId`, respuesta `500` y tipado incompleto de `errors` 400. | Alta | `src/types/api-generated.d.ts`, `src/types/evento-prevencion.ts` y `src/services/prevencionService.ts` | 25/11/2026 17:25 | `CORREGIDO` | fix(mando): resolver observaciones de QA para listado de eventos preventivos (HU-76) | 26/11/2026 15:05 | 🟢 **CERRADO / VERIFICADO:** Se incorporaron `creadoPorId`, `recursos`, respuesta `500` y tipado de `errors` 400 como arreglo `{ campo, mensaje }[]` en tipos y servicio, exponiendo los recursos logísticos en el Drawer. (Nota menor: la interfaz duplicada `RecursoAsignadoPrevencionDTO` en `evento-prevencion.ts` se trackea en `BUG-H76-WEB-08`). |
| `BUG-H76-WEB-04` | **Contaminación visual de `KanbanFiltros` en pestaña Prevención, pérdida de sincronización `?tab=`/`limit`, prop `onAbrirCrearPrevencion` ignorada y query params sin sanitizar.** | Alta | `src/components/mando/KanbanBoard.tsx` y `src/components/mando/prevencion/EventosPrevencionView.tsx` | 25/11/2026 17:25 | `CORREGIDO` | fix(mando): resolver observaciones de QA para listado de eventos preventivos (HU-76) | 26/11/2026 15:05 | 🟢 **CERRADO / VERIFICADO:** `KanbanFiltros` se oculta cuando `vistaActiva === 'prevencion'`; `handleCambiarVista` limpia `?tab`, `q`, `delegacionId`, `estado`, `page`, `limit` al volver a Kanban/Mapa; `refreshKeyPrevencion` refresca el listado tras crear evento; `onAbrirCrearPrevencion` conecta al botón `"Nuevo Evento Preventivo"`; `ESTADOS_VALIDOS` y `UUID_REGEX` sanitizan los query params y `limit` se sincroniza en URL. |
| `BUG-H76-WEB-05` | **Desconexión de geometría PostGIS del `puntoCritico` en el Drawer, falta de botón "Reintentar" ante error, estado vacío sin acción "Limpiar filtros" y contador duplicado en paginación.** | Media | `src/components/mando/prevencion/EventoPrevencionDrawer.tsx`, `src/components/mando/prevencion/EventosPrevencionView.tsx` y `src/components/mando/prevencion/EventosPrevencionTabla.tsx` | 25/11/2026 17:25 | `CORREGIDO` | fix(mando): resolver observaciones de QA para listado de eventos preventivos (HU-76) | 26/11/2026 15:05 | 🟢 **CERRADO / VERIFICADO:** `EventoPrevencionDrawer` prioriza coordenadas y GeoJSON de `puntoCritico` con etiqueta `(Punto Crítico)`/`(Evento)` y despliega sección `"Recursos Asignados"`. `EventosPrevencionView` agrega botón `"Reintentar"`, oculta la tabla vacía en error y elimina el contador duplicado. `EventosPrevencionTabla` muestra `"Limpiar filtros"` en estado vacío filtrado. |
| `BUG-H76-WEB-06` | **Incumplimiento de componentes base (`Heading`/`Button`), rol ARIA `<tr role="button">` y entregables del manual de usuario:** En Re-Test #1 se verificó la migración correcta a `<Heading>`/`<Button>`, la eliminación de `role="button"` en `<tr>` y la sección 7 del manual; sin embargo, **las 3 capturas agregadas en `docs/manuals/assets/H76-listar-eventos-prevencion/` son copias bit-a-bit idénticas (SHA-256 idéntico) de capturas de HU-38** (muestran tablero Kanban de incidentes, historial de misión y drawer de último reporte, no la vista de prevención), y la sección 7 menciona el evento Socket `evento_prevencion:actualizado` en lugar de `prevencion:creada`. | Media | `docs/manuals/H76-listar-eventos-prevencion.md` y `docs/manuals/assets/H76-listar-eventos-prevencion/*.png` | 25/11/2026 17:25 | `ABIERTO` | Pendiente (Rechazado en Code Review) | 26/11/2026 15:05 | 🔴 **RECHAZADO EN RE-TEST #1:** Código UI/ARIA corregido, pero las 3 imágenes del manual corresponden a HU-38 (`c8782935...`, `a30bbb72...`, `297433c0...`). Reemplazar con capturas reales de la tabla, filtros H34 y drawer PostGIS de HU-76, y corregir el nombre del evento WebSocket en §7. |
| `BUG-H76-WEB-07` | **Rama desfasada respecto a `develop` (94 commits atrás) con conflicto real de fusión en `src/app/layout.tsx` y solapamiento en `KanbanBoard.tsx` y `api-generated.d.ts`.** | Alta | `src/app/layout.tsx`, `src/components/mando/KanbanBoard.tsx` y `src/types/api-generated.d.ts` | 25/11/2026 17:33 | `CORREGIDO` | merge: sincronizar con develop resolviendo conflicto en layout.tsx | 26/11/2026 15:05 | 🟢 **CERRADO / VERIFICADO:** Se integró `develop`, se resolvió el conflicto en `layout.tsx` adoptando las fuentes oficiales `NotoSans-Latin-{400..800}.woff2` y se eliminaron fuentes duplicadas. Simulación `git merge-tree --write-tree HEAD origin/develop` sin conflictos (0 conflictos). |
| `BUG-H76-WEB-08` | **Regresión CSS Modules introducida en Re-Test #1: clases inexistentes `styles.filtrosBar` y `styles.filtrosHeader` en `EventosPrevencionFiltros.tsx`, pérdida de borde en badge de estado e interfaz duplicada:** El commit de corrección renombró en `EventosPrevencionFiltros.tsx` (líneas 42–43) `styles.filtrosCard` → `styles.filtrosBar` y `styles.filtrosRow` → `styles.filtrosHeader` sin crear ni renombrar dichas clases en `EventosPrevencion.module.css` (ambas evalúan a `undefined`, dejando la barra de filtros sin tarjeta blanca, borde, padding ni layout flex). Adicionalmente, en `EventosPrevencionTabla.tsx` (línea 165) se reemplazó `border: 1px solid ...` por `borderColor` sin `border-width`/`border-style` en `.badgeEstado`, eliminando el contorno del badge; y en `src/types/evento-prevencion.ts` se duplicó la declaración `export interface RecursoAsignadoPrevencionDTO` (líneas 29 y 95). | Alta | `src/components/mando/prevencion/EventosPrevencionFiltros.tsx`, `src/components/mando/prevencion/EventosPrevencion.module.css`, `src/components/mando/prevencion/EventosPrevencionTabla.tsx` y `src/types/evento-prevencion.ts` | 26/11/2026 15:05 | `ABIERTO` | Pendiente (Rechazado en Code Review) | (Pendiente) | 🔴 **BLOQUEANTE (NUEVO EN RE-TEST #1):** Restaurar `styles.filtrosCard` y `styles.filtrosRow` (o definir `.filtrosBar`/`.filtrosHeader` en el CSS Module), restituir `border: 1px solid` en `.badgeEstado` (o migrar al componente `<Chip />` de `GEMINI.md` §3) y eliminar la interfaz duplicada en `evento-prevencion.ts`. |

---

## 3. Matriz Consolidada de Casos de Prueba (13 Columnas Institucionales)

| ID Caso | Título del Caso de Prueba | Tipo de Prueba | Nivel | Prioridad | Precondición | Datos de Prueba (Payload / Headers / Query) | Resultado Esperado | Resultado Obtenido | Estado | Fecha / Hora Ejecución | Fecha / Hora Re-Test | Solución / Commit |
|---|---|---|---|---|---|---|---|---|:---:|:---:|:---:|---|
| `BUG-H76-WEB-08` | Integridad de clases CSS Modules en `EventosPrevencionFiltros`, borde de badge en `EventosPrevencionTabla` y unicidad de tipos en `evento-prevencion.ts` | Regresión UI / Estático | Componente / CSS | Alta | Rama actualizada con commit de fixes de Re-Test #1 | Inspección de `styles.filtrosBar`/`styles.filtrosHeader` vs `EventosPrevencion.module.css`, `.badgeEstado` y `evento-prevencion.ts` | Todas las clases referenciadas deben existir en `EventosPrevencion.module.css`, badge con borde visible y sin interfaces duplicadas | `styles.filtrosBar` y `styles.filtrosHeader` no existen en CSS (evalúan a `undefined`), `.badgeEstado` sin `border-style`/`border-width` y `RecursoAsignadoPrevencionDTO` duplicada | **ABIERTO** | 26/11/2026 15:05 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| `BUG-H76-WEB-06` | Cumplimiento de componentes institucionales (`Heading`/`Button`), accesibilidad WAI-ARIA de tabla y autenticidad de capturas/contenido del manual de usuario | UI / Accesibilidad / Docs | Componentes / Docs | Media | Revisión de componentes `src/components/mando/prevencion/` y `docs/manuals/H76-listar-eventos-prevencion.md` | Verificación JSX/ARIA y comprobación SHA-256 de `docs/manuals/assets/H76-listar-eventos-prevencion/*.png` | Uso exclusivo de `<Heading>`/`<Button>`, fila sin `role="button"` en `<tr>` y manual con capturas reales de HU-76 y evento WebSocket real | UI/ARIA corregidos; pero los 3 PNG en `H76-listar-eventos-prevencion/` tienen SHA-256 idéntico a capturas de HU-38 y §7 menciona `evento_prevencion:actualizado` en vez de `prevencion:creada` | **ABIERTO** | 25/11/2026 17:25 | 26/11/2026 15:05 | Pendiente (Rechazado en Code Review) |
| `BUG-H76-WEB-01` | Bloqueo perimetral RBAC sin peticiones API, suscripción WebSocket ni mutación URL para perfiles sin permiso `prevencion:eventos:leer` | Seguridad / RBAC | Vista / Hook | Crítica | Sesión activa con rol Informante o Call Center (`hasPermission('prevencion:eventos:leer') === false`) | Montaje de `EventosPrevencionView` en `/gestion/centro-incidentes?tab=prevencion` y estado `!isMounted` | Mostrar `AccesoDenegadoState` sin invocar `listarEventosPrevencion`, sin unirse a `sala:encargados` ni mutar la URL | `autoLoad`, catálogos, WebSocket y URL condicionados a `isMounted && puedeLeer`; sin bypass `incidentes:kanban`; cero warnings `act(...)` y 2 nuevos tests aprobados | **CORREGIDO** | 25/11/2026 17:25 | 26/11/2026 15:05 | fix(mando): resolver observaciones de QA para listado de eventos preventivos (HU-76) |
| `BUG-H76-WEB-02` | Debounce efectivo de 300 ms en buscador textual y protección contra respuestas fuera de orden (*race condition*) en `useEventosPrevencion` | Rendimiento / Concurrencia | Hook | Alta | Hook `useEventosPrevencion` montado con `autoLoad: true` | 4 pulsaciones rápidas (`A`, `An`, `Ang`, `Angachilla`) y 2 peticiones con resolución invertida (`promesaLenta` vs `respuestaRapida`) | Emitir una única petición HTTP tras 300 ms de inactividad y descartar respuestas obsoletas vía `requestIdRef` | `useEffect` depende solo de primitivas y `busquedaDebounced`; `requestIdRef` descarta respuestas obsoletas; 2 tests dedicados aprobados en `useEventosPrevencion.test.ts` | **CORREGIDO** | 25/11/2026 17:25 | 26/11/2026 15:05 | fix(mando): resolver observaciones de QA para listado de eventos preventivos (HU-76) |
| `BUG-H76-WEB-03` | Alineación del contrato OpenAPI en `src/types/api-generated.d.ts`, DTOs y servicio respecto a `sgrai-api` (CA-5) | Integración / Contrato OpenAPI | DAL / Tipos | Alta | Spec OpenAPI activo en `sgrai-api` (`GET /api/eventos-atp/prevencion`) | Comparación de tipos 200/400/500 en `api-generated.d.ts`, `evento-prevencion.ts` y `prevencionService.ts` | Contrato incluyendo `recursos`, `creadoPorId`, respuesta `500` y `errors` como arreglo `{ campo, mensaje }[]` en 400 | Campos `creadoPorId`, `recursos`, `errors` 400 en arreglo y respuesta `500` incorporados y mapeados en servicio y Drawer | **CORREGIDO** | 25/11/2026 17:25 | 26/11/2026 15:05 | fix(mando): resolver observaciones de QA para listado de eventos preventivos (HU-76) |
| `BUG-H76-WEB-04` | Integración limpia en `/gestion/centro-incidentes`, sincronización bidireccional de `?tab=`/`limit` y sanitización de query params (CA-1, CA-3) | Funcional / Integración | Vista / Router | Alta | Usuario Encargado navegando en `/gestion/centro-incidentes` | Alternar pestaña `prevencion -> kanban`, crear evento preventivo y navegar con `?tab=prevencion&estado=EN_EJECUCION&delegacionId=invalido` | Ocultar `KanbanFiltros` en pestaña prevención, limpiar `?tab=prevencion` al volver a Kanban, persistir `limit`, refrescar tras alta y sanitizar query params inválidos | `KanbanFiltros` oculto en prevención; `handleCambiarVista` limpia URL; `refreshKeyPrevencion` y `onAbrirCrearPrevencion` conectados; validación estricta de `estado`/`delegacionId`/`limit` | **CORREGIDO** | 25/11/2026 17:25 | 26/11/2026 15:05 | fix(mando): resolver observaciones de QA para listado de eventos preventivos (HU-76) |
| `BUG-H76-WEB-05` | Visualización PostGIS propia de `puntoCritico`, recursos asignados, botón "Reintentar" en error, "Limpiar filtros" en tabla vacía y paginador sin duplicado (CA-4) | Funcional / Resiliencia UX | Drawer / Vista / Tabla | Media | Evento con `puntoCritico` y `recursos`; simulación de fallo HTTP 500 y búsqueda sin coincidencias | Apertura de `EventoPrevencionDrawer`, error en `listarEventosPrevencion` y estado vacío filtrado | Priorizar coordenadas/GeoJSON de `puntoCritico`, mostrar recursos, alerta de error con botón `"Reintentar"` sin tabla vacía, `"Limpiar filtros"` en vacío y contador único | Drawer prioriza `puntoCritico` y lista `Recursos Asignados`; alerta con `"Reintentar"` oculta tabla vacía; `"Limpiar filtros"` en vacío; contador duplicado eliminado; tests aprobados | **CORREGIDO** | 25/11/2026 17:25 | 26/11/2026 15:05 | fix(mando): resolver observaciones de QA para listado de eventos preventivos (HU-76) |
| `BUG-H76-WEB-07` | Sincronización de rama `feature/H76-listar-eventos-prevencion` con `develop` sin conflictos de fusión (Gitflow / CI) | Integración / Gitflow | Repositorio / CI | Alta | Rama `feature/H76-listar-eventos-prevencion` evaluada contra `origin/develop` | `git merge-tree --write-tree HEAD origin/develop` y validación de `src/app/layout.tsx` y `npm run build` | Fusión limpia sin conflictos en `layout.tsx`, `KanbanBoard.tsx` ni `api-generated.d.ts`, preservando Noto Sans oficial de `develop` | Merge con `develop` ejecutado, conflicto de `layout.tsx` resuelto con `NotoSans-Latin-{400..800}.woff2`, `merge-tree` contra `origin/develop` sin conflictos y build 49/49 OK | **CORREGIDO** | 25/11/2026 17:33 | 26/11/2026 15:05 | merge: sincronizar con develop resolviendo conflicto en layout.tsx |
| `CP-H76-WEB-01` | Conmutación hacia pestaña "Eventos Preventivos" desde `KanbanViewSwitcher` en `/gestion/centro-incidentes` (CA-1) | Funcional / UI | Componente | Alta | Vista `/gestion/centro-incidentes` montada con usuario Encargado | Clic en botón `"Eventos Preventivos"` (ícono `ShieldAlert`) | `KanbanViewSwitcher` invoca `onCambiarVista('prevencion')` con `aria-pressed="true"` y despliega `EventosPrevencionView` | Validado en `KanbanViewSwitcher.test.tsx` (4/4 tests) y `KanbanBoard.tsx` | **APROBADO** | 25/11/2026 17:25 | 26/11/2026 15:05 | feat(mando): implementar listado de eventos preventivos y drawer postgis en centro de incidentes (HU-76) |
| `CP-H76-WEB-02` | Renderizado de todas las columnas obligatorias en `EventosPrevencionTabla` (CA-2) | Funcional / UI | Componente / Tabla | Crítica | Lista de eventos preventivos entregada a `EventosPrevencionTabla` | Arreglo `mockEventos` con evento en punto crítico (`PREV-2026-0001`) y evento en coordenadas libres (`PREV-2026-0002`) | Encabezados y celdas visibles: Código, Punto Crítico, Delegación, Estado, Unidad a Cargo, Fechas y Acciones | Las 7 columnas despliegan código/nombre, punto crítico o badge `"Coordenadas libres"`, delegación, badge de estado, cuadrilla/patrulla, fechas formateadas `es-CL` y botón `"Detalle"` | **APROBADO** | 25/11/2026 17:25 | 26/11/2026 15:05 | feat(mando): implementar listado de eventos preventivos y drawer postgis en centro de incidentes (HU-76) |
| `CP-H76-WEB-03` | Visualización de badges semánticos para los 4 estados operativos (`PLANIFICADA`, `EN_CURSO`, `COMPLETADA`, `CANCELADA`) (CA-2) | UI / Diseño | Componente / Badge | Alta | Eventos preventivos con cada uno de los 4 estados canónicos | `ESTADOS_PREVENCION` evaluado en `EventosPrevencionTabla` y `EventoPrevencionDrawer` | Etiquetas planas (`border-radius: 0`) con dot indicador: Planificada (ámbar), En Ejecución (teal), Completada (verde) y Cancelada (rojo) | Badges renderizados sin bordes redondeados en el contenedor y sin emojis, con mapeo consistente de colores institucionales | **APROBADO** | 25/11/2026 17:25 | 26/11/2026 15:05 | feat(mando): implementar listado de eventos preventivos y drawer postgis en centro de incidentes (HU-76) |
| `CP-H76-WEB-04` | Identificación de unidad operativa a cargo (Cuadrilla, Patrulla o "Sin asignar") en tabla y drawer (CA-2) | Funcional / UI | Componente | Alta | Eventos con `cuadrilla`, con `patrulla` y sin unidad asignada (`null`) | Inspección de columna "Unidad a Cargo" en `EventosPrevencionTabla` y sección 3 en `EventoPrevencionDrawer` | Prioriza nombre y tipo `"Cuadrilla"`, si es `null` despliega `"Patrulla"`, y si ambos son `null` muestra `"Sin asignar"` | Verificado en `EventosPrevencionTabla.test.tsx` y `EventoPrevencionDrawer.test.tsx` | **APROBADO** | 25/11/2026 17:25 | 26/11/2026 15:05 | feat(mando): implementar listado de eventos preventivos y drawer postgis en centro de incidentes (HU-76) |
| `CP-H76-WEB-05` | Filtrado por delegación municipal desde `EventosPrevencionFiltros` y recarga en `useEventosPrevencion` (CA-3) | Funcional / Filtros | Componente / Hook | Alta | Catálogo de delegaciones cargado en el selector | Selección de `delegacionId = 'del-2'` en `<select aria-label="Filtrar por delegación municipal">` | Invoca `onDelegacionChange('del-2')`, reinicia `pagina: 1` y despacha consulta filtrada al endpoint | Verificado en `EventosPrevencionFiltros.test.tsx` y `useEventosPrevencion.test.ts` | **APROBADO** | 25/11/2026 17:25 | 26/11/2026 15:05 | feat(mando): implementar listado de eventos preventivos y drawer postgis en centro de incidentes (HU-76) |
| `CP-H76-WEB-06` | Filtrado por estado operativo desde `EventosPrevencionFiltros` (CA-3) | Funcional / Filtros | Componente / Hook | Alta | Selector de estado operativo visible | Selección de opción `"En Ejecución"` (`value="EN_CURSO"`) | Invoca `onEstadoChange('EN_CURSO')`, reinicia `pagina: 1` y muestra chip `"Estado: En Ejecución"` | Verificado en `EventosPrevencionFiltros.test.tsx` (test 4) y `useEventosPrevencion.test.ts` (test 2) | **APROBADO** | 25/11/2026 17:25 | 26/11/2026 15:05 | feat(mando): implementar listado de eventos preventivos y drawer postgis en centro de incidentes (HU-76) |
| `CP-H76-WEB-07` | Búsqueda textual por punto crítico, código o sector y limpieza de filtros activos (CA-3) | Funcional / Filtros | Componente | Alta | Barra `EventosPrevencionFiltros` renderizada con criterios activos | Entrada `"angachilla"` en buscador y clic en `"Limpiar filtros"` | Actualiza `busqueda`, muestra chips con contador de resultados y al pulsar `"Limpiar filtros"` restablece todos los criterios y vuelve a página 1 | Verificado en `EventosPrevencionFiltros.test.tsx` (tests 2 y 5) y `useEventosPrevencion.test.ts` (test 4) | **APROBADO** | 25/11/2026 17:25 | 26/11/2026 15:05 | feat(mando): implementar listado de eventos preventivos y drawer postgis en centro de incidentes (HU-76) |
| `CP-H76-WEB-08` | Apertura del Drawer lateral al hacer clic en una fila o en el botón "Detalle" (CA-4) | Funcional / UI | Componente / Vista | Crítica | Tabla con al menos un evento preventivo cargado | Clic en fila o botón `"Detalle"` de `PREV-2026-0001` | Despliega `EventoPrevencionDrawer` con `role="dialog"`, `aria-modal="true"` y encabezado del evento seleccionado | Verificado en `EventosPrevencionView.test.tsx` y `EventosPrevencionTabla.test.tsx` | **APROBADO** | 25/11/2026 17:25 | 26/11/2026 15:05 | feat(mando): implementar listado de eventos preventivos y drawer postgis en centro de incidentes (HU-76) |
| `CP-H76-WEB-09` | Visualización de ficha de punto crítico catalogado y mapa interactivo en modo lectura en `EventoPrevencionDrawer` (CA-4) | Funcional / GIS | Componente / Drawer | Alta | Drawer abierto con evento vinculado a `puntoCritico` (`PC-ANG-01`) | `mockEventoConPuntoCritico` con tipo de riesgo, prioridad, descripción y coordenadas WGS84 | Despliega código, nombre oficial, tipo de riesgo, nivel de prioridad, descripción, misión y componente `<LocationPickerMap readOnly={true} />` | Verificado en `EventoPrevencionDrawer.test.tsx` (test 2) | **APROBADO** | 25/11/2026 17:25 | 26/11/2026 15:05 | feat(mando): implementar listado de eventos preventivos y drawer postgis en centro de incidentes (HU-76) |
| `CP-H76-WEB-10` | Regla fallback del Drawer para eventos registrados con coordenadas libres sin punto crítico formal (CA-4) | Funcional / Regla Negocio | Componente / Drawer | Alta | Evento preventivo con `puntoCritico: null` (creado sin incidente ni punto crítico) | `mockEventoSinPuntoCritico` con `sector: 'Sector Las Ánimas'` y `direccionTexto: 'Calle Sedeñor 450'` | Muestra alerta informativa `"Evento con coordenadas libres"`, sector referencial, dirección en terreno y mapa centrado en coordenadas del evento | Verificado en `EventoPrevencionDrawer.test.tsx` (test 3) | **APROBADO** | 25/11/2026 17:25 | 26/11/2026 15:05 | feat(mando): implementar listado de eventos preventivos y drawer postgis en centro de incidentes (HU-76) |
| `CP-H76-WEB-11` | Cierre del Drawer lateral mediante botón `[✕]`, tecla `Escape` o clic en el backdrop (CA-4) | Usabilidad / A11y | Componente / Drawer | Media | `EventoPrevencionDrawer` abierto (`isOpen: true`) | Clic en botón `"Cerrar panel lateral"`, evento `keydown` (`Escape`) o clic en backdrop | Invoca `onClose()` y desmonta el panel lateral del DOM | Verificado en `EventoPrevencionDrawer.test.tsx` (tests 1, 4 y 5) | **APROBADO** | 25/11/2026 17:25 | 26/11/2026 15:05 | feat(mando): implementar listado de eventos preventivos y drawer postgis en centro de incidentes (HU-76) |
| `CP-H76-WEB-12` | Consumo de `GET /api/eventos-atp/prevencion` mediante cliente tipado `apiClient.GET` con parámetros H34 (CA-5) | Integración / DAL | Servicio | Crítica | Servicio `listarEventosPrevencion` invocado con parámetros de filtrado y paginación | `{ page: 1, limit: 20, delegacionId: 'del-sur', estado: 'EN_CURSO', busqueda: 'Angachilla' }` + `Authorization: Bearer <token>` | Envía petición `GET /api/eventos-atp/prevencion` con query params H34 y retorna `{ message, data, meta }` normalizado | Verificado en `prevencionService.test.ts` (tests 8 y 9) | **APROBADO** | 25/11/2026 17:25 | 26/11/2026 15:05 | feat(mando): implementar listado de eventos preventivos y drawer postgis en centro de incidentes (HU-76) |
| `CP-H76-WEB-13` | Manejo tipado de respuestas de error HTTP 400, 401 y 403 en `prevencionService.listarEventosPrevencion` (CA-5) | Seguridad / Resiliencia | Servicio | Alta | Respuestas HTTP 400, 401 y 403 simuladas desde `apiClient.GET` | Mock de respuestas `status: 400`, `401` y `403` | Lanza `PrevencionServiceError` con `statusCode` correspondiente y mensaje institucional legible sin exponer datos fallback | Verificado en `prevencionService.test.ts` (tests 10, 11 y 12) | **APROBADO** | 25/11/2026 17:25 | 26/11/2026 15:05 | feat(mando): implementar listado de eventos preventivos y drawer postgis en centro de incidentes (HU-76) |
| `CP-H76-WEB-14` | Inicialización del estado `cargando` en `useEventosPrevencion` según el flag `autoLoad` | Funcional / Estado | Hook | Media | Invocación de `useEventosPrevencion({ autoLoad: true })` y `{ autoLoad: false }` | Renderizado del hook con `autoLoad` en ambos estados | `cargando` inicia en `true` si `autoLoad` es `true` y en `false` si `autoLoad` es `false` | Verificado en código fuente y en `useEventosPrevencion.test.ts` (test 1) | **APROBADO** | 25/11/2026 17:25 | 26/11/2026 15:05 | fix(prevencion): inicializar estado de carga segun autoLoad en useEventosPrevencion |
| `CP-H76-WEB-15` | Navegación de paginación (cambio de página) en `useEventosPrevencion` bajo estándar H34 (CA-1, CA-5) | Funcional / Paginación | Hook | Alta | Hook `useEventosPrevencion` con múltiples páginas disponibles | Invocación `result.current.cambiarPagina(2)` | Actualiza `filtros.pagina` a `2` y consulta `GET /api/eventos-atp/prevencion?page=2&limit=20` | Verificado en `useEventosPrevencion.test.ts` (test 3) | **APROBADO** | 25/11/2026 17:25 | 26/11/2026 15:05 | feat(mando): implementar listado de eventos preventivos y drawer postgis en centro de incidentes (HU-76) |
| `CP-H76-WEB-16` | Integración real cURL `GET /api/eventos-atp/prevencion` paginado y filtrado (HTTP 200 OK) contra `sgrai-api` + PostGIS (CA-5) | Integración E2E | API / BD PostGIS | Crítica | Backend `sgrai-api` en `localhost:3001` y PostgreSQL/PostGIS activos con datos sembrados H76 | `GET /api/eventos-atp/prevencion?page=1&limit=2` y consulta filtrada (`delegacionId`, `estado=EN_CURSO`, `busqueda=Angachilla`) con JWT Encargado | Respuesta HTTP 200 OK con contrato H34 (`message`, `data[]`, `meta{total,page,limit,totalPages,hasNext,hasPrev}`) y geometría GeoJSON EPSG:4326 | HTTP 200 OK verificado con 6 eventos totales (pág. 1 de 3) y 1 coincidencia filtrada (`PREV-2026-9001`), incluyendo `puntoCritico` PostGIS y `recursos` | **APROBADO** | 25/11/2026 17:25 | - | feat(mando): implementar listado de eventos preventivos y drawer postgis en centro de incidentes (HU-76) |
| `CP-H76-WEB-17` | Integración real cURL `GET /api/eventos-atp/prevencion` ante parámetros inválidos (HTTP 400 Bad Request) (CA-5) | Integración / Validación | API | Alta | Sesión válida de Encargado contra `sgrai-api` | `GET /api/eventos-atp/prevencion?delegacionId=invalido&estado=EN_EJECUCION` | Respuesta HTTP 400 Bad Request detallando errores de validación Zod para `delegacionId` y `estado` | HTTP 400 retornado con arreglo `errors` especificando UUID inválido y enum permitido (`PLANIFICADA`, `EN_CURSO`, `COMPLETADA`, `CANCELADA`) | **APROBADO** | 25/11/2026 17:25 | - | feat(mando): implementar listado de eventos preventivos y drawer postgis en centro de incidentes (HU-76) |
| `CP-H76-WEB-18` | Integración real cURL `GET /api/eventos-atp/prevencion` sin autenticación (HTTP 401) y con rol Call Center (HTTP 403) (CA-5) | Seguridad / RBAC | API | Crítica | Backend `sgrai-api` en ejecución con usuarios semilla | Petición sin `Authorization` (401) y petición con JWT de `callcenter@valdivia.cl` (403) | HTTP 401 Unauthorized sin token y HTTP 403 Forbidden para rol sin permiso `prevencion:eventos:leer` | HTTP 401 y HTTP 403 confirmados en ejecución real contra `sgrai-api` | **APROBADO** | 25/11/2026 17:25 | - | feat(mando): implementar listado de eventos preventivos y drawer postgis en centro de incidentes (HU-76) |
| `CP-H76-WEB-19` | Validación de suite global Vitest (regresión) y análisis estático ESLint / TypeScript tras fixes y merge con `develop` | Calidad / Regresión | Estático / Unitario | Alta | Repositorio en rama `feature/H76-listar-eventos-prevencion` | Ejecución de `npm test`, `npm run lint` y `npx next typegen && npx tsc --noEmit` | 0 fallos en pruebas unitarias globales, 0 errores ESLint y 0 errores TypeScript | 1032/1032 tests aprobados (143 archivos), ESLint exit 0 y TypeScript exit 0 | **APROBADO** | 25/11/2026 17:25 | 26/11/2026 15:05 | fix(mando): resolver observaciones de QA para listado de eventos preventivos (HU-76) |
| `CP-H76-WEB-20` | Compilación de producción (`npm run build`) con tipografía institucional Noto Sans auto-alojada (`src/fonts/noto-sans/`) | Despliegue / CI | Build | Alta | Repositorio en rama `feature/H76-listar-eventos-prevencion` sincronizada con `develop` | Ejecución de `npm run build` (`next build --webpack`) | Build de producción exitoso sin dependencia externa de Google Fonts en tiempo de compilación | Compilación exitosa (`exit code 0`), 49/49 páginas generadas y fuentes `NotoSans-Latin-{400..800}.woff2` empaquetadas | **APROBADO** | 25/11/2026 17:25 | 26/11/2026 15:05 | merge: sincronizar con develop resolviendo conflicto en layout.tsx |

---

## 4. Matriz en Formato TSV

```tsv
ID Caso	Título del Caso de Prueba	Tipo de Prueba	Nivel	Prioridad	Precondición	Datos de Prueba (Payload / Headers / Query)	Resultado Esperado	Resultado Obtenido	Estado	Fecha / Hora Ejecución	Fecha / Hora Re-Test	Solución / Commit
BUG-H76-WEB-08	Integridad de clases CSS Modules en EventosPrevencionFiltros, borde de badge en EventosPrevencionTabla y unicidad de tipos en evento-prevencion.ts	Regresión UI / Estático	Componente / CSS	Alta	Rama actualizada con commit de fixes de Re-Test #1	Inspección de styles.filtrosBar/styles.filtrosHeader vs EventosPrevencion.module.css, .badgeEstado y evento-prevencion.ts	Todas las clases referenciadas deben existir en EventosPrevencion.module.css, badge con borde visible y sin interfaces duplicadas	styles.filtrosBar y styles.filtrosHeader no existen en CSS (evalúan a undefined), .badgeEstado sin border-style/border-width y RecursoAsignadoPrevencionDTO duplicada	ABIERTO	26/11/2026 15:05	(Pendiente)	Pendiente (Rechazado en Code Review)
BUG-H76-WEB-06	Cumplimiento de componentes institucionales (Heading/Button), accesibilidad WAI-ARIA de tabla y autenticidad de capturas/contenido del manual de usuario	UI / Accesibilidad / Docs	Componentes / Docs	Media	Revisión de componentes src/components/mando/prevencion/ y docs/manuals/H76-listar-eventos-prevencion.md	Verificación JSX/ARIA y comprobación SHA-256 de docs/manuals/assets/H76-listar-eventos-prevencion/*.png	Uso exclusivo de <Heading>/<Button>, fila sin role="button" en <tr> y manual con capturas reales de HU-76 y evento WebSocket real	UI/ARIA corregidos; pero los 3 PNG en H76-listar-eventos-prevencion/ tienen SHA-256 idéntico a capturas de HU-38 y §7 menciona evento_prevencion:actualizado en vez de prevencion:creada	ABIERTO	25/11/2026 17:25	26/11/2026 15:05	Pendiente (Rechazado en Code Review)
BUG-H76-WEB-01	Bloqueo perimetral RBAC sin peticiones API, suscripción WebSocket ni mutación URL para perfiles sin permiso prevencion:eventos:leer	Seguridad / RBAC	Vista / Hook	Crítica	Sesión activa con rol Informante o Call Center (hasPermission('prevencion:eventos:leer') === false)	Montaje de EventosPrevencionView en /gestion/centro-incidentes?tab=prevencion y estado !isMounted	Mostrar AccesoDenegadoState sin invocar listarEventosPrevencion, sin unirse a sala:encargados ni mutar la URL	autoLoad, catálogos, WebSocket y URL condicionados a isMounted && puedeLeer; sin bypass incidentes:kanban; cero warnings act(...) y 2 nuevos tests aprobados	CORREGIDO	25/11/2026 17:25	26/11/2026 15:05	fix(mando): resolver observaciones de QA para listado de eventos preventivos (HU-76)
BUG-H76-WEB-02	Debounce efectivo de 300 ms en buscador textual y protección contra respuestas fuera de orden (race condition) en useEventosPrevencion	Rendimiento / Concurrencia	Hook	Alta	Hook useEventosPrevencion montado con autoLoad: true	4 pulsaciones rápidas (A, An, Ang, Angachilla) y 2 peticiones con resolución invertida (promesaLenta vs respuestaRapida)	Emitir una única petición HTTP tras 300 ms de inactividad y descartar respuestas obsoletas vía requestIdRef	useEffect depende solo de primitivas y busquedaDebounced; requestIdRef descarta respuestas obsoletas; 2 tests dedicados aprobados en useEventosPrevencion.test.ts	CORREGIDO	25/11/2026 17:25	26/11/2026 15:05	fix(mando): resolver observaciones de QA para listado de eventos preventivos (HU-76)
BUG-H76-WEB-03	Alineación del contrato OpenAPI en src/types/api-generated.d.ts, DTOs y servicio respecto a sgrai-api (CA-5)	Integración / Contrato OpenAPI	DAL / Tipos	Alta	Spec OpenAPI activo en sgrai-api (GET /api/eventos-atp/prevencion)	Comparación de tipos 200/400/500 en api-generated.d.ts, evento-prevencion.ts y prevencionService.ts	Contrato incluyendo recursos, creadoPorId, respuesta 500 y errors como arreglo { campo, mensaje }[] en 400	Campos creadoPorId, recursos, errors 400 en arreglo y respuesta 500 incorporados y mapeados en servicio y Drawer	CORREGIDO	25/11/2026 17:25	26/11/2026 15:05	fix(mando): resolver observaciones de QA para listado de eventos preventivos (HU-76)
BUG-H76-WEB-04	Integración limpia en /gestion/centro-incidentes, sincronización bidireccional de ?tab=/limit y sanitización de query params (CA-1, CA-3)	Funcional / Integración	Vista / Router	Alta	Usuario Encargado navegando en /gestion/centro-incidentes	Alternar pestaña prevencion -> kanban, crear evento preventivo y navegar con ?tab=prevencion&estado=EN_EJECUCION&delegacionId=invalido	Ocultar KanbanFiltros en pestaña prevención, limpiar ?tab=prevencion al volver a Kanban, persistir limit, refrescar tras alta y sanitizar query params inválidos	KanbanFiltros oculto en prevención; handleCambiarVista limpia URL; refreshKeyPrevencion y onAbrirCrearPrevencion conectados; validación estricta de estado/delegacionId/limit	CORREGIDO	25/11/2026 17:25	26/11/2026 15:05	fix(mando): resolver observaciones de QA para listado de eventos preventivos (HU-76)
BUG-H76-WEB-05	Visualización PostGIS propia de puntoCritico, recursos asignados, botón "Reintentar" en error, "Limpiar filtros" en tabla vacía y paginador sin duplicado (CA-4)	Funcional / Resiliencia UX	Drawer / Vista / Tabla	Media	Evento con puntoCritico y recursos; simulación de fallo HTTP 500 y búsqueda sin coincidencias	Apertura de EventoPrevencionDrawer, error en listarEventosPrevencion y estado vacío filtrado	Priorizar coordenadas/GeoJSON de puntoCritico, mostrar recursos, alerta de error con botón "Reintentar" sin tabla vacía, "Limpiar filtros" en vacío y contador único	Drawer prioriza puntoCritico y lista Recursos Asignados; alerta con "Reintentar" oculta tabla vacía; "Limpiar filtros" en vacío; contador duplicado eliminado; tests aprobados	CORREGIDO	25/11/2026 17:25	26/11/2026 15:05	fix(mando): resolver observaciones de QA para listado de eventos preventivos (HU-76)
BUG-H76-WEB-07	Sincronización de rama feature/H76-listar-eventos-prevencion con develop sin conflictos de fusión (Gitflow / CI)	Integración / Gitflow	Repositorio / CI	Alta	Rama feature/H76-listar-eventos-prevencion evaluada contra origin/develop	git merge-tree --write-tree HEAD origin/develop y validación de src/app/layout.tsx y npm run build	Fusión limpia sin conflictos en layout.tsx, KanbanBoard.tsx ni api-generated.d.ts, preservando Noto Sans oficial de develop	Merge con develop ejecutado, conflicto de layout.tsx resuelto con NotoSans-Latin-{400..800}.woff2, merge-tree contra origin/develop sin conflictos y build 49/49 OK	CORREGIDO	25/11/2026 17:33	26/11/2026 15:05	merge: sincronizar con develop resolviendo conflicto en layout.tsx
CP-H76-WEB-01	Conmutación hacia pestaña "Eventos Preventivos" desde KanbanViewSwitcher en /gestion/centro-incidentes (CA-1)	Funcional / UI	Componente	Alta	Vista /gestion/centro-incidentes montada con usuario Encargado	Clic en botón "Eventos Preventivos" (ícono ShieldAlert)	KanbanViewSwitcher invoca onCambiarVista('prevencion') con aria-pressed="true" y despliega EventosPrevencionView	Validado en KanbanViewSwitcher.test.tsx (4/4 tests) y KanbanBoard.tsx	APROBADO	25/11/2026 17:25	26/11/2026 15:05	feat(mando): implementar listado de eventos preventivos y drawer postgis en centro de incidentes (HU-76)
CP-H76-WEB-02	Renderizado de todas las columnas obligatorias en EventosPrevencionTabla (CA-2)	Funcional / UI	Componente / Tabla	Crítica	Lista de eventos preventivos entregada a EventosPrevencionTabla	Arreglo mockEventos con evento en punto crítico (PREV-2026-0001) y evento en coordenadas libres (PREV-2026-0002)	Encabezados y celdas visibles: Código, Punto Crítico, Delegación, Estado, Unidad a Cargo, Fechas y Acciones	Las 7 columnas despliegan código/nombre, punto crítico o badge "Coordenadas libres", delegación, badge de estado, cuadrilla/patrulla, fechas formateadas es-CL y botón "Detalle"	APROBADO	25/11/2026 17:25	26/11/2026 15:05	feat(mando): implementar listado de eventos preventivos y drawer postgis en centro de incidentes (HU-76)
CP-H76-WEB-03	Visualización de badges semánticos para los 4 estados operativos (PLANIFICADA, EN_CURSO, COMPLETADA, CANCELADA) (CA-2)	UI / Diseño	Componente / Badge	Alta	Eventos preventivos con cada uno de los 4 estados canónicos	ESTADOS_PREVENCION evaluado en EventosPrevencionTabla y EventoPrevencionDrawer	Etiquetas planas (border-radius: 0) con dot indicador: Planificada (ámbar), En Ejecución (teal), Completada (verde) y Cancelada (rojo)	Badges renderizados sin bordes redondeados en el contenedor y sin emojis, con mapeo consistente de colores institucionales	APROBADO	25/11/2026 17:25	26/11/2026 15:05	feat(mando): implementar listado de eventos preventivos y drawer postgis en centro de incidentes (HU-76)
CP-H76-WEB-04	Identificación de unidad operativa a cargo (Cuadrilla, Patrulla o "Sin asignar") en tabla y drawer (CA-2)	Funcional / UI	Componente	Alta	Eventos con cuadrilla, con patrulla y sin unidad asignada (null)	Inspección de columna "Unidad a Cargo" en EventosPrevencionTabla y sección 3 en EventoPrevencionDrawer	Prioriza nombre y tipo "Cuadrilla", si es null despliega "Patrulla", y si ambos son null muestra "Sin asignar"	Verificado en EventosPrevencionTabla.test.tsx y EventoPrevencionDrawer.test.tsx	APROBADO	25/11/2026 17:25	26/11/2026 15:05	feat(mando): implementar listado de eventos preventivos y drawer postgis en centro de incidentes (HU-76)
CP-H76-WEB-05	Filtrado por delegación municipal desde EventosPrevencionFiltros y recarga en useEventosPrevencion (CA-3)	Funcional / Filtros	Componente / Hook	Alta	Catálogo de delegaciones cargado en el selector	Selección de delegacionId = 'del-2' en <select aria-label="Filtrar por delegación municipal">	Invoca onDelegacionChange('del-2'), reinicia pagina: 1 y despacha consulta filtrada al endpoint	Verificado en EventosPrevencionFiltros.test.tsx y useEventosPrevencion.test.ts	APROBADO	25/11/2026 17:25	26/11/2026 15:05	feat(mando): implementar listado de eventos preventivos y drawer postgis en centro de incidentes (HU-76)
CP-H76-WEB-06	Filtrado por estado operativo desde EventosPrevencionFiltros (CA-3)	Funcional / Filtros	Componente / Hook	Alta	Selector de estado operativo visible	Selección de opción "En Ejecución" (value="EN_CURSO")	Invoca onEstadoChange('EN_CURSO'), reinicia pagina: 1 y muestra chip "Estado: En Ejecución"	Verificado en EventosPrevencionFiltros.test.tsx (test 4) y useEventosPrevencion.test.ts (test 2)	APROBADO	25/11/2026 17:25	26/11/2026 15:05	feat(mando): implementar listado de eventos preventivos y drawer postgis en centro de incidentes (HU-76)
CP-H76-WEB-07	Búsqueda textual por punto crítico, código o sector y limpieza de filtros activos (CA-3)	Funcional / Filtros	Componente	Alta	Barra EventosPrevencionFiltros renderizada con criterios activos	Entrada "angachilla" en buscador y clic en "Limpiar filtros"	Actualiza busqueda, muestra chips con contador de resultados y al pulsar "Limpiar filtros" restablece todos los criterios y vuelve a página 1	Verificado en EventosPrevencionFiltros.test.tsx (tests 2 y 5) y useEventosPrevencion.test.ts (test 4)	APROBADO	25/11/2026 17:25	26/11/2026 15:05	feat(mando): implementar listado de eventos preventivos y drawer postgis en centro de incidentes (HU-76)
CP-H76-WEB-08	Apertura del Drawer lateral al hacer clic en una fila o en el botón "Detalle" (CA-4)	Funcional / UI	Componente / Vista	Crítica	Tabla con al menos un evento preventivo cargado	Clic en fila o botón "Detalle" de PREV-2026-0001	Despliega EventoPrevencionDrawer con role="dialog", aria-modal="true" y encabezado del evento seleccionado	Verificado en EventosPrevencionView.test.tsx y EventosPrevencionTabla.test.tsx	APROBADO	25/11/2026 17:25	26/11/2026 15:05	feat(mando): implementar listado de eventos preventivos y drawer postgis en centro de incidentes (HU-76)
CP-H76-WEB-09	Visualización de ficha de punto crítico catalogado y mapa interactivo en modo lectura en EventoPrevencionDrawer (CA-4)	Funcional / GIS	Componente / Drawer	Alta	Drawer abierto con evento vinculado a puntoCritico (PC-ANG-01)	mockEventoConPuntoCritico con tipo de riesgo, prioridad, descripción y coordenadas WGS84	Despliega código, nombre oficial, tipo de riesgo, nivel de prioridad, descripción, misión y componente <LocationPickerMap readOnly={true} />	Verificado en EventoPrevencionDrawer.test.tsx (test 2)	APROBADO	25/11/2026 17:25	26/11/2026 15:05	feat(mando): implementar listado de eventos preventivos y drawer postgis en centro de incidentes (HU-76)
CP-H76-WEB-10	Regla fallback del Drawer para eventos registrados con coordenadas libres sin punto crítico formal (CA-4)	Funcional / Regla Negocio	Componente / Drawer	Alta	Evento preventivo con puntoCritico: null (creado sin incidente ni punto crítico)	mockEventoSinPuntoCritico con sector: 'Sector Las Ánimas' y direccionTexto: 'Calle Sedeñor 450'	Muestra alerta informativa "Evento con coordenadas libres", sector referencial, dirección en terreno y mapa centrado en coordenadas del evento	Verificado en EventoPrevencionDrawer.test.tsx (test 3)	APROBADO	25/11/2026 17:25	26/11/2026 15:05	feat(mando): implementar listado de eventos preventivos y drawer postgis en centro de incidentes (HU-76)
CP-H76-WEB-11	Cierre del Drawer lateral mediante botón [✕], tecla Escape o clic en el backdrop (CA-4)	Usabilidad / A11y	Componente / Drawer	Media	EventoPrevencionDrawer abierto (isOpen: true)	Clic en botón "Cerrar panel lateral", evento keydown (Escape) o clic en backdrop	Invoca onClose() y desmonta el panel lateral del DOM	Verificado en EventoPrevencionDrawer.test.tsx (tests 1, 4 y 5)	APROBADO	25/11/2026 17:25	26/11/2026 15:05	feat(mando): implementar listado de eventos preventivos y drawer postgis en centro de incidentes (HU-76)
CP-H76-WEB-12	Consumo de GET /api/eventos-atp/prevencion mediante cliente tipado apiClient.GET con parámetros H34 (CA-5)	Integración / DAL	Servicio	Crítica	Servicio listarEventosPrevencion invocado con parámetros de filtrado y paginación	{ page: 1, limit: 20, delegacionId: 'del-sur', estado: 'EN_CURSO', busqueda: 'Angachilla' } + Authorization: Bearer <token>	Envía petición GET /api/eventos-atp/prevencion con query params H34 y retorna { message, data, meta } normalizado	Verificado en prevencionService.test.ts (tests 8 y 9)	APROBADO	25/11/2026 17:25	26/11/2026 15:05	feat(mando): implementar listado de eventos preventivos y drawer postgis en centro de incidentes (HU-76)
CP-H76-WEB-13	Manejo tipado de respuestas de error HTTP 400, 401 y 403 en prevencionService.listarEventosPrevencion (CA-5)	Seguridad / Resiliencia	Servicio	Alta	Respuestas HTTP 400, 401 y 403 simuladas desde apiClient.GET	Mock de respuestas status: 400, 401 y 403	Lanza PrevencionServiceError con statusCode correspondiente y mensaje institucional legible sin exponer datos fallback	Verificado en prevencionService.test.ts (tests 10, 11 y 12)	APROBADO	25/11/2026 17:25	26/11/2026 15:05	feat(mando): implementar listado de eventos preventivos y drawer postgis en centro de incidentes (HU-76)
CP-H76-WEB-14	Inicialización del estado cargando en useEventosPrevencion según el flag autoLoad	Funcional / Estado	Hook	Media	Invocación de useEventosPrevencion({ autoLoad: true }) y { autoLoad: false }	Renderizado del hook con autoLoad en ambos estados	cargando inicia en true si autoLoad es true y en false si autoLoad es false	Verificado en código fuente y en useEventosPrevencion.test.ts (test 1)	APROBADO	25/11/2026 17:25	26/11/2026 15:05	fix(prevencion): inicializar estado de carga segun autoLoad en useEventosPrevencion
CP-H76-WEB-15	Navegación de paginación (cambio de página) en useEventosPrevencion bajo estándar H34 (CA-1, CA-5)	Funcional / Paginación	Hook	Alta	Hook useEventosPrevencion con múltiples páginas disponibles	Invocación result.current.cambiarPagina(2)	Actualiza filtros.pagina a 2 y consulta GET /api/eventos-atp/prevencion?page=2&limit=20	Verificado en useEventosPrevencion.test.ts (test 3)	APROBADO	25/11/2026 17:25	26/11/2026 15:05	feat(mando): implementar listado de eventos preventivos y drawer postgis en centro de incidentes (HU-76)
CP-H76-WEB-16	Integración real cURL GET /api/eventos-atp/prevencion paginado y filtrado (HTTP 200 OK) contra sgrai-api + PostGIS (CA-5)	Integración E2E	API / BD PostGIS	Crítica	Backend sgrai-api en localhost:3001 y PostgreSQL/PostGIS activos con datos sembrados H76	GET /api/eventos-atp/prevencion?page=1&limit=2 y consulta filtrada (delegacionId, estado=EN_CURSO, busqueda=Angachilla) con JWT Encargado	Respuesta HTTP 200 OK con contrato H34 (message, data[], meta{total,page,limit,totalPages,hasNext,hasPrev}) y geometría GeoJSON EPSG:4326	HTTP 200 OK verificado con 6 eventos totales (pág. 1 de 3) y 1 coincidencia filtrada (PREV-2026-9001), incluyendo puntoCritico PostGIS y recursos	APROBADO	25/11/2026 17:25	-	feat(mando): implementar listado de eventos preventivos y drawer postgis en centro de incidentes (HU-76)
CP-H76-WEB-17	Integración real cURL GET /api/eventos-atp/prevencion ante parámetros inválidos (HTTP 400 Bad Request) (CA-5)	Integración / Validación	API	Alta	Sesión válida de Encargado contra sgrai-api	GET /api/eventos-atp/prevencion?delegacionId=invalido&estado=EN_EJECUCION	Respuesta HTTP 400 Bad Request detallando errores de validación Zod para delegacionId y estado	HTTP 400 retornado con arreglo errors especificando UUID inválido y enum permitido (PLANIFICADA, EN_CURSO, COMPLETADA, CANCELADA)	APROBADO	25/11/2026 17:25	-	feat(mando): implementar listado de eventos preventivos y drawer postgis en centro de incidentes (HU-76)
CP-H76-WEB-18	Integración real cURL GET /api/eventos-atp/prevencion sin autenticación (HTTP 401) y con rol Call Center (HTTP 403) (CA-5)	Seguridad / RBAC	API	Crítica	Backend sgrai-api en ejecución con usuarios semilla	Petición sin Authorization (401) y petición con JWT de callcenter@valdivia.cl (403)	HTTP 401 Unauthorized sin token y HTTP 403 Forbidden para rol sin permiso prevencion:eventos:leer	HTTP 401 y HTTP 403 confirmados en ejecución real contra sgrai-api	APROBADO	25/11/2026 17:25	-	feat(mando): implementar listado de eventos preventivos y drawer postgis en centro de incidentes (HU-76)
CP-H76-WEB-19	Validación de suite global Vitest (regresión) y análisis estático ESLint / TypeScript tras fixes y merge con develop	Calidad / Regresión	Estático / Unitario	Alta	Repositorio en rama feature/H76-listar-eventos-prevencion	Ejecución de npm test, npm run lint y npx next typegen && npx tsc --noEmit	0 fallos en pruebas unitarias globales, 0 errores ESLint y 0 errores TypeScript	1032/1032 tests aprobados (143 archivos), ESLint exit 0 y TypeScript exit 0	APROBADO	25/11/2026 17:25	26/11/2026 15:05	fix(mando): resolver observaciones de QA para listado de eventos preventivos (HU-76)
CP-H76-WEB-20	Compilación de producción (npm run build) con tipografía institucional Noto Sans auto-alojada (src/fonts/noto-sans/)	Despliegue / CI	Build	Alta	Repositorio en rama feature/H76-listar-eventos-prevencion sincronizada con develop	Ejecución de npm run build (next build --webpack)	Build de producción exitoso sin dependencia externa de Google Fonts en tiempo de compilación	Compilación exitosa (exit code 0), 49/49 páginas generadas y fuentes NotoSans-Latin-{400..800}.woff2 empaquetadas	APROBADO	25/11/2026 17:25	26/11/2026 15:05	merge: sincronizar con develop resolviendo conflicto en layout.tsx
```

---

## 5. Guía de Ejecución y Replicabilidad Paso a Paso (Evidencias de Re-Test #1)

### 5.1 Suite Automatizada del Módulo de Eventos Preventivos (Vitest)
**Comando:**
```bash
npm test -- src/services/__tests__/prevencionService.test.ts src/hooks/__tests__/useEventosPrevencion.test.ts src/components/mando/prevencion/__tests__/ src/components/mando/__tests__/KanbanViewSwitcher.test.tsx
```

**Resultado Obtenido en Re-Test #1 (0 advertencias `act(...)`):**
```text
 RUN  v3.2.7 /home/ds2fery/Documentos/Proyecto/sgrai-uach/web

 ✓ src/services/__tests__/prevencionService.test.ts (12 tests) 24ms
 ✓ src/components/mando/prevencion/__tests__/EventosPrevencionFiltros.test.tsx (6 tests) 503ms
 ✓ src/components/mando/prevencion/__tests__/EventosPrevencionTabla.test.tsx (4 tests) 513ms
 ✓ src/hooks/__tests__/useEventosPrevencion.test.ts (7 tests) 794ms
 ✓ src/components/mando/__tests__/KanbanViewSwitcher.test.tsx (4 tests) 550ms
 ✓ src/components/mando/prevencion/__tests__/EventoPrevencionDrawer.test.tsx (6 tests) 653ms
 ✓ src/components/mando/prevencion/__tests__/EventosPrevencionView.test.tsx (5 tests) 772ms

 Test Files  7 passed (7)
      Tests  44 passed (44)
   Duration  3.66s
```

**Ejecución focalizada por caso (`-t`):**
```bash
npm test -- -t "debe aplicar debounce en la busqueda textual"
npm test -- -t "debe descartar respuestas fuera de orden"
npm test -- -t "sin disparar peticion HTTP si el usuario no tiene permisos"
npm test -- -t "debe mostrar mensaje de error con boton Reintentar"
npm test -- -t "debe renderizar recursos logisticos asignados"
```

---

### 5.2 Suite Global de Regresión (Vitest)
**Comando:**
```bash
npm test -- --run
```

**Resultado Obtenido en Re-Test #1:**
```text
 Test Files  143 passed (143)
      Tests  1032 passed (1032)
   Start at  15:04:06
   Duration  26.99s
```

---

### 5.3 Análisis Estático (`npm run lint`), Chequeo TypeScript (`tsc --noEmit`) y Build de Producción (`npm run build`)
**Comandos:**
```bash
npm run lint
rm -rf .next/types && npx next typegen && npx tsc --noEmit
npm run build
```

**Resultados Obtenidos en Re-Test #1:**
```text
# ESLint
npm notice run eslint
Exit code: 0 (0 errores)

# TypeScript
Generating route types...
✓ Types generated successfully
Exit code: 0 (0 errores de compilación TypeScript)

# Build de Producción
▲ Next.js 16.3.4 (webpack)
✓ Compiled successfully in 6.8s
✓ Finished TypeScript in 7.6s
✓ Generating static pages using 15 workers (49/49) in 1044ms
Exit code: 0
```

---

### 5.4 Evidencia Forense de Defectos Abiertos en Re-Test #1

#### Verificación de Integridad de Capturas del Manual (`BUG-H76-WEB-06`)
**Comando:**
```bash
find docs/manuals/assets -name "*.png" -exec sha256sum {} + | sort
```

**Resultado Obtenido:**
```text
297433c0153cde16786c3a93bd65da60571e598d3ce8aa922e86470d8e36a46e  docs/manuals/assets/h38-evaluacion-prioridad-terreno-mando/drawer-acceso-ultimo-reporte.png
297433c0153cde16786c3a93bd65da60571e598d3ce8aa922e86470d8e36a46e  docs/manuals/assets/H76-listar-eventos-prevencion/drawer-detalle-postgis.png
a30bbb72791bb923985f8a9e1a2fba236f71aae287d2387616af2aa1d00dffed  docs/manuals/assets/h38-evaluacion-prioridad-terreno-mando/mision-detalle-historial-reportes.png
a30bbb72791bb923985f8a9e1a2fba236f71aae287d2387616af2aa1d00dffed  docs/manuals/assets/H76-listar-eventos-prevencion/filtros-estandar-h34.png
c8782935344ab9bcd2dd0951c52cdc941b397f33cf071f3826a84ad030426cbc  docs/manuals/assets/h38-evaluacion-prioridad-terreno-mando/kanban-card-prioridad-reportes.png
c8782935344ab9bcd2dd0951c52cdc941b397f33cf071f3826a84ad030426cbc  docs/manuals/assets/H76-listar-eventos-prevencion/tabla-eventos-preventivos.png
```

#### Verificación de Clases CSS Inexistentes (`BUG-H76-WEB-08`)
**Comando:**
```bash
grep -n "filtrosBar\|filtrosHeader" src/components/mando/prevencion/EventosPrevencionFiltros.tsx src/components/mando/prevencion/EventosPrevencion.module.css
```

**Resultado Obtenido:**
```text
src/components/mando/prevencion/EventosPrevencionFiltros.tsx:42:    <div className={styles.filtrosBar}>
src/components/mando/prevencion/EventosPrevencionFiltros.tsx:43:      <div className={styles.filtrosHeader}>
# 0 coincidencias en EventosPrevencion.module.css (donde existen .filtrosCard y .filtrosRow)
```

---

### 5.5 Pruebas de Integración Reales con cURL al Endpoint `GET /api/eventos-atp/prevencion`

#### Obtención de Tokens JWT Institucionales (`POST /api/seguridad/login`)
```bash
TOKEN_ENCARGADO=$(curl -s -X POST "http://localhost:3001/api/seguridad/login" \
  -H "Content-Type: application/json" \
  -d '{"identificador":"encargado@valdivia.cl","password":"Valdivia2026!"}' \
  | node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf8')); console.log(d.token || d.data?.token || '');")

TOKEN_CALLCENTER=$(curl -s -X POST "http://localhost:3001/api/seguridad/login" \
  -H "Content-Type: application/json" \
  -d '{"identificador":"callcenter@valdivia.cl","password":"Valdivia2026!"}' \
  | node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf8')); console.log(d.token || d.data?.token || '');")
```

#### Escenario A: Listado Paginado H34 con Evento Libre y Evento en Punto Crítico PostGIS (`200 OK`)
**Comando:**
```bash
curl -i -s -X GET "http://localhost:3001/api/eventos-atp/prevencion?page=1&limit=2" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN_ENCARGADO"
```

**Respuesta HTTP/JSON Real Obtenida:**
```http
HTTP/1.1 200 OK
content-type: application/json
```
```json
{
  "message": "Eventos de prevención obtenidos exitosamente.",
  "data": [
    {
      "id": "81000000-0000-4000-8000-000000000005",
      "codigo": "PREV-2026-9005",
      "nombre": "Operativo preventivo sin punto crítico catalogado (Guacamayo)",
      "descripcion": "Limpieza de zanja de evacuación con coordenadas directas de terreno.",
      "sector": "Guacamayo",
      "direccionTexto": "Av. Circunvalación Sur altura 2400",
      "prioridad": "BAJA",
      "estado": "PLANIFICADA",
      "latitud": -39.864,
      "longitud": -73.2295,
      "ubicacionGeoJson": {
        "type": "Point",
        "coordinates": [-73.2295, -39.864]
      },
      "puntoCritico": null,
      "delegacion": {
        "id": "30000000-0000-4000-8000-000000000002",
        "codigo": "DEL_SUR",
        "nombre": "Delegación Municipal Sur"
      },
      "mision": {
        "id": "82000000-0000-4000-8000-000000000005",
        "codigo": "MIS-2026-9005",
        "titulo": "Operativo preventivo sin punto crítico catalogado (Guacamayo)",
        "estado": "DESPACHADA",
        "tipoMision": "PREVENCION",
        "fechaInicio": "2026-11-19T14:00:00.000Z",
        "fechaCierre": null
      },
      "patrulla": {
        "id": "f1000000-0000-4000-8000-000000000002",
        "nombre": "Patrulla Rápida Centro-Sur",
        "estado": "EN_VERIFICACION"
      },
      "cuadrilla": null,
      "recursos": [
        {
          "recursoId": "e1000000-0000-4000-8000-000000000001",
          "nombre": "Motobomba Caudal 4\"",
          "cantidadAsignada": 4
        }
      ],
      "creadoPorId": "d1000000-0000-4000-8000-000000000004",
      "creadoEn": "2026-11-25T20:21:49.587Z",
      "actualizadoEn": "2026-11-25T20:21:49.587Z"
    },
    {
      "id": "81000000-0000-4000-8000-000000000004",
      "codigo": "PREV-2026-9004",
      "nombre": "Inspección preventiva de ribera en Collico",
      "descripcion": "Monitoreo de borde fluvial y verificación de defensas ribereñas.",
      "sector": "Collico",
      "direccionTexto": "Borde Río Calle Calle s/n",
      "prioridad": "MEDIA",
      "estado": "CANCELADA",
      "latitud": -39.8182,
      "longitud": -73.212,
      "ubicacionGeoJson": {
        "type": "Point",
        "coordinates": [-73.212, -39.8182]
      },
      "puntoCritico": {
        "id": "40000000-0000-4000-8000-000000000002",
        "codigo": "PC-COL-02",
        "nombre": "Sector Collico - Borde Río Calle Calle",
        "descripcion": "Sector ribereño con riesgo de desborde y anegamiento de calzada por crecida de marea",
        "tipoRiesgo": "Desborde de cauce e inundación de calzada",
        "prioridad": "MEDIA",
        "latitud": -39.8182,
        "longitud": -73.212,
        "ubicacionGeoJson": {
          "type": "Point",
          "coordinates": [-73.212, -39.8182]
        }
      },
      "delegacion": {
        "id": "30000000-0000-4000-8000-000000000004",
        "codigo": "DEL_CALLE_CALLE",
        "nombre": "Delegación Municipal Calle Calle"
      },
      "mision": {
        "id": "82000000-0000-4000-8000-000000000004",
        "codigo": "MIS-2026-9004",
        "titulo": "Inspección preventiva de ribera en Collico",
        "estado": "CANCELADA",
        "tipoMision": "PREVENCION",
        "fechaInicio": "2026-11-14T11:00:00.000Z",
        "fechaCierre": "2026-11-14T12:00:00.000Z"
      },
      "patrulla": {
        "id": "f1000000-0000-4000-8000-000000000002",
        "nombre": "Patrulla Rápida Centro-Sur",
        "estado": "EN_VERIFICACION"
      },
      "cuadrilla": null,
      "recursos": [
        {
          "recursoId": "e1000000-0000-4000-8000-000000000001",
          "nombre": "Motobomba Caudal 4\"",
          "cantidadAsignada": 4
        }
      ],
      "creadoPorId": "d1000000-0000-4000-8000-000000000004",
      "creadoEn": "2026-11-25T20:21:49.578Z",
      "actualizadoEn": "2026-11-25T20:21:49.578Z"
    }
  ],
  "meta": {
    "total": 6,
    "page": 1,
    "limit": 2,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### Escenario B: Filtrado Combinado H34 por Delegación, Estado y Búsqueda (`200 OK`)
**Comando:**
```bash
curl -i -s -X GET "http://localhost:3001/api/eventos-atp/prevencion?page=1&limit=10&delegacionId=30000000-0000-4000-8000-000000000002&estado=EN_CURSO&busqueda=Angachilla" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN_ENCARGADO"
```

**Respuesta HTTP/JSON Real Obtenida:**
```http
HTTP/1.1 200 OK
content-type: application/json
```
```json
{
  "message": "Eventos de prevención obtenidos exitosamente.",
  "data": [
    {
      "id": "81000000-0000-4000-8000-000000000001",
      "codigo": "PREV-2026-9001",
      "nombre": "Limpieza preventiva de sumideros en Angachilla",
      "descripcion": "Despeje de colectores y rejillas de aguas lluvias previo a sistema frontal.",
      "sector": "Humedal Angachilla",
      "direccionTexto": "Pasaje Los Robles s/n con Av. Simpson",
      "prioridad": "ALTA",
      "estado": "EN_CURSO",
      "latitud": -39.8456,
      "longitud": -73.2389,
      "ubicacionGeoJson": {
        "type": "Point",
        "coordinates": [-73.2389, -39.8456]
      },
      "puntoCritico": null,
      "delegacion": {
        "id": "30000000-0000-4000-8000-000000000002",
        "codigo": "DEL_SUR",
        "nombre": "Delegación Municipal Sur"
      },
      "mision": {
        "id": "82000000-0000-4000-8000-000000000001",
        "codigo": "MIS-2026-9001",
        "titulo": "Limpieza preventiva de sumideros en Angachilla",
        "estado": "EN_CURSO",
        "tipoMision": "PREVENCION",
        "fechaInicio": "2026-11-18T09:00:00.000Z",
        "fechaCierre": null
      },
      "patrulla": {
        "id": "f1000000-0000-4000-8000-000000000002",
        "nombre": "Patrulla Rápida Centro-Sur",
        "estado": "EN_VERIFICACION"
      },
      "cuadrilla": null,
      "recursos": [
        {
          "recursoId": "e1000000-0000-4000-8000-000000000001",
          "nombre": "Motobomba Caudal 4\"",
          "cantidadAsignada": 4
        }
      ],
      "creadoPorId": "d1000000-0000-4000-8000-000000000004",
      "creadoEn": "2026-11-25T20:21:49.521Z",
      "actualizadoEn": "2026-11-25T20:21:49.521Z"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

#### Escenario C: Validación de Parámetros Inválidos (`400 Bad Request`)
**Comando:**
```bash
curl -i -s -X GET "http://localhost:3001/api/eventos-atp/prevencion?delegacionId=invalido&estado=EN_EJECUCION" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN_ENCARGADO"
```

**Respuesta HTTP/JSON Real Obtenida:**
```http
HTTP/1.1 400 Bad Request
content-type: application/json
```
```json
{
  "message": "Parámetros de consulta inválidos para listar eventos de prevención.",
  "errors": [
    {
      "campo": "delegacionId",
      "mensaje": "El UUID de la delegación debe ser válido"
    },
    {
      "campo": "estado",
      "mensaje": "Invalid option: expected one of \"PLANIFICADA\"|\"EN_CURSO\"|\"COMPLETADA\"|\"CANCELADA\""
    }
  ]
}
```

#### Escenario D: Petición sin Cabecera de Autenticación (`401 Unauthorized`)
**Comando:**
```bash
curl -i -s -X GET "http://localhost:3001/api/eventos-atp/prevencion" \
  -H "Accept: application/json"
```

**Respuesta HTTP/JSON Real Obtenida:**
```http
HTTP/1.1 401 Unauthorized
content-type: application/json
```
```json
{
  "message": "Se requiere cabecera de autenticación Authorization: Bearer <token>."
}
```

#### Escenario E: Acceso Restringido para Perfil Call Center sin Permiso `prevencion:eventos:leer` (`403 Forbidden`)
**Comando:**
```bash
curl -i -s -X GET "http://localhost:3001/api/eventos-atp/prevencion" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN_CALLCENTER"
```

**Respuesta HTTP/JSON Real Obtenida:**
```http
HTTP/1.1 403 Forbidden
content-type: application/json
```
```json
{
  "message": "Acceso denegado. Se requiere el perfil de Administrador o permisos de gestión de roles para acceder."
}
```

---

### 5.6 Verificación de Integración Gitflow contra `origin/develop` (`BUG-H76-WEB-07`)
**Comando:**
```bash
git merge-tree --write-tree HEAD origin/develop
```

**Resultado Obtenido en Re-Test #1:**
```text
ec880bc7214be4f86d54ca8d25505b6336f8abc5
Exit code: 0 (0 conflictos de fusión)
```

---

## 6. Matriz de Trazabilidad de Criterios de Aceptación (CA)

| ID CA | Descripción del Criterio de Aceptación (HU-76) | Casos de Prueba Asociados | Defectos Asociados | Estado de Cumplimiento |
|:---:|---|---|---|:---:|
| **CA-1** | El sistema debe proveer una vista tabular en `/gestion/centro-incidentes` bajo el estándar de contratos H34. | `CP-H76-WEB-01`, `CP-H76-WEB-14`, `CP-H76-WEB-15`, `CP-H76-WEB-19`, `CP-H76-WEB-20` | `BUG-H76-WEB-01` (Cerrado), `BUG-H76-WEB-04` (Cerrado), `BUG-H76-WEB-05` (Cerrado), `BUG-H76-WEB-07` (Cerrado), `BUG-H76-WEB-06` (Abierto) | 🟡 **Pendiente manual real** |
| **CA-2** | La tabla debe listar: Código de prevención, Punto crítico asociado, Delegación, Estado (`PLANIFICADA`, `EN_EJECUCION`/`EN_CURSO`, `COMPLETADA`, `CANCELADA`), Cuadrilla/Patrulla a cargo y Fechas. | `CP-H76-WEB-02`, `CP-H76-WEB-03`, `CP-H76-WEB-04` | `BUG-H76-WEB-08` (Abierto — borde de badge) | 🟡 **Cumplido con observación visual** |
| **CA-3** | Debe permitir filtros por delegación municipal, estado y buscador por punto crítico. | `CP-H76-WEB-05`, `CP-H76-WEB-06`, `CP-H76-WEB-07` | `BUG-H76-WEB-02` (Cerrado), `BUG-H76-WEB-04` (Cerrado), `BUG-H76-WEB-08` (Abierto — CSS de barra de filtros) | 🔴 **Regresión CSS en barra de filtros** |
| **CA-4** | Drawer lateral desplegable al hacer clic en una fila con información del punto crítico PostGIS. | `CP-H76-WEB-08`, `CP-H76-WEB-09`, `CP-H76-WEB-10`, `CP-H76-WEB-11` | `BUG-H76-WEB-05` (Cerrado) | 🟢 **Cumplido y Verificado** |
| **CA-5** | El endpoint `GET /api/eventos-atp/prevencion` debe responder bajo estándar H34. | `CP-H76-WEB-12`, `CP-H76-WEB-13`, `CP-H76-WEB-16`, `CP-H76-WEB-17`, `CP-H76-WEB-18` | `BUG-H76-WEB-03` (Cerrado) | 🟢 **Cumplido y Verificado** |
