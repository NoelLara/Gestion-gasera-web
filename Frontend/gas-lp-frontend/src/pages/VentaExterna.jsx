import { useState, useEffect } from "react";
import "./VentaExterna.scss";
import { registrarVentaExterna } from "../services/ventasService";
import { FiPackage, FiDroplet, FiCheckCircle } from "react-icons/fi";

const PRECIO_LITRO = 12.5;
const PRECIOS_CILINDRO = {
  10: 150,
  20: 300,
  30: 450
};

export default function VentaExterna() {
  const [tipoVenta, setTipoVenta] = useState("cilindro");
  const [litros, setLitros] = useState("");
  const [cilindros, setCilindros] = useState([]);
  const [tamanoCilindro, setTamanoCilindro] = useState("20");
  const [cantidadCilindro, setCantidadCilindro] = useState(1);
  const [precioTotal, setPrecioTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tipoVenta === "estacionario") {
      setPrecioTotal(Number(litros || 0) * PRECIO_LITRO);
    } else {
      const total = cilindros.reduce(
        (sum, c) => sum + PRECIOS_CILINDRO[c.tipoCilindro] * c.cantidad,
        0
      );
      setPrecioTotal(total);
    }
  }, [tipoVenta, litros, cilindros]);

  const agregarCilindro = () => {
    if (cantidadCilindro < 1) return;

    setCilindros(prev => {
      const existente = prev.find(
        c => c.tipoCilindro === Number(tamanoCilindro)
      );

      if (existente) {
        return prev.map(c =>
          c.tipoCilindro === Number(tamanoCilindro)
            ? { ...c, cantidad: c.cantidad + cantidadCilindro }
            : c
        );
      }

      return [
        ...prev,
        {
          tipoCilindro: Number(tamanoCilindro),
          cantidad: cantidadCilindro
        }
      ];
    });
  };

  const eliminarCilindro = (tipo) => {
    setCilindros(prev => prev.filter(c => c.tipoCilindro !== tipo));
  };

  const registrar = async () => {
    if (
      (tipoVenta === "estacionario" && !litros) ||
      (tipoVenta === "cilindro" && cilindros.length === 0)
    ) {
      alert("Completa la información");
      return;
    }

    const venta = {
      idPedido: null,
      tipoVenta,
      litros: tipoVenta === "estacionario" ? Number(litros) : null,
      cilindros: tipoVenta === "cilindro" ? cilindros : null,
      precioTotal,
      clientePublico: {
        nombre: "Cliente externo",
        telefono: "N/A"
      }
    };

    try {
      setLoading(true);
      await registrarVentaExterna(venta);
      alert("Venta registrada correctamente");
      setLitros("");
      setCilindros([]);
    } catch (e) {
      alert("Error al registrar la venta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="venta-externa">
      <h2>Venta externa</h2>

      <div className="form">
        <label>Tipo de venta</label>
        <select value={tipoVenta} onChange={e => setTipoVenta(e.target.value)}>
          <option value="cilindro">Cilindro</option>
          <option value="estacionario">Estacionario</option>
        </select>

        {tipoVenta === "estacionario" ? (
          <>
            <label>Litros</label>
            <input
              type="number"
              min="1"
              value={litros}
              onChange={e => setLitros(e.target.value)}
            />
          </>
        ) : (
          <>
            <label>Cilindros</label>

            <div className="fila-cilindro">
              <select
                value={tamanoCilindro}
                onChange={e => setTamanoCilindro(e.target.value)}
              >
                <option value="10">10 kg</option>
                <option value="20">20 kg</option>
                <option value="30">30 kg</option>
              </select>

              <input
                type="number"
                min="1"
                value={cantidadCilindro}
                onChange={e => setCantidadCilindro(Number(e.target.value))}
              />

              <button type="button" onClick={agregarCilindro}>
                <FiCheckCircle /> Agregar
              </button>
            </div>

            {cilindros.map(c => (
              <div key={c.tipoCilindro} className="cilindro-item">
                <span>{c.tipoCilindro} kg</span>
                <span>Cantidad: {c.cantidad}</span>
                <button onClick={() => eliminarCilindro(c.tipoCilindro)}>
                  ✖
                </button>
              </div>
            ))}
          </>
        )}

        <div className="total">
          Total: <strong>${precioTotal.toFixed(2)}</strong>
        </div>

        <button onClick={registrar} disabled={loading}>
          Registrar venta
        </button>
      </div>
    </div>
  );
}