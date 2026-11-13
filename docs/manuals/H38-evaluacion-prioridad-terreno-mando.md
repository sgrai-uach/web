# Manual de Usuario: H38 - Evaluación Técnica en Terreno, Prioridad Sugerida y Gestión de Reportes en Centro de Mando

Este manual documenta la recepción en tiempo real de la evaluación demográfica y técnica realizada por las Patrullas Verificadoras en terreno, la actualización automática de prioridad (`Baja`, `Media`, `Alta`, `Crítica`) en el **Tablero Kanban**, y el acceso directo tanto al **último reporte realizado** como al **historial completo de reportes** dentro del detalle de la misión en la plataforma web (`sgrai-web`) de la Municipalidad de Valdivia.

---

## 1. Información General

- **Roles a los que está dirigido:**
  - **Encargado de Operaciones / Jefe de Centro de Mando (`sgrai-web`):** Monitorea el Tablero Kanban, recibe notificaciones en vivo de evaluaciones iniciales o rectificaciones, audita discrepancias entre la prioridad sugerida por el sistema y la asignada manualmente en terreno, y consulta los reportes técnicos asociados a cada misión.
  - **Patrulla Verificadora (`sgrai-pwa`):** Levanta en terreno el formulario de vulnerabilidad demográfica y habitacional, obtiene la prioridad preliminar sugerida por el sistema, confirma o modifica el nivel de prioridad con justificación obligatoria, y envía o rectifica el reporte hacia el Centro de Mando.
- **Objetivo de la funcionalidad:** Garantizar que los recursos tácticos pesados y cuadrillas municipales se destinen prioritariamente a las emergencias de mayor gravedad, respaldados por una evaluación objetiva del grupo familiar afectado y un registro trazable de cada versión del reporte emitido desde terreno.
- **Ruta de acceso en la plataforma web:** `/gestion/centro-incidentes` (Centro de Mando).

---

## 2. Flujo Operativo paso a paso en el Centro de Mando

### Paso 1: Recepción en Vivo del Reporte y Actualización Automática en el Tablero Kanban
Cuando la Patrulla Verificadora envía desde terreno el formulario de evaluación y confirma la prioridad del incidente:
1. El servidor central procesa la evaluación en una transacción atómica y emite el evento en tiempo real `incidente:actualizado` a la sala de encargados (`sala:encargados`).
2. En el **Tablero Kanban**, sin necesidad de recargar la página:
   - **Badge de Prioridad:** La tarjeta del incidente actualiza al instante su etiqueta y color semántico (`Baja`, `Media`, `Alta` o `Crítica`).
   - **Indicador de Prioridad Ajustada Manualmente:** Si la patrulla modificó la prioridad sugerida preliminarmente por el sistema, aparece junto al badge el distintivo **`Ajustada`**. Al posar el cursor sobre él, un tooltip detalla la prioridad asignada, la prioridad sugerida por el sistema y la **justificación técnica** ingresada por el patrullero.
   - **Contador de Reportes y Rectificaciones:** En el pie de la tarjeta se muestra la etiqueta **`1 reporte`** (para la evaluación inicial) o **`N reportes · Rectificado`** si la patrulla envió una modificación posterior desde terreno.
   - **Notificación Toast y Barra de Actividad en Vivo:** El Encargado recibe un aviso emergente diferenciando si se trata del **Reporte #1 (Evaluación Inicial)** o de un **Reporte #N (Rectificación en Terreno)**.

![Actualización de prioridad y reportes en tarjeta Kanban](./assets/h38-evaluacion-prioridad-terreno-mando/kanban-card-prioridad-reportes.png)

### Paso 2: Acceso Directo al Último Reporte desde las Misiones Activas del Incidente
Al hacer clic sobre la tarjeta del incidente en el Tablero Kanban, se despliega el **Panel Lateral de Detalle del Incidente (Drawer)**:
1. En la cabecera del panel se exhibe la prioridad vigente y, en caso de ajuste manual en terreno, el badge comparativo **`Sugerida: [Nivel]`**.
2. En la sección **Misiones y Equipos en Terreno**, dentro de la tarjeta de cada misión activa que cuenta con evaluaciones en terreno, se presenta el bloque **"Último Reporte Realizado"**:
   - Identifica si corresponde al **`Reporte #1 — Evaluación Inicial`** o a un **`Reporte #N — Rectificación Vigente`** junto con su fecha y hora.
   - Muestra la comparativa **Prioridad sugerida vs. Prioridad confirmada** y la justificación técnica si hubo modificación manual.
   - Presenta un resumen rápido de los indicadores demográficos y habitacionales (tamaño del núcleo familiar, niños, adultos mayores, personas con discapacidad, mascotas y nivel de compromiso de la vivienda), seguido del diagnóstico técnico.
3. En la esquina inferior derecha de dicho bloque, el Encargado dispone de dos accesos directos:
   - **`Ver Último Reporte`**: Abre el modal de detalle de la misión posicionando el foco directamente sobre el último reporte vigente.
   - **`Ver Todos los Reportes (N)`**: Abre el modal de detalle de la misión desplazándose automáticamente a la sección completa de informes para auditar todas las versiones enviadas.

![Acceso directo al último reporte en el Drawer del incidente](./assets/h38-evaluacion-prioridad-terreno-mando/drawer-acceso-ultimo-reporte.png)

### Paso 3: Consulta de Todos los Reportes y Desglose Demográfico en el Detalle de la Misión
Dentro del **Modal de Detalle de Misión**, en la sección **`Informes Técnicos y Reportes de Terreno`**:
1. Se listan todos los reportes asociados a la misión ordenados desde la versión más reciente (**`Vigente`**) hasta la evaluación original (**`Histórico`**), permitiendo expandir o colapsar cada envío individualmente.
2. Cada tarjeta de reporte incluye:
   - **Comparativa de Prioridad y Justificación Técnica:** Prioridad sugerida por el sistema, prioridad confirmada por la patrulla y el motivo técnico ingresado ante discrepancias.
   - **Evaluación Demográfica y Condiciones en Terreno:** Núcleo familiar total, cantidad de familias, niños/as y adolescentes, adultos mayores, personas con discapacidad, pacientes electrodependientes, mascotas afectadas y nivel de daño en viviendas (`Sin daño habitacional`, `Daño leve`, `Daño moderado`, `Grave / Inhabitable`).
   - **Alertas y Riesgos Activos:** Etiquetas destacadas cuando se constata `Requiere Evacuación`, `Requiere Ficha FIBE`, `Riesgo Eléctrico`, `Riesgo Estructural`, `Riesgo Químico / Sanitario` o `Aislamiento Vial`.
   - **Acciones, Daños, Observaciones y Evidencia Fotográfica:** Relato técnico completo y galería de fotografías adjuntas en terreno.

![Historial de reportes y desglose demográfico en Detalle de Misión](./assets/h38-evaluacion-prioridad-terreno-mando/mision-detalle-historial-reportes.png)

---

## 3. Casos Especiales y Manejo de Errores

| Situación Operativa | Comportamiento en el Centro de Mando | Acción Recomendada para el Encargado |
|---|---|---|
| **La patrulla modifica y reenvía el reporte por agravamiento en terreno** | El sistema registra una nueva versión (`Reporte #2 — Rectificación`), conserva intacto el `Reporte #1 (Inicial)` como histórico y actualiza inmediatamente la prioridad en el Kanban y en el Drawer. | Revisar el bloque del último reporte vigente o hacer clic en `Ver Todos los Reportes (N)` para comparar qué indicadores cambiaron entre el reporte inicial y la rectificación. |
| **La prioridad asignada por la patrulla difiere de la sugerida por el sistema** | Se activa el indicador `Ajustada` en la tarjeta Kanban, el badge `Sugerida: [Nivel]` en el Drawer y se destaca la justificación técnica obligatoria. | Evaluar la justificación presencial del patrullero para decidir el despacho inmediato de cuadrillas pesadas o recursos adicionales. |
| **La evaluación en terreno marca afectación social / vulnerabilidad habitacional** | Se activa automáticamente el indicador **`FIBE`** en la tarjeta del incidente y en la cabecera del Drawer. | Coordinar la derivación del caso hacia el Panel de Asistencia Social (DGRD) para el levantamiento de la Ficha FIBE. |

---

## 4. Relación con Otros Repositorios del Ecosistema SGRAI

- **`sgrai-api`:** Expone los endpoints `POST /api/incidentes/{id}/prioridad/calcular` y `PATCH /api/incidentes/{id}/prioridad` (protegidos con el permiso RBAC `misiones:terreno:verificar`), valida con Zod que toda modificación respecto a `prioridad_sugerida` incluya una `justificacion_prioridad` de al menos 5 caracteres, guarda el historial versionado en `reporte_terreno` junto al hito en `mision_hito`, y emite el evento WebSocket `incidente:actualizado`.
- **`sgrai-pwa` (`web-app`):** Permite a la Patrulla Verificadora completar en terreno el formulario demográfico y de riesgos, visualizar la prioridad sugerida por el sistema, confirmar o ajustar la prioridad e ingresar rectificaciones posteriores cuando evolucionan las condiciones de la emergencia.

