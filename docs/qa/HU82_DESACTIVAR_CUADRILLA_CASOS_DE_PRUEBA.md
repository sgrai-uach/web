# Informe de Auditoría Forense y Matriz de Casos de Prueba (QA): HU-82 — Desactivar Cuadrilla Operativa (Frontend Web)

> **Documento Oficial de Aseguramiento de Calidad (QA) — Frontend Web**  
> **Proyecto:** Sistema de Gestión de Recursos para Atención de Incidentes (SGRAI) — Dirección de Gestión de Riesgos de Desastres, Municipalidad de Valdivia.  
> **Módulo:** Administración / Cuadrillas Operativas (`/gestion/admin/cuadrillas` y `/admin/cuadrillas`).  
> **Historia de Usuario:** HU-82 — *"Como Administrador Quiero desactivar mediante baja lógica una cuadrilla operativa que haya sido disuelta o retirada de servicio Para evitar que sea asignada a nuevos incidentes, preservando el historial completo de misiones e informes técnicos en los que participó."*  
> **Desarrollador Asignado:** Cristobal  
> **QA Lead / Auditor Técnico:** Antigravity QA Lead — Equipo de Aseguramiento de Calidad SGRAI  
> **Servicio Auditado:** `sgrai-web` (Next.js 16.2.1 App Router + React 19.2.4 + TypeScript 5 + Vitest 3.2.7 + React Testing Library + `openapi-fetch`).  
> **Rama Git Evaluada:** `feature/H82-desactivar-cuadrilla`  
> **Commits Evaluados en la Rama (Conventional Commits sin hash):**  
> * `feat(cuadrillas): implementar baja logica de cuadrillas operativas (HU-82)`  
> * `fix(cuadrillas): simplificar etiqueta del selector de estado a Solo Activas`  
> * `fix(build): corregir firma de apiClient.DELETE para compilacion en CI`  
> * `fix(cuadrillas): compatibilizar parametros y headers de personal con nuevo api-generated`  
>  
> **Fecha de Auditoría QA:** 02/11/2026 12:45.  
> **Estado de Certificación QA:** 🔴 **RECHAZADO EN CODE REVIEW / CHANGES REQUESTED (5 Defectos Reales Detectados)**.

---

## 1. Resumen Ejecutivo de Auditoría Técnica de QA

Tras ejecutar la inspección forense de código fuente, contraste contra el contrato OpenAPI de `sgrai-api` (`DELETE /api/cuadrillas/{id}` y `GET /api/cuadrillas`), verificación de control de acceso basado en roles (RBAC), cumplimiento de la guía arquitectónica `GEMINI.md` y pruebas automatizadas con Vitest, se dictamina el **RECHAZO TEMPORAL (`Changes Requested`)** del Pull Request asociado a la rama `feature/H82-desactivar-cuadrilla`.

En cumplimiento estricto de la **Regla de Oro de QA**, no se ha modificado ningún archivo bajo `src/`. Todos los hallazgos han sido documentados formalmente para su corrección por parte del desarrollador asignado.

| Métrica de Calidad | Resultado de Auditoría | Observaciones |
|---|:---:|---|
| **Total de Casos de Prueba en Matriz** | **20** | 5 Defectos Detectados (`BUG-H82-WEB-01` a `05`) + 15 Casos Funcionales/UI/RBAC/Integración |
| **Casos Aprobados (Passed)** | **15** | Flujos de UI, bloqueo visual en misión, modal, rechazo 409/403/404 y WebSockets |
| **Defectos Abiertos / Fallidos (Failed)** | **5** | **2 Críticos, 2 Altos, 1 Medio** |
| **Casos Bloqueados (Blocked)** | **0** | Sin bloqueos de entorno |
| **Tasa de Aprobación Actual (% Pass)** | **75.0%** | Requiere 100% (0 defectos abiertos) para certificación de merge a `develop` |
| **Suite Automatizada Hu-82 (Vitest)** | **31/31 tests pass (con 1 falso positivo)** | Se detectó aserción muerta en `cuadrillasService.test.ts` (L. 469-476) y ausencia de tests en `CuadrillasAdminClient` |
| **Chequeo de Tipos Estáticos (`npx tsc --noEmit`)** | **0 errores (con bypass `as unknown as`)** | Se omitió regenerar `api-generated.d.ts` forzando casting en `apiClient.DELETE` |
| **Cumplimiento de Regla de Oro de QA** | **100%** | Ningún archivo en `src/` fue editado por QA |

---

## 2. Inspección Forense de Código y Detección de Defectos Reales (Bugs)

### `BUG-H82-WEB-01`: Falso Positivo de Baja Lógica en `cuadrillasService.desactivarCuadrilla` ante Errores HTTP (`401`, `500`) o Caída de Red (Mutación Silenciosa en Memoria)
* **Severidad:** **CRÍTICA** (Violación de Fuente de Verdad en Backend §4 `GEMINI.md` / Corrupción de Estado Operativo).
* **Estado:** `FALLIDO` (`ABIERTO`).
* **Archivo Afectado:** `src/services/cuadrillasService.ts` (Líneas 1119-1147 y 1166-1192).
* **Descripción Técnica del Defecto:**  
  En `cuadrillasService.desactivarCuadrilla(id)`, cuando la petición `DELETE /api/cuadrillas/${id}` retorna cualquier código de error HTTP distinto de `409`, `403` o `404` (por ejemplo: `401 Unauthorized` por expiración de cookie JWT, `400 Bad Request`, `500 Internal Server Error`, `502 Bad Gateway`, o caída del servidor `sgrai-api` capturada en el bloque `catch`), el servicio **no lanza un error**, sino que busca el UUID en el arreglo local `CUADRILLAS_FALLBACK`, muta el registro en memoria y **retorna una respuesta exitosa falsificada**:
  ```typescript
  if (error || (response && !response.ok)) {
    // Fallback para pruebas o sin backend
    const indexFallback = CUADRILLAS_FALLBACK.findIndex((c) => c.id === id);
    if (indexFallback !== -1) {
      const item = CUADRILLAS_FALLBACK[indexFallback];
      ...
      item.activo = false;
      item.estado = 'NO_DISPONIBLE';
      item.eliminadoEn = new Date().toISOString();
      return {
        id: item.id,
        nombre: item.nombre,
        activo: false,
        estado: 'NO_DISPONIBLE',
        recursosDesvinculados: item.recursos?.length || 0,
        trabajadoresDesvinculados: item.trabajadores?.length || 0,
        delegadoRevertido: true,
        eliminadoEn: item.eliminadoEn,
        eliminadoPorId: '00000000-0000-4000-8000-000000000001',
      };
    }
  ```
  El mismo bloque se repite en `catch (err: unknown)` (líneas 1166-1192). Dado que los UUIDs de las cuadrillas semilla en PostgreSQL (`50000000-0000-4000-8000-000000000001` y `...0003`) son idénticos a los de `CUADRILLAS_FALLBACK`, si la sesión del Administrador expiró (`401`) o la base de datos falla (`500`), **la interfaz muestra el Toast verde `"Cuadrilla Desactivada"` y remueve la cuadrilla de la tabla, engañando al Administrador mientras en PostgreSQL la cuadrilla continúa activa (`activo = true`) y su dotación sigue bloqueada**.
* **Pasos para Reproducir:**
  1. Iniciar sesión o abrir `/gestion/admin/cuadrillas` con el backend detenido o con un token expirado (respuesta `401 Unauthorized` o `500 Internal Server Error` en `DELETE /api/cuadrillas/50000000-0000-4000-8000-000000000001`).
  2. Hacer clic en **"Desactivar"** sobre `"Cuadrilla Vías y Despeje Urbano"` y confirmar en el modal.
* **Comportamiento Actual:** El servicio resuelve exitosamente simulando la baja en memoria; se despliega el Toast verde de éxito y la fila desaparece de la tabla, aunque el backend rechazó la operación.
* **Comportamiento Esperado:** En operaciones transaccionales de escritura/baja (`DELETE`), `sgrai-api` es la única fuente de verdad (`GEMINI.md` §4). Si la API responde `401`, `500` o hay error de red, el servicio debe lanzar `CuadrillaServiceError` para que la UI muestre el Toast rojo `"No se pudo desactivar"` y mantenga el modal o el estado intacto sin falsos positivos.
* **Sugerencia Técnica de Solución:**  
  Eliminar el bloque de mutación de `CUADRILLAS_FALLBACK` ante errores HTTP (`!response.ok`) y agregar el manejo explícito de `401 Unauthorized` lanzando `CuadrillaServiceError('Su sesión ha expirado o no está autenticado. Inicie sesión nuevamente.', 401, 'general', 'NO_AUTENTICADO')`.

---

### `BUG-H82-WEB-02`: Discrepancia de Contrato en Filtro de Estado (`estado=INACTIVAS` y `estado=TODAS`) que Provoca Rechazo `HTTP 400 Bad Request` en `GET /api/cuadrillas`
* **Severidad:** **CRÍTICA** (Ruptura de Contrato OpenAPI / Imposibilidad de Auditar Bajas Lógicas Reales en Backend).
* **Estado:** `FALLIDO` (`ABIERTO`).
* **Archivo Afectado:** `src/components/admin/cuadrillas/CuadrillasFiltros.tsx` (Líneas 164-169) y `src/services/cuadrillasService.ts` (Líneas 737-774).
* **Descripción Técnica del Defecto:**  
  En `CuadrillasFiltros.tsx` (líneas 164-169), el selector de estado incorpora las opciones:
  ```tsx
  <option value="">Solo Activas</option>
  <option value="DISPONIBLE">Disponibles</option>
  <option value="EN_MISION">En Misión (Terreno)</option>
  <option value="INACTIVAS">Inactivas (Dadas de baja)</option>
  <option value="TODAS">Todas las cuadrillas</option>
  ```
  Y `cuadrillasService.obtenerCuadrillas` despacha ese valor directamente en el query string: `GET /api/cuadrillas?pagina=1&limite=10&estado=INACTIVAS` o `estado=TODAS` (línea 752).  
  Sin embargo, en `sgrai-api` (`src/modules/recursos-y-personal/cuadrilla.schema.ts`), `ListarCuadrillasQuerySchema` valida el parámetro `estado` estrictamente contra `EstadoCuadrillaSchema = z.enum(["DISPONIBLE", "EN_MISION", "NO_DISPONIBLE"])`.  
  Al enviar `estado=INACTIVAS` o `estado=TODAS`, **`sgrai-api` responde con `HTTP 400 Bad Request` (`"Parámetros de consulta inválidos"`).** Debido a que `obtenerCuadrillas` atrapa silenciosamente la respuesta no-OK y retorna `CUADRILLAS_FALLBACK` (línea 775), la tabla sustituye los datos reales de PostgreSQL por datos ficticios en memoria local.
* **Pasos para Reproducir:**
  1. Con `sgrai-api` en ejecución, abrir `/gestion/admin/cuadrillas` y seleccionar en el filtro de Estado la opción **"Inactivas (Dadas de baja)"** o **"Todas las cuadrillas"**.
  2. Inspeccionar la pestaña Network o ejecutar `curl -i "http://localhost:3001/api/cuadrillas?pagina=1&limite=10&estado=INACTIVAS"`.
* **Comportamiento Actual:** El backend rechaza la petición con `HTTP 400 Bad Request` y el frontend cae silenciosamente a los datos hardcodeados en `CUADRILLAS_FALLBACK`.
* **Comportamiento Esperado:** El frontend debe enviar únicamente valores válidos del contrato (`estado=DISPONIBLE`, `estado=EN_MISION`, `estado=NO_DISPONIBLE` o parámetro booleano acordado con `sgrai-api` como `incluirInactivas=true`), sin enviar strings fuera del enum Zod (`INACTIVAS` / `TODAS`) que disparen un `400 Bad Request`.
* **Sugerencia Técnica de Solución:**  
  En `cuadrillasService.obtenerCuadrillas`, mapear `estado === 'INACTIVAS'` a `estado: 'NO_DISPONIBLE'` (y `incluirInactivas: true` en coordinación con `sgrai-api`), y cuando `estado === 'TODAS'`, no enviar el query param `estado` (enviando `incluirInactivas: true`), evitando que Zod rechace la consulta con `400 Bad Request`.

---

### `BUG-H82-WEB-03`: Brecha de Seguridad RBAC en `CuadrillasAdminClient` — Ausencia de Guardia Perimetral `AccesoDenegadoState` (403) y Concesión Indebida de Baja por Permiso `recursos:eliminar`
* **Severidad:** **ALTA** (Seguridad / Control de Acceso Basado en Roles RBAC).
* **Estado:** `FALLIDO` (`ABIERTO`).
* **Archivo Afectado:** `src/components/admin/cuadrillas/CuadrillasAdminClient.tsx` (Líneas 24-37).
* **Descripción Técnica del Defecto:**  
  Se identificaron dos vulnerabilidades RBAC en el componente cliente principal de la vista `/gestion/admin/cuadrillas`:
  1. **Ausencia de Bloqueo Perimetral (`AccesoDenegadoState`):** A diferencia de `NuevaCuadrillaClient.tsx` (líneas 29-62) y de todas las demás vistas de administración (`/admin/empleados`, `/admin/recursos`, `/admin/puntos-criticos`, `/admin/roles-permisos`), `CuadrillasAdminClient.tsx` **no verifica que el usuario posea el permiso de lectura del módulo (`recursos:leer` / `recursos:gestionar` o rol `Administrador`)**. Si un usuario con rol `Call Center` o `Asistente Social` navega por URL directa a `/gestion/admin/cuadrillas`, el componente se renderiza completo y, cuando la API rechaza `GET /api/cuadrillas` con `403 Forbidden`, `obtenerCuadrillas` carga `CUADRILLAS_FALLBACK` exponiendo el listado, RUTs de personal y detalle de dotación a un rol no autorizado.
  2. **Permiso Incorrecto Habilitando el Botón Destructivo:** En las líneas 30-36 se define:
     ```typescript
     const puedeEliminar = Boolean(
       isMounted &&
         (hasPermission('cuadrillas:eliminar') ||
           hasPermission('recursos:eliminar') ||
           usuarioActivo?.rol === 'Administrador' ||
           usuarioActivo?.esAdmin)
     );
     ```
     El endpoint `DELETE /api/cuadrillas/{id}` en `sgrai-api` (`cuadrilla.service.ts` línea 416) exige estrictamente el permiso `cuadrillas:eliminar` (o rol `ADMIN`). Incluir `hasPermission('recursos:eliminar')` provoca que un usuario con permiso para dar de baja insumos de bodega (`recursos:eliminar`), pero sin autorización para disolver cuadrillas (`cuadrillas:eliminar`), vea el botón **"Desactivar"** habilitado en la tabla y en el drawer, recibiendo un error `403 Forbidden` al confirmar.
* **Pasos para Reproducir:**
  1. Cambiar la sesión simulada al perfil `Call Center` o `Asistente Social` e ingresar a `/gestion/admin/cuadrillas`. Observar que no se bloquea la vista con `AccesoDenegadoState`.
  2. Configurar un perfil con permiso `recursos:eliminar` (sin `cuadrillas:eliminar` ni rol `Administrador`). Observar que el botón `"Desactivar"` aparece habilitado.
* **Comportamiento Actual:** Roles sin permiso de lectura acceden a la tabla de cuadrillas; roles con `recursos:eliminar` ven habilitada la acción de desactivar cuadrillas.
* **Comportamiento Esperado:** Si el usuario no posee `recursos:leer` (ni `esAdmin`), `CuadrillasAdminClient` debe renderizar `<AccesoDenegadoState permisoRequerido="recursos:leer" ... />`. Asimismo, `puedeEliminar` debe evaluar únicamente `hasPermission('cuadrillas:eliminar') || usuarioActivo?.rol === 'Administrador' || usuarioActivo?.esAdmin`.
* **Sugerencia Técnica de Solución:**  
  1. Remover `hasPermission('recursos:eliminar')` de `puedeEliminar`.  
  2. Agregar `const puedeLeer = Boolean(isMounted && (hasPermission('recursos:leer') || usuarioActivo?.rol === 'Administrador' || usuarioActivo?.esAdmin));` y retornar `<AccesoDenegadoState />` cuando `isMounted && !puedeLeer`.

---

### `BUG-H82-WEB-04`: Violación de Regla §4 de `GEMINI.md` (Casting `as unknown as` sobre `apiClient.DELETE` sinContrato en `api-generated.d.ts`) y Aserción Muerta (Falso Positivo) en Test Unitario de `409 Conflict`
* **Severidad:** **ALTA** (Estándar Arquitectónico OpenAPI / Fiabilidad de Suite de Pruebas QA).
* **Estado:** `FALLIDO` (`ABIERTO`).
* **Archivo Afectado:** `src/services/cuadrillasService.ts` (Líneas 1069-1074), `src/types/api-generated.d.ts` y `src/services/__tests__/cuadrillasService.test.ts` (Líneas 455-477).
* **Descripción Técnica del Defecto:**  
  1. **Bypass del Contrato Tipado OpenAPI:** La sección §4 de `GEMINI.md` prohíbe escribir a mano los tipos de request/response de la API o forzar el cliente tipado con castings cuando un endpoint no está en `api-generated.d.ts`. En `src/services/cuadrillasService.ts` (líneas 1069-1074, introducido en commit `c45d0ac`), se evadió el chequeo de tipos de `openapi-fetch` mediante:
     ```typescript
     const { data, error, response } = await (
       apiClient.DELETE as unknown as (
         url: string,
         opts?: unknown
       ) => Promise<{ data?: unknown; error?: unknown; response?: Response }>
     )(`/api/cuadrillas/${id}`);
     ```
     Además, tampoco se adjunta explícitamente la cabecera `authorization: getAuthorizationHeader()` que sí fue agregada en `obtenerPersonalOperativoDisponible` en el commit `c0cca9a`.
  2. **Falso Positivo en Prueba Unitaria de `409 Conflict`:** En `src/services/__tests__/cuadrillasService.test.ts` (líneas 455-477), el test `'debe lanzar CuadrillaServiceError con código CUADRILLA_EN_MISION ante 409 Conflict'` configura `vi.spyOn(apiClient, 'DELETE').mockResolvedValueOnce(...)` (válido para **una sola llamada**), pero invoca `cuadrillasService.desactivarCuadrilla(mockCuadrillaId)` **dos veces**:
     ```typescript
     // 1ª llamada: consume el mockResolvedValueOnce(409)
     await expect(cuadrillasService.desactivarCuadrilla(mockCuadrillaId)).rejects.toThrowError(
       CuadrillaServiceError
     );

     // 2ª llamada: ya NO tiene mock; cae al fallback donde mockCuadrillaId fue mutada a NO_DISPONIBLE
     // en el test anterior (L. 445), por lo que RESUELVE SIN LANZAR ERROR y nunca entra al catch!
     try {
       await cuadrillasService.desactivarCuadrilla(mockCuadrillaId);
     } catch (err: unknown) {
       const error = err as CuadrillaServiceError;
       expect(error.status).toBe(409);
       expect(error.codigo).toBe('CUADRILLA_EN_MISION');
       expect(error.message).toContain('misiones activas');
     }
     ```
     Debido a la ausencia de `expect.fail()` / `expect.unreachable()` al final del bloque `try`, la segunda llamada resuelve silenciosamente desde `CUADRILLAS_FALLBACK` y **las 3 aserciones del bloque `catch` (`status === 409`, `codigo === 'CUADRILLA_EN_MISION'`, `message`) jamás se ejecutan**.
* **Pasos para Reproducir:**
  1. Inspeccionar `src/services/__tests__/cuadrillasService.test.ts` líneas 455-477. Si se agrega `expect.unreachable('Debió lanzar 409')` en la línea 471, el test falla inmediatamente.
  2. Buscar `/api/cuadrillas` en `src/types/api-generated.d.ts` (0 coincidencias).
* **Comportamiento Actual:** El test unitario de `409 Conflict` omite silenciosamente las aserciones de `status` y `codigo`, y `apiClient.DELETE` utiliza `as unknown as`.
* **Comportamiento Esperado:** El test debe usar `mockResolvedValue` (o realizar una única llamada dentro del `try` acompañada de `expect.unreachable()`) y restaurar el estado de `CUADRILLAS_FALLBACK` en `beforeEach`. Asimismo, `api-generated.d.ts` debe incluir los paths de `/api/cuadrillas` y `/api/cuadrillas/{id}`.
* **Sugerencia Técnica de Solución:**  
  En `cuadrillasService.test.ts` (L. 456), cambiar `mockResolvedValueOnce` por `mockResolvedValue` (o eliminar la llamada duplicada de la línea 465 y añadir `expect.unreachable('Debería haber lanzado CuadrillaServiceError')` tras la línea 470, igual que en la línea 64 del mismo archivo).

---

### `BUG-H82-WEB-05`: Inconsistencia de Estado Local Post-Baja en Vista `"TODAS"` (Dotación No Desvinculada en UI) y Omisión de `eliminadoEn` en `CuadrillaDetalleDrawer`
* **Severidad:** **MEDIA** (Consistencia de Datos en UI CA-5 / Trazabilidad de Auditoría §3.7).
* **Estado:** `FALLIDO` (`ABIERTO`).
* **Archivo Afectado:** `src/components/admin/cuadrillas/CuadrillasAdminClient.tsx` (Líneas 118-127), `src/services/cuadrillasService.ts` (Líneas 1080-1085) y `src/components/admin/cuadrillas/CuadrillaDetalleDrawer.tsx` (Líneas 346-370).
* **Descripción Técnica del Defecto:**  
  1. **Dotación retenida en memoria local tras desactivar:** En `CuadrillasAdminClient.tsx` (líneas 120-127), cuando el usuario desactiva una cuadrilla teniendo activo el filtro `"TODAS"` (o `"INACTIVAS"`), el estado local de la fila se actualiza así:
     ```typescript
     actualizarCuadrillaEnLista({
       ...cuadrillaADesactivar,
       activo: false,
       estado: 'NO_DISPONIBLE',
       eliminadoEn: res.eliminadoEn,
     });
     ```
     Al hacer spread de `...cuadrillaADesactivar` sin limpiar `recursos: []`, `trabajadores: []`, `totalRecursos: 0` ni `totalTrabajadores: 0`, **la fila en `CuadrillasTabla` continúa mostrando que la cuadrilla disuelta tiene `2 operarios` y `2 recursos` asignados**, contradiciendo directamente el Criterio de Aceptación 5 (*"Los recursos asociados en `cuadrilla_recurso` deben quedar desvinculados"*) y el mensaje del Toast recién emitido (*"Se desvincularon 2 recursos y 2 trabajadores"*). Lo mismo ocurre al mutar `CUADRILLAS_FALLBACK[indexFallback]` en `cuadrillasService.ts` (líneas 1081-1085).
  2. **Omisión de `eliminadoEn` en el Drawer de Detalle:** En `CuadrillaDetalleDrawer.tsx` (líneas 346-370), el bloque de **Metadatos de Auditoría** solo muestra `Creado:` y `Última actualización:`, omitiendo la fecha/hora de baja lógica (`eliminadoEn`) cuando se consulta una cuadrilla desactivada, pese a que la nota de la HU exige cumplir la Regla Crítica §3.7 de borrado lógico y auditoría inmutable.
* **Pasos para Reproducir:**
  1. En `/gestion/admin/cuadrillas`, seleccionar el filtro **"Todas las cuadrillas"**.
  2. Desactivar `"Cuadrilla Vías y Despeje Urbano"` (que posee 2 operarios y 2 recursos).
  3. Observar la fila actualizada con badge `"NO DISPONIBLE"` en la tabla y abrir su **"Detalle"**.
* **Comportamiento Actual:** La columna **Dotación** sigue mostrando `2 operarios` y `2 recursos`, y el drawer sigue listando la Camioneta 4x4, las Motosierras y los trabajadores como asignados, sin mostrar la marca temporal `Eliminado / Dado de baja:`.
* **Comportamiento Esperado:** Al actualizar la cuadrilla desactivada en el estado local, `recursos` y `trabajadores` deben vaciarse (`[]`) y sus contadores pasar a `0`. En `CuadrillaDetalleDrawer`, si `cuadrilla.eliminadoEn` existe, debe exhibirse en los metadatos de auditoría.
* **Sugerencia Técnica de Solución:**  
  En `CuadrillasAdminClient.tsx` (L. 121):
  ```typescript
  actualizarCuadrillaEnLista({
    ...cuadrillaADesactivar,
    activo: false,
    estado: 'NO_DISPONIBLE',
    recursos: [],
    trabajadores: [],
    totalRecursos: 0,
    totalTrabajadores: 0,
    eliminadoEn: res.eliminadoEn,
  });
  ```
  Y en `CuadrillaDetalleDrawer.tsx` (L. 368), renderizar `cuadrilla.eliminadoEn` cuando esté presente.

---

## 3. Mensaje Formal de Code Review para Rechazar el Pull Request (Request Changes)

> Copia y pega el siguiente bloque Markdown directamente en la revisión del Pull Request en GitHub seleccionando la opción **`Request changes`**:

```markdown
## 🔴 QA Code Review — Changes Requested: HU-82 (Desactivar Cuadrilla Operativa - Frontend Web)

Hola @Cristobal,

He completado la auditoría forense de código, validación de contrato OpenAPI contra `sgrai-api`, pruebas de seguridad RBAC y ejecución de la suite automatizada en Vitest para la rama `feature/H82-desactivar-cuadrilla`.

El flujo visual principal (botón destructivo en `CuadrillasTabla` y `CuadrillaDetalleDrawer`, modal de confirmación `CuadrillaDesactivarModal` con bloqueo preventivo cuando la unidad está `EN_MISION` y suscripción Socket.io `cuadrilla:desactivada`) está bien estructurado y respeta la paleta institucional de `GEMINI.md`. Sin embargo, se detectaron **5 defectos reales (2 Críticos, 2 Altos y 1 Medio)** que deben subsanarse antes de aprobar el merge a `develop`:

---

### 🚨 1. `BUG-H82-WEB-01` (Severidad: CRÍTICA) — Falso positivo de desactivación cuando la API falla (`401`, `500` o caída de red)
* **Archivo afectado:** `src/services/cuadrillasService.ts` (Líneas 1119-1147 y 1166-1192).
* **Pasos para reproducir:**
  1. Con el backend detenido o con un token JWT expirado (respuesta `401 Unauthorized` o `500 Internal Server Error`), intentar desactivar la cuadrilla semilla `50000000-0000-4000-8000-000000000001`.
* **Comportamiento actual:** En lugar de lanzar un error, el bloque `if (error || (response && !response.ok))` y el bloque `catch` buscan el UUID en `CUADRILLAS_FALLBACK`, lo marcan como `activo = false` en memoria y **retornan un objeto de éxito simulado**. Esto hace que `CuadrillasAdminClient` muestre el Toast verde *"Cuadrilla Desactivada"* y elimine la fila de la pantalla, mientras que en PostgreSQL la cuadrilla jamás fue desactivada.
* **Comportamiento esperado:** En operaciones de mutación (`DELETE`), `sgrai-api` es la única fuente de verdad (`GEMINI.md` §4). Si la petición falla con `401`, `500` o error de red, debe lanzarse `CuadrillaServiceError` para mostrar el Toast de error y no engañar al Administrador.
* **Sugerencia técnica:** Eliminar el fallback mutativo dentro de `desactivarCuadrilla`, manejar explícitamente `response.status === 401` lanzando `CuadrillaServiceError('Sesión expirada o no autenticada.', 401, 'general', 'NO_AUTENTICADO')` y propagar el error ante cualquier `!response.ok`.

---

### 🚨 2. `BUG-H82-WEB-02` (Severidad: CRÍTICA) — Rechazo `HTTP 400 Bad Request` al filtrar por `estado=INACTIVAS` o `estado=TODAS` en `GET /api/cuadrillas`
* **Archivos afectados:** `src/components/admin/cuadrillas/CuadrillasFiltros.tsx` (Líneas 164-169) y `src/services/cuadrillasService.ts` (Líneas 737-774).
* **Pasos para reproducir:**
  1. Seleccionar en el filtro de estado la opción *"Inactivas (Dadas de baja)"* (`value="INACTIVAS"`) o *"Todas las cuadrillas"* (`value="TODAS"`).
  2. Observar la petición `GET /api/cuadrillas?pagina=1&limite=10&estado=INACTIVAS` hacia `sgrai-api`.
* **Comportamiento actual:** En `sgrai-api` (`ListarCuadrillasQuerySchema` en `cuadrilla.schema.ts`), el query param `estado` solo acepta el enum `["DISPONIBLE", "EN_MISION", "NO_DISPONIBLE"]`. Al recibir `estado=INACTIVAS` o `estado=TODAS`, el backend responde `400 Bad Request ("Parámetros de consulta inválidos")` y `obtenerCuadrillas` cae silenciosamente a `CUADRILLAS_FALLBACK`.
* **Comportamiento esperado:** Mapear los valores de filtro en `cuadrillasService.obtenerCuadrillas` para no enviar valores fuera del contrato Zod del backend (enviar `estado: 'NO_DISPONIBLE'` cuando el filtro sea `INACTIVAS`, y omitir `estado` cuando sea `TODAS`, coordinando con `sgrai-api` el soporte de `incluirInactivas`).
* **Sugerencia técnica:** En `cuadrillasService.ts` (L. 737), normalizar el query param antes de invocar `apiClient.GET('/api/cuadrillas', ...)`:
  ```typescript
  const estadoQuery =
    estado === 'INACTIVAS'
      ? 'NO_DISPONIBLE'
      : estado === 'TODAS' || estado === 'ACTIVAS'
      ? undefined
      : estado;
  ```

---

### ⚠️ 3. `BUG-H82-WEB-03` (Severidad: ALTA) — Brecha RBAC: Falta de bloqueo perimetral `AccesoDenegadoState` y permiso `recursos:eliminar` habilitando baja de cuadrillas
* **Archivo afectado:** `src/components/admin/cuadrillas/CuadrillasAdminClient.tsx` (Líneas 24-37).
* **Pasos para reproducir:**
  1. Ingresar a `/gestion/admin/cuadrillas` con el perfil simulado `Call Center` o `Asistente Social`.
  2. Configurar un usuario con permiso `recursos:eliminar` pero sin `cuadrillas:eliminar`.
* **Comportamiento actual:**
  1. No se valida el permiso de lectura del módulo (`recursos:leer`), permitiendo que perfiles sin acceso (como `Call Center`) visualicen la tabla completa de cuadrillas y dotación.
  2. `puedeEliminar` evalúa `hasPermission('cuadrillas:eliminar') || hasPermission('recursos:eliminar')` (L. 32-33). El backend (`desactivarCuadrilla` en `sgrai-api`) exige exclusivamente `cuadrillas:eliminar` o rol `Administrador`, por lo que un usuario que solo tenga `recursos:eliminar` verá el botón *"Desactivar"* habilitado y recibirá `403 Forbidden` al confirmar.
* **Comportamiento esperado:** Bloquear la vista renderizando `<AccesoDenegadoState />` (igual que en `NuevaCuadrillaClient.tsx` y `/admin/recursos`) si el usuario carece de `recursos:leer`, y restringir `puedeEliminar` exclusivamente a `hasPermission('cuadrillas:eliminar') || usuarioActivo?.rol === 'Administrador' || usuarioActivo?.esAdmin`.

---

### ⚠️ 4. `BUG-H82-WEB-04` (Severidad: ALTA) — Bypass de tipos OpenAPI (`as unknown as` en `apiClient.DELETE`) y falso positivo en test unitario de `409 Conflict`
* **Archivos afectados:** `src/services/cuadrillasService.ts` (Líneas 1069-1074), `src/types/api-generated.d.ts` y `src/services/__tests__/cuadrillasService.test.ts` (Líneas 455-477).
* **Pasos para reproducir:**
  1. Revisar `src/services/__tests__/cuadrillasService.test.ts` líneas 455-477 (`'debe lanzar CuadrillaServiceError con código CUADRILLA_EN_MISION ante 409 Conflict'`).
  2. Agregar `expect.unreachable('Debería haber lanzado 409');` después de la línea 470 y ejecutar `npx vitest run src/services/__tests__/cuadrillasService.test.ts`.
* **Comportamiento actual:**
  1. En el test de `409 Conflict`, se usa `mockResolvedValueOnce` (1 solo uso) pero se llama dos veces a `desactivarCuadrilla(mockCuadrillaId)` (líneas 465 y 470). La segunda llamada dentro del `try/catch` ya no tiene mock, cae al fallback en memoria (donde `mockCuadrillaId` fue mutada a `NO_DISPONIBLE` en el test de la línea 423), **resuelve sin lanzar error y salta por completo el bloque `catch`**, dejando sin ejecutar las aserciones `expect(error.status).toBe(409)` y `expect(error.codigo).toBe('CUADRILLA_EN_MISION')`.
  2. En `cuadrillasService.ts` (L. 1070) se forzó `apiClient.DELETE as unknown as ...` sin regenerar `src/types/api-generated.d.ts` ni pasar la cabecera `authorization: getAuthorizationHeader()`.
* **Comportamiento esperado:** Regenerar `src/types/api-generated.d.ts` desde el spec OpenAPI de `sgrai-api` y corregir el test unitario usando `mockResolvedValue` (o una única llamada con `expect.unreachable()`).

---

### 🔸 5. `BUG-H82-WEB-05` (Severidad: MEDIA) — Dotación no desvinculada en estado local al desactivar bajo filtro `"TODAS"` y omisión de `eliminadoEn` en `CuadrillaDetalleDrawer`
* **Archivos afectados:** `src/components/admin/cuadrillas/CuadrillasAdminClient.tsx` (Líneas 120-127) y `src/components/admin/cuadrillas/CuadrillaDetalleDrawer.tsx` (Líneas 346-370).
* **Pasos para reproducir:**
  1. Filtrar por *"Todas las cuadrillas"* y desactivar una cuadrilla con recursos y trabajadores asignados.
  2. Observar la columna *Dotación* de la cuadrilla recién desactivada y abrir su drawer de *Detalle*.
* **Comportamiento actual:** `actualizarCuadrillaEnLista` conserva `recursos` y `trabajadores` del objeto previo (`...cuadrillaADesactivar`), mostrando aún `2 operarios` y `2 recursos` asignados tras la baja, y el drawer no muestra la fecha de baja lógica `eliminadoEn`.
* **Comportamiento esperado:** Limpiar `recursos: []`, `trabajadores: []`, `totalRecursos: 0`, `totalTrabajadores: 0` en el estado local tras la desactivación, y mostrar `Eliminado / Dado de baja: {new Date(cuadrilla.eliminadoEn).toLocaleString('es-CL')}` en el bloque de auditoría de `CuadrillaDetalleDrawer.tsx`.

---

Quedo atento a las correcciones para ejecutar el **Re-Test formal** y proceder con la aprobación del PR. ¡Buen trabajo con el diseño del modal y la integración de WebSockets!
```

---

## 4. Matriz Consolidada de Casos de Prueba (13 Columnas Institucionales)

*(Nota de cumplimiento estricto: Los 5 defectos detectados se listan al inicio con estado `FALLIDO`, fecha de re-test `(Pendiente)` y columna `Solución / Commit` en `Pendiente (Rechazado en Code Review)`. En los casos aprobados, la columna `Solución / Commit` contiene ÚNICAMENTE mensajes en Conventional Commits sin ningún hash hexadecimal).*

| ID Caso | Título del Caso de Prueba | Tipo de Prueba | Nivel | Prioridad | Precondición | Datos de Prueba (Payload / Headers / Query) | Resultado Esperado | Resultado Obtenido | Estado | Fecha / Hora Ejecución | Fecha / Hora Re-Test | Solución / Commit |
|---|---|---|---|---|---|---|---|---|:---:|:---:|:---:|---|
| `BUG-H82-WEB-01` | Falso positivo de desactivación cuando la API responde 401/500 o sufre caída de red mutando fallback en memoria | Defecto / Integridad | Servicio / DAL | Crítica | Sesión expirada (401) o caída de sgrai-api al desactivar cuadrilla semilla | `DELETE /api/cuadrillas/50000000-0000-4000-8000-000000000001` retornando HTTP 401 o HTTP 500 | Lanzamiento de CuadrillaServiceError y despliegue de Toast rojo de error sin alterar la tabla activa | El servicio captura el fallo, muta CUADRILLAS_FALLBACK en memoria y retorna éxito falso mostrando Toast verde | FALLIDO | 02/11/2026 12:45 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| `BUG-H82-WEB-02` | Discrepancia de contrato en filtro de estado (INACTIVAS y TODAS) provocando HTTP 400 Bad Request en GET /api/cuadrillas | Defecto / Contrato API | UI / Servicio | Crítica | Selector de estado en CuadrillasFiltros cambiado a Inactivas o Todas | `GET /api/cuadrillas?pagina=1&limite=10&estado=INACTIVAS` y `GET /api/cuadrillas?pagina=1&limite=10&estado=TODAS` | Consulta compatible con enum Zod del backend (DISPONIBLE, EN_MISION, NO_DISPONIBLE) retornando HTTP 200 OK | Backend rechaza con HTTP 400 Bad Request por valor fuera de enum y frontend cae silenciosamente a datos de fallback | FALLIDO | 02/11/2026 12:48 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| `BUG-H82-WEB-03` | Brecha de seguridad RBAC: Ausencia de bloqueo perimetral AccesoDenegadoState y concesión indebida por recursos:eliminar | Defecto / Seguridad RBAC | Vista / Cliente | Alta | Usuario con rol Call Center o usuario con permiso recursos:eliminar sin cuadrillas:eliminar | Navegación directa a `/gestion/admin/cuadrillas` con sesión sin `recursos:leer` o sin `cuadrillas:eliminar` | Bloqueo perimetral con AccesoDenegadoState (403) y acción Desactivar restringida solo a cuadrillas:eliminar o Admin | Vista expone tabla de fallback a roles no autorizados y habilita botón Desactivar a portadores de recursos:eliminar | FALLIDO | 02/11/2026 12:50 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| `BUG-H82-WEB-04` | Bypass de contrato OpenAPI (as unknown as en apiClient.DELETE) y aserción muerta en test unitario de 409 Conflict | Defecto / QA & Tipos | Servicio / Unit Test | Alta | Suite Vitest ejecutando cuadrillasService.test.ts y chequeo de tipos OpenAPI | Doble llamada a `desactivarCuadrilla(mockCuadrillaId)` con un único `mockResolvedValueOnce` de HTTP 409 | Tipado generado en api-generated.d.ts y ejecución real de aserciones status 409 y código CUADRILLA_EN_MISION en test | Segunda llamada en test resuelve desde fallback saltándose el bloque catch sin ejecutar los expect de código y status | FALLIDO | 02/11/2026 12:52 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| `BUG-H82-WEB-05` | Dotación no limpiada en estado local tras desactivar bajo filtro TODAS y omisión de eliminadoEn en Drawer de Detalle | Defecto / UI & Auditoría | Componente / Estado | Media | Filtro Estado en TODAS y cuadrilla con 2 recursos y 2 trabajadores | Confirmar baja de cuadrilla `50000000-0000-4000-8000-000000000001` y abrir `CuadrillaDetalleDrawer` | Contadores de dotación en 0 tras desvinculación y visualización de fecha eliminadoEn en metadatos del drawer | La fila inactiva y el drawer continúan mostrando 2 operarios y 2 recursos asignados y se omite fecha eliminadoEn | FALLIDO | 02/11/2026 12:55 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| `CP-H82-WEB-01` | Visibilidad y habilitación del botón Desactivar para perfil Administrador en tabla y drawer (CA-1) | Funcional / RBAC | UI / Componente | Alta | Sesión activa con rol Administrador o permiso `cuadrillas:eliminar` | Renderizado de `CuadrillasTabla` y `CuadrillaDetalleDrawer` con cuadrilla en estado `DISPONIBLE` | El botón destructivo "Desactivar" con ícono Trash2 se muestra visible y habilitado en tabla y pie de drawer | Botón renderizado con variante destructive, bordes rectos (--radius-none) e ícono vectorial Lucide Trash2 | APROBADO | 02/11/2026 12:58 | - | feat(cuadrillas): implementar baja logica de cuadrillas operativas (HU-82) |
| `CP-H82-WEB-02` | Ocultamiento del botón Desactivar cuando puedeEliminar es false para perfiles operativos (CA-1) | Seguridad / RBAC | UI / Componente | Crítica | Prop `puedeEliminar={false}` (perfil sin permisos de baja) | Renderizado de `CuadrillasTabla` con `puedeEliminar={false}` | La columna de acciones no renderiza el botón "Desactivar" en ninguna fila de la tabla | El selector `queryByRole('button', { name: /desactivar/i })` retorna `null` cumpliendo ocultamiento RBAC | APROBADO | 02/11/2026 13:00 | - | feat(cuadrillas): implementar baja logica de cuadrillas operativas (HU-82) |
| `CP-H82-WEB-03` | Apertura del modal de confirmación explicitando dotación a desvincular y reversión de delegado (CA-2, CA-5) | Funcional / UX | UI / Modal | Alta | Cuadrilla activa `DISPONIBLE` con 1 recurso y 1 trabajador | Clic en botón "Desactivar" abriendo `CuadrillaDesactivarModal` | Modal exhibe nombre de cuadrilla, delegación base, conteo de recursos/trabajadores a liberar y aviso de historial | Modal renderiza "Confirmar Desactivación de Cuadrilla", detalle de consecuencias y botón "Sí, desactivar cuadrilla" | APROBADO | 02/11/2026 13:02 | - | feat(cuadrillas): implementar baja logica de cuadrillas operativas (HU-82) |
| `CP-H82-WEB-04` | Cancelación de la baja lógica desde el modal sin ejecutar peticiones DELETE (CA-2) | Funcional / UX | UI / Modal | Media | `CuadrillaDesactivarModal` abierto para cuadrilla disponible | Clic en botón "Cancelar" o pulsación de tecla `Escape` | Se invoca `onCancelar`, el modal se cierra y no se dispara llamada HTTP `DELETE /api/cuadrillas/{id}` | Callback `onCancelar` ejecutado 1 vez sin invocación a `onConfirmar` ni mutación de estado | APROBADO | 02/11/2026 13:04 | - | feat(cuadrillas): implementar baja logica de cuadrillas operativas (HU-82) |
| `CP-H82-WEB-05` | Bloqueo visual de estado cargando (Desactivando...) durante petición en vuelo (CA-2) | Robustez / UX | UI / Modal | Media | Confirmación de baja en curso (`desactivando={true}`) | Renderizado de `CuadrillaDesactivarModal` con prop `desactivando={true}` | El botón de confirmación cambia su etiqueta a "Desactivando..." y ambos botones quedan en estado `disabled` | Botones deshabilitados previniendo envíos duplicados por doble clic durante la transacción | APROBADO | 02/11/2026 13:06 | - | feat(cuadrillas): implementar baja logica de cuadrillas operativas (HU-82) |
| `CP-H82-WEB-06` | Bloqueo preventivo en tabla y modal cuando la cuadrilla se encuentra EN_MISION (CA-3) | Regla de Negocio / ICS | UI / Componente | Crítica | Cuadrilla con `estado: "EN_MISION"`, `"EN_TRANSITO"` o `"EN_OPERACION"` | Renderizado de `CuadrillasTabla` y `CuadrillaDesactivarModal` con cuadrilla en faena activa | Botón Desactivar en tabla aparece `disabled`; modal muestra alerta ámbar "Acción Bloqueada" y oculta botón confirmar | Botón bloqueado con tooltip explicativo y modal exhibe alerta rol="alert" presentando únicamente el botón "Cerrar" | APROBADO | 02/11/2026 13:08 | - | feat(cuadrillas): implementar baja logica de cuadrillas operativas (HU-82) |
| `CP-H82-WEB-07` | Desactivación exitosa (HTTP 200 OK) procesando baja lógica y conteo de dotación liberada (CA-4, CA-5) | Integración / DAL | Servicio / API | Crítica | Cuadrilla activa sin misiones en curso (`50000000-0000-4000-8000-000000000001`) | `DELETE /api/cuadrillas/50000000-0000-4000-8000-000000000001` con `Authorization: Bearer <token>` | API responde 200 OK con `{ activo: false, estado: "NO_DISPONIBLE", recursosDesvinculados: 2, trabajadoresDesvinculados: 2 }` | `cuadrillasService.desactivarCuadrilla` retorna `DesactivarCuadrillaData` con `eliminadoEn` y conteos exactos | APROBADO | 02/11/2026 13:10 | - | feat(cuadrillas): implementar baja logica de cuadrillas operativas (HU-82) |
| `CP-H82-WEB-08` | Remoción reactiva de la cuadrilla en la vista activa y despliegue de Toast de éxito (CA-4, CA-5) | Funcional / E2E | UI / Cliente | Alta | Respuesta 200 OK de `desactivarCuadrilla` con filtro en "Solo Activas" | Ejecución de `handleConfirmarDesactivar` en `CuadrillasAdminClient` | Se invoca `removerCuadrillaDeLista(id)`, se decrementa `meta.total` y se muestra Toast verde con recursos liberados | La cuadrilla desaparece inmediatamente del listado activo y se notifica la liberación de recursos y trabajadores | APROBADO | 02/11/2026 13:12 | - | feat(cuadrillas): implementar baja logica de cuadrillas operativas (HU-82) |
| `CP-H82-WEB-09` | Rechazo de desactivación con HTTP 409 Conflict cuando existen misiones PLANIFICADA, DESPACHADA o EN_CURSO (CA-3) | Regla de Negocio / ICS | Servicio / API | Crítica | Cuadrilla con misión activa asignada en backend | `DELETE /api/cuadrillas/{id}` respondiendo `HTTP 409 Conflict` | El servicio lanza `CuadrillaServiceError` con `status: 409` y `codigo: "CUADRILLA_EN_MISION"` | Excepción tipada lanzada con el mensaje del servidor e interceptada para mostrar Toast de error `No se pudo desactivar` | APROBADO | 02/11/2026 13:14 | - | feat(cuadrillas): implementar baja logica de cuadrillas operativas (HU-82) |
| `CP-H82-WEB-10` | Manejo de rechazo HTTP 403 Forbidden por insuficiencia de privilegios RBAC en servidor (CA-1) | Seguridad / RBAC | Servicio / API | Alta | Petición ejecutada con token de usuario sin permiso `cuadrillas:eliminar` | `DELETE /api/cuadrillas/{id}` respondiendo `HTTP 403 Forbidden` | El servicio lanza `CuadrillaServiceError` con `status: 403` y `codigo: "PERMISOS_INSUFICIENTES"` | Error 403 capturado y transformado en mensaje institucional indicando requerimiento de permiso `cuadrillas:eliminar` | APROBADO | 02/11/2026 13:16 | - | feat(cuadrillas): implementar baja logica de cuadrillas operativas (HU-82) |
| `CP-H82-WEB-11` | Manejo de error HTTP 404 Not Found ante cuadrilla inexistente o ya desactivada previamente (CA-4) | Robustez / Concurrencia | Servicio / API | Media | UUID de cuadrilla no existente o dada de baja por otro administrador | `DELETE /api/cuadrillas/id-inexistente-1234` respondiendo `HTTP 404 Not Found` | El servicio lanza `CuadrillaServiceError` con `status: 404` y `codigo: "RECURSO_NO_ENCONTRADO"` | Excepción 404 lanzada con mensaje: "La cuadrilla operativa especificada no existe o ya fue desactivada." | APROBADO | 02/11/2026 13:18 | - | feat(cuadrillas): implementar baja logica de cuadrillas operativas (HU-82) |
| `CP-H82-WEB-12` | Filtro predeterminado "Solo Activas" en barra de búsqueda y ocultamiento de acciones en cuadrillas inactivas (CA-4) | Funcional / UI | UI / Filtros | Alta | Carga inicial de `/gestion/admin/cuadrillas` | Selector de estado con opción por defecto `""` ("Solo Activas") | El selector muestra etiqueta "Solo Activas"; para filas con `activo === false`, se ocultan botones Editar y Desactivar | Etiqueta simplificada a "Solo Activas" y guardia `!estaInactiva` oculta acciones de mutación en registros dados de baja | APROBADO | 02/11/2026 13:20 | - | fix(cuadrillas): simplificar etiqueta del selector de estado a Solo Activas |
| `CP-H82-WEB-13` | Flujo de desactivación iniciado desde el panel lateral `CuadrillaDetalleDrawer` (CA-1, CA-2) | Funcional / UX | UI / Drawer | Media | `CuadrillaDetalleDrawer` abierto para una cuadrilla `DISPONIBLE` | Clic en botón "Desactivar Cuadrilla" al pie del drawer | El drawer invoca `onCerrar()` y abre inmediatamente `CuadrillaDesactivarModal` con la cuadrilla seleccionada | Transición limpia entre el drawer de detalle y el modal de confirmación de baja | APROBADO | 02/11/2026 13:22 | - | feat(cuadrillas): implementar baja logica de cuadrillas operativas (HU-82) |
| `CP-H82-WEB-14` | Sincronización en tiempo real mediante evento WebSocket `cuadrilla:desactivada` en `useCuadrillas` | Tiempo Real / Socket | Hook / Integración | Alta | Suscripción activa de Socket.io en el hook `useCuadrillas` | Recepción de evento socket `cuadrilla:desactivada` con payload `{ id }` | El listener `handleCuadrillaDesactivada` invoca `cargarDatos()` refrescando el listado sin recargar el navegador | Suscripción y limpieza (`socket.off`) registradas correctamente para `cuadrilla:desactivada` en `useCuadrillas.ts` | APROBADO | 02/11/2026 13:24 | - | feat(cuadrillas): implementar baja logica de cuadrillas operativas (HU-82) |
| `CP-H82-WEB-15` | Entrega de Manual de Usuario `H82-desactivar-cuadrilla.md` conforme a estándar §7 de `GEMINI.md` | Documentación | Manual / Docs | Media | Existencia de archivo en `/docs/manuals/H82-desactivar-cuadrilla.md` | Inspección de secciones: Rol, Objetivo, Pasos numerados, Tabla de errores (409, 403, 404) y relación con API/PWA | Manual completo y alineado con las reglas de negocio de baja lógica y liberación de dotación | Archivo `docs/manuals/H82-desactivar-cuadrilla.md` presente y estructurado en 5 secciones técnicas | APROBADO | 02/11/2026 13:26 | - | feat(cuadrillas): implementar baja logica de cuadrillas operativas (HU-82) |

---

## 5. Bloque TSV para Google Sheets (Copiar y Pegar en Celda A1)

````tsv
ID Caso	Título del Caso de Prueba	Tipo de Prueba	Nivel	Prioridad	Precondición	Datos de Prueba (Payload / Headers / Query)	Resultado Esperado	Resultado Obtenido	Estado	Fecha / Hora Ejecución	Fecha / Hora Re-Test	Solución / Commit
BUG-H82-WEB-01	Falso positivo de desactivación cuando la API responde 401/500 o sufre caída de red mutando fallback en memoria	Defecto / Integridad	Servicio / DAL	Crítica	Sesión expirada (401) o caída de sgrai-api al desactivar cuadrilla semilla	DELETE /api/cuadrillas/50000000-0000-4000-8000-000000000001 retornando HTTP 401 o HTTP 500	Lanzamiento de CuadrillaServiceError y despliegue de Toast rojo de error sin alterar la tabla activa	El servicio captura el fallo, muta CUADRILLAS_FALLBACK en memoria y retorna éxito falso mostrando Toast verde	FALLIDO	02/11/2026 12:45	(Pendiente)	Pendiente (Rechazado en Code Review)
BUG-H82-WEB-02	Discrepancia de contrato en filtro de estado (INACTIVAS y TODAS) provocando HTTP 400 Bad Request en GET /api/cuadrillas	Defecto / Contrato API	UI / Servicio	Crítica	Selector de estado en CuadrillasFiltros cambiado a Inactivas o Todas	GET /api/cuadrillas?pagina=1&limite=10&estado=INACTIVAS y GET /api/cuadrillas?pagina=1&limite=10&estado=TODAS	Consulta compatible con enum Zod del backend (DISPONIBLE, EN_MISION, NO_DISPONIBLE) retornando HTTP 200 OK	Backend rechaza con HTTP 400 Bad Request por valor fuera de enum y frontend cae silenciosamente a datos de fallback	FALLIDO	02/11/2026 12:48	(Pendiente)	Pendiente (Rechazado en Code Review)
BUG-H82-WEB-03	Brecha de seguridad RBAC: Ausencia de bloqueo perimetral AccesoDenegadoState y concesión indebida por recursos:eliminar	Defecto / Seguridad RBAC	Vista / Cliente	Alta	Usuario con rol Call Center o usuario con permiso recursos:eliminar sin cuadrillas:eliminar	Navegación directa a /gestion/admin/cuadrillas con sesión sin recursos:leer o sin cuadrillas:eliminar	Bloqueo perimetral con AccesoDenegadoState (403) y acción Desactivar restringida solo a cuadrillas:eliminar o Admin	Vista expone tabla de fallback a roles no autorizados y habilita botón Desactivar a portadores de recursos:eliminar	FALLIDO	02/11/2026 12:50	(Pendiente)	Pendiente (Rechazado en Code Review)
BUG-H82-WEB-04	Bypass de contrato OpenAPI (as unknown as en apiClient.DELETE) y aserción muerta en test unitario de 409 Conflict	Defecto / QA & Tipos	Servicio / Unit Test	Alta	Suite Vitest ejecutando cuadrillasService.test.ts y chequeo de tipos OpenAPI	Doble llamada a desactivarCuadrilla(mockCuadrillaId) con un único mockResolvedValueOnce de HTTP 409	Tipado generado en api-generated.d.ts y ejecución real de aserciones status 409 y código CUADRILLA_EN_MISION en test	Segunda llamada en test resuelve desde fallback saltándose el bloque catch sin ejecutar los expect de código y status	FALLIDO	02/11/2026 12:52	(Pendiente)	Pendiente (Rechazado en Code Review)
BUG-H82-WEB-05	Dotación no limpiada en estado local tras desactivar bajo filtro TODAS y omisión de eliminadoEn en Drawer de Detalle	Defecto / UI & Auditoría	Componente / Estado	Media	Filtro Estado en TODAS y cuadrilla con 2 recursos y 2 trabajadores	Confirmar baja de cuadrilla 50000000-0000-4000-8000-000000000001 y abrir CuadrillaDetalleDrawer	Contadores de dotación en 0 tras desvinculación y visualización de fecha eliminadoEn en metadatos del drawer	La fila inactiva y el drawer continúan mostrando 2 operarios y 2 recursos asignados y se omite fecha eliminadoEn	FALLIDO	02/11/2026 12:55	(Pendiente)	Pendiente (Rechazado en Code Review)
CP-H82-WEB-01	Visibilidad y habilitación del botón Desactivar para perfil Administrador en tabla y drawer (CA-1)	Funcional / RBAC	UI / Componente	Alta	Sesión activa con rol Administrador o permiso cuadrillas:eliminar	Renderizado de CuadrillasTabla y CuadrillaDetalleDrawer con cuadrilla en estado DISPONIBLE	El botón destructivo "Desactivar" con ícono Trash2 se muestra visible y habilitado en tabla y pie de drawer	Botón renderizado con variante destructive, bordes rectos (--radius-none) e ícono vectorial Lucide Trash2	APROBADO	02/11/2026 12:58	-	feat(cuadrillas): implementar baja logica de cuadrillas operativas (HU-82)
CP-H82-WEB-02	Ocultamiento del botón Desactivar cuando puedeEliminar es false para perfiles operativos (CA-1)	Seguridad / RBAC	UI / Componente	Crítica	Prop puedeEliminar={false} (perfil sin permisos de baja)	Renderizado de CuadrillasTabla con puedeEliminar={false}	La columna de acciones no renderiza el botón "Desactivar" en ninguna fila de la tabla	El selector queryByRole('button', { name: /desactivar/i }) retorna null cumpliendo ocultamiento RBAC	APROBADO	02/11/2026 13:00	-	feat(cuadrillas): implementar baja logica de cuadrillas operativas (HU-82)
CP-H82-WEB-03	Apertura del modal de confirmación explicitando dotación a desvincular y reversión de delegado (CA-2, CA-5)	Funcional / UX	UI / Modal	Alta	Cuadrilla activa DISPONIBLE con 1 recurso y 1 trabajador	Clic en botón "Desactivar" abriendo CuadrillaDesactivarModal	Modal exhibe nombre de cuadrilla, delegación base, conteo de recursos/trabajadores a liberar y aviso de historial	Modal renderiza "Confirmar Desactivación de Cuadrilla", detalle de consecuencias y botón "Sí, desactivar cuadrilla"	APROBADO	02/11/2026 13:02	-	feat(cuadrillas): implementar baja logica de cuadrillas operativas (HU-82)
CP-H82-WEB-04	Cancelación de la baja lógica desde el modal sin ejecutar peticiones DELETE (CA-2)	Funcional / UX	UI / Modal	Media	CuadrillaDesactivarModal abierto para cuadrilla disponible	Clic en botón "Cancelar" o pulsación de tecla Escape	Se invoca onCancelar, el modal se cierra y no se dispara llamada HTTP DELETE /api/cuadrillas/{id}	Callback onCancelar ejecutado 1 vez sin invocación a onConfirmar ni mutación de estado	APROBADO	02/11/2026 13:04	-	feat(cuadrillas): implementar baja logica de cuadrillas operativas (HU-82)
CP-H82-WEB-05	Bloqueo visual de estado cargando (Desactivando...) durante petición en vuelo (CA-2)	Robustez / UX	UI / Modal	Media	Confirmación de baja en curso (desactivando={true})	Renderizado de CuadrillaDesactivarModal con prop desactivando={true}	El botón de confirmación cambia su etiqueta a "Desactivando..." y ambos botones quedan en estado disabled	Botones deshabilitados previniendo envíos duplicados por doble clic durante la transacción	APROBADO	02/11/2026 13:06	-	feat(cuadrillas): implementar baja logica de cuadrillas operativas (HU-82)
CP-H82-WEB-06	Bloqueo preventivo en tabla y modal cuando la cuadrilla se encuentra EN_MISION (CA-3)	Regla de Negocio / ICS	UI / Componente	Crítica	Cuadrilla con estado: "EN_MISION", "EN_TRANSITO" o "EN_OPERACION"	Renderizado de CuadrillasTabla y CuadrillaDesactivarModal con cuadrilla en faena activa	Botón Desactivar en tabla aparece disabled; modal muestra alerta ámbar "Acción Bloqueada" y oculta botón confirmar	Botón bloqueado con tooltip explicativo y modal exhibe alerta rol="alert" presentando únicamente el botón "Cerrar"	APROBADO	02/11/2026 13:08	-	feat(cuadrillas): implementar baja logica de cuadrillas operativas (HU-82)
CP-H82-WEB-07	Desactivación exitosa (HTTP 200 OK) procesando baja lógica y conteo de dotación liberada (CA-4, CA-5)	Integración / DAL	Servicio / API	Crítica	Cuadrilla activa sin misiones en curso (50000000-0000-4000-8000-000000000001)	DELETE /api/cuadrillas/50000000-0000-4000-8000-000000000001 con Authorization: Bearer <token>	API responde 200 OK con { activo: false, estado: "NO_DISPONIBLE", recursosDesvinculados: 2, trabajadoresDesvinculados: 2 }	cuadrillasService.desactivarCuadrilla retorna DesactivarCuadrillaData con eliminadoEn y conteos exactos	APROBADO	02/11/2026 13:10	-	feat(cuadrillas): implementar baja logica de cuadrillas operativas (HU-82)
CP-H82-WEB-08	Remoción reactiva de la cuadrilla en la vista activa y despliegue de Toast de éxito (CA-4, CA-5)	Funcional / E2E	UI / Cliente	Alta	Respuesta 200 OK de desactivarCuadrilla con filtro en "Solo Activas"	Ejecución de handleConfirmarDesactivar en CuadrillasAdminClient	Se invoca removerCuadrillaDeLista(id), se decrementa meta.total y se muestra Toast verde con recursos liberados	La cuadrilla desaparece inmediatamente del listado activo y se notifica la liberación de recursos y trabajadores	APROBADO	02/11/2026 13:12	-	feat(cuadrillas): implementar baja logica de cuadrillas operativas (HU-82)
CP-H82-WEB-09	Rechazo de desactivación con HTTP 409 Conflict cuando existen misiones PLANIFICADA, DESPACHADA o EN_CURSO (CA-3)	Regla de Negocio / ICS	Servicio / API	Crítica	Cuadrilla con misión activa asignada en backend	DELETE /api/cuadrillas/{id} respondiendo HTTP 409 Conflict	El servicio lanza CuadrillaServiceError con status: 409 y codigo: "CUADRILLA_EN_MISION"	Excepción tipada lanzada con el mensaje del servidor e interceptada para mostrar Toast de error No se pudo desactivar	APROBADO	02/11/2026 13:14	-	feat(cuadrillas): implementar baja logica de cuadrillas operativas (HU-82)
CP-H82-WEB-10	Manejo de rechazo HTTP 403 Forbidden por insuficiencia de privilegios RBAC en servidor (CA-1)	Seguridad / RBAC	Servicio / API	Alta	Petición ejecutada con token de usuario sin permiso cuadrillas:eliminar	DELETE /api/cuadrillas/{id} respondiendo HTTP 403 Forbidden	El servicio lanza CuadrillaServiceError con status: 403 y codigo: "PERMISOS_INSUFICIENTES"	Error 403 capturado y transformado en mensaje institucional indicando requerimiento de permiso cuadrillas:eliminar	APROBADO	02/11/2026 13:16	-	feat(cuadrillas): implementar baja logica de cuadrillas operativas (HU-82)
CP-H82-WEB-11	Manejo de error HTTP 404 Not Found ante cuadrilla inexistente o ya desactivada previamente (CA-4)	Robustez / Concurrencia	Servicio / API	Media	UUID de cuadrilla no existente o dada de baja por otro administrador	DELETE /api/cuadrillas/id-inexistente-1234 respondiendo HTTP 404 Not Found	El servicio lanza CuadrillaServiceError con status: 404 y codigo: "RECURSO_NO_ENCONTRADO"	Excepción 404 lanzada con mensaje: "La cuadrilla operativa especificada no existe o ya fue desactivada."	APROBADO	02/11/2026 13:18	-	feat(cuadrillas): implementar baja logica de cuadrillas operativas (HU-82)
CP-H82-WEB-12	Filtro predeterminado "Solo Activas" en barra de búsqueda y ocultamiento de acciones en cuadrillas inactivas (CA-4)	Funcional / UI	UI / Filtros	Alta	Carga inicial de /gestion/admin/cuadrillas	Selector de estado con opción por defecto "" ("Solo Activas")	El selector muestra etiqueta "Solo Activas"; para filas con activo === false, se ocultan botones Editar y Desactivar	Etiqueta simplificada a "Solo Activas" y guardia !estaInactiva oculta acciones de mutación en registros dados de baja	APROBADO	02/11/2026 13:20	-	fix(cuadrillas): simplificar etiqueta del selector de estado a Solo Activas
CP-H82-WEB-13	Flujo de desactivación iniciado desde el panel lateral CuadrillaDetalleDrawer (CA-1, CA-2)	Funcional / UX	UI / Drawer	Media	CuadrillaDetalleDrawer abierto para una cuadrilla DISPONIBLE	Clic en botón "Desactivar Cuadrilla" al pie del drawer	El drawer invoca onCerrar() y abre inmediatamente CuadrillaDesactivarModal con la cuadrilla seleccionada	Transición limpia entre el drawer de detalle y el modal de confirmación de baja	APROBADO	02/11/2026 13:22	-	feat(cuadrillas): implementar baja logica de cuadrillas operativas (HU-82)
CP-H82-WEB-14	Sincronización en tiempo real mediante evento WebSocket cuadrilla:desactivada en useCuadrillas	Tiempo Real / Socket	Hook / Integración	Alta	Suscripción activa de Socket.io en el hook useCuadrillas	Recepción de evento socket cuadrilla:desactivada con payload { id }	El listener handleCuadrillaDesactivada invoca cargarDatos() refrescando el listado sin recargar el navegador	Suscripción y limpieza (socket.off) registradas correctamente para cuadrilla:desactivada en useCuadrillas.ts	APROBADO	02/11/2026 13:24	-	feat(cuadrillas): implementar baja logica de cuadrillas operativas (HU-82)
CP-H82-WEB-15	Entrega de Manual de Usuario H82-desactivar-cuadrilla.md conforme a estándar §7 de GEMINI.md	Documentación	Manual / Docs	Media	Existencia de archivo en /docs/manuals/H82-desactivar-cuadrilla.md	Inspección de secciones: Rol, Objetivo, Pasos numerados, Tabla de errores (409, 403, 404) y relación con API/PWA	Manual completo y alineado con las reglas de negocio de baja lógica y liberación de dotación	Archivo docs/manuals/H82-desactivar-cuadrilla.md presente y estructurado en 5 secciones técnicas	APROBADO	02/11/2026 13:26	-	feat(cuadrillas): implementar baja logica de cuadrillas operativas (HU-82)
````

---

## 6. Guía de Ejecución 100% Replicable Paso a Paso (Vitest y cURL)

### 6.1. Ejecución Completa de la Suite Automatizada de HU-82 en Vitest

```bash
npx vitest run src/components/admin/cuadrillas/__tests__/CuadrillaDesactivarModal.test.tsx src/components/admin/cuadrillas/__tests__/CuadrillasTabla.test.tsx src/services/__tests__/cuadrillasService.test.ts
```

**Salida Real Obtenida:**
```text
 RUN  v3.2.7 /home/ds2fery/Documentos/Proyecto/sgrai-uach/web

 ✓ src/services/__tests__/cuadrillasService.test.ts (20 tests) 47ms
 ✓ src/components/admin/cuadrillas/__tests__/CuadrillaDesactivarModal.test.tsx (6 tests) 226ms
 ✓ src/components/admin/cuadrillas/__tests__/CuadrillasTabla.test.tsx (5 tests) 289ms

 Test Files  3 passed (3)
      Tests  31 passed (31)
   Start at  12:44:29
   Duration  1.50s (transform 286ms, setup 288ms, collect 646ms, tests 562ms, environment 1.61s, prepare 215ms)
```

---

### 6.2. Comandos Individuales por Caso de Prueba (`npm test -- -t "..."` y `cURL`)

#### 1. Reproducción de `CP-H82-WEB-01` y `CP-H82-WEB-02` (Visibilidad y Ocultamiento RBAC en `CuadrillasTabla`)
```bash
npm test -- run src/components/admin/cuadrillas/__tests__/CuadrillasTabla.test.tsx -t "Desactivar"
```
**Salida Obtenida:**
```text
 ✓ src/components/admin/cuadrillas/__tests__/CuadrillasTabla.test.tsx (2 tests | 3 skipped) 182ms
   ✓ CuadrillasTabla (H81) > debe renderizar la acción Desactivar cuando puedeEliminar es true 135ms
   ✓ CuadrillasTabla (H81) > no debe renderizar el botón Desactivar cuando puedeEliminar es false 45ms
```

---

#### 2. Reproducción de `CP-H82-WEB-03`, `CP-H82-WEB-04`, `CP-H82-WEB-05` y `CP-H82-WEB-06` (`CuadrillaDesactivarModal`)
```bash
npm test -- run src/components/admin/cuadrillas/__tests__/CuadrillaDesactivarModal.test.tsx -t "CuadrillaDesactivarModal (HU-82)"
```
**Salida Obtenida:**
```text
 ✓ src/components/admin/cuadrillas/__tests__/CuadrillaDesactivarModal.test.tsx (6 tests) 226ms
   ✓ CuadrillaDesactivarModal (HU-82) > no debe renderizar nada si cuadrilla es null 18ms
   ✓ CuadrillaDesactivarModal (HU-82) > debe renderizar el mensaje de advertencia y consecuencias para una cuadrilla disponible 84ms
   ✓ CuadrillaDesactivarModal (HU-82) > debe bloquear la acción si la cuadrilla se encuentra EN_MISION 42ms
   ✓ CuadrillaDesactivarModal (HU-82) > debe llamar a onConfirmar al presionar el botón de confirmación 31ms
   ✓ CuadrillaDesactivarModal (HU-82) > debe llamar a onCancelar al presionar el botón Cancelar 27ms
   ✓ CuadrillaDesactivarModal (HU-82) > debe deshabilitar botones y mostrar estado cargando cuando desactivando es true 24ms
```

---

#### 3. Reproducción de `CP-H82-WEB-07`, `CP-H82-WEB-09`, `CP-H82-WEB-10` y `CP-H82-WEB-11` (`cuadrillasService.desactivarCuadrilla`)
```bash
npm test -- run src/services/__tests__/cuadrillasService.test.ts -t "desactivarCuadrilla (HU-82)"
```
**Salida Obtenida:**
```text
 ✓ src/services/__tests__/cuadrillasService.test.ts (5 tests | 15 skipped) 19ms
   ✓ cuadrillasService (H79) > desactivarCuadrilla (HU-82) > debe desactivar exitosamente la cuadrilla cuando la API responde 200 OK 4ms
   ✓ cuadrillasService (H79) > desactivarCuadrilla (HU-82) > debe lanzar CuadrillaServiceError con código CUADRILLA_EN_MISION ante 409 Conflict 5ms
   ✓ cuadrillasService (H79) > desactivarCuadrilla (HU-82) > debe lanzar CuadrillaServiceError con status 403 ante permisos insuficientes 2ms
   ✓ cuadrillasService (H79) > desactivarCuadrilla (HU-82) > debe lanzar CuadrillaServiceError con status 404 si la cuadrilla no existe 2ms
   ✓ cuadrillasService (H79) > desactivarCuadrilla (HU-82) > debe rechazar en modo fallback si la cuadrilla local está EN_MISION 3ms
```

---

#### 4. Peticiones HTTP / cURL de Integración con `DELETE /api/cuadrillas/{id}` y `GET /api/cuadrillas`

##### Caso A: Desactivación Exitosa (`200 OK` — `CP-H82-WEB-07`)
```bash
curl -i -X DELETE "http://localhost:3001/api/cuadrillas/50000000-0000-4000-8000-000000000001" \
  -H "Authorization: Bearer <JWT_ADMIN_TOKEN>" \
  -H "x-user-id: 00000000-0000-4000-8000-000000000001" \
  -H "Accept: application/json"
```
**Respuesta HTTP / JSON Obtenida:**
```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{
  "message": "Cuadrilla operativa desactivada exitosamente",
  "data": {
    "id": "50000000-0000-4000-8000-000000000001",
    "nombre": "Cuadrilla Vías y Despeje Urbano",
    "activo": false,
    "estado": "NO_DISPONIBLE",
    "recursosDesvinculados": 2,
    "trabajadoresDesvinculados": 2,
    "delegadoRevertido": true,
    "eliminadoEn": "2026-10-26T12:30:00.000Z",
    "eliminadoPorId": "00000000-0000-4000-8000-000000000001"
  }
}
```

##### Caso B: Rechazo por Misiones Activas en Curso (`409 Conflict` — `CP-H82-WEB-09`)
```bash
curl -i -X DELETE "http://localhost:3001/api/cuadrillas/50000000-0000-4000-8000-000000000002" \
  -H "Authorization: Bearer <JWT_ADMIN_TOKEN>" \
  -H "x-user-id: 00000000-0000-4000-8000-000000000001" \
  -H "Accept: application/json"
```
**Respuesta HTTP / JSON Obtenida:**
```http
HTTP/1.1 409 Conflict
Content-Type: application/json; charset=utf-8

{
  "statusCode": 409,
  "error": "Conflict",
  "message": "No es posible desactivar la cuadrilla porque posee misiones activas en curso (PLANIFICADA, DESPACHADA o EN_CURSO)."
}
```

##### Caso C: Rechazo por Permisos Insuficientes (`403 Forbidden` — `CP-H82-WEB-10`)
```bash
curl -i -X DELETE "http://localhost:3001/api/cuadrillas/50000000-0000-4000-8000-000000000001" \
  -H "Authorization: Bearer <JWT_CALL_CENTER_TOKEN>" \
  -H "x-user-id: 00000000-0000-4000-8000-000000000004" \
  -H "Accept: application/json"
```
**Respuesta HTTP / JSON Obtenida:**
```http
HTTP/1.1 403 Forbidden
Content-Type: application/json; charset=utf-8

{
  "statusCode": 403,
  "error": "Forbidden",
  "message": "Acceso denegado. Se requiere el permiso 'cuadrillas:eliminar'."
}
```

##### Caso D: Evidencia de Defecto `BUG-H82-WEB-02` (`400 Bad Request` al filtrar por `estado=INACTIVAS` en `CuadrillasFiltros`)
```bash
curl -i -X GET "http://localhost:3001/api/cuadrillas?pagina=1&limite=10&estado=INACTIVAS" \
  -H "Authorization: Bearer <JWT_ADMIN_TOKEN>" \
  -H "x-user-id: 00000000-0000-4000-8000-000000000001" \
  -H "Accept: application/json"
```
**Respuesta HTTP / JSON Obtenida:**
```http
HTTP/1.1 400 Bad Request
Content-Type: application/json; charset=utf-8

{
  "message": "Parámetros de consulta inválidos.",
  "errors": [
    {
      "campo": "estado",
      "mensaje": "Invalid enum value. Expected 'DISPONIBLE' | 'EN_MISION' | 'NO_DISPONIBLE', received 'INACTIVAS'"
    }
  ]
}
```

---

## 7. Matriz de Trazabilidad de Criterios de Aceptación (HU-82)

| # | Criterio de Aceptación (Historia de Usuario HU-82) | Casos de Prueba Asociados | Estado Actual | Observaciones de Auditoría |
|:---:|---|---|:---:|---|
| **CA-1** | En la vista de gestión de cuadrillas, debe existir la acción 'Desactivar Cuadrilla' accesible para el Administrador. | `CP-H82-WEB-01`, `CP-H82-WEB-02`, `CP-H82-WEB-13`, `BUG-H82-WEB-03` | 🟡 **PARCIAL** | El botón existe en `CuadrillasTabla` y `CuadrillaDetalleDrawer`, pero `CuadrillasAdminClient` concede la acción indebidamente a `recursos:eliminar` y carece de `AccesoDenegadoState` (`BUG-H82-WEB-03`). |
| **CA-2** | Se debe solicitar confirmación explícita mediante un modal de advertencia. | `CP-H82-WEB-03`, `CP-H82-WEB-04`, `CP-H82-WEB-05` | 🟢 **CUMPLIDO** | `CuadrillaDesactivarModal` solicita confirmación explícita y detalla consecuencias de la baja. |
| **CA-3** | Validación crítica de negocio en backend: si la cuadrilla posee misiones en estado `PLANIFICADA`, `DESPACHADA` o `EN_CURSO`, la API debe rechazar la desactivación con código `409 Conflict`. | `CP-H82-WEB-06`, `CP-H82-WEB-09`, `BUG-H82-WEB-04` | 🟡 **PARCIAL** | El servicio transforma el `409` en `CUADRILLA_EN_MISION`, pero el test unitario en `cuadrillasService.test.ts` tenía la segunda llamada saltándose el `catch` (`BUG-H82-WEB-04`). |
| **CA-4** | Si no tiene misiones activas, la baja debe ser estrictamente lógica, aplicando `activo = false` y `eliminado_en = CURRENT_TIMESTAMP`. | `CP-H82-WEB-07`, `CP-H82-WEB-08`, `CP-H82-WEB-12`, `BUG-H82-WEB-01`, `BUG-H82-WEB-02` | 🔴 **BLOQUEADO** | El fallback de `desactivarCuadrilla` produce falsos positivos ante errores `401`/`500` (`BUG-H82-WEB-01`) y el filtro `estado=INACTIVAS` falla con `400 Bad Request` (`BUG-H82-WEB-02`). |
| **CA-5** | Los recursos asociados en `cuadrilla_recurso` deben quedar desvinculados y disponibles en el inventario central. | `CP-H82-WEB-03`, `CP-H82-WEB-07`, `CP-H82-WEB-08`, `BUG-H82-WEB-05` | 🟡 **PARCIAL** | El Toast informa los recursos desvinculados, pero al mantener la cuadrilla en la vista `"TODAS"`, el estado local conserva los arreglos `recursos` y `trabajadores` sin vaciarlos (`BUG-H82-WEB-05`). |
