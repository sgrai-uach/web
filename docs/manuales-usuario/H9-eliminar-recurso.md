# Manual de Usuario — H9: Eliminar un Recurso del Sistema (Baja Lógica)

> **Módulo:** Administración y Gestión de Recursos Logísticos  
> **Historia de Usuario:** HU-9 — Eliminar un Recurso del Sistema  
> **Rol Destinatario:** Administrador Municipal  
> **Sistema:** SGRAI — Dirección de Gestión de Riesgos de Desastres, Municipalidad de Valdivia  
> **Ruta del Módulo:** `/admin/recursos`

---

## 1. Información General

- **Código de Historia de Usuario:** HU-9 (Backlog SGRAI).
- **Rol Destinatario:** Administrador Municipal.
- **Objetivo:** Permitir al Administrador dar de baja lógicamente un recurso logístico o activo municipal (vehículo, maquinaria o material), retirándolo del inventario activo y evitando asignaciones futuras en terreno, a la vez que se resguarda el historial completo de misiones, despachos e incidentes previos para informes institucionales y auditoría SENAPRED (Informe Alfa 37G).

---

## 2. Acceso y Control de Seguridad (RBAC)

1. **Protección de Permisos:** La funcionalidad de eliminación de recursos está restringida exclusivamente a usuarios autenticados con rol de **Administrador** (permiso `recursos:eliminar`).
2. **Ocultamiento por Perfil:** Para roles operativos o no administrativos (tales como *Call Center*, *Encargado* o *Supervisor*), el botón de acción "Eliminar" se mantiene completamente oculto tanto en la tabla general como en la ficha técnica de detalle.
3. **Cabecera de Autenticación:** Toda petición destructiva envía la cabecera `X-User-Id: <UUID>` del usuario activo.
4. **Respuesta ante Privilegios Insuficientes:** Si un usuario no autorizado intenta emitir una solicitud de baja, la API responde con código `403 Forbidden` y el sistema despliega la pantalla de Acceso Denegado institucional.

---

## 3. Acceso a la Acción de Eliminación

El Administrador dispone de dos puntos de acceso dentro del módulo de inventario (`/admin/recursos`):

1. **Desde la Tabla Principal de Recursos:**
   - Ubique el recurso que desea dar de baja en el listado.
   - En la columna **Acción**, presione el botón destructivo **"Eliminar"** (identificado con el ícono de basurero en rojo institucional).
2. **Desde la Ficha Técnica de Detalle:**
   - En la misma fila, haga clic en el botón **"Ver Ficha"** (o directamente sobre la fila).
   - En el pie del modal de la ficha técnica, presione el botón destructivo **"Dar de Baja Recurso"**.

---

## 4. Flujo Paso a Paso de Baja Lógica

### Paso 1: Apertura del Modal de Confirmación
Al presionar el botón de eliminación, el sistema despliega el modal interactivo de confirmación con franja de alerta en rojo municipal (`--color-danger`).

En esta ventana se exhibe:
- Denominación e identificador del recurso.
- Clasificación del activo (*Vehículo o Maquinaria* / *Material o Insumo*).
- Cantidades registradas (Inventario total, disponibles y en terreno).
- Procedencia territorial (Delegación asignada o Reserva Central).
- Mensaje de advertencia institucional sobre el alcance de la baja.

### Paso 2: Validación y Confirmación Definitiva
- Si el Administrador decide no continuar, puede presionar el botón **"Cancelar"** o la tecla `Escape`, cerrando el diálogo sin alterar la base de datos.
- Para proceder con la baja, presione **"Sí, Dar de Baja Recurso"**. Durante la ejecución de la petición `DELETE /api/recursos/{id}`, ambos botones quedan deshabilitados y el botón primario muestra un indicador de carga animado (*spinner*).

### Paso 3: Confirmación y Actualización Reactiva
- Al completarse exitosamente la baja en la base de datos PostgreSQL, el modal se cierra automáticamente.
- El sistema muestra una notificación visual verde (*Toast de Éxito*): *"El recurso '[Nombre]' ha sido dado de baja exitosamente del inventario activo."*
- El recurso se retira inmediatamente de la tabla sin requerir recargar la página (`window.location.reload()`), recalculando el número total de registros disponibles.

---

## 5. Casos Especiales y Manejo de Errores

### 5.1. Conflicto Operativo: Recurso en Uso en Terreno (`409 Conflict`)
- **Regla de Negocio:** Si el recurso tiene unidades desplegadas en terreno (`cantidadEnUso > 0`) o está asignado activamente a una cuadrilla o misión en curso, el sistema **impide su eliminación**.
- **Comportamiento en Pantalla:**
  - El modal de confirmación **permanece abierto** y resalta una caja de advertencia en rojo/amarillo indicando el bloqueo operativo.
  - Se visualiza el mensaje explicativo retornado por el backend (ejemplo: *"El recurso tiene X unidades actualmente en uso en terreno y no puede ser dado de baja"*).
  - El botón destructivo se oculta y se habilita el botón **"Entendido / Cerrar"** para facilitar el retorno del usuario.

### 5.2. Recurso Ya Inactivo o No Encontrado (`404 Not Found`)
Si otro administrador dio de baja el recurso de manera concurrente, el sistema informa mediante una alerta descriptiva y remueve la fila desactualizada de la vista.

### 5.3. Error de Conectividad o Servidor (`500 Internal Server Error`)
El sistema exhibe un mensaje de error amigable y mantiene los datos intactos para que el Administrador pueda reintentar la operación.

---

## 6. Sincronización en Tiempo Real (Socket.io)

Cuando un Administrador da de baja un recurso:
1. El backend emite el evento global `"recurso:eliminado"`.
2. Las sesiones activas de otros Administradores, Supervisores y el Centro de Mando reciben el evento y retiran de inmediato el recurso de sus respectivas tablas y selectores de asignación, evitando que intenten despachar un recurso que acaba de ser retirado del servicio.

---

## 7. Relación con Otros Repositorios

- **`sgrai-api` (Backend):** Implementa el endpoint `DELETE /api/recursos/{id}`, valida la ausencia de dependencias activas, aplica soft-delete (`eliminado_en = CURRENT_TIMESTAMP`, `eliminado_por_id = <UUID>`) y emite el evento `"recurso:eliminado"` a través de WebSockets.
- **`sgrai-pwa` (Terreno):** Las cuadrillas y patrullas no tienen acceso a eliminar recursos; únicamente reportan el uso o devolución de los mismos, lo cual alimenta el contador `cantidadEnUso`.
