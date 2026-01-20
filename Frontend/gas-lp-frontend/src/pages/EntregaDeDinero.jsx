import { useEffect, useState } from "react";
import "./EntregaDeDinero.scss";
import {
  listarVendedores,
  listarVentasPorVendedor,
  pagarAdeudo
} from "../services/entregasService";

export default function EntregaDeDinero() {
  const [vendedores, setVendedores] = useState([]);
  const [vendedorSeleccionado, setVendedorSeleccionado] = useState("");
  const [fecha, setFecha] = useState("");
  const [corte, setCorte] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    listarVendedores().then(res => setVendedores(res.data));
  }, []);

  const cargarCorte = async () => {
    if (!vendedorSeleccionado) return;

    try {
      setLoading(true);

      const res = await listarVentasPorVendedor(vendedorSeleccionado);

      const ventasEfectivo = res.data.ventas.filter(
        v => v.metodoDePago === "efectivo"
      );

      const pendientes = ventasEfectivo.filter(v => v.adeudo === true);

      const total = pendientes.reduce(
        (sum, v) => sum + v.precioTotal,
        0
      );

      setCorte({
        totalVentas: ventasEfectivo.length,
        totalEfectivo: total,
        ventas: ventasEfectivo,
        entregado: pendientes.length === 0
      });

    } catch (e) {
      console.error("Error cargando corte", e);
    } finally {
      setLoading(false);
    }
  };

  const marcarEntregado = async () => {
    try {
      const pendientes = corte.ventas.filter(v => v.adeudo === true);

      for (const venta of pendientes) {
        await pagarAdeudo(venta.idVenta);
      }

      setCorte(prev => ({
        ...prev,
        entregado: true,
        ventas: prev.ventas.map(v => ({
          ...v,
          adeudo: false
        }))
      }));
    } catch (e) {
      console.error("Error al entregar dinero", e);
    }
  };

  return (
    <div className="entrega-dinero-container">
      <h2>Corte de caja por vendedor</h2>

      <div className="filtros">
        <select
          value={vendedorSeleccionado}
          onChange={e => setVendedorSeleccionado(e.target.value)}
        >
          <option value="">Seleccione vendedor</option>
          {vendedores.map(v => (
            <option key={v.idVendedor} value={v.idVendedor}>
              {v.nombre}
            </option>
          ))}
        </select>

        <button onClick={cargarCorte}>Buscar</button>
      </div>

      {loading && <p>Cargando corte...</p>}

      {corte && (
        <div className="corte-card">
          <h3>{corte.fecha}</h3>
          <p><strong>Total ventas:</strong> {corte.totalVentas}</p>
          <p className="total">
            Total efectivo: ${corte.totalEfectivo.toFixed(2)}
          </p>

          {!corte.entregado ? (
            <button className="btn-entregar" onClick={marcarEntregado}>
              Entregar dinero
            </button>
          ) : (
            <p className="entregado-ok">✔️ Dinero entregado</p>
          )}
        </div>
      )}
    </div>
  );
}
