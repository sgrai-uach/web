# Manual de Usuario: H20 — Asignar Patrulla Verificadora a Incidente

Este manual documenta el procedimiento operativo para el despacho escalonado de **Patrullas Verificadoras** a incidentes ciudadanos en la plataforma web del Sistema de Gestión de Recursos para Atención de Incidentes (SGRAI) de la Municipalidad de Valdivia.

---

## 1. Información General

- **Rol al que está dirigido:** Encargado de Centro de Mando / Operaciones (DGRD) y Administrador Municipal.
- **Objetivo de la funcionalidad:** Desplegar de inmediato personal técnico calificado en terreno para evaluar y diagnosticar la gravedad real de un incidente reportado, antes de movilizar cuadrillas operativas, maquinarias o recursos pesados.
- **Vista de acceso:** `/gestion/centro-incidentes` (Centro de Mando).
- **Ruta de invocación:** Drawer de detalle de cualquier incidente que se encuentre en estado **`REPORTADO`**.

---

## 2. Control de Permisos y Acceso (RBAC)

La asignación y despacho de patrullas requiere autorización estricta en el sistema:

| Rol Institucional | Permiso RBAC | Capacidad de Despacho |
|---|---|---|
| **Encargado de Operaciones (DGRD)** | `misiones:asignar` | **Habilitado (201 Created)** |
| **Administrador General** | Acceso total | **Habilitado (201 Created)** |
| **Supervisor Estratégico** | Solo lectura (`misiones:leer`) | **Restringido (403 Forbidden)** |
| **Operador Call Center / Informante** | Sin permiso de despacho | **Restringido (403 Forbidden)** |

> [!NOTE]
> Si un usuario sin el permiso `misiones:asignar` intenta despachar una patrulla, el sistema denegará la acción mostrando una notificación de advertencia de permisos insuficientes.

---

## 3. Flujo Operativo Paso a Paso

### Paso 1: Localización del Incidente en el Tablero Kanban
1. Inicie sesión con su cuenta institucional con rol Encargado o Administrador.
2. Ingrese al **Centro de Mando** (`/gestion/centro-incidentes`).
3. En la columna **"Pendiente / Reportado"**, identifique la tarjeta del incidente ciudadano que requiere inspección física en terreno.
4. Haga clic sobre la tarjeta del incidente para abrir el **Drawer Lateral de Detalle**.

### Paso 2: Apertura del Modal de Asignación
1. Dentro del drawer, verifique los datos del caso (tipo de afectación, código de seguimiento, dirección y relato del informante).
2. Observe el botón destacado **`[ 🛡 Asignar Patrulla ]`** ubicado tanto en la cabecera del drawer como en la sección de *Misiones y Equipos en Terreno*.
   > [!IMPORTANT]
   > El botón de asignación únicamente se encuentra visible y habilitado si el incidente está en estado **`REPORTADO`**. Si el incidente ya fue derivado a evaluación o se encuentra en atención, el botón no se mostrará.
3. Presione el botón **"Asignar Patrulla"** o **"Despachar Patrulla Verificadora"**. Se desplegará el modal táctico de asignación rápida sin recargar la página ni perder el contexto del tablero.

### Paso 3: Selección de Patrulla Disponible
1. El modal consultará en tiempo real el catálogo de patrullas y filtrará únicamente aquellas que se encuentren en estado **`DISPONIBLE`**.
2. En el selector dropdown **"Patrulla Verificadora Disponible"**, seleccione la unidad adecuada según la cercanía geográfica o jurisdicción (por ejemplo: *Patrulla Ánimas Norte 1 — Delegación Norte*).
3. En la tarjeta de vista previa inferior, revise los datos del líder asignado y el número telefónico de contacto directo.

### Paso 4: Confirmación y Despacho
1. Haga clic en el botón principal **"Confirmar y Despachar"** (`--color-accent-mint`).
2. El sistema iniciará la transacción atómica con el servidor central:
   - Se creará la orden de misión de tipo `VERIFICACION` con código oficial (ej. `MIS-2026-8341`).
   - El estado del incidente cambiará a `VERIFICANDO`.
   - La patrulla seleccionada cambiará su estado a `EN_VERIFICACION`.
   - Se registrará el hito inicial de despacho en la bitácora de la misión.
3. Una notificación Toast municipal de color verde confirmará el éxito del despacho.
4. El drawer actualizará automáticamente la sección de misiones mostrando la patrulla asignada, y el modal se cerrará.

### Paso 5: Reactividad en Tiempo Real en el Tablero Kanban
Gracias al canal WebSocket conectado a las salas `encargado` y `mapa`:
* La tarjeta del incidente se moverá de forma automática desde la columna **"Pendiente / Reportado"** a la columna **"En Verificación"**.
* No se requiere presionar F5 ni recargar manualmente el navegador.

---

## 4. Casos Especiales y Manejo de Errores

### A. Concurrencia Simultánea (Error `409 Conflict`)
Si otro operador de turno asignó la misma patrulla milisegundos antes o si el incidente cambió de estado simultáneamente:
1. El sistema abortará la operación de forma segura para evitar inconsistencias de dotación.
2. El modal mostrará una alerta destacada de advertencia:
   > *"La patrulla seleccionada ya no se encuentra disponible. Por favor selecciona otra patrulla."*
3. La lista del selector se actualizará automáticamente en segundo plano removiendo la patrulla ocupada, permitiendo al operador elegir otra unidad disponible de inmediato sin tener que reiniciar el flujo.

### B. Sin Patrullas Disponibles en la Comuna
Si todas las patrullas municipales se encuentran atendiendo otros incidentes o en mantención:
1. El selector informará: *"Actualmente no existen patrullas verificadoras en estado DISPONIBLE"*.
2. El botón de confirmación quedará deshabilitado para prevenir despachos nulos.
3. El operador puede utilizar el botón **"Actualizar"** ubicado en el encabezado del selector para reintentar la consulta en cuanto una patrulla sea liberada en terreno.

---

## 5. Integración con otros Sistemas del Ecosistema SGRAI

* **API Central (`sgrai-api`):** Ejecuta la transacción atómica en base de datos PostgreSQL mediante Kysely y publica los eventos en Redis para emisión a Socket.io.
* **PWA de Terreno (`sgrai-pwa`):** La patrulla verificadora asignada recibe la notificación inmediata en su dispositivo móvil (`mision:asignada` en la sala `patrulla:{id}`), visualizando la dirección y la orden de operación para acudir al lugar.
