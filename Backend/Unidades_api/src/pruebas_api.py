import httpx
import time
import os
import uuid
from pymongo import MongoClient

BASE_URL = os.getenv("BASE_URL", "http://unidades_api_test:8001")
USUARIOS_URL = "http://usuarios_api_test:8000"

MONGO_URI = os.getenv("MONGO_URI")
MONGO_DB = os.getenv("MONGO_DB")

cliente_mongo = MongoClient(MONGO_URI)
db = cliente_mongo[MONGO_DB]

coleccion_unidades = db["unidades"]
coleccion_usuarios = db["usuarios"]

_admin_token = None

def esperar_api():
    for _ in range(20):
        try:
            r = httpx.get(f"{BASE_URL}/salud", timeout=2)
            if r.status_code == 200:
                return
        except Exception:
            pass
        time.sleep(1)
    raise RuntimeError("API no disponible")


def limpiar_bd():
    coleccion_unidades.delete_many({})

def crear_admin_y_token():
    """
    Crea el admin SOLO UNA VEZ y reutiliza el token
    """
    global _admin_token

    if _admin_token:
        return _admin_token

    admin = {
        "nombre": "Admin Test",
        "correo": "admin_test@correo.com",
        "telefono": "5512345678",
        "contrasena": "admin123",
        "rol": "administrador"
    }

    r = httpx.post(f"{USUARIOS_URL}/usuarios", json=admin)
    if r.status_code not in (201, 400):
        raise RuntimeError(f"Error creando admin: {r.status_code} {r.text}")

    r = httpx.post(
        f"{USUARIOS_URL}/login",
        data={
            "username": admin["correo"],
            "password": admin["contrasena"]
        }
    )
    assert r.status_code == 200

    _admin_token = r.json()["access_token"]
    return _admin_token

def test_listar_unidades_vacio_por_defecto():
    esperar_api()
    limpiar_bd()

    r = httpx.get(f"{BASE_URL}/unidades/")
    assert r.status_code == 200
    assert r.json() == []


def test_crear_unidad_pipa_como_admin():
    esperar_api()
    limpiar_bd()

    token = crear_admin_y_token()
    headers = {"Authorization": f"Bearer {token}"}

    numero_unico = f"TEST-PIPA-{uuid.uuid4().hex[:6]}"

    unidad = {
        "tipo": "pipa",
        "numero_economico": numero_unico,
        "capacidad_litros": 5000,
        "activo": True
    }

    r = httpx.post(f"{BASE_URL}/unidades/", json=unidad, headers=headers)
    assert r.status_code == 201

    data = r.json()
    assert data["unidad"]["numero_economico"] == numero_unico
    assert data["unidad"]["tipo"] == "pipa"


def test_crear_unidad_camion_como_admin():
    esperar_api()
    limpiar_bd()

    token = crear_admin_y_token()
    headers = {"Authorization": f"Bearer {token}"}

    numero_unico = f"TEST-CAM-{uuid.uuid4().hex[:6]}"

    unidad = {
        "tipo": "camion",
        "numero_economico": numero_unico,
        "cilindros": [
            {"capacidad": 20, "cantidad": 5},
            {"capacidad": 30, "cantidad": 2}
        ],
        "activo": True
    }

    r = httpx.post(f"{BASE_URL}/unidades/", json=unidad, headers=headers)
    assert r.status_code == 201

    data = r.json()
    assert data["unidad"]["tipo"] == "camion"
    assert len(data["unidad"]["cilindros"]) == 2