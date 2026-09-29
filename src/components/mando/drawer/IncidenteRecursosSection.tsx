'use client';

import React from 'react';
import Heading from '@/components/ui/Heading';
import type { IncidenteDetalle } from '@/services/incidentesService';
import styles from '@/styles/mando.module.css';

interface IncidenteRecursosSectionProps {
  recursos: IncidenteDetalle['recursosAsociados'];
}

export const IncidenteRecursosSection: React.FC<IncidenteRecursosSectionProps> = ({ recursos }) => {
  return (
    <div className={styles.drawerSection}>
      <Heading as="h3" variant="h4" color="teal" style={{ marginBottom: '0.75rem' }}>
        Recursos Logísticos Desplegados ({recursos.length})
      </Heading>
      {recursos.length === 0 ? (
        <p style={{ color: 'var(--color-text-muted, #5F676E)', fontSize: '0.85rem', margin: 0 }}>
          No hay vehículos, maquinaria ni insumos asignados a través de cuadrillas.
        </p>
      ) : (
        <table className={styles.recursosTable}>
          <thead>
            <tr>
              <th>Recurso</th>
              <th>Cant.</th>
              <th>Tipo</th>
              <th>Cuadrilla</th>
            </tr>
          </thead>
          <tbody>
            {recursos.map((rec, i) => (
              <tr key={`${rec.recursoId}-${i}`}>
                <td><strong>{rec.nombre}</strong></td>
                <td>{rec.cantidadAsignadaTotal}</td>
                <td>{rec.esIndividual ? 'Individual' : 'Granel'}</td>
                <td>{rec.cuadrillaNombre || 'No especificada'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
