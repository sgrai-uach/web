# Auditoría Técnica y Matriz de Casos de Prueba (QA): HU-38 — Evaluación Técnica en Terreno, Prioridad Sugerida y Reportes en Centro de Mando (`sgrai-web`)

> **Documento Oficial de Aseguramiento de Calidad (QA) — Frontend Web**  
> **Proyecto:** Sistema de Gestión de Recursos para Atención de Incidentes (SGRAI) — Dirección de Gestión de Riesgos de Desastres (DGRD), Ilustre Municipalidad de Valdivia.  
> **Módulo:** Centro de Mando / Tablero Kanban, Panel Lateral de Incidente y Detalle de Misión (`sgrai-web` — `/gestion/centro-incidentes`).  
> **Historia de Usuario:** HU-38 — *"Como Patrulla verificadora Quiero asignar o modificar la prioridad del incidente basándose en la sugerencia del sistema y la evaluación técnica en terreno Para garantizar que los recursos tácticos pesados y cuadrillas se destinen prioritariamente a las emergencias con mayor nivel de gravedad."*  
> **Desarrollador Asignado:** `zetastormy`  
> **Responsable de Auditoría:** Liderazgo de Aseguramiento de Calidad (QA Lead) — Proyecto SGRAI  
> **Servicio Auditado:** `sgrai-web` (Next.js 16.3.4 App Router + React 19 + TypeScript + Vitest v3.2.7 + Testing Library + Socket.io Client + CSS Modules).  
> **Rama Git Evaluada:** `feature/h38-patrulla-asignar-prioridad`  
> **Commits Evaluados en la Rama:**  
> * `feat(utils): incorporar formateadores amigables de estados, prioridades e hitos operativos`
> * `feat(kanban): actualizar tipología, prioridad y justificación reactivamente vía websocket (#39)`
> * `feat(ui): reflejar reclasificación en terreno en tarjeta kanban y drawer de detalle`
> * `fix(kanban): asegurar persistencia del chip verificado al paginar y refrescar`
> * `feat(mando): estandarizar tarjetas de reporte y desplegar afectacion de multiples familias (H38)`
> * `fix(notifications): deduplicar eventos websocket y toasts repetidos de patrullas e incidentes`
> * `fix(mando): especificar cuando la tipologia no fue modificada por la patrulla y deduplicar socket kanban`
> * `refactor(mando): estandarizar tarjetas y cabecera unificada de reportes de terreno (H37/H38)`
> * `fix(mando): humanizar enums y descripciones en bitacora cronologica de mision`
>  
> **Fecha y Hora de Auditoría Inicial:** `17/11/2026 14:28 -03:00`  
> **Estado de Certificación:** 🔴 **RECHAZADO EN CODE REVIEW / CHANGES REQUESTED (8 Defectos Detectados Abiertos)**.

---

## Alcance Arquitectónico en `sgrai-web`

De acuerdo con la arquitectura del ecosistema SGRAI (`GEMINI.md §1`), el formulario de evaluación demográfica en terreno y la ejecución de `POST /api/incidentes/{id}/prioridad/calcular` y `PATCH /api/incidentes/{id}/prioridad` (protegidos con el permiso RBAC `misiones:terreno:verificar`) residen en `sgrai-pwa` (`web-app`) y `sgrai-api`.

En el cliente web del Centro de Mando (`sgrai-web`), el alcance evaluado para HU-38 corresponde a la contraparte operativa de monitoreo y trazabilidad para el Encargado de Operaciones:

- Recepción en tiempo real del evento WebSocket `incidente:actualizado` en `useEncargadoKanbanSocket` y `useIncidentesKanban`, actualizando el badge de prioridad en el Tablero Kanban (`BAJA`, `MEDIA`, `ALTA`, `CRITICA` en Sentence Case) y notificando vía Toast diferenciado (`Reporte #1` vs `Reporte #N — Rectificación`).
- Visualización de prioridad vigente, indicador de ajuste manual (`Ajustada`), tooltip comparativo con `prioridadSugerida` y `justificacionPrioridad`, y contador de reportes (`1 reporte` / `N reportes · Rectificado`) en `IncidenteCard.tsx`.
- Exposición comparativa en `IncidenteDetalleHeader.tsx`, sección consolidada `IncidenteUltimoReporteSection.tsx`, bloque de acceso rápido `Último Reporte Realizado` en `IncidenteMisionesSection.tsx` y actualización en vivo dentro de `IncidenteDetalleDrawer.tsx`.
- Despliegue cronológico de reportes versionados (`Vigente` / `Histórico`), comparativa de prioridad sugerida vs. confirmada, justificación técnica, desglose por múltiples familias/hogares, riesgos activos y bitácora humanizada en `MisionDetalleModal.tsx`, `MisionReportesSection.tsx` y `MisionBitacoraSection.tsx`.

---

## 1. Resumen Ejecutivo

Tras realizar la inspección forense del código en la rama `feature/h38-patrulla-asignar-prioridad`, ejecutar el análisis estático (`eslint`, `tsc --noEmit`), validar el empaquetado productivo (`next build`), correr la suite completa y filtrada de Vitest (`861/861` pruebas unitarias/componentes con mocks) y contrastar la capa de servicios y contratos WebSocket frente a la instancia activa de `sgrai-api` (`http://127.0.0.1:3001`), se dictamina el estado **RECHAZADO EN CODE REVIEW (`Changes Requested`)**.

Se detectaron **8 defectos reales abiertos** (`2` Críticos, `4` Altos y `2` Medios) que impiden aprobar la integración hacia `develop`.

| Métrica / Verificación | Resultado Obtenido | Observaciones Técnicas |
|---|:---:|---|
| **Total de Casos de Prueba en Matriz** | **24** | `8` Defectos Abiertos (`BUG-H38-WEB-01` a `08`) + `16` Casos Aprobados (`CP-H38-WEB-01` a `16`) |
| **Casos Aprobados (`APROBADO`)** | **16** | Cobertura UI unitaria con mocks, compilación TypeScript, build Next.js y consultas autenticadas en vivo |
| **Defectos Abiertos (`ABIERTO`)** | **8** | **2 Críticos, 4 Altos, 2 Medios** |
| **Casos Bloqueados (`BLOQUEADO`)** | **0** | Sin bloqueos de infraestructura |
| **Tasa de Aprobación Global (% Pass)** | **66.7%** | Se requiere alcanzar el `100.0%` (`0` defectos abiertos) en ciclo de Re-Test para aprobar merge a `develop` |
| **Análisis Estático ESLint (`npm run lint`)** | 🔴 **FALLIDO (9 errores, 17 warnings)** | `IncidentesKpiCards.tsx` (1), `KanbanBoard.tsx` (1 error + 5 warnings), `MisionReportesSection.tsx` (3), `ToastItem.tsx` (1), `useIncidentesKanban.test.ts` (3) |
| **Chequeo de Tipos Estáticos (`npx tsc --noEmit`)** | 🟢 **0 errores** | Exit code `0`; no obstante, descansa en extensiones manuales fuera de `api-generated.d.ts` (`BUG-H38-WEB-04`) |
| **Build de Producción (`npm run build`)** | 🟢 **APROBADO (exit 0)** | `Compiled successfully in 11.5s`, `Finished TypeScript in 7.8s`, `47/47` páginas estáticas generadas |
| **Suite Global Vitest (`npm test -- --run`)** | 🟢 **128/128 archivos, 861/861 tests** | Duración `35.38s` (con mocks de API/Socket; no detecta las regresiones de contrato vivo ni de lint) |
| **Subconjunto HU-38 (`npx vitest run` 11 suites)** | 🟢 **11/11 archivos, 103/103 tests** | Duración `6.41s`; filtro `-t "HU-38"` ejecuta `4` pruebas específicas (`857 skipped`) |
| **Contrato OpenAPI (`api-generated.d.ts`)** | 🔴 **DESINCRONIZADO** | Faltan `/api/incidentes/{id}/prioridad`, `/calcular` y esquemas HU-38 presentes en `/openapi.json` (`v0.10.0`) |
| **Integración Auth JWT contra `sgrai-api` vivo** | 🔴 **401 en KPIs y Misiones** | `obtenerKpis` y `misionesService.listar` omiten `Authorization: Bearer` al no haber sincronizado `develop` |

---

## 2. Registro Técnico de Defectos Detectados

### `BUG-H38-WEB-01` — Fallo Bloqueante de ESLint (`npm run lint`) con 9 Errores de React Compiler, Hooks y TypeScript Estricto
* **Severidad:** **Crítica** (Bloqueante de CI/CD y calidad estática).
* **Estado:** `ABIERTO`.
* **Archivos Afectados:**
  * `src/components/mando/IncidentesKpiCards.tsx` (línea 120)
  * `src/components/mando/KanbanBoard.tsx` (líneas 108, 116, 240, 282, 347, 368)
  * `src/components/mando/mision/MisionReportesSection.tsx` (líneas 395, 400, 425)
  * `src/components/ui/ToastItem.tsx` (línea 48)
  * `src/hooks/__tests__/useIncidentesKanban.test.ts` (líneas 13, 14, 15)
* **Descripción Técnica:**  
  Al ejecutar `npm run lint`, ESLint aborta con código de salida `1` reportando **9 errores bloqueantes** y **17 advertencias**:
  1. `IncidentesKpiCards.tsx:120`: `setIsMounted(true)` invocado síncronamente dentro de `useEffect` (`react-hooks/set-state-in-effect`).
  2. `KanbanBoard.tsx:108`: `setIncidenteSeleccionadoId` es referenciado dentro de `handleMisionRechazadaSocket` antes de ser declarado en la línea 371 (`react-hooks/immutability`), además de `react-hooks/exhaustive-deps` en 4 callbacks (líneas 116, 240, 282, 347) y variable no usada `ultimoEvento` (línea 368).
  3. `MisionReportesSection.tsx:395, 400, 425`: 3 errores `react-hooks/preserve-manual-memoization` donde React Compiler no puede preservar `useMemo` para `idAbiertoPorDefecto` e `itemsUnificados` porque la referencia derivada `hitoReclasificacion` se calcula fuera de `useMemo` a partir de `bitacora`.
  4. `ToastItem.tsx:48`: `useRef<number>(Date.now())` invoca la función impura `Date.now()` durante el render (`react-hooks/purity`).
  5. `useIncidentesKanban.test.ts:13-15`: 3 usos explícitos de `any` en `socketCallbacks` (`@typescript-eslint/no-explicit-any`).
* **Pasos para Reproducir:**
  1. Situarse en la raíz del repositorio `web` en la rama `feature/h38-patrulla-asignar-prioridad`.
  2. Ejecutar `npm run lint`.
* **Comportamiento Actual:** El comando finaliza con código `1` y `✖ 26 problems (9 errors, 17 warnings)`.
* **Comportamiento Esperado:** `npm run lint` debe finalizar con `0 errors` en todos los archivos modificados o añadidos por la rama.
* **Sugerencia Técnica de Solución:**
  * En `IncidentesKpiCards.tsx`, reemplazar `useState`/`useEffect` de montaje por `useSyncExternalStore(() => () => {}, () => true, () => false)`.
  * En `KanbanBoard.tsx`, declarar un `ref` estable o mover el callback de selección tras `useIncidentesKanban` (o desestructurar `setIncidenteSeleccionadoId` antes de los `useCallback`, alineando el fix ya existente en `develop`).
  * En `MisionReportesSection.tsx`, encapsular la derivación de `hitoReclasificacion` dentro de su propio `useMemo(() => ..., [bitacora])` para garantizar estabilidad referencial ante React Compiler.
  * En `ToastItem.tsx`, inicializar `startTimeRef` en `0` y asignar `Date.now()` únicamente dentro de `startTimer()` / `useEffect`.
  * En `useIncidentesKanban.test.ts`, tipar `socketCallbacks` con `UseEncargadoKanbanSocketOptions`.

---

### `BUG-H38-WEB-02` — Sobrescritura Silenciosa de la Prioridad Actualizada a `MEDIA` en el Tablero Kanban por Evento Paralelo `mision:actualizada`
* **Severidad:** **Crítica** (Incumplimiento directo de CA-5 en integración real WebSocket con `sgrai-api`).
* **Estado:** `ABIERTO`.
* **Archivos Afectados:**
  * `src/hooks/useEncargadoKanbanSocket.ts` (líneas 303–325)
  * `src/hooks/useIncidentesKanban.ts` (líneas 387, 421, 431)
* **Descripción Técnica:**  
  Al confirmar o rectificar prioridad en `sgrai-api` (`PATCH /api/incidentes/{id}/prioridad`), el backend emite secuencialmente dos eventos hacia `sala:encargados`:
  1. `incidente:actualizado` con la prioridad evaluada (ej. `CRITICA`, `ALTA` o `BAJA`) y `reporteTerreno`.
  2. `mision:actualizada` (`MisionActualizadaPayload` con `estado: "EN_CURSO"`, `tipoMision: "VERIFICACION"` y **sin propiedad `prioridad`**).
  En `useEncargadoKanbanSocket.ts:303-325` (`handleMisionEvent`), cuando llega `mision:actualizada` con `estado === 'EN_CURSO'` y transcurrieron más de `4000 ms` desde la aceptación de la misión (ventana de `esEventoDuplicado`), se construye un payload sintético `esSintetico: true` fijando:
  ```typescript
  prioridad: (raw?.prioridad as PrioridadIncidente) || 'MEDIA',
  ```
  Como `mision:actualizada` no incluye `prioridad`, el payload sintético adopta `'MEDIA'`. Luego, `useIncidentesKanban.ts:387` ejecuta `const nuevaPrioridad = datos.prioridad || incActual.prioridad`, **sobrescribiendo la prioridad recién actualizada (`CRITICA`/`ALTA`/`BAJA`) por `MEDIA`** en la tarjeta del Kanban. Adicionalmente, `useIncidentesKanban.ts:431` asigna `verificado: true` de forma incondicional aunque `payload.esSintetico === true` (cuando la patrulla solo aceptó la misión en HU-36 y aún no evalúa el incidente).
* **Pasos para Reproducir:**
  1. Abrir el Tablero Kanban (`/gestion/centro-incidentes`) conectado al Socket.io de `sgrai-api`.
  2. Despachar y aceptar una misión de verificación (esperar `> 4s` mientras la patrulla completa el formulario en terreno).
  3. Desde terreno, enviar `PATCH /api/incidentes/{id}/prioridad` con `prioridad: "CRITICA"`.
* **Comportamiento Actual:** Tras recibir `incidente:actualizado` (`Crítica`), la llegada inmediata de `mision:actualizada` revierte el badge del incidente en el Kanban a `Media`.
* **Comportamiento Esperado:** El evento sintético originado en `mision:actualizada` únicamente debe asegurar la transición de columna a `VERIFICANDO`, preservando intacta la `prioridad` vigente y sin marcar `verificado: true` prematuramente.
* **Sugerencia Técnica de Solución:**  
  Hacer `prioridad?: PrioridadIncidente` opcional en `IncidenteActualizadoPayload['datos']` (o no enviar `prioridad` cuando `!raw?.prioridad` en `syntheticIncPayload`) y en `useIncidentesKanban.ts` preservar `incActual.prioridad` y `incActual.verificado` cuando `payload.esSintetico === true`.

---

### `BUG-H38-WEB-03` — Fallo HTTP `401 Unauthorized` en `incidentesService.obtenerKpis` y `misionesService.listar` por Ausencia de Token JWT y Desfase con `develop`
* **Severidad:** **Alta** (Bloqueo funcional en KPIs y listado de misiones del Centro de Mando contra `sgrai-api` en vivo).
* **Estado:** `ABIERTO`.
* **Archivos Afectados:**
  * `src/services/incidentesService.ts` (líneas 328–348)
  * `src/services/misionesService.ts` (líneas 58–97)
* **Descripción Técnica:**  
  La rama `feature/h38-patrulla-asignar-prioridad` está desfasada 10 commits respecto a `develop` (`cabb4c2`). En su estado actual, `incidentesService.obtenerKpis` y `misionesService.listar` realizan llamadas directas con `fetch()` enviando exclusivamente la cabecera legacy `'x-user-id'` sin inyectar `Authorization: Bearer <token>` ni utilizar `apiClient`. Además, `obtenerKpis` apunta directamente a `NEXT_PUBLIC_API_URL` (`http://localhost:3001`) en lugar del proxy relativo usado por `apiClient`.
* **Pasos para Reproducir:**
  1. Ejecutar `curl -s "http://127.0.0.1:3001/api/incidentes/kpis" -H "x-user-id: 00000000-0000-4000-8000-000000000003"`.
  2. Ejecutar `curl -s "http://127.0.0.1:3001/api/misiones?page=1&limit=2" -H "x-user-id: 00000000-0000-4000-8000-000000000003"`.
* **Comportamiento Actual:** Ambos endpoints responden `HTTP 401 Unauthorized` con `{"message":"Se requiere cabecera de autenticación Authorization: Bearer <token>."}`.
* **Comportamiento Esperado:** Todos los servicios del Centro de Mando deben autenticar mediante `apiClient` (inyectando el JWT desde `sgrai_auth_token`) para retornar `200 OK`.
* **Sugerencia Técnica de Solución:**  
  Integrar `develop` (`cabb4c2`) sobre `feature/h38-patrulla-asignar-prioridad` (que ya incorpora los fixes de migración de `obtenerKpis` y `misionesService.listar` a `apiClient` con Bearer JWT).

---

### `BUG-H38-WEB-04` — Desincronización del Contrato OpenAPI (`src/types/api-generated.d.ts`) e Infracción de `GEMINI.md §4`
* **Severidad:** **Alta** (Divergencia estructural de contrato API entre `sgrai-web` y `sgrai-api`).
* **Estado:** `ABIERTO`.
* **Archivos Afectados:**
  * `src/types/api-generated.d.ts`
  * `src/services/incidentesService.ts` (líneas 52–128, 182)
  * `src/types/misiones.ts` (líneas 26–115)
  * `src/services/misionesService.ts` (línea 177)
* **Descripción Técnica:**  
  `GEMINI.md §4` establece la prohibición estricta de escribir a mano los tipos de request/response de la API, exigiendo regenerar `src/types/api-generated.d.ts` desde el `/openapi.json` expuesto por `sgrai-api`.  
  Al inspeccionar `GET http://127.0.0.1:3001/openapi.json` (`v0.10.0`), el backend ya publica los endpoints `/api/incidentes/{id}/prioridad`, `/api/incidentes/{id}/prioridad/calcular` y los atributos HU-38 en `ListarIncidentesResponse` y `IncidenteDetalleResponse` (`prioridadSugerida`, `justificacionPrioridad`, `totalReportesTerreno`, `reportesEvaluacionTerreno`, `ultimoReporte`, `reclasificacionTipologia`) así como en `/api/misiones/{id}` (`versionReporte`, `esRectificacion`, `etiquetaReporte`, `prioridadSugerida`, `prioridadAsignada`, `justificacionPrioridad`, `detallesEvaluacion`).  
  Sin embargo, `src/types/api-generated.d.ts` no fue regenerado con estos esquemas (ni conserva campos ya integrados en `develop` como `verificado`, `trazabilidadNotificacion`, `sinAsignacionCuadrilla` y `excluirCuadrillaId`), recurriendo a intersecciones manuales `& { ... }` en `incidentesService.ts`, interfaces duplicadas a mano en `misiones.ts` y casteos `as unknown as` en `misionesService.ts:177` e `incidentesService.ts:182`.
* **Pasos para Reproducir:**
  1. Consultar `http://127.0.0.1:3001/openapi.json` y verificar la presencia de `/api/incidentes/{id}/prioridad` y `prioridadSugerida`.
  2. Ejecutar `rg -n "prioridadSugerida|reportesEvaluacionTerreno|/api/incidentes/\{id\}/prioridad" src/types/api-generated.d.ts`.
* **Comportamiento Actual:** Cero coincidencias en `src/types/api-generated.d.ts` para los campos y rutas principales de HU-38; tipos definidos manualmente en `incidentesService.ts` y `misiones.ts`.
* **Comportamiento Esperado:** `src/types/api-generated.d.ts` sincronizado vía `openapi-typescript` contra `sgrai-api`, derivando los tipos de `components['schemas']` y `paths` sin DTOs duplicados a mano.
* **Sugerencia Técnica de Solución:**  
  Ejecutar `npx openapi-typescript http://127.0.0.1:3001/openapi.json -o src/types/api-generated.d.ts` una vez sincronizada la rama con `develop`, y derivar `IncidenteResumen`, `IncidenteDetalle` y `ReporteTerrenoDetalle` directamente de los tipos generados.

---

### `BUG-H38-WEB-05` — Falsa Etiqueta `Reclasificado` de Tipología en `IncidenteResumenSection` y Contaminación de `justificacionReclasificacion` con Datos de Prioridad
* **Severidad:** **Alta** (Información operativa falsa mostrada al Encargado del Centro de Mando).
* **Estado:** `ABIERTO`.
* **Archivos Afectados:**
  * `src/components/mando/drawer/IncidenteResumenSection.tsx` (líneas 37–68)
  * `src/components/mando/IncidenteDetalleDrawer.tsx` (línea 242)
  * `src/hooks/useIncidentesKanban.ts` (líneas 433–434)
* **Descripción Técnica:**  
  En respuestas reales de `sgrai-api` (`GET /api/incidentes/dd7db71e-e878-4b58-a115-a848dc88bb38`, incidente `INC-2026-9932`), cuando la patrulla evalúa únicamente prioridad (HU-38) sin modificar tipología (HU-37), la API retorna `reclasificadoEnTerreno: true`, `reclasificacionTipologia: null` y `justificacionReclasificacion: "Reporte de evaluación #4 (Rectificación): Prioridad actualizada en terreno de BAJA a BAJA..."`.
  1. En `IncidenteResumenSection.tsx:37-68`, al ser `detalle.reclasificacionTipologia === null`, la rama de respaldo entra por `(detalle.reclasificadoEnTerreno || detalle.justificacionReclasificacion)`, evalúa `esJustificacionSinCambios(...)` como `false` y renderiza el chip **`Reclasificado`** junto al `Tipo de Afectación`, afirmando falsamente en el tooltip que el tipo de afectación fue reclasificado en terreno y apuntando al `reporteId` inexistente `'verificacion-terreno'`.
  2. Además, en WebSocket (`prioridad.service.ts:69` emite `justificacion: resultado.incidente.justificacionPrioridad`), tanto `useIncidentesKanban.ts:433-434` como `IncidenteDetalleDrawer.tsx:242` sobrescriben `justificacionReclasificacion` con `datos.justificacion` aunque no haya habido cambio de tipología, corrompiendo el tooltip de reclasificación de tipología en `IncidenteCard.tsx:123`.
* **Pasos para Reproducir:**
  1. Abrir el detalle de un incidente que cuente con reportes de evaluación HU-38 pero sin hito `TIPOLOGIA_RECLASIFICADA` (`reclasificacionTipologia === null`, ej. `INC-2026-9932`).
  2. Observar el campo "Tipo de Afectación" en `IncidenteResumenSection`.
* **Comportamiento Actual:** Despliega el chip `Reclasificado` junto al tipo de afectación pese a no existir reclasificación de tipología.
* **Comportamiento Esperado:** El chip de cambio o confirmación de tipología en `IncidenteResumenSection` debe renderizarse únicamente cuando exista `reclasificacionTipologia` o un evento real de tipología (descartando glosas de `PRIORIDAD_ASIGNADA` / `PRIORIDAD_RECTIFICADA`), y el WebSocket de HU-38 no debe sobrescribir `justificacionReclasificacion`.
* **Sugerencia Técnica de Solución:**  
  En `IncidenteResumenSection.tsx`, excluir justificaciones que correspondan a evaluación de prioridad o exigir `detalle.reclasificacionTipologia` para mostrar el chip de tipología. En `useIncidentesKanban.ts` e `IncidenteDetalleDrawer.tsx`, actualizar `justificacionReclasificacion` únicamente cuando el evento no sea un reporte de evaluación de prioridad (`!datos.reporteTerreno`) o cuando `huboCambioTipologia` / constatación de tipología esté presente.

---

### `BUG-H38-WEB-06` — Sección "Último Reporte de Terreno" Congelada en Drawer y Persistencia Indebida de `justificacionPrioridad` Previa Tras Rectificación
* **Severidad:** **Alta** (Desincronización de estado en tiempo real en el Drawer del incidente y tarjeta Kanban).
* **Estado:** `ABIERTO`.
* **Archivos Afectados:**
  * `src/components/mando/IncidenteDetalleDrawer.tsx` (líneas 191–194, 208–253)
  * `src/hooks/useEncargadoKanbanSocket.ts` (líneas 187–199)
  * `src/components/mando/mision/MisionDetalleModal.tsx` (líneas 184–191)
* **Descripción Técnica:**  
  1. En `IncidenteDetalleDrawer.tsx:208-252`, al recibir por WebSocket `incidente:actualizado` con `rawDatos.reporteTerreno`, se actualiza `reportesEvaluacionTerreno`, `prioridad` y `prioridadSugerida`, pero **no se actualiza `ultimoReporte`**. Dado que `IncidenteUltimoReporteSection.tsx:36,51` prioriza incondicionalmente `detalle.ultimoReporte` cuando está definido, si el Drawer ya había cargado previamente un `ultimoReporte` (ej. Reporte #1 o Reclasificación), la sección superior **"Último Reporte de Terreno"** queda congelada mostrando el informe antiguo hasta cerrar y reabrir el panel.
  2. Si un Reporte #1/#2 tuvo `justificacionPrioridad` (ajuste manual) y una rectificación posterior confirma la prioridad sugerida por el sistema (`justificacionPrioridad: null`), `useEncargadoKanbanSocket.ts:187-192` convierte `null` en `undefined` al comprobar `typeof rawDatos?.justificacionPrioridad === 'string'`. Como consecuencia, `useIncidentesKanban.ts:393` conserva el texto de justificación anterior y `IncidenteCard.tsx:41-45` mantiene encendido el badge **`Ajustada`** con una justificación obsoleta. El mismo patrón ocurre en `IncidenteDetalleDrawer.tsx:192` y `MisionDetalleModal.tsx:189`.
* **Pasos para Reproducir:**
  1. Abrir `IncidenteDetalleDrawer` de un incidente con Reporte #1 (con ajuste manual de prioridad) ya cargado.
  2. Sin cerrar el Drawer, emitir desde terreno un Reporte #2 (Rectificación) confirmando la prioridad sugerida (`justificacionPrioridad: null`).
* **Comportamiento Actual:** La sección "Último Reporte de Terreno" del Drawer continúa mostrando el Reporte #1 y la tarjeta Kanban conserva `justificacionPrioridad` anterior manteniendo visible el chip `Ajustada`.
* **Comportamiento Esperado:** `IncidenteDetalleDrawer` debe reconstruir `ultimoReporte` con el `reporteTerreno` entrante, y tanto el socket hook como los modales/drawers deben aceptar explícitamente `null` en `justificacionPrioridad` y `prioridadSugerida` para limpiar justificaciones previas.
* **Sugerencia Técnica de Solución:**  
  En `IncidenteDetalleDrawer.tsx`, actualizar `ultimoReporte` al recibir `rawDatos.reporteTerreno` (o dejar que `IncidenteUltimoReporteSection` compare timestamps entre `detalle.ultimoReporte` y `reporteTerrenoReciente`). En `useEncargadoKanbanSocket.ts`, `IncidenteDetalleDrawer.tsx` y `MisionDetalleModal.tsx`, distinguir `rawDatos?.justificacionPrioridad === null` (asignar `null`) de `undefined`.

---

### `BUG-H38-WEB-07` — Badge de Prioridad en `ALL CAPS` en `ToastItem.tsx` y Enum `de BAJA` Sin Humanizar en `limpiarDescripcionBitacora` (`GEMINI.md §3`)
* **Severidad:** **Media** (Incumplimiento de estándar tipográfico y de legibilidad institucional).
* **Estado:** `ABIERTO`.
* **Archivos Afectados:**
  * `src/components/ui/ToastItem.tsx` (líneas 186–190)
  * `src/lib/utils/estadoUtils.ts` (líneas 414–417)
* **Descripción Técnica:**  
  1. `ToastItem.tsx:186-190` renderiza `{toast.priorityBadge}` en crudo dentro de `<Chip>`. Como `KanbanBoard.tsx` (líneas 224, 267, 313, 335) pasa el valor del enum (`'CRITICA'`, `'ALTA'`, `'MEDIA'`, `'BAJA'`), la notificación muestra `CRITICA` / `ALTA` en `ALL CAPS`, contraviniendo `GEMINI.md §3` (*"Los textos de estados y prioridades se muestran en formato oración (`Crítica`, `En curso`, `Verificado`) en lugar de `ALL CAPS`"*).
  2. `limpiarDescripcionBitacora` (`src/lib/utils/estadoUtils.ts:414-417`) utiliza la expresión regular `/\b(a|Sugerida:|Prioridad:|Prioridad sugerida:|Prioridad asignada:)\s+(BAJA|MEDIA|ALTA|CRITICA)\b/g`, omitiendo la preposición **`de`** presente en los hitos `PRIORIDAD_RECTIFICADA` generados por `sgrai-api` (ej. observado en vivo en `GET /api/misiones/247be4dd-a0b8-490f-8d66-4de1144ddd02`: `"Prioridad actualizada en terreno de BAJA a CRITICA (Sugerida: ALTA)"`). Así, el primer nivel permanece en crudo como `"de BAJA a Crítica"`.
* **Pasos para Reproducir:**
  1. Emitir una notificación Toast en `KanbanBoard` con `priorityBadge: "CRITICA"`.
  2. Invocar `limpiarDescripcionBitacora("Reporte de evaluación #5 (Rectificación): Prioridad actualizada en terreno de BAJA a CRITICA (Sugerida: ALTA).")`.
* **Comportamiento Actual:** El chip del Toast muestra `CRITICA` y la bitácora muestra `de BAJA a Crítica (Sugerida: Alta)`.
* **Comportamiento Esperado:** El Toast debe mostrar `Crítica` mediante `formatearPrioridad(toast.priorityBadge)` y la bitácora debe transformar íntegramente a `de Baja a Crítica (Sugerida: Alta)`.
* **Sugerencia Técnica de Solución:**  
  En `ToastItem.tsx:188`, renderizar `{formatearPrioridad(toast.priorityBadge, toast.priorityBadge)}`. En `estadoUtils.ts:415`, agregar `de` al grupo de prefijos: `\b(de|a|Sugerida:|Prioridad:|Prioridad sugerida:|Prioridad asignada:)`.

---

### `BUG-H38-WEB-08` — Capturas de Pantalla Inexistentes en Manual de Usuario `H38-evaluacion-prioridad-terreno-mando.md` y Discrepancia Menor de Copy (`GEMINI.md §7`)
* **Severidad:** **Media** (Documentación con enlaces rotos de recursos multimedia).
* **Estado:** `ABIERTO`.
* **Archivos Afectados:**
  * `docs/manuals/H38-evaluacion-prioridad-terreno-mando.md` (líneas 28, 39, 41, 52)
  * `docs/manuals/assets/h38-evaluacion-prioridad-terreno-mando/` (directorio ausente)
* **Descripción Técnica:**  
  El manual `docs/manuals/H38-evaluacion-prioridad-terreno-mando.md` referencia tres archivos PNG en `./assets/h38-evaluacion-prioridad-terreno-mando/` (`kanban-card-prioridad-reportes.png`, `drawer-acceso-ultimo-reporte.png` y `mision-detalle-historial-reportes.png`), pero dicha carpeta e imágenes **no existen** en `docs/manuals/assets/`, produciendo enlaces rotos e incumpliendo `GEMINI.md §7`. Adicionalmente, la línea 39 documenta únicamente el rótulo `Ver Todos los Reportes (N)`, mientras que cuando existe 1 reporte el botón renderiza `Ver Reportes en Misión (1)` (`IncidenteMisionesSection.tsx:572`).
* **Pasos para Reproducir:**
  1. Revisar las rutas de imagen en `docs/manuals/H38-evaluacion-prioridad-terreno-mando.md` (líneas 28, 41 y 52).
  2. Ejecutar `ls -la docs/manuals/assets/h38-evaluacion-prioridad-terreno-mando/`.
* **Comportamiento Actual:** El directorio no existe en el repositorio.
* **Comportamiento Esperado:** Las tres capturas referenciadas deben existir bajo `docs/manuals/assets/h38-evaluacion-prioridad-terreno-mando/` y el texto del Paso 2 debe mencionar la variante singular `Ver Reportes en Misión (1)`.
* **Sugerencia Técnica de Solución:**  
  Generar y versionar las tres capturas de pantalla reales de la interfaz en `docs/manuals/assets/h38-evaluacion-prioridad-terreno-mando/` y actualizar la línea 39 del manual para reflejar ambas variantes del botón.

---

## 3. Matriz Consolidada de Casos de Prueba (13 Columnas Institucionales)

| ID Caso | Título del Caso de Prueba | Tipo de Prueba | Nivel | Prioridad | Precondición | Datos de Prueba (Payload / Headers / Query) | Resultado Esperado | Resultado Obtenido | Estado | Fecha / Hora Ejecución | Fecha / Hora Re-Test | Solución / Commit |
|---|---|---|---|---|---|---|---|---|:---:|:---:|:---:|---|
| `BUG-H38-WEB-01` | Validación estática de ESLint y reglas de React Compiler / Hooks en la rama | Calidad / Linter | CI / Estático | Crítica | Repositorio en rama `feature/h38-patrulla-asignar-prioridad` con dependencias instaladas | `npm run lint` | 0 errores bloqueantes de ESLint en componentes, hooks y suites modificadas | Falla con código 1: 9 errores bloqueantes (`IncidentesKpiCards.tsx`, `KanbanBoard.tsx`, `MisionReportesSection.tsx`, `ToastItem.tsx`, `useIncidentesKanban.test.ts`) y 17 warnings | **ABIERTO** | 17/11/2026 14:17 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| `BUG-H38-WEB-02` | Preservación de prioridad actualizada ante evento paralelo `mision:actualizada` sin campo prioridad (CA-5) | Tiempo Real / Concurrencia | Hook / Integración | Crítica | Tablero Kanban conectado a Socket.io; incidente en `VERIFICANDO` con misión `EN_CURSO` aceptada hace >4s | Emisión `incidente:actualizado` (`prioridad: 'CRITICA'`) seguida de `mision:actualizada` (`estado: 'EN_CURSO'`, `tipoMision: 'VERIFICACION'`, sin `prioridad`) | Tarjeta Kanban conserva prioridad `CRITICA` y solo marca `verificado: true` ante reporte o evaluación real | `useEncargadoKanbanSocket` sintetiza `prioridad: 'MEDIA'` y `useIncidentesKanban` sobrescribe `CRITICA` con `MEDIA` | **ABIERTO** | 17/11/2026 14:20 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| `BUG-H38-WEB-03` | Autenticación JWT Bearer en `obtenerKpis` y `misionesService.listar` y sincronización con `develop` | Seguridad / Integración | Servicio / API | Alta | Servidor `sgrai-api` activo en `http://127.0.0.1:3001` exigiendo `Authorization: Bearer <token>` | `GET /api/incidentes/kpis` y `GET /api/misiones?page=1&limit=2` con `-H "x-user-id: 00000000-...-0003"` | Endpoints consumidos vía `apiClient` con Bearer JWT respondiendo `200 OK` | `obtenerKpis` y `misionesService.listar` envían `fetch` solo con `x-user-id` recibiendo `401 Unauthorized` en vivo | **ABIERTO** | 17/11/2026 14:25 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| `BUG-H38-WEB-04` | Sincronización de tipos `src/types/api-generated.d.ts` con OpenAPI de `sgrai-api` (`GEMINI.md §4`) | Contrato / Tipado | Estático / DAL | Alta | `sgrai-api` exponiendo `/openapi.json` v0.10.0 con esquemas y rutas de HU-38 | Inspección de `GET http://127.0.0.1:3001/openapi.json` vs `src/types/api-generated.d.ts`, `incidentesService.ts` y `misiones.ts` | `api-generated.d.ts` regenerado con `/api/incidentes/{id}/prioridad`, `prioridadSugerida`, `reportesEvaluacionTerreno` y `ultimoReporte` sin DTOs manuales | `api-generated.d.ts` carece de rutas y campos HU-38; `incidentesService.ts` y `misiones.ts` usan extensiones manuales y casteos `as unknown as` | **ABIERTO** | 17/11/2026 14:24 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| `BUG-H38-WEB-05` | Discriminación entre reclasificación de tipología (HU-37) y reporte de prioridad (HU-38) en `IncidenteResumenSection` y Socket | Funcional / Consistencia | UI / Hook | Alta | Incidente con reportes HU-38 (`reclasificadoEnTerreno: true`, `reclasificacionTipologia: null`, `justificacionReclasificacion` de prioridad) | Carga de `GET /api/incidentes/dd7db71e-e878-4b58-a115-a848dc88bb38` (`INC-2026-9932`) y payload Socket `incidente:actualizado` | No mostrar badge `Reclasificado` junto a `Tipo de Afectación` ni sobrescribir `justificacionReclasificacion` con justificación de prioridad | `IncidenteResumenSection` despliega erróneamente el chip `Reclasificado`; hooks sobrescriben `justificacionReclasificacion` con `datos.justificacion` | **ABIERTO** | 17/11/2026 14:25 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| `BUG-H38-WEB-06` | Refresco en vivo de `ultimoReporte` en Drawer y limpieza de `justificacionPrioridad: null` en rectificaciones | Tiempo Real / UI | Drawer / Hook | Alta | `IncidenteDetalleDrawer` abierto con reporte previo; rectificación posterior confirma sugerencia con `justificacionPrioridad: null` | Evento WebSocket `incidente:actualizado` con `reporteTerreno` (#2) y `justificacionPrioridad: null` | `IncidenteUltimoReporteSection` muestra el Reporte #2 recién recibido y `IncidenteCard` oculta el chip `Ajustada` | `IncidenteDetalleDrawer` no actualiza `ultimoReporte` (permanece congelado) y el socket hook ignora `null` conservando la justificación previa | **ABIERTO** | 17/11/2026 14:22 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| `BUG-H38-WEB-07` | Formato Sentence Case en badge de prioridad de `ToastItem.tsx` y humanización de `de <PRIORIDAD>` en bitácora | Estándares UI / I18n | UI / Utilidades | Media | Notificación Toast con `priorityBadge` y hito `PRIORIDAD_RECTIFICADA` real de `sgrai-api` | `priorityBadge: "CRITICA"` en `ToastItem` y descripción `"Prioridad actualizada en terreno de BAJA a CRITICA (Sugerida: ALTA)"` | Toast despliega `Crítica` vía `formatearPrioridad` y bitácora formatea `de Baja a Crítica (Sugerida: Alta)` | `ToastItem` renderiza `CRITICA` en `ALL CAPS` y `limpiarDescripcionBitacora` omite prefijo `de` mostrando `de BAJA a Crítica` | **ABIERTO** | 17/11/2026 14:26 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| `BUG-H38-WEB-08` | Integridad de capturas de pantalla y textos en manual `H38-evaluacion-prioridad-terreno-mando.md` (`GEMINI.md §7`) | Documentación / QA | Repositorio | Media | Manual creado en `docs/manuals/H38-evaluacion-prioridad-terreno-mando.md` | Inspección de `docs/manuals/H38-evaluacion-prioridad-terreno-mando.md` (líneas 28, 39, 41, 52) y `docs/manuals/assets/` | Existencia de las 3 capturas PNG en `assets/h38-evaluacion-prioridad-terreno-mando/` y alineación de rótulos de botón | Directorio `docs/manuals/assets/h38-evaluacion-prioridad-terreno-mando/` inexistente (3 enlaces rotos) y omisión del rótulo `Ver Reportes en Misión (1)` | **ABIERTO** | 17/11/2026 14:17 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| `CP-H38-WEB-01` | Despliegue de indicador `Ajustada`, tooltip comparativo y contador de reportes en `IncidenteCard` (CA-1, CA-3, CA-5) | Funcional / UI | Componente / Card | Crítica | Tarjeta `IncidenteCard` con `prioridad` distinta de `prioridadSugerida` y `totalReportesTerreno: 2` | `prioridad: 'CRITICA'`, `prioridadSugerida: 'ALTA'`, `justificacionPrioridad: 'Avance rápido del agua...'`, `totalReportesTerreno: 2` | Muestra chip `Ajustada`, prioridad `Crítica`, tooltip con sugerida/justificación y badge `2 reportes · Rectificado` | `IncidenteCard.test.tsx` valida `indicador-prioridad-ajustada`, tooltip completo y `2 reportes · Rectificado` (12/12 pass) | **APROBADO** | 17/11/2026 14:28 | - | feat(mando): estandarizar tarjetas de reporte y desplegar afectacion de multiples familias (H38) |
| `CP-H38-WEB-02` | Visualización de chips `FIBE` y `Verificado` en tarjeta Kanban al cargar desde servidor (CA-4, CA-5) | Funcional / UI | Componente / Card | Alta | Incidente con `requiereAsistenciaSocial: true` y `verificado: true` | `IncidenteResumen` con `verificado: true`, `reclasificadoEnTerreno: false`, `requiereAsistenciaSocial: true` | Renderiza chips rectangulares `FIBE` (warning) y `Verificado` (success) persistentes tras recarga | Verificado en `IncidenteCard.test.tsx` (12/12 pass en `605ms`) | **APROBADO** | 17/11/2026 14:27 | - | fix(kanban): asegurar persistencia del chip verificado al paginar y refrescar |
| `CP-H38-WEB-03` | Exposición de prioridad confirmada y chip `Sugerida: [Nivel]` en cabecera del Drawer (CA-1, CA-3) | Funcional / UI | Componente / Header | Alta | `IncidenteDetalleDrawer` abierto para incidente con ajuste manual en terreno | `prioridad: 'CRITICA'`, `prioridadSugerida: 'ALTA'`, `justificacionPrioridad: 'Riesgo eléctrico activo...'` | Cabecera muestra chips `Prioridad: Crítica` y `Sugerida: Alta` con tooltip explicativo | Verificado en `IncidenteDetalleDrawer.test.tsx` (13/13 pass) | **APROBADO** | 17/11/2026 14:28 | - | feat(mando): estandarizar tarjetas de reporte y desplegar afectacion de multiples familias (H38) |
| `CP-H38-WEB-04` | Renderizado de sección `Último Reporte de Terreno` con desglose de familias y navegación directa al modal de misión | Funcional / UI | Componente / Drawer | Alta | `IncidenteDetalle` con `ultimoReporte` y `reportesEvaluacionTerreno` incluyendo múltiples familias | `familias: ['Familia Morales', 'Casa 2 Interior']`, `nucleoFamiliarTotal: 6`, `nivelCompromisoVivienda: 'GRAVE_INHABITABLE'` | Despliega métricas de familias, personas, viviendas, compromiso y botón `Ver detalle` funcional | Verificado en `IncidenteDetalleDrawer.test.tsx` (casos HU-38 y hogares, `1950ms`) | **APROBADO** | 17/11/2026 14:27 | - | feat(mando): estandarizar tarjetas de reporte y desplegar afectacion de multiples familias (H38) |
| `CP-H38-WEB-05` | Bloque `Último Reporte Realizado` en tarjetas de misión y accesos directos a último reporte / todos los reportes | Funcional / UI | Componente / Drawer | Alta | Misión activa con 2 reportes de evaluación (`#1 Inicial` y `#2 Rectificación`) | `reportesEvaluacionTerreno` con versiones `1` y `2` en `IncidenteMisionesSection` | Muestra `Reporte #2 — Rectificación Vigente`, comparativa de prioridad, resumen demográfico y botones de acceso | `IncidenteMisionesSection.test.tsx` valida `7/7` pruebas incluyendo invocación con `('m-verif-1', 'rep-v2')` y `('m-verif-1')` | **APROBADO** | 17/11/2026 14:28 | - | feat(mando): estandarizar tarjetas de reporte y desplegar afectacion de multiples familias (H38) |
| `CP-H38-WEB-06` | Historial versionado de reportes en `MisionReportesSection` con chips `Vigente`/`Histórico` y acordeón colapsable | Funcional / UI | Componente / Modal | Crítica | `MisionDetalleModal` abierto para misión con Reporte #1 (Inicial) y Reporte #2 (Rectificación) | `versionReporte: 1` y `2`, `prioridadSugerida: 'ALTA'`, `prioridadAsignada: 'CRITICA'`, `justificacionPrioridad` | Muestra `2 versiones registradas`, despliega por defecto solo el reporte vigente (`#2`) y colapsa el histórico (`#1`) | `MisionDetalleModal.test.tsx` valida `16/16` casos incluyendo apertura/cierre de acordeón y comparativa | **APROBADO** | 17/11/2026 14:28 | - | refactor(mando): estandarizar tarjetas y cabecera unificada de reportes de terreno (H37/H38) |
| `CP-H38-WEB-07` | Desglose individualizado de múltiples familias afectadas, vulnerabilidad y derivación FIBE en `MisionReportesSection` | Funcional / UI | Componente / Modal | Alta | Reporte con arreglo `detallesEvaluacion.familias` (>1 familia o con `referencia`) | `Familia Muñoz - Casa Principal` (4 pers., `GRAVE_INHABITABLE`, FIBE) y `Familia Díaz - Cabaña Interior` (3 pers., `MODERADO_PARCIAL`) | Despliega chip `2 hogares`, tarjetas individuales por familia con severidad y badge `Requiere FIBE`, más consolidado | Verificado en `MisionDetalleModal.test.tsx` (`familias-listado-rep-familias-multiples`) | **APROBADO** | 17/11/2026 14:27 | - | feat(mando): estandarizar tarjetas de reporte y desplegar afectacion de multiples familias (H38) |
| `CP-H38-WEB-08` | Despliegue de peligros activos y requerimientos operativos (evacuación, FIBE, riesgo eléctrico/estructural) | Funcional / UI | Componente / Modal | Alta | `detallesEvaluacion` con `requiereEvacuacion: true`, `requiereAsistenciaSocial: true` y `riesgosActivos` | `{ riesgoElectrico: true, riesgoEstructural: true, requiereEvacuacion: true, requiereAsistenciaSocial: true }` | Renderiza chips `Requiere Evacuación`, `Requiere Ficha FIBE`, `Riesgo Eléctrico` y `Riesgo Estructural` | Verificado en `MisionDetalleModal.test.tsx` dentro del bloque `desglose-evaluacion-terreno-rep-38-2` | **APROBADO** | 17/11/2026 14:28 | - | feat(mando): estandarizar tarjetas de reporte y desplegar afectacion de multiples familias (H38) |
| `CP-H38-WEB-09` | Recepción y deduplicación de eventos `incidente:actualizado` en `useEncargadoKanbanSocket` | Tiempo Real / Socket | Hook | Alta | Hook `useEncargadoKanbanSocket` montado y suscrito a `sala:encargados`, `encargado` y `mapa` | Emisión repetida de `incidente:actualizado` dentro de ventana de `4000ms` y evento con tipología/reporte | Deduplica emisiones repetidas por múltiples salas y limpia listeners/`salir` al desmontar | `useEncargadoKanbanSocket.test.ts` aprueba `8/8` casos en `88ms` | **APROBADO** | 17/11/2026 14:28 | - | fix(mando): especificar cuando la tipologia no fue modificada por la patrulla y deduplicar socket kanban |
| `CP-H38-WEB-10` | Actualización en memoria del Tablero Kanban en `useIncidentesKanban` ante evento `incidente:actualizado` | Tiempo Real / Estado | Hook | Alta | Incidente cargado en columna `VERIFICANDO` del estado Kanban | Disparo de `onIncidenteActualizado` con nueva `prioridad`, `tipoAfectacion` y `justificacion` | Actualiza inmediatamente los atributos de la tarjeta en memoria sin recarga completa de página | `useIncidentesKanban.test.ts` aprueba `5/5` casos en `333ms` | **APROBADO** | 17/11/2026 14:27 | - | feat(kanban): actualizar tipología, prioridad y justificación reactivamente vía websocket (#39) |
| `CP-H38-WEB-11` | Deduplicación de notificaciones Toast idénticas en `ToastProvider` | UX / Notificaciones | Componente / UI | Media | `ToastProvider` montado en el árbol de componentes | 4 invocaciones consecutivas de `showInfo` con idéntico título, mensaje y `codeBadge` | Muestra un único Toast en pantalla evitando apilamiento por eventos multi-sala | `Toast.test.tsx` aprueba `1/1` prueba en `165ms` | **APROBADO** | 17/11/2026 14:28 | - | fix(notifications): deduplicar eventos websocket y toasts repetidos de patrullas e incidentes |
| `CP-H38-WEB-12` | Formateadores institucionales de prioridades, hitos y compromisos de vivienda en `estadoUtils.ts` | Unitaria / Utilidades | Utilidades | Media | Funciones puras en `src/lib/utils/estadoUtils.ts` | Inputs `CRITICA`, `ALTA`, `MEDIA`, `BAJA`, `PRIORIDAD_ASIGNADA`, `PRIORIDAD_RECTIFICADA`, `GRAVE_INHABITABLE` | Retorna cadenas legibles en Sentence Case (`Crítica`, `Alta`, `Media`, `Baja`, `Grave / Inhabitable`) | `estadoUtils.test.ts` aprueba `17/17` pruebas en `8ms` | **APROBADO** | 17/11/2026 14:28 | - | fix(mando): humanizar enums y descripciones en bitacora cronologica de mision |
| `CP-H38-WEB-13` | Consulta autenticada Bearer JWT de incidentes y misiones con proyección de campos HU-38 contra `sgrai-api` vivo | Integración / API | DAL / Backend vivo | Alta | `sgrai-api` en `http://127.0.0.1:3001` y token JWT de `encargado@valdivia.cl` | `GET /api/incidentes?page=1&limit=3`, `GET /api/incidentes/dd7db71e-...` y `GET /api/misiones/247be4dd-...` con `Authorization: Bearer` | Retorna `200 OK` con `prioridadSugerida`, `totalReportesTerreno`, `reportesEvaluacionTerreno`, `ultimoReporte` e hitos | Respuestas `200 OK` reales verificadas en `INC-2026-9932` y `MIS-2026-0008` con 5 versiones de reporte e hitos | **APROBADO** | 17/11/2026 14:26 | - | feat(mando): estandarizar tarjetas de reporte y desplegar afectacion de multiples familias (H38) |
| `CP-H38-WEB-14` | Restricción RBAC del endpoint `PATCH /api/incidentes/{id}/prioridad` rechazando rol Encargado (`403 Forbidden` — CA-6) | Seguridad / RBAC | API / Integración | Crítica | Token JWT de `encargado@valdivia.cl` (sin permiso `misiones:terreno:verificar`) | `PATCH /api/incidentes/dd7db71e-e878-4b58-a115-a848dc88bb38/prioridad` con `{"prioridad":"ALTA"}` | API deniega acceso con `403 Forbidden` exigiendo permiso `misiones:terreno:verificar` | `HTTP 403`: `{"message":"No cuenta con el permiso requerido: misiones:terreno:verificar"}` | **APROBADO** | 17/11/2026 14:26 | - | feat(mando): estandarizar tarjetas de reporte y desplegar afectacion de multiples familias (H38) |
| `CP-H38-WEB-15` | Verificación de tipos TypeScript (`tsc --noEmit`) y build de producción Next.js (`npm run build`) | Estática / Compilación | CI / Build | Alta | Proyecto `sgrai-web` en rama `feature/h38-patrulla-asignar-prioridad` | `npx tsc --noEmit` y `npm run build` | Ambos procesos culminan con código de salida `0` y generación de rutas estáticas | `tsc --noEmit` exit `0`; `next build --webpack` compila en `11.5s` y genera `47/47` páginas | **APROBADO** | 17/11/2026 14:19 | - | fix(mando): humanizar enums y descripciones en bitacora cronologica de mision |
| `CP-H38-WEB-16` | Ejecución completa de regresión unitaria y de componentes del repositorio (`npm test -- --run`) | Regresión / Unitaria | Suite Global | Crítica | Entorno Node.js + Vitest v3.2.7 + jsdom configurado | `npm test -- --run` | 100% de archivos y pruebas existentes pasan sin regresiones | `128/128` archivos y `861/861` pruebas aprobadas en `35.38s` | **APROBADO** | 17/11/2026 14:17 | - | fix(mando): humanizar enums y descripciones en bitacora cronologica de mision |

---

## 4. Bloque TSV para Hojas de Cálculo

```tsv
ID Caso	Título del Caso de Prueba	Tipo de Prueba	Nivel	Prioridad	Precondición	Datos de Prueba (Payload / Headers / Query)	Resultado Esperado	Resultado Obtenido	Estado	Fecha / Hora Ejecución	Fecha / Hora Re-Test	Solución / Commit
BUG-H38-WEB-01	Validación estática de ESLint y reglas de React Compiler / Hooks en la rama	Calidad / Linter	CI / Estático	Crítica	Repositorio en rama feature/h38-patrulla-asignar-prioridad con dependencias instaladas	npm run lint	0 errores bloqueantes de ESLint en componentes, hooks y suites modificadas	Falla con código 1: 9 errores bloqueantes (IncidentesKpiCards.tsx, KanbanBoard.tsx, MisionReportesSection.tsx, ToastItem.tsx, useIncidentesKanban.test.ts) y 17 warnings	ABIERTO	17/11/2026 14:17	(Pendiente)	Pendiente (Rechazado en Code Review)
BUG-H38-WEB-02	Preservación de prioridad actualizada ante evento paralelo mision:actualizada sin campo prioridad (CA-5)	Tiempo Real / Concurrencia	Hook / Integración	Crítica	Tablero Kanban conectado a Socket.io; incidente en VERIFICANDO con misión EN_CURSO aceptada hace >4s	Emisión incidente:actualizado (prioridad: 'CRITICA') seguida de mision:actualizada (estado: 'EN_CURSO', tipoMision: 'VERIFICACION', sin prioridad)	Tarjeta Kanban conserva prioridad CRITICA y solo marca verificado: true ante reporte o evaluación real	useEncargadoKanbanSocket sintetiza prioridad: 'MEDIA' y useIncidentesKanban sobrescribe CRITICA con MEDIA	ABIERTO	17/11/2026 14:20	(Pendiente)	Pendiente (Rechazado en Code Review)
BUG-H38-WEB-03	Autenticación JWT Bearer en obtenerKpis y misionesService.listar y sincronización con develop	Seguridad / Integración	Servicio / API	Alta	Servidor sgrai-api activo en http://127.0.0.1:3001 exigiendo Authorization: Bearer <token>	GET /api/incidentes/kpis y GET /api/misiones?page=1&limit=2 con -H "x-user-id: 00000000-...-0003"	Endpoints consumidos vía apiClient con Bearer JWT respondiendo 200 OK	obtenerKpis y misionesService.listar envían fetch solo con x-user-id recibiendo 401 Unauthorized en vivo	ABIERTO	17/11/2026 14:25	(Pendiente)	Pendiente (Rechazado en Code Review)
BUG-H38-WEB-04	Sincronización de tipos src/types/api-generated.d.ts con OpenAPI de sgrai-api (GEMINI.md §4)	Contrato / Tipado	Estático / DAL	Alta	sgrai-api exponiendo /openapi.json v0.10.0 con esquemas y rutas de HU-38	Inspección de GET http://127.0.0.1:3001/openapi.json vs src/types/api-generated.d.ts, incidentesService.ts y misiones.ts	api-generated.d.ts regenerado con /api/incidentes/{id}/prioridad, prioridadSugerida, reportesEvaluacionTerreno y ultimoReporte sin DTOs manuales	api-generated.d.ts carece de rutas y campos HU-38; incidentesService.ts y misiones.ts usan extensiones manuales y casteos as unknown as	ABIERTO	17/11/2026 14:24	(Pendiente)	Pendiente (Rechazado en Code Review)
BUG-H38-WEB-05	Discriminación entre reclasificación de tipología (HU-37) y reporte de prioridad (HU-38) en IncidenteResumenSection y Socket	Funcional / Consistencia	UI / Hook	Alta	Incidente con reportes HU-38 (reclasificadoEnTerreno: true, reclasificacionTipologia: null, justificacionReclasificacion de prioridad)	Carga de GET /api/incidentes/dd7db71e-e878-4b58-a115-a848dc88bb38 (INC-2026-9932) y payload Socket incidente:actualizado	No mostrar badge Reclasificado junto a Tipo de Afectación ni sobrescribir justificacionReclasificacion con justificación de prioridad	IncidenteResumenSection despliega erróneamente el chip Reclasificado; hooks sobrescriben justificacionReclasificacion con datos.justificacion	ABIERTO	17/11/2026 14:25	(Pendiente)	Pendiente (Rechazado en Code Review)
BUG-H38-WEB-06	Refresco en vivo de ultimoReporte en Drawer y limpieza de justificacionPrioridad: null en rectificaciones	Tiempo Real / UI	Drawer / Hook	Alta	IncidenteDetalleDrawer abierto con reporte previo; rectificación posterior confirma sugerencia con justificacionPrioridad: null	Evento WebSocket incidente:actualizado con reporteTerreno (#2) y justificacionPrioridad: null	IncidenteUltimoReporteSection muestra el Reporte #2 recién recibido y IncidenteCard oculta el chip Ajustada	IncidenteDetalleDrawer no actualiza ultimoReporte (permanece congelado) y el socket hook ignora null conservando la justificación previa	ABIERTO	17/11/2026 14:22	(Pendiente)	Pendiente (Rechazado en Code Review)
BUG-H38-WEB-07	Formato Sentence Case en badge de prioridad de ToastItem.tsx y humanización de de <PRIORIDAD> en bitácora	Estándares UI / I18n	UI / Utilidades	Media	Notificación Toast con priorityBadge y hito PRIORIDAD_RECTIFICADA real de sgrai-api	priorityBadge: "CRITICA" en ToastItem y descripción "Prioridad actualizada en terreno de BAJA a CRITICA (Sugerida: ALTA)"	Toast despliega Crítica vía formatearPrioridad y bitácora formatea de Baja a Crítica (Sugerida: Alta)	ToastItem renderiza CRITICA en ALL CAPS y limpiarDescripcionBitacora omite prefijo de mostrando de BAJA a Crítica	ABIERTO	17/11/2026 14:26	(Pendiente)	Pendiente (Rechazado en Code Review)
BUG-H38-WEB-08	Integridad de capturas de pantalla y textos en manual H38-evaluacion-prioridad-terreno-mando.md (GEMINI.md §7)	Documentación / QA	Repositorio	Media	Manual creado en docs/manuals/H38-evaluacion-prioridad-terreno-mando.md	Inspección de docs/manuals/H38-evaluacion-prioridad-terreno-mando.md (líneas 28, 39, 41, 52) y docs/manuals/assets/	Existencia de las 3 capturas PNG en assets/h38-evaluacion-prioridad-terreno-mando/ y alineación de rótulos de botón	Directorio docs/manuals/assets/h38-evaluacion-prioridad-terreno-mando/ inexistente (3 enlaces rotos) y omisión del rótulo Ver Reportes en Misión (1)	ABIERTO	17/11/2026 14:17	(Pendiente)	Pendiente (Rechazado en Code Review)
CP-H38-WEB-01	Despliegue de indicador Ajustada, tooltip comparativo y contador de reportes en IncidenteCard (CA-1, CA-3, CA-5)	Funcional / UI	Componente / Card	Crítica	Tarjeta IncidenteCard con prioridad distinta de prioridadSugerida y totalReportesTerreno: 2	prioridad: 'CRITICA', prioridadSugerida: 'ALTA', justificacionPrioridad: 'Avance rápido del agua...', totalReportesTerreno: 2	Muestra chip Ajustada, prioridad Crítica, tooltip con sugerida/justificación y badge 2 reportes · Rectificado	IncidenteCard.test.tsx valida indicador-prioridad-ajustada, tooltip completo y 2 reportes · Rectificado (12/12 pass)	APROBADO	17/11/2026 14:28	-	feat(mando): estandarizar tarjetas de reporte y desplegar afectacion de multiples familias (H38)
CP-H38-WEB-02	Visualización de chips FIBE y Verificado en tarjeta Kanban al cargar desde servidor (CA-4, CA-5)	Funcional / UI	Componente / Card	Alta	Incidente con requiereAsistenciaSocial: true y verificado: true	IncidenteResumen con verificado: true, reclasificadoEnTerreno: false, requiereAsistenciaSocial: true	Renderiza chips rectangulares FIBE (warning) y Verificado (success) persistentes tras recarga	Verificado en IncidenteCard.test.tsx (12/12 pass en 605ms)	APROBADO	17/11/2026 14:27	-	fix(kanban): asegurar persistencia del chip verificado al paginar y refrescar
CP-H38-WEB-03	Exposición de prioridad confirmada y chip Sugerida: [Nivel] en cabecera del Drawer (CA-1, CA-3)	Funcional / UI	Componente / Header	Alta	IncidenteDetalleDrawer abierto para incidente con ajuste manual en terreno	prioridad: 'CRITICA', prioridadSugerida: 'ALTA', justificacionPrioridad: 'Riesgo eléctrico activo...'	Cabecera muestra chips Prioridad: Crítica y Sugerida: Alta con tooltip explicativo	Verificado en IncidenteDetalleDrawer.test.tsx (13/13 pass)	APROBADO	17/11/2026 14:28	-	feat(mando): estandarizar tarjetas de reporte y desplegar afectacion de multiples familias (H38)
CP-H38-WEB-04	Renderizado de sección Último Reporte de Terreno con desglose de familias y navegación directa al modal de misión	Funcional / UI	Componente / Drawer	Alta	IncidenteDetalle con ultimoReporte y reportesEvaluacionTerreno incluyendo múltiples familias	familias: ['Familia Morales', 'Casa 2 Interior'], nucleoFamiliarTotal: 6, nivelCompromisoVivienda: 'GRAVE_INHABITABLE'	Despliega métricas de familias, personas, viviendas, compromiso y botón Ver detalle funcional	Verificado en IncidenteDetalleDrawer.test.tsx (casos HU-38 y hogares, 1950ms)	APROBADO	17/11/2026 14:27	-	feat(mando): estandarizar tarjetas de reporte y desplegar afectacion de multiples familias (H38)
CP-H38-WEB-05	Bloque Último Reporte Realizado en tarjetas de misión y accesos directos a último reporte / todos los reportes	Funcional / UI	Componente / Drawer	Alta	Misión activa con 2 reportes de evaluación (#1 Inicial y #2 Rectificación)	reportesEvaluacionTerreno con versiones 1 y 2 en IncidenteMisionesSection	Muestra Reporte #2 — Rectificación Vigente, comparativa de prioridad, resumen demográfico y botones de acceso	IncidenteMisionesSection.test.tsx valida 7/7 pruebas incluyendo invocación con ('m-verif-1', 'rep-v2') y ('m-verif-1')	APROBADO	17/11/2026 14:28	-	feat(mando): estandarizar tarjetas de reporte y desplegar afectacion de multiples familias (H38)
CP-H38-WEB-06	Historial versionado de reportes en MisionReportesSection con chips Vigente/Histórico y acordeón colapsable	Funcional / UI	Componente / Modal	Crítica	MisionDetalleModal abierto para misión con Reporte #1 (Inicial) y Reporte #2 (Rectificación)	versionReporte: 1 y 2, prioridadSugerida: 'ALTA', prioridadAsignada: 'CRITICA', justificacionPrioridad	Muestra 2 versiones registradas, despliega por defecto solo el reporte vigente (#2) y colapsa el histórico (#1)	MisionDetalleModal.test.tsx valida 16/16 casos incluyendo apertura/cierre de acordeón y comparativa	APROBADO	17/11/2026 14:28	-	refactor(mando): estandarizar tarjetas y cabecera unificada de reportes de terreno (H37/H38)
CP-H38-WEB-07	Desglose individualizado de múltiples familias afectadas, vulnerabilidad y derivación FIBE en MisionReportesSection	Funcional / UI	Componente / Modal	Alta	Reporte con arreglo detallesEvaluacion.familias (>1 familia o con referencia)	Familia Muñoz - Casa Principal (4 pers., GRAVE_INHABITABLE, FIBE) y Familia Díaz - Cabaña Interior (3 pers., MODERADO_PARCIAL)	Despliega chip 2 hogares, tarjetas individuales por familia con severidad y badge Requiere FIBE, más consolidado	Verificado en MisionDetalleModal.test.tsx (familias-listado-rep-familias-multiples)	APROBADO	17/11/2026 14:27	-	feat(mando): estandarizar tarjetas de reporte y desplegar afectacion de multiples familias (H38)
CP-H38-WEB-08	Despliegue de peligros activos y requerimientos operativos (evacuación, FIBE, riesgo eléctrico/estructural)	Funcional / UI	Componente / Modal	Alta	detallesEvaluacion con requiereEvacuacion: true, requiereAsistenciaSocial: true y riesgosActivos	{ riesgoElectrico: true, riesgoEstructural: true, requiereEvacuacion: true, requiereAsistenciaSocial: true }	Renderiza chips Requiere Evacuación, Requiere Ficha FIBE, Riesgo Eléctrico y Riesgo Estructural	Verificado en MisionDetalleModal.test.tsx dentro del bloque desglose-evaluacion-terreno-rep-38-2	APROBADO	17/11/2026 14:28	-	feat(mando): estandarizar tarjetas de reporte y desplegar afectacion de multiples familias (H38)
CP-H38-WEB-09	Recepción y deduplicación de eventos incidente:actualizado en useEncargadoKanbanSocket	Tiempo Real / Socket	Hook	Alta	Hook useEncargadoKanbanSocket montado y suscrito a sala:encargados, encargado y mapa	Emisión repetida de incidente:actualizado dentro de ventana de 4000ms y evento con tipología/reporte	Deduplica emisiones repetidas por múltiples salas y limpia listeners/salir al desmontar	useEncargadoKanbanSocket.test.ts aprueba 8/8 casos en 88ms	APROBADO	17/11/2026 14:28	-	fix(mando): especificar cuando la tipologia no fue modificada por la patrulla y deduplicar socket kanban
CP-H38-WEB-10	Actualización en memoria del Tablero Kanban en useIncidentesKanban ante evento incidente:actualizado	Tiempo Real / Estado	Hook	Alta	Incidente cargado en columna VERIFICANDO del estado Kanban	Disparo de onIncidenteActualizado con nueva prioridad, tipoAfectacion y justificacion	Actualiza inmediatamente los atributos de la tarjeta en memoria sin recarga completa de página	useIncidentesKanban.test.ts aprueba 5/5 casos en 333ms	APROBADO	17/11/2026 14:27	-	feat(kanban): actualizar tipología, prioridad y justificación reactivamente vía websocket (#39)
CP-H38-WEB-11	Deduplicación de notificaciones Toast idénticas en ToastProvider	UX / Notificaciones	Componente / UI	Media	ToastProvider montado en el árbol de componentes	4 invocaciones consecutivas de showInfo con idéntico título, mensaje y codeBadge	Muestra un único Toast en pantalla evitando apilamiento por eventos multi-sala	Toast.test.tsx aprueba 1/1 prueba en 165ms	APROBADO	17/11/2026 14:28	-	fix(notifications): deduplicar eventos websocket y toasts repetidos de patrullas e incidentes
CP-H38-WEB-12	Formateadores institucionales de prioridades, hitos y compromisos de vivienda en estadoUtils.ts	Unitaria / Utilidades	Utilidades	Media	Funciones puras en src/lib/utils/estadoUtils.ts	Inputs CRITICA, ALTA, MEDIA, BAJA, PRIORIDAD_ASIGNADA, PRIORIDAD_RECTIFICADA, GRAVE_INHABITABLE	Retorna cadenas legibles en Sentence Case (Crítica, Alta, Media, Baja, Grave / Inhabitable)	estadoUtils.test.ts aprueba 17/17 pruebas en 8ms	APROBADO	17/11/2026 14:28	-	fix(mando): humanizar enums y descripciones en bitacora cronologica de mision
CP-H38-WEB-13	Consulta autenticada Bearer JWT de incidentes y misiones con proyección de campos HU-38 contra sgrai-api vivo	Integración / API	DAL / Backend vivo	Alta	sgrai-api en http://127.0.0.1:3001 y token JWT de encargado@valdivia.cl	GET /api/incidentes?page=1&limit=3, GET /api/incidentes/dd7db71e-... y GET /api/misiones/247be4dd-... con Authorization: Bearer	Retorna 200 OK con prioridadSugerida, totalReportesTerreno, reportesEvaluacionTerreno, ultimoReporte e hitos	Respuestas 200 OK reales verificadas en INC-2026-9932 y MIS-2026-0008 con 5 versiones de reporte e hitos	APROBADO	17/11/2026 14:26	-	feat(mando): estandarizar tarjetas de reporte y desplegar afectacion de multiples familias (H38)
CP-H38-WEB-14	Restricción RBAC del endpoint PATCH /api/incidentes/{id}/prioridad rechazando rol Encargado (403 Forbidden — CA-6)	Seguridad / RBAC	API / Integración	Crítica	Token JWT de encargado@valdivia.cl (sin permiso misiones:terreno:verificar)	PATCH /api/incidentes/dd7db71e-e878-4b58-a115-a848dc88bb38/prioridad con {"prioridad":"ALTA"}	API deniega acceso con 403 Forbidden exigiendo permiso misiones:terreno:verificar	HTTP 403: {"message":"No cuenta con el permiso requerido: misiones:terreno:verificar"}	APROBADO	17/11/2026 14:26	-	feat(mando): estandarizar tarjetas de reporte y desplegar afectacion de multiples familias (H38)
CP-H38-WEB-15	Verificación de tipos TypeScript (tsc --noEmit) y build de producción Next.js (npm run build)	Estática / Compilación	CI / Build	Alta	Proyecto sgrai-web en rama feature/h38-patrulla-asignar-prioridad	npx tsc --noEmit y npm run build	Ambos procesos culminan con código de salida 0 y generación de rutas estáticas	tsc --noEmit exit 0; next build --webpack compila en 11.5s y genera 47/47 páginas	APROBADO	17/11/2026 14:19	-	fix(mando): humanizar enums y descripciones en bitacora cronologica de mision
CP-H38-WEB-16	Ejecución completa de regresión unitaria y de componentes del repositorio (npm test -- --run)	Regresión / Unitaria	Suite Global	Crítica	Entorno Node.js + Vitest v3.2.7 + jsdom configurado	npm test -- --run	100% de archivos y pruebas existentes pasan sin regresiones	128/128 archivos y 861/861 pruebas aprobadas en 35.38s	APROBADO	17/11/2026 14:17	-	fix(mando): humanizar enums y descripciones en bitacora cronologica de mision
```

---

## 5. Guía de Ejecución y Replicabilidad Paso a Paso

Todos los comandos listados a continuación fueron ejecutados directamente sobre la rama `feature/h38-patrulla-asignar-prioridad` en el directorio raíz de `web`.

### 5.1 Análisis Estático (`npm run lint`), Tipado (`npx tsc --noEmit`) y Build (`npm run build`)

#### Comando 1: ESLint (`BUG-H38-WEB-01`)
```bash
npm run lint
```

**Salida real obtenida (exit code `1`):**
```text
/home/ds2fery/Documentos/Proyecto/sgrai-uach/web/src/components/mando/IncidentesKpiCards.tsx
  120:5  error  Error: Calling setState synchronously within an effect can trigger cascading renders  react-hooks/set-state-in-effect

/home/ds2fery/Documentos/Proyecto/sgrai-uach/web/src/components/mando/KanbanBoard.tsx
  108:32  error    Error: Cannot access variable before it is declared (`setIncidenteSeleccionadoId`)  react-hooks/immutability
  116:5   warning  React Hook React.useCallback has a missing dependency: 'setIncidenteSeleccionadoId'  react-hooks/exhaustive-deps
  240:5   warning  React Hook React.useCallback has a missing dependency: 'setIncidenteSeleccionadoId'  react-hooks/exhaustive-deps
  282:5   warning  React Hook React.useCallback has a missing dependency: 'setIncidenteSeleccionadoId'  react-hooks/exhaustive-deps
  347:5   warning  React Hook React.useCallback has a missing dependency: 'setIncidenteSeleccionadoId'  react-hooks/exhaustive-deps
  368:5   warning  'ultimoEvento' is assigned a value but never used                                    @typescript-eslint/no-unused-vars

/home/ds2fery/Documentos/Proyecto/sgrai-uach/web/src/components/mando/mision/MisionReportesSection.tsx
  395:74  error  Compilation Skipped: Existing memoization could not be preserved (`hitoReclasificacion`)  react-hooks/preserve-manual-memoization
  400:27  error  Compilation Skipped: Existing memoization could not be preserved (`itemsUnificados`)      react-hooks/preserve-manual-memoization
  425:26  error  Compilation Skipped: Existing memoization could not be preserved (`hitoReclasificacion`)  react-hooks/preserve-manual-memoization

/home/ds2fery/Documentos/Proyecto/sgrai-uach/web/src/components/ui/ToastItem.tsx
  48:39  error  Error: Cannot call impure function during render (`Date.now`)  react-hooks/purity

/home/ds2fery/Documentos/Proyecto/sgrai-uach/web/src/hooks/__tests__/useIncidentesKanban.test.ts
  13:27  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  14:32  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  15:27  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

✖ 26 problems (9 errors, 17 warnings)
```

#### Comando 2: Verificación de Tipos y Compilación Next.js (`CP-H38-WEB-15`)
```bash
npx tsc --noEmit && npm run build
```

**Salida real obtenida (exit code `0`):**
```text
▲ Next.js 16.3.4 (webpack)
- Environments: .env.local
✓ Running next.config.ts took 145ms
✓ Compiled successfully in 11.5s
✓ Finished TypeScript in 7.8s
✓ Collecting page data using 15 workers in 687ms
✓ Generating static pages using 15 workers (47/47) in 1055ms
```

---

### 5.2 Suites Automatizadas Vitest (Global, Subconjunto y Filtros `-t`)

#### Comando 1: Suite Global del Repositorio (`CP-H38-WEB-16`)
```bash
npm test -- --run
```

**Salida real obtenida:**
```text
 RUN  v3.2.7 /home/ds2fery/Documentos/Proyecto/sgrai-uach/web

 Test Files  128 passed (128)
      Tests  861 passed (861)
   Duration  35.38s (transform 14.90s, setup 31.84s, collect 74.35s, tests 99.48s, environment 212.40s, prepare 24.55s)
```

#### Comando 2: Subconjunto de 11 Suites Vinculadas a Centro de Mando, Socket.io, Toasts y Utilidades
```bash
npx vitest run \
  src/components/mando/__tests__/IncidenteCard.test.tsx \
  src/components/mando/__tests__/IncidenteDetalleDrawer.test.tsx \
  src/components/mando/__tests__/IncidenteMisionesSection.test.tsx \
  src/components/mando/mision/__tests__/MisionDetalleModal.test.tsx \
  src/hooks/__tests__/useEncargadoKanbanSocket.test.ts \
  src/hooks/__tests__/useIncidentesKanban.test.ts \
  src/hooks/__tests__/usePatrullas.test.ts \
  src/lib/utils/__tests__/estadoUtils.test.ts \
  src/components/ui/__tests__/Toast.test.tsx \
  src/services/__tests__/incidentesService.test.ts \
  src/services/__tests__/misionesService.test.ts
```

**Salida real obtenida:**
```text
 ✓ src/services/__tests__/incidentesService.test.ts (6 tests) 24ms
 ✓ src/lib/utils/__tests__/estadoUtils.test.ts (17 tests) 17ms
 ✓ src/services/__tests__/misionesService.test.ts (10 tests) 44ms
 ✓ src/hooks/__tests__/useEncargadoKanbanSocket.test.ts (8 tests) 94ms
 ✓ src/hooks/__tests__/usePatrullas.test.ts (8 tests) 172ms
 ✓ src/hooks/__tests__/useIncidentesKanban.test.ts (5 tests) 333ms
 ✓ src/components/ui/__tests__/Toast.test.tsx (1 test) 396ms
 ✓ src/components/mando/__tests__/IncidenteCard.test.tsx (12 tests) 605ms
 ✓ src/components/mando/__tests__/IncidenteMisionesSection.test.tsx (7 tests) 800ms
 ✓ src/components/mando/mision/__tests__/MisionDetalleModal.test.tsx (16 tests) 1457ms
 ✓ src/components/mando/__tests__/IncidenteDetalleDrawer.test.tsx (13 tests) 1950ms

 Test Files  11 passed (11)
      Tests  103 passed (103)
   Duration  6.41s
```

#### Comando 3: Ejecuciones Filtradas Específicas para HU-38 (`npm test -- --run -t "HU-38"`)
```bash
npm test -- --run -t "HU-38"
```

**Salida real obtenida:**
```text
 ✓ src/components/mando/__tests__/IncidenteDetalleDrawer.test.tsx (13 tests | 12 skipped) 864ms
   ✓ muestra el acceso rápido al último reporte de las misiones activas y permite abrir todos los reportes de la misión en MisionDetalleModal (HU-38)  861ms
 ✓ src/components/mando/mision/__tests__/MisionDetalleModal.test.tsx (16 tests | 15 skipped) 501ms
   ✓ debe renderizar los reportes de evaluación en terreno con versión (Inicial y Rectificación), comparativa de prioridad sugerida vs confirmada, justificación y desglose demográfico (HU-38)  498ms
 ✓ src/components/mando/__tests__/IncidenteMisionesSection.test.tsx (7 tests | 6 skipped) 420ms
   ✓ debe mostrar el acceso directo al último reporte realizado de las misiones activas y permitir acceder a todos los reportes de la misión (HU-38)  418ms
 ✓ src/components/mando/__tests__/IncidenteCard.test.tsx (12 tests | 11 skipped) 84ms

 Test Files  4 passed | 124 skipped (128)
      Tests  4 passed | 857 skipped (861)
   Start at  14:27:17
   Duration  21.68s
```

```bash
npm test -- --run src/components/mando/__tests__/IncidenteCard.test.tsx -t "HU-38"
npm test -- --run src/components/mando/__tests__/IncidenteMisionesSection.test.tsx -t "HU-38"
npm test -- --run src/components/mando/__tests__/IncidenteDetalleDrawer.test.tsx -t "HU-38"
npm test -- --run src/components/mando/mision/__tests__/MisionDetalleModal.test.tsx -t "HU-38"
```

**Salidas individuales observadas:**
* `IncidenteCard.test.tsx -t "HU-38"`: `1 passed | 11 skipped (12)` en `100ms` (`Duration 3.01s`).
* `IncidenteMisionesSection.test.tsx -t "HU-38"`: `1 passed | 6 skipped (7)` en `419ms` (`Duration 3.27s`).
* `IncidenteDetalleDrawer.test.tsx -t "HU-38"`: `1 passed | 12 skipped (13)` en `479ms` (`Duration 2.37s`).
* `MisionDetalleModal.test.tsx -t "HU-38"`: `1 passed | 15 skipped (16)` en `246ms` (`Duration 1.77s`).

---

### 5.3 Pruebas de Integración HTTP/JSON con cURL contra `sgrai-api` (`http://127.0.0.1:3001`)

#### Escenario A: Autenticación de Encargado (`POST /api/seguridad/login`) — `200 OK`
```bash
curl -s -w "\nHTTP_STATUS:%{http_code}\n" -X POST "http://127.0.0.1:3001/api/seguridad/login" \
  -H "Content-Type: application/json" \
  -d '{"identificador":"encargado@valdivia.cl","password":"Valdivia2026!"}'
```

**Respuesta HTTP/JSON real obtenida (`200 OK`):**
```json
{
  "data": {
    "token": "<TOKEN_JWT_ENCARGADO>",
    "tipoToken": "Bearer",
    "expiraEn": "2026-11-18T01:25:21.000Z",
    "usuario": {
      "id": "00000000-0000-4000-8000-000000000003",
      "rut": "33333333-3",
      "nombre": "Encargado de Operaciones",
      "email": "encargado@valdivia.cl",
      "rolCodigo": "ENCARGADO",
      "permisos": [
        "misiones:asignar",
        "recursos:leer",
        "incidentes:kanban",
        "misiones:leer",
        "recuperacion:crear",
        "prevencion:eventos:crear",
        "asistencia_social:crear",
        "asistencia_social:leer",
        "personal:leer"
      ]
    }
  }
}
```

#### Escenario B: Fallo de Autenticación en `GET /api/incidentes/kpis` y `GET /api/misiones` sin Bearer Token (`BUG-H38-WEB-03`) — `401 Unauthorized`
```bash
curl -s -w "\nHTTP_STATUS:%{http_code}\n" "http://127.0.0.1:3001/api/incidentes/kpis" \
  -H "x-user-id: 00000000-0000-4000-8000-000000000003"

curl -s -w "\nHTTP_STATUS:%{http_code}\n" "http://127.0.0.1:3001/api/misiones?page=1&limit=2" \
  -H "x-user-id: 00000000-0000-4000-8000-000000000003"
```

**Respuesta HTTP/JSON real obtenida (`401 Unauthorized` en ambos):**
```json
{"message":"Se requiere cabecera de autenticación Authorization: Bearer <token>."}
HTTP_STATUS:401
```

#### Escenario C: Consulta Autenticada de Tablero y Detalle de Incidente con Reportes Versionados (`CP-H38-WEB-13` / Evidencia `BUG-H38-WEB-05`) — `200 OK`
```bash
curl -s -w "\nHTTP_STATUS:%{http_code}\n" "http://127.0.0.1:3001/api/incidentes?page=1&limit=3" \
  -H "Authorization: Bearer $TOKEN"

curl -s -w "\nHTTP_STATUS:%{http_code}\n" "http://127.0.0.1:3001/api/incidentes/dd7db71e-e878-4b58-a115-a848dc88bb38" \
  -H "Authorization: Bearer $TOKEN"
```

**Fragmento relevante de respuesta HTTP/JSON real obtenida (`200 OK`, `INC-2026-9932`):**
```json
{
  "message": "Detalle de incidente obtenido exitosamente.",
  "data": {
    "id": "dd7db71e-e878-4b58-a115-a848dc88bb38",
    "codigo": "INC-2026-9932",
    "tipoAfectacion": "Corte de energía",
    "estado": "VERIFICANDO",
    "prioridad": "BAJA",
    "prioridadSugerida": "BAJA",
    "justificacionPrioridad": null,
    "requiereAsistenciaSocial": true,
    "verificado": true,
    "reclasificadoEnTerreno": true,
    "justificacionReclasificacion": "Reporte de evaluación #4 (Rectificación): Prioridad actualizada en terreno de BAJA a BAJA (Sugerida: BAJA). Confirmada conforme a prioridad sugerida por el sistema.",
    "reclasificacionTipologia": null,
    "ultimoReporte": {
      "origen": "REPORTE_TERRENO",
      "reporteId": "cda585a1-77e9-4a06-a755-a690e625acd7",
      "misionId": "247be4dd-a0b8-490f-8d66-4de1144ddd02",
      "misionCodigo": "MIS-2026-0008",
      "evaluadorNombre": "Pedro Valenzuela",
      "prioridadAsignada": "BAJA",
      "versionReporte": 4,
      "esRectificacion": true
    }
  }
}
```

#### Escenario D: Consulta de Detalle de Misión y Bitácora Cronológica (`CP-H38-WEB-13` / Evidencia `BUG-H38-WEB-07`) — `200 OK`
```bash
curl -s -w "\nHTTP_STATUS:%{http_code}\n" "http://127.0.0.1:3001/api/misiones/247be4dd-a0b8-490f-8d66-4de1144ddd02" \
  -H "Authorization: Bearer $TOKEN"
```

**Fragmento relevante de respuesta HTTP/JSON real obtenida (`200 OK`, `MIS-2026-0008`):**
```json
{
  "message": "Detalle de misión obtenido exitosamente.",
  "data": {
    "id": "247be4dd-a0b8-490f-8d66-4de1144ddd02",
    "codigo": "MIS-2026-0008",
    "estado": "EN_CURSO",
    "prioridad": "CRITICA",
    "incidente": {
      "id": "dd7db71e-e878-4b58-a115-a848dc88bb38",
      "codigo": "INC-2026-9932",
      "prioridad": "CRITICA",
      "prioridadSugerida": "ALTA",
      "justificacionPrioridad": "Confirmado riesgo crítico en terreno por paciente electrodependiente."
    },
    "bitacoraTiempos": [
      {
        "id": "66be8b81-c768-4bce-af9d-7a659c67815f",
        "hito": "PRIORIDAD_RECTIFICADA",
        "descripcion": "Reporte de evaluación #5 (Rectificación): Prioridad actualizada en terreno de BAJA a CRITICA (Sugerida: ALTA). Justificación: Confirmado riesgo crítico en terreno por paciente electrodependiente."
      }
    ],
    "evaluaciones": {
      "tipologiaEvaluada": false,
      "tipologiaEvaluadaEn": null,
      "prioridadEvaluada": true,
      "prioridadEvaluadaEn": "2026-11-17T17:26:04.887Z",
      "versionReportePrioridad": 5
    }
  }
}
```

#### Escenario E: Validación de Segregación RBAC en Endpoint HU-38 (`CP-H38-WEB-14`) — `403 Forbidden`
```bash
curl -s -w "\nHTTP_STATUS:%{http_code}\n" -X PATCH "http://127.0.0.1:3001/api/incidentes/dd7db71e-e878-4b58-a115-a848dc88bb38/prioridad" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"prioridad":"ALTA"}'
```

**Respuesta HTTP/JSON real obtenida (`403 Forbidden`):**
```json
{"message":"No cuenta con el permiso requerido: misiones:terreno:verificar"}
HTTP_STATUS:403
```

---

## 6. Matriz de Trazabilidad de Criterios de Aceptación (CA)

| Criterio de Aceptación / Requisito (HU-38) | Responsabilidad Arquitectónica | Cobertura en `sgrai-web` | Estado QA | Casos y Defectos Asociados |
|---|---|---|---|---|
| **CA-1:** Mostrar de forma visible la `prioridad_sugerida` calculada preliminarmente por el sistema | `sgrai-pwa` (evaluación) / `sgrai-web` (auditoría en mando) | `IncidenteDetalleHeader`, `IncidenteCard`, `IncidenteMisionesSection` y `MisionReportesSection` exhiben `prioridadSugerida` frente a la confirmada | 🟢 **CUMPLE** | `CP-H38-WEB-01`, `CP-H38-WEB-03`, `CP-H38-WEB-05`, `CP-H38-WEB-06` |
| **CA-2:** Proveer selector con los cuatro niveles canónicos `BAJA`, `MEDIA`, `ALTA`, `CRITICA` | `sgrai-pwa` / `sgrai-api` | `sgrai-web` mapea y formatea los cuatro niveles canónicos en chips, filtros y tarjetas sin enums crudos salvo el Toast defectuoso | 🟡 **PARCIAL** | `CP-H38-WEB-12`, `BUG-H38-WEB-07` |
| **CA-3:** Campo obligatorio `justificacion_prioridad` ($\ge 5$ chars) si la patrulla modifica la prioridad sugerida | `sgrai-pwa` / `sgrai-api` | `sgrai-web` despliega la justificación técnica en tooltip, `IncidenteMisionesSection` y `MisionReportesSection`, pero retiene valor previo si rectificación posterior envía `null` | 🟡 **PARCIAL** | `CP-H38-WEB-01`, `CP-H38-WEB-03`, `CP-H38-WEB-06` |
| **CA-4:** Actualización transaccional de `incidente.prioridad`, `justificacion_prioridad` e hito en `mision_hito` | `sgrai-api` | `sgrai-web` consume el detalle de incidente y misión con reportes versionados e hitos `PRIORIDAD_ASIGNADA` / `PRIORIDAD_RECTIFICADA`, con falla de formato en `de BAJA` y falsa etiqueta de tipología | 🟡 **PARCIAL** | `CP-H38-WEB-06`, `CP-H38-WEB-13`, `BUG-H38-WEB-05`, `BUG-H38-WEB-07` |
| **CA-5:** Emisión WebSocket `incidente:actualizado` al Centro de Mando reflejando el nuevo badge en el tablero Kanban | `sgrai-api` + `sgrai-web` | Evento paralelo `mision:actualizada` sobrescribe prioridad a `MEDIA`; `IncidenteDetalleDrawer` congela `ultimoReporte`; `justificacionReclasificacion` se contamina | 🔴 **NO CUMPLE** | `CP-H38-WEB-09`, `CP-H38-WEB-10`, `BUG-H38-WEB-02`, `BUG-H38-WEB-05`, `BUG-H38-WEB-06` |
| **CA-6:** Endpoint requiere permiso RBAC `misiones:terreno:verificar` | `sgrai-api` | Verificado en vivo que rol `ENCARGADO` recibe `403 Forbidden`; sin embargo `obtenerKpis` y `misionesService.listar` en esta rama fallan con `401` | 🟡 **PARCIAL** | `CP-H38-WEB-14`, `BUG-H38-WEB-03` |
| **Transversales:** ESLint, OpenAPI (`GEMINI.md §4`) y Manual con capturas (`GEMINI.md §7`) | `sgrai-web` | `9` errores ESLint bloqueantes, `api-generated.d.ts` sin regenerar y `3` capturas faltantes en manual H38 | 🔴 **NO CUMPLE** | `BUG-H38-WEB-01`, `BUG-H38-WEB-04`, `BUG-H38-WEB-08` |

