import React from "react";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';
import Profile from './components/Profile';
import ProfileDetail from './components/ProfileDetail';
import Debug from './components/Debug';
import SwapRequests from './components/SwapRequests';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Landing />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/:userId" element={<ProfileDetail />} />
        <Route path="/swap-requests" element={<SwapRequests />} />
        <Route path="/debug" element={<Debug />} />
        <Route path="/" element={<Landing />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;