// server.js
//çalışan kodd
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const authController = require('./authController');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'event',
  password: 'merve2302',
  port: 5432,
});

app.post('/api/register', (req, res) => authController.register(req, res, pool));
app.post('/api/login', (req, res) => authController.login(req, res, pool));
app.post('/api/reset', (req, res) => authController.resetPassword(req, res, pool));
const startServer = async () => {
  const testUser = {
    first_name: "Merve",
    last_name: "Yılmaz",
    email: "merve@example.com",
    username: "merveyilmaz",
    password: "merve123",
    location: "Istanbul",
    interests: ["tech", "music"],
    date_of_birth: "1995-01-01",
    gender: "female",
    phone_number: "1234567890",
    profile_picture: "https://example.com/profile.jpg",
  };

  try {
    
    await pool.query(
      `INSERT INTO users (first_name, last_name, email, username, password, location, interests, date_of_birth, gender, phone_number, profile_picture)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        testUser.first_name,
        testUser.last_name,
        testUser.email,
        testUser.username,
        testUser.password,
        testUser.location,
        testUser.interests.join(','), 
        testUser.date_of_birth,
        testUser.gender,
        testUser.phone_number,
        testUser.profile_picture,
      ]
    );

    console.log('Veritabanı işlemleri tamamlandı.');
  } catch (error) {
    console.error('Veritabanı işlemleri sırasında hata:', error.message);
  }
};

app.listen(5000, () => {
  console.log(`Server is running on port 5000`);
});
// Etkinlikleri Listeleme
app.get('/api/events', async (req, res) => {
  const isAdmin = req.query.isAdmin === 'true'; // Admin isteği mi kontrol edilir

  try {
    const result = await pool.query('SELECT * FROM Events');
    if (isAdmin) {
      return res.status(200).json(result.rows);
    }

    // Yalnızca onaylanmış etkinlikler gönderilir
    const approvedEvents = result.rows.filter(event => event.is_approved);
    return res.status(200).json(approvedEvents);
  } catch (error) {
    console.error('Etkinlikler alınırken hata:', error.message);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Etkinlik Oluşturma
app.post('/api/events', async (req, res) => {
  const { event_name, description, date, time, duration, location, category, userId } = req.body;

  console.log('Gelen userId:', userId);

  if (!event_name || !date || !time || !location) {
    return res.status(400).json({ error: 'Etkinlik adı, tarih, saat ve konum gerekli.' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO Events (event_name, description, date, time, duration, location, category) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [event_name, description, date, time, duration, location, category]
    );

    if (userId) {
      await updateScore(userId, 15, pool);
    } else {
      console.error('userId bulunamadı, puan eklenmedi.');
    }

    res.status(201).json({ message: 'Etkinlik başarıyla oluşturuldu', event: result.rows[0] });
  } catch (error) {
    console.error('Etkinlik oluşturulurken hata:', error.message);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});




// Etkinlik Onaylama
app.post('/api/events/approve/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const eventQuery = await pool.query('SELECT * FROM Events WHERE id = $1', [id]);
    if (eventQuery.rows.length === 0) {
      return res.status(404).json({ error: 'Etkinlik bulunamadı.' });
    }

    await pool.query('UPDATE Events SET is_approved = $1 WHERE id = $2', [true, id]);
    const updatedEvent = await pool.query('SELECT * FROM Events WHERE id = $1', [id]);
    res.json({ message: 'Etkinlik başarıyla onaylandı.', event: updatedEvent.rows[0] });
  } catch (error) {
    console.error('Etkinlik onaylanırken hata:', error.message);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Etkinlik Detayları
app.get('/api/events/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('SELECT * FROM Events WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Etkinlik bulunamadı.' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Etkinlik detayları alınırken hata:', error.message);
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
});

// Etkinlik Güncelleme
app.put('/api/events/:id', async (req, res) => {
  const { id } = req.params;
  const { event_name, description, date, time, duration, location, category } = req.body;

  try {
    const result = await pool.query(
      `UPDATE Events SET
        event_name = $1, description = $2, date = $3, time = $4, duration = $5, 
        location = $6, category = $7 WHERE id = $8 RETURNING *`,
      [event_name, description, date, time, duration, location, category, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Etkinlik bulunamadı.' });
    }

    res.status(200).json({ message: 'Etkinlik başarıyla güncellendi', event: result.rows[0] });
  } catch (error) {
    console.error('Etkinlik güncellenirken hata:', error.message);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});



app.delete('/api/events/:eventId', async (req, res) => {
  const { eventId } = req.params;

  try {
      await pool.query(`DELETE FROM Participants WHERE event_ID = $1`, [eventId]);
      await pool.query(`DELETE FROM Events WHERE ID = $1`, [eventId]);

      res.status(200).json({ message: "Etkinlik başarıyla silindi." });
  } catch (error) {
      console.error("Hata:", error);
      res.status(500).json({ error: "Etkinlik silinirken bir hata oluştu." });
  }
});


app.delete('/api/events/:eventId', async (req, res) => {
  const { eventId } = req.params;

  try {
    // First, delete participants for the event
    await pool.query('DELETE FROM Participants WHERE event_ID = $1', [eventId]);

    // Then, delete the event itself
    const result = await pool.query('DELETE FROM Events WHERE ID = $1 RETURNING *', [eventId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Etkinlik bulunamadı.' });
    }

    res.status(200).json({ message: 'Etkinlik başarıyla silindi.' });
  } catch (error) {
    console.error('Etkinlik silinirken hata:', error.message);
    res.status(500).json({ error: 'Etkinlik silinirken bir hata oluştu.' });
  }
});









// Kullanıcının etkinliklere katılma
app.post('/api/events/:eventId/join', async (req, res) => {
  const { eventId } = req.params;
  const { userId } = req.body;

  if (!userId || !eventId) {
    return res.status(400).json({ error: 'Kullanıcı ID ve etkinlik ID gereklidir.' });
  }

  try {
    await pool.query('INSERT INTO Participants (user_ID, event_ID) VALUES ($1, $2)', [userId, eventId]);

    await updateScore(userId, 10, pool);

    res.status(201).json({ message: 'Etkinliğe başarıyla katıldınız.' });
  } catch (error) {
    console.error('Etkinliğe katılma sırasında hata:', error.message);
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
});



app.get('/api/events/user-events', async (req, res) => {
  const { userId } = req.query;

  try {
    const result = await pool.query(
      `SELECT Events.* 
       FROM Events
       INNER JOIN Participants ON Events.ID = Participants.event_ID
       WHERE Participants.user_ID = $1`,
      [userId]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Kullanıcının etkinlikleri alınırken hata:', error.message);
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
});















app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    console.log("Fetched users:", result.rows); // Log the fetched users
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error.message);
    res.status(500).send('Server Error');
  }
});

app.put('/api/users/update', async (req, res) => {  
  const { userId, first_name, last_name, email, interests,username, phone_number, profile_picture } = req.body;  

  // Gerekli alanların kontrolü  
  if (!userId || !first_name || !last_name || !email || !interests || !username) {  
    return res.status(400).json({ error: 'All fields are required.' });  
  }  

  try {  
    // Kullanıcıyı güncelleyen SQL sorgusu  
    await pool.query(  
      'UPDATE users SET first_name = $1, last_name = $2, email = $3, interests = $4 ,username = $5, phone_number = $6, profile_picture = $7 WHERE id = $8',  
      [first_name, last_name, email, interests ,username, phone_number, profile_picture, userId]  
    );  

    // Güncellenen kullanıcı bilgilerini tekrar al  
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);  
    const updatedUser = result.rows[0];  

    // Başarılı güncelleme yanıtı  
    res.status(200).json({ message: 'User updated successfully', user: updatedUser });  
  } catch (error) {  
    console.error('Error during user update:', error.message);  
    res.status(500).json({ error: 'Server error. Please try again.' });  
  }  
});  








//YENİ EKLEDİM
app.post('/api/events/:eventId/messages', async (req, res) => {
  const { eventId } = req.params;
  const { senderId, messageText } = req.body;

  if (!senderId || !messageText) {
    return res.status(400).json({ error: 'Mesaj içeriği ve gönderen ID gereklidir.' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO messages (event_ID, sender_ID, message_text) VALUES ($1, $2, $3) RETURNING *',
      [eventId, senderId, messageText]
    );
    res.status(201).json({ message: 'Mesaj başarıyla gönderildi.', data: result.rows[0] });
  } catch (error) {
    console.error('Mesaj gönderme sırasında hata:', error.message);
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
});






app.get('/api/events/:eventId/messages', async (req, res) => {
  const { eventId } = req.params;

  try {
    const result = await pool.query(
      'SELECT messages.*, Users.username FROM messages INNER JOIN Users ON messages.sender_ID = Users.ID WHERE event_ID = $1 ORDER BY sent_at ASC',
      [eventId]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Mesajlar alınırken hata:', error.message);
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
});

app.get('/api/events/recommendations', async (req, res) => {
  const { userId } = req.query;

  try {
    // Kullanıcının ilgi alanlarını al
    const userResult = await pool.query('SELECT interests FROM Users WHERE ID = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
    }

    const userInterests = userResult.rows[0].interests.split(',');

    // Kullanıcının ilgi alanlarına göre etkinlikleri sırala
    const eventResult = await pool.query('SELECT * FROM Events ORDER BY date ASC'); // Tarihe göre sıralanmış
    const recommendedEvents = eventResult.rows.filter(event =>
      userInterests.includes(event.category)
    );

    res.status(200).json(recommendedEvents);
  } catch (error) {
    console.error('Öneriler alınırken hata:', error.message);
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
});


const updateScore = async (userId, points, pool) => {
  try {
    const today = new Date().toISOString().slice(0, 10);

    const existingScore = await pool.query(
      `SELECT * FROM Scores WHERE user_ID = $1 AND earned_date = $2`,
      [userId, today]
    );

    if (existingScore.rows.length > 0) {
      // Mevcut güncelleme
      await pool.query(
        `UPDATE Scores SET score = score + $1 WHERE user_ID = $2 AND earned_date = $3`,
        [points, userId, today]
      );
    } else {
      // Yeni kayıt
      await pool.query(
        `INSERT INTO Scores (user_ID, score, earned_date) VALUES ($1, $2, $3)`,
        [userId, points, today]
      );
    }
  } catch (error) {
    console.error('Puan güncellenirken hata:', error.message);
  }
};


app.get('/api/users/:userId/score', async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await pool.query(
      'SELECT SUM(score) AS total_score FROM Scores WHERE user_ID = $1',
      [userId]
    );

    const totalScore = result.rows[0]?.total_score || 0;

    res.status(200).json({ userId, totalScore });
  } catch (error) {
    console.error('Puan bilgisi alınırken hata:', error.message);
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
});



// Sunucu dinleme
const PORT = 5001;  // Port numarası
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});