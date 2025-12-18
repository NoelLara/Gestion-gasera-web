import Sidebar from "../components/Sidebar";
import { Outlet, useNavigate } from "react-router-dom";
import "./MenuPrincipal.scss";

export default function MenuPrincipal() {
  const navigate = useNavigate();

  const usuario = {
    nombre: "Juan Pérez",
    rol: "ADMIN",
  };

  return (
    <div className="layout">
      <Sidebar rol={usuario.rol} />

      <main className="contenido">
        <header className="topbar">
          <p>
            Bienvenido, <strong>{usuario.nombre}</strong> ({usuario.rol})
          </p>
          <button onClick={() => navigate("/")}>Cerrar sesión</button>
        </header>

        <section className="vista">
          <Outlet />
        </section>
      </main>
    </div>
  );
}