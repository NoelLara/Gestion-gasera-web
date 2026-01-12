import { useState, useEffect } from "react";
import "./Vendedores.scss";
import { FiEdit, FiPlus } from "react-icons/fi";
import ModalVendedor from "../components/ModalVendedor";
import ModalEliminarVendedor from "../components/ModalEliminarVendedor";
import { getVendedores, editarVendedor, crearUsuarioVendedor } from "../services/vendedoresService";

export default function Vendedores() {
  const [modalOpen, setModalOpen] = useState(false);
  const [vendedores, setVendedores] = useState([]);
  const [vendedorEliminar, setVendedorEliminar] = useState(null);
  const [vendedorEditar, setVendedorEditar] = useState(null);

  useEffect(() => {
    cargarVendedores();
  }, []);

  const cargarVendedores = async () => {
    try {
      const res = await getVendedores();
      setVendedores(res.data);
    } catch (e) {
      console.error("Error cargando vendedores", e);
    }
  };

  const abrirModal = (v = null) => {
    setVendedorEditar(v);
    setModalOpen(true);
  };

  const guardarVendedor = async (data) => {
    try {
      if (vendedorEditar) {
        await editarVendedor(vendedorEditar.idVendedor, {
          nombre: data.nombre,
          correo: data.correo,
          telefono: data.telefono,
          activo: data.activo,
        });
      } else {
      await crearUsuarioVendedor({
        nombre: data.nombre,
        correo: data.correo,
        telefono: data.telefono,
        activo: data.activo,
      });
    }

      await cargarVendedores();
      setModalOpen(false);
      setVendedorEditar(null);
    } catch (e) {
      alert(e.response?.data?.detail || "Error guardando vendedor");
    }
  };

  return (
    <div className="vendedores-page">
      <header>
        <h2>Vendedores</h2>
        <button className="btn-agregar" onClick={() => abrirModal()}>
          <FiPlus /> Agregar vendedor
        </button>
      </header>

      <table className="tabla-vendedores">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Teléfono</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {vendedores.map(v => (
            <tr key={v.idVendedor}>
              <td>{v.nombre}</td>
              <td>{v.correo}</td>
              <td>{v.telefono}</td>
              <td>{v.activo ? "🟢 Activo" : "🔴 Inactivo"}</td>
              <td>
                <button
                  className="btn-editar"
                  onClick={() => abrirModal(v)}
                >
                  <FiEdit />
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