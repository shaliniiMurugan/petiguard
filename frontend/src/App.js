// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/Login';
import Registration from './components/auth/Registration';
import PetitionerDashboard from './components/petitioner/PetitionerDashboard';
import OfficialDashboard from './components/official/OfficialDashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Registration />} />
          <Route path="/petitioner-dashboard/*" element={<PetitionerDashboard />} />
          <Route path="/official-dashboard/*" element={<OfficialDashboard />} />
          <Route path="/admin-dashboard/*" element={<AdminDashboard />} />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;