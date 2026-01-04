import axios from "axios";

const BASE_URL = "http://localhost:8000";

export const getClientes = async () => {
  const token = sessionStorage.getItem("token");
  const res = await axios.get("http://localhost:8000/clientes", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return res.data;
};

export const crearCliente = async ({ nombre, correo, contrasena }) => {
  const res = await axios.post(`${BASE_URL}/usuarios`, {
    nombre,
    correo,
    contrasena,
    rol: "cliente"
  });
  return res.data;
};

export const actualizarCliente = async (id, { nombre, correo, contrasena }) => {
  const res = await axios.patch(`${BASE_URL}/usuarios/${id}`, {
    nombre,
    correo,
    contrasena
  });
  return res.data;
};

export const eliminarCliente = async (id) => {
  const res = await axios.delete(`${BASE_URL}/usuarios/${id}`);
  return res.data;
};