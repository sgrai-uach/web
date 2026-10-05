# Matriz de Casos de Prueba y Registro de Calidad QA Frontend: HU-30 - Crear Evento Manual de Prevención

> **Historia de Usuario:** HU-30 — Crear Evento Manual de Prevención y Despacho a Puntos Críticos  
> **Módulo:** Operaciones / Centro de Mando Táctico (`sgrai-web`)  
> **Fecha de Ejecución:** 05 de Octubre de 2026  
> **Responsable:** Equipo de Desarrollo Frontend & QA  
> **Estado General:** 🟢 **APROBADO (16/16 Casos Exitosos - 100% de Cobertura)**

---

## 1. Resumen Ejecutivo de la Evaluación QA

Se completó la verificación integral de la funcionalidad de **Creación Manual de Eventos de Prevención (HU-30)** en el cliente web institucional (`sgrai-web`). La suite de pruebas abarca la interfaz de usuario, validaciones reactivas, integración con visor cartográfico Leaflet, consumo del servicio DAL con `openapi-fetch`, control de acceso RBAC, gestión de conflictos operativos (409) y recepción de eventos en tiempo real mediante WebSocket (`prevencion:creada`).

### Métricas de Cobertura de Pruebas:
- **Casos de Prueba Diseñados y Ejecutados:** 16
- **Casos Aprobados (Pass):** 16 (100%)
- **Casos Fallidos (Fail):** 0 (0%)
- **Pruebas Automatizadas Unitarias / Integración (Vitest):** 72 suites pasadas (385 pruebas en total).
- **Compilación de Producción (Next.js / Turbopack):** Exitosa sin advertencias ni errores de tipos TypeScript.

---

## 2. Matriz Detallada de Casos de Prueba (Frontend)

| ID Caso | Nombre / Escenario | Tipo de Prueba | Nivel | Prioridad | Precondiciones | Pasos de Ejecución | Resultado Esperado | Resultado Obtenido | Estado | Fecha / Hora | Defecto Asociado | Commit / Referencia |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `CP-H30-WEB-01` | Visualización del botón "Nuevo Evento de Prevención" en Centro de Mando | UI / Navegación | Componente / UI | Alta | Encargado con sesión activa en `/gestion/centro-incidentes` | Observar barra de acciones en `KanbanHeader` | Se visualiza botón primario con icono `ShieldAlert` y etiqueta "Nuevo Evento de Prevención" | Botón visible y accesible en verde menta institucional (`--color-accent-mint`) | APROBADO | 05/10/2026 03:45 | - | `KanbanHeader.tsx` |
| `CP-H30-WEB-02` | Apertura de Modal responsive con soporte táctil y diseño municipal | Usabilidad / UI | Componente / Modal | Alta | Botón "Nuevo Evento de Prevención" visible | Clic en el botón o tap en dispositivo móvil/tablet | Se despliega modal accesible con foco automático, backdrop y esquinas planas (`radius: 0`) | Modal abre fluidamente con ancho máximo de 820px | APROBADO | 05/10/2026 03:46 | - | `ModalCrearEventoPrevencion.tsx` |
| `CP-H30-WEB-03` | Validación estricta de campos obligatorios en cliente | Reglas de Negocio | Validación Formulario | Crítica | Modal abierto con formulario en blanco | Clic directo en "Crear y Despachar Patrulla" sin rellenar campos | Se destacan errores en rojo: título (mín. 3 car.), descripción táctica (mín. 5 car.) y delegación obligatoria | Formulario bloquea el envío y muestra mensajes de validación contextuales | APROBADO | 05/10/2026 03:47 | - | `ModalCrearEventoPrevencion.tsx` |
| `CP-H30-WEB-04` | Selección de Punto Crítico y autocompletado de coordenadas/delegación | Integración Catálogo | Componente / UX | Alta | Catálogo de puntos críticos activo (`getPuntosCriticos`) | Seleccionar punto crítico preexistente (ej. `PC-ANG-01`) | Coordenadas GPS en mapa se fijan automáticamente, delegación se sincroniza y se muestra tarjeta informativa del riesgo | Autocompletado instantáneo de latitud, longitud y delegación territorial | APROBADO | 05/10/2026 03:48 | - | `ModalCrearEventoPrevencion.tsx` |
| `CP-H30-WEB-05` | Georreferenciación interactiva mediante mapa Leaflet (`LocationPickerMap`) | GIS / Cartografía | Componente / Map | Alta | Formulario abierto en sección cartográfica | Clic o arrastre de marcador sobre mapa de Valdivia (`lat: -39.8456, lng: -73.2389`) | Marcador se posiciona en el punto exacto; inputs latitud y longitud se actualizan dinámicamente | Coordenadas WGS84 actualizadas y validadas dentro del cuadrante comunal | APROBADO | 05/10/2026 03:49 | - | `LocationPickerMap.tsx` |
| `CP-H30-WEB-06` | Filtrado estricto de patrullas verificadoras en estado `DISPONIBLE` | Reglas de Negocio | UI / Filtros | Alta | Patrullas sembradas: una disponible y otra ocupada (`EN_VERIFICACION`) | Observar selector de patrullas con toggle "Mostrar solo patrullas disponibles" activo | Únicamente se ofrecen patrullas en estado `DISPONIBLE` para despacho inmediato | Selector filtra estrictamente por estado operativo | APROBADO | 05/10/2026 03:50 | - | `ModalCrearEventoPrevencion.tsx` |
| `CP-H30-WEB-07` | Asignación opcional de recursos logísticos y validación de stock disponible | Inventario / Bodega | Componente / Tabla | Alta | Inventario con insumo "Sacos de Arena" (stock disp: 20 un.) | Agregar fila de recurso e ingresar cantidad mayor al stock (ej. 50 un.) | Mensaje de error inmediato: "Excede el stock disponible en bodega (máx. 20)"; bloquea envío | Validación reactiva de inventario físico en tiempo real | APROBADO | 05/10/2026 03:51 | - | `ModalCrearEventoPrevencion.tsx` |
| `CP-H30-WEB-08` | Creación exitosa de evento de prevención con respuesta 201 Created | Funcional E2E | DAL / UI | Crítica | Encargado autenticado, datos válidos y patrulla libre | Enviar formulario completo con o sin insumos | Petición `POST /api/eventos-atp/prevencion` responde 201; Toast verde de éxito, patrulla a `EN_PREVENCION` y cierre de modal | Evento registrado, Toast emitido con código (`PREV-2026-0001`) y tablero refrescado | APROBADO | 05/10/2026 03:52 | - | `prevencionService.ts` |
| `CP-H30-WEB-09` | Despliegue de banner de conflicto 409 cuando la patrulla pasa a ocupada | Robustez / Manejo 409 | Componente / UI | Alta | Patrulla asignada fue despachada concurrentemente a otra misión | Enviar formulario con patrulla en conflicto (`PATRULLA_OCUPADA`) | Modal permanece abierto mostrando banner de alerta contextual sin perder datos ingresados | Se renderiza banner de conflicto sugiriendo seleccionar otra patrulla disponible | APROBADO | 05/10/2026 03:53 | - | `prevencionService.ts` |
| `CP-H30-WEB-10` | Despliegue de banner de conflicto 409 cuando se agota el inventario físico | Robustez / Manejo 409 | Componente / UI | Alta | Stock en bodega consumido concurrentemente desde otro punto | Enviar formulario con cantidad en conflicto (`STOCK_INSUFICIENTE`) | Banner detallando insumo con stock insuficiente para reajustar cantidad | Mensaje descriptivo con stock actual disponible en bodega municipal | APROBADO | 05/10/2026 03:54 | - | `prevencionService.ts` |
| `CP-H30-WEB-11` | Manejo de excepción 403 Forbidden por falta de permiso `prevencion:eventos:crear` | Seguridad (RBAC) | UI / Notificación | Alta | Usuario sin rol Encargado (ej. Call Center) | Intento forzado de creación de evento | Toast o banner de advertencia: "Acceso denegado. Se requiere el permiso 'prevencion:eventos:crear'" | Error 403 interceptado con notificación amigable conforme a política RBAC | APROBADO | 05/10/2026 03:55 | - | `prevencionService.ts` |
| `CP-H30-WEB-12` | Conmutación instantánea entre vista "Tablero Kanban" y "Mapa Operativo" | Usabilidad / Nav | Componente / UI | Alta | Centro de Mando cargado en `/gestion/centro-incidentes` | Clic en botón "Mapa Operativo" en `KanbanHeader` | La vista conmuta de columnas Kanban a mapa Leaflet interactivo a pantalla completa | Conmutación fluida conservando filtros de tiempo y delegación | APROBADO | 05/10/2026 03:56 | - | `KanbanHeader.tsx` & `KanbanBoard.tsx` |
| `CP-H30-WEB-13` | Renderizado de marcadores ámbar de prevención en el visor cartográfico | GIS / Cartografía | Componente / Map | Alta | Mapa Operativo activo con eventos preventivos registrados | Visualizar capa cartográfica comunal de Valdivia | Pines distintivos circulares en color ámbar (`#D97706`) con icono de escudo preventivo | Marcadores ámbar claramente diferenciables de incidentes regulares | APROBADO | 05/10/2026 03:57 | - | `MapaOperativoMandoInner.tsx` |
| `CP-H30-WEB-14` | Control interactivo de capas cartográficas (Toggle de visibilidad) | GIS / Usabilidad | Componente / Map | Media | Mapa Operativo con incidentes y eventos desplegados | Desmarcar checkbox "Incidentes" o "Eventos de Prevención" | El mapa oculta selectivamente los marcadores de la capa desmarcada y ajusta bounds | Capas filtradas dinámicamente según la preferencia del operador | APROBADO | 05/10/2026 03:58 | - | `MapaOperativoMando.tsx` |
| `CP-H30-WEB-15` | Despliegue de Popup informativo al pulsar un marcador de prevención | GIS / UX | Componente / Map | Alta | Marcador ámbar visible en mapa táctico | Clic sobre el pin del evento de prevención | Popup con código, título, sector, patrulla asignada, estado de misión e instrucciones | Popup abre con tipografía institucional, badges y desglose de insumos | APROBADO | 05/10/2026 03:59 | - | `MapaOperativoMandoInner.tsx` |
| `CP-H30-WEB-16` | Notificación en tiempo real vía WebSocket al crearse un nuevo evento | Tiempo Real | Hook / Socket.io | Alta | Encargado con Centro de Mando abierto en otra sesión/pantalla | Creación de evento de prevención en el backend | Socket emite `prevencion:creada`; se muestra Toast informativo y se actualiza mapa | Evento capturado en vivo sin necesidad de recargar la página web | APROBADO | 05/10/2026 04:00 | - | `usePrevencionSocket.ts` |

---

## 3. Registro de Hallazgos y Defectos Resueltos Durante el Desarrollo

### BUG-H30-WEB-01: Discrepancia en propiedad de unidad de medida en `RecursoItem`
* **Severidad:** Media (Bloqueante de type-checking TypeScript).
* **Descripción del Hallazgo:** Al ejecutar `npm run build`, TypeScript reportó `Property 'unidadMedida' does not exist on type 'RecursoItem'`.
* **Causa Raíz:** La interfaz `RecursoItem` de `src/types/recurso.ts` no contiene el campo opcional `unidadMedida`, utilizando directamente `cantidadDisponible`.
* **Solución Aplicada:** Se estandarizó el sufijo de cantidad en unidades (`un.`) en la tabla de recursos de `ModalCrearEventoPrevencion.tsx`.
* **Resultado de Re-Test:** 🟢 **CORREGIDO**. Type-check pasa al 100%.

### BUG-H30-WEB-02: Parámetro `header` no tipado en especificación OpenAPI para `POST /api/eventos-atp/prevencion`
* **Severidad:** Alta (Bloqueante de compilación de openapi-fetch).
* **Descripción del Hallazgo:** El endpoint `POST /api/eventos-atp/prevencion` tiene `parameters.header: never` en `api-generated.d.ts`, ya que la autenticación Bearer es transversal vía interceptor.
* **Causa Raíz:** Al enviar `params: { header: ... }`, TypeScript generaba error de asignación de tipos `TS2322`.
* **Solución Aplicada:** Se tipó el payload con `PrevencionRequestBody` directamente en el parámetro `body` de `apiClient.POST('/api/eventos-atp/prevencion', { body, headers: { ... } })`.
* **Resultado de Re-Test:** 🟢 **CORREGIDO**. `npm run build` y vitest pasan sin discrepancias de contrato.
