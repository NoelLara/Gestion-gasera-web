const API_URL = "http://localhost:8001/login";

export async function login(correo, contraseña) {
  const formData = new URLSearchParams();
  formData.append("username", correo);
  formData.append("password", contraseña);

  const r = await fetch(API_URL, {
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