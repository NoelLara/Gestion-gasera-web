import httpx
import time
import os
import pytest
from pymongo import MongoClient

BASE_URL = os.getenv("PEDIDOS_URL", "http://pedidos_api_test:8004")
MONGO_URI = os.getenv("MONGO_URI", "mongodb://root:rootpassword@mongo_test:27017/")
MONGO_DB = os.getenv("MONGO_DB", "GasAppTest_Pedidos")
PEDIDOS_VENTAS_URL = os.getenv("PEDIDOS_VENTAS_URL", "http://ventas_api_test:8005")

@pytest.fixture(autouse=True)
def limpiar_bd():
    client = MongoClient(MONGO_URI)
    db = client[MONGO_DB]
    db.pedidos.delete_many({})

def esperar_api():
    """Espera hasta 60 segundos a que la API de pedidos esté disponible"""
    for _ in range(60):
        try:
            r = httpx.get(f"{BASE_URL}/salud", timeout=3.0)
            if r.status_code == 200:
                return
        except:
            pass
        time.sleep(1)
    raise RuntimeError("API de pedidos no disponible")

def test_crear_pedido_cliente_publico():
    esperar_api()
    pedido = {
        "clientePublico": {"nombre": "Juan Público", "telefono": "555-1234"},
        "tipoPedido": "cilindro",
        "cilindros": [{"tipoCilindro": 20, "cantidad": 2}],
        "direccion": "Calle Falsa 123",
        "lat": 19.43,
        "lng": -99.13
    }
    r = httpx.post(f"{BASE_URL}/pedidos", json=pedido, timeout=10)
    assert r.status_code == 201
    data = r.json()
    assert data["estado"] == "pendiente"
    assert data["precioTotal"] > 0

def test_listar_pedidos():
    esperar_api()
    r = httpx.get(f"{BASE_URL}/pedidos", timeout=10)
    assert r.status_code == 200
    assert isinstance(r.json(), list)

def test_asignar_y_atender_pedido():
    esperar_api()
    pedido = {
        "clientePublico": {"nombre": "Cliente Ruta", "telefono": "555-8888"},
        "tipoPedido": "estacionario",
        "litros": 300,
        "precioTotal": 4500,
        "direccion": "Av Siempre Viva",
        "lat": 19.5,
        "lng": -99.1
    }
    r_crear = httpx.post(f"{BASE_URL}/pedidos", json=pedido, timeout=10)
    assert r_crear.status_code == 201
    idPedido = r_crear.json()["idPedido"]

    r_asignar = httpx.put(
        f"{BASE_URL}/pedidos/{idPedido}/asignar",
        json={"idRuta": "ruta123", "idUnidad": 1, "idVendedor": 2},
        timeout=10
    )
    assert r_asignar.status_code == 200

    r_estado = httpx.put(
        f"{BASE_URL}/pedidos/{idPedido}/estado",
        json={"estado": "atendido"},
        timeout=10
    )
    assert r_estado.status_code == 200
