import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { renderToString } from 'react-dom/server';
import { TruckIcon, UserIconSolid, MapPinIcon } from './icons/FluentIcons';
import { Location } from '../types';

interface MapViewProps {
  pickupLocation?: Location | null;
  dropoffLocation?: Location | null;
}

// Custom hook to recenter map
const ChangeView = ({ center, zoom }: { center: L.LatLngExpression, zoom: number }) => {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

const MapView: React.FC<MapViewProps> = ({ pickupLocation, dropoffLocation }) => {
  const [currentPosition, setCurrentPosition] = useState<L.LatLng | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentPosition(new L.LatLng(latitude, longitude));
        setError(null);
      },
      (err) => {
        setError(`Geolocation error: ${err.message}`);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  const driverIcon = useMemo(() => new L.DivIcon({
    html: renderToString(
        <div className="relative">
            <TruckIcon className="w-8 h-8 text-white bg-driver-primary p-1 rounded-full shadow-lg" />
            <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-driver-primary/20 rounded-full -translate-x-1/2 -translate-y-1/2 animate-ping"></div>
        </div>
    ),
    className: 'bg-transparent border-0',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  }), []);

  const pickupIcon = useMemo(() => new L.DivIcon({
    html: renderToString(<UserIconSolid className="w-8 h-8 text-white bg-status-online p-1 rounded-full shadow-lg" />),
    className: 'bg-transparent border-0',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  }), []);

  const dropoffIcon = useMemo(() => new L.DivIcon({
    html: renderToString(<MapPinIcon className="w-8 h-8 text-white bg-danger p-1 rounded-full shadow-lg" />),
    className: 'bg-transparent border-0',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  }), []);

  const mapCenter: L.LatLngExpression = currentPosition || [0.3476, 32.5825]; // Default to Kampala
  const zoomLevel = currentPosition ? 15 : 12;

  return (
    <div className="w-full h-full relative">
      <MapContainer center={mapCenter} zoom={zoomLevel} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
        <ChangeView center={mapCenter} zoom={zoomLevel} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {currentPosition && (
          <Marker position={currentPosition} icon={driverIcon}>
            <Popup>You are here.</Popup>
          </Marker>
        )}
        {pickupLocation && pickupLocation.lat && pickupLocation.lng && (
            <Marker position={[pickupLocation.lat, pickupLocation.lng]} icon={pickupIcon}>
                <Popup><b>Pickup:</b><br/>{pickupLocation.address}</Popup>
            </Marker>
        )}
        {dropoffLocation && dropoffLocation.lat && dropoffLocation.lng && (
            <Marker position={[dropoffLocation.lat, dropoffLocation.lng]} icon={dropoffIcon}>
                <Popup><b>Drop-off:</b><br/>{dropoffLocation.address}</Popup>
            </Marker>
        )}
      </MapContainer>
      {error && (
          <div className="absolute bottom-2 left-2 right-2 bg-red-100 text-danger text-xs p-2 rounded shadow-lg z-[1000]">
              {error}
          </div>
      )}
    </div>
  );
};

export default MapView;