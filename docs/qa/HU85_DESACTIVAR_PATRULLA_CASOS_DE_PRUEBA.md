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
>  
> **Fecha de Auditoría QA:** 03 de Noviembre de 2026.  
> **Estado de Certificación:** 🔴 **OBSERVADO / CAMBIOS SOLICITADOS EN CODE REVIEW (15/20 CASOS APROBADOS — 5 DEFECTOS ABIERTOS)**.

---

## 1. Resumen Ejecutivo de Pruebas de Frontend

| Métrica | Resultado | Observaciones |
|---|:---:|---|
| **Total de Casos Evaluados en Matriz** | **20** | 5 Defectos Detectados (`BUG-H85-WEB-01` a `BUG-H85-WEB-05`) + 15 Casos Funcionales/Técnicos |
| **Casos Aprobados (Passed)** | **15** | Flujos base de visualización, apertura de modal, baja 200 OK, cancelación y suites unitarias base |
| **Defectos Abiertos / Fallidos (Bugs)** | **5** | 1 Crítico, 2 Altos y 2 Medios pendientes de corrección para Re-Test |
| **Casos Bloqueados (Blocked)** | **0** | Sin bloqueos de infraestructura local |
| **Tasa de Aprobación Actual (% Pass)** | **75.0%** | Requiere resolución de los 5 defectos abiertos para alcanzar el 100% de certificación |
| **Análisis Estático de Código (`npm run lint`)** | 🟡 **0 errores / 17 warnings** | Incluye advertencia `react-hooks/exhaustive-deps` en `src/hooks/usePatrullas.ts:237` (`BUG-H85-WEB-03`) |
| **Chequeo de Tipos Estáticos (`npx tsc --noEmit`)** | 🟢 **0 errores** | Compilación TypeScript exitosa, pero con divergencia manual respecto al esquema OpenAPI (`BUG-H85-WEB-04`) |
| **Suite Automatizada del Módulo (Vitest)** | 🟢 **40/40 tests pass** | `patrullasService.test.ts` (23), `PatrullaDesactivarModal.test.tsx` (7), `AdminPatrullasClient.test.tsx` (10) |
| **Cumplimiento Guía Visual Municipal (`GEMINI.md`)** | 🟢 **100%** | Uso de `Heading`, `Button`, tokens institucionales, `border-radius: 0px` e iconografía `lucide-react` |

---

## 2. Registro Técnico de Defectos Detectados en Auditoría Forense

Durante la inspección estática y funcional del código en la rama `feature/H85-desactivar-patrulla`, se identificaron **5 defectos reales** que deben ser subsanados antes de aprobar la integración hacia `develop`:

| ID Defecto | Título y Descripción Técnica del Defecto | Severidad | Archivo(s) Afectado(s) | Fecha Hallazgo | Estado | Fecha Re-Test | Solución / Commit |
|---|---|:---:|---|:---:|:---:|:---:|---|
| `BUG-H85-WEB-01` | **Falla de bloqueo reactivo ante conflicto concurrente `409 Conflict` y omisión de estados tácticos activos (`EN_MISION`, `EN_PREVENCION`, `EN_RECUPERACION`):** En `PatrullaDesactivarModal.tsx` (línea 258), cuando la API responde `409 Conflict` (`esConflicto = true`), el botón destructivo `"Sí, Desactivar Patrulla"` evalúa únicamente `disabled={desactivando || estaBloqueadaPorOperacion}` sin incluir `esConflicto` ni refrescar la lista de fondo, permitiendo reintentos infinitos sobre una unidad en terreno. Además, en `PatrullaDesactivarModal.tsx` (línea 68), `PatrullaCard.tsx` (línea 89) y `PatrullaDetalleDrawer.tsx` (línea 104), la condición `estaBloqueada` solo evalúa `patrulla.estado === 'EN_VERIFICACION' || Boolean(patrulla.misionActiva)`, dejando habilitado el botón de baja si la patrulla está en estado `EN_MISION`, `EN_PREVENCION` o `EN_RECUPERACION` sin objeto `misionActiva` hidratado, y `AdminPatrullasClient.tsx` mantiene copias estáticas en `patrullaADesactivar` y `patrullaADetalle` que no reaccionan a eventos Socket en vivo. | Crítica | `src/components/admin/patrullas/PatrullaDesactivarModal.tsx`, `src/components/mando/patrullas/PatrullaCard.tsx`, `src/components/admin/patrullas/PatrullaDetalleDrawer.tsx`, `src/components/admin/patrullas/AdminPatrullasClient.tsx` | 03/11/2026 18:25 | `ABIERTO` | (Pendiente) | Pendiente (Rechazado en Code Review) |
| `BUG-H85-WEB-02` | **Política RBAC *Fail-Open* en `puedeDesactivar`, fallback `DEFAULT_ENCARGADO_ID` en baja lógica y omisión de manejo `401 Unauthorized`:** En `AdminPatrullasClient.tsx` (líneas 54-59), la variable `puedeDesactivar` retorna `: true` por defecto cuando `auth?.usuario` y `session?.usuarioActivo` son nulos. Adicionalmente, `PatrullaDesactivarModal.tsx` (línea 28) y `patrullasService.desactivar` (línea 418) asignan por defecto `DEFAULT_ENCARGADO_ID` (`00000000-0000-4000-8000-000000000003`, correspondiente al rol Encargado de Operaciones) como `x-user-id` en una operación exclusiva de Administrador (`recursos:eliminar`), distorsionando la auditoría `eliminado_por_id` o causando rechazos `403`. Por último, `patrullasService.desactivar` no maneja específicamente respuestas `401 Unauthorized` e ignora el `json.message` del backend en respuestas `403 Forbidden` (líneas 470-478). | Alta | `src/components/admin/patrullas/AdminPatrullasClient.tsx`, `src/components/admin/patrullas/PatrullaDesactivarModal.tsx`, `src/services/patrullasService.ts` | 03/11/2026 18:26 | `ABIERTO` | (Pendiente) | Pendiente (Rechazado en Code Review) |
| `BUG-H85-WEB-03` | ***Stale Closure* en listener WebSocket (`react-hooks/exhaustive-deps`), doble petición `GET /api/patrullas` redundante y desincronización de `meta.total`:** En `src/hooks/usePatrullas.ts` (líneas 210-216 y 237), el efecto de suscripción Socket invoca `consultar(filtrosRef.current)` dentro de `handlePatrullaDesactivada` pero omite `consultar` en su arreglo de dependencias (`[enabled]`), generando una advertencia en `npm run lint` y capturando un `userId` obsoleto cuando cambia la sesión activa. Asimismo, al desactivar localmente una patrulla, se ejecutan dos peticiones `GET /api/patrullas` duplicadas (una por `recargar()` en `AdminPatrullasClient.tsx` línea 117 y otra por el evento Socket `patrulla:desactivada` en `usePatrullas.ts` línea 215), y la actualización optimista en `handlePatrullaDesactivada` no decrementa `meta.total`. | Alta | `src/hooks/usePatrullas.ts`, `src/components/admin/patrullas/AdminPatrullasClient.tsx` | 03/11/2026 18:27 | `ABIERTO` | (Pendiente) | Pendiente (Rechazado en Code Review) |
| `BUG-H85-WEB-04` | **Discrepancia de contrato entre `DesactivarPatrullaDataDTO` manual y `DesactivarPatrullaResponseSchema` de `sgrai-api`, y ausencia de rutas en `api-generated.d.ts`:** En `src/types/patrullas.ts` (líneas 191-201), la interfaz manual `DesactivarPatrullaDataDTO` declara `codigo: string` y `eliminadoPorId: string` como campos estrictamente obligatorios y no anulables, mientras que el esquema real de `sgrai-api` (`patrulla.schema.ts` líneas 356 y 361) los define como `nullable().optional()` y define `personalLiberadoIds: string[]` como obligatorio. Tampoco se han sincronizado los endpoints `/api/patrullas` y `/api/patrullas/{id}` en `src/types/api-generated.d.ts` conforme al apartado §4 de `GEMINI.md`. | Media | `src/types/patrullas.ts`, `src/types/api-generated.d.ts` | 03/11/2026 18:28 | `ABIERTO` | (Pendiente) | Pendiente (Rechazado en Code Review) |
| `BUG-H85-WEB-05` | **Persistencia de estado de error entre aperturas en `PatrullaDesactivarModal` y falta de refresco de grilla ante `404 Not Found`:** En `PatrullaDesactivarModal.tsx` (líneas 32-41 y 80-107), los estados `errorMensaje` y `esConflicto` solo se limpian dentro de `handleCerrar`, careciendo de un `useEffect` que los reinicie cuando cambia `patrulla?.id` o `isOpen` desde el componente padre. Además, cuando el backend retorna `404 Not Found` (patrulla ya dada de baja previamente por otro administrador), el modal no bloquea el botón de confirmación ni refresca la grilla de fondo como estipula el manual `docs/manuals/H85-desactivar-patrulla.md` (sección 5). | Media | `src/components/admin/patrullas/PatrullaDesactivarModal.tsx` | 03/11/2026 18:29 | `ABIERTO` | (Pendiente) | Pendiente (Rechazado en Code Review) |

---

## 3. Matriz Consolidada de Casos de Prueba (13 Columnas)

| ID Caso | Título del Caso de Prueba | Tipo de Prueba | Nivel | Prioridad | Precondición | Datos de Prueba (Payload / Headers / Query) | Resultado Esperado | Resultado Obtenido | Estado | Fecha / Hora Ejecución | Fecha / Hora Re-Test | Solución / Commit |
|---|---|---|---|---|---|---|---|---|:---:|:---:|:---:|---|
| `BUG-H85-WEB-01` | Bloqueo reactivo del botón confirmar ante 409 Conflict concurrente y cobertura de todos los estados operativos en terreno | Concurrencia / Negocio | UI / Modal y Card | Crítica | Modal abierto sobre patrulla DISPONIBLE que pasa a misión activa concurrentemente o patrulla en estado EN_MISION | Respuesta HTTP 409 en `DELETE /api/patrullas/f1000000-0000-4000-8000-000000000001` o patrulla con `estado: 'EN_MISION'` y `misionActiva: null` | Al recibir 409 Conflict se deshabilita el botón "Sí, Desactivar Patrulla" y se refresca la lista; estados EN_MISION, EN_PREVENCION y EN_RECUPERACION bloquean la baja | El botón confirmar sigue habilitado tras recibir 409 (`disabled={desactivando \|\| estaBloqueadaPorOperacion}`) y `estaBloqueada` solo evalúa `EN_VERIFICACION` | **ABIERTO** | 03/11/2026 18:25 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| `BUG-H85-WEB-02` | Control RBAC Fail-Closed sin sesión activa, trazabilidad de usuario real sin DEFAULT_ENCARGADO_ID y manejo de 401/403 | Seguridad / RBAC | UI / Service DAL | Alta | Contexto sin sesión hidratada o petición DELETE con token expirado (401) o mensaje específico de 403 | `auth.usuario = null`, `session.usuarioActivo = null`; respuesta HTTP 401 / 403 en `DELETE /api/patrullas/{id}` | `puedeDesactivar` evalúa `false` por defecto; no se suplanta `x-user-id` con `DEFAULT_ENCARGADO_ID`; `patrullasService.desactivar` maneja 401 y preserva `json.message` en 403 | `puedeDesactivar` cae en `: true` cuando no hay sesión, inyecta `DEFAULT_ENCARGADO_ID` por defecto y descarta `json.message` en 403 | **ABIERTO** | 03/11/2026 18:26 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| `BUG-H85-WEB-03` | Dependencias de Hook en listener Socket patrulla:desactivada, eliminación de doble fetch y actualización de meta.total | Reactividad / Calidad | Hook / Socket.io | Alta | Ejecución de `npm run lint` y recepción de evento WebSocket `patrulla:desactivada` | Payload Socket `{ patrullaId: 'f1000000-0000-4000-8000-000000000001', nombre: 'Patrulla Costa 01' }` | 0 warnings de `react-hooks/exhaustive-deps` en `usePatrullas.ts`, actualización de `meta.total` y una única recarga controlada al desactivar | Warning de ESLint en `usePatrullas.ts:237` por omitir `consultar`, doble llamada a `GET /api/patrullas` y `meta.total` sin actualizar en filtro optimista | **ABIERTO** | 03/11/2026 18:27 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| `BUG-H85-WEB-04` | Alineación estricta de tipos DesactivarPatrullaDataDTO con el contrato Zod/OpenAPI del backend y api-generated.d.ts | Contrato API / Tipos | Types / OpenAPI | Media | Patrulla sin código opcional o baja con `eliminadoPorId: null` retornada por `sgrai-api` | `{ id: '...', codigo: null, eliminadoPorId: null, personalLiberadoIds: [] }` | `DesactivarPatrullaDataDTO` acepta `codigo: string \| null` y `eliminadoPorId: string \| null`, y `/api/patrullas/{id}` figura en `api-generated.d.ts` | `src/types/patrullas.ts` define `codigo: string` y `eliminadoPorId: string` como no anulables y `api-generated.d.ts` carece de los endpoints de patrullas | **ABIERTO** | 03/11/2026 18:28 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| `BUG-H85-WEB-05` | Limpieza reactiva de errores al cambiar de patrulla en PatrullaDesactivarModal y sincronización de grilla ante 404 Not Found | Usabilidad / Estado | UI / Modal | Media | Modal con error previo que se reabre con otra patrulla o recibe HTTP 404 por baja previa concurrente | Respuesta HTTP 404 `{ message: 'La patrulla verificadora ya ha sido desactivada.' }` | Al cambiar `patrulla.id` o `isOpen` se limpian `errorMensaje` y `esConflicto`; ante 404 se bloquea el reintento y se refresca el listado | No existe `useEffect` de limpieza al cambiar props y el error 404 deja el listado desactualizado con la patrulla eliminada aún en pantalla | **ABIERTO** | 03/11/2026 18:29 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| `CP-H85-WEB-01` | Visualización del botón "Desactivar" en tarjeta de patrulla (`PatrullaCard`) para perfil Administrador o permiso `recursos:eliminar` | Funcional / RBAC | UI / Componente | Alta | Usuario autenticado con permiso `recursos:eliminar` en `/gestion/admin/patrullas` | Patrulla `f1000000-0000-4000-8000-000000000001` en estado `DISPONIBLE` | Se renderiza el botón destructivo `btn-desactivar-patrulla-{id}` con ícono `Trash2` y etiqueta "Desactivar" | Botón renderizado y habilitado correctamente en la fila de acciones de la tarjeta | **APROBADO** | 03/11/2026 18:26 | - | feat(admin): implementar desactivacion de patrullas verificadoras HU-85 |
| `CP-H85-WEB-02` | Visualización del botón "Desactivar Patrulla" en el panel lateral de detalle (`PatrullaDetalleDrawer`) | Funcional / UI | UI / Drawer | Alta | Administrador abre la ficha técnica presionando "Ver Ficha" | Clic en `btn-ver-detalle-f1000000-0000-4000-8000-000000000001` | El pie del Drawer muestra el botón destructivo `btn-drawer-desactivar-patrulla` junto a "Editar Patrulla" | Botón "Desactivar Patrulla" visible en el footer del Drawer y conectado al modal de confirmación | **APROBADO** | 03/11/2026 18:26 | - | feat(admin): implementar desactivacion de patrullas verificadoras HU-85 |
| `CP-H85-WEB-03` | Ocultamiento de los controles de baja para perfiles operativos sin permiso `recursos:eliminar` | Seguridad / RBAC | UI / Permisos | Crítica | Usuario autenticado en sesión simulada con permisos `['recursos:leer', 'recursos:editar']` | Renderizado de `AdminPatrullasClient` con `puedeDesactivar = false` | No se renderiza el botón "Desactivar" en las tarjetas ni en el Drawer de detalle | Los botones de desactivación no existen en el DOM para usuarios con sesión activa sin el permiso requerido | **APROBADO** | 03/11/2026 18:26 | - | feat(admin): implementar desactivacion de patrullas verificadoras HU-85 |
| `CP-H85-WEB-04` | Apertura del modal `PatrullaDesactivarModal` con resumen de unidad, liberación de vehículo/personal y nota de auditoría SENAPRED | Funcional / UX | UI / Modal | Crítica | Patrulla `PV-COSTA-01` (`DISPONIBLE`) con vehículo `Camioneta 4x4 Navara` y 2 brigadistas | Clic en botón "Desactivar" | Modal exhibe nombre, código, delegación, líder, detalle de liberación de vehículo y 2 funcionarios, y nota de auditoría SENAPRED (§3.7) | Modal renderiza todos los bloques informativos con ancho máximo de 520px y estilo institucional plano | **APROBADO** | 03/11/2026 18:26 | - | style(admin): simplificar iconografia del modal y resumir nota de auditoria |
| `CP-H85-WEB-05` | Bloqueo preventivo en interfaz (Card, Drawer y Modal) cuando la patrulla se encuentra en estado `EN_VERIFICACION` | Regla de Negocio | UI / Validación | Crítica | Patrulla `PV-SUR-02` en estado `EN_VERIFICACION` atendiendo misión `MIS-2026-002` | Inspección de `btn-desactivar-patrulla-{id}` y apertura de `PatrullaDesactivarModal` | Botón en tarjeta y Drawer en estado `disabled` con tooltip explicativo; en modal se muestra banner `bloqueo-operativo-alerta` y botón confirmar deshabilitado | Controles deshabilitados con `aria-label` reglamentario y alerta naranja con código de misión en curso | **APROBADO** | 03/11/2026 18:26 | - | feat(admin): implementar desactivacion de patrullas verificadoras HU-85 |
| `CP-H85-WEB-06` | Ejecución exitosa de baja lógica (`DELETE /api/patrullas/:id` -> `200 OK`), cierre de modal y notificación Toast | Integración / Flujo | UI / Service | Crítica | Patrulla `DISPONIBLE` sin misiones activas; usuario Administrador confirma la acción | Clic en `btn-confirmar-desactivar-patrulla` -> `DELETE /api/patrullas/f1000000-0000-4000-8000-000000000001` | Se invoca `patrullasService.desactivar`, se cierra el modal, se emite Toast verde de éxito y se refresca el listado | Petición DELETE enviada con cabeceras de autorización, modal cerrado y callback `onPatrullaDesactivada` ejecutado | **APROBADO** | 03/11/2026 18:26 | - | feat(admin): implementar desactivacion de patrullas verificadoras HU-85 |
| `CP-H85-WEB-07` | Despliegue de alerta `InlineNotice` de advertencia en el modal cuando el backend rechaza con `409 Conflict` | Manejo de Errores | UI / Modal | Alta | `patrullasService.desactivar` retorna `{ exito: false, esConflicto: true, codigoError: 409, mensaje: '...' }` | Clic en "Sí, Desactivar Patrulla" | El modal permanece abierto y despliega `InlineNotice` con variante `warning` y título `"Conflicto Operativo (HTTP 409)"` | Se renderiza el banner de conflicto con el motivo exacto retornado por el servidor | **APROBADO** | 03/11/2026 18:26 | - | feat(admin): implementar desactivacion de patrullas verificadoras HU-85 |
| `CP-H85-WEB-08` | Despliegue de alerta de error en el modal cuando el backend rechaza por permisos con `403 Forbidden` | Seguridad / Errores | UI / Modal | Alta | `patrullasService.desactivar` retorna `{ exito: false, esForbidden: true, codigoError: 403 }` | Clic en "Sí, Desactivar Patrulla" sin privilegios en backend | El modal permanece abierto y muestra `InlineNotice` de variante `error` indicando la falta del permiso `recursos:eliminar` | Alerta roja desplegada informando la restricción de privilegios | **APROBADO** | 03/11/2026 18:26 | - | feat(admin): implementar desactivacion de patrullas verificadoras HU-85 |
| `CP-H85-WEB-09` | Cancelación segura de la baja lógica mediante botón "Cancelar", botón "X" o tecla `Escape` | Usabilidad / A11y | UI / Modal | Media | `PatrullaDesactivarModal` abierto y sin petición en curso (`desactivando = false`) | Clic en `btn-cancelar-desactivar-patrulla`, clic en backdrop o pulsación de tecla `Escape` | El modal se cierra inmediatamente e invoca `onClose` sin emitir ninguna petición `DELETE` | Modal cerrado limpiamente y `patrullasService.desactivar` no es invocado | **APROBADO** | 03/11/2026 18:26 | - | feat(admin): implementar desactivacion de patrullas verificadoras HU-85 |
| `CP-H85-WEB-10` | Bloqueo de cierre accidental del modal mientras se procesa la petición asíncrona (`desactivando = true`) | Robustez / UX | UI / Modal | Media | Petición `DELETE /api/patrullas/:id` en vuelo | Intentar cerrar con botón "Cancelar", "X" o tecla `Escape` durante la carga | Controles "Cancelar" y "X" deshabilitados, botón primario en estado `loading` con texto `"Desactivando..."` e ignorando `Escape` | El guardia `if (desactivando) return;` impide cerrar el diálogo hasta que finalice la transacción | **APROBADO** | 03/11/2026 18:26 | - | feat(admin): implementar desactivacion de patrullas verificadoras HU-85 |
| `CP-H85-WEB-11` | Presentación adaptativa del recuadro de liberación cuando la patrulla es pedestre (sin vehículo) o con 1 integrante | Funcional / Borde | UI / Modal | Media | Patrulla con `vehiculo: null` e `integrantes: [{ id: 'p1', nombre: 'Juan Brigadista' }]` | Apertura de `PatrullaDesactivarModal` | Muestra `"Sin vehículo asignado (no aplica liberación)."` y singular `"1 funcionario quedará liberado a disponibilidad..."` | Textos condicionales en singular y sin vehículo renderizados correctamente sin valores `undefined` | **APROBADO** | 03/11/2026 18:26 | - | feat(admin): implementar desactivacion de patrullas verificadoras HU-85 |
| `CP-H85-WEB-12` | Validación de ID vacío y manejo de errores HTTP (200, 404, 409, 403, 500) en `patrullasService.desactivar` | Pruebas Unitarias | Service / DAL | Alta | Suite `src/services/__tests__/patrullasService.test.ts` en Vitest | `npx vitest run src/services/__tests__/patrullasService.test.ts` | 23/23 pruebas unitarias del servicio aprobadas incluyendo los 5 escenarios de `desactivar` | 23 tests aprobados en 27ms verificando método `DELETE`, headers y mapeo de respuestas | **APROBADO** | 03/11/2026 18:26 | - | feat(admin): implementar desactivacion de patrullas verificadoras HU-85 |
| `CP-H85-WEB-13` | Suite de pruebas unitarias de componente `PatrullaDesactivarModal.test.tsx` en Vitest | Pruebas Unitarias | UI / Componente | Alta | Suite `src/components/admin/patrullas/__tests__/PatrullaDesactivarModal.test.tsx` | `npx vitest run src/components/admin/patrullas/__tests__/PatrullaDesactivarModal.test.tsx` | 7/7 pruebas unitarias aprobadas (renderizado nulo, advertencias SENAPRED, bloqueo operativo, 200 OK, 409, 403 y cancelar) | 7 tests aprobados en 257ms | **APROBADO** | 03/11/2026 18:26 | - | style(admin): simplificar iconografia del modal y resumir nota de auditoria |
| `CP-H85-WEB-14` | Suite de pruebas de integración de vista `AdminPatrullasClient.test.tsx` en Vitest | Pruebas Integración | UI / Vista | Alta | Suite `src/components/admin/patrullas/__tests__/AdminPatrullasClient.test.tsx` | `npx vitest run src/components/admin/patrullas/__tests__/AdminPatrullasClient.test.tsx` | 10/10 pruebas aprobadas incluyendo apertura del modal de desactivación con `recursos:eliminar` y bloqueo en `EN_VERIFICACION` | 10 tests aprobados en 863ms | **APROBADO** | 03/11/2026 18:26 | - | feat(admin): implementar desactivacion de patrullas verificadoras HU-85 |
| `CP-H85-WEB-15` | Cumplimiento de guía visual municipal (`GEMINI.md`) y documentación técnica (`docs/api/` y `docs/manuals/`) | Estándar / Docs | UI / Documentación | Media | Inspección de `PatrullaDesactivarModal.module.css`, `docs/api/recursos-y-personal.md` y `docs/manuals/H85-desactivar-patrulla.md` | Verificación de tokens CSS (`--radius-none`, `--color-primary-teal-dark`, `--color-danger`), `Heading`, `Button` y manual H85 | Esquinas rectas `0px`, paleta oficial de Valdivia, sin emojis, y documentación de API y manual de usuario presentes | Estilos planos conformes al diseño institucional y documentos incorporados en el repositorio | **APROBADO** | 03/11/2026 18:26 | - | fix(admin): corregir propiedad max-width y ajustar ancho maximo a 520px en PatrullaDesactivarModal |

---

## 4. Bloque TSV para Hoja de Cálculo

```tsv
ID Caso	Título del Caso de Prueba	Tipo de Prueba	Nivel	Prioridad	Precondición	Datos de Prueba (Payload / Headers / Query)	Resultado Esperado	Resultado Obtenido	Estado	Fecha / Hora Ejecución	Fecha / Hora Re-Test	Solución / Commit
BUG-H85-WEB-01	Bloqueo reactivo del botón confirmar ante 409 Conflict concurrente y cobertura de todos los estados operativos en terreno	Concurrencia / Negocio	UI / Modal y Card	Crítica	Modal abierto sobre patrulla DISPONIBLE que pasa a misión activa concurrentemente o patrulla en estado EN_MISION	Respuesta HTTP 409 en DELETE /api/patrullas/f1000000-0000-4000-8000-000000000001 o patrulla con estado: 'EN_MISION' y misionActiva: null	Al recibir 409 Conflict se deshabilita el botón "Sí, Desactivar Patrulla" y se refresca la lista; estados EN_MISION, EN_PREVENCION y EN_RECUPERACION bloquean la baja	El botón confirmar sigue habilitado tras recibir 409 (disabled={desactivando || estaBloqueadaPorOperacion}) y estaBloqueada solo evalúa EN_VERIFICACION	ABIERTO	03/11/2026 18:25	(Pendiente)	Pendiente (Rechazado en Code Review)
BUG-H85-WEB-02	Control RBAC Fail-Closed sin sesión activa, trazabilidad de usuario real sin DEFAULT_ENCARGADO_ID y manejo de 401/403	Seguridad / RBAC	UI / Service DAL	Alta	Contexto sin sesión hidratada o petición DELETE con token expirado (401) o mensaje específico de 403	auth.usuario = null, session.usuarioActivo = null; respuesta HTTP 401 / 403 en DELETE /api/patrullas/{id}	puedeDesactivar evalúa false por defecto; no se suplanta x-user-id con DEFAULT_ENCARGADO_ID; patrullasService.desactivar maneja 401 y preserva json.message en 403	puedeDesactivar cae en : true cuando no hay sesión, inyecta DEFAULT_ENCARGADO_ID por defecto y descarta json.message en 403	ABIERTO	03/11/2026 18:26	(Pendiente)	Pendiente (Rechazado en Code Review)
BUG-H85-WEB-03	Dependencias de Hook en listener Socket patrulla:desactivada, eliminación de doble fetch y actualización de meta.total	Reactividad / Calidad	Hook / Socket.io	Alta	Ejecución de npm run lint y recepción de evento WebSocket patrulla:desactivada	Payload Socket { patrullaId: 'f1000000-0000-4000-8000-000000000001', nombre: 'Patrulla Costa 01' }	0 warnings de react-hooks/exhaustive-deps en usePatrullas.ts, actualización de meta.total y una única recarga controlada al desactivar	Warning de ESLint en usePatrullas.ts:237 por omitir consultar, doble llamada a GET /api/patrullas y meta.total sin actualizar en filtro optimista	ABIERTO	03/11/2026 18:27	(Pendiente)	Pendiente (Rechazado en Code Review)
BUG-H85-WEB-04	Alineación estricta de tipos DesactivarPatrullaDataDTO con el contrato Zod/OpenAPI del backend y api-generated.d.ts	Contrato API / Tipos	Types / OpenAPI	Media	Patrulla sin código opcional o baja con eliminadoPorId: null retornada por sgrai-api	{ id: '...', codigo: null, eliminadoPorId: null, personalLiberadoIds: [] }	DesactivarPatrullaDataDTO acepta codigo: string | null y eliminadoPorId: string | null, y /api/patrullas/{id} figura en api-generated.d.ts	src/types/patrullas.ts define codigo: string y eliminadoPorId: string como no anulables y api-generated.d.ts carece de los endpoints de patrullas	ABIERTO	03/11/2026 18:28	(Pendiente)	Pendiente (Rechazado en Code Review)
BUG-H85-WEB-05	Limpieza reactiva de errores al cambiar de patrulla en PatrullaDesactivarModal y sincronización de grilla ante 404 Not Found	Usabilidad / Estado	UI / Modal	Media	Modal con error previo que se reabre con otra patrulla o recibe HTTP 404 por baja previa concurrente	Respuesta HTTP 404 { message: 'La patrulla verificadora ya ha sido desactivada.' }	Al cambiar patrulla.id o isOpen se limpian errorMensaje y esConflicto; ante 404 se bloquea el reintento y se refresca el listado	No existe useEffect de limpieza al cambiar props y el error 404 deja el listado desactualizado con la patrulla eliminada aún en pantalla	ABIERTO	03/11/2026 18:29	(Pendiente)	Pendiente (Rechazado en Code Review)
CP-H85-WEB-01	Visualización del botón "Desactivar" en tarjeta de patrulla (PatrullaCard) para perfil Administrador o permiso recursos:eliminar	Funcional / RBAC	UI / Componente	Alta	Usuario autenticado con permiso recursos:eliminar en /gestion/admin/patrullas	Patrulla f1000000-0000-4000-8000-000000000001 en estado DISPONIBLE	Se renderiza el botón destructivo btn-desactivar-patrulla-{id} con ícono Trash2 y etiqueta "Desactivar"	Botón renderizado y habilitado correctamente en la fila de acciones de la tarjeta	APROBADO	03/11/2026 18:26	-	feat(admin): implementar desactivacion de patrullas verificadoras HU-85
CP-H85-WEB-02	Visualización del botón "Desactivar Patrulla" en el panel lateral de detalle (PatrullaDetalleDrawer)	Funcional / UI	UI / Drawer	Alta	Administrador abre la ficha técnica presionando "Ver Ficha"	Clic en btn-ver-detalle-f1000000-0000-4000-8000-000000000001	El pie del Drawer muestra el botón destructivo btn-drawer-desactivar-patrulla junto a "Editar Patrulla"	Botón "Desactivar Patrulla" visible en el footer del Drawer y conectado al modal de confirmación	APROBADO	03/11/2026 18:26	-	feat(admin): implementar desactivacion de patrullas verificadoras HU-85
CP-H85-WEB-03	Ocultamiento de los controles de baja para perfiles operativos sin permiso recursos:eliminar	Seguridad / RBAC	UI / Permisos	Crítica	Usuario autenticado en sesión simulada con permisos ['recursos:leer', 'recursos:editar']	Renderizado de AdminPatrullasClient con puedeDesactivar = false	No se renderiza el botón "Desactivar" en las tarjetas ni en el Drawer de detalle	Los botones de desactivación no existen en el DOM para usuarios con sesión activa sin el permiso requerido	APROBADO	03/11/2026 18:26	-	feat(admin): implementar desactivacion de patrullas verificadoras HU-85
CP-H85-WEB-04	Apertura del modal PatrullaDesactivarModal con resumen de unidad, liberación de vehículo/personal y nota de auditoría SENAPRED	Funcional / UX	UI / Modal	Crítica	Patrulla PV-COSTA-01 (DISPONIBLE) con vehículo Camioneta 4x4 Navara y 2 brigadistas	Clic en botón "Desactivar"	Modal exhibe nombre, código, delegación, líder, detalle de liberación de vehículo y 2 funcionarios, y nota de auditoría SENAPRED (§3.7)	Modal renderiza todos los bloques informativos con ancho máximo de 520px y estilo institucional plano	APROBADO	03/11/2026 18:26	-	style(admin): simplificar iconografia del modal y resumir nota de auditoria
CP-H85-WEB-05	Bloqueo preventivo en interfaz (Card, Drawer y Modal) cuando la patrulla se encuentra en estado EN_VERIFICACION	Regla de Negocio	UI / Validación	Crítica	Patrulla PV-SUR-02 en estado EN_VERIFICACION atendiendo misión MIS-2026-002	Inspección de btn-desactivar-patrulla-{id} y apertura de PatrullaDesactivarModal	Botón en tarjeta y Drawer en estado disabled con tooltip explicativo; en modal se muestra banner bloqueo-operativo-alerta y botón confirmar deshabilitado	Controles deshabilitados con aria-label reglamentario y alerta naranja con código de misión en curso	APROBADO	03/11/2026 18:26	-	feat(admin): implementar desactivacion de patrullas verificadoras HU-85
CP-H85-WEB-06	Ejecución exitosa de baja lógica (DELETE /api/patrullas/:id -> 200 OK), cierre de modal y notificación Toast	Integración / Flujo	UI / Service	Crítica	Patrulla DISPONIBLE sin misiones activas; usuario Administrador confirma la acción	Clic en btn-confirmar-desactivar-patrulla -> DELETE /api/patrullas/f1000000-0000-4000-8000-000000000001	Se invoca patrullasService.desactivar, se cierra el modal, se emite Toast verde de éxito y se refresca el listado	Petición DELETE enviada con cabeceras de autorización, modal cerrado y callback onPatrullaDesactivada ejecutado	APROBADO	03/11/2026 18:26	-	feat(admin): implementar desactivacion de patrullas verificadoras HU-85
CP-H85-WEB-07	Despliegue de alerta InlineNotice de advertencia en el modal cuando el backend rechaza con 409 Conflict	Manejo de Errores	UI / Modal	Alta	patrullasService.desactivar retorna { exito: false, esConflicto: true, codigoError: 409, mensaje: '...' }	Clic en "Sí, Desactivar Patrulla"	El modal permanece abierto y despliega InlineNotice con variante warning y título "Conflicto Operativo (HTTP 409)"	Se renderiza el banner de conflicto con el motivo exacto retornado por el servidor	APROBADO	03/11/2026 18:26	-	feat(admin): implementar desactivacion de patrullas verificadoras HU-85
CP-H85-WEB-08	Despliegue de alerta de error en el modal cuando el backend rechaza por permisos con 403 Forbidden	Seguridad / Errores	UI / Modal	Alta	patrullasService.desactivar retorna { exito: false, esForbidden: true, codigoError: 403 }	Clic en "Sí, Desactivar Patrulla" sin privilegios en backend	El modal permanece abierto y muestra InlineNotice de variante error indicando la falta del permiso recursos:eliminar	Alerta roja desplegada informando la restricción de privilegios	APROBADO	03/11/2026 18:26	-	feat(admin): implementar desactivacion de patrullas verificadoras HU-85
CP-H85-WEB-09	Cancelación segura de la baja lógica mediante botón "Cancelar", botón "X" o tecla Escape	Usabilidad / A11y	UI / Modal	Media	PatrullaDesactivarModal abierto y sin petición en curso (desactivando = false)	Clic en btn-cancelar-desactivar-patrulla, clic en backdrop o pulsación de tecla Escape	El modal se cierra inmediatamente e invoca onClose sin emitir ninguna petición DELETE	Modal cerrado limpiamente y patrullasService.desactivar no es invocado	APROBADO	03/11/2026 18:26	-	feat(admin): implementar desactivacion de patrullas verificadoras HU-85
CP-H85-WEB-10	Bloqueo de cierre accidental del modal mientras se procesa la petición asíncrona (desactivando = true)	Robustez / UX	UI / Modal	Media	Petición DELETE /api/patrullas/:id en vuelo	Intentar cerrar con botón "Cancelar", "X" o tecla Escape durante la carga	Controles "Cancelar" y "X" deshabilitados, botón primario en estado loading con texto "Desactivando..." e ignorando Escape	El guardia if (desactivando) return; impide cerrar el diálogo hasta que finalice la transacción	APROBADO	03/11/2026 18:26	-	feat(admin): implementar desactivacion de patrullas verificadoras HU-85
CP-H85-WEB-11	Presentación adaptativa del recuadro de liberación cuando la patrulla es pedestre (sin vehículo) o con 1 integrante	Funcional / Borde	UI / Modal	Media	Patrulla con vehiculo: null e integrantes: [{ id: 'p1', nombre: 'Juan Brigadista' }]	Apertura de PatrullaDesactivarModal	Muestra "Sin vehículo asignado (no aplica liberación)." y singular "1 funcionario quedará liberado a disponibilidad..."	Textos condicionales en singular y sin vehículo renderizados correctamente sin valores undefined	APROBADO	03/11/2026 18:26	-	feat(admin): implementar desactivacion de patrullas verificadoras HU-85
CP-H85-WEB-12	Validación de ID vacío y manejo de errores HTTP (200, 404, 409, 403, 500) en patrullasService.desactivar	Pruebas Unitarias	Service / DAL	Alta	Suite src/services/__tests__/patrullasService.test.ts en Vitest	npx vitest run src/services/__tests__/patrullasService.test.ts	23/23 pruebas unitarias del servicio aprobadas incluyendo los 5 escenarios de desactivar	23 tests aprobados en 27ms verificando método DELETE, headers y mapeo de respuestas	APROBADO	03/11/2026 18:26	-	feat(admin): implementar desactivacion de patrullas verificadoras HU-85
CP-H85-WEB-13	Suite de pruebas unitarias de componente PatrullaDesactivarModal.test.tsx en Vitest	Pruebas Unitarias	UI / Componente	Alta	Suite src/components/admin/patrullas/__tests__/PatrullaDesactivarModal.test.tsx	npx vitest run src/components/admin/patrullas/__tests__/PatrullaDesactivarModal.test.tsx	7/7 pruebas unitarias aprobadas (renderizado nulo, advertencias SENAPRED, bloqueo operativo, 200 OK, 409, 403 y cancelar)	7 tests aprobados en 257ms	APROBADO	03/11/2026 18:26	-	style(admin): simplificar iconografia del modal y resumir nota de auditoria
CP-H85-WEB-14	Suite de pruebas de integración de vista AdminPatrullasClient.test.tsx en Vitest	Pruebas Integración	UI / Vista	Alta	Suite src/components/admin/patrullas/__tests__/AdminPatrullasClient.test.tsx	npx vitest run src/components/admin/patrullas/__tests__/AdminPatrullasClient.test.tsx	10/10 pruebas aprobadas incluyendo apertura del modal de desactivación con recursos:eliminar y bloqueo en EN_VERIFICACION	10 tests aprobados en 863ms	APROBADO	03/11/2026 18:26	-	feat(admin): implementar desactivacion de patrullas verificadoras HU-85
CP-H85-WEB-15	Cumplimiento de guía visual municipal (GEMINI.md) y documentación técnica (docs/api/ y docs/manuals/)	Estándar / Docs	UI / Documentación	Media	Inspección de PatrullaDesactivarModal.module.css, docs/api/recursos-y-personal.md y docs/manuals/H85-desactivar-patrulla.md	Verificación de tokens CSS (--radius-none, --color-primary-teal-dark, --color-danger), Heading, Button y manual H85	Esquinas rectas 0px, paleta oficial de Valdivia, sin emojis, y documentación de API y manual de usuario presentes	Estilos planos conformes al diseño institucional y documentos incorporados en el repositorio	APROBADO	03/11/2026 18:26	-	fix(admin): corregir propiedad max-width y ajustar ancho maximo a 520px en PatrullaDesactivarModal
```

---

## 5. Guía de Ejecución y Replicabilidad Paso a Paso

### 5.1 Ejecución de Pruebas Unitarias y de Integración con Vitest

**Comando general para las suites de HU-85:**
```bash
npx vitest run src/services/__tests__/patrullasService.test.ts src/components/admin/patrullas/__tests__/PatrullaDesactivarModal.test.tsx src/components/admin/patrullas/__tests__/AdminPatrullasClient.test.tsx
```

**Comandos individuales por caso de prueba (`npm test -- -t "..."`):**
```bash
# Servicio DAL: Baja lógica 200 OK y liberación de recursos
npm test -- src/services/__tests__/patrullasService.test.ts -t "debe desactivar exitosamente la patrulla con código 200 OK y liberar recursos"

# Servicio DAL: Rechazo 409 Conflict por misión en curso o estado EN_VERIFICACION
npm test -- src/services/__tests__/patrullasService.test.ts -t "debe manejar conflicto operativo (409 Conflict) si posee misiones activas o está en verificación"

# Servicio DAL: Rechazo 403 Forbidden por falta de permiso recursos:eliminar
npm test -- src/services/__tests__/patrullasService.test.ts -t "debe manejar permisos insuficientes (403 Forbidden)"

# Modal de Confirmación: Advertencia de baja lógica, liberación de vehículo/personal y nota SENAPRED
npm test -- src/components/admin/patrullas/__tests__/PatrullaDesactivarModal.test.tsx -t "renderiza la advertencia de baja lógica, los recursos a liberar y la nota de auditoría SENAPRED"

# Modal de Confirmación: Bloqueo preventivo ante estado EN_VERIFICACION o misión activa
npm test -- src/components/admin/patrullas/__tests__/PatrullaDesactivarModal.test.tsx -t "bloquea y deshabilita el botón de confirmación si la patrulla se encuentra en verificación o misión activa"

# Vista Administración: Renderizado de acción Desactivar y bloqueo operativo en tarjetas
npm test -- src/components/admin/patrullas/__tests__/AdminPatrullasClient.test.tsx -t "renderiza la acción \"Desactivar\" con permiso recursos:eliminar y abre PatrullaDesactivarModal"
```

**Evidencia real de ejecución en consola:**
```text
 RUN  v3.2.7 /home/ds2fery/Documentos/Proyecto/sgrai-uach/web

 ✓ src/services/__tests__/patrullasService.test.ts (23 tests) 27ms
 ✓ src/components/admin/patrullas/__tests__/PatrullaDesactivarModal.test.tsx (7 tests) 257ms
 ✓ src/components/admin/patrullas/__tests__/AdminPatrullasClient.test.tsx (10 tests) 863ms

 Test Files  3 passed (3)
      Tests  40 passed (40)
   Duration  2.65s
```

---

### 5.2 Análisis Estático de Código (ESLint) y Chequeo de Tipos (TypeScript)

**Comando ejecutado:**
```bash
npm run lint && npx tsc --noEmit
```

**Evidencia real obtenida:**
```text
/home/ds2fery/Documentos/Proyecto/sgrai-uach/web/src/hooks/usePatrullas.ts
  237:6  warning  React Hook useEffect has a missing dependency: 'consultar'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

✖ 17 problems (0 errors, 17 warnings)
```
*(La advertencia en `src/hooks/usePatrullas.ts:237:6` se encuentra registrada formalmente en `BUG-H85-WEB-03`).*

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
    "eliminadoEn": "2026-11-03T21:20:00.000Z",
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
| **CA-1:** En el panel de administración, debe proveerse la acción 'Desactivar Patrulla'. | `CP-H85-WEB-01`, `CP-H85-WEB-02`, `CP-H85-WEB-03`, `BUG-H85-WEB-02` | 🟡 **PARCIAL** | Los botones se renderizan en `PatrullaCard` y `PatrullaDetalleDrawer`, pero `puedeDesactivar` en `AdminPatrullasClient.tsx` tiene fallback `: true` (*Fail-Open*) y usa `DEFAULT_ENCARGADO_ID` por defecto (`BUG-H85-WEB-02`). |
| **CA-2:** Modal de confirmación advirtiendo sobre el impacto de la acción. | `CP-H85-WEB-04`, `CP-H85-WEB-09`, `CP-H85-WEB-10`, `CP-H85-WEB-11`, `BUG-H85-WEB-05` | 🟡 **PARCIAL** | `PatrullaDesactivarModal` exhibe el impacto de la baja, los recursos a liberar y la nota de auditoría SENAPRED (§3.7), pero no limpia errores previos al cambiar props desde el padre (`BUG-H85-WEB-05`). |
| **CA-3:** La API debe rechazar la baja con `409 Conflict` si la patrulla se encuentra en estado `EN_VERIFICACION` o posee misiones activas. | `CP-H85-WEB-05`, `CP-H85-WEB-07`, `CP-H85-WEB-12`, `BUG-H85-WEB-01` | 🔴 **OBSERVADO** | El modal muestra la alerta `409`, pero no deshabilita el botón `"Sí, Desactivar Patrulla"` tras recibir `esConflicto = true`, y `estaBloqueada` omite los estados `EN_MISION`, `EN_PREVENCION` y `EN_RECUPERACION` (`BUG-H85-WEB-01`). |
| **CA-4:** Si no posee misiones activas, se aplica baja lógica: `activo = false` y `eliminado_en = CURRENT_TIMESTAMP`. | `CP-H85-WEB-06`, `CP-H85-WEB-12`, `BUG-H85-WEB-03`, `BUG-H85-WEB-04` | 🟡 **PARCIAL** | El flujo `200 OK` ejecuta la baja y retira la patrulla, pero existe discrepancia de nulabilidad en `DesactivarPatrullaDataDTO` (`BUG-H85-WEB-04`) y un *stale closure* con doble petición en `usePatrullas.ts` (`BUG-H85-WEB-03`). |
| **CA-5:** El vehículo y personal asignados deben quedar liberados a disponibilidad en el inventario comunal. | `CP-H85-WEB-04`, `CP-H85-WEB-06`, `CP-H85-WEB-11`, `CP-H85-WEB-12` | 🟢 **CUMPLIDO** | El modal detalla explícitamente el vehículo y la cantidad de funcionarios que retornan a disponibilidad y el servicio procesa `vehiculoLiberadoId` y `personalLiberadoIds`. |
