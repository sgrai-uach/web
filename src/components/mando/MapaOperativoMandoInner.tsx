'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { IncidenteResumen } from '@/services/incidentesService';
import type { EventoPrevencionDTO } from '@/types/evento-prevencion';

interface MapaOperativoMandoInnerProps {
  incidentes?: IncidenteResumen[];
  eventosPrevencion?: EventoPrevencionDTO[];
  onSelectIncidente?: (id: string) => void;
  mostrarIncidentes?: boolean;
  mostrarPrevenciones?: boolean;
}

// SVG de marcador para Incidentes
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

// SVG de marcador exclusivo para Eventos de Prevención (Ámbar táctico con ícono de Escudo / Prevención)
function createPrevencionPinSvg(): string {
  return `
    <svg width="36" height="46" viewBox="0 0 36 46" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 0C8.05888 0 0 8.05888 0 18C0 31.5 18 46 18 46C18 46 36 31.5 36 18C36 8.05888 27.9411 0 18 0Z" fill="#D97706"/>
      <circle cx="18" cy="18" r="10" fill="#FFFFFF"/>
      <path d="M18 11L13 13.5V18C13 21.5 15.2 24.5 18 25.5C20.8 24.5 23 21.5 23 18V13.5L18 11Z" fill="#B45309"/>
    </svg>
  `;
}

export default function MapaOperativoMandoInner({
  incidentes = [],
  eventosPrevencion = [],
  onSelectIncidente,
  mostrarIncidentes = true,
  mostrarPrevenciones = true,
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

  // Actualización de marcadores cuando cambian los datos o capas
  useEffect(() => {
    const layer = markersLayerRef.current;
    if (!layer) return;

    layer.clearLayers();

    // 1. Dibujar incidentes activos
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

    // 2. Dibujar eventos de prevención (HU-30) con ícono distintivo y popup táctico
    if (mostrarPrevenciones) {
      eventosPrevencion.forEach((prev) => {
        if (!prev.latitud || !prev.longitud) return;

        const pinSvg = createPrevencionPinSvg();
        const icon = L.divIcon({
          html: `<div style="display: flex; justify-content: center; align-items: center; filter: drop-shadow(0 2px 6px rgba(217,119,6,0.5)); cursor: pointer;">${pinSvg}</div>`,
          className: 'marcador-prevencion',
          iconSize: [36, 46],
          iconAnchor: [18, 46],
          popupAnchor: [0, -42],
        });

        const recursosList = prev.recursos && prev.recursos.length > 0
          ? prev.recursos
              .map(
                (r) =>
                  `<li style="margin-bottom: 2px;"><strong>${r.nombre}:</strong> ${r.cantidadAsignada} un.</li>`
              )
              .join('')
          : '<li>Equipamiento táctico estándar</li>';

        const popupHtml = `
          <div style="font-family: inherit; font-size: 13px; color: #2B2B2B; min-width: 250px; max-width: 280px; padding: 2px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; border-bottom: 2px solid #D97706; padding-bottom: 4px;">
              <strong style="color: #B45309; font-size: 14px;">${prev.codigo}</strong>
              <span style="background-color: #FEF3C7; color: #92400E; padding: 2px 6px; font-size: 10px; font-weight: 700; border: 1px solid #FCD34D;">
                ${prev.prioridad}
              </span>
            </div>

            <div style="font-weight: 700; color: #14505A; margin-bottom: 4px;">${prev.nombre}</div>
            <div style="font-size: 12px; color: #3B3F45; margin-bottom: 4px;">
              <strong>Sector:</strong> ${prev.sector || 'Valdivia'}
              ${prev.direccionTexto ? `<br><strong>Dirección:</strong> ${prev.direccionTexto}` : ''}
              ${prev.puntoCritico ? `<br><strong style="color: #B45309;">Punto Crítico:</strong> ${prev.puntoCritico.codigo}` : ''}
            </div>

            <div style="background-color: #FFFBEB; border: 1px solid #FDE68A; padding: 6px; margin-bottom: 6px; font-size: 11px;">
              <div style="color: #92400E; font-weight: 700; margin-bottom: 2px;">
                Patrulla Asignada:
              </div>
              <div>${prev.patrulla.nombre} (<strong>${prev.patrulla.estado}</strong>)</div>
              ${prev.mision ? `<div style="margin-top: 2px; color: #555;">Misión: <strong>${prev.mision.codigo}</strong> (${prev.mision.estado})</div>` : ''}
            </div>

            <div style="font-size: 11px; margin-bottom: 4px;">
              <strong>Instrucciones:</strong>
              <p style="margin: 2px 0 0 0; color: #555;">${prev.descripcion}</p>
            </div>

            <div style="font-size: 11px;">
              <strong>Insumos Despachados:</strong>
              <ul style="margin: 4px 0 0 16px; padding: 0;">
                ${recursosList}
              </ul>
            </div>
          </div>
        `;

        const marker = L.marker([prev.latitud, prev.longitud], { icon }).addTo(layer);
        marker.bindPopup(popupHtml);
      });
    }
  }, [incidentes, eventosPrevencion, mostrarIncidentes, mostrarPrevenciones, onSelectIncidente]);

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
      aria-label="Mapa cartográfico táctico de incidentes y eventos de prevención"
    />
  );
}
