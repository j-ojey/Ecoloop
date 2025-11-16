import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default marker icon issue with Leaflet in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function MapView({ items = [] }) {
  const validItems = items.filter(i => {
    const coords = i.location?.coordinates;
    return Array.isArray(coords) && coords.length === 2;
  });

  // Kenya center coordinates (Nairobi area)
  const kenyaCenter = [-1.286389, 36.817223];

  return (
    <MapContainer 
      center={kenyaCenter} 
      zoom={6} 
      className="w-full h-64 rounded overflow-hidden z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {validItems.map((item, idx) => {
        const [lng, lat] = item.location.coordinates;
        return (
          <Marker key={idx} position={[lat, lng]}>
            <Popup>
              <div className="text-sm">
                <strong>{item.title}</strong>
                <br />
                {item.category}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
