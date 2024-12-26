// src/pages/auth/Enter.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Enter.css';

const Enter = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/login', { username, password });
      if (response.data.success) {
        navigate('/profile'); // Navigate to profile page after successful login
      } else {
        setError('Giriş başarısız. Lütfen kullanıcı adı ve şifrenizi kontrol edin.');
      }
    } catch (error) {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
      console.error(error);
    }
  };

  return (
    <div className="enter-container">
      <h2>Giriş Yap</h2>
      <form className="login-form" onSubmit={handleLogin}>
        <div className="input-group">
          <label htmlFor="username">Kullanıcı Adı</label>
          <input
            type="text"
            id="username"
            placeholder="Kullanıcı adınızı girin"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="input-group">
          <label htmlFor="password">Şifre</label>
          <input
            type="password"
            id="password"
            placeholder="Şifrenizi girin"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        <div className="button-group">
          <button type="submit" className="login-btn">Giriş Yap</button>
          <button
            type="button"
            className="register-btn"
            onClick={() => navigate('/register')}
          >
            Yeni Hesap Oluştur
          </button>
        </div>
      </form>
      <div className="password-reset">
        <button
          className="reset-btn"
          onClick={() => navigate('/reset')}
        >
          Şifrenizi mi unuttunuz?
        </button>
      </div>
    </div>
  );
};

export default Enter;
