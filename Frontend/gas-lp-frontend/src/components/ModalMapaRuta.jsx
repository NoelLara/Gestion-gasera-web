import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Polyline, useMap } from "react-leaflet";
import { obtenerRutaOSRM } from "../utils/osrm";
import "leaflet/dist/leaflet.css";
import "./ModalMapaRuta.scss";

function AjustarMapa({ ruta }) {
  const map = useMap();

  useEffect(() => {
    if (ruta.length > 0) {
      setTimeout(() => {
        map.fitBounds(ruta, {
          padding: [50, 50]
        });
        map.invalidateSize();
      }, 300);
    }
  }, [ruta, map]);

  return null;
}

export default function ModalMapaRuta({ ruta, onClose }) {
  const [rutaReal, setRutaReal] = useState([]);

  useEffect(() => {
    const puntos = [
      ruta.direccion_inicial,
      ...ruta.puntos_intermedios,
      ruta.direccion_final
    ];

    obtenerRutaOSRM(puntos).then(setRutaReal);
  }, [ruta]);

  return (
    <div className="modal-overlay">
      <div className="modal-mapa">
        <div className="modal-header">
          <h3>{ruta.nombre}</h3>
          <button onClick={onClose}>✖</button>
        </div>

        <div className="mapa-container">
          <MapContainer
            center={[19.4326, -99.1332]} // fallback
            zoom={13}
            zoomControl={false}
            dragging={false}
            scrollWheelZoom={false}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {rutaReal.length > 0 && (
              <>
                <Polyline
                  positions={rutaReal}
                  pathOptions={{
                    color: "#4A6FA5", // 💙 tu color gas
                    weight: 5,
                    opacity: 0.9
                  }}
                />
                <AjustarMapa ruta={rutaReal} />
              </>
            )}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}