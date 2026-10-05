# Manual de Usuario: HU-54 — Filtrado de Avisos por Delegación, Estado y Atributos en Call Center

- **Código de Historia:** HU-54
- **Rol Destinatario:** Operador de Call Center (Mesa de Ayuda y Recepción Ciudadana)
- **Repositorio:** `sgrai-web`
- **Módulo:** Centro Call Center (`/gestion/callcenter`)

---

## 1. Objetivo de la Funcionalidad

Permitir al Operador de Call Center filtrar y segmentar ágilmente el listado de avisos de emergencias según su **Delegación territorial municipal** (Norte, Sur, Costa, Calle Calle), **Estado del reporte** (Pendiente, Verificado, Rechazado), **Canal de origen**, **Prioridad de espera (semáforo)** y **Términos de búsqueda textual**, facilitando la derivación focalizada de incidentes hacia el Centro de Mando del Encargado y optimizando los tiempos de respuesta ante emergencias comunales.

---

## 2. Flujo de Trabajo con Filtros Dinámicos

```
                      [Bandeja Call Center (/gestion/callcenter)]
                                       │
        ┌──────────────────────────────┼──────────────────────────────┐
        ▼                              ▼                              ▼
  [Filtro Delegación]           [Filtro Estado]            [Búsqueda / Canales]
  - Norte                       - Pendiente                - Texto (calle, informante)
  - Sur                         - Verificado               - Portal Web / Chatbot / Teléfono
  - Costa                       - Rechazado                - Semáforo de antigüedad
  - Calle Calle
        │                              │                              │
        └──────────────────────────────┼──────────────────────────────┘
                                       │
                                       ▼
                   [Aplicación Multicriterio Simultánea (AND)]
                   - Sincronización instantánea con URL (?delegacion=...&estado=...)
                   - Barra de indicadores visuales de filtros activos
                                       │
                       ┌───────────────┴───────────────┐
                       ▼                               ▼
             [Con Coincidencias]             [Sin Coincidencias]
             - Filas filtradas en tabla      - "No se encontraron avisos coincidentes"
             - Badges de Delegación/Estado   - Botón directo "Limpiar filtros"
```

---

## 3. Pasos para Operar los Filtros en la Bandeja

### Paso 1: Ingreso a la Bandeja de Call Center
1. Inicie sesión en la plataforma e ingrese al Centro Call Center (ruta canónica `/gestion/callcenter`).
2. Sobre la tabla de avisos encontrará la **Barra de Filtrado y Búsqueda**.

### Paso 2: Filtrado por Delegación Territorial
1. Localice el selector **"Delegación"** en la barra superior.
2. Seleccione una de las delegaciones municipales oficiales de Valdivia:
   - **Norte:** Sectores Las Ánimas, Cabo Blanco, El Arenal, Santa Elvira.
   - **Sur:** Sectores Angachilla, Guacamayo, Simpson, Paillao.
   - **Costa:** Sectores Niebla, Los Molinos, Corral, Mancera, Cutipay.
   - **Calle Calle:** Sectores Collico, Corvi, Picarte Alto.
   - **Todas las delegaciones:** Muestra la totalidad sin distinción territorial.
3. La tabla se actualizará de forma instantánea mostrando únicamente los avisos pertenecientes al sector seleccionado.

### Paso 3: Filtrado por Estado del Aviso
1. Localice el selector **"Estado"**.
2. Seleccione el estado requerido:
   - **Pendiente:** Avisos ingresados que requieren verificación y despacho (estado por defecto de la bandeja).
   - **Verificado:** Avisos que ya fueron promovidos a Incidentes formales con folio asignado.
   - **Rechazado:** Avisos descartados con motivo fundado por mesa de ayuda.
   - **Todos los estados:** Visualización transversal de registros sin restricción de estado.

### Paso 4: Aplicación de Múltiples Filtros Simultáneos
El sistema combina todos los criterios mediante lógica conjuntiva (`AND`):
* Ejemplo de uso: Seleccionar **Delegación: Costa**, **Estado: Pendiente** y escribir *"árbol"* en la caja de búsqueda.
* La tabla exhibirá exclusivamente aquellos avisos en estado pendiente que pertenezcan a la costa y contengan la palabra "árbol".

### Paso 5: Supervisión de Filtros Activos y Remoción Individual
* Cuando uno o más filtros se encuentren activos, se desplegará una barra informativa inferior con el rótulo **"FILTROS ACTIVOS:"**.
* Cada filtro se representa con un badge identificador:
  - `Texto: "inundación" [✕]`
  - `Delegación: Norte [✕]`
  - `Estado: Verificado [✕]`
  - `Canal: Portal Web [✕]`
  - `Prioridad: Urgente [✕]`
* Puede hacer clic en el botón `[✕]` de cualquier badge para desactivar ese criterio en particular sin alterar los demás.

### Paso 6: Restablecimiento Global ("Limpiar Filtros")
* En el extremo derecho de la barra de filtros activos, haga clic en el botón **"Limpiar filtros"**.
* Se restablecerán todos los campos a su condición original (búsqueda vacía, todas las delegaciones, estado pendiente, todos los canales y prioridades), restaurando la visualización completa de avisos.

### Paso 7: Persistencia y Compartición de Vistas vía URL
* Cada vez que aplique un filtro, los parámetros se reflejan en la barra de direcciones del navegador:
  ```
  https://plataforma.valdivia.cl/gestion/callcenter?delegacion=Costa&estado=PENDIENTE&prioridad=URGENTE
  ```
* Puede recargar la página (`F5`), retroceder/avanzar en el historial o compartir el enlace con otro operador; la interfaz recuperará exactamente los mismos filtros aplicados.

---

## 4. Casos Especiales y Manejo de Errores

| Situación | Comportamiento del Sistema | Acción Recomendada |
|---|---|---|
| **Búsqueda sin coincidencias** | La tabla sustituye su contenido por el mensaje amigable: *"No se encontraron avisos coincidentes"* junto a un botón de restablecimiento. | Haga clic en **"Limpiar filtros"** o ajuste los términos de búsqueda en la barra superior. |
| **Ingreso de un nuevo aviso por WebSocket mientras hay filtros activos** | Si el nuevo reporte ciudadano coincide con la combinación de filtros activa, aparecerá automáticamente en la primera fila. Si no coincide, aumentará el contador global pero no interrumpirá la vista filtrada. | Puede limpiar los filtros o seleccionar *"Todas las delegaciones"* si desea inspeccionar el nuevo reporte entrante. |
| **Paginación al cambiar de filtro** | El sistema restablece automáticamente la vista a la **Página 1** para garantizar que los resultados filtrados sean visibles de inmediato. | Navegue con el paginador inferior en caso de existir más de 20 registros coincidentes. |

---

## 5. Relación con Otros Componentes del Sistema

* **`sgrai-api`:** Consume el endpoint `GET /api/incidentes/avisos` enviando los parámetros de consulta `estado` y `delegacion` normalizados, asegurando compatibilidad nativa con la base de datos PostgreSQL y Kysely.
* **Centro de Mando (Encargado):** Al filtrar y verificar rápidamente los avisos por delegación, el operador promueve los incidentes permitiendo que las cuadrillas y patrullas de esa zona territorial sean alertadas con prontitud.
