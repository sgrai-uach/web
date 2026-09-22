# Manual de Usuario: H15 - Tablero Kanban de Incidentes para Encargado (Centro de Incidentes)

Este manual documenta el funcionamiento y uso de la pantalla **Centro de Incidentes** (`/centro-incidentes`) en la plataforma web del Sistema de Gestión de Recursos para Atención de Incidentes (SGRAI) de la Municipalidad de Valdivia.

---

## 1. Información General

- **Rol al que está dirigido:** Encargado de Operaciones / Jefe de Centro de Mando (Dirección de Gestión de Riesgos de Desastres).
- **Objetivo de la funcionalidad:** Permitir al Encargado monitorear de forma consolidada todos los incidentes comunales agrupados según su estado operativo en el ciclo de vida ICS, recibir alertas reactivas en tiempo real ante nuevos reportes o cambios de estado, y consultar en profundidad la información táctica de cada caso (denunciante, ubicación, misiones operativas, cuadrillas y recursos desplegados).
- **Ruta de acceso en la plataforma web:** `/centro-incidentes`.

---

## 2. Acceso y Control de Permisos (RBAC)

Para ingresar a esta pantalla se valida la autorización del usuario:

1. **Usuario con rol Encargado:** El sistema autentica la identidad y otorga acceso pleno a las 5 columnas del tablero y las herramientas de filtrado.
2. **Usuario no autorizado (otro rol o sin permisos):** Si un usuario sin rol de Encargado intenta ingresar a `/centro-incidentes`, el sistema desplegará la pantalla de advertencia:
   - **"Acceso Restringido — 403 Forbidden"** indicando que la vista requiere el permiso táctico `incidentes:kanban`.

> En entorno de desarrollo y pruebas, el encabezado superior incluye un selector de sesión que permite alternar entre el usuario **Encargado (Con Permisos)** y un **Usuario No Autorizado (403)** para verificar este comportamiento.

---

## 3. Estructura del Tablero Kanban

El tablero organiza los casos en **5 columnas** que reflejan fielmente el ciclo de vida de atención de emergencias:

| Columna | Estado en Sistema | Significado Operativo | Distintivo Visual |
|---|---|---|---|
| **Pendiente / Reportado** | `REPORTADO` | Avisos ingresados desde chatbot o call center en espera de revisión táctica. | Franja Ámbar |
| **En Verificación** | `VERIFICANDO` | Patrulla verificadora asignada o dirigiéndose a evaluar magnitud a terreno. | Franja Azul |
| **En Atención** | `EN_ATENCION` | Cuadrillas operativas y recursos asignados trabajando activamente en la mitigación. | Franja Naranja |
| **Resuelto** | `RESUELTO` | Emergencia controlada y finalizada exitosamente por personal municipal. | Franja Verde |
| **No Abordable** | `NO_ABORDABLE` | Caso descartado, duplicado o fuera de competencia municipal (ej. alta tensión). | Franja Gris Pizarra |

Cada columna muestra en su cabecera un contador en formato `Visibles / Total Registrados`.

---

## 4. Consulta de Detalle del Incidente (Panel Lateral Deslizante)

Al hacer clic (o presionar `Enter`) sobre cualquier tarjeta del tablero:

1. Se despliega automáticamente un panel lateral deslizante (**Drawer**) desde el borde derecho de la pantalla sin perder el contexto visual del tablero.
2. El panel consulta a la API (`GET /api/incidentes/:id`) y despliega los siguientes bloques:
   - **Resumen del Incidente:** Código interno (ej. `INC-58291045`), código de seguimiento al ciudadano, tipo de afectación, origen del aviso y relato descriptivo.
   - **Ubicación Territorial:** Dirección exacta, sector o delegación asignada y coordenadas geográficas GPS.
   - **Informante y Operador:** Nombre y teléfono del informante (resguardando privacidad interna), operador que registró el caso y encargado asignado.
   - **Misiones y Equipos en Terreno:** Desglose de misiones operativas despachadas, cuadrillas y patrullas asignadas, y justificación detallada en caso de que una cuadrilla haya rechazado una misión.
   - **Recursos Logísticos Desplegados:** Tabla con vehículos, herramientas y maquinaria asignados a través de las cuadrillas (ej. camionetas 4x4, motobombas, motosierras).
3. Para cerrar el panel, haz clic en la **"×"** superior o presiona fuera del recuadro.

---

## 5. Filtros y Búsqueda Táctica

En la parte superior del tablero dispones de herramientas para acotar los incidentes visibles:

- **Búsqueda textual:** Permite buscar por código (ej. `INC-5829`), dirección o palabras clave de la descripción.
- **Filtro de Prioridad:** Selecciona entre `Crítica`, `Alta`, `Media` o `Baja`.
- **Filtro de Afectación:** Filtra por categorías de emergencia (ej. *Inundación*, *Caída de árbol*, *Derrumbe*).
- **Limpiar Filtros:** Restaura la visualización completa del tablero.
- **Actualizar Tablero:** Realiza una sincronización manual inmediata con la base de datos municipal.

---

## 6. Sincronización en Tiempo Real (Socket.io)

El tablero cuenta con reactividad automática mediante WebSockets:

- En el encabezado superior verás el indicador **"Tiempo Real Activo"** con un punto verde.
- **Nuevo incidente ingresado:** Cuando un informante reporta un caso por chatbot o un operador lo ingresa en Call Center, aparece instantáneamente en la columna *Pendiente / Reportado* sin recargar la página.
- **Cambio de estado:** Cuando una patrulla o cuadrilla actualiza el avance de una misión en terreno (a través de `sgrai-pwa`), la tarjeta se desplaza automáticamente a su nueva columna operativa en el tablero.

---

## 7. Carga Histórica de Incidentes (Soporte Municipal y SENAPRED)

Para responder a los requerimientos de auditoría histórica de la Municipalidad de Valdivia y SENAPRED sin sobrecargar la memoria del navegador:

- Cada columna implementa carga bajo demanda (*lazy loading*).
- Si una columna contiene más registros que los primeros 20 cargados, se muestra al final el botón **"Cargar más casos"**.
- Al presionarlo, el sistema consulta la siguiente página y agrega los registros manteniendo el orden cronológico.

---

## 8. Relación con Otros Repositorios del Sistema

- **`sgrai-api`:** Provee los endpoints REST `/api/incidentes` y `/api/incidentes/:id`, valida permisos mediante la cabecera `X-User-Id` y emite los eventos de WebSocket `incidente:creado` e `incidente:actualizado`.
- **`sgrai-pwa`:** Es la aplicación móvil utilizada por las patrullas verificadoras y cuadrillas en terreno, cuyas acciones actualizan el estado de los incidentes que se reflejan en este tablero en tiempo real.
