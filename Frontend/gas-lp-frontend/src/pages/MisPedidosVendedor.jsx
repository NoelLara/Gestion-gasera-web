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

  const cambiarEstado = async (pedido, estado) => {
    const data = {
      estado,
      idVendedor: pedido.idVendedor,
      idUnidad: pedido.idUnidad,
      tipoVenta: pedido.tipoPedido,
      precioTotal: pedido.precioTotal,
      cilindros: pedido.cilindros ?? undefined,
      litros: pedido.litros ?? undefined,
      idPedido: pedido.idPedido,
      idCliente: pedido.idCliente ?? undefined,
      clientePublico: pedido.clientePublico ?? undefined,
      idRuta: pedido.idRuta ?? undefined,
    };

    console.log("🚀 Enviando datos completos a backend:", data);

    await actualizarEstadoPedido(pedido.idPedido, estado, data);

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
            <th>Cantidad</th>
            <th>Precio</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {pedidos.length === 0 && (
            <tr>
              <td colSpan="4" style={{ textAlign: "center" }}>
                No tienes pedidos asignados
              </td>
            </tr>
          )}

          {pedidos.map(p => (
            <tr key={p.idPedido}>
              <td>{p.cliente ?? "Cliente"}</td>
              <td>{p.direccion}</td>

              <td>
                {p.cilindros
                  ? p.cilindros.reduce((sum, c) => sum + c.cantidad, 0)
                  : p.litros}
              </td>

              <td>${p.precioTotal}</td>

              <td className={`estado ${p.estado}`}>{p.estado}</td>

              <td>
                {p.estado === "asignado" && (
                  <div className="acciones-pedido">
                    <button
                      className="btn-atender"
                      onClick={() => cambiarEstado(p, "atendido")}
                    >
                      Atendido
                    </button>

                    <button
                      className="btn-cancelar"
                      onClick={() => cambiarEstado(p.idPedido, "cancelado")}
                    >
                      Cancelar
                    </button>

                    <button
                      className="btn-ruta"
                      onClick={async () => {
                        const res = await obtenerRuta(p.idRuta);
                        setRutaSeleccionada(res.data);
                      }}
                    >
                      Ver ruta
                    </button>
                  </div>
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