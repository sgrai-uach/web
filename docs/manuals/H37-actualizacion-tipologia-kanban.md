# Manual de Usuario: H37 - Reclasificación de Tipología en Terreno y Actualización Reactiva en Tablero Kanban

Este manual documenta la integración de la reclasificación presencial de tipología de incidentes y su reflejo inmediato en el **Centro de Mando / Tablero Kanban** (`/gestion/centro-incidentes`) de la plataforma web del Sistema de Gestión de Recursos para Atención de Incidentes (SGRAI) de la Municipalidad de Valdivia.

---

## 1. Información General

- **Rol al que está dirigido:**
  - **Encargado de Operaciones / Jefe de Centro de Mando:** Monitorea y toma decisiones tácticas en el tablero Kanban y panel de detalle.
  - **Patrulla Verificadora (Terreno - PWA):** Constata la naturaleza real de la emergencia y reclasifica la tipología con justificación técnica.
- **Objetivo de la funcionalidad:** Asegurar un registro técnico fidedigno de la naturaleza real de las emergencias en Valdivia, corrigiendo en terreno clasificaciones inexactas efectuadas por informantes ciudadanos y reflejando de forma inmediata en el tablero Kanban la nueva tipología, la prioridad ajustada y la justificación técnica sin requerir recargar la pantalla.
- **Ruta de acceso en la plataforma web:** `/gestion/centro-incidentes` (o `/mando`).

---

## 2. Flujo Operativo de Reclasificación y Monitoreo

### Paso 1: Evaluación presencial por la Patrulla Verificadora
Cuando la patrulla verificadora llega al lugar del incidente tras aceptar su misión táctica en terreno, evalúa la magnitud del siniestro. Si constata que el reporte ciudadano tipificó erróneamente la emergencia (ej. un reporte ciudadano ingresado como "Anegamiento" corresponde técnicamente a un desborde de cauce con "Inundación" mayor que ingresa a viviendas):
1. La patrulla selecciona la categoría correcta desde el catálogo oficial municipal.
2. Ingresa obligatoriamente una **justificación técnica presencial** describiendo los hallazgos en terreno.
3. Guarda la evaluación en la PWA.

### Paso 2: Notificación en Vivo hacia el Centro de Mando
1. La API actualiza el incidente en base de datos e inserta el hito en la bitácora de la misión (`TIPOLOGIA_RECLASIFICADA`).
2. La API emite a través de Socket.io el evento `incidente:actualizado` hacia la sala de encargados (`sala:encargados`).
3. El frontend de `sgrai-web` intercepta el evento de forma reactiva.

### Paso 3: Actualización Inmediata en la Tarjeta Kanban
Sin que el Encargado deba presionar F5 o refrescar la pantalla:
1. **Tipología:** El título de la tarjeta en la columna correspondiente cambia al instante por el nuevo tipo oficial (ej. `Inundación`).
2. **Prioridad:** El badge de prioridad cambia dinámicamente de color y texto institucional (ej. `Baja`, `Media`, `Alta`, `Crítica`), utilizando siempre denominaciones legibles en español amigable.
3. **Distintivo de Verificación Técnica:** Se activa en la tarjeta la etiqueta **"Verificado en terreno"** con ícono de verificación.
4. **Tooltip Informativo:** Al posar el cursor sobre la tarjeta o su etiqueta, se despliega la justificación presencial ingresada por la patrulla y si existió ajuste de prioridad.
5. **Franja en Vivo:** La barra de estado del Centro de Mando informa la novedad: `"Actualización en vivo: Tipología reclasificada: INC-2026-001 a Inundación (Prioridad: Alta)"`.

### Paso 4: Consulta de Justificación y Misiones en el Panel Lateral (Drawer)
Al hacer clic sobre la tarjeta del incidente reclasificado:
1. Se abre el panel lateral de detalle del caso.
2. En la sección **Resumen del Incidente**, se despliega el bloque destacado con acento institucional:
   - **Título:** *Reclasificación Técnica en Terreno*
   - **Tipología constatada:** Nombre oficial de la categoría corregida.
   - **Justificación de la patrulla:** Relato técnico detallado ingresado por el verificador en terreno.
   - **Prioridad ajustada:** Valor amigable resultante de la evaluación técnica.
3. En la sección **Misiones y Equipos en Terreno**, las tarjetas de misión han sido completamente estandarizadas bajo las normas de diseño institucional (`GEMINI.md`):
   - **Estados en Chips Planos:** El estado de la misión se exhibe en un chip de esquinas rectas (`0px`), texto en negrita y colores semánticos (`En Curso`, `Despachada`, `Completada`, `Rechazada`, `Planificada`, `Cancelada`).
   - **Textos Legibles:** Se eliminan enums internos en crudo (`EN_CURSO`, `VERIFICACION`, `MEDIA`); se muestran denominaciones naturales como `Verificación en terreno`, `Prioridad: Media`, `Patrulla: [Nombre] (En verificación)`.
   - **Gestión Visual de Rechazo:** Si una misión fue rechazada por la cuadrilla o patrulla, la tarjeta exhibe un borde lateral de alerta destructiva (`var(--color-danger)`), el ícono `AlertTriangle` y una caja semántica de fondo suave destacando la **justificación del rechazo** ingresada desde terreno.
   - **Detalle de Fecha y Código:** Código de la misión presentado en un tag carbón discreto (`MIS-2026-XXXX`) y hora de asignación formateada con ícono `Clock`.
4. En la cabecera del drawer, los badges muestran estados y prioridades institucionales legibles (ej. `Estado: En verificación`, `Prioridad: Alta`), sin exponer enums de programación en mayúsculas sostenidas.
5. Si el Encargado tenía el panel lateral abierto en el momento exacto en que la patrulla guarda la reclasificación en terreno, el drawer se sincroniza reactivamente actualizando los campos sin cerrarse.

### Paso 5: Sincronización Automática de Columna en Kanban (Integración H69)
- **Confirmación Pendiente:** Al despachar la patrulla, el incidente se mantiene en la columna **"Reportado"** con el botón ámbar deshabilitado *"Confirmación Pendiente"* e ícono `Hourglass`.
- **Transición a "En Verificación":** Únicamente cuando la patrulla acepta la misión en terreno (`EN_CURSO`), el incidente transiciona atómicamente a la columna **"En Verificación"** (`VERIFICANDO`).
- **Rechazo de Misión:** Si la patrulla rechaza la misión, el incidente permanece en la columna **"Reportado"**, se resetea la condición de misión despachada, se reactiva el botón *"Asignar Patrulla"* y el Encargado recibe un Toast de advertencia con el motivo del rechazo.
- **Dimensiones de Columnas:** Las 5 columnas del tablero poseen un ancho mínimo ampliado de **310px** para brindar holgura y lectura óptima de las tarjetas.

---

## 3. Formato y Nomenclatura Amigable para el Usuario

En conformidad con las pautas de experiencia de usuario institucional de SGRAI:
- **Estados:** Se muestran siempre en lenguaje natural institucional (`Reportado`, `En verificación`, `En atención`, `Resuelto`, `No abordable`).
- **Prioridades:** Denominadas en español correcto con tilde (`Crítica`, `Alta`, `Media`, `Baja`).
- **Hitos de Bitácora:** El evento `TIPOLOGIA_RECLASIFICADA` se traduce de cara al operador como `"Tipología reclasificada en terreno"`.

---

## 4. Casos Especiales y Manejo de Errores

| Situación | Comportamiento del Sistema | Acción Recomendada para el Encargado |
|---|---|---|
| **Pérdida temporal de conexión Socket** | El hook reactivo intenta reconectar automáticamente con reintentos con retroceso exponencial. | Si la conexión se pierde prolongadamente, el botón "Actualizar" en cabecera permite sincronizar el tablero vía REST. |
| **Incidente reclasificado mientras el Drawer está abierto** | El listener de WebSocket actualiza en memoria el detalle del incidente abierto sin recargar la vista. | El Encargado puede leer la justificación de inmediato y proceder a la reasignación de cuadrillas si la emergencia escaló de nivel. |
| **Cambio de prioridad a Crítica** | La tarjeta adopta el borde y badge rojo de prioridad crítica al instante en la columna en que se encuentre. | El Encargado visualiza el caso como prioritario para despacho urgente de cuadrillas de mitigación. |

---

## 5. Relación con Otros Repositorios del Ecosistema SGRAI

- **`sgrai-api`:** Expone el endpoint `PATCH /api/incidentes/:id/tipologia`, valida los permisos RBAC (`misiones:terreno:verificar`), inserta el hito en `mision_hito` y emite el evento WebSocket `incidente:actualizado` con el payload de tipología y justificación.
- **`sgrai-pwa`:** Aplicación de terreno utilizada por la Patrulla Verificadora que consume `GET /api/incidentes/tipos?catalogo=true` para el selector desplegable y ejecuta el PATCH de reclasificación presencial tras haber aceptado la misión (HU-36).

