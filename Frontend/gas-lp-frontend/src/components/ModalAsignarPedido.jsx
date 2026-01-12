import { useEffect, useState } from "react";
import { obtenerRutas } from "../services/rutasService";
import { asignarPedido } from "../services/pedidosService";
import { obtenerUnidades } from "../services/unidadesService";
import { getVendedores } from "../services/vendedoresService";
import "./ModalAsignarPedido.scss";

export default function ModalAsignarPedido({ pedido, onClose, onSuccess }) {
  const [rutas, setRutas] = useState([]);
  const [rutaSeleccionada, setRutaSeleccionada] = useState(null);
  const [unidad, setUnidad] = useState("");
  const [vendedor, setVendedor] = useState("");
  const [loading, setLoading] = useState(true);

  const [mapaUnidades, setMapaUnidades] = useState({});
  const [mapaVendedores, setMapaVendedores] = useState({});

  useEffect(() => {
    const cargarTodo = async () => {
      try {
        const token = sessionStorage.getItem("token");

        const [rRes, unidadesJson, vRes] = await Promise.all([
          obtenerRutas(),
          obtenerUnidades(token),
          getVendedores()
        ]);

        setRutas(rRes.data);

        const uMap = {};
        unidadesJson.forEach(u => {
          uMap[String(u.id)] = u.unidad.numero_economico ?? `Unidad #${u.id}`;
        });

        const vMap = {};
        vRes.data.forEach(v => {
          vMap[String(v.idVendedor)] = v.nombre;
        });

        setMapaUnidades(uMap);
        setMapaVendedores(vMap);
      } catch (e) {
        console.error(e);
        alert("Error cargando datos");
      } finally {
        setLoading(false);
      }
    };

    cargarTodo();
  }, []);

  const seleccionarRuta = (e) => {
    const ruta = rutas.find(r => r.id === e.target.value);
    setRutaSeleccionada(ruta);
    setUnidad("");
    setVendedor("");
  };

  const guardar = async () => {
    if (!rutaSeleccionada || !unidad || !vendedor) {
      alert("Selecciona ruta, unidad y vendedor");
      return;
    }

    try {
      await asignarPedido(pedido.idPedido, {
        idRuta: rutaSeleccionada.id,
        idUnidad: unidad,
        idVendedor: Number(vendedor)
      });

      onSuccess();
      onClose();
    } catch {
      alert("No se pudo asignar el pedido");
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>Asignar pedido #{pedido.idPedido}</h3>

        {loading ? (
          <p>Cargando rutas...</p>
        ) : (
          <>
            <select value={rutaSeleccionada?.id ?? ""} onChange={seleccionarRuta}>
              <option value="">Selecciona una ruta</option>
              {rutas.map(r => (
                <option key={r.id} value={r.id}>
                  {r.nombre}
                </option>
              ))}
            </select>

            {rutaSeleccionada && (
              <>
                <select value={unidad} onChange={e => setUnidad(e.target.value)}>
                  <option value="">Unidad</option>
                    {[...new Set(rutaSeleccionada.unidades_asignadas.map(String))].map(u => (
                      <option key={`unidad-${u}`} value={u}>
                        {mapaUnidades[u] ?? `Unidad #${u}`}
                      </option>
                    ))}
                </select>

                <select value={vendedor} onChange={e => setVendedor(e.target.value)}>
                  <option value="">Vendedor</option>
                    {[...new Set(rutaSeleccionada.vendedores_asignados.map(String))].map(v => (
                      <option key={`vendedor-${v}`} value={v}>
                        👤 {mapaVendedores[v] ?? `Vendedor #${v}`}
                      </option>
                    ))}
                </select>
              </>
            )}

            <div className="acciones">
              <button onClick={guardar}>💾 Asignar</button>
              <button className="cancelar" onClick={onClose}>
                Cancelar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}