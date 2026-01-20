import { useEffect, useState } from "react";
import "./EntregaDeDinero.scss";
import {
  listarVendedores,
  listarVentasPorVendedor,
  pagarVenta
} from "../services/entregasService";

export default function EntregaDeDinero() {
  const [vendedores, setVendedores] = useState([]);
  const [vendedorSeleccionado, setVendedorSeleccionado] = useState("");
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarVendedores();
  }, []);

  const cargarVendedores = async () => {
    try {
      const res = await listarVendedores();
      setVendedores(res.data);
    } catch (e) {
      console.error("Error cargando vendedores", e);
    }
  };

  const seleccionarVendedor = async (idVendedor) => {
    setVendedorSeleccionado(idVendedor);
    if (!idVendedor) return;

    try {
      setLoading(true);
      const res = await listarVentasPorVendedor(idVendedor);
      setVentas(res.data.ventas || []);
    } catch (e) {
      console.error("Error cargando ventas", e);
    } finally {
      setLoading(false);
    }
  };

  const pagar = async (idVenta) => {
    try {
      await pagarVenta(idVenta);
      setVentas(prev =>
        prev.map(v =>
          v.idVenta === idVenta ? { ...v, adeudo: false } : v
        )
      );
    } catch (e) {
      console.error("Error al pagar venta", e);
    }
  };

  return (
    <div className="entrega-dinero-container">
      <h2>Entrega de dinero</h2>

      <label>Vendedor</label>
      <select
        value={vendedorSeleccionado}
        onChange={e => seleccionarVendedor(e.target.value)}
      >
        <option value="">Seleccione un vendedor</option>
        {vendedores.map(v => (
          <option key={v.idVendedor} value={v.idVendedor}>
            {v.nombre}
          </option>
        ))}
      </select>

      {loading && <p>Cargando ventas...</p>}

      <div className="ventas-grid">
        {ventas.map((venta, index) => (
          <div key={venta.idVenta} className="venta-card">
            <div className="venta-header">
              <h4>Venta {index + 1}</h4>

              {venta.adeudo && (
                <button
                  className="btn-pagar"
                  onClick={() => pagar(venta.idVenta)}
                >
                  Pagar
                </button>
              )}
            </div>

            <p>
                <strong>Fecha:</strong>{" "}
                {new Date(venta.fechaVenta).toLocaleDateString()}
            </p>

            <p>
              <strong>Cliente:</strong>{" "}
                {venta.clientePublico
                ? "Cliente externo"
                : "Cliente interno"}
            </p>

            <p><strong>Vendedor:</strong> {venta.vendedorNombre}</p>
            
            <p><strong>Método de pago:</strong> {venta.metodoDePago}</p>

            <p>
              <strong>Producto:</strong>{" "}
              {venta.tipoVenta === "cilindro"
                ? venta.cilindros
                    .map(c => `${c.cantidad} x ${c.tipoCilindro}kg`)
                    .join(", ")
                : `${venta.litros} litros`}
            </p>

            <p className="total">
              <strong>Total:</strong> ${venta.precioTotal.toFixed(2)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}