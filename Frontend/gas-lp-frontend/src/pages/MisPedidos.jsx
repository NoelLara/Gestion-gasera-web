import { useEffect, useState } from "react";
import { getPedidosCliente, cancelarPedido } from "../services/pedidosService";
import "./MisPedidos.scss";

export default function MisPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState("todos");

  const idCliente = sessionStorage.getItem("idCliente");

  useEffect(() => {
    if (idCliente) {
      cargar();
    }
  }, []);

  const cargar = async () => {
    const response = await getPedidosCliente(idCliente);
    setPedidos(response.data);
  };

  const cancelar = async (idPedido) => {
    if (!window.confirm("¿Cancelar pedido? 😿")) return;
    await cancelarPedido(idPedido);
    cargar();
  };

  const pedidosFiltrados = pedidos.filter(p =>
    filtroEstado === "todos" ? true : p.estado === filtroEstado
  );

  return (
    <>
      <h2>📦 Mis pedidos</h2>

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
        </div>
      ))}
    </>
  );
}