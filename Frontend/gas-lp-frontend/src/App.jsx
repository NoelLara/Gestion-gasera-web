import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import MenuPrincipal from "./pages/MenuPrincipal";
import Clientes from "./pages/Clientes";
import Unidades from "./pages/Unidades";
import Vendedores from "./pages/Vendedores";
import Rutas from "./pages/Rutas";
import Pedidos from "./pages/Pedidos";
import Ventas from "./pages/Ventas";
import CorteCaja from "./pages/CorteCaja";
import Registrase from "./pages/Registrarse";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="registrarse" element={<Registrase />}/>

        <Route path="/" element={<MenuPrincipal />}>
          <Route path="clientes" element={<Clientes />} />
          <Route path="unidades" element={<Unidades />} />
          <Route path="vendedores" element={<Vendedores />} />
          <Route path="rutas" element={<Rutas />} />
          <Route path="pedidos" element={<Pedidos />} />
          <Route path="ventas" element={<Ventas />} />
          <Route path="corte-caja" element={<CorteCaja />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;