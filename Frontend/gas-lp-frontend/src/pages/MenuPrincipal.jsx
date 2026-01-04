import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "./MenuPrincipal.scss";

export default function MenuPrincipal() {
  const navigate = useNavigate();

  const perfilRaw = sessionStorage.getItem("perfil");
  const perfil = perfilRaw ? JSON.parse(perfilRaw) : null;

  useEffect(() => {
    if (!perfil) {
      navigate("/", { replace: true });
    }
  }, [perfil, navigate]);

  if (!perfil) return null;

  const cerrarSesion = () => {
    sessionStorage.clear();
    navigate("/", { replace: true });
  };

  return (
    <div className="layout">
      <Sidebar rol={perfil.rol} />

      <main className="contenido">
        <header className="topbar">
          <p>
            Bienvenido, <strong>{perfil.nombre}</strong>
          </p>

          <button onClick={cerrarSesion}>
            Cerrar sesión
          </button>
        </header>

        <section className="vista">
          <Outlet />
        </section>
      </main>
    </div>
  );
}