import { useState } from "react";
import "./Clientes.scss";
import ModalCliente from "../components/ClienteCard";
import { FiEdit, FiTrash2, FiPlus } from "react-icons/fi";

export default function Clientes() {
  const [clientes, setClientes] = useState([
    { id: "1", nombre: "Ana López", email: "ana@example.com", rol: "cliente" },
    { id: "2", nombre: "Carlos Rivera", email: "carlos@example.com", rol: "cliente" },
    { id: "3", nombre: "Lucía Pérez", email: "lucia@example.com", rol: "cliente" },
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [clienteEditar, setClienteEditar] = useState(null);

  const abrirModal = (cliente = null) => {
    setClienteEditar(cliente);
    setModalOpen(true);
  };

  const eliminarCliente = (id) => {
    if (!window.confirm("¿Seguro que quieres eliminar este cliente? 😿")) return;
    setClientes(clientes.filter(c => c.id !== id));
  };

  return (
    <div className="clientes-page">
      <header>
        <h2>Clientes 🐱</h2>
        <button className="btn-agregar" onClick={() => abrirModal()}>
          <FiPlus size={20} /> Agregar Cliente
        </button>
      </header>

      <table className="tabla-clientes">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map((c) => (
            <tr key={c.id}>
              <td>{c.nombre}</td>
              <td>{c.email}</td>
              <td>{c.rol}</td>
              <td>
                <button onClick={() => abrirModal(c)} className="btn-editar">
                  <FiEdit />
                </button>
                <button onClick={() => eliminarCliente(c.id)} className="btn-eliminar">
                  <FiTrash2 />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {modalOpen && (
        <ModalCliente
          cliente={clienteEditar}
          onClose={() => setModalOpen(false)}
          onGuardar={() => {}}
        />
      )}
    </div>
  );
}