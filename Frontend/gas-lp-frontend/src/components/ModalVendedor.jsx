import { useState } from "react";
import { emailRegex, phoneRegex } from "../utils/validadores";
import "./ModalVendedor.scss";

export default function ModalVendedor({ vendedor, onClose, onGuardar }) {
  const [form, setForm] = useState(
    vendedor || {
      nombre: "",
      telefono: "",
      correo: "",
      activo: true,
    }
  );

  const [errores, setErrores] = useState({});

  const validar = () => {
    const errs = {};

    if (!form.nombre.trim()) {
      errs.nombre = "El nombre es obligatorio";
    }

    if (!phoneRegex.test(form.telefono)) {
      errs.telefono = "El teléfono debe tener 10 dígitos";
    }

    if (!emailRegex.test(form.correo)) {
      errs.email = "Email no válido";
    }

    setErrores(errs);
    return Object.keys(errs).length === 0;
  };

  return (
    <div className="modal-overlay">
      <div className="modal-unidad">
        <h3>{vendedor ? "Editar vendedor" : "Nuevo vendedor"}</h3>

        <div className="grid">
          <div className="campo">
            <label>Nombre</label>
            <input
              value={form.nombre}
              onChange={e => setForm({ ...form, nombre: e.target.value })}
            />
            {errores.nombre && <small className="error">{errores.nombre}</small>}
          </div>

          <div className="campo">
            <label>Teléfono</label>
            <input
              value={form.telefono}
              onChange={e => setForm({ ...form, telefono: e.target.value })}
            />
            <small className="error">{errores.telefono}</small>
          </div>

          <div className="campo">
            <label>Correo</label>
            <input
              value={form.correo}
              onChange={e => setForm({ ...form, correo: e.target.value })}
            />
            {errores.email && <small className="error">{errores.email}</small>}
          </div>

          <div className="campo checkbox">
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
                {form.activo ? "Activo" : "Inactivo"}
                </span>
            </label>
            </div>
        </div>

        <div className="acciones">
          <button onClick={onClose}>Cancelar</button>
          <button className="guardar" onClick={() => {
            if (validar()) {
                onGuardar(form)}
            }
          }>
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}