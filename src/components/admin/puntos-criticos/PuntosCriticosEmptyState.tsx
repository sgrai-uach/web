import React from 'react';
import { MapPinOff } from 'lucide-react';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/common/EmptyState';

interface PuntosCriticosEmptyStateProps {
  esFiltroActivo: boolean;
  onLimpiarFiltros?: () => void;
}

export default function PuntosCriticosEmptyState({
  esFiltroActivo,
  onLimpiarFiltros,
}: PuntosCriticosEmptyStateProps) {
  return (
    <EmptyState
      icon={<MapPinOff size={28} aria-hidden="true" />}
      title="No hay puntos críticos registrados"
      description={
        esFiltroActivo
          ? 'No se encontraron puntos críticos que coincidan con los criterios de búsqueda o filtros aplicados.'
          : 'Actualmente no existen puntos críticos o sectores vulnerables registrados en el catastro comunal.'
      }
      action={
        esFiltroActivo && onLimpiarFiltros ? (
          <Button
            type="button"
            variant="outline"
            onClick={onLimpiarFiltros}
          >
            Limpiar Filtros
          </Button>
        ) : undefined
      }
    />
  );
}
