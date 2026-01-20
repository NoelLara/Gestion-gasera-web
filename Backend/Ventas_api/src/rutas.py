from fastapi import APIRouter, HTTPException, Query
from datetime import datetime, date
from db import coleccion_ventas, coleccion_vendedores
from esquemas import VentaCreate, VentaExterna

router = APIRouter()

def generar_id():
    ultimo = coleccion_ventas.find_one(sort=[("idVenta", -1)])
    return (ultimo["idVenta"] + 1) if ultimo else 1

@router.get("/salud")
def salud():
    return {"estado": "ok"}

@router.post("/ventas", status_code=201)
def registrar_venta(data: VentaCreate):
    if not data.cantidad and not data.litros:
        raise HTTPException(
            status_code=400,
            detail="Debe existir cantidad o litros"
        )

    venta = data.model_dump()

    if venta.get("metodoDePago") == "tarjeta":
        venta["adeudo"] = None

    venta["idVenta"] = generar_id()
    venta["fechaVenta"] = datetime.utcnow()

    coleccion_ventas.insert_one(venta)
    venta.pop("_id", None)

    return venta

@router.get("/ventas")
def listar_ventas():
    return list(coleccion_ventas.find({}, {"_id": 0}))

@router.get("/ventas/corte")
def corte_diario(fecha: date = Query(...)):
    inicio = datetime.combine(fecha, datetime.min.time())
    fin = datetime.combine(fecha, datetime.max.time())

    ventas = list(
        coleccion_ventas.find(
            {"fechaVenta": {"$gte": inicio, "$lte": fin}}
        )
    )

    total = sum(v["precioTotal"] for v in ventas)

    return {
        "fecha": fecha.isoformat(),
        "totalVentas": len(ventas),
        "montoTotal": total
    }

@router.get("/ventas/reporte")
def reporte_fechas(inicio: date, fin: date):
    inicio_dt = datetime.combine(inicio, datetime.min.time())
    fin_dt = datetime.combine(fin, datetime.max.time())

    ventas = list(
        coleccion_ventas.find(
            {"fechaVenta": {"$gte": inicio_dt, "$lte": fin_dt}},
            {"_id": 0}
        )
    )

    return {
        "inicio": inicio.isoformat(),
        "fin": fin.isoformat(),
        "totalVentas": len(ventas),
        "ventas": ventas
    }

@router.get("/ventas/dia")
def ventas_por_dia(fecha: date = Query(...)):
    inicio = datetime.combine(fecha, datetime.min.time())
    fin = datetime.combine(fecha, datetime.max.time())

    ventas = list(
        coleccion_ventas.find(
            {"fechaVenta": {"$gte": inicio, "$lte": fin}},
            {"_id": 0}
        )
    )

    if not ventas:
        return {"fecha": fecha.isoformat(), "mensaje": "No hay ventas en esta fecha"}

    return {
        "fecha": fecha.isoformat(),
        "totalVentas": len(ventas),
        "ventas": ventas
    }

@router.post("/ventas/externa", status_code=201)
def registrar_venta_externa(data: VentaExterna):
    if data.tipoVenta == "cilindro" and not data.cilindros:
        raise HTTPException(status_code=400, detail="Debes especificar al menos un cilindro")
    if data.tipoVenta == "estacionario" and (data.litros is None or data.litros <= 0):
        raise HTTPException(status_code=400, detail="Debes especificar litros válidos")
    
    venta = data.model_dump()

    if venta.get("metodoDePago") == "tarjeta":
        venta["adeudo"] = None

    venta["idVenta"] = generar_id()
    venta["fechaVenta"] = datetime.utcnow()

    coleccion_ventas.insert_one(venta)

    venta.pop("_id", None)

    return venta

@router.get("/ventas/ventasPorVendedor")
def ventas_por_vendedor(
    idVendedor: int = Query(...),
    adeudo: bool | None = Query(None)
):
    vendedor = coleccion_vendedores.find_one(
        {"idVendedor": idVendedor},
        {"_id": 0, "nombre": 1}
    )

    if not vendedor:
        raise HTTPException(
            status_code=404,
            detail="Vendedor no encontrado"
        )

    filtro = {"idVendedor": idVendedor}
    if adeudo is not None:
        filtro["adeudo"] = adeudo

    ventas = list(
        coleccion_ventas.find(filtro, {"_id": 0})
    )

    for v in ventas:
        v["vendedorNombre"] = vendedor["nombre"]

    return {
        "idVendedor": idVendedor,
        "vendedor": vendedor["nombre"],
        "totalVentas": len(ventas),
        "ventas": ventas
    }

@router.patch("/ventas/pagarAdeudo")
def pagar_adeudo(idVenta: int = Query(...)):
    resultado = coleccion_ventas.update_one(
        {"idVenta": idVenta, "adeudo": True},
        {"$set": {"adeudo": False}}
    )

    if resultado.matched_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Venta no encontrada o no tiene adeudo"
        )

    return {
        "mensaje": "Adeudo pagado exitosamente",
        "idVenta": idVenta
    }