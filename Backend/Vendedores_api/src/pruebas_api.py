import httpx
import time
import os
import pytest
from dotenv import load_dotenv

load_dotenv(".env")

USUARIOS_URL = os.getenv("USUARIOS_URL", "http://usuarios_api:8000")
VENDEDORES_URL = os.getenv("VENDEDORES_URL","http://vendedores_api_test:8002")

def esperar_api():
    for _ in range(15):
        try:
            r = httpx.get(f"{VENDEDORES_URL}/salud", timeout=2)
            if r.status_code == 200:
                print("API de vendedores lista")
                return
        except Exception:
            pass
        time.sleep(1)
    raise RuntimeError("La API de vendedores no respondió")

def login_admin():
    r = httpx.post(
        f"{USUARIOS_URL}/login",
        data={
            "username": "admin@correo.com",
            "password": "admin123"
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        timeout=5
    )
    assert r.status_code == 200, "Login admin falló"
    return r.json()["access_token"]

@pytest.fixture(scope="session", autouse=True)
def api_lista():
    esperar_api()

@pytest.fixture(scope="session")
def token_admin():
    return login_admin()

@pytest.fixture
def headers_admin(token_admin):
    return {"Authorization": f"Bearer {token_admin}"}

@pytest.fixture
def vendedor_creado(headers_admin):
    correo = f"vendedor_{int(time.time() * 1000)}@test.com"
    vendedor = {
        "nombre": "Vendedor Prueba",
        "telefono": "5512345678",
        "correo": correo,
        "activo": True
    }

    r = httpx.post(
        f"{VENDEDORES_URL}/vendedores",
        json=vendedor,
        headers=headers_admin,
        timeout=5
    )
    assert r.status_code == 201

    data = r.json()
    vendedor_id = data["idVendedor"]

    yield vendedor_id, correo

    r = httpx.delete(
        f"{VENDEDORES_URL}/vendedores/{vendedor_id}",
        headers=headers_admin,
        timeout=5
    )
    assert r.status_code in (204, 404)

def test_crear_vendedor(headers_admin):
    correo = f"crear_{int(time.time() * 1000)}@test.com"
    vendedor = {
        "nombre": "Vendedor Crear",
        "telefono": "5599999999",
        "correo": correo,
        "activo": True
    }

    r = httpx.post(
        f"{VENDEDORES_URL}/vendedores",
        json=vendedor,
        headers=headers_admin,
        timeout=5
    )
    assert r.status_code == 201

    vendedor_id = r.json()["idVendedor"]

    r = httpx.delete(
        f"{VENDEDORES_URL}/vendedores/{vendedor_id}",
        headers=headers_admin,
        timeout=5
    )
    assert r.status_code == 204


def test_listar_vendedores(vendedor_creado, headers_admin):
    _, correo = vendedor_creado

    r = httpx.get(
        f"{VENDEDORES_URL}/vendedores",
        headers=headers_admin,
        timeout=5
    )
    assert r.status_code == 200

    data = r.json()
    assert isinstance(data, list)
    assert any(v["correo"] == correo for v in data)


def test_no_permitir_correo_duplicado(headers_admin):
    correo = f"dup_{int(time.time() * 1000)}@test.com"
    vendedor = {
        "nombre": "Vendedor Uno",
        "telefono": "5511111111",
        "correo": correo,
        "activo": True
    }

    r1 = httpx.post(
        f"{VENDEDORES_URL}/vendedores",
        json=vendedor,
        headers=headers_admin,
        timeout=5
    )
    assert r1.status_code == 201
    vendedor_id = r1.json()["idVendedor"]

    r2 = httpx.post(
        f"{VENDEDORES_URL}/vendedores",
        json=vendedor,
        headers=headers_admin,
        timeout=5
    )
    assert r2.status_code == 400

    r = httpx.delete(
        f"{VENDEDORES_URL}/vendedores/{vendedor_id}",
        headers=headers_admin,
        timeout=5
    )
    assert r.status_code == 204