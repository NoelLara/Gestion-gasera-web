export default function UnidadCard({ unidad, onEditar, onEliminar }) {
  return (
    <div className={`unidad-card ${!unidad.activo ? "inactiva" : ""}`}>
      <div>
        <strong>{unidad.numero_economico || "Sin número"}</strong>
        <span>{unidad.tipo}</span>
      </div>

      <div>
        {unidad.capacidad_litros} L
      </div>

      <div className="acciones">
        <button onClick={onEditar}>Editar</button>
        <button className="danger" onClick={onEliminar}>Eliminar</button>
      </div>
    </div>
  );
}