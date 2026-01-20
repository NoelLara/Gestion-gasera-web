from fastapi import APIRouter, HTTPException, Query
from datetime import datetime, date
from db import coleccion_ventas, coleccion_vendedores
from esquemas import VentaCreate, VentaExterna
from reportlab.lib.pagesizes import LETTER
from reportlab.pdfgen import canvas
from fastapi.responses import FileResponse
import httpx
import os
from fastapi import Header

CLIENTES_URL = os.getenv(
    "VENTAS_CLIENTES_URL",
    "http://usuarios_api:8000"
)

VENDEDORES_URL = os.getenv(
    "VENTAS_VENDEDORES_URL",
    "http://vendedores_api:8000"
)

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
    filtro = {"idVendedor": idVendedor}
    if adeudo is not None:
        filtro["adeudo"] = adeudo

    ventas = list(
        coleccion_ventas.find(filtro, {"_id": 0})
    )

    return {
        "idVendedor": idVendedor,
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

@router.get("/ventas/pedido/{idPedido}/ticket")
def generar_ticket_por_pedido(idPedido: int, authorization: str = Header(None)):
    venta = coleccion_ventas.find_one({"idPedido": idPedido})
    if not venta:
        raise HTTPException(404, "No existe venta para este pedido")

    cliente_nombre = "Cliente"
    if venta.get("idCliente"):
        try:
            with httpx.Client(timeout=5) as client:
                res = client.get(
                    f"{CLIENTES_URL}/usuarios/interno/{venta['idCliente']}"
                )
                if res.status_code == 200:
                    data = res.json()
                    cliente_nombre = (
                        data.get("nombre")
                        or data.get("perfil", {}).get("nombre")
                        or "Cliente"
                    )
        except:
            cliente_nombre = "Cliente"

    vendedor_nombre = "Vendedor"

    if venta.get("idVendedor") and authorization:
        try:
            with httpx.Client(timeout=5) as client:
                res = client.get(
                    f"{VENDEDORES_URL}/vendedores/{venta['idVendedor']}",
                    headers={
                        "Authorization": authorization
                    }
                )
                if res.status_code == 200:
                    data = res.json()
                    vendedor_nombre = data.get("nombre", "Vendedor")
        except Exception as e:
            vendedor_nombre = "Vendedor"


    filename = f"ticket_pedido_{idPedido}.pdf"
    path = f"/tmp/{filename}"

    fecha = venta["fechaVenta"].strftime("%d/%m/%Y %H:%M")

    c = canvas.Canvas(path, pagesize=LETTER)

    c.setFont("Helvetica-Bold", 16)
    c.drawCentredString(300, 750, "🧾 TICKET DE VENTA")

    c.setFont("Helvetica", 11)
    c.drawCentredString(
        300,
        730,
        f"Venta #{venta['idVenta']}  |  Pedido #{venta['idPedido']}"
    )

    c.line(50, 715, 550, 715)

    y = 690
    c.drawString(50, y, f"Fecha: {fecha}")
    y -= 20
    c.drawString(50, y, f"Cliente: {cliente_nombre}")
    y -= 20
    c.drawString(50, y, f"Método de pago: {venta['metodoDePago']}")
    y -= 30

    c.setFont("Helvetica-Bold", 13)
    c.drawString(50, y, f"Total pagado: ${venta['precioTotal']:.2f}")

    c.setFont("Helvetica-Oblique", 9)
    y -= 40
    c.setFont("Helvetica-Oblique", 9)
    c.drawCentredString(
        300,
        y,
        "Gracias por su compra Gas Cat"
    )

    c.save()

    return FileResponse(path, filename=filename, media_type="application/pdf")