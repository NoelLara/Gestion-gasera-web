import httpx
import time
import os
import uuid

BASE_URL = os.getenv("BASE_URL", "http://rutas_api:8003")

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


def test_rutas_crud():
    esperar_api()
    cliente_http = httpx.Client()

    nombre_unico = f"RUTA-TEST-{uuid.uuid4().hex[:6]}"

    ruta = {
        "nombre": nombre_unico,
        "direccion_inicial": {
            "calle": "Av A",
            "numero": "123",
            "lat": 19.4326,
            "lng": -99.1332
        },
        "direccion_final": {
            "calle": "Av B",
            "numero": "456",
            "lat": 19.43,
            "lng": -99.14
        },
        "puntos_intermedios": [
            {
                "calle": "Calle X",
                "numero": "10",
                "lat": 19.431,
                "lng": -99.13
            }
        ],
        "unidades_asignadas": [1],
        "vendedores_asignados": [101],
        "clientes_pendientes": [201, 202]
    }

    r = cliente_http.post(f"{BASE_URL}/rutas/crear", json=ruta)
    assert r.status_code == 200, f"Error creando ruta: {r.status_code} {r.text}"
    ruta_creada = r.json()
    ruta_id = ruta_creada["id"]

    r = cliente_http.get(f"{BASE_URL}/rutas/")
    assert r.status_code == 200
    assert any(r["id"] == ruta_id for r in r.json())

    r = cliente_http.get(f"{BASE_URL}/rutas/{ruta_id}")
    assert r.status_code == 200

    ruta_actualizada = ruta.copy()
    ruta_actualizada["nombre"] = "Nombre actualizado"
    r = cliente_http.put(f"{BASE_URL}/rutas/{ruta_id}", json=ruta_actualizada)
    assert r.status_code == 200
    assert r.json()["nombre"] == "Nombre actualizado"

    r = cliente_http.put(f"{BASE_URL}/rutas/{ruta_id}/clientes/201/atender")
    assert r.status_code == 200
    data = r.json()
    assert 201 not in data["clientes_pendientes"]
    assert 201 in data["clientes_atendidos"]

    r = cliente_http.delete(f"{BASE_URL}/rutas/{ruta_id}")
    assert r.status_code == 200

    cliente_http.close()
