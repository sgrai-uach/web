# Plan y Reporte de Pruebas QA — HU-35: Monitoreo de Notificación y Trazabilidad de ACKs en Centro de Mando (Frontend / Web)

**Proyecto:** SGRAI — Sistema de Gestión de Recursos para Atención de Incidentes (DGRD Municipalidad de Valdivia)  
**Repositorio:** `sgrai-web`  
**Rama Evaluada:** `feature/h35-notificacion-mision-patrulla-web`  
**Historia de Usuario:** HU-35 — *Notificación de Misión a Patrulla y Monitoreo en Tiempo Real de Trazabilidad de ACKs (Extensión Web / Centro de Mando)*  
**Estado de Certificación QA:** `APROBADO EN RE-TEST — 4 DEFECTOS SUBSANADOS (APTO PARA MERGE A DEVELOP)`  
**Fecha de Auditoría Inicial:** `10/11/2026 15:30`  
**Fecha de Primer Re-Test:** `10/11/2026 18:00`  
**Fecha de Auditoría de Ampliación (Caché, Kanban y Línea de Tiempo):** `12/11/2026 11:35`  
**Fecha de Re-Test Final de Cierre (`BUG-H35-WEB-04` a `07`):** `12/11/2026 12:37`

---

## 1. Resumen Ejecutivo de Auditoría Técnica

Durante la primera fase de QA (`10/11/2026`), se auditaron los cambios iniciales de HU-35 orientados al hook `useEncargadoKanbanSocket` y al renderizado de badges en `IncidenteMisionesSection`, cerrando 3 observaciones iniciales (`BUG-H35-WEB-01` a `BUG-H35-WEB-03`).

Posteriormente, la rama `feature/h35-notificacion-mision-patrulla-web` incorporó nuevas capacidades: caché reactivo persistido en `localStorage` (`trazabilidadStore.ts`), visualización directa en tarjetas Kanban (`IncidenteCard.tsx`), banner resumen en `IncidenteDetalleDrawer.tsx`, línea de tiempo horizontal de 3 etapas en `IncidenteMisionesSection.tsx`, etiqueta en `MisionesTabla.tsx`, corrección de hidratación en `IncidentesKpiCards.tsx` y manual de usuario (`docs/manuals/H35-monitoreo-notificacion-mision-patrulla.md`).

La auditoría de seguimiento del `12/11/2026 11:35` detectó **4 defectos abiertos** (`BUG-H35-WEB-04` a `BUG-H35-WEB-07`). Tras implementar las remediaciones en `sgrai-web` (`5110221`, `9448a43`, `ce0fdb8`) y coordinar en `sgrai-api` (`feature/h35-notificacion-mision-patrulla-pwa`, commits `2e72aa8`, `90fd047`, `5b0c9a7`) la proyección persistente de `trazabilidadNotificacion` más la regeneración OpenAPI de `src/types/api-generated.d.ts`, el **Re-Test Final (`12/11/2026 12:37`)** confirma el cierre íntegro de los 4 defectos y la aprobación de los 25 ítems de la matriz.

| Métrica de Calidad | Ciclo 2 Seguimiento (`12/11/2026 11:35`) | Re-Test Final (`12/11/2026 12:37`) | Estado |
| :--- | :--- | :--- | :--- |
| **Total de Ítems en Matriz** | 25 (`7` Bugs + `18` TCs) | 25 (`7` Bugs + `18` TCs) | **25 Evaluados** |
| **Ítems Aprobados** | 20 / 25 (`80%`) | 25 / 25 (`100%`) | **100% Aprobado** |
| **Ítems Fallidos / Abiertos** | 5 (`4` Bugs + `1` TC Fallido) | 0 | **Sin Bloqueantes** |
| **Defectos Abiertos (`ABIERTO`)** | 4 (`1` Crítico, `2` Altos, `1` Medio) | 0 | **Todos Subsanados** |
| **Suite Unitaria Focalizada HU-35 (Vitest)** | 36 / 36 (`5` archivos) | 47 / 47 (`7` archivos) | **100% Passing** |
| **Suite Global Vitest** | 804 / 804 (`124` archivos) | 812 / 812 (`124` archivos) | **100% Passing** |
| **Compilación TypeScript (`npx tsc --noEmit`)** | 0 errores | 0 errores | **Cumple** |
| **ESLint (`npm run lint`)** | 0 errores (11 warnings previos) | 0 errores (11 warnings previos) | **Cumple** |
| **Build Producción (`npx next build --webpack`)** | 47 / 47 rutas OK | 47 / 47 rutas OK | **Cumple** |

---

## 2. Registro Técnico de Defectos

### 2.1. Defectos de Auditoría de Seguimiento Subsanados en Re-Test (`12/11/2026 12:37`)

#### `BUG-H35-WEB-04` (Severidad: Crítica — **APROBADO / CORREGIDO**) — Contaminación cruzada de caché de trazabilidad entre incidentes distintos en `IncidenteDetalleDrawer.tsx`
- **Archivos verificados:**
  - `src/components/mando/IncidenteDetalleDrawer.tsx`
  - `src/lib/socket/trazabilidadStore.ts`
- **Resolución verificada (`5110221`, `9448a43`):**
  `IncidenteDetalleDrawer.tsx` sincroniza un `Set<string>` con los `id` de las misiones pertenecientes al incidente abierto; `handleTrazabilidad` ignora cualquier evento `notificacion:trazabilidad_actualizada` cuya `misionId` no pertenezca al incidente en pantalla, evitando registrar vínculos cruzados o contaminar `incidenteEstadoCache`. Validado mediante prueba de regresión en `IncidenteDetalleDrawer.test.tsx`.

#### `BUG-H35-WEB-05` (Severidad: Alta — **APROBADO / CORREGIDO**) — Ausencia de protección monotónica / idempotente ante eventos fuera de orden en `trazabilidadStore.ts` e `IncidenteDetalleDrawer.tsx`
- **Archivos verificados:**
  - `src/lib/socket/trazabilidadStore.ts`
  - `src/components/mando/IncidenteDetalleDrawer.tsx`
- **Resolución verificada (`5110221`, `9448a43`):**
  Se aplicó validación de estado (`esEstadoTrazabilidadValido`) y comparación de jerarquía estricta (`PENDIENTE_ENVIO < ENVIADA < RECIBIDA < LEIDA`) mediante `debeActualizarEstadoTrazabilidad` y `seleccionarEstadoTrazabilidadMayor`, garantizando que ni el store local ni el drawer degraden un estado `LEIDA` o `RECIBIDA` ante eventos tardíos o duplicados.

#### `BUG-H35-WEB-06` (Severidad: Alta — **APROBADO / CORREGIDO**) — Divergencia con tipos autogenerados (`api-generated.d.ts`) y pérdida de trazabilidad persistente desde servidor tras recarga (`F5`) en sesión limpia
- **Archivos verificados:**
  - `sgrai-web`: `src/types/api-generated.d.ts`, `src/services/incidentesService.ts`, `src/types/misiones.ts`
  - `sgrai-api` (`feature/h35-notificacion-mision-patrulla-pwa`): `src/modules/incidentes/incidente-kanban.*`, `src/modules/misiones/mision-listado.*`, `src/modules/misiones/mision.*`, `src/lib/openapi/index.ts`
- **Resolución verificada (`2e72aa8`, `90fd047`, `5b0c9a7` en `sgrai-api`; `ce0fdb8` en `sgrai-web`):**
  1. `sgrai-api` proyecta `trazabilidadNotificacion` desde `notificaciones_mision` en `GET /api/incidentes`, `GET /api/incidentes/{id}`, `GET /api/misiones` y `GET /api/misiones/{id}`, además de completar el registro OpenAPI en `src/lib/openapi/index.ts`.
  2. Se regeneró `src/types/api-generated.d.ts` mediante `npm run generate-api-types` contra `http://localhost:3001/openapi.json` y se eliminaron las extensiones manuales `& { ... }` en `incidentesService.ts` y `misiones.ts`.

#### `BUG-H35-WEB-07` (Severidad: Media — **APROBADO / CORREGIDO**) — Falta de validación defensiva de payload, suscripción sin verificación de conexión en drawer y brecha de cobertura unitaria en `MisionesTabla` / `useIncidentesKanban`
- **Archivos verificados:**
  - `src/hooks/useEncargadoKanbanSocket.ts`
  - `src/components/mando/IncidenteDetalleDrawer.tsx`
  - `src/components/mando/misiones/__tests__/MisionesModal.test.tsx`
  - `src/hooks/__tests__/useIncidentesKanban.test.ts`
  - `src/lib/socket/__tests__/trazabilidadStore.test.ts`
- **Resolución verificada (`5110221`, `9448a43`):**
  Se agregaron guardas defensivas para payloads vacíos o estados inválidos en `useEncargadoKanbanSocket.ts`, garantía de conexión y manejo en `IncidenteDetalleDrawer.tsx`, y pruebas unitarias dedicadas para `tabla-trazabilidad-*` en `MisionesModal.test.tsx`, `handleTrazabilidadActualizada` en `useIncidentesKanban.test.ts`, aislamiento de incidente en `IncidenteDetalleDrawer.test.tsx` y monotonicidad en `trazabilidadStore.test.ts`.

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
| **BUG-H35-WEB-04** | Aislamiento de eventos de trazabilidad por incidente en `IncidenteDetalleDrawer.tsx` | Integridad de Caché / WebSocket | Componente / Store | Crítica | Drawer abierto en `incidenteId="inc-A"` mientras el socket en `sala:encargados` recibe evento de `misionId="mis-B"` perteneciente a `inc-B`. | Payload WS: `{ notificacionId: 'n-b', misionId: 'mis-B', patrullaId: 'pat-2', estado: 'LEIDA' }` | El drawer debe ignorar eventos cuya `misionId` no pertenezca a `detalle.misiones` sin asociar `mis-B` a `inc-A` ni mutar la tarjeta Kanban de `inc-A`. | En Re-Test: el drawer filtra por el `Set` de misiones del incidente abierto e ignora eventos ajenos sin mutar caché ni estado local. | CORREGIDO | 12/11/2026 11:35 | 12/11/2026 12:37 | fix(mando): aislar eventos de trazabilidad por incidente y garantizar progresion monotonica (`5110221`, `9448a43`) |
| **BUG-H35-WEB-05** | Protección monotónica e idempotente ante eventos de trazabilidad fuera de orden en `trazabilidadStore.ts` | Lógica de Estados / Resiliencia | Store / Componente | Alta | Misión `mis-100` ya confirmada en estado `LEIDA` (`paso: 3`) en caché y drawer. | Payload tardío WS: `{ misionId: 'mis-100', estado: 'RECIBIDA' }` o `'ENVIADA'` | El estado debe permanecer inmutable en `LEIDA` sin retroceder ni sobreescribir `incidenteEstadoCache`. | En Re-Test: `debeActualizarEstadoTrazabilidad` y `seleccionarEstadoTrazabilidadMayor` impiden cualquier regresión en store y drawer. | CORREGIDO | 12/11/2026 11:35 | 12/11/2026 12:37 | fix(mando): aislar eventos de trazabilidad por incidente y garantizar progresion monotonica (`5110221`, `9448a43`) |
| **BUG-H35-WEB-06** | Sincronización de contrato OpenAPI (`api-generated.d.ts`) y persistencia desde API tras recarga en sesión limpia | Contrato / Persistencia | Integración / Tipos | Alta | Navegador sin datos previos en `localStorage` consultando `GET /api/incidentes` y `GET /api/incidentes/{id}`. | `src/types/api-generated.d.ts`, `src/services/incidentesService.ts`, `src/types/misiones.ts` | Contratos generados automáticamente vía OpenAPI (`npm run generate-api-types`) e hidratación del estado real desde BD sin depender solo de `localStorage`. | En Re-Test: `sgrai-api` proyecta `trazabilidadNotificacion` en listados/detalles (`2e72aa8`, `90fd047`, `5b0c9a7`) y `api-generated.d.ts` fue regenerado sin extensiones manuales (`ce0fdb8`). | CORREGIDO | 12/11/2026 11:35 | 12/11/2026 12:37 | fix(types): regenerar contrato OpenAPI con trazabilidadNotificacion y eliminar extensiones manuales (`ce0fdb8`) |
| **BUG-H35-WEB-07** | Validación defensiva de payload WS, conexión aislada del drawer y cobertura unitaria en `MisionesTabla` / `useIncidentesKanban` | Calidad / Robustez | Hook / Componente | Media | Revisión de `useEncargadoKanbanSocket.ts`, `MisionesTabla.tsx`, `useIncidentesKanban.ts` y archivos `.test.*`. | Payload malformado sin `misionId` / `estado` inválido; suites de `MisionesTabla` y `useIncidentesKanban` | Guardas de validación en runtime y cobertura automatizada en Vitest para tabla de misiones y resolución misión-incidente. | En Re-Test: validación defensiva en `useEncargadoKanbanSocket.ts` / drawer y pruebas agregadas en `MisionesModal.test.tsx`, `useIncidentesKanban.test.ts` y `trazabilidadStore.test.ts`. | CORREGIDO | 12/11/2026 11:35 | 12/11/2026 12:37 | fix(mando): aislar eventos de trazabilidad por incidente y garantizar progresion monotonica (`5110221`, `9448a43`) |
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
| **TC-H35-WEB-18** | Reconstrucción del último estado de notificación desde BD tras recarga en navegador limpio | Integración / Persistencia | E2E / Contrato | Alta | Sesión limpia (`localStorage` vacío) consultando `GET /api/incidentes` y `GET /api/incidentes/{id}`. | Respuestas JSON de listado y detalle de incidente con misión despachada previamente | El tablero y el drawer hidratan desde servidor el último estado de la notificación (`PENDIENTE_ENVIO`..`LEIDA`). | En Re-Test: `sgrai-api` proyecta `trazabilidadNotificacion` desde `notificaciones_mision` (`2e72aa8`, `5b0c9a7`) y `KanbanColumn` / `IncidenteDetalleDrawer` / `MisionesTabla` lo hidratan desde el contrato regenerado (`ce0fdb8`). | APROBADO | 12/11/2026 11:35 | 12/11/2026 12:37 | fix(types): regenerar contrato OpenAPI con trazabilidadNotificacion y eliminar extensiones manuales (`ce0fdb8`) |

---

## 4. Bloque TSV

````tsv
ID Caso	Título del Caso de Prueba	Tipo de Prueba	Nivel	Prioridad	Precondición	Datos de Prueba (Payload / Headers / Query)	Resultado Esperado	Resultado Obtenido	Estado	Fecha / Hora Ejecución	Fecha / Hora Re-Test	Solución / Commit
BUG-H35-WEB-04	Aislamiento de eventos de trazabilidad por incidente en IncidenteDetalleDrawer.tsx	Integridad de Caché / WebSocket	Componente / Store	Crítica	Drawer abierto en incidenteId="inc-A" mientras el socket en sala:encargados recibe evento de misionId="mis-B" perteneciente a inc-B.	Payload WS: { notificacionId: 'n-b', misionId: 'mis-B', patrullaId: 'pat-2', estado: 'LEIDA' }	El drawer debe ignorar eventos cuya misionId no pertenezca a detalle.misiones sin asociar mis-B a inc-A ni mutar la tarjeta Kanban de inc-A.	En Re-Test: el drawer filtra por el Set de misiones del incidente abierto e ignora eventos ajenos sin mutar cache ni estado local.	CORREGIDO	12/11/2026 11:35	12/11/2026 12:37	fix(mando): aislar eventos de trazabilidad por incidente y garantizar progresion monotonica (5110221, 9448a43)
BUG-H35-WEB-05	Protección monotónica e idempotente ante eventos de trazabilidad fuera de orden en trazabilidadStore.ts	Lógica de Estados / Resiliencia	Store / Componente	Alta	Misión mis-100 ya confirmada en estado LEIDA (paso: 3) en caché y drawer.	Payload tardío WS: { misionId: 'mis-100', estado: 'RECIBIDA' } o 'ENVIADA'	El estado debe permanecer inmutable en LEIDA sin retroceder ni sobreescribir incidenteEstadoCache.	En Re-Test: debeActualizarEstadoTrazabilidad y seleccionarEstadoTrazabilidadMayor impiden cualquier regresion en store y drawer.	CORREGIDO	12/11/2026 11:35	12/11/2026 12:37	fix(mando): aislar eventos de trazabilidad por incidente y garantizar progresion monotonica (5110221, 9448a43)
BUG-H35-WEB-06	Sincronización de contrato OpenAPI (api-generated.d.ts) y persistencia desde API tras recarga en sesión limpia	Contrato / Persistencia	Integración / Tipos	Alta	Navegador sin datos previos en localStorage consultando GET /api/incidentes y GET /api/incidentes/{id}.	src/types/api-generated.d.ts, src/services/incidentesService.ts, src/types/misiones.ts	Contratos generados automáticamente vía OpenAPI (npm run generate-api-types) e hidratación del estado real desde BD sin depender solo de localStorage.	En Re-Test: sgrai-api proyecta trazabilidadNotificacion en listados/detalles (2e72aa8, 90fd047, 5b0c9a7) y api-generated.d.ts fue regenerado sin extensiones manuales (ce0fdb8).	CORREGIDO	12/11/2026 11:35	12/11/2026 12:37	fix(types): regenerar contrato OpenAPI con trazabilidadNotificacion y eliminar extensiones manuales (ce0fdb8)
BUG-H35-WEB-07	Validación defensiva de payload WS, conexión aislada del drawer y cobertura unitaria en MisionesTabla / useIncidentesKanban	Calidad / Robustez	Hook / Componente	Media	Revisión de useEncargadoKanbanSocket.ts, MisionesTabla.tsx, useIncidentesKanban.ts y archivos .test.*.	Payload malformado sin misionId / estado inválido; suites de MisionesTabla y useIncidentesKanban	Guardas de validación en runtime y cobertura automatizada en Vitest para tabla de misiones y resolución misión-incidente.	En Re-Test: validacion defensiva en useEncargadoKanbanSocket.ts / drawer y pruebas agregadas en MisionesModal.test.tsx, useIncidentesKanban.test.ts y trazabilidadStore.test.ts.	CORREGIDO	12/11/2026 11:35	12/11/2026 12:37	fix(mando): aislar eventos de trazabilidad por incidente y garantizar progresion monotonica (5110221, 9448a43)
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
TC-H35-WEB-18	Reconstrucción del último estado de notificación desde BD tras recarga en navegador limpio	Integración / Persistencia	E2E / Contrato	Alta	Sesión limpia (localStorage vacío) consultando GET /api/incidentes y GET /api/incidentes/{id}.	Respuestas JSON de listado y detalle de incidente con misión despachada previamente	El tablero y el drawer hidratan desde servidor el último estado de la notificación (PENDIENTE_ENVIO..LEIDA).	En Re-Test: sgrai-api proyecta trazabilidadNotificacion desde notificaciones_mision (2e72aa8, 5b0c9a7) y KanbanColumn / IncidenteDetalleDrawer / MisionesTabla lo hidratan desde el contrato regenerado (ce0fdb8).	APROBADO	12/11/2026 11:35	12/11/2026 12:37	fix(types): regenerar contrato OpenAPI con trazabilidadNotificacion y eliminar extensiones manuales (ce0fdb8)
````

---

## 5. Guía de Ejecución Paso a Paso y Evidencias Técnicas Replicables

### 5.1. Ejecución Específica de las Suites de Monitoreo HU-35
```bash
npx vitest run src/components/mando/__tests__/IncidenteMisionesSection.test.tsx \
               src/components/mando/__tests__/IncidenteDetalleDrawer.test.tsx \
               src/components/mando/__tests__/IncidenteCard.test.tsx \
               src/components/mando/misiones/__tests__/MisionesModal.test.tsx \
               src/hooks/__tests__/useEncargadoKanbanSocket.test.ts \
               src/hooks/__tests__/useIncidentesKanban.test.ts \
               src/lib/socket/__tests__/trazabilidadStore.test.ts
```
*Resultado observado en Re-Test (`12/11/2026 12:37`):*
```text
 ✓ src/lib/socket/__tests__/trazabilidadStore.test.ts (5 tests) 7ms
 ✓ src/hooks/__tests__/useEncargadoKanbanSocket.test.ts (6 tests) 44ms
 ✓ src/hooks/__tests__/useIncidentesKanban.test.ts (2 tests) 131ms
 ✓ src/components/mando/__tests__/IncidenteCard.test.tsx (9 tests) 282ms
 ✓ src/components/mando/__tests__/IncidenteMisionesSection.test.tsx (12 tests) 361ms
 ✓ src/components/mando/misiones/__tests__/MisionesModal.test.tsx (3 tests) 325ms
 ✓ src/components/mando/__tests__/IncidenteDetalleDrawer.test.tsx (10 tests) 486ms

 Test Files  7 passed (7)
      Tests  47 passed (47)
```

### 5.2. Ejecución de la Suite Completa, Tipos, ESLint y Build de Producción
```bash
npx tsc --noEmit
npm test
npm run lint
npx next build --webpack
```
*Resultados observados en Re-Test tras el último cambio de código (`ce0fdb8` en `sgrai-web`, `5b0c9a7` en `sgrai-api`):*
```text
npx tsc --noEmit         -> 0 errores
npm test                 -> Test Files  124 passed (124) | Tests  812 passed (812)
npm run lint             -> 0 errors (11 warnings previos en módulos ajenos a HU-35)
npx next build --webpack -> Compiled successfully | 47/47 rutas generadas
```

### 5.3. Sincronización OpenAPI y Verificación de Contrato frente a `sgrai-api`
Durante el Re-Test se ejecutó `npm run generate-api-types` contra `http://localhost:3001/openapi.json`, regenerando `src/types/api-generated.d.ts` con `trazabilidadNotificacion` en `IncidenteResumen`, `MisionDetalle`, `MisionItem` y `MisionDetalleCompleto`, además de `notificacion` en `POST /api/misiones`.

Para replicar la verificación HTTP de contrato en vivo frente a `sgrai-api` con un usuario Encargado (`x-user-id`) y una patrulla verificadora en estado `DISPONIBLE`:

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

2. **Consulta de detalle de incidente (`GET /api/incidentes/{id}`) para validar `TC-H35-WEB-18`:**
   ```bash
   curl -s -X GET "http://localhost:3001/api/incidentes/<UUID_INCIDENTE>" \
     -H "x-user-id: 00000000-0000-4000-8000-000000000003"
   ```
   *(Validado mediante pruebas unitarias de proyección en `sgrai-api`: `incidente-kanban.service.test.ts` y `mision-listado.test.ts`).*

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
| **CA-1 (Monitoreo Web):** Visualización reactiva en tiempo real del ciclo de entrega y lectura (`PENDIENTE_ENVIO`, `ENVIADA`, `RECIBIDA`, `LEIDA`) tanto en el drawer como en las tarjetas Kanban. | `TC-H35-WEB-07`, `TC-H35-WEB-13`, `TC-H35-WEB-14`, `BUG-H35-WEB-04` | **APROBADO** (`BUG-H35-WEB-04` cerrado en `5110221` / `9448a43`) |
| **CA-2 (Idempotencia / No Retroceso):** Garantizar que las confirmaciones de estado en la Central no retrocedan ante eventos repetidos o fuera de orden (`LEIDA` no debe degradarse a `RECIBIDA`/`ENVIADA`). | `BUG-H35-WEB-05`, `BUG-H35-WEB-07` | **APROBADO** (`BUG-H35-WEB-05` y `BUG-H35-WEB-07` cerrados en `5110221` / `9448a43`) |
| **CA-3 (Contrato y Persistencia):** Contratos sincronizados automáticamente vía OpenAPI (`api-generated.d.ts`) y reconstrucción de estados tras recargar en sesión limpia. | `TC-H35-WEB-16`, `TC-H35-WEB-18`, `BUG-H35-WEB-06` | **APROBADO** (`BUG-H35-WEB-06` y `TC-H35-WEB-18` cerrados entre `sgrai-api` y `sgrai-web`) |
| **CA-4 (Guía Visual y Documentación):** Diseño plano institucional (`borderRadius: 0`), uso exclusivo de `lucide-react` sin emojis, contención sin desbordes y manual en `docs/manuals/`. | `TC-H35-WEB-12`, `TC-H35-WEB-14`, `TC-H35-WEB-15`, `TC-H35-WEB-17` | **APROBADO** |

> *Nota de alcance entre repositorios:* los criterios relativos a suscripción de `patrulla:{id}`, Web Notification API, audio/vibración, Service Worker, IndexedDB y endpoint RBAC `misiones:terreno:verificar` corresponden a `sgrai-pwa` y `sgrai-api` y son auditados en sus respectivos repositorios.

---

## 7. Veredicto de Auditoría QA

- **Estado Actual:** `APROBADO EN RE-TEST — APTO PARA MERGE A DEVELOP`.
- **Resumen de Cierre:**
  1. Aislamiento estricto por incidente en `IncidenteDetalleDrawer.tsx` (`BUG-H35-WEB-04`, commit `5110221`).
  2. Guardas monotónicas e idempotentes en `trazabilidadStore.ts` y `IncidenteDetalleDrawer.tsx` (`BUG-H35-WEB-05`, commit `5110221`).
  3. Proyección de `trazabilidadNotificacion` y registro OpenAPI en `sgrai-api` (`2e72aa8`, `90fd047`, `5b0c9a7`) con regeneración de `src/types/api-generated.d.ts` sin extensiones manuales (`BUG-H35-WEB-06`, commit `ce0fdb8`).
  4. Validación defensiva de payload WebSocket en `useEncargadoKanbanSocket.ts` y cobertura de regresión completada (`BUG-H35-WEB-07`, commits `5110221` y `9448a43`).
