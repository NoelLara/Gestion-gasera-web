import httpx
import time
import os

BASE_URL = os.getenv("PEDIDOS_URL", "http://pedidos_api:8004")

def esperar_api():
    for _ in range(10):
        try:
            r = httpx.get(f"{BASE_URL}/salud")
            if r.status_code == 200:
                return
        except:
            pass
        time.sleep(1)
    raise Exception("API de pedidos no disponible")

def test_crear_pedido_cliente_publico():
    esperar_api()

    pedido = {
        "clientePublico": {
            "nombre": "Juan Público",
            "telefono": "555-1234"
        },
        "tipoPedido": "cilindro",
        "cantidad": 2,
        "precioTotal": 1500,
        "direccion": "Calle Falsa 123",
        "lat": 19.43,
        "lng": -99.13
    }

    r = httpx.post(f"{BASE_URL}/pedidos", json=pedido)
    assert r.status_code == 201
    assert r.json()["estado"] == "pendiente"
    assert r.json()["precioTotal"] == 1500

def test_listar_pedidos():
    esperar_api()

    r = httpx.get(f"{BASE_URL}/pedidos")
    assert r.status_code == 200
    assert isinstance(r.json(), list)

def test_asignar_y_atender_pedido():
    esperar_api()

    pedido = {
        "clientePublico": {
            "nombre": "Cliente Ruta",
            "telefono": "555-8888"
        },
        "tipoPedido": "estacionario",
        "litros": 300,
        "precioTotal": 4500,
        "direccion": "Av Siempre Viva",
        "lat": 19.5,
        "lng": -99.1
    }

    r_crear = httpx.post(f"{BASE_URL}/pedidos", json=pedido)
    assert r_crear.status_code == 201
    idPedido = r_crear.json()["idPedido"]

    r_asignar = httpx.put(
        f"{BASE_URL}/pedidos/{idPedido}/asignar",
        json={
            "idRuta": "ruta123",
            "idUnidad": 1,
            "idVendedor": 2
        }
    )
    assert r_asignar.status_code == 200

    r_estado = httpx.put(
        f"{BASE_URL}/pedidos/{idPedido}/estado",
        json={"estado": "atendido"}
    )
    assert r_estado.status_code == 200