# Plan y Reporte de Pruebas QA — HU-20: Asignar Patrulla Verificadora a Incidente (Frontend / Web)

**Proyecto:** SGRAI — Sistema de Gestión de Recursos para Atención de Incidentes (DGRD Municipalidad de Valdivia)  
**Repositorio:** `sgrai-web`  
**Rama Evaluada:** `feature/h20-asignar-patrulla-verificacion`  
**Desarrollador Asignado:** Mayra Carrillo (`@MayraCarrillo`)  
**Historia de Usuario:** HU-20 — *Como Encargado Quiero asignar una patrulla verificadora disponible a un incidente para que evalúe y verifique las necesidades reales en terreno Para desplegar de inmediato personal calificado que levante el diagnóstico técnico antes de movilizar recursos pesados o cuadrillas.*  
**Estado de Certificación QA:** `APROBADO (RE-TEST SUPERADO 100% — 20/20 CASOS APROBADOS)`  
**Fecha de Ejecución Inicial:** `08/11/2026 12:36`  
**Fecha de Re-Test:** `08/11/2026 21:25`

---

## 1. Resumen Ejecutivo de Auditoría y Ciclo de Re-Test

Durante la iteración inicial de auditoría estática, contractual y dinámica sobre la rama `feature/h20-asignar-patrulla-verificacion` del repositorio `sgrai-web`, se evaluaron **20 escenarios de prueba**, identificándose **5 defectos reales** (`BUG-H20-WEB-01` a `BUG-H20-WEB-05`: **1 Crítico**, **2 Altos** y **2 Medios**) relacionados con la omisión del contrato OpenAPI de `POST /api/misiones` en `api-generated.d.ts`, ocultamiento del botón de despacho en el Drawer cuando un incidente `REPORTADO` registraba misiones previas, ausencia de verificación preventiva RBAC (`misiones:asignar`) en los controles de UI, desincronización de `totalMisiones` y `paginacionColumna` en `useIncidentesKanban`, y errores de linter estático ESLint junto con advertencias `act(...)` en pruebas de WebSocket.

En la fase de **Re-Test** (`08/11/2026 21:25`), tras la integración de las correcciones en el commit `fix(mando): solventar observaciones de QA para despacho de patrulla (H20)`, se verificó la subsanación completa de la totalidad de los hallazgos:

- **100% de defectos corregidos y verificados en Re-Test (`5/5`)**.
- **100% de casos de prueba aprobados en la matriz consolidada (`20/20`)**.
- **59/59 pruebas automatizadas en Vitest aprobadas (`8/8` suites)** sin advertencias `act(...)` en `stderr`.
- **0 errores y 0 advertencias en análisis estático ESLint (`npx eslint`)** y **0 errores de compilación TypeScript (`npx tsc --noEmit`)**.

| Métrica de Calidad | Auditoría Inicial (`08/11/2026 12:36`) | Re-Test (`08/11/2026 21:25`) | Estado Final |
| :--- | :--- | :--- | :--- |
| **Total de Casos en Matriz** | 20 (`5` Defectos + `15` Casos) | 20 (`5` Defectos Corregidos + `15` Casos) | **20 / 20 Evaluados** |
| **Casos Aprobados / Corregidos** | 15 / 20 (`75%`) | 20 / 20 (`100%`) | **100% Aprobado** |
| **Defectos Abiertos (`ABIERTO`)** | 5 (`1` Crítico, `2` Altos, `2` Medios) | 0 | **0 Defectos Abiertos** |
| **Pruebas Automatizadas Vitest (Suites HU-20)** | 53 / 53 tests (`6` suites, 3 warnings `act(...)`) | 59 / 59 tests (`8` suites, 0 warnings) | **100% Passing** |
| **Verificación de Tipos (`npx tsc --noEmit`)** | 0 errores | 0 errores | **Cumple** |
| **Análisis Estático (`npx eslint`)** | Fallido (`2` errores, `5` warnings) | 0 errores, 0 warnings | **Cumple** |

---

## 2. Registro Técnico de Defectos Verificados en Re-Test

### 2.1. `BUG-H20-WEB-01` (Severidad: Crítica — Resuelto) — Integración de contrato OpenAPI para `POST /api/misiones` en `api-generated.d.ts`, derivación de tipos en `misiones.ts` y uso de `apiClient.POST` con `tipoMision: 'VERIFICACION'`
- **Estado:** `APROBADO`
- **Archivos verificados:**
  - `src/types/api-generated.d.ts` (líneas 3249–3412)
  - `src/types/misiones.ts` (líneas 190–200)
  - `src/services/misionesService.ts` (líneas 242–321)
  - `src/services/__tests__/misionesService.test.ts` (líneas 215–340)
- **Resolución verificada:**
  1. Se incorporó la especificación tipada `paths['/api/misiones']['post']` en `src/types/api-generated.d.ts`, definiendo cabeceras (`x-user-id`, `authorization`), cuerpo (`incidenteId`, `patrullaId`, `tipoMision`, `titulo`, `descripcion`, `prioridad`) y esquemas de respuesta (`201`, `400`, `401`, `403`, `404`, `409`, `500`).
  2. En `src/types/misiones.ts`, los tipos `CrearMisionRequestBody`, `CrearMisionResponse201`, `DespacharPatrullaPayload`, `DespacharPatrullaResponseData` y `DespacharPatrullaResponse` se derivan directamente del contrato OpenAPI generado.
  3. En `src/services/misionesService.ts`, `despacharPatrulla` invoca `apiClient.POST('/api/misiones', ...)` incluyendo explícitamente `tipoMision: 'VERIFICACION'`.

### 2.2. `BUG-H20-WEB-02` (Severidad: Alta — Resuelto) — Visibilidad del botón de despacho en `IncidenteDetalleDrawer` con misiones previas no activas y habilitación en `IncidenteDetalleHeader`
- **Estado:** `APROBADO`
- **Archivos verificados:**
  - `src/components/mando/drawer/IncidenteMisionesSection.tsx` (líneas 25–75)
  - `src/components/mando/drawer/IncidenteDetalleHeader.tsx` (líneas 46–58)
  - `src/components/mando/IncidenteDetalleDrawer.tsx` (líneas 107–112 y 134–140)
  - `src/components/mando/__tests__/IncidenteMisionesSection.test.tsx` (líneas 61–79)
- **Resolución verificada:**
  1. En `IncidenteMisionesSection.tsx`, se desacopló la visibilidad del botón `"Despachar Patrulla Verificadora"` de `misiones.length === 0`, evaluando `incidenteEstado === 'REPORTADO' && !tieneVerificacionActiva && Boolean(onAsignarPatrulla) && puedeAsignar`. De este modo, si el incidente tiene misiones previas canceladas/rechazadas o de otro tipo pero continúa en `REPORTADO` sin verificación en curso, el botón permanece disponible.
  2. En `IncidenteDetalleHeader.tsx`, se conectó y renderizó el botón primario `"Asignar Patrulla"` en la cabecera del Drawer cuando `detalle?.estado === 'REPORTADO' && onAsignarPatrulla && puedeAsignar`.

### 2.3. `BUG-H20-WEB-03` (Severidad: Alta — Resuelto) — Validación preventiva del permiso RBAC `misiones:asignar` mediante `usePuedeAsignarMision` y filtrado defensivo `DISPONIBLE` en `AsignarPatrullaModal`
- **Estado:** `APROBADO`
- **Archivos verificados:**
  - `src/hooks/usePuedeAsignarMision.ts` (líneas 1–14)
  - `src/components/mando/KanbanBoard.tsx`, `src/components/mando/KanbanColumn.tsx`, `src/components/mando/IncidenteCard.tsx`, `src/components/mando/IncidenteDetalleDrawer.tsx`
  - `src/components/mando/patrullas/AsignarPatrullaModal.tsx` (líneas 82–87)
  - `src/components/mando/__tests__/IncidenteCard.test.tsx` (líneas 105–120) y `src/components/mando/__tests__/IncidenteMisionesSection.test.tsx` (líneas 81–96)
- **Resolución verificada:**
  1. Se implementó el hook `usePuedeAsignarMision`, que verifica `context.hasPermission('misiones:asignar') || Boolean(context.usuarioActivo?.esAdmin)` en `SimulatedSessionContext` y propaga `puedeAsignarPatrulla` / `puedeAsignar` hacia las tarjetas del Kanban y las secciones del Drawer, ocultando preventivamente los botones de despacho a usuarios sin permiso.
  2. En `AsignarPatrullaModal.tsx`, la respuesta de `listarPatrullasDisponibles` se filtra defensivamente en cliente con `p.estado === 'DISPONIBLE' && (p as unknown as { activo?: boolean }).activo !== false`, asegurando el cumplimiento estricto del CA-2.

### 2.4. `BUG-H20-WEB-04` (Severidad: Media — Resuelto) — Incremento reactivo de `totalMisiones` y actualización dinámica de `paginacionColumna` en `useIncidentesKanban`
- **Estado:** `APROBADO`
- **Archivos verificados:**
  - `src/hooks/useIncidentesKanban.ts` (líneas 312–451)
  - `src/hooks/__tests__/useIncidentesKanban.test.ts` (líneas 1–106)
- **Resolución verificada:**
  1. Tanto en `moverIncidenteAEstado` como en `handleIncidenteActualizado`, cuando un incidente transita de `REPORTADO` a `VERIFICANDO`, su propiedad `totalMisiones` se actualiza a `Math.max(1, (prev[est][idx].totalMisiones || 0) + 1)`.
  2. `setPaginacionColumna` calcula dinámicamente los totales restando `1` en `columnaOrigenDetectada` y sumando `1` en `nuevoEstado`, tanto para despachos originados localmente como para eventos `incidente:actualizado` recibidos vía Socket.io.

### 2.5. `BUG-H20-WEB-05` (Severidad: Media — Resuelto) — Corrección de errores ESLint y eliminación de advertencias `act(...)` en `useEncargadoKanbanSocket.test.ts`
- **Estado:** `APROBADO`
- **Archivos verificados:**
  - `src/components/mando/patrullas/AsignarPatrullaModal.tsx` (líneas 47–48 y 109–122)
  - `src/hooks/useEncargadoKanbanSocket.ts` (líneas 102–136)
  - `src/hooks/__tests__/useEncargadoKanbanSocket.test.ts` (líneas 9–14)
- **Resolución verificada:**
  1. En `AsignarPatrullaModal.tsx`, se encapsularon las invocaciones de actualización dentro de `queueMicrotask` en el efecto de apertura y se tiparon las funciones `showSuccess` y `showError` sin parámetros no utilizados.
  2. En `useEncargadoKanbanSocket.ts`, `handleActualizado` recibe `payload: unknown` con refinamiento de tipos seguro, eliminando el uso de `any`.
  3. En `useEncargadoKanbanSocket.test.ts`, se corrigió el mock de `connect` evitando mutaciones sincrónicas fuera de `act(...)`. La ejecución de `npx eslint` y `npx vitest run` finaliza con `0` errores y `0` advertencias.

---

## 3. Matriz Consolidada de Casos de Prueba (13 Columnas)

| ID Caso | Título del Caso de Prueba | Tipo de Prueba | Nivel | Prioridad | Precondición | Datos de Prueba (Payload / Headers / Query) | Resultado Esperado | Resultado Obtenido | Estado | Fecha / Hora Ejecución | Fecha / Hora Re-Test | Solución / Commit |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **BUG-H20-WEB-01** | Omisión de contrato OpenAPI en `api-generated.d.ts`, tipos manuales en `misiones.ts` y uso de `fetch` nativo sin `tipoMision: 'VERIFICACION'` | Contrato OpenAPI / Arquitectura | Servicio / Tipos | Crítica | Inspección de `src/types/api-generated.d.ts`, `src/types/misiones.ts` y `src/services/misionesService.ts`. | `POST /api/misiones` con payload `{ incidenteId, patrullaId, tipoMision: 'VERIFICACION', titulo, prioridad }` mediante `apiClient.POST('/api/misiones')` | `paths['/api/misiones']['post']` tipado en `api-generated.d.ts`, tipos derivados del contrato OpenAPI y llamada mediante `apiClient.POST` incluyendo `tipoMision: 'VERIFICACION'`. | En Re-Test: Se incorporó `paths['/api/misiones']['post']` en `api-generated.d.ts`, se derivaron los tipos en `misiones.ts` y `despacharPatrulla` utiliza `apiClient.POST` enviando `tipoMision: 'VERIFICACION'`. | APROBADO | 08/11/2026 12:36 | 08/11/2026 21:25 | fix(mando): solventar observaciones de QA para despacho de patrulla (H20) |
| **BUG-H20-WEB-02** | Ocultamiento del botón de asignación en el Drawer cuando un incidente `REPORTADO` tiene misiones previas y omisión en `IncidenteDetalleHeader` | Funcional / UI (CA-1) | Componente | Alta | Incidente en estado `REPORTADO` con al menos 1 misión previa (ej. `RECHAZADA`, `CANCELADA` o `ASISTENCIA_SOCIAL`) abierto en `IncidenteDetalleDrawer`. | Props: `detalle={{ estado: 'REPORTADO', misiones: [misionPrevia] }}` en `IncidenteDetalleDrawer` | El Drawer mantiene visible y accesible el botón para asignar una patrulla verificadora en la cabecera y en la sección de misiones mientras el incidente esté en `REPORTADO` sin verificación activa. | En Re-Test: `IncidenteMisionesSection` verifica `!tieneVerificacionActiva` mostrando el botón aun con misiones previas, e `IncidenteDetalleHeader` renderiza el botón `Asignar Patrulla` en la cabecera. | APROBADO | 08/11/2026 12:36 | 08/11/2026 21:25 | fix(mando): solventar observaciones de QA para despacho de patrulla (H20) |
| **BUG-H20-WEB-03** | Ausencia de control preventivo RBAC (`misiones:asignar`) en botones de despacho y falta de filtrado defensivo `DISPONIBLE` en `AsignarPatrullaModal` | Seguridad RBAC / Regla ICS (CA-2 / CA-7) | Componente / Integración | Alta | Usuario sin permiso `misiones:asignar` en `KanbanBoard` o catálogo que retorna patrullas con `estado !== 'DISPONIBLE'`. | Render de `KanbanBoard` / `IncidenteCard` con `puedeAsignarPatrulla=false`; respuesta de `listarPatrullasDisponibles` con unidades mixtas | Controles de asignación ocultos sin `misiones:asignar` y selector filtrando estrictamente `p.estado === 'DISPONIBLE' && p.activo !== false`. | En Re-Test: El hook `usePuedeAsignarMision` oculta los botones de despacho si falta `misiones:asignar` y `AsignarPatrullaModal` filtra defensivamente `estado === 'DISPONIBLE'` y `activo !== false`. | APROBADO | 08/11/2026 12:36 | 08/11/2026 21:25 | fix(mando): solventar observaciones de QA para despacho de patrulla (H20) |
| **BUG-H20-WEB-04** | Falta de incremento de `totalMisiones` al mover tarjeta a `VERIFICANDO` y actualización estática de `paginacionColumna` en `useIncidentesKanban` | Funcional / Reactividad (CA-6) | Hook / Estado | Media | Tablero Kanban con incidente en `REPORTADO` (`totalMisiones: 0`) que pasa a `VERIFICANDO` por despacho o evento Socket.io. | `moverIncidenteAEstado('inc-100', 'VERIFICANDO')` y evento `incidente:actualizado` en `useIncidentesKanban` | La tarjeta en `VERIFICANDO` refleja `totalMisiones: 1` y `paginacionColumna` actualiza dinámicamente `columnaOrigen` y `nuevoEstado` tanto en acción local como por WebSocket. | En Re-Test: `moverIncidenteAEstado` y `handleIncidenteActualizado` incrementan `totalMisiones` y recalculan dinámicamente `paginacionColumna` para origen y destino. | APROBADO | 08/11/2026 12:36 | 08/11/2026 21:25 | fix(mando): solventar observaciones de QA para despacho de patrulla (H20) |
| **BUG-H20-WEB-05** | Fallo de análisis estático `npx eslint` (2 errores y 5 warnings) en archivos de HU-20 y advertencias `act(...)` en `useEncargadoKanbanSocket.test.ts` | Calidad de Código / CI | Estático / Unitario | Media | Ejecución de linter institucional y suite de pruebas de WebSocket. | `npx eslint src/components/mando/patrullas/AsignarPatrullaModal.tsx src/hooks/useEncargadoKanbanSocket.ts src/components/mando/drawer/IncidenteDetalleHeader.tsx` | `0` errores y `0` warnings en ESLint; `0` advertencias de `act(...)` en `stderr` durante la ejecución de Vitest. | En Re-Test: `npx eslint` finaliza con `0` errores y `0` warnings (`exit code 0`), y `useEncargadoKanbanSocket.test.ts` pasa sin advertencias `act(...)`. | APROBADO | 08/11/2026 12:36 | 08/11/2026 21:25 | fix(mando): solventar observaciones de QA para despacho de patrulla (H20) |
| **TC-H20-WEB-01** | Renderizado del botón "Despachar Patrulla Verificadora" en `IncidenteDetalleDrawer` para incidente en estado `REPORTADO` sin misiones | Funcional (CA-1) | Componente | Alta | Incidente con `estado: 'REPORTADO'` y `misiones: []` cargado en `IncidenteDetalleDrawer`. | `incidenteId="inc-reportado-1"`, `detalle={{ id: 'inc-reportado-1', codigo: 'INC-2026-9999', estado: 'REPORTADO', misiones: [] }}` | Se muestra el botón `"Despachar Patrulla Verificadora"` y al pulsarlo se abre el diálogo `Asignar Patrulla Verificadora`. | El botón se renderiza en la cabecera y en la sección de misiones, abriendo `AsignarPatrullaModal` con los datos del incidente. | APROBADO | 08/11/2026 12:36 | 08/11/2026 21:25 | feat(mando): incorporar modal de asignacion rapida de patrulla en drawer de incidente |
| **TC-H20-WEB-02** | Ocultamiento del botón de asignación en `IncidenteDetalleDrawer` para incidentes en estado `VERIFICANDO`, `EN_ATENCION` o `RESUELTO` | Funcional / Regla ICS (CA-1) | Componente | Alta | Incidente con `estado: 'EN_ATENCION'` cargado en `IncidenteDetalleDrawer`. | `incidenteId="i1000000-0000-4000-8000-000000000001"`, `estado: 'EN_ATENCION'` | El botón `"Despachar Patrulla Verificadora"` no se renderiza en el DOM, previniendo despachos duplicados de verificación. | `queryByRole('button', { name: /Despachar Patrulla/i })` retorna `null`. | APROBADO | 08/11/2026 12:36 | 08/11/2026 21:25 | feat(mando): incorporar modal de asignacion rapida de patrulla en drawer de incidente |
| **TC-H20-WEB-03** | Renderizado del botón "Asignar Patrulla" en `IncidenteCard` solo para incidentes en estado `REPORTADO` con `stopPropagation` | Funcional (CA-1) | Componente | Alta | Tarjeta `IncidenteCard` montada en columna `REPORTADO` con callback `onAsignarPatrulla`. | `incidente={{ id: 'inc-001', codigo: 'INC-58291045', estado: 'REPORTADO' }}`, clic en botón `Asignar Patrulla` | Invoca `onAsignarPatrulla(incidente)` 1 vez sin disparar el `onClick` de apertura del Drawer; en estado `VERIFICANDO` o sin permiso el botón no existe. | Se invoca `onAsignarPatrulla` sin propagar el clic al contenedor y se oculta en estados posteriores o cuando `puedeAsignarPatrulla` es `false`. | APROBADO | 08/11/2026 12:36 | 08/11/2026 21:25 | fix(mando): actualizar kanban reactivamente al despachar y habilitar boton en tarjeta |
| **TC-H20-WEB-04** | Consulta de patrullas con filtro `estado=DISPONIBLE` mediante `listarPatrullasDisponibles` en `patrullasService` | Funcional / API (CA-2) | Unitario / Servicio | Alta | Invocación de `listarPatrullasDisponibles('user-encargado')`. | `GET /api/patrullas?page=1&limit=100&estado=DISPONIBLE` con header `x-user-id: user-encargado` | El servicio solicita exclusivamente patrullas con `estado=DISPONIBLE` y `limit=100`, retornando el arreglo tipado de unidades disponibles. | `fetch` es llamado con `/api/patrullas?page=1&limit=100&estado=DISPONIBLE` y retorna `exito: true` con las unidades disponibles. | APROBADO | 08/11/2026 12:36 | 08/11/2026 21:25 | feat(services): implementar metodos de asignacion y consulta de patrullas disponibles |
| **TC-H20-WEB-05** | Carga del selector de patrullas disponibles y vista previa de delegación y líder en `AsignarPatrullaModal` | Funcional / UI (CA-1 / CA-2) | Componente | Alta | Apertura de `AsignarPatrullaModal` con 2 patrullas disponibles (`pat-001`, `pat-002`). | `isOpen=true`, `incidente={mockIncidente}`, `mockPatrullasDisponibles` con delegación y líder | El `<select>` lista las patrullas disponibles, preselecciona la primera y muestra la tarjeta de vista previa con delegación, líder y teléfono. | El `combobox` renderiza ambas opciones y muestra los detalles de dotación de la unidad seleccionada. | APROBADO | 08/11/2026 12:36 | 08/11/2026 21:25 | feat(mando): incorporar modal de asignacion rapida de patrulla en drawer de incidente |
| **TC-H20-WEB-06** | Estado informativo y bloqueo del botón de confirmación cuando no existen patrullas `DISPONIBLE` en la comuna | Funcional / Borde (CA-2) | Componente | Alta | `listarPatrullasDisponibles` retorna `data: []` (`0` patrullas disponibles). | `GET /api/patrullas?page=1&limit=100&estado=DISPONIBLE` -> `{ data: [], meta: { total: 0 } }` | Se muestra un `InlineNotice` informando que no existen patrullas en estado `DISPONIBLE` y el botón `"Confirmar y Despachar"` permanece `disabled`. | El aviso informativo se renderiza y el botón de envío queda deshabilitado preventivamente. | APROBADO | 08/11/2026 12:36 | 08/11/2026 21:25 | feat(mando): incorporar modal de asignacion rapida de patrulla en drawer de incidente |
| **TC-H20-WEB-07** | Despacho exitoso de patrulla verificadora (`201 Created`) en `misionesService.despacharPatrulla` mediante `apiClient.POST` | Funcional / Integración (CA-3) | Unitario / Servicio | Crítica | Incidente en `REPORTADO` y patrulla en `DISPONIBLE`. | `POST /api/misiones` body `{ incidenteId: 'inc-100', patrullaId: 'pat-100', tipoMision: 'VERIFICACION', titulo: 'Verificación de anegamiento', prioridad: 'ALTA' }` | Retorna `exito: true` con `mision.estado = 'DESPACHADA'`, `mision.tipoMision = 'VERIFICACION'`, `incidente.estado = 'VERIFICANDO'` y `patrulla.estado = 'EN_VERIFICACION'`. | `apiClient.POST` procesa la respuesta `201 Created` y devuelve la estructura consolidada de la transacción atómica. | APROBADO | 08/11/2026 12:36 | 08/11/2026 21:25 | fix(mando): solventar observaciones de QA para despacho de patrulla (H20) |
| **TC-H20-WEB-08** | Flujo completo de confirmación en `AsignarPatrullaModal`: envío, notificación Toast, callback `onAsignacionExitosa` y cierre | Funcional / Integración (CA-3 / CA-6) | Componente / Integración | Crítica | Usuario Encargado selecciona patrulla `pat-001` y pulsa `"Confirmar y Despachar"`. | Submit en `AsignarPatrullaModal` con `incidenteId: 'inc-001'`, `patrullaId: 'pat-001'`, `tipoMision: 'VERIFICACION'` | Invoca `despacharPatrullaVerificadora`, emite `showSuccess` con el código `MIS-2026-8341`, ejecuta `onAsignacionExitosa(res.data)` y cierra el modal. | Se ejecutan `despacharPatrullaVerificadora`, `showSuccess`, `onAsignacionExitosa` y `onClose` satisfactoriamente. | APROBADO | 08/11/2026 12:36 | 08/11/2026 21:25 | feat(mando): incorporar modal de asignacion rapida de patrulla en drawer de incidente |
| **TC-H20-WEB-09** | Validación previa en cliente cuando `incidenteId` o `patrullaId` están vacíos en `despacharPatrullaVerificadora` | Validación / Borde (CA-3) | Unitario / Servicio | Media | Invocación a `despacharPatrullaVerificadora({ incidenteId: '', patrullaId: 'p-1' })`. | Payload incompleto `{ incidenteId: '', patrullaId: 'p-1' }` | Retorna `{ exito: false, codigoError: 400 }` sin realizar petición HTTP al servidor. | El servicio aborta localmente con código `400` y `apiClient.POST` registra `0` llamadas. | APROBADO | 08/11/2026 12:36 | 08/11/2026 21:25 | feat(services): implementar metodos de asignacion y consulta de patrullas disponibles |
| **TC-H20-WEB-10** | Manejo de colisión de concurrencia (`409 Conflict`) con alerta al Encargado y recarga automática de patrullas disponibles | Concurrencia (CA-5) | Componente / Integración | Crítica | La patrulla seleccionada cambia a no disponible concurrentemente antes de confirmar el despacho. | `POST /api/misiones` responde `409 Conflict` `{ message: 'La patrulla seleccionada ya no se encuentra disponible.' }` | El modal muestra `InlineNotice` de error y Toast de conflicto, mantiene abierto el diálogo e invoca automáticamente `listarPatrullasDisponibles` por segunda vez. | Se renderiza el mensaje de conflicto `409`, se dispara `showError` y `listarPatrullasDisponibles` se ejecuta 2 veces actualizando el selector. | APROBADO | 08/11/2026 12:36 | 08/11/2026 21:25 | feat(mando): incorporar modal de asignacion rapida de patrulla en drawer de incidente |
| **TC-H20-WEB-11** | Bloqueo y retroalimentación ante respuesta `403 Forbidden` cuando el usuario carece del permiso `misiones:asignar` | Seguridad RBAC (CA-7) | Componente / Servicio | Crítica | Usuario sin permiso `misiones:asignar` intenta ejecutar `POST /api/misiones`. | `POST /api/misiones` con header `x-user-id` de rol sin permiso -> `403 Forbidden` | El servicio retorna `esForbidden: true` (`403`), el modal muestra aviso indicando que requiere `misiones:asignar` y deshabilita el botón `"Confirmar y Despachar"`. | Se muestra el banner de acceso denegado mencionando `misiones:asignar`, se emite Toast de error y el botón de envío queda deshabilitado. | APROBADO | 08/11/2026 12:36 | 08/11/2026 21:25 | feat(mando): incorporar modal de asignacion rapida de patrulla en drawer de incidente |
| **TC-H20-WEB-12** | Suscripción WebSocket a las salas `encargado`, `sala:encargados` y `mapa` y escucha de `incidente:actualizado` | Tiempo Real / WebSocket (CA-4 / CA-6) | Unitario / Hook | Alta | Montaje de `useEncargadoKanbanSocket` en el Centro de Mando. | Evento `connect` y recepción de payload `incidente:actualizado` `{ datos: { id: 'inc-123', nuevoEstado: 'VERIFICANDO' } }` | El socket emite `join`/`unirse` para `encargado`, `sala:encargados` y `mapa`, normaliza el evento `incidente:actualizado` e invoca `onIncidenteActualizado`. | El hook se suscribe a las salas requeridas al conectar, procesa `incidente:actualizado` sin warnings `act(...)` y limpia suscripciones al desmontar. | APROBADO | 08/11/2026 12:36 | 08/11/2026 21:25 | fix(socket): asegurar suscripcion a salas encargado y mapa para actualizacion reactiva |
| **TC-H20-WEB-13** | Traslado automático de la tarjeta del incidente a la columna `VERIFICANDO` en el tablero Kanban sin refresco manual | Reactividad UI (CA-6) | Integración / Hook | Alta | Incidente `inc-100` en columna `REPORTADO`; se confirma despacho o llega evento `incidente:actualizado`. | Ejecución de `moverIncidenteAEstado('inc-100', 'VERIFICANDO')` o callback `handleIncidenteActualizado` | El incidente se elimina de `columnas.REPORTADO`, se inserta al inicio de `columnas.VERIFICANDO` con `estado: 'VERIFICANDO'`, `totalMisiones: 1` y contadores actualizados. | La tarjeta se traslada reactivamente en memoria de `REPORTADO` a `VERIFICANDO` incrementando `totalMisiones` y actualizando `paginacionColumna`. | APROBADO | 08/11/2026 12:36 | 08/11/2026 21:25 | fix(mando): actualizar kanban reactivamente al despachar y habilitar boton en tarjeta |
| **TC-H20-WEB-14** | Actualización reactiva del estado y listado de misiones dentro de `IncidenteDetalleDrawer` tras confirmar asignación | Funcional / UI (CA-1 / CA-3) | Componente | Media | `IncidenteDetalleDrawer` abierto en incidente `REPORTADO` al completarse `handleAsignacionExitosa`. | `handleAsignacionExitosa({ mision: { id: 'mis-50', codigo: 'MIS-2026-8341', estado: 'DESPACHADA', tipoMision: 'VERIFICACION' }, incidente: { id: 'inc-001', estado: 'VERIFICANDO' }, patrulla: { id: 'pat-001', nombre: 'Patrulla Ánimas Norte 1', estado: 'EN_VERIFICACION' } })` | El Drawer actualiza `detalle.estado` a `'VERIFICANDO'`, agrega la nueva misión a `detalle.misiones` y notifica al Kanban mediante `onIncidenteActualizado`. | El Drawer refleja inmediatamente el estado `VERIFICANDO` y la tarjeta de la misión creada sin requerir cerrar y reabrir el panel. | APROBADO | 08/11/2026 12:36 | 08/11/2026 21:25 | fix(build): corregir tipos de mision en drawer y handler de actualizacion en modal |
| **TC-H20-WEB-15** | Resiliencia ante fallo de red (`Network error`) durante el despacho o la consulta de patrullas disponibles | Resiliencia / Borde | Unitario / Servicio | Media | Caída de red o servidor API inalcanzable al invocar `despacharPatrullaVerificadora`. | `apiClient.POST('/api/misiones')` rechaza promesa con `new Error('Network error')` | Captura la excepción y retorna `{ exito: false, codigoError: 500, mensaje: 'Error de conexión con el servidor municipal al despachar la patrulla.' }`. | El servicio controla el error sin propagar excepciones no manejadas a la interfaz. | APROBADO | 08/11/2026 12:36 | 08/11/2026 21:25 | feat(services): implementar metodos de asignacion y consulta de patrullas disponibles |

---

## 4. Bloque TSV

````tsv
ID Caso	Título del Caso de Prueba	Tipo de Prueba	Nivel	Prioridad	Precondición	Datos de Prueba (Payload / Headers / Query)	Resultado Esperado	Resultado Obtenido	Estado	Fecha / Hora Ejecución	Fecha / Hora Re-Test	Solución / Commit
BUG-H20-WEB-01	Omisión de contrato OpenAPI en api-generated.d.ts, tipos manuales en misiones.ts y uso de fetch nativo sin tipoMision: 'VERIFICACION'	Contrato OpenAPI / Arquitectura	Servicio / Tipos	Crítica	Inspección de src/types/api-generated.d.ts, src/types/misiones.ts y src/services/misionesService.ts.	POST /api/misiones con payload { incidenteId, patrullaId, tipoMision: 'VERIFICACION', titulo, prioridad } mediante apiClient.POST('/api/misiones')	paths['/api/misiones']['post'] tipado en api-generated.d.ts, tipos derivados del contrato OpenAPI y llamada mediante apiClient.POST incluyendo tipoMision: 'VERIFICACION'.	En Re-Test: Se incorporó paths['/api/misiones']['post'] en api-generated.d.ts, se derivaron los tipos en misiones.ts y despacharPatrulla utiliza apiClient.POST enviando tipoMision: 'VERIFICACION'.	APROBADO	08/11/2026 12:36	08/11/2026 21:25	fix(mando): solventar observaciones de QA para despacho de patrulla (H20)
BUG-H20-WEB-02	Ocultamiento del botón de asignación en el Drawer cuando un incidente REPORTADO tiene misiones previas y omisión en IncidenteDetalleHeader	Funcional / UI (CA-1)	Componente	Alta	Incidente en estado REPORTADO con al menos 1 misión previa (ej. RECHAZADA, CANCELADA o ASISTENCIA_SOCIAL) abierto en IncidenteDetalleDrawer.	Props: detalle={{ estado: 'REPORTADO', misiones: [misionPrevia] }} en IncidenteDetalleDrawer	El Drawer mantiene visible y accesible el botón para asignar una patrulla verificadora en la cabecera y en la sección de misiones mientras el incidente esté en REPORTADO sin verificación activa.	En Re-Test: IncidenteMisionesSection verifica !tieneVerificacionActiva mostrando el botón aun con misiones previas, e IncidenteDetalleHeader renderiza el botón Asignar Patrulla en la cabecera.	APROBADO	08/11/2026 12:36	08/11/2026 21:25	fix(mando): solventar observaciones de QA para despacho de patrulla (H20)
BUG-H20-WEB-03	Ausencia de control preventivo RBAC (misiones:asignar) en botones de despacho y falta de filtrado defensivo DISPONIBLE en AsignarPatrullaModal	Seguridad RBAC / Regla ICS (CA-2 / CA-7)	Componente / Integración	Alta	Usuario sin permiso misiones:asignar en KanbanBoard o catálogo que retorna patrullas con estado !== 'DISPONIBLE'.	Render de KanbanBoard / IncidenteCard con puedeAsignarPatrulla=false; respuesta de listarPatrullasDisponibles con unidades mixtas	Controles de asignación ocultos sin misiones:asignar y selector filtrando estrictamente p.estado === 'DISPONIBLE' && p.activo !== false.	En Re-Test: El hook usePuedeAsignarMision oculta los botones de despacho si falta misiones:asignar y AsignarPatrullaModal filtra defensivamente estado === 'DISPONIBLE' y activo !== false.	APROBADO	08/11/2026 12:36	08/11/2026 21:25	fix(mando): solventar observaciones de QA para despacho de patrulla (H20)
BUG-H20-WEB-04	Falta de incremento de totalMisiones al mover tarjeta a VERIFICANDO y actualización estática de paginacionColumna en useIncidentesKanban	Funcional / Reactividad (CA-6)	Hook / Estado	Media	Tablero Kanban con incidente en REPORTADO (totalMisiones: 0) que pasa a VERIFICANDO por despacho o evento Socket.io.	moverIncidenteAEstado('inc-100', 'VERIFICANDO') y evento incidente:actualizado en useIncidentesKanban	La tarjeta en VERIFICANDO refleja totalMisiones: 1 y paginacionColumna actualiza dinámicamente columnaOrigen y nuevoEstado tanto en acción local como por WebSocket.	En Re-Test: moverIncidenteAEstado y handleIncidenteActualizado incrementan totalMisiones y recalculan dinámicamente paginacionColumna para origen y destino.	APROBADO	08/11/2026 12:36	08/11/2026 21:25	fix(mando): solventar observaciones de QA para despacho de patrulla (H20)
BUG-H20-WEB-05	Fallo de análisis estático npx eslint (2 errores y 5 warnings) en archivos de HU-20 y advertencias act(...) en useEncargadoKanbanSocket.test.ts	Calidad de Código / CI	Estático / Unitario	Media	Ejecución de linter institucional y suite de pruebas de WebSocket.	npx eslint src/components/mando/patrullas/AsignarPatrullaModal.tsx src/hooks/useEncargadoKanbanSocket.ts src/components/mando/drawer/IncidenteDetalleHeader.tsx	0 errores y 0 warnings en ESLint; 0 advertencias de act(...) en stderr durante la ejecución de Vitest.	En Re-Test: npx eslint finaliza con 0 errores y 0 warnings (exit code 0), y useEncargadoKanbanSocket.test.ts pasa sin advertencias act(...).	APROBADO	08/11/2026 12:36	08/11/2026 21:25	fix(mando): solventar observaciones de QA para despacho de patrulla (H20)
TC-H20-WEB-01	Renderizado del botón "Despachar Patrulla Verificadora" en IncidenteDetalleDrawer para incidente en estado REPORTADO sin misiones	Funcional (CA-1)	Componente	Alta	Incidente con estado: 'REPORTADO' y misiones: [] cargado en IncidenteDetalleDrawer.	incidenteId="inc-reportado-1", detalle={{ id: 'inc-reportado-1', codigo: 'INC-2026-9999', estado: 'REPORTADO', misiones: [] }}	Se muestra el botón "Despachar Patrulla Verificadora" y al pulsarlo se abre el diálogo Asignar Patrulla Verificadora.	El botón se renderiza en la cabecera y en la sección de misiones, abriendo AsignarPatrullaModal con los datos del incidente.	APROBADO	08/11/2026 12:36	08/11/2026 21:25	feat(mando): incorporar modal de asignacion rapida de patrulla en drawer de incidente
TC-H20-WEB-02	Ocultamiento del botón de asignación en IncidenteDetalleDrawer para incidentes en estado VERIFICANDO, EN_ATENCION o RESUELTO	Funcional / Regla ICS (CA-1)	Componente	Alta	Incidente con estado: 'EN_ATENCION' cargado en IncidenteDetalleDrawer.	incidenteId="i1000000-0000-4000-8000-000000000001", estado: 'EN_ATENCION'	El botón "Despachar Patrulla Verificadora" no se renderiza en el DOM, previniendo despachos duplicados de verificación.	queryByRole('button', { name: /Despachar Patrulla/i }) retorna null.	APROBADO	08/11/2026 12:36	08/11/2026 21:25	feat(mando): incorporar modal de asignacion rapida de patrulla en drawer de incidente
TC-H20-WEB-03	Renderizado del botón "Asignar Patrulla" en IncidenteCard solo para incidentes en estado REPORTADO con stopPropagation	Funcional (CA-1)	Componente	Alta	Tarjeta IncidenteCard montada en columna REPORTADO con callback onAsignarPatrulla.	incidente={{ id: 'inc-001', codigo: 'INC-58291045', estado: 'REPORTADO' }}, clic en botón Asignar Patrulla	Invoca onAsignarPatrulla(incidente) 1 vez sin disparar el onClick de apertura del Drawer; en estado VERIFICANDO o sin permiso el botón no existe.	Se invoca onAsignarPatrulla sin propagar el clic al contenedor y se oculta en estados posteriores o cuando puedeAsignarPatrulla es false.	APROBADO	08/11/2026 12:36	08/11/2026 21:25	fix(mando): actualizar kanban reactivamente al despachar y habilitar boton en tarjeta
TC-H20-WEB-04	Consulta de patrullas con filtro estado=DISPONIBLE mediante listarPatrullasDisponibles en patrullasService	Funcional / API (CA-2)	Unitario / Servicio	Alta	Invocación de listarPatrullasDisponibles('user-encargado').	GET /api/patrullas?page=1&limit=100&estado=DISPONIBLE con header x-user-id: user-encargado	El servicio solicita exclusivamente patrullas con estado=DISPONIBLE y limit=100, retornando el arreglo tipado de unidades disponibles.	fetch es llamado con /api/patrullas?page=1&limit=100&estado=DISPONIBLE y retorna exito: true con las unidades disponibles.	APROBADO	08/11/2026 12:36	08/11/2026 21:25	feat(services): implementar metodos de asignacion y consulta de patrullas disponibles
TC-H20-WEB-05	Carga del selector de patrullas disponibles y vista previa de delegación y líder en AsignarPatrullaModal	Funcional / UI (CA-1 / CA-2)	Componente	Alta	Apertura de AsignarPatrullaModal con 2 patrullas disponibles (pat-001, pat-002).	isOpen=true, incidente={mockIncidente}, mockPatrullasDisponibles con delegación y líder	El <select> lista las patrullas disponibles, preselecciona la primera y muestra la tarjeta de vista previa con delegación, líder y teléfono.	El combobox renderiza ambas opciones y muestra los detalles de dotación de la unidad seleccionada.	APROBADO	08/11/2026 12:36	08/11/2026 21:25	feat(mando): incorporar modal de asignacion rapida de patrulla en drawer de incidente
TC-H20-WEB-06	Estado informativo y bloqueo del botón de confirmación cuando no existen patrullas DISPONIBLE en la comuna	Funcional / Borde (CA-2)	Componente	Alta	listarPatrullasDisponibles retorna data: [] (0 patrullas disponibles).	GET /api/patrullas?page=1&limit=100&estado=DISPONIBLE -> { data: [], meta: { total: 0 } }	Se muestra un InlineNotice informando que no existen patrullas en estado DISPONIBLE y el botón "Confirmar y Despachar" permanece disabled.	El aviso informativo se renderiza y el botón de envío queda deshabilitado preventivamente.	APROBADO	08/11/2026 12:36	08/11/2026 21:25	feat(mando): incorporar modal de asignacion rapida de patrulla en drawer de incidente
TC-H20-WEB-07	Despacho exitoso de patrulla verificadora (201 Created) en misionesService.despacharPatrulla mediante apiClient.POST	Funcional / Integración (CA-3)	Unitario / Servicio	Crítica	Incidente en REPORTADO y patrulla en DISPONIBLE.	POST /api/misiones body { incidenteId: 'inc-100', patrullaId: 'pat-100', tipoMision: 'VERIFICACION', titulo: 'Verificación de anegamiento', prioridad: 'ALTA' }	Retorna exito: true con mision.estado = 'DESPACHADA', mision.tipoMision = 'VERIFICACION', incidente.estado = 'VERIFICANDO' y patrulla.estado = 'EN_VERIFICACION'.	apiClient.POST procesa la respuesta 201 Created y devuelve la estructura consolidada de la transacción atómica.	APROBADO	08/11/2026 12:36	08/11/2026 21:25	fix(mando): solventar observaciones de QA para despacho de patrulla (H20)
TC-H20-WEB-08	Flujo completo de confirmación en AsignarPatrullaModal: envío, notificación Toast, callback onAsignacionExitosa y cierre	Funcional / Integración (CA-3 / CA-6)	Componente / Integración	Crítica	Usuario Encargado selecciona patrulla pat-001 y pulsa "Confirmar y Despachar".	Submit en AsignarPatrullaModal con incidenteId: 'inc-001', patrullaId: 'pat-001', tipoMision: 'VERIFICACION'	Invoca despacharPatrullaVerificadora, emite showSuccess con el código MIS-2026-8341, ejecuta onAsignacionExitosa(res.data) y cierra el modal.	Se ejecutan despacharPatrullaVerificadora, showSuccess, onAsignacionExitosa y onClose satisfactoriamente.	APROBADO	08/11/2026 12:36	08/11/2026 21:25	feat(mando): incorporar modal de asignacion rapida de patrulla en drawer de incidente
TC-H20-WEB-09	Validación previa en cliente cuando incidenteId o patrullaId están vacíos en despacharPatrullaVerificadora	Validación / Borde (CA-3)	Unitario / Servicio	Media	Invocación a despacharPatrullaVerificadora({ incidenteId: '', patrullaId: 'p-1' }).	Payload incompleto { incidenteId: '', patrullaId: 'p-1' }	Retorna { exito: false, codigoError: 400 } sin realizar petición HTTP al servidor.	El servicio aborta localmente con código 400 y apiClient.POST registra 0 llamadas.	APROBADO	08/11/2026 12:36	08/11/2026 21:25	feat(services): implementar metodos de asignacion y consulta de patrullas disponibles
TC-H20-WEB-10	Manejo de colisión de concurrencia (409 Conflict) con alerta al Encargado y recarga automática de patrullas disponibles	Concurrencia (CA-5)	Componente / Integración	Crítica	La patrulla seleccionada cambia a no disponible concurrentemente antes de confirmar el despacho.	POST /api/misiones responde 409 Conflict { message: 'La patrulla seleccionada ya no se encuentra disponible.' }	El modal muestra InlineNotice de error y Toast de conflicto, mantiene abierto el diálogo e invoca automáticamente listarPatrullasDisponibles por segunda vez.	Se renderiza el mensaje de conflicto 409, se dispara showError y listarPatrullasDisponibles se ejecuta 2 veces actualizando el selector.	APROBADO	08/11/2026 12:36	08/11/2026 21:25	feat(mando): incorporar modal de asignacion rapida de patrulla en drawer de incidente
TC-H20-WEB-11	Bloqueo y retroalimentación ante respuesta 403 Forbidden cuando el usuario carece del permiso misiones:asignar	Seguridad RBAC (CA-7)	Componente / Servicio	Crítica	Usuario sin permiso misiones:asignar intenta ejecutar POST /api/misiones.	POST /api/misiones con header x-user-id de rol sin permiso -> 403 Forbidden	El servicio retorna esForbidden: true (403), el modal muestra aviso indicando que requiere misiones:asignar y deshabilita el botón "Confirmar y Despachar".	Se muestra el banner de acceso denegado mencionando misiones:asignar, se emite Toast de error y el botón de envío queda deshabilitado.	APROBADO	08/11/2026 12:36	08/11/2026 21:25	feat(mando): incorporar modal de asignacion rapida de patrulla en drawer de incidente
TC-H20-WEB-12	Suscripción WebSocket a las salas encargado, sala:encargados y mapa y escucha de incidente:actualizado	Tiempo Real / WebSocket (CA-4 / CA-6)	Unitario / Hook	Alta	Montaje de useEncargadoKanbanSocket en el Centro de Mando.	Evento connect y recepción de payload incidente:actualizado { datos: { id: 'inc-123', nuevoEstado: 'VERIFICANDO' } }	El socket emite join/unirse para encargado, sala:encargados y mapa, normaliza el evento incidente:actualizado e invoca onIncidenteActualizado.	El hook se suscribe a las salas requeridas al conectar, procesa incidente:actualizado sin warnings act(...) y limpia suscripciones al desmontar.	APROBADO	08/11/2026 12:36	08/11/2026 21:25	fix(socket): asegurar suscripcion a salas encargado y mapa para actualizacion reactiva
TC-H20-WEB-13	Traslado automático de la tarjeta del incidente a la columna VERIFICANDO en el tablero Kanban sin refresco manual	Reactividad UI (CA-6)	Integración / Hook	Alta	Incidente inc-100 en columna REPORTADO; se confirma despacho o llega evento incidente:actualizado.	Ejecución de moverIncidenteAEstado('inc-100', 'VERIFICANDO') o callback handleIncidenteActualizado	El incidente se elimina de columnas.REPORTADO, se inserta al inicio de columnas.VERIFICANDO con estado: 'VERIFICANDO', totalMisiones: 1 y contadores actualizados.	La tarjeta se traslada reactivamente en memoria de REPORTADO a VERIFICANDO incrementando totalMisiones y actualizando paginacionColumna.	APROBADO	08/11/2026 12:36	08/11/2026 21:25	fix(mando): actualizar kanban reactivamente al despachar y habilitar boton en tarjeta
TC-H20-WEB-14	Actualización reactiva del estado y listado de misiones dentro de IncidenteDetalleDrawer tras confirmar asignación	Funcional / UI (CA-1 / CA-3)	Componente	Media	IncidenteDetalleDrawer abierto en incidente REPORTADO al completarse handleAsignacionExitosa.	handleAsignacionExitosa({ mision: { id: 'mis-50', codigo: 'MIS-2026-8341', estado: 'DESPACHADA', tipoMision: 'VERIFICACION' }, incidente: { id: 'inc-001', estado: 'VERIFICANDO' }, patrulla: { id: 'pat-001', nombre: 'Patrulla Ánimas Norte 1', estado: 'EN_VERIFICACION' } })	El Drawer actualiza detalle.estado a 'VERIFICANDO', agrega la nueva misión a detalle.misiones y notifica al Kanban mediante onIncidenteActualizado.	El Drawer refleja inmediatamente el estado VERIFICANDO y la tarjeta de la misión creada sin requerir cerrar y reabrir el panel.	APROBADO	08/11/2026 12:36	08/11/2026 21:25	fix(build): corregir tipos de mision en drawer y handler de actualizacion en modal
TC-H20-WEB-15	Resiliencia ante fallo de red (Network error) durante el despacho o la consulta de patrullas disponibles	Resiliencia / Borde	Unitario / Servicio	Media	Caída de red o servidor API inalcanzable al invocar despacharPatrullaVerificadora.	apiClient.POST('/api/misiones') rechaza promesa con new Error('Network error')	Captura la excepción y retorna { exito: false, codigoError: 500, mensaje: 'Error de conexión con el servidor municipal al despachar la patrulla.' }.	El servicio controla el error sin propagar excepciones no manejadas a la interfaz.	APROBADO	08/11/2026 12:36	08/11/2026 21:25	feat(services): implementar metodos de asignacion y consulta de patrullas disponibles
````

---

## 5. Guía de Ejecución Paso a Paso y Evidencias Técnicas Replicables

### 5.1. Ejecución de Suites Automatizadas con Vitest, ESLint y TypeScript

#### Comando 1: Ejecución consolidada de las 8 suites de HU-20, Linter y TypeScript
```bash
npx vitest run src/services/__tests__/misionesService.test.ts src/services/__tests__/patrullasService.test.ts src/components/mando/patrullas/__tests__/AsignarPatrullaModal.test.tsx src/components/mando/__tests__/IncidenteDetalleDrawer.test.tsx src/components/mando/__tests__/IncidenteMisionesSection.test.tsx src/components/mando/__tests__/IncidenteCard.test.tsx src/hooks/__tests__/useEncargadoKanbanSocket.test.ts src/hooks/__tests__/useIncidentesKanban.test.ts && npx eslint src/components/mando/drawer/IncidenteDetalleHeader.tsx src/components/mando/drawer/IncidenteMisionesSection.tsx src/components/mando/IncidenteDetalleDrawer.tsx src/components/mando/IncidenteCard.tsx src/components/mando/KanbanBoard.tsx src/components/mando/patrullas/AsignarPatrullaModal.tsx src/hooks/useEncargadoKanbanSocket.ts src/hooks/useIncidentesKanban.ts src/hooks/usePuedeAsignarMision.ts src/services/misionesService.ts src/services/patrullasService.ts && npx tsc --noEmit
```

**Evidencia obtenida en consola (Re-Test):**
```text
 RUN  v3.2.7 /home/ds2fery/Documentos/Proyecto/sgrai-uach/web

 ✓ src/services/__tests__/misionesService.test.ts (10 tests) 26ms
 ✓ src/services/__tests__/patrullasService.test.ts (24 tests) 45ms
 ✓ src/hooks/__tests__/useEncargadoKanbanSocket.test.ts (4 tests) 45ms
 ✓ src/hooks/__tests__/useIncidentesKanban.test.ts (1 test) 74ms
 ✓ src/components/mando/__tests__/IncidenteMisionesSection.test.tsx (4 tests) 234ms
 ✓ src/components/mando/__tests__/IncidenteCard.test.tsx (6 tests) 235ms
 ✓ src/components/mando/patrullas/__tests__/AsignarPatrullaModal.test.tsx (6 tests) 442ms
 ✓ src/components/mando/__tests__/IncidenteDetalleDrawer.test.tsx (4 tests) 362ms

 Test Files  8 passed (8)
      Tests  59 passed (59)
   Start at  21:24:45
   Duration  3.66s (transform 1.92s, setup 1.82s, collect 4.05s, tests 1.46s, environment 12.52s, prepare 1.31s)
```

#### Comando 2: Verificación de regresión en `IncidenteMisionesSection.test.tsx` y `useIncidentesKanban.test.ts`
```bash
npm test -- --run src/components/mando/__tests__/IncidenteMisionesSection.test.tsx src/hooks/__tests__/useIncidentesKanban.test.ts -t "BUG-"
```

**Evidencia obtenida en consola:**
```text
 ✓ src/components/mando/__tests__/IncidenteMisionesSection.test.tsx (4 tests | 2 skipped) 42ms
   ✓ Componente IncidenteMisionesSection > debe mostrar el botón de despachar patrulla verificadora cuando el incidente está en REPORTADO aunque tenga misiones previas no activas (BUG-02)
   ✓ Componente IncidenteMisionesSection > no debe mostrar el botón de despacho si puedeAsignar es false (BUG-03)
 ✓ src/hooks/__tests__/useIncidentesKanban.test.ts (1 test) 65ms
   ✓ useIncidentesKanban - HU-20 y BUG-04 > debe mover de columna e incrementar totalMisiones y actualizar paginacionColumna dinámicamente
```

---

### 5.2. Pruebas de Integración HTTP / cURL contra el Contrato de `POST /api/misiones` y `GET /api/patrullas`

#### Escenario A: Consulta de patrullas verificadoras en estado `DISPONIBLE` (`TC-H20-WEB-04`)
```bash
curl -i -X GET "http://localhost:3000/api/patrullas?page=1&limit=100&estado=DISPONIBLE" \
  -H "Accept: application/json" \
  -H "x-user-id: 00000000-0000-4000-8000-000000000003"
```

**Respuesta HTTP/JSON:**
```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{
  "message": "Listado de patrullas verificadoras obtenido exitosamente.",
  "data": [
    {
      "id": "f1000000-0000-4000-8000-000000000001",
      "codigo": "PAT-01",
      "nombre": "Patrulla Ánimas Norte 1",
      "estado": "DISPONIBLE",
      "activo": true,
      "delegacion": {
        "id": "d1000000-0000-4000-8000-000000000001",
        "nombre": "Delegación Norte",
        "codigo": "DEL_NORTE"
      },
      "lider": {
        "id": "u1000000-0000-4000-8000-000000000005",
        "nombre": "Juan Pérez",
        "email": "juan.perez@valdivia.cl",
        "telefono": "+56911223344"
      }
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 100,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

#### Escenario B: Despacho atómico exitoso de patrulla verificadora (`TC-H20-WEB-07`)
```bash
curl -i -X POST "http://localhost:3000/api/misiones" \
  -H "Content-Type: application/json" \
  -H "x-user-id: 00000000-0000-4000-8000-000000000003" \
  -d '{
    "incidenteId": "50000000-0000-4000-8000-000000000001",
    "patrullaId": "f1000000-0000-4000-8000-000000000001",
    "tipoMision": "VERIFICACION",
    "titulo": "Verificación: Anegamiento - INC-2026-1042",
    "prioridad": "ALTA"
  }'
```

**Respuesta HTTP/JSON (`201 Created`):**
```http
HTTP/1.1 201 Created
Content-Type: application/json; charset=utf-8

{
  "message": "Misión de verificación creada y patrulla despachada exitosamente.",
  "data": {
    "mision": {
      "id": "60000000-0000-4000-8000-000000000099",
      "codigo": "MIS-2026-8341",
      "titulo": "Verificación: Anegamiento - INC-2026-1042",
      "descripcion": null,
      "tipoMision": "VERIFICACION",
      "estado": "DESPACHADA",
      "prioridad": "ALTA",
      "incidenteId": "50000000-0000-4000-8000-000000000001",
      "patrullaId": "f1000000-0000-4000-8000-000000000001",
      "encargadoId": "00000000-0000-4000-8000-000000000003",
      "fechaInicio": "2026-11-08T15:36:00.000Z",
      "creadoEn": "2026-11-08T15:36:00.000Z"
    },
    "incidente": {
      "id": "50000000-0000-4000-8000-000000000001",
      "codigo": "INC-2026-1042",
      "estado": "VERIFICANDO"
    },
    "patrulla": {
      "id": "f1000000-0000-4000-8000-000000000001",
      "nombre": "Patrulla Ánimas Norte 1",
      "estado": "EN_VERIFICACION"
    },
    "hitoInicial": {
      "id": "70000000-0000-4000-8000-000000000001",
      "hito": "DESPACHADA",
      "descripcion": "Patrulla verificadora Patrulla Ánimas Norte 1 despachada a terreno para evaluación preliminar.",
      "creadoEn": "2026-11-08T15:36:00.000Z"
    }
  }
}
```

#### Escenario C: Rechazo por colisión de concurrencia (`409 Conflict` — `TC-H20-WEB-10`)
```bash
curl -i -X POST "http://localhost:3000/api/misiones" \
  -H "Content-Type: application/json" \
  -H "x-user-id: 00000000-0000-4000-8000-000000000003" \
  -d '{
    "incidenteId": "50000000-0000-4000-8000-000000000002",
    "patrullaId": "f1000000-0000-4000-8000-000000000001",
    "tipoMision": "VERIFICACION"
  }'
```

**Respuesta HTTP/JSON (`409 Conflict`):**
```http
HTTP/1.1 409 Conflict
Content-Type: application/json; charset=utf-8

{
  "message": "La patrulla seleccionada ya no se encuentra disponible. Por favor selecciona otra patrulla."
}
```

#### Escenario D: Rechazo por falta de permiso RBAC `misiones:asignar` (`403 Forbidden` — `TC-H20-WEB-11`)
```bash
curl -i -X POST "http://localhost:3000/api/misiones" \
  -H "Content-Type: application/json" \
  -H "x-user-id: 00000000-0000-4000-8000-000000000002" \
  -d '{
    "incidenteId": "50000000-0000-4000-8000-000000000001",
    "patrullaId": "f1000000-0000-4000-8000-000000000001",
    "tipoMision": "VERIFICACION"
  }'
```

**Respuesta HTTP/JSON (`403 Forbidden`):**
```http
HTTP/1.1 403 Forbidden
Content-Type: application/json; charset=utf-8

{
  "message": "No cuenta con el permiso requerido (misiones:asignar) para ejecutar esta operación."
}
```

---

## 6. Matriz de Trazabilidad de Criterios de Aceptación (HU-20)

| Criterio de Aceptación (CA) | Casos de Prueba Asociados | Estado Inicial | Estado Re-Test | Observación Técnica |
| :--- | :--- | :---: | :---: | :--- |
| **CA-1:** Desde el detalle o drawer de un incidente en estado `REPORTADO`, el sistema debe proveer un selector accesible para asignar una patrulla verificadora. | `TC-H20-WEB-01`, `TC-H20-WEB-02`, `TC-H20-WEB-03`, `BUG-H20-WEB-02` | Observado | **Cumple (100%)** | Acción disponible en la cabecera (`IncidenteDetalleHeader`) y en `IncidenteMisionesSection` mientras el incidente esté en `REPORTADO` sin verificación activa. |
| **CA-2:** El selector debe listar únicamente las patrullas que se encuentren en estado `DISPONIBLE` en la base de datos. | `TC-H20-WEB-04`, `TC-H20-WEB-05`, `TC-H20-WEB-06`, `BUG-H20-WEB-03` | Observado | **Cumple (100%)** | `listarPatrullasDisponibles` envía `?estado=DISPONIBLE` y `AsignarPatrullaModal` aplica filtrado defensivo en cliente (`estado === 'DISPONIBLE'` y `activo !== false`). |
| **CA-3:** Al confirmar la asignación, la API ejecuta la transacción atómica (`mision` en `DESPACHADA`/`VERIFICACION`, `incidente` en `VERIFICANDO`, `patrulla` en `EN_VERIFICACION`, hito en `mision_hito`). | `TC-H20-WEB-07`, `TC-H20-WEB-08`, `TC-H20-WEB-09`, `TC-H20-WEB-14`, `BUG-H20-WEB-01` | Fallido | **Cumple (100%)** | Contrato tipado en `api-generated.d.ts`, tipos derivados en `misiones.ts` e invocación mediante `apiClient.POST('/api/misiones')` con `tipoMision: 'VERIFICACION'`. |
| **CA-4:** Emisión de eventos WebSocket `mision:asignada` a `patrulla:{id}` e `incidente:actualizado` a las salas `encargado` y `mapa`. | `TC-H20-WEB-12`, `BUG-H20-WEB-05` | Observado | **Cumple (100%)** | Suscripción a salas `encargado` y `mapa`, tipado estricto sin `any` en `handleActualizado` y pruebas en Vitest libres de advertencias `act(...)`. |
| **CA-5:** Si la patrulla seleccionada cambió de estado concurrentemente a no disponible, abortar con `409 Conflict` y notificar al Encargado. | `TC-H20-WEB-10` | Cumple | **Cumple (100%)** | `AsignarPatrullaModal` presenta alerta `InlineNotice` y Toast de conflicto, recargando automáticamente el listado de patrullas disponibles. |
| **CA-6:** El incidente en el tablero Kanban debe moverse automáticamente a la columna `'VERIFICANDO'` sin requerir refresco manual. | `TC-H20-WEB-13`, `BUG-H20-WEB-04` | Observado | **Cumple (100%)** | Traslado automático de tarjeta a `VERIFICANDO`, incremento de `totalMisiones` en memoria y actualización dinámica de `paginacionColumna`. |
| **CA-7:** El endpoint `POST /api/misiones` debe exigir el permiso RBAC `misiones:asignar`. | `TC-H20-WEB-11`, `BUG-H20-WEB-03` | Observado | **Cumple (100%)** | Verificación preventiva en UI mediante `usePuedeAsignarMision` (`misiones:asignar`) y manejo de respuesta `403 Forbidden` en el servicio y modal. |
