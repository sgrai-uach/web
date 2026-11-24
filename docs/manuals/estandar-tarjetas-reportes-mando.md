# Estándar de Diseño: Tarjetas de Reportes de Terreno y Reclasificación en el Centro de Mando

**Repositorio:** `sgrai-web`  
**Módulos:** Centro de Mando (`/mando`), Modal de Detalle de Misión (`MisionDetalleModal.tsx`, `MisionReportesSection.tsx`), Panel Lateral de Incidente (`IncidenteMisionesSection.tsx`, `IncidenteUltimoReporteSection.tsx`).  
**Referencia arquitectónica:** `GEMINI.md` §3 (Flat UI, bordes rectangulares `0px`, paleta institucional de la Municipalidad de Valdivia).

---

## 1. Principios Visuales y Usabilidad

Las tarjetas de reportes de terreno representan la evidencia técnica directa levantada por las patrullas verificadoras y delegados de cuadrilla. Para asegurar una jerarquía clara, orden visual y rápida lectura operativa por el Encargado de Emergencias:

1. **Geometría Rectangular Plana (`0px` border-radius):** En estricto apego al diseño institucional, ninguna tarjeta, chip, botón o contenedor de reporte debe poseer bordes redondeados (`border-radius: 0px`).
2. **Borde Izquierdo Semántico (`border-left: 4px solid ...`):**
   - **Verde Menta (`var(--color-accent-mint, #4FAE9B)`):** Reportes de evaluación de terreno normales / vigentes e informes `VERIFICACION_CIERRE` con dictamen `REQUIERE_CUADRILLA`.
   - **Rojo Institucional (`var(--color-danger, #D32F2F)`):** Informes `VERIFICACION_CIERRE` donde la patrulla declaró el incidente como `NO_ABORDABLE`.
   - **Teal Institucional (`var(--color-primary-teal, #1B6F7D)`):** Informe técnico de reclasificación de tipología en terreno o reporte destacado / seleccionado.
   - **Ámbar / Naranja (`var(--color-warning, #E65100)`):** Reportes donde la patrulla ajustó manualmente la prioridad sugerida por el sistema.
   - **Gris neutro (`#DFE3E8` o `#CBD5E1`):** Reportes de versiones históricas previas.
3. **Cabecera Interactiva Desplegable en 2 Filas (`.reporteHeaderTrigger` / `ReporteCardShell`):**
   - **Fila Superior (`.reporteHeaderTop`):**
     - Izquierda (`.evaluadorInfo`): Ícono institucional (`User` o `ShieldCheck`), nombre legible del evaluador o patrulla (sin duplicar el prefijo `"Patrulla"`) y su RUT o líder entre paréntesis.
     - Derecha fija (`.reporteHeaderRight`): Marca de tiempo con ícono `Clock` y formato unificado (`DD mes AAAA, HH:MM`) + flecha `ChevronDown` con rotación CSS de 180°.
   - **Fila Inferior de Etiquetas (`.reporteMetaTags`):**
     - Chips de clasificación técnica (`<Chip size="sm" />`):
       - Tipo / versión del reporte (`variant="teal"` o `"neutral"`): ej. `Evaluación en Terreno Realizada` (H37), `Reporte #1 (Inicial)` / `Reporte #N (Rectificación)` (H38).
       - Vigencia: `Vigente` (`variant="solid-teal"`, reservado exclusivamente para el reporte más reciente del historial unificado) o `Histórico` (`variant="neutral"`).
       - Estado o contexto específico: `Tipología sin cambios` / `Tipología reclasificada` (H37), `estadoTerreno` y `N hogares` (H38).
4. **Comportamiento Unificado de Lista y Apertura:**
   - Todos los reportes (H37 y H38) comparten fondo blanco (`#FFFFFF`), se ordenan cronológicamente en un mismo listado unificado y se contabilizan en el total de versiones registradas.
   - **Solo el más reciente (vigente) permanece abierto** al ingresar; los reportes históricos previos permanecen colapsados para priorizar la información actual y evitar saturación cognitiva.
   - Si el usuario hace click en un reporte específico desde el panel lateral, dicho reporte se abre y resalta automáticamente (`reporteDestacadoId`).

---

## 2. Anatomía de la Tarjeta de Reporte (`.reporteCard`)

```
┌──────────────────────────────────────────────────────────────────────────┐
│ [Icono] Nombre Evaluador / Patrulla (RUT / Líder)     [Clock] Fecha [ v ]│
│ [Tipo / Versión] [Vigente | Histórico] [Estado / Metadatos]              │ <-- Cabecera unificada de 2 filas
├──────────────────────────────────────────────────────────────────────────┤
│ ┌─ Comparativa de Prioridad (si difiere o fue evaluada) ───────────────┐ │
│ │ Prioridad sugerida: Media | Prioridad asignada: Alta                 │ │
│ │ Justificación técnica: "Crecida rápida amenaza dos viviendas"        │ │
│ └──────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│ Diagnóstico y Resumen Técnico: "Se constata anegamiento perimetral..."   │
│                                                                          │
│ ┌─ Evaluación Demográfica y Condiciones en Terreno ────────────────────┐ │
│ │ Desglose por Familia (si hay > 1 hogar):                             │ │
│ │ • Familia #1 (Casa 1): 4 pers. | Vivienda: Daño moderado             │ │
│ │ • Familia #2 (Familia Pérez): 2 pers. | Vivienda: Grave / Inhabitable│ │
│ │                                                                      │ │
│ │ Totales consolidados: 6 personas · 2 viviendas · Compromiso máximo   │ │
│ │ Peligros activos y requerimientos: [Riesgo Eléctrico]                │ │
│ └──────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│ Acciones Ejecutadas en el Sitio: "Zanjeo preventivo y corte eléctrico" │
│ Galería de Evidencias (Adjuntos fotográficos y coordenadas GPS)          │
└──────────────────────────────────────────────────────────────────────────┘
```

### 2.1 Anatomía del Informe de Verificación y Cierre (`tipoReporte === 'VERIFICACION_CIERRE'`, HU-39)

```
┌──────────────────────────────────────────────────────────────────────────┐
│ [Icono] Nombre Evaluador [Informe de Verificación y Cierre]              │
│         [Dictamen: Requiere Cuadrilla | No Abordable] [Vigente] [Hora]   │
├──────────────────────────────────────────────────────────────────────────┤
│ (Si NO_ABORDABLE) ┌─ Declaración Fundada de No Abordabilidad ──────────┐ │
│                   │ Motivo técnico: "Predio privado inaccesible..."    │ │
│                   └────────────────────────────────────────────────────┘ │
│                                                                          │
│ Diagnóstico y Resumen Técnico del Siniestro: "..."                       │
│                                                                          │
│ ┌─ Estado del Terreno, Personas y Asistencia Social ───────────────────┐ │
│ │ Estado del Terreno: Inundado accesible                               │ │
│ │ Personas Damnificadas: 6  [Modificado respecto a prioridad (Antes:4)]│ │
│ │ Daños Materiales Estimados: "Cerco perimetral dañado"                │ │
│ │ Asistencia Social (Ficha FIBE): [Requiere Ficha FIBE]                │ │
│ └──────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│ Observaciones Generales: "..."                                           │
│ Galería de Evidencias (Sección preparada para adjuntos HU-43)            │
└──────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Anatomía del Informe Técnico Final de Cuadrilla (`tipoReporte === 'REPORTE_CUADRILLA'`, HU-68)

```
┌──────────────────────────────────────────────────────────────────────────┐
│ [HardHat] Nombre Delegado (Cuadrilla · RUT)            [Clock] Fecha [ v ]│
│ [Informe Técnico Final de Cuadrilla (Cierre de Misión)]                  │
│ [Estado terreno: Controlado] [4.5 horas hombre] [Vigente] [Requiere Apoyo]│
├──────────────────────────────────────────────────────────────────────────┤
│ (Si CRITICO / INACCESIBLE / REQUIERE_SEGUIMIENTO)                        │
│ ┌─ Condición Final del Terreno ────────────────────────────────────────┐ │
│ │ Alerta contextual para evaluación del Encargado antes de cierre H86  │ │
│ └──────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│ Resumen de Faenas Ejecutadas: "Despeje completo de calzada y retiro..." │
│                                                                          │
│ ┌─ Métricas de Cierre y Estado Final ──────────────────────────────────┐ │
│ │ Estado Final del Terreno: Controlado | Horas Hombre: 4.5 horas hombre│ │
│ │ Daños Materiales Estimados: "..."    | Ficha FIBE (si consta): [...] │ │
│ └──────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│ ┌─ Materiales e Insumos Consumidos (N) ────────────────────────────────┐ │
│ │ Material / Insumo    | Cantidad Consumida | Observación              │ │
│ │ Sacos de arena       | 25 sacos           | Contención perimetral    │ │
│ └──────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│ Observaciones Generales: "..."                                           │
│ Galería de Evidencias (Fotos, videos y PDFs en tiempo real — HU-43)      │
└──────────────────────────────────────────────────────────────────────────┘
```

- **Reglas específicas de `REPORTE_CUADRILLA`:**
  - A diferencia de los reportes de patrulla (`EVALUACION_PRIORIDAD` y `VERIFICACION_CIERRE`), donde el `estadoTerreno` permanece oculto, el informe de cuadrilla **exige** desplegar el **Estado Final del Terreno** mediante chip semántico (`success` para `CONTROLADO`/`ESTABLE`/`FINALIZADO`, `warning` para `REQUIERE_SEGUIMIENTO`, `danger` para `CRITICO`/`INACCESIBLE`).
  - **Borde izquierdo semántico:** Verde menta (`--color-accent-mint`) en estados favorables, ámbar (`--color-warning`) en `REQUIERE_SEGUIMIENTO` o cuando solicita apoyo adicional, y rojo (`--color-danger`) en `CRITICO` o `INACCESIBLE`.
  - **Orden de precedencia unificado:** `REPORTE_CUADRILLA` (peso `2`) > `VERIFICACION_CIERRE` (peso `1`) > evaluación/rectificación inicial (peso `0`).
  - **Panel lateral sin datos demográficos de patrulla:** `IncidenteUltimoReporteSection` e `IncidenteMisionesSection` omiten el conteo de familias/viviendas cuando el reporte corresponde a `REPORTE_CUADRILLA`, priorizando estado del terreno, horas hombre y materiales consumidos.

---

## 3. Modelo de Afectación: Relación 1 a 1 entre Familia y Vivienda

Para evitar la ambigüedad donde se registraba el tamaño de una sola familia pero múltiples viviendas afectadas:
- Cada registro de afectación se compone de un listado de **Hogares / Familias (`familias: FamiliaAfectadaItem[]`)**.
- Cada familia cuenta con:
  - **Identificador y Referencia Opcional:** `Familia #1`, `Familia #2` con campo opcional para apellido o número de casa (ej. `"Familia Pérez"`, `"Casa esquina"`, `"Depto 201"`).
  - **Caracterización de Integrantes:** Total de personas, desglose de niños, adultos mayores, personas con discapacidad, electrodependientes y mascotas.
  - **Vivienda Asociada:** Nivel de compromiso particular de la vivienda que habita dicha familia (*Sin daño habitacional, Daño leve (Habitable), Daño moderado (Parcial), Grave / Inhabitable, Destrucción total*), representado con Chips de variantes semánticas según severidad.
  - **Derivación Social (H39):** La marcación oficial de requerimiento de Ficha Básica de Emergencia (`Requiere Ficha FIBE`) fue trasladada desde el reporte de evaluación de prioridad (H38) al informe de verificación y cierre (`VERIFICACION_CIERRE`, H39).
- **Regla de Visualización:**
  - Cuando se registra **más de 1 familia** o cuando la única familia ingresada cuenta con una **referencia personalizada** (ej. `"Familia González"`), la interfaz despliega las **Tarjetas de Hogar Individuales**.
  - Si se trata de un reporte de 1 familia sin referencia personalizada, la interfaz mantiene la visualización unificada estándar para no añadir complejidad visual innecesaria.
  - La cabecera del reporte incorpora un chip resumen de hogares (ej. `[2 hogares]` o `[1 hogar]`).
- **Totales Consolidados en Sistema:**
  - El sistema suma automáticamente los integrantes de todas las familias para obtener `nucleoFamiliarTotal` / `personasAfectadas`.
  - La cantidad de viviendas afectadas (`viviendasAfectadas`) equivale a la cantidad de familias catastradas.
  - El nivel de compromiso global del incidente adopta el compromiso más grave constatado entre todas las familias.
- **Integración en Panel Lateral de Incidente:**
  - `IncidenteUltimoReporteSection`: Despliega métricas de familias afectadas y lista compacta de hogares evaluados en H38, o los chips de Dictamen y Ficha FIBE cuando corresponde a `VERIFICACION_CIERRE` (H39).
  - `IncidenteMisionesSection`: El resumen demográfico rápido expone el número de hogares y pills por cada familia en H38, o la comparativa de personas afectadas, dictamen y Ficha FIBE en H39.
  - `KanbanBoard`: Los toasts en tiempo real reflejan el número de familias en H38 y el dictamen junto al aviso de Ficha FIBE en H39.

