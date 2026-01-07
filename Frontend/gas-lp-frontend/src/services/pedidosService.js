import axios from "axios";

const API_URL = "http://localhost:8004";

const authHeaders = () => {
  const token = sessionStorage.getItem("token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const getPedidos = async () => {
  return axios.get(`${API_URL}/pedidos`);
};

export const getPedidosCliente = async (idCliente) => {
  return axios.get(`${API_URL}/clientes/${idCliente}/pedidos`);
};

export const crearPedido = async (data) => {
  return axios.post(`${API_URL}/pedidos`, data);
};

export const cancelarPedido = async (idPedido) => {
  return axios.put(`${API_URL}/pedidos/${idPedido}/cancelar`);
};

export const asignarPedido = async (idPedido, data) => {
  return axios.put(`${API_URL}/pedidos/${idPedido}/asignar`, data);
};

export const cambiarEstadoPedido = async (idPedido, estado) => {
  return axios.put(`${API_URL}/pedidos/${idPedido}/estado`, { estado });
};

export const getPedidosVendedor = (idVendedor) =>
  axios.get(`${API_URL}/vendedores/${idVendedor}/pedidos`, authHeaders());

export const actualizarEstadoPedido = (idPedido, estado) =>
  axios.put(`${API_URL}/pedidos/${idPedido}/estado`, { estado }, authHeaders());