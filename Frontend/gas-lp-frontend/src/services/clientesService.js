import axios from "axios";

const BASE_URL = "http://localhost:8000";

export const getClientes = async () => {
  const res = await axios.get(`${BASE_URL}/usuarios`);
  return res.data.filter(c => c.rol === "cliente");
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