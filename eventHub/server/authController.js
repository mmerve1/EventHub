const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// User Registration Controller
exports.register = async (req, res, pool) => {
  const { first_name, last_name, email, username, password, location, interests, date_of_birth, gender, phone_number, profile_picture } = req.body;

  // Prevent admin registration
  if (username === "admin") {
    return res.status(403).json({ error: "Admin registration is not allowed." });
  }

  // Check required fields
  if (!first_name || !last_name || !email || !username || !password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  
  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into database
    const result = await pool.query(
      'INSERT INTO users (first_name, last_name, email, username, password, location, interests, date_of_birth, gender, phone_number, profile_picture) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
      [first_name, last_name, email, username, hashedPassword, location, interests, date_of_birth, gender, phone_number, profile_picture]
    );

    const newUser = result.rows[0];

    // Generate JWT
    const token = jwt.sign({ userId: newUser.id, username: newUser.username }, 'your_secret_key', { expiresIn: '1h' });

    res.status(201).json({ message: 'Registration successful', user: newUser, token });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// User Login Controller (Already handles admin login)
exports.login = async (req, res, pool) => {
  const { username, password } = req.body;

  // Check required fields
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }
  
  try {
    // Admin login check
    if (username === "admin" && password === "admin") {
      const token = jwt.sign({ role: "admin" }, 'your_secret_key', { expiresIn: '1h' });
      return res.status(200).json({ message: 'Admin login successful', token });
    }

    // Standard user login
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];

    // Validate user and password
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT for user
    const token = jwt.sign({ userId: user.id, username: user.username }, 'your_secret_key', { expiresIn: '1h' });

    res.status(200).json({ message: 'Login successful', user, token });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};


// Password Reset Controller
exports.resetPassword = async (req, res, pool) => {
  const { email, newPassword } = req.body;

  // Check required fields
  if (!email || !newPassword) {
    return res.status(400).json({ error: 'E-posta ve yeni şifre gereklidir.' });
  }

  try {
    // Find user by email
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ error: 'Bu e-posta ile kayıtlı kullanıcı bulunamadı.' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password in database
    await pool.query('UPDATE users SET password = $1 WHERE email = $2', [hashedPassword, email]);

    res.status(200).json({ success: true, message: 'Şifre başarıyla sıfırlandı.' });
  } catch (error) {
    console.error('Şifre sıfırlama sırasında hata:', error.message);
    res.status(500).json({ error: 'Sunucu hatası. Lütfen tekrar deneyin.' });
  }
};
