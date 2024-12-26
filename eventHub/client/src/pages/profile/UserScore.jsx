import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserScore = ({ userId }) => {
 const [score, setScore] = useState(20);  // Başlangıç değeri null

  useEffect(() => {
    const fetchScore = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/users/${userId}/score`);
        setScore(parseInt(response.data.totalScore, 10)); // Score'u tam sayı olarak ayarla
      } catch (error) {
        console.error('Puan bilgisi alınırken hata:', error.response?.data || error);
        setScore(0); // Hata durumunda 0 göster
      }
    };

    fetchScore();
  }, [userId]);

  if (score === null) return <p>Yükleniyor...</p>; // Veri yükleniyorsa
  return (
    <div className="user-score">
      <h3>Toplam Puanınız: {score}</h3>
    </div>
  );
};

export default UserScore;
