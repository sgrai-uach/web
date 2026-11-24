# Informe y Matriz de Casos de Prueba (QA): HU-73 — Listado Paginado y Filtrable de Operativos de Recuperación Post-Desastre

> **Documento Oficial de Aseguramiento de Calidad (QA) — Frontend Web**  
> **Proyecto:** Sistema de Gestión de Recursos para Atención de Incidentes (SGRAI) — Dirección de Gestión de Riesgos de Desastres, Municipalidad de Valdivia.  
> **Módulo:** Centro de Mando / Operaciones de Recuperación Post-Desastre (`sgrai-web` — `/gestion/centro-incidentes`).  
> **Historia de Usuario:** HU-73 — *"Como Encargado Quiero visualizar un listado paginado y filtrable de todos los operativos de recuperación post-desastre registrados en el sistema Para dar seguimiento al avance de los despliegues de entrega de ayuda y rehabilitación comunal desplegados en las delegaciones."*  
> **Desarrollador Asignado:** MayraCarrillo  
> **Equipo Auditor:** Aseguramiento de Calidad (QA) — Proyecto SGRAI  
> **Servicio Web Auditado:** `sgrai-web` (Next.js 16.3.4 App Router + React 19.2.8 + TypeScript 5 + Vitest v3.2.7 + Testing Library + CSS Modules / Vanilla CSS).  
> **Rama Git Evaluada:** `feature/H73-listar-operativos-recuperacion`  
> **Commits Evaluados:**  
> * `feat(recuperacion): listar y consultar operativos de recuperacion (HU-73)`  
> * `fix(types): preservar contratos de develop y agregar endpoints HU-73 en api-generated`  
>  
> **Fecha de Ejecución Inicial QA:** 24 de Noviembre de 2026 02:00.  
> **Fecha de Re-Test:** *(Pendiente de subsanación de observaciones)*  
> **Estado de Certificación:** **RECHAZADO EN CODE REVIEW (`CHANGES REQUESTED`) — 7 DEFECTOS ABIERTOS**.

---

## 1. Resumen Ejecutivo de Pruebas

| Métrica | Resultado | Observaciones Técnicas |
|---|:---:|---|
| **Total de Casos de Prueba Evaluados** | **22** | 7 Defectos Reales Abiertos (`BUG-H73-WEB-01` a `BUG-H73-WEB-07`) + 15 Casos Funcionales, UI, Contrato e Integración |
| **Casos Aprobados (`APROBADO`)** | **15** | Cumplimiento parcial de estructura tabular, badges, drawer de lectura, servicio tipado y compilación base |
| **Defectos Abiertos (`ABIERTO`)** | **7** | 2 Críticos (`BUG-H73-WEB-01`, `BUG-H73-WEB-02`), 2 Altos (`BUG-H73-WEB-03`, `BUG-H73-WEB-04`), 3 Medios (`BUG-H73-WEB-05`, `BUG-H73-WEB-06`, `BUG-H73-WEB-07`) |
| **Casos Bloqueados (`BLOQUEADO`)** | **0** | Entorno de compilación, pruebas unitarias y backend de validación operativos |
| **Tasa de Aprobación Global (% Pass)** | **68.2%** | No apto para merge a `develop` hasta subsanar defectos críticos, altos y medios en ciclo de Re-Test |
| **Análisis Estático de Código (`npm run lint`)** | **0 errores** | ESLint finaliza sin errores en la rama aislada, pero omite la regla `no-restricted-imports` sobre `next/font/google` incorporada en `develop` |
| **Chequeo de Tipos Estáticos (`npx tsc --noEmit`)** | **0 errores** | Compilación TypeScript limpia sobre los tipos presentes en la rama (ver observación de desfase respecto a `develop`) |
| **Empaquetado Productivo (`npm run build`)** | **47 rutas** | `next build --webpack` compila en local con acceso a red, pero conserva `next/font/google` incompatible con compilación Docker sin salida a Internet |
| **Suite Automatizada HU-73 (Vitest)** | **17/17 pass** | 3 archivos: `recuperacionService.test.ts` (10 tests: 6 HU-29 y 4 HU-73), `KanbanViewSwitcher.test.tsx` (4), `OperativosRecuperacionView.test.tsx` (3) |
| **Suite Global del Proyecto (Vitest)** | **867/867 pass** | 129 archivos ejecutados en `29.27s` sin fallos en la rama actual (sin integración de pruebas de HU-32, HU-37, HU-61 y HU-69 de `develop`) |
| **Pruebas de Integración HTTP (`sgrai-api`)** | **Verificadas** | Endpoints `GET /api/eventos-atp/recuperacion` y `GET /api/eventos-atp/recuperacion/{id}` validados en vivo (`200`, `400`, `401`, `403`, `404`), detectando falla de filtro de fecha |

---

## 2. Registro Técnico de Defectos Detectados

| ID Defecto | Descripción Técnica del Defecto | Severidad | Módulo / Archivo Afectado | Fecha Detección | Estado | Solución / Commit | Fecha Re-Test | Dictamen QA |
|---|---|:---:|---|:---:|:---:|---|:---:|:---:|
| `BUG-H73-WEB-01` | **Desincronización crítica con `develop`, pérdida de contratos de HU-32 y ruptura de compilación offline con `next/font/google`:** La rama `feature/H73-listar-operativos-recuperacion` parte de un punto previo a la integración de `PR #44` (HU-69), `PR #43` (HU-61), `PR #45` (HU-37) y `PR #46` (HU-32). Al comparar contra `develop`, `src/services/recuperacionService.ts` y `src/types/recuperacion.ts` eliminan `listarEventosRecuperacion`, `obtenerEventoRecuperacion`, `asignarRecursosRecuperacion` y conflictos de HU-32; `KanbanBoard.tsx`, `KanbanHeader.tsx` y `MapaOperativoMandoInner.tsx` pierden la integración de Eventos ATP, reclasificación, rechazo de misión y asignación a recuperación; `src/app/layout.tsx` y `eslint.config.mjs` regresionan de `next/font/local` a `next/font/google`; y `src/types/api-generated.d.ts` omite rutas de `develop` (`/api/health`, `/api/patrullas/{id}/estado`, `/api/eventos-atp/recuperacion/{id}/asignar`, `/api/incidentes/{id}/tipologia`, `/api/misiones/{id}/rechazar`, `/api/eventos-atp`), existiendo además divergencia entre el `GET /api/eventos-atp/recuperacion` esperado por `MapaOperativoMando` (HU-32) y el paginado H34 de HU-73. | Crítica | `src/services/recuperacionService.ts`, `src/types/recuperacion.ts`, `src/components/mando/KanbanBoard.tsx`, `src/components/mando/KanbanHeader.tsx`, `src/components/mando/MapaOperativoMandoInner.tsx`, `src/app/layout.tsx`, `eslint.config.mjs`, `src/types/api-generated.d.ts` | 24/11/2026 02:00 | `ABIERTO` | Pendiente (Rechazado en Code Review) | (Pendiente) | **RECHAZADO:** Requiere integrar `develop` preservando HU-32, HU-37, HU-61, HU-69, `next/font/local`, compatibilizar el contrato de listado con el mapa operativo y regenerar `api-generated.d.ts`. |
| `BUG-H73-WEB-02` | **Bloqueo perimetral indebido del rol `Supervisor Estratégico` en `/gestion/centro-incidentes` al intentar acceder a la pestaña Recuperación:** Aunque el permiso `recuperacion:leer` habilita a Administrador, Encargado y Supervisor Estratégico (`docs/manuals/H73-listar-operativos-recuperacion.md` y `OperativosRecuperacionView.tsx`), `navItems.ts` (línea 64) y `GestionModulosGrid.tsx` (línea 49) exigen exclusivamente `['incidentes:kanban', 'misiones:asignar']` para acceder a `/gestion/centro-incidentes`. Asimismo, aunque el Supervisor navegue directamente a `/gestion/centro-incidentes?vista=recuperacion`, `KanbanBoard.tsx` ejecuta incondicionalmente `useIncidentesKanban()` (5 llamadas a `GET /api/incidentes`) y `useIncidentesKpis({ userId })`; al recibir `403 Forbidden`, `esForbidden` activa `<AccesoDenegado />` para toda la página (líneas 245-247), ocultando `<KanbanViewSwitcher>` y `<OperativosRecuperacionView>`. Además, `OperativosRecuperacionView` no recibe `userId`, no valida `recuperacion:leer` previamente y `obtenerPermisosFallback` en `SimulatedSessionContext.tsx` omite `recuperacion:leer` en los perfiles habilitados. | Crítica | `src/components/mando/KanbanBoard.tsx`, `src/components/layout/navItems.ts`, `src/components/gestion/GestionModulosGrid.tsx`, `src/context/SimulatedSessionContext.tsx`, `src/components/mando/recuperacion/OperativosRecuperacionView.tsx` | 24/11/2026 02:00 | `ABIERTO` | Pendiente (Rechazado en Code Review) | (Pendiente) | **RECHAZADO:** Condicionar la ejecución de `useIncidentesKanban` y `useIncidentesKpis` y el bloqueo `esForbidden` únicamente a las vistas `kanban`/`mapa` (o a la tenencia de `incidentes:kanban`), habilitar acceso de Supervisor a la pestaña `Recuperación` y añadir `recuperacion:leer` en navegación y fallback de sesión. |
| `BUG-H73-WEB-03` | **Filtro temporal `fechaDesde` / `fechaHasta` envía fechas `YYYY-MM-DD` sin componente horario excluyendo registros del día consultado:** `OperativosRecuperacionFiltros.tsx` (líneas 126-154) captura `<input type="date">` (`"2026-11-24"`) y `recuperacionService.ts` (líneas 164-165) envía la cadena literal sin normalizar a ISO 8601 completo. En `sgrai-api`, `new Date("2026-11-24")` se interpreta como `2026-11-24T00:00:00.000Z`, provocando que filtrar `Desde = 2026-11-24` y `Hasta = 2026-11-24` retorne `data: []` (`meta.total: 0`) incluso cuando existen los operativos `REC-2026-0011` (`01:58:44Z`) y `REC-2026-0013` (`03:58:44Z`) registrados ese día. Tampoco se restringe `min`/`max` para evitar rangos invertidos (`fechaDesde > fechaHasta`). | Alta | `src/components/mando/recuperacion/OperativosRecuperacionFiltros.tsx` y `src/services/recuperacionService.ts` | 24/11/2026 02:00 | `ABIERTO` | Pendiente (Rechazado en Code Review) | (Pendiente) | **RECHAZADO:** Convertir `fechaDesde` al inicio del día local (`T00:00:00.000`) y `fechaHasta` al fin del día local (`T23:59:59.999`) en formato ISO 8601 UTC antes de enviar el query, y enlazar `max`/`min` entre ambos controles de fecha. |
| `BUG-H73-WEB-04` | **Incumplimiento parcial del estándar H34: ausencia de persistencia de pestaña, filtros y paginación en `URLSearchParams` y omisión de `ActiveFilterChips`:** `KanbanBoard.tsx` (líneas 51-54) lee `searchParams.get('vista')` al montar, pero al alternar pestañas en `KanbanViewSwitcher` no actualiza la barra de direcciones (`window.history.replaceState`), de modo que recargar (`F5`) en la pestaña Recuperación retorna al tablero Kanban. De igual forma, `useOperativosRecuperacion.ts` no inicializa ni sincroniza `page`, `limit`, `delegacionId`, `estado`, `prioridad`, `busqueda`, `fechaDesde`, `fechaHasta`, `ordenarPor` y `orden` con la URL (estándar aplicado en `CuadrillasAdminClient.tsx` y `AsistentesSocialesClient.tsx`). Adicionalmente, `OperativosRecuperacionFiltros.tsx` omite `<ActiveFilterChips />`. | Alta | `src/components/mando/KanbanBoard.tsx`, `src/hooks/useOperativosRecuperacion.ts` y `src/components/mando/recuperacion/OperativosRecuperacionFiltros.tsx` | 24/11/2026 02:00 | `ABIERTO` | Pendiente (Rechazado en Code Review) | (Pendiente) | **RECHAZADO:** Sincronizar `vista=recuperacion` y los criterios activos en `URLSearchParams` mediante `window.history.replaceState` e integrar `<ActiveFilterChips />` con nombres legibles en `OperativosRecuperacionFiltros.tsx`. |
| `BUG-H73-WEB-05` | **Expulsión de salas Socket.io al cambiar de pestaña, re-fetch duplicado en `OperativoRecuperacionDrawer` y doble consulta al buscar desde página > 1:** (1) `useOperativosRecuperacion.ts` (líneas 137-142) invoca `useRecuperacionSocket`, cuyo cleanup (`src/hooks/useRecuperacionSocket.ts`, líneas 77-80) emite `salir`/`leave` para `'sala:encargados'` y `'mapa'` sobre la instancia singleton de `getSocket()`, expulsando al `KanbanBoard` padre de las salas en tiempo real al volver de Recuperación a Kanban o Mapa. (2) `OperativosRecuperacionView.tsx` (línea 160) pasa `onCerrar={() => setOperativoSeleccionadoId(null)}` inline y `OperativoRecuperacionDrawer.tsx` (línea 82) incluye `onCerrar` y `toast` en las dependencias del `useEffect` de carga, re-ejecutando `GET /api/eventos-atp/recuperacion/{id}` en cada re-render del padre. (3) Al usar `debounceMs={0}` en `FilterSearchInput` y `setPage(1)` inmediato en `setFiltros`, teclear desde `page >= 2` dispara una petición inmediata sin filtro con `page=1` y una segunda petición tras los 350ms de `useDebounce`. | Media | `src/hooks/useOperativosRecuperacion.ts`, `src/hooks/useRecuperacionSocket.ts`, `src/components/mando/recuperacion/OperativosRecuperacionFiltros.tsx`, `src/components/mando/recuperacion/OperativoRecuperacionDrawer.tsx` y `src/components/mando/recuperacion/OperativosRecuperacionView.tsx` | 24/11/2026 02:00 | `ABIERTO` | Pendiente (Rechazado en Code Review) | (Pendiente) | **RECHAZADO:** Gestionar conteo de referencias o delegar el refresco de socket sin abandonar salas compartidas, estabilizar `onCerrar` vía `useCallback` / `useRef` en el drawer y mover el debounce antes de invocar `setFiltros` con `setPage(1)`. |
| `BUG-H73-WEB-06` | **Renderizado simultáneo de error HTTP con `EmptyState` falso sin reintento, prop muerta `refreshSignal`, fallback de delegaciones sin UUID y omisión de `"Limpiar filtros"` en estado vacío:** (1) Ante error `500` o `400`, `useOperativosRecuperacion` limpia `operativos = []` (línea 113) y `OperativosRecuperacionView.tsx` (líneas 106-133) muestra simultáneamente `<InlineNotice variant="error">` y `<EmptyState title="No se encontraron operativos de recuperación" ...>` sin botón `"Reintentar"`. (2) Cuando no hay resultados con filtros activos, `<EmptyState>` solo ofrece `"Registrar Operativo de Recuperación"` y omite `"Limpiar filtros"`. (3) `refreshSignal` en `OperativosRecuperacionViewProps` (línea 21) nunca se consume ni se envía desde `KanbanBoard.tsx` al crear un operativo. (4) `DELEGACIONES_VALDIVIA_DEFAULT` (`src/types/incidentesKpis.ts`, líneas 35-40) contiene IDs `'del-norte'` no UUID que generan `400 Bad Request` en `GET /api/eventos-atp/recuperacion?delegacionId=del-norte` si `/api/catalogos` falla. (5) En `OperativosRecuperacionTabla.tsx` falta singularización (`1 unidad`) y soporte de teclado (`tabIndex`/`onKeyDown`) en `<tr>`. | Media | `src/components/mando/recuperacion/OperativosRecuperacionView.tsx`, `src/components/mando/KanbanBoard.tsx`, `src/components/mando/recuperacion/OperativosRecuperacionTabla.tsx` y `src/types/incidentesKpis.ts` | 24/11/2026 02:00 | `ABIERTO` | Pendiente (Rechazado en Code Review) | (Pendiente) | **RECHAZADO:** Separar el estado de error (con acción `"Reintentar"`) del estado vacío, ofrecer `"Limpiar filtros"` ante filtros activos, conectar `refreshSignal`, usar UUIDs canónicos en el fallback territorial y singularizar unidades en tabla. |
| `BUG-H73-WEB-07` | **Manual de usuario con capturas pendientes y tabla divergente, código muerto, estilos inline fuera del estándar visual institucional y baja cobertura unitaria:** (1) `docs/manuals/H73-listar-operativos-recuperacion.md` (líneas 33, 42, 51) contiene 3 marcas `*(Captura pendiente: ...)*` y `docs/manuals/assets/H73-listar-operativos-recuperacion/` contiene solo `.gitkeep`; además la línea 49 describe una tabla con *"nombre, tipo, cantidad y unidad"*, mientras `OperativoRecuperacionDrawer.tsx` (líneas 246-261) solo renderiza `Recurso` y `Cantidad asignada`, dejando `ETIQUETA_TIPO_RECURSO` y `formatearTipoRecurso` (`recuperacionLabels.ts`) y `RecursoResumenTipo` (`recuperacion.ts`) como código muerto. (2) Se emplean atributos `style={{ ... }}` inline en `KanbanViewSwitcher.tsx` (líneas 23-107), `OperativosRecuperacionView.tsx` (líneas 79, 92, 128), `OperativosRecuperacionFiltros.tsx` (línea 59), `OperativosRecuperacionTabla.tsx` (línea 147) y `OperativoRecuperacionDrawer.tsx` (línea 121) en lugar de prop `icon` de `<Button>` y CSS Modules. (3) Solo existen 3 pruebas en `OperativosRecuperacionView.test.tsx`; faltan suites dedicadas para `useOperativosRecuperacion`, `OperativosRecuperacionFiltros`, `OperativosRecuperacionTabla` y `OperativoRecuperacionDrawer`. | Media | `docs/manuals/H73-listar-operativos-recuperacion.md`, `docs/manuals/assets/H73-listar-operativos-recuperacion/.gitkeep`, `src/components/mando/recuperacion/OperativoRecuperacionDrawer.tsx`, `src/components/mando/recuperacion/recuperacionLabels.ts`, `src/types/recuperacion.ts`, `src/components/mando/KanbanViewSwitcher.tsx`, `src/components/mando/recuperacion/OperativosRecuperacionView.tsx`, `src/components/mando/recuperacion/__tests__/OperativosRecuperacionView.test.tsx` | 24/11/2026 02:00 | `ABIERTO` | Pendiente (Rechazado en Code Review) | (Pendiente) | **RECHAZADO:** Adjuntar capturas reales en `docs/manuals/assets/H73-listar-operativos-recuperacion/`, alinear tabla de recursos con el manual o remover código muerto, migrar estilos inline a CSS Modules / prop `icon` y ampliar cobertura Vitest de filtros, tabla, drawer y hook. |

---

## 3. Matriz Consolidada de Casos de Prueba (13 Columnas)

| ID Caso | Título del Caso de Prueba | Tipo de Prueba | Nivel | Prioridad | Precondición | Datos de Prueba (Payload / Headers / Query) | Resultado Esperado | Resultado Obtenido | Estado | Fecha / Hora Ejecución | Fecha / Hora Re-Test | Solución / Commit |
|---|---|---|---|---|---|---|---|---|:---:|:---:|:---:|---|
| `BUG-H73-WEB-01` | Sincronización con rama `develop`, preservación de contratos HU-32 y compilación offline con `next/font/local` | Regresión / Integración | Repositorio / Contratos | Crítica | Rama `feature/H73-listar-operativos-recuperacion` comparada contra `develop` tras PRs #43, #44, #45 y #46 | `git merge-base develop HEAD`, revisión de `recuperacionService.ts`, `KanbanBoard.tsx`, `layout.tsx`, `eslint.config.mjs` y `api-generated.d.ts` | Rama sincronizada conservando `listarEventosRecuperacion`, `asignarRecursosRecuperacion`, `next/font/local`, regla ESLint de fuentes y rutas OpenAPI vigentes | Rama desfasada de `develop`; elimina funciones/tipos de HU-32, omite integraciones de HU-61/HU-69/HU-37, usa `next/font/google` y desincroniza `api-generated.d.ts` | **ABIERTO** | 24/11/2026 02:00 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| `BUG-H73-WEB-02` | Acceso RBAC del rol Supervisor Estratégico (`recuperacion:leer`) a `/gestion/centro-incidentes?vista=recuperacion` | Seguridad / RBAC | Vista / Navegación | Crítica | Sesión activa de Supervisor Estratégico con permiso `recuperacion:leer` y sin `incidentes:kanban` | Navegación directa a `/gestion/centro-incidentes?vista=recuperacion` y evaluación de `navItems.ts`, `GestionModulosGrid.tsx` y `KanbanBoard.tsx` | Despliegue de `<OperativosRecuperacionView />` sin ejecutar consultas Kanban prohibidas ni bloquear la página completa con `<AccesoDenegado />` | `useIncidentesKanban()` dispara `GET /api/incidentes`, recibe `403` y `KanbanBoard` oculta toda la vista con `<AccesoDenegado />`; menús exigen `incidentes:kanban` | **ABIERTO** | 24/11/2026 02:00 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| `BUG-H73-WEB-03` | Filtrado por rango temporal (`fechaDesde` y `fechaHasta`) en formato ISO 8601 y validación de rango | Funcional / Filtros | Servicio / UI | Alta | Operativos `REC-2026-0011` y `REC-2026-0013` registrados el `2026-11-24` en base de datos | Selección `Desde: 2026-11-24`, `Hasta: 2026-11-24` en `OperativosRecuperacionFiltros`; `GET /api/eventos-atp/recuperacion?fechaDesde=2026-11-24&fechaHasta=2026-11-24` | Conversión a límites ISO 8601 del día (`T00:00:00.000` a `T23:59:59.999` local) retornando los 2 operativos del día y restricción `min`/`max` | `recuperacionService` envía cadena `YYYY-MM-DD` sin hora; la API evalúa `00:00:00Z` y responde `data: []` (`meta.total: 0`); sin validación de rango invertido | **ABIERTO** | 24/11/2026 02:00 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| `BUG-H73-WEB-04` | Persistencia bidireccional de vista, filtros y paginación en `URLSearchParams` y chips activos H34 (CA-1, CA-3) | Contrato H34 / UX | Hook / Filtros | Alta | Encargado en `/gestion/centro-incidentes` selecciona pestaña Recuperación, aplica filtros y cambia a página 2 | Cambio de pestaña a `recuperacion`, filtro `estado=EN_EJECUCION`, `page=2` y recarga del navegador (`F5`) | Actualización de URL (`?vista=recuperacion&estado=EN_EJECUCION&page=2`) vía `replaceState` y renderizado de `<ActiveFilterChips />` | Ni la pestaña `vista` ni los filtros/página de `useOperativosRecuperacion` se persisten en `URLSearchParams`; `OperativosRecuperacionFiltros` omite `ActiveFilterChips` | **ABIERTO** | 24/11/2026 02:00 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| `BUG-H73-WEB-05` | Estabilidad de salas Socket.io entre pestañas, efecto de carga en Drawer y prevención de doble petición en búsqueda | Tiempo Real / Rendimiento | Hook / Drawer | Media | `KanbanBoard` montado con WebSocket conectado; drawer abierto o búsqueda desde `page=2` | Alternancia `recuperacion -> kanban`, re-render del padre con drawer abierto y escritura en buscador desde página 2 | Preservación de salas `'sala:encargados'` y `'mapa'`, sin re-fetch en drawer por re-renders externos y una sola consulta debounced al buscar | Cleanup de `useRecuperacionSocket` expulsa al socket singleton de las salas compartidas; `onCerrar` inline re-dispara fetch en drawer; `setPage(1)` previo al debounce genera 2 peticiones | **ABIERTO** | 24/11/2026 02:00 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| `BUG-H73-WEB-06` | Manejo de estado de error con reintento, botón Limpiar filtros en estado vacío, prop `refreshSignal` y fallback territorial | Resiliencia / UX | Vista / Tabla | Media | Error HTTP `500`/`400` en listado, búsqueda sin coincidencias o fallback territorial sin `/api/catalogos` | Rechazo HTTP 500 en `listarOperativosRecuperacion`, búsqueda sin resultados, o selección de `delegacionId='del-norte'` | Mostrar banner de error con botón Reintentar sin `EmptyState` falso; botón Limpiar filtros en vacío; consumo de `refreshSignal` y UUIDs válidos en fallback | Se renderizan simultáneamente `InlineNotice` y `EmptyState` sin Reintentar; falta Limpiar filtros en vacío; `refreshSignal` sin uso; `del-norte` provoca `400 Bad Request` | **ABIERTO** | 24/11/2026 02:00 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| `BUG-H73-WEB-07` | Completitud de manual de usuario (`docs/manuals/`), limpieza de código muerto, CSS Modules y cobertura unitaria | Documentación / Calidad | Manual / Tests | Media | Revisión de entregables de HU-73 en `docs/manuals/`, estilos y suites Vitest | Inspección de `H73-listar-operativos-recuperacion.md`, `assets/`, `recuperacionLabels.ts`, `KanbanViewSwitcher.tsx` y `__tests__/` | Capturas reales en `assets/`, coherencia entre manual y columnas del drawer, eliminación de código muerto/estilos inline y tests de tabla, filtros, drawer y hook | Manual tiene 3 capturas pendientes y describe columnas `tipo`/`unidad` ausentes en el drawer; exports sin uso; estilos inline en botones; solo 3 tests en vista | **ABIERTO** | 24/11/2026 02:00 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| `CP-H73-WEB-01` | Despliegue del selector de pestaña "Recuperación" en `KanbanViewSwitcher` y lectura inicial de `?vista=recuperacion` (CA-1) | Funcional / UI | Componente | Alta | Usuario autenticado en `/gestion/centro-incidentes` | Renderizado de `KanbanViewSwitcher` con `vistaActiva="kanban"` y clic en botón `Recuperación`; URL `?vista=recuperacion` | Renderiza botón `Recuperación` con `aria-pressed` reactivo e invoca `onCambiarVista('recuperacion')`; `KanbanBoard` lee `?vista=recuperacion` al iniciar | Verificado en `KanbanViewSwitcher.test.tsx` (4/4 tests pass) e inspección de `KanbanBoard.tsx` | **APROBADO** | 24/11/2026 02:00 | - | feat(recuperacion): listar y consultar operativos de recuperacion (HU-73) |
| `CP-H73-WEB-02` | Aislamiento visual de la subvista Recuperación ocultando KPIs y filtros propios del tablero Kanban (CA-1) | Funcional / UI | Vista | Media | Usuario en `/gestion/centro-incidentes` cambia a pestaña `Recuperación` | `vistaActiva === 'recuperacion'` en `KanbanBoard.tsx` | Oculta `IncidentesKpiCards` y `KanbanFiltros` para ceder espacio a la barra de herramientas y filtros de `OperativosRecuperacionView` | Verificado en `KanbanBoard.tsx` (línea 249) y `OperativosRecuperacionView.tsx` | **APROBADO** | 24/11/2026 02:00 | - | feat(recuperacion): listar y consultar operativos de recuperacion (HU-73) |
| `CP-H73-WEB-03` | Despliegue de columnas obligatorias en `OperativosRecuperacionTabla` (CA-2) | Funcional / UI | Componente / Tabla | Crítica | Listado con operativos cargado en `OperativosRecuperacionView` | Registro `REC-2026-0001`, `"Entrega de Materiales y Remoción"`, `"Delegación de la Costa"`, `EN_EJECUCION`, `130` insumos, `2026-11-14T15:00:00.000Z` | Muestra Código, Título/Sector, Delegación, Estado, Prioridad, Insumos Asignados, Fecha de Registro en formato `dd/MM/yyyy HH:mm` y Acciones | Verificado en `OperativosRecuperacionView.test.tsx` y `OperativosRecuperacionTabla.tsx` | **APROBADO** | 24/11/2026 02:00 | - | feat(recuperacion): listar y consultar operativos de recuperacion (HU-73) |
| `CP-H73-WEB-04` | Renderizado de badges semánticos de estado y prioridad en paleta municipal sin emojis (CA-2) | UI / Diseño | Componente / CSS | Alta | Registros con estados `PLANIFICADA`, `EN_EJECUCION`, `COMPLETADA`, `CANCELADA` | Clases CSS `estadoPLANIFICADA`, `estadoEN_EJECUCION`, `estadoCOMPLETADA`, `estadoCANCELADA` y prioridades `CRITICA`/`ALTA`/`MEDIA`/`BAJA` | Badges rectangulares (`--radius-none: 0px`) con colores semánticos teal, warning, success y danger, etiquetas legibles e íconos `lucide-react` sin emojis | Verificado en `OperativosRecuperacion.module.css` y `recuperacionLabels.ts` | **APROBADO** | 24/11/2026 02:00 | - | feat(recuperacion): listar y consultar operativos de recuperacion (HU-73) |
| `CP-H73-WEB-05` | Visualización cuantitativa y desglose resumido de insumos asignados en celda de tabla (CA-2) | Funcional / UI | Componente / Tabla | Alta | Operativo con `cantidadInsumosAsignados: 130` y `recursosResumen` de 2 ítems | `recursosResumen: [{ nombre: 'Planchas de Zinc', cantidadAsignada: 120 }, { nombre: 'Frazadas', cantidadAsignada: 10 }]` | Muestra `"130 unidades"` en negrita y resumen `"120 Planchas de Zinc, 10 Frazadas"` con atributo `title` completo | Verificado en `OperativosRecuperacionTabla.tsx` y `OperativosRecuperacionView.test.tsx` | **APROBADO** | 24/11/2026 02:00 | - | feat(recuperacion): listar y consultar operativos de recuperacion (HU-73) |
| `CP-H73-WEB-06` | Controles de paginación estándar H34 (`Pagination`) con cambio de página y tamaño (`10`, `25`, `50`) (CA-1) | Funcional / Paginación | Componente / Hook | Alta | Respuesta con `meta: { page: 1, limit: 10, total: 25, totalPages: 3, hasNext: true, hasPrev: false }` | Clic en `Siguiente` (`setPage(2)`) y selección de límite `25` (`setLimit(25)`) | Muestra rango `"Mostrando 1 a 10 de 25 operativos"`, cambia de página y al modificar límite reinicia `page` a `1` | Verificado en `OperativosRecuperacionView.tsx`, `Pagination.tsx` y `useOperativosRecuperacion.ts` | **APROBADO** | 24/11/2026 02:00 | - | feat(recuperacion): listar y consultar operativos de recuperacion (HU-73) |
| `CP-H73-WEB-07` | Ordenamiento interactivo por Código y Fecha de Registro en cabeceras de tabla (CA-1) | Funcional / UI | Componente / Hook | Media | Tabla renderizada con `ordenarPor='creadoEn'`, `orden='desc'` | Clic en botón de cabecera `Código` (`onToggleOrden('codigo')`) y clic posterior | Cambia criterio a `codigo` ascendente (`ArrowUp`), luego alterna a descendente (`ArrowDown`) y reinicia `page` a `1` | Verificado en `OperativosRecuperacionTabla.tsx` y `useOperativosRecuperacion.ts` | **APROBADO** | 24/11/2026 02:00 | - | feat(recuperacion): listar y consultar operativos de recuperacion (HU-73) |
| `CP-H73-WEB-08` | Filtrado por delegación municipal, estado, prioridad, búsqueda textual y botón `"Limpiar filtros"` (CA-3) | Funcional / Filtros | Componente / Hook | Alta | Barra `OperativosRecuperacionFiltros` montada con catálogo de delegaciones | `delegacionId='del-1'`, `estado='EN_EJECUCION'`, `prioridad='ALTA'`, `busqueda='REC-2026'` y clic en `"Limpiar filtros"` | Actualiza estado de filtros, muestra contador de filtros activos en `FilterBar` y botón `"Limpiar filtros"` que restablece `FILTROS_RECUPERACION_INICIALES` | Verificado en `OperativosRecuperacionFiltros.tsx` y `useOperativosRecuperacion.ts` | **APROBADO** | 24/11/2026 02:00 | - | feat(recuperacion): listar y consultar operativos de recuperacion (HU-73) |
| `CP-H73-WEB-09` | Apertura de `OperativoRecuperacionDrawer` al hacer clic en fila o botón `Detalle` sin doble disparo (CA-4) | Funcional / UI | Componente / Drawer | Crítica | Tabla con fila `op-1` (`REC-2026-0001`) visible | Clic sobre texto `REC-2026-0001` en `<tr>` y clic en `<Button aria-label="Ver detalle de REC-2026-0001">` | Invoca `onSelectOperativo('op-1')`, consulta `obtenerDetalleOperativoRecuperacion('op-1')` y `<td>` de acciones detiene propagación con `e.stopPropagation()` | Verificado en `OperativosRecuperacionView.test.tsx` y `OperativosRecuperacionTabla.tsx` | **APROBADO** | 24/11/2026 02:00 | - | feat(recuperacion): listar y consultar operativos de recuperacion (HU-73) |
| `CP-H73-WEB-10` | Visualización en Drawer de detalles generales, delegación/misión/patrulla, tabla de recursos e historial cronológico (CA-4) | Funcional / UI | Componente / Drawer | Crítica | `OperativoRecuperacionDrawer` abierto para `op-1` con `200 OK` | `detalle` con `mision: MIS-2026-0010`, `patrulla: Patrulla Costa`, `recursos: [{ nombre: 'Planchas de Zinc', cantidadAsignada: 120 }]` e `historial` | Despliega código y título en cabecera, 4 secciones institucionales, listado de insumos y línea de tiempo con autor y fecha | Verificado en `OperativosRecuperacionView.test.tsx` y `OperativoRecuperacionDrawer.tsx` | **APROBADO** | 24/11/2026 02:00 | - | feat(recuperacion): listar y consultar operativos de recuperacion (HU-73) |
| `CP-H73-WEB-11` | Cierre del drawer por tecla `Escape`, backdrop o botón `X` y manejo automático de `404 Not Found` (CA-4) | Usabilidad / Resiliencia | Componente / Drawer | Media | `OperativoRecuperacionDrawer` abierto con `operativoId !== null` | Pulsación de tecla `Escape`, clic en backdrop o respuesta `404` en `obtenerDetalleOperativoRecuperacion` | Cierra panel mediante `onCerrar()`, y ante `404` emite notificación de error vía `useOptionalToast` y cierra el drawer | Verificado en `OperativoRecuperacionDrawer.tsx` (líneas 62-68, 84-93, 103, 119) | **APROBADO** | 24/11/2026 02:00 | - | feat(recuperacion): listar y consultar operativos de recuperacion (HU-73) |
| `CP-H73-WEB-12` | Despliegue de `<AccesoDenegadoState />` en `OperativosRecuperacionView` cuando la API rechaza con `403 Forbidden` | Seguridad / RBAC | Vista / Servicio | Crítica | Usuario sin permiso `recuperacion:leer` consultando el módulo | `listarOperativosRecuperacion` rechaza con `RecuperacionServiceError(..., { statusCode: 403 })` | `recuperacionService` lanza `statusCode: 403` sin fallback y `OperativosRecuperacionView` renderiza `<AccesoDenegadoState />` mencionando `recuperacion:leer` | Verificado en `recuperacionService.test.ts` y `OperativosRecuperacionView.test.tsx` | **APROBADO** | 24/11/2026 02:00 | - | feat(recuperacion): listar y consultar operativos de recuperacion (HU-73) |
| `CP-H73-WEB-13` | Envío limpio de parámetros H34 y manejo de respuestas `200`, `401`, `403`, `404` en `recuperacionService` (CA-5) | Integración / DAL | Servicio | Crítica | Cliente `apiClient.GET` tipado con `paths['/api/eventos-atp/recuperacion']` | `listarOperativosRecuperacion({ page: 1, limit: 10, estado: 'EN_EJECUCION', busqueda: '  REC-2026  ' })` | Limpia espacios con `trim()`, omite vacíos, retorna `{ data, meta }` H34 y propaga códigos `401`/`403`/`404` mediante `RecuperacionServiceError` | Verificado en `recuperacionService.test.ts` (4/4 tests HU-73 pass) | **APROBADO** | 24/11/2026 02:00 | - | feat(recuperacion): listar y consultar operativos de recuperacion (HU-73) |
| `CP-H73-WEB-14` | Validación en vivo de endpoints `GET /api/eventos-atp/recuperacion` y `/{id}` contra `sgrai-api` (CA-5) | Integración API | cURL / Backend | Crítica | Servidor `sgrai-api` activo en `http://localhost:3001` con fixture H73 sembrado | Peticiones cURL con `x-user-id` Encargado, Call Center y anónimo a listado y detalle (`73100000-...-0001`, UUID inexistente, ID inválido) | `401` sin auth, `200` Encargado con 6 registros y `meta` H34, `403` Call Center (`recuperacion:leer`), `200` detalle, `404` inexistente, `400` no UUID | Todas las respuestas HTTP/JSON reales verificadas coinciden con el contrato OpenAPI H34/H73 | **APROBADO** | 24/11/2026 02:00 | - | fix(types): preservar contratos de develop y agregar endpoints HU-73 en api-generated |
| `CP-H73-WEB-15` | Verificación estática (`tsc --noEmit`, `eslint`, `next build`) y ejecución global de Vitest en la rama | Calidad / CI | Sistema | Alta | Rama `feature/H73-listar-operativos-recuperacion` con dependencias instaladas | `npx tsc --noEmit`, `npm run lint`, `npm run build` y `npm test` | Código de salida `0` en chequeo de tipos, linter, build y 100% de pruebas unitarias de la rama | `tsc` (0 errores), `lint` (0 errores), `build` (47 rutas) y `vitest` (`129/129` archivos, `867/867` tests pass) | **APROBADO** | 24/11/2026 02:00 | - | feat(recuperacion): listar y consultar operativos de recuperacion (HU-73) |

---

## 4. Bloque TSV para Google Sheets

```tsv
ID Caso	Título del Caso de Prueba	Tipo de Prueba	Nivel	Prioridad	Precondición	Datos de Prueba (Payload / Headers / Query)	Resultado Esperado	Resultado Obtenido	Estado	Fecha / Hora Ejecución	Fecha / Hora Re-Test	Solución / Commit
BUG-H73-WEB-01	Sincronización con rama develop, preservación de contratos HU-32 y compilación offline con next/font/local	Regresión / Integración	Repositorio / Contratos	Crítica	Rama feature/H73-listar-operativos-recuperacion comparada contra develop tras PRs #43, #44, #45 y #46	git merge-base develop HEAD, revisión de recuperacionService.ts, KanbanBoard.tsx, layout.tsx, eslint.config.mjs y api-generated.d.ts	Rama sincronizada conservando listarEventosRecuperacion, asignarRecursosRecuperacion, next/font/local, regla ESLint de fuentes y rutas OpenAPI vigentes	Rama desfasada de develop; elimina funciones/tipos de HU-32, omite integraciones de HU-61/HU-69/HU-37, usa next/font/google y desincroniza api-generated.d.ts	ABIERTO	24/11/2026 02:00	(Pendiente)	Pendiente (Rechazado en Code Review)
BUG-H73-WEB-02	Acceso RBAC del rol Supervisor Estratégico (recuperacion:leer) a /gestion/centro-incidentes?vista=recuperacion	Seguridad / RBAC	Vista / Navegación	Crítica	Sesión activa de Supervisor Estratégico con permiso recuperacion:leer y sin incidentes:kanban	Navegación directa a /gestion/centro-incidentes?vista=recuperacion y evaluación de navItems.ts, GestionModulosGrid.tsx y KanbanBoard.tsx	Despliegue de OperativosRecuperacionView sin ejecutar consultas Kanban prohibidas ni bloquear la página completa con AccesoDenegado	useIncidentesKanban() dispara GET /api/incidentes, recibe 403 y KanbanBoard oculta toda la vista con AccesoDenegado; menús exigen incidentes:kanban	ABIERTO	24/11/2026 02:00	(Pendiente)	Pendiente (Rechazado en Code Review)
BUG-H73-WEB-03	Filtrado por rango temporal (fechaDesde y fechaHasta) en formato ISO 8601 y validación de rango	Funcional / Filtros	Servicio / UI	Alta	Operativos REC-2026-0011 y REC-2026-0013 registrados el 2026-11-24 en base de datos	Selección Desde: 2026-11-24, Hasta: 2026-11-24 en OperativosRecuperacionFiltros; GET /api/eventos-atp/recuperacion?fechaDesde=2026-11-24&fechaHasta=2026-11-24	Conversión a límites ISO 8601 del día (T00:00:00.000 a T23:59:59.999 local) retornando los 2 operativos del día y restricción min/max	recuperacionService envía cadena YYYY-MM-DD sin hora; la API evalúa 00:00:00Z y responde data: [] (meta.total: 0); sin validación de rango invertido	ABIERTO	24/11/2026 02:00	(Pendiente)	Pendiente (Rechazado en Code Review)
BUG-H73-WEB-04	Persistencia bidireccional de vista, filtros y paginación en URLSearchParams y chips activos H34 (CA-1, CA-3)	Contrato H34 / UX	Hook / Filtros	Alta	Encargado en /gestion/centro-incidentes selecciona pestaña Recuperación, aplica filtros y cambia a página 2	Cambio de pestaña a recuperacion, filtro estado=EN_EJECUCION, page=2 y recarga del navegador (F5)	Actualización de URL (?vista=recuperacion&estado=EN_EJECUCION&page=2) vía replaceState y renderizado de ActiveFilterChips	Ni la pestaña vista ni los filtros/página de useOperativosRecuperacion se persisten en URLSearchParams; OperativosRecuperacionFiltros omite ActiveFilterChips	ABIERTO	24/11/2026 02:00	(Pendiente)	Pendiente (Rechazado en Code Review)
BUG-H73-WEB-05	Expulsión de salas Socket.io al cambiar de pestaña, efecto de carga en Drawer y prevención de doble petición en búsqueda	Tiempo Real / Rendimiento	Hook / Drawer	Media	KanbanBoard montado con WebSocket conectado; drawer abierto o búsqueda desde page=2	Alternancia recuperacion -> kanban, re-render del padre con drawer abierto y escritura en buscador desde página 2	Preservación de salas sala:encargados y mapa, sin re-fetch en drawer por re-renders externos y una sola consulta debounced al buscar	Cleanup de useRecuperacionSocket expulsa al socket singleton de las salas compartidas; onCerrar inline re-dispara fetch en drawer; setPage(1) previo al debounce genera 2 peticiones	ABIERTO	24/11/2026 02:00	(Pendiente)	Pendiente (Rechazado en Code Review)
BUG-H73-WEB-06	Manejo de estado de error con reintento, botón Limpiar filtros en estado vacío, prop refreshSignal y fallback territorial	Resiliencia / UX	Vista / Tabla	Media	Error HTTP 500/400 en listado, búsqueda sin coincidencias o fallback territorial sin /api/catalogos	Rechazo HTTP 500 en listarOperativosRecuperacion, búsqueda sin resultados, o selección de delegacionId='del-norte'	Mostrar banner de error con botón Reintentar sin EmptyState falso; botón Limpiar filtros en vacío; consumo de refreshSignal y UUIDs válidos en fallback	Se renderizan simultáneamente InlineNotice y EmptyState sin Reintentar; falta Limpiar filtros en vacío; refreshSignal sin uso; del-norte provoca 400 Bad Request	ABIERTO	24/11/2026 02:00	(Pendiente)	Pendiente (Rechazado en Code Review)
BUG-H73-WEB-07	Completitud de manual de usuario (docs/manuals/), limpieza de código muerto, CSS Modules y cobertura unitaria	Documentación / Calidad	Manual / Tests	Media	Revisión de entregables de HU-73 en docs/manuals/, estilos y suites Vitest	Inspección de H73-listar-operativos-recuperacion.md, assets/, recuperacionLabels.ts, KanbanViewSwitcher.tsx y __tests__/	Capturas reales en assets/, coherencia entre manual y columnas del drawer, eliminación de código muerto/estilos inline y tests de tabla, filtros, drawer y hook	Manual tiene 3 capturas pendientes y describe columnas tipo/unidad ausentes en el drawer; exports sin uso; estilos inline en botones; solo 3 tests en vista	ABIERTO	24/11/2026 02:00	(Pendiente)	Pendiente (Rechazado en Code Review)
CP-H73-WEB-01	Despliegue del selector de pestaña "Recuperación" en KanbanViewSwitcher y lectura inicial de ?vista=recuperacion (CA-1)	Funcional / UI	Componente	Alta	Usuario autenticado en /gestion/centro-incidentes	Renderizado de KanbanViewSwitcher con vistaActiva="kanban" y clic en botón Recuperación; URL ?vista=recuperacion	Renderiza botón Recuperación con aria-pressed reactivo e invoca onCambiarVista('recuperacion'); KanbanBoard lee ?vista=recuperacion al iniciar	Verificado en KanbanViewSwitcher.test.tsx (4/4 tests pass) e inspección de KanbanBoard.tsx	APROBADO	24/11/2026 02:00	-	feat(recuperacion): listar y consultar operativos de recuperacion (HU-73)
CP-H73-WEB-02	Aislamiento visual de la subvista Recuperación ocultando KPIs y filtros propios del tablero Kanban (CA-1)	Funcional / UI	Vista	Media	Usuario en /gestion/centro-incidentes cambia a pestaña Recuperación	vistaActiva === 'recuperacion' en KanbanBoard.tsx	Oculta IncidentesKpiCards y KanbanFiltros para ceder espacio a la barra de herramientas y filtros de OperativosRecuperacionView	Verificado en KanbanBoard.tsx (línea 249) y OperativosRecuperacionView.tsx	APROBADO	24/11/2026 02:00	-	feat(recuperacion): listar y consultar operativos de recuperacion (HU-73)
CP-H73-WEB-03	Despliegue de columnas obligatorias en OperativosRecuperacionTabla (CA-2)	Funcional / UI	Componente / Tabla	Crítica	Listado con operativos cargado en OperativosRecuperacionView	Registro REC-2026-0001, "Entrega de Materiales y Remoción", "Delegación de la Costa", EN_EJECUCION, 130 insumos, 2026-11-14T15:00:00.000Z	Muestra Código, Título/Sector, Delegación, Estado, Prioridad, Insumos Asignados, Fecha de Registro en formato dd/MM/yyyy HH:mm y Acciones	Verificado en OperativosRecuperacionView.test.tsx y OperativosRecuperacionTabla.tsx	APROBADO	24/11/2026 02:00	-	feat(recuperacion): listar y consultar operativos de recuperacion (HU-73)
CP-H73-WEB-04	Renderizado de badges semánticos de estado y prioridad en paleta municipal sin emojis (CA-2)	UI / Diseño	Componente / CSS	Alta	Registros con estados PLANIFICADA, EN_EJECUCION, COMPLETADA, CANCELADA	Clases CSS estadoPLANIFICADA, estadoEN_EJECUCION, estadoCOMPLETADA, estadoCANCELADA y prioridades CRITICA/ALTA/MEDIA/BAJA	Badges rectangulares (--radius-none: 0px) con colores semánticos teal, warning, success y danger, etiquetas legibles e íconos lucide-react sin emojis	Verificado en OperativosRecuperacion.module.css y recuperacionLabels.ts	APROBADO	24/11/2026 02:00	-	feat(recuperacion): listar y consultar operativos de recuperacion (HU-73)
CP-H73-WEB-05	Visualización cuantitativa y desglose resumido de insumos asignados en celda de tabla (CA-2)	Funcional / UI	Componente / Tabla	Alta	Operativo con cantidadInsumosAsignados: 130 y recursosResumen de 2 ítems	recursosResumen: [{ nombre: 'Planchas de Zinc', cantidadAsignada: 120 }, { nombre: 'Frazadas', cantidadAsignada: 10 }]	Muestra "130 unidades" en negrita y resumen "120 Planchas de Zinc, 10 Frazadas" con atributo title completo	Verificado en OperativosRecuperacionTabla.tsx y OperativosRecuperacionView.test.tsx	APROBADO	24/11/2026 02:00	-	feat(recuperacion): listar y consultar operativos de recuperacion (HU-73)
CP-H73-WEB-06	Controles de paginación estándar H34 (Pagination) con cambio de página y tamaño (10, 25, 50) (CA-1)	Funcional / Paginación	Componente / Hook	Alta	Respuesta con meta: { page: 1, limit: 10, total: 25, totalPages: 3, hasNext: true, hasPrev: false }	Clic en Siguiente (setPage(2)) y selección de límite 25 (setLimit(25))	Muestra rango "Mostrando 1 a 10 de 25 operativos", cambia de página y al modificar límite reinicia page a 1	Verificado en OperativosRecuperacionView.tsx, Pagination.tsx y useOperativosRecuperacion.ts	APROBADO	24/11/2026 02:00	-	feat(recuperacion): listar y consultar operativos de recuperacion (HU-73)
CP-H73-WEB-07	Ordenamiento interactivo por Código y Fecha de Registro en cabeceras de tabla (CA-1)	Funcional / UI	Componente / Hook	Media	Tabla renderizada con ordenarPor='creadoEn', orden='desc'	Clic en botón de cabecera Código (onToggleOrden('codigo')) y clic posterior	Cambia criterio a codigo ascendente (ArrowUp), luego alterna a descendente (ArrowDown) y reinicia page a 1	Verificado en OperativosRecuperacionTabla.tsx y useOperativosRecuperacion.ts	APROBADO	24/11/2026 02:00	-	feat(recuperacion): listar y consultar operativos de recuperacion (HU-73)
CP-H73-WEB-08	Filtrado por delegación municipal, estado, prioridad, búsqueda textual y botón "Limpiar filtros" (CA-3)	Funcional / Filtros	Componente / Hook	Alta	Barra OperativosRecuperacionFiltros montada con catálogo de delegaciones	delegacionId='del-1', estado='EN_EJECUCION', prioridad='ALTA', busqueda='REC-2026' y clic en "Limpiar filtros"	Actualiza estado de filtros, muestra contador de filtros activos en FilterBar y botón "Limpiar filtros" que restablece FILTROS_RECUPERACION_INICIALES	Verificado en OperativosRecuperacionFiltros.tsx y useOperativosRecuperacion.ts	APROBADO	24/11/2026 02:00	-	feat(recuperacion): listar y consultar operativos de recuperacion (HU-73)
CP-H73-WEB-09	Apertura de OperativoRecuperacionDrawer al hacer clic en fila o botón Detalle sin doble disparo (CA-4)	Funcional / UI	Componente / Drawer	Crítica	Tabla con fila op-1 (REC-2026-0001) visible	Clic sobre texto REC-2026-0001 en <tr> y clic en Button Detalle	Invoca onSelectOperativo('op-1'), consulta obtenerDetalleOperativoRecuperacion('op-1') y celda de acciones detiene propagación con stopPropagation()	Verificado en OperativosRecuperacionView.test.tsx y OperativosRecuperacionTabla.tsx	APROBADO	24/11/2026 02:00	-	feat(recuperacion): listar y consultar operativos de recuperacion (HU-73)
CP-H73-WEB-10	Visualización en Drawer de detalles generales, delegación/misión/patrulla, tabla de recursos e historial cronológico (CA-4)	Funcional / UI	Componente / Drawer	Crítica	OperativoRecuperacionDrawer abierto para op-1 con 200 OK	detalle con mision: MIS-2026-0010, patrulla: Patrulla Costa, recursos: [{ nombre: 'Planchas de Zinc', cantidadAsignada: 120 }] e historial	Despliega código y título en cabecera, 4 secciones institucionales, listado de insumos y línea de tiempo con autor y fecha	Verificado en OperativosRecuperacionView.test.tsx y OperativoRecuperacionDrawer.tsx	APROBADO	24/11/2026 02:00	-	feat(recuperacion): listar y consultar operativos de recuperacion (HU-73)
CP-H73-WEB-11	Cierre del drawer por tecla Escape, backdrop o botón X y manejo automático de 404 Not Found (CA-4)	Usabilidad / Resiliencia	Componente / Drawer	Media	OperativoRecuperacionDrawer abierto con operativoId !== null	Pulsación de tecla Escape, clic en backdrop o respuesta 404 en obtenerDetalleOperativoRecuperacion	Cierra panel mediante onCerrar(), y ante 404 emite notificación de error vía useOptionalToast y cierra el drawer	Verificado en OperativoRecuperacionDrawer.tsx (líneas 62-68, 84-93, 103, 119)	APROBADO	24/11/2026 02:00	-	feat(recuperacion): listar y consultar operativos de recuperacion (HU-73)
CP-H73-WEB-12	Despliegue de AccesoDenegadoState en OperativosRecuperacionView cuando la API rechaza con 403 Forbidden	Seguridad / RBAC	Vista / Servicio	Crítica	Usuario sin permiso recuperacion:leer consultando el módulo	listarOperativosRecuperacion rechaza con RecuperacionServiceError(..., { statusCode: 403 })	recuperacionService lanza statusCode: 403 sin fallback y OperativosRecuperacionView renderiza AccesoDenegadoState mencionando recuperacion:leer	Verificado en recuperacionService.test.ts y OperativosRecuperacionView.test.tsx	APROBADO	24/11/2026 02:00	-	feat(recuperacion): listar y consultar operativos de recuperacion (HU-73)
CP-H73-WEB-13	Envío limpio de parámetros H34 y manejo de respuestas 200, 401, 403, 404 en recuperacionService (CA-5)	Integración / DAL	Servicio	Crítica	Cliente apiClient.GET tipado con paths['/api/eventos-atp/recuperacion']	listarOperativosRecuperacion({ page: 1, limit: 10, estado: 'EN_EJECUCION', busqueda: '  REC-2026  ' })	Limpia espacios con trim(), omite vacíos, retorna { data, meta } H34 y propaga códigos 401/403/404 mediante RecuperacionServiceError	Verificado en recuperacionService.test.ts (4/4 tests HU-73 pass)	APROBADO	24/11/2026 02:00	-	feat(recuperacion): listar y consultar operativos de recuperacion (HU-73)
CP-H73-WEB-14	Validación en vivo de endpoints GET /api/eventos-atp/recuperacion y /{id} contra sgrai-api (CA-5)	Integración API	cURL / Backend	Crítica	Servidor sgrai-api activo en http://localhost:3001 con fixture H73 sembrado	Peticiones cURL con x-user-id Encargado, Call Center y anónimo a listado y detalle (73100000-...-0001, UUID inexistente, ID inválido)	401 sin auth, 200 Encargado con 6 registros y meta H34, 403 Call Center (recuperacion:leer), 200 detalle, 404 inexistente, 400 no UUID	Todas las respuestas HTTP/JSON reales verificadas coinciden con el contrato OpenAPI H34/H73	APROBADO	24/11/2026 02:00	-	fix(types): preservar contratos de develop y agregar endpoints HU-73 en api-generated
CP-H73-WEB-15	Verificación estática (tsc --noEmit, eslint, next build) y ejecución global de Vitest en la rama	Calidad / CI	Sistema	Alta	Rama feature/H73-listar-operativos-recuperacion con dependencias instaladas	npx tsc --noEmit, npm run lint, npm run build y npm test	Código de salida 0 en chequeo de tipos, linter, build y 100% de pruebas unitarias de la rama	tsc (0 errores), lint (0 errores), build (47 rutas) y vitest (129/129 archivos, 867/867 tests pass)	APROBADO	24/11/2026 02:00	-	feat(recuperacion): listar y consultar operativos de recuperacion (HU-73)
```

---

## 5. Guía de Ejecución Paso a Paso y Evidencias Replicables

### 5.1. Verificación Estática: TypeScript, ESLint y Build de Producción

```bash
npx tsc --noEmit && npm run lint
```

**Salida obtenida:**
```text
npm notice run sgrai-web@0.9.0 npx
npm notice run 'tsc' --noEmit
=== TSC OK ===
npm notice run sgrai-web@0.9.0 lint
npm notice run eslint
=== LINT OK ===
```

```bash
npm run build
```

**Salida obtenida:**
```text
▲ Next.js 16.3.4 (webpack)
- Environments: .env.local
✓ Compiled successfully in 10.2s
  Finished TypeScript in 8.7s
  Collecting page data using 15 workers in 696ms
✓ Generating static pages using 15 workers (47/47) in 1035ms
```

### 5.2. Auditoría de Divergencia Git y Contratos frente a `develop` (`BUG-H73-WEB-01`)

```bash
git merge-base develop HEAD
git log --oneline --no-merges HEAD..develop
git diff --name-status "$(git merge-base develop HEAD)..HEAD"
git diff develop HEAD -- src/services/recuperacionService.ts src/app/layout.tsx eslint.config.mjs
```

**Salida clave observada:**
- `git merge-base develop HEAD`: `cabb4c26665e1d289edf9bd576428fc99e3d6528` (anterior a `PR #44`, `PR #43`, `PR #45` y `PR #46`).
- `git diff develop HEAD -- src/types/api-generated.d.ts | grep -E "^[+-]    \"/"`:
  ```text
  -    "/api/health": {
  -    "/api/incidentes/{id}/tipologia": {
  -    "/api/eventos-atp/recuperacion/{id}/asignar": {
  -    "/api/patrullas/{id}/estado": {
  -    "/api/misiones/{id}/rechazar": {
  -    "/api/eventos-atp": {
  ```

### 5.3. Ejecución de Pruebas Automatizadas HU-73 y Suite Global (Vitest)

#### Pruebas filtradas por nombre (`npm test -- -t "..."`)

```bash
npm test -- -t "OperativosRecuperacionView"
```

**Salida obtenida:**
```text
 ✓ src/components/mando/recuperacion/__tests__/OperativosRecuperacionView.test.tsx (3 tests) 1507ms
 Test Files  1 passed | 128 skipped (129)
      Tests  3 passed | 864 skipped (867)
```

```bash
npm test -- -t "recuperacionService \(HU-73\)"
```

**Salida obtenida:**
```text
 ✓ src/services/__tests__/recuperacionService.test.ts (10 tests | 6 skipped) 12ms
 Test Files  1 passed | 128 skipped (129)
      Tests  4 passed | 863 skipped (867)
```

```bash
npm test -- -t "KanbanViewSwitcher"
```

**Salida obtenida:**
```text
 ✓ src/components/mando/__tests__/KanbanViewSwitcher.test.tsx (4 tests) 616ms
 Test Files  1 passed | 128 skipped (129)
      Tests  4 passed | 863 skipped (867)
```

#### Ejecución directa de las suites modificadas y suite completa

```bash
npx vitest run \
  src/components/mando/recuperacion/__tests__/OperativosRecuperacionView.test.tsx \
  src/services/__tests__/recuperacionService.test.ts \
  src/components/mando/__tests__/KanbanViewSwitcher.test.tsx
```

**Salida obtenida:**
```text
 ✓ src/services/__tests__/recuperacionService.test.ts (10 tests) 10ms
 ✓ src/components/mando/__tests__/KanbanViewSwitcher.test.tsx (4 tests) 238ms
 ✓ src/components/mando/recuperacion/__tests__/OperativosRecuperacionView.test.tsx (3 tests) 343ms

 Test Files  3 passed (3)
      Tests  17 passed (17)
   Duration  1.77s
```

```bash
npm test
```

**Salida obtenida:**
```text
 Test Files  129 passed (129)
      Tests  867 passed (867)
   Duration  29.27s
```

### 5.4. Pruebas de Integración con `cURL` sobre `sgrai-api` (`http://localhost:3001`)

#### Escenario A: Autenticación de Encargado (`POST /api/seguridad/login`)
```bash
curl -s -X POST "http://localhost:3001/api/seguridad/login" \
  -H "Content-Type: application/json" \
  -d '{"identificador":"encargado@valdivia.cl","password":"Valdivia2026!"}'
```

**Respuesta HTTP (`200 OK`):**
```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9.<PAYLOAD_JWT>.<FIRMA>",
    "tipoToken": "Bearer",
    "expiraEn": "2026-11-24T..."
  }
}
```

#### Escenario B: Petición Anónima sin Autenticación (`401 Unauthorized`)
```bash
curl -i -X GET "http://localhost:3001/api/eventos-atp/recuperacion"
```

**Respuesta HTTP (`401 Unauthorized`):**
```json
{"message":"Se requiere cabecera de autenticación Authorization: Bearer <token> o X-User-Id."}
```

#### Escenario C: Listado Paginado H34 Autorizado (`200 OK`)
```bash
curl -i -X GET "http://localhost:3001/api/eventos-atp/recuperacion?page=1&limit=10" \
  -H "x-user-id: 00000000-0000-4000-8000-000000000003"
```

**Respuesta HTTP (`200 OK`):**
```json
{
  "message": "Listado de operativos de recuperación obtenido exitosamente",
  "data": [
    {
      "id": "73100000-0000-4000-8000-000000000003",
      "codigo": "REC-2026-0013",
      "nombre": "Distribución de víveres y kits de calefacción en campamento",
      "descripcion": "Entrega de cajas de alimentos de emergencia y ropa de abrigo a familias afectadas por anegamiento.",
      "sector": "Campamento Los Jazmines, Angachilla",
      "direccionTexto": "Acceso Sur Poniente s/n",
      "prioridad": "CRITICA",
      "estado": "PLANIFICADA",
      "familiasAfectadas": 42,
      "delegacion": {
        "id": "30000000-0000-4000-8000-000000000002",
        "codigo": "DEL_SUR",
        "nombre": "Delegación Municipal Sur"
      },
      "cantidadInsumosAsignados": 105,
      "totalTiposInsumos": 2,
      "recursosResumen": [
        { "recursoId": "73000000-0000-4000-8000-000000000002", "nombre": "Cajas de Alimentos de Emergencia Familiar", "cantidadAsignada": 45 },
        { "recursoId": "73000000-0000-4000-8000-000000000003", "nombre": "Frazadas Térmicas y Ropa de Cama Polar", "cantidadAsignada": 60 }
      ],
      "creadoEn": "2026-11-24T03:58:44.549Z",
      "actualizadoEn": "2026-11-24T03:58:44.549Z",
      "fechaCierre": null
    }
  ],
  "meta": {
    "total": 6,
    "page": 1,
    "limit": 10,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```
*(Nota: El arreglo `data` incluyó los 6 registros sembrados `REC-2026-0013`, `REC-2026-0011`, `REC-2026-0014`, `REC-2026-0015`, `REC-2026-0012` y `REC-2026-0016` cubriendo los 4 estados `PLANIFICADA`, `EN_EJECUCION`, `COMPLETADA` y `CANCELADA`).*

#### Escenario D: Reproducción de `BUG-H73-WEB-03` — Filtro de Fechas `YYYY-MM-DD` sin Hora
```bash
curl -s "http://localhost:3001/api/eventos-atp/recuperacion?fechaDesde=2026-11-24&fechaHasta=2026-11-24" \
  -H "x-user-id: 00000000-0000-4000-8000-000000000003"
```

**Respuesta HTTP (`200 OK` — Falso Vacío por Formato de Fecha en Frontend):**
```json
{
  "message": "Listado de operativos de recuperación obtenido exitosamente",
  "data": [],
  "meta": {
    "total": 0,
    "page": 1,
    "limit": 20,
    "totalPages": 0,
    "hasNext": false,
    "hasPrev": false
  }
}
```

#### Escenario E: Rechazo RBAC para Perfil Call Center (`403 Forbidden`)
```bash
curl -i -X GET "http://localhost:3001/api/eventos-atp/recuperacion" \
  -H "x-user-id: 00000000-0000-4000-8000-000000000002"
```

**Respuesta HTTP (`403 Forbidden`):**
```json
{"message":"No cuenta con el permiso requerido: recuperacion:leer"}
```

#### Escenario F: Consulta de Detalle para Drawer Lateral (`200 OK`, `404 Not Found`, `400 Bad Request`)
```bash
curl -i -X GET "http://localhost:3001/api/eventos-atp/recuperacion/73100000-0000-4000-8000-000000000001" \
  -H "x-user-id: 00000000-0000-4000-8000-000000000003"
```

**Respuesta HTTP (`200 OK`):**
```json
{
  "message": "Detalle de operativo de recuperación obtenido exitosamente.",
  "data": {
    "id": "73100000-0000-4000-8000-000000000001",
    "codigo": "REC-2026-0011",
    "nombre": "Entrega de techumbres y materiales de habitabilidad",
    "estado": "EN_EJECUCION",
    "prioridad": "ALTA",
    "sector": "Sector Niebla Alto",
    "delegacion": {
      "id": "30000000-0000-4000-8000-000000000003",
      "codigo": "DEL_COSTA",
      "nombre": "Delegación Municipal Costa"
    },
    "creadoPor": {
      "id": "00000000-0000-4000-8000-000000000003",
      "nombre": "Encargado de Operaciones"
    },
    "mision": {
      "id": "73200000-0000-4000-8000-000000000001",
      "codigo": "MIS-2026-0073-1",
      "titulo": "Despliegue operativo Niebla Alto",
      "estado": "EN_CURSO",
      "tipoMision": "RECUPERACION"
    },
    "patrulla": {
      "id": "f1000000-0000-4000-8000-000000000030",
      "nombre": "Patrulla Rápida Niebla-Costa",
      "estado": "DISPONIBLE"
    },
    "recursos": [
      { "recursoId": "73000000-0000-4000-8000-000000000001", "nombre": "Planchas de Zinc Acanaladas 3.66m", "cantidadAsignada": 80 },
      { "recursoId": "73000000-0000-4000-8000-000000000003", "nombre": "Frazadas Térmicas y Ropa de Cama Polar", "cantidadAsignada": 20 }
    ],
    "cantidadInsumosAsignados": 100,
    "totalTiposInsumos": 2,
    "historial": [
      {
        "id": "rec-creacion-73100000-0000-4000-8000-000000000001",
        "tipo": "CREACION",
        "titulo": "Operativo Planificado y Despachado",
        "creadoEn": "2026-11-24T01:58:44.549Z"
      },
      {
        "id": "73300000-0000-4000-8000-000000000001",
        "tipo": "HITO_MISION",
        "titulo": "SALIDA_BASE",
        "creadoEn": "2026-11-24T02:58:44.569Z"
      },
      {
        "id": "73300000-0000-4000-8000-000000000002",
        "tipo": "HITO_MISION",
        "titulo": "ARRIBO_SECTOR",
        "creadoEn": "2026-11-24T03:58:44.569Z"
      },
      {
        "id": "73400000-0000-4000-8000-000000000001",
        "tipo": "REPORTE_TERRENO",
        "titulo": "Reporte de Avance en Terreno",
        "creadoEn": "2026-11-24T04:13:44.574Z"
      }
    ]
  }
}
```

```bash
curl -i -X GET "http://localhost:3001/api/eventos-atp/recuperacion/00000000-0000-4000-8000-000000000999" \
  -H "x-user-id: 00000000-0000-4000-8000-000000000003"
```
**Respuesta HTTP (`404 Not Found`):**
```json
{"message":"Operativo de recuperación con ID '00000000-0000-4000-8000-000000000999' no encontrado."}
```

```bash
curl -i -X GET "http://localhost:3001/api/eventos-atp/recuperacion/no-es-uuid" \
  -H "x-user-id: 00000000-0000-4000-8000-000000000003"
```
**Respuesta HTTP (`400 Bad Request`):**
```json
{"message":"El identificador del operativo de recuperación no es un UUID válido.","errors":[{"campo":"id","mensaje":"El identificador del operativo debe ser un UUID válido"}]}
```

---

## 6. Matriz de Trazabilidad de Criterios de Aceptación (HU-73)

| Criterio de Aceptación (CA) | Cobertura en Casos de Prueba | Estado Actual | Observación Técnica |
|---|---|:---:|---|
| **CA-1:** El sistema debe proveer una vista tabular en `/gestion/centro-incidentes` (pestaña o subvista Recuperación) bajo el estándar de contratos H34 (`page`, `limit`, `total`, `totalPages`). | `CP-H73-WEB-01`, `CP-H73-WEB-02`, `CP-H73-WEB-06`, `CP-H73-WEB-07`, `BUG-H73-WEB-01`, `BUG-H73-WEB-02`, `BUG-H73-WEB-04` | **Observado (Parcial)** | La pestaña y paginación base existen, pero faltan persistencia en `URLSearchParams` (H34), acceso funcional del Supervisor (`BUG-H73-WEB-02`) y sincronización con `develop` (`BUG-H73-WEB-01`). |
| **CA-2:** La tabla debe mostrar: Código de evento, Título descriptivo, Delegación, Estado (`PLANIFICADA`, `EN_EJECUCION`, `COMPLETADA`, `CANCELADA`), Cantidad de insumos asignados y Fecha de registro. | `CP-H73-WEB-03`, `CP-H73-WEB-04`, `CP-H73-WEB-05`, `BUG-H73-WEB-06` | **Cumple con observaciones menores** | Todas las columnas obligatorias y los 4 estados se renderizan con badges CSS Modules; resta corregir singularización (`1 unidad`) y accesibilidad por teclado en fila. |
| **CA-3:** Debe permitir filtrar por: delegación municipal, estado del operativo y búsqueda textual por código o título. | `CP-H73-WEB-08`, `BUG-H73-WEB-03`, `BUG-H73-WEB-04`, `BUG-H73-WEB-05`, `BUG-H73-WEB-06` | **Observado (Parcial)** | Delegación, estado y búsqueda operan; sin embargo, el filtro temporal `fechaDesde`/`fechaHasta` falla con fechas del mismo día (`BUG-H73-WEB-03`), falta `ActiveFilterChips` (`BUG-H73-WEB-04`) y buscar desde página > 1 dispara doble petición (`BUG-H73-WEB-05`). |
| **CA-4:** Al hacer clic en un registro, debe abrirse un drawer lateral con el detalle de recursos asignados e historial. | `CP-H73-WEB-09`, `CP-H73-WEB-10`, `CP-H73-WEB-11`, `BUG-H73-WEB-05`, `BUG-H73-WEB-07` | **Cumple con observaciones medias** | El drawer despliega datos generales, misión/patrulla, recursos e historial; requiere estabilizar `onCerrar` para evitar re-fetch innecesario y alinear columnas con el manual. |
| **CA-5:** El endpoint `GET /api/eventos-atp/recuperacion` debe soportar los filtros y responder bajo estándar H34. | `CP-H73-WEB-13`, `CP-H73-WEB-14`, `BUG-H73-WEB-01`, `BUG-H73-WEB-03` | **Observado (Divergencia con `develop`)** | El servicio tipado consume el endpoint H34 validado en vivo, pero la rama elimina contratos de HU-32 en `recuperacionService.ts` y desincroniza `api-generated.d.ts` respecto a `develop`. |

---

## 7. Dictamen Final de Auditoría QA

**Dictamen:** **`CHANGES REQUESTED` — No autorizado para merge a `develop`.**

El desarrollo base de la interfaz tabular y el drawer lateral de **HU-73** cumple parcialmente con la visualización requerida para el Encargado, pero presenta **2 defectos críticos** (`BUG-H73-WEB-01` de integración/regresión frente a `develop` y `BUG-H73-WEB-02` de bloqueo RBAC para el perfil Supervisor), **2 defectos altos** (`BUG-H73-WEB-03` de filtro de fechas `YYYY-MM-DD` sin rango horario ISO y `BUG-H73-WEB-04` de estándar H34 en URL y chips) y **3 defectos medios** (`BUG-H73-WEB-05`, `BUG-H73-WEB-06`, `BUG-H73-WEB-07`). Se solicita a `MayraCarrillo` aplicar las correcciones indicadas sin alterar contratos de historias previamente integradas en `develop` para proceder con el ciclo formal de **Re-Test**.
