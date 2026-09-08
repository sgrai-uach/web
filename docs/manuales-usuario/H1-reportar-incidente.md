# Manual de Usuario: H1 - Reportar Incidente (Chatbot Conversacional)

Este manual documenta el uso del **Portal Informante** para el reporte ágil de incidentes comunales mediante el asistente conversacional (chatbot) del Sistema de Gestión de Recursos para Atención de Incidentes (SGRAI) de la Municipalidad de Valdivia.

---

## 1. Información General

- **Rol al que está dirigido:** Informante (Ciudadano / Vecino de la comuna de Valdivia).
- **Objetivo de la funcionalidad:** Permitir al ciudadano reportar incidentes o emergencias comunales de forma guiada, secuencial y rápida, reduciendo errores en el ingreso de datos y facilitando la pronta respuesta de los equipos de la Dirección de Gestión de Riesgos de Desastres (DGRD).
- **Acceso:** Directamente desde la dirección principal del sitio web (`/`).

---

## 2. Flujo de Reporte Paso a Paso

El reporte se realiza a través de un diálogo interactivo guiado por el asistente virtual:

### Paso 1: Bienvenida e Identificación del Tipo de Afectación
Al ingresar a la plataforma, el asistente presentará un mensaje institucional de bienvenida y desplegará una serie de botones o fichas de opción rápida (*chips*):
- **Anegamiento**
- **Caída de árbol**
- **Corte de energía**
- **Deslizamiento**
- **Daño estructural**
- **Corte de agua potable**
- **Otro**

> Selecciona la opción que mejor describa la situación observada.

![Paso 1: Selección de Tipo de Afectación](./assets/H1-reportar-incidente/01-tipo-afectacion.png)

---

### Paso 2: Ubicación o Dirección del Incidente
El asistente solicitará la ubicación del suceso:
1. En el campo de texto ubicado al pie del chat, ingresa la calle, número y sector o referencias clave en la comuna de Valdivia (ejemplo: *Av. Alemania 550* o *Los Boldos con Las Encinas, Isla Teja*).
2. Presiona el botón **Enviar** o la tecla *Enter*.
3. El sistema verificará que la dirección contenga información suficiente (mínimo 5 caracteres).

![Paso 2: Dirección del Incidente](./assets/H1-reportar-incidente/02-direccion.png)

---

### Paso 3: Detalle o Descripción Adicional (Opcional)
El asistente consultará si deseas agregar más información sobre el estado del incidente:
- Puedes redactar una breve descripción en el campo de texto y presionar **Enviar**.
- Si no posees más detalles, puedes presionar el botón **Omitir detalle** para avanzar sin demora.

---

### Paso 4: Nombre Completo del Informante
Para formalizar el registro del aviso:
1. Ingresa tu nombre y apellido en el campo de texto.
2. Presiona **Enviar**.

---

### Paso 5: RUT del Informante (Validación Módulo 11)
El asistente solicitará tu cédula de identidad:
1. Ingresa tu RUT chileno con o sin puntos y con guión (ejemplo: `11.111.111-1` o `11111111-1`).
2. El sistema valida automáticamente el dígito verificador. Si cometes un error tipográfico, el asistente te lo indicará de inmediato para que lo corrijas antes de avanzar.

---

### Paso 6: Teléfono de Contacto (Estrictamente Obligatorio)
Para coordinar la atención y permitir que las patrullas o la central municipal te contacten ante cualquier duda en terreno:
1. Ingresa tu número de teléfono móvil o fijo (ejemplo: `+56912345678` o `912345678`).
2. El sistema valida que el número posea el formato chileno válido. Este campo es **obligatorio** y no puede omitirse.

---

### Paso 7: Revisión en Tarjeta de Resumen
Antes del ingreso definitivo al sistema, el asistente presentará una tarjeta con el resumen completo de los datos proporcionados:
- Tipo de afectación
- Dirección del evento
- Detalle adicional
- Nombre del informante
- RUT
- Teléfono de contacto

Opciones disponibles:
- **Confirmar y Enviar Reporte:** Envía el requerimiento al sistema municipal.
- **Modificar datos:** Permite reiniciar la conversación para corregir cualquier dato antes de enviarlo.

![Paso 7: Resumen y Confirmación](./assets/H1-reportar-incidente/03-resumen.png)

---

### Paso 8: Confirmación y Número de Seguimiento

Una vez enviado el reporte, se presentará uno de los siguientes dos escenarios:

#### Caso A: Nuevo Reporte Registrado
Si es la primera vez que se reporta el incidente en la zona:
- Se muestra un mensaje de recepción exitosa.
- Se entrega un **Código de Seguimiento numérico de 8 dígitos** destacado (ejemplo: `84920194`).
- Puedes presionar el botón **Copiar código** para guardarlo en tu portapapeles.

![Paso 8: Confirmación de Nuevo Reporte](./assets/H1-reportar-incidente/04-exito.png)

#### Caso B: Incidente Duplicado / Previamente Reportado (Modelo SAESA)
Si en tu sector ya se había registrado un incidente del mismo tipo dentro de las últimas 24 horas:
- El sistema **no** mostrará una alerta de error ni advertencia negativa.
- Te informará con un mensaje tranquilizador que los equipos municipales ya están al tanto de la situación y que tu aviso ha sido sumado al caso en curso para reforzar la prioridad.
- Se te asociará al **mismo número de seguimiento** del incidente existente.

---

## 3. Casos Especiales y Funcionalidades de Seguridad

### Botón de Emergencia Telefónica (Call Center)
- En la esquina superior derecha de la barra superior encontrarás siempre visible un botón destacado con el texto **"Call Center 📞"**.
- Si te encuentras ante una situación de peligro inminente para la vida de las personas o requieres asistencia de emergencia inmediata, pulsa este botón para iniciar una llamada telefónica directa con el Call Center de emergencias municipal (1451).

### Persistencia del Borrador ante Cortes de Conexión
- Si pierdes la conexión a internet o recargas accidentalmente la página mientras completas las preguntas, tus respuestas se mantendrán guardadas en tu navegador para que no tengas que escribir todo de nuevo.

---

## 4. Relación con Otros Módulos del Sistema SGRAI

- **`sgrai-api`:** Recibe los datos del aviso en el endpoint `POST /api/incidentes/avisos`, geocodifica la dirección en la comuna de Valdivia y ejecuta la verificación espacial mediante PostGIS para detectar duplicados en un radio de 300 metros y ventana de 24 horas.
- **`sgrai-pwa`:** Tras la recepción y verificación, el incidente se distribuye a las Patrullas Verificadoras y Cuadrillas en terreno para su atención física.
- **`sgrai-web` (Centro Call Center y Centro de Mando):** El aviso ingresado se visualiza inmediatamente en la bandeja de recepción y en el mapa operacional para que los encargados gestionen los recursos municipales correspondientes.
