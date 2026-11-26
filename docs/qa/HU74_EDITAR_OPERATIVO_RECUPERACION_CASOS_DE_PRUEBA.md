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
>  
> **Fecha de Auditoría Inicial QA:** `24/11/2026 15:27`  
> **Fecha de Re-Test QA (Ciclo 2):** `25/11/2026 23:47`  
> **Estado de Certificación QA:** **RECHAZADO EN RE-TEST — CHANGES REQUESTED (4 DEFECTOS CORREGIDOS, 1 DEFECTO MEDIO PARCIALMENTE ABIERTO: `BUG-H74-WEB-05`)**

---

## 1. Resumen Ejecutivo de Auditoría Técnica y Ciclo de Re-Test

Se ejecutó el ciclo formal de **Re-Test (Ciclo 2 — `25/11/2026 23:47`)** sobre la rama `feature/H74-editar-operativo-recuperacion` de `sgrai-web`, contrastando las correcciones integradas en `fix(recuperacion): sincronizar develop y resolver BUG-H74-WEB-01 a 05` y `refactor(recuperacion): usar componente Chip estandar en tabla de operativos` frente a la punta vigente de `origin/develop` y al contrato vivo de `sgrai-api` (`0.12.0`).

Los resultados confirman la subsanación completa de **`BUG-H74-WEB-01` (Crítico)**, **`BUG-H74-WEB-02` (Alto)**, **`BUG-H74-WEB-03` (Alto)** y **`BUG-H74-WEB-04` (Medio)**, así como la resolución parcial de `BUG-H74-WEB-05` (sincronización limpia con `origin/develop`, restauración de `next/font/local`, migración a `<Button variant="teal">` y `<Chip>`, y ampliación de pruebas Vitest). Sin embargo, permanecen **2 brechas técnicas bloqueantes dentro de `BUG-H74-WEB-05`** que impiden aprobar el Pull Request hasta su cierre:

1. **Desfase contractual real frente a `openapi.json` (`0.12.0`) por edición manual de `src/types/api-generated.d.ts`:** La rama conserva definiciones manuales con `header?: { authorization?: string; "x-user-id"?: string }` en `/api/eventos-atp/recuperacion/{id}` y rutas heredadas de HU-73/HU-32. Al regenerar el archivo real mediante `npx openapi-typescript http://localhost:3001/openapi.json`, la compilación estática de `sgrai-web` falla con **15 errores TypeScript en `src/services/recuperacionService.ts`** (`TS2322` en la línea `675` de `editarOperativoRecuperacion` por enviar `header: { 'x-user-id': userId }` cuando el contrato real declara `header?: never` con `security: [{ BearerAuth: [] }]`, además de 14 errores en `listarOperativosRecuperacion`, `listarEventosRecuperacion` y `obtenerEventoRecuperacion`).
2. **Manual `docs/manuals/H74-editar-operativo-recuperacion.md` sin capturas reales:** Aunque el manual incorporó el flujo de edición desde la tabla, `docs/manuals/assets/H74-editar-operativo-recuperacion/` contiene únicamente `.gitkeep` (0 archivos `.png`) y la línea `31` mantiene pendiente la entrega de evidencias visuales (`GEMINI.md` §7).

| Métrica | Auditoría Inicial (`24/11/2026 15:27`) | Re-Test Ciclo 2 (`25/11/2026 23:47`) | Observaciones Técnicas |
|---|---|:---:|---|
| **Total de Casos Evaluados en Matriz** | **20** | **20** | 5 Defectos históricos (`BUG-H74-WEB-01` a `05`) + 15 Casos Funcionales, Contractuales y Técnicos |
| **Casos Aprobados / Corregidos** | **15** (`75.0%`) | **19** (`95.0%`) | `4` Defectos cerrados (`CORREGIDO`: `01`, `02`, `03`, `04`) + `15` Casos funcionales/API aprobados |
| **Defectos Abiertos (`ABIERTO`)** | **5** (`1C, 2A, 2M`) | **1** (`0C, 0A, 1M`) | Persiste `BUG-H74-WEB-05` (desfase OpenAPI real en `recuperacionService.ts` / `api-generated.d.ts` y falta de capturas PNG en manual H74) |
| **Casos Bloqueados (`BLOQUEADO`)** | **0** | **0** | Entornos Vitest, compilación Webpack y `sgrai-api` en vivo operativos |
| **Análisis Estático (`npm run lint`)** | **0 errores** | **0 errores** | Incluye regla `no-restricted-imports` bloqueando `next/font/google` en `eslint.config.mjs` |
| **Chequeo de Tipos Estáticos (`npx tsc --noEmit`)** | **0 errores** | **0 / 15 errores*** | `0` errores con `api-generated.d.ts` actual; **`15` errores reales** (`TS2322`/`TS2339`/`TS2352`/`TS2551`/`TS7006`) en `recuperacionService.ts` al validar contra `openapi.json` en vivo |
| **Empaquetado Productivo (`npm run build`)** | **47 rutas (`Exit 0`)** | **49 rutas (`Exit 0`)** | `next build --webpack` compila en `7.5s` (`9.6s` TS, `49/49` páginas estáticas) con `next/font/local` |
| **Suites Recuperación / HU-74 (Vitest)** | `4` files / `27` tests | **6 files / 61 tests** | `ModalEditarOperativoRecuperacion` (`9`), `OperativosRecuperacionView` (`5`), `usePuedeEditarRecuperacion` (`5`), `useRecuperacionSocket` (`9`), `recuperacionService` (`24`), `DetalleEventoRecuperacionClient` (`9`); más `KanbanViewSwitcher` (`4/4`) |
| **Suite Global del Proyecto (Vitest)** | `130` files / `878` tests | **141 files / 1028 tests** | `100%` pasando en `43.28s` sin regresiones globales |
| **Integración con `origin/develop` (`git merge-tree`)** | `6` conflictos | **0 conflictos** | Árbol limpio tras sincronización con `develop`; fuentes `Noto Sans` auto-alojadas y módulos HU-32/37/61/69 preservados |
| **Pruebas HTTP/cURL en Vivo (`sgrai-api:3001`)** | Verificadas | **Verificadas (`25/11/2026`)** | `200`, `400`, `401`, `403`, `404` y `409` ejecutados en vivo sobre `PATCH /api/eventos-atp/recuperacion/{id}` |

---

## 2. Registro Técnico de Defectos y Verificación en Re-Test

| ID Defecto | Título y Descripción Técnica del Defecto | Severidad | Archivo(s) Afectado(s) | Fecha Hallazgo | Estado | Fecha Re-Test | Solución / Commit | Dictamen Re-Test |
|---|---|:---:|---|:---:|:---:|:---:|---|---|
| `BUG-H74-WEB-01` | **Sobrescritura destructiva del formulario ante re-renders o WebSocket y peticiones `GET` redundantes en cascada:** `OperativosRecuperacionView.tsx` pasaba `onCerrar` inline; `OperativoRecuperacionDrawer.tsx` dependía de `onCerrar` y `toast` en el efecto de carga; y `ModalEditarOperativoRecuperacion.tsx` dependía del objeto completo `operativo` reinicializando los inputs en edición. | Crítica | `src/components/mando/recuperacion/OperativosRecuperacionView.tsx`, `src/components/mando/recuperacion/OperativoRecuperacionDrawer.tsx`, `src/components/mando/recuperacion/ModalEditarOperativoRecuperacion.tsx` | 24/11/2026 15:21 | **`CORREGIDO`** | 25/11/2026 23:47 | `fix(recuperacion): sincronizar develop y resolver BUG-H74-WEB-01 a 05` | **Verificado:** `handleCerrarDrawer` estabilizado con `useCallback` (`OperativosRecuperacionView.tsx:67-69`); `onCerrarRef`/`toastRef` y efecto `[operativoId, reloadNonce]` en Drawer (`63-77, 127`); `estabaAbiertoRef` + `snapshotInicialRef` en Modal (`92-155`) conservando cambios ante actualización externa (`avisoActualizacionRemota`). Test `BUG-H74-WEB-01` aprobado (`397ms`). *Nota secundaria:* el cierre del Drawer alterna `enabled` a `false` en su `useRecuperacionSocket` (`130`) ejecutando `salir`/`leave` sobre el socket singleton compartido (`BUG-H73-WEB-05`). |
| `BUG-H74-WEB-02` | **Política RBAC *Fail-Open* en `usePuedeEditarRecuperacion` y suplantación de identidad `x-user-id` con `DEFAULT_ENCARGADO_ID` (CA-4 / CA-5):** `usePuedeEditarRecuperacion` retornaba `true` sin `SimulatedSessionContext` ni consultaba `AuthContext`, las vistas omitían `userId` al modal y el Drawer no mostraba `actualizadoEn` / `actualizadoPorId`. | Alta | `src/hooks/usePuedeEditarRecuperacion.ts`, `src/hooks/__tests__/usePuedeEditarRecuperacion.test.ts`, `src/components/mando/recuperacion/OperativoRecuperacionDrawer.tsx`, `src/components/mando/recuperacion/OperativosRecuperacionView.tsx` | 24/11/2026 15:21 | **`CORREGIDO`** | 25/11/2026 23:47 | `fix(recuperacion): sincronizar develop y resolver BUG-H74-WEB-01 a 05` | **Verificado:** `usePuedeEditarRecuperacion.ts:10-32` evalúa `AuthContext` (`cargando -> false`, `tienePermiso('recuperacion:editar') \|\| rolCodigo === 'ADMIN'`) y `SimulatedSessionContext`, retornando `false` por defecto (*Fail-Closed*, `5/5` tests pass). `activeUserId` se propaga al modal en Vista (`57-59, 221`) y Drawer (`51-53, 428`), y el Drawer despliega `actualizadoEn` y `actualizadoPorId` (`298-309`). |
| `BUG-H74-WEB-03` | **Desincronización en `<Select>` con `patrulla` nula, ausencia de bloqueo reactivo ante `COMPLETADA`/`CANCELADA` o `409 ESTADO_BLOQUEADO` y estado residual en Drawer (CA-2 / CA-3):** Faltaba opción vacía `""` en patrullas, el modal mantenía habilitados controles ante estados cerrados/`409`, `handleAbrirEdicionDirecta` no validaba estado tras fetch y `modalEditarAbierto` persistía ante cierre por `404`. | Alta | `src/components/mando/recuperacion/ModalEditarOperativoRecuperacion.tsx`, `src/components/mando/recuperacion/OperativoRecuperacionDrawer.tsx`, `src/components/mando/recuperacion/OperativosRecuperacionView.tsx` | 24/11/2026 15:22 | **`CORREGIDO`** | 25/11/2026 23:47 | `fix(recuperacion): sincronizar develop y resolver BUG-H74-WEB-01 a 05` | **Verificado:** `opcionesPatrulla` antepone `{ value: '', label: 'Seleccione una patrulla...' }` cuando `!operativo.patrulla \|\| patrullaId === ''` (`229-231`); `esEstadoCerrado` deshabilita inputs/selects/botones y muestra aviso en `COMPLETADA`/`CANCELADA` o `409 ESTADO_BLOQUEADO` (`95-98, 431-433, 505-509`); `handleAbrirEdicionDirecta` bloquea operativos cerrados post-fetch (`77-83`); Drawer resetea `modalEditarAbierto` en cierre/`operativoId`/`404` (`75, 90, 110`). Test `BUG-H74-WEB-03` aprobado (`256ms`). |
| `BUG-H74-WEB-04` | **Defectos en validación/edición de insumos, omisión de errores `400` anidados (`recursos.0.cantidad`) y *race condition* en tabla:** El input numérico forzaba `0` y truncaba decimales; `recursos.0.cantidad` quedaba oculto; inventario no filtraba no disponibles ni restringía `esIndividual`; y clics rápidos competían en `handleAbrirEdicionDirecta`. | Media | `src/components/mando/recuperacion/ModalEditarOperativoRecuperacion.tsx`, `src/components/mando/recuperacion/OperativosRecuperacionView.tsx`, `src/components/mando/recuperacion/OperativosRecuperacionTabla.tsx` | 24/11/2026 15:26 | **`CORREGIDO`** | 25/11/2026 23:47 | `fix(recuperacion): sincronizar develop y resolver BUG-H74-WEB-01 a 05` | **Verificado:** Cantidades almacenadas como `string` y validadas con `/^\d+$/` y `Number.isSafeInteger >= 1` (`355-364`); `erroresFilasRecursos` mapea `/^recursos\.(\d+)\./` bajo cada fila (`438-446, 626-630`); `opcionesRecursos` excluye `NO_DISPONIBLE`/`EN_MANTENCION` y fija `esIndividual` en `'1'` (`239-251, 289-294, 365-369`); `edicionRequestSeqRef` (`65, 72-96`) y `disabled={Boolean(cargandoEdicionId)}` evitan condiciones de carrera. Test `BUG-H74-WEB-04` aprobado (`322ms`). |
| `BUG-H74-WEB-05` | **Desfase contractual OpenAPI en `api-generated.d.ts` / `recuperacionService.ts` y ausencia de capturas reales en manual H74 (subsanados botón `<Button variant="teal">`, `<Chip>`, sync con `develop` y pruebas Vitest):** *(1)* `src/types/api-generated.d.ts` conserva edición manual con `header?: { authorization?: string; "x-user-id"?: string }` (y tipos previos en `/api/eventos-atp/recuperacion`), mientras `openapi.json` en vivo (`0.12.0`) declara `header?: never` con `BearerAuth`; regenerar tipos con `npx openapi-typescript` falla `tsc` con `15` errores en `recuperacionService.ts` (incluyendo `TS2322` en línea `675` por enviar `header: { 'x-user-id': userId }`). *(2)* `docs/manuals/assets/H74-editar-operativo-recuperacion/` contiene solo `.gitkeep` (sin PNGs) y `H74-editar-operativo-recuperacion.md:31` mantiene nota pendiente. | Media | `src/types/api-generated.d.ts`, `src/services/recuperacionService.ts`, `docs/manuals/H74-editar-operativo-recuperacion.md`, `docs/manuals/assets/H74-editar-operativo-recuperacion/.gitkeep` | 24/11/2026 15:24 | **`ABIERTO`** | (Pendiente) | Pendiente (Rechazado en Code Review) | **Parcialmente resuelto (`3/5` puntos subsanados, `2/5` pendientes):** Resueltos `<Button variant="teal">` + `<Chip>`, fusión limpia con `develop` (`0` conflictos, `next/font/local`, regla ESLint), y suites Vitest (`usePuedeEditarRecuperacion`, tabla y `fechaEstimadaFin`). Permanece **ABIERTO** por editar `api-generated.d.ts` a mano enviando `x-user-id` incompatible (`TS2322` al regenerar con `openapi-typescript`) y faltar capturas `.png` en `docs/manuals/assets/H74-editar-operativo-recuperacion/`. |

---

## 3. Matriz Consolidada de Casos de Prueba (13 Columnas)

| ID Caso | Título del Caso de Prueba | Tipo de Prueba | Nivel | Prioridad | Precondición | Datos de Prueba (Payload / Headers / Query) | Resultado Esperado | Resultado Obtenido | Estado | Fecha / Hora Ejecución | Fecha / Hora Re-Test | Solución / Commit |
|---|---|---|---|---|---|---|---|---|:---:|:---:|:---:|---|
| `BUG-H74-WEB-01` | Preservación de datos editados en modal ante eventos WebSocket `recuperacion:actualizada` y estabilidad de `useEffect` en Drawer | Concurrencia / Reactividad | Integración UI | Crítica | `ModalEditarOperativoRecuperacion` abierto con cambios sin guardar en descripción o recursos | Prop `onCerrar` con `useCallback`, `onCerrarRef`/`toastRef` en Drawer y `estabaAbiertoRef`/`snapshotInicialRef` en Modal ante nuevo `actualizadoEn` | El Drawer solo consulta `GET` al cambiar `operativoId` o `reloadNonce`, y el modal conserva intactos los datos no guardados emitiendo aviso de actualización externa | Re-Test exitoso: cambios del formulario conservados (`397ms`), banner `"Este operativo recibió una actualización externa..."` desplegado y efectos estabilizados | **CORREGIDO** | 24/11/2026 15:21 | 25/11/2026 23:47 | fix(recuperacion): sincronizar develop y resolver BUG-H74-WEB-01 a 05 |
| `BUG-H74-WEB-02` | Control RBAC *Fail-Closed* en `usePuedeEditarRecuperacion`, propagación del `userId` autenticado y auditoría visible en Drawer | Seguridad / RBAC / Auditoría | Hook / UI / DAL | Alta | Hook evaluado sin providers, durante carga de `AuthContext`, o usuario autenticado en Vista/Drawer | `AuthContext = null` y `SimulatedSessionContext = null`; `{ cargando: true }`; `AuthContext` sin `recuperacion:editar`; usuario autenticado en Drawer | `usePuedeEditarRecuperacion` retorna `false` (*Fail-Closed*), lee `AuthContext`/`SimulatedSessionContext`, propaga `activeUserId` al modal y Drawer exhibe `actualizadoEn`/`actualizadoPorId` | Re-Test exitoso: `usePuedeEditarRecuperacion.test.ts` (`5/5` pass), propagación de `activeUserId` en Vista/Drawer y campos de auditoría visibles en Drawer | **CORREGIDO** | 24/11/2026 15:21 | 25/11/2026 23:47 | fix(recuperacion): sincronizar develop y resolver BUG-H74-WEB-01 a 05 |
| `BUG-H74-WEB-03` | Selección de patrulla cuando `operativo.patrulla` es `null`, bloqueo reactivo ante estado cerrado y limpieza de `modalEditarAbierto` en Drawer | Funcional / Borde / Estado | UI / Modal y Drawer | Alta | Operativo con `patrulla: null`, estado `COMPLETADA`/`CANCELADA`, conflicto `409 ESTADO_BLOQUEADO` o cierre por `404` | `{ ...base, patrulla: null, estado: 'COMPLETADA' }` en Modal; `409 ESTADO_BLOQUEADO`; `handleAbrirEdicionDirecta` y `404` en Drawer | `<Select>` incluye opción vacía `""`, inputs/selects/submit se bloquean ante estado cerrado o `409`, edición directa valida post-fetch y Drawer resetea `modalEditarAbierto` | Re-Test exitoso: opción `"Seleccione una patrulla..."` renderizada, controles bloqueados (`256ms`), pre-chequeo en tabla y reseteo en cierre/`404` verificados | **CORREGIDO** | 24/11/2026 15:22 | 25/11/2026 23:47 | fix(recuperacion): sincronizar develop y resolver BUG-H74-WEB-01 a 05 |
| `BUG-H74-WEB-04` | Edición fluida de cantidades, despliegue de errores `400` anidados (`recursos.0.cantidad`), filtro de inventario/activos individuales y *race condition* en tabla | Validación / Usabilidad / Concurrencia | UI / Modal y Tabla | Media | Modal editando cantidades/recursos, respuesta `400` en `recursos.0.cantidad`, activos individuales/no disponibles o clics rápidos en tabla | Cantidad vacía `""` / decimal, error `{ campo: "recursos.0.cantidad" }`, `esIndividual: true`, `NO_DISPONIBLE`, `edicionRequestSeqRef` | Edición natural validando `/^\d+$/`, error mapeado bajo fila `0`, bloqueo de no disponibles y `esIndividual` en `'1'`, y control de concurrencia en tabla | Re-Test exitoso: fecha inválida + mapeo de error `recursos.0.cantidad` verificado (`322ms`), filtro y bloqueo `esIndividual` operativos y `edicionRequestSeqRef` aplicado en tabla | **CORREGIDO** | 24/11/2026 15:26 | 25/11/2026 23:47 | fix(recuperacion): sincronizar develop y resolver BUG-H74-WEB-01 a 05 |
| `BUG-H74-WEB-05` | Cumplimiento de `GEMINI.md` §3/§4/§7, regeneración OpenAPI real sin edición manual (`openapi-typescript`), sync `develop`, capturas de manual y cobertura Vitest | Estándar / Contrato / Docs | Código / Contrato / Docs | Media | Contraste de `src/types/api-generated.d.ts` y `recuperacionService.ts` contra `http://localhost:3001/openapi.json`, `git merge-tree` y `docs/manuals/assets/` | `npx openapi-typescript http://localhost:3001/openapi.json`, `npx tsc`, `git merge-tree origin/develop HEAD`, `H74-editar-operativo-recuperacion.md` | `<Button variant="teal">` sin inline, `0` conflictos con `develop`, `0` errores `tsc` tras regenerar `api-generated.d.ts` real, tests añadidos y capturas `.png` en manual | Parcial: `<Button variant="teal">`, `<Chip>`, `0` conflictos `develop` (`next/font/local`) y tests añadidos; **persisten 15 errores `tsc`** en `recuperacionService.ts` (incluyendo `TS2322` por `x-user-id` en línea `675`) al validar contra `openapi.json` vivo y **faltan PNGs** en manual H74 (solo `.gitkeep`) | **ABIERTO** | 24/11/2026 15:24 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| `CP-H74-WEB-01` | Visualización y habilitación del botón `"Editar Planificación"` en `OperativoRecuperacionDrawer` para operativos en curso (CA-1) | Funcional / UI | UI / Drawer | Alta | Usuario con permiso `recuperacion:editar` abre detalle de operativo en estado `EN_EJECUCION` | `mockOperativoBase` (`id: e4f8b9a1-...`, `estado: 'EN_EJECUCION'`) | El panel superior del Drawer muestra el texto `"Planificación activa editable"` y el botón `"Editar Planificación"` habilitado | Botón `"Editar Planificación"` renderizado y habilitado correctamente en el Drawer (`222ms`) | **APROBADO** | 24/11/2026 15:27 | 25/11/2026 23:47 | feat(recuperacion): edicion de operativos de recuperacion y actualizacion en tiempo real (HU-74) |
| `CP-H74-WEB-02` | Bloqueo preventivo del botón `"Editar Planificación"` en `OperativoRecuperacionDrawer` cuando el estado es `COMPLETADA` (CA-3) | Regla de Negocio | UI / Drawer | Crítica | Usuario con permiso `recuperacion:editar` abre detalle de operativo culminado | `{ ...mockOperativoBase, estado: 'COMPLETADA' }` | El botón `"Editar Planificación"` se muestra deshabilitado (`disabled`) con mensaje de edición bloqueada | Botón `"Editar Planificación"` verificado en estado `disabled` en Vitest (`35ms`) | **APROBADO** | 24/11/2026 15:27 | 25/11/2026 23:47 | feat(recuperacion): edicion de operativos de recuperacion y actualizacion en tiempo real (HU-74) |
| `CP-H74-WEB-03` | Bloqueo preventivo del botón `"Editar Planificación"` en `OperativoRecuperacionDrawer` cuando el estado es `CANCELADA` (CA-3) | Regla de Negocio | UI / Drawer | Crítica | Usuario con permiso `recuperacion:editar` abre detalle de operativo cancelado | `{ ...mockOperativoBase, estado: 'CANCELADA' }` | El botón `"Editar Planificación"` se muestra deshabilitado (`disabled`) impidiendo abrir el modal desde el Drawer | Botón `"Editar Planificación"` verificado en estado `disabled` en Vitest (`40ms`) | **APROBADO** | 24/11/2026 15:27 | 25/11/2026 23:47 | feat(recuperacion): edicion de operativos de recuperacion y actualizacion en tiempo real (HU-74) |
| `CP-H74-WEB-04` | Ocultamiento de la acción `"Editar Planificación"` cuando el usuario carece del permiso `recuperacion:editar` (CA-5) | Seguridad / RBAC | UI / Permisos | Crítica | Hook `usePuedeEditarRecuperacion` retorna `false` (ej. perfil Supervisor sin permiso de edición) | `usePuedeEditarRecuperacion.mockReturnValue(false)` sobre `OperativoRecuperacionDrawer` | La barra de acción y el botón `"Editar Planificación"` no se renderizan en el DOM | Control ausente en el DOM verificando restricción RBAC en Vitest (`25ms`) | **APROBADO** | 24/11/2026 15:27 | 25/11/2026 23:47 | feat(recuperacion): edicion de operativos de recuperacion y actualizacion en tiempo real (HU-74) |
| `CP-H74-WEB-05` | Precarga de planificación actual y envío de `PATCH` parcial solo con descripción y `patrullaId` modificados (CA-2) | Funcional / Formulario | UI / Modal | Crítica | `ModalEditarOperativoRecuperacion` abierto con `mockOperativoBase`; catálogos de recursos y patrullas disponibles cargados | Modificar `descripcion` a `"Ampliación de entrega en Collico Alto"` y `patrullaId` a `50000000-...-0002` sin alterar recursos | Precarga descripción inicial, omite `recursos` al no variar, invoca `editarOperativoRecuperacion`, ejecuta `onSuccess` y cierra el modal | Payload enviado únicamente con `{ descripcion, patrullaId }`, callbacks ejecutados (`112ms`) | **APROBADO** | 24/11/2026 15:27 | 25/11/2026 23:47 | feat(recuperacion): edicion de operativos de recuperacion y actualizacion en tiempo real (HU-74) |
| `CP-H74-WEB-06` | Retención del modal abierto con alerta de error cuando la API responde `409 Conflict` | Manejo de Errores / UX | UI / Modal | Alta | `editarOperativoRecuperacion` rechaza con `RecuperacionServiceError` (`statusCode: 409`) | Cantidad modificada a `500`; error `"Stock insuficiente en bodega para Kit Techumbre."` | El modal permanece abierto conservando los datos del formulario, muestra `InlineNotice` de error y no ejecuta `onClose` | Banner de error desplegado y `onClose` no invocado (`69ms`) | **APROBADO** | 24/11/2026 15:27 | 25/11/2026 23:47 | feat(recuperacion): edicion de operativos de recuperacion y actualizacion en tiempo real (HU-74) |
| `CP-H74-WEB-07` | Respuesta exitosa `200 OK` en capa de servicio `editarOperativoRecuperacion` (`PATCH /api/eventos-atp/recuperacion/{id}`) | Pruebas Unitarias / DAL | Service / API | Crítica | Suite `recuperacionService.test.ts` ejecutando `editarOperativoRecuperacion` con mock de `apiClient.PATCH` | `id: e4f8b9a1-...`, body `{ descripcion: "Nueva descripción operativa", patrullaId: "p2" }` | Envía petición `PATCH` al endpoint tipado y retorna objeto actualizado con `actualizadoEn` y `actualizadoPorId` | `24/24` pruebas del servicio aprobadas verificando retorno `200 OK` (`1ms`) | **APROBADO** | 24/11/2026 15:27 | 25/11/2026 23:47 | feat(recuperacion): edicion de operativos de recuperacion y actualizacion en tiempo real (HU-74) |
| `CP-H74-WEB-08` | Clasificación de conflictos `409` en `ESTADO_BLOQUEADO` (`COMPLETADA`/`CANCELADA`) y `STOCK_INSUFICIENTE` en DAL | Pruebas Unitarias / Negocio | Service / DAL | Crítica | Respuesta HTTP `409` simulada desde `apiClient.PATCH` en `recuperacionService.test.ts` | Mensajes `"No se puede editar un operativo en estado COMPLETADA."` y `"Stock insuficiente en bodega..."` | `RecuperacionServiceError` clasifica `tipoConflicto` como `'ESTADO_BLOQUEADO'` o `'STOCK_INSUFICIENTE'` respectivamente | Clasificación verificada en ambos escenarios en Vitest (`0ms` y `0ms`) | **APROBADO** | 24/11/2026 15:27 | 25/11/2026 23:47 | feat(recuperacion): edicion de operativos de recuperacion y actualizacion en tiempo real (HU-74) |
| `CP-H74-WEB-09` | Propagación de error `403 Forbidden` en `editarOperativoRecuperacion` cuando falta permiso `recuperacion:editar` | Seguridad / DAL | Service / DAL | Alta | Respuesta HTTP `403` simulada desde `apiClient.PATCH` | `{ message: 'Forbidden' }` con status `403` | Lanza `RecuperacionServiceError` con `statusCode: 403` mencionando permiso `recuperacion:editar` | Excepción validada con `statusCode: 403` y mensaje institucional (`0ms`) | **APROBADO** | 24/11/2026 15:27 | 25/11/2026 23:47 | feat(recuperacion): edicion de operativos de recuperacion y actualizacion en tiempo real (HU-74) |
| `CP-H74-WEB-10` | Suscripción en tiempo real a `recuperacion:actualizada` y limpieza de listeners en `useRecuperacionSocket` | Tiempo Real / WebSocket | Hook / Socket.io | Alta | Hook `useRecuperacionSocket` montado con callback `onRecuperacionActualizada` | Emisión de evento `'recuperacion:actualizada'` con objeto `REC-2026-0001` | Invoca `onRecuperacionActualizada`, actualiza `ultimoEvento` y ejecuta `socket.off` al desmontar | Evento procesado y limpieza verificada en Vitest (`9/9` tests pass, `3ms` y `2ms`) | **APROBADO** | 24/11/2026 15:27 | 25/11/2026 23:47 | fix(recuperacion): sincronizar develop y resolver BUG-H74-WEB-01 a 05 |
| `CP-H74-WEB-11` | Prueba en vivo HTTP `GET` y `PATCH /api/eventos-atp/recuperacion/{id}` (`200 OK`) con auditoría y stock diferencial (CA-2 / CA-4) | Integración API / cURL | Backend / DB | Crítica | `sgrai-api` corriendo en `localhost:3001` con fixture H74 sembrado y token JWT de `encargado@valdivia.cl` | `PATCH .../74100000-...-0001` con `descripcion`, `fechaEstimadaFin: "2026-11-30T18:00:00.000Z"` y `recursos` (`90` y `15`) | API retorna `200 OK` actualizando `descripcion`, `fechaEstimadaFin`, `recursos`, `actualizadoPorId` y `actualizadoEn` | `200 OK` verificado en Re-Test; `GET` posterior confirma `cantidadInsumosAsignados: 105` y `actualizadoPorId: ...0003` | **APROBADO** | 24/11/2026 15:26 | 25/11/2026 23:47 | feat(recuperacion): edicion de operativos de recuperacion y actualizacion en tiempo real (HU-74) |
| `CP-H74-WEB-12` | Prueba en vivo HTTP `409 Conflict` en estados `COMPLETADA`/`CANCELADA`, stock insuficiente y patrulla ocupada (CA-3) | Integración API / cURL | Backend / Negocio | Crítica | `sgrai-api` activo con registros `REC-2026-7403` (`COMPLETADA`), `REC-2026-7404` (`CANCELADA`) y patrulla `EN_VERIFICACION` | `PATCH` sobre `...7403`, `...7404`, `cantidad: 99999` y `patrullaId: f1000000-...-0001` | API rechaza todos los casos con `409 Conflict` y mensajes descriptivos del estado o disponibilidad | `409 Conflict` verificado en Re-Test para los 4 escenarios sin alterar datos en BD | **APROBADO** | 24/11/2026 15:26 | 25/11/2026 23:47 | feat(recuperacion): edicion de operativos de recuperacion y actualizacion en tiempo real (HU-74) |
| `CP-H74-WEB-13` | Prueba en vivo HTTP `401 Unauthorized` (sin JWT Bearer) y `403 Forbidden` (Supervisor sin permiso de creación/edición) (CA-5) | Seguridad RBAC / cURL | Backend / Auth | Crítica | Token JWT de `supervisor@valdivia.cl` y petición sin token con cabecera `x-user-id` | `PATCH .../74100000-...-0001` sin `Authorization` o con `Authorization: Bearer <SUP_TOKEN>` | API responde `401` exigiendo `Authorization: Bearer` y `403` exigiendo `recuperacion:crear`/`recuperacion:editar`/Encargado | `401 Unauthorized` y `403 Forbidden` (`"Acceso denegado. Se requiere permiso 'recuperacion:crear', 'recuperacion:editar' o rol Encargado."`) verificados | **APROBADO** | 24/11/2026 15:26 | 25/11/2026 23:47 | feat(recuperacion): edicion de operativos de recuperacion y actualizacion en tiempo real (HU-74) |
| `CP-H74-WEB-14` | Prueba en vivo HTTP `400 Bad Request` (body vacío, fecha anterior, `cantidad: 0`) y `404 Not Found` (UUID inexistente) | Validación / Contrato | Backend / cURL | Alta | `sgrai-api` activo con token JWT de Encargado | `PATCH` con `{}`, `fechaEstimadaFin: "2025-01-01T00:00:00.000Z"`, `cantidad: 0` y UUID `00000000-...-999999999999` | API responde `400 Bad Request` con detalle de validación y `404 Not Found` para identificador inexistente | `400` (`errors` por campo y mensaje temporal) y `404` verificados en vivo en Re-Test | **APROBADO** | 24/11/2026 15:26 | 25/11/2026 23:47 | feat(recuperacion): edicion de operativos de recuperacion y actualizacion en tiempo real (HU-74) |
| `CP-H74-WEB-15` | Análisis estático (`npm run lint`), tipos TypeScript (`npx tsc --noEmit`), regresión global (`npm test`) y compilación (`npm run build`) | Calidad / Build / CI | Proyecto Completo | Alta | Rama `feature/H74-editar-operativo-recuperacion` sincronizada con `origin/develop` | `npm run lint`, `npx tsc --noEmit`, `npm test`, `npm run build` | Código de salida `0` en los cuatro pipelines sin errores de compilación ni regresiones | `lint` (`0` errores), `tsc --noEmit` (`0` errores locales), `npm test` (`141` archivos / `1028` tests pass) y `next build --webpack` (`49` rutas, `Exit 0`) | **APROBADO** | 24/11/2026 15:24 | 25/11/2026 23:47 | fix(recuperacion): sincronizar develop y resolver BUG-H74-WEB-01 a 05 |

---

## 4. Bloque TSV para Google Sheets

```tsv
ID Caso	Título del Caso de Prueba	Tipo de Prueba	Nivel	Prioridad	Precondición	Datos de Prueba (Payload / Headers / Query)	Resultado Esperado	Resultado Obtenido	Estado	Fecha / Hora Ejecución	Fecha / Hora Re-Test	Solución / Commit
BUG-H74-WEB-01	Preservación de datos editados en modal ante eventos WebSocket recuperacion:actualizada y estabilidad de useEffect en Drawer	Concurrencia / Reactividad	Integración UI	Crítica	ModalEditarOperativoRecuperacion abierto con cambios sin guardar en descripción o recursos	Prop onCerrar con useCallback, onCerrarRef/toastRef en Drawer y estabaAbiertoRef/snapshotInicialRef en Modal ante nuevo actualizadoEn	El Drawer solo consulta GET al cambiar operativoId o reloadNonce, y el modal conserva intactos los datos no guardados emitiendo aviso de actualización externa	Re-Test exitoso: cambios del formulario conservados (397ms), banner "Este operativo recibió una actualización externa..." desplegado y efectos estabilizados	CORREGIDO	24/11/2026 15:21	25/11/2026 23:47	fix(recuperacion): sincronizar develop y resolver BUG-H74-WEB-01 a 05
BUG-H74-WEB-02	Control RBAC Fail-Closed en usePuedeEditarRecuperacion, propagación del userId autenticado y auditoría visible en Drawer	Seguridad / RBAC / Auditoría	Hook / UI / DAL	Alta	Hook evaluado sin providers, durante carga de AuthContext, o usuario autenticado en Vista/Drawer	AuthContext = null y SimulatedSessionContext = null; { cargando: true }; AuthContext sin recuperacion:editar; usuario autenticado en Drawer	usePuedeEditarRecuperacion retorna false (Fail-Closed), lee AuthContext/SimulatedSessionContext, propaga activeUserId al modal y Drawer exhibe actualizadoEn/actualizadoPorId	Re-Test exitoso: usePuedeEditarRecuperacion.test.ts (5/5 pass), propagación de activeUserId en Vista/Drawer y campos de auditoría visibles en Drawer	CORREGIDO	24/11/2026 15:21	25/11/2026 23:47	fix(recuperacion): sincronizar develop y resolver BUG-H74-WEB-01 a 05
BUG-H74-WEB-03	Selección de patrulla cuando operativo.patrulla es null, bloqueo reactivo ante estado cerrado y limpieza de modalEditarAbierto en Drawer	Funcional / Borde / Estado	UI / Modal y Drawer	Alta	Operativo con patrulla: null, estado COMPLETADA/CANCELADA, conflicto 409 ESTADO_BLOQUEADO o cierre por 404	{ ...base, patrulla: null, estado: 'COMPLETADA' } en Modal; 409 ESTADO_BLOQUEADO; handleAbrirEdicionDirecta y 404 en Drawer	Select incluye opción vacía "", inputs/selects/submit se bloquean ante estado cerrado o 409, edición directa valida post-fetch y Drawer resetea modalEditarAbierto	Re-Test exitoso: opción "Seleccione una patrulla..." renderizada, controles bloqueados (256ms), pre-chequeo en tabla y reseteo en cierre/404 verificados	CORREGIDO	24/11/2026 15:22	25/11/2026 23:47	fix(recuperacion): sincronizar develop y resolver BUG-H74-WEB-01 a 05
BUG-H74-WEB-04	Edición fluida de cantidades, despliegue de errores 400 anidados (recursos.0.cantidad), filtro de inventario/activos individuales y race condition en tabla	Validación / Usabilidad / Concurrencia	UI / Modal y Tabla	Media	Modal editando cantidades/recursos, respuesta 400 en recursos.0.cantidad, activos individuales/no disponibles o clics rápidos en tabla	Cantidad vacía "" / decimal, error { campo: "recursos.0.cantidad" }, esIndividual: true, NO_DISPONIBLE, edicionRequestSeqRef	Edición natural validando /^\d+$/, error mapeado bajo fila 0, bloqueo de no disponibles y esIndividual en '1', y control de concurrencia en tabla	Re-Test exitoso: fecha inválida + mapeo de error recursos.0.cantidad verificado (322ms), filtro y bloqueo esIndividual operativos y edicionRequestSeqRef aplicado en tabla	CORREGIDO	24/11/2026 15:26	25/11/2026 23:47	fix(recuperacion): sincronizar develop y resolver BUG-H74-WEB-01 a 05
BUG-H74-WEB-05	Cumplimiento de GEMINI.md §3/§4/§7, regeneración OpenAPI real sin edición manual (openapi-typescript), sync develop, capturas de manual y cobertura Vitest	Estándar / Contrato / Docs	Código / Contrato / Docs	Media	Contraste de src/types/api-generated.d.ts y recuperacionService.ts contra http://localhost:3001/openapi.json, git merge-tree y docs/manuals/assets/	npx openapi-typescript http://localhost:3001/openapi.json, npx tsc, git merge-tree origin/develop HEAD, H74-editar-operativo-recuperacion.md	Button variant="teal" sin inline, 0 conflictos con develop, 0 errores tsc tras regenerar api-generated.d.ts real, tests añadidos y capturas .png en manual	Parcial: Button variant="teal", Chip, 0 conflictos develop (next/font/local) y tests añadidos; persisten 15 errores tsc en recuperacionService.ts (incluyendo TS2322 por x-user-id en línea 675) al validar contra openapi.json vivo y faltan PNGs en manual H74 (solo .gitkeep)	ABIERTO	24/11/2026 15:24	(Pendiente)	Pendiente (Rechazado en Code Review)
CP-H74-WEB-01	Visualización y habilitación del botón "Editar Planificación" en OperativoRecuperacionDrawer para operativos en curso (CA-1)	Funcional / UI	UI / Drawer	Alta	Usuario con permiso recuperacion:editar abre detalle de operativo en estado EN_EJECUCION	mockOperativoBase (id: e4f8b9a1-..., estado: 'EN_EJECUCION')	El panel superior del Drawer muestra el texto "Planificación activa editable" y el botón "Editar Planificación" habilitado	Botón "Editar Planificación" renderizado y habilitado correctamente en el Drawer (222ms)	APROBADO	24/11/2026 15:27	25/11/2026 23:47	feat(recuperacion): edicion de operativos de recuperacion y actualizacion en tiempo real (HU-74)
CP-H74-WEB-02	Bloqueo preventivo del botón "Editar Planificación" en OperativoRecuperacionDrawer cuando el estado es COMPLETADA (CA-3)	Regla de Negocio	UI / Drawer	Crítica	Usuario con permiso recuperacion:editar abre detalle de operativo culminado	{ ...mockOperativoBase, estado: 'COMPLETADA' }	El botón "Editar Planificación" se muestra deshabilitado (disabled) con mensaje de edición bloqueada	Botón "Editar Planificación" verificado en estado disabled en Vitest (35ms)	APROBADO	24/11/2026 15:27	25/11/2026 23:47	feat(recuperacion): edicion de operativos de recuperacion y actualizacion en tiempo real (HU-74)
CP-H74-WEB-03	Bloqueo preventivo del botón "Editar Planificación" en OperativoRecuperacionDrawer cuando el estado es CANCELADA (CA-3)	Regla de Negocio	UI / Drawer	Crítica	Usuario con permiso recuperacion:editar abre detalle de operativo cancelado	{ ...mockOperativoBase, estado: 'CANCELADA' }	El botón "Editar Planificación" se muestra deshabilitado (disabled) impidiendo abrir el modal desde el Drawer	Botón "Editar Planificación" verificado en estado disabled en Vitest (40ms)	APROBADO	24/11/2026 15:27	25/11/2026 23:47	feat(recuperacion): edicion de operativos de recuperacion y actualizacion en tiempo real (HU-74)
CP-H74-WEB-04	Ocultamiento de la acción "Editar Planificación" cuando el usuario carece del permiso recuperacion:editar (CA-5)	Seguridad / RBAC	UI / Permisos	Crítica	Hook usePuedeEditarRecuperacion retorna false (ej. perfil Supervisor sin permiso de edición)	usePuedeEditarRecuperacion.mockReturnValue(false) sobre OperativoRecuperacionDrawer	La barra de acción y el botón "Editar Planificación" no se renderizan en el DOM	Control ausente en el DOM verificando restricción RBAC en Vitest (25ms)	APROBADO	24/11/2026 15:27	25/11/2026 23:47	feat(recuperacion): edicion de operativos de recuperacion y actualizacion en tiempo real (HU-74)
CP-H74-WEB-05	Precarga de planificación actual y envío de PATCH parcial solo con descripción y patrullaId modificados (CA-2)	Funcional / Formulario	UI / Modal	Crítica	ModalEditarOperativoRecuperacion abierto con mockOperativoBase; catálogos de recursos y patrullas disponibles cargados	Modificar descripcion a "Ampliación de entrega en Collico Alto" y patrullaId a 50000000-...-0002 sin alterar recursos	Precarga descripción inicial, omite recursos al no variar, invoca editarOperativoRecuperacion, ejecuta onSuccess y cierra el modal	Payload enviado únicamente con { descripcion, patrullaId }, callbacks ejecutados (112ms)	APROBADO	24/11/2026 15:27	25/11/2026 23:47	feat(recuperacion): edicion de operativos de recuperacion y actualizacion en tiempo real (HU-74)
CP-H74-WEB-06	Retención del modal abierto con alerta de error cuando la API responde 409 Conflict	Manejo de Errores / UX	UI / Modal	Alta	editarOperativoRecuperacion rechaza con RecuperacionServiceError (statusCode: 409)	Cantidad modificada a 500; error "Stock insuficiente en bodega para Kit Techumbre."	El modal permanece abierto conservando los datos del formulario, muestra InlineNotice de error y no ejecuta onClose	Banner de error desplegado y onClose no invocado (69ms)	APROBADO	24/11/2026 15:27	25/11/2026 23:47	feat(recuperacion): edicion de operativos de recuperacion y actualizacion en tiempo real (HU-74)
CP-H74-WEB-07	Respuesta exitosa 200 OK en capa de servicio editarOperativoRecuperacion (PATCH /api/eventos-atp/recuperacion/{id})	Pruebas Unitarias / DAL	Service / API	Crítica	Suite recuperacionService.test.ts ejecutando editarOperativoRecuperacion con mock de apiClient.PATCH	id: e4f8b9a1-..., body { descripcion: "Nueva descripción operativa", patrullaId: "p2" }	Envía petición PATCH al endpoint tipado y retorna objeto actualizado con actualizadoEn y actualizadoPorId	24/24 pruebas del servicio aprobadas verificando retorno 200 OK (1ms)	APROBADO	24/11/2026 15:27	25/11/2026 23:47	feat(recuperacion): edicion de operativos de recuperacion y actualizacion en tiempo real (HU-74)
CP-H74-WEB-08	Clasificación de conflictos 409 en ESTADO_BLOQUEADO (COMPLETADA/CANCELADA) y STOCK_INSUFICIENTE en DAL	Pruebas Unitarias / Negocio	Service / DAL	Crítica	Respuesta HTTP 409 simulada desde apiClient.PATCH en recuperacionService.test.ts	Mensajes "No se puede editar un operativo en estado COMPLETADA." y "Stock insuficiente en bodega..."	RecuperacionServiceError clasifica tipoConflicto como 'ESTADO_BLOQUEADO' o 'STOCK_INSUFICIENTE' respectivamente	Clasificación verificada en ambos escenarios en Vitest (0ms y 0ms)	APROBADO	24/11/2026 15:27	25/11/2026 23:47	feat(recuperacion): edicion de operativos de recuperacion y actualizacion en tiempo real (HU-74)
CP-H74-WEB-09	Propagación de error 403 Forbidden en editarOperativoRecuperacion cuando falta permiso recuperacion:editar	Seguridad / DAL	Service / DAL	Alta	Respuesta HTTP 403 simulada desde apiClient.PATCH	{ message: 'Forbidden' } con status 403	Lanza RecuperacionServiceError con statusCode: 403 mencionando permiso recuperacion:editar	Excepción validada con statusCode: 403 y mensaje institucional (0ms)	APROBADO	24/11/2026 15:27	25/11/2026 23:47	feat(recuperacion): edicion de operativos de recuperacion y actualizacion en tiempo real (HU-74)
CP-H74-WEB-10	Suscripción en tiempo real a recuperacion:actualizada y limpieza de listeners en useRecuperacionSocket	Tiempo Real / WebSocket	Hook / Socket.io	Alta	Hook useRecuperacionSocket montado con callback onRecuperacionActualizada	Emisión de evento 'recuperacion:actualizada' con objeto REC-2026-0001	Invoca onRecuperacionActualizada, actualiza ultimoEvento y ejecuta socket.off al desmontar	Evento procesado y limpieza verificada en Vitest (9/9 tests pass, 3ms y 2ms)	APROBADO	24/11/2026 15:27	25/11/2026 23:47	fix(recuperacion): sincronizar develop y resolver BUG-H74-WEB-01 a 05
CP-H74-WEB-11	Prueba en vivo HTTP GET y PATCH /api/eventos-atp/recuperacion/{id} (200 OK) con auditoría y stock diferencial (CA-2 / CA-4)	Integración API / cURL	Backend / DB	Crítica	sgrai-api corriendo en localhost:3001 con fixture H74 sembrado y token JWT de encargado@valdivia.cl	PATCH .../74100000-...-0001 con descripcion, fechaEstimadaFin: "2026-11-30T18:00:00.000Z" y recursos (90 y 15)	API retorna 200 OK actualizando descripcion, fechaEstimadaFin, recursos, actualizadoPorId y actualizadoEn	200 OK verificado en Re-Test; GET posterior confirma cantidadInsumosAsignados: 105 y actualizadoPorId: ...0003	APROBADO	24/11/2026 15:26	25/11/2026 23:47	feat(recuperacion): edicion de operativos de recuperacion y actualizacion en tiempo real (HU-74)
CP-H74-WEB-12	Prueba en vivo HTTP 409 Conflict en estados COMPLETADA/CANCELADA, stock insuficiente y patrulla ocupada (CA-3)	Integración API / cURL	Backend / Negocio	Crítica	sgrai-api activo con registros REC-2026-7403 (COMPLETADA), REC-2026-7404 (CANCELADA) y patrulla EN_VERIFICACION	PATCH sobre ...7403, ...7404, cantidad: 99999 y patrullaId: f1000000-...-0001	API rechaza todos los casos con 409 Conflict y mensajes descriptivos del estado o disponibilidad	409 Conflict verificado en Re-Test para los 4 escenarios sin alterar datos en BD	APROBADO	24/11/2026 15:26	25/11/2026 23:47	feat(recuperacion): edicion de operativos de recuperacion y actualizacion en tiempo real (HU-74)
CP-H74-WEB-13	Prueba en vivo HTTP 401 Unauthorized (sin JWT Bearer) y 403 Forbidden (Supervisor sin permiso de creación/edición) (CA-5)	Seguridad RBAC / cURL	Backend / Auth	Crítica	Token JWT de supervisor@valdivia.cl y petición sin token con cabecera x-user-id	PATCH .../74100000-...-0001 sin Authorization o con Authorization: Bearer <SUP_TOKEN>	API responde 401 exigiendo Authorization: Bearer y 403 exigiendo recuperacion:crear/recuperacion:editar/Encargado	401 Unauthorized y 403 Forbidden ("Acceso denegado. Se requiere permiso 'recuperacion:crear', 'recuperacion:editar' o rol Encargado.") verificados	APROBADO	24/11/2026 15:26	25/11/2026 23:47	feat(recuperacion): edicion de operativos de recuperacion y actualizacion en tiempo real (HU-74)
CP-H74-WEB-14	Prueba en vivo HTTP 400 Bad Request (body vacío, fecha anterior, cantidad: 0) y 404 Not Found (UUID inexistente)	Validación / Contrato	Backend / cURL	Alta	sgrai-api activo con token JWT de Encargado	PATCH con {}, fechaEstimadaFin: "2025-01-01T00:00:00.000Z", cantidad: 0 y UUID 00000000-...-999999999999	API responde 400 Bad Request con detalle de validación y 404 Not Found para identificador inexistente	400 (errors por campo y mensaje temporal) y 404 verificados en vivo en Re-Test	APROBADO	24/11/2026 15:26	25/11/2026 23:47	feat(recuperacion): edicion de operativos de recuperacion y actualizacion en tiempo real (HU-74)
CP-H74-WEB-15	Análisis estático (npm run lint), tipos TypeScript (npx tsc --noEmit), regresión global (npm test) y compilación (npm run build)	Calidad / Build / CI	Proyecto Completo	Alta	Rama feature/H74-editar-operativo-recuperacion sincronizada con origin/develop	npm run lint, npx tsc --noEmit, npm test, npm run build	Código de salida 0 en los cuatro pipelines sin errores de compilación ni regresiones	lint (0 errores), tsc --noEmit (0 errores locales), npm test (141 archivos / 1028 tests pass) y next build --webpack (49 rutas, Exit 0)	APROBADO	24/11/2026 15:24	25/11/2026 23:47	fix(recuperacion): sincronizar develop y resolver BUG-H74-WEB-01 a 05
```

---

## 5. Guía de Ejecución y Replicabilidad Paso a Paso (Re-Test `25/11/2026`)

### 5.1. Ejecución de Suites Automatizadas en Vitest

#### Comando consolidado para las suites de recuperación (HU-32 / HU-73 / HU-74)
```bash
npx vitest run \
  src/components/mando/recuperacion/__tests__/ModalEditarOperativoRecuperacion.test.tsx \
  src/components/mando/recuperacion/__tests__/OperativosRecuperacionView.test.tsx \
  src/hooks/__tests__/usePuedeEditarRecuperacion.test.ts \
  src/hooks/__tests__/useRecuperacionSocket.test.ts \
  src/services/__tests__/recuperacionService.test.ts \
  src/components/recuperacion/__tests__/DetalleEventoRecuperacionClient.test.tsx
```

**Evidencia real obtenida en consola:**
```text
 ✓ src/hooks/__tests__/usePuedeEditarRecuperacion.test.ts (5 tests) 27ms
 ✓ src/services/__tests__/recuperacionService.test.ts (24 tests) 28ms
 ✓ src/hooks/__tests__/useRecuperacionSocket.test.ts (9 tests) 46ms
 ✓ src/components/mando/recuperacion/__tests__/OperativosRecuperacionView.test.tsx (5 tests) 702ms
 ✓ src/components/mando/recuperacion/__tests__/ModalEditarOperativoRecuperacion.test.tsx (9 tests) 757ms
 ✓ src/components/recuperacion/__tests__/DetalleEventoRecuperacionClient.test.tsx (9 tests) 970ms

 Test Files  6 passed (6)
      Tests  61 passed (61)
   Start at  23:41:50
   Duration  2.86s (transform 1.22s, setup 846ms, collect 3.02s, tests 2.54s, environment 4.21s, prepare 559ms)
```

#### Suite de regresión global del repositorio
```bash
npm test
```

**Evidencia real obtenida en consola:**
```text
 Test Files  141 passed (141)
      Tests  1028 passed (1028)
   Start at  23:40:54
   Duration  43.28s (transform 24.44s, setup 42.84s, collect 103.09s, tests 130.16s, environment 243.87s, prepare 30.02s)
```

#### Ejecución individual de casos de Re-Test con `npm test -- -t "..."`

1. **`BUG-H74-WEB-01` — Preservación de borrador en modal ante actualización externa:**
```bash
npm test -- src/components/mando/recuperacion/__tests__/ModalEditarOperativoRecuperacion.test.tsx -t "BUG-H74-WEB-01"
```
```text
 ✓ HU-74: OperativoRecuperacionDrawer y ModalEditarOperativoRecuperacion > BUG-H74-WEB-01: no debe sobrescribir cambios no guardados si operativo cambia de referencia/actualizadoEn mientras el modal está abierto  397ms
 Test Files  1 passed (1)
      Tests  1 passed | 8 skipped (9)
```

2. **`BUG-H74-WEB-02` — Política RBAC *Fail-Closed* en `usePuedeEditarRecuperacion`:**
```bash
npm test -- src/hooks/__tests__/usePuedeEditarRecuperacion.test.ts
```
```text
 ✓ usePuedeEditarRecuperacion (HU-74 - Fail-Closed) > retorna false cuando se renderiza fuera de AuthProvider y SimulatedSessionProvider (Fail-Closed) 15ms
 ✓ usePuedeEditarRecuperacion (HU-74 - Fail-Closed) > retorna false mientras AuthContext está cargando 3ms
 ✓ usePuedeEditarRecuperacion (HU-74 - Fail-Closed) > retorna true si AuthContext autenticado tiene permiso recuperacion:editar 2ms
 ✓ usePuedeEditarRecuperacion (HU-74 - Fail-Closed) > retorna false si AuthContext autenticado no tiene permiso ni es ADMIN 2ms
 ✓ usePuedeEditarRecuperacion (HU-74 - Fail-Closed) > retorna true si SimulatedSessionContext tiene recuperacion:editar sin AuthContext 2ms
 Test Files  1 passed (1)
      Tests  5 passed (5)
```

3. **`BUG-H74-WEB-03` — Opción vacía cuando `patrulla` es `null` y bloqueo en `COMPLETADA`:**
```bash
npm test -- src/components/mando/recuperacion/__tests__/ModalEditarOperativoRecuperacion.test.tsx -t "BUG-H74-WEB-03"
```
```text
 ✓ HU-74: OperativoRecuperacionDrawer y ModalEditarOperativoRecuperacion > BUG-H74-WEB-03: debe incluir opción vacía cuando patrulla es null y bloquear inputs en estado COMPLETADA 256ms
 Test Files  1 passed (1)
      Tests  1 passed | 8 skipped (9)
```

4. **`BUG-H74-WEB-04` — Validación `fechaEstimadaFin < creadoEn` y mapeo de errores `recursos.0.cantidad`:**
```bash
npm test -- src/components/mando/recuperacion/__tests__/ModalEditarOperativoRecuperacion.test.tsx -t "BUG-H74-WEB-04"
```
```text
 ✓ HU-74: OperativoRecuperacionDrawer y ModalEditarOperativoRecuperacion > BUG-H74-WEB-04: debe validar fechaEstimadaFin anterior a creadoEn y mapear errores 400 por fila (recursos.0.cantidad)  322ms
 Test Files  1 passed (1)
      Tests  1 passed | 8 skipped (9)
```

5. **`OperativosRecuperacionView` (HU-74) — Apertura de edición directa desde botón `"Editar"` en tabla:**
```bash
npm test -- src/components/mando/recuperacion/__tests__/OperativosRecuperacionView.test.tsx -t "HU-74"
```
```text
 ✓ OperativosRecuperacionView (HU-73) > HU-74: permite abrir el modal de edición directa desde el botón Editar de la tabla y bloquea si el operativo está cerrado  357ms
 Test Files  1 passed (1)
      Tests  1 passed | 4 skipped (5)
```

---

### 5.2. Verificación Estática, Compilación, Integración con `origin/develop` y Contraste OpenAPI Real

```bash
npm run lint
npx tsc --noEmit
npm run build
grep -rn "next/font/google" src || echo "OK: sin Google Fonts"
git merge-tree --write-tree --name-only origin/develop HEAD
```

**Evidencia real obtenida en consola:**
```text
=== LINT OK ===
=== TSC OK ===
✓ Compiled successfully in 7.5s
✓ Finished TypeScript in 9.6s
✓ Generating static pages using 15 workers (49/49) in 1171ms
=== BUILD OK ===
OK: sin Google Fonts
e48134b747efdcdf0540fd22016528624531103a
```

#### Evidencia de desfase contractual real frente a `openapi-typescript` (`BUG-H74-WEB-05`)
```bash
npx openapi-typescript http://localhost:3001/openapi.json -o /tmp/api-generated-live.d.ts
npx tsc -p /tmp/tsconfig-live-check.json
```

**Evidencia real obtenida (15 errores en código productivo `src/services/recuperacionService.ts`):**
```text
src/services/recuperacionService.ts:210:21 - error TS2339: Property 'total' does not exist on type '{ message: string; data: { ... }[]; meta: { ... }; }'.
src/services/recuperacionService.ts:368:9 - error TS2322: Type '{ authorization: string; }' is not assignable to type 'undefined'.
src/services/recuperacionService.ts:376-423 - error TS2339/TS7006/TS2352: Properties 'mision', 'patrulla', 'recursos', 'contactoNombre', 'contactoTelefono', 'total', 'latitud', 'longitud' missing on live GET /api/eventos-atp/recuperacion item schema.
src/services/recuperacionService.ts:470-471 - error TS2339/TS2551: Properties 'recursosAsignados' and 'misiones' missing on live GET /api/eventos-atp/recuperacion/{id} schema.
src/services/recuperacionService.ts:675:9 - error TS2322: Type '{ header?: { 'x-user-id': string; } | undefined; path: { id: string; }; }' is not assignable to type '{ query?: undefined; header?: undefined; path: { id: string; }; cookie?: undefined; }'.
  Types of property 'header' are incompatible.
    Type '{ 'x-user-id': string; } | undefined' is not assignable to type 'undefined'.
TSC_LIVE_PROD_EXIT=2
```

---

### 5.3. Pruebas HTTP/cURL en Vivo contra `sgrai-api` (`http://localhost:3001`)

#### Verificación de contrato OpenAPI `0.12.0` expuesto en vivo
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
| **CA-1:** En el detalle del operativo de recuperación, el sistema debe proveer la acción 'Editar Planificación'. | `CP-H74-WEB-01`, `CP-H74-WEB-04`, `BUG-H74-WEB-05` | **APROBADO** | `OperativoRecuperacionDrawer.tsx` provee el botón `"Editar Planificación"` y `OperativosRecuperacionTabla.tsx` incorpora el botón directo `<Button variant="teal">` con ícono `<Pencil />` sin estilos inline y protegido con `edicionRequestSeqRef`. |
| **CA-2:** El formulario modal debe permitir modificar: descripción de tareas, fecha estimada de término y reasignación de insumos/recursos. | `CP-H74-WEB-05`, `CP-H74-WEB-11`, `BUG-H74-WEB-01`, `BUG-H74-WEB-03`, `BUG-H74-WEB-04` | **APROBADO** | Resueltos los defectos `01`, `03` y `04`: el formulario conserva borradores ante actualización externa (`avisoActualizacionRemota`), maneja opción vacía en `patrulla: null`, valida cantidades enteras sin forzar `0`, restringe activos individuales, filtra no disponibles y mapea `recursos.0.cantidad` por fila. |
| **CA-3:** No se debe permitir editar un operativo que se encuentre en estado `COMPLETADA` o `CANCELADA`. | `CP-H74-WEB-02`, `CP-H74-WEB-03`, `CP-H74-WEB-08`, `CP-H74-WEB-12`, `BUG-H74-WEB-03` | **APROBADO** | Bloqueo verificado en Drawer, botón/pre-chequeo de Tabla, estado `esEstadoCerrado` dentro de `ModalEditarOperativoRecuperacion` (incluyendo transición externa o respuesta `409 ESTADO_BLOQUEADO`) y backend (`409 Conflict`). |
| **CA-4:** Cada edición debe registrar auditoría (`actualizado_en = CURRENT_TIMESTAMP`, `actualizado_por_id`). | `CP-H74-WEB-07`, `CP-H74-WEB-11`, `BUG-H74-WEB-02`, `BUG-H74-WEB-05` | **OBSERVADO (Parcial)** | El backend persiste `actualizado_en`/`actualizado_por_id` desde el Bearer JWT y `OperativoRecuperacionDrawer.tsx` ya los despliega (`298-309`) propagando `activeUserId`. No obstante, `editarOperativoRecuperacion` (`recuperacionService.ts:675`) continúa enviando `header: { 'x-user-id': userId }`, lo que rompe `tsc` contra `openapi-typescript` real (`BUG-H74-WEB-05`). |
| **CA-5:** El endpoint `PATCH /api/eventos-atp/recuperacion/{id}` debe requerir permiso `recuperacion:crear` o rol Encargado. | `CP-H74-WEB-04`, `CP-H74-WEB-09`, `CP-H74-WEB-13`, `BUG-H74-WEB-02` | **APROBADO** | `sgrai-api` valida `['recuperacion:crear', 'recuperacion:editar']` o rol autorizado (`401` sin JWT Bearer y `403` ante Supervisor), y `usePuedeEditarRecuperacion` aplica política *Fail-Closed* sobre `AuthContext` y `SimulatedSessionContext`. |
