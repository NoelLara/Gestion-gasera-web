import { useState } from "react";
import { obtenerCoordenadas } from "../utils/geocoding";
import "./ModalEditarRuta.scss";

export default function ModalAgregarRuta({ onClose, onGuardar }) {
  const [form, setForm] = useState({
    nombre: "",
    inicio_calle: "",
    inicio_numero: "",
    final_calle: "",
    final_numero: "",
    unidades: "",
    vendedores: "",
    clientes: ""
  });

  const cambiar = (campo, valor) => {
    setForm({ ...form, [campo]: valor });
  };

  const guardar = async () => {
    const inicio = await obtenerCoordenadas(
      `${form.inicio_calle} ${form.inicio_numero}, Xalapa, Veracruz, México`
    );
    const fin = await obtenerCoordenadas(
      `${form.final_calle} ${form.final_numero}, Xalapa, Veracruz, México`
    );

    const nuevaRuta = {
      nombre: form.nombre,
      direccion_inicial: { ...inicio, calle: form.inicio_calle, numero: form.inicio_numero },
      direccion_final: { ...fin, calle: form.final_calle, numero: form.final_numero },
      puntos_intermedios: [],
      unidades_asignadas: form.unidades.split(",").map(n => Number(n.trim())),
      vendedores_asignados: form.vendedores.split(",").map(n => Number(n.trim())),
      clientes_pendientes: form.clientes.split(",").map(n => Number(n.trim()))
    };

    try {
      const res = await crearRuta(nuevaRuta);
      onGuardar(res.data || res);
      onClose();
    } catch (err) {
      console.error("Error creando ruta:", err);
      alert("No se pudo crear la ruta");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-editar">
        <h3>➕ Nueva Ruta</h3>

        <div className="grid">
          <div className="campo">
            <label>Nombre</label>
            <input onChange={e => cambiar("nombre", e.target.value)} />
          </div>

          <div className="campo">
            <label>Calle inicio</label>
            <input onChange={e => cambiar("inicio_calle", e.target.value)} />
          </div>

          <div className="campo">
            <label>Número inicio</label>
            <input onChange={e => cambiar("inicio_numero", e.target.value)} />
          </div>

          <div className="campo">
            <label>Calle final</label>
            <input onChange={e => cambiar("final_calle", e.target.value)} />
          </div>

          <div className="campo">
            <label>Número final</label>
            <input onChange={e => cambiar("final_numero", e.target.value)} />
          </div>

          <div className="campo">
            <label>🚚 Unidades</label>
            <input placeholder="1,2,3" onChange={e => cambiar("unidades", e.target.value)} />
          </div>

          <div className="campo">
            <label>🧑‍💼 Vendedores</label>
            <input placeholder="5,7" onChange={e => cambiar("vendedores", e.target.value)} />
          </div>

          <div className="campo">
            <label>⏳ Clientes pendientes</label>
            <input placeholder="10,11" onChange={e => cambiar("clientes", e.target.value)} />
          </div>
        </div>

        <div className="acciones">
          <button onClick={onClose}>Cancelar</button>
          <button className="guardar" onClick={guardar}>
            Crear ruta
          </button>
        </div>
      </div>
    </div>
  );
}