# Manual de Usuario — H13: Baja Lógica de Empleados del Sistema

## 1. Información General

- **Código de Historia de Usuario:** H13 (Backlog SGRAI)
- **Rol(es) Destinatario(s):** Administrador General, Encargado de Recursos Humanos y Seguridad.
- **Objetivo:** Permitir la baja lógica (desactivación preventiva) de un funcionario o empleado municipal en la plataforma SGRAI, garantizando la preservación íntegra del historial de incidentes y misiones operativas, revocando su acceso al sistema y quitándolo de los listados de disponibilidad de asignación territorial.

---

## 2. Acceso a la Funcionalidad

1. Inicie sesión en la plataforma institucional SGRAI con una cuenta que posea el perfil de **Administrador**.
2. Desde el Portal de Gestión (`/gestion`), seleccione en la barra lateral (`AppSidebar`) o en el catálogo modular **"Administración" › "Gestión de Personal"**.
3. La plataforma abrirá la interfaz de administración en la ruta canónica `/gestion/admin/empleados`.

---

## 3. Flujo Paso a Paso para Dar de Baja a un Funcionario

### Paso 1: Localización del Empleado
1. En la columna izquierda (*Listado de Funcionarios*), utilice la barra de búsqueda para ubicar al empleado por **RUT**, **Nombres**, **Apellidos** o **Correo electrónico**.
2. También puede filtrar el listado por **Delegación Municipal**, **Rol Institucional** o seleccionar el filtro de estado como *"Solo Activos"*.

### Paso 2: Accionar la Baja
Existen dos formas de iniciar el proceso de baja lógica:
- **Desde la fila de la tabla:** En la columna de acciones de la fila correspondiente al funcionario activo, haga clic en el botón de eliminación (ícono de papelera roja).
- **Desde el panel lateral de modificación:** Al seleccionar al empleado en la tabla, se desplegará su ficha de datos a la derecha. En la parte inferior del panel encontrará el botón secundario **"Dar de baja empleado"**.

> **Nota:** Si el empleado ya se encuentra inactivo, el botón de baja se encontrará automáticamente deshabilitado o no disponible en la fila.

### Paso 3: Confirmación en el Diálogo Modal
Al presionar el botón de baja, el sistema abrirá un diálogo modal de confirmación con los datos del empleado (Nombre completo y RUT):

1. **Si el empleado está disponible:**  
   El modal detallará las consecuencias de la operación:
   - *Revocación inmediata del inicio de sesión.*
   - *Desactivación de su disponibilidad para asignaciones en terreno.*
   - *Preservación de la integridad histórica de misiones pasadas.*
   
   Presione **"Sí, dar de baja"** para confirmar la operación, o **"Cancelar"** para abortarla sin cambios.

2. **Si el empleado se encuentra en terreno o misión activa (`en_mision` / `en_patrulla`):**  
   El sistema activará una **alerta de bloqueo de seguridad**:
   - Se mostrará un aviso destacado: *"Acción Bloqueada: Funcionario en terreno activo"*.
   - El botón de confirmación quedará oculto/bloqueado.
   - Para poder dar de baja a este funcionario, el Encargado de Operaciones o la Central deben finalizar o reasignar la misión en curso en el módulo ICS/Kanban.

### Paso 4: Notificación y Actualización Reactiva
- Tras confirmar la baja con éxito, el sistema emitirá una notificación visual verde tipo **Toast**:  
  *«El funcionario [Nombre Apellido] ha sido dado de baja lógicamente del sistema.»*
- El listado se actualizará automáticamente sin recargar la página, removiendo al funcionario de la vista de personal activo.
- Si la ficha estaba abierta en el panel lateral, esta se cerrará automáticamente.

---

## 4. Preguntas Frecuentes y Consideraciones de Seguridad

### ¿Se eliminan los registros de incidentes en los que participó el funcionario?
**No.** Por diseño de arquitectura y requerimientos de auditoría para SENAPRED, el sistema nunca ejecuta un borrado físico (`DELETE`). Toda la información histórica de despachos, verificaciones y fichas FIBE se mantiene intacta en la base de datos municipal.

### ¿Qué ocurre si el usuario intenta iniciar sesión tras la baja?
Cualquier intento de acceso a través de la web o de la PWA de terreno será rechazado de inmediato con un mensaje de cuenta inactiva (`401 Unauthorized` / `403 Forbidden`).
