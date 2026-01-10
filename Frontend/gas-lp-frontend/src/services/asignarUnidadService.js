import axios from "axios";

const API_UNIDADES = "http://localhost:8001";
const API_VENDEDORES = "http://localhost:8002";

const authHeaders = () => ({
  headers: {
    Authorization: `Bearer ${sessionStorage.getItem("token")}`
  }
});

export const listarUnidades = () => {
  return axios.get(`${API_UNIDADES}/unidades`);
};

export const listarVendedores = () => {
  return axios.get(`${API_VENDEDORES}/vendedores`, authHeaders());
};

export const obtenerAsignacionesUnidad = (idUnidad) => {
  return axios.get(
    `${API_UNIDADES}/unidades/${idUnidad}/asignaciones`,
    authHeaders()
  );
};

export const asignarVendedorUnidad = (idUnidad, idVendedor) => {
  return axios.post(
    `${API_UNIDADES}/unidades/${idUnidad}/asignar-vendedor`,
    { idVendedor },
    authHeaders()
  );
};