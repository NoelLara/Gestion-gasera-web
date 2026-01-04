import axios from "axios";

export async function obtenerCoordenadas(direccion) {
  const url = "https://nominatim.openstreetmap.org/search";

  const res = await axios.get(url, {
    params: {
      q: direccion,
      format: "json",
      limit: 1
    }
  });

  if (!res.data.length) {
    throw new Error("Dirección no encontrada");
  }

  return {
    lat: parseFloat(res.data[0].lat),
    lng: parseFloat(res.data[0].lon)
  };
}

export function estaEnRuta(pedido, ruta) {
  const latitudes = [
    ruta.direccion_inicial.lat,
    ruta.direccion_final.lat,
    ...(ruta.puntos_intermedios?.map(p => p.lat) || [])
  ];
  const longitudes = [
    ruta.direccion_inicial.lng,
    ruta.direccion_final.lng,
    ...(ruta.puntos_intermedios?.map(p => p.lng) || [])
  ];

  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLng = Math.min(...longitudes);
  const maxLng = Math.max(...longitudes);

  const { lat, lng } = pedido;

  return lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng;
}