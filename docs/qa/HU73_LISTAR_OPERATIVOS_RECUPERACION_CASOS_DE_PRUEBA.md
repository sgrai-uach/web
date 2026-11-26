# Informe y Matriz de Casos de Prueba (QA): HU-73 — Listado Paginado y Filtrable de Operativos de Recuperación Post-Desastre

> **Documento Oficial de Aseguramiento de Calidad (QA) — Frontend Web**  
> **Proyecto:** Sistema de Gestión de Recursos para Atención de Incidentes (SGRAI) — Dirección de Gestión de Riesgos de Desastres, Municipalidad de Valdivia.  
> **Módulo:** Centro de Mando / Operaciones de Recuperación Post-Desastre (`sgrai-web` — `/gestion/centro-incidentes`).  
> **Historia de Usuario:** HU-73 — *"Como Encargado Quiero visualizar un listado paginado y filtrable de todos los operativos de recuperación post-desastre registrados en el sistema Para dar seguimiento al avance de los despliegues de entrega de ayuda y rehabilitación comunal desplegados en las delegaciones."*  
> **Desarrollador Asignado:** MayraCarrillo  
> **Equipo Auditor:** Aseguramiento de Calidad (QA) — Proyecto SGRAI  
> **Servicio Web Auditado:** `sgrai-web` (Next.js 16.3.4 App Router + React 19.2.8 + TypeScript 5 + Vitest v3.2.7 + Testing Library + CSS Modules / Vanilla CSS).  
> **Rama Git Evaluada:** `feature/H73-listar-operativos-recuperacion`  
> **Commits Evaluados (Ciclo Inicial + Re-Tests):**  
> * `feat(recuperacion): listar y consultar operativos de recuperacion (HU-73)`  
> * `fix(types): preservar contratos de develop y agregar endpoints HU-73 en api-generated`  
> * `fix(recuperacion): sincronizar develop y resolver BUG-H73-WEB-01, 02 y 03`  
> * `refactor(recuperacion): usar componente Chip estandar en tabla de operativos`  
> * `fix(recuperacion): resolver BUG-H73-WEB-04, 05, 06 y 07 de QA`  
>  
> **Fecha de Ejecución Inicial QA:** 24 de Noviembre de 2026 02:00.  
> **Fecha de Re-Test:** 26 de Noviembre de 2026 14:26 *(ciclo intermedio ejecutado el 25 de Noviembre de 2026 22:50)*.  
> **Estado de Certificación:** **APROBADO EN RE-TEST (`APPROVED`) — 7 DEFECTOS CORREGIDOS, 0 DEFECTOS ABIERTOS**.

---

## 1. Resumen Ejecutivo de Pruebas (Re-Test Final)

| Métrica | Inicial (24/11) | Re-Test 1 (25/11) | Re-Test Final (26/11) | Observaciones Técnicas |
|---|:---:|:---:|:---:|---|
| **Total de Casos de Prueba Evaluados** | **22** | **22** | **22** | 7 Defectos (`BUG-H73-WEB-01` a `BUG-H73-WEB-07`) + 15 Casos Funcionales, UI, Contrato e Integración |
| **Casos Aprobados / Corregidos** | **15** | **18** | **22** | **15 `APROBADO` + 7 `CORREGIDO`** (`BUG-H73-WEB-01` a `BUG-H73-WEB-07` cerrados en el Re-Test final) |
| **Defectos Abiertos (`ABIERTO`)** | **7** | **4** | **0** | **0 Críticos, 0 Altos, 0 Medios** |
| **Casos Bloqueados (`BLOQUEADO`)** | **0** | **0** | **0** | Compilación, análisis estático y suites Vitest completamente operativos |
| **Tasa de Aprobación Global (% Pass)** | **68.2%** | **81.8%** | **100.0%** | **Apto para merge a `develop`** cumpliendo los 5 Criterios de Aceptación y estándares UI/H34 |
| **Análisis Estático de Código (`npm run lint`)** | **0 errores** | **0 errores** | **0 errores** | ESLint limpio sin estilos inline prohibidos y con regla `no-restricted-imports` sobre `next/font/google` activa |
| **Chequeo de Tipos Estáticos (`npx tsc --noEmit`)** | **0 errores** | **0 errores** | **0 errores** | Compilación TypeScript limpia tras eliminación de tipos huérfanos y unificación con `develop` |
| **Empaquetado Productivo (`npm run build`)** | **47 rutas** | **49 rutas** | **49 rutas** | `next build --webpack` genera `49/49` páginas estáticas usando `next/font/local` (`OK: sin Google Fonts`) |
| **Suites HU-73 y Recuperación (Vitest)** | **17/17 pass** | **28/28 pass** | **45/45 pass** | **8/8 archivos pass en `4.28s`** (`recuperacionService` 20, `useRecuperacionSocket` 9, `KanbanViewSwitcher` 4, `OperativosRecuperacionView` 4, `useOperativosRecuperacion` 3, `OperativosRecuperacionFiltros` 2, `OperativoRecuperacionDrawer` 2, `OperativosRecuperacionTabla` 1) |
| **Suite Global del Proyecto (Vitest)** | **867/867 pass** | **1008/1008 pass** | **1017/1017 pass** | **143/143 archivos ejecutados en `34.73s`** sin fallos tras incorporación de pruebas dedicadas |
| **Pruebas de Integración HTTP (`sgrai-api`)** | **Verificadas** | **Validación unitaria** | **Validación unitaria** | Endpoints validados en vivo el 24/11 (`200`, `400`, `401`, `403`, `404`); durante los Re-Tests el backend `:3001` estuvo fuera de línea, verificándose contratos y normalización vía Vitest |

---

## 2. Registro Técnico de Defectos Detectados

| ID Defecto | Descripción Técnica del Defecto | Severidad | Módulo / Archivo Afectado | Fecha Detección | Estado | Solución / Commit | Fecha Re-Test | Dictamen QA |
|---|---|:---:|---|:---:|:---:|---|:---:|:---:|
| `BUG-H73-WEB-01` | **Desincronización crítica con `develop`, pérdida de contratos de HU-32 y ruptura de compilación offline con `next/font/google`:** La rama divergía de `develop` previo a `PR #44` (HU-69), `PR #43` (HU-61), `PR #45` (HU-37) y `PR #46` (HU-32), eliminando funciones HU-32 en `recuperacionService.ts`/`recuperacion.ts`, omitiendo integraciones en `KanbanBoard.tsx`, regresionando a `next/font/google` y desincronizando `api-generated.d.ts`. | Crítica | `src/services/recuperacionService.ts`, `src/types/recuperacion.ts`, `src/components/mando/KanbanBoard.tsx`, `src/app/layout.tsx`, `eslint.config.mjs`, `src/types/api-generated.d.ts` | 24/11/2026 02:00 | `CORREGIDO` | fix(recuperacion): sincronizar develop y resolver BUG-H73-WEB-01, 02 y 03 | 25/11/2026 22:50 | **APROBADO EN RE-TEST:** Se integró `develop` completamente (`HEAD..develop` vacío), se restauró `next/font/local` y regla ESLint (`OK: sin Google Fonts`), se preservaron contratos de HU-32/HU-37/HU-61/HU-69 y pasó `next build` (`49/49` rutas). |
| `BUG-H73-WEB-02` | **Bloqueo perimetral indebido del rol `Supervisor Estratégico` en `/gestion/centro-incidentes` al acceder a Recuperación:** `navItems.ts` y `GestionModulosGrid.tsx` exigían exclusivamente `['incidentes:kanban', 'misiones:asignar']`; `KanbanBoard.tsx` ejecutaba `useIncidentesKanban()` y `useIncidentesKpis()` sin condición y activaba `<AccesoDenegado />` global ante `403`, y `SimulatedSessionContext.tsx` omitía `recuperacion:leer`. | Crítica | `src/hooks/usePermisosMando.ts`, `src/components/mando/KanbanBoard.tsx`, `src/components/layout/navItems.ts`, `src/components/gestion/GestionModulosGrid.tsx`, `src/context/SimulatedSessionContext.tsx` | 24/11/2026 02:00 | `CORREGIDO` | fix(recuperacion): sincronizar develop y resolver BUG-H73-WEB-01, 02 y 03 | 25/11/2026 22:50 | **APROBADO EN RE-TEST:** `usePermisosMando.ts` separa `usePuedeVerKanban` y `usePuedeLeerRecuperacion`; `navItems.ts`, `GestionModulosGrid.tsx` y `SimulatedSessionContext.tsx` incorporan `'recuperacion:leer'`; `KanbanBoard.tsx` condiciona Kanban/KPIs a `enabled: puedeVerKanban` y conmuta automáticamente a `?vista=recuperacion` vía `cambiarVistaActiva`. |
| `BUG-H73-WEB-03` | **Filtro temporal `fechaDesde` / `fechaHasta` envía fechas `YYYY-MM-DD` sin componente horario excluyendo registros del día consultado:** `recuperacionService.ts` enviaba fechas sin normalizar a ISO 8601 UTC completo y `OperativosRecuperacionFiltros.tsx` permitía seleccionar rangos invertidos sin `min`/`max`. | Alta | `src/components/mando/recuperacion/OperativosRecuperacionFiltros.tsx` y `src/services/recuperacionService.ts` | 24/11/2026 02:00 | `CORREGIDO` | fix(recuperacion): sincronizar develop y resolver BUG-H73-WEB-01, 02 y 03 | 25/11/2026 22:50 | **APROBADO EN RE-TEST:** `toIsoBoundary(val, endOfDay)` en `recuperacionService.ts` normaliza `YYYY-MM-DD` a límites ISO UTC inicio/fin del día local; `OperativosRecuperacionFiltros.tsx` restringe `max`/`min` entre fechas. Validado en `recuperacionService.test.ts` y `OperativosRecuperacionFiltros.test.tsx`. |
| `BUG-H73-WEB-04` | **Incumplimiento parcial del estándar H34: ausencia de persistencia de pestaña, filtros y paginación en `URLSearchParams` y omisión de `ActiveFilterChips`:** `KanbanBoard.tsx` no actualizaba `?vista` al alternar pestañas; `useOperativosRecuperacion.ts` mantenía filtros/paginación únicamente en estado local; y `OperativosRecuperacionFiltros.tsx` carecía de `<ActiveFilterChips />`. | Alta | `src/components/mando/KanbanBoard.tsx`, `src/hooks/useOperativosRecuperacion.ts` y `src/components/mando/recuperacion/OperativosRecuperacionFiltros.tsx` | 24/11/2026 02:00 | `CORREGIDO` | fix(recuperacion): resolver BUG-H73-WEB-04, 05, 06 y 07 de QA | 26/11/2026 14:26 | **APROBADO EN RE-TEST:** `KanbanBoard.tsx` sincroniza `vista` en `URLSearchParams` mediante `cambiarVistaActiva` (`replaceState`) depurando parámetros de recuperación al salir de la pestaña; `useOperativosRecuperacion.ts` hidrata estado inicial desde URL (`leerEstadoInicialDesdeUrl`) y sincroniza cambios bidireccionalmente; `OperativosRecuperacionFiltros.tsx` renderiza `<ActiveFilterChips />` con etiquetas legibles. |
| `BUG-H73-WEB-05` | **Expulsión de salas Socket.io al cambiar de pestaña, re-fetch duplicado en `OperativoRecuperacionDrawer` y doble consulta al buscar desde página > 1:** Cleanup de `useRecuperacionSocket` expulsaba al socket singleton de salas compartidas; `onCerrar` inline re-disparaba fetch en el drawer; y `debounceMs={0}` generaba doble request desde página > 1. | Media | `src/hooks/useOperativosRecuperacion.ts`, `src/hooks/useRecuperacionSocket.ts`, `src/components/mando/recuperacion/OperativosRecuperacionFiltros.tsx`, `src/components/mando/recuperacion/OperativoRecuperacionDrawer.tsx` y `src/components/mando/recuperacion/OperativosRecuperacionView.tsx` | 24/11/2026 02:00 | `CORREGIDO` | fix(recuperacion): resolver BUG-H73-WEB-04, 05, 06 y 07 de QA | 26/11/2026 14:26 | **APROBADO EN RE-TEST:** `useRecuperacionSocket.ts` incorpora contador de suscriptores (`activeRecuperacionSubscribers`) evitando emitir `salir`/`leave` mientras existan suscriptores activos; `OperativosRecuperacionView` estabiliza `handleCerrarDrawer` vía `useCallback` y `OperativoRecuperacionDrawer` usa `onCerrarRef`/`toastRef` con `[operativoId]` como única dependencia de carga; `FilterSearchInput` aplica `debounceMs={350}` antes de `setPage(1)`, verificado en pruebas de hook, socket y drawer. |
| `BUG-H73-WEB-06` | **Renderizado simultáneo de error HTTP con `EmptyState` falso sin reintento, prop muerta `refreshSignal`, fallback territorial sin UUID y omisión de `"Limpiar filtros"`:** Error HTTP renderizaba `<InlineNotice>` + `<EmptyState>` simultáneamente; `EmptyState` omitía `"Limpiar filtros"`; `refreshSignal` no estaba conectado; `DELEGACIONES_VALDIVIA_DEFAULT` usaba `'del-norte'`; y tabla no singularizaba `"1 unidad"` ni tenía acceso por teclado. | Media | `src/components/mando/recuperacion/OperativosRecuperacionView.tsx`, `src/components/mando/KanbanBoard.tsx`, `src/components/mando/recuperacion/OperativosRecuperacionTabla.tsx` y `src/types/incidentesKpis.ts` | 24/11/2026 02:00 | `CORREGIDO` | fix(recuperacion): resolver BUG-H73-WEB-04, 05, 06 y 07 de QA | 26/11/2026 14:26 | **APROBADO EN RE-TEST:** `OperativosRecuperacionView.tsx` separa bloque `errorState` con botón **Reintentar** y agrega botón **Limpiar filtros** en `EmptyState` cuando hay filtros activos; `KanbanBoard.tsx` conecta `recuperacionRefreshSignal` hacia `useOperativosRecuperacion`; `DELEGACIONES_VALDIVIA_DEFAULT` emplea UUIDs canónicos (`30000000-...-0001`..`0004`); `OperativosRecuperacionTabla.tsx` singulariza `1 unidad` e implementa `tabIndex={0}`, `aria-label` y `onKeyDown` (`Enter`/`Espacio`). |
| `BUG-H73-WEB-07` | **Manual de usuario con capturas pendientes y tabla divergente, código muerto, estilos inline y baja cobertura unitaria:** Manual incluía marcas de captura pendiente y columnas `tipo`/`unidad` divergentes respecto al drawer; existían exports sin uso, `style={{ ... }}` inline y baja cobertura de suites por componente. | Media | `docs/manuals/H73-listar-operativos-recuperacion.md`, `src/components/mando/recuperacion/OperativoRecuperacionDrawer.tsx`, `src/components/mando/recuperacion/recuperacionLabels.ts`, `src/types/recuperacion.ts`, `src/components/mando/KanbanViewSwitcher.tsx`, `src/components/mando/recuperacion/OperativosRecuperacionView.tsx`, `src/components/mando/recuperacion/__tests__/` | 24/11/2026 02:00 | `CORREGIDO` | fix(recuperacion): resolver BUG-H73-WEB-04, 05, 06 y 07 de QA | 26/11/2026 14:26 | **APROBADO EN RE-TEST:** Manual actualizado y alineado con columnas `Recurso` y `Cantidad asignada`, sin marcadores pendientes; eliminados `ETIQUETA_TIPO_RECURSO`, `formatearTipoRecurso`, `RecursoResumenTipo` y clases CSS huérfanas; eliminados estilos inline migrando a CSS Modules (`KanbanViewSwitcher.module.css`, `closeBtn` en drawer) y `<Chip size="md" />` en drawer; incorporadas 4 nuevas suites Vitest (`Filtros`, `Tabla`, `Drawer`, `useOperativosRecuperacion`) con `45/45` tests pass sin warnings `act(...)` en vistas H73. *(Observación menor no bloqueante: `docs/manuals/assets/H73-listar-operativos-recuperacion/` conserva `.gitkeep` sin `.png` adjuntos, siguiendo la práctica actual de `H32`/`H61`/`H69` en `develop`).* |

---

## 3. Matriz Consolidada de Casos de Prueba (13 Columnas)

| ID Caso | Título del Caso de Prueba | Tipo de Prueba | Nivel | Prioridad | Precondición | Datos de Prueba (Payload / Headers / Query) | Resultado Esperado | Resultado Obtenido | Estado | Fecha / Hora Ejecución | Fecha / Hora Re-Test | Solución / Commit |
|---|---|---|---|---|---|---|---|---|:---:|:---:|:---:|---|
| `BUG-H73-WEB-01` | Sincronización con rama `develop`, preservación de contratos HU-32 y compilación offline con `next/font/local` | Regresión / Integración | Repositorio / Contratos | Crítica | Rama `feature/H73-listar-operativos-recuperacion` comparada contra `develop` tras PRs #43, #44, #45 y #46 | `git merge-base develop HEAD`, revisión de `recuperacionService.ts`, `KanbanBoard.tsx`, `layout.tsx`, `eslint.config.mjs` y `api-generated.d.ts` | Rama sincronizada conservando `listarEventosRecuperacion`, `asignarRecursosRecuperacion`, `next/font/local`, regla ESLint de fuentes y rutas OpenAPI vigentes | Rama sincronizada completamente con `develop`; `layout.tsx` y `eslint.config.mjs` usan `next/font/local` (`OK: sin Google Fonts`); contratos HU-32/HU-73 unificados y `next build` (`49/49` rutas) OK | **CORREGIDO** | 24/11/2026 02:00 | 25/11/2026 22:50 | fix(recuperacion): sincronizar develop y resolver BUG-H73-WEB-01, 02 y 03 |
| `BUG-H73-WEB-02` | Acceso RBAC del rol Supervisor Estratégico (`recuperacion:leer`) a `/gestion/centro-incidentes?vista=recuperacion` | Seguridad / RBAC | Vista / Navegación | Crítica | Sesión activa de Supervisor Estratégico con permiso `recuperacion:leer` y sin `incidentes:kanban` | Navegación directa a `/gestion/centro-incidentes?vista=recuperacion` y evaluación de `usePermisosMando.ts`, `navItems.ts`, `GestionModulosGrid.tsx`, `SimulatedSessionContext.tsx` y `KanbanBoard.tsx` | Despliegue de `<OperativosRecuperacionView />` sin ejecutar consultas Kanban prohibidas ni bloquear la página completa con `<AccesoDenegado />` | `usePermisosMando` separa `usePuedeVerKanban` y `usePuedeLeerRecuperacion`; menús y sesión fallback incluyen `recuperacion:leer`; `KanbanBoard` condiciona Kanban/KPIs a `enabled: puedeVerKanban`, conmuta a vista `recuperacion` y despliega el módulo | **CORREGIDO** | 24/11/2026 02:00 | 25/11/2026 22:50 | fix(recuperacion): sincronizar develop y resolver BUG-H73-WEB-01, 02 y 03 |
| `BUG-H73-WEB-03` | Filtrado por rango temporal (`fechaDesde` y `fechaHasta`) en formato ISO 8601 y validación de rango | Funcional / Filtros | Servicio / UI | Alta | Operativos registrados el `2026-11-24` y controles de fecha en `OperativosRecuperacionFiltros` | Selección `Desde: 2026-11-24`, `Hasta: 2026-11-24` en `OperativosRecuperacionFiltros` y llamada a `listarOperativosRecuperacion` | Conversión a límites ISO 8601 del día (`T00:00:00.000` a `T23:59:59.999` local) y restricción `min`/`max` entre ambos controles | `toIsoBoundary` transforma `YYYY-MM-DD` a ISO UTC inicio/fin del día local y `OperativosRecuperacionFiltros` aplica `max`/`min`; verificado en `recuperacionService.test.ts` y `OperativosRecuperacionFiltros.test.tsx` | **CORREGIDO** | 24/11/2026 02:00 | 25/11/2026 22:50 | fix(recuperacion): sincronizar develop y resolver BUG-H73-WEB-01, 02 y 03 |
| `BUG-H73-WEB-04` | Persistencia bidireccional de vista, filtros y paginación en `URLSearchParams` y chips activos H34 (CA-1, CA-3) | Contrato H34 / UX | Hook / Filtros | Alta | Encargado en `/gestion/centro-incidentes` selecciona pestaña Recuperación, aplica filtros y cambia a página 2 | Cambio de pestaña a `recuperacion`, `?vista=recuperacion&page=2&limit=25&estado=EN_EJECUCION&prioridad=ALTA` y renderizado de `<ActiveFilterChips />` | Sincronización bidireccional en `URLSearchParams` vía `replaceState` (incluyendo pestaña `vista`) y despliegue de chips removibles con nombres legibles | `KanbanBoard.tsx` persiste `vista` y limpia query params al salir; `useOperativosRecuperacion.ts` hidrata y sincroniza `URLSearchParams`; `OperativosRecuperacionFiltros.tsx` renderiza `<ActiveFilterChips />` (validado en `useOperativosRecuperacion.test.ts` y `OperativosRecuperacionFiltros.test.tsx`) | **CORREGIDO** | 24/11/2026 02:00 | 26/11/2026 14:26 | fix(recuperacion): resolver BUG-H73-WEB-04, 05, 06 y 07 de QA |
| `BUG-H73-WEB-05` | Estabilidad de salas Socket.io entre pestañas, efecto de carga en Drawer y prevención de doble petición en búsqueda | Tiempo Real / Rendimiento | Hook / Drawer | Media | `KanbanBoard` montado con WebSocket conectado; drawer abierto o búsqueda desde `page=2` | Alternancia `recuperacion -> kanban`, re-render con cambio de referencia en `onCerrar` del drawer y búsqueda con `debounceMs={350}` | Preservación de salas `'encargado'`, `'sala:encargados'` y `'mapa'`, sin re-fetch en drawer por re-renders externos y una sola consulta debounced al buscar | `activeRecuperacionSubscribers` evita abandonar salas si hay otro suscriptor activo; `OperativoRecuperacionDrawer` usa `onCerrarRef`/`toastRef` con `[operativoId]`; `FilterSearchInput` aplica `debounceMs={350}` previo a `setPage(1)` (verificado en `useRecuperacionSocket.test.ts` y `OperativoRecuperacionDrawer.test.tsx`) | **CORREGIDO** | 24/11/2026 02:00 | 26/11/2026 14:26 | fix(recuperacion): resolver BUG-H73-WEB-04, 05, 06 y 07 de QA |
| `BUG-H73-WEB-06` | Manejo de estado de error con reintento, botón Limpiar filtros en estado vacío, prop `refreshSignal` y fallback territorial | Resiliencia / UX | Vista / Tabla | Media | Error HTTP `500`/`400` en listado, búsqueda sin coincidencias o fallback territorial sin `/api/catalogos` | Rechazo HTTP 500 en `listarOperativosRecuperacion`, URL `?estado=COMPLETADA` vacía, `refreshSignal: 0 -> 1`, `DELEGACIONES_VALDIVIA_DEFAULT` y `cantidadInsumosAsignados: 1` | Banner de error dedicado con botón Reintentar sin `EmptyState` falso; Limpiar filtros en vacío; conexión de `refreshSignal`; UUIDs válidos en fallback; `"1 unidad"` y soporte teclado | `OperativosRecuperacionView` separa `errorState` con Reintentar y añade Limpiar filtros en `EmptyState`; `KanbanBoard` pasa `refreshSignal`; fallback usa UUIDs v4 `30000000-...`; tabla singulariza `1 unidad` y soporta `Enter`/`Espacio` (verificado en suites `View`, `Tabla` y `Hook`) | **CORREGIDO** | 24/11/2026 02:00 | 26/11/2026 14:26 | fix(recuperacion): resolver BUG-H73-WEB-04, 05, 06 y 07 de QA |
| `BUG-H73-WEB-07` | Completitud de manual de usuario (`docs/manuals/`), limpieza de código muerto, CSS Modules y cobertura unitaria | Documentación / Calidad | Manual / Tests | Media | Revisión de entregables de HU-73 en `docs/manuals/`, estilos y suites Vitest | Inspección de `H73-listar-operativos-recuperacion.md`, `recuperacionLabels.ts`, `recuperacion.ts`, `KanbanViewSwitcher.tsx`, CSS Modules y 8 suites Vitest | Coherencia total entre manual y drawer, eliminación de código muerto/estilos inline y suites unitarias dedicadas para filtros, tabla, drawer y hook | Manual alineado con columnas `Recurso` y `Cantidad asignada` sin marcas pendientes; eliminados exports/CSS sin uso y `style={{}}` inline; `<Chip size="md" />` aplicado en drawer; `8/8` suites (`45/45` tests pass). *(Observación menor no bloqueante: carpeta `assets/` mantiene `.gitkeep` sin `.png`)* | **CORREGIDO** | 24/11/2026 02:00 | 26/11/2026 14:26 | fix(recuperacion): resolver BUG-H73-WEB-04, 05, 06 y 07 de QA |
| `CP-H73-WEB-01` | Despliegue del selector de pestaña "Recuperación" en `KanbanViewSwitcher` y lectura inicial de `?vista=recuperacion` (CA-1) | Funcional / UI | Componente | Alta | Usuario autenticado en `/gestion/centro-incidentes` | Renderizado de `KanbanViewSwitcher` con `vistaActiva="kanban"` y clic en botón `Recuperación`; URL `?vista=recuperacion` | Renderiza botón `Recuperación` con `aria-pressed` reactivo e invoca `onCambiarVista('recuperacion')`; `KanbanBoard` lee `?vista=recuperacion` al iniciar | Verificado en `KanbanViewSwitcher.test.tsx` (`4/4` tests pass en `497ms`) con clases CSS Modules y en `KanbanBoard.tsx` | **APROBADO** | 24/11/2026 02:00 | 26/11/2026 14:26 | feat(recuperacion): listar y consultar operativos de recuperacion (HU-73) |
| `CP-H73-WEB-02` | Aislamiento visual de la subvista Recuperación ocultando KPIs y filtros propios del tablero Kanban (CA-1) | Funcional / UI | Vista | Media | Usuario en `/gestion/centro-incidentes` cambia a pestaña `Recuperación` | `vistaActiva === 'recuperacion'` en `KanbanBoard.tsx` | Oculta `IncidentesKpiCards` y `KanbanFiltros` para ceder espacio a la barra de herramientas y filtros de `OperativosRecuperacionView` | Verificado en `KanbanBoard.tsx` tras integración con `develop` y actualización de `cambiarVistaActiva` | **APROBADO** | 24/11/2026 02:00 | 26/11/2026 14:26 | feat(recuperacion): listar y consultar operativos de recuperacion (HU-73) |
| `CP-H73-WEB-03` | Despliegue de columnas obligatorias en `OperativosRecuperacionTabla` (CA-2) | Funcional / UI | Componente / Tabla | Crítica | Listado con operativos cargado en `OperativosRecuperacionView` | Registro `REC-2026-0001`, `"Entrega de Materiales y Remoción"`, `"Delegación de la Costa"`, `EN_EJECUCION`, `130` insumos, `2026-11-14T15:00:00.000Z` | Muestra Código, Título/Sector, Delegación, Estado, Prioridad, Insumos Asignados, Fecha de Registro en formato `dd/MM/yyyy HH:mm` y Acciones | Verificado en `OperativosRecuperacionView.test.tsx` (`4/4`), `OperativosRecuperacionTabla.test.tsx` (`1/1`) y `OperativosRecuperacionTabla.tsx` | **APROBADO** | 24/11/2026 02:00 | 26/11/2026 14:26 | feat(recuperacion): listar y consultar operativos de recuperacion (HU-73) |
| `CP-H73-WEB-04` | Renderizado de badges semánticos de estado y prioridad con `<Chip />` estándar en paleta municipal sin emojis (CA-2) | UI / Diseño | Componente / CSS | Alta | Registros con estados `PLANIFICADA`, `EN_EJECUCION`, `COMPLETADA`, `CANCELADA` | Uso de `<Chip size="sm">` en tabla y `<Chip size="md">` en drawer con `VARIANTE_ESTADO_RECUPERACION` y `obtenerVarianteChipPrioridad` | Badges rectangulares estándar (`--radius-none: 0px`) en sentence-case con colores semánticos unificados e íconos `lucide-react` sin emojis ni clases CSS muertas | Verificado en `OperativosRecuperacionTabla.tsx`, `OperativoRecuperacionDrawer.tsx`, `OperativosRecuperacion.module.css` y suites UI (`45/45` tests pass) | **APROBADO** | 24/11/2026 02:00 | 26/11/2026 14:26 | refactor(recuperacion): usar componente Chip estandar en tabla de operativos |
| `CP-H73-WEB-05` | Visualización cuantitativa (plural y singular) y desglose resumido de insumos asignados en celda de tabla (CA-2) | Funcional / UI | Componente / Tabla | Alta | Operativos con `cantidadInsumosAsignados: 130` y `1`, más `recursosResumen` | `cantidadInsumosAsignados: 1` (`"1 unidad"`) y `130` (`"130 unidades"`, `recursosResumen: [{ nombre: 'Planchas de Zinc', cantidadAsignada: 120 }, { nombre: 'Frazadas', cantidadAsignada: 10 }]`) | Muestra `"130 unidades"` o `"1 unidad"` singularizado en negrita (con fallback `?? 0`) y resumen con atributo `title` completo | Verificado en `OperativosRecuperacionTabla.test.tsx` (`"1 unidad"`) y `OperativosRecuperacionView.test.tsx` (`"130 unidades"`) | **APROBADO** | 24/11/2026 02:00 | 26/11/2026 14:26 | fix(recuperacion): resolver BUG-H73-WEB-04, 05, 06 y 07 de QA |
| `CP-H73-WEB-06` | Controles de paginación estándar H34 (`Pagination`) con cambio de página y tamaño (`10`, `25`, `50`) (CA-1) | Funcional / Paginación | Componente / Hook | Alta | Respuesta con `meta: { page: 1, limit: 10, total: 25, totalPages: 3, hasNext: true, hasPrev: false }` | Clic en `Siguiente` (`setPage(2)`), selección de límite `25` (`setLimit(25)`) y lectura desde URL `?page=2&limit=25` | Muestra rango `"Mostrando 1 a 10 de 25 operativos"`, cambia página/límite sincronizado con URL y reinicia `page` a `1` al modificar filtros | Verificado en `OperativosRecuperacionView.tsx` y `useOperativosRecuperacion.test.ts` (`3/3` pass) | **APROBADO** | 24/11/2026 02:00 | 26/11/2026 14:26 | feat(recuperacion): listar y consultar operativos de recuperacion (HU-73) |
| `CP-H73-WEB-07` | Ordenamiento interactivo por Código y Fecha de Registro en cabeceras de tabla (CA-1) | Funcional / UI | Componente / Hook | Media | Tabla renderizada con `ordenarPor='creadoEn'`, `orden='desc'` | Clic en botón de cabecera `Código` (`onToggleOrden('codigo')`) y clic posterior | Cambia criterio a `codigo` ascendente (`ArrowUp`), luego alterna a descendente (`ArrowDown`) y reinicia `page` a `1` | Verificado en `OperativosRecuperacionTabla.test.tsx` (`1/1`) y `useOperativosRecuperacion.test.ts` (`toggleOrden('codigo')`) | **APROBADO** | 24/11/2026 02:00 | 26/11/2026 14:26 | feat(recuperacion): listar y consultar operativos de recuperacion (HU-73) |
| `CP-H73-WEB-08` | Filtrado por delegación municipal, estado, prioridad, búsqueda debounced, chips activos y `"Limpiar filtros"` (CA-3) | Funcional / Filtros | Componente / Hook | Alta | Barra `OperativosRecuperacionFiltros` montada con catálogo de delegaciones | `estado='EN_EJECUCION'`, `delegacionId`, `fechaDesde`/`fechaHasta`, clic en chip individual y clic en `"Limpiar filtros"` | Actualiza URL y chips activos removibles (`ActiveFilterChips`), aplica `debounceMs={350}` en búsqueda, `min`/`max` en fechas y limpia criterios sin doble request | Verificado en `OperativosRecuperacionFiltros.test.tsx` (`2/2`), `OperativosRecuperacionView.test.tsx` (`4/4`) y `useOperativosRecuperacion.test.ts` (`3/3`) | **APROBADO** | 24/11/2026 02:00 | 26/11/2026 14:26 | fix(recuperacion): resolver BUG-H73-WEB-04, 05, 06 y 07 de QA |
| `CP-H73-WEB-09` | Apertura de `OperativoRecuperacionDrawer` al hacer clic en fila, tecla `Enter`/`Espacio` o botón `Detalle` sin doble disparo (CA-4) | Funcional / UI | Componente / Drawer | Crítica | Tabla con fila `op-1` (`REC-2026-0001`) visible | Clic sobre texto `REC-2026-0001`, pulsación `Enter` sobre `<tr tabIndex={0}>` y clic en `<Button aria-label="Ver detalle de REC-2026-0001">` | Invoca `onSelectOperativo('op-1')`, consulta `obtenerDetalleOperativoRecuperacion('op-1')` una vez y celda de acciones detiene propagación con `e.stopPropagation()` | Verificado en `OperativosRecuperacionView.test.tsx` (`4/4`) y `OperativosRecuperacionTabla.test.tsx` (`1/1`) | **APROBADO** | 24/11/2026 02:00 | 26/11/2026 14:26 | feat(recuperacion): listar y consultar operativos de recuperacion (HU-73) |
| `CP-H73-WEB-10` | Visualización en Drawer de detalles generales (con `<Chip size="md" />`), delegación/misión/patrulla, tabla de recursos e historial cronológico (CA-4) | Funcional / UI | Componente / Drawer | Crítica | `OperativoRecuperacionDrawer` abierto para `op-1` con `200 OK` | `detalle` con `mision: MIS-2026-0010`, `patrulla: Patrulla Costa`, `recursos: [{ nombre: 'Planchas de Zinc', cantidadAsignada: 120 }]` e `historial` | Despliega código, título, chips de estado/prioridad, 4 secciones institucionales, tabla (`Recurso`, `Cantidad asignada`) e historial sin re-fetch por re-renders externos | Verificado en `OperativosRecuperacionView.test.tsx` (`4/4`) y `OperativoRecuperacionDrawer.test.tsx` (`2/2`) | **APROBADO** | 24/11/2026 02:00 | 26/11/2026 14:26 | fix(recuperacion): resolver BUG-H73-WEB-04, 05, 06 y 07 de QA |
| `CP-H73-WEB-11` | Cierre del drawer por tecla `Escape`, backdrop o botón `X` y manejo automático de `404 Not Found` (CA-4) | Usabilidad / Resiliencia | Componente / Drawer | Media | `OperativoRecuperacionDrawer` abierto con `operativoId !== null` | Pulsación de tecla `Escape`, clic en backdrop o respuesta `404` en `obtenerDetalleOperativoRecuperacion` | Cierra panel mediante `onCerrarRef.current()` sin re-disparar efecto de carga, y ante `404` notifica error vía toast y cierra el drawer | Verificado en `OperativoRecuperacionDrawer.test.tsx` (`2/2` pass: estabilidad `onCerrar`, `Escape` y `404` automático) | **APROBADO** | 24/11/2026 02:00 | 26/11/2026 14:26 | fix(recuperacion): resolver BUG-H73-WEB-04, 05, 06 y 07 de QA |
| `CP-H73-WEB-12` | Despliegue de `<AccesoDenegadoState />` en `OperativosRecuperacionView` cuando la API rechaza con `403 Forbidden` | Seguridad / RBAC | Vista / Servicio | Crítica | Usuario sin permiso `recuperacion:leer` consultando el módulo | `listarOperativosRecuperacion` rechaza con `RecuperacionServiceError(..., { statusCode: 403 })` | `recuperacionService` lanza `statusCode: 403`, hook marca `esForbidden: true` y vista renderiza `<AccesoDenegadoState />` mencionando `recuperacion:leer` | Verificado en `recuperacionService.test.ts`, `useOperativosRecuperacion.test.ts` y `OperativosRecuperacionView.test.tsx` | **APROBADO** | 24/11/2026 02:00 | 26/11/2026 14:26 | feat(recuperacion): listar y consultar operativos de recuperacion (HU-73) |
| `CP-H73-WEB-13` | Envío limpio de parámetros H34 y manejo de respuestas `200`, `401`, `403`, `404` en `recuperacionService` (CA-5) | Integración / DAL | Servicio | Crítica | Cliente `apiClient.GET` tipado con `paths['/api/eventos-atp/recuperacion']` | `listarOperativosRecuperacion({ page: 1, limit: 10, estado: 'EN_EJECUCION', busqueda: '  REC-2026  ', fechaDesde: '2026-11-24', fechaHasta: '2026-11-24' })` | Limpia espacios con `trim()`, convierte fechas vía `toIsoBoundary`, omite vacíos, retorna `{ data, meta }` H34 y propaga errores HTTP | Verificado en `recuperacionService.test.ts` (`20/20` tests pass en `45ms`) | **APROBADO** | 24/11/2026 02:00 | 26/11/2026 14:26 | fix(recuperacion): sincronizar develop y resolver BUG-H73-WEB-01, 02 y 03 |
| `CP-H73-WEB-14` | Validación en vivo de endpoints `GET /api/eventos-atp/recuperacion` y `/{id}` contra `sgrai-api` (CA-5) | Integración API | cURL / Backend | Crítica | Servidor `sgrai-api` activo en `http://localhost:3001` con fixture H73 sembrado | Peticiones cURL con `x-user-id` Encargado, Call Center y anónimo a listado y detalle (`73100000-...-0001`, UUID inexistente, ID inválido) | `401` sin auth, `200` Encargado con 6 registros y `meta` H34, `403` Call Center (`recuperacion:leer`), `200` detalle, `404` inexistente, `400` no UUID | Verificado en ciclo inicial (24/11/2026); respuestas HTTP/JSON coinciden con OpenAPI H34/H73 *(servidor `sgrai-api` fuera de línea durante Re-Tests)* | **APROBADO** | 24/11/2026 02:00 | - | fix(types): preservar contratos de develop y agregar endpoints HU-73 en api-generated |
| `CP-H73-WEB-15` | Verificación estática (`tsc --noEmit`, `eslint`, `next build`) y ejecución global de Vitest en la rama | Calidad / CI | Sistema | Alta | Rama `feature/H73-listar-operativos-recuperacion` sincronizada y con correcciones finales aplicadas | `npx tsc --noEmit`, `npm run lint`, `npm run build` y `npm test` | Código de salida `0` en chequeo de tipos, linter, build sin Google Fonts y 100% de pruebas unitarias | `tsc` (0 errores), `lint` (0 errores), `next build` (`49/49` rutas, `OK: sin Google Fonts`) y `vitest` (`143/143` archivos, `1017/1017` tests pass en `34.73s`; `8/8` suites de recuperación `45/45` pass) | **APROBADO** | 24/11/2026 02:00 | 26/11/2026 14:26 | fix(recuperacion): resolver BUG-H73-WEB-04, 05, 06 y 07 de QA |

---

## 4. Bloque TSV para Google Sheets

```tsv
ID Caso	Título del Caso de Prueba	Tipo de Prueba	Nivel	Prioridad	Precondición	Datos de Prueba (Payload / Headers / Query)	Resultado Esperado	Resultado Obtenido	Estado	Fecha / Hora Ejecución	Fecha / Hora Re-Test	Solución / Commit
BUG-H73-WEB-01	Sincronización con rama develop, preservación de contratos HU-32 y compilación offline con next/font/local	Regresión / Integración	Repositorio / Contratos	Crítica	Rama feature/H73-listar-operativos-recuperacion comparada contra develop tras PRs #43, #44, #45 y #46	git merge-base develop HEAD, revisión de recuperacionService.ts, KanbanBoard.tsx, layout.tsx, eslint.config.mjs y api-generated.d.ts	Rama sincronizada conservando listarEventosRecuperacion, asignarRecursosRecuperacion, next/font/local, regla ESLint de fuentes y rutas OpenAPI vigentes	Rama sincronizada completamente con develop; layout.tsx y eslint.config.mjs usan next/font/local (OK: sin Google Fonts); contratos HU-32/HU-73 unificados y next build (49/49 rutas) OK	CORREGIDO	24/11/2026 02:00	25/11/2026 22:50	fix(recuperacion): sincronizar develop y resolver BUG-H73-WEB-01, 02 y 03
BUG-H73-WEB-02	Acceso RBAC del rol Supervisor Estratégico (recuperacion:leer) a /gestion/centro-incidentes?vista=recuperacion	Seguridad / RBAC	Vista / Navegación	Crítica	Sesión activa de Supervisor Estratégico con permiso recuperacion:leer y sin incidentes:kanban	Navegación directa a /gestion/centro-incidentes?vista=recuperacion y evaluación de usePermisosMando.ts, navItems.ts, GestionModulosGrid.tsx, SimulatedSessionContext.tsx y KanbanBoard.tsx	Despliegue de OperativosRecuperacionView sin ejecutar consultas Kanban prohibidas ni bloquear la página completa con AccesoDenegado	usePermisosMando separa usePuedeVerKanban y usePuedeLeerRecuperacion; menús y sesión fallback incluyen recuperacion:leer; KanbanBoard condiciona Kanban/KPIs a enabled: puedeVerKanban, conmuta a vista recuperacion y despliega el módulo	CORREGIDO	24/11/2026 02:00	25/11/2026 22:50	fix(recuperacion): sincronizar develop y resolver BUG-H73-WEB-01, 02 y 03
BUG-H73-WEB-03	Filtrado por rango temporal (fechaDesde y fechaHasta) en formato ISO 8601 y validación de rango	Funcional / Filtros	Servicio / UI	Alta	Operativos registrados el 2026-11-24 y controles de fecha en OperativosRecuperacionFiltros	Selección Desde: 2026-11-24, Hasta: 2026-11-24 en OperativosRecuperacionFiltros y llamada a listarOperativosRecuperacion	Conversión a límites ISO 8601 del día (T00:00:00.000 a T23:59:59.999 local) y restricción min/max entre ambos controles	toIsoBoundary transforma YYYY-MM-DD a ISO UTC inicio/fin del día local y OperativosRecuperacionFiltros aplica max/min; verificado en recuperacionService.test.ts y OperativosRecuperacionFiltros.test.tsx	CORREGIDO	24/11/2026 02:00	25/11/2026 22:50	fix(recuperacion): sincronizar develop y resolver BUG-H73-WEB-01, 02 y 03
BUG-H73-WEB-04	Persistencia bidireccional de vista, filtros y paginación en URLSearchParams y chips activos H34 (CA-1, CA-3)	Contrato H34 / UX	Hook / Filtros	Alta	Encargado en /gestion/centro-incidentes selecciona pestaña Recuperación, aplica filtros y cambia a página 2	Cambio de pestaña a recuperacion, ?vista=recuperacion&page=2&limit=25&estado=EN_EJECUCION&prioridad=ALTA y renderizado de ActiveFilterChips	Sincronización bidireccional en URLSearchParams vía replaceState (incluyendo pestaña vista) y despliegue de chips removibles con nombres legibles	KanbanBoard.tsx persiste vista y limpia query params al salir; useOperativosRecuperacion.ts hidrata y sincroniza URLSearchParams; OperativosRecuperacionFiltros.tsx renderiza ActiveFilterChips (validado en useOperativosRecuperacion.test.ts y OperativosRecuperacionFiltros.test.tsx)	CORREGIDO	24/11/2026 02:00	26/11/2026 14:26	fix(recuperacion): resolver BUG-H73-WEB-04, 05, 06 y 07 de QA
BUG-H73-WEB-05	Estabilidad de salas Socket.io entre pestañas, efecto de carga en Drawer y prevención de doble petición en búsqueda	Tiempo Real / Rendimiento	Hook / Drawer	Media	KanbanBoard montado con WebSocket conectado; drawer abierto o búsqueda desde page=2	Alternancia recuperacion -> kanban, re-render con cambio de referencia en onCerrar del drawer y búsqueda con debounceMs=350	Preservación de salas encargado, sala:encargados y mapa, sin re-fetch en drawer por re-renders externos y una sola consulta debounced al buscar	activeRecuperacionSubscribers evita abandonar salas si hay otro suscriptor activo; OperativoRecuperacionDrawer usa onCerrarRef/toastRef con [operativoId]; FilterSearchInput aplica debounceMs=350 previo a setPage(1) (verificado en useRecuperacionSocket.test.ts y OperativoRecuperacionDrawer.test.tsx)	CORREGIDO	24/11/2026 02:00	26/11/2026 14:26	fix(recuperacion): resolver BUG-H73-WEB-04, 05, 06 y 07 de QA
BUG-H73-WEB-06	Manejo de estado de error con reintento, botón Limpiar filtros en estado vacío, prop refreshSignal y fallback territorial	Resiliencia / UX	Vista / Tabla	Media	Error HTTP 500/400 en listado, búsqueda sin coincidencias o fallback territorial sin /api/catalogos	Rechazo HTTP 500 en listarOperativosRecuperacion, URL ?estado=COMPLETADA vacía, refreshSignal: 0 -> 1, DELEGACIONES_VALDIVIA_DEFAULT y cantidadInsumosAsignados: 1	Banner de error dedicado con botón Reintentar sin EmptyState falso; Limpiar filtros en vacío; conexión de refreshSignal; UUIDs válidos en fallback; 1 unidad y soporte teclado	OperativosRecuperacionView separa errorState con Reintentar y añade Limpiar filtros en EmptyState; KanbanBoard pasa refreshSignal; fallback usa UUIDs v4 30000000-...; tabla singulariza 1 unidad y soporta Enter/Espacio (verificado en suites View, Tabla y Hook)	CORREGIDO	24/11/2026 02:00	26/11/2026 14:26	fix(recuperacion): resolver BUG-H73-WEB-04, 05, 06 y 07 de QA
BUG-H73-WEB-07	Completitud de manual de usuario (docs/manuals/), limpieza de código muerto, CSS Modules y cobertura unitaria	Documentación / Calidad	Manual / Tests	Media	Revisión de entregables de HU-73 en docs/manuals/, estilos y suites Vitest	Inspección de H73-listar-operativos-recuperacion.md, recuperacionLabels.ts, recuperacion.ts, KanbanViewSwitcher.tsx, CSS Modules y 8 suites Vitest	Coherencia total entre manual y drawer, eliminación de código muerto/estilos inline y suites unitarias dedicadas para filtros, tabla, drawer y hook	Manual alineado con columnas Recurso y Cantidad asignada sin marcas pendientes; eliminados exports/CSS sin uso y style={{}} inline; Chip size md aplicado en drawer; 8/8 suites (45/45 tests pass). (Observación menor no bloqueante: assets/ mantiene .gitkeep sin .png)	CORREGIDO	24/11/2026 02:00	26/11/2026 14:26	fix(recuperacion): resolver BUG-H73-WEB-04, 05, 06 y 07 de QA
CP-H73-WEB-01	Despliegue del selector de pestaña "Recuperación" en KanbanViewSwitcher y lectura inicial de ?vista=recuperacion (CA-1)	Funcional / UI	Componente	Alta	Usuario autenticado en /gestion/centro-incidentes	Renderizado de KanbanViewSwitcher con vistaActiva="kanban" y clic en botón Recuperación; URL ?vista=recuperacion	Renderiza botón Recuperación con aria-pressed reactivo e invoca onCambiarVista('recuperacion'); KanbanBoard lee ?vista=recuperacion al iniciar	Verificado en KanbanViewSwitcher.test.tsx (4/4 tests pass en 497ms) con clases CSS Modules y en KanbanBoard.tsx	APROBADO	24/11/2026 02:00	26/11/2026 14:26	feat(recuperacion): listar y consultar operativos de recuperacion (HU-73)
CP-H73-WEB-02	Aislamiento visual de la subvista Recuperación ocultando KPIs y filtros propios del tablero Kanban (CA-1)	Funcional / UI	Vista	Media	Usuario en /gestion/centro-incidentes cambia a pestaña Recuperación	vistaActiva === 'recuperacion' en KanbanBoard.tsx	Oculta IncidentesKpiCards y KanbanFiltros para ceder espacio a la barra de herramientas y filtros de OperativosRecuperacionView	Verificado en KanbanBoard.tsx tras integración con develop y actualización de cambiarVistaActiva	APROBADO	24/11/2026 02:00	26/11/2026 14:26	feat(recuperacion): listar y consultar operativos de recuperacion (HU-73)
CP-H73-WEB-03	Despliegue de columnas obligatorias en OperativosRecuperacionTabla (CA-2)	Funcional / UI	Componente / Tabla	Crítica	Listado con operativos cargado en OperativosRecuperacionView	Registro REC-2026-0001, "Entrega de Materiales y Remoción", "Delegación de la Costa", EN_EJECUCION, 130 insumos, 2026-11-14T15:00:00.000Z	Muestra Código, Título/Sector, Delegación, Estado, Prioridad, Insumos Asignados, Fecha de Registro en formato dd/MM/yyyy HH:mm y Acciones	Verificado en OperativosRecuperacionView.test.tsx (4/4), OperativosRecuperacionTabla.test.tsx (1/1) y OperativosRecuperacionTabla.tsx	APROBADO	24/11/2026 02:00	26/11/2026 14:26	feat(recuperacion): listar y consultar operativos de recuperacion (HU-73)
CP-H73-WEB-04	Renderizado de badges semánticos de estado y prioridad con Chip estándar en paleta municipal sin emojis (CA-2)	UI / Diseño	Componente / CSS	Alta	Registros con estados PLANIFICADA, EN_EJECUCION, COMPLETADA, CANCELADA	Uso de Chip size="sm" en tabla y Chip size="md" en drawer con VARIANTE_ESTADO_RECUPERACION y obtenerVarianteChipPrioridad	Badges rectangulares estándar (--radius-none: 0px) en sentence-case con colores semánticos unificados e íconos lucide-react sin emojis ni clases CSS muertas	Verificado en OperativosRecuperacionTabla.tsx, OperativoRecuperacionDrawer.tsx, OperativosRecuperacion.module.css y suites UI (45/45 tests pass)	APROBADO	24/11/2026 02:00	26/11/2026 14:26	refactor(recuperacion): usar componente Chip estandar en tabla de operativos
CP-H73-WEB-05	Visualización cuantitativa (plural y singular) y desglose resumido de insumos asignados en celda de tabla (CA-2)	Funcional / UI	Componente / Tabla	Alta	Operativos con cantidadInsumosAsignados: 130 y 1, más recursosResumen	cantidadInsumosAsignados: 1 ("1 unidad") y 130 ("130 unidades", recursosResumen: [{ nombre: 'Planchas de Zinc', cantidadAsignada: 120 }, { nombre: 'Frazadas', cantidadAsignada: 10 }])	Muestra "130 unidades" o "1 unidad" singularizado en negrita (con fallback ?? 0) y resumen con atributo title completo	Verificado en OperativosRecuperacionTabla.test.tsx ("1 unidad") y OperativosRecuperacionView.test.tsx ("130 unidades")	APROBADO	24/11/2026 02:00	26/11/2026 14:26	fix(recuperacion): resolver BUG-H73-WEB-04, 05, 06 y 07 de QA
CP-H73-WEB-06	Controles de paginación estándar H34 (Pagination) con cambio de página y tamaño (10, 25, 50) (CA-1)	Funcional / Paginación	Componente / Hook	Alta	Respuesta con meta: { page: 1, limit: 10, total: 25, totalPages: 3, hasNext: true, hasPrev: false }	Clic en Siguiente (setPage(2)), selección de límite 25 (setLimit(25)) y lectura desde URL ?page=2&limit=25	Muestra rango "Mostrando 1 a 10 de 25 operativos", cambia página/límite sincronizado con URL y reinicia page a 1 al modificar filtros	Verificado en OperativosRecuperacionView.tsx y useOperativosRecuperacion.test.ts (3/3 pass)	APROBADO	24/11/2026 02:00	26/11/2026 14:26	feat(recuperacion): listar y consultar operativos de recuperacion (HU-73)
CP-H73-WEB-07	Ordenamiento interactivo por Código y Fecha de Registro en cabeceras de tabla (CA-1)	Funcional / UI	Componente / Hook	Media	Tabla renderizada con ordenarPor='creadoEn', orden='desc'	Clic en botón de cabecera Código (onToggleOrden('codigo')) y clic posterior	Cambia criterio a codigo ascendente (ArrowUp), luego alterna a descendente (ArrowDown) y reinicia page a 1	Verificado en OperativosRecuperacionTabla.test.tsx (1/1) y useOperativosRecuperacion.test.ts (toggleOrden('codigo'))	APROBADO	24/11/2026 02:00	26/11/2026 14:26	feat(recuperacion): listar y consultar operativos de recuperacion (HU-73)
CP-H73-WEB-08	Filtrado por delegación municipal, estado, prioridad, búsqueda debounced, chips activos y "Limpiar filtros" (CA-3)	Funcional / Filtros	Componente / Hook	Alta	Barra OperativosRecuperacionFiltros montada con catálogo de delegaciones	estado='EN_EJECUCION', delegacionId, fechaDesde/fechaHasta, clic en chip individual y clic en "Limpiar filtros"	Actualiza URL y chips activos removibles (ActiveFilterChips), aplica debounceMs=350 en búsqueda, min/max en fechas y limpia criterios sin doble request	Verificado en OperativosRecuperacionFiltros.test.tsx (2/2), OperativosRecuperacionView.test.tsx (4/4) y useOperativosRecuperacion.test.ts (3/3)	APROBADO	24/11/2026 02:00	26/11/2026 14:26	fix(recuperacion): resolver BUG-H73-WEB-04, 05, 06 y 07 de QA
CP-H73-WEB-09	Apertura de OperativoRecuperacionDrawer al hacer clic en fila, tecla Enter/Espacio o botón Detalle sin doble disparo (CA-4)	Funcional / UI	Componente / Drawer	Crítica	Tabla con fila op-1 (REC-2026-0001) visible	Clic sobre texto REC-2026-0001, pulsación Enter sobre tr y clic en Button Detalle	Invoca onSelectOperativo('op-1'), consulta obtenerDetalleOperativoRecuperacion('op-1') una vez y celda de acciones detiene propagación con stopPropagation()	Verificado en OperativosRecuperacionView.test.tsx (4/4) y OperativosRecuperacionTabla.test.tsx (1/1)	APROBADO	24/11/2026 02:00	26/11/2026 14:26	feat(recuperacion): listar y consultar operativos de recuperacion (HU-73)
CP-H73-WEB-10	Visualización en Drawer de detalles generales (con Chip size="md"), delegación/misión/patrulla, tabla de recursos e historial cronológico (CA-4)	Funcional / UI	Componente / Drawer	Crítica	OperativoRecuperacionDrawer abierto para op-1 con 200 OK	detalle con mision: MIS-2026-0010, patrulla: Patrulla Costa, recursos: [{ nombre: 'Planchas de Zinc', cantidadAsignada: 120 }] e historial	Despliega código, título, chips de estado/prioridad, 4 secciones institucionales, tabla (Recurso, Cantidad asignada) e historial sin re-fetch por re-renders externos	Verificado en OperativosRecuperacionView.test.tsx (4/4) y OperativoRecuperacionDrawer.test.tsx (2/2)	APROBADO	24/11/2026 02:00	26/11/2026 14:26	fix(recuperacion): resolver BUG-H73-WEB-04, 05, 06 y 07 de QA
CP-H73-WEB-11	Cierre del drawer por tecla Escape, backdrop o botón X y manejo automático de 404 Not Found (CA-4)	Usabilidad / Resiliencia	Componente / Drawer	Media	OperativoRecuperacionDrawer abierto con operativoId !== null	Pulsación de tecla Escape, clic en backdrop o respuesta 404 en obtenerDetalleOperativoRecuperacion	Cierra panel mediante onCerrarRef.current() sin re-disparar efecto de carga, y ante 404 notifica error vía toast y cierra el drawer	Verificado en OperativoRecuperacionDrawer.test.tsx (2/2 pass: estabilidad onCerrar, Escape y 404 automático)	APROBADO	24/11/2026 02:00	26/11/2026 14:26	fix(recuperacion): resolver BUG-H73-WEB-04, 05, 06 y 07 de QA
CP-H73-WEB-12	Despliegue de AccesoDenegadoState en OperativosRecuperacionView cuando la API rechaza con 403 Forbidden	Seguridad / RBAC	Vista / Servicio	Crítica	Usuario sin permiso recuperacion:leer consultando el módulo	listarOperativosRecuperacion rechaza con RecuperacionServiceError(..., { statusCode: 403 })	recuperacionService lanza statusCode: 403, hook marca esForbidden: true y vista renderiza AccesoDenegadoState mencionando recuperacion:leer	Verificado en recuperacionService.test.ts, useOperativosRecuperacion.test.ts y OperativosRecuperacionView.test.tsx	APROBADO	24/11/2026 02:00	26/11/2026 14:26	feat(recuperacion): listar y consultar operativos de recuperacion (HU-73)
CP-H73-WEB-13	Envío limpio de parámetros H34 y manejo de respuestas 200, 401, 403, 404 en recuperacionService (CA-5)	Integración / DAL	Servicio	Crítica	Cliente apiClient.GET tipado con paths['/api/eventos-atp/recuperacion']	listarOperativosRecuperacion({ page: 1, limit: 10, estado: 'EN_EJECUCION', busqueda: '  REC-2026  ', fechaDesde: '2026-11-24', fechaHasta: '2026-11-24' })	Limpia espacios con trim(), convierte fechas vía toIsoBoundary, omite vacíos, retorna { data, meta } H34 y propaga errores HTTP	Verificado en recuperacionService.test.ts (20/20 tests pass en 45ms)	APROBADO	24/11/2026 02:00	26/11/2026 14:26	fix(recuperacion): sincronizar develop y resolver BUG-H73-WEB-01, 02 y 03
CP-H73-WEB-14	Validación en vivo de endpoints GET /api/eventos-atp/recuperacion y /{id} contra sgrai-api (CA-5)	Integración API	cURL / Backend	Crítica	Servidor sgrai-api activo en http://localhost:3001 con fixture H73 sembrado	Peticiones cURL con x-user-id Encargado, Call Center y anónimo a listado y detalle (73100000-...-0001, UUID inexistente, ID inválido)	401 sin auth, 200 Encargado con 6 registros y meta H34, 403 Call Center (recuperacion:leer), 200 detalle, 404 inexistente, 400 no UUID	Verificado en ciclo inicial (24/11/2026); respuestas HTTP/JSON coinciden con OpenAPI H34/H73 (servidor sgrai-api fuera de línea durante Re-Tests)	APROBADO	24/11/2026 02:00	-	fix(types): preservar contratos de develop y agregar endpoints HU-73 en api-generated
CP-H73-WEB-15	Verificación estática (tsc --noEmit, eslint, next build) y ejecución global de Vitest en la rama	Calidad / CI	Sistema	Alta	Rama feature/H73-listar-operativos-recuperacion sincronizada y con correcciones finales aplicadas	npx tsc --noEmit, npm run lint, npm run build y npm test	Código de salida 0 en chequeo de tipos, linter, build sin Google Fonts y 100% de pruebas unitarias	tsc (0 errores), lint (0 errores), next build (49/49 rutas, OK: sin Google Fonts) y vitest (143/143 archivos, 1017/1017 tests pass en 34.73s; 8/8 suites de recuperación 45/45 pass)	APROBADO	24/11/2026 02:00	26/11/2026 14:26	fix(recuperacion): resolver BUG-H73-WEB-04, 05, 06 y 07 de QA
```

---

## 5. Guía de Ejecución Paso a Paso y Evidencias Replicables (Re-Test Final)

### 5.1. Verificación Estática: TypeScript, ESLint, Fuentes Locales y Build de Producción

```bash
npx tsc --noEmit && npm run lint && npm run build && (grep -rn "next/font/google" src || echo "OK: sin Google Fonts")
```

**Salida obtenida:**
```text
npm notice run sgrai-web@0.9.0 npx
npm notice run 'tsc' --noEmit
npm notice run sgrai-web@0.9.0 lint
npm notice run eslint
npm notice run sgrai-web@0.9.0 build
npm notice run next build --webpack
▲ Next.js 16.3.4 (webpack)
- Environments: .env.local
✓ Running next.config.ts took 26ms

  Creating an optimized production build ...
✓ Compiled successfully in 6.8s
  Finished TypeScript in 8.1s
✓ Collecting page data using 15 workers in 722ms
✓ Generating static pages using 15 workers (49/49) in 1085ms
✓ Collecting build traces in 12.8s
✓ Finalizing page optimization in 12.9s

OK: sin Google Fonts
```

### 5.2. Auditoría de Sincronización Git frente a `develop` (`BUG-H73-WEB-01`)

```bash
git merge-base develop HEAD
git log --oneline --no-merges HEAD..develop
```

**Salida clave observada en Re-Test:**
- `git log --oneline --no-merges HEAD..develop` no reporta commits pendientes de integrar (`develop` integrado al 100% preservando `layout.tsx`, `eslint.config.mjs`, contratos HU-32/HU-37/HU-61/HU-69 y rutas de `src/types/api-generated.d.ts`).

### 5.3. Ejecución de Pruebas Automatizadas HU-73 y Suite Global (Vitest)

#### Pruebas filtradas por nombre (`npm test -- -t "..."`)

```bash
npm test -- -t "OperativosRecuperacion"
```

**Salida obtenida:**
```text
 ✓ src/components/mando/recuperacion/__tests__/OperativosRecuperacionView.test.tsx (4 tests) 1144ms
   ✓ OperativosRecuperacionView (HU-73) > debe renderizar la tabla con los operativos y abrir el drawer al hacer clic en una fila  707ms
 ✓ src/components/mando/recuperacion/__tests__/OperativosRecuperacionFiltros.test.tsx (2 tests) 554ms
   ✓ OperativosRecuperacionFiltros (HU-73) > debe renderizar ActiveFilterChips para los filtros activos y permitir remover uno individualmente  489ms
 ✓ src/components/mando/recuperacion/__tests__/OperativosRecuperacionTabla.test.tsx (1 test) 415ms
   ✓ OperativosRecuperacionTabla (HU-73) > debe singularizar 1 unidad y soportar selección por teclado en la fila  412ms
 ✓ src/hooks/__tests__/useOperativosRecuperacion.test.ts (3 tests) 368ms
 ✓ src/services/__tests__/recuperacionService.test.ts (20 tests | 17 skipped) 12ms

 Test Files  5 passed | 138 skipped (143)
      Tests  13 passed | 1004 skipped (1017)
   Duration  24.34s
```

#### Ejecución directa de las 8 suites relacionadas con HU-73 y Recuperación

```bash
npx vitest run \
  src/services/__tests__/recuperacionService.test.ts \
  src/components/mando/__tests__/KanbanViewSwitcher.test.tsx \
  src/components/mando/recuperacion/__tests__/OperativosRecuperacionView.test.tsx \
  src/components/mando/recuperacion/__tests__/OperativosRecuperacionFiltros.test.tsx \
  src/components/mando/recuperacion/__tests__/OperativosRecuperacionTabla.test.tsx \
  src/components/mando/recuperacion/__tests__/OperativoRecuperacionDrawer.test.tsx \
  src/hooks/__tests__/useOperativosRecuperacion.test.ts \
  src/hooks/__tests__/useRecuperacionSocket.test.ts
```

**Salida obtenida:**
```text
 ✓ src/hooks/__tests__/useRecuperacionSocket.test.ts (9 tests) 78ms
 ✓ src/services/__tests__/recuperacionService.test.ts (20 tests) 45ms
 ✓ src/hooks/__tests__/useOperativosRecuperacion.test.ts (3 tests) 348ms
 ✓ src/components/mando/recuperacion/__tests__/OperativoRecuperacionDrawer.test.tsx (2 tests) 231ms
 ✓ src/components/mando/recuperacion/__tests__/OperativosRecuperacionTabla.test.tsx (1 test) 491ms
 ✓ src/components/mando/__tests__/KanbanViewSwitcher.test.tsx (4 tests) 497ms
 ✓ src/components/mando/recuperacion/__tests__/OperativosRecuperacionFiltros.test.tsx (2 tests) 561ms
 ✓ src/components/mando/recuperacion/__tests__/OperativosRecuperacionView.test.tsx (4 tests) 1025ms

 Test Files  8 passed (8)
      Tests  45 passed (45)
   Duration  4.28s
```
*(Nota técnica: `OperativosRecuperacionView.test.tsx`, `OperativosRecuperacionFiltros.test.tsx`, `OperativosRecuperacionTabla.test.tsx`, `OperativoRecuperacionDrawer.test.tsx` y `useOperativosRecuperacion.test.ts` finalizan limpios sin advertencias de `act(...)`; `useRecuperacionSocket.test.ts` emite advertencias no bloqueantes en casos preexistentes de HU-29/HU-32 mientras el caso `BUG-H73-WEB-05` ejecuta limpio).*

#### Suite Global del Repositorio

```bash
npm test
```

**Salida obtenida:**
```text
 Test Files  143 passed (143)
      Tests  1017 passed (1017)
   Duration  34.73s
```

### 5.4. Evidencia de Referencia de Integración HTTP con `sgrai-api` (Ejecución Inicial 24/11/2026)

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

#### Escenario D: Normalización Horaria de Fechas (`BUG-H73-WEB-03`)
```bash
curl -s "http://localhost:3001/api/eventos-atp/recuperacion?fechaDesde=2026-11-24&fechaHasta=2026-11-24" \
  -H "x-user-id: 00000000-0000-4000-8000-000000000003"
```

**Comportamiento verificado:** Previo al fix (24/11/2026), el servicio enviaba cadenas `YYYY-MM-DD` sin componente horario interpretadas como `00:00:00Z`. Tras el fix (`toIsoBoundary`), `recuperacionService.ts` transforma ambos extremos al inicio y fin del día local en formato ISO 8601 UTC (`T00:00:00.000` a `T23:59:59.999` UTC), validado mediante pruebas unitarias.

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

| Criterio de Aceptación (CA) | Cobertura en Casos de Prueba | Estado Final | Observación Técnica (Re-Test Final 26/11) |
|---|---|:---:|---|
| **CA-1:** El sistema debe proveer una vista tabular en `/gestion/centro-incidentes` (pestaña o subvista Recuperación) bajo el estándar de contratos H34 (`page`, `limit`, `total`, `totalPages`). | `CP-H73-WEB-01`, `CP-H73-WEB-02`, `CP-H73-WEB-06`, `CP-H73-WEB-07`, `BUG-H73-WEB-01`, `BUG-H73-WEB-02`, `BUG-H73-WEB-04` | **Cumple** | Pestaña integrada con persistencia en `URLSearchParams` (`?vista=recuperacion`, filtros, ordenamiento, paginación), RBAC operativo para Supervisor y sincronización completa con `develop`. |
| **CA-2:** La tabla debe mostrar: Código de evento, Título descriptivo, Delegación, Estado (`PLANIFICADA`, `EN_EJECUCION`, `COMPLETADA`, `CANCELADA`), Cantidad de insumos asignados y Fecha de registro. | `CP-H73-WEB-03`, `CP-H73-WEB-04`, `CP-H73-WEB-05`, `BUG-H73-WEB-06`, `BUG-H73-WEB-07` | **Cumple** | Todas las columnas requeridas se muestran correctamente con componente estándar `<Chip />`, singularización (`1 unidad` / `N unidades`) y navegación por teclado en filas. |
| **CA-3:** Debe permitir filtrar por: delegación municipal, estado del operativo y búsqueda textual por código o título. | `CP-H73-WEB-08`, `BUG-H73-WEB-03`, `BUG-H73-WEB-04`, `BUG-H73-WEB-05`, `BUG-H73-WEB-06` | **Cumple** | Todos los filtros (incluida prioridad y rango ISO de fechas con `min`/`max`), chips activos removibles (`<ActiveFilterChips />`), debounce único de `350ms`, fallback UUID y limpieza en estado vacío operan correctamente. |
| **CA-4:** Al hacer clic en un registro, debe abrirse un drawer lateral con el detalle de recursos asignados e historial. | `CP-H73-WEB-09`, `CP-H73-WEB-10`, `CP-H73-WEB-11`, `BUG-H73-WEB-05`, `BUG-H73-WEB-07` | **Cumple** | El drawer despliega detalles generales con `<Chip size="md" />`, delegación/misión/patrulla, tabla (`Recurso`, `Cantidad asignada`) e historial sin re-fetch por re-renders del padre y alineado con el manual. |
| **CA-5:** El endpoint `GET /api/eventos-atp/recuperacion` debe soportar los filtros y responder bajo estándar H34. | `CP-H73-WEB-13`, `CP-H73-WEB-14`, `BUG-H73-WEB-01`, `BUG-H73-WEB-03` | **Cumple** | Contratos OpenAPI HU-32 y HU-73 coexisten sin regresiones y la normalización temporal H34 (`toIsoBoundary`) y manejo de errores HTTP cumplen el contrato. |

---

## 7. Dictamen Final de Re-Test QA

**Dictamen:** **`APPROVED` — Autorizado para merge a `develop`.**

En el ciclo de **Re-Test Final (26/11/2026)** se certifica el cierre efectivo del **100% de los defectos registrados** (`BUG-H73-WEB-01` a `BUG-H73-WEB-07`), logrando **22 de 22 casos aprobados/corregidos (`100.0%`)**, cero errores de TypeScript (`tsc --noEmit`), ESLint (`npm run lint`) y compilación de producción (`next build --webpack`, `49/49` rutas sin `next/font/google`), junto con la ejecución exitosa de los **143 archivos y 1017 pruebas unitarias** del repositorio (`45/45` en los 8 archivos del dominio de recuperación/HU-73). Se recomienda como mejora opcional no bloqueante adjuntar capturas de pantalla reales en `docs/manuals/assets/H73-listar-operativos-recuperacion/` cuando el entorno integrado se encuentre desplegado.
