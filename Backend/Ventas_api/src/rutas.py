from fastapi import APIRouter, HTTPException, Query
from datetime import datetime, date
from db import coleccion_ventas
from esquemas import VentaCreate

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