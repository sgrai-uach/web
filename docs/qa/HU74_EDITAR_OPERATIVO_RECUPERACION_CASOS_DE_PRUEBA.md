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
> * `fix(recuperacion): sincronizar develop y resolver BUG-H73-WEB-01, 02 y 03`  
> * `refactor(recuperacion): usar componente Chip estandar en tabla de operativos`  
> * `fix(recuperacion): sincronizar develop y resolver BUG-H74-WEB-01 a 05`  
> * `fix(recuperacion): regenerar OpenAPI 0.12.0, ajustar servicio, socket y capturas manual (BUG-H74-WEB-05)`  
>  
> **Fecha de Auditoría Inicial QA (Ciclo 1):** `24/11/2026 15:27`  
> **Fecha de Primer Re-Test QA (Ciclo 2):** `25/11/2026 23:47`  
> **Fecha de Re-Test Final QA (Ciclo 3):** `26/11/2026 14:55`  
> **Estado de Certificación QA:** **APROBADO EN RE-TEST FINAL — APPROVED (`5/5` DEFECTOS CORREGIDOS, `20/20` CASOS APROBADOS, `0` DEFECTOS ABIERTOS)**

---

## 1. Resumen Ejecutivo de Auditoría Técnica y Ciclo de Re-Test

Tras la integración del commit correctivo `fix(recuperacion): regenerar OpenAPI 0.12.0, ajustar servicio, socket y capturas manual (BUG-H74-WEB-05)` sobre la rama `feature/H74-editar-operativo-recuperacion`, se ejecutó el **Re-Test Final (Ciclo 3 — `26/11/2026 14:55`)** validando la subsanación completa del único defecto remanente (`BUG-H74-WEB-05`), junto con la regresión total de pruebas automatizadas, análisis estático, tipado TypeScript, compilación de producción e integración simulada frente a `origin/develop`.

Los resultados certifican el cierre del **100% de los hallazgos (`5/5` defectos en estado `CORREGIDO`)** y la aprobación de los **`20/20` casos de prueba (`100.0%` Pass)**:

1. **Alineación contractual con OpenAPI `0.12.0` (`GEMINI.md` §4):** `src/types/api-generated.d.ts` fue regenerado con el esquema real de `sgrai-api` (`header?: never` y esquema `BearerAuth` en `GET` / `PATCH /api/eventos-atp/recuperacion/{id}` y `GET /api/eventos-atp/recuperacion`). En `src/services/recuperacionService.ts`, `editarOperativoRecuperacion` eliminó el envío de `header: { 'x-user-id': userId }` delegando la autenticación exclusivamente al token `Authorization: Bearer <token>` inyectado por `apiClient`, y `listarOperativosRecuperacion`, `listarEventosRecuperacion` y `obtenerEventoRecuperacion` compilan limpiamente con `npx tsc --noEmit` (`0` errores) preservando compatibilidad con HU-32.
2. **Manual de usuario `H74` con evidencias visuales (`GEMINI.md` §7):** `docs/manuals/H74-editar-operativo-recuperacion.md` incorporó las `3` capturas de pantalla reales del flujo (`01-tabla-y-drawer-editar.png`, `02-modal-editar-planificacion.png` y `03-operativo-bloqueado-completada.png`) alojadas en `docs/manuals/assets/H74-editar-operativo-recuperacion/`, verificadas visualmente conforme al diseño institucional.
3. **Estabilidad de salas WebSocket (`useRecuperacionSocket.ts`):** Se implementó conteo de referencias por sala (`SALAS_RECUPERACION` y `roomRefCounts`), evitando emitir `salir`/`leave` sobre el socket singleton compartido cuando se cierra `OperativoRecuperacionDrawer` mientras `KanbanBoard` o `useOperativosRecuperacion` permanecen suscritos.

| Métrica | Ciclo 1 (`24/11/2026`) | Ciclo 2 (`25/11/2026`) | Re-Test Final Ciclo 3 (`26/11/2026 14:55`) | Observaciones Técnicas |
|---|---|:---:|:---:|---|
| **Total de Casos Evaluados en Matriz** | **20** | **20** | **20** | `5` Defectos históricos (`BUG-H74-WEB-01` a `05`) + `15` Casos Funcionales, Contractuales y Técnicos |
| **Casos Aprobados / Corregidos** | **15** (`75.0%`) | **19** (`95.0%`) | **20 / 20 (`100.0%`)** | `5` Defectos en estado `CORREGIDO` + `15` Casos en estado `APROBADO` |
| **Defectos Abiertos (`ABIERTO`)** | **5** (`1C, 2A, 2M`) | **1** (`0C, 0A, 1M`) | **0** | Sin hallazgos bloqueantes, altos ni medios abiertos |
| **Casos Bloqueados (`BLOQUEADO`)** | **0** | **0** | **0** | Entorno de compilación, linting y Vitest operativos |
| **Análisis Estático (`npm run lint`)** | `0` errores | `0` errores | **0 errores (`Exit 0`)** | Regla `no-restricted-imports` contra `next/font/google` activa en `eslint.config.mjs` |
| **Chequeo de Tipos (`npx tsc --noEmit`)** | `0` errores | `0 / 15*` errores | **0 errores (`Exit 0`)** | Compilación limpia tras regenerar `src/types/api-generated.d.ts` (`0.12.0`) y ajustar `recuperacionService.ts` |
| **Empaquetado Productivo (`npm run build`)** | `47` rutas (`Exit 0`) | `49` rutas (`Exit 0`) | **49 rutas (`Exit 0`)** | `next build --webpack` (`Compile 14.4s`, `TypeScript 13.7s`, `49/49` páginas estáticas) con `next/font/local` |
| **Suites Recuperación / HU-74 (Vitest)** | `4` files / `27` tests | `6` files / `61` tests | **7 files / 65 tests (`3.02s`)** | `ModalEditarOperativoRecuperacion` (`9`), `OperativosRecuperacionView` (`5`), `usePuedeEditarRecuperacion` (`5`), `useRecuperacionSocket` (`9`), `recuperacionService` (`24`), `DetalleEventoRecuperacionClient` (`9`), `KanbanViewSwitcher` (`4`) |
| **Suite Global del Proyecto (Vitest)** | `130` files / `878` tests | `141` files / `1028` tests | **141 files / 1028 tests (`32.13s`)** | `100%` pasando sin regresiones globales |
| **Integración con `origin/develop` (`git merge-tree`)** | `6` conflictos | `0` conflictos | **0 conflictos** | Merge simulado limpio incluso frente a avances posteriores en `origin/develop` |
| **Pruebas HTTP/cURL (`sgrai-api:3001`)** | Verificadas | Verificadas (`25/11/2026`) | **Sustentadas (`25/11/2026`)** | Validación viva `200`, `400`, `401`, `403`, `404` y `409` ejecutada sobre la punta de código H74 de `sgrai-api` (sin cambios posteriores en servidor) |

> **Nota sobre evidencia HTTP en vivo (`26/11/2026`):** En el entorno del Ciclo 3 no se mantuvo levantado el servidor `sgrai-api` H74 en el puerto `3001` al encontrarse el repositorio backend posicionado en otra rama operativa; tras constatar en el historial remoto que el código fuente backend de `feature/H74-editar-operativo-recuperacion` no registró modificaciones desde la batería ejecutada el `25/11/2026 23:47`, los casos `CP-H74-WEB-11` a `CP-H74-WEB-14` conservan dicha evidencia en vivo complementada con la verificación contractual estática y unitaria de hoy (`26/11/2026`).

---

## 2. Registro Técnico de Defectos y Verificación en Re-Test

| ID Defecto | Título y Descripción Técnica del Defecto | Severidad | Archivo(s) Afectado(s) | Fecha Hallazgo | Estado | Fecha Re-Test | Solución / Commit | Dictamen Re-Test |
|---|---|:---:|---|:---:|:---:|:---:|---|---|
| `BUG-H74-WEB-01` | **Sobrescritura destructiva del formulario ante re-renders o WebSocket y peticiones `GET` redundantes en cascada:** `OperativosRecuperacionView.tsx` pasaba `onCerrar` inline; `OperativoRecuperacionDrawer.tsx` dependía de `onCerrar` y `toast` en el efecto de carga; y `ModalEditarOperativoRecuperacion.tsx` dependía del objeto completo `operativo` reinicializando los inputs en edición. | Crítica | `src/components/mando/recuperacion/OperativosRecuperacionView.tsx`, `src/components/mando/recuperacion/OperativoRecuperacionDrawer.tsx`, `src/components/mando/recuperacion/ModalEditarOperativoRecuperacion.tsx`, `src/hooks/useRecuperacionSocket.ts` | 24/11/2026 15:21 | **`CORREGIDO`** | 25/11/2026 23:47 | `fix(recuperacion): sincronizar develop y resolver BUG-H74-WEB-01 a 05` | **Verificado:** `handleCerrarDrawer` estabilizado con `useCallback` (`OperativosRecuperacionView.tsx:67-69`); `onCerrarRef`/`toastRef` y efecto `[operativoId, reloadNonce]` en Drawer (`63-77, 127`); `estabaAbiertoRef` + `snapshotInicialRef` en Modal (`92-155`) conservando cambios ante actualización externa (`avisoActualizacionRemota`). En Ciclo 3 (`34c2963`), `useRecuperacionSocket.ts:10-11, 171-180` agrega conteo de referencias por sala (`roomRefCounts`) evitando expulsar al socket singleton al cerrar el Drawer. Test `BUG-H74-WEB-01` aprobado (`342ms` individual / `33ms` en suite). |
| `BUG-H74-WEB-02` | **Política RBAC *Fail-Open* en `usePuedeEditarRecuperacion` y suplantación de identidad `x-user-id` con `DEFAULT_ENCARGADO_ID` (CA-4 / CA-5):** `usePuedeEditarRecuperacion` retornaba `true` sin `SimulatedSessionContext` ni consultaba `AuthContext`, las vistas omitían `userId` al modal y el Drawer no mostraba `actualizadoEn` / `actualizadoPorId`. | Alta | `src/hooks/usePuedeEditarRecuperacion.ts`, `src/hooks/__tests__/usePuedeEditarRecuperacion.test.ts`, `src/components/mando/recuperacion/OperativoRecuperacionDrawer.tsx`, `src/components/mando/recuperacion/OperativosRecuperacionView.tsx` | 24/11/2026 15:21 | **`CORREGIDO`** | 25/11/2026 23:47 | `fix(recuperacion): sincronizar develop y resolver BUG-H74-WEB-01 a 05` | **Verificado:** `usePuedeEditarRecuperacion.ts:10-32` evalúa `AuthContext` (`cargando -> false`, `tienePermiso('recuperacion:editar') \|\| rolCodigo === 'ADMIN'`) y `SimulatedSessionContext`, retornando `false` por defecto (*Fail-Closed*, `5/5` tests pass en Ciclo 3). `activeUserId` se propaga al modal en Vista (`57-59, 221`) y Drawer (`51-53, 428`), y el Drawer despliega `actualizadoEn` y `actualizadoPorId` (`298-309`). |
| `BUG-H74-WEB-03` | **Desincronización en `<Select>` con `patrulla` nula, ausencia de bloqueo reactivo ante `COMPLETADA`/`CANCELADA` o `409 ESTADO_BLOQUEADO` y estado residual en Drawer (CA-2 / CA-3):** Faltaba opción vacía `""` en patrullas, el modal mantenía habilitados controles ante estados cerrados/`409`, `handleAbrirEdicionDirecta` no validaba estado tras fetch y `modalEditarAbierto` persistía ante cierre por `404`. | Alta | `src/components/mando/recuperacion/ModalEditarOperativoRecuperacion.tsx`, `src/components/mando/recuperacion/OperativoRecuperacionDrawer.tsx`, `src/components/mando/recuperacion/OperativosRecuperacionView.tsx` | 24/11/2026 15:22 | **`CORREGIDO`** | 25/11/2026 23:47 | `fix(recuperacion): sincronizar develop y resolver BUG-H74-WEB-01 a 05` | **Verificado:** `opcionesPatrulla` antepone `{ value: '', label: 'Seleccione una patrulla...' }` cuando `!operativo.patrulla \|\| patrullaId === ''` (`229-231`); `esEstadoCerrado` deshabilita inputs/selects/botones y muestra aviso en `COMPLETADA`/`CANCELADA` o `409 ESTADO_BLOQUEADO` (`95-98, 431-433, 505-509`); `handleAbrirEdicionDirecta` bloquea operativos cerrados post-fetch (`77-83`); Drawer resetea `modalEditarAbierto` en cierre/`operativoId`/`404` (`75, 90, 110`). Test `BUG-H74-WEB-03` aprobado (`326ms` individual / `43ms` en suite). |
| `BUG-H74-WEB-04` | **Defectos en validación/edición de insumos, omisión de errores `400` anidados (`recursos.0.cantidad`) y *race condition* en tabla:** El input numérico forzaba `0` y truncaba decimales; `recursos.0.cantidad` quedaba oculto; inventario no filtraba no disponibles ni restringía `esIndividual`; y clics rápidos competían en `handleAbrirEdicionDirecta`. | Media | `src/components/mando/recuperacion/ModalEditarOperativoRecuperacion.tsx`, `src/components/mando/recuperacion/OperativosRecuperacionView.tsx`, `src/components/mando/recuperacion/OperativosRecuperacionTabla.tsx` | 24/11/2026 15:26 | **`CORREGIDO`** | 25/11/2026 23:47 | `fix(recuperacion): sincronizar develop y resolver BUG-H74-WEB-01 a 05` | **Verificado:** Cantidades almacenadas como `string` y validadas con `/^\d+$/` y `Number.isSafeInteger >= 1` (`355-364`); `erroresFilasRecursos` mapea `/^recursos\.(\d+)\./` bajo cada fila (`438-446, 626-630`); `opcionesRecursos` excluye `NO_DISPONIBLE`/`EN_MANTENCION` y fija `esIndividual` en `'1'` (`239-251, 289-294, 365-369`); `edicionRequestSeqRef` (`65, 72-96`) y `disabled={Boolean(cargandoEdicionId)}` evitan condiciones de carrera. Test `BUG-H74-WEB-04` aprobado (`281ms` individual / `86ms` en suite). |
| `BUG-H74-WEB-05` | **Infracción de `GEMINI.md` §3/§4/§7, desfase OpenAPI en `api-generated.d.ts` y `recuperacionService.ts`, conflictos con `develop`, manual H74 sin capturas y cobertura Vitest:** Requería `<Button variant="teal">` sin inline, regenerar `api-generated.d.ts` real sin `x-user-id`, sincronizar `develop` con `next/font/local`, adjuntar capturas PNG en manual y ampliar pruebas Vitest. | Media | `src/types/api-generated.d.ts`, `src/services/recuperacionService.ts`, `src/components/mando/recuperacion/OperativosRecuperacionTabla.tsx`, `src/hooks/useRecuperacionSocket.ts`, `docs/manuals/H74-editar-operativo-recuperacion.md`, `docs/manuals/assets/H74-editar-operativo-recuperacion/` | 24/11/2026 15:24 | **`CORREGIDO`** | 26/11/2026 14:55 | `fix(recuperacion): regenerar OpenAPI 0.12.0, ajustar servicio, socket y capturas manual (BUG-H74-WEB-05)` | **Verificado en Re-Test Ciclo 3:** *(1)* `api-generated.d.ts` regenerado conforme OpenAPI `0.12.0` (`header?: never`, `BearerAuth`) y `recuperacionService.ts` ajustado (`editarOperativoRecuperacion` envía solo `params: { path: { id } }`, `listarOperativosRecuperacion` usa `data.meta?.total`, `listarEventosRecuperacion` y `obtenerEventoRecuperacion` compilan limpiamente con `npx tsc --noEmit` en `0` errores); *(2)* `3` capturas PNG reales (`01-tabla-y-drawer-editar.png`, `02-modal-editar-planificacion.png`, `03-operativo-bloqueado-completada.png`) integradas y enlazadas en `H74-editar-operativo-recuperacion.md`; *(3)* `<Button variant="teal">`, `<Chip>`, `next/font/local`, `git merge-tree` (`0` conflictos) y `7/7` suites (`65/65` tests) aprobados. |

---

## 3. Matriz Consolidada de Casos de Prueba (13 Columnas)

| ID Caso | Título del Caso de Prueba | Tipo de Prueba | Nivel | Prioridad | Precondición | Datos de Prueba (Payload / Headers / Query) | Resultado Esperado | Resultado Obtenido | Estado | Fecha / Hora Ejecución | Fecha / Hora Re-Test | Solución / Commit |
|---|---|---|---|---|---|---|---|---|:---:|:---:|:---:|---|
| `BUG-H74-WEB-01` | Preservación de datos editados en modal ante eventos WebSocket `recuperacion:actualizada` y estabilidad de `useEffect` en Drawer | Concurrencia / Reactividad | Integración UI | Crítica | `ModalEditarOperativoRecuperacion` abierto con cambios sin guardar en descripción o recursos | Prop `onCerrar` con `useCallback`, `onCerrarRef`/`toastRef` en Drawer, `estabaAbiertoRef`/`snapshotInicialRef` en Modal y `roomRefCounts` en Socket | El Drawer solo consulta `GET` al cambiar `operativoId` o `reloadNonce`, el modal conserva datos no guardados ante `actualizadoEn` y el cierre del Drawer no expulsa salas compartidas | Re-Test verificado: borrador conservado (`342ms`), banner `"Este operativo recibió una actualización externa..."` desplegado y `roomRefCounts` implementado en `useRecuperacionSocket.ts` | **CORREGIDO** | 24/11/2026 15:21 | 25/11/2026 23:47 | fix(recuperacion): sincronizar develop y resolver BUG-H74-WEB-01 a 05 |
| `BUG-H74-WEB-02` | Control RBAC *Fail-Closed* en `usePuedeEditarRecuperacion`, propagación del `userId` autenticado y auditoría visible en Drawer | Seguridad / RBAC / Auditoría | Hook / UI / DAL | Alta | Hook evaluado sin providers, durante carga de `AuthContext`, o usuario autenticado en Vista/Drawer | `AuthContext = null` y `SimulatedSessionContext = null`; `{ cargando: true }`; `AuthContext` sin `recuperacion:editar`; usuario autenticado en Drawer | `usePuedeEditarRecuperacion` retorna `false` (*Fail-Closed*), lee `AuthContext`/`SimulatedSessionContext`, propaga `activeUserId` al modal y Drawer exhibe `actualizadoEn`/`actualizadoPorId` | Re-Test verificado: `usePuedeEditarRecuperacion.test.ts` (`5/5` pass), propagación de `activeUserId` en Vista/Drawer y auditoría visible en Drawer | **CORREGIDO** | 24/11/2026 15:21 | 25/11/2026 23:47 | fix(recuperacion): sincronizar develop y resolver BUG-H74-WEB-01 a 05 |
| `BUG-H74-WEB-03` | Selección de patrulla cuando `operativo.patrulla` es `null`, bloqueo reactivo ante estado cerrado y limpieza de `modalEditarAbierto` en Drawer | Funcional / Borde / Estado | UI / Modal y Drawer | Alta | Operativo con `patrulla: null`, estado `COMPLETADA`/`CANCELADA`, conflicto `409 ESTADO_BLOQUEADO` o cierre por `404` | `{ ...base, patrulla: null, estado: 'COMPLETADA' }` en Modal; `409 ESTADO_BLOQUEADO`; `handleAbrirEdicionDirecta` y `404` en Drawer | `<Select>` incluye opción vacía `""`, inputs/selects/submit se bloquean ante estado cerrado o `409`, edición directa valida post-fetch y Drawer resetea `modalEditarAbierto` | Re-Test verificado: opción `"Seleccione una patrulla..."` renderizada, controles bloqueados (`326ms`), pre-chequeo en tabla y reseteo en cierre/`404` verificados | **CORREGIDO** | 24/11/2026 15:22 | 25/11/2026 23:47 | fix(recuperacion): sincronizar develop y resolver BUG-H74-WEB-01 a 05 |
| `BUG-H74-WEB-04` | Edición fluida de cantidades, despliegue de errores `400` anidados (`recursos.0.cantidad`), filtro de inventario/activos individuales y *race condition* en tabla | Validación / Usabilidad / Concurrencia | UI / Modal y Tabla | Media | Modal editando cantidades/recursos, respuesta `400` en `recursos.0.cantidad`, activos individuales/no disponibles o clics rápidos en tabla | Cantidad vacía `""` / decimal, error `{ campo: "recursos.0.cantidad" }`, `esIndividual: true`, `NO_DISPONIBLE`, `edicionRequestSeqRef` | Edición natural validando `/^\d+$/`, error mapeado bajo fila `0`, bloqueo de no disponibles y `esIndividual` en `'1'`, y control de concurrencia en tabla | Re-Test verificado: fecha inválida + mapeo de error `recursos.0.cantidad` verificado (`281ms`), filtro y bloqueo `esIndividual` operativos y `edicionRequestSeqRef` aplicado en tabla | **CORREGIDO** | 24/11/2026 15:26 | 25/11/2026 23:47 | fix(recuperacion): sincronizar develop y resolver BUG-H74-WEB-01 a 05 |
| `BUG-H74-WEB-05` | Cumplimiento de `GEMINI.md` §3/§4/§7, regeneración OpenAPI `0.12.0` real sin `x-user-id` (`openapi-typescript`), sync `develop`, capturas de manual y cobertura Vitest | Estándar / Contrato / Docs | Código / Contrato / Docs | Media | Contraste de `src/types/api-generated.d.ts` y `recuperacionService.ts` contra OpenAPI `0.12.0`, `git merge-tree` y `docs/manuals/` | `apiClient.PATCH` sin `x-user-id`, `npx tsc --noEmit`, `git merge-tree origin/develop HEAD`, `H74-editar-operativo-recuperacion.md` | `<Button variant="teal">` + `<Chip>` sin inline, `0` conflictos con `develop`, `0` errores `tsc` tras regenerar `api-generated.d.ts`, `3` PNGs reales en manual y suites Vitest añadidas | Re-Test Ciclo 3 exitoso: `api-generated.d.ts` regenerado (`header?: never`), `editarOperativoRecuperacion` sin `x-user-id`, `tsc` (`0` errores), `0` conflictos `develop`, `3` PNGs reales verificados visualmente en manual y `65/65` tests pasando | **CORREGIDO** | 24/11/2026 15:24 | 26/11/2026 14:55 | fix(recuperacion): regenerar OpenAPI 0.12.0, ajustar servicio, socket y capturas manual (BUG-H74-WEB-05) |
| `CP-H74-WEB-01` | Visualización y habilitación del botón `"Editar Planificación"` en `OperativoRecuperacionDrawer` para operativos en curso (CA-1) | Funcional / UI | UI / Drawer | Alta | Usuario con permiso `recuperacion:editar` abre detalle de operativo en estado `EN_EJECUCION` | `mockOperativoBase` (`id: e4f8b9a1-...`, `estado: 'EN_EJECUCION'`) | El panel superior del Drawer muestra el texto `"Planificación activa editable"` y el botón `"Editar Planificación"` habilitado | Botón `"Editar Planificación"` renderizado y habilitado correctamente en el Drawer (`200ms`) | **APROBADO** | 24/11/2026 15:27 | 26/11/2026 14:55 | feat(recuperacion): edicion de operativos de recuperacion y actualizacion en tiempo real (HU-74) |
| `CP-H74-WEB-02` | Bloqueo preventivo del botón `"Editar Planificación"` en `OperativoRecuperacionDrawer` cuando el estado es `COMPLETADA` (CA-3) | Regla de Negocio | UI / Drawer | Crítica | Usuario con permiso `recuperacion:editar` abre detalle de operativo culminado | `{ ...mockOperativoBase, estado: 'COMPLETADA' }` | El botón `"Editar Planificación"` se muestra deshabilitado (`disabled`) con mensaje de edición bloqueada | Botón `"Editar Planificación"` verificado en estado `disabled` en Vitest (`31ms`) | **APROBADO** | 24/11/2026 15:27 | 26/11/2026 14:55 | feat(recuperacion): edicion de operativos de recuperacion y actualizacion en tiempo real (HU-74) |
| `CP-H74-WEB-03` | Bloqueo preventivo del botón `"Editar Planificación"` en `OperativoRecuperacionDrawer` cuando el estado es `CANCELADA` (CA-3) | Regla de Negocio | UI / Drawer | Crítica | Usuario con permiso `recuperacion:editar` abre detalle de operativo cancelado | `{ ...mockOperativoBase, estado: 'CANCELADA' }` | El botón `"Editar Planificación"` se muestra deshabilitado (`disabled`) impidiendo abrir el modal desde el Drawer | Botón `"Editar Planificación"` verificado en estado `disabled` en Vitest (`33ms`) | **APROBADO** | 24/11/2026 15:27 | 26/11/2026 14:55 | feat(recuperacion): edicion de operativos de recuperacion y actualizacion en tiempo real (HU-74) |
| `CP-H74-WEB-04` | Ocultamiento de la acción `"Editar Planificación"` cuando el usuario carece del permiso `recuperacion:editar` (CA-5) | Seguridad / RBAC | UI / Permisos | Crítica | Hook `usePuedeEditarRecuperacion` retorna `false` (ej. perfil Supervisor sin permiso de edición) | `usePuedeEditarRecuperacion.mockReturnValue(false)` sobre `OperativoRecuperacionDrawer` | La barra de acción y el botón `"Editar Planificación"` no se renderizan en el DOM | Control ausente en el DOM verificando restricción RBAC en Vitest (`25ms`) | **APROBADO** | 24/11/2026 15:27 | 26/11/2026 14:55 | feat(recuperacion): edicion de operativos de recuperacion y actualizacion en tiempo real (HU-74) |
| `CP-H74-WEB-05` | Precarga de planificación actual y envío de `PATCH` parcial solo con descripción y `patrullaId` modificados (CA-2) | Funcional / Formulario | UI / Modal | Crítica | `ModalEditarOperativoRecuperacion` abierto con `mockOperativoBase`; catálogos de recursos y patrullas disponibles cargados | Modificar `descripcion` a `"Ampliación de entrega en Collico Alto"` y `patrullaId` a `50000000-...-0002` sin alterar recursos | Precarga descripción inicial, omite `recursos` al no variar, invoca `editarOperativoRecuperacion`, ejecuta `onSuccess` y cierra el modal | Payload enviado únicamente con `{ descripcion, patrullaId }`, callbacks ejecutados (`103ms`) | **APROBADO** | 24/11/2026 15:27 | 26/11/2026 14:55 | feat(recuperacion): edicion de operativos de recuperacion y actualizacion en tiempo real (HU-74) |
| `CP-H74-WEB-06` | Retención del modal abierto con alerta de error cuando la API responde `409 Conflict` | Manejo de Errores / UX | UI / Modal | Alta | `editarOperativoRecuperacion` rechaza con `RecuperacionServiceError` (`statusCode: 409`) | Cantidad modificada a `500`; error `"Stock insuficiente en bodega para Kit Techumbre."` | El modal permanece abierto conservando los datos del formulario, muestra `InlineNotice` de error y no ejecuta `onClose` | Banner de error desplegado y `onClose` no invocado (`68ms`) | **APROBADO** | 24/11/2026 15:27 | 26/11/2026 14:55 | feat(recuperacion): edicion de operativos de recuperacion y actualizacion en tiempo real (HU-74) |
| `CP-H74-WEB-07` | Respuesta exitosa `200 OK` en capa de servicio `editarOperativoRecuperacion` (`PATCH /api/eventos-atp/recuperacion/{id}`) sin `x-user-id` | Pruebas Unitarias / DAL | Service / API | Crítica | Suite `recuperacionService.test.ts` ejecutando `editarOperativoRecuperacion` con mock de `apiClient.PATCH` | `id: e4f8b9a1-...`, body `{ descripcion: "Nueva descripción operativa", patrullaId: "p2" }` | Envía petición `PATCH` al endpoint tipado con `{ path: { id } }` (autenticado por `apiClient` Bearer JWT) y retorna objeto actualizado | `24/24` pruebas del servicio aprobadas verificando retorno `200 OK` (`1ms`) | **APROBADO** | 24/11/2026 15:27 | 26/11/2026 14:55 | fix(recuperacion): regenerar OpenAPI 0.12.0, ajustar servicio, socket y capturas manual (BUG-H74-WEB-05) |
| `CP-H74-WEB-08` | Clasificación de conflictos `409` en `ESTADO_BLOQUEADO` (`COMPLETADA`/`CANCELADA`) y `STOCK_INSUFICIENTE` en DAL | Pruebas Unitarias / Negocio | Service / DAL | Crítica | Respuesta HTTP `409` simulada desde `apiClient.PATCH` en `recuperacionService.test.ts` | Mensajes `"No se puede editar un operativo en estado COMPLETADA."` y `"Stock insuficiente en bodega..."` | `RecuperacionServiceError` clasifica `tipoConflicto` como `'ESTADO_BLOQUEADO'` o `'STOCK_INSUFICIENTE'` respectivamente | Clasificación verificada en ambos escenarios en Vitest (`0ms` y `0ms`) | **APROBADO** | 24/11/2026 15:27 | 26/11/2026 14:55 | feat(recuperacion): edicion de operativos de recuperacion y actualizacion en tiempo real (HU-74) |
| `CP-H74-WEB-09` | Propagación de error `403 Forbidden` en `editarOperativoRecuperacion` cuando falta permiso `recuperacion:editar` | Seguridad / DAL | Service / DAL | Alta | Respuesta HTTP `403` simulada desde `apiClient.PATCH` | `{ message: 'Forbidden' }` con status `403` | Lanza `RecuperacionServiceError` con `statusCode: 403` mencionando permiso `recuperacion:editar` | Excepción validada con `statusCode: 403` y mensaje institucional (`0ms`) | **APROBADO** | 24/11/2026 15:27 | 26/11/2026 14:55 | feat(recuperacion): edicion de operativos de recuperacion y actualizacion en tiempo real (HU-74) |
| `CP-H74-WEB-10` | Suscripción en tiempo real a `recuperacion:actualizada`, conteo de salas `roomRefCounts` y limpieza de listeners en `useRecuperacionSocket` | Tiempo Real / WebSocket | Hook / Socket.io | Alta | Hook `useRecuperacionSocket` montado con callback `onRecuperacionActualizada` | Emisión de evento `'recuperacion:actualizada'` con objeto `REC-2026-0001` y desmontaje con `roomRefCounts` | Invoca `onRecuperacionActualizada`, actualiza `ultimoEvento`, conserva salas mientras haya suscriptores activos y ejecuta `socket.off` al desmontar | Evento procesado, refcounting y limpieza verificados en Vitest (`9/9` tests pass, `2ms` y `3ms`) | **APROBADO** | 24/11/2026 15:27 | 26/11/2026 14:55 | fix(recuperacion): regenerar OpenAPI 0.12.0, ajustar servicio, socket y capturas manual (BUG-H74-WEB-05) |
| `CP-H74-WEB-11` | Prueba en vivo HTTP `GET` y `PATCH /api/eventos-atp/recuperacion/{id}` (`200 OK`) con auditoría y stock diferencial (CA-2 / CA-4) | Integración API / cURL | Backend / DB | Crítica | `sgrai-api` H74 con fixture sembrado y token JWT de `encargado@valdivia.cl` | `PATCH .../74100000-...-0001` con `descripcion`, `fechaEstimadaFin: "2026-11-30T18:00:00.000Z"` y `recursos` (`90` y `15`) | API retorna `200 OK` actualizando `descripcion`, `fechaEstimadaFin`, `recursos`, `actualizadoPorId` y `actualizadoEn` | `200 OK` verificado en vivo (`25/11/2026`); `GET` posterior confirma `cantidadInsumosAsignados: 105` y `actualizadoPorId: ...0003` (código backend H74 sin cambios al `26/11/2026`) | **APROBADO** | 24/11/2026 15:26 | 25/11/2026 23:47 | feat(recuperacion): edicion de operativos de recuperacion y actualizacion en tiempo real (HU-74) |
| `CP-H74-WEB-12` | Prueba en vivo HTTP `409 Conflict` en estados `COMPLETADA`/`CANCELADA`, stock insuficiente y patrulla ocupada (CA-3) | Integración API / cURL | Backend / Negocio | Crítica | `sgrai-api` H74 con `REC-2026-7403` (`COMPLETADA`), `REC-2026-7404` (`CANCELADA`) y patrulla `EN_VERIFICACION` | `PATCH` sobre `...7403`, `...7404`, `cantidad: 99999` y `patrullaId: f1000000-...-0001` | API rechaza todos los casos con `409 Conflict` y mensajes descriptivos del estado o disponibilidad | `409 Conflict` verificado en vivo (`25/11/2026`) para los 4 escenarios sin alterar datos en BD | **APROBADO** | 24/11/2026 15:26 | 25/11/2026 23:47 | feat(recuperacion): edicion de operativos de recuperacion y actualizacion en tiempo real (HU-74) |
| `CP-H74-WEB-13` | Prueba en vivo HTTP `401 Unauthorized` (sin JWT Bearer) y `403 Forbidden` (Supervisor sin permiso de creación/edición) (CA-5) | Seguridad RBAC / cURL | Backend / Auth | Crítica | Token JWT de `supervisor@valdivia.cl` y petición sin token con cabecera `x-user-id` | `PATCH .../74100000-...-0001` sin `Authorization` o con `Authorization: Bearer <SUP_TOKEN>` | API responde `401` exigiendo `Authorization: Bearer` y `403` exigiendo `recuperacion:crear`/`recuperacion:editar`/Encargado | `401 Unauthorized` y `403 Forbidden` (`"Acceso denegado. Se requiere permiso 'recuperacion:crear', 'recuperacion:editar' o rol Encargado."`) verificados (`25/11/2026`) | **APROBADO** | 24/11/2026 15:26 | 25/11/2026 23:47 | feat(recuperacion): edicion de operativos de recuperacion y actualizacion en tiempo real (HU-74) |
| `CP-H74-WEB-14` | Prueba en vivo HTTP `400 Bad Request` (body vacío, fecha anterior, `cantidad: 0`) y `404 Not Found` (UUID inexistente) | Validación / Contrato | Backend / cURL | Alta | `sgrai-api` H74 con token JWT de Encargado | `PATCH` con `{}`, `fechaEstimadaFin: "2025-01-01T00:00:00.000Z"`, `cantidad: 0` y UUID `00000000-...-999999999999` | API responde `400 Bad Request` con detalle de validación y `404 Not Found` para identificador inexistente | `400` (`errors` por campo y mensaje temporal) y `404` verificados en vivo (`25/11/2026`) | **APROBADO** | 24/11/2026 15:26 | 25/11/2026 23:47 | feat(recuperacion): edicion de operativos de recuperacion y actualizacion en tiempo real (HU-74) |
| `CP-H74-WEB-15` | Análisis estático (`npm run lint`), tipos TypeScript (`npx tsc --noEmit`), regresión global (`npm test`) y compilación (`npm run build`) | Calidad / Build / CI | Proyecto Completo | Alta | Rama `feature/H74-editar-operativo-recuperacion` tras commit final | `npm run lint`, `npx tsc --noEmit`, `npm test`, `npm run build`, `git merge-tree` | Código de salida `0` en los cuatro pipelines sin errores de compilación ni regresiones ni conflictos | `lint` (`0` errores), `tsc --noEmit` (`0` errores), `npm test` (`141` archivos / `1028` tests pass en `32.13s`), `next build --webpack` (`49` rutas, `Exit 0`) y `merge-tree` limpio | **APROBADO** | 24/11/2026 15:24 | 26/11/2026 14:55 | fix(recuperacion): regenerar OpenAPI 0.12.0, ajustar servicio, socket y capturas manual (BUG-H74-WEB-05) |

---

## 4. Bloque TSV para Google Sheets

```tsv
ID Caso	Título del Caso de Prueba	Tipo de Prueba	Nivel	Prioridad	Precondición	Datos de Prueba (Payload / Headers / Query)	Resultado Esperado	Resultado Obtenido	Estado	Fecha / Hora Ejecución	Fecha / Hora Re-Test	Solución / Commit
BUG-H74-WEB-01	Preservación de datos editados en modal ante eventos WebSocket recuperacion:actualizada y estabilidad de useEffect en Drawer	Concurrencia / Reactividad	Integración UI	Crítica	ModalEditarOperativoRecuperacion abierto con cambios sin guardar en descripción o recursos	Prop onCerrar con useCallback, onCerrarRef/toastRef en Drawer, estabaAbiertoRef/snapshotInicialRef en Modal y roomRefCounts en Socket	El Drawer solo consulta GET al cambiar operativoId o reloadNonce, el modal conserva datos no guardados ante actualizadoEn y el cierre del Drawer no expulsa salas compartidas	Re-Test verificado: borrador conservado (342ms), banner "Este operativo recibió una actualización externa..." desplegado y roomRefCounts implementado en useRecuperacionSocket.ts	CORREGIDO	24/11/2026 15:21	25/11/2026 23:47	fix(recuperacion): sincronizar develop y resolver BUG-H74-WEB-01 a 05
BUG-H74-WEB-02	Control RBAC Fail-Closed en usePuedeEditarRecuperacion, propagación del userId autenticado y auditoría visible en Drawer	Seguridad / RBAC / Auditoría	Hook / UI / DAL	Alta	Hook evaluado sin providers, durante carga de AuthContext, o usuario autenticado en Vista/Drawer	AuthContext = null y SimulatedSessionContext = null; { cargando: true }; AuthContext sin recuperacion:editar; usuario autenticado en Drawer	usePuedeEditarRecuperacion retorna false (Fail-Closed), lee AuthContext/SimulatedSessionContext, propaga activeUserId al modal y Drawer exhibe actualizadoEn/actualizadoPorId	Re-Test verificado: usePuedeEditarRecuperacion.test.ts (5/5 pass), propagación de activeUserId en Vista/Drawer y auditoría visible en Drawer	CORREGIDO	24/11/2026 15:21	25/11/2026 23:47	fix(recuperacion): sincronizar develop y resolver BUG-H74-WEB-01 a 05
BUG-H74-WEB-03	Selección de patrulla cuando operativo.patrulla es null, bloqueo reactivo ante estado cerrado y limpieza de modalEditarAbierto en Drawer	Funcional / Borde / Estado	UI / Modal y Drawer	Alta	Operativo con patrulla: null, estado COMPLETADA/CANCELADA, conflicto 409 ESTADO_BLOQUEADO o cierre por 404	{ ...base, patrulla: null, estado: 'COMPLETADA' } en Modal; 409 ESTADO_BLOQUEADO; handleAbrirEdicionDirecta y 404 en Drawer	Select incluye opción vacía "", inputs/selects/submit se bloquean ante estado cerrado o 409, edición directa valida post-fetch y Drawer resetea modalEditarAbierto	Re-Test verificado: opción "Seleccione una patrulla..." renderizada, controles bloqueados (326ms), pre-chequeo en tabla y reseteo en cierre/404 verificados	CORREGIDO	24/11/2026 15:22	25/11/2026 23:47	fix(recuperacion): sincronizar develop y resolver BUG-H74-WEB-01 a 05
BUG-H74-WEB-04	Edición fluida de cantidades, despliegue de errores 400 anidados (recursos.0.cantidad), filtro de inventario/activos individuales y race condition en tabla	Validación / Usabilidad / Concurrencia	UI / Modal y Tabla	Media	Modal editando cantidades/recursos, respuesta 400 en recursos.0.cantidad, activos individuales/no disponibles o clics rápidos en tabla	Cantidad vacía "" / decimal, error { campo: "recursos.0.cantidad" }, esIndividual: true, NO_DISPONIBLE, edicionRequestSeqRef	Edición natural validando /^\d+$/, error mapeado bajo fila 0, bloqueo de no disponibles y esIndividual en '1', y control de concurrencia en tabla	Re-Test verificado: fecha inválida + mapeo de error recursos.0.cantidad verificado (281ms), filtro y bloqueo esIndividual operativos y edicionRequestSeqRef aplicado en tabla	CORREGIDO	24/11/2026 15:26	25/11/2026 23:47	fix(recuperacion): sincronizar develop y resolver BUG-H74-WEB-01 a 05
BUG-H74-WEB-05	Cumplimiento de GEMINI.md §3/§4/§7, regeneración OpenAPI 0.12.0 real sin x-user-id (openapi-typescript), sync develop, capturas de manual y cobertura Vitest	Estándar / Contrato / Docs	Código / Contrato / Docs	Media	Contraste de src/types/api-generated.d.ts y recuperacionService.ts contra OpenAPI 0.12.0, git merge-tree y docs/manuals/	apiClient.PATCH sin x-user-id, npx tsc --noEmit, git merge-tree origin/develop HEAD, H74-editar-operativo-recuperacion.md	Button variant="teal" + Chip sin inline, 0 conflictos con develop, 0 errores tsc tras regenerar api-generated.d.ts, 3 PNGs reales en manual y suites Vitest añadidas	Re-Test Ciclo 3 exitoso: api-generated.d.ts regenerado (header?: never), editarOperativoRecuperacion sin x-user-id, tsc (0 errores), 0 conflictos develop, 3 PNGs reales verificados visualmente en manual y 65/65 tests pasando	CORREGIDO	24/11/2026 15:24	26/11/2026 14:55	fix(recuperacion): regenerar OpenAPI 0.12.0, ajustar servicio, socket y capturas manual (BUG-H74-WEB-05)
CP-H74-WEB-01	Visualización y habilitación del botón "Editar Planificación" en OperativoRecuperacionDrawer para operativos en curso (CA-1)	Funcional / UI	UI / Drawer	Alta	Usuario con permiso recuperacion:editar abre detalle de operativo en estado EN_EJECUCION	mockOperativoBase (id: e4f8b9a1-..., estado: 'EN_EJECUCION')	El panel superior del Drawer muestra el texto "Planificación activa editable" y el botón "Editar Planificación" habilitado	Botón "Editar Planificación" renderizado y habilitado correctamente en el Drawer (200ms)	APROBADO	24/11/2026 15:27	26/11/2026 14:55	feat(recuperacion): edicion de operativos de recuperacion y actualizacion en tiempo real (HU-74)
CP-H74-WEB-02	Bloqueo preventivo del botón "Editar Planificación" en OperativoRecuperacionDrawer cuando el estado es COMPLETADA (CA-3)	Regla de Negocio	UI / Drawer	Crítica	Usuario con permiso recuperacion:editar abre detalle de operativo culminado	{ ...mockOperativoBase, estado: 'COMPLETADA' }	El botón "Editar Planificación" se muestra deshabilitado (disabled) con mensaje de edición bloqueada	Botón "Editar Planificación" verificado en estado disabled en Vitest (31ms)	APROBADO	24/11/2026 15:27	26/11/2026 14:55	feat(recuperacion): edicion de operativos de recuperacion y actualizacion en tiempo real (HU-74)
CP-H74-WEB-03	Bloqueo preventivo del botón "Editar Planificación" en OperativoRecuperacionDrawer cuando el estado es CANCELADA (CA-3)	Regla de Negocio	UI / Drawer	Crítica	Usuario con permiso recuperacion:editar abre detalle de operativo cancelado	{ ...mockOperativoBase, estado: 'CANCELADA' }	El botón "Editar Planificación" se muestra deshabilitado (disabled) impidiendo abrir el modal desde el Drawer	Botón "Editar Planificación" verificado en estado disabled en Vitest (33ms)	APROBADO	24/11/2026 15:27	26/11/2026 14:55	feat(recuperacion): edicion de operativos de recuperacion y actualizacion en tiempo real (HU-74)
CP-H74-WEB-04	Ocultamiento de la acción "Editar Planificación" cuando el usuario carece del permiso recuperacion:editar (CA-5)	Seguridad / RBAC	UI / Permisos	Crítica	Hook usePuedeEditarRecuperacion retorna false (ej. perfil Supervisor sin permiso de edición)	usePuedeEditarRecuperacion.mockReturnValue(false) sobre OperativoRecuperacionDrawer	La barra de acción y el botón "Editar Planificación" no se renderizan en el DOM	Control ausente en el DOM verificando restricción RBAC en Vitest (25ms)	APROBADO	24/11/2026 15:27	26/11/2026 14:55	feat(recuperacion): edicion de operativos de recuperacion y actualizacion en tiempo real (HU-74)
CP-H74-WEB-05	Precarga de planificación actual y envío de PATCH parcial solo con descripción y patrullaId modificados (CA-2)	Funcional / Formulario	UI / Modal	Crítica	ModalEditarOperativoRecuperacion abierto con mockOperativoBase; catálogos de recursos y patrullas disponibles cargados	Modificar descripcion a "Ampliación de entrega en Collico Alto" y patrullaId a 50000000-...-0002 sin alterar recursos	Precarga descripción inicial, omite recursos al no variar, invoca editarOperativoRecuperacion, ejecuta onSuccess y cierra el modal	Payload enviado únicamente con { descripcion, patrullaId }, callbacks ejecutados (103ms)	APROBADO	24/11/2026 15:27	26/11/2026 14:55	feat(recuperacion): edicion de operativos de recuperacion y actualizacion en tiempo real (HU-74)
CP-H74-WEB-06	Retención del modal abierto con alerta de error cuando la API responde 409 Conflict	Manejo de Errores / UX	UI / Modal	Alta	editarOperativoRecuperacion rechaza con RecuperacionServiceError (statusCode: 409)	Cantidad modificada a 500; error "Stock insuficiente en bodega para Kit Techumbre."	El modal permanece abierto conservando los datos del formulario, muestra InlineNotice de error y no ejecuta onClose	Banner de error desplegado y onClose no invocado (68ms)	APROBADO	24/11/2026 15:27	26/11/2026 14:55	feat(recuperacion): edicion de operativos de recuperacion y actualizacion en tiempo real (HU-74)
CP-H74-WEB-07	Respuesta exitosa 200 OK en capa de servicio editarOperativoRecuperacion (PATCH /api/eventos-atp/recuperacion/{id}) sin x-user-id	Pruebas Unitarias / DAL	Service / API	Crítica	Suite recuperacionService.test.ts ejecutando editarOperativoRecuperacion con mock de apiClient.PATCH	id: e4f8b9a1-..., body { descripcion: "Nueva descripción operativa", patrullaId: "p2" }	Envía petición PATCH al endpoint tipado con { path: { id } } (autenticado por apiClient Bearer JWT) y retorna objeto actualizado	24/24 pruebas del servicio aprobadas verificando retorno 200 OK (1ms)	APROBADO	24/11/2026 15:27	26/11/2026 14:55	fix(recuperacion): regenerar OpenAPI 0.12.0, ajustar servicio, socket y capturas manual (BUG-H74-WEB-05)
CP-H74-WEB-08	Clasificación de conflictos 409 en ESTADO_BLOQUEADO (COMPLETADA/CANCELADA) y STOCK_INSUFICIENTE en DAL	Pruebas Unitarias / Negocio	Service / DAL	Crítica	Respuesta HTTP 409 simulada desde apiClient.PATCH en recuperacionService.test.ts	Mensajes "No se puede editar un operativo en estado COMPLETADA." y "Stock insuficiente en bodega..."	RecuperacionServiceError clasifica tipoConflicto como 'ESTADO_BLOQUEADO' o 'STOCK_INSUFICIENTE' respectivamente	Clasificación verificada en ambos escenarios en Vitest (0ms y 0ms)	APROBADO	24/11/2026 15:27	26/11/2026 14:55	feat(recuperacion): edicion de operativos de recuperacion y actualizacion en tiempo real (HU-74)
CP-H74-WEB-09	Propagación de error 403 Forbidden en editarOperativoRecuperacion cuando falta permiso recuperacion:editar	Seguridad / DAL	Service / DAL	Alta	Respuesta HTTP 403 simulada desde apiClient.PATCH	{ message: 'Forbidden' } con status 403	Lanza RecuperacionServiceError con statusCode: 403 mencionando permiso recuperacion:editar	Excepción validada con statusCode: 403 y mensaje institucional (0ms)	APROBADO	24/11/2026 15:27	26/11/2026 14:55	feat(recuperacion): edicion de operativos de recuperacion y actualizacion en tiempo real (HU-74)
CP-H74-WEB-10	Suscripción en tiempo real a recuperacion:actualizada, conteo de salas roomRefCounts y limpieza de listeners en useRecuperacionSocket	Tiempo Real / WebSocket	Hook / Socket.io	Alta	Hook useRecuperacionSocket montado con callback onRecuperacionActualizada	Emisión de evento 'recuperacion:actualizada' con objeto REC-2026-0001 y desmontaje con roomRefCounts	Invoca onRecuperacionActualizada, actualiza ultimoEvento, conserva salas mientras haya suscriptores activos y ejecuta socket.off al desmontar	Evento procesado, refcounting y limpieza verificados en Vitest (9/9 tests pass, 2ms y 3ms)	APROBADO	24/11/2026 15:27	26/11/2026 14:55	fix(recuperacion): regenerar OpenAPI 0.12.0, ajustar servicio, socket y capturas manual (BUG-H74-WEB-05)
CP-H74-WEB-11	Prueba en vivo HTTP GET y PATCH /api/eventos-atp/recuperacion/{id} (200 OK) con auditoría y stock diferencial (CA-2 / CA-4)	Integración API / cURL	Backend / DB	Crítica	sgrai-api H74 con fixture sembrado y token JWT de encargado@valdivia.cl	PATCH .../74100000-...-0001 con descripcion, fechaEstimadaFin: "2026-11-30T18:00:00.000Z" y recursos (90 y 15)	API retorna 200 OK actualizando descripcion, fechaEstimadaFin, recursos, actualizadoPorId y actualizadoEn	200 OK verificado en vivo (25/11/2026); GET posterior confirma cantidadInsumosAsignados: 105 y actualizadoPorId: ...0003 (código backend H74 sin cambios al 26/11/2026)	APROBADO	24/11/2026 15:26	25/11/2026 23:47	feat(recuperacion): edicion de operativos de recuperacion y actualizacion en tiempo real (HU-74)
CP-H74-WEB-12	Prueba en vivo HTTP 409 Conflict en estados COMPLETADA/CANCELADA, stock insuficiente y patrulla ocupada (CA-3)	Integración API / cURL	Backend / Negocio	Crítica	sgrai-api H74 con REC-2026-7403 (COMPLETADA), REC-2026-7404 (CANCELADA) y patrulla EN_VERIFICACION	PATCH sobre ...7403, ...7404, cantidad: 99999 y patrullaId: f1000000-...-0001	API rechaza todos los casos con 409 Conflict y mensajes descriptivos del estado o disponibilidad	409 Conflict verificado en vivo (25/11/2026) para los 4 escenarios sin alterar datos en BD	APROBADO	24/11/2026 15:26	25/11/2026 23:47	feat(recuperacion): edicion de operativos de recuperacion y actualizacion en tiempo real (HU-74)
CP-H74-WEB-13	Prueba en vivo HTTP 401 Unauthorized (sin JWT Bearer) y 403 Forbidden (Supervisor sin permiso de creación/edición) (CA-5)	Seguridad RBAC / cURL	Backend / Auth	Crítica	Token JWT de supervisor@valdivia.cl y petición sin token con cabecera x-user-id	PATCH .../74100000-...-0001 sin Authorization o con Authorization: Bearer <SUP_TOKEN>	API responde 401 exigiendo Authorization: Bearer y 403 exigiendo recuperacion:crear/recuperacion:editar/Encargado	401 Unauthorized y 403 Forbidden ("Acceso denegado. Se requiere permiso 'recuperacion:crear', 'recuperacion:editar' o rol Encargado.") verificados (25/11/2026)	APROBADO	24/11/2026 15:26	25/11/2026 23:47	feat(recuperacion): edicion de operativos de recuperacion y actualizacion en tiempo real (HU-74)
CP-H74-WEB-14	Prueba en vivo HTTP 400 Bad Request (body vacío, fecha anterior, cantidad: 0) y 404 Not Found (UUID inexistente)	Validación / Contrato	Backend / cURL	Alta	sgrai-api H74 con token JWT de Encargado	PATCH con {}, fechaEstimadaFin: "2025-01-01T00:00:00.000Z", cantidad: 0 y UUID 00000000-...-999999999999	API responde 400 Bad Request con detalle de validación y 404 Not Found para identificador inexistente	400 (errors por campo y mensaje temporal) y 404 verificados en vivo (25/11/2026)	APROBADO	24/11/2026 15:26	25/11/2026 23:47	feat(recuperacion): edicion de operativos de recuperacion y actualizacion en tiempo real (HU-74)
CP-H74-WEB-15	Análisis estático (npm run lint), tipos TypeScript (npx tsc --noEmit), regresión global (npm test) y compilación (npm run build)	Calidad / Build / CI	Proyecto Completo	Alta	Rama feature/H74-editar-operativo-recuperacion tras commit final	npm run lint, npx tsc --noEmit, npm test, npm run build, git merge-tree	Código de salida 0 en los cuatro pipelines sin errores de compilación ni regresiones ni conflictos	lint (0 errores), tsc --noEmit (0 errores), npm test (141 archivos / 1028 tests pass en 32.13s), next build --webpack (49 rutas, Exit 0) y merge-tree limpio	APROBADO	24/11/2026 15:24	26/11/2026 14:55	fix(recuperacion): regenerar OpenAPI 0.12.0, ajustar servicio, socket y capturas manual (BUG-H74-WEB-05)
```

---

## 5. Guía de Ejecución y Replicabilidad Paso a Paso (Re-Test Final `26/11/2026`)

### 5.1. Ejecución de Suites Automatizadas en Vitest

#### Comando consolidado para las suites de recuperación (HU-32 / HU-73 / HU-74)
```bash
npx vitest run \
  src/components/mando/recuperacion/__tests__/ModalEditarOperativoRecuperacion.test.tsx \
  src/components/mando/recuperacion/__tests__/OperativosRecuperacionView.test.tsx \
  src/hooks/__tests__/usePuedeEditarRecuperacion.test.ts \
  src/hooks/__tests__/useRecuperacionSocket.test.ts \
  src/services/__tests__/recuperacionService.test.ts \
  src/components/recuperacion/__tests__/DetalleEventoRecuperacionClient.test.tsx \
  src/components/mando/__tests__/KanbanViewSwitcher.test.tsx \
  --reporter=verbose
```

**Evidencia real obtenida en consola:**
```text
 ✓ src/hooks/__tests__/useRecuperacionSocket.test.ts > useRecuperacionSocket (HU-29) > debe conectar al socket y unirse a las salas operativas 19ms
 ✓ src/hooks/__tests__/useRecuperacionSocket.test.ts > useRecuperacionSocket (HU-29) > debe invocar onRecuperacionActualizada al recibir evento WebSocket recuperacion:actualizada 2ms
 ✓ src/services/__tests__/recuperacionService.test.ts > recuperacionService (HU-74: editarOperativoRecuperacion) > debe retornar 200 OK con el operativo actualizado cuando PATCH es exitoso 1ms
 ✓ src/hooks/__tests__/usePuedeEditarRecuperacion.test.ts > usePuedeEditarRecuperacion (HU-74 - Fail-Closed) > retorna false cuando se renderiza fuera de AuthProvider y SimulatedSessionProvider (Fail-Closed) 14ms
 ✓ src/components/mando/__tests__/KanbanViewSwitcher.test.tsx > KanbanViewSwitcher > debe llamar a onCambiarVista con "recuperacion" al hacer clic en Recuperación 17ms
 ✓ src/components/mando/recuperacion/__tests__/ModalEditarOperativoRecuperacion.test.tsx > HU-74: OperativoRecuperacionDrawer y ModalEditarOperativoRecuperacion > BUG-H74-WEB-01: no debe sobrescribir cambios no guardados si operativo cambia de referencia/actualizadoEn mientras el modal está abierto 33ms
 ✓ src/components/mando/recuperacion/__tests__/ModalEditarOperativoRecuperacion.test.tsx > HU-74: OperativoRecuperacionDrawer y ModalEditarOperativoRecuperacion > BUG-H74-WEB-03: debe incluir opción vacía cuando patrulla es null y bloquear inputs en estado COMPLETADA 43ms
 ✓ src/components/mando/recuperacion/__tests__/ModalEditarOperativoRecuperacion.test.tsx > HU-74: OperativoRecuperacionDrawer y ModalEditarOperativoRecuperacion > BUG-H74-WEB-04: debe validar fechaEstimadaFin anterior a creadoEn y mapear errores 400 por fila (recursos.0.cantidad) 86ms
 ✓ src/components/mando/recuperacion/__tests__/OperativosRecuperacionView.test.tsx > OperativosRecuperacionView (HU-73) > HU-74: permite abrir el modal de edición directa desde el botón Editar de la tabla y bloquea si el operativo está cerrado 130ms
 ✓ src/components/recuperacion/__tests__/DetalleEventoRecuperacionClient.test.tsx > DetalleEventoRecuperacionClient (HU-32) > 9. BUG-INT-30: ante conflicto 409 EVENTO_CERRADO refresca el detalle una sola vez sin petición HTTP duplicada 82ms

 Test Files  7 passed (7)
      Tests  65 passed (65)
   Start at  14:53:01
   Duration  3.02s (transform 1.44s, setup 1.09s, collect 3.20s, tests 2.36s, environment 6.40s, prepare 955ms)
```

#### Suite de regresión global del repositorio
```bash
npm test
```

**Evidencia real obtenida en consola:**
```text
 Test Files  141 passed (141)
      Tests  1028 passed (1028)
   Start at  14:51:13
   Duration  32.13s (transform 12.65s, setup 31.63s, collect 68.56s, tests 103.08s, environment 186.46s, prepare 22.50s)
```

#### Ejecución individual de casos clave con `npm test -- -t "..."`

1. **`BUG-H74-WEB-01` — Preservación de borrador en modal ante actualización externa:**
```bash
npm test -- src/components/mando/recuperacion/__tests__/ModalEditarOperativoRecuperacion.test.tsx -t "BUG-H74-WEB-01"
```
```text
 ✓ HU-74: OperativoRecuperacionDrawer y ModalEditarOperativoRecuperacion > BUG-H74-WEB-01: no debe sobrescribir cambios no guardados si operativo cambia de referencia/actualizadoEn mientras el modal está abierto  342ms
 Test Files  1 passed (1)
      Tests  1 passed | 8 skipped (9)
```

2. **`BUG-H74-WEB-03` — Opción vacía cuando `patrulla` es `null` y bloqueo en `COMPLETADA`:**
```bash
npm test -- src/components/mando/recuperacion/__tests__/ModalEditarOperativoRecuperacion.test.tsx -t "BUG-H74-WEB-03"
```
```text
 ✓ HU-74: OperativoRecuperacionDrawer y ModalEditarOperativoRecuperacion > BUG-H74-WEB-03: debe incluir opción vacía cuando patrulla es null y bloquear inputs en estado COMPLETADA  326ms
 Test Files  1 passed (1)
      Tests  1 passed | 8 skipped (9)
```

3. **`BUG-H74-WEB-04` — Validación `fechaEstimadaFin < creadoEn` y mapeo de errores `recursos.0.cantidad`:**
```bash
npm test -- src/components/mando/recuperacion/__tests__/ModalEditarOperativoRecuperacion.test.tsx -t "BUG-H74-WEB-04"
```
```text
 ✓ HU-74: OperativoRecuperacionDrawer y ModalEditarOperativoRecuperacion > BUG-H74-WEB-04: debe validar fechaEstimadaFin anterior a creadoEn y mapear errores 400 por fila (recursos.0.cantidad) 281ms
 Test Files  1 passed (1)
      Tests  1 passed | 8 skipped (9)
```

4. **`OperativosRecuperacionView` (HU-74) — Apertura de edición directa desde botón `"Editar"` en tabla:**
```bash
npm test -- src/components/mando/recuperacion/__tests__/OperativosRecuperacionView.test.tsx -t "HU-74"
```
```text
 ✓ OperativosRecuperacionView (HU-73) > HU-74: permite abrir el modal de edición directa desde el botón Editar de la tabla y bloquea si el operativo está cerrado  321ms
 Test Files  1 passed (1)
      Tests  1 passed | 4 skipped (5)
```

---

### 5.2. Verificación Estática, Compilación, Fuentes Locales e Integración con `origin/develop`

```bash
rm -rf .next
npm run lint
npx tsc --noEmit
npm run build
grep -rn "next/font/google" src || echo "OK: sin Google Fonts"
git merge-tree --write-tree --name-only origin/develop HEAD
```

**Evidencia real obtenida en consola (`26/11/2026 14:52`):**
```text
=== LINT OK ===
=== TSC OK ===
▲ Next.js 16.3.4 (webpack)
✓ Compiled successfully in 14.4s
✓ Finished TypeScript in 13.7s
✓ Generating static pages using 15 workers (49/49) in 1160ms
=== BUILD OK ===
OK: sin Google Fonts
51fc0cb2707ab4668dc59035ea11466d668b8afb
```

---

### 5.3. Evidencia HTTP/cURL en Vivo contra `sgrai-api` (`http://localhost:3001`)

#### Verificación de contrato OpenAPI `0.12.0` expuesto en vivo (`25/11/2026`, equivalente al regenerado en `src/types/api-generated.d.ts`)
```bash
curl -s http://localhost:3001/openapi.json | node -e "const d = JSON.parse(require('fs').readFileSync(0,'utf8')); console.log('OpenAPI version:', d.info?.version); console.log('PATCH params:', JSON.stringify(d.paths['/api/eventos-atp/recuperacion/{id}']?.patch?.parameters)); console.log('PATCH security:', JSON.stringify(d.paths['/api/eventos-atp/recuperacion/{id}']?.patch?.security));"
```
```text
OpenAPI version: 0.12.0
PATCH params: [{"schema":{"type":"string","format":"uuid","description":"UUID del operativo de recuperación a consultar","example":"70000000-0000-4000-8000-000000000001"},"required":true,"description":"UUID del operativo de recuperación a consultar","name":"id","in":"path"}]
PATCH security: [{"BearerAuth":[]}]
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

**Respuesta HTTP/JSON real obtenida (`25/11/2026`):**
```http
HTTP/1.1 200 OK
content-type: application/json

{"message":"Planificación del operativo de recuperación actualizada exitosamente.","data":{"id":"74100000-0000-4000-8000-000000000001","codigo":"REC-2026-7401","nombre":"Entrega de techumbres y habitabilidad Niebla Alto","descripcion":"Ampliación de entrega de planchas de zinc y frazadas en Niebla Alto y Sector Los Molinos.","sector":"Sector Niebla Alto","direccionTexto":"Calle Miramar #450, Niebla","prioridad":"ALTA","contactoNombre":"Mariana Cárdenas","contactoTelefono":"+56987654321","latitud":-39.8682,"longitud":-73.3965,"estado":"EN_EJECUCION","familiasAfectadas":18,"delegacion":{"id":"30000000-0000-4000-8000-000000000003","codigo":"DEL_COSTA","nombre":"Delegación Municipal Costa"},"mision":{"id":"74200000-0000-4000-8000-000000000001","codigo":"MIS-2026-7401","titulo":"Entrega de techumbres y habitabilidad Niebla Alto","estado":"EN_CURSO","tipoMision":"RECUPERACION"},"patrulla":{"id":"74500000-0000-4000-8000-000000000001","nombre":"Patrulla Verificadora Costa H74","estado":"EN_RECUPERACION"},"recursos":[{"recursoId":"74000000-0000-4000-8000-000000000001","nombre":"Planchas de Zinc Acanaladas 3.66m (H74)","cantidadAsignada":90},{"recursoId":"74000000-0000-4000-8000-000000000003","nombre":"Frazadas Térmicas Polar (H74)","cantidadAsignada":15}],"creadoPorId":"00000000-0000-4000-8000-000000000003","fechaEstimadaFin":"2026-11-30T18:00:00.000Z","actualizadoPorId":"00000000-0000-4000-8000-000000000003","creadoEn":"2026-11-25T23:43:14.784Z","actualizadoEn":"2026-11-26T02:47:00.456Z"}}
```

**Verificación de detalle posterior (`GET /api/eventos-atp/recuperacion/{id}`):**
```bash
curl -s -X GET "http://localhost:3001/api/eventos-atp/recuperacion/74100000-0000-4000-8000-000000000001" \
  -H "Authorization: Bearer $ENC_TOKEN"
```
```json
{"message":"Detalle de operativo de recuperación obtenido exitosamente.","data":{"id":"74100000-0000-4000-8000-000000000001","codigo":"REC-2026-7401","nombre":"Entrega de techumbres y habitabilidad Niebla Alto","descripcion":"Ampliación de entrega de planchas de zinc y frazadas en Niebla Alto y Sector Los Molinos.","estado":"EN_EJECUCION","cantidadInsumosAsignados":105,"totalTiposInsumos":2,"fechaEstimadaFin":"2026-11-30T18:00:00.000Z","actualizadoPorId":"00000000-0000-4000-8000-000000000003","actualizadoEn":"2026-11-26T02:47:00.456Z"}}
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
# C.2 Perfil Supervisor Estratégico sin permiso recuperacion:crear ni recuperacion:editar
curl -i -s -X PATCH "http://localhost:3001/api/eventos-atp/recuperacion/74100000-0000-4000-8000-000000000001" \
  -H "Content-Type: application/json" -H "Authorization: Bearer $SUP_TOKEN" \
  -d '{"descripcion":"Test sin permiso"}'
```
```http
HTTP/1.1 403 Forbidden
{"message":"Acceso denegado. Se requiere permiso 'recuperacion:crear', 'recuperacion:editar' o rol Encargado."}
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
# D.3 Error de campo anidado en arreglo de recursos (verificado con erroresFilasRecursos)
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
| **CA-1:** En el detalle del operativo de recuperación, el sistema debe proveer la acción 'Editar Planificación'. | `CP-H74-WEB-01`, `CP-H74-WEB-04`, `BUG-H74-WEB-05` | **APROBADO** | `OperativoRecuperacionDrawer.tsx` provee el botón `"Editar Planificación"` y `OperativosRecuperacionTabla.tsx` incorpora el botón directo `<Button variant="teal">` con ícono `<Pencil />` y `<Chip>` estandarizados sin estilos inline, documentado con capturas reales en `docs/manuals/H74-editar-operativo-recuperacion.md`. |
| **CA-2:** El formulario modal debe permitir modificar: descripción de tareas, fecha estimada de término y reasignación de insumos/recursos. | `CP-H74-WEB-05`, `CP-H74-WEB-11`, `BUG-H74-WEB-01`, `BUG-H74-WEB-03`, `BUG-H74-WEB-04` | **APROBADO** | Resueltos los defectos `01`, `03` y `04`: el formulario conserva borradores ante actualización externa (`avisoActualizacionRemota`), maneja opción vacía en `patrulla: null`, valida cantidades enteras sin forzar `0`, restringe activos individuales, filtra no disponibles y mapea `recursos.0.cantidad` por fila. |
| **CA-3:** No se debe permitir editar un operativo que se encuentre en estado `COMPLETADA` o `CANCELADA`. | `CP-H74-WEB-02`, `CP-H74-WEB-03`, `CP-H74-WEB-08`, `CP-H74-WEB-12`, `BUG-H74-WEB-03` | **APROBADO** | Bloqueo verificado en Drawer, botón/pre-chequeo de Tabla, estado `esEstadoCerrado` dentro de `ModalEditarOperativoRecuperacion` (incluyendo transición externa o respuesta `409 ESTADO_BLOQUEADO`) y backend (`409 Conflict`). |
| **CA-4:** Cada edición debe registrar auditoría (`actualizado_en = CURRENT_TIMESTAMP`, `actualizado_por_id`). | `CP-H74-WEB-07`, `CP-H74-WEB-11`, `BUG-H74-WEB-02`, `BUG-H74-WEB-05` | **APROBADO** | El backend persiste `actualizado_en` y `actualizado_por_id` desde el Bearer JWT; `editarOperativoRecuperacion` (`recuperacionService.ts:716-731`) removió `x-user-id` alineado al OpenAPI `0.12.0` regenerado, y `OperativoRecuperacionDrawer.tsx:298-309` despliega ambos campos propagando `activeUserId`. |
| **CA-5:** El endpoint `PATCH /api/eventos-atp/recuperacion/{id}` debe requerir permiso `recuperacion:crear` o rol Encargado. | `CP-H74-WEB-04`, `CP-H74-WEB-09`, `CP-H74-WEB-13`, `BUG-H74-WEB-02` | **APROBADO** | `sgrai-api` valida `['recuperacion:crear', 'recuperacion:editar']` o rol autorizado (`401` sin JWT Bearer y `403` ante Supervisor), y `usePuedeEditarRecuperacion` aplica política *Fail-Closed* sobre `AuthContext` y `SimulatedSessionContext`. |
