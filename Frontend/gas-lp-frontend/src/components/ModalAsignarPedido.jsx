import { useState } from "react";
import { asignarPedido } from "../services/pedidosService";

export default function ModalAsignarPedido({ pedido, onClose, onSuccess }) {
  const [data, setData] = useState({
    idRuta: "",
    idUnidad: "",
    idVendedor: ""
  });

  const handleChange = (e) =>
    setData({ ...data, [e.target.name]: e.target.value });

  const asignar = async () => {
    try {
      await asignarPedido(pedido.idPedido, {
        idRuta: data.idRuta || null,
        idUnidad: Number(data.idUnidad),
        idVendedor: Number(data.idVendedor),
      });

      onSuccess();
      onClose();
    } catch {
      alert("No se pudo asignar 😾");
    }
  };

  return (
    <div className="modal">
      <h2>🚚 Asignar Pedido #{pedido.idPedido}</h2>

      <input name="idRuta" placeholder="Ruta" onChange={handleChange} />
      <input name="idUnidad" placeholder="Unidad" onChange={handleChange} />
      <input name="idVendedor" placeholder="Vendedor" onChange={handleChange} />

      <button onClick={asignar}>Asignar ✨</button>
      <button onClick={onClose}>Cancelar</button>
    </div>
  );
}