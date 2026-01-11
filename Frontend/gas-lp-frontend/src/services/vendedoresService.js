import axios from "axios";
import { getPedidosVendedor } from "./pedidosService";

const API_URL_AUTH = "http://localhost:8000";
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

export const crearUsuarioVendedor = (data) => {
  return axios.post(
    `${API_URL_AUTH}/usuarios/vendedor`,
    {
      nombre: data.nombre,
      correo: data.correo,
      telefono: data.telefono,
      rol: "vendedor",
      activo: true,
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      }
    }
  );
};

export const getPedidosDelVendedorLogueado = async () => {
  const perfil = JSON.parse(sessionStorage.getItem("perfil"));

  const vendedorRes = await axios.get(
    `${API_URL}/vendedores/usuario/${perfil.id}`,
    authHeaders()
  );

  const idVendedor = vendedorRes.data.idVendedor;

  const pedidosRes = await getPedidosVendedor(idVendedor);

  return pedidosRes;
};

export const getMiPerfil = () =>
  axios.get(`${API_URL_AUTH}/me`, authHeaders());

export const actualizarMiPerfilVendedor = (data) =>
  axios.patch(
    `${API_URL_AUTH}/usuarios/vendedor/me`,
    data,
    authHeaders()
  );