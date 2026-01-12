import axios from "axios";

const API_URL = "http://localhost:8005";

export const registrarVenta = (venta) => {
  return axios.post(`${API_URL}/ventas`, venta);
};

export const listarVentas = () => {
  return axios.get(`${API_URL}/ventas`);
};

export const corteDiario = (fecha) => {
  return axios.get(`${API_URL}/ventas/corte`, {
    params: { fecha }
  });
};

export const reportePorFechas = (inicio, fin) => {
  return axios.get(`${API_URL}/ventas/reporte`, {
    params: { inicio, fin }
  });
};

export const registrarVentaExterna = (venta) => {
  return axios.post(`${API_URL}/ventas/externa`, venta);
};