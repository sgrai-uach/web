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
> * `docs(qa): documentar primera versión de casos de prueba para HU-38`
> * `fix(h38): resolver conflictos con develop y corregir errores de ESLint`
> * `fix(h38): resolver hallazgos de QA (BUG-H38-WEB-01..08)`
>  
> **Fecha y Hora de Auditoría Inicial:** `17/11/2026 14:28 -03:00`  
> **Fecha y Hora de Re-Test (Ciclo 2):** `18/11/2026 02:35 -03:00`  
> **Estado de Certificación:** 🔴 **RECHAZADO EN RE-TEST / CHANGES REQUESTED (4 Defectos Subsanados y 4 Defectos Parciales Abiertos)**.

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

En el **Ciclo 1 (`17/11/2026 14:28`)**, la auditoría forense detectó **8 defectos abiertos** (`2` Críticos, `4` Altos y `2` Medios). Tras los commits de remediación `fix(h38): resolver conflictos con develop y corregir errores de ESLint` y `fix(h38): resolver hallazgos de QA (BUG-H38-WEB-01..08)`, se ejecutó el **Re-Test (Ciclo 2 — `18/11/2026 02:35`)** mediante análisis estático (`npm run lint`, `npx tsc --noEmit`), build productivo (`npm run build`), ejecución completa y focalizada de Vitest, simulación no destructiva de fusión contra `develop` (`git merge-tree`) e inspección línea a línea de código y documentación.

El Re-Test confirma el cierre completo de **4 defectos** (**`BUG-H38-WEB-01`**, **`BUG-H38-WEB-02`**, **`BUG-H38-WEB-06`** y **`BUG-H38-WEB-07`**), logrando `0` errores en ESLint, `0` errores TypeScript, compilación limpia de `47/47` rutas en Next.js y aprobación de **`895/895` pruebas Vitest en `129` archivos**. No obstante, **4 defectos permanecen en estado `ABIERTO` por subsanación incompleta** (`BUG-H38-WEB-03`, `BUG-H38-WEB-04`, `BUG-H38-WEB-05` y `BUG-H38-WEB-08`), manteniendo el dictamen en **RECHAZADO (`Changes Requested`)**.

| Métrica / Verificación | Ciclo 1 (`17/11/2026`) | Re-Test Ciclo 2 (`18/11/2026`) | Observaciones Técnicas |
|---|:---:|:---:|---|
| **Total de Casos en Matriz** | **24** | **24** | `8` Defectos (`BUG-H38-WEB-01`..`08`) + `16` Casos (`CP-H38-WEB-01`..`16`) |
| **Casos Aprobados / Corregidos** | **16** (`66.7%`) | **20** (`83.3%`) | `16` `APROBADO` + `4` `CORREGIDO` (`BUG-H38-WEB-01`, `02`, `06`, `07`) |
| **Defectos Abiertos (`ABIERTO`)** | **8** (`2C, 4A, 2M`) | **4** (`0C, 3A, 1M`) | Persisten: `BUG-H38-WEB-03`, `BUG-H38-WEB-04`, `BUG-H38-WEB-05`, `BUG-H38-WEB-08` |
| **Análisis Estático ESLint (`npm run lint`)** | 🔴 `9` errores / `17` warnings | 🟢 **`0` errores / `11` warnings** | Los `11` warnings provienen de archivos previos ya saneados en `develop` |
| **Chequeo de Tipos (`npx tsc --noEmit`)** | 🟢 `0` errores | 🟢 **`0` errores** | Exit code `0` (`apiClient` en `misionesService.obtenerDetalle` mantiene casteo manual) |
| **Build de Producción (`npm run build`)** | 🟢 `11.5s` / `47` páginas | 🟢 **`13.2s` / `47` páginas** | TypeScript `9.2s`; exit code `0` (`next build --webpack`) |
| **Suite Global Vitest (`npm test -- --run`)** | 🟢 `128` files / `861` tests | 🟢 **`129` files / `895` tests** | Duración `35.44s` (con mocks de API/Socket) |
| **Subconjunto HU-38 (`npx vitest run` 11 suites)** | 🟢 `11` files / `103` tests | 🟢 **`11` files / `125` tests** | Duración `9.54s`; filtro `-t "HU-38\|BUG-H38-WEB"` ejecuta `6` pruebas (`889 skipped`) en `23.31s` |
| **Compatibilidad Merge vs `develop`** | 🔴 Desfase `10` commits | 🔴 **Conflictos en `2` archivos** | Integró merge previo de PR #42 en lugar de `develop`; `git merge-tree` falla en `incidentesService.ts` y `misionesService.ts` |
| **Contrato OpenAPI (`api-generated.d.ts`)** | 🔴 Desincronizado | 🟡 **Regenerado con pendiente** | Resuelto en `incidentesService.ts`; pendiente en `misionesService.ts` (`obtenerDetalle`) y `misiones.ts` |
| **Manual H38 y Capturas (`GEMINI.md §7`)** | 🔴 Sin PNGs + copy | 🔴 **Sin directorio `assets/`** | Copy de botón corregido; las `3` capturas PNG enlazadas siguen sin existir |

> **Nota sobre verificación HTTP en vivo durante el Re-Test (`18/11/2026 02:34`):** La instancia local de `sgrai-api` en `http://127.0.0.1:3001` no estuvo disponible durante la ventana de Re-Test (`OPENAPI_HTTP:000`, código de salida `7`). En consecuencia, los casos `CP-H38-WEB-13` y `CP-H38-WEB-14` mantienen la evidencia viva ejecutada el `17/11/2026 14:26`, mientras que las correcciones de `BUG-H38-WEB-03` se verificaron mediante inspección de código, pruebas unitarias Vitest (`incidentesService.test.ts`, `misionesService.test.ts`) y simulación de merge contra `develop`.

---

## 2. Registro Técnico de Defectos

### 2.1. Defectos Abiertos / Subsanación Incompleta en Re-Test (`18/11/2026`)

#### `BUG-H38-WEB-03` — Migración Incompleta Respecto a `develop` con Conflictos de Merge en Servicios de Incidentes y Misiones
* **Severidad:** **Alta** (Bloqueante de integración limpia en Pull Request hacia `develop`).
* **Estado en Re-Test:** `ABIERTO` (Parcialmente subsanado — migración `apiClient` aplicada localmente, pero sin sincronizar la punta de `develop`).
* **Archivos Afectados:**
  * `src/services/incidentesService.ts`
  * `src/services/misionesService.ts` (líneas `89`–`105`, `194`–`212`)
* **Verificación en Re-Test (`18/11/2026`):**
  1. **Aspecto subsanado:** Tanto `incidentesService.obtenerKpis` como `misionesService.listar` dejaron de usar `fetch()` directo y ahora consumen `apiClient.GET(...)`, beneficiándose del interceptor JWT de `src/lib/api/client.ts`.
  2. **Brecha persistente:** El commit de integración integró un merge intermedio (PR #42) en lugar de la punta actual de `develop` (`cabb4c2`), dejando `5` commits sin incorporar (incluidos `fix(mando): migrar consulta de KPIs a apiClient con Bearer JWT y proxy relativo`, `fix(misiones): autenticar listado de misiones con Bearer JWT vía apiClient y tipar obtenerDetalle` y `fix(lint): remover código muerto post-merge, corregir cleanup en KanbanBoard y sanear 11 advertencias ESLint`).
  3. Al ejecutar `git merge-tree --write-tree develop HEAD`, Git reporta **`CONFLICTO (contenido)` en `src/services/incidentesService.ts` y `src/services/misionesService.ts`**.
  4. Adicionalmente, en `misionesService.ts:98-100`, si no existe cookie de sesión, la llamada pasa `header: { authorization: '' }` (cadena vacía) en vez de omitir el header cuando no hay token o contemplar el fallback implementado en `develop`.
* **Comportamiento Esperado:** Sincronizar la rama con la punta actual de `develop` resolviendo los conflictos en `incidentesService.ts` y `misionesService.ts` (incorporando las pruebas JWT/401/403 de `misionesService.test.ts`) hasta obtener un `git merge-tree` limpio.

---

#### `BUG-H38-WEB-04` — Persistencia de Casteos `as unknown as` y DTOs Manuales en `misionesService.ts` y `src/types/misiones.ts` (`GEMINI.md §4`)
* **Severidad:** **Alta** (Incumplimiento parcial del contrato OpenAPI tipado).
* **Estado en Re-Test:** `ABIERTO` (Parcialmente subsanado — resuelto en `api-generated.d.ts` e `incidentesService.ts`, pendiente en módulo de misiones).
* **Archivos Afectados:**
  * `src/services/misionesService.ts` (líneas `122`–`132`, `194`–`212`)
  * `src/types/misiones.ts` (líneas `67`–`115`, `176`–`242`)
* **Verificación en Re-Test (`18/11/2026`):**
  1. **Aspecto subsanado:** `src/types/api-generated.d.ts` (`14692` líneas) fue regenerado incluyendo `/api/incidentes/{id}/prioridad`, `/api/incidentes/{id}/prioridad/calcular` y los campos HU-38/HU-35; `src/services/incidentesService.ts` eliminó las intersecciones `& { ... }` y derivó `IncidenteResumen`, `IncidenteDetalle`, `ReporteEvaluacionTerreno`, `EvaluacionTerrenoDetalle`, `ReclasificacionTipologiaResumen` y `UltimoReporteIncidenteResumen` directamente desde `components['schemas']`.
  2. **Brecha persistente:**
     * `misionesService.ts:194-205` (`obtenerDetalle`) **mantiene el casteo `(apiClient as unknown as { GET: ... }).GET('/api/misiones/{id}')`** hacia la interfaz manual `MisionDetalleResponse`, aunque `/api/misiones/{id}` ya está completamente tipado en `src/types/api-generated.d.ts:3669-4015`.
     * `misionesService.ts:122-132` sigue casteando `(data.data || []) as MisionItem[]` y `(data as unknown as { meta?: ... }).meta` cuando `data.meta` ya existe tipado en `src/types/api-generated.d.ts:3441-3454`.
     * `src/types/misiones.ts:67-242` mantiene definiciones manuales de `MisionItem`, `ReporteTerrenoDetalle`, `MisionBitacoraHito`, `MisionDetalleCompleto` y `MisionDetalleResponse` en lugar de derivarlas desde `paths['/api/misiones']` y `paths['/api/misiones/{id}']`. *(Nota de coordinación entre repositorios: `sgrai-api` aún no expone `prioridadSugerida` ni `justificacionPrioridad` en el sub-esquema `incidente` de `/api/misiones/{id}`, por lo cual si se requiere ese subcampo en el modal de misión debe documentarse en OpenAPI de `sgrai-api` y regenerar).*
* **Comportamiento Esperado:** Eliminar el casteo `apiClient as unknown as` en `misionesService.ts:194`, usar `data.meta` tipado en `misionesService.listar` y derivar los DTOs de misiones desde `src/types/api-generated.d.ts`.

---

#### `BUG-H38-WEB-05` — Falsa Etiqueta `Reclasificado` Persiste en `IncidenteResumenSection` para Reporte #1 (`PRIORIDAD_ASIGNADA`)
* **Severidad:** **Alta** (Información operativa errónea mostrada al Encargado en el flujo inicial de HU-38).
* **Estado en Re-Test:** `ABIERTO` (Parcialmente subsanado — protegido contra WebSocket y rectificaciones #2+, pero roto en el flujo estándar de Reporte #1).
* **Archivos Afectados:**
  * `src/components/mando/drawer/IncidenteResumenSection.tsx` (líneas `37`–`60`)
* **Verificación en Re-Test (`18/11/2026`):**
  1. **Aspecto subsanado:** Los listeners WebSocket en `useIncidentesKanban.ts:464-467` e `IncidenteDetalleDrawer.tsx:83-92` ya no sobrescriben `justificacionReclasificacion` cuando llega un evento con `reporteTerreno`, e `IncidenteResumenSection.tsx:38` filtra la glosa `"Prioridad actualizada..."` de rectificaciones (`PRIORIDAD_RECTIFICADA`).
  2. **Brecha persistente:** Al contrastar `IncidenteResumenSection.tsx:37-46` frente a `sgrai-api/src/modules/incidentes/prioridad.repository.ts:538` y `incidente-kanban.service.ts:359-360`:
     * En el backend, todo **Reporte #1 (`PRIORIDAD_ASIGNADA`)** registra en `mision_hito` y proyecta en `justificacionReclasificacion` la glosa:  
       `"Reporte de evaluación #1: Prioridad asignada en terreno a [NIVEL] (Sugerida: [NIVEL])."` — donde figura **`Prioridad asignada`** y **no** `"Prioridad actualizada"`. Además, `sgrai-api` establece `reclasificadoEnTerreno: true` y `reclasificacionTipologia: null`.
     * La expresión regular de `IncidenteResumenSection.tsx:38`:
       ```ts
       const esGlosaSoloPrioridad = /^(?:Reporte de evaluaci[oó]n[^:]*:\s*)?Prioridad actualizada\b/i.test(justif);
       ```
       evalúa **`false`** ante `"Reporte de evaluación #1: Prioridad asignada en terreno..."` y también evalúa **`false`** si `justif === ''` (`justificacionReclasificacion === null`) mientras `reclasificadoEnTerreno === true`.
     * Por tanto, en ambos escenarios entra al bloque `if ((detalle.reclasificadoEnTerreno || ...) && !esGlosaSoloPrioridad)` y despliega falsamente el chip **`Reclasificado`** junto al `Tipo de Afectación`. (La prueba agregada en `IncidenteDetalleDrawer.test.tsx:1084` solo ejercitó el texto `"Prioridad actualizada"`, sin cubrir `"Prioridad asignada"` ni `justificacionReclasificacion: null`).
* **Comportamiento Esperado:** Cuando `detalle.reclasificacionTipologia` es `null`, no mostrar etiqueta de reclasificación tipológica si `justif` inicia con `Prioridad asignada` / `Prioridad actualizada` o si no existe texto que evidencie cambio/confirmación de tipología (`justif === ''`).

---

#### `BUG-H38-WEB-08` — Capturas de Pantalla Siguen Inexistentes en Manual `H38-evaluacion-prioridad-terreno-mando.md` (`GEMINI.md §7`)
* **Severidad:** **Media** (Documentación de usuario con enlaces multimedia rotos).
* **Estado en Re-Test:** `ABIERTO` (Parcialmente subsanado — copy de botón corregido, imágenes ausentes).
* **Archivos Afectados:**
  * `docs/manuals/H38-evaluacion-prioridad-terreno-mando.md` (líneas `28`, `39`, `41`, `52`)
  * `docs/manuals/assets/h38-evaluacion-prioridad-terreno-mando/` (directorio inexistente)
* **Verificación en Re-Test (`18/11/2026`):**
  1. **Aspecto subsanado:** La línea `39` del manual ahora documenta ambas variantes del botón (`Ver Reportes en Misión (1)` / `Ver Todos los Reportes (N)`).
  2. **Brecha persistente:** Al inspeccionar `docs/manuals/assets/`, se constató que el directorio `docs/manuals/assets/h38-evaluacion-prioridad-terreno-mando/` **aún no existe**, por lo que las tres imágenes enlazadas (`kanban-card-prioridad-reportes.png`, `drawer-acceso-ultimo-reporte.png` y `mision-detalle-historial-reportes.png`) continúan rotas.
* **Comportamiento Esperado:** Crear `docs/manuals/assets/h38-evaluacion-prioridad-terreno-mando/` y versionar las tres capturas de pantalla reales exigidas por `GEMINI.md §7`.

---

### 2.2. Defectos Verificados y Corregidos en Re-Test (`18/11/2026`)

#### `BUG-H38-WEB-01` — Fallo de ESLint (`npm run lint`) con 9 Errores de React Compiler, Hooks y `@typescript-eslint` — **CORREGIDO**
* **Verificación en Re-Test (`18/11/2026 02:32`):** Se corrigieron los `9` errores en `IncidentesKpiCards.tsx` (eliminación de `useEffect`/`setIsMounted`), `KanbanBoard.tsx` (uso de `setIncidenteSeleccionadoIdRef`), `MisionReportesSection.tsx` (estabilidad de memoización), `ToastItem.tsx` (inicialización pura de `startTimeRef` en `0`) y `useIncidentesKanban.test.ts` (tipado de `socketCallbacks`). `npm run lint` finaliza con **`exit 0` (`0 errors, 11 warnings)`**.

#### `BUG-H38-WEB-02` — Sobrescritura de Prioridad a `MEDIA` y `verificado: true` Prematuro ante `mision:actualizada` — **CORREGIDO**
* **Verificación en Re-Test (`18/11/2026 02:33`):** `useEncargadoKanbanSocket.ts:340-345, 375` convierte `prioridad` en opcional y omite inyectar `'MEDIA'` cuando `mision:actualizada` no trae `prioridad`. `useIncidentesKanban.ts:431-462` evalúa `esSintetico` para preservar `incActual.prioridad` y `Boolean(incActual.verificado)`. Verificado adicionalmente con la nueva prueba `BUG-H38-WEB-02` en `src/hooks/__tests__/useIncidentesKanban.test.ts` (`7/7` pass).

#### `BUG-H38-WEB-06` — `ultimoReporte` Congelado en Drawer y Limpieza de `justificacionPrioridad: null` Tras Rectificación — **CORREGIDO**
* **Verificación en Re-Test (`18/11/2026 02:33`):** `IncidenteDetalleDrawer.tsx:65-78, 98-122, 134` reconstruye `ultimoReporte` al recibir `reporteEntrante` y respeta `null` en `justificacionPrioridad` y `prioridadSugerida`. `MisionDetalleModal.tsx:188-244` y `useEncargadoKanbanSocket.ts:209-221` distinguen `=== null` de `undefined`, e `IncidenteCard.tsx:59-60` remueve el fallback legado `cambioPrioridadMotivo`, garantizando que el chip `Ajustada` se oculte al ratificarse la sugerencia del sistema.

#### `BUG-H38-WEB-07` — Prioridad `ALL CAPS` en `ToastItem.tsx` y Prefijo `de <PRIORIDAD>` en `limpiarDescripcionBitacora` — **CORREGIDO**
* **Verificación en Re-Test (`18/11/2026 02:33`):** `ToastItem.tsx:264` renderiza `formatearPrioridad(toast.priorityBadge, toast.priorityBadge)` mostrando Sentence Case (`Crítica`, `Alta`, `Media`, `Baja`), y `estadoUtils.ts:417` añade `de` al grupo de prefijos de su expresión regular, validado en `estadoUtils.test.ts:499-506` (`17/17` pass).

---

## 3. Matriz Consolidada de Casos de Prueba (13 Columnas Institucionales)

| ID Caso | Título del Caso de Prueba | Tipo de Prueba | Nivel | Prioridad | Precondición | Datos de Prueba (Payload / Headers / Query) | Resultado Esperado | Resultado Obtenido | Estado | Fecha / Hora Ejecución | Fecha / Hora Re-Test | Solución / Commit |
|---|---|---|---|---|---|---|---|---|:---:|:---:|:---:|---|
| `BUG-H38-WEB-03` | Autenticación JWT Bearer en `obtenerKpis` y `misionesService.listar` y sincronización limpia con `develop` | Seguridad / Integración | Servicio / Git | Alta | Rama `feature/h38-patrulla-asignar-prioridad` integrada hacia `develop` (`cabb4c2`) | `apiClient.GET('/api/incidentes/kpis')`, `apiClient.GET('/api/misiones')` y `git merge-tree --write-tree develop HEAD` | Servicios migrados a `apiClient` sin conflictos de fusión contra `develop` | Migración `apiClient` aplicada, pero `20e1d9b` integró merge previo generando conflictos en `incidentesService.ts` y `misionesService.ts` al fusionar con `develop` | **ABIERTO** | 17/11/2026 14:25 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| `BUG-H38-WEB-04` | Eliminación de DTOs manuales y casteos `as unknown as` con `src/types/api-generated.d.ts` (`GEMINI.md §4`) | Contrato / Tipado | Estático / DAL | Alta | `api-generated.d.ts` sincronizado con OpenAPI de `sgrai-api` | Inspección de `src/types/api-generated.d.ts`, `incidentesService.ts`, `misionesService.ts` y `src/types/misiones.ts` | Contratos de incidentes y misiones derivados de `paths`/`components['schemas']` sin `as unknown as` | Resuelto en `api-generated.d.ts` e `incidentesService.ts`, pero `misionesService.ts:194` mantiene `(apiClient as unknown as ...)` y `misiones.ts` mantiene DTOs manuales | **ABIERTO** | 17/11/2026 14:24 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| `BUG-H38-WEB-05` | Discriminación entre reclasificación de tipología (HU-37) y reportes de prioridad (HU-38 `#1` y `#2+`) en `IncidenteResumenSection` | Funcional / Consistencia | UI / Hook | Alta | Incidente con Reporte #1 (`PRIORIDAD_ASIGNADA`) o `justificacionReclasificacion: null`, `reclasificadoEnTerreno: true` y `reclasificacionTipologia: null` | `"Reporte de evaluación #1: Prioridad asignada en terreno a CRITICA (Sugerida: ALTA)."` y payload WS `incidente:actualizado` | No mostrar badge `Reclasificado` junto a `Tipo de Afectación` ni sobrescribir `justificacionReclasificacion` | WS corregido y `"Prioridad actualizada"` filtrada, pero `IncidenteResumenSection.tsx:38` omite `"Prioridad asignada"` y falla ante `justif === ''` mostrando falso chip `Reclasificado` | **ABIERTO** | 17/11/2026 14:25 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| `BUG-H38-WEB-08` | Existencia de capturas de pantalla y textos en manual `H38-evaluacion-prioridad-terreno-mando.md` (`GEMINI.md §7`) | Documentación / QA | Repositorio | Media | Manual en `docs/manuals/H38-evaluacion-prioridad-terreno-mando.md` | Inspección de líneas `28`, `39`, `41`, `52` y `ls -la docs/manuals/assets/` | Existencia de `3` PNG en `assets/h38-evaluacion-prioridad-terreno-mando/` y variantes de botón | Línea `39` actualizada con `Ver Reportes en Misión (1)`, pero el directorio `assets/h38-evaluacion-prioridad-terreno-mando/` y sus `3` PNG continúan inexistentes | **ABIERTO** | 17/11/2026 14:17 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| `BUG-H38-WEB-01` | Validación estática de ESLint y reglas de React Compiler / Hooks en la rama | Calidad / Linter | CI / Estático | Crítica | Repositorio en rama `feature/h38-patrulla-asignar-prioridad` | `npm run lint` | `0` errores bloqueantes de ESLint en componentes, hooks y pruebas | `npm run lint` finaliza con `exit 0` (`0 errors, 11 warnings` heredados previos); `9` errores previos subsanados | **CORREGIDO** | 17/11/2026 14:17 | 18/11/2026 02:32 | fix(h38): resolver conflictos con develop y corregir errores de ESLint |
| `BUG-H38-WEB-02` | Preservación de prioridad actualizada ante evento paralelo `mision:actualizada` sin campo prioridad (CA-5) | Tiempo Real / Concurrencia | Hook / Integración | Crítica | Tablero Kanban conectado a Socket.io; incidente en `VERIFICANDO` | `incidente:actualizado` (`CRITICA`) seguido de `mision:actualizada` (`EN_CURSO`, `esSintetico: true`, sin `prioridad`) | Tarjeta Kanban conserva `CRITICA` y mantiene `verificado` previo sin marcar `true` prematuramente | `useEncargadoKanbanSocket` omite `prioridad` por defecto y `useIncidentesKanban` preserva prioridad y `verificado` (`useIncidentesKanban.test.ts` `7/7` pass) | **CORREGIDO** | 17/11/2026 14:20 | 18/11/2026 02:33 | fix(h38): resolver hallazgos de QA (BUG-H38-WEB-01..08) |
| `BUG-H38-WEB-06` | Refresco en vivo de `ultimoReporte` en Drawer y limpieza de `justificacionPrioridad: null` en rectificaciones | Tiempo Real / UI | Drawer / Hook | Alta | `IncidenteDetalleDrawer` abierto con reporte previo; rectificación posterior con `justificacionPrioridad: null` | Evento WS `incidente:actualizado` con `reporteTerreno` (`#2`) y `justificacionPrioridad: null` | `IncidenteDetalleDrawer` reconstruye `ultimoReporte` y limpia `justificacionPrioridad` ocultando chip `Ajustada` | `IncidenteDetalleDrawer` actualiza `ultimoReporte`; hook/modal/drawer aceptan `null` y `IncidenteCard` removió `cambioPrioridadMotivo` | **CORREGIDO** | 17/11/2026 14:22 | 18/11/2026 02:33 | fix(h38): resolver hallazgos de QA (BUG-H38-WEB-01..08) |
| `BUG-H38-WEB-07` | Formato Sentence Case en badge de prioridad de `ToastItem.tsx` y humanización de `de <PRIORIDAD>` en bitácora | Estándares UI / I18n | UI / Utilidades | Media | Notificación Toast con `priorityBadge` y hito `PRIORIDAD_RECTIFICADA` | `priorityBadge: "CRITICA"` y `"Prioridad actualizada en terreno de BAJA a CRITICA (Sugerida: ALTA)"` | Toast muestra `Crítica` vía `formatearPrioridad` y bitácora formatea `de Baja a Crítica (Sugerida: Alta)` | `ToastItem.tsx:264` invoca `formatearPrioridad` y `estadoUtils.ts:417` agrega prefijo `de` (`estadoUtils.test.ts` `17/17` pass) | **CORREGIDO** | 17/11/2026 14:26 | 18/11/2026 02:33 | fix(h38): resolver hallazgos de QA (BUG-H38-WEB-01..08) |
| `CP-H38-WEB-01` | Despliegue de indicador `Ajustada`, tooltip comparativo y contador de reportes en `IncidenteCard` (CA-1, CA-3, CA-5) | Funcional / UI | Componente / Card | Crítica | Tarjeta `IncidenteCard` con `prioridad` distinta de `prioridadSugerida` y `totalReportesTerreno: 2` | `prioridad: 'CRITICA'`, `prioridadSugerida: 'ALTA'`, `justificacionPrioridad: 'Avance rápido del agua...'`, `totalReportesTerreno: 2` | Muestra chip `Ajustada`, prioridad `Crítica`, tooltip con sugerida/justificación y badge `2 reportes · Rectificado` | `IncidenteCard.test.tsx` aprueba `15/15` pruebas en `781ms` en Re-Test incluyendo caso HU-38 (`113ms`) | **APROBADO** | 17/11/2026 14:28 | 18/11/2026 02:33 | feat(mando): estandarizar tarjetas de reporte y desplegar afectacion de multiples familias (H38) |
| `CP-H38-WEB-02` | Visualización de chips `FIBE` y `Verificado` en tarjeta Kanban al cargar desde servidor (CA-4, CA-5) | Funcional / UI | Componente / Card | Alta | Incidente con `requiereAsistenciaSocial: true` y `verificado: true` | `IncidenteResumen` con `verificado: true`, `reclasificadoEnTerreno: false`, `requiereAsistenciaSocial: true` | Renderiza chips rectangulares `FIBE` (warning) y `Verificado` (success) persistentes tras recarga | Verificado en `IncidenteCard.test.tsx` (`15/15` pass en `781ms`) en Re-Test | **APROBADO** | 17/11/2026 14:27 | 18/11/2026 02:33 | fix(kanban): asegurar persistencia del chip verificado al paginar y refrescar |
| `CP-H38-WEB-03` | Exposición de prioridad confirmada y chip `Sugerida: [Nivel]` en cabecera del Drawer (CA-1, CA-3) | Funcional / UI | Componente / Header | Alta | `IncidenteDetalleDrawer` abierto para incidente con ajuste manual en terreno | `prioridad: 'CRITICA'`, `prioridadSugerida: 'ALTA'`, `justificacionPrioridad: 'Riesgo eléctrico activo...'` | Cabecera muestra chips `Prioridad: Crítica` y `Sugerida: Alta` con tooltip explicativo | Verificado en `IncidenteDetalleDrawer.test.tsx` (`19/19` pass en `2741ms`) en Re-Test | **APROBADO** | 17/11/2026 14:28 | 18/11/2026 02:33 | feat(mando): estandarizar tarjetas de reporte y desplegar afectacion de multiples familias (H38) |
| `CP-H38-WEB-04` | Renderizado de sección `Último Reporte de Terreno` con desglose de familias y navegación directa al modal de misión | Funcional / UI | Componente / Drawer | Alta | `IncidenteDetalle` con `ultimoReporte` y `reportesEvaluacionTerreno` incluyendo múltiples familias | `familias: ['Familia Morales', 'Casa 2 Interior']`, `nucleoFamiliarTotal: 6`, `nivelCompromisoVivienda: 'GRAVE_INHABITABLE'` | Despliega métricas de familias, personas, viviendas, compromiso y botón `Ver detalle` funcional | Verificado en `IncidenteDetalleDrawer.test.tsx` (`19/19` pass en `2741ms`) en Re-Test | **APROBADO** | 17/11/2026 14:27 | 18/11/2026 02:33 | feat(mando): estandarizar tarjetas de reporte y desplegar afectacion de multiples familias (H38) |
| `CP-H38-WEB-05` | Bloque `Último Reporte Realizado` en tarjetas de misión y accesos directos a último reporte / todos los reportes | Funcional / UI | Componente / Drawer | Alta | Misión activa con 2 reportes de evaluación (`#1 Inicial` y `#2 Rectificación`) | `reportesEvaluacionTerreno` con versiones `1` y `2` en `IncidenteMisionesSection` | Muestra `Reporte #2 — Rectificación Vigente`, comparativa de prioridad, resumen demográfico y botones de acceso | `IncidenteMisionesSection.test.tsx` aprueba `16/16` pruebas en `1723ms` en Re-Test | **APROBADO** | 17/11/2026 14:28 | 18/11/2026 02:33 | feat(mando): estandarizar tarjetas de reporte y desplegar afectacion de multiples familias (H38) |
| `CP-H38-WEB-06` | Historial versionado de reportes en `MisionReportesSection` con chips `Vigente`/`Histórico` y acordeón colapsable | Funcional / UI | Componente / Modal | Crítica | `MisionDetalleModal` abierto para misión con Reporte #1 (Inicial) y Reporte #2 (Rectificación) | `versionReporte: 1` y `2`, `prioridadSugerida: 'ALTA'`, `prioridadAsignada: 'CRITICA'`, `justificacionPrioridad` | Muestra `2 versiones registradas`, despliega por defecto solo el reporte vigente (`#2`) y colapsa el histórico (`#1`) | `MisionDetalleModal.test.tsx` aprueba `16/16` pruebas en `2210ms` en Re-Test | **APROBADO** | 17/11/2026 14:28 | 18/11/2026 02:33 | refactor(mando): estandarizar tarjetas y cabecera unificada de reportes de terreno (H37/H38) |
| `CP-H38-WEB-07` | Desglose individualizado de múltiples familias afectadas, vulnerabilidad y derivación FIBE en `MisionReportesSection` | Funcional / UI | Componente / Modal | Alta | Reporte con arreglo `detallesEvaluacion.familias` (>1 familia o con `referencia`) | `Familia Muñoz - Casa Principal` (4 pers., `GRAVE_INHABITABLE`, FIBE) y `Familia Díaz - Cabaña Interior` (3 pers., `MODERADO_PARCIAL`) | Despliega chip `2 hogares`, tarjetas individuales por familia con severidad y badge `Requiere FIBE`, más consolidado | Verificado en `MisionDetalleModal.test.tsx` (`16/16` pass en `2210ms`) en Re-Test | **APROBADO** | 17/11/2026 14:27 | 18/11/2026 02:33 | feat(mando): estandarizar tarjetas de reporte y desplegar afectacion de multiples familias (H38) |
| `CP-H38-WEB-08` | Despliegue de peligros activos y requerimientos operativos (evacuación, FIBE, riesgo eléctrico/estructural) | Funcional / UI | Componente / Modal | Alta | `detallesEvaluacion` con `requiereEvacuacion: true`, `requiereAsistenciaSocial: true` y `riesgosActivos` | `{ riesgoElectrico: true, riesgoEstructural: true, requiereEvacuacion: true, requiereAsistenciaSocial: true }` | Renderiza chips `Requiere Evacuación`, `Requiere Ficha FIBE`, `Riesgo Eléctrico` y `Riesgo Estructural` | Verificado en `MisionDetalleModal.test.tsx` (`16/16` pass en `2210ms`) en Re-Test | **APROBADO** | 17/11/2026 14:28 | 18/11/2026 02:33 | feat(mando): estandarizar tarjetas de reporte y desplegar afectacion de multiples familias (H38) |
| `CP-H38-WEB-09` | Recepción y deduplicación de eventos `incidente:actualizado` en `useEncargadoKanbanSocket` | Tiempo Real / Socket | Hook | Alta | Hook `useEncargadoKanbanSocket` montado y suscrito a `sala:encargados`, `encargado` y `mapa` | Emisión repetida de `incidente:actualizado` dentro de ventana de `4000ms` y evento con tipología/reporte | Deduplica emisiones repetidas por múltiples salas y limpia listeners/`salir` al desmontar | `useEncargadoKanbanSocket.test.ts` aprueba `10/10` casos en `144ms` en Re-Test | **APROBADO** | 17/11/2026 14:28 | 18/11/2026 02:33 | fix(mando): especificar cuando la tipologia no fue modificada por la patrulla y deduplicar socket kanban |
| `CP-H38-WEB-10` | Actualización en memoria del Tablero Kanban en `useIncidentesKanban` ante evento `incidente:actualizado` | Tiempo Real / Estado | Hook | Alta | Incidente cargado en columna `VERIFICANDO` del estado Kanban | Disparo de `onIncidenteActualizado` con nueva `prioridad`, `tipoAfectacion` y `justificacion` | Actualiza inmediatamente los atributos de la tarjeta en memoria sin recarga completa de página | `useIncidentesKanban.test.ts` aprueba `7/7` casos en `504ms` en Re-Test | **APROBADO** | 17/11/2026 14:27 | 18/11/2026 02:33 | feat(kanban): actualizar tipología, prioridad y justificación reactivamente vía websocket (#39) |
| `CP-H38-WEB-11` | Deduplicación de notificaciones Toast idénticas en `ToastProvider` | UX / Notificaciones | Componente / UI | Media | `ToastProvider` montado en el árbol de componentes | 4 invocaciones consecutivas de `showInfo` con idéntico título, mensaje y `codeBadge` | Muestra un único Toast en pantalla evitando apilamiento por eventos multi-sala | `Toast.test.tsx` aprueba `1/1` prueba en `356ms` en Re-Test | **APROBADO** | 17/11/2026 14:28 | 18/11/2026 02:33 | fix(notifications): deduplicar eventos websocket y toasts repetidos de patrullas e incidentes |
| `CP-H38-WEB-12` | Formateadores institucionales de prioridades, hitos y compromisos de vivienda en `estadoUtils.ts` | Unitaria / Utilidades | Utilidades | Media | Funciones puras en `src/lib/utils/estadoUtils.ts` | Inputs `CRITICA`, `ALTA`, `MEDIA`, `BAJA`, `PRIORIDAD_ASIGNADA`, `PRIORIDAD_RECTIFICADA`, `GRAVE_INHABITABLE` | Retorna cadenas legibles en Sentence Case (`Crítica`, `Alta`, `Media`, `Baja`, `Grave / Inhabitable`) | `estadoUtils.test.ts` aprueba `17/17` pruebas en `15ms` en Re-Test | **APROBADO** | 17/11/2026 14:28 | 18/11/2026 02:33 | fix(mando): humanizar enums y descripciones en bitacora cronologica de mision |
| `CP-H38-WEB-13` | Consulta autenticada Bearer JWT de incidentes y misiones con proyección de campos HU-38 contra `sgrai-api` vivo | Integración / API | DAL / Backend vivo | Alta | `sgrai-api` en `http://127.0.0.1:3001` y token JWT de `encargado@valdivia.cl` | `GET /api/incidentes?page=1&limit=3`, `GET /api/incidentes/dd7db71e-...` y `GET /api/misiones/247be4dd-...` con `Authorization: Bearer` | Retorna `200 OK` con `prioridadSugerida`, `totalReportesTerreno`, `reportesEvaluacionTerreno`, `ultimoReporte` e hitos | Respuestas `200 OK` verificadas en `INC-2026-9932` y `MIS-2026-0008` (servidor vivo inalcanzable en ventana de Re-Test) | **APROBADO** | 17/11/2026 14:26 | - | feat(mando): estandarizar tarjetas de reporte y desplegar afectacion de multiples familias (H38) |
| `CP-H38-WEB-14` | Restricción RBAC del endpoint `PATCH /api/incidentes/{id}/prioridad` rechazando rol Encargado (`403 Forbidden` — CA-6) | Seguridad / RBAC | API / Integración | Crítica | Token JWT de `encargado@valdivia.cl` (sin permiso `misiones:terreno:verificar`) | `PATCH /api/incidentes/dd7db71e-e878-4b58-a115-a848dc88bb38/prioridad` con `{"prioridad":"ALTA"}` | API deniega acceso con `403 Forbidden` exigiendo permiso `misiones:terreno:verificar` | `HTTP 403`: `{"message":"No cuenta con el permiso requerido: misiones:terreno:verificar"}` (sin cambios backend en Re-Test) | **APROBADO** | 17/11/2026 14:26 | - | feat(mando): estandarizar tarjetas de reporte y desplegar afectacion de multiples familias (H38) |
| `CP-H38-WEB-15` | Verificación de tipos TypeScript (`tsc --noEmit`) y build de producción Next.js (`npm run build`) | Estática / Compilación | CI / Build | Alta | Proyecto `sgrai-web` en rama `feature/h38-patrulla-asignar-prioridad` | `npx tsc --noEmit` y `npm run build` | Ambos procesos culminan con código de salida `0` y generación de rutas estáticas | `tsc --noEmit` exit `0`; `next build --webpack` compila en `13.2s` y genera `47/47` páginas en Re-Test | **APROBADO** | 17/11/2026 14:19 | 18/11/2026 02:32 | fix(h38): resolver hallazgos de QA (BUG-H38-WEB-01..08) |
| `CP-H38-WEB-16` | Ejecución completa de regresión unitaria y de componentes del repositorio (`npm test -- --run`) | Regresión / Unitaria | Suite Global | Crítica | Entorno Node.js + Vitest v3.2.7 + jsdom configurado | `npm test -- --run` | `100%` de archivos y pruebas existentes pasan sin regresiones | `129/129` archivos y `895/895` pruebas aprobadas en `35.44s` en Re-Test | **APROBADO** | 17/11/2026 14:17 | 18/11/2026 02:33 | fix(h38): resolver hallazgos de QA (BUG-H38-WEB-01..08) |

---

## 4. Bloque TSV para Hojas de Cálculo

```tsv
ID Caso	Título del Caso de Prueba	Tipo de Prueba	Nivel	Prioridad	Precondición	Datos de Prueba (Payload / Headers / Query)	Resultado Esperado	Resultado Obtenido	Estado	Fecha / Hora Ejecución	Fecha / Hora Re-Test	Solución / Commit
BUG-H38-WEB-03	Autenticación JWT Bearer en obtenerKpis y misionesService.listar y sincronización limpia con develop	Seguridad / Integración	Servicio / Git	Alta	Rama feature/h38-patrulla-asignar-prioridad integrada hacia develop	apiClient.GET('/api/incidentes/kpis'), apiClient.GET('/api/misiones') y git merge-tree --write-tree develop HEAD	Servicios migrados a apiClient sin conflictos de fusión contra develop	Migración apiClient aplicada, pero merge previo generó conflictos en incidentesService.ts y misionesService.ts al fusionar con develop	ABIERTO	17/11/2026 14:25	(Pendiente)	Pendiente (Rechazado en Code Review)
BUG-H38-WEB-04	Eliminación de DTOs manuales y casteos as unknown as con src/types/api-generated.d.ts (GEMINI.md §4)	Contrato / Tipado	Estático / DAL	Alta	api-generated.d.ts sincronizado con OpenAPI de sgrai-api	Inspección de src/types/api-generated.d.ts, incidentesService.ts, misionesService.ts y src/types/misiones.ts	Contratos de incidentes y misiones derivados de paths/components['schemas'] sin as unknown as	Resuelto en api-generated.d.ts e incidentesService.ts, pero misionesService.ts:194 mantiene casteo as unknown as y misiones.ts mantiene DTOs manuales	ABIERTO	17/11/2026 14:24	(Pendiente)	Pendiente (Rechazado en Code Review)
BUG-H38-WEB-05	Discriminación entre reclasificación de tipología (HU-37) y reportes de prioridad (HU-38 #1 y #2+) en IncidenteResumenSection	Funcional / Consistencia	UI / Hook	Alta	Incidente con Reporte #1 (PRIORIDAD_ASIGNADA) o justificacionReclasificacion: null, reclasificadoEnTerreno: true y reclasificacionTipologia: null	"Reporte de evaluación #1: Prioridad asignada en terreno a CRITICA (Sugerida: ALTA)." y payload WS incidente:actualizado	No mostrar badge Reclasificado junto a Tipo de Afectación ni sobrescribir justificacionReclasificacion	WS corregido y "Prioridad actualizada" filtrada, pero IncidenteResumenSection.tsx:38 omite "Prioridad asignada" y falla ante justif === '' mostrando falso chip Reclasificado	ABIERTO	17/11/2026 14:25	(Pendiente)	Pendiente (Rechazado en Code Review)
BUG-H38-WEB-08	Existencia de capturas de pantalla y textos en manual H38-evaluacion-prioridad-terreno-mando.md (GEMINI.md §7)	Documentación / QA	Repositorio	Media	Manual en docs/manuals/H38-evaluacion-prioridad-terreno-mando.md	Inspección de líneas 28, 39, 41, 52 y ls -la docs/manuals/assets/	Existencia de 3 PNG en assets/h38-evaluacion-prioridad-terreno-mando/ y variantes de botón	Línea 39 actualizada con Ver Reportes en Misión (1), pero el directorio assets/h38-evaluacion-prioridad-terreno-mando/ y sus 3 PNG continúan inexistentes	ABIERTO	17/11/2026 14:17	(Pendiente)	Pendiente (Rechazado en Code Review)
BUG-H38-WEB-01	Validación estática de ESLint y reglas de React Compiler / Hooks en la rama	Calidad / Linter	CI / Estático	Crítica	Repositorio en rama feature/h38-patrulla-asignar-prioridad	npm run lint	0 errores bloqueantes de ESLint en componentes, hooks y pruebas	npm run lint finaliza con exit 0 (0 errors, 11 warnings heredados previos); 9 errores previos subsanados	CORREGIDO	17/11/2026 14:17	18/11/2026 02:32	fix(h38): resolver conflictos con develop y corregir errores de ESLint
BUG-H38-WEB-02	Preservación de prioridad actualizada ante evento paralelo mision:actualizada sin campo prioridad (CA-5)	Tiempo Real / Concurrencia	Hook / Integración	Crítica	Tablero Kanban conectado a Socket.io; incidente en VERIFICANDO	incidente:actualizado (CRITICA) seguido de mision:actualizada (EN_CURSO, esSintetico: true, sin prioridad)	Tarjeta Kanban conserva CRITICA y mantiene verificado previo sin marcar true prematuramente	useEncargadoKanbanSocket omite prioridad por defecto y useIncidentesKanban preserva prioridad y verificado (useIncidentesKanban.test.ts 7/7 pass)	CORREGIDO	17/11/2026 14:20	18/11/2026 02:33	fix(h38): resolver hallazgos de QA (BUG-H38-WEB-01..08)
BUG-H38-WEB-06	Refresco en vivo de ultimoReporte en Drawer y limpieza de justificacionPrioridad: null en rectificaciones	Tiempo Real / UI	Drawer / Hook	Alta	IncidenteDetalleDrawer abierto con reporte previo; rectificación posterior con justificacionPrioridad: null	Evento WS incidente:actualizado con reporteTerreno (#2) y justificacionPrioridad: null	IncidenteDetalleDrawer reconstruye ultimoReporte y limpia justificacionPrioridad ocultando chip Ajustada	IncidenteDetalleDrawer actualiza ultimoReporte; hook/modal/drawer aceptan null y IncidenteCard removió cambioPrioridadMotivo	CORREGIDO	17/11/2026 14:22	18/11/2026 02:33	fix(h38): resolver hallazgos de QA (BUG-H38-WEB-01..08)
BUG-H38-WEB-07	Formato Sentence Case en badge de prioridad de ToastItem.tsx y humanización de de <PRIORIDAD> en bitácora	Estándares UI / I18n	UI / Utilidades	Media	Notificación Toast con priorityBadge y hito PRIORIDAD_RECTIFICADA	priorityBadge: "CRITICA" y "Prioridad actualizada en terreno de BAJA a CRITICA (Sugerida: ALTA)"	Toast muestra Crítica vía formatearPrioridad y bitácora formatea de Baja a Crítica (Sugerida: Alta)	ToastItem.tsx:264 invoca formatearPrioridad y estadoUtils.ts:417 agrega prefijo de (estadoUtils.test.ts 17/17 pass)	CORREGIDO	17/11/2026 14:26	18/11/2026 02:33	fix(h38): resolver hallazgos de QA (BUG-H38-WEB-01..08)
CP-H38-WEB-01	Despliegue de indicador Ajustada, tooltip comparativo y contador de reportes en IncidenteCard (CA-1, CA-3, CA-5)	Funcional / UI	Componente / Card	Crítica	Tarjeta IncidenteCard con prioridad distinta de prioridadSugerida y totalReportesTerreno: 2	prioridad: 'CRITICA', prioridadSugerida: 'ALTA', justificacionPrioridad: 'Avance rápido del agua...', totalReportesTerreno: 2	Muestra chip Ajustada, prioridad Crítica, tooltip con sugerida/justificación y badge 2 reportes · Rectificado	IncidenteCard.test.tsx aprueba 15/15 pruebas en 781ms en Re-Test incluyendo caso HU-38 (113ms)	APROBADO	17/11/2026 14:28	18/11/2026 02:33	feat(mando): estandarizar tarjetas de reporte y desplegar afectacion de multiples familias (H38)
CP-H38-WEB-02	Visualización de chips FIBE y Verificado en tarjeta Kanban al cargar desde servidor (CA-4, CA-5)	Funcional / UI	Componente / Card	Alta	Incidente con requiereAsistenciaSocial: true y verificado: true	IncidenteResumen con verificado: true, reclasificadoEnTerreno: false, requiereAsistenciaSocial: true	Renderiza chips rectangulares FIBE (warning) y Verificado (success) persistentes tras recarga	Verificado en IncidenteCard.test.tsx (15/15 pass en 781ms) en Re-Test	APROBADO	17/11/2026 14:27	18/11/2026 02:33	fix(kanban): asegurar persistencia del chip verificado al paginar y refrescar
CP-H38-WEB-03	Exposición de prioridad confirmada y chip Sugerida: [Nivel] en cabecera del Drawer (CA-1, CA-3)	Funcional / UI	Componente / Header	Alta	IncidenteDetalleDrawer abierto para incidente con ajuste manual en terreno	prioridad: 'CRITICA', prioridadSugerida: 'ALTA', justificacionPrioridad: 'Riesgo eléctrico activo...'	Cabecera muestra chips Prioridad: Crítica y Sugerida: Alta con tooltip explicativo	Verificado en IncidenteDetalleDrawer.test.tsx (19/19 pass en 2741ms) en Re-Test	APROBADO	17/11/2026 14:28	18/11/2026 02:33	feat(mando): estandarizar tarjetas de reporte y desplegar afectacion de multiples familias (H38)
CP-H38-WEB-04	Renderizado de sección Último Reporte de Terreno con desglose de familias y navegación directa al modal de misión	Funcional / UI	Componente / Drawer	Alta	IncidenteDetalle con ultimoReporte y reportesEvaluacionTerreno incluyendo múltiples familias	familias: ['Familia Morales', 'Casa 2 Interior'], nucleoFamiliarTotal: 6, nivelCompromisoVivienda: 'GRAVE_INHABITABLE'	Despliega métricas de familias, personas, viviendas, compromiso y botón Ver detalle funcional	Verificado en IncidenteDetalleDrawer.test.tsx (19/19 pass en 2741ms) en Re-Test	APROBADO	17/11/2026 14:27	18/11/2026 02:33	feat(mando): estandarizar tarjetas de reporte y desplegar afectacion de multiples familias (H38)
CP-H38-WEB-05	Bloque Último Reporte Realizado en tarjetas de misión y accesos directos a último reporte / todos los reportes	Funcional / UI	Componente / Drawer	Alta	Misión activa con 2 reportes de evaluación (#1 Inicial y #2 Rectificación)	reportesEvaluacionTerreno con versiones 1 y 2 en IncidenteMisionesSection	Muestra Reporte #2 — Rectificación Vigente, comparativa de prioridad, resumen demográfico y botones de acceso	IncidenteMisionesSection.test.tsx aprueba 16/16 pruebas en 1723ms en Re-Test	APROBADO	17/11/2026 14:28	18/11/2026 02:33	feat(mando): estandarizar tarjetas de reporte y desplegar afectacion de multiples familias (H38)
CP-H38-WEB-06	Historial versionado de reportes en MisionReportesSection con chips Vigente/Histórico y acordeón colapsable	Funcional / UI	Componente / Modal	Crítica	MisionDetalleModal abierto para misión con Reporte #1 (Inicial) y Reporte #2 (Rectificación)	versionReporte: 1 y 2, prioridadSugerida: 'ALTA', prioridadAsignada: 'CRITICA', justificacionPrioridad	Muestra 2 versiones registradas, despliega por defecto solo el reporte vigente (#2) y colapsa el histórico (#1)	MisionDetalleModal.test.tsx aprueba 16/16 pruebas en 2210ms en Re-Test	APROBADO	17/11/2026 14:28	18/11/2026 02:33	refactor(mando): estandarizar tarjetas y cabecera unificada de reportes de terreno (H37/H38)
CP-H38-WEB-07	Desglose individualizado de múltiples familias afectadas, vulnerabilidad y derivación FIBE en MisionReportesSection	Funcional / UI	Componente / Modal	Alta	Reporte con arreglo detallesEvaluacion.familias (>1 familia o con referencia)	Familia Muñoz - Casa Principal (4 pers., GRAVE_INHABITABLE, FIBE) y Familia Díaz - Cabaña Interior (3 pers., MODERADO_PARCIAL)	Despliega chip 2 hogares, tarjetas individuales por familia con severidad y badge Requiere FIBE, más consolidado	Verificado en MisionDetalleModal.test.tsx (16/16 pass en 2210ms) en Re-Test	APROBADO	17/11/2026 14:27	18/11/2026 02:33	feat(mando): estandarizar tarjetas de reporte y desplegar afectacion de multiples familias (H38)
CP-H38-WEB-08	Despliegue de peligros activos y requerimientos operativos (evacuación, FIBE, riesgo eléctrico/estructural)	Funcional / UI	Componente / Modal	Alta	detallesEvaluacion con requiereEvacuacion: true, requiereAsistenciaSocial: true y riesgosActivos	{ riesgoElectrico: true, riesgoEstructural: true, requiereEvacuacion: true, requiereAsistenciaSocial: true }	Renderiza chips Requiere Evacuación, Requiere Ficha FIBE, Riesgo Eléctrico y Riesgo Estructural	Verificado en MisionDetalleModal.test.tsx (16/16 pass en 2210ms) en Re-Test	APROBADO	17/11/2026 14:28	18/11/2026 02:33	feat(mando): estandarizar tarjetas de reporte y desplegar afectacion de multiples familias (H38)
CP-H38-WEB-09	Recepción y deduplicación de eventos incidente:actualizado en useEncargadoKanbanSocket	Tiempo Real / Socket	Hook	Alta	Hook useEncargadoKanbanSocket montado y suscrito a sala:encargados, encargado y mapa	Emisión repetida de incidente:actualizado dentro de ventana de 4000ms y evento con tipología/reporte	Deduplica emisiones repetidas por múltiples salas y limpia listeners/salir al desmontar	useEncargadoKanbanSocket.test.ts aprueba 10/10 casos en 144ms en Re-Test	APROBADO	17/11/2026 14:28	18/11/2026 02:33	fix(mando): especificar cuando la tipologia no fue modificada por la patrulla y deduplicar socket kanban
CP-H38-WEB-10	Actualización en memoria del Tablero Kanban en useIncidentesKanban ante evento incidente:actualizado	Tiempo Real / Estado	Hook	Alta	Incidente cargado en columna VERIFICANDO del estado Kanban	Disparo de onIncidenteActualizado con nueva prioridad, tipoAfectacion y justificacion	Actualiza inmediatamente los atributos de la tarjeta en memoria sin recarga completa de página	useIncidentesKanban.test.ts aprueba 7/7 casos en 504ms en Re-Test	APROBADO	17/11/2026 14:27	18/11/2026 02:33	feat(kanban): actualizar tipología, prioridad y justificación reactivamente vía websocket (#39)
CP-H38-WEB-11	Deduplicación de notificaciones Toast idénticas en ToastProvider	UX / Notificaciones	Componente / UI	Media	ToastProvider montado en el árbol de componentes	4 invocaciones consecutivas de showInfo con idéntico título, mensaje y codeBadge	Muestra un único Toast en pantalla evitando apilamiento por eventos multi-sala	Toast.test.tsx aprueba 1/1 prueba en 356ms en Re-Test	APROBADO	17/11/2026 14:28	18/11/2026 02:33	fix(notifications): deduplicar eventos websocket y toasts repetidos de patrullas e incidentes
CP-H38-WEB-12	Formateadores institucionales de prioridades, hitos y compromisos de vivienda en estadoUtils.ts	Unitaria / Utilidades	Utilidades	Media	Funciones puras en src/lib/utils/estadoUtils.ts	Inputs CRITICA, ALTA, MEDIA, BAJA, PRIORIDAD_ASIGNADA, PRIORIDAD_RECTIFICADA, GRAVE_INHABITABLE	Retorna cadenas legibles en Sentence Case (Crítica, Alta, Media, Baja, Grave / Inhabitable)	estadoUtils.test.ts aprueba 17/17 pruebas en 15ms en Re-Test	APROBADO	17/11/2026 14:28	18/11/2026 02:33	fix(mando): humanizar enums y descripciones en bitacora cronologica de mision
CP-H38-WEB-13	Consulta autenticada Bearer JWT de incidentes y misiones con proyección de campos HU-38 contra sgrai-api vivo	Integración / API	DAL / Backend vivo	Alta	sgrai-api en http://127.0.0.1:3001 y token JWT de encargado@valdivia.cl	GET /api/incidentes?page=1&limit=3, GET /api/incidentes/dd7db71e-... y GET /api/misiones/247be4dd-... con Authorization: Bearer	Retorna 200 OK con prioridadSugerida, totalReportesTerreno, reportesEvaluacionTerreno, ultimoReporte e hitos	Respuestas 200 OK verificadas en INC-2026-9932 y MIS-2026-0008 (servidor vivo inalcanzable en ventana de Re-Test)	APROBADO	17/11/2026 14:26	-	feat(mando): estandarizar tarjetas de reporte y desplegar afectacion de multiples familias (H38)
CP-H38-WEB-14	Restricción RBAC del endpoint PATCH /api/incidentes/{id}/prioridad rechazando rol Encargado (403 Forbidden — CA-6)	Seguridad / RBAC	API / Integración	Crítica	Token JWT de encargado@valdivia.cl (sin permiso misiones:terreno:verificar)	PATCH /api/incidentes/dd7db71e-e878-4b58-a115-a848dc88bb38/prioridad con {"prioridad":"ALTA"}	API deniega acceso con 403 Forbidden exigiendo permiso misiones:terreno:verificar	HTTP 403: {"message":"No cuenta con el permiso requerido: misiones:terreno:verificar"} (sin cambios backend en Re-Test)	APROBADO	17/11/2026 14:26	-	feat(mando): estandarizar tarjetas de reporte y desplegar afectacion de multiples familias (H38)
CP-H38-WEB-15	Verificación de tipos TypeScript (tsc --noEmit) y build de producción Next.js (npm run build)	Estática / Compilación	CI / Build	Alta	Proyecto sgrai-web en rama feature/h38-patrulla-asignar-prioridad	npx tsc --noEmit y npm run build	Ambos procesos culminan con código de salida 0 y generación de rutas estáticas	tsc --noEmit exit 0; next build --webpack compila en 13.2s y genera 47/47 páginas en Re-Test	APROBADO	17/11/2026 14:19	18/11/2026 02:32	fix(h38): resolver hallazgos de QA (BUG-H38-WEB-01..08)
CP-H38-WEB-16	Ejecución completa de regresión unitaria y de componentes del repositorio (npm test -- --run)	Regresión / Unitaria	Suite Global	Crítica	Entorno Node.js + Vitest v3.2.7 + jsdom configurado	npm test -- --run	100% de archivos y pruebas existentes pasan sin regresiones	129/129 archivos y 895/895 pruebas aprobadas en 35.44s en Re-Test	APROBADO	17/11/2026 14:17	18/11/2026 02:33	fix(h38): resolver hallazgos de QA (BUG-H38-WEB-01..08)
```

---

## 5. Guía de Ejecución y Replicabilidad Paso a Paso

Todos los comandos listados a continuación corresponden a las ejecuciones sobre `feature/h38-patrulla-asignar-prioridad` en el directorio raíz de `web`, actualizados al Re-Test del `18/11/2026`.

### 5.1 Análisis Estático (`npm run lint`), Tipado (`npx tsc --noEmit`) y Build (`npm run build`) — Re-Test `18/11/2026`

```bash
npm run lint
npx tsc --noEmit
npm run build
```

**Salidas reales obtenidas en Re-Test (`exit code 0` en los tres comandos):**
```text
✖ 11 problems (0 errors, 11 warnings)
LINT_EXIT=0
TSC_EXIT=0

▲ Next.js 16.3.4 (webpack)
- Environments: .env.local
✓ Running next.config.ts took 41ms
✓ Compiled successfully in 13.2s
✓ Finished TypeScript in 9.2s
✓ Collecting page data using 15 workers in 849ms
✓ Generating static pages using 15 workers (47/47) in 1279ms
BUILD_EXIT=0
```

### 5.2 Verificación de Integración Git, Contrato OpenAPI y Activos del Manual (`18/11/2026`)

```bash
git merge-tree --write-tree develop HEAD
ls -la docs/manuals/assets/h38-evaluacion-prioridad-terreno-mando/
rg -n "as unknown as|interface ReporteTerrenoDetalle|interface MisionDetalleCompleto" src/services/misionesService.ts src/types/misiones.ts
```

**Salidas reales obtenidas:**
```text
Auto-fusionando src/components/mando/KanbanBoard.tsx
Auto-fusionando src/services/__tests__/incidentesService.test.ts
Auto-fusionando src/services/incidentesService.ts
CONFLICTO (contenido): Conflicto de fusión en src/services/incidentesService.ts
Auto-fusionando src/services/misionesService.ts
CONFLICTO (contenido): Conflicto de fusión en src/services/misionesService.ts

ls: no se puede acceder a 'docs/manuals/assets/h38-evaluacion-prioridad-terreno-mando/': No existe el fichero o el directorio

src/services/misionesService.ts:123:      const metaRaw = (data as unknown as {
src/services/misionesService.ts:194:      const { data, error, response } = await (apiClient as unknown as {
src/types/misiones.ts:67:export interface ReporteTerrenoDetalle {
src/types/misiones.ts:215:export interface MisionDetalleCompleto {
```

---

### 5.3 Suites Automatizadas Vitest (Global, Subconjunto y Filtros `-t`) — Re-Test `18/11/2026`

#### Comando 1: Suite Global del Repositorio (`CP-H38-WEB-16`)
```bash
npm test -- --run
```

**Salida real obtenida:**
```text
 RUN  v3.2.7 /home/ds2fery/Documentos/Proyecto/sgrai-uach/web

 Test Files  129 passed (129)
      Tests  895 passed (895)
   Duration  35.44s (transform 22.45s, setup 33.46s, collect 83.05s, tests 94.79s, environment 207.63s, prepare 24.20s)
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
 ✓ src/lib/utils/__tests__/estadoUtils.test.ts (17 tests) 15ms
 ✓ src/services/__tests__/incidentesService.test.ts (6 tests) 21ms
 ✓ src/services/__tests__/misionesService.test.ts (10 tests) 93ms
 ✓ src/hooks/__tests__/useEncargadoKanbanSocket.test.ts (10 tests) 144ms
 ✓ src/hooks/__tests__/usePatrullas.test.ts (8 tests) 204ms
 ✓ src/components/ui/__tests__/Toast.test.tsx (1 test) 356ms
 ✓ src/hooks/__tests__/useIncidentesKanban.test.ts (7 tests) 504ms
 ✓ src/components/mando/__tests__/IncidenteCard.test.tsx (15 tests) 781ms
 ✓ src/components/mando/__tests__/IncidenteMisionesSection.test.tsx (16 tests) 1723ms
 ✓ src/components/mando/mision/__tests__/MisionDetalleModal.test.tsx (16 tests) 2210ms
 ✓ src/components/mando/__tests__/IncidenteDetalleDrawer.test.tsx (19 tests) 2741ms

 Test Files  11 passed (11)
      Tests  125 passed (125)
   Duration  9.54s (transform 6.51s, setup 3.51s, collect 15.25s, tests 8.79s, environment 24.82s, prepare 4.60s)
```

#### Comando 3: Ejecución Filtrada Específica para HU-38 y Regresiones QA
```bash
npm test -- --run -t "HU-38|BUG-H38-WEB"
```

**Salida real obtenida:**
```text
 ✓ src/components/mando/__tests__/IncidenteMisionesSection.test.tsx (16 tests | 15 skipped) 709ms
 ✓ src/components/mando/mision/__tests__/MisionDetalleModal.test.tsx (16 tests | 15 skipped) 892ms
 ✓ src/components/mando/__tests__/IncidenteDetalleDrawer.test.tsx (19 tests | 17 skipped) 1195ms
 ✓ src/components/mando/__tests__/IncidenteCard.test.tsx (15 tests | 14 skipped) 113ms
 ✓ src/hooks/__tests__/useIncidentesKanban.test.ts (7 tests | 6 skipped) 87ms

 Test Files  5 passed | 124 skipped (129)
      Tests  6 passed | 889 skipped (895)
   Duration  23.31s (transform 19.25s, setup 25.57s, collect 71.17s, tests 3.00s, environment 171.86s, prepare 20.34s)
```

---

### 5.4 Pruebas de Integración HTTP/JSON con cURL contra `sgrai-api` (`http://127.0.0.1:3001`, Ciclo 1 — `17/11/2026`)

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

#### Escenario B: Validación de Rechazo sin Bearer Token en `GET /api/incidentes/kpis` y `GET /api/misiones` — `401 Unauthorized`
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

| Criterio de Aceptación / Requisito (HU-38) | Responsabilidad Arquitectónica | Cobertura en `sgrai-web` | Estado QA (Re-Test) | Casos y Defectos Asociados |
|---|---|---|---|---|
| **CA-1:** Mostrar de forma visible la `prioridad_sugerida` calculada preliminarmente por el sistema | `sgrai-pwa` (evaluación) / `sgrai-web` (auditoría en mando) | `IncidenteDetalleHeader`, `IncidenteCard`, `IncidenteMisionesSection` y `MisionReportesSection` exhiben `prioridadSugerida` frente a la confirmada | 🟢 **CUMPLE** | `CP-H38-WEB-01`, `CP-H38-WEB-03`, `CP-H38-WEB-05`, `CP-H38-WEB-06` |
| **CA-2:** Proveer selector con los cuatro niveles canónicos `BAJA`, `MEDIA`, `ALTA`, `CRITICA` | `sgrai-pwa` / `sgrai-api` | `sgrai-web` formatea los cuatro niveles en Sentence Case en tarjetas, Drawer, modal de misión, `ToastItem` y bitácora | 🟢 **CUMPLE** | `CP-H38-WEB-12`, `BUG-H38-WEB-07` (Corregido) |
| **CA-3:** Campo obligatorio `justificacion_prioridad` (≥ 5 chars) si la patrulla modifica la prioridad sugerida | `sgrai-pwa` / `sgrai-api` | `sgrai-web` despliega la justificación técnica y limpia `justificacionPrioridad: null` cuando la rectificación confirma la sugerencia | 🟢 **CUMPLE** | `CP-H38-WEB-01`, `CP-H38-WEB-03`, `BUG-H38-WEB-06` (Corregido) |
| **CA-4:** Actualización transaccional de `incidente.prioridad`, `justificacion_prioridad` e hito en `mision_hito` | `sgrai-api` | `sgrai-web` formatea `de Baja a Crítica` en bitácora y evita contaminación por WS, pero `IncidenteResumenSection` aún muestra `Reclasificado` falso en Reporte #1 (`PRIORIDAD_ASIGNADA`) | 🟡 **PARCIAL** | `CP-H38-WEB-06`, `CP-H38-WEB-13`, `BUG-H38-WEB-07` (Corregido), `BUG-H38-WEB-05` (Abierto) |
| **CA-5:** Emisión WebSocket `incidente:actualizado` al Centro de Mando reflejando el nuevo badge en el tablero Kanban | `sgrai-api` + `sgrai-web` | Evento `mision:actualizada` ya no sobrescribe `prioridad` a `MEDIA` y `IncidenteDetalleDrawer` refresca `ultimoReporte` en vivo | 🟢 **CUMPLE** | `CP-H38-WEB-09`, `CP-H38-WEB-10`, `BUG-H38-WEB-02` (Corregido), `BUG-H38-WEB-06` (Corregido) |
| **CA-6:** Endpoint requiere permiso RBAC `misiones:terreno:verificar` | `sgrai-api` | Rol `ENCARGADO` rechazado con `403 Forbidden`; `obtenerKpis` y `misionesService.listar` migrados a `apiClient`, pero la rama genera conflictos con `develop` (`cabb4c2`) | 🟡 **PARCIAL** | `CP-H38-WEB-14`, `BUG-H38-WEB-03` (Abierto por merge) |
| **Transversales:** ESLint, OpenAPI (`GEMINI.md §4`) y Manual con capturas (`GEMINI.md §7`) | `sgrai-web` | ESLint aprobado (`0` errores), `api-generated.d.ts` e `incidentesService.ts` migrados; pendientes `misionesService.ts`/`misiones.ts` y `3` capturas PNG del manual H38 | 🔴 **NO CUMPLE** | `BUG-H38-WEB-01` (Corregido), `BUG-H38-WEB-04` (Abierto), `BUG-H38-WEB-08` (Abierto) |
