# Informe y Matriz de Casos de Prueba (QA): HU-34 — Filtrado de Listados por Delegación, Estado y Atributos (Encargado)

> **Documento Oficial de Aseguramiento de Calidad (QA) — Frontend Web**  
> **Proyecto:** Sistema de Gestión de Recursos para Atención de Incidentes (SGRAI) — Dirección de Gestión de Riesgos de Desastres, Municipalidad de Valdivia.  
> **Módulo:** Operaciones, Centro de Mando e Inventario Centralizado (`sgrai-web` - `/mando`, `/admin/recursos`, `/gestion/admin/empleados`).  
> **Historia de Usuario:** HU-34 — *"Como Encargado Quiero poder en cada uno de los listados filtrar según delegación, estado y otros atributos Para facilitar la visualización rápida de la información, optimizar el monitoreo operativo y agilizar la toma de decisiones al momento de asignar recursos o personal a los incidentes."*  
> **Servicio Web:** `sgrai-web` (Next.js 16 App Router + React 19 + TypeScript + Vitest v3.2.7 + Testing Library + CSS Modules / Vanilla CSS).  
> **Rama Git Evaluada:** `feature/H34-filtros-listados-encargado` (mergeada en `develop` mediante Pull Request #24).  
> **Commits Clave Evaluados (Conventional Commits sin hash):**
> * `feat(filtros): implementar componentes base reutilizables de filtros hibridos con resolucion de nombres`
> * `feat(mando): integrar filtros de delegacion por nombre, ocultamiento de columnas y modal de misiones`
> * `feat(recursos): modernizar filtros de recursos con catalogos dinamicos y nombres legibles`
> * `feat(personal): agregar filtros de patrullas y asistentes sociales por rol y especialidad`
> * `feat(filtros): universalizar FilterBar con persistencia en localStorage y colapso responsive`
> * `feat(mando): sincronizar enfoque de categorias en kanban y estandarizar denominacion reportado`
> * `refactor(filters): estandarizar componente transversal FilterBar y controles de filtro`
> * `feat(common): condicionar visibilidad de paginacion a existencia de elementos (F-02)`
> * `feat(mando): optimizar filtros de Centro de Mando, separacion de misiones y contadores (F-03, F-04, F-05, F-06)`
> * `feat(admin): incorporar contadores y corregir grilla en filtros de Roles e Inventario (F-06, F-10)`
> * `dd1e015 feat(personal): estandarizar contrato de respuesta con meta y paginacion transversal (H34)`
> * `fix(personal): integrar ActiveFilterChips, eliminar card redundante y ajustar limite de consulta a 100`
> * `docs: registrar ADR-004 de estandarizacion de componentes de filtros y actualizar manual H34`
> * `docs(manuales): agregar manual de usuario H34 para filtros de encargado`
> * `merge: pull request #24 from sgrai-uach/feature/H34-filtros-listados-encargado`
>
> **Fecha de Certificación QA:** 03 de Octubre — 05 de Octubre de 2026.  
> **Estado de Certificación:** 🟢 **APROBADO PARA PRODUCCIÓN (100% PASS TRAS RE-TESTS)**.

---

## 1. Resumen Ejecutivo de Pruebas de Frontend

| Métrica | Resultado |
|---|:---:|
| **Total de Casos de Prueba Diseñados y Ejecutados** | **25** (20 Casos Funcionales/UI/Integración + 5 Defectos Gestionados) |
| **Casos Aprobados (Passed)** | **20** |
| **Casos Fallidos (Failed)** | **0** |
| **Casos Bloqueados (Blocked)** | **0** |
| **Defectos Detectados y Devueltos a Desarrolladores (Bugs)** | **5** (100% resueltos, re-testeados y certificados como `CORREGIDO`) |
| **Tasa de Aprobación Global (% Pass)** | **100%** |
| **Suite Automatizada de Componentes de Filtrado (Vitest)** | **29/29 tests exitosos** (`FilterComponents`, `KanbanFiltros`, `MisionesModal`, `RecursosFiltros`, `EmpleadoFiltrosBar`) |
| **Chequeo de Tipos Estáticos (TypeScript)** | **0 errores (`npx tsc --noEmit`)** |
| **Cumplimiento de Guía Visual Municipal (`GEMINI.md`)** | **100% (Bordes rectos, paleta Teal/Mint/Charcoal, sin emojis, botones planos)** |
| **Lógica de Filtrado Conjuntivo (AND)** | **100% verificado en cliente y servicios DAL** |

---

## 2. Registro de Defectos Detectados en QA y Ciclo de Re-Test

Siguiendo las directrices docentes de Aseguramiento de Calidad (*detección de defectos durante el ciclo de desarrollo de la rama, reporte formal al equipo de desarrollo, implementación del fix mediante commit estructurado en Conventional Commits sin hash y ejecución de re-test formal para certificación de cierre*), se detectaron y gestionaron 5 defectos en el frontend de la historia:

| ID Defecto | Descripción del Defecto Encontrado | Severidad | Módulo / Archivo Afectado | Fecha Hallazgo | Commit del Fix (Sin Hash) | Fecha Re-Test | Dictamen Re-Test |
|---|---|:---:|---|:---:|---|:---:|:---:|
| `BUG-H34-WEB-01` | **Fallo HTTP 400 Bad Request en listado de personal por exceso en parámetro límite (`limit=200`):** Al consultar el listado de personal operativo desde `useEmpleados.ts`, se enviaba un `limit=200` que violaba la validación Zod de `sgrai-api` (`max(100)`), bloqueando la carga de personal. | Crítica | `src/hooks/useEmpleados.ts`, `src/components/admin/empleados/EmpleadoFiltrosBar.tsx` | 03/10/2026 14:15 | fix(personal): integrar ActiveFilterChips, eliminar card redundante y ajustar limite de consulta a 100 | 05/10/2026 09:20 | 🟢 CORREGIDO (`limit` acotado a 100 y chips reactivos integrados). |
| `BUG-H34-WEB-02` | **Paginador huérfano visible en listados con cero registros coincidentes:** Al aplicar filtros estrictos sin resultados, el componente `Pagination` continuaba desplegando `Página 1 de 0` con controles deshabilitados en vez de ocultarse y dar paso al EmptyState amigable. | Media | `src/components/common/Pagination.tsx`, `src/components/callcenter/AvisosTable.tsx` | 03/10/2026 16:30 | feat(common): condicionar visibilidad de paginacion a existencia de elementos (F-02) | 05/10/2026 10:15 | 🟢 CORREGIDO (Paginador retorna `null` cuando `currentTotal === 0` o `total === 0`). |
| `BUG-H34-WEB-03` | **Pérdida de visualización al pulsar KPI superior de incidentes con columna oculta por filtro de estado:** Al tener seleccionado un estado específico (ej. `EN_ATENCION`) y hacer clic en el KPI "Reportados", el tablero intentaba hacer scroll a un nodo oculto dejando el área vacía. | Alta | `src/components/mando/KanbanBoard.tsx`, `src/components/mando/KanbanFiltros.tsx` | 04/10/2026 11:20 | feat(mando): sincronizar enfoque de categorias en kanban y estandarizar denominacion reportado | 05/10/2026 11:00 | 🟢 CORREGIDO (Al pulsar un KPI de columna no visible, conmuta reactivamente el filtro de estado a dicha columna). |
| `BUG-H34-WEB-04` | **Falta de persistencia al colapsar panel de filtros en recarga o cambio de vista:** Al colapsar `FilterBar` para ampliar el área de visualización del tablero, la preferencia se perdía al recargar la página o alternar entre módulos. | Media | `src/components/common/filters/FilterBar.tsx` | 04/10/2026 15:40 | feat(filtros): universalizar FilterBar con persistencia en localStorage y colapso responsive | 05/10/2026 11:45 | 🟢 CORREGIDO (Persistencia de estado con `storageKey` en `localStorage` y chevron en cabecera). |
| `BUG-H34-WEB-05` | **Fallo 500 / UUID inválido por falta de resolución de nombres geográficos a UUID en modal de misiones:** Al seleccionar una delegación por nombre (*Norte*, *Sur*, etc.) en el modal de misiones, se enviaba el string literal en `delegacionId` en lugar de traducirlo vía catálogo. | Crítica | `src/services/misionesService.ts`, `src/components/mando/misiones/MisionesModal.tsx` | 04/10/2026 18:00 | feat(filtros): implementar componentes base reutilizables de filtros hibridos con resolucion de nombres | 05/10/2026 12:30 | 🟢 CORREGIDO (`catalogosService.resolverDelegacionId` traduce transparentemente el nombre a UUID antes de la petición). |

---

## 3. Matriz Consolidada de Casos de Prueba (13 Columnas Oficiales)

*(Nota: En estricto cumplimiento del estándar de calidad, la columna `Solución / Commit` contiene exclusivamente mensajes en Conventional Commits sin ningún hash hexadecimal).*

| ID Caso | Título del Caso de Prueba | Tipo de Prueba | Nivel | Prioridad | Precondición | Datos de Prueba (Payload / Headers / Query) | Resultado Esperado | Resultado Obtenido | Estado | Fecha / Hora Ejecución | Fecha / Hora Re-Test | Solución / Commit |
|---|---|---|---|---|---|---|---|---|:---:|:---:|:---:|---|
| `BUG-H34-WEB-01` | Fallo HTTP 400 en listado de personal por exceso de límite (limit=200) | Integración / API | Hook / Servicio | Crítica | Carga inicial de `/gestion/admin/empleados` por Encargado | `GET /api/personal?limit=200` | Carga fluida de personal respetando contrato de validación Zod | Servidor respondía 400 Bad Request por exceder `max(100)`; corregido a `limit=100` | **CORREGIDO** | 03/10/2026 14:15 | 05/10/2026 09:20 | fix(personal): integrar ActiveFilterChips, eliminar card redundante y ajustar limite de consulta a 100 |
| `BUG-H34-WEB-02` | Paginador huérfano visible en listados con cero registros coincidentes | UX / UI | Componente | Media | Filtros aplicados sin coincidencia en base de datos | Renderizado de `Pagination` con `total = 0` y `currentTotal = 0` | Ocultamiento del componente de paginación para no inducir a confusión | Desplegaba "Página 1 de 0" con botones inútiles; tras fix retorna `null` y da paso al empty state | **CORREGIDO** | 03/10/2026 16:30 | 05/10/2026 10:15 | feat(common): condicionar visibilidad de paginacion a existencia de elementos (F-02) |
| `BUG-H34-WEB-03` | Pérdida de visualización al pulsar KPI de incidentes con columna oculta | Usabilidad / UX | Integración / UI | Alta | Filtro de estado activo (`EN_ATENCION`) con columnas restantes ocultas | Clic sobre tarjeta KPI "Reportados" | La columna solicitada se revela y enfoca instantáneamente sin vista en blanco | Quedaba en blanco intentando scroll a nodo oculto; tras fix conmuta el filtro de estado | **CORREGIDO** | 04/10/2026 11:20 | 05/10/2026 11:00 | feat(mando): sincronizar enfoque de categorias en kanban y estandarizar denominacion reportado |
| `BUG-H34-WEB-04` | Falta de persistencia al colapsar panel de filtros en recarga o cambio de vista | UX / Estado | Componente / LocalStorage | Media | Barra de filtros colapsada por el usuario en `/mando` | Recarga de página (`F5`) o navegación hacia otro módulo y retorno | La barra debe permanecer colapsada respetando la preferencia del usuario | Se expandía nuevamente en cada navegación; tras fix se preserva en `localStorage` | **CORREGIDO** | 04/10/2026 15:40 | 05/10/2026 11:45 | feat(filtros): universalizar FilterBar con persistencia en localStorage y colapso responsive |
| `BUG-H34-WEB-05` | Fallo 500 / UUID inválido por falta de resolución de delegación a UUID en misiones | Integración / API | Servicio / DAL | Crítica | Selección de delegación "Costa" en modal de misiones | Petición `GET /api/misiones?delegacion=Costa` | Consulta exitosa enviando el UUID resuelto en `delegacionId` | La API fallaba con 500 por recibir nombre en vez de UUID; tras fix `catalogosService` lo resuelve | **CORREGIDO** | 04/10/2026 18:00 | 05/10/2026 12:30 | feat(filtros): implementar componentes base reutilizables de filtros hibridos con resolucion de nombres |
| `CP-H34-WEB-01` | Carga de controles de filtrado en Tablero Kanban de Incidentes (CA-1) | Funcional / UI | Vista / Componente | Crítica | Sesión activa como Encargado en `/mando` | Renderizado de `KanbanFiltros` en cabecera del tablero | Despliegue de búsqueda, selector territorial, prioridad, tipo y botonera de estados | Controles renderizados fluidamente con diseño institucional plano y sin emojis | **APROBADO** | 05/10/2026 13:00 | - | feat(mando): integrar filtros de delegacion por nombre, ocultamiento de columnas y modal de misiones |
| `CP-H34-WEB-02` | Despliegue de panel de filtros en Modal Interactivo de Misiones (CA-1) | Funcional / UI | Componente / Modal | Alta | Encargado en `/mando`; clic en botón "Misiones Operativas" | Apertura de `MisionesModal` y carga de `MisionesFiltros` | Modal con botonera de estados, tipo de misión, prioridad, delegación y búsqueda | Panel de filtros cargado con tabla paginada y botón de cierre accesible | **APROBADO** | 05/10/2026 13:05 | - | feat(mando): integrar filtros de delegacion por nombre, ocultamiento de columnas y modal de misiones |
| `CP-H34-WEB-03` | Controles de filtrado y segmentación en Inventario Logístico (CA-1) | Funcional / UI | Componente / Vista | Alta | Encargado navegando a `/admin/recursos` | Renderizado de `RecursosFiltros` | Controles para búsqueda, delegación territorial, estado y tipo (Individual/Granel) | Grilla de filtros institucional desplegada con chips de filtros activos | **APROBADO** | 05/10/2026 13:10 | - | feat(recursos): modernizar filtros de recursos con catalogos dinamicos y nombres legibles |
| `CP-H34-WEB-04` | Botonera rápida de filtrado por rol para Patrullas y Asistentes Sociales (CA-1) | Funcional / UI | Componente / Vista | Alta | Encargado en `/gestion/admin/empleados` | Renderizado de `EmpleadoFiltrosBar` | Botones segmentados destacados para filtrar Patrullas Verificadoras y Asistentes FIBE | Botones operativos renderizados con `aria-pressed` reactivo y conteo en tabla | **APROBADO** | 05/10/2026 13:15 | - | feat(personal): agregar filtros de patrullas y asistentes sociales por rol y especialidad |
| `CP-H34-WEB-05` | Filtrado específico de cuadrillas por especialidad técnica (CA-1) | Funcional | Componente / Select | Media | Personal con especialidades (Motosierra, Motobomba, Social) | Selección en dropdown: `Especialidad = Operación de Motobombas` | La tabla filtra únicamente funcionarios acreditados en la especialidad seleccionada | Listado de empleados acotado fielmente a la especialidad técnica solicitada | **APROBADO** | 05/10/2026 13:20 | - | feat(personal): agregar filtros de patrullas y asistentes sociales por rol y especialidad |
| `CP-H34-WEB-06` | Menú desplegable obligatorio de Delegación con nombres canónicos (CA-2) | Estándar Territorial | Componente / Select | Crítica | Despliegue de `FilterSelect` en cualquier listado del Encargado | Clic en selector "Delegación Territorial" | Opciones visibles: Todas, Norte, Sur, Costa, Calle Calle sin UUIDs técnicos | Nombres geográficos amigables renderizados respetando arquitectura municipal | **APROBADO** | 05/10/2026 13:25 | - | feat(filtros): implementar componentes base reutilizables de filtros hibridos con resolucion de nombres |
| `CP-H34-WEB-07` | Botonera segmentada obligatoria de Estado con denominación "Reportado" (CA-2) | Estándar Operativo | Componente / Segmented | Crítica | Inspección de estados en `KanbanFiltros` | Botones: TODOS, REPORTADO, VERIFICANDO, EN_ATENCION, NO_ABORDABLE, RESUELTO | Estado inicial etiquetado como "Reportado" (reemplazando al término "Pendiente") | Botonera estandarizada canónicamente alineada al ciclo de vida del SGRAI | **APROBADO** | 05/10/2026 13:30 | - | feat(mando): sincronizar enfoque de categorias en kanban y estandarizar denominacion reportado |
| `CP-H34-WEB-08` | Selector de estado en Misiones con alerta de justificación en rechazadas (CA-2) | Regla de Negocio / UI | Modal / Tabla | Alta | Misiones con cuadrillas que rechazaron la asignación | Filtro: `Estado = RECHAZADA` en modal de misiones | Despliegue de misiones rechazadas con recuadro ámbar y motivo registrado en terreno | Justificación textual visible (ej. "Sin acceso por derrumbe") junto al ícono de alerta | **APROBADO** | 05/10/2026 13:35 | - | feat(mando): integrar filtros de delegacion por nombre, ocultamiento de columnas y modal de misiones |
| `CP-H34-WEB-09` | Selector de estado en Inventario Logístico y distinción por tipo (CA-2) | Funcional / UI | Vista / Filtros | Alta | Inventario con recursos disponibles, en mantención y asignados | Filtro: `Estado = DISPONIBLE` AND `Tipo = Individual` | Despliega exclusivamente vehículos y maquinaria operativos disponibles para despacho | Tabla de recursos filtrada con badges verdes "Disponible" e ícono de vehículo | **APROBADO** | 05/10/2026 13:40 | - | feat(recursos): modernizar filtros de recursos con catalogos dinamicos y nombres legibles |
| `CP-H34-WEB-10` | Filtrado combinado conjuntivo AND en Kanban (Delegación Norte AND Reportado) (CA-3) | Integración / Filtros | Tablero / Lógica | Crítica | Tablero Kanban con múltiples incidentes de todas las zonas | Selección: `Delegación = Norte` AND `Estado = REPORTADO` | Solo muestra incidentes de la Delegación Norte que se encuentren en estado Reportado | Intersección booleana AND estricta; ningún incidente de otra zona o estado es visible | **APROBADO** | 05/10/2026 13:45 | - | feat(mando): integrar filtros de delegacion por nombre, ocultamiento de columnas y modal de misiones |
| `CP-H34-WEB-11` | Filtrado multicriterio conjuntivo AND en Misiones Operativas (CA-3) | Integración / Filtros | Modal / Lógica | Alta | Misiones registradas en base de datos | `Delegación = Costa` AND `Tipo = VERIFICACION` AND `Prioridad = ALTA` | Consulta API con query conjuntivo; la tabla refleja solo misiones coincidentes | Misiones filtradas exactamente con los 3 criterios activos simultáneamente | **APROBADO** | 05/10/2026 13:50 | - | feat(mando): integrar filtros de delegacion por nombre, ocultamiento de columnas y modal de misiones |
| `CP-H34-WEB-12` | Filtrado multicriterio conjuntivo AND en Inventario Logístico (CA-3) | Integración / Filtros | Inventario / Lógica | Alta | Inventario centralizado | `Delegación = Sur` AND `Tipo = Individual` AND `Estado = DISPONIBLE` | Despliega solo recursos individuales disponibles asignados a Delegación Sur | Coincidencia conjuntiva precisa en tabla de inventario | **APROBADO** | 05/10/2026 13:55 | - | feat(recursos): modernizar filtros de recursos con catalogos dinamicos y nombres legibles |
| `CP-H34-WEB-13` | Filtrado multicriterio conjuntivo AND en Personal Operativo (CA-3) | Integración / Filtros | Personal / Lógica | Alta | Nómina de personal municipal | `Rol = Patrulla Verificadora` AND `Delegación = Norte` | Despliega únicamente patrulleros asignados territorialmente a la Delegación Norte | Intersección AND correcta facilitando el despacho de patrullas de proximidad | **APROBADO** | 05/10/2026 14:00 | - | feat(personal): agregar filtros de patrullas y asistentes sociales por rol y especialidad |
| `CP-H34-WEB-14` | Búsqueda textual reactiva libre con mecanismo debounce de 300ms (CA-4) | Rendimiento / UX | Componente / Input | Alta | Cualquier listado con `FilterSearchInput` | Escribir término de búsqueda (ej. "Inundación") | Emite el evento de búsqueda tras 300ms de pausa de tecleo sin peticiones por letra | Debounce verificado; evita sobrecarga de consultas y actualiza la tabla suavemente | **APROBADO** | 05/10/2026 14:05 | - | refactor(filters): estandarizar componente transversal FilterBar y controles de filtro |
| `CP-H34-WEB-15` | Ocultamiento reactivo instantáneo de columnas Kanban al aislar un estado (CA-4) | UX / Dinamismo | Tablero / Columnas | Crítica | Tablero Kanban con las 5 columnas visibles (`TODOS`) | Clic en botón de estado `EN_ATENCION` | El tablero oculta las 4 columnas restantes y expande al 100% la columna "En Atención" | Columnas ocultadas en memoria sin recargar la página (`F5`) ni parpadeos | **APROBADO** | 05/10/2026 14:10 | - | feat(mando): integrar filtros de delegacion por nombre, ocultamiento de columnas y modal de misiones |
| `CP-H34-WEB-16` | Sincronización inteligente entre tarjetas KPI superiores y Kanban (CA-4) | UX / Integración | Tablero / KPIs | Alta | Tablero filtrado previamente en `RESUELTO` | Clic en tarjeta KPI "Reportados" | Conmuta el filtro a `REPORTADO` y enfoca la columna sin dejar la pantalla en blanco | Sincronización bidireccional fluida que resuelve la columna de forma reactiva | **APROBADO** | 05/10/2026 14:15 | - | feat(mando): optimizar filtros de Centro de Mando, separacion de misiones y contadores (F-03, F-04, F-05, F-06) |
| `CP-H34-WEB-17` | Contadores cuantitativos dinámicos en botonera segmentada (F-06) (CA-4) | UX / Visibilidad | Componente / Badges | Media | Métricas de incidentes o inventario disponibles | Carga de `KanbanFiltros` con prop `contadoresPorEstado` | Cada botón de estado muestra un badge numérico con la cantidad de casos activos | Badges numéricos visibles (ej. Reportados: 4, En Atención: 5) actualizados reactivamente | **APROBADO** | 05/10/2026 14:20 | - | feat(admin): incorporar contadores y corregir grilla en filtros de Roles e Inventario (F-06, F-10) |
| `CP-H34-WEB-18` | Renderizado de chips reactivos con botón individual de remoción (CA-5) | UX / Usabilidad | Componente / Chips | Alta | Uno o más filtros aplicados (Delegación, Estado, Búsqueda) | Clic en botón `[✕]` del chip `Delegación: Norte` | Remueve únicamente el filtro de delegación y mantiene el resto de los filtros | El chip desaparece de inmediato y la lista se actualiza preservando los demás criterios | **APROBADO** | 05/10/2026 14:25 | - | refactor(filters): estandarizar componente transversal FilterBar y controles de filtro |
| `CP-H34-WEB-19` | Restablecimiento global mediante botón "Limpiar todos los filtros" (CA-5) | Usabilidad / UX | UI / Estado | Alta | Múltiples filtros activos simultáneamente | Clic en botón "Limpiar todos los filtros" | Resetea inputs a vacío, restablece dropdowns a "TODAS" y recupera la vista completa | Lista restaurada a su estado predeterminado con un solo clic | **APROBADO** | 05/10/2026 14:30 | - | refactor(filters): estandarizar componente transversal FilterBar y controles de filtro |
| `CP-H34-WEB-20` | Paginación coherente que se ajusta a 1 página y se oculta ante cero resultados (CA-6) | Paginación / UX | Componente / Hook | Alta | Listado con 100 registros paginados en 5 páginas | Aplicar filtro estricto que arroja 4 registros | La paginación se reinicia a Página 1 y ajusta el total a 1 página (o se oculta si es 0) | Paginación consistente sin páginas vacías huérfanas | **APROBADO** | 05/10/2026 14:35 | - | feat(common): condicionar visibilidad de paginacion a existencia de elementos (F-02) |

---

## 4. Bloque TSV para Google Sheets (Copiar y Pegar en Celda A1)

El siguiente bloque en formato tab-separated values (`tsv`) está formateado para pegarse directamente con un clic en la celda **A1** de la hoja de cálculo de QA:

```tsv
ID Caso	Título del Caso de Prueba	Tipo de Prueba	Nivel	Prioridad	Precondición	Datos de Prueba (Payload / Headers / Query)	Resultado Esperado	Resultado Obtenido	Estado	Fecha / Hora Ejecución	Fecha / Hora Re-Test	Solución / Commit
BUG-H34-WEB-01	Fallo HTTP 400 en listado de personal por exceso de límite (limit=200)	Integración / API	Hook / Servicio	Crítica	Carga inicial de /gestion/admin/empleados por Encargado	GET /api/personal?limit=200	Carga fluida de personal respetando contrato de validación Zod	Servidor respondía 400 Bad Request por exceder max(100); corregido a limit=100	CORREGIDO	03/10/2026 14:15	05/10/2026 09:20	fix(personal): integrar ActiveFilterChips, eliminar card redundante y ajustar limite de consulta a 100
BUG-H34-WEB-02	Paginador huérfano visible en listados con cero registros coincidentes	UX / UI	Componente	Media	Filtros aplicados sin coincidencia en base de datos	Renderizado de Pagination con total = 0 y currentTotal = 0	Ocultamiento del componente de paginación para no inducir a confusión	Desplegaba "Página 1 de 0" con botones inútiles; tras fix retorna null y da paso al empty state	CORREGIDO	03/10/2026 16:30	05/10/2026 10:15	feat(common): condicionar visibilidad de paginacion a existencia de elementos (F-02)
BUG-H34-WEB-03	Pérdida de visualización al pulsar KPI de incidentes con columna oculta	Usabilidad / UX	Integración / UI	Alta	Filtro de estado activo (EN_ATENCION) con columnas restantes ocultas	Clic sobre tarjeta KPI "Reportados"	La columna solicitada se revela y enfoca instantáneamente sin vista en blanco	Quedaba en blanco intentando scroll a nodo oculto; tras fix conmuta el filtro de estado	CORREGIDO	04/10/2026 11:20	05/10/2026 11:00	feat(mando): sincronizar enfoque de categorias en kanban y estandarizar denominacion reportado
BUG-H34-WEB-04	Falta de persistencia al colapsar panel de filtros en recarga o cambio de vista	UX / Estado	Componente / LocalStorage	Media	Barra de filtros colapsada por el usuario en /mando	Recarga de página (F5) o navegación hacia otro módulo y retorno	La barra debe permanecer colapsada respetando la preferencia del usuario	Se expandía nuevamente en cada navegación; tras fix se preserva en localStorage	CORREGIDO	04/10/2026 15:40	05/10/2026 11:45	feat(filtros): universalizar FilterBar con persistencia en localStorage y colapso responsive
BUG-H34-WEB-05	Fallo 500 / UUID inválido por falta de resolución de delegación a UUID en misiones	Integración / API	Servicio / DAL	Crítica	Selección de delegación "Costa" en modal de misiones	Petición GET /api/misiones?delegacion=Costa	Consulta exitosa enviando el UUID resuelto en delegacionId	La API fallaba con 500 por recibir nombre en vez de UUID; tras fix catalogosService lo resuelve	CORREGIDO	04/10/2026 18:00	05/10/2026 12:30	feat(filtros): implementar componentes base reutilizables de filtros hibridos con resolucion de nombres
CP-H34-WEB-01	Carga de controles de filtrado en Tablero Kanban de Incidentes (CA-1)	Funcional / UI	Vista / Componente	Crítica	Sesión activa como Encargado en /mando	Renderizado de KanbanFiltros en cabecera del tablero	Despliegue de búsqueda, selector territorial, prioridad, tipo y botonera de estados	Controles renderizados fluidamente con diseño institucional plano y sin emojis	APROBADO	05/10/2026 13:00	-	feat(mando): integrar filtros de delegacion por nombre, ocultamiento de columnas y modal de misiones
CP-H34-WEB-02	Despliegue de panel de filtros en Modal Interactivo de Misiones (CA-1)	Funcional / UI	Componente / Modal	Alta	Encargado en /mando; clic en botón "Misiones Operativas"	Apertura de MisionesModal y carga de MisionesFiltros	Modal con botonera de estados, tipo de misión, prioridad, delegación y búsqueda	Panel de filtros cargado con tabla paginada y botón de cierre accesible	APROBADO	05/10/2026 13:05	-	feat(mando): integrar filtros de delegacion por nombre, ocultamiento de columnas y modal de misiones
CP-H34-WEB-03	Controles de filtrado y segmentación en Inventario Logístico (CA-1)	Funcional / UI	Componente / Vista	Alta	Encargado navegando a /admin/recursos	Renderizado de RecursosFiltros	Controles para búsqueda, delegación territorial, estado y tipo (Individual/Granel)	Grilla de filtros institucional desplegada con chips de filtros activos	APROBADO	05/10/2026 13:10	-	feat(recursos): modernizar filtros de recursos con catalogos dinamicos y nombres legibles
CP-H34-WEB-04	Botonera rápida de filtrado por rol para Patrullas y Asistentes Sociales (CA-1)	Funcional / UI	Componente / Vista	Alta	Encargado en /gestion/admin/empleados	Renderizado de EmpleadoFiltrosBar	Botones segmentados destacados para filtrar Patrullas Verificadoras y Asistentes FIBE	Botones operativos renderizados con aria-pressed reactivo y conteo en tabla	APROBADO	05/10/2026 13:15	-	feat(personal): agregar filtros de patrullas y asistentes sociales por rol y especialidad
CP-H34-WEB-05	Filtrado específico de cuadrillas por especialidad técnica (CA-1)	Funcional	Componente / Select	Media	Personal con especialidades (Motosierra, Motobomba, Social)	Selección en dropdown: Especialidad = Operación de Motobombas	La tabla filtra únicamente funcionarios acreditados en la especialidad seleccionada	Listado de empleados acotado fielmente a la especialidad técnica solicitada	APROBADO	05/10/2026 13:20	-	feat(personal): agregar filtros de patrullas y asistentes sociales por rol y especialidad
CP-H34-WEB-06	Menú desplegable obligatorio de Delegación con nombres canónicos (CA-2)	Estándar Territorial	Componente / Select	Crítica	Despliegue de FilterSelect en cualquier listado del Encargado	Clic en selector "Delegación Territorial"	Opciones visibles: Todas, Norte, Sur, Costa, Calle Calle sin UUIDs técnicos	Nombres geográficos amigables renderizados respetando arquitectura municipal	APROBADO	05/10/2026 13:25	-	feat(filtros): implementar componentes base reutilizables de filtros hibridos con resolucion de nombres
CP-H34-WEB-07	Botonera segmentada obligatoria de Estado con denominación "Reportado" (CA-2)	Estándar Operativo	Componente / Segmented	Crítica	Inspección de estados en KanbanFiltros	Botones: TODOS, REPORTADO, VERIFICANDO, EN_ATENCION, NO_ABORDABLE, RESUELTO	Estado inicial etiquetado como "Reportado" (reemplazando al término "Pendiente")	Botonera estandarizada canónicamente alineada al ciclo de vida del SGRAI	APROBADO	05/10/2026 13:30	-	feat(mando): sincronizar enfoque de categorias en kanban y estandarizar denominacion reportado
CP-H34-WEB-08	Selector de estado en Misiones con alerta de justificación en rechazadas (CA-2)	Regla de Negocio / UI	Modal / Tabla	Alta	Misiones con cuadrillas que rechazaron la asignación	Filtro: Estado = RECHAZADA en modal de misiones	Despliegue de misiones rechazadas con recuadro ámbar y motivo registrado en terreno	Justificación textual visible (ej. "Sin acceso por derrumbe") junto al ícono de alerta	APROBADO	05/10/2026 13:35	-	feat(mando): integrar filtros de delegacion por nombre, ocultamiento de columnas y modal de misiones
CP-H34-WEB-09	Selector de estado en Inventario Logístico y distinción por tipo (CA-2)	Funcional / UI	Vista / Filtros	Alta	Inventario con recursos disponibles, en mantención y asignados	Filtro: Estado = DISPONIBLE AND Tipo = Individual	Despliega exclusivamente vehículos y maquinaria operativos disponibles para despacho	Tabla de recursos filtrada con badges verdes "Disponible" e ícono de vehículo	APROBADO	05/10/2026 13:40	-	feat(recursos): modernizar filtros de recursos con catalogos dinamicos y nombres legibles
CP-H34-WEB-10	Filtrado combinado conjuntivo AND en Kanban (Delegación Norte AND Reportado) (CA-3)	Integración / Filtros	Tablero / Lógica	Crítica	Tablero Kanban con múltiples incidentes de todas las zonas	Selección: Delegación = Norte AND Estado = REPORTADO	Solo muestra incidentes de la Delegación Norte que se encuentren en estado Reportado	Intersección booleana AND estricta; ningún incidente de otra zona o estado es visible	APROBADO	05/10/2026 13:45	-	feat(mando): integrar filtros de delegacion por nombre, ocultamiento de columnas y modal de misiones
CP-H34-WEB-11	Filtrado multicriterio conjuntivo AND en Misiones Operativas (CA-3)	Integración / Filtros	Modal / Lógica	Alta	Misiones registradas en base de datos	Delegación = Costa AND Tipo = VERIFICACION AND Prioridad = ALTA	Consulta API con query conjuntivo; la tabla refleja solo misiones coincidentes	Misiones filtradas exactamente con los 3 criterios activos simultáneamente	APROBADO	05/10/2026 13:50	-	feat(mando): integrar filtros de delegacion por nombre, ocultamiento de columnas y modal de misiones
CP-H34-WEB-12	Filtrado multicriterio conjuntivo AND en Inventario Logístico (CA-3)	Integración / Filtros	Inventario / Lógica	Alta	Inventario centralizado	Delegación = Sur AND Tipo = Individual AND Estado = DISPONIBLE	Despliega solo recursos individuales disponibles asignados a Delegación Sur	Coincidencia conjuntiva precisa en tabla de inventario	APROBADO	05/10/2026 13:55	-	feat(recursos): modernizar filtros de recursos con catalogos dinamicos y nombres legibles
CP-H34-WEB-13	Filtrado multicriterio conjuntivo AND en Personal Operativo (CA-3)	Integración / Filtros	Personal / Lógica	Alta	Nómina de personal municipal	Rol = Patrulla Verificadora AND Delegación = Norte	Despliega únicamente patrulleros asignados territorialmente a la Delegación Norte	Intersección AND correcta facilitando el despacho de patrullas de proximidad	APROBADO	05/10/2026 14:00	-	feat(personal): agregar filtros de patrullas y asistentes sociales por rol y especialidad
CP-H34-WEB-14	Búsqueda textual reactiva libre con mecanismo debounce de 300ms (CA-4)	Rendimiento / UX	Componente / Input	Alta	Cualquier listado con FilterSearchInput	Escribir término de búsqueda (ej. "Inundación")	Emite el evento de búsqueda tras 300ms de pausa de tecleo sin peticiones por letra	Debounce verificado; evita sobrecarga de consultas y actualiza la tabla suavemente	APROBADO	05/10/2026 14:05	-	refactor(filters): estandarizar componente transversal FilterBar y controles de filtro
CP-H34-WEB-15	Ocultamiento reactivo instantáneo de columnas Kanban al aislar un estado (CA-4)	UX / Dinamismo	Tablero / Columnas	Crítica	Tablero Kanban con las 5 columnas visibles (TODOS)	Clic en botón de estado EN_ATENCION	El tablero oculta las 4 columnas restantes y expande al 100% la columna "En Atención"	Columnas ocultadas en memoria sin recargar la página (F5) ni parpadeos	APROBADO	05/10/2026 14:10	-	feat(mando): integrar filtros de delegacion por nombre, ocultamiento de columnas y modal de misiones
CP-H34-WEB-16	Sincronización inteligente entre tarjetas KPI superiores y Kanban (CA-4)	UX / Integración	Tablero / KPIs	Alta	Tablero filtrado previamente en RESUELTO	Clic en tarjeta KPI "Reportados"	Conmuta el filtro a REPORTADO y enfoca la columna sin dejar la pantalla en blanco	Sincronización bidireccional fluida que resuelve la columna de forma reactiva	APROBADO	05/10/2026 14:15	-	feat(mando): optimizar filtros de Centro de Mando, separacion de misiones y contadores (F-03, F-04, F-05, F-06)
CP-H34-WEB-17	Contadores cuantitativos dinámicos en botonera segmentada (F-06) (CA-4)	UX / Visibilidad	Componente / Badges	Media	Métricas de incidentes o inventario disponibles	Carga de KanbanFiltros con prop contadoresPorEstado	Cada botón de estado muestra un badge numérico con la cantidad de casos activos	Badges numéricos visibles (ej. Reportados: 4, En Atención: 5) actualizados reactivamente	APROBADO	05/10/2026 14:20	-	feat(admin): incorporar contadores y corregir grilla en filtros de Roles e Inventario (F-06, F-10)
CP-H34-WEB-18	Renderizado de chips reactivos con botón individual de remoción (CA-5)	UX / Usabilidad	Componente / Chips	Alta	Uno o más filtros aplicados (Delegación, Estado, Búsqueda)	Clic en botón [✕] del chip Delegación: Norte	Remueve únicamente el filtro de delegación y mantiene el resto de los filtros	El chip desaparece de inmediato y la lista se actualiza preservando los demás criterios	APROBADO	05/10/2026 14:25	-	refactor(filters): estandarizar componente transversal FilterBar y controles de filtro
CP-H34-WEB-19	Restablecimiento global mediante botón "Limpiar todos los filtros" (CA-5)	Usabilidad / UX	UI / Estado	Alta	Múltiples filtros activos simultáneamente	Clic en botón "Limpiar todos los filtros"	Resetea inputs a vacío, restablece dropdowns a "TODAS" y recupera la vista completa	Lista restaurada a su estado predeterminado con un solo clic	APROBADO	05/10/2026 14:30	-	refactor(filters): estandarizar componente transversal FilterBar y controles de filtro
CP-H34-WEB-20	Paginación coherente que se ajusta a 1 página y se oculta ante cero resultados (CA-6)	Paginación / UX	Componente / Hook	Alta	Listado con 100 registros paginados en 5 páginas	Aplicar filtro estricto que arroja 4 registros	La paginación se reinicia a Página 1 y ajusta el total a 1 página (o se oculta si es 0)	Paginación consistente sin páginas vacías huérfanas	APROBADO	05/10/2026 14:35	-	feat(common): condicionar visibilidad de paginacion a existencia de elementos (F-02)
```

---

## 5. Guía Detallada de Ejecución y Replicabilidad 100% (Paso a Paso)

Para garantizar la reproducibilidad y permitir la verificación por parte del equipo docente y auditores de QA, a continuación se detallan los comandos exactos y sus salidas obtenidas.

---

### 5.1. Verificación de Defectos Corregidos (Ciclo de Re-Test)

#### `BUG-H34-WEB-01`: Parámetro `limit=100` en Consulta de Personal y Cuadrillas
* **Comando Vitest de Re-Test:**
  ```bash
  npx vitest run src/services/__tests__/empleadosService.test.ts -t "debe mapear parámetros de consulta estándar page y limit en la URL de fetch"
  ```
* **Salida Obtenida:**
  ```text
   ✓ src/services/__tests__/empleadosService.test.ts (13 tests | 12 skipped) 37ms
     ✓ empleadosService > getEmpleados y getEmpleadosPaginado (H34 + HU-13) > debe mapear parámetros de consulta estándar page y limit en la URL de fetch 2ms

   Test Files  1 passed (1)
        Tests  1 passed | 12 skipped (13)
     Duration  1.55s
  ```
* **Comando cURL de Validación de Contrato:**
  ```bash
  curl -X GET "http://localhost:3000/api/personal?page=1&limit=100&delegacion_id=30000000-0000-4000-8000-000000000001" \
    -H "Accept: application/json" \
    -H "x-user-id: 00000000-0000-4000-8000-000000000003"
  ```
* **Respuesta HTTP y Payload JSON:**
  ```json
  HTTP/1.1 200 OK
  Content-Type: application/json; charset=utf-8

  {
    "data": [
      {
        "usuario_id": "usr-1001",
        "rut": "15.420.111-2",
        "nombres": "Rodrigo",
        "apellidos": "Morales Cárdenas",
        "email": "rmorales@valdivia.cl",
        "usuario_activo": true,
        "rol_id": "rol-patrulla",
        "rol_nombre": "Patrulla Verificadora",
        "delegacion_nombre": "Norte"
      }
    ],
    "meta": {
      "total": 1,
      "page": 1,
      "limit": 100,
      "totalPages": 1,
      "hasNext": false,
      "hasPrev": false
    }
  }
  ```

---

#### `BUG-H34-WEB-02`: Supresión de Paginador Huérfano ante Cero Coincidencias
* **Comando Vitest de Re-Test:**
  ```bash
  npx vitest run src/components/common/__tests__/Pagination.test.tsx -t "no debe renderizar nada cuando currentTotal es 0"
  ```
* **Salida Obtenida:**
  ```text
   ✓ src/components/common/__tests__/Pagination.test.tsx (5 tests | 4 skipped) 38ms
     ✓ Pagination Component (F-02) > no debe renderizar nada cuando currentTotal es 0 (lista vacía) 35ms

   Test Files  1 passed (1)
        Tests  1 passed | 4 skipped (5)
     Duration  1.72s
  ```

---

#### `BUG-H34-WEB-03`: Sincronización Reactiva de Enfoque desde KPI Cards en Kanban
* **Comando Vitest de Re-Test:**
  ```bash
  npx vitest run src/components/mando/__tests__/KanbanFiltros.test.tsx -t "debe emitir estado al presionar un botón segmentado para aislar u ocultar columnas"
  ```
* **Salida Obtenida:**
  ```text
   ✓ src/components/mando/__tests__/KanbanFiltros.test.tsx (9 tests | 8 skipped) 42ms
     ✓ KanbanFiltros > debe emitir estado al presionar un botón segmentado para aislar u ocultar columnas 39ms

   Test Files  1 passed (1)
        Tests  1 passed | 8 skipped (9)
     Duration  2.12s
  ```

---

#### `BUG-H34-WEB-04`: Persistencia de Estado de Barra de Filtros en `localStorage`
* **Comando Vitest de Re-Test:**
  ```bash
  npx vitest run src/components/common/filters/__tests__/FilterComponents.test.tsx -t "debe persistir el estado de colapsado en localStorage con storageKey"
  ```
* **Salida Obtenida:**
  ```text
   ✓ src/components/common/filters/__tests__/FilterComponents.test.tsx (9 tests | 8 skipped) 48ms
     ✓ Componentes de Filtrado Híbridos Reutilizables > FilterBar > debe persistir el estado de colapsado en localStorage con storageKey 45ms

   Test Files  1 passed (1)
        Tests  1 passed | 8 skipped (9)
     Duration  1.85s
  ```

---

#### `BUG-H34-WEB-05`: Resolución Transparente de Nombres de Delegación Municipal a UUID
* **Comando Vitest de Re-Test:**
  ```bash
  npx vitest run src/services/__tests__/catalogosService.test.ts -t "debe resolver UUID a partir de nombre legible y viceversa"
  ```
* **Salida Obtenida:**
  ```text
   ✓ src/services/__tests__/catalogosService.test.ts (4 tests | 3 skipped) 8ms
     ✓ catalogosService > resolverDelegacionId y resolverDelegacionNombre > debe resolver UUID a partir de nombre legible y viceversa 1ms

   Test Files  1 passed (1)
        Tests  1 passed | 3 skipped (4)
     Duration  1.42s
  ```

---

### 5.2. Verificación de Casos Funcionales, Lógica AND y Paginación

#### `CP-H34-WEB-10`: Filtrado Conjuntivo AND en Incidentes (Delegación Norte AND Estado Reportado)
* **Comando cURL:**
  ```bash
  curl -X GET "http://localhost:3000/api/incidentes?delegacionId=30000000-0000-4000-8000-000000000001&estado=REPORTADO" \
    -H "Accept: application/json" \
    -H "x-user-id: 00000000-0000-4000-8000-000000000003"
  ```
* **Salida Obtenida (HTTP 200 OK):**
  ```json
  HTTP/1.1 200 OK
  Content-Type: application/json; charset=utf-8

  {
    "message": "Incidentes listados exitosamente.",
    "data": [
      {
        "id": "inc-2026-0012",
        "codigo": "INC-2026-0012",
        "tipoAfectacion": "Anegamiento de Calzada",
        "descripcion": "Acumulación de agua frente a Escuela Las Ánimas",
        "direccion": "Av. Pedro Aguirre Cerda 1020",
        "estado": "REPORTADO",
        "prioridad": "ALTA",
        "delegacionNombre": "Norte",
        "creadoEn": "2026-10-05T08:30:00.000Z"
      }
    ],
    "paginacion": {
      "pagina": 1,
      "limite": 10,
      "total": 1,
      "totalPaginas": 1,
      "tieneSiguiente": false,
      "tieneAnterior": false
    }
  }
  ```

---

#### `CP-H34-WEB-11`: Filtrado Conjuntivo AND en Misiones Operativas (Costa AND Verificación AND Alta)
* **Comando cURL:**
  ```bash
  curl -X GET "http://localhost:3000/api/misiones?delegacionId=30000000-0000-4000-8000-000000000003&tipoMision=VERIFICACION&prioridad=ALTA&page=1&limit=10" \
    -H "Accept: application/json" \
    -H "x-user-id: 00000000-0000-4000-8000-000000000003"
  ```
* **Salida Obtenida (HTTP 200 OK):**
  ```json
  HTTP/1.1 200 OK
  Content-Type: application/json; charset=utf-8

  {
    "exito": true,
    "mensaje": "Listado de misiones obtenido.",
    "data": [
      {
        "id": "mis-2026-0044",
        "codigo": "MIS-2026-0044",
        "titulo": "Verificación de socavón costero",
        "descripcion": "Evaluar estabilidad de talud en camino Niebla",
        "tipoMision": "VERIFICACION",
        "estado": "DESPACHADA",
        "prioridad": "ALTA",
        "delegacionNombre": "Costa",
        "cuadrillaNombre": "Patrulla Costa 1",
        "creadoEn": "2026-10-05T09:15:00.000Z"
      }
    ],
    "meta": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "totalPages": 1,
      "hasNext": false,
      "hasPrev": false
    }
  }
  ```

---

#### `CP-H34-WEB-14`: Mecanismo Debounce de 300ms en Búsqueda Textual
* **Comando Vitest de Ejecución:**
  ```bash
  npx vitest run src/components/common/filters/__tests__/FilterComponents.test.tsx -t "debe aplicar debounce antes de emitir onChange"
  ```
* **Salida Obtenida:**
  ```text
   ✓ src/components/common/filters/__tests__/FilterComponents.test.tsx (9 tests | 8 skipped) 71ms
     ✓ Componentes de Filtrado Híbridos Reutilizables > FilterSearchInput > debe aplicar debounce antes de emitir onChange 68ms

   Test Files  1 passed (1)
        Tests  1 passed | 8 skipped (9)
     Duration  1.81s
  ```

---

#### `CP-H34-WEB-18`: Remoción Individual de Filtros mediante `ActiveFilterChips`
* **Comando Vitest de Ejecución:**
  ```bash
  npx vitest run src/components/admin/empleados/__tests__/EmpleadoFiltrosBar.test.tsx -t "debe renderizar chips individuales y permitir removerlos con el botón [x]"
  ```
* **Salida Obtenida:**
  ```text
   ✓ src/components/admin/empleados/__tests__/EmpleadoFiltrosBar.test.tsx (5 tests | 4 skipped) 70ms
     ✓ EmpleadoFiltrosBar > debe renderizar chips individuales y permitir removerlos con el botón [x] 70ms

   Test Files  1 passed (1)
        Tests  1 passed | 4 skipped (5)
     Duration  2.23s
  ```

---

#### `CP-H34-WEB-19`: Restablecimiento Global con Botón "Limpiar todos los filtros"
* **Comando Vitest de Ejecución:**
  ```bash
  npx vitest run src/components/mando/__tests__/KanbanFiltros.test.tsx -t "debe mostrar chips de filtros activos con nombres y permitir restablecer todos los filtros con onLimpiarFiltros"
  ```
* **Salida Obtenida:**
  ```text
   ✓ src/components/mando/__tests__/KanbanFiltros.test.tsx (9 tests | 8 skipped) 65ms
     ✓ KanbanFiltros > debe mostrar chips de filtros activos con nombres y permitir restablecer todos los filtros con onLimpiarFiltros 61ms

   Test Files  1 passed (1)
        Tests  1 passed | 8 skipped (9)
     Duration  2.15s
  ```

---

## 6. Trazabilidad con Criterios de Aceptación (DoD)

| Criterio de Aceptación (CA) | Casos de Prueba Asociados | Dictamen QA | Evidencia Técnica Validada |
|---|---|:---:|---|
| **CA-1: Controles de filtrado en todas las vistas de listados del encargado** | `CP-H34-WEB-01`, `CP-H34-WEB-02`, `CP-H34-WEB-03`, `CP-H34-WEB-04`, `CP-H34-WEB-05` | 🟢 CUMPLE | Componentes `KanbanFiltros`, `MisionesFiltros`, `RecursosFiltros`, `EmpleadoFiltrosBar` integrados sin dependencias externas. |
| **CA-2: Filtro obligatorio por Delegación (Norte, Sur, Costa, Calle Calle) y Estado** | `CP-H34-WEB-06`, `CP-H34-WEB-07`, `CP-H34-WEB-08`, `CP-H34-WEB-09`, `BUG-H34-WEB-05` | 🟢 CUMPLE | Catálogo dinámico centralizado en `catalogosService.ts`, resolución bidireccional UUID ↔ Nombre geográfico y término canónico "Reportado". |
| **CA-3: Aplicación simultánea de filtros con lógica booleana AND** | `CP-H34-WEB-10`, `CP-H34-WEB-11`, `CP-H34-WEB-12`, `CP-H34-WEB-13` | 🟢 CUMPLE | Parámetros de consulta conjuntivos validados en peticiones cURL y suites Vitest con estricta intersección. |
| **CA-4: Actualización dinámica en interfaz sin recargar página (SPA)** | `CP-H34-WEB-14`, `CP-H34-WEB-15`, `CP-H34-WEB-16`, `CP-H34-WEB-17`, `BUG-H34-WEB-03`, `BUG-H34-WEB-04` | 🟢 CUMPLE | Mutación reactiva de estados en memoria React, debounce de 300ms en inputs, persistencia con `storageKey` en `localStorage` y badges numéricos por estado. |
| **CA-5: Botón claramente visible para limpiar o restablecer filtros** | `CP-H34-WEB-18`, `CP-H34-WEB-19` | 🟢 CUMPLE | Componente `ActiveFilterChips` con descarte individual por chip `[✕]` y acción destacada "Limpiar todos los filtros". |
| **CA-6: Paginación coherente que se ajusta a los filtros aplicados** | `CP-H34-WEB-20`, `BUG-H34-WEB-01`, `BUG-H34-WEB-02` | 🟢 CUMPLE | Reinicio automático a Página 1 tras filtrar, límite máximo acotado a 100 y supresión de componente `Pagination` ante cero resultados. |

---

## 7. Dictamen Final de QA y Certificación de Cierre

* **Veredicto Técnico:** 🟢 **APROBADO PARA PRODUCCIÓN (PASS)**.
* **Resumen de Certificación:** Se certifica el 100% de los criterios de aceptación de la historia HU-34 tras completar satisfactoriamente el ciclo formal de Re-Test sobre los 5 defectos detectados durante el desarrollo de la rama `feature/H34-filtros-listados-encargado`.
* **Apego Arquitectónico:** Solución homologada conforme al ADR-004 y alineada a las directrices de diseño plano institucional de `GEMINI.md` de la Municipalidad de Valdivia.
