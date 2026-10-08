import React, { useEffect, useState } from 'react';
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet';
import { LocateFixed } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

const COTONOU = [6.3703, 2.3912];

function Recenter({ position }) {
  const map = useMap();
  useEffect(() => { map.flyTo(position, 12, { duration: 0.8 }); }, [map, position]);
  return null;
}

export function RealAgrimacMap({ className = '', compact = false, markers = [], emptyMessage = 'Aucune coordonnée GPS réelle disponible.' }) {
  const [position, setPosition] = useState(null);
  const [locating, setLocating] = useState(false);
  const locate = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(({ coords }) => { setPosition([coords.latitude, coords.longitude]); setLocating(false); }, () => setLocating(false), { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 });
  };
  const center = position || markers[0]?.position || COTONOU;
  return <div className={`agrimac-real-map ${compact ? 'is-compact' : ''} ${className}`}><MapContainer center={center} zoom={12} scrollWheelZoom className="agrimac-leaflet-map"><TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />{position && <><Recenter position={position} /><CircleMarker center={position} radius={9} pathOptions={{ color: '#fff', weight: 3, fillColor: '#106e3f', fillOpacity: 1 }}><Popup><b>Ma position</b><br />Position obtenue par votre navigateur.</Popup></CircleMarker></>}{markers.map(marker => <CircleMarker key={marker.id || `${marker.position[0]}-${marker.position[1]}`} center={marker.position} radius={10} pathOptions={{ color: '#fff', weight: 3, fillColor: '#0b7944', fillOpacity: .95 }}><Popup><strong>{marker.title || marker.label || 'Résultat AGRIMAC'}</strong>{marker.detail && <><br />{marker.detail}</>}</Popup></CircleMarker>)}</MapContainer><button className="agrimac-map-locate" onClick={locate} disabled={locating} aria-label="Centrer sur ma position"><LocateFixed size={15} /> {locating ? 'Localisation…' : 'Ma position'}</button><div className="agrimac-map-badge"><b>{markers.length ? `${markers.length} résultat(s) géolocalisé(s)` : 'Aucun résultat géolocalisé'}</b><small>{markers.length ? 'Coordonnées issues des données AGRIMAC.' : emptyMessage}</small></div></div>;
}
