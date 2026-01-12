import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import MenuPrincipal from "./pages/MenuPrincipal";
import Clientes from "./pages/Clientes";
import Unidades from "./pages/Unidades";
import Vendedores from "./pages/Vendedores";
import Rutas from "./pages/Rutas";
import Pedidos from "./pages/Pedidos";
import Ventas from "./pages/Ventas";
import Registrarse from "./pages/Registrarse";
import MisPedidos from "./pages/MisPedidos";
import NuevoPedido from "./pages/NuevoPedido";
import PerfilCliente from "./pages/PerfilCliente";
import AsignarUnidad from "./pages/AsignarUnidad";
import VentaExterna from "./pages/VentaExterna";
import PerfilVendedor from "./pages/PerfilVendedor";

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
          <Route path="venta-externa" element={<VentaExterna />} />
          <Route path="asignar-unidad" element={<AsignarUnidad />} />

          <Route path="cliente">
            <Route index element={<MisPedidos />} />
            <Route path="nuevo-pedido" element={<NuevoPedido />} />
            <Route path="perfil" element={<PerfilCliente />} />
          </Route>

          <Route path="vendedor">
            <Route path="pedidos" element={<MisPedidosVendedor />} />
            <Route path="perfil" element={<PerfilVendedor />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;