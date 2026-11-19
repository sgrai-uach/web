# Manual de Usuario: Supervisión y Consulta de Eventos Preventivos en Terreno (HU-76)

- **Código de Historia:** HU-76
- **Rol Destinatario:** Encargado de Gestión del Riesgo de Desastres y Operaciones (Centro de Mando) / Supervisor Estratégico
- **Permisos RBAC Requeridos:** `prevencion:eventos:leer` (asignado a roles *Encargado*, *Supervisor* y *Administrador*)
- **Ruta del Módulo:** `/gestion/centro-incidentes` (o `/mando`, con pestaña `?tab=prevencion`)
- **Versión:** 1.0.0 (SGRAI v0.10.0)

---

## 1. Objetivo de la Funcionalidad

Proporcionar al Encargado de Emergencias una vista tabular consolidada y centralizada para la supervisión y monitoreo continuo de las obras de mitigación activa desplegadas en los puntos críticos de la comuna de Valdivia (limpieza de sumideros pluviales, mantención de fajas cortafuego forestales, inspección de colectores y dragado de canales).

Permite verificar el estado de avance de las misiones preventivas, filtrar por delegación territorial municipal y estado operativo, y desplegar un panel lateral interactivo (Drawer) con la información cartográfica y georreferenciada PostGIS (EPSG:4326) del sector intervenido.

---

## 2. Arquitectura de Navegación y Acceso a la Vista

Para acceder a la vista de eventos preventivos:

1. Inicie sesión en SGRAI con una cuenta que disponga del perfil **Encargado de Operaciones**, **Supervisor** o **Administrador General**.
2. En la barra de navegación lateral (`AppSidebar`), ingrese al **Centro de Incidentes** (`/gestion/centro-incidentes`).
3. En la barra superior de visualización táctica (`KanbanViewSwitcher`), haga clic en el tercer botón segmentado: **"Eventos Preventivos"** (identificado con el icono `ShieldAlert`).
4. La URL se sincronizará automáticamente a `/gestion/centro-incidentes?tab=prevencion`.

---

## 3. Descripción de Columnas de la Tabla Operativa

La tabla presenta la nómina completa de eventos preventivos con los siguientes atributos:

| Columna | Descripción | Elementos Visuales |
|---|---|---|
| **Código** | Identificador alfanumérico único oficial del evento preventivo (ej. `PREV-2026-0001`) y nombre de la obra. | Texto en negrita en verde petróleo (`#1B6F7D`) con ícono de escudo preventivo. Al hacer clic abre el drawer de detalle. |
| **Punto Crítico** | Punto crítico preexistente en el inventario municipal asociado a la obra de mitigación. | Nombre oficial y código del punto crítico (ej. `PC-ANG-01`). Si el evento fue registrado con coordenadas libres, se visualiza el badge `"Coordenadas libres"`. |
| **Delegación** | Delegación municipal territorial correspondiente (*Norte*, *Sur*, *Costa*, *Calle Calle*). | Nombre formal canónico de la delegación. |
| **Estado** | Condición operativa del evento preventivo en el Sistema de Comando de Incidentes. | Badge rectangular plano con punto indicador: *Planificada* (ámbar), *En Ejecución* (verde petróleo `#1B6F7D`), *Completada* (verde `#2E7D32`), *Cancelada* (rojo `#D32F2F`). |
| **Unidad a Cargo** | Patrulla verificadora o cuadrilla operativa municipal despachada al terreno. | Nombre de la unidad y su tipo (*Patrulla* o *Cuadrilla*). Si no se ha asignado personal, muestra *"Sin asignar"*. |
| **Fechas** | Registro temporal de creación del evento y fecha de inicio de la misión en terreno. | Marcas de tiempo formateadas (ej. `19 nov. 2026, 08:30`). |
| **Acciones** | Acceso directo a la ficha técnica del evento. | Botón rectangular plano `"Detalle"` con ícono `Eye` que despliega el panel lateral. |

---

## 4. Uso de Filtros y Búsqueda (Estándar H34)

La barra superior de herramientas (`EventosPrevencionFiltros`) permite filtrar en tiempo real el listado conforme al estándar unificado de filtros H34:

1. **Búsqueda por Texto Libre:**
   - Escriba en la caja de búsqueda términos como el código del evento (`PREV-2026-0001`), sector (`Angachilla`, `Collico`) o nombre del punto crítico (`Puente Calle Calle`).
   - El sistema aplica una pausa suave (debounce de 300 ms) para no sobrecargar el servidor mientras tipea.
   - Para limpiar rápidamente el texto, presione el botón `[✕]` dentro del campo.

2. **Filtro por Delegación Territorial:**
   - Seleccione en el menú desplegable la jurisdicción municipal:
     - *Todas las delegaciones*
     - *Delegación Norte* (Las Ánimas, Cabo Blanco, El Arenal)
     - *Delegación Sur* (Angachilla, Guacamayo, Simpson)
     - *Delegación Costa* (Niebla, Los Molinos, Corral)
     - *Delegación Calle Calle* (Collico, Corvi, Picarte Alto)

3. **Filtro por Estado Operativo:**
   - Seleccione en el menú de estados:
     - *Todos los estados*
     - *Planificada* (`PLANIFICADA`)
     - *En Ejecución* (`EN_CURSO`)
     - *Completada* (`COMPLETADA`)
     - *Cancelada* (`CANCELADA`)

4. **Chips de Filtros Activos y Limpieza Global:**
   - Cada filtro aplicado genera una etiqueta (chip) con botón `[✕]` en la franja inferior.
   - Para restablecer todos los filtros simultáneamente, presione el botón **"Limpiar filtros"**.
   - Los filtros aplicados se sincronizan de manera reactiva en la URL (`?tab=prevencion&q=...&delegacionId=...&estado=...&page=...`).

5. **Paginación H34:**
   - Al pie de la tabla, el paginador indica la cantidad total de eventos y permite navegar entre páginas (1..N) o cambiar el límite de registros desplegados (10, 20 o 50 por página).

---

## 5. Panel Lateral Desplegable (Drawer) con Información PostGIS

Al hacer clic en cualquier fila de la tabla o en el botón `"Detalle"`, se abre un panel lateral deslizante hacia la derecha con información técnica detallada:

### 5.1. Ficha del Punto Crítico Territorial
- **Punto Crítico del Catálogo:** Despliega código, nombre oficial, tipo de riesgo (*Inundación*, *Anegamiento*, *Remoción en masa*), nivel de prioridad y descripción de vulnerabilidad.
- **Regla Fallback (Coordenadas Libres):** Si el evento preventivo fue creado en un sector sin punto crítico formal (`puntoCritico = null`), el panel muestra un banner de aviso explicativo (*"Evento con coordenadas libres"*) y utiliza como respaldo el sector barrial, dirección de referencia y coordenadas registradas en el propio evento.

### 5.2. Georreferenciación y Cartografía PostGIS (EPSG:4326)
- Despliega las coordenadas geográficas en formato decimal estándar WGS84 (`latitud, longitud`).
- Incorpora un **mini-mapa interactivo en modo solo lectura (`readOnly`)**, centrado en el punto exacto de la intervención preventiva con marcador esmeralda.

### 5.3. Misión y Despacho Operativo
- Código de misión operativa (ej. `MIS-2026-0001`), tipo de misión (`PREVENCION`), estado de avance y fechas de inicio/cierre.
- Ficha de la unidad a cargo: nombre de la cuadrilla u operarios, o patrulla rápida asignada.

### 5.4. Instrucciones de Mitigación y Cierre
- Instrucciones preventivas redactadas durante la creación del evento.
- Para cerrar el Drawer, presione el botón `[✕]` superior, haga clic en el fondo semitransparente o presione la tecla `Escape`.

---

## 6. Casos Especiales y Mensajes de Error

1. **Acceso Restringido (HTTP 403 Forbidden):**
   - Si un usuario sin el permiso `prevencion:eventos:leer` (ej. perfil *Informante* o *Call Center*) intenta ingresar a la pestaña de prevención, el sistema bloquea la vista y muestra la pantalla institucional de **Acceso Restringido (HTTP 403)** sin exponer los datos del inventario.
2. **Sesión Expirada (HTTP 401 Unauthorized):**
   - Si el token JWT ha expirado, el sistema redirige automáticamente al portal de inicio de sesión (`/login`).
3. **Sin Resultados de Búsqueda:**
   - Si la combinación de filtros no arroja registros coincidentes, la tabla muestra un estado vacío informativo con el botón para restablecer los criterios.
