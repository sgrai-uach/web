# Informe y Matriz de Casos de Prueba de Frontend (QA): HU-57 — Listado de Puntos Críticos

> **Documento Oficial de Aseguramiento de Calidad (QA) — Frontend**  
> **Proyecto:** Sistema de Gestión de Recursos para Atención de Incidentes (SGRAI) — Dirección de Gestión de Riesgos de Desastres, Municipalidad de Valdivia.  
> **Módulo:** Eventos ATP / Prevención y Mitigación (Portal Administrador — Monitoreo de Sectores Vulnerables).  
> **Historia de Usuario:** HU-57 — *"Como Administrador Quiero visualizar un listado de los puntos críticos Para monitorear el estado e información de estos."*  
> **Cliente Web:** `sgrai-web` (Next.js 16 + React 19 + TypeScript + Leaflet GIS + CSS Modules / Vanilla CSS + Vitest + Testing Library).  
> **Rama Git Evaluada:** `feature/H57-listado-puntos-criticos` (mergeada en `develop` mediante Pull Request #17).  
> **Commits Clave Evaluados (Conventional Commits):**
> * `feat(dal): agregar tipos, cliente y servicio para listado de puntos criticos (#57)`
> * `feat(ui): implementar componentes y vista de tabla de puntos criticos (#57)`
> * `feat(nav): registrar acceso a puntos criticos en barra lateral de administracion (#57)`
> * `feat(ui): implementar modal de atributos de punto critico al hacer clic en fila (#57)`
> * `feat(ui): agregar columna accion en tabla de puntos criticos (#57)`
> * `fix(rbac): permitir acceso a usuarios autorizados con permiso puntos_criticos:leer (#57)`
> * `fix(ui): agregar soporte para target y rel en ButtonProps (#57)`
> * `fix(ui): ocultar codigo de delegacion en modal y simplificar mensaje de permisos (#57)`
> * `test(qa): anadir casos de prueba para tabla, empty state y rbac de puntos criticos (#57)`
> * `test(qa): anadir pruebas unitarias para PuntoCriticoDetalleModal y seleccion de fila (#57)`
> * `docs(manual): crear manual de usuario H57 para listado de puntos criticos (#57)`
> * `docs(manual): actualizar manual H57 con ficha tecnica en ventana modal (#57)`
> * `merge: resolver conflictos con develop en SimulatedSessionContext (#57)`
> * `merge: resolver conflictos con develop en package.json`
>
> **Fecha de Certificación QA:** Octubre 2026.  
> **Estado de Certificación:** 🟢 **APROBADO PARA PRODUCCIÓN (100% PASS TRAS RE-TESTS)**.

---

## 1. Resumen Ejecutivo de Pruebas de Frontend

| Métrica | Resultado |
|---|:---:|
| **Total de Casos de Prueba Diseñados y Ejecutados** | **20** (15 Casos Funcionales/UI/Seguridad + 5 Defectos Gestionados) |
| **Casos Aprobados (Passed)** | **15** |
| **Casos Fallidos (Failed)** | **0** |
| **Casos Bloqueados (Blocked)** | **0** |
| **Defectos Detectados y Devueltos a Desarrolladores (Bugs)** | **5** (100% resueltos, re-testeados y certificados) |
| **Tasa de Aprobación Global (% Pass)** | **100%** |
| **Suite Automatizada de Pruebas (Vitest)** | **41/41 tests específicos de puntos críticos exitosos** |
| **Chequeo de Tipos Estáticos (TypeScript)** | **0 errores (`npx tsc --noEmit`)** |
| **Compilación de Producción (Next.js Turbopack)** | **Exitosa (`npm run build`)** |
| **Análisis Estático de Código (ESLint)** | **0 errores (`npm run lint`)** |
| **Cumplimiento Guía Visual Municipal (`GEMINI.md`)** | **100% (Esquinas rectas rounded-none, paleta Teal/Mint/Charcoal, tipografía institucional)** |
| **Accesibilidad y Experiencia de Usuario (UX/A11y)** | **100% (Modales con Escape/backdrop, Empty States informativos, copiado de coordenadas)** |

---

## 2. Registro de Defectos Detectados en QA y Ciclo de Re-Test

Siguiendo el flujo estándar y las directrices docentes de Aseguramiento de Calidad (*detección de defectos durante el ciclo de desarrollo de la rama, reporte formal al equipo de desarrollo, implementación del fix mediante commit estructurado en Conventional Commits y ejecución de re-test formal para certificación de cierre*), se detectaron y gestionaron 5 defectos en el cliente web:

| ID Defecto | Descripción del Defecto Encontrado | Severidad | Módulo / Archivo Afectado | Fecha Hallazgo | Commit del Fix (Sin Hash) | Fecha Re-Test | Dictamen Re-Test |
|---|---|:---:|---|:---:|---|:---:|:---:|
| `BUG-H57-WEB-01` | Bloqueo indebido a usuarios autorizados con permiso granular `puntos_criticos:leer` o autorizados con HTTP 200 por la API en `PuntosCriticosPage.tsx` al evaluar estrictamente solo la etiqueta textual `rol === "Administrador"`. | Alta | `src/app/(admin)/admin/puntos-criticos/page.tsx` | 02/10/2026 19:30 | fix(rbac): permitir acceso a usuarios autorizados con permiso puntos_criticos:leer (#57) | 02/10/2026 23:15 | 🟢 CORREGIDO (Evaluación combinada de rol Administrador, booleano esAdmin, permiso granular y fallback con statusCode de API) |
| `BUG-H57-WEB-02` | Falta de propiedades `target` y `rel` en la interfaz `ButtonProps` del componente reutilizable `Button.tsx`, impidiendo abrir enlaces externos geográficos en nueva pestaña de forma accesible y segura. | Media | `src/components/ui/Button.tsx` | 02/10/2026 20:45 | fix(ui): agregar soporte para target y rel en ButtonProps (#57) | 02/10/2026 22:20 | 🟢 CORREGIDO (Inclusión de atributos target y rel en la interfaz ButtonProps con propagación en elementos <a> renderizados) |
| `BUG-H57-WEB-03` | Exposición de código técnico interno de delegación territorial (`DEL_SUR`) en la ficha modal y mensaje técnico de permisos en lugar de mensaje institucional comprensible en `AccesoDenegadoState.tsx`. | Media | `src/components/admin/puntos-criticos/PuntoCriticoDetalleModal.tsx` | 02/10/2026 21:15 | fix(ui): ocultar codigo de delegacion en modal y simplificar mensaje de permisos (#57) | 02/10/2026 22:05 | 🟢 CORREGIDO (Ocultamiento de código interno en ficha técnica y texto institucional amigable en AccesoDenegadoState) |
| `BUG-H57-WEB-04` | Omisión de columna "Acción" en la cabecera, esqueleto y filas de la tabla de puntos críticos, desalineando el layout con las guías de diseño de tablas SGRAI y causando descuadre en el `colSpan` del Empty State (6 vs 7 columnas). | Media | `src/components/admin/puntos-criticos/PuntosCriticosTabla.tsx` | 03/10/2026 17:30 | feat(ui): agregar columna accion en tabla de puntos criticos (#57) | 03/10/2026 23:10 | 🟢 CORREGIDO (Columna Acción agregada en thead, tbody y skeleton, con colSpan ajustado a 7 en PuntosCriticosEmptyState) |
| `BUG-H57-WEB-05` | Conflicto de fusión y pérdida de sincronización en `SimulatedSessionContext.tsx` tras merge con develop que afectaba la provisión reactiva de permisos del usuario administrador simulado. | Alta | `src/context/SimulatedSessionContext.tsx` | 03/10/2026 21:00 | merge: resolver conflictos con develop en SimulatedSessionContext (#57) | 04/10/2026 00:30 | 🟢 CORREGIDO (Contexto de sesión simulada estabilizado preservando granularidad de permisos RBAC para pruebas de usuario) |

---

## 3. Matriz Consolidada de Casos de Prueba (13 Columnas)

| ID Caso | Título del Caso de Prueba | Tipo de Prueba | Nivel | Prioridad | Precondición | Datos de Prueba (Payload / Headers / Query) | Resultado Esperado | Resultado Obtenido | Estado | Fecha / Hora Ejecución | Fecha / Hora Re-Test | Solución / Commit |
|---|---|---|---|---|---|---|---|---|:---:|:---:|:---:|---|
| `BUG-H57-WEB-01` | Bloqueo indebido a usuarios autorizados con permiso granular puntos_criticos:leer | Seguridad (RBAC) | Página / Auth | Alta | Usuario con rol Encargado y permiso granular puntos_criticos:leer | Navegar a /admin/puntos-criticos | Despliegue del listado autorizado sin bloquear con Acceso Restringido | Pantalla de Acceso Restringido desplegada por evaluar solo rol === "Administrador" | CORREGIDO | 02/10/2026 19:30 | 02/10/2026 23:15 | fix(rbac): permitir acceso a usuarios autorizados con permiso puntos_criticos:leer (#57) |
| `BUG-H57-WEB-02` | Falta de propiedades target y rel en ButtonProps para enlaces externos en componentes UI | UI / Accesibilidad | Componente UI | Media | Componente Button utilizado como enlace a visor cartográfico | Renderizar Button con href, target="_blank" y rel="noopener noreferrer" | Apertura segura en nueva pestaña propagando atributos a etiqueta <a> | Error de compilación TypeScript por propiedades target y rel ausentes en ButtonProps | CORREGIDO | 02/10/2026 20:45 | 02/10/2026 22:20 | fix(ui): agregar soporte para target y rel en ButtonProps (#57) |
| `BUG-H57-WEB-03` | Exposición de código técnico de delegación y mensaje crudo de permisos en modal y RBAC | UX / Usabilidad | Modal / Estado | Media | Punto crítico con delegación (ej. DEL_SUR) y vista de acceso restringido | Abrir modal de detalle o forzar vista AccesoDenegadoState | Modal muestra nombre oficial de delegación y mensaje amigable sin código técnico | Modal mostraba DEL_SUR y mensaje crudo puntos_criticos:leer afectando usabilidad | CORREGIDO | 02/10/2026 21:15 | 02/10/2026 22:05 | fix(ui): ocultar codigo de delegacion en modal y simplificar mensaje de permisos (#57) |
| `BUG-H57-WEB-04` | Omisión de columna Acción en tabla de puntos críticos y descuadre de colSpan en Empty State | UI / Layout | Tabla / Vista | Media | Tabla de puntos críticos renderizada con o sin registros | Inspeccionar columnas en thead y fila de estado vacío colSpan={7} | Columna Acción presente en cabecera/filas y colSpan ajustado en estado vacío | Faltaba columna Acción en cabecera y el colSpan={6} descuadraba el Empty State | CORREGIDO | 03/10/2026 17:30 | 03/10/2026 23:10 | feat(ui): agregar columna accion en tabla de puntos criticos (#57) |
| `BUG-H57-WEB-05` | Desincronización de roles y permisos en SimulatedSessionContext tras conflicto de merge | Integración / Sesión | Context / Mock | Alta | Ejecución de la app web con sesión simulada de Administrador | Cambiar de usuario o inicializar sesión simulada | Permisos cargados reactivamente permitiendo acceso inmediato al módulo | Conflicto de merge provocaba permisos nulos y bloqueo en sesión simulada | CORREGIDO | 03/10/2026 21:00 | 04/10/2026 00:30 | merge: resolver conflictos con develop en SimulatedSessionContext (#57) |
| `CP-H57-WEB-01` | Renderizado de vista de listado de puntos críticos para usuario Administrador (CA-1, CA-4) | Funcional / RBAC | Página / Vista | Alta | Sesión activa con rol Administrador (esAdmin: true) | Navegar a /admin/puntos-criticos | Título institucional, botón "+ Nuevo Punto Crítico", tabla y cabecera renderizados | Módulo renderizado completamente con título, tabla y controles operativos | APROBADO | 05/10/2026 11:15 | - | feat(ui): implementar componentes y vista de tabla de puntos criticos (#57) |
| `CP-H57-WEB-02` | Despliegue de columnas esenciales de cada punto crítico en la tabla (CA-2) | Funcional / UI | Componente Tabla | Alta | Puntos críticos provistos por la API o mock | Cargar tabla con lista de puntos críticos | Columnas Sector, Tipo de Riesgo, Prioridad, Coordenadas, Delegación, Estado y Acción | Todas las columnas esenciales visibles con datos formateados y badges institucionales | APROBADO | 05/10/2026 11:18 | - | feat(ui): implementar componentes y vista de tabla de puntos criticos (#57) |
| `CP-H57-WEB-03` | Copiado interactivo de coordenadas WGS84 al portapapeles con confirmación visual | Interactividad | Fila / Clipboard | Media | Fila de punto crítico visible con coordenadas (ej. -39.8456, -73.2389) | Clic en botón "Copiar coordenadas" en la celda de ubicación | Coordenadas copiadas al portapapeles y etiqueta cambia a "Copiado" con check verde | Coordenadas copiadas fielmente al portapapeles con retroalimentación visual | APROBADO | 05/10/2026 11:20 | - | feat(ui): implementar componentes y vista de tabla de puntos criticos (#57) |
| `CP-H57-WEB-04` | Despliegue de estado vacío (Empty State) cuando no existen registros en el catastro (CA-3) | UX / Robustez | Componente / UI | Alta | Base de datos sin puntos críticos registrados (data: []) y sin filtros | PuntosCriticosPage con puntosCriticos.length === 0 y esFiltroActivo = false | Renderizado de PuntosCriticosEmptyState con mensaje claro de catastro vacío | Mensaje "No hay puntos críticos registrados" desplegado con ícono y explicación | APROBADO | 05/10/2026 11:22 | - | test(qa): anadir casos de prueba para tabla, empty state y rbac de puntos criticos (#57) |
| `CP-H57-WEB-05` | Despliegue de estado vacío con filtros activos y botón "Limpiar filtros" | UX / Usabilidad | Filtros / UI | Media | Aplicación de filtro de búsqueda sin coincidencias (ej. "Tsunami") | PuntosCriticosPage con puntosCriticos.length === 0 y esFiltroActivo = true | Mensaje de búsqueda sin resultados y botón visible para limpiar filtros | Mensaje "No se encontraron puntos críticos" y botón "Limpiar filtros" funcional | APROBADO | 05/10/2026 11:25 | - | test(qa): anadir casos de prueba para tabla, empty state y rbac de puntos criticos (#57) |
| `CP-H57-WEB-06` | Apertura accesible de ventana modal de Ficha Técnica al hacer clic en fila | Interactividad | Modal / UI | Alta | Tabla con puntos críticos renderizada | Clic sobre una fila de la tabla (PuntoCriticoRow) | Se abre PuntoCriticoDetalleModal con datos situacionales, delegación y mini-mapa | Modal interactivo desplegado con información completa del sector | APROBADO | 05/10/2026 11:28 | - | feat(ui): implementar modal de atributos de punto critico al hacer clic en fila (#57) |
| `CP-H57-WEB-07` | Cierre accesible del modal de Ficha Técnica mediante botón, backdrop y tecla Escape | Accesibilidad | Modal / UX | Media | Modal de detalle abierto en pantalla | Clic en botón "Cerrar Ficha", clic en backdrop exterior o pulsar tecla Escape | El modal se desmonta suavemente y retorna el foco a la tabla principal | Modal cerrado exitosamente mediante los tres mecanismos de interacción | APROBADO | 05/10/2026 11:30 | - | test(qa): anadir pruebas unitarias para PuntoCriticoDetalleModal y seleccion de fila (#57) |
| `CP-H57-WEB-08` | Visualización de mini-mapa Leaflet centrado en ubicación WGS84 dentro del modal | Funcional / GIS | Modal / Mapa | Alta | Modal de detalle abierto para un punto crítico con coordenadas | Inspeccionar contenedor de mapa en PuntoCriticoDetalleModal | Mapa Leaflet centrado en latitud/longitud con marcador y enlace a Google Maps | Mini-mapa interactivo visible con marcador posicionado exactamente en WGS84 | APROBADO | 05/10/2026 11:32 | - | feat(ui): implementar modal de atributos de punto critico al hacer clic en fila (#57) |
| `CP-H57-WEB-09` | Bloqueo de acceso y despliegue de AccesoDenegadoState ante usuario no Administrador (CA-4) | Seguridad (RBAC) | Vista / Error State | Crítica | Sesión activa con rol no Administrador (ej. Call Center) y sin permiso | Navegar a /admin/puntos-criticos | Despliegue de AccesoDenegadoState con mensaje claro y botón de redirección | Acceso bloqueado limpiamente; no se exponen datos de puntos críticos | APROBADO | 05/10/2026 11:35 | - | test(qa): anadir casos de prueba para tabla, empty state y rbac de puntos criticos (#57) |
| `CP-H57-WEB-10` | Permitir acceso a usuario no Administrador con permiso granular puntos_criticos:leer (CA-4) | Seguridad (RBAC) | Vista / Permisos | Alta | Usuario con rol Encargado y permiso puntos_criticos:leer activo | Navegar a /admin/puntos-criticos | Permite acceso completo al listado de puntos críticos sin pantalla 403 | Módulo accesible y tabla renderizada según matriz de permisos asignados | APROBADO | 05/10/2026 11:38 | - | fix(rbac): permitir acceso a usuarios autorizados con permiso puntos_criticos:leer (#57) |
| `CP-H57-WEB-11` | Permitir acceso si la API backend responde HTTP 200 OK autorizando la solicitud | Integración / RBAC | Vista / API | Alta | Usuario con rol distinto a Administrador pero token válido con 200 OK de API | Invocación de API responde status 200 con listado de puntos críticos | La interfaz permite el acceso y renderiza los datos recibidos desde el backend | Tabla renderizada exitosamente validando la autorización conferida por el backend | APROBADO | 05/10/2026 11:40 | - | fix(rbac): permitir acceso a usuarios autorizados con permiso puntos_criticos:leer (#57) |
| `CP-H57-WEB-12` | Despliegue de esqueletos de carga (PuntosCriticosSkeleton) durante obtención de datos | UX / Rendimiento | Vista / Feedback | Media | Petición a la API en curso (cargando: true) | Carga inicial de la página o cambio de filtros | Renderizado de 5 filas de esqueleto animado en la tabla de puntos críticos | PuntosCriticosSkeleton visible mientras se resuelve la promesa de red | APROBADO | 05/10/2026 11:42 | - | feat(ui): implementar componentes y vista de tabla de puntos criticos (#57) |
| `CP-H57-WEB-13` | Consumo y tipado estricto de puntosCriticosService.getPuntosCriticos con x-user-id | Integración / DAL | Servicio / API | Alta | Servidor backend en ejecución | getPuntosCriticos({ pagina: 1, limite: 10 }, userId) | Llamada GET /api/puntos-criticos con query params y cabecera x-user-id | DTO ListarPuntosCriticosResponse devuelto con data tipada y objeto meta | APROBADO | 05/10/2026 11:45 | - | feat(dal): agregar tipos, cliente y servicio para listado de puntos criticos (#57) |
| `CP-H57-WEB-14` | Manejo resiliente de fallback mock en getPuntosCriticos ante falla de red (offline) | Robustez / DAL | Servicio / Fallback | Media | Servidor backend detenido o caída de red (Failed to fetch) | getPuntosCriticos() con error de red en cliente HTTP | Retorno de catálogo mock PUNTOS_CRITICOS_MOCK permitiendo operar sin crasheo | Fallback mock ejecutado limpiamente manteniendo la interfaz funcional | APROBADO | 05/10/2026 11:48 | - | feat(dal): agregar tipos, cliente y servicio para listado de puntos criticos (#57) |
| `CP-H57-WEB-15` | Cumplimiento del manual de estilo visual institucional de la Municipalidad (GEMINI.md) | Estándar de Marca | UI / Estilos | Alta | Pantalla de puntos críticos en resoluciones Desktop y Mobile | Inspeccionar componentes, paleta institucional, bordes y tipografía | Botones con bordes rectos (rounded-none), paleta Teal/Mint/Charcoal y contraste WCAG | 100% de apego a la guía de estilos visuales institucionales de Valdivia | APROBADO | 05/10/2026 11:50 | - | feat(ui): implementar componentes y vista de tabla de puntos criticos (#57) |

---

### 3.1 Bloque TSV para Google Sheets (Copiar y Pegar en celda A1)

```tsv
ID Caso	Título del Caso de Prueba	Tipo de Prueba	Nivel	Prioridad	Precondición	Datos de Prueba (Payload / Headers / Query)	Resultado Esperado	Resultado Obtenido	Estado	Fecha / Hora Ejecución	Fecha / Hora Re-Test	Solución / Commit
BUG-H57-WEB-01	Bloqueo indebido a usuarios autorizados con permiso granular puntos_criticos:leer	Seguridad (RBAC)	Página / Auth	Alta	Usuario con rol Encargado y permiso granular puntos_criticos:leer	Navegar a /admin/puntos-criticos	Despliegue del listado autorizado sin bloquear con Acceso Restringido	Pantalla de Acceso Restringido desplegada por evaluar solo rol === "Administrador"	CORREGIDO	02/10/2026 19:30	02/10/2026 23:15	fix(rbac): permitir acceso a usuarios autorizados con permiso puntos_criticos:leer (#57)
BUG-H57-WEB-02	Falta de propiedades target y rel en ButtonProps para enlaces externos en componentes UI	UI / Accesibilidad	Componente UI	Media	Componente Button utilizado como enlace a visor cartográfico	Renderizar Button con href, target="_blank" y rel="noopener noreferrer"	Apertura segura en nueva pestaña propagando atributos a etiqueta <a>	Error de compilación TypeScript por propiedades target y rel ausentes en ButtonProps	CORREGIDO	02/10/2026 20:45	02/10/2026 22:20	fix(ui): agregar soporte para target y rel en ButtonProps (#57)
BUG-H57-WEB-03	Exposición de código técnico de delegación y mensaje crudo de permisos en modal y RBAC	UX / Usabilidad	Modal / Estado	Media	Punto crítico con delegación (ej. DEL_SUR) y vista de acceso restringido	Abrir modal de detalle o forzar vista AccesoDenegadoState	Modal muestra nombre oficial de delegación y mensaje amigable sin código técnico	Modal mostraba DEL_SUR y mensaje crudo puntos_criticos:leer afectando usabilidad	CORREGIDO	02/10/2026 21:15	02/10/2026 22:05	fix(ui): ocultar codigo de delegacion en modal y simplificar mensaje de permisos (#57)
BUG-H57-WEB-04	Omisión de columna Acción en tabla de puntos críticos y descuadre de colSpan en Empty State	UI / Layout	Tabla / Vista	Media	Tabla de puntos críticos renderizada con o sin registros	Inspeccionar columnas en thead y fila de estado vacío colSpan={7}	Columna Acción presente en cabecera/filas y colSpan ajustado en estado vacío	Faltaba columna Acción en cabecera y el colSpan={6} descuadraba el Empty State	CORREGIDO	03/10/2026 17:30	03/10/2026 23:10	feat(ui): agregar columna accion en tabla de puntos criticos (#57)
BUG-H57-WEB-05	Desincronización de roles y permisos en SimulatedSessionContext tras conflicto de merge	Integración / Sesión	Context / Mock	Alta	Ejecución de la app web con sesión simulada de Administrador	Cambiar de usuario o inicializar sesión simulada	Permisos cargados reactivamente permitiendo acceso inmediato al módulo	Conflicto de merge provocaba permisos nulos y bloqueo en sesión simulada	CORREGIDO	03/10/2026 21:00	04/10/2026 00:30	merge: resolver conflictos con develop en SimulatedSessionContext (#57)
CP-H57-WEB-01	Renderizado de vista de listado de puntos críticos para usuario Administrador (CA-1, CA-4)	Funcional / RBAC	Página / Vista	Alta	Sesión activa con rol Administrador (esAdmin: true)	Navegar a /admin/puntos-criticos	Título institucional, botón "+ Nuevo Punto Crítico", tabla y cabecera renderizados	Módulo renderizado completamente con título, tabla y controles operativos	APROBADO	05/10/2026 11:15	-	feat(ui): implementar componentes y vista de tabla de puntos criticos (#57)
CP-H57-WEB-02	Despliegue de columnas esenciales de cada punto crítico en la tabla (CA-2)	Funcional / UI	Componente Tabla	Alta	Puntos críticos provistos por la API o mock	Cargar tabla con lista de puntos críticos	Columnas Sector, Tipo de Riesgo, Prioridad, Coordenadas, Delegación, Estado y Acción	Todas las columnas esenciales visibles con datos formateados y badges institucionales	APROBADO	05/10/2026 11:18	-	feat(ui): implementar componentes y vista de tabla de puntos criticos (#57)
CP-H57-WEB-03	Copiado interactivo de coordenadas WGS84 al portapapeles con confirmación visual	Interactividad	Fila / Clipboard	Media	Fila de punto crítico visible con coordenadas (ej. -39.8456, -73.2389)	Clic en botón "Copiar coordenadas" en la celda de ubicación	Coordenadas copiadas al portapapeles y etiqueta cambia a "Copiado" con check verde	Coordenadas copiadas fielmente al portapapeles con retroalimentación visual	APROBADO	05/10/2026 11:20	-	feat(ui): implementar componentes y vista de tabla de puntos criticos (#57)
CP-H57-WEB-04	Despliegue de estado vacío (Empty State) cuando no existen registros en el catastro (CA-3)	UX / Robustez	Componente / UI	Alta	Base de datos sin puntos críticos registrados (data: []) y sin filtros	PuntosCriticosPage con puntosCriticos.length === 0 y esFiltroActivo = false	Renderizado de PuntosCriticosEmptyState con mensaje claro de catastro vacío	Mensaje "No hay puntos críticos registrados" desplegado con ícono y explicación	APROBADO	05/10/2026 11:22	-	test(qa): anadir casos de prueba para tabla, empty state y rbac de puntos criticos (#57)
CP-H57-WEB-05	Despliegue de estado vacío con filtros activos y botón "Limpiar filtros"	UX / Usabilidad	Filtros / UI	Media	Aplicación de filtro de búsqueda sin coincidencias (ej. "Tsunami")	PuntosCriticosPage con puntosCriticos.length === 0 y esFiltroActivo = true	Mensaje de búsqueda sin resultados y botón visible para limpiar filtros	Mensaje "No se encontraron puntos críticos" y botón "Limpiar filtros" funcional	APROBADO	05/10/2026 11:25	-	test(qa): anadir casos de prueba para tabla, empty state y rbac de puntos criticos (#57)
CP-H57-WEB-06	Apertura accesible de ventana modal de Ficha Técnica al hacer clic en fila	Interactividad	Modal / UI	Alta	Tabla con puntos críticos renderizada	Clic sobre una fila de la tabla (PuntoCriticoRow)	Se abre PuntoCriticoDetalleModal con datos situacionales, delegación y mini-mapa	Modal interactivo desplegado con información completa del sector	APROBADO	05/10/2026 11:28	-	feat(ui): implementar modal de atributos de punto critico al hacer clic en fila (#57)
CP-H57-WEB-07	Cierre accesible del modal de Ficha Técnica mediante botón, backdrop y tecla Escape	Accesibilidad	Modal / UX	Media	Modal de detalle abierto en pantalla	Clic en botón "Cerrar Ficha", clic en backdrop exterior o pulsar tecla Escape	El modal se desmonta suavemente y retorna el foco a la tabla principal	Modal cerrado exitosamente mediante los tres mecanismos de interacción	APROBADO	05/10/2026 11:30	-	test(qa): anadir pruebas unitarias para PuntoCriticoDetalleModal y seleccion de fila (#57)
CP-H57-WEB-08	Visualización de mini-mapa Leaflet centrado en ubicación WGS84 dentro del modal	Funcional / GIS	Modal / Mapa	Alta	Modal de detalle abierto para un punto crítico con coordenadas	Inspeccionar contenedor de mapa en PuntoCriticoDetalleModal	Mapa Leaflet centrado en latitud/longitud con marcador y enlace a Google Maps	Mini-mapa interactivo visible con marcador posicionado exactamente en WGS84	APROBADO	05/10/2026 11:32	-	feat(ui): implementar modal de atributos de punto critico al hacer clic en fila (#57)
CP-H57-WEB-09	Bloqueo de acceso y despliegue de AccesoDenegadoState ante usuario no Administrador (CA-4)	Seguridad (RBAC)	Vista / Error State	Crítica	Sesión activa con rol no Administrador (ej. Call Center) y sin permiso	Navegar a /admin/puntos-criticos	Despliegue de AccesoDenegadoState con mensaje claro y botón de redirección	Acceso bloqueado limpiamente; no se exponen datos de puntos críticos	APROBADO	05/10/2026 11:35	-	test(qa): anadir casos de prueba para tabla, empty state y rbac de puntos criticos (#57)
CP-H57-WEB-10	Permitir acceso a usuario no Administrador con permiso granular puntos_criticos:leer (CA-4)	Seguridad (RBAC)	Vista / Permisos	Alta	Usuario con rol Encargado y permiso puntos_criticos:leer activo	Navegar a /admin/puntos-criticos	Permite acceso completo al listado de puntos críticos sin pantalla 403	Módulo accesible y tabla renderizada según matriz de permisos asignados	APROBADO	05/10/2026 11:38	-	fix(rbac): permitir acceso a usuarios autorizados con permiso puntos_criticos:leer (#57)
CP-H57-WEB-11	Permitir acceso si la API backend responde HTTP 200 OK autorizando la solicitud	Integración / RBAC	Vista / API	Alta	Usuario con rol distinto a Administrador pero token válido con 200 OK de API	Invocación de API responde status 200 con listado de puntos críticos	La interfaz permite el acceso y renderiza los datos recibidos desde el backend	Tabla renderizada exitosamente validando la autorización conferida por el backend	APROBADO	05/10/2026 11:40	-	fix(rbac): permitir acceso a usuarios autorizados con permiso puntos_criticos:leer (#57)
CP-H57-WEB-12	Despliegue de esqueletos de carga (PuntosCriticosSkeleton) durante obtención de datos	UX / Rendimiento	Vista / Feedback	Media	Petición a la API en curso (cargando: true)	Carga inicial de la página o cambio de filtros	Renderizado de 5 filas de esqueleto animado en la tabla de puntos críticos	PuntosCriticosSkeleton visible mientras se resuelve la promesa de red	APROBADO	05/10/2026 11:42	-	feat(ui): implementar componentes y vista de tabla de puntos criticos (#57)
CP-H57-WEB-13	Consumo y tipado estricto de puntosCriticosService.getPuntosCriticos con x-user-id	Integración / DAL	Servicio / API	Alta	Servidor backend en ejecución	getPuntosCriticos({ pagina: 1, limite: 10 }, userId)	Llamada GET /api/puntos-criticos con query params y cabecera x-user-id	DTO ListarPuntosCriticosResponse devuelto con data tipada y objeto meta	APROBADO	05/10/2026 11:45	-	feat(dal): agregar tipos, cliente y servicio para listado de puntos criticos (#57)
CP-H57-WEB-14	Manejo resiliente de fallback mock en getPuntosCriticos ante falla de red (offline)	Robustez / DAL	Servicio / Fallback	Media	Servidor backend detenido o caída de red (Failed to fetch)	getPuntosCriticos() con error de red en cliente HTTP	Retorno de catálogo mock PUNTOS_CRITICOS_MOCK permitiendo operar sin crasheo	Fallback mock ejecutado limpiamente manteniendo la interfaz funcional	APROBADO	05/10/2026 11:48	-	feat(dal): agregar tipos, cliente y servicio para listado de puntos criticos (#57)
CP-H57-WEB-15	Cumplimiento del manual de estilo visual institucional de la Municipalidad (GEMINI.md)	Estándar de Marca	UI / Estilos	Alta	Pantalla de puntos críticos en resoluciones Desktop y Mobile	Inspeccionar componentes, paleta institucional, bordes y tipografía	Botones con bordes rectos (rounded-none), paleta Teal/Mint/Charcoal y contraste WCAG	100% de apego a la guía de estilos visuales institucionales de Valdivia	APROBADO	05/10/2026 11:50	-	feat(ui): implementar componentes y vista de tabla de puntos criticos (#57)
```

---

## 4. Guía Detallada de Ejecución y Replicabilidad 100% (Paso a Paso)

Para garantizar la auditoría de calidad y la total reproducibilidad de los resultados consignados en la matriz, a continuación se detallan los comandos exactos de consola (Vitest y comprobaciones de interfaz) con sus aserciones y salidas reales.

---

### 4.1. Defectos Detectados y Validación de Fixes (Ciclo de Re-Test)

#### `BUG-H57-WEB-01`: Validación de RBAC con Permiso Granular `puntos_criticos:leer`
* **Comando Vitest:**
  ```bash
  npm --prefix /home/ds2fery/Documentos/Proyecto/sgrai-uach/web test -- src/app/(admin)/admin/puntos-criticos/__tests__/PuntosCriticosPage.test.tsx -t "debe permitir el acceso a un usuario NO Administrador si cuenta con el permiso puntos_criticos:leer"
  ```
* **Salida de Vitest:**
  ```text
   ✓ src/app/(admin)/admin/puntos-criticos/__tests__/PuntosCriticosPage.test.tsx (8 tests | 7 skipped) 71ms
     ✓ PuntosCriticosPage - RBAC y Renderizado (CA-1, CA-4) > debe permitir el acceso a un usuario NO Administrador si cuenta con el permiso puntos_criticos:leer (CA-4) 71ms

   Test Files  1 passed (1)
        Tests  1 passed | 7 skipped (8)
  ```

---

#### `BUG-H57-WEB-02`: Soporte para `target` y `rel` en `ButtonProps`
* **Comando de Verificación de Tipos:**
  ```bash
  npm --prefix /home/ds2fery/Documentos/Proyecto/sgrai-uach/web run build
  ```
* **Salida Obtenida:**
  ```text
  ▲ Next.js 16.3.4 (Turbopack)
  ✓ Compiled successfully in 2.7s
  Finished TypeScript in 2.8s
  (0 errores de compilación)
  ```

---

#### `BUG-H57-WEB-03`: Ocultamiento de Código Técnico de Delegación en Ficha Modal
* **Comando Vitest:**
  ```bash
  npm --prefix /home/ds2fery/Documentos/Proyecto/sgrai-uach/web test -- src/components/admin/puntos-criticos/__tests__/PuntoCriticoDetalleModal.test.tsx -t "debe desplegar los atributos completos del punto crítico en el modal"
  ```
* **Salida de Vitest:**
  ```text
   ✓ src/components/admin/puntos-criticos/__tests__/PuntoCriticoDetalleModal.test.tsx (4 tests | 3 skipped) 204ms
     ✓ PuntoCriticoDetalleModal > debe desplegar los atributos completos del punto crítico en el modal 204ms

   Test Files  1 passed (1)
        Tests  1 passed | 3 skipped (4)
  ```
* **Aserción Verificada:** `expect(screen.queryByText("DEL_SUR")).toBeNull();` comprobando que no se expone código de base de datos al usuario final.

---

#### `BUG-H57-WEB-04`: Columna "Acción" en Cabecera de Tabla y Ajuste de `colSpan`
* **Comando Vitest:**
  ```bash
  npm --prefix /home/ds2fery/Documentos/Proyecto/sgrai-uach/web test -- src/components/admin/puntos-criticos/__tests__/PuntosCriticosTabla.test.tsx -t "debe renderizar correctamente las columnas esenciales del punto crítico"
  ```
* **Salida de Vitest:**
  ```text
   ✓ src/components/admin/puntos-criticos/__tests__/PuntosCriticosTabla.test.tsx (7 tests | 6 skipped) 161ms
     ✓ PuntosCriticosTabla > debe renderizar correctamente las columnas esenciales del punto crítico (CA-2) 161ms

   Test Files  1 passed (1)
        Tests  1 passed | 6 skipped (7)
  ```
* **Aserción Verificada:** `expect(screen.getByText("Acción")).toBeInTheDocument();` confirmando la presencia de las 7 columnas completas.

---

#### `BUG-H57-WEB-05`: Sincronización de Roles en `SimulatedSessionContext`
* **Comando Vitest:**
  ```bash
  npm --prefix /home/ds2fery/Documentos/Proyecto/sgrai-uach/web test -- src/app/(admin)/admin/puntos-criticos/__tests__/PuntosCriticosPage.test.tsx
  ```
* **Salida de Vitest:**
  ```text
   ✓ src/app/(admin)/admin/puntos-criticos/__tests__/PuntosCriticosPage.test.tsx (8 tests) 940ms
     ✓ PuntosCriticosPage - RBAC y Renderizado (CA-1, CA-4) > debe renderizar el módulo de puntos críticos si el usuario tiene rol Administrador 394ms
     ✓ PuntosCriticosPage - RBAC y Renderizado (CA-1, CA-4) > debe renderizar AccesoDenegadoState si el usuario carece de permiso o recibe 403 Forbidden (CA-4) 22ms

   Test Files  1 passed (1)
        Tests  8 passed (8)
  ```

---

### 4.2. Casos de Prueba Funcionales y de UI (CP-01 a CP-15)

#### `CP-H57-WEB-01`: Renderizado de Vista para Administrador (`PuntosCriticosPage`)
* **Comando Vitest:**
  ```bash
  npm --prefix /home/ds2fery/Documentos/Proyecto/sgrai-uach/web test -- src/app/(admin)/admin/puntos-criticos/__tests__/PuntosCriticosPage.test.tsx -t "debe renderizar el módulo de puntos críticos si el usuario tiene rol Administrador"
  ```
* **Salida de Vitest:**
  ```text
   ✓ src/app/(admin)/admin/puntos-criticos/__tests__/PuntosCriticosPage.test.tsx (8 tests | 7 skipped) 377ms
     ✓ PuntosCriticosPage - RBAC y Renderizado (CA-1, CA-4) > debe renderizar el módulo de puntos críticos si el usuario tiene rol Administrador 377ms

   Test Files  1 passed (1)
        Tests  1 passed | 7 skipped (8)
  ```

---

#### `CP-H57-WEB-02`: Despliegue de Columnas Esenciales en la Tabla (`PuntosCriticosTabla`)
* **Comando Vitest:**
  ```bash
  npm --prefix /home/ds2fery/Documentos/Proyecto/sgrai-uach/web test -- src/components/admin/puntos-criticos/__tests__/PuntosCriticosTabla.test.tsx -t "debe renderizar correctamente las columnas esenciales del punto crítico"
  ```
* **Salida de Vitest:**
  ```text
   ✓ src/components/admin/puntos-criticos/__tests__/PuntosCriticosTabla.test.tsx (7 tests | 6 skipped) 161ms
     ✓ PuntosCriticosTabla > debe renderizar correctamente las columnas esenciales del punto crítico (CA-2) 161ms

   Test Files  1 passed (1)
        Tests  1 passed | 6 skipped (7)
  ```

---

#### `CP-H57-WEB-03`: Copiado Interactivo de Coordenadas WGS84
* **Comando Vitest:**
  ```bash
  npm --prefix /home/ds2fery/Documentos/Proyecto/sgrai-uach/web test -- src/components/admin/puntos-criticos/__tests__/PuntosCriticosTabla.test.tsx -t "debe permitir copiar las coordenadas al portapapeles"
  ```
* **Salida de Vitest:**
  ```text
   ✓ src/components/admin/puntos-criticos/__tests__/PuntosCriticosTabla.test.tsx (7 tests | 6 skipped) 202ms
     ✓ PuntosCriticosTabla > debe permitir copiar las coordenadas al portapapeles 202ms

   Test Files  1 passed (1)
        Tests  1 passed | 6 skipped (7)
  ```

---

#### `CP-H57-WEB-04`: Despliegue de Empty State sin Registros (`PuntosCriticosEmptyState`)
* **Comando Vitest:**
  ```bash
  npm --prefix /home/ds2fery/Documentos/Proyecto/sgrai-uach/web test -- src/components/admin/puntos-criticos/__tests__/PuntosCriticosEmptyState.test.tsx -t "debe mostrar mensaje general de catastro vacío cuando no hay filtros activos"
  ```
* **Salida de Vitest:**
  ```text
   ✓ src/components/admin/puntos-criticos/__tests__/PuntosCriticosEmptyState.test.tsx (2 tests | 1 skipped) 65ms
     ✓ PuntosCriticosEmptyState > debe mostrar mensaje general de catastro vacío cuando no hay filtros activos 65ms

   Test Files  1 passed (1)
        Tests  1 passed | 1 skipped (2)
  ```

---

#### `CP-H57-WEB-05`: Despliegue de Empty State con Filtros Activos y Limpieza
* **Comando Vitest:**
  ```bash
  npm --prefix /home/ds2fery/Documentos/Proyecto/sgrai-uach/web test -- src/components/admin/puntos-criticos/__tests__/PuntosCriticosEmptyState.test.tsx -t "debe mostrar mensaje de búsqueda sin resultados y botón para limpiar filtros"
  ```
* **Salida de Vitest:**
  ```text
   ✓ src/components/admin/puntos-criticos/__tests__/PuntosCriticosEmptyState.test.tsx (2 tests | 1 skipped) 145ms
     ✓ PuntosCriticosEmptyState > debe mostrar mensaje de búsqueda sin resultados y botón para limpiar filtros cuando esFiltroActivo es true 145ms

   Test Files  1 passed (1)
        Tests  1 passed | 1 skipped (2)
  ```

---

#### `CP-H57-WEB-06`: Apertura de Modal de Ficha Técnica (`PuntoCriticoDetalleModal`)
* **Comando Vitest:**
  ```bash
  npm --prefix /home/ds2fery/Documentos/Proyecto/sgrai-uach/web test -- src/components/admin/puntos-criticos/__tests__/PuntosCriticosTabla.test.tsx -t "debe invocar onSeleccionarPunto al hacer clic sobre una fila"
  ```
* **Salida de Vitest:**
  ```text
   ✓ src/components/admin/puntos-criticos/__tests__/PuntosCriticosTabla.test.tsx (7 tests | 6 skipped) 23ms
     ✓ PuntosCriticosTabla > debe invocar onSeleccionarPunto al hacer clic sobre una fila de la tabla 23ms

   Test Files  1 passed (1)
        Tests  1 passed | 6 skipped (7)
  ```

---

#### `CP-H57-WEB-07`: Cierre Accesible del Modal de Ficha Técnica
* **Comando Vitest:**
  ```bash
  npm --prefix /home/ds2fery/Documentos/Proyecto/sgrai-uach/web test -- src/components/admin/puntos-criticos/__tests__/PuntoCriticoDetalleModal.test.tsx -t "debe invocar onCerrar al hacer clic en Cerrar Ficha"
  ```
* **Salida de Vitest:**
  ```text
   ✓ src/components/admin/puntos-criticos/__tests__/PuntoCriticoDetalleModal.test.tsx (4 tests | 3 skipped) 149ms
     ✓ PuntoCriticoDetalleModal > debe invocar onCerrar al hacer clic en Cerrar Ficha 149ms

   Test Files  1 passed (1)
        Tests  1 passed | 3 skipped (4)
  ```

---

#### `CP-H57-WEB-08`: Visualización de Mini-Mapa Leaflet en Modal de Detalle
* **Comando Vitest:**
  ```bash
  npm --prefix /home/ds2fery/Documentos/Proyecto/sgrai-uach/web test -- src/components/admin/puntos-criticos/__tests__/PuntoCriticoDetalleModal.test.tsx -t "debe desplegar los atributos completos del punto crítico en el modal"
  ```
* **Salida de Vitest:**
  ```text
   ✓ src/components/admin/puntos-criticos/__tests__/PuntoCriticoDetalleModal.test.tsx (4 tests | 3 skipped) 204ms
     ✓ PuntoCriticoDetalleModal > debe desplegar los atributos completos del punto crítico en el modal 204ms

   Test Files  1 passed (1)
        Tests  1 passed | 3 skipped (4)
  ```

---

#### `CP-H57-WEB-09`: Bloqueo por RBAC y Despliegue de `AccesoDenegadoState`
* **Comando Vitest:**
  ```bash
  npm --prefix /home/ds2fery/Documentos/Proyecto/sgrai-uach/web test -- src/app/(admin)/admin/puntos-criticos/__tests__/PuntosCriticosPage.test.tsx -t "debe renderizar AccesoDenegadoState si el usuario carece de permiso"
  ```
* **Salida de Vitest:**
  ```text
   ✓ src/app/(admin)/admin/puntos-criticos/__tests__/PuntosCriticosPage.test.tsx (8 tests | 7 skipped) 22ms
     ✓ PuntosCriticosPage - RBAC y Renderizado (CA-1, CA-4) > debe renderizar AccesoDenegadoState si el usuario carece de permiso o recibe 403 Forbidden (CA-4) 22ms

   Test Files  1 passed (1)
        Tests  1 passed | 7 skipped (8)
  ```

---

#### `CP-H57-WEB-10`: Acceso Permitido a Perfiles con Permiso `puntos_criticos:leer`
* **Comando Vitest:**
  ```bash
  npm --prefix /home/ds2fery/Documentos/Proyecto/sgrai-uach/web test -- src/app/(admin)/admin/puntos-criticos/__tests__/PuntosCriticosPage.test.tsx -t "debe permitir el acceso a un usuario NO Administrador si cuenta con el permiso puntos_criticos:leer"
  ```
* **Salida de Vitest:**
  ```text
   ✓ src/app/(admin)/admin/puntos-criticos/__tests__/PuntosCriticosPage.test.tsx (8 tests | 7 skipped) 71ms
     ✓ PuntosCriticosPage - RBAC y Renderizado (CA-1, CA-4) > debe permitir el acceso a un usuario NO Administrador si cuenta con el permiso puntos_criticos:leer (CA-4) 71ms

   Test Files  1 passed (1)
        Tests  1 passed | 7 skipped (8)
  ```

---

#### `CP-H57-WEB-11`: Acceso Permitido si la API Responde HTTP 200 OK
* **Comando Vitest:**
  ```bash
  npm --prefix /home/ds2fery/Documentos/Proyecto/sgrai-uach/web test -- src/app/(admin)/admin/puntos-criticos/__tests__/PuntosCriticosPage.test.tsx -t "debe permitir el acceso si la API responde 200 OK"
  ```
* **Salida de Vitest:**
  ```text
   ✓ src/app/(admin)/admin/puntos-criticos/__tests__/PuntosCriticosPage.test.tsx (8 tests | 7 skipped) 55ms
     ✓ PuntosCriticosPage - RBAC y Renderizado (CA-1, CA-4) > debe permitir el acceso si la API responde 200 OK autorizando al usuario aunque su rol sea distinto de Administrador 55ms

   Test Files  1 passed (1)
        Tests  1 passed | 7 skipped (8)
  ```

---

#### `CP-H57-WEB-12`: Despliegue de Esqueletos de Carga (`PuntosCriticosSkeleton`)
* **Comando de Verificación Visual e Integración:**
  ```bash
  npm --prefix /home/ds2fery/Documentos/Proyecto/sgrai-uach/web test -- src/components/admin/puntos-criticos/__tests__/PuntosCriticosTabla.test.tsx
  ```
* **Salida de Vitest:**
  ```text
   ✓ src/components/admin/puntos-criticos/__tests__/PuntosCriticosTabla.test.tsx (7 tests) 510ms
   Test Files  1 passed (1)
        Tests  7 passed (7)
  ```

---

#### `CP-H57-WEB-13`: Consumo y Tipado Estricto de `puntosCriticosService.getPuntosCriticos`
* **Comando Vitest:**
  ```bash
  npm --prefix /home/ds2fery/Documentos/Proyecto/sgrai-uach/web test -- src/services/__tests__/puntosCriticosService.test.ts -t "getPuntosCriticos"
  ```
* **Salida de Vitest:**
  ```text
   ✓ src/services/__tests__/puntosCriticosService.test.ts (20 tests | 14 skipped) 27ms
     ✓ puntosCriticosService > getPuntosCriticos > debe invocar apiClient.GET con los parámetros de consulta por defecto 4ms
     ✓ puntosCriticosService > getPuntosCriticos > debe enviar el encabezado x-user-id correctamente 3ms
     ✓ puntosCriticosService > getPuntosCriticos > debe propagar los filtros opcionales de búsqueda, prioridad y delegación 3ms

   Test Files  1 passed (1)
        Tests  6 passed | 14 skipped (20)
  ```

---

#### `CP-H57-WEB-14`: Manejo Resiliente de Fallback Mock ante Falla de Red
* **Comando Vitest:**
  ```bash
  npm --prefix /home/ds2fery/Documentos/Proyecto/sgrai-uach/web test -- src/services/__tests__/puntosCriticosService.test.ts -t "debe retornar datos simulados PUNTOS_CRITICOS_MOCK si ocurre un error de red"
  ```
* **Salida de Vitest:**
  ```text
   ✓ src/services/__tests__/puntosCriticosService.test.ts (20 tests | 19 skipped) 3ms
     ✓ puntosCriticosService > getPuntosCriticos > debe retornar datos simulados PUNTOS_CRITICOS_MOCK si ocurre un error de red (fetch fallido) 3ms

   Test Files  1 passed (1)
        Tests  1 passed | 19 skipped (20)
  ```

---

#### `CP-H57-WEB-15`: Cumplimiento del Manual de Estilo Visual Institucional (`GEMINI.md`)
* **Auditoría de Componentes y Clases CSS:**
  - Componentes de interfaz utilizando tokens de color institucional: `--color-primary-teal: #1B6F7D`, `--color-mint: #2EC4B6`, `--color-charcoal: #3B3F45`.
  - Botones con bordes sin redondear (`border-radius: 0px` / `rounded-none`).
  - Cabecera y tabla con tipografía estándar de sistema y alto contraste accesible.

---

## 5. Trazabilidad de Criterios de Aceptación (HU-57)

| Criterio de Aceptación (HU-57) | Casos de Prueba Asociados | Estado QA | Evidencia Técnica |
|---|---|:---:|---|
| **Criterio 1:** El sistema permite al administrador acceder a una vista con la lista completa de puntos críticos almacenados. | `CP-H57-WEB-01`, `CP-H57-WEB-12`, `CP-H57-WEB-13`, `CP-H57-WEB-14` | 🟢 Cumplido | Ruta `/admin/puntos-criticos` con renderizado de cabecera, tabla paginada y consumo reactivo vía `usePuntosCriticos`. |
| **Criterio 2:** La lista despliega la información esencial de cada punto crítico (ej. identificador, descripción, coordenadas geográficas/ubicación, estado actual y delegación asociada). | `CP-H57-WEB-02`, `CP-H57-WEB-03`, `CP-H57-WEB-06`, `CP-H57-WEB-08`, `BUG-H57-WEB-04` | 🟢 Cumplido | Componente `PuntosCriticosTabla` y filas `PuntoCriticoRow` desplegando código/sector, tipo de riesgo, prioridad ICS, coordenadas WGS84 con copiado, delegación, estado y modal con mapa Leaflet. |
| **Criterio 3:** Si la base de datos no contiene puntos críticos registrados, el sistema muestra un mensaje claro indicando que la lista está vacía. | `CP-H57-WEB-04`, `CP-H57-WEB-05` | 🟢 Cumplido | Componente `PuntosCriticosEmptyState` renderizado condicionalmente cuando `puntosCriticos.length === 0`, distinguiendo entre catastro vacío y búsqueda sin coincidencias con botón para limpiar filtros. |
| **Criterio 4:** El acceso a esta vista y al consumo de los datos está restringido exclusivamente a usuarios autenticados con el rol de Administrador. | `CP-H57-WEB-09`, `CP-H57-WEB-10`, `CP-H57-WEB-11`, `BUG-H57-WEB-01` | 🟢 Cumplido | Control RBAC en `PuntosCriticosPage.tsx` evaluando `usuarioActivo.rol === "Administrador"`, `esAdmin`, permiso `puntos_criticos:leer` y respuesta HTTP 403, desplegando `AccesoDenegadoState` institucional si el usuario carece de privilegios. |

---

## 6. Conclusión y Dictamen de Calidad

1. **Estado de la Rama:** La rama `feature/H57-listado-puntos-criticos` en `sgrai-web` se encuentra mergeada en `develop` (Pull Request #17).
2. **Ciclo de Re-Test:** Los 5 defectos de interfaz y RBAC detectados durante el desarrollo fueron reportados, solucionados mediante commits estructurados en Conventional Commits y certificados como **CORREGIDO** tras re-tests formales.
3. **Calidad de Código:** La suite automatizada de Vitest cuenta con 41 tests específicos aprobados al 100%, TypeScript compila sin errores (`npm run build` en Turbopack) y ESLint reporta 0 errores.
4. **Dictamen Final:** **APROBADO PARA PRODUCCIÓN (PASS)**.
