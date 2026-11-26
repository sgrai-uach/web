# Manual de Usuario: H73 - Listar y Consultar Operativos de Recuperación

Este manual documenta el funcionamiento de la vista de **Listado y Detalle de Operativos de Recuperación Post-Desastre** en la plataforma web del Sistema de Gestión de Recursos para Atención de Incidentes (SGRAI) de la Municipalidad de Valdivia.

---

## 1. Información General

- **Roles a los que está dirigido:** Encargado de Operaciones, Supervisor Estratégico y Administrador General.
- **Objetivo de la funcionalidad:** Permitir el seguimiento centralizado, filtrado y paginado de todos los operativos de recuperación post-desastre desplegados en las delegaciones municipales de Valdivia, incluyendo la consulta de insumos asignados y su historial cronológico.
- **Ruta de acceso en la plataforma web:** `/gestion/centro-incidentes` (pestaña **Recuperación**, o acceso directo vía `?vista=recuperacion`).

---

## 2. Control de Acceso (RBAC)

| Rol | Permiso Requerido | Resultado Esperable |
|---|---|---|
| **Encargado de Operaciones** | `recuperacion:leer` | **Permitido:** Acceso al listado completo y drawer de detalle. |
| **Supervisor Estratégico** | `recuperacion:leer` | **Permitido:** Acceso directo a la pestaña Recuperación para monitoreo. |
| **Administrador** | `recuperacion:leer` | **Permitido:** Acceso total. |
| **Otros roles sin permiso** | Sin `recuperacion:leer` | **Denegado:** Se muestra pantalla de Acceso Restringido (`403 Forbidden`). |

---

## 3. Pasos para Consultar los Operativos de Recuperación

1. **Ingresar al Centro de Incidentes:**
   Navegue a `/gestion/centro-incidentes` desde el menú lateral o desde el panel de inicio.
2. **Cambiar a la subvista Recuperación:**
   En el selector de visualización superior, haga clic en la pestaña **Recuperación**. El estado de la pestaña, los filtros activos, la página y el ordenamiento se sincronizan automáticamente con los parámetros de la URL para conservar el contexto al recargar la página.
   > *Nota:* Al activar esta pestaña, se ocultan los KPIs y filtros propios del tablero Kanban de incidentes para mostrar únicamente la barra de herramientas y filtros de recuperación.
3. **Filtrar y ordenar el listado:**
   Utilice la barra de filtros para acotar los resultados por:
   - **Búsqueda textual:** Código (`REC-YYYY-XXXX`), nombre del operativo o sector.
   - **Delegación Municipal:** Filtro territorial por delegación.
   - **Estado:** `Planificada`, `En Ejecución`, `Completada` o `Cancelada`.
   - **Prioridad:** `Crítica`, `Alta`, `Media` o `Baja`.
   - **Rango de fechas:** Campos **Desde** y **Hasta** (con restricción automática para evitar rangos invertidos).
   Los filtros aplicados se muestran como etiquetas removibles debajo de la barra de filtros, permitiendo quitar cada criterio individualmente o limpiar todos a la vez.
   También puede hacer clic en las cabeceras de **Código** o **Fecha de Registro** para ordenar ascendente o descendentemente.
4. **Navegar entre páginas (Contrato H34):**
   En la parte inferior de la tabla, utilice los controles **Anterior** / **Siguiente** y el selector de registros por página (`10`, `25`, `50`).
5. **Consultar el detalle en el Drawer Lateral:**
   Haga clic sobre cualquier fila de la tabla (o navegue con `Tab` y presione `Enter` / `Espacio`, o use el botón **Detalle**) para abrir el panel lateral derecho con:
   - **Detalles generales:** Código, descripción, estado, prioridad, sector, creador y fechas.
   - **Delegación y Misión asignada:** Delegación municipal, código/estado de misión y patrulla vinculada.
   - **Recursos e insumos asignados:** Tabla con las columnas **Recurso** y **Cantidad asignada**.
   - **Historial del operativo:** Línea de tiempo cronológica de hitos y actualizaciones.
6. **Registrar un nuevo operativo (Acceso directo):**
   Los roles con permiso de creación pueden presionar **Nuevo Operativo de Recuperación** para abrir el formulario de creación correspondiente a [H29 - Crear Evento de Recuperación](./H29-crear-evento-recuperacion.md).

---

## 4. Casos Especiales y Mensajes de Error

- **Sesión expirada (`401 Unauthorized`):** El sistema cierra la sesión local y redirige automáticamente a `/login` conservando la ruta de retorno.
- **Permisos insuficientes (`403 Forbidden`):** Se muestra el aviso **Acceso Restringido** indicando que se requiere el permiso `recuperacion:leer`.
- **Error de comunicación o servidor (`500` / `400`):** Se muestra una alerta de error dedicada con el botón **Reintentar** para volver a consultar el listado.
- **Operativo no encontrado (`404 Not Found`):** Si un operativo fue eliminado al intentar abrir su detalle, el drawer se cierra automáticamente y se muestra una notificación de error.
- **Sin resultados:** Si ningún registro coincide con los filtros aplicados, se muestra un estado vacío con el botón **Limpiar filtros**.

---

## 5. Relación con Otros Módulos y Repositorios

- **Creación de operativos (Web):** Los operativos listados en esta vista se originan en el flujo documentado en [H29 - Crear Evento de Recuperación](./H29-crear-evento-recuperacion.md) y se actualizan en tiempo real vía Socket.io (`recuperacion:creada`).
- **Terreno (PWA / API):** Las misiones asociadas a cada operativo son ejecutadas y reportadas por la Patrulla Verificadora desde `sgrai-pwa`, alimentando el historial de hitos expuesto por `sgrai-api`.
