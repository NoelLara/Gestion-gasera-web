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