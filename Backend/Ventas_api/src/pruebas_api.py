import httpx
import time
import os
from pymongo import MongoClient
from datetime import datetime

BASE_URL = os.getenv("VENTAS_URL", "http://ventas_api_test:8005")
MONGO_URI = os.getenv("MONGO_URI", "mongodb://root:rootpassword@mongo_test:27017/")
MONGO_DB = os.getenv("MONGO_DB", "GasAppTest_Ventas")

client = MongoClient(MONGO_URI)
db = client[MONGO_DB]

def esperar_api():
    """Espera hasta 30 segundos a que la API de ventas esté disponible"""
    for _ in range(30):
        try:
            r = httpx.get(f"{BASE_URL}/salud", timeout=2)
            if r.status_code == 200:
                return
        except:
            pass
        time.sleep(1)
    raise RuntimeError("API de ventas no disponible")

def limpiar_bd():
    """Elimina completamente la base de datos de test"""
    client.drop_database(MONGO_DB)

def test_registrar_venta():
    esperar_api()
    limpiar_bd()

    venta = {
        "idPedido": 1,
        "tipoVenta": "cilindro",
        "cantidad": 2,
        "precioTotal": 1500,
        "idVendedor": 1,
        "idUnidad": "1"
    }

    r = httpx.post(f"{BASE_URL}/ventas", json=venta, timeout=10)
    assert r.status_code == 201

    data = r.json()
    assert data["precioTotal"] == 1500
    assert data["idVenta"] == 1

def test_corte_diario():
    esperar_api()
    limpiar_bd()

    venta = {
        "idPedido": 1,
        "tipoVenta": "cilindro",
        "cantidad": 2,
        "precioTotal": 1500,
        "idVendedor": 1,
        "idUnidad": "1"
    }
    httpx.post(f"{BASE_URL}/ventas", json=venta, timeout=10)

    hoy = datetime.utcnow().date().isoformat()
    r = httpx.get(f"{BASE_URL}/ventas/corte", params={"fecha": hoy}, timeout=10)
    assert r.status_code == 200

    data = r.json()
    assert data["totalVentas"] == 1
    assert data["montoTotal"] == 1500

def test_reporte_fechas():
    esperar_api()
    limpiar_bd()

    venta = {
        "idPedido": 1,
        "tipoVenta": "cilindro",
        "cantidad": 2,
        "precioTotal": 1500,
        "idVendedor": 1,
        "idUnidad": "1"
    }
    httpx.post(f"{BASE_URL}/ventas", json=venta, timeout=10)

    inicio = datetime.utcnow().date().replace(day=1).isoformat()
    fin = datetime.utcnow().date().isoformat()

    r = httpx.get(
        f"{BASE_URL}/ventas/reporte",
        params={"inicio": inicio, "fin": fin},
        timeout=10
    )
    assert r.status_code == 200
    data = r.json()
    assert data["totalVentas"] == 1
    assert isinstance(data["ventas"], list)
