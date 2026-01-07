import "./ModalEliminarRuta.scss";

export default function ModalEliminarRuta({ ruta, onClose, onConfirmar }) {
  return (
    <div className="modal-overlay">
      <div className="modal-eliminar">
        <h3>¿Eliminar ruta?</h3>
        <p>⚠️ {ruta.nombre}</p>

        <div className="acciones">
          <button onClick={onClose}>Cancelar</button>
          <button
            className="danger"
            onClick={() => onConfirmar(ruta.id)}
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}