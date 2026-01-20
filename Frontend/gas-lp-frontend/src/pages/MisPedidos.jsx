import { useEffect, useState } from "react";
import { getPedidosCliente, cancelarPedido } from "../services/pedidosService";
import ModalConfirm from "../components/ModalConfirm";
import { descargarTicketPorPedido } from "../services/ventasService";
import "./MisPedidos.scss";

export default function MisPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [modal, setModal] = useState({ visible: false, mensaje: "", tipo: "info", onConfirm: null });

  const perfil = JSON.parse(sessionStorage.getItem("perfil"));
  const idCliente = perfil?.id;

  useEffect(() => {
    if (idCliente) {
      cargar();
    }
  }, []);

  const cargar = async () => {
    const response = await getPedidosCliente(idCliente);
    setPedidos(response.data);
  };

  const cancelar = (idPedido) => {
    setModal({
      visible: true,
      mensaje: `¿Seguro que quieres cancelar este pedido?`,
      tipo: "info",
      onConfirm: async () => {
        try {
          await cancelarPedido(idPedido);
          cargar();
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

  const descargarTicket = async (idVenta) => {
    try {
      const res = await descargarTicketPorPedido(idVenta);

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `ticket_${idVenta}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("No se pudo descargar el ticket");
    }
  };

  const pedidosFiltrados = pedidos.filter(p =>
    filtroEstado === "todos" ? true : p.estado === filtroEstado
  );

  return (
    <>
      <h2>Mis pedidos</h2>

      <div className="filtros-pedidos">
        <label>Estado:</label>
        <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
          <option value="todos">Todos</option>
          <option value="pendiente">Pendientes</option>
          <option value="asignado">Asignados</option>
          <option value="atendido">Atendidos</option>
          <option value="cancelado">Cancelados</option>
        </select>
      </div>

      {pedidos.length === 0 && <p>No tienes pedidos aún</p>}

      {pedidosFiltrados.map(p => (
        <div key={p.idPedido} className="pedido-card">
          <div className="pedido-header">
            <span className={`estado ${p.estado}`}>{p.estado}</span>
            <span className="pedido-id">#{p.idPedido}</span>
          </div>

          <div className="pedido-body">
            <p className="direccion">📍 {p.direccion}</p>

            <div className="info">
              <span className="tipo">{p.tipoPedido}</span>
              <span className="cantidad">
                {p.tipoPedido === "cilindro"
                  ? (p.cilindros || []).map(c => `${c.cantidad}x${c.tipoCilindro}kg`).join(", ")
                  : `${p.litros} L`}
              </span>
            </div>
          </div>

          {p.estado === "pendiente" && (
            <button className="btn-cancelar" onClick={() => cancelar(p.idPedido)}>
              Cancelar pedido
            </button>
          )}
          {p.estado === "atendido" && (
            <button
              className="btn-ticket"
              onClick={() => descargarTicket(p.idPedido)}
            >
              🧾 Descargar ticket
            </button>
          )}
        </div>
      ))}

      {modal.visible && (
        <ModalConfirm
          mensaje={modal.mensaje}
          tipo={modal.tipo}
          onClose={() => setModal({ ...modal, visible: false })}
          onConfirm={modal.onConfirm}
          onCancel={modal.onCancel}
        />
      )}
    </>
  );
}