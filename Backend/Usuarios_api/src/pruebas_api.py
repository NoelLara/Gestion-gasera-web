import httpx
import time
import os
import uuid

BASE_URL = os.getenv("BASE_URL", "http://usuarios_api:8000")

def esperar_api():
    """Espera a que la API responda en /salud, hasta 20 segundos."""
    for _ in range(20):
        try:
            r = httpx.get(f"{BASE_URL}/salud", timeout=2.0)
            if r.status_code == 200:
                print("API lista para recibir pruebas")
                return
        except Exception:
            pass
        time.sleep(1)
    raise RuntimeError("La API no respondió en el tiempo esperado")

def test_registro_y_login():
    esperar_api()

    cliente_http = httpx.Client()

    correo_unico = f"prueba_{uuid.uuid4().hex}@example.com"

    usuario = {
        "nombre": "Prueba Usuario",
        "correo": correo_unico,
        "telefono": "+5215512345678",
        "contrasena": "miclave123",
        "rol": "cliente"
    }

    try:
        r = cliente_http.post(f"{BASE_URL}/usuarios", json=usuario, timeout=5.0)
    except Exception as e:
        raise RuntimeError(f"No se pudo conectar a la API: {e}")

    print("Registro respuesta:", r.status_code, r.text)
    assert r.status_code == 201, f"Registro falló: {r.status_code} {r.text}"

    data = r.json()
    assert data["correo"] == usuario["correo"]
    user_id = data["id"]

    try:
        r = cliente_http.post(
            f"{BASE_URL}/login",
            data={
                "username": usuario["correo"],
                "password": usuario["contrasena"]
            },
            timeout=5.0
        )
    except Exception as e:
        raise RuntimeError(f"No se pudo conectar al login: {e}")

    print("Login respuesta:", r.status_code, r.text)
    assert r.status_code == 200, f"Login falló: {r.status_code} {r.text}"

    token = r.json().get("access_token")
    assert token, "No se recibió token JWT"

    headers = {"Authorization": f"Bearer {token}"}

    r = cliente_http.get(f"{BASE_URL}/usuarios/{user_id}", headers=headers, timeout=5.0)
    print("Obtener usuario respuesta:", r.status_code, r.text)
    assert r.status_code == 200
    data = r.json()
    assert data["correo"] == usuario["correo"]

    r = cliente_http.get(f"{BASE_URL}/me", headers=headers, timeout=5.0)
    print("/me respuesta:", r.status_code, r.text)
    assert r.status_code == 200

    cliente_http.close()