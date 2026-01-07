import axios from "axios";

export async function obtenerRutaOSRM(puntos) {
  const coords = puntos
    .map(p => `${p.lng},${p.lat}`)
    .join(";");

  const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;

  const res = await axios.get(url);
  return res.data.routes[0].geometry.coordinates.map(
    ([lng, lat]) => [lat, lng]
  );
}