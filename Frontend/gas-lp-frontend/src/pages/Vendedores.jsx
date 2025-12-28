import { useState } from "react";
import "./Vendedores.scss";
import { FiEdit, FiTrash2, FiPlus } from "react-icons/fi";
import ModalVendedor from "../components/ModalVendedor";
import ModalEliminarVendedor from "../components/ModalEliminarVendedor";

export default function Vendedores() {
  const [vendedores, setVendedores] = useState([
    {
      idVendedor: 1,
      nombre: "Juan Pérez",
      telefono: "555-123-4567",
      email: "juan@empresa.com",
      activo: true,
    },
    {
      idVendedor: 2,
      nombre: "María López",
      telefono: "555-987-6543",
      email: "maria@empresa.com",
      activo: false,
    },
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [vendedorEliminar, setVendedorEliminar] = useState(null);
  const [vendedorEditar, setVendedorEditar] = useState(null);

  const abrirModal = (v = null) => {
    setVendedorEditar(v);
    setModalOpen(true);
  };

  const guardarVendedor = (data) => {
    if (vendedorEditar) {
      setVendedores(prev =>
        prev.map(v =>
          v.idVendedor === vendedorEditar.idVendedor
            ? { ...v, ...data }
            : v
        )
      );
    } else {
      setVendedores(prev => [
        ...prev,
        { ...data, idVendedor: Date.now() },
      ]);
    }
    setModalOpen(false);
  };

  const eliminarVendedor = () => {
    setVendedores(prev =>
      prev.filter(v => v.idVendedor !== vendedorEliminar.idVendedor)
    );
    setVendedorEliminar(null);
  };

  return (
    <div className="vendedores-page">
      <header>
        <h2>💼 Vendedores</h2>
        <button className="btn-agregar" onClick={() => abrirModal()}>
          <FiPlus /> Agregar vendedor
        </button>
      </header>

      <table className="tabla-vendedores">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {vendedores.map(v => (
            <tr key={v.idVendedor}>
              <td>{v.nombre}</td>
              <td>{v.email}</td>
              <td>{v.telefono}</td>
              <td>{v.activo ? "🟢 Activo" : "🔴 Inactivo"}</td>
              <td>
                <button
                  className="btn-editar"
                  onClick={() => abrirModal(v)}
                >
                  <FiEdit />
                </button>
                <button
                  className="btn-eliminar"
                  onClick={() => setVendedorEliminar(v)}
                >
                  <FiTrash2 />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {modalOpen && (
        <ModalVendedor
          vendedor={vendedorEditar}
          onClose={() => setModalOpen(false)}
          onGuardar={guardarVendedor}
        />
      )}

      {vendedorEliminar && (
        <ModalEliminarVendedor
          vendedor={vendedorEliminar}
          onClose={() => setVendedorEliminar(null)}
          onConfirmar={(id) => {
            eliminarVendedor(id);
            setVendedorEliminar(null);
          }}
        />
      )}
    </div>
  );
}