# Manual de Usuario: H2 - Panel de Seguimiento de Incidentes para Informantes

Este manual documenta el uso del **Panel de Seguimiento** del Sistema de Gestión de Recursos para Atención de Incidentes (SGRAI) de la Municipalidad de Valdivia, diseñado para que los vecinos informantes consulten el avance de su reporte en tiempo real.

---

## 1. Información General

- **Rol al que está dirigido:** Informante (Ciudadano / Vecino de la comuna de Valdivia).
- **Objetivo de la funcionalidad:** Permitir al informante conocer el estado actual y la evolución de la atención de su incidente reportado en tiempo real, mediante un código numérico único de 8 dígitos, visualizando las etapas operativas del ciclo de vida ICS sin exponer datos personales confidenciales.
- **Acceso:**
  - **Acceso directo vía enlace:** Mediante el link único compartido tras registrar el reporte (por SMS, WhatsApp o chatbot conversacional): `/seguimiento/[codigo]` (ejemplo: `/seguimiento/58291045`).
  - **Acceso por buscador general:** Desde la página de consulta manual `/seguimiento`.

---

## 2. Flujo de Consulta Paso a Paso

### Opción A: Consulta Directa mediante Enlace Único

Si recibiste un enlace directo vía SMS, correo o al finalizar tu reporte en el portal:
1. Haz clic en el enlace entregado.
2. El sistema abrirá inmediatamente la pantalla de detalle correspondiente a tu número de caso.
3. Se desplegará la línea de tiempo con la etapa actual del incidente y la tarjeta de resumen con la información operativa.

![Consulta Directa](./assets/H2-panel-seguimiento/01-detalle-seguimiento.png)

---

### Opción B: Búsqueda Manual con Código de Seguimiento

Si dispones de tu código numérico de 8 dígitos (ejemplo: `58291045`) y accedes directamente a `/seguimiento`:

1. Ingresa a la sección `/seguimiento`.
2. En el recuadro **"Ingresa el Código de Seguimiento de tu Reporte"**, escribe tu código numérico de 8 dígitos. El campo solo acepta números y valida el largo automáticamente.
3. Presiona el botón **Consultar Estado**.
4. Serás redirigido automáticamente a la vista de seguimiento de tu caso.

![Búsqueda por Código](./assets/H2-panel-seguimiento/02-buscador-codigo.png)

---

## 3. Interpretación de la Pantalla de Seguimiento

La vista de detalle se compone de dos secciones principales diseñadas con la identidad visual institucional:

### 1. Indicador de Progreso (Ciclo de Vida ICS)
Presenta una barra de 4 hitos secuenciales que reflejan el avance de la atención:
- **1. Reportado:** El aviso fue recibido por el sistema y está registrado en la bandeja municipal.
- **2. Verificando:** Una patrulla verificadora municipal se dirige al sector o está evaluando la magnitud física de la emergencia en terreno.
- **3. En Atención:** El incidente fue confirmado y una cuadrilla operativa con recursos técnicos (maquinaria, cuadrilla de aseo o emergencia) se encuentra trabajando activamente en el lugar.
- **4. Resuelto / No Abordable:**
  - *Resuelto:* La emergencia fue controlada y solucionada por el personal municipal.
  - *No Abordable:* El requerimiento no pudo ser abordado por el municipio (ejemplo: competencia exclusiva de empresas de servicios básicos como tendido eléctrico de alta tensión, o predio privado sin facultades legales), indicando claramente el motivo entregado por la central.

### 2. Tarjeta de Resumen Operativo
Muestra los datos esenciales del reporte resguardando la privacidad de las personas (sin exponer RUT, número telefónico ni nombres de funcionarios):
- **Código de Seguimiento:** Con botón directo para copiarlo al portapapeles.
- **Insignia y Descripción del Estado:** Texto explicativo en lenguaje ciudadano redactado oficialmente por la Dirección de Gestión de Riesgos de Desastres.
- **Tipo de Afectación:** Categoría reportada (ej. *Anegamiento*, *Caída de árbol*).
- **Ubicación Referencial:** Calle y sector de la emergencia.
- **Fecha y Hora:** Registro original y última hora de actualización.
- **Detalle ingresado:** Notas adicionales agregadas por el vecino.

---

## 4. Actualización Automática en Tiempo Real (En Vivo)

El panel incorpora conexión continua vía WebSocket con el servidor municipal:
- **Sin recargar la página:** Cuando un operador de la central o una cuadrilla en terreno cambia el estado del incidente, el panel actualizará automáticamente la etapa activa, el texto explicativo y la fecha de última actualización.
- **Indicador "Actualizado en vivo":** Cuando se reciba una modificación mientras tienes la pantalla abierta, se encenderá un indicador visual verde con una sutil animación para informarte que los datos fueron actualizados en ese mismo instante.

---

## 5. Casos Especiales y Manejo de Errores

### Código Erróneo o No Encontrado (Error 404)
Si ingresas un código inexistente o te equivocas al escribirlo:
- El sistema presentará una pantalla clara y amigable: *"No encontramos ningún reporte con el código ingresado. Por favor, verifica el número entregado por el asistente."*
- Podrás presionar el botón **"Buscar otro código"** para reintentar.
- Si consideras que se trata de una urgencia mayor o tienes dudas sobre tu aviso, puedes presionar directamente el botón rojo **"Llamar al Call Center (1451)"** para comunicarte por teléfono con el operador de turno.

### Política de No Caducidad
- Los códigos de seguimiento **no expiran**.
- Si consultas un caso que ya finalizó hace días o semanas, el sistema responderá exitosamente mostrando el estado de cierre (`RESUELTO` o `NO_ABORDABLE`) junto con su fecha oficial de término.

### Casos Duplicados en el Mismo Sector
- Si tu reporte coincidió con una emergencia previamente reportada por otro vecino en tu sector dentro de las últimas 24 horas, el sistema te mostrará una nota destacada en azul indicando que tu aviso se sumó a la coordinación existente para aumentar la prioridad del sector.

---

## 6. Relación con Otros Módulos del Sistema SGRAI

- **`sgrai-api`:** Es el único origen de datos. Expone el endpoint `GET /api/incidentes/avisos/seguimiento/{codigo}` y gestiona la sala de Socket.io `sala:seguimiento:{codigoSeguimiento}` donde emite el evento `incidente:estado_actualizado`.
- **`sgrai-pwa`:** Cuando las Patrullas Verificadoras y Cuadrillas en terreno completan o cambian el estado de una misión en su aplicación móvil, ese cambio se replica de inmediato en este panel web sin intervención manual adicional.
- **`sgrai-web` (Centro de Mando y Call Center):** Los despachadores municipales visualizan el caso en el mapa operacional y coordinan los recursos que modifican este estado.
