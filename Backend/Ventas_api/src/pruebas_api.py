import httpx
import time
import os

BASE_URL = os.getenv("VENTAS_URL", "http://ventas_api:8005")

def esperar_api():
    for _ in range(10):
        try:
            r = httpx.get(f"{BASE_URL}/salud")
            if r.status_code == 200:
                return
        except:
            pass
        time.sleep(1)
    raise Exception("API de ventas no disponible")


def test_registrar_venta():
    esperar_api()

    venta = {
        "idPedido": 1,
        "tipoVenta": "cilindro",
        "cantidad": 2,
        "precioTotal": 1500,
        "idVendedor": 1,
        "idUnidad": 1
    }

    r = httpx.post(f"{BASE_URL}/ventas", json=venta)
    assert r.status_code == 201
    assert r.json()["precioTotal"] == 1500


def test_corte_diario():
    esperar_api()

    r = httpx.get(f"{BASE_URL}/ventas/corte", params={"fecha": "2025-12-14"})
    assert r.status_code == 200
    assert "montoTotal" in r.json()


def test_reporte_fechas():
    esperar_api()

    r = httpx.get(
        f"{BASE_URL}/ventas/reporte",
        params={"inicio": "2025-12-01", "fin": "2025-12-31"}
    )
    assert r.status_code == 200
    assert isinstance(r.json()["ventas"], list)