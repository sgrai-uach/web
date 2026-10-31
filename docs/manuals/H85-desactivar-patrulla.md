# Manual de Usuario — H85: Desactivar Patrulla Verificadora (Baja Lógica y Liberación de Recursos)

> **Módulo:** Administración y Operaciones — Patrullas Verificadoras  
> **Historia de Usuario:** HU-85 / H85 — Desactivar Patrulla Verificadora  
> **Rol Destinatario:** Administrador Municipal  
> **Sistema:** SGRAI — Dirección de Gestión de Riesgos de Desastres, Municipalidad de Valdivia  
> **Ruta del Módulo:** `/gestion/admin/patrullas`

---

## 1. Información General

- **Código de Historia de Usuario:** HU-85 (Backlog SGRAI).
- **Rol Destinatario:** Administrador Municipal (o usuarios con permiso `recursos:eliminar`).
- **Objetivo:** Permitir al Administrador dar de baja lógica una patrulla verificadora que ya no prestará servicios, impidiendo de forma definitiva su selección en nuevos despachos operativos, a la vez que se liberan de inmediato su vehículo institucional y funcionarios asignados a disponibilidad en el inventario comunal, garantizando la auditoría inmutable de los reportes técnicos en los que actuó para informes y fiscalizaciones de SENAPRED.

---

## 2. Acceso y Control de Seguridad (RBAC)

1. **Protección de Permisos:** La funcionalidad de desactivación de patrullas está restringida exclusivamente a usuarios autenticados con rol de **Administrador** o con el permiso `recursos:eliminar`.
2. **Ocultamiento por Perfil:** Para roles sin privilegios administrativos (tales como *Call Center*, *Encargado de Operaciones* o *Supervisor Estratégico*), los botones de acción "Desactivar" se mantienen ocultos tanto en la tarjeta de la patrulla como en el drawer de ficha técnica.
3. **Cabecera de Autenticación:** Toda petición destructiva envía la cabecera `Authorization: Bearer <token>` y `x-user-id: <UUID>` del usuario activo.
4. **Respuesta ante Privilegios Insuficientes:** Si un usuario no autorizado intenta emitir una solicitud de baja, la API responde con código `403 Forbidden` y el sistema despliega un aviso de acceso denegado.

---

## 3. Puntos de Acceso en la Interfaz

El Administrador dispone de dos puntos de acceso dentro del panel de administración (`/gestion/admin/patrullas`):

1. **Desde la Tarjeta de Patrulla (`PatrullaCard`):**
   - En la fila de acciones al pie de la tarjeta de la patrulla, presione el botón destructivo **"Desactivar"** (identificado con el ícono de papelera roja).
2. **Desde la Ficha Técnica de Detalle (`PatrullaDetalleDrawer`):**
   - Presione el botón **"Ver Ficha"** en la tarjeta de la patrulla.
   - En el pie del panel lateral desplegable, presione el botón rojo **"Desactivar Patrulla"**.

---

## 4. Flujo Paso a Paso de Desactivación

### Paso 1: Apertura del Modal de Confirmación
Al presionar el botón de desactivación, el sistema despliega el modal interactivo de confirmación con cabecera institucional en verde azulado oscuro (`--color-primary-teal-dark`).

En esta ventana se exhibe de forma clara:
- **Advertencia de Baja Lógica:** Explicación de que la unidad pasará a estado no disponible y no podrá recibir nuevos despachos.
- **Ficha Resumen:** Nombre de la patrulla, código identificador, delegación territorial y funcionario líder.
- **Liberación Inmediata de Recursos:** Detalle específico del vehículo institucional (marca, modelo y patente) y cantidad de funcionarios que retornarán a disponibilidad en el inventario comunal.
- **Auditoría Inmutable:** Nota explícita informando que los informes y reportes técnicos emitidos previamente por la unidad se preservan inalterables para SENAPRED.

### Paso 2: Validación y Confirmación Definitiva
- Si el Administrador decide suspender la acción, puede presionar el botón **"Cancelar"** o pulsar la tecla `Escape`, cerrando el diálogo sin alterar la base de datos municipal.
- Para proceder con la baja lógica, presione el botón rojo **"Sí, Desactivar Patrulla"**. Durante la ejecución de la petición `DELETE /api/patrullas/{id}`, los botones quedan deshabilitados y el botón primario muestra un spinner de carga animado (*"Desactivando..."*).

### Paso 3: Confirmación Reactiva y Sincronización en Tiempo Real
- Al completarse exitosamente la baja en la base de datos PostgreSQL, el modal se cierra automáticamente.
- El sistema muestra una notificación verde (*Toast de Éxito*): *"Patrulla '[Nombre]' desactivada exitosamente."*
- La patrulla se retira inmediatamente del tablero activo de patrullas y se actualizan en tiempo real los contadores del banner de dotación municipal vía WebSockets (`patrulla:desactivada`).
- Si la ficha técnica de la patrulla estaba abierta en el panel lateral, esta se cierra automáticamente.

---

## 5. Reglas de Negocio, Bloqueo Operativo y Manejo de Errores

| Escenario / Error | Código HTTP | Comportamiento del Sistema | Acción Requerida por el Usuario |
|---|---|---|---|
| **Patrulla en Verificación o Misión Activa** | `409 Conflict` | La interfaz deshabilita preventivamente el botón de desactivación mostrando un tooltip y un bloque de alerta naranja en el modal. Si por concurrencia se envía la petición, la API rechaza con `409 Conflict` y el modal muestra el mensaje exacto. | El Encargado debe finalizar o reasignar la misión en el Centro de Mando antes de dar de baja la unidad. |
| **Permisos Insuficientes** | `403 Forbidden` | La API rechaza la solicitud y el modal despliega un aviso de error: *"No cuenta con el permiso requerido (recursos:eliminar) para desactivar patrullas verificadoras."* | Contactar al Administrador General para solicitar la asignación de permisos. |
| **Patrulla Inexistente o Ya Desactivada** | `404 Not Found` | El sistema informa que la patrulla ya no existe o fue dada de baja con anterioridad, cerrando el diálogo y refrescando la grilla. | Refrescar la página para sincronizar el estado. |
| **Pérdida de Conexión de Red** | Error `500` / Red | El modal muestra una alerta roja: *"Error de conexión con el servidor municipal al desactivar la patrulla."* Manteniendo el diálogo abierto sin perder el contexto. | Verificar la conexión de red municipal y reintentar. |

---

## 6. Relación con Otros Repositorios

- **`sgrai-api`:** Consume el endpoint seguro `DELETE /api/patrullas/:id`. La API aplica la baja lógica (`activo = false`, `estado = 'NO_DISPONIBLE'`, `eliminado_en = CURRENT_TIMESTAMP`), libera el vehículo (`recurso.estado = 'DISPONIBLE'`) y a los funcionarios de terreno (`personal.estado_operativo = 'disponible'`), emitiendo los eventos WebSocket `patrulla:desactivada`, `patrulla:actualizada` y `recurso:actualizado`.
- **`sgrai-pwa`:** Al desactivarse una patrulla, los dispositivos móviles en terreno vinculados a dicha unidad reciben la notificación de cese de operaciones y cierran las sesiones activas de verificación.
