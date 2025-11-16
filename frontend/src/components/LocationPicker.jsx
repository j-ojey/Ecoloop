import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default marker icon issue with Leaflet in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position} />
  );
}

export default function LocationPicker({ onLocationSelect, initialPosition = null }) {
  const [position, setPosition] = useState(initialPosition);

  const handlePositionChange = (newPosition) => {
    setPosition(newPosition);
    if (onLocationSelect) {
      onLocationSelect({
        latitude: newPosition.lat,
        longitude: newPosition.lng
      });
    }
  };

  // Kenya center coordinates: Nairobi area
  const kenyaCenter = [-1.286389, 36.817223];

  return (
    <div className="space-y-2">
      <div className="border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
        <MapContainer 
          center={kenyaCenter} 
          zoom={6} 
          className="w-full h-80 z-0"
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} setPosition={handlePositionChange} />
        </MapContainer>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        📍 Click anywhere on the map to select your location
      </p>
      {position && (
        <div className="text-xs text-green-600 dark:text-green-400 font-medium">
          ✓ Location selected: {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
        </div>
      )}
    </div>
  );
}
