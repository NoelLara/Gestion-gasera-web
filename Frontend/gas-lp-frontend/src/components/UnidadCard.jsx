import "./UnidadCard.scss";

export default function UnidadCard({ unidad, onEditar, onEliminar }) {
  const data = unidad.unidad;

  return (
    <div className="unidad-card">
      <div className="unidad-header">
        <div>
          <span className="label">Unidad</span>
          <span className="total">
            {data.numero_economico || "Sin número"}
          </span>
        </div>

        <div className="cantidad">
          {data.tipo}
        </div>
      </div>

      <div className="unidad-body">
        {data.tipo === "pipa" && (
          <div className="fila">
            <span>Capacidad</span>
            <span className="badge">
              {data.capacidad_litros} L
            </span>
          </div>
        )}

        {data.tipo === "camion" && (
          <>
            <div className="fila">
              <span>Cilindros</span>
              <span className="badge">
                {data.cilindros.length}
              </span>
            </div>

            <div className="info">
              {data.cilindros.map((c, i) => (
                <span key={i}>
                  {c.cantidad}×{c.capacidad}kg
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="unidad-actions">
        <button className="editar" onClick={onEditar}>
          Editar
        </button>
        <button className="eliminar" onClick={onEliminar}>
          Eliminar
        </button>
      </div>
    </div>
  );
}