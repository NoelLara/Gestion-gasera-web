import { useState } from "react";
import { FiX, FiTruck, FiUser, FiMapPin } from "react-icons/fi";
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

  const [errores, setErrores] = useState({
    nombre: "",
    inicio: "",
    final: "",
    unidades: "",
    vendedores: ""
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

  const validar = () => {
    let tempErrores = { nombre: "", inicio: "", final: "", unidades: "", vendedores: "" };
    let valido = true;

    if (!form.nombre.trim()) {
      tempErrores.nombre = "¡Debes poner un nombre para la ruta!";
      valido = false;
    }

    if (!form.inicio_calle.trim() || !form.inicio_numero.trim()) {
      tempErrores.inicio = "Completa la dirección de inicio";
      valido = false;
    }

    if (!form.final_calle.trim() || !form.final_numero.trim()) {
      tempErrores.final = "Completa la dirección final";
      valido = false;
    }

    if (!form.unidades_asignadas.length) {
      tempErrores.unidades = "Agrega al menos una unidad";
      valido = false;
    }

    if (!form.vendedores_asignados.length) {
      tempErrores.vendedores = "Agrega al menos un vendedor";
      valido = false;
    }

    setErrores(tempErrores);
    return valido;
  };

  const guardar = async () => {
    if (!validar()) return;

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
        <h3>Nueva Ruta</h3>

        <div className="grid">
          <div className="campo">
            <label>Nombre</label>
            <input
              placeholder="Ej: Ruta Centro"
              value={form.nombre}
              onChange={e => cambiar("nombre", e.target.value)}
            />
            {errores.nombre && <p className="error">{errores.nombre}</p>}
          </div>

          <div className="campo">
            <label>Dirección inicio</label>
            <input
              placeholder="Calle"
              value={form.inicio_calle}
              onChange={e => cambiar("inicio_calle", e.target.value)}
            />
            <input
              placeholder="Número"
              value={form.inicio_numero}
              onChange={e => cambiar("inicio_numero", e.target.value)}
            />
            {errores.inicio && <p className="error">{errores.inicio}</p>}
          </div>

          <div className="campo">
            <label>Dirección final</label>
            <input
              placeholder="Calle"
              value={form.final_calle}
              onChange={e => cambiar("final_calle", e.target.value)}
            />
            <input
              placeholder="Número"
              value={form.final_numero}
              onChange={e => cambiar("final_numero", e.target.value)}
            />
            {errores.final && <p className="error">{errores.final}</p>}
          </div>

          <div className="campo">
            <label><FiTruck /> Unidades</label>
            <div className="combobox">
              {form.unidades_asignadas.map(u => (
                <span key={`tag-unidad-${u.id}`} className="tag">
                  {u.nombre} <button type="button" onClick={() => removerUnidad(u.id)}><FiX /></button>
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
                  ))}
              </select>
            </div>
            {errores.unidades && <p className="error">{errores.unidades}</p>}
          </div>

          <div className="campo">
            <label><FiUser /> Vendedores</label>
            <div className="combobox">
              {form.vendedores_asignados.map(v => (
                <span key={`tag-vendedor-${v.id}`} className="tag">
                  {v.nombre} <button type="button" onClick={() => removerVendedor(v.id)}><FiX /></button>
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
                    const safeKey = v.id ?? `no-id-${index}`;
                    return (
                      <li key={`li-vendedor-${safeKey}`} onClick={() => agregarVendedor(v)}>
                        {v.nombre}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
            {errores.vendedores && <p className="error">{errores.vendedores}</p>}
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