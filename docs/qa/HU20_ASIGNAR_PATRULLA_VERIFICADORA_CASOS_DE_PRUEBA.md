# Casos de Prueba — HU-20: Asignar Patrulla Verificadora a Incidente (Despacho Escalonado)

> **Historia de Usuario:** HU-20 / H20  
> **Módulo:** Centro de Mando — Despacho Operativo e Incidentes  
> **Rol:** Encargado de Centro de Mando / Operaciones  
> **Sistema:** SGRAI — Municipalidad de Valdivia  

---

## Matriz de Casos de Prueba (QA)

| ID Caso | Descripción del Caso | Precondición | Pasos de Ejecución | Resultado Esperado | Estado |
|---|---|---|---|---|---|
| **CP-H20-01** | Visibilidad del botón 'Asignar Patrulla' para incidentes en estado `REPORTADO` | Incidente existente con estado `REPORTADO` | 1. Ingresar al Centro de Mando.<br>2. Abrir el drawer del incidente en la columna "Pendiente / Reportado". | Se visualiza el botón primario "Asignar Patrulla" en la cabecera y en la sección de Misiones. | **Aprobado** |
| **CP-H20-02** | Ocultamiento del botón 'Asignar Patrulla' en estados posteriores | Incidente en estado `VERIFICANDO`, `EN_ATENCION` o `RESUELTO` | 1. Abrir el drawer de un incidente que ya no esté en `REPORTADO`. | El botón de asignación no se muestra, impidiendo dobles despachos. | **Aprobado** |
| **CP-H20-03** | Filtrado estricto de patrullas disponibles en el selector | Base de datos con patrullas en estados `DISPONIBLE`, `EN_VERIFICACION` y `NO_DISPONIBLE` | 1. Presionar "Asignar Patrulla" en el drawer.<br>2. Desplegar el selector. | Se consulta `GET /api/patrullas?estado=DISPONIBLE`. Solo se listan unidades disponibles con su delegación y líder. | **Aprobado** |
| **CP-H20-04** | Despacho exitoso y creación atómica de misión (201 Created) | Patrulla seleccionada disponible | 1. Seleccionar la patrulla.<br>2. Presionar "Confirmar y Despachar". | Se envía `POST /api/misiones`. Se muestra feedback de carga, el botón se bloquea, se emite Toast de éxito y el incidente pasa a `VERIFICANDO`. | **Aprobado** |
| **CP-H20-05** | Manejo de concurrencia optimista (`409 Conflict`) | Patrulla asignada concurrentemente por otro operador | 1. Seleccionar patrulla que acaba de ser tomada.<br>2. Presionar "Confirmar y Despachar". | La API retorna 409 Conflict. El modal muestra alerta descriptiva y recarga automáticamente la lista de patrullas disponibles. | **Aprobado** |
| **CP-H20-06** | Control de acceso RBAC ante permiso faltante (`403 Forbidden`) | Usuario sin permiso `misiones:asignar` (ej. Call Center) | 1. Intentar despachar la patrulla. | La API responde 403 Forbidden. La interfaz muestra alerta de permisos insuficientes y bloquea el reintento. | **Aprobado** |
| **CP-H20-07** | Estado sin patrullas disponibles en la comuna | Todas las patrullas en servicio o mantención | 1. Abrir modal cuando `GET /api/patrullas?estado=DISPONIBLE` retorna array vacío. | Se despliega aviso informativo institucional y el botón de despacho se deshabilita preventivamente. | **Aprobado** |
| **CP-H20-08** | Transición reactiva automática en el tablero Kanban (WebSockets) | Tablero Kanban abierto en pantalla de Centro de Mando | 1. Se completa el despacho exitoso de verificación. | El evento `incidente:actualizado` recibido vía Socket.io traslada la tarjeta a la columna "En Verificación" sin recarga manual (F5). | **Aprobado** |
