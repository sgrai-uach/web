# Manual de Usuario: H68 — Informe Técnico Final y Cierre de Misión de Cuadrilla en el Centro de Mando

**Código Historia de Usuario:** HU-68  
**Módulo:** Centro de Mando / Gestión de Incidentes Tácticos, Cuadrillas e Inventario  
**Roles Destinatarios:** Encargado de Centro de Mando / Operaciones (DGRD), Supervisor Estratégico y Administrador Municipal  
**Permisos RBAC Relacionados:** `incidentes:leer`, `misiones:leer`, `misiones:asignar`, `recursos:leer`  
**Ruta del Módulo:** `/gestion/centro-incidentes` (y módulos vinculados `/gestion/admin/cuadrillas` y `/gestion/admin/recursos`)

---

## 1. Objetivo de la Funcionalidad

Permitir que el **Centro de Mando** reciba, audite y procese en tiempo real el **Informe Técnico Final de Cuadrilla (`REPORTE_CUADRILLA`)** emitido desde terreno al culminar las faenas de mitigación o despeje, reflejando de inmediato:

- El resumen técnico de faenas ejecutadas, las **horas hombre invertidas**, el **estado final del terreno** y la **evidencia multimedia** adjunta (HU-43).
- El desglose de **materiales e insumos consumidos** y su impacto en el inventario municipal (incluyendo alertas tempranas de **Bajo Stock**).
- La transición de la misión a estado **`Completada`** y el retorno automático de la cuadrilla a estado **`Disponible`** para futuras asignaciones, manteniendo el incidente en **`En Atención`** hasta que el Encargado decrete su resolución final (**HU-86**).

---

## 2. Flujo Operativo Paso a Paso en el Centro de Mando

### Paso 1: Recepción en Tiempo Real al Cerrar la Misión desde Terreno
Cuando el **Delegado de Cuadrilla** completa y envía el formulario **"Finalizar Misión e Informe Técnico"** en `sgrai-pwa`, `sgrai-api` ejecuta la transacción atómica (`POST /api/misiones/{id}/cerrar`) y emite los eventos WebSocket `mision:actualizada`, `incidente:actualizado`, `cuadrilla:actualizada` y `recurso:actualizado`:

1. **Notificación Flotante (Toast):**
   - Si el estado final del terreno es `Controlado`, `Estable` o `Finalizado` (y no requiere apoyo adicional), aparece una notificación verde **`Informe Final de Cuadrilla Recibido`** con el estado del terreno, horas hombre, resumen de materiales consumidos y el botón **`Ver incidente`**.
   - Si el estado final del terreno es `Crítico` o `Inaccesible`, o la cuadrilla solicitó apoyo adicional, aparece una notificación de advertencia **`Cierre de Cuadrilla — Atención Requerida`**.
   - Si el consumo de insumos provoca que algún recurso baje de su stock mínimo o agote su disponibilidad, aparece además la alerta **`Alerta de Bajo Stock`** o **`Recurso Sin Disponibilidad`**.
2. **Estado en el Tablero Kanban y Mapa Operativo:**
   - La tarjeta del incidente **permanece en la columna `En Atención` (`EN_ATENCION`)** (no se cierra automáticamente a `Resuelto`).
   - Se activa el distintivo **`Faenas finalizadas`** en la tarjeta del incidente; si el terreno quedó en condición `Crítico`, `Inaccesible` o `Requiere seguimiento`, se agrega un chip semántico de alerta.
   - En el **Mapa Operativo**, el marcador del incidente deja de mostrar a la cuadrilla como desplegada en terreno.
3. **Disponibilidad Inmediata de la Cuadrilla:**
   - La cuadrilla transiciona automáticamente a **`Disponible`** tanto en `/gestion/admin/cuadrillas` (y su drawer técnico) como en el selector de despacho del modal **`Despachar Cuadrilla`**, quedando lista para nuevas asignaciones sin recargar la pantalla.

### Paso 2: Revisión en el Panel Lateral del Incidente (Drawer)
Al hacer clic sobre la tarjeta del incidente en el Tablero Kanban:

1. **Banner de Cierre de Faenas:**
   - En la cabecera del cuerpo del drawer aparece el aviso **`Faenas de cuadrilla finalizadas — Cuadrilla liberada`**, confirmando que la cuadrilla volvió a estado `Disponible`, mostrando la fecha de cierre de faena, el chip de estado final del terreno, las horas hombre y recordando que el caso permanece **`En Atención`** para resolución final del Encargado (H86).
2. **Bloque "Último Reporte de Terreno":**
   - Prioriza el **`Informe Técnico Final de Cuadrilla (Cierre de Misión)`**, mostrando chips de estado final del terreno y horas hombre, el listado compacto de insumos consumidos y el resumen de faenas ejecutadas.
3. **Tarjeta de la Misión (`Misiones y Equipos en Terreno`):**
   - La misión `ATENCION_CUADRILLA` cambia a estado **`Completada`** con su fecha y hora de cierre, la cuadrilla refleja estado **`Disponible`** y el resumen del último reporte muestra los materiales consumidos, horas hombre y resumen técnico.

### Paso 3: Auditoría Completa en el Modal de Detalle de Misión (`Ver Detalles` / `Ver Último Reporte`)
Al abrir el **Modal de Detalle de Misión**:

1. **Unidad y Recursos Asignados:**
   - La cuadrilla figura en estado **`Disponible`** y la tabla de recursos muestra únicamente las asignaciones vigentes con su **unidad** correspondiente (los insumos consumidos en su totalidad ya fueron descontados/desvinculados).
2. **Bitácora Cronológica de Operaciones:**
   - Registra el hito de término (`Misión completada`) con fecha, hora y glosa en lenguaje natural.
3. **Tarjeta del Informe Técnico Final de Cuadrilla (`REPORTE_CUADRILLA`):**
   - Cabecera con ícono de cuadrilla, nombre del delegado evaluador, fecha y chips de:
     - `Informe Técnico Final de Cuadrilla (Cierre de Misión)`
     - `Estado terreno: Controlado | Estable | Finalizado | Requiere seguimiento | Crítico | Inaccesible`
     - `X horas hombre`
     - Vigencia (`Vigente` si coexisten informes previos de patrulla) y `Requiere Apoyo` (si aplica)
   - Alerta superior destacada si el estado final del terreno es `Crítico`, `Inaccesible` o `Requiere seguimiento`.
   - Cuerpo con **Resumen de Faenas Ejecutadas**, métricas de cierre (**Estado Final del Terreno**, **Horas Hombre Invertidas**, **Daños Materiales Estimados** y **Ficha FIBE** cuando consta), tabla de **Materiales e Insumos Consumidos** (con nombre, cantidad con unidad y observación; o aviso limpio si no se consumieron insumos), **Observaciones Generales** y **Galería de Evidencias** (fotos, videos y PDFs actualizados en tiempo real mediante `adjunto:creado`, HU-43).

---

## 3. Casos Especiales y Manejo de Situaciones Operativas

| Situación Operativa | Comportamiento en `sgrai-web` | Acción Recomendada |
|---|---|---|
| **Cierre sin consumo de materiales (`materialesConsumidos = []`)** | La tarjeta del informe indica *"No se registró consumo de insumos materiales durante esta faena"* sin alterar el stock del inventario. | Validar horas hombre, resumen de faenas y estado final del terreno antes del cierre en H86. |
| **Consumo provoca alerta `BAJO_STOCK` o `NO_DISPONIBLE`** | Se despliega Toast de advertencia **`Alerta de Bajo Stock`** y la tabla `/gestion/admin/recursos` se actualiza en tiempo real sin recargar. | Coordinar reposición logística desde Administración de Recursos. |
| **Terreno cerrado como `CRITICO`, `INACCESIBLE` o `REQUIERE_SEGUIMIENTO`** | El borde de la tarjeta se pinta en rojo o ámbar, aparece un recuadro de alerta en el informe y un chip en la tarjeta Kanban. | Evaluar despacho de una nueva cuadrilla/apoyo adicional o gestionar cierre definitivo en H86. |
| **Incidente sigue en columna `En Atención` tras cierre de cuadrilla** | Comportamiento esperado por regla de negocio: el cierre de la misión de cuadrilla no cierra automáticamente el incidente. | Revisar evidencia y ejecutar la resolución final del incidente en el módulo correspondiente (HU-86). |
| **Carga posterior de fotografías/videos/PDFs desde terreno** | Al emitirse `adjunto:creado`, las miniaturas aparecen automáticamente dentro de la galería del informe de cuadrilla abierto. | Hacer clic en cualquier miniatura para auditar en el visor Lightbox (HU-43). |

---

## 4. Relación con Otros Repositorios del Ecosistema SGRAI

- **`sgrai-api`:** Expone `POST /api/misiones/{id}/cerrar` (permiso `misiones:terreno:ejecutar`), ejecuta la transacción atómica en PostgreSQL (`reporte_terreno`, `mision`, `cuadrilla`, `usuario`, `recurso`, `cuadrilla_recurso`, `mision_hito`), amplía `GET /api/misiones/{id}` y `GET /api/incidentes/{id}` y emite por Socket.io/Redis los eventos `mision:actualizada`, `incidente:actualizado`, `cuadrilla:actualizada` y `recurso:actualizado`.
- **`sgrai-pwa` (`web-app`):** Provee el formulario móvil y soporte *offline* para que el Delegado de Cuadrilla capture el resumen de faenas, materiales consumidos, horas hombre, estado final del terreno y evidencia multimedia (manual `H68-cierre-mision-cuadrilla.md` en `web-app/docs/manuales-usuario/`).
