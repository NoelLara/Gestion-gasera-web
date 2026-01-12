import { useState } from "react";
import { crearPedido } from "../services/pedidosService";
import { useNavigate } from "react-router-dom";
import { FiMapPin, FiHome, FiHash, FiCheckCircle, FiDroplet, FiPackage } from "react-icons/fi";
import "./NuevoPedido.scss";

export default function NuevoPedido() {
  const navigate = useNavigate();
  const perfil = JSON.parse(sessionStorage.getItem("perfil"));
  const idCliente = perfil?.id;

  const [calle, setCalle] = useState("");
  const [numero, setNumero] = useState("");
  const [colonia, setColonia] = useState("");
  const [cilindros, setCilindros] = useState([]);
  const [cantidadCilindro, setCantidadCilindro] = useState(1);
  const [tamanoCilindro, setTamanoCilindro] = useState("20");
  const [tipoPedido, setTipoPedido] = useState("LITROS");
  const [litros, setLitros] = useState("");

  const [errores, setErrores] = useState({
    calle: "",
    numero: "",
    colonia: "",
    litros: "",
    cilindros: "",
  });

  const validarCampos = () => {
    let tempErrores = { calle: "", numero: "", colonia: "", litros: "", cilindros: "" };
    let valido = true;

    if (!calle.trim()) { tempErrores.calle = "La calle no puede estar vacía"; valido = false; }
    if (!numero.trim() || !/^\d+$/.test(numero)) { tempErrores.numero = "Número no válido"; valido = false; }
    if (!colonia.trim()) { tempErrores.colonia = "La colonia no puede estar vacía"; valido = false; }

    if (tipoPedido === "LITROS") {
      if (!litros || Number(litros) < 1) { tempErrores.litros = "Debe indicar al menos 1 litro"; valido = false; }
    } else {
      if (cilindros.length === 0) { tempErrores.cilindros = "Agrega al menos un cilindro"; valido = false; }
    }

    setErrores(tempErrores);
    return valido;
  };

  const manejarNumero = (valor) => {
    if (/^\d*$/.test(valor)) setNumero(valor);
  };

  const enviar = async (e) => {
    e.preventDefault();
    if (!idCliente) { alert("Cliente no identificado"); return; }
    if (!validarCampos()) { return; }

    const direccion = `Calle ${calle} #${numero}, Col. ${colonia}`;
    const pedido = {
      direccion,
      tipoPedido: tipoPedido === "LITROS" ? "estacionario" : "cilindro",
      idCliente,
      lat: 0,
      lng: 0
    };

    if (tipoPedido === "LITROS") pedido.litros = Number(litros);
    else pedido.cilindros = cilindros;

    await crearPedido(pedido);
    navigate("/cliente");
  };

  const agregarCilindro = () => {
    if (cantidadCilindro < 1) { alert("La cantidad debe ser al menos 1"); return; }

    setCilindros(prev => {
      const existente = prev.find(c => c.tipoCilindro === Number(tamanoCilindro));
      if (existente) {
        return prev.map(c => c.tipoCilindro === Number(tamanoCilindro) ? { ...c, cantidad: c.cantidad + Number(cantidadCilindro) } : c);
      }
      return [...prev, { tipoCilindro: Number(tamanoCilindro), cantidad: Number(cantidadCilindro) }];
    });
  };

  const eliminarCilindro = (tipo) => setCilindros(prev => prev.filter(c => c.tipoCilindro !== tipo));

  return (
    <div className="nuevo-pedido">
      <h2><FiMapPin /> Nuevo pedido</h2>
      <form onSubmit={enviar}>

        <div className="campo">
          <FiHome className="icon" />
          <input placeholder="Calle" value={calle} onChange={(e) => setCalle(e.target.value)} />
          {errores.calle && <p className="error">{errores.calle}</p>}
        </div>

        <div className="campo">
          <FiHash className="icon" />
          <input placeholder="Número" value={numero} onChange={(e) => manejarNumero(e.target.value)} />
          {errores.numero && <p className="error">{errores.numero}</p>}
        </div>

        <div className="campo">
          <FiMapPin className="icon" />
          <input placeholder="Colonia" value={colonia} onChange={(e) => setColonia(e.target.value)} />
          {errores.colonia && <p className="error">{errores.colonia}</p>}
        </div>

        <div className="tipo-pedido">
          <button type="button" className={tipoPedido === "LITROS" ? "activo" : ""} onClick={() => setTipoPedido("LITROS")}>
            <FiDroplet /> Litros
          </button>
          <button type="button" className={tipoPedido === "CILINDRO" ? "activo" : ""} onClick={() => setTipoPedido("CILINDRO")}>
            <FiPackage /> Cilindro
          </button>
        </div>

        {tipoPedido === "LITROS" ? (
          <div className="campo campo-full">
            <FiDroplet className="icon" />
            <input type="number" placeholder="Cantidad de litros" value={litros} min="1"
              onChange={(e) => setLitros(Math.max(1, Number(e.target.value)))} />
            {errores.litros && <p className="error">{errores.litros}</p>}
          </div>
        ) : (
          <div className="campo campo-full">
            <FiPackage className="icon" />
            <select value={tamanoCilindro} onChange={(e) => setTamanoCilindro(e.target.value)}>
              <option value="10">10 kg</option>
              <option value="20">20 kg</option>
              <option value="30">30 kg</option>
            </select>
            <input type="number" min="1" value={cantidadCilindro} style={{ width: "70px" }}
              onChange={(e) => setCantidadCilindro(Math.max(1, Number(e.target.value)))} />
            <button type="button" onClick={agregarCilindro}>Agregar cilindro</button>
            {errores.cilindros && <p className="error">{errores.cilindros}</p>}
          </div>
        )}

        {cilindros.length > 0 && (
          <div className="lista-cilindros">
            {cilindros.map(c => (
              <div key={c.tipoCilindro} className="cilindro-item">
                <div className="info">
                  <strong>{c.tipoCilindro} kg</strong>
                  <span>Cantidad: {c.cantidad}</span>
                </div>
                <button type="button" className="btn-eliminar-cilindro" onClick={() => eliminarCilindro(c.tipoCilindro)}>✖</button>
              </div>
            ))}
          </div>
        )}

        <button type="submit">Crear pedido</button>
      </form>
    </div>
  );
}