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
- **Compilación de Producción (Next.js / Turbopack):** Exitosa sin advertencias ni errores de tipos TypeScript (29/29 rutas estáticas y dinámicas).

---

## 2. Matriz Detallada de Casos de Prueba (Frontend — 13 Columnas Hoja de Cálculo)

*(Esta tabla contiene exactamente las 13 columnas de la planilla oficial de QA para copiar y pegar directamente en Google Sheets o Excel).*

| ID Caso | Título del Caso de Prueba | Tipo de Prueba | Nivel | Prioridad | Precondición | Datos de Prueba (Payload / Headers / Query) | Resultado Esperado | Resultado Obtenido | Estado | Fecha / Hora Ejecución | Fecha / Hora Re-Test | Solución / Commit |
|---|---|---|---|---|---|---|---|---|:---:|:---:|:---:|---|
| `CP-HU30-WEB-01` | Visualización del botón "Nuevo Evento de Prevención" en Centro de Mando | Funcional / UI | Frontend / UI | Alta | Encargado con sesión activa en `/gestion/centro-incidentes` | Navegación a `/gestion/centro-incidentes` | Se visualiza botón primario con icono `ShieldAlert` y etiqueta "Nuevo Evento de Prevención" en la barra de acciones | Botón visible y accesible en verde menta institucional (`--color-accent-mint`) conforme a GEMINI.md | APROBADO | 05/10/2026 10:45 | - | `feat(mando): integrar vista cartografica operativa` (`f058b74`) |
| `CP-HU30-WEB-02` | Apertura de Modal responsive con diseño plano institucional | Usabilidad / UI | Frontend / Modal | Alta | Botón "Nuevo Evento de Prevención" visible | Clic en el botón o tap en dispositivo táctil | Despliegue de modal accesible con foco automático, backdrop y esquinas planas (`radius: 0`) | Modal abre fluidamente con ancho máximo de 820px sin desbordamiento | APROBADO | 05/10/2026 10:46 | - | `feat(mando): implementar modal de creacion de eventos` (`6f0a960`) |
| `CP-HU30-WEB-03` | Validación estricta de campos obligatorios en cliente | Validación / Negocio | Frontend / Form | Crítica | Modal abierto con formulario en blanco | Clic directo en "Crear y Despachar Patrulla" con campos vacíos | Destaca errores en rojo: título (mín. 3 car.), descripción táctica (mín. 5 car.) y delegación obligatoria | Formulario bloquea el envío y muestra mensajes de validación contextuales | APROBADO | 05/10/2026 10:47 | - | `ModalCrearEventoPrevencion.tsx` |
| `CP-HU30-WEB-04` | Selección de Punto Crítico y autocompletado de coordenadas/delegación | Integración / Catálogo | Frontend / UX | Alta | Catálogo de puntos críticos activo en backend | Selección en dropdown: `Sector Humedal Angachilla (PC-ANG-01)` | Coordenadas GPS en mapa se fijan automáticamente, delegación se sincroniza y se muestra tarjeta informativa del riesgo | Autocompletado instantáneo de latitud, longitud y delegación territorial | APROBADO | 05/10/2026 10:48 | - | `ModalCrearEventoPrevencion.tsx` |
| `CP-HU30-WEB-05` | Georreferenciación interactiva mediante mapa Leaflet | GIS / Cartografía | Frontend / Map | Alta | Formulario abierto en sección cartográfica | Clic o arrastre de marcador sobre mapa de Valdivia (`lat: -39.8456, lng: -73.2389`) | Marcador se posiciona en el punto exacto; inputs latitud y longitud se actualizan dinámicamente | Coordenadas WGS84 actualizadas y validadas dentro del cuadrante comunal | APROBADO | 05/10/2026 10:49 | - | `LocationPickerMap.tsx` |
| `CP-HU30-WEB-06` | Filtrado estricto de patrullas verificadoras en estado DISPONIBLE | Reglas de Negocio / UI | Frontend / Filtros | Alta | Patrullas sembradas: `Patrulla P-01` (DISPONIBLE), `Patrulla P-02` (EN_VERIFICACION) | Toggle activo: "Mostrar solo patrullas disponibles" | Únicamente se ofrecen patrullas en estado `DISPONIBLE` para despacho inmediato | Selector filtra estrictamente por estado operativo; no lista patrullas ocupadas | APROBADO | 05/10/2026 10:50 | - | `ModalCrearEventoPrevencion.tsx` |
| `CP-HU30-WEB-07` | Asignación opcional de recursos logísticos y validación de stock disponible | Inventario / Bodega | Frontend / Form | Alta | Inventario con insumo "Sacos de Arena" (stock disp: 20 un.) | Agregar recurso: `recursoId = sacos`, `cantidad = 50` | Mensaje de error inmediato: "Excede el stock disponible en bodega (máx. 20)"; bloquea envío | Validación reactiva de inventario físico en tiempo real impidiendo envíos con sobre-stock | APROBADO | 05/10/2026 10:51 | - | `ModalCrearEventoPrevencion.tsx` |
| `CP-HU30-WEB-08` | Creación exitosa de evento de prevención con respuesta 201 Created | Funcional / E2E | Frontend / DAL | Crítica | Encargado autenticado, datos válidos y patrulla libre | `POST /api/eventos-atp/prevencion` con payload de prevención válido | Petición responde 201; Toast verde de éxito, patrulla a `EN_PREVENCION` y cierre de modal | Evento registrado, Toast emitido con código (`PREV-2026-0001`) y tablero refrescado | APROBADO | 05/10/2026 10:52 | - | `feat(servicios): implementar servicio dal` (`23d2b2c`) |
| `CP-HU30-WEB-09` | Despliegue de banner de conflicto 409 cuando la patrulla pasa a ocupada | Robustez / Manejo 409 | Frontend / UI | Alta | Patrulla asignada fue despachada concurrentemente a otra misión | Respuesta API: `409 Conflict` con error `PATRULLA_OCUPADA` | Modal permanece abierto mostrando banner de alerta contextual sin perder datos ingresados | Se renderiza banner de advertencia sugiriendo seleccionar otra patrulla disponible | APROBADO | 05/10/2026 10:53 | - | `prevencionService.ts` |
| `CP-HU30-WEB-10` | Despliegue de banner de conflicto 409 cuando se agota el inventario físico | Robustez / Manejo 409 | Frontend / UI | Alta | Stock en bodega consumido concurrentemente desde otro punto | Respuesta API: `409 Conflict` con error `STOCK_INSUFICIENTE` | Banner detallando insumo con stock insuficiente para reajustar cantidad | Mensaje descriptivo con stock actual disponible en bodega municipal | APROBADO | 05/10/2026 10:54 | - | `prevencionService.ts` |
| `CP-HU30-WEB-11` | Manejo de excepción 403 Forbidden por falta de permiso prevencion:eventos:crear | Seguridad / RBAC | Frontend / Auth | Alta | Usuario sin rol Encargado (ej. Call Center o Informante) | Intento forzado de creación de evento | Toast o banner de advertencia: "Acceso denegado. Se requiere el permiso 'prevencion:eventos:crear'" | Error 403 interceptado con notificación amigable conforme a política RBAC | APROBADO | 05/10/2026 10:55 | - | `prevencionService.ts` |
| `CP-HU30-WEB-12` | Conmutación instantánea entre vista "Tablero Kanban" y "Mapa Operativo" | Usabilidad / Navegación | Frontend / UI | Alta | Centro de Mando cargado en `/gestion/centro-incidentes` | Clic en botón "Mapa Operativo" en `KanbanHeader` | La vista conmuta de columnas Kanban a mapa Leaflet interactivo a pantalla completa | Conmutación fluida conservando filtros de tiempo y delegación | APROBADO | 05/10/2026 10:56 | - | `KanbanHeader.tsx` & `KanbanBoard.tsx` |
| `CP-HU30-WEB-13` | Renderizado de marcadores ámbar de prevención en el visor cartográfico | GIS / Cartografía | Frontend / Map | Alta | Mapa Operativo activo con eventos preventivos registrados | Visualizar capa cartográfica comunal de Valdivia | Pines distintivos circulares en color ámbar (`#D97706`) con icono de escudo preventivo | Marcadores ámbar claramente diferenciables de incidentes regulares | APROBADO | 05/10/2026 10:57 | - | `MapaOperativoMandoInner.tsx` |
| `CP-HU30-WEB-14` | Control interactivo de capas cartográficas (Toggle de visibilidad) | GIS / Usabilidad | Frontend / Map | Media | Mapa Operativo con incidentes y eventos desplegados | Desmarcar checkbox "Incidentes" o "Eventos de Prevención" | El mapa oculta selectivamente los marcadores de la capa desmarcada y ajusta bounds | Capas filtradas dinámicamente según la preferencia del operador | APROBADO | 05/10/2026 10:58 | - | `MapaOperativoMando.tsx` |
| `CP-HU30-WEB-15` | Despliegue de Popup informativo al pulsar un marcador de prevención | GIS / UX | Frontend / Map | Alta | Marcador ámbar visible en mapa táctico | Clic sobre el pin del evento de prevención | Popup con código, título, sector, patrulla asignada, estado de misión e instrucciones | Popup abre con tipografía institucional, badges y desglose de insumos | APROBADO | 05/10/2026 10:59 | - | `MapaOperativoMandoInner.tsx` |
| `CP-HU30-WEB-16` | Notificación en tiempo real vía WebSocket al crearse un nuevo evento | Tiempo Real / Socket | Frontend / Hook | Alta | Encargado con Centro de Mando abierto en otra sesión/pantalla | Emisión de socket: evento `prevencion:creada` en sala de encargados | Socket captura evento; se muestra Toast informativo y se actualiza mapa | Evento capturado en vivo sin necesidad de recargar la página web | APROBADO | 05/10/2026 11:00 | - | `usePrevencionSocket.ts` |

---

## 3. Registro de Defectos y Fichas para Desarrolladores (Ciclo QA -> Dev -> Re-Test)

Siguiendo el principio de aseguramiento de calidad donde QA identifica, documenta y devuelve los defectos a los desarrolladores para su subsanación y posterior re-test, se formaliza el registro de hallazgos detectados durante la revisión de la historia:

### Ficha de Defecto QA #1: `BUG-H30-WEB-01`
* **Título:** Incompatibilidad de tipos en `RecursoItem` por propiedad `unidadMedida` inexistente.
* **Caso de Prueba Afectado:** `CP-HU30-WEB-07` (Asignación de recursos logísticos).
* **Severidad:** Media / Bloqueante de compilación.
* **Componente Afectado:** `src/components/mando/ModalCrearEventoPrevencion.tsx`.
* **Pasos para Reproducir:**
  1. Abrir el modal de creación de eventos de prevención.
  2. Agregar un insumo logístico e intentar renderizar `recurso.unidadMedida`.
  3. Ejecutar `npx tsc --noEmit`.
* **Resultado Esperado:** Compilación limpia de TypeScript reflejando las propiedades del inventario.
* **Resultado Obtenido:** Error de compilación `Property 'unidadMedida' does not exist on type 'RecursoItem'`.
* **Causa Raíz:** La interfaz institucional `RecursoItem` en `src/types/recurso.ts` almacena la cantidad disponible pero no define el campo opcional `unidadMedida`.
* **Acción Dev Solicitada:** Retirar el acceso a `unidadMedida` o utilizar una unidad por defecto institucional (`un.`).
* **Estado:** 🟢 **CORREGIDO**.
* **Fecha de Re-Test:** 05/10/2026 11:15.
* **Resultado de Re-Test:** APROBADO. `npx tsc --noEmit` y `npm run build` pasan con 0 errores.

---

### Ficha de Defecto QA #2: `BUG-H30-WEB-02`
* **Título:** Error de asignación de tipos `parameters.header: never` en cliente `openapi-fetch`.
* **Caso de Prueba Afectado:** `CP-HU30-WEB-08` (Consumo del servicio DAL).
* **Severidad:** Alta / Bloqueante de build.
* **Componente Afectado:** `src/services/prevencionService.ts`.
* **Pasos para Reproducir:**
  1. Generar los tipos de OpenAPI con `npx openapi-typescript`.
  2. Enviar cabecera `Authorization` explícita en `params.header` dentro de `apiClient.POST('/api/eventos-atp/prevencion', { params: { header: ... } })`.
  3. Ejecutar `npm run build`.
* **Resultado Esperado:** Petición HTTP estructurada conforme a la especificación de la API.
* **Resultado Obtenido:** Error `TS2322: Type '{ header: ... }' is not assignable to type 'never'`.
* **Causa Raíz:** En la especificación OpenAPI de `sgrai-api`, la autenticación se maneja a nivel global mediante `security: BearerAuth` y no como parámetro individual de header.
* **Acción Dev Solicitada:** Enviar la petición tipando el cuerpo mediante `PrevencionRequestBody` directamente en la propiedad `body` del cliente tipado, delegando las cabeceras al interceptor global o utilizando la opción directa de headers.
* **Estado:** 🟢 **CORREGIDO**.
* **Fecha de Re-Test:** 05/10/2026 11:20.
* **Resultado de Re-Test:** APROBADO. Pruebas unitarias en `prevencionService.test.ts` pasando 7/7 al 100%.

---

## 4. Conclusión de la Evaluación de Calidad

1. **Estado de la Rama:** La rama `feature/H30-crear-evento-manual-prevencion` cumple con el 100% de los criterios de aceptación funcionales y no funcionales de la historia de usuario HU-30.
2. **Estabilidad Técnica:**
   - Compilación Next.js: Exitosa (29/29 rutas).
   - Linter ESLint: 0 errores, 0 advertencias.
   - Pruebas Automatizadas: 72 suites, 385 tests aprobados (100% pass).
3. **Recomendación QA:** Proceder con la aprobación del Pull Request y habilitar el paso a Pair Review y PO Review conforme a `GEMINI.md`.
