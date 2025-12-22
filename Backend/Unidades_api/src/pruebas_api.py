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
    esperar_api()
    r = httpx.get(f"{BASE_URL}/unidades/")
    assert r.status_code == 200

    unidades = r.json()
    assert isinstance(unidades, list)
    assert len(unidades) == 0

def test_crear_unidad_pipa_si_hay_token_admin():
    if not ADMIN_TOKEN:
        return

    esperar_api()
    cliente_http = httpx.Client(
        headers={"Authorization": f"Bearer {ADMIN_TOKEN}"}
    )

    numero_unico = f"TEST-PIPA-{uuid.uuid4().hex[:6]}"
    unidad = {
        "tipo": "pipa",
        "numero_economico": numero_unico,
        "capacidad_litros": 5000,
        "activo": True
    }

    r = cliente_http.post(f"{BASE_URL}/unidades/", json=unidad)
    assert r.status_code == 201, f"Creación falló: {r.status_code} {r.text}"

    data = r.json()
    assert "id" in data
    assert "unidad" in data

    assert data["unidad"]["tipo"] == "pipa"
    assert data["unidad"]["numero_economico"] == numero_unico
    assert data["unidad"]["capacidad_litros"] == 5000

    r = cliente_http.get(f"{BASE_URL}/unidades/")
    assert r.status_code == 200
    lista = r.json()

    assert any(
        u["unidad"]["numero_economico"] == numero_unico
        for u in lista
    )

    cliente_http.close()

def test_crear_unidad_camion_si_hay_token_admin():
    if not ADMIN_TOKEN:
        return

    esperar_api()
    cliente_http = httpx.Client(
        headers={"Authorization": f"Bearer {ADMIN_TOKEN}"}
    )

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

    r = cliente_http.post(f"{BASE_URL}/unidades/", json=unidad)
    assert r.status_code == 201, f"Creación falló: {r.status_code} {r.text}"

    data = r.json()
    assert data["unidad"]["tipo"] == "camion"
    assert data["unidad"]["numero_economico"] == numero_unico
    assert len(data["unidad"]["cilindros"]) == 2

    cliente_http.close()