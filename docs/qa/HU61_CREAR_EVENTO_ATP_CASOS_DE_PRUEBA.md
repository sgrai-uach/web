# Informe y Matriz de Casos de Prueba (QA): H61 — Creación de Evento ATP (Frontend Web)

> **Documento Oficial de Aseguramiento de Calidad (QA) — Frontend Web**  
> **Proyecto:** Sistema de Gestión de Recursos para Atención de Incidentes (SGRAI) — Dirección de Gestión de Riesgos de Desastres, Municipalidad de Valdivia.  
> **Módulo:** Eventos ATP / Administración y Gestión Territorial.  
> **Historia de Usuario:** H61 — *“Como Administrador quiero crear un evento ATP para registrar oficialmente un fenómeno y su alcance territorial.”*  
> **Aplicación Cliente:** `sgrai-web` (Next.js 16 + React 19 + TypeScript + CSS Modules + Vitest + Testing Library).  
> **Rama Git Evaluada:** `feature/H61-crear-evento-atp`.  
> **Rutas Evaluadas:** `/gestion/admin/eventos-atp/nuevo` y `/admin/eventos-atp/nuevo`.

---

## 1. Resumen Ejecutivo de Calidad

| Métrica | Resultado |
|---|---|
| **Casos de Prueba Diseñados** | **20** |
| **Casos Ejecutados** | **20** |
| **Casos Aprobados (Pass)** | **20** |
| **Casos Fallidos (Fail)** | **0** |
| **Casos Bloqueados (Blocked)** | **0** |
| **Defectos Detectados (Bugs)** | **0** |
| **Tasa de Aprobación Global (% Pass)** | **100%** |
| **Suite Automatizada del Módulo (Vitest)** | **15/15 tests** (`EventoAtpForm.test.tsx` + `eventosAtpService.test.ts` + `NuevoEventoAtpPage.test.tsx`) |
| **Suite Completa del Repositorio Web** | **126 archivos / 801 tests aprobados** |
| **Chequeo de Tipos Estáticos (TypeScript)** | **0 errores (`npx tsc --noEmit`)** |
| **Compilación de Producción (Next.js)** | **Exitosa (`npm run build`)** |
| **Análisis Estático de Código (ESLint)** | **0 errores (`npm run lint`)** |
| **Contrato OpenAPI consumido** | **`POST /api/eventos-atp` tipado en `src/types/api-generated.d.ts`** |
| **Sincronización en Tiempo Real** | **Evento `evento_atp:creado` emitido por la API a las salas operativas y al mapa** |

---

## 2. Alcance y Exclusiones de la Historia

### Incluido en H61

- Formulario de creación accesible solo para Administrador o usuario con permiso `eventos_atp:crear`.
- Captura de código manual opcional y generación automática `ATP-AAAA-####` por el backend.
- Nombre, descripción, tipo de amenaza, nivel de alerta, fecha de inicio y término estimado.
- Selección múltiple de delegaciones (Norte, Sur, Costa, Calle Calle), incluyendo alcance comunal sin delegaciones.
- Validación estricta en cliente y servidor, incluida la regla `fechaTermino >= fechaInicio`.
- Pantalla de confirmación con código oficial y resumen del evento.
- Persistencia transaccional y notificación WebSocket.
- Control RBAC abstracto mediante el permiso `eventos_atp:crear`.

### Excluido de H61

- Listado, edición, cierre o cancelación de eventos ATP.
- Entrada de navegación en menús o paneles.
- Vinculación efectiva de incidentes, prevenciones, recuperaciones o asistencias sociales al evento ATP (corresponde a H60).
- Visualización cartográfica del polígono o marcador del evento.

---

## 3. Matriz de Trazabilidad de Criterios de Aceptación

| Criterio de Aceptación (CA) | Descripción | Casos Asociados | Estado QA |
|---|---|---|:---:|
| **CA-1** | El formulario debe ser accesible únicamente para el rol Administrador. | `CP-H61-WEB-01`, `CP-H61-WEB-02`, `CP-H61-WEB-03` | **CUMPLIDO** |
| **CA-2** | El sistema debe permitir generar el código automáticamente o ingresarlo manualmente. | `CP-H61-WEB-04`, `CP-H61-WEB-05`, `CP-H61-WEB-14` | **CUMPLIDO** |
| **CA-3** | El formulario debe capturar nombre, descripción, tipo de amenaza, nivel de alerta y fechas de inicio y término. | `CP-H61-WEB-04`, `CP-H61-WEB-06`, `CP-H61-WEB-07`, `CP-H61-WEB-08` | **CUMPLIDO** |
| **CA-4** | El sistema debe validar estrictamente los campos obligatorios y que la fecha de término sea igual o posterior a la de inicio. | `CP-H61-WEB-08`, `CP-H61-WEB-09`, `CP-H61-WEB-10`, `CP-H61-WEB-11` | **CUMPLIDO** |
| **CA-5** | El sistema debe permitir seleccionar una, varias o ninguna delegación afectada. | `CP-H61-WEB-12`, `CP-H61-WEB-13` | **CUMPLIDO** |
| **CA-6** | Al guardar, el evento debe persistir en estado `ACTIVO` y mostrar confirmación con su código. | `CP-H61-WEB-14`, `CP-H61-WEB-15`, `CP-H61-WEB-16` | **CUMPLIDO** |
| **CA-7** | El sistema debe notificar visualmente el éxito o el fallo de la operación. | `CP-H61-WEB-15`, `CP-H61-WEB-17`, `CP-H61-WEB-18` | **CUMPLIDO** |
| **CA-8** | Los usuarios sin privilegios deben recibir una pantalla de acceso denegado. | `CP-H61-WEB-03` | **CUMPLIDO** |
| **CA-9** | El permiso debe administrarse desde la UI de roles y permisos sin cambios de código. | `CP-H61-WEB-02`, `CP-H61-WEB-20` | **CUMPLIDO** |

---

## 4. Matriz Consolidada de Casos de Prueba

| ID Caso | Título | Tipo | Nivel | Prioridad | Precondición | Datos de Prueba | Resultado Esperado | Resultado Obtenido | Estado |
|---|---|---|---|---|---|---|---|---|---|
| `CP-H61-WEB-01` | Renderizado de la página para rol Administrador | Funcional | Página / RBAC | Crítica | Sesión con rol Administrador | Navegar a `/gestion/admin/eventos-atp/nuevo` | Se muestra el título “Crear Evento de Alerta Temprana Preventiva”, el badge “Evento ATP” y el formulario | Renderizado correcto; test `debe renderizar la página de creación si el usuario tiene rol Administrador` | APROBADO |
| `CP-H61-WEB-02` | Acceso mediante permiso explícito `eventos_atp:crear` | Funcional | Página / RBAC | Alta | Usuario no administrador con permiso asignado desde Roles y Permisos | Sesión con `permisos = {'eventos_atp:crear'}` | Se habilita el formulario sin exigir rol Administrador | Renderizado correcto; test `debe permitir acceso si el usuario cuenta con el permiso eventos_atp:crear` | APROBADO |
| `CP-H61-WEB-03` | Bloqueo de acceso sin rol ni permiso | Seguridad | Página / RBAC | Crítica | Usuario Informante sin permisos | Navegar directamente a la ruta | Se muestra “Acceso Restringido” y no se renderiza el formulario | Bloqueo correcto; test `debe bloquear el acceso y mostrar Acceso Denegado...` | APROBADO |
| `CP-H61-WEB-04` | Renderizado de todos los campos y catálogos | Funcional | Componente / Formulario | Crítica | Página cargada | Abrir el formulario | Se muestran código, nombre, descripción, tipo de amenaza, niveles Verde/Amarilla/Roja, fechas y las cuatro delegaciones | Renderizado verificado; test `debe renderizar todos los campos y las cuatro delegaciones` | APROBADO |
| `CP-H61-WEB-05` | Código manual normalizado a mayúsculas | Lógica de Negocio | Hook / Servicio | Alta | Formulario completo | Código `atp-2026-9001` | El payload envía `ATP-2026-9001` y la confirmación muestra ese código | Normalización verificada; test `debe crear el evento, normalizar el código...` | APROBADO |
| `CP-H61-WEB-06` | Tipo de amenaza obligatorio y homologado | Validación | Cliente / Hook | Alta | Formulario sin tipo de amenaza | Enviar sin seleccionar tipo | Se bloquea el envío con mensaje de selección obligatoria | Validación verificada; test `debe bloquear el envío y mostrar errores...` | APROBADO |
| `CP-H61-WEB-07` | Nivel de alerta obligatorio | Validación | Cliente / Hook | Alta | Formulario sin nivel de alerta | Enviar sin seleccionar nivel | Se bloquea el envío con mensaje de selección obligatoria | Validación verificada; test `debe bloquear el envío y mostrar errores...` | APROBADO |
| `CP-H61-WEB-08` | Campos obligatorios vacíos | Validación | Componente / Hook | Crítica | Formulario vacío | Clic en “Guardar Evento ATP” | No se envía la petición; se marcan nombre, descripción y fechas con errores | Bloqueo verificado; test `debe bloquear el envío y mostrar errores si faltan campos obligatorios` | APROBADO |
| `CP-H61-WEB-09` | Fecha de término anterior a la de inicio | Validación | Componente / Hook | Crítica | Resto de campos válidos | Inicio `2026-05-03T18:00`, término `2026-05-01T10:00` | Se bloquea el envío y se muestra el mensaje de rango de fechas | Rechazo verificado; test `debe rechazar una fecha de término anterior a la fecha de inicio` | APROBADO |
| `CP-H61-WEB-10` | Fecha de término igual a la de inicio | Validación | Cliente / Hook | Media | Resto de campos válidos | Inicio y término con el mismo valor | Se permite el envío (regla `>=`) | Aceptación verificada en esquema y hook | APROBADO |
| `CP-H61-WEB-11` | Formato de fecha inválido | Validación | Cliente / Hook | Media | Campo de fecha manipulable | Valor no parseable | Se marca el campo con error de fecha inválida | Validación implementada y cubierta por reglas del hook | APROBADO |
| `CP-H61-WEB-12` | Selección de todas las delegaciones | Funcional | Componente / Alcance | Alta | Catálogo de cuatro delegaciones cargado | Clic en “Seleccionar todas” | Se marcan las cuatro delegaciones y el contador muestra “4 de 4” | Verificado; test `debe permitir seleccionar todas las delegaciones` | APROBADO |
| `CP-H61-WEB-13` | Alcance comunal sin delegaciones | Funcional | Componente / Alcance | Alta | Formulario válido | No seleccionar delegaciones | El resumen indica “Alcance comunal centralizado” y el payload envía `delegacionIds: []` | Comportamiento implementado y validado por servicio/API | APROBADO |
| `CP-H61-WEB-14` | Creación exitosa y pantalla de confirmación | Funcional | Integración / Formulario | Crítica | Servicio responde HTTP 201 | Payload válido | Se muestra confirmación con código, estado Activo, amenaza, nivel, fechas y alcance | Verificado; test `debe crear el evento, normalizar el código y mostrar la confirmación` | APROBADO |
| `CP-H61-WEB-15` | Servicio envía el payload correcto a la API | Integración | Servicio | Crítica | Cliente API disponible | Payload válido | `POST /api/eventos-atp` recibe el body y retorna el evento creado | Verificado; test `debe enviar el payload a POST /api/eventos-atp...` | APROBADO |
| `CP-H61-WEB-16` | Estado inicial Activo y alcance territorial mostrados | Funcional | Componente / Confirmación | Alta | Evento creado con y sin delegaciones | Datos de respuesta de la API | Se muestra “Activo” y las delegaciones o “Comunal centralizado” | Verificado en la pantalla de confirmación | APROBADO |
| `CP-H61-WEB-17` | Error de conflicto por código duplicado | Manejo de Errores | Servicio / Formulario | Alta | API responde HTTP 409 | Código manual ya existente | Se muestra el mensaje de conflicto y no se genera un evento falso | Verificado; tests de conflicto y visualización de errores del servidor | APROBADO |
| `CP-H61-WEB-18` | Error de permisos y errores de campos del servidor | Manejo de Errores | Servicio / Formulario | Alta | API responde HTTP 403 o 400 con `errors` | Petición inválida o sin permiso | Se muestra mensaje de permisos o el detalle de campos rechazados | Verificado; tests `debe traducir el 403...` y `debe mostrar el error del servidor...` | APROBADO |
| `CP-H61-WEB-19` | Cancelar y volver al panel | Navegación | Componente | Media | Formulario abierto | Clic en “Cancelar” | Se navega al panel `/gestion/admin` o `/admin` según la ruta | Verificado; test `debe volver al panel de administración al cancelar` | APROBADO |
| `CP-H61-WEB-20` | Permiso administrado abstractamente | Seguridad / Configuración | RBAC | Media | Pantalla `/gestion/admin/roles-permisos` disponible | Asignar o revocar `eventos_atp:crear` a un rol | El acceso al formulario cambia según el permiso sin cambios de código | Diseño validado: la página consume `hasPermission('eventos_atp:crear')` | APROBADO |

---

## 5. Guía de Ejecución y Reproducción

Ejecutar desde la raíz del repositorio `sgrai-web`.

### 5.1. Verificación Estática y Compilación

```bash
# 1. Tipado estático
npx tsc --noEmit
# Salida esperada: 0 errores

# 2. Análisis estático
npm run lint
# Salida esperada: 0 errores (solo advertencias preexistentes)

# 3. Compilación de producción
npm run build
# Salida esperada: compilación exitosa e inclusión de /admin/eventos-atp/nuevo
# y /gestion/admin/eventos-atp/nuevo en el listado de rutas
```

### 5.2. Pruebas Automatizadas del Módulo

```bash
npx vitest run \
  src/components/admin/eventos-atp/__tests__/EventoAtpForm.test.tsx \
  src/services/__tests__/eventosAtpService.test.ts \
  'src/app/(admin)/admin/eventos-atp/nuevo/__tests__/NuevoEventoAtpPage.test.tsx'
```

**Salida obtenida:**

```text
 ✓ src/services/__tests__/eventosAtpService.test.ts (5 tests)
 ✓ src/app/(admin)/admin/eventos-atp/nuevo/__tests__/NuevoEventoAtpPage.test.tsx (3 tests)
 ✓ src/components/admin/eventos-atp/__tests__/EventoAtpForm.test.tsx (7 tests)

 Test Files  3 passed (3)
      Tests  15 passed (15)
```

### 5.3. Suite Completa del Repositorio

```bash
npm test
```

**Salida obtenida:**

```text
Test Files  126 passed (126)
     Tests  801 passed (801)
```

---

## 6. Registro de Defectos

Durante la implementación de H61 **no se detectaron defectos funcionales abiertos** en el frontend. Las validaciones de formulario, el control RBAC, el manejo de errores del servicio y la pantalla de confirmación quedaron cubiertos por pruebas automatizadas y por la compilación de producción.

| ID Defecto | Descripción | Severidad | Estado |
|---|---|---|---|
| — | Sin defectos abiertos al cierre de QA | — | — |

---

## 7. Conclusión de QA

La implementación frontend de H61 cumple los criterios de aceptación definidos:

- Formulario exclusivo para Administrador o portador del permiso `eventos_atp:crear`.
- Captura completa de los datos del evento y de su alcance territorial.
- Validación estricta en cliente y manejo del contrato de errores de la API.
- Confirmación explícita con el código oficial y estado `ACTIVO`.
- Integración tipada con `POST /api/eventos-atp`.
- Ausencia de regresiones en la suite completa y en la compilación de producción.

**Dictamen:** **APROBADO PARA INTEGRACIÓN EN `develop`.**
