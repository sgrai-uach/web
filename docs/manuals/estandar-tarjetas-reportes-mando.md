# Estándar de Diseño: Tarjetas de Reportes de Terreno y Reclasificación en el Centro de Mando

**Repositorio:** `sgrai-web`  
**Módulos:** Centro de Mando (`/mando`), Modal de Detalle de Misión (`MisionDetalleModal.tsx`, `MisionReportesSection.tsx`), Panel Lateral de Incidente (`IncidenteMisionesSection.tsx`, `IncidenteUltimoReporteSection.tsx`).  
**Referencia arquitectónica:** `GEMINI.md` §3 (Flat UI, bordes rectangulares `0px`, paleta institucional de la Municipalidad de Valdivia).

---

## 1. Principios Visuales y Usabilidad

Las tarjetas de reportes de terreno representan la evidencia técnica directa levantada por las patrullas verificadoras y delegados de cuadrilla. Para asegurar una jerarquía clara, orden visual y rápida lectura operativa por el Encargado de Emergencias:

1. **Geometría Rectangular Plana (`0px` border-radius):** En estricto apego al diseño institucional, ninguna tarjeta, chip, botón o contenedor de reporte debe poseer bordes redondeados (`border-radius: 0px`).
2. **Borde Izquierdo Semántico (`border-left: 4px solid ...`):**
   - **Verde Menta (`var(--color-accent-mint, #4FAE9B)`):** Reportes de evaluación de terreno normales / vigentes.
   - **Teal Institucional (`var(--color-primary-teal, #1B6F7D)`):** Informe técnico de reclasificación de tipología en terreno o reporte destacado / seleccionado.
   - **Ámbar / Naranja (`var(--color-warning, #E65100)`):** Reportes donde la patrulla ajustó manualmente la prioridad sugerida por el sistema.
   - **Gris neutro (`#DFE3E8` o `#CBD5E1`):** Reportes de versiones históricas previas.
3. **Cabecera Interactiva Desplegable (`.reporteHeaderTrigger`):**
   - Acción táctil / clic en toda la franja superior para colapsar y expandir.
   - Identificación del autor: Ícono institucional (`User` o `ShieldCheck`), nombre legible del evaluador y su RUT entre paréntesis.
   - Chips de clasificación técnica (`<Chip size="sm" />`):
     - Etiqueta de versión: `Reporte #1 (Inicial)` o `Reporte #N (Rectificación)`.
     - Etiqueta de vigencia: `Vigente` (variante `solid-teal`) o `Histórico` (variante `neutral`).
     - Estado en terreno: `Verificado`, etc.
   - Marca de tiempo con ícono `Clock` y formato legible (`DD mes AAAA, HH:MM`).
   - Flecha de apertura / cierre `ChevronDown` con rotación CSS de 180°.
4. **Comportamiento por Defecto de Apertura / Colapso:**
   - Si existen múltiples reportes, **solo el más reciente (vigente) permanece abierto** al ingresar; los reportes históricos previos permanecen colapsados para priorizar la información actual y evitar saturación cognitiva.
   - Si el usuario hace click en un reporte específico desde el panel lateral, dicho reporte se abre y resalta automáticamente (`reporteDestacadoId`).

---

## 2. Anatomía de la Tarjeta de Reporte (`.reporteCard`)

```
┌──────────────────────────────────────────────────────────────────────────┐
│ [Icono] Nombre Evaluador (RUT)     [Reporte #1] [Vigente] [Hora]   [ v ] │ <-- Cabecera interactiva
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
│ │ Peligros activos y requerimientos: [Riesgo Eléctrico] [Requiere FIBE]│ │
│ └──────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│ Acciones Ejecutadas en el Sitio: "Zanjeo preventivo y corte eléctrico" │
│ Galería de Evidencias (Adjuntos fotográficos y coordenadas GPS)          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Modelo de Afectación: Relación 1 a 1 entre Familia y Vivienda

Para evitar la ambigüedad donde se registraba el tamaño de una sola familia pero múltiples viviendas afectadas:
- Cada registro de afectación se compone de un listado de **Hogares / Familias (`familias: FamiliaAfectadaItem[]`)**.
- Cada familia cuenta con:
  - **Identificador y Referencia Opcional:** `Familia #1`, `Familia #2` con campo opcional para apellido o número de casa (ej. `"Familia Pérez"`, `"Casa esquina"`, `"Depto 201"`).
  - **Caracterización de Integrantes:** Total de personas, desglose de niños, adultos mayores, personas con discapacidad, electrodependientes y mascotas.
  - **Vivienda Asociada:** Nivel de compromiso particular de la vivienda que habita dicha familia (*Sin daño habitacional, Daño leve (Habitable), Daño moderado (Parcial), Grave / Inhabitable, Destrucción total*), representado con Chips de variantes semánticas según severidad.
  - **Derivación Social:** Indicador si este hogar requiere levantamiento de Ficha Básica de Emergencia (`Requiere FIBE`), marcado con chip amarillo institucional.
- **Regla de Visualización:**
  - Cuando se registra **más de 1 familia** o cuando la única familia ingresada cuenta con una **referencia personalizada** (ej. `"Familia González"`), la interfaz despliega las **Tarjetas de Hogar Individuales**.
  - Si se trata de un reporte de 1 familia sin referencia personalizada, la interfaz mantiene la visualización unificada estándar para no añadir complejidad visual innecesaria.
  - La cabecera del reporte incorpora un chip resumen de hogares (ej. `[2 hogares]` o `[1 hogar]`).
- **Totales Consolidados en Sistema:**
  - El sistema suma automáticamente los integrantes de todas las familias para obtener `nucleoFamiliarTotal` / `personasAfectadas`.
  - La cantidad de viviendas afectadas (`viviendasAfectadas`) equivale a la cantidad de familias catastradas.
  - El nivel de compromiso global del incidente adopta el compromiso más grave constatado entre todas las familias.
- **Integración en Panel Lateral de Incidente:**
  - `IncidenteUltimoReporteSection`: Despliega métricas de familias afectadas y lista compacta de hogares evaluados con su severidad.
  - `IncidenteMisionesSection`: El resumen demográfico rápido expone el número de hogares y pills por cada familia.
  - `KanbanBoard`: Los toasts en tiempo real reflejan el número de familias y el aviso de Ficha FIBE.

