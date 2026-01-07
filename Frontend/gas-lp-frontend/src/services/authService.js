import axios from "axios";

const API_URL = "http://localhost:8000";

export async function login(correo, contraseña) {
  const formData = new URLSearchParams();
  formData.append("username", correo);
  formData.append("password", contraseña);

  const r = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: formData
  });

  if (!r.ok) {
    throw new Error("Credenciales incorrectas");
  }

  return r.json();
}

export async function obtenerPerfil() {
  const token = sessionStorage.getItem("token");

  const r = await fetch("http://localhost:8000/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!r.ok) throw new Error("No autorizado");
  return r.json();
}

export const actualizarPerfil = async (idUsuario, data) => {
  const token = sessionStorage.getItem("token");

  return axios.patch(
    `${API_URL}/usuarios/${idUsuario}`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const registrar = async (usuario) => {
  return axios.post("http://localhost:8000/usuarios", usuario);
};