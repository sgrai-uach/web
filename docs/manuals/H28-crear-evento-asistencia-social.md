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
Existen cuatro puntos directos de acceso a la pantalla de creación:
1. **Desde el Centro de Mando:** En la barra superior de acciones tácticas ([`KanbanHeader`](../../src/components/mando/KanbanHeader.tsx)), hacer clic en el botón **"Nuevo Evento Social"** (con ícono `HeartHandshake`).
2. **Derivación directa desde un Incidente con FIBE Requerida:** En el Panel Lateral de Detalle del Incidente (`IncidenteDetalleDrawer`), si la evaluación de terreno marcó `requiereAsistenciaSocial`, aparece el botón **"Crear Evento FIBE"**, que abre el formulario precargando los datos del incidente vía `?incidenteId=`.
3. **Desde el Módulo de Asistencia Social:** En la barra de navegación lateral, ingresar a **"Asistencia Social"** (`/gestion/asistente-social`) y presionar el botón primario **"+ Nuevo Evento Social"** en el encabezado.
4. **Desde el Grid de Módulos:** En la página principal de gestión (`/gestion`), en la tarjeta "Asistencia Social", hacer clic en la acción secundaria **"+ Nuevo Evento"**.

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
3. **Estimación de Afectados (Modo Aproximado o Desglose por Familia — Opcional):**
   * *Modo aproximado (por defecto):* Si se desconoce el detalle interno del hogar, ingresar directamente los totales estimados en **Personas Afectadas Estimadas** y **Familias / Hogares Afectados**.
   * *Nivel de Compromiso Habitacional y Daños Estimados (Opcionales):* Permite clasificar el daño general de la vivienda (`Sin daño estructural`, `Daño leve`, `Daño moderado`, `Daño grave / Inhabitable`) y detallar daños materiales.
   * *Desglose por Familia / Hogar (Opcional):* Al presionar **"+ Añadir Familia / Hogar"**, se despliegan tarjetas por grupo familiar homologadas con los informes de terreno (**H38/H39**): referencia del hogar, total de integrantes, niños/adolescentes, adultos mayores, personas con discapacidad, electrodependientes, mascotas afectadas y compromiso habitacional. **Importante:** al ingresar familias en el desglose, cualquier valor aproximado ingresado previamente queda totalmente descartado y es reemplazado por el conteo exacto de las familias registradas (si vuelve a modo aproximado, los campos se limpian para ingresar una nueva estimación).
4. **Vincular a Incidente en Curso (Opcional):**
   * *Sin vincular a incidente:* Selección por defecto para registrar un caso social independiente / excepcional que no provenga del flujo estándar de un incidente.
   * *Seleccionar un incidente:* Prioriza los casos marcados con `[FIBE Requerida]` y excluye incidentes cerrados como `NO_ABORDABLE` sin requerimiento FIBE. Al seleccionar un incidente, se precargan automáticamente el tipo de afectación mapeado, la prioridad, la ubicación, el contacto, las personas consolidadas del informe de cierre de patrulla (**H39**) y las familias rescatadas de la evaluación de prioridad (**H38**).
   * *Alertas de consistencia H39 y duplicados:* Si el incidente fue cerrado como `NO_ABORDABLE`, si la patrulla indicó en su cierre que **no requiere Ficha FIBE**, o si ya existe un evento social vinculado al mismo incidente, el formulario desplegará una advertencia preventiva para validar antes de guardar.
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

### Paso 5: Asignación Inmediata de Asistente Social (Opcional)
1. En la **Sección 4**, por defecto el campo inicia en *"Dejar pendiente sin asignar"*.
2. Si existe personal con rol `ASISTENTE_SOCIAL` en estado **Disponible**, el Encargado puede seleccionarlo directamente para registrar el evento en estado **ASIGNADO** en un solo paso atómico.
3. En cualquier momento es posible presionar **Actualizar Disponibilidad** para consultar en vivo si se liberaron nuevos profesionales.

---

### Paso 6: Vista Previa y Detalle de Evento de Asistencia Social (Opcional)
> **Nota importante de dominio:** Todos los datos familiares, demográficos y de contacto capturados en este formulario y en los reportes previos de Patrulla (`H38`/`H39`) son **estrictamente preliminares** y **NO corresponden a la FIBE** (*Ficha Básica de Emergencias*). El levantamiento formal de la FIBE se realiza por familia en una historia de usuario aparte.

* En cualquier momento durante el llenado del formulario, el usuario puede presionar el botón **"Vista Previa del Evento"**.
* Se abrirá el modal **"Detalle de Evento de Asistencia Social (Vista Previa)"** que consolida en tiempo real: caracterización del caso, asistente social asignado, evaluación preliminar y condición habitacional (indicando si corresponde a *Estimación Aproximada* o *Desglose por Familia*, resumen de grupos vulnerables, nivel de compromiso habitacional, daños materiales y detalle por hogar), coordenadas con botón para copiar, enlace a OpenStreetMap, datos preliminares de contacto separados por familia (cuando hay desglose familiar) y trazabilidad de creación/actualización.
* Al agregar familias en el desglose:
  * Se valida **coherencia demográfica estricta** (`niños + adultos mayores <= total integrantes`, `discapacidad <= total integrantes`, `electrodependientes <= total integrantes`; `mascotas >= 0`).
  * El contacto preliminar se gestiona de forma independiente en cada familia y cualquier contacto general aproximado previo queda descartado.
  * Al vincular un incidente proveniente de Patrulla (`H38`/`H39`), las familias y sus contactos preliminares declarados en terreno se sincronizan automáticamente.
* Desde la misma vista previa es posible revisar la información y presionar **"Confirmar y Guardar Evento"**.
* Asimismo, en la bandeja general de Asistencia Social, cada registro cuenta con la acción **"Ver Detalle"** para consultar el **"Detalle de Evento de Asistencia Social"** de cualquier caso registrado.

---

### Paso 7: Confirmación y Guardado
1. Presionar el botón **"Guardar Evento de Asistencia Social"** (o confirmar desde la Ficha Técnica).
2. El sistema validará los campos requeridos (descripción ≥ 5 caracteres, dirección ≥ 3 caracteres, coordenadas válidas en Valdivia).
3. Al registrarse exitosamente en la base de datos:
   * La API asignará el correlativo oficial anual (ej: **`AS-2026-0001`**).
   * Se mostrará una notificación verde de confirmación (Toast).
   * Si se seleccionó asistente social disponible, el evento nacerá en estado **ASIGNADO** y se redirigirá automáticamente a `/gestion/asistente-social?estado=ASIGNADO`. Si no se seleccionó, quedará en **PENDIENTE** y se redirigirá a la bandeja de pendientes para su asignación posterior ([H31](./H31-asignar-asistente-social.md)).

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
| **HTTP 409 Conflict** | El asistente social seleccionado dejó de estar disponible o existe conflicto de duplicidad con el incidente. | Seleccionar otro asistente social disponible tras la recarga automática de la nómina, o dejar el caso en estado `PENDIENTE`. |

---

## 5. Relación con Otros Componentes y Repositorios

* **`sgrai-api`:** Persiste el evento en la tabla `eventos_atp_asistencia_social` con sus coordenadas geográficas, asignando `incidente_id` si se vinculó a un incidente o manteniéndolo como `null` para casos independientes.
* **`sgrai-pwa`:** Aplicación de terreno utilizada por Asistentes Sociales para consultar los eventos pendientes asignados y levantar la Ficha FIBE in situ con soporte offline.
* **Derivación post-incidente (`HU-25`):** Para derivar directamente un incidente `RESUELTO` desde el Centro de Mando hacia un profesional disponible, consulta [H25-derivar-asistencia-social-post-incidente.md](./H25-derivar-asistencia-social-post-incidente.md).
