import { useState, useEffect } from "react";
import "./Ventas.scss";
import {
  listarVentas,
  corteDiario
} from "../services/ventasService";

export default function Ventas() {
  const [ventas, setVentas] = useState([]);
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [fechaCorte, setFechaCorte] = useState("");
  const [resultadoCorte, setResultadoCorte] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarVentas();
  }, []);

  const cargarVentas = async () => {
    try {
      setLoading(true);
      const res = await listarVentas();
      setVentas(res.data);
    } catch (e) {
      console.error("Error cargando ventas", e);
    } finally {
      setLoading(false);
    }
  };

  const ventasFiltradas =
    filtroTipo === "todos"
      ? ventas
      : ventas.filter(v => v.tipoVenta === filtroTipo);

  const calcularCorte = async () => {
    if (!fechaCorte) return;

    try {
      const res = await corteDiario(fechaCorte);
      setResultadoCorte(res.data);
    } catch (e) {
      console.error("Error en corte", e);
      alert("No se pudo calcular el corte");
    }
  };

  return (
    <div className="ventas">
      <h2>Ventas</h2>

      <div className="filtros">
        <label>Tipo:</label>
        <select
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value)}
        >
          <option value="todos">Todas</option>
          <option value="cilindro">Cilindro</option>
          <option value="estacionario">Estacionario</option>
        </select>
      </div>

      <div className="ventas-lista">
        {loading && <p>Cargando ventas...</p>}

        {!loading && ventasFiltradas.length === 0 && (
          <p>No hay ventas registradas</p>
        )}

        {ventasFiltradas.map((venta) => (
          <div className="venta-card" key={venta.idVenta}>
            <div className="venta-header">
              <div>
                <span className="label">Total</span>
                <span className="total">
                  ${venta.precioTotal.toFixed(2)}
                </span>
              </div>

              <div className="cantidad">
                {venta.cantidad && (
                  <span>{venta.cantidad} cilindros</span>
                )}
                {venta.litros && (
                  <span>{venta.litros} L</span>
                )}
              </div>
            </div>

            <div className="venta-body">
              <div className="fila">
                <span>Pedido #{venta.idPedido}</span>
                <span className="badge">
                  {venta.tipoVenta}
                </span>
              </div>

              <div className="fila fecha">
                {new Date(venta.fechaVenta).toLocaleString()}
              </div>

              <div className="info">
                <span>Vendedor #{venta.idVendedor}</span>
                <span>Unidad #{venta.idUnidad}</span>
              </div>

              {venta.idRuta && (
                <div className="info">
                  Ruta: {venta.idRuta}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="corte-caja">
        <h3>Corte de caja</h3>

        <div className="corte-form">
          <label>Fecha:</label>
          <input
            type="date"
            value={fechaCorte}
            onChange={(e) => setFechaCorte(e.target.value)}
          />

          <button onClick={calcularCorte}>
            Calcular corte
          </button>
        </div>

        {resultadoCorte && (
          <div className="resultado-corte">
            <p>
              Ventas del día:
              <strong> {resultadoCorte.totalVentas}</strong>
            </p>
            <p>
              Monto total:
              <strong>
                ${resultadoCorte.montoTotal.toFixed(2)}
              </strong>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}