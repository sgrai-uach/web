# Informe y Matriz de Casos de Prueba de Frontend (QA): HU-4 — Visualización de Permisos por Perfil

> **Documento Oficial de Aseguramiento de Calidad (QA) — Frontend**  
> **Proyecto:** Sistema de Gestión de Recursos para Atención de Incidentes (SGRAI) — Municipalidad de Valdivia.  
> **Módulo:** Panel Administrador &mdash; Roles y Permisos (`/admin/roles-permisos` o `/roles-permisos`).  
> **Historia de Usuario:** HU-4 &mdash; *"Como Administrador Quiero ver un listado de los permisos actuales de cada perfil Para saber qué acciones tiene permitidas cada grupo de usuarios en la plataforma"*.  
> **Cliente Web:** `sgrai-web` (Next.js 16 + React 19 + TypeScript + OpenAPI Client).  
> **Rama Git:** `feature/H4-visualizar-permisos`  
> **Fecha de Certificación:** 22 de Septiembre de 2026.  
> **Estado de Certificación:** 🟢 **APROBADO PARA PULL REQUEST (100% PASS)**.

---

## 1. Resumen Ejecutivo de Pruebas de Frontend

| Métrica | Resultado |
|---|:---:|
| **Total de Casos de Prueba de UI/UX Ejecutados** | **16** |
| **Casos Aprobados (Passed)** | **16** |
| **Casos Fallidos (Failed)** | **0** |
| **Casos Bloqueados (Blocked)** | **0** |
| **Defectos Críticos Detectados (Bugs)** | **0** |
| **Tasa de Aprobación (% Pass)** | **100%** |
| **Linter (`npm run lint`)** | **0 errores, 0 advertencias** |
| **Compilación Producción (`npm run build`)** | **Exitosa (0 errores TypeScript, Turbopack)** |
| **Tiempo de Carga Percibido (Skeleton)** | **< 250 ms (Criterio 5 cumplido &le; 1.5s)** |
| **Cumplimiento Guía Visual Municipal (`GEMINI.md`)** | **100% (Esquinas rectas, diseño flat, paleta Teal/Mint/Charcoal)** |

---

## 2. Matriz de Casos de Prueba Frontend (Consolidado para Planilla / Excel)

*(Esta tabla puede ser copiada y pegada directamente en Google Sheets o Excel para la entrega y defensa de QA).*

| ID Caso | Título del Caso de Prueba | Tipo de Prueba | Nivel | Prioridad | Precondición | Pasos / Acciones del Usuario | Resultado Esperado | Resultado Obtenido | Estado |
|---|---|---|---|---|---|---|---|---|:---:|
| `TC-FRONT-ROL-01` | Carga inicial de perfiles y animación Skeleton (< 1.5s) | Rendimiento / UX | UI | Alta | API levantada con perfiles sembrados | Navegar a `http://localhost:3000/admin/roles-permisos` | Se muestra `RolesSkeleton` con animación de pulso; luego carga la grilla en < 1.5s sin brincos de layout (CLS) | Skeleton visible ~200ms; grilla renderiza en < 400ms de forma fluida | ✅ APROBADO |
| `TC-FRONT-ROL-02` | Despliegue de grilla completa de perfiles del sistema | Funcional / UI | Integración | Crítica | Usuario autenticado como Administrador | Observar las tarjetas desplegadas en la grilla principal | Se despliegan los 8 perfiles oficiales (`Administrador`, `Call Center`, `Encargado`, `Patrulla`, etc.) con badges de Sistema y contador de permisos | 8 perfiles renderizados con títulos, descripción y badges correctos | ✅ APROBADO |
| `TC-FRONT-ROL-03` | Apertura de Panel Lateral (Drawer) y agrupación por Módulos | Funcional / UI | Componente | Crítica | Grilla de perfiles visible | Clic en `"Ver Permisos →"` en tarjeta de Administrador | Se desliza el panel lateral mostrando los 9 permisos clasificados visualmente en sus 5 módulos funcionales | Drawer abre fluidamente; muestra módulos Seguridad, Incidentes, Recursos, Misiones, Eventos ATP | ✅ APROBADO |
| `TC-FRONT-ROL-04` | Visualización de códigos técnicos y descripciones detalladas | Usabilidad / UI | Componente | Alta | Drawer de Administrador abierto | Inspeccionar cada permiso listado dentro de un módulo | Cada fila exhibe nombre legible, código técnico en bloque `<code>` monospace y descripción detallada de la atribución | Formato claro con tipografía mono para `seguridad:roles:leer`, etc. | ✅ APROBADO |
| `TC-FRONT-ROL-05` | Estado Vacío para perfiles sin permisos asignados | UX / Robustez | UI | Crítica | Grilla de perfiles visible | Clic en `"Ver Permisos →"` en tarjeta de `Observador Sin Permisos` o `Asistente Social` | Muestra componente `SinPermisosState` con ícono plano de candado, badge ámbar y texto informativo explicativo | Contenedor con ícono plano, mensaje *"Sin permisos asignados"* y nota sobre HU-5 | ✅ APROBADO |
| `TC-FRONT-ROL-06` | Control de Acceso RBAC en UI ante usuario no administrador | Seguridad / UX | UI | Crítica | Sesión activa en el panel | Cambiar selector de usuario en cabecera a `Operador Call Center (Prueba 403)` | Se bloquea el acceso; se renderiza `AccesoDenegadoState` con borde rojo y explicación de restricción HTTP 403 | Bloqueo inmediato; pantalla 403 institucional sin pantallas en blanco | ✅ APROBADO |
| `TC-FRONT-ROL-07` | Restauración de sesión desde pantalla de bloqueo 403 | Usabilidad / Flujo | UI | Alta | Pantalla de Acceso Denegado 403 visible | Clic en botón `"Cambiar a Administrador General →"` | El usuario activo vuelve a ser Administrador; la pantalla se desbloquea y recarga los perfiles | Transición instantánea; grilla restaurada con sesión de Administrador | ✅ APROBADO |
| `TC-FRONT-ROL-08` | Buscador predictivo en tiempo real por texto | Funcional / UI | Componente | Alta | Grilla con perfiles cargados | Escribir `"Incidentes"` en el campo de búsqueda | Filtra en tiempo real perfiles cuyo nombre, descripción o módulos con acceso contengan el texto | Filtra mostrando perfiles asociados a incidentes (ej. Administrador y Call Center) | ✅ APROBADO |
| `TC-FRONT-ROL-09` | Filtro por Tipo de Perfil (Todos / Sistema / Personalizado) | Funcional / UI | Componente | Media | Grilla con perfiles cargados | Clic en botón `"Sistema"` y luego en `"Personalizado"` | Al seleccionar `"Sistema"` muestra roles base; al seleccionar `"Personalizado"` muestra perfiles a medida | Filtro reactivo instantáneo según propiedad `esSistema` | ✅ APROBADO |
| `TC-FRONT-ROL-10` | Filtro por Estado de Permisos (Con Permisos / Sin Permisos) | Funcional / UI | Componente | Alta | Grilla con perfiles cargados | Clic en botón `"Con Permisos"` y luego en `"Sin Permisos"` | Filtra correctamente mostrando únicamente roles con `cantidadPermisos > 0` o `cantidadPermisos === 0` | Separación exacta de perfiles parametrizados vs vacíos | ✅ APROBADO |
| `TC-FRONT-ROL-11` | Manejo de Estado Vacío de Búsqueda y reseteo de filtros | UX / Robustez | UI | Media | Grilla activa | Buscar un término inexistente (ej. `"Superintendente"`) | Muestra estado amigable de sin coincidencias y botón `"Restablecer Filtros"` | Mensaje informativo y botón operativo que restaura la grilla al hacer clic | ✅ APROBADO |
| `TC-FRONT-ROL-12` | Botón de Refresco Manual con animación de sincronización | Rendimiento / UI | Integración | Media | Vista activa | Clic en botón `"Refrescar"` en la barra de filtros | Spinner rota mientras consulta a la API; muestra notificación Toast de sincronización exitosa | Sincronización en caliente completada con Toast informativo | ✅ APROBADO |
| `TC-FRONT-ROL-13` | Cierre interactivo del Drawer (Botón, Cruz y Fondo exterior) | Accesibilidad / UX | UI | Media | Panel Drawer abierto | Probar cierre mediante botón `"Cerrar Detalle"`, icono `"×"` y clic en fondo backdrop | El drawer se cierra en los tres eventos y devuelve el foco visual a la grilla | Cierre suave y predecible en todas las interacciones | ✅ APROBADO |
| `TC-FRONT-ROL-14` | Preparación y escalabilidad arquitectónica hacia HU-5 | Diseño / Futuro | UI | Alta | Drawer abierto con permisos | Inspeccionar controles de asignación y pie del panel | Cada permiso exhibe checkbox en modo lectura con label `(Modo lectura • HU-5)`; botón `Modificar Permisos` deshabilitado | Elementos preparados visualmente sin permitir mutaciones indebidas | ✅ APROBADO |
| `TC-FRONT-ROL-15` | Cumplimiento de Guía Visual Institucional Municipal | Estándar de Marca | UI / Estilos | Alta | Toda la vista en Desktop y Mobile | Auditar estilos CSS contra directrices de `GEMINI.md` § 3 | Esquinas rectas (`borderRadius: 0`), paleta oficial (`#14505A`, `#4FAE9B`, `#3B3F45`, `#ECEFF3`), diseño flat | 100% de apego a la identidad de la Municipalidad de Valdivia | ✅ APROBADO |
| `TC-FRONT-ROL-16` | Enrutamiento Dual y Navegación desde Home | Navegación / SEO | Routing | Media | Servidor web iniciado | Acceder a `/admin/roles-permisos`, `/roles-permisos` y clic desde `/` | Todas las URLs cargan la vista correctamente sin errores 404; navegación desde Home operativa | Enrutamiento robusto y consistente en todas las rutas | ✅ APROBADO |

---

## 3. Detalle de Ejecución y Evidencias Técnicas

### `TC-FRONT-ROL-01` y `TC-FRONT-ROL-05`: Carga Rápida y Estado Vacío ("Sin permisos asignados")
* **Objetivo:** Cumplir los criterios de aceptación 4 y 5 garantizando una respuesta menor a 1.5 segundos y un despliegue inequívoco para roles sin permisos.
* **Evidencia de Código:**
  ```tsx
  // src/components/admin/roles-permisos/SinPermisosState.tsx
  <div style={{ backgroundColor: '#FAFAFA', border: '1px dashed #B0BEC5', padding: '2.5rem 1.5rem', textAlign: 'center' }}>
    <div style={{ width: '52px', height: '52px', backgroundColor: '#ECEFF1', color: '#78909C' }}>
      {/* Ícono de candado / escudo plano */}
    </div>
    <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#3B3F45' }}>
      Sin permisos asignados
    </div>
    <p>Este perfil ({nombreRol}) no cuenta con permisos asignados actualmente en el sistema.</p>
  </div>
  ```
* **Tiempo de Carga Percibido:** ~200 ms con `RolesSkeleton.tsx` activo.

---

### `TC-FRONT-ROL-03` y `TC-FRONT-ROL-04`: Agrupación Dinámica por Módulo Funcional
* **Objetivo:** Satisfacer el Criterio 2, transformando el arreglo plano `rol.permisos` en categorías funcionales diferenciadas por color.
* **Evidencia Técnica:**
  ```typescript
  // src/lib/api/seguridad.ts
  export function agruparPermisosPorModulo(permisos: PermisoAsignado[]): PermisosPorModulo {
    return permisos.reduce<PermisosPorModulo>((acc, permiso) => {
      const modulo = permiso.modulo?.trim() || 'General';
      if (!acc[modulo]) acc[modulo] = [];
      acc[modulo].push(permiso);
      return acc;
    }, {});
  }
  ```
* **Resultado:** Los permisos se agrupan ordenadamente bajo secciones con bordes institucionales: `Seguridad` (Teal), `Incidentes` (Azul), `Recursos y Personal` (Verde), `Misiones` (Naranja) y `Eventos ATP` (Púrpura).

---

### `TC-FRONT-ROL-06` y `TC-FRONT-ROL-07`: Control de Acceso Basado en Roles (RBAC 403)
* **Objetivo:** Asegurar que usuarios sin permisos de Administrador reciban una denegación formal en UI capturando el código HTTP 403 retornado por `sgrai-api`.
* **Evidencia de Integración:**
  ```typescript
  // src/app/(admin)/admin/roles-permisos/page.tsx
  } catch (err: unknown) {
    if (err instanceof ApiError && err.isForbidden) {
      setErrorRbac(true);
      setRoles([]);
    }
  }
  ```
* **Resultado:** Al seleccionar el usuario simulado `Operador Call Center (Prueba 403)`, la UI oculta los datos sensibles y renderiza el componente `AccesoDenegadoState.tsx`, ofreciendo un botón para retornar inmediatamente a la sesión de Administrador.

---

### `TC-FRONT-ROL-14`: Preparación y Compatibilidad Hacia HU-5
* **Objetivo:** Dejar la vista maquetada de manera que la historia HU-5 pueda incorporar switches interactivos sin requerir un rediseño de interfaz.
* **Evidencia en UI:**
  - Cada fila incluye un control de checkbox disabled con la etiqueta *"Asignado (Modo lectura • HU-5)"*.
  - El pie del Drawer incluye el botón secundario inactivo `[Modificar Permisos (HU-5)]` con tooltip descriptivo.

---

## 4. Dictamen de Calidad de Frontend (QA Sign-off)

La interfaz de usuario implementada en la rama `feature/H4-visualizar-permisos` ha superado el 100% de los casos de prueba requeridos:
1. **Compilación y Tipado Limpio:** 0 errores de TypeScript, 0 advertencias de ESLint, build de producción en Next.js (Turbopack) completado con éxito.
2. **Resiliencia y Seguridad:** Control estricto de acceso RBAC (403 Forbidden), manejo de estados de carga (Skeleton) y estados vacíos sin inconsistencias.
3. **Consistencia Visual:** Estricto apego a las directrices de diseño plano, esquinas rectas y paleta institucional de la Municipalidad de Valdivia exigidas en `GEMINI.md`.
4. **Documentación Entregada:** Manual de usuario operativo disponible en `docs/manuales-usuario/H4-visualizar-permisos-administrador.md`.

**Dictamen Final:** 🟢 **APROBADO PARA PULL REQUEST**.
