import axios from "axios";

const API_URL = "http://localhost:8002";

const authHeaders = () => ({
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${sessionStorage.getItem("token")}`,
  },
});

export const getVendedores = () =>
  axios.get(`${API_URL}/vendedores`, authHeaders());

export const crearVendedor = (data) =>
  axios.post(`${API_URL}/vendedores`, data, authHeaders());

export const editarVendedor = (id, data) =>
  axios.put(`${API_URL}/vendedores/${id}`, data, authHeaders());