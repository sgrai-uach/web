# Manual de Usuario: H84 — Modificación y Edición de Patrulla Verificadora

Este manual documenta el uso y operación de la funcionalidad de **Edición de Patrullas Verificadoras** en la plataforma web del Sistema de Gestión de Recursos para Atención de Incidentes (SGRAI) de la Municipalidad de Valdivia.

---

## 1. Información General

- **Rol al que está dirigido:** Administrador General y Encargado de Recursos/Logística DGRD (con permiso `recursos:editar`).
- **Objetivo de la funcionalidad:** Permitir al Administrador modificar la delegación base, el vehículo institucional asignado o el personal adscrito a una Patrulla Verificadora registrada para adecuar la composición del equipo operativo ante rotaciones de turno o mantenimiento vehicular, protegiendo estrictamente la trazabilidad de las misiones de verificación en curso.
- **Vista de acceso principal:** `/gestion/admin/patrullas` (pestaña dedicada **"Patrullas Verificadoras"**).
- **Ruta de invocación:**
  1. Menú lateral de navegación **Administración** &rarr; **Patrullas Verificadoras** (`/gestion/admin/patrullas`).
  2. Botón de acción **`[ Editar Patrulla ]`** en cada tarjeta (`PatrullaCard`) de la lista de patrullas.
  3. Botón **`[ Editar Patrulla ]`** dentro del Drawer de ficha técnica unitaria (`PatrullaDetalleDrawer`), accesible al presionar **`[ Ver Ficha ]`**.

> [!IMPORTANT]
> **Protección de Trazabilidad Operativa:** No es posible modificar una patrulla verificadora mientras se encuentre en estado **`EN_VERIFICACION`** o posea una **misión activa en curso**. En dicho escenario, el sistema bloquea preventivamente la acción en la interfaz desplegando el tooltip informativo correspondiente y rechazando cualquier solicitud concurrente con código `409 Conflict`.

---

## 2. Control de Permisos y Acceso (RBAC)

La capacidad de modificar patrullas verificadoras está restringida por la matriz de permisos de la Dirección de Gestión de Riesgo de Desastres:

| Rol de Usuario | Permisos Requeridos | Visualización del Registro | Acción "Editar Patrulla" |
|---|---|---|---|
| **Administrador General** | `recursos:editar`, `recursos:leer` / Acceso Total | **Habilitado** | **Habilitado (Modal Activo)** |
| **Encargado de Logística / Recursos** | `recursos:editar`, `recursos:leer` | **Habilitado** | **Habilitado (Modal Activo)** |
| **Encargado Centro de Mando** | `misiones:leer` (sin `recursos:editar`) | **Habilitado (Solo lectura)** | **Oculto / Deshabilitado** |
| **Operador Call Center / Informante** | Sin permisos requeridos | **Restringido (403 Forbidden)** | **Restringido (403 Forbidden)** |

---

## 3. Guía Paso a Paso para el Operador

### Paso 1: Ingreso a la Pestaña "Patrullas Verificadoras"
1. Inicie sesión en la plataforma municipal con credenciales autorizadas con rol Administrador o permiso `recursos:editar`.
2. Diríjase a **Administración** &rarr; **Patrullas Verificadoras** (`/gestion/admin/patrullas`).
3. Localice en el catálogo la patrulla que requiere modificación vehicular o de dotación (puede utilizar los filtros por delegación, estado o búsqueda por nombre/código).

### Paso 2: Apertura del Modal de Edición
Puede acceder al formulario de edición a través de dos vías:
- **Desde la tarjeta de la patrulla:** En la esquina inferior derecha de la tarjeta, presione el botón **`[ Editar Patrulla ]`**.
- **Desde la Ficha Técnica (Drawer):** Presione **`[ Ver Ficha ]`** en la tarjeta para desplegar el panel lateral con el detalle de integrantes, vehículo y fecha de última actualización. Al pie del panel, presione **`[ Editar Patrulla ]`**.

> [!NOTE]
> Si la unidad se encuentra en misión activa o en verificación en terreno, el botón estará deshabilitado con el cursor de no permitido y el tooltip: *"No es posible editar la patrulla mientras se encuentre en verificación o en misión activa"*.

### Paso 3: Modificación de Datos Tácticos
Una vez abierto el modal **"Editar Patrulla Verificadora"**:
1. **Código Identificador (Inmutable):** El código táctico asignado al momento de su creación (ej. `PV-COSTA-01`) se muestra en un campo de solo lectura para preservar la consistencia con las auditorías del Centro de Mando.
2. **Nombre de la Patrulla (Opcional):** Modifique la denominación legible de la unidad si ha cambiado su propósito operativo (ej. *Patrulla Costa 01 - Reforzada*).
3. **Delegación Base:** Seleccione la nueva delegación municipal base (*Norte*, *Sur*, *Costa* o *Calle Calle*) en caso de redistribución jurisdiccional del equipo.

### Paso 4: Reasignación o Liberación de Vehículo
1. En el selector **Vehículo de Evaluación**, el sistema mostrará:
   - El vehículo institucional actualmente asignado (marcado como *(Actualmente asignado)*).
   - Los vehículos institucionales disponibles en el inventario activo de la municipalidad.
   - La opción *"-- Sin vehículo asignado (Despliegue pedestre / a pie) --"*.
2. Seleccione un nuevo vehículo si el anterior ingresará a mantención técnica o taller, o seleccione la opción pedestre para liberar el vehículo a la flota comunal.

### Paso 5: Ajuste de Dotación y Designación de Líder
1. En la lista de **Selección de Integrantes**, marque o desmarque las casillas de los funcionarios:
   - Para incorporar nuevos funcionarios, marque sus casillas en la lista de personal elegible con rol `PATRULLA_VERIFICADORA`.
   - Para desvincular a un funcionario por rotación de turno, desmarque su casilla.
   - Debe permanecer seleccionado al menos un (1) funcionario operativo.
2. **Líder Táctico:** En el selector desplegable **Funcionario Líder Responsable**, confirme o reasigne al evaluador a cargo de la comunicación oficial con el Centro de Mando.

### Paso 6: Confirmación Previa y Guardado
1. Presione el botón **Guardar Cambios** al pie del modal.
2. Se desplegará el modal de confirmación plana con el resumen de la reconfiguración:
   - Nombre de la patrulla.
   - Delegación territorial asignada.
   - Vehículo seleccionado o modalidad pedestre.
   - Total de dotación y nombre del líder operativo.
3. Presione **Confirmar y Guardar**.

### Paso 7: Actualización y Auditoría Inmediata
1. Al confirmarse la operación exitosa (`200 OK`), el modal se cerrará automáticamente.
2. El sistema desplegará un Toast verde: *"Patrulla [Nombre] modificada exitosamente."*.
3. La tarjeta de la unidad y el panel lateral actualizarán inmediatamente sus datos y registrarán la marca temporal de auditoría en el campo **`actualizadoEn`**.

---

## 4. Casos Especiales y Manejo de Errores

| Situación | Causa | Acción del Sistema / Solución |
|---|---|---|
| **Bloqueo Visual de Edición** | La patrulla tiene estado `EN_VERIFICACION` o `misionActiva !== null`. | El botón "Editar Patrulla" se muestra deshabilitado con el tooltip: *"No es posible editar la patrulla mientras se encuentre en verificación o en misión activa"*. El operador debe esperar a que la patrulla complete el informe de verificación o sea liberada por el Centro de Mando. |
| **Error 409 Conflict (Misión iniciada concurrentemente)** | La patrulla fue despachada por el Centro de Mando mientras el Administrador completaba el formulario. | El sistema rechaza la petición, cancela el guardado y emite un Toast de advertencia notificando el conflicto operativo para proteger la trazabilidad de la misión. |
| **Error 409 Conflict (Vehículo en conflicto)** | El vehículo seleccionado fue asignado concurrentemente a otra patrulla o enviado a mantención. | El modal notificará el conflicto vehicular para que el operador seleccione otra unidad disponible o continúe en modalidad pedestre. |
| **Dotación vacía (0 funcionarios)** | El operador desmarcó a todos los integrantes. | El botón de guardar se mantiene deshabilitado y se resalta el mensaje de error: *"Debe asignar al menos un funcionario con rol PATRULLA_VERIFICADORA a la dotación"*. |
| **Error 403 Forbidden** | La sesión del usuario expiró o carece del privilegio `recursos:editar`. | El sistema notifica que no dispone de los privilegios requeridos para modificar la unidad. |

---

## 5. Relación con Otros Repositorios del SGRAI

- **Backend (`sgrai-api`):**
  - El frontend consume el endpoint `PUT /api/patrullas/:id` implementado bajo la historia HU-84.
  - La API valida permisos RBAC (`recursos:editar`), verifica que la patrulla no posea misiones activas en curso (`PLANIFICADA`, `DESPACHADA`, `EN_CURSO`), actualiza los enlaces en base de datos y estampa la fecha de auditoría `actualizado_en`.
- **Aplicación Móvil de Terreno (`sgrai-web-app` / PWA):**
  - Si un funcionario es removido de la dotación de la patrulla, al iniciar sesión en su dispositivo móvil dejará de estar asociado a la unidad modificada.
  - El funcionario recién asignado asumirá la identidad operativa de la patrulla en su próximo despacho.
