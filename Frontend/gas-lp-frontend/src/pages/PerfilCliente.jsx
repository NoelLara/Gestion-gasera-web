import { useEffect, useState } from "react";
import { obtenerPerfil, actualizarPerfil } from "../services/authService";
import "./PerfilCliente.scss";

export default function PerfilCliente() {
  const [perfil, setPerfil] = useState({});

  useEffect(() => {
    cargar();
  }, []);

  const cargar = async () => {
    const data = await obtenerPerfil();
    setPerfil(data);
  };

  const guardar = async () => {
    await actualizarPerfil(perfil.id, {
      nombre: perfil.nombre,
      telefono: perfil.telefono
    });
    alert("Perfil actualizado");
  };

  return (
    <div className="perfil-cliente">
      <h2>👤 Mi perfil</h2>

      <input
        value={perfil.nombre || ""}
        onChange={e => setPerfil({ ...perfil, nombre: e.target.value })}
      />

      <input
        value={perfil.telefono || ""}
        onChange={e => setPerfil({ ...perfil, telefono: e.target.value })}
      />

      <button onClick={guardar}>Guardar</button>
    </div>
  );
}