# Manual de Usuario: Editar Evento de Prevención Activo (H77)

- **Código de Historia:** H77
- **Rol Destinatario:** Encargado de Gestión del Riesgo de Desastres y Operaciones (Centro de Mando)
- **Permisos RBAC Requeridos:** `prevencion:eventos:crear` (asignado a roles *Encargado* y *Administrador*)
- **Ruta del Módulo:** `/gestion/centro-incidentes?tab=prevencion`
- **Versión:** 1.0.0 (SGRAI v0.10.0)

---

## 1. Objetivo de la Funcionalidad

Permitir al Encargado de Operaciones ajustar en tiempo real la planificación de un evento preventivo activo (`PLANIFICADA` o `EN_CURSO`) ante alertas meteorológicas inminentes o cambios en la prioridad territorial: actualizando su nombre, prioridad operativa, descripción de tareas de mitigación, fecha estimada de finalización y dotación de recursos materiales vinculados.

---

## 2. Pasos para Editar un Evento Preventivo

1. **Acceder al listado de Eventos Preventivos:**
   - Ingrese al **Centro de Incidentes** (`/gestion/centro-incidentes`) y seleccione la pestaña **"Eventos Preventivos"**.
2. **Abrir el panel lateral de detalle (Drawer):**
   - Haga clic sobre la fila del evento preventivo activo (`PLANIFICADA` o `EN_CURSO`) o presione el botón **"Detalle"**.
3. **Abrir el formulario de edición:**
   - En la parte superior del panel lateral, presione el botón **"Editar Preventivo"** (disponible únicamente si cuenta con el permiso `prevencion:eventos:crear` y el evento no se encuentra `COMPLETADA` ni `CANCELADA`).
4. **Modificar los campos requeridos:**
   - **Nombre del Evento Preventivo:** Entre 3 y 150 caracteres.
   - **Prioridad Operativa:** `Baja`, `Media`, `Alta` o `Crítica`.
   - **Descripción de Tareas Planificadas:** Entre 5 y 1000 caracteres con las instrucciones de mitigación actualizadas.
   - **Fecha Estimada de Finalización:** Seleccione fecha y hora en el selector, o presione **"Limpiar"** para dejarla sin fecha estimada.
   - **Recursos Materiales Vinculados:** Agregue nuevos insumos con **"Agregar Recurso"**, ajuste cantidades (`>= 1`) o elimine materiales asignados con el ícono de basurero.
5. **Guardar cambios:**
   - Presione **"Guardar Cambios"**. El sistema validará los datos, actualizará la auditoría (`actualizado_en` y `actualizado_por_id`), recalculará el inventario en bodega y sincronizará la vista en tiempo real mediante Socket.io (`prevencion:actualizada`).

---

## 3. Casos Especiales y Mensajes de Error

| Situación / Código | Mensaje o Comportamiento Esperado | Acción Recomendada |
|---|---|---|
| **Evento en estado `COMPLETADA` o `CANCELADA`** | El botón **"Editar Preventivo"** no se muestra en el detalle. Si ocurre un cambio concurrente de estado, el modal muestra `409 Conflict` sin cerrarse. | Cierre el modal y verifique el estado actual del evento en el listado. |
| **Stock insuficiente en bodega (`409 Conflict`)** | El modal permanece abierto y muestra una alerta roja indicando qué recurso excede el stock disponible. | Reduzca la cantidad solicitada o seleccione otro recurso disponible antes de reintentar. |
| **Sin cambios realizados** | El formulario indica *"Debe modificar al menos un campo antes de guardar los cambios"*. | Modifique al menos un campo o presione **"Cancelar"**. |
| **Sin permiso `prevencion:eventos:crear` (`403 Forbidden`)** | La opción de edición no se habilita en la interfaz. | Solicite al Administrador la asignación del permiso correspondiente. |

---

## 4. Relación con `sgrai-api` y `sgrai-pwa`

* **`sgrai-api`:** El envío del formulario consume `PATCH /api/eventos-atp/prevencion/{id}`, ajusta automáticamente el delta de stock en bodega, registra auditoría (`actualizado_en`, `actualizado_por_id`) y emite el evento WebSocket `prevencion:actualizada`.
* **`sgrai-pwa`:** Las patrullas o cuadrillas asignadas al evento preventivo reciben la información actualizada en terreno mediante la sincronización en tiempo real de la misión vinculada.
