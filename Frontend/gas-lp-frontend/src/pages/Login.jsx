import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, obtenerPerfil } from "../services/authService";
import Lottie from "lottie-react";
import camionAnimacion from "../assets/animations/Delivery-Truck.json";
import "./Login.scss";

export default function Login() {
  const navigate = useNavigate();

  const [formulario, setFormulario] = useState({
    correo: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setFormulario({ ...formulario, [name]: value });
  };

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setError("");
    setCargando(true);

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
        navigate("/cliente");
      }
    } catch (err) {
      setError("Correo o contraseña incorrectos");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="login-contenedor">
      <div className="login-animacion">
        <Lottie animationData={camionAnimacion} loop speed={0.9}/>
        <p className="slogan">
          Distribuyendo energía <span>todos los días</span>
        </p>
      </div>

      <div className="login-tarjeta">
        <h1>Bienvenido</h1>

        <form onSubmit={manejarEnvio}>
          <div className="campo">
            <label>Correo electrónico</label>
            <input
              type="email"
              name="correo"
              value={formulario.correo}
              onChange={manejarCambio}
              placeholder="correo@ejemplo.com"
            />
          </div>

          <div className="campo">
            <label>Contraseña</label>
            <input
              type="password"
              name="password"
              value={formulario.password}
              onChange={manejarCambio}
              placeholder="••••••••"
            />
          </div>

          {error && <p className="error">{error}</p>}

          <button
            type="submit"
            disabled={
              cargando ||
              !formulario.correo ||
              !formulario.password
            }
          >
            {cargando ? "Entrando..." : "Entrar"}
          </button>

          <p className="ir-a-registrarse">
            ¿No tienes cuenta?{" "}
            <span onClick={() => navigate("/registrarse")}>
              Regístrate aquí
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}