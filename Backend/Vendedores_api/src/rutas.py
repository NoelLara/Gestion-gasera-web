from fastapi import APIRouter, HTTPException, Depends
from esquemas import VendedorBase
from db import coleccion_vendedores
from seguridad import verificar_token

router = APIRouter()

def generar_id():
    ultimo = coleccion_vendedores.find_one(sort=[("idVendedor", -1)])
    return (ultimo["idVendedor"] + 1) if ultimo else 1


@router.get("/salud")
def salud():
    return {"estado": "ok"}


@router.get("/vendedores")
def listar_vendedores(_ = Depends(verificar_token)):
    vendedores = list(coleccion_vendedores.find({}, {"_id": 0}))
    return vendedores


@router.post("/vendedores", status_code=201)
def crear_vendedor(data: VendedorBase, _ = Depends(verificar_token)):
    nuevo = data.model_dump()
    nuevo["idVendedor"] = generar_id()
    coleccion_vendedores.insert_one(nuevo)
    nuevo.pop("_id", None)
    return nuevo


@router.put("/vendedores/{idVendedor}")
def editar_vendedor(idVendedor: int, data: VendedorBase, _ = Depends(verificar_token)):
    actualizado = data.model_dump()
    resultado = coleccion_vendedores.update_one(
        {"idVendedor": idVendedor},
        {"$set": actualizado}
    )
    if resultado.matched_count == 0:
        raise HTTPException(status_code=404, detail="Vendedor no encontrado")

    return {"mensaje": "Actualizado correctamente"}