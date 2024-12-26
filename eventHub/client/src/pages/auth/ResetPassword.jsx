import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ResetPassword.css';

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handlePasswordReset = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError('Şifreler uyuşmuyor.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/reset', { email, newPassword });
      if (response.data.success) {
        setMessage('Şifreniz başarıyla sıfırlandı.');
        setError('');
        setShowModal(true);  // Show modal on success
        setTimeout(() => {
          setShowModal(false);
          navigate('/login');  // Redirect to login after modal closes
        }, 2000);
      } else {
        setError('Bir hata oluştu. Lütfen tekrar deneyin.');
      }
    } catch (error) {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
      console.error(error);
    }
  };

  return (
    <div className="reset-password-container">
      <h2>Şifrenizi Sıfırlayın</h2>
      <form className="reset-password-form" onSubmit={handlePasswordReset}>
        <div className="input-group">
          <label htmlFor="email">E-posta Adresi</label>
          <input
            type="email"
            id="email"
            placeholder="E-posta adresinizi girin"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="input-group">
          <label htmlFor="newPassword">Yeni Şifre</label>
          <input
            type="password"
            id="newPassword"
            placeholder="Yeni şifrenizi girin"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <div className="input-group">
          <label htmlFor="confirmPassword">Yeni Şifreyi Tekrar Girin</label>
          <input
            type="password"
            id="confirmPassword"
            placeholder="Yeni şifrenizi tekrar girin"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        {message && <p className="success-message">{message}</p>}
        <button type="submit" className="reset-btn">Şifreyi Sıfırla</button>
      </form>
      <div className="back-to-login">
        <button
          className="back-btn"
          onClick={() => navigate('/login')}
        >
          Geri Dön
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Şifre Sıfırlandı</h3>
            <p>Yeni şifrenizle giriş yapabilirsiniz.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResetPassword;
