import { useEffect, useState } from "react";
import { getPedidosVendedor, actualizarEstadoPedido} from "../services/pedidosService";
import { getPedidosDelVendedorLogueado } from "../services/vendedoresService";
import ModalMapaRuta from "../components/ModalMapaRuta";
import { obtenerRuta } from "../services/rutasService";
import "./Pedidos.scss";

export default function MisPedidosVendedor() {
  const [pedidos, setPedidos] = useState([]);
  const [rutaSeleccionada, setRutaSeleccionada] = useState(null);

  useEffect(() => {
    const cargar = async () => {
      const res = await getPedidosDelVendedorLogueado();
      setPedidos(res.data);
    };

    cargar();
  }, []);

  const cambiarEstado = async (idPedido, estado) => {
    await actualizarEstadoPedido(idPedido, estado);

    const res = await getPedidosDelVendedorLogueado();
    setPedidos(res.data);
  };

  return (
    <div className="pedidos-page pedidos-vendedor">
      <h2>📦 Mis pedidos</h2>

      <table className="tabla-pedidos">
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Dirección</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {pedidos.length === 0 && (
            <tr>
              <td colSpan="4" style={{ textAlign: "center" }}>
                No tienes pedidos asignados 💤
              </td>
            </tr>
          )}

          {pedidos.map(p => (
            <tr key={p.idPedido}>
              <td>{p.cliente}</td>
              <td>{p.direccion}</td>
              <td className={`estado ${p.estado}`}>{p.estado}</td>
              <td>
                {p.estado === "asignado" && (
                  <>
                    <button
                      className="boton-asignar"
                      onClick={() => cambiarEstado(p.idPedido, "atendido")}
                    >
                      ✅ Atendido
                    </button>

                    <button
                      className="boton-cancelar"
                      onClick={() => cambiarEstado(p.idPedido, "cancelado")}
                    >
                      ❌ Cancelar
                    </button>

                    <button
                      className="boton-asignar"
                      onClick={async () => {
                        const res = await obtenerRuta(p.idRuta);
                        setRutaSeleccionada(res.data);
                      }}
                    >
                      🗺️ Ver ruta
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {rutaSeleccionada && (
        <ModalMapaRuta
          ruta={rutaSeleccionada}
          onClose={() => setRutaSeleccionada(null)}
        />
      )}
    </div>
  );
}