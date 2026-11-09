# Plan y Reporte de Pruebas QA — HU-20: Asignar Patrulla Verificadora a Incidente (Frontend / Web)

**Proyecto:** SGRAI — Sistema de Gestión de Recursos para Atención de Incidentes (DGRD Municipalidad de Valdivia)  
**Repositorio:** `sgrai-web`  
**Rama Evaluada:** `feature/h20-asignar-patrulla-verificacion`  
**Desarrollador Asignado:** Mayra Carrillo (`@MayraCarrillo`)  
**Historia de Usuario:** HU-20 — *Como Encargado Quiero asignar una patrulla verificadora disponible a un incidente para que evalúe y verifique las necesidades reales en terreno Para desplegar de inmediato personal calificado que levante el diagnóstico técnico antes de movilizar recursos pesados o cuadrillas.*  
**Estado de Certificación QA:** `RECHAZADO EN CODE REVIEW (CHANGES REQUESTED — 5 DEFECTOS ABIERTOS / 15 CASOS APROBADOS)`  
**Fecha de Ejecución Inicial:** `08/11/2026 12:36`  
**Fecha de Re-Test:** `(Pendiente)`

---

## 1. Resumen Ejecutivo de Auditoría

Se ejecutó la auditoría estática, contractual y dinámica sobre la rama `feature/h20-asignar-patrulla-verificacion` del repositorio `sgrai-web`, contrastando la implementación frente a los 7 Criterios de Aceptación de la HU-20, el contrato OpenAPI de `sgrai-api` y los estándares de arquitectura del proyecto.

De un total de **20 escenarios evaluados** en la matriz de calidad:
- **15 casos de prueba funcionales y de integración resultaron APROBADOS**, verificando la apertura del modal de asignación desde el tablero Kanban y desde el Drawer cuando no existen misiones previas, la consulta a `GET /api/patrullas?estado=DISPONIBLE`, el manejo de errores `409 Conflict` (con recarga automática del selector) y `403 Forbidden`, y la suscripción Socket.io a las salas `encargado` y `mapa`.
- **5 defectos reales fueron detectados y documentados (`BUG-H20-WEB-01` a `BUG-H20-WEB-05`)**, clasificados en **1 Crítico**, **2 Altos** y **2 Medios**, motivo por el cual la historia queda con dictamen **Changes Requested** a la espera de corrección y ejecución de Re-Test.

| Métrica de Calidad | Resultado |
| :--- | :--- |
| **Total de Casos en Matriz** | 20 (`5` Defectos + `15` Casos de Prueba) |
| **Casos Aprobados** | 15 / 20 (`75%`) |
| **Defectos Abiertos (`ABIERTO`)** | 5 (`1` Crítico, `2` Altos, `2` Medios) |
| **Pruebas Automatizadas Vitest (Suites HU-20)** | 53 / 53 tests pasados en 6 suites (con 3 warnings `act(...)` en `useEncargadoKanbanSocket.test.ts`) |
| **Verificación de Tipos (`npx tsc --noEmit`)** | 0 errores |
| **Análisis Estático (`npx eslint`)** | Fallido (`exit code 1`: 2 errores y 5 advertencias) |

---

## 2. Registro Técnico de Defectos

### 2.1. `BUG-H20-WEB-01` — Omisión del contrato OpenAPI para `POST /api/misiones` en `api-generated.d.ts`, tipos manuales en `misiones.ts` y uso de `fetch` nativo sin `tipoMision: 'VERIFICACION'`
- **Severidad:** Crítica
- **Estado:** `ABIERTO`
- **Archivos afectados:**
  - `src/types/api-generated.d.ts` (líneas 3099–3255)
  - `src/types/misiones.ts` (líneas 189–229)
  - `src/services/misionesService.ts` (líneas 242–334)
- **Descripción técnica:**
  1. En `src/types/api-generated.d.ts` (línea 3249), el path `"/api/misiones"` mantiene `post?: never;`, omitiendo la especificación OpenAPI de `POST /api/misiones`.
  2. En `src/types/misiones.ts` (líneas 189–220), se declararon manualmente las interfaces `DespacharPatrullaPayload`, `DespacharPatrullaResponseData` y `DespacharPatrullaResponse`, las cuales divergen del contrato real `CrearMisionVerificacionSchema` y `CrearMisionResponseSchema` de `sgrai-api` (omitiendo `tipoMision`, `hitoInicial` y metadatos de la misión creada).
  3. En `src/services/misionesService.ts` (líneas 268–278), `despacharPatrulla` emplea `fetch('/api/misiones', ...)` en lugar del cliente tipado `apiClient.POST('/api/misiones', ...)` (`openapi-fetch`), y no envía explícitamente el atributo `tipoMision: 'VERIFICACION'` en el cuerpo de la solicitud.

### 2.2. `BUG-H20-WEB-02` — Desaparición del botón de despacho en `IncidenteDetalleDrawer` cuando un incidente `REPORTADO` posee misiones previas y omisión del botón en `IncidenteDetalleHeader`
- **Severidad:** Alta
- **Estado:** `ABIERTO`
- **Archivos afectados:**
  - `src/components/mando/drawer/IncidenteMisionesSection.tsx` (líneas 28–64)
  - `src/components/mando/drawer/IncidenteDetalleHeader.tsx` (líneas 6–53)
  - `src/components/mando/IncidenteDetalleDrawer.tsx` (líneas 105–108)
- **Descripción técnica:**
  1. En `IncidenteMisionesSection.tsx` (líneas 28–29), el renderizado del botón `"Despachar Patrulla Verificadora"` está condicionado a `misiones.length === 0`. Si un incidente permanece en estado `REPORTADO` pero tiene registrada una misión previa (por ejemplo, una misión `CANCELADA`, `RECHAZADA` o una misión complementaria de `ASISTENCIA_SOCIAL`), `misiones.length === 0` se evalúa como `false` y el usuario pierde toda opción de asignar una patrulla desde el Drawer, incumpliendo el CA-1.
  2. En `IncidenteDetalleHeader.tsx` (línea 6), se importó el ícono `ShieldCheck` sin utilizarlo, omitiendo el botón de acción rápida `"Asignar Patrulla"` en la cabecera del Drawer documentado en `docs/manuals/H20-asignar-patrulla-verificadora.md` (Paso 2, línea 42).

### 2.3. `BUG-H20-WEB-03` — Ausencia de validación preventiva del permiso RBAC `misiones:asignar` en componentes UI y falta de filtrado defensivo de estado `DISPONIBLE` en `AsignarPatrullaModal`
- **Severidad:** Alta
- **Estado:** `ABIERTO`
- **Archivos afectados:**
  - `src/components/mando/KanbanBoard.tsx` (líneas 267 y 297–308)
  - `src/components/mando/IncidenteCard.tsx` (líneas 90–108)
  - `src/components/mando/IncidenteDetalleDrawer.tsx` (líneas 130–135)
  - `src/components/mando/patrullas/AsignarPatrullaModal.tsx` (líneas 81–91)
- **Descripción técnica:**
  1. Los botones `"Asignar Patrulla"` en `IncidenteCard` y `"Despachar Patrulla Verificadora"` en `IncidenteMisionesSection` se muestran a cualquier usuario que acceda al tablero sin validar `hasPermission('misiones:asignar')` desde `SimulatedSessionContext`. Usuarios con acceso de lectura al Kanban pero sin el permiso `misiones:asignar` ven controles activos que solo fallan al enviar el formulario (`403 Forbidden`).
  2. En `AsignarPatrullaModal.tsx` (línea 82), `setPatrullas(res.data)` almacena directamente el arreglo devuelto sin aplicar un filtro defensivo en cliente (`p.estado === 'DISPONIBLE' && p.activo !== false`), exponiendo el selector a listar unidades no disponibles o inactivas si el servicio o caché devuelve registros mixtos (CA-2).

### 2.4. `BUG-H20-WEB-04` — Desincronización de `totalMisiones` en la tarjeta trasladada y actualización estática de `paginacionColumna` en `useIncidentesKanban`
- **Severidad:** Media
- **Estado:** `ABIERTO`
- **Archivo afectado:**
  - `src/hooks/useIncidentesKanban.ts` (líneas 312–414)
- **Descripción técnica:**
  1. En `moverIncidenteAEstado` (líneas 371–376), al trasladar el incidente hacia `VERIFICANDO` tras confirmar el despacho, no se incrementa `totalMisiones` (`totalMisiones: (prev[est][idx].totalMisiones || 0) + 1`), mostrando temporalmente la tarjeta en `"En Verificación"` sin el indicador de misión activa.
  2. En `moverIncidenteAEstado` (líneas 400–411), `setPaginacionColumna` resta 1 a `REPORTADO` y suma 1 a `VERIFICANDO` de forma fija sin usar `columnaOrigen` ni `nuevoEstado`. Adicionalmente, en `handleIncidenteActualizado` (líneas 312–359, evento WebSocket `incidente:actualizado`), no se actualizan los contadores de `paginacionColumna` cuando el cambio de estado proviene de otro operador en tiempo real.

### 2.5. `BUG-H20-WEB-05` — Errores de compilación en ESLint (`react-hooks/set-state-in-effect`, `@typescript-eslint/no-explicit-any`, `no-unused-vars`) y advertencias `act(...)` en `useEncargadoKanbanSocket.test.ts`
- **Severidad:** Media
- **Estado:** `ABIERTO`
- **Archivos afectados:**
  - `src/components/mando/patrullas/AsignarPatrullaModal.tsx` (líneas 47–48 y 104–113)
  - `src/hooks/useEncargadoKanbanSocket.ts` (línea 102)
  - `src/components/mando/drawer/IncidenteDetalleHeader.tsx` (línea 6)
  - `src/hooks/__tests__/useEncargadoKanbanSocket.test.ts` (líneas 50–138)
- **Descripción técnica:**
  1. La ejecución de `npx eslint` sobre los archivos modificados en la rama falla con `exit code 1` reportando **2 errores y 5 warnings**:
     - `AsignarPatrullaModal.tsx:106:7`: `Error: Calling setState synchronously within an effect can trigger cascading renders (react-hooks/set-state-in-effect)`.
     - `useEncargadoKanbanSocket.ts:102:41`: `error: Unexpected any. Specify a different type (@typescript-eslint/no-explicit-any)`.
     - `IncidenteDetalleHeader.tsx:6:13`: `warning: 'ShieldCheck' is defined but never used`.
     - `AsignarPatrullaModal.tsx:47-48`: 4 warnings `@typescript-eslint/no-unused-vars` en parámetros `_msg` y `_title`.
  2. En `useEncargadoKanbanSocket.test.ts`, el mock de `socket.connect` muta `mockSocket.connected = true` sincrónicamente, provocando que el bloque `if (socket.connected)` de `useEncargadoKanbanSocket.ts` dispare `queueMicrotask(() => setConectado(true))` fuera de `act(...)`, emitiendo 3 advertencias en `stderr`.

---

## 3. Matriz Consolidada de Casos de Prueba (13 Columnas)

| ID Caso | Título del Caso de Prueba | Tipo de Prueba | Nivel | Prioridad | Precondición | Datos de Prueba (Payload / Headers / Query) | Resultado Esperado | Resultado Obtenido | Estado | Fecha / Hora Ejecución | Fecha / Hora Re-Test | Solución / Commit |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **BUG-H20-WEB-01** | Omisión de contrato OpenAPI en `api-generated.d.ts`, tipos manuales en `misiones.ts` y uso de `fetch` nativo sin `tipoMision: 'VERIFICACION'` | Contrato OpenAPI / Arquitectura | Servicio / Tipos | Crítica | Inspección de `src/types/api-generated.d.ts`, `src/types/misiones.ts` y `src/services/misionesService.ts`. | `POST /api/misiones` con payload `{ incidenteId, patrullaId, tipoMision: 'VERIFICACION', titulo, prioridad }` mediante `apiClient.POST('/api/misiones')` | `paths['/api/misiones']['post']` tipado en `api-generated.d.ts`, tipos derivados del contrato OpenAPI y llamada mediante `apiClient.POST` incluyendo `tipoMision: 'VERIFICACION'`. | `api-generated.d.ts` declara `post?: never` en `/api/misiones`; `misiones.ts` define tipos manuales incompletos y `misionesService.ts` usa `fetch` nativo omitiendo `tipoMision: 'VERIFICACION'`. | ABIERTO | 08/11/2026 12:36 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| **BUG-H20-WEB-02** | Ocultamiento del botón de asignación en el Drawer cuando un incidente `REPORTADO` tiene misiones previas y omisión en `IncidenteDetalleHeader` | Funcional / UI (CA-1) | Componente | Alta | Incidente en estado `REPORTADO` con al menos 1 misión previa (ej. `RECHAZADA`, `CANCELADA` o `ASISTENCIA_SOCIAL`) abierto en `IncidenteDetalleDrawer`. | Props: `detalle={{ estado: 'REPORTADO', misiones: [misionPreviaRechazada] }}` en `IncidenteDetalleDrawer` | El Drawer mantiene visible y accesible el botón para asignar una patrulla verificadora en la cabecera y/o sección de misiones mientras el incidente esté en `REPORTADO` sin verificación activa. | `IncidenteMisionesSection` oculta el botón porque evalúa `misiones.length === 0`, e `IncidenteDetalleHeader` importa `ShieldCheck` sin renderizar ningún botón. | ABIERTO | 08/11/2026 12:36 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| **BUG-H20-WEB-03** | Ausencia de control preventivo RBAC (`misiones:asignar`) en botones de despacho y falta de filtrado defensivo `DISPONIBLE` en `AsignarPatrullaModal` | Seguridad RBAC / Regla ICS (CA-2 / CA-7) | Componente / Integración | Alta | Usuario sin permiso `misiones:asignar` en `KanbanBoard` o catálogo que retorna patrullas con `estado !== 'DISPONIBLE'`. | Render de `KanbanBoard` / `IncidenteCard` sin `misiones:asignar`; respuesta de `listarPatrullasDisponibles` con unidades mixtas | Controles de asignación ocultos o deshabilitados sin `misiones:asignar`, y selector filtrando estrictamente `p.estado === 'DISPONIBLE' && p.activo !== false`. | Los botones se renderizan habilitados para usuarios sin `misiones:asignar` y `AsignarPatrullaModal` asigna `setPatrullas(res.data)` sin filtrar defensivamente en cliente. | ABIERTO | 08/11/2026 12:36 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| **BUG-H20-WEB-04** | Falta de incremento de `totalMisiones` al mover tarjeta a `VERIFICANDO` y actualización estática de `paginacionColumna` en `useIncidentesKanban` | Funcional / Reactividad (CA-6) | Hook / Estado | Media | Tablero Kanban con incidente en `REPORTADO` (`totalMisiones: 0`) que pasa a `VERIFICANDO` por despacho o evento Socket.io. | `moverIncidenteAEstado('inc-001', 'VERIFICANDO')` y evento `incidente:actualizado` en `useIncidentesKanban` | La tarjeta en `VERIFICANDO` refleja `totalMisiones + 1` y `paginacionColumna` actualiza dinámicamente `columnaOrigen` y `nuevoEstado` tanto en acción local como por WebSocket. | `totalMisiones` permanece en `0` tras `moverIncidenteAEstado`, `paginacionColumna` está hardcodeado a `REPORTADO`/`VERIFICANDO` y no se actualiza en `handleIncidenteActualizado`. | ABIERTO | 08/11/2026 12:36 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| **BUG-H20-WEB-05** | Fallo de análisis estático `npx eslint` (2 errores y 5 warnings) en archivos de HU-20 y advertencias `act(...)` en `useEncargadoKanbanSocket.test.ts` | Calidad de Código / CI | Estático / Unitario | Media | Ejecución de linter institucional y suite de pruebas de WebSocket. | `npx eslint src/components/mando/patrullas/AsignarPatrullaModal.tsx src/hooks/useEncargadoKanbanSocket.ts src/components/mando/drawer/IncidenteDetalleHeader.tsx` | `0` errores y `0` warnings en ESLint; `0` advertencias de `act(...)` en `stderr` durante la ejecución de Vitest. | ESLint falla con `exit code 1` (`react-hooks/set-state-in-effect`, `@typescript-eslint/no-explicit-any`, 5 `no-unused-vars`) y Vitest imprime 3 warnings `act(...)`. | ABIERTO | 08/11/2026 12:36 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| **TC-H20-WEB-01** | Renderizado del botón "Despachar Patrulla Verificadora" en `IncidenteDetalleDrawer` para incidente en estado `REPORTADO` sin misiones | Funcional (CA-1) | Componente | Alta | Incidente con `estado: 'REPORTADO'` y `misiones: []` cargado en `IncidenteDetalleDrawer`. | `incidenteId="inc-reportado-1"`, `detalle={{ id: 'inc-reportado-1', codigo: 'INC-2026-9999', estado: 'REPORTADO', misiones: [] }}` | Se muestra el botón `"Despachar Patrulla Verificadora"` y al pulsarlo se abre el diálogo `Asignar Patrulla Verificadora`. | El botón se renderiza en la sección de misiones y abre `AsignarPatrullaModal` con los datos del incidente. | APROBADO | 08/11/2026 12:36 | (Pendiente) | feat(mando): incorporar modal de asignacion rapida de patrulla en drawer de incidente |
| **TC-H20-WEB-02** | Ocultamiento del botón de asignación en `IncidenteDetalleDrawer` para incidentes en estado `VERIFICANDO`, `EN_ATENCION` o `RESUELTO` | Funcional / Regla ICS (CA-1) | Componente | Alta | Incidente con `estado: 'EN_ATENCION'` cargado en `IncidenteDetalleDrawer`. | `incidenteId="i1000000-0000-4000-8000-000000000001"`, `estado: 'EN_ATENCION'` | El botón `"Despachar Patrulla Verificadora"` no se renderiza en el DOM, previniendo despachos duplicados de verificación. | `queryByRole('button', { name: /Despachar Patrulla/i })` retorna `null`. | APROBADO | 08/11/2026 12:36 | (Pendiente) | feat(mando): incorporar modal de asignacion rapida de patrulla en drawer de incidente |
| **TC-H20-WEB-03** | Renderizado del botón "Asignar Patrulla" en `IncidenteCard` solo para incidentes en estado `REPORTADO` con `stopPropagation` | Funcional (CA-1) | Componente | Alta | Tarjeta `IncidenteCard` montada en columna `REPORTADO` con callback `onAsignarPatrulla`. | `incidente={{ id: 'inc-001', codigo: 'INC-58291045', estado: 'REPORTADO' }}`, clic en botón `Asignar Patrulla` | Invoca `onAsignarPatrulla(incidente)` 1 vez sin disparar el `onClick` de apertura del Drawer; en estado `VERIFICANDO` el botón no existe. | Se invoca `onAsignarPatrulla` sin propagar el clic al contenedor y se oculta en estados posteriores. | APROBADO | 08/11/2026 12:36 | (Pendiente) | fix(mando): actualizar kanban reactivamente al despachar y habilitar boton en tarjeta |
| **TC-H20-WEB-04** | Consulta de patrullas con filtro `estado=DISPONIBLE` mediante `listarPatrullasDisponibles` en `patrullasService` | Funcional / API (CA-2) | Unitario / Servicio | Alta | Invocación de `listarPatrullasDisponibles('user-encargado')`. | `GET /api/patrullas?page=1&limit=100&estado=DISPONIBLE` con header `x-user-id: user-encargado` | El servicio solicita exclusivamente patrullas con `estado=DISPONIBLE` y `limit=100`, retornando el arreglo tipado de unidades disponibles. | `fetch` es llamado con `/api/patrullas?page=1&limit=100&estado=DISPONIBLE` y retorna `exito: true` con las unidades disponibles. | APROBADO | 08/11/2026 12:36 | (Pendiente) | feat(services): implementar metodos de asignacion y consulta de patrullas disponibles |
| **TC-H20-WEB-05** | Carga del selector de patrullas disponibles y vista previa de delegación y líder en `AsignarPatrullaModal` | Funcional / UI (CA-1 / CA-2) | Componente | Alta | Apertura de `AsignarPatrullaModal` con 2 patrullas disponibles (`pat-001`, `pat-002`). | `isOpen=true`, `incidente={mockIncidente}`, `mockPatrullasDisponibles` con delegación y líder | El `<select>` lista las patrullas disponibles, preselecciona la primera y muestra la tarjeta de vista previa con delegación, líder y teléfono. | El `combobox` renderiza ambas opciones y muestra los detalles de dotación de la unidad seleccionada. | APROBADO | 08/11/2026 12:36 | (Pendiente) | feat(mando): incorporar modal de asignacion rapida de patrulla en drawer de incidente |
| **TC-H20-WEB-06** | Estado informativo y bloqueo del botón de confirmación cuando no existen patrullas `DISPONIBLE` en la comuna | Funcional / Borde (CA-2) | Componente | Alta | `listarPatrullasDisponibles` retorna `data: []` (`0` patrullas disponibles). | `GET /api/patrullas?page=1&limit=100&estado=DISPONIBLE` -> `{ data: [], meta: { total: 0 } }` | Se muestra un `InlineNotice` informando que no existen patrullas en estado `DISPONIBLE` y el botón `"Confirmar y Despachar"` permanece `disabled`. | El aviso informativo se renderiza y el botón de envío queda deshabilitado preventivamente. | APROBADO | 08/11/2026 12:36 | (Pendiente) | feat(mando): incorporar modal de asignacion rapida de patrulla en drawer de incidente |
| **TC-H20-WEB-07** | Despacho exitoso de patrulla verificadora (`201 Created`) en `misionesService.despacharPatrulla` | Funcional / Integración (CA-3) | Unitario / Servicio | Crítica | Incidente en `REPORTADO` y patrulla en `DISPONIBLE`. | `POST /api/misiones` body `{ incidenteId: 'inc-100', patrullaId: 'pat-100', titulo: 'Verificación de anegamiento', prioridad: 'ALTA' }` | Retorna `exito: true` con `mision.estado = 'DESPACHADA'`, `mision.tipoMision = 'VERIFICACION'`, `incidente.estado = 'VERIFICANDO'` y `patrulla.estado = 'EN_VERIFICACION'`. | El servicio procesa la respuesta `201 Created` y devuelve la estructura consolidada de la transacción atómica. | APROBADO | 08/11/2026 12:36 | (Pendiente) | feat(services): implementar metodos de asignacion y consulta de patrullas disponibles |
| **TC-H20-WEB-08** | Flujo completo de confirmación en `AsignarPatrullaModal`: envío, notificación Toast, callback `onAsignacionExitosa` y cierre | Funcional / Integración (CA-3 / CA-6) | Componente / Integración | Crítica | Usuario Encargado selecciona patrulla `pat-001` y pulsa `"Confirmar y Despachar"`. | Submit en `AsignarPatrullaModal` con `incidenteId: 'inc-001'`, `patrullaId: 'pat-001'` | Invoca `despacharPatrullaVerificadora`, emite `showSuccess` con el código `MIS-2026-8341`, ejecuta `onAsignacionExitosa(res.data)` y cierra el modal. | Se ejecutan `despacharPatrullaVerificadora`, `showSuccess`, `onAsignacionExitosa` y `onClose` satisfactoriamente. | APROBADO | 08/11/2026 12:36 | (Pendiente) | feat(mando): incorporar modal de asignacion rapida de patrulla en drawer de incidente |
| **TC-H20-WEB-09** | Validación previa en cliente cuando `incidenteId` o `patrullaId` están vacíos en `despacharPatrullaVerificadora` | Validación / Borde (CA-3) | Unitario / Servicio | Media | Invocación a `despacharPatrullaVerificadora({ incidenteId: '', patrullaId: 'p-1' })`. | Payload incompleto `{ incidenteId: '', patrullaId: 'p-1' }` | Retorna `{ exito: false, codigoError: 400 }` sin realizar petición HTTP al servidor. | El servicio aborta localmente con código `400` y `fetch` registra `0` llamadas. | APROBADO | 08/11/2026 12:36 | (Pendiente) | feat(services): implementar metodos de asignacion y consulta de patrullas disponibles |
| **TC-H20-WEB-10** | Manejo de colisión de concurrencia (`409 Conflict`) con alerta al Encargado y recarga automática de patrullas disponibles | Concurrencia (CA-5) | Componente / Integración | Crítica | La patrulla seleccionada cambia a no disponible concurrentemente antes de confirmar el despacho. | `POST /api/misiones` responde `409 Conflict` `{ message: 'La patrulla seleccionada ya no se encuentra disponible.' }` | El modal muestra `InlineNotice` de error y Toast de conflicto, mantiene abierto el diálogo e invoca automáticamente `listarPatrullasDisponibles` por segunda vez. | Se renderiza el mensaje de conflicto `409`, se dispara `showError` y `listarPatrullasDisponibles` se ejecuta 2 veces actualizando el selector. | APROBADO | 08/11/2026 12:36 | (Pendiente) | feat(mando): incorporar modal de asignacion rapida de patrulla en drawer de incidente |
| **TC-H20-WEB-11** | Bloqueo y retroalimentación ante respuesta `403 Forbidden` cuando el usuario carece del permiso `misiones:asignar` | Seguridad RBAC (CA-7) | Componente / Servicio | Crítica | Usuario sin permiso `misiones:asignar` intenta ejecutar `POST /api/misiones`. | `POST /api/misiones` con header `x-user-id` de rol sin permiso -> `403 Forbidden` | El servicio retorna `esForbidden: true` (`403`), el modal muestra aviso indicando que requiere `misiones:asignar` y deshabilita el botón `"Confirmar y Despachar"`. | Se muestra el banner de acceso denegado mencionando `misiones:asignar`, se emite Toast de error y el botón de envío queda deshabilitado. | APROBADO | 08/11/2026 12:36 | (Pendiente) | feat(mando): incorporar modal de asignacion rapida de patrulla en drawer de incidente |
| **TC-H20-WEB-12** | Suscripción WebSocket a las salas `encargado`, `sala:encargados` y `mapa` y escucha de `incidente:actualizado` | Tiempo Real / WebSocket (CA-4 / CA-6) | Unitario / Hook | Alta | Montaje de `useEncargadoKanbanSocket` en el Centro de Mando. | Evento `connect` y recepción de payload `incidente:actualizado` `{ datos: { id: 'inc-123', nuevoEstado: 'VERIFICANDO' } }` | El socket emite `join`/`unirse` para `encargado`, `sala:encargados` y `mapa`, normaliza el evento `incidente:actualizado` e invoca `onIncidenteActualizado`. | El hook se suscribe a las salas requeridas al conectar, procesa `incidente:actualizado` y limpia suscripciones al desmontar. | APROBADO | 08/11/2026 12:36 | (Pendiente) | fix(socket): asegurar suscripcion a salas encargado y mapa para actualizacion reactiva |
| **TC-H20-WEB-13** | Traslado automático de la tarjeta del incidente a la columna `VERIFICANDO` en el tablero Kanban sin refresco manual | Reactividad UI (CA-6) | Integración / Hook | Alta | Incidente `inc-001` en columna `REPORTADO`; se confirma despacho o llega evento `incidente:actualizado`. | Ejecución de `moverIncidenteAEstado('inc-001', 'VERIFICANDO')` o callback `handleIncidenteActualizado` | El incidente se elimina de `columnas.REPORTADO` y se inserta al inicio de `columnas.VERIFICANDO` con `estado: 'VERIFICANDO'` sin recargar la página. | La tarjeta se traslada reactivamente en memoria de la columna `REPORTADO` a `VERIFICANDO`. | APROBADO | 08/11/2026 12:36 | (Pendiente) | fix(mando): actualizar kanban reactivamente al despachar y habilitar boton en tarjeta |
| **TC-H20-WEB-14** | Actualización reactiva del estado y listado de misiones dentro de `IncidenteDetalleDrawer` tras confirmar asignación | Funcional / UI (CA-1 / CA-3) | Componente | Media | `IncidenteDetalleDrawer` abierto en incidente `REPORTADO` al completarse `handleAsignacionExitosa`. | `handleAsignacionExitosa({ mision: { id: 'mis-50', codigo: 'MIS-2026-8341', estado: 'DESPACHADA', tipoMision: 'VERIFICACION' }, incidente: { id: 'inc-001', estado: 'VERIFICANDO' }, patrulla: { id: 'pat-001', nombre: 'Patrulla Ánimas Norte 1', estado: 'EN_VERIFICACION' } })` | El Drawer actualiza `detalle.estado` a `'VERIFICANDO'`, agrega la nueva misión a `detalle.misiones` y notifica al Kanban mediante `onIncidenteActualizado`. | El Drawer refleja inmediatamente el estado `VERIFICANDO` y la tarjeta de la misión creada sin requerir cerrar y reabrir el panel. | APROBADO | 08/11/2026 12:36 | (Pendiente) | fix(build): corregir tipos de mision en drawer y handler de actualizacion en modal |
| **TC-H20-WEB-15** | Resiliencia ante fallo de red (`Failed to fetch`) durante el despacho o la consulta de patrullas disponibles | Resiliencia / Borde | Unitario / Servicio | Media | Caída de red o servidor API inalcanzable al invocar `despacharPatrullaVerificadora`. | `fetch('/api/misiones')` rechaza promesa con `new Error('Failed to fetch')` | Captura la excepción y retorna `{ exito: false, codigoError: 500, mensaje: 'Error de conexión con el servidor municipal al despachar la patrulla.' }`. | El servicio controla el error sin propagar excepciones no manejadas a la interfaz. | APROBADO | 08/11/2026 12:36 | (Pendiente) | feat(services): implementar metodos de asignacion y consulta de patrullas disponibles |

---

## 4. Bloque TSV

````tsv
ID Caso	Título del Caso de Prueba	Tipo de Prueba	Nivel	Prioridad	Precondición	Datos de Prueba (Payload / Headers / Query)	Resultado Esperado	Resultado Obtenido	Estado	Fecha / Hora Ejecución	Fecha / Hora Re-Test	Solución / Commit
BUG-H20-WEB-01	Omisión de contrato OpenAPI en api-generated.d.ts, tipos manuales en misiones.ts y uso de fetch nativo sin tipoMision: 'VERIFICACION'	Contrato OpenAPI / Arquitectura	Servicio / Tipos	Crítica	Inspección de src/types/api-generated.d.ts, src/types/misiones.ts y src/services/misionesService.ts.	POST /api/misiones con payload { incidenteId, patrullaId, tipoMision: 'VERIFICACION', titulo, prioridad } mediante apiClient.POST('/api/misiones')	paths['/api/misiones']['post'] tipado en api-generated.d.ts, tipos derivados del contrato OpenAPI y llamada mediante apiClient.POST incluyendo tipoMision: 'VERIFICACION'.	api-generated.d.ts declara post?: never en /api/misiones; misiones.ts define tipos manuales incompletos y misionesService.ts usa fetch nativo omitiendo tipoMision: 'VERIFICACION'.	ABIERTO	08/11/2026 12:36	(Pendiente)	Pendiente (Rechazado en Code Review)
BUG-H20-WEB-02	Ocultamiento del botón de asignación en el Drawer cuando un incidente REPORTADO tiene misiones previas y omisión en IncidenteDetalleHeader	Funcional / UI (CA-1)	Componente	Alta	Incidente en estado REPORTADO con al menos 1 misión previa (ej. RECHAZADA, CANCELADA o ASISTENCIA_SOCIAL) abierto en IncidenteDetalleDrawer.	Props: detalle={{ estado: 'REPORTADO', misiones: [misionPreviaRechazada] }} en IncidenteDetalleDrawer	El Drawer mantiene visible y accesible el botón para asignar una patrulla verificadora en la cabecera y/o sección de misiones mientras el incidente esté en REPORTADO sin verificación activa.	IncidenteMisionesSection oculta el botón porque evalúa misiones.length === 0, e IncidenteDetalleHeader importa ShieldCheck sin renderizar ningún botón.	ABIERTO	08/11/2026 12:36	(Pendiente)	Pendiente (Rechazado en Code Review)
BUG-H20-WEB-03	Ausencia de control preventivo RBAC (misiones:asignar) en botones de despacho y falta de filtrado defensivo DISPONIBLE en AsignarPatrullaModal	Seguridad RBAC / Regla ICS (CA-2 / CA-7)	Componente / Integración	Alta	Usuario sin permiso misiones:asignar en KanbanBoard o catálogo que retorna patrullas con estado !== 'DISPONIBLE'.	Render de KanbanBoard / IncidenteCard sin misiones:asignar; respuesta de listarPatrullasDisponibles con unidades mixtas	Controles de asignación ocultos o deshabilitados sin misiones:asignar, y selector filtrando estrictamente p.estado === 'DISPONIBLE' && p.activo !== false.	Los botones se renderizan habilitados para usuarios sin misiones:asignar y AsignarPatrullaModal asigna setPatrullas(res.data) sin filtrar defensivamente en cliente.	ABIERTO	08/11/2026 12:36	(Pendiente)	Pendiente (Rechazado en Code Review)
BUG-H20-WEB-04	Falta de incremento de totalMisiones al mover tarjeta a VERIFICANDO y actualización estática de paginacionColumna en useIncidentesKanban	Funcional / Reactividad (CA-6)	Hook / Estado	Media	Tablero Kanban con incidente en REPORTADO (totalMisiones: 0) que pasa a VERIFICANDO por despacho o evento Socket.io.	moverIncidenteAEstado('inc-001', 'VERIFICANDO') y evento incidente:actualizado en useIncidentesKanban	La tarjeta en VERIFICANDO refleja totalMisiones + 1 y paginacionColumna actualiza dinámicamente columnaOrigen y nuevoEstado tanto en acción local como por WebSocket.	totalMisiones permanece en 0 tras moverIncidenteAEstado, paginacionColumna está hardcodeado a REPORTADO/VERIFICANDO y no se actualiza en handleIncidenteActualizado.	ABIERTO	08/11/2026 12:36	(Pendiente)	Pendiente (Rechazado en Code Review)
BUG-H20-WEB-05	Fallo de análisis estático npx eslint (2 errores y 5 warnings) en archivos de HU-20 y advertencias act(...) en useEncargadoKanbanSocket.test.ts	Calidad de Código / CI	Estático / Unitario	Media	Ejecución de linter institucional y suite de pruebas de WebSocket.	npx eslint src/components/mando/patrullas/AsignarPatrullaModal.tsx src/hooks/useEncargadoKanbanSocket.ts src/components/mando/drawer/IncidenteDetalleHeader.tsx	0 errores y 0 warnings en ESLint; 0 advertencias de act(...) en stderr durante la ejecución de Vitest.	ESLint falla con exit code 1 (react-hooks/set-state-in-effect, @typescript-eslint/no-explicit-any, 5 no-unused-vars) y Vitest imprime 3 warnings act(...).	ABIERTO	08/11/2026 12:36	(Pendiente)	Pendiente (Rechazado en Code Review)
TC-H20-WEB-01	Renderizado del botón "Despachar Patrulla Verificadora" en IncidenteDetalleDrawer para incidente en estado REPORTADO sin misiones	Funcional (CA-1)	Componente	Alta	Incidente con estado: 'REPORTADO' y misiones: [] cargado en IncidenteDetalleDrawer.	incidenteId="inc-reportado-1", detalle={{ id: 'inc-reportado-1', codigo: 'INC-2026-9999', estado: 'REPORTADO', misiones: [] }}	Se muestra el botón "Despachar Patrulla Verificadora" y al pulsarlo se abre el diálogo Asignar Patrulla Verificadora.	El botón se renderiza en la sección de misiones y abre AsignarPatrullaModal con los datos del incidente.	APROBADO	08/11/2026 12:36	(Pendiente)	feat(mando): incorporar modal de asignacion rapida de patrulla en drawer de incidente
TC-H20-WEB-02	Ocultamiento del botón de asignación en IncidenteDetalleDrawer para incidentes en estado VERIFICANDO, EN_ATENCION o RESUELTO	Funcional / Regla ICS (CA-1)	Componente	Alta	Incidente con estado: 'EN_ATENCION' cargado en IncidenteDetalleDrawer.	incidenteId="i1000000-0000-4000-8000-000000000001", estado: 'EN_ATENCION'	El botón "Despachar Patrulla Verificadora" no se renderiza en el DOM, previniendo despachos duplicados de verificación.	queryByRole('button', { name: /Despachar Patrulla/i }) retorna null.	APROBADO	08/11/2026 12:36	(Pendiente)	feat(mando): incorporar modal de asignacion rapida de patrulla en drawer de incidente
TC-H20-WEB-03	Renderizado del botón "Asignar Patrulla" en IncidenteCard solo para incidentes en estado REPORTADO con stopPropagation	Funcional (CA-1)	Componente	Alta	Tarjeta IncidenteCard montada en columna REPORTADO con callback onAsignarPatrulla.	incidente={{ id: 'inc-001', codigo: 'INC-58291045', estado: 'REPORTADO' }}, clic en botón Asignar Patrulla	Invoca onAsignarPatrulla(incidente) 1 vez sin disparar el onClick de apertura del Drawer; en estado VERIFICANDO el botón no existe.	Se invoca onAsignarPatrulla sin propagar el clic al contenedor y se oculta en estados posteriores.	APROBADO	08/11/2026 12:36	(Pendiente)	fix(mando): actualizar kanban reactivamente al despachar y habilitar boton en tarjeta
TC-H20-WEB-04	Consulta de patrullas con filtro estado=DISPONIBLE mediante listarPatrullasDisponibles en patrullasService	Funcional / API (CA-2)	Unitario / Servicio	Alta	Invocación de listarPatrullasDisponibles('user-encargado').	GET /api/patrullas?page=1&limit=100&estado=DISPONIBLE con header x-user-id: user-encargado	El servicio solicita exclusivamente patrullas con estado=DISPONIBLE y limit=100, retornando el arreglo tipado de unidades disponibles.	fetch es llamado con /api/patrullas?page=1&limit=100&estado=DISPONIBLE y retorna exito: true con las unidades disponibles.	APROBADO	08/11/2026 12:36	(Pendiente)	feat(services): implementar metodos de asignacion y consulta de patrullas disponibles
TC-H20-WEB-05	Carga del selector de patrullas disponibles y vista previa de delegación y líder en AsignarPatrullaModal	Funcional / UI (CA-1 / CA-2)	Componente	Alta	Apertura de AsignarPatrullaModal con 2 patrullas disponibles (pat-001, pat-002).	isOpen=true, incidente={mockIncidente}, mockPatrullasDisponibles con delegación y líder	El <select> lista las patrullas disponibles, preselecciona la primera y muestra la tarjeta de vista previa con delegación, líder y teléfono.	El combobox renderiza ambas opciones y muestra los detalles de dotación de la unidad seleccionada.	APROBADO	08/11/2026 12:36	(Pendiente)	feat(mando): incorporar modal de asignacion rapida de patrulla en drawer de incidente
TC-H20-WEB-06	Estado informativo y bloqueo del botón de confirmación cuando no existen patrullas DISPONIBLE en la comuna	Funcional / Borde (CA-2)	Componente	Alta	listarPatrullasDisponibles retorna data: [] (0 patrullas disponibles).	GET /api/patrullas?page=1&limit=100&estado=DISPONIBLE -> { data: [], meta: { total: 0 } }	Se muestra un InlineNotice informando que no existen patrullas en estado DISPONIBLE y el botón "Confirmar y Despachar" permanece disabled.	El aviso informativo se renderiza y el botón de envío queda deshabilitado preventivamente.	APROBADO	08/11/2026 12:36	(Pendiente)	feat(mando): incorporar modal de asignacion rapida de patrulla en drawer de incidente
TC-H20-WEB-07	Despacho exitoso de patrulla verificadora (201 Created) en misionesService.despacharPatrulla	Funcional / Integración (CA-3)	Unitario / Servicio	Crítica	Incidente en REPORTADO y patrulla en DISPONIBLE.	POST /api/misiones body { incidenteId: 'inc-100', patrullaId: 'pat-100', titulo: 'Verificación de anegamiento', prioridad: 'ALTA' }	Retorna exito: true con mision.estado = 'DESPACHADA', mision.tipoMision = 'VERIFICACION', incidente.estado = 'VERIFICANDO' y patrulla.estado = 'EN_VERIFICACION'.	El servicio procesa la respuesta 201 Created y devuelve la estructura consolidada de la transacción atómica.	APROBADO	08/11/2026 12:36	(Pendiente)	feat(services): implementar metodos de asignacion y consulta de patrullas disponibles
TC-H20-WEB-08	Flujo completo de confirmación en AsignarPatrullaModal: envío, notificación Toast, callback onAsignacionExitosa y cierre	Funcional / Integración (CA-3 / CA-6)	Componente / Integración	Crítica	Usuario Encargado selecciona patrulla pat-001 y pulsa "Confirmar y Despachar".	Submit en AsignarPatrullaModal con incidenteId: 'inc-001', patrullaId: 'pat-001'	Invoca despacharPatrullaVerificadora, emite showSuccess con el código MIS-2026-8341, ejecuta onAsignacionExitosa(res.data) y cierra el modal.	Se ejecutan despacharPatrullaVerificadora, showSuccess, onAsignacionExitosa y onClose satisfactoriamente.	APROBADO	08/11/2026 12:36	(Pendiente)	feat(mando): incorporar modal de asignacion rapida de patrulla en drawer de incidente
TC-H20-WEB-09	Validación previa en cliente cuando incidenteId o patrullaId están vacíos en despacharPatrullaVerificadora	Validación / Borde (CA-3)	Unitario / Servicio	Media	Invocación a despacharPatrullaVerificadora({ incidenteId: '', patrullaId: 'p-1' }).	Payload incompleto { incidenteId: '', patrullaId: 'p-1' }	Retorna { exito: false, codigoError: 400 } sin realizar petición HTTP al servidor.	El servicio aborta localmente con código 400 y fetch registra 0 llamadas.	APROBADO	08/11/2026 12:36	(Pendiente)	feat(services): implementar metodos de asignacion y consulta de patrullas disponibles
TC-H20-WEB-10	Manejo de colisión de concurrencia (409 Conflict) con alerta al Encargado y recarga automática de patrullas disponibles	Concurrencia (CA-5)	Componente / Integración	Crítica	La patrulla seleccionada cambia a no disponible concurrentemente antes de confirmar el despacho.	POST /api/misiones responde 409 Conflict { message: 'La patrulla seleccionada ya no se encuentra disponible.' }	El modal muestra InlineNotice de error y Toast de conflicto, mantiene abierto el diálogo e invoca automáticamente listarPatrullasDisponibles por segunda vez.	Se renderiza el mensaje de conflicto 409, se dispara showError y listarPatrullasDisponibles se ejecuta 2 veces actualizando el selector.	APROBADO	08/11/2026 12:36	(Pendiente)	feat(mando): incorporar modal de asignacion rapida de patrulla en drawer de incidente
TC-H20-WEB-11	Bloqueo y retroalimentación ante respuesta 403 Forbidden cuando el usuario carece del permiso misiones:asignar	Seguridad RBAC (CA-7)	Componente / Servicio	Crítica	Usuario sin permiso misiones:asignar intenta ejecutar POST /api/misiones.	POST /api/misiones con header x-user-id de rol sin permiso -> 403 Forbidden	El servicio retorna esForbidden: true (403), el modal muestra aviso indicando que requiere misiones:asignar y deshabilita el botón "Confirmar y Despachar".	Se muestra el banner de acceso denegado mencionando misiones:asignar, se emite Toast de error y el botón de envío queda deshabilitado.	APROBADO	08/11/2026 12:36	(Pendiente)	feat(mando): incorporar modal de asignacion rapida de patrulla en drawer de incidente
TC-H20-WEB-12	Suscripción WebSocket a las salas encargado, sala:encargados y mapa y escucha de incidente:actualizado	Tiempo Real / WebSocket (CA-4 / CA-6)	Unitario / Hook	Alta	Montaje de useEncargadoKanbanSocket en el Centro de Mando.	Evento connect y recepción de payload incidente:actualizado { datos: { id: 'inc-123', nuevoEstado: 'VERIFICANDO' } }	El socket emite join/unirse para encargado, sala:encargados y mapa, normaliza el evento incidente:actualizado e invoca onIncidenteActualizado.	El hook se suscribe a las salas requeridas al conectar, procesa incidente:actualizado y limpia suscripciones al desmontar.	APROBADO	08/11/2026 12:36	(Pendiente)	fix(socket): asegurar suscripcion a salas encargado y mapa para actualizacion reactiva
TC-H20-WEB-13	Traslado automático de la tarjeta del incidente a la columna VERIFICANDO en el tablero Kanban sin refresco manual	Reactividad UI (CA-6)	Integración / Hook	Alta	Incidente inc-001 en columna REPORTADO; se confirma despacho o llega evento incidente:actualizado.	Ejecución de moverIncidenteAEstado('inc-001', 'VERIFICANDO') o callback handleIncidenteActualizado	El incidente se elimina de columnas.REPORTADO y se inserta al inicio de columnas.VERIFICANDO con estado: 'VERIFICANDO' sin recargar la página.	La tarjeta se traslada reactivamente en memoria de la columna REPORTADO a VERIFICANDO.	APROBADO	08/11/2026 12:36	(Pendiente)	fix(mando): actualizar kanban reactivamente al despachar y habilitar boton en tarjeta
TC-H20-WEB-14	Actualización reactiva del estado y listado de misiones dentro de IncidenteDetalleDrawer tras confirmar asignación	Funcional / UI (CA-1 / CA-3)	Componente	Media	IncidenteDetalleDrawer abierto en incidente REPORTADO al completarse handleAsignacionExitosa.	handleAsignacionExitosa({ mision: { id: 'mis-50', codigo: 'MIS-2026-8341', estado: 'DESPACHADA', tipoMision: 'VERIFICACION' }, incidente: { id: 'inc-001', estado: 'VERIFICANDO' }, patrulla: { id: 'pat-001', nombre: 'Patrulla Ánimas Norte 1', estado: 'EN_VERIFICACION' } })	El Drawer actualiza detalle.estado a 'VERIFICANDO', agrega la nueva misión a detalle.misiones y notifica al Kanban mediante onIncidenteActualizado.	El Drawer refleja inmediatamente el estado VERIFICANDO y la tarjeta de la misión creada sin requerir cerrar y reabrir el panel.	APROBADO	08/11/2026 12:36	(Pendiente)	fix(build): corregir tipos de mision en drawer y handler de actualizacion en modal
TC-H20-WEB-15	Resiliencia ante fallo de red (Failed to fetch) durante el despacho o la consulta de patrullas disponibles	Resiliencia / Borde	Unitario / Servicio	Media	Caída de red o servidor API inalcanzable al invocar despacharPatrullaVerificadora.	fetch('/api/misiones') rechaza promesa con new Error('Failed to fetch')	Captura la excepción y retorna { exito: false, codigoError: 500, mensaje: 'Error de conexión con el servidor municipal al despachar la patrulla.' }.	El servicio controla el error sin propagar excepciones no manejadas a la interfaz.	APROBADO	08/11/2026 12:36	(Pendiente)	feat(services): implementar metodos de asignacion y consulta de patrullas disponibles
````

---

## 5. Guía de Ejecución Paso a Paso y Evidencias Técnicas Replicables

### 5.1. Ejecución de Suites Automatizadas con Vitest

#### Comando 1: Ejecución consolidada de las suites de HU-20
```bash
npx vitest run src/services/__tests__/misionesService.test.ts src/services/__tests__/patrullasService.test.ts src/components/mando/patrullas/__tests__/AsignarPatrullaModal.test.tsx src/components/mando/__tests__/IncidenteDetalleDrawer.test.tsx src/components/mando/__tests__/IncidenteCard.test.tsx src/hooks/__tests__/useEncargadoKanbanSocket.test.ts
```

**Evidencia obtenida en consola:**
```text
 RUN  v3.2.7 /home/ds2fery/Documentos/Proyecto/sgrai-uach/web

 ✓ src/services/__tests__/misionesService.test.ts (10 tests) 18ms
 ✓ src/services/__tests__/patrullasService.test.ts (24 tests) 28ms
 ✓ src/hooks/__tests__/useEncargadoKanbanSocket.test.ts (4 tests) 30ms
 ✓ src/components/mando/__tests__/IncidenteCard.test.tsx (5 tests) 175ms
 ✓ src/components/mando/patrullas/__tests__/AsignarPatrullaModal.test.tsx (6 tests) 387ms
 ✓ src/components/mando/__tests__/IncidenteDetalleDrawer.test.tsx (4 tests) 331ms

 Test Files  6 passed (6)
      Tests  53 passed (53)
   Start at  12:36:28
   Duration  1.99s
```

#### Comando 2: Pruebas unitarias del servicio de despacho (`misionesService.test.ts`)
```bash
npm test -- --run src/services/__tests__/misionesService.test.ts -t "HU-20"
```

**Evidencia obtenida en consola:**
```text
 ✓ src/services/__tests__/misionesService.test.ts (10 tests | 5 skipped) 14ms
   ✓ Servicio API Misiones (HU-20: Despacho de Patrulla Verificadora) > debe rechazar la petición con código 400 si falta incidenteId o patrullaId
   ✓ Servicio API Misiones (HU-20: Despacho de Patrulla Verificadora) > debe despachar exitosamente la patrulla (HTTP 201)
   ✓ Servicio API Misiones (HU-20: Despacho de Patrulla Verificadora) > debe manejar error 409 Conflict si la patrulla ya fue asignada concurrentemente
   ✓ Servicio API Misiones (HU-20: Despacho de Patrulla Verificadora) > debe manejar error 403 Forbidden cuando el usuario carece de permiso misiones:asignar
   ✓ Servicio API Misiones (HU-20: Despacho de Patrulla Verificadora) > debe capturar errores de conexión de red
```

#### Comando 3: Pruebas de componente e integración en `AsignarPatrullaModal.test.tsx`
```bash
npm test -- --run src/components/mando/patrullas/__tests__/AsignarPatrullaModal.test.tsx -t "HU-20"
```

**Evidencia obtenida en consola:**
```text
 ✓ src/components/mando/patrullas/__tests__/AsignarPatrullaModal.test.tsx (6 tests) 387ms
   ✓ AsignarPatrullaModal (HU-20: Despacho de Patrulla Verificadora) > no renderiza nada si isOpen es false
   ✓ AsignarPatrullaModal (HU-20: Despacho de Patrulla Verificadora) > carga y renderiza las patrullas disponibles en el selector
   ✓ AsignarPatrullaModal (HU-20: Despacho de Patrulla Verificadora) > despacha exitosamente la patrulla seleccionada
   ✓ AsignarPatrullaModal (HU-20: Despacho de Patrulla Verificadora) > maneja el error 409 Conflict y refresca automáticamente las patrullas disponibles
   ✓ AsignarPatrullaModal (HU-20: Despacho de Patrulla Verificadora) > muestra mensaje informativo y deshabilita confirmación si no hay patrullas disponibles
   ✓ AsignarPatrullaModal (HU-20: Despacho de Patrulla Verificadora) > maneja error 403 Forbidden por permisos insuficientes
```

#### Comando 4: Verificación del análisis estático ESLint (`BUG-H20-WEB-05`)
```bash
npx eslint src/components/mando/drawer/IncidenteDetalleHeader.tsx src/components/mando/drawer/IncidenteMisionesSection.tsx src/components/mando/IncidenteDetalleDrawer.tsx src/components/mando/IncidenteCard.tsx src/components/mando/KanbanBoard.tsx src/components/mando/patrullas/AsignarPatrullaModal.tsx src/hooks/useEncargadoKanbanSocket.ts src/hooks/useIncidentesKanban.ts src/services/misionesService.ts src/services/patrullasService.ts
```

**Evidencia obtenida en consola:**
```text
/home/ds2fery/Documentos/Proyecto/sgrai-uach/web/src/components/mando/drawer/IncidenteDetalleHeader.tsx
  6:13  warning  'ShieldCheck' is defined but never used  @typescript-eslint/no-unused-vars

/home/ds2fery/Documentos/Proyecto/sgrai-uach/web/src/components/mando/patrullas/AsignarPatrullaModal.tsx
   47:22  warning  '_msg' is defined but never used    @typescript-eslint/no-unused-vars
   47:36  warning  '_title' is defined but never used  @typescript-eslint/no-unused-vars
   48:20  warning  '_msg' is defined but never used    @typescript-eslint/no-unused-vars
   48:34  warning  '_title' is defined but never used  @typescript-eslint/no-unused-vars
  106:7   error    Error: Calling setState synchronously within an effect can trigger cascading renders  react-hooks/set-state-in-effect

/home/ds2fery/Documentos/Proyecto/sgrai-uach/web/src/hooks/useEncargadoKanbanSocket.ts
  102:41  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

✖ 7 problems (2 errors, 5 warnings)
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

| Criterio de Aceptación (CA) | Casos de Prueba Asociados | Estado | Observación Técnica |
| :--- | :--- | :---: | :--- |
| **CA-1:** Desde el detalle o drawer de un incidente en estado `REPORTADO`, el sistema debe proveer un selector accesible para asignar una patrulla verificadora. | `TC-H20-WEB-01`, `TC-H20-WEB-02`, `TC-H20-WEB-03`, `BUG-H20-WEB-02` | **Observado** | Funciona cuando `misiones.length === 0`, pero el botón desaparece del Drawer si el incidente `REPORTADO` posee misiones previas (`BUG-H20-WEB-02`). |
| **CA-2:** El selector debe listar únicamente las patrullas que se encuentren en estado `DISPONIBLE` en la base de datos. | `TC-H20-WEB-04`, `TC-H20-WEB-05`, `TC-H20-WEB-06`, `BUG-H20-WEB-03` | **Observado** | `listarPatrullasDisponibles` envía `?estado=DISPONIBLE`, pero `AsignarPatrullaModal` no aplica filtro defensivo en cliente (`BUG-H20-WEB-03`). |
| **CA-3:** Al confirmar la asignación, la API ejecuta la transacción atómica (`mision` en `DESPACHADA`/`VERIFICACION`, `incidente` en `VERIFICANDO`, `patrulla` en `EN_VERIFICACION`, hito en `mision_hito`). | `TC-H20-WEB-07`, `TC-H20-WEB-08`, `TC-H20-WEB-09`, `TC-H20-WEB-14`, `BUG-H20-WEB-01` | **Fallido** | El cliente no usa `openapi-fetch` ni el contrato tipado en `api-generated.d.ts` (`post?: never`) y omite `tipoMision: 'VERIFICACION'` (`BUG-H20-WEB-01`). |
| **CA-4:** Emisión de eventos WebSocket `mision:asignada` a `patrulla:{id}` e `incidente:actualizado` a las salas `encargado` y `mapa`. | `TC-H20-WEB-12`, `BUG-H20-WEB-05` | **Observado** | El cliente se une a `encargado` y `mapa` y escucha `incidente:actualizado`, pero presenta error de tipado `any` en el handler y warnings `act(...)` en tests (`BUG-H20-WEB-05`). |
| **CA-5:** Si la patrulla seleccionada cambió de estado concurrentemente a no disponible, abortar con `409 Conflict` y notificar al Encargado. | `TC-H20-WEB-10` | **Cumple** | `AsignarPatrullaModal` captura el estado `409`, despliega `InlineNotice` y Toast de conflicto, y refresca automáticamente el listado de patrullas disponibles. |
| **CA-6:** El incidente en el tablero Kanban debe moverse automáticamente a la columna `'VERIFICANDO'` sin requerir refresco manual. | `TC-H20-WEB-13`, `BUG-H20-WEB-04` | **Observado** | La tarjeta se mueve a `VERIFICANDO`, pero no incrementa `totalMisiones` en memoria y los contadores de `paginacionColumna` se actualizan de forma estática (`BUG-H20-WEB-04`). |
| **CA-7:** El endpoint `POST /api/misiones` debe exigir el permiso RBAC `misiones:asignar`. | `TC-H20-WEB-11`, `BUG-H20-WEB-03` | **Observado** | Se maneja la respuesta `403 Forbidden`, pero los botones de acción en el Kanban y Drawer no verifican preventivamente `hasPermission('misiones:asignar')` (`BUG-H20-WEB-03`). |
