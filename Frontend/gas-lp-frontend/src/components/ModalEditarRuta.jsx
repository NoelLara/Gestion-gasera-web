import { useState } from "react";
import { obtenerCoordenadas } from "../utils/geocoding";
import "./ModalEditarRuta.scss";

export default function ModalEditarRuta({
  ruta,
  onClose,
  onGuardar,
  unidadesDisponibles = [],
  vendedoresDisponibles = []
}) {
  const [form, setForm] = useState({
    nombre: ruta.nombre,

    inicio_calle: ruta.direccion_inicial.calle,
    inicio_numero: ruta.direccion_inicial.numero,

    final_calle: ruta.direccion_final.calle,
    final_numero: ruta.direccion_final.numero,

    unidades_asignadas: unidadesDisponibles.filter(u =>
      ruta.unidades_asignadas.includes(u.id)
    ),

    vendedores_asignados: vendedoresDisponibles.filter(v =>
      ruta.vendedores_asignados.includes(v.id)
    ),

    vendedor_busqueda: ""
  });

  const cambiar = (campo, valor) =>
    setForm(prev => ({ ...prev, [campo]: valor }));

  const agregarUnidad = (id) => {
    if (!id) return;
    const unidad = unidadesDisponibles.find(u => u.id === id);
    if (unidad && !form.unidades_asignadas.some(u => u.id === unidad.id)) {
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

  const agregarVendedor = (vendedor) => {
    if (!vendedor) return;
    if (!form.vendedores_asignados.some(v => v.id === vendedor.id)) {
      setForm(prev => ({
        ...prev,
        vendedores_asignados: [...prev.vendedores_asignados, vendedor],
        vendedor_busqueda: ""
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

    const rutaEditada = {
      id: ruta.id,
      nombre: form.nombre,
      direccion_inicial: { ...inicio, calle: form.inicio_calle, numero: form.inicio_numero },
      direccion_final: { ...fin, calle: form.final_calle, numero: form.final_numero },
      puntos_intermedios: ruta.puntos_intermedios,
      unidades_asignadas: form.unidades_asignadas.map(u => String(u.id)),
      vendedores_asignados: form.vendedores_asignados.map(v => String(v.id)),
      clientes_pendientes: ruta.clientes_pendientes
    };

    onGuardar(rutaEditada);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-editar">
        <h3>✏️ Editar Ruta</h3>

        <div className="grid">

          <div className="campo">
            <label>Nombre</label>
            <input value={form.nombre} onChange={e => cambiar("nombre", e.target.value)} />
          </div>

          <div className="campo">
            <label>Calle inicio</label>
            <input value={form.inicio_calle} onChange={e => cambiar("inicio_calle", e.target.value)} />
          </div>

          <div className="campo">
            <label>Número inicio</label>
            <input value={form.inicio_numero} onChange={e => cambiar("inicio_numero", e.target.value)} />
          </div>

          <div className="campo">
            <label>Calle final</label>
            <input value={form.final_calle} onChange={e => cambiar("final_calle", e.target.value)} />
          </div>

          <div className="campo">
            <label>Número final</label>
            <input value={form.final_numero} onChange={e => cambiar("final_numero", e.target.value)} />
          </div>

          <div className="campo">
            <label>🚚 Unidades</label>
            <div className="combobox">
              {form.unidades_asignadas.map(u => (
                <span key={u.id} className="tag">
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
                  .filter(u => !form.unidades_asignadas.some(a => a.id === u.id))
                  .map(u => (
                    <option key={u.id} value={u.id}>{u.nombre}</option>
                  ))}
              </select>
            </div>
          </div>

          <div className="campo">
            <label>🧑‍💼 Vendedores</label>
            <div className="combobox">
              {form.vendedores_asignados.map(v => (
                <span key={v.id} className="tag">
                  {v.nombre}
                  <button type="button" onClick={() => removerVendedor(v.id)}>×</button>
                </span>
              ))}

              <input
                placeholder="Escribe para filtrar..."
                value={form.vendedor_busqueda}
                onChange={e => cambiar("vendedor_busqueda", e.target.value)}
              />

              {vendedoresFiltrados.length > 0 && (
                <ul className="dropdown">
                  {vendedoresFiltrados.map(v => (
                    <li key={v.id} onClick={() => agregarVendedor(v)}>
                      {v.nombre}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

        </div>

        <div className="acciones">
          <button onClick={onClose}>Cancelar</button>
          <button className="guardar" onClick={guardar}>Guardar cambios</button>
        </div>
      </div>
    </div>
  );
}