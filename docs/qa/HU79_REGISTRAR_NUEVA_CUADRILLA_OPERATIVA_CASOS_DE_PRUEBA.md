# Informe y Matriz de Casos de Prueba (QA): HU-79 — Registro de Cuadrilla Operativa (Frontend Web)

> **Documento Oficial de Aseguramiento de Calidad (QA) — Frontend Web**  
> **Proyecto:** Sistema de Gestión de Recursos para Atención de Incidentes (SGRAI) — Dirección de Gestión de Riesgos de Desastres, Municipalidad de Valdivia.  
> **Módulo:** Administración / Recursos y Cuadrillas (Sección de Operaciones ICS — Unidades Pesadas de Mitigación y Despeje).  
> **Historia de Usuario:** HU-79 — *"Como Administrador Quiero registrar una nueva cuadrilla operativa en el sistema indicando su nombre, delegación municipal base y asignando al delegado responsable Para conformar las unidades operativas pesadas que atenderán emergencias logísticas y despejes en terreno"*.  
> **Desarrolladora Asignada:** Mayra Carrillo.  
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
> * `6d00d04` (`fix(cuadrillas): admitir rol DELEGADO_CUADRILLA y normalizar navegacion (H79)`) — *Fix y Head Re-Test*  
>  
> **Fecha de Auditoría Inicial QA:** 28 de Octubre de 2026 (Ciclo 1).  
> **Fecha de Auditoría Re-Test QA:** 28 de Octubre de 2026 (Ciclo 2 - Re-Test).  
> **Dictamen de Certificación QA:** 🟢 **APROBADO / CERTIFICADO PARA MERGE A DEVELOP (100% PASS)**.

---

## 1. Resumen Ejecutivo de Pruebas de Frontend Web (Ciclo Re-Test)

Tras la corrección y notificación de los cambios en el commit `6d00d04`, el equipo de QA ejecutó el ciclo formal de **Re-Test** sobre la totalidad de los 20 casos de prueba del frontend web (15 casos base funcionales, de seguridad y de integración + 5 casos de verificación de defectos).

| Métrica de Calidad | Auditoría Inicial | Ciclo Re-Test (`6d00d04`) | Estado Final |
|---|:---:|:---:|:---:|
| **Total de Casos de Prueba Auditados** | 20 | 20 | **20 / 20** |
| **Casos Aprobados (Passed)** | 15 | 20 | **20 (100%)** |
| **Casos Fallidos / Defectos Abiertos** | 5 | 0 | **0 (0%)** |
| **Defectos Abiertos en PR** | 5 | 0 | **0 Defectos** |
| **Tasa de Aprobación Global (% Pass)** | 75% | **100.0%** | 🟢 **APROBADO** |
| **Suite Automatizada de Pruebas (Vitest)** | 14 tests | **15 tests (Service + Forms + Client)** | 🟢 **15/15 PASS** |
| **Chequeo de Tipos Estáticos (TypeScript)** | 0 errores | **0 errores (`npx tsc --noEmit`)** | 🟢 **PASSED** |
| **Análisis Estático de Código (ESLint)** | 1 advertencia en test | **Limpio en componentes de cuadrillas** | 🟢 **CLEAN** |
| **Control de Acceso RBAC y Rutas** | Desvíos en enlaces | **Breadcrumbs y Cancelar alineados a `/cuadrillas`** | 🟢 **SUBSANADO** |
| **Integración en Tiempo Real (Socket.io)** | Callback vacío | **Listener activo con deselección reactiva** | 🟢 **SUBSANADO** |

---

## 2. Registro Detallado de Defectos Subsanados en Re-Test

Se formaliza el cierre de los 5 defectos detectados en la auditoría inicial de código:

| ID Defecto | Título y Resumen del Defecto | Severidad | Módulo / Archivo Afectado | Fecha Hallazgo | Estado | Solución / Commit | Fecha Re-Test |
|---|---|:---:|---|:---:|:---:|---|:---:|
| `BUG-H79-WEB-01` | Filtrado restrictivo que excluía al rol oficial `DELEGADO_CUADRILLA` en favor exclusivo de brigadistas (CA-2). | **Crítica** | `src/services/cuadrillasService.ts` y `src/components/admin/cuadrillas/CuadrillaForm.tsx` | 28/10/2026 10:15 | **CERRADO** | `6d00d04` (Filtro ampliado a `DELEGADO_CUADRILLA` y textos UI adaptados) | 28/10/2026 20:58 |
| `BUG-H79-WEB-02` | Omisión de cabecera de autenticación e identidad en `crearCuadrilla` y doble casteo forzado `as unknown` evadiendo OpenAPI. | **Alta** | `src/services/cuadrillasService.ts` y `src/types/cuadrilla.ts` | 28/10/2026 10:20 | **CERRADO** | `6d00d04` (Inyección de `Authorization: Bearer` y `x-user-id` con tipado limpio) | 28/10/2026 20:58 |
| `BUG-H79-WEB-03` | Listener WebSocket con callback vacío en `CuadrillaForm` provocando colisiones de asignación concurrente (CA-5). | **Alta** | `src/components/admin/cuadrillas/CuadrillaForm.tsx` | 28/10/2026 10:25 | **CERRADO** | `6d00d04` (Callback reactivo: deselección inmediata, aviso inline y refresco) | 28/10/2026 20:58 |
| `BUG-H79-WEB-04` | Desvío de navegación: Breadcrumb hacia Centro de Mando, botón Cancelar que expulsa al mapa y navItems saltando a `/nuevo`. | **Media** | `NuevaCuadrillaClient.tsx`, `CuadrillaForm.tsx` y `navItems.ts` | 28/10/2026 10:30 | **CERRADO** | `6d00d04` (Rutas normalizadas hacia catálogo `/gestion/admin/cuadrillas`) | 28/10/2026 20:58 |
| `BUG-H79-WEB-05` | Omisión de normalización y colapso de secuencias de espacios en blanco en el campo Nombre de la Cuadrilla. | **Media** | `CuadrillaForm.tsx` y `cuadrillasService.ts` | 28/10/2026 10:35 | **CERRADO** | `6d00d04` (Colapso regex `replace(/\s+/g, ' ')` en validación y payload) | 28/10/2026 20:58 |

---

## 3. Matriz de Trazabilidad de Criterios de Aceptación (Post Re-Test)

| Criterio de Aceptación (CA) | Descripción del Criterio | Casos de Prueba Asociados | Estado QA Final |
|---|---|---|:---:|
| **CA-1** | El sistema debe proveer un formulario en `/gestion/admin/cuadrillas/nuevo` para dar de alta una cuadrilla. | `CP-H79-WEB-01`, `CP-H79-WEB-02`, `CP-H79-WEB-13`, `CP-H79-WEB-14`, `BUG-H79-WEB-04` | 🟢 **CUMPLIDO (Navegación, Breadcrumbs y Cancelar normalizados)** |
| **CA-2** | El formulario debe capturar: Nombre de la cuadrilla (único, obligatorio), Delegación base (selector de delegaciones activas) y Selección del Delegado de Cuadrilla (usuario activo con rol `DELEGADO_CUADRILLA`). | `CP-H79-WEB-03`, `CP-H79-WEB-04`, `CP-H79-WEB-05`, `CP-H79-WEB-06`, `BUG-H79-WEB-01`, `BUG-H79-WEB-05` | 🟢 **CUMPLIDO (Soporta DELEGADO_CUADRILLA y BRIGADISTA; espacios colapsados)** |
| **CA-3** | Al guardar, se debe insertar el registro en la tabla `cuadrilla` con estado inicial `DISPONIBLE`. | `CP-H79-WEB-07`, `CP-H79-WEB-08` | 🟢 **CUMPLIDO (Persistencia 201 y estado DISPONIBLE)** |
| **CA-4** | El endpoint `POST /api/cuadrillas` debe validar unicidad de nombre y requerir permiso `recursos:crear` o rol Administrador. | `CP-H79-WEB-09`, `CP-H79-WEB-10`, `CP-H79-WEB-11`, `CP-H79-WEB-15`, `BUG-H79-WEB-02` | 🟢 **CUMPLIDO (Headers de autenticación/identidad inyectados sin casteos)** |
| **CA-5** | Se debe emitir notificación WebSocket para actualizar listados de unidades operativas. | `CP-H79-WEB-12`, `BUG-H79-WEB-03` | 🟢 **CUMPLIDO (Listener reactivo implementado ante cuadrilla:creada)** |

---

## 4. Matriz Consolidada de Casos de Prueba (13 Columnas — Ciclo Re-Test)

| ID Caso | Título del Caso de Prueba | Tipo de Prueba | Nivel | Prioridad | Precondición | Datos de Prueba (Payload / Headers / Query) | Resultado Esperado | Resultado Obtenido | Estado | Fecha / Hora Ejecución | Fecha / Hora Re-Test | Solución / Commit |
|---|---|---|---|---|---|---|---|---|:---:|:---:|:---:|---|
| `BUG-H79-WEB-01` | Filtrado restrictivo de candidatos a delegado buscando exclusivamente 'BRIGADISTA' en vez de rol 'DELEGADO_CUADRILLA' | Regla de Negocio / RBAC | DAL / Service | Crítica | Funcionario activo en BD con rol formal DELEGADO_CUADRILLA | GET /api/personal retorna lista con usuario rol_codigo: 'DELEGADO_CUADRILLA' | Selector de delegados muestra al funcionario con rol Delegado de Cuadrilla disponible para asignación | Candidatos con rol DELEGADO_CUADRILLA y BRIGADISTA se listan y seleccionan con éxito | CERRADO | 28/10/2026 10:15 | 28/10/2026 20:58 | 6d00d04 (admitir DELEGADO_CUADRILLA y BRIGADISTA) |
| `BUG-H79-WEB-02` | Omisión de cabecera de autenticación e identidad x-user-id en POST /api/cuadrillas y casteo forzado de tipos | Seguridad / Arquitectura | DAL / Client | Alta | Sesión de Administrador activa con token JWT o sesión simulada | Payload CrearCuadrillaDTO enviado sin headers de autorización explícitos | Petición incluye cabecera Authorization: Bearer y x-user-id cumpliendo contrato sin casteos ciegos | Cabeceras inyectadas limpiamente en params.header cumpliendo contrato OpenAPI | CERRADO | 28/10/2026 10:20 | 28/10/2026 20:58 | 6d00d04 (headers auth/x-user-id y tipado openapi) |
| `BUG-H79-WEB-03` | Listener WebSocket 'cuadrilla:creada' con callback vacío sin actualización reactiva de candidatos concurrentes | Concurrencia / Tiempo Real | UI / Socket | Alta | Dos administradores con el formulario de creación abierto en paralelo | Evento WS cuadrilla:creada emitido tras registro de cuadrilla con delegado X | El delegado X se desmarca o se retira de la lista de candidatos en la segunda sesión para evitar colisión | Handler remueve al candidato asignado, deselecciona si estaba marcado y sincroniza nómina | CERRADO | 28/10/2026 10:25 | 28/10/2026 20:58 | 6d00d04 (listener reactivo WS y refresco) |
| `BUG-H79-WEB-04` | Desvío de flujo de navegación en breadcrumb, menú lateral y botón Cancelar hacia Centro de Mando | Enrutamiento / UX | UI / Router | Media | Formulario de creación de cuadrilla cargado en pantalla | Clic en botón secundario 'Cancelar' o inspección de migas de pan y navItems | Navegación retorna a /gestion/admin/cuadrillas y breadcrumb refleja jerarquía de Administración | Breadcrumbs, botón Cancelar y navItems apuntan consistentemente a /gestion/admin/cuadrillas | CERRADO | 28/10/2026 10:30 | 28/10/2026 20:58 | 6d00d04 (rutas a /gestion/admin/cuadrillas) |
| `BUG-H79-WEB-05` | Omisión de normalización y colapso de secuencias de espacios en blanco en nombre de cuadrilla | Validación / Integridad | Form / Input | Media | Usuario ingresa nombre con espacios múltiples: 'Cuadrilla   Vías    Norte' | Input nombre: 'Cuadrilla   Vías    Norte' y clic en Guardar Cuadrilla | Espacios colapsados a uno solo ('Cuadrilla Vías Norte') antes de validar y enviar | Espacios múltiples colapsados automáticamente en validación y en payload enviado | CERRADO | 28/10/2026 10:35 | 28/10/2026 20:58 | 6d00d04 (colapsar espacios regex) |
| `CP-H79-WEB-01` | Acceso y renderizado del formulario en ruta canónica /gestion/admin/cuadrillas/nuevo con rol Administrador (CA-1) | Funcional | Page / UI | Crítica | Usuario Administrador autenticado en la plataforma | Navegación hacia /gestion/admin/cuadrillas/nuevo | Formulario renderizado con título 'Registrar Nueva Cuadrilla Operativa' y campos obligatorios | Formulario montado exitosamente con todos sus campos y controles operativos | APROBADO | 28/10/2026 10:40 | 28/10/2026 20:58 | 6d00d04 |
| `CP-H79-WEB-02` | Renderizado idéntico del formulario en ruta espejo /admin/cuadrillas/nuevo (CA-1) | Enrutamiento | Route / Mirror | Alta | Usuario Administrador autenticado navegando por prefijo /admin | Navegación directa a /admin/cuadrillas/nuevo | Página exporta y monta NuevaCuadrillaClient sin discrepancias | Formulario montado idénticamente en ruta espejo sin fallos de renderizado | APROBADO | 28/10/2026 10:42 | 28/10/2026 20:58 | 6d00d04 |
| `CP-H79-WEB-03` | Carga asíncrona de delegaciones municipales activas en selector desplegable (CA-2) | Integración | Form / Select | Alta | Delegaciones municipales pobladas en base de datos con campo activo = true | Montaje del componente CuadrillaForm | Selector despliega lista de delegaciones activas (Centro, Costa, Niebla, Angachilla) | Delegaciones activas cargadas en elemento select sin bloqueos de interfaz | APROBADO | 28/10/2026 10:45 | 28/10/2026 20:58 | 6d00d04 |
| `CP-H79-WEB-04` | Búsqueda interactiva con debounce de candidatos a delegado por nombre o RUT (CA-2) | Funcional / UX | UI / Search | Alta | Nómina de candidatos cargada en el estado local | Ingreso de 'Morales' o '16.789' en el input de búsqueda | Lista desplegable filtra y muestra a Andrés Morales Ríos con su RUT y delegación | Candidato desplegado en la lista con metadata y opción de selección al clic | APROBADO | 28/10/2026 10:48 | 28/10/2026 20:58 | 6d00d04 |
| `CP-H79-WEB-05` | Fijación visual del delegado seleccionado con tarjeta informativa y acción de cambio (CA-2) | Usabilidad | UI / Card | Media | Lista de candidatos desplegada en el selector | Clic sobre un candidato de la lista de opciones | Input de búsqueda reemplazado por tarjeta informativa con nombre, RUT, cargo y botón 'Cambiar Delegado' | Tarjeta informativa fijada correctamente ocultando el buscador y permitiendo reversión | APROBADO | 28/10/2026 10:50 | 28/10/2026 20:58 | 6d00d04 |
| `CP-H79-WEB-06` | Bloqueo en cliente ante campos obligatorios vacíos o nombre con menos de 3 caracteres (CA-2) | Validación | Form / Client | Alta | Formulario con campos sin completar o nombre con 2 letras | Clic directo en botón 'Guardar Cuadrilla' con nombre 'AB' | Formulario bloquea envío, resalta inputs y muestra errores inline específicos bajo cada campo | Se despliegan mensajes de error en rojo y se previene la llamada al endpoint | APROBADO | 28/10/2026 10:52 | 28/10/2026 20:58 | 6d00d04 |
| `CP-H79-WEB-07` | Envío exitoso del formulario y persistencia con estado inicial DISPONIBLE (CA-3) | Funcional | Integración | Crítica | Campos obligatorios completados con valores válidos | POST /api/cuadrillas con nombre: 'Cuadrilla Vías Valdivia', delegacionId y delegadoId | Petición procesada con HTTP 201 y cuadrilla registrada con estado inicial DISPONIBLE | Backend responde 201 Created confirmando creación con estado DISPONIBLE | APROBADO | 28/10/2026 10:55 | 28/10/2026 20:58 | 6d00d04 |
| `CP-H79-WEB-08` | Despliegue de pantalla de confirmación exitosa con resumen de cuadrilla y acciones posteriores (CA-3) | Funcional / UX | UI / Success | Alta | Respuesta exitosa 201 recibida desde el backend | Recepción del DTO CuadrillaCreada | Despliegue de tarjeta de éxito con datos de cuadrilla, delegado, estado y botones de acción | Pantalla de confirmación desplegada con resumen completo y botón para registrar otra cuadrilla | APROBADO | 28/10/2026 10:58 | 28/10/2026 20:58 | 6d00d04 |
| `CP-H79-WEB-09` | Manejo de rechazo HTTP 409 Conflict por colisión de nombre único de cuadrilla (CA-4) | Robustez | Error / 409 | Alta | Ya existe una cuadrilla activa con el nombre ingresado | POST /api/cuadrillas responde 409 Conflict con mensaje de nombre duplicado | Error resaltado específicamente bajo el campo 'Nombre de la Cuadrilla' indicando duplicidad | Input de nombre se resalta con borde rojo y muestra: 'Ya existe una cuadrilla operativa con este nombre.' | APROBADO | 28/10/2026 11:00 | 28/10/2026 20:58 | 6d00d04 |
| `CP-H79-WEB-10` | Manejo y despliegue de rechazo HTTP 400 por validación de esquema en servidor (CA-4) | Robustez | Error / 400 | Alta | Backend rechaza payload con errores estructurados Zod | Servidor responde 400 con arreglo de errores de validación | Banner de error general visible en la cabecera del formulario detallando la causa | Banner InlineNotice de error desplegado informando datos inválidos | APROBADO | 28/10/2026 11:03 | 28/10/2026 20:58 | 6d00d04 |
| `CP-H79-WEB-11` | Manejo de rechazo HTTP 404 por delegación o funcionario dado de baja durante el flujo (CA-4) | Robustez | Error / 404 | Media | Delegado dado de baja en backend mientras se completaba el formulario | Servidor responde 404 Not Found al intentar persistir | Mensaje de error general informando que el recurso seleccionado fue dado de baja | InlineNotice informa que la delegación o el funcionario seleccionado no existen o fueron dados de baja | APROBADO | 28/10/2026 11:05 | 28/10/2026 20:58 | 6d00d04 |
| `CP-H79-WEB-12` | Suscripción al canal WebSocket para sincronización en tiempo real (CA-5) | Integración | Socket.io | Media | Conexión WebSocket establecida con el servidor SGRAI | Montaje de componente CuadrillaForm | Componente suscribe listener al evento 'cuadrilla:creada' y desuscribe al desmontar | Socket registra listener para 'cuadrilla:creada' en el ciclo de vida del componente | APROBADO | 28/10/2026 11:08 | 28/10/2026 20:58 | 6d00d04 |
| `CP-H79-WEB-13` | Cierre del menú desplegable de candidatos al hacer clic fuera del contenedor (CA-1) | Usabilidad / UX | UI / Event | Media | Buscador con lista desplegable de candidatos abierta | Clic con el mouse en una zona externa al formulario | Desplegable de candidatos se cierra automáticamente preservando el estado | Menú desplegable se cierra limpiamente ante eventos mousedown fuera del nodo | APROBADO | 28/10/2026 11:10 | 28/10/2026 20:58 | 6d00d04 |
| `CP-H79-WEB-14` | Bloqueo de acceso y despliegue de AccesoDenegadoState para perfiles no autorizados (CA-4) | Seguridad / RBAC | UI / RBAC | Crítica | Usuario autenticado con rol Informante o Call Center sin permiso recursos:crear | Intento de acceso directo a /gestion/admin/cuadrillas/nuevo | Acceso bloqueado con componente AccesoDenegadoState indicando requerimiento de permiso recursos:crear | Formulario no se renderiza y se muestra vista institucional de acceso restringido 403 | APROBADO | 28/10/2026 11:15 | 28/10/2026 20:58 | 6d00d04 |
| `CP-H79-WEB-15` | Habilitación de acceso para perfil no Administrador con permiso granular recursos:crear (CA-4) | Seguridad / RBAC | UI / RBAC | Alta | Usuario con rol Encargado pero con permiso explícito recursos:crear | Navegación a /gestion/admin/cuadrillas/nuevo | Acceso concedido al formulario reconociendo el permiso granular activo | Formulario cargado y operable normalmente para el usuario facultado | APROBADO | 28/10/2026 11:20 | 28/10/2026 20:58 | 6d00d04 |

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
# Resultado obtenido: Limpio en archivos de cuadrillas (0 errores)
```

### 5.2. Ejecución de Pruebas Automatizadas (Vitest)
```bash
# Ejecución de la suite completa de pruebas unitarias y de integración de la HU-79
npm test -- src/components/admin/cuadrillas src/services/__tests__/cuadrillasService.test.ts
```
**Salida de consola obtenida:**
```text
 ✓ src/services/__tests__/cuadrillasService.test.ts (6 tests)
 ✓ src/components/admin/cuadrillas/__tests__/NuevaCuadrillaClient.test.tsx (2 tests)
 ✓ src/components/admin/cuadrillas/__tests__/CuadrillaForm.test.tsx (7 tests)

 Test Files  3 passed (3)
      Tests  15 passed (15)
```

---

## 6. Bloque TSV para Google Sheets (Copiar y Pegar en celda A1)

> [!TIP]
> Selecciona y copia todo el bloque siguiente. Haz clic en la celda **A1** de tu hoja de cálculo en Google Sheets y presiona `Ctrl + V` (`Cmd + V` en macOS) para pegar de forma instantánea las 13 columnas estructuradas con sus 20 casos documentados.

```tsv
ID Caso	Título del Caso de Prueba	Tipo de Prueba	Nivel	Prioridad	Precondición	Datos de Prueba (Payload / Headers / Query)	Resultado Esperado	Resultado Obtenido	Estado	Fecha / Hora Ejecución	Fecha / Hora Re-Test	Solución / Commit
BUG-H79-WEB-01	Filtrado restrictivo de candidatos a delegado buscando exclusivamente 'BRIGADISTA' en vez de rol 'DELEGADO_CUADRILLA'	Regla de Negocio / RBAC	DAL / Service	Crítica	Funcionario activo en BD con rol formal DELEGADO_CUADRILLA	GET /api/personal retorna lista con usuario rol_codigo: 'DELEGADO_CUADRILLA'	Selector de delegados muestra al funcionario con rol Delegado de Cuadrilla disponible para asignación	Candidatos con rol DELEGADO_CUADRILLA y BRIGADISTA se listan y seleccionan con éxito	CERRADO	28/10/2026 10:15	28/10/2026 20:58	6d00d04 (admitir DELEGADO_CUADRILLA y BRIGADISTA)
BUG-H79-WEB-02	Omisión de cabecera de autenticación e identidad x-user-id en POST /api/cuadrillas y casteo forzado de tipos	Seguridad / Arquitectura	DAL / Client	Alta	Sesión de Administrador activa con token JWT o sesión simulada	Payload CrearCuadrillaDTO enviado sin headers de autorización explícitos	Petición incluye cabecera Authorization: Bearer y x-user-id cumpliendo contrato sin casteos ciegos	Cabeceras inyectadas limpiamente en params.header cumpliendo contrato OpenAPI	CERRADO	28/10/2026 10:20	28/10/2026 20:58	6d00d04 (headers auth/x-user-id y tipado openapi)
BUG-H79-WEB-03	Listener WebSocket 'cuadrilla:creada' con callback vacío sin actualización reactiva de candidatos concurrentes	Concurrencia / Tiempo Real	UI / Socket	Alta	Dos administradores con el formulario de creación abierto en paralelo	Evento WS cuadrilla:creada emitido tras registro de cuadrilla con delegado X	El delegado X se desmarca o se retira de la lista de candidatos en la segunda sesión para evitar colisión	Handler remueve al candidato asignado, deselecciona si estaba marcado y sincroniza nómina	CERRADO	28/10/2026 10:25	28/10/2026 20:58	6d00d04 (listener reactivo WS y refresco)
BUG-H79-WEB-04	Desvío de flujo de navegación en breadcrumb, menú lateral y botón Cancelar hacia Centro de Mando	Enrutamiento / UX	UI / Router	Media	Formulario de creación de cuadrilla cargado en pantalla	Clic en botón secundario 'Cancelar' o inspección de migas de pan y navItems	Navegación retorna a /gestion/admin/cuadrillas y breadcrumb refleja jerarquía de Administración	Breadcrumbs, botón Cancelar y navItems apuntan consistentemente a /gestion/admin/cuadrillas	CERRADO	28/10/2026 10:30	28/10/2026 20:58	6d00d04 (rutas a /gestion/admin/cuadrillas)
BUG-H79-WEB-05	Omisión de normalización y colapso de secuencias de espacios en blanco en nombre de cuadrilla	Validación / Integridad	Form / Input	Media	Usuario ingresa nombre con espacios múltiples: 'Cuadrilla   Vías    Norte'	Input nombre: 'Cuadrilla   Vías    Norte' y clic en Guardar Cuadrilla	Espacios colapsados a uno solo ('Cuadrilla Vías Norte') antes de validar y enviar	Espacios múltiples colapsados automáticamente en validación y en payload enviado	CERRADO	28/10/2026 10:35	28/10/2026 20:58	6d00d04 (colapsar espacios regex)
CP-H79-WEB-01	Acceso y renderizado del formulario en ruta canónica /gestion/admin/cuadrillas/nuevo con rol Administrador (CA-1)	Funcional	Page / UI	Crítica	Usuario Administrador autenticado en la plataforma	Navegación hacia /gestion/admin/cuadrillas/nuevo	Formulario renderizado con título 'Registrar Nueva Cuadrilla Operativa' y campos obligatorios	Formulario montado exitosamente con todos sus campos y controles operativos	APROBADO	28/10/2026 10:40	28/10/2026 20:58	6d00d04
CP-H79-WEB-02	Renderizado idéntico del formulario en ruta espejo /admin/cuadrillas/nuevo (CA-1)	Enrutamiento	Route / Mirror	Alta	Usuario Administrador autenticado navegando por prefijo /admin	Navegación directa a /admin/cuadrillas/nuevo	Página exporta y monta NuevaCuadrillaClient sin discrepancias	Formulario montado idénticamente en ruta espejo sin fallos de renderizado	APROBADO	28/10/2026 10:42	28/10/2026 20:58	6d00d04
CP-H79-WEB-03	Carga asíncrona de delegaciones municipales activas en selector desplegable (CA-2)	Integración	Form / Select	Alta	Delegaciones municipales pobladas en base de datos con campo activo = true	Montaje del componente CuadrillaForm	Selector despliega lista de delegaciones activas (Centro, Costa, Niebla, Angachilla)	Delegaciones activas cargadas en elemento select sin bloqueos de interfaz	APROBADO	28/10/2026 10:45	28/10/2026 20:58	6d00d04
CP-H79-WEB-04	Búsqueda interactiva con debounce de candidatos a delegado por nombre o RUT (CA-2)	Funcional / UX	UI / Search	Alta	Nómina de candidatos cargada en el estado local	Ingreso de 'Morales' o '16.789' en el input de búsqueda	Lista desplegable filtra y muestra a Andrés Morales Ríos con su RUT y delegación	Candidato desplegado en la lista con metadata y opción de selección al clic	APROBADO	28/10/2026 10:48	28/10/2026 20:58	6d00d04
CP-H79-WEB-05	Fijación visual del delegado seleccionado con tarjeta informativa y acción de cambio (CA-2)	Usabilidad	UI / Card	Media	Lista de candidatos desplegada en el selector	Clic sobre un candidato de la lista de opciones	Input de búsqueda reemplazado por tarjeta informativa con nombre, RUT, cargo y botón 'Cambiar Delegado'	Tarjeta informativa fijada correctamente ocultando el buscador y permitiendo reversión	APROBADO	28/10/2026 10:50	28/10/2026 20:58	6d00d04
CP-H79-WEB-06	Bloqueo en cliente ante campos obligatorios vacíos o nombre con menos de 3 caracteres (CA-2)	Validación	Form / Client	Alta	Formulario con campos sin completar o nombre con 2 letras	Clic directo en botón 'Guardar Cuadrilla' con nombre 'AB'	Formulario bloquea envío, resalta inputs y muestra errores inline específicos bajo cada campo	Se despliegan mensajes de error en rojo y se previene la llamada al endpoint	APROBADO	28/10/2026 10:52	28/10/2026 20:58	6d00d04
CP-H79-WEB-07	Envío exitoso del formulario y persistencia con estado inicial DISPONIBLE (CA-3)	Funcional	Integración	Crítica	Campos obligatorios completados con valores válidos	POST /api/cuadrillas con nombre: 'Cuadrilla Vías Valdivia', delegacionId y delegadoId	Petición procesada con HTTP 201 y cuadrilla registrada con estado inicial DISPONIBLE	Backend responde 201 Created confirmando creación con estado DISPONIBLE	APROBADO	28/10/2026 10:55	28/10/2026 20:58	6d00d04
CP-H79-WEB-08	Despliegue de pantalla de confirmación exitosa con resumen de cuadrilla y acciones posteriores (CA-3)	Funcional / UX	UI / Success	Alta	Respuesta exitosa 201 recibida desde el backend	Recepción del DTO CuadrillaCreada	Despliegue de tarjeta de éxito con datos de cuadrilla, delegado, estado y botones de acción	Pantalla de confirmación desplegada con resumen completo y botón para registrar otra cuadrilla	APROBADO	28/10/2026 10:58	28/10/2026 20:58	6d00d04
CP-H79-WEB-09	Manejo de rechazo HTTP 409 Conflict por colisión de nombre único de cuadrilla (CA-4)	Robustez	Error / 409	Alta	Ya existe una cuadrilla activa con el nombre ingresado	POST /api/cuadrillas responde 409 Conflict con mensaje de nombre duplicado	Error resaltado específicamente bajo el campo 'Nombre de la Cuadrilla' indicando duplicidad	Input de nombre se resalta con borde rojo y muestra: 'Ya existe una cuadrilla operativa con este nombre.'	APROBADO	28/10/2026 11:00	28/10/2026 20:58	6d00d04
CP-H79-WEB-10	Manejo y despliegue de rechazo HTTP 400 por validación de esquema en servidor (CA-4)	Robustez	Error / 400	Alta	Backend rechaza payload con errores estructurados Zod	Servidor responde 400 con arreglo de errores de validación	Banner de error general visible en la cabecera del formulario detallando la causa	Banner InlineNotice de error desplegado informando datos inválidos	APROBADO	28/10/2026 11:03	28/10/2026 20:58	6d00d04
CP-H79-WEB-11	Manejo de rechazo HTTP 404 por delegación o funcionario dado de baja durante el flujo (CA-4)	Robustez	Error / 404	Media	Delegado dado de baja en backend mientras se completaba el formulario	Servidor responde 404 Not Found al intentar persistir	Mensaje de error general informando que el recurso seleccionado fue dado de baja	InlineNotice informa que la delegación o el funcionario seleccionado no existen o fueron dados de baja	APROBADO	28/10/2026 11:05	28/10/2026 20:58	6d00d04
CP-H79-WEB-12	Suscripción al canal WebSocket para sincronización en tiempo real (CA-5)	Integración	Socket.io	Media	Conexión WebSocket establecida con el servidor SGRAI	Montaje de componente CuadrillaForm	Componente suscribe listener al evento 'cuadrilla:creada' y desuscribe al desmontar	Socket registra listener para 'cuadrilla:creada' en el ciclo de vida del componente	APROBADO	28/10/2026 11:08	28/10/2026 20:58	6d00d04
CP-H79-WEB-13	Cierre del menú desplegable de candidatos al hacer clic fuera del contenedor (CA-1)	Usabilidad / UX	UI / Event	Media	Buscador con lista desplegable de candidatos abierta	Clic con el mouse en una zona externa al formulario	Desplegable de candidatos se cierra automáticamente preservando el estado	Menú desplegable se cierra limpiamente ante eventos mousedown fuera del nodo	APROBADO	28/10/2026 11:10	28/10/2026 20:58	6d00d04
CP-H79-WEB-14	Bloqueo de acceso y despliegue de AccesoDenegadoState para perfiles no autorizados (CA-4)	Seguridad / RBAC	UI / RBAC	Crítica	Usuario autenticado con rol Informante o Call Center sin permiso recursos:crear	Intento de acceso directo a /gestion/admin/cuadrillas/nuevo	Acceso bloqueado con componente AccesoDenegadoState indicando requerimiento de permiso recursos:crear	Formulario no se renderiza y se muestra vista institucional de acceso restringido 403	APROBADO	28/10/2026 11:15	28/10/2026 20:58	6d00d04
CP-H79-WEB-15	Habilitación de acceso para perfil no Administrador con permiso granular recursos:crear (CA-4)	Seguridad / RBAC	UI / RBAC	Alta	Usuario con rol Encargado pero con permiso explícito recursos:crear	Navegación a /gestion/admin/cuadrillas/nuevo	Acceso concedido al formulario reconociendo el permiso granular activo	Formulario cargado y operable normalmente para el usuario facultado	APROBADO	28/10/2026 11:20	28/10/2026 20:58	6d00d04
```

---

## 7. Dictamen de Certificación Final de QA

> **Dictamen Global del Ciclo Re-Test:** 🟢 **APROBADO — CERTIFICADO PARA MERGE A DEVELOP (READY FOR MERGE)**  
> 
> La rama `feature/H79-crear-cuadrilla-operativa` del frontend web `sgrai-web` ha subsanado satisfactoriamente los 5 defectos reportados, alcanzando una tasa de aprobación del 100% (20/20 casos de prueba).  
> 
> Cumple rigurosamente con los 5 Criterios de Aceptación (CA-1 al CA-5), la sincronización en tiempo real mediante WebSocket, las directrices de arquitectura de `GEMINI.md`, el contrato OpenAPI tipado sin casteos forzados, y los estándares de diseño institucional de la Municipalidad de Valdivia.  
> 
> **Recomendación:** Se aprueba formalmente el Pull Request para su merge a la rama `develop`.
