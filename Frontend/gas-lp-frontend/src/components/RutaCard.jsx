import "./RutaCard.scss";

export default function RutaCard({
  ruta,
  onVerMapa,
  onEditar,
  onEliminar
}) {
  return (
    <div className="ruta-card">
      <div className="ruta-header">
        <h3>{ruta.nombre}</h3>
      </div>

      <div className="ruta-body">
        <div className="direccion">
          📍 {ruta.direccion_inicial.calle} #{ruta.direccion_inicial.numero}
          <br />
          ➡️ {ruta.direccion_final.calle} #{ruta.direccion_final.numero}
        </div>

        <div className="listas">
          <div>
            <strong>Unidades:</strong>{" "}
              {ruta.unidades_nombres?.length
                ? ruta.unidades_nombres.join(", ")
                : "—"}
          </div>

          <div>
            <strong>Vendedores:</strong>{" "}
              {ruta.vendedores_nombres?.length
                ? ruta.vendedores_nombres.join(", ")
                : "—"}
          </div>
        </div>
      </div>

      <div className="ruta-actions">
        <button onClick={() => onVerMapa(ruta)}>Mapa</button>
        <button className="editar" onClick={() => onEditar(ruta)}>Editar</button>
        <button className="eliminar" onClick={() => onEliminar(ruta.id)}>Eliminar</button>
      </div>
    </div>
  );
}