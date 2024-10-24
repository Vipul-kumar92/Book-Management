import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Import Routes from react-router-dom

import Navbar from './Components/Navbar';
import Book from './Components/bookregister';

import Home from './Components/Home';
import Available from './Components/Mybook';
import Register from './Components/registration'
import AddBookAdmin from './Components/AddBookAdmin';
const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes> {/* Wrap your Routes in a Routes component */}
        <Route path="/book" element={<Book/>} />
        <Route path="/mybook" element={<Available/>} /> 
        <Route path="/registration/:id" element={<Register/>} /> 
        <Route path="/Add" element={<AddBookAdmin />} /> 
        <Route path="/" element={<Home/>} /> 
      </Routes>
    </Router>
  );
};

export default App;
