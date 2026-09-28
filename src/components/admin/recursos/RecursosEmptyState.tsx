import React from 'react';
import { PackageOpen, Plus } from 'lucide-react';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/common/EmptyState';

interface RecursosEmptyStateProps {
  esFiltroActivo: boolean;
  onLimpiarFiltros?: () => void;
}

export default function RecursosEmptyState({
  esFiltroActivo,
  onLimpiarFiltros,
}: RecursosEmptyStateProps) {
  return (
    <EmptyState
      icon={<PackageOpen size={28} aria-hidden="true" />}
      title="No hay recursos registrados"
      description={
        esFiltroActivo
          ? 'No se encontraron recursos logísticos que coincidan con los criterios de búsqueda o filtros aplicados.'
          : 'Actualmente no existen recursos ingresados en el inventario logístico municipal para atención de incidentes.'
      }
      action={
        <>
          {esFiltroActivo && onLimpiarFiltros && (
            <Button
              type="button"
              variant="outline"
              onClick={onLimpiarFiltros}
            >
              Limpiar Filtros
            </Button>
          )}

          <Button
            href="/admin/recursos/nuevo"
            variant="primary"
            icon={<Plus size={16} />}
          >
            Registrar Nuevo Recurso
          </Button>
        </>
      }
    />
  );
}
