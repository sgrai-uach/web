# Informe de Auditoría Técnica y Matriz de Casos de Prueba QA — HU-37: Categorizar o Corregir Tipología del Incidente en Terreno (Tablero Kanban / Centro de Mando)

**Proyecto:** SGRAI — Sistema de Gestión de Recursos para Atención de Incidentes (Dirección de Gestión de Riesgos de Desastres, Municipalidad de Valdivia)  
**Repositorio:** `sgrai-web`  
**Rama Evaluada:** `feature/h37-patrulla-categorizar-incidente`  
**Desarrollador Asignado:** `zetastormy`  
**Historia de Usuario:** HU-37 — *Como Patrulla verificadora Quiero categorizar o corregir la tipología del incidente tras la evaluación presencial en terreno Para asegurar un registro técnico fidedigno de la naturaleza real de la emergencia, corrigiendo clasificaciones inexactas hechas por informantes ciudadanos.*  
**Issue / PR Referenciado:** `#39` (rama destino: `develop`)  
**Fecha de Ejecución QA:** `17/11/2026 00:15`  
**Fecha de Re-Test:** `(Pendiente)`  
**Estado de Certificación QA:** `RECHAZADO EN AUDITORÍA INICIAL — REQUIERE CORRECCIONES (5 DEFECTOS ABIERTOS)`

---

## 1. Resumen Ejecutivo

Durante la auditoría técnica estática, contractual y dinámica de la rama `feature/h37-patrulla-categorizar-incidente` en el repositorio `sgrai-web`, se evaluó la recepción en tiempo real y presentación en el Centro de Mando (Tablero Kanban, Panel Lateral de Detalle del Incidente y Modal de Detalle de Misión) de las reclasificaciones tipológicas efectuadas por patrullas verificadoras en terreno, junto con su integración respecto a la rama `develop` y al contrato de `sgrai-api`.

Se ejecutaron **20 escenarios de verificación** (`5` defectos detectados y formalizados + `15` casos funcionales y técnicos aprobados), obteniéndose un **75.0% de aprobación inicial** (`15/20`) y **5 defectos bloqueantes o relevantes abiertos** (`1` Crítico, `2` Altos y `2` Medios) que impiden la aprobación del Pull Request hacia `develop` hasta su corrección y verificación en Re-Test.

| Métrica de Calidad | Resultado Obtenido | Criterio de Aceptación / Umbral | Estado |
| :--- | :---: | :---: | :---: |
| **Total de Casos en Matriz** | **20** (`5` Defectos + `15` Casos) | Cobertura integral de alcances HU-37 en `sgrai-web` | Evaluado |
| **Casos Aprobados (`APROBADO`)** | **15 / 20** (`75.0%`) | 100% para certificación | Parcial |
| **Defectos Abiertos (`ABIERTO`)** | **5** (`1` Crítica, `2` Altas, `2` Medias) | 0 defectos abiertos | **Fallido** |
| **Suite Completa Vitest (`npm test`)** | **807 / 807** (`123` archivos) | 100% passing | **Cumple** |
| **Suites Específicas HU-37 / Mando (Vitest)** | **65 / 65** (`8` archivos) | 100% passing | **Cumple** |
| **Verificación de Tipos (`npx next typegen && npx tsc --noEmit`)** | **0 errores** | 0 errores | **Cumple** |
| **Build de Producción (`npm run build`)** | **Exit code 0** (`47` rutas) | Compilación limpia | **Cumple** |
| **Análisis Estático ESLint (`npm run lint`)** | **4 errores, 12 warnings** (`4` errores y `1` warning en archivos HU-37) | 0 errores | **Fallido** |
| **Integración Git con `develop` (`git merge-tree`)** | **13 archivos en conflicto** | Fusión limpia sin regresiones | **Fallido** |

---

## 2. Registro Técnico de Defectos (`ABIERTO`)

### 2.1. `BUG-H37-WEB-01` (Severidad: Crítica — `ABIERTO`) — Falso positivo de verificación (`verificado: true` / `reclasificadoEnTerreno: true`) ante eventos `incidente:actualizado` sin reclasificación y doble incremento de `totalMisiones`
- **Archivos afectados:**
  - `src/hooks/useIncidentesKanban.ts` (líneas 191–203, 355–386)
  - `src/components/mando/IncidenteDetalleDrawer.tsx` (líneas 84–129)
  - `src/components/mando/IncidenteCard.tsx` (líneas 82–105)
- **Descripción técnica:**
  1. En `useIncidentesKanban.ts` (línea 373), `handleIncidenteActualizado` asigna incondicionalmente `verificado: true` ante **cualquier** evento `incidente:actualizado`, incluyendo eventos de cambio de estado sin reclasificación emitidos por `sgrai-api` (como la aceptación de misión en `mision.service.ts` con `{ id, codigo, nuevoEstado: 'VERIFICANDO', prioridad }`, el despacho inicial en `REPORTADO`, la asignación de cuadrilla en `EN_ATENCION`, o el evento sintético emitido por `useEncargadoKanbanSocket.ts:214` cuando llega `mision:actualizada` con `estado === 'EN_CURSO'`). Dado que `IncidenteCard.tsx:82` renderiza la etiqueta `"Verificado"` (`"Tipología rectificada por patrulla en terreno..."`) cuando `incidente.reclasificadoEnTerreno || incidente.verificado` es verdadero, las tarjetas pasan a mostrarse como verificadas en terreno antes de que la patrulla haya llegado al sitio o ejecutado la evaluación.
  2. En `IncidenteDetalleDrawer.tsx` (línea 118), `handleActualizadoSocket` fija igualmente `reclasificadoEnTerreno: true` de forma incondicional ante cualquier evento `incidente:actualizado` recibido mientras el drawer está abierto, provocando que `IncidenteResumenSection.tsx:41` muestre erróneamente el bloque `"Reclasificación Técnica en Terreno"` con la tipología ciudadana original aunque no exista reclasificación ni justificación.
  3. En `useIncidentesKanban.ts` (líneas 380–383), al transicionar desde `REPORTADO` a `VERIFICANDO` tras la aceptación de la misión, el manejador vuelve a incrementar `totalMisiones` (`Math.max(1, (incActual.totalMisiones || 0) + 1)`), pese a que la misión ya había sido contabilizada al despacharse en `REPORTADO` (regla H69 con `tieneMisionDespachada: true`), y no restablece `tieneMisionDespachada: false`. Adicionalmente, la sanitización defensiva de `ejecutarConsulta` (líneas 191–203) mueve elementos desde `REPORTADO` a `VERIFICANDO` sin deduplicar ni ajustar `paginacionColumna.REPORTADO.total` y `paginacionColumna.VERIFICANDO.total`.
- **Pasos para reproducir:**
  1. Despachar una patrulla a un incidente en `REPORTADO` (queda en `REPORTADO` con `totalMisiones: 1` y `tieneMisionDespachada: true`).
  2. Abrir el tablero Kanban (y opcionalmente el `IncidenteDetalleDrawer` de ese incidente).
  3. Simular o ejecutar la aceptación de misión desde la PWA (`PATCH /api/misiones/{id}/aceptar`), emitiéndose `mision:actualizada` (`EN_CURSO`) e `incidente:actualizado` (`nuevoEstado: 'VERIFICANDO'`) sin `tipoIncidenteId`, `tipoAfectacion` ni `justificacion`.
- **Comportamiento esperado:** El incidente pasa a `VERIFICANDO` manteniendo `verificado: false` / `reclasificadoEnTerreno: false` y `totalMisiones: 1`, sin mostrar la etiqueta `"Verificado"` ni el bloque `"Reclasificación Técnica en Terreno"` hasta que exista una reclasificación o verificación real.
- **Comportamiento actual:** La tarjeta muestra falsamente el chip `"Verificado"` y `totalMisiones: 2`, y el drawer abierto muestra el bloque `"Reclasificación Técnica en Terreno"` con la tipología original.
- **Recomendación técnica:** Condicionar `reclasificadoEnTerreno` y `verificado` a la presencia real de datos de reclasificación (`Boolean(datos.justificacion || datos.tipoIncidenteId || (datos.tipoAfectacion && datos.tipoAfectacion !== actual.tipoAfectacion))`), preservando el valor previo en otro caso; limpiar `tieneMisionDespachada: false` sin volver a incrementar `totalMisiones` cuando la misión ya existía.

### 2.2. `BUG-H37-WEB-02` (Severidad: Alta — `ABIERTO`) — Desincronización de contrato OpenAPI (`api-generated.d.ts`), extensión manual incompatible en `incidentesService.ts`, regresión de `obtenerKpis` y filtro estático desalineado en `KanbanFiltros.tsx`
- **Archivos afectados:**
  - `src/types/api-generated.d.ts`
  - `src/services/incidentesService.ts` (líneas 18–35, 235–302)
  - `src/components/mando/KanbanFiltros.tsx` (líneas 44–53)
- **Descripción técnica:**
  1. `src/types/api-generated.d.ts` no fue regenerado desde el OpenAPI de `sgrai-api` (`npm run generate-api-types`). Omite los campos nuevos de `ListarIncidentesResponse` e `IncidenteDetalleResponse` (`verificado`, `reclasificadoEnTerreno`, `justificacionReclasificacion`, `tieneMisionDespachada`, `tieneMisionEnCurso`, `trazabilidadNotificacion`), así como el path `PATCH /api/incidentes/{id}/tipologia` y la variante de catálogo detallado de `GET /api/incidentes/tipos?catalogo=true`.
  2. En contravención de la arquitectura definida para el repositorio (`GEMINI.md § 4`), `src/services/incidentesService.ts` (líneas 18–35) extiende manualmente `IncidenteResumen` e `IncidenteDetalle` mediante intersecciones de tipos. Además, declara `justificacionReclasificacion?: string` omitiendo `| null`, mientras que `sgrai-api` (`incidente-kanban.schema.ts`) retorna `string | null | undefined`.
  3. En `src/services/incidentesService.ts` (líneas 240–255), `obtenerKpis` realiza un `fetch` directo con `NEXT_PUBLIC_API_URL` y cabecera `x-user-id` en lugar de usar `apiClient.GET('/api/incidentes/kpis')` con Bearer JWT y proxy relativo.
  4. En `src/components/mando/KanbanFiltros.tsx` (líneas 44–53), `OPCIONES_AFECTACION` está codificado de forma estática con 7 valores (`Inundación`, `Anegamiento`, `Caída de árbol`, `Derrumbe`, `Corte de camino`, `Incendio`, `Peligro estructural`), sin consultar `GET /api/incidentes/tipos`. Cuatro de esas opciones (`Derrumbe`, `Corte de camino`, `Incendio`, `Peligro estructural`) no coinciden con las denominaciones oficiales de la tabla `tipo_incidente` de `sgrai-api`, y faltan categorías oficiales válidas (`Deslizamiento de tierra`, `Anegamiento de calzada`, `Incendio estructural / forestal`, `Corte de energía`, `Daño estructural`, `Corte de agua potable`, `Deslizamiento`, `Otro`). Cuando una patrulla reclasifica un incidente a una de esas tipologías oficiales, el Encargado no dispone de la opción en el filtro del tablero.
- **Pasos para reproducir:**
  1. Inspeccionar `src/types/api-generated.d.ts` buscando `justificacionReclasificacion`, `reclasificadoEnTerreno` o `/api/incidentes/{id}/tipologia`.
  2. Abrir el selector `"Tipo de Afectación"` en `KanbanFiltros` tras reclasificar en terreno un incidente a `"Corte de agua potable"` o `"Daño estructural"`.
- **Comportamiento esperado:** Contrato OpenAPI regenerado sin tipos manuales, `obtenerKpis` sobre `apiClient`, y `KanbanFiltros` alimentado dinámicamente desde `GET /api/incidentes/tipos`.
- **Comportamiento actual:** Contrato OpenAPI desactualizado, intersecciones manuales sin `null`, `fetch` directo en KPIs y filtro de tipología incapaz de seleccionar las categorías reales del catálogo oficial.
- **Recomendación técnica:** Regenerar `src/types/api-generated.d.ts`, eliminar las extensiones manuales en `incidentesService.ts`, migrar `obtenerKpis` a `apiClient.GET` y cargar las opciones de afectación de `KanbanFiltros` desde `GET /api/incidentes/tipos` (reutilizando `obtenerTiposAfectacion` con fallback oficial).

### 2.3. `BUG-H37-WEB-03` (Severidad: Alta — `ABIERTO`) — Desincronización de la rama respecto a `develop` (13 archivos en conflicto) y regresión de módulos integrados (`HU-21`, `HU-22`, `HU-35`, `HU-80`)
- **Archivos afectados:** `src/components/mando/IncidenteCard.tsx`, `src/components/mando/IncidenteDetalleDrawer.tsx`, `src/components/mando/KanbanBoard.tsx`, `src/components/mando/drawer/IncidenteMisionesSection.tsx`, `src/hooks/useEncargadoKanbanSocket.ts`, `src/hooks/useIncidentesKanban.ts`, `src/services/incidentesService.ts`, `src/styles/mision-detalle.module.css`, `package.json` y 5 archivos bajo `__tests__/`.
- **Descripción técnica:**
  La rama `feature/h37-patrulla-categorizar-incidente` permanece basada en un ancestro antiguo de `develop` sin integrar los merges ya aprobados en `develop`. Al simular la fusión mediante `git merge-tree --write-tree develop HEAD`, se detectan **13 conflictos de fusión**. Adicionalmente, la rama omite o revierte funcionalidades y correcciones ya integradas en `develop`:
  - **HU-21:** Barra de despacho de cuadrilla (`ModalAsignarCuadrilla`) en `IncidenteDetalleDrawer`, ordenamiento prioritario de incidentes verificados (`ordenarIncidentesColumna`) y escucha del evento `patrulla:liberada`.
  - **HU-22:** Panel lateral `CuadrillaDetalleDrawer`, apertura por parámetro `?incidenteId=...` en `KanbanBoard` y acceso `"Ver Cuadrilla"` en `IncidenteMisionesSection`.
  - **HU-35:** Almacén, configuración, íconos y listeners de trazabilidad de notificaciones (`trazabilidadStore`, `trazabilidadConfig`, `TrazabilidadIcon`, `notificacion:trazabilidad_actualizada`).
  - **Estabilidad de compilación y seguridad:** Scripts `next build --webpack`, fuente local `NotoSans` (`@fontsource/noto-sans` / `src/fonts/`) y migración a Bearer JWT en servicios (`6329162`, `f0173ad`, `8a188bd`, `808357a`).
- **Pasos para reproducir:**
  1. Ejecutar `git merge-tree --write-tree develop HEAD` sobre la rama actual.
  2. Comparar `git diff develop HEAD --stat`.
- **Comportamiento esperado:** Rama actualizada con `origin/develop` mediante merge limpio, preservando todas las funcionalidades previas certificadas.
- **Comportamiento actual:** 13 archivos con conflicto de fusión directo y eliminación neta de componentes/hooks de HU-21, HU-22 y HU-35 en el diff contra `develop`.
- **Recomendación técnica:** Integrar `origin/develop` en `feature/h37-patrulla-categorizar-incidente`, resolver los conflictos conservando de manera integrada las prestaciones de HU-21, HU-22, HU-35, HU-69 y HU-37, y ejecutar la suite completa de regresión tras el merge.

### 2.4. `BUG-H37-WEB-04` (Severidad: Media — `ABIERTO`) — Errores bloqueantes en análisis estático ESLint (`4` errores) y advertencia de dependencias en `useIncidentesKanban`
- **Archivos afectados:**
  - `src/components/mando/IncidentesKpiCards.tsx` (línea 120)
  - `src/hooks/__tests__/useIncidentesKanban.test.ts` (líneas 13, 14, 15)
  - `src/hooks/useIncidentesKanban.ts` (línea 48)
- **Descripción técnica:**
  La ejecución de `npm run lint` falla con código de salida `1` (`16 problems: 4 errors, 12 warnings`), concentrándose los **4 errores bloqueantes** y **1 advertencia** en archivos modificados en esta rama:
  1. `IncidentesKpiCards.tsx:120:5`: Error `react-hooks/set-state-in-effect` por invocar `setIsMounted(true)` de forma síncrona dentro del cuerpo de `useEffect`.
  2. `useIncidentesKanban.test.ts:13-15`: 3 errores `@typescript-eslint/no-explicit-any` en las firmas `(p: any) => void` de `socketCallbacks`.
  3. `useIncidentesKanban.ts:48:9`: Advertencia `react-hooks/exhaustive-deps` porque `optionsObj` se instancia como nuevo objeto en cada render, invalidando en cada ciclo la memoización de `handleMisionRechazada` (línea 565).
- **Pasos para reproducir:**
  1. Ejecutar `npm run lint` en la raíz del repositorio `sgrai-web`.
- **Comportamiento esperado:** `npm run lint` finaliza con código de salida `0` y `0` errores en todo el proyecto, y sin advertencias en los archivos de HU-37.
- **Comportamiento actual:** El linter aborta con exit code `1` reportando 4 errores bloqueantes y 1 warning en archivos de HU-37.
- **Recomendación técnica:** Eliminar `isMounted`/`useEffect` de `IncidentesKpiCards.tsx` conservando únicamente `suppressHydrationWarning`, tipar `socketCallbacks` en `useIncidentesKanban.test.ts` con `IncidenteCreadoPayload`, `IncidenteActualizadoPayload` y `MisionRechazadaPayload`, y memoizar `optionsObj` o almacenar `onMisionRechazada` en un `useRef` dentro de `useIncidentesKanban.ts`.

### 2.5. `BUG-H37-WEB-05` (Severidad: Media — `ABIERTO`) — Lectura del hito `TIPOLOGIA_RECLASIFICADA` más antiguo, fallo de regex en justificaciones multilínea y fuga de estado previo en `IncidenteDetalleDrawer`
- **Archivos afectados:**
  - `src/components/mando/mision/MisionReportesSection.tsx` (líneas 54–61)
  - `src/components/mando/IncidenteDetalleDrawer.tsx` (líneas 43–67, 199–213)
  - `src/components/mando/drawer/IncidenteMisionesSection.tsx` (líneas 64–66, 124)
- **Descripción técnica:**
  1. En `MisionReportesSection.tsx:54`, `bitacora.find((h) => h.hito === 'TIPOLOGIA_RECLASIFICADA')` selecciona la **primera** coincidencia del arreglo. Debido a que `sgrai-api` retorna `bitacoraTiempos` ordenada cronológicamente de forma ascendente, ante múltiples reclasificaciones en una misma misión el componente muestra la `incidente.tipoAfectacion` final junto a la justificación obsoleta de la primera reclasificación.
  2. En `MisionReportesSection.tsx:59`, la expresión regular `/Justificación:\s*(.+)$/i` no contempla saltos de línea (`[\s\S]+` o flag `/s`). Si la patrulla ingresa una justificación multilínea en terreno, el `.match(...)` retorna `null` y exhibe el texto crudo completo `"Tipología reclasificada en terreno a: ... Justificación: ..."`.
  3. En `IncidenteDetalleDrawer.tsx:43-67`, cuando `incidenteId` pasa a `null` o cambia a otro incidente, no se ejecuta `setDetalle(null)`. Si al seleccionar un segundo incidente falla `obtenerDetalleIncidente` (`403`/`404`/`500`), el condicional `{!cargando && detalle && (...)}` (línea 199) continúa renderizando la ficha completa del incidente anterior debajo del banner de error, e `IncidenteMisionesSection` (sin prop `key={detalle.id}`) retiene el estado local `rechazosAbiertos` del incidente previo. Adicionalmente, en `IncidenteMisionesSection.tsx:124`, el título de la misión de verificación en la tarjeta del drawer no se sincroniza con `incidente.tipoAfectacion` como sí ocurre en `MisionDetalleHeader.tsx:67-70`.
- **Pasos para reproducir:**
  1. Abrir el detalle de una misión con dos hitos `TIPOLOGIA_RECLASIFICADA` consecutivos o con una justificación que incluya `\n`, y observar la sección `"Informes Técnicos y Reportes de Terreno"`.
  2. Abrir el drawer de un incidente `A`, cerrarlo y abrir un incidente `B` cuya consulta retorne `403` o `404`.
- **Comportamiento esperado:** El informe técnico muestra el último hito de reclasificación (o el listado completo) parseando justificaciones multilínea; al cerrar o fallar la carga en `IncidenteDetalleDrawer`, se limpia `detalle` y se reinicia el estado interno de `IncidenteMisionesSection`.
- **Comportamiento actual:** Se exhibe el primer hito obsoleto / texto sin extraer ante `\n`, y el drawer muestra datos residuales del incidente previo bajo el aviso de error.
- **Recomendación técnica:** Obtener el hito `TIPOLOGIA_RECLASIFICADA` más reciente (o iterar todos los hitos de reclasificación) y emplear `/Justificación:\s*([\s\S]+)$/i` en `MisionReportesSection.tsx`; limpiar `setDetalle(null)` cuando `!incidenteId` o al fallar la carga y añadir `key={detalle.id}` en `IncidenteMisionesSection`.

---

## 3. Matriz Consolidada de Casos de Prueba (13 Columnas)

| ID Caso | Título del Caso de Prueba | Tipo de Prueba | Nivel | Prioridad | Precondición | Datos de Prueba (Payload / Headers / Query) | Resultado Esperado | Resultado Obtenido | Estado | Fecha / Hora Ejecución | Fecha / Hora Re-Test | Solución / Commit |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **BUG-H37-WEB-01** | Falso positivo de verificación (`verificado: true` / `reclasificadoEnTerreno: true`) ante evento `incidente:actualizado` sin reclasificación y doble incremento de `totalMisiones` | Reactividad / Regla ICS (CA-6) | Hook / Componente | Crítica | Incidente en `REPORTADO` (`totalMisiones: 1`, `tieneMisionDespachada: true`, `verificado: false`) que transita a `VERIFICANDO` tras aceptación de misión. | Evento Socket `incidente:actualizado` `{ datos: { id: 'inc-1', codigo: 'INC-01', nuevoEstado: 'VERIFICANDO', prioridad: 'MEDIA' } }` sin `tipoAfectacion` ni `justificacion` | El incidente pasa a `VERIFICANDO` manteniendo `verificado: false`, `reclasificadoEnTerreno: false` y `totalMisiones: 1`; `IncidenteDetalleDrawer` no muestra el bloque de reclasificación. | `useIncidentesKanban` fija `verificado: true` e incrementa `totalMisiones` a `2`; `IncidenteCard` muestra el chip `"Verificado"` e `IncidenteDetalleDrawer` fija `reclasificadoEnTerreno: true` mostrando falsamente la reclasificación. | **ABIERTO** | 17/11/2026 00:15 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| **BUG-H37-WEB-02** | Desincronización de contrato OpenAPI (`api-generated.d.ts`), extensión manual sin `null` en `incidentesService.ts`, `fetch` directo en KPIs y filtro estático desalineado en `KanbanFiltros.tsx` | Contrato OpenAPI / Funcional (CA-2) | Tipos / Servicio / UI | Alta | Inspección de `src/types/api-generated.d.ts`, `src/services/incidentesService.ts` y `src/components/mando/KanbanFiltros.tsx`. | Contrato `GET /api/incidentes`, `GET /api/incidentes/{id}`, `PATCH /api/incidentes/{id}/tipologia` y `GET /api/incidentes/tipos?catalogo=true` | Tipos generados íntegramente desde OpenAPI sin intersecciones manuales, `obtenerKpis` sobre `apiClient` y `KanbanFiltros` poblado desde `GET /api/incidentes/tipos`. | `api-generated.d.ts` omite los campos/rutas de HU-37, `incidentesService.ts` extiende tipos manualmente sin `\| null` y usa `fetch` en KPIs, y `KanbanFiltros` hardcodea 7 opciones desalineadas del catálogo oficial. | **ABIERTO** | 17/11/2026 00:15 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| **BUG-H37-WEB-03** | Desincronización de rama respecto a `develop` (13 archivos en conflicto) y regresión de módulos integrados (`HU-21`, `HU-22`, `HU-35`, `HU-80`) | Integración Git / Regresión | Repositorio | Alta | Rama `feature/h37-patrulla-categorizar-incidente` comparada contra `origin/develop`. | Comando `git merge-tree --write-tree develop HEAD` y `git diff develop HEAD --stat` | Fusión limpia sin conflictos y preservación de `ModalAsignarCuadrilla`, `CuadrillaDetalleDrawer`, `trazabilidadStore` y build `--webpack`. | `git merge-tree` reporta 13 archivos con conflicto de contenido y el diff contra `develop` elimina componentes y listeners de HU-21, HU-22 y HU-35. | **ABIERTO** | 17/11/2026 00:15 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| **BUG-H37-WEB-04** | Errores bloqueantes en análisis estático ESLint (`4` errores) y advertencia `react-hooks/exhaustive-deps` en `useIncidentesKanban.ts` | Calidad de Código / CI | Estático / Hook | Media | Ejecución de linter institucional sobre la rama evaluada. | Comando `npm run lint` y `npx eslint` sobre archivos de `mando` y `hooks` | `0` errores bloqueantes en ESLint y `0` advertencias en archivos modificados por HU-37. | `npm run lint` falla con exit code `1` por `setIsMounted(true)` en `IncidentesKpiCards.tsx:120`, 3 `@typescript-eslint/no-explicit-any` en `useIncidentesKanban.test.ts` y warning `exhaustive-deps` en `useIncidentesKanban.ts:48`. | **ABIERTO** | 17/11/2026 00:15 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| **BUG-H37-WEB-05** | Selección del hito `TIPOLOGIA_RECLASIFICADA` más antiguo, fallo regex en justificación multilínea en `MisionReportesSection.tsx` y fuga de estado previo en `IncidenteDetalleDrawer.tsx` | Borde / UI / Estado (CA-5) | Componente | Media | Misión con 2 reclasificaciones o justificación con `\n`; o apertura secuencial de incidente `A` y error en carga de incidente `B`. | `bitacora` ascendente con 2 hitos `TIPOLOGIA_RECLASIFICADA` y salto `\n`; cambio `incidenteId` de `A` a `B` con respuesta `403` | `MisionReportesSection` muestra el hito más reciente extrayendo texto multilínea; `IncidenteDetalleDrawer` limpia `detalle` al cerrar o fallar. | `bitacora.find(...)` retorna el primer hito obsoleto, regex `/Justificación:\s*(.+)$/i` falla con `\n` y `IncidenteDetalleDrawer` mantiene visible el `detalle` del incidente `A` bajo el error de `B`. | **ABIERTO** | 17/11/2026 00:15 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| **TC-H37-WEB-01** | Suscripción a salas WebSocket y normalización de payload `incidente:actualizado` con `tipoIncidenteId`, `tipoAfectacion` y `justificacion` en `useEncargadoKanbanSocket` | Tiempo Real / WebSocket (CA-6) | Unitario / Hook | Crítica | Montaje de `useEncargadoKanbanSocket` con cliente Socket.io mockeado en Vitest. | Evento `incidente:actualizado` con `{ id: '5000...-0001', codigo: 'INC-2026-001', nuevoEstado: 'VERIFICANDO', prioridad: 'ALTA', tipoIncidenteId: '4000...-0001', tipoAfectacion: 'Inundación', justificacion: 'Tras evaluación...' }` | Normaliza el payload conservando los campos de reclasificación, invoca `onIncidenteActualizado` y actualiza `ultimoEvento` con mensaje amigable en español. | `useEncargadoKanbanSocket.test.ts` aprueba (`ultimoEvento` emite `'Tipología reclasificada: INC-2026-001 a Inundación (Prioridad: Alta)'`). | **APROBADO** | 17/11/2026 00:15 | (No aplica) | feat(kanban): actualizar tipología, prioridad y justificación reactivamente vía websocket (#39) |
| **TC-H37-WEB-02** | Actualización reactiva en memoria de tipología, prioridad y justificación en la tarjeta del tablero Kanban ante evento `incidente:actualizado` | Reactividad UI (CA-6) | Integración / Hook | Crítica | Tablero Kanban cargado con incidente en `VERIFICANDO` tipificado inicialmente como `'Anegamiento menor'` y prioridad `'BAJA'`. | Callback `onIncidenteActualizado` con `tipoAfectacion: 'Inundación'`, `prioridad: 'ALTA'`, `justificacion: 'Tras evaluación presencial...'` | La tarjeta en `columnas.VERIFICANDO` actualiza al instante `tipoAfectacion`, `prioridad`, `reclasificadoEnTerreno: true`, `justificacionReclasificacion` y `cambioPrioridadMotivo`. | Prueba unitaria en `useIncidentesKanban.test.ts` verifica la mutación inmutable y actualización inmediata de los 5 atributos sin recargar la página. | **APROBADO** | 17/11/2026 00:15 | (No aplica) | feat(kanban): actualizar tipología, prioridad y justificación reactivamente vía websocket (#39) |
| **TC-H37-WEB-03** | Renderizado del distintivo `"Verificado"` con ícono `CheckCircle2` y tooltip con justificación y ajuste de prioridad en `IncidenteCard` | Funcional / UI (CA-6) | Componente | Alta | Tarjeta `IncidenteCard` con `reclasificadoEnTerreno: true`, `justificacionReclasificacion` y `cambioPrioridadMotivo`. | Props `incidente={{ ...mockIncidente, tipoAfectacion: 'Inundación', prioridad: 'ALTA', reclasificadoEnTerreno: true, justificacionReclasificacion: 'Desborde...', cambioPrioridadMotivo: 'Desborde...' }}` | Muestra la nueva tipología `'Inundación'`, prioridad legible `'Alta'`, chip `'Verificado'` con atributo `title` conteniendo la justificación y prioridad ajustada. | `IncidenteCard.test.tsx` valida el texto `'Inundación'`, `'Alta'`, `'Verificado'` y el contenido completo del atributo `title`. | **APROBADO** | 17/11/2026 00:15 | (No aplica) | feat(mando): estilizar discretamente verificacion, registrar reclasificacion en bitacora e informes y eliminar enums (HU-37) |
| **TC-H37-WEB-04** | Persistencia del chip `"Verificado"` en `IncidenteCard` cuando `verificado: true` proviene desde el servidor al paginar o refrescar | Funcional / Persistencia | Componente | Alta | Tarjeta `IncidenteCard` hidratada desde `GET /api/incidentes` tras paginación o recarga (`verificado: true`, `reclasificadoEnTerreno: false`). | Props `incidente={{ ...mockIncidente, verificado: true, reclasificadoEnTerreno: false }}` | El chip `"Verificado"` permanece visible en la tarjeta tras refrescar o paginar el tablero. | `IncidenteCard.test.tsx` confirma que `screen.getByText('Verificado')` se renderiza correctamente cuando `verificado: true`. | **APROBADO** | 17/11/2026 00:15 | (No aplica) | fix(kanban): asegurar persistencia del chip verificado al paginar y refrescar |
| **TC-H37-WEB-05** | Despliegue de franja informativa en vivo en `KanbanBoard` ante reclasificación presencial | Funcional / UX (CA-6) | Componente | Media | `KanbanBoard` montado con `ultimoEvento` no nulo proveniente de `useIncidentesKanban`. | `ultimoEvento = 'Tipología reclasificada: INC-2026-001 a Inundación (Prioridad: Alta)'` | La franja superior exhibe el ícono `Zap` y el texto `"Actualización en vivo: Tipología reclasificada: INC-2026-001 a Inundación (Prioridad: Alta)"`. | Verificado en `KanbanBoard.tsx` (líneas 255–272) y `useEncargadoKanbanSocket.ts` (líneas 177–181). | **APROBADO** | 17/11/2026 00:15 | (No aplica) | feat(kanban): actualizar tipología, prioridad y justificación reactivamente vía websocket (#39) |
| **TC-H37-WEB-06** | Visualización del bloque `"Reclasificación Técnica en Terreno"` en `IncidenteResumenSection` dentro de `IncidenteDetalleDrawer` | Funcional / UI (CA-5 / CA-6) | Componente | Alta | `IncidenteDetalleDrawer` cargado con incidente que posee `reclasificadoEnTerreno: true`, `justificacionReclasificacion` y `cambioPrioridadMotivo`. | Respuesta mock de `obtenerDetalleIncidente` con `tipoAfectacion: 'Inundación Mayor'`, `prioridad: 'CRITICA'`, `justificacionReclasificacion: 'Desborde de río...'` | Se despliega `bloque-reclasificacion-terreno` con tipología constatada, justificación presencial y prioridad ajustada en español amigable (`'Crítica'`). | `IncidenteDetalleDrawer.test.tsx` valida la presencia de todos los textos en el bloque y los badges legibles `'Estado: En atención'` y `'Prioridad: Crítica'`. | **APROBADO** | 17/11/2026 00:15 | (No aplica) | feat(ui): reflejar reclasificación en terreno en tarjeta kanban y drawer de detalle |
| **TC-H37-WEB-07** | Sincronización en vivo de `IncidenteDetalleDrawer` al recibir `incidente:actualizado` con reclasificación mientras el panel permanece abierto | Tiempo Real / WebSocket (CA-6) | Componente | Alta | `IncidenteDetalleDrawer` abierto mostrando el `incidenteId` afectado al momento de recibirse la reclasificación desde terreno. | Evento Socket `incidente:actualizado` `{ datos: { id: incidenteId, tipoIncidenteId, tipoAfectacion, prioridad, nuevoEstado, justificacion } }` | El estado interno `detalle` actualiza `tipoAfectacion`, `prioridad`, `estado`, `tipoIncidenteId`, `reclasificadoEnTerreno` y `justificacionReclasificacion` sin cerrar el panel. | Verificado en `IncidenteDetalleDrawer.tsx` (líneas 70–136) comprobando el merge inmutable del payload de reclasificación. | **APROBADO** | 17/11/2026 00:15 | (No aplica) | feat(ui): reflejar reclasificación en terreno en tarjeta kanban y drawer de detalle |
| **TC-H37-WEB-08** | Eliminación de enums crudos mediante utilidades `formatearEstado`, `formatearPrioridad`, `formatearHitoBitacora`, `formatearTipoMision` y `obtenerChipEstadoMision` | Calidad UX / Unitario | Utilidad | Media | Invocación de formateadores institucionales en `src/lib/utils/estadoUtils.ts`. | Entradas `'VERIFICANDO'`, `'CRITICA'`, `'TIPOLOGIA_RECLASIFICADA'`, `'VERIFICACION'`, `'EN_CURSO'`, `null`, `''` | Retorna `'En verificación'`, `'Crítica'`, `'Tipología reclasificada en terreno'`, `'Verificación en terreno'`, chip `'En curso'` y fallbacks seguros. | `estadoUtils.test.ts` aprueba los 12 tests unitarios (`12/12 passed`) en 8 ms. | **APROBADO** | 17/11/2026 00:15 | (No aplica) | feat(utils): incorporar formateadores amigables de estados, prioridades e hitos operativos |
| **TC-H37-WEB-09** | Visualización del hito `TIPOLOGIA_RECLASIFICADA` como `"Tipología reclasificada en terreno"` en bitácora y sincronización de título en `MisionDetalleHeader` | Funcional / UI (CA-5) | Componente | Alta | `MisionDetalleModal` cargado con misión `VERIFICACION` cuyo historial incluye el hito `TIPOLOGIA_RECLASIFICADA`. | `bitacoraTiempos: [{ hito: 'TIPOLOGIA_RECLASIFICADA', descripcion: 'Tipología reclasificada en terreno a: Corte de agua potable. Justificación: ...' }]` | La cabecera muestra `'Verificación: Corte de agua potable - INC-592395-562'` con chips legibles (`'Verificación en terreno'`, `'Media'`) y la bitácora traduce el hito sin enums. | `MisionDetalleModal.test.tsx` valida el formateo amigable del hito, tipo, estado y prioridad (`12/12 passed`). | **APROBADO** | 17/11/2026 00:15 | (No aplica) | feat(mando): estilizar discretamente verificacion, registrar reclasificacion en bitacora e informes y eliminar enums (HU-37) |
| **TC-H37-WEB-10** | Renderizado e interacción accesible (colapsar/desplegar) del informe técnico `"Evaluación en Terreno Realizada"` en `MisionReportesSection` | Funcional / A11y (CA-5) | Componente | Media | Misión con hito `TIPOLOGIA_RECLASIFICADA` de una sola línea abierto en `MisionDetalleModal`. | `patrulla: { nombre: 'papappap', lider: { nombre: 'Cristóbal Felipe Veas Huequemán' } }`, `incidente.tipoAfectacion: 'Corte de agua potable'` | Tarjeta `reporte-verificacion-reclasificacion` inicia desplegada (`aria-expanded="true"`), extrae la justificación y alterna su visibilidad al hacer clic. | `MisionDetalleModal.test.tsx` valida el contenido técnico de la tarjeta y la conmutación `aria-expanded="true"` ↔ `"false"`. | **APROBADO** | 17/11/2026 00:15 | (No aplica) | feat(mando): homogeneizar bitacora, hacer reportes desplegables y agrupar misiones rechazadas en incidente |
| **TC-H37-WEB-11** | Priorización de misiones activas y agrupación en acordeón colapsado de misiones rechazadas en `IncidenteMisionesSection` | Funcional / UI | Componente | Media | Incidente con misiones activas (`EN_CURSO`) y misiones rechazadas (`RECHAZADA`) en `IncidenteMisionesSection`. | `misiones={[misionRechazada1, misionRechazada2, misionEnCurso]}` | Ordena la misión en curso primero, agrupa los 2 rechazos en un acordeón inicialmente colapsado (`aria-expanded="false"`) y los despliega al hacer clic. | `IncidenteMisionesSection.test.tsx` aprueba los 6 escenarios (`6/6 passed`) verificando ordenamiento, chips y acordeón. | **APROBADO** | 17/11/2026 00:15 | (No aplica) | feat(mando): homogeneizar bitacora, hacer reportes desplegables y agrupar misiones rechazadas en incidente |
| **TC-H37-WEB-12** | Control de botón `"Confirmación Pendiente"` en `REPORTADO` (`tieneMisionDespachada: true`) y saneamiento de `tieneMisionEnCurso: true` hacia `VERIFICANDO` | Regla Operativa | Hook / Componente | Alta | Tarjeta en `REPORTADO` con misión despachada pendiente o con misión ya en curso proveniente de API. | `tieneMisionDespachada: true` en `IncidenteCard`; `tieneMisionEnCurso: true` en `useIncidentesKanban` | En `IncidenteCard`, reemplaza `"Asignar Patrulla"` por `"Confirmación Pendiente"` deshabilitado; en el hook, reubica el incidente con `tieneMisionEnCurso: true` en `VERIFICANDO`. | Verificado en `IncidenteCard.test.tsx` (tests H69 y `tieneMisionEnCurso`) y `useIncidentesKanban.test.ts` (`5/5 passed`). | **APROBADO** | 17/11/2026 00:15 | (No aplica) | fix(mando): ubicar incidentes en curso en verificacion, bloquear asignacion duplicada y resolver hydration mismatch |
| **TC-H37-WEB-13** | Manejo de evento `mision:rechazada` con deduplicación temporal, reseteo de `tieneMisionDespachada` y retorno en `REPORTADO` | Tiempo Real / WebSocket | Hook / UI | Alta | Incidente en `REPORTADO` con `tieneMisionDespachada: true` al recibirse `mision:rechazada` vía Socket.io. | Payload `mision:rechazada` `{ misionId: 'mis-rechazada-1', codigo: 'MIS-2026-0099', motivo: 'Patrulla sin vehículo...', incidenteId: 'inc-h69-2' }` | `useIncidentesKanban` restablece `tieneMisionDespachada: false` permitiendo reasignar e invoca `onMisionRechazada` (Toast de advertencia en `KanbanBoard`). | Verificado en `useIncidentesKanban.test.ts` y `useEncargadoKanbanSocket.ts` (deduplicación 3000 ms). | **APROBADO** | 17/11/2026 00:15 | (No aplica) | feat(kanban): sincronizar estados de despacho y rechazo manteniendo incidentes en REPORTADO hasta confirmacion (H69) |
| **TC-H37-WEB-14** | Generación de tipos de rutas Next.js (`next typegen`), chequeo estático TypeScript (`tsc --noEmit`) y build de producción (`npm run build`) | Compilación / Build | Sistema | Crítica | Ejecución en rama `feature/h37-patrulla-categorizar-incidente` con dependencias instaladas. | `npx next typegen && npx tsc --noEmit && npm run build` | `0` errores TypeScript en `src/` y `.next/types`, y generación completa de artefactos de producción en `next build`. | `next typegen` exitoso, `tsc --noEmit` con exit code `0` y `npm run build` compila 47 rutas en 4.0 s (TypeScript 8.5 s). | **APROBADO** | 17/11/2026 00:15 | (No aplica) | fix(kanban): asegurar persistencia del chip verificado al paginar y refrescar |
| **TC-H37-WEB-15** | Cumplimiento de guía visual municipal (`GEMINI.md § 3`: bordes `0px`, paleta oficial, iconografía `lucide-react` sin emojis) y manual `H37-actualizacion-tipologia-kanban.md` | Estándar / Documentación | UI / Docs | Media | Revisión del diff `merge-base..HEAD` en `src/` y `docs/manuals/H37-actualizacion-tipologia-kanban.md`. | Inspección de `borderRadius`, tokens CSS, íconos `lucide-react` y secciones del manual H37 | Cero emojis, esquinas rectas `0px`, uso de tokens `--color-primary-teal` / `--color-info-bg` / `--color-danger` y manual completo para Encargado. | `git diff` confirma `0` radios redondeados no nulos, iconografía exclusivamente en `lucide-react` y manual publicado en `docs/manuals/`. | **APROBADO** | 17/11/2026 00:15 | (No aplica) | docs(manuals): documentar reclasificación presencial en tablero kanban (HU-37) |

---

## 4. Bloque TSV

````tsv
ID Caso	Título del Caso de Prueba	Tipo de Prueba	Nivel	Prioridad	Precondición	Datos de Prueba (Payload / Headers / Query)	Resultado Esperado	Resultado Obtenido	Estado	Fecha / Hora Ejecución	Fecha / Hora Re-Test	Solución / Commit
BUG-H37-WEB-01	Falso positivo de verificación (verificado: true / reclasificadoEnTerreno: true) ante evento incidente:actualizado sin reclasificación y doble incremento de totalMisiones	Reactividad / Regla ICS (CA-6)	Hook / Componente	Crítica	Incidente en REPORTADO (totalMisiones: 1, tieneMisionDespachada: true, verificado: false) que transita a VERIFICANDO tras aceptación de misión.	Evento Socket incidente:actualizado { datos: { id: 'inc-1', codigo: 'INC-01', nuevoEstado: 'VERIFICANDO', prioridad: 'MEDIA' } } sin tipoAfectacion ni justificacion	El incidente pasa a VERIFICANDO manteniendo verificado: false, reclasificadoEnTerreno: false y totalMisiones: 1; IncidenteDetalleDrawer no muestra el bloque de reclasificación.	useIncidentesKanban fija verificado: true e incrementa totalMisiones a 2; IncidenteCard muestra el chip Verificado e IncidenteDetalleDrawer fija reclasificadoEnTerreno: true mostrando falsamente la reclasificación.	ABIERTO	17/11/2026 00:15	(Pendiente)	Pendiente (Rechazado en Code Review)
BUG-H37-WEB-02	Desincronización de contrato OpenAPI (api-generated.d.ts), extensión manual sin null en incidentesService.ts, fetch directo en KPIs y filtro estático desalineado en KanbanFiltros.tsx	Contrato OpenAPI / Funcional (CA-2)	Tipos / Servicio / UI	Alta	Inspección de src/types/api-generated.d.ts, src/services/incidentesService.ts y src/components/mando/KanbanFiltros.tsx.	Contrato GET /api/incidentes, GET /api/incidentes/{id}, PATCH /api/incidentes/{id}/tipologia y GET /api/incidentes/tipos?catalogo=true	Tipos generados íntegramente desde OpenAPI sin intersecciones manuales, obtenerKpis sobre apiClient y KanbanFiltros poblado desde GET /api/incidentes/tipos.	api-generated.d.ts omite los campos/rutas de HU-37, incidentesService.ts extiende tipos manualmente sin null y usa fetch en KPIs, y KanbanFiltros hardcodea 7 opciones desalineadas del catálogo oficial.	ABIERTO	17/11/2026 00:15	(Pendiente)	Pendiente (Rechazado en Code Review)
BUG-H37-WEB-03	Desincronización de rama respecto a develop (13 archivos en conflicto) y regresión de módulos integrados (HU-21, HU-22, HU-35, HU-80)	Integración Git / Regresión	Repositorio	Alta	Rama feature/h37-patrulla-categorizar-incidente comparada contra origin/develop.	Comando git merge-tree --write-tree develop HEAD y git diff develop HEAD --stat	Fusión limpia sin conflictos y preservación de ModalAsignarCuadrilla, CuadrillaDetalleDrawer, trazabilidadStore y build --webpack.	git merge-tree reporta 13 archivos con conflicto de contenido y el diff contra develop elimina componentes y listeners de HU-21, HU-22 y HU-35.	ABIERTO	17/11/2026 00:15	(Pendiente)	Pendiente (Rechazado en Code Review)
BUG-H37-WEB-04	Errores bloqueantes en análisis estático ESLint (4 errores) y advertencia react-hooks/exhaustive-deps en useIncidentesKanban.ts	Calidad de Código / CI	Estático / Hook	Media	Ejecución de linter institucional sobre la rama evaluada.	Comando npm run lint y npx eslint sobre archivos de mando y hooks	0 errores bloqueantes en ESLint y 0 advertencias en archivos modificados por HU-37.	npm run lint falla con exit code 1 por setIsMounted(true) en IncidentesKpiCards.tsx:120, 3 no-explicit-any en useIncidentesKanban.test.ts y warning exhaustive-deps en useIncidentesKanban.ts:48.	ABIERTO	17/11/2026 00:15	(Pendiente)	Pendiente (Rechazado en Code Review)
BUG-H37-WEB-05	Selección del hito TIPOLOGIA_RECLASIFICADA más antiguo, fallo regex en justificación multilínea en MisionReportesSection.tsx y fuga de estado previo en IncidenteDetalleDrawer.tsx	Borde / UI / Estado (CA-5)	Componente	Media	Misión con 2 reclasificaciones o justificación con salto de línea; o apertura secuencial de incidente A y error en carga de incidente B.	bitacora ascendente con 2 hitos TIPOLOGIA_RECLASIFICADA y salto de línea; cambio incidenteId de A a B con respuesta 403	MisionReportesSection muestra el hito más reciente extrayendo texto multilínea; IncidenteDetalleDrawer limpia detalle al cerrar o fallar.	bitacora.find(...) retorna el primer hito obsoleto, regex sin flag dotAll falla con salto de línea y IncidenteDetalleDrawer mantiene visible el detalle del incidente A bajo el error de B.	ABIERTO	17/11/2026 00:15	(Pendiente)	Pendiente (Rechazado en Code Review)
TC-H37-WEB-01	Suscripción a salas WebSocket y normalización de payload incidente:actualizado con tipoIncidenteId, tipoAfectacion y justificacion en useEncargadoKanbanSocket	Tiempo Real / WebSocket (CA-6)	Unitario / Hook	Crítica	Montaje de useEncargadoKanbanSocket con cliente Socket.io mockeado en Vitest.	Evento incidente:actualizado con { id: '5000...-0001', codigo: 'INC-2026-001', nuevoEstado: 'VERIFICANDO', prioridad: 'ALTA', tipoIncidenteId: '4000...-0001', tipoAfectacion: 'Inundación', justificacion: 'Tras evaluación...' }	Normaliza el payload conservando los campos de reclasificación, invoca onIncidenteActualizado y actualiza ultimoEvento con mensaje amigable en español.	useEncargadoKanbanSocket.test.ts aprueba (ultimoEvento emite 'Tipología reclasificada: INC-2026-001 a Inundación (Prioridad: Alta)').	APROBADO	17/11/2026 00:15	(No aplica)	feat(kanban): actualizar tipología, prioridad y justificación reactivamente vía websocket (#39)
TC-H37-WEB-02	Actualización reactiva en memoria de tipología, prioridad y justificación en la tarjeta del tablero Kanban ante evento incidente:actualizado	Reactividad UI (CA-6)	Integración / Hook	Crítica	Tablero Kanban cargado con incidente en VERIFICANDO tipificado inicialmente como Anegamiento menor y prioridad BAJA.	Callback onIncidenteActualizado con tipoAfectacion: 'Inundación', prioridad: 'ALTA', justificacion: 'Tras evaluación presencial...'	La tarjeta en columnas.VERIFICANDO actualiza al instante tipoAfectacion, prioridad, reclasificadoEnTerreno: true, justificacionReclasificacion y cambioPrioridadMotivo.	Prueba unitaria en useIncidentesKanban.test.ts verifica la mutación inmutable y actualización inmediata de los 5 atributos sin recargar la página.	APROBADO	17/11/2026 00:15	(No aplica)	feat(kanban): actualizar tipología, prioridad y justificación reactivamente vía websocket (#39)
TC-H37-WEB-03	Renderizado del distintivo Verificado con ícono CheckCircle2 y tooltip con justificación y ajuste de prioridad en IncidenteCard	Funcional / UI (CA-6)	Componente	Alta	Tarjeta IncidenteCard con reclasificadoEnTerreno: true, justificacionReclasificacion y cambioPrioridadMotivo.	Props incidente con tipoAfectacion: 'Inundación', prioridad: 'ALTA', reclasificadoEnTerreno: true, justificacionReclasificacion y cambioPrioridadMotivo	Muestra la nueva tipología Inundación, prioridad legible Alta, chip Verificado con atributo title conteniendo la justificación y prioridad ajustada.	IncidenteCard.test.tsx valida el texto Inundación, Alta, Verificado y el contenido completo del atributo title.	APROBADO	17/11/2026 00:15	(No aplica)	feat(mando): estilizar discretamente verificacion, registrar reclasificacion en bitacora e informes y eliminar enums (HU-37)
TC-H37-WEB-04	Persistencia del chip Verificado en IncidenteCard cuando verificado: true proviene desde el servidor al paginar o refrescar	Funcional / Persistencia	Componente	Alta	Tarjeta IncidenteCard hidratada desde GET /api/incidentes tras paginación o recarga (verificado: true, reclasificadoEnTerreno: false).	Props incidente={{ ...mockIncidente, verificado: true, reclasificadoEnTerreno: false }}	El chip Verificado permanece visible en la tarjeta tras refrescar o paginar el tablero.	IncidenteCard.test.tsx confirma que screen.getByText('Verificado') se renderiza correctamente cuando verificado: true.	APROBADO	17/11/2026 00:15	(No aplica)	fix(kanban): asegurar persistencia del chip verificado al paginar y refrescar
TC-H37-WEB-05	Despliegue de franja informativa en vivo en KanbanBoard ante reclasificación presencial	Funcional / UX (CA-6)	Componente	Media	KanbanBoard montado con ultimoEvento no nulo proveniente de useIncidentesKanban.	ultimoEvento = 'Tipología reclasificada: INC-2026-001 a Inundación (Prioridad: Alta)'	La franja superior exhibe el ícono Zap y el texto 'Actualización en vivo: Tipología reclasificada: INC-2026-001 a Inundación (Prioridad: Alta)'.	Verificado en KanbanBoard.tsx (líneas 255-272) y useEncargadoKanbanSocket.ts (líneas 177-181).	APROBADO	17/11/2026 00:15	(No aplica)	feat(kanban): actualizar tipología, prioridad y justificación reactivamente vía websocket (#39)
TC-H37-WEB-06	Visualización del bloque Reclasificación Técnica en Terreno en IncidenteResumenSection dentro de IncidenteDetalleDrawer	Funcional / UI (CA-5 / CA-6)	Componente	Alta	IncidenteDetalleDrawer cargado con incidente que posee reclasificadoEnTerreno: true, justificacionReclasificacion y cambioPrioridadMotivo.	Respuesta mock de obtenerDetalleIncidente con tipoAfectacion: 'Inundación Mayor', prioridad: 'CRITICA', justificacionReclasificacion: 'Desborde de río...'	Se despliega bloque-reclasificacion-terreno con tipología constatada, justificación presencial y prioridad ajustada en español amigable (Crítica).	IncidenteDetalleDrawer.test.tsx valida la presencia de todos los textos en el bloque y los badges legibles Estado: En atención y Prioridad: Crítica.	APROBADO	17/11/2026 00:15	(No aplica)	feat(ui): reflejar reclasificación en terreno en tarjeta kanban y drawer de detalle
TC-H37-WEB-07	Sincronización en vivo de IncidenteDetalleDrawer al recibir incidente:actualizado con reclasificación mientras el panel permanece abierto	Tiempo Real / WebSocket (CA-6)	Componente	Alta	IncidenteDetalleDrawer abierto mostrando el incidenteId afectado al momento de recibirse la reclasificación desde terreno.	Evento Socket incidente:actualizado { datos: { id: incidenteId, tipoIncidenteId, tipoAfectacion, prioridad, nuevoEstado, justificacion } }	El estado interno detalle actualiza tipoAfectacion, prioridad, estado, tipoIncidenteId, reclasificadoEnTerreno y justificacionReclasificacion sin cerrar el panel.	Verificado en IncidenteDetalleDrawer.tsx (líneas 70-136) comprobando el merge inmutable del payload de reclasificación.	APROBADO	17/11/2026 00:15	(No aplica)	feat(ui): reflejar reclasificación en terreno en tarjeta kanban y drawer de detalle
TC-H37-WEB-08	Eliminación de enums crudos mediante utilidades formatearEstado, formatearPrioridad, formatearHitoBitacora, formatearTipoMision y obtenerChipEstadoMision	Calidad UX / Unitario	Utilidad	Media	Invocación de formateadores institucionales en src/lib/utils/estadoUtils.ts.	Entradas 'VERIFICANDO', 'CRITICA', 'TIPOLOGIA_RECLASIFICADA', 'VERIFICACION', 'EN_CURSO', null, ''	Retorna 'En verificación', 'Crítica', 'Tipología reclasificada en terreno', 'Verificación en terreno', chip 'En curso' y fallbacks seguros.	estadoUtils.test.ts aprueba los 12 tests unitarios (12/12 passed) en 8 ms.	APROBADO	17/11/2026 00:15	(No aplica)	feat(utils): incorporar formateadores amigables de estados, prioridades e hitos operativos
TC-H37-WEB-09	Visualización del hito TIPOLOGIA_RECLASIFICADA como Tipología reclasificada en terreno en bitácora y sincronización de título en MisionDetalleHeader	Funcional / UI (CA-5)	Componente	Alta	MisionDetalleModal cargado con misión VERIFICACION cuyo historial incluye el hito TIPOLOGIA_RECLASIFICADA.	bitacoraTiempos con hito TIPOLOGIA_RECLASIFICADA y descripcion 'Tipología reclasificada en terreno a: Corte de agua potable. Justificación: ...'	La cabecera muestra 'Verificación: Corte de agua potable - INC-592395-562' con chips legibles y la bitácora traduce el hito sin enums.	MisionDetalleModal.test.tsx valida el formateo amigable del hito, tipo, estado y prioridad (12/12 passed).	APROBADO	17/11/2026 00:15	(No aplica)	feat(mando): estilizar discretamente verificacion, registrar reclasificacion en bitacora e informes y eliminar enums (HU-37)
TC-H37-WEB-10	Renderizado e interacción accesible (colapsar/desplegar) del informe técnico Evaluación en Terreno Realizada en MisionReportesSection	Funcional / A11y (CA-5)	Componente	Media	Misión con hito TIPOLOGIA_RECLASIFICADA de una sola línea abierto en MisionDetalleModal.	patrulla: { nombre: 'papappap', lider: { nombre: 'Cristóbal Felipe Veas Huequemán' } }, incidente.tipoAfectacion: 'Corte de agua potable'	Tarjeta reporte-verificacion-reclasificacion inicia desplegada (aria-expanded='true'), extrae la justificación y alterna su visibilidad al hacer clic.	MisionDetalleModal.test.tsx valida el contenido técnico de la tarjeta y la conmutación aria-expanded true/false.	APROBADO	17/11/2026 00:15	(No aplica)	feat(mando): homogeneizar bitacora, hacer reportes desplegables y agrupar misiones rechazadas en incidente
TC-H37-WEB-11	Priorización de misiones activas y agrupación en acordeón colapsado de misiones rechazadas en IncidenteMisionesSection	Funcional / UI	Componente	Media	Incidente con misiones activas (EN_CURSO) y misiones rechazadas (RECHAZADA) en IncidenteMisionesSection.	misiones=[misionRechazada1, misionRechazada2, misionEnCurso]	Ordena la misión en curso primero, agrupa los 2 rechazos en un acordeón inicialmente colapsado (aria-expanded='false') y los despliega al hacer clic.	IncidenteMisionesSection.test.tsx aprueba los 6 escenarios (6/6 passed) verificando ordenamiento, chips y acordeón.	APROBADO	17/11/2026 00:15	(No aplica)	feat(mando): homogeneizar bitacora, hacer reportes desplegables y agrupar misiones rechazadas en incidente
TC-H37-WEB-12	Control de botón Confirmación Pendiente en REPORTADO (tieneMisionDespachada: true) y saneamiento de tieneMisionEnCurso: true hacia VERIFICANDO	Regla Operativa	Hook / Componente	Alta	Tarjeta en REPORTADO con misión despachada pendiente o con misión ya en curso proveniente de API.	tieneMisionDespachada: true en IncidenteCard; tieneMisionEnCurso: true en useIncidentesKanban	En IncidenteCard reemplaza Asignar Patrulla por Confirmación Pendiente deshabilitado; en el hook reubica el incidente con tieneMisionEnCurso: true en VERIFICANDO.	Verificado en IncidenteCard.test.tsx (tests H69 y tieneMisionEnCurso) y useIncidentesKanban.test.ts (5/5 passed).	APROBADO	17/11/2026 00:15	(No aplica)	fix(mando): ubicar incidentes en curso en verificacion, bloquear asignacion duplicada y resolver hydration mismatch
TC-H37-WEB-13	Manejo de evento mision:rechazada con deduplicación temporal, reseteo de tieneMisionDespachada y retorno en REPORTADO	Tiempo Real / WebSocket	Hook / UI	Alta	Incidente en REPORTADO con tieneMisionDespachada: true al recibirse mision:rechazada vía Socket.io.	Payload mision:rechazada { misionId: 'mis-rechazada-1', codigo: 'MIS-2026-0099', motivo: 'Patrulla sin vehículo...', incidenteId: 'inc-h69-2' }	useIncidentesKanban restablece tieneMisionDespachada: false permitiendo reasignar e invoca onMisionRechazada (Toast de advertencia en KanbanBoard).	Verificado en useIncidentesKanban.test.ts y useEncargadoKanbanSocket.ts (deduplicación 3000 ms).	APROBADO	17/11/2026 00:15	(No aplica)	feat(kanban): sincronizar estados de despacho y rechazo manteniendo incidentes en REPORTADO hasta confirmacion (H69)
TC-H37-WEB-14	Generación de tipos de rutas Next.js (next typegen), chequeo estático TypeScript (tsc --noEmit) y build de producción (npm run build)	Compilación / Build	Sistema	Crítica	Ejecución en rama feature/h37-patrulla-categorizar-incidente con dependencias instaladas.	npx next typegen && npx tsc --noEmit && npm run build	0 errores TypeScript en src/ y .next/types, y generación completa de artefactos de producción en next build.	next typegen exitoso, tsc --noEmit con exit code 0 y npm run build compila 47 rutas en 4.0 s (TypeScript 8.5 s).	APROBADO	17/11/2026 00:15	(No aplica)	fix(kanban): asegurar persistencia del chip verificado al paginar y refrescar
TC-H37-WEB-15	Cumplimiento de guía visual municipal (GEMINI.md: bordes 0px, paleta oficial, iconografía lucide-react sin emojis) y manual H37-actualizacion-tipologia-kanban.md	Estándar / Documentación	UI / Docs	Media	Revisión del diff merge-base..HEAD en src/ y docs/manuals/H37-actualizacion-tipologia-kanban.md.	Inspección de borderRadius, tokens CSS, íconos lucide-react y secciones del manual H37	Cero emojis, esquinas rectas 0px, uso de tokens institucionales y manual completo para Encargado.	git diff confirma 0 radios redondeados no nulos, iconografía exclusivamente en lucide-react y manual publicado en docs/manuals/.	APROBADO	17/11/2026 00:15	(No aplica)	docs(manuals): documentar reclasificación presencial en tablero kanban (HU-37)
````

---

## 5. Guía de Ejecución Paso a Paso y Evidencias Técnicas Replicables

### 5.1. Ejecución de Suites Automatizadas con Vitest

#### Comando 1: Ejecución consolidada de las 8 suites vinculadas a HU-37 y Centro de Mando
```bash
npx vitest run src/hooks/__tests__/useEncargadoKanbanSocket.test.ts src/hooks/__tests__/useIncidentesKanban.test.ts src/components/mando/__tests__/IncidenteCard.test.tsx src/components/mando/__tests__/IncidenteDetalleDrawer.test.tsx src/components/mando/__tests__/IncidenteMisionesSection.test.tsx src/components/mando/mision/__tests__/MisionDetalleModal.test.tsx src/lib/utils/__tests__/estadoUtils.test.ts src/components/mando/__tests__/KanbanFiltros.test.tsx
```

**Evidencia obtenida en consola:**
```text
 RUN  v3.2.7 /home/ds2fery/Documentos/Proyecto/sgrai-uach/web

 ✓ src/lib/utils/__tests__/estadoUtils.test.ts (12 tests) 8ms
 ✓ src/hooks/__tests__/useEncargadoKanbanSocket.test.ts (5 tests) 45ms
 ✓ src/hooks/__tests__/useIncidentesKanban.test.ts (5 tests) 307ms
 ✓ src/components/mando/__tests__/IncidenteCard.test.tsx (11 tests) 383ms
 ✓ src/components/mando/__tests__/IncidenteMisionesSection.test.tsx (6 tests) 492ms
 ✓ src/components/mando/__tests__/KanbanFiltros.test.tsx (9 tests) 683ms
 ✓ src/components/mando/mision/__tests__/MisionDetalleModal.test.tsx (12 tests) 727ms
 ✓ src/components/mando/__tests__/IncidenteDetalleDrawer.test.tsx (5 tests) 634ms

 Test Files  8 passed (8)
      Tests  65 passed (65)
   Start at  00:19:22
   Duration  2.95s
```

#### Comando 2: Ejecución individual por escenario (`npm test -- -t "..."`)
```bash
# TC-H37-WEB-01: Procesamiento WebSocket de reclasificación en useEncargadoKanbanSocket
npm test -- src/hooks/__tests__/useEncargadoKanbanSocket.test.ts -t "debe procesar reclasificación de tipología en terreno"

# TC-H37-WEB-02: Actualización reactiva en useIncidentesKanban
npm test -- src/hooks/__tests__/useIncidentesKanban.test.ts -t "debe actualizar inmediatamente tipología y prioridad"

# TC-H37-WEB-03 y TC-H37-WEB-04: Chips Verificado y persistencia en IncidenteCard
npm test -- src/components/mando/__tests__/IncidenteCard.test.tsx -t "Verificado"

# TC-H37-WEB-06: Bloque de reclasificación técnica en IncidenteDetalleDrawer
npm test -- src/components/mando/__tests__/IncidenteDetalleDrawer.test.tsx -t "reclasificación técnica"

# TC-H37-WEB-09 y TC-H37-WEB-10: Hito TIPOLOGIA_RECLASIFICADA e informe desplegable en MisionDetalleModal
npm test -- src/components/mando/mision/__tests__/MisionDetalleModal.test.tsx -t "reclasificación de tipología"

# TC-H37-WEB-08: Formateadores de estados, prioridades e hitos en estadoUtils
npm test -- src/lib/utils/__tests__/estadoUtils.test.ts -t "formatea hitos de bitácora"

# TC-H37-WEB-11: Agrupación y priorización de misiones rechazadas en IncidenteMisionesSection
npm test -- src/components/mando/__tests__/IncidenteMisionesSection.test.tsx -t "menú desplegable colapsado"
```

**Evidencias obtenidas en consola:**
```text
 ✓ src/hooks/__tests__/useEncargadoKanbanSocket.test.ts (5 tests | 4 skipped) 19ms
   ✓ useEncargadoKanbanSocket > debe procesar reclasificación de tipología en terreno emitiendo string amigable en ultimoEvento 18ms

 ✓ src/hooks/__tests__/useIncidentesKanban.test.ts (5 tests | 4 skipped) 71ms
   ✓ useIncidentesKanban - HU-20 y BUG-04 > debe actualizar inmediatamente tipología y prioridad con justificación ante evento incidente:actualizado (H37) 69ms

 ✓ src/components/mando/__tests__/IncidenteCard.test.tsx (11 tests | 9 skipped) 64ms
   ✓ IncidenteCard > debe exhibir la etiqueta "Verificado en terreno" con tooltip y justificación al reclasificarse (H37) 56ms
   ✓ IncidenteCard > debe exhibir la etiqueta "Verificado" cuando verificado es true al cargar desde el servidor (paginación/refresco) 7ms

 ✓ src/components/mando/__tests__/IncidenteDetalleDrawer.test.tsx (5 tests | 4 skipped) 145ms
   ✓ Componente IncidenteDetalleDrawer e integración HU-17 > renderiza estados y prioridades legibles y muestra bloque de justificación de reclasificación técnica (H37) 144ms

 ✓ src/components/mando/mision/__tests__/MisionDetalleModal.test.tsx (12 tests | 11 skipped) 151ms
   ✓ Componente MisionDetalleModal (HU-17) > debe renderizar el informe técnico de reclasificación de tipología en terreno y evitar enums crudos 149ms

 ✓ src/lib/utils/__tests__/estadoUtils.test.ts (12 tests | 11 skipped) 3ms
   ✓ formatearHitoBitacora > formatea hitos de bitácora técnica de terreno en denominaciones legibles 1ms

 ✓ src/components/mando/__tests__/IncidenteMisionesSection.test.tsx (6 tests | 5 skipped) 151ms
   ✓ Componente IncidenteMisionesSection > debe priorizar las misiones en proceso al inicio y agrupar las rechazadas en un menú desplegable colapsado 149ms
```

#### Comando 3: Regresión completa del repositorio (`npm test`)
```bash
npm test
```

**Evidencia obtenida en consola:**
```text
 Test Files  123 passed (123)
      Tests  807 passed (807)
   Start at  00:12:23
   Duration  24.56s
```

---

### 5.2. Análisis Estático ESLint, Chequeo de Tipos, Build y Simulación de Merge

#### Comando 4: Análisis estático ESLint sobre los archivos de HU-37 (`BUG-H37-WEB-04`)
```bash
npx eslint src/components/mando/IncidentesKpiCards.tsx src/hooks/__tests__/useIncidentesKanban.test.ts src/hooks/useIncidentesKanban.ts src/hooks/useEncargadoKanbanSocket.ts src/components/mando/IncidenteCard.tsx src/components/mando/IncidenteDetalleDrawer.tsx src/components/mando/KanbanBoard.tsx src/components/mando/KanbanFiltros.tsx src/components/mando/drawer/IncidenteDetalleHeader.tsx src/components/mando/drawer/IncidenteResumenSection.tsx src/components/mando/drawer/IncidenteMisionesSection.tsx src/components/mando/mision/MisionReportesSection.tsx src/components/mando/mision/MisionDetalleHeader.tsx src/components/mando/mision/MisionBitacoraSection.tsx src/services/incidentesService.ts src/lib/utils/estadoUtils.ts
```

**Evidencia obtenida en consola (`Exit code: 1`):**
```text
/home/ds2fery/Documentos/Proyecto/sgrai-uach/web/src/components/mando/IncidentesKpiCards.tsx
  120:5  error  Error: Calling setState synchronously within an effect can trigger cascading renders
  ... react-hooks/set-state-in-effect

/home/ds2fery/Documentos/Proyecto/sgrai-uach/web/src/hooks/__tests__/useIncidentesKanban.test.ts
  13:27  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  14:32  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  15:27  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

/home/ds2fery/Documentos/Proyecto/sgrai-uach/web/src/hooks/useIncidentesKanban.ts
  48:9  warning  The 'optionsObj' conditional could make the dependencies of useCallback Hook (at line 565) change on every render. To fix this, wrap the initialization of 'optionsObj' in its own useMemo() Hook  react-hooks/exhaustive-deps

✖ 5 problems (4 errors, 1 warning)
```

*(Nota: La ejecución global `npm run lint` reporta `✖ 16 problems (4 errors, 12 warnings)`, correspondiendo los 4 errores bloqueantes íntegramente a los archivos listados).*

#### Comando 5: Generación de tipos de ruta, chequeo de tipos y build (`TC-H37-WEB-14`)
```bash
npx next typegen && npx tsc --noEmit && npm run build
```

**Evidencia obtenida en consola (`Exit code: 0`):**
```text
Generating route types...
✓ Types generated successfully
...
▲ Next.js 16.3.4 (Turbopack)
- Environments: .env.local
✓ Running next.config.ts took 25ms
✓ Compiled successfully in 4.0s
✓ Finished TypeScript in 8.5s
✓ Collecting page data using 15 workers in 679ms
✓ Generating static pages using 15 workers (47/47) in 633ms
✓ Finalizing page optimization in 162ms
```

#### Comando 6: Simulación de merge contra `develop` (`BUG-H37-WEB-03`)
```bash
git merge-tree --write-tree develop HEAD
```

**Evidencia obtenida en consola:**
```text
CONFLICTO (contenido): Conflicto de fusión en src/components/mando/IncidenteCard.tsx
CONFLICTO (contenido): Conflicto de fusión en src/components/mando/IncidenteDetalleDrawer.tsx
CONFLICTO (contenido): Conflicto de fusión en src/components/mando/KanbanBoard.tsx
CONFLICTO (contenido): Conflicto de fusión en src/components/mando/__tests__/IncidenteCard.test.tsx
CONFLICTO (contenido): Conflicto de fusión en src/components/mando/__tests__/IncidenteDetalleDrawer.test.tsx
CONFLICTO (contenido): Conflicto de fusión en src/components/mando/__tests__/IncidenteMisionesSection.test.tsx
CONFLICTO (contenido): Conflicto de fusión en src/components/mando/drawer/IncidenteMisionesSection.tsx
CONFLICTO (contenido): Conflicto de fusión en src/hooks/__tests__/useEncargadoKanbanSocket.test.ts
CONFLICTO (contenido): Conflicto de fusión en src/hooks/__tests__/useIncidentesKanban.test.ts
CONFLICTO (contenido): Conflicto de fusión en src/hooks/useEncargadoKanbanSocket.ts
CONFLICTO (contenido): Conflicto de fusión en src/hooks/useIncidentesKanban.ts
CONFLICTO (contenido): Conflicto de fusión en src/services/incidentesService.ts
CONFLICTO (contenido): Conflicto de fusión en src/styles/mision-detalle.module.css
```

---

### 5.3. Comandos cURL de Verificación Contractual contra `sgrai-api`

En la sesión de auditoría local se verificó la conectividad hacia la API configurada (`http://localhost:3001/openapi.json`), obteniéndose código de respuesta HTTP `000` (servicio `sgrai-api` no levantado en este entorno). En consecuencia, las pruebas dinámicas de `sgrai-web` se ejecutaron sobre Vitest con mocks tipados del contrato, y los comandos cURL siguientes detallan la invocación exacta y la respuesta HTTP/JSON esperada conforme a la implementación y esquemas OpenAPI/Zod vigentes en `sgrai-api` (`src/app/api/incidentes/tipos/route.ts`, `src/app/api/incidentes/[id]/tipologia/route.ts`, `src/modules/incidentes/tipologia.schema.ts`, `src/modules/incidentes/incidente-kanban.schema.ts`):

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

| Criterio de Aceptación (CA) | Ámbito en Ecosistema SGRAI | Casos Asociados en `sgrai-web` | Estado Actual | Observación Técnica |
| :--- | :--- | :--- | :---: | :--- |
| **CA-1:** La pantalla de evaluación en la PWA debe proveer un selector desplegable con las categorías oficiales de incidentes. | `sgrai-pwa` (UI Terreno) / `sgrai-web` (Filtro Kanban) | `BUG-H37-WEB-02` | **Observado (en filtro Web)** | La pantalla de evaluación en terreno reside en `sgrai-pwa`. En `sgrai-web`, el filtro equivalente (`KanbanFiltros.tsx`) mantiene un listado estático incompatible con el catálogo oficial. |
| **CA-2:** El selector debe alimentarse del catálogo oficial `GET /api/incidentes/tipos`. | `sgrai-api` + `sgrai-pwa` / `sgrai-web` (`KanbanFiltros`) | `BUG-H37-WEB-02` | **Observado (en `sgrai-web`)** | `KanbanFiltros.tsx` no consume `GET /api/incidentes/tipos`, impidiendo filtrar tarjetas tras reclasificaciones hacia tipologías como `Corte de agua potable` o `Daño estructural`. |
| **CA-3:** La patrulla debe poder seleccionar el tipo que mejor describe la situación real constatada en terreno. | `sgrai-pwa` + `sgrai-web` (visualización en mando) | `TC-H37-WEB-02`, `TC-H37-WEB-03`, `TC-H37-WEB-06` | **Cumple en alcance Web** | La nueva tipología constatada se refleja correctamente en la tarjeta, franja en vivo y drawer de detalle al emitirse la reclasificación. |
| **CA-4:** Al guardar, el sistema debe actualizar el campo `incidente.tipo_incidente_id` en la base de datos. | `sgrai-api` (persistencia) / `sgrai-web` (contrato DTO) | `TC-H37-WEB-04`, `BUG-H37-WEB-02` | **Observado (en contrato Web)** | El frontend persiste y muestra `verificado` tras recargar, pero `api-generated.d.ts` no fue regenerado y `incidentesService.ts` usa extensiones manuales sin `\| null`. |
| **CA-5:** Se debe registrar automáticamente un hito en `mision_hito` indicando: `'Tipología reclasificada en terreno a: [Nombre del Tipo]'`. | `sgrai-api` + `sgrai-web` (`MisionBitacoraSection`, `MisionReportesSection`) | `TC-H37-WEB-08`, `TC-H37-WEB-09`, `TC-H37-WEB-10`, `BUG-H37-WEB-05` | **Observado** | El hito `TIPOLOGIA_RECLASIFICADA` se formatea en bitácora y genera tarjeta desplegable en informes; no obstante, `MisionReportesSection.tsx` toma el primer hito y falla ante justificaciones multilínea (`BUG-H37-WEB-05`). |
| **CA-6:** El sistema debe emitir la notificación WebSocket `incidente:actualizado` al Centro de Mando para actualizar la tarjeta en el tablero Kanban. | `sgrai-api` (emisor) + `sgrai-web` (receptor Kanban y Drawer) | `TC-H37-WEB-01`..`07`, `BUG-H37-WEB-01`, `BUG-H37-WEB-03`, `BUG-H37-WEB-04` | **Fallido / Observado** | La actualización con payload de reclasificación funciona (`TC-H37-WEB-01/02/07`), pero cualquier otro `incidente:actualizado` sin reclasificación marca falsamente `verificado: true` / `reclasificadoEnTerreno: true` y duplica `totalMisiones` (`BUG-H37-WEB-01`). |
| **CA-7:** El endpoint de actualización debe requerir el permiso RBAC `misiones:terreno:verificar`. | `sgrai-api` (`PATCH /api/incidentes/{id}/tipologia`) | `BUG-H37-WEB-02`, `BUG-H37-WEB-03` | **N/A directo en Web (Observado en contrato)** | El permiso aplica en `sgrai-api` sobre la acción de patrulla; `sgrai-web` solo consume las vistas de Centro de Mando (`incidentes:kanban`), cuya especificación OpenAPI debe mantenerse sincronizada. |

---

## 7. Dictamen de Auditoría Inicial de QA

**Dictamen:** **RECHAZADO EN CODE REVIEW (`CHANGES REQUESTED`) — PENDIENTE DE CORRECCIONES Y RE-TEST**

La rama `feature/h37-patrulla-categorizar-incidente` en `sgrai-web` **no es apta para merge a `develop`** hasta que el desarrollador subsane los 5 defectos documentados (`BUG-H37-WEB-01` a `BUG-H37-WEB-05`), resuelva los 13 conflictos con `develop` preservando las historias integradas previamente (`HU-21`, `HU-22`, `HU-35`, `HU-80`), regenere `src/types/api-generated.d.ts`, y logre `0` errores en `npm run lint`, `npx tsc --noEmit`, `npm run build` y `npm test`.

