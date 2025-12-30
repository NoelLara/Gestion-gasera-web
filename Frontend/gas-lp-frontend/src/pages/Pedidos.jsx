import { useEffect, useState } from "react";
import { getPedidos } from "../services/pedidosService";
import ModalAsignarPedido from "../components/ModalAsignarPedido";
import ModalCambiarEstado from "../components/ModalCambiarEstadoPedido";
import "./Pedidos.scss";

export default function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [pedidoAsignar, setPedidoAsignar] = useState(null);
  const [pedidoEstado, setPedidoEstado] = useState(null);
  const [loading, setLoading] = useState(true);

  const cargar = async () => {
    try {
      setLoading(true);
      const res = await getPedidos();

      const lista = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.data?.data)
        ? res.data.data
        : [];

      setPedidos(lista);
    } catch (e) {
      console.error("Error cargando pedidos", e);
      setPedidos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const nombreCliente = (p) =>
    p.clientePublico
      ? p.clientePublico.nombre
      : `Cliente #${p.idCliente}`;

  if (loading) {
    return <p style={{ padding: "1rem" }}>⏳ Cargando pedidos...</p>;
  }

  return (
    <div className="pedidos-page">
      <h2>📦 Pedidos</h2>

      <table className="tabla-pedidos">
        <thead>
          <tr>
            <th>ID</th>
            <th>Cliente</th>
            <th>Tipo</th>
            <th>Cant.</th>
            <th>Precio</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {(pedidos || []).length === 0 && (
            <tr>
              <td colSpan="7" style={{ textAlign: "center" }}>
                😿 No hay pedidos
              </td>
            </tr>
          )}

          {(pedidos || []).map((p) => (
            <tr key={p.idPedido}>
              <td>{p.idPedido}</td>
              <td>{nombreCliente(p)}</td>
              <td>{p.tipoPedido}</td>
              <td>
                {p.tipoPedido === "cilindro"
                  ? `${p.cantidad} cilindros`
                  : `${p.litros} L`}
              </td>
              <td>${p.precioTotal}</td>
              <td className={`estado ${p.estado}`}>{p.estado}</td>
              <td>
                {p.estado === "pendiente" && (
                  <button onClick={() => setPedidoAsignar(p)}>
                    Asignar
                  </button>
                )}
                {p.estado === "asignado" && (
                  <button onClick={() => setPedidoEstado(p)}>
                    Atender
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {pedidoAsignar && (
        <ModalAsignarPedido
          pedido={pedidoAsignar}
          onClose={() => setPedidoAsignar(null)}
          onSuccess={cargar}
        />
      )}

      {pedidoEstado && (
        <ModalCambiarEstado
          pedido={pedidoEstado}
          onClose={() => setPedidoEstado(null)}
          onSuccess={cargar}
        />
      )}
    </div>
  );
}