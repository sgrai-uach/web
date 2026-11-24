# Plan y Reporte de Pruebas QA — HU-39: Informe Técnico de Verificación en Terreno y Cierre de Misión en Centro de Mando (Fusión H39/H86)

**Proyecto:** SGRAI — Sistema de Gestión de Recursos para Atención de Incidentes (DGRD Municipalidad de Valdivia)  
**Repositorio:** `sgrai-web`  
**Rama Evaluada:** `feature/h39-patrulla-enviar-reporte-cerrar`  
**Historia de Usuario:** HU-39 — *Informe Técnico de Verificación en Terreno y Cierre de Misión de Patrullaje (Recepción, Trazabilidad y Cierre en Centro de Mando)*  
**Desarrollador Asignado:** Cristóbal Veas (`zetastormy`)  
**Auditor Técnico:** Departamento de Aseguramiento de Calidad SGRAI  
**Estado de Certificación QA:** `RECHAZADO EN AUDITORÍA INICIAL — 6 DEFECTOS ABIERTOS (PENDIENTE DE SUBSANACIÓN)`  
**Fecha de Auditoría Inicial:** `24/11/2026 01:05`  
**Fecha de Re-Test:** `(Pendiente)`

---

## 1. Resumen Ejecutivo de Auditoría Técnica

Se efectuó la auditoría forense de código, análisis estático, validación de contratos OpenAPI frente a `sgrai-api`, revisión de sincronización WebSocket en tiempo real, ejecución de suites automatizadas Vitest y verificación de compilación de producción para el alcance de la Historia de Usuario **HU-39 (Fusión H39/H86)** en el repositorio `sgrai-web` (`/gestion/centro-incidentes` — Centro de Mando).

El módulo incorpora la sincronización en tiempo real del dictamen de cierre (`REQUIERE_CUADRILLA` y `NO_ABORDABLE`), la visualización del motivo fundado de no abordabilidad en tablero Kanban, panel lateral (`IncidenteDetalleDrawer`) y modal de misión (`MisionDetalleModal`), la comparativa automática de personas afectadas frente al reporte previo de prioridad (HU-38), el traslado del indicador de Ficha FIBE al informe de cierre (`VERIFICACION_CIERRE`), la galería preparada para adjuntos fotográficos (HU-43), la humanización de hitos en bitácora y la exposición de errores HTTP en el tablero Kanban.

No obstante, la auditoría detectó **6 defectos abiertos** (`2` Críticos, `2` Altos, `1` Medio y `1` Bajo) que impiden aprobar la rama para integración a `develop`: fallos bloqueantes en `npm run lint` (`10` errores), desincronización de `detalle.ultimoReporte` y estado de patrulla en `IncidenteDetalleDrawer` ante eventos WebSocket en vivo, falta de regeneración del contrato `src/types/api-generated.d.ts` con pérdida de persistencia del chip `Requiere Cuadrilla` tras recargar (`F5`), pérdida de `detallesEvaluacion` / bitácora / estado de patrulla en `MisionDetalleModal`, desfase entre `docs/manuals/` y la eliminación de `estadoTerreno`, e incumplimientos menores del estándar de diseño `<Chip />` y Sentence Case.

| Métrica de Calidad | Auditoría Inicial (`24/11/2026 01:05`) | Estado |
| :--- | :--- | :--- |
| **Total de Ítems en Matriz** | 24 (`6` Defectos + `18` Casos de Prueba) | **24 Evaluados** |
| **Ítems Aprobados (`APROBADO`)** | 12 / 24 (`50.0%`) | **Cobertura Parcial** |
| **Ítems No Aprobados (`ABIERTO` / `FALLIDO`)** | 12 (`6` Bugs `ABIERTO` + `6` TCs `FALLIDO`) | **Bloqueado para Merge** |
| **Defectos Abiertos (`ABIERTO`)** | 6 (`2` Críticos, `2` Altos, `1` Medio, `1` Bajo) | **Requiere Remediación** |
| **ESLint (`npm run lint`)** | 10 errores, 18 warnings (`Exit code 1`) | **Falla Bloqueante** |
| **Chequeo de Tipos (`npx tsc --noEmit`)** | 0 errores tras regeneración `.next/types` (3 errores previos con caché obsoleta) | **Condicionado a Build** |
| **Suite Focalizada HU-39 (Vitest)** | 123 / 123 tests (`9` archivos) | **100% Passing** |
| **Suite Global Vitest (`npm test`)** | 909 / 909 tests (`129` archivos) | **100% Passing** |
| **Build Producción (`npx next build --webpack`)** | 47 / 47 rutas compiladas (`Exit code 0`) | **Cumple** |

---

## 2. Registro Técnico de Defectos

### `BUG-H39-WEB-01` (Severidad: Crítica — **ABIERTO**) — Errores bloqueantes de ESLint en componentes, hooks y pruebas modificados en la rama (`npm run lint` falla con código 1)
- **Archivos afectados:**
  - `src/components/mando/KanbanBoard.tsx` (líneas 109 y 485; más warnings en líneas 46, 117, 276, 318 y 406)
  - `src/components/mando/mision/MisionReportesSection.tsx` (líneas 403, 408 y 433)
  - `src/components/mando/IncidentesKpiCards.tsx` (línea 120)
  - `src/components/ui/ToastItem.tsx` (línea 48)
  - `src/hooks/__tests__/useIncidentesKanban.test.ts` (líneas 20, 21 y 22)
- **Descripción técnica:**
  La ejecución de `npm run lint` aborta con código de salida `1` reportando **10 errores bloqueantes** introducidos respecto a `develop`:
  1. `KanbanBoard.tsx:109` (`react-hooks/immutability`): `setIncidenteSeleccionadoId` es referenciado dentro de `handleMisionRechazadaSocket` (y en los callbacks de líneas 264, 311, 355, 383 y 398) antes de su declaración en línea 449 al desestructurar `useIncidentesKanban`.
  2. `KanbanBoard.tsx:485` (`react-hooks/refs`): `refrescarKpisRef.current = refrescarKpis;` muta la referencia directamente durante el render en lugar de sincronizarse dentro de `useEffect`.
  3. `MisionReportesSection.tsx:403, 408, 433` (`react-hooks/preserve-manual-memoization`): `hitoReclasificacion` se deriva sin `useMemo` en el cuerpo del componente y se incluye en el arreglo de dependencias de `idAbiertoPorDefecto` e `itemsUnificados`, impidiendo la optimización del compilador de React.
  4. `IncidentesKpiCards.tsx:120` (`react-hooks/set-state-in-effect`): invocación síncrona de `setIsMounted(true)` dentro del cuerpo de `useEffect`.
  5. `ToastItem.tsx:48` (`react-hooks/purity`): invocación impura `useRef<number>(Date.now())` durante el render del componente.
  6. `useIncidentesKanban.test.ts:20-22` (`@typescript-eslint/no-explicit-any`): `socketCallbacks` reemplazó los tipos de payload por `(p: any) => void`.
- **Impacto:** Bloquea el pipeline de CI/CD y viola la política de calidad estática del repositorio.

### `BUG-H39-WEB-02` (Severidad: Crítica — **ABIERTO**) — `IncidenteDetalleDrawer` conserva `detalle.ultimoReporte` obsoleto, no libera `patrulla.estado` y marca misiones históricas como `COMPLETADA` ante evento WebSocket de cierre H39
- **Archivos afectados:**
  - `src/components/mando/IncidenteDetalleDrawer.tsx` (líneas 256-350)
  - `src/components/mando/drawer/IncidenteUltimoReporteSection.tsx` (líneas 40-63)
- **Descripción técnica:**
  1. Cuando el Encargado mantiene abierto `IncidenteDetalleDrawer` en un incidente que ya poseía un reporte previo de prioridad (HU-38) o reclasificación de tipología (HU-37), `detalle.ultimoReporte` contiene el identificador del evento previo. Al llegar `incidente:actualizado` por WebSocket tras el envío de `POST /api/misiones/{id}/reporte`, `handleActualizadoSocket` inserta el nuevo informe `VERIFICACION_CIERRE` en `detalle.reportesEvaluacionTerreno`, pero **no actualiza ni reconstruye `detalle.ultimoReporte`**. En consecuencia, `IncidenteUltimoReporteSection` (líneas 43-46 y 60-63) continúa resolviendo y renderizando el reporte previo en lugar del nuevo informe de cierre, ocultando en tiempo real el dictamen (`Requiere Cuadrilla` / `No Abordable`), el chip de Ficha FIBE y el motivo de no abordabilidad.
  2. En el mismo handler (líneas 293-310), al detectar `esCierreVerificacion`, el bucle `prev.misiones.map(...)` transiciona a `estado: 'COMPLETADA'` **todas** las misiones con `tipoMision === 'VERIFICACION'` (incluyendo misiones históricas `RECHAZADA` o `CANCELADA`) y omite actualizar `patrulla.estado = 'DISPONIBLE'`, manteniendo en la UI la etiqueta `En verificación` sobre una patrulla ya liberada.
- **Impacto:** Inconsistencia crítica en vivo dentro del Centro de Mando durante el monitoreo del cierre de verificación.

### `BUG-H39-WEB-03` (Severidad: Alta — **ABIERTO**) — Desincronización del contrato OpenAPI (`api-generated.d.ts` no regenerado) y pérdida del chip `Requiere Cuadrilla` tras recargar (`F5`)
- **Archivos afectados:**
  - `src/types/api-generated.d.ts`
  - `src/services/incidentesService.ts` (líneas 57-155)
  - `src/types/misiones.ts` (líneas 67-125)
  - `src/components/mando/IncidenteCard.tsx` (líneas 167-177)
- **Descripción técnica:**
  En contravención de `GEMINI.md` §4, no se regeneró `src/types/api-generated.d.ts` desde la especificación OpenAPI de `sgrai-api` (ausencia de `POST /api/misiones/{id}/reporte`, ausencia de `dictamen`, `motivoNoAbordable`, `tipoReporte`, `requiereAsistenciaSocial` en los esquemas generados), recurriendo a extensiones manuales (`& { ... }`) en `incidentesService.ts` y `misiones.ts`. Esta divergencia provocó un fallo silencioso de contrato: `IncidenteCard.tsx` (líneas 167-177) exige `incidente.dictamenTerreno === 'REQUIERE_CUADRILLA'` para renderizar el chip `Requiere Cuadrilla`, pero `GET /api/incidentes` en `sgrai-api` (`incidente-kanban.schema.ts` y `incidente-kanban.repository.ts`) **no proyecta ni retorna `dictamenTerreno`**. Como resultado, tras recargar el navegador (`F5`) o abrir sesión desde cero, `incidente.dictamenTerreno` es siempre `undefined` y el chip desaparece de la columna `En Verificación`.
- **Impacto:** Pérdida de visibilidad operativa tras recarga de pantalla y riesgo de divergencia silenciosa ante cambios de backend.

### `BUG-H39-WEB-04` (Severidad: Alta — **ABIERTO**) — `MisionDetalleModal` ignora `detallesEvaluacion` entrante por socket y omite sincronizar `patrulla.estado`, `incidente.motivoNoAbordable`, `incidente.fechaCierre` y `bitacoraTiempos` al cierre
- **Archivos afectados:**
  - `src/components/mando/mision/MisionDetalleModal.tsx` (líneas 110-252)
- **Descripción técnica:**
  1. En `handleIncidenteActualizado` (línea 154), el mapeo lee exclusivamente `repRaw.evaluacion`, ignorando `repRaw.detallesEvaluacion`, que es la propiedad real emitida por `sgrai-api` en `POST /api/misiones/{id}/reporte` y retornada en `GET /api/misiones/{id}`.
  2. Ante el cierre (`esCierre === true`), el modal actualiza `estado: 'COMPLETADA'` y `fechaCierre` de la misión, pero **omite** actualizar `prev.patrulla.estado` a `'DISPONIBLE'`, **omite** actualizar `prev.incidente.motivoNoAbordable` y `prev.incidente.fechaCierre` cuando `dictamen === 'NO_ABORDABLE'`, y no escucha `mision:actualizada` para incorporar el hito `VERIFICACION_COMPLETADA` en `bitacoraTiempos`.
- **Impacto:** El modal abierto en tiempo real exhibe información incompleta o contradictoria (patrulla aún en verificación, contexto de incidente sin motivo de descarte y bitácora sin hito de cierre).

### `BUG-H39-WEB-05` (Severidad: Media — **ABIERTO**) — Contradicción entre la eliminación de `estadoTerreno` en UI (`be98556`), los manuales entregados y el CA-4
- **Archivos afectados:**
  - `docs/manuals/H39-informe-verificacion-cierre-mando.md` (líneas 25, 39 y 50)
  - `docs/manuals/estandar-tarjetas-reportes-mando.md` (líneas 28, 77 y 78)
  - `src/components/mando/KanbanBoard.tsx`, `src/components/mando/drawer/IncidenteMisionesSection.tsx`, `src/components/mando/drawer/IncidenteUltimoReporteSection.tsx`, `src/components/mando/mision/MisionReportesSection.tsx`
- **Descripción técnica:**
  El commit `be98556` retiró la visualización del campo `estadoTerreno` en el Toast, el panel lateral y el modal de detalle de misión. Sin embargo, los manuales institucionales incorporados en la misma rama (`H39-informe-verificacion-cierre-mando.md` en líneas 25, 39 y 50; `estandar-tarjetas-reportes-mando.md` en líneas 28, 77 y 78) continúan afirmando que la interfaz despliega dicho campo, generando contradicción documental y desalineación respecto al Criterio de Aceptación CA-4 (`Estado del terreno (estado_terreno)`).
- **Impacto:** Documentación de usuario inconsistente con la aplicación real y desviación no formalizada respecto a CA-4.

### `BUG-H39-WEB-06` (Severidad: Baja — **ABIERTO**) — Infracción de estándar `<Chip />` / Sentence Case en Drawer y Toast, y flag `tieneMisionEnCurso` residual en `useIncidentesKanban`
- **Archivos afectados:**
  - `src/components/mando/IncidenteDetalleDrawer.tsx` (líneas 538-557)
  - `src/components/ui/ToastItem.tsx` (líneas 186-190)
  - `src/hooks/useIncidentesKanban.ts` (líneas 516-517)
- **Descripción técnica:**
  1. `IncidenteDetalleDrawer.tsx` (líneas 539-556) renderiza `"Verificación Completada"` mediante un `<span>` inline con `textTransform: 'uppercase'` en lugar de `<Chip variant="success" size="sm" icon={<CheckCircle2 size={12} />}>`, contraviniendo `GEMINI.md` §3.
  2. `ToastItem.tsx` (líneas 186-190) imprime `toast.priorityBadge` como enum en mayúsculas crudas (`ALTA`, `CRITICA`) en lugar de aplicar `formatearPrioridad(...)`.
  3. `useIncidentesKanban.ts` (líneas 516-517) únicamente limpia `tieneMisionEnCurso: false` cuando `nuevoEstado === 'NO_ABORDABLE'`, conservando `tieneMisionEnCurso: true` cuando el cierre ocurre con dictamen `REQUIERE_CUADRILLA`.
- **Impacto:** Desviación menor frente a la guía visual institucional municipal y estado booleano residual en memoria de tarjetas Kanban.

---

## 3. Matriz Consolidada de Casos de Prueba (13 Columnas)

| ID Caso | Título del Caso de Prueba | Tipo de Prueba | Nivel | Prioridad | Precondición | Datos de Prueba (Payload / Headers / Query) | Resultado Esperado | Resultado Obtenido | Estado | Fecha / Hora Ejecución | Fecha / Hora Re-Test | Solución / Commit |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **BUG-H39-WEB-01** | Cumplimiento estricto de ESLint en componentes, hooks y tests de la rama H39 | Calidad / Linter | CI / Estático | Crítica | Rama `feature/h39-patrulla-enviar-reporte-cerrar` con dependencias instaladas | `npm run lint` | Salida con código `0` y `0` errores bloqueantes de ESLint en el proyecto | Falla con código `1`: `10` errores (`KanbanBoard.tsx`, `MisionReportesSection.tsx`, `IncidentesKpiCards.tsx`, `ToastItem.tsx`, `useIncidentesKanban.test.ts`) y `18` warnings | **ABIERTO** | 24/11/2026 01:05 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| **BUG-H39-WEB-02** | Sincronización en vivo de `detalle.ultimoReporte`, liberación de patrulla e integridad de misiones en `IncidenteDetalleDrawer` | Tiempo Real / WebSocket | Componente | Crítica | `IncidenteDetalleDrawer` abierto en incidente con reporte H38/H37 previo y posible misión rechazada histórica | Evento WS `incidente:actualizado` con `reporteTerreno` de `tipoReporte: 'VERIFICACION_CIERRE'` | `IncidenteUltimoReporteSection` actualiza al nuevo informe, solo la misión activa transiciona a `COMPLETADA` y `patrulla.estado` pasa a `DISPONIBLE` | `detalle.ultimoReporte` permanece en el reporte antiguo, todas las misiones `VERIFICACION` pasan a `COMPLETADA` y `patrulla.estado` no cambia a `DISPONIBLE` | **ABIERTO** | 24/11/2026 01:05 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| **BUG-H39-WEB-03** | Regeneración de contrato OpenAPI (`api-generated.d.ts`) y persistencia de chip `Requiere Cuadrilla` tras recarga (`F5`) | Contrato / Persistencia | Integración / Tipos | Alta | Incidente con cierre `REQUIERE_CUADRILLA` consultado vía `GET /api/incidentes` tras recargar navegador | `src/types/api-generated.d.ts`, `incidentesService.ts`, `misiones.ts`, `IncidenteCard.tsx` | Contratos generados vía `npm run generate-api-types` sin extensiones manuales y tarjeta Kanban mostrando `Requiere Cuadrilla` al recargar | `api-generated.d.ts` no fue regenerado para H39; `GET /api/incidentes` no retorna `dictamenTerreno` y el chip desaparece al recargar | **ABIERTO** | 24/11/2026 01:05 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| **BUG-H39-WEB-04** | Sincronización en vivo de `detallesEvaluacion`, `patrulla.estado`, contexto `NO_ABORDABLE` y bitácora en `MisionDetalleModal` | Tiempo Real / WebSocket | Componente | Alta | `MisionDetalleModal` abierto sobre misión de verificación en curso mientras patrulla envía cierre H39 | Evento WS `incidente:actualizado` con `detallesEvaluacion`, `motivoNoAbordable`, `fechaCierre` y evento `mision:actualizada` | Modal lee `detallesEvaluacion`, libera `patrulla.estado` a `DISPONIBLE`, actualiza `incidente.motivoNoAbordable`/`fechaCierre` e incorpora el hito a `bitacoraTiempos` | Modal solo lee `repRaw.evaluacion`, deja patrulla sin liberar, omite `motivoNoAbordable`/`fechaCierre` en `incidente` y no actualiza `bitacoraTiempos` | **ABIERTO** | 24/11/2026 01:05 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| **BUG-H39-WEB-05** | Consistencia entre visualización de `estadoTerreno`, manuales de usuario H39 y Criterio de Aceptación CA-4 | Documentación / Funcional | Repositorio / UI | Media | Revisión cruzada de `be98556`, CA-4 y manuales en `docs/manuals/` | `H39-informe-verificacion-cierre-mando.md` (L25, L39, L50) y `estandar-tarjetas-reportes-mando.md` (L28, L77-78) | Documentación de usuario y componentes alineados con el alcance aprobado para `estadoTerreno` | Los manuales describen que el Toast, Drawer y Modal exhiben `Estado del terreno`, contradiciendo el retiro aplicado en `be98556` | **ABIERTO** | 24/11/2026 01:05 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| **BUG-H39-WEB-06** | Estandarización de `<Chip />` / Sentence Case en Drawer y Toast, y limpieza de `tieneMisionEnCurso` en Kanban | Guía Visual / Estado | UI / Hook | Baja | Revisión de `IncidenteDetalleDrawer.tsx`, `ToastItem.tsx` y `useIncidentesKanban.ts` | Badge `"Verificación Completada"`, `toast.priorityBadge`, cierre `REQUIERE_CUADRILLA` | Uso exclusivo de `<Chip />` en Sentence Case, prioridad formateada (`Alta`) y `tieneMisionEnCurso: false` tras cierre | Drawer usa `<span>` inline con `uppercase`, `ToastItem` muestra enum crudo (`ALTA`) y `tieneMisionEnCurso` queda en `true` en `REQUIERE_CUADRILLA` | **ABIERTO** | 24/11/2026 01:05 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| **TC-H39-WEB-01** | Validación de análisis estático ESLint (`npm run lint`) | Calidad / Linter | CI / Code | Crítica | Rama `feature/h39-patrulla-enviar-reporte-cerrar` | `npm run lint` | `0` errores bloqueantes de ESLint | Falló con `10` errores bloqueantes vinculados a `BUG-H39-WEB-01` | **FALLIDO** | 24/11/2026 01:05 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| **TC-H39-WEB-02** | Compilación de producción (`npx next build --webpack`) y tipado TypeScript (`npx tsc --noEmit`) | Build / Tipos | CI / Build | Crítica | Caché de rutas sincronizada mediante build limpio | `npx next build --webpack && npx tsc --noEmit` | `next build` genera `47/47` rutas con código `0` y `tsc --noEmit` finaliza sin errores | `next build` compiló `47/47` rutas exitosamente y `tsc --noEmit` cerró con `0` errores | **APROBADO** | 24/11/2026 01:05 | - | feat(types): agregar contratos y formateadores para informe de verificacion y cierre (H39) |
| **TC-H39-WEB-03** | Ejecución completa de suite automatizada y suites focalizadas H39 en Vitest | Regresión / Unitaria | Componente / Hook / Util | Crítica | Entorno Vitest v3.2.7 configurado | `npm test` y `npx vitest run` sobre 9 suites focalizadas | 100% de suites y casos aprobados sin regresiones | `129/129` archivos (`909/909` tests) en suite global y `9/9` archivos (`123/123` tests) en suite focalizada aprobados | **APROBADO** | 24/11/2026 01:05 | - | test(mando): cubrir dictamen de cierre, comparativa de personas y traslado de FIBE (H39) |
| **TC-H39-WEB-04** | Sincronización de contrato OpenAPI y persistencia del chip `Requiere Cuadrilla` tras recarga (`F5`) | Contrato / Persistencia | Integración / UI | Alta | Sesión limpia consultando `GET /api/incidentes` e inspección de `api-generated.d.ts` | `GET /api/incidentes?estado=VERIFICANDO`, `src/types/api-generated.d.ts` | Tipos generados con contrato H39 y chip `Requiere Cuadrilla` persistente tras recarga | Contrato OpenAPI desactualizado y chip `Requiere Cuadrilla` omitido tras `F5` (`BUG-H39-WEB-03`) | **FALLIDO** | 24/11/2026 01:05 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| **TC-H39-WEB-05** | Normalización de evento `incidente:actualizado` con dictamen `NO_ABORDABLE`, `motivoNoAbordable` y `fechaCierre` en `useEncargadoKanbanSocket` | Tiempo Real / WebSocket | Hook | Crítica | Hook montado y suscrito a `sala:encargados` | Payload WS `{ id: 'inc-noab-1', nuevoEstado: 'NO_ABORDABLE', dictamen: 'NO_ABORDABLE', motivoNoAbordable: '...', fechaCierre: '...' }` | Emite payload normalizado con `dictamen: 'NO_ABORDABLE'`, `motivoNoAbordable`, `fechaCierre` y actualiza `ultimoEvento` | Hook normaliza campos camelCase/snake_case, actualiza `ultimoEvento` y evita evento sintético en `mision:actualizada COMPLETADA` | **APROBADO** | 24/11/2026 01:05 | - | feat(kanban): sincronizar dictamen de cierre y transicion a NO_ABORDABLE en tiempo real (H39) |
| **TC-H39-WEB-06** | Deduplicación de eventos WebSocket duplicados entre múltiples salas (`sala:encargados`, `encargado`, `mapa`) y Toast | Resiliencia / Tiempo Real | Hook / UI | Alta | Emisión múltiple del mismo evento `incidente:actualizado` o `patrulla:actualizada` dentro de 4s | 3 emisiones consecutivas de `incidente:actualizado` y `showInfo` repetido | El callback y el Toast se disparan una única vez evitando apilamiento de notificaciones | Deduplicación verificada en `useEncargadoKanbanSocket.test.ts`, `usePatrullas.test.ts` y `Toast.test.tsx` | **APROBADO** | 24/11/2026 01:05 | - | fix(notifications): deduplicar eventos websocket y toasts repetidos de patrullas e incidentes |
| **TC-H39-WEB-07** | Transición automática de tarjeta Kanban a columna `NO_ABORDABLE` y actualización de contadores | Funcional / Tiempo Real | Hook / Kanban | Crítica | Incidente presente en columna `VERIFICANDO` al recibir `incidente:actualizado` con `NO_ABORDABLE` | `{ id: 'inc-noab-39', nuevoEstado: 'NO_ABORDABLE', dictamen: 'NO_ABORDABLE', motivoNoAbordable: 'Predio privado cerrado...' }` | Tarjeta sale de `VERIFICANDO`, ingresa al tope de `NO_ABORDABLE`, limpia flags de misión activa y ajusta contadores de ambas columnas | Validado en `useIncidentesKanban.test.ts`: columna origen decrementa, `NO_ABORDABLE` incrementa y expone `motivoNoAbordable` y `fechaCierre` | **APROBADO** | 24/11/2026 01:05 | - | feat(kanban): sincronizar dictamen de cierre y transicion a NO_ABORDABLE en tiempo real (H39) |
| **TC-H39-WEB-08** | Priorización al tope de columna `VERIFICANDO` y activación de `FIBE` / `verificado` tras cierre `REQUIERE_CUADRILLA` | Regla de Negocio / Kanban | Hook / UI | Alta | Columna `VERIFICANDO` con incidente sin verificar arriba y otro debajo que recibe cierre H39 | `{ id: 'inc-cierre-cuadrilla', nuevoEstado: 'VERIFICANDO', prioridad: 'ALTA', verificado: true, requiereAsistenciaSocial: true, dictamen: 'REQUIERE_CUADRILLA' }` | Tarjeta se reordena al inicio de `VERIFICANDO`, actualiza prioridad, `FIBE` y muestra chips `Verificado`, `FIBE` y `Requiere Cuadrilla` en vivo | Validado en `useIncidentesKanban.test.ts` e `IncidenteCard.test.tsx` para actualización en vivo | **APROBADO** | 24/11/2026 01:05 | - | feat(kanban): sincronizar dictamen de cierre y transicion a NO_ABORDABLE en tiempo real (H39) |
| **TC-H39-WEB-09** | Actualización reactiva de `IncidenteUltimoReporteSection` y estado de patrulla en `IncidenteDetalleDrawer` abierto al llegar cierre H39 | Tiempo Real / UX | Componente | Crítica | Drawer abierto con reporte H38 o reclasificación H37 previos mientras llega `incidente:actualizado` H39 | WS `incidente:actualizado` con `reporteTerreno` `VERIFICACION_CIERRE` | Sección `Último Reporte` cambia inmediatamente al cierre H39, patrulla pasa a `Disponible` y misiones históricas no cambian | `detalle.ultimoReporte` y `patrulla.estado` quedan desactualizados (`BUG-H39-WEB-02`) | **FALLIDO** | 24/11/2026 01:05 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| **TC-H39-WEB-10** | Renderizado de banner rojo `Caso cerrado en terreno como No Abordable` y ocultamiento de botón `Despachar Cuadrilla` en Drawer | Regla de Negocio / UI | Componente | Crítica | Incidente cargado desde API en estado `NO_ABORDABLE` con `motivoNoAbordable` y `fechaCierre` | Props `estado: 'NO_ABORDABLE'`, `motivoNoAbordable: 'Predio privado inaccesible...'` | Banner `banner-incidente-no-abordable` visible con motivo y fecha; barra y botón `Despachar Cuadrilla` ocultos | Validado en `IncidenteDetalleDrawer.test.tsx`: banner visible con motivo y `Despachar Cuadrilla` ausente del DOM | **APROBADO** | 24/11/2026 01:05 | - | feat(mando): distinguir reporte VERIFICACION_CIERRE, trasladar FIBE y comparar personas afectadas (H39) |
| **TC-H39-WEB-11** | Visualización de cierre `REQUIERE_CUADRILLA`, indicador Ficha FIBE y habilitación de despacho de cuadrilla en Drawer | Regla de Negocio / UI | Componente | Crítica | Incidente en `VERIFICANDO` con misión `COMPLETADA` y reporte `VERIFICACION_CIERRE` con `requiereAsistenciaSocial: true` | `reporteTerreno` `VERIFICACION_CIERRE` con `personasAfectadas: 6` (previo: `4`) | Muestra `Informe Técnico de Verificación y Cierre`, `Dictamen: Requiere Cuadrilla`, `Requiere Ficha FIBE`, `6 personas (Modificado; antes: 4)` y botón `Despachar Cuadrilla` | Validado en `IncidenteDetalleDrawer.test.tsx` (carga inicial desde API) | **APROBADO** | 24/11/2026 01:05 | - | feat(mando): distinguir reporte VERIFICACION_CIERRE, trasladar FIBE y comparar personas afectadas (H39) |
| **TC-H39-WEB-12** | Distinción visual de `VERIFICACION_CIERRE`, comparativa de personas afectadas (modificado vs sin cambios) y galería HU-43 en `MisionDetalleModal` | UI / Negocio | Componente | Crítica | Misión con reporte previo `EVALUACION_PRIORIDAD` y reporte de cierre `VERIFICACION_CIERRE` | Caso A: `personasAfectadas` `4 -> 6` con `REQUIERE_CUADRILLA` y FIBE; Caso B: `2 -> 2` con `NO_ABORDABLE` | Caso A: badge `Modificado respecto a prioridad (Antes: 4)`, `Requiere Ficha FIBE`, galería HU-43; Caso B: `(Rescatado del reporte de prioridad sin cambios)`, `Motivo`, `No requiere Ficha FIBE` | Validado en ambos escenarios en `MisionDetalleModal.test.tsx` | **APROBADO** | 24/11/2026 01:05 | - | feat(mando): distinguir reporte VERIFICACION_CIERRE, trasladar FIBE y comparar personas afectadas (H39) |
| **TC-H39-WEB-13** | Sincronización en vivo de `MisionDetalleModal` al recibir cierre H39 por WebSocket | Tiempo Real / Modal | Componente | Alta | `MisionDetalleModal` abierto sobre misión `EN_CURSO` cuando se emite cierre en terreno | WS `incidente:actualizado` con `detallesEvaluacion`, `NO_ABORDABLE`, y `mision:actualizada` | Modal actualiza `detallesEvaluacion`, `patrulla.estado = 'DISPONIBLE'`, `incidente.motivoNoAbordable`/`fechaCierre` y `bitacoraTiempos` | Modal ignora `detallesEvaluacion`, mantiene patrulla sin liberar y omite motivo/cierre en `incidente` y bitácora (`BUG-H39-WEB-04`) | **FALLIDO** | 24/11/2026 01:05 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| **TC-H39-WEB-14** | Humanización de enums y eliminación de prefijos duplicados en `MisionBitacoraSection` y `estadoUtils` | UI / Usabilidad | Utilidad / Componente | Media | Misión con hitos `MISION_DESPACHADA`, `PRIORIDAD_ASIGNADA` y `VERIFICACION_COMPLETADA` | Descripciones con `patrulla Patrulla Lenteja`, `BAJA`, `CRITICA`, `NO_ABORDABLE`, `REQUIERE_CUADRILLA` | Textos legibles (`Patrulla Lenteja`, `Baja`, `Crítica`, `No Abordable`, `Requiere Cuadrilla`) sin valores crudos | Validado en `estadoUtils.test.ts` y `MisionDetalleModal.test.tsx` | **APROBADO** | 24/11/2026 01:05 | - | fix(mando): humanizar enums y descripciones en bitacora cronologica de mision |
| **TC-H39-WEB-15** | Exposición de error HTTP 500 distinto de 403 al listar incidentes en `useIncidentesKanban` | Resiliencia / Manejo Errores | Hook | Alta | Peticiones de columnas retornan HTTP 500 | `listarIncidentes` retorna `{ exito: false, codigoError: 500, mensaje: 'Error interno...' }` | Hook expone `error` al usuario (`esForbidden: false`) en lugar de mostrar tablero vacío silenciosamente | Validado en `useIncidentesKanban.test.ts` | **APROBADO** | 24/11/2026 01:05 | - | fix(kanban): exponer errores HTTP distintos de 403 al listar incidentes |
| **TC-H39-WEB-16** | Coherencia entre `docs/manuals/H39-informe-verificacion-cierre-mando.md`, `estandar-tarjetas-reportes-mando.md` y comportamiento real de UI | Documentación / CA-4 | Repositorio | Media | Inspección de manuales H39 y cambios de `be98556` | `docs/manuals/H39-informe-verificacion-cierre-mando.md`, `estandar-tarjetas-reportes-mando.md` | Manuales reflejan exactamente los campos visibles en la UI y concuerdan con CA-4 aprobado | Manuales documentan visualización de `Estado del terreno` eliminada en `be98556` (`BUG-H39-WEB-05`) | **FALLIDO** | 24/11/2026 01:05 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| **TC-H39-WEB-17** | Cumplimiento de guía visual municipal (`GEMINI.md` §3): `<Chip />`, Sentence Case y ausencia de emojis | Guía Visual / UI | Componente | Media | Renderizado de componentes H39 e inspección de badges en `IncidenteDetalleDrawer` y `ToastItem` | Inspección DOM/CSS y regex Unicode `/\p{Extended_Pictographic}/u` | `0` emojis, esquinas rectas `0px`, uso exclusivo de `<Chip />` y Sentence Case sin `ALL CAPS` | `0` emojis y `0px` en tarjetas, pero `IncidenteDetalleDrawer` usa `<span>` inline `uppercase` y `ToastItem` muestra `priorityBadge` en crudo (`BUG-H39-WEB-06`) | **FALLIDO** | 24/11/2026 01:05 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| **TC-H39-WEB-18** | Control de acceso RBAC en acciones derivadas de cierre en `IncidenteDetalleDrawer` y `KanbanBoard` | Seguridad / RBAC | Componente | Crítica | Usuario autenticado sin permiso `misiones:asignar` visualizando incidente `VERIFICANDO` cerrado con `REQUIERE_CUADRILLA` | `usePuedeAsignarMision()` / `auth.tienePermiso('misiones:asignar')` retornando `false` | Se visualiza el informe técnico de cierre, pero la barra y botón `Despachar Cuadrilla` no se renderizan | Validado en `IncidenteDetalleDrawer.tsx` (`puedeDespacharCuadrilla` condicionado a `tienePermisoAsignar`) y `IncidenteCard.test.tsx` | **APROBADO** | 24/11/2026 01:05 | - | feat(mando): distinguir reporte VERIFICACION_CIERRE, trasladar FIBE y comparar personas afectadas (H39) |

---

## 4. Bloque TSV para Exportación

````tsv
ID Caso	Título del Caso de Prueba	Tipo de Prueba	Nivel	Prioridad	Precondición	Datos de Prueba (Payload / Headers / Query)	Resultado Esperado	Resultado Obtenido	Estado	Fecha / Hora Ejecución	Fecha / Hora Re-Test	Solución / Commit
BUG-H39-WEB-01	Cumplimiento estricto de ESLint en componentes, hooks y tests de la rama H39	Calidad / Linter	CI / Estático	Crítica	Rama feature/h39-patrulla-enviar-reporte-cerrar con dependencias instaladas	npm run lint	Salida con código 0 y 0 errores bloqueantes de ESLint en el proyecto	Falla con código 1: 10 errores (KanbanBoard.tsx, MisionReportesSection.tsx, IncidentesKpiCards.tsx, ToastItem.tsx, useIncidentesKanban.test.ts) y 18 warnings	ABIERTO	24/11/2026 01:05	(Pendiente)	Pendiente (Rechazado en Code Review)
BUG-H39-WEB-02	Sincronización en vivo de detalle.ultimoReporte, liberación de patrulla e integridad de misiones en IncidenteDetalleDrawer	Tiempo Real / WebSocket	Componente	Crítica	IncidenteDetalleDrawer abierto en incidente con reporte H38/H37 previo y posible misión rechazada histórica	Evento WS incidente:actualizado con reporteTerreno de tipoReporte: 'VERIFICACION_CIERRE'	IncidenteUltimoReporteSection actualiza al nuevo informe, solo la misión activa transiciona a COMPLETADA y patrulla.estado pasa a DISPONIBLE	detalle.ultimoReporte permanece en el reporte antiguo, todas las misiones VERIFICACION pasan a COMPLETADA y patrulla.estado no cambia a DISPONIBLE	ABIERTO	24/11/2026 01:05	(Pendiente)	Pendiente (Rechazado en Code Review)
BUG-H39-WEB-03	Regeneración de contrato OpenAPI (api-generated.d.ts) y persistencia de chip Requiere Cuadrilla tras recarga (F5)	Contrato / Persistencia	Integración / Tipos	Alta	Incidente con cierre REQUIERE_CUADRILLA consultado vía GET /api/incidentes tras recargar navegador	src/types/api-generated.d.ts, incidentesService.ts, misiones.ts, IncidenteCard.tsx	Contratos generados vía npm run generate-api-types sin extensiones manuales y tarjeta Kanban mostrando Requiere Cuadrilla al recargar	api-generated.d.ts no fue regenerado para H39; GET /api/incidentes no retorna dictamenTerreno y el chip desaparece al recargar	ABIERTO	24/11/2026 01:05	(Pendiente)	Pendiente (Rechazado en Code Review)
BUG-H39-WEB-04	Sincronización en vivo de detallesEvaluacion, patrulla.estado, contexto NO_ABORDABLE y bitácora en MisionDetalleModal	Tiempo Real / WebSocket	Componente	Alta	MisionDetalleModal abierto sobre misión de verificación en curso mientras patrulla envía cierre H39	Evento WS incidente:actualizado con detallesEvaluacion, motivoNoAbordable, fechaCierre y evento mision:actualizada	Modal lee detallesEvaluacion, libera patrulla.estado a DISPONIBLE, actualiza incidente.motivoNoAbordable/fechaCierre e incorpora el hito a bitacoraTiempos	Modal solo lee repRaw.evaluacion, deja patrulla sin liberar, omite motivoNoAbordable/fechaCierre en incidente y no actualiza bitacoraTiempos	ABIERTO	24/11/2026 01:05	(Pendiente)	Pendiente (Rechazado en Code Review)
BUG-H39-WEB-05	Consistencia entre visualización de estadoTerreno, manuales de usuario H39 y Criterio de Aceptación CA-4	Documentación / Funcional	Repositorio / UI	Media	Revisión cruzada de be98556, CA-4 y manuales en docs/manuals/	H39-informe-verificacion-cierre-mando.md (L25, L39, L50) y estandar-tarjetas-reportes-mando.md (L28, L77-78)	Documentación de usuario y componentes alineados con el alcance aprobado para estadoTerreno	Los manuales describen que el Toast, Drawer y Modal exhiben Estado del terreno, contradiciendo el retiro aplicado en be98556	ABIERTO	24/11/2026 01:05	(Pendiente)	Pendiente (Rechazado en Code Review)
BUG-H39-WEB-06	Estandarización de Chip / Sentence Case en Drawer y Toast, y limpieza de tieneMisionEnCurso en Kanban	Guía Visual / Estado	UI / Hook	Baja	Revisión de IncidenteDetalleDrawer.tsx, ToastItem.tsx y useIncidentesKanban.ts	Badge "Verificación Completada", toast.priorityBadge, cierre REQUIERE_CUADRILLA	Uso exclusivo de Chip en Sentence Case, prioridad formateada (Alta) y tieneMisionEnCurso: false tras cierre	Drawer usa span inline con uppercase, ToastItem muestra enum crudo (ALTA) y tieneMisionEnCurso queda en true en REQUIERE_CUADRILLA	ABIERTO	24/11/2026 01:05	(Pendiente)	Pendiente (Rechazado en Code Review)
TC-H39-WEB-01	Validación de análisis estático ESLint (npm run lint)	Calidad / Linter	CI / Code	Crítica	Rama feature/h39-patrulla-enviar-reporte-cerrar	npm run lint	0 errores bloqueantes de ESLint	Falló con 10 errores bloqueantes vinculados a BUG-H39-WEB-01	FALLIDO	24/11/2026 01:05	(Pendiente)	Pendiente (Rechazado en Code Review)
TC-H39-WEB-02	Compilación de producción (npx next build --webpack) y tipado TypeScript (npx tsc --noEmit)	Build / Tipos	CI / Build	Crítica	Caché de rutas sincronizada mediante build limpio	npx next build --webpack && npx tsc --noEmit	next build genera 47/47 rutas con código 0 y tsc --noEmit finaliza sin errores	next build compiló 47/47 rutas exitosamente y tsc --noEmit cerró con 0 errores	APROBADO	24/11/2026 01:05	-	feat(types): agregar contratos y formateadores para informe de verificacion y cierre (H39)
TC-H39-WEB-03	Ejecución completa de suite automatizada y suites focalizadas H39 en Vitest	Regresión / Unitaria	Componente / Hook / Util	Crítica	Entorno Vitest v3.2.7 configurado	npm test y npx vitest run sobre 9 suites focalizadas	100% de suites y casos aprobados sin regresiones	129/129 archivos (909/909 tests) en suite global y 9/9 archivos (123/123 tests) en suite focalizada aprobados	APROBADO	24/11/2026 01:05	-	test(mando): cubrir dictamen de cierre, comparativa de personas y traslado de FIBE (H39)
TC-H39-WEB-04	Sincronización de contrato OpenAPI y persistencia del chip Requiere Cuadrilla tras recarga (F5)	Contrato / Persistencia	Integración / UI	Alta	Sesión limpia consultando GET /api/incidentes e inspección de api-generated.d.ts	GET /api/incidentes?estado=VERIFICANDO, src/types/api-generated.d.ts	Tipos generados con contrato H39 y chip Requiere Cuadrilla persistente tras recarga	Contrato OpenAPI desactualizado y chip Requiere Cuadrilla omitido tras F5 (BUG-H39-WEB-03)	FALLIDO	24/11/2026 01:05	(Pendiente)	Pendiente (Rechazado en Code Review)
TC-H39-WEB-05	Normalización de evento incidente:actualizado con dictamen NO_ABORDABLE, motivoNoAbordable y fechaCierre en useEncargadoKanbanSocket	Tiempo Real / WebSocket	Hook	Crítica	Hook montado y suscrito a sala:encargados	Payload WS { id: 'inc-noab-1', nuevoEstado: 'NO_ABORDABLE', dictamen: 'NO_ABORDABLE', motivoNoAbordable: '...', fechaCierre: '...' }	Emite payload normalizado con dictamen: 'NO_ABORDABLE', motivoNoAbordable, fechaCierre y actualiza ultimoEvento	Hook normaliza campos camelCase/snake_case, actualiza ultimoEvento y evita evento sintético en mision:actualizada COMPLETADA	APROBADO	24/11/2026 01:05	-	feat(kanban): sincronizar dictamen de cierre y transicion a NO_ABORDABLE en tiempo real (H39)
TC-H39-WEB-06	Deduplicación de eventos WebSocket duplicados entre múltiples salas (sala:encargados, encargado, mapa) y Toast	Resiliencia / Tiempo Real	Hook / UI	Alta	Emisión múltiple del mismo evento incidente:actualizado o patrulla:actualizada dentro de 4s	3 emisiones consecutivas de incidente:actualizado y showInfo repetido	El callback y el Toast se disparan una única vez evitando apilamiento de notificaciones	Deduplicación verificada en useEncargadoKanbanSocket.test.ts, usePatrullas.test.ts y Toast.test.tsx	APROBADO	24/11/2026 01:05	-	fix(notifications): deduplicar eventos websocket y toasts repetidos de patrullas e incidentes
TC-H39-WEB-07	Transición automática de tarjeta Kanban a columna NO_ABORDABLE y actualización de contadores	Funcional / Tiempo Real	Hook / Kanban	Crítica	Incidente presente en columna VERIFICANDO al recibir incidente:actualizado con NO_ABORDABLE	{ id: 'inc-noab-39', nuevoEstado: 'NO_ABORDABLE', dictamen: 'NO_ABORDABLE', motivoNoAbordable: 'Predio privado cerrado...' }	Tarjeta sale de VERIFICANDO, ingresa al tope de NO_ABORDABLE, limpia flags de misión activa y ajusta contadores de ambas columnas	Validado en useIncidentesKanban.test.ts: columna origen decrementa, NO_ABORDABLE incrementa y expone motivoNoAbordable y fechaCierre	APROBADO	24/11/2026 01:05	-	feat(kanban): sincronizar dictamen de cierre y transicion a NO_ABORDABLE en tiempo real (H39)
TC-H39-WEB-08	Priorización al tope de columna VERIFICANDO y activación de FIBE / verificado tras cierre REQUIERE_CUADRILLA	Regla de Negocio / Kanban	Hook / UI	Alta	Columna VERIFICANDO con incidente sin verificar arriba y otro debajo que recibe cierre H39	{ id: 'inc-cierre-cuadrilla', nuevoEstado: 'VERIFICANDO', prioridad: 'ALTA', verificado: true, requiereAsistenciaSocial: true, dictamen: 'REQUIERE_CUADRILLA' }	Tarjeta se reordena al inicio de VERIFICANDO, actualiza prioridad, FIBE y muestra chips Verificado, FIBE y Requiere Cuadrilla en vivo	Validado en useIncidentesKanban.test.ts e IncidenteCard.test.tsx para actualización en vivo	APROBADO	24/11/2026 01:05	-	feat(kanban): sincronizar dictamen de cierre y transicion a NO_ABORDABLE en tiempo real (H39)
TC-H39-WEB-09	Actualización reactiva de IncidenteUltimoReporteSection y estado de patrulla en IncidenteDetalleDrawer abierto al llegar cierre H39	Tiempo Real / UX	Componente	Crítica	Drawer abierto con reporte H38 o reclasificación H37 previos mientras llega incidente:actualizado H39	WS incidente:actualizado con reporteTerreno VERIFICACION_CIERRE	Sección Último Reporte cambia inmediatamente al cierre H39, patrulla pasa a Disponible y misiones históricas no cambian	detalle.ultimoReporte y patrulla.estado quedan desactualizados (BUG-H39-WEB-02)	FALLIDO	24/11/2026 01:05	(Pendiente)	Pendiente (Rechazado en Code Review)
TC-H39-WEB-10	Renderizado de banner rojo Caso cerrado en terreno como No Abordable y ocultamiento de botón Despachar Cuadrilla en Drawer	Regla de Negocio / UI	Componente	Crítica	Incidente cargado desde API en estado NO_ABORDABLE con motivoNoAbordable y fechaCierre	Props estado: 'NO_ABORDABLE', motivoNoAbordable: 'Predio privado inaccesible...'	Banner banner-incidente-no-abordable visible con motivo y fecha; barra y botón Despachar Cuadrilla ocultos	Validado en IncidenteDetalleDrawer.test.tsx: banner visible con motivo y Despachar Cuadrilla ausente del DOM	APROBADO	24/11/2026 01:05	-	feat(mando): distinguir reporte VERIFICACION_CIERRE, trasladar FIBE y comparar personas afectadas (H39)
TC-H39-WEB-11	Visualización de cierre REQUIERE_CUADRILLA, indicador Ficha FIBE y habilitación de despacho de cuadrilla en Drawer	Regla de Negocio / UI	Componente	Crítica	Incidente en VERIFICANDO con misión COMPLETADA y reporte VERIFICACION_CIERRE con requiereAsistenciaSocial: true	reporteTerreno VERIFICACION_CIERRE con personasAfectadas: 6 (previo: 4)	Muestra Informe Técnico de Verificación y Cierre, Dictamen: Requiere Cuadrilla, Requiere Ficha FIBE, 6 personas (Modificado; antes: 4) y botón Despachar Cuadrilla	Validado en IncidenteDetalleDrawer.test.tsx (carga inicial desde API)	APROBADO	24/11/2026 01:05	-	feat(mando): distinguir reporte VERIFICACION_CIERRE, trasladar FIBE y comparar personas afectadas (H39)
TC-H39-WEB-12	Distinción visual de VERIFICACION_CIERRE, comparativa de personas afectadas (modificado vs sin cambios) y galería HU-43 en MisionDetalleModal	UI / Negocio	Componente	Crítica	Misión con reporte previo EVALUACION_PRIORIDAD y reporte de cierre VERIFICACION_CIERRE	Caso A: personasAfectadas 4 -> 6 con REQUIERE_CUADRILLA y FIBE; Caso B: 2 -> 2 con NO_ABORDABLE	Caso A: badge Modificado respecto a prioridad (Antes: 4), Requiere Ficha FIBE, galería HU-43; Caso B: (Rescatado del reporte de prioridad sin cambios), Motivo, No requiere Ficha FIBE	Validado en ambos escenarios en MisionDetalleModal.test.tsx	APROBADO	24/11/2026 01:05	-	feat(mando): distinguir reporte VERIFICACION_CIERRE, trasladar FIBE y comparar personas afectadas (H39)
TC-H39-WEB-13	Sincronización en vivo de MisionDetalleModal al recibir cierre H39 por WebSocket	Tiempo Real / Modal	Componente	Alta	MisionDetalleModal abierto sobre misión EN_CURSO cuando se emite cierre en terreno	WS incidente:actualizado con detallesEvaluacion, NO_ABORDABLE, y mision:actualizada	Modal actualiza detallesEvaluacion, patrulla.estado = 'DISPONIBLE', incidente.motivoNoAbordable/fechaCierre y bitacoraTiempos	Modal ignora detallesEvaluacion, mantiene patrulla sin liberar y omite motivo/cierre en incidente y bitácora (BUG-H39-WEB-04)	FALLIDO	24/11/2026 01:05	(Pendiente)	Pendiente (Rechazado en Code Review)
TC-H39-WEB-14	Humanización de enums y eliminación de prefijos duplicados en MisionBitacoraSection y estadoUtils	UI / Usabilidad	Utilidad / Componente	Media	Misión con hitos MISION_DESPACHADA, PRIORIDAD_ASIGNADA y VERIFICACION_COMPLETADA	Descripciones con patrulla Patrulla Lenteja, BAJA, CRITICA, NO_ABORDABLE, REQUIERE_CUADRILLA	Textos legibles (Patrulla Lenteja, Baja, Crítica, No Abordable, Requiere Cuadrilla) sin valores crudos	Validado en estadoUtils.test.ts y MisionDetalleModal.test.tsx	APROBADO	24/11/2026 01:05	-	fix(mando): humanizar enums y descripciones en bitacora cronologica de mision
TC-H39-WEB-15	Exposición de error HTTP 500 distinto de 403 al listar incidentes en useIncidentesKanban	Resiliencia / Manejo Errores	Hook	Alta	Peticiones de columnas retornan HTTP 500	listarIncidentes retorna { exito: false, codigoError: 500, mensaje: 'Error interno...' }	Hook expone error al usuario (esForbidden: false) en lugar de mostrar tablero vacío silenciosamente	Validado en useIncidentesKanban.test.ts	APROBADO	24/11/2026 01:05	-	fix(kanban): exponer errores HTTP distintos de 403 al listar incidentes
TC-H39-WEB-16	Coherencia entre docs/manuals/H39-informe-verificacion-cierre-mando.md, estandar-tarjetas-reportes-mando.md y comportamiento real de UI	Documentación / CA-4	Repositorio	Media	Inspección de manuales H39 y cambios de be98556	docs/manuals/H39-informe-verificacion-cierre-mando.md, estandar-tarjetas-reportes-mando.md	Manuales reflejan exactamente los campos visibles en la UI y concuerdan con CA-4 aprobado	Manuales documentan visualización de Estado del terreno eliminada en be98556 (BUG-H39-WEB-05)	FALLIDO	24/11/2026 01:05	(Pendiente)	Pendiente (Rechazado en Code Review)
TC-H39-WEB-17	Cumplimiento de guía visual municipal (GEMINI.md §3): Chip, Sentence Case y ausencia de emojis	Guía Visual / UI	Componente	Media	Renderizado de componentes H39 e inspección de badges en IncidenteDetalleDrawer y ToastItem	Inspección DOM/CSS y regex Unicode /\p{Extended_Pictographic}/u	0 emojis, esquinas rectas 0px, uso exclusivo de Chip y Sentence Case sin ALL CAPS	0 emojis y 0px en tarjetas, pero IncidenteDetalleDrawer usa span inline uppercase y ToastItem muestra priorityBadge en crudo (BUG-H39-WEB-06)	FALLIDO	24/11/2026 01:05	(Pendiente)	Pendiente (Rechazado en Code Review)
TC-H39-WEB-18	Control de acceso RBAC en acciones derivadas de cierre en IncidenteDetalleDrawer y KanbanBoard	Seguridad / RBAC	Componente	Crítica	Usuario autenticado sin permiso misiones:asignar visualizando incidente VERIFICANDO cerrado con REQUIERE_CUADRILLA	usePuedeAsignarMision() / auth.tienePermiso('misiones:asignar') retornando false	Se visualiza el informe técnico de cierre, pero la barra y botón Despachar Cuadrilla no se renderizan	Validado en IncidenteDetalleDrawer.tsx (puedeDespacharCuadrilla condicionado a tienePermisoAsignar) y IncidenteCard.test.tsx	APROBADO	24/11/2026 01:05	-	feat(mando): distinguir reporte VERIFICACION_CIERRE, trasladar FIBE y comparar personas afectadas (H39)
````

---

## 5. Guía de Ejecución Paso a Paso y Evidencias Técnicas Replicables

### 5.1. Análisis Estático ESLint (`npm run lint`) — Evidencia de `BUG-H39-WEB-01`

```bash
npm run lint
```

*Resultado real observado (`24/11/2026 01:05`, código de salida `1`):*
```text
/home/ds2fery/Documentos/Proyecto/sgrai-uach/web/src/components/mando/IncidentesKpiCards.tsx
  120:5  error  Calling setState synchronously within an effect can trigger cascading renders  react-hooks/set-state-in-effect

/home/ds2fery/Documentos/Proyecto/sgrai-uach/web/src/components/mando/KanbanBoard.tsx
   46:10  warning  'Zap' is defined but never used  @typescript-eslint/no-unused-vars
  109:32  error    `setIncidenteSeleccionadoId` is accessed before it is declared  react-hooks/immutability
  117:5   warning  React Hook React.useCallback has a missing dependency: 'setIncidenteSeleccionadoId'  react-hooks/exhaustive-deps
  276:5   warning  React Hook React.useCallback has a missing dependency: 'setIncidenteSeleccionadoId'  react-hooks/exhaustive-deps
  318:5   warning  React Hook React.useCallback has a missing dependency: 'setIncidenteSeleccionadoId'  react-hooks/exhaustive-deps
  406:5   warning  React Hook React.useCallback has a missing dependency: 'setIncidenteSeleccionadoId'  react-hooks/exhaustive-deps
  485:3   error    Cannot access refs during render  react-hooks/refs

/home/ds2fery/Documentos/Proyecto/sgrai-uach/web/src/components/mando/mision/MisionReportesSection.tsx
  403:74  error  Compilation Skipped: Existing memoization could not be preserved  react-hooks/preserve-manual-memoization
  408:27  error  Compilation Skipped: Existing memoization could not be preserved  react-hooks/preserve-manual-memoization
  433:26  error  Compilation Skipped: Existing memoization could not be preserved  react-hooks/preserve-manual-memoization

/home/ds2fery/Documentos/Proyecto/sgrai-uach/web/src/components/ui/ToastItem.tsx
  48:39  error  Cannot call impure function during render (Date.now)  react-hooks/purity

/home/ds2fery/Documentos/Proyecto/sgrai-uach/web/src/hooks/__tests__/useIncidentesKanban.test.ts
  20:27  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  21:32  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  22:27  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

✖ 28 problems (10 errors, 18 warnings)
```

### 5.2. Compilación de Producción y Verificación TypeScript

```bash
npx next build --webpack
npx tsc --noEmit
```

*Resultados reales observados (`24/11/2026 01:05`):*
- `npx next build --webpack`: compilación exitosa en `8.6s`, TypeScript finalizado en `9.2s`, `47/47` rutas generadas (`Exit code: 0`).
- `npx tsc --noEmit`: `Exit code: 0` tras regenerar `.next/types/` mediante `next build` *(nota: la ejecución previa al build reportó 3 errores sobre `.next/types/app/(mando)/eventos-atp/recuperacion/[id]/page.ts` por caché residual de una rama anterior)*.

### 5.3. Ejecución Automatizada de Pruebas Unitarias y de Integración (Vitest)

1. **Filtro específico de casos HU-39 con `-t`:**
   ```bash
   npm test -- -t "VERIFICACION_CIERRE|NO_ABORDABLE|REQUIERE_CUADRILLA|comparativa de personas"
   ```
   *Resultado real observado:*
   ```text
    ✓ src/components/mando/__tests__/IncidenteDetalleDrawer.test.tsx (21 tests | 19 skipped) 830ms
      ✓ muestra el informe VERIFICACION_CIERRE con dictamen REQUIERE_CUADRILLA, comparativa de personas afectadas y Ficha FIBE (H39) 646ms
    ✓ src/components/mando/mision/__tests__/MisionDetalleModal.test.tsx (18 tests | 16 skipped) 450ms
    ✓ src/components/mando/__tests__/IncidenteCard.test.tsx (17 tests | 16 skipped) 179ms
    ✓ src/hooks/__tests__/useIncidentesKanban.test.ts (9 tests | 7 skipped) 151ms
    ✓ src/components/seguimiento/__tests__/SeguimientoStepper.test.tsx (5 tests | 4 skipped) 91ms
    ✓ src/hooks/__tests__/useEncargadoKanbanSocket.test.ts (12 tests | 10 skipped) 47ms
    ✓ src/lib/utils/__tests__/estadoUtils.test.ts (21 tests | 17 skipped) 62ms

    Test Files  7 passed | 122 skipped (129)
         Tests  14 passed | 895 skipped (909)
      Duration  23.52s
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
   *Resultado real observado:*
   ```text
    ✓ src/lib/utils/__tests__/estadoUtils.test.ts (21 tests) 26ms
    ✓ src/components/mando/__tests__/IncidenteCard.test.tsx (17 tests) 759ms
    ✓ src/components/mando/__tests__/IncidenteMisionesSection.test.tsx (16 tests) 1260ms
    ✓ src/components/mando/mision/__tests__/MisionDetalleModal.test.tsx (18 tests) 1679ms
    ✓ src/components/mando/__tests__/IncidenteDetalleDrawer.test.tsx (21 tests) 2311ms

    Test Files  9 passed (9)
         Tests  123 passed (123)
      Duration  7.03s
   ```

3. **Suite Global de Regresión (`npm test`):**
   ```bash
   npm test
   ```
   *Resultado real observado:*
   ```text
    Test Files  129 passed (129)
         Tests  909 passed (909)
      Duration  31.51s
   ```

### 5.4. Pruebas de Integración de Contrato HTTP (cURL) y Regeneración OpenAPI frente a `sgrai-api`

En el entorno de esta auditoría el servicio `sgrai-api` en `http://localhost:3001` no se encontró activo (`curl -s -m 2 -o /dev/null -w "%{http_code}" http://localhost:3001/openapi.json` retornó `000`), por lo cual la verificación de contratos se realizó contrastando `src/types/api-generated.d.ts` y los servicios de `sgrai-web` contra el código fuente, esquemas Zod y registro OpenAPI de `sgrai-api` (`feature/h39-patrulla-enviar-reporte-cerrar`).

Comandos de replicación contra instancia activa de `sgrai-api`:

1. **Regenerar contrato OpenAPI en `sgrai-web` (Verificación de `BUG-H39-WEB-03`):**
   ```bash
   npm run generate-api-types
   ```

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
   *Contrato esperado según `EnviarReporteVerificacionResponseSchema` (`201 Created`):*
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

4. **Verificación de proyección en listado Kanban tras recarga (`GET /api/incidentes`, vinculado a `BUG-H39-WEB-03`):**
   ```bash
   curl -s -X GET "http://localhost:3001/api/incidentes?estado=VERIFICANDO&page=1&limit=20" \
     -H "Authorization: Bearer <TOKEN_ENCARGADO>" \
     -H "x-user-id: 00000000-0000-4000-8000-000000000003"
   ```
   *Evidencia estática observada:* `incidente-kanban.schema.ts` e `incidente-kanban.repository.ts` en `sgrai-api` no incluyen `dictamenTerreno` en `IncidenteResumen`, por lo cual `IncidenteCard.tsx` pierde el chip `Requiere Cuadrilla` tras recargar la vista.

---

## 6. Matriz de Trazabilidad de Criterios de Aceptación (Alcance `sgrai-web`)

| Criterio de Aceptación (Alcance Centro de Mando Web) | Caso(s) de Prueba Asociados | Resultado en QA |
| :--- | :--- | :--- |
| **Recepción en tiempo real de eventos `mision:actualizada` e `incidente:actualizado` (`REQUIERE_CUADRILLA` y `NO_ABORDABLE`)** | `TC-H39-WEB-05`, `TC-H39-WEB-06`, `TC-H39-WEB-07`, `TC-H39-WEB-08`, `BUG-H39-WEB-02`, `BUG-H39-WEB-04` | **PARCIAL / FALLIDO** (Kanban en vivo aprueba; `IncidenteDetalleDrawer` y `MisionDetalleModal` presentan fallas en vivo) |
| **Visualización de incidente `NO_ABORDABLE` con `motivoNoAbordable` y `fechaCierre` y bloqueo de despacho de cuadrilla** | `TC-H39-WEB-07`, `TC-H39-WEB-10` | **APROBADO** |
| **Visualización del informe consolidado (`resumenTecnico`, `personasAfectadas` comparadas con H38, `danosEstimados`, `observaciones`, `requiere_asistencia_social` / FIBE y galería H43)** | `TC-H39-WEB-11`, `TC-H39-WEB-12`, `BUG-H39-WEB-05` | **PARCIAL / FALLIDO** (Comparativa FIBE y galería H43 aprueban; desalineación documental y omisión de `estadoTerreno` en `be98556`) |
| **Integridad de contrato OpenAPI y persistencia tras recarga (`api-generated.d.ts`)** | `TC-H39-WEB-04`, `BUG-H39-WEB-03` | **FALLIDO** (`api-generated.d.ts` no regenerado y ausencia de `dictamenTerreno` en `GET /api/incidentes`) |
| **Calidad estática, compilación limpia, guía visual municipal (`GEMINI.md`) y manual de usuario** | `TC-H39-WEB-01`, `TC-H39-WEB-02`, `TC-H39-WEB-03`, `TC-H39-WEB-16`, `TC-H39-WEB-17`, `BUG-H39-WEB-01`, `BUG-H39-WEB-06` | **FALLIDO** (`10` errores ESLint, badge inline `uppercase` en Drawer y desfase de manuales) |
| **Respeto de autorización RBAC en interfaz de Centro de Mando** | `TC-H39-WEB-18` | **APROBADO** |

> *Nota de alcance entre repositorios:* los criterios relativos al formulario táctil de captura de la Patrulla Verificadora, validaciones Zod de longitud mínima en cliente offline, almacenamiento diferido en IndexedDB, endpoint transaccional `POST /api/misiones/{id}/reporte` y validación RBAC `reportes:crear` pertenecen a `sgrai-pwa` y `sgrai-api`, y son auditados en sus respectivos repositorios.

---

## 7. Dictamen de Certificación QA

**Estado Actual:** `RECHAZADO EN AUDITORÍA INICIAL — SUBSANACIÓN REQUERIDA PREVIA A MERGE`

La rama `feature/h39-patrulla-enviar-reporte-cerrar` **no es apta para merge hacia `develop`** hasta resolver los 6 defectos registrados:
1. Subsanar los **10 errores bloqueantes de ESLint** en `KanbanBoard.tsx`, `MisionReportesSection.tsx`, `IncidentesKpiCards.tsx`, `ToastItem.tsx` y `useIncidentesKanban.test.ts` (`BUG-H39-WEB-01`).
2. Corregir la actualización en vivo de `detalle.ultimoReporte`, la liberación de `patrulla.estado` y el filtrado de misiones activas en `IncidenteDetalleDrawer.tsx` (`BUG-H39-WEB-02`).
3. Coordinar con `sgrai-api` la proyección de `dictamenTerreno` en `GET /api/incidentes`, regenerar `src/types/api-generated.d.ts` con `npm run generate-api-types` y remover las extensiones manuales de contrato (`BUG-H39-WEB-03`).
4. Corregir el mapeo de `detallesEvaluacion`, `patrulla.estado`, `incidente.motivoNoAbordable`/`fechaCierre` y suscripción de bitácora en `MisionDetalleModal.tsx` (`BUG-H39-WEB-04`).
5. Alinear `docs/manuals/H39-informe-verificacion-cierre-mando.md` y `docs/manuals/estandar-tarjetas-reportes-mando.md` con la decisión final de producto sobre `estadoTerreno` respecto a CA-4 (`BUG-H39-WEB-05`).
6. Estandarizar el badge inline de `IncidenteDetalleDrawer.tsx` mediante `<Chip />`, formatear `toast.priorityBadge` en `ToastItem.tsx` y limpiar `tieneMisionEnCurso` tras cierres `REQUIERE_CUADRILLA` (`BUG-H39-WEB-06`).

