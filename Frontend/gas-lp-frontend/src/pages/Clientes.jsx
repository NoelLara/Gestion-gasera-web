import { useState, useEffect } from "react";
import { FiTrash2 } from "react-icons/fi";
import { getClientes, eliminarCliente } from "../services/clientesService";
import "./Clientes.scss";

export default function Clientes() {
  const [clientes, setClientes] = useState([]);

  useEffect(() => {
    cargarClientes();
  }, []);

  const cargarClientes = async () => {
    try {
      const data = await getClientes();
      setClientes(data);
    } catch (error) {
      console.error("Error cargando clientes:", error);
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Seguro que quieres eliminar este cliente? 😿")) return;
    const token = localStorage.getItem("token"); 
    try {
      await eliminarCliente(id, token);
      setClientes(clientes.filter(c => c.id !== id));
    } catch (error) {
      console.error("No se pudo eliminar el cliente:", error);
    }
  };

  return (
    <div className="clientes-page">
      <header>
        <h2>Clientes 🐱</h2>
      </header>

      <table className="tabla-clientes">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map(c => (
            <tr key={c.id}>
              <td>{c.nombre}</td>
              <td>{c.correo}</td>
              <td>{c.telefono}</td>
              <td>
                <button onClick={() => handleEliminar(c.id)} className="btn-eliminar">
                  <FiTrash2 />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}