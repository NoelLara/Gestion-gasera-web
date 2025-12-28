import { useState } from "react";

import UnidadCard from "../components/UnidadCard";
import ModalAgregarUnidad from "../components/ModalAgregarUnidad";
import ModalEditarUnidad from "../components/ModalEditarUnidad";
import ModalEliminarUnidad from "../components/ModalEliminarUnidad";

import { FiPlus } from "react-icons/fi";
import "./Unidades.scss";

const unidadesMock = [
  {
    id: "1",
    unidad: {
      tipo: "pipa",
      numero_economico: "PIPA-01",
      capacidad_litros: 4500,
      activo: true
    }
  },
  {
    id: "2",
    unidad: {
      tipo: "camion",
      numero_economico: "CAM-12",
      cilindros: [
        { capacidad: 20, cantidad: 5 },
        { capacidad: 30, cantidad: 2 }
      ],
      activo: true
    }
  },
  {
    id: "3",
    unidad: {
      tipo: "pipa",
      numero_economico: "PIPA-02",
      capacidad_litros: 6000,
      activo: false
    }
  }
];

export default function Unidades() {
  const [unidades, setUnidades] = useState(unidadesMock);
  const [agregar, setAgregar] = useState(false);
  const [editar, setEditar] = useState(null);
  const [eliminar, setEliminar] = useState(null);

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
          onGuardar={data => {
            setUnidades(prev => [
              ...prev,
              { id: Date.now().toString(), unidad: data }
            ]);
            setAgregar(false);
          }}
        />
      )}

      {editar && (
        <ModalEditarUnidad
          unidad={editar}
          onClose={() => setEditar(null)}
          onGuardar={data => {
            setUnidades(prev =>
              prev.map(u =>
                u.id === editar.id ? { ...u, unidad: data } : u
              )
            );
            setEditar(null);
          }}
        />
      )}

      {eliminar && (
        <ModalEliminarUnidad
          unidad={eliminar}
          onClose={() => setEliminar(null)}
          onConfirmar={() => {
            setUnidades(prev => prev.filter(u => u.id !== eliminar.id));
            setEliminar(null);
          }}
        />
      )}
    </div>
  );
}