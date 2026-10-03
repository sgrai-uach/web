# Manual de Usuario: H17 - Consulta Detallada de Misión Operativa

Este manual documenta el funcionamiento y uso de la funcionalidad de **Detalle de Misión** en la plataforma web del Sistema de Gestión de Recursos para Atención de Incidentes (SGRAI) de la Municipalidad de Valdivia.

---

## 1. Información General

- **Rol al que está dirigido:** Encargado de Operaciones, Supervisor Estratégico y Administrador General.
- **Objetivo de la funcionalidad:** Permitir al Encargado consultar en cualquier momento la información exhaustiva de cualquier misión táctica (incidente o punto preventivo vinculado, unidad y recursos asignados, bitácora de tiempos, diagnósticos técnicos y evidencias fotográficas) mediante un botón claramente visible (**"Ver Detalles"**), desplegando una vista modal superpuesta que **no provoca pérdida de contexto** ni reinicio de filtros en el listado o tablero principal.
- **Vistas desde donde se invoca:** 
  - Panel lateral de incidente (**Drawer**) en `/centro-incidentes` (Centro de Mando).
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
1. Ingresa a la sección **Centro de Mando / Incidentes** (`/centro-incidentes`).
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
- **Cuadrilla Operativa:** Nombre de la cuadrilla, estado en terreno, delegación territorial y delegado municipal a cargo (con nombre y correo institucional).
  - **Tabla de Recursos Asignados:** Consolidado de camionetas 4x4, camiones tolva, motobombas, motosierras y herramientas menores, con su cantidad asignada.
- **Patrulla Verificadora:** Nombre de la patrulla, estado, líder de patrulla y delegación.

#### 5. Bitácora Cronológica de Tiempos
Línea de tiempo vertical con los hitos operativos registrados en la misión:
- Creación y despacho desde el Centro de Mando.
- Llegada al sitio del suceso e inicio de labores.
- Últimas actualizaciones emitidas desde terreno.
- Cada hito detalla fecha (`YYYY-MM-DD`), hora (`HH:MM:SS`) y glosa explicativa.

#### 6. Informes Técnicos y Reportes de Terreno
Desglose cronológico de las evaluaciones emitidas por los funcionarios municipales en terreno:
- **Funcionario Evaluador:** Nombre completo, RUT y correo electrónico institucional.
- **Diagnóstico y Resumen Técnico:** Estado real de la infraestructura comunal y gravedad de la afectación.
- **Acciones Ejecutadas:** Trabajos de despeje, contención, bombeo o mitigación ejecutados en el lugar.
- **Magnitud del Daño:** Personas afectadas y descripción de daños a bienes públicos o privados.
- **Distintivos:** Indicador si la unidad *Requiere Apoyo Adicional* en terreno.

---

## 4. Galería de Evidencia Multimedia y Visor Lightbox

Cada informe técnico emitido desde terreno incluye su galería de archivos adjuntos:

1. **Miniaturas Clicables:**
   - Para fotografías y videos (`.jpg`, `.png`, `.mp4`), se genera una previsualización gráfica optimizada.
   - Para documentos técnicos o actas (`.pdf`, `.docx`), se muestra un ícono de documento con el nombre del archivo y su peso formateado (ej. `1.5 MB`).
2. **Visor en Pantalla Completa (Lightbox):**
   - Al hacer clic sobre cualquier fotografía, se abre un visor de alta fidelidad con fondo oscuro.
   - Permite inspeccionar los detalles de la evidencia fotográfica sin distorsiones.
   - Muestra el nombre oficial del archivo y tamaño en bytes.
3. **Cierre del Visor:**
   - Presiona la **"×"** superior derecha del visor.
   - O presiona la tecla `Escape` en tu teclado.
   - O haz clic fuera de la fotografía.

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

- **`sgrai-api`:** Provee el endpoint REST `GET /api/misiones/{id}`, valida la autorización RBAC con la cabecera `X-User-Id` y resuelve la multimedia almacenada bajo `/uploads/evidencia/`.
- **`sgrai-pwa`:** Es la aplicación móvil utilizada en terreno por Delegados de Cuadrilla y Líderes de Patrulla para enviar los reportes técnicos y capturas fotográficas que se visualizan en esta pantalla.
