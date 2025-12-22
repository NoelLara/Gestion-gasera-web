import { useState } from "react";
import "./ModalUnidad.scss";

export default function ModalAgregarUnidad({ onClose, onGuardar }) {
  const [form, setForm] = useState({
    numero_economico: "",
    tipo: "pipa",
    capacidad_litros: "",
    activo: true
  });

  const cambiar = (campo, valor) => {
    setForm({ ...form, [campo]: valor });
  };

  const guardar = () => {
    onGuardar({
      ...form,
      capacidad_litros: Number(form.capacidad_litros)
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-unidad horizontal">
        <h3>➕ Agregar unidad</h3>

        <div className="grid">
          <div className="campo">
            <label>Número económico</label>
            <input
              placeholder="ABC-123"
              onChange={e => cambiar("numero_economico", e.target.value)}
            />
          </div>

          <div className="campo">
            <label>Tipo</label>
            <select onChange={e => cambiar("tipo", e.target.value)}>
              <option value="pipa">Pipa</option>
              <option value="camion">Camión</option>
              <option value="camioneta">Camioneta</option>
            </select>
          </div>

          <div className="campo">
            <label>Capacidad (litros)</label>
            <input
              type="number"
              onChange={e => cambiar("capacidad_litros", e.target.value)}
            />
          </div>
        </div>

        <div className="acciones">
          <button onClick={onClose}>Cancelar</button>
          <button className="guardar" onClick={guardar}>
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}