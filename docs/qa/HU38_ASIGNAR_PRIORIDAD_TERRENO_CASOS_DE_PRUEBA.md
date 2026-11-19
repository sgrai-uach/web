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
> * `fix(h38): integrar develop y resolver hallazgos de QA ciclo 2 (BUG-H38-WEB-03..05, 08)`
> * `docs(qa): actualizar documento de casos de prueba para HU-38`
> * `merge: rama 'feature/h38-patrulla-asignar-prioridad' de github.com:sgrai-uach/web hacia feature/h38-patrulla-asignar-prioridad`
>  
> **Fecha y Hora de Auditoría Inicial (Ciclo 1):** `17/11/2026 14:28 -03:00`  
> **Fecha y Hora de Re-Test (Ciclo 2):** `18/11/2026 02:35 -03:00`  
> **Fecha y Hora de Re-Test Final (Ciclo 3):** `18/11/2026 18:18 -03:00`  
> **Estado de Certificación:** 🟢 **APROBADO EN RE-TEST FINAL — 8/8 DEFECTOS SUBSANADOS (APTO PARA MERGE A DEVELOP)**.

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

Tras dos ciclos previos de remediación (**Ciclo 1** del `17/11/2026 14:28` con `8` defectos detectados y **Ciclo 2** del `18/11/2026 02:35` con `4` defectos subsanados y `4` parciales abiertos), el desarrollador integró el commit `fix(h38): integrar develop y resolver hallazgos de QA ciclo 2 (BUG-H38-WEB-03..05, 08)`, sincronizando la punta vigente de `develop` (`cabb4c2`), eliminando los casteos y DTOs manuales en misiones, ampliando la guarda de `IncidenteResumenSection` para el Reporte #1 (`PRIORIDAD_ASIGNADA`) e incorporando las `3` capturas reales del manual H38.

En el **Re-Test Final (Ciclo 3 — `18/11/2026 18:18`)**, se certifica la subsanación completa de los **4 defectos restantes** (`BUG-H38-WEB-03`, `04`, `05`, `08`), totalizando **8/8 defectos corregidos (`0` abiertos)** y **24/24 casos aprobados (`100.0%` Pass)**. La rama compila sin errores ni advertencias de ESLint (`0 errors, 0 warnings`), supera `npx tsc --noEmit` tras `npm run build` (`47/47` rutas), aprueba **`901/901` pruebas en `129` archivos Vitest** y logra una fusión limpia contra `develop` (`git merge-tree` sin conflictos).

| Métrica / Verificación | Ciclo 1 (`17/11/2026`) | Ciclo 2 (`18/11/2026 02:35`) | Re-Test Final Ciclo 3 (`18/11/2026 18:18`) |
|---|:---:|:---:|:---:|
| **Total de Casos en Matriz** | **24** | **24** | **24** (`8` Defectos + `16` Casos) |
| **Casos Aprobados / Corregidos** | **16** (`66.7%`) | **20** (`83.3%`) | **24 / 24 (`100.0%`)** |
| **Defectos Abiertos (`ABIERTO`)** | **8** (`2C, 4A, 2M`) | **4** (`0C, 3A, 1M`) | **0** (Todos subsanados) |
| **ESLint (`npm run lint`)** | 🔴 `9` errores / `17` warnings | 🟡 `0` errores / `11` warnings | 🟢 **`0` errores / `0` warnings** (`exit 0`) |
| **TypeScript (`npx tsc --noEmit`)** | 🟢 `0` errores | 🟢 `0` errores | 🟢 **`0` errores** (`exit 0` tras build) |
| **Build Producción (`npm run build`)** | 🟢 `11.5s` / `47` páginas | 🟢 `13.2s` / `47` páginas | 🟢 **`8.3s` compile / `10.9s` TS / `47` páginas** |
| **Suite Global Vitest (`npm test -- --run`)** | 🟢 `128` files / `861` tests | 🟢 `129` files / `895` tests | 🟢 **`129` files / `901` tests (`28.87s`)** |
| **Subconjunto HU-38 (`npx vitest run` 11 suites)** | 🟢 `11` files / `103` tests | 🟢 `11` files / `125` tests | 🟢 **`11` files / `131` tests (`7.20s`)** |
| **Merge Simulado vs `develop` (`git merge-tree`)** | 🔴 Desfase `10` commits | 🔴 Conflictos en `2` archivos | 🟢 **Limpio (`0` conflictos)** |
| **Contrato OpenAPI (`api-generated.d.ts`)** | 🔴 Desincronizado | 🟡 Pendiente en `misiones` | 🟢 **Sincronizado en incidentes y misiones** |
| **Manual H38 y Capturas (`GEMINI.md §7`)** | 🔴 Sin PNGs + copy | 🔴 Sin directorio `assets/` | 🟢 **`3` PNGs reales verificados visualmente** |

> **Nota sobre verificación HTTP en vivo durante Ciclos 2 y 3 (`18/11/2026`):** La instancia local de `sgrai-api` en `http://127.0.0.1:3001` no se encontró levantada desde el entorno de ejecución (`OPENAPI_HTTP:000`, código de salida `7`). Por esta razón, `CP-H38-WEB-13` y `CP-H38-WEB-14` mantienen la evidencia viva obtenida el `17/11/2026 14:26` sobre `INC-2026-9932` y `MIS-2026-0008`, complementada en el Ciclo 3 con la verificación completa de `incidentesService.test.ts` (`9/9` pruebas) y `misionesService.test.ts` (`13/13` pruebas) validando la inyección Bearer JWT y el contrato OpenAPI tipado.

---

## 2. Registro Técnico de Defectos Subsanados

### 2.1. Defectos Cerrados en Re-Test Final (Ciclo 3 — `18/11/2026 18:18`)

#### `BUG-H38-WEB-03` — Migración Incompleta Respecto a `develop` con Conflictos de Merge en Servicios de Incidentes y Misiones — **CORREGIDO**
* **Severidad:** Alta.
* **Archivos verificados:** `src/services/incidentesService.ts`, `src/services/misionesService.ts`, `src/services/__tests__/incidentesService.test.ts`, `src/services/__tests__/misionesService.test.ts`.
* **Resolución verificada (`18/11/2026 18:18`):**
  1. La rama integró la punta vigente de `develop` (`cabb4c2`), incorporando los `5` commits pendientes de sincronización (incluyendo la autenticación Bearer JWT y la eliminación de los `11` warnings de ESLint).
  2. `git merge-tree --write-tree develop HEAD` concluye limpio con código `0` y sin conflictos.
  3. `misionesService.ts:110-118` ahora omite la cabecera `authorization` cuando no existe token de sesión (`(token ? { authorization: 'Bearer ...' } : {}) as ListarMisionesHeader`), lee fallback de `localStorage` y pasa las `13/13` pruebas en `misionesService.test.ts` junto a las `9/9` pruebas de `incidentesService.test.ts`.

#### `BUG-H38-WEB-04` — Casteos `as unknown as` y DTOs Manuales en `misionesService.ts` y `src/types/misiones.ts` (`GEMINI.md §4`) — **CORREGIDO**
* **Severidad:** Alta.
* **Archivos verificados:** `src/types/api-generated.d.ts`, `src/services/incidentesService.ts`, `src/services/misionesService.ts`, `src/types/misiones.ts`.
* **Resolución verificada (`18/11/2026 18:18`):**
  1. Se eliminó el casteo `(apiClient as unknown as { GET: ... }).GET('/api/misiones/{id}')` en `misionesService.ts:204`, utilizando directamente `apiClient.GET('/api/misiones/{id}', ...)` tipado desde OpenAPI.
  2. En `misionesService.ts:143-144`, se eliminaron los casteos `(data.data || []) as MisionItem[]` y `(data as unknown as { meta?: ... }).meta`, consumiendo directamente `data?.data` y `data?.meta`.
  3. En `src/types/misiones.ts:10-117`, todos los tipos de respuesta (`AdjuntoEvidencia`, `EvaluadorTerreno`, `ReporteTerrenoDetalle`, `MisionBitacoraHito`, `IncidenteMisionResumen`, `PrevencionMisionResumen`, `CuadrillaMisionDetalle`, `RecursoAsignadoMision`, `PatrullaMisionDetalle`, `MisionItem`, `TipoMision`, `EstadoMision`, `PrioridadMision`, `MisionDetalleCompleto`, `MisionDetalleResponse`) se derivan desde `paths['/api/misiones']` y `paths['/api/misiones/{id}']` de `api-generated.d.ts`.

#### `BUG-H38-WEB-05` — Falsa Etiqueta `Reclasificado` en `IncidenteResumenSection` para Reporte #1 (`PRIORIDAD_ASIGNADA`) — **CORREGIDO**
* **Severidad:** Alta.
* **Archivos verificados:** `src/components/mando/drawer/IncidenteResumenSection.tsx` (líneas `37`–`56`), `src/components/mando/__tests__/IncidenteDetalleDrawer.test.tsx` (líneas `1084`–`1120`).
* **Resolución verificada (`18/11/2026 18:18`):**
  1. `IncidenteResumenSection.tsx:38-43` amplió la expresión regular para excluir tanto rectificaciones (`Prioridad actualizada`) como evaluaciones iniciales (`Prioridad asignada`):
     ```ts
     const esGlosaSoloPrioridad =
       /^(?:Reporte de evaluaci[oó]n[^:]*:\s*)?Prioridad (?:actualizada|asignada)\b/i.test(justif);
     ```
     y exige `justif.length > 0 && !esGlosaSoloPrioridad` en la rama de respaldo cuando `reclasificacionTipologia` es `null`.
  2. La prueba `BUG-H38-WEB-05` en `IncidenteDetalleDrawer.test.tsx` valida explícitamente los tres casos (`Prioridad asignada`, `Prioridad actualizada` y `null`), confirmando que no se renderiza `btn-ver-cambio-afectacion`.

#### `BUG-H38-WEB-08` — Capturas de Pantalla del Manual `H38-evaluacion-prioridad-terreno-mando.md` (`GEMINI.md §7`) — **CORREGIDO**
* **Severidad:** Media.
* **Archivos verificados:** `docs/manuals/H38-evaluacion-prioridad-terreno-mando.md`, `docs/manuals/assets/h38-evaluacion-prioridad-terreno-mando/`.
* **Resolución verificada (`18/11/2026 18:18`):**
  Se incorporaron y verificaron visualmente las tres capturas PNG reales del Centro de Mando referenciadas en el manual:
  * `kanban-card-prioridad-reportes.png` (`103131` bytes — tarjetas Kanban con badges `Ajustada`, `Crítica`, `2 reportes · Rectificado` y notificación Toast en vivo).
  * `drawer-acceso-ultimo-reporte.png` (`160331` bytes — Panel Lateral con `Sugerida: Alta`, bloque `Último Reporte Realizado`, desglose multi-familia y accesos directos).
  * `mision-detalle-historial-reportes.png` (`192154` bytes — Modal de Detalle de Misión con versiones `Vigente`/`Histórico`, comparativa de prioridades, desglose familiar y riesgos activos).

---

### 2.2. Defectos Cerrados en Ciclo 2 (`18/11/2026 02:35`) y Revalidados en Ciclo 3

#### `BUG-H38-WEB-01` — Fallo de ESLint (`npm run lint`) con 9 Errores de React Compiler, Hooks y `@typescript-eslint` — **CORREGIDO**
* **Resolución verificada:** Se corrigieron los `9` errores en `IncidentesKpiCards.tsx`, `KanbanBoard.tsx`, `MisionReportesSection.tsx`, `ToastItem.tsx` y `useIncidentesKanban.test.ts`; tras la integración completa con `develop` en Ciclo 3, `npm run lint` culmina con **`exit 0` (`0 errors, 0 warnings`)**.

#### `BUG-H38-WEB-02` — Sobrescritura de Prioridad a `MEDIA` y `verificado: true` Prematuro ante `mision:actualizada` — **CORREGIDO**
* **Resolución verificada:** `useEncargadoKanbanSocket.ts:340-345, 375` omite asignar `'MEDIA'` cuando `mision:actualizada` no trae `prioridad`, y `useIncidentesKanban.ts:431-462` preserva `incActual.prioridad` y `Boolean(incActual.verificado)` cuando `esSintetico === true`. Cubierto por regresión en `useIncidentesKanban.test.ts` (`7/7` pass).

#### `BUG-H38-WEB-06` — `ultimoReporte` Congelado en Drawer y Limpieza de `justificacionPrioridad: null` Tras Rectificación — **CORREGIDO**
* **Resolución verificada:** `IncidenteDetalleDrawer.tsx:65-78, 98-122, 134` reconstruye `ultimoReporte` en vivo ante `reporteEntrante`; junto a `MisionDetalleModal.tsx` y `useEncargadoKanbanSocket.ts` distingue `=== null` de `undefined`, e `IncidenteCard.tsx` remueve `cambioPrioridadMotivo`, ocultando el chip `Ajustada` al ratificarse la sugerencia.

#### `BUG-H38-WEB-07` — Prioridad `ALL CAPS` en `ToastItem.tsx` y Prefijo `de <PRIORIDAD>` en `limpiarDescripcionBitacora` — **CORREGIDO**
* **Resolución verificada:** `ToastItem.tsx:264` utiliza `formatearPrioridad(...)` mostrando Sentence Case y `estadoUtils.ts:417` agrega el prefijo `de`, validado en `estadoUtils.test.ts:499-506` (`17/17` pass).

---

## 3. Matriz Consolidada de Casos de Prueba (13 Columnas Institucionales)

| ID Caso | Título del Caso de Prueba | Tipo de Prueba | Nivel | Prioridad | Precondición | Datos de Prueba (Payload / Headers / Query) | Resultado Esperado | Resultado Obtenido | Estado | Fecha / Hora Ejecución | Fecha / Hora Re-Test | Solución / Commit |
|---|---|---|---|---|---|---|---|---|:---:|:---:|:---:|---|
| `BUG-H38-WEB-01` | Validación estática de ESLint y reglas de React Compiler / Hooks en la rama | Calidad / Linter | CI / Estático | Crítica | Repositorio en rama `feature/h38-patrulla-asignar-prioridad` | `npm run lint` | `0` errores bloqueantes de ESLint en componentes, hooks y pruebas | `npm run lint` finaliza con `exit 0` (`0 errors, 0 warnings`) tras subsanar los `9` errores e integrar `develop` | **CORREGIDO** | 17/11/2026 14:17 | 18/11/2026 18:14 | fix(h38): integrar develop y resolver hallazgos de QA ciclo 2 (BUG-H38-WEB-03..05, 08) |
| `BUG-H38-WEB-02` | Preservación de prioridad actualizada ante evento paralelo `mision:actualizada` sin campo prioridad (CA-5) | Tiempo Real / Concurrencia | Hook / Integración | Crítica | Tablero Kanban conectado a Socket.io; incidente en `VERIFICANDO` | `incidente:actualizado` (`CRITICA`) seguido de `mision:actualizada` (`EN_CURSO`, `esSintetico: true`, sin `prioridad`) | Tarjeta Kanban conserva `CRITICA` y mantiene `verificado` previo sin marcar `true` prematuramente | `useEncargadoKanbanSocket` omite `prioridad` por defecto y `useIncidentesKanban` preserva prioridad y `verificado` (`useIncidentesKanban.test.ts` `7/7` pass) | **CORREGIDO** | 17/11/2026 14:20 | 18/11/2026 18:17 | fix(h38): resolver hallazgos de QA (BUG-H38-WEB-01..08) |
| `BUG-H38-WEB-03` | Autenticación JWT Bearer en `obtenerKpis` y `misionesService.listar` y sincronización limpia con `develop` | Seguridad / Integración | Servicio / Git | Alta | Rama `feature/h38-patrulla-asignar-prioridad` integrada con punta actual de `develop` | `apiClient.GET('/api/incidentes/kpis')`, `apiClient.GET('/api/misiones')` y `git merge-tree --write-tree develop HEAD` | Servicios autenticados vía `apiClient`, sin enviar header vacío y merge limpio contra `develop` | `develop` integrado limpiamente (`MERGE_CLEAN=YES`), cabecera vacía eliminada y suites `incidentesService.test.ts` (`9/9`) + `misionesService.test.ts` (`13/13`) aprobadas | **CORREGIDO** | 17/11/2026 14:25 | 18/11/2026 18:17 | fix(h38): integrar develop y resolver hallazgos de QA ciclo 2 (BUG-H38-WEB-03..05, 08) |
| `BUG-H38-WEB-04` | Eliminación de DTOs manuales y casteos `as unknown as` con `src/types/api-generated.d.ts` (`GEMINI.md §4`) | Contrato / Tipado | Estático / DAL | Alta | `api-generated.d.ts` sincronizado con OpenAPI de `sgrai-api` | Inspección de `src/types/api-generated.d.ts`, `incidentesService.ts`, `misionesService.ts` y `src/types/misiones.ts` | Contratos de incidentes y misiones derivados de `paths`/`components['schemas']` sin casteo `apiClient as unknown as` | Eliminado casteo en `misionesService.obtenerDetalle`, usando `data.meta` nativo y derivando tipos de `src/types/misiones.ts` desde `paths` de `api-generated.d.ts` | **CORREGIDO** | 17/11/2026 14:24 | 18/11/2026 18:14 | fix(h38): integrar develop y resolver hallazgos de QA ciclo 2 (BUG-H38-WEB-03..05, 08) |
| `BUG-H38-WEB-05` | Discriminación entre reclasificación de tipología (HU-37) y reportes de prioridad (HU-38 `#1` y `#2+`) en `IncidenteResumenSection` | Funcional / Consistencia | UI / Hook | Alta | Incidente con Reporte #1 (`PRIORIDAD_ASIGNADA`), rectificación `#2+` o `justificacionReclasificacion: null` sin tipología | `"Reporte de evaluación #1: Prioridad asignada en terreno a CRITICA (Sugerida: ALTA)."`, `"Prioridad actualizada..."` y `null` | No mostrar badge `Reclasificado` junto a `Tipo de Afectación` ni sobrescribir `justificacionReclasificacion` | `IncidenteResumenSection.tsx:38-43` filtra `Prioridad asignada`/`actualizada` y exige `justif.length > 0`; `IncidenteDetalleDrawer.test.tsx` valida los `3` escenarios | **CORREGIDO** | 17/11/2026 14:25 | 18/11/2026 18:17 | fix(h38): integrar develop y resolver hallazgos de QA ciclo 2 (BUG-H38-WEB-03..05, 08) |
| `BUG-H38-WEB-06` | Refresco en vivo de `ultimoReporte` en Drawer y limpieza de `justificacionPrioridad: null` en rectificaciones | Tiempo Real / UI | Drawer / Hook | Alta | `IncidenteDetalleDrawer` abierto con reporte previo; rectificación posterior con `justificacionPrioridad: null` | Evento WS `incidente:actualizado` con `reporteTerreno` (`#2`) y `justificacionPrioridad: null` | `IncidenteDetalleDrawer` reconstruye `ultimoReporte` y limpia `justificacionPrioridad` ocultando chip `Ajustada` | `IncidenteDetalleDrawer` actualiza `ultimoReporte`; hook/modal/drawer aceptan `null` y `IncidenteCard` removió `cambioPrioridadMotivo` | **CORREGIDO** | 17/11/2026 14:22 | 18/11/2026 18:17 | fix(h38): resolver hallazgos de QA (BUG-H38-WEB-01..08) |
| `BUG-H38-WEB-07` | Formato Sentence Case en badge de prioridad de `ToastItem.tsx` y humanización de `de <PRIORIDAD>` en bitácora | Estándares UI / I18n | UI / Utilidades | Media | Notificación Toast con `priorityBadge` y hito `PRIORIDAD_RECTIFICADA` | `priorityBadge: "CRITICA"` y `"Prioridad actualizada en terreno de BAJA a CRITICA (Sugerida: ALTA)"` | Toast muestra `Crítica` vía `formatearPrioridad` y bitácora formatea `de Baja a Crítica (Sugerida: Alta)` | `ToastItem.tsx:264` invoca `formatearPrioridad` y `estadoUtils.ts:417` agrega prefijo `de` (`estadoUtils.test.ts` `17/17` pass) | **CORREGIDO** | 17/11/2026 14:26 | 18/11/2026 18:17 | fix(h38): resolver hallazgos de QA (BUG-H38-WEB-01..08) |
| `BUG-H38-WEB-08` | Existencia de capturas de pantalla y textos en manual `H38-evaluacion-prioridad-terreno-mando.md` (`GEMINI.md §7`) | Documentación / QA | Repositorio | Media | Manual en `docs/manuals/H38-evaluacion-prioridad-terreno-mando.md` | Inspección de líneas `28`, `39`, `41`, `52` y `docs/manuals/assets/h38-evaluacion-prioridad-terreno-mando/` | Existencia de `3` PNG reales en `assets/h38-evaluacion-prioridad-terreno-mando/` y variantes de botón | Las `3` capturas PNG reales (`kanban-card-prioridad-reportes.png`, `drawer-acceso-ultimo-reporte.png`, `mision-detalle-historial-reportes.png`) existen y fueron verificadas | **CORREGIDO** | 17/11/2026 14:17 | 18/11/2026 18:14 | fix(h38): integrar develop y resolver hallazgos de QA ciclo 2 (BUG-H38-WEB-03..05, 08) |
| `CP-H38-WEB-01` | Despliegue de indicador `Ajustada`, tooltip comparativo y contador de reportes en `IncidenteCard` (CA-1, CA-3, CA-5) | Funcional / UI | Componente / Card | Crítica | Tarjeta `IncidenteCard` con `prioridad` distinta de `prioridadSugerida` y `totalReportesTerreno: 2` | `prioridad: 'CRITICA'`, `prioridadSugerida: 'ALTA'`, `justificacionPrioridad: 'Avance rápido del agua...'`, `totalReportesTerreno: 2` | Muestra chip `Ajustada`, prioridad `Crítica`, tooltip con sugerida/justificación y badge `2 reportes · Rectificado` | `IncidenteCard.test.tsx` aprueba `15/15` pruebas en `717ms` incluyendo caso HU-38 (`109ms`) | **APROBADO** | 17/11/2026 14:28 | 18/11/2026 18:17 | feat(mando): estandarizar tarjetas de reporte y desplegar afectacion de multiples familias (H38) |
| `CP-H38-WEB-02` | Visualización de chips `FIBE` y `Verificado` en tarjeta Kanban al cargar desde servidor (CA-4, CA-5) | Funcional / UI | Componente / Card | Alta | Incidente con `requiereAsistenciaSocial: true` y `verificado: true` | `IncidenteResumen` con `verificado: true`, `reclasificadoEnTerreno: false`, `requiereAsistenciaSocial: true` | Renderiza chips rectangulares `FIBE` (warning) y `Verificado` (success) persistentes tras recarga | Verificado en `IncidenteCard.test.tsx` (`15/15` pass en `717ms`) | **APROBADO** | 17/11/2026 14:27 | 18/11/2026 18:17 | fix(kanban): asegurar persistencia del chip verificado al paginar y refrescar |
| `CP-H38-WEB-03` | Exposición de prioridad confirmada y chip `Sugerida: [Nivel]` en cabecera del Drawer (CA-1, CA-3) | Funcional / UI | Componente / Header | Alta | `IncidenteDetalleDrawer` abierto para incidente con ajuste manual en terreno | `prioridad: 'CRITICA'`, `prioridadSugerida: 'ALTA'`, `justificacionPrioridad: 'Riesgo eléctrico activo...'` | Cabecera muestra chips `Prioridad: Crítica` y `Sugerida: Alta` con tooltip explicativo | Verificado en `IncidenteDetalleDrawer.test.tsx` (`19/19` pass en `2441ms`) | **APROBADO** | 17/11/2026 14:28 | 18/11/2026 18:17 | feat(mando): estandarizar tarjetas de reporte y desplegar afectacion de multiples familias (H38) |
| `CP-H38-WEB-04` | Renderizado de sección `Último Reporte de Terreno` con desglose de familias y navegación directa al modal de misión | Funcional / UI | Componente / Drawer | Alta | `IncidenteDetalle` con `ultimoReporte` y `reportesEvaluacionTerreno` incluyendo múltiples familias | `familias: ['Familia Morales', 'Casa 2 Interior']`, `nucleoFamiliarTotal: 6`, `nivelCompromisoVivienda: 'GRAVE_INHABITABLE'` | Despliega métricas de familias, personas, viviendas, compromiso y botón `Ver detalle` funcional | Verificado en `IncidenteDetalleDrawer.test.tsx` (`19/19` pass en `2441ms`) | **APROBADO** | 17/11/2026 14:27 | 18/11/2026 18:17 | feat(mando): estandarizar tarjetas de reporte y desplegar afectacion de multiples familias (H38) |
| `CP-H38-WEB-05` | Bloque `Último Reporte Realizado` en tarjetas de misión y accesos directos a último reporte / todos los reportes | Funcional / UI | Componente / Drawer | Alta | Misión activa con 2 reportes de evaluación (`#1 Inicial` y `#2 Rectificación`) | `reportesEvaluacionTerreno` con versiones `1` y `2` en `IncidenteMisionesSection` | Muestra `Reporte #2 — Rectificación Vigente`, comparativa de prioridad, resumen demográfico y botones de acceso | `IncidenteMisionesSection.test.tsx` aprueba `16/16` pruebas en `1217ms` | **APROBADO** | 17/11/2026 14:28 | 18/11/2026 18:17 | feat(mando): estandarizar tarjetas de reporte y desplegar afectacion de multiples familias (H38) |
| `CP-H38-WEB-06` | Historial versionado de reportes en `MisionReportesSection` con chips `Vigente`/`Histórico` y acordeón colapsable | Funcional / UI | Componente / Modal | Crítica | `MisionDetalleModal` abierto para misión con Reporte #1 (Inicial) y Reporte #2 (Rectificación) | `versionReporte: 1` y `2`, `prioridadSugerida: 'ALTA'`, `prioridadAsignada: 'CRITICA'`, `justificacionPrioridad` | Muestra `2 versiones registradas`, despliega por defecto solo el reporte vigente (`#2`) y colapsa el histórico (`#1`) | `MisionDetalleModal.test.tsx` aprueba `16/16` pruebas en `1650ms` | **APROBADO** | 17/11/2026 14:28 | 18/11/2026 18:17 | refactor(mando): estandarizar tarjetas y cabecera unificada de reportes de terreno (H37/H38) |
| `CP-H38-WEB-07` | Desglose individualizado de múltiples familias afectadas, vulnerabilidad y derivación FIBE en `MisionReportesSection` | Funcional / UI | Componente / Modal | Alta | Reporte con arreglo `detallesEvaluacion.familias` (>1 familia o con `referencia`) | `Familia Muñoz - Casa Principal` (4 pers., `GRAVE_INHABITABLE`, FIBE) y `Familia Díaz - Cabaña Interior` (3 pers., `MODERADO_PARCIAL`) | Despliega chip `2 hogares`, tarjetas individuales por familia con severidad y badge `Requiere FIBE`, más consolidado | Verificado en `MisionDetalleModal.test.tsx` (`16/16` pass en `1650ms`) | **APROBADO** | 17/11/2026 14:27 | 18/11/2026 18:17 | feat(mando): estandarizar tarjetas de reporte y desplegar afectacion de multiples familias (H38) |
| `CP-H38-WEB-08` | Despliegue de peligros activos y requerimientos operativos (evacuación, FIBE, riesgo eléctrico/estructural) | Funcional / UI | Componente / Modal | Alta | `detallesEvaluacion` con `requiereEvacuacion: true`, `requiereAsistenciaSocial: true` y `riesgosActivos` | `{ riesgoElectrico: true, riesgoEstructural: true, requiereEvacuacion: true, requiereAsistenciaSocial: true }` | Renderiza chips `Requiere Evacuación`, `Requiere Ficha FIBE`, `Riesgo Eléctrico` y `Riesgo Estructural` | Verificado en `MisionDetalleModal.test.tsx` (`16/16` pass en `1650ms`) | **APROBADO** | 17/11/2026 14:28 | 18/11/2026 18:17 | feat(mando): estandarizar tarjetas de reporte y desplegar afectacion de multiples familias (H38) |
| `CP-H38-WEB-09` | Recepción y deduplicación de eventos `incidente:actualizado` en `useEncargadoKanbanSocket` | Tiempo Real / Socket | Hook | Alta | Hook `useEncargadoKanbanSocket` montado y suscrito a `sala:encargados`, `encargado` y `mapa` | Emisión repetida de `incidente:actualizado` dentro de ventana de `4000ms` y evento con tipología/reporte | Deduplica emisiones repetidas por múltiples salas y limpia listeners/`salir` al desmontar | `useEncargadoKanbanSocket.test.ts` aprueba `10/10` casos en `112ms` | **APROBADO** | 17/11/2026 14:28 | 18/11/2026 18:17 | fix(mando): especificar cuando la tipologia no fue modificada por la patrulla y deduplicar socket kanban |
| `CP-H38-WEB-10` | Actualización en memoria del Tablero Kanban en `useIncidentesKanban` ante evento `incidente:actualizado` | Tiempo Real / Estado | Hook | Alta | Incidente cargado en columna `VERIFICANDO` del estado Kanban | Disparo de `onIncidenteActualizado` con nueva `prioridad`, `tipoAfectacion` y `justificacion` | Actualiza inmediatamente los atributos de la tarjeta en memoria sin recarga completa de página | `useIncidentesKanban.test.ts` aprueba `7/7` casos en `454ms` | **APROBADO** | 17/11/2026 14:27 | 18/11/2026 18:17 | feat(kanban): actualizar tipología, prioridad y justificación reactivamente vía websocket (#39) |
| `CP-H38-WEB-11` | Deduplicación de notificaciones Toast idénticas en `ToastProvider` | UX / Notificaciones | Componente / UI | Media | `ToastProvider` montado en el árbol de componentes | 4 invocaciones consecutivas de `showInfo` con idéntico título, mensaje y `codeBadge` | Muestra un único Toast en pantalla evitando apilamiento por eventos multi-sala | `Toast.test.tsx` aprueba `1/1` prueba en `394ms` | **APROBADO** | 17/11/2026 14:28 | 18/11/2026 18:17 | fix(notifications): deduplicar eventos websocket y toasts repetidos de patrullas e incidentes |
| `CP-H38-WEB-12` | Formateadores institucionales de prioridades, hitos y compromisos de vivienda en `estadoUtils.ts` | Unitaria / Utilidades | Utilidades | Media | Funciones puras en `src/lib/utils/estadoUtils.ts` | Inputs `CRITICA`, `ALTA`, `MEDIA`, `BAJA`, `PRIORIDAD_ASIGNADA`, `PRIORIDAD_RECTIFICADA`, `GRAVE_INHABITABLE` | Retorna cadenas legibles en Sentence Case (`Crítica`, `Alta`, `Media`, `Baja`, `Grave / Inhabitable`) | `estadoUtils.test.ts` aprueba `17/17` pruebas en `19ms` | **APROBADO** | 17/11/2026 14:28 | 18/11/2026 18:17 | fix(mando): humanizar enums y descripciones en bitacora cronologica de mision |
| `CP-H38-WEB-13` | Consulta autenticada Bearer JWT de incidentes y misiones con proyección de campos HU-38 contra `sgrai-api` vivo | Integración / API | DAL / Backend vivo | Alta | `sgrai-api` en `http://127.0.0.1:3001` y token JWT de `encargado@valdivia.cl` | `GET /api/incidentes?page=1&limit=3`, `GET /api/incidentes/dd7db71e-...` y `GET /api/misiones/247be4dd-...` con `Authorization: Bearer` | Retorna `200 OK` con `prioridadSugerida`, `totalReportesTerreno`, `reportesEvaluacionTerreno`, `ultimoReporte` e hitos | Respuestas `200 OK` verificadas en `INC-2026-9932` y `MIS-2026-0008` (servidor vivo inalcanzable en Ciclo 3; DAL validado en Vitest `9/9` y `13/13`) | **APROBADO** | 17/11/2026 14:26 | - | feat(mando): estandarizar tarjetas de reporte y desplegar afectacion de multiples familias (H38) |
| `CP-H38-WEB-14` | Restricción RBAC del endpoint `PATCH /api/incidentes/{id}/prioridad` rechazando rol Encargado (`403 Forbidden` — CA-6) | Seguridad / RBAC | API / Integración | Crítica | Token JWT de `encargado@valdivia.cl` (sin permiso `misiones:terreno:verificar`) | `PATCH /api/incidentes/dd7db71e-e878-4b58-a115-a848dc88bb38/prioridad` con `{"prioridad":"ALTA"}` | API deniega acceso con `403 Forbidden` exigiendo permiso `misiones:terreno:verificar` | `HTTP 403`: `{"message":"No cuenta con el permiso requerido: misiones:terreno:verificar"}` (evidencia backend Ciclo 1) | **APROBADO** | 17/11/2026 14:26 | - | feat(mando): estandarizar tarjetas de reporte y desplegar afectacion de multiples familias (H38) |
| `CP-H38-WEB-15` | Verificación de tipos TypeScript (`tsc --noEmit`) y build de producción Next.js (`npm run build`) | Estática / Compilación | CI / Build | Alta | Proyecto `sgrai-web` en rama `feature/h38-patrulla-asignar-prioridad` | `npx tsc --noEmit` y `npm run build` | Ambos procesos culminan con código de salida `0` y generación de rutas estáticas | `next build --webpack` compila en `8.3s` (`47/47` páginas) y `tsc --noEmit` termina en `0` tras regenerar `.next/types` | **APROBADO** | 17/11/2026 14:19 | 18/11/2026 18:16 | fix(h38): integrar develop y resolver hallazgos de QA ciclo 2 (BUG-H38-WEB-03..05, 08) |
| `CP-H38-WEB-16` | Ejecución completa de regresión unitaria y de componentes del repositorio (`npm test -- --run`) | Regresión / Unitaria | Suite Global | Crítica | Entorno Node.js + Vitest v3.2.7 + jsdom configurado | `npm test -- --run` | `100%` de archivos y pruebas existentes pasan sin regresiones | `129/129` archivos y `901/901` pruebas aprobadas en `28.87s` | **APROBADO** | 17/11/2026 14:17 | 18/11/2026 18:16 | fix(h38): integrar develop y resolver hallazgos de QA ciclo 2 (BUG-H38-WEB-03..05, 08) |

---

## 4. Bloque TSV para Hojas de Cálculo

```tsv
ID Caso	Título del Caso de Prueba	Tipo de Prueba	Nivel	Prioridad	Precondición	Datos de Prueba (Payload / Headers / Query)	Resultado Esperado	Resultado Obtenido	Estado	Fecha / Hora Ejecución	Fecha / Hora Re-Test	Solución / Commit
BUG-H38-WEB-01	Validación estática de ESLint y reglas de React Compiler / Hooks en la rama	Calidad / Linter	CI / Estático	Crítica	Repositorio en rama feature/h38-patrulla-asignar-prioridad	npm run lint	0 errores bloqueantes de ESLint en componentes, hooks y pruebas	npm run lint finaliza con exit 0 (0 errors, 0 warnings) tras subsanar los 9 errores e integrar develop	CORREGIDO	17/11/2026 14:17	18/11/2026 18:14	fix(h38): integrar develop y resolver hallazgos de QA ciclo 2 (BUG-H38-WEB-03..05, 08)
BUG-H38-WEB-02	Preservación de prioridad actualizada ante evento paralelo mision:actualizada sin campo prioridad (CA-5)	Tiempo Real / Concurrencia	Hook / Integración	Crítica	Tablero Kanban conectado a Socket.io; incidente en VERIFICANDO	incidente:actualizado (CRITICA) seguido de mision:actualizada (EN_CURSO, esSintetico: true, sin prioridad)	Tarjeta Kanban conserva CRITICA y mantiene verificado previo sin marcar true prematuramente	useEncargadoKanbanSocket omite prioridad por defecto y useIncidentesKanban preserva prioridad y verificado (useIncidentesKanban.test.ts 7/7 pass)	CORREGIDO	17/11/2026 14:20	18/11/2026 18:17	fix(h38): resolver hallazgos de QA (BUG-H38-WEB-01..08)
BUG-H38-WEB-03	Autenticación JWT Bearer en obtenerKpis y misionesService.listar y sincronización limpia con develop	Seguridad / Integración	Servicio / Git	Alta	Rama feature/h38-patrulla-asignar-prioridad integrada con punta actual de develop	apiClient.GET('/api/incidentes/kpis'), apiClient.GET('/api/misiones') y git merge-tree --write-tree develop HEAD	Servicios autenticados vía apiClient, sin enviar header vacío y merge limpio contra develop	develop integrado limpiamente (MERGE_CLEAN=YES), cabecera vacía eliminada y suites incidentesService.test.ts (9/9) + misionesService.test.ts (13/13) aprobadas	CORREGIDO	17/11/2026 14:25	18/11/2026 18:17	fix(h38): integrar develop y resolver hallazgos de QA ciclo 2 (BUG-H38-WEB-03..05, 08)
BUG-H38-WEB-04	Eliminación de DTOs manuales y casteos as unknown as con src/types/api-generated.d.ts (GEMINI.md §4)	Contrato / Tipado	Estático / DAL	Alta	api-generated.d.ts sincronizado con OpenAPI de sgrai-api	Inspección de src/types/api-generated.d.ts, incidentesService.ts, misionesService.ts y src/types/misiones.ts	Contratos de incidentes y misiones derivados de paths/components['schemas'] sin casteo apiClient as unknown as	Eliminado casteo en misionesService.obtenerDetalle, usando data.meta nativo y derivando tipos de src/types/misiones.ts desde paths de api-generated.d.ts	CORREGIDO	17/11/2026 14:24	18/11/2026 18:14	fix(h38): integrar develop y resolver hallazgos de QA ciclo 2 (BUG-H38-WEB-03..05, 08)
BUG-H38-WEB-05	Discriminación entre reclasificación de tipología (HU-37) y reportes de prioridad (HU-38 #1 y #2+) en IncidenteResumenSection	Funcional / Consistencia	UI / Hook	Alta	Incidente con Reporte #1 (PRIORIDAD_ASIGNADA), rectificación #2+ o justificacionReclasificacion: null sin tipología	"Reporte de evaluación #1: Prioridad asignada en terreno a CRITICA (Sugerida: ALTA).", "Prioridad actualizada..." y null	No mostrar badge Reclasificado junto a Tipo de Afectación ni sobrescribir justificacionReclasificacion	IncidenteResumenSection.tsx:38-43 filtra Prioridad asignada/actualizada y exige justif.length > 0; IncidenteDetalleDrawer.test.tsx valida los 3 escenarios	CORREGIDO	17/11/2026 14:25	18/11/2026 18:17	fix(h38): integrar develop y resolver hallazgos de QA ciclo 2 (BUG-H38-WEB-03..05, 08)
BUG-H38-WEB-06	Refresco en vivo de ultimoReporte en Drawer y limpieza de justificacionPrioridad: null en rectificaciones	Tiempo Real / UI	Drawer / Hook	Alta	IncidenteDetalleDrawer abierto con reporte previo; rectificación posterior con justificacionPrioridad: null	Evento WS incidente:actualizado con reporteTerreno (#2) y justificacionPrioridad: null	IncidenteDetalleDrawer reconstruye ultimoReporte y limpia justificacionPrioridad ocultando chip Ajustada	IncidenteDetalleDrawer actualiza ultimoReporte; hook/modal/drawer aceptan null y IncidenteCard removió cambioPrioridadMotivo	CORREGIDO	17/11/2026 14:22	18/11/2026 18:17	fix(h38): resolver hallazgos de QA (BUG-H38-WEB-01..08)
BUG-H38-WEB-07	Formato Sentence Case en badge de prioridad de ToastItem.tsx y humanización de de <PRIORIDAD> en bitácora	Estándares UI / I18n	UI / Utilidades	Media	Notificación Toast con priorityBadge y hito PRIORIDAD_RECTIFICADA	priorityBadge: "CRITICA" y "Prioridad actualizada en terreno de BAJA a CRITICA (Sugerida: ALTA)"	Toast muestra Crítica vía formatearPrioridad y bitácora formatea de Baja a Crítica (Sugerida: Alta)	ToastItem.tsx:264 invoca formatearPrioridad y estadoUtils.ts:417 agrega prefijo de (estadoUtils.test.ts 17/17 pass)	CORREGIDO	17/11/2026 14:26	18/11/2026 18:17	fix(h38): resolver hallazgos de QA (BUG-H38-WEB-01..08)
BUG-H38-WEB-08	Existencia de capturas de pantalla y textos en manual H38-evaluacion-prioridad-terreno-mando.md (GEMINI.md §7)	Documentación / QA	Repositorio	Media	Manual en docs/manuals/H38-evaluacion-prioridad-terreno-mando.md	Inspección de líneas 28, 39, 41, 52 y docs/manuals/assets/h38-evaluacion-prioridad-terreno-mando/	Existencia de 3 PNG reales en assets/h38-evaluacion-prioridad-terreno-mando/ y variantes de botón	Las 3 capturas PNG reales (kanban-card-prioridad-reportes.png, drawer-acceso-ultimo-reporte.png, mision-detalle-historial-reportes.png) existen y fueron verificadas	CORREGIDO	17/11/2026 14:17	18/11/2026 18:14	fix(h38): integrar develop y resolver hallazgos de QA ciclo 2 (BUG-H38-WEB-03..05, 08)
CP-H38-WEB-01	Despliegue de indicador Ajustada, tooltip comparativo y contador de reportes en IncidenteCard (CA-1, CA-3, CA-5)	Funcional / UI	Componente / Card	Crítica	Tarjeta IncidenteCard con prioridad distinta de prioridadSugerida y totalReportesTerreno: 2	prioridad: 'CRITICA', prioridadSugerida: 'ALTA', justificacionPrioridad: 'Avance rápido del agua...', totalReportesTerreno: 2	Muestra chip Ajustada, prioridad Crítica, tooltip con sugerida/justificación y badge 2 reportes · Rectificado	IncidenteCard.test.tsx aprueba 15/15 pruebas en 717ms incluyendo caso HU-38 (109ms)	APROBADO	17/11/2026 14:28	18/11/2026 18:17	feat(mando): estandarizar tarjetas de reporte y desplegar afectacion de multiples familias (H38)
CP-H38-WEB-02	Visualización de chips FIBE y Verificado en tarjeta Kanban al cargar desde servidor (CA-4, CA-5)	Funcional / UI	Componente / Card	Alta	Incidente con requiereAsistenciaSocial: true y verificado: true	IncidenteResumen con verificado: true, reclasificadoEnTerreno: false, requiereAsistenciaSocial: true	Renderiza chips rectangulares FIBE (warning) y Verificado (success) persistentes tras recarga	Verificado en IncidenteCard.test.tsx (15/15 pass en 717ms)	APROBADO	17/11/2026 14:27	18/11/2026 18:17	fix(kanban): asegurar persistencia del chip verificado al paginar y refrescar
CP-H38-WEB-03	Exposición de prioridad confirmada y chip Sugerida: [Nivel] en cabecera del Drawer (CA-1, CA-3)	Funcional / UI	Componente / Header	Alta	IncidenteDetalleDrawer abierto para incidente con ajuste manual en terreno	prioridad: 'CRITICA', prioridadSugerida: 'ALTA', justificacionPrioridad: 'Riesgo eléctrico activo...'	Cabecera muestra chips Prioridad: Crítica y Sugerida: Alta con tooltip explicativo	Verificado en IncidenteDetalleDrawer.test.tsx (19/19 pass en 2441ms)	APROBADO	17/11/2026 14:28	18/11/2026 18:17	feat(mando): estandarizar tarjetas de reporte y desplegar afectacion de multiples familias (H38)
CP-H38-WEB-04	Renderizado de sección Último Reporte de Terreno con desglose de familias y navegación directa al modal de misión	Funcional / UI	Componente / Drawer	Alta	IncidenteDetalle con ultimoReporte y reportesEvaluacionTerreno incluyendo múltiples familias	familias: ['Familia Morales', 'Casa 2 Interior'], nucleoFamiliarTotal: 6, nivelCompromisoVivienda: 'GRAVE_INHABITABLE'	Despliega métricas de familias, personas, viviendas, compromiso y botón Ver detalle funcional	Verificado en IncidenteDetalleDrawer.test.tsx (19/19 pass en 2441ms)	APROBADO	17/11/2026 14:27	18/11/2026 18:17	feat(mando): estandarizar tarjetas de reporte y desplegar afectacion de multiples familias (H38)
CP-H38-WEB-05	Bloque Último Reporte Realizado en tarjetas de misión y accesos directos a último reporte / todos los reportes	Funcional / UI	Componente / Drawer	Alta	Misión activa con 2 reportes de evaluación (#1 Inicial y #2 Rectificación)	reportesEvaluacionTerreno con versiones 1 y 2 en IncidenteMisionesSection	Muestra Reporte #2 — Rectificación Vigente, comparativa de prioridad, resumen demográfico y botones de acceso	IncidenteMisionesSection.test.tsx aprueba 16/16 pruebas en 1217ms	APROBADO	17/11/2026 14:28	18/11/2026 18:17	feat(mando): estandarizar tarjetas de reporte y desplegar afectacion de multiples familias (H38)
CP-H38-WEB-06	Historial versionado de reportes en MisionReportesSection con chips Vigente/Histórico y acordeón colapsable	Funcional / UI	Componente / Modal	Crítica	MisionDetalleModal abierto para misión con Reporte #1 (Inicial) y Reporte #2 (Rectificación)	versionReporte: 1 y 2, prioridadSugerida: 'ALTA', prioridadAsignada: 'CRITICA', justificacionPrioridad	Muestra 2 versiones registradas, despliega por defecto solo el reporte vigente (#2) y colapsa el histórico (#1)	MisionDetalleModal.test.tsx aprueba 16/16 pruebas en 1650ms	APROBADO	17/11/2026 14:28	18/11/2026 18:17	refactor(mando): estandarizar tarjetas y cabecera unificada de reportes de terreno (H37/H38)
CP-H38-WEB-07	Desglose individualizado de múltiples familias afectadas, vulnerabilidad y derivación FIBE en MisionReportesSection	Funcional / UI	Componente / Modal	Alta	Reporte con arreglo detallesEvaluacion.familias (>1 familia o con referencia)	Familia Muñoz - Casa Principal (4 pers., GRAVE_INHABITABLE, FIBE) y Familia Díaz - Cabaña Interior (3 pers., MODERADO_PARCIAL)	Despliega chip 2 hogares, tarjetas individuales por familia con severidad y badge Requiere FIBE, más consolidado	Verificado en MisionDetalleModal.test.tsx (16/16 pass en 1650ms)	APROBADO	17/11/2026 14:27	18/11/2026 18:17	feat(mando): estandarizar tarjetas de reporte y desplegar afectacion de multiples familias (H38)
CP-H38-WEB-08	Despliegue de peligros activos y requerimientos operativos (evacuación, FIBE, riesgo eléctrico/estructural)	Funcional / UI	Componente / Modal	Alta	detallesEvaluacion con requiereEvacuacion: true, requiereAsistenciaSocial: true y riesgosActivos	{ riesgoElectrico: true, riesgoEstructural: true, requiereEvacuacion: true, requiereAsistenciaSocial: true }	Renderiza chips Requiere Evacuación, Requiere Ficha FIBE, Riesgo Eléctrico y Riesgo Estructural	Verificado en MisionDetalleModal.test.tsx (16/16 pass en 1650ms)	APROBADO	17/11/2026 14:28	18/11/2026 18:17	feat(mando): estandarizar tarjetas de reporte y desplegar afectacion de multiples familias (H38)
CP-H38-WEB-09	Recepción y deduplicación de eventos incidente:actualizado en useEncargadoKanbanSocket	Tiempo Real / Socket	Hook	Alta	Hook useEncargadoKanbanSocket montado y suscrito a sala:encargados, encargado y mapa	Emisión repetida de incidente:actualizado dentro de ventana de 4000ms y evento con tipología/reporte	Deduplica emisiones repetidas por múltiples salas y limpia listeners/salir al desmontar	useEncargadoKanbanSocket.test.ts aprueba 10/10 casos en 112ms	APROBADO	17/11/2026 14:28	18/11/2026 18:17	fix(mando): especificar cuando la tipologia no fue modificada por la patrulla y deduplicar socket kanban
CP-H38-WEB-10	Actualización en memoria del Tablero Kanban en useIncidentesKanban ante evento incidente:actualizado	Tiempo Real / Estado	Hook	Alta	Incidente cargado en columna VERIFICANDO del estado Kanban	Disparo de onIncidenteActualizado con nueva prioridad, tipoAfectacion y justificacion	Actualiza inmediatamente los atributos de la tarjeta en memoria sin recarga completa de página	useIncidentesKanban.test.ts aprueba 7/7 casos en 454ms	APROBADO	17/11/2026 14:27	18/11/2026 18:17	feat(kanban): actualizar tipología, prioridad y justificación reactivamente vía websocket (#39)
CP-H38-WEB-11	Deduplicación de notificaciones Toast idénticas en ToastProvider	UX / Notificaciones	Componente / UI	Media	ToastProvider montado en el árbol de componentes	4 invocaciones consecutivas de showInfo con idéntico título, mensaje y codeBadge	Muestra un único Toast en pantalla evitando apilamiento por eventos multi-sala	Toast.test.tsx aprueba 1/1 prueba en 394ms	APROBADO	17/11/2026 14:28	18/11/2026 18:17	fix(notifications): deduplicar eventos websocket y toasts repetidos de patrullas e incidentes
CP-H38-WEB-12	Formateadores institucionales de prioridades, hitos y compromisos de vivienda en estadoUtils.ts	Unitaria / Utilidades	Utilidades	Media	Funciones puras en src/lib/utils/estadoUtils.ts	Inputs CRITICA, ALTA, MEDIA, BAJA, PRIORIDAD_ASIGNADA, PRIORIDAD_RECTIFICADA, GRAVE_INHABITABLE	Retorna cadenas legibles en Sentence Case (Crítica, Alta, Media, Baja, Grave / Inhabitable)	estadoUtils.test.ts aprueba 17/17 pruebas en 19ms	APROBADO	17/11/2026 14:28	18/11/2026 18:17	fix(mando): humanizar enums y descripciones en bitacora cronologica de mision
CP-H38-WEB-13	Consulta autenticada Bearer JWT de incidentes y misiones con proyección de campos HU-38 contra sgrai-api vivo	Integración / API	DAL / Backend vivo	Alta	sgrai-api en http://127.0.0.1:3001 y token JWT de encargado@valdivia.cl	GET /api/incidentes?page=1&limit=3, GET /api/incidentes/dd7db71e-... y GET /api/misiones/247be4dd-... con Authorization: Bearer	Retorna 200 OK con prioridadSugerida, totalReportesTerreno, reportesEvaluacionTerreno, ultimoReporte e hitos	Respuestas 200 OK verificadas en INC-2026-9932 y MIS-2026-0008 (servidor vivo inalcanzable en Ciclo 3; DAL validado en Vitest 9/9 y 13/13)	APROBADO	17/11/2026 14:26	-	feat(mando): estandarizar tarjetas de reporte y desplegar afectacion de multiples familias (H38)
CP-H38-WEB-14	Restricción RBAC del endpoint PATCH /api/incidentes/{id}/prioridad rechazando rol Encargado (403 Forbidden — CA-6)	Seguridad / RBAC	API / Integración	Crítica	Token JWT de encargado@valdivia.cl (sin permiso misiones:terreno:verificar)	PATCH /api/incidentes/dd7db71e-e878-4b58-a115-a848dc88bb38/prioridad con {"prioridad":"ALTA"}	API deniega acceso con 403 Forbidden exigiendo permiso misiones:terreno:verificar	HTTP 403: {"message":"No cuenta con el permiso requerido: misiones:terreno:verificar"} (evidencia backend Ciclo 1)	APROBADO	17/11/2026 14:26	-	feat(mando): estandarizar tarjetas de reporte y desplegar afectacion de multiples familias (H38)
CP-H38-WEB-15	Verificación de tipos TypeScript (tsc --noEmit) y build de producción Next.js (npm run build)	Estática / Compilación	CI / Build	Alta	Proyecto sgrai-web en rama feature/h38-patrulla-asignar-prioridad	npx tsc --noEmit y npm run build	Ambos procesos culminan con código de salida 0 y generación de rutas estáticas	next build --webpack compila en 8.3s (47/47 páginas) y tsc --noEmit termina en 0 tras regenerar .next/types	APROBADO	17/11/2026 14:19	18/11/2026 18:16	fix(h38): integrar develop y resolver hallazgos de QA ciclo 2 (BUG-H38-WEB-03..05, 08)
CP-H38-WEB-16	Ejecución completa de regresión unitaria y de componentes del repositorio (npm test -- --run)	Regresión / Unitaria	Suite Global	Crítica	Entorno Node.js + Vitest v3.2.7 + jsdom configurado	npm test -- --run	100% de archivos y pruebas existentes pasan sin regresiones	129/129 archivos y 901/901 pruebas aprobadas en 28.87s	APROBADO	17/11/2026 14:17	18/11/2026 18:16	fix(h38): integrar develop y resolver hallazgos de QA ciclo 2 (BUG-H38-WEB-03..05, 08)
```

---

## 5. Guía de Ejecución y Replicabilidad Paso a Paso

Todos los comandos listados a continuación corresponden a las ejecuciones sobre `feature/h38-patrulla-asignar-prioridad` en el directorio raíz de `web` durante el **Re-Test Final (`18/11/2026 18:14–18:18`)**.

### 5.1 Análisis Estático (`npm run lint`), Build (`npm run build`) y Tipado (`npx tsc --noEmit`)

```bash
npm run lint
npm run build
npx tsc --noEmit
```

**Salidas reales obtenidas (`exit code 0`):**
```text
LINT_EXIT=0 (0 errors, 0 warnings)

▲ Next.js 16.3.4 (webpack)
- Environments: .env.local
✓ Running next.config.ts took 32ms
✓ Compiled successfully in 8.3s
✓ Finished TypeScript in 10.9s
✓ Collecting page data using 15 workers in 956ms
✓ Generating static pages using 15 workers (47/47) in 2.8s
BUILD_EXIT=0

TSC_EXIT=0
```

> *Nota operativa:* Si el directorio caché `.next/types` contiene referencias obsoletas de otra rama, ejecutar `npm run build` previamente regenera `.next/types` y permite que `npx tsc --noEmit` concluya con código `0`.

### 5.2 Verificación de Integración Git y Activos del Manual H38 (`18/11/2026`)

```bash
git merge-tree --write-tree develop HEAD
ls -la docs/manuals/assets/h38-evaluacion-prioridad-terreno-mando/
```

**Salidas reales obtenidas:**
```text
MERGE_CLEAN=YES

drwxr-xr-x 1 ds2fery ds2fery    206 nov 18 18:11 .
drwxr-xr-x 1 ds2fery ds2fery    268 nov 18 18:11 ..
-rw-r--r-- 1 ds2fery ds2fery 160331 nov 18 18:11 drawer-acceso-ultimo-reporte.png
-rw-r--r-- 1 ds2fery ds2fery 103131 nov 18 18:11 kanban-card-prioridad-reportes.png
-rw-r--r-- 1 ds2fery ds2fery 192154 nov 18 18:11 mision-detalle-historial-reportes.png
```

---

### 5.3 Suites Automatizadas Vitest (Global, Subconjunto y Filtros `-t`) — Re-Test Final `18/11/2026`

#### Comando 1: Suite Global del Repositorio (`CP-H38-WEB-16`)
```bash
npm test -- --run
```

**Salida real obtenida:**
```text
 RUN  v3.2.7 /home/ds2fery/Documentos/Proyecto/sgrai-uach/web

 Test Files  129 passed (129)
      Tests  901 passed (901)
   Duration  28.87s (transform 15.02s, setup 24.89s, collect 63.02s, tests 88.23s, environment 172.52s, prepare 20.62s)
```

#### Comando 2: Subconjunto de 11 Suites Vinculadas a Centro de Mando, Servicios, Socket.io, Toasts y Utilidades
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
 ✓ src/lib/utils/__tests__/estadoUtils.test.ts (17 tests) 19ms
 ✓ src/services/__tests__/incidentesService.test.ts (9 tests) 23ms
 ✓ src/services/__tests__/misionesService.test.ts (13 tests) 52ms
 ✓ src/hooks/__tests__/usePatrullas.test.ts (8 tests) 177ms
 ✓ src/hooks/__tests__/useEncargadoKanbanSocket.test.ts (10 tests) 112ms
 ✓ src/components/ui/__tests__/Toast.test.tsx (1 test) 394ms
 ✓ src/hooks/__tests__/useIncidentesKanban.test.ts (7 tests) 454ms
 ✓ src/components/mando/__tests__/IncidenteCard.test.tsx (15 tests) 717ms
 ✓ src/components/mando/__tests__/IncidenteMisionesSection.test.tsx (16 tests) 1217ms
 ✓ src/components/mando/mision/__tests__/MisionDetalleModal.test.tsx (16 tests) 1650ms
 ✓ src/components/mando/__tests__/IncidenteDetalleDrawer.test.tsx (19 tests) 2441ms

 Test Files  11 passed (11)
      Tests  131 passed (131)
   Duration  7.20s (transform 5.99s, setup 3.32s, collect 11.20s, tests 7.26s, environment 20.16s, prepare 2.34s)
```

#### Comando 3: Ejecución Filtrada Específica para HU-38 y Regresiones QA
```bash
npm test -- --run -t "HU-38|BUG-H38-WEB"
```

**Salida real obtenida:**
```text
 ✓ src/components/mando/mision/__tests__/MisionDetalleModal.test.tsx (16 tests | 15 skipped) 540ms
 ✓ src/components/mando/__tests__/IncidenteDetalleDrawer.test.tsx (19 tests | 17 skipped) 1170ms
 ✓ src/components/mando/__tests__/IncidenteMisionesSection.test.tsx (16 tests | 15 skipped) 486ms
 ✓ src/components/mando/__tests__/IncidenteCard.test.tsx (15 tests | 14 skipped) 109ms
 ✓ src/hooks/__tests__/useIncidentesKanban.test.ts (7 tests | 6 skipped) 95ms

 Test Files  5 passed | 124 skipped (129)
      Tests  6 passed | 895 skipped (901)
   Duration  21.40s (transform 13.32s, setup 24.60s, collect 59.08s, tests 2.40s, environment 163.44s, prepare 18.64s)
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

#### Escenario C: Consulta Autenticada de Tablero y Detalle de Incidente con Reportes Versionados (`CP-H38-WEB-13`) — `200 OK`
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

#### Escenario D: Consulta de Detalle de Misión y Bitácora Cronológica (`CP-H38-WEB-13`) — `200 OK`
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

| Criterio de Aceptación / Requisito (HU-38) | Responsabilidad Arquitectónica | Cobertura en `sgrai-web` | Estado QA (Ciclo 3) | Casos y Defectos Asociados |
|---|---|---|---|---|
| **CA-1:** Mostrar de forma visible la `prioridad_sugerida` calculada preliminarmente por el sistema | `sgrai-pwa` (evaluación) / `sgrai-web` (auditoría en mando) | `IncidenteDetalleHeader`, `IncidenteCard`, `IncidenteMisionesSection` y `MisionReportesSection` exhiben `prioridadSugerida` frente a la confirmada | 🟢 **CUMPLE** | `CP-H38-WEB-01`, `CP-H38-WEB-03`, `CP-H38-WEB-05`, `CP-H38-WEB-06` |
| **CA-2:** Proveer selector con los cuatro niveles canónicos `BAJA`, `MEDIA`, `ALTA`, `CRITICA` | `sgrai-pwa` / `sgrai-api` | `sgrai-web` formatea los cuatro niveles en Sentence Case en tarjetas, Drawer, modal de misión, `ToastItem` y bitácora | 🟢 **CUMPLE** | `CP-H38-WEB-12`, `BUG-H38-WEB-07` (Corregido) |
| **CA-3:** Campo obligatorio `justificacion_prioridad` (≥ 5 chars) si la patrulla modifica la prioridad sugerida | `sgrai-pwa` / `sgrai-api` | `sgrai-web` despliega la justificación técnica y limpia `justificacionPrioridad: null` cuando la rectificación confirma la sugerencia | 🟢 **CUMPLE** | `CP-H38-WEB-01`, `CP-H38-WEB-03`, `BUG-H38-WEB-06` (Corregido) |
| **CA-4:** Actualización transaccional de `incidente.prioridad`, `justificacion_prioridad` e hito en `mision_hito` | `sgrai-api` | `sgrai-web` formatea `de Baja a Crítica` en bitácora y evita falsos chips tipológicos tanto en Reporte #1 (`Prioridad asignada`) como en rectificaciones (`Prioridad actualizada`) | 🟢 **CUMPLE** | `CP-H38-WEB-06`, `CP-H38-WEB-13`, `BUG-H38-WEB-05` (Corregido), `BUG-H38-WEB-07` (Corregido) |
| **CA-5:** Emisión WebSocket `incidente:actualizado` al Centro de Mando reflejando el nuevo badge en el tablero Kanban | `sgrai-api` + `sgrai-web` | Evento `mision:actualizada` ya no sobrescribe `prioridad` a `MEDIA` y `IncidenteDetalleDrawer` refresca `ultimoReporte` en vivo | 🟢 **CUMPLE** | `CP-H38-WEB-09`, `CP-H38-WEB-10`, `BUG-H38-WEB-02` (Corregido), `BUG-H38-WEB-06` (Corregido) |
| **CA-6:** Endpoint requiere permiso RBAC `misiones:terreno:verificar` | `sgrai-api` | Rol `ENCARGADO` rechazado con `403 Forbidden`; `obtenerKpis` y `misionesService.listar` migrados a `apiClient` sin conflictos contra `develop` | 🟢 **CUMPLE** | `CP-H38-WEB-14`, `BUG-H38-WEB-03` (Corregido) |
| **Transversales:** ESLint, OpenAPI (`GEMINI.md §4`), Merge vs `develop` y Manual con capturas (`GEMINI.md §7`) | `sgrai-web` | ESLint (`0` errores, `0` warnings), `api-generated.d.ts`, `incidentesService`, `misionesService` y `misiones.ts` alineados, `merge-tree` limpio y `3` PNGs reales en manual H38 | 🟢 **CUMPLE** | `BUG-H38-WEB-01`, `BUG-H38-WEB-03`, `BUG-H38-WEB-04`, `BUG-H38-WEB-08` (Todos Corregidos) |
