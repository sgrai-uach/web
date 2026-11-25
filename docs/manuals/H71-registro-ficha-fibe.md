# Manual de Usuario: Registro de Ficha Básica de Emergencia (FIBE)

**Código Historia de Usuario:** HU-71  
**Módulo:** Asistencia Social — DGRD (`/gestion/asistente-social`)  
**Roles Permitidos:** Asistente Social, Administrador (usuarios con el permiso `asistencia_social:fibe:gestionar`)  
**Versión:** 1.0.0 (SGRAI v0.9.0)

---

## 1. Objetivo de la Funcionalidad

Permitir al **Asistente Social** de la Dirección de Gestión de Riesgos de Desastres (DGRD) ingresar o actualizar la información oficial recopilada en terreno de la **Ficha Básica de Emergencia (FIBE)** para un caso social asignado, formalizando la evaluación de vulnerabilidad de las familias damnificadas y registrando el número de folio oficial único en el expediente municipal.

---

## 2. Requisitos Previos

* Contar con sesión iniciada con un perfil que posea el permiso **`asistencia_social:fibe:gestionar`** (Asistente Social o Administrador).
* El caso social debe encontrarse en estado **`ASIGNADO`** (para registro inicial) o **`EN_EVALUACION_FIBE`** (para edición o corrección antes del cierre).

---

## 3. Flujo Paso a Paso para el Registro de la Ficha FIBE

### Paso 1: Ingresar a la Consola de Asistencia Social
1. En la barra de navegación lateral, ingresar a **Asistencia Social** (`/gestion/asistente-social`).
2. La bandeja muestra por defecto **Todos** los estados. Puede filtrar por estado **`ASIGNADO`** o **`EN_EVALUACION_FIBE`**, por delegación territorial, prioridad o búsqueda de texto.

### Paso 2: Abrir el Formulario de Ficha FIBE
1. Ubicar el caso social correspondiente en la tabla.
2. En la columna **Acciones**, presionar el botón:
   * **`Registrar Ficha FIBE`** cuando el caso está en estado `ASIGNADO`.
   * **`Editar Ficha FIBE`** cuando el caso ya se encuentra en estado `EN_EVALUACION_FIBE` y requiere actualización.

### Paso 3: Completar los Datos Oficiales de Terreno
En el modal desplegado:
1. **Folio oficial de Ficha FIBE (Obligatorio):** Ingresar el código oficial de la ficha física/digital (ej. `FIBE-2026-0001`). Acepta letras, números y guiones (sin espacios, máximo 50 caracteres) y se normaliza automáticamente a mayúsculas.
2. **Integrantes familiares evaluados:** Campo numérico precargado con el catastro preliminar del evento (`personasAfectadas`). Puede ajustarse al número oficial verificado en terreno.
3. **Nivel de daño en vivienda:** Seleccionar la condición habitacional verificada:
   * **Sin daño** (`SIN_DANO`)
   * **Leve** (`LEVE`)
   * **Moderado** (`MODERADO`)
   * **Grave / No habitable** (`GRAVE_INHABITABLE`)
   *(Si existe una evaluación preliminar de Patrulla Verificadora o evento previo, este selector se precarga automáticamente).*
4. **Observaciones sociales de la emergencia (Opcional):** Detallar antecedentes sociales relevantes levantados en terreno (máximo 2000 caracteres).

### Paso 4: Guardar y Verificar la Transición
1. Presionar **`Guardar Ficha FIBE`** (o **`Actualizar Ficha FIBE`** en modo edición).
2. Al confirmarse el guardado (`200 OK`):
   * El caso transiciona automáticamente al estado **`EN_EVALUACION_FIBE`**.
   * El folio oficial queda visible en la columna **Estado** y en el modal **`Ver Detalle`** del expediente.
   * La actualización se sincroniza en tiempo real con el resto de usuarios conectados mediante Socket.io (`asistencia_social:actualizada`).

*(Las capturas de pantalla de este flujo se almacenarán en `docs/manuals/assets/registro-ficha-fibe/`).*

---

## 4. Casos Especiales y Mensajes de Error

| Situación / Código HTTP | Mensaje / Comportamiento en UI | Acción Correctiva |
|---|---|---|
| **Folio vacío o con caracteres inválidos (`400`)** | Error inline bajo el campo folio indicando formato alfanumérico y guiones sin espacios. | Corregir el folio (ej. `FIBE-2026-0001`) y volver a guardar. |
| **Folio FIBE duplicado (`409 Conflict`)** | Alerta junto al campo folio indicando que el folio ya está registrado en otro expediente activo. | Verificar el número de folio físico oficial para evitar duplicidad en la DGRD. |
| **Estado incompatible (`409 Conflict`)** | El botón de registro no se muestra en estados `PENDIENTE`, `FINALIZADO` o `DESCARTADO`; si ocurre vía API, se notifica el conflicto. | Solicitar la asignación previa del caso (estado `ASIGNADO`) antes de registrar la Ficha FIBE. |
| **Sin permiso (`403 Forbidden`)** | El botón de acción permanece oculto en la tabla y el endpoint rechaza la operación. | Verificar con el Administrador que el perfil cuente con `asistencia_social:fibe:gestionar`. |

---

## 5. Relación con Otros Componentes del Sistema

* **`sgrai-api`:** Consume el endpoint `PATCH /api/eventos-atp/asistencia-social/{id}/fibe`, el cual valida unicidad de `folio_fibe`, persiste los datos en `evento_asistencia_social`, registra auditoría y emite el evento WebSocket `asistencia_social:actualizada`.
* **Flujos previos relacionados:** [H28 — Creación de Eventos de Asistencia Social](./H28-crear-evento-asistencia-social.md) y [H26 — Listado de Asistentes Sociales](./H26-listado-asistentes-sociales.md).
