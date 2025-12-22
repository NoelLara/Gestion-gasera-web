import { useState, useEffect } from "react";
import axios from "axios";
import "./ClienteCard.scss";

export default function ModalCliente({ cliente, onClose, onGuardar }) {
  const [nombre, setNombre] = useState(cliente?.nombre || "");
  const [email, setEmail] = useState(cliente?.email || "");
  const [contrasena, setContrasena] = useState("");

  useEffect(() => {
    setNombre(cliente?.nombre || "");
    setEmail(cliente?.email || "");
    setContrasena("");
  }, [cliente]);

  const guardar = async () => {
    try {
      if (cliente) {
        await axios.patch(`http://localhost:8000/usuarios/${cliente.id}`, {
          nombre, email, contrasena
        });
      } else {
        await axios.post("http://localhost:8000/usuarios", {
          nombre, email, contrasena, rol: "cliente"
        });
      }
      onGuardar();
      onClose();
    } catch (error) {
      console.error("Error guardando cliente:", error);
    }
  };

  return (
    <div className="modal-fondo">
      <div className="modal">
        <h3>{cliente ? "Editar Cliente" : "Agregar Cliente"}</h3>
        <label>Nombre</label>
        <input value={nombre} onChange={e => setNombre(e.target.value)} />
        <label>Email</label>
        <input value={email} onChange={e => setEmail(e.target.value)} />
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