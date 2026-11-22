# Manual de Usuario: H40 — Recepción y Monitoreo de Aceptación de Asignación por Cuadrilla (Centro de Mando)

**Código Historia de Usuario:** HU-40  
**Módulo:** Centro de Mando / Gestión de Incidentes Tácticos  
**Roles Destinatarios:** Encargado de Centro de Mando / Operaciones (DGRD), Supervisor Estratégico y Administrador Municipal  
**Permiso RBAC Requerido:** `incidentes:leer`, `misiones:leer` (en web) / `misiones:terreno:ejecutar` (en móvil)  
**Ruta del Módulo:** `/gestion/centro-incidentes`  

---

## 1. Objetivo de la Funcionalidad

Notificar de manera inmediata y automática al **Centro de Mando** cuando el **Delegado de Cuadrilla** acepta formalmente la asignación de una misión desde su dispositivo móvil en terreno, confirmando que la brigada inicia el desplazamiento hacia el sitio de emergencia y asume los trabajos operativos, transicionando el incidente al estado **En Atención** sin necesidad de recargar la vista.

---

## 2. Comportamiento en Tiempo Real (WebSockets)

Cuando el **Delegado de Cuadrilla** presiona el botón **"Aceptar Asignación"** en `sgrai-pwa`, `sgrai-api` ejecuta una transacción atómica en PostgreSQL (`mision.estado = 'EN_CURSO'`, `fecha_inicio = CURRENT_TIMESTAMP`, `cuadrilla.estado = 'EN_MISION'`, `incidente.estado = 'EN_ATENCION'` y registro del hito `'Asignación Aceptada por Cuadrilla'`) y emite los eventos WebSocket `mision:actualizada`, `incidente:actualizado` y `cuadrilla:actualizada`.

La plataforma web `sgrai-web` reacciona de forma instantánea:

1. **Notificación Flotante Enriquecida (Toast Operativo):**
   - En la esquina superior derecha se muestra una notificación institucional con ícono de cuadrilla (`HardHat`) y el título **"Asignación Aceptada por Cuadrilla"**.
   - Incluye chips de código de incidente (ej. `INC-2026-0001`) y prioridad (ej. `Alta`), además del detalle estructurado con:
     - **Cuadrilla:** Nombre de la unidad operativa (ej. *Cuadrilla Vías y Canales 1*).
     - **Misión:** Código de la misión aceptada (ej. *MIS-2026-0005*).
     - **Estado Incidente:** *En Atención*.
   - Proporciona el botón directo **"Ver incidente"** para abrir inmediatamente el panel lateral del caso.
   - El sistema deduplica automáticamente los eventos de la misma aceptación para evitar notificaciones genéricas repetidas.

2. **Transición Automática en el Tablero Kanban:**
   - La tarjeta del incidente se mueve en tiempo real hacia la columna **"En Atención"** (`EN_ATENCION`), reflejando que existe una misión operativa en ejecución.
   - Se actualizan los contadores de columnas y los indicadores del bloque **"Panorama del Día"** (KPIs).

3. **Actualización de Disponibilidad de Cuadrillas:**
   - La cuadrilla queda marcada en estado **`EN_MISION`** tanto en el listado de cuadrillas como en el **Mapa Operativo**.

---

## 3. Auditoría en el Drawer de Incidente y Detalle de Misión

Si el Encargado abre el incidente mediante el botón **"Ver incidente"** del Toast (o haciendo clic en la tarjeta), o si ya tenía el panel lateral o modal abierto al momento de la aceptación:

1. **Panel Lateral del Incidente (`IncidenteDetalleDrawer`):**
   - El encabezado muestra el estado **En atención**.
   - En la sección **"Misiones y Equipos en Terreno"**, la tarjeta de la misión se actualiza a estado **En curso** y la cuadrilla asignada figura en estado **En misión**.
   - La barra de despacho de cuadrilla desaparece automáticamente al encontrarse ya una brigada en atención activa.

2. **Modal de Detalle de Misión (`MisionDetalleModal`):**
   - El chip de estado superior cambia a **En curso** y se muestra la fecha/hora de inicio registrada (`fechaInicio`).
   - En la **Bitácora Cronológica de Operaciones**, se incorpora en vivo el hito **`Misión aceptada`** (`MISION_ACEPTADA`) con la glosa **"Asignación Aceptada por Cuadrilla"** y la marca horaria oficial.

---

## 4. Flujo Operativo Paso a Paso

1. **Despacho Previo:**
   - El Encargado despacha una cuadrilla operativa disponible hacia un incidente desde el Centro de Mando (`HU-21`).
2. **Confirmación desde Terreno (`sgrai-pwa`):**
   - El Delegado de Cuadrilla revisa el detalle de la solicitud en su teléfono y presiona **"Aceptar Asignación"**.
3. **Recepción en el Centro de Mando (`sgrai-web`):**
   - Aparece el Toast **"Asignación Aceptada por Cuadrilla"** con los códigos de incidente y misión.
   - La tarjeta del incidente pasa automáticamente a la columna **"En Atención"**.
4. **Seguimiento de Operaciones y Cierre de Faenas (`HU-42` / `HU-68`):**
   - Haga clic en **"Ver incidente"** en el Toast (o en la tarjeta de la columna **En Atención**) y luego en **"Ver Detalles"** de la misión para auditar la hora de salida y esperar el posterior reporte de llegada (`HU-42`) o cierre técnico final (`HU-68`).
   - Al concluir los trabajos (`HU-68`), la misión pasará a **Completada**, la cuadrilla regresará a **Disponible** y la tarjeta del incidente permanecerá en **En Atención** con la etiqueta **`Faenas finalizadas`** hasta la validación y cierre definitivo por parte del Encargado (`HU-86`).

---

## 5. Casos Especiales y Mensajes Esperables

| Situación | Causa | Acción Recomendada |
|---|---|---|
| **La cuadrilla aún no acepta tras ser despachada** | El Delegado se encuentra en zona sin cobertura o aún no confirma en su móvil. | Verifique por radiofrecuencia; si la unidad no puede acudir, debe registrar el rechazo justificado (`HU-41`). |
| **El Toast desaparece antes de hacer clic** | Tiempo de auto-cierre estándar de notificaciones. | Ubique el incidente directamente en la columna **"En Atención"** del tablero Kanban. |
| **El incidente pasa a "En Atención" pero la bitácora no muestra un hito más reciente** | Llegada o reporte de avance aún no enviado desde terreno. | Una vez aceptada la asignación, el Delegado registrará su llegada al sitio (`HU-42`) desde la pantalla de misión activa. |

---

## 6. Relación con Otros Repositorios

- **`sgrai-pwa` (Terreno):** Aplicación móvil donde el **Delegado de Cuadrilla** visualiza la solicitud de misión con el botón **"Aceptar Asignación"**, soporta encolamiento offline en zonas de baja señal y cambia a la vista de misión activa tras confirmar.
- **`sgrai-api` (Backend):** Expone `POST /api/misiones/{id}/aceptar` (requiere permiso `misiones:terreno:ejecutar`), ejecuta la transacción atómica en PostgreSQL (`mision`, `cuadrilla`, `incidente`, `mision_hito`) y emite los eventos WebSocket `mision:actualizada`, `incidente:actualizado` y `cuadrilla:actualizada` hacia las salas del Centro de Mando.
