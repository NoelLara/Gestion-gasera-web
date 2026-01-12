import { useState, useEffect } from "react";
import { getClientes } from "../services/clientesService";
import ModalEliminarCliente from "../components/ModalEliminarCliente";
import "./Clientes.scss";

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [clienteAEliminar, setClienteAEliminar] = useState(null);

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

  return (
    <div className="clientes-page">
      <header>
        <h2>Clientes</h2>
      </header>

      <table className="tabla-clientes">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Teléfono</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map(c => (
            <tr key={c.id}>
              <td>{c.nombre}</td>
              <td>{c.correo}</td>
              <td>{c.telefono}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {clienteAEliminar && (
        <ModalEliminarCliente
          cliente={clienteAEliminar}
          onCerrar={() => setClienteAEliminar(null)}
          onConfirmar={handleEliminar}
        />
      )}
    </div>
  );
}