import { useEffect, useState } from "react";
import {
  getMiPerfil,
  actualizarMiPerfilVendedor
} from "../services/vendedoresService";

export default function PerfilVendedor() {
  const [perfil, setPerfil] = useState({});

  useEffect(() => {
    cargar();
  }, []);

  const cargar = async () => {
    const res = await getMiPerfil();
    setPerfil(res.data);

    sessionStorage.setItem("perfil", JSON.stringify(res.data));
  };

  const guardar = async () => {
    await actualizarMiPerfilVendedor({
      nombre: perfil.nombre,
      telefono: perfil.telefono
    });

    alert("Perfil actualizado ✨");
  };

  return (
    <div className="perfil-vendedor">
      <h2>🧑‍💼 Mi perfil de vendedor</h2>

      <input value={perfil.correo || ""} disabled />

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