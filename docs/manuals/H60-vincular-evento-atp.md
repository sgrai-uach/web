# Manual de Usuario: Vinculación de Entidades a Eventos ATP (H60)

> **Módulo:** Administración y Gestión Territorial / Eventos ATP  
> **Historia de Usuario:** H60 — Vinculación de incidentes, prevención, recuperación y asistencia social a Eventos ATP  
> **Roles Destinatarios:** Administrador y Encargado (o usuario con permiso `eventos_atp:vincular`)  
> **Sistema:** SGRAI — Dirección de Gestión de Riesgos de Desastres, Municipalidad de Valdivia  
> **Rutas del Módulo:** `/admin/eventos-atp` y `/gestion/admin/eventos-atp` (listado y detalle)

---

## 1. Objetivo de la Funcionalidad

Permitir que los equipos operativos agrupen bajo un mismo **Evento de Alerta Temprana Preventiva (ATP)** todas las entidades que se originan o se ejecutan en el contexto de un mismo fenómeno:

- **Incidentes** reportados por la ciudadanía o funcionarios.
- **Eventos de prevención** (labores preventivas con patrulla verificadora).
- **Operativos de recuperación** (fichas FIBE y familias beneficiadas).
- **Casos de asistencia social** excepcional.

La vinculación es una relación **opcional** y **reversible**: una entidad puede vincularse, reasignarse a otro Evento ATP o desvincularse sin que se elimine ningún registro.

---

## 2. Acceso y Control de Seguridad (RBAC)

1. **Permiso requerido:** `eventos_atp:vincular`.
2. **Asignación:** la migración `073_evento_atp_vinculacion.ts` crea el permiso y lo asigna a los roles **Administrador** y **Encargado**. Desde **Roles y Permisos** puede concederse a otros roles sin modificar código.
3. **Acceso denegado:** si el usuario no cuenta con el permiso, el sistema oculta los controles de vinculación y los endpoints responden `403`.

> **Nota:** la creación de Eventos ATP sigue usando el permiso `eventos_atp:crear` (H61).

---

## 3. Catálogo y Detalle de Eventos ATP

### 3.1 Listado (`/gestion/admin/eventos-atp`)

La entrada **Eventos ATP** del panel de administración abre el catálogo con:

- Filtro por **Estado** (`ACTIVO`, `FINALIZADO`, `CANCELADO`). Por defecto se muestran los activos.
- Búsqueda por **código** o **nombre**.
- Columnas: código, nombre, amenaza, nivel de alerta, estado y **cantidad de entidades vinculadas**.
- Acción **Ver detalle**.

### 3.2 Detalle (`/gestion/admin/eventos-atp/{id}`)

El detalle agrupa las entidades en cuatro secciones:

| Grupo | Entidades candidatas |
|---|---|
| Incidentes | Todos los incidentes registrados |
| Eventos de prevención | Todos los eventos de prevención |
| Operativos de recuperación | Todos los operativos de recuperación |
| Casos de asistencia social | Todos los casos sociales |

Cada sección distingue las entidades **ya vinculadas** de las disponibles y marca con `(otro evento ATP)` aquellas que pertenecen a un evento distinto.

**Selección en lote:**

1. Marque una o más entidades en cualquier grupo.
2. Pulse **Vincular seleccionados (N)** para vincularlas a este Evento ATP.
3. Pulse **Desvincular seleccionados** para quitar la relación.

El resultado informa cuántas entidades fueron reasignadas, no encontradas o no desvinculadas.

---

## 4. Vinculación desde cada módulo

### 4.1 Drawer de incidente (Centro de Mando)

En el detalle de un incidente aparece el panel **Evento ATP** con:

- Selector de Eventos ATP **activos**.
- Botón **Vincular Evento ATP** o **Reasignar Evento ATP** si ya tiene uno.
- Botón **Desvincular** cuando existe una vinculación.

### 4.2 Detalle de asistencia social

La ficha del caso de asistencia social incorpora el mismo panel, permitiendo vincular o desvincular el caso desde su ficha técnica (no en la vista previa de creación).

### 4.3 Creación de prevención y recuperación

Los formularios de **nuevo evento de prevención** y **nuevo operativo de recuperación** incluyen el selector opcional **Evento ATP**. Si se deja vacío, la entidad se crea sin vinculación.

---

## 5. Reglas de Negocio

1. Solo pueden vincularse entidades a un Evento ATP en estado **ACTIVO**. Si el evento está `FINALIZADO` o `CANCELADO`, la API responde `409`.
2. El selector solo lista Eventos ATP `ACTIVO`.
3. La **reasignación** entre eventos está permitida y se informa en la respuesta (`reasignadas`).
4. **Desvincular** significa establecer `evento_atp_id = NULL`; nunca elimina el registro.
5. Solo se desvinculan entidades que pertenecen al Evento ATP indicado; el resto se reporta en `noDesvinculadas`.
6. Los identificadores inexistentes se reportan en `noEncontradas` sin abortar la operación.
7. Cada operación emite el evento WebSocket **`evento_atp:vinculado`** a las salas `encargado`, `supervisor` y `mapa`, con la acción `VINCULADO` o `DESVINCULADO`.

---

## 6. Filtros por Evento ATP

- **Kanban de incidentes:** filtro **Evento ATP** que restringe las columnas a los incidentes vinculados al evento seleccionado.
- **Listado de asistencia social:** filtro **Evento ATP** con chip removible.
- Los filtros se envían como `eventoAtpId` a la API y se combinan con el resto de criterios.

---

## 7. Mensajes de Error Frecuentes

| Situación | Mensaje / Código |
|---|---|
| Sin sesión | `401` — Sesión no válida o no autenticada |
| Sin permiso | `403` — Se requiere el permiso `eventos_atp:vincular` |
| Evento ATP inexistente | `404` — El Evento ATP indicado no existe |
| Evento ATP no activo | `409` — El Evento ATP no está ACTIVO |
| Sin entidades seleccionadas | `400` — Debe indicar al menos una entidad |

---

## 8. Consideraciones Operativas

- La desvinculación está permitida incluso para Eventos ATP finalizados, para corregir asociaciones históricas.
- Las vistas de listado y detalle están replicadas bajo `/admin/...` y `/gestion/admin/...` para ambos paneles.
- La operación es transaccional: o se actualizan todas las entidades seleccionadas o no se aplica ningún cambio.
