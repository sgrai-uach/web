# Manual de Usuario: Edición de Puntos Críticos (HU-55)

> **Módulo:** Administración y Gestión Territorial / Prevención  
> **Historia de Usuario:** HU-55 — Editar características de un punto crítico  
> **Rol Destinatario:** Administrador Municipal  
> **Sistema:** SGRAI — Dirección de Gestión de Riesgos de Desastres, Municipalidad de Valdivia  
> **Ruta del Módulo:** `/gestion/admin/puntos-criticos`

---

## 1. Objetivo de la Funcionalidad

Permitir al usuario con rol de **Administrador** modificar y actualizar las características descriptivas, nivel de prioridad operativa, delegación territorial asociada y coordenadas geográficas exactas de un punto crítico ya registrado en el catastro comunal, garantizando que el mapa de riesgos y los tableros de mando reflejen en todo momento la situación real de los sectores vulnerables de Valdivia.

---

## 2. Control de Acceso y Permisos (RBAC)

1. La edición de puntos críticos está reservada exclusivamente a usuarios autenticados con rol de **Administrador** o que cuenten con permisos explícitos de administración territorial.
2. Si un usuario no autorizado intenta enviar la petición de actualización a la API, el sistema responderá con un código **HTTP 403 Forbidden** y la interfaz mostrará un mensaje de alerta impidiendo el guardado de cambios.

---

## 3. Acceso al Formulario de Edición

El Administrador puede acceder a la ventana modal de edición a través de dos puntos de entrada:

### 3.1. Desde la Tabla del Listado de Puntos Críticos
1. Ingrese a la ruta canónica `/gestion/admin/puntos-criticos` desde el menú lateral de navegación (*Administración › Puntos Críticos*).
2. Ubique el punto crítico que desea editar (puede utilizar el buscador de texto o los filtros por delegación y prioridad).
3. En la columna **Acción** (extremo derecho de la tabla), haga clic en el botón plano **"Editar"** (acompañado del ícono de lápiz).

### 3.2. Desde la Ficha Detallada (Modal de Consulta)
1. Al hacer clic sobre cualquier fila del listado se abre la **Ficha Detallada de Punto Crítico**.
2. En la barra inferior de acciones de la ficha, haga clic en el botón primario destacado **"Editar Punto Crítico"**.
3. La ficha de lectura se cerrará y se abrirá inmediatamente el formulario de edición con todos los datos precargados.

---

## 4. Campos del Formulario de Edición

El formulario se organiza en dos secciones principales respetando la identidad visual institucional plana y sobria de la Municipalidad de Valdivia:

### 4.1. Sección 1: Características Generales
* **Código Institucional (Solo lectura):**  
  Identificador único municipal (ej. `PC-ANG-01`). Por motivos de trazabilidad y consistencia histórica con misiones y reportes, este código es **inmutable** y no puede ser alterado.
* **Estado Operativo (Solo lectura informativa):**  
  Muestra si el punto crítico se encuentra *Activo* o *Inactivo*. La activación o desactivación se gestiona de forma aislada a través del módulo de borrado lógico (HU-56).
* **Nombre o Sector (*Obligatorio*):**  
  Nombre formal o referencia geográfica reconocible (ej. *Sector Humedal Angachilla - Pasaje Los Robles*). Mínimo 3 y máximo 150 caracteres.
* **Tipo de Riesgo (*Opcional*):**  
  Tipología o amenaza recurrente (ej. *Inundación y anegamiento*, *Remoción en masa*, *Marejadas*). Máximo 100 caracteres.
* **Nivel de Prioridad (*Obligatorio*):**  
  Selector con los cuatro niveles homologados del sistema:
  * `Baja` (verde)
  * `Media` (ámbar)
  * `Alta` (naranja)
  * `Crítica` (rojo)
* **Delegación Municipal Territorial (*Opcional*):**  
  Permite asociar el punto a una delegación municipal operativa (*Norte*, *Sur*, *Costa*, *Calle Calle*) o dejarlo como *Central Comunal*.
* **Descripción y Factores de Vulnerabilidad (*Opcional*):**  
  Área de texto de hasta 1000 caracteres con contador en tiempo real para consignar antecedentes históricos, condiciones de saturación de suelo o recomendaciones técnicas.

### 4.2. Sección 2: Ubicación Geográfica en Mapa
* **Mapa Interactivo Leaflet (OpenStreetMap):**  
  * El mapa se inicializa automáticamente centrado en la ubicación actual del punto crítico.
  * El pin marcador es arrastrable (*draggable*). Al soltar el pin en una nueva posición sobre el mapa, las coordenadas numéricas se actualizan de forma instantánea.
* **Inputs Numéricos de Latitud y Longitud GPS (*Obligatorios*):**  
  * Permiten ingresar o afinar las coordenadas geográficas con precisión decimal (grados estándar WGS-84).
  * La edición de estos campos numéricos actualiza y reposiciona de inmediato el marcador sobre el mapa (sincronización bidireccional).
* **Botón "Centrar Valdivia":**  
  Ubica rápidamente el visor en el radio céntrico comunal (-39.81422, -73.24589).
* **Botón "Restablecer":**  
  Aparece cuando el usuario ha movido las coordenadas respecto a la posición original, permitiendo revertir la ubicación al punto guardado inicialmente con un solo clic.

---

## 5. Regla de Negocio: Reubicación Espacial y Permisividad

1. **Permisividad de Coordenadas (Opción A):**  
   El Administrador tiene la facultad de reubicar y modificar la posición geográfica de cualquier punto crítico activo en cualquier momento, aun cuando existan misiones preventivas o patrullas en terreno asignadas a dicho sector.
2. **Sincronización Reactiva Inmediata:**  
   Al guardar los cambios exitosamente en la base de datos geoespacial (PostGIS), el backend emite un evento en tiempo real (`punto_critico:actualizado`) vía WebSockets (Socket.io).
   * La tabla del listado se actualiza en pantalla sin requerir recargar la página (`F5`).
   * Los visores cartográficos del **Centro de Mando (Encargado)** y del **Dashboard Estratégico (Supervisor)** reposicionan el marcador de inmediato.

---

## 6. Mensajes de Error y Casos Especiales

| Situación / Error | Causa | Acción Recomendada |
|---|---|---|
| **Error 409 Conflict: Punto inactivo** | El punto crítico fue desactivado previamente (borrado lógico). | La API no permite editar puntos inactivos. Se debe restaurar o reactivar el punto previamente en el módulo correspondiente. |
| **Error 403 Forbidden: Acceso no autorizado** | El usuario no posee el rol de Administrador o su sesión expiró. | Inicie sesión con una cuenta autorizada de la Dirección de Gestión de Riesgos de Desastres. |
| **Error de validación: Nombre < 3 caracteres o vacío** | El campo nombre no cumple con la longitud mínima requerida. | Ingrese una descripción representativa del sector de al menos 3 caracteres. |
| **Error de validación: Coordenadas fuera de rango** | Se ingresaron valores de latitud/longitud fuera del rango estándar (-90 a 90 o -180 a 180). | Corrija los valores numéricos o utilice el mapa interactivo para fijar el punto. |

---

## 7. Relación con Otros Sistemas y Repositorios

* **`sgrai-api` (Backend):**  
  Procesa la petición en `PUT /api/puntos-criticos/{id}`, valida la estructura de datos, ejecuta la sentencia `UPDATE` con Kysely y PostGIS, y emite el evento WebSockets `punto_critico:actualizado`.
* **`sgrai-pwa` (Aplicación de Terreno):**  
  Las cuadrillas y patrullas que consulten puntos críticos o que tengan asignadas misiones preventivas en ese sector recibirán la nueva ubicación geográfica de forma sincronizada en sus mapas locales para la ejecución de tareas de despeje, inspección o contención.
