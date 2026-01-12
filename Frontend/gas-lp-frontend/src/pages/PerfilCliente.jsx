import { useEffect, useState } from "react";
import { obtenerPerfil, actualizarPerfil } from "../services/authService";
import { phoneRegex, emailRegex } from "../utils/validadores";
import "./PerfilCliente.scss";

export default function PerfilCliente() {
  const [perfil, setPerfil] = useState({});
  const [passwords, setPasswords] = useState({
    actual: "",
    nueva: "",
    confirmacion: ""
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    cargar();
  }, []);

  const cargar = async () => {
    const data = await obtenerPerfil();
    setPerfil(data);
  };

  const validar = () => {
    if (!perfil.nombre?.trim()) {
      return "El nombre no puede estar vacío";
    }

    if (!phoneRegex.test(perfil.telefono || "")) {
      return "El teléfono debe tener 10 dígitos";
    }

    if (!emailRegex.test(perfil.correo || "")) {
      return "El correo no es válido";
    }

    const quiereCambiarPassword =
      passwords.actual || passwords.nueva || passwords.confirmacion;

    if (quiereCambiarPassword) {
      if (!passwords.actual || !passwords.nueva || !passwords.confirmacion) {
        return "Completa todos los campos de contraseña";
      }

      if (passwords.nueva.length < 6) {
        return "La contraseña nueva debe tener al menos 6 caracteres";
      }

      if (passwords.nueva !== passwords.confirmacion) {
        return "Las contraseñas no coinciden";
      }
    }

    return null;
  };

  const guardar = async () => {
    const errorValidacion = validar();
    if (errorValidacion) {
      setError(errorValidacion);
      setSuccess("");
      return;
    }

    const payload = {
      nombre: perfil.nombre,
      telefono: perfil.telefono,
      correo: perfil.correo
    };

    if (passwords.actual && passwords.nueva) {
      payload.contrasena_actual = passwords.actual;
      payload.contrasena_nueva = passwords.nueva;
    }

    try {
      await actualizarPerfil(payload);

      setPasswords({
        actual: "",
        nueva: "",
        confirmacion: ""
      });

      setError("");
      setSuccess("Perfil actualizado correctamente");
    } catch (err) {
      setSuccess("");
      setError(
        err.response?.data?.detail ||
        "Ocurrió un error inesperado"
      );
    }
  };

  return (
    <div className="perfil-cliente">
      <h2>Mi perfil</h2>

      <input
        value={perfil.correo || ""}
        onChange={e =>
          setPerfil({ ...perfil, correo: e.target.value })
        }
        placeholder="Correo"
      />

      <input
        value={perfil.nombre || ""}
        onChange={e =>
          setPerfil({ ...perfil, nombre: e.target.value })
        }
        placeholder="Nombre"
      />

      <input
        value={perfil.telefono || ""}
        onChange={e =>
          setPerfil({ ...perfil, telefono: e.target.value })
        }
        placeholder="Teléfono"
      />

      <hr />

      <input
        type="password"
        placeholder="Contraseña actual"
        value={passwords.actual}
        onChange={e =>
          setPasswords({ ...passwords, actual: e.target.value })
        }
      />

      <input
        type="password"
        placeholder="Nueva contraseña"
        value={passwords.nueva}
        onChange={e =>
          setPasswords({ ...passwords, nueva: e.target.value })
        }
      />

      <input
        type="password"
        placeholder="Confirmar nueva contraseña"
        value={passwords.confirmacion}
        onChange={e =>
          setPasswords({ ...passwords, confirmacion: e.target.value })
        }
      />

      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      <button onClick={guardar}>Guardar</button>
    </div>
  );
}