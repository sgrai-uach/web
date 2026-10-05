# Manual de Usuario: HU-52 — Recepción y Verificación de Avisos por Operador de Call Center

- **Código de Historia:** HU-52
- **Rol Destinatario:** Operador de Call Center (Mesa de Ayuda y Recepción Ciudadana)
- **Repositorio:** `sgrai-web`
- **Módulo:** Centro Call Center (`/callcenter`)

---

## 1. Objetivo de la Funcionalidad

Proporcionar al Operador de Call Center una bandeja de entrada consolidada y en tiempo real para visualizar los avisos de emergencias reportados por la ciudadanía (vía portal web, chatbot o teléfono), priorizarlos mediante un semáforo de antigüedad, inspeccionar su georreferenciación y evidencia multimedia, y resolverlos mediante la **verificación y envío a Operaciones (Encargado)** o su **descarte fundado**.

---

## 2. Flujo de Trabajo Operativo

```
       [Ciudadano / Canal]
               │ (Aviso nuevo)
               ▼
   [Bandeja Call Center (WebSockets)]
               │
      Semáforo de Espera:
      🟢 < 15m | 🟡 15-30m | 🔴 > 30m
               │
               ▼
     [Inspección de Detalle]
     - Datos del informante (botón llamada tel:)
     - Mapa interactivo Leaflet (Valdivia)
     - Fotos adjuntas
               │
       ┌───────┴─────────────────┐
       ▼                         ▼
 [Verificar y Enviar]       [Descartar Aviso]
 - Tipología oficial        - Justificación ≥ 5 chars
 - Toggle FIBE Social       - Cierre definitivo
       │
       ▼
 [Incidente Formal Creado]
 Folio INC-2026-XXXX
 Visible para el Encargado
```

### Paso 1: Ingreso a la Bandeja de Entrada
1. Inicie sesión en la plataforma `sgrai-web` e ingrese a la ruta `/callcenter`.
2. En la barra superior, verifique que el indicador de conexión en tiempo real se encuentre en **"En vivo (WebSockets)"**.
3. Confirme el **Operador Activo** asignado a su puesto de trabajo (o seleccione su usuario en el desplegable superior para fines de trazabilidad y auditoría).

### Paso 2: Priorización por Semáforo de Espera
La tabla de avisos muestra automáticamente los minutos transcurridos desde que el informante registró la emergencia:
- **🟢 Verde (< 15 min):** Atención dentro del rango estándar de despacho.
- **🟡 Amarillo (15 a 30 min):** Precaución; prioridad intermedia de atención.
- **🔴 Rojo Urgente (> 30 min):** Alerta prioritaria crítica; requiere atención inmediata por parte de los operadores disponibles.

Puede utilizar la barra de filtros superior para filtrar por **Canal de Origen** (`Portal Web`, `Chatbot`, `Teléfono`) o por **Prioridad**.

### Paso 3: Revisión Detallada del Aviso
1. En la fila del aviso a gestionar, haga clic en el botón **"Revisar Aviso &rarr;"**.
2. Se desplegará el modal interactivo con:
   - **Datos del informante:** Nombre, RUT, teléfono (con enlace interactivo `📞 Iniciar Llamada al Informante`) y dirección referencial.
   - **Mapa georreferenciado:** Visor Leaflet centrado en la ubicación exacta con marcador municipal e hipervínculo a OpenStreetMap.
   - **Evidencia multimedia:** Galería de fotografías tomadas en terreno por el informante (con posibilidad de clic para vista ampliada).
   - **Descripción original:** Texto reportado por el ciudadano.

### Paso 4: Opción A — "Verificar y Enviar" a Operaciones (Encargado)
Si el aviso corresponde a un incidente real y verosímil:
1. Seleccione la **Tipología Oficial del Incidente** en el menú desplegable (ej. *Inundación / Anegamiento de Viviendas*, *Caída de árbol*, *Deslizamiento de tierra*).
2. Ajuste o complete la **Descripción Formal para Centro de Mando** con los datos recabados en la llamada telefónica con el informante.
3. Si el caso involucra familias con afectación en sus hogares, active la casilla:
   - **"Requiere Asistencia Social (Levantamiento Ficha FIBE)"**. Esto alertará automáticamente al equipo de Asistentes Sociales municipales.
4. Haga clic en **"✔ Verificar y Enviar a Operaciones"**.
5. El sistema generará el incidente formal con folio oficial (ej. `INC-2026-0001`), notificará un mensaje Toast de éxito y removerá el aviso de la bandeja.

### Paso 5: Opción B — "Descartar" Aviso (Información falsa / duplicada)
Si el aviso es una broma, un reporte duplicado o carece de veracidad:
1. Haga clic en el enlace **"¿Desea descartar este aviso?"**.
2. En el área de justificación, ingrese el **Motivo de Descarte** (obligatorio, mínimo 5 caracteres). Ejemplo: *"Reporte duplicado verificado previamente con el folio INC-2026-0004"*.
3. Haga clic en **"Confirmar Descarte de Aviso"**.
4. El aviso pasará a estado `DESCARTADO` y se eliminará de la vista en tiempo real de todos los operadores conectados.

---

## 3. Casos Especiales y Mensajes de Error

| Código / Situación | Mensaje en Pantalla | Causa y Acción a Seguir |
|---|---|---|
| **409 Conflict** | *"Este aviso acaba de ser atendido o resuelto por otro operador."* | Ocurre cuando dos operadores abren el mismo aviso simultáneamente y el otro operador confirma primero. El sistema previene duplicados, cierra el modal automáticamente y refresca la bandeja. No requiere acción adicional. |
| **401 Unauthorized** | *"No autorizado: Se requiere una sesión válida de operador."* | Falta la cabecera `X-User-Id`. Verifique que el selector de operador en la barra superior esté asignado correctamente. |
| **400 Bad Request** | *"El motivo de descarte debe contener al menos 5 caracteres justificativos."* | La justificación escrita para descartar el aviso es demasiado corta o está vacía. Ingrese una explicación detallada. |
| **Desconexión Socket** | *"Conectando..." (Punto amarillo)* | Interrupción temporal de red o del servidor WebSocket. Los avisos aún pueden cargarse mediante el botón manual **"Actualizar"**. La reconexión es automática. |

---

## 4. Relación con Otros Módulos y Repositorios

- **`sgrai-api`:** Es el único origen de datos y lógica. Realiza la transacción atómica PostgreSQL que convierte el aviso en incidente e inserta la auditoría del operador responsable.
- **Centro de Mando (`sgrai-web` - Rol Encargado):** Al verificar el aviso con éxito, el incidente aparece de inmediato en el tablero Kanban y mapa general del Encargado para la asignación de patrullas verificadoras o cuadrillas de emergencia.
- **Panel Asistente Social (`sgrai-web`):** Si se marcó la casilla de Asistencia Social (FIBE), el incidente quedará registrado con el indicador correspondiente para el levantamiento de ayuda humanitaria y subsidios de emergencia.
