# Informe y Matriz de Casos de Prueba (QA): HU-80 — Visualizar Listado de Cuadrillas Operativas, Disponibilidad y Dotación

> **Documento Oficial de Aseguramiento de Calidad (QA) — Frontend Web**  
> **Proyecto:** Sistema de Gestión de Recursos para Atención de Incidentes (SGRAI) — Dirección de Gestión de Riesgos de Desastres, Municipalidad de Valdivia.  
> **Módulo:** Recursos y Personal / Administración de Cuadrillas Operativas (`sgrai-web` — `/gestion/admin/cuadrillas`).  
> **Historia de Usuario:** HU-80 — *"Como Administrador / Encargado Quiero visualizar un listado completo de las cuadrillas operativas registradas, su estado de disponibilidad y el personal y recursos que la componen Para conocer la capacidad de respuesta táctica disponible en cada delegación municipal al momento de asignar emergencias."*  
> **Desarrollador Asignado:** Jonagu1  
> **Equipo Auditor:** Aseguramiento de Calidad (QA) — Proyecto SGRAI  
> **Servicio Web Auditado:** `sgrai-web` (Next.js 16.3.4 App Router + React 19.2.8 + TypeScript 5 + Vitest v3.2.7 + Testing Library + CSS Modules / Vanilla CSS).  
> **Rama Git Evaluada:** `feature/H80-listar-cuadrillas`  
> **Commits Clave Evaluados:**  
> * `ddcfa66 test(cuadrillas): agregar tests de CuadrillasFiltros y useCuadrillas (H80)`  
> * `288e81d docs(usuario): crear manual de usuario para H80 listar cuadrillas`  
> * `5be5702 docs: HU-80`  
> * `b72e4c4 docs(qa): documentar casos de prueba para HU-80 (se requiere re-test)`  
> * `eddd6d9 fix(build): usar webpack en build de produccion para evitar fallo de Turbopack con next/font (H80)`  
> * `ae7db49 fix(cuadrillas): corregir observaciones QA H80 de listado web (RBAC, fila clickeable, H34, errores y manual)`  
>  
> **Fecha de Auditoría Inicial QA:** 09 de Noviembre de 2026.  
> **Fecha de Re-Test y Certificación Final QA:** 10 de Noviembre de 2026 16:15.  
> **Estado de Certificación:** 🟢 **APROBADO Y CERTIFICADO PARA PRODUCCIÓN (100% PASS TRAS RE-TEST EXITOSO)**.

---

## 1. Resumen Ejecutivo de Pruebas

| Métrica | Resultado | Observaciones Técnicas |
|---|:---:|---|
| **Total de Casos de Prueba Ejecutados** | **25** | 20 Casos Funcionales/UI/Seguridad/Integración + 5 Defectos Gestionados y Verificados |
| **Casos Aprobados (`APROBADO` / `CORREGIDO`)** | **25** | 100% de los casos conformes con Criterios de Aceptación (CA-1 a CA-5) |
| **Defectos Abiertos (`ABIERTO`)** | **0** | Todos los defectos subsanados y certificados en ciclo de Re-Test formal |
| **Casos Bloqueados (`BLOQUEADO`)** | **0** | Sin bloqueos de infraestructura ni dependencias |
| **Tasa de Aprobación Global (% Pass)** | **100.0%** | Cumple con el estándar de certificación para integración continua y merge a `develop` |
| **Análisis Estático de Código (`npm run lint`)** | 🟢 **0 errores** | Pipeline de ESLint limpio (10 advertencias menores de variables mock toleradas en módulos ajenos) |
| **Chequeo de Tipos Estáticos (`npx tsc --noEmit`)** | 🟢 **0 errores** | Compilación TypeScript limpia sin aserciones inseguras en DAL ni vistas |
| **Suite Automatizada de Cuadrillas (Vitest)** | 🟢 **57/57 tests pass** | 8 suites: `cuadrillasService` (18), `CuadrillaEditarModal` (8), `CuadrillasTabla` (7), `CuadrillaForm` (6), `CuadrillaDetalleDrawer` (6), `CuadrillasFiltros` (5), `useCuadrillas` (5), `NuevaCuadrillaClient` (2) |
| **Suite Global del Proyecto (Vitest)** | 🟢 **694/694 tests pass** | 115 archivos de prueba ejecutados sin fallos ni regresiones colaterales |
| **Cumplimiento Guía Visual Municipal (`GEMINI.md`)** | 🟢 **100%** | Componentes base `Heading`, `Button`, iconografía `lucide-react`, bordes rectos `radius-none: 0px`, paleta Teal/Mint/Charcoal y cero emojis |
| **Control de Acceso Perimetral (RBAC)** | 🟢 **PROTEGIDO** | Validación estricta de `recursos:leer` y despliegue de `AccesoDenegadoState` ante perfil no autorizado o HTTP 403 |
| **Estándar H34 y Sincronización en URL** | 🟢 **CUMPLIDO** | Persistencia bidireccional de parámetros en `URLSearchParams` y normalización de metadatos de paginación |

---

## 2. Registro Técnico de Defectos Detectados y Validación de Re-Test

Siguiendo las directrices institucionales de Aseguramiento de Calidad del SGRAI, los 5 defectos identificados en la auditoría inicial fueron subsanados por el desarrollador en el commit `ae7db49` y verificados exhaustivamente durante el ciclo de Re-Test del 10/11/2026:

| ID Defecto | Descripción Técnica del Defecto | Severidad | Módulo / Archivo Afectado | Fecha Detección | Estado | Commit del Fix (Sin Hash) | Fecha Re-Test | Dictamen Re-Test |
|---|---|:---:|---|:---:|:---:|---|:---:|:---:|
| `BUG-H80-WEB-01` | **Ausencia de control de acceso RBAC en `/gestion/admin/cuadrillas` y fuga de datos en fallback ante HTTP 403:** `CuadrillasAdminClient.tsx` no validaba el permiso `recursos:leer` ni los roles autorizados (`Administrador` / `Encargado`), y `cuadrillasService.obtenerCuadrillas` silenciaba respuestas `403 Forbidden` entregando datos de fallback en memoria a perfiles sin privilegios. | Crítica | `src/components/admin/cuadrillas/CuadrillasAdminClient.tsx` y `src/services/cuadrillasService.ts` | 09/11/2026 11:40 | `CORREGIDO` | fix(cuadrillas): corregir observaciones QA H80 de listado web (RBAC, fila clickeable, H34, errores y manual) | 10/11/2026 16:15 | 🟢 **CERRADO / VERIFICADO:** `cuadrillasService.obtenerCuadrillas` detecta explícitamente `status === 401` y `status === 403` lanzando `CuadrillaServiceError`. `CuadrillasAdminClient.tsx` evalúa `puedeLeer` y renderiza el componente institucional `<AccesoDenegadoState />` bloqueando el acceso indebido. |
| `BUG-H80-WEB-02` | **Filas de `CuadrillasTabla` no desplegaban el drawer lateral de dotación al hacer clic sobre la fila:** El elemento `<tr>` carecía de manejador de eventos `onClick`, obligando al usuario a presionar exclusivamente el botón secundario "Detalle" e incumpliendo el tercer criterio de aceptación (CA-3). | Alta | `src/components/admin/cuadrillas/CuadrillasTabla.tsx` | 09/11/2026 11:40 | `CORREGIDO` | fix(cuadrillas): corregir observaciones QA H80 de listado web (RBAC, fila clickeable, H34, errores y manual) | 10/11/2026 16:15 | 🟢 **CERRADO / VERIFICADO:** Se incorporó `onClick={() => onVerDetalle(cuadrilla)}` y `cursor: 'pointer'` en el elemento `<tr>`. Se agregó `e.stopPropagation()` en los botones de "Detalle" y "Editar" para prevenir eventos duplicados. Verificado en tests de tabla. |
| `BUG-H80-WEB-03` | **Discrepancia con contrato estándar H34 en metadatos de paginación y ausencia de sincronización con `URLSearchParams`:** `cuadrillasService.ts` requería estrictamente `paginasTotales` en lugar de soportar `totalPages`/`page`/`limit`, y los filtros se gestionaban en memoria sin reflejarse en la barra de direcciones del navegador. | Alta | `src/services/cuadrillasService.ts` y `src/components/admin/cuadrillas/CuadrillasAdminClient.tsx` | 09/11/2026 11:40 | `CORREGIDO` | fix(cuadrillas): corregir observaciones QA H80 de listado web (RBAC, fila clickeable, H34, errores y manual) | 10/11/2026 16:15 | 🟢 **CERRADO / VERIFICADO:** `obtenerCuadrillas` normaliza bidireccionalmente `page`/`pagina`, `limit`/`limite` y `totalPages`/`paginasTotales`. `CuadrillasAdminClient` inicializa filtros desde `searchParams` y sincroniza mediante `window.history.replaceState` preservando filtros tras F5. |
| `BUG-H80-WEB-04` | **Omisión del estado `error` y acción `recargar` en `CuadrillasAdminClient` y ausencia de botón de restablecimiento en estado vacío filtrado:** Ante fallo de red se mostraba *"No se encontraron cuadrillas operativas"* en lugar de un banner con reintento, y no existía acción para restablecer filtros cuando no había coincidencias. | Media | `src/components/admin/cuadrillas/CuadrillasAdminClient.tsx` y `src/components/admin/cuadrillas/CuadrillasTabla.tsx` | 09/11/2026 11:40 | `CORREGIDO` | fix(cuadrillas): corregir observaciones QA H80 de listado web (RBAC, fila clickeable, H34, errores y manual) | 10/11/2026 16:15 | 🟢 **CERRADO / VERIFICADO:** `CuadrillasAdminClient` expone banner de alerta con botón "Reintentar" conectado a `recargar()`. `CuadrillasTabla` recibe `tieneFiltrosActivos` y despliega el botón "Limpiar filtros" en el estado vacío. |
| `BUG-H80-WEB-05` | **Manual de usuario vaciado a 0 bytes en commit previo, ubicación fuera del estándar `/docs/manuals/` y falta de cobertura en tests unitarios:** El manual en `docs/manuales-usuario/` quedó en 0 bytes, no existía en `/docs/manuals/H80-listar-cuadrillas.md`, se había removido la aserción de `NO_DISPONIBLE` y faltaban tests para el drawer. | Media | `docs/manuals/H80-listar-cuadrillas.md`, `src/components/admin/cuadrillas/__tests__/CuadrillasTabla.test.tsx` y `src/components/admin/cuadrillas/__tests__/CuadrillaDetalleDrawer.test.tsx` | 09/11/2026 11:40 | `CORREGIDO` | fix(cuadrillas): corregir observaciones QA H80 de listado web (RBAC, fila clickeable, H34, errores y manual) | 10/11/2026 16:15 | 🟢 **CERRADO / VERIFICADO:** Manual formal creado en `docs/manuals/H80-listar-cuadrillas.md` sin emojis. Se reincorporó la prueba de badge `NO DISPONIBLE`, se añadieron 6 pruebas unitarias para `CuadrillaDetalleDrawer` y tests de clic en fila completa. |

---

## 3. Matriz Consolidada de Casos de Prueba (13 Columnas Institucionales)

| ID Caso | Título del Caso de Prueba | Tipo de Prueba | Nivel | Prioridad | Precondición | Datos de Prueba (Payload / Headers / Query) | Resultado Esperado | Resultado Obtenido | Estado | Fecha / Hora Ejecución | Fecha / Hora Re-Test | Solución / Commit |
|---|---|---|---|---|---|---|---|---|:---:|:---:|:---:|---|
| `BUG-H80-WEB-01` | Control de acceso RBAC en `/gestion/admin/cuadrillas` y bloqueo ante HTTP 403 Forbidden | Seguridad / RBAC | Vista / Servicio | Crítica | Sesión activa con rol Call Center o Asistente Social sin permiso `recursos:leer` | Navegación directa a `/gestion/admin/cuadrillas` o respuesta HTTP 403 de `GET /api/cuadrillas` | Bloqueo perimetral renderizando `AccesoDenegadoState` (HTTP 403) sin exponer registros de fallback | `AccesoDenegadoState` desplegado correctamente; servicio propaga excepción 403 sin fallback | **CORREGIDO** | 09/11/2026 11:40 | 10/11/2026 16:15 | fix(cuadrillas): corregir observaciones QA H80 de listado web (RBAC, fila clickeable, H34, errores y manual) |
| `BUG-H80-WEB-02` | Apertura del drawer lateral de dotación al hacer clic sobre cualquier fila de la tabla (CA-3) | Funcional / UI | Componente / Tabla | Alta | Tabla cargada con cuadrillas operativas en `/gestion/admin/cuadrillas` | Evento `click` sobre la fila `<tr>` de "Cuadrilla Vías y Despeje Urbano" | Se invoca `onVerDetalle(cuadrilla)` y se despliega `CuadrillaDetalleDrawer` con personal y recursos | Elemento `<tr>` interactivo con cursor pointer; clic abre drawer y botones no propagan evento | **CORREGIDO** | 09/11/2026 11:40 | 10/11/2026 16:15 | fix(cuadrillas): corregir observaciones QA H80 de listado web (RBAC, fila clickeable, H34, errores y manual) |
| `BUG-H80-WEB-03` | Normalización de contrato H34 en metadatos de paginación y sincronización en `URLSearchParams` (CA-1, CA-5) | Integración / Contrato H34 | Servicio / Vista | Alta | Backend respondiendo con `meta: { total, page, limit, totalPages }` y filtros activos en UI | Selección de `delegacionId` y `estado=DISPONIBLE` en `CuadrillasAdminClient` | Mapeo compatible de `meta` H34 y sincronización de query params (`?delegacionId=...&estado=DISPONIBLE`) en la URL | Metadatos H34 normalizados fielmente; URL sincronizada vía `window.history.replaceState` | **CORREGIDO** | 09/11/2026 11:40 | 10/11/2026 16:15 | fix(cuadrillas): corregir observaciones QA H80 de listado web (RBAC, fila clickeable, H34, errores y manual) |
| `BUG-H80-WEB-04` | Renderizado de alerta de error con reintento ante fallo de carga y acción de limpiar filtros en tabla vacía | Usabilidad / Resiliencia | Vista / Tabla | Media | Excepción en `useCuadrillas` (`error !== null`) o búsqueda sin resultados con filtros activos | Simulación de error de red o búsqueda `q="InexistenteXYZ"` | Si hay error, mostrar banner con botón `recargar()`; si es filtro sin resultados, botón "Limpiar filtros" en estado vacío | Banner de error con acción de reintento renderizado; botón Limpiar filtros funcional en tabla vacía | **CORREGIDO** | 09/11/2026 11:40 | 10/11/2026 16:15 | fix(cuadrillas): corregir observaciones QA H80 de listado web (RBAC, fila clickeable, H34, errores y manual) |
| `BUG-H80-WEB-05` | Integridad del manual de usuario en `/docs/manuals/H80-listar-cuadrillas.md` y pruebas unitarias de `NO_DISPONIBLE` y Drawer | Documentación / QA | Repositorio / Vitest | Media | Revisión de entregables en rama `feature/H80-listar-cuadrillas` | Inspección de `docs/manuals/H80-listar-cuadrillas.md` y ejecución de suites Vitest | Manual completo sin emojis en `/docs/manuals/` y tests unitarios para los 3 estados y `CuadrillaDetalleDrawer` | Manual formal en `/docs/manuals/H80-listar-cuadrillas.md`; 6 tests de Drawer y aserción de `NO_DISPONIBLE` verificados | **CORREGIDO** | 09/11/2026 11:40 | 10/11/2026 16:15 | fix(cuadrillas): corregir observaciones QA H80 de listado web (RBAC, fila clickeable, H34, errores y manual) |
| `CP-H80-WEB-01` | Renderizado de vista principal en `/gestion/admin/cuadrillas` con miga de pan y encabezado institucional (CA-1) | Funcional / UI | Vista | Alta | Usuario autenticado con rol Administrador o Encargado | Navegación a `/gestion/admin/cuadrillas` | Despliega breadcrumb institucional, título `h1` "Cuadrillas Operativas", barra de filtros, tabla y paginador | Vista renderizada con componentes `Heading` y `Button` respetando la paleta municipal | **APROBADO** | 09/11/2026 11:40 | - | feat(cuadrillas): crear hooks y componentes de tabla, filtros y modal de edicion de dotacion H81 |
| `CP-H80-WEB-02` | Visualización de columnas obligatorias en `CuadrillasTabla`: Nombre, Delegación, Delegado, Dotación y Estado (CA-2) | Funcional / UI | Componente / Tabla | Crítica | Lista de cuadrillas cargada en `CuadrillasTabla` | Renderizado con `CUADRILLAS_FALLBACK` (3 cuadrillas operativas) | Encabezados y celdas visibles: Cuadrilla Operativa, Delegación Base, Delegado Responsable, Dotación, Estado y Acciones | Las 6 columnas exhiben nombre, ID abreviado, delegación, delegado con RUT, conteo de dotación y estado | **APROBADO** | 09/11/2026 11:40 | - | feat(cuadrillas): crear hooks y componentes de tabla, filtros y modal de edicion de dotacion H81 |
| `CP-H80-WEB-03` | Renderizado de badge semántico para estado `DISPONIBLE` con colores institucionales (CA-2) | UI / Diseño | Componente / Badge | Alta | Cuadrilla con `estado: 'DISPONIBLE'` | `<BadgeEstadoCuadrilla estado="DISPONIBLE" />` | Badge rectangular con fondo `#E8F5E9`, texto `#2E7D32`, dot circular de 6px y etiqueta `DISPONIBLE` | Badge verde renderizado sin bordes redondeados en el contenedor y sin emojis | **APROBADO** | 09/11/2026 11:40 | - | feat(cuadrillas): crear hooks y componentes de tabla, filtros y modal de edicion de dotacion H81 |
| `CP-H80-WEB-04` | Renderizado de badge semántico para estado `EN_MISION` con ícono `Clock` de Lucide (CA-2) | UI / Diseño | Componente / Badge | Alta | Cuadrilla con `estado: 'EN_MISION'` | `<BadgeEstadoCuadrilla estado="EN_MISION" />` | Badge rectangular con fondo `#FFF3E0`, texto `#E65100`, ícono `Clock` y etiqueta `EN MISIÓN` | Badge naranja renderizado correctamente con tooltip descriptivo de despliegue en terreno | **APROBADO** | 09/11/2026 11:40 | - | feat(cuadrillas): crear hooks y componentes de tabla, filtros y modal de edicion de dotacion H81 |
| `CP-H80-WEB-05` | Renderizado de badge semántico para estado `NO_DISPONIBLE` en tono neutro (CA-2) | UI / Diseño | Componente / Badge | Alta | Cuadrilla con `estado: 'NO_DISPONIBLE'` | `<BadgeEstadoCuadrilla estado="NO_DISPONIBLE" />` | Badge rectangular con fondo `#F1F3F5`, texto `#5F676E`, dot gris y etiqueta `NO DISPONIBLE` | Componente renderiza la etiqueta `NO DISPONIBLE` con colores neutros institucionales | **APROBADO** | 09/11/2026 11:40 | - | fix(cuadrillas): corregir observaciones QA H80 de listado web (RBAC, fila clickeable, H34, errores y manual) |
| `CP-H80-WEB-06` | Contadores de personal y recursos vinculados en columna Dotación con pluralización correcta (CA-2) | Funcional / UI | Componente / Tabla | Alta | Cuadrillas con 0, 1 y 2 operarios/recursos | Inspección de celda Dotación en `CuadrillasTabla` | Muestra ícono `Users` con `N operario(s)` e ícono `Wrench` con `N recurso(s)` a partir de `trabajadores.length` o `totalTrabajadores` | Contadores numéricos y etiquetas singulares/plurales renderizados con exactitud | **APROBADO** | 09/11/2026 11:40 | - | feat(cuadrillas): crear hooks y componentes de tabla, filtros y modal de edicion de dotacion H81 |
| `CP-H80-WEB-07` | Apertura del `CuadrillaDetalleDrawer` mediante botón de acción "Detalle" (CA-3) | Funcional / UI | Componente / Drawer | Alta | Tabla de cuadrillas renderizada | Clic en botón `<Button>Detalle</Button>` de la primera fila | Se abre el panel lateral `CuadrillaDetalleDrawer` con atributo `role="dialog"` y título de la cuadrilla | Drawer lateral desplegado mostrando cabecera institucional, delegado, trabajadores y equipamiento | **APROBADO** | 09/11/2026 11:40 | - | feat(cuadrillas): crear hooks y componentes de tabla, filtros y modal de edicion de dotacion H81 |
| `CP-H80-WEB-08` | Visualización detallada de miembros de personal asignados en `CuadrillaDetalleDrawer` (CA-3) | Funcional / UI | Componente / Drawer | Alta | Drawer abierto para "Cuadrilla Vías y Despeje Urbano" | `trabajadores` con 2 operarios ("Pedro Obrero", "Jorge Almonacid") | Sección "Trabajadores Asignados (2)" lista nombre, cargo, especialidad y RUT de cada integrante | Tarjetas individuales de operarios renderizadas con cargo, especialidad y RUT formateado | **APROBADO** | 09/11/2026 11:40 | - | feat(cuadrillas): crear hooks y componentes de tabla, filtros y modal de edicion de dotacion H81 |
| `CP-H80-WEB-09` | Visualización detallada de equipos y vehículos vinculados (`cuadrilla_recurso`) en `CuadrillaDetalleDrawer` (CA-3) | Funcional / UI | Componente / Drawer | Alta | Drawer abierto para "Cuadrilla Vías y Despeje Urbano" | `recursos` con Camioneta 4x4 (`esIndividual: true`, cant: 1) y Motosierra (`esIndividual: false`, cant: 2) | Sección "Equipamiento y Vehículos (2)" distingue "Vehículo / Activo Individual" vs "Insumo / Herramienta" y cantidad asignada | Lista de recursos exhibe nombre, clasificación de inventario y badge de unidades asignadas | **APROBADO** | 09/11/2026 11:40 | - | feat(cuadrillas): crear hooks y componentes de tabla, filtros y modal de edicion de dotacion H81 |
| `CP-H80-WEB-10` | Mensajes informativos en `CuadrillaDetalleDrawer` cuando la cuadrilla no tiene personal o recursos asignados (CA-3) | Funcional / UX | Componente / Drawer | Media | Drawer abierto para cuadrilla con `trabajadores: []` o `recursos: []` | Selección de cuadrilla sin dotación asignada | Muestra textos en cursiva indicando ausencia de trabajadores operativos o recursos logísticos | Mensajes de dotación vacía desplegados sin errores de renderizado | **APROBADO** | 09/11/2026 11:40 | - | fix(cuadrillas): corregir observaciones QA H80 de listado web (RBAC, fila clickeable, H34, errores y manual) |
| `CP-H80-WEB-11` | Cierre del `CuadrillaDetalleDrawer` mediante tecla `Escape`, botón `X` o clic en backdrop (CA-3) | Usabilidad / A11y | Componente / Drawer | Media | `CuadrillaDetalleDrawer` abierto (`isOpen: true`) | Pulsación de tecla `Escape`, clic en botón "Cerrar" o clic en fondo oscuro | Se invoca `onCerrar` y el drawer se desmonta del DOM | Listener de teclado y botones cierran limpiamente el panel lateral | **APROBADO** | 09/11/2026 11:40 | - | fix(cuadrillas): corregir observaciones QA H80 de listado web (RBAC, fila clickeable, H34, errores y manual) |
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
BUG-H80-WEB-01	Control de acceso RBAC en /gestion/admin/cuadrillas y bloqueo ante HTTP 403 Forbidden	Seguridad / RBAC	Vista / Servicio	Crítica	Sesión activa con rol Call Center o Asistente Social sin permiso recursos:leer	Navegación directa a /gestion/admin/cuadrillas o respuesta HTTP 403 de GET /api/cuadrillas	Bloqueo perimetral renderizando AccesoDenegadoState (HTTP 403) sin exponer registros de fallback	AccesoDenegadoState desplegado correctamente; servicio propaga excepción 403 sin fallback	CORREGIDO	09/11/2026 11:40	10/11/2026 16:15	fix(cuadrillas): corregir observaciones QA H80 de listado web (RBAC, fila clickeable, H34, errores y manual)
BUG-H80-WEB-02	Apertura del drawer lateral de dotación al hacer clic sobre cualquier fila de la tabla (CA-3)	Funcional / UI	Componente / Tabla	Alta	Tabla cargada con cuadrillas operativas en /gestion/admin/cuadrillas	Evento click sobre la fila <tr> de "Cuadrilla Vías y Despeje Urbano"	Se invoca onVerDetalle(cuadrilla) y se despliega CuadrillaDetalleDrawer con personal y recursos	Elemento <tr> interactivo con cursor pointer; clic abre drawer y botones no propagan evento	CORREGIDO	09/11/2026 11:40	10/11/2026 16:15	fix(cuadrillas): corregir observaciones QA H80 de listado web (RBAC, fila clickeable, H34, errores y manual)
BUG-H80-WEB-03	Normalización de contrato H34 en metadatos de paginación y sincronización en URLSearchParams (CA-1, CA-5)	Integración / Contrato H34	Servicio / Vista	Alta	Backend respondiendo con meta: { total, page, limit, totalPages } y filtros activos en UI	Selección de delegacionId y estado=DISPONIBLE en CuadrillasAdminClient	Mapeo compatible de meta H34 y sincronización de query params (?delegacionId=...&estado=DISPONIBLE) en la URL	Metadatos H34 normalizados fielmente; URL sincronizada vía window.history.replaceState	CORREGIDO	09/11/2026 11:40	10/11/2026 16:15	fix(cuadrillas): corregir observaciones QA H80 de listado web (RBAC, fila clickeable, H34, errores y manual)
BUG-H80-WEB-04	Renderizado de alerta de error con reintento ante fallo de carga y acción de limpiar filtros en tabla vacía	Usabilidad / Resiliencia	Vista / Tabla	Media	Excepción en useCuadrillas (error !== null) o búsqueda sin resultados con filtros activos	Simulación de error de red o búsqueda q="InexistenteXYZ"	Si hay error, mostrar banner con botón recargar(); si es filtro sin resultados, botón "Limpiar filtros" en estado vacío	Banner de error con acción de reintento renderizado; botón Limpiar filtros funcional en tabla vacía	CORREGIDO	09/11/2026 11:40	10/11/2026 16:15	fix(cuadrillas): corregir observaciones QA H80 de listado web (RBAC, fila clickeable, H34, errores y manual)
BUG-H80-WEB-05	Integridad del manual de usuario en /docs/manuals/H80-listar-cuadrillas.md y pruebas unitarias de NO_DISPONIBLE y Drawer	Documentación / QA	Repositorio / Vitest	Media	Revisión de entregables en rama feature/H80-listar-cuadrillas	Inspección de docs/manuals/H80-listar-cuadrillas.md y ejecución de suites Vitest	Manual completo sin emojis en /docs/manuals/ y tests unitarios para los 3 estados y CuadrillaDetalleDrawer	Manual formal en /docs/manuals/H80-listar-cuadrillas.md; 6 tests de Drawer y aserción de NO_DISPONIBLE verificados	CORREGIDO	09/11/2026 11:40	10/11/2026 16:15	fix(cuadrillas): corregir observaciones QA H80 de listado web (RBAC, fila clickeable, H34, errores y manual)
CP-H80-WEB-01	Renderizado de vista principal en /gestion/admin/cuadrillas con miga de pan y encabezado institucional (CA-1)	Funcional / UI	Vista	Alta	Usuario autenticado con rol Administrador o Encargado	Navegación a /gestion/admin/cuadrillas	Despliega breadcrumb institucional, título h1 "Cuadrillas Operativas", barra de filtros, tabla y paginador	Vista renderizada con componentes Heading y Button respetando la paleta municipal	APROBADO	09/11/2026 11:40	-	feat(cuadrillas): crear hooks y componentes de tabla, filtros y modal de edicion de dotacion H81
CP-H80-WEB-02	Visualización de columnas obligatorias en CuadrillasTabla: Nombre, Delegación, Delegado, Dotación y Estado (CA-2)	Funcional / UI	Componente / Tabla	Crítica	Lista de cuadrillas cargada en CuadrillasTabla	Renderizado con CUADRILLAS_FALLBACK (3 cuadrillas operativas)	Encabezados y celdas visibles: Cuadrilla Operativa, Delegación Base, Delegado Responsable, Dotación, Estado y Acciones	Las 6 columnas exhiben nombre, ID abreviado, delegación, delegado con RUT, conteo de dotación y estado	APROBADO	09/11/2026 11:40	-	feat(cuadrillas): crear hooks y componentes de tabla, filtros y modal de edicion de dotacion H81
CP-H80-WEB-03	Renderizado de badge semántico para estado DISPONIBLE con colores institucionales (CA-2)	UI / Diseño	Componente / Badge	Alta	Cuadrilla con estado: 'DISPONIBLE'	<BadgeEstadoCuadrilla estado="DISPONIBLE" />	Badge rectangular con fondo #E8F5E9, texto #2E7D32, dot circular de 6px y etiqueta DISPONIBLE	Badge verde renderizado sin bordes redondeados en el contenedor y sin emojis	APROBADO	09/11/2026 11:40	-	feat(cuadrillas): crear hooks y componentes de tabla, filtros y modal de edicion de dotacion H81
CP-H80-WEB-04	Renderizado de badge semántico para estado EN_MISION con ícono Clock de Lucide (CA-2)	UI / Diseño	Componente / Badge	Alta	Cuadrilla con estado: 'EN_MISION'	<BadgeEstadoCuadrilla estado="EN_MISION" />	Badge rectangular con fondo #FFF3E0, texto #E65100, ícono Clock y etiqueta EN MISIÓN	Badge naranja renderizado correctamente con tooltip descriptivo de despliegue en terreno	APROBADO	09/11/2026 11:40	-	feat(cuadrillas): crear hooks y componentes de tabla, filtros y modal de edicion de dotacion H81
CP-H80-WEB-05	Renderizado de badge semántico para estado NO_DISPONIBLE en tono neutro (CA-2)	UI / Diseño	Componente / Badge	Alta	Cuadrilla con estado: 'NO_DISPONIBLE'	<BadgeEstadoCuadrilla estado="NO_DISPONIBLE" />	Badge rectangular con fondo #F1F3F5, texto #5F676E, dot gris y etiqueta NO DISPONIBLE	Componente renderiza la etiqueta NO DISPONIBLE con colores neutros institucionales	APROBADO	09/11/2026 11:40	-	fix(cuadrillas): corregir observaciones QA H80 de listado web (RBAC, fila clickeable, H34, errores y manual)
CP-H80-WEB-06	Contadores de personal y recursos vinculados en columna Dotación con pluralización correcta (CA-2)	Funcional / UI	Componente / Tabla	Alta	Cuadrillas con 0, 1 y 2 operarios/recursos	Inspección de celda Dotación en CuadrillasTabla	Muestra ícono Users con N operario(s) e ícono Wrench con N recurso(s) a partir de trabajadores.length o totalTrabajadores	Contadores numéricos y etiquetas singulares/plurales renderizados con exactitud	APROBADO	09/11/2026 11:40	-	feat(cuadrillas): crear hooks y componentes de tabla, filtros y modal de edicion de dotacion H81
CP-H80-WEB-07	Apertura del CuadrillaDetalleDrawer mediante botón de acción "Detalle" (CA-3)	Funcional / UI	Componente / Drawer	Alta	Tabla de cuadrillas renderizada	Clic en botón <Button>Detalle</Button> de la primera fila	Se abre el panel lateral CuadrillaDetalleDrawer con atributo role="dialog" y título de la cuadrilla	Drawer lateral desplegado mostrando cabecera institucional, delegado, trabajadores y equipamiento	APROBADO	09/11/2026 11:40	-	feat(cuadrillas): crear hooks y componentes de tabla, filtros y modal de edicion de dotacion H81
CP-H80-WEB-08	Visualización detallada de miembros de personal asignados en CuadrillaDetalleDrawer (CA-3)	Funcional / UI	Componente / Drawer	Alta	Drawer abierto para "Cuadrilla Vías y Despeje Urbano"	trabajadores con 2 operarios ("Pedro Obrero", "Jorge Almonacid")	Sección "Trabajadores Asignados (2)" lista nombre, cargo, especialidad y RUT de cada integrante	Tarjetas individuales de operarios renderizadas con cargo, especialidad y RUT formateado	APROBADO	09/11/2026 11:40	-	feat(cuadrillas): crear hooks y componentes de tabla, filtros y modal de edicion de dotacion H81
CP-H80-WEB-09	Visualización detallada de equipos y vehículos vinculados (cuadrilla_recurso) en CuadrillaDetalleDrawer (CA-3)	Funcional / UI	Componente / Drawer	Alta	Drawer abierto para "Cuadrilla Vías y Despeje Urbano"	recursos con Camioneta 4x4 (esIndividual: true, cant: 1) y Motosierra (esIndividual: false, cant: 2)	Sección "Equipamiento y Vehículos (2)" distingue "Vehículo / Activo Individual" vs "Insumo / Herramienta" y cantidad asignada	Lista de recursos exhibe nombre, clasificación de inventario y badge de unidades asignadas	APROBADO	09/11/2026 11:40	-	feat(cuadrillas): crear hooks y componentes de tabla, filtros y modal de edicion de dotacion H81
CP-H80-WEB-10	Mensajes informativos en CuadrillaDetalleDrawer cuando la cuadrilla no tiene personal o recursos asignados (CA-3)	Funcional / UX	Componente / Drawer	Media	Drawer abierto para cuadrilla con trabajadores: [] o recursos: []	Selección de cuadrilla sin dotación asignada	Muestra textos en cursiva indicando ausencia de trabajadores operativos o recursos logísticos	Mensajes de dotación vacía desplegados sin errores de renderizado	APROBADO	09/11/2026 11:40	-	fix(cuadrillas): corregir observaciones QA H80 de listado web (RBAC, fila clickeable, H34, errores y manual)
CP-H80-WEB-11	Cierre del CuadrillaDetalleDrawer mediante tecla Escape, botón X o clic en backdrop (CA-3)	Usabilidad / A11y	Componente / Drawer	Media	CuadrillaDetalleDrawer abierto (isOpen: true)	Pulsación de tecla Escape, clic en botón "Cerrar" o clic en fondo oscuro	Se invoca onCerrar y el drawer se desmonta del DOM	Listener de teclado y botones cierran limpiamente el panel lateral	APROBADO	09/11/2026 11:40	-	fix(cuadrillas): corregir observaciones QA H80 de listado web (RBAC, fila clickeable, H34, errores y manual)
CP-H80-WEB-12	Filtro por delegación municipal en CuadrillasFiltros y recarga del hook useCuadrillas (CA-4)	Funcional / Filtros	Componente / Hook	Alta	Catálogo de delegaciones cargado en selector	Selección de delegacionId = 'del-2' en <select aria-label="Filtrar por delegación municipal">	onDelegacionChange actualiza filtros.delegacionId, reinicia pagina: 1 y useCuadrillas consulta GET /api/cuadrillas?delegacionId=del-2	Prueba unitaria en CuadrillasFiltros.test.tsx y useCuadrillas.test.ts verificada exitosamente	APROBADO	09/11/2026 11:40	-	test(cuadrillas): agregar tests de CuadrillasFiltros y useCuadrillas (H80)
CP-H80-WEB-13	Filtro por estado operativo (DISPONIBLE, EN_MISION, NO_DISPONIBLE) en CuadrillasFiltros (CA-4)	Funcional / Filtros	Componente / Hook	Alta	Selector de estado operativo en barra de filtros	Selección de estado = 'EN_MISION' en <select aria-label="Filtrar por estado operativo">	onEstadoChange actualiza filtros.estado, reinicia pagina: 1 y filtra las cuadrillas en misión	Selector incluye las 3 opciones canónicas y dispara el filtrado reactivo	APROBADO	09/11/2026 11:40	-	test(cuadrillas): agregar tests de CuadrillasFiltros y useCuadrillas (H80)
CP-H80-WEB-14	Búsqueda por texto libre (nombre de cuadrilla, delegado o RUT) y limpieza individual con botón X (CA-4)	Funcional / Filtros	Componente / Input	Media	Barra CuadrillasFiltros visible	Escritura de término "Vías" en buscador y posterior clic en botón "Limpiar búsqueda"	Invoca onBusquedaChange('Vías') filtrando coincidencias y al pulsar X restablece a ''	Input controlado y botón de vaciado rápido funcionan según lo esperado	APROBADO	09/11/2026 11:40	-	test(cuadrillas): agregar tests de CuadrillasFiltros y useCuadrillas (H80)
CP-H80-WEB-15	Visibilidad condicional y acción del botón "Limpiar filtros" ante criterios activos (CA-4)	Usabilidad / Filtros	Componente / UI	Media	Al menos un filtro activo (busqueda, delegacionId o estado)	Clic en <Button>Limpiar filtros</Button>	Botón oculto sin filtros; visible al activar cualquier filtro; al hacer clic restablece todos los filtros y vuelve a página 1	Validado mediante los casos 3 y 4 de CuadrillasFiltros.test.tsx	APROBADO	09/11/2026 11:40	-	test(cuadrillas): agregar tests de CuadrillasFiltros y useCuadrillas (H80)
CP-H80-WEB-16	Consumo de GET /api/cuadrillas mediante cliente tipado apiClient.GET con query params (CA-5)	Integración / DAL	Servicio	Crítica	cuadrillasService.obtenerCuadrillas(filtros) invocado	{ pagina: 1, limite: 10, busqueda: 'Vías', delegacionId: 'del-1', estado: 'DISPONIBLE' }	Despacha GET /api/cuadrillas con query { pagina, limite, q, delegacionId, estado } y retorna { cuadrillas, meta }	Servicio construye los parámetros de consulta y desempaqueta data.data y data.meta	APROBADO	09/11/2026 11:40	-	feat(cuadrillas): definir DTOs, tipos y metodos de servicio para edicion H81
CP-H80-WEB-17	Estado de carga visual en CuadrillasTabla mientras cargando es true (CA-1)	UX / Feedback	Componente / Tabla	Media	Petición asíncrona en curso (cargando: true)	<CuadrillasTabla cuadrillas={[]} cargando={true} ... />	Renderiza contenedor blanco con ícono HardHat animado y texto "Cargando cuadrillas operativas..."	Indicador de carga visualizado sin errores de hidratación	APROBADO	09/11/2026 11:40	-	feat(cuadrillas): crear hooks y componentes de tabla, filtros y modal de edicion de dotacion H81
CP-H80-WEB-18	Visibilidad condicional de botones de creación y edición según permisos recursos:crear y recursos:editar	Seguridad / RBAC	Vista / Tabla	Alta	Sesión de Encargado (con recursos:leer, sin recursos:crear ni recursos:editar)	Renderizado de CuadrillasAdminClient y CuadrillasTabla con puedeCrear=false, puedeEditar=false	Oculta el botón "Registrar Nueva Cuadrilla" y los botones "Editar", permitiendo únicamente consultar la tabla y el drawer de detalle	Los controles de mutación se ocultan correctamente para roles de consulta táctica	APROBADO	09/11/2026 11:40	-	feat(cuadrillas): crear hooks y componentes de tabla, filtros y modal de edicion de dotacion H81
CP-H80-WEB-19	Actualización en tiempo real del listado vía WebSocket (cuadrilla:creada y cuadrilla:actualizada)	Tiempo Real / Socket.io	Hook	Media	Hook useCuadrillas montado y conectado a getSocket()	Emisión de eventos cuadrilla:actualizada y cuadrilla:creada	Actualiza el registro en memoria sin duplicar o dispara recarga del listado, limpiando listeners al desmontar	Suscripción y limpieza (socket.off) implementadas correctamente en useCuadrillas.ts	APROBADO	09/11/2026 11:40	-	test(cuadrillas): agregar tests de CuadrillasFiltros y useCuadrillas (H80)
CP-H80-WEB-20	Verificación de tipos TypeScript (tsc --noEmit) y linter (eslint) en el módulo de cuadrillas	Calidad / CI	Estático	Alta	Repositorio en rama feature/H80-listar-cuadrillas	Ejecución de npx tsc --noEmit y npm run lint	0 errores de compilación TypeScript y 0 errores de ESLint	Ambos comandos finalizan con código de salida 0	APROBADO	09/11/2026 11:40	-	test(cuadrillas): agregar tests de CuadrillasFiltros y useCuadrillas (H80)
```

---

## 5. Guía de Ejecución y Replicabilidad 100% Paso a Paso (Evidencias de Re-Test)

### 5.1 Verificación Automatizada de Linter (`npm run lint`)
**Comando:**
```bash
npm run lint
```
**Resultado Obtenido en Re-Test:**
```text
npm notice run sgrai-web@0.7.0 lint
npm notice run eslint

✖ 10 problems (0 errors, 10 warnings)
```
*Dictamen QA:* **0 errores bloqueantes**. Pipeline de ESLint aprobado sin observaciones en cuadrillas.

---

### 5.2 Suite Automatizada de Pruebas Unitarias del Módulo de Cuadrillas (Vitest)
**Comando:**
```bash
npm test -- src/components/admin/cuadrillas/__tests__/ src/hooks/__tests__/useCuadrillas.test.ts src/services/__tests__/cuadrillasService.test.ts
```
**Resultado Obtenido en Re-Test:**
```text
 RUN  v3.2.7 /home/ds2fery/Documentos/Proyecto/sgrai-uach/web

 ✓ src/services/__tests__/cuadrillasService.test.ts (18 tests) 111ms
 ✓ src/hooks/__tests__/useCuadrillas.test.ts (5 tests) 377ms
 ✓ src/components/admin/cuadrillas/__tests__/CuadrillasFiltros.test.tsx (5 tests) 346ms
 ✓ src/components/admin/cuadrillas/__tests__/NuevaCuadrillaClient.test.tsx (2 tests) 398ms
 ✓ src/components/admin/cuadrillas/__tests__/CuadrillaDetalleDrawer.test.tsx (6 tests) 734ms
 ✓ src/components/admin/cuadrillas/__tests__/CuadrillasTabla.test.tsx (7 tests) 812ms
 ✓ src/components/admin/cuadrillas/__tests__/CuadrillaForm.test.tsx (6 tests) 1043ms
 ✓ src/components/admin/cuadrillas/__tests__/CuadrillaEditarModal.test.tsx (8 tests) 1258ms

 Test Files  8 passed (8)
      Tests  57 passed (57)
   Duration  4.72s
```

*Detalle de pruebas específicas añadidas y certificadas para los defectos:*
* `BUG-H80-WEB-01`:
  * `cuadrillasService > debe propagar 403 Forbidden sin exponer datos de fallback` — **PASSED**
  * `cuadrillasService > debe propagar 401 Unauthorized sin exponer datos de fallback` — **PASSED**
  * `useCuadrillas hook > caso 5: expone errorStatus cuando el servicio rechaza por permisos (403)` — **PASSED**
* `BUG-H80-WEB-02`:
  * `CuadrillasTabla > debe abrir el drawer al hacer clic sobre la fila completa (CA-3)` — **PASSED**
  * `CuadrillasTabla > no debe propagar el clic de los botones de acción hacia la fila` — **PASSED**
* `BUG-H80-WEB-03`:
  * `cuadrillasService > debe normalizar metadatos H34 (page/limit/totalPages) al contrato interno` — **PASSED**
* `BUG-H80-WEB-04`:
  * `CuadrillasTabla > debe mostrar el botón Limpiar filtros en el estado vacío con filtros activos` — **PASSED**
* `BUG-H80-WEB-05`:
  * `CuadrillasTabla > debe renderizar el badge NO DISPONIBLE con etiqueta neutra` — **PASSED**
  * `CuadrillaDetalleDrawer > no debe renderizarse cuando está cerrado o sin cuadrilla` — **PASSED**
  * `CuadrillaDetalleDrawer > debe mostrar delegado, trabajadores y recursos asignados` — **PASSED**
  * `CuadrillaDetalleDrawer > debe mostrar mensajes informativos cuando no hay dotación asignada` — **PASSED**
  * `CuadrillaDetalleDrawer > debe cerrarse con la tecla Escape y con el botón Cerrar` — **PASSED**
  * `CuadrillaDetalleDrawer > debe bloquear la edición cuando la cuadrilla está en misión` — **PASSED**
  * `CuadrillaDetalleDrawer > debe invocar onEditar para cuadrillas disponibles` — **PASSED**

---

### 5.3 Suite Global de Pruebas Unitarias del Proyecto (Vitest)
**Comando:**
```bash
npm test
```
**Resultado Obtenido en Re-Test:**
```text
 Test Files  115 passed (115)
      Tests  694 passed (694)
   Start at  16:14:47
   Duration  26.16s
```
*Dictamen QA:* **694/694 tests exitosos sin regresiones**.

---

### 5.4 Verificación de Tipos Estáticos (`npx tsc --noEmit`)
**Comando:**
```bash
npx tsc --noEmit
```
**Resultado Obtenido en Re-Test:**
```text
Exit code: 0 (0 errores de compilación TypeScript)
```

---

### 5.5 Pruebas de Integración con cURL al Endpoint de Cuadrillas (`GET /api/cuadrillas`)

#### Escenario A: Consulta Paginada con Filtros Territorial y Operativo (CA-4, CA-5) — HTTP 200 OK
```bash
curl -i -X GET "http://localhost:3001/api/cuadrillas?pagina=1&limite=10&delegacionId=30000000-0000-4000-8000-000000000001&estado=DISPONIBLE" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer <TOKEN_ADMIN>"
```

**Respuesta HTTP del Backend (`200 OK`):**
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

---

#### Escenario B: Petición sin Permiso RBAC `recursos:leer` (Verificación de `BUG-H80-WEB-01`) — HTTP 403 Forbidden
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

*Comportamiento Frontend Validado en Re-Test:* En `cuadrillasService.ts` se captura el código 403 y se propaga `CuadrillaServiceError(status=403, codigo='PERMISOS_INSUFICIENTES')`. `useCuadrillas` asigna `errorStatus = 403` y `CuadrillasAdminClient.tsx` renderiza el componente institucional `<AccesoDenegadoState rolUsuario={usuarioActivo.rol} modulo="el Listado de Cuadrillas Operativas" permisoRequerido="recursos:leer" />`, bloqueando completamente la visualización de datos y protegiendo el fallback local.

---

## 6. Matriz de Trazabilidad frente a Criterios de Aceptación (CA)

| Criterio de Aceptación (CA) | Estado QA | Detalle y Cobertura Técnica Post Re-Test |
|---|:---:|---|
| **CA-1:** El sistema debe proveer una vista tabular en `/gestion/admin/cuadrillas` bajo estándar de contratos H34. | 🟢 **CUMPLIDO** | Vista operativa con miga de pan institucional, cabecera formal, tabla con estado de carga `HardHat`, paginación sincronizada, banner de reintento ante errores de red (`BUG-H80-WEB-04`), compatibilidad defensiva con metadatos de paginación H34 (`BUG-H80-WEB-03`) y protección perimetral RBAC (`BUG-H80-WEB-01`). |
| **CA-2:** La tabla debe mostrar: Nombre de la cuadrilla, Delegación base, Delegado responsable, Estado actual (`DISPONIBLE`, `EN_MISION`, `NO_DISPONIBLE`) y contador de personal/recursos vinculados. | 🟢 **CUMPLIDO** | Despliegue de 6 columnas normalizadas con ID abreviado, delegación territorial, delegado con RUT, contadores de operarios y recursos vinculados con pluralización exacta y badges semánticos rectos (`DISPONIBLE`, `EN_MISION`, `NO_DISPONIBLE`) testeados unitariamente (`BUG-H80-WEB-05`). |
| **CA-3:** Al hacer clic sobre una fila, se debe desplegar un drawer lateral con el detalle de miembros de personal asignados y equipos/vehículos vinculados (`cuadrilla_recurso`). | 🟢 **CUMPLIDO** | La fila `<tr>` completa cuenta con cursor `pointer` y manejador interactivo `onClick` (`BUG-H80-WEB-02`), manteniendo detención de propagación en botones. `CuadrillaDetalleDrawer` exhibe datos de líder, operarios (`cuadrilla_personal`), maquinarias/vehículos (`cuadrilla_recurso`), metadatos de auditoría y cierre por tecla `Escape`, cubierto por 6 pruebas unitarias (`BUG-H80-WEB-05`). |
| **CA-4:** Debe permitir filtrar por delegación municipal y estado operativo. | 🟢 **CUMPLIDO** | Selector de delegaciones municipales activas, selector de estados canónicos (`DISPONIBLE`, `EN_MISION`, `NO_DISPONIBLE`), buscador de texto libre y botón de limpieza automática visible ante filtros activos y en estado vacío de tabla (`BUG-H80-WEB-04`). Sincronización fluida con `URLSearchParams` (`BUG-H80-WEB-03`). |
| **CA-5:** El endpoint `GET /api/cuadrillas` debe responder bajo estándar H34. | 🟢 **CUMPLIDO** | Cliente tipado en `cuadrillasService.obtenerCuadrillas` consume el endpoint con paginación y filtros, normaliza estructuras `meta` H34 (`totalPages`/`paginasTotales`, `page`/`pagina`, `limit`/`limite`) y propaga excepciones 401/403 sin fallbacks espurios (`BUG-H80-WEB-01`, `BUG-H80-WEB-03`). |

---

## 7. Dictamen Final de QA y Certificación para Merge

El Pull Request y la implementación de la historia **HU-80 (Visualizar Listado de Cuadrillas Operativas, Disponibilidad y Dotación)** en la rama `feature/H80-listar-cuadrillas` han sido **APROBADOS Y CERTIFICADOS POR QA (`Sign-Off Approved`)**.

### Resumen de Cumplimiento Técnico:
1. **Defectos Subsanados:** 5/5 defectos (`BUG-H80-WEB-01` a `BUG-H80-WEB-05`) corregidos, probados y certificados en Re-Test.
2. **Pruebas Automatizadas:** 57 tests unitarios de cuadrillas pasando; 694 tests globales de `sgrai-web` aprobados sin fallos ni regresiones.
3. **Análisis Estático:** `npm run lint` finaliza con 0 errores.
4. **Tipado Estático:** `npx tsc --noEmit` finaliza con 0 errores.
5. **Seguridad RBAC:** Control de acceso institucional verificado ante usuarios no facultados y respuestas HTTP 403.
6. **Interacción y Usabilidad:** Clic en fila completa con drawer lateral y sincronización bidireccional de filtros en URL.
7. **Documentación:** Manual de usuario formal incorporado en `/docs/manuals/H80-listar-cuadrillas.md`.

**Recomendación de QA:** Se autoriza la aprobación formal del Pull Request (Pair Review / PO Review) y el posterior merge a la rama principal `develop`.
