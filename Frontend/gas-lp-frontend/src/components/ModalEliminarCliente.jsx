import "./ModalEliminarCliente.scss";

export default function ModalEliminarCliente({ cliente, onCerrar, onConfirmar }) {
  return (
    <div className="modal-overlay">
      <div className="modal-eliminar">
        <h3>⚠️ Eliminar cliente</h3>
        <p>
          ¿Seguro que quieres eliminar a <strong>{cliente.nombre}</strong>?
        </p>

        <div className="acciones">
          <button className="cancelar" onClick={onCerrar}>Cancelar</button>
          <button className="danger" onClick={() => onConfirmar(cliente.id)}>
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}