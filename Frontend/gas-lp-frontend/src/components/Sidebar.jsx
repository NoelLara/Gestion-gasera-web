import { useNavigate } from "react-router-dom";
import {
  FiUsers,
  FiShoppingCart,
  FiMap,
  FiTruck,
  FiUser,
  FiPackage,
  FiDollarSign,
} from "react-icons/fi";
import { FaCoins } from "react-icons/fa";
import "./Sidebar.scss";

export default function Sidebar({ rol }) {
  const navigate = useNavigate();

  return (
    <aside className="sidebar">
      <div className="logo">
        <span className="icon-gas">🐱</span>
        <span className="text-gas">Gas Cat</span>
      </div>

      <nav className="menu">

        {rol === "administrador" && (
          <>
            <button onClick={() => navigate("/clientes")}>
              <FiUsers className="icon" size={24} />
              <span className="text">Clientes</span>
            </button>

            <button onClick={() => navigate("/ventas")}>
              <FiShoppingCart className="icon" size={24} /> 
              <span className="text">Ventas</span>
            </button>

            <button onClick={() => navigate("/rutas")}>
              <FiMap className="icon" size={24} /> 
              <span className="text">Rutas</span>
            </button>

            <button onClick={() => navigate("/unidades")}>
              <FiTruck className="icon" size={24} /> 
              <span className="text">Unidades</span>
            </button>

            <button onClick={() => navigate("/asignar-unidad")}>
              <FiTruck className="icon" size={24} /> 
              <span className="text">Asignar Unidad</span>
            </button>

            <button onClick={() => navigate("/vendedores")}>
              <FiUser className="icon" size={24} /> 
              <span className="text">Vendedores</span>
            </button>

            <button onClick={() => navigate("/pedidos")}>
              <FiPackage className="icon" size={24} /> 
              <span className="text">Pedidos</span>
            </button>

            <button onClick={() => navigate("/entrega-dinero")}>
              <FaCoins className="icon" size={24} /> 
              <span className="text">Entrega de Dinero</span>
            </button>
          </>
        )}

        {rol === "cliente" && (
          <>
            <button onClick={() => navigate("/cliente")}>
              <FiPackage className="icon" size={24} /> 
              <span className="text">Mis pedidos</span>
            </button>

            <button onClick={() => navigate("/cliente/nuevo-pedido")}>
              <FiShoppingCart className="icon" size={24} /> 
              <span className="text">Nuevo pedido</span>
            </button>

            <button onClick={() => navigate("/cliente/perfil")}>
              <FiUser className="icon" size={24} /> 
              <span className="text">Mi perfil</span>
            </button>
          </>
        )}

        {rol === "vendedor" && (
          <>
            <button onClick={() => navigate("/vendedor/pedidos")}>
              <FiPackage className="icon" size={24} />
              <span className="text">Mis pedidos</span>
            </button>

            <button onClick={() => navigate("/venta-externa")}>
              <FiDollarSign className="icon" size={24} />
              <span className="text">Venta Externa</span>
            </button>

            <button onClick={() => navigate("/vendedor/perfil")}>
              <FiUser className="icon" size={24} />
              <span className="text">Mi perfil</span>
            </button>
          </>
        )}

      </nav>
    </aside>
  );
}