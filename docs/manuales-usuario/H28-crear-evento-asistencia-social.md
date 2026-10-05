# Manual de Usuario: Creación de Eventos Excepcionales de Asistencia Social (FIBE)

**Código Historia de Usuario:** HU-28  
**Módulo:** Asistencia Social / Operaciones  
**Roles Permitidos:** Encargado de Operaciones, Administrador General, y cualquier perfil que cuente con el permiso `asistencia_social:crear`  
**Roles de Solo Lectura:** Asistente Social (consulta y seguimiento de asignaciones)  
**Versión:** 1.1.0 (SGRAI v0.7.0)  

---

## 1. Objetivo de la Funcionalidad

Permitir al **Encargado de Operaciones**, al **Administrador General** o a cualquier usuario con el permiso **`asistencia_social:crear`** registrar eventos de asistencia social excepcionales y urgentes que requieran el levantamiento de la Ficha Básica de Emergencia (FIBE), georreferenciando con precisión la vivienda afectada y clasificando el tipo de daño. 

El evento puede registrarse de forma **independiente** sin necesidad de provenir de un incidente operacional formal, o bien **vincularse opcionalmente a un incidente en curso**.

---

## 2. Flujo Paso a Paso para la Creación del Evento Social

### Paso 1: Acceso al Formulario de Registro
Existen tres puntos directos de acceso a la pantalla de creación:
1. **Desde el Centro de Mando:** En la barra superior de acciones tácticas ([`KanbanHeader`](file:///c:/Users/mayra/OneDrive/Documentos/U/8°Semestre/Taller%20de%20Ingenier%C3%ADa%20de%20Software/web/src/components/mando/KanbanHeader.tsx)), hacer clic en el botón **"Nuevo Evento Social"** (con ícono `HeartHandshake`).
2. **Desde el Módulo de Asistencia Social:** En la barra de navegación lateral, ingresar a **"Asistencia Social"** (`/gestion/asistente-social`) y presionar el botón primario **"+ Nuevo Evento Social"** en el encabezado.
3. **Desde el Grid de Módulos:** En la página principal de gestión (`/gestion`), en la tarjeta "Asistencia Social", hacer clic en la acción secundaria **"+ Nuevo Evento"**.

---

### Paso 2: Caracterización del Caso y Vinculación Opcional
1. **Tipo de Afectación Social (Obligatorio):** Seleccionar la causal de emergencia del listado desplegable:
   * *Anegamiento de Vivienda:* Ingreso o saturación severa de agua en patio o habitaciones por napas o desborde.
   * *Daño Estructural / Techumbre:* Desprendimiento de cubierta, colapso de muros o daño severo en la estructura.
   * *Aislamiento de Hogar / Inaccesibilidad:* Pérdida de conectividad vial o corte de accesos peatonales al inmueble.
   * *Pérdida Habitacional por Fuego:* Afectación grave o total de enseres y vivienda por siniestro ígneo.
   * *Derrumbe o Remoción en Masa:* Deslizamiento de tierra, socavón o riesgo inminente de ladera sobre la vivienda.
   * *Otro Caso Excepcional:* Vulnerabilidad social de emergencia que no clasifique en las categorías anteriores.
2. **Prioridad de Atención:** Elegir entre *Crítica*, *Alta*, *Media* o *Baja*. (Por defecto asigna *Media*).
3. **Estimación de Afectados:** Ingresar el número estimado de personas y de familias que habitan el inmueble.
4. **Vincular a Incidente en Curso (Opcional):**
   * *Sin vincular a incidente:* Selección por defecto para registrar un caso social independiente / excepcional que no provenga del flujo estándar de un incidente.
   * *Seleccionar un incidente:* Despliega los incidentes activos en el sistema (ej. `INC-2026-0001 — Inundación Mayor (Avenida Costanera)`). Si se asocia, el caso FIBE quedará formalmente enlazado a dicho incidente.
5. **Descripción de la Excepcionalidad (Obligatorio):** Detallar la situación de vulnerabilidad o el motivo urgente por el cual se requiere la visita de Asistencia Social (mínimo 5 caracteres).

---

### Paso 3: Ubicación y Sincronización Bidireccional Mapa-Dirección

La cartografía y el campo de dirección se encuentran **completamente sincronizados de forma bidireccional**:

1. **Desde la Dirección hacia el Mapa (Geocodificación directa):**
   * Escriba el nombre de la calle o sector en el campo **"Dirección de Referencia o Calle"** (ej: *Avenida Picarte 2000*, *Sector Collico*, *Isla Teja*).
   * Al presionar el botón **"Ubicar en mapa"** (o pulsar Enter / desenfocar el campo), el sistema geocodifica la dirección en el radio urbano de Valdivia, traslada automáticamente el mapa y ubica el marcador rojo en las coordenadas exactas.
2. **Desde el Mapa hacia la Dirección (Geocodificación inversa):**
   * Haga clic o arrastre el marcador sobre la cartografía comunal OpenStreetMap / Leaflet en el punto exacto de la vivienda afectada.
   * El sistema resolverá inmediatamente la dirección correspondiente mediante geocodificación inversa y **escribirá la dirección de referencia automáticamente** en el campo de texto, además de actualizar los valores de **Latitud** y **Longitud**.
3. **Botón "Centrar en Valdivia":** Restablece el mapa al centro urbano comunal (-39.8142, -73.2459) en caso de desorientación.
4. **Delegación Territorial (Opcional):** Permite asignar la delegación municipal correspondiente (Norte, Sur, Costa o Calle Calle).

---

### Paso 4: Datos Preliminares de Contacto (Opcionales)
Si se dispone de información preliminar de los habitantes:
* **Nombre de Contacto / Jefe de Hogar** (ej: *María González*).
* **Teléfono de Contacto** (ej: *+56912345678*).
* **RUT** del informante o habitante.

---

### Paso 5: Vista Previa y Despliegue de Ficha Técnica (Opcional)
* En cualquier momento durante el llenado del formulario, el usuario puede presionar el botón **"Desplegar Ficha del Caso"**.
* Se abrirá un modal con la ficha técnica completa que consolida todos los datos ingresados en tiempo real (caracterización del caso, daños, métricas de personas/familias, coordenadas con botón para copiar, enlace a OpenStreetMap y datos de contacto).
* Desde la misma ficha es posible revisar la información y presionar **"Confirmar y Guardar Evento"**.
* Asimismo, en la bandeja general de Asistencia Social, cada registro cuenta con la acción **"Ver Ficha"** para consultar el expediente técnico de cualquier caso registrado.

---

### Paso 6: Confirmación y Guardado
1. Presionar el botón **"Guardar Evento de Asistencia Social"** (o confirmar desde la Ficha Técnica).
2. El sistema validará los campos requeridos (descripción ≥ 5 caracteres, dirección ≥ 3 caracteres, coordenadas válidas en Valdivia).
3. Al registrarse exitosamente en la base de datos:
   * La API asignará el correlativo oficial anual (ej: **`AS-2026-0001`**).
   * Se mostrará una notificación verde de confirmación (Toast).
   * Se redirigirá automáticamente a la bandeja de **Asistencia Social**, donde el nuevo evento se listará de inmediato en estado **PENDIENTE** listo para la posterior asignación de asistentes sociales.

---

## 3. Sincronización en Tiempo Real

El sistema utiliza WebSockets con Socket.io. Al crearse el nuevo evento social:
* Se emite el evento `"asistencia_social:creada"`.
* La bandeja de eventos pendientes de todos los usuarios conectados (Encargados, Administradores, Asistentes Sociales) se refresca de forma instantánea sin requerir recargar la página.

---

## 4. Casos Especiales y Mensajes de Error

| Situación / Error | Causa Raíz | Acción Correctiva |
|---|---|---|
| **"La descripción debe tener al menos 5 caracteres"** | El campo de descripción está vacío o es muy corto. | Detallar la situación social o requerimiento de la vivienda. |
| **"La dirección debe tener al menos 3 caracteres"** | No se indicó dirección ni se seleccionó en el mapa. | Ingresar la dirección o marcar la ubicación en el mapa. |
| **"Latitud/Longitud inválida"** | Coordenadas fuera de rango geográfico. | Seleccionar un punto válido dentro del mapa comunal. |
| **Acceso Restringido: "Se requiere el rol de Encargado o contar con el permiso 'asistencia_social:crear'"** | El usuario no cuenta con el rol ni con el permiso correspondiente. | Solicitar al Administrador la asignación del rol Encargado o la concesión del permiso `asistencia_social:crear`. |
| **HTTP 400 Bad Request** | La API rechazó algún campo del payload. | Corregir los campos indicados en rojo bajo cada entrada. |

---

## 5. Relación con Otros Componentes y Repositorios

* **`sgrai-api`:** Persiste el evento en la tabla `eventos_atp_asistencia_social` con sus coordenadas geográficas, asignando `incidente_id` si se vinculó a un incidente o manteniéndolo como `null` para casos independientes.
* **`sgrai-pwa`:** Aplicación de terreno utilizada por Asistentes Sociales para consultar los eventos pendientes asignados y levantar la Ficha FIBE in situ con soporte offline.
