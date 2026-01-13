import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./VentaExterna.scss";
import { registrarVentaExterna } from "../services/ventasService";
import { FiCheckCircle } from "react-icons/fi";

const PRECIO_LITRO = 22.5;
const PRECIOS_CILINDRO = { 10: 250, 20: 500, 30: 750 };

export default function VentaExterna() {
  const navigate = useNavigate();

  const [tipoVenta, setTipoVenta] = useState("cilindro");
  const [litros, setLitros] = useState("");
  const [cilindros, setCilindros] = useState([]);
  const [tamanoCilindro, setTamanoCilindro] = useState("20");
  const [cantidadCilindro, setCantidadCilindro] = useState(1);
  const [precioTotal, setPrecioTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [errores, setErrores] = useState({ litros: "", cilindros: "" });
  const [exito, setExito] = useState("");
  const [idVendedor, setIdVendedor] = useState(null);

  useEffect(() => {
    const cargarVendedor = async () => {
      const perfil = JSON.parse(sessionStorage.getItem("perfil"));

      try {
        const res = await axios.get(
          `http://localhost:8002/vendedores/usuario/${perfil.id}`,
          {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
          }
        );

        setIdVendedor(res.data.idVendedor);
      } catch (e) {
        console.error("No se pudo obtener el vendedor", e);
      }
    };

    cargarVendedor();
  }, []);

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
      const existente = prev.find(c => c.tipoCilindro === Number(tamanoCilindro));
      if (existente) {
        return prev.map(c =>
          c.tipoCilindro === Number(tamanoCilindro)
            ? { ...c, cantidad: c.cantidad + cantidadCilindro }
            : c
        );
      }
      return [...prev, { tipoCilindro: Number(tamanoCilindro), cantidad: cantidadCilindro }];
    });
    setErrores(prev => ({ ...prev, cilindros: "" }));
  };

  const eliminarCilindro = (tipo) => {
    setCilindros(prev => prev.filter(c => c.tipoCilindro !== tipo));
  };

  const registrar = async () => {
    let valid = true;
    const nuevosErrores = { litros: "", cilindros: "" };

    if (tipoVenta === "estacionario" && !litros) {
      nuevosErrores.litros = "El campo litros debe estar lleno";
      valid = false;
    }
    if (tipoVenta === "cilindro" && cilindros.length === 0) {
      nuevosErrores.cilindros = "Debes agregar al menos un cilindro";
      valid = false;
    }

    setErrores(nuevosErrores);

    if (!valid) return;

    const venta = {
      tipoVenta,
      litros: tipoVenta === "estacionario" ? Number(litros) : null,
      cilindros: tipoVenta === "cilindro" ? cilindros : null,
      precioTotal,
      clientePublico: { nombre: "Cliente externo", telefono: "N/A" },
      idVendedor
    };

    try {
      setLoading(true);
      await registrarVentaExterna(venta);

      setExito("Venta registrada con éxito");
      setErrores({ litros: "", cilindros: ""});
    } catch (e) {
      setErrores(prev => ({ ...prev, form: "Ocurrió un error al registrar la venta" }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="venta-externa-container">
      <div className="venta-externa">
        <h2>Venta externa</h2>

        <div className="form">
          <label>Tipo de venta</label>
          <select value={tipoVenta} onChange={e => setTipoVenta(e.target.value)}>
            <option value="cilindro">Cilindro</option>
            <option value="estacionario">Estacionario</option>
          </select>

          {tipoVenta === "estacionario" && (
            <>
              <label>Litros</label>
              <input
                type="number"
                min="1"
                value={litros}
                onChange={e => setLitros(e.target.value)}
              />
              {errores.litros && <p className="error-msg">{errores.litros}</p>}
            </>
          )}

          {tipoVenta === "cilindro" && (
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

              {errores.cilindros && <p className="error-msg">{errores.cilindros}</p>}

              {cilindros.map(c => (
                <div key={c.tipoCilindro} className="cilindro-item">
                  <span>{c.tipoCilindro} kg</span>
                  <span>Cantidad: {c.cantidad}</span>
                  <button onClick={() => eliminarCilindro(c.tipoCilindro)}>✖</button>
                </div>
              ))}
            </>
          )}

          <div className="total">
            Total: <strong>${precioTotal.toFixed(2)}</strong>
          </div>

          {errores.form && <p className="error-msg">{errores.form}</p>}
          {exito && <p className="success-msg">{exito}</p>}

          <button onClick={registrar} disabled={loading}>
            {loading ? "Registrando..." : "Registrar venta"}
          </button>
        </div>
      </div>
    </div>
  );
}