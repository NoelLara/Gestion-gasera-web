import { useState } from "react";
import RutaCard from "../components/RutaCard";
import ModalMapaRuta from "../components/ModalMapaRuta";
import ModalEditarRuta from "../components/ModalEditarRuta";
import ModalEliminarRuta from "../components/ModalEliminarRuta";
import ModalAgregarRuta from "../components/ModalAgregarRuta";
import { FiPlus } from "react-icons/fi";
import "./Rutas.scss";

export default function Rutas() {
  const [rutaSeleccionada, setRutaSeleccionada] = useState(null);
  const [rutaAEditar, setRutaAEditar] = useState(null);
  const [rutaAEliminar, setRutaAEliminar] = useState(null);

  const [rutas, setRutas] = useState([
    {
  id: "2",
  nombre: "Ruta Xalapa Centro",
  direccion_inicial: {
    calle: "Córdoba",
    numero: "123",
    lat: 19.5418,
    lng: -96.9140
  },
  direccion_final: {
    calle: "Juárez",
    numero: "456",
    lat: 19.5369,
    lng: -96.9224
  },
  puntos_intermedios: [],
  unidades_asignadas: [5, 6],
  vendedores_asignados: [3],
  clientes_pendientes: [10, 11],
  clientes_atendidos: []
}
,
    {
      id: "1",
      nombre: "Ruta Norte",
      direccion_inicial: {
        calle: "Av A",
        numero: "123",
        lat: 19.4326,
        lng: -99.1332
      },
      direccion_final: {
        calle: "Av B",
        numero: "456",
        lat: 19.437,
        lng: -99.145
      },
      puntos_intermedios: [],
      unidades_asignadas: [1, 3],
      vendedores_asignados: [7],
      clientes_pendientes: [1, 2, 3],
      clientes_atendidos: [4]
    }

    
  ]);

  const confirmarEliminarRuta = (id) => {
    setRutas(prev => prev.filter(r => r.id !== id));
    setRutaAEliminar(null);
  };

  const guardarRutaEditada = (rutaEditada) => {
    setRutas(prev =>
      prev.map(r => (r.id === rutaEditada.id ? rutaEditada : r))
    );
    setRutaAEditar(null);
  };

  return (
    <div className="rutas">
      <header>
        <h2>Rutas</h2>

      <button
        className="btn-agregar"
        onClick={() => setRutaAEditar({ modo: "crear" })}
      >
        <FiPlus size={20} /> Agregar ruta
      </button>
      </header>

      <div className="rutas-lista">
        {rutas.map(ruta => (
          <RutaCard
            key={ruta.id}
            ruta={ruta}
            onVerMapa={setRutaSeleccionada}
            onEditar={setRutaAEditar}
            onEliminar={() => setRutaAEliminar(ruta)}
          />
        ))}
      </div>

      {rutaSeleccionada && (
        <ModalMapaRuta
          ruta={rutaSeleccionada}
          onClose={() => setRutaSeleccionada(null)}
        />
      )}

      {rutaAEditar?.modo === "crear" && (
        <ModalAgregarRuta
          onClose={() => setRutaAEditar(null)}
          onGuardar={(nuevaRuta) => {
            setRutas(prev => [
              ...prev,
              { ...nuevaRuta, id: crypto.randomUUID() }
            ]);
            setRutaAEditar(null);
          }}
        />
      )}

      {rutaAEliminar && (
        <ModalEliminarRuta
          ruta={rutaAEliminar}
          onClose={() => setRutaAEliminar(null)}
          onConfirmar={confirmarEliminarRuta}
        />
      )}
    </div>
  );
}