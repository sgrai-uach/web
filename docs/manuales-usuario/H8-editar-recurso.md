# Manual de Usuario — H8: Editar Características de un Recurso Logístico

> **Módulo:** Administración y Gestión de Recursos Logísticos  
> **Historia de Usuario:** HU-8 — Editar Características de un Recurso  
> **Rol Destinatario:** Administrador Municipal  
> **Sistema:** SGRAI — Dirección de Gestión de Riesgos de Desastres, Municipalidad de Valdivia  
> **Ruta del Módulo:** `/gestion/admin/recursos`

---

## 1. Información General

- **Código de Historia de Usuario:** HU-8 (Backlog SGRAI)
- **Rol Destinatario:** Administrador Municipal.
- **Objetivo:** Permitir al Administrador actualizar las características técnicas, inventario físico disponible, coordenadas de ubicación y estado operativo de un recurso logístico existente, asegurando que el inventario refleje con exactitud la capacidad de respuesta municipal ante emergencias y desastres.

---

## 2. Acceso y Control de Seguridad (RBAC)

1. El acceso a la edición de recursos está protegido y restringido exclusivamente a usuarios autenticados con el permiso `recursos:editar` (perfil **Administrador**).
2. **Cabecera de Autenticación:** Cada petición envía la cabecera `X-User-Id: <UUID>` del usuario activo.
3. Si un usuario sin privilegios intenta invocar la modificación de un recurso, el sistema responderá con **HTTP 403 Forbidden** y desplegará la pantalla de Acceso Denegado institucional.

---

## 3. Acceso al Formulario de Edición

El Administrador puede acceder a la ventana de edición desde dos puntos de la interfaz de inventario (`/gestion/admin/recursos`):

1. **Desde la Tabla de Inventario:**
   - En la columna **Acción** de cada fila, presione el botón **"Editar"** (ícono de lápiz en color institucional Teal).
2. **Desde la Ficha Técnica de Detalle:**
   - Al presionar **"Ver Ficha"**, en el pie del modal de detalles técnicos se encuentra el botón destacado **"Editar Recurso"** (en color Mint institucional).

---

## 4. Estructura del Modal de Edición

Al abrirse el modal interactivo, el sistema realiza automáticamente una consulta `GET /api/recursos/{id}` para pre-cargar los datos vigentes del recurso desde la base de datos PostgreSQL, desplegando un indicador de carga mientras se obtienen los datos.

### 4.1. Sección 1: Información General
- **Clasificación del Activo (Inmutable):**
  - Muestra un badge de solo lectura con el tipo de bien (*Material o Insumo* o *Vehículo o Maquinaria*).
  - **Regla de Negocio:** La naturaleza del activo no es editable (un material fungible no puede convertirse en vehículo ni viceversa).
- **Nombre del Recurso (Obligatorio):**
  - Permite modificar la denominación descriptiva (mínimo 3 caracteres).
  - Si el campo queda vacío o con menos de 3 caracteres, se exhibirá una alerta visual roja y se inhabilitará el guardado.
- **Descripción u Observaciones (Opcional):**
  - Permite actualizar condiciones de almacenamiento, advertencias operativas o notas técnicas.

### 4.2. Sección 2: Inventario, Stock y Mantenimiento
- **Si el recurso es un Activo Individual (Vehículo / Maquinaria):**
  - La cantidad permanece fijada en `1` unidad sin posibilidad de alteración.
- **Si el recurso es un Material / Insumo Fungible:**
  - **Cantidad en Inventario:** Número entero $\ge 0$.
  - **Restricción de Unidades en Uso:** Si el recurso tiene unidades desplegadas en terreno (`cantidadEnUso > 0`), el sistema valida que la nueva cantidad de inventario **no sea menor** a las unidades comprometidas. Si se intenta reducir por debajo de dicho valor, el formulario bloquea el guardado indicando: *"No puedes reducir el inventario a menos de X unidades que están actualmente desplegadas en terreno"*.
  - **Cantidad Mínima:** Umbral de stock para disparar la alerta automática `BAJO_STOCK`.
- **Control de Mantenimiento Preventivo / Correctivo (`enMantencion`):**
  - Casilla de verificación interactiva: *"Marcar recurso en Mantenimiento Técnico (Fuera de Servicio)"*.
  - Al marcarla, se despliega una advertencia visual destacada indicando que el activo pasará al estado **`EN_MANTENCION`**, impidiendo que el Centro de Mando lo asigne a cuadrillas hasta que el Administrador retire dicha marca.

### 4.3. Sección 3: Especificaciones Técnicas (Solo Activos Individuales)
- Permite actualizar las especificaciones del bien según su subtipo:
  - **Vehículos:** Kilometraje, Horómetro, Tipo de Combustible, Patente, Número de Chasis, Capacidad de Pasajeros.
  - **Maquinaria / Grúas:** Capacidad de Carga (kg), Alcance Máximo (m), Tipo de Grúa, Horómetro.
  - **Motobombas / Equipos:** Caudal Máximo (L/min), Diámetro (pulgadas), Potencia (HP).

### 4.4. Sección 4: Ubicación Geográfica
- Permite actualizar las coordenadas de la base, depósito o maestranza municipal donde reside el activo.
- Cuenta con un selector de mapa interactivo basado en Leaflet y el botón utilitario **"Centrar en Valdivia"** (`-39.8142, -73.2459`).

---

## 5. Guardado, Auditoría y Actualización en Tiempo Real

1. Al presionar **"Guardar Cambios"**:
   - El sistema emite una petición `PUT /api/recursos/{id}` a `sgrai-api`.
   - Se registra automáticamente en base de datos la fecha y hora (`actualizado_en`) y el identificador del usuario que realizó la modificación (`actualizado_por_id`).
2. **Retroalimentación Inmediata:**
   - El modal se cierra automáticamente.
   - El usuario permanece en `/gestion/admin/recursos` y recibe una notificación flotante (Toast) de éxito en la esquina superior derecha: *"El recurso '[Nombre]' ha sido actualizado exitosamente"*.
   - La fila correspondiente en la tabla actualiza sus valores de forma instantánea.
3. **Sincronización en Tiempo Real (Socket.io):**
   - El servidor de `sgrai-api` emite el evento `"recurso:actualizado"`.
   - Todas las sesiones activas del **Centro de Mando** (Encargado) y **Dashboard** (Supervisor) reflejan el cambio de disponibilidad, stock o estado de mantenimiento inmediatamente sin necesidad de recargar la página.

---

## 6. Casos Especiales y Manejo de Errores

| Situación | Comportamiento del Sistema | Acción Sugerida |
|---|---|---|
| **Intento de reducir stock por debajo de unidades en uso** | El formulario alerta inline y la API responde `HTTP 400 Bad Request`. | Esperar el retorno o liberación de las cuadrillas en terreno antes de reducir el inventario físico total. |
| **Nombre con menos de 3 caracteres** | Borde rojo en el casillero y deshabilitación del botón "Guardar Cambios". | Ingresar una denominación válida y descriptiva. |
| **Pérdida de conexión o error 500** | Alerta inline dentro del modal con el detalle del error sin perder los datos editados. | Verificar la conectividad con el servidor y reintentar. |
| **Usuario sin rol Administrador (HTTP 403)** | Pantalla institucional de acceso denegado con opciones de cambio de rol. | Iniciar sesión con un usuario con permiso `recursos:editar`. |

---

## 7. Relación con Otros Repositorios

- **`sgrai-api`:** Procesa la lógica de negocio, persistencia en PostgreSQL con auditoría de usuario (`actualizado_por_id`) y emisión del evento WebSocket `recurso:actualizado` hacia las salas operativas.
- **`sgrai-pwa`:** Cuando una cuadrilla o patrulla utiliza recursos asignados o concluye una misión, la cantidad en uso se sincroniza en el backend, afectando la disponibilidad editable visible en este cliente web.
