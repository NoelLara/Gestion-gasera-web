import { useEffect, useState } from "react";
import { getPedidosVendedor, actualizarEstadoPedido} from "../services/pedidosService";
import { getPedidosDelVendedorLogueado } from "../services/vendedoresService";
import ModalMapaRuta from "../components/ModalMapaRuta";
import ModalConfirm from "../components/ModalConfirm";
import { obtenerRuta } from "../services/rutasService";
import "./Pedidos.scss";

export default function MisPedidosVendedor() {
  const [pedidos, setPedidos] = useState([]);
  const [rutaSeleccionada, setRutaSeleccionada] = useState(null);
  const [modal, setModal] = useState({ visible: false, mensaje: "", tipo: "info", onConfirm: null, onCancel: null });

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

  const cancelarPedidoConModal = (pedido) => {
    setModal({
      visible: true,
      mensaje: `¿Seguro que quieres cancelar el pedido #${pedido.idPedido}?`,
      tipo: "info",
      onConfirm: async () => {
        try {
          await cambiarEstado(pedido, "cancelado");
        } catch (err) {
          setModal({
            visible: true,
            mensaje: "No se pudo cancelar el pedido",
            tipo: "error",
          });
        } finally {
          setModal({ ...modal, visible: false });
        }
      },
      onCancel: () => setModal({ ...modal, visible: false }),
    });
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
                      onClick={() => cancelarPedidoConModal(p)}
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

      {modal.visible && (
        <ModalConfirm
          mensaje={modal.mensaje}
          tipo={modal.tipo}
          onConfirm={modal.onConfirm}
          onCancel={modal.onCancel}
          onClose={() => setModal({ ...modal, visible: false })}
        />
      )}
    </div>
  );
}