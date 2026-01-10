import { useEffect, useState } from "react";
import "./AsignarUnidad.scss";
import {
  listarUnidades,
  listarVendedores,
  obtenerAsignacionesUnidad,
  asignarVendedorUnidad
} from "../services/asignarUnidadService";

export default function AsignarUnidad() {
  const [unidades, setUnidades] = useState([]);
  const [vendedores, setVendedores] = useState([]);
  const [unidadSeleccionada, setUnidadSeleccionada] = useState("");
  const [vendedorSeleccionado, setVendedorSeleccionado] = useState("");
  const [asignaciones, setAsignaciones] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [uRes, vRes] = await Promise.all([
        listarUnidades(),
        listarVendedores()
      ]);
      setUnidades(uRes.data);
      setVendedores(vRes.data);
    } catch (e) {
      console.error("Error cargando datos", e);
    }
  };

  const cargarAsignaciones = async (idUnidad) => {
    try {
      setLoading(true);
      const res = await obtenerAsignacionesUnidad(idUnidad);
      setAsignaciones(res.data);
    } catch (e) {
      console.error("Error cargando asignaciones", e);
    } finally {
      setLoading(false);
    }
  };

  const seleccionarUnidad = (e) => {
    const id = e.target.value;
    setUnidadSeleccionada(id);
    setAsignaciones([]);
    if (id) cargarAsignaciones(id);
  };

  const asignar = async () => {
    if (!unidadSeleccionada || !vendedorSeleccionado) return;

    try {
      await asignarVendedorUnidad(unidadSeleccionada, vendedorSeleccionado);
      setVendedorSeleccionado("");
      cargarAsignaciones(unidadSeleccionada);
      alert("Vendedor asignado correctamente");
    } catch (e) {
      console.error(e);
      alert("No se pudo asignar el vendedor");
    }
  };

  return (
    <div className="asignar-unidad">
      <h2>Asignar vendedores a unidad</h2>

      <div className="form-asignacion">
        <div className="campo">
          <label>Unidad</label>
          <select value={unidadSeleccionada} onChange={seleccionarUnidad}>
            <option value="">Selecciona una unidad</option>
            {unidades.map((u) => (
              <option key={u.id} value={u.id}>
                {u.unidad.numero_economico} ({u.unidad.tipo})
              </option>
            ))}
          </select>
        </div>

        <div className="campo">
          <label>Vendedor</label>
          <select
            value={vendedorSeleccionado}
            onChange={(e) => setVendedorSeleccionado(e.target.value)}
            disabled={!unidadSeleccionada}
          >
            <option value="">Selecciona un vendedor</option>
            {vendedores.map((v) => (
              <option key={v.idVendedor} value={v.idVendedor}>
                {v.nombre}
              </option>
            ))}
          </select>
        </div>

        <button onClick={asignar} disabled={!vendedorSeleccionado}>
          Asignar
        </button>
      </div>

      <div className="asignaciones">
        <h3>Vendedores asignados</h3>

        {loading && <p>Cargando asignaciones...</p>}

        {!loading && asignaciones.length === 0 && (
          <p>No hay vendedores asignados</p>
        )}

        <div className="asignaciones-lista">
          {asignaciones.map((a) => (
            <div className="asignacion-card" key={a.idAsignacion}>
              <strong>{a.nombreVendedor}</strong>
              <span>
                Desde: {new Date(a.fecha_inicio).toLocaleString()}
              </span>
              {!a.fecha_fin && (
                <span className="badge-activo">Activo</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
