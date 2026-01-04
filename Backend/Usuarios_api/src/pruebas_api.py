import httpx
import time
import os
import uuid
import pytest

BASE_URL = os.getenv("BASE_URL", "http://usuarios_api_test:8000")

def esperar_api():
    for _ in range(15):
        try:
            r = httpx.get(f"{BASE_URL}/salud", timeout=2)
            if r.status_code == 200:
                return
        except Exception:
            pass
        time.sleep(1)
    raise RuntimeError("La API de usuarios no respondió")

@pytest.fixture(scope="session", autouse=True)
def api_lista():
    esperar_api()

@pytest.fixture
def cliente():
    with httpx.Client(timeout=5) as client:
        yield client

@pytest.fixture
def usuario_creado(cliente):
    correo = f"prueba_{uuid.uuid4().hex}@test.com"
    usuario = {
        "nombre": "Usuario Prueba",
        "correo": correo,
        "telefono": "+5215512345678",
        "contrasena": "miclave123",
        "rol": "cliente"
    }

    r = cliente.post(f"{BASE_URL}/usuarios", json=usuario)
    assert r.status_code == 201

    data = r.json()
    user_id = data["id"]

    r = cliente.post(
        f"{BASE_URL}/login",
        data={
            "username": correo,
            "password": "miclave123"
        }
    )
    assert r.status_code == 200
    token = r.json()["access_token"]

    headers = {"Authorization": f"Bearer {token}"}

    yield user_id, correo, headers

    r = cliente.delete(
        f"{BASE_URL}/usuarios/{user_id}",
        headers=headers
    )
    assert r.status_code in (204, 404)

def test_registro_usuario(cliente):
    correo = f"registro_{uuid.uuid4().hex}@test.com"

    usuario = {
        "nombre": "Registro Usuario",
        "correo": correo,
        "telefono": "+5215511111111",
        "contrasena": "clave123",
        "rol": "cliente"
    }

    r = cliente.post(f"{BASE_URL}/usuarios", json=usuario)
    assert r.status_code == 201
    assert r.json()["correo"] == correo

def test_login_y_me(usuario_creado, cliente):
    user_id, correo, headers = usuario_creado

    r = cliente.get(f"{BASE_URL}/me", headers=headers)
    assert r.status_code == 200
    assert r.json()["correo"] == correo

def test_obtener_usuario_por_id(usuario_creado, cliente):
    user_id, correo, headers = usuario_creado

    r = cliente.get(
        f"{BASE_URL}/usuarios/{user_id}",
        headers=headers
    )
    assert r.status_code == 200
    assert r.json()["correo"] == correo