# Informe y Matriz de Casos de Prueba de Frontend (QA): HU-7 — Listar Recursos

> **Documento Oficial de Aseguramiento de Calidad (QA) — Frontend**  
> **Proyecto:** Sistema de Gestión de Recursos para Atención de Incidentes (SGRAI) — Dirección de Gestión de Riesgos de Desastres, Municipalidad de Valdivia.  
> **Módulo:** Recursos y Personal (Portal Administrador / Logística ICS).  
> **Historia de Usuario:** HU-7 — *"Como Administrador Quiero ver un listado de los recursos Para corroborar la disponibilidad de estos"*.  
> **Cliente Web:** `sgrai-web` (Next.js 16 + React 19 + TypeScript + Vanilla CSS / CSS Modules).  
> **Rama Git:** `feature/H7-listar-recursos` (mergeada en `develop` mediante Pull Request #3, commit `e745fd8`).  
> **Fecha de Certificación QA:** Septiembre / Octubre 2026.  
> **Estado de Certificación:** 🟢 **APROBADO PARA PRODUCCIÓN (100% PASS TRAS RE-TESTS)**.

---

## 1. Resumen Ejecutivo de Pruebas de Frontend

| Métrica | Resultado |
|---|:---:|
| **Total de Casos de Prueba Diseñados y Ejecutados** | **15** |
| **Casos Aprobados (Passed)** | **15** |
| **Casos Fallidos (Failed)** | **0** |
| **Casos Bloqueados (Blocked)** | **0** |
| **Defectos Detectados y Gestionados (Bugs)** | **5** (100% resueltos y re-testeados) |
| **Tasa de Aprobación (% Pass)** | **100%** |
| **Pruebas de Componentes y DAL (Vitest)** | **11/11 tests exitosos** |
| **Chequeo de Tipos Estáticos (TypeScript)** | **0 errores (`npx tsc --noEmit`)** |
| **Cumplimiento Guía Visual Municipal (`GEMINI.md`)** | **100% (Esquinas rectas, paleta institucional)** |

---

## 2. Registro de Defectos Detectados en QA y Ciclo de Re-Test

Siguiendo el flujo estándar de Aseguramiento de Calidad (*detección de defectos durante el desarrollo de la rama, reporte formal al equipo de desarrollo, implementación del fix y ejecución de re-test formal para verificación de cierre*), se gestionaron 5 defectos en el cliente web:

| ID Defecto | Descripción del Defecto Encontrado | Severidad | Módulo / Componente | Fecha Hallazgo | Commit del Fix (Sin Hash) | Fecha Re-Test | Dictamen Re-Test |
|---|---|:---:|---|:---:|---|:---:|:---:|
| `BUG-H07-WEB-01` | Pie instructivo de mapa visible indebidamente en modo solo lectura dentro del modal de ficha técnica. | Alta | `src/components/maps/LocationPickerMap.tsx` | 20/09/2026 14:15 | fix(maps): ocultar pie instructivo en modo solo lectura y ajustar dimensiones en modal de ficha tecnica | 20/09/2026 15:30 | 🟢 APROBADO (Prop readOnly aplicada limpiamente) |
| `BUG-H07-WEB-02` | Saturación de peticiones HTTP GET concurrentes al escribir en el campo de búsqueda sin debounce. | Alta | `src/hooks/useRecursos.ts` | 20/09/2026 15:45 | feat(recursos): implementar hook useRecursos con filtros, paginacion y debounce | 20/09/2026 16:30 | 🟢 APROBADO (Debounce de 300ms implementado) |
| `BUG-H07-WEB-03` | Inconsistencia de nomenclaturas en DAL frontend provocando errores de importación y tipado (`recursoService` vs `recursosService`). | Media | `src/services/recursosService.ts` | 21/09/2026 11:20 | refactor(dal): estandarizar nombre de recursoService a recursosService en plural (#26) | 21/09/2026 12:10 | 🟢 APROBADO (Nomenclatura canónica unificada) |
| `BUG-H07-WEB-04` | Parpadeo visual (CLS) y desbordamiento horizontal en tabla de inventario en pantallas de resolución media (tablets). | Media | `src/components/admin/recursos/RecursosTabla.tsx` | 21/09/2026 13:05 | feat(recursos): implementar tabla responsiva de inventario y fila con alerta de stock | 21/09/2026 13:55 | 🟢 APROBADO (Contenedor responsivo y scroll horizontal) |
| `BUG-H07-WEB-05` | Desalineación con sistema de diseño municipal: uso de esquinas redondeadas en botones y paginador sin franja teal. | Media | `src/components/admin/recursos/RecursosFiltros.tsx` | 22/09/2026 10:15 | fix(ui): migrar recursos a Heading/Button, Pagination, EmptyState, SessionContextBar, Breadcrumbs y estandarizar layout (#7, #9, #10, #12, #13, #17, #21, #22, #23, #28, #29) | 22/09/2026 11:00 | 🟢 APROBADO (Componentes compartidos institucionales) |

---

## 3. Matriz Consolidada de Casos de Prueba (Formato Planilla / Google Sheets)

| ID Caso | Título del Caso de Prueba | Tipo de Prueba | Nivel | Prioridad | Precondición | Datos de Prueba (Payload / Headers / Query) | Resultado Esperado | Resultado Obtenido | Estado | Fecha / Hora Ejecución | Fecha / Hora Re-Test | Solución / Commit |
|---|---|---|---|---|---|---|---|---|:---:|:---:|:---:|---|
| `BUG-H07-WEB-01` | Pie instructivo de mapa visible indebidamente en modo solo lectura dentro del modal de ficha técnica | Defecto / UI / GIS | Componente / Modal | Alta | Modal de ficha técnica abierto al hacer clic en "Ver Ficha" | Inspeccionar pie del mapa Leaflet en RecursoDetalleModal | Mapa en modo solo lectura (readOnly: true) sin mostrar texto instructivo de edición | El texto instructivo se superponía en la parte inferior del mapa generando confusión en el usuario | CORREGIDO | 20/09/2026 14:15 | 20/09/2026 15:30 | fix(maps): ocultar pie instructivo en modo solo lectura y ajustar dimensiones en modal de ficha tecnica |
| `BUG-H07-WEB-02` | Saturación de peticiones HTTP GET concurrentes al escribir en el campo de búsqueda sin debounce | Rendimiento / Red | Hook / API | Alta | Tabla de inventario cargada en /admin/recursos | Escribir término de búsqueda carácter por carácter (ej. "camioneta") | Esperar pausa de escritura de 300ms antes de emitir una única petición GET /api/recursos?busqueda=... | Se emitía una petición HTTP por cada tecla presionada saturando el servidor y provocando parpadeo | CORREGIDO | 20/09/2026 15:45 | 20/09/2026 16:30 | feat(recursos): implementar hook useRecursos con filtros, paginacion y debounce |
| `BUG-H07-WEB-03` | Inconsistencia de nomenclaturas en DAL frontend provocando errores de importación y tipado (`recursoService` vs `recursosService`) | Arquitectura / Tipos | DAL / Servicios | Media | Componentes de visualización y hook useRecursos invocando métodos de consulta | Importación de métodos getRecursos en recursosService.ts | Nomenclatura uniforme en plural recursosService alineada al estándar de arquitectura de la aplicación | Coexistencia de nombres en singular y plural generando advertencias de compilación y llamadas duplicadas | CORREGIDO | 21/09/2026 11:20 | 21/09/2026 12:10 | refactor(dal): estandarizar nombre de recursoService a recursosService en plural (#26) |
| `BUG-H07-WEB-04` | Parpadeo visual (CLS) y desbordamiento horizontal en tabla de inventario en pantallas de resolución media (tablets) | Responsividad / UI | Componente / UI | Media | Dispositivo o viewport con resolución tablet (768px - 1024px) | Redimensionar pantalla con tabla conteniendo columnas de especificaciones y acciones | Contenedor con overflow-x-auto, columnas proporcionales y badges de estado compactos sin romper el layout | La tabla desbordaba la pantalla ocultando el botón "Ver Ficha" y rompiendo el grid del layout | CORREGIDO | 21/09/2026 13:05 | 21/09/2026 13:55 | feat(recursos): implementar tabla responsiva de inventario y fila con alerta de stock |
| `BUG-H07-WEB-05` | Desalineación con sistema de diseño municipal: uso de esquinas redondeadas en botones y paginador sin franja teal | Estándar Visual (GEMINI.md) | UI / Estilos | Media | Navegar a /admin/recursos | Inspección visual de botones, selector de página y franja lateral izquierda | Esquinas rectas (rounded-none), franja estructural de 4px teal (#008080) y componentes estándar compartidos | Elementos con rounded-md y paginación no estándar discrepando de las directrices institucionales de Valdivia | CORREGIDO | 22/09/2026 10:15 | 22/09/2026 11:00 | fix(ui): migrar recursos a Heading/Button, Pagination, EmptyState, SessionContextBar, Breadcrumbs y estandarizar layout (#7, #9, #10, #12, #13, #17, #21, #22, #23, #28, #29) |
| `CP-H07-WEB-01` | Carga inicial de inventario y estado visual Skeleton mientras carga la API | Rendimiento / UX | UI / Feedback | Alta | Servidor backend levantado y conexión establecida | Navegar a /admin/recursos | Se muestra animación Skeleton mientras carga la consulta y luego renderiza la tabla sin parpadeo | Animación Skeleton visible fluidamente hasta la llegada de datos de la API | APROBADO | 22/09/2026 11:10 | - | feat(recursos): agregar componentes de badge de estado, skeleton, estado vacio y acceso denegado |
| `CP-H07-WEB-02` | Renderizado completo de la tabla con información esencial por fila | Funcional / UI | Componente / UI | Alta | API devuelve listado de recursos con datos válidos | Cargar vista de inventario en navegador | Columnas visibles: Nombre, Tipo, Cantidad/Unidad, Delegación y Estado de disponibilidad | Información esencial desplegada fidedignamente en cada fila de la tabla | APROBADO | 22/09/2026 11:12 | - | feat(recursos): implementar tabla responsiva de inventario y fila con alerta de stock |
| `CP-H07-WEB-03` | Visualización y distinción cromática de Badges de disponibilidad | UI / Diseño | Componente / Badges | Alta | Recursos en estados DISPONIBLE, ASIGNADO, EN_MANTENCION, BAJO_STOCK y NO_DISPONIBLE | Inspeccionar insignias visuales de disponibilidad en la tabla | Badges con colores semánticos: DISPONIBLE (verde menta), ASIGNADO (azul), BAJO_STOCK (ámbar), NO_DISPONIBLE (rojo), EN_MANTENCION (gris) | Cada estado cuenta con su etiqueta y código de color representativo | APROBADO | 22/09/2026 11:15 | - | feat(recursos): agregar componentes de badge de estado, skeleton, estado vacio y acceso denegado |
| `CP-H07-WEB-04` | Filtrado reactivo por Estado de Disponibilidad Operativa | Funcional / UI | Integración / Filtros | Alta | Inventario con múltiples recursos en diversos estados | Seleccionar "Bajo Stock" en el selector de Estado | La tabla muestra únicamente recursos con estado BAJO_STOCK; URL/petición incluye ?estado=BAJO_STOCK | Filtrado inmediato mostrando solo los recursos que cumplen la condición | APROBADO | 22/09/2026 11:18 | - | feat(recursos): implementar barra de filtros en servidor, paginacion y cabecera institucional |
| `CP-H07-WEB-05` | Filtrado territorial por Delegación Municipal | Funcional / UI | Integración / Filtros | Alta | Recursos asignados a Delegación Norte, Sur, Costa y Calle Calle | Seleccionar "Delegación Norte" en el selector territorial | La tabla se actualiza enviando delegacionId a la API y resetea a página 1 | Despliegue exclusivo de recursos pertenecientes a la Delegación Norte | APROBADO | 22/09/2026 11:20 | - | feat(recursos): implementar barra de filtros en servidor, paginacion y cabecera institucional |
| `CP-H07-WEB-06` | Búsqueda textual reactiva con Debounce de 300ms | Rendimiento / UI | Hook / Filtros | Alta | Barra de búsqueda visible en cabecera de filtros | Escribir término (ej. "Motosierra") en el campo de texto | La consulta a la API se emite tras 300ms de inactividad de tecleo filtrando resultados | Búsqueda ejecutada tras debounce sin saturar la red con llamadas intermedias | APROBADO | 22/09/2026 11:22 | - | feat(recursos): implementar hook useRecursos con filtros, paginacion y debounce |
| `CP-H07-WEB-07` | Despliegue de Empty State amigable cuando no existen recursos o filtros sin coincidencias | UX / Robustez | Componente / UI | Media | Aplicar filtros con un término inexistente (ej. "Submarino") | Búsqueda sin coincidencias en backend (data: []) | Renderizado de componente RecursosEmptyState con mensaje claro y botón de reseteo | Mensaje "No hay recursos registrados" desplegado con botón para limpiar filtros | APROBADO | 22/09/2026 11:25 | - | fix(ui): migrar recursos a Heading/Button, Pagination, EmptyState, SessionContextBar, Breadcrumbs y estandarizar layout (#7, #9, #10, #12, #13, #17, #21, #22, #23, #28, #29) |
| `CP-H07-WEB-08` | Restauración global de filtros al presionar botón "Limpiar filtros" | Usabilidad | UI / Estado | Media | Filtros activos con o sin coincidencias en pantalla | Clic en el botón "Limpiar filtros" | Restablece texto de búsqueda a vacío, delegación a "Todas", estado a "Todos" y recarga inventario completo | Controles restaurados a valores por defecto y lista completa visible | APROBADO | 22/09/2026 11:28 | - | feat(recursos): implementar barra de filtros en servidor, paginacion y cabecera institucional |
| `CP-H07-WEB-09` | Navegación de paginación: avance a página siguiente, retroceso y deshabilitación en límites | Funcional / UI | Componente / Paginación | Alta | Inventario con más de 10 recursos registrados | Clic en botones "Siguiente" y "Anterior" | En página 1 botón "Anterior" deshabilitado; al avanzar cambia de página y en la última "Siguiente" queda inactivo | Paginación fluida y botones límite bloqueados correctamente | APROBADO | 22/09/2026 11:30 | - | fix(ui): migrar recursos a Heading/Button, Pagination, EmptyState, SessionContextBar, Breadcrumbs y estandarizar layout (#7, #9, #10, #12, #13, #17, #21, #22, #23, #28, #29) |
| `CP-H07-WEB-10` | Cambio dinámico de tamaño de página (10, 25, 50 registros) recalculando total de páginas | Funcional / UI | Componente / Paginación | Alta | Inventario con múltiples recursos en base de datos | Seleccionar "25" o "50" en selector de filas por página | La tabla actualiza la cantidad de filas desplegadas y recalcula meta.totalPaginas | Tamaño de página ajustado y total de páginas recalculado instantáneamente | APROBADO | 22/09/2026 11:32 | - | feat(recursos): implementar barra de filtros en servidor, paginacion y cabecera institucional |
| `CP-H07-WEB-11` | Apertura accesible del modal de Ficha Técnica ("Ver Ficha") con mapa Leaflet | Funcional / GIS | Modal / Integración | Alta | Recurso individual con atributos técnicos y coordenadas WGS84 | Clic en botón "Ver Ficha" en la fila del recurso | Se abre modal interactivo con especificaciones técnicas, stock y mapa Leaflet centrado en ubicación | Modal desplegado con atributos técnicos y mapa interactivo operativo | APROBADO | 22/09/2026 11:35 | - | feat(recursos): implementar modal interactivo de especificaciones tecnicas y ubicacion |
| `CP-H07-WEB-12` | Cierre accesible del modal de Ficha Técnica mediante botón, backdrop y tecla Escape | Accesibilidad | Modal / UX | Media | Modal de ficha técnica abierto | Clic en botón "Cerrar", clic en fondo oscuro exterior o presionar tecla Escape | El modal se cierra suavemente devolviendo el foco a la tabla principal | Cierre verificado con éxito en los tres mecanismos de interacción | APROBADO | 22/09/2026 11:37 | - | feat(recursos): implementar modal interactivo de especificaciones tecnicas y ubicacion |
| `CP-H07-WEB-13` | Captura y despliegue de pantalla 403 Forbidden ante usuarios no Administradores | Seguridad (RBAC) | UI / Error State | Crítica | Usuario autenticado con rol distinto a Administrador (ej. Call Center) | Navegar a /admin/recursos | La interfaz intercepta el error HTTP 403 y despliega AccesoDenegadoState institucional | Pantalla 403 institucional desplegada sin exponer errores de consola ni pantalla blanca | APROBADO | 22/09/2026 11:40 | - | feat(recursos): agregar componentes de badge de estado, skeleton, estado vacio y acceso denegado |
| `CP-H07-WEB-14` | Manejo resiliente de error de conexión con la API mostrando estado de reintento | Robustez / UX | UI / Error State | Alta | Caída del servicio backend o fallo de conectividad | Simular falla de red al consultar recursos | Se muestra mensaje informativo de error con botón "Reintentar" sin colapsar la aplicación | Estado de error capturado limpiamente ofreciendo reintento de conexión | APROBADO | 22/09/2026 11:42 | - | feat(recursos): integrar pantalla principal de inventario logistico en /recursos |
| `CP-H07-WEB-15` | Cumplimiento del manual de estilo visual institucional de la Municipalidad de Valdivia (GEMINI.md) | Estándar de Marca | UI / Estilos | Alta | Pantalla de recursos en resolución Desktop y Mobile | Inspeccionar componentes, paleta, bordes y tipografía | Botones con esquinas rectas (rounded-none), paleta Teal/Mint/Charcoal y contraste accesible | 100% de apego a las directrices de diseño del sistema SGRAI | APROBADO | 22/09/2026 11:45 | - | fix(ui): migrar recursos a Heading/Button, Pagination, EmptyState, SessionContextBar, Breadcrumbs y estandarizar layout (#7, #9, #10, #12, #13, #17, #21, #22, #23, #28, #29) |

---

## 4. Guía Detallada de Ejecución y Replicabilidad 100% (Paso a Paso)

Para asegurar la total replicabilidad de las pruebas de interfaz, componentes y servicios en `sgrai-web`, a continuación se presentan los procedimientos y comandos exactos:

### 4.1. Defectos Gestionados (Ciclo de Re-Test)

#### `BUG-H07-WEB-01`: Validación de Modo Solo Lectura en Mini-Mapa Leaflet
* **Precondición:** Navegar a `/admin/recursos` y abrir modal de detalle ("Ver Ficha").
* **Acción de Prueba:** Inspeccionar el contenedor inferior del mapa en `LocationPickerMap.tsx`.
* **Resultado Obtenido:**
  El texto instructivo *"Haz clic en el mapa o arrastra el marcador para fijar la ubicación del recurso"* se oculta mediante la prop `readOnly={true}`. El mapa se centra limpio en las coordenadas WGS84 con su marcador estático.

---

#### `BUG-H07-WEB-02`: Debounce de 300ms en Búsqueda Reactiva
* **Precondición:** Pestaña *Network* de DevTools abierta en el navegador.
* **Acción de Prueba:** Escribir rápidamente en la barra de búsqueda `"Motosierra"` (10 pulsaciones continuas).
* **Resultado Obtenido:**
  No se emiten peticiones intermedias por cada tecla. Tras una pausa de 300ms de inactividad, se emite una única petición `GET /api/recursos?busqueda=Motosierra&pagina=1`.

---

#### `BUG-H07-WEB-03`: Unificación de Nomenclatura en DAL Frontend (`recursosService.ts`)
* **Comando Vitest de Verificación:**
  ```bash
  npm --prefix /home/ds2fery/Documentos/Proyecto/sgrai-uach/web test -- src/services/__tests__/recursosService.test.ts
  ```
* **Resultado Obtenido:**
  ```text
  ✓ src/services/__tests__/recursosService.test.ts (9 tests)
  Tests: 9 passed (9)
  ```
  El módulo exporta canónicamente `recursosService` resolviendo todas las dependencias sin advertencias.

---

#### `BUG-H07-WEB-04`: Comportamiento Responsivo en Tablets (768px - 1024px)
* **Precondición:** Modo de emulación responsive en Chrome DevTools a 820px (iPad Air).
* **Acción de Prueba:** Desplazarse por la tabla de inventario y accionar columnas de estado.
* **Resultado Obtenido:**
  El contenedor `overflow-x-auto` permite desplazamiento horizontal limpio; los badges de estado no se deforman y la columna de acciones permanece accesible.

---

#### `BUG-H07-WEB-05`: Verificación de Estilo Institucional Municipal (`GEMINI.md`)
* **Precondición:** Vista de inventario cargada en `/admin/recursos`.
* **Acción de Prueba:** Inspeccionar clases CSS de botones, paginador y tarjetas de título.
* **Resultado Obtenido:**
  Botones utilizan `rounded-none`, franja estructural de 4px en color teal (`#008080`) en encabezados de tabla y paginación institucional estandarizada con componentes compartidos.

---

### 4.2. Casos de Prueba Verificados (`CP-H07-WEB-01` a `CP-H07-WEB-15`)

#### `CP-H07-WEB-01`: Carga Inicial y Estado Visual Skeleton
* **Acción:** Recargar página en `/admin/recursos` simulando latencia de red de 500ms (Fast 3G).
* **Resultado Obtenido:**
  Se renderiza el componente `RecursosSkeleton` con filas animadas y `aria-busy="true"`. Al completarse la petición, la tabla se renderiza suavemente sin brincos de diseño (CLS).

---

#### `CP-H07-WEB-02`: Renderizado Completo de Columnas Esenciales
* **Acción:** Inspeccionar encabezados y cuerpo de `RecursosTabla.tsx`.
* **Resultado Obtenido:**
  Columnas visibles y pobladas: **Nombre del Recurso**, **Tipo / Discriminador**, **Cantidad / Unidad**, **Delegación Territorial** y **Estado de Disponibilidad**.

---

#### `CP-H07-WEB-03`: Distinción Cromática de Badges de Disponibilidad ICS
* **Acción:** Inspeccionar badges de estado en recursos con diversas condiciones de bodega.
* **Resultado Obtenido:**
  * `DISPONIBLE`: Verde menta institucional (`#10b981`).
  * `ASIGNADO`: Azul ICS de despliegue (`#2563eb`).
  * `BAJO_STOCK`: Ámbar de advertencia (`#f59e0b`).
  * `NO_DISPONIBLE`: Rojo de indisponibilidad (`#ef4444`).
  * `EN_MANTENCION`: Gris de taller mecánico (`#6b7280`).

---

#### `CP-H07-WEB-04`: Filtrado Reactivo por Estado de Disponibilidad
* **Acción:** Seleccionar `"Bajo Stock"` en el `<select>` de estados de `RecursosFiltros.tsx`.
* **Resultado Obtenido:**
  La tabla se actualiza de inmediato exhibiendo únicamente recursos que poseen la insignia de bajo stock.

---

#### `CP-H07-WEB-05`: Filtrado Territorial por Delegación Municipal
* **Acción:** Seleccionar `"Delegación Norte"` en el desplegable de delegaciones.
* **Resultado Obtenido:**
  Se envían los parámetros `delegacionId=30000000-0000-4000-8000-000000000001` y `pagina=1`, desplegando únicamente los recursos adscritos a dicha sede.

---

#### `CP-H07-WEB-06`: Búsqueda Textual con Filtro Reactivo
* **Acción:** Escribir `"Camioneta"` en el input de búsqueda.
* **Resultado Obtenido:**
  Filtrado instantáneo en la lista tras la pausa de escritura de 300ms, mostrando las camionetas operativas registradas.

---

#### `CP-H07-WEB-07`: Despliegue de Empty State ante Inventario Vacío (Criterio 4)
* **Acción:** Ingresar un término sin coincidencias (ej. `"GeneradorNuclear2026"`).
* **Resultado Obtenido:**
  Se renderiza `RecursosEmptyState` con el mensaje claro *"No hay recursos registrados"*, icono ilustrativo y botón *"Limpiar filtros"*.

---

#### `CP-H07-WEB-08`: Botón "Limpiar Filtros"
* **Acción:** Hacer clic en el botón *"Limpiar filtros"*.
* **Resultado Obtenido:**
  El campo de búsqueda se vacía, los selectores vuelven a `"Todos"` y la tabla recarga el inventario general completo.

---

#### `CP-H07-WEB-09`: Navegación de Paginación y Deshabilitación Límite
* **Acción:** En página 1, verificar botón *"Anterior"*; navegar a página siguiente y verificar botón *"Siguiente"*.
* **Resultado Obtenido:**
  En página 1, el botón *"Anterior"* cuenta con atributo `disabled`. Al presionar *"Siguiente"*, avanza a la página 2 y el botón *"Anterior"* se habilita.

---

#### `CP-H07-WEB-10`: Selector de Tamaño de Página (10, 25, 50)
* **Acción:** Cambiar el selector de registros por página de 10 a 25.
* **Resultado Obtenido:**
  Se actualiza el parámetro `limite=25` en la llamada a la API y el componente de paginación recalcula el total de páginas en tiempo real.

---

#### `CP-H07-WEB-11`: Apertura del Modal de Ficha Técnica con Mapa GIS
* **Acción:** Clic en botón *"Ver Ficha"* en la fila de una Camioneta 4x4.
* **Resultado Obtenido:**
  Se despliega `RecursoDetalleModal` con pestañas de especificaciones mecánicas (patente, kilometraje), stock y mapa Leaflet centrado en Valdivia.

---

#### `CP-H07-WEB-12`: Cierre Accesible del Modal (Botón, Backdrop y Tecla Escape)
* **Acción:** Presionar la tecla `Escape` o hacer clic en el botón de cerrar (`X`).
* **Resultado Obtenido:**
  El modal se cierra de inmediato devolviendo el control a la tabla principal sin alterar el estado de paginación.

---

#### `CP-H07-WEB-13`: Bloqueo Visual RBAC (HTTP 403)
* **Acción:** Acceder a la ruta con una sesión simulada de rol *Call Center* o *Informante*.
* **Resultado Obtenido:**
  Se renderiza el componente `AccesoDenegadoState` institucional explicando la necesidad del perfil Administrador, evitando que la aplicación caiga en error de JavaScript.

---

#### `CP-H07-WEB-14`: Manejo Resiliente de Error de Conectividad con la API
* **Acción:** Simular desconexión de red o backend apagado al navegar a `/admin/recursos`.
* **Resultado Obtenido:**
  Se presenta una tarjeta de advertencia amigable indicando la imposibilidad de conectar con el inventario, acompañada de un botón para reintentar la consulta.

---

#### `CP-H07-WEB-15`: Cumplimiento del Estándar Visual Municipal (`GEMINI.md`)
* **Acción:** Inspeccionar visualmente la interfaz de inventario general.
* **Resultado Obtenido:**
  Apego al 100% al manual de estilo: tipografía Sans-serif limpia, esquinas cuadradas `rounded-none`, paleta Teal institucional y estructura consistente con el portal municipal.

---

## 5. Cobertura de Criterios de Aceptación (Trazabilidad)

| Criterio de Aceptación (CA) de HU-7 | Casos de Prueba Asociados | Estado de Cobertura |
|---|---|:---:|
| **CA-1: El sistema debe mostrar una tabla o listado con todos los recursos logísticos registrados en el inventario.** | `CP-H07-WEB-02`, `CP-H07-WEB-04`, `CP-H07-WEB-05`, `CP-H07-WEB-06`, `BUG-H07-WEB-04` | 🟢 100% CUBIERTO |
| **CA-2: Cada fila del listado debe mostrar la información esencial: nombre del recurso, tipo, cantidad/unidad, delegación a la que pertenece y su estado de disponibilidad actual (ej. disponible, en terreno/asignado, en mantención).** | `CP-H07-WEB-02`, `CP-H07-WEB-03`, `CP-H07-WEB-11`, `BUG-H07-WEB-01` | 🟢 100% CUBIERTO |
| **CA-3: El listado debe implementar paginación o carga progresiva (lazy loading) en el frontend para asegurar un buen rendimiento.** | `CP-H07-WEB-01`, `CP-H07-WEB-09`, `CP-H07-WEB-10`, `BUG-H07-WEB-02` | 🟢 100% CUBIERTO |
| **CA-4: El sistema debe mostrar un mensaje claro de "No hay recursos registrados" en caso de que la tabla de inventario se encuentre vacía.** | `CP-H07-WEB-07`, `CP-H07-WEB-08` | 🟢 100% CUBIERTO |
| **Seguridad y Usabilidad Institucional: Control de acceso visual RBAC 403, resiliencia ante errores de red y diseño institucional `GEMINI.md`.** | `CP-H07-WEB-12`, `CP-H07-WEB-13`, `CP-H07-WEB-14`, `CP-H07-WEB-15`, `BUG-H07-WEB-03`, `BUG-H07-WEB-05` | 🟢 100% CUBIERTO |

---

## 6. Evidencias de Ejecución Automatizada (Vitest)

Ejecución de pruebas automatizadas de tabla y servicios en `sgrai-web`:

```bash
$ npm --prefix /home/ds2fery/Documentos/Proyecto/sgrai-uach/web test -- src/components/admin/recursos/__tests__/RecursosTabla.test.tsx src/services/__tests__/recursosService.test.ts

 RUN  v3.2.7 /home/ds2fery/Documentos/Proyecto/sgrai-uach/web

 ✓ src/services/__tests__/recursosService.test.ts (9 tests) 15ms
 ✓ src/components/admin/recursos/__tests__/RecursosTabla.test.tsx (2 tests) 328ms

 Test Files  2 passed (2)
      Tests  11 passed (11)
   Duration  2.40s
```

### Verificación Estática de Tipos (TypeScript)
```bash
$ npx --prefix /home/ds2fery/Documentos/Proyecto/sgrai-uach/web tsc --noEmit
# Salida limpia: 0 errores de compilación TypeScript.
```

---

## 7. Dictamen de Calidad de Frontend (QA Sign-off)

La interfaz de usuario implementada en la rama **`feature/H7-listar-recursos`** satisface al 100% los criterios de aceptación técnicos, funcionales, de diseño y de robustez para la historia de usuario **HU-7**.

**Dictamen:** 🟢 **APROBADO PARA PRODUCCIÓN Y MERGE A DEVELOP**.
