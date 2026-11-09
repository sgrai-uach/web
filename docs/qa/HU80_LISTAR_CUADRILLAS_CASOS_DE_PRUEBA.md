# Informe y Matriz de Casos de Prueba (QA): HU-80 — Visualizar Listado de Cuadrillas Operativas, Disponibilidad y Dotación

> **Documento Oficial de Aseguramiento de Calidad (QA) — Frontend Web**  
> **Proyecto:** Sistema de Gestión de Recursos para Atención de Incidentes (SGRAI) — Dirección de Gestión de Riesgos de Desastres, Municipalidad de Valdivia.  
> **Módulo:** Recursos y Personal / Administración de Cuadrillas Operativas (`sgrai-web` — `/gestion/admin/cuadrillas`).  
> **Historia de Usuario:** HU-80 — *"Como Administrador / Encargado Quiero visualizar un listado completo de las cuadrillas operativas registradas, su estado de disponibilidad y el personal y recursos que la componen Para conocer la capacidad de respuesta táctica disponible en cada delegación municipal al momento de asignar emergencias."*  
> **Desarrollador Asignado:** Jonagu1  
> **Equipo Auditor:** Aseguramiento de Calidad (QA) — Proyecto SGRAI  
> **Servicio Web Auditado:** `sgrai-web` (Next.js 16.3.4 App Router + React 19.2.8 + TypeScript 5 + Vitest v3.2.7 + Testing Library).  
> **Rama Git Evaluada:** `feature/H80-listar-cuadrillas`  
> **Fecha de Auditoría QA:** 09 de Noviembre de 2026.  
> **Estado de Certificación:** 🔴 **RECHAZADO EN CODE REVIEW (`CHANGES REQUESTED`) — 5 DEFECTOS ABIERTOS PENDIENTES DE CORRECCIÓN**.

---

## 1. Resumen Ejecutivo de Pruebas

| Métrica | Resultado | Observaciones Técnicas |
|---|:---:|---|
| **Total de Casos de Prueba Ejecutados** | **25** | 20 Casos Funcionales/UI/Integración + 5 Defectos Detectados en Auditoría |
| **Casos Aprobados (`APROBADO`)** | **20** | Renderizado base de tabla, badges de estado, filtros en memoria, paginación, drawer y WebSockets |
| **Defectos Abiertos (`ABIERTO`)** | **5** | 1 Crítico (RBAC), 2 Altos (Interacción fila CA-3 y Contrato H34), 2 Medios (Manejo de error y Documentación/Tests) |
| **Casos Bloqueados (`BLOQUEADO`)** | **0** | Sin bloqueos de infraestructura local |
| **Tasa de Aprobación Actual (% Pass)** | **80.0%** | Requiere 100% y 0 defectos críticos/altos para certificación y merge a `develop` |
| **Análisis Estático de Código (`npm run lint`)** | 🟢 **0 errores** | 0 errores de ESLint en los archivos del módulo de cuadrillas |
| **Chequeo de Tipos Estáticos (`npx tsc --noEmit`)** | 🟢 **0 errores** | Compilación limpia del proyecto TypeScript |
| **Suite Automatizada de Cuadrillas (Vitest)** | 🟡 **43/43 tests pass (con brechas)** | Pasan las suites actuales, pero falta cobertura de `CuadrillaDetalleDrawer` y se eliminó test de `NO_DISPONIBLE` |
| **Cumplimiento Guía Visual Municipal** | 🟢 **100% en UI** | Uso de `Heading`, `Button`, iconografía `lucide-react`, bordes rectos y tokens institucionales |

---

## 2. Registro Técnico de Defectos Detectados

Durante la inspección forense de código y las pruebas funcionales sobre la rama `feature/H80-listar-cuadrillas`, se identificaron **5 defectos reales** que impiden la certificación de la historia de usuario:

| ID Defecto | Descripción Técnica del Defecto | Severidad | Archivo(s) Afectado(s) | Criterio Afectado | Fecha Detección | Estado | Fecha Re-Test | Solución / Commit |
|---|---|:---:|---|---|:---:|:---:|:---:|---|
| `BUG-H80-WEB-01` | **Ausencia de control de acceso RBAC en la vista `/gestion/admin/cuadrillas` y exposición de datos por fallback ante HTTP 403:** `CuadrillasAdminClient.tsx` evalúa únicamente `recursos:crear` y `recursos:editar`, sin verificar el permiso de lectura `recursos:leer` ni los roles autorizados (`Administrador` / `Encargado`), omitiendo renderizar `AccesoDenegadoState`. Adicionalmente, `cuadrillasService.obtenerCuadrillas` no propaga respuestas `403 Forbidden` ni `401 Unauthorized`, cayendo en `CUADRILLAS_FALLBACK` y exponiendo la dotación municipal a perfiles no autorizados (ej. Call Center, Asistente Social). | Crítica | `src/components/admin/cuadrillas/CuadrillasAdminClient.tsx` (líneas 23-63), `src/services/cuadrillasService.ts` (líneas 731-806) | RBAC / Seguridad | 09/11/2026 11:40 | `ABIERTO` | `(Pendiente)` | `Pendiente (Rechazado en Code Review)` |
| `BUG-H80-WEB-02` | **Filas de `CuadrillasTabla` no despliegan el drawer lateral al hacer clic sobre la fila:** El tercer criterio de aceptación exige que al hacer clic sobre una fila de la tabla se despliegue el drawer lateral con el detalle de personal y recursos vinculados. En `CuadrillasTabla.tsx` (línea 208), el elemento `<tr>` carece de manejador `onClick={() => onVerDetalle(cuadrilla)}`, estilo `cursor: 'pointer'` y detención de propagación (`e.stopPropagation()`) en la columna de acciones. | Alta | `src/components/admin/cuadrillas/CuadrillasTabla.tsx` (líneas 208-215, 310-349) | CA-3 | 09/11/2026 11:40 | `ABIERTO` | `(Pendiente)` | `Pendiente (Rechazado en Code Review)` |
| `BUG-H80-WEB-03` | **Incumplimiento parcial del contrato estándar H34 en paginación/filtros y ausencia de sincronización con `URLSearchParams`:** `cuadrillasService.obtenerCuadrillas` no normaliza las propiedades canónicas de metadatos H34 (`page`, `limit`, `totalPages`) cuando el backend responde con nomenclatura estándar en lugar de `pagina`/`limite`/`paginasTotales`. Asimismo, `CuadrillasAdminClient.tsx` mantiene los filtros exclusivamente en memoria local sin sincronizarlos con `URLSearchParams` en la barra de navegación. | Alta | `src/services/cuadrillasService.ts` (líneas 739-765), `src/components/admin/cuadrillas/CuadrillasAdminClient.tsx` (líneas 38-84) | CA-1, CA-5 | 09/11/2026 11:40 | `ABIERTO` | `(Pendiente)` | `Pendiente (Rechazado en Code Review)` |
| `BUG-H80-WEB-04` | **Omisión del estado `error` y acción `recargar` en `CuadrillasAdminClient` y falta de botón de restablecimiento en estado vacío filtrado:** `CuadrillasAdminClient.tsx` ignora las propiedades `error` y `recargar` retornadas por `useCuadrillas(filtros)`. Ante un fallo del servicio, el usuario visualiza el mensaje *"No se encontraron cuadrillas operativas"* en vez de una alerta de error con opción de reintento. Además, cuando no hay resultados con filtros activos, `CuadrillasTabla.tsx` no ofrece un botón para limpiar los filtros. | Media | `src/components/admin/cuadrillas/CuadrillasAdminClient.tsx` (líneas 46-51), `src/components/admin/cuadrillas/CuadrillasTabla.tsx` (líneas 133-152) | CA-1, CA-4 | 09/11/2026 11:40 | `ABIERTO` | `(Pendiente)` | `Pendiente (Rechazado en Code Review)` |
| `BUG-H80-WEB-05` | **Manual de usuario vaciado a 0 bytes, ubicación fuera del directorio estándar `/docs/manuals/` y regresión en pruebas unitarias:** En el commit `docs: HU-80` se eliminó la totalidad del contenido de `docs/manuales-usuario/H80-listar-cuadrillas.md` (quedando en 0 bytes), no existe el manual en la ruta requerida `/docs/manuals/H80-listar-cuadrillas.md`, se eliminó la aserción del estado `NO_DISPONIBLE` en `CuadrillasTabla.test.tsx` y no se implementaron pruebas unitarias para `CuadrillaDetalleDrawer.tsx`. | Media | `docs/manuales-usuario/H80-listar-cuadrillas.md`, `docs/manuals/H80-listar-cuadrillas.md`, `src/components/admin/cuadrillas/__tests__/CuadrillasTabla.test.tsx` | CA-2, CA-3 / Doc | 09/11/2026 11:40 | `ABIERTO` | `(Pendiente)` | `Pendiente (Rechazado en Code Review)` |

---

## 3. Matriz Consolidada de Casos de Prueba

| ID Caso | Título del Caso de Prueba | Tipo de Prueba | Nivel | Prioridad | Precondición | Datos de Prueba (Payload / Headers / Query) | Resultado Esperado | Resultado Obtenido | Estado | Fecha / Hora Ejecución | Fecha / Hora Re-Test | Solución / Commit |
|---|---|---|---|---|---|---|---|---|:---:|:---:|:---:|---|
| `BUG-H80-WEB-01` | Control de acceso RBAC en `/gestion/admin/cuadrillas` y bloqueo ante HTTP 403 Forbidden | Seguridad / RBAC | Vista / Servicio | Crítica | Sesión activa con rol Call Center o Asistente Social sin permiso `recursos:leer` | Navegación directa a `/gestion/admin/cuadrillas` o respuesta HTTP 403 de `GET /api/cuadrillas` | Bloqueo perimetral renderizando `AccesoDenegadoState` (HTTP 403) sin exponer registros de fallback | `CuadrillasAdminClient` omite validar `recursos:leer` y `obtenerCuadrillas` retorna `CUADRILLAS_FALLBACK` ante HTTP 403 | **ABIERTO** | 09/11/2026 11:40 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| `BUG-H80-WEB-02` | Apertura del drawer lateral de dotación al hacer clic sobre cualquier fila de la tabla (CA-3) | Funcional / UI | Componente / Tabla | Alta | Tabla cargada con cuadrillas operativas en `/gestion/admin/cuadrillas` | Evento `click` sobre la fila `<tr>` de "Cuadrilla Vías y Despeje Urbano" | Se invoca `onVerDetalle(cuadrilla)` y se despliega `CuadrillaDetalleDrawer` con personal y recursos | El elemento `<tr>` carece de manejador `onClick`; solo responde el botón secundario "Detalle" | **ABIERTO** | 09/11/2026 11:40 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| `BUG-H80-WEB-03` | Normalización de contrato H34 en metadatos de paginación y sincronización en `URLSearchParams` (CA-1, CA-5) | Integración / Contrato H34 | Servicio / Vista | Alta | Backend respondiendo con `meta: { total, page, limit, totalPages }` y filtros activos en UI | Selección de `delegacionId` y `estado=DISPONIBLE` en `CuadrillasAdminClient` | Mapeo compatible de `meta` H34 y sincronización de query params (`?delegacionId=...&estado=DISPONIBLE`) en la URL | No normaliza `totalPages`/`page`/`limit` de H34 ni sincroniza el estado de filtros con `URLSearchParams` | **ABIERTO** | 09/11/2026 11:40 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| `BUG-H80-WEB-04` | Renderizado de alerta de error con reintento ante fallo de carga y acción de limpiar filtros en tabla vacía | Usabilidad / Resiliencia | Vista / Tabla | Media | Excepción en `useCuadrillas` (`error !== null`) o búsqueda sin resultados con filtros activos | Simulación de error de red o búsqueda `q="InexistenteXYZ"` | Si hay error, mostrar banner/toast con botón `recargar()`; si es filtro sin resultados, botón "Limpiar filtros" en estado vacío | `CuadrillasAdminClient` ignora `error` y `recargar` de `useCuadrillas`, mostrando mensaje de tabla vacía sin acción | **ABIERTO** | 09/11/2026 11:40 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| `BUG-H80-WEB-05` | Integridad del manual de usuario en `/docs/manuals/H80-listar-cuadrillas.md` y pruebas unitarias de `NO_DISPONIBLE` y Drawer | Documentación / QA | Repositorio / Vitest | Media | Revisión de entregables en rama `feature/H80-listar-cuadrillas` | Inspección de `docs/manuals/H80-listar-cuadrillas.md`, `docs/manuales-usuario/H80-listar-cuadrillas.md` y suite Vitest | Manual completo sin emojis en `/docs/manuals/` y tests unitarios para los 3 estados y `CuadrillaDetalleDrawer` | Archivo en `docs/manuales-usuario/` vaciado a 0 bytes en último commit, inexistente en `docs/manuals/` y test de `NO_DISPONIBLE` removido | **ABIERTO** | 09/11/2026 11:40 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| `CP-H80-WEB-01` | Renderizado de vista principal en `/gestion/admin/cuadrillas` con miga de pan y encabezado institucional (CA-1) | Funcional / UI | Vista | Alta | Usuario autenticado con rol Administrador o Encargado | Navegación a `/gestion/admin/cuadrillas` | Despliega breadcrumb institucional, título `h1` "Cuadrillas Operativas", barra de filtros, tabla y paginador | Vista renderizada con componentes `Heading` y `Button` respetando la paleta municipal | **APROBADO** | 09/11/2026 11:40 | - | feat(cuadrillas): crear hooks y componentes de tabla, filtros y modal de edicion de dotacion H81 |
| `CP-H80-WEB-02` | Visualización de columnas obligatorias en `CuadrillasTabla`: Nombre, Delegación, Delegado, Dotación y Estado (CA-2) | Funcional / UI | Componente / Tabla | Crítica | Lista de cuadrillas cargada en `CuadrillasTabla` | Renderizado con `CUADRILLAS_FALLBACK` (3 cuadrillas operativas) | Encabezados y celdas visibles: Cuadrilla Operativa, Delegación Base, Delegado Responsable, Dotación, Estado y Acciones | Las 6 columnas exhiben nombre, ID abreviado, delegación, delegado con RUT, conteo de dotación y estado | **APROBADO** | 09/11/2026 11:40 | - | feat(cuadrillas): crear hooks y componentes de tabla, filtros y modal de edicion de dotacion H81 |
| `CP-H80-WEB-03` | Renderizado de badge semántico para estado `DISPONIBLE` con colores institucionales (CA-2) | UI / Diseño | Componente / Badge | Alta | Cuadrilla con `estado: 'DISPONIBLE'` | `<BadgeEstadoCuadrilla estado="DISPONIBLE" />` | Badge rectangular con fondo `#E8F5E9`, texto `#2E7D32`, dot circular de 6px y etiqueta `DISPONIBLE` | Badge verde renderizado sin bordes redondeados en el contenedor y sin emojis | **APROBADO** | 09/11/2026 11:40 | - | feat(cuadrillas): crear hooks y componentes de tabla, filtros y modal de edicion de dotacion H81 |
| `CP-H80-WEB-04` | Renderizado de badge semántico para estado `EN_MISION` con ícono `Clock` de Lucide (CA-2) | UI / Diseño | Componente / Badge | Alta | Cuadrilla con `estado: 'EN_MISION'` | `<BadgeEstadoCuadrilla estado="EN_MISION" />` | Badge rectangular con fondo `#FFF3E0`, texto `#E65100`, ícono `Clock` y etiqueta `EN MISIÓN` | Badge naranja renderizado correctamente con tooltip descriptivo de despliegue en terreno | **APROBADO** | 09/11/2026 11:40 | - | feat(cuadrillas): crear hooks y componentes de tabla, filtros y modal de edicion de dotacion H81 |
| `CP-H80-WEB-05` | Renderizado de badge semántico para estado `NO_DISPONIBLE` en tono neutro (CA-2) | UI / Diseño | Componente / Badge | Alta | Cuadrilla con `estado: 'NO_DISPONIBLE'` | `<BadgeEstadoCuadrilla estado="NO_DISPONIBLE" />` | Badge rectangular con fondo `#F1F3F5`, texto `#5F676E`, dot gris y etiqueta `NO DISPONIBLE` | Componente renderiza la etiqueta `NO DISPONIBLE` con colores neutros institucionales | **APROBADO** | 09/11/2026 11:40 | - | feat(cuadrillas): crear hooks y componentes de tabla, filtros y modal de edicion de dotacion H81 |
| `CP-H80-WEB-06` | Contadores de personal y recursos vinculados en columna Dotación con pluralización correcta (CA-2) | Funcional / UI | Componente / Tabla | Alta | Cuadrillas con 0, 1 y 2 operarios/recursos | Inspección de celda Dotación en `CuadrillasTabla` | Muestra ícono `Users` con `N operario(s)` e ícono `Wrench` con `N recurso(s)` a partir de `trabajadores.length` o `totalTrabajadores` | Contadores numéricos y etiquetas singulares/plurales renderizados con exactitud | **APROBADO** | 09/11/2026 11:40 | - | feat(cuadrillas): crear hooks y componentes de tabla, filtros y modal de edicion de dotacion H81 |
| `CP-H80-WEB-07` | Apertura del `CuadrillaDetalleDrawer` mediante botón de acción "Detalle" (CA-3) | Funcional / UI | Componente / Drawer | Alta | Tabla de cuadrillas renderizada | Clic en botón `<Button>Detalle</Button>` de la primera fila | Se abre el panel lateral `CuadrillaDetalleDrawer` con atributo `role="dialog"` y título de la cuadrilla | Drawer lateral desplegado mostrando cabecera institucional, delegado, trabajadores y equipamiento | **APROBADO** | 09/11/2026 11:40 | - | feat(cuadrillas): crear hooks y componentes de tabla, filtros y modal de edicion de dotacion H81 |
| `CP-H80-WEB-08` | Visualización detallada de miembros de personal asignados en `CuadrillaDetalleDrawer` (CA-3) | Funcional / UI | Componente / Drawer | Alta | Drawer abierto para "Cuadrilla Vías y Despeje Urbano" | `trabajadores` con 2 operarios ("Pedro Obrero", "Jorge Almonacid") | Sección "Trabajadores Asignados (2)" lista nombre, cargo, especialidad y RUT de cada integrante | Tarjetas individuales de operarios renderizadas con cargo, especialidad y RUT formateado | **APROBADO** | 09/11/2026 11:40 | - | feat(cuadrillas): crear hooks y componentes de tabla, filtros y modal de edicion de dotacion H81 |
| `CP-H80-WEB-09` | Visualización detallada de equipos y vehículos vinculados (`cuadrilla_recurso`) en `CuadrillaDetalleDrawer` (CA-3) | Funcional / UI | Componente / Drawer | Alta | Drawer abierto para "Cuadrilla Vías y Despeje Urbano" | `recursos` con Camioneta 4x4 (`esIndividual: true`, cant: 1) y Motosierra (`esIndividual: false`, cant: 2) | Sección "Equipamiento y Vehículos (2)" distingue "Vehículo / Activo Individual" vs "Insumo / Herramienta" y cantidad asignada | Lista de recursos exhibe nombre, clasificación de inventario y badge de unidades asignadas | **APROBADO** | 09/11/2026 11:40 | - | feat(cuadrillas): crear hooks y componentes de tabla, filtros y modal de edicion de dotacion H81 |
| `CP-H80-WEB-10` | Mensajes informativos en `CuadrillaDetalleDrawer` cuando la cuadrilla no tiene personal o recursos asignados (CA-3) | Funcional / UX | Componente / Drawer | Media | Drawer abierto para cuadrilla con `trabajadores: []` o `recursos: []` | Selección de cuadrilla sin dotación asignada | Muestra textos en cursiva indicando ausencia de trabajadores operativos o recursos logísticos | Mensajes de dotación vacía desplegados sin errores de renderizado | **APROBADO** | 09/11/2026 11:40 | - | feat(cuadrillas): crear hooks y componentes de tabla, filtros y modal de edicion de dotacion H81 |
| `CP-H80-WEB-11` | Cierre del `CuadrillaDetalleDrawer` mediante tecla `Escape`, botón `X` o clic en backdrop (CA-3) | Usabilidad / A11y | Componente / Drawer | Media | `CuadrillaDetalleDrawer` abierto (`isOpen: true`) | Pulsación de tecla `Escape`, clic en botón "Cerrar" o clic en fondo oscuro | Se invoca `onCerrar` y el drawer se desmonta del DOM | Listener de teclado y botones cierran limpiamente el panel lateral | **APROBADO** | 09/11/2026 11:40 | - | feat(cuadrillas): crear hooks y componentes de tabla, filtros y modal de edicion de dotacion H81 |
| `CP-H80-WEB-12` | Filtro por delegación municipal en `CuadrillasFiltros` y recarga del hook `useCuadrillas` (CA-4) | Funcional / Filtros | Componente / Hook | Alta | Catálogo de delegaciones cargado en selector | Selección de `delegacionId = 'del-2'` en `<select aria-label="Filtrar por delegación municipal">` | `onDelegacionChange` actualiza `filtros.delegacionId`, reinicia `pagina: 1` y `useCuadrillas` consulta `GET /api/cuadrillas?delegacionId=del-2` | Prueba unitaria en `CuadrillasFiltros.test.tsx` y `useCuadrillas.test.ts` verificada exitosamente | **APROBADO** | 09/11/2026 11:40 | - | test(cuadrillas): agregar tests de CuadrillasFiltros y useCuadrillas (H80) |
| `CP-H80-WEB-13` | Filtro por estado operativo (`DISPONIBLE`, `EN_MISION`, `NO_DISPONIBLE`) en `CuadrillasFiltros` (CA-4) | Funcional / Filtros | Componente / Hook | Alta | Selector de estado operativo en barra de filtros | Selección de `estado = 'EN_MISION'` en `<select aria-label="Filtrar por estado operativo">` | `onEstadoChange` actualiza `filtros.estado`, reinicia `pagina: 1` y filtra las cuadrillas en misión | Selector incluye las 3 opciones canónicas y dispara el filtrado reactivo | **APROBADO** | 09/11/2026 11:40 | - | test(cuadrillas): agregar tests de CuadrillasFiltros y useCuadrillas (H80) |
| `CP-H80-WEB-14` | Búsqueda por texto libre (nombre de cuadrilla, delegado o RUT) y limpieza individual con botón `X` (CA-4) | Funcional / Filtros | Componente / Input | Media | Barra `CuadrillasFiltros` visible | Escritura de término `"Vías"` en buscador y posterior clic en botón `"Limpiar búsqueda"` | Invoca `onBusquedaChange('Vías')` filtrando coincidencias y al pulsar `X` restablece a `''` | Input controlado y botón de vaciado rápido funcionan según lo esperado | **APROBADO** | 09/11/2026 11:40 | - | test(cuadrillas): agregar tests de CuadrillasFiltros y useCuadrillas (H80) |
| `CP-H80-WEB-15` | Visibilidad condicional y acción del botón "Limpiar filtros" ante criterios activos (CA-4) | Usabilidad / Filtros | Componente / UI | Media | Al menos un filtro activo (`busqueda`, `delegacionId` o `estado`) | Clic en `<Button>Limpiar filtros</Button>` | Botón oculto sin filtros; visible al activar cualquier filtro; al hacer clic restablece todos los filtros y vuelve a página 1 | Validado mediante los casos 3 y 4 de `CuadrillasFiltros.test.tsx` | **APROBADO** | 09/11/2026 11:40 | - | test(cuadrillas): agregar tests de CuadrillasFiltros y useCuadrillas (H80) |
| `CP-H80-WEB-16` | Consumo de `GET /api/cuadrillas` mediante cliente tipado `apiClient.GET` con query params (CA-5) | Integración / DAL | Servicio | Crítica | `cuadrillasService.obtenerCuadrillas(filtros)` invocado | `{ pagina: 1, limite: 10, busqueda: 'Vías', delegacionId: 'del-1', estado: 'DISPONIBLE' }` | Despacha `GET /api/cuadrillas` con query `{ pagina, limite, q, delegacionId, estado }` y retorna `{ cuadrillas, meta }` | Servicio construye los parámetros de consulta y desempaqueta `data.data` y `data.meta` | **APROBADO** | 09/11/2026 11:40 | - | feat(cuadrillas): definir DTOs, tipos y metodos de servicio para edicion H81 |
| `CP-H80-WEB-17` | Estado de carga visual en `CuadrillasTabla` mientras `cargando` es `true` (CA-1) | UX / Feedback | Componente / Tabla | Media | Petición asíncrona en curso (`cargando: true`) | `<CuadrillasTabla cuadrillas={[]} cargando={true} ... />` | Renderiza contenedor blanco con ícono `HardHat` animado y texto `"Cargando cuadrillas operativas..."` | Indicador de carga visualizado sin errores de hidratación | **APROBADO** | 09/11/2026 11:40 | - | feat(cuadrillas): crear hooks y componentes de tabla, filtros y modal de edicion de dotacion H81 |
| `CP-H80-WEB-18` | Visibilidad condicional de botones de creación y edición según permisos `recursos:crear` y `recursos:editar` | Seguridad / RBAC | Vista / Tabla | Alta | Sesión de Encargado (con `recursos:leer`, sin `recursos:crear` ni `recursos:editar`) | Renderizado de `CuadrillasAdminClient` y `CuadrillasTabla` con `puedeCrear=false`, `puedeEditar=false` | Oculta el botón "Registrar Nueva Cuadrilla" y los botones "Editar", permitiendo únicamente consultar la tabla y el drawer de detalle | Los controles de mutación se ocultan correctamente para roles de consulta táctica | **APROBADO** | 09/11/2026 11:40 | - | feat(cuadrillas): crear hooks y componentes de tabla, filtros y modal de edicion de dotacion H81 |
| `CP-H80-WEB-19` | Actualización en tiempo real del listado vía WebSocket (`cuadrilla:creada` y `cuadrilla:actualizada`) | Tiempo Real / Socket.io | Hook | Media | Hook `useCuadrillas` montado y conectado a `getSocket()` | Emisión de eventos `cuadrilla:actualizada` y `cuadrilla:creada` | Actualiza el registro en memoria sin duplicar o dispara recarga del listado, limpiando listeners al desmontar | Suscripción y limpieza (`socket.off`) implementadas correctamente en `useCuadrillas.ts` | **APROBADO** | 09/11/2026 11:40 | - | test(cuadrillas): agregar tests de CuadrillasFiltros y useCuadrillas (H80) |
| `CP-H80-WEB-20` | Verificación de tipos TypeScript (`tsc --noEmit`) y linter (`eslint`) en el módulo de cuadrillas | Calidad / CI | Estático | Alta | Repositorio en rama `feature/H80-listar-cuadrillas` | Ejecución de `npx tsc --noEmit` y `npm run lint` | 0 errores de compilación TypeScript y 0 errores de ESLint | Ambos comandos finalizan con código de salida 0 | **APROBADO** | 09/11/2026 11:40 | - | test(cuadrillas): agregar tests de CuadrillasFiltros y useCuadrillas (H80) |

---

## 4. Matriz en Formato TSV

```tsv
ID Caso	Título del Caso de Prueba	Tipo de Prueba	Nivel	Prioridad	Precondición	Datos de Prueba (Payload / Headers / Query)	Resultado Esperado	Resultado Obtenido	Estado	Fecha / Hora Ejecución	Fecha / Hora Re-Test	Solución / Commit
BUG-H80-WEB-01	Control de acceso RBAC en /gestion/admin/cuadrillas y bloqueo ante HTTP 403 Forbidden	Seguridad / RBAC	Vista / Servicio	Crítica	Sesión activa con rol Call Center o Asistente Social sin permiso recursos:leer	Navegación directa a /gestion/admin/cuadrillas o respuesta HTTP 403 de GET /api/cuadrillas	Bloqueo perimetral renderizando AccesoDenegadoState (HTTP 403) sin exponer registros de fallback	CuadrillasAdminClient omite validar recursos:leer y obtenerCuadrillas retorna CUADRILLAS_FALLBACK ante HTTP 403	ABIERTO	09/11/2026 11:40	(Pendiente)	Pendiente (Rechazado en Code Review)
BUG-H80-WEB-02	Apertura del drawer lateral de dotación al hacer clic sobre cualquier fila de la tabla (CA-3)	Funcional / UI	Componente / Tabla	Alta	Tabla cargada con cuadrillas operativas en /gestion/admin/cuadrillas	Evento click sobre la fila <tr> de "Cuadrilla Vías y Despeje Urbano"	Se invoca onVerDetalle(cuadrilla) y se despliega CuadrillaDetalleDrawer con personal y recursos	El elemento <tr> carece de manejador onClick; solo responde el botón secundario "Detalle"	ABIERTO	09/11/2026 11:40	(Pendiente)	Pendiente (Rechazado en Code Review)
BUG-H80-WEB-03	Normalización de contrato H34 en metadatos de paginación y sincronización en URLSearchParams (CA-1, CA-5)	Integración / Contrato H34	Servicio / Vista	Alta	Backend respondiendo con meta: { total, page, limit, totalPages } y filtros activos en UI	Selección de delegacionId y estado=DISPONIBLE en CuadrillasAdminClient	Mapeo compatible de meta H34 y sincronización de query params (?delegacionId=...&estado=DISPONIBLE) en la URL	No normaliza totalPages/page/limit de H34 ni sincroniza el estado de filtros con URLSearchParams	ABIERTO	09/11/2026 11:40	(Pendiente)	Pendiente (Rechazado en Code Review)
BUG-H80-WEB-04	Renderizado de alerta de error con reintento ante fallo de carga y acción de limpiar filtros en tabla vacía	Usabilidad / Resiliencia	Vista / Tabla	Media	Excepción en useCuadrillas (error !== null) o búsqueda sin resultados con filtros activos	Simulación de error de red o búsqueda q="InexistenteXYZ"	Si hay error, mostrar banner/toast con botón recargar(); si es filtro sin resultados, botón "Limpiar filtros" en estado vacío	CuadrillasAdminClient ignora error y recargar de useCuadrillas, mostrando mensaje de tabla vacía sin acción	ABIERTO	09/11/2026 11:40	(Pendiente)	Pendiente (Rechazado en Code Review)
BUG-H80-WEB-05	Integridad del manual de usuario en /docs/manuals/H80-listar-cuadrillas.md y pruebas unitarias de NO_DISPONIBLE y Drawer	Documentación / QA	Repositorio / Vitest	Media	Revisión de entregables en rama feature/H80-listar-cuadrillas	Inspección de docs/manuals/H80-listar-cuadrillas.md, docs/manuales-usuario/H80-listar-cuadrillas.md y suite Vitest	Manual completo sin emojis en /docs/manuals/ y tests unitarios para los 3 estados y CuadrillaDetalleDrawer	Archivo en docs/manuales-usuario/ vaciado a 0 bytes en último commit, inexistente en docs/manuals/ y test de NO_DISPONIBLE removido	ABIERTO	09/11/2026 11:40	(Pendiente)	Pendiente (Rechazado en Code Review)
CP-H80-WEB-01	Renderizado de vista principal en /gestion/admin/cuadrillas con miga de pan y encabezado institucional (CA-1)	Funcional / UI	Vista	Alta	Usuario autenticado con rol Administrador o Encargado	Navegación a /gestion/admin/cuadrillas	Despliega breadcrumb institucional, título h1 "Cuadrillas Operativas", barra de filtros, tabla y paginador	Vista renderizada con componentes Heading y Button respetando la paleta municipal	APROBADO	09/11/2026 11:40	-	feat(cuadrillas): crear hooks y componentes de tabla, filtros y modal de edicion de dotacion H81
CP-H80-WEB-02	Visualización de columnas obligatorias en CuadrillasTabla: Nombre, Delegación, Delegado, Dotación y Estado (CA-2)	Funcional / UI	Componente / Tabla	Crítica	Lista de cuadrillas cargada en CuadrillasTabla	Renderizado con CUADRILLAS_FALLBACK (3 cuadrillas operativas)	Encabezados y celdas visibles: Cuadrilla Operativa, Delegación Base, Delegado Responsable, Dotación, Estado y Acciones	Las 6 columnas exhiben nombre, ID abreviado, delegación, delegado con RUT, conteo de dotación y estado	APROBADO	09/11/2026 11:40	-	feat(cuadrillas): crear hooks y componentes de tabla, filtros y modal de edicion de dotacion H81
CP-H80-WEB-03	Renderizado de badge semántico para estado DISPONIBLE con colores institucionales (CA-2)	UI / Diseño	Componente / Badge	Alta	Cuadrilla con estado: 'DISPONIBLE'	<BadgeEstadoCuadrilla estado="DISPONIBLE" />	Badge rectangular con fondo #E8F5E9, texto #2E7D32, dot circular de 6px y etiqueta DISPONIBLE	Badge verde renderizado sin bordes redondeados en el contenedor y sin emojis	APROBADO	09/11/2026 11:40	-	feat(cuadrillas): crear hooks y componentes de tabla, filtros y modal de edicion de dotacion H81
CP-H80-WEB-04	Renderizado de badge semántico para estado EN_MISION con ícono Clock de Lucide (CA-2)	UI / Diseño	Componente / Badge	Alta	Cuadrilla con estado: 'EN_MISION'	<BadgeEstadoCuadrilla estado="EN_MISION" />	Badge rectangular con fondo #FFF3E0, texto #E65100, ícono Clock y etiqueta EN MISIÓN	Badge naranja renderizado correctamente con tooltip descriptivo de despliegue en terreno	APROBADO	09/11/2026 11:40	-	feat(cuadrillas): crear hooks y componentes de tabla, filtros y modal de edicion de dotacion H81
CP-H80-WEB-05	Renderizado de badge semántico para estado NO_DISPONIBLE en tono neutro (CA-2)	UI / Diseño	Componente / Badge	Alta	Cuadrilla con estado: 'NO_DISPONIBLE'	<BadgeEstadoCuadrilla estado="NO_DISPONIBLE" />	Badge rectangular con fondo #F1F3F5, texto #5F676E, dot gris y etiqueta NO DISPONIBLE	Componente renderiza la etiqueta NO DISPONIBLE con colores neutros institucionales	APROBADO	09/11/2026 11:40	-	feat(cuadrillas): crear hooks y componentes de tabla, filtros y modal de edicion de dotacion H81
CP-H80-WEB-06	Contadores de personal y recursos vinculados en columna Dotación con pluralización correcta (CA-2)	Funcional / UI	Componente / Tabla	Alta	Cuadrillas con 0, 1 y 2 operarios/recursos	Inspección de celda Dotación en CuadrillasTabla	Muestra ícono Users con N operario(s) e ícono Wrench con N recurso(s) a partir de trabajadores.length o totalTrabajadores	Contadores numéricos y etiquetas singulares/plurales renderizados con exactitud	APROBADO	09/11/2026 11:40	-	feat(cuadrillas): crear hooks y componentes de tabla, filtros y modal de edicion de dotacion H81
CP-H80-WEB-07	Apertura del CuadrillaDetalleDrawer mediante botón de acción "Detalle" (CA-3)	Funcional / UI	Componente / Drawer	Alta	Tabla de cuadrillas renderizada	Clic en botón <Button>Detalle</Button> de la primera fila	Se abre el panel lateral CuadrillaDetalleDrawer con atributo role="dialog" y título de la cuadrilla	Drawer lateral desplegado mostrando cabecera institucional, delegado, trabajadores y equipamiento	APROBADO	09/11/2026 11:40	-	feat(cuadrillas): crear hooks y componentes de tabla, filtros y modal de edicion de dotacion H81
CP-H80-WEB-08	Visualización detallada de miembros de personal asignados en CuadrillaDetalleDrawer (CA-3)	Funcional / UI	Componente / Drawer	Alta	Drawer abierto para "Cuadrilla Vías y Despeje Urbano"	trabajadores con 2 operarios ("Pedro Obrero", "Jorge Almonacid")	Sección "Trabajadores Asignados (2)" lista nombre, cargo, especialidad y RUT de cada integrante	Tarjetas individuales de operarios renderizadas con cargo, especialidad y RUT formateado	APROBADO	09/11/2026 11:40	-	feat(cuadrillas): crear hooks y componentes de tabla, filtros y modal de edicion de dotacion H81
CP-H80-WEB-09	Visualización detallada de equipos y vehículos vinculados (cuadrilla_recurso) en CuadrillaDetalleDrawer (CA-3)	Funcional / UI	Componente / Drawer	Alta	Drawer abierto para "Cuadrilla Vías y Despeje Urbano"	recursos con Camioneta 4x4 (esIndividual: true, cant: 1) y Motosierra (esIndividual: false, cant: 2)	Sección "Equipamiento y Vehículos (2)" distingue "Vehículo / Activo Individual" vs "Insumo / Herramienta" y cantidad asignada	Lista de recursos exhibe nombre, clasificación de inventario y badge de unidades asignadas	APROBADO	09/11/2026 11:40	-	feat(cuadrillas): crear hooks y componentes de tabla, filtros y modal de edicion de dotacion H81
CP-H80-WEB-10	Mensajes informativos en CuadrillaDetalleDrawer cuando la cuadrilla no tiene personal o recursos asignados (CA-3)	Funcional / UX	Componente / Drawer	Media	Drawer abierto para cuadrilla con trabajadores: [] o recursos: []	Selección de cuadrilla sin dotación asignada	Muestra textos en cursiva indicando ausencia de trabajadores operativos o recursos logísticos	Mensajes de dotación vacía desplegados sin errores de renderizado	APROBADO	09/11/2026 11:40	-	feat(cuadrillas): crear hooks y componentes de tabla, filtros y modal de edicion de dotacion H81
CP-H80-WEB-11	Cierre del CuadrillaDetalleDrawer mediante tecla Escape, botón X o clic en backdrop (CA-3)	Usabilidad / A11y	Componente / Drawer	Media	CuadrillaDetalleDrawer abierto (isOpen: true)	Pulsación de tecla Escape, clic en botón "Cerrar" o clic en fondo oscuro	Se invoca onCerrar y el drawer se desmonta del DOM	Listener de teclado y botones cierran limpiamente el panel lateral	APROBADO	09/11/2026 11:40	-	feat(cuadrillas): crear hooks y componentes de tabla, filtros y modal de edicion de dotacion H81
CP-H80-WEB-12	Filtro por delegación municipal en CuadrillasFiltros y recarga del hook useCuadrillas (CA-4)	Funcional / Filtros	Componente / Hook	Alta	Catálogo de delegaciones cargado en selector	Selección de delegacionId = 'del-2' en <select aria-label="Filtrar por delegación municipal">	onDelegacionChange actualiza filtros.delegacionId, reinicia pagina: 1 y useCuadrillas consulta GET /api/cuadrillas?delegacionId=del-2	Prueba unitaria en CuadrillasFiltros.test.tsx y useCuadrillas.test.ts verificada exitosamente	APROBADO	09/11/2026 11:40	-	test(cuadrillas): agregar tests de CuadrillasFiltros y useCuadrillas (H80)
CP-H80-WEB-13	Filtro por estado operativo (DISPONIBLE, EN_MISION, NO_DISPONIBLE) en CuadrillasFiltros (CA-4)	Funcional / Filtros	Componente / Hook	Alta	Selector de estado operativo en barra de filtros	Selección de estado = 'EN_MISION' en <select aria-label="Filtrar por estado operativo">	onEstadoChange actualiza filtros.estado, reinicia pagina: 1 y filtra las cuadrillas en misión	Selector incluye las 3 opciones canónicas y dispara el filtrado reactivo	APROBADO	09/11/2026 11:40	-	test(cuadrillas): agregar tests de CuadrillasFiltros y useCuadrillas (H80)
CP-H80-WEB-14	Búsqueda por texto libre (nombre de cuadrilla, delegado o RUT) y limpieza individual con botón X (CA-4)	Funcional / Filtros	Componente / Input	Media	Barra CuadrillasFiltros visible	Escritura de término "Vías" en buscador y posterior clic en botón "Limpiar búsqueda"	Invoca onBusquedaChange('Vías') filtrando coincidencias y al pulsar X restablece a ''	Input controlado y botón de vaciado rápido funcionan según lo esperado	APROBADO	09/11/2026 11:40	-	test(cuadrillas): agregar tests de CuadrillasFiltros y useCuadrillas (H80)
CP-H80-WEB-15	Visibilidad condicional y acción del botón "Limpiar filtros" ante criterios activos (CA-4)	Usabilidad / Filtros	Componente / UI	Media	Al menos un filtro activo (busqueda, delegacionId o estado)	Clic en <Button>Limpiar filtros</Button>	Botón oculto sin filtros; visible al activar cualquier filtro; al hacer clic restablece todos los filtros y vuelve a página 1	Validado mediante los casos 3 y 4 de CuadrillasFiltros.test.tsx	APROBADO	09/11/2026 11:40	-	test(cuadrillas): agregar tests de CuadrillasFiltros y useCuadrillas (H80)
CP-H80-WEB-16	Consumo de GET /api/cuadrillas mediante cliente tipado apiClient.GET con query params (CA-5)	Integración / DAL	Servicio	Crítica	cuadrillasService.obtenerCuadrillas(filtros) invocado	{ pagina: 1, limite: 10, busqueda: 'Vías', delegacionId: 'del-1', estado: 'DISPONIBLE' }	Despacha GET /api/cuadrillas con query { pagina, limite, q, delegacionId, estado } y retorna { cuadrillas, meta }	Servicio construye los parámetros de consulta y desempaqueta data.data y data.meta	APROBADO	09/11/2026 11:40	-	feat(cuadrillas): definir DTOs, tipos y metodos de servicio para edicion H81
CP-H80-WEB-17	Estado de carga visual en CuadrillasTabla mientras cargando es true (CA-1)	UX / Feedback	Componente / Tabla	Media	Petición asíncrona en curso (cargando: true)	<CuadrillasTabla cuadrillas={[]} cargando={true} ... />	Renderiza contenedor blanco con ícono HardHat animado y texto "Cargando cuadrillas operativas..."	Indicador de carga visualizado sin errores de hidratación	APROBADO	09/11/2026 11:40	-	feat(cuadrillas): crear hooks y componentes de tabla, filtros y modal de edicion de dotacion H81
CP-H80-WEB-19	Actualización en tiempo real del listado vía WebSocket (cuadrilla:creada y cuadrilla:actualizada)	Tiempo Real / Socket.io	Hook	Media	Hook useCuadrillas montado y conectado a getSocket()	Emisión de eventos cuadrilla:actualizada y cuadrilla:creada	Actualiza el registro en memoria sin duplicar o dispara recarga del listado, limpiando listeners al desmontar	Suscripción y limpieza (socket.off) implementadas correctamente en useCuadrillas.ts	APROBADO	09/11/2026 11:40	-	test(cuadrillas): agregar tests de CuadrillasFiltros y useCuadrillas (H80)
CP-H80-WEB-18	Visibilidad condicional de botones de creación y edición según permisos recursos:crear y recursos:editar	Seguridad / RBAC	Vista / Tabla	Alta	Sesión de Encargado (con recursos:leer, sin recursos:crear ni recursos:editar)	Renderizado de CuadrillasAdminClient y CuadrillasTabla con puedeCrear=false, puedeEditar=false	Oculta el botón "Registrar Nueva Cuadrilla" y los botones "Editar", permitiendo únicamente consultar la tabla y el drawer de detalle	Los controles de mutación se ocultan correctamente para roles de consulta táctica	APROBADO	09/11/2026 11:40	-	feat(cuadrillas): crear hooks y componentes de tabla, filtros y modal de edicion de dotacion H81
CP-H80-WEB-20	Verificación de tipos TypeScript (tsc --noEmit) y linter (eslint) en el módulo de cuadrillas	Calidad / CI	Estático	Alta	Repositorio en rama feature/H80-listar-cuadrillas	Ejecución de npx tsc --noEmit y npm run lint	0 errores de compilación TypeScript y 0 errores de ESLint	Ambos comandos finalizan con código de salida 0	APROBADO	09/11/2026 11:40	-	test(cuadrillas): agregar tests de CuadrillasFiltros y useCuadrillas (H80)
```

---

## 5. Guía de Ejecución Paso a Paso y Evidencias Replicables

### 5.1 Ejecución de Pruebas Unitarias Automatizadas con Vitest

#### A. Suite de Filtros de Cuadrillas (`CuadrillasFiltros.test.tsx`)
**Comando:**
```bash
npm test -- src/components/admin/cuadrillas/__tests__/CuadrillasFiltros.test.tsx -t "CuadrillasFiltros (H80)"
```
**Resultado Obtenido:**
```text
 RUN  v3.2.7 /home/ds2fery/Documentos/Proyecto/sgrai-uach/web

 ✓ src/components/admin/cuadrillas/__tests__/CuadrillasFiltros.test.tsx (5 tests) 263ms
   ✓ CuadrillasFiltros (H80) > caso 1: debe renderizar campo de búsqueda, select de delegación y select de estado
   ✓ CuadrillasFiltros (H80) > caso 2: al escribir en búsqueda, llama onBusquedaChange con el valor correcto
   ✓ CuadrillasFiltros (H80) > caso 3: botón "Limpiar filtros" solo visible cuando hay filtros activos
   ✓ CuadrillasFiltros (H80) > caso 4: clic en "Limpiar filtros" invoca onLimpiar
   ✓ CuadrillasFiltros (H80) > caso 5: cambiar delegación invoca onDelegacionChange con el id seleccionado o undefined

 Test Files  1 passed (1)
      Tests  5 passed (5)
```

#### B. Suite del Hook de Consulta y Estado Reactivo (`useCuadrillas.test.ts`)
**Comando:**
```bash
npm test -- src/hooks/__tests__/useCuadrillas.test.ts -t "useCuadrillas hook (H80)"
```
**Resultado Obtenido:**
```text
 RUN  v3.2.7 /home/ds2fery/Documentos/Proyecto/sgrai-uach/web

 ✓ src/hooks/__tests__/useCuadrillas.test.ts (4 tests) 314ms
   ✓ useCuadrillas hook (H80) > caso 1: debe llamar a cuadrillasService.obtenerCuadrillas al montar y cargar el estado
   ✓ useCuadrillas hook (H80) > caso 2: re-dispara fetch cuando cambia filtros.delegacionId
   ✓ useCuadrillas hook (H80) > caso 3: actualizarCuadrillaEnLista actualiza el elemento existente sin duplicar
   ✓ useCuadrillas hook (H80) > caso 4: si obtenerCuadrillas lanza error, error queda con mensaje y cargando=false

 Test Files  1 passed (1)
      Tests  4 passed (4)
```

#### C. Suite de Tabla y Servicio DAL (`CuadrillasTabla.test.tsx` y `cuadrillasService.test.ts`)
**Comando:**
```bash
npm test -- src/components/admin/cuadrillas/__tests__/CuadrillasTabla.test.tsx src/services/__tests__/cuadrillasService.test.ts
```
**Resultado Obtenido:**
```text
 RUN  v3.2.7 /home/ds2fery/Documentos/Proyecto/sgrai-uach/web

 ✓ src/services/__tests__/cuadrillasService.test.ts (15 tests) 83ms
 ✓ src/components/admin/cuadrillas/__tests__/CuadrillasTabla.test.tsx (3 tests) 533ms

 Test Files  2 passed (2)
      Tests  18 passed (18)
```

---

### 5.2 Verificación de Tipado Estático y Linter

**Comando:**
```bash
npx tsc --noEmit && npm run lint
```
**Resultado Obtenido:**
```text
✖ 10 problems (0 errors, 10 warnings)
Exit code: 0
```

---

### 5.3 Pruebas de Contrato HTTP/JSON con cURL sobre `GET /api/cuadrillas`

#### Escenario 1: Consulta Paginada de Cuadrillas con Filtros por Delegación y Estado (CA-4, CA-5)
**Comando cURL:**
```bash
curl -i -X GET "http://localhost:3001/api/cuadrillas?pagina=1&limite=10&delegacionId=30000000-0000-4000-8000-000000000001&estado=DISPONIBLE" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer <TOKEN_ENCARGADO_O_ADMIN>"
```
**Respuesta HTTP / JSON Esperada y Soportada (`200 OK`):**
```json
{
  "message": "Listado de cuadrillas operativas obtenido exitosamente",
  "data": [
    {
      "id": "50000000-0000-4000-8000-000000000001",
      "nombre": "Cuadrilla Vías y Despeje Urbano",
      "estado": "DISPONIBLE",
      "delegacion": {
        "id": "30000000-0000-4000-8000-000000000001",
        "nombre": "Delegación Municipal Norte"
      },
      "delegado": {
        "id": "00000000-0000-4000-8000-000000000005",
        "nombre": "Carlos Delegado",
        "email": "carlos@valdivia.cl",
        "rut": "15.111.222-3"
      },
      "recursos": [
        {
          "id": "cd100000-0000-4000-8000-000000000001",
          "recursoId": "e1000000-0000-4000-8000-000000000001",
          "nombre": "Camioneta de Rescate 4x4",
          "cantidadAsignada": 1,
          "esIndividual": true
        },
        {
          "id": "cd100000-0000-4000-8000-000000000002",
          "recursoId": "e1000000-0000-4000-8000-000000000003",
          "nombre": "Motosierra Stihl MS-382",
          "cantidadAsignada": 2,
          "esIndividual": false
        }
      ],
      "trabajadores": [
        {
          "id": "cp100000-0000-4000-8000-000000000001",
          "personalId": "40000000-0000-4000-8000-000000000001",
          "usuarioId": "00000000-0000-4000-8000-000000000009",
          "nombre": "Pedro Obrero",
          "rut": "16.222.333-4",
          "cargo": "Motosierrista",
          "especialidad": "Poda de Altura",
          "asignadoEn": "2026-10-24T12:00:00.000Z"
        }
      ],
      "totalRecursos": 2,
      "totalTrabajadores": 1,
      "creadoEn": "2026-10-24T12:00:00.000Z",
      "actualizadoEn": "2026-10-26T01:30:00.000Z"
    }
  ],
  "meta": {
    "total": 1,
    "pagina": 1,
    "limite": 10,
    "paginasTotales": 1
  }
}
```

#### Escenario 2: Consulta sin Permiso RBAC `recursos:leer` — Evidencia de `BUG-H80-WEB-01`
**Comando cURL:**
```bash
curl -i -X GET "http://localhost:3001/api/cuadrillas?pagina=1&limite=10" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer <TOKEN_CALL_CENTER>"
```
**Respuesta HTTP del Backend (`403 Forbidden`):**
```json
{
  "statusCode": 403,
  "error": "Forbidden",
  "message": "No tiene permisos suficientes para consultar cuadrillas operativas (requiere permiso 'recursos:leer')."
}
```
**Comportamiento Actual Defectuoso en Frontend (`BUG-H80-WEB-01`):**
En `src/services/cuadrillasService.ts` (líneas 754-772), al recibir `response.status === 403`, la condición `if (response && response.ok && data)` evalúa `false` y la ejecución continúa hacia el retorno de `CUADRILLAS_FALLBACK` sin lanzar `CuadrillaServiceError(403)`. Aunado a que `CuadrillasAdminClient.tsx` no verifica `hasPermission('recursos:leer')`, el usuario sin privilegios visualiza el listado de cuadrillas en lugar del componente `AccesoDenegadoState`.

---

## 6. Matriz de Trazabilidad de Criterios de Aceptación

| Criterio de Aceptación | Casos de Prueba Asociados | Defectos Asociados | Estado de Cumplimiento |
|---|---|---|:---:|
| **CA-1:** El sistema debe proveer una vista tabular en `/gestion/admin/cuadrillas` bajo estándar de contratos H34. | `CP-H80-WEB-01`, `CP-H80-WEB-17`, `CP-H80-WEB-18`, `CP-H80-WEB-20` | `BUG-H80-WEB-01`, `BUG-H80-WEB-03`, `BUG-H80-WEB-04` | 🔴 **PARCIAL (Observado)** |
| **CA-2:** La tabla debe mostrar: Nombre de la cuadrilla, Delegación base, Delegado responsable, Estado actual (`DISPONIBLE`, `EN_MISION`, `NO_DISPONIBLE`) y contador de personal/recursos vinculados. | `CP-H80-WEB-02`, `CP-H80-WEB-03`, `CP-H80-WEB-04`, `CP-H80-WEB-05`, `CP-H80-WEB-06` | `BUG-H80-WEB-05` | 🟡 **CUMPLIDO EN UI (Falta test de `NO_DISPONIBLE`)** |
| **CA-3:** Al hacer clic sobre una fila, se debe desplegar un drawer lateral con el detalle de miembros de personal asignados y equipos/vehículos vinculados (`cuadrilla_recurso`). | `CP-H80-WEB-07`, `CP-H80-WEB-08`, `CP-H80-WEB-09`, `CP-H80-WEB-10`, `CP-H80-WEB-11` | `BUG-H80-WEB-02`, `BUG-H80-WEB-05` | 🔴 **INCUMPLIDO (Fila `<tr>` no es clickeable)** |
| **CA-4:** Debe permitir filtrar por delegación municipal y estado operativo. | `CP-H80-WEB-12`, `CP-H80-WEB-13`, `CP-H80-WEB-14`, `CP-H80-WEB-15` | `BUG-H80-WEB-04` | 🟢 **CUMPLIDO** |
| **CA-5:** El endpoint `GET /api/cuadrillas` debe responder bajo estándar H34. | `CP-H80-WEB-16`, `CP-H80-WEB-19` | `BUG-H80-WEB-03` | 🔴 **PARCIAL (Falta normalización de `meta` H34)** |

