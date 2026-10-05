# Manual de Usuario: Listado de Puntos Críticos (HU-57)

> **Módulo:** Administración y Gestión Territorial / Prevención  
> **Historia de Usuario:** HU-57 — Listado de Puntos Críticos  
> **Rol Destinatario:** Administrador Municipal  
> **Sistema:** SGRAI — Dirección de Gestión de Riesgos de Desastres, Municipalidad de Valdivia  
> **Ruta del Módulo:** `/gestion/admin/puntos-criticos`

---

## 1. Objetivo de la Funcionalidad

Permitir al Administrador visualizar, filtrar y monitorear de forma centralizada el catastro comunal de puntos críticos y sectores vulnerables ante amenazas recurrentes (inundaciones, desbordes de humedales, anegamientos viales y remociones en masa), conociendo su nivel de prioridad operativa, coordenadas geográficas exactas, estado y delegación municipal asociada.

---

## 2. Acceso y Control de Seguridad (RBAC)

1. El acceso a esta vista y al consumo de datos está restringido exclusivamente a usuarios autenticados con rol de **Administrador** o que cuenten expresamente con el permiso del sistema `'puntos_criticos:leer'`.
2. **Identificadores de Sesión de Prueba (Simulador):**
   * **Administrador General:** UUID `00000000-0000-4000-8000-000000000001` (`admin@valdivia.cl`) &rarr; **Permitido (200 OK)**.
   * **Operador Call Center:** UUID `00000000-0000-4000-8000-000000000002` (`callcenter@valdivia.cl`) &rarr; **Restringido (403 Forbidden)**.
3. Si un usuario sin el permiso requerido intenta acceder directamente mediante la URL canónica `/gestion/admin/puntos-criticos` (o su alias `/admin/puntos-criticos`), el sistema desplegará automáticamente la pantalla institucional de **Acceso Denegado (HTTP 403)**, protegiendo la información territorial y proveyendo un enlace de retorno seguro a la Bandeja de Avisos.

---

## 3. Elementos de la Pantalla

### 3.1. Barra de Navegación y Encabezado
* **Ruta de Navegación (Breadcrumbs):** `Inicio › Administración › Puntos Críticos`.
* **Título Institucional:** *Puntos Críticos y Sectores Vulnerables*.
* **Contador:** Badge que indica la cantidad total de puntos críticos registrados en el catastro municipal.
* **Barra Lateral:** Acceso directo desde el grupo *"Administración"* &rarr; *"Puntos Críticos"* (ícono de alerta).

### 3.2. Filtros y Búsqueda Reactiva en Servidor
La tabla se actualiza de manera automática al aplicar cualquiera de los siguientes criterios:
1. **Buscador Textual (con Debounce de 350 ms):** Permite filtrar en tiempo real por código (ej. `PC-ANG-01`), nombre del sector, tipo de riesgo o extracto de la descripción.
2. **Delegación Territorial:** Desplegable con las 4 dependencias operativas de la comuna de Valdivia:
   * *Delegación Municipal Norte* (Las Ánimas, Cabo Blanco)
   * *Delegación Municipal Sur* (Angachilla, Guacamayo)
   * *Delegación Municipal Costa* (Niebla, Los Molinos, Corral)
   * *Delegación Municipal Calle Calle* (Collico, Corvi)
3. **Prioridad Operativa:** Filtro por nivel de gravedad homologado:
   * `CRITICA`
   * `ALTA`
   * `MEDIA`
   * `BAJA`
4. **Estado:** Permite alternar entre *Todos los estados*, *Activos* e *Inactivos*.
5. **Botón "Limpiar Filtros":** Se hace visible cuando al menos un filtro está activo para restaurar la vista completa con un solo clic.

---

## 4. Columnas de la Tabla de Puntos Críticos

| Columna | Información Desplegada |
|---|---|
| **Identificador / Sector** | Código único institucional en tono teal (ej. `PC-ANG-01`), nombre oficial del sector y breve descripción de la vulnerabilidad. |
| **Tipo de Riesgo** | Tipología de la amenaza recurrente (ej. *"Inundación y anegamiento"*, *"Remoción en masa"*). |
| **Prioridad** | Badge plano institucional con código de color: Crítica (rojo), Alta (naranja), Media (ámbar) y Baja (verde). |
| **Coordenadas / Ubicación** | Coordenadas decimales formateadas (`latitud, longitud`), con botón utilitario para **Copiar** al portapapeles y enlace directo para visualizar en **Mapa** (OpenStreetMap). |
| **Delegación Asociada** | Nombre de la delegación territorial responsable o *"Central Comunal"*. |
| **Estado** | Badge con punto indicador circular: *"Activo"* (verde) o *"Inactivo"* (gris). |

### 4.1. Visualización Detallada (Ficha Técnica en Ventana Modal)
Al hacer clic sobre cualquier fila de la tabla de puntos críticos, se despliega una ventana modal interactiva con la ficha técnica completa:
* **Cabecera Institucional:** Código del punto crítico, badge de prioridad operativa con semántica de colores, estado y nombre oficial del sector.
* **Descripción Detallada:** Información extendida sobre la vulnerabilidad, causas de desborde y observaciones preventivas.
* **Evaluación de Amenaza y Riesgo:** Clasificación de la tipología de riesgo y nivel de prioridad asignado.
* **Jurisdicción Territorial:** Nombre oficial de la delegación municipal asignada (ej. *"Delegación Municipal Sur"*).
* **Coordenadas Espaciales (PostGIS WGS 84):** Desglose numérico de latitud y longitud, botón utilitario para copiar las coordenadas y botón principal para abrir la ubicación directamente en el mapa (OpenStreetMap).
* **Metadatos:** Fecha y hora exacta en que el punto fue registrado en el catastro municipal.

---

## 5. Paginación y Estados de la Interfaz

1. **Estado de Carga:** Despliegue de filas skeleton durante la consulta o cambio de página.
2. **Estado Vacío (Empty State):**
   * *Sin registros en base de datos:* Muestra el mensaje *"No hay puntos críticos registrados"* con icono descriptivo.
   * *Sin coincidencias tras filtrar:* Muestra *"No se encontraron puntos críticos que coincidan con los criterios de búsqueda o filtros aplicados"* junto con el botón *"Limpiar Filtros"*.
3. **Paginación en Servidor:** Selector de tamaño de página (10, 25, 50 elementos) y botones Anterior / Siguiente sincronizados con los metadatos de paginación devueltos por el backend.

---

## 6. Casos Especiales y Manejo de Errores

* **Fallo de Conexión o Error del Servidor (500):** Se notifica al usuario mediante un Toast de advertencia con un mensaje amigable y se activa el fallback de datos local para no interrumpir la navegación en modo desconectado.
* **Sesión Expirada (401):** El sistema redirige automáticamente a la pantalla de autenticación.
* **Permiso Insuficiente (403):** El componente `AccesoDenegadoState` bloquea la visualización del listado indicando un mensaje claro y conciso: *"No cuenta con los permisos necesarios para acceder a esta sección. Si requiere acceso, puede solicitarlos a un administrador."* con un botón directo para retornar a la Bandeja de Avisos.

---

## 7. Relación con Otros Repositorios

* **`sgrai-api`:** Consume el endpoint `GET /api/puntos-criticos`, el cual consulta la tabla `prevencion` con soporte geoespacial PostGIS y validación RBAC mediante la cabecera `X-User-Id`.
* **`sgrai-pwa`:** Los puntos críticos activos también alimentan el catastro de referencia visual para cuadrillas y patrullas verificadoras en terreno para la prevención de riesgos y eventos ATP.
