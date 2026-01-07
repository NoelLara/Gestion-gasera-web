import { useState } from "react";
import { cambiarEstadoPedido } from "../services/pedidosService";

export default function ModalCambiarEstado({ pedido, onClose, onSuccess }) {
  const [estado, setEstado] = useState("atendido");

  const cambiarEstado = async () => {
    try {
      await cambiarEstadoPedido(pedido.idPedido, estado);
      onSuccess();
      onClose();
    } catch {
      alert("No se pudo cambiar estado 😿");
    }
  };

  return (
    <div className="modal">
      <h2>📦 Estado Pedido #{pedido.idPedido}</h2>

      <select value={estado} onChange={(e) => setEstado(e.target.value)}>
        <option value="atendido">Atendido</option>
        <option value="cancelado">Cancelado</option>
      </select>

      <button onClick={cambiarEstado}>Guardar 💫</button>
      <button onClick={onClose}>Cerrar</button>
    </div>
  );
}