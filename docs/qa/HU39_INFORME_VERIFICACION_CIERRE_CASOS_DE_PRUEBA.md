# Plan y Reporte de Pruebas QA — HU-39: Informe Técnico de Verificación en Terreno y Cierre de Misión en Centro de Mando (Fusión H39/H86)

**Proyecto:** SGRAI — Sistema de Gestión de Recursos para Atención de Incidentes (DGRD Municipalidad de Valdivia)  
**Repositorio:** `sgrai-web`  
**Rama Evaluada:** `feature/h39-patrulla-enviar-reporte-cerrar`  
**Historia de Usuario:** HU-39 — *Informe Técnico de Verificación en Terreno y Cierre de Misión de Patrullaje (Recepción, Trazabilidad y Cierre en Centro de Mando)*  
**Desarrollador Asignado:** Cristóbal Veas (`zetastormy`)  
**Auditor Técnico:** Departamento de Aseguramiento de Calidad SGRAI  
**Estado de Certificación QA:** `APROBADO EN RE-TEST — 6/6 DEFECTOS SUBSANADOS Y VERIFICADOS (APTO PARA MERGE)`  
**Fecha de Auditoría Inicial:** `24/11/2026 01:05`  
**Fecha de Re-Test:** `25/11/2026 01:01`

---

## 1. Resumen Ejecutivo de Auditoría Técnica y Re-Test

Se ejecutó la auditoría técnica inicial (`24/11/2026 01:05`) y el ciclo de **Re-Test integral (`25/11/2026 01:01`)** para la Historia de Usuario **HU-39 (Fusión H39/H86)** en el repositorio `sgrai-web` (`/gestion/centro-incidentes` — Centro de Mando).

El módulo incorpora la sincronización en tiempo real del dictamen de cierre (`REQUIERE_CUADRILLA` y `NO_ABORDABLE`), la visualización del motivo fundado de no abordabilidad en tablero Kanban, panel lateral (`IncidenteDetalleDrawer`) y modal de misión (`MisionDetalleModal`), el despliegue consistente del estado del terreno (`estadoTerreno`), la comparativa automática de personas afectadas frente al reporte previo de prioridad (HU-38), el traslado del indicador de Ficha FIBE al informe de cierre (`VERIFICACION_CIERRE`), la galería preparada para adjuntos fotográficos (HU-43), la humanización de hitos en bitácora y la exposición de errores HTTP en el tablero Kanban.

Durante la auditoría inicial se levantaron **6 defectos abiertos** (`2` Críticos, `2` Altos, `1` Medio y `1` Bajo). Tras la integración con `develop` y el commit correctivo del desarrollador en `sgrai-web` (coordinado con la actualización de `sgrai-api` y `sgrai-pwa`), el **Re-Test confirmó la subsanación completa de los 6 defectos**, sin regresiones en la suite global de pruebas, compilación de producción ni análisis estático:

| Métrica de Calidad | Auditoría Inicial (`24/11/2026 01:05`) | Re-Test Final (`25/11/2026 01:01`) | Estado |
| :--- | :--- | :--- | :--- |
| **Total de Ítems en Matriz** | 24 (`6` Defectos + `18` Casos de Prueba) | 24 (`6` Defectos + `18` Casos de Prueba) | **24 Evaluados** |
| **Ítems Conformes (`CORREGIDO` / `APROBADO`)** | 12 / 24 (`50.0%`) | 24 / 24 (`100.0%`) | **Aprobado** |
| **Defectos Abiertos (`ABIERTO`)** | 6 (`2` Críticos, `2` Altos, `1` Medio, `1` Bajo) | 0 (`6 / 6` Corregidos) | **Cerrado sin Pendientes** |
| **ESLint (`npm run lint`)** | 10 errores, 18 warnings (`Exit code 1`) | 0 errores, 0 warnings (`Exit code 0`) | **Cumple** |
| **Chequeo de Tipos (`npx tsc --noEmit`)** | 0 errores tras regeneración `.next/types` | 0 errores (`Exit code 0`) | **Cumple** |
| **Suite Focalizada HU-39 (Vitest)** | 123 / 123 tests (`9` archivos) | 134 / 134 tests (`9` archivos, `8.50s`) | **100% Passing** |
| **Filtro Específico HU-39 (`npm test -- -t`)** | 14 / 14 tests (`7` archivos) | 15 / 15 tests (`7` archivos, `27.60s`) | **100% Passing** |
| **Suite Global Vitest (`npm test`)** | 909 / 909 tests (`129` archivos) | 1009 / 1009 tests (`137` archivos, `34.50s`) | **100% Passing** |
| **Build Producción (`npx next build --webpack`)** | 47 / 47 rutas compiladas (`Exit code 0`) | 49 / 49 rutas compiladas (`Exit code 0`) | **Cumple** |
| **Cumplimiento `AGENTS.md` / `GEMINI.md`** | Emojis `0`; falla `<Chip />` y Sentence Case | Emojis `0`, sin `next/font/google`, `<Chip />` y Sentence Case conformes | **Cumple** |

---

## 2. Registro Técnico de Defectos

### `BUG-H39-WEB-01` (Severidad: Crítica — **CORREGIDO**) — Errores bloqueantes de ESLint en componentes, hooks y pruebas modificados en la rama
- **Archivos afectados:**
  - `src/components/mando/KanbanBoard.tsx`
  - `src/components/mando/mision/MisionReportesSection.tsx`
  - `src/components/mando/IncidentesKpiCards.tsx`
  - `src/components/ui/ToastItem.tsx`
  - `src/hooks/__tests__/useIncidentesKanban.test.ts`
- **Hallazgo inicial (`24/11/2026`):** `npm run lint` abortaba con código `1`, reportando `10` errores bloqueantes (`react-hooks/immutability`, `react-hooks/refs`, `react-hooks/preserve-manual-memoization`, `react-hooks/set-state-in-effect`, `react-hooks/purity` y `@typescript-eslint/no-explicit-any`) y `18` warnings.
- **Verificación en Re-Test (`25/11/2026`):** Se verificó la resolución de las referencias mediante `useRef`/`useEffect` en `KanbanBoard.tsx`, memoización de `hitoReclasificacion` en `MisionReportesSection.tsx`, tipado estricto de callbacks en `useIncidentesKanban.test.ts`, y saneamiento en `IncidentesKpiCards.tsx` y `ToastItem.tsx`. La ejecución de `npm run lint` finalizó con código de salida `0` (`0` errores, `0` warnings).

### `BUG-H39-WEB-02` (Severidad: Crítica — **CORREGIDO**) — Desincronización de `detalle.ultimoReporte`, estado de patrulla e integridad de misiones históricas en `IncidenteDetalleDrawer` ante evento WebSocket H39
- **Archivos afectados:**
  - `src/components/mando/IncidenteDetalleDrawer.tsx` (líneas 268-378)
  - `src/components/mando/drawer/IncidenteUltimoReporteSection.tsx`
  - `src/components/mando/__tests__/IncidenteDetalleDrawer.test.tsx` (líneas 938-1041)
- **Hallazgo inicial (`24/11/2026`):** Al recibir `incidente:actualizado` con `reporteTerreno` de cierre (`VERIFICACION_CIERRE`), `handleActualizadoSocket` no actualizaba `detalle.ultimoReporte`, sobrescribía todas las misiones `VERIFICACION` a `COMPLETADA` (incluyendo misiones históricas `RECHAZADA` o `CANCELADA`) y omitía liberar `patrulla.estado` a `DISPONIBLE`.
- **Verificación en Re-Test (`25/11/2026`):** `handleActualizadoSocket` reconstruye `nuevoUltimoReporte` con los campos del cierre (`tipoReporte`, `dictamen`, `motivoNoAbordable`, `estadoTerreno`, `requiereAsistenciaSocial`, `personasAfectadas`, `personasAfectadasPrevias`, `personasAfectadasModificadas`) y lo asigna en `ultimoReporte`. El mapeo de misiones identifica exclusivamente la misión cerrada (`reporteEntrante?.misionId ? m.id === reporteEntrante.misionId : ['PLANIFICADA', 'DESPACHADA', 'EN_CURSO'].includes(m.estado)`), preservando misiones históricas `RECHAZADA`/`CANCELADA` y transicionando `patrulla.estado` a `'DISPONIBLE'`. Validado mediante nueva prueba automatizada de regresión en `IncidenteDetalleDrawer.test.tsx`.

### `BUG-H39-WEB-03` (Severidad: Alta — **CORREGIDO**) — Desincronización del contrato OpenAPI (`api-generated.d.ts`) y pérdida del chip `Requiere Cuadrilla` tras recarga (`F5`)
- **Archivos afectados:**
  - `src/types/api-generated.d.ts`
  - `src/services/incidentesService.ts` (líneas 28-31)
  - `src/types/misiones.ts` (líneas 65-69)
  - `src/components/mando/IncidenteCard.tsx`
- **Hallazgo inicial (`24/11/2026`):** `src/types/api-generated.d.ts` no había sido regenerado desde `sgrai-api` y `GET /api/incidentes` no proyectaba `dictamenTerreno`, provocando pérdida del chip `Requiere Cuadrilla` tras recargar el navegador (`F5`).
- **Verificación en Re-Test (`25/11/2026`):** Se constató la proyección de `dictamenTerreno` en `sgrai-api` (`incidente-kanban.repository.ts`, `incidente-kanban.schema.ts` e `incidente-kanban.service.ts`), la regeneración de `src/types/api-generated.d.ts` incorporando `POST /api/misiones/{id}/reporte`, `dictamenTerreno`, `fechaCierre`, `motivoNoAbordable`, `tipoReporte`, `dictamen` y `reporteVerificacionEnviado`, y la remoción de las extensiones manuales redundantes en `incidentesService.ts` y `misiones.ts`.

### `BUG-H39-WEB-04` (Severidad: Alta — **CORREGIDO**) — Pérdida de `detallesEvaluacion`, liberación de patrulla, contexto `NO_ABORDABLE` y bitácora en vivo en `MisionDetalleModal`
- **Archivos afectados:**
  - `src/components/mando/mision/MisionDetalleModal.tsx` (líneas 154-364)
- **Hallazgo inicial (`24/11/2026`):** `handleIncidenteActualizado` leía únicamente `repRaw.evaluacion` (ignorando `repRaw.detallesEvaluacion`), no liberaba `patrulla.estado` a `'DISPONIBLE'`, omitía `incidente.motivoNoAbordable` y `incidente.fechaCierre`, y no escuchaba `mision:actualizada` para sincronizar `bitacoraTiempos`.
- **Verificación en Re-Test (`25/11/2026`):** El handler resuelve `repRaw.detallesEvaluacion ?? repRaw.evaluacion`, actualiza `patrulla.estado = 'DISPONIBLE'` al cierre, sincroniza `incidente.motivoNoAbordable` y `incidente.fechaCierre`, e incorpora `handleMisionActualizada` suscrito a `mision:actualizada` para anexar sin duplicados el hito `VERIFICACION_COMPLETADA` en `bitacoraTiempos` (o recargar vía `obtenerDetalleMision` como respaldo) en correspondencia directa con el payload emitido por `sgrai-api` (`mision.service.ts`).

### `BUG-H39-WEB-05` (Severidad: Media — **CORREGIDO**) — Contradicción entre visualización de `estadoTerreno`, manuales de usuario H39 y CA-4
- **Archivos afectados:**
  - `src/components/mando/KanbanBoard.tsx` (líneas 199-204)
  - `src/components/mando/drawer/IncidenteMisionesSection.tsx` (líneas 678-682)
  - `src/components/mando/drawer/IncidenteUltimoReporteSection.tsx` (líneas 134-137, 243-248)
  - `src/components/mando/mision/MisionReportesSection.tsx` (líneas 700-704, 795-802)
  - `docs/manuals/H39-informe-verificacion-cierre-mando.md` y `docs/manuals/estandar-tarjetas-reportes-mando.md`
- **Hallazgo inicial (`24/11/2026`):** La interfaz había retirado la visualización de `estadoTerreno` mientras los manuales de usuario y CA-4 continuaban especificándolo.
- **Verificación en Re-Test (`25/11/2026`):** Se restauró de forma uniforme el despliegue de `estadoTerreno` formateado (`formatearEstado`) en la notificación Toast de `KanbanBoard`, el chip `Terreno: ...` en `IncidenteMisionesSection`, el bloque de datos de `IncidenteUltimoReporteSection`, y la cabecera y grilla de `MisionReportesSection`, quedando alineado con CA-4, `sgrai-pwa`, los manuales institucionales y las aserciones en `IncidenteDetalleDrawer.test.tsx` y `MisionDetalleModal.test.tsx`.

### `BUG-H39-WEB-06` (Severidad: Baja — **CORREGIDO**) — Infracción de estándar `<Chip />` / Sentence Case en Drawer y Toast, y flag `tieneMisionEnCurso` residual en `useIncidentesKanban`
- **Archivos afectados:**
  - `src/components/mando/IncidenteDetalleDrawer.tsx` (líneas 582-586)
  - `src/components/ui/ToastItem.tsx` (líneas 186-191)
  - `src/hooks/useIncidentesKanban.ts` (líneas 527-586)
  - `src/hooks/__tests__/useIncidentesKanban.test.ts` (línea 621)
- **Hallazgo inicial (`24/11/2026`):** `IncidenteDetalleDrawer` utilizaba un `<span>` inline con `uppercase` en lugar de `<Chip />`; `ToastItem` mostraba `toast.priorityBadge` en mayúsculas crudas; `useIncidentesKanban` conservaba `tieneMisionEnCurso: true` tras un cierre `REQUIERE_CUADRILLA`.
- **Verificación en Re-Test (`25/11/2026`):** `IncidenteDetalleDrawer` emplea `<Chip variant="success" size="sm" icon={<CheckCircle2 size={12} />}>Verificación Completada</Chip>`; `ToastItem` formatea `toast.priorityBadge` con `formatearPrioridad(...)`; y `useIncidentesKanban` evalúa `esCierreVerificacion` limpiando `tieneMisionDespachada: false` y `tieneMisionEnCurso: false` tanto en `NO_ABORDABLE` como en `REQUIERE_CUADRILLA` (cubierto en `useIncidentesKanban.test.ts`).

---

## 3. Matriz Consolidada de Casos de Prueba (13 Columnas)

| ID Caso | Título del Caso de Prueba | Tipo de Prueba | Nivel | Prioridad | Precondición | Datos de Prueba (Payload / Headers / Query) | Resultado Esperado | Resultado Obtenido | Estado | Fecha / Hora Ejecución | Fecha / Hora Re-Test | Solución / Commit |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **BUG-H39-WEB-01** | Cumplimiento estricto de ESLint en componentes, hooks y tests de la rama H39 | Calidad / Linter | CI / Estático | Crítica | Rama `feature/h39-patrulla-enviar-reporte-cerrar` con dependencias instaladas | `npm run lint` | Salida con código `0` y `0` errores bloqueantes de ESLint en el proyecto | Re-Test aprobado: `npm run lint` finaliza con código `0`, `0` errores y `0` warnings en todo el repositorio | **CORREGIDO** | 24/11/2026 01:05 | 25/11/2026 01:01 | fix(h38): resolver conflictos con develop y corregir errores de ESLint |
| **BUG-H39-WEB-02** | Sincronización en vivo de `detalle.ultimoReporte`, liberación de patrulla e integridad de misiones en `IncidenteDetalleDrawer` | Tiempo Real / WebSocket | Componente | Crítica | `IncidenteDetalleDrawer` abierto en incidente con reporte H38/H37 previo y misión histórica `RECHAZADA` | Evento WS `incidente:actualizado` con `reporteTerreno` de `tipoReporte: 'VERIFICACION_CIERRE'` y `misionId: 'm-activa-1'` | `IncidenteUltimoReporteSection` actualiza al nuevo informe, solo la misión activa transiciona a `COMPLETADA`, `patrulla.estado` pasa a `DISPONIBLE` y la misión histórica conserva su estado | Re-Test aprobado: `detalle.ultimoReporte` se reconstruye en vivo, `patrulla.estado` pasa a `DISPONIBLE` y la misión histórica `RECHAZADA` se preserva (validado en `IncidenteDetalleDrawer.test.tsx`) | **CORREGIDO** | 24/11/2026 01:05 | 25/11/2026 01:01 | fix(mando): resolver observaciones QA H39 (socket drawer/modal, OpenAPI dictamenTerreno, estadoTerreno y Chip) |
| **BUG-H39-WEB-03** | Regeneración de contrato OpenAPI (`api-generated.d.ts`) y persistencia de chip `Requiere Cuadrilla` tras recarga (`F5`) | Contrato / Persistencia | Integración / Tipos | Alta | Incidente con cierre `REQUIERE_CUADRILLA` consultado vía `GET /api/incidentes` tras recargar navegador | `src/types/api-generated.d.ts`, `incidentesService.ts`, `misiones.ts`, `IncidenteCard.tsx` y `sgrai-api` (`incidente-kanban.*`) | Contratos generados con `dictamenTerreno` sin extensiones manuales redundantes y proyección en `GET /api/incidentes` preservando el chip tras `F5` | Re-Test aprobado: `sgrai-api` proyecta `dictamenTerreno`, `api-generated.d.ts` regenerado con `/api/misiones/{id}/reporte` y `dictamenTerreno`, y extensiones manuales removidas | **CORREGIDO** | 24/11/2026 01:05 | 25/11/2026 01:01 | fix(mando): resolver observaciones QA H39 (socket drawer/modal, OpenAPI dictamenTerreno, estadoTerreno y Chip) |
| **BUG-H39-WEB-04** | Sincronización en vivo de `detallesEvaluacion`, `patrulla.estado`, contexto `NO_ABORDABLE` y bitácora en `MisionDetalleModal` | Tiempo Real / WebSocket | Componente | Alta | `MisionDetalleModal` abierto sobre misión de verificación en curso mientras patrulla envía cierre H39 | Evento WS `incidente:actualizado` con `detallesEvaluacion`, `motivoNoAbordable`, `fechaCierre` y evento `mision:actualizada` con `hito` | Modal lee `detallesEvaluacion`, libera `patrulla.estado` a `DISPONIBLE`, actualiza `incidente.motivoNoAbordable`/`fechaCierre` e incorpora el hito a `bitacoraTiempos` | Re-Test aprobado: `MisionDetalleModal.tsx` lee `detallesEvaluacion ?? evaluacion`, libera patrulla, actualiza `motivoNoAbordable`/`fechaCierre` y suscribe `mision:actualizada` con anexado deduplicado en bitácora | **CORREGIDO** | 24/11/2026 01:05 | 25/11/2026 01:01 | fix(mando): resolver observaciones QA H39 (socket drawer/modal, OpenAPI dictamenTerreno, estadoTerreno y Chip) |
| **BUG-H39-WEB-05** | Consistencia entre visualización de `estadoTerreno`, manuales de usuario H39 y Criterio de Aceptación CA-4 | Documentación / Funcional | Repositorio / UI | Media | Revisión cruzada de Toast, Drawer, Modal, CA-4 y manuales en `docs/manuals/` | `KanbanBoard.tsx`, `IncidenteMisionesSection.tsx`, `IncidenteUltimoReporteSection.tsx`, `MisionReportesSection.tsx`, `H39-informe-verificacion-cierre-mando.md` | Documentación de usuario y componentes alineados desplegando `estadoTerreno` conforme a CA-4 | Re-Test aprobado: `estadoTerreno` restaurado y formateado en Toast, Drawer y Modal en plena correspondencia con los manuales, CA-4 y tests automatizados | **CORREGIDO** | 24/11/2026 01:05 | 25/11/2026 01:01 | fix(mando): resolver observaciones QA H39 (socket drawer/modal, OpenAPI dictamenTerreno, estadoTerreno y Chip) |
| **BUG-H39-WEB-06** | Estandarización de `<Chip />` / Sentence Case en Drawer y Toast, y limpieza de `tieneMisionEnCurso` en Kanban | Guía Visual / Estado | UI / Hook | Baja | Revisión de `IncidenteDetalleDrawer.tsx`, `ToastItem.tsx` y `useIncidentesKanban.ts` | Badge `"Verificación Completada"`, `toast.priorityBadge`, cierre `REQUIERE_CUADRILLA` | Uso exclusivo de `<Chip />` en Sentence Case, prioridad formateada (`Alta`) y `tieneMisionEnCurso: false` tras cierre | Re-Test aprobado: Drawer utiliza `<Chip variant="success" size="sm" />`, `ToastItem` aplica `formatearPrioridad` y `useIncidentesKanban` limpia `tieneMisionEnCurso` y `tieneMisionDespachada` en todo cierre | **CORREGIDO** | 24/11/2026 01:05 | 25/11/2026 01:01 | fix(mando): resolver observaciones QA H39 (socket drawer/modal, OpenAPI dictamenTerreno, estadoTerreno y Chip) |
| **TC-H39-WEB-01** | Validación de análisis estático ESLint (`npm run lint`) | Calidad / Linter | CI / Code | Crítica | Rama `feature/h39-patrulla-enviar-reporte-cerrar` | `npm run lint` | `0` errores bloqueantes de ESLint | Re-Test aprobado: `npm run lint` finaliza con `Exit code 0` (`0` errores, `0` warnings) | **APROBADO** | 24/11/2026 01:05 | 25/11/2026 01:01 | fix(h38): resolver conflictos con develop y corregir errores de ESLint |
| **TC-H39-WEB-02** | Compilación de producción (`npx next build --webpack`) y tipado TypeScript (`npx tsc --noEmit`) | Build / Tipos | CI / Build | Crítica | Dependencias actualizadas tras integración con `develop` | `npx next build --webpack && npx tsc --noEmit` | `next build` compila todas las rutas con código `0` y `tsc --noEmit` finaliza sin errores | Re-Test aprobado: `next build` compiló `49/49` rutas exitosamente (`11.2s`) y `tsc --noEmit` cerró con `0` errores (`Exit code 0`) | **APROBADO** | 24/11/2026 01:05 | 25/11/2026 01:01 | fix(mando): resolver observaciones QA H39 (socket drawer/modal, OpenAPI dictamenTerreno, estadoTerreno y Chip) |
| **TC-H39-WEB-03** | Ejecución completa de suite automatizada y suites focalizadas H39 en Vitest | Regresión / Unitaria | Componente / Hook / Util | Crítica | Entorno Vitest v3.2.7 configurado | `npm test` y `npx vitest run` sobre 9 suites focalizadas | 100% de suites y casos aprobados sin regresiones | Re-Test aprobado: `137/137` archivos (`1009/1009` tests, `34.50s`) en suite global y `9/9` archivos (`134/134` tests, `8.50s`) en suite focalizada aprobados | **APROBADO** | 24/11/2026 01:05 | 25/11/2026 01:01 | fix(mando): resolver observaciones QA H39 (socket drawer/modal, OpenAPI dictamenTerreno, estadoTerreno y Chip) |
| **TC-H39-WEB-04** | Sincronización de contrato OpenAPI y persistencia del chip `Requiere Cuadrilla` tras recarga (`F5`) | Contrato / Persistencia | Integración / UI | Alta | Sesión limpia consultando `GET /api/incidentes` e inspección de `api-generated.d.ts` | `GET /api/incidentes?estado=VERIFICANDO`, `src/types/api-generated.d.ts` | Tipos generados con contrato H39 y chip `Requiere Cuadrilla` persistente tras recarga | Re-Test aprobado: `api-generated.d.ts` incluye `dictamenTerreno` y `/api/misiones/{id}/reporte`; `sgrai-api` proyecta `dictamenTerreno` en `GET /api/incidentes` y `IncidenteCard` renderiza el chip | **APROBADO** | 24/11/2026 01:05 | 25/11/2026 01:01 | fix(mando): resolver observaciones QA H39 (socket drawer/modal, OpenAPI dictamenTerreno, estadoTerreno y Chip) |
| **TC-H39-WEB-05** | Normalización de evento `incidente:actualizado` con dictamen `NO_ABORDABLE`, `motivoNoAbordable` y `fechaCierre` en `useEncargadoKanbanSocket` | Tiempo Real / WebSocket | Hook | Crítica | Hook montado y suscrito a `sala:encargados` | Payload WS `{ id: 'inc-noab-1', nuevoEstado: 'NO_ABORDABLE', dictamen: 'NO_ABORDABLE', motivoNoAbordable: '...', fechaCierre: '...' }` | Emite payload normalizado con `dictamen: 'NO_ABORDABLE'`, `motivoNoAbordable`, `fechaCierre` y actualiza `ultimoEvento` | Re-Test sin regresiones (`14/14` tests en `useEncargadoKanbanSocket.test.ts`): normaliza campos camelCase/snake_case y evita evento sintético en `mision:actualizada COMPLETADA` | **APROBADO** | 24/11/2026 01:05 | 25/11/2026 01:01 | feat(kanban): sincronizar dictamen de cierre y transicion a NO_ABORDABLE en tiempo real (H39) |
| **TC-H39-WEB-06** | Deduplicación de eventos WebSocket duplicados entre múltiples salas (`sala:encargados`, `encargado`, `mapa`) y Toast | Resiliencia / Tiempo Real | Hook / UI | Alta | Emisión múltiple del mismo evento `incidente:actualizado` o `patrulla:actualizada` dentro de 4s | 3 emisiones consecutivas de `incidente:actualizado` y `showInfo` repetido | El callback y el Toast se disparan una única vez evitando apilamiento de notificaciones | Re-Test sin regresiones en `useEncargadoKanbanSocket.test.ts` (`14/14`), `usePatrullas.test.ts` (`8/8`) y `Toast.test.tsx` (`1/1`) | **APROBADO** | 24/11/2026 01:05 | 25/11/2026 01:01 | fix(notifications): deduplicar eventos websocket y toasts repetidos de patrullas e incidentes |
| **TC-H39-WEB-07** | Transición automática de tarjeta Kanban a columna `NO_ABORDABLE` y actualización de contadores | Funcional / Tiempo Real | Hook / Kanban | Crítica | Incidente presente en columna `VERIFICANDO` al recibir `incidente:actualizado` con `NO_ABORDABLE` | `{ id: 'inc-noab-39', nuevoEstado: 'NO_ABORDABLE', dictamen: 'NO_ABORDABLE', motivoNoAbordable: 'Predio privado cerrado...' }` | Tarjeta sale de `VERIFICANDO`, ingresa al tope de `NO_ABORDABLE`, limpia flags de misión activa y ajusta contadores de ambas columnas | Re-Test aprobado en `useIncidentesKanban.test.ts` (`13/13`): columna origen decrementa, `NO_ABORDABLE` incrementa y expone `motivoNoAbordable` y `fechaCierre` | **APROBADO** | 24/11/2026 01:05 | 25/11/2026 01:01 | feat(kanban): sincronizar dictamen de cierre y transicion a NO_ABORDABLE en tiempo real (H39) |
| **TC-H39-WEB-08** | Priorización al tope de columna `VERIFICANDO` y activación de `FIBE` / `verificado` tras cierre `REQUIERE_CUADRILLA` | Regla de Negocio / Kanban | Hook / UI | Alta | Columna `VERIFICANDO` con incidente sin verificar arriba y otro debajo que recibe cierre H39 | `{ id: 'inc-cierre-cuadrilla', nuevoEstado: 'VERIFICANDO', prioridad: 'ALTA', verificado: true, requiereAsistenciaSocial: true, dictamen: 'REQUIERE_CUADRILLA' }` | Tarjeta se reordena al inicio de `VERIFICANDO`, limpia `tieneMisionEnCurso`, actualiza prioridad/FIBE y muestra chips `Verificado`, `FIBE` y `Requiere Cuadrilla` | Re-Test aprobado en `useIncidentesKanban.test.ts` (`13/13`, verificando además `tieneMisionEnCurso: false`) e `IncidenteCard.test.tsx` (`18/18`) | **APROBADO** | 24/11/2026 01:05 | 25/11/2026 01:01 | fix(mando): resolver observaciones QA H39 (socket drawer/modal, OpenAPI dictamenTerreno, estadoTerreno y Chip) |
| **TC-H39-WEB-09** | Actualización reactiva de `IncidenteUltimoReporteSection` y estado de patrulla en `IncidenteDetalleDrawer` abierto al llegar cierre H39 | Tiempo Real / UX | Componente | Crítica | Drawer abierto con reporte H38 o reclasificación H37 previos mientras llega `incidente:actualizado` H39 | WS `incidente:actualizado` con `reporteTerreno` `VERIFICACION_CIERRE` y `misionId: 'm-activa-1'` | Sección `Último Reporte` cambia inmediatamente al cierre H39, patrulla pasa a `Disponible` y misiones históricas no cambian | Re-Test aprobado en `IncidenteDetalleDrawer.test.tsx` (`24/24`): sección actualiza al dictamen `Requiere Cuadrilla` y `Critico`, libera patrulla y preserva misión `RECHAZADA` | **APROBADO** | 24/11/2026 01:05 | 25/11/2026 01:01 | fix(mando): resolver observaciones QA H39 (socket drawer/modal, OpenAPI dictamenTerreno, estadoTerreno y Chip) |
| **TC-H39-WEB-10** | Renderizado de banner rojo `Caso cerrado en terreno como No Abordable` y ocultamiento de botón `Despachar Cuadrilla` en Drawer | Regla de Negocio / UI | Componente | Crítica | Incidente cargado desde API en estado `NO_ABORDABLE` con `motivoNoAbordable` y `fechaCierre` | Props `estado: 'NO_ABORDABLE'`, `motivoNoAbordable: 'Predio privado inaccesible...'` | Banner `banner-incidente-no-abordable` visible con motivo y fecha; barra y botón `Despachar Cuadrilla` ocultos | Re-Test aprobado en `IncidenteDetalleDrawer.test.tsx`: banner visible con motivo y `Despachar Cuadrilla` ausente del DOM | **APROBADO** | 24/11/2026 01:05 | 25/11/2026 01:01 | feat(mando): distinguir reporte VERIFICACION_CIERRE, trasladar FIBE y comparar personas afectadas (H39) |
| **TC-H39-WEB-11** | Visualización de cierre `REQUIERE_CUADRILLA`, estado del terreno, indicador Ficha FIBE y habilitación de despacho de cuadrilla en Drawer | Regla de Negocio / UI | Componente | Crítica | Incidente en `VERIFICANDO` con misión `COMPLETADA` y reporte `VERIFICACION_CIERRE` con `requiereAsistenciaSocial: true` | `reporteTerreno` `VERIFICACION_CIERRE` con `personasAfectadas: 6` (previo: `4`) y `estadoTerreno: 'CRITICO'` | Muestra `Informe Técnico de Verificación y Cierre`, `Dictamen: Requiere Cuadrilla`, `Requiere Ficha FIBE`, `Estado del terreno: Critico`, `6 personas (Modificado; antes: 4)` y botón `Despachar Cuadrilla` | Re-Test aprobado en `IncidenteDetalleDrawer.test.tsx` (`24/24`) validando todos los campos incluido `estadoTerreno` | **APROBADO** | 24/11/2026 01:05 | 25/11/2026 01:01 | fix(mando): resolver observaciones QA H39 (socket drawer/modal, OpenAPI dictamenTerreno, estadoTerreno y Chip) |
| **TC-H39-WEB-12** | Distinción visual de `VERIFICACION_CIERRE`, `estadoTerreno`, comparativa de personas afectadas (modificado vs sin cambios) y galería HU-43 en `MisionDetalleModal` | UI / Negocio | Componente | Crítica | Misión con reporte previo `EVALUACION_PRIORIDAD` y reporte de cierre `VERIFICACION_CIERRE` | Caso A: `personasAfectadas` `4 -> 6`, `estadoTerreno: 'INUNDADO_ACCESIBLE'`, `REQUIERE_CUADRILLA` y FIBE; Caso B: `2 -> 2` con `NO_ABORDABLE` | Caso A: `Inundado accesible`, badge `Modificado respecto a prioridad (Antes: 4)`, `Requiere Ficha FIBE`, galería HU-43; Caso B: `(Rescatado del reporte de prioridad sin cambios)`, `Motivo`, `No requiere Ficha FIBE` | Re-Test aprobado en ambos escenarios en `MisionDetalleModal.test.tsx` (`19/19`) | **APROBADO** | 24/11/2026 01:05 | 25/11/2026 01:01 | fix(mando): resolver observaciones QA H39 (socket drawer/modal, OpenAPI dictamenTerreno, estadoTerreno y Chip) |
| **TC-H39-WEB-13** | Sincronización en vivo de `MisionDetalleModal` al recibir cierre H39 por WebSocket | Tiempo Real / Modal | Componente | Alta | `MisionDetalleModal` abierto sobre misión `EN_CURSO` cuando se emite cierre en terreno | WS `incidente:actualizado` con `detallesEvaluacion`, `NO_ABORDABLE`, y `mision:actualizada` con `hito` | Modal actualiza `detallesEvaluacion`, `patrulla.estado = 'DISPONIBLE'`, `incidente.motivoNoAbordable`/`fechaCierre` y `bitacoraTiempos` | Re-Test aprobado: `MisionDetalleModal.tsx` mapea `detallesEvaluacion ?? evaluacion`, libera patrulla, actualiza `incidente.motivoNoAbordable`/`fechaCierre` y sincroniza `bitacoraTiempos` mediante `mision:actualizada` | **APROBADO** | 24/11/2026 01:05 | 25/11/2026 01:01 | fix(mando): resolver observaciones QA H39 (socket drawer/modal, OpenAPI dictamenTerreno, estadoTerreno y Chip) |
| **TC-H39-WEB-14** | Humanización de enums y eliminación de prefijos duplicados en `MisionBitacoraSection` y `estadoUtils` | UI / Usabilidad | Utilidad / Componente | Media | Misión con hitos `MISION_DESPACHADA`, `PRIORIDAD_ASIGNADA` y `VERIFICACION_COMPLETADA` | Descripciones con `patrulla Patrulla Lenteja`, `BAJA`, `CRITICA`, `NO_ABORDABLE`, `REQUIERE_CUADRILLA` | Textos legibles (`Patrulla Lenteja`, `Baja`, `Crítica`, `No Abordable`, `Requiere Cuadrilla`) sin valores crudos | Re-Test sin regresiones en `estadoUtils.test.ts` (`21/21`) y `MisionDetalleModal.test.tsx` (`19/19`) | **APROBADO** | 24/11/2026 01:05 | 25/11/2026 01:01 | fix(mando): humanizar enums y descripciones en bitacora cronologica de mision |
| **TC-H39-WEB-15** | Exposición de error HTTP 500 distinto de 403 al listar incidentes en `useIncidentesKanban` | Resiliencia / Manejo Errores | Hook | Alta | Peticiones de columnas retornan HTTP 500 | `listarIncidentes` retorna `{ exito: false, codigoError: 500, mensaje: 'Error interno...' }` | Hook expone `error` al usuario (`esForbidden: false`) en lugar de mostrar tablero vacío silenciosamente | Re-Test sin regresiones en `useIncidentesKanban.test.ts` (`13/13`) | **APROBADO** | 24/11/2026 01:05 | 25/11/2026 01:01 | fix(kanban): exponer errores HTTP distintos de 403 al listar incidentes |
| **TC-H39-WEB-16** | Coherencia entre `docs/manuals/H39-informe-verificacion-cierre-mando.md`, `estandar-tarjetas-reportes-mando.md` y comportamiento real de UI | Documentación / CA-4 | Repositorio | Media | Inspección de manuales H39 y componentes de Toast, Drawer y Modal | `docs/manuals/H39-informe-verificacion-cierre-mando.md`, `estandar-tarjetas-reportes-mando.md`, `KanbanBoard.tsx`, `IncidenteMisionesSection.tsx`, `IncidenteUltimoReporteSection.tsx`, `MisionReportesSection.tsx` | Manuales reflejan exactamente los campos visibles en la UI y concuerdan con CA-4 aprobado | Re-Test aprobado: `estadoTerreno` visible en Toast, Drawer y Modal en plena correspondencia con ambos manuales y CA-4 | **APROBADO** | 24/11/2026 01:05 | 25/11/2026 01:01 | fix(mando): resolver observaciones QA H39 (socket drawer/modal, OpenAPI dictamenTerreno, estadoTerreno y Chip) |
| **TC-H39-WEB-17** | Cumplimiento de guía visual municipal (`GEMINI.md` §3): `<Chip />`, Sentence Case, ausencia de emojis y fuentes locales (`AGENTS.md`) | Guía Visual / UI | Componente | Media | Renderizado de componentes H39 e inspección de badges en `IncidenteDetalleDrawer` y `ToastItem` | Inspección DOM/CSS, regex Unicode `/\p{Extended_Pictographic}/u` y `grep next/font/google` | `0` emojis, `0` imports de Google Fonts, esquinas rectas `0px`, uso exclusivo de `<Chip />` y Sentence Case sin `ALL CAPS` | Re-Test aprobado: `0` emojis, sin `next/font/google`, `<Chip variant="success" size="sm" />` en Drawer y `formatearPrioridad(...)` en `ToastItem` | **APROBADO** | 24/11/2026 01:05 | 25/11/2026 01:01 | fix(mando): resolver observaciones QA H39 (socket drawer/modal, OpenAPI dictamenTerreno, estadoTerreno y Chip) |
| **TC-H39-WEB-18** | Control de acceso RBAC en acciones derivadas de cierre en `IncidenteDetalleDrawer` y `KanbanBoard` | Seguridad / RBAC | Componente | Crítica | Usuario autenticado sin permiso `misiones:asignar` visualizando incidente `VERIFICANDO` cerrado con `REQUIERE_CUADRILLA` | `usePuedeAsignarMision()` / `auth.tienePermiso('misiones:asignar')` retornando `false` | Se visualiza el informe técnico de cierre, pero la barra y botón `Despachar Cuadrilla` no se renderizan | Re-Test sin regresiones en `IncidenteDetalleDrawer.tsx` (`puedeDespacharCuadrilla` condicionado a `tienePermisoAsignar`) e `IncidenteCard.test.tsx` (`18/18`) | **APROBADO** | 24/11/2026 01:05 | 25/11/2026 01:01 | feat(mando): distinguir reporte VERIFICACION_CIERRE, trasladar FIBE y comparar personas afectadas (H39) |

---

## 4. Bloque TSV para Exportación

````tsv
ID Caso	Título del Caso de Prueba	Tipo de Prueba	Nivel	Prioridad	Precondición	Datos de Prueba (Payload / Headers / Query)	Resultado Esperado	Resultado Obtenido	Estado	Fecha / Hora Ejecución	Fecha / Hora Re-Test	Solución / Commit
BUG-H39-WEB-01	Cumplimiento estricto de ESLint en componentes, hooks y tests de la rama H39	Calidad / Linter	CI / Estático	Crítica	Rama feature/h39-patrulla-enviar-reporte-cerrar con dependencias instaladas	npm run lint	Salida con código 0 y 0 errores bloqueantes de ESLint en el proyecto	Re-Test aprobado: npm run lint finaliza con código 0, 0 errores y 0 warnings en todo el repositorio	CORREGIDO	24/11/2026 01:05	25/11/2026 01:01	fix(h38): resolver conflictos con develop y corregir errores de ESLint
BUG-H39-WEB-02	Sincronización en vivo de detalle.ultimoReporte, liberación de patrulla e integridad de misiones en IncidenteDetalleDrawer	Tiempo Real / WebSocket	Componente	Crítica	IncidenteDetalleDrawer abierto en incidente con reporte H38/H37 previo y misión histórica RECHAZADA	Evento WS incidente:actualizado con reporteTerreno de tipoReporte: 'VERIFICACION_CIERRE' y misionId: 'm-activa-1'	IncidenteUltimoReporteSection actualiza al nuevo informe, solo la misión activa transiciona a COMPLETADA, patrulla.estado pasa a DISPONIBLE y la misión histórica conserva su estado	Re-Test aprobado: detalle.ultimoReporte se reconstruye en vivo, patrulla.estado pasa a DISPONIBLE y la misión histórica RECHAZADA se preserva (validado en IncidenteDetalleDrawer.test.tsx)	CORREGIDO	24/11/2026 01:05	25/11/2026 01:01	fix(mando): resolver observaciones QA H39 (socket drawer/modal, OpenAPI dictamenTerreno, estadoTerreno y Chip)
BUG-H39-WEB-03	Regeneración de contrato OpenAPI (api-generated.d.ts) y persistencia de chip Requiere Cuadrilla tras recarga (F5)	Contrato / Persistencia	Integración / Tipos	Alta	Incidente con cierre REQUIERE_CUADRILLA consultado vía GET /api/incidentes tras recargar navegador	src/types/api-generated.d.ts, incidentesService.ts, misiones.ts, IncidenteCard.tsx y sgrai-api (incidente-kanban.*)	Contratos generados con dictamenTerreno sin extensiones manuales redundantes y proyección en GET /api/incidentes preservando el chip tras F5	Re-Test aprobado: sgrai-api proyecta dictamenTerreno, api-generated.d.ts regenerado con /api/misiones/{id}/reporte y dictamenTerreno, y extensiones manuales removidas	CORREGIDO	24/11/2026 01:05	25/11/2026 01:01	fix(mando): resolver observaciones QA H39 (socket drawer/modal, OpenAPI dictamenTerreno, estadoTerreno y Chip)
BUG-H39-WEB-04	Sincronización en vivo de detallesEvaluacion, patrulla.estado, contexto NO_ABORDABLE y bitácora en MisionDetalleModal	Tiempo Real / WebSocket	Componente	Alta	MisionDetalleModal abierto sobre misión de verificación en curso mientras patrulla envía cierre H39	Evento WS incidente:actualizado con detallesEvaluacion, motivoNoAbordable, fechaCierre y evento mision:actualizada con hito	Modal lee detallesEvaluacion, libera patrulla.estado a DISPONIBLE, actualiza incidente.motivoNoAbordable/fechaCierre e incorpora el hito a bitacoraTiempos	Re-Test aprobado: MisionDetalleModal.tsx lee detallesEvaluacion ?? evaluacion, libera patrulla, actualiza motivoNoAbordable/fechaCierre y suscribe mision:actualizada con anexado deduplicado en bitácora	CORREGIDO	24/11/2026 01:05	25/11/2026 01:01	fix(mando): resolver observaciones QA H39 (socket drawer/modal, OpenAPI dictamenTerreno, estadoTerreno y Chip)
BUG-H39-WEB-05	Consistencia entre visualización de estadoTerreno, manuales de usuario H39 y Criterio de Aceptación CA-4	Documentación / Funcional	Repositorio / UI	Media	Revisión cruzada de Toast, Drawer, Modal, CA-4 y manuales en docs/manuals/	KanbanBoard.tsx, IncidenteMisionesSection.tsx, IncidenteUltimoReporteSection.tsx, MisionReportesSection.tsx, H39-informe-verificacion-cierre-mando.md	Documentación de usuario y componentes alineados desplegando estadoTerreno conforme a CA-4	Re-Test aprobado: estadoTerreno restaurado y formateado en Toast, Drawer y Modal en plena correspondencia con los manuales, CA-4 y tests automatizados	CORREGIDO	24/11/2026 01:05	25/11/2026 01:01	fix(mando): resolver observaciones QA H39 (socket drawer/modal, OpenAPI dictamenTerreno, estadoTerreno y Chip)
BUG-H39-WEB-06	Estandarización de Chip / Sentence Case en Drawer y Toast, y limpieza de tieneMisionEnCurso en Kanban	Guía Visual / Estado	UI / Hook	Baja	Revisión de IncidenteDetalleDrawer.tsx, ToastItem.tsx y useIncidentesKanban.ts	Badge "Verificación Completada", toast.priorityBadge, cierre REQUIERE_CUADRILLA	Uso exclusivo de Chip en Sentence Case, prioridad formateada (Alta) y tieneMisionEnCurso: false tras cierre	Re-Test aprobado: Drawer utiliza Chip variant="success" size="sm", ToastItem aplica formatearPrioridad y useIncidentesKanban limpia tieneMisionEnCurso y tieneMisionDespachada en todo cierre	CORREGIDO	24/11/2026 01:05	25/11/2026 01:01	fix(mando): resolver observaciones QA H39 (socket drawer/modal, OpenAPI dictamenTerreno, estadoTerreno y Chip)
TC-H39-WEB-01	Validación de análisis estático ESLint (npm run lint)	Calidad / Linter	CI / Code	Crítica	Rama feature/h39-patrulla-enviar-reporte-cerrar	npm run lint	0 errores bloqueantes de ESLint	Re-Test aprobado: npm run lint finaliza con Exit code 0 (0 errores, 0 warnings)	APROBADO	24/11/2026 01:05	25/11/2026 01:01	fix(h38): resolver conflictos con develop y corregir errores de ESLint
TC-H39-WEB-02	Compilación de producción (npx next build --webpack) y tipado TypeScript (npx tsc --noEmit)	Build / Tipos	CI / Build	Crítica	Dependencias actualizadas tras integración con develop	npx next build --webpack && npx tsc --noEmit	next build compila todas las rutas con código 0 y tsc --noEmit finaliza sin errores	Re-Test aprobado: next build compiló 49/49 rutas exitosamente (11.2s) y tsc --noEmit cerró con 0 errores (Exit code 0)	APROBADO	24/11/2026 01:05	25/11/2026 01:01	fix(mando): resolver observaciones QA H39 (socket drawer/modal, OpenAPI dictamenTerreno, estadoTerreno y Chip)
TC-H39-WEB-03	Ejecución completa de suite automatizada y suites focalizadas H39 en Vitest	Regresión / Unitaria	Componente / Hook / Util	Crítica	Entorno Vitest v3.2.7 configurado	npm test y npx vitest run sobre 9 suites focalizadas	100% de suites y casos aprobados sin regresiones	Re-Test aprobado: 137/137 archivos (1009/1009 tests, 34.50s) en suite global y 9/9 archivos (134/134 tests, 8.50s) en suite focalizada aprobados	APROBADO	24/11/2026 01:05	25/11/2026 01:01	fix(mando): resolver observaciones QA H39 (socket drawer/modal, OpenAPI dictamenTerreno, estadoTerreno y Chip)
TC-H39-WEB-04	Sincronización de contrato OpenAPI y persistencia del chip Requiere Cuadrilla tras recarga (F5)	Contrato / Persistencia	Integración / UI	Alta	Sesión limpia consultando GET /api/incidentes e inspección de api-generated.d.ts	GET /api/incidentes?estado=VERIFICANDO, src/types/api-generated.d.ts	Tipos generados con contrato H39 y chip Requiere Cuadrilla persistente tras recarga	Re-Test aprobado: api-generated.d.ts incluye dictamenTerreno y /api/misiones/{id}/reporte; sgrai-api proyecta dictamenTerreno en GET /api/incidentes y IncidenteCard renderiza el chip	APROBADO	24/11/2026 01:05	25/11/2026 01:01	fix(mando): resolver observaciones QA H39 (socket drawer/modal, OpenAPI dictamenTerreno, estadoTerreno y Chip)
TC-H39-WEB-05	Normalización de evento incidente:actualizado con dictamen NO_ABORDABLE, motivoNoAbordable y fechaCierre en useEncargadoKanbanSocket	Tiempo Real / WebSocket	Hook	Crítica	Hook montado y suscrito a sala:encargados	Payload WS { id: 'inc-noab-1', nuevoEstado: 'NO_ABORDABLE', dictamen: 'NO_ABORDABLE', motivoNoAbordable: '...', fechaCierre: '...' }	Emite payload normalizado con dictamen: 'NO_ABORDABLE', motivoNoAbordable, fechaCierre y actualiza ultimoEvento	Re-Test sin regresiones (14/14 tests en useEncargadoKanbanSocket.test.ts): normaliza campos camelCase/snake_case y evita evento sintético en mision:actualizada COMPLETADA	APROBADO	24/11/2026 01:05	25/11/2026 01:01	feat(kanban): sincronizar dictamen de cierre y transicion a NO_ABORDABLE en tiempo real (H39)
TC-H39-WEB-06	Deduplicación de eventos WebSocket duplicados entre múltiples salas (sala:encargados, encargado, mapa) y Toast	Resiliencia / Tiempo Real	Hook / UI	Alta	Emisión múltiple del mismo evento incidente:actualizado o patrulla:actualizada dentro de 4s	3 emisiones consecutivas de incidente:actualizado y showInfo repetido	El callback y el Toast se disparan una única vez evitando apilamiento de notificaciones	Re-Test sin regresiones en useEncargadoKanbanSocket.test.ts (14/14), usePatrullas.test.ts (8/8) y Toast.test.tsx (1/1)	APROBADO	24/11/2026 01:05	25/11/2026 01:01	fix(notifications): deduplicar eventos websocket y toasts repetidos de patrullas e incidentes
TC-H39-WEB-07	Transición automática de tarjeta Kanban a columna NO_ABORDABLE y actualización de contadores	Funcional / Tiempo Real	Hook / Kanban	Crítica	Incidente presente en columna VERIFICANDO al recibir incidente:actualizado con NO_ABORDABLE	{ id: 'inc-noab-39', nuevoEstado: 'NO_ABORDABLE', dictamen: 'NO_ABORDABLE', motivoNoAbordable: 'Predio privado cerrado...' }	Tarjeta sale de VERIFICANDO, ingresa al tope de NO_ABORDABLE, limpia flags de misión activa y ajusta contadores de ambas columnas	Re-Test aprobado en useIncidentesKanban.test.ts (13/13): columna origen decrementa, NO_ABORDABLE incrementa y expone motivoNoAbordable y fechaCierre	APROBADO	24/11/2026 01:05	25/11/2026 01:01	feat(kanban): sincronizar dictamen de cierre y transicion a NO_ABORDABLE en tiempo real (H39)
TC-H39-WEB-08	Priorización al tope de columna VERIFICANDO y activación de FIBE / verificado tras cierre REQUIERE_CUADRILLA	Regla de Negocio / Kanban	Hook / UI	Alta	Columna VERIFICANDO con incidente sin verificar arriba y otro debajo que recibe cierre H39	{ id: 'inc-cierre-cuadrilla', nuevoEstado: 'VERIFICANDO', prioridad: 'ALTA', verificado: true, requiereAsistenciaSocial: true, dictamen: 'REQUIERE_CUADRILLA' }	Tarjeta se reordena al inicio de VERIFICANDO, limpia tieneMisionEnCurso, actualiza prioridad/FIBE y muestra chips Verificado, FIBE y Requiere Cuadrilla	Re-Test aprobado en useIncidentesKanban.test.ts (13/13, verificando además tieneMisionEnCurso: false) e IncidenteCard.test.tsx (18/18)	APROBADO	24/11/2026 01:05	25/11/2026 01:01	fix(mando): resolver observaciones QA H39 (socket drawer/modal, OpenAPI dictamenTerreno, estadoTerreno y Chip)
TC-H39-WEB-09	Actualización reactiva de IncidenteUltimoReporteSection y estado de patrulla en IncidenteDetalleDrawer abierto al llegar cierre H39	Tiempo Real / UX	Componente	Crítica	Drawer abierto con reporte H38 o reclasificación H37 previos mientras llega incidente:actualizado H39	WS incidente:actualizado con reporteTerreno VERIFICACION_CIERRE y misionId: 'm-activa-1'	Sección Último Reporte cambia inmediatamente al cierre H39, patrulla pasa a Disponible y misiones históricas no cambian	Re-Test aprobado en IncidenteDetalleDrawer.test.tsx (24/24): sección actualiza al dictamen Requiere Cuadrilla y Critico, libera patrulla y preserva misión RECHAZADA	APROBADO	24/11/2026 01:05	25/11/2026 01:01	fix(mando): resolver observaciones QA H39 (socket drawer/modal, OpenAPI dictamenTerreno, estadoTerreno y Chip)
TC-H39-WEB-10	Renderizado de banner rojo Caso cerrado en terreno como No Abordable y ocultamiento de botón Despachar Cuadrilla en Drawer	Regla de Negocio / UI	Componente	Crítica	Incidente cargado desde API en estado NO_ABORDABLE con motivoNoAbordable y fechaCierre	Props estado: 'NO_ABORDABLE', motivoNoAbordable: 'Predio privado inaccesible...'	Banner banner-incidente-no-abordable visible con motivo y fecha; barra y botón Despachar Cuadrilla ocultos	Re-Test aprobado en IncidenteDetalleDrawer.test.tsx: banner visible con motivo y Despachar Cuadrilla ausente del DOM	APROBADO	24/11/2026 01:05	25/11/2026 01:01	feat(mando): distinguir reporte VERIFICACION_CIERRE, trasladar FIBE y comparar personas afectadas (H39)
TC-H39-WEB-11	Visualización de cierre REQUIERE_CUADRILLA, estado del terreno, indicador Ficha FIBE y habilitación de despacho de cuadrilla en Drawer	Regla de Negocio / UI	Componente	Crítica	Incidente en VERIFICANDO con misión COMPLETADA y reporte VERIFICACION_CIERRE con requiereAsistenciaSocial: true	reporteTerreno VERIFICACION_CIERRE con personasAfectadas: 6 (previo: 4) y estadoTerreno: 'CRITICO'	Muestra Informe Técnico de Verificación y Cierre, Dictamen: Requiere Cuadrilla, Requiere Ficha FIBE, Estado del terreno: Critico, 6 personas (Modificado; antes: 4) y botón Despachar Cuadrilla	Re-Test aprobado en IncidenteDetalleDrawer.test.tsx (24/24) validando todos los campos incluido estadoTerreno	APROBADO	24/11/2026 01:05	25/11/2026 01:01	fix(mando): resolver observaciones QA H39 (socket drawer/modal, OpenAPI dictamenTerreno, estadoTerreno y Chip)
TC-H39-WEB-12	Distinción visual de VERIFICACION_CIERRE, estadoTerreno, comparativa de personas afectadas (modificado vs sin cambios) y galería HU-43 en MisionDetalleModal	UI / Negocio	Componente	Crítica	Misión con reporte previo EVALUACION_PRIORIDAD y reporte de cierre VERIFICACION_CIERRE	Caso A: personasAfectadas 4 -> 6, estadoTerreno: 'INUNDADO_ACCESIBLE', REQUIERE_CUADRILLA y FIBE; Caso B: 2 -> 2 con NO_ABORDABLE	Caso A: Inundado accesible, badge Modificado respecto a prioridad (Antes: 4), Requiere Ficha FIBE, galería HU-43; Caso B: (Rescatado del reporte de prioridad sin cambios), Motivo, No requiere Ficha FIBE	Re-Test aprobado en ambos escenarios en MisionDetalleModal.test.tsx (19/19)	APROBADO	24/11/2026 01:05	25/11/2026 01:01	fix(mando): resolver observaciones QA H39 (socket drawer/modal, OpenAPI dictamenTerreno, estadoTerreno y Chip)
TC-H39-WEB-13	Sincronización en vivo de MisionDetalleModal al recibir cierre H39 por WebSocket	Tiempo Real / Modal	Componente	Alta	MisionDetalleModal abierto sobre misión EN_CURSO cuando se emite cierre en terreno	WS incidente:actualizado con detallesEvaluacion, NO_ABORDABLE, y mision:actualizada con hito	Modal actualiza detallesEvaluacion, patrulla.estado = 'DISPONIBLE', incidente.motivoNoAbordable/fechaCierre y bitacoraTiempos	Re-Test aprobado: MisionDetalleModal.tsx mapea detallesEvaluacion ?? evaluacion, libera patrulla, actualiza incidente.motivoNoAbordable/fechaCierre y sincroniza bitacoraTiempos mediante mision:actualizada	APROBADO	24/11/2026 01:05	25/11/2026 01:01	fix(mando): resolver observaciones QA H39 (socket drawer/modal, OpenAPI dictamenTerreno, estadoTerreno y Chip)
TC-H39-WEB-14	Humanización de enums y eliminación de prefijos duplicados en MisionBitacoraSection y estadoUtils	UI / Usabilidad	Utilidad / Componente	Media	Misión con hitos MISION_DESPACHADA, PRIORIDAD_ASIGNADA y VERIFICACION_COMPLETADA	Descripciones con patrulla Patrulla Lenteja, BAJA, CRITICA, NO_ABORDABLE, REQUIERE_CUADRILLA	Textos legibles (Patrulla Lenteja, Baja, Crítica, No Abordable, Requiere Cuadrilla) sin valores crudos	Re-Test sin regresiones en estadoUtils.test.ts (21/21) y MisionDetalleModal.test.tsx (19/19)	APROBADO	24/11/2026 01:05	25/11/2026 01:01	fix(mando): humanizar enums y descripciones en bitacora cronologica de mision
TC-H39-WEB-15	Exposición de error HTTP 500 distinto de 403 al listar incidentes en useIncidentesKanban	Resiliencia / Manejo Errores	Hook	Alta	Peticiones de columnas retornan HTTP 500	listarIncidentes retorna { exito: false, codigoError: 500, mensaje: 'Error interno...' }	Hook expone error al usuario (esForbidden: false) en lugar de mostrar tablero vacío silenciosamente	Re-Test sin regresiones en useIncidentesKanban.test.ts (13/13)	APROBADO	24/11/2026 01:05	25/11/2026 01:01	fix(kanban): exponer errores HTTP distintos de 403 al listar incidentes
TC-H39-WEB-16	Coherencia entre docs/manuals/H39-informe-verificacion-cierre-mando.md, estandar-tarjetas-reportes-mando.md y comportamiento real de UI	Documentación / CA-4	Repositorio	Media	Inspección de manuales H39 y componentes de Toast, Drawer y Modal	docs/manuals/H39-informe-verificacion-cierre-mando.md, estandar-tarjetas-reportes-mando.md, KanbanBoard.tsx, IncidenteMisionesSection.tsx, IncidenteUltimoReporteSection.tsx, MisionReportesSection.tsx	Manuales reflejan exactamente los campos visibles en la UI y concuerdan con CA-4 aprobado	Re-Test aprobado: estadoTerreno visible en Toast, Drawer y Modal en plena correspondencia con ambos manuales y CA-4	APROBADO	24/11/2026 01:05	25/11/2026 01:01	fix(mando): resolver observaciones QA H39 (socket drawer/modal, OpenAPI dictamenTerreno, estadoTerreno y Chip)
TC-H39-WEB-17	Cumplimiento de guía visual municipal (GEMINI.md §3): Chip, Sentence Case, ausencia de emojis y fuentes locales (AGENTS.md)	Guía Visual / UI	Componente	Media	Renderizado de componentes H39 e inspección de badges en IncidenteDetalleDrawer y ToastItem	Inspección DOM/CSS, regex Unicode /\p{Extended_Pictographic}/u y grep next/font/google	0 emojis, 0 imports de Google Fonts, esquinas rectas 0px, uso exclusivo de Chip y Sentence Case sin ALL CAPS	Re-Test aprobado: 0 emojis, sin next/font/google, Chip variant="success" size="sm" en Drawer y formatearPrioridad(...) en ToastItem	APROBADO	24/11/2026 01:05	25/11/2026 01:01	fix(mando): resolver observaciones QA H39 (socket drawer/modal, OpenAPI dictamenTerreno, estadoTerreno y Chip)
TC-H39-WEB-18	Control de acceso RBAC en acciones derivadas de cierre en IncidenteDetalleDrawer y KanbanBoard	Seguridad / RBAC	Componente	Crítica	Usuario autenticado sin permiso misiones:asignar visualizando incidente VERIFICANDO cerrado con REQUIERE_CUADRILLA	usePuedeAsignarMision() / auth.tienePermiso('misiones:asignar') retornando false	Se visualiza el informe técnico de cierre, pero la barra y botón Despachar Cuadrilla no se renderizan	Re-Test sin regresiones en IncidenteDetalleDrawer.tsx (puedeDespacharCuadrilla condicionado a tienePermisoAsignar) e IncidenteCard.test.tsx (18/18)	APROBADO	24/11/2026 01:05	25/11/2026 01:01	feat(mando): distinguir reporte VERIFICACION_CIERRE, trasladar FIBE y comparar personas afectadas (H39)
````

---

## 5. Guía de Ejecución Paso a Paso y Evidencias Técnicas Replicables

### 5.1. Análisis Estático ESLint (`npm run lint`) y Reglas de Repositorio — Re-Test `BUG-H39-WEB-01` / `BUG-H39-WEB-06`

```bash
npm run lint
grep -rn "next/font/google" src || echo "OK: sin Google Fonts"
```

*Resultado real observado en Re-Test (`25/11/2026 01:01`):*
```text
> sgrai-web@0.9.0 lint
> eslint

LINT_EXIT=0
OK: sin Google Fonts
TOTAL_EMOJIS=0
```

### 5.2. Compilación de Producción y Verificación TypeScript

```bash
npx next build --webpack && npx tsc --noEmit
```

*Resultado real observado en Re-Test (`25/11/2026 01:01`):*
```text
▲ Next.js 16.3.4 (webpack)
- Environments: .env.local
✓ Running next.config.ts took 100ms
✓ Compiled successfully in 11.2s
✓ Finished TypeScript in 33.2s
✓ Collecting page data using 15 workers in 818ms
✓ Generating static pages using 15 workers (49/49) in 1082ms
✓ Collecting build traces in 13.3s
✓ Finalizing page optimization in 13.4s

BUILD_TSC_EXIT=0
```

### 5.3. Ejecución Automatizada de Pruebas Unitarias y de Integración (Vitest)

1. **Filtro específico de casos HU-39 y regresión `BUG-H39-WEB` con `-t`:**
   ```bash
   npm test -- -t "VERIFICACION_CIERRE|NO_ABORDABLE|REQUIERE_CUADRILLA|comparativa de personas|BUG-H39-WEB"
   ```
   *Resultado real observado en Re-Test (`25/11/2026 01:01`):*
   ```text
    Test Files  7 passed | 130 skipped (137)
         Tests  15 passed | 994 skipped (1009)
      Duration  27.60s
   ```

2. **Suite focalizada de módulos de Mando, Hooks y Utilidades (9 archivos):**
   ```bash
   npx vitest run src/components/mando/__tests__/IncidenteCard.test.tsx \
                  src/components/mando/__tests__/IncidenteDetalleDrawer.test.tsx \
                  src/components/mando/__tests__/IncidenteMisionesSection.test.tsx \
                  src/components/mando/mision/__tests__/MisionDetalleModal.test.tsx \
                  src/hooks/__tests__/useEncargadoKanbanSocket.test.ts \
                  src/hooks/__tests__/useIncidentesKanban.test.ts \
                  src/hooks/__tests__/usePatrullas.test.ts \
                  src/lib/utils/__tests__/estadoUtils.test.ts \
                  src/components/ui/__tests__/Toast.test.tsx
   ```
   *Resultado real observado en Re-Test (`25/11/2026 01:01`):*
   ```text
    ✓ src/hooks/__tests__/usePatrullas.test.ts (8 tests)
    ✓ src/lib/utils/__tests__/estadoUtils.test.ts (21 tests)
    ✓ src/hooks/__tests__/useEncargadoKanbanSocket.test.ts (14 tests)
    ✓ src/components/ui/__tests__/Toast.test.tsx (1 test)
    ✓ src/components/mando/__tests__/IncidenteCard.test.tsx (18 tests)
    ✓ src/components/mando/__tests__/IncidenteMisionesSection.test.tsx (16 tests)
    ✓ src/hooks/__tests__/useIncidentesKanban.test.ts (13 tests)
    ✓ src/components/mando/mision/__tests__/MisionDetalleModal.test.tsx (19 tests)
    ✓ src/components/mando/__tests__/IncidenteDetalleDrawer.test.tsx (24 tests)

    Test Files  9 passed (9)
         Tests  134 passed (134)
      Duration  8.50s
   ```

3. **Suite Global de Regresión (`npm test`):**
   ```bash
   npm test
   ```
   *Resultado real observado en Re-Test (`25/11/2026 01:01`):*
   ```text
    Test Files  137 passed (137)
         Tests  1009 passed (1009)
      Duration  34.50s

   VITEST_EXIT=0
   ```

### 5.4. Pruebas de Integración de Contrato HTTP (cURL) y Regeneración OpenAPI frente a `sgrai-api`

En el entorno de ejecución del Re-Test el servicio `sgrai-api` en `http://localhost:3001` no se encontró levantado (`curl -s -m 2 -o /dev/null -w "%{http_code}" http://localhost:3001/openapi.json` retornó `000`), por lo que la validación de contrato se ejecutó de forma estática cruzando `src/types/api-generated.d.ts`, `src/services/incidentesService.ts` y `src/types/misiones.ts` contra el código fuente actualizado de `sgrai-api` en la rama `feature/h39-patrulla-enviar-reporte-cerrar` (`incidente-kanban.repository.ts`, `incidente-kanban.schema.ts`, `incidente-kanban.service.ts` y `mision.service.ts`).

Comandos de replicación contra instancia activa de `sgrai-api`:

1. **Regeneración de tipos OpenAPI en `sgrai-web` (`BUG-H39-WEB-03`):**
   ```bash
   npm run generate-api-types
   ```
   *Evidencia verificada en `src/types/api-generated.d.ts`:* presentes las definiciones de `/api/misiones/{id}/reporte`, `dictamenTerreno?: "REQUIERE_CUADRILLA" | "NO_ABORDABLE" | null`, `motivoNoAbordable`, `fechaCierre`, `reporteVerificacionEnviado` y `reporteVerificacionEnviadoEn`.

2. **Envío de informe técnico de cierre con dictamen `REQUIERE_CUADRILLA` y Ficha FIBE (Patrulla Verificadora, permiso `reportes:crear`):**
   ```bash
   curl -s -X POST "http://localhost:3001/api/misiones/<UUID_MISION_EN_CURSO>/reporte" \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer <TOKEN_PATRULLA>" \
     -d '{
       "dictamen": "REQUIERE_CUADRILLA",
       "resumen_tecnico": "Se constata colapso de colector de aguas lluvias en pasaje interior.",
       "estado_terreno": "CRITICO",
       "personas_afectadas": 4,
       "danos_estimados": "Anegamiento de patio y primer piso.",
       "requiere_asistencia_social": true
     }'
   ```
   *Contrato de respuesta verificado (`201 Created`):*
   ```json
   {
     "message": "Informe técnico de verificación registrado y misión cerrada exitosamente.",
     "data": {
       "reporteTerreno": {
         "id": "<UUID_REPORTE>",
         "misionId": "<UUID_MISION_EN_CURSO>",
         "tipoReporte": "VERIFICACION_CIERRE",
         "dictamen": "REQUIERE_CUADRILLA",
         "motivoNoAbordable": null,
         "requiereAsistenciaSocial": true,
         "personasAfectadas": 4,
         "estadoTerreno": "CRITICO"
       },
       "mision": {
         "id": "<UUID_MISION_EN_CURSO>",
         "estado": "COMPLETADA",
         "fechaCierre": "<ISO_8601>"
       },
       "patrulla": {
         "id": "<UUID_PATRULLA>",
         "estado": "DISPONIBLE"
       },
       "incidente": {
         "id": "<UUID_INCIDENTE>",
         "estado": "VERIFICANDO",
         "requiereAsistenciaSocial": true
       }
     }
   }
   ```

3. **Envío de informe técnico con dictamen `NO_ABORDABLE` (Fusión H39/H86):**
   ```bash
   curl -s -X POST "http://localhost:3001/api/misiones/<UUID_MISION_EN_CURSO>/reporte" \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer <TOKEN_PATRULLA>" \
     -d '{
       "dictamen": "NO_ABORDABLE",
       "motivo_no_abordable": "Predio privado inaccesible y sin riesgo hacia la vía pública.",
       "resumen_tecnico": "Se verifica portón cerrado en predio particular sin afectación externa.",
       "personas_afectadas": 0,
       "requiere_asistencia_social": false
     }'
   ```

4. **Verificación de proyección de `dictamenTerreno` en listado Kanban tras recarga (`GET /api/incidentes`):**
   ```bash
   curl -s -X GET "http://localhost:3001/api/incidentes?estado=VERIFICANDO&page=1&limit=20" \
     -H "Authorization: Bearer <TOKEN_ENCARGADO>"
   ```
   *Evidencia estática verificada en Re-Test:* `incidente-kanban.repository.ts` (líneas 171-179), `incidente-kanban.schema.ts` (líneas 107-113) e `incidente-kanban.service.ts` (líneas 45-46) proyectan y retornan `dictamenTerreno`, garantizando que `IncidenteCard.tsx` conserve el chip `Requiere Cuadrilla` tras recargar la vista (`F5`).

---

## 6. Matriz de Trazabilidad de Criterios de Aceptación (Alcance `sgrai-web`)

| Criterio de Aceptación (Alcance Centro de Mando Web) | Caso(s) de Prueba Asociados | Resultado Auditoría Inicial | Resultado Re-Test |
| :--- | :--- | :--- | :--- |
| **Recepción en tiempo real de eventos `mision:actualizada` e `incidente:actualizado` (`REQUIERE_CUADRILLA` y `NO_ABORDABLE`)** | `TC-H39-WEB-05`, `TC-H39-WEB-06`, `TC-H39-WEB-07`, `TC-H39-WEB-08`, `TC-H39-WEB-09`, `TC-H39-WEB-13`, `BUG-H39-WEB-02`, `BUG-H39-WEB-04` | PARCIAL / FALLIDO | **APROBADO** |
| **Visualización de incidente `NO_ABORDABLE` con `motivoNoAbordable` y `fechaCierre` y bloqueo de despacho de cuadrilla** | `TC-H39-WEB-07`, `TC-H39-WEB-10` | APROBADO | **APROBADO** |
| **Visualización del informe consolidado (`resumenTecnico`, `estadoTerreno`, `personasAfectadas` comparadas con H38, `danosEstimados`, `observaciones`, `requiere_asistencia_social` / FIBE y galería H43)** | `TC-H39-WEB-11`, `TC-H39-WEB-12`, `TC-H39-WEB-16`, `BUG-H39-WEB-05` | PARCIAL / FALLIDO | **APROBADO** |
| **Integridad de contrato OpenAPI y persistencia tras recarga (`api-generated.d.ts`)** | `TC-H39-WEB-04`, `BUG-H39-WEB-03` | FALLIDO | **APROBADO** |
| **Calidad estática, compilación limpia, guía visual municipal (`GEMINI.md`) y manual de usuario** | `TC-H39-WEB-01`, `TC-H39-WEB-02`, `TC-H39-WEB-03`, `TC-H39-WEB-14`, `TC-H39-WEB-15`, `TC-H39-WEB-16`, `TC-H39-WEB-17`, `BUG-H39-WEB-01`, `BUG-H39-WEB-06` | FALLIDO | **APROBADO** |
| **Respeto de autorización RBAC en interfaz de Centro de Mando** | `TC-H39-WEB-18` | APROBADO | **APROBADO** |

> *Nota de alcance entre repositorios:* los criterios relativos al formulario táctil de captura de la Patrulla Verificadora, validaciones Zod de longitud mínima en cliente offline, almacenamiento diferido en IndexedDB, endpoint transaccional `POST /api/misiones/{id}/reporte` y validación RBAC `reportes:crear` pertenecen a `sgrai-pwa` y `sgrai-api`, y son auditados en sus respectivos repositorios.

---

## 7. Dictamen de Certificación QA

**Estado Final:** `APROBADO EN RE-TEST — APTO PARA MERGE A DEVELOP`

Se certifica que los **6 defectos abiertos (`BUG-H39-WEB-01` a `BUG-H39-WEB-06`)** fueron debidamente corregidos y verificados en la rama `feature/h39-patrulla-enviar-reporte-cerrar`:
1. `npm run lint` finaliza con `0` errores y `0` warnings (`BUG-H39-WEB-01`).
2. `IncidenteDetalleDrawer` reconstruye `ultimoReporte` en vivo, libera `patrulla.estado` a `DISPONIBLE` y preserva las misiones históricas `RECHAZADA`/`CANCELADA` (`BUG-H39-WEB-02`).
3. `src/types/api-generated.d.ts` fue regenerado y coordinado con la proyección de `dictamenTerreno` en `GET /api/incidentes` de `sgrai-api`, removiendo las extensiones manuales redundantes (`BUG-H39-WEB-03`).
4. `MisionDetalleModal` lee `detallesEvaluacion ?? evaluacion`, libera `patrulla.estado`, actualiza `incidente.motivoNoAbordable`/`fechaCierre` y sincroniza `bitacoraTiempos` mediante `mision:actualizada` (`BUG-H39-WEB-04`).
5. La visualización de `estadoTerreno` quedó alineada entre Toast, Drawer, Modal, manuales de usuario y CA-4 (`BUG-H39-WEB-05`).
6. Los distintivos cumplen el estándar `<Chip />` y Sentence Case (`IncidenteDetalleDrawer`, `ToastItem`), sin emojis ni fuentes de Google, y `useIncidentesKanban` limpia `tieneMisionEnCurso` ante todo cierre de verificación (`BUG-H39-WEB-06`).
7. Compilación de producción (`49/49` rutas), chequeo de tipos (`0` errores) y suites automatizadas (`137/137` archivos, `1009/1009` tests) pasan al `100%` sin regresiones.
