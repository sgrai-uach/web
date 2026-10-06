# Manual de Usuario: Listado e Inventario de Recursos Logísticos (HU-7)

> **Módulo:** Administración y Gestión de Recursos Logísticos  
> **Historia de Usuario:** HU-7 — Listar Recursos e Inventario de Disponibilidad  
> **Rol Destinatario:** Administrador Municipal  
> **Sistema:** SGRAI — Dirección de Gestión de Riesgos de Desastres, Municipalidad de Valdivia  
> **Ruta del Módulo:** `/gestion/admin/recursos`

---

## 1. Objetivo de la Funcionalidad

Proporcionar al Administrador una vista tabular centralizada y en tiempo real de todo el inventario logístico municipal (vehículos de emergencia, maquinaria pesada, herramientas de achique y materiales a granel), permitiendo verificar de forma inmediata la disponibilidad operativa de cada recurso, su procedencia territorial por delegación y su nivel de stock antes de asignarlos a misiones de respuesta ante incidentes.

---

## 2. Acceso y Control de Seguridad (RBAC)

1. El acceso a esta pantalla está restringido exclusivamente a usuarios con el rol de **Administrador** o con el permiso `recursos:leer`.
2. **Identificadores de Sesión de Prueba:**
   - **Administrador General:** UUID `00000000-0000-4000-8000-000000000001` (`admin@valdivia.cl`) &rarr; **Permitido (200 OK)**.
   - **Operador Call Center:** UUID `00000000-0000-4000-8000-000000000002` (`callcenter@valdivia.cl`) &rarr; **Bloqueado (403 Forbidden)**.
3. Si un usuario sin privilegios administrativos intenta acceder a `/gestion/admin/recursos`, el sistema desplegará automáticamente la pantalla institucional de **Acceso Denegado (HTTP 403)**, impidiendo la visualización de los datos logísticos y ofreciendo enlaces directos para cambiar de sesión o retornar al portal correspondiente.

---

## 3. Elementos de la Pantalla

### 3.1. Barra Superior Institucional y Navegación
- **Franja Sage:** Encabezado oficial *"Municipalidad de Valdivia — Dirección de Gestión de Riesgos de Desastres"*.
- **Barra de Navegación Lateral (`AppSidebar`):** Acceso rápido al módulo de *Inventario Logístico* bajo el grupo *Administración*.
- **Ruta de Navegación (Breadcrumbs):** `Inicio › Administración › Inventario Logístico`.
- **Simulador de Perfil (RBAC):** Selector de pruebas para alternar entre *Administrador General* y otros roles, permitiendo validar el control de acceso en auditorías de QA.

### 3.2. Encabezado del Módulo
- **Título:** *Inventario Logístico de Recursos*.
- **Contador:** Badge con la cantidad total de recursos encontrados.
- **Botón Principal:** `+ Registrar Nuevo Recurso`, que redirige a `/gestion/admin/recursos/nuevo` para dar de alta nuevos activos en el sistema.

### 3.3. Barra de Búsqueda y Filtros en Servidor
La tabla se actualiza de forma reactiva al aplicar cualquiera de los siguientes filtros:
1. **Buscador Textual con Debounce:** Busca en tiempo real sobre el nombre o descripción del recurso (con retardo de 300 ms para optimizar el consumo de red).
2. **Estado de Disponibilidad:** Filtra entre los 5 estados del ciclo de vida logístico:
   - `DISPONIBLE`: Recurso listo para ser asignado.
   - `ASIGNADO`: Actualmente desplegado en terreno en una misión de cuadrilla.
   - `EN_MANTENCION`: En taller mecánico o revisión técnica.
   - `BAJO_STOCK`: Cantidad disponible igual o menor al umbral mínimo de seguridad.
   - `NO_DISPONIBLE`: Fuera de servicio o dado de baja temporal.
3. **Delegación Territorial:** Permite filtrar por las dependencias operativas de Valdivia:
   - *Delegación Municipal Norte* (Las Ánimas, Cabo Blanco)
   - *Delegación Municipal Sur* (Angachilla, Guacamayo)
   - *Delegación Municipal Costa* (Niebla, Los Molinos, Corral)
   - *Delegación Municipal Calle Calle* (Collico, Corvi)
4. **Tipo de Recurso:** Diferencia entre activos individuales serializados (*Vehículo o Maquinaria*) y suministros por volumen (*Material o Insumo*).
5. **Botón "Limpiar Filtros":** Aparece cuando hay filtros activos para restablecer la vista inicial con un solo clic.

---

## 4. Columnas de la Tabla de Inventario

| Columna | Información Desplegada |
|---|---|
| **Recurso / Identificador** | Nombre oficial del recurso, patente vehicular o número de serie (si aplica) y extracto descriptivo. |
| **Tipo** | Etiqueta con ícono representativo (*🚜 Vehículo o Maquinaria* o *📦 Material o Insumo*). |
| **Disponibilidad y Stock** | Cantidad disponible libre para despacho (en negrita destacada), cantidad en terreno/uso, total registrado en inventario y alerta en naranja si está bajo stock mínimo. |
| **Procedencia Territorial** | Nombre de la delegación asignada (*Delegación Municipal Norte, Sur, Costa o Calle Calle*), o *"Reserva Central"* si el activo pertenece al depósito central de Valdivia. |
| **Estado** | Badge institucional con código de color y punto indicador según su disponibilidad actual. |
| **Acción** | Botón *"Ver Ficha"* para abrir la ventana modal interactiva con el desglose técnico. |

---

## 5. Ficha Técnica y Detalle Interactivo (Modal)

Al hacer clic sobre cualquier fila o presionar *"Ver Ficha"*, se abre una ventana modal con:
1. **Banner de Estado y Delegación:** Muestra el badge de estado, la clasificación y la procedencia territorial.
2. **Métricas de Stock en Cuadrícula:** Tarjetas numéricas con desglose de disponible, en terreno, total en inventario y umbral de alerta.
3. **Descripción y Uso:** Detalle narrativo del propósito del recurso en emergencias.
4. **Especificaciones Técnicas del Activo:**
   - *Para Vehículos:* Patente, marca, modelo, año, kilometraje, tipo de combustible, capacidad de pasajeros.
   - *Para Maquinaria / Grúas:* Horómetro de operación, capacidad de carga (kg), alcance de pluma (m).
   - *Para Motobombas y Generadores:* Caudal máximo (L/min), diámetro de succión, potencia de motor (HP / kVA).
5. **Ubicación Georreferenciada:** Coordenadas (latitud, longitud) acompañadas de un mini-mapa interactivo satelital/urbano en modo solo lectura con el marcador exacto del activo.
6. **Auditoría:** Identificador único UUID, fecha y hora de registro, y última fecha de actualización.

---

## 6. Paginación en Servidor

- Ubicada al pie de la tabla, muestra el rango de registros visibles (ej. *Mostrando 1 a 10 de 52 recursos*).
- Botones **Anterior** y **Siguiente** con bloqueo inteligente en los extremos.
- Selector de tamaño de página: permite alternar entre **10, 25 y 50** elementos por página.

---

## 7. Estados Especiales y Manejo de Errores

### 7.1. Inventario Vacío o Sin Resultados
- Si el inventario no tiene registros ingresados (o si los filtros aplicados no coinciden con ningún recurso), se muestra un recuadro institucional con el mensaje:
  > **"No hay recursos registrados"**
- Acompañado de un botón directo para **"+ Registrar Nuevo Recurso"** (hacia `/recursos/nuevo`) y un botón para **"Limpiar Filtros"** si había una búsqueda activa.

### 7.2. Falla de Conexión con el Backend (Error 500 o Servidor No Disponible)
- Se despliega una franja de alerta roja en la parte superior indicando el error de comunicación con el servicio de inventario.
- Incluye un botón de acción **"Reintentar conexión"** que vuelve a invocar el endpoint sin necesidad de recargar la página completa.

### 7.3. Acceso Denegado (Error 403 Forbidden)
- Si el usuario en sesión no posee el permiso `recursos:leer` o el perfil `Administrador`, el sistema bloquea la tabla y muestra el recuadro de acceso restringido, con la posibilidad de simular el perfil de Administrador General para fines de validación técnica o retornar al Centro Call Center.

---

## 8. Relación con Otros Módulos y Repositorios

- **`sgrai-web` — HU-6 (`/recursos/nuevo`):** El botón `+ Registrar Nuevo Recurso` del listado enlaza directamente con el formulario de alta desarrollado en HU-6. Al completar un registro en dicho formulario, el sistema redirige automáticamente de vuelta a este inventario `/recursos`.
- **`sgrai-api` (`GET /api/recursos`):** Consume la API REST expuesta en el puerto `3001` mediante contratos tipados con `openapi-typescript` y `openapi-fetch`.
- **Módulos de Centro de Mando (HU-21 / HU-32):** El estado de disponibilidad (`DISPONIBLE`, `ASIGNADO`, `BAJO_STOCK`) actualizado en este inventario es la fuente de verdad que consulta el Encargado de Emergencias para la asignación de recursos y cuadrillas a incidentes y misiones territoriales.
