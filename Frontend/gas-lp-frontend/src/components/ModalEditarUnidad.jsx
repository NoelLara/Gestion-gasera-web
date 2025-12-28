import { useState } from "react";
import "./ModalUnidad.scss";

export default function ModalEditarUnidad({ unidad, onClose, onGuardar }) {
  const [form, setForm] = useState(unidad.unidad);

  const actualizarCilindro = (index, campo, valor) => {
    const nuevos = [...form.cilindros];
    nuevos[index] = { ...nuevos[index], [campo]: valor };
    setForm({ ...form, cilindros: nuevos });
  };

  const agregarCilindro = () => {
    setForm({
      ...form,
      cilindros: [...form.cilindros, { capacidad: 20, cantidad: 1 }]
    });
  };

  const eliminarCilindro = index => {
    setForm({
      ...form,
      cilindros: form.cilindros.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-unidad horizontal">
        <h3>✏️ Editar unidad</h3>

        <div className="grid">
          {/* Número económico */}
          <div className="campo">
            <label>Número económico</label>
            <input
              value={form.numero_economico || ""}
              onChange={e =>
                setForm({ ...form, numero_economico: e.target.value })
              }
            />
          </div>

          {/* PIPA */}
          {form.tipo === "pipa" && (
            <div className="campo">
              <label>Capacidad (litros)</label>
              <input
                type="number"
                value={form.capacidad_litros}
                onChange={e =>
                  setForm({
                    ...form,
                    capacidad_litros: Number(e.target.value)
                  })
                }
              />
            </div>
          )}

          {/* ESTADO */}
          <div className="campo estado">
            <label>Estado</label>
            <label className="switch">
              <input
                type="checkbox"
                checked={form.activo}
                onChange={e =>
                  setForm({ ...form, activo: e.target.checked })
                }
              />
              <span className="slider" />
              <span className="texto">
                {form.activo ? "Activa" : "Inactiva"}
              </span>
            </label>
          </div>
        </div>

        {/* 🚚 CAMIÓN */}
        {form.tipo === "camion" && (
          <div className="seccion-cilindros">
            <h4>🛢️ Cilindros</h4>

            {form.cilindros.map((c, i) => (
              <div key={i} className="fila-cilindro">
                <select
                  value={c.capacidad}
                  onChange={e =>
                    actualizarCilindro(i, "capacidad", Number(e.target.value))
                  }
                >
                  <option value={10}>10 kg</option>
                  <option value={20}>20 kg</option>
                  <option value={30}>30 kg</option>
                </select>

                <input
                  type="number"
                  min="1"
                  value={c.cantidad}
                  onChange={e =>
                    actualizarCilindro(i, "cantidad", Number(e.target.value))
                  }
                />
                <button onClick={() => eliminarCilindro(i)}>✖</button>
              </div>
            ))}

            <button className="agregar" onClick={agregarCilindro}>
              Agregar cilindro
            </button>
          </div>
        )}

        <div className="acciones">
          <button onClick={onClose}>Cancelar</button>
          <button className="guardar" onClick={() => onGuardar(form)}>
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}