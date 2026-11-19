# Informe y Matriz de Casos de Prueba (QA): HU-60 — Vincular y Desvincular Entidades a Evento ATP (Frontend Web)

> **Documento Oficial de Aseguramiento de Calidad (QA) — Frontend Web**  
> **Proyecto:** Sistema de Gestión de Recursos para Atención de Incidentes (SGRAI) — Dirección de Gestión de Riesgos de Desastres, Municipalidad de Valdivia.  
> **Módulo:** Eventos ATP / Centro de Mando / Asistencia Social (`sgrai-web` - `/gestion/admin/eventos-atp`, `/gestion/centro-incidentes`, `/gestion/asistente-social`).  
> **Historia de Usuario:** HU-60 — *"Como Encargado Quiero vincular y desvincular incidentes, eventos de prevención, operativos de recuperación y casos de asistencia social a una Alerta Temprana Preventiva (ATP) activa Para mantener una trazabilidad integral y clasificar todo el despliegue operativo y social desencadenado a partir de un mismo fenómeno o amenaza climática comunal."*  
> **Desarrollador Asignado:** Jonagu1  
> **Servicio Web Auditado:** `sgrai-web` (Next.js 16.3.4 App Router + React 19 + TypeScript + Vitest v3.2.7 + Testing Library + `openapi-fetch`).  
> **Rama Git Evaluada:** `feature/H60-vincular-evento-atp`  
> **Commits Evaluados (Conventional Commits):**  
> * `feat(eventos-atp): agregar catalogo, detalle y vinculacion de entidades (H60)`  
> * `docs(eventos-atp): documentar manual y casos de prueba de vinculacion (H60)`  
>  
> **Fecha de Auditoría QA:** 18 de Noviembre de 2026 23:40  
> **Estado de Certificación:** 🔴 **OBSERVADO / CAMBIOS SOLICITADOS EN CODE REVIEW (15/20 CASOS APROBADOS — 5 DEFECTOS ABIERTOS)**

---

## 1. Resumen Ejecutivo de Auditoría QA

Durante la auditoría estática, contractual, de seguridad RBAC y dinámica sobre la rama `feature/H60-vincular-evento-atp` del repositorio `sgrai-web`, se evaluaron **20 casos de prueba** (5 defectos reales detectados durante la inspección forense y 15 escenarios funcionales, contractuales y de automatización). Como resultado, **15 casos resultaron aprobados** y **5 defectos quedaron en estado `ABIERTO`** (**1 Crítico**, **3 Altos** y **1 Medio**), impidiendo aprobar la integración hacia `develop` hasta completar las correcciones y ejecutar el ciclo formal de Re-Test.

| Métrica de Calidad | Resultado Inicial (`18/11/2026 23:40`) | Observaciones |
|---|:---:|---|
| **Total de Casos Evaluados en Matriz** | **20** | 5 Defectos Abiertos (`BUG-H60-WEB-01` a `BUG-H60-WEB-05`) + 15 Casos Funcionales/Técnicos |
| **Casos Aprobados (`APROBADO`)** | **15** | Flujos base de `SelectorEventoAtp`, `VinculoEventoAtpPanel`, catálogo ATP, filtro Kanban y creación preventiva/recuperación |
| **Defectos Abiertos (`ABIERTO`)** | **5** | 1 Crítico, 3 Altos y 1 Medio pendientes de corrección para Re-Test |
| **Casos Bloqueados (`BLOQUEADO`)** | **0** | Validación contractual realizada frente al OpenAPI generado y código fuente de `sgrai-api` |
| **Tasa de Aprobación Actual (% Pass)** | **75.0%** | Requiere subsanación de los 5 defectos abiertos y Re-Test al 100% |
| **Suite Automatizada del Módulo (Vitest)** | 🟢 **33/33 tests pass** (con warnings `act`) | `SelectorEventoAtp.test.tsx` (4), `VinculoEventoAtpPanel.test.tsx` (4), `eventosAtpService.test.ts` (12), `EventosAtpPage.test.tsx` (3), `KanbanFiltros.test.tsx` (10 con warnings `act(...)` en `stderr`) |
| **Suite Completa del Repositorio Web** | 🟢 **820/820 tests pass** | 129 archivos ejecutados (`npx vitest run`); sin tests para `[id]/page.tsx`, `useEventosAsistenciaSocial` con `eventoAtpId` ni bloqueo `FINALIZADO` |
| **Análisis Estático (`npm run lint`)** | 🟡 **0 errores / 11 warnings** | 0 errores en archivos H60; 11 advertencias preexistentes en otros módulos |
| **Chequeo de Tipos (`npx tsc --noEmit`)** | 🟢 **0 errores** | Limpio tras regenerar `.next/types`; presenta casteos `as never` en servicios (`BUG-H60-WEB-05`) |
| **Compilación de Producción (`npm run build`)** | 🟢 **Exitosa** | Next.js 16.3.4 Turbopack compiló 51 rutas estáticas/dinámicas incluyendo `/admin/eventos-atp/[id]` |
| **Sincronización con `develop`** | 🔴 **Desfasada** | Rama base `e286571` anterior a PR #40/#41/#42/#47; presenta conflictos en 5 archivos compartidos |

---

## 2. Registro Técnico de Defectos Detectados en Auditoría Forense

Durante la inspección del código fuente implementado en la rama `feature/H60-vincular-evento-atp`, se identificaron **5 defectos reales** que afectan el cumplimiento de los Criterios de Aceptación (CA-1, CA-2, CA-6, CA-7 y CA-8), la seguridad RBAC y los estándares visuales institucionales:

| ID Defecto | Título y Descripción Técnica del Defecto | Severidad | Archivo(s) Afectado(s) | Fecha Hallazgo | Estado | Fecha Re-Test | Solución / Commit |
|---|---|:---:|---|:---:|:---:|:---:|---|
| `BUG-H60-WEB-01` | **Filtro `eventoAtpId` inoperante en Asistencia Social (`useEventosAsistenciaSocial` omite el parámetro y `filtrarEventosMock` no lo evalúa):** Aunque `AsistenciaSocialClient.tsx` mantiene `filtros.eventoAtpId` y `AsistenciaSocialFiltros.tsx` renderiza el selector `<FilterSelect id="filtro-evento-atp-asistencia-social">`, el hook `src/hooks/useEventosAsistenciaSocial.ts` solo desestructura `pagina, limite, busqueda, delegacionId, prioridad, estado` (línea 41), invoca `obtenerEventosAsistenciaSocial` sin `eventoAtpId` (líneas 55-58) y excluye `eventoAtpId` del arreglo de dependencias de `fetchData` (línea 71). Al seleccionar o limpiar un Evento ATP en la bandeja social, no se dispara consulta ni se envía el query param a `GET /api/eventos-atp/asistencia-social`. Además, `filtrarEventosMock` en `asistenciaSocialService.ts` (líneas 102-143) tampoco filtra por `filtros.eventoAtpId`. | Crítica | `src/hooks/useEventosAsistenciaSocial.ts`, `src/services/asistenciaSocialService.ts` | 18/11/2026 23:40 | `ABIERTO` | (Pendiente) | Pendiente (Rechazado en Code Review) |
| `BUG-H60-WEB-02` | **Desincronización de estado tras vincular/desvincular en `EventoAsistenciaSocialDetalleModal` e `IncidenteDetalleDrawer`:** En `EventoAsistenciaSocialDetalleModal.tsx` (líneas 267-271), `<VinculoEventoAtpPanel>` se renderiza sin la prop `onCambio` ni `eventoAtpCodigo`, y `AsistenciaSocialTabla.tsx` (líneas 351-379) tampoco refresca `eventoSeleccionado` ni el listado padre `AsistenciaSocialClient`. Tras vincular desde el modal, no aparece el botón `"Desvincular"`, el texto sigue indicando `"Sin Evento ATP vinculado."` y al desvincular el botón `"Desvincular"` permanece activo. En `IncidenteDetalleDrawer.tsx` (líneas 135-144), `onCambio` actualiza solo el estado local del drawer sin invocar `recargar()` en `KanbanBoard` cuando existe filtro `eventoAtpId` activo, y tampoco resuelve `eventoAtpCodigo`, mostrando el UUID crudo. | Alta | `src/components/asistencia-social/EventoAsistenciaSocialDetalleModal.tsx`, `src/components/asistencia-social/AsistenciaSocialTabla.tsx`, `src/components/asistencia-social/AsistenciaSocialClient.tsx`, `src/components/mando/IncidenteDetalleDrawer.tsx`, `src/components/mando/KanbanBoard.tsx` | 18/11/2026 23:40 | `ABIERTO` | (Pendiente) | Pendiente (Rechazado en Code Review) |
| `BUG-H60-WEB-03` | **Ausencia de bloqueo preventivo para Eventos ATP `FINALIZADO`/`CANCELADO` en detalle `/admin/eventos-atp/[id]`, política RBAC *Fail-Open* en `usePuedeVincularEventoAtp` y desalineación de permisos en catálogo/detalle:** (1) En `[id]/page.tsx` (línea 259), el botón `"Vincular seleccionados"` solo evalúa `totalSeleccionados === 0 \|\| procesando` sin verificar `detalle?.estado === 'ACTIVO'`, permitiendo seleccionar entidades y disparar `POST` sobre eventos `FINALIZADO` o `CANCELADO` hasta recibir HTTP `409`. (2) `usePuedeVincularEventoAtp.ts` (línea 12) retorna `true` cuando `SimulatedSessionContext` es `null` (política *Fail-Open*) y omite `AuthContext`. (3) Tanto `eventos-atp/page.tsx` como `[id]/page.tsx` permiten acceso UI con `eventos_atp:crear` aunque el backend exige `eventos_atp:vincular` para `GET /api/eventos-atp` y `GET /api/eventos-atp/{id}`, disparan `cargar()` en `useEffect` aun cuando `!puedeVer`, muestran `+ Nuevo Evento ATP` sin validar `eventos_atp:crear`, y `SimulatedSessionContext.obtenerPermisosFallback` omite `eventos_atp:vincular` para Encargado y Administrador. | Alta | `src/app/(admin)/admin/eventos-atp/[id]/page.tsx`, `src/app/(admin)/admin/eventos-atp/page.tsx`, `src/hooks/usePuedeVincularEventoAtp.ts`, `src/context/SimulatedSessionContext.tsx` | 18/11/2026 23:40 | `ABIERTO` | (Pendiente) | Pendiente (Rechazado en Code Review) |
| `BUG-H60-WEB-04` | **Ausencia de suscripción WebSocket a `evento_atp:vinculado` (CA-7) y brechas funcionales de CA-1 / CA-6 en Prevención, Recuperación y listado de Misiones:** (1) Ningún hook o componente (`useEncargadoKanbanSocket.ts`, `useEventosAsistenciaSocial.ts`, `usePrevencionSocket.ts`, `useRecuperacionSocket.ts`, `[id]/page.tsx`) se suscribe al evento `evento_atp:vinculado` emitido por `sgrai-api` a `encargado`, `supervisor` y `mapa`, y `useIncidentesKanban.handleIncidenteCreado` inserta incidentes nuevos en `REPORTADO` aun con filtro `eventoAtpId` activo. (2) Para prevención y recuperación solo se agregó `SelectorEventoAtp` en creación (`ModalCrearEventoPrevencion` y `ModalCrearEventoRecuperacion`), sin drawer/modal de detalle para vincular/desvincular eventos existentes (CA-1) ni filtro `eventoAtpId` en otros listados operativos del Centro de Mando (`MisionesModal`/`MisionesFiltros`, o vistas de prevención/recuperación que consuman `listarEventosPrevencion` y `listarRecuperaciones`). | Alta | `src/hooks/useEncargadoKanbanSocket.ts`, `src/hooks/useIncidentesKanban.ts`, `src/hooks/useEventosAsistenciaSocial.ts`, `src/app/(admin)/admin/eventos-atp/[id]/page.tsx`, `src/components/mando/misiones/MisionesFiltros.tsx`, `src/hooks/useMisiones.ts`, `src/components/mando/MapaOperativoMandoInner.tsx` | 18/11/2026 23:40 | `ABIERTO` | (Pendiente) | Pendiente (Rechazado en Code Review) |
| `BUG-H60-WEB-05` | **Incumplimiento de guía visual (`GEMINI.md` §3), casteos `as never` en servicios, warnings `act(...)` en Vitest y brecha de cobertura de pruebas automatizadas:** `VinculoEventoAtpPanel.tsx` (`<h3>` línea 123), `[id]/page.tsx` (`<h2>` línea 288 y `<Link>` suelto línea 335) y `eventos-atp/page.tsx` (`<input>` nativo línea 144 y `<Link>` suelto línea 194) incumplen el uso obligatorio de `<Heading>`, `<Button>` e `<Input>` sin toasts `useToast`; `eventosAtpService.ts` (líneas 245, 288), `prevencionService.ts` (línea 208) y `recuperacionService.ts` (línea 167) fuerzan `as never` sobre `apiClient`; `KanbanFiltros.test.tsx` emite 9 warnings `act(...)` en `stderr`; faltan pruebas unitarias/componente para `[id]/page.tsx`, `useEventosAsistenciaSocial`/`AsistenciaSocialFiltros` con `eventoAtpId`, bloqueo `FINALIZADO` en UI y paneles integrados en drawers/modales. Además, la rama presenta divergencia y conflictos de integración contra `origin/develop`. | Media | `src/components/eventos-atp/VinculoEventoAtpPanel.tsx`, `src/app/(admin)/admin/eventos-atp/[id]/page.tsx`, `src/app/(admin)/admin/eventos-atp/page.tsx`, `src/services/eventosAtpService.ts`, `src/services/prevencionService.ts`, `src/services/recuperacionService.ts`, `src/components/mando/__tests__/KanbanFiltros.test.tsx` | 18/11/2026 23:40 | `ABIERTO` | (Pendiente) | Pendiente (Rechazado en Code Review) |

---

## 3. Matriz Consolidada de Casos de Prueba (13 Columnas)

| ID Caso | Título del Caso de Prueba | Tipo de Prueba | Nivel | Prioridad | Precondición | Datos de Prueba (Payload / Headers / Query) | Resultado Esperado | Resultado Obtenido | Estado | Fecha / Hora Ejecución | Fecha / Hora Re-Test | Solución / Commit |
|---|---|---|---|---|---|---|---|---|:---:|:---:|:---:|---|
| **BUG-H60-WEB-01** | Filtro `eventoAtpId` en listado de Asistencia Social (`useEventosAsistenciaSocial` y `filtrarEventosMock`) | Funcional / Integración (CA-6) | Hook / Servicio | Crítica | Bandeja de Asistencia Social cargada con filtro `eventoAtpId` seleccionado en `AsistenciaSocialFiltros`. | `filtros = { pagina: 1, limite: 10, estado: 'PENDIENTE', eventoAtpId: '50000000-0000-4000-8000-000000000001' }` | `useEventosAsistenciaSocial` incluye `eventoAtpId` en `fetchData`, reacciona a su cambio y `filtrarEventosMock` filtra por `eventoAtpId`. | `useEventosAsistenciaSocial.ts` omite `eventoAtpId` en desestructuración, llamada y dependencias (`fetchData`), y `filtrarEventosMock` tampoco lo filtra. | ABIERTO | 18/11/2026 23:40 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| **BUG-H60-WEB-02** | Sincronización de estado tras vincular o desvincular en `EventoAsistenciaSocialDetalleModal` e `IncidenteDetalleDrawer` | Funcional / Reactividad (CA-1 / CA-5) | Componente / Vista | Alta | Ficha de asistencia social abierta en `EventoAsistenciaSocialDetalleModal` o incidente abierto en `IncidenteDetalleDrawer` con Kanban filtrado por `eventoAtpId`. | `VinculoEventoAtpPanel` dentro de `EventoAsistenciaSocialDetalleModal` y `IncidenteDetalleDrawer` tras `POST`/`DELETE /api/eventos-atp/{id}/vinculos` | El modal/drawer actualiza `eventoAtpId` y muestra código `ATP-YYYY-####`, habilita/oculta botón `Desvincular` y refresca la tabla o Kanban filtrado. | `EventoAsistenciaSocialDetalleModal` no pasa `onCambio` ni actualiza `AsistenciaSocialTabla`; `IncidenteDetalleDrawer` no refresca `KanbanBoard` ni resuelve el código ATP. | ABIERTO | 18/11/2026 23:40 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| **BUG-H60-WEB-03** | Bloqueo preventivo para Eventos ATP `FINALIZADO`/`CANCELADO` en `[id]/page.tsx`, RBAC *Fail-Closed* y permisos en catálogo/detalle | Seguridad RBAC / Regla de Negocio (CA-2 / CA-8) | Página / Hook | Alta | Vista `/admin/eventos-atp/[id]` abierta con Evento ATP en estado `FINALIZADO`, o `VinculoEventoAtpPanel` fuera de `SimulatedSessionProvider`, o usuario con solo `eventos_atp:crear`. | Evento ATP con `estado: 'FINALIZADO'`; contexto `SimulatedSessionContext = null`; usuario con permiso `eventos_atp:crear` sin `eventos_atp:vincular` | Botón `Vincular seleccionados` deshabilitado en eventos no activos, `usePuedeVincularEventoAtp` retorna `false` sin contexto (*Fail-Closed*) y no se ejecutan fetches sin permiso. | `[id]/page.tsx` deja habilitado `Vincular seleccionados` en `FINALIZADO`; `usePuedeVincularEventoAtp` retorna `true` sin contexto; ambas páginas disparan `cargar()` sin permiso y muestran `+ Nuevo Evento ATP` sin validar `eventos_atp:crear`. | ABIERTO | 18/11/2026 23:40 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| **BUG-H60-WEB-04** | Suscripción WebSocket `evento_atp:vinculado` (CA-7) y cobertura CA-1 / CA-6 en Prevención, Recuperación y Misiones | Tiempo Real / Cobertura Funcional (CA-1 / CA-6 / CA-7) | Hook / Módulo | Alta | Cliente conectado a Socket.io en salas `encargado`, `supervisor` y `mapa`, y operación de detalle/listado de prevención, recuperación y misiones en Centro de Mando. | Evento Socket `evento_atp:vinculado`; eventos de prevención/recuperación existentes y `MisionesModal` | Las vistas escuchan `evento_atp:vinculado`, `handleIncidenteCreado` respeta `eventoAtpId`, y existe detalle vinculable y filtro `eventoAtpId` en listados del Centro de Mando. | No existe listener `evento_atp:vinculado` en `src/`, `handleIncidenteCreado` inserta incidentes aun con filtro ATP, no hay detalle vinculable de prevención/recuperación ni filtro ATP en `MisionesFiltros`. | ABIERTO | 18/11/2026 23:40 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| **BUG-H60-WEB-05** | Estándares visuales (`GEMINI.md`), eliminación de `as never`, limpieza de warnings `act(...)`, tests faltantes e integración con `develop` | Calidad / Estándares / CI | UI / Servicio / Tests | Media | Auditoría de componentes UI, servicios `openapi-fetch`, consola Vitest y árbol Git frente a `origin/develop`. | `VinculoEventoAtpPanel.tsx`, `[id]/page.tsx`, `eventos-atp/page.tsx`, `eventosAtpService.ts`, `KanbanFiltros.test.tsx`, `git merge-tree` | Uso exclusivo de `<Heading>`, `<Button>`, `<Input>` y `useToast`; cero casteos `as never`; 0 warnings `act(...)`; cobertura de `[id]/page.tsx` y `AsistenciaSocialFiltros`; rama alineada a `develop`. | Persisten `<h2/h3>`, `<input>` y `<Link>` sueltos; `as never` en 3 servicios; 9 warnings `act(...)` en `KanbanFiltros.test.tsx`; faltan suites para `[id]/page.tsx` y filtro social; conflictos latentes con `develop`. | ABIERTO | 18/11/2026 23:40 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| **CP-H60-WEB-01** | Carga exclusiva de Eventos ATP en estado `ACTIVO` en `SelectorEventoAtp` | Funcional (CA-2) | Componente | Crítica | Componente `SelectorEventoAtp` montado en formulario o panel de vinculación. | `GET /api/eventos-atp?estado=ACTIVO&limit=100` | El selector solicita únicamente eventos con `estado: 'ACTIVO'` y `limit: 100`, desplegando opciones `CODIGO · NOMBRE`. | `listarEventosAtp` invocado con `{ estado: 'ACTIVO', limit: 100 }` y opciones renderizadas correctamente en `SelectorEventoAtp.test.tsx`. | APROBADO | 18/11/2026 23:40 | - | feat(eventos-atp): agregar catalogo, detalle y vinculacion de entidades (H60) |
| **CP-H60-WEB-02** | Selección de Evento ATP y emisión de `null` al elegir la opción vacía en `SelectorEventoAtp` | Funcional (CA-1 / CA-5) | Componente | Alta | `SelectorEventoAtp` con eventos activos cargados y `permitirVacio=true`. | `fireEvent.change` con `50000000-0000-4000-8000-000000000002` y luego `''` | Al seleccionar un evento emite su UUID; al elegir `"Sin Evento ATP vinculado"` emite `null`. | `onChange` recibe el UUID seleccionado y posteriormente `null` según `SelectorEventoAtp.test.tsx`. | APROBADO | 18/11/2026 23:40 | - | feat(eventos-atp): agregar catalogo, detalle y vinculacion de entidades (H60) |
| **CP-H60-WEB-03** | Visualización de texto de ayuda y atributos de accesibilidad ante error en `SelectorEventoAtp` | Validación / A11y | Componente | Media | `SelectorEventoAtp` montado con prop `error` o sin error. | `error="Debe seleccionar un Evento ATP."` | Muestra mensaje de error y marca `aria-invalid="true"`; sin error muestra ayuda `"Solo se muestran Eventos ATP en estado ACTIVO."`. | Renderiza `aria-invalid="true"` y textos esperados en `SelectorEventoAtp.test.tsx`. | APROBADO | 18/11/2026 23:40 | - | feat(eventos-atp): agregar catalogo, detalle y vinculacion de entidades (H60) |
| **CP-H60-WEB-04** | Vinculación individual de incidente desde `VinculoEventoAtpPanel` (`POST /api/eventos-atp/{id}/vinculos`) | Funcional / Integración (CA-1 / CA-4) | Componente / Servicio | Crítica | Usuario con permiso `eventos_atp:vincular` en `VinculoEventoAtpPanel` para `tipoEntidad="INCIDENTE"`. | `POST /api/eventos-atp/50000000-0000-4000-8000-000000000001/vinculos` body `{ incidenteIds: ['a0000000-0000-4000-8000-000000000001'] }` | Envía `incidenteIds`, invoca `onCambio(eventoAtpId)` y despliega aviso de éxito. | `vincularEntidadesEventoAtp` invocado con payload exacto, `onCambio` ejecutado y `InlineNotice` de éxito visible. | APROBADO | 18/11/2026 23:40 | - | feat(eventos-atp): agregar catalogo, detalle y vinculacion de entidades (H60) |
| **CP-H60-WEB-05** | Desvinculación individual sin eliminar la entidad en `VinculoEventoAtpPanel` (`DELETE /api/eventos-atp/{id}/vinculos`) | Funcional / Integración (CA-5) | Componente / Servicio | Crítica | Entidad previamente vinculada (`eventoAtpId` no nulo) en `VinculoEventoAtpPanel`. | `DELETE /api/eventos-atp/50000000-0000-4000-8000-000000000001/vinculos` body `{ eventoPrevencionIds: ['a0000000-0000-4000-8000-000000000001'] }` | Envía `DELETE` con los IDs a desvincular sin borrar la entidad y ejecuta `onCambio(null)`. | `desvincularEntidadesEventoAtp` ejecutado con `{ eventoPrevencionIds: [entidadId] }` y `onCambio(null)` confirmado. | APROBADO | 18/11/2026 23:40 | - | feat(eventos-atp): agregar catalogo, detalle y vinculacion de entidades (H60) |
| **CP-H60-WEB-06** | Manejo de rechazo HTTP `409 Conflict` cuando el Evento ATP no está `ACTIVO` en servicio y panel | Regla de Negocio / Errores | Servicio / Componente | Crítica | Petición de vinculación hacia un Evento ATP en estado `FINALIZADO` o `CANCELADO`. | `POST /api/eventos-atp/{id}/vinculos` -> `409 Conflict` `{ message: 'El Evento ATP no está ACTIVO.' }` | `eventosAtpService` lanza `EventoAtpServiceError` con `statusCode: 409` y `VinculoEventoAtpPanel` despliega el mensaje al usuario. | Error `409` encapsulado en `EventoAtpServiceError` y renderizado en `InlineNotice` de error en Vitest. | APROBADO | 18/11/2026 23:40 | - | feat(eventos-atp): agregar catalogo, detalle y vinculacion de entidades (H60) |
| **CP-H60-WEB-07** | Modo solo lectura en `VinculoEventoAtpPanel` cuando `usePuedeVincularEventoAtp` retorna `false` | Seguridad RBAC (CA-8) | Componente | Alta | Usuario autenticado sin permiso `eventos_atp:vincular` dentro de `SimulatedSessionProvider`. | `usePuedeVincularEventoAtp` mockeado a `false`; `eventoAtpCodigo="ATP-2026-0001"` | Oculta el selector y los botones `Vincular` / `Desvincular`, mostrando solo el estado informativo del vínculo. | Botones ausentes en el DOM y texto `"Vinculado al Evento ATP ATP-2026-0001."` renderizado. | APROBADO | 18/11/2026 23:40 | - | feat(eventos-atp): agregar catalogo, detalle y vinculacion de entidades (H60) |
| **CP-H60-WEB-08** | Renderizado del catálogo `/admin/eventos-atp` (`/gestion/admin/eventos-atp`), estado vacío y manejo de `403` | Funcional / RBAC | Página | Alta | Acceso al catálogo de Eventos ATP por usuario autorizado o rechazo `403` de API. | `GET /api/eventos-atp?page=1&limit=10&estado=ACTIVO` -> `200 OK` / `[]` / `403 Forbidden` | Muestra tabla con código, nombre, amenaza, alerta, estado, `totalVinculados` y enlace a detalle; muestra aviso vacío o error `403`. | Verificado en `EventosAtpPage.test.tsx` (`3/3` tests aprobados) y rutas compiladas en `npm run build`. | APROBADO | 18/11/2026 23:40 | - | feat(eventos-atp): agregar catalogo, detalle y vinculacion de entidades (H60) |
| **CP-H60-WEB-09** | Selección opcional de Evento ATP al crear evento de prevención en `ModalCrearEventoPrevencion` | Funcional / Integración (CA-1) | Componente / Servicio | Alta | Modal `ModalCrearEventoPrevencion` abierto con formulario válido. | `POST /api/eventos-atp/prevencion` body incluyendo `eventoAtpId` seleccionado o `null` | El formulario incorpora `SelectorEventoAtp` y envía `eventoAtpId` en `crearEventoPrevencion`. | Integración verificada en `ModalCrearEventoPrevencion.tsx` y `prevencionService.test.ts` (`7/7` tests aprobados). | APROBADO | 18/11/2026 23:40 | - | feat(eventos-atp): agregar catalogo, detalle y vinculacion de entidades (H60) |
| **CP-H60-WEB-10** | Selección opcional de Evento ATP al crear operativo de recuperación en `ModalCrearEventoRecuperacion` | Funcional / Integración (CA-1) | Componente / Servicio | Alta | Modal `ModalCrearEventoRecuperacion` abierto con formulario válido. | `POST /api/eventos-atp/recuperacion` body incluyendo `eventoAtpId` seleccionado o `null` | El formulario incorpora `SelectorEventoAtp` y envía `eventoAtpId` en `crearEventoRecuperacion`. | Integración verificada en `ModalCrearEventoRecuperacion.tsx` y `recuperacionService.test.ts` (`6/6` tests aprobados). | APROBADO | 18/11/2026 23:40 | - | feat(eventos-atp): agregar catalogo, detalle y vinculacion de entidades (H60) |
| **CP-H60-WEB-11** | Filtro rápido `eventoAtpId` en `KanbanFiltros` y propagación en `useIncidentesKanban` hacia `GET /api/incidentes` | Funcional (CA-6) | Componente / Hook | Crítica | Tablero Kanban montado con Eventos ATP activos disponibles. | `filtros.eventoAtpId = '50000000-0000-4000-8000-000000000001'` -> `GET /api/incidentes?eventoAtpId=...` | `KanbanFiltros` emite `eventoAtpId`, muestra chip removible y `useIncidentesKanban` envía `eventoAtpId` en carga y `cargarMas`. | Emisión verificada en `KanbanFiltros.test.tsx` y propagación confirmada en `useIncidentesKanban.ts`. | APROBADO | 18/11/2026 23:40 | - | feat(eventos-atp): agregar catalogo, detalle y vinculacion de entidades (H60) |
| **CP-H60-WEB-12** | Sincronización de contrato OpenAPI en `api-generated.d.ts` y tipos derivados en `eventoAtp.ts` | Contrato OpenAPI | Tipos / Arquitectura | Crítica | Comparación entre `src/types/api-generated.d.ts`, `src/types/eventoAtp.ts` y `sgrai-api`. | Rutas `/api/eventos-atp`, `/api/eventos-atp/{id}`, `/api/eventos-atp/{id}/vinculos`, `/api/incidentes`, `/prevencion`, `/recuperacion`, `/asistencia-social` | Todos los endpoints, enums de estado (`ACTIVO`, `FINALIZADO`, `CANCELADO`) y campos `eventoAtpId` coinciden con `sgrai-api`. | Esquemas y endpoints alineados con `sgrai-api`; `npx tsc --noEmit` finaliza con `0` errores tras limpiar `.next/types`. | APROBADO | 18/11/2026 23:40 | - | feat(eventos-atp): agregar catalogo, detalle y vinculacion de entidades (H60) |
| **CP-H60-WEB-13** | Entradas de navegación y tarjeta institucional del módulo Eventos ATP en barra lateral y panel de gestión | Navegación / RBAC | Layout / UI | Media | Usuario con permiso `eventos_atp:vincular` o `eventos_atp:crear`. | Inspección de `src/components/layout/navItems.ts` y `src/components/gestion/GestionModulosGrid.tsx` | Ítem y tarjeta `Eventos ATP` apuntan a `/gestion/admin/eventos-atp` con ícono `Siren` (`lucide-react`) y permisos declarados. | Navegación y tarjeta configuradas con permisos y acción secundaria `+ Nuevo Evento ATP` condicionada a `eventos_atp:crear`. | APROBADO | 18/11/2026 23:40 | - | feat(eventos-atp): agregar catalogo, detalle y vinculacion de entidades (H60) |
| **CP-H60-WEB-14** | Ejecución completa de la suite Vitest del repositorio y compilación de producción Next.js | Regresión / Build | Suite Global / CI | Crítica | Repositorio limpio en rama `feature/H60-vincular-evento-atp`. | `npx vitest run && npm run build` | `100%` de tests existentes y nuevos aprobados sin roturas de build. | `129/129` archivos y `820/820` tests aprobados (`30.95s`); `npm run build` exitoso con 51 rutas compiladas. | APROBADO | 18/11/2026 23:40 | - | feat(eventos-atp): agregar catalogo, detalle y vinculacion de entidades (H60) |
| **CP-H60-WEB-15** | Documentación funcional de usuario para H60 en `docs/manuals/H60-vincular-evento-atp.md` | Documentación | Repositorio | Media | Revisión de `docs/manuals/H60-vincular-evento-atp.md` conforme a `GEMINI.md` §7. | Inspección de estructura, roles, rutas, reglas de negocio y errores documentados | Manual presente en `/docs/manuals/` cubriendo flujo, RBAC, reglas y errores esperables. | Documento presente con 124 líneas describiendo roles, rutas, vinculación individual/lote, filtros y códigos HTTP. | APROBADO | 18/11/2026 23:40 | - | docs(eventos-atp): documentar manual y casos de prueba de vinculacion (H60) |

---

## 4. Bloque TSV para Hoja de Cálculo

````tsv
ID Caso	Título del Caso de Prueba	Tipo de Prueba	Nivel	Prioridad	Precondición	Datos de Prueba (Payload / Headers / Query)	Resultado Esperado	Resultado Obtenido	Estado	Fecha / Hora Ejecución	Fecha / Hora Re-Test	Solución / Commit
BUG-H60-WEB-01	Filtro eventoAtpId en listado de Asistencia Social (useEventosAsistenciaSocial y filtrarEventosMock)	Funcional / Integración (CA-6)	Hook / Servicio	Crítica	Bandeja de Asistencia Social cargada con filtro eventoAtpId seleccionado en AsistenciaSocialFiltros.	filtros = { pagina: 1, limite: 10, estado: 'PENDIENTE', eventoAtpId: '50000000-0000-4000-8000-000000000001' }	useEventosAsistenciaSocial incluye eventoAtpId en fetchData, reacciona a su cambio y filtrarEventosMock filtra por eventoAtpId.	useEventosAsistenciaSocial.ts omite eventoAtpId en desestructuración, llamada y dependencias (fetchData), y filtrarEventosMock tampoco lo filtra.	ABIERTO	18/11/2026 23:40	(Pendiente)	Pendiente (Rechazado en Code Review)
BUG-H60-WEB-02	Sincronización de estado tras vincular o desvincular en EventoAsistenciaSocialDetalleModal e IncidenteDetalleDrawer	Funcional / Reactividad (CA-1 / CA-5)	Componente / Vista	Alta	Ficha de asistencia social abierta en EventoAsistenciaSocialDetalleModal o incidente abierto en IncidenteDetalleDrawer con Kanban filtrado por eventoAtpId.	VinculoEventoAtpPanel dentro de EventoAsistenciaSocialDetalleModal y IncidenteDetalleDrawer tras POST/DELETE /api/eventos-atp/{id}/vinculos	El modal/drawer actualiza eventoAtpId y muestra código ATP-YYYY-####, habilita/oculta botón Desvincular y refresca la tabla o Kanban filtrado.	EventoAsistenciaSocialDetalleModal no pasa onCambio ni actualiza AsistenciaSocialTabla; IncidenteDetalleDrawer no refresca KanbanBoard ni resuelve el código ATP.	ABIERTO	18/11/2026 23:40	(Pendiente)	Pendiente (Rechazado en Code Review)
BUG-H60-WEB-03	Bloqueo preventivo para Eventos ATP FINALIZADO/CANCELADO en [id]/page.tsx, RBAC Fail-Closed y permisos en catálogo/detalle	Seguridad RBAC / Regla de Negocio (CA-2 / CA-8)	Página / Hook	Alta	Vista /admin/eventos-atp/[id] abierta con Evento ATP en estado FINALIZADO, o VinculoEventoAtpPanel fuera de SimulatedSessionProvider, o usuario con solo eventos_atp:crear.	Evento ATP con estado: 'FINALIZADO'; contexto SimulatedSessionContext = null; usuario con permiso eventos_atp:crear sin eventos_atp:vincular	Botón Vincular seleccionados deshabilitado en eventos no activos, usePuedeVincularEventoAtp retorna false sin contexto (Fail-Closed) y no se ejecutan fetches sin permiso.	[id]/page.tsx deja habilitado Vincular seleccionados en FINALIZADO; usePuedeVincularEventoAtp retorna true sin contexto; ambas páginas disparan cargar() sin permiso y muestran + Nuevo Evento ATP sin validar eventos_atp:crear.	ABIERTO	18/11/2026 23:40	(Pendiente)	Pendiente (Rechazado en Code Review)
BUG-H60-WEB-04	Suscripción WebSocket evento_atp:vinculado (CA-7) y cobertura CA-1 / CA-6 en Prevención, Recuperación y Misiones	Tiempo Real / Cobertura Funcional (CA-1 / CA-6 / CA-7)	Hook / Módulo	Alta	Cliente conectado a Socket.io en salas encargado, supervisor y mapa, y operación de detalle/listado de prevención, recuperación y misiones en Centro de Mando.	Evento Socket evento_atp:vinculado; eventos de prevención/recuperación existentes y MisionesModal	Las vistas escuchan evento_atp:vinculado, handleIncidenteCreado respeta eventoAtpId, y existe detalle vinculable y filtro eventoAtpId en listados del Centro de Mando.	No existe listener evento_atp:vinculado en src/, handleIncidenteCreado inserta incidentes aun con filtro ATP, no hay detalle vinculable de prevención/recuperación ni filtro ATP en MisionesFiltros.	ABIERTO	18/11/2026 23:40	(Pendiente)	Pendiente (Rechazado en Code Review)
BUG-H60-WEB-05	Estándares visuales (GEMINI.md), eliminación de as never, limpieza de warnings act(...), tests faltantes e integración con develop	Calidad / Estándares / CI	UI / Servicio / Tests	Media	Auditoría de componentes UI, servicios openapi-fetch, consola Vitest y árbol Git frente a origin/develop.	VinculoEventoAtpPanel.tsx, [id]/page.tsx, eventos-atp/page.tsx, eventosAtpService.ts, KanbanFiltros.test.tsx, git merge-tree	Uso exclusivo de Heading, Button, Input y useToast; cero casteos as never; 0 warnings act(...); cobertura de [id]/page.tsx y AsistenciaSocialFiltros; rama alineada a develop.	Persisten h2/h3, input y Link sueltos; as never en 3 servicios; 9 warnings act(...) en KanbanFiltros.test.tsx; faltan suites para [id]/page.tsx y filtro social; conflictos latentes con develop.	ABIERTO	18/11/2026 23:40	(Pendiente)	Pendiente (Rechazado en Code Review)
CP-H60-WEB-01	Carga exclusiva de Eventos ATP en estado ACTIVO en SelectorEventoAtp	Funcional (CA-2)	Componente	Crítica	Componente SelectorEventoAtp montado en formulario o panel de vinculación.	GET /api/eventos-atp?estado=ACTIVO&limit=100	El selector solicita únicamente eventos con estado: 'ACTIVO' y limit: 100, desplegando opciones CODIGO · NOMBRE.	listarEventosAtp invocado con { estado: 'ACTIVO', limit: 100 } y opciones renderizadas correctamente en SelectorEventoAtp.test.tsx.	APROBADO	18/11/2026 23:40	-	feat(eventos-atp): agregar catalogo, detalle y vinculacion de entidades (H60)
CP-H60-WEB-02	Selección de Evento ATP y emisión de null al elegir la opción vacía en SelectorEventoAtp	Funcional (CA-1 / CA-5)	Componente	Alta	SelectorEventoAtp con eventos activos cargados y permitirVacio=true.	fireEvent.change con 50000000-0000-4000-8000-000000000002 y luego ''	Al seleccionar un evento emite su UUID; al elegir "Sin Evento ATP vinculado" emite null.	onChange recibe el UUID seleccionado y posteriormente null según SelectorEventoAtp.test.tsx.	APROBADO	18/11/2026 23:40	-	feat(eventos-atp): agregar catalogo, detalle y vinculacion de entidades (H60)
CP-H60-WEB-03	Visualización de texto de ayuda y atributos de accesibilidad ante error en SelectorEventoAtp	Validación / A11y	Componente	Media	SelectorEventoAtp montado con prop error o sin error.	error="Debe seleccionar un Evento ATP."	Muestra mensaje de error y marca aria-invalid="true"; sin error muestra ayuda "Solo se muestran Eventos ATP en estado ACTIVO.".	Renderiza aria-invalid="true" y textos esperados en SelectorEventoAtp.test.tsx.	APROBADO	18/11/2026 23:40	-	feat(eventos-atp): agregar catalogo, detalle y vinculacion de entidades (H60)
CP-H60-WEB-04	Vinculación individual de incidente desde VinculoEventoAtpPanel (POST /api/eventos-atp/{id}/vinculos)	Funcional / Integración (CA-1 / CA-4)	Componente / Servicio	Crítica	Usuario con permiso eventos_atp:vincular en VinculoEventoAtpPanel para tipoEntidad="INCIDENTE".	POST /api/eventos-atp/50000000-0000-4000-8000-000000000001/vinculos body { incidenteIds: ['a0000000-0000-4000-8000-000000000001'] }	Envía incidenteIds, invoca onCambio(eventoAtpId) y despliega aviso de éxito.	vincularEntidadesEventoAtp invocado con payload exacto, onCambio ejecutado y InlineNotice de éxito visible.	APROBADO	18/11/2026 23:40	-	feat(eventos-atp): agregar catalogo, detalle y vinculacion de entidades (H60)
CP-H60-WEB-05	Desvinculación individual sin eliminar la entidad en VinculoEventoAtpPanel (DELETE /api/eventos-atp/{id}/vinculos)	Funcional / Integración (CA-5)	Componente / Servicio	Crítica	Entidad previamente vinculada (eventoAtpId no nulo) en VinculoEventoAtpPanel.	DELETE /api/eventos-atp/50000000-0000-4000-8000-000000000001/vinculos body { eventoPrevencionIds: ['a0000000-0000-4000-8000-000000000001'] }	Envía DELETE con los IDs a desvincular sin borrar la entidad y ejecuta onCambio(null).	desvincularEntidadesEventoAtp ejecutado con { eventoPrevencionIds: [entidadId] } y onCambio(null) confirmado.	APROBADO	18/11/2026 23:40	-	feat(eventos-atp): agregar catalogo, detalle y vinculacion de entidades (H60)
CP-H60-WEB-06	Manejo de rechazo HTTP 409 Conflict cuando el Evento ATP no está ACTIVO en servicio y panel	Regla de Negocio / Errores	Servicio / Componente	Crítica	Petición de vinculación hacia un Evento ATP en estado FINALIZADO o CANCELADO.	POST /api/eventos-atp/{id}/vinculos -> 409 Conflict { message: 'El Evento ATP no está ACTIVO.' }	eventosAtpService lanza EventoAtpServiceError con statusCode: 409 y VinculoEventoAtpPanel despliega el mensaje al usuario.	Error 409 encapsulado en EventoAtpServiceError y renderizado en InlineNotice de error en Vitest.	APROBADO	18/11/2026 23:40	-	feat(eventos-atp): agregar catalogo, detalle y vinculacion de entidades (H60)
CP-H60-WEB-07	Modo solo lectura en VinculoEventoAtpPanel cuando usePuedeVincularEventoAtp retorna false	Seguridad RBAC (CA-8)	Componente	Alta	Usuario autenticado sin permiso eventos_atp:vincular dentro de SimulatedSessionProvider.	usePuedeVincularEventoAtp mockeado a false; eventoAtpCodigo="ATP-2026-0001"	Oculta el selector y los botones Vincular / Desvincular, mostrando solo el estado informativo del vínculo.	Botones ausentes en el DOM y texto "Vinculado al Evento ATP ATP-2026-0001." renderizado.	APROBADO	18/11/2026 23:40	-	feat(eventos-atp): agregar catalogo, detalle y vinculacion de entidades (H60)
CP-H60-WEB-08	Renderizado del catálogo /admin/eventos-atp (/gestion/admin/eventos-atp), estado vacío y manejo de 403	Funcional / RBAC	Página	Alta	Acceso al catálogo de Eventos ATP por usuario autorizado o rechazo 403 de API.	GET /api/eventos-atp?page=1&limit=10&estado=ACTIVO -> 200 OK / [] / 403 Forbidden	Muestra tabla con código, nombre, amenaza, alerta, estado, totalVinculados y enlace a detalle; muestra aviso vacío o error 403.	Verificado en EventosAtpPage.test.tsx (3/3 tests aprobados) y rutas compiladas en npm run build.	APROBADO	18/11/2026 23:40	-	feat(eventos-atp): agregar catalogo, detalle y vinculacion de entidades (H60)
CP-H60-WEB-09	Selección opcional de Evento ATP al crear evento de prevención en ModalCrearEventoPrevencion	Funcional / Integración (CA-1)	Componente / Servicio	Alta	Modal ModalCrearEventoPrevencion abierto con formulario válido.	POST /api/eventos-atp/prevencion body incluyendo eventoAtpId seleccionado o null	El formulario incorpora SelectorEventoAtp y envía eventoAtpId en crearEventoPrevencion.	Integración verificada en ModalCrearEventoPrevencion.tsx y prevencionService.test.ts (7/7 tests aprobados).	APROBADO	18/11/2026 23:40	-	feat(eventos-atp): agregar catalogo, detalle y vinculacion de entidades (H60)
CP-H60-WEB-10	Selección opcional de Evento ATP al crear operativo de recuperación en ModalCrearEventoRecuperacion	Funcional / Integración (CA-1)	Componente / Servicio	Alta	Modal ModalCrearEventoRecuperacion abierto con formulario válido.	POST /api/eventos-atp/recuperacion body incluyendo eventoAtpId seleccionado o null	El formulario incorpora SelectorEventoAtp y envía eventoAtpId en crearEventoRecuperacion.	Integración verificada en ModalCrearEventoRecuperacion.tsx y recuperacionService.test.ts (6/6 tests aprobados).	APROBADO	18/11/2026 23:40	-	feat(eventos-atp): agregar catalogo, detalle y vinculacion de entidades (H60)
CP-H60-WEB-11	Filtro rápido eventoAtpId en KanbanFiltros y propagación en useIncidentesKanban hacia GET /api/incidentes	Funcional (CA-6)	Componente / Hook	Crítica	Tablero Kanban montado con Eventos ATP activos disponibles.	filtros.eventoAtpId = '50000000-0000-4000-8000-000000000001' -> GET /api/incidentes?eventoAtpId=...	KanbanFiltros emite eventoAtpId, muestra chip removible y useIncidentesKanban envía eventoAtpId en carga y cargarMas.	Emisión verificada en KanbanFiltros.test.tsx y propagación confirmada en useIncidentesKanban.ts.	APROBADO	18/11/2026 23:40	-	feat(eventos-atp): agregar catalogo, detalle y vinculacion de entidades (H60)
CP-H60-WEB-12	Sincronización de contrato OpenAPI en api-generated.d.ts y tipos derivados en eventoAtp.ts	Contrato OpenAPI	Tipos / Arquitectura	Crítica	Comparación entre src/types/api-generated.d.ts, src/types/eventoAtp.ts y sgrai-api.	Rutas /api/eventos-atp, /api/eventos-atp/{id}, /api/eventos-atp/{id}/vinculos, /api/incidentes, /prevencion, /recuperacion, /asistencia-social	Todos los endpoints, enums de estado (ACTIVO, FINALIZADO, CANCELADO) y campos eventoAtpId coinciden con sgrai-api.	Esquemas y endpoints alineados con sgrai-api; npx tsc --noEmit finaliza con 0 errores tras limpiar .next/types.	APROBADO	18/11/2026 23:40	-	feat(eventos-atp): agregar catalogo, detalle y vinculacion de entidades (H60)
CP-H60-WEB-13	Entradas de navegación y tarjeta institucional del módulo Eventos ATP en barra lateral y panel de gestión	Navegación / RBAC	Layout / UI	Media	Usuario con permiso eventos_atp:vincular o eventos_atp:crear.	Inspección de src/components/layout/navItems.ts y src/components/gestion/GestionModulosGrid.tsx	Ítem y tarjeta Eventos ATP apuntan a /gestion/admin/eventos-atp con ícono Siren (lucide-react) y permisos declarados.	Navegación y tarjeta configuradas con permisos y acción secundaria + Nuevo Evento ATP condicionada a eventos_atp:crear.	APROBADO	18/11/2026 23:40	-	feat(eventos-atp): agregar catalogo, detalle y vinculacion de entidades (H60)
CP-H60-WEB-14	Ejecución completa de la suite Vitest del repositorio y compilación de producción Next.js	Regresión / Build	Suite Global / CI	Crítica	Repositorio limpio en rama feature/H60-vincular-evento-atp.	npx vitest run && npm run build	100% de tests existentes y nuevos aprobados sin roturas de build.	129/129 archivos y 820/820 tests aprobados (30.95s); npm run build exitoso con 51 rutas compiladas.	APROBADO	18/11/2026 23:40	-	feat(eventos-atp): agregar catalogo, detalle y vinculacion de entidades (H60)
CP-H60-WEB-15	Documentación funcional de usuario para H60 en docs/manuals/H60-vincular-evento-atp.md	Documentación	Repositorio	Media	Revisión de docs/manuals/H60-vincular-evento-atp.md conforme a GEMINI.md §7.	Inspección de estructura, roles, rutas, reglas de negocio y errores documentados	Manual presente en /docs/manuals/ cubriendo flujo, RBAC, reglas y errores esperables.	Documento presente con 124 líneas describiendo roles, rutas, vinculación individual/lote, filtros y códigos HTTP.	APROBADO	18/11/2026 23:40	-	docs(eventos-atp): documentar manual y casos de prueba de vinculacion (H60)
````

---

## 5. Guía de Ejecución Paso a Paso y Evidencias Técnicas Replicables

### 5.1. Ejecución de Suites Automatizadas con Vitest

#### Comando 1: Ejecución consolidada de las 5 suites específicas de HU-60
```bash
npx vitest run \
  src/components/eventos-atp/__tests__/SelectorEventoAtp.test.tsx \
  src/components/eventos-atp/__tests__/VinculoEventoAtpPanel.test.tsx \
  src/services/__tests__/eventosAtpService.test.ts \
  "src/app/(admin)/admin/eventos-atp/__tests__/EventosAtpPage.test.tsx" \
  src/components/mando/__tests__/KanbanFiltros.test.tsx
```

**Evidencia real obtenida en consola:**
```text
 RUN  v3.2.7 /home/ds2fery/Documentos/Proyecto/sgrai-uach/web

 ✓ src/services/__tests__/eventosAtpService.test.ts (12 tests) 31ms
 ✓ src/components/eventos-atp/__tests__/SelectorEventoAtp.test.tsx (4 tests) 181ms
 ✓ src/app/(admin)/admin/eventos-atp/__tests__/EventosAtpPage.test.tsx (3 tests)
 ✓ src/components/eventos-atp/__tests__/VinculoEventoAtpPanel.test.tsx (4 tests) 582ms
 ✓ src/components/mando/__tests__/KanbanFiltros.test.tsx (10 tests) 1201ms

 Test Files  5 passed (5)
      Tests  33 passed (33)
   Duration  4.55s
```
*(Observación registrada en `stderr`: `KanbanFiltros.test.tsx` emitió 9 advertencias `An update to KanbanFiltros inside a test was not wrapped in act(...)` debido al `queueMicrotask` incorporado en `KanbanFiltros.tsx`.)*

#### Comando 2: Ejecución individual de casos con filtro `-t`
```bash
# CP-H60-WEB-01: Carga exclusiva de Eventos ATP en estado ACTIVO
npm test -- src/components/eventos-atp/__tests__/SelectorEventoAtp.test.tsx -t "lista solo Eventos ATP ACTIVO"

# CP-H60-WEB-04 y CP-H60-WEB-05: Vinculación y desvinculación en VinculoEventoAtpPanel
npm test -- src/components/eventos-atp/__tests__/VinculoEventoAtpPanel.test.tsx -t "vincula la entidad"

# CP-H60-WEB-06: Manejo de conflicto HTTP 409 cuando el Evento ATP no está ACTIVO
npm test -- src/services/__tests__/eventosAtpService.test.ts -t "409 al no estar ACTIVO"

# CP-H60-WEB-11: Emisión del filtro eventoAtpId en el tablero Kanban
npm test -- src/components/mando/__tests__/KanbanFiltros.test.tsx -t "filtro de Evento ATP"
```

**Evidencia real obtenida en consola:**
```text
 ✓ src/components/eventos-atp/__tests__/SelectorEventoAtp.test.tsx (4 tests | 3 skipped) 136ms
   ✓ SelectorEventoAtp (H60) > lista solo Eventos ATP ACTIVO y permite seleccionar uno 132ms

 ✓ src/components/eventos-atp/__tests__/VinculoEventoAtpPanel.test.tsx (4 tests | 2 skipped) 257ms
   ✓ VinculoEventoAtpPanel (H60) > vincula la entidad al Evento ATP seleccionado 226ms

 ✓ src/services/__tests__/eventosAtpService.test.ts (12 tests | 11 skipped) 7ms
   ✓ eventosAtpService (H60) - listado, detalle y vinculación > lanza EventoAtpServiceError con el 409 al no estar ACTIVO 5ms

 ✓ src/components/mando/__tests__/KanbanFiltros.test.tsx (10 tests | 9 skipped) 90ms
   ✓ KanbanFiltros > debe mostrar y emitir el filtro de Evento ATP (H60) 88ms
```

#### Comando 3: Suite de regresión completa del repositorio
```bash
npx vitest run
```

**Evidencia real obtenida en consola:**
```text
 Test Files  129 passed (129)
      Tests  820 passed (820)
   Start at  23:30:25
   Duration  30.95s
```

---

### 5.2. Verificación Estática (ESLint, TypeScript) y Compilación de Producción

```bash
# Análisis estático específico sobre los archivos de HU-60
npx eslint \
  src/types/eventoAtp.ts \
  src/services/eventosAtpService.ts \
  src/hooks/usePuedeVincularEventoAtp.ts \
  src/components/eventos-atp/SelectorEventoAtp.tsx \
  src/components/eventos-atp/VinculoEventoAtpPanel.tsx \
  "src/app/(admin)/admin/eventos-atp/page.tsx" \
  "src/app/(admin)/admin/eventos-atp/[id]/page.tsx" \
  src/components/mando/KanbanFiltros.tsx \
  src/components/mando/IncidenteDetalleDrawer.tsx \
  src/components/mando/ModalCrearEventoPrevencion.tsx \
  src/components/mando/ModalCrearEventoRecuperacion.tsx \
  src/components/asistencia-social/AsistenciaSocialFiltros.tsx \
  src/components/asistencia-social/AsistenciaSocialClient.tsx \
  src/components/asistencia-social/AsistenciaSocialTabla.tsx \
  src/components/asistencia-social/EventoAsistenciaSocialDetalleModal.tsx \
  src/hooks/useEventosAsistenciaSocial.ts \
  src/hooks/useIncidentesKanban.ts

# Verificación global de linter, tipos Next.js/TypeScript y build de producción
npm run lint
rm -rf .next/types && npx next typegen && npx tsc --noEmit
npm run build
```

**Evidencias reales obtenidas en consola:**
```text
npx eslint (archivos H60): Exit code 0 (0 errores, 0 advertencias en los 17 archivos evaluados)
npm run lint: ✖ 11 problems (0 errors, 11 warnings preexistentes fuera de H60)
npx next typegen && npx tsc --noEmit: Exit code 0 (0 errores de tipado tras limpiar caché previa de .next/types)
npm run build: Compiled successfully in 5.0s; Finished TypeScript in 9.9s; 51/51 rutas compiladas (incluye /admin/eventos-atp, /admin/eventos-atp/[id], /gestion/admin/eventos-atp y /gestion/admin/eventos-atp/[id])
```

---

### 5.3. Comandos cURL Replicables de Validación Contractual contra `sgrai-api`

> **Nota de entorno:** Durante la ejecución de esta auditoría en `sgrai-web`, la instancia local de `sgrai-api` en `http://localhost:3001` no se encontraba activa (`HTTP 000`). Los siguientes comandos `curl` permiten verificar en entorno integrado el contrato consumido por `src/services/eventosAtpService.ts` y los filtros `eventoAtpId` una vez levantado el backend.

#### Escenario A: Listar Eventos ATP activos (`GET /api/eventos-atp?estado=ACTIVO&limit=100` — HTTP `200 OK`)
```bash
curl -i -X GET "http://localhost:3001/api/eventos-atp?estado=ACTIVO&limit=100" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer <TOKEN_JWT_ENCARGADO>"
```
*Respuesta contractual esperada:*
```json
{
  "message": "Listado de Eventos ATP obtenido exitosamente.",
  "data": [
    {
      "id": "50000000-0000-4000-8000-000000000001",
      "codigo": "ATP-2026-0001",
      "nombre": "Sistema Frontal Mayo 2026",
      "tipoAmenaza": "METEOROLOGICA",
      "nivelAlerta": "AMARILLA",
      "estado": "ACTIVO",
      "totalVinculados": 4
    }
  ],
  "meta": { "total": 1, "page": 1, "limit": 100, "totalPages": 1, "hasNext": false, "hasPrev": false }
}
```

#### Escenario B: Vincular entidades en lote a Evento ATP ACTIVO (`POST /api/eventos-atp/{id}/vinculos` — HTTP `200 OK`)
```bash
curl -i -X POST "http://localhost:3001/api/eventos-atp/50000000-0000-4000-8000-000000000001/vinculos" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN_JWT_ENCARGADO>" \
  -d '{
    "incidenteIds": ["a0000000-0000-4000-8000-000000000001"],
    "eventoPrevencionIds": ["b0000000-0000-4000-8000-000000000001"],
    "recuperacionIds": ["c0000000-0000-4000-8000-000000000001"],
    "eventoAsistenciaSocialIds": ["70000000-0000-4000-8000-000000000001"]
  }'
```
*Respuesta contractual esperada:*
```json
{
  "message": "Entidades vinculadas al Evento ATP exitosamente.",
  "data": {
    "eventoAtpId": "50000000-0000-4000-8000-000000000001",
    "accion": "VINCULADO",
    "reasignadas": [],
    "noEncontradas": [],
    "noDesvinculadas": []
  }
}
```

#### Escenario C: Desvincular entidad sin eliminar registro (`DELETE /api/eventos-atp/{id}/vinculos` — HTTP `200 OK`)
```bash
curl -i -X DELETE "http://localhost:3001/api/eventos-atp/50000000-0000-4000-8000-000000000001/vinculos" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN_JWT_ENCARGADO>" \
  -d '{
    "incidenteIds": ["a0000000-0000-4000-8000-000000000001"]
  }'
```
*Respuesta contractual esperada:*
```json
{
  "message": "Entidades desvinculadas del Evento ATP exitosamente.",
  "data": {
    "eventoAtpId": "50000000-0000-4000-8000-000000000001",
    "accion": "DESVINCULADO",
    "reasignadas": [],
    "noEncontradas": [],
    "noDesvinculadas": []
  }
}
```

#### Escenario D: Rechazo al intentar vincular sobre Evento ATP `FINALIZADO` (`409 Conflict`) y sin permiso `eventos_atp:vincular` (`403 Forbidden`)
```bash
# Evento ATP en estado FINALIZADO (HTTP 409 Conflict)
curl -i -X POST "http://localhost:3001/api/eventos-atp/50000000-0000-4000-8000-000000000099/vinculos" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN_JWT_ENCARGADO>" \
  -d '{"incidenteIds":["a0000000-0000-4000-8000-000000000001"]}'

# Usuario Call Center sin permiso eventos_atp:vincular (HTTP 403 Forbidden)
curl -i -X POST "http://localhost:3001/api/eventos-atp/50000000-0000-4000-8000-000000000001/vinculos" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN_JWT_CALL_CENTER>" \
  -d '{"incidenteIds":["a0000000-0000-4000-8000-000000000001"]}'

# Filtro eventoAtpId en listados (HTTP 200 OK)
curl -i -X GET "http://localhost:3001/api/incidentes?eventoAtpId=50000000-0000-4000-8000-000000000001" \
  -H "Authorization: Bearer <TOKEN_JWT_ENCARGADO>" \
  -H "x-user-id: 00000000-0000-4000-8000-000000000003"

curl -i -X GET "http://localhost:3001/api/eventos-atp/asistencia-social?eventoAtpId=50000000-0000-4000-8000-000000000001" \
  -H "Authorization: Bearer <TOKEN_JWT_ENCARGADO>"
```

---

## 6. Matriz de Trazabilidad de Criterios de Aceptación (CA)

| Criterio de Aceptación (CA) | Casos Asociados | Estado QA | Observaciones Técnicas |
|---|---|:---:|---|
| **CA-1:** En el drawer de detalle de un incidente, evento de prevención, evento de recuperación o evento de asistencia social, el sistema debe proveer un selector para vincular la entidad a un Evento ATP. | `CP-H60-WEB-04`, `CP-H60-WEB-09`, `CP-H60-WEB-10`, `BUG-H60-WEB-02`, `BUG-H60-WEB-04` | 🔴 **PARCIAL / OBSERVADO** | Implementado en `IncidenteDetalleDrawer` y `EventoAsistenciaSocialDetalleModal` (este último sin `onCambio`). Prevención y recuperación solo cuentan con selector en creación, sin vista de detalle vinculable. |
| **CA-2:** El selector debe listar únicamente los Eventos ATP que se encuentren en estado `ACTIVO` en la base de datos. | `CP-H60-WEB-01`, `CP-H60-WEB-03`, `CP-H60-WEB-06`, `BUG-H60-WEB-03` | 🟡 **OBSERVADO** | `SelectorEventoAtp` consulta `estado: 'ACTIVO'`, pero la vista de detalle en lote (`/admin/eventos-atp/[id]`) no bloquea la vinculación cuando el Evento ATP está `FINALIZADO` o `CANCELADO`. |
| **CA-3:** Desde la vista de detalle de un Evento ATP, el sistema también debe permitir la vinculación múltiple/en lote de entidades mediante selectores especializados. | `BUG-H60-WEB-03`, `BUG-H60-WEB-05` | 🟡 **OBSERVADO** | Implementado en `src/app/(admin)/admin/eventos-atp/[id]/page.tsx`, pero sin bloqueo de estado `FINALIZADO`, sin pruebas automatizadas y con infracciones de `GEMINI.md` §3. |
| **CA-4:** Al confirmar la vinculación, se debe actualizar la columna foránea `evento_atp_id` en la tabla correspondiente (`incidente`, `evento_prevencion`, `recuperacion`, `evento_asistencia_social`). | `CP-H60-WEB-04`, `CP-H60-WEB-09`, `CP-H60-WEB-10`, `CP-H60-WEB-12`, `BUG-H60-WEB-02` | 🟢 **CUMPLIDO EN SERVICIO** | `eventosAtpService.vincularEntidadesEventoAtp` y los servicios de creación envían el contrato correcto contra `sgrai-api`; falta sincronización UI en `EventoAsistenciaSocialDetalleModal`. |
| **CA-5:** El sistema debe permitir desvincular una entidad (estableciendo `evento_atp_id = NULL`), sin afectar ni destruir el registro de la entidad vinculada. | `CP-H60-WEB-02`, `CP-H60-WEB-05`, `BUG-H60-WEB-02` | 🟡 **OBSERVADO** | La llamada `DELETE /api/eventos-atp/{id}/vinculos` es correcta, pero en `EventoAsistenciaSocialDetalleModal` el panel no actualiza el estado tras vincular/desvincular ni refresca la tabla. |
| **CA-6:** El tablero Kanban de incidentes y los listados del Centro de Mando deben incluir un filtro rápido por `eventoAtpId` para visualizar exclusivamente las operaciones asociadas a una alerta específica. | `CP-H60-WEB-11`, `BUG-H60-WEB-01`, `BUG-H60-WEB-04` | 🔴 **NO CUMPLIDO** | Funciona en el tablero Kanban (`KanbanFiltros` + `useIncidentesKanban`), pero el filtro de Asistencia Social es inoperante por omisión de `eventoAtpId` en `useEventosAsistenciaSocial` (`BUG-H60-WEB-01`) y falta filtro en Misiones / listados de prevención y recuperación. |
| **CA-7:** El sistema debe emitir el evento WebSocket `evento_atp:vinculado` a las salas `encargado`, `supervisor` y `mapa`. | `BUG-H60-WEB-04` | 🔴 **OBSERVADO EN CLIENTE** | El evento es emitido por `sgrai-api`, pero `sgrai-web` no posee ningún listener `evento_atp:vinculado` para refrescar el tablero Kanban, el listado social ni el detalle del Evento ATP en tiempo real. |
| **CA-8:** El endpoint debe requerir el permiso RBAC `eventos_atp:vincular`. | `CP-H60-WEB-07`, `CP-H60-WEB-08`, `CP-H60-WEB-13`, `BUG-H60-WEB-03` | 🟡 **OBSERVADO** | `VinculoEventoAtpPanel` oculta controles sin permiso en sesión simulada, pero `usePuedeVincularEventoAtp` aplica política *Fail-Open* sin contexto y las páginas `/admin/eventos-atp` disparan fetches sin permiso. |
