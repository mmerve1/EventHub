import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/home/Home';
import EventDetail from './pages/event/EventDetail';
import EventCreate from './pages/event/EventCreate';
import UserProfile from './pages/profile/UserProfile';
import AdminProfile from './pages/profile/AdminProfile';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Enter from './pages/enter/Enter';
import ResetPassword  from './pages/auth/ResetPassword';


const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/event/:id" element={<EventDetail />} />
        <Route path="/create-event" element={<EventCreate />} />
        <Route path="/profile/:username" element={<UserProfile />} />
        <Route path="/admin" element={<AdminProfile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/enter" element={<Enter />}/>
        <Route path='/reset' element={<ResetPassword/>}/>
      </Routes>
    </Router>
  );
};

export default App;
