# Manual de Usuario: Creación de Eventos de Alerta Temprana Preventiva (H61)

> **Módulo:** Administración y Gestión Territorial / Eventos ATP  
> **Historia de Usuario:** H61 — Creación de Evento ATP  
> **Rol Destinatario:** Administrador Municipal (o usuario con permiso `eventos_atp:crear`)  
> **Sistema:** SGRAI — Dirección de Gestión de Riesgos de Desastres, Municipalidad de Valdivia  
> **Ruta del Módulo:** `/gestion/admin/eventos-atp/nuevo` (canónica `/admin/eventos-atp/nuevo`)

---

## 1. Objetivo de la Funcionalidad

Permitir al **Administrador** registrar el marco oficial de un **Evento de Alerta Temprana Preventiva (ATP)**, entendido como el fenómeno o amenaza que da contexto a las acciones de prevención, mitigación y respuesta en la comuna de Valdivia.

El formulario captura:

- Código único del evento (automático o manual).
- Nombre y descripción del fenómeno.
- Tipo de amenaza y nivel de alerta comunal (Verde, Amarilla o Roja).
- Fecha y hora de inicio y término estimado.
- Delegaciones municipales afectadas (Norte, Sur, Costa, Calle Calle) o alcance comunal centralizado.

Al guardar, el evento queda **ACTIVO** de forma inmediata, se persiste junto a sus delegaciones en una sola transacción y se notifica en tiempo real a los equipos operativos y al mapa comunal. Esta historia **solo incorpora la creación**; el listado, la edición y el cierre de eventos se abordan en historias posteriores.

---

## 2. Acceso y Control de Seguridad (RBAC)

1. **Permisos Requeridos:**  
   El acceso al formulario y al endpoint `POST /api/eventos-atp` está protegido por RBAC. Se requiere:
   - Rol **Administrador**, **o**
   - El permiso explícito **`eventos_atp:crear`**.

2. **Asignación del Permiso:**  
   El permiso `eventos_atp:crear` se administra de forma abstracta desde la pantalla de **Roles y Permisos** (`/gestion/admin/roles-permisos`). No es necesario modificar código para habilitar a otro perfil: basta con asignar el permiso al rol correspondiente. La migración `035_evento_atp_base.ts` garantiza que el permiso exista y esté asignado al rol Administrador.

3. **Comportamiento ante Acceso Denegado:**  
   Si un usuario sin privilegios navega directamente a la ruta, el sistema muestra la pantalla **“Acceso Restringido”** con el mensaje:

   > *“Se requieren privilegios de Administrador o el permiso 'eventos_atp:crear' para registrar un Evento de Alerta Temprana Preventiva.”*

   La API responde además con **HTTP 401** si no hay autenticación y **HTTP 403** si el usuario autenticado carece de permiso.

---

## 3. Pasos para Registrar un Evento ATP

### Paso 1: Ingreso al Formulario de Creación

1. Inicie sesión con un usuario Administrador (o con el permiso `eventos_atp:crear`).
2. Navegue a `/gestion/admin/eventos-atp/nuevo`.
   - También es válida la ruta corta `/admin/eventos-atp/nuevo`.
3. Verifique el encabezado **“Crear Evento de Alerta Temprana Preventiva”** y el distintivo **“Evento ATP”**.

> **Nota:** H61 no agrega una entrada de navegación ni un listado de eventos. El acceso se realiza por la ruta directa o desde futuras historias del módulo ATP.

### Paso 2: Identificación y Clasificación del Fenómeno

En la sección **1. Identificación y clasificación del fenómeno**:

- **Código identificador (Opcional):**
  - Si se deja vacío, el backend genera automáticamente el correlativo anual con formato **`ATP-AAAA-####`** (ej. `ATP-2026-0001`).
  - Si se ingresa manualmente, debe tener entre 3 y 30 caracteres y solo puede contener letras, números y guiones.
  - El backend normaliza el código a **mayúsculas**.
  - El código es único: si ya existe, la API responde **HTTP 409 Conflict**.
- **Nombre del evento (Obligatorio):**
  - Entre 3 y 150 caracteres.
  - Ejemplo: *“Sistema Frontal Mayo 2026”*.
- **Tipo de amenaza (Obligatorio):**
  - Meteorológica (lluvias, viento, tormentas).
  - Marejadas y oleaje anormal.
  - Remoción en masa / deslizamiento.
  - Inundación y desborde de cauce.
  - Incendio forestal o de interfase.
  - Sísmica / actividad telúrica.
  - Otro fenómeno no clasificado.
- **Descripción del evento (Obligatoria):**
  - Entre 10 y 2.000 caracteres.
  - Describa el fenómeno, su extensión esperada, los impactos probables y las recomendaciones iniciales para la comunidad.

### Paso 3: Nivel de Alerta Comunal

En la sección **2. Nivel de alerta comunal**, seleccione una de las tres tarjetas oficiales:

- **Alerta Verde:** Monitoreo preventivo de condiciones y coordinación inicial.
- **Alerta Amarilla:** Vigilancia ante riesgo probable con posible afectación territorial.
- **Alerta Roja:** Emergencia con afectación inminente o en curso.

El nivel seleccionado se muestra resaltado y es obligatorio para guardar.

### Paso 4: Vigencia Estimada del Evento

En la sección **3. Vigencia estimada del evento**:

- **Fecha y hora de inicio (Obligatoria).**
- **Fecha y hora estimada de término (Obligatoria).**
- Regla estricta: la fecha de término debe ser **igual o posterior** a la fecha de inicio. Si es anterior, el formulario bloquea el envío y muestra el error correspondiente. La misma regla se valida en el backend con Zod.

### Paso 5: Alcance Territorial

En la sección **4. Alcance territorial del evento**:

1. Marque una o varias delegaciones afectadas:
   - Delegación Municipal Norte.
   - Delegación Municipal Sur.
   - Delegación Municipal Costa.
   - Delegación Municipal Calle Calle.
2. Puede usar **“Seleccionar todas”** o **“Limpiar selección”**.
3. **Alcance comunal centralizado:** si no marca ninguna delegación, el evento se considera de alcance comunal y aplica a todo el territorio de Valdivia. El resumen inferior mostrará *“Alcance comunal centralizado”*.
4. Puede seleccionar una, varias o ninguna delegación; no se exige un mínimo.

### Paso 6: Guardar el Evento

1. Revise el resumen de datos.
2. Haga clic en **`Guardar Evento ATP`**.
3. El botón cambia a **“Guardando Evento...”** mientras se procesa la solicitud.
4. **Éxito:** se muestra una pantalla de confirmación con:
   - Código oficial asignado (ej. `ATP-2026-0001`).
   - Estado **Activo**.
   - Amenaza y nivel de alerta.
   - Inicio y término estimado.
   - Alcance territorial (delegaciones o “Comunal centralizado”).
   - Botones **“Registrar otro Evento ATP”** y **“Volver al Panel de Administración”**.
5. **Error:** se despliega un aviso con el mensaje del servidor y, cuando corresponde, el detalle de los campos rechazados.

> **Cancelar:** el botón **“Cancelar”** descarta los cambios y vuelve al panel de administración correspondiente (`/gestion/admin` o `/admin`).

---

## 4. Validaciones y Mensajes de Error Frecuentes

| Campo / Condición | Regla de Validación | Mensaje Desplegado |
|---|---|---|
| **Código manual muy corto** | Mínimo 3 caracteres | *“El código debe tener al menos 3 caracteres.”* |
| **Código manual muy largo** | Máximo 30 caracteres | *“El código no puede superar los 30 caracteres.”* |
| **Código con caracteres inválidos** | Solo letras, números y guiones | *“El código solo puede contener letras, números y guiones.”* |
| **Código duplicado** | Único en `evento_atp` | *“Ya existe un Evento ATP registrado con el código '...'. ”* (HTTP 409) |
| **Nombre vacío o corto** | Mínimo 3 caracteres | *“El nombre del evento es obligatorio y debe contener al menos 3 caracteres.”* |
| **Nombre extenso** | Máximo 150 caracteres | *“El nombre del evento no puede superar los 150 caracteres.”* |
| **Descripción vacía o corta** | Mínimo 10 caracteres | *“La descripción es obligatoria y debe contener al menos 10 caracteres.”* |
| **Descripción extensa** | Máximo 2.000 caracteres | *“La descripción no puede superar los 2000 caracteres.”* |
| **Tipo de amenaza ausente** | Enum homologado | *“Debe seleccionar un tipo de amenaza.”* |
| **Nivel de alerta ausente** | `VERDE`, `AMARILLA` o `ROJA` | *“Debe seleccionar un nivel de alerta.”* |
| **Fecha de inicio inválida** | Fecha/hora parseable | *“Debe indicar una fecha y hora de inicio válida.”* |
| **Fecha de término inválida** | Fecha/hora parseable | *“Debe indicar una fecha y hora de término válida.”* |
| **Término anterior al inicio** | `fechaTermino >= fechaInicio` | *“La fecha y hora de término debe ser mayor o igual a la fecha y hora de inicio.”* |
| **Delegación duplicada** | Sin IDs repetidos | *“No se puede repetir una misma delegación en el evento.”* |
| **Delegación inexistente** | Debe existir en `delegacion` | *“Las siguientes delegaciones no existen en el sistema: ...”* (HTTP 400) |
| **Acceso no autorizado** | Sin rol Administrador ni permiso | Pantalla **“Acceso Restringido”** / HTTP 403 |

---

## 5. Integración con otros Repositorios y Tiempo Real

- **Persistencia transaccional (`sgrai-api`):** El evento se inserta en `evento_atp` con estado inicial **`ACTIVO`** y sus delegaciones en `evento_atp_delegacion` dentro de una única transacción PostgreSQL. Si falla cualquier inserción, se revierte todo el conjunto.
- **Correlativo atómico:** la generación de `ATP-AAAA-####` utiliza un advisory lock por año para evitar colisiones cuando dos administradores crean eventos simultáneamente.
- **Auditoría:** se registra `creado_por_id` con el identificador del usuario autenticado.
- **Notificación en tiempo real (Socket.io):** al crear el evento, el backend emite `evento_atp:creado` a las salas `sala:encargados`, `encargado`, `supervisor`, `mapa`, `admin` y `administrador`, además del broadcast global. Los tableros operativos y el mapa comunal reciben el evento sin refrescar la página.
- **Preparación para H60:** la migración deja columnas nullable `evento_atp_id` en `incidente`, `evento_prevencion`, `recuperacion` y `evento_asistencia_social`, de modo que las historias posteriores puedan vincular sus registros al evento ATP sin una nueva migración estructural.
- **Contrato OpenAPI:** `POST /api/eventos-atp` queda publicado en `/openapi.json` con los esquemas `CrearEventoAtpInput`, `EventoAtpResponse` y `CrearEventoAtpResponse`.
