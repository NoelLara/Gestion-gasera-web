from fastapi import APIRouter, HTTPException, Depends
from esquemas import VendedorBase, VendedorOut
from db import coleccion_vendedores
from seguridad import verificar_token

router = APIRouter()

def generar_id():
    ultimo = coleccion_vendedores.find_one(sort=[("idVendedor", -1)])
    return (ultimo["idVendedor"] + 1) if ultimo else 1

@router.get("/salud")
def salud():
    return {"estado": "ok"}

@router.get("/vendedores", response_model=list[VendedorOut])
def listar_vendedores(_=Depends(verificar_token)):
    return list(coleccion_vendedores.find({}, {"_id": 0}))

@router.post("/vendedores", response_model=VendedorOut, status_code=201)
def crear_vendedor(data: VendedorBase, _=Depends(verificar_token)):

    if coleccion_vendedores.find_one({"correo": data.correo}):
        raise HTTPException(
            status_code=400,
            detail="Ya existe un vendedor con ese correo"
        )

    vendedor_doc = data.model_dump()
    vendedor_doc["idVendedor"] = generar_id()

    coleccion_vendedores.insert_one(vendedor_doc)
    vendedor_doc.pop("_id", None)

    return vendedor_doc

@router.put("/vendedores/{idVendedor}")
def editar_vendedor(
    idVendedor: int,
    data: VendedorBase,
    _=Depends(verificar_token)
):
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

    return {"mensaje": "Vendedor actualizado correctamente"}

@router.delete("/vendedores/{idVendedor}", status_code=204)
def eliminar_vendedor(idVendedor: int, _=Depends(verificar_token)):
    resultado = coleccion_vendedores.delete_one({"idVendedor": idVendedor})

    if resultado.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Vendedor no encontrado")

    return