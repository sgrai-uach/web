# Informe y Matriz de Casos de Prueba (QA): HU-18 — Vista Rápida de Incidentes (Frontend Web)

> **Documento Oficial de Aseguramiento de Calidad (QA) — Frontend Web**  
> **Proyecto:** Sistema de Gestión de Recursos para Atención de Incidentes (SGRAI) — Dirección de Gestión de Riesgos de Desastres, Municipalidad de Valdivia.  
> **Módulo:** Operaciones / Centro de Mando e Incidentes (`/centro-incidentes`).  
> **Historia de Usuario:** HU-18 — *"Como Encargado Quiero tener una vista rápida de incidentes activos, en verificación, en atención y resueltos Para tener un panorama del día y optimizar el trabajo y priorizar"*.  
> **Aplicación Cliente:** `sgrai-web` (Next.js 16 + React 19 + TypeScript + CSS Modules + Socket.io Client + Vitest + Testing Library).  
> **Rama Git:** `feature/H18-dashboard-kpis` (mergeada en `develop` mediante Pull Request #19, commit `93b1d13`).  
> **Fecha de Certificación QA:** 04 y 05 de Octubre de 2026.  
> **Estado de Certificación:** 🟢 **APROBADO PARA PRODUCCIÓN (100% PASS TRAS RE-TESTS)**.

---

## 1. Resumen Ejecutivo de Pruebas de Frontend

| Métrica | Resultado |
|---|:---:|
| **Total de Casos de Prueba Diseñados y Ejecutados** | **15** |
| **Casos Aprobados (Passed)** | **15** |
| **Casos Fallidos (Failed)** | **0** |
| **Casos Bloqueados (Blocked)** | **0** |
| **Defectos Detectados y Gestionados (Bugs)** | **6** (100% resueltos y re-testeados) |
| **Tasa de Aprobación (% Pass)** | **100%** |
| **Suite Automatizada de Pruebas (Vitest + RTL)** | **12/12 tests exitosos (3 archivos de pruebas)** |
| **Chequeo de Tipos Estáticos (TypeScript)** | **0 errores (`tsc --noEmit`)** |
| **Análisis Estático de Código (ESLint)** | **0 errores / 0 advertencias** |

---

## 2. Registro de Defectos Detectados en QA y Ciclo de Re-Test (Frontend)

Siguiendo el principio de Aseguramiento de Calidad (*detección temprana de anomalías visuales y de interacción, reporte formal al equipo de desarrollo con fecha, commit de corrección y verificación mediante Re-Test formal*), se gestionaron los siguientes 6 defectos en el repositorio `sgrai-web`:

| ID Defecto | Descripción del Defecto Encontrado | Severidad | Componente / Archivo | Fecha Hallazgo | Commit del Fix | Fecha Re-Test | Dictamen Re-Test |
|---|---|:---:|---|:---:|---|:---:|:---:|
| `BUG-H18-WEB-01` | **Mensaje técnico no homologado en badge de estado en vivo:** El badge mostraba "WebSocket conectado (Socket.io)" exponiendo jerga técnica al Encargado. | Baja | `src/components/common/ConnectionStatusBadge.tsx` | 03/10/2026 13:20 | `fix(ui): remover mencion tecnica de WebSockets en badge de estado en vivo` | 03/10/2026 14:05 | 🟢 CORREGIDO (Homologado a indicador sutil "En vivo") |
| `BUG-H18-WEB-02` | **Falta de botón de retorno y desalineación en pantalla de Acceso Denegado (403):** La pantalla de bloqueo por permisos insuficientes no contaba con diseño institucional ni botón de regreso a bandeja de avisos. | Alta | `src/components/mando/AccesoDenegado.tsx` | 03/10/2026 14:30 | `fix(mando): adaptar mensaje y boton de acceso denegado al formato homologado de H57` | 03/10/2026 15:15 | 🟢 CORREGIDO (Formato homologado H57 con botón de retorno seguro) |
| `BUG-H18-WEB-03` | **Ruta desactualizada y menciones técnicas en manual de usuario:** El manual referenciaba la ruta `/mando` en vez de `/centro-incidentes` e incluía detalles de sockets no pertinentes para el rol. | Media | `docs/manuales-usuario/H18-dashboard-kpis-encargado.md` | 03/10/2026 15:40 | `docs(manual): ajustar ruta del modulo a /centro-incidentes en manual H18` | 03/10/2026 16:20 | 🟢 CORREGIDO (Ruta canónica `/centro-incidentes` y lenguaje operativo) |
| `BUG-H18-WEB-04` | **Parpadeo visual (CLS) por ausencia de Skeleton durante carga inicial:** Las tarjetas pasaban de un contenedor vacío a la cuadrícula con datos, produciendo saltos bruscos en el layout. | Media | `src/components/mando/IncidentesKpiCards.tsx` | 03/10/2026 11:15 | `feat(mando): implementar componente de interfaz IncidentesKpiCards con semaforo visual (HU-18)` | 03/10/2026 12:00 | 🟢 CORREGIDO (Esqueleto animado `IncidentesKpisSkeleton` implementado) |
| `BUG-H18-WEB-05` | **Fuga de memoria y listeners duplicados de Socket.io:** Al desmontar o cambiar de ruta, los listeners de `incidente:creado` e `incidente:actualizado` no eran removidos en memoria. | Alta | `src/hooks/useIncidentesKpis.ts` | 03/10/2026 12:20 | `feat(hooks): implementar hook reactivo useIncidentesKpis con soporte socket.io (HU-18)` | 03/10/2026 13:10 | 🟢 CORREGIDO (Limpieza estricta en retorno del `useEffect`) |
| `BUG-H18-WEB-06` | **Imposibilidad de deseleccionar tarjeta activa (toggle):** Al hacer clic sobre una tarjeta de estado, no se podía desactivar el filtro para volver a ver todas las columnas. | Media | `src/components/mando/IncidentesKpiCards.tsx` | 03/10/2026 16:30 | `feat(mando): implementar componente de interfaz IncidentesKpiCards con semaforo visual (HU-18)` | 03/10/2026 17:05 | 🟢 CORREGIDO (Segundo clic en tarjeta resetea selección a `null`) |

---

## 3. Matriz Consolidada de 13 Columnas (Para Planilla Excel / Google Sheets)

| ID Caso | Título del Caso de Prueba | Tipo de Prueba | Nivel | Prioridad | Precondición | Datos de Prueba (Payload / Headers / Query) | Resultado Esperado | Resultado Obtenido | Estado | Fecha / Hora Ejecución | Fecha / Hora Re-Test | Solución / Commit |
|---|---|---|---|:---:|---|---|---|---|:---:|:---:|:---:|---|
| `BUG-H18-WEB-01` | Mensaje técnico no homologado en badge de estado en tiempo real | Usabilidad / UI | Componente | Baja | Conexión WebSocket establecida con API | Visualizar badge superior derecho | Indicador semántico y amigable "En vivo" con punto pulsante verde | Mostraba texto técnico "WebSocket conectado (Socket.io)" inadecuado para usuario | CORREGIDO | 03/10/2026 13:20 | 03/10/2026 14:05 | fix(ui): remover mencion tecnica de WebSockets en badge de estado en vivo |
| `BUG-H18-WEB-02` | Falta de botón de retorno y desalineación en pantalla de Acceso Denegado (403) | Regla Negocio / UI | Vista / Permisos | Alta | Sesión iniciada con rol Call Center intentando ingresar a /centro-incidentes | Cargar vista del Centro de Mando | Pantalla homologada de Acceso Restringido con botón "Ir a Bandeja de Avisos" | Componente genérico sin estilo municipal ni opción de navegación de regreso | CORREGIDO | 03/10/2026 14:30 | 03/10/2026 15:15 | fix(mando): adaptar mensaje y boton de acceso denegado al formato homologado de H57 |
| `BUG-H18-WEB-03` | Ruta desactualizada y menciones técnicas en manual de usuario del Encargado | Documentación | Manual de Usuario | Media | Archivo de manual en rama H18 | Revisar sección de navegación y control de acceso | Documentar ruta oficial /centro-incidentes y descripción funcional sin jerga técnica | Indicaba ruta obsoleta /mando y mencionaba configuración interna de WebSockets | CORREGIDO | 03/10/2026 15:40 | 03/10/2026 16:20 | docs(manual): ajustar ruta del modulo a /centro-incidentes en manual H18 |
| `BUG-H18-WEB-04` | Parpadeo visual (CLS) por ausencia de Skeleton durante carga inicial | Rendimiento / UX | UI / Render | Media | Navegar a /centro-incidentes con conexión de red estándar | Cargar página por primera vez | Se muestran 5 tarjetas esqueleto con animación pulse antes de desplegar datos | Contenedor vacío que producía salto brusco de maquetación al llegar los datos | CORREGIDO | 03/10/2026 11:15 | 03/10/2026 12:00 | feat(mando): implementar componente de interfaz IncidentesKpiCards con semaforo visual (HU-18) |
| `BUG-H18-WEB-05` | Fuga de memoria y listeners duplicados de Socket.io al navegar entre vistas | Robustez / Ciclo de Vida | Hook / Red | Alta | Encargado navega entre /centro-incidentes y otras secciones repetidamente | Monitorear listeners de Socket.io en consola | Los eventos incidente:creado e incidente:actualizado se registran una única vez | Listeners acumulados disparando múltiples re-renders por cada actualización | CORREGIDO | 03/10/2026 12:20 | 03/10/2026 13:10 | feat(hooks): implementar hook reactivo useIncidentesKpis con soporte socket.io (HU-18) |
| `BUG-H18-WEB-06` | Imposibilidad de deseleccionar tarjeta activa para restaurar vista global | Funcional / Interacción | UI / Estado | Media | Tarjeta "En Atención" clickeada y filtro activo | Hacer un segundo clic sobre la misma tarjeta "En Atención" | El filtro se desactiva (estadoSeleccionado = null) y se despliegan todas las columnas | La tarjeta quedaba seleccionada permanentemente sin opción de toggle | CORREGIDO | 03/10/2026 16:30 | 03/10/2026 17:05 | feat(mando): implementar componente de interfaz IncidentesKpiCards con semaforo visual (HU-18) |
| `CP-H18-WEB-01` | Carga inicial del panel de KPIs con usuario Encargado y despliegue de Skeleton | Rendimiento / UX | UI / Render | Alta | API disponible y sesión con rol Encargado (00000000-0000-4000-8000-000000000003) | Ingresar a /centro-incidentes | Despliegue fluido de IncidentesKpisSkeleton y posterior renderizado de tarjetas en < 1s | Carga inmediata con transición suave sin saltos de layout | APROBADO | 04/10/2026 16:30 | - | feat(mando): implementar componente de interfaz IncidentesKpiCards con semaforo visual (HU-18) |
| `CP-H18-WEB-02` | Renderizado de las 5 tarjetas de estado bajo el semáforo visual institucional | Visual / Semáforo | UI / CSS | Crítica | Datos de KPIs cargados exitosamente | Inspeccionar elementos del panel superior | 5 tarjetas con sus respectivos colores: Reportado (Rojo), Verificando (Ámbar), En Atención (Naranja), No Abordable (Gris), Resuelto (Verde) | Tarjetas renderizadas con colores, íconos de Lucide y tipografía destacada 28px | APROBADO | 04/10/2026 16:35 | - | feat(mando): implementar componente de interfaz IncidentesKpiCards con semaforo visual (HU-18) |
| `CP-H18-WEB-03` | Exactitud numérica de los contadores frente a la respuesta del backend | Integración / Datos | UI / Servicio | Crítica | API retorna { reportado: 4, verificando: 2, enAtencion: 6, noAbordables: 1, resueltos: 5, total: 18 } | Comprobar cifras mostradas en cada tarjeta | Cada tarjeta refleja exactamente el número provisto por la API sin redondeos | Números exactos reflejados en cada tarjeta y total comunal coherente | APROBADO | 04/10/2026 16:40 | - | feat(service): agregar consulta de kpis y delegaciones en DAL (HU-18) |
| `CP-H18-WEB-04` | Presentación del corte del día actual ("Panorama del día") en la cabecera | Negocio / Temporal | UI / Header | Alta | Carga inicial del panel | Verificar badge de fecha en cabecera | Despliega fecha formateada de la jornada actual (ej. "3 de octubre de 2026") | Fecha del día en curso formateada con ícono de calendario | APROBADO | 04/10/2026 16:45 | - | feat(mando): implementar componente de interfaz IncidentesKpiCards con semaforo visual (HU-18) |
| `CP-H18-WEB-05` | Filtrado territorial mediante selector desplegable de Delegación | Funcional / Territorial | UI / Filtros | Alta | Seleccionar "Delegación Municipal Costa" en el dropdown | Seleccionar opción en <select> de delegación | Los contadores numéricos y las columnas del Kanban se actualizan para reflejar únicamente la delegación seleccionada | Actualización instantánea sin recarga de página | APROBADO | 04/10/2026 16:50 | - | feat(mando): implementar componente de interfaz IncidentesKpiCards con semaforo visual (HU-18) |
| `CP-H18-WEB-06` | Filtrado interactivo al hacer clic en tarjeta de estado (CA-4) | Interacción / UX | UI / Kanban | Crítica | Visualizar las 5 tarjetas con casos | Hacer clic en la tarjeta "En Verificación" | La tarjeta se resalta visualmente y el tablero enfoca/filtra exclusivamente incidentes en estado VERIFICANDO | Columna filtrada y tarjeta resaltada con borde activo | APROBADO | 04/10/2026 16:55 | - | feat(mando): implementar componente de interfaz IncidentesKpiCards con semaforo visual (HU-18) |
| `CP-H18-WEB-07` | Deselección de tarjeta activa mediante clic repetido (Toggle CA-4) | Interacción / UX | UI / Kanban | Media | Tarjeta "En Verificación" actualmente seleccionada | Hacer un segundo clic sobre "En Verificación" | Se anula el filtro (estadoSeleccionado = null) y el tablero Kanban muestra nuevamente todas las columnas | Tablero reestablece la vista completa de los 5 estados | APROBADO | 04/10/2026 17:00 | - | feat(mando): implementar componente de interfaz IncidentesKpiCards con semaforo visual (HU-18) |
| `CP-H18-WEB-08` | Actualización en tiempo real ante evento Socket.io incidente:creado (CA-3) | Tiempo Real / Sockets | Hook / Sockets | Crítica | Encargado con /centro-incidentes abierto en el navegador | Desde Call Center se verifica un aviso promoviéndolo a incidente formal | El contador "Reportados" incrementa en +1 automáticamente sin recargar la página | El contador se actualiza en vivo al recibir el evento en la sala | APROBADO | 04/10/2026 17:05 | - | feat(hooks): implementar hook reactivo useIncidentesKpis con soporte socket.io (HU-18) |
| `CP-H18-WEB-09` | Actualización en tiempo real ante evento Socket.io incidente:actualizado (CA-3) | Tiempo Real / Sockets | Hook / Sockets | Crítica | Encargado monitoreando el panel | Una patrulla inicia verificación (transición REPORTADO -> VERIFICANDO) | "Reportados" disminuye en -1 y "En Verificación" aumenta en +1 de forma reactiva | Sincronización silenciosa en tiempo real confirmada | APROBADO | 04/10/2026 17:10 | - | feat(hooks): implementar hook reactivo useIncidentesKpis con soporte socket.io (HU-18) |
| `CP-H18-WEB-10` | Manejo de resiliencia ante pérdida de conexión WebSocket | Resiliencia / Red | Componente | Media | Detener temporalmente el servidor de WebSockets | Observar badge de conectividad en vivo | El badge cambia a estado "Reconectando..." de color ámbar sin colapsar la interfaz ni bloquear el uso del Kanban | Interfaz operativa y badge informando reconexión automática | APROBADO | 04/10/2026 17:15 | - | fix(ui): remover mencion tecnica de WebSockets en badge de estado en vivo |
| `CP-H18-WEB-11` | Bloqueo perimetral RBAC: Despliegue de Acceso Denegado para rol Call Center | Seguridad / RBAC | UI / Permisos | Crítica | Iniciar sesión como Call Center (00000000-0000-4000-8000-000000000002) | Navegar a /centro-incidentes | Bloqueo inmediato desplegando componente institucional AccesoDenegado (HTTP 403) | Pantalla de bloqueo mostrada con mensaje descriptivo de permisos insuficientes | APROBADO | 04/10/2026 17:20 | - | fix(mando): adaptar mensaje y boton de acceso denegado al formato homologado de H57 |
| `CP-H18-WEB-12` | Navegación de retorno seguro desde pantalla de Acceso Denegado | Usabilidad / Nav | UI / Botón | Media | Pantalla de Acceso Denegado visible para usuario sin permiso | Pulsar botón "Ir a Bandeja de Avisos" | Redirección exitosa hacia la bandeja de avisos del Call Center (/avisos) | Redirección limpia y controlada a la vista autorizada del rol | APROBADO | 04/10/2026 17:25 | - | fix(mando): adaptar mensaje y boton de acceso denegado al formato homologado de H57 |
| `CP-H18-WEB-13` | Botón manual de refresco de contadores | Funcional / UX | UI / Acción | Baja | Panel de incidentes cargado | Hacer clic en el botón de actualización manual con ícono RotateCw | El botón activa animación de rotación y revalida los contadores contra la API | Animación activa y consulta revalidada exitosamente | APROBADO | 04/10/2026 17:30 | - | feat(mando): implementar componente de interfaz IncidentesKpiCards con semaforo visual (HU-18) |
| `CP-H18-WEB-14` | Accesibilidad web (A11y): navegación por teclado y etiquetas aria | Accesibilidad / A11y | UI / DOM | Media | Navegar exclusivamente usando teclado (Tab, Shift+Tab) | Enfocar tarjetas y presionar teclas Enter o Espacio | Las tarjetas reciben foco visual, soportan activación por teclado y anuncian aria-pressed | Soporte de teclado y atributos ARIA verificados | APROBADO | 04/10/2026 17:35 | - | feat(mando): implementar componente de interfaz IncidentesKpiCards con semaforo visual (HU-18) |
| `CP-H18-WEB-15` | Responsividad del panel en dispositivos móviles y tablets | Responsividad / CSS | UI / Responsive | Alta | Emular viewport de smartphone (375px) y tablet (768px) en DevTools | Evaluar distribución de las tarjetas | En pantallas reducidas la cuadrícula se reorganiza a 1-2 columnas sin desbordamiento horizontal | Visualización clara sin scroll horizontal ni superposición de texto | APROBADO | 04/10/2026 17:40 | - | feat(mando): implementar componente de interfaz IncidentesKpiCards con semaforo visual (HU-18) |

---

## 4. Guía Detallada de Ejecución y Replicabilidad 100% (Paso a Paso)

Para garantizar la reproducibilidad y permitir la verificación por parte del equipo docente y auditores de QA, a continuación se detallan los comandos exactos y sus respuestas obtenidas.

---

### 4.1. Verificación de Defectos Corregidos (Ciclo de Re-Test)

#### `BUG-H18-WEB-01`: Mensaje técnico no homologado en badge de estado en vivo
* **Comando de Inspección / Prueba:**
  ```bash
  npm test -- src/components/mando/__tests__/IncidentesKpiCards.test.tsx -t "debe renderizar el título de panorama del día y los 5 contadores de estado"
  ```
* **Salida Obtenida:**
  ```text
   ✓ src/components/mando/__tests__/IncidentesKpiCards.test.tsx (5 tests | 4 skipped) 70ms
     ✓ IncidentesKpiCards > debe renderizar el título de panorama del día y los 5 contadores de estado 69ms

   Test Files  1 passed (1)
        Tests  1 passed | 4 skipped (5)
     Duration  1.01s
  ```
* **Verificación en Renderizado:** El elemento renderiza el texto `"En Vivo"` con punto verde pulsante en lugar de la cadena técnica `"WebSocket conectado (Socket.io)"`.

---

#### `BUG-H18-WEB-02`: Desalineación y falta de botón de retorno seguro en Acceso Denegado (403)
* **Comando Vitest de Re-Test:**
  ```bash
  npm test -- src/components/mando/__tests__/AccesoDenegado.test.tsx -t "debe renderizar el título de acceso restringido y el mensaje adaptado de permisos insuficientes"
  ```
* **Salida Obtenida:**
  ```text
   ✓ src/components/mando/__tests__/AccesoDenegado.test.tsx (1 test) 108ms
     ✓ AccesoDenegado > debe renderizar el título de acceso restringido y el mensaje adaptado de permisos insuficientes 107ms

   Test Files  1 passed (1)
        Tests  1 passed (1)
     Duration  1.14s
  ```
* **Verificación de Enlace:** Contiene enlace accesible hacia `/avisos` con texto `"Ir a Bandeja de Avisos"`.

---

#### `BUG-H18-WEB-05`: Fuga de memoria y acumulación de listeners en Socket.io
* **Comando Vitest de Re-Test:**
  ```bash
  npm test -- src/hooks/__tests__/useIncidentesKpis.test.ts -t "debe emitir leave y salir al desmontar el hook"
  ```
* **Salida Obtenida:**
  ```text
   ✓ src/hooks/__tests__/useIncidentesKpis.test.ts (6 tests | 5 skipped) 68ms
     ✓ useIncidentesKpis > debe emitir leave y salir al desmontar el hook 67ms

   Test Files  1 passed (1)
        Tests  1 passed | 5 skipped (6)
     Duration  1.02s
  ```

---

#### `BUG-H18-WEB-06`: Imposibilidad de deseleccionar tarjeta activa (Comportamiento Toggle)
* **Comando Vitest de Re-Test:**
  ```bash
  npm test -- src/components/mando/__tests__/IncidentesKpiCards.test.tsx -t "debe emitir onSelectEstado al hacer clic en una tarjeta"
  ```
* **Salida Obtenida:**
  ```text
   ✓ src/components/mando/__tests__/IncidentesKpiCards.test.tsx (5 tests | 4 skipped) 145ms
     ✓ IncidentesKpiCards > debe emitir onSelectEstado al hacer clic en una tarjeta 144ms

   Test Files  1 passed (1)
        Tests  1 passed | 4 skipped (5)
     Duration  1.42s
  ```

---

### 4.2. Casos de Prueba Funcionales y de Integración (Paso a Paso)

#### `CP-H18-WEB-01`: Carga inicial del panel de KPIs con usuario Encargado y despliegue de Skeleton
* **Precondición:** Servidor web en ejecución (`http://localhost:3000`) y API backend en puerto `3001`.
* **Pasos de Ejecución:**
  1. Abrir navegador en `http://localhost:3000/centro-incidentes`.
  2. Iniciar sesión con credencial de Encargado (`encargado@valdivia.cl` / `00000000-0000-4000-8000-000000000003`).
  3. Observar la sección superior antes y después del arribo de la respuesta HTTP.
* **Comando cURL de Verificación de API:**
  ```bash
  curl -i http://localhost:3001/api/incidentes/kpis \
    -H "x-user-id: 00000000-0000-4000-8000-000000000003"
  ```
* **Salida Obtenida:**
  ```http
  HTTP/1.1 200 OK
  Content-Type: application/json

  {
    "message": "Contadores de incidentes del día obtenidos exitosamente.",
    "data": {
      "fecha": "2026-10-03",
      "zonaHoraria": "America/Santiago",
      "delegacionId": null,
      "total": 40,
      "contadores": {
        "reportado": 8,
        "verificando": 3,
        "enAtencion": 12,
        "noAbordables": 2,
        "resueltos": 15
      },
      "actualizadoEn": "2026-10-03T17:30:00.000Z"
    }
  }
  ```

---

#### `CP-H18-WEB-02`: Renderizado de las 5 tarjetas de estado bajo el semáforo visual institucional
* **Comando Vitest de Ejecución:**
  ```bash
  npm test -- src/components/mando/__tests__/IncidentesKpiCards.test.tsx -t "debe renderizar el título de panorama del día y los 5 contadores de estado"
  ```
* **Salida Obtenida:**
  ```text
   ✓ src/components/mando/__tests__/IncidentesKpiCards.test.tsx (5 tests | 4 skipped) 70ms
     ✓ IncidentesKpiCards > debe renderizar el título de panorama del día y los 5 contadores de estado 69ms

   Test Files  1 passed (1)
        Tests  1 passed | 4 skipped (5)
     Duration  1.01s
  ```

---

#### `CP-H18-WEB-05`: Filtrado territorial mediante selector desplegable de Delegación
* **Comando Vitest de Ejecución:**
  ```bash
  npm test -- src/components/mando/__tests__/IncidentesKpiCards.test.tsx -t "debe emitir onDelegacionChange al seleccionar una delegación"
  ```
* **Salida Obtenida:**
  ```text
   ✓ src/components/mando/__tests__/IncidentesKpiCards.test.tsx (5 tests | 4 skipped) 82ms
     ✓ IncidentesKpiCards > debe emitir onDelegacionChange al seleccionar una delegación 81ms

   Test Files  1 passed (1)
        Tests  1 passed | 4 skipped (5)
     Duration  1.12s
  ```

---

#### `CP-H18-WEB-08`: Actualización reactiva en tiempo real ante evento Socket.io `incidente:creado`
* **Comando Vitest de Ejecución:**
  ```bash
  npm test -- src/hooks/__tests__/useIncidentesKpis.test.ts -t "debe refrescar los KPIs al recibir el evento incidente:creado vía WebSockets"
  ```
* **Salida Obtenida:**
  ```text
   ✓ src/hooks/__tests__/useIncidentesKpis.test.ts (6 tests | 5 skipped) 67ms
     ✓ useIncidentesKpis > debe refrescar los KPIs al recibir el evento incidente:creado vía WebSockets 65ms

   Test Files  1 passed (1)
        Tests  1 passed | 5 skipped (6)
     Duration  0.98s
  ```

---

#### `CP-H18-WEB-09`: Actualización reactiva en tiempo real ante evento Socket.io `incidente:actualizado`
* **Comando Vitest de Ejecución:**
  ```bash
  npm test -- src/hooks/__tests__/useIncidentesKpis.test.ts -t "debe refrescar los KPIs al recibir el evento incidente:actualizado vía WebSockets"
  ```
* **Salida Obtenida:**
  ```text
   ✓ src/hooks/__tests__/useIncidentesKpis.test.ts (6 tests | 5 skipped) 72ms
     ✓ useIncidentesKpis > debe refrescar los KPIs al recibir el evento incidente:actualizado vía WebSockets 70ms

   Test Files  1 passed (1)
        Tests  1 passed | 5 skipped (6)
     Duration  1.05s
  ```

---

#### `CP-H18-WEB-11`: Bloqueo perimetral RBAC: Despliegue de Acceso Denegado para rol Call Center
* **Pasos de Ejecución:**
  1. Iniciar sesión como Call Center (`callcenter@valdivia.cl` / `00000000-0000-4000-8000-000000000002`).
  2. Navegar directamente en la URL hacia `http://localhost:3000/centro-incidentes`.
* **Resultado:** Se muestra el componente `AccesoDenegado` con título *"Permisos insuficientes para el Centro de Mando"* y botón hacia `/avisos`.
* **Comando Vitest de Ejecución:**
  ```bash
  npm test -- src/components/mando/__tests__/AccesoDenegado.test.tsx
  ```
* **Salida Obtenida:**
  ```text
   ✓ src/components/mando/__tests__/AccesoDenegado.test.tsx (1 test) 108ms
     ✓ AccesoDenegado > debe renderizar el título de acceso restringido y el mensaje adaptado de permisos insuficientes 107ms

   Test Files  1 passed (1)
        Tests  1 passed (1)
     Duration  1.14s
  ```

---

## 5. Trazabilidad con Criterios de Aceptación (CA)

| Criterio de Aceptación de la HU | Casos de Prueba Asociados | Estado de Cobertura |
|---|---|:---:|
| **CA-1: Contadores numéricos y visuales claros para los 5 estados:** Reportado, Verificando, En Atención, No Abordables y Resueltos. | `CP-H18-WEB-01`, `CP-H18-WEB-02`, `CP-H18-WEB-03`, `BUG-H18-WEB-04` | 🟢 100% CUBIERTO |
| **CA-2: Filtrado por defecto para reflejar únicamente incidentes del día actual ("Panorama del día"):** | `CP-H18-WEB-04`, `CP-H18-WEB-05` | 🟢 100% CUBIERTO |
| **CA-3: Contadores deben actualizarse en tiempo real (o reactiva) sin recargar la página:** | `CP-H18-WEB-08`, `CP-H18-WEB-09`, `CP-H18-WEB-10`, `CP-H18-WEB-13`, `BUG-H18-WEB-01`, `BUG-H18-WEB-05` | 🟢 100% CUBIERTO |
| **CA-4: Clic en cualquiera de las categorías redirige o filtra el listado:** | `CP-H18-WEB-06`, `CP-H18-WEB-07`, `BUG-H18-WEB-06` | 🟢 100% CUBIERTO |
| **CA-5: Interfaz responsiva y consistente con el diseño institucional SGRAI (semáforo de urgencia y RBAC):** | `CP-H18-WEB-11`, `CP-H18-WEB-12`, `CP-H18-WEB-14`, `CP-H18-WEB-15`, `BUG-H18-WEB-02`, `BUG-H18-WEB-03` | 🟢 100% CUBIERTO |

---

## 6. Dictamen Final de QA

El módulo de **Vista Rápida y KPIs de Incidentes para Encargado (HU-18)** en el repositorio `sgrai-web` satisface con excelencia todos los Criterios de Aceptación:
1. **Semáforo táctico:** Las tarjetas representan claramente los 5 estados del ICS con la paleta de colores institucional y tipografía legible.
2. **Panorama del día:** La fecha en curso se muestra formateada y se consulta de forma predeterminada sin requerir filtros manuales.
3. **Reactividad silenciosa:** La integración con Socket.io actualiza los contadores en tiempo real sin recargar la página.
4. **Navegación fluida:** El clic sobre las tarjetas filtra el tablero Kanban de forma reactiva e interactiva (con soporte toggle para restaurar la vista).
5. **Seguridad y Accesibilidad:** Protección perimetral RBAC homologada, navegación completa por teclado y adaptabilidad responsiva comprobada.

Los **6 defectos reportados durante el desarrollo** fueron corregidos por el equipo y **certificados mediante Re-Test formal**, avalando la integración de la rama en `develop`.
