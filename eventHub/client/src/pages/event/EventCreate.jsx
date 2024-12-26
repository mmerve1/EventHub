import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // useNavigate import edildi
import './EventCreate.css';

const EventCreate = () => {
  const [event_name, setEventName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const categories = ["Sanat", "Teknoloji", "Spor", "Sağlık"]; // Kategoriler

  const navigate = useNavigate(); // navigate işlevini başlat

  const handleCreateEvent = async (e) => {
    e.preventDefault();

    const durationFormatted = duration ? `${duration} hours` : '0 hours';

    if (!event_name || !date || !time || !location || !category) {
      setError('Etkinlik adı, tarih, saat, konum ve kategori alanları zorunludur.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/events', {
        event_name,
        description,
        date,
        time,
        duration: durationFormatted,
        location,
        category,
      });

      console.log('Etkinlik oluşturuldu:', response.data);
      setSuccessMessage('Etkinlik başarıyla oluşturuldu!');
      setError(null);

      // Etkinlik detay sayfasına yönlendirme
      navigate(`/event/${response.data.event.id}`);

      // Formu temizle
      setEventName('');
      setDescription('');
      setDate('');
      setTime('');
      setDuration('');
      setLocation('');
      setCategory('');
    } catch (error) {
      console.error('Etkinlik oluşturulurken bir hata oluştu:', error);
      setError('Etkinlik oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
      setSuccessMessage('');
    }
  };

  return (
   
    <div className='createbody'>
      <button className="home-button" onClick={() => navigate('/home')}>ANA SAYFA</button>
    <div className="event-create-container">
    
      <h2>Yeni Etkinlik Oluştur</h2>
      {error && <p className="error-message">{error}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}

      <form onSubmit={handleCreateEvent}>
        <input
          type="text"
          placeholder="Etkinlik Adı"
          value={event_name}
          onChange={(e) => setEventName(e.target.value)}
          required
        />
        <textarea
          placeholder="Etkinlik Açıklaması"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          required
        />
        <input
          type="number"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          placeholder="Süresi (saat cinsinden)"
        />
        <input
          type="text"
          placeholder="Etkinlik Konumu"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        />
        <label>Kategori</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        >
          <option value="" disabled>
            Kategori Seç
          </option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <button type="submit">Etkinlik Oluştur</button>
      </form>
    </div>
    </div>
  );
};

export default EventCreate;
