# Manual de Usuario: H41 — Recepción y Gestión de Rechazo de Misión por Cuadrilla Operativa (Centro de Mando)

**Código Historia de Usuario:** HU-41  
**Módulo:** Centro de Mando / Gestión de Incidentes Tácticos  
**Roles Destinatarios:** Encargado de Centro de Mando / Operaciones (DGRD) y Administrador Municipal  
**Permiso RBAC Requerido:** `incidentes:leer`, `misiones:asignar`  
**Ruta del Módulo:** `/gestion/centro-incidentes`  

---

## 1. Objetivo de la Funcionalidad

Informar oportunamente al **Centro de Mando** mediante alertas en tiempo real cuando una **Cuadrilla Operativa** en terreno rechaza una asignación de misión por fuerza mayor (desperfecto mecánico de maquinaria/vehículo, corte de ruta, falta de equipamiento especializado o emergencia concurrente), registrando su justificación técnica obligatoria y permitiendo la **reasignación inmediata** del incidente a otra cuadrilla disponible.

---

## 2. Comportamiento en Tiempo Real (WebSockets)

Cuando el **Delegado de Cuadrilla** presiona **"Rechazar Misión"** en la aplicación móvil `sgrai-pwa` e ingresa un motivo técnico válido (mínimo 5 caracteres según Regla de Negocio §3.3), `sgrai-api` ejecuta la transacción atómica y emite los eventos `mision:rechazada`, `incidente:actualizado` y `cuadrilla:actualizada`.

La plataforma web `sgrai-web` reacciona automáticamente:

1. **Alerta Prioritaria Flotante (Toast de Advertencia):**
   - Se despliega una notificación en la esquina superior derecha con el título **"Misión Rechazada por Cuadrilla"**.
   - Muestra el nombre de la cuadrilla operativa, el código de la misión (`MIS-...`), el código del incidente (`INC-...`) y el motivo técnico ingresado en terreno.
2. **Reversión de Estado en el Tablero Kanban:**
   - La tarjeta del incidente sale de la columna **"En Atención"** y retorna automáticamente a:
     - **"En Verificación"** (`VERIFICANDO`), si el incidente ya contaba con una verificación previa completada por patrulla (manteniendo la marca de verificado).
     - **"Pendiente / Reportado"** (`REPORTADO`), si el incidente había sido despachado directamente a la cuadrilla sin verificación previa.
3. **Actualización de Métricas ("Panorama del Día") y Disponibilidad:**
   - Los contadores de incidentes se actualizan de forma reactiva sin recargar la página.
   - La cuadrilla que rechazó la misión vuelve inmediatamente al estado **`DISPONIBLE`** tanto en el listado de administración como en el selector de despacho y el Mapa Operativo.

---

## 3. Visualización en el Drawer de Detalle del Incidente

Al abrir la tarjeta del incidente en el tablero Kanban (o si el Encargado ya tenía el panel lateral abierto al momento del rechazo):

1. **Aviso de Reasignación Pendiente:**
   - En la sección **"Misiones y Equipos en Terreno"**, se despliega un banner de advertencia indicando que la cuadrilla asignada previamente rechazó la misión y que se puede utilizar **"Despachar Cuadrilla"** para reasignar la emergencia de inmediato.
2. **Justificación Técnica del Rechazo:**
   - La tarjeta de la misión rechazada muestra el estado **`RECHAZADA`** junto al bloque destacado **"Motivo de Rechazo por la Cuadrilla:"** con el texto exacto registrado desde terreno.
   - Al presionar **"Ver Detalles"** en la misión, el modal de detalle también expone el banner superior de rechazo y el hito `RECHAZADA` en la **Bitácora Cronológica de Operaciones**.

---

## 4. Flujo Operativo de Reasignación Paso a Paso

1. **Recepción de la Alerta:**
   - Observe la notificación flotante **"Misión Rechazada por Cuadrilla"** en el Centro de Mando.
2. **Localización del Incidente:**
   - Ubique el incidente en la columna **"En Verificación"** (si ya estaba verificado) o **"Pendiente / Reportado"** (si fue despacho directo) y haga clic sobre la tarjeta.
3. **Revisión del Motivo:**
   - En el panel lateral (*Misiones y Equipos en Terreno*), lea el motivo de rechazo informado por el Delegado de Cuadrilla (ej. *"Camión tolva presenta falla hidráulica en ruta de salida desde base"*).
4. **Reasignación a Otra Cuadrilla:**
   - Presione **"Despachar Cuadrilla"** en la barra superior **"Intervención Táctica Operativa"**.
   - Seleccione una cuadrilla alternativa en estado **`DISPONIBLE`**, ajuste prioridad o instrucciones si corresponde y confirme el despacho.
   - El incidente retornará a **"En Atención"** y la nueva cuadrilla recibirá la orden en su dispositivo.

---

## 5. Casos Especiales y Errores Esperables

| Situación | Causa | Acción Recomendada |
|---|---|---|
| **La cuadrilla sigue figurando como no disponible temporalmente** | Retardo puntual de red al sincronizar el mapa o listado. | Presione **"Actualizar"** en el tablero Kanban o cierre y reabra el modal de despacho; la API ya liberó la cuadrilla a `DISPONIBLE`. |
| **No hay otras cuadrillas en estado `DISPONIBLE`** | Todas las demás dotaciones se encuentran `EN_MISION` o `NO_DISPONIBLE`. | Monitoree el módulo de cuadrillas o coordine la reasignación cuando otra faena concluya. |
| **No aparece el botón "Despachar Cuadrilla"** | El usuario no posee el permiso RBAC `misiones:asignar`. | Solicite al Administrador Municipal la asignación del permiso correspondiente. |

---

## 6. Relación con Otros Repositorios

- **`sgrai-pwa`:** Aplicación móvil donde el **Delegado de Cuadrilla** presiona *"Rechazar Misión"* e ingresa obligatoriamente una justificación de al menos 5 caracteres.
- **`sgrai-api`:** Expone `POST /api/misiones/{id}/rechazar` (permiso `misiones:terreno:ejecutar`), valida la regla de negocio §3.3 (mínimo 5 caracteres), ejecuta la transacción atómica en PostgreSQL (`mision`, `cuadrilla`, `usuario`, `incidente`, `mision_hito`) y emite los eventos WebSocket `mision:rechazada`, `incidente:actualizado` y `cuadrilla:actualizada`.
