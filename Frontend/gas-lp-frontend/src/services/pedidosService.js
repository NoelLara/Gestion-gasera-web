import axios from "axios";

const API_URL = "http://localhost:8004";

export const getPedidos = async () => {
  return axios.get(`${API_URL}/pedidos`);
};

export const crearPedido = async (data) => {
  return axios.post(`${API_URL}/pedidos`, data);
};

export const asignarPedido = async (idPedido, data) => {
  return axios.put(`${API_URL}/pedidos/${idPedido}/asignar`, data);
};

export const cambiarEstadoPedido = async (idPedido, estado) => {
  return axios.put(`${API_URL}/pedidos/${idPedido}/estado`, {
    estado,
  });
};