# Manual de Usuario: Listado y Visualización de Cuadrillas Operativas (HU-80)

**Código Historia de Usuario:** HU-80  
**Módulo:** Administración / Cuadrillas Operativas  
**Roles Destinatarios:** Administrador Municipal, Encargado de Operaciones, Supervisor Estratégico  
**Permiso RBAC Requerido:** `recursos:leer`, `recursos:gestionar` o rol `ADMINISTRADOR` / `ADMIN`  
**Ruta del Módulo:** `/gestion/admin/cuadrillas` (o `/admin/cuadrillas`)  
**Versión:** 1.0.0 (SGRAI v0.7.0)  

---

## 1. Acceso a la Vista

Para acceder al módulo de gestión y listado de cuadrillas operativas:

1. Inicie sesión en la plataforma SGRAI con una cuenta que disponga del permiso RBAC **`recursos:leer`** o pertenezca al rol **Administrador General** o **Encargado de Operaciones**.
2. En la barra de navegación lateral (`AppSidebar`), ubique la sección **Administración** y haga clic en **"Cuadrillas"**.
3. También puede acceder directamente ingresando la URL `/gestion/admin/cuadrillas` en su navegador.
4. Si un usuario sin privilegios intenta acceder, el sistema mostrará la pantalla de **Acceso Restringido (HTTP 403)** impidiendo la visualización de la dotación y recursos municipales.

---

## 2. Descripción de Columnas de la Tabla

La tabla principal presenta la nómina completa de unidades tácticas con los siguientes datos consolidados:

| Columna | Descripción | Elementos Visuales |
|---|---|---|
| **Cuadrilla / Unidad** | Nombre único identificatorio de la cuadrilla municipal. | Texto en negrita acompañado del ícono identificatorio de brigada. |
| **Delegación** | Delegación municipal territorial a la que está adscrita la unidad (Norte, Sur, Costa o Calle Calle). | Nombre formal de la delegación y su jurisdicción comunal. |
| **Líder Delegado** | Funcionario municipal asignado formalmente como líder en terreno. | Nombre completo del delegado, correo institucional y RUT. |
| **Estado Operativo** | Condición operativa canónica de la cuadrilla en el Sistema de Comando de Incidentes. | Badge cromático normalizado con punto indicador de estado. |
| **Personal** | Conteo total de brigadistas y operarios asignados a la dotación humana. | Badge numérico con ícono de operarios (ej. `4 miembros`). |
| **Recursos** | Conteo de vehículos, maquinarias pesadas y equipos asignados. | Badge numérico con ícono de herramientas/maquinaria (ej. `2 equipos`). |
| **Acciones** | Acciones rápidas disponibles para la cuadrilla. | Botones de **Detalle** (abre drawer) y **Editar** (abre modal de edición si el usuario tiene permiso `recursos:editar`). |

---

## 3. Uso de Filtros y Búsqueda

La barra superior de herramientas (`CuadrillasFiltros`) permite filtrar en tiempo real el listado conforme al estándar unificado de filtros H34:

1. **Búsqueda por Texto Libre:**
   - Permite escribir en el cuadro de búsqueda (*"Buscar por cuadrilla o delegado..."*).
   - Busca coincidencias instantáneas e insensibles a mayúsculas sobre el **nombre de la cuadrilla**, **nombre del delegado** o su **RUT**.
2. **Filtro por Delegación Territorial:**
   - Despliegue el selector de delegaciones y elija una delegación específica (*Delegación Norte*, *Delegación Sur*, *Delegación Costa* o *Delegación Calle Calle*).
   - Para restablecer, seleccione *"Todas las delegaciones"*.
3. **Filtro por Estado Operativo:**
   - Permite filtrar por una condición específica: *Disponible*, *En Misión (Terreno)* o *No Disponible*.
   - Para restablecer, seleccione *"Todos los estados"*.
4. **Botón "Limpiar filtros":**
   - Cuando hay al menos un filtro activo (texto, delegación o estado), aparece automáticamente el botón **"Limpiar filtros"**.
   - Al presionarlo, todos los filtros se restablecen simultáneamente a sus valores predeterminados y la tabla vuelve a desplegar el listado completo.

---

## 4. Interpretación de Badges de Estado Operativo

El sistema clasifica el estado de cada cuadrilla mediante badges con códigos cromáticos estandarizados:

* 🟢 **DISPONIBLE (Verde):**
  - La cuadrilla se encuentra libre en su base territorial y en condiciones operativas óptimas para ser asignada y despachada de inmediato a una nueva emergencia.
* 🟠 **EN MISIÓN (Naranja):**
  - La unidad se encuentra actualmente despachada a terreno atendiendo una misión activa (en tránsito, en evaluación o en faenas de mitigación/despeje).
  - *Restricción operativa:* Las cuadrillas en este estado no pueden ser editadas ni reasignadas hasta que concluyan o replieguen su intervención.
* ⚪ / 🔴 **NO DISPONIBLE (Gris / Neutral):**
  - La cuadrilla se encuentra fuera de servicio por falta de dotación mínima, mantenimiento de vehículos o decisión administrativa temporal.

---

## 5. Visualización del Detalle de Cuadrilla (Drawer Lateral)

Para inspeccionar la dotación integral de una unidad táctica sin abandonar la pantalla:

1. Haga clic en el botón **"Detalle"** (ícono de ojo) en la fila de la cuadrilla deseada, o bien presione directamente sobre la fila.
2. Se desplegará desde el costado derecho el panel lateral **`CuadrillaDetalleDrawer`**.
3. El drawer presenta tres pestañas/secciones:
   - **Información General:** Nombre formal, delegación base, delegado responsable con RUT y fecha de registro.
   - **Dotación de Personal:** Nómina detallada de los trabajadores municipales adscritos, indicando RUT, cargo (ej. Motosierrista, Brigadista, Chofer), especialidad y fecha de asignación.
   - **Equipamiento y Recursos:** Listado de maquinarias, vehículos 4x4, motobombas y herramientas asignadas, especificando si se trata de un recurso de uso individual o de stock colectivo.
4. Para cerrar el panel, haga clic en el botón de cerrar (`✕`) o presione fuera del área del drawer.

---

## 6. Paginación y Navegación

En la parte inferior de la tabla se encuentra la barra de paginación (`PaginacionTabla`):

1. **Indicador de Registros:** Muestra la cantidad total de cuadrillas encontradas y el rango actualmente visible (ej. *"Mostrando 1 a 10 de 24 cuadrillas"*).
2. **Cambio de Página:** Utilice los botones **Anterior** y **Siguiente** o los números de página para desplazarse entre lotes.
3. **Persistencia de Filtros:** La paginación mantiene siempre activos los filtros de búsqueda, delegación y estado seleccionados, calculando dinámicamente el número total de páginas resultantes.
4. **Sincronización en Tiempo Real:** Si otra terminal municipal registra o actualiza una cuadrilla, la tabla y los conteos de paginación se actualizan automáticamente vía WebSockets (`cuadrilla:creada`, `cuadrilla:actualizada`) sin requerir recarga manual.
