# Manual de Usuario: H35 — Monitoreo de Notificación y Trazabilidad de ACKs en Centro de Mando

> **Módulo:** Centro de Mando e Incidentes  
> **Historia de Usuario:** HU-35 / H35 — Monitoreo de Notificación y Trazabilidad de Misión a Patrulla  
> **Rol Destinatario:** Encargado de Operaciones / Centro de Mando (DGRD) y Administrador Municipal  
> **Sistema:** SGRAI — Dirección de Gestión de Riesgos de Desastres, Municipalidad de Valdivia  
> **Ruta de Acceso:** `/gestion/centro-incidentes`

---

## 1. Información General

- **Rol al que está dirigido:** Encargado de Operaciones (Centro de Mando) y Administrador Municipal con acceso al tablero operativo.
- **Objetivo de la funcionalidad:** Permitir al Encargado monitorear en tiempo real si una patrulla verificadora despachada recibió (`RECIBIDA`) y leyó (`LEIDA`) la orden táctica en terreno, o identificar de inmediato si el dispositivo móvil se encuentra sin señal o fuera de cobertura (`PENDIENTE_ENVIO`), sin necesidad de recargar el navegador.
- **Puntos de visualización en la plataforma web:**
  1. Tarjetas del Tablero Kanban (`IncidenteCard`) en `/gestion/centro-incidentes`.
  2. Panel lateral deslizante de detalle del incidente (`IncidenteDetalleDrawer`), tanto en el banner resumen superior como en la sección *"Misiones y Equipos en Terreno"*.
  3. Tabla del modal de listado de misiones operativas (`MisionesTabla`).

---

## 2. Estados de Trazabilidad e Indicadores Visuales

El sistema representa el avance de entrega y lectura de la orden táctica mediante cuatro estados oficiales y un estado preventivo previo al primer acuse:

| Estado del Sistema | Indicador en Tarjeta Kanban | Badge en Detalle de Misión | Estado en Línea de Tiempo | Significado Operativo |
|---|---|---|---|---|
| **Sin acuse previo** | `SIN ACUSE` — *Lectura aún no confirmada* | Aviso `SIN CONFIRMACIÓN DE LECTURA` | N/A | La misión está en verificación o activa, pero todavía no se registra confirmación desde el móvil. |
| **`PENDIENTE_ENVIO`** | `NO LEÍDA` — *Sin señal / offline* | `Patrulla sin señal / offline` | Paso 1: *Sin señal (en cola)* (*En espera de red*) | La orden quedó en cola porque la patrulla no tiene conexión activa al momento del despacho. |
| **`ENVIADA`** | `NO LEÍDA` — *Alerta emitida al móvil* | `Alerta emitida al móvil` | Paso 1 confirmado + Paso 2: *Esperando acuse* | El servidor emitió la alerta hacia el dispositivo en terreno; aún no se recibe acuse técnico de llegada. |
| **`RECIBIDA`** | `RECIBIDA (SIN LEER)` — *Recibida · pendiente lectura* | `Recibida en móvil de terreno` | Pasos 1 y 2 confirmados + Paso 3: *Esperando lectura* | La PWA en terreno confirmó la recepción técnica del aviso (`ACK RECIBIDA`), pero el operador aún no abre la orden. |
| **`LEIDA`** | `LEÍDA` — *Leída por operador en terreno* | `Leída por operador en terreno` | 3 pasos confirmados con riel continuo (*Confirmado*) | El operador en terreno abrió explícitamente la misión presionando **"Ver Misión"** (`ACK LEIDA`). |

---

## 3. Flujo Operativo Paso a Paso

### Paso 1: Despacho de la Patrulla Verificadora
1. Inicie sesión con perfil **Encargado** o **Administrador** e ingrese a `/gestion/centro-incidentes`.
2. Abra un incidente en estado **`REPORTADO`** y presione **"Asignar Patrulla"** (para el flujo completo de selección y despacho, consulte el manual [`H20-asignar-patrulla-verificadora.md`](./H20-asignar-patrulla-verificadora.md)).
3. Al confirmar el despacho, el sistema toma el estado inicial de notificación retornado por la API (o asume `PENDIENTE_ENVIO` si la unidad está sin conexión) y lo registra inmediatamente en el tablero y en el drawer sin recargar la página.

### Paso 2: Lectura Rápida desde el Tablero Kanban
1. En la columna **"En Verificación"** del tablero Kanban, ubique la tarjeta del incidente despachado.
2. En la parte inferior de la tarjeta observará el bloque destacado de trazabilidad:
   - Si el bloque indica **`NO LEÍDA`** o **`RECIBIDA (SIN LEER)`**, sabrá de inmediato que el operador todavía no ha leído la instrucción táctica.
   - Cuando la orden sea abierta en terreno, el bloque cambiará automáticamente a **`LEÍDA` — *Leída por operador en terreno*** en tono verde azulado institucional.

### Paso 3: Inspección Detallada y Línea de Tiempo en el Drawer
1. Haga clic sobre cualquier tarjeta del tablero (o presione `Enter` con foco en ella) para abrir el **Panel Lateral Deslizante** (`IncidenteDetalleDrawer`).
2. En la parte superior del cuerpo del drawer verá un **banner resumen de trazabilidad** asociado a la misión de verificación activa, con el código de misión y el nombre de la patrulla asignada.
3. Desplácese hasta la sección **"Misiones y Equipos en Terreno"**. En la tarjeta de la misión encontrará:
   - El encabezado descriptivo de lectura (por ejemplo, `ORDEN NO LEÍDA POR PATRULLA` o `LECTURA CONFIRMADA EN TERRENO`).
   - El badge semántico oficial de estado.
   - La **línea de tiempo horizontal conectada** con tres hitos cuadrados (`Emitida al móvil` / `Sin señal (en cola)`, `Recibida en móvil` y `Leída por operador`), mostrando con línea continua las etapas confirmadas y con línea segmentada la etapa en espera.

### Paso 4: Seguimiento desde el Modal de Misiones
1. Al abrir el modal de **Misiones Operativas** desde el Centro de Mando, cada fila en la tabla muestra debajo del estado de la misión una etiqueta compacta con el estado de lectura actual cuando existe trazabilidad registrada.

### Paso 5: Sincronización en Tiempo Real (WebSocket)
1. El tablero y el drawer mantienen suscripción activa al evento WebSocket **`notificacion:trazabilidad_actualizada`**.
2. Cada vez que el dispositivo en terreno cambia el estado (`PENDIENTE_ENVIO` -> `ENVIADA` -> `RECIBIDA` -> `LEIDA`), las tarjetas del Kanban, el drawer abierto y la tabla de misiones se actualizan de manera automática sin presionar `F5`.
3. Si cierra y vuelve a abrir el drawer de un incidente dentro de la misma sesión del navegador, el sistema conserva el último estado de trazabilidad recibido en caché local (`localStorage`).

---

## 4. Casos Especiales y Recomendaciones Operativas

### A. Patrulla sin Señal / Fuera de Cobertura (`PENDIENTE_ENVIO`)
* **Comportamiento:** Tanto la tarjeta Kanban como el primer nodo de la línea de tiempo muestran el ícono de desconexión (`WifiOff`) con el texto `Sin señal / offline` y *En espera de red*.
* **Acción recomendada:** Considere que la patrulla podría encontrarse en un sector rural o zona sin cobertura celular (ej. sectores costeros o cordilleranos). Si el incidente tiene prioridad **`CRITICA`** o **`ALTA`**, utilice contacto radial VHF municipal o llamada telefónica directa al líder de patrulla mientras el servidor reintenta el envío automático.

### B. Orden Recibida pero No Leída (`RECIBIDA`)
* **Comportamiento:** El móvil en terreno recibió técnicamente el paquete en segundo plano, pero el operador no ha presionado **"Ver Misión"** en su pantalla.
* **Acción recomendada:** Monitoree brevemente si el tercer nodo (*Leída por operador*) pasa a `Confirmado`. De mantenerse en *Esperando lectura* ante una emergencia urgente, comuníquese por radio con la unidad para confirmar recepción operativa.

### C. Misión Activa con Etiqueta `SIN ACUSE`
* **Comportamiento:** Aparece un recuadro con borde segmentado indicando *SIN ACUSE: Lectura aún no confirmada* cuando una misión con patrulla asignada se encuentra activa (`PLANIFICADA`, `DESPACHADA` o `EN_CURSO`) pero el navegador aún no ha recibido el estado de trazabilidad de la notificación.
* **Acción recomendada:** Verifique que el indicador de conexión en la cabecera del Centro de Mando señale conexión activa en tiempo real o utilice el botón **"Actualizar"** del panel superior para resincronizar el tablero.

### D. Acceso Restringido (`403 Forbidden`)
* **Comportamiento:** Si un usuario sin permisos de Encargado intenta acceder al Centro de Mando, el sistema bloqueará la vista mostrando la pantalla de acceso denegado correspondiente a permisos insuficientes.

---

## 5. Relación con Otros Repositorios del Sistema

- **`sgrai-api`:** Emite y persiste la notificación al crear misiones (`POST /api/misiones`), procesa los acuses recibidos mediante el evento `notificacion:ack` y distribuye las actualizaciones de estado por Socket.io mediante `notificacion:trazabilidad_actualizada` hacia la sala de la misión (`mision:{misionId}`) y hacia los encargados en el Centro de Mando.
- **`sgrai-pwa`:** Aplicación móvil en terreno operada por la patrulla verificadora. Envía automáticamente el acuse técnico **`RECIBIDA`** al recepcionar la notificación push/socket y emite el acuse operativo **`LEIDA`** cuando el operador presiona **"Ver Misión"** en su dispositivo.
