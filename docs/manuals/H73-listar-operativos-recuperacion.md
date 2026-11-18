# Manual de Usuario: H73 - Listar y Consultar Operativos de Recuperación

Este manual documenta el funcionamiento de la vista de **Listado y Detalle de Operativos de Recuperación Post-Desastre** en la plataforma web del Sistema de Gestión de Recursos para Atención de Incidentes (SGRAI) de la Municipalidad de Valdivia.

---

## 1. Información General

- **Roles a los que está dirigido:** Encargado de Operaciones, Supervisor Estratégico y Administrador General.
- **Objetivo de la funcionalidad:** Permitir el seguimiento centralizado, filtrado y paginado de todos los operativos de recuperación post-desastre desplegados en las delegaciones municipales de Valdivia, incluyendo la consulta de insumos asignados y su historial cronológico.
- **Ruta de acceso en la plataforma web:** `/gestion/centro-incidentes` (pestaña **Recuperación**).

---

## 2. Control de Acceso (RBAC)

| Rol | Permiso Requerido | Resultado Esperable |
|---|---|---|
| **Encargado de Operaciones** | `recuperacion:leer` | **Permitido:** Acceso al listado completo y drawer de detalle. |
| **Supervisor** | `recuperacion:leer` | **Permitido:** Acceso de monitoreo al listado y detalle. |
| **Administrador** | `recuperacion:leer` | **Permitido:** Acceso total. |
| **Otros roles sin permiso** | Sin `recuperacion:leer` | **Denegado:** Se muestra pantalla de Acceso Restringido (`403 Forbidden`). |

---

## 3. Pasos para Consultar los Operativos de Recuperación

1. **Ingresar al Centro de Incidentes:**
   Navegue a `/gestion/centro-incidentes` desde el menú lateral.
2. **Cambiar a la subvista Recuperación:**
   En el selector de visualización superior, haga clic en la pestaña **Recuperación**.
   > *Nota:* Al activar esta pestaña, se ocultan los KPIs y filtros propios del tablero Kanban de incidentes para mostrar únicamente la barra de herramientas y filtros de recuperación.
   *(Captura pendiente: `assets/H73-listar-operativos-recuperacion/01-pestana-recuperacion.png`)*
3. **Filtrar y ordenar el listado:**
   Utilice la barra de filtros para acotar los resultados por:
   - **Búsqueda textual:** Código (`REC-YYYY-XXXX`), nombre del operativo o sector.
   - **Delegación Municipal:** Filtro territorial por delegación.
   - **Estado:** `Planificada`, `En Ejecución`, `Completada` o `Cancelada`.
   - **Prioridad:** `Crítica`, `Alta`, `Media` o `Baja`.
   - **Rango de fechas:** Campos **Desde** y **Hasta**.
   También puede hacer clic en las cabeceras de **Código** o **Fecha de Registro** para ordenar ascendente o descendentemente.
   *(Captura pendiente: `assets/H73-listar-operativos-recuperacion/02-filtros-y-tabla.png`)*
4. **Navegar entre páginas (Contrato H34):**
   En la parte inferior de la tabla, utilice los controles **Anterior** / **Siguiente** y el selector de registros por página (`10`, `25`, `50`).
5. **Consultar el detalle en el Drawer Lateral:**
   Haga clic sobre cualquier fila de la tabla (o en el botón **Detalle**) para abrir el panel lateral derecho con:
   - **Detalles generales:** Código, descripción, estado, prioridad, sector, creador y fechas.
   - **Delegación y Misión asignada:** Código de misión y patrulla vinculada.
   - **Recursos e insumos asignados:** Tabla con nombre, tipo, cantidad y unidad.
   - **Historial del operativo:** Línea de tiempo cronológica de hitos y actualizaciones.
   *(Captura pendiente: `assets/H73-listar-operativos-recuperacion/03-drawer-detalle.png`)*
6. **Registrar un nuevo operativo (Acceso directo):**
   Desde la misma subvista puede presionar el botón **Nuevo Operativo de Recuperación** para abrir el formulario de creación correspondiente a [H29 - Crear Evento de Recuperación](./H29-crear-evento-recuperacion.md).

---

## 4. Casos Especiales y Mensajes de Error

- **Sesión expirada (`401 Unauthorized`):** El sistema cierra la sesión local y redirige automáticamente a `/login` conservando la ruta de retorno.
- **Permisos insuficientes (`403 Forbidden`):** Se muestra el aviso **Acceso Restringido** indicando que se requiere el permiso `recuperacion:leer`.
- **Operativo no encontrado (`404 Not Found`):** Si un operativo fue eliminado al intentar abrir su detalle, el drawer se cierra automáticamente y se muestra una notificación de error.
- **Sin resultados:** Si ningún registro coincide con los filtros aplicados, se muestra un estado vacío con la opción de registrar un nuevo operativo o limpiar los filtros activos.

---

## 5. Relación con Otros Módulos y Repositorios

- **Creación de operativos (Web):** Los operativos listados en esta vista se originan en el flujo documentado en [H29 - Crear Evento de Recuperación](./H29-crear-evento-recuperacion.md) y se actualizan en tiempo real vía Socket.io (`recuperacion:creada`).
- **Terreno (PWA / API):** Las misiones asociadas a cada operativo son ejecutadas y reportadas por la Patrulla Verificadora desde `sgrai-pwa`, alimentando el historial de hitos expuesto por `sgrai-api`.
