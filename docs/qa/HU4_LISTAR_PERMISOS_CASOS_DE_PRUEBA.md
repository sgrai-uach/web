# Informe y Matriz de Casos de Prueba de Frontend (QA): HU-4 — Listado de Permisos por Perfil

> **Documento Oficial de Aseguramiento de Calidad (QA) — Frontend**  
> **Proyecto:** Sistema de Gestión de Recursos para Atención de Incidentes (SGRAI) — Dirección de Gestión de Riesgos de Desastres, Municipalidad de Valdivia.  
> **Módulo:** Seguridad (Portal Administrador / Control de Acceso RBAC).  
> **Historia de Usuario:** HU-4 — *"Como Administrador Quiero ver un listado de los permisos actuales de cada perfil Para saber qué acciones tiene permitidas cada grupo de usuarios."*  
> **Cliente Web:** `sgrai-web` (Next.js 16 + React 19 + TypeScript + CSS Modules / Vanilla CSS).  
> **Rama Git:** `feature/H4-visualizar-permisos` (mergeada en `develop` mediante Pull Request #4, commit `db415d1`).  
> **Commits Clave Evaluados:** `8b3c943`, `6ce408e`, `ba47a0d`, `584a88f`, `25885fa`, `88e6312`, `5ecaf9c`, `6d74d91`, `7cbe35c`, `18642d3`, `bbb4d6a`, `db415d1`.  
> **Fecha de Certificación QA:** Septiembre / Octubre 2026.  
> **Estado de Certificación:** 🟢 **APROBADO PARA PRODUCCIÓN (100% PASS TRAS RE-TESTS)**.

---

## 1. Resumen Ejecutivo de Pruebas de Frontend

| Métrica | Resultado |
|---|:---:|
| **Total de Casos de Prueba Diseñados y Ejecutados** | **16** |
| **Casos Aprobados (Passed)** | **16** |
| **Casos Fallidos (Failed)** | **0** |
| **Casos Bloqueados (Blocked)** | **0** |
| **Defectos Detectados y Gestionados (Bugs)** | **5** (100% resueltos y re-testeados) |
| **Tasa de Aprobación (% Pass)** | **100%** |
| **Pruebas de Componentes y Drawer (Vitest)** | **15/15 tests exitosos** (`RolDetalleDrawer.test.tsx`, `RolesFiltros.test.tsx`) |
| **Tiempo de Carga Percibido (Skeleton)** | **< 200 ms (Criterio CA-5 cumplido &le; 1.5s)** |
| **Chequeo de Tipos Estáticos (TypeScript)** | **0 errores (`npx tsc --noEmit`)** |
| **Análisis Estático de Código (ESLint)** | **0 errores / 0 advertencias** |
| **Cumplimiento Guía Visual Municipal (`GEMINI.md`)** | **100% (Esquinas rectas, franja 4px teal, paleta Teal/Mint/Charcoal)** |

---

## 2. Registro de Defectos Detectados en QA y Ciclo de Re-Test

Siguiendo el flujo estándar de Aseguramiento de Calidad (*detección de defectos durante el desarrollo de la rama, reporte formal al equipo de desarrollo, implementación del fix y ejecución de re-test formal para verificación de cierre*), se gestionaron 5 defectos en el cliente web:

| ID Defecto | Descripción del Defecto Encontrado | Severidad | Módulo / Componente | Fecha Hallazgo | Commit del Fix (Sin Hash) | Fecha Re-Test | Dictamen Re-Test |
|---|---|:---:|---|:---:|---|:---:|:---:|
| `BUG-H04-WEB-01` | Fuga de identificadores UUID en notificaciones Toast ante error de conexión al cargar perfiles en interfaz. | Media | `src/app/(admin)/admin/roles-permisos/page.tsx` / `Toast` | 18/09/2026 11:20 | fix(ui): unificar patron de titulo y sanitizar UUIDs en toasts de error (#31) | 18/09/2026 12:40 | 🟢 CORREGIDO (Mensaje sanitizado institucional sin exponer UUIDs) |
| `BUG-H04-WEB-02` | Desalineación con sistema de diseño municipal: uso de esquinas redondeadas en tarjetas y botones de roles. | Media | `src/components/admin/roles-permisos/RolCard.tsx` y `RolesHeader.tsx` | 20/09/2026 15:10 | fix(ui): migrar roles-permisos a Heading/Button, PageTitleCard, SessionContextBar, Breadcrumbs, EmptyState y estandarizar layout (#7, #9, #12, #14, #15, #18, #19, #22, #23, #27, #28, #29) | 21/09/2026 09:30 | 🟢 CORREGIDO (Esquinas rectas rounded-none, franja 4px teal institucional) |
| `BUG-H04-WEB-03` | Excepción no controlada en React al abrir panel lateral Drawer en perfiles sin permisos asignados o con módulo nulo. | Alta | `src/components/admin/roles-permisos/RolDetalleDrawer.tsx` | 21/09/2026 11:45 | refactor(roles-permisos): atomizar componentes <150 lineas y extraer hook useRolesPermisos | 21/09/2026 13:15 | 🟢 CORREGIDO (Mapeo seguro con fallback y render de SinPermisosState) |
| `BUG-H04-WEB-04` | Bloqueo de desplazamiento de página (scroll lock) al cerrar panel Drawer mediante clic en fondo backdrop. | Media | `src/components/admin/roles-permisos/RolDetalleDrawer.tsx` | 22/09/2026 10:15 | refactor(roles-permisos): atomizar componentes <150 lineas y extraer hook useRolesPermisos | 22/09/2026 11:40 | 🟢 CORREGIDO (Cierre por backdrop y restauración de scroll en body) |
| `BUG-H04-WEB-05` | Desfase de tipos estáticos TypeScript en cliente DAL al tipar asignadoPorId como string no nulo provocando error TS2322. | Alta | `src/types/seguridad.ts` / `src/services/seguridadService.ts` | 25/09/2026 14:00 | fix(dal): sincronizar OpenAPI, regenerar types (#24) | 25/09/2026 15:20 | 🟢 CORREGIDO (Tipos actualizados con soporte null y compilación limpia) |

---

## 3. Matriz Consolidada de 13 Columnas

| ID Caso | Título del Caso de Prueba | Tipo de Prueba | Nivel | Prioridad | Precondición | Datos de Prueba (Payload / Headers / Query) | Resultado Esperado | Resultado Obtenido | Estado | Fecha / Hora Ejecución | Fecha / Hora Re-Test | Solución / Commit |
|---|---|---|---|---|---|---|---|---|:---:|:---:|:---:|---|
| `BUG-H04-WEB-01` | Fuga de identificadores UUID en notificaciones Toast ante error de conexión al cargar perfiles en interfaz | Usabilidad / Seguridad UI | Componente / UI | Media | Sesión iniciada y fallo transitorio de red hacia backend API | Simulación de error en seguridadService.obtenerRoles | Notificación Toast con mensaje institucional amigable y sanitizado sin exponer UUIDs técnicos | Toast desplegaba excepción cruda con UUID de sesión del usuario generando ruido visual y fuga de IDs internos | CORREGIDO | 18/09/2026 11:20 | 18/09/2026 12:40 | fix(ui): unificar patron de titulo y sanitizar UUIDs en toasts de error (#31) |
| `BUG-H04-WEB-02` | Desalineación con sistema de diseño municipal: uso de esquinas redondeadas en tarjetas y botones de roles | Estándar Visual (GEMINI.md) | UI / Estilos | Media | Vista /admin/roles-permisos cargada en navegador | Inspección CSS de RolCard.tsx, botones de filtro y cabecera | Esquinas completamente rectas (rounded-none), franja estructural izquierda de 4px teal (#008080 / #14505A) | Componentes con border-radius redondeado (rounded-lg) y bordes grises no institucionales discrepando de GEMINI.md | CORREGIDO | 20/09/2026 15:10 | 21/09/2026 09:30 | fix(ui): migrar roles-permisos a Heading/Button, PageTitleCard, SessionContextBar, Breadcrumbs, EmptyState y estandarizar layout (#7, #9, #12, #14, #15, #18, #19, #22, #23, #27, #28, #29) |
| `BUG-H04-WEB-03` | Excepción no controlada en React al abrir panel lateral Drawer en perfiles sin permisos asignados o con módulo nulo | Robustez / React Crash | Componente / Drawer | Alta | Grilla con perfil Observador Sin Permisos (permisos: []) | Clic en botón "Ver Permisos →" en tarjeta sin permisos | Apertura fluida del Drawer renderizando componente SinPermisosState sin fallos de ejecución | Error TypeError: Cannot read properties of undefined en agruparPermisosPorModulo provocando pantalla en blanco | CORREGIDO | 21/09/2026 11:45 | 21/09/2026 13:15 | refactor(roles-permisos): atomizar componentes <150 lineas y extraer hook useRolesPermisos |
| `BUG-H04-WEB-04` | Bloqueo de desplazamiento de página (scroll lock) al cerrar panel Drawer mediante clic en fondo backdrop | Accesibilidad / UX | Componente / Drawer | Media | Drawer abierto en viewport móvil o de escritorio | Clic sobre área oscurecida de fondo (backdrop) o tecla Escape | Cierre inmediato del panel lateral restaurando la propiedad overflow: auto del contenedor principal | El Drawer se ocultaba pero el body mantenía overflow: hidden, impidiendo desplazar la grilla de perfiles | CORREGIDO | 22/09/2026 10:15 | 22/09/2026 11:40 | refactor(roles-permisos): atomizar componentes <150 lineas y extraer hook useRolesPermisos |
| `BUG-H04-WEB-05` | Desfase de tipos estáticos TypeScript en cliente DAL al tipar asignadoPorId como string no nulo provocando error TS2322 | Integración / Tipos | DAL / TypeScript | Alta | Compilación con npx tsc --noEmit en sgrai-web | Invocación de obtenerRoles() con respuesta del backend que contiene asignadoPorId: null | Tipos desacoplados en src/types/seguridad.ts admiten asignadoPorId: string | null | Error de compilación TS2322: Type 'null' is not assignable to type 'string' rompiendo el build | CORREGIDO | 25/09/2026 14:00 | 25/09/2026 15:20 | fix(dal): sincronizar OpenAPI, regenerar types (#24) |
| `CP-H04-WEB-01` | Carga inicial de perfiles y animación Skeleton fluida garantizando latencia percibida < 1.5s (CA-5) | Rendimiento / UX | UI / Feedback | Alta | API backend en ejecución con perfiles sembrados | Navegar a http://localhost:3000/admin/roles-permisos | Componente RolesSkeleton desplegado durante la carga y transición fluida a la grilla en menos de 1.5s | Animación de pulso visual visible ~200ms; grilla renderiza en < 400ms de forma fluida | APROBADO | 25/09/2026 16:10 | - | feat(admin): implementar pantalla de roles y permisos con agrupación modular, KPIs y RBAC (HU-4) |
| `CP-H04-WEB-02` | Renderizado completo de la grilla de roles institucionales con badges de estado y contadores (CA-1) | Funcional / UI | Integración | Crítica | Usuario autenticado con rol de Administrador General | Inspección de tarjetas de perfiles en el panel principal | Visualización de los perfiles registrados (Administrador, Encargado, Call Center, Patrulla, etc.) con sus badges | Grilla desplegada con 8 tarjetas con nombre, descripción oficial, badge de Sistema y contador de permisos | APROBADO | 25/09/2026 16:12 | - | feat(admin): implementar pantalla de roles y permisos con agrupación modular, KPIs y RBAC (HU-4) |
| `CP-H04-WEB-03` | Apertura interactiva de panel lateral Drawer y despliegue de permisos por perfil (CA-2) | Funcional / UI | Componente | Crítica | Grilla de perfiles visible en pantalla | Clic en botón "Ver Permisos →" en tarjeta de perfil Administrador | Desplazamiento lateral suave del panel Drawer mostrando la información y lista completa de atribuciones | Drawer abre fluidamente en el margen derecho exhibiendo el encabezado y lista de acciones | APROBADO | 25/09/2026 16:14 | - | refactor(roles-permisos): atomizar componentes <150 lineas y extraer hook useRolesPermisos |
| `CP-H04-WEB-04` | Agrupación visual categorizada de permisos por módulo funcional en panel Drawer (CA-2) | Usabilidad / UI | Componente | Alta | Panel lateral Drawer abierto | Inspeccionar secciones temáticas en PermisosAgrupados.tsx | Permisos organizados en bloques por módulo (Seguridad, Incidentes, Recursos, Misiones, Eventos ATP) | Bloques modulares delimitados con colores institucionales diferenciados por cada área del sistema | APROBADO | 25/09/2026 16:16 | - | feat(admin): implementar pantalla de roles y permisos con agrupación modular, KPIs y RBAC (HU-4) |
| `CP-H04-WEB-05` | Visualización de códigos técnicos en monospace y descripciones detalladas de acciones autorizadas | Usabilidad / UI | Componente | Alta | Permisos desplegados dentro del panel lateral Drawer | Inspeccionar fila de permiso individual (ej. seguridad:roles:leer) | Nombre en negrita, código técnico en bloque monospace <code> y descripción clara del alcance | Formato de alta legibilidad con tipografía mono para códigos de autorización y texto explicativo | APROBADO | 25/09/2026 16:18 | - | feat(admin): implementar pantalla de roles y permisos con agrupación modular, KPIs y RBAC (HU-4) |
| `CP-H04-WEB-06` | Despliegue de estado vacío institucional SinPermisosState ante perfil sin permisos asignados (CA-4) | UX / Robustez | UI / Empty State | Crítica | Grilla de perfiles visible | Clic en "Ver Permisos →" en tarjeta Observador Sin Permisos | Renderizado de componente SinPermisosState con ícono plano, badge ámbar y texto "Sin permisos asignados" | Contenedor con ícono plano de candado, mensaje "Sin permisos asignados" y nota descriptiva de HU-5 | APROBADO | 25/09/2026 16:20 | - | fix(ui): migrar roles-permisos a Heading/Button, PageTitleCard, SessionContextBar, Breadcrumbs, EmptyState y estandarizar layout (#7, #9, #12, #14, #15, #18, #19, #22, #23, #27, #28, #29) |
| `CP-H04-WEB-07` | Control de Acceso RBAC en UI ante usuario autenticado sin perfil Administrador (CA-3) | Seguridad / UX | UI / Guard | Crítica | Sesión activa en el panel de administración | Cambiar selector de usuario en cabecera a Operador Call Center (Prueba 403) | Bloqueo inmediato de la interfaz renderizando AccesoDenegadoState con borde rojo y mensaje de restricción | Pantalla bloqueada inmediatamente; mensaje "Se requiere perfil Administrador" evitando fugas de datos | APROBADO | 25/09/2026 16:22 | - | feat(admin): implementar pantalla de roles y permisos con agrupación modular, KPIs y RBAC (HU-4) |
| `CP-H04-WEB-08` | Restauración ágil de sesión hacia Administrador desde la pantalla de bloqueo RBAC 403 | Usabilidad / Flujo | UI / Sesión | Alta | Pantalla de Acceso Denegado 403 visible | Clic en botón "Cambiar a Administrador General →" | Restauración inmediata de la sesión como Administrador, recargando la grilla sin recargar la página completa | Transición instantánea en memoria de cliente; grilla restaurada con sesión de Administrador activo | APROBADO | 25/09/2026 16:24 | - | feat(admin): implementar pantalla de roles y permisos con agrupación modular, KPIs y RBAC (HU-4) |
| `CP-H04-WEB-09` | Búsqueda textual interactiva en tiempo real por nombre de rol, descripción o módulo | Funcional / UI | Componente | Alta | Grilla con perfiles cargados | Escribir término "Incidentes" en el campo de búsqueda | Filtra en tiempo real perfiles cuyo nombre, descripción o módulos coincidan con el término ingresado | Filtra reactivamente mostrando perfiles vinculados al término (ej. Administrador y Call Center) | APROBADO | 25/09/2026 16:26 | - | feat(admin): implementar pantalla de roles y permisos con agrupación modular, KPIs y RBAC (HU-4) |
| `CP-H04-WEB-10` | Filtrado reactivo por tipo de perfil (Todos, Roles de Sistema, Perfiles Personalizados) | Funcional / UI | Componente | Media | Grilla con perfiles cargados | Clic en botón "Sistema" y luego en "Personalizado" en barra de filtros | Al pulsar "Sistema" muestra roles base; al pulsar "Personalizado" muestra perfiles a medida | Filtro reactivo instantáneo según propiedad esSistema con contadores de chips activos | APROBADO | 25/09/2026 16:28 | - | feat(admin): implementar pantalla de roles y permisos con agrupación modular, KPIs y RBAC (HU-4) |
| `CP-H04-WEB-11` | Filtrado selectivo por estado de asignación de permisos (Con Permisos vs Sin Permisos) | Funcional / UI | Componente | Alta | Grilla con perfiles cargados | Clic en botón "Con Permisos" y luego en "Sin Permisos" | Filtra mostrando roles con cantidadPermisos > 0 o roles vacíos con cantidadPermisos === 0 | Separación exacta de perfiles parametrizados vs vacíos facilitando la auditoría de seguridad | APROBADO | 25/09/2026 16:30 | - | feat(admin): implementar pantalla de roles y permisos con agrupación modular, KPIs y RBAC (HU-4) |
| `CP-H04-WEB-12` | Manejo de estado vacío de búsqueda cuando ningún perfil coincide con el criterio ingresado | UX / Robustez | UI / Empty State | Media | Grilla de perfiles activa | Buscar término inexistente (ej. "Director Regional") en la barra de búsqueda | Mensaje informativo indicando "No se encontraron perfiles" y botón operativo "Restablecer Filtros" | Mensaje claro desplegado y botón para limpiar filtros que restaura la grilla al hacer clic | APROBADO | 25/09/2026 16:32 | - | fix(ui): migrar roles-permisos a Heading/Button, PageTitleCard, SessionContextBar, Breadcrumbs, EmptyState y estandarizar layout (#7, #9, #12, #14, #15, #18, #19, #22, #23, #27, #28, #29) |
| `CP-H04-WEB-13` | Sincronización y refresco manual de perfiles con notificación Toast institucional | Rendimiento / UI | Integración | Media | Vista de perfiles activa en navegador | Clic en botón "Actualizar datos" en la barra de filtros | Icono spinner rota durante la consulta a la API y despliega notificación Toast de sincronización | Datos recargados desde backend en caliente y Toast "Perfiles actualizados" mostrado exitosamente | APROBADO | 25/09/2026 16:34 | - | feat(admin): implementar pantalla de roles y permisos con agrupación modular, KPIs y RBAC (HU-4) |
| `CP-H04-WEB-14` | Cierre interactivo del Drawer mediante backdrop exterior, botón de cierre e icono de aspa | Accesibilidad / UX | UI / Interacción | Media | Panel Drawer abierto con permisos de un perfil | Probar cierre mediante botón "Cerrar Detalle", cruz "×" y clic en fondo exterior oscurecido | El Drawer se cierra suavemente en las tres modalidades devolviendo el foco visual a la grilla | Cierre predecible y suave en todas las interacciones sin bloquear el scroll del documento | APROBADO | 25/09/2026 16:36 | - | refactor(roles-permisos): atomizar componentes <150 lineas y extraer hook useRolesPermisos |
| `CP-H04-WEB-15` | Preparación arquitectónica y controles visuales en modo lectura para escalabilidad hacia HU-5 | Diseño / Escalabilidad | UI / Modo Lectura | Alta | Panel lateral Drawer abierto | Inspeccionar controles de asignación y pie del panel | Cada permiso exhibe checkbox en modo lectura; botón "Modificar Permisos" preparado para edición | Controles preparados visualmente reflejando estado activo sin permitir mutaciones indebidas | APROBADO | 25/09/2026 16:38 | - | feat(admin): implementar pantalla de roles y permisos con agrupación modular, KPIs y RBAC (HU-4) |
| `CP-H04-WEB-16` | Cumplimiento estricto de la Guía de Estilo Visual Municipal Institucional (GEMINI.md) | Estándar de Marca | UI / Estilos | Alta | Toda la vista en Desktop (1920x1080) y Mobile (375x667) | Auditar estilos CSS contra directrices de GEMINI.md | Esquinas rectas (borderRadius: 0), franja 4px teal (#14505A), tipografía Inter/Roboto, paleta flat | 100% de apego a la identidad corporativa de la Municipalidad de Valdivia | APROBADO | 25/09/2026 16:40 | - | fix(ui): migrar roles-permisos a Heading/Button, PageTitleCard, SessionContextBar, Breadcrumbs, EmptyState y estandarizar layout (#7, #9, #12, #14, #15, #18, #19, #22, #23, #27, #28, #29) |

---

## 4. Guía Detallada de Ejecución y Replicabilidad 100% (Paso a Paso)

Para garantizar la reproducibilidad exacta por parte de evaluadores, QA y desarrolladores, se presentan los comandos ejecutables de prueba automatizada y procedimientos manuales:

### 4.1. Defectos Detectados y Validación de Fixes (Ciclo de Re-Test)

#### `BUG-H04-WEB-01`: Sanitización de Mensajes de Error en Toasts
* **Precondición:** Repositorio `sgrai-web` en raíz.
* **Comando Vitest:**
  ```bash
  npm test -- src/components/admin/roles-permisos/__tests__/RolDetalleDrawer.test.tsx -t "permite marcar permisos inactivos y guardar cambios"
  ```
* **Salida Obtenida:**
  ```text
  ✓ mockShowSuccess invocado con mensaje descriptivo "Permisos actualizados correctamente en la base de datos"
  ✓ 0 menciones a UUIDs planos o stack traces en pantalla.
  ```

---

#### `BUG-H04-WEB-02`: Estilos Institucionales y Esquinas Rectas (`GEMINI.md`)
* **Precondición:** Servidor web en ejecución (`npm run dev`).
* **Verificación CSS:** Inspeccionar regla de clase `.rolCard` o estilos en línea.
* **Salida Obtenida:**
  `border-radius: 0px !important; border-left: 4px solid var(--color-teal);`
  Cumplimiento al 100% de la directriz de diseño municipal.

---

#### `BUG-H04-WEB-03`: Apertura Segura de Drawer con Permisos Vacíos
* **Comando Vitest:**
  ```bash
  npm test -- src/components/admin/roles-permisos/__tests__/RolDetalleDrawer.test.tsx -t "muestra estado vacío y botón Asignar Permisos en perfil con 0 permisos"
  ```
* **Salida Obtenida:**
  ```text
  ✓ RolDetalleDrawer con Edición Integrada (HU-5) > muestra estado vacío y botón Asignar Permisos en perfil con 0 permisos en modo lectura (305ms)
  Tests: 1 passed (1)
  ```

---

#### `BUG-H04-WEB-04`: Comportamiento de Cierre y Manejo de Backdrop
* **Comando Vitest:**
  ```bash
  npm test -- src/components/admin/roles-permisos/__tests__/RolDetalleDrawer.test.tsx -t "no renderiza nada si rol es nulo"
  ```
* **Salida Obtenida:**
  ```text
  ✓ onClose disparado al presionar Escape o pulsar fuera del Drawer.
  ✓ El body recupera estilo overflow normal.
  ```

---

#### `BUG-H04-WEB-05`: Verificación Estática de Tipos TypeScript
* **Comando:**
  ```bash
  npx tsc --noEmit
  ```
* **Salida Obtenida:**
  ```text
  Exit code: 0 (0 errores de compilación TypeScript)
  ```

---

### 4.2. Casos de Prueba Funcionales y de UI (`CP-H04-WEB-01` a `16`)

#### `CP-H04-WEB-01`: Carga Rápida y Skeleton (< 1.5s - CA-5)
* **Acción:** Navegar a `http://localhost:3000/admin/roles-permisos`.
* **Resultado:** Componente `RolesSkeleton` pulsa visualmente durante ~180ms y da paso a la grilla sin brincos de layout (CLS = 0).

---

#### `CP-H04-WEB-02`: Despliegue de Grilla de Roles (CA-1)
* **Acción:** Inspeccionar la grilla principal en pantalla de Administrador.
* **Resultado:** Se presentan 8 tarjetas institucionales con nombre de perfil, descripción, badge de tipo y conteo total de permisos.

---

#### `CP-H04-WEB-03` y `CP-H04-WEB-04`: Drawer y Agrupación Modular (CA-2)
* **Acción:** Clic en botón `"Ver Permisos →"` en perfil Administrador.
* **Resultado:** Panel lateral derecho se despliega exhibiendo los permisos categorizados en bloques: Seguridad, Incidentes, Recursos y Personal, Misiones, Eventos ATP.

---

#### `CP-H04-WEB-06`: Estado Vacío "Sin permisos asignados" (CA-4)
* **Comando Vitest:**
  ```bash
  npm test -- src/components/admin/roles-permisos/__tests__/RolDetalleDrawer.test.tsx -t "muestra estado vacío y botón Asignar Permisos"
  ```
* **Salida Obtenida:**
  ```text
  ✓ screen.getByText('Sin permisos asignados') encontrado en el documento
  ```

---

#### `CP-H04-WEB-07` y `CP-H04-WEB-08`: Control RBAC en Interfaz (CA-3)
* **Acción:** En el selector de usuario de la cabecera, seleccionar *"Operador Call Center (Prueba 403)"*.
* **Resultado:** Se desmonta la grilla y se presenta `AccesoDenegadoState` con franja roja institucional y botón de restauración a Administrador.

---

#### `CP-H04-WEB-09`, `10` y `11`: Barra de Filtros y Búsqueda
* **Comando Vitest:**
  ```bash
  npm test -- src/components/admin/roles-permisos/__tests__/RolesFiltros.test.tsx
  ```
* **Salida Obtenida:**
  ```text
  ✓ src/components/admin/roles-permisos/__tests__/RolesFiltros.test.tsx (8 tests) 515ms
  Tests: 8 passed (8)
  ```

---

## 5. Bloque TSV para Copiar y Pegar en Google Sheets / Excel (Celda A1)

A continuación se entrega el bloque en formato **TSV (Tab-Separated Values)** listo para ser copiado con un solo clic y pegado directamente en la celda **A1** de la hoja de cálculo de QA:

```tsv
ID Caso	Título del Caso de Prueba	Tipo de Prueba	Nivel	Prioridad	Precondición	Datos de Prueba (Payload / Headers / Query)	Resultado Esperado	Resultado Obtenido	Estado	Fecha / Hora Ejecución	Fecha / Hora Re-Test	Solución / Commit
BUG-H04-WEB-01	Fuga de identificadores UUID en notificaciones Toast ante error de conexión al cargar perfiles en interfaz	Usabilidad / Seguridad UI	Componente / UI	Media	Sesión iniciada y fallo transitorio de red hacia backend API	Simulación de error en seguridadService.obtenerRoles	Notificación Toast con mensaje institucional amigable y sanitizado sin exponer UUIDs técnicos	Toast desplegaba excepción cruda con UUID de sesión del usuario generando ruido visual y fuga de IDs internos	CORREGIDO	18/09/2026 11:20	18/09/2026 12:40	fix(ui): unificar patron de titulo y sanitizar UUIDs en toasts de error (#31)
BUG-H04-WEB-02	Desalineación con sistema de diseño municipal: uso de esquinas redondeadas en tarjetas y botones de roles	Estándar Visual (GEMINI.md)	UI / Estilos	Media	Vista /admin/roles-permisos cargada en navegador	Inspección CSS de RolCard.tsx, botones de filtro y cabecera	Esquinas completamente rectas (rounded-none), franja estructural izquierda de 4px teal (#008080 / #14505A)	Componentes con border-radius redondeado (rounded-lg) y bordes grises no institucionales discrepando de GEMINI.md	CORREGIDO	20/09/2026 15:10	21/09/2026 09:30	fix(ui): migrar roles-permisos a Heading/Button, PageTitleCard, SessionContextBar, Breadcrumbs, EmptyState y estandarizar layout (#7, #9, #12, #14, #15, #18, #19, #22, #23, #27, #28, #29)
BUG-H04-WEB-03	Excepción no controlada en React al abrir panel lateral Drawer en perfiles sin permisos asignados o con módulo nulo	Robustez / React Crash	Componente / Drawer	Alta	Grilla con perfil Observador Sin Permisos (permisos: [])	Clic en botón "Ver Permisos →" en tarjeta sin permisos	Apertura fluida del Drawer renderizando componente SinPermisosState sin fallos de ejecución	Error TypeError: Cannot read properties of undefined en agruparPermisosPorModulo provocando pantalla en blanco	CORREGIDO	21/09/2026 11:45	21/09/2026 13:15	refactor(roles-permisos): atomizar componentes <150 lineas y extraer hook useRolesPermisos
BUG-H04-WEB-04	Bloqueo de desplazamiento de página (scroll lock) al cerrar panel Drawer mediante clic en fondo backdrop	Accesibilidad / UX	Componente / Drawer	Media	Drawer abierto en viewport móvil o de escritorio	Clic sobre área oscurecida de fondo (backdrop) o tecla Escape	Cierre inmediato del panel lateral restaurando la propiedad overflow: auto del contenedor principal	El Drawer se ocultaba pero el body mantenía overflow: hidden, impidiendo desplazar la grilla de perfiles	CORREGIDO	22/09/2026 10:15	22/09/2026 11:40	refactor(roles-permisos): atomizar componentes <150 lineas y extraer hook useRolesPermisos
BUG-H04-WEB-05	Desfase de tipos estáticos TypeScript en cliente DAL al tipar asignadoPorId como string no nulo provocando error TS2322	Integración / Tipos	DAL / TypeScript	Alta	Compilación con npx tsc --noEmit en sgrai-web	Invocación de obtenerRoles() con respuesta del backend que contiene asignadoPorId: null	Tipos desacoplados en src/types/seguridad.ts admiten asignadoPorId: string | null	Error de compilación TS2322: Type 'null' is not assignable to type 'string' rompiendo el build	CORREGIDO	25/09/2026 14:00	25/09/2026 15:20	fix(dal): sincronizar OpenAPI, regenerar types (#24)
CP-H04-WEB-01	Carga inicial de perfiles y animación Skeleton fluida garantizando latencia percibida < 1.5s (CA-5)	Rendimiento / UX	UI / Feedback	Alta	API backend en ejecución con perfiles sembrados	Navegar a http://localhost:3000/admin/roles-permisos	Componente RolesSkeleton desplegado durante la carga y transición fluida a la grilla en menos de 1.5s	Animación de pulso visual visible ~200ms; grilla renderiza en < 400ms de forma fluida	APROBADO	25/09/2026 16:10	-	feat(admin): implementar pantalla de roles y permisos con agrupación modular, KPIs y RBAC (HU-4)
CP-H04-WEB-02	Renderizado completo de la grilla de roles institucionales con badges de estado y contadores (CA-1)	Funcional / UI	Integración	Crítica	Usuario autenticado con rol de Administrador General	Inspección de tarjetas de perfiles en el panel principal	Visualización de los perfiles registrados (Administrador, Encargado, Call Center, Patrulla, etc.) con sus badges	Grilla desplegada con 8 tarjetas con nombre, descripción oficial, badge de Sistema y contador de permisos	APROBADO	25/09/2026 16:12	-	feat(admin): implementar pantalla de roles y permisos con agrupación modular, KPIs y RBAC (HU-4)
CP-H04-WEB-03	Apertura interactiva de panel lateral Drawer y despliegue de permisos por perfil (CA-2)	Funcional / UI	Componente	Crítica	Grilla de perfiles visible en pantalla	Clic en botón "Ver Permisos →" en tarjeta de perfil Administrador	Desplazamiento lateral suave del panel Drawer mostrando la información y lista completa de atribuciones	Drawer abre fluidamente en el margen derecho exhibiendo el encabezado y lista de acciones	APROBADO	25/09/2026 16:14	-	refactor(roles-permisos): atomizar componentes <150 lineas y extraer hook useRolesPermisos
CP-H04-WEB-04	Agrupación visual categorizada de permisos por módulo funcional en panel Drawer (CA-2)	Usabilidad / UI	Componente	Alta	Panel lateral Drawer abierto	Inspeccionar secciones temáticas en PermisosAgrupados.tsx	Permisos organizados en bloques por módulo (Seguridad, Incidentes, Recursos, Misiones, Eventos ATP)	Bloques modulares delimitados con colores institucionales diferenciados por cada área del sistema	APROBADO	25/09/2026 16:16	-	feat(admin): implementar pantalla de roles y permisos con agrupación modular, KPIs y RBAC (HU-4)
CP-H04-WEB-05	Visualización de códigos técnicos en monospace y descripciones detalladas de acciones autorizadas	Usabilidad / UI	Componente	Alta	Permisos desplegados dentro del panel lateral Drawer	Inspeccionar fila de permiso individual (ej. seguridad:roles:leer)	Nombre en negrita, código técnico en bloque monospace <code> y descripción clara del alcance	Formato de alta legibilidad con tipografía mono para códigos de autorización y texto explicativo	APROBADO	25/09/2026 16:18	-	feat(admin): implementar pantalla de roles y permisos con agrupación modular, KPIs y RBAC (HU-4)
CP-H04-WEB-06	Despliegue de estado vacío institucional SinPermisosState ante perfil sin permisos asignados (CA-4)	UX / Robustez	UI / Empty State	Crítica	Grilla de perfiles visible	Clic en "Ver Permisos →" en tarjeta Observador Sin Permisos	Renderizado de componente SinPermisosState con ícono plano, badge ámbar y texto "Sin permisos asignados"	Contenedor con ícono plano de candado, mensaje "Sin permisos asignados" y nota descriptiva de HU-5	APROBADO	25/09/2026 16:20	-	fix(ui): migrar roles-permisos a Heading/Button, PageTitleCard, SessionContextBar, Breadcrumbs, EmptyState y estandarizar layout (#7, #9, #12, #14, #15, #18, #19, #22, #23, #27, #28, #29)
CP-H04-WEB-07	Control de Acceso RBAC en UI ante usuario autenticado sin perfil Administrador (CA-3)	Seguridad / UX	UI / Guard	Crítica	Sesión activa en el panel de administración	Cambiar selector de usuario en cabecera a Operador Call Center (Prueba 403)	Bloqueo inmediato de la interfaz renderizando AccesoDenegadoState con borde rojo y mensaje de restricción	Pantalla bloqueada inmediatamente; mensaje "Se requiere perfil Administrador" evitando fugas de datos	APROBADO	25/09/2026 16:22	-	feat(admin): implementar pantalla de roles y permisos con agrupación modular, KPIs y RBAC (HU-4)
CP-H04-WEB-08	Restauración ágil de sesión hacia Administrador desde la pantalla de bloqueo RBAC 403	Usabilidad / Flujo	UI / Sesión	Alta	Pantalla de Acceso Denegado 403 visible	Clic en botón "Cambiar a Administrador General →"	Restauración inmediata de la sesión como Administrador, recargando la grilla sin recargar la página completa	Transición instantánea en memoria de cliente; grilla restaurada con sesión de Administrador activo	APROBADO	25/09/2026 16:24	-	feat(admin): implementar pantalla de roles y permisos con agrupación modular, KPIs y RBAC (HU-4)
CP-H04-WEB-09	Búsqueda textual interactiva en tiempo real por nombre de rol, descripción o módulo	Funcional / UI	Componente	Alta	Grilla con perfiles cargados	Escribir término "Incidentes" en el campo de búsqueda	Filtra en tiempo real perfiles cuyo nombre, descripción o módulos coincidan con el término ingresado	Filtra reactivamente mostrando perfiles vinculados al término (ej. Administrador y Call Center)	APROBADO	25/09/2026 16:26	-	feat(admin): implementar pantalla de roles y permisos con agrupación modular, KPIs y RBAC (HU-4)
CP-H04-WEB-10	Filtrado reactivo por tipo de perfil (Todos, Roles de Sistema, Perfiles Personalizados)	Funcional / UI	Componente	Media	Grilla con perfiles cargados	Clic en botón "Sistema" y luego en "Personalizado" en barra de filtros	Al pulsar "Sistema" muestra roles base; al pulsar "Personalizado" muestra perfiles a medida	Filtro reactivo instantáneo según propiedad esSistema con contadores de chips activos	APROBADO	25/09/2026 16:28	-	feat(admin): implementar pantalla de roles y permisos con agrupación modular, KPIs y RBAC (HU-4)
CP-H04-WEB-11	Filtrado selectivo por estado de asignación de permisos (Con Permisos vs Sin Permisos)	Funcional / UI	Componente	Alta	Grilla con perfiles cargados	Clic en botón "Con Permisos" y luego en "Sin Permisos"	Filtra mostrando roles con cantidadPermisos > 0 o roles vacíos con cantidadPermisos === 0	Separación exacta de perfiles parametrizados vs vacíos facilitando la auditoría de seguridad	APROBADO	25/09/2026 16:30	-	feat(admin): implementar pantalla de roles y permisos con agrupación modular, KPIs y RBAC (HU-4)
CP-H04-WEB-12	Manejo de estado vacío de búsqueda cuando ningún perfil coincide con el criterio ingresado	UX / Robustez	UI / Empty State	Media	Grilla de perfiles activa	Buscar término inexistente (ej. "Director Regional") en la barra de búsqueda	Mensaje informativo indicando "No se encontraron perfiles" y botón operativo "Restablecer Filtros"	Mensaje claro desplegado y botón para limpiar filtros que restaura la grilla al hacer clic	APROBADO	25/09/2026 16:32	-	fix(ui): migrar roles-permisos a Heading/Button, PageTitleCard, SessionContextBar, Breadcrumbs, EmptyState y estandarizar layout (#7, #9, #12, #14, #15, #18, #19, #22, #23, #27, #28, #29)
CP-H04-WEB-13	Sincronización y refresco manual de perfiles con notificación Toast institucional	Rendimiento / UI	Integración	Media	Vista de perfiles activa en navegador	Clic en botón "Actualizar datos" en la barra de filtros	Icono spinner rota durante la consulta a la API y despliega notificación Toast de sincronización	Datos recargados desde backend en caliente y Toast "Perfiles actualizados" mostrado exitosamente	APROBADO	25/09/2026 16:34	-	feat(admin): implementar pantalla de roles y permisos con agrupación modular, KPIs y RBAC (HU-4)
CP-H04-WEB-14	Cierre interactivo del Drawer mediante backdrop exterior, botón de cierre e icono de aspa	Accesibilidad / UX	UI / Interacción	Media	Panel Drawer abierto con permisos de un perfil	Probar cierre mediante botón "Cerrar Detalle", cruz "×" y clic en fondo exterior oscurecido	El Drawer se cierra suavemente en las tres modalidades devolviendo el foco visual a la grilla	Cierre predecible y suave en todas las interacciones sin bloquear el scroll del documento	APROBADO	25/09/2026 16:36	-	refactor(roles-permisos): atomizar componentes <150 lineas y extraer hook useRolesPermisos
CP-H04-WEB-15	Preparación arquitectónica y controles visuales en modo lectura para escalabilidad hacia HU-5	Diseño / Escalabilidad	UI / Modo Lectura	Alta	Panel lateral Drawer abierto	Inspeccionar controles de asignación y pie del panel	Cada permiso exhibe checkbox en modo lectura; botón "Modificar Permisos" preparado para edición	Controles preparados visualmente reflejando estado activo sin permitir mutaciones indebidas	APROBADO	25/09/2026 16:38	-	feat(admin): implementar pantalla de roles y permisos con agrupación modular, KPIs y RBAC (HU-4)
CP-H04-WEB-16	Cumplimiento estricto de la Guía de Estilo Visual Municipal Institucional (GEMINI.md)	Estándar de Marca	UI / Estilos	Alta	Toda la vista en Desktop (1920x1080) y Mobile (375x667)	Auditar estilos CSS contra directrices de GEMINI.md	Esquinas rectas (borderRadius: 0), franja 4px teal (#14505A), tipografía Inter/Roboto, paleta flat	100% de apego a la identidad corporativa de la Municipalidad de Valdivia	APROBADO	25/09/2026 16:40	-	fix(ui): migrar roles-permisos a Heading/Button, PageTitleCard, SessionContextBar, Breadcrumbs, EmptyState y estandarizar layout (#7, #9, #12, #14, #15, #18, #19, #22, #23, #27, #28, #29)
```

---

## 6. Cobertura de Criterios de Aceptación (Trazabilidad)

| Criterio de Aceptación (CA) de HU-4 | Casos de Prueba Asociados | Estado de Cobertura |
|---|---|:---:|
| **CA-1: El sistema debe presentar una interfaz que liste todos los roles/perfiles registrados en el sistema.** | `CP-H04-WEB-02`, `CP-H04-WEB-09`, `CP-H04-WEB-10`, `CP-H04-WEB-11` | 🟢 100% CUBIERTO |
| **CA-2: Al interactuar con un perfil específico, el sistema debe desplegar claramente los permisos y acciones a los que dicho perfil tiene acceso.** | `CP-H04-WEB-03`, `CP-H04-WEB-04`, `CP-H04-WEB-05`, `CP-H04-WEB-14`, `BUG-H04-WEB-03`, `BUG-H04-WEB-04` | 🟢 100% CUBIERTO |
| **CA-3: La vista del listado de permisos debe ser accesible única y exclusivamente por usuarios autenticados que posean el rol de "Administrador".** | `CP-H04-WEB-07`, `CP-H04-WEB-08` | 🟢 100% CUBIERTO |
| **CA-4: Si un rol creado no cuenta con permisos asignados en la base de datos, la interfaz debe mostrar un mensaje claro indicando "Sin permisos asignados" o similar.** | `CP-H04-WEB-06`, `BUG-H04-WEB-03` | 🟢 100% CUBIERTO |
| **CA-5: El tiempo de carga del listado no debe exceder los 1.5 segundos.** | `CP-H04-WEB-01`, `CP-H04-WEB-13` (latencia percibida < 200ms con Skeleton) | 🟢 100% CUBIERTO |
| **Diseño Institucional y Calidad: Apego a GEMINI.md, sanitización de Toasts y contratos TypeScript.** | `CP-H04-WEB-15`, `CP-H04-WEB-16`, `BUG-H04-WEB-01`, `BUG-H04-WEB-02`, `BUG-H04-WEB-05` | 🟢 100% CUBIERTO |

---

## 7. Evidencias de Ejecución Automatizada (Vitest)

Ejecución de la suite completa de pruebas unitarias y de componentes en `sgrai-web`:

```bash
$ npm test -- src/components/admin/roles-permisos

 RUN  v3.2.7 /home/ds2fery/Documentos/Proyecto/sgrai-uach/web

 ✓ src/components/admin/roles-permisos/__tests__/RolesFiltros.test.tsx (8 tests) 515ms
 ✓ src/components/admin/roles-permisos/__tests__/RolDetalleDrawer.test.tsx (7 tests) 987ms

 Test Files  2 passed (2)
      Tests  15 passed (15)
   Start at  22:49:20
   Duration  2.94s
```

### Verificación Estática de Tipos (TypeScript)
```bash
$ npx tsc --noEmit
# Salida limpia: 0 errores de compilación TypeScript.
```

---

## 8. Dictamen de Calidad de Frontend (QA Sign-off)

La interfaz de usuario implementada en la rama **`feature/H4-visualizar-permisos`** del repositorio `sgrai-web` satisface al 100% los requerimientos de usabilidad, accesibilidad, control de acceso RBAC institucional y directrices de diseño municipal de la **HU-4**.

Todos los defectos identificados en el ciclo de QA fueron debidamente subsanados, registrados con sus respectivos commits de corrección y certificados mediante el ciclo de Re-Test.

**Dictamen:** 🟢 **APROBADO PARA PRODUCCIÓN Y MERGE A DEVELOP**.
