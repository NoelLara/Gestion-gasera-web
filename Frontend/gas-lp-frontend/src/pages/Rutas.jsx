import { useState, useEffect } from "react";
import RutaCard from "../components/RutaCard";
import ModalMapaRuta from "../components/ModalMapaRuta";
import ModalEditarRuta from "../components/ModalEditarRuta";
import ModalEliminarRuta from "../components/ModalEliminarRuta";
import ModalAgregarRuta from "../components/ModalAgregarRuta";
import { obtenerRutas, crearRuta, actualizarRuta, eliminarRuta } from "../services/rutasService";
import { FiPlus } from "react-icons/fi";
import "./Rutas.scss";

export default function Rutas() {
  const [rutaSeleccionada, setRutaSeleccionada] = useState(null);
  const [rutaAEditar, setRutaAEditar] = useState(null);
  const [rutaAEliminar, setRutaAEliminar] = useState(null);
  const [rutas, setRutas] = useState([]);

  useEffect(() => {
    const cargarRutas = async () => {
      try {
        const res = await obtenerRutas();
        setRutas(res.data || res);
      } catch (err) {
        console.error("No se pudieron cargar las rutas:", err);
      }
    };

    cargarRutas();
  }, []);

  const confirmarEliminarRuta = async (id) => {
    try {
      await eliminarRuta(id);
      setRutas(prev => prev.filter(r => r.id !== id));
      setRutaAEliminar(null);
    } catch (err) {
      console.error("Error eliminando ruta:", err);
      alert("No se pudo eliminar la ruta 😿");
    }
  };

  const guardarRutaEditada = async (rutaEditada) => {
    try {
      const res = await actualizarRuta(rutaEditada.id, rutaEditada);
      setRutas(prev => prev.map(r => r.id === rutaEditada.id ? res.data || res : r));
      setRutaAEditar(null);
    } catch (err) {
      console.error("No se pudo actualizar la ruta 😿", err);
      alert("No se pudo actualizar la ruta 😿");
    }
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
          onGuardar={async (nuevaRuta) => {
            try {
              const res = await crearRuta(nuevaRuta);
              setRutas(prev => [...prev, res.data || res]);
              setRutaAEditar(null);
            } catch (err) {
              console.error("No se pudo crear la ruta 😿", err);
              alert("No se pudo crear la ruta 😿");
            }
          }}
        />
      )}

      {rutaAEditar && rutaAEditar?.modo !== "crear" && (
        <ModalEditarRuta
          ruta={rutaAEditar}
          onClose={() => setRutaAEditar(null)}
          onGuardar={async (rutaEditada) => {
            try {
              const res = await actualizarRuta(rutaEditada.id, rutaEditada);
              
              setRutas(prev =>
                prev.map(r => (r.id === rutaEditada.id ? res.data || res : r))
              );

              setRutaAEditar(null);
            } catch (err) {
              console.error("No se pudo actualizar la ruta 😿", err);
              alert("No se pudo actualizar la ruta 😿");
            }
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