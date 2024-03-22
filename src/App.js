// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import AttendanceGrid from './Components/AttendanceGrid';
import Login from './Login';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/attendance" element={<AttendanceGrid />} />
        </Routes>
      </div>
    </Router>

    
  );
}

export default App;
