import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registrar, login, obtenerPerfil } from "../services/authService";
import "./Registrarse.scss";

export default function Registrarse() {
  const navigate = useNavigate();

  const [formulario, setFormulario] = useState({
    nombre: "",
    correo: "",
    telefono: "",
    contrasena: "",
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
      await registrar({
        nombre: formulario.nombre,
        correo: formulario.correo,
        telefono: formulario.telefono,
        contrasena: formulario.contrasena,
        rol: "cliente",
      });

      navigate("/");

    } catch (error) {
      alert("Error al registrarse: " + (error.response?.data?.detail || error.message));
    }
  };

  return (
    <div className="registrarse-contenedor">
      <div className="registrarse-tarjeta">
        <h1>Registrarse</h1>

        <form onSubmit={manejarEnvio}>
          <div className="campo">
            <label>Nombre completo</label>
            <input
              type="text"
              name="nombre"
              value={formulario.nombre}
              placeholder="Juan Pérez"
              onChange={manejarCambio}
            />
          </div>

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
            <label>Teléfono</label>
            <input
              type="tel"
              name="telefono"
              value={formulario.telefono}
              placeholder="+5215512345678"
              onChange={manejarCambio}
            />
          </div>

          <div className="campo">
            <label>Contraseña</label>
            <input
              type="password"
              name="contrasena"
              value={formulario.contrasena}
              placeholder="••••••••"
              onChange={manejarCambio}
            />
          </div>

          <button
            type="submit"
            disabled={!formulario.nombre || !formulario.correo || !formulario.contrasena || !formulario.telefono}
          >
            Registrarse
          </button>

          <p className="ir-a-login">
            ¿Ya tienes una cuenta?{" "}
            <span onClick={() => navigate("/")}>Inicia aquí</span>
          </p>
        </form>
      </div>
    </div>
  );
}