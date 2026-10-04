# Manual de Usuario: HU-34 — Filtrado de Listados por Delegación, Estado y Atributos (Encargado)

- **Código de Historia:** HU-34
- **Rol Destinatario:** Encargado de Gestión del Riesgo de Desastres y Operaciones (Centro de Mando)
- **Repositorio:** `sgrai-web`
- **Módulos Abordados:**
  - Centro de Mando / Tablero Kanban de Incidentes (`/mando`)
  - Modal Interactivo de Misiones Operativas (dentro de `/mando`)
  - Gestión de Recursos Logísticos e Inventario (`/admin/recursos`)
  - Personal y Cuadrillas Operativas / Patrullas / Asistentes Sociales (`/gestion/admin/empleados`)

---

## 1. Objetivo de la Funcionalidad

Permitir al Encargado de Emergencias filtrar dinámicamente y con lógica conjuntiva (`AND`) cada uno de los listados operativos del sistema según su **Delegación territorial municipal** (expresada siempre en nombres canónicos: *Norte*, *Sur*, *Costa*, *Calle Calle*), **Estado operativo**, **Prioridad**, **Tipo de afectación o misión**, **Canal de origen** y **Búsqueda textual**, optimizando el monitoreo en tiempo real, agilizando la toma de decisiones críticas y acelerando el despacho y asignación oportuna de recursos y personal ante contingencias comunales.

---

## 2. Arquitectura de Navegación y Vistas de Filtrado

```
                    ┌───────────────────────────────────────────────┐
                    │      Centro de Mando Operativo (/mando)       │
                    └───────────────────────┬───────────────────────┘
                                            │
               ┌────────────────────────────┼────────────────────────────┐
               ▼                            ▼                            ▼
     [Kanban de Incidentes]        [Misiones Operativas]        [Personal y Recursos]
     - Delegación (Nombres)        - Modal interactivo pop-up   - /admin/recursos:
     - Prioridad (Crítica/Alta/..) - Delegación (Nombres)         * Tipo (Individual/Granel)
     - Tipo de afectación          - Estado (Planificada, etc.)   * Delegación por nombre
     - Canal de origen             - Tipo de misión y prioridad   * Estado (Disponible/En Uso)
     - Estado con ocultamiento     - Justificación de rechazo   - /gestion/admin/empleados:
       dinámico de columnas        - Paginación automática 1..N   * Patrullas Verificadoras
                                                                  * Asistentes Sociales (FIBE)
                                                                  * Cuadrillas Operativas
```

---

## 3. Guía Paso a Paso de Operación por Módulo

### 3.1. Tablero Kanban de Incidentes (`/mando`)

El Centro de Mando cuenta con una barra de filtrado estandarizada con diseño híbrido (controles planos, encabezados en Verde Petróleo Oscuro `#14505A`, selectores rectangulares y botonera de estados tipo píldora):

1. **Búsqueda Textual:**
   - Ingrese términos como código de incidente (`INC-2026-001`), calle o descripción ciudadana en la caja de texto.
   - El sistema aplica una pausa suave (debounce de 300 ms) para no sobrecargar la red mientras tipea.
   - Para limpiar rápidamente el texto, presione el botón `[✕]` dentro del campo.

2. **Filtro por Delegación Territorial (Nombres canónicos):**
   - Seleccione en el menú desplegable **Delegación Territorial**:
     - *Todas las delegaciones*
     - *Norte* (Las Ánimas, Cabo Blanco, El Arenal, Santa Elvira)
     - *Sur* (Angachilla, Guacamayo, Simpson, Paillao)
     - *Costa* (Niebla, Los Molinos, Corral, Mancera, Cutipay)
     - *Calle Calle* (Collico, Corvi, Picarte Alto)
   - *Nota de Usabilidad:* La interfaz opera exclusivamente con nombres geográficos legibles. La resolución de identificadores UUID se efectúa de manera transparente en la capa de servicios sin exponer códigos numéricos al usuario.

3. **Filtro por Prioridad y Tipo de Afectación:**
   - **Prioridad:** Filtre por *Crítica*, *Alta*, *Media* o *Baja*.
   - **Tipo de Afectación:** Filtre por tipologías de emergencia (*Anegamiento*, *Inundación*, *Caída de árbol*, *Corte de energía*, *Deslizamiento*, etc.).

4. **Filtro por Canal de Origen:**
   - Permite aislar incidentes ingresados por *Portal Web*, *Chatbot*, *Central Telefónica* o *Personal en Terreno*.

5. **Aislamiento y Ocultamiento de Columnas Kanban por Estado:**
   - En la botonera segmentada superior (`TODOS`, `REPORTADO`, `VERIFICANDO`, `EN_ATENCION`, `NO_ABORDBLE`, `RESUELTO`), haga clic en cualquier estado específico.
   - El tablero **ocultará automáticamente las columnas no deseadas**, maximizando el espacio de pantalla para concentrarse en la columna activa (por ejemplo, ver únicamente los incidentes en estado `VERIFICANDO` para despachar patrullas).
   - Para restaurar la visualización del tablero completo de 5 columnas, seleccione `TODOS`.

6. **Indicadores de Filtros Activos y Limpieza Global:**
   - Cada criterio activo genera un chip en la franja inferior con su etiqueta correspondiente.
   - Puede descartar cualquier filtro individual haciendo clic en su botón `[✕]`.
   - Para restablecer todos los parámetros simultáneamente, haga clic en el enlace **"Limpiar todos los filtros"**.

---

### 3.2. Modal Interactivo de Misiones Operativas

El Encargado puede consultar y filtrar el histórico y estado actual de las misiones sin abandonar el Centro de Mando:

1. **Apertura del Modal:**
   - En la barra de filtros de `/mando`, haga clic en el botón con borde **"Misiones Operativas"** (identificado con ícono de mapa/brújula).
   - Se desplegará un modal interactivo en pantalla completa con la tabla de despacho.

2. **Filtros Disponibles en Misiones:**
   - **Estado de Misión:** Botonera segmentada superior para alternar entre *Todas*, *Planificada*, *Despachada*, *En Curso*, *Completada*, *Cancelada* y *Rechazada*.
   - **Tipo de Misión:** Selector desplegable para filtrar por *Verificación*, *Atención Cuadrilla*, *Prevención*, *Recuperación* o *Asistencia Social*.
   - **Prioridad:** Selector desplegable (*Crítica*, *Alta*, *Media*, *Baja*).
   - **Delegación:** Selector dinámico con nombres oficiales (*Norte*, *Sur*, *Costa*, *Calle Calle*).
   - **Búsqueda:** Búsqueda libre sobre código de misión, incidente asociado o cuadrilla asignada.

3. **Visualización de Misiones Rechazadas y Justificación:**
   - Según las reglas de negocio del SGRAI, las cuadrillas y patrullas pueden rechazar una asignación con motivo fundamentado.
   - En la columna "Misión / Motivo", cuando una misión esté en estado `RECHAZADA`, el sistema resaltará una alerta con fondo suave y el ícono de precaución mostrando la justificación textual registrada en terreno (ej: *"Sin acceso por derrumbe en ruta T-350"*).

4. **Paginación Inteligente:**
   - Cada vez que el Encargado altera un filtro (delegación, estado, tipo, prioridad o búsqueda), el sistema reinicia automáticamente la paginación a la **Página 1**, evitando estados vacíos inconsistentes.

---

### 3.3. Inventario y Recursos Logísticos (`/admin/recursos`)

En el módulo de recursos (`/admin/recursos`), el Encargado dispone de:

1. **Tipo de Inventario Segmentado:**
   - Botonera rápida para alternar entre *Todos los tipos*, *Individuales* (vehículos, motosierras, generadores con número de serie) y *A Granel* (sacos de arena, planchas de zinc, nylon en metros).

2. **Delegación por Nombre Oficial:**
   - Selector dinámico alimentado por el catálogo municipal centralizado, permitiendo filtrar la bodega de asignación (*Norte*, *Sur*, *Costa*, *Calle Calle*).

3. **Estado del Recurso:**
   - Filtro por condición operativa: *Disponible*, *En Uso*, *En Mantención*, *De Baja*.

4. **Chips de Filtrado Activo:**
   - Muestra chips interactivos con el nombre del recurso buscado, la delegación seleccionada y el estado actual, con acción de borrado unitario y botón "Limpiar filtros".

---

### 3.4. Personal, Patrullas Verificadoras y Asistentes Sociales (`/gestion/admin/empleados`)

En la vista de personal operativo, el Encargado puede focalizar cuadrillas y funcionarios clave para el despacho:

1. **Acceso Rápido por Rol Operativo:**
   - Botonera segmentada destacada en Verde Petróleo para filtrar al instante:
     - **Patrullas Verificadoras:** Muestra únicamente el personal habilitado para verificación rápida en terreno con PWA.
     - **Asistentes Sociales:** Muestra el equipo profesional acreditado para levantamiento de Ficha FIBE y asistencia a personas vulnerables.
     - **Cuadrillas Operativas:** Muestra cuadrillas de terreno para labores pesadas de despeje y mitigación.
     - **Todos:** Visualización global del personal municipal.

2. **Filtro por Especialidad Técnica:**
   - Selector dinámico de especialidad: *Motosierra y Árboles*, *Operación de Motobombas*, *Eléctrico*, *Evaluación Social FIBE*, *Conducción de Maquinaria Pesada*.

3. **Filtro por Estado Operativo:**
   - Filtro por disponibilidad inmediata: *Disponible*, *En Misión / Asignado*, *No Disponible*, *Licencia*.

4. **Delegación de Base:**
   - Selector territorial por nombre para coordinar cuadrillas de proximidad al foco de la emergencia.

---

## 4. Casos Especiales y Mensajes del Sistema

| Escenario | Comportamiento del Sistema | Acción Recomendada para el Encargado |
|---|---|---|
| **Combinación sin resultados** | El listado o columna afectada despliega un mensaje amigable: *"No se encontraron registros coincidentes con los filtros aplicados"*. | Presione el botón **"Limpiar filtros"** en la franja de filtros activos o flexibilice los criterios. |
| **Columna Kanban aislada** | Al seleccionar un estado específico (ej. `EN_ATENCION`), las demás columnas del tablero se ocultan. | Para volver a monitorear el flujo completo del ciclo de vida de los incidentes, seleccione `TODOS` en la botonera de estados. |
| **Paginación al cambiar filtros** | El sistema restablece automáticamente la vista a la Página 1 para asegurar que los nuevos resultados sean visibles de inmediato. | Utilice los controles de paginación al pie de la tabla si el resultado supera el límite configurado por página. |
| **Persistencia de sesión simulada** | Al alternar entre perfiles de Encargado o Administrador, los filtros se preservan en memoria de la vista activa. | Puede refrescar los datos en cualquier instante mediante el botón **"Refrescar"**. |

---

## 5. Relación con Otros Componentes del Sistema

- **`sgrai-api` (Backend):**
  - Todas las consultas de filtrado se envían parametrizadas mediante contratos OpenAPI tipados:
    - `GET /api/incidentes`: Soporta `delegacionId`, `estado`, `prioridad`, `tipoAfectacion`, `fuenteOrigen`, `busqueda`.
    - `GET /api/misiones`: Soporta `delegacionId`, `estado`, `tipoMision`, `prioridad`, `busqueda`, `page`, `limit` con lógica conjuntiva (`AND`).
    - `GET /api/recursos`: Soporta `delegacionId`, `estado`, `esIndividual`, `busqueda`.
    - `GET /api/empleados`: Soporta `delegacionId`, `estadoOperativo`, `rolId`, `especialidadId`.
    - `GET /api/catalogos`: Provee la nómina oficial y sincronizada de delegaciones territoriales, roles y especialidades.
- **`sgrai-pwa` (Aplicación de Terreno):**
  - Cuando el Encargado asigna una patrulla o cuadrilla filtrada por su delegación y especialidad, la misión viaja en tiempo real a la PWA móvil del funcionario en terreno.
  - Si el delegado en terreno rechaza la misión desde la PWA, el motivo ingresado se refleja instantáneamente en el modal de Misiones Operativas del Encargado para su reasignación inmediata.
