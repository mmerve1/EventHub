import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './EventChat.css';

const EventChat = ({ eventId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState('');
  const user = JSON.parse(localStorage.getItem('user')); // Get logged-in user data

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`/api/events/${eventId}/messages`);
        setMessages(response.data);
      } catch (err) {
        setError('Mesajlar alınırken hata oluştu.');
      }
    };

    fetchMessages();
  }, [eventId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) {
      return;
    }

    try {
      const senderId = user.id; // Logged-in user ID
      await axios.post(`/api/events/${eventId}/messages`, {
        senderId,
        messageText: newMessage,
      });

      setMessages((prev) => [
        ...prev,
        {
          sender_ID: senderId,
          username: user.username,
          message_text: newMessage,
          sent_at: new Date(),
        },
      ]);
      setNewMessage('');
    } catch (err) {
      console.error('Hata:', err.response || err);
      setError('Mesaj gönderilirken hata oluştu.');
    }
  };

  return (
    <div className="event-chat-container">
      <h3>Sohbet Alanı</h3>
      <div className="chat-messages">
        {messages.length > 0 ? (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`chat-message ${
                msg.sender_ID === user.id ? 'self' : 'other'
              }`}
            >
              <span>
                <strong>{msg.username}</strong>: {msg.message_text}
              </span>
              <small>{new Date(msg.sent_at).toLocaleString()}</small>
            </div>
          ))
        ) : (
          <p>Henüz mesaj yok.</p>
        )}
      </div>
      <div className="chat-input">
        <input
          type="text"
          placeholder="Mesajınızı yazın..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button onClick={handleSendMessage}>Gönder</button>
      </div>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default EventChat;
