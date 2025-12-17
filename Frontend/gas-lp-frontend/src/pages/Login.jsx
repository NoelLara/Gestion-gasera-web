import { useState } from "react";
import "./Login.scss";

export default function Login() {
  const [formulario, setFormulario] = useState({
    correo: "",
    contraseña: "",
  });

  const manejarCambio = (e) => {
    setFormulario({
      ...formulario,
      [e.target.name]: e.target.value,
    });
  };

  const manejarEnvio = (e) => {
    e.preventDefault();
    console.log("Datos enviados:", formulario);
  };

  return (
    <div className="login-contenedor">
      <div className="login-tarjeta">
        <h1>Iniciar sesión</h1>

        <form onSubmit={manejarEnvio}>
          <label>Correo electrónico</label>
          <input
            type="email"
            name="correo"
            placeholder="correo@ejemplo.com"
            onChange={manejarCambio}
          />

          <label>Contraseña</label>
          <input
            type="password"
            name="contraseña"
            placeholder="••••••••"
            onChange={manejarCambio}
          />

          <button type="submit">Entrar</button>
        </form>
      </div>
    </div>
  );
}