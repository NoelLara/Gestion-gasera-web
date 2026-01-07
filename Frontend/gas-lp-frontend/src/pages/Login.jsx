import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, obtenerPerfil } from "../services/authService";
import "./Login.scss";

export default function Login() {
  const navigate = useNavigate();

  const [formulario, setFormulario] = useState({
    correo: "",
    password: "",
  });

  const manejarCambio = (e) => {
    const { name, value } = e.target;

    setFormulario({
      ...formulario,
      [name]: value,
    });
  };

  const manejarEnvio = async (e) => {
    e.preventDefault();

    try {
      const respuesta = await login(
        formulario.correo,
        formulario.password
      );

      sessionStorage.setItem("token", respuesta.access_token);

      const perfil = await obtenerPerfil();

      sessionStorage.setItem("perfil", JSON.stringify(perfil));

      if (perfil.rol === "administrador") {
        navigate("/clientes");
      } else if (perfil.rol === "vendedor") {
        navigate("/vendedor/pedidos");
      } else if (perfil.rol === "cliente") {
        sessionStorage.setItem("idCliente", perfil.id);
        navigate("/cliente");
      }

    } catch (error) {
      alert("Correo o contraseña incorrectos");
    }
  };

  return (
    <div className="login-contenedor">
      <div className="login-tarjeta">
        <h1>Iniciar sesión</h1>

        <form onSubmit={manejarEnvio}>
          <div className="campo">
            <label>Correo electrónico</label>
            <input
              type="email"
              name="correo"
              value={formulario.correo}
              placeholder="correo@ejemplo.com"
              onChange={manejarCambio}
            />
          </div>

          <div className="campo">
            <label>Contraseña</label>
            <input
              type="password"
              name="password"
              value={formulario.password}
              placeholder="••••••••"
              onChange={manejarCambio}
            />
          </div>

          <button
            type="submit"
            disabled={!formulario.correo || !formulario.password}
          >
            Entrar
          </button>

          <p className="ir-a-registrarse">
            ¿No tienes cuenta?{" "}
            <span onClick={() => navigate("/registrarse")}>Regístrate aquí</span>
          </p>
        </form>
      </div>
    </div>
  );
}