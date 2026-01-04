from fastapi import APIRouter, HTTPException
from datetime import datetime
from db import coleccion_pedidos
from esquemas import PedidoCreate, PedidoAsignar, PedidoEstado
import httpx
import os

router = APIRouter()

VENTAS_URL = os.getenv(
    "PEDIDOS_VENTAS_URL",
    "http://ventas_api:8005"
)

def generar_id():
    ultimo = coleccion_pedidos.find_one(sort=[("idPedido", -1)])
    return (ultimo["idPedido"] + 1) if ultimo else 1

def registrar_venta_desde_pedido(pedido: dict):
    venta = {
        "idPedido": pedido["idPedido"],
        "tipoVenta": pedido["tipoPedido"],
        "cantidad": pedido.get("cantidad"),
        "litros": pedido.get("litros"),
        "precioTotal": pedido["precioTotal"],
        "idCliente": pedido.get("idCliente"),
        "clientePublico": pedido.get("clientePublico"),
        "idVendedor": pedido["idVendedor"],
        "idUnidad": pedido["idUnidad"],
        "idRuta": pedido.get("idRuta")
    }

    try:
        httpx.post(f"{VENTAS_URL}/ventas", json=venta, timeout=10)
    except Exception as e:
        print(f"Error registrando venta: {e}")

@router.get("/salud")
def salud():
    return {"estado": "ok"}

@router.post("/pedidos", status_code=201)
def crear_pedido(data: PedidoCreate):
    if not data.idCliente and not data.clientePublico:
        raise HTTPException(
            status_code=400,
            detail="Debe existir idCliente o clientePublico"
        )

    pedido = data.model_dump()
    pedido["idPedido"] = generar_id()
    pedido["estado"] = "pendiente"
    pedido["idRuta"] = None
    pedido["idUnidad"] = None
    pedido["idVendedor"] = None
    pedido["fechaCreacion"] = datetime.utcnow()
    pedido["fechaAtencion"] = None

    coleccion_pedidos.insert_one(pedido)
    pedido.pop("_id", None)
    return pedido

@router.get("/pedidos")
def listar_pedidos():
    return list(coleccion_pedidos.find({}, {"_id": 0}))

@router.put("/pedidos/{idPedido}/asignar")
def asignar_pedido(idPedido: int, data: PedidoAsignar):
    actualizacion = {k: v for k, v in data.model_dump().items() if v is not None}
    actualizacion["estado"] = "asignado"

    resultado = coleccion_pedidos.update_one(
        {"idPedido": idPedido},
        {"$set": actualizacion}
    )

    if resultado.matched_count == 0:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")

    return {"mensaje": "Pedido asignado correctamente"}

@router.put("/pedidos/{idPedido}/estado")
def cambiar_estado(idPedido: int, data: PedidoEstado):
    pedido = coleccion_pedidos.find_one({"idPedido": idPedido})

    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")

    update = {"estado": data.estado}

    if data.estado == "atendido":
        update["fechaAtencion"] = datetime.utcnow()

    coleccion_pedidos.update_one(
        {"idPedido": idPedido},
        {"$set": update}
    )

    if data.estado == "atendido":
        pedido_actualizado = {**pedido, **update}
        registrar_venta_desde_pedido(pedido_actualizado)

    return {"mensaje": f"Pedido marcado como {data.estado}"}