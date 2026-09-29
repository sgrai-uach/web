import type { DivIcon as LeafletDivIcon } from 'leaflet';

export function createValdiviaPinIcon(L: typeof import('leaflet')): LeafletDivIcon {
  return L.divIcon({
    className: 'custom-valdivia-pin',
    html: `
      <div style="
        width: 32px;
        height: 32px;
        background-color: #1B6F7D;
        border: 2px solid #FFFFFF;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      ">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="square" stroke-linejoin="miter">
          <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"/>
          <circle cx="12" cy="10" r="2.5"/>
        </svg>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
}
