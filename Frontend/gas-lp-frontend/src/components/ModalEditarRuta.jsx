import { useState } from "react";
import { obtenerCoordenadas } from "../utils/geocoding";
import "./ModalEditarRuta.scss";

export default function ModalEditarRuta({ ruta, onClose, onGuardar }) {
  const [form, setForm] = useState({
    nombre: ruta.nombre,

    inicio_calle: ruta.direccion_inicial.calle,
    inicio_numero: ruta.direccion_inicial.numero,

    final_calle: ruta.direccion_final.calle,
    final_numero: ruta.direccion_final.numero,

    unidades: ruta.unidades_asignadas.join(", "),
    vendedores: ruta.vendedores_asignados.join(", "),
    clientes: ruta.clientes_pendientes.join(", ")
  });

  const cambiar = (campo, valor) => {
    setForm({ ...form, [campo]: valor });
  };

  const guardar = async () => {
    const inicio = await obtenerCoordenadas(`${form.inicio_calle} ${form.inicio_numero}, Xalapa, Veracruz, México`);
    const fin = await obtenerCoordenadas(`${form.final_calle} ${form.final_numero}, Xalapa, Veracruz, México`);

    const rutaEditada = {
      nombre: form.nombre,
      direccion_inicial: { ...inicio, calle: form.inicio_calle, numero: form.inicio_numero },
      direccion_final: { ...fin, calle: form.final_calle, numero: form.final_numero },
      puntos_intermedios: ruta.puntos_intermedios,
      unidades_asignadas: form.unidades.split(",").map(n => Number(n.trim())),
      vendedores_asignados: form.vendedores.split(",").map(n => Number(n.trim())),
      clientes_pendientes: form.clientes.split(",").map(n => Number(n.trim()))
    };

    try {
      const res = await actualizarRuta(ruta.id, rutaEditada);
      onGuardar(res.data || res);
      onClose();
    } catch (err) {
      console.error("Error actualizando ruta:", err);
      alert("No se pudo actualizar la ruta");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-editar">
        <h3>✏️ Editar Ruta</h3>

        <div className="grid">
          <div className="campo">
            <label>Nombre de la ruta</label>
            <input
              value={form.nombre}
              onChange={e => cambiar("nombre", e.target.value)}
            />
          </div>

          <div className="campo">
            <label>Calle inicio</label>
            <input
              value={form.inicio_calle}
              onChange={e => cambiar("inicio_calle", e.target.value)}
            />
          </div>

          <div className="campo">
            <label>Número inicio</label>
            <input
              value={form.inicio_numero}
              onChange={e => cambiar("inicio_numero", e.target.value)}
            />
          </div>

          <div className="campo">
            <label>Calle final</label>
            <input
              value={form.final_calle}
              onChange={e => cambiar("final_calle", e.target.value)}
            />
          </div>

          <div className="campo">
            <label>Número final</label>
            <input
              value={form.final_numero}
              onChange={e => cambiar("final_numero", e.target.value)}
            />
          </div>

          <div className="campo">
            <label>🚚 Unidades</label>
            <input
              placeholder="1,2,3"
              value={form.unidades}
              onChange={e => cambiar("unidades", e.target.value)}
            />
          </div>

          <div className="campo">
            <label>🧑‍💼 Vendedores</label>
            <input
              placeholder="5,7"
              value={form.vendedores}
              onChange={e => cambiar("vendedores", e.target.value)}
            />
          </div>

          <div className="campo">
            <label>⏳ Clientes pendientes</label>
            <input
              placeholder="10,11"
              value={form.clientes}
              onChange={e => cambiar("clientes", e.target.value)}
            />
          </div>
        </div>

        <div className="acciones">
          <button onClick={onClose}>Cancelar</button>
          <button className="guardar" onClick={guardar}>
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
}