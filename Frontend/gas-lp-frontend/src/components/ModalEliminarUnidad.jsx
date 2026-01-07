import "./ModalUnidad.scss";

export default function ModalEliminarUnidad({ unidad, onClose, onConfirmar }) {
  return (
    <div className="modal-overlay">
      <div className="modal-unidad">
        <h3>⚠️ Eliminar unidad</h3>
        <p>
          ¿Seguro que quieres eliminar la unidad{" "}
          <strong>{unidad.numero_economico}</strong>?
        </p>

        <div className="acciones">
          <button onClick={onClose}>Cancelar</button>
          <button className="eliminar" onClick={() => onConfirmar(unidad.id)}>
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}