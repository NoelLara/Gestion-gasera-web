import { useNavigate } from "react-router-dom";
import { FiUsers, FiShoppingCart, FiMap, FiCreditCard, FiTruck, FiUser, FiPackage, FiCast } from "react-icons/fi";
import "./Sidebar.scss";

export default function Sidebar({ rol }) {
  const navigate = useNavigate();

  if (rol !== "ADMIN") return null;

  return (
    <aside className="sidebar">
      {/* Logo fijo */}
      <div className="logo">
        <span className="icon-gas">🐱</span>
        <span className="text-gas">Gas Cat</span>
      </div>

      {/* Botones del menú */}
      <nav className="menu">
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
        <button onClick={() => navigate("/corte-caja")}>
          <FiCreditCard className="icon" size={24} />
          <span className="text">Corte de Caja</span>
        </button>
        <button onClick={() => navigate("/unidades")}>
          <FiTruck className="icon" size={24} />
          <span className="text">Unidades</span>
        </button>
        <button onClick={() => navigate("/vendedores")}>
          <FiUser className="icon" size={24} />
          <span className="text">Vendedores</span>
        </button>
        <button onClick={() => navigate("/pedidos")}>
          <FiPackage className="icon" size={24} />
          <span className="text">Pedidos</span>
        </button>
      </nav>
    </aside>
  );
}