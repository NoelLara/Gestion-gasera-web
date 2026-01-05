import { useState } from "react";
import { FiPlus, FiX } from "react-icons/fi";
import "./ModalUnidad.scss";

export default function ModalAgregarUnidad({ onClose, onGuardar }) {
  const [tipo, setTipo] = useState("pipa");
  const [form, setForm] = useState({
    numero_economico: "",
    capacidad_litros: "",
    cilindros: [{ capacidad: 20, cantidad: 1 }],
    activo: true
  });

  const [errores, setErrores] = useState({
    numero_economico: "",
    capacidad_litros: "",
    cilindros: ""
  });

  const validar = () => {
    let tempErrores = { numero_economico: "", capacidad_litros: "", cilindros: "" };
    let valido = true;

    if (!form.numero_economico.trim()) {
      tempErrores.numero_economico = "Debes poner un número económico";
      valido = false;
    }

    if (tipo === "pipa") {
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
        <h3><FiPlus /> Agregar unidad</h3>

        <div className="grid">
          <div className="campo">
            <label>Número económico</label>
            <input
              value={form.numero_economico}
              onChange={e => setForm({ ...form, numero_economico: e.target.value })}
            />
            {errores.numero_economico && <p className="error">{errores.numero_economico}</p>}
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
                value={form.capacidad_litros}
                onChange={e => setForm({ ...form, capacidad_litros: e.target.value })}
              />
              {errores.capacidad_litros && <p className="error">{errores.capacidad_litros}</p>}
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
                    <FiX />
                  </button>
                </div>
              ))}

              {errores.cilindros && <p className="error">{errores.cilindros}</p>}

              <button
                type="button"
                onClick={() =>
                  setForm({
                    ...form,
                    cilindros: [...form.cilindros, { capacidad: 20, cantidad: 1 }]
                  })
                }
              >
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