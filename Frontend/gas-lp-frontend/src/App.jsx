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
import Registrarse from "./pages/Registrarse";

import MisPedidos from "./pages/MisPedidos";
import NuevoPedido from "./pages/NuevoPedido";
import PerfilCliente from "./pages/PerfilCliente";

import MisPedidosVendedor from "./pages/MisPedidosVendedor";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/registrarse" element={<Registrarse />} />

        <Route element={<MenuPrincipal />}>
          <Route path="clientes" element={<Clientes />} />
          <Route path="unidades" element={<Unidades />} />
          <Route path="vendedores" element={<Vendedores />} />
          <Route path="rutas" element={<Rutas />} />
          <Route path="pedidos" element={<Pedidos />} />
          <Route path="ventas" element={<Ventas />} />
          <Route path="corte-caja" element={<CorteCaja />} />

          <Route path="cliente">
            <Route index element={<MisPedidos />} />
            <Route path="nuevo-pedido" element={<NuevoPedido />} />
            <Route path="perfil" element={<PerfilCliente />} />
          </Route>

          <Route path="vendedor">
            <Route path="pedidos" element={<MisPedidosVendedor />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;