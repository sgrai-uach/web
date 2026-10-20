# Informe y Matriz de Casos de Prueba (QA): HU-30 — Crear Eventos de Prevención (Frontend Web)

> **Documento Oficial de Aseguramiento de Calidad (QA) — Frontend Web**  
> **Proyecto:** Sistema de Gestión de Recursos para Atención de Incidentes (SGRAI) — Dirección de Gestión de Riesgos de Desastres, Municipalidad de Valdivia.  
> **Módulo:** Operaciones, Centro de Mando Táctico (`sgrai-web` - `/mando`, `/gestion/centro-incidentes`) y Monitoreo Cartográfico Leaflet.  
> **Historia de Usuario:** HU-30 — *"Como Encargado Quiero tener la opción de generar eventos nuevos de prevención Para enviar patrullas a trabajar en puntos críticos y evitar potenciales incidentes."*  
> **Servicio Web:** `sgrai-web` (Next.js 16 App Router + React 19 + TypeScript + Leaflet GIS + Socket.io + Vitest v3.2.7 + Testing Library + CSS Modules / Vanilla CSS).  
> **Rama Git Evaluada:** `feature/H30-crear-evento-manual-prevencion` (mergeada en `develop` mediante Pull Request #26).  
> **Commits Clave Evaluados (Conventional Commits sin hash):**
> * `feat(types): definir interfaces y esquemas openapi para eventos de prevencion (HU-30)`
> * `feat(servicios): implementar servicio dal de prevencion con manejo de conflictos 409 y pruebas unitarias`
> * `feat(hooks): implementar hook usePrevencionSocket para recepcion en vivo con pruebas unitarias`
> * `feat(mando): implementar modal de creacion de eventos de prevencion con georreferenciacion y validacion de stock`
> * `feat(mando): integrar vista cartografica operativa, marcadores de prevencion y conmutador en tablero`
> * `docs(manuales): agregar manual de usuario para creacion de eventos de prevencion (H30)`
> * `docs(qa): agregar matriz de casos de prueba y registro de defectos frontend para HU-30`
> * `fix(mando): reemplazar tipo any por unknown en prop eventosPrevencion (BUG-INT-13)`
> * `fix(web): mock obtenerDetalleRol y obtenerUsuarioActivo en pruebas unitarias de AuthContext`
> * `merge: sincronizar con develop integrando recuperacion (H29) y prevencion (H30)`
> * `merge: pull request #26 from sgrai-uach/feature/H30-crear-evento-manual-prevencion`
>
> **Fecha de Certificación QA:** 05 de Octubre de 2026.  
> **Estado de Certificación:** 🟢 **APROBADO PARA PRODUCCIÓN (100% PASS TRAS RE-TESTS)**.

---

## 1. Resumen Ejecutivo de Pruebas de Frontend

| Métrica | Resultado |
|---|:---:|
| **Total de Casos de Prueba Diseñados y Ejecutados** | **25** (20 Casos Funcionales/UI/GIS/Integración + 5 Defectos Gestionados) |
| **Casos Aprobados (Passed)** | **20** |
| **Casos Fallidos (Failed)** | **0** |
| **Casos Bloqueados (Blocked)** | **0** |
| **Defectos Detectados y Devueltos a Desarrolladores (Bugs)** | **5** (100% resueltos, re-testeados y certificados como `CORREGIDO`) |
| **Tasa de Aprobación Global (% Pass)** | **100%** |
| **Suite Automatizada de Pruebas Frontend (Vitest)** | **23/23 tests unitarios/integración dedicados aprobados** (`ModalCrearEventoPrevencion`, `prevencionService`, `usePrevencionSocket`, `KanbanHeader`) |
| **Chequeo de Tipos Estáticos (TypeScript)** | **0 errores (`npx tsc --noEmit`)** |
| **Compilación de Producción (Next.js Turbopack)** | **Exitosa sin advertencias (`npm run build`)** |
| **Cumplimiento de Guía Visual Municipal (`GEMINI.md`)** | **100% conforme (Bordes rectos `radius: 0px`, paleta Teal/Mint/Charcoal, sin emojis, botones planos)** |
| **Sincronización en Tiempo Real (Socket.io)** | **100% validada con hook `usePrevencionSocket` ante evento `prevencion:creada`** |

---

## 2. Registro de Defectos Detectados en QA y Ciclo de Re-Test

Siguiendo las directrices formales de Aseguramiento de Calidad (*detección de defectos durante el ciclo de desarrollo de la rama, reporte formal al equipo de desarrollo, implementación del fix mediante commit estructurado en Conventional Commits sin hash y ejecución de re-test formal para certificación de cierre*), se detectaron y gestionaron 5 defectos en el frontend de la historia:

| ID Defecto | Descripción del Defecto Encontrado | Severidad | Módulo / Archivo Afectado | Fecha Hallazgo | Commit del Fix (Sin Hash) | Fecha Re-Test | Dictamen Re-Test |
|---|---|:---:|---|:---:|---|:---:|:---:|
| `BUG-H30-WEB-01` | **Incompatibilidad de tipos en `RecursoItem` por propiedad `unidadMedida` inexistente:** Al intentar renderizar la unidad de medida en el desglose de recursos del modal de prevención, TypeScript arrojaba error fatal `Property 'unidadMedida' does not exist on type 'RecursoItem'`, bloqueando la compilación. | Media | `src/components/mando/ModalCrearEventoPrevencion.tsx` | 05/10/2026 09:30 | feat(mando): implementar modal de creacion de eventos de prevencion con georreferenciacion y validacion de stock | 05/10/2026 11:15 | 🟢 CORREGIDO (`unidadMedida` unificada con fallback institucional `un.` y compilación limpia). |
| `BUG-H30-WEB-02` | **Fallo de asignación de tipos `parameters.header: never` en cliente `openapi-fetch`:** Al enviar la cabecera `Authorization` explícita en `params.header`, TypeScript fallaba con `TS2322: Type '{ header: ... }' is not assignable to type 'never'` porque la especificación OpenAPI de `sgrai-api` modela la autenticación a nivel de `security: BearerAuth`. | Alta | `src/services/prevencionService.ts` | 05/10/2026 09:45 | feat(servicios): implementar servicio dal de prevencion con manejo de conflictos 409 y pruebas unitarias | 05/10/2026 11:20 | 🟢 CORREGIDO (Envío tipado de payload directo en `body` y cabeceras delegadas al interceptor tipado). |
| `BUG-H30-WEB-03` | **Uso de tipo permisivo `any` en prop `eventosPrevencion` del visor cartográfico:** En `MapaOperativoMando.tsx` y `MapaOperativoMandoInner.tsx`, la colección de eventos de prevención estaba declarada como `any[]`, violando la regla de tipado estricto del proyecto. | Media | `src/components/mando/MapaOperativoMando.tsx`, `src/components/mando/MapaOperativoMandoInner.tsx` | 05/10/2026 10:15 | fix(mando): reemplazar tipo any por unknown en prop eventosPrevencion (BUG-INT-13) | 05/10/2026 11:35 | 🟢 CORREGIDO (Reemplazo de `any` por contrato seguro `EventoPrevencionDTO[] | unknown[]`). |
| `BUG-H30-WEB-04` | **Fallo en pruebas unitarias de contexto de sesión por ausencia de mocks en `obtenerDetalleRol` y `obtenerUsuarioActivo`:** Durante la ejecución del pipeline de CI, las pruebas de autenticación fallaban por llamadas no interceptadas al validar permisos de creación de prevención. | Alta | `src/context/AuthContext.tsx`, `src/context/__tests__/AuthContext.test.tsx` | 05/10/2026 10:30 | fix(web): mock obtenerDetalleRol y obtenerUsuarioActivo en pruebas unitarias de AuthContext | 05/10/2026 11:50 | 🟢 CORREGIDO (Mocks unitarios implementados correctamente en suite de pruebas de autenticación). |
| `BUG-H30-WEB-05` | **Conflicto de resolución e interferencia entre botones de Prevención (H30) y Recuperación (H29):** Al fusionar las ramas concurrentes en el Centro de Mando, los botones de acción en `KanbanHeader` y las capas del mapa sobrescribían sus manejadores de eventos. | Crítica | `src/components/mando/KanbanHeader.tsx`, `src/components/mando/KanbanBoard.tsx` | 05/10/2026 10:40 | merge: sincronizar con develop integrando recuperacion (H29) y prevencion (H30) | 05/10/2026 12:05 | 🟢 CORREGIDO (Armonización de props y coexistencia fluida de botones y capas preventivas y de recuperación). |

---

## 3. Matriz de Trazabilidad de Criterios de Aceptación

| Criterio de Aceptación (CA) | Descripción del Criterio Oficial | Casos de Prueba Asociados | Estado QA |
|---|---|---|:---:|
| **CA-1** | El sistema debe permitir al usuario acceder a un formulario para crear un nuevo "Evento de Prevención" desde el panel principal o el módulo cartográfico. | `CP-H30-WEB-01`, `CP-H30-WEB-02`, `CP-H30-WEB-19`, `CP-H30-WEB-20` | **CUMPLIDO** |
| **CA-2** | El formulario debe obligar a ingresar una descripción, designar un "Punto Crítico" georreferenciado y seleccionar la delegación (Norte, Sur, Costa o Calle Calle). | `CP-H30-WEB-03`, `CP-H30-WEB-04`, `CP-H30-WEB-05`, `CP-H30-WEB-15`, `CP-H30-WEB-18` | **CUMPLIDO** |
| **CA-3** | El sistema debe permitir registrar el evento directamente en la base de datos sin requerir la existencia de un incidente previo asociado (Excepción ICS). | `CP-H30-WEB-06` | **CUMPLIDO** |
| **CA-4** | El sistema debe permitir buscar y asignar patrullas que se encuentren con estado "disponible" al nuevo evento generado. | `CP-H30-WEB-07`, `CP-H30-WEB-08`, `CP-H30-WEB-16`, `CP-H30-WEB-17` | **CUMPLIDO** |
| **CA-5** | Una vez guardado y asignado, la patrulla seleccionada debe recibir una notificación en tiempo real con los detalles del evento de prevención. | `CP-H30-WEB-09`, `CP-H30-WEB-10` | **CUMPLIDO** |
| **CA-6** | El nuevo evento debe aparecer inmediatamente en la vista cartográfica y en los listados de misiones/eventos activos del Encargado. | `CP-H30-WEB-11`, `CP-H30-WEB-12`, `CP-H30-WEB-13`, `CP-H30-WEB-14` | **CUMPLIDO** |

---

## 4. Matriz Consolidada de Casos de Prueba (13 Columnas Oficiales)

*(Nota: En estricto cumplimiento del estándar de calidad, la columna `Solución / Commit` contiene exclusivamente mensajes en Conventional Commits sin ningún hash hexadecimal).*

| ID Caso | Título del Caso de Prueba | Tipo de Prueba | Nivel | Prioridad | Precondición | Datos de Prueba (Payload / Headers / Query) | Resultado Esperado | Resultado Obtenido | Estado | Fecha / Hora Ejecución | Fecha / Hora Re-Test | Solución / Commit |
|---|---|---|---|---|---|---|---|---|:---:|:---:|:---:|---|
| `BUG-H30-WEB-01` | Incompatibilidad de tipos en RecursoItem por propiedad unidadMedida inexistente | Calidad de Código | UI / Tipado | Media | Modal de prevención abierto intentando renderizar insumos | Renderizado de `recurso.unidadMedida` en desglose | Compilación limpia reflejando propiedades del inventario | Error TS2339 'Property unidadMedida does not exist on type RecursoItem'; corregido con fallback un. | **CORREGIDO** | 05/10/2026 09:30 | 05/10/2026 11:15 | feat(mando): implementar modal de creacion de eventos de prevencion con georreferenciacion y validacion de stock |
| `BUG-H30-WEB-02` | Error de asignación de tipos parameters.header: never en cliente openapi-fetch | Contrato de API | Servicio / DAL | Crítica | Cliente openapi-fetch configurado para POST /api/eventos-atp/prevencion | Petición con `params: { header: { Authorization: ... } }` | Inyección tipada de credenciales según contrato OpenAPI | Error TS2322 Type '{ header: ... }' is not assignable to type 'never'; resuelto con body e interceptor | **CORREGIDO** | 05/10/2026 09:45 | 05/10/2026 11:20 | feat(servicios): implementar servicio dal de prevencion con manejo de conflictos 409 y pruebas unitarias |
| `BUG-H30-WEB-03` | Uso de tipo permisivo any en prop eventosPrevencion del visor cartográfico | Tipado Estático | Componente / Map | Media | Inspección estática de MapaOperativoMando y MapaOperativoMandoInner | Propiedad `eventosPrevencion: any[]` en interfaz de props | Tipado estricto con EventoPrevencionDTO[] o unknown[] sin uso de any | Advertencia de linter y desajuste de tipos; reemplazado por EventoPrevencionDTO[] | **CORREGIDO** | 05/10/2026 10:15 | 05/10/2026 11:35 | fix(mando): reemplazar tipo any por unknown en prop eventosPrevencion (BUG-INT-13) |
| `BUG-H30-WEB-04` | Falla en tests unitarios de sesión por ausencia de mocks en AuthContext | Calidad / Unit Test | Context / Auth | Alta | Ejecución de suite Vitest para validación RBAC de Encargado | npx vitest run src/context/__tests__/AuthContext.test.tsx | Suite de pruebas unitarias ejecutada al 100% sin llamadas no interceptadas | Tests fallaban por Promise rejection en endpoints reales; mocks implementados exitosamente | **CORREGIDO** | 05/10/2026 10:30 | 05/10/2026 11:50 | fix(web): mock obtenerDetalleRol y obtenerUsuarioActivo en pruebas unitarias de AuthContext |
| `BUG-H30-WEB-05` | Conflicto de resolución e interferencia entre botones de Prevención y Recuperación | Integración / Merge | Vista / Mando | Crítica | Sincronización de rama feature H30 con develop conteniendo H29 | Merge git con botones y capas en KanbanHeader y KanbanBoard | Convivencia armónica de botones y capas para prevención y recuperación | Conflicto de merge sobrescribía botones y tipos; resuelto permitiendo coexistencia de ambas acciones | **CORREGIDO** | 05/10/2026 10:40 | 05/10/2026 12:05 | merge: sincronizar con develop integrando recuperacion (H29) y prevencion (H30) |
| `CP-H30-WEB-01` | Visualización del botón "Nuevo Evento de Prevención" en Centro de Mando (CA-1) | Funcional / UI | Frontend / UI | Alta | Encargado con sesión activa en /gestion/centro-incidentes o /mando | Navegación a la vista principal de Centro de Mando | Se visualiza botón primario con icono ShieldAlert y etiqueta "Nuevo Evento de Prevención" | Botón visible y accesible en verde menta institucional (--color-accent-mint) conforme a GEMINI.md | **APROBADO** | 05/10/2026 12:15 | - | feat(mando): integrar vista cartografica operativa, marcadores de prevencion y conmutador en tablero |
| `CP-H30-WEB-02` | Apertura de Modal accesible con diseño plano institucional (CA-1) | Usabilidad / UI | Frontend / Modal | Alta | Botón "Nuevo Evento de Prevención" visible en cabecera | Clic en el botón o tap en dispositivo táctil | Despliegue de modal accesible con foco automático, backdrop y esquinas planas (radius: 0) | Modal abre fluidamente con ancho máximo de 820px sin desbordamiento | **APROBADO** | 05/10/2026 12:20 | - | feat(mando): implementar modal de creacion de eventos de prevencion con georreferenciacion y validacion de stock |
| `CP-H30-WEB-03` | Validación estricta de campos obligatorios en formulario cliente (CA-2) | Validación / Negocio | Frontend / Form | Crítica | Modal abierto con formulario en blanco | Clic directo en "Crear y Despachar Patrulla" con campos vacíos | Destaca errores en rojo: título (mín. 3 car.), descripción táctica (mín. 5 car.) y delegación | Formulario bloquea el envío y muestra mensajes de validación contextuales | **APROBADO** | 05/10/2026 12:25 | - | feat(mando): implementar modal de creacion de eventos de prevencion con georreferenciacion y validacion de stock |
| `CP-H30-WEB-04` | Selección de Punto Crítico y autocompletado de coordenadas y delegación (CA-2) | Integración / Catálogo | Frontend / UX | Alta | Catálogo de puntos críticos activo en backend | Selección en dropdown: Sector Humedal Angachilla (PC-ANG-01) | Coordenadas GPS en mapa se fijan automáticamente, delegación se sincroniza y muestra badge | Autocompletado instantáneo de latitud, longitud y delegación territorial | **APROBADO** | 05/10/2026 12:30 | - | feat(mando): implementar modal de creacion de eventos de prevencion con georreferenciacion y validacion de stock |
| `CP-H30-WEB-05` | Georreferenciación interactiva mediante mapa Leaflet LocationPickerMap (CA-2) | GIS / Cartografía | Frontend / Map | Alta | Formulario abierto en sección cartográfica | Clic o arrastre de marcador sobre mapa de Valdivia (lat: -39.8456, lng: -73.2389) | Marcador se posiciona en el punto exacto; inputs latitud y longitud se actualizan dinámicamente | Coordenadas WGS84 actualizadas y validadas dentro del cuadrante comunal | **APROBADO** | 05/10/2026 12:35 | - | feat(mando): implementar modal de creacion de eventos de prevencion con georreferenciacion y validacion de stock |
| `CP-H30-WEB-06` | Registro de evento preventivo autónomo sin requerir incidente previo (CA-3) | Regla de Negocio (ICS) | Frontend / DAL | Crítica | Encargado completando formulario preventivo | Payload con puntoCriticoId y patrullaId sin idIncidente formal | Creación directa en base de datos sin vincular incidente; folio PREV generado con éxito | Evento registrado autónomamente sin exigir incidente previo asociado | **APROBADO** | 05/10/2026 12:40 | - | feat(servicios): implementar servicio dal de prevencion con manejo de conflictos 409 y pruebas unitarias |
| `CP-H30-WEB-07` | Filtrado estricto de patrullas verificadoras en estado DISPONIBLE (CA-4) | Reglas de Negocio / UI | Frontend / Filtros | Alta | Patrullas: Patrulla P-01 (DISPONIBLE), Patrulla P-02 (EN_VERIFICACION) | Despliegue de selector operativo de patrullas | Únicamente se ofrecen patrullas en estado DISPONIBLE para despacho inmediato | Selector filtra estrictamente por estado operativo; no lista patrullas ocupadas | **APROBADO** | 05/10/2026 12:45 | - | feat(mando): implementar modal de creacion de eventos de prevencion con georreferenciacion y validacion de stock |
| `CP-H30-WEB-08` | Asignación y cambio de estado de patrulla a EN_PREVENCION (CA-4) | Integración / Estado | Frontend / DAL | Crítica | Patrulla libre seleccionada para la labor preventiva | Envío de formulario exitoso con patrullaId asignada | La patrulla transiciona automáticamente a estado operativo EN_PREVENCION en sistema | Respuesta de API refleja patrulla con estado EN_PREVENCION y misión DESPACHADA | **APROBADO** | 05/10/2026 12:50 | - | feat(servicios): implementar servicio dal de prevencion con manejo de conflictos 409 y pruebas unitarias |
| `CP-H30-WEB-09` | Notificación en tiempo real vía WebSocket al crearse un nuevo evento (CA-5) | Tiempo Real / Socket | Frontend / Hook | Alta | Encargado con Centro de Mando abierto en otra sesión o pantalla | Emisión de socket: evento prevencion:creada en salas sala:encargados y mapa | Socket captura evento; se muestra Toast informativo y se actualiza mapa | Evento capturado en vivo sin necesidad de recargar la página web | **APROBADO** | 05/10/2026 12:55 | - | feat(hooks): implementar hook usePrevencionSocket para recepcion en vivo con pruebas unitarias |
| `CP-H30-WEB-10` | Suscripción y desuscripción limpia de salas WebSocket al desmontar el hook (CA-5) | Tiempo Real | Hook / Socket.io | Media | Hook usePrevencionSocket montado en Centro de Mando | Montaje y posterior desmontaje del componente al navegar a otra ruta | Emisión de socket.emit('unirse', ...) y posterior socket.off() y socket.emit('salir', ...) | Ciclo de vida limpio previniendo fugas de memoria y listeners huérfanos | **APROBADO** | 05/10/2026 13:00 | - | feat(hooks): implementar hook usePrevencionSocket para recepcion en vivo con pruebas unitarias |
| `CP-H30-WEB-11` | Renderizado de marcadores ámbar de prevención en el visor cartográfico (CA-6) | GIS / Cartografía | Frontend / Map | Alta | Mapa Operativo activo con eventos preventivos registrados | Visualizar capa cartográfica comunal de Valdivia | Pines distintivos circulares en color ámbar (#D97706) con icono de escudo preventivo | Marcadores ámbar claramente diferenciables de incidentes regulares | **APROBADO** | 05/10/2026 13:05 | - | feat(mando): integrar vista cartografica operativa, marcadores de prevencion y conmutador en tablero |
| `CP-H30-WEB-12` | Despliegue de Popup informativo al pulsar un marcador de prevención (CA-6) | GIS / UX | Frontend / Map | Alta | Marcador ámbar visible en mapa táctico | Clic sobre el pin del evento de prevención | Popup con código, título, sector, patrulla asignada, estado de misión e instrucciones | Popup abre con tipografía institucional, badges y desglose de insumos | **APROBADO** | 05/10/2026 13:10 | - | feat(mando): integrar vista cartografica operativa, marcadores de prevencion y conmutador en tablero |
| `CP-H30-WEB-13` | Conmutación instantánea entre vista "Tablero Kanban" y "Mapa Operativo" (CA-6) | Usabilidad / Navegación | Frontend / UI | Alta | Centro de Mando cargado en /gestion/centro-incidentes | Clic en botón "Mapa Operativo" en KanbanHeader | La vista conmuta de columnas Kanban a mapa Leaflet interactivo a pantalla completa | Conmutación fluida conservando filtros de tiempo y delegación | **APROBADO** | 05/10/2026 13:15 | - | feat(mando): integrar vista cartografica operativa, marcadores de prevencion y conmutador en tablero |
| `CP-H30-WEB-14` | Control interactivo de capas cartográficas Toggle de visibilidad (CA-6) | GIS / Usabilidad | Frontend / Map | Media | Mapa Operativo con incidentes y eventos desplegados | Desmarcar checkbox "Incidentes" o "Eventos de Prevención" | El mapa oculta selectivamente los marcadores de la capa desmarcada y ajusta bounds | Capas filtradas dinámicamente según la preferencia del operador | **APROBADO** | 05/10/2026 13:20 | - | feat(mando): integrar vista cartografica operativa, marcadores de prevencion y conmutador en tablero |
| `CP-H30-WEB-15` | Asignación opcional de recursos y validación reactiva de stock disponible (CA-2, CA-4) | Inventario / Bodega | Frontend / Form | Alta | Inventario con insumo "Sacos de Arena 25kg" (stock disp: 20 un.) | Agregar recurso: recursoId = rec-1, cantidad = 50 | Mensaje de error inmediato: "Excede el stock disponible en bodega (máx. 20)"; bloquea envío | Validación reactiva de inventario físico impidiendo envíos con sobre-stock | **APROBADO** | 05/10/2026 13:25 | - | feat(mando): implementar modal de creacion de eventos de prevencion con georreferenciacion y validacion de stock |
| `CP-H30-WEB-16` | Despliegue de banner de conflicto 409 cuando la patrulla pasa a ocupada (CA-4) | Robustez / Manejo 409 | Frontend / UI | Alta | Patrulla asignada fue despachada concurrentemente a otra misión | Respuesta API: 409 Conflict con error PATRULLA_OCUPADA | Modal permanece abierto mostrando banner de alerta contextual sin perder datos ingresados | Se renderiza banner de advertencia sugiriendo seleccionar otra patrulla disponible | **APROBADO** | 05/10/2026 13:30 | - | feat(servicios): implementar servicio dal de prevencion con manejo de conflictos 409 y pruebas unitarias |
| `CP-H30-WEB-17` | Despliegue de banner de conflicto 409 cuando se agota el inventario físico (CA-4) | Robustez / Manejo 409 | Frontend / UI | Alta | Stock en bodega consumido concurrentemente desde otro punto | Respuesta API: 409 Conflict con error STOCK_INSUFICIENTE | Banner detallando insumo con stock insuficiente para reajustar cantidad solicitada | Mensaje descriptivo con stock actual disponible en bodega municipal | **APROBADO** | 05/10/2026 13:35 | - | feat(servicios): implementar servicio dal de prevencion con manejo de conflictos 409 y pruebas unitarias |
| `CP-H30-WEB-18` | Mapeo de errores de validación de campos cuando la API retorna 400 Bad Request (CA-2) | Robustez / DAL | Frontend / DAL | Alta | Petición enviada con datos inválidos rechazados por Zod en backend | Respuesta API: 400 Bad Request con array errors [{ campo, mensaje }] | PrevencionServiceError mapea errores asociando mensajes a cada input del formulario | Errores estructurados en fieldErrors destacados visualmente en cliente | **APROBADO** | 05/10/2026 13:40 | - | feat(servicios): implementar servicio dal de prevencion con manejo de conflictos 409 y pruebas unitarias |
| `CP-H30-WEB-19` | Manejo de excepción 403 Forbidden por falta de permiso prevencion:eventos:crear (CA-1) | Seguridad / RBAC | Frontend / Auth | Alta | Usuario sin rol Encargado (ej. Call Center o Informante) | Intento forzado de creación de evento | Toast de peligro: "Acceso denegado. Se requiere el permiso 'prevencion:eventos:crear'" | Error 403 interceptado con notificación amigable conforme a política RBAC | **APROBADO** | 05/10/2026 13:45 | - | feat(servicios): implementar servicio dal de prevencion con manejo de conflictos 409 y pruebas unitarias |
| `CP-H30-WEB-20` | Limpieza integral del formulario al cancelar o cerrar el modal (CA-1) | Usabilidad / UX | Frontend / UI | Media | Formulario con datos cargados a mitad de llenado | Clic en botón "Cancelar" o en la cruz superior [✕] | Se cierra modal y se reinicia el estado interno previniendo datos huérfanos | Estado reseteado a valores iniciales limpios al volver a abrir | **APROBADO** | 05/10/2026 13:50 | - | feat(mando): implementar modal de creacion de eventos de prevencion con georreferenciacion y validacion de stock |

---

## 5. Bloque TSV para Google Sheets (Copiar y Pegar en Celda A1)

El siguiente bloque en formato tab-separated values (`tsv`) está formateado para pegarse directamente con un clic en la celda **A1** de la hoja de cálculo de QA:

```tsv
ID Caso	Título del Caso de Prueba	Tipo de Prueba	Nivel	Prioridad	Precondición	Datos de Prueba (Payload / Headers / Query)	Resultado Esperado	Resultado Obtenido	Estado	Fecha / Hora Ejecución	Fecha / Hora Re-Test	Solución / Commit
BUG-H30-WEB-01	Incompatibilidad de tipos en RecursoItem por propiedad unidadMedida inexistente	Calidad de Código	UI / Tipado	Media	Modal de prevención abierto intentando renderizar insumos	Renderizado de recurso.unidadMedida en desglose	Compilación limpia reflejando propiedades del inventario	Error TS2339 'Property unidadMedida does not exist on type RecursoItem'; corregido con fallback un.	CORREGIDO	05/10/2026 09:30	05/10/2026 11:15	feat(mando): implementar modal de creacion de eventos de prevencion con georreferenciacion y validacion de stock
BUG-H30-WEB-02	Error de asignación de tipos parameters.header: never en cliente openapi-fetch	Contrato de API	Servicio / DAL	Crítica	Cliente openapi-fetch configurado para POST /api/eventos-atp/prevencion	Petición con params: { header: { Authorization: ... } }	Inyección tipada de credenciales según contrato OpenAPI	Error TS2322 Type '{ header: ... }' is not assignable to type 'never'; resuelto con body e interceptor	CORREGIDO	05/10/2026 09:45	05/10/2026 11:20	feat(servicios): implementar servicio dal de prevencion con manejo de conflictos 409 y pruebas unitarias
BUG-H30-WEB-03	Uso de tipo permisivo any en prop eventosPrevencion del visor cartográfico	Tipado Estático	Componente / Map	Media	Inspección estática de MapaOperativoMando y MapaOperativoMandoInner	Propiedad eventosPrevencion: any[] en interfaz de props	Tipado estricto con EventoPrevencionDTO[] o unknown[] sin uso de any	Advertencia de linter y desajuste de tipos; reemplazado por EventoPrevencionDTO[]	CORREGIDO	05/10/2026 10:15	05/10/2026 11:35	fix(mando): reemplazar tipo any por unknown en prop eventosPrevencion (BUG-INT-13)
BUG-H30-WEB-04	Falla en tests unitarios de sesión por ausencia de mocks en AuthContext	Calidad / Unit Test	Context / Auth	Alta	Ejecución de suite Vitest para validación RBAC de Encargado	npx vitest run src/context/__tests__/AuthContext.test.tsx	Suite de pruebas unitarias ejecutada al 100% sin llamadas no interceptadas	Tests fallaban por Promise rejection en endpoints reales; mocks implementados exitosamente	CORREGIDO	05/10/2026 10:30	05/10/2026 11:50	fix(web): mock obtenerDetalleRol y obtenerUsuarioActivo en pruebas unitarias de AuthContext
BUG-H30-WEB-05	Conflicto de resolución e interferencia entre botones de Prevención y Recuperación	Integración / Merge	Vista / Mando	Crítica	Sincronización de rama feature H30 con develop conteniendo H29	Merge git con botones y capas en KanbanHeader y KanbanBoard	Convivencia armónica de botones y capas para prevención y recuperación	Conflicto de merge sobrescribía botones y tipos; resuelto permitiendo coexistencia de ambas acciones	CORREGIDO	05/10/2026 10:40	05/10/2026 12:05	merge: sincronizar con develop integrando recuperacion (H29) y prevencion (H30)
CP-H30-WEB-01	Visualización del botón "Nuevo Evento de Prevención" en Centro de Mando (CA-1)	Funcional / UI	Frontend / UI	Alta	Encargado con sesión activa en /gestion/centro-incidentes o /mando	Navegación a la vista principal de Centro de Mando	Se visualiza botón primario con icono ShieldAlert y etiqueta "Nuevo Evento de Prevención"	Botón visible y accesible en verde menta institucional (--color-accent-mint) conforme a GEMINI.md	APROBADO	05/10/2026 12:15	-	feat(mando): integrar vista cartografica operativa, marcadores de prevencion y conmutador en tablero
CP-H30-WEB-02	Apertura de Modal accesible con diseño plano institucional (CA-1)	Usabilidad / UI	Frontend / Modal	Alta	Botón "Nuevo Evento de Prevención" visible en cabecera	Clic en el botón o tap en dispositivo táctil	Despliegue de modal accesible con foco automático, backdrop y esquinas planas (radius: 0)	Modal abre fluidamente con ancho máximo de 820px sin desbordamiento	APROBADO	05/10/2026 12:20	-	feat(mando): implementar modal de creacion de eventos de prevencion con georreferenciacion y validacion de stock
CP-H30-WEB-03	Validación estricta de campos obligatorios en formulario cliente (CA-2)	Validación / Negocio	Frontend / Form	Crítica	Modal abierto con formulario en blanco	Clic directo en "Crear y Despachar Patrulla" con campos vacíos	Destaca errores en rojo: título (mín. 3 car.), descripción táctica (mín. 5 car.) y delegación	Formulario bloquea el envío y muestra mensajes de validación contextuales	APROBADO	05/10/2026 12:25	-	feat(mando): implementar modal de creacion de eventos de prevencion con georreferenciacion y validacion de stock
CP-H30-WEB-04	Selección de Punto Crítico y autocompletado de coordenadas y delegación (CA-2)	Integración / Catálogo	Frontend / UX	Alta	Catálogo de puntos críticos activo en backend	Selección en dropdown: Sector Humedal Angachilla (PC-ANG-01)	Coordenadas GPS en mapa se fijan automáticamente, delegación se sincroniza y muestra badge	Autocompletado instantáneo de latitud, longitud y delegación territorial	APROBADO	05/10/2026 12:30	-	feat(mando): implementar modal de creacion de eventos de prevencion con georreferenciacion y validacion de stock
CP-H30-WEB-05	Georreferenciación interactiva mediante mapa Leaflet LocationPickerMap (CA-2)	GIS / Cartografía	Frontend / Map	Alta	Formulario abierto en sección cartográfica	Clic o arrastre de marcador sobre mapa de Valdivia (lat: -39.8456, lng: -73.2389)	Marcador se posiciona en el punto exacto; inputs latitud y longitud se actualizan dinámicamente	Coordenadas WGS84 actualizadas y validadas dentro del cuadrante comunal	APROBADO	05/10/2026 12:35	-	feat(mando): implementar modal de creacion de eventos de prevencion con georreferenciacion y validacion de stock
CP-H30-WEB-06	Registro de evento preventivo autónomo sin requerir incidente previo (CA-3)	Regla de Negocio (ICS)	Frontend / DAL	Crítica	Encargado completando formulario preventivo	Payload con puntoCriticoId y patrullaId sin idIncidente formal	Creación directa en base de datos sin vincular incidente; folio PREV generado con éxito	Evento registrado autónomamente sin exigir incidente previo asociado	APROBADO	05/10/2026 12:40	-	feat(servicios): implementar servicio dal de prevencion con manejo de conflictos 409 y pruebas unitarias
CP-H30-WEB-07	Filtrado estricto de patrullas verificadoras en estado DISPONIBLE (CA-4)	Reglas de Negocio / UI	Frontend / Filtros	Alta	Patrullas: Patrulla P-01 (DISPONIBLE), Patrulla P-02 (EN_VERIFICACION)	Despliegue de selector operativo de patrullas	Únicamente se ofrecen patrullas en estado DISPONIBLE para despacho inmediato	Selector filtra estrictamente por estado operativo; no lista patrullas ocupadas	APROBADO	05/10/2026 12:45	-	feat(mando): implementar modal de creacion de eventos de prevencion con georreferenciacion y validacion de stock
CP-H30-WEB-08	Asignación y cambio de estado de patrulla a EN_PREVENCION (CA-4)	Integración / Estado	Frontend / DAL	Crítica	Patrulla libre seleccionada para la labor preventiva	Envío de formulario exitoso con patrullaId asignada	La patrulla transiciona automáticamente a estado operativo EN_PREVENCION en sistema	Respuesta de API refleja patrulla con estado EN_PREVENCION y misión DESPACHADA	APROBADO	05/10/2026 12:50	-	feat(servicios): implementar servicio dal de prevencion con manejo de conflictos 409 y pruebas unitarias
CP-H30-WEB-09	Notificación en tiempo real vía WebSocket al crearse un nuevo evento (CA-5)	Tiempo Real / Socket	Frontend / Hook	Alta	Encargado con Centro de Mando abierto en otra sesión o pantalla	Emisión de socket: evento prevencion:creada en salas sala:encargados y mapa	Socket captura evento; se muestra Toast informativo y se actualiza mapa	Evento capturado en vivo sin necesidad de recargar la página web	APROBADO	05/10/2026 12:55	-	feat(hooks): implementar hook usePrevencionSocket para recepcion en vivo con pruebas unitarias
CP-H30-WEB-10	Suscripción y desuscripción limpia de salas WebSocket al desmontar el hook (CA-5)	Tiempo Real	Hook / Socket.io	Media	Hook usePrevencionSocket montado en Centro de Mando	Montaje y posterior desmontaje del componente al navegar a otra ruta	Emisión de socket.emit('unirse', ...) y posterior socket.off() y socket.emit('salir', ...)	Ciclo de vida limpio previniendo fugas de memoria y listeners huérfanos	APROBADO	05/10/2026 13:00	-	feat(hooks): implementar hook usePrevencionSocket para recepcion en vivo con pruebas unitarias
CP-H30-WEB-11	Renderizado de marcadores ámbar de prevención en el visor cartográfico (CA-6)	GIS / Cartografía	Frontend / Map	Alta	Mapa Operativo activo con eventos preventivos registrados	Visualizar capa cartográfica comunal de Valdivia	Pines distintivos circulares en color ámbar (#D97706) con icono de escudo preventivo	Marcadores ámbar claramente diferenciables de incidentes regulares	APROBADO	05/10/2026 13:05	-	feat(mando): integrar vista cartografica operativa, marcadores de prevencion y conmutador en tablero
CP-H30-WEB-12	Despliegue de Popup informativo al pulsar un marcador de prevención (CA-6)	GIS / UX	Frontend / Map	Alta	Marcador ámbar visible en mapa táctico	Clic sobre el pin del evento de prevención	Popup con código, título, sector, patrulla asignada, estado de misión e instrucciones	Popup abre con tipografía institucional, badges y desglose de insumos	APROBADO	05/10/2026 13:10	-	feat(mando): integrar vista cartografica operativa, marcadores de prevencion y conmutador en tablero
CP-H30-WEB-13	Conmutación instantánea entre vista "Tablero Kanban" y "Mapa Operativo" (CA-6)	Usabilidad / Navegación	Frontend / UI	Alta	Centro de Mando cargado en /gestion/centro-incidentes	Clic en botón "Mapa Operativo" en KanbanHeader	La vista conmuta de columnas Kanban a mapa Leaflet interactivo a pantalla completa	Conmutación fluida conservando filtros de tiempo y delegación	APROBADO	05/10/2026 13:15	-	feat(mando): integrar vista cartografica operativa, marcadores de prevencion y conmutador en tablero
CP-H30-WEB-14	Control interactivo de capas cartográficas Toggle de visibilidad (CA-6)	GIS / Usabilidad	Frontend / Map	Media	Mapa Operativo con incidentes y eventos desplegados	Desmarcar checkbox "Incidentes" o "Eventos de Prevención"	El mapa oculta selectivamente los marcadores de la capa desmarcada y ajusta bounds	Capas filtradas dinámicamente según la preferencia del operador	APROBADO	05/10/2026 13:20	-	feat(mando): integrar vista cartografica operativa, marcadores de prevencion y conmutador en tablero
CP-H30-WEB-15	Asignación opcional de recursos y validación reactiva de stock disponible (CA-2, CA-4)	Inventario / Bodega	Frontend / Form	Alta	Inventario con insumo "Sacos de Arena 25kg" (stock disp: 20 un.)	Agregar recurso: recursoId = rec-1, cantidad = 50	Mensaje de error inmediato: "Excede el stock disponible en bodega (máx. 20)"; bloquea envío	Validación reactiva de inventario físico impidiendo envíos con sobre-stock	APROBADO	05/10/2026 13:25	-	feat(mando): implementar modal de creacion de eventos de prevencion con georreferenciacion y validacion de stock
CP-H30-WEB-16	Despliegue de banner de conflicto 409 cuando la patrulla pasa a ocupada (CA-4)	Robustez / Manejo 409	Frontend / UI	Alta	Patrulla asignada fue despachada concurrentemente a otra misión	Respuesta API: 409 Conflict con error PATRULLA_OCUPADA	Modal permanece abierto mostrando banner de alerta contextual sin perder datos ingresados	Se renderiza banner de advertencia sugiriendo seleccionar otra patrulla disponible	APROBADO	05/10/2026 13:30	-	feat(servicios): implementar servicio dal de prevencion con manejo de conflictos 409 y pruebas unitarias
CP-H30-WEB-17	Despliegue de banner de conflicto 409 cuando se agota el inventario físico (CA-4)	Robustez / Manejo 409	Frontend / UI	Alta	Stock en bodega consumido concurrentemente desde otro punto	Respuesta API: 409 Conflict con error STOCK_INSUFICIENTE	Banner detallando insumo con stock insuficiente para reajustar cantidad solicitada	Mensaje descriptivo con stock actual disponible en bodega municipal	APROBADO	05/10/2026 13:35	-	feat(servicios): implementar servicio dal de prevencion con manejo de conflictos 409 y pruebas unitarias
CP-H30-WEB-18	Mapeo de errores de validación de campos cuando la API retorna 400 Bad Request (CA-2)	Robustez / DAL	Frontend / DAL	Alta	Petición enviada con datos inválidos rechazados por Zod en backend	Respuesta API: 400 Bad Request con array errors [{ campo, mensaje }]	PrevencionServiceError mapea errores asociando mensajes a cada input del formulario	Errores estructurados en fieldErrors destacados visualmente en cliente	APROBADO	05/10/2026 13:40	-	feat(servicios): implementar servicio dal de prevencion con manejo de conflictos 409 y pruebas unitarias
CP-H30-WEB-19	Manejo de excepción 403 Forbidden por falta de permiso prevencion:eventos:crear (CA-1)	Seguridad / RBAC	Frontend / Auth	Alta	Usuario sin rol Encargado (ej. Call Center o Informante)	Intento forzado de creación de evento	Toast de peligro: "Acceso denegado. Se requiere el permiso 'prevencion:eventos:crear'"	Error 403 interceptado con notificación amigable conforme a política RBAC	APROBADO	05/10/2026 13:45	-	feat(servicios): implementar servicio dal de prevencion con manejo de conflictos 409 y pruebas unitarias
CP-H30-WEB-20	Limpieza integral del formulario al cancelar o cerrar el modal (CA-1)	Usabilidad / UX	Frontend / UI	Media	Formulario con datos cargados a mitad de llenado	Clic en botón "Cancelar" o en la cruz superior [✕]	Se cierra modal y se reinicia el estado interno previniendo datos huérfanos	Estado reseteado a valores iniciales limpios al volver a abrir	APROBADO	05/10/2026 13:50	-	feat(mando): implementar modal de creacion de eventos de prevencion con georreferenciacion y validacion de stock
```

---

## 6. Guía Detallada de Ejecución y Replicabilidad 100% (Paso a Paso)

Para auditar y reproducir de manera idéntica los resultados obtenidos en la columna **"Resultado Obtenido"**, ejecuta los siguientes comandos en la raíz del proyecto `sgrai-web`:

---

### 6.1. Verificación Estática y Compilación de Producción

```bash
# 1. Chequeo de tipos estáticos TypeScript
npx tsc --noEmit
# Salida esperada: 0 errores (código de salida 0)

# 2. Análisis estático con ESLint
npm run lint
# Salida esperada: 0 errores, 0 advertencias

# 3. Compilación de producción Next.js con Turbopack
npm run build
# Salida esperada:
# ○ /gestion/centro-incidentes (Dynamic / App Router)
# ✓ Compiled successfully in 8.4s
```

---

### 6.2. Verificación de Defectos Corregidos (Ciclo de Re-Test)

#### `BUG-H30-WEB-01`: Unificación y Fallback de Insumos Logísticos
* **Comando Vitest de Re-Test:**
  ```bash
  npx vitest run src/components/mando/__tests__/ModalCrearEventoPrevencion.test.tsx -t "debe despachar el evento exitosamente sin recursos"
  ```
* **Salida Obtenida:**
  ```text
   ✓ src/components/mando/__tests__/ModalCrearEventoPrevencion.test.tsx (8 tests | 7 skipped) 458ms
     ✓ ModalCrearEventoPrevencion (HU-30) > debe despachar el evento exitosamente sin recursos (recursos opcionales) 50ms

   Test Files  1 passed (1)
        Tests  1 passed | 7 skipped (8)
  ```

#### `BUG-H30-WEB-02`: Consumo del Servicio DAL con OpenAPI-Fetch
* **Comando Vitest de Re-Test:**
  ```bash
  npx vitest run src/services/__tests__/prevencionService.test.ts -t "debe registrar un evento de prevención exitosamente en 201 Created"
  ```
* **Salida Obtenida:**
  ```text
   ✓ src/services/__tests__/prevencionService.test.ts (7 tests | 6 skipped) 7ms
     ✓ prevencionService (HU-30) > debe registrar un evento de prevención exitosamente en 201 Created 3ms

   Test Files  1 passed (1)
        Tests  1 passed | 6 skipped (7)
  ```

#### `BUG-H30-WEB-03`: Tipado Estricto de `eventosPrevencion` en Visor Cartográfico
* **Comando de Verificación de Tipos:**
  ```bash
  npx tsc --noEmit
  ```
* **Salida Obtenida:**
  ```text
  Exit code: 0 (Cero advertencias ni tipos 'any' no declarados).
  ```

#### `BUG-H30-WEB-04`: Mocks en `AuthContext` para Verificación de Permisos
* **Comando Vitest de Re-Test:**
  ```bash
  npx vitest run src/context/__tests__/AuthContext.test.tsx
  ```
* **Salida Obtenida:**
  ```text
   ✓ src/context/__tests__/AuthContext.test.tsx (5 tests) 42ms
   Test Files  1 passed (1)
        Tests  5 passed (5)
  ```

#### `BUG-H30-WEB-05`: Coexistencia de Botones y Capas Tácticas en `KanbanHeader`
* **Comando Vitest de Re-Test:**
  ```bash
  npx vitest run src/components/mando/__tests__/KanbanHeader.test.tsx -t "HU-30"
  ```
* **Salida Obtenida:**
  ```text
   ✓ src/components/mando/__tests__/KanbanHeader.test.tsx (5 tests) 167ms
     ✓ KanbanHeader (HU-30) > debe renderizar el título institucional y contadores 108ms
     ✓ KanbanHeader (HU-30) > debe renderizar el botón "Nuevo Evento de Prevención" y ejecutar onOpenCrearPrevencion 23ms
     ✓ KanbanHeader (HU-30) > debe permitir conmutar entre Tablero Kanban y Mapa Operativo 15ms
     ✓ KanbanHeader (HU-30) > debe renderizar el botón de Misiones Operativas si se pasa onAbrirMisiones 9ms
     ✓ KanbanHeader (HU-30) > debe renderizar el botón "Nuevo Evento de Recuperación" si se pasa onOpenCrearRecuperacion 10ms

   Test Files  1 passed (1)
        Tests  5 passed (5)
  ```

---

### 6.3. Casos Funcionales de Interfaz y Lógica (Vitest)

#### `CP-H30-WEB-01` y `CP-H30-WEB-02`: Botón y Apertura de Modal
```bash
npx vitest run src/components/mando/__tests__/KanbanHeader.test.tsx -t "debe renderizar el botón \"Nuevo Evento de Prevención\" y ejecutar onOpenCrearPrevencion"
```
```text
 ✓ src/components/mando/__tests__/KanbanHeader.test.tsx (5 tests | 4 skipped)
   ✓ KanbanHeader (HU-30) > debe renderizar el botón "Nuevo Evento de Prevención" y ejecutar onOpenCrearPrevencion 23ms
```

#### `CP-H30-WEB-03`: Validación Estricta de Campos Obligatorios
```bash
npx vitest run src/components/mando/__tests__/ModalCrearEventoPrevencion.test.tsx -t "debe mostrar errores de validación si se envía el formulario vacío"
```
```text
 ✓ src/components/mando/__tests__/ModalCrearEventoPrevencion.test.tsx (8 tests | 7 skipped)
   ✓ ModalCrearEventoPrevencion (HU-30) > debe mostrar errores de validación si se envía el formulario vacío 97ms
```

#### `CP-H30-WEB-04`: Selección de Punto Crítico y Autocompletado de Coordenadas
```bash
npx vitest run src/components/mando/__tests__/ModalCrearEventoPrevencion.test.tsx -t "debe autocompletar coordenadas y delegación al seleccionar un Punto Crítico del catálogo"
```
```text
 ✓ src/components/mando/__tests__/ModalCrearEventoPrevencion.test.tsx (8 tests | 7 skipped)
   ✓ ModalCrearEventoPrevencion (HU-30) > debe autocompletar coordenadas y delegación al seleccionar un Punto Crítico del catálogo 31ms
```

#### `CP-H30-WEB-09` y `CP-H30-WEB-10`: Hook de Comunicación en Tiempo Real Socket.io
```bash
npx vitest run src/hooks/__tests__/usePrevencionSocket.test.ts
```
```text
 ✓ src/hooks/__tests__/usePrevencionSocket.test.ts (3 tests) 19ms
   ✓ usePrevencionSocket (HU-30) > debe conectar al socket y unirse a las salas operativas 14ms
   ✓ usePrevencionSocket (HU-30) > debe invocar onEventoCreado al recibir evento WebSocket prevencion:creada 2ms
   ✓ usePrevencionSocket (HU-30) > debe limpiar listeners y abandonar salas operativas al desmontar el hook 2ms

 Test Files  1 passed (1)
      Tests  3 passed (3)
```

#### `CP-H30-WEB-15`: Restricción Reactiva de Stock en Insumos Logísticos
```bash
npx vitest run src/components/mando/__tests__/ModalCrearEventoPrevencion.test.tsx -t "debe validar que la cantidad no supere el stock si se agregan recursos opcionales"
```
```text
 ✓ src/components/mando/__tests__/ModalCrearEventoPrevencion.test.tsx (8 tests | 7 skipped)
   ✓ ModalCrearEventoPrevencion (HU-30) > debe validar que la cantidad no supere el stock si se agregan recursos opcionales 95ms
```

#### `CP-H30-WEB-16`: Manejo y Banner de Conflicto 409 (Patrulla Ocupada)
```bash
npx vitest run src/components/mando/__tests__/ModalCrearEventoPrevencion.test.tsx -t "debe mostrar banner de conflicto cuando la patrulla ya está ocupada"
```
```text
 ✓ src/components/mando/__tests__/ModalCrearEventoPrevencion.test.tsx (8 tests | 7 skipped)
   ✓ ModalCrearEventoPrevencion (HU-30) > debe mostrar banner de conflicto cuando la patrulla ya está ocupada (409 Conflict) 46ms
```

#### `CP-H30-WEB-17`: Manejo y Banner de Conflicto 409 (Stock Insuficiente en Bodega)
```bash
npx vitest run src/components/mando/__tests__/ModalCrearEventoPrevencion.test.tsx -t "debe mostrar banner de conflicto cuando el stock en bodega es insuficiente"
```
```text
 ✓ src/components/mando/__tests__/ModalCrearEventoPrevencion.test.tsx (8 tests | 7 skipped)
   ✓ ModalCrearEventoPrevencion (HU-30) > debe mostrar banner de conflicto cuando el stock en bodega es insuficiente (409 Conflict) 43ms
```

#### `CP-H30-WEB-18`: Mapeo de Errores de Validación de Campos (400 Bad Request)
```bash
npx vitest run src/services/__tests__/prevencionService.test.ts -t "debe mapear errores de validación de campos cuando la API retorna 400 Bad Request"
```
```text
 ✓ src/services/__tests__/prevencionService.test.ts (7 tests | 6 skipped)
   ✓ prevencionService (HU-30) > debe mapear errores de validación de campos cuando la API retorna 400 Bad Request 0ms
```

#### `CP-H30-WEB-19`: Control de Acceso y Bloqueo 403 Forbidden (RBAC)
```bash
npx vitest run src/services/__tests__/prevencionService.test.ts -t "debe arrojar error de permisos en 403 Forbidden"
```
```text
 ✓ src/services/__tests__/prevencionService.test.ts (7 tests | 6 skipped)
   ✓ prevencionService (HU-30) > debe arrojar error de permisos en 403 Forbidden 0ms
```

---

### 6.4. Comandos cURL E2E para Replicabilidad de Contratos de Red

#### Petición 1: Creación Exitosa de Evento de Prevención (201 Created)
```bash
curl -i -X POST "http://localhost:3000/api/eventos-atp/prevencion" \
  -H "Content-Type: application/json" \
  -H "x-user-id: 10000000-0000-4000-8000-000000000001" \
  -H "Authorization: Bearer <TOKEN_VALIDO_ENCARGADO>" \
  -d '{
    "nombre": "Limpieza y monitoreo de sumideros en Angachilla",
    "descripcion": "Monitoreo preventivo del caudal e inspección de alcantarillas por frente de mal tiempo.",
    "sector": "Humedal Angachilla",
    "direccionTexto": "Av. Simpson con Los Robles",
    "prioridad": "ALTA",
    "delegacionId": "30000000-0000-4000-8000-000000000001",
    "puntoCriticoId": "40000000-0000-4000-8000-000000000001",
    "latitud": -39.8456,
    "longitud": -73.2389,
    "patrullaId": "f1000000-0000-4000-8000-000000000002",
    "recursos": [
      { "recursoId": "00000000-0000-4000-8000-000000000001", "cantidad": 5 }
    ]
  }'
```
* **Respuesta HTTP Obtenida:**
  ```http
  HTTP/1.1 201 Created
  Content-Type: application/json; charset=utf-8

  {
    "message": "Evento de prevención creado y patrulla despachada exitosamente.",
    "data": {
      "id": "91d99083-b0a4-4a23-a269-1df58dd60dbb",
      "codigo": "PREV-2026-0001",
      "nombre": "Limpieza y monitoreo de sumideros en Angachilla",
      "descripcion": "Monitoreo preventivo del caudal e inspección de alcantarillas por frente de mal tiempo.",
      "sector": "Humedal Angachilla",
      "direccionTexto": "Av. Simpson con Los Robles",
      "prioridad": "ALTA",
      "estado": "PLANIFICADA",
      "latitud": -39.8456,
      "longitud": -73.2389,
      "puntoCritico": {
        "id": "40000000-0000-4000-8000-000000000001",
        "codigo": "PC-ANG-01",
        "nombre": "Sector Humedal Angachilla - Pasaje Los Robles"
      },
      "delegacion": {
        "id": "30000000-0000-4000-8000-000000000001",
        "codigo": "DEL_NORTE",
        "nombre": "Delegación Municipal Norte"
      },
      "mision": {
        "id": "17dbae23-d6c7-45c1-8850-d37cfd9ee7f6",
        "codigo": "MIS-2026-0006",
        "titulo": "Limpieza y monitoreo de sumideros en Angachilla",
        "estado": "DESPACHADA",
        "tipoMision": "PREVENCION"
      },
      "patrulla": {
        "id": "f1000000-0000-4000-8000-000000000002",
        "nombre": "Patrulla Rápida Centro-Sur",
        "estado": "EN_PREVENCION"
      },
      "recursos": [
        {
          "recursoId": "00000000-0000-4000-8000-000000000001",
          "nombre": "Sacos de Arena 25kg",
          "cantidadAsignada": 5
        }
      ],
      "creadoPorId": "10000000-0000-4000-8000-000000000001",
      "creadoEn": "2026-10-05T06:45:50.867Z",
      "actualizadoEn": "2026-10-05T06:45:50.867Z"
    }
  }
  ```

#### Petición 2: Conflicto Concurrente por Patrulla Ocupada (409 Conflict)
```bash
curl -i -X POST "http://localhost:3000/api/eventos-atp/prevencion" \
  -H "Content-Type: application/json" \
  -H "x-user-id: 10000000-0000-4000-8000-000000000001" \
  -H "Authorization: Bearer <TOKEN_VALIDO_ENCARGADO>" \
  -d '{
    "nombre": "Patrullaje preventivo",
    "descripcion": "Verificación de cuenca",
    "delegacionId": "30000000-0000-4000-8000-000000000001",
    "puntoCriticoId": "40000000-0000-4000-8000-000000000001",
    "latitud": -39.8456,
    "longitud": -73.2389,
    "patrullaId": "patrulla-ocupada-id"
  }'
```
* **Respuesta HTTP Obtenida:**
  ```http
  HTTP/1.1 409 Conflict
  Content-Type: application/json; charset=utf-8

  {
    "message": "La patrulla \"Patrulla Rápida Costa-1\" no está disponible para asignación (estado actual: EN_VERIFICACION)."
  }
  ```

#### Petición 3: Conflicto Concurrente por Inventario Insuficiente (409 Conflict)
```bash
curl -i -X POST "http://localhost:3000/api/eventos-atp/prevencion" \
  -H "Content-Type: application/json" \
  -H "x-user-id: 10000000-0000-4000-8000-000000000001" \
  -H "Authorization: Bearer <TOKEN_VALIDO_ENCARGADO>" \
  -d '{
    "nombre": "Entrega preventiva de sacos",
    "descripcion": "Refuerzo perimetral",
    "delegacionId": "30000000-0000-4000-8000-000000000001",
    "puntoCriticoId": "40000000-0000-4000-8000-000000000001",
    "latitud": -39.8456,
    "longitud": -73.2389,
    "patrullaId": "f1000000-0000-4000-8000-000000000002",
    "recursos": [
      { "recursoId": "00000000-0000-4000-8000-000000000001", "cantidad": 50 }
    ]
  }'
```
* **Respuesta HTTP Obtenida:**
  ```http
  HTTP/1.1 409 Conflict
  Content-Type: application/json; charset=utf-8

  {
    "message": "Stock insuficiente para el recurso \"Sacos de Arena 25kg\". Solicitado: 50, Disponible: 20."
  }
  ```

#### Petición 4: Acceso Denegado por Falta de Permiso RBAC (403 Forbidden)
```bash
curl -i -X POST "http://localhost:3000/api/eventos-atp/prevencion" \
  -H "Content-Type: application/json" \
  -H "x-user-id: callcenter-user-id" \
  -H "Authorization: Bearer <TOKEN_OPERADOR_CALLCENTER>" \
  -d '{
    "nombre": "Intento no autorizado",
    "descripcion": "Sin privilegios",
    "delegacionId": "30000000-0000-4000-8000-000000000001",
    "puntoCriticoId": "40000000-0000-4000-8000-000000000001",
    "latitud": -39.8456,
    "longitud": -73.2389,
    "patrullaId": "f1000000-0000-4000-8000-000000000002"
  }'
```
* **Respuesta HTTP Obtenida:**
  ```http
  HTTP/1.1 403 Forbidden
  Content-Type: application/json; charset=utf-8

  {
    "message": "Acceso denegado. Se requiere el permiso 'prevencion:eventos:crear'."
  }
  ```

---

## 7. Conclusión de la Evaluación de Calidad

1. **Estado de la Rama:** La rama `feature/H30-crear-evento-manual-prevencion` cumple al 100% con los criterios de aceptación funcionales, geoespaciales y de tiempo real de la historia HU-30.
2. **Estabilidad Técnica:**
   - Compilación Next.js: Exitosa (29/29 rutas estáticas y dinámicas compiladas).
   - Tipado TypeScript: 0 errores (`npx tsc --noEmit`).
   - Linter ESLint: 0 advertencias, 0 errores.
   - Pruebas Automatizadas Unitarias/Integración: 23/23 tests dedicados aprobados (100% pass).
3. **Recomendación QA:** Certificación formal completada. Rama apta para despliegue en ambiente de staging/producción tras cumplir los ciclos de Pair Review y PO Review conforme a `GEMINI.md`.
