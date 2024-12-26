import React, { useState, useEffect } from 'react';  
import { useNavigate } from 'react-router-dom';  
import axios from 'axios';  
import './UserProfile.css';  
import UserScore from './UserScore';



const UserProfile = () => {  
  const [user, setUser] = useState(null);  
  const [events, setEvents] = useState([]);  
  const [userData, setUserData] = useState({ first_name: '', last_name: '', email: '', interests:'',username: '', phone_number: '', profile_picture: '' });  
  const [isEditing, setIsEditing] = useState(false);  
  const navigate = useNavigate();  

  // Kullanıcı profili ve etkinlikleri yükle  
  useEffect(() => {  
    const fetchUserProfile = async () => {  
      try {  
        const storedUser = JSON.parse(localStorage.getItem('user'));  
        const storedToken = localStorage.getItem('token');  

        if (storedUser) {  
          setUser(storedUser);  
          setUserData(storedUser);  
          
          // Kullanıcının katıldığı etkinlikleri API'den al  
          const eventsResponse = await axios.get('http://localhost:5000/api/events/user-events', {  
            headers: { Authorization: `Bearer ${storedToken}` },  
          });  
          setEvents(eventsResponse.data);  
        } else {  
          console.error('Kullanıcı verisi bulunamadı!');  
        }  
      } catch (error) {  
        console.error('Kullanıcı profili alınırken hata oluştu:', error.response ? error.response.data : error);  
      }  
    };  

    fetchUserProfile();  
  }, []);  






  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/events');
        const allEvents = response.data;
  
        const interestSortedEvents = [...allEvents].sort((a, b) => {
          const userInterests = user.interests || [];
          const aMatch = userInterests.includes(a.category) ? 1 : 0;
          const bMatch = userInterests.includes(b.category) ? 1 : 0;
          return bMatch - aMatch; // Öncelikli olarak kullanıcı ilgisine göre sıralar
        });
  
        setEvents(interestSortedEvents);
      } catch (error) {
        console.error('Etkinlikler alınırken hata oluştu:', error);
      }
    };
  
    fetchEvents();
  }, [user]);
  



  // Etkinlikleri almak için API çağrısı  
  useEffect(() => {  
    const fetchEvents = async () => {  
      try {  
        const response = await axios.get('http://localhost:5000/api/events');  
        setEvents(response.data);  
      } catch (error) {  
        console.error('Etkinlikler alınırken hata oluştu:', error.response ? error.response.data : error);  
      }  
    };  
    fetchEvents();  
  }, []);  


  // Input değişimlerini yönet  
  const handleInputChange = (e) => {  
    const { name, value } = e.target;  
    setUserData({ ...userData, [name]: value });  
  };  

  const handleUpdateUser = async () => {
    const { first_name, last_name, email, username, phone_number, profile_picture, interests } = userData;
  
    if (!first_name || !last_name || !email || !username) {
      return alert('Tüm alanlar gereklidir.');
    }
  
    const storedToken = localStorage.getItem('token');
  
    try {
      const response = await axios.put(
        'http://localhost:5000/api/users/update',
        {
          userId: user.id,
          first_name,
          last_name,
          email,
          interests, // Interests'in doğru gönderildiğinden emin ol
          username,
          phone_number,
          profile_picture,
        },
        {
          headers: { Authorization: `Bearer ${storedToken}` },
        }
      );
  
      setUser(response.data.user);  // Güncel user bilgisi
      localStorage.setItem('user', JSON.stringify(response.data.user));  // LocalStorage'a kaydet
      setIsEditing(false);
      alert('Kullanıcı başarıyla güncellendi!');
    } catch (error) {
      console.error('Kullanıcı güncellenirken hata oluştu:', error.response ? error.response.data : error);
      alert('Güncelleme sırasında bir hata oluştu: ' + (error.response?.data?.message || 'Bilinmeyen hata.'));
    }
  };

  useEffect(() => {
    const fetchUser = () => {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (storedUser) {
        setUser(storedUser);
      }
    };
  
    fetchUser();
  }, []);
  


  const [userEvents, setUserEvents] = useState([]);
  const handleJoinEvent = async (eventId) => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const storedToken = localStorage.getItem('token');
  
    try {
      // Etkinliğe katılma işlemi
      await axios.post(
        `http://localhost:5000/api/events/${eventId}/join`,
        { userId: storedUser.id },
        { headers: { Authorization: `Bearer ${storedToken}` } }
      );
  
      // Katılım yapılan etkinliği kullanıcının localStorage'ına ekle
      const userJoinedEvents = JSON.parse(localStorage.getItem(`user_${storedUser.id}_joinedEvents`)) || [];
      const newEvent = events.find(event => event.id === eventId);
      userJoinedEvents.push(newEvent);
  
      // Katıldığınız etkinlikler listesini güncelle
      localStorage.setItem(`user_${storedUser.id}_joinedEvents`, JSON.stringify(userJoinedEvents));
  
      // Kullanıcı katıldığı etkinlikleri güncelledikten sonra state'e yansıtma
      setUserEvents(userJoinedEvents);
  
      alert('Etkinliğe başarıyla katıldınız!');
    } catch (error) {
      console.error('Etkinliğe katılma sırasında hata:', error.response ? error.response.data : error);
      alert('Bir hata oluştu.');
    }
  };
  useEffect(() => {
    const fetchUserEvents = async () => {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      
      // Kullanıcının katıldığı etkinlikleri localStorage'dan al
      const storedEvents = JSON.parse(localStorage.getItem(`user_${storedUser.id}_joinedEvents`));
  
      if (storedEvents) {
        setUserEvents(storedEvents); // localStorage'dan veriyi al
      } else {
        // Eğer localStorage'da etkinlik yoksa, API'den verileri çek
        const storedToken = localStorage.getItem('token');
        try {
          const response = await axios.get('http://localhost:5000/api/events/user-events', {
            headers: { Authorization: `Bearer ${storedToken}` },
            params: { userId: storedUser.id }
          });
          setUserEvents(response.data);
  
          // Etkinlikleri localStorage'a kaydet
          localStorage.setItem(`user_${storedUser.id}_joinedEvents`, JSON.stringify(response.data));
        } catch (error) {
          console.error('Katıldığınız etkinlikler alınırken hata:', error.response ? error.response.data : error);
        }
      }
    };
  
    fetchUserEvents();
  }, []);
  
  





  // Kullanıcı yoksa yükleme mesajı göster  
  if (!user) {  
    return <div className="loading">Yükleniyor...</div>;  
  } 

  return (  
    <div>
      <button className="home-button" onClick={() => navigate('/home')}>ÇIKIŞ YAP</button>
    
    <div className="user-profile-container">  
    
      <div className="profile-header">  
      {userData.profile_picture && (
  <div className="profile-picture-preview">
   
    <img
      src={userData.profile_picture}
      alt="Profile Preview"
      style={{ width: '100px', height: '100px', borderRadius: '50%' }}
    />
  </div>
)}

        <div className="profile-info">  
          <h1>{user.username}</h1>  
          <p>{user.email}</p>  
          <p>{user.phone_number}</p>  
          <p>{user.interests}</p>
          <UserScore userId={user.id} />
          {isEditing ? (  
            <div>  
              <input  
                type="text"  
                name="username"  
                value={userData.username}  
                onChange={handleInputChange}  
              />  
              <input  
                type="email"  
                name="email"  
                value={userData.email}  
                onChange={handleInputChange}  
              />  
              <input  
                type="text"  
                name="phone_number"  
                value={userData.phone_number}  
                onChange={handleInputChange}  
              />  
              
              <input
  type="text"
  name="interests"  // Corrected this line
  value={userData.interests}
  onChange={handleInputChange}

/>


               
              <button className="join-btn" onClick={handleUpdateUser}>GÜNCELLE</button>  
              <button className="cancel-btn" onClick={() => setIsEditing(false)}>İptal</button>  
            </div>  
          ) : (  
            <button className="join-btn" onClick={() => setIsEditing(true)}>GÜNCELLE</button>  
          )}  
        </div>  
      </div>  

      <div className="user-events">  
        <h2>Katıldığınız Etkinlikler</h2> 


        {userEvents.length === 0 ? (
  <p>Henüz katıldığınız bir etkinlik yok.</p>
) : (

  <ul>
  {userEvents.map((event, index) => {
    // Tarihi düzenlemek için Date nesnesi kullanıyoruz
    const formattedDate = new Date(event.date).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return (
      <li key={`${event.id}-${index}`}>
      <p>
      <strong>{event.event_name}</strong>
      </p>
      {formattedDate}
    </li>
    );
  })}
</ul>


  




)}
 
      </div>  

          {/* Önerilen Etkinlikler */}
          <h1>Önerilen Etkinlikler</h1>
      <div className="events-list">
        {events.length > 0 ? (
          events.map((event) => {
            const formattedDate = new Date(event.date).toLocaleDateString(
              'tr-TR',
              {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              }
            );

            return (
              <div key={event.id} className="event-card">
                <h3>{event.event_name}</h3>
                <p>{formattedDate}</p>
                <p>{event.location}</p>
                <button
                  className="join-btn"
                  onClick={() => handleJoinEvent(event.id)}
                >
                  Katıl
                </button>
                <button
                  className="details-btn"
                  onClick={() => navigate(`/event/${event.id}`)}
                >
                  Detaylar
                </button>
              </div>
            );
          })
        ) : (
          <p>Etkinlikler yükleniyor...</p>
        )}
      </div>
      <div className="create-event">  
        <button className="create-btn" onClick={() => navigate('/create-event')}>  
          Yeni Etkinlik Oluştur  
        </button>  
      </div>  
    </div> 
    </div> 
  );  
};  

export default UserProfile;