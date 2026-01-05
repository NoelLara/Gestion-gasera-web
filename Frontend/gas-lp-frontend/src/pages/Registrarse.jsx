import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registrar } from "../services/authService";
import { emailRegex, phoneRegex } from "../utils/validadores";
import "./Registrarse.scss";

export default function Registrarse() {
  const navigate = useNavigate();

  const [formulario, setFormulario] = useState({
    nombre: "",
    correo: "",
    telefono: "",
    contrasena: "",
  });

  const [errores, setErrores] = useState({
    nombre: "",
    correo: "",
    telefono: "",
    contrasena: "",
  });

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setFormulario({ ...formulario, [name]: value });

    // Validaciones kawaii ✨
    let mensaje = "";

    switch(name) {
      case "nombre":
        if (!value.trim()) mensaje = "El nombre no puede estar vacío 😿";
        break;
      case "correo":
        if (!emailRegex.test(value)) mensaje = "Correo no válido 😵";
        break;
      case "telefono":
        if (!phoneRegex.test(value)) mensaje = "Teléfono debe tener 10 dígitos 😳";
        break;
      case "contrasena":
        if (value.length < 6) mensaje = "La contraseña debe tener al menos 6 caracteres 🥺";
        break;
    }

    setErrores({ ...errores, [name]: mensaje });
  };

  const formularioValido = () => {
    return (
      formulario.nombre &&
      formulario.correo &&
      formulario.telefono &&
      formulario.contrasena &&
      !errores.nombre &&
      !errores.correo &&
      !errores.telefono &&
      !errores.contrasena
    );
  };

  const manejarEnvio = async (e) => {
    e.preventDefault();

    if (!formularioValido()) {
      alert("Corrige los errores antes de enviar 😿");
      return;
    }

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
          {["nombre", "correo", "telefono", "contrasena"].map((campo) => (
            <div className="campo" key={campo}>
              <label>
                {campo === "nombre" && "Nombre completo"}
                {campo === "correo" && "Correo electrónico"}
                {campo === "telefono" && "Teléfono"}
                {campo === "contrasena" && "Contraseña"}
              </label>
              <input
                type={campo === "contrasena" ? "password" : campo === "telefono" ? "tel" : "text"}
                name={campo}
                value={formulario[campo]}
                placeholder={
                  campo === "nombre"
                    ? "Juan Pérez"
                    : campo === "correo"
                    ? "correo@ejemplo.com"
                    : campo === "telefono"
                    ? "5512345678"
                    : "••••••••"
                }
                onChange={manejarCambio}
              />
              {errores[campo] && <p className="error">{errores[campo]}</p>}
            </div>
          ))}

          <button type="submit" disabled={!formularioValido()}>
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