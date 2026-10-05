# Manual de Usuario: H29 - Crear Evento de Recuperación y Despacho de Recursos

Este manual documenta el funcionamiento y uso de la funcionalidad para la creación de **Eventos de Recuperación Territorial con Despacho de Recursos** en la plataforma web del Sistema de Gestión de Recursos para Atención de Incidentes (SGRAI) de la Municipalidad de Valdivia.

---

## 1. Información General

- **Rol al que está dirigido:** Encargado de Operaciones / Jefe de Centro de Mando (y Administrador General de la Dirección de Gestión de Riesgos de Desastres).
- **Objetivo de la funcionalidad:** Permitir al Encargado generar y registrar directamente eventos territoriales de recuperación y asistencia comunitaria para enviar patrullas verificadoras a entregar insumos de ayuda inmediata (frazadas, sacos de arena, planchas de zinc, herramientas de mitigación) en sectores y barrios afectados de Valdivia, sin la exigencia estricta de haber registrado un incidente formal previamente en el sistema.
- **Ruta de acceso en la plataforma web:** `/gestion/centro-incidentes` (o `/mando`).

---

## 2. Acceso y Control de Permisos (RBAC)

Para operar esta funcionalidad, el sistema valida las credenciales y permisos del usuario activo:

| Rol | Permiso Requerido | Resultado Esperable |
|---|---|---|
| **Encargado de Operaciones** | `recuperacion:crear` | **Permitido:** Botón visible y despacho exitoso (`201 Created`). |
| **Administrador General** | `recuperacion:crear` | **Permitido:** Acceso total y despacho de misiones. |
| **Operador Call Center / Otros** | Sin permiso | **Denegado:** Advertencia de permisos insuficientes (`403 Forbidden`). |

---

## 3. Acceso al Formulario de Creación

El formulario se encuentra accesible directamente desde el panel principal de operaciones del Encargado:

1. Ingresa a **Operaciones &rarr; Centro de Mando** en la barra lateral o mediante la URL `/gestion/centro-incidentes`.
2. En la barra superior de acciones verás el botón institucional:
   - **"Nuevo Evento de Recuperación"** (ícono de caja con signo más `PackagePlus`).
   - También disponible en la barra de herramientas de la vista **"Mapa Operativo"** mediante el botón **"Crear Recuperación"**.
3. Al hacer clic, se abrirá la ventana modal interactiva **"Nuevo Evento de Recuperación"**.

---

## 4. Guía Paso a Paso para Registrar un Evento de Recuperación

El formulario está estructurado en 4 secciones lógicas:

### Paso 1: Información General del Evento
- **Título / Nombre del Evento (\*):** Nombre descriptivo de la intervención (3 a 150 caracteres).  
  *Ejemplo:* `"Entrega de frazadas y techumbre en Sector Collico"`.
- **Sector / Población Afectada (\*):** Barrio o zona territorial de Valdivia (mínimo 2 caracteres).  
  *Ejemplo:* `"Collico"`, `"Isla Teja"`, `"Las Ánimas"`, `"Niebla"`.
- **Prioridad Operativa:** Nivel de urgencia (`Baja`, `Media`, `Alta`, `Crítica`). Por defecto: `Media`.
- **Dirección de Referencia:** Calle y número o punto de referencia en terreno.  
  *Ejemplo:* `"Pasaje Los Cipreses 450 con Balmaceda"`.
- **Delegación Territorial:** Selector opcional de la delegación municipal a cargo.
- **Familias Beneficiadas:** Número estimado de familias o viviendas atendidas (por defecto `0`).
- **Referente Vecinal y Teléfono:** Nombre y contacto telefónico del presidente de junta vecinal o vecino referente en terreno.
- **Instrucciones u Observaciones:** Campo de texto libre para indicaciones especiales a la patrulla.

### Paso 2: Ubicación Geográfica en Mapa Interactivo (Leaflet)
- El formulario integra un visor cartográfico centrado en la comuna de Valdivia (`-39.8142, -73.2459`).
- **Fijar punto exacto:** Haz clic en cualquier lugar del mapa para posicionar el marcador de intervención. Las coordenadas GPS se actualizarán inmediatamente.
- **Afinar posición:** Puedes arrastrar el marcador con el cursor para ajustar la ubicación precisa de entrega.
- Si lo requieres, usa el botón *"Centrar Valdivia"* o *"Limpiar GPS"*.

### Paso 3: Asignación de Patrulla Verificadora
- Despliega el menú de patrullas verificadoras registradas.
- Por defecto, el selector muestra únicamente aquellas en estado **`DISPONIBLE`** (identificadas con punto verde `🟢`).
- Al seleccionar una patrulla disponible, al momento de confirmar quedará asignada y transicionará automáticamente al estado operativo **`EN_RECUPERACION`**.

### Paso 4: Selección Dinámica de Recursos e Insumos Logísticos
- La tabla de recursos consulta en tiempo real el inventario de bodega municipal (`GET /api/recursos?estado=DISPONIBLE`).
- En cada fila:
  1. Selecciona el insumo requerido (ej. *Sacos de Arena*, *Frazadas de Lana*, *Planchas de Zinc*).
  2. El sistema muestra una etiqueta con el **stock real disponible** en bodega (`cantidadDisponible = inventario - enUso`).
  3. Ingresa la cantidad requerida en unidades enteras.
  4. **Validación visual preventiva:** Si ingresas una cantidad superior al stock existente, el formulario mostrará un mensaje de alerta inmediato en rojo y bloqueará el despacho.
  5. Puedes presionar **"Agregar otro insumo"** para incluir múltiples materiales en el mismo despacho, o eliminar filas con el botón del basurero.

### Paso 5: Despacho y Confirmación
- Presiona **"Crear y Despachar Patrulla"**.
- El botón entrará en estado de carga (*"Despachando Operación..."*).
- Al completarse con éxito:
  - Se emitirá una notificación flotante verde (*Toast*):  
    `"Evento de recuperación registrado y patrulla despachada exitosamente. Código: REC-2026-XXXX"`.
  - La ventana modal se cerrará automáticamente.
  - La misión y el evento quedarán creados en el sistema.

---

## 5. Visualización en Tiempo Real en el Mapa Operativo (Leaflet + Socket.io)

El Centro de Mando incorpora un conmutador de vistas en su cabecera:

- **Tablero Kanban:** Monitoreo tradicional en 5 columnas de incidentes.
- **Mapa Operativo:** Visualización cartográfica georreferenciada integral.

Al seleccionar **"Mapa Operativo"**:
1. Podrás observar los marcadores de incidentes activos y los marcadores distintivos de **Eventos de Recuperación** (color verde esmeralda `#0D9488` con ícono de camión/paquete de suministros).
2. **Recepción reactiva vía WebSockets:** Cada vez que tú u otro Encargado genere una recuperación, el mapa escucha el evento `recuperacion:creada` vía Socket.io y **dibuja el nuevo marcador instantáneamente**, sin necesidad de recargar la página.
3. Al hacer clic sobre el marcador de recuperación, se despliega una ficha técnica (*Popup*) que detalla:
   - Código oficial (`REC-2026-XXXX`) y Prioridad.
   - Título y Sector territorial.
   - Dirección de referencia.
   - Patrulla verificadora asignada y estado.
   - Código de misión táctica generada (`MIS-2026-XXXX`).
   - Número de familias beneficiadas.
   - Desglose de insumos entregados y cantidades asignadas.

---

## 6. Casos Especiales y Mensajes de Error Esperables

| Código HTTP | Causa | Mensaje en Pantalla | Acción Recomendada |
|---|---|---|---|
| **409 Conflict** | **Patrulla Ocupada:** Otra operación asignó la patrulla simultáneamente. | *Banner de advertencia ámbar:* "La patrulla seleccionada acaba de ser asignada a otra tarea o no se encuentra disponible. Seleccione otra patrulla disponible." | Cambia la patrulla en el selector y vuelve a presionar despachar. |
| **409 Conflict** | **Stock Insuficiente:** Otra cuadrilla consumió los insumos en bodega. | *Banner de advertencia ámbar:* "Stock insuficiente en bodega para uno o más de los insumos requeridos. Modifique la cantidad solicitada." | Reduce la cantidad requerida al stock actualmente disponible. |
| **400 Bad Request** | Datos faltantes o caracteres insuficientes. | Texto en rojo bajo el campo afectado (ej. *"El título debe tener al menos 3 caracteres"*). | Completa o corrige los campos señalados. |
| **403 Forbidden** | Usuario sin credenciales de Encargado o Administrador. | *"No posee el permiso requerido: recuperacion:crear. Requiere rol de Encargado o Administrador."* | Inicie sesión con una cuenta de Encargado o solicite los permisos a soporte. |

---

## 7. Relación con Otros Componentes del Sistema

- **Backend (`sgrai-api`):** Al ejecutarse la creación, el backend descuenta las cantidades de `cantidadDisponible` e incrementa `cantidadEnUso` en la tabla de inventario, actualiza el estado de la patrulla verificadora a `'EN_RECUPERACION'` y genera automáticamente una misión de tipo `'RECUPERACION'` en estado `'DESPACHADA'`.
- **Aplicación de Terreno (`sgrai-pwa`):** La patrulla verificadora asignada recibe la notificación del despacho en su dispositivo móvil con la lista de insumos a entregar y las coordenadas geográficas de destino para iniciar el recorrido.
