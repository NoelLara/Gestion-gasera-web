import axios from "axios";

const API_VENTAS = "http://localhost:8005";
const API_VENDEDORES = "http://localhost:8002";

const authHeaders = () => ({
  headers: {
    Authorization: `Bearer ${sessionStorage.getItem("token")}`
  }
});

export const listarVendedores = () => {
  return axios.get(`${API_VENDEDORES}/vendedores`, authHeaders());
};

export const listarVentasPorVendedor = (idVendedor) => {
  return axios.get(
    `${API_VENTAS}/ventas/ventasPorVendedor`,
    {
      ...authHeaders(),
      params: { idVendedor }
    }
  );
};

export const pagarAdeudo = (idVenta) => {
  return axios.patch(
    `${API_VENTAS}/ventas/pagarAdeudo`,
    null,
    {
      ...authHeaders(),
      params: { idVenta }
    }
  );
};