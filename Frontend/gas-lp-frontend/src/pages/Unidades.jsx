import { useEffect, useState } from "react";
import {
  obtenerUnidades,
  crearUnidad,
  editarUnidad,
  eliminarUnidad
} from "../services/unidadesService";

import UnidadCard from "../components/UnidadCard";
import ModalAgregarUnidad from "../components/ModalAgregarUnidad";
import ModalEditarUnidad from "../components/ModalEditarUnidad";
import ModalEliminarUnidad from "../components/ModalEliminarUnidad";

import { FiPlus } from "react-icons/fi";
import "./Unidades.scss";

export default function Unidades() {
  const [unidades, setUnidades] = useState([]);
  const [agregar, setAgregar] = useState(false);
  const [editar, setEditar] = useState(null);
  const [eliminar, setEliminar] = useState(null);

  const token = sessionStorage.getItem("token");

  const cargarUnidades = async () => {
    try {
      const data = await obtenerUnidades(token);
      setUnidades(data);
    } catch (e) {
      console.error("Error cargando unidades", e);
      setUnidades([]);
    }
  };

  useEffect(() => {
    cargarUnidades();
  }, []);

  return (
    <div className="unidades">
      <header>
        <h2>Unidades</h2>
        <button className="btn-agregar" onClick={() => setAgregar(true)}>
          <FiPlus /> Agregar unidad
        </button>
      </header>

      <div className="unidades-lista">
        {unidades.map(u => (
          <UnidadCard
            key={u.id}
            unidad={u}
            onEditar={() => setEditar(u)}
            onEliminar={() => setEliminar(u)}
          />
        ))}
      </div>

      {agregar && (
        <ModalAgregarUnidad
          onClose={() => setAgregar(false)}
          onGuardar={async data => {
            await crearUnidad(data, token);
            await cargarUnidades();
            setAgregar(false);
          }}
        />
      )}

      {editar && (
        <ModalEditarUnidad
          unidad={editar}
          onClose={() => setEditar(null)}
          onGuardar={async data => {
            await editarUnidad(editar.id, data, token);
            await cargarUnidades();
            setEditar(null);
          }}
        />
      )}

      {eliminar && (
        <ModalEliminarUnidad
          unidad={eliminar}
          onClose={() => setEliminar(null)}
          onConfirmar={async () => {
            await eliminarUnidad(eliminar.id, token);
            await cargarUnidades();
            setEliminar(null);
          }}
        />
      )}
    </div>
  );
}