# Manual de Usuario: H30 - Crear Evento Manual de Prevención y Despacho a Puntos Críticos

Este manual documenta el funcionamiento y uso de la funcionalidad para la creación de **Eventos Manuales de Prevención Territorial y Despacho de Patrullas Verificadoras a Puntos Críticos** en la plataforma web del Sistema de Gestión de Recursos para Atención de Incidentes (SGRAI) de la Municipalidad de Valdivia.

---

## 1. Información General

- **Rol al que está dirigido:** Encargado de Operaciones / Jefe de Centro de Mando (y Administrador General de la Dirección de Gestión de Riesgos de Desastres).
- **Objetivo de la funcionalidad:** Permitir al Encargado de Operaciones generar eventos preventivos territoriales e instruir labores tácticas de mitigación a patrullas verificadoras sobre puntos críticos georreferenciados (o coordenadas libres) en Valdivia, con asignación opcional de insumos logísticos desde bodega, evitando que ocurran incidentes graves antes o durante eventos meteorológicos o situaciones de riesgo.
- **Ruta de acceso en la plataforma web:** `/gestion/centro-incidentes` (o `/mando`).

---

## 2. Acceso y Control de Permisos (RBAC)

Para operar esta funcionalidad, el sistema valida que el usuario posea la autorización requerida:

| Rol | Permiso Requerido | Resultado Esperable |
|---|---|---|
| **Encargado de Operaciones** | `prevencion:eventos:crear` | **Permitido:** Botón visible y despacho exitoso (`201 Created`). |
| **Administrador General** | `prevencion:eventos:crear` | **Permitido:** Acceso total y despacho de misiones. |
| **Operador Call Center / Otros** | Sin permiso | **Denegado:** Advertencia de permisos insuficientes (`403 Forbidden`). |

---

## 3. Acceso al Formulario de Creación

El formulario se encuentra accesible directamente desde el Centro de Mando del Encargado:

1. Ingresa a **Operaciones &rarr; Centro de Mando** en la barra lateral o mediante la URL `/gestion/centro-incidentes`.
2. En la cabecera superior institucional encontrarás el botón destacado:
   - **"Nuevo Evento de Prevención"** (ícono de escudo de seguridad `ShieldAlert` en color verde menta institucional).
   - Alternativamente, al cambiar a la vista **"Mapa Operativo"**, el botón **"Crear Prevención"** se encuentra disponible en la barra de herramientas cartográfica.
3. Al hacer clic, se abrirá la ventana modal interactiva responsive **"Nuevo Evento de Prevención"**.

---

## 4. Guía Paso a Paso para Registrar un Evento Preventivo

El formulario está estructurado en 4 secciones tácticas:

### Paso 1: Información General de la Operación Preventiva
- **Título / Nombre de la Labor Preventiva (\*):** Identificador conciso de la labor a realizar (3 a 150 caracteres).  
  *Ejemplo:* `"Inspección preventiva y limpieza de sumideros en Angachilla"`.
- **Prioridad Operativa:** Nivel de urgencia (`Baja`, `Media`, `Alta`, `Crítica`). Por defecto: `Media`.
- **Delegación Territorial Municipal (\*):** Selector obligatorio de la delegación responsable (`Delegación Norte`, `Delegación Sur`, `Delegación Costa` o `Delegación Calle Calle`).
- **Instrucciones Tácticas y Detalle de Mitigación (\*):** Campo obligatorio por regla de negocio (5 a 1000 caracteres) donde se indican los objetivos concretos para la patrulla en terreno.  
  *Ejemplo:* `"Monitoreo preventivo del caudal de aguas lluvias, revisión de compuertas y retiro de sedimentos u hojas en sumideros ante alerta temprana de temporal."`

### Paso 2: Ubicación y Georreferenciación (Puntos Críticos)
- **Selector de Punto Crítico Preexistente (Opcional):** Permite vincular el evento a un punto crítico catastrado en el inventario municipal de riesgos.
  - Al seleccionar un punto crítico (ej. `PC-ANG-01`), el formulario:
    1. **Autocompleta las coordenadas GPS** de latitud y longitud en el mapa interactivo.
    2. **Sincroniza la delegación territorial** correspondiente.
    3. Rellena el sector sugerido si no fue ingresado.
    4. Despliega una tarjeta resumen destacando el tipo de riesgo y código municipal.
- **Sector / Barrio de Referencia:** Barrio, población o referencia barrial (ej. *Humedal Angachilla*).
- **Dirección / Hito de Encuentro:** Punto físico de encuentro en terreno (ej. *Av. Simpson con Los Robles*).
- **Mapa Interactivo Leaflet (Obligatorio):** Permite visualizar el punto y hacer clic directamente sobre cualquier sector de Valdivia para fijar o reajustar las coordenadas geográficas de la misión.

### Paso 3: Asignación de Patrulla Verificadora
- **Selector de Patrulla:** Menú desplegable con las patrullas verificadoras registradas en el sistema.
- **Filtro de Disponibilidad:** Activado por defecto para mostrar únicamente patrullas en estado **`DISPONIBLE`**.
- **Cambio de Estado Automático:** Al confirmarse el despacho, la patrulla pasará inmediatamente al estado operativo **`EN_PREVENCION`** y recibirá la misión en su dispositivo móvil.

### Paso 4: Asignación Opcional de Recursos Logísticos
- Si la misión preventiva no requiere materiales, puede dejarse vacía (en prevención los insumos son opcionales).
- Si se necesitan herramientas o insumos (ej. sacos de arena, motobombas, palas):
  1. Haz clic en **"+ Agregar Insumo"**.
  2. Selecciona el recurso desde el catálogo de inventario en bodega.
  3. El sistema muestra una etiqueta con el **stock real disponible** en bodega municipal.
  4. Ingresa la cantidad en unidades enteras.
  5. **Validación de stock:** Si la cantidad solicitada excede el stock en bodega, el sistema marca el error en rojo y bloquea el envío.

### Paso 5: Despacho y Notificación en Tiempo Real
- Haz clic en **"Crear y Despachar Patrulla"**.
- El formulario entrará en estado de envío (`Despachando Operación...`).
- Al completarse exitosamente:
  - Se emitirá una notificación emergente verde (*Toast*):  
    `"Evento de prevención registrado y patrulla despachada exitosamente. Código: PREV-2026-0001"`.
  - El modal se cerrará automáticamente.
  - El tablero de misiones y los contadores se refrescarán sin recargar la página.
  - Si estás en la vista de **Mapa Operativo**, el nuevo evento preventivo aparecerá marcado en tiempo real con su ícono ámbar distintivo de escudo.

---

## 5. Casos Especiales y Solución de Errores

| Código / Mensaje | Causa | Solución Recomendada en UI |
|---|---|---|
| `400 Bad Request` | Faltan campos obligatorios (nombre < 3 car., descripción < 5 car., o delegación sin seleccionar). | Corregir los campos señalados en rojo con sus respectivos mensajes de ayuda. |
| `401 Unauthorized` | Sesión expirada o token ausente. | Redirige al inicio de sesión institucional (`/login`). |
| `403 Forbidden` | El usuario no posee el permiso `prevencion:eventos:crear`. | El sistema muestra un mensaje de alerta: *"No tiene permisos para despachar eventos preventivos"*. |
| `409 Conflict: Patrulla Ocupada` | La patrulla seleccionada fue asignada a otra misión o no está en estado `DISPONIBLE`. | Seleccionar otra patrulla verificadora disponible del menú. |
| `409 Conflict: Stock Insuficiente` | El stock en bodega fue consumido o es menor a la cantidad solicitada. | Ajustar la cantidad solicitada al stock máximo disponible indicado en la etiqueta. |
| `Error de Red / Servidor` | Pérdida de conexión con `sgrai-api`. | Verificar conectividad a la red municipal e intentar nuevamente el envío. |

---

## 6. Relación con Otros Componentes del Sistema

- **`sgrai-api`:** Registra la entidad `evento_prevencion`, despacha la `mision` asociada (tipo `PREVENCION`), descuenta recursos de inventario si aplica, actualiza el estado de la patrulla a `EN_PREVENCION` y emite el evento WebSocket `prevencion:creada` en las salas `sala:encargados` y `mapa`.
- **`sgrai-pwa`:** La patrulla verificadora asignada recibe una alerta y vibración en tiempo real en su dispositivo móvil con las instrucciones tácticas y la ruta hacia el punto crítico.
