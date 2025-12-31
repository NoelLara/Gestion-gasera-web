import { useState } from "react";
import "./ClienteCard.scss";
import * as clientesService from "../services/clientesService";

export default function ModalCliente({ onClose, onGuardar }) {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");

  const guardar = async () => {
    try {
      await clientesService.crearCliente({ nombre, correo, contrasena });
      onGuardar();
      onClose();
    } catch (error) {
      console.error("Error creando cliente:", error);
    }
  };

  return (
    <div className="modal-fondo">
      <div className="modal">
        <h3>Agregar Cliente</h3>
        <label>Nombre</label>
        <input value={nombre} onChange={e => setNombre(e.target.value)} />
        <label>Email</label>
        <input value={correo} onChange={e => setCorreo(e.target.value)} />
        <label>Contraseña</label>
        <input type="password" value={contrasena} onChange={e => setContrasena(e.target.value)} />
        <div className="acciones">
          <button onClick={guardar}>Guardar</button>
          <button onClick={onClose} className="cancelar">Cancelar</button>
        </div>
      </div>
    </div>
  );
}