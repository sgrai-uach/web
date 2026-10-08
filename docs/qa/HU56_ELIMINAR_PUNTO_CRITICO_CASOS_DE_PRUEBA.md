# Informe y Matriz de Casos de Prueba (QA): HU-56 — Eliminar (Desactivar) Punto Crítico del Sistema (Frontend Web)

> **Documento Oficial de Aseguramiento de Calidad (QA) — SGRAI**  
> **Proyecto:** Sistema de Gestión de Recursos para Atención de Incidentes (SGRAI) — Dirección de Gestión de Riesgos de Desastres, Municipalidad de Valdivia.  
> **Módulo:** Administración y Gestión Territorial / Prevención (`sgrai-web`).  
> **Historia de Usuario:** HU-56 — *"Como Administrador Quiero eliminar (desactivar) un punto crítico del sistema Para tener a disposición únicamente los puntos críticos más relevantes y mantener el mapa despejado de zonas que ya no representan un riesgo activo"*.  
> **Repositorio Evaluado:** `sgrai-web` (Frontend Web consumiendo la API monolítica modular `sgrai-api`).  
> **Rama Git Evaluada:** `feature/H56-eliminar-punto-critico` (mergeada en rama `develop` mediante Pull Request #21).  
> **Entorno de Pruebas:** Local (Node.js v20.x, React 19, Next.js 16 con Turbopack, Vitest v3.2.7, Leaflet 1.9, PostGIS 3.4 en PostgreSQL 16, Redis 7).  
> **Fecha de Certificación QA:** Octubre 2026.  
> **Estado de Certificación:** 🟢 **APROBADO PARA PRODUCCIÓN (100% PASS TRAS CICLO DE RE-TESTS)**.

---

## 1. Objetivos del Plan de Pruebas de QA

1. **Asegurar la Experiencia de Usuario y la Identidad Visual Institucional:**
   - Validar la integración del botón destructivo "Eliminar" en la tabla de puntos críticos, en el popup del módulo cartográfico Leaflet y en el pie de la Ficha Detallada.
   - Verificar la integración del modal de confirmación `PuntoCriticoEliminarModal` con advertencia institucional de borrado lógico para evitar pérdidas accidentales.
2. **Validar la Protección Operativa del Sistema de Comando de Incidentes (ICS):**
   - Comprobar que si el punto crítico se encuentra asociado a misiones preventivas activas en curso (`EN_CURSO`, `DESPACHADA`, `PLANIFICADA`), el sistema mantenga abierto el modal y despliegue un mensaje de error explicativo claro (`HTTP 409 Conflict`), impidiendo dejar personal operativo huérfano en terreno.
3. **Verificar la Actualización Dinámica y Reactiva (Sin Recargar Página):**
   - Comprobar que tras la eliminación exitosa (`HTTP 200 OK`), el punto crítico desaparezca de inmediato de la tabla y del mapa Leaflet, y el contador numérico del encabezado se descuente dinámicamente sin necesidad de recargar la página (`F5`).
   - Validar la integración en tiempo real con Socket.io mediante el evento `punto_critico:eliminado`.
4. **Control de Acceso Basado en Roles (RBAC) y Auditoría:**
   - Verificar que usuarios sin permiso `puntos_criticos:eliminar` o que no sean Administradores visualicen el botón deshabilitado con un indicador explicativo.
   - Comprobar que se transmita el identificador del usuario que ejecutó la baja para garantizar la trazabilidad en base de datos (`eliminado_por_id`).

---

## 2. Matriz de Trazabilidad de Criterios de Aceptación

| Criterio de Aceptación (CA) | Descripción del Criterio | Casos de Prueba Asociados | Estado QA |
|---|---|---|:---:|
| **CA-1** | El sistema debe permitir al administrador seleccionar un punto crítico desde el listado o directamente desde el módulo cartográfico y ejecutar la acción de eliminar. | `CP-H56-WEB-01`, `CP-H56-WEB-02`, `CP-H56-WEB-03` | **CUMPLIDO** |
| **CA-2** | El sistema debe desplegar un modal de confirmación advirtiendo sobre la desactivación del punto crítico antes de ejecutar la acción definitiva. | `CP-H56-WEB-04`, `CP-H56-WEB-05` | **CUMPLIDO** |
| **CA-3** | Si el punto crítico está asociado a un evento preventivo activo o tiene una patrulla verificadora actualmente asignada en el lugar, el sistema debe impedir su eliminación y mostrar un mensaje de error explicativo. | `CP-H56-WEB-06`, `CP-H56-WEB-07` | **CUMPLIDO** |
| **CA-4** | La eliminación debe realizarse mediante un borrado lógico (soft delete) en la base de datos, para asegurar que no se pierda la trazabilidad de eventos preventivos pasados asociados a esa coordenada. | `CP-H56-WEB-04`, `CP-H56-WEB-08` | **CUMPLIDO** |
| **CA-5** | Una vez procesada la eliminación, el sistema debe mostrar una notificación visual de éxito y actualizar dinámicamente el listado y el mapa (desapareciendo el marcador) sin necesidad de recargar la página. | `CP-H56-WEB-09`, `CP-H56-WEB-10`, `CP-H56-WEB-11`, `CP-H56-WEB-12`, `CP-H56-WEB-15` | **CUMPLIDO** |
| **CA-6** | Se debe dejar registro en la base de datos sobre la fecha, hora y usuario que desactivó el punto crítico. | `CP-H56-WEB-13` | **CUMPLIDO** |

---

## 3. Matriz Consolidada de Casos de Prueba (13 Columnas)

| ID Caso | Título del Caso de Prueba | Tipo de Prueba | Nivel | Prioridad | Precondición | Datos de Prueba (Payload / Headers / Query) | Resultado Esperado | Resultado Obtenido | Estado | Fecha / Hora Ejecución | Fecha / Hora Re-Test | Solución / Commit |
|---|---|---|---|---|---|---|---|---|:---:|:---:|:---:|---|
| `BUG-H56-WEB-01` | Omisión de permisos requiredPermissions en /admin/puntos-criticos dentro del menú lateral (navItems.ts) | Configuración / RBAC | UI / Layout | Alta | Usuario autenticado con rol Administrador o permisos granulares navegando en el menú lateral | Inspección del array NAV_GROUPS en src/components/layout/navItems.ts | Ítem 'Puntos Críticos' visible con requiredPermissions: ['puntos_criticos:leer', 'seguridad:roles:gestionar'] | Ítem omitía requiredPermissions provocando inconsistencia de renderizado o bloqueo indebido en la barra lateral | **CORREGIDO** | 03/10/2026 19:15 | 05/10/2026 01:30 | `fix(layout): restaurar requiredPermissions en item puntos-criticos y limpiar unused vars (BUG-HU56-WEB-01, BUG-HU56-WEB-02)` |
| `BUG-H56-WEB-02` | Fallo de compilación estática y linter de Next.js por variables y estados no utilizados en componentes | Calidad de Código / Lint | Código / Build | Media | Ejecución de pipeline de CI o build local con npm run lint y npm run build | Variables USUARIOS_PRUEBA, setUsuarioActivoId, activo en admin/recursos y PuntosCriticosFiltros.tsx | Compilación limpia sin warnings de typescript ni linter (@typescript-eslint/no-unused-vars) | Advertencias y bloqueos en CI por unused variables en archivos modificados | **CORREGIDO** | 03/10/2026 19:40 | 05/10/2026 01:30 | `fix(layout): restaurar requiredPermissions en item puntos-criticos y limpiar unused vars (BUG-HU56-WEB-01, BUG-HU56-WEB-02)` |
| `BUG-H56-WEB-03` | Puntos críticos desactivados permanecían visibles en tabla y mapa tras eliminación lógica en lugar de removerse | Funcional / Estado | UI / Componente | Crítica | Punto crítico desactivado lógicamente con éxito en base de datos (activo: false) | Clic en 'Eliminar Punto Crítico' en modal de confirmación | El punto desaparece de inmediato de la tabla y del mapa sin necesidad de recargar la página (F5) | La fila y el marcador permanecían visibles mostrando badge 'Inactivo' porque el listado no filtraba activo !== false | **CORREGIDO** | 03/10/2026 20:30 | 04/10/2026 02:25 | `fix(puntos-criticos): ocultar puntos criticos inactivos y asegurar conexion con backend` |
| `BUG-H56-WEB-04` | Discrepancia en URL base del cliente API (client.ts apuntando a puerto 4000 en vez de 3001 del backend) | Integración / Red | API / Cliente | Crítica | Backend sgrai-api ejecutándose en puerto oficial 3001 | Invocación de eliminarPuntoCritico() mediante apiClient.DELETE('/api/puntos-criticos/{id}') | Petición enviada a http://localhost:3001/api/puntos-criticos/{id} retornando 200 OK | Fallo NetworkError / Failed to fetch por intentar conectarse a puerto 4000 inexistente | **CORREGIDO** | 03/10/2026 21:10 | 04/10/2026 02:25 | `fix(puntos-criticos): ocultar puntos criticos inactivos y asegurar conexion con backend` |
| `BUG-H56-WEB-05` | Inconsistencia terminológica en botones ('Desactivar' vs 'Eliminar') y restricción excesiva de permisos en service | Usabilidad / RBAC | UI / Servicio | Alta | Interfaz de usuario de administración y servicio eliminarPuntoCritico | Inspección de textos en botones, modales y validación de permisos en puntosCriticosService.ts | Textos consistentes 'Eliminar' y 'Eliminar Punto Crítico', permitiendo la acción con permiso puntos_criticos:eliminar | Botones decían 'Desactivar' confundiendo al usuario, y el servicio exigía estrictamente rol Administrador excluyendo permisos | **CORREGIDO** | 03/10/2026 22:00 | 04/10/2026 01:50 | `refactor(ui): ajustar textos a eliminar y extender permisos de eliminacion (#56)` |
| `CP-H56-WEB-01` | Despliegue de botón destructivo 'Eliminar' en la columna de acciones de la tabla para puntos críticos activos (CA-1) | Funcional | UI / Tabla | Alta | Usuario Administrador en ruta /gestion/admin/puntos-criticos con vista tabla seleccionada | Punto crítico activo 'PC-ANG-01' renderizado en la tabla | Botón rojo con ícono Trash2 y etiqueta 'Eliminar' visible y habilitado en la fila | Botón 'Eliminar' renderizado correctamente con estilo destructivo y accesible mediante teclado | **APROBADO** | 05/10/2026 09:30 | - | `feat(ui): implementar modal de confirmacion y boton de accion desactivar (#56)` |
| `CP-H56-WEB-02` | Despliegue de botón 'Eliminar' dentro del popup del marcador en el módulo cartográfico Leaflet (CA-1) | Geoespacial | UI / Mapa | Alta | Vista 'Mapa (Cartográfico)' activa con marcadores desplegados según nivel de riesgo | Clic sobre el marcador del punto crítico 'PC-ANG-01' en el mapa Leaflet | Popup emergente se abre mostrando resumen, botón 'Ver Ficha' y botón rojo 'Eliminar' | Popup despliega botón #btn-del-{id} en color rojo permitiendo iniciar la eliminación desde el mapa | **APROBADO** | 05/10/2026 09:35 | - | `feat(mapa): incorporar modulo cartografico leaflet y alternador de vistas (#56)` |
| `CP-H56-WEB-03` | Despliegue de botón 'Eliminar' en el pie de la Ficha Detallada de Punto Crítico (CA-1) | Funcional | UI / Modal | Alta | Ficha Detallada (PuntoCriticoDetalleModal) abierta en pantalla para punto activo | Inspección de la barra inferior de acciones de la ficha de detalle | Botón 'Eliminar' disponible junto a 'Editar Punto Crítico' y 'Cerrar' | Botón destructivo renderizado en el footer cerrando la ficha y abriendo el modal de confirmación | **APROBADO** | 05/10/2026 09:40 | - | `feat(ui): implementar modal de confirmacion y boton de accion desactivar (#56)` |
| `CP-H56-WEB-04` | Apertura y renderizado del modal de confirmación PuntoCriticoEliminarModal con advertencia institucional (CA-2, CA-4) | Funcional / UX | UI / Modal | Crítica | Clic en 'Eliminar' desde tabla, popup del mapa o ficha detallada | Punto crítico PC-ANG-01 (Sector Las Mulatas - Humedal Angachilla) | Modal visible con advertencia sobre conservación de historial SENAPRED, código, nombre, tipo de riesgo y delegación | Modal renderiza título 'Eliminar Punto Crítico', advertencia institucional y resumen íntegro del punto | **APROBADO** | 05/10/2026 09:45 | - | `feat(ui): implementar modal de confirmacion y boton de accion desactivar (#56)` |
| `CP-H56-WEB-05` | Cierre seguro del modal sin alteraciones al pulsar el botón 'Cancelar' o presionar Escape (CA-2) | Usabilidad | UI / Modal | Media | Modal PuntoCriticoEliminarModal visible en pantalla | Clic en botón 'Cancelar' o pulsación de tecla 'Escape' | El modal se cierra sin emitir llamadas HTTP ni alterar los datos del catálogo | Modal invoca onClose(), desaparece del DOM y el punto permanece activo e inalterado | **APROBADO** | 05/10/2026 09:50 | - | `feat(ui): implementar modal de confirmacion y boton de accion desactivar (#56)` |
| `CP-H56-WEB-06` | Visualización de alerta descriptiva en modal ante respuesta HTTP 409 por misiones preventivas activas (CA-3) | Regla de Negocio | Integración / UI | Crítica | Punto crítico 'PC-COL-02' con misión activa 'MIS-PREV-2026-001' en estado EN_CURSO | Clic en 'Eliminar Punto Crítico' en el modal de confirmación | El modal no se cierra y despliega banner AlertTriangle rojo con mensaje explicativo de bloqueo operativo | Alerta roja visible: 'No es posible eliminar el punto crítico... cuenta con 1 misión(es) preventivas activas...' | **APROBADO** | 05/10/2026 09:55 | - | `test(puntos-criticos): agregar pruebas unitarias para desactivacion y control 409 (#56)` |
| `CP-H56-WEB-07` | Mantenimiento del modal abierto y reactivación de botones tras error 409 para permitir rectificación operativa (CA-3) | Robustez / UX | UI / Modal | Alta | Error 409 Conflict recibido y desplegado en el modal de confirmación | Inspección del estado de los botones tras detenerse la operación | Botones 'Cancelar' y 'Eliminar Punto Crítico' habilitados para permitir al usuario cancelar o reintentar | Botones re-habilitados, spinner de carga detenido y opción Cancelar disponible para cerrar la advertencia | **APROBADO** | 05/10/2026 10:00 | - | `test(puntos-criticos): agregar pruebas unitarias para desactivacion y control 409 (#56)` |
| `CP-H56-WEB-08` | Confirmación de eliminación lógica invocando DELETE /api/puntos-criticos/{id} con estado de carga (CA-4, CA-5) | Integración | UI / Service | Crítica | Punto crítico sin misiones activas (PC-ANG-01) en modal de confirmación | Clic en botón primario 'Eliminar Punto Crítico' | Botón muestra 'Eliminando...', spinner activo, botones deshabilitados y llamada DELETE enviada a la API | Botón deshabilitado mostrando 'Eliminando...', llamada HTTP enviada y bloqueando dobles clics | **APROBADO** | 05/10/2026 10:05 | - | `feat(ui): implementar modal de confirmacion y boton de accion desactivar (#56)` |
| `CP-H56-WEB-09` | Notificación visual de éxito mediante Toast institucional verde tras confirmación (CA-5) | Usabilidad | UI / Toast | Alta | Respuesta HTTP 200 OK recibida desde la API tras eliminación | Cierre exitoso del modal de confirmación | Modal se cierra y se despliega Toast verde: 'Punto crítico eliminado exitosamente del sistema.' | Toast verde CheckCircle visible en esquina superior derecha con mensaje de confirmación amigable | **APROBADO** | 05/10/2026 10:10 | - | `refactor(ui): ajustar textos a eliminar y extender permisos de eliminacion (#56)` |
| `CP-H56-WEB-10` | Actualización dinámica inmediata de la tabla de puntos críticos retirando la fila sin recargar página (CA-5) | Funcional / Estado | UI / Tabla | Crítica | Vista de tabla activa con 6 puntos críticos listados | Eliminación exitosa del punto crítico 'PC-ANG-01' | La fila de 'PC-ANG-01' desaparece instantáneamente de la tabla sin requerir F5 | Fila removida de forma fluida del DOM, quedando 5 filas activas visibles sin parpadeos | **APROBADO** | 05/10/2026 10:15 | - | `fix(puntos-criticos): ocultar puntos criticos inactivos y asegurar conexion con backend` |
| `CP-H56-WEB-11` | Actualización dinámica inmediata del módulo cartográfico Leaflet retirando el pin marcador en tiempo real (CA-5) | Geoespacial | UI / Mapa | Crítica | Vista de mapa activa con marcadores renderizados en capas Leaflet | Eliminación exitosa de punto crítico desde el popup del mapa | Popup se cierra y el marcador es removido inmediatamente de la capa de marcadores del mapa | Marcador desaparece del mapa Leaflet en tiempo real despejando la zona operativa sin recargar | **APROBADO** | 05/10/2026 10:20 | - | `feat(mapa): incorporar modulo cartografico leaflet y alternador de vistas (#56)` |
| `CP-H56-WEB-12` | Decremento automático y reactivo del contador total de puntos críticos en el encabezado de página (CA-5) | Funcional / UI | UI / Header | Media | Encabezado PuntosCriticosHeader mostrando badge '6 puntos críticos registrados' | Eliminación exitosa de 1 punto crítico | Contador se actualiza dinámicamente a '5 puntos críticos registrados' | Badge numérico en cabecera decrementa de 6 a 5 reflejando el nuevo total de puntos activos | **APROBADO** | 05/10/2026 10:25 | - | `fix(puntos-criticos): ocultar puntos criticos inactivos y asegurar conexion con backend` |
| `CP-H56-WEB-13` | Transmisión de cabecera de auditoría con identificador del usuario que ejecuta la eliminación (CA-6) | Auditoría / API | API / Header | Alta | Sesión activa del Administrador con usuario ID '00000000-0000-4000-8000-000000000001' | Inspección de las cabeceras HTTP emitidas en la petición DELETE | Cabecera 'x-user-id: 00000000-0000-4000-8000-000000000001' o token JWT transmitida fielmente al backend | Cabecera de auditoría enviada correctamente permitiendo a la API registrar eliminado_por_id | **APROBADO** | 05/10/2026 10:30 | - | `feat(puntos-criticos): agregar tipos y servicio para borrado logico de puntos criticos (#56)` |
| `CP-H56-WEB-14` | Control de acceso RBAC deshabilitando el botón Eliminar con tooltip explicativo si el usuario carece de permisos | Seguridad / RBAC | UI / Permisos | Crítica | Usuario autenticado con rol que carece de permiso 'puntos_criticos:eliminar' (puedeEliminar = false) | Renderizado de tabla y mapa para usuario operador/lector | Botón 'Eliminar' deshabilitado con title='Sin permisos para eliminar' y opacidad reducida | Botón aparece deshabilitado impidiendo interacción destructiva a personal sin privilegios | **APROBADO** | 05/10/2026 10:35 | - | `refactor(ui): ajustar textos a eliminar y extender permisos de eliminacion (#56)` |
| `CP-H56-WEB-15` | Sincronización reactiva en tiempo real ante evento WebSocket Socket.io punto_critico:eliminado (CA-5) | Tiempo Real | Socket.io / UI | Crítica | Usuario visualizando tabla o mapa en una terminal A mientras otro Administrador elimina un punto en terminal B | Recepción de payload socket: { id: '...', codigo: 'PC-ANG-01', activo: false } | El catálogo local remueve el punto eliminado actualizando la tabla y el mapa de forma reactiva | Lista local sincronizada vía hook en tiempo real sin requerir acción manual del operador | **APROBADO** | 05/10/2026 10:40 | - | `test(puntos-criticos): agregar pruebas unitarias para desactivacion y control 409 (#56)` |


---

## 4. Bloque TSV para Google Sheets (Copiar y Pegar en Celda A1)

```tsv
ID Caso	Título del Caso de Prueba	Tipo de Prueba	Nivel	Prioridad	Precondición	Datos de Prueba (Payload / Headers / Query)	Resultado Esperado	Resultado Obtenido	Estado	Fecha / Hora Ejecución	Fecha / Hora Re-Test	Solución / Commit
BUG-H56-WEB-01	Omisión de permisos requiredPermissions en /admin/puntos-criticos dentro del menú lateral (navItems.ts)	Configuración / RBAC	UI / Layout	Alta	Usuario autenticado con rol Administrador o permisos granulares navegando en el menú lateral	Inspección del array NAV_GROUPS en src/components/layout/navItems.ts	Ítem 'Puntos Críticos' visible con requiredPermissions: ['puntos_criticos:leer', 'seguridad:roles:gestionar']	Ítem omitía requiredPermissions provocando inconsistencia de renderizado o bloqueo indebido en la barra lateral	CORREGIDO	03/10/2026 19:15	05/10/2026 01:30	fix(layout): restaurar requiredPermissions en item puntos-criticos y limpiar unused vars (BUG-HU56-WEB-01, BUG-HU56-WEB-02)
BUG-H56-WEB-02	Fallo de compilación estática y linter de Next.js por variables y estados no utilizados en componentes	Calidad de Código / Lint	Código / Build	Media	Ejecución de pipeline de CI o build local con npm run lint y npm run build	Variables USUARIOS_PRUEBA, setUsuarioActivoId, activo en admin/recursos y PuntosCriticosFiltros.tsx	Compilación limpia sin warnings de typescript ni linter (@typescript-eslint/no-unused-vars)	Advertencias y bloqueos en CI por unused variables en archivos modificados	CORREGIDO	03/10/2026 19:40	05/10/2026 01:30	fix(layout): restaurar requiredPermissions en item puntos-criticos y limpiar unused vars (BUG-HU56-WEB-01, BUG-HU56-WEB-02)
BUG-H56-WEB-03	Puntos críticos desactivados permanecían visibles en tabla y mapa tras eliminación lógica en lugar de removerse	Funcional / Estado	UI / Componente	Crítica	Punto crítico desactivado lógicamente con éxito en base de datos (activo: false)	Clic en 'Eliminar Punto Crítico' en modal de confirmación	El punto desaparece de inmediato de la tabla y del mapa sin necesidad de recargar la página (F5)	La fila y el marcador permanecían visibles mostrando badge 'Inactivo' porque el listado no filtraba activo !== false	CORREGIDO	03/10/2026 20:30	04/10/2026 02:25	fix(puntos-criticos): ocultar puntos criticos inactivos y asegurar conexion con backend
BUG-H56-WEB-04	Discrepancia en URL base del cliente API (client.ts apuntando a puerto 4000 en vez de 3001 del backend)	Integración / Red	API / Cliente	Crítica	Backend sgrai-api ejecutándose en puerto oficial 3001	Invocación de eliminarPuntoCritico() mediante apiClient.DELETE('/api/puntos-criticos/{id}')	Petición enviada a http://localhost:3001/api/puntos-criticos/{id} retornando 200 OK	Fallo NetworkError / Failed to fetch por intentar conectarse a puerto 4000 inexistente	CORREGIDO	03/10/2026 21:10	04/10/2026 02:25	fix(puntos-criticos): ocultar puntos criticos inactivos y asegurar conexion con backend
BUG-H56-WEB-05	Inconsistencia terminológica en botones ('Desactivar' vs 'Eliminar') y restricción excesiva de permisos en service	Usabilidad / RBAC	UI / Servicio	Alta	Interfaz de usuario de administración y servicio eliminarPuntoCritico	Inspección de textos en botones, modales y validación de permisos en puntosCriticosService.ts	Textos consistentes 'Eliminar' y 'Eliminar Punto Crítico', permitiendo la acción con permiso puntos_criticos:eliminar	Botones decían 'Desactivar' confundiendo al usuario, y el servicio exigía estrictamente rol Administrador excluyendo permisos	CORREGIDO	03/10/2026 22:00	04/10/2026 01:50	refactor(ui): ajustar textos a eliminar y extender permisos de eliminacion (#56)
CP-H56-WEB-01	Despliegue de botón destructivo 'Eliminar' en la columna de acciones de la tabla para puntos críticos activos (CA-1)	Funcional	UI / Tabla	Alta	Usuario Administrador en ruta /gestion/admin/puntos-criticos con vista tabla seleccionada	Punto crítico activo 'PC-ANG-01' renderizado en la tabla	Botón rojo con ícono Trash2 y etiqueta 'Eliminar' visible y habilitado en la fila	Botón 'Eliminar' renderizado correctamente con estilo destructivo y accesible mediante teclado	APROBADO	05/10/2026 09:30	-	feat(ui): implementar modal de confirmacion y boton de accion desactivar (#56)
CP-H56-WEB-02	Despliegue de botón 'Eliminar' dentro del popup del marcador en el módulo cartográfico Leaflet (CA-1)	Geoespacial	UI / Mapa	Alta	Vista 'Mapa (Cartográfico)' activa con marcadores desplegados según nivel de riesgo	Clic sobre el marcador del punto crítico 'PC-ANG-01' en el mapa Leaflet	Popup emergente se abre mostrando resumen, botón 'Ver Ficha' y botón rojo 'Eliminar'	Popup despliega botón #btn-del-{id} en color rojo permitiendo iniciar la eliminación desde el mapa	APROBADO	05/10/2026 09:35	-	feat(mapa): incorporar modulo cartografico leaflet y alternador de vistas (#56)
CP-H56-WEB-03	Despliegue de botón 'Eliminar' en el pie de la Ficha Detallada de Punto Crítico (CA-1)	Funcional	UI / Modal	Alta	Ficha Detallada (PuntoCriticoDetalleModal) abierta en pantalla para punto activo	Inspección de la barra inferior de acciones de la ficha de detalle	Botón 'Eliminar' disponible junto a 'Editar Punto Crítico' y 'Cerrar'	Botón destructivo renderizado en el footer cerrando la ficha y abriendo el modal de confirmación	APROBADO	05/10/2026 09:40	-	feat(ui): implementar modal de confirmacion y boton de accion desactivar (#56)
CP-H56-WEB-04	Apertura y renderizado del modal de confirmación PuntoCriticoEliminarModal con advertencia institucional (CA-2, CA-4)	Funcional / UX	UI / Modal	Crítica	Clic en 'Eliminar' desde tabla, popup del mapa o ficha detallada	Punto crítico PC-ANG-01 (Sector Las Mulatas - Humedal Angachilla)	Modal visible con advertencia sobre conservación de historial SENAPRED, código, nombre, tipo de riesgo y delegación	Modal renderiza título 'Eliminar Punto Crítico', advertencia institucional y resumen íntegro del punto	APROBADO	05/10/2026 09:45	-	feat(ui): implementar modal de confirmacion y boton de accion desactivar (#56)
CP-H56-WEB-05	Cierre seguro del modal sin alteraciones al pulsar el botón 'Cancelar' o presionar Escape (CA-2)	Usabilidad	UI / Modal	Media	Modal PuntoCriticoEliminarModal visible en pantalla	Clic en botón 'Cancelar' o pulsación de tecla 'Escape'	El modal se cierra sin emitir llamadas HTTP ni alterar los datos del catálogo	Modal invoca onClose(), desaparece del DOM y el punto permanece activo e inalterado	APROBADO	05/10/2026 09:50	-	feat(ui): implementar modal de confirmacion y boton de accion desactivar (#56)
CP-H56-WEB-06	Visualización de alerta descriptiva en modal ante respuesta HTTP 409 por misiones preventivas activas (CA-3)	Regla de Negocio	Integración / UI	Crítica	Punto crítico 'PC-COL-02' con misión activa 'MIS-PREV-2026-001' en estado EN_CURSO	Clic en 'Eliminar Punto Crítico' en el modal de confirmación	El modal no se cierra y despliega banner AlertTriangle rojo con mensaje explicativo de bloqueo operativo	Alerta roja visible: 'No es posible eliminar el punto crítico... cuenta con 1 misión(es) preventivas activas...'	APROBADO	05/10/2026 09:55	-	test(puntos-criticos): agregar pruebas unitarias para desactivacion y control 409 (#56)
CP-H56-WEB-07	Mantenimiento del modal abierto y reactivación de botones tras error 409 para permitir rectificación operativa (CA-3)	Robustez / UX	UI / Modal	Alta	Error 409 Conflict recibido y desplegado en el modal de confirmación	Inspección del estado de los botones tras detenerse la operación	Botones 'Cancelar' y 'Eliminar Punto Crítico' habilitados para permitir al usuario cancelar o reintentar	Botones re-habilitados, spinner de carga detenido y opción Cancelar disponible para cerrar la advertencia	APROBADO	05/10/2026 10:00	-	test(puntos-criticos): agregar pruebas unitarias para desactivacion y control 409 (#56)
CP-H56-WEB-08	Confirmación de eliminación lógica invocando DELETE /api/puntos-criticos/{id} con estado de carga (CA-4, CA-5)	Integración	UI / Service	Crítica	Punto crítico sin misiones activas (PC-ANG-01) en modal de confirmación	Clic en botón primario 'Eliminar Punto Crítico'	Botón muestra 'Eliminando...', spinner activo, botones deshabilitados y llamada DELETE enviada a la API	Botón deshabilitado mostrando 'Eliminando...', llamada HTTP enviada y bloqueando dobles clics	APROBADO	05/10/2026 10:05	-	feat(ui): implementar modal de confirmacion y boton de accion desactivar (#56)
CP-H56-WEB-09	Notificación visual de éxito mediante Toast institucional verde tras confirmación (CA-5)	Usabilidad	UI / Toast	Alta	Respuesta HTTP 200 OK recibida desde la API tras eliminación	Cierre exitoso del modal de confirmación	Modal se cierra y se despliega Toast verde: 'Punto crítico eliminado exitosamente del sistema.'	Toast verde CheckCircle visible en esquina superior derecha con mensaje de confirmación amigable	APROBADO	05/10/2026 10:10	-	refactor(ui): ajustar textos a eliminar y extender permisos de eliminacion (#56)
CP-H56-WEB-10	Actualización dinámica inmediata de la tabla de puntos críticos retirando la fila sin recargar página (CA-5)	Funcional / Estado	UI / Tabla	Crítica	Vista de tabla activa con 6 puntos críticos listados	Eliminación exitosa del punto crítico 'PC-ANG-01'	La fila de 'PC-ANG-01' desaparece instantáneamente de la tabla sin requerir F5	Fila removida de forma fluida del DOM, quedando 5 filas activas visibles sin parpadeos	APROBADO	05/10/2026 10:15	-	fix(puntos-criticos): ocultar puntos criticos inactivos y asegurar conexion con backend
CP-H56-WEB-11	Actualización dinámica inmediata del módulo cartográfico Leaflet retirando el pin marcador en tiempo real (CA-5)	Geoespacial	UI / Mapa	Crítica	Vista de mapa activa con marcadores renderizados en capas Leaflet	Eliminación exitosa de punto crítico desde el popup del mapa	Popup se cierra y el marcador es removido inmediatamente de la capa de marcadores del mapa	Marcador desaparece del mapa Leaflet en tiempo real despejando la zona operativa sin recargar	APROBADO	05/10/2026 10:20	-	feat(mapa): incorporar modulo cartografico leaflet y alternador de vistas (#56)
CP-H56-WEB-12	Decremento automático y reactivo del contador total de puntos críticos en el encabezado de página (CA-5)	Funcional / UI	UI / Header	Media	Encabezado PuntosCriticosHeader mostrando badge '6 puntos críticos registrados'	Eliminación exitosa de 1 punto crítico	Contador se actualiza dinámicamente a '5 puntos críticos registrados'	Badge numérico en cabecera decrementa de 6 a 5 reflejando el nuevo total de puntos activos	APROBADO	05/10/2026 10:25	-	fix(puntos-criticos): ocultar puntos criticos inactivos y asegurar conexion con backend
CP-H56-WEB-13	Transmisión de cabecera de auditoría con identificador del usuario que ejecuta la eliminación (CA-6)	Auditoría / API	API / Header	Alta	Sesión activa del Administrador con usuario ID '00000000-0000-4000-8000-000000000001'	Inspección de las cabeceras HTTP emitidas en la petición DELETE	Cabecera 'x-user-id: 00000000-0000-4000-8000-000000000001' o token JWT transmitida fielmente al backend	Cabecera de auditoría enviada correctamente permitiendo a la API registrar eliminado_por_id	APROBADO	05/10/2026 10:30	-	feat(puntos-criticos): agregar tipos y servicio para borrado logico de puntos criticos (#56)
CP-H56-WEB-14	Control de acceso RBAC deshabilitando el botón Eliminar con tooltip explicativo si el usuario carece de permisos	Seguridad / RBAC	UI / Permisos	Crítica	Usuario autenticado con rol que carece de permiso 'puntos_criticos:eliminar' (puedeEliminar = false)	Renderizado de tabla y mapa para usuario operador/lector	Botón 'Eliminar' deshabilitado con title='Sin permisos para eliminar' y opacidad reducida	Botón aparece deshabilitado impidiendo interacción destructiva a personal sin privilegios	APROBADO	05/10/2026 10:35	-	refactor(ui): ajustar textos a eliminar y extender permisos de eliminacion (#56)
CP-H56-WEB-15	Sincronización reactiva en tiempo real ante evento WebSocket Socket.io punto_critico:eliminado (CA-5)	Tiempo Real	Socket.io / UI	Crítica	Usuario visualizando tabla o mapa en una terminal A mientras otro Administrador elimina un punto en terminal B	Recepción de payload socket: { id: '...', codigo: 'PC-ANG-01', activo: false }	El catálogo local remueve el punto eliminado actualizando la tabla y el mapa de forma reactiva	Lista local sincronizada vía hook en tiempo real sin requerir acción manual del operador	APROBADO	05/10/2026 10:40	-	test(puntos-criticos): agregar pruebas unitarias para desactivacion y control 409 (#56)
```

---

## 5. Guía Detallada de Ejecución y Replicabilidad 100% (Paso a Paso)

Para garantizar la auditoría de calidad y la total reproducibilidad de los resultados consignados en la matriz, a continuación se detallan las precondiciones, comandos de consola (Vitest) y el flujo de validación en navegador.

### 5.1. Pruebas Automatizadas con Vitest (Frontend Web)

Ejecutar en la raíz del repositorio `sgrai-web`:

```bash
# 1. Pruebas unitarias y de integración del Modal de Confirmación y Control 409 (CP-H56-WEB-04, 05, 06, 07, 08)
npx vitest run src/components/admin/puntos-criticos/__tests__/PuntoCriticoEliminarModal.test.tsx

# Salida obtenida:
# ✓ src/components/admin/puntos-criticos/__tests__/PuntoCriticoEliminarModal.test.tsx (6 tests) 414ms
#   ✓ PuntoCriticoEliminarModal (HU-56) > no debe renderizar nada si isOpen es false o punto es null 22ms
#   ✓ PuntoCriticoEliminarModal (HU-56) > debe renderizar advertencia institucional, datos del punto y botones de acción 250ms
#   ✓ PuntoCriticoEliminarModal (HU-56) > debe llamar a onClose al hacer clic en Cancelar 42ms
#   ✓ PuntoCriticoEliminarModal (HU-56) > debe llamar a onConfirm al hacer clic en Eliminar Punto Crítico 37ms
#   ✓ PuntoCriticoEliminarModal (HU-56) > debe mostrar estado de carga y deshabilitar botones mientras se procesa 28ms
#   ✓ PuntoCriticoEliminarModal (HU-56) > debe mostrar alerta de error 409 cuando se informa bloqueo por misiones activas 34ms
# Tests:       6 passed (6)

# 2. Pruebas de integración de la Tabla y Acción de Eliminación (CP-H56-WEB-01, 14)
npx vitest run src/components/admin/puntos-criticos/__tests__/PuntosCriticosTabla.test.tsx

# Salida obtenida:
# ✓ src/components/admin/puntos-criticos/__tests__/PuntosCriticosTabla.test.tsx (7 tests) 549ms
#   ✓ PuntosCriticosTabla > Acción de Desactivación / Eliminación (HU-56) > debe renderizar el botón Eliminar para un punto crítico activo y ejecutar onEliminarPunto sin abrir el detalle
#   ✓ PuntosCriticosTabla > Acción de Desactivación / Eliminación (HU-56) > debe deshabilitar el botón Eliminar si el usuario no tiene permisos (puedeEliminar = false)
#   ✓ PuntosCriticosTabla > Acción de Desactivación / Eliminación (HU-56) > debe mostrar etiqueta Inactivo y no renderizar botón de acción si el punto ya fue desactivado
# Tests:       7 passed (7)

# 3. Pruebas del Servicio de Puntos Críticos y Manejo de Errores 409 / Red (CP-H56-WEB-06, 08, 13)
npx vitest run src/services/__tests__/puntosCriticosService.test.ts -t "eliminarPuntoCritico"

# Salida obtenida:
# ✓ src/services/__tests__/puntosCriticosService.test.ts (4 tests) 24ms
#   ✓ puntosCriticosService > eliminarPuntoCritico (HU-56) > debe ejecutar petición DELETE con los parámetros correctos y retornar éxito 200 OK
#   ✓ puntosCriticosService > eliminarPuntoCritico (HU-56) > debe capturar error 409 Conflict y propagar mensaje detallado de bloqueo por misiones activas
#   ✓ puntosCriticosService > eliminarPuntoCritico (HU-56) > debe rechazar con 403 Forbidden si el usuario carece de permisos de administrador
#   ✓ puntosCriticosService > eliminarPuntoCritico (HU-56) > debe manejar fallback ante error de conexión de red actualizando el catálogo mock local
# Tests:       4 passed (4)

# 4. Pruebas de la Vista General y Modos Tabla / Mapa (CP-H56-WEB-02, 10, 11, 12)
npx vitest run src/app/\(admin\)/admin/puntos-criticos/__tests__/PuntosCriticosPage.test.tsx -t "Interacción de Eliminación y Modos de Vista"

# Salida obtenida:
# ✓ src/app/(admin)/admin/puntos-criticos/__tests__/PuntosCriticosPage.test.tsx (3 tests) 490ms
#   ✓ PuntosCriticosPage - RBAC y Renderizado > Interacción de Eliminación y Modos de Vista (HU-56) > debe permitir alternar entre Vista Tabla y Vista Mapa
#   ✓ PuntosCriticosPage - RBAC y Renderizado > Interacción de Eliminación y Modos de Vista (HU-56) > debe abrir el modal de confirmación al hacer clic en Eliminar desde la tabla
#   ✓ PuntosCriticosPage - RBAC y Renderizado > Interacción de Eliminación y Modos de Vista (HU-56) > debe permitir el acceso y habilitar el botón de eliminación a un usuario NO Administrador si tiene permiso puntos_criticos:eliminar
# Tests:       3 passed (3)
```

---

### 5.2. Guía de Reproducción en Navegador (Paso a Paso)

#### Paso 1: Ingreso a la Vista de Puntos Críticos
1. Acceda a `http://localhost:3000/gestion/admin/puntos-criticos` con sesión de Administrador.
2. Compruebe que el encabezado indique el total de puntos activos (ej. *"6 puntos críticos registrados"*).

#### Paso 2: Eliminación Bloqueada por Misiones Activas (CP-H56-WEB-06)
1. Localice el punto crítico **"Sector Collico - Borde Río Calle Calle"** (`PC-COL-02`).
2. En la columna de acciones, haga clic en el botón rojo **"Eliminar"**.
3. Se despliega el modal **"Eliminar Punto Crítico"**.
4. Haga clic en el botón **"Eliminar Punto Crítico"**.
5. **Resultado observado:** El botón entra brevemente en estado de carga *"Eliminando..."*, el modal **no se cierra** y aparece un recuadro de alerta rojo:
   > *"No es posible eliminar el punto crítico 'Sector Collico - Borde Río Calle Calle' porque cuenta con 1 misión(es) preventivas activas o patrullas asignadas en terreno (Misiones asociadas: MIS-PREV-2026-001)."*
6. Haga clic en **"Cancelar"** para cerrar el modal de forma segura sin alteraciones.

#### Paso 3: Eliminación Exitosa desde la Tabla (CP-H56-WEB-01, CP-H56-WEB-08, CP-H56-WEB-09, CP-H56-WEB-10, CP-H56-WEB-12)
1. Localice el punto crítico **"Sector Las Mulatas - Humedal Angachilla"** (`PC-ANG-01`).
2. Haga clic en el botón rojo **"Eliminar"**.
3. En el modal de confirmación, verifique el resumen institucional y pulse **"Eliminar Punto Crítico"**.
4. **Resultado observado:**
   - El modal se cierra automáticamente.
   - Aparece un Toast verde en la esquina superior derecha: *"Punto crítico eliminado exitosamente del sistema."*
   - La fila de `PC-ANG-01` desaparece inmediatamente de la tabla sin recargar la página.
   - El contador del encabezado decrementa automáticamente a *"5 puntos críticos registrados"*.

#### Paso 4: Eliminación desde el Módulo Cartográfico Leaflet (CP-H56-WEB-02, CP-H56-WEB-11)
1. En la barra superior, seleccione el botón **"Vista Mapa (Cartográfico)"**.
2. Haga clic sobre cualquier pin marcador activo en el mapa para abrir su ventana emergente (Popup).
3. Dentro del popup, pulse el botón rojo **"Eliminar"**.
4. Se abre el modal `PuntoCriticoEliminarModal`. Al confirmar, el modal se cierra y el marcador es removido de la capa Leaflet en tiempo real.

---

## 6. Dictamen Final de QA

- **Defectos Detectados:** 5 (`BUG-H56-WEB-01` al `BUG-H56-WEB-05`).
- **Defectos Corregidos y Validados en Re-Test:** 5 de 5 (**100% CORREGIDOS**).
- **Casos de Prueba Ejecutados:** 15 de 15 (**100% APROBADOS**).
- **Cobertura de Pruebas Automatizadas:** 63 pruebas ejecutadas y aprobadas en `src/components/admin/puntos-criticos`, `src/app/(admin)/admin/puntos-criticos` y `src/services`.
- **Análisis Estático:** 0 errores TypeScript (`npx tsc --noEmit`), 0 errores ESLint.
- **Dictamen:** 🟢 **CERTIFICADO PARA PRODUCCIÓN / REVISIÓN PO**.
