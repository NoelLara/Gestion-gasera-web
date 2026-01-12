import { useEffect, useState } from "react";
import { getPedidos, cambiarEstadoPedido } from "../services/pedidosService";
import ModalAsignarPedido from "../components/ModalAsignarPedido";
import ModalConfirm from "../components/ModalConfirm";
import "./Pedidos.scss";

export default function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [pedidoAsignar, setPedidoAsignar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [ordenFecha, setOrdenFecha] = useState("recientes");
  const [modal, setModal] = useState({ visible: false, mensaje: "", tipo: "info", onConfirm: null, onCancel: null });

  const cargar = async () => {
    setLoading(true);

    const res = await getPedidos();
      console.log("PEDIDOS:", res.data);
    setPedidos(res.data);

    setLoading(false);
  };

  useEffect(() => {
    cargar();
  }, []);

  const nombreCliente = (p) =>
    p.cliente
      ?? p.clientePublico?.nombre
      ?? "Cliente";

  const cancelarPedido = (pedido) => {
    setModal({
      visible: true,
      mensaje: `¿Seguro que quieres cancelar este pedido?`,
      tipo: "info",
      onConfirm: async () => {
        try {
          await cambiarEstadoPedido(pedido.idPedido, "cancelado");
          cargar();
        } catch (err) {
          setModal({
            visible: true,
            mensaje: "No se pudo cancelar el pedido",
            tipo: "error",
            onConfirm: null,
            onCancel: () => setModal({ ...modal, visible: false }),
          });
          return;
        }
        setModal({ ...modal, visible: false });
      },
      onCancel: () => setModal({ ...modal, visible: false }),
    });
  };

  if (loading) {
    return <p style={{ padding: "1rem" }}>Cargando pedidos...</p>;
  }

  const pedidosFiltrados = pedidos
    .filter(p =>
      filtroEstado === "todos" ? true : p.estado === filtroEstado
    )
    .sort((a, b) => {
      const fechaA = new Date(a.fechaCreacion);
      const fechaB = new Date(b.fechaCreacion);
      return ordenFecha === "recientes"
        ? fechaB - fechaA
        : fechaA - fechaB;
    });

  return (
    <div className="pedidos-page">
      <h2>📦 Pedidos</h2>

      <div className="filtros-pedidos">
        <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
          <option value="todos">Todos</option>
          <option value="pendiente">Pendiente</option>
          <option value="asignado">Asignado</option>
          <option value="atendido">Atendido</option>
          <option value="cancelado">Cancelado</option>
        </select>

        <select value={ordenFecha} onChange={e => setOrdenFecha(e.target.value)}>
          <option value="recientes">Más recientes</option>
          <option value="antiguos">Más antiguos</option>
        </select>
      </div>

      <table className="tabla-pedidos">
        <thead>
          <tr>
            <th>ID</th>
            <th>Cliente</th>
            <th>Dirección</th>
            <th>Tipo</th>
            <th>Cant.</th>
            <th>Precio</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {pedidosFiltrados.length === 0 && (
            <tr>
              <td colSpan="8" style={{ textAlign: "center" }}>
                No hay pedidos
              </td>
            </tr>
          )}

          {pedidosFiltrados.map(p => (
            <tr key={p.idPedido}>
              <td>{p.idPedido}</td>
              <td>{nombreCliente(p)}</td>
              <td>{p.direccion}</td>
              <td>{p.tipoPedido}</td>
              <td>
                {p.tipoPedido === "cilindro"
                  ? (p.cilindros || [])
                      .map(c => `${c.cantidad}x${c.tipoCilindro}kg`)
                      .join(", ")
                  : `${p.litros} L`}
              </td>
              <td>${p.precioTotal}</td>
              <td className={`estado ${p.estado}`}>{p.estado}</td>
              <td className="acciones">
                {p.estado === "pendiente" && (
                  <>
                    <button className="boton-asignar" 
                      onClick={() => setPedidoAsignar(p)}>
                      Asignar
                    </button>
                    <button
                      className="boton-cancelar"
                      onClick={() => cancelarPedido(p)}
                    >
                      Cancelar
                    </button>
                  </>
                )}

                {p.estado === "asignado" && (
                  <span>En ruta</span>
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

      {modal.visible && (
        <ModalConfirm
          mensaje={modal.mensaje}
          tipo={modal.tipo}
          onConfirm={modal.onConfirm}
          onCancel={modal.onCancel}
        />
      )}
    </div>
  );
}