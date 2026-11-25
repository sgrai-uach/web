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
>  
> **Fecha de Auditoría Inicial QA:** 25 de Noviembre de 2026 17:33.  
> **Fecha de Re-Test QA:** (Pendiente).  
> **Estado de Certificación:** 🔴 **CAMBIOS SOLICITADOS (`CHANGES REQUESTED`) — 7 DEFECTOS ABIERTOS DETECTADOS EN AUDITORÍA INICIAL (SE REQUIERE MERGE DESDE `develop`, CORRECCIÓN Y RE-TEST)**.

---

## 1. Resumen Ejecutivo de Pruebas

| Métrica | Resultado | Observaciones Técnicas |
|---|:---:|---|
| **Total de Casos de Prueba Ejecutados** | **27** | 20 Casos Funcionales/UI/Integración/Seguridad/Calidad + 7 Defectos Reales Formalizados |
| **Casos Aprobados (`APROBADO`)** | **20** | Funcionalidad base tabular, filtros por delegación/estado/texto, servicio GET, paginación H34 y compilación operativa |
| **Defectos Abiertos (`ABIERTO`)** | **7** | 1 Crítico (RBAC/WebSocket), 4 Altos (Debounce/Race Condition, Contrato OpenAPI manual, Integración Kanban/URL, Desfase de 94 commits y conflicto con `develop`) y 2 Medios (PostGIS/Resiliencia UI, Guía Visual/ARIA/Manual) |
| **Casos Bloqueados (`BLOQUEADO`)** | **0** | Sin bloqueos de entorno; backend `sgrai-api` y PostGIS operativos para evidencia HTTP real |
| **Tasa de Aprobación Global (% Pass)** | **74.1%** | No alcanza el umbral de certificación (100% sin defectos críticos/altos) para merge a `develop` |
| **Análisis Estático de Código (`npm run lint`)** | 🟢 **0 errores** | Ejecución de ESLint sin errores bloqueantes (`exit code 0`) |
| **Chequeo de Tipos Estáticos (`npx tsc --noEmit`)** | 🟢 **0 errores** | Compilación TypeScript limpia tras regeneración de tipos Next.js (`next typegen`) |
| **Compilación de Producción (`npm run build`)** | 🟢 **Exit 0** | Build Webpack de Next.js 16.3.4 completado (47/47 rutas generadas, tipografía local Noto Sans operativa) |
| **Suite Automatizada del Módulo Prevención (Vitest)** | 🟢 **38/38 tests pass** | 7 suites ejecutadas (`prevencionService`, `useEventosPrevencion`, `EventosPrevencionView`, `EventosPrevencionTabla`, `EventosPrevencionFiltros`, `EventoPrevencionDrawer`, `KanbanViewSwitcher`); se observa advertencia `act(...)` en prueba de RBAC por petición no bloqueada |
| **Suite Global del Proyecto (Vitest)** | 🟢 **887/887 tests pass** | 133 archivos de prueba ejecutados sin regresiones en módulos existentes |
| **Control de Acceso Perimetral (RBAC)** | 🔴 **CON HALLAZGO** | Bloqueo visual con `AccesoDenegadoState` existe, pero el componente dispara fetch API, WebSocket (`sala:encargados`) y mutación URL antes/a pesar de no tener permiso (`BUG-H76-WEB-01`) |
| **Contrato OpenAPI y Estándar H34** | 🔴 **CON HALLAZGO** | `api-generated.d.ts` editado manualmente omitiendo `recursos`, `creadoPorId`, `500` y tipado real de `errors` 400 (`BUG-H76-WEB-03`); sincronización URL incompleta y sin sanitización (`BUG-H76-WEB-04`) |
| **Cumplimiento Guía Visual Municipal y Accesibilidad** | 🟡 **PARCIAL** | Uso de `<h3>` y `<button>` nativos fuera de `<Heading>`/`<Button>`, `<tr role="button">` con botones anidados y manual sin capturas ni sección de integración (`BUG-H76-WEB-06`) |

> **Nota de Alineación de Dominio (Estado `EN_CURSO` vs `EN_EJECUCION`):** En el backend `sgrai-api` (`evento-prevencion.schema.ts` y tabla PostgreSQL `evento_prevencion`), el valor canónico del enum de estado en ejecución es `EN_CURSO`, el cual la interfaz web mapea consistentemente a la etiqueta visible **"En Ejecución"** (`ESTADOS_PREVENCION`). Se valida que el envío del valor `EN_EJECUCION` al endpoint retorna `400 Bad Request` conforme al contrato real de `sgrai-api`.

---

## 2. Registro Técnico de Defectos Detectados

| ID Defecto | Descripción Técnica del Defecto | Severidad | Módulo / Archivo Afectado | Fecha Detección | Estado | Commit del Fix (Sin Hash) | Fecha Re-Test | Dictamen QA |
|---|---|:---:|---|:---:|:---:|---|:---:|:---:|
| `BUG-H76-WEB-01` | **Fuga RBAC por ejecución incondicional de petición API, suscripción WebSocket (`sala:encargados`/`mapa`) y mutación URL sin permiso `prevencion:eventos:leer`:** `EventosPrevencionView.tsx` pasa `autoLoad: true` fijo a `useEventosPrevencion` sin evaluar `puedeLeer`, disparando `GET /api/eventos-atp/prevencion`, `getCatalogos()`, `window.history.replaceState` y la conexión Socket.io a salas operativas restringidas aun cuando el usuario carece de privilegios (causando además warning de `act(...)` en Vitest). Adicionalmente, `puedeLeer` incluye `hasPermission('incidentes:kanban')` como bypass cliente porque `SimulatedSessionContext` omite `prevencion:eventos:leer` en los perfiles fallback, y durante `!isMounted` se renderiza brevemente el cuerpo antes del bloqueo. | Crítica | `src/components/mando/prevencion/EventosPrevencionView.tsx` y `src/context/SimulatedSessionContext.tsx` | 25/11/2026 17:25 | `ABIERTO` | Pendiente (Rechazado en Code Review) | (Pendiente) | 🔴 **BLOQUEANTE:** Condicionar `autoLoad: Boolean(isMounted && puedeLeer)`, carga de catálogos y sincronización URL al permiso real `prevencion:eventos:leer` (registrándolo en `SimulatedSessionContext` y `AccesoDenegadoState`). |
| `BUG-H76-WEB-02` | **Debounce de búsqueda textual roto y condición de carrera (*race condition*) sin cancelación en `useEventosPrevencion`:** El `useEffect` de consulta incluye el objeto `filtros` completo (que contiene `filtros.busqueda`) en sus dependencias junto con `busquedaDebounced`. Cada pulsación de tecla dispara inmediatamente (0 ms) una petición HTTP redundante con el término de búsqueda previo, seguida de otra petición a los 300 ms. Adicionalmente, `cargarEventos` no implementa `AbortController` ni identificador de secuencia (`requestIdRef`) para descartar respuestas fuera de orden. | Alta | `src/hooks/useEventosPrevencion.ts` | 25/11/2026 17:25 | `ABIERTO` | Pendiente (Rechazado en Code Review) | (Pendiente) | 🔴 **BLOQUEANTE:** Desacoplar dependencias primitivas (`pagina`, `limite`, `delegacionId`, `estado`, `busquedaDebounced`) excluyendo `filtros.busqueda` crudo y agregar guardia de secuencia / `AbortController`. |
| `BUG-H76-WEB-03` | **Edición manual de `src/types/api-generated.d.ts` con divergencias frente al contrato OpenAPI real de `sgrai-api`:** El archivo autogenerado fue modificado a mano en vez de regenerarse con `npm run generate-api-types`. Diverge del esquema real de `sgrai-api` omitiendo `recursos` (`{ recursoId, nombre, cantidadAsignada }[]`), `creadoPorId` y la respuesta `500`, además de tipar `errors` en HTTP 400 como `Record<string, string[]>` cuando la API retorna `Array<{ campo: string; mensaje: string }>`. | Alta | `src/types/api-generated.d.ts`, `src/types/evento-prevencion.ts` y `src/services/prevencionService.ts` | 25/11/2026 17:25 | `ABIERTO` | Pendiente (Rechazado en Code Review) | (Pendiente) | 🔴 **BLOQUEANTE:** Regenerar `src/types/api-generated.d.ts` desde `GET /openapi.json`, alinear `EventoPrevencionListItemDTO` (incluyendo `recursos`) y normalizar el parseo de `errors` 400 en `prevencionService.ts`. |
| `BUG-H76-WEB-04` | **Contaminación visual de filtros/KPIs Kanban en pestaña Prevención, pérdida de sincronización `?tab=`/`limit`, prop `onAbrirCrearPrevencion` ignorada y query params sin sanitizar:** En `KanbanBoard.tsx`, al seleccionar "Eventos Preventivos", permanecen visibles `IncidentesKpiCards` y `KanbanFiltros` duplicando barras de filtrado sobre la tabla. Al volver a "Tablero Kanban" o "Mapa Operativo", no se limpia `?tab=prevencion` ni filtros de la URL (F5 retorna a prevención). `EventosPrevencionView` ignora `onAbrirCrearPrevencion`, `handleRefrescoCompleto` no refresca la tabla tras crear en HU-30, no se sincroniza `limit` en URL y los parámetros `estado`/`delegacionId` de la URL se envían sin validar provocando HTTP 400. | Alta | `src/components/mando/KanbanBoard.tsx` y `src/components/mando/prevencion/EventosPrevencionView.tsx` | 25/11/2026 17:25 | `ABIERTO` | Pendiente (Rechazado en Code Review) | (Pendiente) | 🔴 **BLOQUEANTE:** Ocultar `KanbanFiltros` en vista `prevencion`, sincronizar `?tab=` al cambiar de vista, validar query params contra valores permitidos y conectar creación/recarga de eventos. |
| `BUG-H76-WEB-05` | **Desconexión de geometría PostGIS del `puntoCritico` en el Drawer, falta de botón "Reintentar" ante error, estado vacío sin acción "Limpiar filtros" y contador duplicado en paginación:** Cuando `evento.puntoCritico` existe, el Drawer solo lee `evento.latitud`/`evento.longitud`/`evento.ubicacionGeoJson` sin desplegar los datos geoespaciales propios del punto crítico (`puntoCritico.latitud`, `puntoCritico.longitud`, `puntoCritico.ubicacionGeoJson`). Ante fallos de carga (`error`), falta botón "Reintentar" (`recargar`) y se muestra el estado vacío debajo del error. En estado vacío filtrado falta el botón "Limpiar filtros" prometido en el manual. En el pie de tabla se duplica el contador `"Mostrando X de Y"` junto al texto propio de `Pagination`. | Media | `src/components/mando/prevencion/EventoPrevencionDrawer.tsx`, `src/components/mando/prevencion/EventosPrevencionView.tsx` y `src/components/mando/prevencion/EventosPrevencionTabla.tsx` | 25/11/2026 17:25 | `ABIERTO` | Pendiente (Rechazado en Code Review) | (Pendiente) | 🟡 **REQUERIDO:** Priorizar/exhibir coordenadas y geometría PostGIS del punto crítico (y recursos asignados), incorporar botón "Reintentar" y "Limpiar filtros" en estado vacío, y eliminar el contador duplicado. |
| `BUG-H76-WEB-06` | **Incumplimiento de componentes base (`Heading`/`Button`), rol ARIA inválido `<tr role="button">` y entregables faltantes en el manual de usuario:** `EventoPrevencionDrawer.tsx` emplea 4 etiquetas `<h3>` y 1 `<button>` nativos; `EventosPrevencionFiltros.tsx` emplea 4 `<button>` nativos (3 con estilos inline). `EventosPrevencionTabla.tsx` asigna `role="button"` al elemento `<tr>` con `<Button>` anidado (inválido en WAI-ARIA). El manual `docs/manuals/H76-listar-eventos-prevencion.md` no incluye capturas en `docs/manuals/assets/H76-listar-eventos-prevencion/` ni sección de relación con `sgrai-api`/`sgrai-pwa`, y describe un botón de limpieza inexistente en la tabla vacía. | Media | `src/components/mando/prevencion/EventoPrevencionDrawer.tsx`, `src/components/mando/prevencion/EventosPrevencionFiltros.tsx`, `src/components/mando/prevencion/EventosPrevencionTabla.tsx` y `docs/manuals/H76-listar-eventos-prevencion.md` | 25/11/2026 17:25 | `ABIERTO` | Pendiente (Rechazado en Code Review) | (Pendiente) | 🟡 **REQUERIDO:** Migrar encabezados y botones a `<Heading>`/`<Button>`, corregir semántica accesible de fila sin `role="button"` en `<tr>` y completar el manual conforme a `GEMINI.md` §3 y §7. |
| `BUG-H76-WEB-07` | **Rama desfasada respecto a `develop` (94 commits atrás) con conflicto real de fusión en `src/app/layout.tsx` y solapamiento en `KanbanBoard.tsx` y `api-generated.d.ts`:** La simulación de integración (`git merge-tree --write-tree HEAD origin/develop`) confirma un conflicto directo de contenido en `src/app/layout.tsx` (en `develop` ya se encuentra auto-alojada Noto Sans en `src/fonts/noto-sans/NotoSans-Latin-{400..800}.woff2` con regla ESLint, duplicando la solución introducida en H76), además de divergencias sustantivas en `src/components/mando/KanbanBoard.tsx` (435 líneas de cambios de H32/H37/H38/H61/H69) y `src/types/api-generated.d.ts` (9.234 líneas actualizadas a OpenAPI 0.12.0). | Alta | `src/app/layout.tsx`, `src/components/mando/KanbanBoard.tsx` y `src/types/api-generated.d.ts` | 25/11/2026 17:33 | `ABIERTO` | Pendiente (Rechazado en Code Review) | (Pendiente) | 🔴 **BLOQUEANTE:** Integrar `develop` mediante `git merge origin/develop` en la rama `feature/H76-listar-eventos-prevencion`, conservar la configuración oficial de `layout.tsx` de `develop`, integrar los cambios de `KanbanBoard.tsx` y regenerar `api-generated.d.ts` antes del Re-Test. |

---

## 3. Matriz Consolidada de Casos de Prueba (13 Columnas Institucionales)

| ID Caso | Título del Caso de Prueba | Tipo de Prueba | Nivel | Prioridad | Precondición | Datos de Prueba (Payload / Headers / Query) | Resultado Esperado | Resultado Obtenido | Estado | Fecha / Hora Ejecución | Fecha / Hora Re-Test | Solución / Commit |
|---|---|---|---|---|---|---|---|---|:---:|:---:|:---:|---|
| `BUG-H76-WEB-01` | Bloqueo perimetral RBAC sin peticiones API, suscripción WebSocket ni mutación URL para perfiles sin permiso `prevencion:eventos:leer` | Seguridad / RBAC | Vista / Hook | Crítica | Sesión activa con rol Informante o Call Center (`hasPermission('prevencion:eventos:leer') === false`) | Montaje de `EventosPrevencionView` en `/gestion/centro-incidentes?tab=prevencion` | Mostrar `AccesoDenegadoState` sin invocar `listarEventosPrevencion`, sin unirse a `sala:encargados` ni mutar la URL | Se renderiza `AccesoDenegadoState`, pero `autoLoad: true` dispara igualmente fetch API, conexión Socket.io, `getCatalogos()` y `replaceState` (warning `act(...)` en Vitest) | **ABIERTO** | 25/11/2026 17:25 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| `BUG-H76-WEB-02` | Debounce efectivo de 300 ms en buscador textual y protección contra respuestas fuera de orden (*race condition*) en `useEventosPrevencion` | Rendimiento / Concurrencia | Hook | Alta | Hook `useEventosPrevencion` montado con `autoLoad: true` | Escritura secuencial de `"Angachilla"` en `cambiarBusqueda` y alternancia rápida de filtros con latencias dispares | Emitir una única petición HTTP tras 300 ms de inactividad y descartar respuestas obsoletas vía `AbortController` o secuencia | Cada pulsación de tecla dispara inmediatamente (0 ms) una petición HTTP con `busquedaDebounced` anterior al depender del objeto `filtros` completo; sin cancelación de solicitudes obsoletas | **ABIERTO** | 25/11/2026 17:25 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| `BUG-H76-WEB-03` | Sincronización automática del contrato OpenAPI en `src/types/api-generated.d.ts` respecto al esquema real de `sgrai-api` (CA-5) | Integración / Contrato OpenAPI | DAL / Tipos | Alta | Spec OpenAPI activo en `sgrai-api` (`GET /openapi.json`) | Comparación de `paths['/api/eventos-atp/prevencion']['get']` en `api-generated.d.ts` vs respuesta HTTP 200/400 real | Tipos generados con `openapi-typescript` incluyendo `recursos`, `creadoPorId`, respuesta `500` y `errors: Array<{ campo, mensaje }>` en 400 | Archivo editado manualmente; omite `recursos`, `creadoPorId` y `500`, y tipa `errors` 400 como `Record<string, string[]>` en lugar de arreglo | **ABIERTO** | 25/11/2026 17:25 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| `BUG-H76-WEB-04` | Integración limpia en `/gestion/centro-incidentes`, sincronización bidireccional de `?tab=`/`limit` y sanitización de query params (CA-1, CA-3) | Funcional / Integración | Vista / Router | Alta | Usuario Encargado navegando en `/gestion/centro-incidentes` | Alternar pestaña `prevencion -> kanban`, recargar página (F5) y navegar con `?tab=prevencion&estado=EN_EJECUCION` | Ocultar `KanbanFiltros` en pestaña prevención, limpiar `?tab=prevencion` al volver a Kanban, persistir `limit` y sanitizar query params inválidos | `KanbanFiltros` y `IncidentesKpiCards` permanecen visibles; `?tab=prevencion` queda pegado al volver a Kanban; `onAbrirCrearPrevencion` ignorado; query inválido dispara HTTP 400 | **ABIERTO** | 25/11/2026 17:25 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| `BUG-H76-WEB-05` | Visualización PostGIS propia de `puntoCritico`, botón "Reintentar" en error, botón "Limpiar filtros" en tabla vacía y eliminación de contador duplicado (CA-4) | Funcional / Resiliencia UX | Drawer / Vista / Tabla | Media | Evento con `puntoCritico` PostGIS asociado; escenario de fallo de red (HTTP 500) y búsqueda sin coincidencias | Apertura de `EventoPrevencionDrawer`, simulación de error en servicio y búsqueda `"InexistenteXYZ"` | Mostrar coordenadas/GeoJSON de `puntoCritico`, banner de error con botón "Reintentar" sin tabla vacía contradictoria, botón "Limpiar filtros" en tabla vacía y contador único en paginador | Drawer solo consume coordenadas del evento raíz; error no ofrece reintento y deja tabla vacía debajo; tabla vacía carece de "Limpiar filtros"; contador de registros aparece duplicado | **ABIERTO** | 25/11/2026 17:25 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| `BUG-H76-WEB-06` | Cumplimiento de componentes institucionales (`Heading`/`Button`), accesibilidad WAI-ARIA de tabla y completitud del manual de usuario | UI / Accesibilidad / Docs | Componentes / Docs | Media | Revisión de componentes `src/components/mando/prevencion/` y `docs/manuals/H76-listar-eventos-prevencion.md` | Inspección JSX/ARIA y verificación de `docs/manuals/assets/H76-listar-eventos-prevencion/` | Uso exclusivo de `<Heading>` y `<Button>`, fila accesible sin `role="button"` en `<tr>` y manual completo con capturas y sección de integración | Existen 4 `<h3>` y 5 `<button>` nativos, `<tr role="button">` anida `<Button>`, faltan capturas y sección `sgrai-api`/`sgrai-pwa` en el manual | **ABIERTO** | 25/11/2026 17:25 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| `BUG-H76-WEB-07` | Sincronización de rama `feature/H76-listar-eventos-prevencion` con `origin/develop` sin conflictos de fusión (Gitflow / CI) | Integración / Gitflow | Repositorio / CI | Alta | Rama `feature/H76-listar-eventos-prevencion` evaluada contra `origin/develop` | `git rev-list --left-right --count HEAD...origin/develop` y `git merge-tree --write-tree HEAD origin/develop` | Rama actualizada con `develop` (0 commits atrás) y fusión limpia sin conflictos en `layout.tsx`, `KanbanBoard.tsx` ni `api-generated.d.ts` | Rama 94 commits atrás de `origin/develop` con conflicto de contenido en `src/app/layout.tsx` y solapamiento en `KanbanBoard.tsx` y `api-generated.d.ts` | **ABIERTO** | 25/11/2026 17:33 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| `CP-H76-WEB-01` | Conmutación hacia pestaña "Eventos Preventivos" desde `KanbanViewSwitcher` en `/gestion/centro-incidentes` (CA-1) | Funcional / UI | Componente | Alta | Vista `/gestion/centro-incidentes` montada con usuario Encargado | Clic en botón `"Eventos Preventivos"` (ícono `ShieldAlert`) | `KanbanViewSwitcher` invoca `onCambiarVista('prevencion')` con `aria-pressed="true"` y despliega `EventosPrevencionView` | Validado en `KanbanViewSwitcher.test.tsx` (4/4 tests) y `KanbanBoard.tsx` | **APROBADO** | 25/11/2026 17:25 | - | feat(mando): implementar listado de eventos preventivos y drawer postgis en centro de incidentes (HU-76) |
| `CP-H76-WEB-02` | Renderizado de todas las columnas obligatorias en `EventosPrevencionTabla` (CA-2) | Funcional / UI | Componente / Tabla | Crítica | Lista de eventos preventivos entregada a `EventosPrevencionTabla` | Arreglo `mockEventos` con evento en punto crítico (`PREV-2026-0001`) y evento en coordenadas libres (`PREV-2026-0002`) | Encabezados y celdas visibles: Código, Punto Crítico, Delegación, Estado, Unidad a Cargo, Fechas y Acciones | Las 7 columnas despliegan código/nombre, punto crítico o badge `"Coordenadas libres"`, delegación, badge de estado, cuadrilla/patrulla, fechas formateadas `es-CL` y botón `"Detalle"` | **APROBADO** | 25/11/2026 17:25 | - | feat(mando): implementar listado de eventos preventivos y drawer postgis en centro de incidentes (HU-76) |
| `CP-H76-WEB-03` | Visualización de badges semánticos para los 4 estados operativos (`PLANIFICADA`, `EN_CURSO`, `COMPLETADA`, `CANCELADA`) (CA-2) | UI / Diseño | Componente / Badge | Alta | Eventos preventivos con cada uno de los 4 estados canónicos | `ESTADOS_PREVENCION` evaluado en `EventosPrevencionTabla` y `EventoPrevencionDrawer` | Etiquetas planas (`border-radius: 0`) con dot indicador: Planificada (ámbar), En Ejecución (teal), Completada (verde) y Cancelada (rojo) | Badges renderizados sin bordes redondeados en el contenedor y sin emojis, con mapeo consistente de colores institucionales | **APROBADO** | 25/11/2026 17:25 | - | feat(mando): implementar listado de eventos preventivos y drawer postgis en centro de incidentes (HU-76) |
| `CP-H76-WEB-04` | Identificación de unidad operativa a cargo (Cuadrilla, Patrulla o "Sin asignar") en tabla y drawer (CA-2) | Funcional / UI | Componente | Alta | Eventos con `cuadrilla`, con `patrulla` y sin unidad asignada (`null`) | Inspección de columna "Unidad a Cargo" en `EventosPrevencionTabla` y sección 3 en `EventoPrevencionDrawer` | Prioriza nombre y tipo `"Cuadrilla"`, si es `null` despliega `"Patrulla"`, y si ambos son `null` muestra `"Sin asignar"` | Verificado en `EventosPrevencionTabla.test.tsx` y `EventoPrevencionDrawer.test.tsx` | **APROBADO** | 25/11/2026 17:25 | - | feat(mando): implementar listado de eventos preventivos y drawer postgis en centro de incidentes (HU-76) |
| `CP-H76-WEB-05` | Filtrado por delegación municipal desde `EventosPrevencionFiltros` y recarga en `useEventosPrevencion` (CA-3) | Funcional / Filtros | Componente / Hook | Alta | Catálogo de delegaciones cargado en el selector | Selección de `delegacionId = 'del-2'` en `<select aria-label="Filtrar por delegación municipal">` | Invoca `onDelegacionChange('del-2')`, reinicia `pagina: 1` y despacha consulta filtrada al endpoint | Verificado en `EventosPrevencionFiltros.test.tsx` y `useEventosPrevencion.test.ts` | **APROBADO** | 25/11/2026 17:25 | - | feat(mando): implementar listado de eventos preventivos y drawer postgis en centro de incidentes (HU-76) |
| `CP-H76-WEB-06` | Filtrado por estado operativo desde `EventosPrevencionFiltros` (CA-3) | Funcional / Filtros | Componente / Hook | Alta | Selector de estado operativo visible | Selección de opción `"En Ejecución"` (`value="EN_CURSO"`) | Invoca `onEstadoChange('EN_CURSO')`, reinicia `pagina: 1` y muestra chip `"Estado: En Ejecución"` | Verificado en `EventosPrevencionFiltros.test.tsx` (test 4) y `useEventosPrevencion.test.ts` (test 2) | **APROBADO** | 25/11/2026 17:25 | - | feat(mando): implementar listado de eventos preventivos y drawer postgis en centro de incidentes (HU-76) |
| `CP-H76-WEB-07` | Búsqueda textual por punto crítico, código o sector y limpieza de filtros activos (CA-3) | Funcional / Filtros | Componente | Alta | Barra `EventosPrevencionFiltros` renderizada con criterios activos | Entrada `"angachilla"` en buscador y clic en `"Limpiar filtros"` | Actualiza `busqueda`, muestra chips con contador de resultados y al pulsar `"Limpiar filtros"` restablece todos los criterios y vuelve a página 1 | Verificado en `EventosPrevencionFiltros.test.tsx` (tests 2 y 5) y `useEventosPrevencion.test.ts` (test 4) | **APROBADO** | 25/11/2026 17:25 | - | feat(mando): implementar listado de eventos preventivos y drawer postgis en centro de incidentes (HU-76) |
| `CP-H76-WEB-08` | Apertura del Drawer lateral al hacer clic en una fila o en el botón "Detalle" (CA-4) | Funcional / UI | Componente / Vista | Crítica | Tabla con al menos un evento preventivo cargado | Clic en fila o botón `"Detalle"` de `PREV-2026-0001` | Despliega `EventoPrevencionDrawer` con `role="dialog"`, `aria-modal="true"` y encabezado del evento seleccionado | Verificado en `EventosPrevencionView.test.tsx` y `EventosPrevencionTabla.test.tsx` | **APROBADO** | 25/11/2026 17:25 | - | feat(mando): implementar listado de eventos preventivos y drawer postgis en centro de incidentes (HU-76) |
| `CP-H76-WEB-09` | Visualización de ficha de punto crítico catalogado y mapa interactivo en modo lectura en `EventoPrevencionDrawer` (CA-4) | Funcional / GIS | Componente / Drawer | Alta | Drawer abierto con evento vinculado a `puntoCritico` (`PC-ANG-01`) | `mockEventoConPuntoCritico` con tipo de riesgo, prioridad, descripción y coordenadas WGS84 | Despliega código, nombre oficial, tipo de riesgo, nivel de prioridad, descripción, misión y componente `<LocationPickerMap readOnly={true} />` | Verificado en `EventoPrevencionDrawer.test.tsx` (test 2) | **APROBADO** | 25/11/2026 17:25 | - | feat(mando): implementar listado de eventos preventivos y drawer postgis en centro de incidentes (HU-76) |
| `CP-H76-WEB-10` | Regla fallback del Drawer para eventos registrados con coordenadas libres sin punto crítico formal (CA-4) | Funcional / Regla Negocio | Componente / Drawer | Alta | Evento preventivo con `puntoCritico: null` (creado sin incidente ni punto crítico) | `mockEventoSinPuntoCritico` con `sector: 'Sector Las Ánimas'` y `direccionTexto: 'Calle Sedeñor 450'` | Muestra alerta informativa `"Evento con coordenadas libres"`, sector referencial, dirección en terreno y mapa centrado en coordenadas del evento | Verificado en `EventoPrevencionDrawer.test.tsx` (test 3) | **APROBADO** | 25/11/2026 17:25 | - | feat(mando): implementar listado de eventos preventivos y drawer postgis en centro de incidentes (HU-76) |
| `CP-H76-WEB-11` | Cierre del Drawer lateral mediante botón `[✕]`, tecla `Escape` o clic en el backdrop (CA-4) | Usabilidad / A11y | Componente / Drawer | Media | `EventoPrevencionDrawer` abierto (`isOpen: true`) | Clic en botón `"Cerrar panel lateral"`, evento `keydown` (`Escape`) o clic en backdrop | Invoca `onClose()` y desmonta el panel lateral del DOM | Verificado en `EventoPrevencionDrawer.test.tsx` (tests 1, 4 y 5) | **APROBADO** | 25/11/2026 17:25 | - | feat(mando): implementar listado de eventos preventivos y drawer postgis en centro de incidentes (HU-76) |
| `CP-H76-WEB-12` | Consumo de `GET /api/eventos-atp/prevencion` mediante cliente tipado `apiClient.GET` con parámetros H34 (CA-5) | Integración / DAL | Servicio | Crítica | Servicio `listarEventosPrevencion` invocado con parámetros de filtrado y paginación | `{ page: 1, limit: 20, delegacionId: 'del-sur', estado: 'EN_CURSO', busqueda: 'Angachilla' }` + `Authorization: Bearer <token>` | Envía petición `GET /api/eventos-atp/prevencion` con query params H34 y retorna `{ message, data, meta }` normalizado | Verificado en `prevencionService.test.ts` (tests 8 y 9) | **APROBADO** | 25/11/2026 17:25 | - | feat(mando): implementar listado de eventos preventivos y drawer postgis en centro de incidentes (HU-76) |
| `CP-H76-WEB-13` | Manejo tipado de respuestas de error HTTP 400, 401 y 403 en `prevencionService.listarEventosPrevencion` (CA-5) | Seguridad / Resiliencia | Servicio | Alta | Respuestas HTTP 400, 401 y 403 simuladas desde `apiClient.GET` | Mock de respuestas `status: 400`, `401` y `403` | Lanza `PrevencionServiceError` con `statusCode` correspondiente y mensaje institucional legible sin exponer datos fallback | Verificado en `prevencionService.test.ts` (tests 10, 11 y 12) | **APROBADO** | 25/11/2026 17:25 | - | feat(mando): implementar listado de eventos preventivos y drawer postgis en centro de incidentes (HU-76) |
| `CP-H76-WEB-14` | Inicialización del estado `cargando` en `useEventosPrevencion` según el flag `autoLoad` | Funcional / Estado | Hook | Media | Invocación de `useEventosPrevencion({ autoLoad: true })` y `{ autoLoad: false }` | Renderizado del hook con `autoLoad` en ambos estados | `cargando` inicia en `true` si `autoLoad` es `true` y en `false` si `autoLoad` es `false` | Verificado en código fuente y en `useEventosPrevencion.test.ts` (test 1) | **APROBADO** | 25/11/2026 17:25 | - | fix(prevencion): inicializar estado de carga segun autoLoad en useEventosPrevencion |
| `CP-H76-WEB-15` | Navegación de paginación (cambio de página) en `useEventosPrevencion` bajo estándar H34 (CA-1, CA-5) | Funcional / Paginación | Hook | Alta | Hook `useEventosPrevencion` con múltiples páginas disponibles | Invocación `result.current.cambiarPagina(2)` | Actualiza `filtros.pagina` a `2` y consulta `GET /api/eventos-atp/prevencion?page=2&limit=20` | Verificado en `useEventosPrevencion.test.ts` (test 3) | **APROBADO** | 25/11/2026 17:25 | - | feat(mando): implementar listado de eventos preventivos y drawer postgis en centro de incidentes (HU-76) |
| `CP-H76-WEB-16` | Integración real cURL `GET /api/eventos-atp/prevencion` paginado y filtrado (HTTP 200 OK) contra `sgrai-api` + PostGIS (CA-5) | Integración E2E | API / BD PostGIS | Crítica | Backend `sgrai-api` en `localhost:3001` y PostgreSQL/PostGIS activos con datos sembrados H76 | `GET /api/eventos-atp/prevencion?page=1&limit=2` y consulta filtrada (`delegacionId`, `estado=EN_CURSO`, `busqueda=Angachilla`) con JWT Encargado | Respuesta HTTP 200 OK con contrato H34 (`message`, `data[]`, `meta{total,page,limit,totalPages,hasNext,hasPrev}`) y geometría GeoJSON EPSG:4326 | HTTP 200 OK verificado con 6 eventos totales (pág. 1 de 3) y 1 coincidencia filtrada (`PREV-2026-9001`), incluyendo `puntoCritico` PostGIS y `recursos` | **APROBADO** | 25/11/2026 17:25 | - | feat(mando): implementar listado de eventos preventivos y drawer postgis en centro de incidentes (HU-76) |
| `CP-H76-WEB-17` | Integración real cURL `GET /api/eventos-atp/prevencion` ante parámetros inválidos (HTTP 400 Bad Request) (CA-5) | Integración / Validación | API | Alta | Sesión válida de Encargado contra `sgrai-api` | `GET /api/eventos-atp/prevencion?delegacionId=invalido&estado=EN_EJECUCION` | Respuesta HTTP 400 Bad Request detallando errores de validación Zod para `delegacionId` y `estado` | HTTP 400 retornado con arreglo `errors` especificando UUID inválido y enum permitido (`PLANIFICADA`, `EN_CURSO`, `COMPLETADA`, `CANCELADA`) | **APROBADO** | 25/11/2026 17:25 | - | feat(mando): implementar listado de eventos preventivos y drawer postgis en centro de incidentes (HU-76) |
| `CP-H76-WEB-18` | Integración real cURL `GET /api/eventos-atp/prevencion` sin autenticación (HTTP 401) y con rol Call Center (HTTP 403) (CA-5) | Seguridad / RBAC | API | Crítica | Backend `sgrai-api` en ejecución con usuarios semilla | Petición sin `Authorization` (401) y petición con JWT de `callcenter@valdivia.cl` (403) | HTTP 401 Unauthorized sin token y HTTP 403 Forbidden para rol sin permiso `prevencion:eventos:leer` | HTTP 401 y HTTP 403 confirmados en ejecución real contra `sgrai-api` | **APROBADO** | 25/11/2026 17:25 | - | feat(mando): implementar listado de eventos preventivos y drawer postgis en centro de incidentes (HU-76) |
| `CP-H76-WEB-19` | Validación de suite global Vitest (regresión) y análisis estático ESLint / TypeScript | Calidad / Regresión | Estático / Unitario | Alta | Repositorio en rama `feature/H76-listar-eventos-prevencion` | Ejecución de `npm test`, `npm run lint` y `npx next typegen && npx tsc --noEmit` | 0 fallos en pruebas unitarias globales, 0 errores ESLint y 0 errores TypeScript | 887/887 tests aprobados (133 archivos), ESLint exit 0 y TypeScript exit 0 | **APROBADO** | 25/11/2026 17:25 | - | feat(mando): implementar listado de eventos preventivos y drawer postgis en centro de incidentes (HU-76) |
| `CP-H76-WEB-20` | Compilación de producción (`npm run build`) con tipografía institucional Noto Sans cargada localmente para CI/CD Docker | Despliegue / CI | Build | Alta | Repositorio en rama `feature/H76-listar-eventos-prevencion` con fuentes en `src/fonts/` | Ejecución de `npm run build` (`next build --webpack`) | Build de producción exitoso sin dependencia externa de Google Fonts en tiempo de compilación | Compilación exitosa (`exit code 0`), 47/47 páginas generadas y fuentes `NotoSans-Regular.woff2`/`NotoSans-Bold.woff2` empaquetadas | **APROBADO** | 25/11/2026 17:25 | - | fix(build): cargar Noto Sans localmente con next/font/local para evitar fallo en build Docker CI |

---

## 4. Matriz en Formato TSV

```tsv
ID Caso	Título del Caso de Prueba	Tipo de Prueba	Nivel	Prioridad	Precondición	Datos de Prueba (Payload / Headers / Query)	Resultado Esperado	Resultado Obtenido	Estado	Fecha / Hora Ejecución	Fecha / Hora Re-Test	Solución / Commit
BUG-H76-WEB-01	Bloqueo perimetral RBAC sin peticiones API, suscripción WebSocket ni mutación URL para perfiles sin permiso prevencion:eventos:leer	Seguridad / RBAC	Vista / Hook	Crítica	Sesión activa con rol Informante o Call Center (hasPermission('prevencion:eventos:leer') === false)	Montaje de EventosPrevencionView en /gestion/centro-incidentes?tab=prevencion	Mostrar AccesoDenegadoState sin invocar listarEventosPrevencion, sin unirse a sala:encargados ni mutar la URL	Se renderiza AccesoDenegadoState, pero autoLoad: true dispara igualmente fetch API, conexión Socket.io, getCatalogos() y replaceState (warning act(...) en Vitest)	ABIERTO	25/11/2026 17:25	(Pendiente)	Pendiente (Rechazado en Code Review)
BUG-H76-WEB-02	Debounce efectivo de 300 ms en buscador textual y protección contra respuestas fuera de orden (race condition) en useEventosPrevencion	Rendimiento / Concurrencia	Hook	Alta	Hook useEventosPrevencion montado con autoLoad: true	Escritura secuencial de "Angachilla" en cambiarBusqueda y alternancia rápida de filtros con latencias dispares	Emitir una única petición HTTP tras 300 ms de inactividad y descartar respuestas obsoletas vía AbortController o secuencia	Cada pulsación de tecla dispara inmediatamente (0 ms) una petición HTTP con busquedaDebounced anterior al depender del objeto filtros completo; sin cancelación de solicitudes obsoletas	ABIERTO	25/11/2026 17:25	(Pendiente)	Pendiente (Rechazado en Code Review)
BUG-H76-WEB-03	Sincronización automática del contrato OpenAPI en src/types/api-generated.d.ts respecto al esquema real de sgrai-api (CA-5)	Integración / Contrato OpenAPI	DAL / Tipos	Alta	Spec OpenAPI activo en sgrai-api (GET /openapi.json)	Comparación de paths['/api/eventos-atp/prevencion']['get'] en api-generated.d.ts vs respuesta HTTP 200/400 real	Tipos generados con openapi-typescript incluyendo recursos, creadoPorId, respuesta 500 y errors: Array<{ campo, mensaje }> en 400	Archivo editado manualmente; omite recursos, creadoPorId y 500, y tipa errors 400 como Record<string, string[]> en lugar de arreglo	ABIERTO	25/11/2026 17:25	(Pendiente)	Pendiente (Rechazado en Code Review)
BUG-H76-WEB-04	Integración limpia en /gestion/centro-incidentes, sincronización bidireccional de ?tab=/limit y sanitización de query params (CA-1, CA-3)	Funcional / Integración	Vista / Router	Alta	Usuario Encargado navegando en /gestion/centro-incidentes	Alternar pestaña prevencion -> kanban, recargar página (F5) y navegar con ?tab=prevencion&estado=EN_EJECUCION	Ocultar KanbanFiltros en pestaña prevención, limpiar ?tab=prevencion al volver a Kanban, persistir limit y sanitizar query params inválidos	KanbanFiltros y IncidentesKpiCards permanecen visibles; ?tab=prevencion queda pegado al volver a Kanban; onAbrirCrearPrevencion ignorado; query inválido dispara HTTP 400	ABIERTO	25/11/2026 17:25	(Pendiente)	Pendiente (Rechazado en Code Review)
BUG-H76-WEB-05	Visualización PostGIS propia de puntoCritico, botón "Reintentar" en error, botón "Limpiar filtros" en tabla vacía y eliminación de contador duplicado (CA-4)	Funcional / Resiliencia UX	Drawer / Vista / Tabla	Media	Evento con puntoCritico PostGIS asociado; escenario de fallo de red (HTTP 500) y búsqueda sin coincidencias	Apertura de EventoPrevencionDrawer, simulación de error en servicio y búsqueda "InexistenteXYZ"	Mostrar coordenadas/GeoJSON de puntoCritico, banner de error con botón "Reintentar" sin tabla vacía contradictoria, botón "Limpiar filtros" en tabla vacía y contador único en paginador	Drawer solo consume coordenadas del evento raíz; error no ofrece reintento y deja tabla vacía debajo; tabla vacía carece de "Limpiar filtros"; contador de registros aparece duplicado	ABIERTO	25/11/2026 17:25	(Pendiente)	Pendiente (Rechazado en Code Review)
BUG-H76-WEB-06	Cumplimiento de componentes institucionales (Heading/Button), accesibilidad WAI-ARIA de tabla y completitud del manual de usuario	UI / Accesibilidad / Docs	Componentes / Docs	Media	Revisión de componentes src/components/mando/prevencion/ y docs/manuals/H76-listar-eventos-prevencion.md	Inspección JSX/ARIA y verificación de docs/manuals/assets/H76-listar-eventos-prevencion/	Uso exclusivo de <Heading> y <Button>, fila accesible sin role="button" en <tr> y manual completo con capturas y sección de integración	Existen 4 <h3> y 5 <button> nativos, <tr role="button"> anida <Button>, faltan capturas y sección sgrai-api/sgrai-pwa en el manual	ABIERTO	25/11/2026 17:25	(Pendiente)	Pendiente (Rechazado en Code Review)
BUG-H76-WEB-07	Sincronización de rama feature/H76-listar-eventos-prevencion con origin/develop sin conflictos de fusión (Gitflow / CI)	Integración / Gitflow	Repositorio / CI	Alta	Rama feature/H76-listar-eventos-prevencion evaluada contra origin/develop	git rev-list --left-right --count HEAD...origin/develop y git merge-tree --write-tree HEAD origin/develop	Rama actualizada con develop (0 commits atrás) y fusión limpia sin conflictos en layout.tsx, KanbanBoard.tsx ni api-generated.d.ts	Rama 94 commits atrás de origin/develop con conflicto de contenido en src/app/layout.tsx y solapamiento en KanbanBoard.tsx y api-generated.d.ts	ABIERTO	25/11/2026 17:33	(Pendiente)	Pendiente (Rechazado en Code Review)
CP-H76-WEB-01	Conmutación hacia pestaña "Eventos Preventivos" desde KanbanViewSwitcher en /gestion/centro-incidentes (CA-1)	Funcional / UI	Componente	Alta	Vista /gestion/centro-incidentes montada con usuario Encargado	Clic en botón "Eventos Preventivos" (ícono ShieldAlert)	KanbanViewSwitcher invoca onCambiarVista('prevencion') con aria-pressed="true" y despliega EventosPrevencionView	Validado en KanbanViewSwitcher.test.tsx (4/4 tests) y KanbanBoard.tsx	APROBADO	25/11/2026 17:25	-	feat(mando): implementar listado de eventos preventivos y drawer postgis en centro de incidentes (HU-76)
CP-H76-WEB-02	Renderizado de todas las columnas obligatorias en EventosPrevencionTabla (CA-2)	Funcional / UI	Componente / Tabla	Crítica	Lista de eventos preventivos entregada a EventosPrevencionTabla	Arreglo mockEventos con evento en punto crítico (PREV-2026-0001) y evento en coordenadas libres (PREV-2026-0002)	Encabezados y celdas visibles: Código, Punto Crítico, Delegación, Estado, Unidad a Cargo, Fechas y Acciones	Las 7 columnas despliegan código/nombre, punto crítico o badge "Coordenadas libres", delegación, badge de estado, cuadrilla/patrulla, fechas formateadas es-CL y botón "Detalle"	APROBADO	25/11/2026 17:25	-	feat(mando): implementar listado de eventos preventivos y drawer postgis en centro de incidentes (HU-76)
CP-H76-WEB-03	Visualización de badges semánticos para los 4 estados operativos (PLANIFICADA, EN_CURSO, COMPLETADA, CANCELADA) (CA-2)	UI / Diseño	Componente / Badge	Alta	Eventos preventivos con cada uno de los 4 estados canónicos	ESTADOS_PREVENCION evaluado en EventosPrevencionTabla y EventoPrevencionDrawer	Etiquetas planas (border-radius: 0) con dot indicador: Planificada (ámbar), En Ejecución (teal), Completada (verde) y Cancelada (rojo)	Badges renderizados sin bordes redondeados en el contenedor y sin emojis, con mapeo consistente de colores institucionales	APROBADO	25/11/2026 17:25	-	feat(mando): implementar listado de eventos preventivos y drawer postgis en centro de incidentes (HU-76)
CP-H76-WEB-04	Identificación de unidad operativa a cargo (Cuadrilla, Patrulla o "Sin asignar") en tabla y drawer (CA-2)	Funcional / UI	Componente	Alta	Eventos con cuadrilla, con patrulla y sin unidad asignada (null)	Inspección de columna "Unidad a Cargo" en EventosPrevencionTabla y sección 3 en EventoPrevencionDrawer	Prioriza nombre y tipo "Cuadrilla", si es null despliega "Patrulla", y si ambos son null muestra "Sin asignar"	Verificado en EventosPrevencionTabla.test.tsx y EventoPrevencionDrawer.test.tsx	APROBADO	25/11/2026 17:25	-	feat(mando): implementar listado de eventos preventivos y drawer postgis en centro de incidentes (HU-76)
CP-H76-WEB-05	Filtrado por delegación municipal desde EventosPrevencionFiltros y recarga en useEventosPrevencion (CA-3)	Funcional / Filtros	Componente / Hook	Alta	Catálogo de delegaciones cargado en el selector	Selección de delegacionId = 'del-2' en <select aria-label="Filtrar por delegación municipal">	Invoca onDelegacionChange('del-2'), reinicia pagina: 1 y despacha consulta filtrada al endpoint	Verificado en EventosPrevencionFiltros.test.tsx y useEventosPrevencion.test.ts	APROBADO	25/11/2026 17:25	-	feat(mando): implementar listado de eventos preventivos y drawer postgis en centro de incidentes (HU-76)
CP-H76-WEB-06	Filtrado por estado operativo desde EventosPrevencionFiltros (CA-3)	Funcional / Filtros	Componente / Hook	Alta	Selector de estado operativo visible	Selección de opción "En Ejecución" (value="EN_CURSO")	Invoca onEstadoChange('EN_CURSO'), reinicia pagina: 1 y muestra chip "Estado: En Ejecución"	Verificado en EventosPrevencionFiltros.test.tsx (test 4) y useEventosPrevencion.test.ts (test 2)	APROBADO	25/11/2026 17:25	-	feat(mando): implementar listado de eventos preventivos y drawer postgis en centro de incidentes (HU-76)
CP-H76-WEB-07	Búsqueda textual por punto crítico, código o sector y limpieza de filtros activos (CA-3)	Funcional / Filtros	Componente	Alta	Barra EventosPrevencionFiltros renderizada con criterios activos	Entrada "angachilla" en buscador y clic en "Limpiar filtros"	Actualiza busqueda, muestra chips con contador de resultados y al pulsar "Limpiar filtros" restablece todos los criterios y vuelve a página 1	Verificado en EventosPrevencionFiltros.test.tsx (tests 2 y 5) y useEventosPrevencion.test.ts (test 4)	APROBADO	25/11/2026 17:25	-	feat(mando): implementar listado de eventos preventivos y drawer postgis en centro de incidentes (HU-76)
CP-H76-WEB-08	Apertura del Drawer lateral al hacer clic en una fila o en el botón "Detalle" (CA-4)	Funcional / UI	Componente / Vista	Crítica	Tabla con al menos un evento preventivo cargado	Clic en fila o botón "Detalle" de PREV-2026-0001	Despliega EventoPrevencionDrawer con role="dialog", aria-modal="true" y encabezado del evento seleccionado	Verificado en EventosPrevencionView.test.tsx y EventosPrevencionTabla.test.tsx	APROBADO	25/11/2026 17:25	-	feat(mando): implementar listado de eventos preventivos y drawer postgis en centro de incidentes (HU-76)
CP-H76-WEB-09	Visualización de ficha de punto crítico catalogado y mapa interactivo en modo lectura en EventoPrevencionDrawer (CA-4)	Funcional / GIS	Componente / Drawer	Alta	Drawer abierto con evento vinculado a puntoCritico (PC-ANG-01)	mockEventoConPuntoCritico con tipo de riesgo, prioridad, descripción y coordenadas WGS84	Despliega código, nombre oficial, tipo de riesgo, nivel de prioridad, descripción, misión y componente <LocationPickerMap readOnly={true} />	Verificado en EventoPrevencionDrawer.test.tsx (test 2)	APROBADO	25/11/2026 17:25	-	feat(mando): implementar listado de eventos preventivos y drawer postgis en centro de incidentes (HU-76)
CP-H76-WEB-10	Regla fallback del Drawer para eventos registrados con coordenadas libres sin punto crítico formal (CA-4)	Funcional / Regla Negocio	Componente / Drawer	Alta	Evento preventivo con puntoCritico: null (creado sin incidente ni punto crítico)	mockEventoSinPuntoCritico con sector: 'Sector Las Ánimas' y direccionTexto: 'Calle Sedeñor 450'	Muestra alerta informativa "Evento con coordenadas libres", sector referencial, dirección en terreno y mapa centrado en coordenadas del evento	Verificado en EventoPrevencionDrawer.test.tsx (test 3)	APROBADO	25/11/2026 17:25	-	feat(mando): implementar listado de eventos preventivos y drawer postgis en centro de incidentes (HU-76)
CP-H76-WEB-11	Cierre del Drawer lateral mediante botón [✕], tecla Escape o clic en el backdrop (CA-4)	Usabilidad / A11y	Componente / Drawer	Media	EventoPrevencionDrawer abierto (isOpen: true)	Clic en botón "Cerrar panel lateral", evento keydown (Escape) o clic en backdrop	Invoca onClose() y desmonta el panel lateral del DOM	Verificado en EventoPrevencionDrawer.test.tsx (tests 1, 4 y 5)	APROBADO	25/11/2026 17:25	-	feat(mando): implementar listado de eventos preventivos y drawer postgis en centro de incidentes (HU-76)
CP-H76-WEB-12	Consumo de GET /api/eventos-atp/prevencion mediante cliente tipado apiClient.GET con parámetros H34 (CA-5)	Integración / DAL	Servicio	Crítica	Servicio listarEventosPrevencion invocado con parámetros de filtrado y paginación	{ page: 1, limit: 20, delegacionId: 'del-sur', estado: 'EN_CURSO', busqueda: 'Angachilla' } + Authorization: Bearer <token>	Envía petición GET /api/eventos-atp/prevencion con query params H34 y retorna { message, data, meta } normalizado	Verificado en prevencionService.test.ts (tests 8 y 9)	APROBADO	25/11/2026 17:25	-	feat(mando): implementar listado de eventos preventivos y drawer postgis en centro de incidentes (HU-76)
CP-H76-WEB-13	Manejo tipado de respuestas de error HTTP 400, 401 y 403 en prevencionService.listarEventosPrevencion (CA-5)	Seguridad / Resiliencia	Servicio	Alta	Respuestas HTTP 400, 401 y 403 simuladas desde apiClient.GET	Mock de respuestas status: 400, 401 y 403	Lanza PrevencionServiceError con statusCode correspondiente y mensaje institucional legible sin exponer datos fallback	Verificado en prevencionService.test.ts (tests 10, 11 y 12)	APROBADO	25/11/2026 17:25	-	feat(mando): implementar listado de eventos preventivos y drawer postgis en centro de incidentes (HU-76)
CP-H76-WEB-14	Inicialización del estado cargando en useEventosPrevencion según el flag autoLoad	Funcional / Estado	Hook	Media	Invocación de useEventosPrevencion({ autoLoad: true }) y { autoLoad: false }	Renderizado del hook con autoLoad en ambos estados	cargando inicia en true si autoLoad es true y en false si autoLoad es false	Verificado en código fuente y en useEventosPrevencion.test.ts (test 1)	APROBADO	25/11/2026 17:25	-	fix(prevencion): inicializar estado de carga segun autoLoad en useEventosPrevencion
CP-H76-WEB-15	Navegación de paginación (cambio de página) en useEventosPrevencion bajo estándar H34 (CA-1, CA-5)	Funcional / Paginación	Hook	Alta	Hook useEventosPrevencion con múltiples páginas disponibles	Invocación result.current.cambiarPagina(2)	Actualiza filtros.pagina a 2 y consulta GET /api/eventos-atp/prevencion?page=2&limit=20	Verificado en useEventosPrevencion.test.ts (test 3)	APROBADO	25/11/2026 17:25	-	feat(mando): implementar listado de eventos preventivos y drawer postgis en centro de incidentes (HU-76)
CP-H76-WEB-16	Integración real cURL GET /api/eventos-atp/prevencion paginado y filtrado (HTTP 200 OK) contra sgrai-api + PostGIS (CA-5)	Integración E2E	API / BD PostGIS	Crítica	Backend sgrai-api en localhost:3001 y PostgreSQL/PostGIS activos con datos sembrados H76	GET /api/eventos-atp/prevencion?page=1&limit=2 y consulta filtrada (delegacionId, estado=EN_CURSO, busqueda=Angachilla) con JWT Encargado	Respuesta HTTP 200 OK con contrato H34 (message, data[], meta{total,page,limit,totalPages,hasNext,hasPrev}) y geometría GeoJSON EPSG:4326	HTTP 200 OK verificado con 6 eventos totales (pág. 1 de 3) y 1 coincidencia filtrada (PREV-2026-9001), incluyendo puntoCritico PostGIS y recursos	APROBADO	25/11/2026 17:25	-	feat(mando): implementar listado de eventos preventivos y drawer postgis en centro de incidentes (HU-76)
CP-H76-WEB-17	Integración real cURL GET /api/eventos-atp/prevencion ante parámetros inválidos (HTTP 400 Bad Request) (CA-5)	Integración / Validación	API	Alta	Sesión válida de Encargado contra sgrai-api	GET /api/eventos-atp/prevencion?delegacionId=invalido&estado=EN_EJECUCION	Respuesta HTTP 400 Bad Request detallando errores de validación Zod para delegacionId y estado	HTTP 400 retornado con arreglo errors especificando UUID inválido y enum permitido (PLANIFICADA, EN_CURSO, COMPLETADA, CANCELADA)	APROBADO	25/11/2026 17:25	-	feat(mando): implementar listado de eventos preventivos y drawer postgis en centro de incidentes (HU-76)
CP-H76-WEB-18	Integración real cURL GET /api/eventos-atp/prevencion sin autenticación (HTTP 401) y con rol Call Center (HTTP 403) (CA-5)	Seguridad / RBAC	API	Crítica	Backend sgrai-api en ejecución con usuarios semilla	Petición sin Authorization (401) y petición con JWT de callcenter@valdivia.cl (403)	HTTP 401 Unauthorized sin token y HTTP 403 Forbidden para rol sin permiso prevencion:eventos:leer	HTTP 401 y HTTP 403 confirmados en ejecución real contra sgrai-api	APROBADO	25/11/2026 17:25	-	feat(mando): implementar listado de eventos preventivos y drawer postgis en centro de incidentes (HU-76)
CP-H76-WEB-19	Validación de suite global Vitest (regresión) y análisis estático ESLint / TypeScript	Calidad / Regresión	Estático / Unitario	Alta	Repositorio en rama feature/H76-listar-eventos-prevencion	Ejecución de npm test, npm run lint y npx next typegen && npx tsc --noEmit	0 fallos en pruebas unitarias globales, 0 errores ESLint y 0 errores TypeScript	887/887 tests aprobados (133 archivos), ESLint exit 0 y TypeScript exit 0	APROBADO	25/11/2026 17:25	-	feat(mando): implementar listado de eventos preventivos y drawer postgis en centro de incidentes (HU-76)
CP-H76-WEB-20	Compilación de producción (npm run build) con tipografía institucional Noto Sans cargada localmente para CI/CD Docker	Despliegue / CI	Build	Alta	Repositorio en rama feature/H76-listar-eventos-prevencion con fuentes en src/fonts/	Ejecución de npm run build (next build --webpack)	Build de producción exitoso sin dependencia externa de Google Fonts en tiempo de compilación	Compilación exitosa (exit code 0), 47/47 páginas generadas y fuentes NotoSans-Regular.woff2/NotoSans-Bold.woff2 empaquetadas	APROBADO	25/11/2026 17:25	-	fix(build): cargar Noto Sans localmente con next/font/local para evitar fallo en build Docker CI
```

---

## 5. Guía de Ejecución y Replicabilidad Paso a Paso

### 5.1 Suite Automatizada del Módulo de Eventos Preventivos (Vitest)
**Comando:**
```bash
npm test -- src/services/__tests__/prevencionService.test.ts src/hooks/__tests__/useEventosPrevencion.test.ts src/components/mando/prevencion/__tests__/ src/components/mando/__tests__/KanbanViewSwitcher.test.tsx
```

**Resultado Obtenido:**
```text
 RUN  v3.2.7 /home/ds2fery/Documentos/Proyecto/sgrai-uach/web

 ✓ src/services/__tests__/prevencionService.test.ts (12 tests) 12ms
 ✓ src/hooks/__tests__/useEventosPrevencion.test.ts (5 tests) 296ms
 ✓ src/components/mando/prevencion/__tests__/EventosPrevencionFiltros.test.tsx (5 tests) 282ms
 ✓ src/components/mando/prevencion/__tests__/EventoPrevencionDrawer.test.tsx (5 tests) 305ms
 ✓ src/components/mando/prevencion/__tests__/EventosPrevencionTabla.test.tsx (4 tests) 302ms
 ✓ src/components/mando/__tests__/KanbanViewSwitcher.test.tsx (4 tests) 318ms
 ✓ src/components/mando/prevencion/__tests__/EventosPrevencionView.test.tsx (3 tests) 403ms

 Test Files  7 passed (7)
      Tests  38 passed (38)
   Duration  2.06s
```

*Evidencia de hallazgo (`BUG-H76-WEB-01`) capturada en `stderr` durante la ejecución:*
```text
stderr | src/components/mando/prevencion/__tests__/EventosPrevencionView.test.tsx > EventosPrevencionView (HU-76) > debe renderizar AccesoDenegadoState si el usuario no tiene permisos
An update to EventosPrevencionView inside a test was not wrapped in act(...).
```
*Motivo técnico:* Aunque el perfil simulado en esa prueba (`Informante`) no posee permisos, `EventosPrevencionView` ejecuta `useEventosPrevencion({ initialFiltros, autoLoad: true })` y `cargarDelegaciones()` de forma incondicional, disparando actualizaciones asíncronas sobre una vista que debía quedar bloqueada perimetralmente.

**Ejecución focalizada por caso (`-t`):**
```bash
npm test -- -t "listarEventosPrevencion"
npm test -- -t "useEventosPrevencion"
npm test -- -t "EventosPrevencionView"
npm test -- -t "EventoPrevencionDrawer"
```

---

### 5.2 Suite Global de Regresión (Vitest)
**Comando:**
```bash
npm test -- --run
```

**Resultado Obtenido:**
```text
 Test Files  133 passed (133)
      Tests  887 passed (887)
   Start at  17:20:22
   Duration  28.67s
```

---

### 5.3 Análisis Estático (`npm run lint`), Chequeo TypeScript (`tsc --noEmit`) y Build de Producción (`npm run build`)
**Comandos:**
```bash
npm run lint
rm -rf .next/types && npx next typegen && npx tsc --noEmit
npm run build
```

**Resultados Obtenidos:**
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
✓ Compiled successfully in 8.6s
✓ Finished TypeScript in 9.8s
✓ Generating static pages using 15 workers (47/47) in 1084ms
Exit code: 0
```

---

### 5.4 Pruebas de Integración Reales con cURL al Endpoint `GET /api/eventos-atp/prevencion`

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

#### Escenario C: Validación de Parámetros Inválidos (`400 Bad Request`) — Evidencia de `BUG-H76-WEB-03` y `BUG-H76-WEB-04`
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

### 5.5 Verificación de Integración Gitflow contra `origin/develop` (`BUG-H76-WEB-07`)
**Comandos:**
```bash
git rev-list --left-right --count HEAD...origin/develop
git merge-tree --write-tree HEAD origin/develop
```

**Resultado Obtenido:**
```text
3	94
Auto-fusionando src/app/layout.tsx
CONFLICTO (contenido): Conflicto de fusión en src/app/layout.tsx
Auto-fusionando src/components/mando/KanbanBoard.tsx
Auto-fusionando src/types/api-generated.d.ts
```

---

## 6. Matriz de Trazabilidad de Criterios de Aceptación (CA)

| ID CA | Descripción del Criterio de Aceptación (HU-76) | Casos de Prueba Asociados | Defectos Asociados | Estado de Cumplimiento |
|:---:|---|---|---|:---:|
| **CA-1** | El sistema debe proveer una vista tabular en `/gestion/centro-incidentes` bajo el estándar de contratos H34. | `CP-H76-WEB-01`, `CP-H76-WEB-14`, `CP-H76-WEB-15`, `CP-H76-WEB-19`, `CP-H76-WEB-20` | `BUG-H76-WEB-01`, `BUG-H76-WEB-04`, `BUG-H76-WEB-05`, `BUG-H76-WEB-06`, `BUG-H76-WEB-07` | 🟡 **Parcial (Con Defectos Abiertos)** |
| **CA-2** | La tabla debe listar: Código de prevención, Punto crítico asociado, Delegación, Estado (`PLANIFICADA`, `EN_EJECUCION`/`EN_CURSO`, `COMPLETADA`, `CANCELADA`), Cuadrilla/Patrulla a cargo y Fechas. | `CP-H76-WEB-02`, `CP-H76-WEB-03`, `CP-H76-WEB-04` | `BUG-H76-WEB-06` | 🟢 **Cumplido en UI (A11y `<tr>` pendiente)** |
| **CA-3** | Debe permitir filtros por delegación municipal, estado y buscador por punto crítico. | `CP-H76-WEB-05`, `CP-H76-WEB-06`, `CP-H76-WEB-07` | `BUG-H76-WEB-02`, `BUG-H76-WEB-04` | 🔴 **Incompleto (Debounce roto y doble barra de filtros)** |
| **CA-4** | Drawer lateral desplegable al hacer clic en una fila con información del punto crítico PostGIS. | `CP-H76-WEB-08`, `CP-H76-WEB-09`, `CP-H76-WEB-10`, `CP-H76-WEB-11` | `BUG-H76-WEB-05`, `BUG-H76-WEB-06` | 🟡 **Parcial (Coordenadas/GeoJSON de `puntoCritico` y `<Heading>` pendientes)** |
| **CA-5** | El endpoint `GET /api/eventos-atp/prevencion` debe responder bajo estándar H34. | `CP-H76-WEB-12`, `CP-H76-WEB-13`, `CP-H76-WEB-16`, `CP-H76-WEB-17`, `CP-H76-WEB-18` | `BUG-H76-WEB-03` | 🟡 **Backend OK / Divergencia OpenAPI en Web** |

