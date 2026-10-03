# Manual de Usuario: H18 - Vista Rápida y KPIs de Incidentes para Encargado

Este manual documenta el funcionamiento y uso de la **Vista Rápida y KPIs de Incidentes del Día** integrada en la cabecera del **Centro de Mando / Incidentes** (`/centro-incidentes`) en la plataforma web del Sistema de Gestión de Recursos para Atención de Incidentes (SGRAI) de la Municipalidad de Valdivia.

---

## 1. Información General

- **Rol al que está dirigido:** Encargado de Operaciones / Jefe de Centro de Mando (Dirección de Gestión de Riesgos de Desastres).
- **Objetivo de la funcionalidad:** Proporcionar al Encargado un panorama rápido e interactivo de la jornada actual ("panorama del día"), consolidando el volumen de emergencias en sus 5 estados operativos mediante un semáforo de priorización visual y permitiendo enfocar de forma ágil el tablero táctico sin perder la visión global.
- **Ruta de acceso en la plataforma web:** `/centro-incidentes` (o `/mando`).

---

## 2. Acceso y Control de Permisos (RBAC)

Para interactuar con el panel de KPIs se valida la autorización del usuario:

1. **Usuario con rol Encargado:** El sistema autentica la identidad y otorga acceso pleno a los indicadores, contadores de delegación y al tablero de incidentes.
2. **Usuario no autorizado (otro rol o sin permisos):** Si un usuario sin el permiso `incidentes:kanban` intenta ingresar a `/centro-incidentes`, el sistema desplegará la pantalla de advertencia:
   - **"Acceso Restringido — 403 Forbidden"** bloqueando la consulta a la API de KPIs y al tablero táctico.

> En entorno de desarrollo o pruebas, el selector superior de sesión permite alternar entre el usuario **Encargado (Con Permisos)** y un usuario no autorizado para auditar esta validación.

---

## 3. Estructura de las Tarjetas de Estado y Semáforo de Urgencia

El panel superior agrupa los casos del día en **5 tarjetas interactivas**, diseñadas bajo el estándar visual plano institucional de la Municipalidad de Valdivia y con un semáforo semántico para priorizar el despacho de recursos:

| Tarjeta / Estado | Semáforo Visual | Significado Táctico | Acción Típica del Encargado |
|---|---|---|---|
| **Reportados** | **Rojo / Alerta Alta** (`#D32F2F`) | Nuevos avisos ciudadanos o telefónicos que aún no han sido verificados. | Despachar inmediatamente una Patrulla Verificadora a terreno. |
| **En Verificación** | **Amarillo / Ámbar** (`#E65100`) | Patrullas verificadoras evaluando in situ la gravedad y afectación. | Monitorear reporte de terreno para confirmar si requiere cuadrilla. |
| **En Atención** | **Amarillo / Naranja** (`#D97706`) | Cuadrillas operativas municipales mitigando activamente el incidente. | Supervisar tiempos de respuesta y dotación logística desplegada. |
| **No Abordables** | **Gris Pizarra / Neutro** (`#3B3F45`) | Avisos descartados, duplicados o fuera de competencia municipal (ej. alta tensión). | Revisar justificación de descarte o derivar a empresa competente. |
| **Resueltos** | **Verde / Éxito** (`#2E7D32`) | Emergencias mitigadas y cerradas con éxito durante la jornada de hoy. | Registrar cierre de bitácora y liberar recursos asociados. |

Cada tarjeta muestra en tipografía destacada (`28px`) el número de casos registrados en la jornada, su ícono representativo (`lucide-react`) y una breve descripción de apoyo.

---

## 4. Filtrado Territorial por Delegación

En la cabecera del panel dispones del selector desplegable de **Delegación Territorial**:

1. **Toda la Comuna (Valdivia):** Vista por defecto que suma los incidentes de toda la jurisdicción comunal.
2. **Delegaciones Específicas:** Permite acotar instantáneamente tanto los contadores superiores como las columnas del tablero a una delegación en particular:
   - *Delegación Norte*
   - *Delegación Sur*
   - *Delegación Costa*
   - *Delegación Calle Calle*

Al cambiar de delegación, los contadores numéricos y las columnas del Kanban se sincronizan automáticamente sin requerir recargar la página.

---

## 5. Navegación e Interactividad (Enfoque de Columnas)

El panel superior está sincronizado bidireccionalmente con el tablero Kanban:

1. **Clic en una Tarjeta de Estado:**
   - Al pulsar cualquiera de las 5 tarjetas (ej. *"En Atención"*), el sistema activa automáticamente el filtro **"Solo hoy"** en la barra de filtros tácticos.
   - La pantalla realiza un desplazamiento suave (*smooth scroll*) horizontal hacia la columna seleccionada y la resalta con un marco de foco pulsante (`columnaResaltada`).
   - La tarjeta superior muestra el distintivo **"Enfocado"**.
2. **Deseleccionar / Quitar Enfoque:**
   - Vuelve a hacer clic sobre la misma tarjeta de estado para retirar el resalte visual.
   - Puedes desmarcar la casilla **"Solo hoy"** en la barra de filtros o hacer clic en **"Limpiar filtros"** para volver a ver los incidentes históricos acumulados.

---

## 6. Sincronización en Tiempo Real (Socket.io)

El panel cuenta con invalidación reactiva inmediata ante cualquier cambio operacional en terreno:

- En la cabecera superior verás la insignia **"En Vivo"** con un indicador verde cuando la conexión WebSocket con `sala:encargados` está activa.
- **Nuevo incidente ingresado:** Si un ciudadano reporta un incidente vía chatbot o un operador lo ingresa en Call Center, el contador de **Reportados** se actualiza automáticamente en segundo plano.
- **Cambio de estado o cierre:** Cuando una cuadrilla actualiza una misión desde `sgrai-pwa` (por ejemplo, pasando de atención a resuelto), el contador de **En Atención** disminuye y el de **Resueltos** incrementa al instante, sin parpadeos de pantalla ni pérdidas de datos en formularios.
- **Actualización manual:** En caso de intermitencia de red, puedes pulsar el botón **"Actualizar"** con el ícono circular para sincronizar manualmente contadores y tarjetas desde el servidor.

---

## 7. Casos Especiales y Mensajes de Error

- **Error de Conexión:** Si el servidor de API no responde, el sistema mantendrá los últimos datos en caché visible y mostrará una alerta contextual: *"No fue posible cargar los contadores de incidentes del día"*.
- **Zona Horaria Municipal:** Todos los cálculos de "Hoy" están normados bajo la zona horaria oficial chilena (`America/Santiago`), evitando desfases de incidentes ocurridos cerca de la medianoche respecto al horario universal UTC.

---

## 8. Relación con Otros Repositorios del Sistema

- **`sgrai-api`:** Provee el endpoint optimizado `GET /api/incidentes/kpis` (con agregación condicional SQL e índices compuestos) y emite los eventos `incidente:creado` e `incidente:actualizado` por WebSockets.
- **`sgrai-pwa`:** Es la aplicación en terreno de las patrullas y cuadrillas, cuyas transiciones de estado gatillan las actualizaciones en vivo que el Encargado visualiza en este panel.
