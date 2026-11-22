# Manual de Usuario: H39 - Informe Técnico de Verificación y Cierre en el Centro de Mando (Fusión H39/H86)

Este manual documenta cómo el **Centro de Mando (`/gestion/centro-incidentes`)** de la plataforma web (`sgrai-web`) de la Municipalidad de Valdivia recibe en tiempo real el informe técnico consolidado de cierre enviado por la **Patrulla Verificadora**, procesa el dictamen operativo (`REQUIERE_CUADRILLA` o `NO_ABORDABLE`), muestra la trazabilidad de personas damnificadas respecto al reporte previo de prioridad, centraliza el indicador de **Ficha FIBE** y deja habilitada la sección de evidencias fotográficas para **HU-43**.

---

## 1. Información General

- **Roles a los que está dirigido:**
  - **Encargado de Operaciones / Jefe de Centro de Mando (`sgrai-web`):** Supervisa el cierre de la misión de verificación inicial en el Tablero Kanban, revisa el diagnóstico técnico consolidado y despacha cuadrillas operativas (HU-21) o audita el cierre fundado de casos declarados no abordables (HU-86).
  - **Patrulla Verificadora (`sgrai-pwa`):** Consolida el diagnóstico técnico en terreno, define el dictamen de atención (`REQUIERE_CUADRILLA` o `NO_ABORDABLE`), confirma o ajusta la cantidad de personas afectadas rescatada de la evaluación de prioridad (H38), indica si requiere levantamiento de Ficha FIBE y cierra la misión inicial.
- **Objetivo de la funcionalidad:** Proveer al Centro de Mando un diagnóstico técnico consolidado y trazable para fundamentar el despacho oportuno de cuadrillas o certificar el cierre inmediato en terreno de siniestros no abordables, liberando la patrulla verificadora para nuevas asignaciones.
- **Ruta de acceso en la plataforma web:** `/gestion/centro-incidentes` (Centro de Mando).

---

## 2. Flujo Operativo paso a paso en el Centro de Mando

### Paso 1: Recepción en Vivo en el Tablero Kanban según Dictamen de Cierre
Cuando la Patrulla Verificadora presiona **"Enviar Reporte y Cerrar Tarea"** en `sgrai-pwa`, `sgrai-api` ejecuta la transacción atómica y emite los eventos WebSocket `incidente:actualizado` y `mision:actualizada` hacia el Centro de Mando:

1. **Si el dictamen es `REQUIERE_CUADRILLA`:**
   - La tarjeta del incidente permanece en la columna **`En Verificación` (`VERIFICANDO`)**, posicionándose automáticamente en la parte superior de la columna.
   - Se activan o actualizan los distintivos **`Verificado`**, **`Requiere Cuadrilla`**, el badge de prioridad vigente y el indicador **`FIBE`** (si la patrulla marcó `requiere_asistencia_social = true`).
   - Aparece una notificación Toast **`Informe de Verificación y Cierre`** con el resumen del dictamen, estado del terreno, personas afectadas e indicación de Ficha FIBE.
2. **Si el dictamen es `NO_ABORDABLE` (predio privado inaccesible, faja fiscal externa o falsa alarma):**
   - La tarjeta del incidente se mueve **automáticamente** desde `En Verificación` hacia la columna **`No Abordable` (`NO_ABORDABLE`)**, actualizando los contadores de ambas columnas sin recargar la página.
   - La tarjeta exhibe el badge **`No Abordable`** junto al bloque destacado con el **`motivoNoAbordable`** ingresado por la patrulla.
   - Aparece una notificación Toast de advertencia **`Incidente Declarado No Abordable`** con el motivo técnico del descarte.

### Paso 2: Revisión en el Panel Lateral de Detalle del Incidente (Drawer)
Al hacer clic sobre la tarjeta en el Tablero Kanban, el Encargado visualiza:

1. **Barra de Acción Táctica o Banner de Cierre:**
   - Si el dictamen fue **`REQUIERE_CUADRILLA`** (`estado === 'VERIFICANDO'`): la barra *Intervención Táctica Operativa* muestra el badge **`Verificación Completada`** y el botón **`Despachar Cuadrilla`** listo para ejecutar la asignación de cuadrilla (HU-21).
   - Si el dictamen fue **`NO_ABORDABLE`** (`estado === 'NO_ABORDABLE'`): se oculta la barra de despacho de cuadrillas y se despliega el banner rojo **`Caso cerrado en terreno como No Abordable`** junto con la fecha de cierre y el motivo técnico completo.
2. **Bloque "Último Reporte de Terreno" y Tarjeta de Misión:**
   - La misión de verificación refleja su estado **`Completada`**.
   - El resumen del último reporte identifica la etiqueta del informe (ej. `Informe Técnico de Verificación y Cierre`), el chip de **Dictamen** (`Requiere Cuadrilla` o `No Abordable`), el chip de **Ficha FIBE** (`Requiere Ficha FIBE` o `No requiere Ficha FIBE`), el estado del terreno, el `motivoNoAbordable` (cuando aplica) y la cantidad de personas afectadas indicando explícitamente si fue modificada respecto al reporte previo de prioridad.

### Paso 3: Auditoría Completa en el Modal de Detalle de Misión (`Informes Técnicos y Reportes de Terreno`)
Al hacer clic en **`Ver detalle`**, **`Ver Último Reporte`** o **`Ver Todos los Reportes`**, se abre el Modal de Detalle de Misión, donde los reportes de tipo `VERIFICACION_CIERRE` se distinguen visualmente del reporte previo de prioridad (H38):

1. **Cabecera del Informe de Cierre:**
   - Muestra su `etiquetaReporte` en chip teal sólido, el **badge de dictamen** (`Dictamen: Requiere Cuadrilla` en teal o `Dictamen: No Abordable` en rojo), el indicador de vigencia (`Vigente`) y el estado reportado en terreno.
   - Su borde izquierdo semántico es **verde menta** para `REQUIERE_CUADRILLA` y **rojo institucional** para `NO_ABORDABLE`.
2. **Cuerpo Técnico Consolidado:**
   - **Declaración Fundada de No Abordabilidad** (solo si `dictamen === 'NO_ABORDABLE'`): recuadro destacado con `motivoNoAbordable`.
   - **Diagnóstico y Resumen Técnico del Siniestro:** texto consolidado (`resumenTecnico`).
   - **Estado del Terreno, Daños y Personas Damnificadas:** compara automáticamente `personasAfectadas` con el reporte de asignación de prioridad (H38), mostrando **`Modificado respecto a prioridad (Antes: X)`** si la patrulla ajustó el número al cerrar, o **`(Rescatado del reporte de prioridad sin cambios)`** si lo mantuvo.
   - **Asistencia Social (Ficha FIBE):** badge **`Requiere Ficha FIBE`** o **`No requiere Ficha FIBE`** (trasladado exclusivamente a este informe de cierre desde H38).
   - **Observaciones Generales:** notas adicionales de cierre.
   - **Evidencia Fotográfica (preparada para HU-43):** sección de galería lista para desplegar las fotografías adjuntas en terreno una vez integrada HU-43.

---

## 3. Casos Especiales y Manejo de Errores

| Situación Operativa | Comportamiento en el Centro de Mando | Acción Recomendada para el Encargado |
|---|---|---|
| **La patrulla modifica el número de personas afectadas respecto al reporte de prioridad (H38)** | La tarjeta del informe muestra el badge ámbar `Modificado respecto a prioridad (Antes: X)` junto al nuevo total consolidado. | Considerar el número actualizado para dimensionar la dotación de cuadrilla y ayudas sociales. |
| **El informe marca `Requiere Ficha FIBE`** | Se activa el chip `FIBE` en la tarjeta Kanban, en la cabecera del Drawer y el badge `Requiere Ficha FIBE` en el informe de cierre. | Coordinar la derivación hacia el Panel de Asistencia Social (DGRD) para el levantamiento de la Ficha FIBE. |
| **El informe cierra el caso como `NO_ABORDABLE`** | El incidente se traslada a la columna `No Abordable`, se deshabilita el despacho de cuadrillas y la patrulla queda `DISPONIBLE`. | Auditar el `motivoNoAbordable` en el Drawer o Modal de Misión; no requiere despacho municipal adicional. |
| **Aún no se adjuntan fotografías en terreno (previo a HU-43)** | La sección de evidencias muestra el estado preparado para HU-43 indicando que no existen fotografías adjuntas. | Revisar el resumen técnico y observaciones textuales mientras se habilita la captura multimedia en HU-43. |

---

## 4. Relación con Otros Repositorios del Ecosistema SGRAI

- **`sgrai-api`:** Expone el endpoint transaccional `POST /api/misiones/{id}/reporte` (protegido con el permiso RBAC `reportes:crear`), valida con Zod los campos técnicos y el mínimo de caracteres (`resumen_tecnico` mínimo 10 caracteres; `motivo_no_abordable` obligatorio mínimo 15 caracteres cuando el dictamen es `NO_ABORDABLE`), persiste el registro `VERIFICACION_CIERRE` en `reporte_terreno`, actualiza la misión a `COMPLETADA`, actualiza `incidente.requiere_asistencia_social` o transiciona el incidente a `NO_ABORDABLE` liberando a la patrulla a `DISPONIBLE`, registra los hitos en `mision_hito` y emite `mision:actualizada` e `incidente:actualizado` por WebSocket.
- **`sgrai-pwa` (`web-app`):** Provee el formulario táctil y con persistencia offline para que la Patrulla Verificadora rescate la cantidad de personas afectadas desde el reporte de prioridad (H38), capture el dictamen operativo, marque el requerimiento de Ficha FIBE, adjunte fotografías (HU-43) y cierre la misión inicial de verificación.
