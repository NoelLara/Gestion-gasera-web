const API_URL = "http://localhost:8001/unidades/";

export async function obtenerUnidades(token) {
  const r = await fetch(API_URL, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return r.json();
}

export async function crearUnidad(data, token) {
  const r = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  return r.json();
}

export async function editarUnidad(id, data, token) {
  const r = await fetch(`${API_URL}/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  return r.json();
}

export async function eliminarUnidad(id, token) {
  await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}