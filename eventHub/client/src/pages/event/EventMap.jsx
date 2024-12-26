import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const EventMap = ({ events }) => {
  return (
    <MapContainer center={[39.92077, 32.85411]} zoom={13} style={{ height: '500px', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      {events.map((event) => (
        <Marker key={event.id} position={[event.latitude, event.longitude]}>
          <Popup>
            <strong>{event.event_name}</strong>
            <p>{event.description}</p>
            <p>{event.date} - {event.time}</p>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default EventMap;
