# Informe y Matriz de Casos de Prueba (QA): HU-74 — Editar Planificación de Operativo de Recuperación en Curso (Frontend / Web)

> **Documento Oficial de Aseguramiento de Calidad (QA) — Frontend Web**  
> **Proyecto:** Sistema de Gestión de Recursos para Atención de Incidentes (SGRAI) — Dirección de Gestión de Riesgos de Desastres, Municipalidad de Valdivia.  
> **Repositorio:** `sgrai-web`  
> **Módulo:** Centro de Mando / Gestión de Operativos de Recuperación (`/gestion/centro-incidentes`, pestaña *Recuperación*).  
> **Historia de Usuario:** HU-74 — *"Como Encargado Quiero modificar la descripción, fecha estimada y dotación de insumos o personal asignado a un operativo de recuperación en curso Para adaptar el operativo ante variaciones en las necesidades de los sectores afectados o cambios en la disponibilidad logística."*  
> **Desarrollador Asignado:** Mayra Carrillo (`MayraCarrillo`)  
> **Auditor Técnico:** Departamento de Aseguramiento de Calidad (QA Lead) — SGRAI  
> **Servicio Web Auditado:** `sgrai-web` (`Next.js 16.3.4 Webpack` + `React 19.2.8` + `TypeScript 5` + `Vitest v3.2.7` + `Testing Library` + `Zod v4` + CSS Modules).  
> **Rama Git Evaluada:** `feature/H74-editar-operativo-recuperacion`  
> **Commits Evaluados (Conventional Commits):**  
> * `feat(recuperacion): listar y consultar operativos de recuperacion (HU-73)`  
> * `fix(types): preservar contratos de develop y agregar endpoints HU-73 en api-generated`  
> * `feat(recuperacion): edicion de operativos de recuperacion y actualizacion en tiempo real (HU-74)`  
> * `feat(recuperacion): agregar edicion directa en tabla, resguardo de detalle y permisos fallback (HU-74)`  
>  
> **Fecha de Auditoría QA:** `24/11/2026 15:27`  
> **Estado de Certificación QA:** **RECHAZADO — CHANGES REQUESTED (5 DEFECTOS ABIERTOS: 1 CRÍTICO, 2 ALTOS, 2 MEDIOS)**

---

## 1. Resumen Ejecutivo de Auditoría Técnica

Se ejecutó la auditoría técnica estática, funcional, de seguridad RBAC, de concurrencia en tiempo real y de integración contractual frente a `sgrai-api` (OpenAPI `0.12.0` en vivo) sobre la rama `feature/H74-editar-operativo-recuperacion` del repositorio `sgrai-web`.

Aunque las pruebas unitarias actuales (`4` suites relacionadas con `27` tests y la suite global con `130` archivos / `878` tests), el análisis estático (`npm run lint`), el chequeo de tipos (`npx tsc --noEmit`) y la compilación de producción (`npm run build`) finalizan con código de salida `0` dentro de la rama aislada, la inspección forense de código y la verificación contra `sgrai-api` y `develop` evidenciaron **5 defectos reales** (`BUG-H74-WEB-01` a `BUG-H74-WEB-05`) que impiden la aprobación del Pull Request:

| Métrica | Resultado | Observaciones |
|---|:---:|---|
| **Total de Casos Evaluados en Matriz** | **20** | 5 Defectos Abiertos (`BUG-H74-WEB-01` a `BUG-H74-WEB-05`) + 15 Casos Funcionales, Contractuales y Técnicos |
| **Casos Aprobados (Passed)** | **15** | 100% de las pruebas existentes, validaciones en vivo contra API y checks estáticos en rama aislada |
| **Defectos Abiertos / Fallidos (Bugs)** | **5** | 1 Crítico (`BUG-H74-WEB-01`), 2 Altos (`BUG-H74-WEB-02`, `BUG-H74-WEB-03`), 2 Medios (`BUG-H74-WEB-04`, `BUG-H74-WEB-05`) |
| **Casos Bloqueados (Blocked)** | **0** | Entorno de pruebas unitarias, compilación y API en vivo operativos |
| **Tasa de Aprobación Global (% Pass)** | **75.0%** | **No apto para merge** hasta subsanar los 5 hallazgos en ciclo de Re-Test |
| **Análisis Estático de Código (`npm run lint`)** | **0 errores** | Sin errores ESLint en la rama aislada (pendiente sincronización con regla `next/font/google` de `develop`) |
| **Chequeo de Tipos Estáticos (`npx tsc --noEmit`)** | **0 errores** | Compilación TypeScript limpia (`Exit code: 0`) |
| **Suite Automatizada HU-73 / HU-74 (Vitest)** | **27/27 pass** | `recuperacionService.test.ts` (14), `useRecuperacionSocket.test.ts` (4), `ModalEditarOperativoRecuperacion.test.tsx` (6), `OperativosRecuperacionView.test.tsx` (3) |
| **Suite Global del Proyecto (Vitest)** | **878/878 pass** | 130 archivos de prueba ejecutados sin regresiones en la rama aislada |
| **Integración con `develop` (`git merge-tree`)** | **6 conflictos** | Conflictos activos con HU-32 y regla `next/font/local` de `develop` |

### Resumen de Hallazgos Críticos y Bloqueantes

1. **Sobrescritura destructiva de formulario en edición y peticiones `GET` en cascada (`BUG-H74-WEB-01`, Crítica):** `OperativosRecuperacionView.tsx` pasa un callback inline no memoizado (`onCerrar={() => setOperativoSeleccionadoId(null)}`) a `OperativoRecuperacionDrawer.tsx`, el cual incluye `onCerrar` y `toast` en las dependencias de su `useEffect` de consulta. Cualquier re-render de la vista padre o llegada de evento WebSocket `recuperacion:actualizada` refresca el objeto `detalle`, disparando nuevamente el `useEffect([isOpen, operativo, userId])` de `ModalEditarOperativoRecuperacion.tsx` y **borrando los cambios no guardados del operador**.
2. **Política RBAC *Fail-Open* y pérdida de identidad de auditoría (`BUG-H74-WEB-02`, Alta):** `usePuedeEditarRecuperacion.ts` retorna `true` cuando `SimulatedSessionContext` es nulo y no consulta `AuthContext`. Adicionalmente, ni `OperativoRecuperacionDrawer.tsx` ni `OperativosRecuperacionView.tsx` propagan `userId` hacia `ModalEditarOperativoRecuperacion.tsx`, provocando que `editarOperativoRecuperacion` envíe siempre el identificador estático `DEFAULT_ENCARGADO_ID` (`00000000-0000-4000-8000-000000000003`) en `x-user-id` y `getRecursos` envíe `DEFAULT_ADMIN_USER_ID` (`00000000-0000-4000-8000-000000000001`).
3. **Desincronización de `<Select>` con patrulla nula, bloqueo incompleto ante estados cerrados y estado residual de modal (`BUG-H74-WEB-03`, Alta):** Cuando `operativo.patrulla` es `null`, `opcionesPatrulla` omite la opción vacía `""`, dejando visualmente seleccionada la primera patrulla mientras el estado React permanece en `""`. Asimismo, el modal no bloquea edición ante `operativo.estado === 'COMPLETADA' | 'CANCELADA'` ni tras recibir `409 ESTADO_BLOQUEADO`, y `modalEditarAbierto` en el Drawer no se reinicia tras un cierre automático por `404`.
4. **Manejo defectuoso de cantidades, omisión de errores `400` anidados (`recursos.0.cantidad`), catálogo sin filtros y *race condition* en tabla (`BUG-H74-WEB-04`, Media):** El input numérico convierte vacío a `0` (`Number.parseInt(e.target.value, 10) || 0`) y trunca decimales; errores `400` de la API con ruta `recursos.0.cantidad` no se renderizan; `getRecursos` no excluye ítems `NO_DISPONIBLE`/`EN_MANTENCION`; y clics rápidos en filas distintas de la tabla generan condiciones de carrera en `handleAbrirEdicionDirecta`.
5. **Infracción de `GEMINI.md` §3, desfase OpenAPI, conflictos con `develop` y brechas de pruebas/manual (`BUG-H74-WEB-05`, Media):** El botón `"Editar"` de `OperativosRecuperacionTabla.tsx` sobrescribe `<Button variant="secondary">` con estilos inline en lugar de usar `variant="teal"`; `api-generated.d.ts` omite la cabecera `authorization` en `PATCH`; la rama mantiene 6 conflictos pendientes frente a `develop` (incluyendo `next/font/google`); el manual H74 tiene capturas pendientes y omite el botón de tabla; y faltan tests Vitest para edición directa en tabla, `fechaEstimadaFin` y `usePuedeEditarRecuperacion`.

---

## 2. Registro Técnico de Defectos Detectados en Auditoría

| ID Defecto | Título y Descripción Técnica del Defecto | Severidad | Archivo(s) Afectado(s) | Fecha Hallazgo | Estado | Fecha Re-Test | Solución / Commit |
|---|---|:---:|---|:---:|:---:|:---:|---|
| `BUG-H74-WEB-01` | **Sobrescritura destructiva del formulario ante re-renders o WebSocket y peticiones `GET` redundantes en cascada:** `OperativosRecuperacionView.tsx` (línea 189) pasa `onCerrar={() => setOperativoSeleccionadoId(null)}` sin `useCallback`; `OperativoRecuperacionDrawer.tsx` (línea 97) incluye `onCerrar` y `toast` en el `useEffect` de fetch, re-ejecutando `GET /api/eventos-atp/recuperacion/{id}` ante cada render del padre. A su vez, `ModalEditarOperativoRecuperacion.tsx` (línea 134) depende del objeto completo `operativo` en su `useEffect` de precarga, borrando todos los cambios sin guardar del usuario si llega `recuperacion:actualizada` o cambia la referencia del detalle. | Crítica | `src/components/mando/recuperacion/OperativosRecuperacionView.tsx`, `src/components/mando/recuperacion/OperativoRecuperacionDrawer.tsx`, `src/components/mando/recuperacion/ModalEditarOperativoRecuperacion.tsx` | 24/11/2026 15:21 | `ABIERTO` | (Pendiente) | Pendiente (Rechazado en Code Review) |
| `BUG-H74-WEB-02` | **Política RBAC *Fail-Open* en `usePuedeEditarRecuperacion` y suplantación de identidad `x-user-id` con `DEFAULT_ENCARGADO_ID` (CA-4 / CA-5):** `usePuedeEditarRecuperacion.ts` (línea 12) retorna `true` cuando `SimulatedSessionContext` es `null` y no evalúa `AuthContext`. Además, `OperativoRecuperacionDrawer.tsx` (línea 382) y `OperativosRecuperacionView.tsx` (línea 194) omiten pasar `userId` a `ModalEditarOperativoRecuperacion.tsx`, provocando que `editarOperativoRecuperacion` utilice el UUID fijo `DEFAULT_ENCARGADO_ID` (`...0003`) y `getRecursos` utilice `DEFAULT_ADMIN_USER_ID` (`...0001`). El Drawer tampoco expone la auditoría `actualizadoEn` / `actualizadoPorId`. | Alta | `src/hooks/usePuedeEditarRecuperacion.ts`, `src/components/mando/recuperacion/OperativoRecuperacionDrawer.tsx`, `src/components/mando/recuperacion/OperativosRecuperacionView.tsx`, `src/components/mando/recuperacion/ModalEditarOperativoRecuperacion.tsx`, `src/services/recuperacionService.ts` | 24/11/2026 15:21 | `ABIERTO` | (Pendiente) | Pendiente (Rechazado en Code Review) |
| `BUG-H74-WEB-03` | **Desincronización en `<Select>` cuando `operativo.patrulla` es `null`, ausencia de bloqueo reactivo ante `COMPLETADA`/`CANCELADA` o `409 ESTADO_BLOQUEADO` y estado residual en Drawer (CA-2 / CA-3):** Cuando `operativo.patrulla` es `null`, `patrullaId` inicia en `''` pero `opcionesPatrulla` omite la opción vacía, mostrando visualmente seleccionada la primera patrulla e impidiendo seleccionarla mediante `onChange`. Adicionalmente, `ModalEditarOperativoRecuperacion.tsx` no deshabilita el formulario si `operativo.estado` es `COMPLETADA`/`CANCELADA` o tras recibir `409 ESTADO_BLOQUEADO`; `handleAbrirEdicionDirecta` no valida el estado actualizado tras el fetch; y `modalEditarAbierto` en el Drawer no se resetea al cerrarse por `404`. | Alta | `src/components/mando/recuperacion/ModalEditarOperativoRecuperacion.tsx`, `src/components/mando/recuperacion/OperativoRecuperacionDrawer.tsx`, `src/components/mando/recuperacion/OperativosRecuperacionView.tsx` | 24/11/2026 15:22 | `ABIERTO` | (Pendiente) | Pendiente (Rechazado en Code Review) |
| `BUG-H74-WEB-04` | **Defectos en validación/edición de insumos, omisión de errores `400` anidados (`recursos.0.cantidad`) y *race condition* en tabla:** En `ModalEditarOperativoRecuperacion.tsx` (línea 468), `Number.parseInt(e.target.value, 10) \|\| 0` fuerza `0` al vaciar el campo numérico y trunca decimales anulando `Number.isInteger`; errores `400` del backend con clave `recursos.0.cantidad` no se muestran porque la UI solo lee `erroresCampos.recursos` (línea 487); `getRecursos` (línea 105) se consulta sin filtrar ítems `NO_DISPONIBLE`/`EN_MANTENCION` ni restringir activos `esIndividual`; y en `OperativosRecuperacionView.tsx` (líneas 59-73) clics consecutivos en distintas filas compiten por `setOperativoEditando`. | Media | `src/components/mando/recuperacion/ModalEditarOperativoRecuperacion.tsx`, `src/components/mando/recuperacion/OperativosRecuperacionView.tsx` | 24/11/2026 15:26 | `ABIERTO` | (Pendiente) | Pendiente (Rechazado en Code Review) |
| `BUG-H74-WEB-05` | **Infracción de `GEMINI.md` §3 en botón `"Editar"`, desfase OpenAPI, conflictos de fusión con `develop` y brechas de pruebas/manual:** `OperativosRecuperacionTabla.tsx` (líneas 159-182) usa `<Button variant="secondary">` con estilos inline sobrescribiendo colores en lugar de `variant="teal"`; `src/types/api-generated.d.ts` omite el header `authorization` presente en el `openapi.json` en vivo; la rama presenta 6 conflictos de fusión activos frente a `develop` (incluyendo `next/font/google` en `layout.tsx` y colisiones HU-32); `docs/manuals/H74-editar-operativo-recuperacion.md` tiene capturas pendientes y omite edición en tabla; y faltan pruebas Vitest para tabla, RBAC y `fechaEstimadaFin`. | Media | `src/components/mando/recuperacion/OperativosRecuperacionTabla.tsx`, `src/types/api-generated.d.ts`, `src/app/layout.tsx`, `src/services/recuperacionService.ts`, `src/hooks/useRecuperacionSocket.ts`, `docs/manuals/H74-editar-operativo-recuperacion.md` | 24/11/2026 15:24 | `ABIERTO` | (Pendiente) | Pendiente (Rechazado en Code Review) |

---

## 3. Matriz Consolidada de Casos de Prueba (13 Columnas)

| ID Caso | Título del Caso de Prueba | Tipo de Prueba | Nivel | Prioridad | Precondición | Datos de Prueba (Payload / Headers / Query) | Resultado Esperado | Resultado Obtenido | Estado | Fecha / Hora Ejecución | Fecha / Hora Re-Test | Solución / Commit |
|---|---|---|---|---|---|---|---|---|:---:|:---:|:---:|---|
| `BUG-H74-WEB-01` | Preservación de datos editados en modal ante eventos WebSocket `recuperacion:actualizada` y estabilidad de `useEffect` en Drawer | Concurrencia / Reactividad | Integración UI | Crítica | `ModalEditarOperativoRecuperacion` abierto desde `OperativoRecuperacionDrawer` con cambios sin guardar en descripción o recursos | Prop inline `onCerrar={() => ...}` en `OperativosRecuperacionView`, `[operativoId, reloadNonce, onCerrar, toast]` en Drawer y `[isOpen, operativo, userId]` en Modal | El Drawer solo consulta `GET` al cambiar `operativoId` o `reloadNonce`, y el modal conserva intactos los datos no guardados aunque cambie la referencia de `operativo` | `onCerrar` cambia en cada render re-ejecutando `GET`, y cualquier actualización de `operativo` reinicializa todos los estados del formulario en el modal | **ABIERTO** | 24/11/2026 15:21 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| `BUG-H74-WEB-02` | Control RBAC *Fail-Closed* en `usePuedeEditarRecuperacion` y propagación del `userId` autenticado sin suplantación con `DEFAULT_ENCARGADO_ID` | Seguridad / RBAC / Auditoría | Hook / UI / DAL | Alta | Componente renderizado fuera de `SimulatedSessionProvider` o usuario Administrador (`...0001`) editando desde Drawer o tabla | `SimulatedSessionContext = null` y usuario autenticado `id = 00000000-0000-4000-8000-000000000001` sin pasar prop `userId` | `usePuedeEditarRecuperacion` retorna `false` sin contexto y consulta `AuthContext`; el modal propaga el `userId` real hacia `PATCH` y `getRecursos` | `usePuedeEditarRecuperacion` retorna `true` sin contexto (*Fail-Open*) y el modal no recibe `userId`, enviando `DEFAULT_ENCARGADO_ID` (`...0003`) en `PATCH` y `DEFAULT_ADMIN_USER_ID` en `getRecursos` | **ABIERTO** | 24/11/2026 15:21 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| `BUG-H74-WEB-03` | Selección de patrulla cuando `operativo.patrulla` es `null`, bloqueo reactivo ante estado cerrado y limpieza de `modalEditarAbierto` en Drawer | Funcional / Borde / Estado | UI / Modal y Drawer | Alta | Operativo con `patrulla: null` o que transiciona concurrentemente a `COMPLETADA`/`CANCELADA` o retorna `409 ESTADO_BLOQUEADO` | `operativo = { ...base, patrulla: null }`, o `operativo.estado = 'COMPLETADA'`, o cierre automático por `404` mientras modal estaba abierto | El `<Select>` incluye opción vacía `"Seleccione una patrulla..."` evitando desincronización visual; el modal bloquea edición ante estado cerrado/`409` y el Drawer resetea `modalEditarAbierto` | `opcionesPatrulla` omite `value: ''` impidiendo elegir la primera patrulla; el modal mantiene habilitado el submit en `COMPLETADA` o tras `409`; y `modalEditarAbierto` persiste en `true` tras cierre por `404` | **ABIERTO** | 24/11/2026 15:22 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| `BUG-H74-WEB-04` | Edición fluida de cantidades, despliegue de errores `400` anidados (`recursos.0.cantidad`), filtrado de inventario y bloqueo de doble clic en tabla | Validación / Usabilidad / Concurrencia | UI / Modal y Tabla | Media | Modal abierto editando filas de recursos, API retornando `400` en `recursos.0.cantidad` o clics rápidos en filas de tabla | Input cantidad borrado a `""` o decimal `5.5`; respuesta `400` con `errors: [{ campo: "recursos.0.cantidad", mensaje: "La cantidad debe ser mayor a 0" }]` | Input permite edición natural validando enteros `>= 1` al guardar; error `recursos.0.cantidad` visible en formulario; inventario filtra ítems no disponibles; clics rápidos no compiten | `parseInt(...) \|\| 0` fuerza `0` y trunca decimales; `erroresCampos["recursos.0.cantidad"]` queda oculto; `getRecursos` lista recursos sin filtro de disponibilidad; y `handleAbrirEdicionDirecta` permite peticiones concurrentes | **ABIERTO** | 24/11/2026 15:26 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| `BUG-H74-WEB-05` | Cumplimiento de `GEMINI.md` §3 en botón de tabla, sincronización OpenAPI/develop, completitud de manual H74 y cobertura de pruebas | Estándar / Integración / CI | Código / Git / Docs | Media | Inspección de `OperativosRecuperacionTabla.tsx`, `api-generated.d.ts`, `git merge-tree develop HEAD` y `docs/manuals/H74-editar-operativo-recuperacion.md` | `git merge-tree develop HEAD` y contraste con `http://localhost:3001/openapi.json` | Botón usa `<Button variant="teal">` sin estilos inline; `api-generated.d.ts` incluye `authorization`; 0 conflictos con `develop`; manual H74 con capturas y tabla documentada | Botón usa `variant="secondary"` con `style` inline; faltan headers `authorization` en `api-generated.d.ts`; 6 conflictos activos con `develop` + `next/font/google`; capturas pendientes y tests faltantes | **ABIERTO** | 24/11/2026 15:24 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| `CP-H74-WEB-01` | Visualización y habilitación del botón `"Editar Planificación"` en `OperativoRecuperacionDrawer` para operativos en curso (CA-1) | Funcional / UI | UI / Drawer | Alta | Usuario con permiso `recuperacion:editar` abre detalle de operativo en estado `EN_EJECUCION` | `mockOperativoBase` (`id: e4f8b9a1-...`, `estado: 'EN_EJECUCION'`) | El panel superior del Drawer muestra el texto `"Planificación activa editable"` y el botón `"Editar Planificación"` habilitado | Botón `"Editar Planificación"` renderizado y habilitado correctamente en el Drawer (`402ms`) | **APROBADO** | 24/11/2026 15:27 | - | feat(recuperacion): edicion de operativos de recuperacion y actualizacion en tiempo real (HU-74) |
| `CP-H74-WEB-02` | Bloqueo preventivo del botón `"Editar Planificación"` en `OperativoRecuperacionDrawer` cuando el estado es `COMPLETADA` (CA-3) | Regla de Negocio | UI / Drawer | Crítica | Usuario con permiso `recuperacion:editar` abre detalle de operativo culminado | `{ ...mockOperativoBase, estado: 'COMPLETADA' }` | El botón `"Editar Planificación"` se muestra deshabilitado (`disabled`) con mensaje de edición bloqueada | Botón `"Editar Planificación"` verificado en estado `disabled` en Vitest (`368ms`) | **APROBADO** | 24/11/2026 15:27 | - | feat(recuperacion): edicion de operativos de recuperacion y actualizacion en tiempo real (HU-74) |
| `CP-H74-WEB-03` | Bloqueo preventivo del botón `"Editar Planificación"` en `OperativoRecuperacionDrawer` cuando el estado es `CANCELADA` (CA-3) | Regla de Negocio | UI / Drawer | Crítica | Usuario con permiso `recuperacion:editar` abre detalle de operativo cancelado | `{ ...mockOperativoBase, estado: 'CANCELADA' }` | El botón `"Editar Planificación"` se muestra deshabilitado (`disabled`) impidiendo abrir el modal desde el Drawer | Botón `"Editar Planificación"` verificado en estado `disabled` en Vitest (`194ms`) | **APROBADO** | 24/11/2026 15:27 | - | feat(recuperacion): edicion de operativos de recuperacion y actualizacion en tiempo real (HU-74) |
| `CP-H74-WEB-04` | Ocultamiento de la acción `"Editar Planificación"` cuando el usuario carece del permiso `recuperacion:editar` (CA-5) | Seguridad / RBAC | UI / Permisos | Crítica | Hook `usePuedeEditarRecuperacion` retorna `false` (ej. perfil Supervisor sin permiso de edición) | `usePuedeEditarRecuperacion.mockReturnValue(false)` sobre `OperativoRecuperacionDrawer` | La barra de acción y el botón `"Editar Planificación"` no se renderizan en el DOM | Control ausente en el DOM verificando restricción RBAC en Vitest (`296ms`) | **APROBADO** | 24/11/2026 15:27 | - | feat(recuperacion): edicion de operativos de recuperacion y actualizacion en tiempo real (HU-74) |
| `CP-H74-WEB-05` | Precarga de planificación actual y envío de `PATCH` parcial solo con descripción y `patrullaId` modificados (CA-2) | Funcional / Formulario | UI / Modal | Crítica | `ModalEditarOperativoRecuperacion` abierto con `mockOperativoBase`; catálogos de recursos y patrullas disponibles cargados | Modificar `descripcion` a `"Ampliación de entrega en Collico Alto"` y `patrullaId` a `50000000-...-0002` sin alterar recursos | Precarga descripción inicial, omite `recursos` al no variar, invoca `editarOperativoRecuperacion`, ejecuta `onSuccess` y cierra el modal | Payload enviado únicamente con `{ descripcion, patrullaId }`, callbacks ejecutados (`257ms`) | **APROBADO** | 24/11/2026 15:27 | - | feat(recuperacion): edicion de operativos de recuperacion y actualizacion en tiempo real (HU-74) |
| `CP-H74-WEB-06` | Retención del modal abierto con alerta de error cuando la API responde `409 Conflict` | Manejo de Errores / UX | UI / Modal | Alta | `editarOperativoRecuperacion` rechaza con `RecuperacionServiceError` (`statusCode: 409`) | Cantidad modificada a `500`; error `"Stock insuficiente en bodega para Kit Techumbre."` | El modal permanece abierto conservando los datos del formulario, muestra `InlineNotice` de error y no ejecuta `onClose` | Banner de error desplegado y `onClose` no invocado (`270ms`) | **APROBADO** | 24/11/2026 15:27 | - | feat(recuperacion): edicion de operativos de recuperacion y actualizacion en tiempo real (HU-74) |
| `CP-H74-WEB-07` | Respuesta exitosa `200 OK` en capa de servicio `editarOperativoRecuperacion` (`PATCH /api/eventos-atp/recuperacion/{id}`) | Pruebas Unitarias / DAL | Service / API | Crítica | Suite `recuperacionService.test.ts` ejecutando `editarOperativoRecuperacion` con mock de `apiClient.PATCH` | `id: e4f8b9a1-...`, body `{ descripcion: "Nueva descripción operativa", patrullaId: "p2" }` | Envía petición `PATCH` al endpoint tipado y retorna objeto actualizado con `actualizadoEn` y `actualizadoPorId` | 14/14 pruebas del servicio aprobadas verificando retorno `200 OK` (`5ms`) | **APROBADO** | 24/11/2026 15:27 | - | feat(recuperacion): edicion de operativos de recuperacion y actualizacion en tiempo real (HU-74) |
| `CP-H74-WEB-08` | Clasificación de conflictos `409` en `ESTADO_BLOQUEADO` (`COMPLETADA`/`CANCELADA`) y `STOCK_INSUFICIENTE` en DAL | Pruebas Unitarias / Negocio | Service / DAL | Crítica | Respuesta HTTP `409` simulada desde `apiClient.PATCH` en `recuperacionService.test.ts` | Mensajes `"No se puede editar un operativo en estado COMPLETADA."` y `"Stock insuficiente en bodega..."` | `RecuperacionServiceError` clasifica `tipoConflicto` como `'ESTADO_BLOQUEADO'` o `'STOCK_INSUFICIENTE'` respectivamente | Clasificación verificada en ambos escenarios en Vitest (`8ms` y `3ms`) | **APROBADO** | 24/11/2026 15:27 | - | feat(recuperacion): edicion de operativos de recuperacion y actualizacion en tiempo real (HU-74) |
| `CP-H74-WEB-09` | Propagación de error `403 Forbidden` en `editarOperativoRecuperacion` cuando falta permiso `recuperacion:editar` | Seguridad / DAL | Service / DAL | Alta | Respuesta HTTP `403` simulada desde `apiClient.PATCH` | `{ message: 'Forbidden' }` con status `403` | Lanza `RecuperacionServiceError` con `statusCode: 403` mencionando permiso `recuperacion:editar` | Excepción validada con `statusCode: 403` y mensaje institucional (`4ms`) | **APROBADO** | 24/11/2026 15:27 | - | feat(recuperacion): edicion de operativos de recuperacion y actualizacion en tiempo real (HU-74) |
| `CP-H74-WEB-10` | Suscripción en tiempo real a `recuperacion:actualizada` y limpieza de listeners en `useRecuperacionSocket` | Tiempo Real / WebSocket | Hook / Socket.io | Alta | Hook `useRecuperacionSocket` montado con callback `onRecuperacionActualizada` | Emisión de evento `'recuperacion:actualizada'` con objeto `REC-2026-0001` | Invoca `onRecuperacionActualizada`, actualiza `ultimoEvento` y ejecuta `socket.off` al desmontar | Evento procesado y limpieza verificada en Vitest (`22ms`) | **APROBADO** | 24/11/2026 15:27 | - | feat(recuperacion): edicion de operativos de recuperacion y actualizacion en tiempo real (HU-74) |
| `CP-H74-WEB-11` | Prueba en vivo HTTP `GET` y `PATCH /api/eventos-atp/recuperacion/{id}` (`200 OK`) con auditoría y stock diferencial (CA-2 / CA-4) | Integración API / cURL | Backend / DB | Crítica | `sgrai-api` corriendo en `localhost:3001` con fixture H74 sembrado y token JWT de `encargado@valdivia.cl` | `PATCH .../74100000-...-0001` con `descripcion`, `fechaEstimadaFin: "2026-11-30T18:00:00.000Z"` y `recursos` (`90` y `15`) | API retorna `200 OK` actualizando `descripcion`, `fechaEstimadaFin`, `recursos`, `actualizadoPorId` y `actualizadoEn` | `200 OK` verificado en vivo; `GET` posterior confirma `cantidadInsumosAsignados: 105` y `actualizadoPorId: ...0003` | **APROBADO** | 24/11/2026 15:26 | - | feat(recuperacion): edicion de operativos de recuperacion y actualizacion en tiempo real (HU-74) |
| `CP-H74-WEB-12` | Prueba en vivo HTTP `409 Conflict` en estados `COMPLETADA`/`CANCELADA`, stock insuficiente y patrulla ocupada (CA-3) | Integración API / cURL | Backend / Negocio | Crítica | `sgrai-api` activo con registros `REC-2026-7403` (`COMPLETADA`), `REC-2026-7404` (`CANCELADA`) y patrulla `EN_VERIFICACION` | `PATCH` sobre `...7403`, `...7404`, `cantidad: 99999` y `patrullaId: f1000000-...-0001` | API rechaza todos los casos con `409 Conflict` y mensajes descriptivos del estado o disponibilidad | `409 Conflict` verificado en vivo para los 4 escenarios sin alterar datos en BD | **APROBADO** | 24/11/2026 15:26 | - | feat(recuperacion): edicion de operativos de recuperacion y actualizacion en tiempo real (HU-74) |
| `CP-H74-WEB-13` | Prueba en vivo HTTP `401 Unauthorized` (sin JWT Bearer) y `403 Forbidden` (Supervisor sin `recuperacion:editar`) (CA-5) | Seguridad RBAC / cURL | Backend / Auth | Crítica | Token JWT de `supervisor@valdivia.cl` y petición sin token con cabecera `x-user-id` | `PATCH .../74100000-...-0001` sin `Authorization` o con `Authorization: Bearer <SUP_TOKEN>` | API responde `401` exigiendo `Authorization: Bearer` y `403` exigiendo permiso `recuperacion:editar` | `401 Unauthorized` y `403 Forbidden` (`"No cuenta con el permiso requerido: recuperacion:editar"`) verificados en vivo | **APROBADO** | 24/11/2026 15:26 | - | feat(recuperacion): edicion de operativos de recuperacion y actualizacion en tiempo real (HU-74) |
| `CP-H74-WEB-14` | Prueba en vivo HTTP `400 Bad Request` (body vacío, fecha anterior, `cantidad: 0`) y `404 Not Found` (UUID inexistente) | Validación / Contrato | Backend / cURL | Alta | `sgrai-api` activo con token JWT de Encargado | `PATCH` con `{}`, `fechaEstimadaFin: "2025-01-01T00:00:00.000Z"`, `cantidad: 0` y UUID `00000000-...-999999999999` | API responde `400 Bad Request` con detalle de validación y `404 Not Found` para identificador inexistente | `400` (`errors` por campo y mensaje temporal) y `404` verificados en vivo contra `localhost:3001` | **APROBADO** | 24/11/2026 15:26 | - | feat(recuperacion): edicion de operativos de recuperacion y actualizacion en tiempo real (HU-74) |
| `CP-H74-WEB-15` | Análisis estático (`npm run lint`), tipos TypeScript (`npx tsc --noEmit`), regresión global (`npm test`) y compilación (`npm run build`) | Calidad / Build / CI | Proyecto Completo | Alta | Rama `feature/H74-editar-operativo-recuperacion` con dependencias instaladas | `npm run lint`, `npx tsc --noEmit`, `npm test`, `npm run build` | Código de salida `0` en los cuatro pipelines sin errores de compilación ni regresiones | `lint` (0 errores), `tsc --noEmit` (0 errores), `npm test` (`130` archivos / `878` tests pass) y `next build --webpack` (`47` rutas, `Exit 0`) | **APROBADO** | 24/11/2026 15:24 | - | feat(recuperacion): agregar edicion directa en tabla, resguardo de detalle y permisos fallback (HU-74) |

---

## 4. Bloque TSV para Google Sheets

```tsv
ID Caso	Título del Caso de Prueba	Tipo de Prueba	Nivel	Prioridad	Precondición	Datos de Prueba (Payload / Headers / Query)	Resultado Esperado	Resultado Obtenido	Estado	Fecha / Hora Ejecución	Fecha / Hora Re-Test	Solución / Commit
BUG-H74-WEB-01	Preservación de datos editados en modal ante eventos WebSocket recuperacion:actualizada y estabilidad de useEffect en Drawer	Concurrencia / Reactividad	Integración UI	Crítica	ModalEditarOperativoRecuperacion abierto desde OperativoRecuperacionDrawer con cambios sin guardar en descripción o recursos	Prop inline onCerrar={() => ...} en OperativosRecuperacionView, [operativoId, reloadNonce, onCerrar, toast] en Drawer y [isOpen, operativo, userId] en Modal	El Drawer solo consulta GET al cambiar operativoId o reloadNonce, y el modal conserva intactos los datos no guardados aunque cambie la referencia de operativo	onCerrar cambia en cada render re-ejecutando GET, y cualquier actualización de operativo reinicializa todos los estados del formulario en el modal	ABIERTO	24/11/2026 15:21	(Pendiente)	Pendiente (Rechazado en Code Review)
BUG-H74-WEB-02	Control RBAC Fail-Closed en usePuedeEditarRecuperacion y propagación del userId autenticado sin suplantación con DEFAULT_ENCARGADO_ID	Seguridad / RBAC / Auditoría	Hook / UI / DAL	Alta	Componente renderizado fuera de SimulatedSessionProvider o usuario Administrador (...0001) editando desde Drawer o tabla	SimulatedSessionContext = null y usuario autenticado id = 00000000-0000-4000-8000-000000000001 sin pasar prop userId	usePuedeEditarRecuperacion retorna false sin contexto y consulta AuthContext; el modal propaga el userId real hacia PATCH y getRecursos	usePuedeEditarRecuperacion retorna true sin contexto (Fail-Open) y el modal no recibe userId, enviando DEFAULT_ENCARGADO_ID (...0003) en PATCH y DEFAULT_ADMIN_USER_ID en getRecursos	ABIERTO	24/11/2026 15:21	(Pendiente)	Pendiente (Rechazado en Code Review)
BUG-H74-WEB-03	Selección de patrulla cuando operativo.patrulla es null, bloqueo reactivo ante estado cerrado y limpieza de modalEditarAbierto en Drawer	Funcional / Borde / Estado	UI / Modal y Drawer	Alta	Operativo con patrulla: null o que transiciona concurrentemente a COMPLETADA/CANCELADA o retorna 409 ESTADO_BLOQUEADO	operativo = { ...base, patrulla: null }, o operativo.estado = 'COMPLETADA', o cierre automático por 404 mientras modal estaba abierto	El Select incluye opción vacía "Seleccione una patrulla..." evitando desincronización visual; el modal bloquea edición ante estado cerrado/409 y el Drawer resetea modalEditarAbierto	opcionesPatrulla omite value: '' impidiendo elegir la primera patrulla; el modal mantiene habilitado el submit en COMPLETADA o tras 409; y modalEditarAbierto persiste en true tras cierre por 404	ABIERTO	24/11/2026 15:22	(Pendiente)	Pendiente (Rechazado en Code Review)
BUG-H74-WEB-04	Edición fluida de cantidades, despliegue de errores 400 anidados (recursos.0.cantidad), filtrado de inventario y bloqueo de doble clic en tabla	Validación / Usabilidad / Concurrencia	UI / Modal y Tabla	Media	Modal abierto editando filas de recursos, API retornando 400 en recursos.0.cantidad o clics rápidos en filas de tabla	Input cantidad borrado a "" o decimal 5.5; respuesta 400 con errors: [{ campo: "recursos.0.cantidad", mensaje: "La cantidad debe ser mayor a 0" }]	Input permite edición natural validando enteros >= 1 al guardar; error recursos.0.cantidad visible en formulario; inventario filtra ítems no disponibles; clics rápidos no compiten	parseInt(...) || 0 fuerza 0 y trunca decimales; erroresCampos["recursos.0.cantidad"] queda oculto; getRecursos lista recursos sin filtro de disponibilidad; y handleAbrirEdicionDirecta permite peticiones concurrentes	ABIERTO	24/11/2026 15:26	(Pendiente)	Pendiente (Rechazado en Code Review)
BUG-H74-WEB-05	Cumplimiento de GEMINI.md §3 en botón de tabla, sincronización OpenAPI/develop, completitud de manual H74 y cobertura de pruebas	Estándar / Integración / CI	Código / Git / Docs	Media	Inspección de OperativosRecuperacionTabla.tsx, api-generated.d.ts, git merge-tree develop HEAD y docs/manuals/H74-editar-operativo-recuperacion.md	git merge-tree develop HEAD y contraste con http://localhost:3001/openapi.json	Botón usa Button variant="teal" sin estilos inline; api-generated.d.ts incluye authorization; 0 conflictos con develop; manual H74 con capturas y tabla documentada	Botón usa variant="secondary" con style inline; faltan headers authorization en api-generated.d.ts; 6 conflictos activos con develop + next/font/google; capturas pendientes y tests faltantes	ABIERTO	24/11/2026 15:24	(Pendiente)	Pendiente (Rechazado en Code Review)
CP-H74-WEB-01	Visualización y habilitación del botón "Editar Planificación" en OperativoRecuperacionDrawer para operativos en curso (CA-1)	Funcional / UI	UI / Drawer	Alta	Usuario con permiso recuperacion:editar abre detalle de operativo en estado EN_EJECUCION	mockOperativoBase (id: e4f8b9a1-..., estado: 'EN_EJECUCION')	El panel superior del Drawer muestra el texto "Planificación activa editable" y el botón "Editar Planificación" habilitado	Botón "Editar Planificación" renderizado y habilitado correctamente en el Drawer (402ms)	APROBADO	24/11/2026 15:27	-	feat(recuperacion): edicion de operativos de recuperacion y actualizacion en tiempo real (HU-74)
CP-H74-WEB-02	Bloqueo preventivo del botón "Editar Planificación" en OperativoRecuperacionDrawer cuando el estado es COMPLETADA (CA-3)	Regla de Negocio	UI / Drawer	Crítica	Usuario con permiso recuperacion:editar abre detalle de operativo culminado	{ ...mockOperativoBase, estado: 'COMPLETADA' }	El botón "Editar Planificación" se muestra deshabilitado (disabled) con mensaje de edición bloqueada	Botón "Editar Planificación" verificado en estado disabled en Vitest (368ms)	APROBADO	24/11/2026 15:27	-	feat(recuperacion): edicion de operativos de recuperacion y actualizacion en tiempo real (HU-74)
CP-H74-WEB-03	Bloqueo preventivo del botón "Editar Planificación" en OperativoRecuperacionDrawer cuando el estado es CANCELADA (CA-3)	Regla de Negocio	UI / Drawer	Crítica	Usuario con permiso recuperacion:editar abre detalle de operativo cancelado	{ ...mockOperativoBase, estado: 'CANCELADA' }	El botón "Editar Planificación" se muestra deshabilitado (disabled) impidiendo abrir el modal desde el Drawer	Botón "Editar Planificación" verificado en estado disabled en Vitest (194ms)	APROBADO	24/11/2026 15:27	-	feat(recuperacion): edicion de operativos de recuperacion y actualizacion en tiempo real (HU-74)
CP-H74-WEB-04	Ocultamiento de la acción "Editar Planificación" cuando el usuario carece del permiso recuperacion:editar (CA-5)	Seguridad / RBAC	UI / Permisos	Crítica	Hook usePuedeEditarRecuperacion retorna false (ej. perfil Supervisor sin permiso de edición)	usePuedeEditarRecuperacion.mockReturnValue(false) sobre OperativoRecuperacionDrawer	La barra de acción y el botón "Editar Planificación" no se renderizan en el DOM	Control ausente en el DOM verificando restricción RBAC en Vitest (296ms)	APROBADO	24/11/2026 15:27	-	feat(recuperacion): edicion de operativos de recuperacion y actualizacion en tiempo real (HU-74)
CP-H74-WEB-05	Precarga de planificación actual y envío de PATCH parcial solo con descripción y patrullaId modificados (CA-2)	Funcional / Formulario	UI / Modal	Crítica	ModalEditarOperativoRecuperacion abierto con mockOperativoBase; catálogos de recursos y patrullas disponibles cargados	Modificar descripcion a "Ampliación de entrega en Collico Alto" y patrullaId a 50000000-...-0002 sin alterar recursos	Precarga descripción inicial, omite recursos al no variar, invoca editarOperativoRecuperacion, ejecuta onSuccess y cierra el modal	Payload enviado únicamente con { descripcion, patrullaId }, callbacks ejecutados (257ms)	APROBADO	24/11/2026 15:27	-	feat(recuperacion): edicion de operativos de recuperacion y actualizacion en tiempo real (HU-74)
CP-H74-WEB-06	Retención del modal abierto con alerta de error cuando la API responde 409 Conflict	Manejo de Errores / UX	UI / Modal	Alta	editarOperativoRecuperacion rechaza con RecuperacionServiceError (statusCode: 409)	Cantidad modificada a 500; error "Stock insuficiente en bodega para Kit Techumbre."	El modal permanece abierto conservando los datos del formulario, muestra InlineNotice de error y no ejecuta onClose	Banner de error desplegado y onClose no invocado (270ms)	APROBADO	24/11/2026 15:27	-	feat(recuperacion): edicion de operativos de recuperacion y actualizacion en tiempo real (HU-74)
CP-H74-WEB-07	Respuesta exitosa 200 OK en capa de servicio editarOperativoRecuperacion (PATCH /api/eventos-atp/recuperacion/{id})	Pruebas Unitarias / DAL	Service / API	Crítica	Suite recuperacionService.test.ts ejecutando editarOperativoRecuperacion con mock de apiClient.PATCH	id: e4f8b9a1-..., body { descripcion: "Nueva descripción operativa", patrullaId: "p2" }	Envía petición PATCH al endpoint tipado y retorna objeto actualizado con actualizadoEn y actualizadoPorId	14/14 pruebas del servicio aprobadas verificando retorno 200 OK (5ms)	APROBADO	24/11/2026 15:27	-	feat(recuperacion): edicion de operativos de recuperacion y actualizacion en tiempo real (HU-74)
CP-H74-WEB-08	Clasificación de conflictos 409 en ESTADO_BLOQUEADO (COMPLETADA/CANCELADA) y STOCK_INSUFICIENTE en DAL	Pruebas Unitarias / Negocio	Service / DAL	Crítica	Respuesta HTTP 409 simulada desde apiClient.PATCH en recuperacionService.test.ts	Mensajes "No se puede editar un operativo en estado COMPLETADA." y "Stock insuficiente en bodega..."	RecuperacionServiceError clasifica tipoConflicto como 'ESTADO_BLOQUEADO' o 'STOCK_INSUFICIENTE' respectivamente	Clasificación verificada en ambos escenarios en Vitest (8ms y 3ms)	APROBADO	24/11/2026 15:27	-	feat(recuperacion): edicion de operativos de recuperacion y actualizacion en tiempo real (HU-74)
CP-H74-WEB-09	Propagación de error 403 Forbidden en editarOperativoRecuperacion cuando falta permiso recuperacion:editar	Seguridad / DAL	Service / DAL	Alta	Respuesta HTTP 403 simulada desde apiClient.PATCH	{ message: 'Forbidden' } con status 403	Lanza RecuperacionServiceError con statusCode: 403 mencionando permiso recuperacion:editar	Excepción validada con statusCode: 403 y mensaje institucional (4ms)	APROBADO	24/11/2026 15:27	-	feat(recuperacion): edicion de operativos de recuperacion y actualizacion en tiempo real (HU-74)
CP-H74-WEB-10	Suscripción en tiempo real a recuperacion:actualizada y limpieza de listeners en useRecuperacionSocket	Tiempo Real / WebSocket	Hook / Socket.io	Alta	Hook useRecuperacionSocket montado con callback onRecuperacionActualizada	Emisión de evento 'recuperacion:actualizada' con objeto REC-2026-0001	Invoca onRecuperacionActualizada, actualiza ultimoEvento y ejecuta socket.off al desmontar	Evento procesado y limpieza verificada en Vitest (22ms)	APROBADO	24/11/2026 15:27	-	feat(recuperacion): edicion de operativos de recuperacion y actualizacion en tiempo real (HU-74)
CP-H74-WEB-11	Prueba en vivo HTTP GET y PATCH /api/eventos-atp/recuperacion/{id} (200 OK) con auditoría y stock diferencial (CA-2 / CA-4)	Integración API / cURL	Backend / DB	Crítica	sgrai-api corriendo en localhost:3001 con fixture H74 sembrado y token JWT de encargado@valdivia.cl	PATCH .../74100000-...-0001 con descripcion, fechaEstimadaFin: "2026-11-30T18:00:00.000Z" y recursos (90 y 15)	API retorna 200 OK actualizando descripcion, fechaEstimadaFin, recursos, actualizadoPorId y actualizadoEn	200 OK verificado en vivo; GET posterior confirma cantidadInsumosAsignados: 105 y actualizadoPorId: ...0003	APROBADO	24/11/2026 15:26	-	feat(recuperacion): edicion de operativos de recuperacion y actualizacion en tiempo real (HU-74)
CP-H74-WEB-12	Prueba en vivo HTTP 409 Conflict en estados COMPLETADA/CANCELADA, stock insuficiente y patrulla ocupada (CA-3)	Integración API / cURL	Backend / Negocio	Crítica	sgrai-api activo con registros REC-2026-7403 (COMPLETADA), REC-2026-7404 (CANCELADA) y patrulla EN_VERIFICACION	PATCH sobre ...7403, ...7404, cantidad: 99999 y patrullaId: f1000000-...-0001	API rechaza todos los casos con 409 Conflict y mensajes descriptivos del estado o disponibilidad	409 Conflict verificado en vivo para los 4 escenarios sin alterar datos en BD	APROBADO	24/11/2026 15:26	-	feat(recuperacion): edicion de operativos de recuperacion y actualizacion en tiempo real (HU-74)
CP-H74-WEB-13	Prueba en vivo HTTP 401 Unauthorized (sin JWT Bearer) y 403 Forbidden (Supervisor sin recuperacion:editar) (CA-5)	Seguridad RBAC / cURL	Backend / Auth	Crítica	Token JWT de supervisor@valdivia.cl y petición sin token con cabecera x-user-id	PATCH .../74100000-...-0001 sin Authorization o con Authorization: Bearer <SUP_TOKEN>	API responde 401 exigiendo Authorization: Bearer y 403 exigiendo permiso recuperacion:editar	401 Unauthorized y 403 Forbidden ("No cuenta con el permiso requerido: recuperacion:editar") verificados en vivo	APROBADO	24/11/2026 15:26	-	feat(recuperacion): edicion de operativos de recuperacion y actualizacion en tiempo real (HU-74)
CP-H74-WEB-14	Prueba en vivo HTTP 400 Bad Request (body vacío, fecha anterior, cantidad: 0) y 404 Not Found (UUID inexistente)	Validación / Contrato	Backend / cURL	Alta	sgrai-api activo con token JWT de Encargado	PATCH con {}, fechaEstimadaFin: "2025-01-01T00:00:00.000Z", cantidad: 0 y UUID 00000000-...-999999999999	API responde 400 Bad Request con detalle de validación y 404 Not Found para identificador inexistente	400 (errors por campo y mensaje temporal) y 404 verificados en vivo contra localhost:3001	APROBADO	24/11/2026 15:26	-	feat(recuperacion): edicion de operativos de recuperacion y actualizacion en tiempo real (HU-74)
CP-H74-WEB-15	Análisis estático (npm run lint), tipos TypeScript (npx tsc --noEmit), regresión global (npm test) y compilación (npm run build)	Calidad / Build / CI	Proyecto Completo	Alta	Rama feature/H74-editar-operativo-recuperacion con dependencias instaladas	npm run lint, npx tsc --noEmit, npm test, npm run build	Código de salida 0 en los cuatro pipelines sin errores de compilación ni regresiones	lint (0 errores), tsc --noEmit (0 errores), npm test (130 archivos / 878 tests pass) y next build --webpack (47 rutas, Exit 0)	APROBADO	24/11/2026 15:24	-	feat(recuperacion): agregar edicion directa en tabla, resguardo de detalle y permisos fallback (HU-74)
```

---

## 5. Guía de Ejecución y Replicabilidad Paso a Paso

### 5.1. Ejecución de Suites Automatizadas en Vitest

#### Comando consolidado para las suites de recuperación (HU-73 / HU-74)
```bash
npx vitest run src/components/mando/recuperacion/__tests__/ModalEditarOperativoRecuperacion.test.tsx src/components/mando/recuperacion/__tests__/OperativosRecuperacionView.test.tsx src/services/__tests__/recuperacionService.test.ts src/hooks/__tests__/useRecuperacionSocket.test.ts
```

**Evidencia real obtenida en consola:**
```text
 ✓ src/services/__tests__/recuperacionService.test.ts (14 tests) 12ms
 ✓ src/hooks/__tests__/useRecuperacionSocket.test.ts (4 tests) 34ms
 ✓ src/components/mando/recuperacion/__tests__/ModalEditarOperativoRecuperacion.test.tsx (6 tests) 460ms
 ✓ src/components/mando/recuperacion/__tests__/OperativosRecuperacionView.test.tsx (3 tests) 383ms

 Test Files  4 passed (4)
      Tests  27 passed (27)
   Start at  15:18:23
   Duration  2.15s (transform 746ms, setup 443ms, collect 1.56s, tests 889ms, environment 2.51s, prepare 299ms)
```

#### Suite de regresión global del repositorio
```bash
npm test
```

**Evidencia real obtenida en consola:**
```text
 Test Files  130 passed (130)
      Tests  878 passed (878)
   Start at  15:20:05
   Duration  28.69s (transform 14.39s, setup 27.14s, collect 63.08s, tests 76.55s, environment 180.45s, prepare 20.27s)
```

#### Ejecución individual de casos de prueba con `npm test -- -t "..."`

1. **`CP-H74-WEB-01` — Botón `"Editar Planificación"` habilitado en operativo `EN_EJECUCION`:**
```bash
npm test -- src/components/mando/recuperacion/__tests__/ModalEditarOperativoRecuperacion.test.tsx -t "debe mostrar el botón Editar Planificación habilitado"
```
```text
 ✓ HU-74: OperativoRecuperacionDrawer y ModalEditarOperativoRecuperacion > debe mostrar el botón Editar Planificación habilitado en operativos en curso cuando tiene permiso 402ms
 Test Files  1 passed (1)
      Tests  1 passed | 5 skipped (6)
```

2. **`CP-H74-WEB-02` — Bloqueo del botón `"Editar Planificación"` en estado `COMPLETADA`:**
```bash
npm test -- src/components/mando/recuperacion/__tests__/ModalEditarOperativoRecuperacion.test.tsx -t "debe inhabilitar el botón Editar Planificación cuando el operativo está COMPLETADA"
```
```text
 ✓ HU-74: OperativoRecuperacionDrawer y ModalEditarOperativoRecuperacion > debe inhabilitar el botón Editar Planificación cuando el operativo está COMPLETADA 368ms
 Test Files  1 passed (1)
      Tests  1 passed | 5 skipped (6)
```

3. **`CP-H74-WEB-03` — Bloqueo del botón `"Editar Planificación"` en estado `CANCELADA`:**
```bash
npm test -- src/components/mando/recuperacion/__tests__/ModalEditarOperativoRecuperacion.test.tsx -t "debe inhabilitar el botón Editar Planificación cuando el operativo está CANCELADA"
```
```text
 ✓ HU-74: OperativoRecuperacionDrawer y ModalEditarOperativoRecuperacion > debe inhabilitar el botón Editar Planificación cuando el operativo está CANCELADA 194ms
 Test Files  1 passed (1)
      Tests  1 passed | 5 skipped (6)
```

4. **`CP-H74-WEB-04` — Ocultamiento del botón `"Editar Planificación"` sin permiso `recuperacion:editar`:**
```bash
npm test -- src/components/mando/recuperacion/__tests__/ModalEditarOperativoRecuperacion.test.tsx -t "debe ocultar el botón Editar Planificación"
```
```text
 ✓ HU-74: OperativoRecuperacionDrawer y ModalEditarOperativoRecuperacion > debe ocultar el botón Editar Planificación si el usuario no posee permiso recuperacion:editar 296ms
 Test Files  1 passed (1)
      Tests  1 passed | 5 skipped (6)
```

5. **`CP-H74-WEB-05` — Precarga de planificación y envío parcial con descripción y `patrullaId`:**
```bash
npm test -- src/components/mando/recuperacion/__tests__/ModalEditarOperativoRecuperacion.test.tsx -t "debe precargar datos"
```
```text
 ✓ HU-74: OperativoRecuperacionDrawer y ModalEditarOperativoRecuperacion > debe precargar datos, omitir recursos si no cambian y enviar solo descripción y patrullaId modificados 257ms
 Test Files  1 passed (1)
      Tests  1 passed | 5 skipped (6)
```

6. **`CP-H74-WEB-06` — Retención del modal abierto ante error `409 Conflict`:**
```bash
npm test -- src/components/mando/recuperacion/__tests__/ModalEditarOperativoRecuperacion.test.tsx -t "409 Conflict"
```
```text
 ✓ HU-74: OperativoRecuperacionDrawer y ModalEditarOperativoRecuperacion > debe mantener el modal abierto y mostrar el mensaje de error si la API retorna 409 Conflict 270ms
 Test Files  1 passed (1)
      Tests  1 passed | 5 skipped (6)
```

7. **`CP-H74-WEB-07` — Servicio `editarOperativoRecuperacion` (`200 OK`):**
```bash
npm test -- src/services/__tests__/recuperacionService.test.ts -t "debe retornar 200 OK con el operativo actualizado"
```
```text
 ✓ recuperacionService (HU-74: editarOperativoRecuperacion) > debe retornar 200 OK con el operativo actualizado cuando PATCH es exitoso 5ms
 Test Files  1 passed (1)
      Tests  1 passed | 13 skipped (14)
```

8. **`CP-H74-WEB-08` — Clasificación de conflictos `ESTADO_BLOQUEADO` y `STOCK_INSUFICIENTE`:**
```bash
npm test -- src/services/__tests__/recuperacionService.test.ts -t "ESTADO_BLOQUEADO"
npm test -- src/services/__tests__/recuperacionService.test.ts -t "STOCK_INSUFICIENTE cuando falta stock"
```
```text
 ✓ recuperacionService (HU-74: editarOperativoRecuperacion) > debe lanzar RecuperacionServiceError 409 ESTADO_BLOQUEADO en operativo COMPLETADA o CANCELADA 8ms
 ✓ recuperacionService (HU-74: editarOperativoRecuperacion) > debe lanzar RecuperacionServiceError 409 STOCK_INSUFICIENTE cuando falta stock en bodega 3ms
```

9. **`CP-H74-WEB-09` — Manejo de rechazo `403 Forbidden` en servicio:**
```bash
npm test -- src/services/__tests__/recuperacionService.test.ts -t "recuperacion:editar"
```
```text
 ✓ recuperacionService (HU-74: editarOperativoRecuperacion) > debe lanzar RecuperacionServiceError 403 cuando falta el permiso recuperacion:editar 4ms
 Test Files  1 passed (1)
      Tests  1 passed | 13 skipped (14)
```

10. **`CP-H74-WEB-10` — Evento WebSocket `recuperacion:actualizada`:**
```bash
npm test -- src/hooks/__tests__/useRecuperacionSocket.test.ts -t "recuperacion:actualizada"
```
```text
 ✓ useRecuperacionSocket (HU-29) > debe invocar onRecuperacionActualizada al recibir evento WebSocket recuperacion:actualizada 22ms
 Test Files  1 passed (1)
      Tests  1 passed | 3 skipped (4)
```

---

### 5.2. Verificación Estática, Compilación y Chequeo de Integración con `develop`

```bash
npm run lint
npx tsc --noEmit
npm run build
git merge-tree --write-tree --name-only develop HEAD
```

**Evidencia real obtenida en consola:**
```text
LINT_EXIT=0 (0 errores en proyecto y en archivos de HU-74)
TSC_EXIT=0
✓ Compiled successfully in 10.6s
✓ Finished TypeScript in 7.8s
✓ Generating static pages using 15 workers (47/47) in 1030ms
BUILD_EXIT=0

CONFLICTO (contenido): Conflicto de fusión en src/hooks/__tests__/useRecuperacionSocket.test.ts
CONFLICTO (contenido): Conflicto de fusión en src/hooks/useRecuperacionSocket.ts
CONFLICTO (contenido): Conflicto de fusión en src/services/__tests__/recuperacionService.test.ts
CONFLICTO (contenido): Conflicto de fusión en src/services/recuperacionService.ts
CONFLICTO (contenido): Conflicto de fusión en src/types/api-generated.d.ts
CONFLICTO (contenido): Conflicto de fusión en src/types/recuperacion.ts
```

---

### 5.3. Pruebas HTTP/cURL en Vivo contra `sgrai-api` (`http://localhost:3001`)

#### Verificación de contrato OpenAPI expuesto en vivo
```bash
curl -s http://localhost:3001/openapi.json | node -e "const d = JSON.parse(require('fs').readFileSync(0,'utf8')); console.log('OpenAPI version:', d.info?.version); console.log('PATCH params:', JSON.stringify(d.paths['/api/eventos-atp/recuperacion/{id}']?.patch?.parameters));"
```
```text
OpenAPI version: 0.12.0
PATCH params: [{"schema":{"type":"string","format":"uuid",...},"required":true,"name":"id","in":"path"},{"schema":{"type":"string",...},"required":false,"name":"authorization","in":"header"},{"schema":{"type":"string","format":"uuid",...},"required":false,"name":"x-user-id","in":"header"}]
```

#### Obtención de tokens JWT de prueba (`POST /api/seguridad/login`)
```bash
ENC_TOKEN=$(curl -s -X POST http://localhost:3001/api/seguridad/login \
  -H "Content-Type: application/json" \
  -d '{"identificador":"encargado@valdivia.cl","password":"Valdivia2026!"}' \
  | node -e "console.log(JSON.parse(require('fs').readFileSync(0,'utf8')).data.token)")

SUP_TOKEN=$(curl -s -X POST http://localhost:3001/api/seguridad/login \
  -H "Content-Type: application/json" \
  -d '{"identificador":"supervisor@valdivia.cl","password":"Valdivia2026!"}' \
  | node -e "console.log(JSON.parse(require('fs').readFileSync(0,'utf8')).data.token)")
```

#### Escenario A (`CP-H74-WEB-11`): Edición exitosa de planificación (`PATCH /api/eventos-atp/recuperacion/{id}` -> `200 OK`) y verificación de auditoría
```bash
curl -i -s -X PATCH "http://localhost:3001/api/eventos-atp/recuperacion/74100000-0000-4000-8000-000000000001" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ENC_TOKEN" \
  -d '{
    "descripcion": "Ampliación de entrega de planchas de zinc y frazadas en Niebla Alto y Sector Los Molinos.",
    "fechaEstimadaFin": "2026-11-30T18:00:00.000Z",
    "recursos": [
      {"recursoId": "74000000-0000-4000-8000-000000000001", "cantidad": 90},
      {"recursoId": "74000000-0000-4000-8000-000000000003", "cantidad": 15}
    ]
  }'
```

**Respuesta HTTP/JSON real obtenida:**
```http
HTTP/1.1 200 OK
content-type: application/json

{"message":"Planificación del operativo de recuperación actualizada exitosamente.","data":{"id":"74100000-0000-4000-8000-000000000001","codigo":"REC-2026-7401","nombre":"Entrega de techumbres y habitabilidad Niebla Alto","descripcion":"Ampliación de entrega de planchas de zinc y frazadas en Niebla Alto y Sector Los Molinos.","sector":"Sector Niebla Alto","direccionTexto":"Calle Miramar #450, Niebla","prioridad":"ALTA","contactoNombre":"Mariana Cárdenas","contactoTelefono":"+56987654321","latitud":-39.8682,"longitud":-73.3965,"estado":"EN_EJECUCION","familiasAfectadas":18,"delegacion":{"id":"30000000-0000-4000-8000-000000000003","codigo":"DEL_COSTA","nombre":"Delegación Municipal Costa"},"mision":{"id":"74200000-0000-4000-8000-000000000001","codigo":"MIS-2026-7401","titulo":"Entrega de techumbres y habitabilidad Niebla Alto","estado":"EN_CURSO","tipoMision":"RECUPERACION"},"patrulla":{"id":"74500000-0000-4000-8000-000000000001","nombre":"Patrulla Verificadora Costa H74","estado":"EN_RECUPERACION"},"recursos":[{"recursoId":"74000000-0000-4000-8000-000000000001","nombre":"Planchas de Zinc Acanaladas 3.66m (H74)","cantidadAsignada":90},{"recursoId":"74000000-0000-4000-8000-000000000003","nombre":"Frazadas Térmicas Polar (H74)","cantidadAsignada":15}],"creadoPorId":"00000000-0000-4000-8000-000000000003","fechaEstimadaFin":"2026-11-30T18:00:00.000Z","actualizadoPorId":"00000000-0000-4000-8000-000000000003","creadoEn":"2026-11-24T15:26:33.405Z","actualizadoEn":"2026-11-24T18:26:38.212Z"}}
```

**Verificación de detalle posterior (`GET /api/eventos-atp/recuperacion/{id}`):**
```bash
curl -s -X GET "http://localhost:3001/api/eventos-atp/recuperacion/74100000-0000-4000-8000-000000000001" \
  -H "Authorization: Bearer $ENC_TOKEN"
```
```json
{"message":"Detalle de operativo de recuperación obtenido exitosamente.","data":{"id":"74100000-0000-4000-8000-000000000001","codigo":"REC-2026-7401","estado":"EN_EJECUCION","cantidadInsumosAsignados":105,"totalTiposInsumos":2,"fechaEstimadaFin":"2026-11-30T18:00:00.000Z","actualizadoPorId":"00000000-0000-4000-8000-000000000003","actualizadoEn":"2026-11-24T18:26:38.212Z"}}
```

#### Escenario B (`CP-H74-WEB-12`): Bloqueo en estados `COMPLETADA` y `CANCELADA`, stock insuficiente y patrulla ocupada (`409 Conflict`)
```bash
# B.1 Estado COMPLETADA
curl -i -s -X PATCH "http://localhost:3001/api/eventos-atp/recuperacion/74100000-0000-4000-8000-000000000003" \
  -H "Content-Type: application/json" -H "Authorization: Bearer $ENC_TOKEN" \
  -d '{"descripcion":"Intento sobre completada"}'
```
```http
HTTP/1.1 409 Conflict
{"message":"No es posible editar un operativo de recuperación en estado COMPLETADA."}
```

```bash
# B.2 Estado CANCELADA
curl -i -s -X PATCH "http://localhost:3001/api/eventos-atp/recuperacion/74100000-0000-4000-8000-000000000004" \
  -H "Content-Type: application/json" -H "Authorization: Bearer $ENC_TOKEN" \
  -d '{"descripcion":"Intento sobre cancelada"}'
```
```http
HTTP/1.1 409 Conflict
{"message":"No es posible editar un operativo de recuperación en estado CANCELADA."}
```

```bash
# B.3 Stock insuficiente en bodega
curl -i -s -X PATCH "http://localhost:3001/api/eventos-atp/recuperacion/74100000-0000-4000-8000-000000000001" \
  -H "Content-Type: application/json" -H "Authorization: Bearer $ENC_TOKEN" \
  -d '{"recursos":[{"recursoId":"74000000-0000-4000-8000-000000000001","cantidad":99999}]}'
```
```http
HTTP/1.1 409 Conflict
{"message":"Stock insuficiente para el recurso \"Planchas de Zinc Acanaladas 3.66m (H74)\". Incremento solicitado: 99919, Disponible: 500."}
```

```bash
# B.4 Patrulla no disponible
curl -i -s -X PATCH "http://localhost:3001/api/eventos-atp/recuperacion/74100000-0000-4000-8000-000000000001" \
  -H "Content-Type: application/json" -H "Authorization: Bearer $ENC_TOKEN" \
  -d '{"patrullaId":"f1000000-0000-4000-8000-000000000001"}'
```
```http
HTTP/1.1 409 Conflict
{"message":"La patrulla \"Patrulla Rápida Costa-1\" no está disponible para asignación (estado actual: EN_VERIFICACION)."}
```

#### Escenario C (`CP-H74-WEB-13`): Control de autenticación (`401 Unauthorized`) y permisos RBAC (`403 Forbidden`)
```bash
# C.1 Sin Bearer JWT (enviando solo x-user-id)
curl -i -s -X PATCH "http://localhost:3001/api/eventos-atp/recuperacion/74100000-0000-4000-8000-000000000001" \
  -H "Content-Type: application/json" -H "x-user-id: 00000000-0000-4000-8000-000000000003" \
  -d '{"descripcion":"Test sin JWT"}'
```
```http
HTTP/1.1 401 Unauthorized
{"message":"Se requiere cabecera de autenticación Authorization: Bearer <token>."}
```

```bash
# C.2 Perfil Supervisor Estratégico sin permiso recuperacion:editar
curl -i -s -X PATCH "http://localhost:3001/api/eventos-atp/recuperacion/74100000-0000-4000-8000-000000000001" \
  -H "Content-Type: application/json" -H "Authorization: Bearer $SUP_TOKEN" \
  -d '{"descripcion":"Test sin permiso"}'
```
```http
HTTP/1.1 403 Forbidden
{"message":"No cuenta con el permiso requerido: recuperacion:editar"}
```

#### Escenario D (`CP-H74-WEB-14`): Validaciones de entrada (`400 Bad Request`) y recurso inexistente (`404 Not Found`)
```bash
# D.1 Payload vacío
curl -i -s -X PATCH "http://localhost:3001/api/eventos-atp/recuperacion/74100000-0000-4000-8000-000000000001" \
  -H "Content-Type: application/json" -H "Authorization: Bearer $ENC_TOKEN" -d '{}'
```
```http
HTTP/1.1 400 Bad Request
{"message":"Datos de entrada inválidos para editar el operativo de recuperación.","errors":[{"campo":"","mensaje":"Debe proporcionar al menos un campo para actualizar (descripcion, fechaEstimadaFin, recursos o patrullaId)."}]}
```

```bash
# D.2 Fecha estimada anterior a creación
curl -i -s -X PATCH "http://localhost:3001/api/eventos-atp/recuperacion/74100000-0000-4000-8000-000000000001" \
  -H "Content-Type: application/json" -H "Authorization: Bearer $ENC_TOKEN" \
  -d '{"fechaEstimadaFin":"2025-01-01T00:00:00.000Z"}'
```
```http
HTTP/1.1 400 Bad Request
{"message":"La fecha estimada de término no puede ser anterior a la fecha de creación del operativo."}
```

```bash
# D.3 Error de campo anidado en arreglo de recursos (evidencia de BUG-H74-WEB-04)
curl -i -s -X PATCH "http://localhost:3001/api/eventos-atp/recuperacion/74100000-0000-4000-8000-000000000001" \
  -H "Content-Type: application/json" -H "Authorization: Bearer $ENC_TOKEN" \
  -d '{"recursos":[{"recursoId":"74000000-0000-4000-8000-000000000001","cantidad":0}]}'
```
```http
HTTP/1.1 400 Bad Request
{"message":"Datos de entrada inválidos para editar el operativo de recuperación.","errors":[{"campo":"recursos.0.cantidad","mensaje":"La cantidad debe ser mayor a 0"}]}
```

```bash
# D.4 UUID de operativo inexistente
curl -i -s -X PATCH "http://localhost:3001/api/eventos-atp/recuperacion/00000000-0000-4000-8000-999999999999" \
  -H "Content-Type: application/json" -H "Authorization: Bearer $ENC_TOKEN" \
  -d '{"descripcion":"No existe"}'
```
```http
HTTP/1.1 404 Not Found
{"message":"El operativo de recuperación indicado no fue encontrado."}
```

---

## 6. Matriz de Trazabilidad de Criterios de Aceptación (CA)

| Criterio de Aceptación (CA) | Casos Asociados | Estado QA | Observaciones Técnicas |
|---|---|:---:|---|
| **CA-1:** En el detalle del operativo de recuperación, el sistema debe proveer la acción 'Editar Planificación'. | `CP-H74-WEB-01`, `CP-H74-WEB-04`, `BUG-H74-WEB-05` | **OBSERVADO (Fallo Medio)** | `OperativoRecuperacionDrawer.tsx` provee el botón `"Editar Planificación"` y `OperativosRecuperacionTabla.tsx` añade acceso directo `"Editar"`, aunque este último incumple `GEMINI.md` §3 por estilos inline (`BUG-H74-WEB-05`) y `handleAbrirEdicionDirecta` presenta *race condition* ante múltiples clics (`BUG-H74-WEB-04`). |
| **CA-2:** El formulario modal debe permitir modificar: descripción de tareas, fecha estimada de término y reasignación de insumos/recursos. | `CP-H74-WEB-05`, `CP-H74-WEB-11`, `BUG-H74-WEB-01`, `BUG-H74-WEB-03`, `BUG-H74-WEB-04` | **OBSERVADO (Fallos Crítico/Alto/Medio)** | El formulario permite editar descripción, fecha estimada, patrulla e insumos. No obstante, sufre sobrescritura de cambios ante re-renders o WebSocket (`BUG-H74-WEB-01`), falla de selección cuando `patrulla` es `null` (`BUG-H74-WEB-03`), y manejo defectuoso de cantidades y errores `recursos.0.cantidad` (`BUG-H74-WEB-04`). |
| **CA-3:** No se debe permitir editar un operativo que se encuentre en estado `COMPLETADA` o `CANCELADA`. | `CP-H74-WEB-02`, `CP-H74-WEB-03`, `CP-H74-WEB-08`, `CP-H74-WEB-12`, `BUG-H74-WEB-03` | **OBSERVADO (Fallo Alto)** | El Drawer, la tabla y el backend (`409 Conflict`) bloquean estos estados; sin embargo, `ModalEditarOperativoRecuperacion` no deshabilita el formulario cuando recibe un operativo `COMPLETADA`/`CANCELADA`, cuando transiciona por WebSocket estando abierto ni tras recibir `409 ESTADO_BLOQUEADO` (`BUG-H74-WEB-03`). |
| **CA-4:** Cada edición debe registrar auditoría (`actualizado_en = CURRENT_TIMESTAMP`, `actualizado_por_id`). | `CP-H74-WEB-07`, `CP-H74-WEB-11`, `BUG-H74-WEB-02` | **OBSERVADO (Fallo Alto)** | El backend persiste `actualizado_en` y `actualizado_por_id` desde el JWT. En `sgrai-web`, las vistas no pasan `userId` al modal, inyectando siempre `DEFAULT_ENCARGADO_ID` (`...0003`) en `x-user-id` y omitiendo la exhibición de trazabilidad de actualización en el Drawer (`BUG-H74-WEB-02`). |
| **CA-5:** El endpoint `PATCH /api/eventos-atp/recuperacion/{id}` debe requerir permiso `recuperacion:crear` o rol Encargado. | `CP-H74-WEB-04`, `CP-H74-WEB-09`, `CP-H74-WEB-13`, `BUG-H74-WEB-02` | **OBSERVADO (Fallo Alto)** | El backend y el frontend utilizan el permiso granular `recuperacion:editar` (asignado a `ENCARGADO` y `ADMIN` en migración `045`), rechazando `401` sin JWT y `403` sin permiso. No obstante, `usePuedeEditarRecuperacion` aplica política *Fail-Open* (`return true`) cuando falta `SimulatedSessionContext` y no consulta `AuthContext` (`BUG-H74-WEB-02`). |
