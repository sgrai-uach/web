# Manual de Usuario: H44 — Recepción y Gestión de Solicitudes de Apoyo Adicional en Terreno

**Código Historia de Usuario:** HU-44  
**Roles destinatarios:** Encargado de Operaciones (Centro de Mando), Supervisor Estratégico y Administrador Municipal.  
**Ruta del módulo:** `/gestion/centro-incidentes` (también accesible vía `/centro-incidentes` o `/mando`).

---

## 1. Objetivo de la Funcionalidad

Alertar de forma inmediata y prioritaria al **Centro de Mando** cuando un **Delegado de Cuadrilla** solicita refuerzos materiales o humanos desde terreno sin interrumpir la faena en curso, mostrando tanto en el **Tablero Kanban** como en el **Drawer del Incidente** y el **Detalle de Misión** el requerimiento específico (`detalle_apoyo_requerido`) para agilizar la gestión logística.

---

## 2. Recepción de Alerta Prioritaria en Tiempo Real

Cuando el Delegado de Cuadrilla marca la casilla **"Requiere apoyo adicional"** (y opcionalmente **"Requiere cuadrilla adicional"**) e ingresa el detalle del refuerzo en `sgrai-pwa`, `sgrai-api` emite el evento WebSocket `mision:apoyo_solicitado` hacia las salas del Centro de Mando (`encargado` / `sala:encargados`). En `sgrai-web` ocurre lo siguiente de forma automática:

1. **Notificación Prioritaria (Toast) con Destacado Escalonado:**
   - Si se marcó **"Requiere cuadrilla adicional"** (`requiereCuadrillaAdicional: true`), aparece una alerta en **rojo prioritario** con el título **"Cuadrilla Adicional Solicitada en Terreno"**.
   - Si solo se marcó apoyo adicional sin requerir nueva cuadrilla (`requiereCuadrillaAdicional: false`), aparece una alerta en **ámbar** con el título **"Apoyo Adicional Solicitado en Terreno"**.
   - Ambas muestran código del incidente/misión, nombre de la cuadrilla, evaluador y el texto completo del requerimiento, con acceso directo **"Ver incidente"** / **"Ver misión"**.
2. **Banner Superior Descartable en el Tablero:**
   - En la parte superior del Centro de Incidentes se mantiene visible un aviso prioritario (`Cuadrilla Adicional Solicitada` en rojo o `Apoyo Adicional Solicitado` en ámbar) con acceso directo **"Revisar incidente"**, el cual se limpia automáticamente si se despacha una nueva cuadrilla al incidente.

---

## 3. Identificación en el Tablero Kanban, Drawer, Despacho de Cuadrilla y Detalle de Misión

### Paso 1: Identificar la tarjeta en el Tablero Kanban
- La tarjeta del incidente (`IncidenteCard`) exhibe un borde izquierdo rojo y el badge **"Cuadrilla adicional solicitada"** cuando `requiereCuadrillaAdicional` es verdadero, o borde ámbar cuando solo se solicita apoyo logístico/material sin cuadrilla adicional.
- En la columna **En Atención** (`EN_ATENCION`), los incidentes con `requiereCuadrillaAdicional` se ordenan primero en la parte superior, seguidos por los de apoyo simple y luego el resto.

### Paso 2: Revisar el detalle completo y despachar refuerzos desde el Drawer
1. Haz clic sobre la tarjeta del incidente (o en **"Ver incidente"** desde la alerta).
2. En la zona superior del Drawer se muestra el banner de apoyo (rojo o ámbar) con el texto íntegro del requerimiento.
3. En la barra **"Intervención Táctica Operativa"**, el botón **"Despachar Cuadrilla"** permanece siempre habilitado mientras el incidente esté en estado `EN_ATENCION` (tanto con cuadrilla activa en terreno como tras cierre de faenas H68), destacando en **rojo destructivo + badge "Cuadrilla adicional solicitada"** cuando se pidió otra cuadrilla, o en **ámbar** cuando es apoyo general.
4. Al abrir **"Despachar Cuadrilla Operativa"**, puedes revisar las cuadrillas actualmente desplegadas, la dotación actual de recursos de la cuadrilla disponible elegida y añadir opcionalmente **recursos adicionales del inventario** (vehículos, maquinaria o insumos con stock disponible), los cuales quedan vinculados de forma permanente a la dotación activa de esa cuadrilla hasta edición posterior.
5. Una vez despachada la nueva cuadrilla con su misión distinta (ej. *"Apoyo táctico - INC-..."*), los destacados activos de apoyo del incidente se apagan automáticamente, conservando el reporte en el historial de la misión (y reactivándose si esa nueva misión es rechazada).

### Paso 3: Auditar el reporte e hito en el Detalle de Misión
1. Dentro del Drawer, presiona **"Ver Detalles"** sobre la misión de la cuadrilla.
2. En **Bitácora Cronológica de Operaciones** figura el hito **"Apoyo Adicional Solicitado"** (`APOYO_SOLICITADO`) marcado con ícono de alerta y su marca horaria.
3. En **Informes Técnicos y Reportes de Terreno**, el reporte correspondiente incluye el chip **"Apoyo Solicitado"** (y **"Cuadrilla adicional solicitada"** si aplica) junto al bloque **"Detalle de Apoyo Requerido"** con la descripción completa.

---

## 4. Casos Especiales

| Situación | Comportamiento del sistema | Acción recomendada |
|---|---|---|
| **El Encargado ya tenía abierto el Drawer o Modal de Misión** | Ambos componentes escuchan `mision:apoyo_solicitado` en vivo y recargan silenciosamente los datos sin cerrar la ventana. | Revisar el requerimiento y coordinar el despacho de recursos o cuadrilla de refuerzo. |
| **Recepción simultánea en múltiples salas WebSocket** | El sistema deduplica eventos por `reporteId` y marca temporal para evitar toasts o banners repetidos. | Atender el único aviso mostrado en pantalla. |
| **Incidente cargado al refrescar o paginar** | El backend entrega `apoyoSolicitado` y `detalleApoyoRequerido` en `GET /api/incidentes` y `GET /api/incidentes/{id}`. | El badge y banner permanecen visibles mientras el apoyo siga marcado como solicitado. |

---

## 5. Relación con Otros Repositorios

- **`sgrai-pwa`:** Contiene el formulario móvil donde el **Delegado de Cuadrilla** marca **"Requiere apoyo adicional"** e ingresa obligatoriamente **"Detalle de apoyo requerido"** (mínimo 5 caracteres).
- **`sgrai-api`:** Expone `POST /api/misiones/[id]/apoyo` (permiso RBAC `reportes:crear`), persiste `requiere_apoyo_adicional` y `detalle_apoyo_requerido` en `reporte_terreno`, registra el hito `APOYO_SOLICITADO` y emite `mision:apoyo_solicitado` e `incidente:actualizado` hacia `sgrai-web`.
