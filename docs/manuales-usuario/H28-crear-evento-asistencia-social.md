# Manual de Usuario: Creación de Eventos Excepcionales de Asistencia Social (FIBE)

**Código Historia de Usuario:** HU-28  
**Módulo:** Asistencia Social / Operaciones  
**Roles Permitidos:** Encargado de Operaciones, Administrador General  
**Roles de Solo Lectura:** Asistente Social  
**Versión:** 1.0.0 (SGRAI v0.7.0)  

---

## 1. Objetivo de la Funcionalidad

Permitir al **Encargado de Operaciones** y al **Administrador General** registrar eventos de asistencia social excepcionales y urgentes que requieran el levantamiento de la Ficha Básica de Emergencia (FIBE), georreferenciando con precisión la vivienda afectada y clasificando el tipo de daño, sin necesidad de que el caso provenga de un incidente operativo convencional ni de una patrulla verificadora.

---

## 2. Flujo Paso a Paso para la Creación del Evento Social

### Paso 1: Acceso al Formulario de Registro
Existen dos formas directas de acceder a la pantalla de creación:
1. **Desde el Centro de Mando:** En la barra superior de acciones tácticas ([`KanbanHeader`](file:///c:/Users/mayra/OneDrive/Documentos/U/8°Semestre/Taller%20de%20Ingenier%C3%ADa%20de%20Software/web/src/components/mando/KanbanHeader.tsx)), hacer clic en el botón secundario **"Nuevo Evento Social"**.
2. **Desde el Módulo de Asistencia Social:** En la barra de navegación lateral, seleccionar **"Asistencia Social"** (`/gestion/asistente-social`) y presionar el botón primario **"Nuevo Evento Social"** ubicado en la tarjeta de título superior.

---

### Paso 2: Clasificación del Daño y Afectación Familiar
1. **Tipo de Afectación Social (Obligatorio):** Seleccionar la causal de emergencia del listado desplegable:
   * *Anegamiento de Vivienda:* Ingreso o saturación severa de agua en patio o habitaciones por napas o desborde.
   * *Daño Estructural / Techumbre:* Desprendimiento de cubierta, colapso de muros o daño severo en la estructura.
   * *Aislamiento de Hogar / Inaccesibilidad:* Pérdida de conectividad vial o corte de accesos peatonales al inmueble.
   * *Pérdida Habitacional por Fuego:* Afectación grave o total de enseres y vivienda por siniestro ígneo.
   * *Derrumbe o Remoción en Masa:* Deslizamiento de tierra, socavón o riesgo inminente de ladera sobre la vivienda.
   * *Otro Caso Excepcional:* Vulnerabilidad social de emergencia que no clasifique en las anteriores.
2. **Prioridad de Atención:** Elegir entre *Crítica*, *Alta*, *Media* o *Baja*. (Por defecto asigna *Media*).
3. **Estimación de Afectados:** Ingresar el número estimado de personas y de familias que habitan el inmueble.
4. **Descripción de la Excepcionalidad (Obligatorio):** Detallar la situación de vulnerabilidad o el motivo urgente por el cual se requiere la visita de Asistencia Social (mínimo 5 caracteres).

---

### Paso 3: Ubicación y Georreferenciación en Mapa
1. **Dirección de Referencia (Obligatorio):** Escribir la calle, número o referencia territorial clara (mínimo 3 caracteres, ej: *Calle Los Alerces 1420, Sector Collico*).
2. **Delegación Territorial (Opcional):** Asignar la delegación municipal correspondiente (Norte, Sur, Costa o Calle Calle) para facilitar el ordenamiento de las cuadrillas sociales.
3. **Selección en el Mapa Interactivo (Obligatorio):**
   * En el mapa OpenStreetMap / Leaflet, hacer clic sobre la ubicación exacta de la vivienda.
   * Al hacer clic, se fijará un marcador y los campos **Latitud** y **Longitud** se completarán automáticamente con valores decimales precisos.
   * Puede utilizar el botón **"Centrar en Valdivia"** para restablecer la vista a las coordenadas centrales de la comuna (-39.8142, -73.2459).

---

### Paso 4: Datos Preliminares de Contacto (Opcionales)
Si se dispone de información previa de la familia, completar:
* **Nombre de Contacto / Jefe de Hogar** (ej: *María González*).
* **Teléfono de Contacto** (ej: *+56912345678*).
* **RUT** del informante o jefe de familia.

---

### Paso 5: Confirmación y Guardado
1. Presionar el botón **"Guardar Evento de Asistencia Social"**.
2. El sistema validará que los campos obligatorios se encuentren completos.
3. Al guardarse exitosamente en la base de datos, la API retornará el correlativo oficial anual asignado (ej: **`AS-2026-0001`**).
4. El sistema mostrará una notificación flotante de confirmación (Toast verde) y redirigirá a la bandeja de **Asistencia Social**, donde el nuevo evento se listará de inmediato en estado **PENDIENTE** listo para la asignación de profesionales en terreno.

---

## 3. Sincronización en Tiempo Real

El sistema utiliza WebSockets (Socket.io). Cuando un Encargado registra un nuevo evento social excepcional:
* El evento se propaga automáticamente hacia todos los operadores, encargados y asistentes sociales conectados mediante el canal `"asistencia_social:creada"`.
* La tabla de eventos pendientes se actualiza en vivo sin requerir que los usuarios recarguen su navegador web.

---

## 4. Casos Especiales y Mensajes de Error

| Situación / Error | Causa Raíz | Acción Correctiva |
|---|---|---|
| **"La descripción debe tener al menos 5 caracteres"** | El campo de descripción se dejó vacío o es demasiado breve. | Detallar adecuadamente la situación de emergencia del hogar. |
| **"La dirección de referencia es obligatoria"** | No se indicó la calle o sector. | Ingresar la dirección de referencia (mínimo 3 caracteres). |
| **"Latitud/Longitud inválida"** | No se ha seleccionado una posición válida en el mapa. | Hacer clic en el mapa Leaflet para fijar las coordenadas exactas de la vivienda. |
| **HTTP 403: "No cuenta con el permiso requerido: asistencia_social:crear"** | El usuario autenticado posee un rol sin privilegios operativos (ej: Observador, Call Center). | Solicitar al Administrador del sistema la asignación del rol Encargado o Administrador. |
| **HTTP 400 Bad Request** | La API detectó inconsistencias de validación en los datos. | Revisar los mensajes en rojo bajo cada campo y corregir antes de reenviar. |

---

## 5. Relación con Otros Componentes y Repositorios

* **`sgrai-api`:** Es el único origen de datos y lógica. Recibe el `POST /api/eventos-atp/asistencia-social`, genera el código anual (`AS-2026-XXXX`) y persiste las coordenadas PostGIS con `incidente_id: null`.
* **`sgrai-pwa`:** Los asistentes sociales o patrullas en terreno consultarán estos eventos pendientes a través de la aplicación móvil de terreno para el posterior levantamiento y firma digital de la Ficha Básica de Emergencia (FIBE).
