# Manual de Usuario: H69 — Recepción y Gestión de Rechazo de Misión por Patrulla Verificadora

Este manual documenta el procedimiento operativo y visual para el **Centro de Mando (Encargado)** ante el rechazo justificado de una asignación de misión por parte de una **Patrulla Verificadora** en terreno, conforme a la plataforma web del Sistema de Gestión de Recursos para Atención de Incidentes (SGRAI) de la Municipalidad de Valdivia.

---

## 1. Información General

- **Rol al que está dirigido:** Encargado de Centro de Mando / Operaciones (DGRD) y Administrador Municipal.
- **Objetivo de la funcionalidad:** Informar oportunamente al Centro de Mando mediante notificaciones flotantes en tiempo real cuando una patrulla en terreno rechaza una misión por fuerza mayor (desperfecto mecánico, corte de ruta, emergencia prioritaria), registrando la justificación obligatoria y permitiendo la reasignación inmediata del incidente.
- **Vistas involucradas:**
  - Tablero Kanban del Centro de Mando (`/gestion/centro-incidentes`).
  - Drawer Lateral de Detalle del Incidente (*Misiones y Equipos en Terreno*).
  - Métricas de la jornada (*Panorama del Día*).

---

## 2. Comportamiento en Tiempo Real (WebSockets)

Cuando un funcionario en terreno perteneciente a una patrulla verificadora presiona **"Rechazar Misión"** en la aplicación móvil `sgrai-pwa`, la API central procesa la transacción atómica y emite el evento WebSocket `mision:rechazada`.

Al estar conectado al Centro de Mando, la interfaz web reacciona de la siguiente manera:

1. **Notificación Flotante (Toast de Advertencia):**
   - Se despliega una alerta flotante en la esquina superior derecha indicando el rechazo:
     - **Título:** *"Misión Rechazada por Patrulla"*
     - **Contenido:** Identifica el nombre de la unidad patrullera, el código de la misión, el código del incidente y el motivo de rechazo ingresado en terreno (mínimo 5 caracteres).
2. **Reversión de Estado en el Tablero Kanban:**
   - La tarjeta del incidente afectado se traslada automáticamente desde la columna **"En Verificación"** de regreso a la columna **"Reportado"**.
3. **Actualización Automática de Métricas ("Panorama del Día"):**
   - El contador de *Reportados* se incrementa y el contador de *En Verificación* disminuye de forma reactiva sin requerir recargar la página.

---

## 3. Visualización en el Drawer de Detalle del Incidente

Al hacer clic sobre una tarjeta de incidente que haya tenido misiones rechazadas:

### 3.1. Sección "Misiones y Equipos en Terreno"
La sección presenta una interfaz técnica y limpia sin enums internos, traduciendo todos los estados, tipos de misión y prioridades al lenguaje operativo municipal:

1. **Aviso de Reasignación Pendiente:**
   - Si el incidente se encuentra en estado **Reportado**, se muestra un recuadro de advertencia que indica que el despacho previo fue rechazado y requiere una nueva asignación de patrulla verificadora.
   - Cuenta con el botón destacado **`[ 🛡 Reasignar Patrulla Verificadora ]`**.
2. **Historial de Asignaciones y Rechazos Previos:**
   - Si existen misiones previas rechazadas, se despliega una subsección dedicada con borde distintivo de alerta (`--color-danger`).
   - Cada misión rechazada indica:
     - Código y título de la misión.
     - Badge rojo institucional: **Rechazada**.
     - Tipo de misión y prioridad legible (ej. *Verificación en Terreno • Prioridad Alta*).
     - Nombre de la unidad patrullera o cuadrilla involucrada.
     - **Recuadro de Justificación:** Bloque destacado con el texto exacto del motivo del rechazo ingresado por el evaluador en terreno.
   - Botón **"Ver Detalles"** para inspeccionar la bitácora técnica completa y los hitos registrados.

---

## 4. Flujo Operativo de Reasignación Paso a Paso

1. **Recepción del Aviso:**
   - Observe la notificación flotante que avisa sobre el rechazo de la misión.
2. **Localización del Incidente:**
   - Diríjase a la columna **"Reportado"** del tablero Kanban e identifique el incidente reportado.
3. **Apertura y Revisión de Motivo:**
   - Abra el drawer del incidente y revise en el *Historial de Asignaciones y Rechazos* el motivo indicado por la patrulla (ej. *"Ruta cortada por socavón en km 12"*).
4. **Reasignación:**
   - Haga clic en **"Reasignar Patrulla Verificadora"**.
   - Se abrirá el modal de asignación de patrulla, listando las unidades que se encuentran actualmente en estado **`DISPONIBLE`**.
   - Seleccione una patrulla alternativa adecuada y confirme el despacho.
5. **Cierre del Ciclo:**
   - El incidente avanzará nuevamente a **En Verificación** y la nueva patrulla recibirá la orden en su dispositivo.

---

## 5. Relación con Otros Repositorios

- **`sgrai-pwa`:** Aplicación de terreno donde la Patrulla Verificadora presiona "Rechazar Misión", debiendo ingresar obligatoriamente una justificación de mínimo 5 caracteres en el modal de confirmación.
- **`sgrai-api`:** Procesa el endpoint `POST /api/misiones/{id}/rechazar`, actualiza la misión a `RECHAZADA`, libera la patrulla a `DISPONIBLE`, revierte el incidente a `REPORTADO` y emite `mision:rechazada`.

