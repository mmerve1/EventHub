import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState("");  
  const [password, setPassword] = useState("");
  const [loginType, setLoginType] = useState("user"); 
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loginType === "admin") {
      if (password === "admin") {
        navigate("/admin");
        return;
      } else {
        setError("Invalid admin credentials");
        return;
      }
    }

    // Standard user login
    try {
      const response = await axios.post("http://localhost:5000/api/login", {
        username,
        password,
      });
      const { token, user } = response.data;
      localStorage.setItem("token", token);  // Token'ı sakla
      localStorage.setItem("user", JSON.stringify(user));  // Kullanıcı bilgisini sakla
      navigate(`/profile/${user.username}`);  // Kullanıcıyı profil sayfasına yönlendir
    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Please try again.");
    }
  };

  return (
    <div className="bodylogin">
    <div className="login-container">
  <h2 className="login-title">Giriş Yap</h2>
  <form className="login-form" onSubmit={handleSubmit}>
    <label>Giriş Türü</label>
    <select
      value={loginType}
      onChange={(e) => setLoginType(e.target.value)}
      className="login-type-dropdown"
    >
      <option value="admin">Admin Girişi</option>
      <option value="user">Kullanıcı Girişi</option>
    </select>

    {loginType === "user" && (
      <>
        <label>Kullanıcı Adı</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          placeholder="Kullanıcı adınızı girin"
        />
        <label>Şifre</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="Şifrenizi girin"
        />
      </>
    )}

    {loginType === "admin" && (
      <>
        <label>Admin Şifresi</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="Admin şifresini girin"
        />
      </>
    )}

    <button type="submit" className="login-button">
      Giriş Yap
    </button>

    {error && <p className="error-message2">{error}</p>}

    <div className="register-section">
      <p>Hesabınız yok mu? </p>
      <p className="register-link" onClick={() => navigate("/register")}>
        Hesap Oluştur
      </p>
    </div>

    <div className="register-section">
      <p>Şifrenizi mi unuttunuz? </p>
      <p className="register-link" onClick={() => navigate("/reset")}>
        Şifreyi Sıfırla
      </p>
    </div>
  </form>
  <footer>© 2024 Etkinlik Planlama</footer>
</div>
</div>
  );
};

export default Login;
