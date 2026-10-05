'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { IncidenteResumen } from '@/services/incidentesService';
import type { EventoRecuperacionResponse } from '@/types/recuperacion';

interface MapaOperativoMandoInnerProps {
  incidentes?: IncidenteResumen[];
  eventosRecuperacion?: EventoRecuperacionResponse[];
  onSelectIncidente?: (id: string) => void;
  mostrarIncidentes?: boolean;
  mostrarRecuperaciones?: boolean;
}

// SVG de marcador para Incidentes (Teal Institucional / Naranja según prioridad)
function createIncidentePinSvg(prioridad: string): string {
  const color =
    prioridad === 'CRITICA'
      ? '#D32F2F'
      : prioridad === 'ALTA'
      ? '#E65100'
      : prioridad === 'MEDIA'
      ? '#1B6F7D'
      : '#5F676E';

  return `
    <svg width="32" height="42" viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 0C7.16344 0 0 7.16344 0 16C0 28 16 42 16 42C16 42 32 28 32 16C32 7.16344 24.8366 0 16 0Z" fill="${color}"/>
      <circle cx="16" cy="16" r="6" fill="#FFFFFF"/>
      <circle cx="16" cy="16" r="3" fill="${color}"/>
    </svg>
  `;
}

// SVG de marcador exclusivo para Eventos de Recuperación (Verde Esmeralda con ícono distintivo)
function createRecuperacionPinSvg(): string {
  return `
    <svg width="36" height="46" viewBox="0 0 36 46" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 0C8.05888 0 0 8.05888 0 18C0 31.5 18 46 18 46C18 46 36 31.5 36 18C36 8.05888 27.9411 0 18 0Z" fill="#0D9488"/>
      <circle cx="18" cy="18" r="10" fill="#FFFFFF"/>
      <path d="M13 15H23V21H13V15ZM11 21H25V24H11V21ZM14 13H22V15H14V13Z" fill="#0F766E"/>
    </svg>
  `;
}

export default function MapaOperativoMandoInner({
  incidentes = [],
  eventosRecuperacion = [],
  onSelectIncidente,
  mostrarIncidentes = true,
  mostrarRecuperaciones = true,
}: MapaOperativoMandoInnerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Inicialización del mapa de Valdivia
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [-39.8142, -73.2459],
      zoom: 13,
      zoomControl: true,
      attributionControl: true,
    });
    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
    }).addTo(map);

    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;

    const resizeTimeout = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      clearTimeout(resizeTimeout);
      map.remove();
      mapInstanceRef.current = null;
      markersLayerRef.current = null;
    };
  }, []);

  // Actualización de marcadores cuando cambian los datos o filtros
  useEffect(() => {
    const layer = markersLayerRef.current;
    if (!layer) return;

    layer.clearLayers();

    // 1. Dibujar incidentes tácticos
    if (mostrarIncidentes) {
      incidentes.forEach((inc) => {
        if (!inc.latitud || !inc.longitud) return;

        const pinSvg = createIncidentePinSvg(inc.prioridad);
        const icon = L.divIcon({
          html: `<div style="display: flex; justify-content: center; align-items: center; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3)); cursor: pointer;">${pinSvg}</div>`,
          className: 'marcador-incidente',
          iconSize: [32, 42],
          iconAnchor: [16, 42],
          popupAnchor: [0, -38],
        });

        const popupHtml = `
          <div style="font-family: inherit; font-size: 13px; color: #2B2B2B; min-width: 200px; padding: 2px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <strong style="color: #14505A; font-size: 14px;">${inc.codigo}</strong>
              <span style="background-color: #ECEFF3; padding: 2px 6px; font-size: 10px; font-weight: 700; border: 1px solid #DFE3E8;">
                ${inc.prioridad}
              </span>
            </div>
            <div style="font-weight: 600; margin-bottom: 4px; color: #1B6F7D;">${inc.tipoAfectacion}</div>
            <div style="font-size: 12px; margin-bottom: 6px; color: #555;">${inc.direccion}</div>
            <div style="font-size: 11px; color: #666; margin-bottom: 8px;">Estado: <strong>${inc.estado}</strong></div>
            <button
              id="btn-ver-incidente-${inc.id}"
              style="width: 100%; background-color: #1B6F7D; color: #FFFFFF; border: none; padding: 5px 8px; font-size: 12px; font-weight: 600; cursor: pointer; text-align: center;"
            >
              Ver Detalle del Incidente
            </button>
          </div>
        `;

        const marker = L.marker([inc.latitud, inc.longitud], { icon }).addTo(layer);
        marker.bindPopup(popupHtml);

        marker.on('popupopen', () => {
          const btn = document.getElementById(`btn-ver-incidente-${inc.id}`);
          if (btn) {
            btn.onclick = () => {
              if (onSelectIncidente) {
                onSelectIncidente(inc.id);
              }
            };
          }
        });
      });
    }

    // 2. Dibujar eventos de recuperación (HU-29) con ícono y popup completo
    if (mostrarRecuperaciones) {
      eventosRecuperacion.forEach((rec) => {
        if (!rec.latitud || !rec.longitud) return;

        const pinSvg = createRecuperacionPinSvg();
        const icon = L.divIcon({
          html: `<div style="display: flex; justify-content: center; align-items: center; filter: drop-shadow(0 2px 6px rgba(13,148,136,0.5)); cursor: pointer;">${pinSvg}</div>`,
          className: 'marcador-recuperacion',
          iconSize: [36, 46],
          iconAnchor: [18, 46],
          popupAnchor: [0, -42],
        });

        const recursosList = rec.recursos && rec.recursos.length > 0
          ? rec.recursos
              .map(
                (r) =>
                  `<li style="margin-bottom: 2px;"><strong>${r.nombre}:</strong> ${r.cantidadAsignada} un.</li>`
              )
              .join('')
          : '<li>Sin recursos registrados</li>';

        const popupHtml = `
          <div style="font-family: inherit; font-size: 13px; color: #2B2B2B; min-width: 250px; max-width: 280px; padding: 2px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; border-bottom: 2px solid #0D9488; padding-bottom: 4px;">
              <strong style="color: #0F766E; font-size: 14px;">${rec.codigo}</strong>
              <span style="background-color: #CCFBF1; color: #0F766E; padding: 2px 6px; font-size: 10px; font-weight: 700; border: 1px solid #99F6E4;">
                ${rec.prioridad}
              </span>
            </div>

            <div style="font-weight: 700; color: #14505A; margin-bottom: 4px;">${rec.nombre}</div>
            <div style="font-size: 12px; color: #3B3F45; margin-bottom: 4px;">
              <strong>Sector:</strong> ${rec.sector}
              ${rec.direccionTexto ? `<br><strong>Dirección:</strong> ${rec.direccionTexto}` : ''}
            </div>

            <div style="background-color: #F0FDF4; border: 1px solid #BBF7D0; padding: 6px; margin-bottom: 6px; font-size: 11px;">
              <div style="color: #166534; font-weight: 700; margin-bottom: 2px;">
                Patrulla Asignada:
              </div>
              <div>${rec.patrulla.nombre} (${rec.patrulla.estado})</div>
              ${rec.mision ? `<div style="margin-top: 2px; color: #555;">Misión: <strong>${rec.mision.codigo}</strong> (${rec.mision.estado})</div>` : ''}
            </div>

            <div style="font-size: 11px; margin-bottom: 6px;">
              <strong>Familias Beneficiadas:</strong> ${rec.familiasAfectadas}
            </div>

            <div style="font-size: 11px;">
              <strong>Insumos Despachados:</strong>
              <ul style="margin: 4px 0 0 16px; padding: 0;">
                ${recursosList}
              </ul>
            </div>
          </div>
        `;

        const marker = L.marker([rec.latitud, rec.longitud], { icon }).addTo(layer);
        marker.bindPopup(popupHtml);
      });
    }
  }, [incidentes, eventosRecuperacion, mostrarIncidentes, mostrarRecuperaciones, onSelectIncidente]);

  return (
    <div
      ref={mapContainerRef}
      style={{
        width: '100%',
        height: '100%',
        minHeight: '480px',
        backgroundColor: '#ECEFF3',
        zIndex: 1,
      }}
      aria-label="Mapa cartográfico táctico de incidentes y eventos de recuperación"
    />
  );
}
