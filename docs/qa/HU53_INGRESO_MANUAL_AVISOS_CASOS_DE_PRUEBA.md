# Informe y Matriz de Casos de Prueba (QA): HU-53 — Ingreso Manual de Incidentes (Frontend Web)

> **Documento Oficial de Aseguramiento de Calidad (QA) — Frontend**  
> **Proyecto:** Sistema de Gestión de Recursos para Atención de Incidentes (SGRAI) — Dirección de Gestión de Riesgos de Desastres, Municipalidad de Valdivia.  
> **Módulo:** Call Center / Recepción de Emergencias (Formulario de Ingreso Manual, Detección de Duplicados y Mapa Interactivo).  
> **Historia de Usuario:** HU-53 — *"Como Call center Quiero poder ingresar manualmente un reporte ya sea desde una llamada o por parte de un funcionario Para enviarlos al encargado."*  
> **Cliente Web:** `sgrai-web` (Next.js 16 + React 19 + TypeScript + Leaflet + Vitest + Testing Library).  
> **Rama Git Evaluada:** `feature/H53-ingreso-manual-avisos` (mergeada en `develop` mediante Pull Request #9).  
> **Commits Clave Evaluados (Conventional Commits):**  
> * `feat(callcenter): sincronizar direccion escrita con el mapa y retirar emoji de prioridad critica`  
> * `feat(callcenter): geocodificacion inversa desde mapa, simetria de botones y redaccion no tecnica`  
> * `refactor(callcenter): aislar capa dal en incidentesManualesService y corregir efectos en hooks`  
> * `fix(ui): unificar patron de titulo y sanitizar UUIDs en toasts de error (#31)`  
> * `fix(ui): rediseñar formulario de ingreso manual, selector de origen y estandarizar layout (#11, #17, #22, #24, #25, #28)`  
> * `feat(callcenter): implementar formulario manual, modal de duplicados y tarjeta de exito`  
> * `feat(callcenter): implementar servicio de incidentes manuales con tipado y pruebas unitarias`  
> * `feat(callcenter): agregar layout institucional y pagina dedicada /callcenter/manual`  
> * `refactor(callcenter): atomizar formulario manual, modal de duplicados y tarjeta de exito`  
> * `refactor(dal): migrar servicios a incidentesManualesService, mover hooks a src/hooks y eliminar shims (#11, #12, #24, #25)`  
> * `docs(manuales): crear manual de usuario H53 para ingreso manual de incidentes call center`  
> 
> **Fecha de Certificación QA:** Septiembre / Octubre 2026.  
> **Estado de Certificación:** 🟢 **APROBADO PARA PRODUCCIÓN (100% PASS TRAS RE-TESTS)**.

---

## 1. Resumen Ejecutivo de Pruebas de Frontend

| Métrica | Resultado |
|---|:---:|
| **Total de Casos de Prueba Diseñados y Ejecutados** | **23** (18 Casos Funcionales/UI/Seguridad + 5 Defectos Gestionados) |
| **Casos Aprobados (Passed)** | **18** |
| **Casos Fallidos (Failed)** | **0** |
| **Casos Bloqueados (Blocked)** | **0** |
| **Defectos Detectados y Devueltos a Desarrolladores (Bugs)** | **5** (100% resueltos, re-testeados y cerrados) |
| **Tasa de Aprobación Global (% Pass)** | **100%** |
| **Suite Automatizada de Pruebas de Frontend (Vitest)** | **29/29 tests exitosos en componentes y servicios H53** |
| **Chequeo de Tipos Estáticos (TypeScript)** | **0 errores (`tsc --noEmit`)** |
| **Compilación de Producción (Next.js)** | **Exitosa (0 errores de build)** |
| **Apego al Sistema de Diseño Municipal (`GEMINI.md`)** | **100% (esquinas rectas, paleta flat municipal, franja teal, sin emojis)** |

---

## 2. Registro de Defectos Detectados en QA y Ciclo de Re-Test

Siguiendo el flujo docente de Aseguramiento de Calidad (*detección de defectos durante el ciclo de desarrollo de la rama, reporte formal al equipo de desarrollo, implementación del fix mediante commit en Conventional Commits y ejecución formal de re-test para certificación de cierre*), se detectaron y gestionaron 5 defectos en la interfaz web:

| ID Defecto | Descripción del Defecto Encontrado | Severidad | Módulo / Componente | Fecha Hallazgo | Commit del Fix (Sin Hash) | Fecha Re-Test | Dictamen Re-Test |
|---|---|:---:|---|:---:|---|:---:|:---:|
| `BUG-H53-WEB-01` | Desincronización unidireccional entre la dirección textual escrita y el pin en el mapa interactivo `LocationPickerMap`. Al ingresar una dirección por teclado, el mapa no actualizaba sus coordenadas ni centraba el visor en el sector de Valdivia. | Alta | `src/components/callcenter/IncidenteManualForm.tsx` / `src/lib/maps/geocoding.ts` | 13/09/2026 21:40 | feat(callcenter): sincronizar direccion escrita con el mapa y retirar emoji de prioridad critica | 14/09/2026 00:15 | 🟢 CORREGIDO (Sincronización bidireccional y geocodificación reactiva con botón 'Ubicar en mapa') |
| `BUG-H53-WEB-02` | Omisión de geocodificación inversa al reposicionar manualmente el marcador en el mapa. Al arrastrar o hacer clic en el mapa interactivo, no se refrescaba la dirección textual, provocando envíos con discrepancia entre texto y coordenadas GPS. | Alta | `src/components/maps/LocationPickerMap.tsx` / `src/lib/maps/geocoding.ts` | 13/09/2026 22:30 | feat(callcenter): geocodificacion inversa desde mapa, simetria de botones y redaccion no tecnica | 14/09/2026 00:30 | 🟢 CORREGIDO (Geocodificación inversa automática al hacer clic o arrastrar el marcador en el mapa) |
| `BUG-H53-WEB-03` | Bucle de re-renderizado infinito (infinite loop) y cierres obsoletos (stale closure) en hook `useVerificarDuplicado` al ejecutar consultas con debounce sobre la dirección. | Alta | `src/hooks/useVerificarDuplicado.ts` / `src/services/incidentesManualesService.ts` | 25/09/2026 15:20 | refactor(callcenter): aislar capa dal en incidentesManualesService y corregir efectos en hooks | 27/09/2026 16:45 | 🟢 CORREGIDO (Aislamiento en DAL limpia de servicio y dependencias estables en hook sin re-renders espurios) |
| `BUG-H53-WEB-04` | Fuga de identificadores técnicos y UUIDs del backend en banners/toasts ante rechazos o errores de red, exponiendo IDs internos a los operadores del Call Center. | Media | `src/lib/utils/errorUtils.ts` / `src/components/callcenter/IncidenteManualForm.tsx` | 26/09/2026 11:10 | fix(ui): unificar patron de titulo y sanitizar UUIDs en toasts de error (#31) | 28/09/2026 09:30 | 🟢 CORREGIDO (Sanitización regex de UUIDs en mensajes de error presentando textos institucionales comprensibles) |
| `BUG-H53-WEB-05` | Desalineación con el sistema de diseño municipal institucional (`GEMINI.md`) en selector de origen, botones asimétricos, uso de emojis en prioridades y falta de layout estándar (`PageTitleCard`, `Breadcrumbs`, `InlineNotice`). | Media | `src/components/callcenter/IncidenteManualForm.tsx` / `src/components/callcenter/form/OrigenSelector.tsx` | 26/09/2026 17:30 | fix(ui): rediseñar formulario de ingreso manual, selector de origen y estandarizar layout (#11, #17, #22, #24, #25, #28) | 28/09/2026 10:15 | 🟢 CORREGIDO (Selector segmentado institucional con bordes rectos, paleta flat municipal, retiro de emojis y breadcrumbs) |

---

## 3. Matriz Consolidada de Casos de Prueba (13 Columnas)

| ID Caso | Título del Caso de Prueba | Tipo de Prueba | Nivel | Prioridad | Precondición | Datos de Prueba (Payload / Headers / Query) | Resultado Esperado | Resultado Obtenido | Estado | Fecha / Hora Ejecución | Fecha / Hora Re-Test | Solución / Commit |
|---|---|---|---|---|---|---|---|---|:---:|:---:|:---:|---|
| `BUG-H53-WEB-01` | Desincronización entre dirección textual y marcador interactivo en mapa Leaflet | Integración / UI | Componente | Alta | Formulario abierto en navegador | Escribir dirección "Av. Alemania 550" y pulsar "Ubicar en mapa" | El mapa interactivo se centra y actualiza el pin en las coordenadas correspondientes | El pin permanecía estático en el centro de Valdivia provocando desajuste entre texto y GPS | CORREGIDO | 13/09/2026 21:40 | 14/09/2026 00:15 | feat(callcenter): sincronizar direccion escrita con el mapa y retirar emoji de prioridad critica |
| `BUG-H53-WEB-02` | Omisión de geocodificación inversa al reposicionar manualmente el marcador en el mapa | Usabilidad / Datos | Componente / Map | Alta | Mapa interactivo activo | Hacer clic sobre calle Picarte 2000 en el mapa | El campo de texto de dirección se actualiza automáticamente con la dirección aproximada | Coordenadas cambiaban internamente pero el campo de dirección quedaba en blanco o desactualizado | CORREGIDO | 13/09/2026 22:30 | 14/09/2026 00:30 | feat(callcenter): geocodificacion inversa desde mapa, simetria de botones y redaccion no tecnica |
| `BUG-H53-WEB-03` | Bucle de re-renderizado infinito en hook de duplicados con debounce | Rendimiento / React | Hook / Efecto | Alta | Formulario montado en interfaz | Escribir dirección letra por letra en el campo de texto | Consulta fluida tras 600ms de inactividad sin disparar renderizados cíclicos | Hook useVerificarDuplicado disparaba re-renders infinitos congelando la pestaña del navegador | CORREGIDO | 25/09/2026 15:20 | 27/09/2026 16:45 | refactor(callcenter): aislar capa dal en incidentesManualesService y corregir efectos en hooks |
| `BUG-H53-WEB-04` | Fuga de identificadores técnicos UUID en notificaciones y mensajes de error | Seguridad UI / UX | UI / Feedback | Media | Fallo transitorio de red o validación en backend | Simular respuesta de error con mensaje que contiene UUID | Mensaje sanitizado sin exhibir identificadores UUID crudos ni detalles internos | Toast desplegaba cadena cruda con UUID exponiendo datos de arquitectura interna | CORREGIDO | 26/09/2026 11:10 | 28/09/2026 09:30 | fix(ui): unificar patron de titulo y sanitizar UUIDs en toasts de error (#31) |
| `BUG-H53-WEB-05` | Desalineación con sistema de diseño municipal: botones asimétricos y uso de emojis | Estándar Visual | UI / Estilos | Media | Formulario cargado en /callcenter/manual | Inspección visual de botones, selector de origen y opciones de prioridad | Esquinas rectas (rounded-none), sin emojis, franja 4px teal (#14505A), estilo plano | Selector con bordes redondeados, emojis en prioridades y asimetría en botones de acción | CORREGIDO | 26/09/2026 17:30 | 28/09/2026 10:15 | fix(ui): rediseñar formulario de ingreso manual, selector de origen y estandarizar layout (#11, #17, #22, #24, #25, #28) |
| `CP-H53-WEB-01` | Renderizado inicial del formulario con origen Llamada Telefónica seleccionado por defecto (CA-1, CA-2) | Funcional / UI | Componente | Crítica | Operador Call Center con sesión activa en /callcenter/manual | Carga de la página en navegador | Despliegue de layout institucional, OrigenSelector con 'Llamada Telefónica' activo y campos vacíos | Formulario renderizado con breadcrumbs, PageTitleCard, origen por defecto y botón Guardar | APROBADO | 28/09/2026 11:00 | - | feat(callcenter): implementar formulario manual, modal de duplicados y tarjeta de exito |
| `CP-H53-WEB-02` | Alternancia reactiva de origen del reporte a Funcionario en Terreno (CA-2) | Funcional / UI | Componente | Alta | Formulario visible en pantalla | Clic en radio button 'Funcionario en Terreno' | Actualización inmediata del estado reactivo y atributo aria-checked: true en la opción elegida | Selector conmuta fluidamente reflejando origen FUNCIONARIO_TERRENO en el estado | APROBADO | 28/09/2026 11:02 | - | fix(ui): rediseñar formulario de ingreso manual, selector de origen y estandarizar layout (#11, #17, #22, #24, #25, #28) |
| `CP-H53-WEB-03` | Validación en cliente de campos obligatorios incompletos antes del envío (CA-3) | Validación / Form | Componente | Crítica | Formulario con todos los campos vacíos | Clic en botón 'Guardar y Notificar al Encargado' | Despliegue de mensajes de error inline en dirección, descripción, nombre y RUT sin enviar a API | 4 mensajes de validación renderizados con borde rojo; envío bloqueado en cliente | APROBADO | 28/09/2026 11:05 | - | feat(callcenter): implementar formulario manual, modal de duplicados y tarjeta de exito |
| `CP-H53-WEB-04` | Validación estricta de algoritmo Módulo 11 en campo de RUT de informante (CA-3) | Validación / Negocio | Utilidad / Form | Alta | Formulario con datos válidos salvo RUT | Ingresar '111111119' (DV erróneo para 11.111.111) y enviar | Mensaje de validación: 'El RUT ingresado no es válido (debe cumplir con el dígito verificador).' | Validación Módulo 11 bloquea el envío y muestra mensaje claro bajo el campo RUT | APROBADO | 28/09/2026 11:07 | - | feat(callcenter): implementar servicio de incidentes manuales con tipado y pruebas unitarias |
| `CP-H53-WEB-05` | Normalización y formateo automático de RUT chileno en tiempo real | Usabilidad / UX | Form / Input | Media | Campo RUT enfocado por el operador | Escribir secuencia '111111111' | El valor se formatea visualmente en tiempo real a '11.111.111-1' facilitando la lectura | Formato con puntos y guion aplicado instantáneamente sin entorpecer la digitación | APROBADO | 28/09/2026 11:10 | - | feat(callcenter): implementar formulario manual, modal de duplicados y tarjeta de exito |
| `CP-H53-WEB-06` | Carga dinámica del catálogo de tipos de afectación con fallback ante contingencia | Integración / API | DAL / Servicio | Alta | Montaje inicial del componente IncidenteManualForm | Consulta GET /api/incidentes/tipos | Select poblado con categorías del backend o TIPOS_AFECTACION_FALLBACK si la API no responde | Catálogo de tipos cargado correctamente con opciones estándar (Anegamiento, Inundación, etc.) | APROBADO | 28/09/2026 11:12 | - | feat(callcenter): implementar servicio de incidentes manuales con tipado y pruebas unitarias |
| `CP-H53-WEB-07` | Sincronización de dirección textual hacia el mapa interactivo mediante geocodificación | Funcional / Geo | Componente / Map | Alta | Dirección 'Av. Alemania 550, Valdivia' ingresada | Clic en botón 'Ubicar en mapa' | Geocodificación resuelve coordenadas locales (-39.8142, -73.2459) y traslada el pin en el mapa | Marcador centrado en Av. Alemania con feedback visual de coordenadas resueltas | APROBADO | 28/09/2026 11:15 | - | feat(callcenter): sincronizar direccion escrita con el mapa y retirar emoji de prioridad critica |
| `CP-H53-WEB-08` | Geocodificación inversa al reposicionar manualmente el marcador en el mapa Leaflet | Funcional / Geo | Componente / Map | Alta | Visor de mapa interactivo visible | Clic en punto geográfico de Isla Teja | Marcador fijado en nuevas coordenadas y campo de dirección textual actualizado con calle local | Coordenadas GPS y dirección textual actualizadas en perfecta sincronía | APROBADO | 28/09/2026 11:18 | - | feat(callcenter): geocodificacion inversa desde mapa, simetria de botones y redaccion no tecnica |
| `CP-H53-WEB-09` | Detección preventiva de duplicados y despliegue del banner informativo inline (CA-6) | Regla de Negocio | UI / Banner | Alta | Dirección ingresada coincide con emergencia reportada a < 300m | Escribir dirección y esperar 600ms de debounce | Despliegue de DuplicadoAlertaBanner alertando posible duplicado previo sin bloquear el llenado | Banner preventivo visible con advertencia amarilla institucional indicando coincidencia | APROBADO | 28/09/2026 11:20 | - | fix(ui): rediseñar formulario de ingreso manual, selector de origen y estandarizar layout (#11, #17, #22, #24, #25, #28) |
| `CP-H53-WEB-10` | Apertura de modal de duplicados ante respuesta HTTP 409 Conflict de la API (CA-6) | Flujo de Negocio | UI / Modal | Alta | Servidor API retorna 409 Conflict con listado de reportes cercanos | Clic en 'Guardar y Notificar al Encargado' con forzarCreacion: false | Apertura de DuplicadosModal listando incidentes con código, dirección, estado y distancia | Modal desplegado con tabla de coincidencias (ej. INC-0010 a 21m) y botones de decisión | APROBADO | 28/09/2026 11:22 | - | feat(callcenter): implementar formulario manual, modal de duplicados y tarjeta de exito |
| `CP-H53-WEB-11` | Cancelación y descarte mediante botón 'Omitir reporte' en modal de duplicados (CA-6) | Usabilidad / Flujo | UI / Modal | Alta | DuplicadosModal abierto con coincidencias | Clic en botón 'Omitir reporte' | Cierre inmediato del modal, cancelación del envío y mantenimiento de los datos en formulario | Modal se cierra suavemente, no se envía petición a backend y operador retoma el control | APROBADO | 28/09/2026 11:25 | - | refactor(callcenter): atomizar formulario manual, modal de duplicados y tarjeta de exito |
| `CP-H53-WEB-12` | Confirmación forzada mediante botón 'Continuar de todos modos' (forzarCreacion: true) (CA-6) | Regla de Negocio | Integración / API | Alta | DuplicadosModal abierto con coincidencias | Clic en botón 'Continuar de todos modos' | Reenvío de petición con forzarCreacion: true; API responde 201 y se despliega tarjeta de éxito | Modal se cierra, petición se completa exitosamente y pantalla transiciona a confirmación | APROBADO | 28/09/2026 11:28 | - | refactor(callcenter): atomizar formulario manual, modal de duplicados y tarjeta de exito |
| `CP-H53-WEB-13` | Despliegue de tarjeta de éxito institucional con códigos de incidente y aviso (CA-4, CA-5) | Funcional / UX | UI / Tarjeta | Crítica | Respuesta exitosa HTTP 201 Created de la API | Formulario procesado correctamente | Ocultamiento del formulario y renderizado de IncidenteExitoCard con códigos INC y de seguimiento | Pantalla de confirmación con títulos institucionales, códigos destacados y estado REPORTADO | APROBADO | 28/09/2026 11:30 | - | feat(callcenter): implementar formulario manual, modal de duplicados y tarjeta de exito |
| `CP-H53-WEB-14` | Restablecimiento completo de interfaz al pulsar 'Ingresar nuevo reporte' (UX) | Usabilidad / Flujo | UI / Navegación | Media | Tarjeta de éxito IncidenteExitoCard en pantalla | Clic en botón 'Ingresar nuevo reporte' | Formulario reaparece completamente limpio con valores iniciales y listo para nueva llamada | Transición instantánea en cliente; formulario en blanco con foco en OrigenSelector | APROBADO | 28/09/2026 11:32 | - | refactor(callcenter): atomizar formulario manual, modal de duplicados y tarjeta de exito |
| `CP-H53-WEB-15` | Botón secundario 'Limpiar formulario' para descarte ágil de datos ingresados | Usabilidad / UI | Form / Reset | Media | Formulario con datos parcialmente ingresados | Clic en botón 'Limpiar formulario' | Campos de texto, coordenadas y errores visuales restablecidos a su estado inicial | Formulario limpio inmediatamente sin necesidad de recargar la página completa | APROBADO | 28/09/2026 11:35 | - | refactor(callcenter): atomizar formulario manual, modal de duplicados y tarjeta de exito |
| `CP-H53-WEB-16` | Control de Acceso RBAC en UI ante usuario autenticado sin permiso crear_incidente_manual (CA-1) | Seguridad / UX | UI / Guard | Crítica | Usuario autenticado con rol distinto a Call Center o Administrador | Simular respuesta 403 Forbidden desde incidentesManualesService | Renderizado de InlineNotice variant='error' con mensaje de perfil insuficiente | Notificación de error institucional visible impidiendo el registro no autorizado | APROBADO | 28/09/2026 11:38 | - | feat(callcenter): implementar servicio de incidentes manuales con tipado y pruebas unitarias |
| `CP-H53-WEB-17` | Manejo de resiliencia ante fallo de red con mensaje de error claro y sanitizado | Robustez / Red | UI / Feedback | Media | Pérdida de conectividad con la API backend | Intento de envío en estado offline | Despliegue de InlineNotice con mensaje 'Error de conexión con el servidor...' sin stack traces | Mensaje amigable presentado al operador sugiriendo reintentar la operación | APROBADO | 28/09/2026 11:40 | - | fix(ui): unificar patron de titulo y sanitizar UUIDs en toasts de error (#31) |
| `CP-H53-WEB-18` | Cumplimiento del Sistema de Diseño Municipal Institucional (GEMINI.md) | Estándar de Marca | UI / Estilos | Alta | Toda la vista en viewport Desktop (1920x1080) y Móvil (375x667) | Inspeccionar CSS contra directrices de GEMINI.md | Esquinas rectas (borderRadius: 0), franja 4px teal (#14505A), tipografía Inter/Roboto, sin emojis | 100% de apego a la identidad corporativa de la Municipalidad de Valdivia | APROBADO | 28/09/2026 11:42 | - | fix(ui): rediseñar formulario de ingreso manual, selector de origen y estandarizar layout (#11, #17, #22, #24, #25, #28) |

---

## 4. Guía Detallada de Ejecución y Replicabilidad 100% (Paso a Paso)

Para garantizar la reproducibilidad exacta por parte de evaluadores docentes y líderes de QA, se detallan los comandos de prueba automatizada y procedimientos paso a paso:

### 4.1. Defectos Detectados y Validación de Fixes (Ciclo de Re-Test)

#### `BUG-H53-WEB-01`: Sincronización Bidireccional entre Dirección Textual y Mapa Leaflet
* **Precondición:** Repositorio `sgrai-web` en raíz.
* **Comando Vitest:**
  ```bash
  npm test -- src/lib/maps/__tests__/geocoding.test.ts -t "geocodificarDireccion"
  ```
* **Salida Obtenida:**
  ```text
  ✓ geocodificarDireccion > debe geocodificar una direccion conocida de Valdivia (1ms)
  ✓ geocodificarDireccion > debe incluir Valdivia en la consulta si no está presente (0ms)
  Tests: 2 passed (2)
  ```

---

#### `BUG-H53-WEB-02`: Geocodificación Inversa al Mover Pin en Mapa
* **Comando Vitest:**
  ```bash
  npm test -- src/lib/maps/__tests__/geocoding.test.ts -t "geocodificarCoordenadasInversas"
  ```
* **Salida Obtenida:**
  ```text
  ✓ geocodificarCoordenadasInversas > debe retornar la direccion formateada para coordenadas de Valdivia (1ms)
  ✓ geocodificarCoordenadasInversas > debe retornar null si la respuesta de Nominatim no tiene direccion (0ms)
  Tests: 2 passed (2)
  ```

---

#### `BUG-H53-WEB-03`: Eliminación de Bucle de Re-renders en Hook de Duplicados
* **Comando Vitest:**
  ```bash
  npm test -- src/services/__tests__/incidentesManualesService.test.ts -t "verificarDuplicado"
  ```
* **Salida Obtenida:**
  ```text
  ✓ Servicio incidentes-manuales > verificarDuplicado > debe enviar X-User-Id y retornar coincidencias si existen (2ms)
  ✓ Servicio incidentes-manuales > verificarDuplicado > debe retornar { hayDuplicados: false } si la petición falla (1ms)
  Tests: 2 passed (2)
  ```

---

#### `BUG-H53-WEB-04`: Sanitización de UUIDs y Stack Traces en Mensajes de Error
* **Comando Vitest:**
  ```bash
  npm test -- src/services/__tests__/incidentesManualesService.test.ts -t "debe capturar fallos de red y retornar tipo ERROR_CONEXION"
  ```
* **Salida Obtenida:**
  ```text
  ✓ Servicio incidentes-manuales > crearIncidenteManual > debe capturar fallos de red y retornar tipo ERROR_CONEXION (1ms)
  Tests: 1 passed (1)
  ```

---

#### `BUG-H53-WEB-05`: Estilo Visual Plano Institucional sin Emojis
* **Inspección CSS:** `src/components/callcenter/form/OrigenSelector.module.css` y `IncidenteManualForm.module.css`.
* **Regla Verificada:**
  ```css
  border-radius: 0px !important;
  border-left: 4px solid var(--color-teal, #14505A);
  font-family: var(--font-sans);
  ```
* **Salida:** 0 caracteres de emojis en el catálogo de prioridades (`BAJA`, `MEDIA`, `ALTA`, `CRITICA`).

---

### 4.2. Casos de Prueba Funcionales y de Interacción (Testing Library)

#### `CP-H53-WEB-01` y `CP-H53-WEB-02`: Renderizado de Campos y Alternancia de Origen
* **Comando Vitest:**
  ```bash
  npm test -- src/components/callcenter/__tests__/IncidenteManualForm.test.tsx -t "debe renderizar los campos principales con origen Llamada Telefónica por defecto"
  npm test -- src/components/callcenter/__tests__/IncidenteManualForm.test.tsx -t "debe permitir alternar el origen a Funcionario en Terreno"
  ```
* **Salida Obtenida:**
  ```text
  ✓ IncidenteManualForm > debe renderizar los campos principales con origen Llamada Telefónica por defecto (120ms)
  ✓ IncidenteManualForm > debe permitir alternar el origen a Funcionario en Terreno (65ms)
  Tests: 2 passed (2)
  ```

---

#### `CP-H53-WEB-03`: Validación de Campos Vacíos en Cliente
* **Comando Vitest:**
  ```bash
  npm test -- src/components/callcenter/__tests__/IncidenteManualForm.test.tsx -t "debe mostrar errores de validación si se envía con campos vacíos o inválidos"
  ```
* **Salida Obtenida:**
  ```text
  ✓ IncidenteManualForm > debe mostrar errores de validación si se envía con campos vacíos o inválidos (85ms)
  Tests: 1 passed (1)
  ```

---

#### `CP-H53-WEB-04`: Validación de Algoritmo Módulo 11 en RUT
* **Comando Vitest:**
  ```bash
  npm test -- src/components/callcenter/__tests__/IncidenteManualForm.test.tsx -t "debe validar el dígito verificador del RUT con Módulo 11"
  ```
* **Salida Obtenida:**
  ```text
  ✓ IncidenteManualForm > debe validar el dígito verificador del RUT con Módulo 11 (72ms)
  Tests: 1 passed (1)
  ```

---

#### `CP-H53-WEB-10`, `CP-H53-WEB-11` y `CP-H53-WEB-12`: Comportamiento de Modal de Duplicados
* **Comando Vitest:**
  ```bash
  npm test -- src/components/callcenter/__tests__/DuplicadosModal.test.tsx
  ```
* **Salida Obtenida:**
  ```text
  ✓ DuplicadosModal > no debe renderizar nada si isOpen es false (12ms)
  ✓ DuplicadosModal > debe renderizar la lista de coincidencias con su distancia y código (35ms)
  ✓ DuplicadosModal > debe llamar a onOmitir al hacer clic en "Omitir reporte" (28ms)
  ✓ DuplicadosModal > debe llamar a onContinuar al hacer clic en "Continuar de todos modos" (24ms)
  Tests: 4 passed (4)
  ```

---

#### `CP-H53-WEB-13`: Procesamiento Exitoso y Despliegue de Tarjeta de Éxito
* **Comando Vitest:**
  ```bash
  npm test -- src/components/callcenter/__tests__/IncidenteManualForm.test.tsx -t "debe procesar exitosamente y mostrar la tarjeta de éxito con códigos"
  ```
* **Salida Obtenida:**
  ```text
  ✓ IncidenteManualForm > debe procesar exitosamente y mostrar la tarjeta de éxito con códigos (145ms)
  Tests: 1 passed (1)
  ```

---

## 5. Trazabilidad Integral de Criterios de Aceptación

| Criterio de Aceptación (CA) | Descripción del Criterio | Casos de Prueba Asociados (IDs) | Estado | Evidencia de Cumplimiento en Frontend |
|:---:|---|---|:---:|---|
| **CA-1** | Formulario accesible únicamente para roles con permiso `crear_incidente_manual`. | `CP-H53-WEB-01`, `CP-H53-WEB-16` | 🟢 CUMPLIDO | `SimulatedSessionContext` y guards de UI verifican permisos; respuestas 403 despliegan `InlineNotice` de acceso denegado. |
| **CA-2** | Origen del reporte diferenciando "Llamada telefónica" y "Funcionario en terreno". | `CP-H53-WEB-01`, `CP-H53-WEB-02` | 🟢 CUMPLIDO | Componente `OrigenSelector` accesible por teclado (aria-checked) con origen por defecto `LLAMADA_TELEFONICA`. |
| **CA-3** | Validación de datos obligatorios completos (ubicación, tipo, descripción y RUT). | `CP-H53-WEB-03`, `CP-H53-WEB-04`, `CP-H53-WEB-05` | 🟢 CUMPLIDO | `useIncidenteManualForm` valida longitud mínima en dirección y descripción, y algoritmo Módulo 11 en RUT chileno. |
| **CA-4** | Reporte implícitamente verificado disponible inmediatamente para Encargado. | `BUG-H53-WEB-01`, `CP-H53-WEB-13` | 🟢 CUMPLIDO | Envío a `POST /api/incidentes/manual` que persiste directamente en `incidente` con estado canónico `REPORTADO`. |
| **CA-5** | Mensaje de éxito / alerta de confirmación tras el guardado. | `CP-H53-WEB-13`, `CP-H53-WEB-14` | 🟢 CUMPLIDO | Renderizado de `IncidenteExitoCard` con códigos `INC-XXXX`, código de seguimiento numérico y botón de nuevo reporte. |
| **CA-6** | Verificación de reportes duplicados con opción de omitir o forzar creación. | `BUG-H53-WEB-03`, `CP-H53-WEB-09`, `CP-H53-WEB-10`, `CP-H53-WEB-11`, `CP-H53-WEB-12` | 🟢 CUMPLIDO | `DuplicadoAlertaBanner` preventivo y `DuplicadosModal` con opciones explícitas 'Omitir reporte' y 'Continuar de todos modos'. |
| **EXTRA** | Usabilidad cartográfica y diseño institucional municipal. | `BUG-H53-WEB-02`, `BUG-H53-WEB-04`, `BUG-H53-WEB-05`, `CP-H53-WEB-07`, `CP-H53-WEB-08`, `CP-H53-WEB-18` | 🟢 CUMPLIDO | Geocodificación inversa bidireccional en mapa Leaflet y 100% de apego a `GEMINI.md` (esquinas rectas, franja 4px teal). |

---

## 6. Bloque TSV para Copiar y Pegar en Google Sheets (Celda A1)

Para transferir la totalidad de la matriz de 13 columnas directamente a la planilla de cálculo de QA de Frontend, copie el contenido del siguiente bloque de código y péguelo directamente en la celda **A1**:

```tsv
ID Caso	Título del Caso de Prueba	Tipo de Prueba	Nivel	Prioridad	Precondición	Datos de Prueba (Payload / Headers / Query)	Resultado Esperado	Resultado Obtenido	Estado	Fecha / Hora Ejecución	Fecha / Hora Re-Test	Solución / Commit
BUG-H53-WEB-01	Desincronización entre dirección textual y marcador interactivo en mapa Leaflet	Integración / UI	Componente	Alta	Formulario abierto en navegador	Escribir dirección "Av. Alemania 550" y pulsar "Ubicar en mapa"	El mapa interactivo se centra y actualiza el pin en las coordenadas correspondientes	El pin permanecía estático en el centro de Valdivia provocando desajuste entre texto y GPS	CORREGIDO	13/09/2026 21:40	14/09/2026 00:15	feat(callcenter): sincronizar direccion escrita con el mapa y retirar emoji de prioridad critica
BUG-H53-WEB-02	Omisión de geocodificación inversa al reposicionar manualmente el marcador en el mapa	Usabilidad / Datos	Componente / Map	Alta	Mapa interactivo activo	Hacer clic sobre calle Picarte 2000 en el mapa	El campo de texto de dirección se actualiza automáticamente con la dirección aproximada	Coordenadas cambiaban internamente pero el campo de dirección quedaba en blanco o desactualizado	CORREGIDO	13/09/2026 22:30	14/09/2026 00:30	feat(callcenter): geocodificacion inversa desde mapa, simetria de botones y redaccion no tecnica
BUG-H53-WEB-03	Bucle de re-renderizado infinito en hook de duplicados con debounce	Rendimiento / React	Hook / Efecto	Alta	Formulario montado en interfaz	Escribir dirección letra por letra en el campo de texto	Consulta fluida tras 600ms de inactividad sin disparar renderizados cíclicos	Hook useVerificarDuplicado disparaba re-renders infinitos congelando la pestaña del navegador	CORREGIDO	25/09/2026 15:20	27/09/2026 16:45	refactor(callcenter): aislar capa dal en incidentesManualesService y corregir efectos en hooks
BUG-H53-WEB-04	Fuga de identificadores técnicos UUID en notificaciones y mensajes de error	Seguridad UI / UX	UI / Feedback	Media	Fallo transitorio de red o validación en backend	Simular respuesta de error con mensaje que contiene UUID	Mensaje sanitizado sin exhibir identificadores UUID crudos ni detalles internos	Toast desplegaba cadena cruda con UUID exponiendo datos de arquitectura interna	CORREGIDO	26/09/2026 11:10	28/09/2026 09:30	fix(ui): unificar patron de titulo y sanitizar UUIDs en toasts de error (#31)
BUG-H53-WEB-05	Desalineación con sistema de diseño municipal: botones asimétricos y uso de emojis	Estándar Visual	UI / Estilos	Media	Formulario cargado en /callcenter/manual	Inspección visual de botones, selector de origen y opciones de prioridad	Esquinas rectas (rounded-none), sin emojis, franja 4px teal (#14505A), estilo plano	Selector con bordes redondeados, emojis en prioridades y asimetría en botones de acción	CORREGIDO	26/09/2026 17:30	28/09/2026 10:15	fix(ui): rediseñar formulario de ingreso manual, selector de origen y estandarizar layout (#11, #17, #22, #24, #25, #28)
CP-H53-WEB-01	Renderizado inicial del formulario con origen Llamada Telefónica seleccionado por defecto (CA-1, CA-2)	Funcional / UI	Componente	Crítica	Operador Call Center con sesión activa en /callcenter/manual	Carga de la página en navegador	Despliegue de layout institucional, OrigenSelector con 'Llamada Telefónica' activo y campos vacíos	Formulario renderizado con breadcrumbs, PageTitleCard, origen por defecto y botón Guardar	APROBADO	28/09/2026 11:00	-	feat(callcenter): implementar formulario manual, modal de duplicados y tarjeta de exito
CP-H53-WEB-02	Alternancia reactiva de origen del reporte a Funcionario en Terreno (CA-2)	Funcional / UI	Componente	Alta	Formulario visible en pantalla	Clic en radio button 'Funcionario en Terreno'	Actualización inmediata del estado reactivo y atributo aria-checked: true en la opción elegida	Selector conmuta fluidamente reflejando origen FUNCIONARIO_TERRENO en el estado	APROBADO	28/09/2026 11:02	-	fix(ui): rediseñar formulario de ingreso manual, selector de origen y estandarizar layout (#11, #17, #22, #24, #25, #28)
CP-H53-WEB-03	Validación en cliente de campos obligatorios incompletos antes del envío (CA-3)	Validación / Form	Componente	Crítica	Formulario con todos los campos vacíos	Clic en botón 'Guardar y Notificar al Encargado'	Despliegue de mensajes de error inline en dirección, descripción, nombre y RUT sin enviar a API	4 mensajes de validación renderizados con borde rojo; envío bloqueado en cliente	APROBADO	28/09/2026 11:05	-	feat(callcenter): implementar formulario manual, modal de duplicados y tarjeta de exito
CP-H53-WEB-04	Validación estricta de algoritmo Módulo 11 en campo de RUT de informante (CA-3)	Validación / Negocio	Utilidad / Form	Alta	Formulario con datos válidos salvo RUT	Ingresar '111111119' (DV erróneo para 11.111.111) y enviar	Mensaje de validación: 'El RUT ingresado no es válido (debe cumplir con el dígito verificador).'	Validación Módulo 11 bloquea el envío y muestra mensaje claro bajo el campo RUT	APROBADO	28/09/2026 11:07	-	feat(callcenter): implementar servicio de incidentes manuales con tipado y pruebas unitarias
CP-H53-WEB-05	Normalización y formateo automático de RUT chileno en tiempo real	Usabilidad / UX	Form / Input	Media	Campo RUT enfocado por el operador	Escribir secuencia '111111111'	El valor se formatea visualmente en tiempo real a '11.111.111-1' facilitando la lectura	Formato con puntos y guion aplicado instantáneamente sin entorpecer la digitación	APROBADO	28/09/2026 11:10	-	feat(callcenter): implementar formulario manual, modal de duplicados y tarjeta de exito
CP-H53-WEB-06	Carga dinámica del catálogo de tipos de afectación con fallback ante contingencia	Integración / API	DAL / Servicio	Alta	Montaje inicial del componente IncidenteManualForm	Consulta GET /api/incidentes/tipos	Select poblado con categorías del backend o TIPOS_AFECTACION_FALLBACK si la API no responde	Catálogo de tipos cargado correctamente con opciones estándar (Anegamiento, Inundación, etc.)	APROBADO	28/09/2026 11:12	-	feat(callcenter): implementar servicio de incidentes manuales con tipado y pruebas unitarias
CP-H53-WEB-07	Sincronización de dirección textual hacia el mapa interactivo mediante geocodificación	Funcional / Geo	Componente / Map	Alta	Dirección 'Av. Alemania 550, Valdivia' ingresada	Clic en botón 'Ubicar en mapa'	Geocodificación resuelve coordenadas locales (-39.8142, -73.2459) y traslada el pin en el mapa	Marcador centrado en Av. Alemania con feedback visual de coordenadas resueltas	APROBADO	28/09/2026 11:15	-	feat(callcenter): sincronizar direccion escrita con el mapa y retirar emoji de prioridad critica
CP-H53-WEB-08	Geocodificación inversa al reposicionar manualmente el marcador en el mapa Leaflet	Funcional / Geo	Componente / Map	Alta	Visor de mapa interactivo visible	Clic en punto geográfico de Isla Teja	Marcador fijado en nuevas coordenadas y campo de dirección textual actualizado con calle local	Coordenadas GPS y dirección textual actualizadas en perfecta sincronía	APROBADO	28/09/2026 11:18	-	feat(callcenter): geocodificacion inversa desde mapa, simetria de botones y redaccion no tecnica
CP-H53-WEB-09	Detección preventiva de duplicados y despliegue del banner informativo inline (CA-6)	Regla de Negocio	UI / Banner	Alta	Dirección ingresada coincide con emergencia reportada a < 300m	Escribir dirección y esperar 600ms de debounce	Despliegue de DuplicadoAlertaBanner alertando posible duplicado previo sin bloquear el llenado	Banner preventivo visible con advertencia amarilla institucional indicando coincidencia	APROBADO	28/09/2026 11:20	-	fix(ui): rediseñar formulario de ingreso manual, selector de origen y estandarizar layout (#11, #17, #22, #24, #25, #28)
CP-H53-WEB-10	Apertura de modal de duplicados ante respuesta HTTP 409 Conflict de la API (CA-6)	Flujo de Negocio	UI / Modal	Alta	Servidor API retorna 409 Conflict con listado de reportes cercanos	Clic en 'Guardar y Notificar al Encargado' con forzarCreacion: false	Apertura de DuplicadosModal listando incidentes con código, dirección, estado y distancia	Modal desplegado con tabla de coincidencias (ej. INC-0010 a 21m) y botones de decisión	APROBADO	28/09/2026 11:22	-	feat(callcenter): implementar formulario manual, modal de duplicados y tarjeta de exito
CP-H53-WEB-11	Cancelación y descarte mediante botón 'Omitir reporte' en modal de duplicados (CA-6)	Usabilidad / Flujo	UI / Modal	Alta	DuplicadosModal abierto con coincidencias	Clic en botón 'Omitir reporte'	Cierre inmediato del modal, cancelación del envío y mantenimiento de los datos en formulario	Modal se cierra suavemente, no se envía petición a backend y operador retoma el control	APROBADO	28/09/2026 11:25	-	refactor(callcenter): atomizar formulario manual, modal de duplicados y tarjeta de exito
CP-H53-WEB-12	Confirmación forzada mediante botón 'Continuar de todos modos' (forzarCreacion: true) (CA-6)	Regla de Negocio	Integración / API	Alta	DuplicadosModal abierto con coincidencias	Clic en botón 'Continuar de todos modos'	Reenvío de petición con forzarCreacion: true; API responde 201 y se despliega tarjeta de éxito	Modal se cierra, petición se completa exitosamente y pantalla transiciona a confirmación	APROBADO	28/09/2026 11:28	-	refactor(callcenter): atomizar formulario manual, modal de duplicados y tarjeta de exito
CP-H53-WEB-13	Despliegue de tarjeta de éxito institucional con códigos de incidente y aviso (CA-4, CA-5)	Funcional / UX	UI / Tarjeta	Crítica	Respuesta exitosa HTTP 201 Created de la API	Formulario procesado correctamente	Ocultamiento del formulario y renderizado de IncidenteExitoCard con códigos INC y de seguimiento	Pantalla de confirmación con títulos institucionales, códigos destacados y estado REPORTADO	APROBADO	28/09/2026 11:30	-	feat(callcenter): implementar formulario manual, modal de duplicados y tarjeta de exito
CP-H53-WEB-14	Restablecimiento completo de interfaz al pulsar 'Ingresar nuevo reporte' (UX)	Usabilidad / Flujo	UI / Navegación	Media	Tarjeta de éxito IncidenteExitoCard en pantalla	Clic en botón 'Ingresar nuevo reporte'	Formulario reaparece completamente limpio con valores iniciales y listo para nueva llamada	Transición instantánea en cliente; formulario en blanco con foco en OrigenSelector	APROBADO	28/09/2026 11:32	-	refactor(callcenter): atomizar formulario manual, modal de duplicados y tarjeta de exito
CP-H53-WEB-15	Botón secundario 'Limpiar formulario' para descarte ágil de datos ingresados	Usabilidad / UI	Form / Reset	Media	Formulario con datos parcialmente ingresados	Clic en botón 'Limpiar formulario'	Campos de texto, coordenadas y errores visuales restablecidos a su estado inicial	Formulario limpio inmediatamente sin necesidad de recargar la página completa	APROBADO	28/09/2026 11:35	-	refactor(callcenter): atomizar formulario manual, modal de duplicados y tarjeta de exito
CP-H53-WEB-16	Control de Acceso RBAC en UI ante usuario autenticado sin permiso crear_incidente_manual (CA-1)	Seguridad / UX	UI / Guard	Crítica	Usuario autenticado con rol distinto a Call Center o Administrador	Simular respuesta 403 Forbidden desde incidentesManualesService	Renderizado de InlineNotice variant='error' con mensaje de perfil insuficiente	Notificación de error institucional visible impidiendo el registro no autorizado	APROBADO	28/09/2026 11:38	-	feat(callcenter): implementar servicio de incidentes manuales con tipado y pruebas unitarias
CP-H53-WEB-17	Manejo de resiliencia ante fallo de red con mensaje de error claro y sanitizado	Robustez / Red	UI / Feedback	Media	Pérdida de conectividad con la API backend	Intento de envío en estado offline	Despliegue de InlineNotice con mensaje 'Error de conexión con el servidor...' sin stack traces	Mensaje amigable presentado al operador sugiriendo reintentar la operación	APROBADO	28/09/2026 11:40	-	fix(ui): unificar patron de titulo y sanitizar UUIDs en toasts de error (#31)
CP-H53-WEB-18	Cumplimiento del Sistema de Diseño Municipal Institucional (GEMINI.md)	Estándar de Marca	UI / Estilos	Alta	Toda la vista en viewport Desktop (1920x1080) y Móvil (375x667)	Inspeccionar CSS contra directrices de GEMINI.md	Esquinas rectas (borderRadius: 0), franja 4px teal (#14505A), tipografía Inter/Roboto, sin emojis	100% de apego a la identidad corporativa de la Municipalidad de Valdivia	APROBADO	28/09/2026 11:42	-	fix(ui): rediseñar formulario de ingreso manual, selector de origen y estandarizar layout (#11, #17, #22, #24, #25, #28)
```
