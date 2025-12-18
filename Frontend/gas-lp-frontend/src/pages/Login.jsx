import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.scss";

export default function Login() {
  const navigate = useNavigate();

  const [formulario, setFormulario] = useState({
    correo: "",
    contraseña: "",
  });

  const manejarCambio = (e) => {
    const { name, value } = e.target;

    setFormulario({
      ...formulario,
      [name]: value,
    });
  };

  const manejarEnvio = (e) => {
    e.preventDefault();

    if (!formulario.correo || !formulario.contraseña) {
      alert("Todos los campos son obligatorios");
      return;
    }

    console.log("Datos enviados:", formulario);

    navigate("/menu");
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
              name="contraseña"
              value={formulario.contraseña}
              placeholder="••••••••"
              onChange={manejarCambio}
            />
          </div>

          <button
            type="submit"
            disabled={!formulario.correo || !formulario.contraseña}
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}