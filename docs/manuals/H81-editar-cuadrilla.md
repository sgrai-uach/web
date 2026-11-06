# Manual de Usuario: Modificación de Cuadrilla y Dotación Operativa (HU-81)

**Código Historia de Usuario:** HU-81  
**Módulo:** Administración / Cuadrillas Operativas  
**Roles Destinatarios:** Administrador Municipal, Encargado de Operaciones  
**Permiso RBAC Requerido:** `recursos:editar` o rol institucional `ADMIN` / `Administrador`  
**Ruta del Módulo:** `/gestion/admin/cuadrillas`  
**Versión:** 1.0.0 (SGRAI v0.8.0)  

---

## 1. Objetivo de la Funcionalidad

Permitir al **Administrador Municipal** y al **Encargado de Operaciones** modificar oportunamente los datos de identificación, delegación territorial base, reasignar al delegado responsable y ajustar la dotación de trabajadores operativos (`cuadrilla_personal`) y equipamiento logístico o vehículos (`cuadrilla_recurso`) que componen una cuadrilla.

Esta funcionalidad responde a contingencias habituales del servicio municipal como rotaciones de turnos, licencias médicas, traslados de equipamiento pesado o reestructuración de dotaciones para faenas de despeje y mitigación ante emergencias en la comuna de Valdivia.

---

## 2. Control de Acceso y Reglas de Integridad Operativa

1. **Permisos RBAC:** El botón y formulario de edición se encuentran restringidos a usuarios que posean el permiso institucional `recursos:editar` o formen parte del rol **Administrador**.
2. **Bloqueo Operativo por Misión Activa (`409 Conflict`):**  
   Para proteger la seguridad de las faenas y no desarmar dotaciones en pleno despliegue, **el sistema bloquea la edición si la cuadrilla se encuentra en estado `EN_MISION`** (o en sus fases operativas de terreno `EN_TRANSITO` o `EN_OPERACION`).
   * En la tabla y detalle, el botón **"Editar"** se muestra deshabilitado con un tooltip aclaratorio:  
     *"No se puede editar una cuadrilla que se encuentra actualmente en misión activa en terreno"*.
   * Si una cuadrilla es despachada mientras se mantiene el modal abierto, el intento de guardado es rechazado por la API con código `409 Conflict` y la interfaz despliega una advertencia destacada.

---

## 3. Flujo Paso a Paso de Edición de una Cuadrilla

### Paso 1: Ingreso al Listado de Cuadrillas
1. En la barra lateral (`AppSidebar`), bajo la categoría **Administración**, haga clic en **"Cuadrillas"** (o navegue a `/gestion/admin/cuadrillas`).
2. El sistema desplegará la tabla completa con el inventario de cuadrillas operativas registradas, indicando su delegación base, delegado responsable, cantidad de operarios, equipamiento asignado y su badge de estado (`DISPONIBLE`, `EN MISIÓN` o `NO DISPONIBLE`).
3. Puede utilizar la barra superior de filtros para buscar por nombre de cuadrilla, nombre o RUT del delegado, filtrar por delegación municipal o por estado operativo.

---

### Paso 2: Apertura del Modal de Edición
1. Ubique la cuadrilla a modificar (asegurándose de que su estado sea `DISPONIBLE` o `NO DISPONIBLE`).
2. En la columna **Acciones**, haga clic en el botón primario **"Editar"** (ícono de lápiz).
3. El sistema desplegará el modal institucional **"Editar Cuadrilla Operativa y Dotación"**, precargando automáticamente los valores actuales de la unidad.

---

### Paso 3: Modificación de Datos Generales y Delegación
1. **Nombre de la Cuadrilla:** Modifique el nombre formal de la unidad (mínimo 3 caracteres, obligatorio). Debe ser único en todo el sistema.
2. **Delegación Base:** Si la unidad fue trasladada a otra zona territorial, seleccione la nueva delegación (*Norte, Sur, Costa o Calle Calle*).

---

### Paso 4: Reasignación del Delegado Responsable
1. En la tarjeta destacada del delegado actual, haga clic en **"Reasignar Delegado"**.
2. Comience a escribir el nombre o RUT del nuevo brigadista responsable en el buscador interactivo.
3. Haga clic sobre el brigadista deseado en el listado desplegable. El sistema fijará al nuevo responsable.

> [!NOTE]
> **Gestión Automática de Roles en la API:** Al guardar la cuadrilla, el backend promueve automáticamente al nuevo funcionario al rol `DELEGADO_CUADRILLA` y revierte al delegado saliente a su rol de origen (`BRIGADISTA`) si no lidera otra cuadrilla activa.

---

### Paso 5: Ajuste de Trabajadores Operativos (`cuadrilla_personal`)
1. **Agregar Funcionario:** En el selector desplegable de trabajadores disponibles, elija un funcionario operativo acreditado para terreno y presione **"Añadir"**.
2. **Remover Funcionario:** En la lista de trabajadores asignados, presione el ícono de papelera roja (`Trash2`) al costado del funcionario que ya no formará parte de la unidad.

---

### Paso 6: Ajuste de Equipamiento y Vehículos (`cuadrilla_recurso`)
1. **Agregar Maquinaria o Vehículo:** Seleccione el recurso del inventario municipal.  
   * Si es un vehículo o activo individual (`esIndividual: true`), la cantidad queda fijada automáticamente en **1 unidad**.
   * Si es una herramienta o insumo fungible (ej. motosierras, motobombas), indique la cantidad deseada y presione **"Añadir"**.
2. **Modificar Cantidades:** Ajuste el número de herramientas directamente en el campo numérico de la fila.
3. **Remover Recurso:** Presione el ícono de papelera (`Trash2`) para desasignar el equipo y devolverlo a disponibilidad de inventario.

---

### Paso 7: Guardar Cambios y Confirmación
1. Presione el botón primario **"Guardar Cambios"**.
2. El sistema valida los datos y conecta con el endpoint seguro `PUT /api/cuadrillas/{id}`.
3. Tras recibir la respuesta exitosa (`200 OK`), el modal se cierra automáticamente y se emite la notificación Toast:  
   *"La cuadrilla [Nombre] ha sido actualizada exitosamente."*
4. La tabla de cuadrillas actualiza sus datos en pantalla de forma inmediata.

---

## 4. Casos Especiales y Manejo de Errores

| Código / Situación | Causa | Mensaje en Pantalla | Acción Recomendada |
|---|---|---|---|
| **409 Conflict (Misión Activa)** | La cuadrilla fue despachada a terreno mientras se editaba o tiene misiones en curso. | *"No es posible modificar los datos ni la dotación de una cuadrilla que se encuentra actualmente en misión activa en terreno."* | Espere a que la cuadrilla concluya la faena y retorne a estado `DISPONIBLE` antes de reajustar su dotación. |
| **409 Conflict (Nombre Duplicado)** | El nombre actualizado coincide con el de otra cuadrilla activa en la comuna. | *"Ya existe otra cuadrilla operativa con el nombre ingresado."* | Asigne un nombre diferenciador indicando la zona o especialidad. |
| **409 Conflict (Recurso Asignado)** | Un vehículo individual fue asignado paralelamente a otra cuadrilla. | *"El recurso individual [Nombre] ya se encuentra asignado a otra cuadrilla activa."* | Seleccione otro vehículo disponible del inventario municipal. |
| **403 Forbidden** | Usuario sin permiso `recursos:editar`. | *"No tiene permisos suficientes para modificar cuadrillas operativas."* | Inicie sesión con credenciales de Administrador o solicite la habilitación del permiso RBAC. |
| **400 Bad Request** | Nombre con menos de 3 caracteres o stock insuficiente. | Mensaje inline de validación bajo el campo respectivo. | Corrija los campos señalados antes de presionar guardar. |

---

## 5. Sincronización en Tiempo Real y Relación con Otros Repositorios

* **`sgrai-api`:** Persiste transaccionalmente la dotación en las tablas `cuadrilla`, `cuadrilla_personal` y `cuadrilla_recurso`, registra auditoría (`actualizado_en`, `actualizado_por_id`) y emite el evento WebSocket `cuadrilla:actualizada` a las salas `operaciones`, `encargado` y `supervisor`.
* **`sgrai-web`:** Escucha el evento `cuadrilla:actualizada` en tiempo real, refrescando la tabla de administración y los tableros del Centro de Mando sin recargar la página.
* **`sgrai-pwa`:** Al reasignar un delegado o ajustar la dotación, el nuevo delegado visualiza en su aplicación móvil de terreno la dotación real actualizada de trabajadores y herramientas asignadas para la ejecución de sus misiones.
