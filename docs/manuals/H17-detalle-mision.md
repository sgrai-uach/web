# Manual de Usuario: H17 - Consulta Detallada de Misión Operativa

Este manual documenta el funcionamiento y uso de la funcionalidad de **Detalle de Misión** en la plataforma web del Sistema de Gestión de Recursos para Atención de Incidentes (SGRAI) de la Municipalidad de Valdivia.

---

## 1. Información General

- **Rol al que está dirigido:** Encargado de Operaciones, Supervisor Estratégico y Administrador General.
- **Objetivo de la funcionalidad:** Permitir al Encargado consultar en cualquier momento la información exhaustiva de cualquier misión táctica (incidente o punto preventivo vinculado, unidad y recursos asignados, bitácora de tiempos, diagnósticos técnicos y evidencias fotográficas) mediante un botón claramente visible (**"Ver Detalles"**), desplegando una vista modal superpuesta que **no provoca pérdida de contexto** ni reinicio de filtros en el listado o tablero principal.
- **Vistas desde donde se invoca:** 
  - Panel lateral de incidente (**Drawer**) en `/gestion/centro-incidentes` (Centro de Mando).
  - Listados o tarjetas de misiones operativas vinculadas.

---

## 2. Acceso y Control de Permisos (RBAC)

Para consultar el detalle de una misión, la API y la plataforma web exigen el permiso táctico `misiones:leer`:

| Rol | Permiso | Acceso al Detalle |
|---|---|---|
| **Encargado de Operaciones** | `misiones:leer`, `misiones:asignar` | **Permitido (200 OK)** |
| **Administrador General** | Acceso total | **Permitido (200 OK)** |
| **Supervisor Estratégico** | `misiones:leer` | **Permitido (200 OK)** |
| **Operador Call Center / Informante** | Sin permisos de misiones | **Denegado (403 Forbidden)** |

Si un usuario no autorizado intenta consultar la misión, el sistema despliega una pantalla amigable de **Acceso Restringido** con la advertencia:
> *"No tienes permisos de Encargado o Administrador para visualizar el detalle de esta misión."*

---

## 3. Flujo Paso a Paso para Visualizar una Misión

### Paso 1: Localizar el Incidente en el Tablero Kanban o Centro de Mando
1. Ingresa a la sección **Centro de Mando / Incidentes** (ruta canónica `/gestion/centro-incidentes`).
2. Localiza la tarjeta del incidente deseado (las tarjetas con misiones activas muestran una etiqueta informativa, ej. `1 misión` o `2 misiones`).
3. Haz clic sobre la tarjeta para abrir el panel lateral de detalle del incidente (**Drawer**).

### Paso 2: Presionar el Botón "Ver Detalles" en la Misión
1. En el panel lateral, desplázate a la sección **"Misiones y Equipos en Terreno"**.
2. Cada tarjeta de misión cuenta con un botón en la esquina inferior derecha:
   - **`[ 👁 Ver Detalles ]`**
3. Haz clic sobre el botón de la misión que deseas auditar.

### Paso 3: Exploración de las Secciones Estructuradas en el Modal
Al hacer clic, se abre una ventana modal de alta prioridad (`z-index: 2010`) sobre el panel lateral, organizada en los siguientes módulos:

#### 1. Cabecera y Estado Operativo
- **Código Oficial:** Identificador municipal único (ej. `MIS-2026-0001`).
- **Tipo de Misión:** `VERIFICACION`, `ATENCION CUADRILLA`, `PREVENCION`, `RECUPERACION` o `ASISTENCIA SOCIAL`.
- **Badges Semánticos de Estado:**
  - `PLANIFICADA`: Franja gris neutral.
  - `DESPACHADA`: Franja verde azulada institucional (Teal).
  - `EN CURSO`: Franja verde esmeralda activa.
  - `COMPLETADA`: Franja verde confirmada.
  - `CANCELADA`: Franja gris pizarra.
  - `RECHAZADA`: Franja roja de alerta.
- **Prioridad Táctica:** `CRITICA` (rojo), `ALTA` (naranja), `MEDIA` (ámbar), `BAJA` (teal).
- **Metadatos de Tiempo:** Fechas y horas de creación, despacho, inicio de operaciones y cierre.

#### 2. Alerta de Justificación de Rechazo (si aplica)
Si la cuadrilla en terreno rechazó la misión asignada, se exhibe un banner destacado en color rojo de alerta que explicita el motivo documentado por el delegado (ej. *"Vía cortada por derrumbe de ladera, sin acceso para el camión municipal"*).

#### 3. Incidente o Punto Crítico Preventivo Asociado
- **Si está asociada a un incidente:** Despliega código interno (`INC-XXXX`), código de seguimiento ciudadano de 8 dígitos, tipo de emergencia, dirección exacta con ícono cartográfico, delegación territorial municipal, estado y prioridad.
  - **Indicador FIBE:** Si el caso involucra damnificados o familias vulnerables, se destaca el distintivo púrpura **"REQUIERE ASISTENCIA SOCIAL (FIBE)"**.
- **Si es misión preventiva (sin incidente previo):** Muestra el código del punto crítico, nombre del punto, coordenadas geográficas GPS y descripción técnica de los trabajos preventivos.

#### 4. Unidad y Recursos Logísticos Desplegados
- **Cuadrilla Operativa:** Nombre de la cuadrilla, estado en terreno (actualizado automáticamente a `Disponible` al cerrar la misión), delegación territorial y delegado municipal a cargo (con nombre y correo institucional).
  - **Tabla de Recursos Asignados:** Consolidado de camionetas 4x4, camiones tolva, motobombas, motosierras y herramientas menores, mostrando las asignaciones activas vigentes junto con su clasificación (`Individual` / `Granel`) y cantidad con unidad de medida.
- **Patrulla Verificadora:** Nombre de la patrulla, estado, líder de patrulla y delegación.

#### 5. Bitácora Cronológica de Tiempos
Línea de tiempo vertical con los hitos operativos registrados en la misión:
- Creación y despacho desde el Centro de Mando.
- Llegada al sitio del suceso e inicio de labores.
- Solicitudes de apoyo adicional en terreno (`Apoyo Adicional Solicitado` / `APOYO_SOLICITADO`, HU-44), destacadas con ícono de alerta en rojo.
- Últimas actualizaciones emitidas desde terreno y cierre de misión (`Misión completada`).
- Cada hito detalla fecha (`YYYY-MM-DD`), hora (`HH:MM:SS`) y glosa explicativa en lenguaje natural.

#### 6. Informes Técnicos y Reportes de Terreno
Desglose cronológico de las evaluaciones emitidas por los funcionarios municipales en terreno:
- **Informes de Patrulla Verificadora (`EVALUACION_PRIORIDAD` / `VERIFICACION_CIERRE`):** Funcionario evaluador, diagnóstico técnico, comparativa de prioridad y afectación por familias/viviendas, dictamen operativo e indicador de Ficha FIBE.
- **Informe Técnico Final de Cuadrilla (`REPORTE_CUADRILLA`, HU-68 / HU-44):** Delegado de cuadrilla evaluador, chip de estado final del terreno (`Controlado`, `Estable`, `Finalizado`, `Requiere seguimiento`, `Crítico` o `Inaccesible`), horas hombre invertidas, resumen de faenas ejecutadas, daños estimados, tabla de **Materiales e Insumos Consumidos** (con cantidad, unidad y observación) y, cuando corresponda, el chip **"Apoyo Solicitado"** junto al bloque **"Detalle de Apoyo Requerido"**.

---

## 4. Galería de Evidencia Multimedia y Visor Lightbox (HU-17 / HU-43)

Cada informe técnico emitido desde terreno (y el detalle del incidente cuando recibe adjuntos directos) incluye su galería de archivos adjuntos con **actualización automática en tiempo real**: cuando un Delegado de Cuadrilla o Patrulla carga evidencia desde terreno (`adjunto:creado`), las miniaturas aparecen de inmediato sin necesidad de recargar la página.

1. **Miniaturas Clicables:**
   - **Fotografías** (`image/jpeg`, `image/png`, `image/webp`): se muestra una miniatura de previsualización optimizada.
   - **Videos** (`video/mp4`, `video/webm`, `video/quicktime`): se muestra un ícono de video con la etiqueta `VIDEO`, el nombre del archivo y su tamaño.
   - **Documentos técnicos** (`application/pdf`): se muestra un ícono de documento con la etiqueta `PDF`, el nombre del archivo y su peso formateado (ej. `500 KB`).
2. **Visor en Pantalla Completa (Lightbox):**
   - Al hacer clic sobre cualquier miniatura, se abre el visor de alta fidelidad con fondo oscuro:
     - **Fotografías:** visualización ampliada sin distorsiones.
     - **Videos:** reproductor integrado con controles y reproducción progresiva (*streaming* `HTTP 206 Partial Content`), más botón **"Descargar Video"**.
     - **Documentos PDF:** vista previa embebida dentro del visor y botón **"Descargar PDF"**.
   - Muestra el nombre oficial del archivo y su tamaño formateado.
3. **Cierre del Visor:**
   - Presiona la **"×"** superior derecha del visor.
   - O presiona la tecla `Escape` en tu teclado.
   - O haz clic fuera del contenido del visor.

---

## 5. Manejo de Estados Vacíos (*Empty States*)

Para garantizar una experiencia de usuario clara y sin ambigüedades:

- **Misión sin reportes de terreno aún:**  
  Si la unidad fue recién despachada o aún no emite informes, se despliega una tarjeta contenedora sobria con el mensaje:  
  > **"Sin reportes aún"**  
  > *"La unidad aún no ha emitido informes técnicos en terreno. Los reportes y evaluaciones aparecerán aquí a medida que el equipo los sincronice."*

- **Reporte de terreno sin fotografías adjuntas:**  
  Si el funcionario evaluador emitió un reporte exclusivamente textual, la sección de evidencias exhibe amigablemente:  
  > *"Sin evidencias fotográficas adjuntas"*

---

## 6. Salida sin Pérdida de Contexto

Para cerrar la vista detallada de la misión:
- Haz clic en el botón **"Cerrar Detalle"** al pie del modal.
- O haz clic en la **"×"** de la cabecera.
- O presiona la tecla `Escape`.

Al cerrarse el modal:
- El usuario **permanece exactamente en el panel lateral del incidente original**.
- No se reinicia el scroll, ni la columna del tablero Kanban, ni los filtros de búsqueda aplicados.

---

## 7. Relación con Otros Repositorios del Sistema

- **`sgrai-api`:** Provee el endpoint REST `GET /api/misiones/{id}`, recibe los adjuntos vía `POST /api/evidencia/adjuntos` (permiso `reportes:crear`), sirve la multimedia bajo `/uploads/evidencia/` con soporte `HTTP 206 Partial Content` y emite el evento WebSocket `adjunto:creado`.
- **`sgrai-pwa`:** Es la aplicación móvil utilizada en terreno por Delegados de Cuadrilla y Líderes de Patrulla para capturar y enviar reportes técnicos, fotografías, videos y documentos PDF (incluyendo cola de sincronización *offline* en IndexedDB) que se visualizan en tiempo real en esta pantalla.
