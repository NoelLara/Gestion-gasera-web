import "./ModalConfirm.scss";

export default function ModalConfirm({ mensaje, tipo = "info", onConfirm, onCancel }) {
  return (
    <div className="modal-fondo">
      <div className={`modal-aviso ${tipo}`}>
        <p>{mensaje}</p>
        <div className="botones">
          {onCancel && (
            <button className="cancel" onClick={onCancel}>
              Cancelar
            </button>
          )}
          {onConfirm && (
            <button className="confirm" onClick={onConfirm}>
              Aceptar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}