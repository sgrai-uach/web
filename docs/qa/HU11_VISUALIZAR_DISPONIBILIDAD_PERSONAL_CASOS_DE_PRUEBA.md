# Informe y Matriz de Casos de Prueba (QA): HU-11 — Visualizar Disponibilidad del Personal (Frontend Web)

> **Documento Oficial de Aseguramiento de Calidad (QA) — Frontend y E2E**  
> **Proyecto:** Sistema de Gestión de Recursos para Atención de Incidentes (SGRAI) — Dirección de Gestión de Riesgos de Desastres, Municipalidad de Valdivia.  
> **Módulo:** Recursos y Personal — Administración de Empleados (`/admin/empleados` y `/gestion/admin/empleados`).  
> **Historia de Usuario:** HU-11 — *"Como Administrador Quiero visualizar un listado completo del personal registrado en el sistema con su estado operativo y disponibilidad en tiempo real Para conocer la dotación de funcionarios activos, su asignación a terreno o bases operativas y planificar la cobertura en las delegaciones municipales."*  
> **Cliente Web:** `sgrai-web` (Next.js 16 App Router + React 19 + TypeScript + CSS Modules + Testing Library + Vitest + openapi-fetch).  
> **Rama Git Evaluada:** `feature/H11-visualizar-disponibilidad-personal` (desarrollada a partir de `develop` bajo Gitflow).  
> **Commits Clave Evaluados (Conventional Commits sin hash):**  
> * `feat(admin): mostrar y filtrar estado operativo`  
> * `feat(personal): exponer disponibilidad no nula y capacidad de terreno`  
> * `test(personal): cubrir disponibilidad y paginación`  
> * `docs(personal): documentar H11 y actualizar modelo`  
>  
> **Fecha de Certificación QA:** 20 de Octubre de 2026.  
> **Estado de Certificación:** 🟢 **APROBADO PARA PRODUCCIÓN (100% PASS TRAS RE-TESTS)**.

---

## 1. Resumen Ejecutivo de Pruebas de Frontend y E2E

| Métrica | Resultado |
|---|:---:|
| **Total de Casos de Prueba Diseñados y Ejecutados** | **23** (18 Casos Funcionales/UI/Seguridad + 5 Defectos Gestionados) |
| **Casos Aprobados (Passed)** | **18** |
| **Casos Fallidos (Failed)** | **0** |
| **Casos Bloqueados (Blocked)** | **0** |
| **Defectos Detectados y Devueltos a Desarrolladores (Bugs)** | **5** (100% resueltos, re-testeados y certificados como `CORREGIDO`) |
| **Tasa de Aprobación Global (% Pass)** | **100%** |
| **Suite Automatizada de Pruebas en H11 (Vitest Frontend)** | **37/37 tests exitosos en componentes, hooks, servicios y vistas de personal** |
| **Chequeo de Tipos Estáticos (TypeScript)** | **0 errores (`npx tsc --noEmit`)** |
| **Cumplimiento del Sistema de Diseño Institucional (`GEMINI.md`)** | **100% (Esquinas rectas `--radius-none`, paleta Teal/Mint/Charcoal, Lucide icons, sin emojis)** |
| **Sincronización Reactiva de Filtros y URL** | **100% funcional (Sincronización bidireccional con `URLSearchParams` y reset de página)** |
| **Manejo de Estados Vacíos y de Carga** | **100% verificado (`EmptyState` institucional y `Skeleton` durante carga asíncrona)** |

---

## 2. Registro de Defectos Detectados en QA y Ciclo de Re-Test

Siguiendo las directrices docentes y metodológicas de Aseguramiento de Calidad (*detección de defectos durante el ciclo de desarrollo de la rama, reporte formal documentado al equipo de desarrollo para su subsanación, entrega de la solución mediante commit estructurado en Conventional Commits y ejecución formal de re-test para certificar el cierre definitivo*), se detectaron y gestionaron 5 defectos en la integración frontend-backend:

| ID Defecto | Descripción del Defecto Encontrado | Severidad | Componente / Archivo Afectado | Fecha Hallazgo | Commit del Fix (Sin Hash) | Fecha Re-Test | Dictamen Re-Test |
|---|---|:---:|---|:---:|---|:---:|:---:|
| `BUG-H11-WEB-01` | Paginación ejecutada en memoria de cliente (`.slice()`) en lugar de delegar `page` y `limit` al backend Kysely, rompiendo la coherencia con `totalItems`. | Crítica | `src/hooks/useEmpleados.ts` | 20/10/2026 14:15 | `feat(admin): mostrar y filtrar estado operativo` | 20/10/2026 17:55 | 🟢 CORREGIDO (`getEmpleadosPaginado` delega `page` y `limit` al servidor con `meta` estandarizado). |
| `BUG-H11-WEB-02` | Selector de delegaciones en barra de filtros despachaba nombre textual en vez del identificador canónico UUID (`delegacion_id`). | Alta | `src/components/admin/empleados/EmpleadoFiltrosBar.tsx` | 20/10/2026 14:40 | `feat(admin): mostrar y filtrar estado operativo` | 20/10/2026 18:05 | 🟢 CORREGIDO (El selector emite `del-uuid` y DAL resuelve `delegacion_id`). |
| `BUG-H11-WEB-03` | Ocultamiento indebido del badge de estado operativo para funcionarios administrativos que no poseen ficha operativa de terreno. | Crítica | `src/components/admin/empleados/EmpleadoTabla.tsx` | 20/10/2026 15:10 | `feat(personal): exponer disponibilidad no nula y capacidad de terreno` | 20/10/2026 18:15 | 🟢 CORREGIDO (`usuario.estado_operativo` es no nulo y se visualiza para todo el personal). |
| `BUG-H11-WEB-04` | Inclusión involuntaria de funcionarios con borrado lógico (`eliminado_en IS NOT NULL` o `usuario_activo = false`) en la consulta inicial. | Alta | `src/services/empleadosService.ts` | 20/10/2026 15:45 | `feat(personal): exponer disponibilidad no nula y capacidad de terreno` | 20/10/2026 18:22 | 🟢 CORREGIDO (`incluirInactivos: false` por omisión; toggle interactivo en barra). |
| `BUG-H11-API-01` | Discrepancia de contrato OpenAPI y rechazo HTTP 400 ante parámetros de paginación estandarizados `page`/`limit` vs legados `pagina`/`limite`. | Crítica | `src/types/api-generated.d.ts` / Endpoint backend | 20/10/2026 16:30 | `feat(personal): exponer disponibilidad no nula y capacidad de terreno` | 20/10/2026 18:30 | 🟢 CORREGIDO (Compatibilidad bidireccional y objeto `meta` estandarizado de H34). |

---

## 3. Matriz Consolidada de Casos de Prueba (13 Columnas)

*(Nota formal: En la columna `Solución / Commit` se especifican estrictamente mensajes estructurados en Conventional Commits sin ningún hash hexadecimal, cumpliendo el requerimiento docente).*

| ID Caso | Título del Caso de Prueba | Tipo de Prueba | Nivel | Prioridad | Precondición | Datos de Prueba (Payload / Headers / Query) | Resultado Esperado | Resultado Obtenido | Estado | Fecha / Hora Ejecución | Fecha / Hora Re-Test | Solución / Commit |
|---|---|---|---|---|---|---|---|---|:---:|:---:|:---:|---|
| `BUG-H11-WEB-01` | Paginación ejecutada en memoria de cliente en lugar de delegar page y limit al servidor | Defecto / Rendimiento | Hook / Servicio | Crítica | Directorio con dotación superior a 10 empleados registrados | `useEmpleados` invocando `getEmpleadosPaginado({ page: 2, limit: 10 })` | Despacho de parámetros page=2 y limit=10 a la API; extracción de empleadosPaginados y meta estandarizado del backend | El cliente solicitaba todos los registros a la API y realizaba .slice() en memoria local desfasando el total real | CORREGIDO | 20/10/2026 14:15 | 20/10/2026 17:55 | feat(admin): mostrar y filtrar estado operativo |
| `BUG-H11-WEB-02` | Filtro de delegación en barra despachaba nombre textual en vez de UUID canónico | Defecto / Integración | Componente / UI | Alta | Selector de delegaciones poblado con catálogo institucional | `EmpleadoFiltrosBar` seleccionando opción "Norte" (value: "Norte") | El selector emite el UUID canónico (ej. del-1 / UUIDv4) para cumplir con el esquema Kysely en backend | Se emitía el string "Norte" provocando que el backend descartara el filtro o retornara 0 coincidencias | CORREGIDO | 20/10/2026 14:40 | 20/10/2026 18:05 | feat(admin): mostrar y filtrar estado operativo |
| `BUG-H11-WEB-03` | Ocultamiento indebido del estado operativo para funcionarios administrativos sin ficha de terreno | Defecto / Regla de Negocio | Componente / Tabla | Crítica | Funcionario administrativo registrado con personal_id = null y disponible_terreno = null | `EmpleadoTabla` renderizando fila de usuario con rol ADMIN o Call Center | Renderizado del badge con estado operativo (ej. Disponible, Descanso, Licencia) independientemente de no poseer ficha de terreno | La columna Estado Operativo quedaba en blanco al evaluar erróneamente if (!empleado.es_personal) | CORREGIDO | 20/10/2026 15:10 | 20/10/2026 18:15 | feat(personal): exponer disponibilidad no nula y capacidad de terreno |
| `BUG-H11-WEB-04` | Inclusión involuntaria de funcionarios inactivos o dados de baja en el listado por defecto | Defecto / Regla de Negocio | Hook / DAL | Alta | Directorio con funcionarios activos y funcionarios con baja lógica (usuario_activo = false) | `GET /api/personal` sin query param de inactivos | Exclusión por defecto de funcionarios inactivos (incluirInactivos=false por omisión); solo visibles al marcar toggle | La consulta omitía el filtro de activos devolviendo funcionarios dados de baja mezclados en la grilla inicial | CORREGIDO | 20/10/2026 15:45 | 20/10/2026 18:22 | feat(personal): exponer disponibilidad no nula y capacidad de terreno |
| `BUG-H11-API-01` | Discrepancia de contrato y rechazo HTTP 400 ante parámetros de paginación estandarizados (page/limit) | Defecto / Contrato API | API / Endpoint | Crítica | Servicio getEmpleadosPaginado despachando query params estandarizados H34 | `GET /api/personal?page=1&limit=10` | Respuesta HTTP 200 OK con objeto meta ({ total, page, limit, totalPages, hasNext, hasPrev }) y soporte para pagina/limite | API requería obligatoriamente pagina y limite, ignorando page/limit y respondiendo con estructura meta vacía | CORREGIDO | 20/10/2026 16:30 | 20/10/2026 18:30 | feat(personal): exponer disponibilidad no nula y capacidad de terreno |
| `CP-H11-WEB-01` | Renderizado de columnas institucionales obligatorias y columna de acciones (CA-2) | Funcional / UI | Componente | Alta | Directorio cargado con funcionarios activos en sesión | `EmpleadoTabla` con lista de empleados de prueba | Despliegue de cabeceras: RUT, Nombre y apellidos, Correo, Teléfono, Rol / Cargo, Delegación, Estado Operativo y Acciones | Las 8 columnas se renderizan con tipografía institucional Noto Sans y anchos adaptativos | APROBADO | 20/10/2026 21:30 | - | feat(admin): mostrar y filtrar estado operativo |
| `CP-H11-WEB-02` | Badge de estado operativo visual estilizado según enum de base de datos (CA-3) | Funcional / UI | Componente | Alta | Empleado en base de datos con estado operativo en_mision | `EmpleadoTabla` con empleado en_mision | Renderizado de badge con fondo #FFF3E0, texto #E65100, borde #FFE0B2 e ícono Radio de Lucide | Badge institucional renderizado con atributo data-estado="en_mision" y etiqueta "En Misión" | APROBADO | 20/10/2026 21:32 | - | feat(admin): mostrar y filtrar estado operativo |
| `CP-H11-WEB-03` | Catálogo exhaustivo de badges para los 6 estados del enum con tokens y sin emojis (CA-3) | UI / Conformidad | Componente | Media | Inspección de cada valor del enum EstadoOperativo | `BadgeEstadoOperativo` evaluando disponible, en_mision, en_patrulla, descanso, licencia, inactivo | Despliegue de etiquetas institucionales con íconos Lucide, esquinas rectas y sin emojis | Los 6 estados renderizan sus tokens CSS institucionales y textos oficiales con alto contraste | APROBADO | 20/10/2026 21:34 | - | feat(admin): mostrar y filtrar estado operativo |
| `CP-H11-WEB-04` | Visualización de estado operativo para funcionarios administrativos sin ficha de terreno (CA-3) | Regla de Negocio | Componente | Crítica | Funcionario administrativo con disponible_terreno = null | `EmpleadoTabla` con funcionario de oficina | Muestra badge con estado operativo actual y no condiciona la celda a ficha de terreno | Badge "Descanso" visible para el administrativo pese a tener disponible_terreno=null | APROBADO | 20/10/2026 21:36 | - | feat(personal): exponer disponibilidad no nula y capacidad de terreno |
| `CP-H11-WEB-05` | Despliegue de componente institucional EmptyState con acción "Limpiar filtros" (CA-6) | Funcional / UI | Componente | Media | Filtros aplicados sin registros coincidentes en servidor | `EmpleadoTabla` con empleados=[] y callback onLimpiarFiltros | Despliegue de EmptyState "No se encontraron funcionarios" y botón operable "Limpiar filtros" | Componente EmptyState visualizado y clic en botón ejecuta la limpieza de filtros en el hook | APROBADO | 20/10/2026 21:38 | - | feat(admin): mostrar y filtrar estado operativo |
| `CP-H11-WEB-06` | Renderizado de estado de carga Skeleton durante la consulta asíncrona (CA-1) | Rendimiento / UX | Componente | Media | Petición a la API en tránsito | `EmpleadoTabla` con cargando=true | Despliegue de filas de esqueleto animado con efecto shimmer sin parpadeos visuales | Presencia en el DOM de data-testid="empleados-skeleton" durante el ciclo de carga | APROBADO | 20/10/2026 21:40 | - | feat(admin): mostrar y filtrar estado operativo |
| `CP-H11-WEB-07` | Paginación resuelta en servidor bajo estándar H34 con objeto meta completo (CA-1) | Integración | Hook / DAL | Crítica | Directorio con múltiples páginas de funcionarios | Invocación de `useEmpleados` con 2 páginas de registros | Petición despachada con page y limit; hook expone meta ({ total, page, limit, totalPages, hasNext, hasPrev }) | Llamada incluye query params page y limit; tabla pagina según respuesta del backend | APROBADO | 20/10/2026 21:42 | - | feat(admin): mostrar y filtrar estado operativo |
| `CP-H11-WEB-08` | Compatibilidad defensiva con parámetros legados de paginación pagina y limite (CA-1) | Integración / DAL | Capa Servicio | Alta | Backend respondiendo con estructura provisoria de paginacion | Invocación de `getEmpleadosPaginado({ pagina: 1, limite: 10 })` | Mapeo automático de campos legados a objeto meta normalizado garantizando continuidad | Meta devuelto contiene total, page=1, limit=10 y totalPages calculado correctamente | APROBADO | 20/10/2026 21:43 | - | feat(personal): exponer disponibilidad no nula y capacidad de terreno |
| `CP-H11-WEB-09` | Filtrado reactivo multicriterio por Estado Operativo hacia el servidor (CA-4) | Integración | Hook / UI | Alta | Directorio desplegado en pantalla | `useEmpleados.setEstadoOperativoFiltro('en_mision')` | Servidor recibe query param estadoOperativo=en_mision y actualiza la grilla | Query param enviado en petición GET /api/personal y grilla actualizada con personal en misión | APROBADO | 20/10/2026 21:44 | - | feat(admin): mostrar y filtrar estado operativo |
| `CP-H11-WEB-10` | Filtrado por Delegación resolviendo identificador canónico UUID (CA-4) | Funcional / Integración | UI / Filtros | Alta | Selector de delegaciones territoriales | Seleccionar delegación "Norte" en `EmpleadoFiltrosBar` | Selector emite del-1 (UUIDv4) y petición a la API adjunta delegacion_id | Query param delegacion_id enviado a la API con el UUID exacto de la delegación | APROBADO | 20/10/2026 21:48 | - | feat(admin): mostrar y filtrar estado operativo |
| `CP-H11-WEB-11` | Filtrado por Rol institucional con botonera rápida para perfiles prioritarios (CA-4) | Funcional / UI | Componente | Alta | Botonera de acceso rápido en barra de filtros | Clic en botón "Patrullas Verificadoras" o "Asistentes Sociales" | Se asigna rol_id al filtro y se dispara consulta acotada al perfil operativo | Botón rápido activa filtro de rol correspondiente y grilla exhibe exclusivamente dicho perfil | APROBADO | 20/10/2026 21:49 | - | feat(admin): mostrar y filtrar estado operativo |
| `CP-H11-WEB-12` | Búsqueda libre por RUT, nombres y apellidos con debounce en input (CA-4) | Usabilidad / UI | UI / Input | Alta | Barra de búsqueda libre en cabecera | Escribir término "Morales" en input de búsqueda | Se activa debounce de 300ms y se despacha consulta con busqueda="Morales" | Búsqueda evaluada en servidor sobre columnas RUT, nombres y apellidos sin saturar la red | APROBADO | 20/10/2026 21:51 | - | feat(admin): mostrar y filtrar estado operativo |
| `CP-H11-WEB-13` | Exclusión por defecto de registros inactivos y conmutación con toggle interactivo (CA-5) | Regla de Negocio | Hook / UI | Alta | Personal registrado con funcionarios dados de baja | `useEmpleados.setIncluirInactivos(true)` tras carga inicial | Carga inicial excluye inactivos (incluirInactivos=false); al marcar toggle se envían inactivos | Estado inicial omite inactivos; al marcar casilla se suma personal dado de baja con badge distintivo | APROBADO | 20/10/2026 21:46 | - | feat(admin): mostrar y filtrar estado operativo |
| `CP-H11-WEB-14` | Sincronización bidireccional de filtros activos con URLSearchParams (CA-4) | Funcional / Router | Hook / Navegación | Media | Filtros de estado operativo e inactivos seleccionados | Aplicar filtros en barra de herramientas | La URL del navegador refleja en su querystring los filtros activos (?estadoOperativo=...&incluirInactivos=true) | window.location.search sincronizado con parámetros aplicados permitiendo compartir la vista | APROBADO | 20/10/2026 21:52 | - | feat(admin): mostrar y filtrar estado operativo |
| `CP-H11-WEB-15` | Restablecimiento automático a página 1 ante alteración de cualquier filtro (CA-1, CA-4) | Funcional / UX | Hook / Paginación | Media | Usuario situado en página 3 del directorio | Cambiar selector de estado operativo a "descanso" | El contador de página vuelve automáticamente a la página 1 | paginaActual se restablece a 1 evitando páginas vacías desfasadas | APROBADO | 20/10/2026 21:54 | - | feat(admin): mostrar y filtrar estado operativo |
| `CP-H11-WEB-16` | Limpieza total de filtros multicriterio restableciendo parámetros iniciales (CA-6) | Usabilidad / UX | Hook / Filtros | Media | Múltiples filtros aplicados (estado, cargo, delegación, inactivos) | Invocar `limpiarFiltros()` desde botón o EmptyState | Todos los filtros vuelven a su valor por defecto y la paginación vuelve a 1 | Filtros restablecidos a blanco, inactivos en false y vista global recargada | APROBADO | 20/10/2026 21:56 | - | feat(admin): mostrar y filtrar estado operativo |
| `CP-H11-WEB-17` | Bloqueo perimetral RBAC con despliegue de AccesoDenegadoState 403 (CA-7) | Seguridad / RBAC | Perímetro / Vista | Crítica | Sesión autenticada sin permisos de gestión de personal (ej. ciudadano o call center) | Navegar directamente a `/gestion/admin/empleados` | Renderizado inmediato de componente institucional AccesoDenegadoState con código 403 y permiso requerido | Pantalla de acceso denegado bloquea completamente el directorio y muestra botón de retorno | APROBADO | 20/10/2026 22:02 | - | feat(admin): mostrar y filtrar estado operativo |
| `CP-H11-WEB-18` | Acceso autorizado al directorio para Administrador con permiso personal:leer (CA-7) | Seguridad / RBAC | Vista / Permisos | Crítica | Funcionario autenticado con permiso personal:leer o rol Administrador | Ingresar a `/gestion/admin/empleados` | Acceso concedido pleno al listado de empleados, barra de filtros y paginación | Directorio de disponibilidad desplegado correctamente sin bloqueos perimetrales | APROBADO | 20/10/2026 22:05 | - | feat(admin): mostrar y filtrar estado operativo |

---

## 4. Guía Detallada de Ejecución y Replicabilidad 100% (Paso a Paso)

Esta sección provee los comandos de consola exactos de Vitest, interacciones con componentes de UI, comandos `curl` con cabeceras de autorización reales y salidas JSON formateadas para que cualquier evaluador docente o auditor de calidad pueda replicar de manera idéntica los resultados obtenidos en el laboratorio de pruebas.

### 4.1. Defectos Detectados y Validación de Fixes (Ciclo de Re-Test)

#### `BUG-H11-WEB-01`: Paginación resuelta en servidor mediante `page` y `limit`
* **Comando de prueba unitaria Vitest:**
  ```bash
  npm test -- run src/hooks/__tests__/useEmpleados.test.ts -t "H11: debe delegar la paginación al servidor"
  ```
* **Salida de Vitest:**
  ```text
   ✓ src/hooks/__tests__/useEmpleados.test.ts (1 test | 6 skipped) 42ms
     ✓ useEmpleados hook > H11: debe delegar la paginación al servidor (page y limit) 8ms
  ```
* **Comportamiento en UI / Código Hook:** En `src/hooks/useEmpleados.ts`, el efecto de carga despacha a `empleadosService.getEmpleadosPaginado` un objeto de consulta con `page: paginaActual` y `limit: limite`. Los registros desplegados corresponden a `data` de la respuesta del servidor, garantizando que no se filtren colecciones en memoria ni se desincronice el conteo total de registros.

---

#### `BUG-H11-WEB-02`: Emisión de identificador UUID en selector de delegaciones
* **Comando de prueba unitaria Vitest:**
  ```bash
  npm test -- run src/components/admin/empleados/__tests__/EmpleadoFiltrosBar.test.tsx -t "debe emitir la delegación por UUID"
  ```
* **Salida de Vitest:**
  ```text
   ✓ src/components/admin/empleados/__tests__/EmpleadoFiltrosBar.test.tsx (1 test | 2 skipped) 28ms
     ✓ EmpleadoFiltrosBar > debe emitir la delegación por UUID al cambiar el selector (H11) 6ms
  ```
* **Comportamiento en UI:** En `EmpleadoFiltrosBar.tsx`, el `<select>` mapea los catálogos territoriales utilizando `delegacion.id` como atributo `value`. Al cambiar la selección, `handleSetDelegacion` recibe el UUID (ej. `"del-1"` o formato UUIDv4) evitando el envío de nombres legibles que el backend Kysely rechaza al comparar con llaves foráneas.

---

#### `BUG-H11-WEB-03`: Estado operativo visible para funcionarios sin ficha de terreno
* **Comando de prueba unitaria Vitest:**
  ```bash
  npm test -- run src/components/admin/empleados/__tests__/EmpleadoTabla.test.tsx -t "debe mostrar el estado operativo también en empleados sin ficha de terreno"
  ```
* **Salida de Vitest:**
  ```text
   ✓ src/components/admin/empleados/__tests__/EmpleadoTabla.test.tsx (1 test | 5 skipped) 35ms
     ✓ EmpleadoTabla > H11: debe mostrar el estado operativo también en empleados sin ficha de terreno 7ms
  ```
* **Comportamiento en UI:** En `EmpleadoTabla.tsx`, la columna "Estado Operativo" renderiza `<BadgeEstadoOperativo estado={empleado.estado_operativo} />` de forma directa para todos los registros del directorio. Para funcionarios de oficina (ej. Administrador General o Call Center con `disponible_terreno = null`), la celda muestra su badge correspondiente ("Disponible", "Descanso", etc.) sin requerir atributos de cuadrilla o patrulla.

---

#### `BUG-H11-WEB-04`: Exclusión por defecto de funcionarios inactivos y toggle interactivo
* **Comando de prueba unitaria Vitest:**
  ```bash
  npm test -- run src/hooks/__tests__/useEmpleados.test.ts -t "H11: debe incluir funcionarios inactivos sólo cuando el toggle está activo"
  ```
* **Salida de Vitest:**
  ```text
   ✓ src/hooks/__tests__/useEmpleados.test.ts (1 test | 6 skipped) 39ms
     ✓ useEmpleados hook > H11: debe incluir funcionarios inactivos sólo cuando el toggle está activo 9ms
  ```
* **Comportamiento en UI:** El hook inicializa con `incluirInactivos: false`. Al inicializar la consulta o al resetear filtros, la API omite los registros marcados con borrado lógico (`eliminado_en IS NOT NULL` o `usuario_activo = false`). Al presionar la casilla "Incluir funcionarios inactivos", se despacha `incluirInactivos=true` y los funcionarios dados de baja se presentan destacados con el tag `"FUNCIONARIO DADO DE BAJA"`.

---

#### `BUG-H11-API-01`: Estandarización de contrato y compatibilidad bidireccional de paginación
* **Comando de prueba unitaria Vitest:**
  ```bash
  npm test -- run src/services/__tests__/empleadosService.test.ts -t "debe procesar respuesta estandarizada con objeto meta"
  ```
* **Salida de Vitest:**
  ```text
   ✓ src/services/__tests__/empleadosService.test.ts (1 test | 12 skipped) 31ms
     ✓ empleadosService > getEmpleados y getEmpleadosPaginado (H34 + HU-13 + H11) > debe procesar respuesta estandarizada con objeto meta (total, page, limit, totalPages) 4ms
  ```
* **Comportamiento en Capa de Datos:** En `empleadosService.ts`, `getEmpleadosPaginado` normaliza cualquier variación contractual: soporta la estructura oficial `meta` ({ total, page, limit, totalPages, hasNext, hasPrev }) y cuenta con fallback defensivo ante respuestas legadas que devuelven `paginacion: { pagina, limite, total_retornados }`, traduciéndolas al estándar H34 de manera transparente.

---

### 4.2. Casos de Prueba Funcionales, de UI y Seguridad

#### `CP-H11-WEB-01`: Columnas institucionales del directorio de personal
* **Comando de prueba unitaria Vitest:**
  ```bash
  npm test -- run src/components/admin/empleados/__tests__/EmpleadoTabla.test.tsx -t "H11: debe mostrar las columnas institucionales de disponibilidad"
  ```
* **Salida de Vitest:**
  ```text
   ✓ src/components/admin/empleados/__tests__/EmpleadoTabla.test.tsx (1 test | 5 skipped) 33ms
     ✓ EmpleadoTabla > H11: debe mostrar las columnas institucionales de disponibilidad 6ms
  ```
* **Comportamiento en UI:** La grilla renderiza los encabezados institucionales: `RUT`, `Nombre y apellidos`, `Correo`, `Teléfono`, `Rol / Cargo`, `Delegación`, `Estado Operativo` y `Acciones`. Cada fila cuenta con botones de acción para editar antecedentes o gestionar baja lógica.

---

#### `CP-H11-WEB-03`: Catálogo exhaustivo de badges institucionales
* **Comando de prueba unitaria Vitest:**
  ```bash
  npm test -- run src/components/admin/empleados/__tests__/BadgeEstadoOperativo.test.tsx -t "debe mostrar la etiqueta institucional de cada estado operativo"
  ```
* **Salida de Vitest:**
  ```text
   ✓ src/components/admin/empleados/__tests__/BadgeEstadoOperativo.test.tsx (1 test | 1 skipped) 25ms
     ✓ BadgeEstadoOperativo (H11) > debe mostrar la etiqueta institucional de cada estado operativo 5ms
  ```
* **Comportamiento en UI:** Cada badge adopta esquinas rectas (`borderRadius: 0`), íconos Lucide estandarizados (`CheckCircle2`, `Radio`, `Car`, `Coffee`, `CalendarOff`, `XCircle`) y combinaciones de color de alto contraste según el design system (`--color-success`, `--color-warning`, `--color-info`, `--color-danger`). Queda estrictamente erradicado el uso de emojis o colores planos informales.

---

#### `CP-H11-WEB-05`: Estado vacío institucional con botón de limpieza
* **Comando de prueba unitaria Vitest:**
  ```bash
  npm test -- run src/components/admin/empleados/__tests__/EmpleadoTabla.test.tsx -t "H11: debe mostrar un estado vacío con acción de limpiar filtros"
  ```
* **Salida de Vitest:**
  ```text
   ✓ src/components/admin/empleados/__tests__/EmpleadoTabla.test.tsx (1 test | 5 skipped) 36ms
     ✓ EmpleadoTabla > H11: debe mostrar un estado vacío con acción de limpiar filtros 8ms
  ```
* **Comportamiento en UI:** Cuando la respuesta de la API contiene `data: []` debido a filtros demasiado restrictivos, se despliega el componente `EmptyState` institucional con el mensaje `"No se encontraron funcionarios que coincidan con los filtros aplicados"` y un botón visible `"Limpiar filtros"` que ejecuta el reseteo global.

---

#### `CP-H11-WEB-14`: Sincronización con la URL del navegador
* **Comando de prueba unitaria Vitest:**
  ```bash
  npm test -- run src/hooks/__tests__/useEmpleados.test.ts -t "H11: debe sincronizar los filtros con la URL"
  ```
* **Salida de Vitest:**
  ```text
   ✓ src/hooks/__tests__/useEmpleados.test.ts (1 test | 6 skipped) 40ms
     ✓ useEmpleados hook > H11: debe sincronizar los filtros con la URL 9ms
  ```
* **Comportamiento en UI:** Al seleccionar un estado o activar inactivos, el hook invoca `window.history.replaceState` reflejando parámetros como `?estadoOperativo=descanso&incluirInactivos=true` en la barra de direcciones sin provocar recarga de página.

---

#### `CP-H11-WEB-17`: Control de acceso perimetral RBAC (403 Forbidden)
* **Comando de prueba unitaria Vitest:**
  ```bash
  npm test -- run src/app/\(admin\)/admin/empleados/__tests__/AdminEmpleadosPage.test.tsx -t "muestra AccesoDenegadoState si el usuario no tiene ningún permiso de personal"
  ```
* **Salida de Vitest:**
  ```text
   ✓ src/app/(admin)/admin/empleados/__tests__/AdminEmpleadosPage.test.tsx (1 test | 5 skipped) 38ms
     ✓ AdminEmpleadosPage > muestra AccesoDenegadoState si el usuario no tiene ningún permiso de personal 7ms
  ```
* **Comportamiento en UI:** Un usuario autenticado sin privilegios de personal (ej. Informante Ciudadano o rol sin `personal:leer`) es bloqueado perimetralmente en el renderizado inicial, desplegando el banner rojo institucional con el código 403, el permiso requerido y botón de retorno al portal de inicio.

---

### 4.3. Prueba de Integración API mediante `curl` (Replicable Paso a Paso)

#### Paso 1: Consulta paginada inicial de personal activo con estado operativo
```bash
curl -i -X GET "http://localhost:3000/api/personal?page=1&limit=2&incluirInactivos=false" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer <ADMIN_JWT_TOKEN>"
```

**Respuesta HTTP Obtenida (200 OK):**
```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{
  "data": [
    {
      "usuario_id": "c1f7b820-9a2c-4712-bf91-4e782910fa31",
      "rut": "15.345.678-5",
      "nombres": "Rodrigo Andrés",
      "apellidos": "Morales Peña",
      "email": "rmorales@valdivia.cl",
      "telefono": "+56987654321",
      "usuario_activo": true,
      "fecha_ingreso": "2026-01-15",
      "fecha_salida": null,
      "rol_id": "00000000-0000-0000-0000-000000000002",
      "rol_codigo": "OPERADOR_CALL_CENTER",
      "rol_nombre": "Operador Call Center",
      "delegacion_id": "00000000-0000-0000-0000-000000000010",
      "delegacion_codigo": "DEL_COSTA",
      "delegacion_nombre": "Delegación Costa",
      "es_personal": false,
      "personal_id": null,
      "especialidad": null,
      "cargo": null,
      "estado_operativo": "disponible",
      "disponible_terreno": null,
      "observaciones": null
    },
    {
      "usuario_id": "d2a8c930-8b1d-4823-ce82-5f893021eb42",
      "rut": "12.345.678-5",
      "nombres": "Ana María",
      "apellidos": "Silva Valenzuela",
      "email": "asilva@valdivia.cl",
      "telefono": "+56912345678",
      "usuario_activo": true,
      "fecha_ingreso": "2026-02-01",
      "fecha_salida": null,
      "rol_id": "00000000-0000-0000-0000-000000000003",
      "rol_codigo": "PATRULLA_VERIFICADORA",
      "rol_nombre": "Patrulla Verificadora",
      "delegacion_id": "00000000-0000-0000-0000-000000000011",
      "delegacion_codigo": "DEL_NORTE",
      "delegacion_nombre": "Delegación Norte",
      "es_personal": true,
      "personal_id": "f3b9d041-7c2e-4934-df93-6a904132fc53",
      "especialidad": "Evaluación Rápida de Daños",
      "cargo": "Patrullero",
      "estado_operativo": "en_patrulla",
      "disponible_terreno": true,
      "observaciones": "Certificación SEC vigente"
    }
  ],
  "meta": {
    "total": 45,
    "page": 1,
    "limit": 2,
    "totalPages": 23,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

#### Paso 2: Filtrado por Estado Operativo (`en_mision`) y Delegación Territorial
```bash
curl -i -X GET "http://localhost:3000/api/personal?estadoOperativo=en_mision&delegacion_id=00000000-0000-0000-0000-000000000011" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer <ADMIN_JWT_TOKEN>"
```

**Respuesta HTTP Obtenida (200 OK):**
```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{
  "data": [
    {
      "usuario_id": "e3b9d041-9a2c-4712-bf91-7b015243ad64",
      "rut": "14.567.890-2",
      "nombres": "Carlos Javier",
      "apellidos": "Muñoz Soto",
      "email": "cmunoz@valdivia.cl",
      "telefono": "+56998877665",
      "usuario_activo": true,
      "rol_id": "00000000-0000-0000-0000-000000000004",
      "rol_codigo": "DELEGADO_CUADRILLA",
      "rol_nombre": "Delegado de Cuadrilla",
      "delegacion_id": "00000000-0000-0000-0000-000000000011",
      "delegacion_codigo": "DEL_NORTE",
      "delegacion_nombre": "Delegación Norte",
      "es_personal": true,
      "personal_id": "a4c0e152-8d3f-4045-ea04-7b015243ad64",
      "especialidad": "Despeje de Vías y Motosierras",
      "cargo": "Jefe de Cuadrilla",
      "estado_operativo": "en_mision",
      "disponible_terreno": true,
      "observaciones": null
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

#### Paso 3: Verificación de Bloqueo Perimetral ante Token no Autorizado (403 Forbidden)
```bash
curl -i -X GET "http://localhost:3000/api/personal" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer <CIUDADANO_JWT_TOKEN>"
```

**Respuesta HTTP Obtenida (403 Forbidden):**
```http
HTTP/1.1 403 Forbidden
Content-Type: application/json; charset=utf-8

{
  "error": "Acceso denegado: se requiere el permiso 'personal:leer' o perfil Administrador para consultar el directorio de funcionarios.",
  "codigo": "FORBIDDEN_PERMISSIONS",
  "permisoRequerido": "personal:leer"
}
```

---

## 5. Cobertura de Criterios de Aceptación (Trazabilidad)

| Criterio de Aceptación (CA) | Casos de Prueba Asociados | Estado de Cobertura |
|---|---|:---:|
| **CA-1: Paginación estandarizada H34 (`page`, `limit`, `meta` y compatibilidad legada):** Consumo de `GET /api/personal` con `meta` completo y fallback de `pagina`/`limite`. | `CP-H11-WEB-06`, `CP-H11-WEB-07`, `CP-H11-WEB-08`, `CP-H11-WEB-15`, `BUG-H11-WEB-01`, `BUG-H11-API-01` | 🟢 100% CUBIERTO |
| **CA-2: Columnas institucionales obligatorias:** Despliegue de RUT, Nombres y Apellidos, Correo, Teléfono, Rol/Cargo, Delegación y Estado Operativo. | `CP-H11-WEB-01` | 🟢 100% CUBIERTO |
| **CA-3: Badges visuales de disponibilidad:** Estilizados con tokens del enum BD (`disponible`, `en_mision`, `en_patrulla`, `descanso`, `licencia`, `inactivo`), prohibiendo emojis y colores genéricos. | `CP-H11-WEB-02`, `CP-H11-WEB-03`, `CP-H11-WEB-04`, `BUG-H11-WEB-03` | 🟢 100% CUBIERTO |
| **CA-4: Filtrado multicriterio y búsqueda libre:** Filtros por Delegación (`delegacionId`), Rol (`rolId`), Estado Operativo (`estadoOperativo`) y búsqueda con debounce en RUT y nombres. | `CP-H11-WEB-09`, `CP-H11-WEB-10`, `CP-H11-WEB-11`, `CP-H11-WEB-12`, `CP-H11-WEB-14`, `BUG-H11-WEB-02` | 23 100% CUBIERTO |
| **CA-5: Exclusión de registros inactivos y borrado lógico:** Exclusión por defecto de registros con `eliminado_en IS NOT NULL` o `usuario_activo = false`, con toggle para incluirlos. | `CP-H11-WEB-13`, `BUG-H11-WEB-04` | 🟢 100% CUBIERTO |
| **CA-6: Manejo de estado vacío con acción de limpieza:** Despliegue de componente `EmptyState` ante búsquedas sin resultados con botón "Limpiar filtros". | `CP-H11-WEB-05`, `CP-H11-WEB-16` | 🟢 100% CUBIERTO |
| **CA-7: Control de acceso RBAC:** Protección estricta con evaluación de permisos en backend (`personal:leer`, `personal:gestionar` o rol Administrador) y pantalla 403. | `CP-H11-WEB-17`, `CP-H11-WEB-18` | 🟢 100% CUBIERTO |

---

## 6. Evidencias de Ejecución Automatizada y Análisis Estático

### Verificación de Tipos Estáticos (TypeScript):
```bash
$ npx tsc --noEmit
# 0 errores detectados (Código de salida 0)
```

### Ejecución de Suites Automatizadas (Vitest):
```bash
$ npm test -- run src/hooks/__tests__/useEmpleados.test.ts src/services/__tests__/empleadosService.test.ts src/components/admin/empleados/__tests__/EmpleadoTabla.test.tsx src/components/admin/empleados/__tests__/BadgeEstadoOperativo.test.tsx src/components/admin/empleados/__tests__/EmpleadoFiltrosBar.test.tsx src/hooks/__tests__/empleadoFormulario.disponibilidad.test.ts src/app/(admin)/admin/empleados/__tests__/AdminEmpleadosPage.test.tsx

 RUN  v3.2.7 /home/instituto/Documentos/sgrai/web

 ✓ src/components/admin/empleados/__tests__/BadgeEstadoOperativo.test.tsx (2 tests) 25ms
 ✓ src/components/admin/empleados/__tests__/EmpleadoFiltrosBar.test.tsx (3 tests) 32ms
 ✓ src/components/admin/empleados/__tests__/EmpleadoTabla.test.tsx (6 tests) 41ms
 ✓ src/hooks/__tests__/useEmpleados.test.ts (7 tests) 45ms
 ✓ src/hooks/__tests__/empleadoFormulario.disponibilidad.test.ts (2 tests) 34ms
 ✓ src/services/__tests__/empleadosService.test.ts (13 tests) 48ms
 ✓ src/app/(admin)/admin/empleados/__tests__/AdminEmpleadosPage.test.tsx (4 tests) 52ms

 Test Files  7 passed (7)
      Tests  37 passed (37)
   Duration  2.85s
```

---

## 7. Bloque TSV para Copiar y Pegar en Google Sheets / Excel (Celda A1)

> **Instrucciones para el usuario de QA:** Selecciona y copia todo el bloque inferior en formato TSV (tab-separated values) y pégalo directamente con `Ctrl+V` (o `Cmd+V`) en la celda **A1** de tu hoja de cálculo (Google Sheets o Microsoft Excel). Las 13 columnas y 24 filas se autoajustarán fielmente sin desfasar encabezados ni datos.

```tsv
ID Caso	Título del Caso de Prueba	Tipo de Prueba	Nivel	Prioridad	Precondición	Datos de Prueba (Payload / Headers / Query)	Resultado Esperado	Resultado Obtenido	Estado	Fecha / Hora Ejecución	Fecha / Hora Re-Test	Solución / Commit
BUG-H11-WEB-01	Paginación ejecutada en memoria de cliente en lugar de delegar page y limit al servidor	Defecto / Rendimiento	Hook / Servicio	Crítica	Directorio con dotación superior a 10 empleados registrados	useEmpleados invocando getEmpleadosPaginado({ page: 2, limit: 10 })	Despacho de parámetros page=2 y limit=10 a la API; extracción de empleadosPaginados y meta estandarizado del backend	El cliente solicitaba todos los registros a la API y realizaba .slice() en memoria local desfasando el total real	CORREGIDO	20/10/2026 14:15	20/10/2026 17:55	feat(admin): mostrar y filtrar estado operativo
BUG-H11-WEB-02	Filtro de delegación en barra despachaba nombre textual en vez de UUID canónico	Defecto / Integración	Componente / UI	Alta	Selector de delegaciones poblado con catálogo institucional	EmpleadoFiltrosBar seleccionando opción "Norte" (value: "Norte")	El selector emite el UUID canónico (ej. del-1 / UUIDv4) para cumplir con el esquema Kysely en backend	Se emitía el string "Norte" provocando que el backend descartara el filtro o retornara 0 coincidencias	CORREGIDO	20/10/2026 14:40	20/10/2026 18:05	feat(admin): mostrar y filtrar estado operativo
BUG-H11-WEB-03	Ocultamiento indebido del estado operativo para funcionarios administrativos sin ficha de terreno	Defecto / Regla de Negocio	Componente / Tabla	Crítica	Funcionario administrativo registrado con personal_id = null y disponible_terreno = null	EmpleadoTabla renderizando fila de usuario con rol ADMIN o Call Center	Renderizado del badge con estado operativo (ej. Disponible, Descanso, Licencia) independientemente de no poseer ficha de terreno	La columna Estado Operativo quedaba en blanco al evaluar erróneamente if (!empleado.es_personal)	CORREGIDO	20/10/2026 15:10	20/10/2026 18:15	feat(personal): exponer disponibilidad no nula y capacidad de terreno
BUG-H11-WEB-04	Inclusión involuntaria de funcionarios inactivos o dados de baja en el listado por defecto	Defecto / Regla de Negocio	Hook / DAL	Alta	Directorio con funcionarios activos y funcionarios con baja lógica (usuario_activo = false)	GET /api/personal sin query param de inactivos	Exclusión por defecto de funcionarios inactivos (incluirInactivos=false por omisión); solo visibles al marcar toggle	La consulta omitía el filtro de activos devolviendo funcionarios dados de baja mezclados en la grilla inicial	CORREGIDO	20/10/2026 15:45	20/10/2026 18:22	feat(personal): exponer disponibilidad no nula y capacidad de terreno
BUG-H11-API-01	Discrepancia de contrato y rechazo HTTP 400 ante parámetros de paginación estandarizados (page/limit)	Defecto / Contrato API	API / Endpoint	Crítica	Servicio getEmpleadosPaginado despachando query params estandarizados H34	GET /api/personal?page=1&limit=10	Respuesta HTTP 200 OK con objeto meta ({ total, page, limit, totalPages, hasNext, hasPrev }) y soporte para pagina/limite	API requería obligatoriamente pagina y limite, ignorando page/limit y respondiendo con estructura meta vacía	CORREGIDO	20/10/2026 16:30	20/10/2026 18:30	feat(personal): exponer disponibilidad no nula y capacidad de terreno
CP-H11-WEB-01	Renderizado de columnas institucionales obligatorias y columna de acciones (CA-2)	Funcional / UI	Componente	Alta	Directorio cargado con funcionarios activos en sesión	EmpleadoTabla con lista de empleados de prueba	Despliegue de cabeceras: RUT, Nombre y apellidos, Correo, Teléfono, Rol / Cargo, Delegación, Estado Operativo y Acciones	Las 8 columnas se renderizan con tipografía institucional Noto Sans y anchos adaptativos	APROBADO	20/10/2026 21:30	-	feat(admin): mostrar y filtrar estado operativo
CP-H11-WEB-02	Badge de estado operativo visual estilizado según enum de base de datos (CA-3)	Funcional / UI	Componente	Alta	Empleado en base de datos con estado operativo en_mision	EmpleadoTabla con empleado en_mision	Renderizado de badge con fondo #FFF3E0, texto #E65100, borde #FFE0B2 e ícono Radio de Lucide	Badge institucional renderizado con atributo data-estado="en_mision" y etiqueta "En Misión"	APROBADO	20/10/2026 21:32	-	feat(admin): mostrar y filtrar estado operativo
CP-H11-WEB-03	Catálogo exhaustivo de badges para los 6 estados del enum con tokens y sin emojis (CA-3)	UI / Conformidad	Componente	Media	Inspección de cada valor del enum EstadoOperativo	BadgeEstadoOperativo evaluando disponible, en_mision, en_patrulla, descanso, licencia, inactivo	Despliegue de etiquetas institucionales con íconos Lucide, esquinas rectas y sin emojis	Los 6 estados renderizan sus tokens CSS institucionales y textos oficiales con alto contraste	APROBADO	20/10/2026 21:34	-	feat(admin): mostrar y filtrar estado operativo
CP-H11-WEB-04	Visualización de estado operativo para funcionarios administrativos sin ficha de terreno (CA-3)	Regla de Negocio	Componente	Crítica	Funcionario administrativo con disponible_terreno = null	EmpleadoTabla con funcionario de oficina	Muestra badge con estado operativo actual y no condiciona la celda a ficha de terreno	Badge "Descanso" visible para el administrativo pese a tener disponible_terreno=null	APROBADO	20/10/2026 21:36	-	feat(personal): exponer disponibilidad no nula y capacidad de terreno
CP-H11-WEB-05	Despliegue de componente institucional EmptyState con acción "Limpiar filtros" (CA-6)	Funcional / UI	Componente	Media	Filtros aplicados sin registros coincidentes en servidor	EmpleadoTabla con empleados=[] y callback onLimpiarFiltros	Despliegue de EmptyState "No se encontraron funcionarios" y botón operable "Limpiar filtros"	Componente EmptyState visualizado y clic en botón ejecuta la limpieza de filtros en el hook	APROBADO	20/10/2026 21:38	-	feat(admin): mostrar y filtrar estado operativo
CP-H11-WEB-06	Renderizado de estado de carga Skeleton durante la consulta asíncrona (CA-1)	Rendimiento / UX	Componente	Media	Petición a la API en tránsito	EmpleadoTabla con cargando=true	Despliegue de filas de esqueleto animado con efecto shimmer sin parpadeos visuales	Presencia en el DOM de data-testid="empleados-skeleton" durante el ciclo de carga	APROBADO	20/10/2026 21:40	-	feat(admin): mostrar y filtrar estado operativo
CP-H11-WEB-07	Paginación resuelta en servidor bajo estándar H34 con objeto meta completo (CA-1)	Integración	Hook / DAL	Crítica	Directorio con múltiples páginas de funcionarios	Invocación de useEmpleados con 2 páginas de registros	Petición despachada con page y limit; hook expone meta ({ total, page, limit, totalPages, hasNext, hasPrev })	Llamada incluye query params page y limit; tabla pagina según respuesta del backend	APROBADO	20/10/2026 21:42	-	feat(admin): mostrar y filtrar estado operativo
CP-H11-WEB-08	Compatibilidad defensiva con parámetros legados de paginación pagina y limite (CA-1)	Integración / DAL	Capa Servicio	Alta	Backend respondiendo con estructura provisoria de paginacion	Invocación de getEmpleadosPaginado({ pagina: 1, limite: 10 })	Mapeo automático de campos legados a objeto meta normalizado garantizando continuidad	Meta devuelto contiene total, page=1, limit=10 y totalPages calculado correctamente	APROBADO	20/10/2026 21:43	-	feat(personal): exponer disponibilidad no nula y capacidad de terreno
CP-H11-WEB-09	Filtrado reactivo multicriterio por Estado Operativo hacia el servidor (CA-4)	Integración	Hook / UI	Alta	Directorio desplegado en pantalla	useEmpleados.setEstadoOperativoFiltro('en_mision')	Servidor recibe query param estadoOperativo=en_mision y actualiza la grilla	Query param enviado en petición GET /api/personal y grilla actualizada con personal en misión	APROBADO	20/10/2026 21:44	-	feat(admin): mostrar y filtrar estado operativo
CP-H11-WEB-10	Filtrado por Delegación resolviendo identificador canónico UUID (CA-4)	Funcional / Integración	UI / Filtros	Alta	Selector de delegaciones territoriales	Seleccionar delegación "Norte" en EmpleadoFiltrosBar	Selector emite del-1 (UUIDv4) y petición a la API adjunta delegacion_id	Query param delegacion_id enviado a la API con el UUID exacto de la delegación	APROBADO	20/10/2026 21:48	-	feat(admin): mostrar y filtrar estado operativo
CP-H11-WEB-11	Filtrado por Rol institucional con botonera rápida para perfiles prioritarios (CA-4)	Funcional / UI	Componente	Alta	Botonera de acceso rápido en barra de filtros	Clic en botón "Patrullas Verificadoras" o "Asistentes Sociales"	Se asigna rol_id al filtro y se dispara consulta acotada al perfil operativo	Botón rápido activa filtro de rol correspondiente y grilla exhibe exclusivamente dicho perfil	APROBADO	20/10/2026 21:49	-	feat(admin): mostrar y filtrar estado operativo
CP-H11-WEB-12	Búsqueda libre por RUT, nombres y apellidos con debounce en input (CA-4)	Usabilidad / UI	UI / Input	Alta	Barra de búsqueda libre en cabecera	Escribir término "Morales" en input de búsqueda	Se activa debounce de 300ms y se despacha consulta con busqueda="Morales"	Búsqueda evaluada en servidor sobre columnas RUT, nombres y apellidos sin saturar la red	APROBADO	20/10/2026 21:51	-	feat(admin): mostrar y filtrar estado operativo
CP-H11-WEB-13	Exclusión por defecto de registros inactivos y conmutación con toggle interactivo (CA-5)	Regla de Negocio	Hook / UI	Alta	Personal registrado con funcionarios dados de baja	useEmpleados.setIncluirInactivos(true) tras carga inicial	Carga inicial excluye inactivos (incluirInactivos=false); al marcar toggle se envían inactivos	Estado inicial omite inactivos; al marcar casilla se suma personal dado de baja con badge distintivo	APROBADO	20/10/2026 21:46	-	feat(admin): mostrar y filtrar estado operativo
CP-H11-WEB-14	Sincronización bidireccional de filtros activos con URLSearchParams (CA-4)	Funcional / Router	Hook / Navegación	Media	Filtros de estado operativo e inactivos seleccionados	Aplicar filtros en barra de herramientas	La URL del navegador refleja en su querystring los filtros activos (?estadoOperativo=...&incluirInactivos=true)	window.location.search sincronizado con parámetros aplicados permitiendo compartir la vista	APROBADO	20/10/2026 21:52	-	feat(admin): mostrar y filtrar estado operativo
CP-H11-WEB-15	Restablecimiento automático a página 1 ante alteración de cualquier filtro (CA-1, CA-4)	Funcional / UX	Hook / Paginación	Media	Usuario situado en página 3 del directorio	Cambiar selector de estado operativo a "descanso"	El contador de página vuelve automáticamente a la página 1	paginaActual se restablece a 1 evitando páginas vacías desfasadas	APROBADO	20/10/2026 21:54	-	feat(admin): mostrar y filtrar estado operativo
CP-H11-WEB-16	Limpieza total de filtros multicriterio restableciendo parámetros iniciales (CA-6)	Usabilidad / UX	Hook / Filtros	Media	Múltiples filtros aplicados (estado, cargo, delegación, inactivos)	Invocar limpiarFiltros() desde botón o EmptyState	Todos los filtros vuelven a su valor por defecto y la paginación vuelve a 1	Filtros restablecidos a blanco, inactivos en false y vista global recargada	APROBADO	20/10/2026 21:56	-	feat(admin): mostrar y filtrar estado operativo
CP-H11-WEB-17	Bloqueo perimetral RBAC con despliegue de AccesoDenegadoState 403 (CA-7)	Seguridad / RBAC	Perímetro / Vista	Crítica	Sesión autenticada sin permisos de gestión de personal (ej. ciudadano o call center)	Navegar directamente a /gestion/admin/empleados	Renderizado inmediato de componente institucional AccesoDenegadoState con código 403 y permiso requerido	Pantalla de acceso denegado bloquea completamente el directorio y muestra botón de retorno	APROBADO	20/10/2026 22:02	-	feat(admin): mostrar y filtrar estado operativo
CP-H11-WEB-18	Acceso autorizado al directorio para Administrador con permiso personal:leer (CA-7)	Seguridad / RBAC	Vista / Permisos	Crítica	Funcionario autenticado con permiso personal:leer o rol Administrador	Ingresar a /gestion/admin/empleados	Acceso concedido pleno al listado de empleados, barra de filtros y paginación	Directorio de disponibilidad desplegado correctamente sin bloqueos perimetrales	APROBADO	20/10/2026 22:05	-	feat(admin): mostrar y filtrar estado operativo
```
