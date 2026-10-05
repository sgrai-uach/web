# Manual de Usuario — H12: Edición y Actualización de Funcionarios del Sistema

## 1. Información General

- **Código de Historia de Usuario:** H12 (Backlog SGRAI)
- **Rol(es) Destinatario(s):** Administrador General, Encargado de Recursos Humanos y Seguridad.
- **Objetivo:** Permitir la edición, actualización y parametrización de antecedentes personales, vías de contacto institucional, dependencia territorial, rol de seguridad y ficha técnica operativa de un funcionario o empleado municipal en la plataforma SGRAI, manteniendo la consistencia de auditoría y garantizando que los datos reflejen la dotación activa para despacho territorial.
- **Permisos Requeridos:** `personal:gestionar`, `personal:editar` (o rol `Administrador` / `ADMIN`).

---

## 2. Acceso a la Funcionalidad

1. Inicie sesión en la plataforma institucional SGRAI con una cuenta que posea el perfil de **Administrador** o permisos sobre gestión de personal.
2. Desde la página de inicio del **Portal de Gestión** (`/gestion`), seleccione en el catálogo modular **"Gestión de Personal"** o navegue en la barra lateral (`AppSidebar`) a **Administración › Gestión de Personal**.
3. La plataforma abrirá la interfaz de administración en la ruta canónica:
   ```
   /gestion/admin/empleados
   ```

---

## 3. Flujo Paso a Paso para Modificar a un Funcionario

La interfaz opera bajo el patrón arquitectónico maestro-detalle (*Master-Detail*), manteniendo el listado permanente de personal a la izquierda y desplegando la **Ficha de Modificación** interactiva en el panel lateral derecho (o como widget superpuesto en dispositivos móviles).

### Paso 1: Selección del Funcionario en la Lista
1. En la columna izquierda (*Listado de Funcionarios*), utilice la barra de búsqueda para ubicar al empleado por **RUT**, **Nombres**, **Apellidos** o **Correo electrónico**.
2. Puede aplicar filtros adicionales por **Delegación Municipal** (*Norte*, *Sur*, *Costa*, *Calle Calle*), **Rol Institucional** (*Administrador*, *Call Center*, *Encargado*, *Patrulla Verificadora*, *Delegado de Cuadrilla*, *Asistente Social*) o por **Estado** (*Todos*, *Solo Activos*, *Solo Inactivos*).
3. En la fila del funcionario, haga clic en el botón de acción **"Editar"** (ícono de lápiz en color institucional Teal) o seleccione directamente la fila del empleado.

### Paso 2: Carga de la Ficha de Modificación
Al seleccionar al funcionario, el panel lateral derecho cargará automáticamente el formulario estructurado con los datos vigentes del empleado:

1. **Inmutabilidad del RUT (Cédula de Identidad):**
   - El campo **RUT Chileno** se presenta en modo de solo lectura / deshabilitado.
   - *Regla de Negocio:* Por motivos de seguridad criptográfica, trazabilidad histórica en bitácoras de incidentes y auditoría ministerial SENAPRED, el identificador único RUN/RUT no puede ser modificado.

2. **Sección Datos Personales y de Contacto:**
   - **Nombres y Apellidos (\*):** Actualice la denominación oficial del funcionario.
   - **Correo Electrónico (\*):** Actualice el correo institucional (`@valdivia.cl`) o correo corporativo válido. El sistema valida el formato sintáctico antes de enviar.
   - **Teléfono de Contacto (\*):** Ingrese o actualice el número telefónico móvil (+569...) o de red fija municipal.

3. **Sección Asignación Institucional y Rol:**
   - **Rol Institucional (\*):** Modifique el perfil de seguridad del funcionario en el desplegable. Al cambiar de rol, los permisos efectivos del usuario en el sistema se actualizarán inmediatamente al guardar.
   - **Delegación Territorial (\*):** Reasigne la dependencia territorial del funcionario (*Delegación Norte*, *Sur*, *Costa* o *Calle Calle*) según las necesidades operativas de la Dirección de Gestión de Riesgos de Desastres.
   - **Fecha de Ingreso:** Fecha oficial de incorporación a las labores municipales.
   - **Estado Activo (Casilla de Verificación):** Permite verificar o conmutar si el funcionario se encuentra habilitado para operar.

4. **Sección Ficha Operativa de Terreno (Condicional):**
   - Esta sección se activa automáticamente si el rol del empleado corresponde a personal operativo en terreno (*Patrulla Verificadora*, *Delegado de Cuadrilla*, *Brigadista*):
     - **Cargo Operativo:** Asigne la posición en terreno (ej. *Delegado de Cuadrilla*, *Verificador*, *Brigadista*).
     - **Especialidad Técnica:** Seleccione la cualificación técnica del funcionario (ej. *Motosierrista*, *Conductor 4x4*, *Electricista*, *Evaluador EDAN*).

### Paso 3: Guardado y Persistencia Reactiva
1. Una vez revisados los antecedentes, presione el botón primario institucional **"Guardar Cambios"** (color Menta institucional).
2. Durante el procesamiento, el botón exhibirá un estado de carga animado (*"Guardando..."*) y deshabilitará temporalmente los campos para evitar envíos duplicados.
3. Si la operación es exitosa:
   - El sistema emitirá una notificación visual verde tipo **Toast**:  
     *«Funcionario [Nombre Apellido] actualizado exitosamente.»*
   - La tabla permanente de empleados a la izquierda refrescará sus valores de inmediato sin requerir recargar la página completa (`window.location.reload()`).
   - El panel lateral actualizará los valores en memoria para seguir auditando al empleado o presionar **"Cerrar"**.

---

## 4. Acciones Complementarias desde el Panel de Edición

### Derivación a Baja Lógica (HU-13)
En la parte inferior de la ficha de modificación, junto a las acciones principales, se encuentra disponible el botón secundario destructivo **"Dar de baja empleado"**:
- Si el Administrador decide que el empleado ya no debe pertenecer a la dotación activa, al presionar este botón el sistema transiciona directamente al diálogo modal de confirmación de **Baja Lógica (H13)**.
- Si el empleado ya se encuentra inactivo, este botón se mantendrá automáticamente deshabilitado.

### Descarte de Cambios
- Para cancelar la edición y revertir los cambios no guardados, haga clic en el botón plano **"Cancelar"** o en la **"×"** superior del panel lateral.
- En dispositivos móviles o pantallas compactas, presionar la tecla `Escape` cerrará la ficha sobrepuesta.

---

## 5. Casos Especiales y Manejo de Errores

| Código / Escenario | Causa Común | Comportamiento del Sistema |
|---|---|---|
| **Formato de correo inválido** | Omisión de `@` o dominio incompleto | Bloqueo preventivo en cliente y mensaje de error en línea. |
| **Teléfono inválido** | Menos de 8 dígitos o caracteres no numéricos | Advertencia en línea impidiendo el guardado. |
| **HTTP 403 Forbidden** | Usuario en sesión sin permiso `personal:gestionar` | Notificación de alerta y bloqueo de la petición por control RBAC. |
| **HTTP 404 Not Found** | Empleado eliminado en base de datos concurrentemente | Alerta de error: *"El funcionario solicitado no existe o ya no está disponible"*. |
| **Conflicto de correo duplicado** | Se asigna un correo ya utilizado por otro usuario | La API responde con `409 Conflict` y la interfaz despliega el motivo específico. |

---

## 6. Relación con Otros Módulos del Sistema SGRAI

- **`H10` (Registro de Nuevo Funcionario):** Provee el alta inicial de los datos que posteriormente son administrados en esta vista.
- **`H13` (Baja Lógica de Empleados):** Módulo complementario accesible directamente desde el pie de este formulario para inhabilitar al personal disponible.
- **`sgrai-api`:** Consume el endpoint `PUT /api/personal/{id}` transmitiendo la cabecera `X-User-Id` o token JWT de autorización.
- **`sgrai-pwa`:** Si se edita la delegación o especialidad de un delegado de cuadrilla o patrullero, su aplicación móvil de terreno sincronizará su nueva jurisdicción en el siguiente inicio de turno.
