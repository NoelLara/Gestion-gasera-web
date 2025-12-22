import { useState } from "react";
import "./Ventas.scss";

const ventasMock = [
  {
    idVenta: 1,
    idPedido: 101,
    tipoVenta: "cilindro",
    cantidad: 2,
    precioTotal: 1500,
    fechaVenta: "2025-12-14",
    idVendedor: 3,
    idUnidad: 2
  },
  {
    idVenta: 2,
    idPedido: 102,
    tipoVenta: "estacionario",
    litros: 320,
    precioTotal: 4200,
    fechaVenta: "2025-12-14",
    idVendedor: 1,
    idUnidad: 1,
    idRuta: "R-5"
  }
];

export default function Ventas() {
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [fechaCorte, setFechaCorte] = useState("2025-12-14");
  const [resultadoCorte, setResultadoCorte] = useState(null);

  const ventasFiltradas =
    filtroTipo === "todos"
      ? ventasMock
      : ventasMock.filter(v => v.tipoVenta === filtroTipo);

  const calcularCorte = () => {
    const ventasDelDia = ventasMock.filter(
      v => v.fechaVenta === fechaCorte
    );

    const montoTotal = ventasDelDia.reduce(
      (acc, v) => acc + v.precioTotal,
      0
    );

    setResultadoCorte({
      totalVentas: ventasDelDia.length,
      montoTotal
    });
  };

  return (
    <div className="ventas">
      <h2>Ventas</h2>

      {/* FILTROS */}
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

      {/* LISTA DE VENTAS */}
      <div className="ventas-lista">
        {ventasFiltradas.map((venta) => (
          <div className="venta-card" key={venta.idVenta}>
            <div className="venta-header">
              <div>
                <span className="label">Total</span>
                <span className="total">${venta.precioTotal}</span>
              </div>

              <div className="cantidad">
                {venta.cantidad && <span>{venta.cantidad} cilindros</span>}
                {venta.litros && <span>{venta.litros} L</span>}
              </div>
            </div>

            <div className="venta-body">
              <div className="fila">
                <span>Pedido #{venta.idPedido}</span>
                <span className="badge">{venta.tipoVenta}</span>
              </div>

              <div className="fila fecha">
                {new Date(venta.fechaVenta).toLocaleDateString()}
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

      {/* 💰 CORTE DE CAJA */}
      <div className="corte-caja">
        <h3>💰 Corte de caja</h3>

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
            <p>🧾 Ventas del día: <strong>{resultadoCorte.totalVentas}</strong></p>
            <p>💵 Monto total: <strong>${resultadoCorte.montoTotal}</strong></p>
          </div>
        )}
      </div>
    </div>
  );
}