# Informe de Auditoría Técnica, Re-Test de Cierre y Matriz de Casos de Prueba QA — HU-37: Categorizar o Corregir Tipología del Incidente en Terreno (Tablero Kanban / Centro de Mando)

**Proyecto:** SGRAI — Sistema de Gestión de Recursos para Atención de Incidentes (Dirección de Gestión de Riesgos de Desastres, Municipalidad de Valdivia)  
**Repositorio:** `sgrai-web`  
**Rama Evaluada:** `feature/h37-patrulla-categorizar-incidente`  
**Desarrollador Asignado:** `zetastormy`  
**Historia de Usuario:** HU-37 — *Como Patrulla verificadora Quiero categorizar o corregir la tipología del incidente tras la evaluación presencial en terreno Para asegurar un registro técnico fidedigno de la naturaleza real de la emergencia, corrigiendo clasificaciones inexactas hechas por informantes ciudadanos.*  
**Issue / PR Referenciado:** `#39` (rama destino: `develop`)  
**Fecha de Ejecución QA:** `17/11/2026 00:15`  
**Fecha de Re-Test:** `18/11/2026 21:47` (Ronda 1: `18/11/2026 14:47` / Ronda 2 - Cierre: `18/11/2026 21:47`)  
**Estado de Certificación QA:** `APROBADO EN RE-TEST DE CIERRE — APTO PARA INTEGRACIÓN A DEVELOP (0 DEFECTOS ABIERTOS)`

---

## 1. Resumen Ejecutivo

Tras los últimos commits de corrección e integración aplicados por el desarrollador en la rama `feature/h37-patrulla-categorizar-incidente` (`chore(merge): sincronizar origin/develop y resolver conflicto en incidentesService (BUG-H37-WEB-03)` y `fix(mando): unificar distintivo verificado en IncidenteCard y ampliar tests de reclasificacion (BUG-H37-WEB-05, BUG-H37-WEB-06)`), se ejecutó la segunda ronda de Re-Test de cierre sobre `sgrai-web`.

La auditoría confirma la **resolución total de los 6 defectos registrados (`BUG-H37-WEB-01` a `BUG-H37-WEB-06`)** y la recuperación exitosa del caso `TC-H37-WEB-04`, alcanzando **100% de aprobación (`21/21` escenarios cerrados y aprobados)**:
- Integración limpia con `origin/develop` (`0` commits faltantes y `0` conflictos en `git merge-tree`), recuperando la cobertura unitaria de `incidentesService.test.ts` (`9/9`), `misionesService.test.ts` (`13/13`), los fixes Bearer JWT en servicios, el retorno de limpieza en `KanbanBoard.tsx:113` y el saneamiento completo de advertencias ESLint globales (`0 errors, 0 warnings`).
- Unificación definitiva del distintivo `"Verificado"` en `src/components/mando/IncidenteCard.tsx` (`líneas 95–119`, con `data-testid="badge-verificado"`), validada con aserciones de unicidad (`getAllByText('Verificado').toHaveLength(1)`).
- Cobertura automatizada ampliada en `src/components/mando/mision/__tests__/MisionDetalleModal.test.tsx` (`líneas 518–595`) verificando selección del hito `TIPOLOGIA_RECLASIFICADA` más reciente y justificaciones multilínea.

| Métrica de Calidad | Inicial (17/11) | Re-Test 1 (18/11 14:47) | Re-Test Cierre (18/11 21:47) | Umbral Requerido | Estado Final |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Total de Casos en Matriz** | **20** (`5` Bugs + `15` TCs) | **21** (`6` Bugs + `15` TCs) | **21** (`6` Bugs + `15` TCs) | Cobertura integral HU-37 en `sgrai-web` | Evaluado |
| **Cerrados / Aprobados (`CORREGIDO` + `APROBADO`)** | **15 / 20** (`75.0%`) | **18 / 21** (`85.7%`) | **21 / 21** (`100.0%`) | 100% para certificación | **Cumple** |
| **Defectos Abiertos (`ABIERTO`) / Regresión (`FALLIDO`)** | **5** (`1` Crítica, `2` Altas, `2` Medias) | **2 `ABIERTO` + 1 `FALLIDO`** | **0** | 0 defectos abiertos ni regresiones | **Cumple** |
| **Suite Completa Vitest (`npm test`)** | **807 / 807** (`123` archivos) | **876 / 876** (`128` archivos) | **883 / 883** (`128` archivos, `26.79s`) | 100% passing | **Cumple** |
| **Suites HU-37 / Mando + Servicios (Vitest)** | **65 / 65** (`8` archivos) | **92 / 92** (`8` archivos) | **93 / 93** (`8` HU-37, `3.54s`) + **22 / 22** (`2` servicios, `1.24s`) | 100% passing | **Cumple** |
| **Verificación de Tipos (`npx next typegen && npx tsc --noEmit`)** | **0 errores** | **0 errores** | **0 errores** | 0 errores | **Cumple** |
| **Build de Producción (`npm run build` Webpack)** | **Exit code 0** (`47` rutas) | **Exit code 0** (`47` rutas) | **Exit code 0** (`47` rutas, `8.8s` + TS `16.8s`) | Compilación limpia | **Cumple** |
| **Análisis Estático ESLint (`npm run lint`)** | **4 errores, 12 warnings** | **0 errores, 11 warnings** | **0 errores, 0 warnings** (`Exit code 0`) | 0 errores, 0 warnings | **Cumple** |
| **Integración Git con `origin/develop` (`git merge-tree`)** | **13 conflictos** | **1 conflicto + 5 commits atrás** | **0 conflictos, 0 commits atrás** | Fusión limpia sin regresiones | **Cumple** |

---

## 2. Registro Técnico de Defectos (Estado Final de Cierre)

### 2.1. `BUG-H37-WEB-01` (Severidad: Crítica — `CORREGIDO`) — Falso positivo de verificación (`verificado: true` / `reclasificadoEnTerreno: true`) y doble incremento de `totalMisiones`
- **Archivos verificados:** `src/hooks/useIncidentesKanban.ts` (`líneas 246–277, 433–467`), `src/components/mando/IncidenteDetalleDrawer.tsx` (`líneas 274–290`), `src/hooks/__tests__/useIncidentesKanban.test.ts` (`7/7 passed`).
- **Verificación de cierre (`18/11/2026 21:47`):**
  1. `handleIncidenteActualizado` determina `esEventoReclasificacion` solo ante `justificacion` no vacía, `tipoIncidenteId` o cambio real de `tipoAfectacion`, preservando `verificado` y `reclasificadoEnTerreno` previos ante transiciones sin reclasificación.
  2. Limpia `tieneMisionDespachada: false`, evita doble conteo de `totalMisiones` cuando `!yaContabaMision` no aplica y deduplica columnas en `ejecutarConsulta` actualizando `paginacionColumna`.
  3. Re-ejecutado el test específico `BUG-H37-WEB-01: NO debe marcar verificado ni reclasificadoEnTerreno ni duplicar totalMisiones ante incidente:actualizado sin reclasificación` con resultado exitoso (`68ms`).

### 2.2. `BUG-H37-WEB-02` (Severidad: Alta — `CORREGIDO`) — Desincronización de contrato OpenAPI, extensión manual en `incidentesService.ts`, `fetch` directo en KPIs y filtro estático en `KanbanFiltros.tsx`
- **Archivos verificados:** `src/types/api-generated.d.ts`, `src/services/incidentesService.ts`, `src/services/avisosService.ts` (`línea 79`), `src/components/mando/KanbanFiltros.tsx` (`líneas 66–82`), `src/services/__tests__/incidentesService.test.ts` (`9/9 passed`).
- **Verificación de cierre (`18/11/2026 21:47`):**
  1. `api-generated.d.ts` regenerado con `PATCH /api/incidentes/{id}/tipologia`, `GET /api/incidentes/tipos?catalogo=true`, `verificado: boolean`, `reclasificadoEnTerreno`, `justificacionReclasificacion?: string | null`, `tieneMisionDespachada?: boolean`, `tieneMisionEnCurso?: boolean` y `trazabilidadNotificacion`.
  2. `incidentesService.ts` elimina intersecciones manuales de tipos y migra `obtenerKpis` a `apiClient.GET('/api/incidentes/kpis', ...)` con pruebas unitarias restauradas en `incidentesService.test.ts` (`9/9 passed`).
  3. `KanbanFiltros.tsx` carga dinámicamente las categorías oficiales vía `obtenerTiposAfectacion()` (`GET /api/incidentes/tipos`), soportando tanto strings como objetos catálogo en `avisosService.ts:79`.

### 2.3. `BUG-H37-WEB-03` (Severidad: Alta — `CORREGIDO`) — Desincronización con `origin/develop`, conflicto en `incidentesService.ts` y omisión de commits de seguridad/lint
- **Archivos verificados:** `src/services/incidentesService.ts`, `src/services/__tests__/incidentesService.test.ts` (`9/9`), `src/services/__tests__/misionesService.test.ts` (`13/13`), `src/services/misionesService.ts`, `src/services/puntosCriticosService.ts`, `src/services/avisosService.ts`, `src/components/mando/KanbanBoard.tsx` (`línea 113`), `docs/qa/REGISTRO_DEFECTOS_INTEGRACION_DEVELOP.md`.
- **Verificación de cierre (`18/11/2026 21:47`):**
  1. El commit `chore(merge): sincronizar origin/develop y resolver conflicto en incidentesService (BUG-H37-WEB-03)` integró los `5` commits pendientes de `origin/develop`, dejando `git log HEAD..origin/develop --oneline` vacío (`0` commits faltantes) y `git merge-tree --write-tree origin/develop HEAD` en árbol limpio (`0` conflictos).
  2. Se restauraron íntegramente las suites `incidentesService.test.ts` (`9 tests`) y `misionesService.test.ts` (`13 tests`, validación Bearer JWT), el retorno de limpieza `return cargarCuadrillas()` en `KanbanBoard.tsx:113`, el type narrowing seguro en `misionesService.ts:431` y el saneamiento de las `11` advertencias globales de ESLint (`npm run lint`: `0 errors, 0 warnings`).

### 2.4. `BUG-H37-WEB-04` (Severidad: Media — `CORREGIDO`) — Errores bloqueantes ESLint y advertencias de dependencias
- **Archivos verificados:** `src/components/mando/IncidentesKpiCards.tsx`, `src/hooks/__tests__/useIncidentesKanban.test.ts`, `src/hooks/useIncidentesKanban.ts` y totalidad del repositorio bajo `npm run lint`.
- **Verificación de cierre (`18/11/2026 21:47`):** Eliminados `setIsMounted` en efecto, los `any` en `socketCallbacks` y `optionsObj` mediante `onMisionRechazadaRef`. Tras la sincronización con `origin/develop`, `npm run lint` finaliza con `Exit code: 0`, **`0` errores y `0` advertencias en todo el proyecto**.

### 2.5. `BUG-H37-WEB-05` (Severidad: Media — `CORREGIDO`) — Hito `TIPOLOGIA_RECLASIFICADA` más antiguo, regex multilínea y fuga de estado previo en `IncidenteDetalleDrawer`
- **Archivos verificados:** `src/components/mando/mision/MisionReportesSection.tsx` (`líneas 54–63`), `src/components/mando/mision/__tests__/MisionDetalleModal.test.tsx` (`líneas 518–595`), `src/components/mando/IncidenteDetalleDrawer.tsx` (`líneas 81, 99, 104, 118, 522`), `src/components/mando/__tests__/IncidenteDetalleDrawer.test.tsx`.
- **Verificación de cierre (`18/11/2026 21:47`):**
  1. Validado `[...bitacora].reverse().find(...)` y `/Justificación:\s*([\s\S]+)$/i` junto al nuevo test `BUG-H37-WEB-05: selecciona el hito TIPOLOGIA_RECLASIFICADA más reciente y extrae justificaciones multilínea con saltos de línea` en `MisionDetalleModal.test.tsx` (`13/13 passed`, `121ms`).
  2. Validada la limpieza `setDetalle(null)` y `key={detalle.id}` con el test `BUG-H37-WEB-05: limpia el detalle previo cuando se cambia a otro incidente cuya consulta retorna error 403` en `IncidenteDetalleDrawer.test.tsx` (`16/16 passed`, `145ms`).

### 2.6. `BUG-H37-WEB-06` (Severidad: Media — `CORREGIDO`) — Regresión visual: doble distintivo `"Verificado"` en `IncidenteCard` cuando `incidente.verificado` es `true`
- **Archivos verificados:** `src/components/mando/IncidenteCard.tsx` (`líneas 66–119`), `src/components/mando/__tests__/IncidenteCard.test.tsx` (`líneas 167–250`).
- **Verificación de cierre (`18/11/2026 21:47`):**
  1. El commit `fix(mando): unificar distintivo verificado en IncidenteCard y ampliar tests de reclasificacion (BUG-H37-WEB-05, BUG-H37-WEB-06)` suprimió el bloque duplicado en `cardTopRow` (`IncidenteCard.tsx:66–74`) y consolidó un único badge en `cardMetaTags` (`líneas 95–119`) bajo `(estaVerificado || Boolean(incidente.reclasificadoEnTerreno))` con `data-testid="badge-verificado"`, bordes rectos (`0px`) y tooltip prioritario de justificación.
  2. Validado dinámicamente mediante el test `debe exhibir un único distintivo "Verificado" cuando verificado es true al cargar desde el servidor (con o sin reclasificadoEnTerreno) (BUG-H37-WEB-06)` (`14/14 passed`), corroborando `screen.getAllByText('Verificado').toHaveLength(1)` en ambos escenarios (`reclasificadoEnTerreno: false` y `reclasificadoEnTerreno: true`).

---

## 3. Matriz Consolidada de Casos de Prueba (13 Columnas)

| ID Caso | Título del Caso de Prueba | Tipo de Prueba | Nivel | Prioridad | Precondición | Datos de Prueba (Payload / Headers / Query) | Resultado Esperado | Resultado Obtenido | Estado | Fecha / Hora Ejecución | Fecha / Hora Re-Test | Solución / Commit |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **BUG-H37-WEB-01** | Falso positivo de verificación (`verificado: true` / `reclasificadoEnTerreno: true`) ante evento `incidente:actualizado` sin reclasificación y doble incremento de `totalMisiones` | Reactividad / Regla ICS (CA-6) | Hook / Componente | Crítica | Incidente en `REPORTADO` (`totalMisiones: 1`, `tieneMisionDespachada: true`, `verificado: false`) que transita a `VERIFICANDO` tras aceptación de misión. | Evento Socket `incidente:actualizado` `{ datos: { id: 'inc-1', codigo: 'INC-01', nuevoEstado: 'VERIFICANDO', prioridad: 'MEDIA' } }` sin `tipoAfectacion` ni `justificacion` | El incidente pasa a `VERIFICANDO` manteniendo `verificado: false`, `reclasificadoEnTerreno: false` y `totalMisiones: 1`; `IncidenteDetalleDrawer` no muestra el bloque de reclasificación. | Re-Test cierre 18/11: `useIncidentesKanban.ts` e `IncidenteDetalleDrawer.tsx` validan `esEventoReclasificacion`, preservan valores previos y deduplican con `paginacionColumna`; test `BUG-H37-WEB-01` aprobado (`68 ms`). | **CORREGIDO** | 17/11/2026 00:15 | 18/11/2026 21:47 | fix(h37): sincronizar develop y resolver hallazgos de QA (BUG-H37-WEB-01..05) |
| **BUG-H37-WEB-02** | Desincronización de contrato OpenAPI (`api-generated.d.ts`), extensión manual sin `null` en `incidentesService.ts`, `fetch` directo en KPIs y filtro estático desalineado en `KanbanFiltros.tsx` | Contrato OpenAPI / Funcional (CA-2) | Tipos / Servicio / UI | Alta | Inspección de `src/types/api-generated.d.ts`, `src/services/incidentesService.ts` y `src/components/mando/KanbanFiltros.tsx`. | Contrato `GET /api/incidentes`, `GET /api/incidentes/{id}`, `PATCH /api/incidentes/{id}/tipologia`, `GET /api/incidentes/kpis` y `GET /api/incidentes/tipos?catalogo=true` | Tipos generados íntegramente desde OpenAPI sin intersecciones manuales, `obtenerKpis` sobre `apiClient` y `KanbanFiltros` poblado desde `GET /api/incidentes/tipos`. | Re-Test cierre 18/11: `api-generated.d.ts` regenerado con rutas/campos HU-37, `obtenerKpis` sobre `apiClient` con tests restaurados (`9/9 passed`) y `KanbanFiltros.tsx` consulta `obtenerTiposAfectacion()`. | **CORREGIDO** | 17/11/2026 00:15 | 18/11/2026 21:47 | fix(h37): sincronizar develop y resolver hallazgos de QA (BUG-H37-WEB-01..05) |
| **BUG-H37-WEB-03** | Desincronización respecto a `origin/develop`, conflicto en `src/services/incidentesService.ts` y pérdida de cobertura/limpieza post-merge (`HU-21`, `HU-22`, `HU-35`, `HU-80`) | Integración Git / Regresión | Repositorio | Alta | Rama `feature/h37-patrulla-categorizar-incidente` comparada contra `origin/develop`. | `git merge-tree --write-tree origin/develop HEAD`, `git log HEAD..origin/develop --oneline` y suites de servicios | Fusión limpia sin conflictos (`0` commits detrás de `origin/develop`), conservación íntegra de `incidentesService.test.ts`, `misionesService.test.ts`, `KanbanBoard.tsx:113` y `0` warnings ESLint. | Re-Test cierre 18/11: `git log HEAD..origin/develop` vacío (`0` commits faltantes), `git merge-tree` sin conflictos, `incidentesService.test.ts` (`9/9`) y `misionesService.test.ts` (`13/13`) passing, `npm run lint` (`0` errors, `0` warnings). | **CORREGIDO** | 17/11/2026 00:15 | 18/11/2026 21:47 | chore(merge): sincronizar origin/develop y resolver conflicto en incidentesService (BUG-H37-WEB-03) |
| **BUG-H37-WEB-04** | Errores bloqueantes en análisis estático ESLint (`4` errores) y advertencia `react-hooks/exhaustive-deps` en `useIncidentesKanban.ts` | Calidad de Código / CI | Estático / Hook | Media | Ejecución de linter institucional sobre el repositorio completo. | Comando `npm run lint` | `0` errores bloqueantes y `0` advertencias en ESLint tras la integración de fixes HU-37 y `origin/develop`. | Re-Test cierre 18/11: eliminados `setIsMounted`, `any` en test y `optionsObj` con `onMisionRechazadaRef`, más saneamiento post-merge; `npm run lint` finaliza con exit code `0` (`0` errores, `0` advertencias). | **CORREGIDO** | 17/11/2026 00:15 | 18/11/2026 21:47 | fix(h37): sincronizar develop y resolver hallazgos de QA (BUG-H37-WEB-01..05) |
| **BUG-H37-WEB-05** | Selección del hito `TIPOLOGIA_RECLASIFICADA` más antiguo, fallo regex en justificación multilínea en `MisionReportesSection.tsx` y fuga de estado previo en `IncidenteDetalleDrawer.tsx` | Borde / UI / Estado (CA-5) | Componente | Media | Misión con 2 reclasificaciones y justificación con `\n`; y apertura secuencial de incidente `A` seguido de error `403` en `B`. | `bitacora` ascendente con 2 hitos `TIPOLOGIA_RECLASIFICADA` y `\n` en `MisionDetalleModal.test.tsx`; cambio `A -> B` con respuesta `403` en `IncidenteDetalleDrawer.test.tsx` | `MisionReportesSection` muestra el último hito extrayendo texto multilínea; `IncidenteDetalleDrawer` limpia `detalle` al cerrar o fallar y reinicia sección con `key`. | Re-Test cierre 18/11: verificados ambos casos por pruebas unitarias dedicadas `BUG-H37-WEB-05` en `MisionDetalleModal.test.tsx` (`121 ms`) e `IncidenteDetalleDrawer.test.tsx` (`145 ms`). | **CORREGIDO** | 17/11/2026 00:15 | 18/11/2026 21:47 | fix(mando): unificar distintivo verificado en IncidenteCard y ampliar tests de reclasificacion (BUG-H37-WEB-05, BUG-H37-WEB-06) |
| **BUG-H37-WEB-06** | Regresión visual por doble renderizado de etiqueta `"Verificado"` en `IncidenteCard` cuando `incidente.verificado` es `true` | Regresión Visual / UI (CA-6) | Componente | Media | Tarjeta `IncidenteCard` hidratada desde API o actualizada tras verificación (`verificado: true`). | Props `incidente` con `{ verificado: true, reclasificadoEnTerreno: false }` y `{ verificado: true, reclasificadoEnTerreno: true }` | Renderizado único del distintivo `"Verificado"` (`getAllByText('Verificado')` de longitud `1`) con `data-testid="badge-verificado"` y tooltip contextual prioritario. | Re-Test cierre 18/11: eliminado bloque duplicado de `cardTopRow` en `IncidenteCard.tsx` y unificado en líneas `95–119`; test `BUG-H37-WEB-06` valida unicidad en ambos estados (`68 ms`). | **CORREGIDO** | 18/11/2026 14:47 | 18/11/2026 21:47 | fix(mando): unificar distintivo verificado en IncidenteCard y ampliar tests de reclasificacion (BUG-H37-WEB-05, BUG-H37-WEB-06) |
| **TC-H37-WEB-01** | Suscripción a salas WebSocket y normalización de payload `incidente:actualizado` con `tipoIncidenteId`, `tipoAfectacion` y `justificacion` en `useEncargadoKanbanSocket` | Tiempo Real / WebSocket (CA-6) | Unitario / Hook | Crítica | Montaje de `useEncargadoKanbanSocket` con cliente Socket.io mockeado en Vitest. | Evento `incidente:actualizado` con `{ id: '5000...-0001', codigo: 'INC-2026-001', nuevoEstado: 'VERIFICANDO', prioridad: 'ALTA', tipoIncidenteId: '4000...-0001', tipoAfectacion: 'Inundación', justificacion: 'Tras evaluación...' }` | Normaliza el payload conservando los campos de reclasificación, invoca `onIncidenteActualizado` y actualiza `ultimoEvento` con mensaje amigable en español. | Re-Test cierre 18/11: `useEncargadoKanbanSocket.test.ts` aprueba los `7` tests (`7/7 passed`), verificando normalización y texto `'Tipología reclasificada: INC-2026-001 a Inundación (Prioridad: Alta)'`. | **APROBADO** | 17/11/2026 00:15 | 18/11/2026 21:47 | feat(kanban): actualizar tipología, prioridad y justificación reactivamente vía websocket (#39) |
| **TC-H37-WEB-02** | Actualización reactiva en memoria de tipología, prioridad y justificación en la tarjeta del tablero Kanban ante evento `incidente:actualizado` | Reactividad UI (CA-6) | Integración / Hook | Crítica | Tablero Kanban cargado con incidente en `VERIFICANDO` tipificado inicialmente como `'Anegamiento menor'` y prioridad `'BAJA'`. | Callback `onIncidenteActualizado` con `tipoAfectacion: 'Inundación'`, `prioridad: 'ALTA'`, `justificacion: 'Tras evaluación presencial...'` | La tarjeta en `columnas.VERIFICANDO` actualiza al instante `tipoAfectacion`, `prioridad`, `reclasificadoEnTerreno: true` y `justificacionReclasificacion`. | Re-Test cierre 18/11: `useIncidentesKanban.test.ts` verifica la mutación inmutable y actualización reactiva inmediata en memoria (`7/7 passed`, `71 ms` caso H37). | **APROBADO** | 17/11/2026 00:15 | 18/11/2026 21:47 | feat(kanban): actualizar tipología, prioridad y justificación reactivamente vía websocket (#39) |
| **TC-H37-WEB-03** | Renderizado del distintivo `"Verificado"` con ícono `CheckCircle2` y tooltip con justificación en `IncidenteCard` ante `reclasificadoEnTerreno: true` | Funcional / UI (CA-6) | Componente | Alta | Tarjeta `IncidenteCard` actualizada en vivo con `reclasificadoEnTerreno: true` y `justificacionReclasificacion`. | Props `incidente={{ ...mockIncidente, tipoAfectacion: 'Inundación', prioridad: 'ALTA', reclasificadoEnTerreno: true, justificacionReclasificacion: 'Desborde...' }}` | Muestra la nueva tipología `'Inundación'`, prioridad legible `'Alta'` y chip `'Verificado'` único con `title` conteniendo la justificación presencial. | Re-Test cierre 18/11: `IncidenteCard.test.tsx` valida `'Inundación'`, `'Alta'`, unicidad de `'Verificado'` y el contenido del tooltip (`62 ms`). | **APROBADO** | 17/11/2026 00:15 | 18/11/2026 21:47 | feat(mando): estilizar discretamente verificacion, registrar reclasificacion en bitacora e informes y eliminar enums (HU-37) |
| **TC-H37-WEB-04** | Persistencia del chip `"Verificado"` único en `IncidenteCard` cuando `verificado: true` proviene desde el servidor al paginar o refrescar | Funcional / Persistencia | Componente | Alta | Tarjeta `IncidenteCard` hidratada desde `GET /api/incidentes` tras paginación o recarga (`verificado: true`, con `reclasificadoEnTerreno` en `false` y `true`). | Props `incidente` con `verificado: true, reclasificadoEnTerreno: false` y `verificado: true, reclasificadoEnTerreno: true` | Se exhibe exactamente un chip `"Verificado"` visible (`badge-verificado`) en la tarjeta sin duplicación tras refrescar o paginar el tablero. | Re-Test cierre 18/11: tras el fix de `BUG-H37-WEB-06` en `IncidenteCard.tsx`, el test verifica `getAllByText('Verificado').toHaveLength(1)` y `badge-verificado` en ambos estados (`68 ms`). | **APROBADO** | 17/11/2026 00:15 | 18/11/2026 21:47 | fix(mando): unificar distintivo verificado en IncidenteCard y ampliar tests de reclasificacion (BUG-H37-WEB-05, BUG-H37-WEB-06) |
| **TC-H37-WEB-05** | Despliegue de franja informativa en vivo en `KanbanBoard` ante reclasificación presencial | Funcional / UX (CA-6) | Componente | Media | `KanbanBoard` montado con `ultimoEvento` no nulo proveniente de `useIncidentesKanban`. | `ultimoEvento = 'Tipología reclasificada: INC-2026-001 a Inundación (Prioridad: Alta)'` | La franja superior exhibe el ícono `Zap` y el texto `"Actualización en vivo: Tipología reclasificada: INC-2026-001 a Inundación (Prioridad: Alta)"`. | Re-Test cierre 18/11: verificado en `KanbanBoard.tsx` (`líneas 304–321`) y `useEncargadoKanbanSocket.ts` (`líneas 199–202`). | **APROBADO** | 17/11/2026 00:15 | 18/11/2026 21:47 | feat(kanban): actualizar tipología, prioridad y justificación reactivamente vía websocket (#39) |
| **TC-H37-WEB-06** | Visualización del bloque `"Reclasificación Técnica en Terreno"` en `IncidenteResumenSection` dentro de `IncidenteDetalleDrawer` | Funcional / UI (CA-5 / CA-6) | Componente | Alta | `IncidenteDetalleDrawer` cargado con incidente que posee `reclasificadoEnTerreno: true` y `justificacionReclasificacion`. | Respuesta mock de `obtenerDetalleIncidente` con `tipoAfectacion: 'Inundación Mayor'`, `prioridad: 'CRITICA'`, `justificacionReclasificacion: 'Desborde de río...'` | Se despliega `bloque-reclasificacion-terreno` con tipología constatada y justificación de la patrulla junto a los badges `'Estado: En atención'` y `'Prioridad: Crítica'`. | Re-Test cierre 18/11: `IncidenteDetalleDrawer.test.tsx` valida el bloque `bloque-reclasificacion-terreno` (`16/16 passed`, `224 ms` caso H37). | **APROBADO** | 17/11/2026 00:15 | 18/11/2026 21:47 | feat(ui): reflejar reclasificación en terreno en tarjeta kanban y drawer de detalle |
| **TC-H37-WEB-07** | Sincronización en vivo de `IncidenteDetalleDrawer` al recibir `incidente:actualizado` con reclasificación mientras el panel permanece abierto | Tiempo Real / WebSocket (CA-6) | Componente | Alta | `IncidenteDetalleDrawer` abierto mostrando el `incidenteId` afectado al momento de recibirse la reclasificación desde terreno. | Evento Socket `incidente:actualizado` `{ datos: { id: incidenteId, tipoIncidenteId, tipoAfectacion, prioridad, nuevoEstado, justificacion } }` | El estado interno `detalle` actualiza `tipoAfectacion`, `prioridad`, `estado`, `tipoIncidenteId`, `reclasificadoEnTerreno` y `justificacionReclasificacion` sin cerrar el panel. | Re-Test cierre 18/11: verificado en `IncidenteDetalleDrawer.tsx` (`líneas 250–298`) con guarda `esEventoReclasificacion`. | **APROBADO** | 17/11/2026 00:15 | 18/11/2026 21:47 | feat(ui): reflejar reclasificación en terreno en tarjeta kanban y drawer de detalle |
| **TC-H37-WEB-08** | Eliminación de enums crudos mediante utilidades `formatearEstado`, `formatearPrioridad`, `formatearHitoBitacora`, `formatearTipoMision` y `obtenerChipEstadoMision` | Calidad UX / Unitario | Utilidad | Media | Invocación de formateadores institucionales en `src/lib/utils/estadoUtils.ts`. | Entradas `'VERIFICANDO'`, `'CRITICA'`, `'TIPOLOGIA_RECLASIFICADA'`, `'VERIFICACION'`, `'EN_CURSO'`, `null`, `''` | Retorna `'En verificación'`, `'Crítica'`, `'Tipología reclasificada en terreno'`, `'Verificación en terreno'`, chip `'En curso'` y fallbacks seguros. | Re-Test cierre 18/11: `estadoUtils.test.ts` aprueba los `12` tests unitarios (`12/12 passed`, `7 ms`). | **APROBADO** | 17/11/2026 00:15 | 18/11/2026 21:47 | feat(utils): incorporar formateadores amigables de estados, prioridades e hitos operativos |
| **TC-H37-WEB-09** | Visualización del hito `TIPOLOGIA_RECLASIFICADA` como `"Tipología reclasificada en terreno"` en bitácora y sincronización de título en `MisionDetalleHeader` | Funcional / UI (CA-5) | Componente | Alta | `MisionDetalleModal` cargado con misión `VERIFICACION` cuyo historial incluye el hito `TIPOLOGIA_RECLASIFICADA`. | `bitacoraTiempos: [{ hito: 'TIPOLOGIA_RECLASIFICADA', descripcion: 'Tipología reclasificada en terreno a: Corte de agua potable. Justificación: ...' }]` | La cabecera muestra `'Verificación: Corte de agua potable - INC-592395-562'` con chips legibles (`'Verificación en terreno'`, `'Media'`) y la bitácora traduce el hito sin enums. | Re-Test cierre 18/11: `MisionDetalleModal.test.tsx` valida el formateo amigable del hito, tipo, estado y prioridad (`13/13 passed`, `163 ms`). | **APROBADO** | 17/11/2026 00:15 | 18/11/2026 21:47 | feat(mando): estilizar discretamente verificacion, registrar reclasificacion en bitacora e informes y eliminar enums (HU-37) |
| **TC-H37-WEB-10** | Renderizado e interacción accesible (colapsar/desplegar) del informe técnico `"Evaluación en Terreno Realizada"` en `MisionReportesSection` | Funcional / A11y (CA-5) | Componente | Media | Misión con hito `TIPOLOGIA_RECLASIFICADA` abierto en `MisionDetalleModal`. | `patrulla: { nombre: 'papappap', lider: { nombre: 'Cristóbal Felipe Veas Huequemán' } }`, `incidente.tipoAfectacion: 'Corte de agua potable'` | Tarjeta `reporte-verificacion-reclasificacion` inicia desplegada (`aria-expanded="true"`), extrae la justificación y alterna su visibilidad al hacer clic. | Re-Test cierre 18/11: `MisionDetalleModal.test.tsx` valida el contenido técnico de la tarjeta y la conmutación `aria-expanded="true"` ↔ `"false"` (`13/13 passed`). | **APROBADO** | 17/11/2026 00:15 | 18/11/2026 21:47 | feat(mando): homogeneizar bitacora, hacer reportes desplegables y agrupar misiones rechazadas en incidente |
| **TC-H37-WEB-11** | Priorización de misiones activas y agrupación en acordeón colapsado de misiones rechazadas en `IncidenteMisionesSection` | Funcional / UI | Componente | Media | Incidente con misiones activas (`EN_CURSO`) y misiones rechazadas (`RECHAZADA`) en `IncidenteMisionesSection`. | `misiones={[misionRechazada1, misionRechazada2, misionEnCurso]}` | Ordena la misión en curso primero, agrupa los 2 rechazos en un acordeón inicialmente colapsado (`aria-expanded="false"`) y los despliega al hacer clic. | Re-Test cierre 18/11: `IncidenteMisionesSection.test.tsx` aprueba los `15` escenarios consolidados (`15/15 passed`, `153 ms` caso acordeón). | **APROBADO** | 17/11/2026 00:15 | 18/11/2026 21:47 | feat(mando): homogeneizar bitacora, hacer reportes desplegables y agrupar misiones rechazadas en incidente |
| **TC-H37-WEB-12** | Control de botón `"Confirmación Pendiente"` en `REPORTADO` (`tieneMisionDespachada: true`) y saneamiento de `tieneMisionEnCurso: true` hacia `VERIFICANDO` | Regla Operativa | Hook / Componente | Alta | Tarjeta en `REPORTADO` con misión despachada pendiente o con misión ya en curso proveniente de API. | `tieneMisionDespachada: true` en `IncidenteCard`; `tieneMisionEnCurso: true` en `useIncidentesKanban` | En `IncidenteCard`, reemplaza `"Asignar Patrulla"` por `"Confirmación Pendiente"` deshabilitado; en el hook, reubica el incidente con `tieneMisionEnCurso: true` en `VERIFICANDO`. | Re-Test cierre 18/11: verificado en `IncidenteCard.test.tsx` (`14/14 passed`) y `useIncidentesKanban.test.ts` (`7/7 passed`). | **APROBADO** | 17/11/2026 00:15 | 18/11/2026 21:47 | fix(mando): ubicar incidentes en curso en verificacion, bloquear asignacion duplicada y resolver hydration mismatch |
| **TC-H37-WEB-13** | Manejo de evento `mision:rechazada` con deduplicación temporal, reseteo de `tieneMisionDespachada` y retorno en `REPORTADO` | Tiempo Real / WebSocket | Hook / UI | Alta | Incidente en `REPORTADO` con `tieneMisionDespachada: true` al recibirse `mision:rechazada` vía Socket.io. | Payload `mision:rechazada` `{ misionId: 'mis-rechazada-1', codigo: 'MIS-2026-0099', motivo: 'Patrulla sin vehículo...', incidenteId: 'inc-h69-2' }` | `useIncidentesKanban` restablece `tieneMisionDespachada: false` permitiendo reasignar e invoca `onMisionRechazada` (Toast de advertencia en `KanbanBoard`). | Re-Test cierre 18/11: verificado en `useIncidentesKanban.test.ts`, `KanbanBoard.tsx` (`líneas 68–95`) y `useEncargadoKanbanSocket.ts`. | **APROBADO** | 17/11/2026 00:15 | 18/11/2026 21:47 | feat(kanban): sincronizar estados de despacho y rechazo manteniendo incidentes en REPORTADO hasta confirmacion (H69) |
| **TC-H37-WEB-14** | Generación de tipos de rutas Next.js (`next typegen`), chequeo estático TypeScript (`tsc --noEmit`) y build de producción (`npm run build`) | Compilación / Build | Sistema | Crítica | Ejecución en rama `feature/h37-patrulla-categorizar-incidente` sincronizada con `origin/develop`. | `npx next typegen && npx tsc --noEmit && npm run build` | `0` errores TypeScript en `src/` y `.next/types`, y generación completa de artefactos de producción en `next build`. | Re-Test cierre 18/11: `next typegen` exitoso, `tsc --noEmit` exit code `0` y `npm run build` (Webpack) compila `47` rutas en `8.8 s` (TS `16.8 s`, páginas estáticas `47/47` en `1409 ms`). | **APROBADO** | 17/11/2026 00:15 | 18/11/2026 21:47 | chore(merge): sincronizar origin/develop y resolver conflicto en incidentesService (BUG-H37-WEB-03) |
| **TC-H37-WEB-15** | Cumplimiento de guía visual municipal (`GEMINI.md § 3`: bordes `0px`, paleta oficial, iconografía `lucide-react` sin emojis) y manual `H37-actualizacion-tipologia-kanban.md` | Estándar / Documentación | UI / Docs | Media | Revisión de los últimos commits en `src/` y `docs/manuals/H37-actualizacion-tipologia-kanban.md`. | Inspección de `borderRadius`, tokens CSS, íconos `lucide-react` y secciones del manual H37 | Cero emojis, esquinas rectas `0px`, uso de tokens `--color-primary-teal` / `--color-info-bg` / `--color-bg-light` y manual completo para Encargado. | Re-Test cierre 18/11: `IncidenteCard.tsx` (`líneas 95–119`) y vistas de mando cumplen esquinas `0px`, iconografía `lucide-react` sin emojis y manual publicado. | **APROBADO** | 17/11/2026 00:15 | 18/11/2026 21:47 | docs(manuals): documentar reclasificación presencial en tablero kanban (HU-37) |

---

## 4. Bloque TSV

````tsv
ID Caso	Título del Caso de Prueba	Tipo de Prueba	Nivel	Prioridad	Precondición	Datos de Prueba (Payload / Headers / Query)	Resultado Esperado	Resultado Obtenido	Estado	Fecha / Hora Ejecución	Fecha / Hora Re-Test	Solución / Commit
BUG-H37-WEB-01	Falso positivo de verificación (verificado: true / reclasificadoEnTerreno: true) ante evento incidente:actualizado sin reclasificación y doble incremento de totalMisiones	Reactividad / Regla ICS (CA-6)	Hook / Componente	Crítica	Incidente en REPORTADO (totalMisiones: 1, tieneMisionDespachada: true, verificado: false) que transita a VERIFICANDO tras aceptación de misión.	Evento Socket incidente:actualizado { datos: { id: 'inc-1', codigo: 'INC-01', nuevoEstado: 'VERIFICANDO', prioridad: 'MEDIA' } } sin tipoAfectacion ni justificacion	El incidente pasa a VERIFICANDO manteniendo verificado: false, reclasificadoEnTerreno: false y totalMisiones: 1; IncidenteDetalleDrawer no muestra el bloque de reclasificación.	Re-Test cierre 18/11: useIncidentesKanban.ts e IncidenteDetalleDrawer.tsx validan esEventoReclasificacion, preservan valores previos y deduplican con paginacionColumna; test BUG-H37-WEB-01 aprobado (68 ms).	CORREGIDO	17/11/2026 00:15	18/11/2026 21:47	fix(h37): sincronizar develop y resolver hallazgos de QA (BUG-H37-WEB-01..05)
BUG-H37-WEB-02	Desincronización de contrato OpenAPI (api-generated.d.ts), extensión manual sin null en incidentesService.ts, fetch directo en KPIs y filtro estático desalineado en KanbanFiltros.tsx	Contrato OpenAPI / Funcional (CA-2)	Tipos / Servicio / UI	Alta	Inspección de src/types/api-generated.d.ts, src/services/incidentesService.ts y src/components/mando/KanbanFiltros.tsx.	Contrato GET /api/incidentes, GET /api/incidentes/{id}, PATCH /api/incidentes/{id}/tipologia, GET /api/incidentes/kpis y GET /api/incidentes/tipos?catalogo=true	Tipos generados íntegramente desde OpenAPI sin intersecciones manuales, obtenerKpis sobre apiClient y KanbanFiltros poblado desde GET /api/incidentes/tipos.	Re-Test cierre 18/11: api-generated.d.ts regenerado con rutas/campos HU-37, obtenerKpis sobre apiClient con tests restaurados (9/9 passed) y KanbanFiltros.tsx consulta obtenerTiposAfectacion().	CORREGIDO	17/11/2026 00:15	18/11/2026 21:47	fix(h37): sincronizar develop y resolver hallazgos de QA (BUG-H37-WEB-01..05)
BUG-H37-WEB-03	Desincronización respecto a origin/develop, conflicto en src/services/incidentesService.ts y pérdida de cobertura/limpieza post-merge (HU-21, HU-22, HU-35, HU-80)	Integración Git / Regresión	Repositorio	Alta	Rama feature/h37-patrulla-categorizar-incidente comparada contra origin/develop.	git merge-tree --write-tree origin/develop HEAD, git log HEAD..origin/develop --oneline y suites de servicios	Fusión limpia sin conflictos (0 commits detrás de origin/develop), conservación íntegra de incidentesService.test.ts, misionesService.test.ts, KanbanBoard.tsx:113 y 0 warnings ESLint.	Re-Test cierre 18/11: git log HEAD..origin/develop vacío (0 commits faltantes), git merge-tree sin conflictos, incidentesService.test.ts (9/9) y misionesService.test.ts (13/13) passing, npm run lint (0 errors, 0 warnings).	CORREGIDO	17/11/2026 00:15	18/11/2026 21:47	chore(merge): sincronizar origin/develop y resolver conflicto en incidentesService (BUG-H37-WEB-03)
BUG-H37-WEB-04	Errores bloqueantes en análisis estático ESLint (4 errores) y advertencia react-hooks/exhaustive-deps en useIncidentesKanban.ts	Calidad de Código / CI	Estático / Hook	Media	Ejecución de linter institucional sobre el repositorio completo.	Comando npm run lint	0 errores bloqueantes y 0 advertencias en ESLint tras la integración de fixes HU-37 y origin/develop.	Re-Test cierre 18/11: eliminados setIsMounted, any en test y optionsObj con onMisionRechazadaRef, más saneamiento post-merge; npm run lint finaliza con exit code 0 (0 errores, 0 advertencias).	CORREGIDO	17/11/2026 00:15	18/11/2026 21:47	fix(h37): sincronizar develop y resolver hallazgos de QA (BUG-H37-WEB-01..05)
BUG-H37-WEB-05	Selección del hito TIPOLOGIA_RECLASIFICADA más antiguo, fallo regex en justificación multilínea en MisionReportesSection.tsx y fuga de estado previo en IncidenteDetalleDrawer.tsx	Borde / UI / Estado (CA-5)	Componente	Media	Misión con 2 reclasificaciones y justificación con salto de línea; y apertura secuencial de incidente A seguido de error 403 en B.	bitacora ascendente con 2 hitos TIPOLOGIA_RECLASIFICADA y salto de línea en MisionDetalleModal.test.tsx; cambio A -> B con respuesta 403 en IncidenteDetalleDrawer.test.tsx	MisionReportesSection muestra el último hito extrayendo texto multilínea; IncidenteDetalleDrawer limpia detalle al cerrar o fallar y reinicia sección con key.	Re-Test cierre 18/11: verificados ambos casos por pruebas unitarias dedicadas BUG-H37-WEB-05 en MisionDetalleModal.test.tsx (121 ms) e IncidenteDetalleDrawer.test.tsx (145 ms).	CORREGIDO	17/11/2026 00:15	18/11/2026 21:47	fix(mando): unificar distintivo verificado en IncidenteCard y ampliar tests de reclasificacion (BUG-H37-WEB-05, BUG-H37-WEB-06)
BUG-H37-WEB-06	Regresión visual por doble renderizado de etiqueta Verificado en IncidenteCard cuando incidente.verificado es true	Regresión Visual / UI (CA-6)	Componente	Media	Tarjeta IncidenteCard hidratada desde API o actualizada tras verificación (verificado: true).	Props incidente con { verificado: true, reclasificadoEnTerreno: false } y { verificado: true, reclasificadoEnTerreno: true }	Renderizado único del distintivo Verificado (getAllByText('Verificado') de longitud 1) con data-testid='badge-verificado' y tooltip contextual prioritario.	Re-Test cierre 18/11: eliminado bloque duplicado de cardTopRow en IncidenteCard.tsx y unificado en líneas 95-119; test BUG-H37-WEB-06 valida unicidad en ambos estados (68 ms).	CORREGIDO	18/11/2026 14:47	18/11/2026 21:47	fix(mando): unificar distintivo verificado en IncidenteCard y ampliar tests de reclasificacion (BUG-H37-WEB-05, BUG-H37-WEB-06)
TC-H37-WEB-01	Suscripción a salas WebSocket y normalización de payload incidente:actualizado con tipoIncidenteId, tipoAfectacion y justificacion en useEncargadoKanbanSocket	Tiempo Real / WebSocket (CA-6)	Unitario / Hook	Crítica	Montaje de useEncargadoKanbanSocket con cliente Socket.io mockeado en Vitest.	Evento incidente:actualizado con id, codigo, nuevoEstado, prioridad ALTA, tipoIncidenteId, tipoAfectacion Inundación y justificacion	Normaliza el payload conservando los campos de reclasificación, invoca onIncidenteActualizado y actualiza ultimoEvento con mensaje amigable en español.	Re-Test cierre 18/11: useEncargadoKanbanSocket.test.ts aprueba los 7 tests (7/7 passed), verificando normalización y texto Tipología reclasificada: INC-2026-001 a Inundación (Prioridad: Alta).	APROBADO	17/11/2026 00:15	18/11/2026 21:47	feat(kanban): actualizar tipología, prioridad y justificación reactivamente vía websocket (#39)
TC-H37-WEB-02	Actualización reactiva en memoria de tipología, prioridad y justificación en la tarjeta del tablero Kanban ante evento incidente:actualizado	Reactividad UI (CA-6)	Integración / Hook	Crítica	Tablero Kanban cargado con incidente en VERIFICANDO tipificado inicialmente como Anegamiento menor y prioridad BAJA.	Callback onIncidenteActualizado con tipoAfectacion: 'Inundación', prioridad: 'ALTA', justificacion: 'Tras evaluación presencial...'	La tarjeta en columnas.VERIFICANDO actualiza al instante tipoAfectacion, prioridad, reclasificadoEnTerreno: true y justificacionReclasificacion.	Re-Test cierre 18/11: useIncidentesKanban.test.ts verifica la mutación inmutable y actualización reactiva inmediata en memoria (7/7 passed, 71 ms caso H37).	APROBADO	17/11/2026 00:15	18/11/2026 21:47	feat(kanban): actualizar tipología, prioridad y justificación reactivamente vía websocket (#39)
TC-H37-WEB-03	Renderizado del distintivo Verificado con ícono CheckCircle2 y tooltip con justificación en IncidenteCard ante reclasificadoEnTerreno: true	Funcional / UI (CA-6)	Componente	Alta	Tarjeta IncidenteCard actualizada en vivo con reclasificadoEnTerreno: true y justificacionReclasificacion.	Props incidente con tipoAfectacion Inundación, prioridad ALTA, reclasificadoEnTerreno true y justificacionReclasificacion	Muestra la nueva tipología Inundación, prioridad legible Alta y chip Verificado único con title conteniendo la justificación presencial.	Re-Test cierre 18/11: IncidenteCard.test.tsx valida Inundación, Alta, unicidad de Verificado y el contenido del tooltip (62 ms).	APROBADO	17/11/2026 00:15	18/11/2026 21:47	feat(mando): estilizar discretamente verificacion, registrar reclasificacion en bitacora e informes y eliminar enums (HU-37)
TC-H37-WEB-04	Persistencia del chip Verificado único en IncidenteCard cuando verificado: true proviene desde el servidor al paginar o refrescar	Funcional / Persistencia	Componente	Alta	Tarjeta IncidenteCard hidratada desde GET /api/incidentes tras paginación o recarga (verificado: true, con reclasificadoEnTerreno en false y true).	Props incidente con verificado: true, reclasificadoEnTerreno: false y verificado: true, reclasificadoEnTerreno: true	Se exhibe exactamente un chip Verificado visible (badge-verificado) en la tarjeta sin duplicación tras refrescar o paginar el tablero.	Re-Test cierre 18/11: tras el fix de BUG-H37-WEB-06 en IncidenteCard.tsx, el test verifica getAllByText('Verificado').toHaveLength(1) y badge-verificado en ambos estados (68 ms).	APROBADO	17/11/2026 00:15	18/11/2026 21:47	fix(mando): unificar distintivo verificado en IncidenteCard y ampliar tests de reclasificacion (BUG-H37-WEB-05, BUG-H37-WEB-06)
TC-H37-WEB-05	Despliegue de franja informativa en vivo en KanbanBoard ante reclasificación presencial	Funcional / UX (CA-6)	Componente	Media	KanbanBoard montado con ultimoEvento no nulo proveniente de useIncidentesKanban.	ultimoEvento = 'Tipología reclasificada: INC-2026-001 a Inundación (Prioridad: Alta)'	La franja superior exhibe el ícono Zap y el texto Actualización en vivo: Tipología reclasificada: INC-2026-001 a Inundación (Prioridad: Alta).	Re-Test cierre 18/11: verificado en KanbanBoard.tsx (líneas 304-321) y useEncargadoKanbanSocket.ts (líneas 199-202).	APROBADO	17/11/2026 00:15	18/11/2026 21:47	feat(kanban): actualizar tipología, prioridad y justificación reactivamente vía websocket (#39)
TC-H37-WEB-06	Visualización del bloque Reclasificación Técnica en Terreno en IncidenteResumenSection dentro de IncidenteDetalleDrawer	Funcional / UI (CA-5 / CA-6)	Componente	Alta	IncidenteDetalleDrawer cargado con incidente que posee reclasificadoEnTerreno: true y justificacionReclasificacion.	Respuesta mock de obtenerDetalleIncidente con tipoAfectacion: 'Inundación Mayor', prioridad: 'CRITICA', justificacionReclasificacion: 'Desborde de río...'	Se despliega bloque-reclasificacion-terreno con tipología constatada y justificación de la patrulla junto a los badges Estado: En atención y Prioridad: Crítica.	Re-Test cierre 18/11: IncidenteDetalleDrawer.test.tsx valida el bloque bloque-reclasificacion-terreno (16/16 passed, 224 ms caso H37).	APROBADO	17/11/2026 00:15	18/11/2026 21:47	feat(ui): reflejar reclasificación en terreno en tarjeta kanban y drawer de detalle
TC-H37-WEB-07	Sincronización en vivo de IncidenteDetalleDrawer al recibir incidente:actualizado con reclasificación mientras el panel permanece abierto	Tiempo Real / WebSocket (CA-6)	Componente	Alta	IncidenteDetalleDrawer abierto mostrando el incidenteId afectado al momento de recibirse la reclasificación desde terreno.	Evento Socket incidente:actualizado con id, tipoIncidenteId, tipoAfectacion, prioridad, nuevoEstado y justificacion	El estado interno detalle actualiza tipoAfectacion, prioridad, estado, tipoIncidenteId, reclasificadoEnTerreno y justificacionReclasificacion sin cerrar el panel.	Re-Test cierre 18/11: verificado en IncidenteDetalleDrawer.tsx (líneas 250-298) con guarda esEventoReclasificacion.	APROBADO	17/11/2026 00:15	18/11/2026 21:47	feat(ui): reflejar reclasificación en terreno en tarjeta kanban y drawer de detalle
TC-H37-WEB-08	Eliminación de enums crudos mediante utilidades formatearEstado, formatearPrioridad, formatearHitoBitacora, formatearTipoMision y obtenerChipEstadoMision	Calidad UX / Unitario	Utilidad	Media	Invocación de formateadores institucionales en src/lib/utils/estadoUtils.ts.	Entradas VERIFICANDO, CRITICA, TIPOLOGIA_RECLASIFICADA, VERIFICACION, EN_CURSO, null, ''	Retorna En verificación, Crítica, Tipología reclasificada en terreno, Verificación en terreno, chip En curso y fallbacks seguros.	Re-Test cierre 18/11: estadoUtils.test.ts aprueba los 12 tests unitarios (12/12 passed, 7 ms).	APROBADO	17/11/2026 00:15	18/11/2026 21:47	feat(utils): incorporar formateadores amigables de estados, prioridades e hitos operativos
TC-H37-WEB-09	Visualización del hito TIPOLOGIA_RECLASIFICADA como Tipología reclasificada en terreno en bitácora y sincronización de título en MisionDetalleHeader	Funcional / UI (CA-5)	Componente	Alta	MisionDetalleModal cargado con misión VERIFICACION cuyo historial incluye el hito TIPOLOGIA_RECLASIFICADA.	bitacoraTiempos con hito TIPOLOGIA_RECLASIFICADA y descripcion 'Tipología reclasificada en terreno a: Corte de agua potable. Justificación: ...'	La cabecera muestra Verificación: Corte de agua potable - INC-592395-562 con chips legibles y la bitácora traduce el hito sin enums.	Re-Test cierre 18/11: MisionDetalleModal.test.tsx valida el formateo amigable del hito, tipo, estado y prioridad (13/13 passed, 163 ms).	APROBADO	17/11/2026 00:15	18/11/2026 21:47	feat(mando): estilizar discretamente verificacion, registrar reclasificacion en bitacora e informes y eliminar enums (HU-37)
TC-H37-WEB-10	Renderizado e interacción accesible (colapsar/desplegar) del informe técnico Evaluación en Terreno Realizada en MisionReportesSection	Funcional / A11y (CA-5)	Componente	Media	Misión con hito TIPOLOGIA_RECLASIFICADA abierto en MisionDetalleModal.	patrulla con lider y tipoAfectacion Corte de agua potable	Tarjeta reporte-verificacion-reclasificacion inicia desplegada (aria-expanded='true'), extrae la justificación y alterna su visibilidad al hacer clic.	Re-Test cierre 18/11: MisionDetalleModal.test.tsx valida el contenido técnico de la tarjeta y la conmutación aria-expanded true/false (13/13 passed).	APROBADO	17/11/2026 00:15	18/11/2026 21:47	feat(mando): homogeneizar bitacora, hacer reportes desplegables y agrupar misiones rechazadas en incidente
TC-H37-WEB-11	Priorización de misiones activas y agrupación en acordeón colapsado de misiones rechazadas en IncidenteMisionesSection	Funcional / UI	Componente	Media	Incidente con misiones activas (EN_CURSO) y misiones rechazadas (RECHAZADA) en IncidenteMisionesSection.	misiones=[misionRechazada1, misionRechazada2, misionEnCurso]	Ordena la misión en curso primero, agrupa los 2 rechazos en un acordeón inicialmente colapsado (aria-expanded='false') y los despliega al hacer clic.	Re-Test cierre 18/11: IncidenteMisionesSection.test.tsx aprueba los 15 escenarios consolidados (15/15 passed, 153 ms caso acordeón).	APROBADO	17/11/2026 00:15	18/11/2026 21:47	feat(mando): homogeneizar bitacora, hacer reportes desplegables y agrupar misiones rechazadas en incidente
TC-H37-WEB-12	Control de botón Confirmación Pendiente en REPORTADO (tieneMisionDespachada: true) y saneamiento de tieneMisionEnCurso: true hacia VERIFICANDO	Regla Operativa	Hook / Componente	Alta	Tarjeta en REPORTADO con misión despachada pendiente o con misión ya en curso proveniente de API.	tieneMisionDespachada: true en IncidenteCard; tieneMisionEnCurso: true en useIncidentesKanban	En IncidenteCard reemplaza Asignar Patrulla por Confirmación Pendiente deshabilitado; en el hook reubica el incidente con tieneMisionEnCurso: true en VERIFICANDO.	Re-Test cierre 18/11: verificado en IncidenteCard.test.tsx (14/14 passed) y useIncidentesKanban.test.ts (7/7 passed).	APROBADO	17/11/2026 00:15	18/11/2026 21:47	fix(mando): ubicar incidentes en curso en verificacion, bloquear asignacion duplicada y resolver hydration mismatch
TC-H37-WEB-13	Manejo de evento mision:rechazada con deduplicación temporal, reseteo de tieneMisionDespachada y retorno en REPORTADO	Tiempo Real / WebSocket	Hook / UI	Alta	Incidente en REPORTADO con tieneMisionDespachada: true al recibirse mision:rechazada vía Socket.io.	Payload mision:rechazada con misionId, codigo MIS-2026-0099, motivo e incidenteId	useIncidentesKanban restablece tieneMisionDespachada: false permitiendo reasignar e invoca onMisionRechazada (Toast de advertencia en KanbanBoard).	Re-Test cierre 18/11: verificado en useIncidentesKanban.test.ts, KanbanBoard.tsx (líneas 68-95) y useEncargadoKanbanSocket.ts.	APROBADO	17/11/2026 00:15	18/11/2026 21:47	feat(kanban): sincronizar estados de despacho y rechazo manteniendo incidentes en REPORTADO hasta confirmacion (H69)
TC-H37-WEB-14	Generación de tipos de rutas Next.js (next typegen), chequeo estático TypeScript (tsc --noEmit) y build de producción (npm run build)	Compilación / Build	Sistema	Crítica	Ejecución en rama feature/h37-patrulla-categorizar-incidente sincronizada con origin/develop.	npx next typegen && npx tsc --noEmit && npm run build	0 errores TypeScript en src/ y .next/types, y generación completa de artefactos de producción en next build.	Re-Test cierre 18/11: next typegen exitoso, tsc --noEmit exit code 0 y npm run build (Webpack) compila 47 rutas en 8.8 s (TS 16.8 s, páginas estáticas 47/47 en 1409 ms).	APROBADO	17/11/2026 00:15	18/11/2026 21:47	chore(merge): sincronizar origin/develop y resolver conflicto en incidentesService (BUG-H37-WEB-03)
TC-H37-WEB-15	Cumplimiento de guía visual municipal (GEMINI.md: bordes 0px, paleta oficial, iconografía lucide-react sin emojis) y manual H37-actualizacion-tipologia-kanban.md	Estándar / Documentación	UI / Docs	Media	Revisión de los últimos commits en src/ y docs/manuals/H37-actualizacion-tipologia-kanban.md.	Inspección de borderRadius, tokens CSS, íconos lucide-react y secciones del manual H37	Cero emojis, esquinas rectas 0px, uso de tokens institucionales y manual completo para Encargado.	Re-Test cierre 18/11: IncidenteCard.tsx (líneas 95-119) y vistas de mando cumplen esquinas 0px, iconografía lucide-react sin emojis y manual publicado.	APROBADO	17/11/2026 00:15	18/11/2026 21:47	docs(manuals): documentar reclasificación presencial en tablero kanban (HU-37)
````

---

## 5. Guía de Ejecución Paso a Paso y Evidencias Técnicas Replicables (Re-Test Cierre `18/11/2026`)

### 5.1. Ejecución de Suites Automatizadas con Vitest

#### Comando 1: Ejecución consolidada de las 8 suites HU-37 / Centro de Mando y 2 suites de servicios recuperadas
```bash
npx vitest run src/hooks/__tests__/useEncargadoKanbanSocket.test.ts src/hooks/__tests__/useIncidentesKanban.test.ts src/components/mando/__tests__/IncidenteCard.test.tsx src/components/mando/__tests__/IncidenteDetalleDrawer.test.tsx src/components/mando/__tests__/IncidenteMisionesSection.test.tsx src/components/mando/mision/__tests__/MisionDetalleModal.test.tsx src/lib/utils/__tests__/estadoUtils.test.ts src/components/mando/__tests__/KanbanFiltros.test.tsx

npx vitest run src/services/__tests__/incidentesService.test.ts src/services/__tests__/misionesService.test.ts
```

**Evidencia obtenida en consola (`Exit code: 0`):**
```text
 RUN  v3.2.7 /home/ds2fery/Documentos/Proyecto/sgrai-uach/web

 ✓ src/lib/utils/__tests__/estadoUtils.test.ts (12 tests) 7ms
 ✓ src/hooks/__tests__/useEncargadoKanbanSocket.test.ts (7 tests) 58ms
 ✓ src/components/mando/__tests__/IncidenteCard.test.tsx (14 tests) 383ms
 ✓ src/hooks/__tests__/useIncidentesKanban.test.ts (7 tests) 421ms
 ✓ src/components/mando/__tests__/IncidenteMisionesSection.test.tsx (15 tests) 664ms
 ✓ src/components/mando/__tests__/KanbanFiltros.test.tsx (9 tests) 683ms
 ✓ src/components/mando/mision/__tests__/MisionDetalleModal.test.tsx (13 tests) 729ms
 ✓ src/components/mando/__tests__/IncidenteDetalleDrawer.test.tsx (16 tests) 939ms

 Test Files  8 passed (8)
      Tests  93 passed (93)
   Start at  21:47:08
   Duration  3.54s

 ✓ src/services/__tests__/incidentesService.test.ts (9 tests) 12ms
 ✓ src/services/__tests__/misionesService.test.ts (13 tests) 26ms

 Test Files  2 passed (2)
      Tests  22 passed (22)
   Start at  21:47:12
   Duration  1.24s
```

#### Comando 2: Ejecución individual por escenario (`npm test -- -t "..."`)
```bash
# BUG-H37-WEB-06 (Re-Test cierre): Chip único "Verificado" con o sin reclasificadoEnTerreno
npm test -- src/components/mando/__tests__/IncidenteCard.test.tsx -t "BUG-H37-WEB-06"

# BUG-H37-WEB-05 (Re-Test cierre): Último hito TIPOLOGIA_RECLASIFICADA y justificación multilínea
npm test -- src/components/mando/mision/__tests__/MisionDetalleModal.test.tsx -t "BUG-H37-WEB-05"

# BUG-H37-WEB-01 (Re-Test cierre): Sin falsos positivos ni doble conteo ante incidente:actualizado sin reclasificación
npm test -- src/hooks/__tests__/useIncidentesKanban.test.ts -t "BUG-H37-WEB-01"

# BUG-H37-WEB-05 (Re-Test cierre): Limpieza de detalle previo en IncidenteDetalleDrawer ante error 403
npm test -- src/components/mando/__tests__/IncidenteDetalleDrawer.test.tsx -t "BUG-H37-WEB-05"

# TC-H37-WEB-01: Procesamiento WebSocket de reclasificación en useEncargadoKanbanSocket
npm test -- src/hooks/__tests__/useEncargadoKanbanSocket.test.ts -t "debe procesar reclasificación de tipología en terreno"

# TC-H37-WEB-02: Actualización reactiva en useIncidentesKanban
npm test -- src/hooks/__tests__/useIncidentesKanban.test.ts -t "debe actualizar inmediatamente tipología y prioridad"

# TC-H37-WEB-03 y TC-H37-WEB-04: Chips Verificado en IncidenteCard
npm test -- src/components/mando/__tests__/IncidenteCard.test.tsx -t "Verificado"

# TC-H37-WEB-06: Bloque de reclasificación técnica en IncidenteDetalleDrawer
npm test -- src/components/mando/__tests__/IncidenteDetalleDrawer.test.tsx -t "reclasificación técnica"

# TC-H37-WEB-09 y TC-H37-WEB-10: Hito TIPOLOGIA_RECLASIFICADA e informe desplegable en MisionDetalleModal
npm test -- src/components/mando/mision/__tests__/MisionDetalleModal.test.tsx -t "reclasificación de tipología"

# TC-H37-WEB-08: Formateadores de estados, prioridades e hitos en estadoUtils
npm test -- src/lib/utils/__tests__/estadoUtils.test.ts -t "formatea hitos de bitácora"

# TC-H37-WEB-11: Agrupación y priorización de misiones rechazadas en IncidenteMisionesSection
npm test -- src/components/mando/__tests__/IncidenteMisionesSection.test.tsx -t "menú desplegable colapsado"

# BUG-H37-WEB-02 / KanbanFiltros: Renderizado con catálogo de tipos y controles
npm test -- src/components/mando/__tests__/KanbanFiltros.test.tsx -t "tipo y botonera de estados"
```

**Evidencias obtenidas en consola (`Exit code: 0`):**
```text
 ✓ src/components/mando/__tests__/IncidenteCard.test.tsx (14 tests | 13 skipped) 69ms
   ✓ IncidenteCard > debe exhibir un único distintivo "Verificado" cuando verificado es true al cargar desde el servidor (con o sin reclasificadoEnTerreno) (BUG-H37-WEB-06) 68ms

 ✓ src/components/mando/mision/__tests__/MisionDetalleModal.test.tsx (13 tests | 12 skipped) 122ms
   ✓ Componente MisionDetalleModal (HU-17) > BUG-H37-WEB-05: selecciona el hito TIPOLOGIA_RECLASIFICADA más reciente y extrae justificaciones multilínea con saltos de línea 121ms

 ✓ src/hooks/__tests__/useIncidentesKanban.test.ts (7 tests | 6 skipped) 70ms
   ✓ useIncidentesKanban - HU-20 y BUG-04 > BUG-H37-WEB-01: NO debe marcar verificado ni reclasificadoEnTerreno ni duplicar totalMisiones ante incidente:actualizado sin reclasificación 68ms

 ✓ src/components/mando/__tests__/IncidenteDetalleDrawer.test.tsx (16 tests | 15 skipped) 147ms
   ✓ Componente IncidenteDetalleDrawer e integración HU-17 > BUG-H37-WEB-05: limpia el detalle previo cuando se cambia a otro incidente cuya consulta retorna error 403 145ms

 ✓ src/hooks/__tests__/useEncargadoKanbanSocket.test.ts (7 tests | 6 skipped) 20ms
   ✓ useEncargadoKanbanSocket > debe procesar reclasificación de tipología en terreno emitiendo string amigable en ultimoEvento 18ms

 ✓ src/hooks/__tests__/useIncidentesKanban.test.ts (7 tests | 6 skipped) 72ms
   ✓ useIncidentesKanban - HU-20 y BUG-04 > debe actualizar inmediatamente tipología y prioridad con justificación ante evento incidente:actualizado (H37) 71ms

 ✓ src/components/mando/__tests__/IncidenteCard.test.tsx (14 tests | 12 skipped) 79ms
   ✓ IncidenteCard > debe exhibir la etiqueta "Verificado en terreno" con tooltip y justificación al reclasificarse (H37) 62ms
   ✓ IncidenteCard > debe exhibir un único distintivo "Verificado" cuando verificado es true al cargar desde el servidor (con o sin reclasificadoEnTerreno) (BUG-H37-WEB-06) 15ms

 ✓ src/components/mando/__tests__/IncidenteDetalleDrawer.test.tsx (16 tests | 15 skipped) 226ms
   ✓ Componente IncidenteDetalleDrawer e integración HU-17 > renderiza estados y prioridades legibles y muestra bloque de justificación de reclasificación técnica (H37) 224ms

 ✓ src/components/mando/mision/__tests__/MisionDetalleModal.test.tsx (13 tests | 12 skipped) 164ms
   ✓ Componente MisionDetalleModal (HU-17) > debe renderizar el informe técnico de reclasificación de tipología en terreno y evitar enums crudos 163ms

 ✓ src/lib/utils/__tests__/estadoUtils.test.ts (12 tests | 11 skipped) 3ms
   ✓ formatearHitoBitacora > formatea hitos de bitácora técnica de terreno en denominaciones legibles 1ms

 ✓ src/components/mando/__tests__/IncidenteMisionesSection.test.tsx (15 tests | 14 skipped) 155ms
   ✓ Componente IncidenteMisionesSection > debe priorizar las misiones en proceso al inicio y agrupar las rechazadas en un menú desplegable colapsado 153ms

 ✓ src/components/mando/__tests__/KanbanFiltros.test.tsx (9 tests | 8 skipped) 204ms
   ✓ KanbanFiltros > debe renderizar búsqueda, delegación territorial por nombre, prioridad, tipo y botonera de estados 202ms
```

#### Comando 3: Regresión completa del repositorio (`npm test`)
```bash
npm test
```

**Evidencia obtenida en consola (`Exit code: 0`):**
```text
 Test Files  128 passed (128)
      Tests  883 passed (883)
   Start at  21:45:11
   Duration  26.79s (transform 13.11s, setup 24.47s, collect 59.67s, tests 77.44s, environment 161.14s, prepare 19.01s)
```

---

### 5.2. Análisis Estático ESLint, Chequeo de Tipos, Build y Simulación de Merge

#### Comando 4: Análisis estático ESLint global (`npm run lint`)
```bash
npm run lint
```

**Evidencia obtenida en consola (`Exit code: 0`):**
```text
npm notice run sgrai-web@0.9.0 lint
npm notice run eslint
# Salida limpia: 0 errores, 0 advertencias en todo el repositorio (Exit code: 0)
```

#### Comando 5: Generación de tipos de ruta, chequeo de tipos y build (`TC-H37-WEB-14`)
```bash
npx next typegen && npx tsc --noEmit && npm run build
```

**Evidencia obtenida en consola (`Exit code: 0`):**
```text
Generating route types...
✓ Types generated successfully
...
▲ Next.js 16.3.4 (webpack)
- Environments: .env.local
✓ Running next.config.ts took 32ms

  Creating an optimized production build ...
✓ Compiled successfully in 8.8s
  Finished TypeScript in 16.8s
  Collecting page data using 15 workers in 1145ms
✓ Generating static pages using 15 workers (47/47) in 1409ms
  Collecting build traces in 15.2s
  Finalizing page optimization in 15.5s
```

#### Comando 6: Verificación de sincronización y merge sin conflictos contra `origin/develop` (`BUG-H37-WEB-03`)
```bash
git log HEAD..origin/develop --oneline
git merge-tree --write-tree origin/develop HEAD
```

**Evidencia obtenida en consola (`Exit code: 0`):**
```text
# git log HEAD..origin/develop --oneline: (sin commits pendientes)

# git merge-tree --write-tree origin/develop HEAD:
992589399a46a03edd3d278bf68073a459ea8690
```

---

### 5.3. Comandos cURL de Verificación Contractual contra `sgrai-api`

En la ejecución del Re-Test de cierre (`18/11/2026 21:45`), se comprobó la disponibilidad del servidor backend mediante `curl -s -o /dev/null -w "HTTP_CODE:%{http_code}\n" --connect-timeout 2 http://localhost:3001/openapi.json`, obteniéndose **`HTTP_CODE:000`** (`sgrai-api` no levantado en este entorno local). En consecuencia, las pruebas dinámicas de `sgrai-web` se ejecutaron sobre Vitest con mocks tipados del contrato regenerado en `src/types/api-generated.d.ts`, y los comandos cURL siguientes documentan las llamadas contractuales y esquemas HTTP/JSON esperados en ambiente integrado contra `sgrai-api`:

#### Escenario A: Consulta del catálogo oficial de tipos de incidente (`GET /api/incidentes/tipos?catalogo=true`)
```bash
curl -i -X GET "http://localhost:3001/api/incidentes/tipos?catalogo=true" \
  -H "Accept: application/json"
```

**Respuesta HTTP/JSON esperada por contrato (`200 OK`):**
```json
{
  "message": "Catálogo oficial de tipos de incidente obtenido exitosamente.",
  "data": [
    {
      "id": "a0000000-0000-4000-8000-000000000001",
      "nombre": "Anegamiento",
      "descripcion": "Acumulación de aguas lluvias en vías o propiedades",
      "activo": true
    },
    {
      "id": "40000000-0000-4000-8000-000000000001",
      "nombre": "Inundación",
      "descripcion": "Acumulación desmedida de agua por crecida de ríos o lluvias torrenciales",
      "activo": true
    }
  ]
}
```

#### Escenario B: Reclasificación de tipología desde patrulla en terreno con misión `EN_CURSO` (`PATCH /api/incidentes/{id}/tipologia`)
```bash
curl -i -X PATCH "http://localhost:3001/api/incidentes/50000000-0000-4000-8000-000000000001/tipologia" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN_JWT_PATRULLA>" \
  -H "x-user-id: 00000000-0000-4000-8000-000000000004" \
  -d '{
    "tipoIncidenteId": "40000000-0000-4000-8000-000000000001",
    "justificacion": "Tras evaluación en terreno se constata desborde de cauce con ingreso masivo de agua a viviendas, no un anegamiento menor."
  }'
```

**Respuesta HTTP/JSON esperada por contrato (`200 OK`):**
```json
{
  "message": "Tipología del incidente reclasificada exitosamente en terreno.",
  "data": {
    "incidente": {
      "id": "50000000-0000-4000-8000-000000000001",
      "codigo": "INC-2026-001",
      "tipoIncidenteId": "40000000-0000-4000-8000-000000000001",
      "tipoAfectacion": "Inundación",
      "estado": "VERIFICANDO",
      "prioridad": "ALTA",
      "actualizadoEn": "2026-11-17T03:15:00.000Z"
    },
    "hito": {
      "id": "70000000-0000-4000-8000-000000000010",
      "misionId": "60000000-0000-4000-8000-000000000001",
      "hito": "TIPOLOGIA_RECLASIFICADA",
      "descripcion": "Tipología reclasificada en terreno a: Inundación. Justificación: Tras evaluación en terreno se constata desborde de cauce con ingreso masivo de agua a viviendas, no un anegamiento menor.",
      "registradoPorId": "00000000-0000-4000-8000-000000000004",
      "creadoEn": "2026-11-17T03:15:00.000Z"
    }
  }
}
```

#### Escenario C: Rechazo RBAC sin permiso `misiones:terreno:verificar` (`403 Forbidden`)
```bash
curl -i -X PATCH "http://localhost:3001/api/incidentes/50000000-0000-4000-8000-000000000001/tipologia" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN_JWT_SIN_PERMISO>" \
  -H "x-user-id: 00000000-0000-4000-8000-000000000002" \
  -d '{
    "tipoIncidenteId": "40000000-0000-4000-8000-000000000001",
    "justificacion": "Intento de reclasificación sin permiso de verificación en terreno."
  }'
```

**Respuesta HTTP/JSON esperada por contrato (`403 Forbidden`):**
```json
{
  "message": "No cuenta con el permiso requerido: misiones:terreno:verificar"
}
```

#### Escenario D: Rechazo por misión aún no aceptada en terreno (`409 Conflict`)
```bash
curl -i -X PATCH "http://localhost:3001/api/incidentes/50000000-0000-4000-8000-000000000002/tipologia" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN_JWT_PATRULLA>" \
  -H "x-user-id: 00000000-0000-4000-8000-000000000004" \
  -d '{
    "tipoIncidenteId": "40000000-0000-4000-8000-000000000001",
    "justificacion": "Intento de reclasificar antes de aceptar la misión asignada."
  }'
```

**Respuesta HTTP/JSON esperada por contrato (`409 Conflict`):**
```json
{
  "message": "La patrulla debe aceptar la misión asignada antes de poder reclasificar la tipología del incidente."
}
```

#### Escenario E: Verificación de proyección persistida en Kanban y Detalle del Incidente (`GET /api/incidentes` y `GET /api/incidentes/{id}`)
```bash
curl -i -X GET "http://localhost:3001/api/incidentes?estado=VERIFICANDO&page=1&limit=20" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer <TOKEN_JWT_ENCARGADO>" \
  -H "x-user-id: 00000000-0000-4000-8000-000000000003"

curl -i -X GET "http://localhost:3001/api/incidentes/50000000-0000-4000-8000-000000000001" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer <TOKEN_JWT_ENCARGADO>" \
  -H "x-user-id: 00000000-0000-4000-8000-000000000003"
```

---

## 6. Matriz de Trazabilidad de Criterios de Aceptación (HU-37)

| Criterio de Aceptación (CA) | Ámbito en Ecosistema SGRAI | Casos Asociados en `sgrai-web` | Estado Final | Observación Técnica |
| :--- | :--- | :--- | :---: | :--- |
| **CA-1:** La pantalla de evaluación en la PWA debe proveer un selector desplegable con las categorías oficiales de incidentes. | `sgrai-pwa` (UI Terreno) / `sgrai-web` (Filtro Kanban) | `BUG-H37-WEB-02` (`CORREGIDO`) | **Cumple en alcance Web** | La pantalla de evaluación en terreno reside en `sgrai-pwa`. En `sgrai-web`, `KanbanFiltros.tsx` utiliza el catálogo dinámico de categorías oficiales. |
| **CA-2:** El selector debe alimentarse del catálogo oficial `GET /api/incidentes/tipos`. | `sgrai-api` + `sgrai-pwa` / `sgrai-web` (`KanbanFiltros`) | `BUG-H37-WEB-02` (`CORREGIDO`) | **Cumple** | `KanbanFiltros.tsx` consulta `obtenerTiposAfectacion()` (`GET /api/incidentes/tipos`), manteniendo el filtro del tablero alineado al catálogo oficial. |
| **CA-3:** La patrulla debe poder seleccionar el tipo que mejor describe la situación real constatada en terreno. | `sgrai-pwa` + `sgrai-web` (visualización en mando) | `TC-H37-WEB-02`, `TC-H37-WEB-03`, `TC-H37-WEB-06` | **Cumple en alcance Web** | La tipología constatada en terreno se refleja inmediatamente en la tarjeta Kanban, franja en vivo y drawer de detalle tras el evento de reclasificación. |
| **CA-4:** Al guardar, el sistema debe actualizar el campo `incidente.tipo_incidente_id` en la base de datos. | `sgrai-api` (persistencia) / `sgrai-web` (contrato DTO y tarjeta) | `BUG-H37-WEB-02`, `BUG-H37-WEB-06`, `TC-H37-WEB-04` (`CORREGIDO` / `APROBADO`) | **Cumple en alcance Web** | Contrato OpenAPI `api-generated.d.ts`, `incidentesService.ts` y distintivo único `"Verificado"` (`BUG-H37-WEB-06`) validados tras recarga/paginación. |
| **CA-5:** Se debe registrar automáticamente un hito en `mision_hito` indicando: `'Tipología reclasificada en terreno a: [Nombre del Tipo]'`. | `sgrai-api` + `sgrai-web` (`MisionBitacoraSection`, `MisionReportesSection`) | `TC-H37-WEB-08`, `TC-H37-WEB-09`, `TC-H37-WEB-10`, `BUG-H37-WEB-05` (`CORREGIDO`) | **Cumple** | `MisionReportesSection.tsx` toma el último hito `TIPOLOGIA_RECLASIFICADA` y extrae justificaciones multilínea; `IncidenteDetalleDrawer` reinicia estado al cerrar o fallar. |
| **CA-6:** El sistema debe emitir la notificación WebSocket `incidente:actualizado` al Centro de Mando para actualizar la tarjeta en el tablero Kanban. | `sgrai-api` (emisor) + `sgrai-web` (receptor Kanban y Drawer) | `TC-H37-WEB-01`..`07`, `BUG-H37-WEB-01`, `BUG-H37-WEB-04`, `BUG-H37-WEB-06` (`CORREGIDO`) | **Cumple** | Reclasificación reactiva verificada sin falsos positivos (`BUG-H37-WEB-01`), con chip `"Verificado"` único (`BUG-H37-WEB-06`), `0` errores/warnings ESLint y suite completa passing. |
| **CA-7:** El endpoint de actualización debe requerir el permiso RBAC `misiones:terreno:verificar`. | `sgrai-api` (`PATCH /api/incidentes/{id}/tipologia`) | `BUG-H37-WEB-02`, `BUG-H37-WEB-03` (`CORREGIDO`) | **Cumple en alcance Web** | La ruta `PATCH /api/incidentes/{id}/tipologia` y el esquema completo de `sgrai-api` constan en `api-generated.d.ts`, con servicios Bearer JWT integrados desde `origin/develop`. |

---

## 7. Dictamen Final de Certificación QA

**Dictamen:** **APROBADO EN RE-TEST DE CIERRE — APTO PARA INTEGRACIÓN A `develop`**

La rama `feature/h37-patrulla-categorizar-incidente` en `sgrai-web` cumple con los criterios de calidad, arquitectura, estilo visual municipal y trazabilidad exigidos para **HU-37**:
- **`21 / 21`** escenarios aprobados/corregidos (`6` defectos `CORREGIDO` y `15` casos `APROBADO`).
- **`883 / 883`** pruebas unitarias y de integración (`128` archivos Vitest) aprobadas sin fallos.
- **`0` errores y `0` advertencias** en `npm run lint`; **`0` errores** en `npx next typegen && npx tsc --noEmit`.
- **`npm run build`** completado exitosamente (`47` rutas generadas con Webpack).
- **`git merge-tree --write-tree origin/develop HEAD`** limpio sin conflictos y **`0` commits pendientes** respecto a `origin/develop`.

*(Nota de despliegue integrado: dado que en este entorno local `sgrai-api` respondió `HTTP_CODE:000`, la verificación de extremo a extremo contra base de datos PostgreSQL y emisión Socket.io en vivo queda sujeta al despliegue integrado con `sgrai-api` y `sgrai-pwa` en el ambiente de pruebas).*
