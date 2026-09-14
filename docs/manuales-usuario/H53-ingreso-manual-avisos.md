# Manual de Usuario: H53 - Ingreso Manual de Incidentes (Call Center)

Este manual documenta el uso del módulo de **Ingreso Manual de Reportes** en el Sistema de Gestión de Recursos para Atención de Incidentes (SGRAI) de la Municipalidad de Valdivia, diseñado para los operadores del rol **Call Center** (Mesa 1451) y recepción de avisos de funcionarios en terreno.

---

## 1. Información General

- **Rol al que está dirigido:** Call Center (Operadores de la Mesa Central 1451) y Administrador.
- **Objetivo de la funcionalidad:** Permitir al operador registrar inmediatamente un incidente recibido vía llamada telefónica o reportado directamente por un funcionario en terreno, garantizando su autoverificación implícita, detección interactiva de duplicados y traspaso directo al Encargado en estado `SIN_ATENDER`.
- **Acceso:** Desde la barra de navegación del Centro Call Center presionando el botón **"➕ Nuevo Reporte Manual"** o ingresando directamente a la ruta:
  ```
  /callcenter/manual
  ```

---

## 2. Flujo de Ingreso Manual Paso a Paso

### Paso 1: Selección del Origen del Reporte
Al ingresar al formulario, el operador debe identificar la procedencia de la información mediante los dos bloques superiores:
1. **Llamada Telefónica (📞):** Selecciona esta opción si el aviso proviene de un vecino o ciudadano comunicándose vía línea telefónica (Mesa 1451 de Valdivia).
2. **Funcionario en Terreno (👷):** Selecciona esta opción si la novedad fue transmitida por una patrulla, cuadrilla u otro funcionario municipal desplegado en la comuna.

![Paso 1: Selección de Origen](./assets/H53-ingreso-manual-avisos/01-origen-reporte.png)

---

### Paso 2: Tipo de Afectación y Nivel de Prioridad
1. **Tipo de Afectación:** Selecciona en el menú desplegable la tipología del incidente (*Anegamiento*, *Caída de árbol*, *Corte de energía*, *Deslizamiento*, *Daño estructural*, *Corte de agua potable*, etc.). Este catálogo se sincroniza dinámicamente con el servidor municipal.
2. **Prioridad Operativa:** Clasifica la urgencia en **BAJA**, **MEDIA** (por defecto), **ALTA** o **CRÍTICA ⚠️** según la gravedad y el riesgo potencial para vidas o viviendas.

![Paso 2: Tipo y Prioridad](./assets/H53-ingreso-manual-avisos/02-tipo-prioridad.png)

---

### Paso 3: Ubicación y Mini-Mapa Interactivo de Valdivia
El sistema combina geocodificación inteligente por texto y fijación cartográfica:
1. **Dirección escrita:** Escribe la calle, número, sector o referencias en el campo *Dirección o Referencia en Valdivia* (mínimo 5 caracteres, ej. *Av. Alemania 550* o *Picarte con Pedro Montt*).
   > **Nota:** No es estrictamente necesario marcar el mapa; si solo ingresas la dirección, el servidor de geocodificación de Valdivia calculará las coordenadas de forma automática.
2. **Mini-mapa interactivo (Opcional):** Si el operador o el informante conocen el punto exacto, puedes hacer clic sobre el mapa centrado en Valdivia o arrastrar el marcador con esquinas rectas (`#1B6F7D`) para afinar las coordenadas GPS de latitud y longitud.
3. **Botón Centrar Valdivia:** Restablece la vista cartográfica al centro cívico de la comuna.
4. **Botón Limpiar GPS:** Elimina el pin manual y deja que el sistema geocodifique según el texto de la dirección.

![Paso 3: Ubicación y Mapa](./assets/H53-ingreso-manual-avisos/03-direccion-mapa.png)

---

### Paso 4: Pre-alerta de Duplicados en Tiempo Real
Mientras el operador escribe la dirección y selecciona el tipo de afectación, el sistema ejecuta una consulta en segundo plano:
- Si no existen reportes cercanos, el formulario no muestra advertencias.
- Si se detectan reportes coincidentes dentro de las últimas 24 horas y a menos de 300 metros, aparecerá un **banner de advertencia preventivo amarillo**:
  ```
  ⚠️ Atención: Posible incidente duplicado detectado
  Se identificaron X reporte(s) del mismo tipo a aproximadamente Y metros en las últimas 24 horas.
  ```
  Este aviso es informativo y **no bloquea** el avance del formulario.

---

### Paso 5: Descripción de la Emergencia
Redacta en el campo de texto los detalles indispensables de la situación observada (mínimo 5 caracteres): personas involucradas, presencia de agua en el interior de viviendas, cables caídos, postes inclinados, etc.

---

### Paso 6: Identificación del Informante (Validación RUT Chileno)
Para mantener la trazabilidad y formalidad del registro:
1. **Nombre Completo:** Ingresa nombre y apellido del informante (mínimo 3 caracteres).
2. **RUT Chileno (Obligatorio):** Ingresa el RUT con o sin puntos y con dígito verificador. El sistema formatea automáticamente el texto (`12345678-K`) y valida en tiempo real el algoritmo **Módulo 11**. Si el dígito es incorrecto, el campo se iluminará en rojo indicando el error antes del envío.
3. **Teléfono de Contacto (Opcional):** Si el informante dispone de número telefónico, ingrésalo para facilitar que las cuadrillas o el encargado se comuniquen en caso de requerir referencias en terreno.

---

### Paso 7: Envío y Notificación Inmediata al Encargado
Presiona el botón principal:
```
[ ✓ Guardar y Notificar al Encargado ]
```
El sistema validará todos los datos en cliente e interactuará con el servidor para autoverificar el aviso y promoverlo a incidente.


---

## 3. Manejo de Escenarios y Casos Especiales

### Escenario A: Creación Exitosa (HTTP 201 Created)
Cuando el reporte es nuevo y no presenta duplicidad:
1. El formulario se oculta y se presenta la **Tarjeta de Confirmación de Éxito**.
2. Se muestra de forma destacada:
   - **Código de Incidente (Encargado):** Correlativo oficial (ej. `INC-0042`).
   - **Código de Seguimiento del Aviso:** Folio numérico de 8 dígitos (ej. `84920194`).
   - Resumen del tipo de afectación, prioridad y dirección.
3. El registro queda automáticamente indexado en la tabla de incidentes en estado **`SIN_ATENDER`**, emitiendo un evento en tiempo real que alerta al Encargado.
4. Botón **"➕ Ingresar otro reporte"**: Restablece el formulario para atender una nueva llamada.

![Escenario A: Éxito](./assets/H53-ingreso-manual-avisos/04-exito.png)

---

### Escenario B: Conflicto de Duplicados Detectado (HTTP 409 Conflict)
Si en la misma zona ya existe un reporte o incidente vigente del mismo tipo:
1. El sistema detiene la inserción automática y despliega el **Modal de Confirmación de Duplicados**.
2. En una tabla comparativa se presentan los incidentes previos: código (`INC-XXXX` o `Aviso`), dirección, distancia en metros y estado actual.
3. El operador dispone de dos opciones:
   - **Botón "Omitir reporte" (Recomendado):** Cierra el modal y limpia el formulario, evitando duplicar requerimientos a las cuadrillas en terreno.
   - **Botón "Continuar de todos modos":** Fuerza la creación (`forzarCreacion: true`) si el operador constata con el vecino que se trata de un suceso independiente no abordado previamente.

![Escenario B: Modal de Duplicados](./assets/H53-ingreso-manual-avisos/05-modal-duplicados.png)

---

### Escenario C: Errores de Validación (HTTP 400) o Permisos (HTTP 403)
- **Campos incompletos o inválidos:** Se resaltan en rojo con bordes sólidos y una leyenda aclaratoria bajo el campo correspondiente.
- **Sin permisos:** Si el operador no cuenta con el rol Call Center, se desplegará una barra roja de advertencia: *"Acceso restringido: El operador no posee el permiso crear_incidente_manual"*.

---

## 4. Relación con Otros Módulos del Sistema SGRAI

- **`sgrai-api`:** Ejecuta la transacción atómica en PostgreSQL/Kysely, insertando el registro en `aviso_incidente`, promoviéndolo de inmediato a `incidente` en estado `SIN_ATENDER`, ejecutando la búsqueda espacial con PostGIS y emitiendo el evento WebSocket `incidente:creado`.
- **`sgrai-web` (Centro de Mando del Encargado):** Al emitirse el socket a la sala `sala:encargados`, el incidente aparece de inmediato en la tabla de despacho para que el Encargado asigne cuadrillas o recursos sin demora.
- **`sgrai-pwa` (Terreno):** Una vez que el Encargado despacha los recursos, la misión llega directamente a las aplicaciones móviles de las Patrullas Verificadoras y Cuadrillas.
