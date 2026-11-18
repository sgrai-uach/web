# Informe y Matriz de Casos de Prueba (QA): HU-32 — Asignar Patrullas y Recursos Logísticos a Evento de Recuperación (Frontend / Web)

**Proyecto:** Sistema de Gestión de Recursos para Atención de Incidentes (SGRAI) — Dirección de Gestión de Riesgos de Desastres, Municipalidad de Valdivia  
**Repositorio:** `sgrai-web`  
**Módulo:** Centro de Mando y Operaciones de Recuperación Territorial (`/eventos-atp/recuperacion/[id]` y `/gestion/centro-incidentes`)  
**Historia de Usuario:** HU-32 — *Como Encargado Quiero asignar patrullas y recursos logísticos a eventos de recuperación comunal para coordinar las labores post-emergencia Para mantener el control centralizado de los equipos y materiales destinados a la mitigación y apoyo posterior a desastres en los sectores afectados.*  
**Desarrollador Asignado:** Mayra Carrillo (`@MayraCarrillo`)  
**Rama Git Evaluada:** `feature/H32-asignar-recursos-recuperacion`  
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

**Fecha de Auditoría QA:** `16/11/2026 23:52`  
**Estado de Certificación QA:** **RECHAZADO (5 DEFECTOS ABIERTOS: 2 CRÍTICOS, 2 ALTOS, 1 MEDIO)**

---

## 1. Resumen Ejecutivo de Auditoría Técnica

Se ejecutó la auditoría técnica estática, contractual contra OpenAPI `0.10.0` de `sgrai-api`, funcional y de seguridad RBAC sobre la rama `feature/H32-asignar-recursos-recuperacion` del repositorio `sgrai-web`.

Aunque las pruebas unitarias aisladas en Vitest (`7` suites relacionadas con `43` tests y la suite global con `127` archivos / `813` tests), el chequeo de tipos TypeScript (`npx tsc --noEmit`), el linter (`npm run lint`) y la compilación de producción (`npm run build`) finalizan sin errores, la inspección forense contra el contrato real y el código fuente de `sgrai-api` evidenció **5 defectos reales** (`BUG-H32-WEB-01` a `BUG-H32-WEB-05`) que impiden la integración funcional, reactiva y segura en entorno integrado:

1. **Incompatibilidad contractual OpenAPI y pérdida de datos en historial (`BUG-H32-WEB-01`, Crítica):** `src/types/api-generated.d.ts` no fue regenerado con las rutas de HU-32 y `recuperacionService.ts` elude la verificación de tipos con `rawApiClient`. Al contrastar contra `GET /api/eventos-atp/recuperacion/{id}` en `sgrai-api`, los materiales asignados llegan en `data.recursosAsignados` (con `misionId`), mientras que `DetalleEventoRecuperacionClient.tsx` lee únicamente `mision.recursos`, dejando el historial de materiales siempre vacío en producción.
2. **Falla de reactividad en tiempo real WebSocket (`BUG-H32-WEB-02`, Crítica):** `useRecuperacionSocket.ts` busca el identificador del evento en `payload.data.id` o `payload.id`, mientras que `sgrai-api` emite `recuperacion:actualizada` con la estructura `{ evento: { id, codigo, ... }, mision, patrulla, recursos }`. Al especificar `eventoId` en la vista de detalle, el filtro descarta el evento y nunca recarga la ficha. Además, el hook no se suscribe a la sala `'encargado'`, requerida por `emitirRecursoActualizado` en modo Redis Pub/Sub.
3. **Política RBAC *Fail-Open* y suplantación con `DEFAULT_ENCARGADO_ID` (`BUG-H32-WEB-03`, Alta):** `usePuedeAsignarMision.ts` retorna `true` por defecto e ignora el caso en que `AuthContext` está autenticado sin el permiso `misiones:asignar` cuando falta `SimulatedSessionContext` o durante la hidratación inicial. Adicionalmente, `DetalleEventoRecuperacionClient.tsx` fija `userId = DEFAULT_ENCARGADO_ID` sin consultar el contexto de sesión activo, y `proxy.ts` / `RUTAS_PROTEGIDAS` no resguardan `/eventos-atp/*` frente a roles exclusivos de terreno.
4. **Control incompleto de inventario híbrido §3.6 y recorte CSS (`BUG-H32-WEB-04`, Alta):** `BuscadorRecursosSelect.tsx` permite seleccionar activos deshabilitados al escribir su nombre exacto en el `<input>`, omite el estado `ASIGNADO`, el filtro `estado: 'DISPONIBLE'` excluye recursos en `BAJO_STOCK` con unidades útiles y oculta activos `EN_MANTENCION`, y la propiedad `overflow-x: auto` en `.recursosTableContainer` recorta el menú desplegable cuando hay pocas filas.
5. **Inaccesibilidad de eventos persistidos y manejo parcial de concurrencia (`BUG-H32-WEB-05`, Media):** `KanbanBoard.tsx` no consulta `GET /api/eventos-atp/recuperacion` al montar ni al refrescar, por lo que los eventos existentes no aparecen en el mapa ni exponen su enlace a `/eventos-atp/recuperacion/[id]`. Asimismo, ante `409 EVENTO_CERRADO` no se recarga el detalle del evento para bloquear el formulario ni se notifica cuando `patrullasService.listar` falla con `exito: false`.

| Métrica de Calidad | Resultado Auditado | Estado |
| :--- | :--- | :---: |
| **Total de Casos en Matriz** | 20 (`5` Defectos Abiertos + `15` Casos Verificados) | Evaluado |
| **Casos Aprobados (`APROBADO`)** | 15 / 20 (`75.0%`) | Parcial |
| **Defectos Abiertos (`ABIERTO`)** | 5 (`2` Críticos, `2` Altos, `1` Medio) | Rechazado |
| **Suites Vitest HU-32 y Relacionadas** | 7 / 7 archivos aprobados (`43 / 43` tests con mocks locales) | Cumple (Aislado) |
| **Suite Global Vitest (`npm test -- --run`)** | 127 / 127 archivos aprobados (`813 / 813` tests) | Cumple |
| **Chequeo Estático (`npx tsc --noEmit`)** | 0 errores de compilación TypeScript | Cumple |
| **Análisis Estático (`npm run lint`)** | 0 errores, 0 warnings en archivos HU-32 (11 warnings previos en otros módulos) | Cumple |
| **Build de Producción (`npm run build`)** | Compilación exitosa (`47` rutas estáticas + `/eventos-atp/recuperacion/[id]` dinámica) | Cumple |
| **Contrato OpenAPI & Integración Real `sgrai-api`** | Divergencias críticas en `api-generated.d.ts`, DTOs y Socket.io | **No Cumple** |

---

## 2. Registro Técnico de Defectos Detectados

| ID Defecto | Título y Descripción Técnica del Defecto | Severidad | Archivo(s) Afectado(s) | Fecha Hallazgo | Estado | Fecha Re-Test | Solución / Commit |
|---|---|:---:|---|:---:|:---:|:---:|---|
| `BUG-H32-WEB-01` | **Omisión de contrato OpenAPI HU-32 en `api-generated.d.ts`, bypass de tipado con `rawApiClient` e incompatibilidad estructural en `GET /api/eventos-atp/recuperacion/{id}`:** No se regeneró `src/types/api-generated.d.ts` desde OpenAPI `0.10.0`; `recuperacionService.ts` fuerza `apiClient as unknown as UntypedApiClient`. En ejecución real, `sgrai-api` retorna los materiales en `data.recursosAsignados` (con `misionId`) y omite `recursos` dentro de `data.misiones[]`. Como `DetalleEventoRecuperacionClient.tsx` lee únicamente `mision.recursos`, los materiales asignados nunca se visualizan en el historial. Además, `AsignarRecursosRecuperacionResponse` no coincide con los campos reales devueltos por `POST .../asignar` (`200 OK`, `evento`, `asignadoEn`, `RecursoAsignadoDetalle`). | Crítica | `src/types/api-generated.d.ts`, `src/services/recuperacionService.ts`, `src/types/recuperacion.ts`, `src/components/recuperacion/DetalleEventoRecuperacionClient.tsx` | 16/11/2026 23:44 | `ABIERTO` | (Pendiente) | Pendiente (Rechazado en Code Review) |
| `BUG-H32-WEB-02` | **Falla de filtrado WebSocket `recuperacion:actualizada` (`payload.evento.id`) y falta de suscripción a sala `encargado`:** `useRecuperacionSocket.ts` inspecciona `payload.data.id` o `payload.id`, pero `sgrai-api` emite `recuperacion:actualizada` con `{ evento: { id, codigo, nombre, estado }, mision, patrulla, recursos, asignadoEn }`. Cuando `DetalleEventoRecuperacionClient` pasa `eventoId: id`, `targetId` evalúa `null` y el evento es descartado silenciosamente. Adicionalmente, `useRecuperacionSocket.ts` no se une a la sala `'encargado'`, única sala publicada por `emitirRecursoActualizado` vía Redis Pub/Sub, y `useRecuperacionSocket.test.ts` carece de cobertura para los eventos de HU-32. | Crítica | `src/hooks/useRecuperacionSocket.ts`, `src/components/recuperacion/DetalleEventoRecuperacionClient.tsx`, `src/hooks/__tests__/useRecuperacionSocket.test.ts` | 16/11/2026 23:45 | `ABIERTO` | (Pendiente) | Pendiente (Rechazado en Code Review) |
| `BUG-H32-WEB-03` | **Política RBAC *Fail-Open* en `usePuedeAsignarMision`, identidad estática `DEFAULT_ENCARGADO_ID` y brecha perimetral en `/eventos-atp`:** En `usePuedeAsignarMision.ts`, la línea final retorna `true` por defecto y el bloque `if (auth && auth.estaAutenticado)` no retorna `false` cuando falta `misiones:asignar`. Durante la hidratación inicial de `AuthContext`, `SimulatedSessionContext` cae temporalmente en el usuario índice `0` (`Administrador General`), habilitando la vista de asignación a perfiles sin permisos. Asimismo, `DetalleEventoRecuperacionClient.tsx` usa `userId = DEFAULT_ENCARGADO_ID` sin leer la sesión activa, y `proxy.ts` / `RUTAS_PROTEGIDAS` excluyen `/eventos-atp`. | Alta | `src/hooks/usePuedeAsignarMision.ts`, `src/components/recuperacion/DetalleEventoRecuperacionClient.tsx`, `src/proxy.ts`, `src/lib/api/client.ts` | 16/11/2026 23:46 | `ABIERTO` | (Pendiente) | Pendiente (Rechazado en Code Review) |
| `BUG-H32-WEB-04` | **Bypass por escritura en `BuscadorRecursosSelect`, omisión de estado `ASIGNADO`, filtro `estado=DISPONIBLE` restrictivo y recorte CSS del desplegable:** En `BuscadorRecursosSelect.tsx`, el evento `onChange` del input dispara `onChange(recursoExacto.id)` al coincidir el nombre sin validar `estaDeshabilitado`, permitiendo seleccionar activos `EN_MANTENCION` o sin stock por teclado. Ni el buscador ni `DetalleEventoRecuperacionClient.tsx` bloquean el estado `ASIGNADO`. Consultar `getRecursos({ estado: 'DISPONIBLE' })` oculta ítems `BAJO_STOCK` utilizables y activos `EN_MANTENCION`. Además, `overflow-x: auto` en `.recursosTableContainer` recorta verticalmente el `dropdownList` absoluto en tablas de 1 fila. | Alta | `src/components/common/BuscadorRecursosSelect.tsx`, `src/components/recuperacion/DetalleEventoRecuperacionClient.tsx`, `src/components/mando/ModalCrearEventoRecuperacion.tsx`, `src/components/recuperacion/DetalleEventoRecuperacion.module.css` | 16/11/2026 23:47 | `ABIERTO` | (Pendiente) | Pendiente (Rechazado en Code Review) |
| `BUG-H32-WEB-05` | **Inaccesibilidad de eventos de recuperación persistidos en el Centro de Mando y desincronización ante `409 EVENTO_CERRADO`:** `KanbanBoard.tsx` mantiene `eventosRecuperacion` vacío al iniciar y no consume `GET /api/eventos-atp/recuperacion`, impidiendo navegar al detalle de eventos ya existentes desde el mapa operativo tras recargar la página; tampoco escucha `recuperacion:actualizada`. En `DetalleEventoRecuperacionClient.tsx`, ante `409 EVENTO_CERRADO` no se invoca `cargarDetalleEvento()` para bloquear el formulario y se silencian fallos `exito: false` de `patrullasService.listar`. | Media | `src/components/mando/KanbanBoard.tsx`, `src/services/recuperacionService.ts`, `src/components/recuperacion/DetalleEventoRecuperacionClient.tsx` | 16/11/2026 23:48 | `ABIERTO` | (Pendiente) | Pendiente (Rechazado en Code Review) |

---

## 3. Matriz Consolidada de Casos de Prueba (13 Columnas)

| ID Caso | Título del Caso de Prueba | Tipo de Prueba | Nivel | Prioridad | Precondición | Datos de Prueba (Payload / Headers / Query) | Resultado Esperado | Resultado Obtenido | Estado | Fecha / Hora Ejecución | Fecha / Hora Re-Test | Solución / Commit |
|---|---|---|---|---|---|---|---|---|:---:|:---:|:---:|---|
| `BUG-H32-WEB-01` | Omisión de contrato OpenAPI HU-32 en `api-generated.d.ts`, uso de `rawApiClient` y pérdida de materiales en historial (`recursosAsignados` vs `mision.recursos`) | Contrato OpenAPI / Integración (CA-1 / CA-6) | Servicio / Componente / Tipos | Crítica | Inspección de `api-generated.d.ts`, `recuperacionService.ts`, `DetalleEventoRecuperacionClient.tsx` y respuesta real de `GET /api/eventos-atp/recuperacion/{id}` en `sgrai-api`. | `GET /api/eventos-atp/recuperacion/5837deb6-fe38-4b28-847c-0a59f4b0e602` (`Authorization: Bearer <TOKEN_ENCARGADO>`) | Rutas HU-32 generadas en `api-generated.d.ts`, llamadas mediante `apiClient` tipado y renderizado de materiales desde `data.recursosAsignados` vinculados por `misionId`. | `api-generated.d.ts` carece de las rutas HU-32; `recuperacionService.ts` usa `rawApiClient`; la API devuelve `data.recursosAsignados` y `mision.recursos` es `undefined`, dejando vacío el historial de materiales. | `ABIERTO` | 16/11/2026 23:50 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| `BUG-H32-WEB-02` | Falla de coincidencia de `eventoId` en evento Socket `recuperacion:actualizada` (`payload.evento.id`) y falta de sala `encargado` | Tiempo Real / WebSocket (CA-7) | Hook / Integración | Crítica | Hook `useRecuperacionSocket({ eventoId: id, ... })` montado en `DetalleEventoRecuperacionClient` recibiendo eventos emitidos por `sgrai-api`. | Emit `recuperacion:actualizada` con `{ evento: { id: 'rec-1234', codigo: 'REC-2026-0001' }, mision: {...}, patrulla: {...}, recursos: [...] }` y `recurso:actualizado` en sala `encargado` | `useRecuperacionSocket` extrae `payload.evento.id`, invoca `onRecuperacionActualizada`, se une a sala `encargado` y valida eventos HU-32 en pruebas unitarias. | `handleRecuperacionActualizada` lee `obj.data.id` / `obj.id` (`targetId = null`) descartando el evento; el hook no se une a `encargado` y `useRecuperacionSocket.test.ts` solo prueba `recuperacion:creada`. | `ABIERTO` | 16/11/2026 23:45 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| `BUG-H32-WEB-03` | Política RBAC *Fail-Open* en `usePuedeAsignarMision`, identidad fija `DEFAULT_ENCARGADO_ID` y omisión perimetral de `/eventos-atp` | Seguridad RBAC (CA-8) | Hook / Componente / Proxy | Alta | Usuario autenticado en `AuthContext` sin permiso `misiones:asignar` o contexto sin `SimulatedSessionProvider` accediendo a `/eventos-atp/recuperacion/[id]`. | `AuthContext` con `{ estaAutenticado: true, tienePermiso: () => false }` sin `SimulatedSessionContext`; navegación con rol de terreno a `/eventos-atp/recuperacion/[id]` | `usePuedeAsignarMision` retorna `false` (*Fail-Closed*), `DetalleEventoRecuperacionClient` obtiene `userId` del contexto de sesión y `proxy.ts` protege `/eventos-atp/*`. | `usePuedeAsignarMision` retorna `true` por defecto y cae en `true` si falta `misiones:asignar` en `AuthContext`; `DetalleEventoRecuperacionClient` envía `DEFAULT_ENCARGADO_ID`. | `ABIERTO` | 16/11/2026 23:46 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| `BUG-H32-WEB-04` | Bypass por teclado en `BuscadorRecursosSelect`, omisión de `ASIGNADO`, filtro `estado=DISPONIBLE` y recorte CSS en `.recursosTableContainer` | Regla de Negocio §3.6 / UI (CA-3 / CA-5) | Componente / CSS | Alta | Catálogo con activo individual `EN_MANTENCION` o `ASIGNADO`, insumo `BAJO_STOCK` con saldo > 0 y tabla con 1 fila en `DetalleEventoRecuperacionClient`. | Escritura de `"Camión Aljibe Mercedes Benz"` en `combobox` de `BuscadorRecursosSelect`; query `getRecursos({ estado: 'DISPONIBLE' })`; CSS `.recursosTableContainer` | Imposibilidad de seleccionar activos `EN_MANTENCION`/`ASIGNADO`/`NO_DISPONIBLE` por clic o teclado; visibilidad de `BAJO_STOCK` útiles y menú desplegable sin recorte. | El evento `onChange` del input dispara `onChange(recursoExacto.id)` sin verificar `estaDeshabilitado`; no valida `ASIGNADO`; query excluye ítems `BAJO_STOCK`/`EN_MANTENCION`; `overflow-x: auto` recorta el listbox. | `ABIERTO` | 16/11/2026 23:47 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| `BUG-H32-WEB-05` | Inaccesibilidad de eventos de recuperación persistidos en `KanbanBoard` y falta de recarga de evento ante `409 EVENTO_CERRADO` | Funcional / Concurrencia (CA-1) | Vista / Servicio | Media | Eventos de recuperación ya persistidos en BD al abrir `/gestion/centro-incidentes` o cierre concurrente del evento antes del submit. | Apertura de `MapaOperativoMando` sin eventos creados en sesión; error `409` `{ message: 'No es posible asignar recursos a un evento de recuperación en estado COMPLETADA.' }` | `KanbanBoard` carga `GET /api/eventos-atp/recuperacion` para poblar marcadores navegables y `DetalleEventoRecuperacionClient` recarga el evento ante `EVENTO_CERRADO` y reporta fallo de patrullas. | `KanbanBoard` inicia `eventosRecuperacion` en `[]` sin consultar la API; ante `EVENTO_CERRADO` el formulario sigue activo en estado obsoleto y fallos de `patrullasService.listar` se silencian. | `ABIERTO` | 16/11/2026 23:48 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| `CP-H32-WEB-01` | Renderizado de vista de detalle `/eventos-atp/recuperacion/[id]` con ficha territorial, mapa read-only e historial de misiones | Funcional / UI (CA-1) | Página / Componente | Alta | Evento `REC-2026-0001` (`PLANIFICADA`) en sector Collico con 1 misión previa cargado en `DetalleEventoRecuperacionClient`. | `id="rec-1234"`, `mockDetalleEvento` con coordenadas `-39.8142, -73.2459` | Despliega código, badges de prioridad/estado, sector, delegación, 6 familias, `LocationPickerMap` en modo `readOnly` y tarjeta de misión `MIS-2026-0001`. | Página server async y componente cliente renderizan ficha territorial, mapa y listado de misiones correctamente en suite Vitest. | `APROBADO` | 16/11/2026 23:44 | - | feat(recuperacion): implementar vista de detalle y asignacion de patrullas y recursos a evento de recuperacion (HU-32) |
| `CP-H32-WEB-02` | Enlace de acceso directo desde popup de marcador en `MapaOperativoMandoInner` hacia `/eventos-atp/recuperacion/[id]` | Funcional / Navegación (CA-1) | Componente / GIS | Media | Evento de recuperación en memoria desplegado como marcador esmeralda en el mapa táctico del Centro de Mando. | Marcador de evento `rec.id` renderizado en `MapaOperativoMandoInner.tsx` | El popup incluye el botón `<a href="/eventos-atp/recuperacion/${rec.id}">Ver Detalle y Asignar Recursos</a>` y `KanbanBoard` cambia a vista mapa al crear evento. | Enlace presente en el HTML del popup cartográfico y cambio automático `setVistaActiva('mapa')` verificado en `KanbanBoard.tsx`. | `APROBADO` | 16/11/2026 23:44 | - | fix(recuperacion): cargar patrullas reales desde sgrai-api y abrir mapa al despachar |
| `CP-H32-WEB-03` | Filtrado defensivo y deduplicación por ID de patrullas verificadoras disponibles en selector operativo | Funcional / Integración (CA-2) | Componente | Alta | Respuesta de `patrullasService.listar` con unidades `DISPONIBLE`, `EN_VERIFICACION` e IDs potencialmente duplicados. | `[ { id: 'pat-disponible-1', estado: 'DISPONIBLE' }, { id: 'pat-ocupada-2', estado: 'EN_VERIFICACION' } ]` | El `<select id="selector-patrulla">` lista exclusivamente patrullas en estado `DISPONIBLE` sin claves duplicadas. | `Patrulla Centro-Sur` figura disponible en el selector y `Patrulla Costa-1` (`EN_VERIFICACION`) queda excluida. | `APROBADO` | 16/11/2026 23:44 | - | fix(recuperacion): deduplicar patrullas y recursos por ID para evitar keys duplicadas |
| `CP-H32-WEB-04` | Bloqueo de cantidad en 1 unidad para activos individuales y validación de stock visible para insumos a granel | Regla de Negocio §3.6 (CA-3 / CA-4 / CA-5) | Componente | Crítica | Inventario con `Motobomba de Achique 3"` (`esIndividual: true`) y `Sacos de Arena 25kg` (`cantidadInventario: 50, cantidadEnUso: 10`). | Selección de `rec-bomba` y luego `rec-sacos` ingresando cantidad `55` | Para activos individuales el `spinbutton` queda fijado en `1` y `disabled`; para granel muestra `40 disponibles` y alerta al superar `40`. | Input bloqueado en `1` con etiqueta `1 Activo` para motobomba; alerta `"Supera el stock disponible en bodega (máx. 40)"` y botón submit deshabilitado al ingresar `55`. | `APROBADO` | 16/11/2026 23:51 | - | test(recuperacion): agregar pruebas unitarias e integracion para HU-32 |
| `CP-H32-WEB-05` | Gestión dinámica de filas de insumos y bloqueo de duplicados dentro del mismo despacho | Funcional / Validación (CA-3) | Componente | Media | Formulario de asignación abierto en `DetalleEventoRecuperacionClient`. | Clic en `"Agregar Otro Insumo"`, selección repetida del mismo `recursoId`, clic en `"Eliminar insumo"` | Agrega nueva fila con ID temporal único, impide eliminar la última fila restante y bloquea el envío si existe el mismo `recursoId` en más de una fila. | Se añaden y eliminan filas dinámicamente y `calcularValidacionFormulario` valida duplicidad por `Set<string>`. | `APROBADO` | 16/11/2026 23:44 | - | feat(recuperacion): implementar vista de detalle y asignacion de patrullas y recursos a evento de recuperacion (HU-32) |
| `CP-H32-WEB-06` | Búsqueda predictiva en tiempo real, deduplicación por ID y bloqueo por clic para ítems `EN_MANTENCION` o sin stock en `BuscadorRecursosSelect` | Funcional / UI (CA-3 / CA-5) | Componente | Alta | Catálogo mixto pasado a `BuscadorRecursosSelect` incluyendo `Camión Aljibe` (`EN_MANTENCION`) y `Generador 5kVA` (`stock: 0`). | Escritura `"motosierra"`, `"helicoptero"` y clic en opciones deshabilitadas `rec-camion-taller` y `rec-sin-stock` | Filtra coincidencias en vivo, muestra mensaje vacío si no hay resultados, selecciona opciones válidas e ignora clics en opciones deshabilitadas. | Las 7 pruebas unitarias de `BuscadorRecursosSelect.test.tsx` aprueban en 604ms verificando filtrado, limpieza y bloqueo por clic. | `APROBADO` | 16/11/2026 23:44 | - | feat(recursos): implementar selector de insumos con busqueda en tiempo real para recuperacion |
| `CP-H32-WEB-07` | Despacho exitoso de misión `RECUPERACION` mediante `asignarRecursosRecuperacion`, notificación Toast y reinicio del formulario | Funcional / Servicio (CA-2 / CA-6) | Servicio / Componente | Crítica | Evento `PLANIFICADA`, patrulla `pat-disponible-1` y 10 unidades de `rec-sacos` válidos. | `POST /api/eventos-atp/recuperacion/rec-1234/asignar` con `{ patrullaId: 'pat-disponible-1', recursos: [{ recursoId: 'rec-sacos', cantidad: 10 }] }` | Servicio procesa respuesta de éxito con `tipoMision: 'RECUPERACION'` y patrulla en `'EN_RECUPERACION'`; UI emite Toast con código `MIS-2026-0002`, limpia formulario y recarga detalle. | Invocación exacta verificada en `DetalleEventoRecuperacionClient.test.tsx` y `recuperacionService.test.ts` con retorno esperado. | `APROBADO` | 16/11/2026 23:44 | - | test(recuperacion): agregar pruebas unitarias e integracion para HU-32 |
| `CP-H32-WEB-08` | Clasificación y despliegue de alerta ante conflicto `409 Conflict` por sobregiro de stock (`STOCK_INSUFICIENTE`) | Concurrencia §3.6 (CA-4) | Servicio / Componente | Crítica | Petición `POST .../asignar` rechazada concurrentemente con HTTP `409` indicando stock insuficiente. | Respuesta `409` `{ message: 'Stock insuficiente para el recurso en bodega' }` | `asignarRecursosRecuperacion` lanza `RecuperacionServiceError` con `tipoConflicto: 'STOCK_INSUFICIENTE'`; UI muestra banner de error, Toast y recarga catálogos. | Clasificación correcta en servicio y renderizado de banner `"El stock en bodega cambió concurrentemente..."` verificado en Vitest. | `APROBADO` | 16/11/2026 23:51 | - | feat(recuperacion): agregar modelos, servicio y soporte websocket para asignacion de recursos (HU-32) |
| `CP-H32-WEB-09` | Clasificación de conflicto `409 Conflict` para activo en mantención (`ACTIVO_NO_DISPONIBLE`) y patrulla ocupada (`PATRULLA_OCUPADA`) | Concurrencia / Regla ICS (CA-2 / CA-5) | Servicio / API | Crítica | Activo individual en `EN_MANTENCION` o patrulla en `EN_VERIFICACION` en `sgrai-api` (`f1000000-0000-4000-8000-000000000002`). | `POST .../asignar` en mock (activo mantención) y cURL real a `http://localhost:3001/api/eventos-atp/recuperacion/5837deb6-fe38-4b28-847c-0a59f4b0e602/asignar` con patrulla `EN_VERIFICACION` | Servicio tipa `ACTIVO_NO_DISPONIBLE` y `PATRULLA_OCUPADA`; endpoint retorna `409 Conflict` con detalle de estado de la patrulla. | Servicio clasifica `ACTIVO_NO_DISPONIBLE` en Vitest y `sgrai-api` retorna `409 Conflict` indicando `(estado actual: EN_VERIFICACION)`. | `APROBADO` | 16/11/2026 23:51 | - | feat(recuperacion): agregar modelos, servicio y soporte websocket para asignacion de recursos (HU-32) |
| `CP-H32-WEB-10` | Bloqueo del formulario de asignación cuando el evento se encuentra en estado `COMPLETADA` o `CANCELADA` | Regla de Negocio (CA-1) | Componente | Alta | Evento recuperado con `estado: 'COMPLETADA'` o `'CANCELADA'`. | `mockDetalleEvento` con `estado: 'COMPLETADA'` en `DetalleEventoRecuperacionClient` | Oculta el formulario y el botón `"Confirmar y Despachar Misión"`, mostrando `InlineNotice` informativo de operación cerrada. | Formulario no se renderiza en el DOM y se despliega el aviso de estado cerrado. | `APROBADO` | 16/11/2026 23:44 | - | feat(recuperacion): implementar vista de detalle y asignacion de patrullas y recursos a evento de recuperacion (HU-32) |
| `CP-H32-WEB-11` | Ocultamiento preventivo del formulario en UI cuando `usePuedeAsignarMision` evalúa `false` dentro de `SimulatedSessionContext` | Seguridad RBAC (CA-8) | Hook / Componente | Alta | Usuario simulado sin `misiones:asignar` ni `esAdmin` o `mockPuedeAsignar = false`. | `SimulatedSessionContext` con `hasPermission: () => false`, `usuarioActivo: { esAdmin: false }` | `usePuedeAsignarMision` retorna `false` y `DetalleEventoRecuperacionClient` reemplaza el formulario por aviso requiriendo `misiones:asignar`. | Hook retorna `false` en `usePuedeAsignarMision.test.tsx` y UI oculta el botón de despacho en `DetalleEventoRecuperacionClient.test.tsx`. | `APROBADO` | 16/11/2026 23:51 | - | feat(recuperacion): implementar vista de detalle y asignacion de patrullas y recursos a evento de recuperacion (HU-32) |
| `CP-H32-WEB-12` | Validación de rechazo `403 Forbidden` sin `misiones:asignar` y `401 Unauthorized` sin token Bearer | Seguridad RBAC (CA-8) | Servicio / API | Crítica | Petición `POST .../asignar` sin cabecera `Authorization` o con token JWT de usuario Call Center (`callcenter@valdivia.cl`). | cURL sin token y cURL con `Authorization: Bearer <TOKEN_CALL_CENTER>` a `http://localhost:3001/api/eventos-atp/recuperacion/5837deb6-fe38-4b28-847c-0a59f4b0e602/asignar` | Backend responde `401` sin Bearer y `403` indicando permiso `misiones:asignar`; `recuperacionService` arroja `RecuperacionServiceError` con `statusCode: 403`. | `sgrai-api` respondió `401 Unauthorized` y `403 Forbidden` (`No cuenta con el permiso requerido: misiones:asignar`); servicio maneja `403` en Vitest. | `APROBADO` | 16/11/2026 23:51 | - | feat(recuperacion): agregar modelos, servicio y soporte websocket para asignacion de recursos (HU-32) |
| `CP-H32-WEB-13` | Manejo de errores `404 Not Found` y `400 Bad Request` en consulta de detalle y asignación de recursos | Robustez / Contrato | Servicio / API | Media | UUID de evento inexistente o payload inválido (`patrullaId: "no-uuid"`, `recursos: []`). | cURL `400`/`404` contra `sgrai-api` y caso `404` en `recuperacionService.test.ts` | Backend responde `400` con arreglo `errors` por campo y `404` si no existe el evento; servicio controla `404` y mapea `fieldErrors` en `400`. | Respuestas `400` y `404` verificadas en vivo contra `sgrai-api` y captura de `404` validada en `recuperacionService.test.ts`. | `APROBADO` | 16/11/2026 23:51 | - | test(recuperacion): agregar pruebas unitarias e integracion para HU-32 |
| `CP-H32-WEB-14` | Chequeo de tipos TypeScript, análisis estático ESLint y compilación de producción Next.js Turbopack | Calidad de Código / CI | Estático / Build | Alta | Código fuente completo de la rama `feature/H32-asignar-recursos-recuperacion`. | `npx tsc --noEmit`, `npm run lint` y `npm run build` | `0` errores en TypeScript, `0` errores en ESLint y generación exitosa de la ruta dinámica `/eventos-atp/recuperacion/[id]`. | `tsc --noEmit` (`exit 0`), `npm run lint` (`0` errores) y `npm run build` (`47` páginas estáticas + ruta dinámica compiladas en `4.2s`). | `APROBADO` | 16/11/2026 23:45 | - | merge: integrar origin/develop en feature/H32-asignar-recursos-recuperacion |
| `CP-H32-WEB-15` | Conformidad con guía visual municipal (`GEMINI.md`) y presencia de manual de usuario `H32-asignar-recursos-recuperacion.md` | Estándar UI / Docs | UI / Documentación | Media | Inspección de `.tsx`, `.module.css` y `docs/manuals/H32-asignar-recursos-recuperacion.md`. | Uso de `Heading`, `Button`, `border-radius: 0px`, paleta `#1B6F7D`, iconos `lucide-react` sin emojis y manual H32 | Sin emojis en UI, esquinas rectas `0px`, uso de tokens CSS institucionales y manual operativo H32 documentado. | Iconografía exclusiva de `lucide-react`, radios `0px` en CSS Modules, tokens institucionales aplicados y manual H32 presente en `docs/manuals/`. | `APROBADO` | 16/11/2026 23:47 | - | docs(manuals): crear manual de usuario H32 para asignacion de recursos a recuperacion |

---

## 4. Bloque TSV

````tsv
ID Caso	Título del Caso de Prueba	Tipo de Prueba	Nivel	Prioridad	Precondición	Datos de Prueba (Payload / Headers / Query)	Resultado Esperado	Resultado Obtenido	Estado	Fecha / Hora Ejecución	Fecha / Hora Re-Test	Solución / Commit
BUG-H32-WEB-01	Omisión de contrato OpenAPI HU-32 en api-generated.d.ts, uso de rawApiClient y pérdida de materiales en historial (recursosAsignados vs mision.recursos)	Contrato OpenAPI / Integración (CA-1 / CA-6)	Servicio / Componente / Tipos	Crítica	Inspección de api-generated.d.ts, recuperacionService.ts, DetalleEventoRecuperacionClient.tsx y respuesta real de GET /api/eventos-atp/recuperacion/{id} en sgrai-api.	GET /api/eventos-atp/recuperacion/5837deb6-fe38-4b28-847c-0a59f4b0e602 (Authorization: Bearer <TOKEN_ENCARGADO>)	Rutas HU-32 generadas en api-generated.d.ts, llamadas mediante apiClient tipado y renderizado de materiales desde data.recursosAsignados vinculados por misionId.	api-generated.d.ts carece de las rutas HU-32; recuperacionService.ts usa rawApiClient; la API devuelve data.recursosAsignados y mision.recursos es undefined, dejando vacío el historial de materiales.	ABIERTO	16/11/2026 23:50	(Pendiente)	Pendiente (Rechazado en Code Review)
BUG-H32-WEB-02	Falla de coincidencia de eventoId en evento Socket recuperacion:actualizada (payload.evento.id) y falta de sala encargado	Tiempo Real / WebSocket (CA-7)	Hook / Integración	Crítica	Hook useRecuperacionSocket({ eventoId: id, ... }) montado en DetalleEventoRecuperacionClient recibiendo eventos emitidos por sgrai-api.	Emit recuperacion:actualizada con { evento: { id: 'rec-1234', codigo: 'REC-2026-0001' }, mision: {...}, patrulla: {...}, recursos: [...] } y recurso:actualizado en sala encargado	useRecuperacionSocket extrae payload.evento.id, invoca onRecuperacionActualizada, se une a sala encargado y valida eventos HU-32 en pruebas unitarias.	handleRecuperacionActualizada lee obj.data.id / obj.id (targetId = null) descartando el evento; el hook no se une a encargado y useRecuperacionSocket.test.ts solo prueba recuperacion:creada.	ABIERTO	16/11/2026 23:45	(Pendiente)	Pendiente (Rechazado en Code Review)
BUG-H32-WEB-03	Política RBAC Fail-Open en usePuedeAsignarMision, identidad fija DEFAULT_ENCARGADO_ID y omisión perimetral de /eventos-atp	Seguridad RBAC (CA-8)	Hook / Componente / Proxy	Alta	Usuario autenticado en AuthContext sin permiso misiones:asignar o contexto sin SimulatedSessionProvider accediendo a /eventos-atp/recuperacion/[id].	AuthContext con { estaAutenticado: true, tienePermiso: () => false } sin SimulatedSessionContext; navegación con rol de terreno a /eventos-atp/recuperacion/[id]	usePuedeAsignarMision retorna false (Fail-Closed), DetalleEventoRecuperacionClient obtiene userId del contexto de sesión y proxy.ts protege /eventos-atp/*.	usePuedeAsignarMision retorna true por defecto y cae en true si falta misiones:asignar en AuthContext; DetalleEventoRecuperacionClient envía DEFAULT_ENCARGADO_ID.	ABIERTO	16/11/2026 23:46	(Pendiente)	Pendiente (Rechazado en Code Review)
BUG-H32-WEB-04	Bypass por teclado en BuscadorRecursosSelect, omisión de ASIGNADO, filtro estado=DISPONIBLE y recorte CSS en .recursosTableContainer	Regla de Negocio §3.6 / UI (CA-3 / CA-5)	Componente / CSS	Alta	Catálogo con activo individual EN_MANTENCION o ASIGNADO, insumo BAJO_STOCK con saldo > 0 y tabla con 1 fila en DetalleEventoRecuperacionClient.	Escritura de "Camión Aljibe Mercedes Benz" en combobox de BuscadorRecursosSelect; query getRecursos({ estado: 'DISPONIBLE' }); CSS .recursosTableContainer	Imposibilidad de seleccionar activos EN_MANTENCION/ASIGNADO/NO_DISPONIBLE por clic o teclado; visibilidad de BAJO_STOCK útiles y menú desplegable sin recorte.	El evento onChange del input dispara onChange(recursoExacto.id) sin verificar estaDeshabilitado; no valida ASIGNADO; query excluye ítems BAJO_STOCK/EN_MANTENCION; overflow-x: auto recorta el listbox.	ABIERTO	16/11/2026 23:47	(Pendiente)	Pendiente (Rechazado en Code Review)
BUG-H32-WEB-05	Inaccesibilidad de eventos de recuperación persistidos en KanbanBoard y falta de recarga de evento ante 409 EVENTO_CERRADO	Funcional / Concurrencia (CA-1)	Vista / Servicio	Media	Eventos de recuperación ya persistidos en BD al abrir /gestion/centro-incidentes o cierre concurrente del evento antes del submit.	Apertura de MapaOperativoMando sin eventos creados en sesión; error 409 { message: 'No es posible asignar recursos a un evento de recuperación en estado COMPLETADA.' }	KanbanBoard carga GET /api/eventos-atp/recuperacion para poblar marcadores navegables y DetalleEventoRecuperacionClient recarga el evento ante EVENTO_CERRADO y reporta fallo de patrullas.	KanbanBoard inicia eventosRecuperacion en [] sin consultar la API; ante EVENTO_CERRADO el formulario sigue activo en estado obsoleto y fallos de patrullasService.listar se silencian.	ABIERTO	16/11/2026 23:48	(Pendiente)	Pendiente (Rechazado en Code Review)
CP-H32-WEB-01	Renderizado de vista de detalle /eventos-atp/recuperacion/[id] con ficha territorial, mapa read-only e historial de misiones	Funcional / UI (CA-1)	Página / Componente	Alta	Evento REC-2026-0001 (PLANIFICADA) en sector Collico con 1 misión previa cargado en DetalleEventoRecuperacionClient.	id="rec-1234", mockDetalleEvento con coordenadas -39.8142, -73.2459	Despliega código, badges de prioridad/estado, sector, delegación, 6 familias, LocationPickerMap en modo readOnly y tarjeta de misión MIS-2026-0001.	Página server async y componente cliente renderizan ficha territorial, mapa y listado de misiones correctamente en suite Vitest.	APROBADO	16/11/2026 23:44	-	feat(recuperacion): implementar vista de detalle y asignacion de patrullas y recursos a evento de recuperacion (HU-32)
CP-H32-WEB-02	Enlace de acceso directo desde popup de marcador en MapaOperativoMandoInner hacia /eventos-atp/recuperacion/[id]	Funcional / Navegación (CA-1)	Componente / GIS	Media	Evento de recuperación en memoria desplegado como marcador esmeralda en el mapa táctico del Centro de Mando.	Marcador de evento rec.id renderizado en MapaOperativoMandoInner.tsx	El popup incluye el botón <a href="/eventos-atp/recuperacion/${rec.id}">Ver Detalle y Asignar Recursos</a> y KanbanBoard cambia a vista mapa al crear evento.	Enlace presente en el HTML del popup cartográfico y cambio automático setVistaActiva('mapa') verificado en KanbanBoard.tsx.	APROBADO	16/11/2026 23:44	-	fix(recuperacion): cargar patrullas reales desde sgrai-api y abrir mapa al despachar
CP-H32-WEB-03	Filtrado defensivo y deduplicación por ID de patrullas verificadoras disponibles en selector operativo	Funcional / Integración (CA-2)	Componente	Alta	Respuesta de patrullasService.listar con unidades DISPONIBLE, EN_VERIFICACION e IDs potencialmente duplicados.	[ { id: 'pat-disponible-1', estado: 'DISPONIBLE' }, { id: 'pat-ocupada-2', estado: 'EN_VERIFICACION' } ]	El <select id="selector-patrulla"> lista exclusivamente patrullas en estado DISPONIBLE sin claves duplicadas.	Patrulla Centro-Sur figura disponible en el selector y Patrulla Costa-1 (EN_VERIFICACION) queda excluida.	APROBADO	16/11/2026 23:44	-	fix(recuperacion): deduplicar patrullas y recursos por ID para evitar keys duplicadas
CP-H32-WEB-04	Bloqueo de cantidad en 1 unidad para activos individuales y validación de stock visible para insumos a granel	Regla de Negocio §3.6 (CA-3 / CA-4 / CA-5)	Componente	Crítica	Inventario con Motobomba de Achique 3" (esIndividual: true) y Sacos de Arena 25kg (cantidadInventario: 50, cantidadEnUso: 10).	Selección de rec-bomba y luego rec-sacos ingresando cantidad 55	Para activos individuales el spinbutton queda fijado en 1 y disabled; para granel muestra 40 disponibles y alerta al superar 40.	Input bloqueado en 1 con etiqueta 1 Activo para motobomba; alerta "Supera el stock disponible en bodega (máx. 40)" y botón submit deshabilitado al ingresar 55.	APROBADO	16/11/2026 23:51	-	test(recuperacion): agregar pruebas unitarias e integracion para HU-32
CP-H32-WEB-05	Gestión dinámica de filas de insumos y bloqueo de duplicados dentro del mismo despacho	Funcional / Validación (CA-3)	Componente	Media	Formulario de asignación abierto en DetalleEventoRecuperacionClient.	Clic en "Agregar Otro Insumo", selección repetida del mismo recursoId, clic en "Eliminar insumo"	Agrega nueva fila con ID temporal único, impide eliminar la última fila restante y bloquea el envío si existe el mismo recursoId en más de una fila.	Se añaden y eliminan filas dinámicamente y calcularValidacionFormulario valida duplicidad por Set<string>.	APROBADO	16/11/2026 23:44	-	feat(recuperacion): implementar vista de detalle y asignacion de patrullas y recursos a evento de recuperacion (HU-32)
CP-H32-WEB-06	Búsqueda predictiva en tiempo real, deduplicación por ID y bloqueo por clic para ítems EN_MANTENCION o sin stock en BuscadorRecursosSelect	Funcional / UI (CA-3 / CA-5)	Componente	Alta	Catálogo mixto pasado a BuscadorRecursosSelect incluyendo Camión Aljibe (EN_MANTENCION) y Generador 5kVA (stock: 0).	Escritura "motosierra", "helicoptero" y clic en opciones deshabilitadas rec-camion-taller y rec-sin-stock	Filtra coincidencias en vivo, muestra mensaje vacío si no hay resultados, selecciona opciones válidas e ignora clics en opciones deshabilitadas.	Las 7 pruebas unitarias de BuscadorRecursosSelect.test.tsx aprueban en 604ms verificando filtrado, limpieza y bloqueo por clic.	APROBADO	16/11/2026 23:44	-	feat(recursos): implementar selector de insumos con busqueda en tiempo real para recuperacion
CP-H32-WEB-07	Despacho exitoso de misión RECUPERACION mediante asignarRecursosRecuperacion, notificación Toast y reinicio del formulario	Funcional / Servicio (CA-2 / CA-6)	Servicio / Componente	Crítica	Evento PLANIFICADA, patrulla pat-disponible-1 y 10 unidades de rec-sacos válidos.	POST /api/eventos-atp/recuperacion/rec-1234/asignar con { patrullaId: 'pat-disponible-1', recursos: [{ recursoId: 'rec-sacos', cantidad: 10 }] }	Servicio procesa respuesta de éxito con tipoMision: 'RECUPERACION' y patrulla en 'EN_RECUPERACION'; UI emite Toast con código MIS-2026-0002, limpia formulario y recarga detalle.	Invocación exacta verificada en DetalleEventoRecuperacionClient.test.tsx y recuperacionService.test.ts con retorno esperado.	APROBADO	16/11/2026 23:44	-	test(recuperacion): agregar pruebas unitarias e integracion para HU-32
CP-H32-WEB-08	Clasificación y despliegue de alerta ante conflicto 409 Conflict por sobregiro de stock (STOCK_INSUFICIENTE)	Concurrencia §3.6 (CA-4)	Servicio / Componente	Crítica	Petición POST .../asignar rechazada concurrentemente con HTTP 409 indicando stock insuficiente.	Respuesta 409 { message: 'Stock insuficiente para el recurso en bodega' }	asignarRecursosRecuperacion lanza RecuperacionServiceError con tipoConflicto: 'STOCK_INSUFICIENTE'; UI muestra banner de error, Toast y recarga catálogos.	Clasificación correcta en servicio y renderizado de banner "El stock en bodega cambió concurrentemente..." verificado en Vitest.	APROBADO	16/11/2026 23:51	-	feat(recuperacion): agregar modelos, servicio y soporte websocket para asignacion de recursos (HU-32)
CP-H32-WEB-09	Clasificación de conflicto 409 Conflict para activo en mantención (ACTIVO_NO_DISPONIBLE) y patrulla ocupada (PATRULLA_OCUPADA)	Concurrencia / Regla ICS (CA-2 / CA-5)	Servicio / API	Crítica	Activo individual en EN_MANTENCION o patrulla en EN_VERIFICACION en sgrai-api (f1000000-0000-4000-8000-000000000002).	POST .../asignar en mock (activo mantención) y cURL real a http://localhost:3001/api/eventos-atp/recuperacion/5837deb6-fe38-4b28-847c-0a59f4b0e602/asignar con patrulla EN_VERIFICACION	Servicio tipa ACTIVO_NO_DISPONIBLE y PATRULLA_OCUPADA; endpoint retorna 409 Conflict con detalle de estado de la patrulla.	Servicio clasifica ACTIVO_NO_DISPONIBLE en Vitest y sgrai-api retorna 409 Conflict indicando (estado actual: EN_VERIFICACION).	APROBADO	16/11/2026 23:51	-	feat(recuperacion): agregar modelos, servicio y soporte websocket para asignacion de recursos (HU-32)
CP-H32-WEB-10	Bloqueo del formulario de asignación cuando el evento se encuentra en estado COMPLETADA o CANCELADA	Regla de Negocio (CA-1)	Componente	Alta	Evento recuperado con estado: 'COMPLETADA' o 'CANCELADA'.	mockDetalleEvento con estado: 'COMPLETADA' en DetalleEventoRecuperacionClient	Oculta el formulario y el botón "Confirmar y Despachar Misión", mostrando InlineNotice informativo de operación cerrada.	Formulario no se renderiza en el DOM y se despliega el aviso de estado cerrado.	APROBADO	16/11/2026 23:44	-	feat(recuperacion): implementar vista de detalle y asignacion de patrullas y recursos a evento de recuperacion (HU-32)
CP-H32-WEB-11	Ocultamiento preventivo del formulario en UI cuando usePuedeAsignarMision evalúa false dentro de SimulatedSessionContext	Seguridad RBAC (CA-8)	Hook / Componente	Alta	Usuario simulado sin misiones:asignar ni esAdmin o mockPuedeAsignar = false.	SimulatedSessionContext con hasPermission: () => false, usuarioActivo: { esAdmin: false }	usePuedeAsignarMision retorna false y DetalleEventoRecuperacionClient reemplaza el formulario por aviso requiriendo misiones:asignar.	Hook retorna false en usePuedeAsignarMision.test.tsx y UI oculta el botón de despacho en DetalleEventoRecuperacionClient.test.tsx.	APROBADO	16/11/2026 23:51	-	feat(recuperacion): implementar vista de detalle y asignacion de patrullas y recursos a evento de recuperacion (HU-32)
CP-H32-WEB-12	Validación de rechazo 403 Forbidden sin misiones:asignar y 401 Unauthorized sin token Bearer	Seguridad RBAC (CA-8)	Servicio / API	Crítica	Petición POST .../asignar sin cabecera Authorization o con token JWT de usuario Call Center (callcenter@valdivia.cl).	cURL sin token y cURL con Authorization: Bearer <TOKEN_CALL_CENTER> a http://localhost:3001/api/eventos-atp/recuperacion/5837deb6-fe38-4b28-847c-0a59f4b0e602/asignar	Backend responde 401 sin Bearer y 403 indicando permiso misiones:asignar; recuperacionService arroja RecuperacionServiceError con statusCode: 403.	sgrai-api respondió 401 Unauthorized y 403 Forbidden (No cuenta con el permiso requerido: misiones:asignar); servicio maneja 403 en Vitest.	APROBADO	16/11/2026 23:51	-	feat(recuperacion): agregar modelos, servicio y soporte websocket para asignacion de recursos (HU-32)
CP-H32-WEB-13	Manejo de errores 404 Not Found y 400 Bad Request en consulta de detalle y asignación de recursos	Robustez / Contrato	Servicio / API	Media	UUID de evento inexistente o payload inválido (patrullaId: "no-uuid", recursos: []).	cURL 400/404 contra sgrai-api y caso 404 en recuperacionService.test.ts	Backend responde 400 con arreglo errors por campo y 404 si no existe el evento; servicio controla 404 y mapea fieldErrors en 400.	Respuestas 400 y 404 verificadas en vivo contra sgrai-api y captura de 404 validada en recuperacionService.test.ts.	APROBADO	16/11/2026 23:51	-	test(recuperacion): agregar pruebas unitarias e integracion para HU-32
CP-H32-WEB-14	Chequeo de tipos TypeScript, análisis estático ESLint y compilación de producción Next.js Turbopack	Calidad de Código / CI	Estático / Build	Alta	Código fuente completo de la rama feature/H32-asignar-recursos-recuperacion.	npx tsc --noEmit, npm run lint y npm run build	0 errores en TypeScript, 0 errores en ESLint y generación exitosa de la ruta dinámica /eventos-atp/recuperacion/[id].	tsc --noEmit (exit 0), npm run lint (0 errores) y npm run build (47 páginas estáticas + ruta dinámica compiladas en 4.2s).	APROBADO	16/11/2026 23:45	-	merge: integrar origin/develop en feature/H32-asignar-recursos-recuperacion
CP-H32-WEB-15	Conformidad con guía visual municipal (GEMINI.md) y presencia de manual de usuario H32-asignar-recursos-recuperacion.md	Estándar UI / Docs	UI / Documentación	Media	Inspección de .tsx, .module.css y docs/manuals/H32-asignar-recursos-recuperacion.md.	Uso de Heading, Button, border-radius: 0px, paleta #1B6F7D, iconos lucide-react sin emojis y manual H32	Sin emojis en UI, esquinas rectas 0px, uso de tokens CSS institucionales y manual operativo H32 documentado.	Iconografía exclusiva de lucide-react, radios 0px en CSS Modules, tokens institucionales aplicados y manual H32 presente en docs/manuals/.	APROBADO	16/11/2026 23:47	-	docs(manuals): crear manual de usuario H32 para asignacion de recursos a recuperacion
````

---

## 5. Guía de Ejecución Paso a Paso y Evidencias Replicables

### 5.1. Ejecución de Suites Automatizadas de HU-32 en Vitest

#### Comando consolidado de las 7 suites vinculadas a HU-32
```bash
npx vitest run src/services/__tests__/recuperacionService.test.ts src/components/recuperacion/__tests__/DetalleEventoRecuperacionClient.test.tsx src/components/common/__tests__/BuscadorRecursosSelect.test.tsx src/hooks/__tests__/usePuedeAsignarMision.test.tsx src/hooks/__tests__/useRecuperacionSocket.test.ts src/app/\(mando\)/eventos-atp/recuperacion/\[id\]/__tests__/page.test.tsx src/components/mando/__tests__/ModalCrearEventoRecuperacion.test.tsx
```

**Evidencia obtenida en consola:**
```text
 ✓ src/services/__tests__/recuperacionService.test.ts (12 tests) 26ms
 ✓ src/app/(mando)/eventos-atp/recuperacion/[id]/__tests__/page.test.tsx (2 tests) 57ms
 ✓ src/hooks/__tests__/useRecuperacionSocket.test.ts (3 tests) 59ms
 ✓ src/hooks/__tests__/usePuedeAsignarMision.test.tsx (4 tests) 49ms
 ✓ src/components/common/__tests__/BuscadorRecursosSelect.test.tsx (7 tests) 604ms
 ✓ src/components/recuperacion/__tests__/DetalleEventoRecuperacionClient.test.tsx (8 tests) 1529ms
 ✓ src/components/mando/__tests__/ModalCrearEventoRecuperacion.test.tsx (7 tests) 1549ms

 Test Files  7 passed (7)
      Tests  43 passed (43)
   Start at  23:44:17
   Duration  5.12s (transform 2.52s, setup 2.03s, collect 5.04s, tests 3.87s, environment 11.26s, prepare 1.12s)
```

#### Suite de regresión global del repositorio
```bash
npm test -- --run
```

**Evidencia obtenida en consola:**
```text
 Test Files  127 passed (127)
      Tests  813 passed (813)
   Start at  23:46:12
   Duration  27.61s (transform 17.86s, setup 25.01s, collect 68.65s, tests 82.83s, environment 164.08s, prepare 19.25s)
```

#### Ejecución individual de casos específicos (`npm test -- -t "..."`)

1. **Detalle de evento en `recuperacionService.test.ts` (`CP-H32-WEB-01`):**
```bash
npm test -- src/services/__tests__/recuperacionService.test.ts -t "debe consultar el detalle del evento exitosamente"
```
```text
 ✓ recuperacionService (HU-29) > obtenerEventoRecuperacion (HU-32) > debe consultar el detalle del evento exitosamente (200 OK) 9ms
 Test Files  1 passed (1)
      Tests  1 passed | 11 skipped (12)
```

2. **Conflicto `STOCK_INSUFICIENTE` en `recuperacionService.test.ts` (`CP-H32-WEB-08`):**
```bash
npm test -- src/services/__tests__/recuperacionService.test.ts -t "debe arrojar RecuperacionServiceError con tipoConflicto STOCK_INSUFICIENTE"
```
```text
 ✓ recuperacionService (HU-29) > debe arrojar RecuperacionServiceError con tipoConflicto STOCK_INSUFICIENTE en 409 Conflict 5ms
 ✓ recuperacionService (HU-29) > asignarRecursosRecuperacion (HU-32) > debe arrojar RecuperacionServiceError con tipoConflicto STOCK_INSUFICIENTE en 409 Conflict 1ms
 Test Files  1 passed (1)
      Tests  2 passed | 10 skipped (12)
```

3. **Regla §3.6 (individual en 1 y validación de stock) en `DetalleEventoRecuperacionClient.test.tsx` (`CP-H32-WEB-04`):**
```bash
npm test -- src/components/recuperacion/__tests__/DetalleEventoRecuperacionClient.test.tsx -t "regla §3.6"
```
```text
 ✓ DetalleEventoRecuperacionClient (HU-32) > 3. regla §3.6: fija la cantidad en 1 para activos individuales y valida stock para insumos a granel 276ms
 Test Files  1 passed (1)
      Tests  1 passed | 7 skipped (8)
```

4. **Bloqueo por clic de ítems `EN_MANTENCION` o sin stock en `BuscadorRecursosSelect.test.tsx` (`CP-H32-WEB-06`):**
```bash
npm test -- src/components/common/__tests__/BuscadorRecursosSelect.test.tsx -t "no debe permitir seleccionar recursos en mantención o sin stock"
```
```text
 ✓ BuscadorRecursosSelect > no debe permitir seleccionar recursos en mantención o sin stock 178ms
 Test Files  1 passed (1)
      Tests  1 passed | 6 skipped (7)
```

5. **Control RBAC en `SimulatedSessionContext` en `usePuedeAsignarMision.test.tsx` (`CP-H32-WEB-11`):**
```bash
npm test -- src/hooks/__tests__/usePuedeAsignarMision.test.tsx -t "retorna false si el usuario no tiene el permiso"
```
```text
 ✓ usePuedeAsignarMision > retorna false si el usuario no tiene el permiso en SimulatedSessionContext y no es admin 15ms
 Test Files  1 passed (1)
      Tests  1 passed | 3 skipped (4)
```

---

### 5.2. Verificación Estática, Linter y Compilación de Producción

```bash
npx eslint src/app/\(mando\)/eventos-atp/recuperacion/\[id\]/page.tsx src/components/common/BuscadorRecursosSelect.tsx src/components/mando/KanbanBoard.tsx src/components/mando/MapaOperativoMandoInner.tsx src/components/mando/ModalCrearEventoRecuperacion.tsx src/components/recuperacion/DetalleEventoRecuperacionClient.tsx src/hooks/usePuedeAsignarMision.ts src/hooks/useRecuperacionSocket.ts src/services/recuperacionService.ts src/types/recuperacion.ts && npx tsc --noEmit && npm run build
```

**Evidencia obtenida en consola:**
```text
✓ Running next.config.ts took 74ms
✓ Compiled successfully in 4.2s
✓ Finished TypeScript in 9.4s
✓ Generating static pages using 15 workers (47/47) in 690ms
Route (app): ƒ /eventos-atp/recuperacion/[id] (Dynamic server-rendered on demand)
```
*(El linter global `npm run lint` finalizó con código `0`, `0` errores y `11` advertencias preexistentes ajenas a los archivos de HU-32).*

---

### 5.3. Verificación Contractual OpenAPI y Pruebas HTTP/cURL contra `sgrai-api`

#### Verificación de especificación OpenAPI expuesta en vivo (`http://localhost:3001/openapi.json`)
```bash
curl -s http://localhost:3001/openapi.json | node -e "const d = JSON.parse(require('fs').readFileSync(0,'utf8')); console.log('OpenAPI version:', d.info?.version); console.log('GET /api/eventos-atp/recuperacion:', !!d.paths['/api/eventos-atp/recuperacion']?.get); console.log('GET /api/eventos-atp/recuperacion/{id}:', !!d.paths['/api/eventos-atp/recuperacion/{id}']?.get); console.log('POST /api/eventos-atp/recuperacion/{id}/asignar:', !!d.paths['/api/eventos-atp/recuperacion/{id}/asignar']?.post);"
```

**Evidencia obtenida (demuestra `BUG-H32-WEB-01` por desincronización de `src/types/api-generated.d.ts`):**
```text
OpenAPI version: 0.10.0
GET /api/eventos-atp/recuperacion: true
GET /api/eventos-atp/recuperacion/{id}: true
POST /api/eventos-atp/recuperacion/{id}/asignar: true
```

#### Obtención de tokens JWT de prueba (`POST /api/seguridad/login`)
```bash
ENC_TOKEN=$(curl -s -X POST http://localhost:3001/api/seguridad/login \
  -H "Content-Type: application/json" \
  -d '{"identificador":"encargado@valdivia.cl","password":"Valdivia2026!"}' \
  | node -e "console.log(JSON.parse(require('fs').readFileSync(0,'utf8')).data.token)")

CC_TOKEN=$(curl -s -X POST http://localhost:3001/api/seguridad/login \
  -H "Content-Type: application/json" \
  -d '{"identificador":"callcenter@valdivia.cl","password":"Valdivia2026!"}' \
  | node -e "console.log(JSON.parse(require('fs').readFileSync(0,'utf8')).data.token)")
```

#### Escenario A: Consulta de detalle de evento (`200 OK`) — Evidencia directa de `BUG-H32-WEB-01`
```bash
curl -i -s -X GET "http://localhost:3001/api/eventos-atp/recuperacion/5837deb6-fe38-4b28-847c-0a59f4b0e602" \
  -H "Authorization: Bearer $ENC_TOKEN"
```

**Respuesta HTTP/JSON real obtenida:**
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
*(Se constata que `data.misiones[0]` no incluye propiedad `recursos` y los materiales vienen en `data.recursosAsignados` con `misionId`).*

#### Escenario B: Rechazo `401 Unauthorized` al enviar únicamente `x-user-id` sin token Bearer
```bash
curl -i -s -X GET "http://localhost:3001/api/eventos-atp/recuperacion/5837deb6-fe38-4b28-847c-0a59f4b0e602" \
  -H "x-user-id: 00000000-0000-4000-8000-000000000003"
```
```http
HTTP/1.1 401 Unauthorized
content-type: application/json

{"message":"Se requiere cabecera de autenticación Authorization: Bearer <token>."}
```

#### Escenario C: Rechazo `403 Forbidden` con perfil Call Center sin permiso `misiones:asignar` (`CP-H32-WEB-12`)
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

| Criterio de Aceptación (CA) | Casos Asociados | Estado QA | Observaciones Técnicas |
|---|---|:---:|---|
| **CA-1:** Dentro de la vista de detalle de un evento de recuperación (`recuperacion`), el sistema debe proveer una sección para asignar patrullas e inventario logístico. | `CP-H32-WEB-01`, `CP-H32-WEB-02`, `CP-H32-WEB-10`, `BUG-H32-WEB-01`, `BUG-H32-WEB-05` | **OBSERVADO (Fallos Crítico/Medio)** | La ruta `/eventos-atp/recuperacion/[id]` y el panel derecho de asignación existen, pero `KanbanBoard` no carga eventos existentes desde `GET /api/eventos-atp/recuperacion` (`BUG-H32-WEB-05`) y el historial de materiales no se visualiza contra la respuesta real de `sgrai-api` (`BUG-H32-WEB-01`). |
| **CA-2:** Permite seleccionar patrullas verificadoras disponibles. Al confirmar, se crea una misión con `tipo_mision = 'RECUPERACION'`, vinculada a la patrulla y al `recuperacion_id`, transicionando la patrulla a `EN_RECUPERACION`. | `CP-H32-WEB-03`, `CP-H32-WEB-07`, `CP-H32-WEB-09` | **CUMPLIDO** | Selector filtra y deduplica unidades en `DISPONIBLE`; `asignarRecursosRecuperacion` procesa misión `RECUPERACION`, estado `EN_RECUPERACION` y conflictos `409 PATRULLA_OCUPADA`. |
| **CA-3:** Permite seleccionar insumos y herramientas del inventario logístico (`recurso`), especificando la cantidad asignada. | `CP-H32-WEB-04`, `CP-H32-WEB-05`, `CP-H32-WEB-06`, `BUG-H32-WEB-04` | **OBSERVADO (Fallo Alto)** | `BuscadorRecursosSelect` y la tabla dinámica permiten agregar insumos, pero el input permite seleccionar ítems deshabilitados al tipear el nombre y `.recursosTableContainer` recorta el dropdown con `overflow-x: auto` (`BUG-H32-WEB-04`). |
| **CA-4:** Regla §3.6: bloqueo transaccional `SELECT ... FOR UPDATE` en `recurso` y validación de stock (`cantidad_inventario - cantidad_en_uso >= cantidad_solicitada`) impidiendo sobregiro. | `CP-H32-WEB-04`, `CP-H32-WEB-08`, `BUG-H32-WEB-04` | **OBSERVADO (Fallo Alto)** | La UI valida stock visible y maneja `409 STOCK_INSUFICIENTE`, pero consultar `getRecursos` con `estado=DISPONIBLE` excluye ítems `BAJO_STOCK` que aún poseen unidades disponibles (`BUG-H32-WEB-04`). |
| **CA-5:** Para activos individuales (`es_individual = true`), se prohíbe la asignación si se encuentra en estado `EN_MANTENCION` o `NO_DISPONIBLE`. | `CP-H32-WEB-04`, `CP-H32-WEB-06`, `CP-H32-WEB-09`, `BUG-H32-WEB-04` | **OBSERVADO (Fallo Alto)** | La cantidad se fija en `1`, aunque `BuscadorRecursosSelect` y `DetalleEventoRecuperacionClient` omiten validar `ASIGNADO`, permiten selección por escritura exacta y el filtro `estado=DISPONIBLE` impide listar los activos `EN_MANTENCION` (`BUG-H32-WEB-04`). |
| **CA-6:** Persistencia en `recuperacion_recurso` y actualización de `cantidad_en_uso` en `recurso`. | `CP-H32-WEB-07`, `BUG-H32-WEB-01` | **OBSERVADO (Fallo Crítico)** | El contrato `POST .../asignar` y `GET .../recuperacion/{id}` no está sincronizado en `api-generated.d.ts`, y la UI omite leer `recursosAsignados` del backend (`BUG-H32-WEB-01`). |
| **CA-7:** Emisión de eventos WebSocket `recuperacion:actualizada` y `recurso:actualizado`. | `BUG-H32-WEB-02` | **FALLIDO (Crítico)** | `useRecuperacionSocket.ts` no resuelve `payload.evento.id` en `recuperacion:actualizada`, descartando toda actualización cuando se pasa `eventoId`, y no se une a la sala `'encargado'` para `recurso:actualizado` (`BUG-H32-WEB-02`). |
| **CA-8:** Requisito de permiso RBAC `misiones:asignar`. | `CP-H32-WEB-11`, `CP-H32-WEB-12`, `BUG-H32-WEB-03` | **OBSERVADO (Fallo Alto)** | `sgrai-api` exige `misiones:asignar` (`403`), pero en frontend `usePuedeAsignarMision` aplica política *Fail-Open* y `DetalleEventoRecuperacionClient` fija `DEFAULT_ENCARGADO_ID` (`BUG-H32-WEB-03`). |
