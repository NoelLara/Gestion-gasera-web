import { useEffect, useState } from "react";
import { getPedidos } from "../services/pedidosService";
import { getClientes } from "../services/clientesService";
import ModalAsignarPedido from "../components/ModalAsignarPedido";
import ModalCambiarEstado from "../components/ModalCambiarEstadoPedido";
import "./Pedidos.scss";

export default function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [pedidoAsignar, setPedidoAsignar] = useState(null);
  const [pedidoEstado, setPedidoEstado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clientes, setClientes] = useState({});
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [ordenFecha, setOrdenFecha] = useState("recientes");

  const cargar = async () => {
    setLoading(true);

    const res = await getPedidos();
    const pedidos = res.data;

    const clientesRes = await getClientes();

    const mapa = {};
    clientesRes.forEach(c => {
      mapa[c.id] = c.nombre;
    });

    setClientes(mapa);
    setPedidos(pedidos);
    setLoading(false);
  };

  useEffect(() => {
    cargar();
  }, []);

  const nombreCliente = (p) =>
    p.clientePublico
      ? p.clientePublico.nombre
      : clientes[p.idCliente] ?? `Cliente #${p.idCliente}`;

  if (loading) {
    return <p style={{ padding: "1rem" }}>⏳ Cargando pedidos...</p>;
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
          <option value="todos">Todos los estados</option>
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

          {(pedidosFiltrados || []).map((p) => (
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