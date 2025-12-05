# pruebas_api.py
import httpx
import time
import os
import uuid

BASE_URL = os.getenv("BASE_URL", "http://unidades_api:8001")
ADMIN_TOKEN = os.getenv("ADMIN_TOKEN")

def esperar_api():
    """Espera a que la API responda en /salud"""
    for _ in range(20):
        try:
            r = httpx.get(f"{BASE_URL}/salud", timeout=2.0)
            if r.status_code == 200:
                return
        except Exception:
            pass
        time.sleep(1)
    raise RuntimeError("La API no respondió en el tiempo esperado")

def test_listar_unidades_vacio_por_defecto():
    """Verifica que la lista de unidades esté vacía por defecto"""
    esperar_api()
    r = httpx.get(f"{BASE_URL}/unidades/")
    assert r.status_code == 200
    unidades = r.json()
    assert isinstance(unidades, list)
    assert len(unidades) == 0

def test_crear_unidad_si_hay_token_admin():
    """
    Intenta crear una unidad usando ADMIN_TOKEN si está definido.
    Útil para CI cuando tienes un token admin generado por Usuarios_api.
    """
    if not ADMIN_TOKEN:
        return

    esperar_api()
    cliente_http = httpx.Client(headers={"Authorization": f"Bearer {ADMIN_TOKEN}"})

    numero_unico = f"TEST-{uuid.uuid4().hex[:6]}"
    unidad = {
        "numero_economico": numero_unico,
        "tipo": "pipa",
        "capacidad_litros": 5000,
        "activo": True
    }

    r = cliente_http.post(f"{BASE_URL}/unidades/", json=unidad)
    assert r.status_code == 201, f"Creación falló: {r.status_code} {r.text}"
    data = r.json()
    assert data["tipo"] == unidad["tipo"]
    assert data["numero_economico"] == numero_unico

    r = cliente_http.get(f"{BASE_URL}/unidades/")
    assert r.status_code == 200
    lista = r.json()
    assert any(u["numero_economico"] == numero_unico for u in lista)

    cliente_http.close()