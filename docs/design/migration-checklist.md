# Checklist de Migración — Design System SGRAI

Este checklist registra el estado de adopción de los componentes base (`<Heading />`, `<Button />`) y tokens de diseño en todas las vistas y componentes del frontend.

---

## 1. Tokens y Base Global
- [x] Tipografía institucional **Noto Sans** configurada en `layout.tsx` mediante `next/font/google` (`--font-noto-sans`).
- [x] Paleta institucional de Valdivia completa en `tokens.css`.
- [x] Estados semánticos (`danger`, `success`, `warning`, `info`) en `tokens.css`.
- [x] Escala tipográfica unificada (`--font-size-xs` a `--font-size-3xl`) en `tokens.css`.
- [x] Escala de espaciado modular (`--space-1` a `--space-16`) en `tokens.css`.
- [x] Escala de elevaciones y sombras planas (`--shadow-none`, `--shadow-sm`, `--shadow-md`) en `tokens.css`.
- [x] Escala unificada de Z-Index (`--z-base` a `--z-toast`) en `tokens.css`.
- [x] Regla universal de accesibilidad de foco visible (`:focus-visible`) en `globals.css`.

---

## 2. Componentes Base Reutilizables
- [x] `<Heading />` implementado en `src/components/ui/Heading.tsx` y `Heading.module.css`.
- [x] `<Button />` implementado en `src/components/ui/Button.tsx` y `Button.module.css` (con soporte polimórfico Next `<Link>`).
- [x] Límite estricto de `< 150 líneas` verificado en todos los componentes base.

---

## 3. Estado de Migración por Vistas y Módulos

### 3.1 Portal Principal y Layouts
- [x] `src/app/page.tsx`: Encabezados `display` y `h2` migrados a `<Heading />`.
- [x] `src/components/home/HomeModuleCard.tsx`: Títulos migrados a `<Heading />` y enlaces de acción a `<Button />`.
- [x] `src/app/(admin)/layout.tsx`: Enlaces de navegación administrativa migrados a `<Button variant="teal" | "secondary" />`.
- [x] `src/app/(admin)/recursos/nuevo/page.tsx`: Título de página migrado a `<Heading as="h1" variant="h1" />`.

### 3.2 Módulo de Recursos e Inventario (HU-6 y HU-7)
- [x] `RecursosHeader.tsx`: Título de vista migrado a `<Heading />` y acción nueva a `<Button />`.
- [x] `RecursoFormActions.tsx`: Botones Cancelar y Guardar migrados a `<Button />` con soporte de loading.
- [x] `RecursosFiltros.tsx`: Botón "Limpiar todos los filtros" migrado a `<Button variant="ghost" />`.
- [x] `SuccessActions.tsx`: Título migrado a `<Heading />`, botón secundario migrado a `<Button />`.
- [x] `RecursosEmptyState.tsx`: Título migrado a `<Heading />` y botones de acción a `<Button />`.
- [x] `AccesoDenegadoState.tsx`: Encabezados migrados a `<Heading />` y CTAs a `<Button />`.
- [x] `RecursoRow.tsx`: Botón "Ver Ficha" migrado a `<Button variant="outline" size="sm" />`.
- [x] `RecursoConfirmModal.tsx`: Acciones de confirmación migradas a `<Button />`.
- [x] `RecursoDatosBasicosSection.tsx`: Título de sección migrado a `<Heading />`.
- [x] `RecursoInventarioSection.tsx`: Título de sección migrado a `<Heading />`.
- [x] `RecursoEspecificacionesSection.tsx`: Título de sección migrado a `<Heading />`.
- [x] `RecursoUbicacionSection.tsx`: Título de sección migrado a `<Heading />` y botón "Centrar" a `<Button />`.
- [x] `RecursoDetalleResumen.tsx`: Título de recurso migrado a `<Heading />`.
- [x] `RecursoDetalleSpecs.tsx`: Título de especificaciones migrado a `<Heading />`.
- [x] `RecursoDetalleUbicacion.tsx`: Título de base operativa migrado a `<Heading />`.

### 3.3 Módulo de Roles y Permisos (HU-4)
- [x] `RolesHeader.tsx`: Título principal migrado a `<Heading as="h1" variant="h1" />`.
- [x] `RolesFiltros.tsx`: Botón Refrescar con spinner migrado a `<Button variant="outline" />`.
- [x] `RolCard.tsx`: Título de rol migrado a `<Heading />` y botón "Ver Permisos" a `<Button />`.
- [x] `RolesGrid.tsx`: Estado vacío migrado a `<Heading />` y `<Button />`.
- [x] `AccesoDenegadoState.tsx`: Encabezado y botones migrados a `<Heading />` y `<Button />`.
- [x] `drawer/RolDetalleHeader.tsx`: Título migrado a `<Heading />` y botón cerrar a `<Button variant="ghost" />`.
- [x] `drawer/RolDetalleFooter.tsx`: Acciones del pie de drawer migradas a `<Button />`.
- [x] `drawer/PermisoModuloSection.tsx`: Encabezado de módulo migrado a `<Heading />`.

### 3.4 Módulo Call Center (HU-52)
- [x] `AvisosFiltros.tsx`: Botón Refrescar migrado a `<Button variant="secondary" />`.
- [x] `table/AvisosTableRow.tsx`: Botón "Revisar Aviso" migrado a `<Button variant="primary" size="sm" />`.
- [x] `modal/AvisoDetalleHeader.tsx`: Título de aviso migrado a `<Heading />` y botón cerrar a `<Button variant="ghost" />`.
- [x] `modal/AvisoDetalleVerificacionForm.tsx`: Botones de verificar y descartar migrados a `<Button />`.
- [x] `modal/AvisoDetalleDescarteForm.tsx`: Botones de confirmar descarte y cancelar migrados a `<Button />`.

### 3.5 Componentes Transversales
- [x] `Modal.tsx`: Título de modal migrado a `<Heading />` y botón de cierre a `<Button variant="ghost" />`.
- [x] `NotificationBanner.tsx`: Botón de cierre migrado a `<Button variant="ghost" />`.
- [x] `ToastItem.tsx`: Botón de cierre migrado a `<Button variant="ghost" />`.

---

## 4. Pendientes para Siguientes Iteraciones
- [ ] Formularios complejos: Estandarizar inputs de texto, selects y textareas con un componente `<Input />` atómico compartido cuando se aborden las HU de edición.
- [ ] Tablas de datos: Crear `<Table />` atómico si futuros módulos requieren ordenamiento por columnas dinámico.
