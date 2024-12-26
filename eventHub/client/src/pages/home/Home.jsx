import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Home.css';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [alternativeEvents, setAlternativeEvents] = useState([]); // Alternatif etkinlikler
  const navigate = useNavigate();
  const currentUser = { id: 1 }; // Örnek kullanıcı ID'si, gerçek uygulamada dinamik olmalı

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/events');
        setEvents(response.data); // Gelen veriyi state'e set et
      } catch (error) {
        console.error('Etkinlikler alınırken hata oluştu:', error);
      }
    };
    fetchEvents();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Bu etkinliği silmek istediğinize emin misiniz?')) {
      try {
        await axios.delete(`http://localhost:5000/api/events/${id}`);
        alert('Etkinlik başarıyla silindi.');
        setEvents(events.filter(event => event.id !== id)); // Silinen etkinliği frontend'den kaldır
      } catch (error) {
        console.error('Etkinlik silinirken hata oluştu:', error);
        alert('Etkinlik silinirken bir hata oluştu.');
      }
    }
  };

  const handleJoinEvent = async (eventId) => {
    try {
      const response = await axios.post('http://localhost:5000/api/check-conflict', {
        user_ID: currentUser.id,
        event_ID: eventId,
      });

      if (response.data.conflict) {
        alert(`Zaman çakışması tespit edildi: ${response.data.message}`);
        const conflictingEvent = response.data.conflictingEvent;

        // Alternatif etkinlikleri belirle
        const filteredEvents = events.filter(event => {
          const eventStart = new Date(`${event.date}T${event.time}`);
          const eventEnd = new Date(eventStart.getTime() + event.duration * 60000);

          const conflictingStart = new Date(`${conflictingEvent.date}T${conflictingEvent.time}`);
          const conflictingEnd = new Date(conflictingStart.getTime() + conflictingEvent.duration * 60000);

          // Alternatif etkinliklerin çakışmaması kontrol edilir
          return (
            (eventEnd <= conflictingStart || eventStart >= conflictingEnd) &&
            event.id !== eventId // Aynı etkinlik eklenmez
          );
        });

        setAlternativeEvents(filteredEvents); // Alternatif etkinlikleri kaydet
      } else {
        alert(response.data.message);
        // Katılımı kaydetmek için API çağrısı
        await axios.post('http://localhost:5000/api/join-event', {
          user_ID: currentUser.id,
          event_ID: eventId,
        });
      }
    } catch (error) {
      console.error('Katılım işlemi sırasında hata:', error);
      alert('Katılım işlemi sırasında bir hata oluştu.');
    }
  };

  return (

    
    <div className="home-container">
      <button className="home-button" onClick={() => navigate('/login')}>GİRİŞ YAP</button>
      <h1>Önerilen Etkinlikler</h1>
      <div className="events-list">
        {events.length > 0 ? (
          events.map(event => (
            <div key={event.id} className="event-card">
              <h3>{event.event_name}</h3>
              <p>{event.date}</p>
              <p>{event.location}</p>
              <button
                className="details-btn"
                onClick={() => navigate(`/event/${event.id}`)}
              >
                Detaylar
              </button>
              <button
                className="join-btn"
                onClick={() => handleJoinEvent(event.id)}
              >
                Katıl
              </button>
              <button
                className="delete-button"
                onClick={() => handleDelete(event.id)}
              >
                Sil
              </button>
            </div>
          ))
        ) : (
          <p>Etkinlikler yükleniyor...</p>
        )}
      </div>
      <div className="create-event">
        <button className="create-btn" onClick={() => navigate('/create-event')}>
          Yeni Etkinlik Oluştur
        </button>
      </div>

      {/* Alternatif Etkinlikler Bölümü */}
      {alternativeEvents.length > 0 && (
        <div className="alternative-events">
          <h2>Alternatif Etkinlikler</h2>
          <div className="events-list">
            {alternativeEvents.map(event => (
              <div key={event.id} className="event-card">
                <h3>{event.event_name}</h3>
                <p>{event.date}</p>
                <p>{event.location}</p>
                <button
                  className="details-btn"
                  onClick={() => navigate(`/event/${event.id}`)}
                >
                  Detaylar
                </button>
                <button
                  className="join-btn"
                  onClick={() => handleJoinEvent(event.id)}
                >
                  Katıl
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;