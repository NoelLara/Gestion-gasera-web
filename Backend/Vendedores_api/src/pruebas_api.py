import httpx
import time
import os
from dotenv import load_dotenv

load_dotenv(".env")

USUARIOS_URL = os.getenv("USUARIOS_URL", "http://usuarios_api:8000")
VENDEDORES_URL = os.getenv("VENDEDORES_URL", "http://vendedores_api:8002")

def esperar_api():
    for _ in range(10):
        try:
            r = httpx.get(f"{VENDEDORES_URL}/salud")
            if r.status_code == 200:
                print("API lista")
                return
        except:
            pass
        time.sleep(1)
    raise Exception("La API no respondió")

def login_admin():
    """
    Usa el admin creado automáticamente al iniciar el contenedor
    """
    login = httpx.post(
        f"{USUARIOS_URL}/login",
        data={
            "username": "admin@correo.com",
            "password": "admin123"
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    assert login.status_code == 200, "No se pudo hacer login como admin"
    return login.json()["access_token"]

def eliminar_vendedor(vendedor_id, token):
    if vendedor_id:
        httpx.delete(
            f"{VENDEDORES_URL}/vendedores/{vendedor_id}",
            headers={"Authorization": f"Bearer {token}"}
        )

def test_crear_vendedor():
    esperar_api()
    token = login_admin()
    headers = {"Authorization": f"Bearer {token}"}

    vendedor_id = None
    try:
        correo_unico = f"vendedor_{int(time.time()*1000)}@test.com"
        vendedor = {
            "nombre": "Vendedor Prueba",
            "telefono": "5512345678",
            "correo": correo_unico,
            "activo": True
        }
        r = httpx.post(
            f"{VENDEDORES_URL}/vendedores",
            json=vendedor,
            headers=headers
        )
        assert r.status_code == 201
        data = r.json()
        vendedor_id = data["idVendedor"]
    finally:
        eliminar_vendedor(vendedor_id, token)

def test_crear_y_listar_vendedor():
    esperar_api()
    token = login_admin()
    headers = {"Authorization": f"Bearer {token}"}

    vendedor_id = None
    try:
        correo_unico = f"listado_{int(time.time()*1000)}@test.com"
        vendedor = {
            "nombre": "Vendedor Lista",
            "telefono": "5599999999",
            "correo": correo_unico,
            "activo": True
        }
        crear = httpx.post(
            f"{VENDEDORES_URL}/vendedores",
            json=vendedor,
            headers=headers
        )
        assert crear.status_code == 201
        vendedor_id = crear.json()["idVendedor"]

        listar = httpx.get(
            f"{VENDEDORES_URL}/vendedores",
            headers=headers
        )
        assert listar.status_code == 200
        data = listar.json()
        assert any(v["correo"] == correo_unico for v in data)
    finally:
        eliminar_vendedor(vendedor_id, token)