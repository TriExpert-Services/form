import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TranslationForm from './components/TranslationForm';
import Dashboard from './components/Dashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TranslationForm />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;