# Informe y Matriz de Casos de Prueba (QA): HU-83 — Alta y Gestión de Patrullas Verificadoras (Frontend Web)

> **Documento Oficial de Aseguramiento de Calidad (QA) — Frontend Web**  
> **Proyecto:** Sistema de Gestión de Recursos para Atención de Incidentes (SGRAI) — Dirección de Gestión de Riesgos de Desastres, Municipalidad de Valdivia.  
> **Módulo:** Recursos y Personal (Operaciones y Logística ICS / Administración).  
> **Historia de Usuario:** HU-83 — *"Como Administrador Quiero registrar una nueva patrulla verificadora ingresando su código de identificación, delegación base y asignando su dotación y vehículo institucional Para habilitar unidades de evaluación primaria y triage que acudan rápidamente a constatar la veracidad de los avisos ciudadanos en terreno"*.  
> **Desarrollador Asignado:** Cristóbal Veas.  
> **QA Lead / Auditor Técnico:** Antigravity QA Team  
> **Aplicación Cliente:** `sgrai-web` (Next.js 16 App Router + React 19 + TypeScript + Vanilla CSS Modules + Vitest + Testing Library + Socket.io Client).  
> **Rama Git Evaluada:** `feature/h83-crear-patrulla`  
> **Commits Clave Evaluados (Conventional Commits):**
> * `feat(patrullas): crear hook useNuevaPatrullaForm con validaciones Zod y tests (HU-83)`
> * `feat(ui): implementar formulario en /gestion/admin/patrullas/nuevo y navegacion (HU-83)`
> * `docs(manuals): redactar manual de usuario institucional H83-crear-patrulla.md (HU-83)`
> * `feat(patrullas): mover gestion de patrullas a pestaña dedicada con modal de alta (HU-83)`
> * `fix(patrullas): corregir exportacion en turbopack, desacoplar de mando, duplicacion de icono y lenguaje natural en formulario`
> * `fix(patrullas): subsanar observaciones de auditoria QA en HU-83 (BUG-H83-WEB-01 al 05)`
> 
> **Fecha de Auditoría Inicial QA:** 28 de Octubre de 2026.  
> **Fecha de Re-Test y Certificación Final:** 2 de Noviembre de 2026 11:30.  
> **Estado de Certificación QA:** 🟢 **APROBADO Y CERTIFICADO PARA PRODUCCIÓN (100% PASS TRAS RE-TEST EXITOSO)**.

---

## 1. Resumen Ejecutivo de la Auditoría Forense y Re-Test de QA

Durante el ciclo de **Re-Test técnico y forense** sobre la rama `feature/h83-crear-patrulla` en `sgrai-web`, se comprobó que los **5 defectos detectados en la auditoría inicial (1 Crítico, 3 Altos y 1 Medio) fueron subsanados íntegramente** por el desarrollador en el commit `4186313`.

La solución restituye el formulario de página completa en la ruta dedicada `/gestion/admin/patrullas/nuevo` evaluando el permiso RBAC `recursos:crear`, sincroniza la validación Zod con la especificación OpenAPI de la API (`min(3)` en nombre), protege la doctrina operativa del Sistema de Comando de Incidentes (ICS) inhabilitando la selección de brigadistas ocupados, restaura el botón táctico y modal de monitoreo de patrullas en la consola del Centro de Mando (`KanbanHeader` y `KanbanBoard`), y deja el linter ESLint en 0 errores.

| Métrica de Calidad Frontend | Resultado de Auditoría Inicial | Resultado Re-Test Final | Observaciones de Certificación |
|---|:---:|:---:|---|
| **Total de Casos Diseñados y Evaluados** | **25** | **25** | 20 Casos Funcionales/Integración + 5 Defectos Formalizados |
| **Casos Aprobados (Passed)** | 20 | **25** | **100% de aprobación** de la matriz de pruebas |
| **Casos Fallidos / Defectos Abiertos** | 5 | **0** | **100% de defectos resueltos y verificados** |
| **Dictamen de Code Review para PR** | 🔴 Changes Requested | 🟢 **APPROVED** | **Aprobado para merge a `develop`** |
| **Suite Automatizada de Patrullas (Vitest)** | 40/40 tests | **42/42 tests** | Inclusión de pruebas para validación Zod de nombre e ICS de dotación |
| **Suite de Consola de Mando (`KanbanHeader`)** | 5/5 tests | **6/6 tests** | Verificación de botón `Patrullas` y callback `onAbrirPatrullas` |
| **Suite Global del Proyecto (Vitest)** | 657/657 tests | **695/695 tests** | 115 archivos de prueba ejecutados sin fallas ni regresiones |
| **Conformidad ESLint / React Hooks** | ❌ 2 errores bloqueantes | 🟢 **0 errores** | Limpieza de `set-state-in-effect` y `react-hooks/refs` |
| **Chequeo de Tipos Estáticos (`tsc --noEmit`)** | 🟢 0 errores | 🟢 **0 errores** | Compilación TypeScript limpia sin aserciones `any` |
| **Cumplimiento Guía Visual Municipal (`GEMINI.md`)** | 🟢 100% | 🟢 **100%** | Componentes institucionales, paleta Valdivia, iconografía Lucide |
| **Integridad ICS (Comando de Incidentes)** | ❌ Violado | 🟢 **PROTEGIDO** | Inhabilitación estricta de personal ocupado (`en_patrulla`, `en_mision`) |
| **Visibilidad Centro de Mando (CA-5)** | ❌ Regresión | 🟢 **RESTABLECIDA** | Acceso táctico directo desde cabecera del Centro de Mando |

---

## 2. Registro Forense de Defectos Detectados en QA y Validación de Re-Test

| ID Defecto | Descripción Resumida del Defecto | Severidad | Módulo / Archivo Afectado | Fecha Hallazgo | Estado | Commit del Fix (Sin Hash) | Fecha Re-Test | Dictamen QA |
|---|---|:---:|---|:---:|:---:|---|:---:|:---:|
| `BUG-H83-WEB-01` | **Redirección forzada y código muerto en `/gestion/admin/patrullas/nuevo`:** La ruta ejecutaba redirect hacia modal en la grilla; usuarios con `recursos:crear` sin `misiones:leer` eran bloqueados. | Alta | `src/app/(gestion)/gestion/admin/patrullas/nuevo/page.tsx`, `NuevoPatrullaClient.tsx` | 28/10/2026 15:10 | `RESUELTO` | fix(patrullas): subsanar observaciones de auditoria QA en HU-83 (BUG-H83-WEB-01 al 05) | 02/11/2026 11:30 | 🟢 **CERRADO / VERIFICADO:** `page.tsx` monta directamente `<NuevoPatrullaClient />`. Evalúa el permiso `recursos:crear` o rol `ADMIN`. Probado en `NuevoPatrullaClient.test.tsx` (4 tests pass). |
| `BUG-H83-WEB-02` | **Discrepancia contractual en validación Zod de `nombre`:** Cliente aceptaba nombres de 1 o 2 caracteres, pero la API backend exige `.min(3)`. Al enviar provocaba HTTP 400 Bad Request. | Alta | `src/hooks/useNuevaPatrullaForm.ts` | 28/10/2026 15:12 | `RESUELTO` | fix(patrullas): subsanar observaciones de auditoria QA en HU-83 (BUG-H83-WEB-01 al 05) | 02/11/2026 11:30 | 🟢 **CERRADO / VERIFICADO:** `nuevaPatrullaSchema` valida con `.refine((val) => !val || val.length >= 3)`. Probado en `useNuevaPatrullaForm.test.ts` (test 8 pass). |
| `BUG-H83-WEB-03` | **Omisión de filtro de disponibilidad en personal y selección de funcionarios ocupados:** El catálogo permitía seleccionar brigadistas con estado `en_patrulla` o no disponible. | Crítica (ICS) | `src/components/admin/patrullas/PatrullaDotacionSection.tsx` y `src/hooks/useNuevaPatrullaForm.ts` | 28/10/2026 15:14 | `RESUELTO` | fix(patrullas): subsanar observaciones de auditoria QA en HU-83 (BUG-H83-WEB-01 al 05) | 02/11/2026 11:30 | 🟢 **CERRADO / VERIFICADO:** Tarjetas no disponibles con `aria-disabled="true"`, checkbox `disabled`, cursor `not-allowed` y click bloqueado. Hook valida en `handleTogglePersonal`. Probado en `useNuevaPatrullaForm.test.ts` (test 9 pass). |
| `BUG-H83-WEB-04` | **Regresión en Centro de Mando por eliminación de acceso a patrullas:** Se había eliminado el botón de patrullas en la cabecera y el modal en el tablero kanban de incidentes (CA-5). | Alta | `src/components/mando/KanbanHeader.tsx` y `src/components/mando/KanbanBoard.tsx` | 28/10/2026 15:16 | `RESUELTO` | fix(patrullas): subsanar observaciones de auditoria QA en HU-83 (BUG-H83-WEB-01 al 05) | 02/11/2026 11:30 | 🟢 **CERRADO / VERIFICADO:** Restablecido botón "Patrullas" en `KanbanHeader.tsx` con ícono `ShieldCheck` y montado `PanelPatrullasModal` en `KanbanBoard.tsx`. Probado en `KanbanHeader.test.tsx` (6 tests pass). |
| `BUG-H83-WEB-05` | **Errores bloqueantes de linter ESLint y React Hooks:** Falla en pipeline CI por mutación de `filtrosRef.current` durante el render y `setState` síncrono en efecto. | Media | `src/components/admin/patrullas/AdminPatrullasClient.tsx` y `src/hooks/usePatrullas.ts` | 28/10/2026 15:18 | `RESUELTO` | fix(patrullas): subsanar observaciones de auditoria QA en HU-83 (BUG-H83-WEB-01 al 05) | 02/11/2026 11:30 | 🟢 **CERRADO / VERIFICADO:** `filtrosRef.current` y `consultarRef.current` sincronizados en `useEffect`. Estado en `AdminPatrullasClient` inicializado de forma diferida. `npm run lint` finaliza con 0 errores. |

---

### Evidencias Forenses Detalladas de Corrección por Defecto:

#### Verificación Forense BUG-H83-WEB-01 (Rutas y Dead Code)
- En `src/app/(admin)/admin/patrullas/nuevo/page.tsx` y `src/app/(gestion)/gestion/admin/patrullas/nuevo/page.tsx` se removió la llamada a `redirect('/gestion/admin/patrullas?nuevo=1')` y se monta directamente `<NuevoPatrullaClient />`.
- En `NuevoPatrullaClient.tsx`, la guardia RBAC evalúa:
  ```typescript
  const puedeCrear =
    auth?.usuario
      ? auth.tieneAlgunPermiso(['recursos:crear']) || auth.usuario.rolCodigo === 'ADMIN'
      : session?.usuarioActivo
      ? Boolean(session.hasAnyPermission ? session.hasAnyPermission(['recursos:crear']) : session.hasPermission?.('recursos:crear')) || session.usuarioActivo.esAdmin
      : true;
  ```
- Un usuario con `recursos:crear` accede de inmediato al formulario institucional de alta; si carece de dicho permiso, se despliega `AccesoDenegadoState` indicando el permiso requerido `"recursos:crear"` y con enlace de retorno a `/gestion`.

#### Verificación Forense BUG-H83-WEB-02 (Contrato OpenAPI)
- En `src/hooks/useNuevaPatrullaForm.ts`, el validador Zod `nuevaPatrullaSchema` se actualizó:
  ```typescript
  nombre: z
    .string()
    .trim()
    .max(100, 'El nombre no puede exceder 100 caracteres.')
    .refine((val) => !val || val.length >= 3, {
      message: 'El nombre debe tener al menos 3 caracteres.',
    })
    .optional(),
  ```
- Se añadió la prueba unitaria 8 en `useNuevaPatrullaForm.test.ts`, confirmando que ingresar `"PV"` produce el error en cliente `'El nombre debe tener al menos 3 caracteres.'` y bloquea el guardado antes de consultar a la API, previniendo el error 400 Bad Request.

#### Verificación Forense BUG-H83-WEB-03 (Doctrina ICS de Disponibilidad)
- En `src/components/admin/patrullas/PatrullaDotacionSection.tsx`:
  - Se calcula `const isDisponible = !p.estado_operativo || p.estado_operativo === 'disponible'`.
  - La tarjeta recibe las clases `${!isDisponible ? styles.personalCardDisabled : ''}` con `cursor: not-allowed` y `opacity: 0.6`.
  - El elemento interactivo cuenta con `aria-disabled={!isDisponible}`, `tabIndex={isDisponible ? 0 : -1}`, y el handler `onClick` ignora clics si `!isDisponible`.
  - El input checkbox nativo recibe `disabled={!isDisponible}`.
- En `src/hooks/useNuevaPatrullaForm.ts`:
  - El callback `handleTogglePersonal` verifica `if (!yaSeleccionado && empleado && empleado.estado_operativo && empleado.estado_operativo !== 'disponible') return prev;`.
- Se añadió la prueba unitaria 9 en `useNuevaPatrullaForm.test.ts`, confirmando que funcionarios en estado `'en_patrulla'` son rechazados por la función selectora.

#### Verificación Forense BUG-H83-WEB-04 (Restitución de Acceso en Centro de Mando)
- En `src/components/mando/KanbanHeader.tsx`:
  - Se reincorporó la prop opcional `onAbrirPatrullas?: () => void`.
  - Cuando se suministra, se renderiza el botón secundario institucional con ícono `<ShieldCheck size={14} />` y texto `"Patrullas"`.
- En `src/components/mando/KanbanBoard.tsx`:
  - Se administra el estado `const [patrullasModalAbierto, setPatrullasModalAbierto] = useState(false);`.
  - Se enlaza `onAbrirPatrullas={() => setPatrullasModalAbierto(true)}` al `KanbanHeader`.
  - Se monta `<PanelPatrullasModal isOpen={patrullasModalAbierto} onClose={() => setPatrullasModalAbierto(false)} ... />`.
- En `src/components/mando/__tests__/KanbanHeader.test.tsx` se actualizaron las pruebas unitarias para validar que el botón renderiza y dispara el callback al pulsarlo.

#### Verificación Forense BUG-H83-WEB-05 (Conformidad Linter ESLint)
- En `src/components/admin/patrullas/AdminPatrullasClient.tsx`:
  - Se reemplazó la llamada síncrona dentro de `useEffect` por inicialización de estado en render:
    `const [modalCrearAbierto, setModalCrearAbierto] = useState(() => searchParams?.get('nuevo') === '1');`.
- En `src/hooks/usePatrullas.ts`:
  - Las asignaciones a `filtrosRef.current` y `consultarRef.current` se encapsularon dentro de `useEffect`.
- La ejecución de `npm run lint` finaliza con código de salida 0 (0 errores).

---

## 3. Mensaje Técnico de Code Review para Aprobación del PR (Approved)

```markdown
### 🟢 Pull Request Review: APPROVED (Certificación QA HU-83 — Re-Test Exitoso)

**Para:** Cristóbal Veas (@zetastormy )  
**De:** QA Lead — Dirección de Gestión de Riesgos de Desastres (SGRAI)  
**Rama:** `feature/h83-crear-patrulla` -> `develop`  
**Historia de Usuario:** HU-83 — *Alta y Gestión de Patrullas Verificadoras*  
**Resultado de Certificación:** 🟢 **APROBADO PARA PRODUCCIÓN (100% PASS EN RE-TEST)**

---

Hola Cristóbal,

He completado la re-evaluación técnica formal (Re-Test) sobre los commits de corrección en la rama `feature/h83-crear-patrulla`. 

Los **5 defectos detectados en la auditoría inicial han sido subsanados en su totalidad**:

1. **[BUG-H83-WEB-01] Resuelto:** La ruta `/gestion/admin/patrullas/nuevo` monta directamente `NuevoPatrullaClient` evaluando el permiso RBAC `recursos:crear` sin redirección forzosa, eliminando el código muerto y cumpliendo el CA-1.
2. **[BUG-H83-WEB-02] Resuelto:** La regla Zod en `nuevaPatrullaSchema` exige mínimo 3 caracteres en el campo opcional `nombre`, alineándose con el contrato OpenAPI del backend y previniendo respuestas HTTP 400.
3. **[BUG-H83-WEB-03] Resuelto:** La lista de dotación en `PatrullaDotacionSection` deshabilita con `aria-disabled`, cursor bloqueado y validación en hook a los brigadistas no disponibles (`en_patrulla`, `en_mision`), salvaguardando la doctrina ICS.
4. **[BUG-H83-WEB-04] Resuelto:** Se restableció el botón táctico `Patrullas` en `KanbanHeader` y el modal `PanelPatrullasModal` en `KanbanBoard`, restituyendo la visibilidad inmediata de unidades en terreno para el Encargado del Centro de Mando (CA-5).
5. **[BUG-H83-WEB-05] Resuelto:** Se corrigieron las advertencias de React 19 (`set-state-in-effect` y `react-hooks/refs`). El análisis estático (`npm run lint`) y chequeo de tipos (`tsc --noEmit`) finalizan con 0 errores.

### Métricas de Validación de Re-Test:
- **Suite Automatizada de Patrullas:** 42/42 tests pasando en Vitest.
- **Suite de Consola de Mando (`KanbanHeader`):** 6/6 tests pasando en Vitest.
- **Suite Global del Proyecto:** 695/695 tests pasando en 115 archivos de prueba.
- **Linter ESLint:** 0 errores.
- **TypeScript:** 0 errores.

¡Felicitaciones por el trabajo y la rápida resolución! La rama queda **certificada y aprobada para merge a `develop`**.
```

---

## 4. Matriz Consolidada de Casos de Prueba (13 Columnas Oficiales)

| ID Caso | Título del Caso de Prueba | Tipo de Prueba | Nivel | Prioridad | Precondición | Datos de Prueba (Payload / Headers / Query) | Resultado Esperado | Resultado Obtenido | Estado | Fecha / Hora Ejecución | Fecha / Hora Re-Test | Solución / Commit |
|---|---|---|---|---|---|---|---|---|:---:|:---:|:---:|---|
| `BUG-H83-WEB-01` | Redirección forzosa en /gestion/admin/patrullas/nuevo hacia modal y código muerto en NuevoPatrullaClient | Navegación / Routing | UI / Router | Alta | Usuario con permiso `recursos:crear` sin `misiones:leer` | GET directo a `/gestion/admin/patrullas/nuevo` | Formulario de página completa accesible según CA-1 | Formulario montado directamente evaluando permisos sin redirecciones forzosas | **APROBADO** | 28/10/2026 15:10 | 02/11/2026 11:30 | fix(patrullas): subsanar observaciones de auditoria QA en HU-83 (BUG-H83-WEB-01 al 05) |
| `BUG-H83-WEB-02` | Discrepancia contractual en validación Zod de nombre (min 3 chars en API omitido en web) | Validación (Zod) | UI / Form | Alta | Formulario de alta abierto | `codigo: 'PV-01'`, `nombre: 'P1'` | Validación cliente exige min 3 chars si nombre no está vacío | Error inline en cliente bloquea guardado y previene error 400 Bad Request | **APROBADO** | 28/10/2026 15:12 | 02/11/2026 11:30 | fix(patrullas): subsanar observaciones de auditoria QA en HU-83 (BUG-H83-WEB-01 al 05) |
| `BUG-H83-WEB-03` | Omisión de filtro de disponibilidad en personal y selección habilitada de brigadistas ocupados | Regla de Negocio (ICS) | UI / Form | Crítica | Funcionario con estado `en_patrulla` en catálogo | Clic sobre tarjeta con `Estado: En patrulla` | Tarjeta deshabilitada con cursor not-allowed y bloqueo de selección | Tarjeta con aria-disabled="true", cursor not-allowed y selección bloqueada | **APROBADO** | 28/10/2026 15:14 | 02/11/2026 11:30 | fix(patrullas): subsanar observaciones de auditoria QA en HU-83 (BUG-H83-WEB-01 al 05) |
| `BUG-H83-WEB-04` | Regresión en Centro de Mando: Eliminación de acceso a patrullas en KanbanHeader y KanbanBoard | Regresión / UI | UI / Mando | Alta | Encargado en `/gestion/centro-incidentes` | Inspección de cabecera de Centro de Mando | Botón accesible para monitorear patrullas verificadoras (CA-5) | Botón "Patrullas" y modal PanelPatrullasModal restituidos y operativos | **APROBADO** | 28/10/2026 15:16 | 02/11/2026 11:30 | fix(patrullas): subsanar observaciones de auditoria QA en HU-83 (BUG-H83-WEB-01 al 05) |
| `BUG-H83-WEB-05` | Errores bloqueantes de linter ESLint y React Hooks en AdminPatrullasClient y usePatrullas | Calidad / Linter | CI / Code | Media | Ejecución en consola | `npm run lint` | 0 errores y 0 advertencias en código de patrullas | 0 errores de ESLint, mutación de refs en useEffect y lazy state implementados | **APROBADO** | 28/10/2026 15:18 | 02/11/2026 11:30 | fix(patrullas): subsanar observaciones de auditoria QA en HU-83 (BUG-H83-WEB-01 al 05) |
| `CP-H83-WEB-01` | Renderizado y diseño institucional del modal PatrullaCrearModal en /gestion/admin/patrullas | Funcional / UI | UI / Modal | Alta | Administrador autenticado en `/gestion/admin/patrullas` | Clic en botón `[ + Nueva Patrulla ]` | Modal visible con cabecera verde institucional y 4 secciones | Modal desplegado con accesibilidad y diseño Valdivia intacto | **APROBADO** | 28/10/2026 15:20 | 02/11/2026 11:30 | feat(patrullas): mover gestion de patrullas a pestaña dedicada con modal de alta (HU-83) |
| `CP-H83-WEB-02` | Validación en cliente de campos obligatorios (código, delegación y personal) con Zod | Validación (Zod) | UI / Form | Crítica | Formulario de alta recién abierto | Clic directo en "Guardar Patrulla" con formulario vacío | Mensajes de error en rojo bajo cada campo obligatorio | Mensajes inline descriptivos desplegados en cada sección | **APROBADO** | 28/10/2026 15:22 | 02/11/2026 11:30 | feat(patrullas): crear hook useNuevaPatrullaForm con validaciones Zod y tests (HU-83) |
| `CP-H83-WEB-03` | Sanitización automática de código en mayúsculas y reemplazo de espacios por guiones | Usabilidad / UX | UI / Input | Media | Campo Código Identificador activo | Entrada de texto: `"pv norte 01"` | El input refleja automáticamente `"PV-NORTE-01"` | Sanitización reactiva en tiempo real en mayúsculas y con guiones | **APROBADO** | 28/10/2026 15:24 | 02/11/2026 11:30 | feat(patrullas): crear hook useNuevaPatrullaForm con validaciones Zod y tests (HU-83) |
| `CP-H83-WEB-04` | Carga asíncrona de delegaciones activas en selector de Delegación Base | Integración / DAL | UI / Selector | Alta | Catálogos municipales en API disponibles | Montaje de sección Delegación Municipal | Selector cargado con Norte, Sur, Costa y Calle Calle | Opciones pobladas fielmente con UUIDs correspondientes | **APROBADO** | 28/10/2026 15:26 | 02/11/2026 11:30 | feat(patrullas): crear hook useNuevaPatrullaForm con validaciones Zod y tests (HU-83) |
| `CP-H83-WEB-05` | Carga asíncrona y filtrado de vehículos disponibles individuales (DISPONIBLE y esIndividual) | Integración / DAL | UI / Selector | Alta | Inventario logístico municipal en API disponible | Montaje de sección Vehículo Institucional | Selector exhibe vehículos individuales con patente y modelo | Solo recursos individuales disponibles listados en opciones | **APROBADO** | 28/10/2026 15:28 | 02/11/2026 11:30 | feat(patrullas): crear hook useNuevaPatrullaForm con validaciones Zod y tests (HU-83) |
| `CP-H83-WEB-06` | Opción de registrar patrulla pedestre sin vehículo asignado | Funcional | UI / Form | Media | Dotación de personal configurada | Selección de opción `-- Sin vehículo asignado --` | `vehiculoId` se envía como `null` en el payload | Formulario permite guardar patrulla a pie sin errores | **APROBADO** | 28/10/2026 15:30 | 02/11/2026 11:30 | feat(patrullas): crear hook useNuevaPatrullaForm con validaciones Zod y tests (HU-83) |
| `CP-H83-WEB-07` | Carga asíncrona de personal elegible con rol PATRULLA_VERIFICADORA y ficha operativa | Integración / DAL | UI / Listado | Alta | Base de datos de personal activa | Montaje de sección Dotación y Personal | Listado renderiza únicamente funcionarios habilitados para patrulla | Personal con rol operativo de verificación listado en tarjetas | **APROBADO** | 28/10/2026 15:32 | 02/11/2026 11:30 | feat(patrullas): crear hook useNuevaPatrullaForm con validaciones Zod y tests (HU-83) |
| `CP-H83-WEB-08` | Asignación interactiva de personal mediante tarjetas con checkbox accesible y badges | Usabilidad / A11y | UI / Card | Alta | Tarjetas de funcionarios en pantalla | Clic o pulsación de barra espaciadora en tarjeta | Checkbox se activa, tarjeta adquiere borde verde y badge | Selección interactiva accesible confirmada con teclado y ratón | **APROBADO** | 28/10/2026 15:34 | 02/11/2026 11:30 | feat(ui): implementar formulario en /gestion/admin/patrullas/nuevo y navegacion (HU-83) |
| `CP-H83-WEB-09` | Asignación automática del primer funcionario seleccionado como Líder responsable | Regla de Negocio | UI / Form | Alta | Dotación vacía | Selección del primer integrante | El funcionario se asigna como Líder y adquiere badge "Líder" | Primer funcionario designado automáticamente como líder | **APROBADO** | 28/10/2026 15:36 | 02/11/2026 11:30 | feat(patrullas): crear hook useNuevaPatrullaForm con validaciones Zod y tests (HU-83) |
| `CP-H83-WEB-10` | Cambio manual del funcionario líder mediante el selector de líder responsable | Funcional / Mando | UI / Selector | Alta | Dotación con 2+ funcionarios seleccionados | Cambio de opción en selector de Líder Responsable | Badge "Líder" se transfiere al nuevo integrante seleccionado | Líder reasignado correctamente actualizando estado del formulario | **APROBADO** | 28/10/2026 15:38 | 02/11/2026 11:30 | feat(patrullas): crear hook useNuevaPatrullaForm con validaciones Zod y tests (HU-83) |
| `CP-H83-WEB-11` | Apertura del modal de confirmación previa (PatrullaConfirmModal) con resumen consolidado | Usabilidad / UX | UI / Modal | Alta | Formulario válido | Clic en botón "Guardar Patrulla" | Modal de confirmación exhibe código, delegación, vehículo y dotación | Resumen consolidado desplegado antes del envío final | **APROBADO** | 28/10/2026 15:40 | 02/11/2026 11:30 | feat(ui): implementar formulario en /gestion/admin/patrullas/nuevo y navegacion (HU-83) |
| `CP-H83-WEB-12` | Manejo y despliegue de alerta InlineNotice ante error 409 Conflict por código duplicado | Feedback / Error | UI / Alert | Crítica | API responde HTTP 409 Conflict | Simulación de respuesta de código duplicado | Alerta roja en formulario: "Ya existe una patrulla registrada con este código" | Mensaje de error 409 desplegado claramente bajo el input código | **APROBADO** | 28/10/2026 15:42 | 02/11/2026 11:30 | feat(patrullas): crear hook useNuevaPatrullaForm con validaciones Zod y tests (HU-83) |
| `CP-H83-WEB-13` | Manejo y despliegue de alerta ante error 403 Forbidden por carencia de permiso recursos:crear | Seguridad / RBAC | UI / Error | Crítica | API responde HTTP 403 Forbidden | Intento de alta con usuario no facultado | Alerta roja indicando falta de permiso `recursos:crear` | Mensaje de permiso denegado exhibido al operador | **APROBADO** | 28/10/2026 15:44 | 02/11/2026 11:30 | feat(patrullas): crear hook useNuevaPatrullaForm con validaciones Zod y tests (HU-83) |
| `CP-H83-WEB-14` | Despliegue de notificación Toast institucional verde tras alta exitosa de patrulla | Feedback / UX | UI / Toast | Alta | Respuesta exitosa HTTP 201 Created | Creación de patrulla completada | Toast verde en esquina superior derecha confirmando el registro | Toast municipal desplegado por 4 segundos informando el alta | **APROBADO** | 28/10/2026 15:46 | 02/11/2026 11:30 | feat(patrullas): mover gestion de patrullas a pestaña dedicada con modal de alta (HU-83) |
| `CP-H83-WEB-15` | Recarga reactiva de la grilla de patrullas y actualización de contadores de dotación | Reactividad / UX | UI / Grid | Alta | Patrulla creada exitosamente | Modal se cierra | Invocación de `recargar()`, nueva patrulla visible y contador +1 | Grilla y contadores de dotación sincronizados al instante | **APROBADO** | 28/10/2026 15:48 | 02/11/2026 11:30 | feat(patrullas): mover gestion de patrullas a pestaña dedicada con modal de alta (HU-83) |
| `CP-H83-WEB-16` | Control de cierre de modal con botón Cancelar y tecla Escape sin mutaciones de estado | Usabilidad / A11y | UI / Modal | Media | Modal de alta abierto | Clic en Cancelar o presionar tecla Escape | Modal se cierra limpiamente y formulario se resetea | Modal desmontado sin efectos colaterales en la vista | **APROBADO** | 28/10/2026 15:50 | 02/11/2026 11:30 | feat(patrullas): mover gestion de patrullas a pestaña dedicada con modal de alta (HU-83) |
| `CP-H83-WEB-17` | Restricción RBAC: Ocultamiento del botón '+ Nueva Patrulla' sin permiso recursos:crear | Seguridad / RBAC | UI / Permisos | Crítica | Usuario autenticado con rol sin `recursos:crear` (Encargado) | Consulta de `/gestion/admin/patrullas` | Botón `[ + Nueva Patrulla ]` no se renderiza en la cabecera | Botón de creación ausente en modo solo-lectura | **APROBADO** | 28/10/2026 15:52 | 02/11/2026 11:30 | feat(patrullas): mover gestion de patrullas a pestaña dedicada con modal de alta (HU-83) |
| `CP-H83-WEB-18` | Suite automatizada de pruebas unitarias para useNuevaPatrullaForm en Vitest | Automatización | Hook / Unit | Alta | Entorno Vitest configurado en `sgrai-web` | `npm test -- src/hooks/__tests__/useNuevaPatrullaForm.test.ts` | 9/9 tests exitosos (validación Zod, sanitización, OpenAPI, disponibilidad ICS) | 9 tests pasando en 92ms | **APROBADO** | 28/10/2026 15:54 | 02/11/2026 11:30 | fix(patrullas): subsanar observaciones de auditoria QA en HU-83 (BUG-H83-WEB-01 al 05) |
| `CP-H83-WEB-19` | Suite automatizada de pruebas unitarias para patrullasService en Vitest | Automatización | Service / DAL | Alta | Entorno Vitest configurado en `sgrai-web` | `npm test -- src/services/__tests__/patrullasService.test.ts` | 11/11 tests exitosos (listar, crear, errores 409/403/400) | 11 tests pasando en 42ms | **APROBADO** | 28/10/2026 15:56 | 02/11/2026 11:30 | feat(patrullas): mover gestion de patrullas a pestaña dedicada con modal de alta (HU-83) |
| `CP-H83-WEB-20` | Suite automatizada de componentes para AdminPatrullasClient en Vitest | Automatización | UI / Component | Alta | Entorno Vitest configurado en `sgrai-web` | `npm test -- src/components/admin/patrullas/__tests__/AdminPatrullasClient.test.tsx` | 5/5 tests exitosos (renderizado, apertura modal, query ?nuevo=1) | 5 tests pasando en 1078ms | **APROBADO** | 28/10/2026 15:58 | 02/11/2026 11:30 | fix(patrullas): subsanar observaciones de auditoria QA en HU-83 (BUG-H83-WEB-01 al 05) |

---

### 4.1 Bloque TSV para Google Sheets (Copiar y Pegar en celda A1)

```tsv
ID Caso	Título del Caso de Prueba	Tipo de Prueba	Nivel	Prioridad	Precondición	Datos de Prueba (Payload / Headers / Query)	Resultado Esperado	Resultado Obtenido	Estado	Fecha / Hora Ejecución	Fecha / Hora Re-Test	Solución / Commit
BUG-H83-WEB-01	Redirección forzosa en /gestion/admin/patrullas/nuevo hacia modal y código muerto en NuevoPatrullaClient	Navegación / Routing	UI / Router	Alta	Usuario con permiso recursos:crear sin misiones:leer	GET directo a /gestion/admin/patrullas/nuevo	Formulario de página completa accesible según CA-1	Formulario montado directamente evaluando permisos sin redirecciones forzosas	APROBADO	28/10/2026 15:10	02/11/2026 11:30	fix(patrullas): subsanar observaciones de auditoria QA en HU-83 (BUG-H83-WEB-01 al 05)
BUG-H83-WEB-02	Discrepancia contractual en validación Zod de nombre (min 3 chars en API omitido en web)	Validación (Zod)	UI / Form	Alta	Formulario de alta abierto	codigo: 'PV-01', nombre: 'P1'	Validación cliente exige min 3 chars si nombre no está vacío	Error inline en cliente bloquea guardado y previene error 400 Bad Request	APROBADO	28/10/2026 15:12	02/11/2026 11:30	fix(patrullas): subsanar observaciones de auditoria QA en HU-83 (BUG-H83-WEB-01 al 05)
BUG-H83-WEB-03	Omisión de filtro de disponibilidad en personal y selección habilitada de brigadistas ocupados	Regla de Negocio (ICS)	UI / Form	Crítica	Funcionario con estado en_patrulla en catálogo	Clic sobre tarjeta con Estado: En patrulla	Tarjeta deshabilitada con cursor not-allowed y bloqueo de selección	Tarjeta con aria-disabled="true", cursor not-allowed y selección bloqueada	APROBADO	28/10/2026 15:14	02/11/2026 11:30	fix(patrullas): subsanar observaciones de auditoria QA en HU-83 (BUG-H83-WEB-01 al 05)
BUG-H83-WEB-04	Regresión en Centro de Mando: Eliminación de acceso a patrullas en KanbanHeader y KanbanBoard	Regresión / UI	UI / Mando	Alta	Encargado en /gestion/centro-incidentes	Inspección de cabecera de Centro de Mando	Botón accesible para monitorear patrullas verificadoras (CA-5)	Botón "Patrullas" y modal PanelPatrullasModal restituidos y operativos	APROBADO	28/10/2026 15:16	02/11/2026 11:30	fix(patrullas): subsanar observaciones de auditoria QA en HU-83 (BUG-H83-WEB-01 al 05)
BUG-H83-WEB-05	Errores bloqueantes de linter ESLint y React Hooks en AdminPatrullasClient y usePatrullas	Calidad / Linter	CI / Code	Media	Ejecución en consola	npm run lint	0 errores y 0 advertencias en código de patrullas	0 errores de ESLint, mutación de refs en useEffect y lazy state implementados	APROBADO	28/10/2026 15:18	02/11/2026 11:30	fix(patrullas): subsanar observaciones de auditoria QA en HU-83 (BUG-H83-WEB-01 al 05)
CP-H83-WEB-01	Renderizado y diseño institucional del modal PatrullaCrearModal en /gestion/admin/patrullas	Funcional / UI	UI / Modal	Alta	Administrador autenticado en /gestion/admin/patrullas	Clic en botón [ + Nueva Patrulla ]	Modal visible con cabecera verde institucional y 4 secciones	Modal desplegado con accesibilidad y diseño Valdivia intacto	APROBADO	28/10/2026 15:20	02/11/2026 11:30	feat(patrullas): mover gestion de patrullas a pestaña dedicada con modal de alta (HU-83)
CP-H83-WEB-02	Validación en cliente de campos obligatorios (código, delegación y personal) con Zod	Validación (Zod)	UI / Form	Crítica	Formulario de alta recién abierto	Clic directo en "Guardar Patrulla" con formulario vacío	Mensajes de error en rojo bajo cada campo obligatorio	Mensajes inline descriptivos desplegados en cada sección	APROBADO	28/10/2026 15:22	02/11/2026 11:30	feat(patrullas): crear hook useNuevaPatrullaForm con validaciones Zod y tests (HU-83)
CP-H83-WEB-03	Sanitización automática de código en mayúsculas y reemplazo de espacios por guiones	Usabilidad / UX	UI / Input	Media	Campo Código Identificador activo	Entrada de texto: "pv norte 01"	El input refleja automáticamente "PV-NORTE-01"	Sanitización reactiva en tiempo real en mayúsculas y con guiones	APROBADO	28/10/2026 15:24	02/11/2026 11:30	feat(patrullas): crear hook useNuevaPatrullaForm con validaciones Zod y tests (HU-83)
CP-H83-WEB-04	Carga asíncrona de delegaciones activas en selector de Delegación Base	Integración / DAL	UI / Selector	Alta	Catálogos municipales en API disponibles	Montaje de sección Delegación Municipal	Selector cargado con Norte, Sur, Costa y Calle Calle	Opciones pobladas fielmente con UUIDs correspondientes	APROAPROBADO	28/10/2026 15:26	02/11/2026 11:30	feat(patrullas): crear hook useNuevaPatrullaForm con validaciones Zod y tests (HU-83)
CP-H83-WEB-05	Carga asíncrona y filtrado de vehículos disponibles individuales (DISPONIBLE y esIndividual)	Integración / DAL	UI / Selector	Alta	Inventario logístico municipal en API disponible	Montaje de sección Vehículo Institucional	Selector exhibe vehículos individuales con patente y modelo	Solo recursos individuales disponibles listados en opciones	APROBADO	28/10/2026 15:28	02/11/2026 11:30	feat(patrullas): crear hook useNuevaPatrullaForm con validaciones Zod y tests (HU-83)
CP-H83-WEB-06	Opción de registrar patrulla pedestre sin vehículo asignado	Funcional	UI / Form	Media	Dotación de personal configurada	Selección de opción -- Sin vehículo asignado --	vehiculoId se envía como null en el payload	Formulario permite guardar patrulla a pie sin errores	APROBADO	28/10/2026 15:30	02/11/2026 11:30	feat(patrullas): crear hook useNuevaPatrullaForm con validaciones Zod y tests (HU-83)
CP-H83-WEB-07	Carga asíncrona de personal elegible con rol PATRULLA_VERIFICADORA y ficha operativa	Integración / DAL	UI / Listado	Alta	Base de datos de personal activa	Montaje de sección Dotación y Personal	Listado renderiza únicamente funcionarios habilitados para patrulla	Personal con rol operativo de verificación listado en tarjetas	APROBADO	28/10/2026 15:32	02/11/2026 11:30	feat(patrullas): crear hook useNuevaPatrullaForm con validaciones Zod y tests (HU-83)
CP-H83-WEB-08	Asignación interactiva de personal mediante tarjetas con checkbox accesible y badges	Usabilidad / A11y	UI / Card	Alta	Tarjetas de funcionarios en pantalla	Clic o pulsación de barra espaciadora en tarjeta	Checkbox se activa, tarjeta adquiere borde verde y badge	Selección interactiva accesible confirmada con teclado y ratón	APROBADO	28/10/2026 15:34	02/11/2026 11:30	feat(ui): implementar formulario en /gestion/admin/patrullas/nuevo y navegacion (HU-83)
CP-H83-WEB-09	Asignación automática del primer funcionario seleccionado como Líder responsable	Regla de Negocio	UI / Form	Alta	Dotación vacía	Selección del primer integrante	El funcionario se asigna como Líder y adquiere badge "Líder"	Primer funcionario designado automáticamente como líder	APROBADO	28/10/2026 15:36	02/11/2026 11:30	feat(patrullas): crear hook useNuevaPatrullaForm con validaciones Zod y tests (HU-83)
CP-H83-WEB-10	Cambio manual del funcionario líder mediante el selector de líder responsable	Funcional / Mando	UI / Selector	Alta	Dotación con 2+ funcionarios seleccionados	Cambio de opción en selector de Líder Responsable	Badge "Líder" se transfiere al nuevo integrante seleccionado	Líder reasignado correctamente actualizando estado del formulario	APROBADO	28/10/2026 15:38	02/11/2026 11:30	feat(patrullas): crear hook useNuevaPatrullaForm con validaciones Zod y tests (HU-83)
CP-H83-WEB-11	Apertura del modal de confirmación previa (PatrullaConfirmModal) con resumen consolidado	Usabilidad / UX	UI / Modal	Alta	Formulario válido	Clic en botón "Guardar Patrulla"	Modal de confirmación exhibe código, delegación, vehículo y dotación	Resumen consolidado desplegado antes del envío final	APROBADO	28/10/2026 15:40	02/11/2026 11:30	feat(ui): implementar formulario en /gestion/admin/patrullas/nuevo y navegacion (HU-83)
CP-H83-WEB-12	Manejo y despliegue de alerta InlineNotice ante error 409 Conflict por código duplicado	Feedback / Error	UI / Alert	Crítica	API responde HTTP 409 Conflict	Simulación de respuesta de código duplicado	Alerta roja en formulario: "Ya existe una patrulla registrada con este código"	Mensaje de error 409 desplegado claramente bajo el input código	APROBADO	28/10/2026 15:42	02/11/2026 11:30	feat(patrullas): crear hook useNuevaPatrullaForm con validaciones Zod y tests (HU-83)
CP-H83-WEB-13	Manejo y despliegue de alerta ante error 403 Forbidden por carencia de permiso recursos:crear	Seguridad / RBAC	UI / Error	Crítica	API responde HTTP 403 Forbidden	Intento de alta con usuario no facultado	Alerta roja indicando falta de permiso recursos:crear	Mensaje de permiso denegado exhibido al operador	APROBADO	28/10/2026 15:44	02/11/2026 11:30	feat(patrullas): crear hook useNuevaPatrullaForm con validaciones Zod y tests (HU-83)
CP-H83-WEB-14	Despliegue de notificación Toast institucional verde tras alta exitosa de patrulla	Feedback / UX	UI / Toast	Alta	Respuesta exitosa HTTP 201 Created	Creación de patrulla completada	Toast verde en esquina superior derecha confirmando el registro	Toast municipal desplegado por 4 segundos informando el alta	APROBADO	28/10/2026 15:46	02/11/2026 11:30	feat(patrullas): mover gestion de patrullas a pestaña dedicada con modal de alta (HU-83)
CP-H83-WEB-15	Recarga reactiva de la grilla de patrullas y actualización de contadores de dotación	Reactividad / UX	UI / Grid	Alta	Patrulla creada exitosamente	Modal se cierra	Invocación de recargar(), nueva patrulla visible y contador +1	Grilla y contadores de dotación sincronizados al instante	APROBADO	28/10/2026 15:48	02/11/2026 11:30	feat(patrullas): mover gestion de patrullas a pestaña dedicada con modal de alta (HU-83)
CP-H83-WEB-16	Control de cierre de modal con botón Cancelar y tecla Escape sin mutaciones de estado	Usabilidad / A11y	UI / Modal	Media	Modal de alta abierto	Clic en Cancelar o presionar tecla Escape	Modal se cierra limpiamente y formulario se resetea	Modal desmontado sin efectos colaterales en la vista	APROBADO	28/10/2026 15:50	02/11/2026 11:30	feat(patrullas): mover gestion de patrullas a pestaña dedicada con modal de alta (HU-83)
CP-H83-WEB-17	Restricción RBAC: Ocultamiento del botón '+ Nueva Patrulla' sin permiso recursos:crear	Seguridad / RBAC	UI / Permisos	Crítica	Usuario autenticado con rol sin recursos:crear (Encargado)	Consulta de /gestion/admin/patrullas	Botón [ + Nueva Patrulla ] no se renderiza en la cabecera	Botón de creación ausente en modo solo-lectura	APROBADO	28/10/2026 15:52	02/11/2026 11:30	feat(patrullas): mover gestion de patrullas a pestaña dedicada con modal de alta (HU-83)
CP-H83-WEB-18	Suite automatizada de pruebas unitarias para useNuevaPatrullaForm en Vitest	Automatización	Hook / Unit	Alta	Entorno Vitest configurado en sgrai-web	npm test -- src/hooks/__tests__/useNuevaPatrullaForm.test.ts	9/9 tests exitosos (validación Zod, sanitización, OpenAPI, disponibilidad ICS)	9 tests pasando en 92ms	APROBADO	28/10/2026 15:54	02/11/2026 11:30	fix(patrullas): subsanar observaciones de auditoria QA en HU-83 (BUG-H83-WEB-01 al 05)
CP-H83-WEB-19	Suite automatizada de pruebas unitarias para patrullasService en Vitest	Automatización	Service / DAL	Alta	Entorno Vitest configurado en sgrai-web	npm test -- src/services/__tests__/patrullasService.test.ts	11/11 tests exitosos (listar, crear, errores 409/403/400)	11 tests pasando en 42ms	APROBADO	28/10/2026 15:56	02/11/2026 11:30	feat(patrullas): mover gestion de patrullas a pestaña dedicada con modal de alta (HU-83)
CP-H83-WEB-20	Suite automatizada de componentes para AdminPatrullasClient en Vitest	Automatización	UI / Component	Alta	Entorno Vitest configurado en sgrai-web	npm test -- src/components/admin/patrullas/__tests__/AdminPatrullasClient.test.tsx	5/5 tests exitosos (renderizado, apertura modal, query ?nuevo=1)	5 tests pasando en 1078ms	APROBADO	28/10/2026 15:58	02/11/2026 11:30	fix(patrullas): subsanar observaciones de auditoria QA en HU-83 (BUG-H83-WEB-01 al 05)
```

---

## 5. Guía de Ejecución Paso a Paso y Reproducibilidad (100% Replicable)

Para garantizar la auditoría técnica y replicabilidad de las evidencias del Re-Test, se detallan los comandos ejecutados y sus salidas reales:

### 5.1 Pruebas Automatizadas en Vitest (Frontend Web)

#### A. Suite Completa del Dominio de Patrullas Verificadoras
```bash
npx vitest run patrulla
```
**Salida de Ejecución Real:**
```text
 ✓ src/services/__tests__/patrullasService.test.ts (11 tests) 42ms
 ✓ src/hooks/__tests__/usePatrullas.test.ts (6 tests) 118ms
 ✓ src/hooks/__tests__/useNuevaPatrullaForm.test.ts (9 tests) 92ms
 ✓ src/components/mando/patrullas/__tests__/PanelPatrullas.test.tsx (7 tests) 837ms
 ✓ src/components/admin/patrullas/__tests__/NuevoPatrullaClient.test.tsx (4 tests) 851ms
 ✓ src/components/admin/patrullas/__tests__/AdminPatrullasClient.test.tsx (5 tests) 1078ms

 Test Files  6 passed (6)
      Tests  42 passed (42)
   Duration  4.22s
```

---

#### B. Suite de Consola de Centro de Mando (`KanbanHeader.test.tsx`)
```bash
npx vitest run src/components/mando/__tests__/KanbanHeader.test.tsx
```
**Salida de Ejecución Real:**
```text
 ✓ KanbanHeader (HU-30) > debe renderizar el título institucional y contadores 305ms
 ✓ KanbanHeader (HU-30) > debe renderizar el botón "Nuevo Evento" y desplegar "Nuevo Evento de Prevención" para ejecutar onOpenCrearPrevencion 155ms
 ✓ KanbanHeader (HU-30) > debe renderizar el botón de Misiones Operativas si se pasa onAbrirMisiones 42ms
 ✓ KanbanHeader (HU-30) > debe renderizar el botón "Nuevo Evento" y desplegar "Nuevo Evento de Recuperación" si se pasa onOpenCrearRecuperacion 69ms
 ✓ KanbanHeader (HU-30) > debe renderizar el botón de Patrullas y ejecutar onAbrirPatrullas al hacer clic 31ms
 ✓ KanbanHeader (HU-30) > no debe renderizar el botón de Patrullas si no se provee onAbrirPatrullas 21ms

 Test Files  1 passed (1)
      Tests  6 passed (6)
   Duration  3.12s
```

---

#### C. Suite Global de Pruebas de Todo el Proyecto
```bash
npx vitest run
```
**Salida de Ejecución Real:**
```text
 Test Files  115 passed (115)
      Tests  695 passed (695)
   Duration  23.73s
```

---

### 5.2 Comprobación de ESLint y Build Estático

#### A. Verificación de Análisis Estático (`npm run lint`)
```bash
npm run lint
```
**Salida de Ejecución Real:**
```text
✖ 7 problems (0 errors, 7 warnings)
```
*(0 errores en la totalidad del repositorio; las advertencias corresponden a variables mock en tests de otros módulos preexistentes).*

---

#### B. Verificación de Tipos Estáticos con TypeScript
```bash
npx tsc --noEmit
```
**Salida de Ejecución Real:**
```text
(Salida vacía - Código de salida 0. Cero errores de tipos TypeScript).
```

---

## 6. Trazabilidad con Criterios de Aceptación (HU-83)

| Criterio de Aceptación (CA) | Implementación Frontend Web | Evidencia / Casos de Prueba | Dictamen Técnico |
|---|---|---|:---:|
| **CA-1: Formulario en `/gestion/admin/patrullas/nuevo`** | `NuevoPatrullaClient` montado directamente en `page.tsx` con breadcrumbs, título y RBAC `recursos:crear` | `BUG-H83-WEB-01`, `CP-H83-WEB-08`, `NuevoPatrullaClient.test.tsx` | 🟢 CUMPLIDO |
| **CA-2: Captura de Código, Delegación, Vehículo y Personal** | `PatrullaIdentificacionSection`, `PatrullaDelegacionSection`, `PatrullaVehiculoSection`, `PatrullaDotacionSection` | `CP-H83-WEB-03`, `CP-H83-WEB-04`, `CP-H83-WEB-05`, `CP-H83-WEB-08`, `BUG-H83-WEB-02`, `BUG-H83-WEB-03` | 🟢 CUMPLIDO |
| **CA-3: Registro en estado inicial `DISPONIBLE`** | Delegado a backend API y notificado en modal y resumen | `CP-H83-WEB-11`, `CP-H83-WEB-15` | 🟢 CUMPLIDO |
| **CA-4: Validación de unicidad y permiso `recursos:crear`** | Manejo de HTTP 409 y control de visibilidad RBAC en UI | `CP-H83-WEB-12`, `CP-H83-WEB-13`, `CP-H83-WEB-17` | 🟢 CUMPLIDO |
| **CA-5: Visibilidad en Centro de Mando** | Botón táctico `Patrullas` en `KanbanHeader`, modal `PanelPatrullasModal` y eventos WebSocket | `BUG-H83-WEB-04`, `CP-H83-WEB-15`, `KanbanHeader.test.tsx` | 🟢 CUMPLIDO |

---

## 7. Conclusión y Dictamen Final de QA

1. **Aprobación de Pull Request:** Tras subsanar los 5 defectos y verificar el 100% de los 25 casos de prueba diseñados, se emite el dictamen formal **APPROVED** en GitHub Pull Request para la rama `feature/h83-crear-patrulla`.
2. **Recomendación para Merge:** La rama se encuentra en estado óptimo (0 errores ESLint, 0 errores TypeScript, 695 tests pasando globalmente) y lista para ser integrada a `develop` mediante Gitflow.
3. **Cierre de Ciclo:** Se formaliza el cierre de la auditoría técnica de la HU-83 en el sistema SGRAI.
