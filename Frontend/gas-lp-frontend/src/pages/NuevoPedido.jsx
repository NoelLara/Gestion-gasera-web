import { useState } from "react";
import { crearPedido } from "../services/pedidosService";
import { useNavigate } from "react-router-dom";
import {
  FiMapPin,
  FiHome,
  FiHash,
  FiInfo,
  FiCheckCircle,
  FiDroplet,
  FiPackage
} from "react-icons/fi";
import "./NuevoPedido.scss";

export default function NuevoPedido() {
  const navigate = useNavigate();
  const idCliente = sessionStorage.getItem("idCliente");

  const [calle, setCalle] = useState("");
  const [numero, setNumero] = useState("");
  const [colonia, setColonia] = useState("");
  const [referencias, setReferencias] = useState("");
  const [cilindros, setCilindros] = useState([]);
  const [cantidadCilindro, setCantidadCilindro] = useState(1);

  const [tipoPedido, setTipoPedido] = useState("LITROS");
  const [litros, setLitros] = useState("");
  const [tamanoCilindro, setTamanoCilindro] = useState("20");

  const enviar = async (e) => {
    e.preventDefault();

    if (!idCliente) {
      alert("Cliente no identificado 😿");
      return;
    }

    const direccion = `Calle ${calle} #${numero}, Col. ${colonia}${
      referencias ? `. Ref: ${referencias}` : ""
    }`;

    const pedido = {
      direccion,
      tipoPedido: tipoPedido === "LITROS" ? "estacionario" : "cilindro",
      idCliente,
      lat: 0,
      lng: 0
    };

    if (tipoPedido === "LITROS") {
      pedido.litros = Number(litros);
    } else {
      if (cilindros.length === 0) {
        alert("Agrega al menos un cilindro");
        return;
      }
      pedido.cilindros = cilindros;
    }

    await crearPedido(pedido);
    navigate("/cliente");
  };

  const agregarCilindro = () => {
    if (cantidadCilindro < 1) {
      alert("La cantidad debe ser al menos 1");
      return;
}

    setCilindros(prev => {
      const existente = prev.find(
        c => c.tipoCilindro === Number(tamanoCilindro)
      );

      if (existente) {
        return prev.map(c =>
          c.tipoCilindro === Number(tamanoCilindro)
            ? { ...c, cantidad: c.cantidad + Number(cantidadCilindro) }
            : c
        );
      }

      return [
        ...prev,
        {
          tipoCilindro: Number(tamanoCilindro),
          cantidad: Number(cantidadCilindro)
        }
      ];
    });
  };

  const eliminarCilindro = (tipoCilindro) => {
    setCilindros(prev =>
      prev.filter(c => c.tipoCilindro !== tipoCilindro)
    );
  };

  return (
    <div className="nuevo-pedido">
      <h2>
        <FiMapPin /> Nuevo pedido
      </h2>

      <form onSubmit={enviar}>
        <div className="campo">
          <FiHome className="icon" />
          <input
            placeholder="Calle"
            value={calle}
            onChange={(e) => setCalle(e.target.value)}
            required
          />
        </div>

        <div className="campo">
          <FiHash className="icon" />
          <input
            placeholder="Número"
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
            required
          />
        </div>

        <div className="campo">
          <FiMapPin className="icon" />
          <input
            placeholder="Colonia"
            value={colonia}
            onChange={(e) => setColonia(e.target.value)}
            required
          />
        </div>

        <div className="campo">
          <FiInfo className="icon" />
          <input
            placeholder="Referencias (opcional)"
            value={referencias}
            onChange={(e) => setReferencias(e.target.value)}
          />
        </div>

        <div className="tipo-pedido">
          <button
            type="button"
            className={tipoPedido === "LITROS" ? "activo" : ""}
            onClick={() => setTipoPedido("LITROS")}
          >
            <FiDroplet /> Litros
          </button>

          <button
            type="button"
            className={tipoPedido === "CILINDRO" ? "activo" : ""}
            onClick={() => setTipoPedido("CILINDRO")}
          >
            <FiPackage /> Cilindro
          </button>
        </div>

        {tipoPedido === "LITROS" ? (
          <div className="campo campo-full">
            <FiDroplet className="icon" />
            <input
              type="number"
              placeholder="Cantidad de litros"
              value={litros}
              onChange={(e) =>
                setLitros(Math.max(1, Number(e.target.value)))
              }
              required
              min="1"
            />
          </div>
        ) : (
          <div className="campo campo-full">
            <FiPackage className="icon" />
            <select
              value={tamanoCilindro}
              onChange={(e) => setTamanoCilindro(e.target.value)}
            >
              <option value="10">10 kg</option>
              <option value="20">20 kg</option>
              <option value="30">30 kg</option>
            </select>

            <input
              type="number"
              min="1"
              value={cantidadCilindro}
              onChange={(e) =>
                setCantidadCilindro(
                  Math.max(1, Number(e.target.value))
                )
              }
              style={{ width: "70px" }}
            />

            <button type="button" onClick={agregarCilindro}>
              <FiCheckCircle /> Agregar cilindro
            </button>
          </div>
        )}

        {cilindros.length > 0 && (
          <div className="lista-cilindros">
            {cilindros.map((c) => (
              <div key={c.tipoCilindro} className="cilindro-item">
                <div className="info">
                  <strong>{c.tipoCilindro} kg</strong>
                  <span>Cantidad: {c.cantidad}</span>
                </div>

                <button
                  type="button"
                  className="btn-eliminar-cilindro"
                  onClick={() => eliminarCilindro(c.tipoCilindro)}
                  title="Quitar cilindro"
                >
                  ✖
                </button>
              </div>
            ))}
          </div>
        )}

        <button type="submit">
          <FiCheckCircle /> Crear pedido
        </button>
      </form>
    </div>
  );
}