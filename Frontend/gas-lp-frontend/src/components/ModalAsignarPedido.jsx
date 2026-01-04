import { useEffect, useState } from "react";
import { asignarPedido } from "../services/pedidosService";
import { obtenerRutas } from "../services/rutasService";
import { estaEnRuta, obtenerCoordenadas } from "../utils/geocoding";

export default function ModalAsignarPedido({ pedido, onClose, onSuccess }) {
  const [data, setData] = useState({
    idRuta: "",
    idUnidad: "",
    idVendedor: ""
  });
  const [rutas, setRutas] = useState([]);
  const [sugerida, setSugerida] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  // 💖 Cargar rutas y buscar ruta sugerida
  useEffect(() => {
    const cargarRutas = async () => {
      try {
        const res = await obtenerRutas();
        const rutasAPI = res.data || res;
        setRutas(rutasAPI);

        // Coordenadas del pedido
        const pedidoCoords = pedido.tipoPedido === "cilindro"
          ? pedido.cilindros[0] // si quieres, puedes tomar primer cilindro como referencia
          : { lat: pedido.lat || 0, lng: pedido.lng || 0 };

        // Revisar rutas cercanas
        let rutaCercana = rutasAPI.find(r => 
          estaEnRuta(pedidoCoords, r)
        );
        if (rutaCercana) setSugerida(rutaCercana.id);
      } catch (err) {
        console.error("Error cargando rutas:", err);
      } finally {
        setLoading(false);
      }
    };
    cargarRutas();
  }, [pedido]);

  const asignar = async () => {
    try {
      await asignarPedido(pedido.idPedido, {
        idRuta: data.idRuta || sugerida || null,
        idUnidad: Number(data.idUnidad),
        idVendedor: Number(data.idVendedor),
      });

      onSuccess();
      onClose();
    } catch {
      alert("No se pudo asignar 😿");
    }
  };

  if (loading) return <p>⏳ Cargando rutas...</p>;

  return (
    <div className="modal">
      <h2>🚚 Asignar Pedido #{pedido.idPedido}</h2>

      <label>Ruta sugerida</label>
      <select name="idRuta" value={data.idRuta || sugerida || ""} onChange={handleChange}>
        <option value="">-- Selecciona una ruta --</option>
        {rutas.map(r => (
          <option key={r.id} value={r.id}>
            {r.nombre} {r.id === sugerida ? "(Sugerida)" : ""}
          </option>
        ))}
      </select>

      <label>Unidad 🚚</label>
      <select name="idUnidad" onChange={handleChange} value={data.idUnidad}>
        <option value="">Selecciona una unidad</option>
        {pedido.ruta?.unidades_asignadas.map(u => (
          <option key={u} value={u}>
            Unidad {u}
          </option>
        ))}
      </select>

      <label>Vendedor 🧑‍💼</label>
      <input name="idVendedor" placeholder="Vendedor" onChange={handleChange} />

      <div className="acciones">
        <button onClick={asignar}>Asignar ✨</button>
        <button onClick={onClose}>Cancelar</button>
      </div>

      {!sugerida && (
        <p style={{ marginTop: "1rem", color: "orange" }}>
          ⚠️ No hay ruta cercana, considera crear una nueva ruta para este pedido.
        </p>
      )}
    </div>
  );
}