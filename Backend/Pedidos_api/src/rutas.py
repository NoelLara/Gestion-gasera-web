from fastapi import APIRouter, HTTPException
from datetime import datetime
from db import coleccion_pedidos
from precios import PRECIOS_CILINDROS
from esquemas import PedidoCreate, PedidoAsignar, PedidoEstado
import httpx
import os

router = APIRouter()

VENTAS_URL = os.getenv(
    "PEDIDOS_VENTAS_URL",
    "http://ventas_api:8005"
)

CLIENTES_URL = os.getenv(
    "PEDIDOS_CLIENTES_URL",
    "http://usuarios_api:8000"
)

def generar_id():
    ultimo = coleccion_pedidos.find_one(sort=[("idPedido", -1)])
    return (ultimo["idPedido"] + 1) if ultimo else 1

def registrar_venta_desde_pedido(pedido: dict):
    venta = {
        "idPedido": pedido["idPedido"],
        "tipoVenta": pedido["tipoPedido"],
        "cilindros": pedido.get("cilindros"),
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

    if data.tipoPedido == "cilindro":
        if not data.cilindros or len(data.cilindros) == 0:
            raise HTTPException(
                status_code=400,
                detail="Debe especificar los cilindros"
            )

        total = sum(
            item.cantidad * PRECIOS_CILINDROS[item.tipoCilindro]
            for item in data.cilindros
        )

    elif data.tipoPedido == "estacionario":
        if not data.litros or data.litros <= 0:
            raise HTTPException(400, "Debe especificar los litros")

        PRECIO_LITRO = 12.5
        total = data.litros * PRECIO_LITRO

    pedido = data.model_dump()
    pedido["precioTotal"] = total
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

@router.get("/pedidos")
def listar_pedidos():
    pedidos = list(coleccion_pedidos.find({}, {"_id": 0}))

    with httpx.Client(timeout=5) as client:
        for p in pedidos:
            if p.get("idCliente"):
                try:
                    res = client.get(
                        f"{CLIENTES_URL}/usuarios/interno/{p['idCliente']}"
                    )
                    if res.status_code == 200:
                        data = res.json()

                        p["cliente"] = (
                            data.get("nombre")
                            or data.get("perfil", {}).get("nombre")
                            or data.get("usuario", {}).get("nombre")
                            or "Cliente"
                        )
                    else:
                        p["cliente"] = "Cliente"
                except:
                    p["cliente"] = "Cliente"
            else:
                p["cliente"] = p.get(
                    "clientePublico", {}
                ).get("nombre", "Cliente público")

    return pedidos

@router.get("/vendedores/{id_vendedor}/pedidos")
def obtener_pedidos_vendedor(id_vendedor: int):
    pedidos = list(
        coleccion_pedidos.find(
            {"idVendedor": id_vendedor},
            {"_id": 0}
        )
    )

    with httpx.Client(timeout=5) as client:
        for p in pedidos:
            if p.get("idCliente"):
                try:
                    res = client.get(
                        f"{CLIENTES_URL}/usuarios/interno/{p['idCliente']}"
                    )
                    if res.status_code == 200:
                        cliente = res.json()
                        p["cliente"] = cliente["nombre"]
                    else:
                        p["cliente"] = "Cliente"
                except:
                    p["cliente"] = "Cliente"
            else:
                p["cliente"] = p.get("clientePublico", {}).get("nombre", "Cliente público")

    return pedidos

@router.put("/pedidos/{idPedido}/cancelar")
def cancelar_pedido(idPedido: int):
    pedido = coleccion_pedidos.find_one({"idPedido": idPedido})

    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")

    if pedido["estado"] != "pendiente":
        raise HTTPException(
            status_code=400,
            detail="Solo se pueden cancelar pedidos pendientes"
        )

    coleccion_pedidos.update_one(
        {"idPedido": idPedido},
        {"$set": {"estado": "cancelado"}}
    )

    return {"mensaje": "Pedido cancelado correctamente"}