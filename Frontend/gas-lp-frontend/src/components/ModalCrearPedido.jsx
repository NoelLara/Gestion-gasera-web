import { useState } from "react";
import { crearPedido } from "../services/pedidosService";

export default function ModalCrearPedido({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    nombre: "",
    telefono: "",
    tipoPedido: "cilindro",
    cantidad: 1,
    litros: "",
    precioTotal: "",
    direccion: "",
    lat: "",
    lng: ""
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const crear = async () => {
    try {
      await crearPedido({
        clientePublico: {
          nombre: form.nombre,
          telefono: form.telefono,
        },
        tipoPedido: form.tipoPedido,
        cantidad: form.tipoPedido === "cilindro" ? Number(form.cantidad) : null,
        litros: form.tipoPedido === "estacionario" ? Number(form.litros) : null,
        precioTotal: Number(form.precioTotal),
        direccion: form.direccion,
        lat: Number(form.lat),
        lng: Number(form.lng),
      });

      onSuccess();
      onClose();
    } catch {
      alert("Error creando pedido 😿");
    }
  };

  return (
    <div className="modal">
      <h2>🧾 Nuevo Pedido</h2>
      {/* inputs igual */}
      <button onClick={crear}>Crear 💖</button>
      <button onClick={onClose}>Cancelar</button>
    </div>
  );
}