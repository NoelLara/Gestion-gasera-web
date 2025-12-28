import "./ModalUnidad.scss";

export default function ModalEliminarVendedor({ vendedor, onClose, onConfirmar }) {
  return (
    <div className="modal-overlay">
      <div className="modal-unidad">
        <h3>⚠️ Eliminar vendedor</h3>

        <p>
          ¿Seguro que quieres eliminar al vendedor{" "}
          <strong>{vendedor.nombre}</strong>?
        </p>

        <div className="acciones">
          <button onClick={onClose}>Cancelar</button>
          <button
            className="eliminar"
            onClick={() => onConfirmar(vendedor.idVendedor)}
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}