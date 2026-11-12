# Informe de Auditoría Técnica y Matriz de Casos de Prueba (QA): HU-61 — Creación de Evento de Alerta Temprana Preventiva (ATP)

> **Documento Oficial de Aseguramiento de Calidad (QA) — Frontend Web**  
> **Proyecto:** Sistema de Gestión de Recursos para Atención de Incidentes (SGRAI) — Dirección de Gestión de Riesgos de Desastres, Municipalidad de Valdivia.  
> **Módulo:** Administración y Gestión Territorial / Eventos de Alerta Temprana Preventiva (`sgrai-web`).  
> **Historia de Usuario:** HU-61 — *"Como Administrador quiero crear un Evento de Alerta Temprana Preventiva (ATP) en el sistema para registrar y anticipar amenazas climáticas o de emergencia comunal, para establecer un marco oficial y categorizado que permita agrupar y coordinar incidentes, eventos de prevención, operativos de recuperación y casos de asistencia social bajo un mismo fenómeno."*  
> **Desarrollador Asignado:** Jonagu1  
> **Aplicación Cliente Auditada:** `sgrai-web` (Next.js 16.3.4 + React 19 + TypeScript + CSS Modules + Vitest v3.2.7 + Testing Library).  
> **Rama Git Evaluada:** `feature/H61-crear-evento-atp`  
> **Commits Evaluados (Conventional Commits):**  
> * `feat(eventos-atp): implementar formulario de creacion de eventos ATP (H61)`  
> * `test(eventos-atp): cubrir formulario, servicio y RBAC de eventos ATP (H61)`  
> * `docs(eventos-atp): documentar manual y QA de creacion de eventos ATP (H61)`  
> * `docs(eventos-atp): actualizar referencia a migracion 072 (H61)`  
>  
> **Fecha de Auditoría QA:** 12 de Noviembre de 2026 13:38.  
> **Fecha de Re-Test:** `(Pendiente)`  
> **Dictamen Actual:** 🔴 **RECHAZADO — CAMBIOS REQUERIDOS (5 Defectos Reales Abiertos: 1 Crítico, 2 Altos, 2 Medios)**

---

## 1. Resumen Ejecutivo de Calidad

| Métrica | Resultado | Observaciones |
|---|:---:|---|
| **Total de Casos en Matriz** | **19** | 5 Defectos Abiertos (`BUG-H61-WEB-01` a `BUG-H61-WEB-05`) + 14 Casos Funcionales/Técnicos Aprobados |
| **Casos Aprobados (Pass)** | **14** | 73.7% de aprobación inicial sobre los escenarios validados |
| **Defectos Abiertos (Bugs)** | **5** | 1 Crítico (ruta 404), 2 Altos (RBAC/hidratación y desfase horario), 2 Medios (doble envío y manejo HTTP/cobertura) |
| **Casos Bloqueados (Blocked)** | **0** | Sin bloqueos de entorno |
| **Tasa de Aprobación Global (% Pass)** | **73.7%** | No apto para integración en `develop` hasta subsanar los 5 hallazgos abiertos |
| **Análisis Estático de Código (`npm run lint`)** | 🟢 **0 errores** | 0 errores ESLint y 0 advertencias en los archivos de HU-61 (11 advertencias preexistentes en otros módulos) |
| **Chequeo de Tipos Estáticos (`npx tsc --noEmit`)** | 🟢 **0 errores** | Compilación TypeScript limpia y contrato `POST /api/eventos-atp` tipado en `src/types/api-generated.d.ts` |
| **Compilación de Producción (`npm run build`)** | 🟢 **Exitosa** | Rutas `/gestion/admin/eventos-atp/nuevo` y `/admin/eventos-atp/nuevo` generadas; se confirma inexistencia de `/gestion/admin` y `/admin` |
| **Suite Automatizada del Módulo (Vitest)** | 🟢 **15/15 tests pass** | `eventosAtpService.test.ts` (5), `NuevoEventoAtpPage.test.tsx` (3), `EventoAtpForm.test.tsx` (7); un test consagra la ruta 404 |
| **Suite Regresión Puntos Críticos (Vitest)** | 🟢 **36/36 tests pass** | `puntosCriticosService.test.ts` (20), `PuntoCriticoForm.test.tsx` (8), `PuntosCriticosPage.test.tsx` (8) tras desvinculación de `eventos_atp:crear` |
| **Suite Completa del Repositorio Web** | 🟢 **801/801 tests pass** | 126 archivos de prueba ejecutados sin regresiones |

---

## 2. Registro Técnico de Defectos Detectados

Durante la inspección forense de código, ejecución de pruebas y verificación contra el contrato real de `sgrai-api` realizada el 12/11/2026 se identificaron **5 defectos reales** (**1 Crítico**, **2 Altos** y **2 Medios**):

| ID Defecto | Título y Descripción Técnica del Defecto | Severidad | Archivo(s) Afectado(s) | Fecha Hallazgo | Estado | Fecha Re-Test | Solución / Commit |
|---|---|:---:|---|:---:|:---:|:---:|---|
| `BUG-H61-WEB-01` | **Navegación rota (HTTP 404 Not Found) hacia rutas inexistentes `/gestion/admin` y `/admin`:** `NuevoEventoAtpPage` (`panelPath`) y `EventoAtpForm` (`panelPath`) construyen la URL de retorno como `pathname.startsWith('/gestion') ? '/gestion/admin' : '/admin'`. La inspección del árbol de rutas de App Router (`src/app/`) y del middleware (`src/proxy.ts`) junto con la salida de `npm run build` confirman que **no existen** las rutas `/gestion/admin` ni `/admin`; la ruta raíz real del panel de gestión es `/gestion`. Al pulsar `"Cancelar"`, `"Volver al Panel de Administración"` en la tarjeta de éxito o el botón de retorno en `CommonAccesoDenegadoState`, el usuario cae en una página `404 Not Found`. Adicionalmente, `EventoAtpForm.test.tsx` (línea 287) y `docs/manuals/H61-crear-evento-atp.md` (línea 126) validan/documentan la ruta errónea. | **Crítica** | `src/app/(admin)/admin/eventos-atp/nuevo/page.tsx`, `src/components/admin/eventos-atp/EventoAtpForm.tsx`, `src/components/admin/eventos-atp/__tests__/EventoAtpForm.test.tsx`, `docs/manuals/H61-crear-evento-atp.md` | 12/11/2026 13:38 | `ABIERTO` | `(Pendiente)` | Pendiente (Rechazado en Code Review) |
| `BUG-H61-WEB-02` | **Exposición SSR/hidratación previa por omisión de guarda `isMounted`/carga, bypass RBAC por UUID estático `DEFAULT_ADMIN_USER_ID` e invocación de hook dentro de `try/catch`:** En `NuevoEventoAtpPage`, `tienePermiso` evalúa `usuarioActivo.id === DEFAULT_ADMIN_USER_ID` sin verificar `isMounted` ni el estado de carga de `AuthContext`/`cargandoPermisos`. Dado que `SimulatedSessionContext` inicializa en servidor con `USUARIOS_SIMULADOS_SISTEMA[0]` (Administrador) mientras `AuthContext` hidrata la cookie JWT en cliente, el SSR y el primer render exponen `<EventoAtpForm />` a perfiles sin privilegios antes de resolver la sesión real; además, el UUID estático otorga acceso incondicional ignorando revocaciones en Roles y Permisos. Por otro lado, `useEventoAtpForm.ts` (líneas 83-91 y 321) invoca `useSimulatedSession()` dentro de un bloque `try/catch` (violando las reglas de hooks de React) para poblar `usuarioActivoId`, propiedad que no se consume en ninguna parte del flujo. | **Alta** | `src/app/(admin)/admin/eventos-atp/nuevo/page.tsx`, `src/hooks/useEventoAtpForm.ts` | 12/11/2026 13:38 | `ABIERTO` | `(Pendiente)` | Pendiente (Rechazado en Code Review) |
| `BUG-H61-WEB-03` | **Desfase horario por envío de `fechaInicio` y `fechaTermino` sin zona horaria desde `<input type="datetime-local">`:** `useEventoAtpForm.ts` (líneas 274-275) envía al endpoint `POST /api/eventos-atp` los valores crudos de `datetime-local` (`"2026-05-01T10:00"`) sin normalizarlos a ISO-8601 con offset/UTC (`new Date(...).toISOString()`). En un servidor backend configurado en `UTC` (estándar en Docker), `new Date("2026-05-01T10:00")` interpreta la hora local chilena (`America/Santiago`, UTC-3/UTC-4) como hora UTC (`10:00:00.000Z`). Al recibir la respuesta del servidor, `EventoAtpForm.tsx` (`formatearFechaHora`) renderiza el timestamp en zona local del navegador mostrando **06:00** en lugar de **10:00**, alterando en 3 a 4 horas la vigencia oficial del Evento ATP. | **Alta** | `src/hooks/useEventoAtpForm.ts`, `src/components/admin/eventos-atp/EventoAtpForm.tsx` | 12/11/2026 13:38 | `ABIERTO` | `(Pendiente)` | Pendiente (Rechazado en Code Review) |
| `BUG-H61-WEB-04` | **Condición de carrera por doble envío (`double-submit`) en `handleSubmit` sin bloqueo síncrono:** `useEventoAtpForm.ts` (líneas 240-306) no implementa una guarda síncrona basada en `useRef` (ni retorno temprano efectivo antes del ciclo de render) para impedir ejecuciones concurrentes de `handleSubmit`. Ante pulsaciones rápidas de `Enter` o disparos consecutivos de `submit` antes de que React aplique `disabled={isSubmitting}`, se emiten múltiples peticiones `POST /api/eventos-atp`; cuando el campo código se deja vacío para autogeneración (`ATP-AAAA-####`), el backend genera múltiples eventos ATP duplicados en PostgreSQL. | **Media** | `src/hooks/useEventoAtpForm.ts` | 12/11/2026 13:38 | `ABIERTO` | `(Pendiente)` | Pendiente (Rechazado en Code Review) |
| `BUG-H61-WEB-05` | **Manejo incompleto de respuestas HTTP en `eventosAtpService.ts` y brechas de cobertura en pruebas unitarias:** 1) `crearEventoAtp` no traduce respuestas `401 Unauthorized` a un mensaje institucional claro (expone el literal técnico `"Se requiere cabecera de autenticación Authorization: Bearer <token>."` en estado no redirigido). 2) En `403 Forbidden`, sobreescribe incondicionalmente `apiErr.message` descartando mensajes específicos del servidor (ej. usuario inactivo). 3) Cuando `error` no es un objeto, `formatApiError({ status })` retorna `'Ha ocurrido un error inesperado.'`, haciendo inalcanzable el fallback `` `Error HTTP ${statusCode}...` ``. 4) Las pruebas existentes no cubren despliegue de arreglo `errors` (`400 Bad Request`), `401 Unauthorized`, borde `fechaTermino === fechaInicio`, `delegacionIds: []` ni formato inválido de `codigo`. | **Media** | `src/services/eventosAtpService.ts`, `src/services/__tests__/eventosAtpService.test.ts`, `src/components/admin/eventos-atp/__tests__/EventoAtpForm.test.tsx` | 12/11/2026 13:38 | `ABIERTO` | `(Pendiente)` | Pendiente (Rechazado en Code Review) |

---

## 3. Matriz Consolidada de Casos de Prueba (13 Columnas)

| ID Caso | Título del Caso de Prueba | Tipo de Prueba | Nivel | Prioridad | Precondición | Datos de Prueba (Payload / Headers / Query) | Resultado Esperado | Resultado Obtenido | Estado | Fecha / Hora Ejecución | Fecha / Hora Re-Test | Solución / Commit |
|---|---|---|---|---|---|---|---|---|:---:|:---:|:---:|---|
| `BUG-H61-WEB-01` | Redirección de botones "Cancelar", "Volver al Panel de Administración" y retorno de Acceso Denegado hacia ruta válida `/gestion` | Navegación / Enrutamiento | UI / App Router | Crítica | Usuario en `/gestion/admin/eventos-atp/nuevo` (formulario, tarjeta de éxito o Acceso Restringido) | Clic en botón "Cancelar" o "Volver al Panel de Administración" (`pathname = '/gestion/admin/eventos-atp/nuevo'`) | Redirección hacia ruta operativa existente (`/gestion`) sin producir error 404 | `panelPath` apunta a `/gestion/admin` (o `/admin`), rutas inexistentes en `src/app/` y `src/proxy.ts` que arrojan HTTP 404 Not Found; test unitario valida `/gestion/admin` | **ABIERTO** | 12/11/2026 13:38 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| `BUG-H61-WEB-02` | Control RBAC Fail-Closed durante SSR/hidratación, eliminación de bypass por `DEFAULT_ADMIN_USER_ID` y uso correcto de hooks en `useEventoAtpForm` | Seguridad / RBAC | Página / Hook | Alta | Usuario no administrador autenticado vía cookie JWT o contexto sin sesión montada (`isMounted === false`) | Navegación a `/gestion/admin/eventos-atp/nuevo`; sesión `usuarioActivo.id === DEFAULT_ADMIN_USER_ID` sin rol/permiso o estado pre-hidratación | Bloqueo Fail-Closed hasta confirmar montaje/sesión (`isMounted`), validación estricta por rol/permiso sin UUID hardcodeado y sin hooks en `try/catch` | `NuevoEventoAtpPage` omite `isMounted`/`cargando`, expone `<EventoAtpForm />` en SSR como Admin por defecto, hardcodea `DEFAULT_ADMIN_USER_ID` y `useEventoAtpForm` llama `useSimulatedSession()` en `try/catch` | **ABIERTO** | 12/11/2026 13:38 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| `BUG-H61-WEB-03` | Normalización de `fechaInicio` y `fechaTermino` a ISO-8601 con zona horaria antes de enviar a `POST /api/eventos-atp` | Integración / Datos | Hook / Formulario | Alta | Administrador en zona horaria `America/Santiago` (UTC-4) con backend en UTC | `fechaInicio: '2026-05-01T10:00'`, `fechaTermino: '2026-05-03T18:00'` en `<input type="datetime-local">` | Frontend normaliza mediante `new Date(...).toISOString()` enviando instante UTC exacto (`14:00:00.000Z`) para preservar `10:00` local al formatear | Payload envía cadena cruda `'2026-05-01T10:00'` sin offset; servidor UTC persiste `10:00Z` y la tarjeta de éxito renderiza `06:00` en Chile | **ABIERTO** | 12/11/2026 13:38 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| `BUG-H61-WEB-04` | Prevención de doble envío concurrente en `handleSubmit` ante disparos rápidos sin código manual | Concurrencia / Robustez | Hook / Formulario | Media | Formulario válido con `codigo: ''` listo para autogeneración `ATP-AAAA-####` | Dos invocaciones consecutivas rápidas de `onSubmit` antes del re-render de `isSubmitting` | Guarda síncrona (`useRef`) bloquea el segundo envío ejecutando una sola llamada a `POST /api/eventos-atp` | `handleSubmit` carece de guarda síncrona (`useRef` o retorno temprano seguro), permitiendo múltiples llamadas concurrentes y eventos duplicados | **ABIERTO** | 12/11/2026 13:38 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| `BUG-H61-WEB-05` | Manejo de errores HTTP `401`, preservación de mensaje `403`, fallback HTTP no-objeto y cobertura unitaria de errores `400` con arreglo `errors` | Robustez / Pruebas | Service DAL / Tests | Media | Respuestas `401`, `403` con mensaje específico, `502` sin JSON o `400` con `errors: [{ campo, mensaje }]` | `response.status = 401`, `403` (`{ message: 'Usuario inactivo' }`), `502` (`error: undefined`), `400` (`errors: [{ campo: 'fechaTermino', mensaje: '...' }]`) | Traducción amigable en `401`, preservación de motivo en `403`, fallback HTTP activo en errores sin objeto y pruebas cubriendo `400` con `errors`, `401`, `>=` y `[]` | `401` expone texto de cabecera Bearer, `403` sobreescribe todo mensaje, `formatApiError` anula fallback `Error HTTP`, y `EventoAtpForm.test.tsx` simula `409` sin `errors` | **ABIERTO** | 12/11/2026 13:38 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| `CP-H61-WEB-01` | Renderizado de la vista de creación en `/gestion/admin/eventos-atp/nuevo` y `/admin/eventos-atp/nuevo` para rol Administrador (CA-1) | Funcional | Página / RBAC | Crítica | Sesión activa con `rol: 'Administrador'`, `esAdmin: true` | Navegar a `/gestion/admin/eventos-atp/nuevo` | Se despliegan breadcrumbs, `PageTitleCard` ("Crear Evento de Alerta Temprana Preventiva", badge "Evento ATP") y el formulario | Página y ruta espejo renderizan correctamente título, badge y componente `EventoAtpForm` | **APROBADO** | 12/11/2026 13:38 | — | feat(eventos-atp): implementar formulario de creacion de eventos ATP (H61) |
| `CP-H61-WEB-02` | Habilitación de acceso al formulario mediante permiso granular `eventos_atp:crear` (CA-1, CA-7) | Seguridad / RBAC | Página / RBAC | Alta | Usuario con `rol: 'Encargado'`, `esAdmin: false` y `permisos: new Set(['eventos_atp:crear'])` | Navegar a `/gestion/admin/eventos-atp/nuevo` | El formulario se habilita sin exigir el rol Administrador | `hasPermission('eventos_atp:crear')` habilita la vista y formulario en `NuevoEventoAtpPage.test.tsx` | **APROBADO** | 12/11/2026 13:38 | — | feat(eventos-atp): implementar formulario de creacion de eventos ATP (H61) |
| `CP-H61-WEB-03` | Bloqueo de acceso en cliente para perfiles sin rol Administrador ni permiso `eventos_atp:crear` tras hidratación (CA-1) | Seguridad / RBAC | Página / RBAC | Crítica | Usuario con `rol: 'Informante'`, `esAdmin: false` y `permisos: new Set()` | Renderizado de `NuevoEventoAtpPage` con sesión hidratada sin privilegios | No se monta `EventoAtpForm` y se muestra `CommonAccesoDenegadoState` ("Acceso Restringido") | Estado restringido desplegado indicando requerimiento de Administrador o permiso `eventos_atp:crear` | **APROBADO** | 12/11/2026 13:38 | — | test(eventos-atp): cubrir formulario, servicio y RBAC de eventos ATP (H61) |
| `CP-H61-WEB-04` | Renderizado completo de campos del formulario, 7 tipos de amenaza, 3 niveles de alerta y 4 delegaciones (CA-2, CA-3) | Funcional | UI / Formulario | Crítica | Página cargada y catálogos disponibles | Montaje de `EventoAtpForm` con las 4 delegaciones municipales | Se muestran código, nombre, descripción, tipo de amenaza, Verde/Amarilla/Roja, inicio/término y Norte, Sur, Costa, Calle Calle | Todos los controles, catálogos homologados y 4 delegaciones renderizados conforme al diseño | **APROBADO** | 12/11/2026 13:38 | — | feat(eventos-atp): implementar formulario de creacion de eventos ATP (H61) |
| `CP-H61-WEB-05` | Normalización de código manual a mayúsculas y envío mediante `openapi-fetch` a `POST /api/eventos-atp` (CA-2) | Lógica de Negocio | Hook / Service | Alta | Formulario completo con código en minúsculas | `codigo: 'atp-2026-0001'`, `nivelAlerta: 'AMARILLA'`, `delegacionIds: ['30000000-...-0001']` | `crearEventoAtp` recibe `codigo: 'ATP-2026-0001'` y ejecuta `apiClient.POST('/api/eventos-atp', { body })` | Código normalizado a `'ATP-2026-0001'` y petición tipada verificada en Vitest | **APROBADO** | 12/11/2026 13:38 | — | feat(eventos-atp): implementar formulario de creacion de eventos ATP (H61) |
| `CP-H61-WEB-06` | Bloqueo de envío en cliente cuando faltan campos obligatorios (`nombre`, `descripcion`, `fechaInicio`, `fechaTermino`) (CA-2, CA-4) | Validación | Hook / UI | Crítica | Formulario en estado inicial sin completar campos requeridos | Clic directo en botón "Guardar Evento ATP" | No se invoca `crearEventoAtp`, se muestran errores inline y toast `'Formulario Incompleto'` | Validación cliente bloquea envío, muestra mensajes por campo y dispara `showError` | **APROBADO** | 12/11/2026 13:38 | — | test(eventos-atp): cubrir formulario, servicio y RBAC de eventos ATP (H61) |
| `CP-H61-WEB-07` | Rechazo en cliente y servidor cuando `fechaTermino` es anterior a `fechaInicio` (CA-4) | Validación | Hook / API Zod | Crítica | Resto de campos válidos | `fechaInicio: '2026-05-03T18:00'`, `fechaTermino: '2026-05-01T10:00'` | Bloqueo en cliente con error en `fechaTermino`; en API, `POST /api/eventos-atp` responde HTTP `400` con detalle en `fechaTermino` | Bloqueo verificado en `EventoAtpForm.test.tsx` y rechazo HTTP `400` comprobado vía cURL contra `sgrai-api` | **APROBADO** | 12/11/2026 13:38 | — | feat(eventos-atp): implementar formulario de creacion de eventos ATP (H61) |
| `CP-H61-WEB-08` | Selección múltiple de delegaciones y acción "Seleccionar todas" (CA-3) | Funcional | UI / Alcance | Alta | Catálogo de 4 delegaciones cargado | Clic en botón "Seleccionar todas" y envío del formulario | Payload incluye los 4 UUIDs de Norte, Sur, Costa y Calle Calle y muestra resumen de territorio afectado | Los 4 UUIDs de delegación son enviados en `delegacionIds` al servicio | **APROBADO** | 12/11/2026 13:38 | — | feat(eventos-atp): implementar formulario de creacion de eventos ATP (H61) |
| `CP-H61-WEB-09` | Alcance comunal centralizado al no seleccionar delegaciones (`delegacionIds: []`) (CA-3, CA-5) | Funcional | UI / Hook | Alta | Formulario válido con 0 delegaciones marcadas | `delegacionIds: []` y clic en "Limpiar selección" | Resumen indica "Alcance comunal centralizado" y payload envía `delegacionIds: []`; tarjeta de éxito muestra "Comunal centralizado" | Comportamiento verificado en `EventoAtpAlcanceSection`, `useEventoAtpForm` y `EventoAtpForm` | **APROBADO** | 12/11/2026 13:38 | — | feat(eventos-atp): implementar formulario de creacion de eventos ATP (H61) |
| `CP-H61-WEB-10` | Despliegue de tarjeta de confirmación con estado `ACTIVO`, código oficial y toast de éxito tras HTTP `201` (CA-5) | Integración / UI | UI / Service | Crítica | Servicio responde HTTP `201 Created` con entidad en estado `ACTIVO` | Respuesta `{ message: 'Evento ATP registrado exitosamente.', data: { codigo: 'ATP-2026-0001', estado: 'ACTIVO', ... } }` | Se muestra `successCard` con código, estado "Activo", tipo de amenaza, nivel, alcance y toast `Registro Exitoso` | Tarjeta de confirmación renderizada con todos los metadatos y notificación toast verificada | **APROBADO** | 12/11/2026 13:38 | — | feat(eventos-atp): implementar formulario de creacion de eventos ATP (H61) |
| `CP-H61-WEB-11` | Manejo de conflicto HTTP `409 Conflict` por código manual duplicado en servicio y formulario (CA-2) | Manejo de Errores | Service / UI | Alta | Código ya existente en `evento_atp` | Respuesta HTTP `409` `{ message: "Ya existe un Evento ATP registrado con el código 'ATP-2026-0001'." }` | Servicio lanza `EventoAtpServiceError` con `statusCode: 409` y el formulario despliega `InlineNotice` y toast de error | Propagación `409` y renderizado en `InlineNotice` verificados en Vitest | **APROBADO** | 12/11/2026 13:38 | — | test(eventos-atp): cubrir formulario, servicio y RBAC de eventos ATP (H61) |
| `CP-H61-WEB-12` | Protección RBAC de `POST /api/eventos-atp` ante petición anónima (`401`) y usuario Call Center sin permiso (`403`) (CA-7) | Seguridad / RBAC | API / Integración | Crítica | API ejecutándose en `http://localhost:3001` | Petición sin `Authorization` y petición con token JWT de `callcenter@valdivia.cl` | HTTP `401 Unauthorized` sin token y HTTP `403 Forbidden` para perfil sin rol Administrador ni permiso `eventos_atp:crear` | Verificado en vivo vía cURL: `401` sin cabecera/token inválido y `403` con token de Call Center | **APROBADO** | 12/11/2026 13:38 | — | feat(eventos-atp): implementar formulario de creacion de eventos ATP (H61) |
| `CP-H61-WEB-13` | Desvinculación formal del permiso `eventos_atp:crear` como fallback en Puntos Críticos sin regresiones (CA-7) | Regresión / RBAC | Páginas / Suite | Alta | Eliminación de `hasPermission('eventos_atp:crear')` en `puntos-criticos/page.tsx` y `puntos-criticos/nuevo/page.tsx` | Ejecución de suites de Puntos Críticos y búsqueda estática de referencias | Ninguna vista de Puntos Críticos concede acceso por `eventos_atp:crear`; 36/36 tests de Puntos Críticos pasan | `grep` confirma remoción total en Puntos Críticos y 36/36 pruebas de regresión pasan | **APROBADO** | 12/11/2026 13:38 | — | feat(eventos-atp): implementar formulario de creacion de eventos ATP (H61) |
| `CP-H61-WEB-14` | Cumplimiento de guía visual municipal (`GEMINI.md`), compilación Next.js, ESLint y tipado estático TypeScript | Estándar / Calidad | UI / Build | Media | Código fuente en `feature/H61-crear-evento-atp` | `npm run lint`, `npx tsc --noEmit`, `npm run build` e inspección CSS/JSX | Uso obligatorio de `<Heading>`, `<Button>`, `lucide-react`, sin emojis, `border-radius: 0px`, 0 errores TS/ESLint y build exitoso | 0 errores ESLint en HU-61, 0 errores `tsc`, `next build` exitoso (49/49 páginas estáticas) y apego visual a tokens | **APROBADO** | 12/11/2026 13:38 | — | feat(eventos-atp): implementar formulario de creacion de eventos ATP (H61) |

---

## 4. Bloque TSV para Hoja de Cálculo

```tsv
ID Caso	Título del Caso de Prueba	Tipo de Prueba	Nivel	Prioridad	Precondición	Datos de Prueba (Payload / Headers / Query)	Resultado Esperado	Resultado Obtenido	Estado	Fecha / Hora Ejecución	Fecha / Hora Re-Test	Solución / Commit
BUG-H61-WEB-01	Redirección de botones "Cancelar", "Volver al Panel de Administración" y retorno de Acceso Denegado hacia ruta válida /gestion	Navegación / Enrutamiento	UI / App Router	Crítica	Usuario en /gestion/admin/eventos-atp/nuevo (formulario, tarjeta de éxito o Acceso Restringido)	Clic en botón "Cancelar" o "Volver al Panel de Administración" (pathname = '/gestion/admin/eventos-atp/nuevo')	Redirección hacia ruta operativa existente (/gestion) sin producir error 404	panelPath apunta a /gestion/admin (o /admin), rutas inexistentes en src/app/ y src/proxy.ts que arrojan HTTP 404 Not Found; test unitario valida /gestion/admin	ABIERTO	12/11/2026 13:38	(Pendiente)	Pendiente (Rechazado en Code Review)
BUG-H61-WEB-02	Control RBAC Fail-Closed durante SSR/hidratación, eliminación de bypass por DEFAULT_ADMIN_USER_ID e invocación de hook dentro de try/catch	Seguridad / RBAC	Página / Hook	Alta	Usuario no administrador autenticado vía cookie JWT o contexto sin sesión montada (isMounted === false)	Navegación a /gestion/admin/eventos-atp/nuevo; sesión usuarioActivo.id === DEFAULT_ADMIN_USER_ID sin rol/permiso o estado pre-hidratación	Bloqueo Fail-Closed hasta confirmar montaje/sesión (isMounted), validación estricta por rol/permiso sin UUID hardcodeado y sin hooks en try/catch	NuevoEventoAtpPage omite isMounted/cargando, expone EventoAtpForm en SSR como Admin por defecto, hardcodea DEFAULT_ADMIN_USER_ID y useEventoAtpForm llama useSimulatedSession() en try/catch	ABIERTO	12/11/2026 13:38	(Pendiente)	Pendiente (Rechazado en Code Review)
BUG-H61-WEB-03	Normalización de fechaInicio y fechaTermino a ISO-8601 con zona horaria antes de enviar a POST /api/eventos-atp	Integración / Datos	Hook / Formulario	Alta	Administrador en zona horaria America/Santiago (UTC-4) con backend en UTC	fechaInicio: '2026-05-01T10:00', fechaTermino: '2026-05-03T18:00' en input datetime-local	Frontend normaliza mediante new Date(...).toISOString() enviando instante UTC exacto (14:00:00.000Z) para preservar 10:00 local al formatear	Payload envía cadena cruda '2026-05-01T10:00' sin offset; servidor UTC persiste 10:00Z y la tarjeta de éxito renderiza 06:00 en Chile	ABIERTO	12/11/2026 13:38	(Pendiente)	Pendiente (Rechazado en Code Review)
BUG-H61-WEB-04	Prevención de doble envío concurrente en handleSubmit ante disparos rápidos sin código manual	Concurrencia / Robustez	Hook / Formulario	Media	Formulario válido con codigo: '' listo para autogeneración ATP-AAAA-####	Dos invocaciones consecutivas rápidas de onSubmit antes del re-render de isSubmitting	Guarda síncrona (useRef) bloquea el segundo envío ejecutando una sola llamada a POST /api/eventos-atp	handleSubmit carece de guarda síncrona (useRef o retorno temprano seguro), permitiendo múltiples llamadas concurrentes y eventos duplicados	ABIERTO	12/11/2026 13:38	(Pendiente)	Pendiente (Rechazado en Code Review)
BUG-H61-WEB-05	Manejo de errores HTTP 401, preservación de mensaje 403, fallback HTTP no-objeto y cobertura unitaria de errores 400 con arreglo errors	Robustez / Pruebas	Service DAL / Tests	Media	Respuestas 401, 403 con mensaje específico, 502 sin JSON o 400 con errors: [{ campo, mensaje }]	response.status = 401, 403 ({ message: 'Usuario inactivo' }), 502 (error: undefined), 400 (errors: [{ campo: 'fechaTermino', mensaje: '...' }])	Traducción amigable en 401, preservación de motivo en 403, fallback HTTP activo en errores sin objeto y pruebas cubriendo 400 con errors, 401, >= y []	401 expone texto de cabecera Bearer, 403 sobreescribe todo mensaje, formatApiError anula fallback Error HTTP, y EventoAtpForm.test.tsx simula 409 sin errors	ABIERTO	12/11/2026 13:38	(Pendiente)	Pendiente (Rechazado en Code Review)
CP-H61-WEB-01	Renderizado de la vista de creación en /gestion/admin/eventos-atp/nuevo y /admin/eventos-atp/nuevo para rol Administrador (CA-1)	Funcional	Página / RBAC	Crítica	Sesión activa con rol: 'Administrador', esAdmin: true	Navegar a /gestion/admin/eventos-atp/nuevo	Se despliegan breadcrumbs, PageTitleCard ("Crear Evento de Alerta Temprana Preventiva", badge "Evento ATP") y el formulario	Página y ruta espejo renderizan correctamente título, badge y componente EventoAtpForm	APROBADO	12/11/2026 13:38	—	feat(eventos-atp): implementar formulario de creacion de eventos ATP (H61)
CP-H61-WEB-02	Habilitación de acceso al formulario mediante permiso granular eventos_atp:crear (CA-1, CA-7)	Seguridad / RBAC	Página / RBAC	Alta	Usuario con rol: 'Encargado', esAdmin: false y permisos: new Set(['eventos_atp:crear'])	Navegar a /gestion/admin/eventos-atp/nuevo	El formulario se habilita sin exigir el rol Administrador	hasPermission('eventos_atp:crear') habilita la vista y formulario en NuevoEventoAtpPage.test.tsx	APROBADO	12/11/2026 13:38	—	feat(eventos-atp): implementar formulario de creacion de eventos ATP (H61)
CP-H61-WEB-03	Bloqueo de acceso en cliente para perfiles sin rol Administrador ni permiso eventos_atp:crear tras hidratación (CA-1)	Seguridad / RBAC	Página / RBAC	Crítica	Usuario con rol: 'Informante', esAdmin: false y permisos: new Set()	Renderizado de NuevoEventoAtpPage con sesión hidratada sin privilegios	No se monta EventoAtpForm y se muestra CommonAccesoDenegadoState ("Acceso Restringido")	Estado restringido desplegado indicando requerimiento de Administrador o permiso eventos_atp:crear	APROBADO	12/11/2026 13:38	—	test(eventos-atp): cubrir formulario, servicio y RBAC de eventos ATP (H61)
CP-H61-WEB-04	Renderizado completo de campos del formulario, 7 tipos de amenaza, 3 niveles de alerta y 4 delegaciones (CA-2, CA-3)	Funcional	UI / Formulario	Crítica	Página cargada y catálogos disponibles	Montaje de EventoAtpForm con las 4 delegaciones municipales	Se muestran código, nombre, descripción, tipo de amenaza, Verde/Amarilla/Roja, inicio/término y Norte, Sur, Costa, Calle Calle	Todos los controles, catálogos homologados y 4 delegaciones renderizados conforme al diseño	APROBADO	12/11/2026 13:38	—	feat(eventos-atp): implementar formulario de creacion de eventos ATP (H61)
CP-H61-WEB-05	Normalización de código manual a mayúsculas y envío mediante openapi-fetch a POST /api/eventos-atp (CA-2)	Lógica de Negocio	Hook / Service	Alta	Formulario completo con código en minúsculas	codigo: 'atp-2026-0001', nivelAlerta: 'AMARILLA', delegacionIds: ['30000000-...-0001']	crearEventoAtp recibe codigo: 'ATP-2026-0001' y ejecuta apiClient.POST('/api/eventos-atp', { body })	Código normalizado a 'ATP-2026-0001' y petición tipada verificada en Vitest	APROBADO	12/11/2026 13:38	—	feat(eventos-atp): implementar formulario de creacion de eventos ATP (H61)
CP-H61-WEB-06	Bloqueo de envío en cliente cuando faltan campos obligatorios (nombre, descripcion, fechaInicio, fechaTermino) (CA-2, CA-4)	Validación	Hook / UI	Crítica	Formulario en estado inicial sin completar campos requeridos	Clic directo en botón "Guardar Evento ATP"	No se invoca crearEventoAtp, se muestran errores inline y toast 'Formulario Incompleto'	Validación cliente bloquea envío, muestra mensajes por campo y dispara showError	APROBADO	12/11/2026 13:38	—	test(eventos-atp): cubrir formulario, servicio y RBAC de eventos ATP (H61)
CP-H61-WEB-07	Rechazo en cliente y servidor cuando fechaTermino es anterior a fechaInicio (CA-4)	Validación	Hook / API Zod	Crítica	Resto de campos válidos	fechaInicio: '2026-05-03T18:00', fechaTermino: '2026-05-01T10:00'	Bloqueo en cliente con error en fechaTermino; en API, POST /api/eventos-atp responde HTTP 400 con detalle en fechaTermino	Bloqueo verificado en EventoAtpForm.test.tsx y rechazo HTTP 400 comprobado vía cURL contra sgrai-api	APROBADO	12/11/2026 13:38	—	feat(eventos-atp): implementar formulario de creacion de eventos ATP (H61)
CP-H61-WEB-08	Selección múltiple de delegaciones y acción "Seleccionar todas" (CA-3)	Funcional	UI / Alcance	Alta	Catálogo de 4 delegaciones cargado	Clic en botón "Seleccionar todas" y envío del formulario	Payload incluye los 4 UUIDs de Norte, Sur, Costa y Calle Calle y muestra resumen de territorio afectado	Los 4 UUIDs de delegación son enviados en delegacionIds al servicio	APROBADO	12/11/2026 13:38	—	feat(eventos-atp): implementar formulario de creacion de eventos ATP (H61)
CP-H61-WEB-09	Alcance comunal centralizado al no seleccionar delegaciones (delegacionIds: []) (CA-3, CA-5)	Funcional	UI / Hook	Alta	Formulario válido con 0 delegaciones marcadas	delegacionIds: [] y clic en "Limpiar selección"	Resumen indica "Alcance comunal centralizado" y payload envía delegacionIds: []; tarjeta de éxito muestra "Comunal centralizado"	Comportamiento verificado en EventoAtpAlcanceSection, useEventoAtpForm y EventoAtpForm	APROBADO	12/11/2026 13:38	—	feat(eventos-atp): implementar formulario de creacion de eventos ATP (H61)
CP-H61-WEB-10	Despliegue de tarjeta de confirmación con estado ACTIVO, código oficial y toast de éxito tras HTTP 201 (CA-5)	Integración / UI	UI / Service	Crítica	Servicio responde HTTP 201 Created con entidad en estado ACTIVO	Respuesta { message: 'Evento ATP registrado exitosamente.', data: { codigo: 'ATP-2026-0001', estado: 'ACTIVO', ... } }	Se muestra successCard con código, estado "Activo", tipo de amenaza, nivel, alcance y toast Registro Exitoso	Tarjeta de confirmación renderizada con todos los metadatos y notificación toast verificada	APROBADO	12/11/2026 13:38	—	feat(eventos-atp): implementar formulario de creacion de eventos ATP (H61)
CP-H61-WEB-11	Manejo de conflicto HTTP 409 Conflict por código manual duplicado en servicio y formulario (CA-2)	Manejo de Errores	Service / UI	Alta	Código ya existente en evento_atp	Respuesta HTTP 409 { message: "Ya existe un Evento ATP registrado con el código 'ATP-2026-0001'." }	Servicio lanza EventoAtpServiceError con statusCode: 409 y el formulario despliega InlineNotice y toast de error	Propagación 409 y renderizado en InlineNotice verificados en Vitest	APROBADO	12/11/2026 13:38	—	test(eventos-atp): cubrir formulario, servicio y RBAC de eventos ATP (H61)
CP-H61-WEB-12	Protección RBAC de POST /api/eventos-atp ante petición anónima (401) y usuario Call Center sin permiso (403) (CA-7)	Seguridad / RBAC	API / Integración	Crítica	API ejecutándose en http://localhost:3001	Petición sin Authorization y petición con token JWT de callcenter@valdivia.cl	HTTP 401 Unauthorized sin token y HTTP 403 Forbidden para perfil sin rol Administrador ni permiso eventos_atp:crear	Verificado en vivo vía cURL: 401 sin cabecera/token inválido y 403 con token de Call Center	APROBADO	12/11/2026 13:38	—	feat(eventos-atp): implementar formulario de creacion de eventos ATP (H61)
CP-H61-WEB-13	Desvinculación formal del permiso eventos_atp:crear como fallback en Puntos Críticos sin regresiones (CA-7)	Regresión / RBAC	Páginas / Suite	Alta	Eliminación de hasPermission('eventos_atp:crear') en puntos-criticos/page.tsx y puntos-criticos/nuevo/page.tsx	Ejecución de suites de Puntos Críticos y búsqueda estática de referencias	Ninguna vista de Puntos Críticos concede acceso por eventos_atp:crear; 36/36 tests de Puntos Críticos pasan	grep confirma remoción total en Puntos Críticos y 36/36 pruebas de regresión pasan	APROBADO	12/11/2026 13:38	—	feat(eventos-atp): implementar formulario de creacion de eventos ATP (H61)
CP-H61-WEB-14	Cumplimiento de guía visual municipal (GEMINI.md), compilación Next.js, ESLint y tipado estático TypeScript	Estándar / Calidad	UI / Build	Media	Código fuente en feature/H61-crear-evento-atp	npm run lint, npx tsc --noEmit, npm run build e inspección CSS/JSX	Uso obligatorio de Heading, Button, lucide-react, sin emojis, border-radius: 0px, 0 errores TS/ESLint y build exitoso	0 errores ESLint en HU-61, 0 errores tsc, next build exitoso (49/49 páginas estáticas) y apego visual a tokens	APROBADO	12/11/2026 13:38	—	feat(eventos-atp): implementar formulario de creacion de eventos ATP (H61)
```

---

## 5. Guía de Ejecución y Replicabilidad Paso a Paso

### 5.1 Pruebas Automatizadas del Módulo y Regresión (Vitest)

**Suite completa de HU-61:**
```bash
npx vitest run \
  src/services/__tests__/eventosAtpService.test.ts \
  'src/app/(admin)/admin/eventos-atp/nuevo/__tests__/NuevoEventoAtpPage.test.tsx' \
  src/components/admin/eventos-atp/__tests__/EventoAtpForm.test.tsx
```

**Evidencia real obtenida:**
```text
 ✓ src/services/__tests__/eventosAtpService.test.ts (5 tests) 9ms
 ✓ src/app/(admin)/admin/eventos-atp/nuevo/__tests__/NuevoEventoAtpPage.test.tsx (3 tests) 80ms
 ✓ src/components/admin/eventos-atp/__tests__/EventoAtpForm.test.tsx (7 tests) 633ms

 Test Files  3 passed (3)
      Tests  15 passed (15)
   Duration  2.09s
```

**Ejecución filtrada por caso (`npm test -- -t "..."`):**
```bash
npm test -- --run src/components/admin/eventos-atp/__tests__/EventoAtpForm.test.tsx -t "fecha de término"
```

**Evidencia real obtenida:**
```text
 ✓ EventoAtpForm (H61: Creación de Evento ATP) > debe rechazar una fecha de término anterior a la fecha de inicio 255ms

 Test Files  1 passed (1)
      Tests  1 passed | 6 skipped (7)
   Duration  1.76s
```

**Regresión de Puntos Críticos (verificación de desvinculación de `eventos_atp:crear`):**
```bash
npx vitest run \
  'src/app/(admin)/admin/puntos-criticos/__tests__/PuntosCriticosPage.test.tsx' \
  src/components/admin/puntos-criticos/__tests__/PuntoCriticoForm.test.tsx \
  src/services/__tests__/puntosCriticosService.test.ts
```

**Evidencia real obtenida:**
```text
 ✓ src/services/__tests__/puntosCriticosService.test.ts (20 tests) 18ms
 ✓ src/components/admin/puntos-criticos/__tests__/PuntoCriticoForm.test.tsx (8 tests) 586ms
 ✓ src/app/(admin)/admin/puntos-criticos/__tests__/PuntosCriticosPage.test.tsx (8 tests) 634ms

 Test Files  3 passed (3)
      Tests  36 passed (36)
   Duration  2.32s
```

**Suite completa del repositorio (`sgrai-web`):**
```bash
npm test -- --run
```

**Evidencia real obtenida:**
```text
 Test Files  126 passed (126)
      Tests  801 passed (801)
   Duration  29.24s
```

### 5.2 Análisis Estático, Chequeo de Tipos y Compilación de Producción

```bash
npm run lint && npx tsc --noEmit && npm run build
```

**Evidencia real obtenida:**
```text
✖ 11 problems (0 errors, 11 warnings)   # 0 errores y 0 warnings en archivos de HU-61
npx tsc --noEmit                        # Exit code 0
npm run build                           # ✓ Compiled successfully in 5.8s; Generating static pages (49/49)
```

Verificación de rutas compiladas relevantes:
```text
├ ○ /gestion
├ ○ /gestion/admin/cuadrillas
├ ○ /gestion/admin/empleados
├ ○ /gestion/admin/eventos-atp/nuevo
├ ○ /gestion/admin/patrullas
├ ○ /gestion/admin/puntos-criticos
├ ○ /gestion/admin/recursos
├ ○ /gestion/admin/roles-permisos
```
*(No existen `/gestion/admin` ni `/admin` en el árbol de rutas generado).*

### 5.3 Pruebas de Contrato HTTP/JSON con cURL (`POST /api/eventos-atp`)

#### Escenario A: Petición sin cabecera `Authorization` (`401 Unauthorized`)

```bash
curl -i -s -X POST "http://localhost:3001/api/eventos-atp" \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Respuesta HTTP/JSON obtenida:**
```http
HTTP/1.1 401 Unauthorized
content-type: application/json

{"message":"Se requiere cabecera de autenticación Authorization: Bearer <token>."}
```

#### Escenario B: Token JWT de usuario Call Center sin rol Administrador ni permiso `eventos_atp:crear` (`403 Forbidden`)

```bash
CALL_TOKEN=$(curl -s -X POST "http://localhost:3001/api/seguridad/login" \
  -H "Content-Type: application/json" \
  -d '{"identificador":"callcenter@valdivia.cl","password":"Valdivia2026!"}' \
  | node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf8')); console.log(d.data?.token || d.token || '');")

curl -i -s -X POST "http://localhost:3001/api/eventos-atp" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CALL_TOKEN" \
  -d '{"nombre":"Test ATP QA","descripcion":"Prueba de acceso no autorizado para Call Center","tipoAmenaza":"METEOROLOGICA","nivelAlerta":"VERDE","fechaInicio":"2026-05-01T10:00","fechaTermino":"2026-05-02T10:00","delegacionIds":[]}'
```

**Respuesta HTTP/JSON obtenida:**
```http
HTTP/1.1 403 Forbidden
content-type: application/json

{"message":"Acceso denegado. Se requiere el perfil de Administrador o permisos de gestión de roles para acceder."}
```

#### Escenario C: Validación Zod con campos obligatorios vacíos (`400 Bad Request`)

```bash
ADMIN_TOKEN=$(curl -s -X POST "http://localhost:3001/api/seguridad/login" \
  -H "Content-Type: application/json" \
  -d '{"identificador":"admin@valdivia.cl","password":"Valdivia2026!"}' \
  | node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf8')); console.log(d.data?.token || d.token || '');")

curl -i -s -X POST "http://localhost:3001/api/eventos-atp" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"nombre":"","descripcion":"","tipoAmenaza":"METEOROLOGICA","nivelAlerta":"VERDE","fechaInicio":"","fechaTermino":""}'
```

**Respuesta HTTP/JSON obtenida:**
```http
HTTP/1.1 400 Bad Request
content-type: application/json

{"message":"Datos de creación de Evento ATP inválidos.","errors":[{"campo":"nombre","mensaje":"El nombre del evento debe tener al menos 3 caracteres"},{"campo":"descripcion","mensaje":"La descripción debe tener al menos 10 caracteres"},{"campo":"fechaInicio","mensaje":"La fecha y hora es obligatoria"},{"campo":"fechaInicio","mensaje":"El formato de fecha y hora no es válido"},{"campo":"fechaTermino","mensaje":"La fecha y hora es obligatoria"},{"campo":"fechaTermino","mensaje":"El formato de fecha y hora no es válido"}]}
```

#### Escenario D: Validación Zod con `fechaTermino` anterior a `fechaInicio` (`400 Bad Request`)

```bash
curl -i -s -X POST "http://localhost:3001/api/eventos-atp" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"nombre":"Sistema Frontal QA","descripcion":"Validacion de rango de fechas invertido","tipoAmenaza":"METEOROLOGICA","nivelAlerta":"AMARILLA","fechaInicio":"2026-05-03T18:00","fechaTermino":"2026-05-01T10:00","delegacionIds":[]}'
```

**Respuesta HTTP/JSON obtenida:**
```http
HTTP/1.1 400 Bad Request
content-type: application/json

{"message":"Datos de creación de Evento ATP inválidos.","errors":[{"campo":"fechaTermino","mensaje":"La fecha y hora de término debe ser mayor o igual a la fecha y hora de inicio"}]}
```

#### Escenario E: Validación de integridad referencial con delegación inexistente (`400 Bad Request`)

```bash
curl -i -s -X POST "http://localhost:3001/api/eventos-atp" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"nombre":"Sistema Frontal QA","descripcion":"Validacion de delegacion inexistente","tipoAmenaza":"METEOROLOGICA","nivelAlerta":"AMARILLA","fechaInicio":"2026-05-01T10:00","fechaTermino":"2026-05-03T18:00","delegacionIds":["99999999-9999-4999-8999-999999999999"]}'
```

**Respuesta HTTP/JSON obtenida:**
```http
HTTP/1.1 400 Bad Request
content-type: application/json

{"message":"Las siguientes delegaciones no existen en el sistema: 99999999-9999-4999-8999-999999999999."}
```

---

## 6. Matriz de Trazabilidad de Criterios de Aceptación

| Criterio de Aceptación (CA) | Descripción | Casos y Defectos Asociados | Estado QA |
|---|---|---|:---:|
| **CA-1** | El sistema debe proveer una vista/formulario accesible exclusivamente para el Administrador en `/gestion/admin/eventos-atp/nuevo`. | `CP-H61-WEB-01`, `CP-H61-WEB-02`, `CP-H61-WEB-03`, `BUG-H61-WEB-01`, `BUG-H61-WEB-02` | ⚠️ **OBSERVADO** |
| **CA-2** | El formulario debe capturar código único (generado o manual), nombre, descripción detallada, tipo de amenaza, nivel de alerta (Verde, Amarilla, Roja), fecha/hora de inicio y término estimada. | `CP-H61-WEB-04`, `CP-H61-WEB-05`, `CP-H61-WEB-06`, `CP-H61-WEB-11`, `BUG-H61-WEB-03`, `BUG-H61-WEB-04` | ⚠️ **OBSERVADO** |
| **CA-3** | Debe incluir un selector múltiple de delegaciones municipales afectadas (Norte, Sur, Costa, Calle Calle), permitiendo marcar una, varias o dejar vacío para alcance comunal centralizado. | `CP-H61-WEB-04`, `CP-H61-WEB-08`, `CP-H61-WEB-09` | 🟢 **CUMPLIDO** |
| **CA-4** | La API debe validar los datos mediante esquema Zod estricto: obligatoriedad de nombre, tipo de amenaza, nivel de alerta y que `fecha_termino >= fecha_inicio`. | `CP-H61-WEB-06`, `CP-H61-WEB-07`, `BUG-H61-WEB-03`, `BUG-H61-WEB-05` | ⚠️ **OBSERVADO** |
| **CA-5** | Al guardar con éxito, se debe persistir el registro en `evento_atp` con estado inicial `ACTIVO` y poblar `evento_atp_delegacion` en una sola transacción PostgreSQL. | `CP-H61-WEB-09`, `CP-H61-WEB-10` | 🟢 **CUMPLIDO** |
| **CA-6** | El sistema debe emitir en tiempo real el evento WebSocket `evento_atp:creado` a las salas `admin`, `encargado`, `supervisor` y `mapa`. | Verificado en contrato OpenAPI de `POST /api/eventos-atp` y flujo de servicio en `sgrai-api` (sin escucha activa requerida en formulario de alta H61) | 🟢 **CUMPLIDO** |
| **CA-7** | El acceso al endpoint `POST /api/eventos-atp` debe estar protegido por el permiso RBAC `eventos_atp:crear` (con desvinculación formal en Puntos Críticos). | `CP-H61-WEB-02`, `CP-H61-WEB-12`, `CP-H61-WEB-13`, `BUG-H61-WEB-02`, `BUG-H61-WEB-05` | ⚠️ **OBSERVADO** |
