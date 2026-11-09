# Informe y Matriz de Casos de Prueba (QA): HU-85 — Desactivar Patrulla Verificadora (Baja Lógica y Liberación de Recursos)

> **Documento Oficial de Aseguramiento de Calidad (QA) — Frontend Web**  
> **Proyecto:** Sistema de Gestión de Recursos para Atención de Incidentes (SGRAI) — Dirección de Gestión de Riesgos de Desastres, Municipalidad de Valdivia.  
> **Módulo:** Recursos y Personal / Administración de Patrullas Verificadoras (`sgrai-web` - `/gestion/admin/patrullas`).  
> **Historia de Usuario:** HU-85 — *"Como Administrador Quiero desactivar mediante baja lógica una patrulla verificadora que ya no prestará servicios Para impedir que sea seleccionada en nuevos despachos, conservando la auditoría de los reportes técnicos en los que actuó."*  
> **Desarrollador Asignado:** zetastormy  
> **Servicio Web Auditado:** `sgrai-web` (Next.js 16 App Router + React 19 + TypeScript + Vitest v3.2.7 + Testing Library + CSS Modules).  
> **Rama Git Evaluada:** `feature/H85-desactivar-patrulla`  
> **Commits Evaluados (Conventional Commits):**  
> * `feat(admin): implementar desactivacion de patrullas verificadoras HU-85`  
> * `fix(admin): corregir propiedad max-width y ajustar ancho maximo a 520px en PatrullaDesactivarModal`  
> * `style(admin): simplificar iconografia del modal y resumir nota de auditoria`  
> * `merge: integrar develop en feature/H85-desactivar-patrulla resolviendo navegacion y boton de emergencia`  
> * `fix(patrullas): subsanar defectos de auditoria QA en desactivacion de patrullas (HU-85)`  
> * `chore(api): sincronizar contratos OpenAPI con campos de unidad activa para terreno (H85)`  
>  
> **Fecha de Auditoría Inicial QA:** 03 de Noviembre de 2026.  
> **Fecha de Re-Test y Certificación Final:** 08 de Noviembre de 2026 22:11.  
> **Estado de Certificación:** 🟢 **APROBADO Y CERTIFICADO PARA PRODUCCIÓN (100% PASS TRAS RE-TEST EXITOSO — 20/20 CASOS APROBADOS)**.

---

## 1. Resumen Ejecutivo de Pruebas de Frontend y Ciclo de Re-Test

| Métrica | Resultado | Observaciones |
|---|:---:|---|
| **Total de Casos Evaluados en Matriz** | **20** | 5 Defectos Auditados y Subsanados (`BUG-H85-WEB-01` a `BUG-H85-WEB-05`) + 15 Casos Funcionales/Técnicos |
| **Casos Aprobados / Corregidos (Passed)** | **20** | 100% de los casos verificados y conformes con los Criterios de Aceptación (CA-1 a CA-5) |
| **Defectos Abiertos / Fallidos (Bugs)** | **0** | Los 5 defectos detectados en la auditoría inicial fueron resueltos y verificados en Re-Test |
| **Casos Bloqueados (Blocked)** | **0** | Sin bloqueos de infraestructura local |
| **Tasa de Aprobación Global (% Pass)** | **100.0%** | Cumple el estándar de calidad institucional para integración en `develop` |
| **Análisis Estático de Código (`npm run lint`)** | 🟢 **0 errores** | 0 errores de ESLint y 0 advertencias en los archivos del módulo de baja de patrullas |
| **Chequeo de Tipos Estáticos (`npx tsc --noEmit`)** | 🟢 **0 errores** | Compilación TypeScript limpia y sincronizada con `src/types/api-generated.d.ts` |
| **Suite Automatizada del Módulo (Vitest)** | 🟢 **55/55 tests pass** | `patrullasService.test.ts` (26), `usePatrullas.test.ts` (7), `PatrullaDesactivarModal.test.tsx` (10), `AdminPatrullasClient.test.tsx` (12) |
| **Cumplimiento Guía Visual Municipal (`GEMINI.md`)** | 🟢 **100%** | Uso de `Heading`, `Button`, tokens institucionales, `border-radius: 0px` e iconografía `lucide-react` |

---

## 2. Registro Técnico de Defectos Detectados y Verificación de Re-Test

Durante la iteración inicial del 03/11/2026 se identificaron **5 defectos reales** (**1 Crítico**, **2 Altos** y **2 Medios**). Tras la aplicación de las correcciones por parte del desarrollador, se ejecutó el ciclo formal de **Re-Test** el 08/11/2026, verificando el cierre satisfactorio de la totalidad de los hallazgos:

| ID Defecto | Título y Descripción Técnica del Defecto | Severidad | Archivo(s) Afectado(s) | Fecha Hallazgo | Estado | Fecha Re-Test | Solución / Commit | Dictamen Re-Test |
|---|---|:---:|---|:---:|:---:|:---:|---|---|
| `BUG-H85-WEB-01` | **Falla de bloqueo reactivo ante conflicto concurrente `409 Conflict` y omisión de estados tácticos activos (`EN_MISION`, `EN_PREVENCION`, `EN_RECUPERACION`):** En `PatrullaDesactivarModal.tsx`, cuando la API respondía `409 Conflict` (`esConflicto = true`), el botón destructivo `"Sí, Desactivar Patrulla"` evaluaba únicamente `disabled={desactivando \|\| estaBloqueadaPorOperacion}` sin incluir `esConflicto`. Además, `estaBloqueada` solo evaluaba `patrulla.estado === 'EN_VERIFICACION' \|\| Boolean(patrulla.misionActiva)`, omitiendo `EN_MISION`, `EN_PREVENCION`, `EN_RECUPERACION` y `NO_DISPONIBLE`, y `AdminPatrullasClient.tsx` retenía copias estáticas en `patrullaADesactivar` y `patrullaADetalle`. | Crítica | `src/components/admin/patrullas/PatrullaDesactivarModal.tsx`, `src/components/mando/patrullas/PatrullaCard.tsx`, `src/components/admin/patrullas/PatrullaDetalleDrawer.tsx`, `src/components/admin/patrullas/AdminPatrullasClient.tsx` | 03/11/2026 18:25 | `CORREGIDO` | 08/11/2026 22:11 | fix(patrullas): subsanar defectos de auditoria QA en desactivacion de patrullas (HU-85) | 🟢 **VERIFICADO:** `estaBloqueadaPorOperacion` evalúa `patrulla.estado !== 'DISPONIBLE' \|\| Boolean(patrulla.misionActiva)`, el botón confirmar incluye `esConflicto \|\| esNotFound` en `disabled`, y `AdminPatrullasClient` sincroniza `patrullaADesactivar` y `patrullaADetalle` vía `useMemo`. |
| `BUG-H85-WEB-02` | **Política RBAC *Fail-Open* en `puedeDesactivar`, fallback `DEFAULT_ENCARGADO_ID` en baja lógica y omisión de manejo `401 Unauthorized`:** En `AdminPatrullasClient.tsx`, `puedeDesactivar` retornaba `: true` por defecto cuando `auth?.usuario` y `session?.usuarioActivo` eran nulos. Adicionalmente, `PatrullaDesactivarModal.tsx` y `patrullasService.desactivar` asignaban por defecto `DEFAULT_ENCARGADO_ID` como `x-user-id`, y `patrullasService.desactivar` no manejaba `401 Unauthorized` e ignoraba `json.message` en `403 Forbidden`. | Alta | `src/components/admin/patrullas/AdminPatrullasClient.tsx`, `src/components/admin/patrullas/PatrullaDesactivarModal.tsx`, `src/services/patrullasService.ts` | 03/11/2026 18:26 | `CORREGIDO` | 08/11/2026 22:11 | fix(patrullas): subsanar defectos de auditoria QA en desactivacion de patrullas (HU-85) | 🟢 **VERIFICADO:** `puedeDesactivar` aplica política *Fail-Closed* (`: false`), se eliminó `DEFAULT_ENCARGADO_ID` en `desactivar` y se agregó soporte completo para `401 Unauthorized` y lectura sanitizada de `json.message` en `403 Forbidden`. |
| `BUG-H85-WEB-03` | ***Stale Closure* en listener WebSocket (`react-hooks/exhaustive-deps`), doble petición `GET /api/patrullas` redundante y desincronización de `meta.total`:** En `src/hooks/usePatrullas.ts`, el efecto de suscripción Socket omitía `consultar` en sus dependencias generando un warning en `npm run lint`, ejecutaba dos peticiones `GET /api/patrullas` duplicadas al desactivar y no decrementaba `meta.total` en la actualización optimista por WebSocket. | Alta | `src/hooks/usePatrullas.ts`, `src/components/admin/patrullas/AdminPatrullasClient.tsx` | 03/11/2026 18:27 | `CORREGIDO` | 08/11/2026 22:11 | fix(patrullas): subsanar defectos de auditoria QA en desactivacion de patrullas (HU-85) | 🟢 **VERIFICADO:** Se implementó `consultarRef` eliminando el *stale closure* y el warning de ESLint; `handlePatrullaDesactivada` actualiza la lista y decrementa `meta.total` de forma atómica sin duplicar peticiones HTTP. |
| `BUG-H85-WEB-04` | **Discrepancia de contrato entre `DesactivarPatrullaDataDTO` manual y `DesactivarPatrullaResponseSchema` de `sgrai-api`, y ausencia de rutas en `api-generated.d.ts`:** En `src/types/patrullas.ts`, `DesactivarPatrullaDataDTO` declaraba `codigo: string` y `eliminadoPorId: string` como no anulables y `src/types/api-generated.d.ts` no incluía los esquemas de `/api/patrullas` y `/api/patrullas/{id}`. | Media | `src/types/patrullas.ts`, `src/types/api-generated.d.ts` | 03/11/2026 18:28 | `CORREGIDO` | 08/11/2026 22:11 | fix(patrullas): subsanar defectos de auditoria QA en desactivacion de patrullas (HU-85) | 🟢 **VERIFICADO:** `DesactivarPatrullaDataDTO` declara `codigo?: string \| null` y `eliminadoPorId?: string \| null`, y `src/types/api-generated.d.ts` incorpora `DesactivarPatrullaResponseData` y las rutas `/api/patrullas/{id}`. |
| `BUG-H85-WEB-05` | **Persistencia de estado de error entre aperturas en `PatrullaDesactivarModal` y falta de bloqueo ante `404 Not Found`:** En `PatrullaDesactivarModal.tsx`, `errorMensaje` y `esConflicto` solo se limpiaban dentro de `handleCerrar`, y ante un `404 Not Found` no se deshabilitaba el botón de confirmación. | Media | `src/components/admin/patrullas/PatrullaDesactivarModal.tsx` | 03/11/2026 18:29 | `CORREGIDO` | 08/11/2026 22:11 | fix(patrullas): subsanar defectos de auditoria QA en desactivacion de patrullas (HU-85) | 🟢 **VERIFICADO:** El modal reinicia reactivamente `errorMensaje`, `esConflicto` y `esNotFound` al cambiar `patrullaIdActual`, y ante `404 Not Found` activa `esNotFound = true` bloqueando el botón de confirmación. |

---

## 3. Matriz Consolidada de Casos de Prueba (13 Columnas)

| ID Caso | Título del Caso de Prueba | Tipo de Prueba | Nivel | Prioridad | Precondición | Datos de Prueba (Payload / Headers / Query) | Resultado Esperado | Resultado Obtenido | Estado | Fecha / Hora Ejecución | Fecha / Hora Re-Test | Solución / Commit |
|---|---|---|---|---|---|---|---|---|:---:|:---:|:---:|---|
| `BUG-H85-WEB-01` | Bloqueo reactivo del botón confirmar ante 409 Conflict concurrente y cobertura de todos los estados operativos en terreno | Concurrencia / Negocio | UI / Modal y Card | Crítica | Modal abierto sobre patrulla DISPONIBLE que pasa a misión activa concurrentemente o patrulla en estado EN_MISION | Respuesta HTTP 409 en `DELETE /api/patrullas/f1000000-0000-4000-8000-000000000001` o patrulla con `estado: 'EN_MISION'` y `misionActiva: null` | Al recibir 409 Conflict se deshabilita el botón "Sí, Desactivar Patrulla" y los estados EN_MISION, EN_PREVENCION, EN_RECUPERACION y NO_DISPONIBLE bloquean la baja | Botón confirmar queda inmediatamente deshabilitado ante 409 (`esConflicto`), todos los estados distintos de DISPONIBLE bloquean la acción y `useMemo` sincroniza el estado en vivo | **CORREGIDO** | 03/11/2026 18:25 | 08/11/2026 22:11 | fix(patrullas): subsanar defectos de auditoria QA en desactivacion de patrullas (HU-85) |
| `BUG-H85-WEB-02` | Control RBAC Fail-Closed sin sesión activa, trazabilidad de usuario real sin DEFAULT_ENCARGADO_ID y manejo de 401/403 | Seguridad / RBAC | UI / Service DAL | Alta | Contexto sin sesión hidratada o petición DELETE con token expirado (401) o mensaje específico de 403 | `auth.usuario = null`, `session.usuarioActivo = null`; respuesta HTTP 401 / 403 en `DELETE /api/patrullas/{id}` | `puedeDesactivar` evalúa `false` por defecto; no se suplanta `x-user-id` con `DEFAULT_ENCARGADO_ID`; `patrullasService.desactivar` maneja 401 y preserva `json.message` en 403 | Política Fail-Closed verificada (`: false`), sin inyección de `DEFAULT_ENCARGADO_ID` y respuestas 401/403 mapeadas con el mensaje sanitizado del backend | **CORREGIDO** | 03/11/2026 18:26 | 08/11/2026 22:11 | fix(patrullas): subsanar defectos de auditoria QA en desactivacion de patrullas (HU-85) |
| `BUG-H85-WEB-03` | Dependencias de Hook en listener Socket patrulla:desactivada, eliminación de doble fetch y actualización de meta.total | Reactividad / Calidad | Hook / Socket.io | Alta | Ejecución de `npm run lint` y recepción de evento WebSocket `patrulla:desactivada` | Payload Socket `{ patrullaId: 'p-1', nombre: 'Patrulla Rápida Costa-1' }` | 0 warnings de `react-hooks/exhaustive-deps` en `usePatrullas.ts`, actualización de `meta.total` y eliminación de llamada HTTP redundante | 0 warnings de ESLint en `usePatrullas.ts` gracias a `consultarRef`, decremento atómico de `meta.total` y deduplicación de peticiones verificada en Vitest | **CORREGIDO** | 03/11/2026 18:27 | 08/11/2026 22:11 | fix(patrullas): subsanar defectos de auditoria QA en desactivacion de patrullas (HU-85) |
| `BUG-H85-WEB-04` | Alineación estricta de tipos DesactivarPatrullaDataDTO con el contrato Zod/OpenAPI del backend y api-generated.d.ts | Contrato API / Tipos | Types / OpenAPI | Media | Patrulla sin código opcional o baja con `eliminadoPorId: null` retornada por `sgrai-api` | `{ id: '...', codigo: null, eliminadoPorId: null, personalLiberadoIds: [] }` | `DesactivarPatrullaDataDTO` acepta `codigo?: string \| null` y `eliminadoPorId?: string \| null`, y `/api/patrullas/{id}` figura en `api-generated.d.ts` | Tipos sincronizados en `src/types/patrullas.ts` y esquemas `DesactivarPatrullaResponseData` incorporados en `src/types/api-generated.d.ts` con 0 errores en `tsc --noEmit` | **CORREGIDO** | 03/11/2026 18:28 | 08/11/2026 22:11 | fix(patrullas): subsanar defectos de auditoria QA en desactivacion de patrullas (HU-85) |
| `BUG-H85-WEB-05` | Limpieza reactiva de errores al cambiar de patrulla en PatrullaDesactivarModal y bloqueo ante 404 Not Found | Usabilidad / Estado | UI / Modal | Media | Modal con error previo que se reabre con otra patrulla o recibe HTTP 404 por baja previa concurrente | Respuesta HTTP 404 `{ message: 'La patrulla verificadora solicitada ya fue dada de baja.' }` | Al cambiar `patrulla.id` o `isOpen` se limpian `errorMensaje`, `esConflicto` y `esNotFound`; ante 404 se deshabilita el botón de confirmación | Limpieza reactiva verificada al cambiar de patrulla y bloqueo del botón confirmar (`esNotFound = true`) comprobado mediante pruebas unitarias | **CORREGIDO** | 03/11/2026 18:29 | 08/11/2026 22:11 | fix(patrullas): subsanar defectos de auditoria QA en desactivacion de patrullas (HU-85) |
| `CP-H85-WEB-01` | Visualización del botón "Desactivar" en tarjeta de patrulla (`PatrullaCard`) para perfil Administrador o permiso `recursos:eliminar` | Funcional / RBAC | UI / Componente | Alta | Usuario autenticado con permiso `recursos:eliminar` en `/gestion/admin/patrullas` | Patrulla `f1000000-0000-4000-8000-000000000001` en estado `DISPONIBLE` | Se renderiza el botón destructivo `btn-desactivar-patrulla-{id}` con ícono `Trash2` y etiqueta "Desactivar" | Botón renderizado y habilitado correctamente en la fila de acciones de la tarjeta | **APROBADO** | 03/11/2026 18:26 | 08/11/2026 22:11 | feat(admin): implementar desactivacion de patrullas verificadoras HU-85 |
| `CP-H85-WEB-02` | Visualización del botón "Desactivar Patrulla" en el panel lateral de detalle (`PatrullaDetalleDrawer`) | Funcional / UI | UI / Drawer | Alta | Administrador abre la ficha técnica presionando "Ver Ficha" | Clic en `btn-ver-detalle-f1000000-0000-4000-8000-000000000001` | El pie del Drawer muestra el botón destructivo `btn-drawer-desactivar-patrulla` junto a "Editar Patrulla" | Botón "Desactivar Patrulla" visible en el footer del Drawer y conectado al modal de confirmación | **APROBADO** | 03/11/2026 18:26 | 08/11/2026 22:11 | feat(admin): implementar desactivacion de patrullas verificadoras HU-85 |
| `CP-H85-WEB-03` | Ocultamiento de los controles de baja para perfiles operativos sin permiso `recursos:eliminar` | Seguridad / RBAC | UI / Permisos | Crítica | Usuario autenticado en sesión simulada con permisos `['recursos:leer', 'recursos:editar']` | Renderizado de `AdminPatrullasClient` con `puedeDesactivar = false` | No se renderiza el botón "Desactivar" en las tarjetas ni en el Drawer de detalle | Los botones de desactivación no existen en el DOM para usuarios sin el permiso `recursos:eliminar` | **APROBADO** | 03/11/2026 18:26 | 08/11/2026 22:11 | feat(admin): implementar desactivacion de patrullas verificadoras HU-85 |
| `CP-H85-WEB-04` | Apertura del modal `PatrullaDesactivarModal` con resumen de unidad, liberación de vehículo/personal y nota de auditoría SENAPRED | Funcional / UX | UI / Modal | Crítica | Patrulla `PV-COSTA-01` (`DISPONIBLE`) con vehículo `Camioneta 4x4 Navara` y 2 brigadistas | Clic en botón "Desactivar" | Modal exhibe nombre, código, delegación, líder, detalle de liberación de vehículo y 2 funcionarios, y nota de auditoría SENAPRED (§3.7) | Modal renderiza todos los bloques informativos con ancho máximo de 520px y estilo institucional plano | **APROBADO** | 03/11/2026 18:26 | 08/11/2026 22:11 | style(admin): simplificar iconografia del modal y resumir nota de auditoria |
| `CP-H85-WEB-05` | Bloqueo preventivo en interfaz (Card, Drawer y Modal) cuando la patrulla se encuentra en estado `EN_VERIFICACION` | Regla de Negocio | UI / Validación | Crítica | Patrulla `PV-SUR-02` en estado `EN_VERIFICACION` atendiendo misión `MIS-2026-002` | Inspección de `btn-desactivar-patrulla-{id}` y apertura de `PatrullaDesactivarModal` | Botón en tarjeta y Drawer en estado `disabled` con tooltip explicativo; en modal se muestra banner `bloqueo-operativo-alerta` y botón confirmar deshabilitado | Controles deshabilitados con `aria-label` reglamentario y alerta naranja con código de misión en curso | **APROBADO** | 03/11/2026 18:26 | 08/11/2026 22:11 | feat(admin): implementar desactivacion de patrullas verificadoras HU-85 |
| `CP-H85-WEB-06` | Ejecución exitosa de baja lógica (`DELETE /api/patrullas/:id` -> `200 OK`), cierre de modal y notificación Toast | Integración / Flujo | UI / Service | Crítica | Patrulla `DISPONIBLE` sin misiones activas; usuario Administrador confirma la acción | Clic en `btn-confirmar-desactivar-patrulla` -> `DELETE /api/patrullas/f1000000-0000-4000-8000-000000000001` | Se invoca `patrullasService.desactivar`, se cierra el modal, se emite Toast verde de éxito y se refresca el listado | Petición DELETE enviada con cabeceras de autorización, modal cerrado y callback `onPatrullaDesactivada` ejecutado | **APROBADO** | 03/11/2026 18:26 | 08/11/2026 22:11 | feat(admin): implementar desactivacion de patrullas verificadoras HU-85 |
| `CP-H85-WEB-07` | Despliegue de alerta `InlineNotice` de advertencia en el modal cuando el backend rechaza con `409 Conflict` | Manejo de Errores | UI / Modal | Alta | `patrullasService.desactivar` retorna `{ exito: false, esConflicto: true, codigoError: 409, mensaje: '...' }` | Clic en "Sí, Desactivar Patrulla" | El modal permanece abierto, despliega `InlineNotice` con título `"Conflicto Operativo (HTTP 409)"` y deshabilita el botón confirmar | Se renderiza el banner de conflicto con el motivo del servidor y el botón confirmar queda bloqueado | **APROBADO** | 03/11/2026 18:26 | 08/11/2026 22:11 | feat(admin): implementar desactivacion de patrullas verificadoras HU-85 |
| `CP-H85-WEB-08` | Despliegue de alerta de error en el modal cuando el backend rechaza por permisos con `403 Forbidden` | Seguridad / Errores | UI / Modal | Alta | `patrullasService.desactivar` retorna `{ exito: false, esForbidden: true, codigoError: 403 }` | Clic en "Sí, Desactivar Patrulla" sin privilegios en backend | El modal permanece abierto y muestra `InlineNotice` de variante `error` indicando la falta del permiso `recursos:eliminar` | Alerta roja desplegada informando la restricción de privilegios | **APROBADO** | 03/11/2026 18:26 | 08/11/2026 22:11 | feat(admin): implementar desactivacion de patrullas verificadoras HU-85 |
| `CP-H85-WEB-09` | Cancelación segura de la baja lógica mediante botón "Cancelar", botón "X" o tecla `Escape` | Usabilidad / A11y | UI / Modal | Media | `PatrullaDesactivarModal` abierto y sin petición en curso (`desactivando = false`) | Clic en `btn-cancelar-desactivar-patrulla`, clic en backdrop o pulsación de tecla `Escape` | El modal se cierra inmediatamente e invoca `onClose` sin emitir ninguna petición `DELETE` | Modal cerrado limpiamente y `patrullasService.desactivar` no es invocado | **APROBADO** | 03/11/2026 18:26 | 08/11/2026 22:11 | feat(admin): implementar desactivacion de patrullas verificadoras HU-85 |
| `CP-H85-WEB-10` | Bloqueo de cierre accidental del modal mientras se procesa la petición asíncrona (`desactivando = true`) | Robustez / UX | UI / Modal | Media | Petición `DELETE /api/patrullas/:id` en vuelo | Intentar cerrar con botón "Cancelar", "X" o tecla `Escape` durante la carga | Controles "Cancelar" y "X" deshabilitados, botón primario en estado `loading` con texto `"Desactivando..."` e ignorando `Escape` | El guardia `if (desactivando) return;` impide cerrar el diálogo hasta que finalice la transacción | **APROBADO** | 03/11/2026 18:26 | 08/11/2026 22:11 | feat(admin): implementar desactivacion de patrullas verificadoras HU-85 |
| `CP-H85-WEB-11` | Presentación adaptativa del recuadro de liberación cuando la patrulla es pedestre (sin vehículo) o con 1 integrante | Funcional / Borde | UI / Modal | Media | Patrulla con `vehiculo: null` e `integrantes: [{ id: 'p1', nombre: 'Juan Brigadista' }]` | Apertura de `PatrullaDesactivarModal` | Muestra `"Sin vehículo asignado (no aplica liberación)."` y singular `"1 funcionario quedará liberado a disponibilidad..."` | Textos condicionales en singular y sin vehículo renderizados correctamente sin valores `undefined` | **APROBADO** | 03/11/2026 18:26 | 08/11/2026 22:11 | feat(admin): implementar desactivacion de patrullas verificadoras HU-85 |
| `CP-H85-WEB-12` | Validación de ID vacío y manejo de errores HTTP (200, 401, 403, 404, 409, 500) en `patrullasService.desactivar` | Pruebas Unitarias | Service / DAL | Alta | Suite `src/services/__tests__/patrullasService.test.ts` en Vitest | `npx vitest run src/services/__tests__/patrullasService.test.ts` | 26/26 pruebas unitarias del servicio aprobadas incluyendo los 8 escenarios de `desactivar` | 26 tests aprobados en 27ms verificando método `DELETE`, headers y mapeo de respuestas | **APROBADO** | 03/11/2026 18:26 | 08/11/2026 22:11 | fix(patrullas): subsanar defectos de auditoria QA en desactivacion de patrullas (HU-85) |
| `CP-H85-WEB-13` | Suite de pruebas unitarias de componente `PatrullaDesactivarModal.test.tsx` en Vitest | Pruebas Unitarias | UI / Componente | Alta | Suite `src/components/admin/patrullas/__tests__/PatrullaDesactivarModal.test.tsx` | `npx vitest run src/components/admin/patrullas/__tests__/PatrullaDesactivarModal.test.tsx` | 10/10 pruebas unitarias aprobadas (renderizado nulo, SENAPRED, bloqueo en todos los estados operativos, 200 OK, 409, 404, limpieza reactiva, 403 y cancelar) | 10 tests aprobados en 322ms | **APROBADO** | 03/11/2026 18:26 | 08/11/2026 22:11 | fix(patrullas): subsanar defectos de auditoria QA en desactivacion de patrullas (HU-85) |
| `CP-H85-WEB-14` | Suite de pruebas de integración de vista `AdminPatrullasClient.test.tsx` y hook `usePatrullas.test.ts` en Vitest | Pruebas Integración | UI / Vista y Hook | Alta | Suites `AdminPatrullasClient.test.tsx` y `usePatrullas.test.ts` | `npx vitest run src/components/admin/patrullas/__tests__/AdminPatrullasClient.test.tsx src/hooks/__tests__/usePatrullas.test.ts` | 12/12 pruebas en `AdminPatrullasClient` y 7/7 en `usePatrullas` aprobadas | 19 tests aprobados verificando RBAC Fail-Closed, bloqueo operativo y evento Socket `patrulla:desactivada` | **APROBADO** | 03/11/2026 18:26 | 08/11/2026 22:11 | fix(patrullas): subsanar defectos de auditoria QA en desactivacion de patrullas (HU-85) |
| `CP-H85-WEB-15` | Cumplimiento de guía visual municipal (`GEMINI.md`) y documentación técnica (`docs/api/` y `docs/manuals/`) | Estándar / Docs | UI / Documentación | Media | Inspección de `PatrullaDesactivarModal.module.css`, `docs/api/recursos-y-personal.md` y `docs/manuals/H85-desactivar-patrulla.md` | Verificación de tokens CSS (`--radius-none`, `--color-primary-teal-dark`, `--color-danger`), `Heading`, `Button` y manual H85 | Esquinas rectas `0px`, paleta oficial de Valdivia, sin emojis, y documentación de API y manual de usuario presentes | Estilos planos conformes al diseño institucional y documentos incorporados en el repositorio | **APROBADO** | 03/11/2026 18:26 | 08/11/2026 22:11 | fix(admin): corregir propiedad max-width y ajustar ancho maximo a 520px en PatrullaDesactivarModal |

---

## 4. Bloque TSV para Hoja de Cálculo

```tsv
ID Caso	Título del Caso de Prueba	Tipo de Prueba	Nivel	Prioridad	Precondición	Datos de Prueba (Payload / Headers / Query)	Resultado Esperado	Resultado Obtenido	Estado	Fecha / Hora Ejecución	Fecha / Hora Re-Test	Solución / Commit
BUG-H85-WEB-01	Bloqueo reactivo del botón confirmar ante 409 Conflict concurrente y cobertura de todos los estados operativos en terreno	Concurrencia / Negocio	UI / Modal y Card	Crítica	Modal abierto sobre patrulla DISPONIBLE que pasa a misión activa concurrentemente o patrulla en estado EN_MISION	Respuesta HTTP 409 en DELETE /api/patrullas/f1000000-0000-4000-8000-000000000001 o patrulla con estado: 'EN_MISION' y misionActiva: null	Al recibir 409 Conflict se deshabilita el botón "Sí, Desactivar Patrulla" y los estados EN_MISION, EN_PREVENCION, EN_RECUPERACION y NO_DISPONIBLE bloquean la baja	Botón confirmar queda inmediatamente deshabilitado ante 409 (esConflicto), todos los estados distintos de DISPONIBLE bloquean la acción y useMemo sincroniza el estado en vivo	CORREGIDO	03/11/2026 18:25	08/11/2026 22:11	fix(patrullas): subsanar defectos de auditoria QA en desactivacion de patrullas (HU-85)
BUG-H85-WEB-02	Control RBAC Fail-Closed sin sesión activa, trazabilidad de usuario real sin DEFAULT_ENCARGADO_ID y manejo de 401/403	Seguridad / RBAC	UI / Service DAL	Alta	Contexto sin sesión hidratada o petición DELETE con token expirado (401) o mensaje específico de 403	auth.usuario = null, session.usuarioActivo = null; respuesta HTTP 401 / 403 en DELETE /api/patrullas/{id}	puedeDesactivar evalúa false por defecto; no se suplanta x-user-id con DEFAULT_ENCARGADO_ID; patrullasService.desactivar maneja 401 y preserva json.message en 403	Política Fail-Closed verificada (: false), sin inyección de DEFAULT_ENCARGADO_ID y respuestas 401/403 mapeadas con el mensaje sanitizado del backend	CORREGIDO	03/11/2026 18:26	08/11/2026 22:11	fix(patrullas): subsanar defectos de auditoria QA en desactivacion de patrullas (HU-85)
BUG-H85-WEB-03	Dependencias de Hook en listener Socket patrulla:desactivada, eliminación de doble fetch y actualización de meta.total	Reactividad / Calidad	Hook / Socket.io	Alta	Ejecución de npm run lint y recepción de evento WebSocket patrulla:desactivada	Payload Socket { patrullaId: 'p-1', nombre: 'Patrulla Rápida Costa-1' }	0 warnings de react-hooks/exhaustive-deps en usePatrullas.ts, actualización de meta.total y eliminación de llamada HTTP redundante	0 warnings de ESLint en usePatrullas.ts gracias a consultarRef, decremento atómico de meta.total y deduplicación de peticiones verificada en Vitest	CORREGIDO	03/11/2026 18:27	08/11/2026 22:11	fix(patrullas): subsanar defectos de auditoria QA en desactivacion de patrullas (HU-85)
BUG-H85-WEB-04	Alineación estricta de tipos DesactivarPatrullaDataDTO con el contrato Zod/OpenAPI del backend y api-generated.d.ts	Contrato API / Tipos	Types / OpenAPI	Media	Patrulla sin código opcional o baja con eliminadoPorId: null retornada por sgrai-api	{ id: '...', codigo: null, eliminadoPorId: null, personalLiberadoIds: [] }	DesactivarPatrullaDataDTO acepta codigo?: string | null y eliminadoPorId?: string | null, y /api/patrullas/{id} figura en api-generated.d.ts	Tipos sincronizados en src/types/patrullas.ts y esquemas DesactivarPatrullaResponseData incorporados en src/types/api-generated.d.ts con 0 errores en tsc --noEmit	CORREGIDO	03/11/2026 18:28	08/11/2026 22:11	fix(patrullas): subsanar defectos de auditoria QA en desactivacion de patrullas (HU-85)
BUG-H85-WEB-05	Limpieza reactiva de errores al cambiar de patrulla en PatrullaDesactivarModal y bloqueo ante 404 Not Found	Usabilidad / Estado	UI / Modal	Media	Modal con error previo que se reabre con otra patrulla o recibe HTTP 404 por baja previa concurrente	Respuesta HTTP 404 { message: 'La patrulla verificadora solicitada ya fue dada de baja.' }	Al cambiar patrulla.id o isOpen se limpian errorMensaje, esConflicto y esNotFound; ante 404 se deshabilita el botón de confirmación	Limpieza reactiva verificada al cambiar de patrulla y bloqueo del botón confirmar (esNotFound = true) comprobado mediante pruebas unitarias	CORREGIDO	03/11/2026 18:29	08/11/2026 22:11	fix(patrullas): subsanar defectos de auditoria QA en desactivacion de patrullas (HU-85)
CP-H85-WEB-01	Visualización del botón "Desactivar" en tarjeta de patrulla (PatrullaCard) para perfil Administrador o permiso recursos:eliminar	Funcional / RBAC	UI / Componente	Alta	Usuario autenticado con permiso recursos:eliminar en /gestion/admin/patrullas	Patrulla f1000000-0000-4000-8000-000000000001 en estado DISPONIBLE	Se renderiza el botón destructivo btn-desactivar-patrulla-{id} con ícono Trash2 y etiqueta "Desactivar"	Botón renderizado y habilitado correctamente en la fila de acciones de la tarjeta	APROBADO	03/11/2026 18:26	08/11/2026 22:11	feat(admin): implementar desactivacion de patrullas verificadoras HU-85
CP-H85-WEB-02	Visualización del botón "Desactivar Patrulla" en el panel lateral de detalle (PatrullaDetalleDrawer)	Funcional / UI	UI / Drawer	Alta	Administrador abre la ficha técnica presionando "Ver Ficha"	Clic en btn-ver-detalle-f1000000-0000-4000-8000-000000000001	El pie del Drawer muestra el botón destructivo btn-drawer-desactivar-patrulla junto a "Editar Patrulla"	Botón "Desactivar Patrulla" visible en el footer del Drawer y conectado al modal de confirmación	APROBADO	03/11/2026 18:26	08/11/2026 22:11	feat(admin): implementar desactivacion de patrullas verificadoras HU-85
CP-H85-WEB-03	Ocultamiento de los controles de baja para perfiles operativos sin permiso recursos:eliminar	Seguridad / RBAC	UI / Permisos	Crítica	Usuario autenticado en sesión simulada con permisos ['recursos:leer', 'recursos:editar']	Renderizado de AdminPatrullasClient con puedeDesactivar = false	No se renderiza el botón "Desactivar" en las tarjetas ni en el Drawer de detalle	Los botones de desactivación no existen en el DOM para usuarios sin el permiso recursos:eliminar	APROBADO	03/11/2026 18:26	08/11/2026 22:11	feat(admin): implementar desactivacion de patrullas verificadoras HU-85
CP-H85-WEB-04	Apertura del modal PatrullaDesactivarModal con resumen de unidad, liberación de vehículo/personal y nota de auditoría SENAPRED	Funcional / UX	UI / Modal	Crítica	Patrulla PV-COSTA-01 (DISPONIBLE) con vehículo Camioneta 4x4 Navara y 2 brigadistas	Clic en botón "Desactivar"	Modal exhibe nombre, código, delegación, líder, detalle de liberación de vehículo y 2 funcionarios, y nota de auditoría SENAPRED (§3.7)	Modal renderiza todos los bloques informativos con ancho máximo de 520px y estilo institucional plano	APROBADO	03/11/2026 18:26	08/11/2026 22:11	style(admin): simplificar iconografia del modal y resumir nota de auditoria
CP-H85-WEB-05	Bloqueo preventivo en interfaz (Card, Drawer y Modal) cuando la patrulla se encuentra en estado EN_VERIFICACION	Regla de Negocio	UI / Validación	Crítica	Patrulla PV-SUR-02 en estado EN_VERIFICACION atendiendo misión MIS-2026-002	Inspección de btn-desactivar-patrulla-{id} y apertura de PatrullaDesactivarModal	Botón en tarjeta y Drawer en estado disabled con tooltip explicativo; en modal se muestra banner bloqueo-operativo-alerta y botón confirmar deshabilitado	Controles deshabilitados con aria-label reglamentario y alerta naranja con código de misión en curso	APROBADO	03/11/2026 18:26	08/11/2026 22:11	feat(admin): implementar desactivacion de patrullas verificadoras HU-85
CP-H85-WEB-06	Ejecución exitosa de baja lógica (DELETE /api/patrullas/:id -> 200 OK), cierre de modal y notificación Toast	Integración / Flujo	UI / Service	Crítica	Patrulla DISPONIBLE sin misiones activas; usuario Administrador confirma la acción	Clic en btn-confirmar-desactivar-patrulla -> DELETE /api/patrullas/f1000000-0000-4000-8000-000000000001	Se invoca patrullasService.desactivar, se cierra el modal, se emite Toast verde de éxito y se refresca el listado	Petición DELETE enviada con cabeceras de autorización, modal cerrado y callback onPatrullaDesactivada ejecutado	APROBADO	03/11/2026 18:26	08/11/2026 22:11	feat(admin): implementar desactivacion de patrullas verificadoras HU-85
CP-H85-WEB-07	Despliegue de alerta InlineNotice de advertencia en el modal cuando el backend rechaza con 409 Conflict	Manejo de Errores	UI / Modal	Alta	patrullasService.desactivar retorna { exito: false, esConflicto: true, codigoError: 409, mensaje: '...' }	Clic en "Sí, Desactivar Patrulla"	El modal permanece abierto, despliega InlineNotice con título "Conflicto Operativo (HTTP 409)" y deshabilita el botón confirmar	Se renderiza el banner de conflicto con el motivo del servidor y el botón confirmar queda bloqueado	APROBADO	03/11/2026 18:26	08/11/2026 22:11	feat(admin): implementar desactivacion de patrullas verificadoras HU-85
CP-H85-WEB-08	Despliegue de alerta de error en el modal cuando el backend rechaza por permisos con 403 Forbidden	Seguridad / Errores	UI / Modal	Alta	patrullasService.desactivar retorna { exito: false, esForbidden: true, codigoError: 403 }	Clic en "Sí, Desactivar Patrulla" sin privilegios en backend	El modal permanece abierto y muestra InlineNotice de variante error indicando la falta del permiso recursos:eliminar	Alerta roja desplegada informando la restricción de privilegios	APROBADO	03/11/2026 18:26	08/11/2026 22:11	feat(admin): implementar desactivacion de patrullas verificadoras HU-85
CP-H85-WEB-09	Cancelación segura de la baja lógica mediante botón "Cancelar", botón "X" o tecla Escape	Usabilidad / A11y	UI / Modal	Media	PatrullaDesactivarModal abierto y sin petición en curso (desactivando = false)	Clic en btn-cancelar-desactivar-patrulla, clic en backdrop o pulsación de tecla Escape	El modal se cierra inmediatamente e invoca onClose sin emitir ninguna petición DELETE	Modal cerrado limpiamente y patrullasService.desactivar no es invocado	APROBADO	03/11/2026 18:26	08/11/2026 22:11	feat(admin): implementar desactivacion de patrullas verificadoras HU-85
CP-H85-WEB-10	Bloqueo de cierre accidental del modal mientras se procesa la petición asíncrona (desactivando = true)	Robustez / UX	UI / Modal	Media	Petición DELETE /api/patrullas/:id en vuelo	Intentar cerrar con botón "Cancelar", "X" o tecla Escape durante la carga	Controles "Cancelar" y "X" deshabilitados, botón primario en estado loading con texto "Desactivando..." e ignorando Escape	El guardia if (desactivando) return; impide cerrar el diálogo hasta que finalice la transacción	APROBADO	03/11/2026 18:26	08/11/2026 22:11	feat(admin): implementar desactivacion de patrullas verificadoras HU-85
CP-H85-WEB-11	Presentación adaptativa del recuadro de liberación cuando la patrulla es pedestre (sin vehículo) o con 1 integrante	Funcional / Borde	UI / Modal	Media	Patrulla con vehiculo: null e integrantes: [{ id: 'p1', nombre: 'Juan Brigadista' }]	Apertura de PatrullaDesactivarModal	Muestra "Sin vehículo asignado (no aplica liberación)." y singular "1 funcionario quedará liberado a disponibilidad..."	Textos condicionales en singular y sin vehículo renderizados correctamente sin valores undefined	APROBADO	03/11/2026 18:26	08/11/2026 22:11	feat(admin): implementar desactivacion de patrullas verificadoras HU-85
CP-H85-WEB-12	Validación de ID vacío y manejo de errores HTTP (200, 401, 403, 404, 409, 500) en patrullasService.desactivar	Pruebas Unitarias	Service / DAL	Alta	Suite src/services/__tests__/patrullasService.test.ts en Vitest	npx vitest run src/services/__tests__/patrullasService.test.ts	26/26 pruebas unitarias del servicio aprobadas incluyendo los 8 escenarios de desactivar	26 tests aprobados en 27ms verificando método DELETE, headers y mapeo de respuestas	APROBADO	03/11/2026 18:26	08/11/2026 22:11	fix(patrullas): subsanar defectos de auditoria QA en desactivacion de patrullas (HU-85)
CP-H85-WEB-13	Suite de pruebas unitarias de componente PatrullaDesactivarModal.test.tsx en Vitest	Pruebas Unitarias	UI / Componente	Alta	Suite src/components/admin/patrullas/__tests__/PatrullaDesactivarModal.test.tsx	npx vitest run src/components/admin/patrullas/__tests__/PatrullaDesactivarModal.test.tsx	10/10 pruebas unitarias aprobadas (renderizado nulo, SENAPRED, bloqueo en todos los estados operativos, 200 OK, 409, 404, limpieza reactiva, 403 y cancelar)	10 tests aprobados en 322ms	APROBADO	03/11/2026 18:26	08/11/2026 22:11	fix(patrullas): subsanar defectos de auditoria QA en desactivacion de patrullas (HU-85)
CP-H85-WEB-14	Suite de pruebas de integración de vista AdminPatrullasClient.test.tsx y hook usePatrullas.test.ts en Vitest	Pruebas Integración	UI / Vista y Hook	Alta	Suites AdminPatrullasClient.test.tsx y usePatrullas.test.ts	npx vitest run src/components/admin/patrullas/__tests__/AdminPatrullasClient.test.tsx src/hooks/__tests__/usePatrullas.test.ts	12/12 pruebas en AdminPatrullasClient y 7/7 en usePatrullas aprobadas	19 tests aprobados verificando RBAC Fail-Closed, bloqueo operativo y evento Socket patrulla:desactivada	APROBADO	03/11/2026 18:26	08/11/2026 22:11	fix(patrullas): subsanar defectos de auditoria QA en desactivacion de patrullas (HU-85)
CP-H85-WEB-15	Cumplimiento de guía visual municipal (GEMINI.md) y documentación técnica (docs/api/ y docs/manuals/)	Estándar / Docs	UI / Documentación	Media	Inspección de PatrullaDesactivarModal.module.css, docs/api/recursos-y-personal.md y docs/manuals/H85-desactivar-patrulla.md	Verificación de tokens CSS (--radius-none, --color-primary-teal-dark, --color-danger), Heading, Button y manual H85	Esquinas rectas 0px, paleta oficial de Valdivia, sin emojis, y documentación de API y manual de usuario presentes	Estilos planos conformes al diseño institucional y documentos incorporados en el repositorio	APROBADO	03/11/2026 18:26	08/11/2026 22:11	fix(admin): corregir propiedad max-width y ajustar ancho maximo a 520px en PatrullaDesactivarModal
```

---

## 5. Guía de Ejecución y Replicabilidad Paso a Paso (Evidencias de Re-Test)

### 5.1 Ejecución de Pruebas Unitarias y de Integración con Vitest

**Comando general para las suites de HU-85:**
```bash
npx vitest run src/services/__tests__/patrullasService.test.ts src/components/admin/patrullas/__tests__/PatrullaDesactivarModal.test.tsx src/components/admin/patrullas/__tests__/AdminPatrullasClient.test.tsx src/hooks/__tests__/usePatrullas.test.ts
```

**Comandos individuales por caso de prueba (`npm test -- -t "..."`):**
```bash
# Verificación BUG-H85-WEB-01: Bloqueo preventivo ante todos los estados distintos de DISPONIBLE y deshabilitación tras 409
npm test -- src/components/admin/patrullas/__tests__/PatrullaDesactivarModal.test.tsx -t "BUG-H85-WEB-01"

# Verificación BUG-H85-WEB-02: Ausencia de DEFAULT_ENCARGADO_ID por defecto, manejo de 401 y lectura de mensaje 403
npm test -- src/services/__tests__/patrullasService.test.ts -t "BUG-H85-WEB-02"

# Verificación BUG-H85-WEB-02 en UI: Política RBAC Fail-Closed sin permiso recursos:eliminar
npm test -- src/components/admin/patrullas/__tests__/AdminPatrullasClient.test.tsx -t "BUG-H85-WEB-02"

# Verificación BUG-H85-WEB-03: Filtrado optimista y decremento de meta.total ante evento Socket patrulla:desactivada
npm test -- src/hooks/__tests__/usePatrullas.test.ts -t "BUG-H85-WEB-03"

# Verificación BUG-H85-WEB-05: Limpieza reactiva de errores al cambiar patrulla y bloqueo ante 404 Not Found
npm test -- src/components/admin/patrullas/__tests__/PatrullaDesactivarModal.test.tsx -t "BUG-H85-WEB-05"
```

**Evidencia real de ejecución en consola (Re-Test):**
```text
 RUN  v3.2.7 /home/ds2fery/Documentos/Proyecto/sgrai-uach/web

 ✓ src/services/__tests__/patrullasService.test.ts (26 tests) 27ms
 ✓ src/hooks/__tests__/usePatrullas.test.ts (7 tests) 97ms
 ✓ src/components/admin/patrullas/__tests__/PatrullaDesactivarModal.test.tsx (10 tests) 322ms
 ✓ src/components/admin/patrullas/__tests__/AdminPatrullasClient.test.tsx (12 tests) 966ms

 Test Files  4 passed (4)
      Tests  55 passed (55)
   Duration  2.75s
```

---

### 5.2 Análisis Estático de Código (ESLint) y Chequeo de Tipos (TypeScript)

**Comando ejecutado:**
```bash
npm run lint && npx tsc --noEmit
```

**Evidencia real obtenida en Re-Test:**
```text
✖ 11 problems (0 errors, 11 warnings)
Exit code: 0 (0 errores de compilación TypeScript y 0 warnings en usePatrullas.ts, PatrullaDesactivarModal.tsx y patrullasService.ts)
```

---

### 5.3 Pruebas de Contrato HTTP/JSON con cURL (`DELETE /api/patrullas/{id}`)

#### Escenario A: Desactivación Exitosa de Patrulla Disponible y Liberación de Recursos (`200 OK`)

```bash
curl -i -X DELETE "http://localhost:3001/api/patrullas/f1000000-0000-4000-8000-000000000001" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN_JWT_ADMIN>" \
  -H "x-user-id: 00000000-0000-4000-8000-000000000001"
```

**Respuesta HTTP/JSON:**
```json
{
  "message": "Patrulla verificadora desactivada exitosamente.",
  "data": {
    "id": "f1000000-0000-4000-8000-000000000001",
    "codigo": "PV-COSTA-01",
    "nombre": "Patrulla Costa 01",
    "estado": "NO_DISPONIBLE",
    "activo": false,
    "eliminadoEn": "2026-11-08T22:10:00.000Z",
    "eliminadoPorId": "00000000-0000-4000-8000-000000000001",
    "vehiculoLiberadoId": "v1000000-0000-4000-8000-000000000001",
    "personalLiberadoIds": [
      "b1000000-0000-4000-8000-000000000001",
      "b1000000-0000-4000-8000-000000000002"
    ]
  }
}
```

#### Escenario B: Rechazo por Patrulla en Estado `EN_VERIFICACION` o con Misiones Activas (`409 Conflict`)

```bash
curl -i -X DELETE "http://localhost:3001/api/patrullas/f1000000-0000-4000-8000-000000000002" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN_JWT_ADMIN>" \
  -H "x-user-id: 00000000-0000-4000-8000-000000000001"
```

**Respuesta HTTP/JSON:**
```json
{
  "message": "No es posible desactivar la patrulla verificadora 'Patrulla Sur Operativa' porque se encuentra actualmente en terreno en estado 'EN_VERIFICACION'."
}
```

#### Escenario C: Rechazo por Falta de Privilegios RBAC sin Permiso `recursos:eliminar` (`403 Forbidden`)

```bash
curl -i -X DELETE "http://localhost:3001/api/patrullas/f1000000-0000-4000-8000-000000000001" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN_JWT_CALL_CENTER>" \
  -H "x-user-id: 00000000-0000-4000-8000-000000000004"
```

**Respuesta HTTP/JSON:**
```json
{
  "message": "No cuenta con los permisos necesarios para ejecutar esta operación administrativa."
}
```

---

## 6. Matriz de Trazabilidad de Criterios de Aceptación (CA)

| Criterio de Aceptación (CA) | Casos Asociados | Estado QA | Observaciones Técnicas |
|---|---|:---:|---|
| **CA-1:** En el panel de administración, debe proveerse la acción 'Desactivar Patrulla'. | `CP-H85-WEB-01`, `CP-H85-WEB-02`, `CP-H85-WEB-03`, `BUG-H85-WEB-02` | 🟢 **CUMPLIDO** | Los botones se renderizan en `PatrullaCard` y `PatrullaDetalleDrawer` bajo política RBAC *Fail-Closed* (`recursos:eliminar` o rol `ADMIN`), sin suplantar `x-user-id` con `DEFAULT_ENCARGADO_ID`. |
| **CA-2:** Modal de confirmación advirtiendo sobre el impacto de la acción. | `CP-H85-WEB-04`, `CP-H85-WEB-09`, `CP-H85-WEB-10`, `CP-H85-WEB-11`, `BUG-H85-WEB-05` | 🟢 **CUMPLIDO** | `PatrullaDesactivarModal` exhibe el impacto de la baja lógica, los recursos a liberar y la nota de auditoría SENAPRED (§3.7), limpiando reactivamente errores previos al cambiar de patrulla. |
| **CA-3:** La API debe rechazar la baja con `409 Conflict` si la patrulla se encuentra en estado `EN_VERIFICACION` o posee misiones activas. | `CP-H85-WEB-05`, `CP-H85-WEB-07`, `CP-H85-WEB-12`, `BUG-H85-WEB-01` | 🟢 **CUMPLIDO** | Se bloquea preventivamente todo estado distinto de `DISPONIBLE` (`EN_VERIFICACION`, `EN_MISION`, `EN_PREVENCION`, `EN_RECUPERACION`, `NO_DISPONIBLE`) y ante un `409 Conflict` concurrente el modal deshabilita inmediatamente el botón de confirmación. |
| **CA-4:** Si no posee misiones activas, se aplica baja lógica: `activo = false` y `eliminado_en = CURRENT_TIMESTAMP`. | `CP-H85-WEB-06`, `CP-H85-WEB-12`, `BUG-H85-WEB-03`, `BUG-H85-WEB-04` | 🟢 **CUMPLIDO** | El flujo `200 OK` ejecuta la baja lógica, sincroniza la lista y `meta.total` en tiempo real vía Socket (`patrulla:desactivada`), y los tipos están alineados con `src/types/api-generated.d.ts`. |
| **CA-5:** El vehículo y personal asignados deben quedar liberados a disponibilidad en el inventario comunal. | `CP-H85-WEB-04`, `CP-H85-WEB-06`, `CP-H85-WEB-11`, `CP-H85-WEB-12` | 🟢 **CUMPLIDO** | El modal detalla explícitamente el vehículo institucional y la dotación de funcionarios que retornan a disponibilidad comunal y el servicio procesa `vehiculoLiberadoId` y `personalLiberadoIds`. |
