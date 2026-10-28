# Informe y Matriz de Casos de Prueba (QA): HU-79 — Registro de Cuadrilla Operativa (Frontend Web)

> **Documento Oficial de Aseguramiento de Calidad (QA) — Frontend Web**  
> **Proyecto:** Sistema de Gestión de Recursos para Atención de Incidentes (SGRAI) — Dirección de Gestión de Riesgos de Desastres, Municipalidad de Valdivia.  
> **Módulo:** Administración / Recursos y Cuadrillas (Sección de Operaciones ICS — Unidades Pesadas de Mitigación y Despeje).  
> **Historia de Usuario:** HU-79 — *"Como Administrador Quiero registrar una nueva cuadrilla operativa en el sistema indicando su nombre, delegación municipal base y asignando al delegado responsable Para conformar las unidades operativas pesadas que atenderán emergencias logísticas y despejes en terreno"*.  
> **Desarrollador Asignado:** mayra  
> **Aplicación Cliente:** `sgrai-web` (Next.js 16 + React 19 + TypeScript + CSS Modules + Vitest + Testing Library + Socket.io).  
> **Rama Git Auditada:** `feature/H79-crear-cuadrilla-operativa` (revisión de Pull Request contra rama base `develop`).  
> **Commits Clave Evaluados (Conventional Commits):**  
> * `feat(admin): implementar servicio cliente y tipos de cuadrillas operativas (H79)`  
> * `feat(admin): crear vista y formulario de registro de cuadrillas en /gestion/admin/cuadrillas/nuevo (H79)`  
> * `docs(manuales): agregar manual de usuario H79-crear-cuadrilla-operativa (H79)`  
> * `fix(admin): corregir búsqueda de delegados y simplificar redacción no técnica (H79)`  
> * `feat(admin): restringir recomendación de delegados a personal con rol de brigadista (H79)`  
> * `docs(manuales): agregar réplica en docs/manuals/H79-crear-cuadrilla-operativa (H79)`  
> * `fix(admin): corregir tipos para build de producción en CuadrillaForm e InlineNotice (H79)`  
> * `merge: sincronizar con develop e integrar compatibilidad de tipos y auth header en cuadrillas (H79)`  
>  
> **Fecha de Auditoría QA:** 28 de Octubre de 2026.  
> **Dictamen de Certificación QA:** 🔴 **RECHAZADO TEMPORALMENTE (CHANGES REQUESTED — 5 DEFECTOS DETECTADOS)**.

---

## 1. Resumen Ejecutivo de Pruebas de Frontend Web

| Métrica de Calidad | Resultado de Auditoría |
|---|:---:|
| **Total de Casos de Prueba Diseñados y Auditados** | **20** (15 Casos Funcionales/Seguridad/Integración + 5 Defectos Gestionados) |
| **Casos Aprobados (Passed)** | **15** |
| **Casos Fallidos / Defectos Abiertos (Failed / Open)** | **5** (`BUG-H79-WEB-01` al `BUG-H79-WEB-05`) |
| **Casos Bloqueados (Blocked)** | **0** |
| **Defectos Detectados y Devueltos al Desarrollador** | **5** (Estado: `ABIERTO` — Pendiente de Fix en PR) |
| **Tasa de Aprobación Inicial (% Pass)** | **75%** (Rechazado para Merge por debajo del umbral del 100%) |
| **Suite Automatizada de Pruebas (Vitest + Testing Library)** | **14/14 tests automatizados de la rama ejecutados exitosamente (`cuadrillasService.test.ts`, `CuadrillaForm.test.tsx`, `NuevaCuadrillaClient.test.tsx`)** |
| **Chequeo de Tipos Estáticos (TypeScript)** | **0 errores detectados (`npx tsc --noEmit`)** |
| **Análisis Estático de Código (ESLint)** | **Advertencias detectadas en la rama (`'empleadosService' is defined but never used` en test suite)** |
| **Control de Acceso RBAC y Rutas** | **Validado en UI (`recursos:crear` o rol `ADMINISTRADOR`), con observaciones en breadcrumbs y botones de cancelación** |
| **Integración en Tiempo Real (Socket.io)** | **No funcional: Listener de WebSocket vacío (`cuadrilla:creada`) sin actualización reactiva de estados locales** |

---

## 2. Registro Detallado de Defectos Detectados en QA (Changes Requested)

Durante la inspección forense de código fuente, contraste contra los Criterios de Aceptación (CA) y las reglas de arquitectura institucional de `GEMINI.md`, se identificaron **5 defectos reales** que motivan el rechazo del Pull Request:

| ID Defecto | Título y Resumen del Defecto | Severidad | Módulo / Archivo Afectado | Fecha Hallazgo | Estado | Solución / Commit | Fecha Re-Test |
|---|---|:---:|---|:---:|:---:|---|:---:|
| `BUG-H79-WEB-01` | Filtrado restrictivo que excluye al rol oficial `DELEGADO_CUADRILLA`, buscando únicamente "BRIGADISTA" (Violación directa de CA-2). | **Crítica** | `src/services/cuadrillasService.ts` (L252-263, L82-123), `src/components/admin/cuadrillas/CuadrillaForm.tsx` (L464, L525, L528, L535) | 28/10/2026 10:15 | **ABIERTO** | Pendiente (Rechazado en Code Review) | (Pendiente) |
| `BUG-H79-WEB-02` | Omisión de cabecera de autenticación e identidad en `crearCuadrilla` y doble casteo forzado `as unknown as Parameters<...>` evadiendo el contrato OpenAPI. | **Alta** | `src/services/cuadrillasService.ts` (L130-141) y `src/types/cuadrilla.ts` | 28/10/2026 10:20 | **ABIERTO** | Pendiente (Rechazado en Code Review) | (Pendiente) |
| `BUG-H79-WEB-03` | Listener WebSocket con callback vacío en `CuadrillaForm` provocando fallo de concurrencia y ausencia de actualización reactiva de delegados asignados (Violación de CA-5). | **Alta** | `src/components/admin/cuadrillas/CuadrillaForm.tsx` (L143-158) | 28/10/2026 10:25 | **ABIERTO** | Pendiente (Rechazado en Code Review) | (Pendiente) |
| `BUG-H79-WEB-04` | Desvío de navegación: Breadcrumb con enlace a `Centro de Mando`, botón "Cancelar" que expulsa al mapa táctico y menú lateral que salta directo a `/nuevo`. | **Media** | `src/components/admin/cuadrillas/NuevaCuadrillaClient.tsx` (L83-89), `src/components/admin/cuadrillas/CuadrillaForm.tsx` (L258-264) y `src/components/layout/navItems.ts` (L118-124) | 28/10/2026 10:30 | **ABIERTO** | Pendiente (Rechazado en Code Review) | (Pendiente) |
| `BUG-H79-WEB-05` | Omisión de normalización y colapso de espacios en blanco múltiples en el campo "Nombre de la Cuadrilla" (Riesgo de colisión e inconsistencia en BD). | **Media** | `src/components/admin/cuadrillas/CuadrillaForm.tsx` (L185-193, L219) y `src/services/cuadrillasService.ts` (L136) | 28/10/2026 10:35 | **ABIERTO** | Pendiente (Rechazado en Code Review) | (Pendiente) |

---

### Descripción Forense de los Defectos Detectados

#### 1. BUG-H79-WEB-01: Filtrado restrictivo de delegado excluye al rol `DELEGADO_CUADRILLA`
* **Severidad:** Crítica (Bloqueante de Negocio).
* **Criterio de Aceptación Incumplido:** CA-2 (*"El formulario debe capturar: Nombre de la cuadrilla (único, obligatorio), Delegación base (selector de delegaciones activas) y Selección del Delegado de Cuadrilla (usuario activo con rol `DELEGADO_CUADRILLA`)"*).
* **Evidencia en Código:** En `cuadrillasService.ts`:
  ```typescript
  const esBrigadista =
    rolCodigo === 'BRIGADISTA' ||
    rolNombre.includes('brigad') ||
    cargo.includes('brigad');
  return esBrigadista;
  ```
* **Impacto:** Si un funcionario en la base de datos ya posee el rol `DELEGADO_CUADRILLA`, o si el backend retorna usuarios con ese rol, el frontend los descarta de plano en el selector y nunca se pueden asignar. Asimismo, la UI quedó plagada de textos no institucionales (*"Buscar brigadista por nombre..."*, *"Cargando nómina de brigadistas..."*).
* **Solución requerida:** Ampliar el filtro en `obtenerCandidatosDelegados` para admitir tanto `rolCodigo === 'DELEGADO_CUADRILLA'` como `rolCodigo === 'BRIGADISTA'`, y actualizar los textos del formulario a *"Buscar delegado o brigadista..."*.

#### 2. BUG-H79-WEB-02: Omisión de headers de autenticación/identidad y casteo forzado `as unknown`
* **Severidad:** Alta (Seguridad y Arquitectura).
* **Criterio de Aceptación Incumplido:** CA-4 (*"El endpoint POST /api/cuadrillas debe validar unicidad de nombre y requerir permiso recursos:crear o rol Administrador"*).
* **Evidencia en Código:** En `cuadrillasService.ts` (L132-141):
  ```typescript
  const { data, error, response } = await apiClient.POST(
    '/api/cuadrillas' as unknown as Parameters<typeof apiClient.POST>[0],
    {
      body: { ... } as unknown as Parameters<typeof apiClient.POST>[1]['body'],
    } as unknown as Parameters<typeof apiClient.POST>[1]
  );
  ```
* **Impacto:** Viola la directriz de `GEMINI.md` (*"Nunca escribas a mano los tipos... no forzar tipos con as unknown / as any"*). Además, no se inyecta la cabecera `params: { header: { authorization: ..., 'x-user-id': ... } }` como sí se hizo en `obtenerCandidatosDelegados` y en el resto del proyecto (`recursosService.ts`, `empleadosService.ts`), provocando fallos HTTP 401/403 en entornos con sesiones simuladas o proxies API estrictos.
* **Solución requerida:** Enviar explícitamente `Authorization: Bearer <token>` y `x-user-id` en la petición, y regularizar la definición tipada de la ruta sin dobles casteos forzados.

#### 3. BUG-H79-WEB-03: Listener WebSocket con callback vacío en `CuadrillaForm`
* **Severidad:** Alta (Concurrencia y Reactividad).
* **Criterio de Aceptación Incumplido:** CA-5 (*"Se debe emitir notificación WebSocket para actualizar listados de unidades operativas"*).
* **Evidencia en Código:** En `CuadrillaForm.tsx` (L146-154):
  ```typescript
  const socket = getSocket();
  const handler = () => {
    // Evento recibido en la sala de operaciones
  };
  socket.on('cuadrilla:creada', handler);
  ```
* **Impacto:** Si dos administradores tienen abierta la pantalla de creación de cuadrillas simultáneamente y el Administrador "A" asigna al Delegado "X", la pantalla del Administrador "B" nunca se entera porque el listener no hace nada. El Administrador "B" puede intentar asignar al mismo delegado, provocando un error de colisión.
* **Solución requerida:** Implementar el callback de `handler` para remover al delegado asignado de la lista reactiva de `candidatos` o re-ejecutar `cuadrillasService.obtenerCandidatosDelegados()`.

#### 4. BUG-H79-WEB-04: Desvío en jerarquía de migas de pan y botón Cancelar
* **Severidad:** Media (Usabilidad y Navegación).
* **Criterio de Aceptación Incumplido:** CA-1 (*"El sistema debe proveer un formulario en /gestion/admin/cuadrillas/nuevo para dar de alta una cuadrilla"*).
* **Evidencia en Código:** En `NuevaCuadrillaClient.tsx` (L83-89), el breadcrumb interpone `Centro de Mando` (`/gestion/centro-incidentes`). En `CuadrillaForm.tsx` (L258-264), el botón "Cancelar" redirige a `/gestion/centro-incidentes`. En `navItems.ts` (L121), el ítem "Cuadrillas" apunta directamente a `/gestion/admin/cuadrillas/nuevo`, saltándose la vista `/gestion/admin/cuadrillas`.
* **Impacto:** Desorienta al Administrador que se encuentra trabajando en el módulo de Administración, forzándolo a la consola operativa táctica del Encargado.
* **Solución requerida:** Ajustar el breadcrumb a `Inicio › Administración › Cuadrillas › Nueva Cuadrilla`, configurar el botón Cancelar para redirigir a `/gestion/admin/cuadrillas` y apuntar el ítem de navegación de `navItems.ts` a `/gestion/admin/cuadrillas`.

#### 5. BUG-H79-WEB-05: Falta de sanitización y colapso de espacios múltiples en el nombre
* **Severidad:** Media (Integridad de Datos).
* **Criterio de Aceptación Incumplido:** CA-2 y CA-4 (Unicidad y validación de nombre).
* **Evidencia en Código:** En `CuadrillaForm.tsx` (L185) y `cuadrillasService.ts` (L136): Solo se realiza `.trim()`. Cadenas como `"Cuadrilla   Despeje    Sur"` se envían intactas con espacios redundantes intermedios.
* **Impacto:** Permite esquivar la validación de nombre único frente a `"Cuadrilla Despeje Sur"` en bases de datos que no tengan índices colapsados, generando duplicados visuales y nombres sucios en mapas y reportes.
* **Solución requerida:** Colapsar espacios consecutivos con `nombre.trim().replace(/\s+/g, ' ')`.

---

## 3. Matriz de Trazabilidad de Criterios de Aceptación

| Criterio de Aceptación (CA) | Descripción del Criterio | Casos de Prueba Asociados | Estado QA Inicial |
|---|---|---|:---:|
| **CA-1** | El sistema debe proveer un formulario en `/gestion/admin/cuadrillas/nuevo` para dar de alta una cuadrilla. | `CP-H79-WEB-01`, `CP-H79-WEB-02`, `CP-H79-WEB-13`, `CP-H79-WEB-14`, `BUG-H79-WEB-04` | **OBSERVADO (Fallas en Cancelar y Breadcrumbs)** |
| **CA-2** | El formulario debe capturar: Nombre de la cuadrilla (único, obligatorio), Delegación base (selector de delegaciones activas) y Selección del Delegado de Cuadrilla (usuario activo con rol `DELEGADO_CUADRILLA`). | `CP-H79-WEB-03`, `CP-H79-WEB-04`, `CP-H79-WEB-05`, `CP-H79-WEB-06`, `BUG-H79-WEB-01`, `BUG-H79-WEB-05` | **NO CUMPLIDO (Filtra solo Brigadistas; espacios sin colapsar)** |
| **CA-3** | Al guardar, se debe insertar el registro en la tabla `cuadrilla` con estado inicial `DISPONIBLE`. | `CP-H79-WEB-07`, `CP-H79-WEB-08` | **CUMPLIDO** |
| **CA-4** | El endpoint `POST /api/cuadrillas` debe validar unicidad de nombre y requerir permiso `recursos:crear` o rol Administrador. | `CP-H79-WEB-09`, `CP-H79-WEB-10`, `CP-H79-WEB-11`, `CP-H79-WEB-15`, `BUG-H79-WEB-02` | **OBSERVADO (Headers incompletos y casteo OpenAPI)** |
| **CA-5** | Se debe emitir notificación WebSocket para actualizar listados de unidades operativas. | `CP-H79-WEB-12`, `BUG-H79-WEB-03` | **NO CUMPLIDO (Callback vacío sin actualización)** |

---

## 4. Matriz Consolidada de Casos de Prueba (13 Columnas)

| ID Caso | Título del Caso de Prueba | Tipo de Prueba | Nivel | Prioridad | Precondición | Datos de Prueba (Payload / Headers / Query) | Resultado Esperado | Resultado Obtenido | Estado | Fecha / Hora Ejecución | Fecha / Hora Re-Test | Solución / Commit |
|---|---|---|---|---|---|---|---|---|:---:|:---:|:---:|---|
| `BUG-H79-WEB-01` | Filtrado restrictivo de candidatos a delegado buscando exclusivamente 'BRIGADISTA' en vez de rol 'DELEGADO_CUADRILLA' | Regla de Negocio / RBAC | DAL / Service | Crítica | Funcionario activo en BD con rol formal DELEGADO_CUADRILLA | GET /api/personal retorna lista con usuario rol_codigo: 'DELEGADO_CUADRILLA' | Selector de delegados muestra al funcionario con rol Delegado de Cuadrilla disponible para asignación | El filtro esBrigadista descarta al funcionario y no aparece en los resultados de búsqueda | FALLIDO | 28/10/2026 10:15 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| `BUG-H79-WEB-02` | Omisión de cabecera de autenticación e identidad x-user-id en POST /api/cuadrillas y casteo forzado de tipos | Seguridad / Arquitectura | DAL / Client | Alta | Sesión de Administrador activa con token JWT o sesión simulada | Payload CrearCuadrillaDTO enviado sin headers de autorización explícitos | Petición incluye cabecera Authorization: Bearer y x-user-id cumpliendo contrato sin casteos ciegos | Petición viaja sin headers explícitos y usa doble casteo 'as unknown as Parameters', arriesgando 401/403 | FALLIDO | 28/10/2026 10:20 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| `BUG-H79-WEB-03` | Listener WebSocket 'cuadrilla:creada' con callback vacío sin actualización reactiva de candidatos concurrentes | Concurrencia / Tiempo Real | UI / Socket | Alta | Dos administradores con el formulario de creación abierto en paralelo | Evento WS cuadrilla:creada emitido tras registro de cuadrilla con delegado X | El delegado X se desmarca o se retira de la lista de candidatos en la segunda sesión para evitar colisión | El callback del socket está vacío y no realiza ninguna acción en el componente | FALLIDO | 28/10/2026 10:25 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| `BUG-H79-WEB-04` | Desvío de flujo de navegación en breadcrumb, menú lateral y botón Cancelar hacia Centro de Mando | Enrutamiento / UX | UI / Router | Media | Formulario de creación de cuadrilla cargado en pantalla | Clic en botón secundario 'Cancelar' o inspección de migas de pan y navItems | Navegación retorna a /gestion/admin/cuadrillas y breadcrumb refleja jerarquía de Administración | Breadcrumb y botón Cancelar redirigen forzosamente a /gestion/centro-incidentes (Centro de Mando) | FALLIDO | 28/10/2026 10:30 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| `BUG-H79-WEB-05` | Omisión de normalización y colapso de secuencias de espacios en blanco en nombre de cuadrilla | Validación / Integridad | Form / Input | Media | Usuario ingresa nombre con espacios múltiples: 'Cuadrilla   Vías    Norte' | Input nombre: 'Cuadrilla   Vías    Norte' y clic en Guardar Cuadrilla | Espacios colapsados a uno solo ('Cuadrilla Vías Norte') antes de validar y enviar | Se envía la cadena con espacios redundantes permitiendo esquivar unicidad estricta | FALLIDO | 28/10/2026 10:35 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| `CP-H79-WEB-01` | Acceso y renderizado del formulario en ruta canónica /gestion/admin/cuadrillas/nuevo con rol Administrador (CA-1) | Funcional | Page / UI | Crítica | Usuario Administrador autenticado en la plataforma | Navegación hacia /gestion/admin/cuadrillas/nuevo | Formulario renderizado con título 'Registrar Nueva Cuadrilla Operativa' y campos obligatorios | Formulario montado exitosamente con todos sus campos y controles operativos | APROBADO | 28/10/2026 10:40 | - | feat(admin): crear vista y formulario de registro de cuadrillas en /gestion/admin/cuadrillas/nuevo (H79) |
| `CP-H79-WEB-02` | Renderizado idéntico del formulario en ruta espejo /admin/cuadrillas/nuevo (CA-1) | Enrutamiento | Route / Mirror | Alta | Usuario Administrador autenticado navegando por prefijo /admin | Navegación directa a /admin/cuadrillas/nuevo | Página exporta y monta NuevaCuadrillaClient sin discrepancias | Formulario montado idénticamente en ruta espejo sin fallos de renderizado | APROBADO | 28/10/2026 10:42 | - | feat(admin): crear vista y formulario de registro de cuadrillas en /gestion/admin/cuadrillas/nuevo (H79) |
| `CP-H79-WEB-03` | Carga y despliegue del catálogo de delegaciones municipales activas en el selector (CA-2) | Integración | Form / Select | Alta | Catálogo de delegaciones disponible vía catalogosService | Inspección del elemento select 'delegacion-base' | Dropdown poblado con opciones territoriales (Norte, Sur, Costa, Calle Calle) | Dropdown poblado correctamente con las delegaciones activas del catálogo | APROBADO | 28/10/2026 10:45 | - | feat(admin): implementar servicio cliente y tipos de cuadrillas operativas (H79) |
| `CP-H79-WEB-04` | Búsqueda interactiva con debounce de candidatos a delegado por nombre o RUT (CA-2) | Funcional / UX | UI / Search | Alta | Nómina de candidatos cargada en el estado local | Ingreso de 'Morales' o '16.789' en el input de búsqueda | Lista desplegable filtra y muestra a Andrés Morales Ríos con su RUT y delegación | Candidato desplegado en la lista con metadata y opción de selección al clic | APROBADO | 28/10/2026 10:48 | - | fix(admin): corregir búsqueda de delegados y simplificar redacción no técnica (H79) |
| `CP-H79-WEB-05` | Fijación visual del delegado seleccionado con tarjeta informativa y acción de cambio (CA-2) | Usabilidad | UI / Card | Media | Lista de candidatos desplegada en el selector | Clic sobre un candidato de la lista de opciones | Input de búsqueda reemplazado por tarjeta informativa con nombre, RUT, cargo y botón 'Cambiar Delegado' | Tarjeta informativa fijada correctamente ocultando el buscador y permitiendo reversión | APROBADO | 28/10/2026 10:50 | - | feat(admin): crear vista y formulario de registro de cuadrillas en /gestion/admin/cuadrillas/nuevo (H79) |
| `CP-H79-WEB-06` | Bloqueo en cliente ante campos obligatorios vacíos o nombre con menos de 3 caracteres (CA-2) | Validación | Form / Client | Alta | Formulario con campos sin completar o nombre con 2 letras | Clic directo en botón 'Guardar Cuadrilla' con nombre 'AB' | Formulario bloquea envío, resalta inputs y muestra errores inline específicos bajo cada campo | Se despliegan mensajes de error en rojo y se previene la llamada al endpoint | APROBADO | 28/10/2026 10:52 | - | feat(admin): crear vista y formulario de registro de cuadrillas en /gestion/admin/cuadrillas/nuevo (H79) |
| `CP-H79-WEB-07` | Envío exitoso del formulario y persistencia con estado inicial DISPONIBLE (CA-3) | Funcional | Integración | Crítica | Campos obligatorios completados con valores válidos | POST /api/cuadrillas con nombre: 'Cuadrilla Vías Valdivia', delegacionId y delegadoId | Petición procesada con HTTP 201 y cuadrilla registrada con estado inicial DISPONIBLE | Backend responde 201 Created confirmando creación con estado DISPONIBLE | APROBADO | 28/10/2026 10:55 | - | feat(admin): implementar servicio cliente y tipos de cuadrillas operativas (H79) |
| `CP-H79-WEB-08` | Despliegue de pantalla de confirmación exitosa con resumen de cuadrilla y acciones posteriores (CA-3) | Funcional / UX | UI / Success | Alta | Respuesta exitosa 201 recibida desde el backend | Recepción del DTO CuadrillaCreada | Despliegue de tarjeta de éxito con datos de cuadrilla, delegado, estado y botones de acción | Pantalla de confirmación desplegada con resumen completo y botón para registrar otra cuadrilla | APROBADO | 28/10/2026 10:58 | - | feat(admin): crear vista y formulario de registro de cuadrillas en /gestion/admin/cuadrillas/nuevo (H79) |
| `CP-H79-WEB-09` | Manejo de rechazo HTTP 409 Conflict por colisión de nombre único de cuadrilla (CA-4) | Robustez | Error / 409 | Alta | Ya existe una cuadrilla activa con el nombre ingresado | POST /api/cuadrillas responde 409 Conflict con mensaje de nombre duplicado | Error resaltado específicamente bajo el campo 'Nombre de la Cuadrilla' indicando duplicidad | Input de nombre se resalta con borde rojo y muestra: 'Ya existe una cuadrilla operativa con este nombre.' | APROBADO | 28/10/2026 11:00 | - | feat(admin): implementar servicio cliente y tipos de cuadrillas operativas (H79) |
| `CP-H79-WEB-10` | Manejo y despliegue de rechazo HTTP 400 por validación de esquema en servidor (CA-4) | Robustez | Error / 400 | Alta | Backend rechaza payload con errores estructurados Zod | Servidor responde 400 con arreglo de errores de validación | Banner de error general visible en la cabecera del formulario detallando la causa | Banner InlineNotice de error desplegado informando datos inválidos | APROBADO | 28/10/2026 11:03 | - | fix(admin): corregir tipos para build de producción en CuadrillaForm e InlineNotice (H79) |
| `CP-H79-WEB-11` | Manejo de rechazo HTTP 404 por delegación o funcionario dado de baja durante el flujo (CA-4) | Robustez | Error / 404 | Media | Delegado dado de baja en backend mientras se completaba el formulario | Servidor responde 404 Not Found al intentar persistir | Mensaje de error general informando que el recurso seleccionado fue dado de baja | InlineNotice informa que la delegación o el funcionario seleccionado no existen o fueron dados de baja | APROBADO | 28/10/2026 11:05 | - | feat(admin): implementar servicio cliente y tipos de cuadrillas operativas (H79) |
| `CP-H79-WEB-12` | Suscripción al canal WebSocket para sincronización en tiempo real (CA-5) | Integración | Socket.io | Media | Conexión WebSocket establecida con el servidor SGRAI | Montaje de componente CuadrillaForm | Componente suscribe listener al evento 'cuadrilla:creada' y desuscribe al desmontar | Socket registra listener para 'cuadrilla:creada' en el ciclo de vida del componente | APROBADO | 28/10/2026 11:08 | - | feat(admin): crear vista y formulario de registro de cuadrillas en /gestion/admin/cuadrillas/nuevo (H79) |
| `CP-H79-WEB-13` | Cierre del menú desplegable de candidatos al hacer clic fuera del contenedor (CA-1) | Usabilidad / UX | UI / Event | Media | Buscador con lista desplegable de candidatos abierta | Clic con el mouse en una zona externa al formulario | Desplegable de candidatos se cierra automáticamente preservando el estado | Menú desplegable se cierra limpiamente ante eventos mousedown fuera del nodo | APROBADO | 28/10/2026 11:10 | - | feat(admin): crear vista y formulario de registro de cuadrillas en /gestion/admin/cuadrillas/nuevo (H79) |
| `CP-H79-WEB-14` | Bloqueo de acceso y despliegue de AccesoDenegadoState para perfiles no autorizados (CA-4) | Seguridad / RBAC | UI / RBAC | Crítica | Usuario autenticado con rol Informante o Call Center sin permiso recursos:crear | Intento de acceso directo a /gestion/admin/cuadrillas/nuevo | Acceso bloqueado con componente AccesoDenegadoState indicando requerimiento de permiso recursos:crear | Formulario no se renderiza y se muestra vista institucional de acceso restringido 403 | APROBADO | 28/10/2026 11:15 | - | feat(admin): crear vista y formulario de registro de cuadrillas en /gestion/admin/cuadrillas/nuevo (H79) |
| `CP-H79-WEB-15` | Habilitación de acceso para perfil no Administrador con permiso granular recursos:crear (CA-4) | Seguridad / RBAC | UI / RBAC | Alta | Usuario con rol Encargado pero con permiso explícito recursos:crear | Navegación a /gestion/admin/cuadrillas/nuevo | Acceso concedido al formulario reconociendo el permiso granular activo | Formulario cargado y operable normalmente para el usuario facultado | APROBADO | 28/10/2026 11:20 | - | feat(admin): crear vista y formulario de registro de cuadrillas en /gestion/admin/cuadrillas/nuevo (H79) |

---

## 5. Guía de Ejecución y Casos Replicables Paso a Paso

Para auditar y replicar de manera forense los resultados obtenidos en este informe de QA, ejecute los siguientes comandos en la raíz del repositorio `sgrai-web`:

### 5.1. Verificación Estática y Compilación
```bash
# 1. Chequeo de tipado estático TypeScript
npx tsc --noEmit
# Resultado obtenido: Código de salida 0 (0 errores de tipado)

# 2. Análisis estático ESLint
npm run lint
# Resultado obtenido: 13 observaciones (2 errores en hooks globales preexistentes, 1 warning en tests de cuadrillas)
```

### 5.2. Ejecución de Pruebas Automatizadas (Vitest)
```bash
# Ejecución de la suite completa de pruebas unitarias y de integración de la HU-79
npm test -- src/components/admin/cuadrillas src/services/__tests__/cuadrillasService.test.ts
```
**Salida de consola obtenida:**
```text
 ✓ src/services/__tests__/cuadrillasService.test.ts (6 tests) 43ms
 ✓ src/components/admin/cuadrillas/__tests__/NuevaCuadrillaClient.test.tsx (2 tests) 492ms
 ✓ src/components/admin/cuadrillas/__tests__/CuadrillaForm.test.tsx (6 tests) 1330ms

 Test Files  3 passed (3)
      Tests  14 passed (14)
```

### 5.3. Casos Replicables con cURL y Contratos HTTP

#### Caso 1: Creación Exitosa de Cuadrilla Operativa (CP-H79-WEB-07)
```bash
curl -X POST http://localhost:3001/api/cuadrillas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN_ADMIN>" \
  -H "x-user-id: 00000000-0000-4000-8000-000000000001" \
  -d '{
    "nombre": "Cuadrilla Vías Valdivia",
    "delegacionId": "00000000-0000-4000-a000-000000000001",
    "usuarioDelegadoId": "00000000-0000-4000-8000-000000000006"
  }'
```
**Respuesta HTTP 201 Created esperada:**
```json
{
  "message": "Cuadrilla operativa registrada exitosamente.",
  "data": {
    "id": "11111111-2222-4000-8000-333333333333",
    "nombre": "Cuadrilla Vías Valdivia",
    "estado": "DISPONIBLE",
    "delegacion": {
      "id": "00000000-0000-4000-a000-000000000001",
      "nombre": "Delegación Municipal Norte"
    },
    "delegado": {
      "id": "00000000-0000-4000-8000-000000000006",
      "nombre": "Andrés Morales Ríos",
      "email": "andres.morales@valdivia.cl",
      "rut": "16.789.012-3"
    },
    "creadoEn": "2026-10-28T10:55:00.000Z"
  }
}
```

#### Caso 2: Colisión de Nombre Único (CP-H79-WEB-09 / BUG-H79-WEB-05)
```bash
curl -X POST http://localhost:3001/api/cuadrillas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN_ADMIN>" \
  -H "x-user-id: 00000000-0000-4000-8000-000000000001" \
  -d '{
    "nombre": "Cuadrilla Vías Valdivia",
    "delegacionId": "00000000-0000-4000-a000-000000000001",
    "usuarioDelegadoId": "00000000-0000-4000-8000-000000000010"
  }'
```
**Respuesta HTTP 409 Conflict esperada:**
```json
{
  "statusCode": 409,
  "error": "Conflict",
  "message": "Ya existe una cuadrilla operativa con este nombre."
}
```

#### Caso 3: Rechazo de Acceso por Falta de Permisos RBAC (CP-H79-WEB-14)
```bash
curl -X POST http://localhost:3001/api/cuadrillas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN_INFORMANTE>" \
  -d '{
    "nombre": "Cuadrilla No Autorizada",
    "delegacionId": "00000000-0000-4000-a000-000000000001",
    "usuarioDelegadoId": "00000000-0000-4000-8000-000000000006"
  }'
```
**Respuesta HTTP 403 Forbidden esperada:**
```json
{
  "statusCode": 403,
  "error": "Forbidden",
  "message": "No cuenta con el permiso requerido (recursos:crear) o rol Administrador para dar de alta cuadrillas."
}
```

---

## 6. Bloque TSV para Copiar y Pegar en Google Sheets

> **Instrucciones:** Selecciona y copia el bloque completo a continuación. En tu hoja de cálculo institucional de Google Sheets, selecciona la celda **`A1`** y presiona `Ctrl + V`.

```tsv
ID Caso	Título del Caso de Prueba	Tipo de Prueba	Nivel	Prioridad	Precondición	Datos de Prueba (Payload / Headers / Query)	Resultado Esperado	Resultado Obtenido	Estado	Fecha / Hora Ejecución	Fecha / Hora Re-Test	Solución / Commit
BUG-H79-WEB-01	Filtrado restrictivo de candidatos a delegado buscando exclusivamente 'BRIGADISTA' en vez de rol 'DELEGADO_CUADRILLA'	Regla de Negocio / RBAC	DAL / Service	Crítica	Funcionario activo en BD con rol formal DELEGADO_CUADRILLA	GET /api/personal retorna lista con usuario rol_codigo: 'DELEGADO_CUADRILLA'	Selector de delegados muestra al funcionario con rol Delegado de Cuadrilla disponible para asignación	El filtro esBrigadista descarta al funcionario y no aparece en los resultados de búsqueda	FALLIDO	28/10/2026 10:15	(Pendiente)	Pendiente (Rechazado en Code Review)
BUG-H79-WEB-02	Omisión de cabecera de autenticación e identidad x-user-id en POST /api/cuadrillas y casteo forzado de tipos	Seguridad / Arquitectura	DAL / Client	Alta	Sesión de Administrador activa con token JWT o sesión simulada	Payload CrearCuadrillaDTO enviado sin headers de autorización explícitos	Petición incluye cabecera Authorization: Bearer y x-user-id cumpliendo contrato sin casteos ciegos	Petición viaja sin headers explícitos y usa doble casteo 'as unknown as Parameters', arriesgando 401/403	FALLIDO	28/10/2026 10:20	(Pendiente)	Pendiente (Rechazado en Code Review)
BUG-H79-WEB-03	Listener WebSocket 'cuadrilla:creada' con callback vacío sin actualización reactiva de candidatos concurrentes	Concurrencia / Tiempo Real	UI / Socket	Alta	Dos administradores con el formulario de creación abierto en paralelo	Evento WS cuadrilla:creada emitido tras registro de cuadrilla con delegado X	El delegado X se desmarca o se retira de la lista de candidatos en la segunda sesión para evitar colisión	El callback del socket está vacío y no realiza ninguna acción en el componente	FALLIDO	28/10/2026 10:25	(Pendiente)	Pendiente (Rechazado en Code Review)
BUG-H79-WEB-04	Desvío de flujo de navegación en breadcrumb, menú lateral y botón Cancelar hacia Centro de Mando	Enrutamiento / UX	UI / Router	Media	Formulario de creación de cuadrilla cargado en pantalla	Clic en botón secundario 'Cancelar' o inspección de migas de pan y navItems	Navegación retorna a /gestion/admin/cuadrillas y breadcrumb refleja jerarquía de Administración	Breadcrumb y botón Cancelar redirigen forzosamente a /gestion/centro-incidentes (Centro de Mando)	FALLIDO	28/10/2026 10:30	(Pendiente)	Pendiente (Rechazado en Code Review)
BUG-H79-WEB-05	Omisión de normalización y colapso de secuencias de espacios en blanco en nombre de cuadrilla	Validación / Integridad	Form / Input	Media	Usuario ingresa nombre con espacios múltiples: 'Cuadrilla   Vías    Norte'	Input nombre: 'Cuadrilla   Vías    Norte' y clic en Guardar Cuadrilla	Espacios colapsados a uno solo ('Cuadrilla Vías Norte') antes de validar y enviar	Se envía la cadena con espacios redundantes permitiendo esquivar unicidad estricta	FALLIDO	28/10/2026 10:35	(Pendiente)	Pendiente (Rechazado en Code Review)
CP-H79-WEB-01	Acceso y renderizado del formulario en ruta canónica /gestion/admin/cuadrillas/nuevo con rol Administrador (CA-1)	Funcional	Page / UI	Crítica	Usuario Administrador autenticado en la plataforma	Navegación hacia /gestion/admin/cuadrillas/nuevo	Formulario renderizado con título 'Registrar Nueva Cuadrilla Operativa' y campos obligatorios	Formulario montado exitosamente con todos sus campos y controles operativos	APROBADO	28/10/2026 10:40	-	feat(admin): crear vista y formulario de registro de cuadrillas en /gestion/admin/cuadrillas/nuevo (H79)
CP-H79-WEB-02	Renderizado idéntico del formulario en ruta espejo /admin/cuadrillas/nuevo (CA-1)	Enrutamiento	Route / Mirror	Alta	Usuario Administrador autenticado navegando por prefijo /admin	Navegación directa a /admin/cuadrillas/nuevo	Página exporta y monta NuevaCuadrillaClient sin discrepancias	Formulario montado idénticamente en ruta espejo sin fallos de renderizado	APROBADO	28/10/2026 10:42	-	feat(admin): crear vista y formulario de registro de cuadrillas en /gestion/admin/cuadrillas/nuevo (H79)
CP-H79-WEB-03	Carga y despliegue del catálogo de delegaciones municipales activas en el selector (CA-2)	Integración	Form / Select	Alta	Catálogo de delegaciones disponible vía catalogosService	Inspección del elemento select 'delegacion-base'	Dropdown poblado con opciones territoriales (Norte, Sur, Costa, Calle Calle)	Dropdown poblado correctamente con las delegaciones activas del catálogo	APROBADO	28/10/2026 10:45	-	feat(admin): implementar servicio cliente y tipos de cuadrillas operativas (H79)
CP-H79-WEB-04	Búsqueda interactiva con debounce de candidatos a delegado por nombre o RUT (CA-2)	Funcional / UX	UI / Search	Alta	Nómina de candidatos cargada en el estado local	Ingreso de 'Morales' o '16.789' en el input de búsqueda	Lista desplegable filtra y muestra a Andrés Morales Ríos con su RUT y delegación	Candidato desplegado en la lista con metadata y opción de selección al clic	APROBADO	28/10/2026 10:48	-	fix(admin): corregir búsqueda de delegados y simplificar redacción no técnica (H79)
CP-H79-WEB-05	Fijación visual del delegado seleccionado con tarjeta informativa y acción de cambio (CA-2)	Usabilidad	UI / Card	Media	Lista de candidatos desplegada en el selector	Clic sobre un candidato de la lista de opciones	Input de búsqueda reemplazado por tarjeta informativa con nombre, RUT, cargo y botón 'Cambiar Delegado'	Tarjeta informativa fijada correctamente ocultando el buscador y permitiendo reversión	APROBADO	28/10/2026 10:50	-	feat(admin): crear vista y formulario de registro de cuadrillas en /gestion/admin/cuadrillas/nuevo (H79)
CP-H79-WEB-06	Bloqueo en cliente ante campos obligatorios vacíos o nombre con menos de 3 caracteres (CA-2)	Validación	Form / Client	Alta	Formulario con campos sin completar o nombre con 2 letras	Clic directo en botón 'Guardar Cuadrilla' con nombre 'AB'	Formulario bloquea envío, resalta inputs y muestra errores inline específicos bajo cada campo	Se despliegan mensajes de error en rojo y se previene la llamada al endpoint	APROBADO	28/10/2026 10:52	-	feat(admin): crear vista y formulario de registro de cuadrillas en /gestion/admin/cuadrillas/nuevo (H79)
CP-H79-WEB-07	Envío exitoso del formulario y persistencia con estado inicial DISPONIBLE (CA-3)	Funcional	Integración	Crítica	Campos obligatorios completados con valores válidos	POST /api/cuadrillas con nombre: 'Cuadrilla Vías Valdivia', delegacionId y delegadoId	Petición procesada con HTTP 201 y cuadrilla registrada con estado inicial DISPONIBLE	Backend responde 201 Created confirmando creación con estado DISPONIBLE	APROBADO	28/10/2026 10:55	-	feat(admin): implementar servicio cliente y tipos de cuadrillas operativas (H79)
CP-H79-WEB-08	Despliegue de pantalla de confirmación exitosa con resumen de cuadrilla y acciones posteriores (CA-3)	Funcional / UX	UI / Success	Alta	Respuesta exitosa 201 recibida desde el backend	Recepción del DTO CuadrillaCreada	Despliegue de tarjeta de éxito con datos de cuadrilla, delegado, estado y botones de acción	Pantalla de confirmación desplegada con resumen completo y botón para registrar otra cuadrilla	APROBADO	28/10/2026 10:58	-	feat(admin): crear vista y formulario de registro de cuadrillas en /gestion/admin/cuadrillas/nuevo (H79)
CP-H79-WEB-09	Manejo de rechazo HTTP 409 Conflict por colisión de nombre único de cuadrilla (CA-4)	Robustez	Error / 409	Alta	Ya existe una cuadrilla activa con el nombre ingresado	POST /api/cuadrillas responde 409 Conflict con mensaje de nombre duplicado	Error resaltado específicamente bajo el campo 'Nombre de la Cuadrilla' indicando duplicidad	Input de nombre se resalta con borde rojo y muestra: 'Ya existe una cuadrilla operativa con este nombre.'	APROBADO	28/10/2026 11:00	-	feat(admin): implementar servicio cliente y tipos de cuadrillas operativas (H79)
CP-H79-WEB-10	Manejo y despliegue de rechazo HTTP 400 por validación de esquema en servidor (CA-4)	Robustez	Error / 400	Alta	Backend rechaza payload con errores estructurados Zod	Servidor responde 400 con arreglo de errores de validación	Banner de error general visible en la cabecera del formulario detallando la causa	Banner InlineNotice de error desplegado informando datos inválidos	APROBADO	28/10/2026 11:03	-	fix(admin): corregir tipos para build de producción en CuadrillaForm e InlineNotice (H79)
CP-H79-WEB-11	Manejo de rechazo HTTP 404 por delegación o funcionario dado de baja durante el flujo (CA-4)	Robustez	Error / 404	Media	Delegado dado de baja en backend mientras se completaba el formulario	Servidor responde 404 Not Found al intentar persistir	Mensaje de error general informando que el recurso seleccionado fue dado de baja	InlineNotice informa que la delegación o el funcionario seleccionado no existen o fueron dados de baja	APROBADO	28/10/2026 11:05	-	feat(admin): implementar servicio cliente y tipos de cuadrillas operativas (H79)
CP-H79-WEB-12	Suscripción al canal WebSocket para sincronización en tiempo real (CA-5)	Integración	Socket.io	Media	Conexión WebSocket establecida con el servidor SGRAI	Montaje de componente CuadrillaForm	Componente suscribe listener al evento 'cuadrilla:creada' y desuscribe al desmontar	Socket registra listener para 'cuadrilla:creada' en el ciclo de vida del componente	APROBADO	28/10/2026 11:08	-	feat(admin): crear vista y formulario de registro de cuadrillas en /gestion/admin/cuadrillas/nuevo (H79)
CP-H79-WEB-13	Cierre del menú desplegable de candidatos al hacer clic fuera del contenedor (CA-1)	Usabilidad / UX	UI / Event	Media	Buscador con lista desplegable de candidatos abierta	Clic con el mouse en una zona externa al formulario	Desplegable de candidatos se cierra automáticamente preservando el estado	Menú desplegable se cierra limpiamente ante eventos mousedown fuera del nodo	APROBADO	28/10/2026 11:10	-	feat(admin): crear vista y formulario de registro de cuadrillas en /gestion/admin/cuadrillas/nuevo (H79)
CP-H79-WEB-14	Bloqueo de acceso y despliegue de AccesoDenegadoState para perfiles no autorizados (CA-4)	Seguridad / RBAC	UI / RBAC	Crítica	Usuario autenticado con rol Informante o Call Center sin permiso recursos:crear	Intento de acceso directo a /gestion/admin/cuadrillas/nuevo	Acceso bloqueado con componente AccesoDenegadoState indicando requerimiento de permiso recursos:crear	Formulario no se renderiza y se muestra vista institucional de acceso restringido 403	APROBADO	28/10/2026 11:15	-	feat(admin): crear vista y formulario de registro de cuadrillas en /gestion/admin/cuadrillas/nuevo (H79)
CP-H79-WEB-15	Habilitación de acceso para perfil no Administrador con permiso granular recursos:crear (CA-4)	Seguridad / RBAC	UI / RBAC	Alta	Usuario con rol Encargado pero con permiso explícito recursos:crear	Navegación a /gestion/admin/cuadrillas/nuevo	Acceso concedido al formulario reconociendo el permiso granular activo	Formulario cargado y operable normalmente para el usuario facultado	APROBADO	28/10/2026 11:20	-	fix(admin): corregir búsqueda de delegados y simplificar redacción no técnica (H79)
```

---

## 7. Dictamen de Certificación Final de QA

La rama `feature/H79-crear-cuadrilla-operativa` presenta avances sustanciales en la interfaz gráfica con apego al estándar visual institucional (paleta municipal, Noto Sans, esquinas rectas, ausencia de emojis y componentes base `Heading` y `Button`). Sin embargo:

1. **Incumple el Criterio de Aceptación CA-2:** El filtro de selección excluye a usuarios que ya poseen el rol oficial `DELEGADO_CUADRILLA` en favor exclusivo de brigadistas.
2. **Presenta vulnerabilidad de concurrencia en CA-5:** El listener WebSocket `cuadrilla:creada` se encuentra vacío, impidiendo la reactividad en tiempo real ante la asignación concurrente de delegados.
3. **Discrepancia de arquitectura y contrato en `cuadrillasService.ts`:** Omisión de cabeceras de autorización/identidad y empleo de doble casteo forzado `as unknown as Parameters<...>` para evadir el contrato OpenAPI.
4. **Desvío de navegación:** Confusión en la jerarquía de migas de pan y botón cancelar que expulsan al usuario hacia el Centro de Mando operativo.

Por consiguiente, el Pull Request queda formalmente en estado:

🔴 **RECHAZADO TEMPORALMENTE (CHANGES REQUESTED)**

La rama no será integrada a `develop` hasta que el equipo de desarrollo aplique los fixes solicitados y se ejecute el ciclo de re-test correspondiente.

