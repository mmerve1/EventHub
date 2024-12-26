import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminProfile.css';

const AdminProfile = () => {
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [editEvent, setEditEvent] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [categories, setCategories] = useState(["Sanat", "Teknoloji", "Spor", "Sağlık"]); 
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/users');
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    const fetchEvents = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/events?isAdmin=true');
        setEvents(response.data);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchUsers();
    fetchEvents();
  }, []);

  const approveEvent = async (eventId) => {
    try {
      const response = await axios.post(`http://localhost:5000/api/events/approve/${eventId}`);
      alert(response.data.message);
      setEvents(events.map(event => event.id === eventId ? { ...event, isApproved: true } : event));
    } catch (error) {
      console.error('Error approving event:', error);
      alert('Error approving event.');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        // Sending DELETE request to the API
        const response = await axios.delete(`http://localhost:5000/api/events/${eventId}`);
        if (response.status === 200) {
          // Successfully deleted event, remove it from state
          setEvents(events.filter(event => event.id !== eventId));
          alert('Event successfully deleted!');
        }
      } catch (error) {
        console.error('Error deleting event:', error);
        alert('Error deleting event.');
      }
    }
  };
  

  const handleEditEvent = (event) => {
    setEditEvent(event);
    setShowEditModal(true);
  };

  const handleUpdateEvent = async () => {
    try {
      const response = await axios.put(`http://localhost:5000/api/events/${editEvent.id}`, editEvent);
      alert(response.data.message);
      setEvents(events.map(event => (event.id === editEvent.id ? response.data.event : event)));
      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating event:', error);
      alert('Error updating event.');
    }
  };

  const categorizedEvents = categories.reduce((acc, category) => {
    acc[category] = events.filter(event => event.category === category);
    return acc;
  }, {});

  return (
    
    <div className="admin-profile">
      <h1>Admin Panel</h1>
      
      <button className="home-button" onClick={() => navigate('/home')}>ANA SAYFA </button>

      <section>
        <h3>Users</h3>
        <div className="user-cards">
          {users.map(user => (
            <div key={user.id} className="user-card">
              <h4>{user.username}</h4>
              <p>Email: {user.email}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3>Events</h3>
        {categories.map(category => (
          <div key={category} className="category-section">
            <h4>{category}</h4>
            <div className="event-cards">
              {categorizedEvents[category].map(event => (
                <div key={event.id} className="event-card">
                  <h4>{event.event_name}</h4>
                  <p>Date: {event.date}</p>
                  <p>Location: {event.location}</p>
                  <button className="approve-button" onClick={() => approveEvent(event.id)}>Onayla</button>
                  <button className="edit-button" onClick={() => handleEditEvent(event)}>Güncelle</button>
                  <button className="delete-button" onClick={() => handleDeleteEvent(event.id)}>Sil</button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      {showEditModal && (
  <>
    <div className="edit-modal-overlay" onClick={() => setShowEditModal(false)}></div>
    <div className="edit-modal">
      <h3>Edit Event</h3>
      <form>
        <input
          type="text"
          placeholder="Event Name"
          value={editEvent.event_name}
          onChange={(e) => setEditEvent({ ...editEvent, event_name: e.target.value })}
        />
        <textarea
          placeholder="Description"
          value={editEvent.description}
          onChange={(e) => setEditEvent({ ...editEvent, description: e.target.value })}
        />
        <input
          type="date"
          value={editEvent.date}
          onChange={(e) => setEditEvent({ ...editEvent, date: e.target.value })}
        />
        <input
          type="time"
          value={editEvent.time}
          onChange={(e) => setEditEvent({ ...editEvent, time: e.target.value })}
        />
        <input
          type="number"
          placeholder="Duration"
          value={editEvent.duration}
          onChange={(e) => setEditEvent({ ...editEvent, duration: e.target.value })}
        />
        <input
          type="text"
          placeholder="Location"
          value={editEvent.location}
          onChange={(e) => setEditEvent({ ...editEvent, location: e.target.value })}
        />
        <input
          type="text"
          placeholder="Category"
          value={editEvent.category}
          onChange={(e) => setEditEvent({ ...editEvent, category: e.target.value })}
        />
        <button type="button" onClick={handleUpdateEvent}>Save</button>
        <button type="button" onClick={() => setShowEditModal(false)}>Cancel</button>
      </form>
    </div>
  </>
)}

    </div>
  );
};

export default AdminProfile;