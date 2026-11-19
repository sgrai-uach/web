# Informe y Matriz de Casos de Prueba (QA): HU-32 — Asignar Patrullas y Recursos Logísticos a Evento de Recuperación (Frontend / Web)

**Proyecto:** Sistema de Gestión de Recursos para Atención de Incidentes (SGRAI) — Dirección de Gestión de Riesgos de Desastres, Municipalidad de Valdivia  
**Repositorio:** `sgrai-web`  
**Módulo:** Centro de Mando y Operaciones de Recuperación Territorial (`/eventos-atp/recuperacion/[id]` y `/gestion/centro-incidentes`)  
**Historia de Usuario:** HU-32 — *Como Encargado Quiero asignar patrullas y recursos logísticos a eventos de recuperación comunal para coordinar las labores post-emergencia Para mantener el control centralizado de los equipos y materiales destinados a la mitigación y apoyo posterior a desastres en los sectores afectados.*  
**Desarrollador Asignado:** Mayra Carrillo (`@MayraCarrillo`)  
**Rama Git Evaluada:** `feature/H32-asignar-recursos-recuperacion` (sincronizada con `origin/develop`, `0` commits atrás / `13` commits adelante)  
**Commits Evaluados (Conventional Commits):**
* `feat(recuperacion): agregar modelos, servicio y soporte websocket para asignacion de recursos (HU-32)`
* `feat(recuperacion): implementar vista de detalle y asignacion de patrullas y recursos a evento de recuperacion (HU-32)`
* `test(recuperacion): agregar pruebas unitarias e integracion para HU-32`
* `docs(manuals): crear manual de usuario H32 para asignacion de recursos a recuperacion`
* `style(recuperacion): normalizar saltos de linea finales en archivos de recuperacion (HU-32)`
* `feat(recursos): implementar selector de insumos con busqueda en tiempo real para recuperacion`
* `fix(recuperacion): cargar patrullas reales desde sgrai-api y abrir mapa al despachar`
* `fix(recuperacion): deduplicar patrullas y recursos por ID para evitar keys duplicadas`
* `merge: integrar origin/develop en feature/H32-asignar-recursos-recuperacion`
* `docs(qa): documentar casos de prueba para la HU-32`
* `Merge remote-tracking branch 'origin/develop' into feature/H32-asignar-recursos-recuperacion`
* `fix(recuperacion): resolver observaciones de QA para asignacion de recursos (HU-32)`
* `Merge remote-tracking branch 'origin/feature/H32-asignar-recursos-recuperacion' into feature/H32-asignar-recursos-recuperacion`

**Fecha de Auditoría Inicial QA:** `16/11/2026 23:52`  
**Fecha de Re-Test QA:** `18/11/2026 16:30`  
**Estado de Certificación QA:** **RECHAZADO EN RE-TEST (`4` DEFECTOS CORREGIDOS, `1` DEFECTO CRÍTICO ABIERTO: `BUG-H32-WEB-01`)**

---

## 1. Resumen Ejecutivo de Auditoría Técnica y Ciclo de Re-Test

Tras la sincronización de `feature/H32-asignar-recursos-recuperacion` con `origin/develop` (`0` commits de atraso) y la integración del commit `fix(recuperacion): resolver observaciones de QA para asignacion de recursos (HU-32)`, se ejecutó la fase formal de **Re-Test** (`18/11/2026 16:30`).

Los resultados del Re-Test confirman la subsanación satisfactoria de **4 de los 5 defectos** reportados en la auditoría inicial:
* **`BUG-H32-WEB-02` (`CORREGIDO`):** `useRecuperacionSocket.ts` ahora extrae `payload.evento.id` / `payload.evento.codigo` en `recuperacion:actualizada`, se suscribe a la sala `'encargado'`, debouncifica recargas de inventario en `DetalleEventoRecuperacionClient.tsx` y cubre todos los eventos en `useRecuperacionSocket.test.ts` (`7/7` tests).
* **`BUG-H32-WEB-03` (`CORREGIDO`):** `usePuedeAsignarMision.ts` implementa política estrictamente *Fail-Closed* (`6/6` tests), `DetalleEventoRecuperacionClient.tsx` resuelve `userId` desde `AuthContext` / `SimulatedSessionContext`, y `/eventos-atp` queda resguardado en `RUTAS_PROTEGIDAS` (`client.ts`) y `proxy.ts`.
* **`BUG-H32-WEB-04` (`CORREGIDO`):** `BuscadorRecursosSelect.tsx` bloquea selección por teclado sobre ítems deshabilitados, incorpora estado `ASIGNADO` (`9/9` tests), `DetalleEventoRecuperacionClient.tsx` y `ModalCrearEventoRecuperacion.tsx` eliminan el filtro restrictivo `estado: 'DISPONIBLE'`, y `.recursosTableContainer` aplica `overflow: visible`.
* **`BUG-H32-WEB-05` (`CORREGIDO`):** `KanbanBoard.tsx` consume `listarEventosRecuperacion()` al montar y en `handleRefrescoCompleto()`, y `DetalleEventoRecuperacionClient.tsx` recarga el detalle ante `409 EVENTO_CERRADO` y notifica fallos de `patrullasService.listar`.

Sin embargo, **`BUG-H32-WEB-01` permanece `ABIERTO` (Crítica)**: aunque se eliminó `rawApiClient` y se corrigió `DetalleEventoRecuperacionClient.tsx` para leer `recursosAsignados` por `misionId`, el archivo `src/types/api-generated.d.ts` fue **editado manualmente** en lugar de regenerarse desde el spec OpenAPI `0.12.0` de `sgrai-api`. Esto introdujo una divergencia severa en `GET /api/eventos-atp/recuperacion`: `sgrai-api` retorna cada evento con `mision`, `patrulla` y `recursos` (sin `misiones`, `recursosAsignados`, `page`, `limit` ni `totalPages`), mientras que `api-generated.d.ts` y `listarEventosRecuperacion()` en `recuperacionService.ts` esperan `ev.misiones` y `ev.recursosAsignados`. En ejecución real contra `sgrai-api`, `listarEventosRecuperacion()` descarta la misión, patrulla y recursos de los eventos persistidos en el mapa operativo. Asimismo, `POST /api/eventos-atp/recuperacion/{id}/asignar` y `GET /{id}` en `api-generated.d.ts` omiten campos reales de `sgrai-api` (`esIndividual`, `cantidadEnUso`, `estadoRecurso`, `asignadoEn`, `id`, `creadoEn`) y mantienen cabeceras `x-user-id` deprecadas en OpenAPI `0.12.0`.

| Métrica de Calidad | Auditoría Inicial (`16/11/2026 23:52`) | Re-Test (`18/11/2026 16:30`) | Estado |
| :--- | :--- | :--- | :---: |
| **Total de Casos en Matriz** | 20 (`5` Defectos + `15` Casos) | 20 (`4` Corregidos + `1` Abierto + `15` Aprobados) | Evaluado |
| **Casos Aprobados / Corregidos** | 15 / 20 (`75.0%`) | 19 / 20 (`95.0%`) | Parcial |
| **Defectos Abiertos (`ABIERTO`)** | 5 (`2` Críticos, `2` Altos, `1` Medio) | 1 (`1` Crítico: `BUG-H32-WEB-01`) | **Rechazado** |
| **Suites Vitest HU-32 y Relacionadas** | 7 / 7 archivos (`43 / 43` tests) | 7 / 7 archivos (`52 / 52` tests) | Cumple (Aislado) |
| **Suite Global Vitest (`npm test -- --run`)** | 127 / 127 archivos (`813 / 813` tests) | 132 / 132 archivos (`895 / 895` tests) | Cumple |
| **Chequeo Estático (`npx tsc --noEmit`)** | 0 errores | 0 errores | Cumple |
| **Análisis Estático (`npm run lint`)** | 0 errores, 11 warnings ajenos | 0 errores, 0 warnings | Cumple |
| **Build de Producción (`npm run build`)** | Exitoso (`next build`) | Exitoso (`next build --webpack`, `47` rutas estáticas) | Cumple |
| **Sincronización con `origin/develop`** | 69 commits atrás | 0 commits atrás (`13` adelante) | Cumple |
| **Contrato OpenAPI & Integración `sgrai-api`** | 5 discrepancias | Divergencia crítica en `api-generated.d.ts` y `listarEventosRecuperacion` | **No Cumple** |

---

## 2. Registro Técnico de Defectos y Verificación de Re-Test

| ID Defecto | Título y Descripción Técnica del Defecto | Severidad | Archivo(s) Afectado(s) | Fecha Hallazgo | Estado | Fecha Re-Test | Solución / Commit | Dictamen Re-Test |
|---|---|:---:|---|:---:|:---:|:---:|---|---|
| `BUG-H32-WEB-01` | **Edición manual de `api-generated.d.ts` e incompatibilidad contractual en `GET /api/eventos-atp/recuperacion` y `POST .../asignar`:** Aunque en Re-Test se eliminó `rawApiClient` y `DetalleEventoRecuperacionClient.tsx` lee `recursosAsignados`, `src/types/api-generated.d.ts` fue editado a mano sin regenerarse desde `sgrai-api` (`openapi.json` v`0.12.0`). Como resultado, `GET /api/eventos-atp/recuperacion` en `api-generated.d.ts` y `listarEventosRecuperacion()` esperan `ev.misiones` y `ev.recursosAsignados` (y paginación `page`/`limit`/`totalPages`), cuando `sgrai-api` retorna `ev.mision`, `ev.patrulla` y `ev.recursos`. En runtime contra `sgrai-api`, `listarEventosRecuperacion()` descarta patrulla, misión e insumos de todos los eventos cargados en `KanbanBoard`. Adicionalmente, `api-generated.d.ts` omite campos de `POST .../asignar` (`esIndividual`, `cantidadEnUso`, `estadoRecurso`, `asignadoEn`) y declara `201`/`x-user-id` fuera del spec real. | Crítica | `src/types/api-generated.d.ts`, `src/services/recuperacionService.ts`, `src/types/recuperacion.ts` | 16/11/2026 23:44 | `ABIERTO` | (Pendiente) | Pendiente (Rechazado en Code Review) | **PARCIAL / REABIERTO:** Se subsanó el renderizado de `recursosAsignados` en `DetalleEventoRecuperacionClient` y el uso de `apiClient`, pero la edición manual de `api-generated.d.ts` rompió el mapeo de `listarEventosRecuperacion` frente a `sgrai-api`. |
| `BUG-H32-WEB-02` | **Falla de filtrado WebSocket `recuperacion:actualizada` (`payload.evento.id`) y falta de suscripción a sala `encargado`:** `useRecuperacionSocket.ts` inspeccionaba únicamente `payload.data.id` o `payload.id`, descartando eventos con `{ evento: { id, codigo }, ... }` cuando `eventoId` estaba presente, y no se unía a la sala `'encargado'`. | Crítica | `src/hooks/useRecuperacionSocket.ts`, `src/components/recuperacion/DetalleEventoRecuperacionClient.tsx`, `src/hooks/__tests__/useRecuperacionSocket.test.ts` | 16/11/2026 23:45 | `CORREGIDO` | 18/11/2026 16:30 | fix(recuperacion): resolver observaciones de QA para asignacion de recursos (HU-32) | **VERIFICADO:** `handleRecuperacionActualizada` extrae `obj.evento.id` y `obj.evento.codigo`, se une/sale de la sala `'encargado'`, `DetalleEventoRecuperacionClient` debouncifica `onRecursoActualizado` (`300ms`) y `useRecuperacionSocket.test.ts` aprueba `7/7` tests. *(Nota menor en `KanbanBoard.tsx`: fusionar también `obj.mision`, `obj.patrulla` y `obj.recursos` en el mapa ante `recuperacion:actualizada`).* |
| `BUG-H32-WEB-03` | **Política RBAC *Fail-Open* en `usePuedeAsignarMision`, identidad estática `DEFAULT_ENCARGADO_ID` y brecha perimetral en `/eventos-atp`:** `usePuedeAsignarMision` retornaba `true` por defecto y ante `AuthContext` autenticado sin permiso; `DetalleEventoRecuperacionClient` fijaba `DEFAULT_ENCARGADO_ID`; `proxy.ts` y `client.ts` excluían `/eventos-atp`. | Alta | `src/hooks/usePuedeAsignarMision.ts`, `src/hooks/__tests__/usePuedeAsignarMision.test.tsx`, `src/components/recuperacion/DetalleEventoRecuperacionClient.tsx`, `src/proxy.ts`, `src/lib/api/client.ts` | 16/11/2026 23:46 | `CORREGIDO` | 18/11/2026 16:30 | fix(recuperacion): resolver observaciones de QA para asignacion de recursos (HU-32) | **VERIFICADO:** `usePuedeAsignarMision` aplica *Fail-Closed* (`false` en `cargando`, sin permiso en `AuthContext`, o sin providers) con `6/6` tests; `DetalleEventoRecuperacionClient` resuelve `userId` desde `AuthContext`/`SimulatedSessionContext`; `proxy.ts` y `RUTAS_PROTEGIDAS` protegen `/eventos-atp`. |
| `BUG-H32-WEB-04` | **Bypass por escritura en `BuscadorRecursosSelect`, omisión de estado `ASIGNADO`, filtro `estado=DISPONIBLE` restrictivo y recorte CSS del desplegable:** El input seleccionaba ítems deshabilitados al escribir su nombre exacto, faltaba validar `ASIGNADO`, el filtro `estado=DISPONIBLE` ocultaba `BAJO_STOCK` y `EN_MANTENCION`, y `overflow-x: auto` recortaba el `listbox`. | Alta | `src/components/common/BuscadorRecursosSelect.tsx`, `src/components/common/__tests__/BuscadorRecursosSelect.test.tsx`, `src/components/recuperacion/DetalleEventoRecuperacionClient.tsx`, `src/components/mando/ModalCrearEventoRecuperacion.tsx`, `src/components/recuperacion/DetalleEventoRecuperacion.module.css` | 16/11/2026 23:47 | `CORREGIDO` | 18/11/2026 16:30 | fix(recuperacion): resolver observaciones de QA para asignacion de recursos (HU-32) | **VERIFICADO:** `esRecursoDeshabilitado` bloquea `ASIGNADO`, `EN_MANTENCION`, `NO_DISPONIBLE` y `stock <= 0` tanto por clic como por escritura (`9/9` tests); consultas de inventario omiten `estado: 'DISPONIBLE'`; `.recursosTableContainer` usa `overflow: visible`. |
| `BUG-H32-WEB-05` | **Inaccesibilidad de eventos de recuperación persistidos en `KanbanBoard` y desincronización ante `409 EVENTO_CERRADO`:** `KanbanBoard` no consultaba `GET /api/eventos-atp/recuperacion`, ante `409 EVENTO_CERRADO` no recargaba el detalle y se silenciaban errores de `patrullasService.listar`. | Media | `src/components/mando/KanbanBoard.tsx`, `src/services/recuperacionService.ts`, `src/components/recuperacion/DetalleEventoRecuperacionClient.tsx` | 16/11/2026 23:48 | `CORREGIDO` | 18/11/2026 16:30 | fix(recuperacion): resolver observaciones de QA para asignacion de recursos (HU-32) | **VERIFICADO:** `KanbanBoard` consulta `listarEventosRecuperacion` al montar y al refrescar; `DetalleEventoRecuperacionClient` ejecuta `cargarDetalleEvento()` en `EVENTO_CERRADO` y emite `showError` cuando `!resPatrullas.exito`. *(El mapeo completo de datos en `listarEventosRecuperacion` queda sujeto al cierre de `BUG-H32-WEB-01`).* |

---

## 3. Matriz Consolidada de Casos de Prueba (13 Columnas)

| ID Caso | Título del Caso de Prueba | Tipo de Prueba | Nivel | Prioridad | Precondición | Datos de Prueba (Payload / Headers / Query) | Resultado Esperado | Resultado Obtenido | Estado | Fecha / Hora Ejecución | Fecha / Hora Re-Test | Solución / Commit |
|---|---|---|---|---|---|---|---|---|:---:|:---:|:---:|---|
| `BUG-H32-WEB-01` | Edición manual de `api-generated.d.ts` e incompatibilidad contractual en `GET /api/eventos-atp/recuperacion` (`mision`/`patrulla`/`recursos` vs `misiones`/`recursosAsignados`) y `POST .../asignar` | Contrato OpenAPI / Integración (CA-1 / CA-6) | Servicio / Tipos | Crítica | Inspección de `api-generated.d.ts`, `recuperacionService.ts` y respuesta real de `listarEventosRecuperacionService()` en `sgrai-api` (OpenAPI `0.12.0`). | `GET /api/eventos-atp/recuperacion` retornando `{ total: 1, data: [{ id, mision: {...}, patrulla: {...}, recursos: [...] }] }` | `api-generated.d.ts` regenerado con `openapi-typescript` desde `sgrai-api`; `listarEventosRecuperacion` mapea `mision`, `patrulla` y `recursos` reales de la API. | En Re-Test: se eliminó `rawApiClient` y se corrigió `DetalleEventoRecuperacionClient` para `recursosAsignados`, pero `api-generated.d.ts` se editó a mano con un esquema erróneo para `GET /recuperacion` y `listarEventosRecuperacion` descarta `mision`, `patrulla` y `recursos` reales. | `ABIERTO` | 16/11/2026 23:50 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| `BUG-H32-WEB-02` | Coincidencia de `eventoId` en evento Socket `recuperacion:actualizada` (`payload.evento.id`) y suscripción a sala `encargado` | Tiempo Real / WebSocket (CA-7) | Hook / Integración | Crítica | Hook `useRecuperacionSocket({ eventoId: id, ... })` montado en `DetalleEventoRecuperacionClient` recibiendo eventos emitidos por `sgrai-api`. | Emit `recuperacion:actualizada` con `{ evento: { id: 'rec-123', codigo: 'REC-2026-0001' } }`, `recurso:actualizado` en sala `encargado` y `patrulla:actualizada` | `useRecuperacionSocket` extrae `payload.evento.id`, invoca `onRecuperacionActualizada`, se une/sale de sala `encargado` y aprueba pruebas unitarias HU-32. | En Re-Test: `handleRecuperacionActualizada` lee `obj.evento.id`/`codigo`, el hook gestiona sala `encargado`, la UI debouncifica `onRecursoActualizado` y `useRecuperacionSocket.test.ts` pasa `7/7` tests. | `CORREGIDO` | 16/11/2026 23:45 | 18/11/2026 16:30 | fix(recuperacion): resolver observaciones de QA para asignacion de recursos (HU-32) |
| `BUG-H32-WEB-03` | Política RBAC *Fail-Open* en `usePuedeAsignarMision`, resolución de `userId` de sesión y protección perimetral de `/eventos-atp` | Seguridad RBAC (CA-8) | Hook / Componente / Proxy | Alta | Usuario autenticado en `AuthContext` sin `misiones:asignar`, estado `cargando: true`, ausencia de providers o acceso de rol de terreno a `/eventos-atp/[id]`. | `AuthContext` `{ estaAutenticado: true, cargando: false, tienePermiso: () => false }`; `{ cargando: true }`; `DetalleEventoRecuperacionClient`; `proxy.ts` y `RUTAS_PROTEGIDAS` | `usePuedeAsignarMision` retorna `false` (*Fail-Closed*), `DetalleEventoRecuperacionClient` toma `userId` de sesión y `proxy.ts` redirige roles de terreno desde `/eventos-atp/*`. | En Re-Test: política *Fail-Closed* verificada con `6/6` tests en `usePuedeAsignarMision.test.tsx`, lectura de sesión en `DetalleEventoRecuperacionClient` y resguardo de `/eventos-atp` en `proxy.ts` y `client.ts`. | `CORREGIDO` | 16/11/2026 23:46 | 18/11/2026 16:30 | fix(recuperacion): resolver observaciones de QA para asignacion de recursos (HU-32) |
| `BUG-H32-WEB-04` | Bloqueo por teclado en `BuscadorRecursosSelect`, estado `ASIGNADO`, consulta sin filtro `estado=DISPONIBLE` y `overflow: visible` en tabla | Regla de Negocio §3.6 / UI (CA-3 / CA-5) | Componente / CSS | Alta | Catálogo con activo individual `EN_MANTENCION` o `ASIGNADO`, insumo `BAJO_STOCK` con saldo > 0 y tabla con 1 fila en `DetalleEventoRecuperacionClient`. | Escritura exacta `"Camión Aljibe Mercedes Benz"` y `"Bomba Sumergible Honda"` (`ASIGNADO`) en `combobox`; `getRecursos({ limite: 100, pagina: 1 })`; CSS `.recursosTableContainer` | Bloqueo por clic y teclado de activos `EN_MANTENCION`/`ASIGNADO`/`NO_DISPONIBLE` o sin stock; visibilidad de `BAJO_STOCK` útiles y desplegable sin recorte CSS. | En Re-Test: `esRecursoDeshabilitado` bloquea clic y teclado (`9/9` tests en `BuscadorRecursosSelect.test.tsx`), `DetalleEventoRecuperacionClient` valida `ASIGNADO` y consulta sin `estado: 'DISPONIBLE'`, y `.recursosTableContainer` usa `overflow: visible`. | `CORREGIDO` | 16/11/2026 23:47 | 18/11/2026 16:30 | fix(recuperacion): resolver observaciones de QA para asignacion de recursos (HU-32) |
| `BUG-H32-WEB-05` | Carga inicial de eventos persistidos en `KanbanBoard`, recarga del evento ante `409 EVENTO_CERRADO` y aviso ante fallo de patrullas | Funcional / Concurrencia (CA-1) | Vista / Servicio | Media | Centro de Mando al montar/refrescar o evento cerrado concurrentemente (`409 EVENTO_CERRADO`) o `patrullasService.listar` con `exito: false`. | `KanbanBoard` llamando a `listarEventosRecuperacion`; error `409 EVENTO_CERRADO`; `resPatrullas = { exito: false }` | `KanbanBoard` invoca `listarEventosRecuperacion` al montar y refrescar; `DetalleEventoRecuperacionClient` llama `cargarDetalleEvento()` en `EVENTO_CERRADO` y muestra `showError` si falla carga de patrullas. | En Re-Test: `KanbanBoard` invoca `listarEventosRecuperacion` al montar/refrescar y escucha `recuperacion:actualizada`; `DetalleEventoRecuperacionClient` recarga el evento en `EVENTO_CERRADO` y notifica error de patrullas (`1/1` test en servicio). | `CORREGIDO` | 16/11/2026 23:48 | 18/11/2026 16:30 | fix(recuperacion): resolver observaciones de QA para asignacion de recursos (HU-32) |
| `CP-H32-WEB-01` | Renderizado de vista de detalle `/eventos-atp/recuperacion/[id]` con ficha territorial, mapa read-only e historial de misiones y `recursosAsignados` | Funcional / UI (CA-1) | Página / Componente | Alta | Evento `REC-2026-0001` (`PLANIFICADA`) en sector Collico con 1 misión previa y `recursosAsignados` vinculados por `misionId`. | `id="rec-1234"`, `mockDetalleEvento` con `misiones` y `recursosAsignados` (`misionId: 'mis-10'`) | Despliega código, badges de prioridad/estado, sector, delegación, 6 familias, `LocationPickerMap` en modo `readOnly`, tarjeta `MIS-2026-0001` y chip `Frazadas de Lana: 12 un.`. | Página server async y componente cliente renderizan ficha territorial, mapa y materiales vinculados por `misionId` en `DetalleEventoRecuperacionClient.test.tsx`. | `APROBADO` | 16/11/2026 23:44 | 18/11/2026 16:30 | fix(recuperacion): resolver observaciones de QA para asignacion de recursos (HU-32) |
| `CP-H32-WEB-02` | Enlace de acceso directo desde popup de marcador en `MapaOperativoMandoInner` hacia `/eventos-atp/recuperacion/[id]` | Funcional / Navegación (CA-1) | Componente / GIS | Media | Evento de recuperación desplegado como marcador esmeralda en el mapa táctico del Centro de Mando. | Marcador de evento `rec.id` renderizado en `MapaOperativoMandoInner.tsx` | El popup incluye el botón `<a href="/eventos-atp/recuperacion/${rec.id}">Ver Detalle y Asignar Recursos</a>` y `KanbanBoard` cambia a vista mapa al crear evento. | Enlace presente en el HTML del popup cartográfico y cambio automático `setVistaActiva('mapa')` verificado en `KanbanBoard.tsx`. | `APROBADO` | 16/11/2026 23:44 | - | fix(recuperacion): cargar patrullas reales desde sgrai-api y abrir mapa al despachar |
| `CP-H32-WEB-03` | Filtrado defensivo y deduplicación por ID de patrullas verificadoras disponibles en selector operativo | Funcional / Integración (CA-2) | Componente | Alta | Respuesta de `patrullasService.listar` con unidades `DISPONIBLE`, `EN_VERIFICACION` e IDs potencialmente duplicados. | `[ { id: 'pat-disponible-1', estado: 'DISPONIBLE' }, { id: 'pat-ocupada-2', estado: 'EN_VERIFICACION' } ]` | El `<select id="selector-patrulla">` lista exclusivamente patrullas en estado `DISPONIBLE` sin claves duplicadas. | `Patrulla Centro-Sur` figura disponible en el selector y `Patrulla Costa-1` (`EN_VERIFICACION`) queda excluida. | `APROBADO` | 16/11/2026 23:44 | - | fix(recuperacion): deduplicar patrullas y recursos por ID para evitar keys duplicadas |
| `CP-H32-WEB-04` | Bloqueo de cantidad en 1 unidad para activos individuales y validación de stock visible para insumos a granel | Regla de Negocio §3.6 (CA-3 / CA-4 / CA-5) | Componente | Crítica | Inventario con `Motobomba de Achique 3"` (`esIndividual: true`) y `Sacos de Arena 25kg` (`cantidadInventario: 50, cantidadEnUso: 10`). | Selección de `rec-bomba` y luego `rec-sacos` ingresando cantidad `55` | Para activos individuales el `spinbutton` queda fijado en `1` y `disabled`; para granel muestra `40 disponibles` y alerta al superar `40`. | Input bloqueado en `1` con etiqueta `1 Activo` para motobomba; alerta `"Supera el stock disponible en bodega (máx. 40)"` y botón submit deshabilitado al ingresar `55`. | `APROBADO` | 16/11/2026 23:51 | - | test(recuperacion): agregar pruebas unitarias e integracion para HU-32 |
| `CP-H32-WEB-05` | Gestión dinámica de filas de insumos y bloqueo de duplicados dentro del mismo despacho | Funcional / Validación (CA-3) | Componente | Media | Formulario de asignación abierto en `DetalleEventoRecuperacionClient`. | Clic en `"Agregar Otro Insumo"`, selección repetida del mismo `recursoId`, clic en `"Eliminar insumo"` | Agrega nueva fila con ID temporal único, impide eliminar la última fila restante y bloquea el envío si existe el mismo `recursoId` en más de una fila. | Se añaden y eliminan filas dinámicamente y `calcularValidacionFormulario` valida duplicidad por `Set<string>`. | `APROBADO` | 16/11/2026 23:44 | - | feat(recuperacion): implementar vista de detalle y asignacion de patrullas y recursos a evento de recuperacion (HU-32) |
| `CP-H32-WEB-06` | Búsqueda predictiva en tiempo real, deduplicación por ID y bloqueo por clic para ítems `EN_MANTENCION`, `ASIGNADO` o sin stock en `BuscadorRecursosSelect` | Funcional / UI (CA-3 / CA-5) | Componente | Alta | Catálogo mixto pasado a `BuscadorRecursosSelect` incluyendo `Camión Aljibe` (`EN_MANTENCION`), `Bomba Sumergible` (`ASIGNADO`) y `Generador 5kVA` (`stock: 0`). | Escritura `"motosierra"`, `"helicoptero"` y clic en opciones deshabilitadas | Filtra coincidencias en vivo, muestra mensaje vacío si no hay resultados, selecciona opciones válidas e ignora clics en opciones deshabilitadas. | Las 9 pruebas unitarias de `BuscadorRecursosSelect.test.tsx` aprueban en 448ms verificando filtrado, limpieza y bloqueo por clic/teclado. | `APROBADO` | 16/11/2026 23:44 | 18/11/2026 16:26 | fix(recuperacion): resolver observaciones de QA para asignacion de recursos (HU-32) |
| `CP-H32-WEB-07` | Despacho exitoso de misión `RECUPERACION` mediante `asignarRecursosRecuperacion`, notificación Toast y reinicio del formulario | Funcional / Servicio (CA-2 / CA-6) | Servicio / Componente | Crítica | Evento `PLANIFICADA`, patrulla `pat-disponible-1` y 10 unidades de `rec-sacos` válidos. | `POST /api/eventos-atp/recuperacion/rec-1234/asignar` con `{ patrullaId: 'pat-disponible-1', recursos: [{ recursoId: 'rec-sacos', cantidad: 10 }] }` | Servicio procesa respuesta de éxito con `tipoMision: 'RECUPERACION'` y patrulla en `'EN_RECUPERACION'`; UI emite Toast con código `MIS-2026-0002`, limpia formulario y recarga detalle. | Invocación exacta verificada en `DetalleEventoRecuperacionClient.test.tsx` y `recuperacionService.test.ts` con retorno esperado. | `APROBADO` | 16/11/2026 23:44 | - | test(recuperacion): agregar pruebas unitarias e integracion para HU-32 |
| `CP-H32-WEB-08` | Clasificación y despliegue de alerta ante conflicto `409 Conflict` por sobregiro de stock (`STOCK_INSUFICIENTE`) | Concurrencia §3.6 (CA-4) | Servicio / Componente | Crítica | Petición `POST .../asignar` rechazada concurrentemente con HTTP `409` indicando stock insuficiente. | Respuesta `409` `{ message: 'Stock insuficiente para el recurso en bodega' }` | `asignarRecursosRecuperacion` lanza `RecuperacionServiceError` con `tipoConflicto: 'STOCK_INSUFICIENTE'`; UI muestra banner de error, Toast y recarga catálogos. | Clasificación correcta en servicio y renderizado de banner `"El stock en bodega cambió concurrentemente..."` verificado en Vitest. | `APROBADO` | 16/11/2026 23:51 | - | feat(recuperacion): agregar modelos, servicio y soporte websocket para asignacion de recursos (HU-32) |
| `CP-H32-WEB-09` | Clasificación de conflicto `409 Conflict` para activo en mantención (`ACTIVO_NO_DISPONIBLE`) y patrulla ocupada (`PATRULLA_OCUPADA`) | Concurrencia / Regla ICS (CA-2 / CA-5) | Servicio / API | Crítica | Activo individual en `EN_MANTENCION` o patrulla en `EN_VERIFICACION` en `sgrai-api` (`f1000000-0000-4000-8000-000000000002`). | `POST .../asignar` en mock (activo mantención) y cURL real a `http://localhost:3001/api/eventos-atp/recuperacion/5837deb6-fe38-4b28-847c-0a59f4b0e602/asignar` con patrulla `EN_VERIFICACION` | Servicio tipa `ACTIVO_NO_DISPONIBLE` y `PATRULLA_OCUPADA`; endpoint retorna `409 Conflict` con detalle de estado de la patrulla. | Servicio clasifica `ACTIVO_NO_DISPONIBLE` en Vitest y `sgrai-api` retorna `409 Conflict` indicando `(estado actual: EN_VERIFICACION)`. | `APROBADO` | 16/11/2026 23:51 | - | feat(recuperacion): agregar modelos, servicio y soporte websocket para asignacion de recursos (HU-32) |
| `CP-H32-WEB-10` | Bloqueo del formulario de asignación cuando el evento se encuentra en estado `COMPLETADA` o `CANCELADA` | Regla de Negocio (CA-1) | Componente | Alta | Evento recuperado con `estado: 'COMPLETADA'` o `'CANCELADA'`. | `mockDetalleEvento` con `estado: 'COMPLETADA'` en `DetalleEventoRecuperacionClient` | Oculta el formulario y el botón `"Confirmar y Despachar Misión"`, mostrando `InlineNotice` informativo de operación cerrada. | Formulario no se renderiza en el DOM y se despliega el aviso de estado cerrado. | `APROBADO` | 16/11/2026 23:44 | - | feat(recuperacion): implementar vista de detalle y asignacion de patrullas y recursos a evento de recuperacion (HU-32) |
| `CP-H32-WEB-11` | Ocultamiento preventivo del formulario en UI cuando `usePuedeAsignarMision` evalúa `false` en `AuthContext` o `SimulatedSessionContext` | Seguridad RBAC (CA-8) | Hook / Componente | Alta | Usuario autenticado o simulado sin `misiones:asignar` ni `esAdmin`. | `AuthContext` / `SimulatedSessionContext` sin permiso `misiones:asignar` | `usePuedeAsignarMision` retorna `false` y `DetalleEventoRecuperacionClient` reemplaza el formulario por aviso requiriendo `misiones:asignar`. | Hook retorna `false` en los 4 escenarios negativos de `usePuedeAsignarMision.test.tsx` y UI oculta el botón de despacho en `DetalleEventoRecuperacionClient.test.tsx`. | `APROBADO` | 16/11/2026 23:51 | 18/11/2026 16:30 | fix(recuperacion): resolver observaciones de QA para asignacion de recursos (HU-32) |
| `CP-H32-WEB-12` | Validación de rechazo `403 Forbidden` sin `misiones:asignar` y `401 Unauthorized` sin token Bearer | Seguridad RBAC (CA-8) | Servicio / API | Crítica | Petición `POST .../asignar` sin cabecera `Authorization` o con token JWT de usuario Call Center (`callcenter@valdivia.cl`). | cURL sin token y cURL con `Authorization: Bearer <TOKEN_CALL_CENTER>` a `http://localhost:3001/api/eventos-atp/recuperacion/5837deb6-fe38-4b28-847c-0a59f4b0e602/asignar` | Backend responde `401` sin Bearer y `403` indicando permiso `misiones:asignar`; `recuperacionService` arroja `RecuperacionServiceError` con `statusCode: 403`. | `sgrai-api` respondió `401 Unauthorized` y `403 Forbidden` (`No cuenta con el permiso requerido: misiones:asignar`); servicio maneja `403` en Vitest. | `APROBADO` | 16/11/2026 23:51 | - | feat(recuperacion): agregar modelos, servicio y soporte websocket para asignacion de recursos (HU-32) |
| `CP-H32-WEB-13` | Manejo de errores `404 Not Found` y `400 Bad Request` en consulta de detalle y asignación de recursos | Robustez / Contrato | Servicio / API | Media | UUID de evento inexistente o payload inválido (`patrullaId: "no-uuid"`, `recursos: []`). | cURL `400`/`404` contra `sgrai-api` y caso `404` en `recuperacionService.test.ts` | Backend responde `400` con arreglo `errors` por campo y `404` si no existe el evento; servicio controla `404` y mapea `fieldErrors` en `400`. | Respuestas `400` y `404` verificadas en vivo contra `sgrai-api` y captura de `404` validada en `recuperacionService.test.ts`. | `APROBADO` | 16/11/2026 23:51 | - | test(recuperacion): agregar pruebas unitarias e integracion para HU-32 |
| `CP-H32-WEB-14` | Chequeo de tipos TypeScript, análisis estático ESLint y compilación de producción Next.js Webpack | Calidad de Código / CI | Estático / Build | Alta | Código fuente sincronizado con `origin/develop` en `feature/H32-asignar-recursos-recuperacion`. | `npm run lint`, `npx tsc --noEmit` y `npm run build` | `0` errores y `0` warnings en ESLint, `0` errores en TypeScript y compilación de producción exitosa. | `npm run lint` (`0` errores, `0` warnings), `npx tsc --noEmit` (`exit 0`) y `npm run build` (`47` páginas estáticas + ruta dinámica `/eventos-atp/recuperacion/[id]`). | `APROBADO` | 16/11/2026 23:45 | 18/11/2026 16:30 | Merge remote-tracking branch 'origin/develop' into feature/H32-asignar-recursos-recuperacion |
| `CP-H32-WEB-15` | Conformidad con guía visual municipal (`GEMINI.md`) y presencia de manual de usuario `H32-asignar-recursos-recuperacion.md` | Estándar UI / Docs | UI / Documentación | Media | Inspección de `.tsx`, `.module.css` y `docs/manuals/H32-asignar-recursos-recuperacion.md`. | Uso de `Heading`, `Button`, `border-radius: 0px`, paleta `#1B6F7D`, iconos `lucide-react` sin emojis y manual H32 | Sin emojis en UI, esquinas rectas `0px`, uso de tokens CSS institucionales y manual operativo H32 documentado. | Iconografía exclusiva de `lucide-react`, radios `0px` en CSS Modules, tokens institucionales aplicados y manual H32 presente en `docs/manuals/`. | `APROBADO` | 16/11/2026 23:47 | - | docs(manuals): crear manual de usuario H32 para asignacion de recursos a recuperacion |

---

## 4. Bloque TSV

````tsv
ID Caso	Título del Caso de Prueba	Tipo de Prueba	Nivel	Prioridad	Precondición	Datos de Prueba (Payload / Headers / Query)	Resultado Esperado	Resultado Obtenido	Estado	Fecha / Hora Ejecución	Fecha / Hora Re-Test	Solución / Commit
BUG-H32-WEB-01	Edición manual de api-generated.d.ts e incompatibilidad contractual en GET /api/eventos-atp/recuperacion (mision/patrulla/recursos vs misiones/recursosAsignados) y POST .../asignar	Contrato OpenAPI / Integración (CA-1 / CA-6)	Servicio / Tipos	Crítica	Inspección de api-generated.d.ts, recuperacionService.ts y respuesta real de listarEventosRecuperacionService() en sgrai-api (OpenAPI 0.12.0).	GET /api/eventos-atp/recuperacion retornando { total: 1, data: [{ id, mision: {...}, patrulla: {...}, recursos: [...] }] }	api-generated.d.ts regenerado con openapi-typescript desde sgrai-api; listarEventosRecuperacion mapea mision, patrulla y recursos reales de la API.	En Re-Test: se eliminó rawApiClient y se corrigió DetalleEventoRecuperacionClient para recursosAsignados, pero api-generated.d.ts se editó a mano con un esquema erróneo para GET /recuperacion y listarEventosRecuperacion descarta mision, patrulla y recursos reales.	ABIERTO	16/11/2026 23:50	(Pendiente)	Pendiente (Rechazado en Code Review)
BUG-H32-WEB-02	Coincidencia de eventoId en evento Socket recuperacion:actualizada (payload.evento.id) y suscripción a sala encargado	Tiempo Real / WebSocket (CA-7)	Hook / Integración	Crítica	Hook useRecuperacionSocket({ eventoId: id, ... }) montado en DetalleEventoRecuperacionClient recibiendo eventos emitidos por sgrai-api.	Emit recuperacion:actualizada con { evento: { id: 'rec-123', codigo: 'REC-2026-0001' } }, recurso:actualizado en sala encargado y patrulla:actualizada	useRecuperacionSocket extrae payload.evento.id, invoca onRecuperacionActualizada, se une/sale de sala encargado y aprueba pruebas unitarias HU-32.	En Re-Test: handleRecuperacionActualizada lee obj.evento.id/codigo, el hook gestiona sala encargado, la UI debouncifica onRecursoActualizado y useRecuperacionSocket.test.ts pasa 7/7 tests.	CORREGIDO	16/11/2026 23:45	18/11/2026 16:30	fix(recuperacion): resolver observaciones de QA para asignacion de recursos (HU-32)
BUG-H32-WEB-03	Política RBAC Fail-Open en usePuedeAsignarMision, resolución de userId de sesión y protección perimetral de /eventos-atp	Seguridad RBAC (CA-8)	Hook / Componente / Proxy	Alta	Usuario autenticado en AuthContext sin misiones:asignar, estado cargando: true, ausencia de providers o acceso de rol de terreno a /eventos-atp/[id].	AuthContext { estaAutenticado: true, cargando: false, tienePermiso: () => false }; { cargando: true }; DetalleEventoRecuperacionClient; proxy.ts y RUTAS_PROTEGIDAS	usePuedeAsignarMision retorna false (Fail-Closed), DetalleEventoRecuperacionClient toma userId de sesión y proxy.ts redirige roles de terreno desde /eventos-atp/*.	En Re-Test: política Fail-Closed verificada con 6/6 tests en usePuedeAsignarMision.test.tsx, lectura de sesión en DetalleEventoRecuperacionClient y resguardo de /eventos-atp en proxy.ts y client.ts.	CORREGIDO	16/11/2026 23:46	18/11/2026 16:30	fix(recuperacion): resolver observaciones de QA para asignacion de recursos (HU-32)
BUG-H32-WEB-04	Bloqueo por teclado en BuscadorRecursosSelect, estado ASIGNADO, consulta sin filtro estado=DISPONIBLE y overflow: visible en tabla	Regla de Negocio §3.6 / UI (CA-3 / CA-5)	Componente / CSS	Alta	Catálogo con activo individual EN_MANTENCION o ASIGNADO, insumo BAJO_STOCK con saldo > 0 y tabla con 1 fila en DetalleEventoRecuperacionClient.	Escritura exacta "Camión Aljibe Mercedes Benz" y "Bomba Sumergible Honda" (ASIGNADO) en combobox; getRecursos({ limite: 100, pagina: 1 }); CSS .recursosTableContainer	Bloqueo por clic y teclado de activos EN_MANTENCION/ASIGNADO/NO_DISPONIBLE o sin stock; visibilidad de BAJO_STOCK útiles y desplegable sin recorte CSS.	En Re-Test: esRecursoDeshabilitado bloquea clic y teclado (9/9 tests en BuscadorRecursosSelect.test.tsx), DetalleEventoRecuperacionClient valida ASIGNADO y consulta sin estado: 'DISPONIBLE', y .recursosTableContainer usa overflow: visible.	CORREGIDO	16/11/2026 23:47	18/11/2026 16:30	fix(recuperacion): resolver observaciones de QA para asignacion de recursos (HU-32)
BUG-H32-WEB-05	Carga inicial de eventos persistidos en KanbanBoard, recarga del evento ante 409 EVENTO_CERRADO y aviso ante fallo de patrullas	Funcional / Concurrencia (CA-1)	Vista / Servicio	Media	Centro de Mando al montar/refrescar o evento cerrado concurrentemente (409 EVENTO_CERRADO) o patrullasService.listar con exito: false.	KanbanBoard llamando a listarEventosRecuperacion; error 409 EVENTO_CERRADO; resPatrullas = { exito: false }	KanbanBoard invoca listarEventosRecuperacion al montar y refrescar; DetalleEventoRecuperacionClient llama cargarDetalleEvento() en EVENTO_CERRADO y muestra showError si falla carga de patrullas.	En Re-Test: KanbanBoard invoca listarEventosRecuperacion al montar/refrescar y escucha recuperacion:actualizada; DetalleEventoRecuperacionClient recarga el evento en EVENTO_CERRADO y notifica error de patrullas (1/1 test en servicio).	CORREGIDO	16/11/2026 23:48	18/11/2026 16:30	fix(recuperacion): resolver observaciones de QA para asignacion de recursos (HU-32)
CP-H32-WEB-01	Renderizado de vista de detalle /eventos-atp/recuperacion/[id] con ficha territorial, mapa read-only e historial de misiones y recursosAsignados	Funcional / UI (CA-1)	Página / Componente	Alta	Evento REC-2026-0001 (PLANIFICADA) en sector Collico con 1 misión previa y recursosAsignados vinculados por misionId.	id="rec-1234", mockDetalleEvento con misiones y recursosAsignados (misionId: 'mis-10')	Despliega código, badges de prioridad/estado, sector, delegación, 6 familias, LocationPickerMap en modo readOnly, tarjeta MIS-2026-0001 y chip Frazadas de Lana: 12 un..	Página server async y componente cliente renderizan ficha territorial, mapa y materiales vinculados por misionId en DetalleEventoRecuperacionClient.test.tsx.	APROBADO	16/11/2026 23:44	18/11/2026 16:30	fix(recuperacion): resolver observaciones de QA para asignacion de recursos (HU-32)
CP-H32-WEB-02	Enlace de acceso directo desde popup de marcador en MapaOperativoMandoInner hacia /eventos-atp/recuperacion/[id]	Funcional / Navegación (CA-1)	Componente / GIS	Media	Evento de recuperación desplegado como marcador esmeralda en el mapa táctico del Centro de Mando.	Marcador de evento rec.id renderizado en MapaOperativoMandoInner.tsx	El popup incluye el botón <a href="/eventos-atp/recuperacion/${rec.id}">Ver Detalle y Asignar Recursos</a> y KanbanBoard cambia a vista mapa al crear evento.	Enlace presente en el HTML del popup cartográfico y cambio automático setVistaActiva('mapa') verificado en KanbanBoard.tsx.	APROBADO	16/11/2026 23:44	-	fix(recuperacion): cargar patrullas reales desde sgrai-api y abrir mapa al despachar
CP-H32-WEB-03	Filtrado defensivo y deduplicación por ID de patrullas verificadoras disponibles en selector operativo	Funcional / Integración (CA-2)	Componente	Alta	Respuesta de patrullasService.listar con unidades DISPONIBLE, EN_VERIFICACION e IDs potencialmente duplicados.	[ { id: 'pat-disponible-1', estado: 'DISPONIBLE' }, { id: 'pat-ocupada-2', estado: 'EN_VERIFICACION' } ]	El <select id="selector-patrulla"> lista exclusivamente patrullas en estado DISPONIBLE sin claves duplicadas.	Patrulla Centro-Sur figura disponible en el selector y Patrulla Costa-1 (EN_VERIFICACION) queda excluida.	APROBADO	16/11/2026 23:44	-	fix(recuperacion): deduplicar patrullas y recursos por ID para evitar keys duplicadas
CP-H32-WEB-04	Bloqueo de cantidad en 1 unidad para activos individuales y validación de stock visible para insumos a granel	Regla de Negocio §3.6 (CA-3 / CA-4 / CA-5)	Componente	Crítica	Inventario con Motobomba de Achique 3" (esIndividual: true) y Sacos de Arena 25kg (cantidadInventario: 50, cantidadEnUso: 10).	Selección de rec-bomba y luego rec-sacos ingresando cantidad 55	Para activos individuales el spinbutton queda fijado en 1 y disabled; para granel muestra 40 disponibles y alerta al superar 40.	Input bloqueado en 1 con etiqueta 1 Activo para motobomba; alerta "Supera el stock disponible en bodega (máx. 40)" y botón submit deshabilitado al ingresar 55.	APROBADO	16/11/2026 23:51	-	test(recuperacion): agregar pruebas unitarias e integracion para HU-32
CP-H32-WEB-05	Gestión dinámica de filas de insumos y bloqueo de duplicados dentro del mismo despacho	Funcional / Validación (CA-3)	Componente	Media	Formulario de asignación abierto en DetalleEventoRecuperacionClient.	Clic en "Agregar Otro Insumo", selección repetida del mismo recursoId, clic en "Eliminar insumo"	Agrega nueva fila con ID temporal único, impide eliminar la última fila restante y bloquea el envío si existe el mismo recursoId en más de una fila.	Se añaden y eliminan filas dinámicamente y calcularValidacionFormulario valida duplicidad por Set<string>.	APROBADO	16/11/2026 23:44	-	feat(recuperacion): implementar vista de detalle y asignacion de patrullas y recursos a evento de recuperacion (HU-32)
CP-H32-WEB-06	Búsqueda predictiva en tiempo real, deduplicación por ID y bloqueo por clic para ítems EN_MANTENCION, ASIGNADO o sin stock en BuscadorRecursosSelect	Funcional / UI (CA-3 / CA-5)	Componente	Alta	Catálogo mixto pasado a BuscadorRecursosSelect incluyendo Camión Aljibe (EN_MANTENCION), Bomba Sumergible (ASIGNADO) y Generador 5kVA (stock: 0).	Escritura "motosierra", "helicoptero" y clic en opciones deshabilitadas	Filtra coincidencias en vivo, muestra mensaje vacío si no hay resultados, selecciona opciones válidas e ignora clics en opciones deshabilitadas.	Las 9 pruebas unitarias de BuscadorRecursosSelect.test.tsx aprueban en 448ms verificando filtrado, limpieza y bloqueo por clic/teclado.	APROBADO	16/11/2026 23:44	18/11/2026 16:26	fix(recuperacion): resolver observaciones de QA para asignacion de recursos (HU-32)
CP-H32-WEB-07	Despacho exitoso de misión RECUPERACION mediante asignarRecursosRecuperacion, notificación Toast y reinicio del formulario	Funcional / Servicio (CA-2 / CA-6)	Servicio / Componente	Crítica	Evento PLANIFICADA, patrulla pat-disponible-1 y 10 unidades de rec-sacos válidos.	POST /api/eventos-atp/recuperacion/rec-1234/asignar con { patrullaId: 'pat-disponible-1', recursos: [{ recursoId: 'rec-sacos', cantidad: 10 }] }	Servicio procesa respuesta de éxito con tipoMision: 'RECUPERACION' y patrulla en 'EN_RECUPERACION'; UI emite Toast con código MIS-2026-0002, limpia formulario y recarga detalle.	Invocación exacta verificada en DetalleEventoRecuperacionClient.test.tsx y recuperacionService.test.ts con retorno esperado.	APROBADO	16/11/2026 23:44	-	test(recuperacion): agregar pruebas unitarias e integracion para HU-32
CP-H32-WEB-08	Clasificación y despliegue de alerta ante conflicto 409 Conflict por sobregiro de stock (STOCK_INSUFICIENTE)	Concurrencia §3.6 (CA-4)	Servicio / Componente	Crítica	Petición POST .../asignar rechazada concurrentemente con HTTP 409 indicando stock insuficiente.	Respuesta 409 { message: 'Stock insuficiente para el recurso en bodega' }	asignarRecursosRecuperacion lanza RecuperacionServiceError con tipoConflicto: 'STOCK_INSUFICIENTE'; UI muestra banner de error, Toast y recarga catálogos.	Clasificación correcta en servicio y renderizado de banner "El stock en bodega cambió concurrentemente..." verificado en Vitest.	APROBADO	16/11/2026 23:51	-	feat(recuperacion): agregar modelos, servicio y soporte websocket para asignacion de recursos (HU-32)
CP-H32-WEB-09	Clasificación de conflicto 409 Conflict para activo en mantención (ACTIVO_NO_DISPONIBLE) y patrulla ocupada (PATRULLA_OCUPADA)	Concurrencia / Regla ICS (CA-2 / CA-5)	Servicio / API	Crítica	Activo individual en EN_MANTENCION o patrulla en EN_VERIFICACION en sgrai-api (f1000000-0000-4000-8000-000000000002).	POST .../asignar en mock (activo mantención) y cURL real a http://localhost:3001/api/eventos-atp/recuperacion/5837deb6-fe38-4b28-847c-0a59f4b0e602/asignar con patrulla EN_VERIFICACION	Servicio tipa ACTIVO_NO_DISPONIBLE y PATRULLA_OCUPADA; endpoint retorna 409 Conflict con detalle de estado de la patrulla.	Servicio clasifica ACTIVO_NO_DISPONIBLE en Vitest y sgrai-api retorna 409 Conflict indicando (estado actual: EN_VERIFICACION).	APROBADO	16/11/2026 23:51	-	feat(recuperacion): agregar modelos, servicio y soporte websocket para asignacion de recursos (HU-32)
CP-H32-WEB-10	Bloqueo del formulario de asignación cuando el evento se encuentra en estado COMPLETADA o CANCELADA	Regla de Negocio (CA-1)	Componente	Alta	Evento recuperado con estado: 'COMPLETADA' o 'CANCELADA'.	mockDetalleEvento con estado: 'COMPLETADA' en DetalleEventoRecuperacionClient	Oculta el formulario y el botón "Confirmar y Despachar Misión", mostrando InlineNotice informativo de operación cerrada.	Formulario no se renderiza en el DOM y se despliega el aviso de estado cerrado.	APROBADO	16/11/2026 23:44	-	feat(recuperacion): implementar vista de detalle y asignacion de patrullas y recursos a evento de recuperacion (HU-32)
CP-H32-WEB-11	Ocultamiento preventivo del formulario en UI cuando usePuedeAsignarMision evalúa false en AuthContext o SimulatedSessionContext	Seguridad RBAC (CA-8)	Hook / Componente	Alta	Usuario autenticado o simulado sin misiones:asignar ni esAdmin.	AuthContext / SimulatedSessionContext sin permiso misiones:asignar	usePuedeAsignarMision retorna false y DetalleEventoRecuperacionClient reemplaza el formulario por aviso requiriendo misiones:asignar.	Hook retorna false en los 4 escenarios negativos de usePuedeAsignarMision.test.tsx y UI oculta el botón de despacho en DetalleEventoRecuperacionClient.test.tsx.	APROBADO	16/11/2026 23:51	18/11/2026 16:30	fix(recuperacion): resolver observaciones de QA para asignacion de recursos (HU-32)
CP-H32-WEB-12	Validación de rechazo 403 Forbidden sin misiones:asignar y 401 Unauthorized sin token Bearer	Seguridad RBAC (CA-8)	Servicio / API	Crítica	Petición POST .../asignar sin cabecera Authorization o con token JWT de usuario Call Center (callcenter@valdivia.cl).	cURL sin token y cURL con Authorization: Bearer <TOKEN_CALL_CENTER> a http://localhost:3001/api/eventos-atp/recuperacion/5837deb6-fe38-4b28-847c-0a59f4b0e602/asignar	Backend responde 401 sin Bearer y 403 indicando permiso misiones:asignar; recuperacionService arroja RecuperacionServiceError con statusCode: 403.	sgrai-api respondió 401 Unauthorized y 403 Forbidden (No cuenta con el permiso requerido: misiones:asignar); servicio maneja 403 en Vitest.	APROBADO	16/11/2026 23:51	-	feat(recuperacion): agregar modelos, servicio y soporte websocket para asignacion de recursos (HU-32)
CP-H32-WEB-13	Manejo de errores 404 Not Found y 400 Bad Request en consulta de detalle y asignación de recursos	Robustez / Contrato	Servicio / API	Media	UUID de evento inexistente o payload inválido (patrullaId: "no-uuid", recursos: []).	cURL 400/404 contra sgrai-api y caso 404 en recuperacionService.test.ts	Backend responde 400 con arreglo errors por campo y 404 si no existe el evento; servicio controla 404 y mapea fieldErrors en 400.	Respuestas 400 y 404 verificadas en vivo contra sgrai-api y captura de 404 validada en recuperacionService.test.ts.	APROBADO	16/11/2026 23:51	-	test(recuperacion): agregar pruebas unitarias e integracion para HU-32
CP-H32-WEB-14	Chequeo de tipos TypeScript, análisis estático ESLint y compilación de producción Next.js Webpack	Calidad de Código / CI	Estático / Build	Alta	Código fuente sincronizado con origin/develop en feature/H32-asignar-recursos-recuperacion.	npm run lint, npx tsc --noEmit y npm run build	0 errores y 0 warnings en ESLint, 0 errores en TypeScript y compilación de producción exitosa.	npm run lint (0 errores, 0 warnings), npx tsc --noEmit (exit 0) y npm run build (47 páginas estáticas + ruta dinámica /eventos-atp/recuperacion/[id]).	APROBADO	16/11/2026 23:45	18/11/2026 16:30	Merge remote-tracking branch 'origin/develop' into feature/H32-asignar-recursos-recuperacion
CP-H32-WEB-15	Conformidad con guía visual municipal (GEMINI.md) y presencia de manual de usuario H32-asignar-recursos-recuperacion.md	Estándar UI / Docs	UI / Documentación	Media	Inspección de .tsx, .module.css y docs/manuals/H32-asignar-recursos-recuperacion.md.	Uso de Heading, Button, border-radius: 0px, paleta #1B6F7D, iconos lucide-react sin emojis y manual H32	Sin emojis en UI, esquinas rectas 0px, uso de tokens CSS institucionales y manual operativo H32 documentado.	Iconografía exclusiva de lucide-react, radios 0px en CSS Modules, tokens institucionales aplicados y manual H32 presente en docs/manuals/.	APROBADO	16/11/2026 23:47	-	docs(manuals): crear manual de usuario H32 para asignacion de recursos a recuperacion
````

---

## 5. Guía de Ejecución Paso a Paso y Evidencias Replicables (Re-Test)

### 5.1. Ejecución de Suites Automatizadas de HU-32 en Vitest

#### Comando consolidado de las 7 suites vinculadas a HU-32
```bash
npx vitest run src/services/__tests__/recuperacionService.test.ts src/components/recuperacion/__tests__/DetalleEventoRecuperacionClient.test.tsx src/components/common/__tests__/BuscadorRecursosSelect.test.tsx src/hooks/__tests__/usePuedeAsignarMision.test.tsx src/hooks/__tests__/useRecuperacionSocket.test.ts src/app/\(mando\)/eventos-atp/recuperacion/\[id\]/__tests__/page.test.tsx src/components/mando/__tests__/ModalCrearEventoRecuperacion.test.tsx
```

**Evidencia obtenida en consola (Re-Test):**
```text
 ✓ src/hooks/__tests__/useRecuperacionSocket.test.ts (7 tests) 41ms
 ✓ src/services/__tests__/recuperacionService.test.ts (13 tests) 14ms
 ✓ src/app/(mando)/eventos-atp/recuperacion/[id]/__tests__/page.test.tsx (2 tests) 30ms
 ✓ src/hooks/__tests__/usePuedeAsignarMision.test.tsx (6 tests) 39ms
 ✓ src/components/common/__tests__/BuscadorRecursosSelect.test.tsx (9 tests) 448ms
 ✓ src/components/mando/__tests__/ModalCrearEventoRecuperacion.test.tsx (7 tests) 997ms
 ✓ src/components/recuperacion/__tests__/DetalleEventoRecuperacionClient.test.tsx (8 tests) 1009ms

 Test Files  7 passed (7)
      Tests  52 passed (52)
   Start at  16:26:48
   Duration  2.91s (transform 1.34s, setup 830ms, collect 2.84s, tests 2.58s, environment 5.31s, prepare 609ms)
```

#### Suite de regresión global del repositorio
```bash
npm test -- --run
```

**Evidencia obtenida en consola (Re-Test):**
```text
 Test Files  132 passed (132)
      Tests  895 passed (895)
   Start at  16:29:24
   Duration  32.79s (transform 16.37s, setup 29.79s, collect 69.14s, tests 97.66s, environment 196.70s, prepare 23.09s)
```

#### Ejecución individual de casos de Re-Test (`npm test -- -t "..."`)

1. **Verificación `BUG-H32-WEB-02` (WebSocket `recuperacion:actualizada` con `evento.id`):**
```bash
npm test -- src/hooks/__tests__/useRecuperacionSocket.test.ts -t "BUG-H32-WEB-02"
```
```text
 ✓ useRecuperacionSocket (HU-29) > debe invocar onRecuperacionActualizada cuando payload contiene evento.id coincidente (BUG-H32-WEB-02) 17ms
 Test Files  1 passed (1)
      Tests  1 passed | 6 skipped (7)
```

2. **Verificación `BUG-H32-WEB-03` (`AuthContext` autenticado sin permiso `misiones:asignar`):**
```bash
npm test -- src/hooks/__tests__/usePuedeAsignarMision.test.tsx -t "autenticado pero no tiene el permiso"
```
```text
 ✓ usePuedeAsignarMision > retorna false si el usuario de AuthContext está autenticado pero no tiene el permiso 14ms
 Test Files  1 passed (1)
      Tests  1 passed | 5 skipped (6)
```

3. **Verificación `BUG-H32-WEB-04` (bloqueo por teclado y estado `ASIGNADO` en `BuscadorRecursosSelect`):**
```bash
npm test -- src/components/common/__tests__/BuscadorRecursosSelect.test.tsx -t "BUG-H32-WEB-04"
```
```text
 ✓ BuscadorRecursosSelect > no debe seleccionar un recurso deshabilitado al escribir su nombre exacto en el input (BUG-H32-WEB-04) 132ms
 ✓ BuscadorRecursosSelect > no debe permitir seleccionar un activo individual en estado ASIGNADO (BUG-H32-WEB-04) 41ms
 Test Files  1 passed (1)
      Tests  2 passed | 7 skipped (9)
```

4. **Verificación `BUG-H32-WEB-05` (`listarEventosRecuperacion` en `recuperacionService.test.ts`):**
```bash
npm test -- src/services/__tests__/recuperacionService.test.ts -t "listarEventosRecuperacion"
```
```text
 ✓ recuperacionService (HU-29) > listarEventosRecuperacion (HU-73 / HU-32) > debe listar eventos de recuperación exitosamente (200 OK) 4ms
 Test Files  1 passed (1)
      Tests  1 passed | 12 skipped (13)
```

5. **Verificación `CP-H32-WEB-04` (Regla §3.6 en `DetalleEventoRecuperacionClient.test.tsx`):**
```bash
npm test -- src/components/recuperacion/__tests__/DetalleEventoRecuperacionClient.test.tsx -t "regla §3.6"
```
```text
 ✓ DetalleEventoRecuperacionClient (HU-32) > 3. regla §3.6: fija la cantidad en 1 para activos individuales y valida stock para insumos a granel 276ms
 Test Files  1 passed (1)
      Tests  1 passed | 7 skipped (8)
```

---

### 5.2. Verificación Estática, Linter y Compilación de Producción

```bash
npm run lint && npx tsc --noEmit && npm run build
```

**Evidencia obtenida en consola (Re-Test):**
```text
npm run lint -> Exit code: 0 (0 errores, 0 warnings)
npx tsc --noEmit -> Exit code: 0 (0 errores)
▲ Next.js 16.3.4 (webpack)
✓ Compiled successfully in 8.4s
✓ Finished TypeScript in 9.0s
✓ Generating static pages using 15 workers (47/47) in 1028ms
Route (app): ƒ /eventos-atp/recuperacion/[id] (Dynamic server-rendered on demand)
```

---

### 5.3. Verificación Contractual OpenAPI y Respuestas Reales de `sgrai-api`

#### Verificación del esquema real expuesto por `sgrai-api` (`generarOpenAPISpec()` v`0.12.0` y `listarEventosRecuperacionService()`)
```bash
cd ../api && npx tsx -e "import { generarOpenAPISpec } from './src/lib/openapi'; const spec = generarOpenAPISpec() as any; console.log('OpenAPI version:', spec.info?.version); console.log('EventoRecuperacion props:', Object.keys(spec.components?.schemas?.EventoRecuperacion?.properties || {})); console.log('RecuperacionDetalleResponse props:', Object.keys(spec.components?.schemas?.RecuperacionDetalleResponse?.properties?.data?.properties || {})); console.log('AsignarRecursosRecuperacionResponse props:', Object.keys(spec.components?.schemas?.AsignarRecursosRecuperacionResponse?.properties?.data?.properties || {}));"
```

**Salida real obtenida (demuestra la discrepancia de `BUG-H32-WEB-01` en `GET /api/eventos-atp/recuperacion`):**
```text
OpenAPI version: 0.12.0
EventoRecuperacion props: [
  'id',                'codigo',
  'nombre',            'descripcion',
  'sector',            'direccionTexto',
  'prioridad',         'contactoNombre',
  'contactoTelefono',  'latitud',
  'longitud',          'estado',
  'familiasAfectadas', 'delegacion',
  'mision',            'patrulla',
  'recursos',          'creadoPorId',
  'creadoEn',          'actualizadoEn'
]
RecuperacionDetalleResponse props: [
  'id',                'codigo',
  'nombre',            'descripcion',
  'sector',            'direccionTexto',
  'prioridad',         'contactoNombre',
  'contactoTelefono',  'latitud',
  'longitud',          'estado',
  'familiasAfectadas', 'delegacion',
  'misiones',          'recursosAsignados',
  'creadoPorId',       'creadoEn',
  'actualizadoEn'
]
AsignarRecursosRecuperacionResponse props: [ 'evento', 'mision', 'patrulla', 'recursos', 'asignadoEn' ]
```

#### Payload real devuelto por `sgrai-api` en `GET /api/eventos-atp/recuperacion`
```json
{
  "message": "Eventos de recuperación obtenidos exitosamente.",
  "total": 1,
  "data": [
    {
      "id": "5837deb6-fe38-4b28-847c-0a59f4b0e602",
      "codigo": "REC-2026-0001",
      "nombre": "Test Recuperacion CLI",
      "descripcion": "Entrega de prueba desde CLI",
      "sector": "Collico",
      "direccionTexto": "Pasaje Los Cipreses 450",
      "prioridad": "ALTA",
      "contactoNombre": "Sra. María González",
      "contactoTelefono": "+56987654321",
      "latitud": -39.8142,
      "longitud": -73.2459,
      "estado": "PLANIFICADA",
      "familiasAfectadas": 3,
      "delegacion": {
        "id": "30000000-0000-4000-8000-000000000001",
        "codigo": "DEL_NORTE",
        "nombre": "Delegación Municipal Norte"
      },
      "mision": {
        "id": "f3a3c065-8c1b-4fb8-a79a-2ca53447108a",
        "codigo": "MIS-2026-0005",
        "titulo": "Test Recuperacion CLI",
        "estado": "COMPLETADA",
        "tipoMision": "RECUPERACION"
      },
      "patrulla": {
        "id": "f1000000-0000-4000-8000-000000000002",
        "nombre": "Patrulla Rápida Centro-Sur",
        "estado": "EN_VERIFICACION"
      },
      "recursos": [
        {
          "recursoId": "e1000000-0000-4000-8000-000000000004",
          "nombre": "Sacos de Arena de Contención Fluvial",
          "cantidadAsignada": 10
        }
      ],
      "creadoPorId": "00000000-0000-4000-8000-000000000003",
      "creadoEn": "2026-10-05T01:57:24.323Z",
      "actualizadoEn": "2026-10-05T01:57:24.323Z"
    }
  ]
}
```
*(Se evidencia que `GET /api/eventos-atp/recuperacion` retorna `mision`, `patrulla` y `recursos`, no `misiones` ni `recursosAsignados`, causando pérdida de datos en `listarEventosRecuperacion()` de `sgrai-web`).*

#### Escenario A: Consulta de detalle de evento (`200 OK` en `GET /api/eventos-atp/recuperacion/{id}`)
```bash
curl -i -s -X GET "http://localhost:3001/api/eventos-atp/recuperacion/5837deb6-fe38-4b28-847c-0a59f4b0e602" \
  -H "Authorization: Bearer $ENC_TOKEN"
```

```http
HTTP/1.1 200 OK
content-type: application/json

{
  "message": "Detalle del evento de recuperación obtenido exitosamente.",
  "data": {
    "id": "5837deb6-fe38-4b28-847c-0a59f4b0e602",
    "codigo": "REC-2026-0001",
    "nombre": "Test Recuperacion CLI",
    "descripcion": "Entrega de prueba desde CLI",
    "sector": "Collico",
    "direccionTexto": "Pasaje Los Cipreses 450",
    "prioridad": "ALTA",
    "contactoNombre": "Sra. María González",
    "contactoTelefono": "+56987654321",
    "latitud": -39.8142,
    "longitud": -73.2459,
    "estado": "PLANIFICADA",
    "familiasAfectadas": 3,
    "delegacion": {
      "id": "30000000-0000-4000-8000-000000000001",
      "codigo": "DEL_NORTE",
      "nombre": "Delegación Municipal Norte"
    },
    "misiones": [
      {
        "id": "f3a3c065-8c1b-4fb8-a79a-2ca53447108a",
        "codigo": "MIS-2026-0005",
        "titulo": "Test Recuperacion CLI",
        "estado": "COMPLETADA",
        "tipoMision": "RECUPERACION",
        "patrulla": {
          "id": "f1000000-0000-4000-8000-000000000002",
          "nombre": "Patrulla Rápida Centro-Sur",
          "estado": "EN_VERIFICACION"
        },
        "creadoEn": "2026-10-05T01:57:24.323Z"
      }
    ],
    "recursosAsignados": [
      {
        "id": "f0328863-be79-421e-aa81-074a85801c07",
        "recursoId": "e1000000-0000-4000-8000-000000000004",
        "nombre": "Sacos de Arena de Contención Fluvial",
        "esIndividual": false,
        "cantidadAsignada": 10,
        "misionId": null,
        "creadoEn": "2026-10-05T01:57:24.323Z"
      }
    ],
    "creadoPorId": "00000000-0000-4000-8000-000000000003",
    "creadoEn": "2026-10-05T01:57:24.323Z",
    "actualizadoEn": "2026-10-05T01:57:24.323Z"
  }
}
```

#### Escenario B: Rechazo `401 Unauthorized` sin token Bearer
```bash
curl -i -s -X GET "http://localhost:3001/api/eventos-atp/recuperacion/5837deb6-fe38-4b28-847c-0a59f4b0e602" \
  -H "x-user-id: 00000000-0000-4000-8000-000000000003"
```
```http
HTTP/1.1 401 Unauthorized
content-type: application/json

{"message":"Se requiere cabecera de autenticación Authorization: Bearer <token>."}
```

#### Escenario C: Rechazo `403 Forbidden` sin permiso `misiones:asignar` (`CP-H32-WEB-12`)
```bash
curl -i -s -X POST "http://localhost:3001/api/eventos-atp/recuperacion/5837deb6-fe38-4b28-847c-0a59f4b0e602/asignar" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CC_TOKEN" \
  -d '{"patrullaId":"f1000000-0000-4000-8000-000000000002","recursos":[{"recursoId":"e1000000-0000-4000-8000-000000000004","cantidad":5}]}'
```
```http
HTTP/1.1 403 Forbidden
content-type: application/json

{"message":"No cuenta con el permiso requerido: misiones:asignar"}
```

#### Escenario D: Validación `400 Bad Request` ante payload inválido (`CP-H32-WEB-13`)
```bash
curl -i -s -X POST "http://localhost:3001/api/eventos-atp/recuperacion/5837deb6-fe38-4b28-847c-0a59f4b0e602/asignar" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ENC_TOKEN" \
  -d '{"patrullaId":"no-uuid","recursos":[]}'
```
```http
HTTP/1.1 400 Bad Request
content-type: application/json

{"message":"Datos de entrada inválidos para la asignación de recursos a recuperación.","errors":[{"campo":"patrullaId","mensaje":"El UUID de la patrulla verificadora es obligatorio y debe ser válido"},{"campo":"recursos","mensaje":"Debe asignar al menos un recurso al evento de recuperación"}]}
```

#### Escenario E: Recurso no encontrado `404 Not Found` (`CP-H32-WEB-13`)
```bash
curl -i -s -X POST "http://localhost:3001/api/eventos-atp/recuperacion/00000000-0000-4000-8000-999999999999/asignar" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ENC_TOKEN" \
  -d '{"patrullaId":"f1000000-0000-4000-8000-000000000002","recursos":[{"recursoId":"e1000000-0000-4000-8000-000000000004","cantidad":5}]}'
```
```http
HTTP/1.1 404 Not Found
content-type: application/json

{"message":"El evento de recuperación indicado no fue encontrado."}
```

#### Escenario F: Conflicto operativo `409 Conflict` por patrulla no disponible (`CP-H32-WEB-09`)
```bash
curl -i -s -X POST "http://localhost:3001/api/eventos-atp/recuperacion/5837deb6-fe38-4b28-847c-0a59f4b0e602/asignar" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ENC_TOKEN" \
  -d '{"patrullaId":"f1000000-0000-4000-8000-000000000002","recursos":[{"recursoId":"e1000000-0000-4000-8000-000000000004","cantidad":5}]}'
```
```http
HTTP/1.1 409 Conflict
content-type: application/json

{"message":"La patrulla \"Patrulla Rápida Centro-Sur\" no está disponible para asignación (estado actual: EN_VERIFICACION)."}
```

---

## 6. Matriz de Trazabilidad de Criterios de Aceptación (CA)

| Criterio de Aceptación (CA) | Casos Asociados | Estado Inicial | Estado Re-Test | Observaciones Técnicas |
|---|---|:---:|:---:|---|
| **CA-1:** Dentro de la vista de detalle de un evento de recuperación (`recuperacion`), el sistema debe proveer una sección para asignar patrullas e inventario logístico. | `CP-H32-WEB-01`, `CP-H32-WEB-02`, `CP-H32-WEB-10`, `BUG-H32-WEB-01`, `BUG-H32-WEB-05` | Observado | **Observado (Fallo Crítico en Lista)** | `DetalleEventoRecuperacionClient` ahora visualiza `recursosAsignados` por `misionId` y `KanbanBoard` consulta `GET /api/eventos-atp/recuperacion`, pero el mapeo manual de `listarEventosRecuperacion` descarta `mision`, `patrulla` y `recursos` reales en el mapa (`BUG-H32-WEB-01`). |
| **CA-2:** Permite seleccionar patrullas verificadoras disponibles. Al confirmar, se crea una misión con `tipo_mision = 'RECUPERACION'`, vinculada a la patrulla y al `recuperacion_id`, transicionando la patrulla a `EN_RECUPERACION`. | `CP-H32-WEB-03`, `CP-H32-WEB-07`, `CP-H32-WEB-09` | Cumple | **Cumple (100%)** | Selector filtra y deduplica unidades en `DISPONIBLE`; `asignarRecursosRecuperacion` procesa misión `RECUPERACION`, estado `EN_RECUPERACION` y conflictos `409 PATRULLA_OCUPADA`. |
| **CA-3:** Permite seleccionar insumos y herramientas del inventario logístico (`recurso`), especificando la cantidad asignada. | `CP-H32-WEB-04`, `CP-H32-WEB-05`, `CP-H32-WEB-06`, `BUG-H32-WEB-04` | Observado | **Cumple (100%)** | `BuscadorRecursosSelect` bloquea selección por clic y por escritura sobre ítems inhabilitados y `.recursosTableContainer` usa `overflow: visible`. |
| **CA-4:** Regla §3.6: bloqueo transaccional `SELECT ... FOR UPDATE` en `recurso` y validación de stock (`cantidad_inventario - cantidad_en_uso >= cantidad_solicitada`) impidiendo sobregiro. | `CP-H32-WEB-04`, `CP-H32-WEB-08`, `BUG-H32-WEB-04` | Observado | **Cumple (100%)** | Se eliminó el filtro `estado: 'DISPONIBLE'` permitiendo ítems `BAJO_STOCK` con unidades útiles; la validación cliente y captura de `409 STOCK_INSUFICIENTE` operan conforme a §3.6. |
| **CA-5:** Para activos individuales (`es_individual = true`), se prohíbe la asignación si se encuentra en estado `EN_MANTENCION` o `NO_DISPONIBLE`. | `CP-H32-WEB-04`, `CP-H32-WEB-06`, `CP-H32-WEB-09`, `BUG-H32-WEB-04` | Observado | **Cumple (100%)** | Cantidad fijada en `1`, validación explícita de `EN_MANTENCION`, `NO_DISPONIBLE` y `ASIGNADO` tanto en `BuscadorRecursosSelect` como en `DetalleEventoRecuperacionClient`. |
| **CA-6:** Persistencia en `recuperacion_recurso` y actualización de `cantidad_en_uso` en `recurso`. | `CP-H32-WEB-07`, `BUG-H32-WEB-01` | Observado | **Observado (Fallo Crítico)** | `api-generated.d.ts` fue editado manualmente con discrepancias frente al spec real de `sgrai-api` (`0.12.0`) en `GET /recuperacion` y `POST .../asignar` (`BUG-H32-WEB-01`). |
| **CA-7:** Emisión de eventos WebSocket `recuperacion:actualizada` y `recurso:actualizado`. | `BUG-H32-WEB-02` | Fallido | **Cumple (100%)** | `useRecuperacionSocket.ts` resuelve `payload.evento.id`/`codigo`, se suscribe a `'encargado'` y supera las `7/7` pruebas en `useRecuperacionSocket.test.ts`. |
| **CA-8:** Requisito de permiso RBAC `misiones:asignar`. | `CP-H32-WEB-11`, `CP-H32-WEB-12`, `BUG-H32-WEB-03` | Observado | **Cumple (100%)** | `usePuedeAsignarMision` aplica política *Fail-Closed* (`6/6` tests), `DetalleEventoRecuperacionClient` lee `userId` de sesión y `proxy.ts` / `client.ts` protegen `/eventos-atp`. |
