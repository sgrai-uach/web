# Manual de Usuario: H44 — Recepción y Gestión de Solicitudes de Apoyo Adicional en Terreno

**Código Historia de Usuario:** HU-44  
**Roles destinatarios:** Encargado de Operaciones (Centro de Mando), Supervisor Estratégico y Administrador Municipal.  
**Ruta del módulo:** `/gestion/centro-incidentes` (también accesible vía `/centro-incidentes` o `/mando`).

---

## 1. Objetivo de la Funcionalidad

Alertar de forma inmediata y prioritaria al **Centro de Mando** cuando un **Delegado de Cuadrilla** solicita refuerzos materiales o humanos desde terreno sin interrumpir la faena en curso, mostrando tanto en el **Tablero Kanban** como en el **Drawer del Incidente** y el **Detalle de Misión** el requerimiento específico (`detalle_apoyo_requerido`) para agilizar la gestión logística.

---

## 2. Recepción de Alerta Prioritaria en Tiempo Real

Cuando el Delegado de Cuadrilla marca la casilla **"Requiere apoyo adicional"** e ingresa el detalle del refuerzo en `sgrai-pwa`, `sgrai-api` emite el evento WebSocket `mision:apoyo_solicitado` hacia las salas del Centro de Mando (`encargado` / `sala:encargados`). En `sgrai-web` ocurre lo siguiente de forma automática:

1. **Notificación Prioritaria (Toast):**
   - Aparece en pantalla una alerta destacada en rojo con el título **"Apoyo Adicional Solicitado en Terreno"**, indicando:
     - Código del incidente y/o misión asociada.
     - Nombre de la cuadrilla y del evaluador que solicitó el apoyo.
     - Texto completo del requerimiento (ej. *"Se solicita motoniveladora y cuadrilla adicional de despeje"*).
   - Incluye el botón de acción directa **"Ver incidente"** (o **"Ver misión"**) para abrir el detalle en un solo clic.
2. **Banner Superior Descartable en el Tablero:**
   - En la parte superior del Centro de Incidentes se mantiene visible un aviso prioritario (`Apoyo Adicional Solicitado`) con acceso directo **"Revisar incidente"** hasta que el Encargado cierre o descarte la notificación.

---

## 3. Identificación en el Tablero Kanban, Drawer y Detalle de Misión

### Paso 1: Identificar la tarjeta en el Tablero Kanban
- La tarjeta del incidente (`IncidenteCard`) exhibe un borde izquierdo rojo de alta prioridad, el badge destacado **"Apoyo Solicitado"** y un extracto visible con el detalle del refuerzo solicitado.
- En la columna **En Atención** (`EN_ATENCION`), los incidentes con solicitud de apoyo activa se ordenan automáticamente en la parte superior para atención inmediata.

### Paso 2: Revisar el detalle completo en el Drawer del Incidente
1. Haz clic sobre la tarjeta del incidente (o en **"Ver incidente"** desde la alerta).
2. En la zona superior del Drawer se muestra el banner **"Apoyo Adicional Solicitado en Terreno"** con el texto íntegro del requerimiento.
3. En la sección **"Último Reporte de Terreno"** se muestra el chip **"Apoyo Solicitado"** y el bloque **"Detalle de apoyo requerido"**.

### Paso 3: Auditar el reporte e hito en el Detalle de Misión
1. Dentro del Drawer, presiona **"Ver Detalles"** sobre la misión de la cuadrilla.
2. En **Bitácora Cronológica de Operaciones** figura el hito **"Apoyo Adicional Solicitado"** (`APOYO_SOLICITADO`) marcado con ícono de alerta en rojo y su marca horaria.
3. En **Informes Técnicos y Reportes de Terreno**, el reporte correspondiente incluye el chip **"Apoyo Solicitado"** y el bloque **"Detalle de Apoyo Requerido"** con la descripción completa.

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
