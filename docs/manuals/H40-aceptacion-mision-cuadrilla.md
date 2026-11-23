# Manual de Usuario — Seguimiento de Aceptación de Misión por Cuadrilla (HU-40)

**Rol(es) destinatario(s):** Encargado de Emergencias (Centro de Mando), Supervisor, Administrador.  
**Historias relacionadas:** HU-40 (Aceptación de asignación por Delegado de Cuadrilla), HU-21 (Despacho de cuadrilla operativa), HU-23 / HU-17 (Línea de tiempo vertical y detalle de misión) y HU-42 (Reporte de llegada a terreno).

---

## 1. Objetivo

Permitir al Encargado de Emergencias visualizar en tiempo real, sin recargar la página, el momento en que el **Delegado de Cuadrilla** confirma y acepta la asignación de una misión desde terreno, reflejando automáticamente la transición del incidente a **En Atención**, el cambio de disponibilidad de la cuadrilla a **En misión (Ocupada)** y el registro del hito en la bitácora operativa.

---

## 2. Flujo de Supervisión en el Centro de Mando

1. **Notificación en vivo (Toast):**
   - Mientras el Encargado mantiene abierto el **Centro de Mando** (`/gestion/centro-incidentes`), cuando el delegado de cuadrilla presiona **Aceptar asignación** en la PWA de terreno, se despliega una notificación emergente con el título **Asignación Aceptada por Cuadrilla** y el mensaje:
     > *"La cuadrilla ha aceptado la asignación de la misión [Código]. El equipo se encuentra Ocupado y el incidente pasa a En Atención."*
2. **Transición en el Tablero Kanban y Métricas:**
   - El incidente asociado se posiciona en la columna **En Atención** (`EN_ATENCION`) limpiando cualquier indicador de confirmación pendiente.
   - Los contadores de **Panorama del Día** y la disponibilidad de cuadrillas se actualizan en segundo plano.
3. **Actualización en el Drawer de Detalle y Listado de Misiones:**
   - En la sección **Misiones y Equipos en Terreno** del drawer lateral (`IncidenteDetalleDrawer`) y en el modal **Misiones Operativas en Terreno** (`MisionesModal`), la misión pasa a estado **En Curso** / **En Trabajos de Terreno** y la cuadrilla refleja el estado **En misión**.
4. **Registro en la Bitácora Cronológica de la Misión:**
   - Al abrir el detalle de la misión (`MisionDetalleModal`), la sección **Bitácora Cronológica de Operaciones** inserta el hito **Misión Aceptada por Unidad** con la fecha y hora formateada en **Chile Continental** (`America/Santiago`) y el nombre del delegado responsable.

---

## 3. Casos Especiales y Relación con Otros Repositorios

- **Deduplicación de alertas:** Si el backend emite tanto `mision:actualizada` como `mision:hito_registrado` para la misma aceptación, el Centro de Mando muestra un único Toast dentro de una ventana de 5 segundos.
- **Relación con `sgrai-api` y `sgrai-pwa`:**
  - El delegado de cuadrilla dispara la confirmación desde la PWA (`sgrai-pwa`) mediante `POST /api/misiones/{id}/aceptar`.
  - `sgrai-api` ejecuta la transición atómica (`mision.estado = 'EN_CURSO'`, registra el hito `MISION_ACEPTADA` en `mision_hito`, mantiene el incidente en `EN_ATENCION` y la cuadrilla en `EN_MISION`) y emite el evento WebSocket `mision:actualizada` hacia las salas `encargado`, `sala:encargados` y `supervisor`.
