import Sidebar from "../components/Sidebar";
import { Outlet, useNavigate } from "react-router-dom";
import "./MenuPrincipal.scss";

export default function MenuPrincipal() {
  const navigate = useNavigate();

  const perfil = JSON.parse(sessionStorage.getItem("perfil"));

  if (!perfil) {
    navigate("/");
    return null;
  }

  const cerrarSesion = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("perfil");
    navigate("/");
  };

  return (
    <div className="layout">
      <Sidebar rol={perfil.rol} />

      <main className="contenido">
        <header className="topbar">
          <p>
            Bienvenido, <strong>{perfil.nombre}</strong>
          </p>
          <button onClick={cerrarSesion}>Cerrar sesión</button>
        </header>

        <section className="vista">
          <Outlet />
        </section>
      </main>
    </div>
  );
}