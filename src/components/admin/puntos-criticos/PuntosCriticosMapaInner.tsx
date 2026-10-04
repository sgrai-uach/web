'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { PuntoCriticoItem, PrioridadPuntoCritico } from '@/types/puntoCritico';

interface PuntosCriticosMapaInnerProps {
  puntos: PuntoCriticoItem[];
  onEliminarPunto?: (punto: PuntoCriticoItem) => void;
  onSeleccionarPunto?: (punto: PuntoCriticoItem) => void;
  puedeEliminar?: boolean;
}

const COLOR_PRIORIDAD: Record<PrioridadPuntoCritico, string> = {
  CRITICA: '#D32F2F',
  ALTA: '#E65100',
  MEDIA: '#B45309',
  BAJA: '#2E7D32',
};

export default function PuntosCriticosMapaInner({
  puntos,
  onEliminarPunto,
  onSeleccionarPunto,
  puedeEliminar = true,
}: PuntosCriticosMapaInnerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Inicialización del mapa (solo una vez)
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [-39.8195, -73.2458], // Centro urbano de Valdivia
        zoom: 13,
        zoomControl: true,
        attributionControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contribuyentes',
      }).addTo(map);

      const markersLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;
      mapInstanceRef.current = map;
    }

    const resizeTimer = setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 200);

    return () => {
      clearTimeout(resizeTimer);
    };
  }, []);

  // Actualización reactiva de marcadores en el mapa cuando la lista cambia
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    // Limpiar marcadores anteriores
    markersLayer.clearLayers();

    // Solo graficar puntos activos o con coordenadas válidas
    const puntosValidos = puntos.filter(
      (p) => typeof p.latitud === 'number' && typeof p.longitud === 'number' && p.activo !== false
    );

    puntosValidos.forEach((punto) => {
      const colorPin = COLOR_PRIORIDAD[punto.prioridad] || '#1B6F7D';

      const customPinSvg = `
        <svg width="32" height="42" viewBox="0 0 34 46" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M17 0C7.61116 0 0 7.61116 0 17C0 29.75 17 46 17 46C17 46 34 29.75 34 17C34 7.61116 26.3888 0 17 0Z" fill="${colorPin}"/>
          <circle cx="17" cy="17" r="7" fill="#FFFFFF"/>
          <circle cx="17" cy="17" r="4" fill="${colorPin}"/>
        </svg>
      `;

      const pinIcon = L.divIcon({
        html: `<div style="display: flex; justify-content: center; align-items: center; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.35));">${customPinSvg}</div>`,
        className: 'custom-leaflet-marker-pc',
        iconSize: [32, 42],
        iconAnchor: [16, 42],
        popupAnchor: [0, -38],
      });

      const marker = L.marker([punto.latitud, punto.longitud], { icon: pinIcon });

      // Construcción del popup con DOM nativo para vincular eventos de forma segura
      const popupDiv = document.createElement('div');
      popupDiv.style.fontFamily = 'var(--font-noto-sans, sans-serif)';
      popupDiv.style.fontSize = '12px';
      popupDiv.style.color = '#2B2B2B';
      popupDiv.style.minWidth = '230px';
      popupDiv.style.padding = '4px 2px';

      popupDiv.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px;">
          <span style="font-family: monospace; font-size: 11px; font-weight: 700; color: #1B6F7D; background-color: #E0F2F1; padding: 2px 6px; border: 1px solid #B2DFDB;">
            ${punto.codigo}
          </span>
          <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: ${colorPin}; padding: 1px 6px; border: 1px solid ${colorPin};">
            ${punto.prioridad}
          </span>
        </div>
        <strong style="color: #14505A; display: block; font-size: 13px; line-height: 1.3; margin-bottom: 4px;">
          ${punto.nombre}
        </strong>
        ${
          punto.tipoRiesgo
            ? `<div style="margin-bottom: 4px; color: #3B3F45; font-size: 11px;"><strong>Riesgo:</strong> ${punto.tipoRiesgo}</div>`
            : ''
        }
        <div style="font-size: 11px; color: #5F676E; margin-bottom: 8px;">
          Delegación: ${punto.delegacion?.nombre || 'Central Comunal'}
        </div>
        <div id="popup-actions-${punto.id}" style="display: flex; gap: 6px; margin-top: 8px; border-top: 1px solid #DFE3E8; padding-top: 8px;">
          <button id="btn-ver-${punto.id}" type="button" style="flex: 1; background: #ECEFF3; border: 1px solid #DFE3E8; padding: 5px 8px; font-size: 11px; font-weight: 600; cursor: pointer; color: #14505A;">
            Ver Ficha
          </button>
          <button id="btn-del-${punto.id}" type="button" style="flex: 1; background: #D32F2F; border: none; padding: 5px 8px; font-size: 11px; font-weight: 600; cursor: ${
            puedeEliminar ? 'pointer' : 'not-allowed'
          }; color: #FFFFFF; opacity: ${puedeEliminar ? '1' : '0.5'};">
            Desactivar
          </button>
        </div>
      `;

      // Vincular eventos a los botones del popup
      const btnVer = popupDiv.querySelector(`#btn-ver-${punto.id}`);
      if (btnVer) {
        btnVer.addEventListener('click', () => {
          marker.closePopup();
          onSeleccionarPunto?.(punto);
        });
      }

      const btnDel = popupDiv.querySelector(`#btn-del-${punto.id}`);
      if (btnDel && puedeEliminar) {
        btnDel.addEventListener('click', () => {
          marker.closePopup();
          onEliminarPunto?.(punto);
        });
      }

      marker.bindPopup(popupDiv);
      markersLayer.addLayer(marker);
    });
  }, [puntos, onEliminarPunto, onSeleccionarPunto, puedeEliminar]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '480px' }}>
      <div
        ref={mapContainerRef}
        style={{
          width: '100%',
          height: '100%',
          minHeight: '480px',
          backgroundColor: '#ECEFF3',
        }}
      />
    </div>
  );
}
