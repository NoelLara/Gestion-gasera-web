import { useState } from "react";
import "./ModalUnidad.scss";

export default function ModalEditarUnidad({ unidad, onClose, onGuardar }) {
  const [form, setForm] = useState(unidad);

  const cambiar = (campo, valor) => {
    setForm({ ...form, [campo]: valor });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-unidad horizontal">
        <h3>✏️ Editar unidad</h3>

        <div className="grid">
          <div className="campo">
            <label>Número económico</label>
            <input
              value={form.numero_economico || ""}
              onChange={e => cambiar("numero_economico", e.target.value)}
            />
          </div>

          <div className="campo">
            <label>Tipo</label>
            <select
              value={form.tipo}
              onChange={e => cambiar("tipo", e.target.value)}
            >
              <option value="pipa">Pipa</option>
              <option value="camion">Camión</option>
              <option value="camioneta">Camioneta</option>
            </select>
          </div>

          <div className="campo">
            <label>Capacidad (litros)</label>
            <input
              type="number"
              value={form.capacidad_litros}
              onChange={e => cambiar("capacidad_litros", e.target.value)}
            />
          </div>
        </div>

        <div className="acciones">
          <button onClick={onClose}>Cancelar</button>
          <button className="guardar" onClick={() => onGuardar(form)}>
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
}