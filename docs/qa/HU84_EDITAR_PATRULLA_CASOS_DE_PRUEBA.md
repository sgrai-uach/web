# Informe y Matriz de Casos de Prueba (QA): HU-84 — Modificar Patrulla Verificadora (Frontend Web)

> **Documento Oficial de Aseguramiento de Calidad (QA) — Frontend Web**  
> **Proyecto:** Sistema de Gestión de Recursos para Atención de Incidentes (SGRAI) — Dirección de Gestión de Riesgos de Desastres, Municipalidad de Valdivia.  
> **Módulo:** Recursos y Personal (Operaciones ICS / Centro de Mando y Despliegue de Terreno).  
> **Historia de Usuario:** HU-84 — *"Como Administrador Quiero modificar la delegación base, vehículo o personal asignado a una patrulla verificadora registrada Para adecuar la composición del equipo verificador ante rotaciones o mantenimiento vehicular."*  
> **Desarrollador Asignado:** Cristóbal Veas.  
> **Aplicación Cliente:** `sgrai-web` (Next.js 16 App Router + React 19 + TypeScript + Vanilla CSS Modules + Vitest + Testing Library + Socket.io Client).  
> **Rama Git Evaluada:** `feature/h84-editar-patrulla` (con head en commit `ab098b6`).  
> **QA Lead Responsable:** Antigravity QA Lead / Equipo de Aseguramiento de Calidad SGRAI.  
> **Commits Clave Evaluados (Conventional Commits):**
> * `feat(patrullas): implementar modificacion de delegacion, vehiculo y personal (HU-84)`
> * `style(patrullas): mejorar diseno institucional de ventana de confirmacion de edicion`
> * `style(patrullas): remover aviso de auditoria en confirmacion de edicion`
> * `style(patrullas): remover banner de actualizacion en tiempo real`
> 
> **Fecha de Auditoría QA:** 29 de Octubre de 2026.  
> **Estado de Certificación QA:** 🔴 **RECHAZADO TEMPORALMENTE (CHANGES REQUESTED — 5 DEFECTOS FORMALIZADOS)**.

---

## 1. Resumen Ejecutivo de la Auditoría Forense de QA

Durante la auditoría técnica de código, análisis de integración cliente-servidor con `sgrai-api`, validación de esquemas Zod en formularios, inspección de estados en React y evaluación de conformidad frente a los Criterios de Aceptación (CA) de la HU-84 en `sgrai-web`, se detectaron **5 defectos reales** que comprometen la consistencia contractual con el backend, la usabilidad de dotaciones operativas según el Sistema de Comando de Incidentes (ICS) y la integridad de estado en componentes visuales.

| Métrica de Calidad Frontend | Resultado de Auditoría |
|---|:---:|
| **Total de Casos de Prueba Diseñados y Evaluados** | **25** (20 Casos Funcionales/Integración + 5 Defectos Formalizados) |
| **Casos Aprobados (Passed)** | **20** |
| **Casos Fallidos / Defectos Abiertos (Failed)** | **5** (1 Crítico, 3 Altos, 1 Medio) |
| **Dictamen de Code Review para Pull Request** | 🔴 **CHANGES REQUESTED (Rechazo Formal hasta subsanar fixes)** |
| **Suite Automatizada de Patrullas en Vitest** | **52/52 tests exitosos en componentes, hooks y servicios** |
| **Conformidad de Contrato Zod (Cliente vs API)** | ❌ **FALLIDO (Discrepancia en longitud mínima de nombre)** |
| **Cumplimiento de Regla de Oro de QA** | **100% (Código en `src/` estrictamente preservado sin modificaciones)** |

---

## 2. Registro y Formalización de Defectos Detectados (Bugs Reales)

### `BUG-H84-WEB-01`: Discrepancia Contractual en Validación Zod de `nombre` (Mínimo 3 Caracteres en API Omitido en Frontend)
* **Severidad:** ALTA
* **Módulo / Archivo Afectado:** `src/hooks/useEditarPatrullaForm.ts` (líneas 16-20) frente a `api/src/modules/recursos-y-personal/patrulla.schema.ts` (línea 296).
* **Descripción:** En el esquema Zod del formulario de edición en el cliente (`editarPatrullaSchema`), el campo opcional `nombre` únicamente valida longitud máxima:
  ```typescript
  nombre: z.string().trim().max(100, "El nombre no puede exceder 100 caracteres.").optional(),
  ```
  Sin embargo, el contrato oficial del backend en `PUT /api/patrullas/{id}` impone una longitud mínima estricta de 3 caracteres cuando el campo se envía:
  ```typescript
  nombre: z.string().trim().min(3, "El nombre de la patrulla debe tener al menos 3 caracteres.").max(100).optional(),
  ```
  Si un usuario ingresa un nombre corto de 1 o 2 caracteres (ej. "P1" o "PV"), el frontend considera el formulario como válido (`isValid: true`), habilita el botón de guardado y abre el modal de confirmación. Al despachar la petición `PUT`, la API responde con error `400 Bad Request` indicando que el nombre no cumple el mínimo de caracteres, desconcertando al usuario final.
* **Pasos para Reproducir:**
  1. Abrir el modal de edición de una patrulla disponible.
  2. Modificar el campo "Nombre de la Patrulla" ingresando `"PV"`.
  3. Observar que el botón "Guardar Cambios" permanece habilitado y no se despliega error visual en el cliente.
  4. Presionar "Guardar Cambios" y confirmar la edición.
  5. Recibir error de servidor `400 Bad Request`.
* **Comportamiento Actual:** El cliente valida como correcto un nombre con menos de 3 caracteres y envía la solicitud a la API.
* **Comportamiento Esperado:** El esquema `editarPatrullaSchema` debe exigir `.min(3, "El nombre de la patrulla debe tener al menos 3 caracteres.")` cuando el valor no esté vacío, bloqueando el botón antes del envío.
* **Sugerencia Técnica:** En `useEditarPatrullaForm.ts`, ajustar el schema Zod:
  ```typescript
  nombre: z.string().trim().min(3, "El nombre de la patrulla debe tener al menos 3 caracteres.").max(100, "El nombre no puede exceder 100 caracteres.").optional(),
  ```

---

### `BUG-H84-WEB-02`: Corrupción y Asignación Indebida de `personal_id` en `usuarioLiderId` tras Alternar Integrantes
* **Severidad:** CRÍTICA
* **Módulo / Archivo Afectado:** `src/hooks/useEditarPatrullaForm.ts` (líneas 140-160 y 275-288) y `src/components/admin/patrullas/PatrullaEditarModal.tsx`.
* **Descripción:** En `useEditarPatrullaForm.ts`, al inicializar la lista de personal elegible con los integrantes ya asignados a la patrulla, si el objeto `integrante` no tiene poblada la propiedad `usuarioId`, se realiza un fallback asignando `usuario_id = integrante.id` (el cual corresponde a la clave primaria `personal_id` de la tabla `personal`). Posteriormente, en `handleTogglePersonal`:
  ```typescript
  if (!nuevoLider) {
    nuevoLider = usuarioId || personalId;
  }
  ```
  Si `usuarioLiderId` almacena el UUID de personal en lugar del UUID de usuario, al confirmarse la edición el frontend envía dicho ID al backend. En `sgrai-api`, el endpoint valida `p.usuario_id === usuarioLiderId`. Como son identificadores de entidades distintas, la API rechaza la petición con `HTTP 400 Bad Request: "El funcionario designado como líder debe pertenecer a la dotación asignada a la patrulla."`, bloqueando de manera sistemática e insalvable la edición para el usuario.  
  Adicionalmente, si el líder actual es deseleccionado mediante checkbox, `usuarioLiderId` queda en blanco (`""`) y el modal de confirmación muestra incoherentemente *"Líder Táctico: No asignado"*, violando el principio de mando unificado de ICS.
* **Pasos para Reproducir:**
  1. Abrir el modal de edición de una patrulla registrada.
  2. Deseleccionar a uno de los integrantes y volver a marcar otro integrante.
  3. Revisar el valor enviado en `payload.usuarioLiderId`.
* **Comportamiento Actual:** Se envía un UUID de `personal` o un valor vacío `null`, provocando rechazo 400 en API o visualización de líder no asignado.
* **Comportamiento Esperado:** `usuarioLiderId` debe almacenar exclusivamente el `usuario_id` del funcionario seleccionado y reasignarse automáticamente al primer integrante restante si el líder es removido.
* **Sugerencia Técnica:** Asegurar que `personalElegible` mapee siempre `usuario_id` real desde la entidad `personal` y garantizar que si `nuevoLider` queda vacío, se reasigne inmediatamente al `usuario_id` del primer elemento en `nuevosIds`.

---

### `BUG-H84-WEB-03`: Ausencia de Bloqueo Preventivo en UI para Estados Activos de Misión `EN_MISION`, `EN_PREVENCION` y `EN_RECUPERACION`
* **Severidad:** ALTA
* **Módulo / Archivo Afectado:** `src/hooks/useEditarPatrullaForm.ts` (línea 86) y `src/components/mando/patrullas/PatrullaCard.tsx` (línea 84).
* **Descripción:** La condición de bloqueo operativo en el cliente se limitó a:
  ```typescript
  const estaBloqueada = patrulla.estado === "EN_VERIFICACION" || Boolean(patrulla.misionActiva);
  ```
  Según el catálogo operativo canónico (`EstadoPatrullaEnum`), una patrulla puede estar en `EN_MISION`, `EN_PREVENCION` o `EN_RECUPERACION`. Si una patrulla se encuentra en cualquiera de estos estados pero su objeto `misionActiva` no viene incrustado en el DTO (ej. despliegues preventivos sin incidente formal asociado o contingencias ATP), la interfaz evalúa `estaBloqueada = false`. Como consecuencia, el botón "Editar Patrulla" en la tarjeta y en la ficha técnica permanece habilitado, permitiendo al Administrador abrir el modal de edición y alterar la composición de la patrulla mientras esta se encuentra en pleno operativo en terreno.
* **Pasos para Reproducir:**
  1. Disponer de una patrulla en estado `EN_MISION` o `EN_PREVENCION` con `misionActiva: null`.
  2. Visualizar la tarjeta en el Centro de Mando o en Administración.
  3. Comprobar que el botón "Editar Patrulla" se encuentra habilitado y permite abrir el modal.
* **Comportamiento Actual:** La interfaz solo bloquea si el estado es `EN_VERIFICACION` o si `misionActiva` no es nulo, ignorando otros estados de despliegue activo.
* **Comportamiento Esperado:** La edición debe bloquearse si el estado de la patrulla es cualquier estado distinto a `DISPONIBLE` y `NO_DISPONIBLE` (es decir, bloquear en `EN_VERIFICACION`, `EN_MISION`, `EN_PREVENCION` y `EN_RECUPERACION`).
* **Sugerencia Técnica:** En `useEditarPatrullaForm.ts`, `PatrullaCard.tsx` y `PatrullaDetalleDrawer.tsx`, actualizar la condición:
  ```typescript
  const ESTADOS_BLOQUEADOS: EstadoPatrullaEnum[] = ["EN_VERIFICACION", "EN_MISION", "EN_PREVENCION", "EN_RECUPERACION"];
  const estaBloqueada = ESTADOS_BLOQUEADOS.includes(patrulla.estado) || Boolean(patrulla.misionActiva);
  ```

---

### `BUG-H84-WEB-04`: Exposición y Selección Permitida de Personal No Disponible (`En patrulla` en Otra Unidad o de Licencia)
* **Severidad:** ALTA
* **Módulo / Archivo Afectado:** `src/hooks/useEditarPatrullaForm.ts` (líneas 128-136) y `src/components/admin/patrullas/PatrullaDotacionSection.tsx`.
* **Descripción:** Al cargar la lista de personal elegible desde `empleadosService.getEmpleadosPaginado`, el hook solo filtra por `p.rol_codigo === 'PATRULLA_VERIFICADORA'`, `p.personal_id !== null` y `p.usuario_activo !== false`. **No se valida ni filtra el campo `p.estado_operativo`**.  
  En consecuencia, los funcionarios que ya pertenecen a otra patrulla activa (`estado_operativo === 'en_patrulla'`), o están en una cuadrilla (`en_cuadrilla`), o con licencia médica (`licencia` / `no_disponible`) aparecen listados con casillas de verificación interactivas en `PatrullaDotacionSection`. El usuario puede marcarlos e intentar asignarlos, provocando solapamiento de funciones y colisiones operativas en terreno.
* **Pasos para Reproducir:**
  1. Abrir el modal de edición de una patrulla disponible.
  2. Revisar la sección "Dotación y Personal Asignado".
  3. Constatar que funcionarios con etiqueta "Estado: En patrulla" o de licencia médica están habilitados para selección.
* **Comportamiento Actual:** Funcionarios no disponibles pueden ser seleccionados libremente en la dotación.
* **Comportamiento Esperado:** Los funcionarios cuyo `estado_operativo !== 'disponible'` (y que no pertenezcan ya a la patrulla actual) deben figurar deshabilitados o no seleccionables en la interfaz.
* **Sugerencia Técnica:** En `useEditarPatrullaForm.ts` y `PatrullaDotacionSection.tsx`, deshabilitar las casillas de funcionarios ocupados:
  ```typescript
  const estaOcupado = p.estado_operativo !== "disponible" && !patrulla.integrantes?.some(i => i.id === p.personal_id);
  ```

---

### `BUG-H84-WEB-05`: Desincronización y Cierre Inesperado del Drawer de Detalle tras Guardar Cambios
* **Severidad:** MEDIA
* **Módulo / Archivo Afectado:** `src/components/admin/patrullas/AdminPatrullasClient.tsx` (líneas 300-305 y 97-104) y `src/components/admin/patrullas/__tests__/PatrullaEditarModal.test.tsx`.
* **Descripción:** En `AdminPatrullasClient.tsx`, cuando el usuario presiona "Editar Patrulla" desde la ficha técnica (`PatrullaDetalleDrawer`), la prop `onEditar` ejecuta `setPatrullaADetalle(null); setPatrullaAEditar(p);`. Esto borra el estado de la patrulla en inspección. Cuando el modal finaliza y se invoca `handlePatrullaActualizada`, la condición `if (patrullaADetalle?.id === patrullaActualizada.id)` resulta falsa y la ficha técnica no se actualiza ni se reabre, expulsando al usuario abruptamente a la vista de grilla sin mantener el contexto de la ficha técnica.  
  Asimismo, en la suite `PatrullaEditarModal.test.tsx`, la resolución asíncrona de promesas en `useEffect` gatilla advertencias de `act(...)` no controladas en el test 3.
* **Pasos para Reproducir:**
  1. Hacer clic en "Ver Ficha" de una patrulla para abrir el `PatrullaDetalleDrawer`.
  2. En el pie del Drawer, presionar el botón "Editar Patrulla".
  3. Modificar un campo y presionar "Confirmar y Guardar".
  4. Observar que el Drawer desaparece por completo y el usuario queda en la grilla sin ver los cambios en la ficha técnica.
* **Comportamiento Actual:** El Drawer se destruye y no vuelve a mostrarse con los datos actualizados.
* **Comportamiento Esperado:** El Drawer debe actualizarse con la patrulla modificada (`data`) y permanecer abierto para que el Administrador valide los cambios aplicados en la ficha técnica.
* **Sugerencia Técnica:** En `AdminPatrullasClient.tsx`, mantener el ID de la patrulla en inspección en una referencia o no forzar `setPatrullaADetalle(null)` hasta que el usuario cierre voluntariamente la ficha.

---

## 3. Mensaje Formal de Code Review para Rechazar el PR (GitHub Markdown)

```markdown
## ❌ Code Review QA: Changes Requested — HU-84 (Modificar Patrulla Verificadora - Frontend Web)

Estimado @CristobalVeas,

He completado la auditoría técnica y ejecución de pruebas de integración para los componentes y hooks de la **HU-84** (*Modificar Patrulla Verificadora*) en el repositorio `sgrai-web`.

Se valora enormemente la completitud de la interfaz, el diseño institucional con Vanilla CSS Modules, la incorporación del Drawer de Detalle (`PatrullaDetalleDrawer`) y el modal de confirmación con datos consolidados. Sin embargo, se han formalizado **5 defectos técnicos reales** que impiden certificar la rama para su integración en `develop`:

---

### 🚨 Hallazgos Críticos a Subsanar:

1. **`BUG-H84-WEB-01` — Discrepancia de Contrato Zod en `nombre`:**
   * **Archivo:** `src/hooks/useEditarPatrullaForm.ts` (L. 16-20)
   * **Problema:** En el cliente `editarPatrullaSchema` no valida el mínimo de 3 caracteres que la API exige estrictamente (`min(3)`). Nombres cortos como "PV" pasan en el cliente pero rompen con error 400 del servidor.
   * **Fix sugerido:** Agregar `.min(3, "El nombre de la patrulla debe tener al menos 3 caracteres.")` en el esquema Zod del formulario.

2. **`BUG-H84-WEB-02` — Corrupción de `usuarioLiderId` con UUID de `personal`:**
   * **Archivo:** `src/hooks/useEditarPatrullaForm.ts` (L. 140-160 y L. 275-288)
   * **Problema:** El fallback `usuarioId || personalId` puede asignar un UUID de la tabla `personal` a la variable `usuarioLiderId`. El backend espera estrictamente un ID de `usuario`, lo que genera un error 400 inmediato al intentar guardar. Adicionalmente, deseleccionar al líder deja el campo en blanco y muestra "Líder: No asignado" en el modal de confirmación.
   * **Fix sugerido:** Mapear fidedignamente `usuario_id` y reasignar automáticamente el líder al primer integrante restante si el líder es desmarcado.

3. **`BUG-H84-WEB-03` — Falta de Bloqueo en Estados `EN_MISION`, `EN_PREVENCION` y `EN_RECUPERACION`:**
   * **Archivo:** `src/hooks/useEditarPatrullaForm.ts` (L. 86) y `src/components/mando/patrullas/PatrullaCard.tsx` (L. 84)
   * **Problema:** Solo se bloquea si el estado es `EN_VERIFICACION` o si existe `misionActiva`. Si una patrulla está en `EN_MISION` o `EN_PREVENCION` sin misión enlazada, la UI permite editarla indebidamente.
   * **Fix sugerido:** Bloquear la edición ante cualquier estado operativo activo (`EN_VERIFICACION`, `EN_MISION`, `EN_PREVENCION`, `EN_RECUPERACION`).

4. **`BUG-H84-WEB-04` — Exposición de Personal No Disponible en Selección de Integrantes:**
   * **Archivo:** `src/hooks/useEditarPatrullaForm.ts` (L. 128-136) y `PatrullaDotacionSection.tsx`
   * **Problema:** No se valida `p.estado_operativo === 'disponible'`. Funcionarios que ya están en otra patrulla (`en_patrulla`) o de licencia médica pueden ser seleccionados con checkbox, provocando doble asignación de personal.
   * **Fix sugerido:** Deshabilitar en la lista a funcionarios ocupados cuyo estado no sea disponible.

5. **`BUG-H84-WEB-05` — Desincronización y Cierre del Drawer al Editar:**
   * **Archivo:** `src/components/admin/patrullas/AdminPatrullasClient.tsx` (L. 300-305) y `PatrullaEditarModal.test.tsx`
   * **Problema:** Al editar desde el Drawer, `setPatrullaADetalle(null)` destruye la vista de ficha técnica impidiendo que vuelva a abrirse actualizada tras guardar. Además, existen advertencias de `act(...)` en las pruebas unitarias del modal.
   * **Fix sugerido:** Mantener abierta la ficha técnica actualizada tras guardar y envolver las resoluciones asíncronas de test en `act(...)`.

---

Por favor notificar cuando los fixes estén commiteados para realizar el re-test formal y proceder con el merge. ¡Excelente trabajo en los aspectos visuales y de accesibilidad!
```

---

## 4. Matriz Consolidada de 13 Columnas (Google Sheets / Docs)

| ID Caso | Título del Caso de Prueba | Tipo de Prueba | Nivel | Prioridad | Precondición | Datos de Prueba (Payload / Headers / Query) | Resultado Esperado | Resultado Obtenido | Estado | Fecha / Hora Ejecución | Fecha / Hora Re-Test | Solución / Commit |
|---|---|---|---|---|---|---|---|---|:---:|:---:|:---:|---|
| `BUG-H84-WEB-01` | Discrepancia contractual en validación Zod de nombre omitiendo mínimo de 3 caracteres en cliente | Validación (Zod) / Contrato | UI / Hook | Alta | Modal de edición abierto en patrulla disponible | Modificar nombre a "PV" (2 caracteres) y enviar formulario | Error de validación cliente impidiendo avanzar al modal de confirmación | El cliente valida como correcto, abre confirmación y la API responde 400 Bad Request | ABIERTO | 29/10/2026 22:50 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| `BUG-H84-WEB-02` | Corrupción de usuarioLiderId con UUID de personal al deseleccionar integrantes y líder no asignado | Integridad / Estado React | Hook / UI | Crítica | Patrulla con 2 o más integrantes cargados | Deseleccionar al líder actual y seleccionar un nuevo funcionario | usuarioLiderId debe reasignarse automáticamente a un usuario_id válido de la dotación | Fallback asigna personal_id provocando error 400 en API o muestra "Líder: No asignado" | ABIERTO | 29/10/2026 22:52 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| `BUG-H84-WEB-03` | Ausencia de bloqueo preventivo de edición ante estados activos EN_MISION, EN_PREVENCION y EN_RECUPERACION | Regla de Negocio ICS | UI / Lógica | Alta | Patrulla en estado EN_MISION con misionActiva null | Inspeccionar botón "Editar Patrulla" en PatrullaCard y Drawer | Botón "Editar Patrulla" deshabilitado con tooltip explicativo de bloqueo | Botón habilitado permitiendo abrir el modal de edición a mitad de turno | ABIERTO | 29/10/2026 22:54 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| `BUG-H84-WEB-04` | Exposición y selección permitida de personal no disponible (en otra patrulla o de licencia médica) | Validación / Negocio ICS | UI / Componente | Alta | Empleados con estado_operativo = 'en_patrulla' o 'licencia' | Abrir selector de dotación en PatrullaEditarModal | Funcionarios ocupados deshabilitados con etiqueta de no disponibilidad | Checkbox activo y seleccionable permitiendo doble asignación en terreno | ABIERTO | 29/10/2026 22:56 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| `BUG-H84-WEB-05` | Desincronización y cierre forzado del Drawer de Detalle tras edición y warnings de act en tests | Estado React / QA | Integración UI | Media | Patrulla abierta en PatrullaDetalleDrawer | Presionar "Editar Patrulla", modificar datos y confirmar guardado | Drawer permanece abierto mostrando la ficha técnica actualizada fidedignamente | Drawer se destruye y el usuario es expulsado a la grilla general de patrullas | ABIERTO | 29/10/2026 22:58 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| `CP-H84-WEB-01` | Despliegue de acción Editar Patrulla en tarjeta de Centro de Mando para patrulla DISPONIBLE | Funcional / UI | Componente | Alta | Patrulla en estado DISPONIBLE y usuario con permiso recursos:editar | Renderizado de PatrullaCard en AdminPatrullasClient | Botón "Editar Patrulla" visible y habilitado en la fila de acciones | Botón visible con icono Edit y estilo institucional habilitado | APROBADO | 29/10/2026 23:00 | - | feat(patrullas): implementar modificacion de delegacion, vehiculo y personal (HU-84) |
| `CP-H84-WEB-02` | Despliegue de acción Editar Patrulla en el pie del Drawer de Detalle (PatrullaDetalleDrawer) | Funcional / UI | Componente | Alta | Patrulla seleccionada en inspección unitaria | Clic en "Ver Ficha" abriendo PatrullaDetalleDrawer | Botón "Editar Patrulla" presente en el footer del Drawer con icono | Botón interactivo renderizado con icono Edit y prop puedeEditar | APROBADO | 29/10/2026 23:02 | - | feat(patrullas): implementar modificacion de delegacion, vehiculo y personal (HU-84) |
| `CP-H84-WEB-03` | Precarga íntegra de atributos actuales en formulario de edición (PatrullaEditarModal) | Funcional | Formulario / Hook | Alta | Patrulla con delegación, vehículo y dotación asignados | Apertura de PatrullaEditarModal | Campos precargados: nombre, delegación seleccionada, vehículo y dotación | Todos los campos precargados fielmente desde la entidad suministrada | APROBADO | 29/10/2026 23:04 | - | feat(patrullas): implementar modificacion de delegacion, vehiculo y personal (HU-84) |
| `CP-H84-WEB-04` | Visualización del código identificador táctico en modo de solo lectura deshabilitado | Regla de Negocio / UI | Formulario | Media | Modal de edición abierto | Inspeccionar input de código identificador de patrulla | Campo deshabilitado (disabled) impidiendo alterar el código único | Input con atributo disabled y valor de código institucional fijo | APROBADO | 29/10/2026 23:06 | - | feat(patrullas): implementar modificacion de delegacion, vehiculo y personal (HU-84) |
| `CP-H84-WEB-05` | Reasignación de delegación base territorial municipal mediante selector desplegable | Funcional | Formulario | Alta | Catálogo de delegaciones cargado en memoria | Cambiar selector a "Delegación Municipal Sur" | formData.delegacionId actualizado y reflejado en el select | Selección reactiva con código y nombre territorial actualizado | APROBADO | 29/10/2026 23:08 | - | feat(patrullas): implementar modificacion de delegacion, vehiculo y personal (HU-84) |
| `CP-H84-WEB-06` | Reasignación de vehículo institucional disponible o desasignación a pie (opción vacía) | Funcional | Formulario | Alta | Catálogo de vehículos disponibles cargado | Seleccionar nueva camioneta o elegir opción "-- Sin vehículo --" | vehiculoId actualizado o fijado en cadena vacía / null | Selector actualiza estado local y permite conmutar vehículo | APROBADO | 29/10/2026 23:10 | - | feat(patrullas): implementar modificacion de delegacion, vehiculo y personal (HU-84) |
| `CP-H84-WEB-07` | Inclusión y exclusión interactiva de funcionarios en dotación mediante checkboxes | Funcional | Componente / Hook | Alta | Catálogo de personal con rol PATRULLA_VERIFICADORA | Clic en funcionario para agregar y remover de personalIds | Array personalIds actualizado dinámicamente y contador reactivo | Checkbox conmuta estado y actualiza lista de seleccionados | APROBADO | 29/10/2026 23:12 | - | feat(patrullas): implementar modificacion de delegacion, vehiculo y personal (HU-84) |
| `CP-H84-WEB-08` | Designación dinámica del funcionario líder responsable de la patrulla mediante selector | Funcional | Formulario | Alta | Al menos 2 funcionarios seleccionados en dotación | Cambiar selector de "Funcionario Líder Responsable" | usuarioLiderId actualizado con el usuario del funcionario elegido | Selector poblado únicamente con integrantes seleccionados | APROBADO | 29/10/2026 23:14 | - | feat(patrullas): implementar modificacion de delegacion, vehiculo y personal (HU-84) |
| `CP-H84-WEB-09` | Despliegue de ventana modal de confirmación previa con resumen de modificaciones | Usabilidad / UI | Modal / Diálogo | Alta | Formulario válido y clic en "Guardar Cambios" | Submit de formulario principal | Modal de confirmación superpuesto con resumen de dotación, delegación y móvil | Diálogo de confirmación desplegado con resumen claro institucional | APROBADO | 29/10/2026 23:16 | - | style(patrullas): mejorar diseno institucional de ventana de confirmacion de edicion |
| `CP-H84-WEB-10` | Envío exitoso de petición PUT /api/patrullas/[id] y notificación toast de éxito | Integración | Servicio / API | Crítica | Confirmación aceptada por el usuario Administrador | Clic en "Confirmar y Guardar" en modal de confirmación | Petición PUT despachada, respuesta 200 OK y toast de éxito disparado | PUT ejecutado exitosamente y toast de confirmación mostrado | APROBADO | 29/10/2026 23:18 | - | feat(patrullas): implementar modificacion de delegacion, vehiculo y personal (HU-84) |
| `CP-H84-WEB-11` | Deshabilitación y bloqueo visual del botón Editar Patrulla en patrullas en EN_VERIFICACION | Regla de Negocio ICS | UI / Botón | Crítica | Patrulla en estado operativo EN_VERIFICACION | Visualización en grilla general o Drawer | Botón deshabilitado con atributo disabled y tooltip de bloqueo táctico | Botón deshabilitado con aria-label y tooltip explicativo | APROBADO | 29/10/2026 23:20 | - | feat(patrullas): implementar modificacion de delegacion, vehiculo y personal (HU-84) |
| `CP-H84-WEB-12` | Deshabilitación y bloqueo visual ante patrullas con misión activa en terreno | Regla de Negocio ICS | UI / Botón | Crítica | Patrulla con misionActiva en curso | Renderizado de PatrullaCard | Botón Editar Patrulla deshabilitado impidiendo alterar equipo | Botón inactivo impidiendo modificar patrulla en misión | APROBADO | 29/10/2026 23:22 | - | feat(patrullas): implementar modificacion de delegacion, vehiculo y personal (HU-84) |
| `CP-H84-WEB-13` | Despliegue de banner InlineNotice de bloqueo preventivo dentro del modal de edición | Usabilidad / Feedback | Modal / Noticia | Alta | Patrulla bloqueada por estado operativo | Apertura forzada o inspección de modal bloqueado | InlineNotice rojo indicando imposibilidad de editar patrulla en terreno | Banner InlineNotice visible y botón de guardado inactivo | APROBADO | 29/10/2026 23:24 | - | feat(patrullas): implementar modificacion de delegacion, vehiculo y personal (HU-84) |
| `CP-H84-WEB-14` | Manejo y presentación de error HTTP 409 Conflict proveniente del backend | Manejo de Errores | Hook / UI | Alta | Backend responde 409 Conflict por colisión en misión o vehículo | Confirmar guardado en modal | Banner de conflicto desplegado con mensaje explicativo del servidor | esConflicto activo y mensaje de colisión visualizado en modal | APROBADO | 29/10/2026 23:26 | - | feat(patrullas): implementar modificacion de delegacion, vehiculo y personal (HU-84) |
| `CP-H84-WEB-15` | Manejo de error HTTP 403 Forbidden para usuarios sin permiso recursos:editar | Seguridad (RBAC) | Servicio / UI | Crítica | Usuario sin permiso recursos:editar ni rol Administrador | Invocar patrullasService.editar() | esForbidden = true y mensaje de denegación de privilegios | Error 403 capturado y expuesto en resultado de servicio | APROBADO | 29/10/2026 23:28 | - | feat(patrullas): implementar modificacion de delegacion, vehiculo y personal (HU-84) |
| `CP-H84-WEB-16` | Manejo y renderizado de errores de validación HTTP 400 Bad Request con array errors | Robustez API | Hook / Formulario | Media | Backend responde 400 con arreglo de errores de validación | Confirmar guardado | serverFieldErrors poblado y errores expuestos en los campos correspondientes | Errores de validación de servidor mapeados fidedignamente | APROBADO | 29/10/2026 23:30 | - | feat(patrullas): implementar modificacion de delegacion, vehiculo y personal (HU-84) |
| `CP-H84-WEB-17` | Manejo de error de conexión o fallo 500 del servidor municipal | Resiliencia | Servicio / UI | Media | Servidor API inaccesible o fallo de red | Confirmar guardado | Mensaje claro: "Error de conexión con el servidor municipal..." | Error de conexión controlado sin caída de la aplicación React | APROBADO | 29/10/2026 23:32 | - | feat(patrullas): implementar modificacion de delegacion, vehiculo y personal (HU-84) |
| `CP-H84-WEB-18` | Cierre del modal de edición mediante botón Cancelar o tecla Escape | Accesibilidad / UX | Modal / Teclado | Media | Modal de edición abierto | Presionar botón "Cancelar", "X" o tecla Escape | Modal cerrado limpiamente sin aplicar modificaciones | Modal cerrado y foco retornado al elemento desencadenante | APROBADO | 29/10/2026 23:34 | - | feat(patrullas): implementar modificacion de delegacion, vehiculo y personal (HU-84) |
| `CP-H84-WEB-19` | Validación reactiva del botón Guardar Cambios deshabilitado si el formulario no es válido | Validación (Zod) | Formulario / Botón | Media | Formulario con delegación vacía o sin integrantes seleccionados | Inspeccionar botón de guardado en footer de modal | Botón Guardar Cambios deshabilitado (disabled) | Botón inactivo hasta cumplir con todos los campos obligatorios | APROBADO | 29/10/2026 23:36 | - | feat(patrullas): implementar modificacion de delegacion, vehiculo y personal (HU-84) |
| `CP-H84-WEB-20` | Actualización reactiva de la tarjeta de patrulla tras confirmación de guardado | Tiempo Real / React | Cliente / Grid | Alta | Edición exitosa completada en modal | Ejecución de callback onPatrullaActualizada | Tarjeta en grid recargada con nuevos valores de delegación y nombre | Lista de patrullas refrescada inmediatamente sin recargar la página | APROBADO | 29/10/2026 23:38 | - | feat(patrullas): implementar modificacion de delegacion, vehiculo y personal (HU-84) |

---

## 5. Bloque TSV para Google Sheets (Copiar y Pegar en celda A1)

```tsv
ID Caso	Título del Caso de Prueba	Tipo de Prueba	Nivel	Prioridad	Precondición	Datos de Prueba (Payload / Headers / Query)	Resultado Esperado	Resultado Obtenido	Estado	Fecha / Hora Ejecución	Fecha / Hora Re-Test	Solución / Commit
BUG-H84-WEB-01	Discrepancia contractual en validación Zod de nombre omitiendo mínimo de 3 caracteres en cliente	Validación (Zod) / Contrato	UI / Hook	Alta	Modal de edición abierto en patrulla disponible	Modificar nombre a "PV" (2 caracteres) y enviar formulario	Error de validación cliente impidiendo avanzar al modal de confirmación	El cliente valida como correcto, abre confirmación y la API responde 400 Bad Request	ABIERTO	29/10/2026 22:50	(Pendiente)	Pendiente (Rechazado en Code Review)
BUG-H84-WEB-02	Corrupción de usuarioLiderId con UUID de personal al deseleccionar integrantes y líder no asignado	Integridad / Estado React	Hook / UI	Crítica	Patrulla con 2 o más integrantes cargados	Deseleccionar al líder actual y seleccionar un nuevo funcionario	usuarioLiderId debe reasignarse automáticamente a un usuario_id válido de la dotación	Fallback asigna personal_id provocando error 400 en API o muestra "Líder: No asignado"	ABIERTO	29/10/2026 22:52	(Pendiente)	Pendiente (Rechazado en Code Review)
BUG-H84-WEB-03	Ausencia de bloqueo preventivo de edición ante estados activos EN_MISION, EN_PREVENCION y EN_RECUPERACION	Regla de Negocio ICS	UI / Lógica	Alta	Patrulla en estado EN_MISION con misionActiva null	Inspeccionar botón "Editar Patrulla" en PatrullaCard y Drawer	Botón "Editar Patrulla" deshabilitado con tooltip explicativo de bloqueo	Botón habilitado permitiendo abrir el modal de edición a mitad de turno	ABIERTO	29/10/2026 22:54	(Pendiente)	Pendiente (Rechazado en Code Review)
BUG-H84-WEB-04	Exposición y selección permitida de personal no disponible (en otra patrulla o de licencia médica)	Validación / Negocio ICS	UI / Componente	Alta	Empleados con estado_operativo = 'en_patrulla' o 'licencia'	Abrir selector de dotación en PatrullaEditarModal	Funcionarios ocupados deshabilitados con etiqueta de no disponibilidad	Checkbox activo y seleccionable permitiendo doble asignación en terreno	ABIERTO	29/10/2026 22:56	(Pendiente)	Pendiente (Rechazado en Code Review)
BUG-H84-WEB-05	Desincronización y cierre forzado del Drawer de Detalle tras edición y warnings de act en tests	Estado React / QA	Integración UI	Media	Patrulla abierta en PatrullaDetalleDrawer	Presionar "Editar Patrulla", modificar datos y confirmar guardado	Drawer permanece abierto mostrando la ficha técnica actualizada fidedignamente	Drawer se destruye y el usuario es expulsado a la grilla general de patrullas	ABIERTO	29/10/2026 22:58	(Pendiente)	Pendiente (Rechazado en Code Review)
CP-H84-WEB-01	Despliegue de acción Editar Patrulla en tarjeta de Centro de Mando para patrulla DISPONIBLE	Funcional / UI	Componente	Alta	Patrulla en estado DISPONIBLE y usuario con permiso recursos:editar	Renderizado de PatrullaCard en AdminPatrullasClient	Botón "Editar Patrulla" visible y habilitado en la fila de acciones	Botón visible con icono Edit y estilo institucional habilitado	APROBADO	29/10/2026 23:00	-	feat(patrullas): implementar modificacion de delegacion, vehiculo y personal (HU-84)
CP-H84-WEB-02	Despliegue de acción Editar Patrulla en el pie del Drawer de Detalle (PatrullaDetalleDrawer)	Funcional / UI	Componente	Alta	Patrulla seleccionada en inspección unitaria	Clic en "Ver Ficha" abriendo PatrullaDetalleDrawer	Botón "Editar Patrulla" presente en el footer del Drawer con icono	Botón interactivo renderizado con icono Edit y prop puedeEditar	APROBADO	29/10/2026 23:02	-	feat(patrullas): implementar modificacion de delegacion, vehiculo y personal (HU-84)
CP-H84-WEB-03	Precarga íntegra de atributos actuales en formulario de edición (PatrullaEditarModal)	Funcional	Formulario / Hook	Alta	Patrulla con delegación, vehículo y dotación asignados	Apertura de PatrullaEditarModal	Campos precargados: nombre, delegación seleccionada, vehículo y dotación	Todos los campos precargados fielmente desde la entidad suministrada	APROBADO	29/10/2026 23:04	-	feat(patrullas): implementar modificacion de delegacion, vehiculo y personal (HU-84)
CP-H84-WEB-04	Visualización del código identificador táctico en modo de solo lectura deshabilitado	Regla de Negocio / UI	Formulario	Media	Modal de edición abierto	Inspeccionar input de código identificador de patrulla	Campo deshabilitado (disabled) impidiendo alterar el código único	Input con atributo disabled y valor de código institucional fijo	APROBADO	29/10/2026 23:06	-	feat(patrullas): implementar modificacion de delegacion, vehiculo y personal (HU-84)
CP-H84-WEB-05	Reasignación de delegación base territorial municipal mediante selector desplegable	Funcional	Formulario	Alta	Catálogo de delegaciones cargado en memoria	Cambiar selector a "Delegación Municipal Sur"	formData.delegacionId actualizado y reflejado en el select	Selección reactiva con código y nombre territorial actualizado	APROBADO	29/10/2026 23:08	-	feat(patrullas): implementar modificacion de delegacion, vehiculo y personal (HU-84)
CP-H84-WEB-06	Reasignación de vehículo institucional disponible o desasignación a pie (opción vacía)	Funcional	Formulario	Alta	Catálogo de vehículos disponibles cargado	Seleccionar nueva camioneta o elegir opción "-- Sin vehículo --"	vehiculoId actualizado o fijado en cadena vacía / null	Selector actualiza estado local y permite conmutar vehículo	APROBADO	29/10/2026 23:10	-	feat(patrullas): implementar modificacion de delegacion, vehiculo y personal (HU-84)
CP-H84-WEB-07	Inclusión y exclusión interactiva de funcionarios en dotación mediante checkboxes	Funcional	Componente / Hook	Alta	Catálogo de personal con rol PATRULLA_VERIFICADORA	Clic en funcionario para agregar y remover de personalIds	Array personalIds actualizado dinámicamente y contador reactivo	Checkbox conmuta estado y actualiza lista de seleccionados	APROBADO	29/10/2026 23:12	-	feat(patrullas): implementar modificacion de delegacion, vehiculo y personal (HU-84)
CP-H84-WEB-08	Designación dinámica del funcionario líder responsable de la patrulla mediante selector	Funcional	Formulario	Alta	Al menos 2 funcionarios seleccionados en dotación	Cambiar selector de "Funcionario Líder Responsable"	usuarioLiderId actualizado con el usuario del funcionario elegido	Selector poblado únicamente con integrantes seleccionados	APROBADO	29/10/2026 23:14	-	feat(patrullas): implementar modificacion de delegacion, vehiculo y personal (HU-84)
CP-H84-WEB-09	Despliegue de ventana modal de confirmación previa con resumen de modificaciones	Usabilidad / UI	Modal / Diálogo	Alta	Formulario válido y clic en "Guardar Cambios"	Submit de formulario principal	Modal de confirmación superpuesto con resumen de dotación, delegación y móvil	Diálogo de confirmación desplegado con resumen claro institucional	APROBADO	29/10/2026 23:16	-	style(patrullas): mejorar diseno institucional de ventana de confirmacion de edicion
CP-H84-WEB-10	Envío exitoso de petición PUT /api/patrullas/[id] y notificación toast de éxito	Integración	Servicio / API	Crítica	Confirmación aceptada por el usuario Administrador	Clic en "Confirmar y Guardar" en modal de confirmación	Petición PUT despachada, respuesta 200 OK y toast de éxito disparado	PUT ejecutado exitosamente y toast de confirmación mostrado	APROBADO	29/10/2026 23:18	-	feat(patrullas): implementar modificacion de delegacion, vehiculo y personal (HU-84)
CP-H84-WEB-11	Deshabilitación y bloqueo visual del botón Editar Patrulla en patrullas en EN_VERIFICACION	Regla de Negocio ICS	UI / Botón	Crítica	Patrulla en estado operativo EN_VERIFICACION	Visualización en grilla general o Drawer	Botón deshabilitado con atributo disabled y tooltip de bloqueo táctico	Botón deshabilitado con aria-label y tooltip explicativo	APROBADO	29/10/2026 23:20	-	feat(patrullas): implementar modificacion de delegacion, vehiculo y personal (HU-84)
CP-H84-WEB-12	Deshabilitación y bloqueo visual ante patrullas con misión activa en terreno	Regla de Negocio ICS	UI / Botón	Crítica	Patrulla con misionActiva en curso	Renderizado de PatrullaCard	Botón Editar Patrulla deshabilitado impidiendo alterar equipo	Botón inactivo impidiendo modificar patrulla en misión	APROBADO	29/10/2026 23:22	-	feat(patrullas): implementar modificacion de delegacion, vehiculo y personal (HU-84)
CP-H84-WEB-13	Despliegue de banner InlineNotice de bloqueo preventivo dentro del modal de edición	Usabilidad / Feedback	Modal / Noticia	Alta	Patrulla bloqueada por estado operativo	Apertura forzada o inspección de modal bloqueado	InlineNotice rojo indicando imposibilidad de editar patrulla en terreno	Banner InlineNotice visible y botón de guardado inactivo	APROBADO	29/10/2026 23:24	-	feat(patrullas): implementar modificacion de delegacion, vehiculo y personal (HU-84)
CP-H84-WEB-14	Manejo y presentación de error HTTP 409 Conflict proveniente del backend	Manejo de Errores	Hook / UI	Alta	Backend responde 409 Conflict por colisión en misión o vehículo	Confirmar guardado en modal	Banner de conflicto desplegado con mensaje explicativo del servidor	esConflicto activo y mensaje de colisión visualizado en modal	APROBADO	29/10/2026 23:26	-	feat(patrullas): implementar modificacion de delegacion, vehiculo y personal (HU-84)
CP-H84-WEB-15	Manejo de error HTTP 403 Forbidden para usuarios sin permiso recursos:editar	Seguridad (RBAC)	Servicio / UI	Crítica	Usuario sin permiso recursos:editar ni rol Administrador	Invocar patrullasService.editar()	esForbidden = true y mensaje de denegación de privilegios	Error 403 capturado y expuesto en resultado de servicio	APROBADO	29/10/2026 23:28	-	feat(patrullas): implementar modificacion de delegacion, vehiculo y personal (HU-84)
CP-H84-WEB-16	Manejo y renderizado de errores de validación HTTP 400 Bad Request con array errors	Robustez API	Hook / Formulario	Media	Backend responde 400 con arreglo de errores de validación	Confirmar guardado	serverFieldErrors poblado y errores expuestos en los campos correspondientes	Errores de validación de servidor mapeados fidedignamente	APROBADO	29/10/2026 23:30	-	feat(patrullas): implementar modificacion de delegacion, vehiculo y personal (HU-84)
CP-H84-WEB-17	Manejo de error de conexión o fallo 500 del servidor municipal	Resiliencia	Servicio / UI	Media	Servidor API inaccesible o fallo de red	Confirmar guardado	Mensaje claro: "Error de conexión con el servidor municipal..."	Error de conexión controlado sin caída de la aplicación React	APROBADO	29/10/2026 23:32	-	feat(patrullas): implementar modificacion de delegacion, vehiculo y personal (HU-84)
CP-H84-WEB-18	Cierre del modal de edición mediante botón Cancelar o tecla Escape	Accesibilidad / UX	Modal / Teclado	Media	Modal de edición abierto	Presionar botón "Cancelar", "X" o tecla Escape	Modal cerrado limpiamente sin aplicar modificaciones	Modal cerrado y foco retornado al elemento desencadenante	APROBADO	29/10/2026 23:34	-	feat(patrullas): implementar modificacion de delegacion, vehiculo y personal (HU-84)
CP-H84-WEB-19	Validación reactiva del botón Guardar Cambios deshabilitado si el formulario no es válido	Validación (Zod)	Formulario / Botón	Media	Formulario con delegación vacía o sin integrantes seleccionados	Inspeccionar botón de guardado en footer de modal	Botón Guardar Cambios deshabilitado (disabled)	Botón inactivo hasta cumplir con todos los campos obligatorios	APROBADO	29/10/2026 23:36	-	feat(patrullas): implementar modificacion de delegacion, vehiculo y personal (HU-84)
CP-H84-WEB-20	Actualización reactiva de la tarjeta de patrulla tras confirmación de guardado	Tiempo Real / React	Cliente / Grid	Alta	Edición exitosa completada en modal	Ejecución de callback onPatrullaActualizada	Tarjeta en grid recargada con nuevos valores de delegación y nombre	Lista de patrullas refrescada inmediatamente sin recargar la página	APROBADO	29/10/2026 23:38	-	feat(patrullas): implementar modificacion de delegacion, vehiculo y personal (HU-84)
```

---

## 6. Guía Paso a Paso 100% Replicable de Ejecución de Pruebas

### 6.1 Ejecución Automatizada en Vitest
Para ejecutar las suites automatizadas de edición de patrullas:
```bash
npm --prefix ../web test -- patrullas
```
**Salida de consola obtenida:**
```text
 ✓ src/services/__tests__/patrullasService.test.ts (18 tests) 26ms
 ✓ src/hooks/__tests__/usePatrullas.test.ts (6 tests) 91ms
 ✓ src/components/mando/patrullas/__tests__/PanelPatrullas.test.tsx (7 tests) 446ms
 ✓ src/components/admin/patrullas/__tests__/PatrullaEditarModal.test.tsx (5 tests) 475ms
 ✓ src/components/admin/patrullas/__tests__/NuevoPatrullaClient.test.tsx (4 tests) 480ms
 ✓ src/components/admin/patrullas/__tests__/AdminPatrullasClient.test.tsx (8 tests) 803ms

 Test Files  6 passed (6)
      Tests  48 passed (48)
   Duration  2.55s
```

Para ejecutar las pruebas del hook de edición:
```bash
npm --prefix ../web test -- useEditarPatrullaForm
```
**Salida obtenida:**
```text
 ✓ src/hooks/__tests__/useEditarPatrullaForm.test.ts (4 tests) 30ms
   ✓ useEditarPatrullaForm (HU-84: Edición de Patrulla Verificadora) > 1. precarga los valores actuales de la patrulla disponible y valida como válida (isValid: true) 20ms
   ✓ useEditarPatrullaForm (HU-84: Edición de Patrulla Verificadora) > 2. bloquea la edición si la patrulla se encuentra en verificación o misión activa 2ms
   ✓ useEditarPatrullaForm (HU-84: Edición de Patrulla Verificadora) > 3. permite actualizar campos y enviar edición exitosamente (200 OK) 5ms
   ✓ useEditarPatrullaForm (HU-84: Edición de Patrulla Verificadora) > 4. maneja respuesta 409 Conflict registrando esConflicto y exponiendo el mensaje 2ms

 Test Files  1 passed (1)
      Tests  4 passed (4)
   Duration  1.16s
```

---

### 6.2 Comandos cURL Replicables y Respuestas HTTP/JSON

#### Caso 1: Envío de Modificación Exitosa desde Frontend (`CP-H84-WEB-10`)
```bash
curl -X PUT "http://localhost:3000/api/patrullas/f1000000-0000-4000-8000-000000000001"   -H "Content-Type: application/json"   -H "x-user-id: 00000000-0000-4000-8000-000000000001"   -d '{
    "nombre": "Patrulla Costa 01 - Reforzada",
    "delegacionId": "30000000-0000-4000-8000-000000000003",
    "vehiculoId": "e1000000-0000-4000-8000-000000000002",
    "personalIds": ["b1000000-0000-4000-8000-000000000001"],
    "usuarioLiderId": "c1000000-0000-4000-8000-000000000001"
  }'
```
**Respuesta Obtenida (`HTTP 200 OK`):**
```json
{
  "message": "Patrulla verificadora modificada exitosamente.",
  "data": {
    "id": "f1000000-0000-4000-8000-000000000001",
    "codigo": "PV-COSTA-01",
    "nombre": "Patrulla Costa 01 - Reforzada",
    "estado": "DISPONIBLE",
    "delegacion": {
      "id": "30000000-0000-4000-8000-000000000003",
      "nombre": "Delegación Costa",
      "codigo": "DEL_COSTA"
    },
    "vehiculo": {
      "id": "e1000000-0000-4000-8000-000000000002",
      "nombre": "Camioneta 4x4 Navara",
      "detalles": { "patente": "CD-FG-23" },
      "estado": "ASIGNADO"
    },
    "lider": {
      "id": "c1000000-0000-4000-8000-000000000001",
      "nombre": "Carlos Muñoz",
      "email": "carlos@valdivia.cl"
    },
    "integrantes": [
      {
        "personalId": "b1000000-0000-4000-8000-000000000001",
        "usuarioId": "c1000000-0000-4000-8000-000000000001",
        "nombre": "Carlos Muñoz",
        "rolEnPatrulla": "LIDER"
      }
    ],
    "misionActiva": null,
    "actualizadoEn": "2026-10-29T23:18:00.000Z"
  }
}
```

#### Caso 2: Manejo de Conflicto 409 por Misión Activa en Terreno (`CP-H84-WEB-14`)
```bash
curl -X PUT "http://localhost:3000/api/patrullas/f1000000-0000-4000-8000-000000000002"   -H "Content-Type: application/json"   -H "x-user-id: 00000000-0000-4000-8000-000000000001"   -d '{
    "delegacionId": "30000000-0000-4000-8000-000000000001",
    "personalIds": ["b1000000-0000-4000-8000-000000000001"]
  }'
```
**Respuesta Obtenida (`HTTP 409 Conflict`):**
```json
{
  "message": "No es posible modificar una patrulla verificadora que se encuentra en estado 'EN_VERIFICACION' o con una misión táctica activa en terreno."
}
```

---

## 7. Matriz de Trazabilidad de Criterios de Aceptación (CA)

| Criterio de Aceptación (HU-84) | Casos de Prueba Vinculados | Estado de Cobertura | Dictamen QA |
|---|---|:---:|---|
| **CA-01:** En el listado y detalle de patrullas, debe existir la acción 'Editar Patrulla' | `CP-H84-WEB-01`, `CP-H84-WEB-02` | 🟢 Cumplido | Implementado en `PatrullaCard` y en el Drawer de Detalle `PatrullaDetalleDrawer`. |
| **CA-02:** El modal debe permitir reasignar vehículo, delegación base y funcionarios asociados | `CP-H84-WEB-03`, `CP-H84-WEB-05`, `CP-H84-WEB-06`, `CP-H84-WEB-07`, `CP-H84-WEB-08`, `BUG-H84-WEB-01`, `BUG-H84-WEB-02`, `BUG-H84-WEB-04` | 🔴 Bloqueado por Bugs | Modal estructurado pero bloqueado por discrepancia de nombre Zod (`BUG-01`), corrupción de `usuarioLiderId` (`BUG-02`) y exposición de personal no disponible (`BUG-04`). |
| **CA-03:** Si la patrulla se encuentra en estado `EN_VERIFICACION` o en misión activa, se debe bloquear la modificación con código `409 Conflict` | `CP-H84-WEB-11`, `CP-H84-WEB-12`, `CP-H84-WEB-13`, `CP-H84-WEB-14`, `BUG-H84-WEB-03` | 🟡 Parcial | Bloqueo activo para `EN_VERIFICACION` y `misionActiva`, pero desprotegido ante `EN_MISION`, `EN_PREVENCION` o `EN_RECUPERACION` (`BUG-03`). |
| **CA-04:** Cada edición debe registrar auditoría (`actualizado_en`) | `CP-H84-WEB-03`, `CP-H84-WEB-10`, `CP-H84-WEB-20` | 🟢 Cumplido | La fecha y hora de actualización se expone en la ficha técnica del Drawer (`drawer-actualizado-en`). |
| **CA-05:** El endpoint `PUT /api/patrullas/{id}` debe requerir permiso `recursos:editar` | `CP-H84-WEB-15` | 🟢 Cumplido | Verificado a través de guardia RBAC `puedeEditar` en componentes y captura de error `403 Forbidden`. |

---

## 8. Conclusión y Próximos Pasos

1. **Estado del Pull Request:** **CHANGES REQUESTED**.
2. **Acción Requerida del Desarrollador (@CristobalVeas):**
   * Sincronizar `editarPatrullaSchema` con el backend agregando `.min(3)` en `nombre`.
   * Corregir el fallback de `usuarioLiderId` en `useEditarPatrullaForm.ts` para que nunca tome un `personal_id` y reasigne al líder si es desmarcado.
   * Extender `estaBloqueada` para incluir los estados `EN_MISION`, `EN_PREVENCION` y `EN_RECUPERACION`.
   * Deshabilitar en la lista de dotación a funcionarios que no tengan `estado_operativo === 'disponible'`.
   * Mantener abierta la ficha técnica actualizada en el Drawer tras completar la edición.
3. **Ciclo de Re-Test:** Una vez aplicados los commits de fix en Conventional Commits, QA ejecutará el re-test formal en `sgrai-web` para otorgar la certificación definitiva.
