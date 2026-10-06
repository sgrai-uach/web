# Manual de Usuario: Creación de Puntos Críticos (HU-58)

> **Módulo:** Administración y Gestión Territorial / Eventos ATP  
> **Historia de Usuario:** HU-58 — Creación de Puntos Críticos  
> **Rol Destinatario:** Administrador Municipal  
> **Sistema:** SGRAI — Dirección de Gestión de Riesgos de Desastres, Municipalidad de Valdivia  
> **Ruta del Módulo:** `/admin/puntos-criticos/nuevo`

---

## 1. Objetivo de la Funcionalidad

Permitir al usuario con rol de **Administrador** registrar de manera guiada un nuevo "Punto Crítico" o sector comunal vulnerable ante eventos climáticos adversos e inundaciones. La funcionalidad proporciona un formulario integral acoplado a un mapa interactivo de Valdivia para la fijación de coordenadas geográficas precisas (WGS84) y radio de afectación en metros, garantizando que el punto quede inmediatamente disponible en el catastro comunal y en los tableros cartográficos para el posterior despacho preventivo de patrullas y cuadrillas operativas.

---

## 2. Acceso y Control de Seguridad (RBAC)

1. **Permisos Requeridos:**  
   El acceso a este formulario y al endpoint de persistencia está protegido por el sistema de control de acceso basado en roles (RBAC). Requiere:
   * Rol **Administrador** (o bandera `esAdmin: true`), o
   * Permiso específico `'puntos_criticos:crear'` (o fallback `'eventos_atp:crear'`).

2. **Perfiles de Prueba en Entorno de Desarrollo (Simulador):**
   * **Administrador General:** UUID `00000000-0000-4000-8000-000000000001` (`admin@valdivia.cl`) &rarr; **Acceso Permitido (200 OK)**.
   * **Operador Call Center:** UUID `00000000-0000-4000-8000-000000000002` (`callcenter@valdivia.cl`) &rarr; **Acceso Denegado (403 Forbidden)**.
   * **Informante Ciudadano:** &rarr; **Acceso Denegado (403 Forbidden)**.

3. **Comportamiento ante Permisos Insuficientes:**  
   Si un usuario no autorizado intenta ingresar directamente a `/admin/puntos-criticos/nuevo`, la interfaz renderiza el componente institucional de **Acceso Restringido (403)**, informando la carencia del permiso `'puntos_criticos:crear'` y ofreciendo un botón seguro para retornar al catálogo general.

---

## 3. Pasos para Registrar un Punto Crítico

### Paso 1: Ingreso al Formulario de Creación
1. Inicie sesión en la plataforma web con credenciales de **Administrador**.
2. Diríjase al menú lateral y seleccione **Puntos Críticos** (o navegue a `/admin/puntos-criticos`).
3. En la cabecera superior, haga clic en el botón primario teal **`+ Nuevo Punto Crítico`**.

### Paso 2: Completar la Identificación y Clasificación Operativa
En la sección **1. Identificación y Clasificación Operativa**, ingrese los siguientes datos:
* **Nombre del Sector / Punto Crítico (Obligatorio):** Ingrese un nombre descriptivo de entre 3 y 150 caracteres (ej: *"Humedal Angachilla - Pasaje Los Robles"* o *"Socavón Ribera Calle General Lagos"*).
* **Tipo de Amenaza / Riesgo (Obligatorio):** Seleccione del menú desplegable una de las amenazas canónicas reconocidas por la Municipalidad de Valdivia:
  * *Inundación*
  * *Desborde de Río*
  * *Remoción en Masa / Deslizamiento*
  * *Caída de Árboles*
  * *Corte de Ruta*
  * *Colapso Estructural*
  * *Incendio de Interfase*
  * *Anegamiento de Calzada*
  * *Otro:* Si selecciona esta opción, el sistema desplegará automáticamente un campo de texto para detallar el riesgo específico (mínimo 3 caracteres).
* **Prioridad Operativa (Obligatorio):** Seleccione el nivel de urgencia territorial:
  * `Baja`: Monitoreo preventivo ordinario.
  * `Media`: Vigilancia regular durante alertas tempranas meteorológicas.
  * `Alta`: Riesgo significativo de interrupción vial o afectación habitacional.
  * `Crítica`: Peligro inminente para la vida humana o colapso de infraestructura básica.
* **Delegación Territorial Asociada (Opcional):** Asigne la delegación municipal a cargo de la zona geográfica (Norte, Sur, Costa, Calle Calle) o deje en *General Comunal*.
* **Descripción y Antecedentes Operativos (Opcional):** Describa el contexto del sector, puntos de referencia, vías de acceso o precauciones para patrullas en terreno (hasta 1.000 caracteres).
* **Estado Activo (Checkbox):** Manténgalo marcado (por defecto) para que el punto quede inmediatamente habilitado para misiones de prevención.

### Paso 3: Definir la Geolocalización Territorial (Mapa Interactivo)
En la sección **2. Geolocalización Territorial**:
1. **Selección Visual en el Mapa:**
   * Haga clic sobre el mapa cartográfico de Valdivia en la posición exacta del sector.
   * Aparecerá el marcador distintivo municipal con pin rojo.
   * Si requiere mayor precisión, puede **arrastrar el marcador** directamente hasta la coordenada deseada.
2. **Entrada Manual de Coordenadas:**
   * Si conoce las coordenadas exactas obtenidas por GPS o instrumentos topográficos, escríbalas en los campos **Latitud** y **Longitud**. El marcador se reubicará automáticamente en el mapa.
3. **Radio de Afectación (Metros):**
   * Ingrese el radio estimado de impacto o cobertura (entre 1 y 50.000 metros; por defecto: 50 m).
4. **Centrado Rápido:**
   * En caso de extraviar la vista del mapa, use el botón **`Centrar Valdivia`** para restablecer el enfoque en el centro comunal (`-39.81422, -73.24589`).

### Paso 4: Guardar el Registro
1. Revise los datos ingresados.
2. Haga clic en el botón primario **`Guardar Punto Crítico`**.
3. El sistema validará la información y enviará la solicitud al servidor:
   * **Éxito:** Se desplegará una notificación toast institucional y una pantalla de confirmación informando el código oficial correlativo asignado automáticamente por el backend (por ejemplo: `PC-SUR-003`). Tras 1,2 segundos el sistema redirigirá al catálogo.
   * **Fallo de Validación:** Los campos con inconsistencias se marcarán en rojo con mensajes explicativos claros.

---

## 4. Validaciones y Mensajes de Error Frecuentes

| Campo / Condición | Regla de Validación | Mensaje Desplegado en Pantalla |
|---|---|---|
| **Nombre vacío o muy corto** | Mínimo 3 caracteres | *"El nombre es obligatorio y debe contener al menos 3 caracteres."* |
| **Nombre muy extenso** | Máximo 150 caracteres | *"El nombre no puede exceder los 150 caracteres."* |
| **Tipo de riesgo "Otro" vacío** | Mínimo 3 caracteres | *"Por favor especifique el tipo de riesgo (mínimo 3 caracteres)."* |
| **Coordenada Latitud inválida** | Valor decimal entre -90 y 90 | *"La latitud es obligatoria y debe ser un valor válido entre -90 y 90."* |
| **Coordenada Longitud inválida** | Valor decimal entre -180 y 180 | *"La longitud es obligatoria y debe ser un valor válido entre -180 y 180."* |
| **Radio de afectación fuera de rango** | Entero entre 1 y 50.000 | *"El radio de afectación debe ser un número entero entre 1 y 50.000 metros."* |
| **Acceso no autorizado (HTTP 403)** | Token sin permiso `'puntos_criticos:crear'` | *"Acceso Restringido: Se requieren privilegios de Administrador..."* |

---

## 5. Integración con otros Repositorios y Tiempo Real

* **Autogeneración del Código Correlativo (`sgrai-api`):** El frontend no genera el código identificador (`PC-{PREFIJO}-{001}`). Es calculado atómicamente por la API basándose en la delegación y la correlación registrada en la tabla `prevencion`.
* **Persistencia Espacial en Base de Datos (PostGIS):** Las coordenadas registradas se guardan en columnas decimales (`latitud`, `longitud`) y en la columna espacial `geom` con proyección estándar WGS84 (`SRID 4326`).
* **Actualización en Tiempo Real (Socket.io):** Al crear el punto, el backend emite el evento `punto_critico:creado` a las salas autorizadas (`administrador`, `supervisor`, `encargado`). Los usuarios que se encuentren viendo la tabla o el mapa comunal recibirán el nuevo punto sin requerir refresco manual de la página.
* **Continuidad Operativa (`sgrai-pwa`):** Los puntos críticos creados desde este módulo quedan inmediatamente a disposición del Encargado para la asignación de patrullas verificadoras y cuadrillas territoriales mediante eventos de prevención (HU-30).
