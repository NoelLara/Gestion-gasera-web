import { Outlet, Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "./ClienteLayout.scss";

export default function ClienteLayout() {
  return (
    <div className="cliente-layout">
      <aside className="menu">
        <h2>🐱 Mi cuenta</h2>
        <Link to="/cliente">Mis pedidos</Link>
        <Link to="/cliente/nuevo-pedido">Nuevo pedido</Link>
        <Link to="/cliente/perfil">Mi perfil</Link>
        <button onClick={() => {
          sessionStorage.removeItem("token");
          window.location.href = "/";
        }}>
          Cerrar sesión
        </button>
      </aside>

      <main className="contenido">
        <Outlet />
      </main>
    </div>
  );
}