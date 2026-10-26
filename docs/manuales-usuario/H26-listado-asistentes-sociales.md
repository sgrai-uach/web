# Manual de Usuario: Listado y Disponibilidad de Asistentes Sociales (HU-26)

**Código Historia de Usuario:** HU-26  
**Módulo:** Asistencia Social / Operaciones  
**Roles Destinatarios:** Encargado de Operaciones, Administrador Municipal  
**Roles de Solo Consulta:** Asistente Social  
**Permiso RBAC Requerido:** `asistencia_social:leer`  
**Ruta del Módulo:** `/gestion/asistente-social/personal`  
**Versión:** 1.0.0 (SGRAI v0.7.0)  

---

## 1. Objetivo de la Funcionalidad

Permitir al **Encargado de Operaciones** y al **Administrador General** monitorear en tiempo real la nómina completa de asistentes sociales municipales, su estado de disponibilidad operativa y la cantidad de casos y fichas FIBE que tienen asignados actualmente en terreno. 

Esta vista consolida el panorama de recursos humanos del área social desplegados en la comuna de Valdivia, facilitando la toma de decisiones para balancear la carga de trabajo y asegurar una oportuna respuesta ante familias damnificadas por anegamientos, daños estructurales o emergencias climáticas.

---

## 2. Control de Acceso y Seguridad (RBAC)

1. El acceso a esta vista está protegido mediante el permiso institucional **`asistencia_social:leer`** y por pertenencia al rol **Encargado** o **Administrador**.
2. Si un usuario no autorizado (por ejemplo, con rol Informante o Call Center sin dicho permiso) intenta ingresar a `/gestion/asistente-social/personal`, el sistema desplegará de inmediato la pantalla institucional de **Acceso Denegado (HTTP 403)** con el componente `AccesoDenegadoState`, indicando el motivo y ofreciendo un botón para retornar a su módulo correspondiente.

---

## 3. Flujo Paso a Paso de Consulta y Navegación

### Paso 1: Ingreso desde el Módulo de Asistencia Social
1. En el menú lateral de navegación (`AppSidebar`), bajo el grupo **Operaciones**, hacer clic en **"Asistencia Social"** (`/gestion/asistente-social`).
2. En la cabecera principal de la bandeja de casos sociales, al lado del botón primario *"+ Nuevo Evento Social"*, hacer clic en el botón secundario:
   ```text
   [ 👥 Ver Asistentes Sociales ]
   ```
3. El sistema navegará de forma directa a la vista dedicada `/gestion/asistente-social/personal`, presentando la miga de pan:
   `Inicio › Operaciones › Asistencia Social › Dotación de Asistentes Sociales`.

---

### Paso 2: Lectura de la Tabla de Dotación y Asignaciones
La tabla presenta las siguientes columnas de información operativa:

| Columna | Descripción | Elementos Visuales |
|---|---|---|
| **Nombre y Apellidos** | Nombre completo del profesional social, con su RUT y correo institucional en la línea secundaria. | Ícono `User` de Lucide y tipografía Noto Sans en `--color-primary-teal-dark`. |
| **Delegación Municipal** | Jurisdicción territorial asignada en la comuna (Costa, Norte, Sur o Calle Calle). | Ícono `MapPin` institucional. |
| **Teléfono Institucional** | Número de contacto directo para coordinación de cuadrillas y terreno. | Enlace directo con ícono `Phone` (`tel:+569...`) para llamadas en un clic. |
| **Estado Operativo** | Condición actual de disponibilidad del profesional. | Badge estilizado con tokens institucionales de CSS Modules. |
| **Casos FIBE Asignados** | Conteo en tiempo real de eventos activos en estado `ASIGNADO` o `EN_EVALUACION_FIBE`. | Badge destacado numérico (`0` en gris tenue, `> 0` en teal institucional). |

---

### Paso 3: Interpretación de Badges de Estado Operativo

Los estados provienen de la definición institucional y se presentan sin emojis ni colores saturados:

* **Disponible:** Badge en verde sutil (`--color-success-bg` y `--color-success`). El profesional está apto para recibir nuevas asignaciones inmediatas.
* **En Misión:** Badge en ámbar institucional (`--color-warning-bg` y `--color-warning`). El profesional está actualmente desplegado en terreno levantando fichas FIBE.
* **Descanso:** Badge en neutro institucional (`--color-bg-light` y `--color-charcoal`). El funcionario está fuera de turno programado.
* **Licencia Médica:** Badge en gris atenuado (`--color-bg-light` y `--color-text-muted`).
* **Inactivo:** Badge en gris tenue para personal desvinculado o en receso operativo.

---

### Paso 4: Filtrado Territorial y Operativo

La barra de filtros permite acotar la nómina en tiempo real:

1. **Búsqueda Rápida:** Filtra por coincidencia parcial de nombres, apellidos, RUT, correo institucional o teléfono.
2. **Delegación Territorial:** Permite seleccionar entre *Todas las delegaciones*, *Delegación Costa*, *Delegación Norte*, *Delegación Sur* o *Delegación Calle Calle*.
3. **Estado Operativo:** Permite aislar rápidamente a los profesionales *Disponibles* para asignar nuevas emergencias, o revisar aquellos *En Misión*.
4. **Sincronización en URL (`URLSearchParams`):** Todos los filtros se reflejan en la barra de direcciones del navegador (`?delegacionId=...&estadoOperativo=...`), permitiendo compartir la vista o recargar la página sin perder los criterios aplicados.
5. **Botón "Limpiar filtros":** Restablece todos los selectores al valor por defecto.

---

### Paso 5: Paginación y Retorno
* **Paginación:** Si la dotación excede el límite de 20 profesionales por página, se despliega el paginador institucional con selectores de página previa, siguiente y conteo total de elementos.
* **Retorno:** En la cabecera del módulo, el botón secundario **"Volver a Casos Sociales"** permite regresar inmediatamente a la bandeja de eventos excepcionales (`/gestion/asistente-social`).

---

## 4. Casos Especiales y Mensajes del Sistema

### 1. Sin resultados según los filtros (`EmptyState`)
Si los filtros aplicados no coinciden con ningún funcionario:
* Se desplegará el componente institucional `EmptyState` con el mensaje:
  > *"No hay asistentes que coincidan con los filtros"*
* Se provee un botón directo **"Restablecer Filtros"** para recuperar la nómina completa.

### 2. Estado de Carga (`Skeleton`)
Durante la consulta a la API backend, la tabla muestra filas con animación pulsante (`AsistentesSocialesSkeleton`), manteniendo la estructura visual sin saltos bruscos en la pantalla.

### 3. Contingencia y Desconexión
En caso de interrupción en la red o desconexión temporal con `sgrai-api`, el servicio conmuta automáticamente a la nómina de respaldo en memoria garantizando continuidad visual en pantalla.

---

## 5. Relación con otros Repositorios del SGRAI

* **`sgrai-api`:** Consume el endpoint `GET /api/personal?rolCodigo=ASISTENTE_SOCIAL`. La API realiza automáticamente el conteo de registros en `evento_asistencia_social` optimizado mediante el índice `024_indice_asistente_social_casos`.
* **`sgrai-pwa`:** Los eventos derivados a asistentes sociales en este panel se reflejan en las misiones operativas asignadas en terreno.
