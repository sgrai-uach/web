# Informe de Auditoría Técnica, Re-Test y Matriz de Casos de Prueba QA — HU-37: Categorizar o Corregir Tipología del Incidente en Terreno (Tablero Kanban / Centro de Mando)

**Proyecto:** SGRAI — Sistema de Gestión de Recursos para Atención de Incidentes (Dirección de Gestión de Riesgos de Desastres, Municipalidad de Valdivia)  
**Repositorio:** `sgrai-web`  
**Rama Evaluada:** `feature/h37-patrulla-categorizar-incidente`  
**Desarrollador Asignado:** `zetastormy`  
**Historia de Usuario:** HU-37 — *Como Patrulla verificadora Quiero categorizar o corregir la tipología del incidente tras la evaluación presencial en terreno Para asegurar un registro técnico fidedigno de la naturaleza real de la emergencia, corrigiendo clasificaciones inexactas hechas por informantes ciudadanos.*  
**Issue / PR Referenciado:** `#39` (rama destino: `develop`)  
**Fecha de Ejecución QA:** `17/11/2026 00:15`  
**Fecha de Re-Test:** `18/11/2026 14:47`  
**Estado de Certificación QA:** `OBSERVADO EN RE-TEST — REQUIERE CORRECCIONES ADICIONALES (2 DEFECTOS ABIERTOS / 1 CASO EN REGRESIÓN)`

---

## 1. Resumen Ejecutivo

Tras los commits de corrección aplicados por el desarrollador (`fix(h37): sincronizar develop y resolver hallazgos de QA (BUG-H37-WEB-01..05)`), se ejecutó la segunda ronda de auditoría técnica (Re-Test) sobre la rama `feature/h37-patrulla-categorizar-incidente` en `sgrai-web`, contrastando el código fuente, el contrato OpenAPI generado, las suites automatizadas con Vitest, ESLint, TypeScript, la compilación de producción y la sincronización respecto a `origin/develop`.

Los resultados del Re-Test evidencian la **resolución efectiva de 4 de los 5 defectos iniciales (`BUG-H37-WEB-01`, `BUG-H37-WEB-02`, `BUG-H37-WEB-04` y `BUG-H37-WEB-05`)**, logrando `0` errores bloqueantes en ESLint, regeneración íntegra de `src/types/api-generated.d.ts`, carga dinámica de tipologías en `KanbanFiltros.tsx`, corrección de falsos positivos en eventos WebSocket de cambio de estado y saneamiento del estado residual en `IncidenteDetalleDrawer.tsx`.

No obstante, persiste **1 defecto de integración Git (`BUG-H37-WEB-03`)** debido a que la rama fusionó una versión desactualizada de `develop` previa a 5 commits ya integrados en `origin/develop` (dejando un conflicto en `src/services/incidentesService.ts`, omitiendo pruebas de servicio de KPIs y misiones con Bearer JWT y reintroduciendo 11 advertencias globales de ESLint), y se detectó **1 regresión visual nueva (`BUG-H37-WEB-06`)** en `src/components/mando/IncidenteCard.tsx`, donde coexisten dos distintivos `"Verificado"` duplicados cuando `incidente.verificado === true` (afectando el caso `TC-H37-WEB-04`). Sobre `21` escenarios consolidados (`6` defectos + `15` casos funcionales/técnicos), se alcanza un **85.7% de aprobación (`18/21`)** con **3 ítems pendientes (`BUG-H37-WEB-03`, `BUG-H37-WEB-06` y `TC-H37-WEB-04`)**.

| Métrica de Calidad | Resultado Inicial (17/11) | Resultado Re-Test (18/11) | Criterio de Aceptación / Umbral | Estado Re-Test |
| :--- | :---: | :---: | :---: | :---: |
| **Total de Casos en Matriz** | **20** (`5` Bugs + `15` TCs) | **21** (`6` Bugs + `15` TCs) | Cobertura integral HU-37 en `sgrai-web` | Evaluado |
| **Cerrados / Aprobados (`CORREGIDO` + `APROBADO`)** | **15 / 20** (`75.0%`) | **18 / 21** (`85.7%`) | 100% para certificación | Parcial |
| **Defectos Abiertos (`ABIERTO`) / Regresión (`FALLIDO`)** | **5** (`1` Crítica, `2` Altas, `2` Medias) | **2 `ABIERTO` + 1 `FALLIDO`** (`1` Alta, `1` Media) | 0 defectos abiertos ni regresiones | **Fallido** |
| **Suite Completa Vitest (`npm test`)** | **807 / 807** (`123` archivos) | **876 / 876** (`128` archivos, `53.72s`) | 100% passing | **Cumple** |
| **Suites Específicas HU-37 / Mando (Vitest)** | **65 / 65** (`8` archivos) | **92 / 92** (`8` archivos, `4.82s`) | 100% passing | **Cumple** |
| **Verificación de Tipos (`npx next typegen && npx tsc --noEmit`)** | **0 errores** | **0 errores** | 0 errores | **Cumple** |
| **Build de Producción (`npm run build` con Webpack)** | **Exit code 0** (`47` rutas) | **Exit code 0** (`47` rutas, `4.7s` + TS `2.5s`) | Compilación limpia | **Cumple** |
| **Análisis Estático ESLint (`npm run lint`)** | **4 errores, 12 warnings** | **0 errores, 11 warnings** (`0` en archivos HU-37) | 0 errores (0 warnings en `origin/develop`) | **Observado** |
| **Integración Git con `origin/develop` (`git merge-tree`)** | **13 archivos en conflicto** | **1 archivo en conflicto** + **5 commits faltantes** | Fusión limpia sin regresiones | **Fallido** |

---

## 2. Registro Técnico de Defectos (Estado Post Re-Test)

### 2.1. `BUG-H37-WEB-03` (Severidad: Alta — `ABIERTO`) — Sincronización incompleta contra `origin/develop`: 1 conflicto en `src/services/incidentesService.ts` y omisión de 5 commits posteriores de seguridad/lint
- **Archivos afectados:**
  - `src/services/incidentesService.ts` (líneas 21–24, 88–93, 163–168, 222–228)
  - `src/services/__tests__/incidentesService.test.ts` (faltan `79`/`81` líneas de pruebas unitarias de `obtenerKpisIncidentes` y aserciones `params.header`)
  - `src/services/__tests__/misionesService.test.ts` (faltan `145` líneas de pruebas de autenticación Bearer JWT en `misionesService`)
  - `src/services/misionesService.ts`, `src/services/avisosService.ts`, `src/services/puntosCriticosService.ts`
  - `src/components/mando/KanbanBoard.tsx` (línea 113: omite `return cargarCuadrillas()` en `useEffect`)
  - `docs/qa/REGISTRO_DEFECTOS_INTEGRACION_DEVELOP.md` y 8 archivos responsables de las `11` advertencias ESLint ya saneadas en `origin/develop` (`PatrullaDotacionSection.tsx`, `PatrullaVehiculoSection.tsx`, `RecursosEncargadoH14.test.tsx`, `EventoAsistenciaSocialForm.test.tsx`, `NuevoEventoSocialClient.test.tsx`, `useNuevaPatrullaForm.ts`, `asistentesSocialesService.test.ts`, `asistentesSocialesService.ts`).
- **Descripción técnica (Resultado Re-Test 18/11/2026):**
  Si bien el commit `fix(h37): sincronizar develop y resolver hallazgos de QA (BUG-H37-WEB-01..05)` integró la fusión de HU-22 y redujo los `13` conflictos iniciales a `1` único archivo en conflicto, el desarrollador fusionó una instantánea desactualizada de `develop` previa a 5 commits ya mergeados en `origin/develop` (`fix(mando): migrar consulta de KPIs a apiClient con Bearer JWT y proxy relativo`, `fix(misiones): autenticar listado de misiones con Bearer JWT vía apiClient y tipar obtenerDetalle`, `fix(types): eliminar casteos as any en puntosCriticosService, unificar apiClient en avisosService y regenerar tipos Next.js`, `fix(lint): remover código muerto post-merge, corregir cleanup en KanbanBoard y sanear 11 advertencias ESLint` y `docs(qa): actualizar registro formal de defectos de integración post-merge en develop`).
  En consecuencia:
  1. `git merge-tree --write-tree origin/develop HEAD` sigue fallando con `CONFLICTO (contenido): Conflicto de fusión en src/services/incidentesService.ts`.
  2. La rama actual carece de la cobertura de pruebas unitarias en `incidentesService.test.ts` (`obtenerKpisIncidentes`) y `misionesService.test.ts` (envío de Bearer JWT), revierte el tipado estricto en `puntosCriticosService.ts`/`avisosService.ts`/`misionesService.ts`, pierde el `return cargarCuadrillas()` en `KanbanBoard.tsx:113` y mantiene las `11` advertencias globales de ESLint que `origin/develop` ya había dejado en `0`.
- **Pasos para reproducir:**
  1. Ejecutar `git fetch origin && git log HEAD..origin/develop --oneline`.
  2. Ejecutar `git merge-tree --write-tree origin/develop HEAD`.
  3. Ejecutar `git diff --stat origin/develop..HEAD -- src/services/ src/components/mando/KanbanBoard.tsx`.
- **Comportamiento esperado:** `git merge-tree --write-tree origin/develop HEAD` resuelve sin conflictos, los 5 commits de `origin/develop` permanecen integrados y `npm run lint` reporta `0` errores y `0` advertencias globales.
- **Comportamiento actual:** `git merge-tree` falla con conflicto en `src/services/incidentesService.ts` y faltan 5 commits de `origin/develop` (`145` líneas de `misionesService.test.ts` y `81` líneas de `incidentesService.test.ts` suprimidas en el diff respecto a `origin/develop`).
- **Recomendación técnica:** Ejecutar `git fetch origin && git merge origin/develop`, resolver el conflicto de `src/services/incidentesService.ts` conservando el esquema completo de parámetros OpenAPI (`params.header: { 'x-user-id': userId }` y `NonNullable<paths['/api/incidentes/kpis']['get']['parameters']['query']>`), preservar las pruebas `incidentesService.test.ts`, `misionesService.test.ts`, los fixes de servicios/cleanup de `KanbanBoard.tsx:113` y el saneamiento de ESLint de `origin/develop`.

### 2.2. `BUG-H37-WEB-06` (Severidad: Media — `ABIERTO` — Nuevo en Re-Test) — Regresión visual: doble distintivo `"Verificado"` renderizado en `IncidenteCard` cuando `incidente.verificado` es `true`
- **Archivos afectados:**
  - `src/components/mando/IncidenteCard.tsx` (líneas 35, 69–78 y 107–130)
  - `src/components/mando/__tests__/IncidenteCard.test.tsx` (líneas 167–186 y 214–226)
- **Descripción técnica:**
  Al fusionar `IncidenteCard.tsx` con `develop`, quedaron activas simultáneamente dos implementaciones independientes para el distintivo `"Verificado"` dentro de la misma tarjeta:
  1. En `cardTopRow` (líneas 69–78): `{estaVerificado && (<span className={styles.badgeVerificado} title="Diagnóstico técnico en terreno finalizado por patrulla" data-testid="badge-verificado"><CheckCircle2 size={11} aria-hidden="true" /><span>Verificado</span></span>)}`, donde `const estaVerificado = Boolean(incidente.verificado);` (línea 35).
  2. En `cardMetaTags` (líneas 107–130): `{(incidente.reclasificadoEnTerreno || incidente.verificado) && (<span ... title={incidente.justificacionReclasificacion ? ... : ...}><CheckCircle2 ... /><span>Verificado</span></span>)}`.
  Cuando un incidente proviene desde `GET /api/incidentes` con `verificado: true` (caso normal tras completar evaluación en terreno, paginar o refrescar el tablero, evaluado en `TC-H37-WEB-04`), ambas condiciones evalúan a `true` y la tarjeta exhibe **dos badges idénticos `"Verificado"` en filas distintas**. La prueba unitaria `IncidenteCard.test.tsx:214-226` no detectó la regresión porque utiliza `screen.getByTitle(/Tipología rectificada por patrulla en terreno/i)` en lugar de verificar unicidad textual (`screen.getAllByText('Verificado')`).
- **Pasos para reproducir:**
  1. Renderizar `IncidenteCard` con `incidente={{ ...mockIncidente, verificado: true, reclasificadoEnTerreno: false }}` (o `verificado: true, reclasificadoEnTerreno: true`).
  2. Inspeccionar el DOM resultante o ejecutar `screen.getAllByText('Verificado')`.
- **Comportamiento esperado:** La tarjeta muestra un único distintivo `"Verificado"` con estilo municipal plano, `data-testid="badge-verificado"` y el tooltip contextual más específico disponible (priorizando `justificacionReclasificacion` cuando exista reclasificación en terreno).
- **Comportamiento actual:** Se renderizan dos etiquetas `<span>Verificado</span>` duplicadas en la misma tarjeta (una en `cardTopRow` y otra en `cardMetaTags`).
- **Recomendación técnica:** Unificar ambos bloques en un único badge condicional bajo `(estaVerificado || Boolean(incidente.reclasificadoEnTerreno))` en `IncidenteCard.tsx` (conservando `data-testid="badge-verificado"` y el tooltip enriquecido con `justificacionReclasificacion` cuando aplique), y reforzar `IncidenteCard.test.tsx` con `expect(screen.getAllByText('Verificado')).toHaveLength(1)` tanto para `verificado: true` como para `verificado: true, reclasificadoEnTerreno: true`.

### 2.3. `BUG-H37-WEB-01` (Severidad: Crítica — `CORREGIDO`) — Falso positivo de verificación (`verificado: true` / `reclasificadoEnTerreno: true`) y doble incremento de `totalMisiones`
- **Solución verificada en Re-Test (`18/11/2026`):**
  1. En `src/hooks/useIncidentesKanban.ts` (líneas 433–467), `handleIncidenteActualizado` determina `esEventoReclasificacion` únicamente cuando el payload contiene `justificacion` no vacía, `tipoIncidenteId`, o un cambio efectivo de `tipoAfectacion`, preservando `verificado` y `reclasificadoEnTerreno` previos ante eventos ordinarios de transición de estado (`VERIFICANDO`, `EN_ATENCION`).
  2. Asimismo, `handleIncidenteActualizado` limpia `tieneMisionDespachada: false` e incrementa `totalMisiones` solo cuando no existía misión previa contabilizada (`!yaContabaMision`), mientras que `ejecutarConsulta` (líneas 246–277) deduplica IDs al corregir `tieneMisionEnCurso` desde `REPORTADO` hacia `VERIFICANDO` y actualiza los contadores de `paginacionColumna`.
  3. En `src/components/mando/IncidenteDetalleDrawer.tsx` (líneas 274–290), el listener de socket aplica la misma guarda `esEventoReclasificacion` antes de marcar `reclasificadoEnTerreno: true` o `verificado: true`.
  4. Validado dinámicamente mediante el test de regresión `BUG-H37-WEB-01: NO debe marcar verificado ni reclasificadoEnTerreno ni duplicar totalMisiones ante incidente:actualizado sin reclasificación` en `src/hooks/__tests__/useIncidentesKanban.test.ts` (`7/7 passed`).

### 2.4. `BUG-H37-WEB-02` (Severidad: Alta — `CORREGIDO`) — Desincronización de contrato OpenAPI, extensión manual en `incidentesService.ts`, `fetch` directo en KPIs y filtro estático en `KanbanFiltros.tsx`
- **Solución verificada en Re-Test (`18/11/2026`):**
  1. `src/types/api-generated.d.ts` fue regenerado incluyendo `PATCH /api/incidentes/{id}/tipologia`, `GET /api/incidentes/tipos?catalogo=true`, `verificado: boolean`, `reclasificadoEnTerreno`, `justificacionReclasificacion?: string | null`, `tieneMisionDespachada?: boolean`, `tieneMisionEnCurso?: boolean` y `trazabilidadNotificacion`.
  2. `src/services/incidentesService.ts` eliminó las intersecciones manuales de `IncidenteResumen`/`IncidenteDetalle` y migró `obtenerKpis` a `apiClient.GET('/api/incidentes/kpis', ...)` usando proxy relativo y cabeceras gestionadas por el cliente tipado.
  3. `src/components/mando/KanbanFiltros.tsx` (líneas 66–82) reemplazó el arreglo estático por la consulta dinámica `obtenerTiposAfectacion()` (`GET /api/incidentes/tipos`), manteniendo la lista alineada al catálogo oficial de `sgrai-api`.

### 2.5. `BUG-H37-WEB-04` (Severidad: Media — `CORREGIDO`) — Errores bloqueantes ESLint y advertencia `exhaustive-deps` en archivos de HU-37
- **Solución verificada en Re-Test (`18/11/2026`):**
  1. `src/components/mando/IncidentesKpiCards.tsx` eliminó `isMounted`/`setIsMounted` en `useEffect`, conservando `suppressHydrationWarning`.
  2. `src/hooks/__tests__/useIncidentesKanban.test.ts` tipó explícitamente los callbacks de `socketCallbacks` eliminando los 3 usos de `any`.
  3. `src/hooks/useIncidentesKanban.ts` almacenó `onMisionRechazada` mediante `onMisionRechazadaRef`, eliminando la advertencia `react-hooks/exhaustive-deps`.
  4. Al ejecutar `npx eslint` sobre los `16` archivos de HU-37 se obtuvo `Exit code: 0` (`0` errores y `0` advertencias), y la ejecución global `npm run lint` finalizó con `Exit code: 0` (`0` errores; las `11` advertencias residuales pertenecen a archivos no relacionados de `develop` omitidos por `BUG-H37-WEB-03`).

### 2.6. `BUG-H37-WEB-05` (Severidad: Media — `CORREGIDO`) — Hito `TIPOLOGIA_RECLASIFICADA` más antiguo, regex multilínea y fuga de estado previo en `IncidenteDetalleDrawer`
- **Solución verificada en Re-Test (`18/11/2026`):**
  1. `src/components/mando/mision/MisionReportesSection.tsx` (líneas 54–63) obtiene el hito de reclasificación más reciente mediante `[...bitacora].reverse().find((h) => h.hito === 'TIPOLOGIA_RECLASIFICADA')` y extrae justificaciones multilínea mediante `/Justificación:\s*([\s\S]+)$/i`. *(Nota de cobertura recomendada: añadir un caso unitario específico con justificación multilínea y 2 hitos en `MisionDetalleModal.test.tsx`).*
  2. `src/components/mando/IncidenteDetalleDrawer.tsx` (líneas 81, 99, 104, 118 y 522) ejecuta `setDetalle(null)` al cerrar el drawer, iniciar carga de otro incidente o recibir respuesta fallida, e incorpora `key={detalle.id}` en `IncidenteMisionesSection`.
  3. Validado dinámicamente mediante el test de regresión `BUG-H37-WEB-05: limpia el detalle previo cuando se cambia a otro incidente cuya consulta retorna error 403` en `src/components/mando/__tests__/IncidenteDetalleDrawer.test.tsx` (`16/16 passed`).

---

## 3. Matriz Consolidada de Casos de Prueba (13 Columnas)

| ID Caso | Título del Caso de Prueba | Tipo de Prueba | Nivel | Prioridad | Precondición | Datos de Prueba (Payload / Headers / Query) | Resultado Esperado | Resultado Obtenido | Estado | Fecha / Hora Ejecución | Fecha / Hora Re-Test | Solución / Commit |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **BUG-H37-WEB-03** | Desincronización parcial respecto a `origin/develop`: 1 conflicto en `src/services/incidentesService.ts` y omisión de 5 commits posteriores de seguridad/lint | Integración Git / Regresión | Repositorio | Alta | Rama `feature/h37-patrulla-categorizar-incidente` comparada contra `origin/develop` tras `bae034d`. | `git merge-tree --write-tree origin/develop HEAD` y `git log HEAD..origin/develop --oneline` | Fusión limpia sin conflictos, conservación íntegra de `incidentesService.test.ts`, `misionesService.test.ts`, fixes JWT en servicios, `KanbanBoard.tsx:113` y `0` warnings ESLint globales. | Re-Test 18/11: redujo de `13` a `1` conflicto (`src/services/incidentesService.ts`), pero fusionó un `develop` desactualizado omitiendo `5` commits de `origin/develop` (`misionesService.test.ts` `-145`, `incidentesService.test.ts` `-81`, `11` warnings globales). | **ABIERTO** | 17/11/2026 00:15 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| **BUG-H37-WEB-06** | Regresión visual por doble renderizado de etiqueta `"Verificado"` en `IncidenteCard` cuando `incidente.verificado` es `true` | Regresión Visual / UI (CA-6) | Componente | Media | Tarjeta `IncidenteCard` hidratada desde API o actualizada tras verificación (`verificado: true`). | Props `incidente={{ ...mockIncidente, verificado: true, reclasificadoEnTerreno: false }}` y `{ verificado: true, reclasificadoEnTerreno: true }` | Renderizado único del distintivo `"Verificado"` en la tarjeta con tooltip contextual prioritario de reclasificación. | Re-Test 18/11: coexisten el badge `badge-verificado` en `cardTopRow` (`líneas 69-78`) y el badge `"Verificado"` en `cardMetaTags` (`líneas 107-130`), renderizando dos chips idénticos en la misma tarjeta. | **ABIERTO** | 18/11/2026 14:47 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| **TC-H37-WEB-04** | Persistencia del chip `"Verificado"` único en `IncidenteCard` cuando `verificado: true` proviene desde el servidor al paginar o refrescar | Funcional / Persistencia | Componente | Alta | Tarjeta `IncidenteCard` hidratada desde `GET /api/incidentes` tras paginación o recarga (`verificado: true`, `reclasificadoEnTerreno: false`). | Props `incidente={{ ...mockIncidente, verificado: true, reclasificadoEnTerreno: false }}` | Se exhibe exactamente un chip `"Verificado"` visible en la tarjeta sin duplicación tras refrescar o paginar el tablero. | Re-Test 18/11: el test automático pasa por consultar `getByTitle`, pero la inspección de `IncidenteCard.tsx` (`líneas 69-78` y `107-130`) constata el renderizado duplicado de dos chips `"Verificado"` (`BUG-H37-WEB-06`). | **FALLIDO** | 17/11/2026 00:15 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| **BUG-H37-WEB-01** | Falso positivo de verificación (`verificado: true` / `reclasificadoEnTerreno: true`) ante evento `incidente:actualizado` sin reclasificación y doble incremento de `totalMisiones` | Reactividad / Regla ICS (CA-6) | Hook / Componente | Crítica | Incidente en `REPORTADO` (`totalMisiones: 1`, `tieneMisionDespachada: true`, `verificado: false`) que transita a `VERIFICANDO` tras aceptación de misión. | Evento Socket `incidente:actualizado` `{ datos: { id: 'inc-1', codigo: 'INC-01', nuevoEstado: 'VERIFICANDO', prioridad: 'MEDIA' } }` sin `tipoAfectacion` ni `justificacion` | El incidente pasa a `VERIFICANDO` manteniendo `verificado: false`, `reclasificadoEnTerreno: false` y `totalMisiones: 1`; `IncidenteDetalleDrawer` no muestra el bloque de reclasificación. | Re-Test 18/11: `useIncidentesKanban.ts` y `IncidenteDetalleDrawer.tsx` validan `esEventoReclasificacion`, preservan valores previos y deduplican con `paginacionColumna`; test `BUG-H37-WEB-01` aprobado (`7/7 passed`). | **CORREGIDO** | 17/11/2026 00:15 | 18/11/2026 14:47 | fix(h37): sincronizar develop y resolver hallazgos de QA (BUG-H37-WEB-01..05) |
| **BUG-H37-WEB-02** | Desincronización de contrato OpenAPI (`api-generated.d.ts`), extensión manual sin `null` en `incidentesService.ts`, `fetch` directo en KPIs y filtro estático desalineado en `KanbanFiltros.tsx` | Contrato OpenAPI / Funcional (CA-2) | Tipos / Servicio / UI | Alta | Inspección de `src/types/api-generated.d.ts`, `src/services/incidentesService.ts` y `src/components/mando/KanbanFiltros.tsx`. | Contrato `GET /api/incidentes`, `GET /api/incidentes/{id}`, `PATCH /api/incidentes/{id}/tipologia` y `GET /api/incidentes/tipos?catalogo=true` | Tipos generados íntegramente desde OpenAPI sin intersecciones manuales, `obtenerKpis` sobre `apiClient` y `KanbanFiltros` poblado desde `GET /api/incidentes/tipos`. | Re-Test 18/11: `api-generated.d.ts` regenerado con rutas/campos HU-37, eliminadas extensiones manuales, `obtenerKpis` migrado a `apiClient.GET` y `KanbanFiltros.tsx` consulta `obtenerTiposAfectacion()`. | **CORREGIDO** | 17/11/2026 00:15 | 18/11/2026 14:47 | fix(h37): sincronizar develop y resolver hallazgos de QA (BUG-H37-WEB-01..05) |
| **BUG-H37-WEB-04** | Errores bloqueantes en análisis estático ESLint (`4` errores) y advertencia `react-hooks/exhaustive-deps` en `useIncidentesKanban.ts` | Calidad de Código / CI | Estático / Hook | Media | Ejecución de linter institucional sobre archivos HU-37 y repositorio completo. | Comando `npm run lint` y `npx eslint` sobre los 16 archivos de HU-37 | `0` errores bloqueantes en ESLint y `0` advertencias en archivos modificados por HU-37. | Re-Test 18/11: eliminados `setIsMounted`, `any` en test y `optionsObj` mediante `onMisionRechazadaRef`. `npx eslint` en archivos HU-37 retorna `0` problemas (`npm run lint` exit code `0`). | **CORREGIDO** | 17/11/2026 00:15 | 18/11/2026 14:47 | fix(h37): sincronizar develop y resolver hallazgos de QA (BUG-H37-WEB-01..05) |
| **BUG-H37-WEB-05** | Selección del hito `TIPOLOGIA_RECLASIFICADA` más antiguo, fallo regex en justificación multilínea en `MisionReportesSection.tsx` y fuga de estado previo en `IncidenteDetalleDrawer.tsx` | Borde / UI / Estado (CA-5) | Componente | Media | Misión con 2 reclasificaciones o justificación con `\n`; o apertura secuencial de incidente `A` y error en carga de incidente `B`. | `bitacora` ascendente con 2 hitos `TIPOLOGIA_RECLASIFICADA` y salto `\n`; cambio `incidenteId` de `A` a `B` con respuesta `403` | `MisionReportesSection` muestra el hito más reciente extrayendo texto multilínea; `IncidenteDetalleDrawer` limpia `detalle` al cerrar o fallar y reinicia sección con `key`. | Re-Test 18/11: `MisionReportesSection.tsx` usa `[...bitacora].reverse().find(...)` y `/Justificación:\s*([\s\S]+)$/i`; `IncidenteDetalleDrawer` limpia `setDetalle(null)` con `key={detalle.id}` (`BUG-H37-WEB-05` `passed`). | **CORREGIDO** | 17/11/2026 00:15 | 18/11/2026 14:47 | fix(h37): sincronizar develop y resolver hallazgos de QA (BUG-H37-WEB-01..05) |
| **TC-H37-WEB-01** | Suscripción a salas WebSocket y normalización de payload `incidente:actualizado` con `tipoIncidenteId`, `tipoAfectacion` y `justificacion` en `useEncargadoKanbanSocket` | Tiempo Real / WebSocket (CA-6) | Unitario / Hook | Crítica | Montaje de `useEncargadoKanbanSocket` con cliente Socket.io mockeado en Vitest. | Evento `incidente:actualizado` con `{ id: '5000...-0001', codigo: 'INC-2026-001', nuevoEstado: 'VERIFICANDO', prioridad: 'ALTA', tipoIncidenteId: '4000...-0001', tipoAfectacion: 'Inundación', justificacion: 'Tras evaluación...' }` | Normaliza el payload conservando los campos de reclasificación, invoca `onIncidenteActualizado` y actualiza `ultimoEvento` con mensaje amigable en español. | Re-Test 18/11: `useEncargadoKanbanSocket.test.ts` aprueba los 7 tests (`7/7 passed`), verificando normalización y texto `'Tipología reclasificada: INC-2026-001 a Inundación (Prioridad: Alta)'`. | **APROBADO** | 17/11/2026 00:15 | 18/11/2026 14:47 | feat(kanban): actualizar tipología, prioridad y justificación reactivamente vía websocket (#39) |
| **TC-H37-WEB-02** | Actualización reactiva en memoria de tipología, prioridad y justificación en la tarjeta del tablero Kanban ante evento `incidente:actualizado` | Reactividad UI (CA-6) | Integración / Hook | Crítica | Tablero Kanban cargado con incidente en `VERIFICANDO` tipificado inicialmente como `'Anegamiento menor'` y prioridad `'BAJA'`. | Callback `onIncidenteActualizado` con `tipoAfectacion: 'Inundación'`, `prioridad: 'ALTA'`, `justificacion: 'Tras evaluación presencial...'` | La tarjeta en `columnas.VERIFICANDO` actualiza al instante `tipoAfectacion`, `prioridad`, `reclasificadoEnTerreno: true` y `justificacionReclasificacion`. | Re-Test 18/11: `useIncidentesKanban.test.ts` verifica la mutación inmutable y actualización reactiva inmediata en memoria (`7/7 passed`). | **APROBADO** | 17/11/2026 00:15 | 18/11/2026 14:47 | feat(kanban): actualizar tipología, prioridad y justificación reactivamente vía websocket (#39) |
| **TC-H37-WEB-03** | Renderizado del distintivo `"Verificado"` con ícono `CheckCircle2` y tooltip con justificación en `IncidenteCard` ante `reclasificadoEnTerreno: true` | Funcional / UI (CA-6) | Componente | Alta | Tarjeta `IncidenteCard` actualizada en vivo con `reclasificadoEnTerreno: true` y `justificacionReclasificacion` (`verificado: false`). | Props `incidente={{ ...mockIncidente, tipoAfectacion: 'Inundación', prioridad: 'ALTA', reclasificadoEnTerreno: true, justificacionReclasificacion: 'Desborde...' }}` | Muestra la nueva tipología `'Inundación'`, prioridad legible `'Alta'` y chip `'Verificado'` con `title` conteniendo la justificación presencial. | Re-Test 18/11: `IncidenteCard.test.tsx` valida `'Inundación'`, `'Alta'`, `'Verificado'` y el contenido del tooltip de justificación en `14/14` pruebas passing. | **APROBADO** | 17/11/2026 00:15 | 18/11/2026 14:47 | feat(mando): estilizar discretamente verificacion, registrar reclasificacion en bitacora e informes y eliminar enums (HU-37) |
| **TC-H37-WEB-05** | Despliegue de franja informativa en vivo en `KanbanBoard` ante reclasificación presencial | Funcional / UX (CA-6) | Componente | Media | `KanbanBoard` montado con `ultimoEvento` no nulo proveniente de `useIncidentesKanban`. | `ultimoEvento = 'Tipología reclasificada: INC-2026-001 a Inundación (Prioridad: Alta)'` | La franja superior exhibe el ícono `Zap` y el texto `"Actualización en vivo: Tipología reclasificada: INC-2026-001 a Inundación (Prioridad: Alta)"`. | Re-Test 18/11: verificado en `KanbanBoard.tsx` (líneas `304–321`) y `useEncargadoKanbanSocket.ts` (líneas `199–202`). | **APROBADO** | 17/11/2026 00:15 | 18/11/2026 14:47 | feat(kanban): actualizar tipología, prioridad y justificación reactivamente vía websocket (#39) |
| **TC-H37-WEB-06** | Visualización del bloque `"Reclasificación Técnica en Terreno"` en `IncidenteResumenSection` dentro de `IncidenteDetalleDrawer` | Funcional / UI (CA-5 / CA-6) | Componente | Alta | `IncidenteDetalleDrawer` cargado con incidente que posee `reclasificadoEnTerreno: true` y `justificacionReclasificacion`. | Respuesta mock de `obtenerDetalleIncidente` con `tipoAfectacion: 'Inundación Mayor'`, `prioridad: 'CRITICA'`, `justificacionReclasificacion: 'Desborde de río...'` | Se despliega `bloque-reclasificacion-terreno` con tipología constatada y justificación de la patrulla junto a los badges `'Estado: En atención'` y `'Prioridad: Crítica'`. | Re-Test 18/11: `IncidenteDetalleDrawer.test.tsx` valida el bloque `bloque-reclasificacion-terreno` sin atributos fuera del esquema OpenAPI (`16/16 passed`). | **APROBADO** | 17/11/2026 00:15 | 18/11/2026 14:47 | feat(ui): reflejar reclasificación en terreno en tarjeta kanban y drawer de detalle |
| **TC-H37-WEB-07** | Sincronización en vivo de `IncidenteDetalleDrawer` al recibir `incidente:actualizado` con reclasificación mientras el panel permanece abierto | Tiempo Real / WebSocket (CA-6) | Componente | Alta | `IncidenteDetalleDrawer` abierto mostrando el `incidenteId` afectado al momento de recibirse la reclasificación desde terreno. | Evento Socket `incidente:actualizado` `{ datos: { id: incidenteId, tipoIncidenteId, tipoAfectacion, prioridad, nuevoEstado, justificacion } }` | El estado interno `detalle` actualiza `tipoAfectacion`, `prioridad`, `estado`, `tipoIncidenteId`, `reclasificadoEnTerreno` y `justificacionReclasificacion` sin cerrar el panel. | Re-Test 18/11: verificado en `IncidenteDetalleDrawer.tsx` (líneas `250–298`) con guarda `esEventoReclasificacion`. | **APROBADO** | 17/11/2026 00:15 | 18/11/2026 14:47 | feat(ui): reflejar reclasificación en terreno en tarjeta kanban y drawer de detalle |
| **TC-H37-WEB-08** | Eliminación de enums crudos mediante utilidades `formatearEstado`, `formatearPrioridad`, `formatearHitoBitacora`, `formatearTipoMision` y `obtenerChipEstadoMision` | Calidad UX / Unitario | Utilidad | Media | Invocación de formateadores institucionales en `src/lib/utils/estadoUtils.ts`. | Entradas `'VERIFICANDO'`, `'CRITICA'`, `'TIPOLOGIA_RECLASIFICADA'`, `'VERIFICACION'`, `'EN_CURSO'`, `null`, `''` | Retorna `'En verificación'`, `'Crítica'`, `'Tipología reclasificada en terreno'`, `'Verificación en terreno'`, chip `'En curso'` y fallbacks seguros. | Re-Test 18/11: `estadoUtils.test.ts` aprueba los `12` tests unitarios (`12/12 passed`) en `12 ms`. | **APROBADO** | 17/11/2026 00:15 | 18/11/2026 14:47 | feat(utils): incorporar formateadores amigables de estados, prioridades e hitos operativos |
| **TC-H37-WEB-09** | Visualización del hito `TIPOLOGIA_RECLASIFICADA` como `"Tipología reclasificada en terreno"` en bitácora y sincronización de título en `MisionDetalleHeader` | Funcional / UI (CA-5) | Componente | Alta | `MisionDetalleModal` cargado con misión `VERIFICACION` cuyo historial incluye el hito `TIPOLOGIA_RECLASIFICADA`. | `bitacoraTiempos: [{ hito: 'TIPOLOGIA_RECLASIFICADA', descripcion: 'Tipología reclasificada en terreno a: Corte de agua potable. Justificación: ...' }]` | La cabecera muestra `'Verificación: Corte de agua potable - INC-592395-562'` con chips legibles (`'Verificación en terreno'`, `'Media'`) y la bitácora traduce el hito sin enums. | Re-Test 18/11: `MisionDetalleModal.test.tsx` valida el formateo amigable del hito, tipo, estado y prioridad (`12/12 passed`). | **APROBADO** | 17/11/2026 00:15 | 18/11/2026 14:47 | feat(mando): estilizar discretamente verificacion, registrar reclasificacion en bitacora e informes y eliminar enums (HU-37) |
| **TC-H37-WEB-10** | Renderizado e interacción accesible (colapsar/desplegar) del informe técnico `"Evaluación en Terreno Realizada"` en `MisionReportesSection` | Funcional / A11y (CA-5) | Componente | Media | Misión con hito `TIPOLOGIA_RECLASIFICADA` de una sola línea abierto en `MisionDetalleModal`. | `patrulla: { nombre: 'papappap', lider: { nombre: 'Cristóbal Felipe Veas Huequemán' } }`, `incidente.tipoAfectacion: 'Corte de agua potable'` | Tarjeta `reporte-verificacion-reclasificacion` inicia desplegada (`aria-expanded="true"`), extrae la justificación y alterna su visibilidad al hacer clic. | Re-Test 18/11: `MisionDetalleModal.test.tsx` valida el contenido técnico de la tarjeta y la conmutación `aria-expanded="true"` ↔ `"false"`. | **APROBADO** | 17/11/2026 00:15 | 18/11/2026 14:47 | feat(mando): homogeneizar bitacora, hacer reportes desplegables y agrupar misiones rechazadas en incidente |
| **TC-H37-WEB-11** | Priorización de misiones activas y agrupación en acordeón colapsado de misiones rechazadas en `IncidenteMisionesSection` | Funcional / UI | Componente | Media | Incidente con misiones activas (`EN_CURSO`) y misiones rechazadas (`RECHAZADA`) en `IncidenteMisionesSection`. | `misiones={[misionRechazada1, misionRechazada2, misionEnCurso]}` | Ordena la misión en curso primero, agrupa los 2 rechazos en un acordeón inicialmente colapsado (`aria-expanded="false"`) y los despliega al hacer clic. | Re-Test 18/11: `IncidenteMisionesSection.test.tsx` aprueba los `15` escenarios consolidados tras integrar HU-35 (`15/15 passed`). | **APROBADO** | 17/11/2026 00:15 | 18/11/2026 14:47 | feat(mando): homogeneizar bitacora, hacer reportes desplegables y agrupar misiones rechazadas en incidente |
| **TC-H37-WEB-12** | Control de botón `"Confirmación Pendiente"` en `REPORTADO` (`tieneMisionDespachada: true`) y saneamiento de `tieneMisionEnCurso: true` hacia `VERIFICANDO` | Regla Operativa | Hook / Componente | Alta | Tarjeta en `REPORTADO` con misión despachada pendiente o con misión ya en curso proveniente de API. | `tieneMisionDespachada: true` en `IncidenteCard`; `tieneMisionEnCurso: true` en `useIncidentesKanban` | En `IncidenteCard`, reemplaza `"Asignar Patrulla"` por `"Confirmación Pendiente"` deshabilitado; en el hook, reubica el incidente con `tieneMisionEnCurso: true` en `VERIFICANDO`. | Re-Test 18/11: verificado en `IncidenteCard.test.tsx` (`14/14 passed`) y `useIncidentesKanban.test.ts` (`7/7 passed`). | **APROBADO** | 17/11/2026 00:15 | 18/11/2026 14:47 | fix(mando): ubicar incidentes en curso en verificacion, bloquear asignacion duplicada y resolver hydration mismatch |
| **TC-H37-WEB-13** | Manejo de evento `mision:rechazada` con deduplicación temporal, reseteo de `tieneMisionDespachada` y retorno en `REPORTADO` | Tiempo Real / WebSocket | Hook / UI | Alta | Incidente en `REPORTADO` con `tieneMisionDespachada: true` al recibirse `mision:rechazada` vía Socket.io. | Payload `mision:rechazada` `{ misionId: 'mis-rechazada-1', codigo: 'MIS-2026-0099', motivo: 'Patrulla sin vehículo...', incidenteId: 'inc-h69-2' }` | `useIncidentesKanban` restablece `tieneMisionDespachada: false` permitiendo reasignar e invoca `onMisionRechazada` (Toast de advertencia en `KanbanBoard`). | Re-Test 18/11: verificado en `useIncidentesKanban.test.ts`, `KanbanBoard.tsx` (líneas `68–95`) y `useEncargadoKanbanSocket.ts`. | **APROBADO** | 17/11/2026 00:15 | 18/11/2026 14:47 | feat(kanban): sincronizar estados de despacho y rechazo manteniendo incidentes en REPORTADO hasta confirmacion (H69) |
| **TC-H37-WEB-14** | Generación de tipos de rutas Next.js (`next typegen`), chequeo estático TypeScript (`tsc --noEmit`) y build de producción (`npm run build`) | Compilación / Build | Sistema | Crítica | Ejecución en rama `feature/h37-patrulla-categorizar-incidente` con dependencias instaladas. | `npx next typegen && npx tsc --noEmit && npm run build` | `0` errores TypeScript en `src/` y `.next/types`, y generación completa de artefactos de producción en `next build`. | Re-Test 18/11: `next typegen` exitoso, `tsc --noEmit` exit code `0` y `npm run build` (Webpack) compila `47` rutas en `4.7 s` (TS `2.5 s`, páginas estáticas `47/47` en `1067 ms`). | **APROBADO** | 17/11/2026 00:15 | 18/11/2026 14:47 | fix(h37): sincronizar develop y resolver hallazgos de QA (BUG-H37-WEB-01..05) |
| **TC-H37-WEB-15** | Cumplimiento de guía visual municipal (`GEMINI.md § 3`: bordes `0px`, paleta oficial, iconografía `lucide-react` sin emojis) y manual `H37-actualizacion-tipologia-kanban.md` | Estándar / Documentación | UI / Docs | Media | Revisión del diff en `src/` y `docs/manuals/H37-actualizacion-tipologia-kanban.md`. | Inspección de `borderRadius`, tokens CSS, íconos `lucide-react` y secciones del manual H37 | Cero emojis, esquinas rectas `0px`, uso de tokens `--color-primary-teal` / `--color-info-bg` / `--color-danger` y manual completo para Encargado. | Re-Test 18/11: iconografía `lucide-react` sin emojis, bordes `0px`, tokens institucionales y manual publicado en `docs/manuals/H37-actualizacion-tipologia-kanban.md`. | **APROBADO** | 17/11/2026 00:15 | 18/11/2026 14:47 | docs(manuals): documentar reclasificación presencial en tablero kanban (HU-37) |

---

## 4. Bloque TSV

````tsv
ID Caso	Título del Caso de Prueba	Tipo de Prueba	Nivel	Prioridad	Precondición	Datos de Prueba (Payload / Headers / Query)	Resultado Esperado	Resultado Obtenido	Estado	Fecha / Hora Ejecución	Fecha / Hora Re-Test	Solución / Commit
BUG-H37-WEB-03	Desincronización parcial respecto a origin/develop: 1 conflicto en src/services/incidentesService.ts y omisión de 5 commits posteriores de seguridad/lint	Integración Git / Regresión	Repositorio	Alta	Rama feature/h37-patrulla-categorizar-incidente comparada contra origin/develop tras bae034d.	git merge-tree --write-tree origin/develop HEAD y git log HEAD..origin/develop --oneline	Fusión limpia sin conflictos, conservación íntegra de incidentesService.test.ts, misionesService.test.ts, fixes JWT en servicios, KanbanBoard.tsx:113 y 0 warnings ESLint globales.	Re-Test 18/11: redujo de 13 a 1 conflicto (src/services/incidentesService.ts), pero fusionó un develop desactualizado omitiendo 5 commits de origin/develop (misionesService.test.ts -145, incidentesService.test.ts -81, 11 warnings globales).	ABIERTO	17/11/2026 00:15	(Pendiente)	Pendiente (Rechazado en Code Review)
BUG-H37-WEB-06	Regresión visual por doble renderizado de etiqueta Verificado en IncidenteCard cuando incidente.verificado es true	Regresión Visual / UI (CA-6)	Componente	Media	Tarjeta IncidenteCard hidratada desde API o actualizada tras verificación (verificado: true).	Props incidente con verificado: true y reclasificadoEnTerreno: false / true	Renderizado único del distintivo Verificado en la tarjeta con tooltip contextual prioritario de reclasificación.	Re-Test 18/11: coexisten el badge badge-verificado en cardTopRow (líneas 69-78) y el badge Verificado en cardMetaTags (líneas 107-130), renderizando dos chips idénticos en la misma tarjeta.	ABIERTO	18/11/2026 14:47	(Pendiente)	Pendiente (Rechazado en Code Review)
TC-H37-WEB-04	Persistencia del chip Verificado único en IncidenteCard cuando verificado: true proviene desde el servidor al paginar o refrescar	Funcional / Persistencia	Componente	Alta	Tarjeta IncidenteCard hidratada desde GET /api/incidentes tras paginación o recarga (verificado: true, reclasificadoEnTerreno: false).	Props incidente={{ ...mockIncidente, verificado: true, reclasificadoEnTerreno: false }}	Se exhibe exactamente un chip Verificado visible en la tarjeta sin duplicación tras refrescar o paginar el tablero.	Re-Test 18/11: el test automático pasa por consultar getByTitle, pero la inspección de IncidenteCard.tsx (líneas 69-78 y 107-130) constata el renderizado duplicado de dos chips Verificado (BUG-H37-WEB-06).	FALLIDO	17/11/2026 00:15	(Pendiente)	Pendiente (Rechazado en Code Review)
BUG-H37-WEB-01	Falso positivo de verificación (verificado: true / reclasificadoEnTerreno: true) ante evento incidente:actualizado sin reclasificación y doble incremento de totalMisiones	Reactividad / Regla ICS (CA-6)	Hook / Componente	Crítica	Incidente en REPORTADO (totalMisiones: 1, tieneMisionDespachada: true, verificado: false) que transita a VERIFICANDO tras aceptación de misión.	Evento Socket incidente:actualizado { datos: { id: 'inc-1', codigo: 'INC-01', nuevoEstado: 'VERIFICANDO', prioridad: 'MEDIA' } } sin tipoAfectacion ni justificacion	El incidente pasa a VERIFICANDO manteniendo verificado: false, reclasificadoEnTerreno: false y totalMisiones: 1; IncidenteDetalleDrawer no muestra el bloque de reclasificación.	Re-Test 18/11: useIncidentesKanban.ts y IncidenteDetalleDrawer.tsx validan esEventoReclasificacion, preservan valores previos y deduplican con paginacionColumna; test BUG-H37-WEB-01 aprobado (7/7 passed).	CORREGIDO	17/11/2026 00:15	18/11/2026 14:47	fix(h37): sincronizar develop y resolver hallazgos de QA (BUG-H37-WEB-01..05)
BUG-H37-WEB-02	Desincronización de contrato OpenAPI (api-generated.d.ts), extensión manual sin null en incidentesService.ts, fetch directo en KPIs y filtro estático desalineado en KanbanFiltros.tsx	Contrato OpenAPI / Funcional (CA-2)	Tipos / Servicio / UI	Alta	Inspección de src/types/api-generated.d.ts, src/services/incidentesService.ts y src/components/mando/KanbanFiltros.tsx.	Contrato GET /api/incidentes, GET /api/incidentes/{id}, PATCH /api/incidentes/{id}/tipologia y GET /api/incidentes/tipos?catalogo=true	Tipos generados íntegramente desde OpenAPI sin intersecciones manuales, obtenerKpis sobre apiClient y KanbanFiltros poblado desde GET /api/incidentes/tipos.	Re-Test 18/11: api-generated.d.ts regenerado con rutas/campos HU-37, eliminadas extensiones manuales, obtenerKpis migrado a apiClient.GET y KanbanFiltros.tsx consulta obtenerTiposAfectacion().	CORREGIDO	17/11/2026 00:15	18/11/2026 14:47	fix(h37): sincronizar develop y resolver hallazgos de QA (BUG-H37-WEB-01..05)
BUG-H37-WEB-04	Errores bloqueantes en análisis estático ESLint (4 errores) y advertencia react-hooks/exhaustive-deps en useIncidentesKanban.ts	Calidad de Código / CI	Estático / Hook	Media	Ejecución de linter institucional sobre archivos HU-37 y repositorio completo.	Comando npm run lint y npx eslint sobre los 16 archivos de HU-37	0 errores bloqueantes en ESLint y 0 advertencias en archivos modificados por HU-37.	Re-Test 18/11: eliminados setIsMounted, any en test y optionsObj mediante onMisionRechazadaRef. npx eslint en archivos HU-37 retorna 0 problemas (npm run lint exit code 0).	CORREGIDO	17/11/2026 00:15	18/11/2026 14:47	fix(h37): sincronizar develop y resolver hallazgos de QA (BUG-H37-WEB-01..05)
BUG-H37-WEB-05	Selección del hito TIPOLOGIA_RECLASIFICADA más antiguo, fallo regex en justificación multilínea en MisionReportesSection.tsx y fuga de estado previo en IncidenteDetalleDrawer.tsx	Borde / UI / Estado (CA-5)	Componente	Media	Misión con 2 reclasificaciones o justificación con salto de línea; o apertura secuencial de incidente A y error en carga de incidente B.	bitacora ascendente con 2 hitos TIPOLOGIA_RECLASIFICADA y salto de línea; cambio incidenteId de A a B con respuesta 403	MisionReportesSection muestra el hito más reciente extrayendo texto multilínea; IncidenteDetalleDrawer limpia detalle al cerrar o fallar y reinicia sección con key.	Re-Test 18/11: MisionReportesSection.tsx usa [...bitacora].reverse().find(...) y regex multilínea; IncidenteDetalleDrawer limpia setDetalle(null) con key={detalle.id} (BUG-H37-WEB-05 passed).	CORREGIDO	17/11/2026 00:15	18/11/2026 14:47	fix(h37): sincronizar develop y resolver hallazgos de QA (BUG-H37-WEB-01..05)
TC-H37-WEB-01	Suscripción a salas WebSocket y normalización de payload incidente:actualizado con tipoIncidenteId, tipoAfectacion y justificacion en useEncargadoKanbanSocket	Tiempo Real / WebSocket (CA-6)	Unitario / Hook	Crítica	Montaje de useEncargadoKanbanSocket con cliente Socket.io mockeado en Vitest.	Evento incidente:actualizado con id, codigo, nuevoEstado, prioridad ALTA, tipoIncidenteId, tipoAfectacion Inundación y justificacion	Normaliza el payload conservando los campos de reclasificación, invoca onIncidenteActualizado y actualiza ultimoEvento con mensaje amigable en español.	Re-Test 18/11: useEncargadoKanbanSocket.test.ts aprueba los 7 tests (7/7 passed), verificando normalización y texto Tipología reclasificada: INC-2026-001 a Inundación (Prioridad: Alta).	APROBADO	17/11/2026 00:15	18/11/2026 14:47	feat(kanban): actualizar tipología, prioridad y justificación reactivamente vía websocket (#39)
TC-H37-WEB-02	Actualización reactiva en memoria de tipología, prioridad y justificación en la tarjeta del tablero Kanban ante evento incidente:actualizado	Reactividad UI (CA-6)	Integración / Hook	Crítica	Tablero Kanban cargado con incidente en VERIFICANDO tipificado inicialmente como Anegamiento menor y prioridad BAJA.	Callback onIncidenteActualizado con tipoAfectacion: 'Inundación', prioridad: 'ALTA', justificacion: 'Tras evaluación presencial...'	La tarjeta en columnas.VERIFICANDO actualiza al instante tipoAfectacion, prioridad, reclasificadoEnTerreno: true y justificacionReclasificacion.	Re-Test 18/11: useIncidentesKanban.test.ts verifica la mutación inmutable y actualización reactiva inmediata en memoria (7/7 passed).	APROBADO	17/11/2026 00:15	18/11/2026 14:47	feat(kanban): actualizar tipología, prioridad y justificación reactivamente vía websocket (#39)
TC-H37-WEB-03	Renderizado del distintivo Verificado con ícono CheckCircle2 y tooltip con justificación en IncidenteCard ante reclasificadoEnTerreno: true	Funcional / UI (CA-6)	Componente	Alta	Tarjeta IncidenteCard actualizada en vivo con reclasificadoEnTerreno: true y justificacionReclasificacion (verificado: false).	Props incidente con tipoAfectacion Inundación, prioridad ALTA, reclasificadoEnTerreno true y justificacionReclasificacion	Muestra la nueva tipología Inundación, prioridad legible Alta y chip Verificado con title conteniendo la justificación presencial.	Re-Test 18/11: IncidenteCard.test.tsx valida Inundación, Alta, Verificado y el contenido del tooltip de justificación en 14/14 pruebas passing.	APROBADO	17/11/2026 00:15	18/11/2026 14:47	feat(mando): estilizar discretamente verificacion, registrar reclasificacion en bitacora e informes y eliminar enums (HU-37)
TC-H37-WEB-05	Despliegue de franja informativa en vivo en KanbanBoard ante reclasificación presencial	Funcional / UX (CA-6)	Componente	Media	KanbanBoard montado con ultimoEvento no nulo proveniente de useIncidentesKanban.	ultimoEvento = 'Tipología reclasificada: INC-2026-001 a Inundación (Prioridad: Alta)'	La franja superior exhibe el ícono Zap y el texto Actualización en vivo: Tipología reclasificada: INC-2026-001 a Inundación (Prioridad: Alta).	Re-Test 18/11: verificado en KanbanBoard.tsx (líneas 304-321) y useEncargadoKanbanSocket.ts (líneas 199-202).	APROBADO	17/11/2026 00:15	18/11/2026 14:47	feat(kanban): actualizar tipología, prioridad y justificación reactivamente vía websocket (#39)
TC-H37-WEB-06	Visualización del bloque Reclasificación Técnica en Terreno en IncidenteResumenSection dentro de IncidenteDetalleDrawer	Funcional / UI (CA-5 / CA-6)	Componente	Alta	IncidenteDetalleDrawer cargado con incidente que posee reclasificadoEnTerreno: true y justificacionReclasificacion.	Respuesta mock de obtenerDetalleIncidente con tipoAfectacion: 'Inundación Mayor', prioridad: 'CRITICA', justificacionReclasificacion: 'Desborde de río...'	Se despliega bloque-reclasificacion-terreno con tipología constatada y justificación de la patrulla junto a los badges Estado: En atención y Prioridad: Crítica.	Re-Test 18/11: IncidenteDetalleDrawer.test.tsx valida el bloque bloque-reclasificacion-terreno sin atributos fuera del esquema OpenAPI (16/16 passed).	APROBADO	17/11/2026 00:15	18/11/2026 14:47	feat(ui): reflejar reclasificación en terreno en tarjeta kanban y drawer de detalle
TC-H37-WEB-07	Sincronización en vivo de IncidenteDetalleDrawer al recibir incidente:actualizado con reclasificación mientras el panel permanece abierto	Tiempo Real / WebSocket (CA-6)	Componente	Alta	IncidenteDetalleDrawer abierto mostrando el incidenteId afectado al momento de recibirse la reclasificación desde terreno.	Evento Socket incidente:actualizado con id, tipoIncidenteId, tipoAfectacion, prioridad, nuevoEstado y justificacion	El estado interno detalle actualiza tipoAfectacion, prioridad, estado, tipoIncidenteId, reclasificadoEnTerreno y justificacionReclasificacion sin cerrar el panel.	Re-Test 18/11: verificado en IncidenteDetalleDrawer.tsx (líneas 250-298) con guarda esEventoReclasificacion.	APROBADO	17/11/2026 00:15	18/11/2026 14:47	feat(ui): reflejar reclasificación en terreno en tarjeta kanban y drawer de detalle
TC-H37-WEB-08	Eliminación de enums crudos mediante utilidades formatearEstado, formatearPrioridad, formatearHitoBitacora, formatearTipoMision y obtenerChipEstadoMision	Calidad UX / Unitario	Utilidad	Media	Invocación de formateadores institucionales en src/lib/utils/estadoUtils.ts.	Entradas VERIFICANDO, CRITICA, TIPOLOGIA_RECLASIFICADA, VERIFICACION, EN_CURSO, null, ''	Retorna En verificación, Crítica, Tipología reclasificada en terreno, Verificación en terreno, chip En curso y fallbacks seguros.	Re-Test 18/11: estadoUtils.test.ts aprueba los 12 tests unitarios (12/12 passed) en 12 ms.	APROBADO	17/11/2026 00:15	18/11/2026 14:47	feat(utils): incorporar formateadores amigables de estados, prioridades e hitos operativos
TC-H37-WEB-09	Visualización del hito TIPOLOGIA_RECLASIFICADA como Tipología reclasificada en terreno en bitácora y sincronización de título en MisionDetalleHeader	Funcional / UI (CA-5)	Componente	Alta	MisionDetalleModal cargado con misión VERIFICACION cuyo historial incluye el hito TIPOLOGIA_RECLASIFICADA.	bitacoraTiempos con hito TIPOLOGIA_RECLASIFICADA y descripcion 'Tipología reclasificada en terreno a: Corte de agua potable. Justificación: ...'	La cabecera muestra Verificación: Corte de agua potable - INC-592395-562 con chips legibles y la bitácora traduce el hito sin enums.	Re-Test 18/11: MisionDetalleModal.test.tsx valida el formateo amigable del hito, tipo, estado y prioridad (12/12 passed).	APROBADO	17/11/2026 00:15	18/11/2026 14:47	feat(mando): estilizar discretamente verificacion, registrar reclasificacion en bitacora e informes y eliminar enums (HU-37)
TC-H37-WEB-10	Renderizado e interacción accesible (colapsar/desplegar) del informe técnico Evaluación en Terreno Realizada en MisionReportesSection	Funcional / A11y (CA-5)	Componente	Media	Misión con hito TIPOLOGIA_RECLASIFICADA de una sola línea abierto en MisionDetalleModal.	patrulla con lider y tipoAfectacion Corte de agua potable	Tarjeta reporte-verificacion-reclasificacion inicia desplegada (aria-expanded='true'), extrae la justificación y alterna su visibilidad al hacer clic.	Re-Test 18/11: MisionDetalleModal.test.tsx valida el contenido técnico de la tarjeta y la conmutación aria-expanded true/false.	APROBADO	17/11/2026 00:15	18/11/2026 14:47	feat(mando): homogeneizar bitacora, hacer reportes desplegables y agrupar misiones rechazadas en incidente
TC-H37-WEB-11	Priorización de misiones activas y agrupación en acordeón colapsado de misiones rechazadas en IncidenteMisionesSection	Funcional / UI	Componente	Media	Incidente con misiones activas (EN_CURSO) y misiones rechazadas (RECHAZADA) en IncidenteMisionesSection.	misiones=[misionRechazada1, misionRechazada2, misionEnCurso]	Ordena la misión en curso primero, agrupa los 2 rechazos en un acordeón inicialmente colapsado (aria-expanded='false') y los despliega al hacer clic.	Re-Test 18/11: IncidenteMisionesSection.test.tsx aprueba los 15 escenarios consolidados tras integrar HU-35 (15/15 passed).	APROBADO	17/11/2026 00:15	18/11/2026 14:47	feat(mando): homogeneizar bitacora, hacer reportes desplegables y agrupar misiones rechazadas en incidente
TC-H37-WEB-12	Control de botón Confirmación Pendiente en REPORTADO (tieneMisionDespachada: true) y saneamiento de tieneMisionEnCurso: true hacia VERIFICANDO	Regla Operativa	Hook / Componente	Alta	Tarjeta en REPORTADO con misión despachada pendiente o con misión ya en curso proveniente de API.	tieneMisionDespachada: true en IncidenteCard; tieneMisionEnCurso: true en useIncidentesKanban	En IncidenteCard reemplaza Asignar Patrulla por Confirmación Pendiente deshabilitado; en el hook reubica el incidente con tieneMisionEnCurso: true en VERIFICANDO.	Re-Test 18/11: verificado en IncidenteCard.test.tsx (14/14 passed) y useIncidentesKanban.test.ts (7/7 passed).	APROBADO	17/11/2026 00:15	18/11/2026 14:47	fix(mando): ubicar incidentes en curso en verificacion, bloquear asignacion duplicada y resolver hydration mismatch
TC-H37-WEB-13	Manejo de evento mision:rechazada con deduplicación temporal, reseteo de tieneMisionDespachada y retorno en REPORTADO	Tiempo Real / WebSocket	Hook / UI	Alta	Incidente en REPORTADO con tieneMisionDespachada: true al recibirse mision:rechazada vía Socket.io.	Payload mision:rechazada con misionId, codigo MIS-2026-0099, motivo e incidenteId	useIncidentesKanban restablece tieneMisionDespachada: false permitiendo reasignar e invoca onMisionRechazada (Toast de advertencia en KanbanBoard).	Re-Test 18/11: verificado en useIncidentesKanban.test.ts, KanbanBoard.tsx (líneas 68-95) y useEncargadoKanbanSocket.ts.	APROBADO	17/11/2026 00:15	18/11/2026 14:47	feat(kanban): sincronizar estados de despacho y rechazo manteniendo incidentes en REPORTADO hasta confirmacion (H69)
TC-H37-WEB-14	Generación de tipos de rutas Next.js (next typegen), chequeo estático TypeScript (tsc --noEmit) y build de producción (npm run build)	Compilación / Build	Sistema	Crítica	Ejecución en rama feature/h37-patrulla-categorizar-incidente con dependencias instaladas.	npx next typegen && npx tsc --noEmit && npm run build	0 errores TypeScript en src/ y .next/types, y generación completa de artefactos de producción en next build.	Re-Test 18/11: next typegen exitoso, tsc --noEmit exit code 0 y npm run build (Webpack) compila 47 rutas en 4.7 s (TS 2.5 s, páginas estáticas 47/47 en 1067 ms).	APROBADO	17/11/2026 00:15	18/11/2026 14:47	fix(h37): sincronizar develop y resolver hallazgos de QA (BUG-H37-WEB-01..05)
TC-H37-WEB-15	Cumplimiento de guía visual municipal (GEMINI.md: bordes 0px, paleta oficial, iconografía lucide-react sin emojis) y manual H37-actualizacion-tipologia-kanban.md	Estándar / Documentación	UI / Docs	Media	Revisión del diff en src/ y docs/manuals/H37-actualizacion-tipologia-kanban.md.	Inspección de borderRadius, tokens CSS, íconos lucide-react y secciones del manual H37	Cero emojis, esquinas rectas 0px, uso de tokens institucionales y manual completo para Encargado.	Re-Test 18/11: iconografía lucide-react sin emojis, bordes 0px, tokens institucionales y manual publicado en docs/manuals/H37-actualizacion-tipologia-kanban.md.	APROBADO	17/11/2026 00:15	18/11/2026 14:47	docs(manuals): documentar reclasificación presencial en tablero kanban (HU-37)
````

---

## 5. Guía de Ejecución Paso a Paso y Evidencias Técnicas Replicables (Re-Test `18/11/2026`)

### 5.1. Ejecución de Suites Automatizadas con Vitest

#### Comando 1: Ejecución consolidada de las 8 suites vinculadas a HU-37 y Centro de Mando
```bash
npx vitest run src/hooks/__tests__/useEncargadoKanbanSocket.test.ts src/hooks/__tests__/useIncidentesKanban.test.ts src/components/mando/__tests__/IncidenteCard.test.tsx src/components/mando/__tests__/IncidenteDetalleDrawer.test.tsx src/components/mando/__tests__/IncidenteMisionesSection.test.tsx src/components/mando/mision/__tests__/MisionDetalleModal.test.tsx src/lib/utils/__tests__/estadoUtils.test.ts src/components/mando/__tests__/KanbanFiltros.test.tsx
```

**Evidencia obtenida en consola (`Exit code: 0`):**
```text
 RUN  v3.2.7 /home/ds2fery/Documentos/Proyecto/sgrai-uach/web

 ✓ src/lib/utils/__tests__/estadoUtils.test.ts (12 tests) 12ms
 ✓ src/hooks/__tests__/useEncargadoKanbanSocket.test.ts (7 tests) 71ms
 ✓ src/hooks/__tests__/useIncidentesKanban.test.ts (7 tests) 426ms
 ✓ src/components/mando/__tests__/IncidenteCard.test.tsx (14 tests) 452ms
 ✓ src/components/mando/__tests__/IncidenteMisionesSection.test.tsx (15 tests) 738ms
 ✓ src/components/mando/mision/__tests__/MisionDetalleModal.test.tsx (12 tests) 701ms
 ✓ src/components/mando/__tests__/KanbanFiltros.test.tsx (9 tests) 698ms
 ✓ src/components/mando/__tests__/IncidenteDetalleDrawer.test.tsx (16 tests) 880ms

 Test Files  8 passed (8)
      Tests  92 passed (92)
   Start at  14:46:56
   Duration  4.82s
```

*(Nota: Al incluir la suite `src/services/__tests__/incidentesService.test.ts` (`6` tests), el conjunto alcanza `9 passed (9)` y `98 passed (98)` en `3.04s`).*

#### Comando 2: Ejecución individual por escenario (`npm test -- -t "..."`)
```bash
# BUG-H37-WEB-01 (Re-Test): Sin falsos positivos ni doble conteo ante incidente:actualizado sin reclasificación
npm test -- src/hooks/__tests__/useIncidentesKanban.test.ts -t "BUG-H37-WEB-01"

# BUG-H37-WEB-05 (Re-Test): Limpieza de detalle previo en IncidenteDetalleDrawer ante error 403
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

**Evidencias obtenidas en consola:**
```text
 ✓ src/hooks/__tests__/useIncidentesKanban.test.ts (7 tests | 6 skipped) 73ms
   ✓ useIncidentesKanban - HU-20 y BUG-04 > BUG-H37-WEB-01: NO debe marcar verificado ni reclasificadoEnTerreno ni duplicar totalMisiones ante incidente:actualizado sin reclasificación 71ms

 ✓ src/components/mando/__tests__/IncidenteDetalleDrawer.test.tsx (16 tests | 15 skipped) 158ms
   ✓ Componente IncidenteDetalleDrawer e integración HU-17 > BUG-H37-WEB-05: limpia el detalle previo cuando se cambia a otro incidente cuya consulta retorna error 403 155ms

 ✓ src/hooks/__tests__/useEncargadoKanbanSocket.test.ts (7 tests | 6 skipped) 23ms
   ✓ useEncargadoKanbanSocket > debe procesar reclasificación de tipología en terreno emitiendo string amigable en ultimoEvento 21ms

 ✓ src/hooks/__tests__/useIncidentesKanban.test.ts (7 tests | 6 skipped) 71ms
   ✓ useIncidentesKanban - HU-20 y BUG-04 > debe actualizar inmediatamente tipología y prioridad con justificación ante evento incidente:actualizado (H37) 70ms

 ✓ src/components/mando/__tests__/IncidenteCard.test.tsx (14 tests | 12 skipped) 76ms
   ✓ IncidenteCard > debe exhibir la etiqueta "Verificado en terreno" con tooltip y justificación al reclasificarse (H37) 65ms
   ✓ IncidenteCard > debe exhibir la etiqueta "Verificado" cuando verificado es true al cargar desde el servidor (paginación/refresco) 9ms

 ✓ src/components/mando/__tests__/IncidenteDetalleDrawer.test.tsx (16 tests | 15 skipped) 152ms
   ✓ Componente IncidenteDetalleDrawer e integración HU-17 > renderiza estados y prioridades legibles y muestra bloque de justificación de reclasificación técnica (H37) 150ms

 ✓ src/components/mando/mision/__tests__/MisionDetalleModal.test.tsx (12 tests | 11 skipped) 169ms
   ✓ Componente MisionDetalleModal (HU-17) > debe renderizar el informe técnico de reclasificación de tipología en terreno y evitar enums crudos 168ms

 ✓ src/lib/utils/__tests__/estadoUtils.test.ts (12 tests | 11 skipped) 3ms
   ✓ formatearHitoBitacora > formatea hitos de bitácora técnica de terreno en denominaciones legibles 2ms

 ✓ src/components/mando/__tests__/IncidenteMisionesSection.test.tsx (15 tests | 14 skipped) 162ms
   ✓ Componente IncidenteMisionesSection > debe priorizar las misiones en proceso al inicio y agrupar las rechazadas en un menú desplegable colapsado 160ms

 ✓ src/components/mando/__tests__/KanbanFiltros.test.tsx (9 tests | 8 skipped) 216ms
   ✓ KanbanFiltros > debe renderizar búsqueda, delegación territorial por nombre, prioridad, tipo y botonera de estados 214ms
```

#### Comando 3: Regresión completa del repositorio (`npm test`)
```bash
npm test
```

**Evidencia obtenida en consola (`Exit code: 0`):**
```text
 Test Files  128 passed (128)
      Tests  876 passed (876)
   Start at  14:43:59
   Duration  53.72s (transform 23.67s, setup 47.20s, collect 113.75s, tests 168.44s, environment 314.06s, prepare 42.39s)
```

---

### 5.2. Análisis Estático ESLint, Chequeo de Tipos, Build y Simulación de Merge

#### Comando 4: Análisis estático ESLint sobre los archivos de HU-37 (`BUG-H37-WEB-04` cerrado) y global (`npm run lint`)
```bash
npx eslint src/components/mando/IncidentesKpiCards.tsx src/hooks/__tests__/useIncidentesKanban.test.ts src/hooks/useIncidentesKanban.ts src/hooks/useEncargadoKanbanSocket.ts src/components/mando/IncidenteCard.tsx src/components/mando/IncidenteDetalleDrawer.tsx src/components/mando/KanbanBoard.tsx src/components/mando/KanbanFiltros.tsx src/components/mando/drawer/IncidenteDetalleHeader.tsx src/components/mando/drawer/IncidenteResumenSection.tsx src/components/mando/drawer/IncidenteMisionesSection.tsx src/components/mando/mision/MisionReportesSection.tsx src/components/mando/mision/MisionDetalleHeader.tsx src/components/mando/mision/MisionBitacoraSection.tsx src/services/incidentesService.ts src/lib/utils/estadoUtils.ts
npm run lint
```

**Evidencia obtenida en consola (`Exit code: 0` en ambos comandos):**
```text
# npx eslint (16 archivos HU-37): 0 errores, 0 advertencias (Exit code: 0)

# npm run lint (global):
✖ 11 problems (0 errors, 11 warnings)
# Las 11 advertencias corresponden a PatrullaDotacionSection.tsx (2), PatrullaVehiculoSection.tsx (1),
# RecursosEncargadoH14.test.tsx (2), EventoAsistenciaSocialForm.test.tsx (2), NuevoEventoSocialClient.test.tsx (1),
# useNuevaPatrullaForm.ts (1), asistentesSocialesService.test.ts (1) y asistentesSocialesService.ts (1),
# las cuales ya fueron resueltas en origin/develop y faltan por integrar (BUG-H37-WEB-03).
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
✓ Running next.config.ts took 29ms

  Creating an optimized production build ...
✓ Compiled successfully in 4.7s
  Finished TypeScript in 2.5s
  Collecting page data using 15 workers in 793ms
✓ Generating static pages using 15 workers (47/47) in 1067ms
  Collecting build traces in 14.1s
  Finalizing page optimization in 14.3s
```

#### Comando 6: Simulación de merge y commits faltantes contra `origin/develop` (`BUG-H37-WEB-03`)
```bash
git log HEAD..origin/develop --oneline
git merge-tree --write-tree origin/develop HEAD
```

**Evidencia obtenida en consola:**
```text
cabb4c2 (origin/develop, develop) docs(qa): actualizar registro formal de defectos de integración post-merge en develop
808357a fix(lint): remover código muerto post-merge, corregir cleanup en KanbanBoard y sanear 11 advertencias ESLint
8a188bd fix(types): eliminar casteos as any en puntosCriticosService, unificar apiClient en avisosService y regenerar tipos Next.js
f0173ad fix(misiones): autenticar listado de misiones con Bearer JWT vía apiClient y tipar obtenerDetalle
6329162 fix(mando): migrar consulta de KPIs a apiClient con Bearer JWT y proxy relativo

Auto-fusionando src/components/mando/KanbanBoard.tsx
Auto-fusionando src/services/__tests__/incidentesService.test.ts
Auto-fusionando src/services/avisosService.ts
Auto-fusionando src/services/incidentesService.ts
CONFLICTO (contenido): Conflicto de fusión en src/services/incidentesService.ts
Auto-fusionando src/services/misionesService.ts
```

---

### 5.3. Comandos cURL de Verificación Contractual contra `sgrai-api`

En la ejecución del Re-Test local (`18/11/2026 14:43`), se comprobó la disponibilidad del servidor backend mediante `curl -s -o /dev/null -w "HTTP_CODE:%{http_code}\n" --connect-timeout 2 http://localhost:3001/openapi.json`, obteniéndose **`HTTP_CODE:000`** (`sgrai-api` no levantado en este entorno local). En consecuencia, las pruebas de `sgrai-web` continuaron ejecutándose con Vitest sobre el contrato regenerado en `src/types/api-generated.d.ts`, y los comandos cURL siguientes documentan las llamadas contractuales y esquemas HTTP/JSON esperados contra `sgrai-api`:

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

| Criterio de Aceptación (CA) | Ámbito en Ecosistema SGRAI | Casos Asociados en `sgrai-web` | Estado Post Re-Test | Observación Técnica |
| :--- | :--- | :--- | :---: | :--- |
| **CA-1:** La pantalla de evaluación en la PWA debe proveer un selector desplegable con las categorías oficiales de incidentes. | `sgrai-pwa` (UI Terreno) / `sgrai-web` (Filtro Kanban) | `BUG-H37-WEB-02` (`CORREGIDO`) | **Cumple en alcance Web** | La pantalla de evaluación en terreno reside en `sgrai-pwa`. En `sgrai-web`, `KanbanFiltros.tsx` reemplazó el arreglo estático por la carga dinámica del catálogo oficial. |
| **CA-2:** El selector debe alimentarse del catálogo oficial `GET /api/incidentes/tipos`. | `sgrai-api` + `sgrai-pwa` / `sgrai-web` (`KanbanFiltros`) | `BUG-H37-WEB-02` (`CORREGIDO`) | **Cumple** | `KanbanFiltros.tsx` consulta `obtenerTiposAfectacion()` (`GET /api/incidentes/tipos`) manteniendo el filtro del tablero alineado al catálogo oficial. |
| **CA-3:** La patrulla debe poder seleccionar el tipo que mejor describe la situación real constatada en terreno. | `sgrai-pwa` + `sgrai-web` (visualización en mando) | `TC-H37-WEB-02`, `TC-H37-WEB-03`, `TC-H37-WEB-06` | **Cumple en alcance Web** | La nueva tipología constatada se refleja correctamente en tarjeta, franja en vivo y drawer de detalle tras la reclasificación. |
| **CA-4:** Al guardar, el sistema debe actualizar el campo `incidente.tipo_incidente_id` en la base de datos. | `sgrai-api` (persistencia) / `sgrai-web` (contrato DTO y tarjeta) | `BUG-H37-WEB-02` (`CORREGIDO`), `BUG-H37-WEB-06`, `TC-H37-WEB-04` | **Observado (Regresión visual)** | El contrato `api-generated.d.ts` y `incidentesService.ts` fueron corregidos, pero al renderizar `verificado: true` desde API, `IncidenteCard.tsx` duplica el chip `"Verificado"` (`BUG-H37-WEB-06`). |
| **CA-5:** Se debe registrar automáticamente un hito en `mision_hito` indicando: `'Tipología reclasificada en terreno a: [Nombre del Tipo]'`. | `sgrai-api` + `sgrai-web` (`MisionBitacoraSection`, `MisionReportesSection`) | `TC-H37-WEB-08`, `TC-H37-WEB-09`, `TC-H37-WEB-10`, `BUG-H37-WEB-05` (`CORREGIDO`) | **Cumple** | `MisionReportesSection.tsx` toma el hito más reciente y soporta justificaciones multilínea; `IncidenteDetalleDrawer` limpia su estado residual al cerrar o fallar. |
| **CA-6:** El sistema debe emitir la notificación WebSocket `incidente:actualizado` al Centro de Mando para actualizar la tarjeta en el tablero Kanban. | `sgrai-api` (emisor) + `sgrai-web` (receptor Kanban y Drawer) | `TC-H37-WEB-01`..`07`, `BUG-H37-WEB-01` (`CORREGIDO`), `BUG-H37-WEB-04` (`CORREGIDO`), `BUG-H37-WEB-06` | **Observado (Regresión `BUG-H37-WEB-06`)** | Eliminado el falso positivo de `verificado` y el doble conteo de `totalMisiones` (`BUG-H37-WEB-01`), así como los errores ESLint (`BUG-H37-WEB-04`). Resta resolver el chip duplicado (`BUG-H37-WEB-06`) y el merge contra `origin/develop` (`BUG-H37-WEB-03`). |
| **CA-7:** El endpoint de actualización debe requerir el permiso RBAC `misiones:terreno:verificar`. | `sgrai-api` (`PATCH /api/incidentes/{id}/tipologia`) | `BUG-H37-WEB-02` (`CORREGIDO`), `BUG-H37-WEB-03` (`ABIERTO`) | **Observado en integración** | La ruta `PATCH /api/incidentes/{id}/tipologia` quedó incorporada en `api-generated.d.ts`; falta completar la integración de los servicios con Bearer JWT desde `origin/develop` (`BUG-H37-WEB-03`). |

---

## 7. Dictamen de Re-Test de QA

**Dictamen:** **OBSERVADO EN RE-TEST — REQUIERE CORRECCIONES ADICIONALES (NO APTO PARA INTEGRACIÓN A `develop`)**

Aunque se verificaron satisfactoriamente las correcciones de `BUG-H37-WEB-01`, `BUG-H37-WEB-02`, `BUG-H37-WEB-04` y `BUG-H37-WEB-05`, la rama `feature/h37-patrulla-categorizar-incidente` aún **no puede ser certificada para fusión con `develop`** hasta que se subsanen los dos hallazgos vigentes:
1. **`BUG-H37-WEB-03` (`ABIERTO`):** Sincronizar completamente con `origin/develop` integrando los 5 commits posteriores de servicios/JWT/lint y resolviendo el conflicto en `src/services/incidentesService.ts`.
2. **`BUG-H37-WEB-06` (`ABIERTO` / `TC-H37-WEB-04 FALLIDO`):** Unificar los dos distintivos `"Verificado"` duplicados en `src/components/mando/IncidenteCard.tsx` (líneas 69–78 y 107–130) y añadir aserción de unicidad en `src/components/mando/__tests__/IncidenteCard.test.tsx`.
