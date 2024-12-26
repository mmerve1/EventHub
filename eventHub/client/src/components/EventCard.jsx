import React from 'react';
import { Link } from 'react-router-dom';

const EventCard = ({ event }) => {
  return (
    <div>
      <h3>{event.name}</h3>
      <p>{event.description}</p>
      <Link to={`/event/${event._id}`}>View Details</Link>
    </div>
  );
};

export default EventCard;
