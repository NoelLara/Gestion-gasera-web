import httpx
import time
import os
from dotenv import load_dotenv

load_dotenv(dotenv_path=".env")

BASE_URL = os.getenv("VENDEDORES_URL", "http://vendedores_api:8002")
USUARIOS_URL = os.getenv("USUARIOS_URL", "http://usuarios_api:8000")

print("VENDEDORES_URL =", BASE_URL)
print("USUARIOS_URL =", USUARIOS_URL)


def esperar_api():
    """Evita fallos por la espera de levantamiento del contenedor."""
    for _ in range(10):
        try:
            r = httpx.get(f"{BASE_URL}/salud")
            if r.status_code == 200:
                print("API lista ✓")
                return
        except:
            pass
        time.sleep(1)
    print("No se pudo contactar la API")

def crear_admin_y_login():
    print("Creando admin global...")

    admin_data = {
        "nombre": "Admin",
        "email": "admin@example.com",
        "contrasena": "admin123",
        "rol": "administrador"
    }

    httpx.post(f"{USUARIOS_URL}/usuarios", json=admin_data)

    print("Haciendo login global...")
    r = httpx.post(
        f"{USUARIOS_URL}/login",
        data={
            "username": admin_data["email"],
            "password": admin_data["contrasena"]
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )

    print("Login respuesta:", r.text)
    assert r.status_code == 200, "No se pudo iniciar sesión"

    token = r.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_crear_vendedor():
    """Prueba que un vendedor se puede crear correctamente"""
    esperar_api()
    headers = crear_admin_y_login()

    vendedor = {
        "nombre": "Test Vendedor",
        "telefono": "555-999-8888",
        "email": "testvendedor@example.com",
        "activo": True
    }

    r = httpx.post(f"{BASE_URL}/vendedores", json=vendedor, headers=headers)
    print("Respuesta crear vendedor:", r.text)

    assert r.status_code == 201
    body = r.json()
    assert body["nombre"] == vendedor["nombre"]
    assert body["email"] == vendedor["email"]

def test_crear_y_listar_vendedor():
    """
    Crea un vendedor y luego verifica que aparezca en la lista.
    Esta prueba funciona aunque ya existan vendedores en la base.
    """
    esperar_api()
    headers = crear_admin_y_login()

    vendedor = {
        "nombre": "Vendedor Lista",
        "telefono": "555-111-2222",
        "email": "vendedorlista@example.com",
        "activo": True
    }

    r_crear = httpx.post(f"{BASE_URL}/vendedores", json=vendedor, headers=headers)
    print("Respuesta crear vendedor para listar:", r_crear.text)
    assert r_crear.status_code == 201
    body_crear = r_crear.json()
    assert body_crear["nombre"] == vendedor["nombre"]

    r_listar = httpx.get(f"{BASE_URL}/vendedores", headers=headers)
    print("Respuesta listar vendedores:", r_listar.text)
    assert r_listar.status_code == 200
    vendedores = r_listar.json()

    assert any(v["email"] == vendedor["email"] for v in vendedores)