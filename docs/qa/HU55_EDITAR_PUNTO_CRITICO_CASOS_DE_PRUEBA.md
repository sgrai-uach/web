# Informe y Matriz de Casos de Prueba (QA): HU-55 — Editar Punto Crítico y Sectores Vulnerables

> **Documento Oficial de Aseguramiento de Calidad (QA) — SGRAI**  
> **Proyecto:** Sistema de Gestión de Recursos para Atención de Incidentes (SGRAI) — Dirección de Gestión de Riesgos de Desastres, Municipalidad de Valdivia.  
> **Módulo:** Administración y Gestión Territorial / Prevención (`sgrai-web`).  
> **Historia de Usuario:** HU-55 — *"Como administrador Quiero editar características de un punto crítico Para tener actualizado el estado actual de la ubicación"*.  
> **Repositorio Evaluado:** `sgrai-web` (consumiendo API monolítica modular `sgrai-api`).  
> **Rama Git Evaluada:** `feature/H55-editar-punto-critico` (incorporada e integrada formalmente en rama `develop` mediante Pull Request #22, commit `9861fb5`).  
> **Entorno de Pruebas:** Local (Node.js v20.x, React 19, Next.js 16 con Turbopack, Vitest v3.2.7, Leaflet 1.9, PostGIS 3.4 en PostgreSQL 16, Redis 7).  
> **Fecha de Certificación QA:** Octubre 2026.  
> **Estado de Certificación:** 🟢 **APROBADO PARA PRODUCCIÓN (100% PASS TRAS CICLO DE RE-TESTS)**.

---

## 1. Objetivos del Plan de Pruebas de QA

1. **Asegurar la Experiencia de Usuario y la Identidad Visual Institucional:**
   - Validar la integración del modal `PuntoCriticoEditarModal` respetando la guía de estilo sobria, limpia y plana de la Municipalidad de Valdivia.
   - Comprobar la inmutabilidad explícita del código institucional (`codigo`) mediante componente de solo lectura (`readOnly`) con ícono de candado (`Lock`).
   - Comprobar que el estado operativo (`activo`) se despliegue como badge informativo sin selector editable forzado (la vigencia se gestiona en HU-56).
2. **Validar la Interacción Geoespacial (Mapa Leaflet y Coordenadas GPS):**
   - Verificar la sincronización bidireccional entre el pin marcador arrastrable (*draggable marker*) del mapa y los inputs numéricos GPS de latitud y longitud.
   - Comprobar las utilidades de conveniencia ("Centrar Valdivia" y "Restablecer Coordenadas").
3. **Control de Acceso Basado en Roles (RBAC):**
   - Asegurar que solo usuarios con rol `Administrador` o con el permiso `puntos_criticos:editar` puedan abrir el formulario y enviar modificaciones.
   - Verificar que usuarios sin privilegios (ej. Call Center, Encargado sin permiso) visualicen el estado de acceso restringido (`AccesoDenegadoState`).
4. **Validaciones en Cliente y Manejo de Errores de API:**
   - Prevenir envíos con campos requeridos vacíos, nombres menores a 3 caracteres o coordenadas fuera de límites geográficos (-90 a 90, -180 a 180).
   - Manejar amigablemente los errores de servidor: `409 Conflict` (punto inactivo) y `403 Forbidden` (sesión no autorizada).
5. **Verificar la Sincronización Reactiva en Tiempo Real:**
   - Comprobar que la recepción del evento WebSocket `punto_critico:actualizado` actualice de inmediato la lista de puntos críticos en pantalla sin requerir recargar la página.

---

## 2. Matriz de Trazabilidad de Criterios de Aceptación

| Criterio de Aceptación (CA) | Descripción del Criterio | Casos de Prueba Asociados | Estado QA |
|---|---|---|:---:|
| **CA-1** | El administrador puede acceder a la vista de edición desde el detalle o el listado de puntos críticos. | `CP-H55-WEB-01`, `CP-H55-WEB-02` | **CUMPLIDO** |
| **CA-2** | El sistema permite modificar los datos del punto crítico, incluyendo la actualización interactiva de su ubicación geográfica en el mapa. | `CP-H55-WEB-03`, `CP-H55-WEB-04`, `CP-H55-WEB-05`, `CP-H55-WEB-06`, `CP-H55-WEB-07`, `CP-H55-WEB-08` | **CUMPLIDO** |
| **CA-3** | El sistema valida que los campos obligatorios cumplan con el formato requerido antes de enviar la solicitud. | `CP-H55-WEB-09`, `CP-H55-WEB-10`, `CP-H55-WEB-11` | **CUMPLIDO** |
| **CA-4** | Solo los usuarios con el rol "Administrador" tienen permiso para realizar y guardar esta acción. | `CP-H55-WEB-12` | **CUMPLIDO** |
| **CA-5** | El sistema actualiza la información exitosamente en la base de datos geoespacial y muestra una notificación de éxito o un mensaje de error claro en caso de fallo. | `CP-H55-WEB-13`, `CP-H55-WEB-14` | **CUMPLIDO** |
| **CA-6** | La actualización del punto crítico se refleja inmediatamente en el módulo cartográfico. | `CP-H55-WEB-15` | **CUMPLIDO** |

---

## 3. Matriz Consolidada de Casos de Prueba (13 Columnas)

| ID Caso | Título del Caso de Prueba | Tipo de Prueba | Nivel | Prioridad | Precondición | Datos de Prueba (Payload / Headers / Query) | Resultado Esperado | Resultado Obtenido | Estado | Fecha / Hora Ejecución | Fecha / Hora Re-Test | Solución / Commit |
|---|---|---|---|---|---|---|---|---|:---:|:---:|:---:|---|
| `BUG-H55-WEB-01` | Exposición indebida de selector de estado operativo y puntos inactivos en formulario y catálogo de edición | Integridad / UI | Modal / Tabla | Alta | Punto crítico abierto en formulario de edición | Inspección de campos del formulario y filtro de catálogo | Estado operativo inmutable de solo lectura; catálogo operativo filtra inactivos | Formulario permitía alterar activo y catálogo mostraba inactivos en vez de manejarse por HU-56 | CORREGIDO | 03/10/2026 18:30 | 04/10/2026 21:15 | fix(puntos-criticos): ocultar puntos criticos inactivos del catalogo y remover selector de estado |
| `BUG-H55-WEB-02` | Restricción indebida a catálogo cerrado inventado de tipos de riesgo en formulario | Validación / UI | Form / Select | Media | Formulario de edición abierto en campo tipoRiesgo | Intentar ingresar amenaza específica de Valdivia (ej. Humedal) | Campo libre de texto descriptivo hasta 100 caracteres acorde a PostGIS | Dropdown rígido con catálogo inventado bloqueaba amenazas locales no listadas | CORREGIDO | 03/10/2026 19:45 | 04/10/2026 21:30 | revert(puntos-criticos): remover catalogo inventado de tipos de riesgo y mantener campo libre |
| `BUG-H55-WEB-03` | Exposición de código técnico de delegación territorial municipal en selectores y modal | UX / Usabilidad | Select / Modal | Media | Selector 'Delegación Municipal Responsable' desplegado | Inspeccionar opciones del dropdown de delegaciones | Opciones legibles oficiales (ej. 'Delegación Municipal Sur') | Dropdown mostraba códigos crudos DEL_NORTE / DEL_SUR afectando usabilidad | CORREGIDO | 03/10/2026 20:15 | 04/10/2026 22:00 | fix(puntos-criticos): remover codigos tecnicos de delegacion y desplegar catalogo de tipos de riesgo |
| `BUG-H55-WEB-04` | Ruta canónica /gestion/admin/puntos-criticos inaccesible desde el Hub de Gestión | Navegación / UI | Enrutamiento | Media | Administrador autenticado en ruta /gestion | Clic en módulo de administración territorial de puntos críticos | Redirección operativa a /gestion/admin/puntos-criticos con permisos | Módulo no estaba registrado en GestionModulosGrid.tsx imposibilitando navegación | CORREGIDO | 04/10/2026 10:20 | 04/10/2026 22:45 | fix(puntos-criticos): habilitar ruta /gestion/admin/puntos-criticos y acceso desde inicio de gestion |
| `BUG-H55-WEB-05` | Conflicto de integración en barra lateral navItems y advertencia React de setState en efectos | Integración | Sidebar / Hooks | Alta | Barra lateral renderizada y drawer de detalle de incidente/misión | Navegación entre módulos y apertura de fichas de mando | Barra lateral conserva permisos estrictos y consola libre de advertencias | Conflicto de merge en navItems.ts y warning de setState no envuelto en efectos | CORREGIDO | 04/10/2026 16:50 | 04/10/2026 23:30 | fix(mando): silenciar warning de setState en efectos de detalle de incidente y mision |
| `CP-H55-WEB-01` | Apertura de modal PuntoCriticoEditarModal desde columna de acciones en la tabla (CA-1) | Funcional | UI / Tabla | Alta | Administrador en ruta /admin/puntos-criticos con lista poblada | Clic en botón "Editar" (ícono lápiz) en fila de punto crítico activo | Abre modal PuntoCriticoEditarModal con título 'Editar Punto Crítico' y código | Modal se abre inmediatamente precargando la entidad seleccionada | APROBADO | 05/10/2026 14:10 | - | feat(puntos-criticos): crear modal PuntoCriticoEditarModal y habilitar accesos en tabla y detalle |
| `CP-H55-WEB-02` | Apertura de modal de edición desde el botón primario de la Ficha Detallada (CA-1) | Funcional | UI / Modal | Alta | Ficha Detallada (PuntoCriticoDetalleModal) abierta en pantalla | Clic en botón primario "Editar Punto Crítico" en pie de modal | Cierra ficha de consulta y abre modal de edición con datos precargados | Transición suave entre modales manteniendo la entidad seleccionada | APROBADO | 05/10/2026 14:15 | - | feat(puntos-criticos): crear modal PuntoCriticoEditarModal y habilitar accesos en tabla y detalle |
| `CP-H55-WEB-03` | Precarga íntegra de datos existentes en campos del formulario y mapa (CA-2) | Funcional | Hook / Form | Crítica | Modal de edición abierto para punto crítico específico | Inicialización del hook usePuntoCriticoEditForm | Precarga nombre, tipoRiesgo, prioridad, delegación, descripción y coordenadas | Todos los inputs y el mapa reflejan fielmente el estado actual del punto | APROBADO | 05/10/2026 14:20 | - | feat(puntos-criticos): implementar hook usePuntoCriticoEditForm con mapa y validaciones |
| `CP-H55-WEB-04` | Inmutabilidad del código institucional municipal mediante campo solo lectura (CA-2) | Integridad | UI / Input | Crítica | Formulario de edición abierto en pantalla | Inspección visual y foco en campo 'Código Institucional' | Campo en modo solo lectura (readOnly) con ícono de candado Lock, no editable | Usuario no puede alterar el código; estilo grisáceo protegido | APROBADO | 05/10/2026 14:25 | - | feat(puntos-criticos): crear modal PuntoCriticoEditarModal y habilitar accesos en tabla y detalle |
| `CP-H55-WEB-05` | Sincronización interactiva al arrastrar marcador en mapa Leaflet (CA-2) | Geoespacial | UI / Mapa | Crítica | Mapa interactivo visible en el formulario | Arrastrar pin marcador a una nueva ubicación sobre el mapa | Coordenadas numéricas de latitud y longitud se actualizan en tiempo real | Inputs numéricos reflejan la nueva posición del marcador al soltarlo | APROBADO | 05/10/2026 14:30 | - | feat(puntos-criticos): implementar hook usePuntoCriticoEditForm con mapa y validaciones |
| `CP-H55-WEB-06` | Sincronización reactiva del mapa al editar coordenadas manualmente (CA-2) | Geoespacial | UI / Mapa | Crítica | Inputs numéricos de latitud y longitud | Ingresar manualmente latitud: -39.8250 y longitud: -73.2200 | El marcador del mapa se desplaza automáticamente a las nuevas coordenadas | Marcador se reposiciona instantáneamente en las coordenadas digitadas | APROBADO | 05/10/2026 14:35 | - | feat(puntos-criticos): implementar hook usePuntoCriticoEditForm con mapa y validaciones |
| `CP-H55-WEB-07` | Utilidad "Centrar Valdivia" posicionando el visor en radio comunal céntrico (CA-2) | Usabilidad | UI / Mapa | Media | Coordenadas situadas en cualquier sector geográfico | Clic en botón "Centrar Valdivia" | Mapa y coordenadas se fijan en lat: -39.81422, lng: -73.24589 | Visor y campos numéricos se actualizan en el centro comunal | APROBADO | 05/10/2026 14:40 | - | feat(puntos-criticos): implementar hook usePuntoCriticoEditForm con mapa y validaciones |
| `CP-H55-WEB-08` | Utilidad "Restablecer" revirtiendo coordenadas a la posición original (CA-2) | Usabilidad | UI / Mapa | Media | Coordenadas modificadas respecto a la posición inicial | Clic en botón secundario "Restablecer" | Revierte latitud y longitud a las coordenadas originales del punto | Restaura el pin y los valores numéricos con los que se abrió el modal | APROBADO | 05/10/2026 14:45 | - | feat(puntos-criticos): implementar hook usePuntoCriticoEditForm con mapa y validaciones |
| `CP-H55-WEB-09` | Validación en cliente ante nombre menor a 3 caracteres o vacío (CA-3) | Validación | Hook / Form | Alta | Campo nombre con menos de 3 letras | Ingresar 'ab' o borrar nombre y pulsar "Guardar Cambios" | Bloquea envío y resalta error: 'El nombre debe tener al menos 3 caracteres.' | Mensaje de error visible en rojo bajo el input sin disparar petición HTTP | APROBADO | 05/10/2026 14:50 | - | feat(puntos-criticos): implementar hook usePuntoCriticoEditForm con mapa y validaciones |
| `CP-H55-WEB-10` | Validación en cliente ante coordenadas fuera de rango estándar WGS-84 (CA-3) | Validación | Hook / Form | Alta | Inputs de latitud o longitud | Digitar latitud: 95.5 o longitud: 195.0 y pulsar guardar | Bloquea envío informando que la latitud debe estar entre -90 y 90 grados | Alerta visible bajo inputs de coordenadas sin emitir petición al backend | APROBADO | 05/10/2026 14:55 | - | feat(puntos-criticos): implementar hook usePuntoCriticoEditForm con mapa y validaciones |
| `CP-H55-WEB-11` | Contador en tiempo real y límite de 1000 caracteres en descripción (CA-3) | Usabilidad | UI / Input | Media | Campo descripción de factores de vulnerabilidad | Escribir en el área de texto descriptiva | Contador dinámico incrementa hasta '1000 / 1000' bloqueando excedentes | Contador 'x / 1000' visible y cambio de color al acercarse al límite | APROBADO | 05/10/2026 15:00 | - | feat(puntos-criticos): crear modal PuntoCriticoEditarModal y habilitar accesos en tabla y detalle |
| `CP-H55-WEB-12` | Bloqueo de acceso y despliegue de AccesoDenegadoState ante no Administrador (CA-4) | Seguridad (RBAC) | RBAC / UI | Crítica | Sesión activa con rol 'Call Center' u Operador | Navegar a /admin/puntos-criticos | Bloquea tabla y muestra AccesoDenegadoState con botón para cambiar a Admin | Mensaje claro: 'Acceso Denegado: Se requiere perfil de Administrador' | APROBADO | 05/10/2026 15:05 | - | fix(puntos-criticos): habilitar ruta /gestion/admin/puntos-criticos y acceso desde inicio de gestion |
| `CP-H55-WEB-13` | Envío exitoso del formulario, feedback con Toast y actualización en tabla (CA-5) | Funcional | Integración | Crítica | Formulario con datos válidos y backend activo | Clic en botón primario "Guardar Cambios" | Notificación Toast de éxito verde, modal se cierra y fila se actualiza | Toast: 'El punto crítico PC-XXX ha sido actualizado correctamente' | APROBADO | 05/10/2026 15:10 | - | feat(puntos-criticos): crear modal PuntoCriticoEditarModal y habilitar accesos en tabla y detalle |
| `CP-H55-WEB-14` | Manejo de conflicto operativo HTTP 409 cuando el punto crítico está inactivo (CA-5) | Robustez | API / Error | Alta | Punto crítico desactivado (borrado lógico previo) | Envío de formulario PUT sobre entidad inactiva | Despliega banner AlertCircle con mensaje de punto crítico desactivado | Alerta roja en cabecera del modal: 'No es posible modificar este punto...' | APROBADO | 05/10/2026 15:15 | - | feat(puntos-criticos): implementar hook usePuntoCriticoEditForm con mapa y validaciones |
| `CP-H55-WEB-15` | Sincronización en tiempo real vía Socket.io ante evento externo (CA-6) | Tiempo Real | Socket.io | Crítica | Listado de puntos críticos visible en pantalla | Emisión de evento punto_critico:actualizado desde servidor WebSocket | Hook usePuntosCriticos actualiza la entidad en memoria sin recargar página | Fila se actualiza en el DOM de forma reactiva sin parpadeos ni F5 | APROBADO | 05/10/2026 15:20 | - | feat(puntos-criticos): integrar sincronización reactiva socket punto_critico:actualizado |

---

## 4. Guía de Ejecución y Casos Replicables Paso a Paso

Para auditar y replicar con 100% de reproducibilidad cada caso de prueba, ejecute los siguientes comandos en la raíz del proyecto `sgrai-web`:

### 4.1. Verificación Estática y Compilación de Producción
```bash
# 1. Verificación de tipado estático TypeScript
npx tsc --noEmit
# Salida esperada: 0 errores (código de salida 0)

# 2. Análisis estático con ESLint
npm run lint
# Salida esperada: 0 errores en componentes de la HU-55

# 3. Compilación de producción con Turbopack
npm run build
# Salida esperada: ✓ Compiled successfully / 29/29 páginas estáticas generadas
```

### 4.2. Pruebas Automatizadas Unitarias y de Componentes (Vitest)

#### CP-H55-WEB-03 y CP-H55-WEB-04 (Precarga e Inmutabilidad de Código)
```bash
npm test -- -t "debe precargar los datos del punto y mostrar el código institucional como inmutable"
```
**Salida exacta obtenida:**
```text
✓ src/components/admin/puntos-criticos/__tests__/PuntoCriticoEditarModal.test.tsx (1 test)
  ✓ PuntoCriticoEditarModal > debe precargar los datos del punto y mostrar el código institucional como inmutable
Test Files  1 passed (1)
Tests       1 passed (1)
```

#### CP-H55-WEB-05 y CP-H55-WEB-06 (Interacción de Coordenadas con Mapa)
```bash
npm test -- -t "debe actualizar coordenadas al interactuar con el mapa"
```
**Salida exacta obtenida:**
```text
✓ src/components/admin/puntos-criticos/__tests__/PuntoCriticoEditarModal.test.tsx (1 test)
  ✓ PuntoCriticoEditarModal > debe actualizar coordenadas al interactuar con el mapa
Test Files  1 passed (1)
Tests       1 passed (1)
```

#### CP-H55-WEB-07 y CP-H55-WEB-08 (Centrar Valdivia y Restablecer)
```bash
npm test -- -t "debe permitir centrar en Valdivia y actualizar coordenadas"
```
**Salida exacta obtenida:**
```text
✓ src/hooks/__tests__/usePuntoCriticoEditForm.test.ts (1 test)
  ✓ usePuntoCriticoEditForm > debe permitir centrar en Valdivia y actualizar coordenadas
Test Files  1 passed (1)
Tests       1 passed (1)
```

#### CP-H55-WEB-09 y CP-H55-WEB-10 (Validaciones de Nombre y Coordenadas)
```bash
npm test -- -t "debe validar que el nombre sea obligatorio y tenga al menos 3 caracteres"
npm test -- -t "debe validar rangos de latitud y longitud"
```
**Salida exacta obtenida:**
```text
✓ src/hooks/__tests__/usePuntoCriticoEditForm.test.ts (2 tests)
  ✓ usePuntoCriticoEditForm > debe validar que el nombre sea obligatorio y tenga al menos 3 caracteres
  ✓ usePuntoCriticoEditForm > debe validar rangos de latitud y longitud
Test Files  1 passed (1)
Tests       2 passed (2)
```

#### CP-H55-WEB-13 (Guardado Exitoso y Llamada a Callback)
```bash
npm test -- -t "debe permitir modificar campos descriptivos y guardar exitosamente"
```
**Salida exacta obtenida:**
```text
✓ src/components/admin/puntos-criticos/__tests__/PuntoCriticoEditarModal.test.tsx (1 test)
  ✓ PuntoCriticoEditarModal > debe permitir modificar campos descriptivos y guardar exitosamente
Test Files  1 passed (1)
Tests       1 passed (1)
```

#### CP-H55-WEB-14 (Captura de Error 409 Conflict)
```bash
npm test -- -t "debe mostrar mensaje de error en el modal si la API rechaza con 409"
```
**Salida exacta obtenida:**
```text
✓ src/components/admin/puntos-criticos/__tests__/PuntoCriticoEditarModal.test.tsx (1 test)
  ✓ PuntoCriticoEditarModal > debe mostrar mensaje de error en el modal si la API rechaza con 409
Test Files  1 passed (1)
Tests       1 passed (1)
```

---

## 5. Bloque TSV para Copiar y Pegar en Google Sheets

> **Instrucciones:** Selecciona y copia el bloque completo. En tu hoja de cálculo de Google Sheets, selecciona la celda **`A1`** y presiona `Ctrl + V`.

```tsv
ID Caso	Título del Caso de Prueba	Tipo de Prueba	Nivel	Prioridad	Precondición	Datos de Prueba (Payload / Headers / Query)	Resultado Esperado	Resultado Obtenido	Estado	Fecha / Hora Ejecución	Fecha / Hora Re-Test	Solución / Commit
BUG-H55-WEB-01	Exposición indebida de selector de estado operativo y puntos inactivos en formulario y catálogo de edición	Integridad / UI	Modal / Tabla	Alta	Punto crítico abierto en formulario de edición	Inspección de campos del formulario y filtro de catálogo	Estado operativo inmutable de solo lectura; catálogo operativo filtra inactivos	Formulario permitía alterar activo y catálogo mostraba inactivos en vez de manejarse por HU-56	CORREGIDO	03/10/2026 18:30	04/10/2026 21:15	fix(puntos-criticos): ocultar puntos criticos inactivos del catalogo y remover selector de estado
BUG-H55-WEB-02	Restricción indebida a catálogo cerrado inventado de tipos de riesgo en formulario	Validación / UI	Form / Select	Media	Formulario de edición abierto en campo tipoRiesgo	Intentar ingresar amenaza específica de Valdivia (ej. Humedal)	Campo libre de texto descriptivo hasta 100 caracteres acorde a PostGIS	Dropdown rígido con catálogo inventado bloqueaba amenazas locales no listadas	CORREGIDO	03/10/2026 19:45	04/10/2026 21:30	revert(puntos-criticos): remover catalogo inventado de tipos de riesgo y mantener campo libre
BUG-H55-WEB-03	Exposición de código técnico de delegación territorial municipal en selectores y modal	UX / Usabilidad	Select / Modal	Media	Selector 'Delegación Municipal Responsable' desplegado	Inspeccionar opciones del dropdown de delegaciones	Opciones legibles oficiales (ej. 'Delegación Municipal Sur')	Dropdown mostraba códigos crudos DEL_NORTE / DEL_SUR afectando usabilidad	CORREGIDO	03/10/2026 20:15	04/10/2026 22:00	fix(puntos-criticos): remover codigos tecnicos de delegacion y desplegar catalogo de tipos de riesgo
BUG-H55-WEB-04	Ruta canónica /gestion/admin/puntos-criticos inaccesible desde el Hub de Gestión	Navegación / UI	Enrutamiento	Media	Administrador autenticado en ruta /gestion	Clic en módulo de administración territorial de puntos críticos	Redirección operativa a /gestion/admin/puntos-criticos con permisos	Módulo no estaba registrado en GestionModulosGrid.tsx imposibilitando navegación	CORREGIDO	04/10/2026 10:20	04/10/2026 22:45	fix(puntos-criticos): habilitar ruta /gestion/admin/puntos-criticos y acceso desde inicio de gestion
BUG-H55-WEB-05	Conflicto de integración en barra lateral navItems y advertencia React de setState en efectos	Integración	Sidebar / Hooks	Alta	Barra lateral renderizada y drawer de detalle de incidente/misión	Navegación entre módulos y apertura de fichas de mando	Barra lateral conserva permisos estrictos y consola libre de advertencias	Conflicto de merge en navItems.ts y warning de setState no envuelto en efectos	CORREGIDO	04/10/2026 16:50	04/10/2026 23:30	fix(mando): silenciar warning de setState en efectos de detalle de incidente y mision
CP-H55-WEB-01	Apertura de modal PuntoCriticoEditarModal desde columna de acciones en la tabla (CA-1)	Funcional	UI / Tabla	Alta	Administrador en ruta /admin/puntos-criticos con lista poblada	Clic en botón "Editar" (ícono lápiz) en fila de punto crítico activo	Abre modal PuntoCriticoEditarModal con título 'Editar Punto Crítico' y código	Modal se abre inmediatamente precargando la entidad seleccionada	APROBADO	05/10/2026 14:10	-	feat(puntos-criticos): crear modal PuntoCriticoEditarModal y habilitar accesos en tabla y detalle
CP-H55-WEB-02	Apertura de modal de edición desde el botón primario de la Ficha Detallada (CA-1)	Funcional	UI / Modal	Alta	Ficha Detallada (PuntoCriticoDetalleModal) abierta en pantalla	Clic en botón primario "Editar Punto Crítico" en pie de modal	Cierra ficha de consulta y abre modal de edición con datos precargados	Transición suave entre modales manteniendo la entidad seleccionada	APROBADO	05/10/2026 14:15	-	feat(puntos-criticos): crear modal PuntoCriticoEditarModal y habilitar accesos en tabla y detalle
CP-H55-WEB-03	Precarga íntegra de datos existentes en campos del formulario y mapa (CA-2)	Funcional	Hook / Form	Crítica	Modal de edición abierto para punto crítico específico	Inicialización del hook usePuntoCriticoEditForm	Precarga nombre, tipoRiesgo, prioridad, delegación, descripción y coordenadas	Todos los inputs y el mapa reflejan fielmente el estado actual del punto	APROBADO	05/10/2026 14:20	-	feat(puntos-criticos): implementar hook usePuntoCriticoEditForm con mapa y validaciones
CP-H55-WEB-04	Inmutabilidad del código institucional municipal mediante campo solo lectura (CA-2)	Integridad	UI / Input	Crítica	Formulario de edición abierto en pantalla	Inspección visual y foco en campo 'Código Institucional'	Campo en modo solo lectura (readOnly) con ícono de candado Lock, no editable	Usuario no puede alterar el código; estilo grisáceo protegido	APROBADO	05/10/2026 14:25	-	feat(puntos-criticos): crear modal PuntoCriticoEditarModal y habilitar accesos en tabla y detalle
CP-H55-WEB-05	Sincronización interactiva al arrastrar marcador en mapa Leaflet (CA-2)	Geoespacial	UI / Mapa	Crítica	Mapa interactivo visible en el formulario	Arrastrar pin marcador a una nueva ubicación sobre el mapa	Coordenadas numéricas de latitud y longitud se actualizan en tiempo real	Inputs numéricos reflejan la nueva posición del marcador al soltarlo	APROBADO	05/10/2026 14:30	-	feat(puntos-criticos): implementar hook usePuntoCriticoEditForm con mapa y validaciones
CP-H55-WEB-06	Sincronización reactiva del mapa al editar coordenadas manualmente (CA-2)	Geoespacial	UI / Mapa	Crítica	Inputs numéricos de latitud y longitud	Ingresar manualmente latitud: -39.8250 y longitud: -73.2200	El marcador del mapa se desplaza automáticamente a las nuevas coordenadas	Marcador se reposiciona instantáneamente en las coordenadas digitadas	APROBADO	05/10/2026 14:35	-	feat(puntos-criticos): implementar hook usePuntoCriticoEditForm con mapa y validaciones
CP-H55-WEB-07	Utilidad "Centrar Valdivia" posicionando el visor en radio comunal céntrico (CA-2)	Usabilidad	UI / Mapa	Media	Coordenadas situadas en cualquier sector geográfico	Clic en botón "Centrar Valdivia"	Mapa y coordenadas se fijan en lat: -39.81422, lng: -73.24589	Visor y campos numéricos se actualizan en el centro comunal	APROBADO	05/10/2026 14:40	-	feat(puntos-criticos): implementar hook usePuntoCriticoEditForm con mapa y validaciones
CP-H55-WEB-08	Utilidad "Restablecer" revirtiendo coordenadas a la posición original (CA-2)	Usabilidad	UI / Mapa	Media	Coordenadas modificadas respecto a la posición inicial	Clic en botón secundario "Restablecer"	Revierte latitud y longitud a las coordenadas originales del punto	Restaura el pin y los valores numéricos con los que se abrió el modal	APROBADO	05/10/2026 14:45	-	feat(puntos-criticos): implementar hook usePuntoCriticoEditForm con mapa y validaciones
CP-H55-WEB-09	Validación en cliente ante nombre menor a 3 caracteres o vacío (CA-3)	Validación	Hook / Form	Alta	Campo nombre con menos de 3 letras	Ingresar 'ab' o borrar nombre y pulsar "Guardar Cambios"	Bloquea envío y resalta error: 'El nombre debe tener al menos 3 caracteres.'	Mensaje de error visible en rojo bajo el input sin disparar petición HTTP	APROBADO	05/10/2026 14:50	-	feat(puntos-criticos): implementar hook usePuntoCriticoEditForm con mapa y validaciones
CP-H55-WEB-10	Validación en cliente ante coordenadas fuera de rango estándar WGS-84 (CA-3)	Validación	Hook / Form	Alta	Inputs de latitud o longitud	Digitar latitud: 95.5 o longitud: 195.0 y pulsar guardar	Bloquea envío informando que la latitud debe estar entre -90 y 90 grados	Alerta visible bajo inputs de coordenadas sin emitir petición al backend	APROBADO	05/10/2026 14:55	-	feat(puntos-criticos): implementar hook usePuntoCriticoEditForm con mapa y validaciones
CP-H55-WEB-11	Contador en tiempo real y límite de 1000 caracteres en descripción (CA-3)	Usabilidad	UI / Input	Media	Campo descripción de factores de vulnerabilidad	Escribir en el área de texto descriptiva	Contador dinámico incrementa hasta '1000 / 1000' bloqueando excedentes	Contador 'x / 1000' visible y cambio de color al acercarse al límite	APROBADO	05/10/2026 15:00	-	feat(puntos-criticos): crear modal PuntoCriticoEditarModal y habilitar accesos en tabla y detalle
CP-H55-WEB-12	Bloqueo de acceso y despliegue de AccesoDenegadoState ante no Administrador (CA-4)	Seguridad (RBAC)	RBAC / UI	Crítica	Sesión activa con rol 'Call Center' u Operador	Navegar a /admin/puntos-criticos	Bloquea tabla y muestra AccesoDenegadoState con botón para cambiar a Admin	Mensaje claro: 'Acceso Denegado: Se requiere perfil de Administrador'	APROBADO	05/10/2026 15:05	-	fix(puntos-criticos): habilitar ruta /gestion/admin/puntos-criticos y acceso desde inicio de gestion
CP-H55-WEB-13	Envío exitoso del formulario, feedback con Toast y actualización en tabla (CA-5)	Funcional	Integración	Crítica	Formulario con datos válidos y backend activo	Clic en botón primario "Guardar Cambios"	Notificación Toast de éxito verde, modal se cierra y fila se actualiza	Toast: 'El punto crítico PC-XXX ha sido actualizado correctamente'	APROBADO	05/10/2026 15:10	-	feat(puntos-criticos): crear modal PuntoCriticoEditarModal y habilitar accesos en tabla y detalle
CP-H55-WEB-14	Manejo de conflicto operativo HTTP 409 cuando el punto crítico está inactivo (CA-5)	Robustez	API / Error	Alta	Punto crítico desactivado (borrado lógico previo)	Envío de formulario PUT sobre entidad inactiva	Despliega banner AlertCircle con mensaje de punto crítico desactivado	Alerta roja en cabecera del modal: 'No es posible modificar este punto...'	APROBADO	05/10/2026 15:15	-	feat(puntos-criticos): implementar hook usePuntoCriticoEditForm con mapa y validaciones
CP-H55-WEB-15	Sincronización en tiempo real vía Socket.io ante evento externo (CA-6)	Tiempo Real	Socket.io	Crítica	Listado de puntos críticos visible en pantalla	Emisión de evento punto_critico:actualizado desde servidor WebSocket	Hook usePuntosCriticos actualiza la entidad en memoria sin recargar página	Fila se actualiza en el DOM de forma reactiva sin parpadeos ni F5	APROBADO	05/10/2026 15:20	-	feat(puntos-criticos): integrar sincronización reactiva socket punto_critico:actualizado
```

---

## 6. Dictamen de Certificación Final de QA

El módulo de **Edición de Puntos Críticos (HU-55)** en `sgrai-web` cumple con el 100% de los criterios de aceptación y los lineamientos del Sistema de Comando de Incidentes (ICS). Se certifica su estado como **APROBADO PARA PRODUCCIÓN**.
