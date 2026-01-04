import { useState, useEffect } from "react";
import { obtenerCoordenadas } from "../utils/geocoding";
import "./ModalEditarRuta.scss";

export default function ModalAgregarRuta({
  onClose,
  onGuardar,
  unidadesDisponibles = [],
  vendedoresDisponibles = []
}) {
  const [form, setForm] = useState({
    nombre: "",
    inicio_calle: "",
    inicio_numero: "",
    final_calle: "",
    final_numero: "",
    unidades_asignadas: [],
    vendedor_busqueda: "",
    vendedores_asignados: []
  });

  const cambiar = (campo, valor) =>
    setForm(prev => ({ ...prev, [campo]: valor }));

  const agregarUnidad = (id) => {
    if (!id) return;
    const unidad = unidadesDisponibles.find(u => String(u.id) === String(id));
    if (unidad && !form.unidades_asignadas.some(u => String(u.id) === String(unidad.id))) {
      setForm(prev => ({
        ...prev,
        unidades_asignadas: [...prev.unidades_asignadas, unidad]
      }));
    }
  };

  const removerUnidad = (id) => {
    setForm(prev => ({
      ...prev,
      unidades_asignadas: prev.unidades_asignadas.filter(u => u.id !== id)
    }));
  };

  // --- VENDEDORES ---
  const agregarVendedor = (vendedor) => {
    if (!vendedor) return;
    if (!form.vendedores_asignados.some(v => v.id === vendedor.id)) {
      setForm(prev => ({
        ...prev,
        vendedores_asignados: [...prev.vendedores_asignados, vendedor],
        vendedor_busqueda: "" // limpia input para poder seguir seleccionando
      }));
    }
  };

  const removerVendedor = (id) => {
    setForm(prev => ({
      ...prev,
      vendedores_asignados: prev.vendedores_asignados.filter(v => v.id !== id)
    }));
  };

  const vendedoresFiltrados = vendedoresDisponibles.filter(
    v =>
      !form.vendedores_asignados.some(a => a.id === v.id) &&
      v.nombre.toLowerCase().includes(form.vendedor_busqueda.toLowerCase())
  );

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
      unidades_asignadas: form.unidades_asignadas.map(u => u.id),
      vendedores_asignados: form.vendedores_asignados.map(v => v.id),
      clientes_pendientes: []
    };

    onGuardar(nuevaRuta);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-editar">
        <h3>➕ Nueva Ruta</h3>

        <div className="grid">
          {/* Campos de dirección */}
          <div className="campo">
            <label>Nombre</label>
            <input placeholder="Ej: Ruta Centro" onChange={e => cambiar("nombre", e.target.value)} />
          </div>
          <div className="campo">
            <label>Calle inicio</label>
            <input placeholder="Ej: Av. Independencia" onChange={e => cambiar("inicio_calle", e.target.value)} />
          </div>
          <div className="campo">
            <label>Número inicio</label>
            <input placeholder="Ej: 123" onChange={e => cambiar("inicio_numero", e.target.value)} />
          </div>
          <div className="campo">
            <label>Calle final</label>
            <input placeholder="Ej: Calle Juárez" onChange={e => cambiar("final_calle", e.target.value)} />
          </div>
          <div className="campo">
            <label>Número final</label>
            <input placeholder="Ej: 456" onChange={e => cambiar("final_numero", e.target.value)} />
          </div>

          <div className="campo">
            <label>🚚 Unidades</label>
            <div className="combobox">
              {form.unidades_asignadas.map(u => (
                <span key={`tag-unidad-${u.id}`} className="tag">
                  {u.nombre} 
                  <button type="button" onClick={() => removerUnidad(u.id)}>×</button>
                </span>
              ))}

              <select
                value=""
                onChange={e => {
                  agregarUnidad(e.target.value);
                  e.target.value = "";
                }}
              >
                <option value="">Selecciona unidad...</option>
                {unidadesDisponibles
                  .filter(u => !form.unidades_asignadas.some(a => String(a.id) === String(u.id)))
                  .map(u => (
                    <option key={`option-unidad-${u.id}`} value={u.id}>{u.nombre}</option>
                  ))
                }
              </select>
            </div>
          </div>

          <div className="campo">
            <label>🧑‍💼 Vendedores</label>
            <div className="combobox">
              {form.vendedores_asignados.map(v => (
                <span key={`tag-vendedor-${v.id}`} className="tag">
                  {v.nombre} <button type="button" onClick={() => removerVendedor(v.id)}>×</button>
                </span>
              ))}
              <input
                placeholder="Escribe para filtrar..."
                value={form.vendedor_busqueda}
                onChange={e => cambiar("vendedor_busqueda", e.target.value)}
              />
              {vendedoresFiltrados.length > 0 && (
                <ul className="dropdown">
                  {vendedoresFiltrados.map((v, index) => {
                    const safeKey =
                      v.id !== undefined && v.id !== null
                        ? v.id
                        : `no-id-${index}`;

                    return (
                      <li
                        key={`li-vendedor-${safeKey}`}
                        onClick={() => agregarVendedor(v)}
                      >
                        {v.nombre}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

        </div>

        <div className="acciones">
          <button onClick={onClose}>Cancelar</button>
          <button className="guardar" onClick={guardar}>Crear ruta</button>
        </div>
      </div>
    </div>
  );
}