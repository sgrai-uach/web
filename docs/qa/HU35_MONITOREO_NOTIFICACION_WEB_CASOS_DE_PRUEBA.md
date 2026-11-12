# Plan y Reporte de Pruebas QA — HU-35: Monitoreo de Notificación y Trazabilidad de ACKs en Centro de Mando (Frontend / Web)

**Proyecto:** SGRAI — Sistema de Gestión de Recursos para Atención de Incidentes (DGRD Municipalidad de Valdivia)  
**Repositorio:** `sgrai-web`  
**Rama Evaluada:** `feature/h35-notificacion-mision-patrulla-web`  
**Historia de Usuario:** HU-35 — *Notificación de Misión a Patrulla y Monitoreo en Tiempo Real de Trazabilidad de ACKs (Extensión Web / Centro de Mando)*  
**Estado de Certificación QA:** `RECHAZADO EN AUDITORÍA DE SEGUIMIENTO — 4 DEFECTOS ABIERTOS`  
**Fecha de Auditoría Inicial:** `10/11/2026 15:30`  
**Fecha de Primer Re-Test:** `10/11/2026 18:00`  
**Fecha de Auditoría de Ampliación (Caché, Kanban y Línea de Tiempo):** `12/11/2026 11:35`

---

## 1. Resumen Ejecutivo de Auditoría Técnica

Durante la primera fase de QA (`10/11/2026`), se auditaron los cambios iniciales de HU-35 orientados al hook `useEncargadoKanbanSocket` y al renderizado de badges en `IncidenteMisionesSection`, cerrando 3 observaciones iniciales (`BUG-H35-WEB-01` a `BUG-H35-WEB-03`).

Posteriormente, la rama `feature/h35-notificacion-mision-patrulla-web` incorporó nuevas capacidades: caché reactivo persistido en `localStorage` (`trazabilidadStore.ts`), visualización directa en tarjetas Kanban (`IncidenteCard.tsx`), banner resumen en `IncidenteDetalleDrawer.tsx`, línea de tiempo horizontal de 3 etapas en `IncidenteMisionesSection.tsx`, etiqueta en `MisionesTabla.tsx`, corrección de hidratación en `IncidentesKpiCards.tsx` y manual de usuario (`docs/manuals/H35-monitoreo-notificacion-mision-patrulla.md`).

La inspección forense de código ejecutada el `12/11/2026 11:35` sobre el estado actual de la rama frente a los criterios de HU-35, la arquitectura definida en `GEMINI.md` y el contrato real de `sgrai-api` arrojó **4 defectos reales abiertos** (`BUG-H35-WEB-04` a `BUG-H35-WEB-07`), entre ellos una **contaminación cruzada crítica de caché entre incidentes distintos** en `IncidenteDetalleDrawer.tsx` y la **ausencia de protección monotónica/idempotente** ante eventos WebSocket fuera de orden en `trazabilidadStore.ts`.

| Métrica de Calidad | Ciclo 1 Re-Test (`10/11/2026`) | Auditoría Actual (`12/11/2026`) | Estado |
| :--- | :--- | :--- | :--- |
| **Total de Ítems en Matriz** | 15 (`3` Fixes + `12` TCs) | 25 (`7` Bugs + `18` TCs) | **25 Evaluados** |
| **Ítems Aprobados** | 15 / 15 (`100%`) | 20 / 25 (`80%`) | **20 Aprobados** |
| **Ítems Fallidos / Abiertos** | 0 | 5 (`4` Bugs + `1` TC Fallido) | **Bloquea Merge** |
| **Defectos Abiertos (`ABIERTO`)** | 0 | 4 (`1` Crítico, `2` Altos, `1` Medio) | **Requiere Corrección** |
| **Suite Unitaria Focalizada HU-35 (Vitest)** | 20 / 20 (`3` archivos) | 36 / 36 (`5` archivos) | **100% Passing** |
| **Suite Global Vitest** | 794 / 794 (`123` archivos) | 804 / 804 (`124` archivos) | **100% Passing** |
| **Compilación TypeScript (`npx tsc --noEmit`)** | 0 errores | 0 errores | **Cumple** |
| **ESLint (`npm run lint`)** | 0 errores | 0 errores (11 warnings previos) | **Cumple** |
| **Build Producción (`next build --webpack`)** | 47 / 47 rutas OK | 47 / 47 rutas OK | **Cumple** |

---

## 2. Registro Técnico de Defectos

### 2.1. Defectos Abiertos (Auditoría `12/11/2026 11:35`)

#### `BUG-H35-WEB-04` (Severidad: Crítica — **ABIERTO**) — Contaminación cruzada de caché de trazabilidad entre incidentes distintos en `IncidenteDetalleDrawer.tsx`
- **Archivos afectados:**
  - `src/components/mando/IncidenteDetalleDrawer.tsx` (líneas 90-114)
  - `src/lib/socket/trazabilidadStore.ts` (líneas 106-124)
- **Descripción técnica del fallo:**
  En `IncidenteDetalleDrawer.tsx` (línea 95), el manejador `handleTrazabilidad` conectado al socket singleton global ejecuta incondicionalmente:
  `setTrazabilidadEstado(payload.misionId, payload.estado, incidenteId);`
  El socket del Centro de Mando está suscrito a `sala:encargados`, por lo que recibe eventos `notificacion:trazabilidad_actualizada` correspondientes a **todos** los incidentes activos de la comuna. Al no validar si `payload.misionId` pertenece efectivamente a las misiones del `incidenteId` abierto en el drawer (`detalle.misiones`), cualquier evento emitido para una Misión B (de otro Incidente B) registra erróneamente `misionIncidenteMap.set(misionB, incidenteA)` y sobreescribe `incidenteEstadoCache.set(incidenteA, payload.estado)`.
- **Impacto funcional:**
  1. La tarjeta Kanban del **Incidente A** muestra falsamente estados (`RECIBIDA` / `LEIDA`) pertenecientes al **Incidente B**, induciendo al Encargado de Operaciones a creer que la patrulla asignada al Incidente A ya leyó la orden cuando sigue sin señal o sin acuse.
  2. El mapa `misionIncidenteMap` queda corrompido vinculando `misionB` con `incidenteA`, impidiendo que `useIncidentesKanban` resuelva el vínculo real hacia `incidenteB`.
- **Remediación esperada:**
  Verificar mediante una referencia sincronizada con `detalle?.misiones` que `payload.misionId` pertenezca al incidente abierto antes de pasar `incidenteId` a `setTrazabilidadEstado` (e ignorar en el drawer los eventos de misiones ajenas al incidente actual).

#### `BUG-H35-WEB-05` (Severidad: Alta — **ABIERTO**) — Ausencia de protección monotónica / idempotente ante eventos fuera de orden en `trazabilidadStore.ts` e `IncidenteDetalleDrawer.tsx`
- **Archivos afectados:**
  - `src/lib/socket/trazabilidadStore.ts` (líneas 106-124)
  - `src/components/mando/IncidenteDetalleDrawer.tsx` (líneas 94-107)
- **Descripción técnica del fallo:**
  `setTrazabilidadEstado` asigna directamente `misionEstadoCache.set(misionId, estado)` e `incidenteEstadoCache.set(resolvedIncidenteId, estado)` sin validar `esEstadoValido(estado)` ni verificar precedencia en la máquina de estados (`PENDIENTE_ENVIO < ENVIADA < RECIBIDA < LEIDA`). De forma análoga, `IncidenteDetalleDrawer.tsx` sobreescribe `m.trazabilidadNotificacion` directamente con `payload.estado`.
- **Impacto funcional:**
  En escenarios con micro-cortes o reconexiones de red (propios del flujo *offline-first* de HU-35), la llegada tardía de un evento `ENVIADA` o `RECIBIDA` posterior a `LEIDA` degrada el indicador en pantalla de `LEÍDA` hacia `RECIBIDA (SIN LEER)` o `NO LEÍDA`, rompiendo el principio de no retroceso de la máquina de estados.
- **Remediación esperada:**
  Definir un orden numérico explícito (`PENDIENTE_ENVIO: 0`, `ENVIADA: 1`, `RECIBIDA: 2`, `LEIDA: 3`) y rechazar actualizaciones inválidas o regresivas tanto en `setTrazabilidadEstado` como en el actualizador de estado del drawer.

#### `BUG-H35-WEB-06` (Severidad: Alta — **ABIERTO**) — Divergencia con tipos autogenerados (`api-generated.d.ts`) y pérdida de trazabilidad persistente desde servidor tras recarga (`F5`) en sesión limpia
- **Archivos afectados:**
  - `src/services/incidentesService.ts` (líneas 24-34)
  - `src/types/misiones.ts` (líneas 200-207)
  - `src/types/api-generated.d.ts` (sin regenerar)
- **Descripción técnica del fallo:**
  En contravención con la Sección 4 de `GEMINI.md`, las propiedades `trazabilidadNotificacion` y `notificacion` fueron agregadas por intersección manual (`& { ... }`) en lugar de regenerar `src/types/api-generated.d.ts` con `npm run generate-api-types` desde OpenAPI. Adicionalmente, al verificar el repositorio `sgrai-api` (`src/modules/incidentes/incidente-kanban.repository.ts`), los endpoints `GET /api/incidentes` y `GET /api/incidentes/{id}` aún no proyectan el último estado desde la tabla `notificaciones_mision`, mientras `POST /api/misiones` sí retorna `data.notificacion` pero dicho campo no existe en `api-generated.d.ts`.
- **Impacto funcional:**
  Si un Encargado abre `/gestion/centro-incidentes` en una sesión limpia (sin caché previo en `localStorage`) o desde otro puesto de mando, todas las misiones despachadas previamente aparecen en estado `SIN ACUSE` y pierden su trazabilidad histórica hasta que ocurra un nuevo evento WebSocket en vivo.
- **Remediación esperada:**
  Coordinar con `sgrai-api` la exposición del estado de trazabilidad en el listado/detalle de incidentes y regenerar `src/types/api-generated.d.ts` eliminando extensiones manuales de contrato.

#### `BUG-H35-WEB-07` (Severidad: Media — **ABIERTO**) — Falta de validación defensiva de payload, suscripción sin verificación de conexión en drawer y brecha de cobertura unitaria en `MisionesTabla` / `useIncidentesKanban`
- **Archivos afectados:**
  - `src/hooks/useEncargadoKanbanSocket.ts` (líneas 167-173)
  - `src/components/mando/IncidenteDetalleDrawer.tsx` (líneas 90-114)
  - `src/components/mando/misiones/MisionesTabla.tsx` (líneas 44-64 y 234-258)
  - `src/hooks/__tests__/useIncidentesKanban.test.ts`
- **Descripción técnica del fallo:**
  1. `handleTrazabilidad` en `useEncargadoKanbanSocket.ts` invoca `setTrazabilidadEstado(payload.misionId, payload.estado)` sin verificar la presencia y validez de `payload?.misionId` y `payload?.estado`.
  2. `IncidenteDetalleDrawer.tsx` registra `socket.on('notificacion:trazabilidad_actualizada', ...)` sin garantizar `socket.connected` en montajes fuera de `KanbanBoard`.
  3. No existen pruebas unitarias para `tabla-trazabilidad-${mision.id}` en `MisionesTabla` ni para `handleTrazabilidadActualizada` en `useIncidentesKanban`.
- **Remediación esperada:**
  Incorporar guardas de validación del payload WebSocket, asegurar conexión del socket en el drawer cuando corresponda y agregar pruebas unitarias en `MisionesModal.test.tsx`, `useIncidentesKanban.test.ts` y `trazabilidadStore.test.ts`.

---

### 2.2. Defectos Previos Verificados en Re-Test (`10/11/2026 18:00`)

#### `BUG-H35-WEB-01` (Severidad: Alta — **APROBADO**) — Tipado estricto del estado de trazabilidad en interfaces de dominio
- **Archivos verificados:** `src/services/incidentesService.ts`, `src/types/misiones.ts`, `src/components/mando/drawer/IncidenteMisionesSection.tsx`, `src/components/mando/IncidenteDetalleDrawer.tsx`.
- **Resolución verificada:** Se eliminó el casteo `(mision as Record<string, unknown>)` reemplazándolo por la unión estricta `EstadoTrazabilidadNotificacion` y el mapa tipado `TRAZABILIDAD_CONFIG`.

#### `BUG-H35-WEB-02` (Severidad: Media — **APROBADO**) — Cobertura unitaria de badges semánticos, diseño plano (`borderRadius: 0`) y ausencia de emojis
- **Archivos verificados:** `src/components/mando/__tests__/IncidenteMisionesSection.test.tsx`.
- **Resolución verificada:** Cobertura parametrizada para los 4 estados, esquinas rectas `0px`, borde `1px solid currentColor` y validación Unicode de ausencia total de emojis.

#### `BUG-H35-WEB-03` (Severidad: Media — **APROBADO**) — Cobertura de recepción y desuscripción del evento WebSocket en hook y drawer
- **Archivos verificados:** `src/hooks/__tests__/useEncargadoKanbanSocket.test.ts`, `src/components/mando/__tests__/IncidenteDetalleDrawer.test.tsx`.
- **Resolución verificada:** Se valida la recepción de `notificacion:trazabilidad_actualizada`, la actualización de `ultimoEvento` / `detalle.misiones` y la limpieza `socket.off` al desmontar.

---

## 3. Matriz Consolidada de Casos de Prueba (13 Columnas)

| ID Caso | Título del Caso de Prueba | Tipo de Prueba | Nivel | Prioridad | Precondición | Datos de Prueba (Payload / Headers / Query) | Resultado Esperado | Resultado Obtenido | Estado | Fecha / Hora Ejecución | Fecha / Hora Re-Test | Solución / Commit |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **BUG-H35-WEB-04** | Aislamiento de eventos de trazabilidad por incidente en `IncidenteDetalleDrawer.tsx` | Integridad de Caché / WebSocket | Componente / Store | Crítica | Drawer abierto en `incidenteId="inc-A"` mientras el socket en `sala:encargados` recibe evento de `misionId="mis-B"` perteneciente a `inc-B`. | Payload WS: `{ notificacionId: 'n-b', misionId: 'mis-B', patrullaId: 'pat-2', estado: 'LEIDA' }` | El drawer debe ignorar eventos cuya `misionId` no pertenezca a `detalle.misiones` sin asociar `mis-B` a `inc-A` ni mutar la tarjeta Kanban de `inc-A`. | `IncidenteDetalleDrawer.tsx` línea 95 ejecuta `setTrazabilidadEstado(payload.misionId, payload.estado, incidenteId)`, contaminando `misionIncidenteMap` e `incidenteEstadoCache` para `inc-A`. | ABIERTO | 12/11/2026 11:35 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| **BUG-H35-WEB-05** | Protección monotónica e idempotente ante eventos de trazabilidad fuera de orden en `trazabilidadStore.ts` | Lógica de Estados / Resiliencia | Store / Componente | Alta | Misión `mis-100` ya confirmada en estado `LEIDA` (`paso: 3`) en caché y drawer. | Payload tardío WS: `{ misionId: 'mis-100', estado: 'RECIBIDA' }` o `'ENVIADA'` | El estado debe permanecer inmutable en `LEIDA` sin retroceder ni sobreescribir `incidenteEstadoCache`. | `setTrazabilidadEstado` y `IncidenteDetalleDrawer.tsx` sobreescriben directamente con `payload.estado`, permitiendo regresión visual de `LEIDA` a `RECIBIDA` o `ENVIADA`. | ABIERTO | 12/11/2026 11:35 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| **BUG-H35-WEB-06** | Sincronización de contrato OpenAPI (`api-generated.d.ts`) y persistencia desde API tras recarga en sesión limpia | Contrato / Persistencia | Integración / Tipos | Alta | Navegador sin datos previos en `localStorage` consultando `GET /api/incidentes` y `GET /api/incidentes/{id}`. | `src/types/api-generated.d.ts`, `src/services/incidentesService.ts`, `src/types/misiones.ts` | Contratos generados automáticamente vía OpenAPI (`npm run generate-api-types`) e hidratación del estado real desde BD sin depender solo de `localStorage`. | Tipos extendidos manualmente con intersecciones; `api-generated.d.ts` no regenerado y backend `incidente-kanban.repository.ts` no retorna `trazabilidadNotificacion`. | ABIERTO | 12/11/2026 11:35 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| **BUG-H35-WEB-07** | Validación defensiva de payload WS, conexión aislada del drawer y cobertura unitaria en `MisionesTabla` / `useIncidentesKanban` | Calidad / Robustez | Hook / Componente | Media | Revisión de `useEncargadoKanbanSocket.ts`, `MisionesTabla.tsx`, `useIncidentesKanban.ts` y archivos `.test.*`. | Payload malformado sin `misionId` / `estado` inválido; suites de `MisionesTabla` y `useIncidentesKanban` | Guardas de validación en runtime y cobertura automatizada en Vitest para tabla de misiones y resolución misión-incidente. | `handleTrazabilidad` no valida payload; `MisionesModal.test.tsx` y `useIncidentesKanban.test.ts` carecen de pruebas para `tabla-trazabilidad-*` y `handleTrazabilidadActualizada`. | ABIERTO | 12/11/2026 11:35 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| **BUG-H35-WEB-01** | Eliminación de casteo inseguro y tipado de dominio en `incidentesService.ts` | Arquitectura / Tipos | Tipos / Contrato | Alta | Inspección de `src/services/incidentesService.ts` e `IncidenteMisionesSection.tsx`. | Definición de `EstadoTrazabilidadNotificacion` y mapa `TRAZABILIDAD_CONFIG` | Tipos estrictos sin `any` ni casteos inseguros a `Record<string, unknown>`. | En Re-Test: `incidentesService.ts` y `trazabilidadConfig.ts` tipan estrictamente los 4 estados y su configuración visual. | APROBADO | 10/11/2026 15:30 | 10/11/2026 18:00 | refactor(mando): tipado estricto de trazabilidad y mapeo de configuracion de badges |
| **BUG-H35-WEB-02** | Cobertura unitaria de badges semánticos, esquinas rectas (`borderRadius: 0`) y ausencia de emojis | Calidad / Vitest | Componente / UI | Media | Ejecución de `vitest run src/components/mando/__tests__/IncidenteMisionesSection.test.tsx`. | Misiones con estados `PENDIENTE_ENVIO`, `ENVIADA`, `RECIBIDA`, `LEIDA` | 100% de aserciones aprobadas verificando texto, colores, bordes y ausencia de emojis. | Suite aprobada verificando los 4 badges, `borderRadius: 0px` y regex Unicode sin emojis. | APROBADO | 10/11/2026 15:30 | 10/11/2026 18:00 | test(mando): incorporar pruebas unitarias de trazabilidad, badges semanticos y eventos websocket |
| **BUG-H35-WEB-03** | Verificación de recepción y limpieza de evento `notificacion:trazabilidad_actualizada` en hooks y drawer | Calidad / WebSocket | Hook / Componente | Media | Ejecución de `useEncargadoKanbanSocket.test.ts` e `IncidenteDetalleDrawer.test.tsx`. | Simulación de emisión de evento WebSocket en socket mockeado | Invocación de callbacks correspondientes y limpieza con `socket.off` al desmontar. | Pruebas unitarias en hook y drawer aprueban verificando actualización y limpieza de listeners. | APROBADO | 10/11/2026 15:30 | 10/11/2026 18:00 | test(mando): incorporar pruebas unitarias de trazabilidad, badges semanticos y eventos websocket |
| **TC-H35-WEB-01** | Exportación de interfaz `NotificacionTrazabilidadPayload` en hook `useEncargadoKanbanSocket.ts` | Contrato / Tipos | Hook | Alta | Inspección de `src/hooks/useEncargadoKanbanSocket.ts`. | Definición TypeScript de payload WebSocket | La interfaz exporta `notificacionId`, `misionId`, `patrullaId`, `estado`, timestamps e intentos. | La interfaz se encuentra exportada y disponible sin errores en `npx tsc --noEmit`. | APROBADO | 10/11/2026 15:30 | 12/11/2026 11:35 | feat(monitoreo): reflejar trazabilidad y acuses de notificaciones en drawer de misiones (#35) |
| **TC-H35-WEB-02** | Registro de listener para `notificacion:trazabilidad_actualizada` en hook al montar | Tiempo Real | Hook | Alta | Montaje de `useEncargadoKanbanSocket` con socket inicializado. | Evento `notificacion:trazabilidad_actualizada` | `socket.on('notificacion:trazabilidad_actualizada', expect.any(Function))` es invocado. | Listener registrado satisfactoriamente durante el efecto de conexión. | APROBADO | 10/11/2026 15:30 | 12/11/2026 11:35 | feat(monitoreo): reflejar trazabilidad y acuses de notificaciones en drawer de misiones (#35) |
| **TC-H35-WEB-03** | Invocación de callback `onNotificacionTrazabilidadActualizada` ante evento de socket | Reactividad | Hook | Alta | Hook montado con opción `onNotificacionTrazabilidadActualizada`. | Payload con `{ notificacionId: 'notif-987', misionId: 'mis-100', estado: 'RECIBIDA' }` | Callback invocado con el payload exacto y `ultimoEvento` actualizado a `"Trazabilidad misión: RECIBIDA"`. | El callback se ejecuta con los datos correctos y el estado interno se actualiza. | APROBADO | 10/11/2026 15:30 | 12/11/2026 11:35 | test(mando): incorporar pruebas unitarias de trazabilidad, badges semanticos y eventos websocket |
| **TC-H35-WEB-04** | Desuscripción de listener `notificacion:trazabilidad_actualizada` al desmontar hook | Resiliencia / Fugas | Hook | Media | Desmontaje de componente que utiliza `useEncargadoKanbanSocket`. | Invocación de `unmount()` | `socket.off('notificacion:trazabilidad_actualizada', expect.any(Function))` es invocado. | Limpieza de listener verificada previniendo fugas de memoria y listeners duplicados. | APROBADO | 10/11/2026 15:30 | 12/11/2026 11:35 | test(mando): incorporar pruebas unitarias de trazabilidad, badges semanticos y eventos websocket |
| **TC-H35-WEB-05** | Suscripción de `IncidenteDetalleDrawer` al evento mientras el drawer permanezca abierto | Tiempo Real | Componente | Alta | `IncidenteDetalleDrawer` montado con `incidenteId` válido. | Props `incidenteId="inc-100"` | Registra listener de socket para `notificacion:trazabilidad_actualizada`. | El listener se enlaza al socket activo al abrir el drawer. | APROBADO | 10/11/2026 15:30 | 12/11/2026 11:35 | feat(monitoreo): reflejar trazabilidad y acuses de notificaciones en drawer de misiones (#35) |
| **TC-H35-WEB-06** | Desuscripción de `IncidenteDetalleDrawer` al cerrar o cambiar `incidenteId` | Resiliencia / Fugas | Componente | Media | Cierre del drawer o transición de `incidenteId` a `null`. | Desmontaje del drawer | Invocación de `socket.off('notificacion:trazabilidad_actualizada', handleTrazabilidad)`. | El listener es removido correctamente del socket al desmontar o cambiar de incidente. | APROBADO | 10/11/2026 15:30 | 12/11/2026 11:35 | feat(monitoreo): reflejar trazabilidad y acuses de notificaciones en drawer de misiones (#35) |
| **TC-H35-WEB-07** | Actualización reactiva de `detalle.misiones` y banner resumen en Drawer ante evento de trazabilidad | Reactividad / UI | Componente | Crítica | Drawer abierto visualizando misión con ID coincidente con `payload.misionId`. | Payload con `{ misionId: 'm1', estado: 'RECIBIDA' }` | Misión actualiza `trazabilidadNotificacion: 'RECIBIDA'` reflejando el badge y el banner superior sin recargar. | El estado local de misiones muta reactivamente y la interfaz actualiza el badge y el banner de inmediato. | APROBADO | 10/11/2026 15:30 | 12/11/2026 11:35 | feat(mando): visibilizar estado de lectura y trazabilidad en tarjetas kanban y drawer |
| **TC-H35-WEB-08** | Renderizado de badge semántico `PENDIENTE_ENVIO` ("Patrulla sin señal / offline") | UI / Semántica | Componente | Alta | Misión con `trazabilidadNotificacion: 'PENDIENTE_ENVIO'` en Drawer. | Props: `mision.trazabilidadNotificacion = 'PENDIENTE_ENVIO'` | Badge con texto `"Patrulla sin señal / offline"`, fondo `#ECEFF3`, texto `#3B3F45` y esquinas rectas. | El badge se renderiza con el texto exacto, fondo gris y texto neutral especificados. | APROBADO | 10/11/2026 15:30 | 12/11/2026 11:35 | test(mando): incorporar pruebas unitarias de trazabilidad, badges semanticos y eventos websocket |
| **TC-H35-WEB-09** | Renderizado de badge semántico `ENVIADA` ("Alerta emitida al móvil") | UI / Semántica | Componente | Alta | Misión con `trazabilidadNotificacion: 'ENVIADA'` en Drawer. | Props: `mision.trazabilidadNotificacion = 'ENVIADA'` | Badge con texto `"Alerta emitida al móvil"`, fondo `#FFF3E0`, texto `#E65100` y esquinas rectas. | El badge se renderiza con fondo ámbar suave y texto de advertencia institucional. | APROBADO | 10/11/2026 15:30 | 12/11/2026 11:35 | test(mando): incorporar pruebas unitarias de trazabilidad, badges semanticos y eventos websocket |
| **TC-H35-WEB-10** | Renderizado de badge semántico `RECIBIDA` ("Recibida en móvil de terreno") | UI / Semántica | Componente | Crítica | Misión con `trazabilidadNotificacion: 'RECIBIDA'` en Drawer (ACK técnico). | Props: `mision.trazabilidadNotificacion = 'RECIBIDA'` | Badge con texto `"Recibida en móvil de terreno"`, fondo `#E8F5E9`, texto `#2E7D32` y esquinas rectas. | El badge se renderiza con fondo verde suave y texto verde éxito institucional. | APROBADO | 10/11/2026 15:30 | 12/11/2026 11:35 | test(mando): incorporar pruebas unitarias de trazabilidad, badges semanticos y eventos websocket |
| **TC-H35-WEB-11** | Renderizado de badge semántico `LEIDA` ("Leída por operador en terreno") | UI / Semántica | Componente | Crítica | Misión con `trazabilidadNotificacion: 'LEIDA'` en Drawer (ACK operativo). | Props: `mision.trazabilidadNotificacion = 'LEIDA'` | Badge con texto `"Leída por operador en terreno"`, fondo `#E0F2F1`, texto `#14505A` y esquinas rectas. | El badge se renderiza con fondo teal suave y texto teal oscuro institucional. | APROBADO | 10/11/2026 15:30 | 12/11/2026 11:35 | test(mando): incorporar pruebas unitarias de trazabilidad, badges semanticos y eventos websocket |
| **TC-H35-WEB-12** | Certificación de diseño plano (`borderRadius: 0`) y ausencia total de emojis en componentes | Guía de Estilo | Componente | Alta | Renderizado de sección de misiones y tarjetas Kanban con estados de trazabilidad. | Inspección de estilos CSS y regex Unicode `/\p{Extended_Pictographic}/u` | `borderRadius: 0px`, `border: 1px solid currentColor` y 0 emojis (solo iconos SVG de `lucide-react`). | Aserciones unitarias en `IncidenteMisionesSection.test.tsx` e `IncidenteCard.test.tsx` aprueban al 100%. | APROBADO | 10/11/2026 15:30 | 12/11/2026 11:35 | test(mando): incorporar pruebas unitarias de trazabilidad, badges semanticos y eventos websocket |
| **TC-H35-WEB-13** | Visualización directa de lectura/no lectura y aviso `SIN ACUSE` en tarjetas Kanban (`IncidenteCard`) | UI / Operación | Componente | Alta | Tarjeta en columna `VERIFICANDO` con o sin `trazabilidadNotificacion`. | Props `trazabilidadNotificacion` en `'PENDIENTE_ENVIO'`, `'RECIBIDA'`, `'LEIDA'` y `undefined` | Renderizado apilado con `NO LEÍDA`, `RECIBIDA (SIN LEER)`, `LEÍDA` o `SIN ACUSE` contenido en la tarjeta. | Las 4 pruebas de trazabilidad en `IncidenteCard.test.tsx` aprueban validando texto, diseño apilado y `borderRadius: 0px`. | APROBADO | 12/11/2026 11:35 | 12/11/2026 11:35 | test(mando): validar flexShrink 0 en cajas de trazabilidad de tarjetas |
| **TC-H35-WEB-14** | Renderizado de línea de tiempo horizontal conectada en `IncidenteMisionesSection` | UI / Trazabilidad | Componente | Media | Misión con estado `PENDIENTE_ENVIO`, `ENVIADA`, `RECIBIDA` o `LEIDA`. | `timeline-trazabilidad-{misionId}` con pasos `1`, `2` y `3` | Riel horizontal conectado de 3 pasos con atributos `data-estado` (`actual`, `completado`, `pendiente`) y nodos `borderRadius: 0px`. | Test parametrizado de línea de tiempo aprobado verificando progresión en los 4 estados y nodos cuadrados. | APROBADO | 12/11/2026 11:35 | 12/11/2026 11:35 | test(mando): validar linea de tiempo y diseno apilado de trazabilidad |
| **TC-H35-WEB-15** | Prevención de recorte vertical y desborde de textos extensos en columnas Kanban y detalle | Maquetación / CSS | Componente / CSS | Alta | Tarjeta con dirección extensa (`120` chars sin espacios) en columna con scroll vertical. | `direccion = 'a'.repeat(120)` + inspección CSS `flex-shrink: 0` y `overflow-wrap: anywhere` | Las cajas de trazabilidad mantienen `flexShrink: '0'` y `overflow: 'hidden'` sin recortar el contenido ni desbordar la tarjeta. | Verificado en `IncidenteCard.test.tsx` y en hojas CSS `mando.module.css` / `mision-detalle.module.css`. | APROBADO | 12/11/2026 11:35 | 12/11/2026 11:35 | fix(mando): evitar recorte vertical de tarjetas kanban y contenedores con flex-shrink 0 |
| **TC-H35-WEB-16** | Persistencia en `localStorage` (`sgrai_trazabilidad_notificaciones_v2`) entre reaperturas del drawer | Persistencia Local | Store | Alta | Llamada a `setTrazabilidadEstado` y `vincularMisionIncidente` seguida de lectura por misión e incidente. | `{ misionId: 'mision-001', estado: 'LEIDA', incidenteId: 'inc-001' }` | El store retorna el estado persistido y notifica a los suscriptores activos. | Las 3 pruebas unitarias de `trazabilidadStore.test.ts` aprueban al 100%. | APROBADO | 12/11/2026 11:35 | 12/11/2026 11:35 | fix(mando): persistir cache local de trazabilidad entre reaperturas del drawer |
| **TC-H35-WEB-17** | Entrega de manual de usuario institucional conforme a `GEMINI.md` | Documentación | Repositorio | Alta | Inspección de `docs/manuals/H35-monitoreo-notificacion-mision-patrulla.md`. | Estructura de roles, objetivo, pasos, errores, relación con API/PWA y cero emojis | Manual completo siguiendo convención `H<numero>-<slug>.md` dentro del mismo PR. | Archivo presente (`89` líneas) con todos los apartados requeridos y sin emojis. | APROBADO | 12/11/2026 11:35 | 12/11/2026 11:35 | docs(manuals): agregar manual de usuario para monitoreo de trazabilidad (H35) |
| **TC-H35-WEB-18** | Reconstrucción del último estado de notificación desde BD tras recarga en navegador limpio | Integración / Persistencia | E2E / Contrato | Alta | Sesión limpia (`localStorage` vacío) consultando `GET /api/incidentes` y `GET /api/incidentes/{id}`. | Respuestas JSON de listado y detalle de incidente con misión despachada previamente | El tablero y el drawer hidratan desde servidor el último estado de la notificación (`PENDIENTE_ENVIO`..`LEIDA`). | `GET /api/incidentes` y `GET /api/incidentes/{id}` en `sgrai-api` no retornan `trazabilidadNotificacion`; la UI queda en `SIN ACUSE`. | FALLIDO | 12/11/2026 11:35 | (Pendiente) | Pendiente (Rechazado en Code Review) |

---

## 4. Bloque TSV

````tsv
ID Caso	Título del Caso de Prueba	Tipo de Prueba	Nivel	Prioridad	Precondición	Datos de Prueba (Payload / Headers / Query)	Resultado Esperado	Resultado Obtenido	Estado	Fecha / Hora Ejecución	Fecha / Hora Re-Test	Solución / Commit
BUG-H35-WEB-04	Aislamiento de eventos de trazabilidad por incidente en IncidenteDetalleDrawer.tsx	Integridad de Caché / WebSocket	Componente / Store	Crítica	Drawer abierto en incidenteId="inc-A" mientras el socket en sala:encargados recibe evento de misionId="mis-B" perteneciente a inc-B.	Payload WS: { notificacionId: 'n-b', misionId: 'mis-B', patrullaId: 'pat-2', estado: 'LEIDA' }	El drawer debe ignorar eventos cuya misionId no pertenezca a detalle.misiones sin asociar mis-B a inc-A ni mutar la tarjeta Kanban de inc-A.	IncidenteDetalleDrawer.tsx línea 95 ejecuta setTrazabilidadEstado(payload.misionId, payload.estado, incidenteId), contaminando misionIncidenteMap e incidenteEstadoCache para inc-A.	ABIERTO	12/11/2026 11:35	(Pendiente)	Pendiente (Rechazado en Code Review)
BUG-H35-WEB-05	Protección monotónica e idempotente ante eventos de trazabilidad fuera de orden en trazabilidadStore.ts	Lógica de Estados / Resiliencia	Store / Componente	Alta	Misión mis-100 ya confirmada en estado LEIDA (paso: 3) en caché y drawer.	Payload tardío WS: { misionId: 'mis-100', estado: 'RECIBIDA' } o 'ENVIADA'	El estado debe permanecer inmutable en LEIDA sin retroceder ni sobreescribir incidenteEstadoCache.	setTrazabilidadEstado y IncidenteDetalleDrawer.tsx sobreescriben directamente con payload.estado, permitiendo regresión visual de LEIDA a RECIBIDA o ENVIADA.	ABIERTO	12/11/2026 11:35	(Pendiente)	Pendiente (Rechazado en Code Review)
BUG-H35-WEB-06	Sincronización de contrato OpenAPI (api-generated.d.ts) y persistencia desde API tras recarga en sesión limpia	Contrato / Persistencia	Integración / Tipos	Alta	Navegador sin datos previos en localStorage consultando GET /api/incidentes y GET /api/incidentes/{id}.	src/types/api-generated.d.ts, src/services/incidentesService.ts, src/types/misiones.ts	Contratos generados automáticamente vía OpenAPI (npm run generate-api-types) e hidratación del estado real desde BD sin depender solo de localStorage.	Tipos extendidos manualmente con intersecciones; api-generated.d.ts no regenerado y backend incidente-kanban.repository.ts no retorna trazabilidadNotificacion.	ABIERTO	12/11/2026 11:35	(Pendiente)	Pendiente (Rechazado en Code Review)
BUG-H35-WEB-07	Validación defensiva de payload WS, conexión aislada del drawer y cobertura unitaria en MisionesTabla / useIncidentesKanban	Calidad / Robustez	Hook / Componente	Media	Revisión de useEncargadoKanbanSocket.ts, MisionesTabla.tsx, useIncidentesKanban.ts y archivos .test.*.	Payload malformado sin misionId / estado inválido; suites de MisionesTabla y useIncidentesKanban	Guardas de validación en runtime y cobertura automatizada en Vitest para tabla de misiones y resolución misión-incidente.	handleTrazabilidad no valida payload; MisionesModal.test.tsx y useIncidentesKanban.test.ts carecen de pruebas para tabla-trazabilidad-* y handleTrazabilidadActualizada.	ABIERTO	12/11/2026 11:35	(Pendiente)	Pendiente (Rechazado en Code Review)
BUG-H35-WEB-01	Eliminación de casteo inseguro y tipado de dominio en incidentesService.ts	Arquitectura / Tipos	Tipos / Contrato	Alta	Inspección de src/services/incidentesService.ts e IncidenteMisionesSection.tsx.	Definición de EstadoTrazabilidadNotificacion y mapa TRAZABILIDAD_CONFIG	Tipos estrictos sin any ni casteos inseguros a Record<string, unknown>.	En Re-Test: incidentesService.ts y trazabilidadConfig.ts tipan estrictamente los 4 estados y su configuración visual.	APROBADO	10/11/2026 15:30	10/11/2026 18:00	refactor(mando): tipado estricto de trazabilidad y mapeo de configuracion de badges
BUG-H35-WEB-02	Cobertura unitaria de badges semánticos, esquinas rectas (borderRadius: 0) y ausencia de emojis	Calidad / Vitest	Componente / UI	Media	Ejecución de vitest run src/components/mando/__tests__/IncidenteMisionesSection.test.tsx.	Misiones con estados PENDIENTE_ENVIO, ENVIADA, RECIBIDA, LEIDA	100% de aserciones aprobadas verificando texto, colores, bordes y ausencia de emojis.	Suite aprobada verificando los 4 badges, borderRadius: 0px y regex Unicode sin emojis.	APROBADO	10/11/2026 15:30	10/11/2026 18:00	test(mando): incorporar pruebas unitarias de trazabilidad, badges semanticos y eventos websocket
BUG-H35-WEB-03	Verificación de recepción y limpieza de evento notificacion:trazabilidad_actualizada en hooks y drawer	Calidad / WebSocket	Hook / Componente	Media	Ejecución de useEncargadoKanbanSocket.test.ts e IncidenteDetalleDrawer.test.tsx.	Simulación de emisión de evento WebSocket en socket mockeado	Invocación de callbacks correspondientes y limpieza con socket.off al desmontar.	Pruebas unitarias en hook y drawer aprueban verificando actualización y limpieza de listeners.	APROBADO	10/11/2026 15:30	10/11/2026 18:00	test(mando): incorporar pruebas unitarias de trazabilidad, badges semanticos y eventos websocket
TC-H35-WEB-01	Exportación de interfaz NotificacionTrazabilidadPayload en hook useEncargadoKanbanSocket.ts	Contrato / Tipos	Hook	Alta	Inspección de src/hooks/useEncargadoKanbanSocket.ts.	Definición TypeScript de payload WebSocket	La interfaz exporta notificacionId, misionId, patrullaId, estado, timestamps e intentos.	La interfaz se encuentra exportada y disponible sin errores en npx tsc --noEmit.	APROBADO	10/11/2026 15:30	12/11/2026 11:35	feat(monitoreo): reflejar trazabilidad y acuses de notificaciones en drawer de misiones (#35)
TC-H35-WEB-02	Registro de listener para notificacion:trazabilidad_actualizada en hook al montar	Tiempo Real	Hook	Alta	Montaje de useEncargadoKanbanSocket con socket inicializado.	Evento notificacion:trazabilidad_actualizada	socket.on('notificacion:trazabilidad_actualizada', expect.any(Function)) es invocado.	Listener registrado satisfactoriamente durante el efecto de conexión.	APROBADO	10/11/2026 15:30	12/11/2026 11:35	feat(monitoreo): reflejar trazabilidad y acuses de notificaciones en drawer de misiones (#35)
TC-H35-WEB-03	Invocación de callback onNotificacionTrazabilidadActualizada ante evento de socket	Reactividad	Hook	Alta	Hook montado con opción onNotificacionTrazabilidadActualizada.	Payload con { notificacionId: 'notif-987', misionId: 'mis-100', estado: 'RECIBIDA' }	Callback invocado con el payload exacto y ultimoEvento actualizado a "Trazabilidad misión: RECIBIDA".	El callback se ejecuta con los datos correctos y el estado interno se actualiza.	APROBADO	10/11/2026 15:30	12/11/2026 11:35	test(mando): incorporar pruebas unitarias de trazabilidad, badges semanticos y eventos websocket
TC-H35-WEB-04	Desuscripción de listener notificacion:trazabilidad_actualizada al desmontar hook	Resiliencia / Fugas	Hook	Media	Desmontaje de componente que utiliza useEncargadoKanbanSocket.	Invocación de unmount()	socket.off('notificacion:trazabilidad_actualizada', expect.any(Function)) es invocado.	Limpieza de listener verificada previniendo fugas de memoria y listeners duplicados.	APROBADO	10/11/2026 15:30	12/11/2026 11:35	test(mando): incorporar pruebas unitarias de trazabilidad, badges semanticos y eventos websocket
TC-H35-WEB-05	Suscripción de IncidenteDetalleDrawer al evento mientras el drawer permanezca abierto	Tiempo Real	Componente	Alta	IncidenteDetalleDrawer montado con incidenteId válido.	Props incidenteId="inc-100"	Registra listener de socket para notificacion:trazabilidad_actualizada.	El listener se enlaza al socket activo al abrir el drawer.	APROBADO	10/11/2026 15:30	12/11/2026 11:35	feat(monitoreo): reflejar trazabilidad y acuses de notificaciones en drawer de misiones (#35)
TC-H35-WEB-06	Desuscripción de IncidenteDetalleDrawer al cerrar o cambiar incidenteId	Resiliencia / Fugas	Componente	Media	Cierre del drawer o transición de incidenteId a null.	Desmontaje del drawer	Invocación de socket.off('notificacion:trazabilidad_actualizada', handleTrazabilidad).	El listener es removido correctamente del socket al desmontar o cambiar de incidente.	APROBADO	10/11/2026 15:30	12/11/2026 11:35	feat(monitoreo): reflejar trazabilidad y acuses de notificaciones en drawer de misiones (#35)
TC-H35-WEB-07	Actualización reactiva de detalle.misiones y banner resumen en Drawer ante evento de trazabilidad	Reactividad / UI	Componente	Crítica	Drawer abierto visualizando misión con ID coincidente con payload.misionId.	Payload con { misionId: 'm1', estado: 'RECIBIDA' }	Misión actualiza trazabilidadNotificacion: 'RECIBIDA' reflejando el badge y el banner superior sin recargar.	El estado local de misiones muta reactivamente y la interfaz actualiza el badge y el banner de inmediato.	APROBADO	10/11/2026 15:30	12/11/2026 11:35	feat(mando): visibilizar estado de lectura y trazabilidad en tarjetas kanban y drawer
TC-H35-WEB-08	Renderizado de badge semántico PENDIENTE_ENVIO ("Patrulla sin señal / offline")	UI / Semántica	Componente	Alta	Misión con trazabilidadNotificacion: 'PENDIENTE_ENVIO' en Drawer.	Props: mision.trazabilidadNotificacion = 'PENDIENTE_ENVIO'	Badge con texto "Patrulla sin señal / offline", fondo #ECEFF3, texto #3B3F45 y esquinas rectas.	El badge se renderiza con el texto exacto, fondo gris y texto neutral especificados.	APROBADO	10/11/2026 15:30	12/11/2026 11:35	test(mando): incorporar pruebas unitarias de trazabilidad, badges semanticos y eventos websocket
TC-H35-WEB-09	Renderizado de badge semántico ENVIADA ("Alerta emitida al móvil")	UI / Semántica	Componente	Alta	Misión con trazabilidadNotificacion: 'ENVIADA' en Drawer.	Props: mision.trazabilidadNotificacion = 'ENVIADA'	Badge con texto "Alerta emitida al móvil", fondo #FFF3E0, texto #E65100 y esquinas rectas.	El badge se renderiza con fondo ámbar suave y texto de advertencia institucional.	APROBADO	10/11/2026 15:30	12/11/2026 11:35	test(mando): incorporar pruebas unitarias de trazabilidad, badges semanticos y eventos websocket
TC-H35-WEB-10	Renderizado de badge semántico RECIBIDA ("Recibida en móvil de terreno")	UI / Semántica	Componente	Crítica	Misión con trazabilidadNotificacion: 'RECIBIDA' en Drawer (ACK técnico).	Props: mision.trazabilidadNotificacion = 'RECIBIDA'	Badge con texto "Recibida en móvil de terreno", fondo #E8F5E9, texto #2E7D32 y esquinas rectas.	El badge se renderiza con fondo verde suave y texto verde éxito institucional.	APROBADO	10/11/2026 15:30	12/11/2026 11:35	test(mando): incorporar pruebas unitarias de trazabilidad, badges semanticos y eventos websocket
TC-H35-WEB-11	Renderizado de badge semántico LEIDA ("Leída por operador en terreno")	UI / Semántica	Componente	Crítica	Misión con trazabilidadNotificacion: 'LEIDA' en Drawer (ACK operativo).	Props: mision.trazabilidadNotificacion = 'LEIDA'	Badge con texto "Leída por operador en terreno", fondo #E0F2F1, texto #14505A y esquinas rectas.	El badge se renderiza con fondo teal suave y texto teal oscuro institucional.	APROBADO	10/11/2026 15:30	12/11/2026 11:35	test(mando): incorporar pruebas unitarias de trazabilidad, badges semanticos y eventos websocket
TC-H35-WEB-12	Certificación de diseño plano (borderRadius: 0) y ausencia total de emojis en componentes	Guía de Estilo	Componente	Alta	Renderizado de sección de misiones y tarjetas Kanban con estados de trazabilidad.	Inspección de estilos CSS y regex Unicode /\p{Extended_Pictographic}/u	borderRadius: 0px, border: 1px solid currentColor y 0 emojis (solo iconos SVG de lucide-react).	Aserciones unitarias en IncidenteMisionesSection.test.tsx e IncidenteCard.test.tsx aprueban al 100%.	APROBADO	10/11/2026 15:30	12/11/2026 11:35	test(mando): incorporar pruebas unitarias de trazabilidad, badges semanticos y eventos websocket
TC-H35-WEB-13	Visualización directa de lectura/no lectura y aviso SIN ACUSE en tarjetas Kanban (IncidenteCard)	UI / Operación	Componente	Alta	Tarjeta en columna VERIFICANDO con o sin trazabilidadNotificacion.	Props trazabilidadNotificacion en 'PENDIENTE_ENVIO', 'RECIBIDA', 'LEIDA' y undefined	Renderizado apilado con NO LEÍDA, RECIBIDA (SIN LEER), LEÍDA o SIN ACUSE contenido en la tarjeta.	Las 4 pruebas de trazabilidad en IncidenteCard.test.tsx aprueban validando texto, diseño apilado y borderRadius: 0px.	APROBADO	12/11/2026 11:35	12/11/2026 11:35	test(mando): validar flexShrink 0 en cajas de trazabilidad de tarjetas
TC-H35-WEB-14	Renderizado de línea de tiempo horizontal conectada en IncidenteMisionesSection	UI / Trazabilidad	Componente	Media	Misión con estado PENDIENTE_ENVIO, ENVIADA, RECIBIDA o LEIDA.	timeline-trazabilidad-{misionId} con pasos 1, 2 y 3	Riel horizontal conectado de 3 pasos con atributos data-estado (actual, completado, pendiente) y nodos borderRadius: 0px.	Test parametrizado de línea de tiempo aprobado verificando progresión en los 4 estados y nodos cuadrados.	APROBADO	12/11/2026 11:35	12/11/2026 11:35	test(mando): validar linea de tiempo y diseno apilado de trazabilidad
TC-H35-WEB-15	Prevención de recorte vertical y desborde de textos extensos en columnas Kanban y detalle	Maquetación / CSS	Componente / CSS	Alta	Tarjeta con dirección extensa (120 chars sin espacios) en columna con scroll vertical.	direccion = 'a'.repeat(120) + inspección CSS flex-shrink: 0 y overflow-wrap: anywhere	Las cajas de trazabilidad mantienen flexShrink: '0' y overflow: 'hidden' sin recortar el contenido ni desbordar la tarjeta.	Verificado en IncidenteCard.test.tsx y en hojas CSS mando.module.css / mision-detalle.module.css.	APROBADO	12/11/2026 11:35	12/11/2026 11:35	fix(mando): evitar recorte vertical de tarjetas kanban y contenedores con flex-shrink 0
TC-H35-WEB-16	Persistencia en localStorage (sgrai_trazabilidad_notificaciones_v2) entre reaperturas del drawer	Persistencia Local	Store	Alta	Llamada a setTrazabilidadEstado y vincularMisionIncidente seguida de lectura por misión e incidente.	{ misionId: 'mision-001', estado: 'LEIDA', incidenteId: 'inc-001' }	El store retorna el estado persistido y notifica a los suscriptores activos.	Las 3 pruebas unitarias de trazabilidadStore.test.ts aprueban al 100%.	APROBADO	12/11/2026 11:35	12/11/2026 11:35	fix(mando): persistir cache local de trazabilidad entre reaperturas del drawer
TC-H35-WEB-17	Entrega de manual de usuario institucional conforme a GEMINI.md	Documentación	Repositorio	Alta	Inspección de docs/manuals/H35-monitoreo-notificacion-mision-patrulla.md.	Estructura de roles, objetivo, pasos, errores, relación con API/PWA y cero emojis	Manual completo siguiendo convención H<numero>-<slug>.md dentro del mismo PR.	Archivo presente (89 líneas) con todos los apartados requeridos y sin emojis.	APROBADO	12/11/2026 11:35	12/11/2026 11:35	docs(manuals): agregar manual de usuario para monitoreo de trazabilidad (H35)
TC-H35-WEB-18	Reconstrucción del último estado de notificación desde BD tras recarga en navegador limpio	Integración / Persistencia	E2E / Contrato	Alta	Sesión limpia (localStorage vacío) consultando GET /api/incidentes y GET /api/incidentes/{id}.	Respuestas JSON de listado y detalle de incidente con misión despachada previamente	El tablero y el drawer hidratan desde servidor el último estado de la notificación (PENDIENTE_ENVIO..LEIDA).	GET /api/incidentes y GET /api/incidentes/{id} en sgrai-api no retornan trazabilidadNotificacion; la UI queda en SIN ACUSE.	FALLIDO	12/11/2026 11:35	(Pendiente)	Pendiente (Rechazado en Code Review)
````

---

## 5. Guía de Ejecución Paso a Paso y Evidencias Técnicas Replicables

### 5.1. Ejecución Específica de las Suites de Monitoreo HU-35
```bash
npx vitest run src/components/mando/__tests__/IncidenteMisionesSection.test.tsx \
               src/components/mando/__tests__/IncidenteDetalleDrawer.test.tsx \
               src/components/mando/__tests__/IncidenteCard.test.tsx \
               src/hooks/__tests__/useEncargadoKanbanSocket.test.ts \
               src/lib/socket/__tests__/trazabilidadStore.test.ts
```
*Resultado observado (`12/11/2026 11:33`):*
```text
 ✓ src/lib/socket/__tests__/trazabilidadStore.test.ts (3 tests) 5ms
 ✓ src/hooks/__tests__/useEncargadoKanbanSocket.test.ts (5 tests) 35ms
 ✓ src/components/mando/__tests__/IncidenteCard.test.tsx (9 tests) 235ms
 ✓ src/components/mando/__tests__/IncidenteMisionesSection.test.tsx (12 tests) 309ms
 ✓ src/components/mando/__tests__/IncidenteDetalleDrawer.test.tsx (7 tests) 430ms

 Test Files  5 passed (5)
      Tests  36 passed (36)
```

### 5.2. Ejecución Filtrada por Palabra Clave (`-t "trazabilidad"`)
```bash
npm test -- -t "trazabilidad"
```
*Resultado observado (`12/11/2026 11:34`):*
```text
 Test Files  5 passed | 119 skipped (124)
      Tests  13 passed | 791 skipped (804)
```

### 5.3. Ejecución de la Suite Completa, Tipos, ESLint y Build de Producción
```bash
npx tsc --noEmit
npm test
npm run lint
npx next build --webpack
```
*Resultados observados sobre el estado de código evaluado (`af14057`, revalidados el `12/11/2026 11:38` para tipos/tests/lint; build verificado previamente sobre `af14057`):*
```text
npx tsc --noEmit      -> 0 errores
npm test              -> Test Files  124 passed (124) | Tests  804 passed (804)
npm run lint          -> 0 errors (11 warnings previos en módulos ajenos a HU-35)
npx next build --webpack -> Compiled successfully | 47/47 rutas generadas
```

### 5.4. Verificación de Contrato HTTP/cURL frente a `sgrai-api`
Al intentar sondear el servicio local de backend para validar en vivo las respuestas de `POST /api/misiones` y `GET /api/incidentes/{id}`:
```bash
curl -s -o /dev/null -w "http_code:%{http_code}\n" http://localhost:3001/api/health || echo "api_offline"
```
*Resultado observado (`12/11/2026 11:34`):*
```text
http_code:000
api_offline
```
Para replicar la verificación de contrato en vivo una vez levantado `sgrai-api` con un token o usuario Encargado (`x-user-id`) y una patrulla verificadora en estado `DISPONIBLE`:

1. **Despacho de patrulla (`POST /api/misiones`) verificando inclusión de `data.notificacion`:**
   ```bash
   curl -s -X POST "http://localhost:3001/api/misiones" \
     -H "Content-Type: application/json" \
     -H "x-user-id: 00000000-0000-4000-8000-000000000003" \
     -d '{
       "incidenteId": "<UUID_INCIDENTE_REPORTADO>",
       "patrullaId": "<UUID_PATRULLA_DISPONIBLE>",
       "tipoMision": "VERIFICACION"
     }'
   ```
   *(Contrato observado en `sgrai-api/src/modules/misiones/mision.service.ts`: retorna `data.notificacion` con `estado` en `'PENDIENTE_ENVIO'` o `'ENVIADA'` según conectividad de la sala `patrulla:{id}`).*

2. **Consulta de detalle de incidente (`GET /api/incidentes/{id}`) para validar `TC-H35-WEB-18`:**
   ```bash
   curl -s -X GET "http://localhost:3001/api/incidentes/<UUID_INCIDENTE>" \
     -H "x-user-id: 00000000-0000-4000-8000-000000000003"
   ```
   *(Brecha detectada en `BUG-H35-WEB-06`: actualmente `sgrai-api/src/modules/incidentes/incidente-kanban.repository.ts` no proyecta `trazabilidadNotificacion` en el arreglo `misiones`).*

3. **Emisión de acuse de lectura (`PATCH /api/terreno/notificaciones/{id}/estado`):**
   ```bash
   curl -s -X PATCH "http://localhost:3001/api/terreno/notificaciones/<UUID_NOTIFICACION>/estado" \
     -H "Content-Type: application/json" \
     -H "x-user-id: <UUID_LIDER_PATRULLA>" \
     -d '{ "estado": "LEIDA" }'
   ```

---

## 6. Matriz de Trazabilidad de Criterios de Aceptación (HU-35 — Alcance `sgrai-web`)

| Criterio de Aceptación | Caso(s) de Prueba Asociados | Resultado en QA |
| :--- | :--- | :--- |
| **CA-1 (Monitoreo Web):** Visualización reactiva en tiempo real del ciclo de entrega y lectura (`PENDIENTE_ENVIO`, `ENVIADA`, `RECIBIDA`, `LEIDA`) tanto en el drawer como en las tarjetas Kanban. | `TC-H35-WEB-07`, `TC-H35-WEB-13`, `TC-H35-WEB-14`, `BUG-H35-WEB-04` | **RECHAZADO** (`BUG-H35-WEB-04`: contaminación cruzada entre incidentes cuando el drawer está abierto) |
| **CA-2 (Idempotencia / No Retroceso):** Garantizar que las confirmaciones de estado en la Central no retrocedan ante eventos repetidos o fuera de orden (`LEIDA` no debe degradarse a `RECIBIDA`/`ENVIADA`). | `BUG-H35-WEB-05` | **RECHAZADO** (`BUG-H35-WEB-05`: falta guarda monotónica en `trazabilidadStore.ts` y drawer) |
| **CA-3 (Contrato y Persistencia):** Contratos sincronizados automáticamente vía OpenAPI (`api-generated.d.ts`) y reconstrucción de estados tras recargar en sesión limpia. | `TC-H35-WEB-16`, `TC-H35-WEB-18`, `BUG-H35-WEB-06` | **RECHAZADO** (`BUG-H35-WEB-06` y `TC-H35-WEB-18`) |
| **CA-4 (Guía Visual y Documentación):** Diseño plano institucional (`borderRadius: 0`), uso exclusivo de `lucide-react` sin emojis, contención sin desbordes y manual en `docs/manuals/`. | `TC-H35-WEB-12`, `TC-H35-WEB-14`, `TC-H35-WEB-15`, `TC-H35-WEB-17` | **APROBADO** |

> *Nota de alcance entre repositorios:* los criterios relativos a suscripción de `patrulla:{id}`, Web Notification API, audio/vibración, Service Worker, IndexedDB y endpoint RBAC `misiones:terreno:verificar` corresponden a `sgrai-pwa` y `sgrai-api` y son auditados en sus respectivos repositorios.

---

## 7. Veredicto de Auditoría QA

- **Estado Actual:** `RECHAZADO — NO APTO PARA MERGE A DEVELOP (4 DEFECTOS ABIERTOS)`.
- **Bloqueantes obligatorios para aprobación en próximo Re-Test:**
  1. Resolver la contaminación cruzada de caché en `IncidenteDetalleDrawer.tsx` (`BUG-H35-WEB-04`).
  2. Implementar validación monotónica e idempotente de transiciones de estado en `trazabilidadStore.ts` y `IncidenteDetalleDrawer.tsx` (`BUG-H35-WEB-05`).
  3. Regenerar `src/types/api-generated.d.ts` y resolver la persistencia de trazabilidad desde `GET /api/incidentes` / `GET /api/incidentes/{id}` en coordinación con `sgrai-api` (`BUG-H35-WEB-06`).
  4. Agregar validación de payload WebSocket en `useEncargadoKanbanSocket.ts` y pruebas unitarias de regresión para `MisionesTabla`, `useIncidentesKanban` y los casos de los defectos abiertos (`BUG-H35-WEB-07`).
