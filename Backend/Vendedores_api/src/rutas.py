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
def listar_vendedores(_=Depends(verificar_token)):
    return list(coleccion_vendedores.find({}, {"_id": 0}))

@router.post("/vendedores", status_code=201)
def crear_vendedor(data: VendedorBase, _=Depends(verificar_token)):
    if coleccion_vendedores.find_one({"correo": data.correo}):
        raise HTTPException(
            status_code=400,
            detail="Ya existe un vendedor con ese correo"
        )

    nuevo = data.model_dump()
    nuevo["idVendedor"] = generar_id()

    coleccion_vendedores.insert_one(nuevo)
    nuevo.pop("_id", None)

    return nuevo

@router.put("/vendedores/{idVendedor}")
def editar_vendedor(idVendedor: int, data: VendedorBase, _=Depends(verificar_token)):
    existente = coleccion_vendedores.find_one({
        "correo": data.correo,
        "idVendedor": {"$ne": idVendedor}
    })

    if existente:
        raise HTTPException(
            status_code=400,
            detail="El correo ya está en uso por otro vendedor"
        )

    resultado = coleccion_vendedores.update_one(
        {"idVendedor": idVendedor},
        {"$set": data.model_dump()}
    )

    if resultado.matched_count == 0:
        raise HTTPException(status_code=404, detail="Vendedor no encontrado")

    return {"mensaje": "Actualizado correctamente"}