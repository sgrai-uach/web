# Manual de Usuario — Seguimiento en Vivo de Llegada a Terreno (HU-42)

**Rol(es) destinatario(s):** Encargado de Emergencias (Centro de Mando), Supervisor, Administrador.  
**Historias relacionadas:** HU-42 (Reporte de llegada a terreno), HU-23 / HU-17 (Línea de tiempo vertical y detalle de misión), HU-39 (Reporte técnico de patrulla) y HU-41 (Rechazo motivado).

---

## 1. Objetivo

Permitir al Encargado de Emergencias visualizar en tiempo real, sin recargar la página, el momento exacto en que una cuadrilla operativa arriba al lugar de la emergencia, junto con sus coordenadas geográficas, el responsable del reporte y la transición automática del estado de la misión a **En Trabajos de Terreno**.

---

## 2. Flujo de Supervisión en el Centro de Mando

1. **Notificación en vivo (Toast):**
   - Mientras el Encargado mantiene abierta la vista del **Centro de Mando** (`/mando`), cuando el delegado de cuadrilla presiona **Llegada a Terreno** en la PWA de terreno, se despliega una notificación emergente con el mensaje:
     > *"La cuadrilla ha reportado su llegada a terreno para la misión [Código]."*
2. **Actualización automática del listado de misiones:**
   - En el modal **Misiones Operativas en Terreno** (`MisionesModal`), la fila correspondiente actualiza su badge de estado de **Despachada** a **En Trabajos de Terreno** en tiempo real.
3. **Línea de Tiempo Vertical en el Detalle de Misión:**
   - Al abrir el detalle de la misión (`MisionDetalleModal`), la sección **Bitácora Cronológica de Operaciones** inserta de forma inmediata el hito **Llegada a Terreno** con:
     - Ícono distintivo de arribo a terreno.
     - Fecha y hora exacta formateada en **Chile Continental** (`America/Santiago`).
     - Nombre del delegado o responsable que registró el arribo.
     - Coordenadas geográficas capturadas `(latitud, longitud)` y el botón **Ubicar en mapa** para centrar la vista cartográfica del Centro de Mando.

---

## 3. Casos Especiales y Relación con Otros Repositorios

- **Sin recarga manual:** Si el Encargado ya tenía abierto el modal de detalle de la misión al momento del arribo, el hito y el cambio de estado se reflejan automáticamente mediante Socket.io (`mision:hito_registrado` y `mision:actualizada`).
- **Relación con `sgrai-api` y `sgrai-pwa`:**
  - El delegado de cuadrilla dispara el evento desde la PWA (`web-app`) mediante `POST /api/misiones/{id}/llegada` (ver manual de terreno en `sgrai-pwa`).
  - `sgrai-api` registra el hito `LLEGADA_TERRENO` en `mision_hito`, actualiza la telemetría de la cuadrilla y emite los eventos WebSocket hacia las salas del Centro de Mando.
  - Si una unidad rechaza la misión previamente (HU-41), la bitácora y la cabecera reflejarán el estado **Rechazada** y el motivo indicado; si una patrulla finaliza la verificación (HU-39), la misión pasará a **Completada**.
