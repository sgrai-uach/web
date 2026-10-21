# Manual de Usuario: H16 — Visualización de Patrullas Verificadoras y Disponibilidad en Tiempo Real

Este manual documenta el uso y operación de la funcionalidad de **Monitoreo de Patrullas Verificadoras en Tiempo Real** en la plataforma web del Sistema de Gestión de Recursos para Atención de Incidentes (SGRAI) de la Municipalidad de Valdivia.

---

## 1. Información General

- **Rol al que está dirigido:** Encargado de Centro de Mando / Gestión del Riesgo de Desastres, Supervisor Estratégico y Administrador General.
- **Objetivo de la funcionalidad:** Permitir al Encargado conocer la dotación inmediata de equipos de evaluación rápida (patrullas verificadoras), su funcionario líder, delegación municipal asignada y estado operativo canónico en tiempo real, facilitando la toma de decisiones para asignarlas oportunamente a la verificación de incidentes reportados o misiones preventivas.
- **Vista de acceso:** `/gestion/centro-incidentes` (Centro de Mando).
- **Ruta de invocación:** Botón institucional **"Patrullas Verificadoras"** ubicado en la barra superior de acciones (`KanbanHeader`).

---

## 2. Control de Permisos y Acceso (RBAC)

El acceso a la consulta y monitoreo de patrullas verificadoras está restringido por la política de seguridad perimetral del sistema:

| Rol de Usuario | Permiso RBAC | Acceso al Panel de Patrullas |
|---|---|---|
| **Encargado de Operaciones (DGRD)** | `misiones:leer` | **Permitido (200 OK)** |
| **Administrador General** | Acceso total | **Permitido (200 OK)** |
| **Supervisor Estratégico** | `misiones:leer` | **Permitido (200 OK)** |
| **Operador Call Center / Informante** | Sin permiso `misiones:leer` | **Restringido (403 Forbidden)** |

> [!NOTE]
> En caso de que un usuario sin los privilegios requeridos intente consultar el módulo, la interfaz desplegará el componente de **Acceso Restringido** (`AccesoDenegadoState`) indicando la necesidad de contar con el permiso `misiones:leer`.

---

## 3. Guía Paso a Paso para el Operador

### Paso 1: Ingreso al Centro de Mando
1. Inicie sesión con su cuenta institucional con rol Encargado o Administrador.
2. Diríjase al menú lateral **Operaciones** y seleccione **Centro de Mando** (`/gestion/centro-incidentes`).
3. En la tarjeta superior de título, observe la botonera de acciones rápidas.

### Paso 2: Apertura del Panel de Patrullas Verificadoras
1. Haga clic en el botón secundario **`[ 🛡 Patrullas Verificadoras ]`** situado junto al botón de *Misiones Operativas*.
2. El sistema abrirá un modal táctico interactivo de alta prioridad sin provocar pérdida de contexto ni recargar el tablero Kanban de incidentes.

### Paso 3: Lectura de la Barra de Resumen de Dotación
En la parte superior del panel se visualiza el resumen consolidado de las unidades:
* **Total registradas:** Cantidad total de patrullas adscritas en el catálogo.
* **Disponibles:** Patrullas listas para recibir una nueva orden de verificación.
* **En Misión / Verificación:** Unidades que se encuentran actualmente atendiendo un incidente o patrullaje.
* **No disponibles:** Unidades en mantención, fuera de turno o relevo de dotación.
* **Indicador de Sincronización:** Muestra si la conexión WebSocket está en vivo (*"Sincronizado en tiempo real"*).

### Paso 4: Filtrado y Búsqueda de Equipos
El panel cuenta con controles híbridos estandarizados:
1. **Búsqueda rápida:** Ingrese texto parcial para filtrar por nombre de la patrulla o por nombre del funcionario líder.
2. **Selector de Delegación:** Filtre por jurisdicción territorial (*Norte*, *Sur*, *Costa*, *Calle Calle* o *Todas las delegaciones*).
3. **Selector de Estado:** Filtre por estado operativo (*Disponibles*, *En Verificación*, *En Misión*, etc.).
4. **Refrescar:** Actualice manualmente el listado en caso de requerir revalidación forzada.

### Paso 5: Consulta de la Ficha de Patrulla y Navegación a Incidentes
Cada tarjeta expone la dotación técnica:
* **Nombre de patrulla:** Identificador oficial (ej. `Patrulla Rápida Costa-1`).
* **Badge canónico de estado:** Muestra el estado operativo con color y semántica institucional.
* **Delegación territorial:** Jurisdicción asignada.
* **Funcionario Líder:** Nombre, RUT y contacto telefónico del evaluador a cargo.
* **Dotación en terreno:** Número de brigadistas o funcionarios que componen la patrulla.
* **Misión en curso (si aplica):**
  - Si la patrulla está ocupada, se exhibe un bloque destacado con el título de la misión.
  - Al hacer clic en el botón del **Código de Misión** (ej. `MIS-2026-0001`), se abre directamente el modal de detalle de misión.
  - Al hacer clic en el botón del **Código de Incidente** (ej. `INC-2026-0003`), se abre el panel lateral (Drawer) con la ficha completa del incidente.

---

## 4. Tabla de Referencia de Estados Canónicos

Los estados reflejan con estricta fidelidad los valores de la base de datos municipal (`patrulla_verificadora.estado`):

| Estado Canónico | Etiqueta en Interfaz | Significado Operativo | Acción Recomendada para el Encargado |
|---|---|---|---|
| `DISPONIBLE` | **Disponible** | La patrulla y su móvil se encuentran en base o zona de patrullaje sin asignación activa. | **Apta para asignación inmediata** ante nuevos incidentes reportados. |
| `EN_VERIFICACION` | **En Verificación** | La patrulla fue despachada y se encuentra evaluando en terreno la magnitud y afectación de un incidente. | Esperar informe preliminar de evaluación rápida (Ficha de Evaluación). |
| `EN_PREVENCION` | **En Prevención** | Desplegada en labores preventivas en puntos críticos comunales o rondas ATP. | Monitorear cumplimiento de rondas de mitigación. |
| `EN_RECUPERACION` | **En Recuperación** | Asignada a labores territoriales de recuperación tras el paso del evento climático. | Supervisar avances de recuperación comunitaria. |
| `EN_MISION` | **En Misión** | Atendiendo una misión operativa general asignada por la jefatura de operaciones. | Consultar el detalle de la misión mediante el enlace directo. |
| `NO_DISPONIBLE` | **No Disponible** | Vehículo en taller, descanso legal o dotación desarmada transitoriamente. | No asignar misiones hasta cambio de estado por el líder o administrador. |

---

## 5. Reactividad en Tiempo Real (WebSocket)

El panel se conecta automáticamente al servidor de tiempo real mediante el canal seguro de Socket.io, suscribiéndose a la sala `encargado`.

* **Evento `patrulla:actualizada`:** Ante cualquier cambio de estado ejecutado desde terreno (ej. informe enviado desde `sgrai-pwa`) o desde la API, la tarjeta actualiza inmediatamente su badge de estado sin recargar la página.
* **Evento `mision:asignada`:** Si se despacha una nueva misión a una patrulla, la interfaz vincula la misión activa y actualiza su estado automáticamente, emitiendo una notificación en la franja superior del modal.

---

## 6. Mensajes de Error y Casos Especiales

| Situación | Causa | Acción de Resolución |
|---|---|---|
| **Acceso Restringido (403)** | El usuario no posee el permiso `misiones:leer`. | Solicite al Administrador del sistema la incorporación del rol Encargado o la asignación del permiso en `/gestion/admin/permisos`. |
| **"No se encontraron patrullas"** | No hay registros que coincidan con la delegación o estado seleccionado. | Presione el botón **"Limpiar Filtros"** para restablecer la vista completa. |
| **Error de conexión con el servidor municipal** | Caída momentánea de red o indisponibilidad temporal del backend. | Verifique su conexión de red municipal y presione el botón **Refrescar**. |

---

## 7. Relación con Otros Repositorios del Sistema

- **`sgrai-api`:** Provee el catálogo y endpoints `GET /api/patrullas` y `GET /api/patrullas/{id}`, gestionando la auditoría de estados canónicos y la emisión de eventos de socket hacia la sala `encargado`.
- **`sgrai-pwa`:** Aplicación de terreno utilizada por la Patrulla Verificadora para actualizar sus coordenadas GPS, reportar disponibilidad o enviar la evaluación técnica del incidente, lo que gatilla la liberación o cambio de estado visible en este panel web.
