import { useState } from "react";
import { FiX, FiPlus } from "react-icons/fi";
import "./ModalUnidad.scss";

export default function ModalEditarUnidad({ unidad, onClose, onGuardar }) {
  const [form, setForm] = useState(unidad.unidad);

  const [errores, setErrores] = useState({
    numero_economico: "",
    capacidad_litros: "",
    cilindros: ""
  });

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

  const validar = () => {
    let tempErrores = { numero_economico: "", capacidad_litros: "", cilindros: "" };
    let valido = true;

    if (!form.numero_economico.trim()) {
      tempErrores.numero_economico = "¡Debes poner un número económico!";
      valido = false;
    }

    if (form.tipo === "pipa") {
      if (!form.capacidad_litros || Number(form.capacidad_litros) <= 0) {
        tempErrores.capacidad_litros = "Capacidad inválida, mínimo 1 litro";
        valido = false;
      }
    } else {
      if (!form.cilindros.length) {
        tempErrores.cilindros = "Agrega al menos un cilindro";
        valido = false;
      } else {
        form.cilindros.forEach((c, i) => {
          if (c.cantidad < 1) {
            tempErrores.cilindros = `Cilindro ${i + 1} debe tener al menos 1 unidad`;
            valido = false;
          }
          if (![10, 20, 30].includes(c.capacidad)) {
            tempErrores.cilindros = `Cilindro ${i + 1} tiene capacidad inválida`;
            valido = false;
          }
        });
      }
    }

    setErrores(tempErrores);
    return valido;
  };

  const guardar = () => {
    if (!validar()) return;
    onGuardar(form);
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
              onChange={e => setForm({ ...form, numero_economico: e.target.value })}
            />
            {errores.numero_economico && <p className="error">{errores.numero_economico}</p>}
          </div>

          {form.tipo === "pipa" && (
            <div className="campo">
              <label>Capacidad (litros)</label>
              <input
                type="number"
                value={form.capacidad_litros}
                onChange={e => setForm({ ...form, capacidad_litros: Number(e.target.value) })}
              />
              {errores.capacidad_litros && <p className="error">{errores.capacidad_litros}</p>}
            </div>
          )}

          <div className="campo estado">
            <label>Estado</label>
            <label className="switch">
              <input
                type="checkbox"
                checked={form.activo}
                onChange={e => setForm({ ...form, activo: e.target.checked })}
              />
              <span className="slider" />
              <span className="texto">{form.activo ? "Activa" : "Inactiva"}</span>
            </label>
          </div>
        </div>

        {form.tipo === "camion" && (
          <div className="seccion-cilindros">
            <h4>Cilindros</h4>

            {form.cilindros.map((c, i) => (
              <div key={i} className="fila-cilindro">
                <select
                  value={c.capacidad}
                  onChange={e => actualizarCilindro(i, "capacidad", Number(e.target.value))}
                >
                  <option value={10}>10 kg</option>
                  <option value={20}>20 kg</option>
                  <option value={30}>30 kg</option>
                </select>

                <input
                  type="number"
                  min="1"
                  value={c.cantidad}
                  onChange={e => actualizarCilindro(i, "cantidad", Number(e.target.value))}
                />

                <button type="button" onClick={() => eliminarCilindro(i)}>
                  <FiX />
                </button>
              </div>
            ))}

            {errores.cilindros && <p className="error">{errores.cilindros}</p>}

            <button className="agregar" onClick={agregarCilindro}>
              <FiPlus /> Agregar cilindro
            </button>
          </div>
        )}

        <div className="acciones">
          <button onClick={onClose}>Cancelar</button>
          <button className="guardar" onClick={guardar}>Guardar</button>
        </div>
      </div>
    </div>
  );
}