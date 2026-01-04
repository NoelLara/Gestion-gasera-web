import { useState, useEffect } from "react";
import RutaCard from "../components/RutaCard";
import ModalMapaRuta from "../components/ModalMapaRuta";
import ModalEditarRuta from "../components/ModalEditarRuta";
import ModalEliminarRuta from "../components/ModalEliminarRuta";
import ModalAgregarRuta from "../components/ModalAgregarRuta";
import { obtenerRutas, crearRuta, actualizarRuta, eliminarRuta } from "../services/rutasService";
import { obtenerUnidades } from "../services/unidadesService";
import { getVendedores } from "../services/vendedoresService";
import { FiPlus } from "react-icons/fi";
import "./Rutas.scss";

export default function Rutas() {
  const [rutaSeleccionada, setRutaSeleccionada] = useState(null);
  const [rutaAEditar, setRutaAEditar] = useState(null);
  const [rutaAEliminar, setRutaAEliminar] = useState(null);
  const [rutas, setRutas] = useState([]);
  const [todasLasUnidades, setTodasLasUnidades] = useState([]);
  const [todosLosVendedores, setTodosLosVendedores] = useState([]);

  useEffect(() => {
    const cargarRutas = async () => {
      try {
        const res = await obtenerRutas();
        setRutas(res.data || res);
      } catch (err) {
        console.error("No se pudieron cargar las rutas:", err);
      }
    };

    const cargarDatos = async () => {
      try {
        const resUnidades = await obtenerUnidades(sessionStorage.getItem("token"));
        const unidades = (resUnidades || []).map(u => {
          const info = u.unidad;

          let nombre = "Unidad";

          if (info.tipo === "pipa") {
            nombre = `Pipa ${info.numero_economico || u.id.slice(-4)}`;
          } else if (info.tipo === "camion") {
            nombre = `Camión ${info.numero_economico || u.id.slice(-4)}`;
          }

          return {
            id: String(u.id),
            tipo: info.tipo,
            nombre
          };
        });
        setTodasLasUnidades(unidades);

        const resVendedores = await getVendedores();
        const vendedores = (resVendedores.data || []).map(v => ({
          ...v,
          id: String(v.idVendedor),
          nombre: v.nombre || `Vendedor`
        }));
        setTodosLosVendedores(vendedores);
      } catch (err) {
        console.error("No se pudieron cargar unidades o vendedores", err);
      }
    };

    cargarRutas();
    cargarDatos();
  }, []);

  const confirmarEliminarRuta = async (id) => {
    try {
      await eliminarRuta(id);
      setRutas(prev => prev.filter(r => r.id !== id));
      setRutaAEliminar(null);
    } catch (err) {
      console.error("Error eliminando ruta:", err);
      alert("No se pudo eliminar la ruta");
    }
  };

  const guardarRutaEditada = async (rutaEditada) => {
    try {
      const res = await actualizarRuta(rutaEditada.id, rutaEditada);
      setRutas(prev => prev.map(r => r.id === rutaEditada.id ? res.data || res : r));
      setRutaAEditar(null);
    } catch (err) {
      console.error("No se pudo actualizar la ruta", err);
      alert("No se pudo actualizar la ruta");
    }
  };  

  return (
    <div className="rutas">
      <header>
        <h2>Rutas</h2>
        <button className="btn-agregar" onClick={() => setRutaAEditar({ modo: "crear" })}>
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

      {/* Modal Crear Ruta */}
      {rutaAEditar?.modo === "crear" && (
        <ModalAgregarRuta
          unidadesDisponibles={todasLasUnidades}
          vendedoresDisponibles={todosLosVendedores}
          onClose={() => setRutaAEditar(null)}
          onGuardar={async (nuevaRuta) => {
            try {
              const res = await crearRuta(nuevaRuta);
              setRutas(prev => [...prev, res.data || res]);
              setRutaAEditar(null);
            } catch (err) {
              console.error("No se pudo crear la ruta", err);
              alert("No se pudo crear la ruta");
            }
          }}
        />
      )}

      {/* Modal Editar Ruta */}
      {rutaAEditar && rutaAEditar?.modo !== "crear" && (
        <ModalEditarRuta
          ruta={rutaAEditar}
          unidadesDisponibles={todasLasUnidades}
          vendedoresDisponibles={todosLosVendedores}
          onClose={() => setRutaAEditar(null)}
          onGuardar={guardarRutaEditada}
        />
      )}

      {/* Modal Eliminar Ruta */}
      {rutaAEliminar && (
        <ModalEliminarRuta
          ruta={rutaAEliminar}
          onClose={() => setRutaAEliminar(null)}
          onConfirmar={confirmarEliminarRuta}
        />
      )}

      {/* Modal Mapa */}
      {rutaSeleccionada && (
        <ModalMapaRuta
          ruta={rutaSeleccionada}
          onClose={() => setRutaSeleccionada(null)}
        />
      )}
    </div>
  );
}