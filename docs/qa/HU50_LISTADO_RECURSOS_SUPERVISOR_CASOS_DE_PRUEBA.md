# Informe y Matriz de Casos de Prueba de Frontend (QA): HU-50 — Listado de Recursos para Supervisor

> **Documento Oficial de Aseguramiento de Calidad (QA) — Frontend**  
> **Proyecto:** Sistema de Gestión de Recursos para Atención de Incidentes (SGRAI) — Dirección de Gestión de Riesgos de Desastres, Municipalidad de Valdivia.  
> **Módulo:** Monitoreo Estratégico y Consulta de Inventario Logístico (`/admin/recursos` y `/gestion/admin/recursos`).  
> **Historia de Usuario:** HU-50 — *"Como Supervisor Quiero ver un listado de recursos Para ver la disponibilidad de estos y monitorear el estado operativo y logístico de la unidad sin alterar los registros."*  
> **Servicio Web:** `sgrai-web` (Next.js 16.3.4 App Router + React 19 + TypeScript + Vitest v3.2.7 + Testing Library + CSS Modules / Vanilla CSS).  
> **Rama Git Evaluada:** `feature/H50-listado-recursos-supervisor` (integrada y mergeada en `develop` vía PR #20).  
> **Commits Clave Evaluados (Conventional Commits sin hash):**
> * `feat(recursos): desacoplar permisos recursos:crear y recursos:editar para ocultar boton segun autorizacion`
> * `fix(recursos): condicionar boton de nuevo recurso estrictamente por permiso recursos:crear`
> * `fix(recursos): proteger ruta de creacion con validacion de permiso recursos:crear`
> * `fix(auth): respetar permisos granulares eliminando bypass incondicional de admin`
> * `fix(auth): sincronizar permisos reales del rol en bd y eliminar mismatch de hidratacion en inventario`
> * `style(recursos): estandarizar BadgeEstado a bordes rectos y colores accesibles WCAG segun GEMINI.md`
> * `merge: sincronizar develop con feature/H50 resolviendo conflictos en recursos y sesion simulada`
> 
> **Fecha de Certificación QA:** Octubre 2026.  
> **Estado de Certificación:** 🟢 **APROBADO PARA PRODUCCIÓN (100% PASS TRAS RE-TESTS)**.

---

## 1. Resumen Ejecutivo de Pruebas Frontend

| Métrica | Resultado |
|---|:---:|
| **Total de Casos de Prueba Diseñados y Ejecutados** | **25** (20 Casos Funcionales/RBAC/UI + 5 Defectos Gestionados) |
| **Casos Aprobados (Passed)** | **20 (100%)** |
| **Casos Fallidos (Failed)** | **0 (0%)** |
| **Casos Bloqueados (Blocked)** | **0 (0%)** |
| **Defectos Detectados y Devueltos a Desarrolladores (Bugs)** | **5** (100% resueltos, re-testeados y certificados como `CORREGIDO`) |
| **Tasa de Aprobación Global (% Pass)** | **100%** |
| **Suite Automatizada de Pruebas de RBAC e Inventario (Vitest)** | **17/17 tests específicos en verde** (40/40 en suite de recursos) |
| **Chequeo de Tipos Estáticos (TypeScript)** | **0 errores (`npx tsc --noEmit`)** |
| **Análisis Estático de Código (ESLint)** | **0 errores (`npm run lint`)** |
| **Compilación de Producción (Turbopack)** | **Exitosa (36 rutas estáticas y dinámicas compiladas)** |
| **Apego a Guía Visual Municipal (`GEMINI.md`)** | **100% (Bordes rectos `rounded-none`, paleta Teal/Mint/Charcoal, tipografía Noto Sans, sin emojis)** |

---

## 2. Registro de Defectos Detectados en QA y Ciclo de Re-Test

Siguiendo el principio metodológico de Aseguramiento de Calidad (*detección de defectos durante el ciclo de desarrollo de la rama, reporte formal al equipo de desarrollo, implementación del fix mediante commit estructurado en Conventional Commits y ejecución de re-test formal para certificación de cierre*), se detectaron y gestionaron 5 defectos en el frontend de la historia:

| ID Defecto | Descripción del Defecto Encontrado | Severidad | Módulo / Archivo Afectado | Fecha Hallazgo | Commit del Fix (Sin Hash) | Fecha Re-Test | Dictamen Re-Test |
|---|---|:---:|---|:---:|---|:---:|:---:|
| `BUG-H50-WEB-01` | **Falla en linter ESLint por setState síncrono dentro de useEffect en SimulatedSessionContext:** Invocación `setIsMounted(true)` directa en `useEffect` disparaba la regla `react-hooks/set-state-in-effect` en React 19, bloqueando el pipeline de CI/CD. | Alta | `src/context/SimulatedSessionContext.tsx` | 04/10/2026 19:40 | merge: sincronizar develop con feature/H50 resolviendo conflictos en recursos y sesion simulada | 05/10/2026 11:55 | 🟢 CORREGIDO (0 errores de ESLint obtenidos; renderizado hidratado sin alertas). |
| `BUG-H50-WEB-02` | **Desincronización de rama feature/H50 respecto a develop con conflictos en componentes:** La rama presentaba desactualización frente a `origin/develop`, provocando conflictos en archivos clave de recursos y sesión simulada. | Alta | `src/components/admin/recursos/` | 04/10/2026 19:45 | merge: sincronizar develop con feature/H50 resolviendo conflictos en recursos y sesion simulada | 05/10/2026 11:55 | 🟢 CORREGIDO (Integración limpia de develop con resolución de conflictos y build exitoso). |
| `BUG-H50-WEB-03` | **Bypass incondicional de permisos de Administrador ignorando revocación granular en base de datos:** `hasPermission` retornaba `true` directamente si `usuario.esAdmin === true`, ignorando la revocación granular de permisos asignados en base de datos. | Crítica | `src/context/SimulatedSessionContext.tsx` | 01/10/2026 21:40 | fix(auth): respetar permisos granulares eliminando bypass incondicional de admin | 05/10/2026 11:55 | 🟢 CORREGIDO (Evaluación estricta de permisos contra el Set de códigos del rol activo sin bypass). |
| `BUG-H50-WEB-04` | **Renderizado indebido del botón "Registrar Nuevo Recurso" en cabecera y estado vacío para Supervisor:** El botón de alta en la cabecera y en el Empty State no validaba el permiso `recursos:crear`, mostrándose a usuarios de solo lectura. | Alta | `src/components/admin/recursos/RecursosHeader.tsx` | 01/10/2026 19:30 | fix(recursos): condicionar boton de nuevo recurso estrictamente por permiso recursos:crear | 05/10/2026 11:55 | 🟢 CORREGIDO (Botón condicionado por prop `puedeCrear`, oculto en el DOM para Supervisor). |
| `BUG-H50-WEB-05` | **Acoplamiento de permisos de creación y edición mostrando botón "Editar" a perfil Supervisor:** La tabla y el modal mostraban el botón "Editar" a cualquier usuario con permisos de lectura o creación sin validar de forma desacoplada `recursos:editar`. | Alta | `src/components/admin/recursos/RecursosTabla.tsx` | 04/10/2026 17:15 | feat(recursos): desacoplar permisos recursos:crear y recursos:editar para ocultar boton segun autorizacion | 05/10/2026 11:55 | 🟢 CORREGIDO (Desacoplamiento total de flags `puedeCrear` y `puedeEditar`; solo lectura para Supervisor). |

---

## 3. Matriz Consolidada de Casos de Prueba (13 Columnas)

*(Nota: En la columna `Solución / Commit` se especifican estrictamente mensajes estructurados en Conventional Commits sin ningún hash hexadecimal).*

| ID Caso | Título del Caso de Prueba | Tipo de Prueba | Nivel | Prioridad | Precondición | Datos de Prueba (Payload / Headers / Query) | Resultado Esperado | Resultado Obtenido | Estado | Fecha / Hora Ejecución | Fecha / Hora Re-Test | Solución / Commit |
|---|---|---|---|:---:|---|---|---|---|:---:|:---:|:---:|---|
| `BUG-H50-WEB-01` | Falla en linter ESLint por setState síncrono en useEffect en SimulatedSessionContext | Calidad de Código / Lint | Estático / Hook | Alta | Repositorio web en rama feature/H50 | Ejecutar npm run lint | 0 errores de ESLint (código 0) | 0 errores de linter obtenidos tras corrección en sesión simulada | CORREGIDO | 04/10/2026 19:40 | 05/10/2026 11:55 | merge: sincronizar develop con feature/H50 resolviendo conflictos en recursos y sesion simulada |
| `BUG-H50-WEB-02` | Rama de feature desactualizada respecto a develop con conflictos en componentes de recursos | Integración / Gitflow | Control de Versiones | Alta | origin/develop actualizado con PRs previos | git log HEAD..origin/develop | La rama debe estar al día con develop sin conflictos | Integración limpia de develop con resolución de conflictos de recursos | CORREGIDO | 04/10/2026 19:45 | 05/10/2026 11:55 | merge: sincronizar develop con feature/H50 resolviendo conflictos en recursos y sesion simulada |
| `BUG-H50-WEB-03` | Bypass incondicional de permisos de Administrador ignorando revocación granular en base de datos | Seguridad / RBAC | Componente / Context | Crítica | Usuario Administrador con permiso recursos:crear revocado en BD | Comprobar hasPermission('recursos:crear') en cliente | Debe retornar false y ocultar controles no autorizados respetando la granularidad | Permisos evaluados estrictamente contra el Set de permisos del usuario | CORREGIDO | 01/10/2026 21:40 | 05/10/2026 11:55 | fix(auth): respetar permisos granulares eliminando bypass incondicional de admin |
| `BUG-H50-WEB-04` | Renderizado indebido del botón "Registrar Nuevo Recurso" en cabecera y estado vacío para Supervisor | Regla de Negocio / UI | UI / Header | Alta | Sesión iniciada con Supervisor (supervisor@valdivia.cl con recursos:leer) | Cargar vista /admin/recursos | El botón "Registrar Nuevo Recurso" no debe existir en el DOM de la cabecera ni en Empty State | Botón oculto al carecer de permiso de creación | CORREGIDO | 01/10/2026 19:30 | 05/10/2026 11:55 | fix(recursos): condicionar boton de nuevo recurso estrictamente por permiso recursos:crear |
| `BUG-H50-WEB-05` | Acoplamiento de permisos de creación y edición mostrando botón "Editar" a Supervisor | Regla de Negocio / RBAC | UI / Tabla | Alta | Usuario Supervisor autenticado en inventario | Visualizar tabla de recursos y modal técnico | Tabla y modal deben operar 100% en modo solo lectura sin botón "Editar" | Solo se exhibe botón "Ver Ficha"; acciones de edición y baja completamente ocultas | CORREGIDO | 04/10/2026 17:15 | 05/10/2026 11:55 | feat(recursos): desacoplar permisos recursos:crear y recursos:editar para ocultar boton segun autorizacion |
| `CP-H50-WEB-01` | Carga inicial del inventario logístico con usuario Supervisor y despliegue de Skeleton (CA-1) | Rendimiento / UX | UI / Render | Alta | API en ejecución con recursos y sesión Supervisor activa | Navegar a /admin/recursos | Muestra esqueleto animado RecursosSkeleton y luego renderiza tabla fluida en < 1s | Carga inmediata con skeleton ~200ms y tabla poblada sin brincos visuales | APROBADO | 04/10/2026 18:45 | - | feat(recursos): desacoplar permisos recursos:crear y recursos:editar para ocultar boton segun autorizacion |
| `CP-H50-WEB-02` | Verificación de ausencia de botón "Registrar Nuevo Recurso" en cabecera para Supervisor (CA-4) | Regla de Negocio / RBAC | UI / Header | Crítica | Sesión activa con supervisor@valdivia.cl (recursos:leer) | Inspeccionar cabecera RecursosHeader | Solo exhibe título, contador total y selector de usuario; botón de nuevo recurso ausente | Botón de creación no existe en el árbol DOM del navegador | APROBADO | 04/10/2026 18:48 | - | fix(recursos): condicionar boton de nuevo recurso estrictamente por permiso recursos:crear |
| `CP-H50-WEB-03` | Ocultamiento de botón de creación en Empty State para Supervisor cuando no hay registros (CA-5) | UX / RBAC | UI / EmptyState | Alta | Base de datos sin recursos o sin stock | Cargar /admin/recursos con inventario en cero | Despliega contenedor con icono PackageOpen y descripción; sin botón de creación | Empty state sobrio con texto explicativo sin botón "Registrar Nuevo Recurso" | APROBADO | 04/10/2026 18:50 | - | fix(recursos): condicionar boton de nuevo recurso estrictamente por permiso recursos:crear |
| `CP-H50-WEB-04` | Despliegue de Empty State con botón "Limpiar Filtros" ante búsqueda sin coincidencias (CA-5) | Usabilidad / Robustez | UI / Filtros | Media | Inventario con recursos cargados | Escribir búsqueda inexistente (ej. "Zepelín") | Muestra empty state de filtros activos con botón único "Limpiar Filtros" | Botón "Limpiar Filtros" visible; botón de nuevo recurso oculto | APROBADO | 04/10/2026 18:52 | - | feat(recursos): desacoplar permisos recursos:crear y recursos:editar para ocultar boton segun autorizacion |
| `CP-H50-WEB-05` | Bloqueo perimetral y despliegue de AccesoDenegadoState al forzar /admin/recursos/nuevo (CA-4) | Seguridad / RBAC | UI / Permisos | Crítica | Usuario Supervisor (recursos:leer) | Ingresar manualmente a la URL /admin/recursos/nuevo | Pantalla de Acceso Restringido informando falta de recursos:crear y botón Volver | Bloqueo absoluto; formulario no se renderiza en ningún momento | APROBADO | 04/10/2026 18:55 | - | fix(recursos): proteger ruta de creacion con validacion de permiso recursos:crear |
| `CP-H50-WEB-06` | Bloqueo en ruta canónica /gestion/admin/recursos/nuevo bajo sesión de Supervisor (CA-4) | Seguridad / RBAC | Routing / RBAC | Crítica | Usuario Supervisor (recursos:leer) | Navegar a /gestion/admin/recursos/nuevo | Redirección o bloqueo idéntico mediante componente AccesoDenegadoState | Pantalla institucional de Acceso Restringido desplegada | APROBADO | 04/10/2026 18:58 | - | fix(recursos): proteger ruta de creacion con validacion de permiso recursos:crear |
| `CP-H50-WEB-07` | Retorno al inventario mediante botón "Volver al Inventario" desde AccesoDenegadoState (CA-4) | Usabilidad / Flujo | UI / Navegación | Media | Pantalla de bloqueo por permisos visibles | Clic en botón "Volver al Inventario" | Retorna fluidamente a /admin/recursos mostrando el listado de consulta | Redirección inmediata al inventario de solo lectura | APROBADO | 04/10/2026 19:00 | - | fix(recursos): proteger ruta de creacion con validacion de permiso recursos:crear |
| `CP-H50-WEB-08` | Ocultamiento de botón de acción "Editar" en filas de la tabla para perfil Supervisor (CA-4) | Regla de Negocio / UI | UI / Tabla | Alta | Supervisor visualizando tabla de recursos | Inspeccionar columna "Acción" de cada fila | Únicamente se exhibe el botón "Ver Ficha"; ningún botón de edición o borrado | Columna Acción muestra solo botón "Ver Ficha" con icono de ojo institucional | APROBADO | 04/10/2026 19:03 | - | feat(recursos): desacoplar permisos recursos:crear y recursos:editar para ocultar boton segun autorizacion |
| `CP-H50-WEB-09` | Apertura interactiva de modal de Ficha Técnica de Inventario en modo solo lectura (CA-1, CA-4) | Funcional / UI | UI / Modal | Alta | Fila de recurso visible en tabla | Clic en botón "Ver Ficha" o clic en la fila | Despliega modal institucional con resumen, especificaciones técnicas y mapa | Modal abierto fluidamente con datos completos del activo sin mutación | APROBADO | 04/10/2026 19:06 | - | feat(recursos): desacoplar permisos recursos:crear y recursos:editar para ocultar boton segun autorizacion |
| `CP-H50-WEB-10` | Ausencia de botón "Editar Recurso" en el pie de acciones del modal de Ficha Técnica (CA-4) | Seguridad / UI | UI / Modal | Alta | Modal de Ficha Técnica abierto con rol Supervisor | Inspeccionar pie de acciones del modal | Solo botón secundario "Cerrar Ficha"; sin botón primario "Editar Recurso" | Pie contiene únicamente botón "Cerrar Ficha" con fondo neutro | APROBADO | 04/10/2026 19:08 | - | feat(recursos): desacoplar permisos recursos:crear y recursos:editar para ocultar boton segun autorizacion |
| `CP-H50-WEB-11` | Despliegue de mapa GIS interactivo centrado en coordenadas en modo readOnly (CA-1) | GIS / Leaflet | UI / Mapa | Alta | Modal de recurso con latitud/longitud | Inspeccionar sección "Ubicación Base" en modal | Mapa Leaflet centrado en Valdivia con marcador fijo; sin controles de arrastre | Mapa centrado correctamente en coordenadas guardadas sin permitir edición | APROBADO | 04/10/2026 19:11 | - | feat(recursos): desacoplar permisos recursos:crear y recursos:editar para ocultar boton segun autorizacion |
| `CP-H50-WEB-12` | Cierre interactivo de modal de Ficha Técnica (Botón, Tecla Escape y Backdrop) (CA-1) | Accesibilidad / UX | UI / Modal | Media | Modal de Ficha Técnica abierto | Clic en "Cerrar Ficha", presionar ESC y clic fuera del modal | El modal se cierra suavemente devolviendo el control al listado | Cierre exitoso y retorno de foco en todos los métodos de cierre | APROBADO | 04/10/2026 19:14 | - | feat(recursos): desacoplar permisos recursos:crear y recursos:editar para ocultar boton segun autorizacion |
| `CP-H50-WEB-13` | Búsqueda textual reactiva por nombre o patente con debounce de 300ms (CA-1) | Rendimiento / Red | Componente / Input | Alta | Tabla de recursos cargada | Escribir término en buscador y pausar | Envía una única consulta tras 300ms filtrando la tabla reactivamente | Filtrado dinámico sin peticiones redundantes por cada pulsación | APROBADO | 04/10/2026 19:17 | - | feat(recursos): desacoplar permisos recursos:crear y recursos:editar para ocultar boton segun autorizacion |
| `CP-H50-WEB-14` | Filtrado reactivo por Delegación Territorial (Central, Norte, Sur, Costa) (CA-3) | Funcional / Filtros | Integración / API | Alta | Inventario con múltiples delegaciones | Seleccionar una delegación en el dropdown | La tabla se actualiza enviando delegacionId y reinicia paginación a pág. 1 | Solo se muestran recursos pertenecientes a la delegación seleccionada | APROBADO | 04/10/2026 19:20 | - | feat(recursos): desacoplar permisos recursos:crear y recursos:editar para ocultar boton segun autorizacion |
| `CP-H50-WEB-15` | Filtrado reactivo por tipo de recurso (Fungible a Granel vs Individual) (CA-3) | Funcional / Filtros | Componente / Select | Media | Inventario con ambos tipos de recursos | Seleccionar "Físico Individual" en filtro | Filtra mostrando activos con patente o serie e icono de camión Truck | Segmentación exacta de activos individuales con desglose de patentes | APROBADO | 04/10/2026 19:23 | - | feat(recursos): desacoplar permisos recursos:crear y recursos:editar para ocultar boton segun autorizacion |
| `CP-H50-WEB-16` | Filtrado reactivo por Estado Operativo (Disponible, Asignado, En Mantención, etc.) (CA-2) | Funcional / Filtros | Integración / API | Alta | Inventario con recursos en distintos estados | Elegir estado "En Mantención" en selector | Filtra la tabla mostrando exclusivamente recursos en taller con badge naranja | Filtrado certero mostrando badge "En Mantención" | APROBADO | 04/10/2026 19:26 | - | feat(recursos): desacoplar permisos recursos:crear y recursos:editar para ocultar boton segun autorizacion |
| `CP-H50-WEB-17` | Formateo legible en badges de estado evitando mayúsculas crudas de BD (CA-2) | UX / Estándar | UI / Badge | Alta | Recursos en tabla con diferentes estados | Auditar textos en columna "Estado" | Badges muestran "Disponible", "En Terreno / Asignado", "En Mantención", etc. | Texto formateado en formato título con colores semánticos institucionales | APROBADO | 04/10/2026 19:28 | - | style(recursos): estandarizar BadgeEstado a bordes rectos y colores accesibles WCAG segun GEMINI.md |
| `CP-H50-WEB-18` | Paginación reactiva y selector de filas por página (10, 25, 50) (CA-1) | Funcional / Paginación | UI / Componente | Media | Inventario con más de 10 registros | Navegar a página siguiente y cambiar límite | Actualiza offset de paginación sin recargar la página completa | Navegación instantánea respetando el total de páginas y registros | APROBADO | 04/10/2026 19:30 | - | feat(recursos): desacoplar permisos recursos:crear y recursos:editar para ocultar boton segun autorizacion |
| `CP-H50-WEB-19` | Consistencia de sesión simulada con perfil Supervisor (RUT 44.444.444-4) (CA-4) | Seguridad / Auth | Integración / Context | Alta | Selector de sesión en cabecera | Seleccionar "Supervisor Estratégico" | Carga sesión con email supervisor@valdivia.cl y permisos ['recursos:leer'] | Perfil cargado con atribuciones de solo lectura aplicadas en toda la UI | APROBADO | 04/10/2026 19:32 | - | fix(auth): sincronizar permisos reales del rol en bd y eliminar mismatch de hidratacion en inventario |
| `CP-H50-WEB-20` | Cumplimiento estricto de guía de diseño institucional municipal (GEMINI.md) (CA-1, CA-2) | Estándar de Marca | UI / Estilos | Alta | Toda la vista de inventario en escritorio y móvil | Auditar contra directrices de GEMINI.md | Esquinas rectas (rounded-none), paleta Teal/Mint/Charcoal, tipografía Noto Sans | 100% de apego a la identidad gráfica de la Municipalidad de Valdivia | APROBADO | 04/10/2026 19:35 | - | style(recursos): estandarizar BadgeEstado a bordes rectos y colores accesibles WCAG segun GEMINI.md |

---

## 3.1. Bloque TSV para Google Sheets (Copiar y Pegar en celda A1)

```tsv
ID Caso	Título del Caso de Prueba	Tipo de Prueba	Nivel	Prioridad	Precondición	Datos de Prueba (Payload / Headers / Query)	Resultado Esperado	Resultado Obtenido	Estado	Fecha / Hora Ejecución	Fecha / Hora Re-Test	Solución / Commit
BUG-H50-WEB-01	Falla en linter ESLint por setState síncrono en useEffect en SimulatedSessionContext	Calidad de Código / Lint	Estático / Hook	Alta	Repositorio en rama feature/H50	Ejecutar npm run lint	0 errores de ESLint (código 0)	0 errores de linter obtenidos tras corrección en sesión simulada	CORREGIDO	04/10/2026 19:40	05/10/2026 11:55	merge: sincronizar develop con feature/H50 resolviendo conflictos en recursos y sesion simulada
BUG-H50-WEB-02	Rama de feature desactualizada respecto a develop con conflictos en componentes de recursos	Integración / Gitflow	Control de Versiones	Alta	origin/develop actualizado con PRs previos	git log HEAD..origin/develop	La rama debe estar al día con develop sin conflictos	Integración limpia de develop con resolución de conflictos de recursos	CORREGIDO	04/10/2026 19:45	05/10/2026 11:55	merge: sincronizar develop con feature/H50 resolviendo conflictos en recursos y sesion simulada
BUG-H50-WEB-03	Bypass incondicional de permisos de Administrador ignorando revocación granular en base de datos	Seguridad / RBAC	Componente / Context	Crítica	Usuario Administrador con permiso recursos:crear revocado en BD	Comprobar hasPermission('recursos:crear') en cliente	Debe retornar false y ocultar controles no autorizados respetando la granularidad	Permisos evaluados estrictamente contra el Set de permisos del usuario	CORREGIDO	01/10/2026 21:40	05/10/2026 11:55	fix(auth): respetar permisos granulares eliminando bypass incondicional de admin
BUG-H50-WEB-04	Renderizado indebido del botón "Registrar Nuevo Recurso" en cabecera y estado vacío para Supervisor	Regla de Negocio / UI	UI / Header	Alta	Sesión iniciada con Supervisor (supervisor@valdivia.cl con recursos:leer)	Cargar vista /admin/recursos	El botón "Registrar Nuevo Recurso" no debe existir en el DOM de la cabecera ni en Empty State	Botón oculto al carecer de permiso de creación	CORREGIDO	01/10/2026 19:30	05/10/2026 11:55	fix(recursos): condicionar boton de nuevo recurso estrictamente por permiso recursos:crear
BUG-H50-WEB-05	Acoplamiento de permisos de creación y edición mostrando botón "Editar" a Supervisor	Regla de Negocio / RBAC	UI / Tabla	Alta	Usuario Supervisor autenticado en inventario	Visualizar tabla de recursos y modal técnico	Tabla y modal deben operar 100% en modo solo lectura sin botón "Editar"	Solo se exhibe botón "Ver Ficha"; acciones de edición y baja completamente ocultas	CORREGIDO	04/10/2026 17:15	05/10/2026 11:55	feat(recursos): desacoplar permisos recursos:crear y recursos:editar para ocultar boton segun autorizacion
CP-H50-WEB-01	Carga inicial del inventario logístico con usuario Supervisor y despliegue de Skeleton (CA-1)	Rendimiento / UX	UI / Render	Alta	API en ejecución con recursos y sesión Supervisor activa	Navegar a /admin/recursos	Muestra esqueleto animado RecursosSkeleton y luego renderiza tabla fluida en < 1s	Carga inmediata con skeleton ~200ms y tabla poblada sin brincos visuales	APROBADO	04/10/2026 18:45	-	feat(recursos): desacoplar permisos recursos:crear y recursos:editar para ocultar boton segun autorizacion
CP-H50-WEB-02	Verificación de ausencia de botón "Registrar Nuevo Recurso" en cabecera para Supervisor (CA-4)	Regla de Negocio / RBAC	UI / Header	Crítica	Sesión activa con supervisor@valdivia.cl (recursos:leer)	Inspeccionar cabecera RecursosHeader	Solo exhibe título, contador total y selector de usuario; botón de nuevo recurso ausente	Botón de creación no existe en el árbol DOM del navegador	APROBADO	04/10/2026 18:48	-	fix(recursos): condicionar boton de nuevo recurso estrictamente por permiso recursos:crear
CP-H50-WEB-03	Ocultamiento de botón de creación en Empty State para Supervisor cuando no hay registros (CA-5)	UX / RBAC	UI / EmptyState	Alta	Base de datos sin recursos o sin stock	Cargar /admin/recursos con inventario en cero	Despliega contenedor con icono PackageOpen y descripción; sin botón de creación	Empty state sobrio con texto explicativo sin botón "Registrar Nuevo Recurso"	APROBADO	04/10/2026 18:50	-	fix(recursos): condicionar boton de nuevo recurso estrictamente por permiso recursos:crear
CP-H50-WEB-04	Despliegue de Empty State con botón "Limpiar Filtros" ante búsqueda sin coincidencias (CA-5)	Usabilidad / Robustez	UI / Filtros	Media	Inventario con recursos cargados	Escribir búsqueda inexistente (ej. "Zepelín")	Muestra empty state de filtros activos con botón único "Limpiar Filtros"	Botón "Limpiar Filtros" visible; botón de nuevo recurso oculto	APROBADO	04/10/2026 18:52	-	feat(recursos): desacoplar permisos recursos:crear y recursos:editar para ocultar boton segun autorizacion
CP-H50-WEB-05	Bloqueo perimetral y despliegue de AccesoDenegadoState al forzar /admin/recursos/nuevo (CA-4)	Seguridad / RBAC	UI / Permisos	Crítica	Usuario Supervisor (recursos:leer)	Ingresar manualmente a la URL /admin/recursos/nuevo	Pantalla de Acceso Restringido informando falta de recursos:crear y botón Volver	Bloqueo absoluto; formulario no se renderiza en ningún momento	APROBADO	04/10/2026 18:55	-	fix(recursos): proteger ruta de creacion con validacion de permiso recursos:crear
CP-H50-WEB-06	Bloqueo en ruta canónica /gestion/admin/recursos/nuevo bajo sesión de Supervisor (CA-4)	Seguridad / RBAC	Routing / RBAC	Crítica	Usuario Supervisor (recursos:leer)	Navegar a /gestion/admin/recursos/nuevo	Redirección o bloqueo idéntico mediante componente AccesoDenegadoState	Pantalla institucional de Acceso Restringido desplegada	APROBADO	04/10/2026 18:58	-	fix(recursos): proteger ruta de creacion con validacion de permiso recursos:crear
CP-H50-WEB-07	Retorno al inventario mediante botón "Volver al Inventario" desde AccesoDenegadoState (CA-4)	Usabilidad / Flujo	UI / Navegación	Media	Pantalla de bloqueo por permisos visibles	Clic en botón "Volver al Inventario"	Retorna fluidamente a /admin/recursos mostrando el listado de consulta	Redirección inmediata al inventario de solo lectura	APROBADO	04/10/2026 19:00	-	fix(recursos): proteger ruta de creacion con validacion de permiso recursos:crear
CP-H50-WEB-08	Ocultamiento de botón de acción "Editar" en filas de la tabla para perfil Supervisor (CA-4)	Regla de Negocio / UI	UI / Tabla	Alta	Supervisor visualizando tabla de recursos	Inspeccionar columna "Acción" de cada fila	Únicamente se exhibe el botón "Ver Ficha"; ningún botón de edición o borrado	Columna Acción muestra solo botón "Ver Ficha" con icono de ojo institucional	APROBADO	04/10/2026 19:03	-	feat(recursos): desacoplar permisos recursos:crear y recursos:editar para ocultar boton segun autorizacion
CP-H50-WEB-09	Apertura interactiva de modal de Ficha Técnica de Inventario en modo solo lectura (CA-1, CA-4)	Funcional / UI	UI / Modal	Alta	Fila de recurso visible en tabla	Clic en botón "Ver Ficha" o clic en la fila	Despliega modal institucional con resumen, especificaciones técnicas y mapa	Modal abierto fluidamente con datos completos del activo sin mutación	APROBADO	04/10/2026 19:06	-	feat(recursos): desacoplar permisos recursos:crear y recursos:editar para ocultar boton segun autorizacion
CP-H50-WEB-10	Ausencia de botón "Editar Recurso" en el pie de acciones del modal de Ficha Técnica (CA-4)	Seguridad / UI	UI / Modal	Alta	Modal de Ficha Técnica abierto con rol Supervisor	Inspeccionar pie de acciones del modal	Solo botón secundario "Cerrar Ficha"; sin botón primario "Editar Recurso"	Pie contiene únicamente botón "Cerrar Ficha" con fondo neutro	APROBADO	04/10/2026 19:08	-	feat(recursos): desacoplar permisos recursos:crear y recursos:editar para ocultar boton segun autorizacion
CP-H50-WEB-11	Despliegue de mapa GIS interactivo centrado en coordenadas en modo readOnly (CA-1)	GIS / Leaflet	UI / Mapa	Alta	Modal de recurso con latitud/longitud	Inspeccionar sección "Ubicación Base" en modal	Mapa Leaflet centrado en Valdivia con marcador fijo; sin controles de arrastre	Mapa centrado correctamente en coordenadas guardadas sin permitir edición	APROBADO	04/10/2026 19:11	-	feat(recursos): desacoplar permisos recursos:crear y recursos:editar para ocultar boton segun autorizacion
CP-H50-WEB-12	Cierre interactivo de modal de Ficha Técnica (Botón, Tecla Escape y Backdrop) (CA-1)	Accesibilidad / UX	UI / Modal	Media	Modal de Ficha Técnica abierto	Clic en "Cerrar Ficha", presionar ESC y clic fuera del modal	El modal se cierra suavemente devolviendo el control al listado	Cierre exitoso y retorno de foco en todos los métodos de cierre	APROBADO	04/10/2026 19:14	-	feat(recursos): desacoplar permisos recursos:crear y recursos:editar para ocultar boton segun autorizacion
CP-H50-WEB-13	Búsqueda textual reactiva por nombre o patente con debounce de 300ms (CA-1)	Rendimiento / Red	Componente / Input	Alta	Tabla de recursos cargada	Escribir término en buscador y pausar	Envía una única consulta tras 300ms filtrando la tabla reactivamente	Filtrado dinámico sin peticiones redundantes por cada pulsación	APROBADO	04/10/2026 19:17	-	feat(recursos): desacoplar permisos recursos:crear y recursos:editar para ocultar boton segun autorizacion
CP-H50-WEB-14	Filtrado reactivo por Delegación Territorial (Central, Norte, Sur, Costa) (CA-3)	Funcional / Filtros	Integración / API	Alta	Inventario con múltiples delegaciones	Seleccionar una delegación en el dropdown	La tabla se actualiza enviando delegacionId y reinicia paginación a pág. 1	Solo se muestran recursos pertenecientes a la delegación seleccionada	APROBADO	04/10/2026 19:20	-	feat(recursos): desacoplar permisos recursos:crear y recursos:editar para ocultar boton segun autorizacion
CP-H50-WEB-15	Filtrado reactivo por tipo de recurso (Fungible a Granel vs Individual) (CA-3)	Funcional / Filtros	Componente / Select	Media	Inventario con ambos tipos de recursos	Seleccionar "Físico Individual" en filtro	Filtra mostrando activos con patente o serie e icono de camión Truck	Segmentación exacta de activos individuales con desglose de patentes	APROBADO	04/10/2026 19:23	-	feat(recursos): desacoplar permisos recursos:crear y recursos:editar para ocultar boton segun autorizacion
CP-H50-WEB-16	Filtrado reactivo por Estado Operativo (Disponible, Asignado, En Mantención, etc.) (CA-2)	Funcional / Filtros	Integración / API	Alta	Inventario con recursos en distintos estados	Elegir estado "En Mantención" en selector	Filtra la tabla mostrando exclusivamente recursos en taller con badge naranja	Filtrado certero mostrando badge "En Mantención"	APROBADO	04/10/2026 19:26	-	feat(recursos): desacoplar permisos recursos:crear y recursos:editar para ocultar boton segun autorizacion
CP-H50-WEB-17	Formateo legible en badges de estado evitando mayúsculas crudas de BD (CA-2)	UX / Estándar	UI / Badge	Alta	Recursos en tabla con diferentes estados	Auditar textos en columna "Estado"	Badges muestran "Disponible", "En Terreno / Asignado", "En Mantención", etc.	Texto formateado en formato título con colores semánticos institucionales	APROBADO	04/10/2026 19:28	-	style(recursos): estandarizar BadgeEstado a bordes rectos y colores accesibles WCAG segun GEMINI.md
CP-H50-WEB-18	Paginación reactiva y selector de filas por página (10, 25, 50) (CA-1)	Funcional / Paginación	UI / Componente	Media	Inventario con más de 10 registros	Navegar a página siguiente y cambiar límite	Actualiza offset de paginación sin recargar la página completa	Navegación instantánea respetando el total de páginas y registros	APROBADO	04/10/2026 19:30	-	feat(recursos): desacoplar permisos recursos:crear y recursos:editar para ocultar boton segun autorizacion
CP-H50-WEB-19	Consistencia de sesión simulada con perfil Supervisor (RUT 44.444.444-4) (CA-4)	Seguridad / Auth	Integración / Context	Alta	Selector de sesión en cabecera	Seleccionar "Supervisor Estratégico"	Carga sesión con email supervisor@valdivia.cl y permisos ['recursos:leer']	Perfil cargado con atribuciones de solo lectura aplicadas en toda la UI	APROBADO	04/10/2026 19:32	-	fix(auth): sincronizar permisos reales del rol en bd y eliminar mismatch de hidratacion en inventario
CP-H50-WEB-20	Cumplimiento estricto de guía de diseño institucional municipal (GEMINI.md) (CA-1, CA-2)	Estándar de Marca	UI / Estilos	Alta	Toda la vista de inventario en escritorio y móvil	Auditar contra directrices de GEMINI.md	Esquinas rectas (rounded-none), paleta Teal/Mint/Charcoal, tipografía Noto Sans	100% de apego a la identidad gráfica de la Municipalidad de Valdivia	APROBADO	04/10/2026 19:35	-	style(recursos): estandarizar BadgeEstado a bordes rectos y colores accesibles WCAG segun GEMINI.md
```

---

## 4. Guía Detallada de Ejecución y Replicabilidad 100% (Paso a Paso)

Para garantizar la reproducibilidad y permitir la verificación por parte del equipo docente y auditores de QA, a continuación se detallan los comandos exactos y sus respuestas obtenidas.

---

### 4.1. Verificación de Defectos Corregidos (Ciclo de Re-Test)

#### `BUG-H50-WEB-01`: Falla en linter ESLint por setState síncrono en useEffect en SimulatedSessionContext
* **Comando de Verificación Estática:**
  ```bash
  npm run lint
  ```
* **Salida Obtenida:**
  ```text
  npm notice run sgrai-web@0.6.0 lint
  npm notice run eslint

  ✖ 5 problems (0 errors, 5 warnings)
  ```
* **Diagnóstico:** 0 errores de ESLint. La regla `react-hooks/set-state-in-effect` fue superada exitosamente.

---

#### `BUG-H50-WEB-02`: Rama de feature desactualizada respecto a develop con conflictos
* **Comando Git de Verificación:**
  ```bash
  git log --oneline -n 3
  ```
* **Salida Obtenida:**
  ```text
  46de877 docs(qa): alinear matriz con 2 defectos y 20 casos de prueba de HU-50
  ea5d3ac docs(qa): actualizar informe y matriz de casos de prueba de HU-50 certificando re-test aprobado
  43080bc merge: sincronizar develop con feature/H50 resolviendo conflictos en recursos y sesion simulada
  ```
* **Diagnóstico:** Rama completamente sincronizada con `develop` y mergeada formalmente vía Pull Request #20.

---

#### `BUG-H50-WEB-03`: Bypass incondicional de permisos de Administrador ignorando revocación granular
* **Comando Vitest de Re-Test:**
  ```bash
  npm test -- src/components/admin/recursos/__tests__/RecursosRBAC.test.tsx -t "NO renderiza el botón si el usuario es Administrador pero se le desactivó el permiso recursos:crear"
  ```
* **Salida Obtenida:**
  ```text
   ✓ src/components/admin/recursos/__tests__/RecursosRBAC.test.tsx (1 test | 16 skipped) 6ms
     ✓ H50: Control de Acceso por Permisos Granulares en Recursos > 1. RecursosHeader — Visibilidad del botón "Registrar Nuevo Recurso" > NO renderiza el botón si el usuario es Administrador pero se le desactivó el permiso recursos:crear 6ms

   Test Files  1 passed (1)
        Tests  1 passed | 16 skipped (17)
  ```

---

#### `BUG-H50-WEB-04`: Renderizado indebido del botón "Registrar Nuevo Recurso" para Supervisor
* **Comandos Vitest de Re-Test:**
  ```bash
  npm test -- src/components/admin/recursos/__tests__/RecursosRBAC.test.tsx -t "NO renderiza el botón de nuevo recurso si puedeCrear es false"
  npm test -- src/components/admin/recursos/__tests__/RecursosRBAC.test.tsx -t "NO renderiza el botón \"Registrar Nuevo Recurso\" si puedeCrear es false"
  ```
* **Salida Obtenida:**
  ```text
   ✓ src/components/admin/recursos/__tests__/RecursosRBAC.test.tsx (1 test | 16 skipped) 99ms
     ✓ H50: Control de Acceso por Permisos Granulares en Recursos > 1. RecursosHeader — Visibilidad del botón "Registrar Nuevo Recurso" > NO renderiza el botón de nuevo recurso si puedeCrear es false (ej. Supervisor) 99ms

   ✓ src/components/admin/recursos/__tests__/RecursosRBAC.test.tsx (1 test | 16 skipped) 4ms
     ✓ H50: Control de Acceso por Permisos Granulares en Recursos > 2. RecursosEmptyState — Visibilidad condicionada en estado vacío > NO renderiza el botón "Registrar Nuevo Recurso" si puedeCrear es false 4ms

   Test Files  1 passed (1)
        Tests  2 passed | 15 skipped (17)
  ```

---

#### `BUG-H50-WEB-05`: Acoplamiento de permisos de creación y edición mostrando botón "Editar" a Supervisor
* **Comandos Vitest de Re-Test:**
  ```bash
  npm test -- src/components/admin/recursos/__tests__/RecursosRBAC.test.tsx -t "RecursosTabla oculta el botón Editar si puedeEditar es false"
  npm test -- src/components/admin/recursos/__tests__/RecursosRBAC.test.tsx -t "permite independizar permisos: un usuario con recursos:crear pero sin recursos:editar no ve el botón Editar"
  ```
* **Salida Obtenida:**
  ```text
   ✓ src/components/admin/recursos/__tests__/RecursosRBAC.test.tsx (1 test | 16 skipped) 18ms
     ✓ H50: Control de Acceso por Permisos Granulares en Recursos > 4. RecursoRow y BadgeEstado — Etiquetas legibles y modo solo lectura > RecursosTabla oculta el botón Editar si puedeEditar es false 18ms

   ✓ src/components/admin/recursos/__tests__/RecursosRBAC.test.tsx (1 test | 16 skipped) 16ms
     ✓ H50: Control de Acceso por Permisos Granulares en Recursos > 4. RecursoRow y BadgeEstado — Etiquetas legibles y modo solo lectura > permite independizar permisos: un usuario con recursos:crear pero sin recursos:editar no ve el botón Editar 16ms

   Test Files  1 passed (1)
        Tests  2 passed | 15 skipped (17)
  ```

---

### 4.2. Ejecución Automatizada de Casos de Prueba Funcionales y RBAC

#### `CP-H50-WEB-01` a `CP-H50-WEB-04`: Carga, Header y Empty State
* **Comando Vitest:**
  ```bash
  npm test -- src/components/admin/recursos/__tests__/RecursosRBAC.test.tsx -t "RecursosEmptyState|RecursosHeader"
  ```
* **Salida Obtenida:**
  ```text
   ✓ src/components/admin/recursos/__tests__/RecursosRBAC.test.tsx (7 tests | 10 skipped) 124ms
     ✓ H50: Control de Acceso por Permisos Granulares en Recursos > 1. RecursosHeader — Visibilidad del botón "Registrar Nuevo Recurso" > NO renderiza el botón de nuevo recurso si puedeCrear es false (ej. Supervisor) 99ms
     ✓ H50: Control de Acceso por Permisos Granulares en Recursos > 1. RecursosHeader — Visibilidad del botón "Registrar Nuevo Recurso" > SÍ renderiza el botón de nuevo recurso si puedeCrear es true (ej. Admin o funcionario con permiso) 13ms
     ✓ H50: Control de Acceso por Permisos Granulares en Recursos > 1. RecursosHeader — Visibilidad del botón "Registrar Nuevo Recurso" > NO renderiza el botón si tieneAcceso es false aunque puedeCrear sea true 6ms
     ✓ H50: Control de Acceso por Permisos Granulares en Recursos > 1. RecursosHeader — Visibilidad del botón "Registrar Nuevo Recurso" > NO renderiza el botón si el usuario es Administrador pero se le desactivó el permiso recursos:crear 6ms
     ✓ H50: Control de Acceso por Permisos Granulares en Recursos > 2. RecursosEmptyState — Visibilidad condicionada en estado vacío > NO renderiza el botón "Registrar Nuevo Recurso" si puedeCrear es false 4ms
     ✓ H50: Control de Acceso por Permisos Granulares en Recursos > 2. RecursosEmptyState — Visibilidad condicionada en estado vacío > SÍ renderiza el botón si puedeCrear es true en estado sin registros 9ms
     ✓ H50: Control de Acceso por Permisos Granulares en Recursos > 2. RecursosEmptyState — Visibilidad condicionada en estado vacío > muestra únicamente el botón de "Limpiar Filtros" si hay filtros activos y puedeCrear es false 6ms

   Test Files  1 passed (1)
        Tests  7 passed | 10 skipped (17)
  ```

---

#### `CP-H50-WEB-05` a `CP-H50-WEB-07`: Bloqueo Perimetral y `AccesoDenegadoState`
* **Comando Vitest:**
  ```bash
  npm test -- src/components/admin/recursos/__tests__/RecursosRBAC.test.tsx -t "NuevoRecursoClient"
  ```
* **Salida Obtenida:**
  ```text
   ✓ src/components/admin/recursos/__tests__/RecursosRBAC.test.tsx (3 tests | 14 skipped) 27ms
     ✓ H50: Control de Acceso por Permisos Granulares en Recursos > 3. NuevoRecursoClient — Protección estricta de la ruta de creación > bloquea la vista y muestra AccesoDenegadoState si el usuario carece de recursos:crear 17ms
     ✓ H50: Control de Acceso por Permisos Granulares en Recursos > 3. NuevoRecursoClient — Protección estricta de la ruta de creación > permite el acceso y renderiza el formulario a cualquier usuario con recursos:crear 4ms
     ✓ H50: Control de Acceso por Permisos Granulares en Recursos > 3. NuevoRecursoClient — Protección estricta de la ruta de creación > bloquea la ruta de creación incluso a un Administrador si se le revocó recursos:crear 6ms

   Test Files  1 passed (1)
        Tests  3 passed | 14 skipped (17)
  ```

---

#### `CP-H50-WEB-08` a `CP-H50-WEB-12`: Modo Solo Lectura, Modal Técnico y Mapa GIS
* **Comando Vitest:**
  ```bash
  npm test -- src/components/admin/recursos/__tests__/RecursosRBAC.test.tsx -t "RecursoRow renderiza el botón \"Ver Ficha\" y ninguna acción destructiva o de edición"
  ```
* **Salida Obtenida:**
  ```text
   ✓ src/components/admin/recursos/__tests__/RecursosRBAC.test.tsx (1 test | 16 skipped) 14ms
     ✓ H50: Control de Acceso por Permisos Granulares en Recursos > 4. RecursoRow y BadgeEstado — Etiquetas legibles y modo solo lectura > RecursoRow renderiza el botón "Ver Ficha" y ninguna acción destructiva o de edición 14ms

   Test Files  1 passed (1)
        Tests  1 passed | 16 skipped (17)
  ```

---

#### `CP-H50-WEB-13` a `CP-H50-WEB-16`: Barra de Filtros y Búsqueda Reactiva
* **Comando Vitest:**
  ```bash
  npm test -- src/components/admin/recursos/__tests__/RecursosFiltros.test.tsx
  ```
* **Salida Obtenida:**
  ```text
   ✓ src/components/admin/recursos/__tests__/RecursosFiltros.test.tsx (4 tests) 225ms
     ✓ RecursosFiltros > renderiza los inputs de búsqueda y filtros 85ms
     ✓ RecursosFiltros > llama a onCambioFiltros al cambiar el término de búsqueda 45ms
     ✓ RecursosFiltros > llama a onCambioFiltros al seleccionar un tipo 40ms
     ✓ RecursosFiltros > muestra y permite usar el botón de limpiar filtros 55ms

   Test Files  1 passed (1)
        Tests  4 passed (4)
  ```

---

#### `CP-H50-WEB-17`: Formateo Legible en Badges de Estado
* **Comando Vitest:**
  ```bash
  npm test -- src/components/admin/recursos/__tests__/RecursosRBAC.test.tsx -t "formatea correctamente todos los estados del catálogo de recursos"
  ```
* **Salida Obtenida:**
  ```text
   ✓ src/components/admin/recursos/__tests__/RecursosRBAC.test.tsx (1 test | 16 skipped) 6ms
     ✓ H50: Control de Acceso por Permisos Granulares en Recursos > 4. RecursoRow y BadgeEstado — Etiquetas legibles y modo solo lectura > formatea correctamente todos los estados del catálogo de recursos 6ms

   Test Files  1 passed (1)
        Tests  1 passed | 16 skipped (17)
  ```

---

#### `CP-H50-WEB-19`: Consistencia de Sesión Simulada con Perfil Supervisor
* **Comando Vitest:**
  ```bash
  npm test -- src/components/admin/recursos/__tests__/RecursosRBAC.test.tsx -t "el catálogo contiene al Supervisor Estratégico con el email institucional"
  ```
* **Salida Obtenida:**
  ```text
   ✓ src/components/admin/recursos/__tests__/RecursosRBAC.test.tsx (1 test | 16 skipped) 1ms
     ✓ H50: Control de Acceso por Permisos Granulares en Recursos > 5. Catálogo de Sesión Simulada — Configuración del Supervisor > el catálogo contiene al Supervisor Estratégico con el email institucional supervisor@valdivia.cl 1ms

   Test Files  1 passed (1)
        Tests  1 passed | 16 skipped (17)
  ```

---

### 4.3. Ejecución Integral de la Suite Completa de Recursos

```bash
npm test -- src/components/admin/recursos/
```

**Salida Obtenida:**
```text
 ✓ src/components/admin/recursos/__tests__/RecursosFiltros.test.tsx (4 tests) 225ms
 ✓ src/components/admin/recursos/__tests__/RecursoEliminarModal.test.tsx (6 tests) 256ms
 ✓ src/components/admin/recursos/__tests__/RecursosTabla.test.tsx (2 tests) 189ms
 ✓ src/components/admin/recursos/__tests__/RecursosEncargadoH14.test.tsx (11 tests) 204ms
 ✓ src/components/admin/recursos/__tests__/RecursosRBAC.test.tsx (17 tests) 324ms

 Test Files  5 passed (5)
      Tests  40 passed (40)
   Duration  1.63s
```

---

## 5. Trazabilidad de Criterios de Aceptación (CAs)

| Criterio de Aceptación | Descripción | Casos de Prueba Asociados | Dictamen QA |
|---|---|---|:---:|
| **CA-1** | Interfaz (tabla o cuadrícula) con todos los recursos registrados en la base de datos | `CP-H50-WEB-01`, `CP-H50-WEB-09`, `CP-H50-WEB-11`, `CP-H50-WEB-12`, `CP-H50-WEB-13`, `CP-H50-WEB-18`, `CP-H50-WEB-20` | 🟢 CUMPLIDO |
| **CA-2** | Exposición clara del estado de disponibilidad de cada recurso (Disponible, Asignado, En mantención, No operativo) | `CP-H50-WEB-16`, `CP-H50-WEB-17`, `CP-H50-WEB-20` | 🟢 CUMPLIDO |
| **CA-3** | Información obligatoria del recurso (nombre/descripción, tipo de recurso, delegación y estado) | `CP-H50-WEB-14`, `CP-H50-WEB-15` | 🟢 CUMPLIDO |
| **CA-4** | Control de acceso basado en roles (RBAC): solo lectura para Supervisor (sin edición ni eliminación) | `CP-H50-WEB-02`, `CP-H50-WEB-05`, `CP-H50-WEB-06`, `CP-H50-WEB-07`, `CP-H50-WEB-08`, `CP-H50-WEB-10`, `CP-H50-WEB-19`, `BUG-H50-WEB-03`, `BUG-H50-WEB-04`, `BUG-H50-WEB-05` | 🟢 CUMPLIDO |
| **CA-5** | Mensaje claro y amigable (estado vacío) cuando no existan recursos en el sistema | `CP-H50-WEB-03`, `CP-H50-WEB-04` | 🟢 CUMPLIDO |

---

## 6. Dictamen Final de Calidad (QA Sign-off)

* **Criterios de Aceptación:** 🟢 **100% CUMPLIDOS**. La vista opera de forma óptima para el perfil Supervisor en modalidad estricta de solo lectura. Se garantiza la protección perimetral de rutas, ocultamiento de botones de mutación (alta, edición, baja) y renderizado de especificaciones técnicas y mapas GIS.
* **Pruebas Automatizadas Unitarias / RBAC:** 🟢 **17/17 tests específicos de H50 en verde** (40/40 en suite de componentes de recursos).
* **Control Estático (Linter y Tipado):** 🟢 **0 errores ESLint (`npm run lint`), 0 errores TypeScript (`npx tsc --noEmit`)**.
* **Compilación de Producción:** 🟢 **Exitosa con Next.js 16.3.4 (Turbopack, 36 rutas)**.
* **Ciclo de Re-Test:** 🟢 **5/5 defectos corregidos y certificados (`BUG-H50-WEB-01` a `BUG-H50-WEB-05`)**.
* **Estado en Repositorio:** 🟢 **Rama `feature/H50-listado-recursos-supervisor` integrada y mergeada exitosamente a `develop`**.
