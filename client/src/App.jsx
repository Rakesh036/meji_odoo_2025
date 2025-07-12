import React from "react";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';
import Profile from './components/Profile';
import Debug from './components/Debug';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Navbar />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/debug" element={<Debug />} />
        <Route path="/" element={<Landing />} />

    </Routes>
    </BrowserRouter>
  );
}

export default App;