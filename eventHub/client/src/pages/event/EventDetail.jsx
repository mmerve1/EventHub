import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet-routing-machine'; // Routing machine plugin
import './EventDetail.css';
import EventChat from './EventChat';

const EventDetail = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [coordinates, setCoordinates] = useState(null);
  const [error, setError] = useState(null);
  const [activeMode, setActiveMode] = useState('car'); // Başlangıçta araba
  const navigate = useNavigate();
  const mapRef = useRef(null); // Harita referansı
  const routeControl = useRef(null); // Rota kontrolü

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/events/${id}`);
        const fetchedEvent = response.data;

        // Süreyi formatla
        if (fetchedEvent.duration && typeof fetchedEvent.duration === 'object') {
          const { hours = 0, minutes = 0 } = fetchedEvent.duration;
          fetchedEvent.duration = `${hours} saat ${minutes} dakika`;
        }

        setEvent(fetchedEvent);

        // Adresi koordinatlara dönüştür
        if (fetchedEvent.location) {
          const geocodeResponse = await axios.get(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fetchedEvent.location)}`
          );

          if (geocodeResponse.data && geocodeResponse.data.length > 0) {
            const { lat, lon } = geocodeResponse.data[0];
            setCoordinates([parseFloat(lat), parseFloat(lon)]);
          } else {
            console.warn('Geocoding sonuçları bulunamadı.');
          }
        }
      } catch (error) {
        console.error('Etkinlik çekilirken hata oluştu:', error);
        setError('Etkinlik bilgileri alınırken bir hata oluştu.');
      }
    };

    fetchEvent();
  }, [id]);

  useEffect(() => {
    if (coordinates && !mapRef.current) {
      // Haritayı yalnızca bir kez başlat
      mapRef.current = L.map('map').setView(coordinates, 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(mapRef.current);

      const marker = L.marker(coordinates).addTo(mapRef.current);
      marker
        .bindPopup(`
          <b>${event.event_name}</b><br />
          Date: ${event.date}<br />
          Time: ${event.time}<br />
          Description: ${event.description}
        `)
        .openPopup();

      mapRef.current.zoomControl.setPosition('topright');
    }
  }, [coordinates, event]);

  useEffect(() => {
    if (coordinates && event && mapRef.current) {
      // Kullanıcı konumunu al ve rota oluştur
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          const userLatLng = [position.coords.latitude, position.coords.longitude];

          // Daha önce eklenmiş rotayı temizle
          if (routeControl.current) {
            mapRef.current.removeLayer(routeControl.current);
          }

          // Seçilen ulaşım moduna göre rota hesapla
          routeControl.current = L.Routing.control({
            waypoints: [
              L.latLng(userLatLng), // Kullanıcı konumu
              L.latLng(coordinates), // Etkinlik konumu
            ],
            routeWhileDragging: true,
            router: L.Routing.osrmv1({
              profile: activeMode, // Kullanıcı seçilen taşıma moduna göre rota oluşturulacak
            }),
            createMarker: () => null, // Marker'ı devre dışı bırak
          }).addTo(mapRef.current);
        });
      }
    }
  }, [coordinates, event, activeMode]); // Rota her değiştiğinde yeniden oluşturulacak

  const handleModeChange = (mode) => {
    setActiveMode(mode); // Modu değiştir
  };

  const handleDeleteEvent = async () => {
    if (window.confirm('Bu etkinliği silmek istediğinizden emin misiniz?')) {
      try {
        await axios.delete(`http://localhost:5000/api/events/${id}`);
        alert('Etkinlik başarıyla silindi!');
        navigate('/home');
      } catch (error) {
        console.error('Etkinlik silinirken hata oluştu:', error);
        alert('Etkinlik silinirken bir hata oluştu.');
      }
    }
  };

  if (error) return <p>{error}</p>;
  if (!event) return <p>Loading...</p>;

  return (
    <div className="event-detail-container">
      <button className="back-button" onClick={() => navigate(-1)}>Back</button>
      <h1 className="event-title">{event.event_name}</h1>
      <div className="event-info">
        <span className="event-info-label">Description:</span>
        <span className="event-info-value">{event.description}</span>
      </div>
      <div className="event-info">
        <span className="event-info-label">Date: </span>
        <span className="event-info-value">
          {new Date(event.date).toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </span>
      </div>
      <div className="event-info">
        <span className="event-info-label">Time:</span>
        <span className="event-info-value"> {event.time}</span>
      </div>
      <div className="event-info">
        <span className="event-info-label">Duration:</span>
        <span className="event-info-value"> {event.duration || 'Not specified'}</span>
      </div>
      <div className="event-info">
        <span className="event-info-label">Location:</span>
        <span className="event-info-value"> {event.location}</span>
      </div>

      {/* Ulaşım Modu Seçici */}
      <div className="transport-mode-selector">
        <label htmlFor="transportMode">Transportation Mode:</label>
        <div>
          {['car', 'bike', 'foot'].map((mode) => (
            <button
              key={mode}
              className={`mode-button ${activeMode === mode ? 'active' : ''}`}
              onClick={() => handleModeChange(mode)}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div id="map" style={{ height: '400px', width: '100%' }}></div>

      <EventChat eventId={id} />
      <button onClick={handleDeleteEvent} className="delete-event-button">
        Delete Event
      </button>
    </div>
  );
};

export default EventDetail;
