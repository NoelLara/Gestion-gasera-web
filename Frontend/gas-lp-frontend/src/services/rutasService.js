import axios from "axios";

const API_URL = "http://localhost:8003";

export const obtenerRutas = () =>
  axios.get(`${API_URL}/rutas/`);

export const obtenerRuta = (id) =>
  axios.get(`${API_URL}/rutas/${id}`);

export const crearRuta = (ruta) =>
  axios.post(`${API_URL}/rutas/crear`, ruta);

export const actualizarRuta = (id, ruta) =>
  axios.put(`${API_URL}/rutas/${id}`, ruta);

export const atenderCliente = (rutaId, clienteId) =>
  axios.put(`${API_URL}/rutas/${rutaId}/clientes/${clienteId}/atender`);

export const eliminarRuta = (id) =>
  axios.delete(`${API_URL}/rutas/${id}`);