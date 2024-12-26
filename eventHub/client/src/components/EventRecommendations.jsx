import React from 'react';
import './EventRecommendations.css';

const EventRecommendations = () => {
  return (
    <div className="event-recommendations">
      <h2>Event Recommendations</h2>
      <p>Find exciting events and join the fun!</p>
      {/* Example event recommendation cards */}
      <div className="recommendation-card">
        <h3>Art Exhibition</h3>
        <p>Explore the world of modern art</p>
      </div>
      <div className="recommendation-card">
        <h3>Music Festival</h3>
        <p>Experience live music and great vibes</p>
      </div>
    </div>
  );
};

export default EventRecommendations;
