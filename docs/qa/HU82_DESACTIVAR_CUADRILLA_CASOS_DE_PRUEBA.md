# Plan y Reporte de Pruebas QA — HU-82: Desactivar Cuadrilla Operativa (Frontend / Web)

**Proyecto:** SGRAI — Sistema de Gestión de Recursos para Atención de Incidentes (DGRD Municipalidad de Valdivia)  
**Repositorio:** `sgrai-web`  
**Rama Evaluada:** `feature/H82-desactivar-cuadrilla`  
**Historia de Usuario:** HU-82 — *Como Administrador Quiero desactivar mediante baja lógica una cuadrilla operativa que haya sido disuelta o retirada de servicio Para evitar que sea asignada a nuevos incidentes, preservando el historial completo de misiones e informes técnicos en los que participó.*  
**Estado de Certificación QA:** `APROBADO (RE-TEST SUPERADO 100% — 20/20 CASOS APROBADOS)`  
**Fecha de Ejecución Inicial:** `03/11/2026 16:45`  
**Fecha de Re-Test:** `03/11/2026 17:20`

---

## 1. Resumen Ejecutivo de Auditoría y Ciclo de Re-Test

Durante la iteración inicial de auditoría estática y pruebas dinámicas sobre la interfaz web de administración de cuadrillas (`sgrai-web`), se ejecutaron **20 casos de prueba**, identificándose **5 defectos reales** (**2 Críticos**, **2 Altos** y **1 Medio**) relacionados con mutaciones locales silenciosas ante fallos de backend, discrepancias de contrato en filtros de consulta, validación RBAC perimetral, tipado OpenAPI y sincronización del estado local tras la baja lógica.

En la fase de **Re-Test**, tras la integración de las correcciones (`fix(cuadrillas): corregir defectos de auditoria QA en desactivacion y filtros (H82)`) y la sincronización con `develop` (`merge: resolver conflictos con develop tras integracion de H79 y H81`), se verificó la resolución de la totalidad de los hallazgos:

- **100% de defectos corregidos y verificados (5/5)**.
- **100% de casos de prueba aprobados en la matriz consolidada (20/20)**.
- **52/52 pruebas automatizadas del módulo de cuadrillas en Vitest aprobadas (`7/7` suites)** y compilación estricta de TypeScript (`npx tsc --noEmit`) sin errores.

### Resumen de Verificación de Hallazgos Resueltos en Re-Test

#### 1.1. `[BUG-H82-WEB-01]` (Severidad: CRÍTICA — Resuelto) — Eliminación de falso positivo en baja lógica (`desactivarCuadrilla`)
- **Archivo verificado:** `src/services/cuadrillasService.ts` (líneas 1131–1213).
- **Resolución implementada:** Se eliminó por completo el bloque de fallback mutativo local tanto en el manejo de respuestas `!response.ok` como en el bloque `catch`. Ante un código `401 Unauthorized`, el servicio lanza `CuadrillaServiceError('Sesión expirada o no autenticada.', 401, 'general', 'NO_AUTENTICADO')`; ante errores `500` o caídas de red (`TypeError: Failed to fetch`), propaga estrictamente `CuadrillaServiceError` sin mutar `cuadrillasMockState` ni retornar confirmaciones simuladas.
- **Evidencia de verificación:** Cubierto por las pruebas unitarias en `src/services/__tests__/cuadrillasService.test.ts` (líneas 521–587) para `401 Unauthorized`, `500 Internal Server Error` y `Network failure`.

#### 1.2. `[BUG-H82-WEB-02]` (Severidad: CRÍTICA — Resuelto) — Normalización de filtros compatibles con OpenAPI en `obtenerCuadrillas`
- **Archivo verificado:** `src/services/cuadrillasService.ts` (líneas 759–784).
- **Resolución implementada:** Se normalizó el parámetro `estado` antes de invocar `apiClient.GET('/api/cuadrillas')`:
  - Cuando `filtros?.estado === 'INACTIVAS'`, se envía `estado: 'NO_DISPONIBLE'` junto con `incluirInactivas: true`.
  - Cuando `filtros?.estado === 'TODAS'`, se omite el parámetro `estado` (`undefined`) y se envía `incluirInactivas: true`.
  - Esto evita el rechazo `400 Bad Request` del validador Zod del backend ante valores de UI fuera del enum de dominio.
- **Evidencia de verificación:** Cubierto por las pruebas unitarias en `src/services/__tests__/cuadrillasService.test.ts` (líneas 419–461).

#### 1.3. `[BUG-H82-WEB-03]` (Severidad: ALTA — Resuelto) — Control de acceso RBAC perimetral (`AccesoDenegadoState`) y segregación del permiso `cuadrillas:eliminar`
- **Archivo verificado:** `src/components/admin/cuadrillas/CuadrillasAdminClient.tsx` (líneas 29–43 y 165–195).
- **Resolución implementada:**
  - Se incorporó la verificación explícita `tienePermisoLectura = Boolean(isMounted && (hasPermission('recursos:leer') || esAdmin))`, renderizando el componente institucional `<AccesoDenegadoState permisoRequerido="recursos:leer" ... />` cuando un usuario carece de permisos de lectura.
  - Se restringió `puedeEliminar` exclusivamente a `Boolean(isMounted && (hasPermission('cuadrillas:eliminar') || esAdmin))`, removiendo la concesión indebida mediante `recursos:eliminar`.
- **Evidencia de verificación:** Cubierto por la suite `src/components/admin/cuadrillas/__tests__/CuadrillasAdminClient.test.tsx` (líneas 1–88).

#### 1.4. `[BUG-H82-WEB-04]` (Severidad: ALTA — Resuelto) — Esquema tipado en `api-generated.d.ts` y corrección de aserciones en prueba unitaria de `409 Conflict`
- **Archivos verificados:** `src/types/api-generated.d.ts`, `src/services/cuadrillasService.ts` (líneas 1134–1141) y `src/services/__tests__/cuadrillasService.test.ts` (líneas 499–519).
- **Resolución implementada:** Se incorporó la cabecera opcional `authorization?: string` en las operaciones de cuadrillas dentro de `src/types/api-generated.d.ts`, permitiendo invocar `apiClient.DELETE('/api/cuadrillas/{id}', { params: { path: { id }, header: { authorization: authHeader } } })` sin conversiones inseguras `as unknown as`. Adicionalmente, el test unitario de `409 Conflict` ejecuta una única llamada dentro del bloque `try` seguida de `expect.unreachable(...)`, garantizando la validación efectiva de las propiedades del error en el bloque `catch`.

#### 1.5. `[BUG-H82-WEB-05]` (Severidad: MEDIA — Resuelto) — Limpieza de dotación en estado local tras baja y visualización de `eliminadoEn` en Drawer
- **Archivos verificados:** `src/components/admin/cuadrillas/CuadrillasAdminClient.tsx` (líneas 127–137), `src/services/cuadrillasService.ts` (líneas 1149–1156) y `src/components/admin/cuadrillas/CuadrillaDetalleDrawer.tsx` (líneas 369–374).
- **Resolución implementada:** Al confirmarse la baja lógica (`handleDesactivada`), el estado local de la cuadrilla limpia `recursos: []`, `trabajadores: []`, `totalRecursos: 0` y `totalTrabajadores: 0`, sincronizándose con la liberación automática ejecutada en el backend (CA-5). Asimismo, `CuadrillaDetalleDrawer` muestra el indicador institucional con la marca temporal formateada (`Eliminado / Dado de baja: {new Date(cuadrilla.eliminadoEn).toLocaleString('es-CL')}`).

---

## 2. Trazabilidad de Criterios de Aceptación (HU-82)

| Criterio de Aceptación (CA) | Cobertura en Casos de Prueba | Estado Inicial | Estado Re-Test | Observación Técnica |
| :--- | :--- | :---: | :---: | :--- |
| **CA-1:** Acción "Desactivar / Dar de Baja" visible para Administrador en listado/detalle de cuadrillas activas. | `TC-H82-WEB-01`, `TC-H82-WEB-02`, `BUG-H82-WEB-03` | Observado | **Cumple (100%)** | Restringido estrictamente a `cuadrillas:eliminar` o rol `Administrador`, con guardia `<AccesoDenegadoState />` para usuarios sin `recursos:leer`. |
| **CA-2:** Modal de confirmación informando que la cuadrilla no podrá asignarse a nuevas misiones pero conservará su historial. | `TC-H82-WEB-03`, `TC-H82-WEB-04` | Cumple | **Cumple (100%)** | `CuadrillaDesactivarModal` presenta el aviso institucional, el detalle de dotación a liberar y estados de carga. |
| **CA-3:** Baja lógica (`activo = false` / `NO_DISPONIBLE` / `eliminadoEn`) sin borrado físico. | `TC-H82-WEB-05`, `BUG-H82-WEB-01`, `BUG-H82-WEB-04` | Fallido | **Cumple (100%)** | `desactivarCuadrilla` invoca `DELETE /api/cuadrillas/{id}` con tipado estricto OpenAPI y sin fallbacks locales que oculten errores HTTP o de red. |
| **CA-4:** Bloqueo de baja (`409 Conflict`) si la cuadrilla tiene misiones activas (`EN_RUTA`, `EN_TERRENO`, `ASIGNADA`). | `TC-H82-WEB-06`, `TC-H82-WEB-07`, `TC-H82-WEB-08` | Cumple | **Cumple (100%)** | Botón deshabilitado preventivamente en `EN_RUTA`/`EN_TERRENO` y alerta de error (`role="alert"`) en el modal cuando el backend responde `409 Conflict`. |
| **CA-5:** Liberación automática de recursos y miembros activos al desactivar la cuadrilla. | `TC-H82-WEB-09`, `BUG-H82-WEB-05` | Observado | **Cumple (100%)** | El estado local en `CuadrillasAdminClient` vacía `recursos` y `trabajadores` (`0` asignados) y `CuadrillaDetalleDrawer` exhibe la marca `eliminadoEn`. |
| **CA-6:** Exclusión por defecto de selectores/listados activos y consulta histórica mediante filtro "Inactivas". | `TC-H82-WEB-10` a `TC-H82-WEB-15`, `BUG-H82-WEB-02` | Fallido | **Cumple (100%)** | Normalización de `INACTIVAS` (`estado: 'NO_DISPONIBLE'`, `incluirInactivas: true`) y `TODAS` (`incluirInactivas: true`) compatible con OpenAPI. |

---

## 3. Matriz Consolidada de Casos de Prueba (13 Columnas)

| ID Caso | Título del Caso de Prueba | Tipo de Prueba | Nivel | Prioridad | Precondición | Datos de Prueba (Payload / Headers / Query) | Resultado Esperado | Resultado Obtenido | Estado | Fecha / Hora Ejecución | Fecha / Hora Re-Test | Solución / Commit |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **BUG-H82-WEB-01** | Falso positivo de baja lógica cuando la API falla con 401/500 o error de red por fallback silencioso en cuadrillasService | Funcional / Seguridad | Integración / Servicio | Crítica | Cliente autenticado con sesión expirada o API caída al confirmar baja en `CuadrillaDesactivarModal`. | `DELETE /api/cuadrillas/cua-001` -> Simulación de respuesta `401 Unauthorized`, `500 Internal Server Error` o `TypeError: Failed to fetch` | El servicio debe propagar `CuadrillaServiceError` para que el modal muestre `role="alert"` con el error y mantenga la cuadrilla activa sin engañar al usuario. | En Re-Test: Se eliminó el fallback mutativo local en `desactivarCuadrilla`. Ante `401`, `500` o fallo de red se lanza `CuadrillaServiceError` (`status: 401` / `500`), preservando la API como única fuente de verdad. | APROBADO | 03/11/2026 16:45 | 03/11/2026 17:20 | `fix(cuadrillas): corregir defectos de auditoria QA en desactivacion y filtros (H82)` |
| **BUG-H82-WEB-02** | Filtro de estado 'INACTIVAS' o 'TODAS' envía valores inválidos al query param `estado` causando 400 Bad Request en Backend | Funcional / Contrato API | Integración / Servicio | Crítica | Seleccionar opción "Inactivas (Dadas de baja)" o "Todas (Activas e Inactivas)" en `CuadrillasFiltros`. | `obtenerCuadrillas({ estado: 'INACTIVAS', incluirInactivas: true })` -> Query a `GET /api/cuadrillas` | `obtenerCuadrillas` no debe enviar `estado=INACTIVAS` ni `estado=TODAS` en la query HTTP; debe mapear `INACTIVAS` a `estado=NO_DISPONIBLE&incluirInactivas=true` y `TODAS` a `incluirInactivas=true`. | En Re-Test: `obtenerCuadrillas` normaliza `estado === 'INACTIVAS'` a `estado: 'NO_DISPONIBLE'` con `incluirInactivas: true`, y en `TODAS` omite `estado` enviando `incluirInactivas: true`. | APROBADO | 03/11/2026 16:45 | 03/11/2026 17:20 | `fix(cuadrillas): corregir defectos de auditoria QA en desactivacion y filtros (H82)` |
| **BUG-H82-WEB-03** | Ausencia de guardia RBAC `<AccesoDenegadoState />` en vista `/admin/cuadrillas` y uso de permiso cruzado `recursos:eliminar` | Seguridad / RBAC | Componente / UI | Alta | Usuario autenticado sin permiso `recursos:leer` o usuario con `recursos:eliminar` pero sin `cuadrillas:eliminar`. | Render de `<CuadrillasAdminClient />` con `usePermissions()` sin `recursos:leer` o solo con `recursos:eliminar` | Sin `recursos:leer` debe renderizar `<AccesoDenegadoState permisoRequerido="recursos:leer" />`. La acción de desactivar cuadrilla debe exigir estrictamente `cuadrillas:eliminar` o rol `Administrador`. | En Re-Test: `CuadrillasAdminClient` verifica `tienePermisoLectura` renderizando `<AccesoDenegadoState />` ante ausencia de `recursos:leer`, y restringe `puedeEliminar` exclusivamente a `cuadrillas:eliminar` o rol `Administrador`. | APROBADO | 03/11/2026 16:45 | 03/11/2026 17:20 | `fix(cuadrillas): corregir defectos de auditoria QA en desactivacion y filtros (H82)` |
| **BUG-H82-WEB-04** | Bypass de tipos con `as unknown as` en `DELETE /api/cuadrillas/{id}` y test unitario de 409 con doble invocación y `catch` inalcanzable | Calidad de Código / Contrato OpenAPI | Unitario / Servicio | Alta | Ejecución de `desactivarCuadrilla('cua-003')` con respuesta `409 Conflict` en suite unitaria `cuadrillasService.test.ts`. | `DELETE /api/cuadrillas/cua-003` con mock `409 Conflict` (`CUADRILLA_CON_MISION_ACTIVA`) | Llamada tipada contra `paths['/api/cuadrillas/{id}']['delete']` en `api-generated.d.ts` y test unitario que invoque una sola vez la función verificando todas las aserciones del `catch`. | En Re-Test: Se tipó la cabecera `authorization` en `api-generated.d.ts` eliminando el cast `as unknown as`, y el test de `409 Conflict` realiza una única llamada validando `status: 409` y `code: 'CUADRILLA_CON_MISION_ACTIVA'`. | APROBADO | 03/11/2026 16:45 | 03/11/2026 17:20 | `fix(cuadrillas): corregir defectos de auditoria QA en desactivacion y filtros (H82)` |
| **BUG-H82-WEB-05** | Estado local en `CuadrillasAdminClient` retiene recursos y trabajadores tras la baja lógica y `CuadrillaDetalleDrawer` omite fecha `eliminadoEn` | Funcional / UI (CA-5 / CA-3) | Componente / UI | Media | Desactivar cuadrilla `cua-001` (con 2 trabajadores y 2 recursos) e inspeccionar fila y `CuadrillaDetalleDrawer`. | Callback `onDesactivada('cua-001')` en `CuadrillasAdminClient` y apertura de `<CuadrillaDetalleDrawer cuadrilla={cuaInactiva} />` | La cuadrilla desactivada debe reflejar `0` trabajadores y `0` recursos asignados en el estado local (CA-5) y el Drawer debe mostrar la fecha/hora de baja (`eliminadoEn`). | En Re-Test: `actualizarCuadrillaEnLista` limpia `recursos: []`, `trabajadores: []`, `totalRecursos: 0` y `totalTrabajadores: 0`, y `CuadrillaDetalleDrawer` renderiza `Eliminado / Dado de baja: <fecha>`. | APROBADO | 03/11/2026 16:45 | 03/11/2026 17:20 | `fix(cuadrillas): corregir defectos de auditoria QA en desactivacion y filtros (H82)` |
| **TC-H82-WEB-01** | Renderizado de botón "Desactivar" en `CuadrillasTabla` para cuadrillas activas y ocultamiento en cuadrillas dadas de baja | Funcional (CA-1 / CA-6) | Componente | Alta | `CuadrillasTabla` montada con `puedeEliminar=true`, conteniendo cuadrillas con `activo: true` y `activo: false`. | Props: `cuadrillas=[cuaActiva, cuaInactiva]`, `puedeEliminar=true`, `onDesactivar={vi.fn()}` | Las filas con `activo !== false` muestran el botón `Desactivar cuadrilla <nombre>`; la fila con `activo === false` muestra badge `Inactiva / Dada de baja` y oculta botones `Editar` y `Desactivar`, conservando `Ver`. | El botón de baja se renderiza solo en cuadrillas activas; en la cuadrilla inactiva se oculta junto con Editar y se muestra el badge `Inactiva / Dada de baja`. | APROBADO | 03/11/2026 16:45 | 03/11/2026 17:20 | `feat(cuadrillas): implementar baja logica de cuadrillas operativas (HU-82)` |
| **TC-H82-WEB-02** | Renderizado de botón "Dar de Baja Cuadrilla" en pie de `CuadrillaDetalleDrawer` solo cuando la cuadrilla está activa | Funcional (CA-1) | Componente | Media | `CuadrillaDetalleDrawer` abierto con `puedeEliminar=true` y `onDesactivar` definido. | Props: `cuadrilla={activo: true, estado: 'DISPONIBLE'}`, `puedeEliminar=true`, `onDesactivar={vi.fn()}` | Se muestra botón destructivo `Dar de Baja Cuadrilla` en el pie del Drawer; si `activo === false`, el botón no se renderiza y se muestra banner `Inactiva / Dada de baja`. | El Drawer renderiza el botón `Dar de Baja Cuadrilla` para unidades activas y lo oculta en unidades inactivas mostrando el aviso de unidad dada de baja. | APROBADO | 03/11/2026 16:45 | 03/11/2026 17:20 | `feat(cuadrillas): implementar baja logica de cuadrillas operativas (HU-82)` |
| **TC-H82-WEB-03** | Apertura de `CuadrillaDesactivarModal` con mensaje de preservación de historial y detalle de dotación a liberar | Funcional (CA-2 / CA-5) | Componente | Alta | Administrador pulsa `Desactivar` sobre `Cuadrilla Forestal Alfa` (2 integrantes, 2 recursos). | Props: `cuadrilla={nombre: 'Cuadrilla Forestal Alfa', codigo: 'CUA-001', totalTrabajadores: 2, totalRecursos: 2}`, `isOpen=true` | El modal `role="dialog"` informa que la cuadrilla no podrá asignarse a nuevas misiones pero conservará todo su historial de misiones e informes técnicos, detallando los integrantes y recursos que serán liberados. | El modal renderiza el aviso institucional completo, los datos de la cuadrilla (`CUA-001`) y el bloque de liberación de 2 integrantes y 2 recursos. | APROBADO | 03/11/2026 16:45 | 03/11/2026 17:20 | `feat(cuadrillas): implementar baja logica de cuadrillas operativas (HU-82)` |
| **TC-H82-WEB-04** | Cierre y cancelación segura de `CuadrillaDesactivarModal` sin invocar `DELETE /api/cuadrillas/{id}` | Funcional (CA-2) | Componente | Media | `CuadrillaDesactivarModal` abierto en pantalla sin petición en curso (`isSubmitting=false`). | Clic en botón `Cancelar` o botón `Cerrar modal` (`X`) | Se invoca `onClose()` sin ejecutar `desactivarCuadrilla` ni modificar el estado de la cuadrilla. | Al pulsar `Cancelar`, `onClose` se ejecuta 1 vez y `desactivarCuadrilla` registra 0 llamadas. | APROBADO | 03/11/2026 16:45 | 03/11/2026 17:20 | `feat(cuadrillas): implementar baja logica de cuadrillas operativas (HU-82)` |
| **TC-H82-WEB-05** | Confirmación exitosa de baja lógica (`200 OK`) ejecuta `DELETE /api/cuadrillas/{id}`, invoca `onSuccess` y cierra el modal | Funcional (CA-3) | Integración / UI | Alta | `CuadrillaDesactivarModal` abierto para `cua-001` en estado `DISPONIBLE`. | Clic en `Confirmar Baja Lógica` -> `DELETE /api/cuadrillas/cua-001` responde `200 OK` con `{ id: 'cua-001', activo: false, estado: 'NO_DISPONIBLE', eliminadoEn: '2026-04-19T12:00:00.000Z' }` | Se llama a `desactivarCuadrilla('cua-001')`, se dispara `onSuccess('cua-001')`, se cierra el modal y se muestra notificación toast de confirmación. | La petición `DELETE` se procesa correctamente, se ejecutan `onSuccess('cua-001')` y `onClose()`, actualizando el listado en pantalla. | APROBADO | 03/11/2026 16:45 | 03/11/2026 17:20 | `feat(cuadrillas): implementar baja logica de cuadrillas operativas (HU-82)` |
| **TC-H82-WEB-06** | Bloqueo preventivo de botón "Desactivar" en tabla y Drawer cuando la cuadrilla está `EN_RUTA` o `EN_TERRENO` | Funcional / Regla de Negocio (CA-4) | Componente | Alta | Cuadrilla activa con `estado: 'EN_RUTA'` o `estado: 'EN_TERRENO'` en `CuadrillasTabla` y `CuadrillaDetalleDrawer`. | Fila `cua-002` con `estado: 'EN_RUTA'`, `activo: true` | El botón `Desactivar` se renderiza con atributo `disabled` y tooltip explicativo indicando que no se puede dar de baja una cuadrilla con misión en curso. | El botón `Desactivar cuadrilla Cuadrilla Vialidad Beta` permanece `disabled` en la tabla y en el pie del Drawer. | APROBADO | 03/11/2026 16:45 | 03/11/2026 17:20 | `feat(cuadrillas): implementar baja logica de cuadrillas operativas (HU-82)` |
| **TC-H82-WEB-07** | Bloqueo en `CuadrillaDesactivarModal` al recibir `409 Conflict` (`CUADRILLA_CON_MISION_ACTIVA`) desde el backend | Funcional / Regla de Negocio (CA-4) | Integración / UI | Alta | Cuadrilla con misión `ASIGNADA` en backend; usuario intenta confirmar baja en `CuadrillaDesactivarModal`. | Clic en `Confirmar Baja Lógica` -> `DELETE /api/cuadrillas/cua-002` retorna `409 Conflict` `{ error: { code: 'CUADRILLA_CON_MISION_ACTIVA', message: 'No se puede desactivar la cuadrilla porque tiene una misión activa en curso (EN_RUTA).' } }` | El modal captura `CuadrillaServiceError` (`status: 409`), muestra banner `role="alert"` con el detalle de la misión activa, no invoca `onSuccess` y mantiene el modal abierto. | Se renderiza `role="alert"` con el mensaje exacto del backend (`409 Conflict`), sin invocar `onSuccess` ni cerrar el modal. | APROBADO | 03/11/2026 16:45 | 03/11/2026 17:20 | `feat(cuadrillas): implementar baja logica de cuadrillas operativas (HU-82)` |
| **TC-H82-WEB-08** | Propagación de `CuadrillaServiceError` con `status: 404` cuando se intenta desactivar una cuadrilla inexistente o ya dada de baja | Funcional / Borde (CA-3) | Unitario / Servicio | Media | Invocación a `desactivarCuadrilla('cua-inexistente')` contra la API. | `DELETE /api/cuadrillas/cua-inexistente` -> `404 Not Found` `{ error: { code: 'NOT_FOUND', message: 'Cuadrilla no encontrada o ya inactiva.' } }` | `desactivarCuadrilla` lanza `CuadrillaServiceError` con `status: 404` y `code: 'NOT_FOUND'`. | El servicio lanza `CuadrillaServiceError` con `status: 404` y el mensaje devuelto por el servidor. | APROBADO | 03/11/2026 16:45 | 03/11/2026 17:20 | `feat(cuadrillas): implementar baja logica de cuadrillas operativas (HU-82)` |
| **TC-H82-WEB-09** | Normalización de la respuesta de `DELETE /api/cuadrillas/{id}` (`activo: false`, `estado: 'NO_DISPONIBLE'`, `eliminadoEn`) | Funcional (CA-3 / CA-5) | Unitario / Servicio | Alta | Invocación a `desactivarCuadrilla('cua-001')` con respuesta `200 OK` del backend. | `DELETE /api/cuadrillas/cua-001` -> `200 OK` `{ data: { id: 'cua-001', nombre: 'Cuadrilla Forestal Alfa', estado: 'NO_DISPONIBLE', activo: false, eliminado_en: '2026-04-19T12:00:00.000Z' } }` | Retorna objeto `Cuadrilla` normalizado con `activo: false`, `estado: 'NO_DISPONIBLE'`, `eliminadoEn: '2026-04-19T12:00:00.000Z'`, `totalTrabajadores: 0` y `totalRecursos: 0`. | El objeto retornado contiene `activo: false`, `estado: 'NO_DISPONIBLE'`, `eliminadoEn` poblado y contadores de dotación en `0`. | APROBADO | 03/11/2026 16:45 | 03/11/2026 17:20 | `fix(cuadrillas): corregir defectos de auditoria QA en desactivacion y filtros (H82)` |
| **TC-H82-WEB-10** | Exclusión por defecto de cuadrillas inactivas en el listado principal de `/admin/cuadrillas` | Funcional (CA-6) | Integración / Hook | Alta | Hook `useCuadrillas` inicializado con filtros por defecto (`estado: ''`, `incluirInactivas: false`). | `obtenerCuadrillas({ incluirInactivas: false })` con dataset mixto (`cua-001` activa, `cua-004` inactiva) | El listado `cuadrillasFiltradas` excluye automáticamente toda cuadrilla con `activo === false`. | Por defecto solo se listan las cuadrillas con `activo !== false`, ocultando las unidades dadas de baja. | APROBADO | 03/11/2026 16:45 | 03/11/2026 17:20 | `feat(cuadrillas): implementar baja logica de cuadrillas operativas (HU-82)` |
| **TC-H82-WEB-11** | Filtrado de cuadrillas dadas de baja al seleccionar "Inactivas (Dadas de baja)" en `CuadrillasFiltros` | Funcional (CA-6) | Integración / Hook | Alta | Usuario cambia el selector `Filtrar por estado` a `INACTIVAS` en `CuadrillasFiltros`. | `setFiltroEstado('INACTIVAS')` -> `incluirInactivas` se activa en `true` y filtra `c.activo === false` | El hook solicita `incluirInactivas: true` al servicio y filtra en memoria únicamente las cuadrillas con `activo === false`. | La tabla muestra exclusivamente las cuadrillas dadas de baja con su badge `Inactiva / Dada de baja` y acción `Ver` para auditoría histórica. | APROBADO | 03/11/2026 16:45 | 03/11/2026 17:20 | `fix(cuadrillas): corregir defectos de auditoria QA en desactivacion y filtros (H82)` |
| **TC-H82-WEB-12** | Visualización conjunta de cuadrillas activas e inactivas al seleccionar "Todas (Activas e Inactivas)" | Funcional (CA-6) | Integración / Hook | Media | Usuario selecciona `TODAS` en el filtro de estado de `CuadrillasFiltros`. | `setFiltroEstado('TODAS')` -> `incluirInactivas: true` | El listado incluye tanto las cuadrillas operativas activas como las dadas de baja (`activo: false`). | Se listan todas las cuadrillas registradas diferenciando visualmente las inactivas con opacidad reducida y badge de baja. | APROBADO | 03/11/2026 16:45 | 03/11/2026 17:20 | `fix(cuadrillas): corregir defectos de auditoria QA en desactivacion y filtros (H82)` |
| **TC-H82-WEB-13** | Preservación y visualización de historial de misiones e informes técnicos en `CuadrillaDetalleDrawer` para cuadrilla inactiva | Funcional (CA-2 / CA-3 / CA-6) | Componente | Alta | Abrir `CuadrillaDetalleDrawer` sobre una cuadrilla inactiva (`activo: false`) con historial de misiones previas. | `GET /api/cuadrillas/cua-004` retorna `activo: false`, `eliminadoEn: '2026-04-10T18:00:00.000Z'` e `historialMisiones: [mis-099]` | El Drawer muestra el banner `Inactiva / Dada de baja`, la fecha de desactivación `eliminadoEn` y renderiza íntegro el bloque `Historial de Misiones (1)` con sus folios, fechas y estados. | El Drawer presenta toda la trazabilidad histórica de misiones, la fecha de baja formateada en `es-CL` y oculta los botones de edición/desactivación. | APROBADO | 03/11/2026 16:45 | 03/11/2026 17:20 | `fix(cuadrillas): corregir defectos de auditoria QA en desactivacion y filtros (H82)` |
| **TC-H82-WEB-14** | Exclusión de cuadrillas inactivas en el selector de despacho de misión del Centro de Mando (`AsignarRecursoModal`) | Funcional / Integración ICS (CA-6) | Integración / Componente | Alta | Encargado abre `AsignarRecursoModal` en el Centro de Mando para despachar una cuadrilla a un incidente. | `obtenerCuadrillasDisponibles(token, delegacionId)` -> `GET /api/cuadrillas?estado=DISPONIBLE` | El servicio consulta únicamente cuadrillas con `estado=DISPONIBLE` (activas) y filtra en cliente `c.estado === 'DISPONIBLE'`, impidiendo que cuadrillas dadas de baja aparezcan en el selector de asignación. | Las cuadrillas dadas de baja (`activo: false`, `estado: 'NO_DISPONIBLE'`) quedan excluidas del selector de asignación de incidentes. | APROBADO | 03/11/2026 16:45 | 03/11/2026 17:20 | `feat(cuadrillas): implementar baja logica de cuadrillas operativas (HU-82)` |
| **TC-H82-WEB-15** | Ocultamiento de acciones de baja para roles sin permiso `cuadrillas:eliminar` (ej. Supervisor / Encargado solo lectura) | Seguridad / RBAC (CA-1) | Componente | Alta | Usuario con permiso `recursos:leer` pero sin `cuadrillas:eliminar` ni rol `Administrador` visualiza `/admin/cuadrillas`. | `CuadrillasTabla` y `CuadrillaDetalleDrawer` con `puedeEliminar=false` | No se renderiza el botón `Desactivar` en las filas de la tabla ni el botón `Dar de Baja Cuadrilla` en el Drawer de detalle. | Los controles de baja lógica no existen en el DOM cuando `puedeEliminar` es `false`. | APROBADO | 03/11/2026 16:45 | 03/11/2026 17:20 | `fix(cuadrillas): corregir defectos de auditoria QA en desactivacion y filtros (H82)` |

---

## 4. Bloque TSV para Hoja de Cálculo de Seguimiento

````tsv
ID Caso	Título del Caso de Prueba	Tipo de Prueba	Nivel	Prioridad	Precondición	Datos de Prueba (Payload / Headers / Query)	Resultado Esperado	Resultado Obtenido	Estado	Fecha / Hora Ejecución	Fecha / Hora Re-Test	Solución / Commit
BUG-H82-WEB-01	Falso positivo de baja lógica cuando la API falla con 401/500 o error de red por fallback silencioso en cuadrillasService	Funcional / Seguridad	Integración / Servicio	Crítica	Cliente autenticado con sesión expirada o API caída al confirmar baja en CuadrillaDesactivarModal.	DELETE /api/cuadrillas/cua-001 -> Simulación de respuesta 401 Unauthorized, 500 Internal Server Error o TypeError: Failed to fetch	El servicio debe propagar CuadrillaServiceError para que el modal muestre role="alert" con el error y mantenga la cuadrilla activa sin engañar al usuario.	En Re-Test: Se eliminó el fallback mutativo local en desactivarCuadrilla. Ante 401, 500 o fallo de red se lanza CuadrillaServiceError (status: 401 / 500), preservando la API como única fuente de verdad.	APROBADO	03/11/2026 16:45	03/11/2026 17:20	fix(cuadrillas): corregir defectos de auditoria QA en desactivacion y filtros (H82)
BUG-H82-WEB-02	Filtro de estado 'INACTIVAS' o 'TODAS' envía valores inválidos al query param estado causando 400 Bad Request en Backend	Funcional / Contrato API	Integración / Servicio	Crítica	Seleccionar opción "Inactivas (Dadas de baja)" o "Todas (Activas e Inactivas)" en CuadrillasFiltros.	obtenerCuadrillas({ estado: 'INACTIVAS', incluirInactivas: true }) -> Query a GET /api/cuadrillas	obtenerCuadrillas no debe enviar estado=INACTIVAS ni estado=TODAS en la query HTTP; debe mapear INACTIVAS a estado=NO_DISPONIBLE&incluirInactivas=true y TODAS a incluirInactivas=true.	En Re-Test: obtenerCuadrillas normaliza estado === 'INACTIVAS' a estado: 'NO_DISPONIBLE' con incluirInactivas: true, y en TODAS omite estado enviando incluirInactivas: true.	APROBADO	03/11/2026 16:45	03/11/2026 17:20	fix(cuadrillas): corregir defectos de auditoria QA en desactivacion y filtros (H82)
BUG-H82-WEB-03	Ausencia de guardia RBAC <AccesoDenegadoState /> en vista /admin/cuadrillas y uso de permiso cruzado recursos:eliminar	Seguridad / RBAC	Componente / UI	Alta	Usuario autenticado sin permiso recursos:leer o usuario con recursos:eliminar pero sin cuadrillas:eliminar.	Render de <CuadrillasAdminClient /> con usePermissions() sin recursos:leer o solo con recursos:eliminar	Sin recursos:leer debe renderizar <AccesoDenegadoState permisoRequerido="recursos:leer" />. La acción de desactivar cuadrilla debe exigir estrictamente cuadrillas:eliminar o rol Administrador.	En Re-Test: CuadrillasAdminClient verifica tienePermisoLectura renderizando <AccesoDenegadoState /> ante ausencia de recursos:leer, y restringe puedeEliminar exclusivamente a cuadrillas:eliminar o rol Administrador.	APROBADO	03/11/2026 16:45	03/11/2026 17:20	fix(cuadrillas): corregir defectos de auditoria QA en desactivacion y filtros (H82)
BUG-H82-WEB-04	Bypass de tipos con as unknown as en DELETE /api/cuadrillas/{id} y test unitario de 409 con doble invocación y catch inalcanzable	Calidad de Código / Contrato OpenAPI	Unitario / Servicio	Alta	Ejecución de desactivarCuadrilla('cua-003') con respuesta 409 Conflict en suite unitaria cuadrillasService.test.ts.	DELETE /api/cuadrillas/cua-003 con mock 409 Conflict (CUADRILLA_CON_MISION_ACTIVA)	Llamada tipada contra paths['/api/cuadrillas/{id}']['delete'] en api-generated.d.ts y test unitario que invoque una sola vez la función verificando todas las aserciones del catch.	En Re-Test: Se tipó la cabecera authorization en api-generated.d.ts eliminando el cast as unknown as, y el test de 409 Conflict realiza una única llamada validando status: 409 y code: 'CUADRILLA_CON_MISION_ACTIVA'.	APROBADO	03/11/2026 16:45	03/11/2026 17:20	fix(cuadrillas): corregir defectos de auditoria QA en desactivacion y filtros (H82)
BUG-H82-WEB-05	Estado local en CuadrillasAdminClient retiene recursos y trabajadores tras la baja lógica y CuadrillaDetalleDrawer omite fecha eliminadoEn	Funcional / UI (CA-5 / CA-3)	Componente / UI	Media	Desactivar cuadrilla cua-001 (con 2 trabajadores y 2 recursos) e inspeccionar fila y CuadrillaDetalleDrawer.	Callback onDesactivada('cua-001') en CuadrillasAdminClient y apertura de <CuadrillaDetalleDrawer cuadrilla={cuaInactiva} />	La cuadrilla desactivada debe reflejar 0 trabajadores y 0 recursos asignados en el estado local (CA-5) y el Drawer debe mostrar la fecha/hora de baja (eliminadoEn).	En Re-Test: actualizarCuadrillaEnLista limpia recursos: [], trabajadores: [], totalRecursos: 0 y totalTrabajadores: 0, y CuadrillaDetalleDrawer renderiza Eliminado / Dado de baja: <fecha>.	APROBADO	03/11/2026 16:45	03/11/2026 17:20	fix(cuadrillas): corregir defectos de auditoria QA en desactivacion y filtros (H82)
TC-H82-WEB-01	Renderizado de botón "Desactivar" en CuadrillasTabla para cuadrillas activas y ocultamiento en cuadrillas dadas de baja	Funcional (CA-1 / CA-6)	Componente	Alta	CuadrillasTabla montada con puedeEliminar=true, conteniendo cuadrillas con activo: true y activo: false.	Props: cuadrillas=[cuaActiva, cuaInactiva], puedeEliminar=true, onDesactivar={vi.fn()}	Las filas con activo !== false muestran el botón Desactivar cuadrilla <nombre>; la fila con activo === false muestra badge Inactiva / Dada de baja y oculta botones Editar y Desactivar, conservando Ver.	El botón de baja se renderiza solo en cuadrillas activas; en la cuadrilla inactiva se oculta junto con Editar y se muestra el badge Inactiva / Dada de baja.	APROBADO	03/11/2026 16:45	03/11/2026 17:20	feat(cuadrillas): implementar baja logica de cuadrillas operativas (HU-82)
TC-H82-WEB-02	Renderizado de botón "Dar de Baja Cuadrilla" en pie de CuadrillaDetalleDrawer solo cuando la cuadrilla está activa	Funcional (CA-1)	Componente	Media	CuadrillaDetalleDrawer abierto con puedeEliminar=true y onDesactivar definido.	Props: cuadrilla={activo: true, estado: 'DISPONIBLE'}, puedeEliminar=true, onDesactivar={vi.fn()}	Se muestra botón destructivo Dar de Baja Cuadrilla en el pie del Drawer; si activo === false, el botón no se renderiza y se muestra banner Inactiva / Dada de baja.	El Drawer renderiza el botón Dar de Baja Cuadrilla para unidades activas y lo oculta en unidades inactivas mostrando el aviso de unidad dada de baja.	APROBADO	03/11/2026 16:45	03/11/2026 17:20	feat(cuadrillas): implementar baja logica de cuadrillas operativas (HU-82)
TC-H82-WEB-03	Apertura de CuadrillaDesactivarModal con mensaje de preservación de historial y detalle de dotación a liberar	Funcional (CA-2 / CA-5)	Componente	Alta	Administrador pulsa Desactivar sobre Cuadrilla Forestal Alfa (2 integrantes, 2 recursos).	Props: cuadrilla={nombre: 'Cuadrilla Forestal Alfa', codigo: 'CUA-001', totalTrabajadores: 2, totalRecursos: 2}, isOpen=true	El modal role="dialog" informa que la cuadrilla no podrá asignarse a nuevas misiones pero conservará todo su historial de misiones e informes técnicos, detallando los integrantes y recursos que serán liberados.	El modal renderiza el aviso institucional completo, los datos de la cuadrilla (CUA-001) y el bloque de liberación de 2 integrantes y 2 recursos.	APROBADO	03/11/2026 16:45	03/11/2026 17:20	feat(cuadrillas): implementar baja logica de cuadrillas operativas (HU-82)
TC-H82-WEB-04	Cierre y cancelación segura de CuadrillaDesactivarModal sin invocar DELETE /api/cuadrillas/{id}	Funcional (CA-2)	Componente	Media	CuadrillaDesactivarModal abierto en pantalla sin petición en curso (isSubmitting=false).	Clic en botón Cancelar o botón Cerrar modal (X)	Se invoca onClose() sin ejecutar desactivarCuadrilla ni modificar el estado de la cuadrilla.	Al pulsar Cancelar, onClose se ejecuta 1 vez y desactivarCuadrilla registra 0 llamadas.	APROBADO	03/11/2026 16:45	03/11/2026 17:20	feat(cuadrillas): implementar baja logica de cuadrillas operativas (HU-82)
TC-H82-WEB-05	Confirmación exitosa de baja lógica (200 OK) ejecuta DELETE /api/cuadrillas/{id}, invoca onSuccess y cierra el modal	Funcional (CA-3)	Integración / UI	Alta	CuadrillaDesactivarModal abierto para cua-001 en estado DISPONIBLE.	Clic en Confirmar Baja Lógica -> DELETE /api/cuadrillas/cua-001 responde 200 OK con { id: 'cua-001', activo: false, estado: 'NO_DISPONIBLE', eliminadoEn: '2026-04-19T12:00:00.000Z' }	Se llama a desactivarCuadrilla('cua-001'), se dispara onSuccess('cua-001'), se cierra el modal y se muestra notificación toast de confirmación.	La petición DELETE se procesa correctamente, se ejecutan onSuccess('cua-001') y onClose(), actualizando el listado en pantalla.	APROBADO	03/11/2026 16:45	03/11/2026 17:20	feat(cuadrillas): implementar baja logica de cuadrillas operativas (HU-82)
TC-H82-WEB-06	Bloqueo preventivo de botón "Desactivar" en tabla y Drawer cuando la cuadrilla está EN_RUTA o EN_TERRENO	Funcional / Regla de Negocio (CA-4)	Componente	Alta	Cuadrilla activa con estado: 'EN_RUTA' o estado: 'EN_TERRENO' en CuadrillasTabla y CuadrillaDetalleDrawer.	Fila cua-002 con estado: 'EN_RUTA', activo: true	El botón Desactivar se renderiza con atributo disabled y tooltip explicativo indicando que no se puede dar de baja una cuadrilla con misión en curso.	El botón Desactivar cuadrilla Cuadrilla Vialidad Beta permanece disabled en la tabla y en el pie del Drawer.	APROBADO	03/11/2026 16:45	03/11/2026 17:20	feat(cuadrillas): implementar baja logica de cuadrillas operativas (HU-82)
TC-H82-WEB-07	Bloqueo en CuadrillaDesactivarModal al recibir 409 Conflict (CUADRILLA_CON_MISION_ACTIVA) desde el backend	Funcional / Regla de Negocio (CA-4)	Integración / UI	Alta	Cuadrilla con misión ASIGNADA en backend; usuario intenta confirmar baja en CuadrillaDesactivarModal.	Clic en Confirmar Baja Lógica -> DELETE /api/cuadrillas/cua-002 retorna 409 Conflict { error: { code: 'CUADRILLA_CON_MISION_ACTIVA', message: 'No se puede desactivar la cuadrilla porque tiene una misión activa en curso (EN_RUTA).' } }	El modal captura CuadrillaServiceError (status: 409), muestra banner role="alert" con el detalle de la misión activa, no invoca onSuccess y mantiene el modal abierto.	Se renderiza role="alert" con el mensaje exacto del backend (409 Conflict), sin invocar onSuccess ni cerrar el modal.	APROBADO	03/11/2026 16:45	03/11/2026 17:20	feat(cuadrillas): implementar baja logica de cuadrillas operativas (HU-82)
TC-H82-WEB-08	Propagación de CuadrillaServiceError con status: 404 cuando se intenta desactivar una cuadrilla inexistente o ya dada de baja	Funcional / Borde (CA-3)	Unitario / Servicio	Media	Invocación a desactivarCuadrilla('cua-inexistente') contra la API.	DELETE /api/cuadrillas/cua-inexistente -> 404 Not Found { error: { code: 'NOT_FOUND', message: 'Cuadrilla no encontrada o ya inactiva.' } }	desactivarCuadrilla lanza CuadrillaServiceError con status: 404 y code: 'NOT_FOUND'.	El servicio lanza CuadrillaServiceError con status: 404 y el mensaje devuelto por el servidor.	APROBADO	03/11/2026 16:45	03/11/2026 17:20	feat(cuadrillas): implementar baja logica de cuadrillas operativas (HU-82)
TC-H82-WEB-09	Normalización de la respuesta de DELETE /api/cuadrillas/{id} (activo: false, estado: 'NO_DISPONIBLE', eliminadoEn)	Funcional (CA-3 / CA-5)	Unitario / Servicio	Alta	Invocación a desactivarCuadrilla('cua-001') con respuesta 200 OK del backend.	DELETE /api/cuadrillas/cua-001 -> 200 OK { data: { id: 'cua-001', nombre: 'Cuadrilla Forestal Alfa', estado: 'NO_DISPONIBLE', activo: false, eliminado_en: '2026-04-19T12:00:00.000Z' } }	Retorna objeto Cuadrilla normalizado con activo: false, estado: 'NO_DISPONIBLE', eliminadoEn: '2026-04-19T12:00:00.000Z', totalTrabajadores: 0 y totalRecursos: 0.	El objeto retornado contiene activo: false, estado: 'NO_DISPONIBLE', eliminadoEn poblado y contadores de dotación en 0.	APROBADO	03/11/2026 16:45	03/11/2026 17:20	fix(cuadrillas): corregir defectos de auditoria QA en desactivacion y filtros (H82)
TC-H82-WEB-10	Exclusión por defecto de cuadrillas inactivas en el listado principal de /admin/cuadrillas	Funcional (CA-6)	Integración / Hook	Alta	Hook useCuadrillas inicializado con filtros por defecto (estado: '', incluirInactivas: false).	obtenerCuadrillas({ incluirInactivas: false }) con dataset mixto (cua-001 activa, cua-004 inactiva)	El listado cuadrillasFiltradas excluye automáticamente toda cuadrilla con activo === false.	Por defecto solo se listan las cuadrillas con activo !== false, ocultando las unidades dadas de baja.	APROBADO	03/11/2026 16:45	03/11/2026 17:20	feat(cuadrillas): implementar baja logica de cuadrillas operativas (HU-82)
TC-H82-WEB-11	Filtrado de cuadrillas dadas de baja al seleccionar "Inactivas (Dadas de baja)" en CuadrillasFiltros	Funcional (CA-6)	Integración / Hook	Alta	Usuario cambia el selector Filtrar por estado a INACTIVAS en CuadrillasFiltros.	setFiltroEstado('INACTIVAS') -> incluirInactivas se activa en true y filtra c.activo === false	El hook solicita incluirInactivas: true al servicio y filtra en memoria únicamente las cuadrillas con activo === false.	La tabla muestra exclusivamente las cuadrillas dadas de baja con su badge Inactiva / Dada de baja y acción Ver para auditoría histórica.	APROBADO	03/11/2026 16:45	03/11/2026 17:20	fix(cuadrillas): corregir defectos de auditoria QA en desactivacion y filtros (H82)
TC-H82-WEB-12	Visualización conjunta de cuadrillas activas e inactivas al seleccionar "Todas (Activas e Inactivas)"	Funcional (CA-6)	Integración / Hook	Media	Usuario selecciona TODAS en el filtro de estado de CuadrillasFiltros.	setFiltroEstado('TODAS') -> incluirInactivas: true	El listado incluye tanto las cuadrillas operativas activas como las dadas de baja (activo: false).	Se listan todas las cuadrillas registradas diferenciando visualmente las inactivas con opacidad reducida y badge de baja.	APROBADO	03/11/2026 16:45	03/11/2026 17:20	fix(cuadrillas): corregir defectos de auditoria QA en desactivacion y filtros (H82)
TC-H82-WEB-13	Preservación y visualización de historial de misiones e informes técnicos en CuadrillaDetalleDrawer para cuadrilla inactiva	Funcional (CA-2 / CA-3 / CA-6)	Componente	Alta	Abrir CuadrillaDetalleDrawer sobre una cuadrilla inactiva (activo: false) con historial de misiones previas.	GET /api/cuadrillas/cua-004 retorna activo: false, eliminadoEn: '2026-04-10T18:00:00.000Z' e historialMisiones: [mis-099]	El Drawer muestra el banner Inactiva / Dada de baja, la fecha de desactivación eliminadoEn y renderiza íntegro el bloque Historial de Misiones (1) con sus folios, fechas y estados.	El Drawer presenta toda la trazabilidad histórica de misiones, la fecha de baja formateada en es-CL y oculta los botones de edición/desactivación.	APROBADO	03/11/2026 16:45	03/11/2026 17:20	fix(cuadrillas): corregir defectos de auditoria QA en desactivacion y filtros (H82)
TC-H82-WEB-14	Exclusión de cuadrillas inactivas en el selector de despacho de misión del Centro de Mando (AsignarRecursoModal)	Funcional / Integración ICS (CA-6)	Integración / Componente	Alta	Encargado abre AsignarRecursoModal en el Centro de Mando para despachar una cuadrilla a un incidente.	obtenerCuadrillasDisponibles(token, delegacionId) -> GET /api/cuadrillas?estado=DISPONIBLE	El servicio consulta únicamente cuadrillas con estado=DISPONIBLE (activas) y filtra en cliente c.estado === 'DISPONIBLE', impidiendo que cuadrillas dadas de baja aparezcan en el selector de asignación.	Las cuadrillas dadas de baja (activo: false, estado: 'NO_DISPONIBLE') quedan excluidas del selector de asignación de incidentes.	APROBADO	03/11/2026 16:45	03/11/2026 17:20	feat(cuadrillas): implementar baja logica de cuadrillas operativas (HU-82)
TC-H82-WEB-15	Ocultamiento de acciones de baja para roles sin permiso cuadrillas:eliminar (ej. Supervisor / Encargado solo lectura)	Seguridad / RBAC (CA-1)	Componente	Alta	Usuario con permiso recursos:leer pero sin cuadrillas:eliminar ni rol Administrador visualiza /admin/cuadrillas.	CuadrillasTabla y CuadrillaDetalleDrawer con puedeEliminar=false	No se renderiza el botón Desactivar en las filas de la tabla ni el botón Dar de Baja Cuadrilla en el Drawer de detalle.	Los controles de baja lógica no existen en el DOM cuando puedeEliminar es false.	APROBADO	03/11/2026 16:45	03/11/2026 17:20	fix(cuadrillas): corregir defectos de auditoria QA en desactivacion y filtros (H82)
````

---

## 5. Ejecución Paso a Paso y Evidencias Técnicas Replicables

### 5.1. Ejecución de Suites Automatizadas con Vitest y Verificación TypeScript (`tsc --noEmit`)

#### Comando 1: Suite completa del módulo de Cuadrillas y Verificación TypeScript (`tsc --noEmit`)
```bash
npx vitest run src/services/__tests__/cuadrillasService.test.ts src/components/admin/cuadrillas && npx tsc --noEmit
```

**Resultado obtenido en consola:**
```text
 RUN  v3.2.7 /home/ds2fery/Documentos/Proyecto/sgrai-uach/web

 ✓ src/services/__tests__/cuadrillasService.test.ts (23 tests) 68ms
 ✓ src/components/admin/cuadrillas/__tests__/NuevaCuadrillaClient.test.tsx (2 tests) 220ms
 ✓ src/components/admin/cuadrillas/__tests__/CuadrillaDesactivarModal.test.tsx (6 tests) 370ms
 ✓ src/components/admin/cuadrillas/__tests__/CuadrillasAdminClient.test.tsx (2 tests) 261ms
 ✓ src/components/admin/cuadrillas/__tests__/CuadrillasTabla.test.tsx (5 tests) 463ms
 ✓ src/components/admin/cuadrillas/__tests__/CuadrillaForm.test.tsx (6 tests) 585ms
 ✓ src/components/admin/cuadrillas/__tests__/CuadrillaEditarModal.test.tsx (8 tests) 670ms

 Test Files  7 passed (7)
      Tests  52 passed (52)
   Start at  17:17:04
   Duration  3.23s (transform 1.95s, setup 1.24s, collect 4.36s, tests 2.64s, environment 9.02s, prepare 956ms)
```

#### Comando 2: Ejecución focalizada en `desactivarCuadrilla` y filtros de inactivas (`cuadrillasService.test.ts`)
```bash
npx vitest run src/services/__tests__/cuadrillasService.test.ts -t "HU-82"
```

**Resultado obtenido en consola:**
```text
 ✓ src/services/__tests__/cuadrillasService.test.ts (23 tests | 13 skipped) 42ms
   ✓ cuadrillasService > obtenerCuadrillas (HU-82 soporte de inactivas) > envía incluirInactivas=true al consultar cuadrillas inactivas sin enviar 'INACTIVAS' como enum de estado
   ✓ cuadrillasService > obtenerCuadrillas (HU-82 soporte de inactivas) > omite estado en query cuando se solicita TODAS e incluye incluirInactivas=true
   ✓ cuadrillasService > desactivarCuadrilla (HU-82) > desactiva una cuadrilla mediante DELETE /api/cuadrillas/{id} (200 OK)
   ✓ cuadrillasService > desactivarCuadrilla (HU-82) > lanza CuadrillaServiceError con status 409 cuando la cuadrilla tiene misión activa en curso
   ✓ cuadrillasService > desactivarCuadrilla (HU-82) > lanza CuadrillaServiceError con status 404 cuando la cuadrilla no existe o ya fue dada de baja
   ✓ cuadrillasService > desactivarCuadrilla (HU-82) > propaga CuadrillaServiceError con status 401 si la sesión expiró sin mutar estado local (BUG-H82-WEB-01)
   ✓ cuadrillasService > desactivarCuadrilla (HU-82) > propaga CuadrillaServiceError ante un fallo de red sin simular éxito local (BUG-H82-WEB-01)
```

#### Comando 3: Ejecución focalizada en Guardia RBAC (`CuadrillasAdminClient.test.tsx`) y Modal de Baja (`CuadrillaDesactivarModal.test.tsx`)
```bash
npx vitest run src/components/admin/cuadrillas/__tests__/CuadrillasAdminClient.test.tsx src/components/admin/cuadrillas/__tests__/CuadrillaDesactivarModal.test.tsx
```

**Resultado obtenido en consola:**
```text
 ✓ src/components/admin/cuadrillas/__tests__/CuadrillasAdminClient.test.tsx (2 tests) 261ms
   ✓ CuadrillasAdminClient RBAC (HU-82 / BUG-H82-WEB-03) > debe bloquear el acceso y mostrar AccesoDenegadoState si el usuario carece del permiso recursos:leer
   ✓ CuadrillasAdminClient RBAC (HU-82 / BUG-H82-WEB-03) > debe permitir la visualización de la interfaz si el usuario posee recursos:leer
 ✓ src/components/admin/cuadrillas/__tests__/CuadrillaDesactivarModal.test.tsx (6 tests) 370ms
```

---

### 5.2. Pruebas de Contrato HTTP / cURL Replicables (Integración Frontend ↔ Backend `sgrai-api`)

#### Caso A: Baja lógica exitosa (`200 OK` — `TC-H82-WEB-05` / `TC-H82-WEB-09`)
```bash
curl -i -X DELETE "http://localhost:3001/api/cuadrillas/cua-001" \
  -H "Authorization: Bearer <TOKEN_JWT_ADMIN>" \
  -H "Accept: application/json"
```

**Respuesta HTTP/JSON:**
```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{
  "data": {
    "id": "cua-001",
    "codigo": "CUA-001",
    "nombre": "Cuadrilla Forestal Alfa",
    "estado": "NO_DISPONIBLE",
    "activo": false,
    "eliminado_en": "2026-04-19T12:00:00.000Z",
    "total_trabajadores": 0,
    "total_recursos": 0
  }
}
```

#### Caso B: Rechazo por misión activa en curso (`409 Conflict` — `TC-H82-WEB-07`)
```bash
curl -i -X DELETE "http://localhost:3001/api/cuadrillas/cua-002" \
  -H "Authorization: Bearer <TOKEN_JWT_ADMIN>" \
  -H "Accept: application/json"
```

**Respuesta HTTP/JSON:**
```http
HTTP/1.1 409 Conflict
Content-Type: application/json; charset=utf-8

{
  "error": {
    "code": "CUADRILLA_CON_MISION_ACTIVA",
    "message": "No se puede desactivar la cuadrilla porque tiene una misión activa en curso (EN_RUTA)."
  }
}
```

#### Caso C: Consulta de cuadrillas dadas de baja con query normalizada (`200 OK` — `BUG-H82-WEB-02` / `TC-H82-WEB-11`)
```bash
curl -i -X GET "http://localhost:3001/api/cuadrillas?estado=NO_DISPONIBLE&incluirInactivas=true" \
  -H "Authorization: Bearer <TOKEN_JWT_ADMIN>" \
  -H "Accept: application/json"
```

**Respuesta HTTP/JSON:**
```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{
  "data": [
    {
      "id": "cua-001",
      "codigo": "CUA-001",
      "nombre": "Cuadrilla Forestal Alfa",
      "estado": "NO_DISPONIBLE",
      "activo": false,
      "eliminado_en": "2026-04-19T12:00:00.000Z"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```
