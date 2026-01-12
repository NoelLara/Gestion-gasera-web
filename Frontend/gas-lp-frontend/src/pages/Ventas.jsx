import { useState, useEffect } from "react";
import "./Ventas.scss";
import {
  listarVentas,
  corteDiario
} from "../services/ventasService";
import { getVendedores } from "../services/vendedoresService";
import { obtenerUnidades } from "../services/unidadesService";
import { obtenerRutas } from "../services/rutasService";

export default function Ventas() {
  const [ventas, setVentas] = useState([]);
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [fechaCorte, setFechaCorte] = useState("");
  const [resultadoCorte, setResultadoCorte] = useState(null);
  const [loading, setLoading] = useState(false);
  const [vendedores, setVendedores] = useState({});
  const [unidades, setUnidades] = useState({});
  const [rutas, setRutas] = useState({});

  useEffect(() => {
    cargarVentas();
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [resV, resU, resR] = await Promise.all([
        getVendedores(),
        obtenerUnidades(),
        obtenerRutas()
      ]);

      setVendedores(Object.fromEntries(resV.data.map(v => [Number(v.idVendedor), v.nombre])));
      setUnidades(Object.fromEntries(resU.map(u => [u.id, u.unidad.numero_economico ?? `Unidad #${u.id}`])));
      setRutas(Object.fromEntries(resR.data.map(r => [String(r.id), r.nombre])));
    } catch (e) {
      console.error("Error cargando datos maestros", e);
    }
  };

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

        {ventasFiltradas.map((venta) => {
          const esExterna = !venta.idPedido;
          return (
            <div
              className={`venta-card ${esExterna ? "externa" : ""}`}
              key={venta.idVenta}
            >
            <div
              className={`venta-header ${esExterna ? "externa" : "normal"}`}
            >
              <div>
                <span className="label">Total</span>
                <span className="total">${venta.precioTotal.toFixed(2)}</span>
              </div>

              <div className="cantidad">
                {!esExterna && venta.cantidad && (
                  <span>{venta.cantidad} cilindros</span>
                )}
                {!esExterna && venta.litros && <span>{venta.litros} L</span>}
                {esExterna && venta.tipoVenta === "estacionario" && venta.litros && (
                  <span>{venta.litros} L</span>
                )}
                {esExterna && venta.tipoVenta === "cilindro" && venta.cilindros && (
                  <span>
                    {venta.cilindros.map(c => `${c.cantidad}x${c.tipoCilindro}kg`).join(", ")}
                  </span>
                )}
              </div>
            </div>

              <div className="venta-body">
                {!esExterna && (
                  <>
                    <div className="fila">
                      <span>Pedido #{venta.idPedido}</span>
                      <span className="badge">{venta.tipoVenta}</span>
                    </div>

                    <div className="fila fecha">
                      {new Date(venta.fechaVenta).toLocaleString()}
                    </div>

                    <span>Vendedor: {vendedores[Number(venta.idVendedor)] || venta.idVendedor}</span>
                    <span>Unidad: {unidades[String(venta.idUnidad)] || venta.idUnidad}</span>

                    {venta.idRuta && (
                      <div className="info">
                        Ruta: {rutas[String(venta.idRuta)] || venta.idRuta}
                      </div>
                    )}
                  </>
                )}

                {esExterna && venta.clientePublico && (
                  <>
                    <div className="fila">
                      <span>{venta.clientePublico.nombre}</span>
                      <span className="badge">{venta.tipoVenta}</span>
                    </div>
                    <div className="fila fecha">
                      {new Date(venta.fechaVenta).toLocaleString()}
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
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