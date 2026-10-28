# Casos de Prueba — HU-85: Desactivar Patrulla Verificadora (Baja Lógica y Liberación de Recursos)

> **Historia de Usuario:** HU-85 / H85  
> **Módulo:** Administración — Patrullas Verificadoras  
> **Rol:** Administrador  
> **Sistema:** SGRAI — Municipalidad de Valdivia  

---

## Matriz de Casos de Prueba (QA)

| ID Caso | Descripción del Caso | Precondición | Pasos de Ejecución | Resultado Esperado | Estado |
|---|---|---|---|---|---|
| **CP-H85-01** | Visualización de la acción 'Desactivar Patrulla' para Administrador | Usuario con rol Administrador o permiso `recursos:eliminar` autenticado en `/gestion/admin/patrullas` | 1. Ingresar a la sección de Patrullas.<br>2. Localizar una patrulla en la grilla. | El botón "Desactivar" se visualiza en la tarjeta y en la ficha técnica (drawer). | **Aprobado** |
| **CP-H85-02** | Ocultamiento de la acción para perfiles sin privilegios | Usuario con rol Call Center o Encargado sin permiso `recursos:eliminar` | 1. Ingresar al panel de patrullas. | Los botones "Desactivar" están completamente ocultos tanto en tarjetas como en el drawer. | **Aprobado** |
| **CP-H85-03** | Apertura de modal de confirmación con detalle de recursos y auditoría | Patrulla en estado `DISPONIBLE` con vehículo y brigadistas asignados | 1. Presionar "Desactivar" en la tarjeta. | Se abre el modal institucional advirtiendo sobre la baja lógica, listando el vehículo y funcionarios que quedarán liberados, y garantizando la auditoría SENAPRED. | **Aprobado** |
| **CP-H85-04** | Bloqueo preventivo en interfaz ante estado `EN_VERIFICACION` o misiones activas | Patrulla en estado `EN_VERIFICACION` o con misión activa | 1. Observar el botón "Desactivar" en la tarjeta.<br>2. Abrir el modal. | El botón en la tarjeta está deshabilitado con tooltip reglamentario. En el modal se muestra alerta de bloqueo y el botón de confirmación permanece inhabilitado. | **Aprobado** |
| **CP-H85-05** | Confirmación exitosa de baja lógica (200 OK) y sincronización | Patrulla disponible sin misiones activas | 1. Abrir modal.<br>2. Presionar "Sí, Desactivar Patrulla". | Se envía `DELETE /api/patrullas/:id`. Se muestra indicador de carga, luego se cierra el modal, se despliega Toast de éxito y la patrulla se retira de la lista activa. | **Aprobado** |
| **CP-H85-06** | Manejo de respuesta `409 Conflict` desde la API | Patrulla que cambió a misión activa concurrentemente | 1. Enviar solicitud de desactivación. | La API responde 409 Conflict. El modal permanece abierto y exhibe un aviso de conflicto con el motivo retornado por el backend. | **Aprobado** |
| **CP-H85-07** | Cancelación del flujo con botón 'Cancelar' o tecla Escape | Modal de desactivación abierto | 1. Presionar botón "Cancelar" o presionar tecla `Escape`. | El modal se cierra sin emitir ninguna llamada DELETE y sin alterar la base de datos municipal. | **Aprobado** |
| **CP-H85-08** | Sincronización en tiempo real vía WebSockets | Cliente abierto en otra pestaña/navegador | 1. Otro usuario da de baja una patrulla. | El cliente recibe evento `patrulla:desactivada`, remueve la tarjeta y actualiza los contadores de dotación en tiempo real. | **Aprobado** |
