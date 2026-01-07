import { useState } from "react";
import "./ModalUnidad.scss";

export default function ModalAgregarUnidad({ onClose, onGuardar }) {
  const [tipo, setTipo] = useState("pipa");
  const [form, setForm] = useState({
    numero_economico: "",
    capacidad_litros: "",
    cilindros: [{ capacidad: 20, cantidad: 1 }],
    activo: true
  });

  const guardar = () => {
    if (tipo === "pipa") {
      onGuardar({
        tipo: "pipa",
        numero_economico: form.numero_economico,
        capacidad_litros: Number(form.capacidad_litros),
        activo: true
      });
    } else {
      onGuardar({
        tipo: "camion",
        numero_economico: form.numero_economico,
        cilindros: form.cilindros,
        activo: true
      });
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-unidad horizontal">
        <h3>➕ Agregar unidad</h3>

        <div className="grid">
          <div className="campo">
            <label>Número económico</label>
            <input
              onChange={e => setForm({ ...form, numero_economico: e.target.value })}
            />
          </div>

          <div className="campo">
            <label>Tipo</label>
            <select onChange={e => setTipo(e.target.value)}>
              <option value="pipa">Pipa</option>
              <option value="camion">Camión</option>
            </select>
          </div>

          {tipo === "pipa" && (
            <div className="campo">
              <label>Capacidad (litros)</label>
              <input
                type="number"
                onChange={e =>
                  setForm({ ...form, capacidad_litros: e.target.value })
                }
              />
            </div>
          )}
          {tipo === "camion" && (
            <div className="campo">
                <label>Cilindros</label>

                {form.cilindros.map((c, i) => (
                <div key={i} className="fila-cilindro">
                    <select
                    value={c.capacidad}
                    onChange={e => {
                        const nuevos = [...form.cilindros];
                        nuevos[i].capacidad = Number(e.target.value);
                        setForm({ ...form, cilindros: nuevos });
                    }}
                    >
                    <option value={10}>10 kg</option>
                    <option value={20}>20 kg</option>
                    <option value={30}>30 kg</option>
                    </select>

                    <input
                    type="number"
                    min={1}
                    value={c.cantidad}
                    onChange={e => {
                        const nuevos = [...form.cilindros];
                        nuevos[i].cantidad = Number(e.target.value);
                        setForm({ ...form, cilindros: nuevos });
                    }}
                    />

                    <button
                    type="button"
                    onClick={() => {
                        const nuevos = form.cilindros.filter((_, idx) => idx !== i);
                        setForm({ ...form, cilindros: nuevos });
                    }}
                    >
                    ❌
                    </button>
                </div>
                ))}

                <button type="button" onClick={() =>
                  setForm({...form, cilindros: [...form.cilindros, { capacidad: 20, cantidad: 1 }]
                  })
                }>
                Agregar cilindro
                </button>
            </div>
            )}
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