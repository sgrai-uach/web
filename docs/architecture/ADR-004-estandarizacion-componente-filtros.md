# ADR-004: Estandarización de Componente Universal de Filtros (`FilterBar`) y Persistencia de Estado

- **Estado:** Aprobado
- **Fecha:** 2026-10-04
- **Decisores:** Equipo de Desarrollo Frontend SGRAI (`sgrai-web`), Encargado de Gestión del Riesgo
- **Módulos Afectados:**
  - Centro de Mando (`/mando`)
  - Bandeja de Avisos Call Center (`/callcenter`)
  - Gestión de Personal y Cuadrillas (`/gestion/admin/empleados`)
  - Puntos Críticos (`/gestion/admin/puntos-criticos`)
  - Roles y Permisos (`/gestion/admin/roles-permisos`)
  - Inventario de Recursos (`/admin/recursos`)

---

## 1. Contexto

La plataforma web de SGRAI (`sgrai-web`) provee múltiples consolas operativas y administrativas para distintos roles municipales (Encargado de Emergencias, Operador de Call Center, Administrador de Recursos y Personal). Cada una de estas consolas requiere herramientas de filtrado multicriterio con lógica conjuntiva (`AND`) sobre atributos clave como delegación territorial, estado operativo, prioridad, roles y búsqueda de texto.

Previo a esta decisión, se identificaron las siguientes discrepancias en la implementación de filtros:
1. **Inconsistencia en la capacidad de minimización/colapso:** El Centro de Mando disponía de opciones avanzadas, mientras que módulos como Call Center, Puntos Críticos, Personal y Roles utilizaban contenedores fijos que consumían espacio vertical crítico en pantallas de monitoreo continuo.
2. **Pérdida de preferencias de visualización:** Al recargar la página o navegar entre módulos, el estado minimizado/expandido de las barras de filtros volvía a su valor por defecto, obligando al usuario a reconfigurar su espacio de trabajo repetidamente.
3. **Disparidad de denominaciones:** El estado inicial de incidentes y avisos se denominaba alternativamente "Pendiente" o "Reportado", generando confusión terminológica entre operadores y mandos.
4. **Desincronización de enfoque visual:** Al pulsar una tarjeta de KPI en el Centro de Mando para enfocar una columna específica mientras el tablero Kanban se encontraba filtrado por otra columna, el usuario no lograba visualizar la columna enfocada.
5. **Divergencias en el diseño:** Coexistencia de estilos ad-hoc en lugar de componentes reutilizables gobernados por el sistema de diseño municipal de Valdivia (esquinas rectas `borderRadius: 0`, tipografía Noto Sans, paleta institucional Teal/Mint/Charcoal, íconos Lucide sin emojis).

---

## 2. Decisión

Se adopta un **componente universal de filtrado (`FilterBar`)** y su familia de subcomponentes atómicos (`FilterSearchInput`, `FilterSelect`, `SegmentedButtonGroup`, `ActiveFilterChips`), consolidando la arquitectura de filtros en `@/components/common/filters`:

### 2.1. Arquitectura del Contenedor `FilterBar`
- **Encabezado Estandarizado:** Muestra el título de la sección de filtros, un contador badge de filtros activos (`totalFiltrosActivos`), área de acciones complementarias (`headerActions`, ej: botones "Refrescar" o accesos rápidos) y el botón de alternancia colapsar/expandir (`toggleCollapseBtn`).
- **Persistencia en `localStorage`:** La propiedad `storageKey` permite guardar y restaurar automáticamente la preferencia de colapso del usuario mediante claves namespace (`sgrai:filtros:<modulo>:colapsado`). La lectura y escritura son resilientes a entornos SSR (Server-Side Rendering) y fallos de cuota o navegación privada.
- **Visibilidad del Estado:** Cuando la barra está minimizada, el badge superior de filtros activos permanece visible, advirtiendo al operador que los datos en pantalla están filtrados.

### 2.2. Subcomponentes Reutilizables
1. **`FilterSearchInput`:** Input de búsqueda con debounce parametrizable (300 ms por defecto) y botón de limpieza rápida (`[✕]`).
2. **`FilterSelect`:** Selector desplegable nativo estilizado según el estándar municipal (esquinas rectas, alto 38px, foco en Teal `#1B6F7D`).
3. **`SegmentedButtonGroup`:** Grupo de botones planos continuos para selección rápida excluyente o múltiple (roles, tipos de inventario, estados).
4. **`ActiveFilterChips`:** Franja horizontal de chips desmontables individuales con botón "Limpiar todos los filtros".

### 2.3. Sincronización de Enfoque en Tablero Kanban
En el Centro de Mando (`KanbanBoard.tsx`), cuando el usuario hace clic sobre un KPI de estado (ej: "Reportados", "En Atención"):
- Si el tablero está filtrado por un estado puntual diferente, el filtro de estado se actualiza automáticamente al estado seleccionado, asegurando que la columna correspondiente sea visible en `estadosVisibles` antes de enfocarla.
- Si el tablero se encuentra en visualización global (`TODOS`), se preservan todas las columnas y se ejecuta el desplazamiento visual suave hacia la tarjeta o columna correspondiente.

### 2.4. Estandarización de Denominación Canónica
Se homologa de manera transversal la denominación del estado inicial de incidentes y avisos al término canónico **"Reportado"**, erradicando el uso de "Pendiente" en interfaces, selectores, badges, tooltips y descripciones operativas.

### 2.5. Claves de Persistencia Asignadas
- Centro de Mando: `sgrai:filtros:mando:colapsado`
- Bandeja de Avisos Call Center: `sgrai:filtros:avisos:colapsado`
- Gestión de Personal y Cuadrillas: `sgrai:filtros:personal:colapsado`
- Puntos Críticos: `sgrai:filtros:puntos-criticos:colapsado`
- Roles y Permisos: `sgrai:filtros:roles:colapsado`
- Recursos Logísticos: `sgrai:filtros:recursos:colapsado`

---

## 3. Consecuencias

### 3.1. Positivas
- **Consistencia Visual y de Interacción:** Todos los módulos presentan la misma jerarquía, tipografía y comportamiento ante el filtrado de datos.
- **Optimización del Espacio Operativo:** Los operadores de Centro de Mando y Call Center pueden colapsar los paneles de filtros en turnos de alta demanda para maximizar la superficie útil de tablas y tableros.
- **Cero Ambigüedad Terminológica:** Uso uniforme de "Reportado" alineado con el ciclo de vida del incidente (`Reportado → Verificando → En Atención → No Abordable / Resuelto`).
- **Separación de Capas:** La interfaz opera siempre con nombres canónicos legibles (*Norte*, *Sur*, *Costa*, *Calle Calle*), delegando la resolución de identificadores UUID al servicio de catálogos sin ensuciar la vista.
- **Alta Cobertura de Pruebas:** Todos los componentes y comportamientos cuentan con pruebas automatizadas en Vitest y React Testing Library.

### 3.2. Trade-offs / Consideraciones
- Las páginas que incorporen `FilterBar` deben asignar una clave `storageKey` única con el prefijo `sgrai:filtros:` para evitar colisiones entre vistas.
