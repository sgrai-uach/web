# Manual de Usuario: H74 - Editar Planificación de Operativo de Recuperación

Este manual documenta el flujo de **Edición de Planificación de Operativos de Recuperación en Curso** en la plataforma web del Sistema de Gestión de Recursos para Atención de Incidentes (SGRAI) de la Municipalidad de Valdivia.

---

## 1. Información General

- **Roles a los que está dirigido:** Encargado de Operaciones y Administrador General.
- **Objetivo de la funcionalidad:** Permitir modificar la descripción de tareas, la fecha estimada de término, la patrulla verificadora asignada y la dotación de insumos/recursos de un operativo de recuperación en curso para adaptarlo a nuevas necesidades en terreno o disponibilidad logística.
- **Ruta de acceso en la plataforma web:** `/gestion/centro-incidentes` (pestaña **Recuperación** → botón **Editar** en la columna de acciones de la tabla, o dentro del panel lateral de detalle → botón **Editar Planificación**).

---

## 2. Control de Acceso y Reglas de Bloqueo

| Condición | Comportamiento en la Interfaz |
|---|---|
| Usuario con permiso `recuperacion:editar` y operativo `PLANIFICADA` o `EN_EJECUCION` | El botón **Editar Planificación** se muestra habilitado en el panel de detalle. |
| Usuario con permiso `recuperacion:editar` y operativo `COMPLETADA` o `CANCELADA` | El botón **Editar Planificación** permanece visible pero **inhabilitado** con aviso de bloqueo. |
| Usuario sin permiso `recuperacion:editar` (ej. Supervisor o rol sin privilegio) | El botón **Editar Planificación** no se muestra. |

---

## 3. Pasos para Editar un Operativo de Recuperación

1. **Acceder a la edición desde la tabla o el detalle:**
   En `/gestion/centro-incidentes`, seleccione la pestaña **Recuperación** (ver [H73 - Listar y Consultar Operativos de Recuperación](./H73-listar-operativos-recuperacion.md)) y elija una de estas dos vías:
   - Hacer clic directamente en el botón **Editar** de la columna **Acciones** en la fila del operativo.
   - O hacer clic en la fila / botón **Detalle** para abrir el panel lateral derecho y presionar **Editar Planificación** en la barra superior.

   ![Tabla de operativos con botón Editar y Drawer con acción Editar Planificación](./assets/H74-editar-operativo-recuperacion/01-tabla-y-drawer-editar.png)

2. **Modificar los campos requeridos en el modal:**
   El formulario se precarga automáticamente con la planificación vigente:
   - **Descripción de tareas e indicaciones:** Texto entre 3 y 1000 caracteres. Al guardar, también actualiza la descripción de la misión vinculada.
   - **Fecha estimada de término:** Fecha y hora límite estimada (no puede ser anterior a la fecha de creación del operativo).
   - **Patrulla verificadora asignada:** Permite reasignar el operativo a otra patrulla en estado `DISPONIBLE`. La patrulla anterior queda liberada automáticamente (si no posee otras misiones activas).
   - **Dotación de insumos y recursos:** Permite agregar, quitar o ajustar cantidades de recursos. El guardado realiza un reemplazo declarativo completo y ajusta el stock en bodega por diferencia.

   ![Modal de edición de planificación precargado con datos del operativo](./assets/H74-editar-operativo-recuperacion/02-modal-editar-planificacion.png)

3. **Guardar cambios:**
   Presione **Guardar Planificación**. El sistema confirmará la actualización mediante una notificación, cerrará el modal y refrescará el detalle y el listado en tiempo real.

4. **Bloqueo en operativos culminados o cancelados:**
   Cuando el operativo se encuentra en estado `COMPLETADA` o `CANCELADA`, el botón **Editar** en la tabla y el botón **Editar Planificación** en el Drawer permanecen **inhabilitados** con el aviso correspondiente.

   ![Drawer de operativo cerrado con botón Editar Planificación inhabilitado](./assets/H74-editar-operativo-recuperacion/03-operativo-bloqueado-completada.png)

---

## 4. Casos Especiales y Mensajes de Error

- **Sin modificaciones (`400 Bad Request` / validación local):** Debe modificar al menos un campo antes de guardar.
- **Fecha estimada inválida (`400 Bad Request`):** Si la fecha estimada de término es anterior a la fecha de creación del operativo, se muestra un error en el campo correspondiente.
- **Stock insuficiente o patrulla ocupada (`409 Conflict`):** El modal permanece abierto mostrando el mensaje devuelto por la API (por ejemplo, stock insuficiente en bodega o patrulla no disponible) para que pueda corregir la planificación sin perder los cambios ingresados.
- **Operativo culminado o cancelado (`409 Conflict`):** Si el operativo cambió a `COMPLETADA` o `CANCELADA` mientras estaba abierto, el servidor bloquea la edición e informa el motivo.
- **Permisos insuficientes (`403 Forbidden`):** Requiere permiso `recuperacion:editar`.

---

## 5. Relación con Otros Módulos y Repositorios

- **`sgrai-api` (`PATCH /api/eventos-atp/recuperacion/{id}`):** Valida el estado del operativo, recalcula el diferencial de inventario en bodega, libera/reasigna patrullas, registra auditoría (`actualizado_en`, `actualizado_por_id`) y emite el evento Socket.io `recuperacion:actualizada`.
- **`sgrai-pwa` (Patrulla en terreno):** Cuando se reasigna la patrulla desde la web, `sgrai-api` notifica automáticamente en tiempo real a la patrulla liberada (`mision:reasignada`) y a la nueva patrulla asignada (`mision:asignada`).
