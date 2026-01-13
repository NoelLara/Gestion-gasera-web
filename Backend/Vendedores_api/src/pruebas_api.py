import httpx
import time
import os
import pytest
from pymongo import MongoClient

USUARIOS_URL = os.getenv("USUARIOS_URL", "http://usuarios_api_test:8000")
VENDEDORES_URL = os.getenv("BASE_URL", "http://vendedores_api_test:8002")
MONGO_URI = os.getenv("MONGO_URI")
MONGO_DB = os.getenv("MONGO_DB")

def esperar_api():
    for _ in range(15):
        try:
            r = httpx.get(f"{VENDEDORES_URL}/salud", timeout=2)
            if r.status_code == 200:
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
    assert r.status_code == 200
    return r.json()["access_token"]

@pytest.fixture(scope="session", autouse=True)
def api_lista():
    esperar_api()

@pytest.fixture(scope="session")
def headers_admin():
    token = login_admin()
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture(autouse=True)
def limpiar_vendedores():
    client = MongoClient(MONGO_URI)
    db = client[MONGO_DB]

    db.vendedores.delete_many({})

    yield

    db.vendedores.delete_many({})

@pytest.fixture
def vendedor_creado(headers_admin):
    correo = f"vendedor_{int(time.time() * 1000)}@test.com"

    payload = {
        "nombre": "Vendedor Prueba",
        "correo": correo,
        "telefono": "5512345678",
        "rol": "vendedor",
        "activo": True
    }

    r = httpx.post(
        f"{USUARIOS_URL}/usuarios/vendedor",
        json=payload,
        headers=headers_admin,
        timeout=5
    )
    assert r.status_code == 201

    data = r.json()
    id_usuario = data["id"]

    r2 = httpx.post(
        f"{VENDEDORES_URL}/vendedores",
        json={
            "nombre": payload["nombre"],
            "correo": correo,
            "telefono": payload["telefono"],
            "activo": True,
            "idUsuario": id_usuario
        },
        headers=headers_admin,
        timeout=5
    )
    assert r2.status_code == 201

    vendedor = r2.json()

    yield vendedor["correo"]

def test_crear_vendedor(headers_admin):
    correo = f"crear_{int(time.time() * 1000)}@test.com"

    payload = {
        "nombre": "Vendedor Crear",
        "correo": correo,
        "telefono": "5599999999",
        "rol": "vendedor",
        "activo": True
    }

    r = httpx.post(
        f"{USUARIOS_URL}/usuarios/vendedor",
        json=payload,
        headers=headers_admin,
        timeout=5
    )

    assert r.status_code == 201
    assert r.json()["correo"] == correo

def test_listar_vendedores(vendedor_creado, headers_admin):
    correo = vendedor_creado

    r = httpx.get(
        f"{VENDEDORES_URL}/vendedores",
        headers=headers_admin,
        timeout=5
    )

    assert r.status_code == 200
    assert any(v["correo"] == correo for v in r.json())

def test_no_permitir_correo_duplicado(headers_admin):
    correo = f"dup_{int(time.time() * 1000)}@test.com"

    payload = {
        "nombre": "Vendedor Uno",
        "correo": correo,
        "telefono": "5511111111",
        "rol": "vendedor",
        "activo": True
    }

    r1 = httpx.post(
        f"{USUARIOS_URL}/usuarios/vendedor",
        json=payload,
        headers=headers_admin
    )
    assert r1.status_code == 201

    r2 = httpx.post(
        f"{USUARIOS_URL}/usuarios/vendedor",
        json=payload,
        headers=headers_admin
    )
    assert r2.status_code == 400