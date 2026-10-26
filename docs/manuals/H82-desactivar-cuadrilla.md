# Manual de Usuario: Desactivación de Cuadrilla Operativa (HU-82)

**Código Historia de Usuario:** HU-82  
**Módulo:** Administración / Cuadrillas Operativas  
**Roles Destinatarios:** Administrador Municipal  
**Permiso RBAC Requerido:** `cuadrillas:eliminar` o rol institucional `Administrador`  
**Ruta del Módulo:** `/gestion/admin/cuadrillas`  
**Versión:** 1.0.0 (SGRAI v0.8.0)  

---

## 1. Objetivo de la Funcionalidad

Permitir al **Administrador Municipal** retirar de servicio activo y dar de baja lógica una cuadrilla operativa que haya sido disuelta o retirada de faenas, evitando que sea asignada por el Encargado de Operaciones a nuevos incidentes, al tiempo que se libera inmediatamente su dotación de trabajadores y recursos logísticos hacia el inventario central y se preserva intacto el historial de atenciones, atestados e informes técnicos en los que participó.

---

## 2. Control de Acceso y Reglas Críticas de Negocio

1. **Permisos RBAC:**  
   La acción de desactivación está restringida exclusivamente a usuarios con el permiso `cuadrillas:eliminar` o que cuenten con el rol de **Administrador**. Para otros perfiles (Encargado, Supervisor, Brigadistas), la acción de baja no está disponible.
2. **Bloqueo Operativo por Misiones Activas (`409 Conflict`):**  
   Conforme a la regla de integridad de mando ICS, **ninguna cuadrilla puede ser desactivada o disuelta si posee misiones en estado `PLANIFICADA`, `DESPACHADA` o `EN_CURSO`**, o si se encuentra en terreno activo (`EN_MISION`, `EN_TRANSITO` o `EN_OPERACION`).
   * En la tabla de gestión y en el panel lateral, el botón **"Desactivar"** se presenta deshabilitado con un tooltip de seguridad:  
     *«No es posible desactivar una cuadrilla con misiones en curso o desplegada en terreno»*.
   * Si se abre el modal de confirmación mientras la cuadrilla tiene misiones pendientes, el sistema despliega un banner de advertencia ámbar y bloquea el botón de confirmación.
3. **Baja Lógica y Liberación Inmediata de Dotación:**  
   La baja es estrictamente lógica (`activo = false`, `estado = "NO_DISPONIBLE"`):
   * Los vehículos, maquinarias y herramientas asignados se desvinculan y retornan al stock disponible del inventario central.
   * Los trabajadores operativos desvinculados regresan a la nómina de personal disponible para nuevas asignaciones.
   * Si el delegado a cargo no lidera otra cuadrilla activa, su rol institucional en el sistema revierte automáticamente a `BRIGADISTA`.
   * Ningún registro de misiones pasadas, reportes de SENAPRED ni auditoría es eliminado.

---

## 3. Flujo Paso a Paso para Desactivar una Cuadrilla

### Paso 1: Ingreso a la Bandeja de Cuadrillas
1. Inicie sesión en la plataforma SGRAI con una cuenta que disponga del perfil **Administrador**.
2. En la barra lateral (`AppSidebar`), bajo el bloque **Administración**, seleccione **"Cuadrillas"** (o ingrese a `/gestion/admin/cuadrillas`).
3. Por defecto, la tabla cargará únicamente las cuadrillas con vigencia activa (`DISPONIBLE` y `EN MISIÓN`).

---

### Paso 2: Ubicación de la Cuadrilla y Acceso a la Acción
Existen dos alternativas para accionar la desactivación:
* **Opción A (Desde la Tabla):**  
  En la columna **Acciones** de la cuadrilla deseada, haga clic sobre el botón destructivo **"Desactivar"** (ícono de papelera).
* **Opción B (Desde el Drawer de Detalle):**  
  Haga clic en el botón **"Detalle"** de la fila. Una vez abierto el panel lateral derecho con la dotación completa de la cuadrilla, descienda hasta el pie del panel y presione el botón **"Desactivar Cuadrilla"**.

> [!NOTE]
> Si la cuadrilla está desplegada en terreno (`EN_MISION`), el botón se encontrará deshabilitado.

---

### Paso 3: Confirmación en el Modal de Advertencia
El sistema desplegará el modal institucional **"Confirmar Desactivación de Cuadrilla"**:
1. El modal detallará el nombre de la unidad y su delegación municipal base.
2. Se desplegará el desglose exacto de recursos y trabajadores que serán desvinculados hacia el inventario central.
3. Para ratificar la baja, haga clic en el botón rojo **"Sí, desactivar cuadrilla"**.  
   Para descartar la operación sin realizar cambios, presione **"Cancelar"**.

---

### Paso 4: Notificación y Actualización Reactiva
1. Tras confirmar la operación, el sistema emitirá una notificación flotante verde (Toast):  
   *«La cuadrilla "[Nombre]" ha sido desactivada exitosamente. Se desvincularon N recursos y M trabajadores.»*
2. La cuadrilla desaparecerá automáticamente de la vista activa sin necesidad de recargar la página.
3. Gracias a la integración con WebSockets (`cuadrilla:desactivada`), las sesiones abiertas de los demás administradores y encargados de operaciones actualizarán sus tableros en tiempo real.

---

### Paso 5: Consulta Histórica de Cuadrillas Desactivadas
Si en el futuro requiere auditar o revisar una cuadrilla que fue dada de baja:
1. En la barra de filtros superior, ubique el selector desplegable **"Estado"**.
2. Seleccione la opción **"Inactivas (Dadas de baja)"** o **"Todas las cuadrillas"**.
3. La tabla listará las unidades disueltas con el badge gris **NO DISPONIBLE / INACTIVA** y las acciones de edición o desactivación quedarán debidamente ocultas.

---

## 4. Casos Especiales y Mensajes de Error

| Situación / Error | Código HTTP | Mensaje en Pantalla / Causa | Acción Recomendada |
|---|---|---|---|
| **Misión Activa en Terreno** | `409 Conflict` | *«No es posible desactivar la cuadrilla porque posee misiones activas en curso (PLANIFICADA, DESPACHADA o EN_CURSO)»* | Solicite al Encargado de Operaciones o a la Central finalizar, cancelar o reasignar la misión en curso antes de proceder con la disolución. |
| **Permisos Insuficientes** | `403 Forbidden` | *«No tiene permisos suficientes para desactivar cuadrillas operativas»* | Verifique que su cuenta posea el permiso `cuadrillas:eliminar` o rol Administrador en el módulo de Roles y Permisos. |
| **Cuadrilla Inexistente o Baja Concurrente** | `404 Not Found` | *«La cuadrilla operativa especificada no existe o ya fue desactivada»* | Otro administrador dio de baja la cuadrilla simultáneamente; actualice la lista de cuadrillas. |

---

## 5. Relación con los demás Repositorios (`sgrai-api` y `sgrai-pwa`)

* **`sgrai-api` (Backend):**  
  Procesa la petición `DELETE /api/cuadrillas/{id}`, valida la ausencia de misiones en curso, aplica la transacción de soft delete, actualiza las tablas `cuadrilla_recurso` y `cuadrilla_personal` estampando fecha de desvinculación, y emite el evento WebSocket `cuadrilla:desactivada`.
* **`sgrai-pwa` (Móvil / Terreno):**  
  Al desactivarse la cuadrilla, si el delegado o los brigadistas inician sesión en la PWA móvil de terreno, ya no tendrán asignada una unidad operativa activa ni misiones pendientes para despacho hasta que sean asignados a una nueva dotación.
