# Informe y Matriz de Casos de Prueba de Frontend (QA): HU-50 — Listado de Recursos para Supervisor

> **Documento Oficial de Aseguramiento de Calidad (QA) — Frontend**  
> **Proyecto:** Sistema de Gestión de Recursos para Atención de Incidentes (SGRAI) — Municipalidad de Valdivia.  
> **Módulo:** Monitoreo Estratégico y Consulta de Inventario Logístico (`/admin/recursos` y `/gestion/admin/recursos`).  
> **Historia de Usuario:** HU-50 — *"Como Supervisor Quiero ver un listado de los recursos Para monitorear la disponibilidad y estado de los recursos de emergencia sin alterar los registros"*.  
> **Cliente Web:** `sgrai-web` (Next.js 16.3.4 + Turbopack + React 19 + TypeScript + Vitest).  
> **Rama Git:** `feature/H50-listado-recursos-supervisor` | **Commit Evaluado:** `eb85eb6`  
> **Fecha de Evaluación:** 04 de Octubre de 2026.  
> **Estado de Certificación:** 🟡 **OBSERVADO / EN ESPERA DE FIX DE LINTER (SUITE FUNCIONAL 100% PASS)**.

---

## 1. Resumen Ejecutivo de Pruebas de Frontend

| Métrica | Resultado |
|---|:---:|
| **Total de Casos de Prueba de UI/UX Ejecutados** | **20** |
| **Casos de Prueba Aprobados (Passed)** | **20 (100%)** |
| **Casos de Prueba Fallidos (Failed)** | **0** |
| **Total de Defectos Registrados (Bugs)** | **7** |
| **Defectos Corregidos y Verificados en Re-Test** | **6 (`BUG-H50-WEB-01` a `BUG-H50-WEB-06`)** |
| **Defectos Abiertos Pendientes de Corrección** | **1 (`BUG-H50-WEB-07` - Error ESLint en React 19)** |
| **Suites de Pruebas Unitarias / RBAC (`npm test`)** | **47/47 pasadas (267/267 tests en verde)** |
| **Compilación Producción (`npm run build`)** | **Exitosa (0 errores TypeScript en Turbopack, 26 rutas)** |
| **Análisis Estático Linter (`npm run lint`)** | **1 error (`react-hooks/set-state-in-effect`), 2 advertencias** |
| **Cumplimiento Guía Visual Municipal (`GEMINI.md`)** | **100% (Esquinas rectas `rounded-none`, paleta Teal/Mint/Charcoal)** |

---

## 2. Registro de Defectos (Bugs) Encontrados en el Ciclo de Desarrollo y QA

Siguiendo el principio de QA de registrar formalmente los incidentes, derivarlos al equipo de desarrollo y realizar el correspondiente **re-test**, a continuación se documentan los 7 defectos detectados en esta historia de usuario:

| ID Defecto | Título del Defecto | Tipo / Nivel | Prioridad | Causa Raíz / Comportamiento Anómalo | Solución Aplicada / Commit | Estado |
|---|---|---|:---:|---|---|:---:|
| `BUG-H50-WEB-01` | Renderizado indebido del botón "Registrar Nuevo Recurso" para Supervisor | Regla Negocio / UI | Alta | El botón de alta en la cabecera y en el Empty State no validaba el permiso `recursos:crear`, mostrándose a usuarios de solo lectura. | Condicionar botón estrictamente por `puedeCrear` (commit `a1b7367`). | 🟢 CORREGIDO |
| `BUG-H50-WEB-02` | Falta de protección perimetral RBAC en la ruta `/admin/recursos/nuevo` | Seguridad / RBAC | Crítica | Navegar manualmente a la URL de creación permitía visualizar el formulario sin poseer el permiso `recursos:crear`. | Creación de `NuevoRecursoClient` con bloqueo `AccesoDenegadoState` (commit `b111ed3`). | 🟢 CORREGIDO |
| `BUG-H50-WEB-03` | Bypass incondicional de permisos si el usuario poseía flag `esAdmin` | Seguridad / Context | Crítica | `hasPermission` retornaba `true` directamente si `usuario.esAdmin === true`, ignorando la revocación granular de permisos en BD. | Eliminación de bypass incondicional y evaluación estricta de `permisos.has(codigo)` (commit `52a42d8`). | 🟢 CORREGIDO |
| `BUG-H50-WEB-04` | Error de hidratación SSR y desincronización de permisos en sesión simulada | Robustez / SSR | Alta | Discrepancia entre el estado renderizado en servidor y el usuario almacenado en `localStorage` del cliente. | Sincronización diferida tras montaje (`isMounted`) y fallback reactivo (commit `b161669`). | 🟢 CORREGIDO |
| `BUG-H50-WEB-05` | Warning de React por actualización de estado durante render en `useAutoRedirectTimer` | Robustez / Hook | Media | `router.push` se invocaba de forma sincronizada dentro de `setTimeLeft`, disparando re-renders en cascada. | Desacoplamiento de `router.push` mediante efecto controlado con `hasRedirectedRef` (commit `1985ca5`). | 🟢 CORREGIDO |
| `BUG-H50-WEB-06` | Acoplamiento de permisos `recursos:crear` y `recursos:editar` mostrando botón "Editar" | Regla Negocio / UI | Alta | La tabla y el modal mostraban el botón "Editar" a cualquier usuario con permisos de lectura o creación sin validar `recursos:editar`. | Desacoplamiento de flags `puedeCrear` y `puedeEditar` en tabla y modal (commit `eb85eb6`). | 🟢 CORREGIDO |
| `BUG-H50-WEB-07` | Falla en linter ESLint por `setState` síncrono en `useEffect` en `SimulatedSessionContext.tsx` | Calidad / Linter | Alta | Invocación `setIsMounted(true)` directa en `useEffect` dispara regla `react-hooks/set-state-in-effect` en React 19. | **Pendiente desarrollador:** Envolver `setIsMounted` o inicializar sin efecto síncrono. | 🔴 ABIERTO |

---

## 3. Matriz de Casos de Prueba Frontend (Para Planilla Excel / Google Sheets)

*(Esta tabla contiene los 7 defectos y los 20 casos de prueba funcionales ejecutados para ser exportados a la hoja de cálculo de seguimiento).*

| ID Caso | Título del Caso de Prueba | Tipo de Prueba | Nivel | Prioridad | Precondición | Datos de Prueba (Payload / Headers / Query) | Resultado Esperado | Resultado Obtenido | Estado | Fecha / Hora Ejecución | Fecha / Hora Re-test | Solución / Commit |
|---|---|---|---|:---:|---|---|---|---|:---:|:---:|:---:|---|
| `BUG-H50-WEB-01` | Renderizado indebido de botón "Registrar Nuevo Recurso" en cabecera y estado vacío | Regla de Negocio / UI | UI / Componente | Alta | Sesión iniciada con Supervisor (`supervisor@valdivia.cl` con `recursos:leer`) | Cargar vista `/admin/recursos` | El botón "Registrar Nuevo Recurso" no debe existir en el DOM de la cabecera ni en Empty State | Botón se renderizaba visible e interactivo permitiendo clic hacia el formulario | CORREGIDO | 01/10/2026 19:30 | 01/10/2026 20:52 | a1b7367 fix(recursos): condicionar boton de nuevo recurso estrictamente por permiso recursos:crear |
| `BUG-H50-WEB-02` | Ausencia de protección perimetral RBAC en la ruta directa de creación /admin/recursos/nuevo | Seguridad / RBAC | UI / Permisos | Crítica | Usuario sin permiso `recursos:crear` (Supervisor) | Ingreso directo por URL a `/admin/recursos/nuevo` | Bloqueo absoluto con AccesoDenegadoState indicando permiso requerido y botón de retorno | Formulario se cargaba sin restricción permitiendo interactuar con los campos | CORREGIDO | 01/10/2026 20:15 | 01/10/2026 20:52 | b111ed3 fix(recursos): proteger ruta de creacion con validacion de permiso recursos:crear |
| `BUG-H50-WEB-03` | Bypass incondicional de permisos de Administrador ignorando revocación granular de permisos | Seguridad / RBAC | Componente / Context | Crítica | Usuario Administrador con permiso `recursos:crear` revocado en BD | Comprobar `hasPermission('recursos:crear')` en cliente | Debe retornar `false` y ocultar controles no autorizados respetando la granularidad | Retornaba `true` incondicionalmente por verificación hardcodeada de `esAdmin` | CORREGIDO | 01/10/2026 21:40 | 01/10/2026 22:21 | 52a42d8 fix(auth): respetar permisos granulares eliminando bypass incondicional de admin en comprobacion de permisos |
| `BUG-H50-WEB-04` | Discrepancia de hidratación SSR y desincronización de permisos en sesión simulada | Robustez / Consistencia | Integración / SSR | Alta | Usuario Supervisor guardado en `localStorage` | Recargar con F5 la ruta `/admin/recursos` | Renderizado idéntico entre servidor y cliente sin warnings ni parpadeo visual | Error en consola por Hydration Mismatch entre árbol SSR y cliente | CORREGIDO | 02/10/2026 10:10 | 02/10/2026 11:30 | b161669 fix(auth): sincronizar permisos reales del rol en bd y eliminar mismatch de hidratacion en inventario |
| `BUG-H50-WEB-05` | Actualización de estado de React durante renderizado en hook useAutoRedirectTimer | Robustez / Ciclo de Vida | Componente / Hook | Media | Temporizador de redirección de 5 segundos activo tras acción | Ejecutar cuenta regresiva automática | Transición limpia sin actualizar estado de componentes ajenos durante el render | Error en consola "Cannot update a component while rendering a different component" | CORREGIDO | 02/10/2026 14:20 | 02/10/2026 15:45 | 1985ca5 fix(hooks): desacoplar router.push de setTimeLeft en useAutoRedirectTimer para evitar setState durante render |
| `BUG-H50-WEB-06` | Acoplamiento de permisos de creación y edición mostrando botón "Editar" a Supervisor | Regla de Negocio / RBAC | UI / Tabla | Alta | Usuario Supervisor autenticado en inventario | Visualizar tabla de recursos y modal técnico | Tabla y modal deben operar 100% en modo solo lectura sin botón "Editar" | Botón "Editar" se mostraba disponible en filas o modal | CORREGIDO | 04/10/2026 17:15 | 04/10/2026 18:30 | eb85eb6 feat(recursos): desacoplar permisos recursos:crear y recursos:editar para ocultar boton segun autorizacion |
| `BUG-H50-WEB-07` | Falla en linter ESLint por setState síncrono dentro de useEffect en SimulatedSessionContext | Calidad de Código / Lint | Estático / Hook | Alta | Repositorio web en rama feature/H50 | Ejecutar comando `npm run lint` | 0 errores de ESLint, build limpio en pipeline CI/CD | Falla con código 1: `react-hooks/set-state-in-effect` en línea 119 de SimulatedSessionContext.tsx | ABIERTO | 04/10/2026 19:40 | - | Pendiente dev (Devolver a desarrolladores para corrección de linter) |
| `CP-H50-WEB-01` | Carga inicial del inventario logístico con usuario Supervisor y despliegue de Skeleton | Rendimiento / UX | UI / Render | Alta | API en ejecución con recursos y sesión Supervisor activa | Navegar a `/admin/recursos` | Muestra esqueleto animado `RecursosSkeleton` y luego renderiza tabla fluida en < 1s | Carga inmediata con skeleton ~200ms y tabla poblada sin brincos visuales | APROBADO | 04/10/2026 18:45 | - | eb85eb6 feat(recursos): desacoplar permisos recursos:crear y recursos:editar para ocultar boton segun autorizacion |
| `CP-H50-WEB-02` | Verificación de ausencia de botón "Registrar Nuevo Recurso" en cabecera para Supervisor | Regla de Negocio / RBAC | UI / Header | Crítica | Sesión activa con `supervisor@valdivia.cl` (`recursos:leer`) | Inspeccionar cabecera `RecursosHeader` | Solo exhibe título, contador total y selector de usuario; botón de nuevo recurso ausente | Botón de creación no existe en el árbol DOM del navegador | APROBADO | 04/10/2026 18:48 | - | eb85eb6 feat(recursos): desacoplar permisos recursos:crear y recursos:editar para ocultar boton segun autorizacion |
| `CP-H50-WEB-03` | Ocultamiento de botón de creación en Empty State para Supervisor cuando no hay registros | UX / RBAC | UI / EmptyState | Alta | Base de datos sin recursos o sin stock | Cargar `/admin/recursos` con inventario en cero | Despliega contenedor con icono `PackageOpen` y descripción; sin botón de creación | Empty state sobrio con texto explicativo sin botón "Registrar Nuevo Recurso" | APROBADO | 04/10/2026 18:50 | - | eb85eb6 feat(recursos): desacoplar permisos recursos:crear y recursos:editar para ocultar boton segun autorizacion |
| `CP-H50-WEB-04` | Despliegue de Empty State con botón "Limpiar Filtros" ante búsqueda sin coincidencias | Usabilidad / Robustez | UI / Filtros | Media | Inventario con recursos cargados | Escribir búsqueda inexistente (ej. "Zepelín") | Muestra empty state de filtros activos con botón único "Limpiar Filtros" | Botón "Limpiar Filtros" visible; botón de nuevo recurso oculto | APROBADO | 04/10/2026 18:52 | - | eb85eb6 feat(recursos): desacoplar permisos recursos:crear y recursos:editar para ocultar boton segun autorizacion |
| `CP-H50-WEB-05` | Bloqueo perimetral y despliegue de AccesoDenegadoState al forzar /admin/recursos/nuevo | Seguridad / RBAC | UI / Permisos | Crítica | Usuario Supervisor (`recursos:leer`) | Ingresar manualmente a la URL `/admin/recursos/nuevo` | Pantalla de Acceso Restringido informando falta de `recursos:crear` y botón Volver | Bloqueo absoluto; formulario no se renderiza en ningún momento | APROBADO | 04/10/2026 18:55 | - | eb85eb6 feat(recursos): desacoplar permisos recursos:crear y recursos:editar para ocultar boton segun autorizacion |
| `CP-H50-WEB-06` | Bloqueo en ruta canónica /gestion/admin/recursos/nuevo bajo sesión de Supervisor | Seguridad / RBAC | Routing / RBAC | Crítica | Usuario Supervisor (`recursos:leer`) | Navegar a `/gestion/admin/recursos/nuevo` | Redirección o bloqueo idéntico mediante componente AccesoDenegadoState | Pantalla institucional de Acceso Restringido desplegada | APROBADO | 04/10/2026 18:58 | - | eb85eb6 feat(recursos): desacoplar permisos recursos:crear y recursos:editar para ocultar boton segun autorizacion |
| `CP-H50-WEB-07` | Retorno al inventario mediante botón "Volver al Inventario" desde AccesoDenegadoState | Usabilidad / Flujo | UI / Navegación | Media | Pantalla de bloqueo por permisos visibles | Clic en botón "Volver al Inventario" | Retorna fluidamente a `/admin/recursos` mostrando el listado de consulta | Redirección inmediata al inventario de solo lectura | APROBADO | 04/10/2026 19:00 | - | eb85eb6 feat(recursos): desacoplar permisos recursos:crear y recursos:editar para ocultar boton segun autorizacion |
| `CP-H50-WEB-08` | Ocultamiento de botón de acción "Editar" en filas de la tabla para perfil Supervisor | Regla de Negocio / UI | UI / Tabla | Alta | Supervisor visualizando tabla de recursos | Inspeccionar columna "Acción" de cada fila | Únicamente se exhibe el botón "Ver Ficha"; ningún botón de edición o borrado | Columna Acción muestra solo botón "Ver Ficha" con icono de ojo institucional | APROBADO | 04/10/2026 19:03 | - | eb85eb6 feat(recursos): desacoplar permisos recursos:crear y recursos:editar para ocultar boton segun autorizacion |
| `CP-H50-WEB-09` | Apertura interactiva de modal de Ficha Técnica de Inventario en modo solo lectura | Funcional / UI | UI / Modal | Alta | Fila de recurso visible en tabla | Clic en botón "Ver Ficha" o clic en la fila | Despliega modal institucional con resumen, especificaciones técnicas y mapa | Modal abierto fluidamente con datos completos del activo sin mutación | APROBADO | 04/10/2026 19:06 | - | eb85eb6 feat(recursos): desacoplar permisos recursos:crear y recursos:editar para ocultar boton segun autorizacion |
| `CP-H50-WEB-10` | Ausencia de botón "Editar Recurso" en el pie de acciones del modal de Ficha Técnica | Seguridad / UI | UI / Modal | Alta | Modal de Ficha Técnica abierto con rol Supervisor | Inspeccionar pie de acciones del modal | Solo botón secundario "Cerrar Ficha"; sin botón primario "Editar Recurso" | Pie contiene únicamente botón "Cerrar Ficha" con fondo neutro | APROBADO | 04/10/2026 19:08 | - | eb85eb6 feat(recursos): desacoplar permisos recursos:crear y recursos:editar para ocultar boton segun autorizacion |
| `CP-H50-WEB-11` | Despliegue de mapa GIS interactivo centrado en coordenadas en modo readOnly | GIS / Leaflet | UI / Mapa | Alta | Modal de recurso con latitud/longitud | Inspeccionar sección "Ubicación Base" en modal | Mapa Leaflet centrado en Valdivia con marcador fijo; sin controles de arrastre | Mapa centrado correctamente en coordenadas guardadas sin permitir edición | APROBADO | 04/10/2026 19:11 | - | eb85eb6 feat(recursos): desacoplar permisos recursos:crear y recursos:editar para ocultar boton segun autorizacion |
| `CP-H50-WEB-12` | Cierre interactivo de modal de Ficha Técnica (Botón, Tecla Escape y Backdrop) | Accesibilidad / UX | UI / Modal | Media | Modal de Ficha Técnica abierto | Clic en "Cerrar Ficha", presionar ESC y clic fuera del modal | El modal se cierra suavemente devolviendo el control al listado | Cierre exitoso y retorno de foco en todos los métodos de cierre | APROBADO | 04/10/2026 19:14 | - | eb85eb6 feat(recursos): desacoplar permisos recursos:crear y recursos:editar para ocultar boton segun autorizacion |
| `CP-H50-WEB-13` | Búsqueda textual reactiva por nombre o patente con debounce de 300ms | Rendimiento / Red | Componente / Input | Alta | Tabla de recursos cargada | Escribir término en buscador y pausar | Envía una única consulta tras 300ms filtrando la tabla reactivamente | Filtrado dinámico sin peticiones redundantes por cada pulsación | APROBADO | 04/10/2026 19:17 | - | eb85eb6 feat(recursos): desacoplar permisos recursos:crear y recursos:editar para ocultar boton segun autorizacion |
| `CP-H50-WEB-14` | Filtrado reactivo por Delegación Territorial (Central, Norte, Sur, Costa) | Funcional / Filtros | Integración / API | Alta | Inventario con múltiples delegaciones | Seleccionar una delegación en el dropdown | La tabla se actualiza enviando `delegacionId` y reinicia paginación a pág. 1 | Solo se muestran recursos pertenecientes a la delegación seleccionada | APROBADO | 04/10/2026 19:20 | - | eb85eb6 feat(recursos): desacoplar permisos recursos:crear y recursos:editar para ocultar boton segun autorizacion |
| `CP-H50-WEB-15` | Filtrado reactivo por tipo de recurso (Fungible a Granel vs Individual) | Funcional / Filtros | Componente / Select | Media | Inventario con ambos tipos de recursos | Seleccionar "Físico Individual" en filtro | Filtra mostrando activos con patente o serie e icono de camión `Truck` | Segmentación exacta de activos individuales con desglose de patentes | APROBADO | 04/10/2026 19:23 | - | eb85eb6 feat(recursos): desacoplar permisos recursos:crear y recursos:editar para ocultar boton segun autorizacion |
| `CP-H50-WEB-16` | Filtrado reactivo por Estado Operativo (Disponible, Asignado, En Mantención, etc.) | Funcional / Filtros | Integración / API | Alta | Inventario con recursos en distintos estados | Elegir estado "En Mantención" en selector | Filtra la tabla mostrando exclusivamente recursos en taller con badge naranja | Filtrado certero mostrando badge "En Mantención" | APROBADO | 04/10/2026 19:26 | - | eb85eb6 feat(recursos): desacoplar permisos recursos:crear y recursos:editar para ocultar boton segun autorizacion |
| `CP-H50-WEB-17` | Formateo legible en badges de estado evitando mayúsculas crudas de BD | UX / Estándar | UI / Badge | Alta | Recursos en tabla con diferentes estados | Auditar textos en columna "Estado" | Badges muestran "Disponible", "En Terreno / Asignado", "En Mantención", etc. | Texto formateado en formato título con colores semánticos institucionales | APROBADO | 04/10/2026 19:28 | - | eb85eb6 feat(recursos): desacoplar permisos recursos:crear y recursos:editar para ocultar boton segun autorizacion |
| `CP-H50-WEB-18` | Paginación reactiva y selector de filas por página (10, 25, 50) | Funcional / Paginación | UI / Componente | Media | Inventario con más de 10 registros | Navegar a página siguiente y cambiar límite | Actualiza offset de paginación sin recargar la página completa | Navegación instantánea respetando el total de páginas y registros | APROBADO | 04/10/2026 19:30 | - | eb85eb6 feat(recursos): desacoplar permisos recursos:crear y recursos:editar para ocultar boton segun autorizacion |
| `CP-H50-WEB-19` | Consistencia de sesión simulada con perfil Supervisor (RUT 44.444.444-4) | Seguridad / Auth | Integración / Context | Alta | Selector de sesión en cabecera | Seleccionar "Supervisor Estratégico" | Carga sesión con email `supervisor@valdivia.cl` y permisos `['recursos:leer']` | Perfil cargado con atribuciones de solo lectura aplicadas en toda la UI | APROBADO | 04/10/2026 19:32 | - | eb85eb6 feat(recursos): desacoplar permisos recursos:crear y recursos:editar para ocultar boton segun autorizacion |
| `CP-H50-WEB-20` | Cumplimiento estricto de guía de diseño institucional municipal (GEMINI.md) | Estándar de Marca | UI / Estilos | Alta | Toda la vista de inventario en escritorio y móvil | Auditar contra directrices de GEMINI.md | Esquinas rectas (`rounded-none`), paleta Teal/Mint/Charcoal, tipografía Noto Sans | 100% de apego a la identidad gráfica de la Municipalidad de Valdivia | APROBADO | 04/10/2026 19:35 | - | eb85eb6 feat(recursos): desacoplar permisos recursos:crear y recursos:editar para ocultar boton segun autorizacion |

---

## 4. Detalle de Defecto Activo a Devolver a los Desarrolladores (`BUG-H50-WEB-07`)

### 📋 Ficha de Defecto de QA:
* **Identificador:** `BUG-H50-WEB-07`
* **Severidad / Prioridad:** Alta (Bloqueante de CI/CD para merge)
* **Archivo afectado:** [`src/context/SimulatedSessionContext.tsx`](src/context/SimulatedSessionContext.tsx) (Línea 119)
* **Herramienta de detección:** `npm run lint` (`next lint` / ESLint en React 19)

### Evidencia del Error:
```text
/home/ds2fery/Documentos/Proyecto/sgrai-uach/web/src/context/SimulatedSessionContext.tsx
  119:5  error  Error: Calling setState synchronously within an effect can trigger cascading renders  react-hooks/set-state-in-effect

  117 |   // Sincronizar usuario guardado en localStorage tras montar en cliente para evitar hydration mismatch
  118 |   useEffect(() => {
> 119 |     setIsMounted(true);
      |     ^^^^^^^^^^^^ Avoid calling setState() directly within an effect
  120 |     try {
  121 |       const guardadoId = localStorage.getItem(STORAGE_KEY);

✖ 3 problems (1 error, 2 warnings)
```

### Instrucción para el Equipo de Desarrollo:
1. React 19 y las reglas estrictas de Hooks desaconsejan ejecutar `setState` de manera síncrona dentro de `useEffect` sin una suscripción externa o envoltura asíncrona.
2. Como alternativa estándar para SSR en Next.js, se puede usar `useSyncExternalStore` o retrasar la llamada mediante `requestAnimationFrame` o `setTimeout(() => setIsMounted(true), 0)`.
3. Adicionalmente, remover la variable no utilizada `USUARIOS_PRUEBA` en `src/app/(admin)/admin/recursos/page.tsx:5:23` para dejar 0 advertencias de compilador.
4. Tras aplicar el fix, notificar a QA para ejecutar el **Re-Test** de `BUG-H50-WEB-07` y emitir la aprobación final del PR.

---

## 5. Dictamen de Calidad de Frontend (QA Sign-off)

* **Funcionalidad y Criterios de Aceptación:** 🟢 **100% CUMPLIDOS**. La vista opera impecablemente en modo de solo lectura para el perfil Supervisor, protegiendo las rutas de creación, ocultando botones de mutación y formateando estados y mapas técnicos.
* **Pruebas Unitarias y de Integración:** 🟢 **267/267 pruebas pasando (17 pruebas específicas de RBAC en `RecursosRBAC.test.tsx`)**.
* **Compilación de Producción:** 🟢 **Exitosa con Turbopack**.
* **Control de Calidad Estático:** 🟡 **OBSERVADO**. A la espera de que desarrollo resuelva `BUG-H50-WEB-07` (`npm run lint`).
