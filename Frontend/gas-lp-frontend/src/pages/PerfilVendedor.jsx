import { useEffect, useState } from "react";
import { getMiPerfil, actualizarMiPerfilVendedor } from "../services/vendedoresService";
import { phoneRegex } from "../utils/validadores";
import "./PerfilVendedor.scss";

export default function PerfilVendedor() {
  const [perfil, setPerfil] = useState({});
  const [passwords, setPasswords] = useState({
    actual: "",
    nueva: "",
    confirmacion: ""
  });
  const [error, setError] = useState("");
	const [mensajeExito, setMensajeExito] = useState("");

  const validar = () => {
    if (!perfil.nombre?.trim()) {
        return "El nombre no puede estar vacío";
    }

    if (!phoneRegex.test(perfil.telefono || "")) {
        return "El teléfono debe tener 10 dígitos";
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

  useEffect(() => {
    cargar();
  }, []);

  const cargar = async () => {
    const res = await getMiPerfil();
    setPerfil(res.data);

    sessionStorage.setItem("perfil", JSON.stringify(res.data));
  };

	const guardar = async () => {
		const errorValidacion = validar();
		if (errorValidacion) {
			setError(errorValidacion);
			return;
		}

		setError("");

		const payload = {
			nombre: perfil.nombre,
			telefono: perfil.telefono
		};

		if (passwords.actual && passwords.nueva) {
			payload.contrasena_actual = passwords.actual;
			payload.contrasena_nueva = passwords.nueva;
		}

		try {
			await actualizarMiPerfilVendedor(payload);

			setPasswords({
				actual: "",
				nueva: "",
				confirmacion: ""
			});

			setError("");
			setMensajeExito("Perfil actualizado correctamente");
		} catch (err) {
			const mensaje =
				err.response?.data?.detail ||
				"Ocurrió un error inesperado";

			setError(mensaje);
		}
	};

  return (
    <div className="perfil-vendedor">
      <h2>Mi perfil</h2>

      <input value={perfil.correo || ""} disabled />

      <input
        value={perfil.nombre || ""}
        onChange={e => setPerfil({ ...perfil, nombre: e.target.value })}
      />

      <input
        value={perfil.telefono || ""}
        onChange={e => setPerfil({ ...perfil, telefono: e.target.value })}
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
			{mensajeExito && <p className="exito">{mensajeExito}</p>}
      <button onClick={guardar}>Guardar</button>
    </div>
  );
}