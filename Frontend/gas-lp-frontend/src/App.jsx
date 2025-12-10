import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.scss';

import Login from './pages/Login';
import Clientes from './pages/Clientes';
import Unidades from './pages/Unidades';
import Vendedores from './pages/Vendedores';
import Rutas from './pages/Rutas';
import Pedidos from './pages/Pedidos';
import Ventas from './pages/Ventas';
import CorteCaja from './pages/CorteCaja';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

function App() {
  const loggedIn = false; //Todo

  return (
    <Router>
      {loggedIn && <Navbar />}
      {loggedIn && <Sidebar />}
      <div className="main-content">
        <h1>Hola mundo</h1>
        <Routes>
          <Route path="/" element={loggedIn ? <Navigate to="/clientes" /> : <Login />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/unidades" element={<Unidades />} />
          <Route path="/vendedores" element={<Vendedores />} />
          <Route path="/rutas" element={<Rutas />} />
          <Route path="/pedidos" element={<Pedidos />} />
          <Route path="/ventas" element={<Ventas />} />
          <Route path="/corte-caja" element={<CorteCaja />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;