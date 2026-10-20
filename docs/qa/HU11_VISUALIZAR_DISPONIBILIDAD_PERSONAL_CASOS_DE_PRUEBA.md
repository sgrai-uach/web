# Informe y Matriz de Casos de Prueba (QA): HU-11 — Visualizar Disponibilidad del Personal (Frontend Web)

> **Documento Oficial de Aseguramiento de Calidad (QA) — Frontend**  
> **Proyecto:** Sistema de Gestión de Recursos para Atención de Incidentes (SGRAI) — Dirección de Gestión de Riesgos de Desastres, Municipalidad de Valdivia.  
> **Módulo:** Recursos y Personal — Administración de Empleados (`/admin/empleados` y `/gestion/admin/empleados`).  
> **Historia de Usuario:** HU-11 — *"Como administrador quiero ver un listado del personal para visualizar la disponibilidad de los empleados."*  
> **Cliente Web:** `sgrai-web` (Next.js 16 App Router + React 19 + TypeScript + CSS Modules + Testing Library + Vitest + openapi-fetch).  
> **Rama Git Evaluada:** `feature/H11-visualizar-disponibilidad-personal`.  
> **Commits Clave Evaluados (Conventional Commits):**
> * `feat(admin): mostrar y filtrar estado operativo`
> * `feat(personal): exponer disponibilidad no nula y capacidad de terreno`
> * `test(personal): cubrir disponibilidad y paginación`
> * `docs(personal): documentar H11 y actualizar modelo`
>
> **Fecha de Certificación QA:** Octubre 2026.  
> **Estado de Certificación:** 🟢 **APROBADO PARA PRODUCCIÓN (100% PASS)**.

---

## 1. Resumen Ejecutivo de Pruebas de Frontend

| Métrica | Resultado |
|---|:---:|
| **Total de Casos de Prueba Diseñados y Ejecutados** | **16** |
| **Casos Aprobados (Passed)** | **16** |
| **Casos Fallidos (Failed)** | **0** |
| **Casos Bloqueados (Blocked)** | **0** |
| **Tasa de Aprobación Global (% Pass)** | **100%** |
| **Suite Automatizada (Vitest)** | **557/558 tests aprobados** (el único fallo es preexistente y ajeno a H11: `EmergencyCallButton`, variable de entorno `NEXT_PUBLIC_EMERGENCY_PHONE`) |
| **Chequeo de Tipos Estáticos (TypeScript)** | **0 errores (`npx tsc --noEmit`)** |
| **Análisis Estático (ESLint)** | **0 errores en los archivos modificados por H11** |
| **Build de producción (Next.js)** | **Correcto (`npm run build`)** |
| **Tipos de API generados** | **Sincronizados con el OpenAPI 3.0 del backend (`npm run generate-api-types`)** |

---

## 2. Nota de Modelo (H11)

La disponibilidad (estado operativo) reside en `usuario.estado_operativo` y **siempre está
presente**; la ficha de terreno es opcional y su `disponible_terreno` puede ser `null`
("no aplica"). El frontend debe reflejar esta distinción en tipos, tabla y formularios.

---

## 3. Matriz Consolidada de Casos de Prueba (13 Columnas)

| ID Caso | Título del Caso de Prueba | Tipo de Prueba | Nivel | Prioridad | Precondición | Datos de Prueba | Resultado Esperado | Resultado Obtenido | Estado | Fecha / Hora Ejecución | Fecha / Hora Re-Test | Solución / Commit |
|---|---|---|---|---|---|---|---|---|:---:|:---:|:---:|---|
| `CP-H11-WEB-01` | Renderizado de las columnas institucionales del directorio | Funcional / UI | Componente | Alta | Directorio con funcionarios | `EmpleadoTabla` con empleados de prueba | Columnas RUT, Nombre y apellidos, Correo, Teléfono, Rol/Cargo, Delegación, Estado Operativo y Acciones | Las 8 columnas se renderizan con los rótulos institucionales | APROBADO | 20/10/2026 21:30 | - | feat(admin): mostrar y filtrar estado operativo |
| `CP-H11-WEB-02` | Badge de estado operativo por disponibilidad | Funcional / UI | Componente | Alta | Empleado con estado `en_mision` | `EmpleadoTabla` | Muestra el badge "En Misión" con `data-estado="en_mision"` | Badge institucional renderizado con la etiqueta correcta | APROBADO | 20/10/2026 21:32 | - | feat(admin): mostrar y filtrar estado operativo |
| `CP-H11-WEB-03` | Catálogo completo de badges de estado | Funcional / UI | Componente | Media | Los 6 estados del enum | `BadgeEstadoOperativo` | Etiquetas: Disponible, En Misión, En Patrulla, Descanso, Licencia, Inactivo | Las 6 etiquetas se renderizan correctamente | APROBADO | 20/10/2026 21:34 | - | feat(admin): mostrar y filtrar estado operativo |
| `CP-H11-WEB-04` | Estado operativo visible para empleados sin ficha de terreno | Regla de Negocio | Componente | Crítica | Empleado administrativo (`disponible_terreno = null`) | `EmpleadoTabla` | Muestra igualmente el estado operativo | Se muestra el badge "Descanso" pese a no existir ficha de terreno | APROBADO | 20/10/2026 21:36 | - | feat(personal): exponer disponibilidad no nula y capacidad de terreno |
| `CP-H11-WEB-05` | Estado vacío con acción "Limpiar filtros" | Funcional / UI | Componente | Media | Directorio sin coincidencias | `EmpleadoTabla` con `empleados=[]` y `onLimpiarFiltros` | Muestra estado vacío y botón de limpieza funcional | Estado vacío institucional mostrado y la acción invoca `limpiarFiltros` | APROBADO | 20/10/2026 21:38 | - | feat(admin): mostrar y filtrar estado operativo |
| `CP-H11-WEB-06` | Esqueleto de carga durante la consulta | Funcional / UI | Componente | Media | Consulta en curso | `EmpleadoTabla` con `cargando=true` | Muestra el esqueleto de filas | `data-testid="empleados-skeleton"` presente | APROBADO | 20/10/2026 21:40 | - | feat(admin): mostrar y filtrar estado operativo |
| `CP-H11-WEB-07` | Paginación resuelta en el servidor | Integración | Hook / Servicio | Crítica | 2 páginas de resultados | `useEmpleados` | Envía `page` y `limit` al backend y no filtra en memoria | La llamada incluye `page` y `limit`; `empleadosPaginados` es la página del servidor | APROBADO | 20/10/2026 21:42 | - | feat(admin): mostrar y filtrar estado operativo |
| `CP-H11-WEB-08` | Filtro por estado operativo enviado al servidor | Integración | Hook / Servicio | Alta | Estado seleccionado | `useEmpleados.setEstadoOperativoFiltro('en_mision')` | El backend recibe `estadoOperativo=en_mision` | Parámetro presente en la consulta al backend | APROBADO | 20/10/2026 21:44 | - | feat(admin): mostrar y filtrar estado operativo |
| `CP-H11-WEB-09` | Toggle de funcionarios inactivos | Funcional | Hook / UI | Alta | Directorio con dados de baja | `useEmpleados.setIncluirInactivos(true)` | Se envía `incluirInactivos=true` y por defecto `false` | Comportamiento verificado en el hook y en la barra de filtros | APROBADO | 20/10/2026 21:46 | - | feat(admin): mostrar y filtrar estado operativo |
| `CP-H11-WEB-10` | Delegación filtrada por UUID | Funcional | UI | Alta | Catálogo de delegaciones | `EmpleadoFiltrosBar` | El selector emite el **UUID** de la delegación | `setDelegacionFiltro` recibe `del-1` (UUID) y no el nombre legible | APROBADO | 20/10/2026 21:48 | - | feat(admin): mostrar y filtrar estado operativo |
| `CP-H11-WEB-11` | Filtro de estado operativo y toggle de inactivos en la barra | Funcional / UI | Componente | Alta | Barra de filtros | `EmpleadoFiltrosBar` | Selector de estado operativo y casilla de inactivos operables | Ambos controles emitieron los valores esperados | APROBADO | 20/10/2026 21:50 | - | feat(admin): mostrar y filtrar estado operativo |
| `CP-H11-WEB-12` | Sincronización de filtros con la URL | Funcional | Hook | Media | Filtros aplicados | `useEmpleados` | La URL refleja los filtros activos | `window.location.search` contiene `estadoOperativo` e `incluirInactivos` | APROBADO | 20/10/2026 21:52 | - | feat(admin): mostrar y filtrar estado operativo |
| `CP-H11-WEB-13` | Reset de página al cambiar un filtro | Funcional | Hook | Media | Página 3 seleccionada | `useEmpleados` | La paginación vuelve a la página 1 | `paginaActual` vuelve a 1 | APROBADO | 20/10/2026 21:54 | - | feat(admin): mostrar y filtrar estado operativo |
| `CP-H11-WEB-14` | Limpieza completa de filtros | Funcional | Hook | Media | Filtros aplicados | `useEmpleados.limpiarFiltros()` | Todos los filtros vuelven al valor inicial | Estado, cargo, inactivos y paginación restablecidos | APROBADO | 20/10/2026 21:56 | - | feat(admin): mostrar y filtrar estado operativo |
| `CP-H11-WEB-15` | Envío del estado operativo en la edición | Integración | Hook / Servicio | Crítica | Funcionario administrativo | `useEmpleadoForm` | El payload incluye `estado_operativo` y **no** `disponible_terreno` | Payload verificado con `estado_operativo: 'descanso'` | APROBADO | 20/10/2026 21:58 | - | feat(personal): exponer disponibilidad no nula y capacidad de terreno |
| `CP-H11-WEB-16` | Capacidad de terreno sólo para roles de terreno | Regla de Negocio | Hook / Servicio | Crítica | Funcionario de terreno | `useEmpleadoForm` | El payload incluye `disponible_terreno` | Payload incluye `disponible_terreno: false` cuando se desmarca | APROBADO | 20/10/2026 22:00 | - | feat(personal): exponer disponibilidad no nula y capacidad de terreno |

---

### 3.1 Bloque TSV para Google Sheets (Copiar y Pegar en Celda A1)

```tsv
ID Caso	Título del Caso de Prueba	Tipo de Prueba	Nivel	Prioridad	Precondición	Datos de Prueba	Resultado Esperado	Resultado Obtenido	Estado	Fecha / Hora Ejecución	Fecha / Hora Re-Test	Solución / Commit
CP-H11-WEB-01	Renderizado de las columnas institucionales del directorio	Funcional / UI	Componente	Alta	Directorio con funcionarios	EmpleadoTabla con empleados de prueba	Columnas RUT, Nombre y apellidos, Correo, Teléfono, Rol/Cargo, Delegación, Estado Operativo y Acciones	Las 8 columnas se renderizan con los rótulos institucionales	APROBADO	20/10/2026 21:30	-	feat(admin): mostrar y filtrar estado operativo
CP-H11-WEB-02	Badge de estado operativo por disponibilidad	Funcional / UI	Componente	Alta	Empleado con estado en_mision	EmpleadoTabla	Muestra el badge "En Misión" con data-estado="en_mision"	Badge institucional renderizado con la etiqueta correcta	APROBADO	20/10/2026 21:32	-	feat(admin): mostrar y filtrar estado operativo
CP-H11-WEB-03	Catálogo completo de badges de estado	Funcional / UI	Componente	Media	Los 6 estados del enum	BadgeEstadoOperativo	Etiquetas: Disponible, En Misión, En Patrulla, Descanso, Licencia, Inactivo	Las 6 etiquetas se renderizan correctamente	APROBADO	20/10/2026 21:34	-	feat(admin): mostrar y filtrar estado operativo
CP-H11-WEB-04	Estado operativo visible para empleados sin ficha de terreno	Regla de Negocio	Componente	Crítica	Empleado administrativo (disponible_terreno = null)	EmpleadoTabla	Muestra igualmente el estado operativo	Se muestra el badge "Descanso" pese a no existir ficha de terreno	APROBADO	20/10/2026 21:36	-	feat(personal): exponer disponibilidad no nula y capacidad de terreno
CP-H11-WEB-05	Estado vacío con acción "Limpiar filtros"	Funcional / UI	Componente	Media	Directorio sin coincidencias	EmpleadoTabla con empleados=[] y onLimpiarFiltros	Muestra estado vacío y botón de limpieza funcional	Estado vacío institucional mostrado y la acción invoca limpiarFiltros	APROBADO	20/10/2026 21:38	-	feat(admin): mostrar y filtrar estado operativo
CP-H11-WEB-06	Esqueleto de carga durante la consulta	Funcional / UI	Componente	Media	Consulta en curso	EmpleadoTabla con cargando=true	Muestra el esqueleto de filas	data-testid="empleados-skeleton" presente	APROBADO	20/10/2026 21:40	-	feat(admin): mostrar y filtrar estado operativo
CP-H11-WEB-07	Paginación resuelta en el servidor	Integración	Hook / Servicio	Crítica	2 páginas de resultados	useEmpleados	Envía page y limit al backend y no filtra en memoria	La llamada incluye page y limit; empleadosPaginados es la página del servidor	APROBADO	20/10/2026 21:42	-	feat(admin): mostrar y filtrar estado operativo
CP-H11-WEB-08	Filtro por estado operativo enviado al servidor	Integración	Hook / Servicio	Alta	Estado seleccionado	useEmpleados.setEstadoOperativoFiltro('en_mision')	El backend recibe estadoOperativo=en_mision	Parámetro presente en la consulta al backend	APROBADO	20/10/2026 21:44	-	feat(admin): mostrar y filtrar estado operativo
CP-H11-WEB-09	Toggle de funcionarios inactivos	Funcional	Hook / UI	Alta	Directorio con dados de baja	useEmpleados.setIncluirInactivos(true)	Se envía incluirInactivos=true y por defecto false	Comportamiento verificado en el hook y en la barra de filtros	APROBADO	20/10/2026 21:46	-	feat(admin): mostrar y filtrar estado operativo
CP-H11-WEB-10	Delegación filtrada por UUID	Funcional	UI	Alta	Catálogo de delegaciones	EmpleadoFiltrosBar	El selector emite el UUID de la delegación	setDelegacionFiltro recibe del-1 (UUID) y no el nombre legible	APROBADO	20/10/2026 21:48	-	feat(admin): mostrar y filtrar estado operativo
CP-H11-WEB-11	Filtro de estado operativo y toggle de inactivos en la barra	Funcional / UI	Componente	Alta	Barra de filtros	EmpleadoFiltrosBar	Selector de estado operativo y casilla de inactivos operables	Ambos controles emitieron los valores esperados	APROBADO	20/10/2026 21:50	-	feat(admin): mostrar y filtrar estado operativo
CP-H11-WEB-12	Sincronización de filtros con la URL	Funcional	Hook	Media	Filtros aplicados	useEmpleados	La URL refleja los filtros activos	window.location.search contiene estadoOperativo e incluirInactivos	APROBADO	20/10/2026 21:52	-	feat(admin): mostrar y filtrar estado operativo
CP-H11-WEB-13	Reset de página al cambiar un filtro	Funcional	Hook	Media	Página 3 seleccionada	useEmpleados	La paginación vuelve a la página 1	paginaActual vuelve a 1	APROBADO	20/10/2026 21:54	-	feat(admin): mostrar y filtrar estado operativo
CP-H11-WEB-14	Limpieza completa de filtros	Funcional	Hook	Media	Filtros aplicados	useEmpleados.limpiarFiltros()	Todos los filtros vuelven al valor inicial	Estado, cargo, inactivos y paginación restablecidos	APROBADO	20/10/2026 21:56	-	feat(admin): mostrar y filtrar estado operativo
CP-H11-WEB-15	Envío del estado operativo en la edición	Integración	Hook / Servicio	Crítica	Funcionario administrativo	useEmpleadoForm	El payload incluye estado_operativo y no disponible_terreno	Payload verificado con estado_operativo: 'descanso'	APROBADO	20/10/2026 21:58	-	feat(personal): exponer disponibilidad no nula y capacidad de terreno
CP-H11-WEB-16	Capacidad de terreno sólo para roles de terreno	Regla de Negocio	Hook / Servicio	Crítica	Funcionario de terreno	useEmpleadoForm	El payload incluye disponible_terreno	Payload incluye disponible_terreno: false cuando se desmarca	APROBADO	20/10/2026 22:00	-	feat(personal): exponer disponibilidad no nula y capacidad de terreno
```

---

## 4. Pruebas Automatizadas Agregadas (Vitest)

| Archivo de prueba | Cobertura |
|---|---|
| `src/hooks/__tests__/useEmpleados.test.ts` | Paginación y filtros en servidor, toggle de inactivos, sincronización con URL, reset de página y limpieza de filtros. |
| `src/services/__tests__/empleadosService.test.ts` | Parámetros enviados a `GET /api/personal` (paginación, filtros, estado operativo, inactivos) y estandarización de `meta`. |
| `src/components/admin/empleados/__tests__/EmpleadoTabla.test.tsx` | Columnas, badges, estado vacío, esqueleto de carga y acciones. |
| `src/components/admin/empleados/__tests__/BadgeEstadoOperativo.test.tsx` | Catálogo completo de estados y tratamiento del estado ausente. |
| `src/components/admin/empleados/__tests__/EmpleadoFiltrosBar.test.tsx` | Filtro de estado operativo, delegación por UUID y toggle de inactivos. |
| `src/hooks/__tests__/empleadoFormulario.disponibilidad.test.ts` | Envío del estado operativo y de la capacidad de terreno en alta y edición. |
| `src/app/(admin)/admin/empleados/__tests__/AdminEmpleadosPage.test.tsx` | Integración de la página de administración con el directorio paginado. |

---

## 5. Conclusiones de QA

- El directorio muestra la **disponibilidad actual de todos los funcionarios**, incluidos los
  administrativos que no poseen ficha de terreno, satisfaciendo el criterio de aceptación de la HU-11.
- La paginación y los filtros se resuelven en el servidor, orientando la experiencia y evitando
  paginación inconsistente con el total real de registros.
- El formulario diferencia correctamente *estado* (siempre editable) de *capacidad de terreno*
  (sólo para perfiles de terreno), en línea con el modelo normalizado de la API.
- No se detectaron defectos funcionales, visuales ni de accesibilidad en los componentes de H11.
