'use client';

import React from 'react';
import Heading from '@/components/ui/Heading';
import styles from '@/styles/mando.module.css';

export interface RecursoDesplegadoItem {
  recursoId: string;
  nombre: string;
  cantidadAsignadaTotal?: number;
  cantidadAsignada?: number;
  esIndividual?: boolean;
  cuadrillaNombre?: string | null;
  unidadNombre?: string | null;
}

interface IncidenteRecursosSectionProps {
  recursos: RecursoDesplegadoItem[];
  titulo?: string;
  mensajeVacio?: string;
  columnaUnidad?: string;
}

export const IncidenteRecursosSection: React.FC<IncidenteRecursosSectionProps> = ({
  recursos,
  titulo = 'Recursos Logísticos Desplegados',
  mensajeVacio = 'No hay vehículos, maquinaria ni insumos asignados a través de cuadrillas.',
  columnaUnidad = 'Cuadrilla',
}) => {
  return (
    <div className={styles.drawerSection}>
      <Heading as="h3" variant="h4" color="teal" style={{ marginBottom: '0.75rem' }}>
        {titulo} ({recursos.length})
      </Heading>
      {recursos.length === 0 ? (
        <p style={{ color: 'var(--color-text-muted, #5F676E)', fontSize: '0.85rem', margin: 0 }}>
          {mensajeVacio}
        </p>
      ) : (
        <table className={styles.recursosTable}>
          <thead>
            <tr>
              <th>Recurso</th>
              <th>Cant.</th>
              <th>Tipo</th>
              <th>{columnaUnidad}</th>
            </tr>
          </thead>
          <tbody>
            {recursos.map((rec, i) => (
              <tr key={`${rec.recursoId}-${i}`}>
                <td><strong>{rec.nombre}</strong></td>
                <td>{rec.cantidadAsignadaTotal ?? rec.cantidadAsignada ?? 0}</td>
                <td>{rec.esIndividual ? 'Individual' : 'Granel'}</td>
                <td>{rec.unidadNombre || rec.cuadrillaNombre || 'No especificada'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
