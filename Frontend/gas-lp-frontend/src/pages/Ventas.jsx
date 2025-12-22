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

  const ventasFiltradas =
    filtroTipo === "todos"
      ? ventasMock
      : ventasMock.filter(v => v.tipoVenta === filtroTipo);

  return (
    <div className="ventas">
      <h2>Ventas</h2>

      {/* 🌸 FILTRO */}
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
        {ventasFiltradas.map((venta) => (
          <div className="venta-card" key={venta.idVenta}>

            {/* 🔵 HEADER */}
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

            {/* ⚪ BODY */}
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
    </div>
  );
}