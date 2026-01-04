from fastapi import APIRouter, HTTPException
from bson import ObjectId
from db import rutas_collection
from esquemas import RutaBase, Punto
from typing import List

router = APIRouter(prefix="/rutas", tags=["Rutas"])

def ruta_to_json(ruta) -> dict:
    return {
        "id": str(ruta["_id"]),
        "nombre": ruta["nombre"],
        "direccion_inicial": ruta["direccion_inicial"],
        "direccion_final": ruta["direccion_final"],
        "puntos_intermedios": ruta["puntos_intermedios"],
        "unidades_asignadas": ruta["unidades_asignadas"],
        "vendedores_asignados": ruta["vendedores_asignados"],
        "clientes_pendientes": ruta["clientes_pendientes"],
        "clientes_atendidos": ruta["clientes_atendidos"],
    }

@router.post("/crear")
def crear_ruta(ruta: RutaBase):
    nueva_ruta = {
        "nombre": ruta.nombre,
        "direccion_inicial": ruta.direccion_inicial.dict(),
        "direccion_final": ruta.direccion_final.dict(),
        "puntos_intermedios": [p.dict() for p in ruta.puntos_intermedios],
        "unidades_asignadas": ruta.unidades_asignadas,
        "vendedores_asignados": ruta.vendedores_asignados,
        "clientes_pendientes": ruta.clientes_pendientes,
        "clientes_atendidos": []
    }

    resultado = rutas_collection.insert_one(nueva_ruta)
    ruta_creada = rutas_collection.find_one({"_id": resultado.inserted_id})
    return ruta_to_json(ruta_creada)

@router.get("/")
def obtener_rutas():
    rutas = list(rutas_collection.find())
    return [ruta_to_json(r) for r in rutas]

@router.get("/{ruta_id}")
def obtener_ruta(ruta_id: str):
    ruta = rutas_collection.find_one({"_id": ObjectId(ruta_id)})
    if not ruta:
        raise HTTPException(status_code=404, detail="Ruta no encontrada")
    return ruta_to_json(ruta)

@router.put("/{ruta_id}")
def actualizar_ruta(ruta_id: str, datos: RutaBase):
    updated = rutas_collection.update_one(
        {"_id": ObjectId(ruta_id)},
        {"$set": {
            "nombre": datos.nombre,
            "direccion_inicial": datos.direccion_inicial.dict(),
            "direccion_final": datos.direccion_final.dict(),
            "puntos_intermedios": [p.dict() for p in datos.puntos_intermedios],
            "unidades_asignadas": datos.unidades_asignadas,
            "vendedores_asignados": datos.vendedores_asignados,
            "clientes_pendientes": datos.clientes_pendientes,
        }}
    )

    if updated.matched_count == 0:
        raise HTTPException(status_code=404, detail="Ruta no encontrada")

    ruta_actualizada = rutas_collection.find_one({"_id": ObjectId(ruta_id)})
    return ruta_to_json(ruta_actualizada)

@router.put("/{ruta_id}/clientes/{cliente_id}/atender")
def atender_cliente(ruta_id: str, cliente_id: str):
    ruta = rutas_collection.find_one({"_id": ObjectId(ruta_id)})

    if not ruta:
        raise HTTPException(status_code=404, detail="Ruta no encontrada")

    if cliente_id not in ruta["clientes_pendientes"]:
        raise HTTPException(status_code=400, detail="El cliente no está pendiente o ya fue atendido")

    rutas_collection.update_one(
        {"_id": ObjectId(ruta_id)},
        {
            "$pull": {"clientes_pendientes": cliente_id},
            "$push": {"clientes_atendidos": cliente_id}
        }
    )

    ruta_final = rutas_collection.find_one({"_id": ObjectId(ruta_id)})
    return ruta_to_json(ruta_final)

@router.delete("/{ruta_id}")
def eliminar_ruta(ruta_id: str):
    eliminado = rutas_collection.delete_one({"_id": ObjectId(ruta_id)})

    if eliminado.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Ruta no encontrada")

    return {"mensaje": "Ruta eliminada correctamente"}