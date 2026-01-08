from fastapi import APIRouter, HTTPException, Depends, status
from esquemas import (
    UnidadCrear,
    UnidadRespuesta,
    UnidadActualizar,
    AsignacionUnidadRequest
)
from db import coleccion_unidades, coleccion_asignaciones
from typing import List
from bson import ObjectId
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
import os
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

SECRET_JWT = os.getenv("SECRET_JWT", "secretoSeguro")
ALGORITMO = os.getenv("ALGORITMO", "HS256")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

router = APIRouter(prefix="/unidades", tags=["Unidades"])

def obtener_unidad_por_id(identificador: str):
    if not ObjectId.is_valid(identificador):
        return None
    return coleccion_unidades.find_one({"_id": ObjectId(identificador)})

def verificar_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_JWT, algorithms=[ALGORITMO])
        return {
            "id": payload.get("id"),
            "correo": payload.get("correo"),
            "rol": payload.get("rol")
        }
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado"
        )

async def obtener_usuario_actual(token: str = Depends(oauth2_scheme)):
    datos = verificar_token(token)
    if not datos.get("id"):
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    return datos

def es_admin(usuario: dict) -> bool:
    return usuario.get("rol") == "administrador"

def es_vendedor(usuario: dict) -> bool:
    return usuario.get("rol") == "vendedor"

def cerrar_asignaciones_activas(idUnidad: str):
    coleccion_asignaciones.update_many(
        {"idUnidad": idUnidad, "activo": True},
        {"$set": {
            "activo": False,
            "fecha_fin": datetime.utcnow()
        }}
    )

def asignar_vendedores(idUnidad: str, vendedores: List[int]):
    ahora = datetime.utcnow()
    for idVendedor in vendedores:
        coleccion_asignaciones.insert_one({
            "idUnidad": idUnidad,
            "idVendedor": idVendedor,
            "fecha_inicio": ahora,
            "fecha_fin": None,
            "activo": True
        })

@router.post("/", response_model=UnidadRespuesta, status_code=201)
def crear_unidad(
    datos: UnidadCrear,
    usuario_actual: dict = Depends(obtener_usuario_actual)
):
    if not (es_admin(usuario_actual) or es_vendedor(usuario_actual)):
        raise HTTPException(status_code=403, detail="No autorizado")

    unidad_doc = datos.dict()
    unidad_doc["activo"] = unidad_doc.get("activo", True)
    unidad_doc["creado_en"] = datetime.utcnow()

    resultado = coleccion_unidades.insert_one(unidad_doc)

    return UnidadRespuesta(
        id=str(resultado.inserted_id),
        unidad=datos
    )

@router.get("/", response_model=List[UnidadRespuesta])
def listar_unidades(tipo: str = None, activo: bool = None):
    filtro = {}
    if tipo:
        filtro["tipo"] = tipo
    if activo is not None:
        filtro["activo"] = activo

    unidades = []
    for doc in coleccion_unidades.find(filtro):
        unidad = doc.copy()
        unidad.pop("_id")
        unidad.pop("creado_en", None)

        unidades.append(
            UnidadRespuesta(
                id=str(doc["_id"]),
                unidad=unidad
            )
        )

    return unidades

@router.get("/{id_unidad}", response_model=UnidadRespuesta)
def obtener_unidad(id_unidad: str):
    unidad = obtener_unidad_por_id(id_unidad)
    if not unidad:
        raise HTTPException(status_code=404, detail="Unidad no encontrada")

    data = unidad.copy()
    data.pop("_id")
    data.pop("creado_en", None)

    return UnidadRespuesta(
        id=str(unidad["_id"]),
        unidad=data
    )

@router.patch("/{id_unidad}", response_model=UnidadRespuesta)
def actualizar_unidad(
    id_unidad: str,
    datos: UnidadActualizar,
    usuario_actual: dict = Depends(obtener_usuario_actual)
):
    if not (es_admin(usuario_actual) or es_vendedor(usuario_actual)):
        raise HTTPException(status_code=403, detail="No autorizado")

    unidad = obtener_unidad_por_id(id_unidad)
    if not unidad:
        raise HTTPException(status_code=404, detail="Unidad no encontrada")

    actualizacion = datos.dict(exclude_unset=True)
    if actualizacion:
        coleccion_unidades.update_one(
            {"_id": unidad["_id"]},
            {"$set": actualizacion}
        )

    unidad_actualizada = obtener_unidad_por_id(id_unidad)
    unidad_data = unidad_actualizada.copy()
    unidad_data.pop("_id")
    unidad_data.pop("creado_en", None)

    return UnidadRespuesta(
        id=str(unidad_actualizada["_id"]),
        unidad=unidad_data
    )

@router.delete("/{id_unidad}", status_code=204)
def eliminar_unidad(
    id_unidad: str,
    usuario_actual: dict = Depends(obtener_usuario_actual)
):
    if not es_admin(usuario_actual):
        raise HTTPException(status_code=403, detail="No autorizado")

    unidad = obtener_unidad_por_id(id_unidad)
    if not unidad:
        raise HTTPException(status_code=404, detail="Unidad no encontrada")

    coleccion_unidades.delete_one({"_id": unidad["_id"]})

@router.post("/{id_unidad}/asignaciones")
def asignar_vendedores_unidad(
    id_unidad: str,
    data: AsignacionUnidadRequest,
    usuario_actual: dict = Depends(obtener_usuario_actual)
):
    if not es_admin(usuario_actual):
        raise HTTPException(status_code=403, detail="Solo administrador")

    unidad = obtener_unidad_por_id(id_unidad)
    if not unidad:
        raise HTTPException(status_code=404, detail="Unidad no encontrada")

    cerrar_asignaciones_activas(id_unidad)
    asignar_vendedores(id_unidad, data.vendedores)

    return {"mensaje": "Vendedores asignados correctamente"}

@router.get("/{id_unidad}/vendedores")
def vendedores_actuales(id_unidad: str):
    return list(coleccion_asignaciones.find(
        {"idUnidad": id_unidad, "activo": True},
        {"_id": 0}
    ))


@router.get("/{id_unidad}/asignaciones/historico")
def historial_vendedores(id_unidad: str):
    return list(coleccion_asignaciones.find(
        {"idUnidad": id_unidad},
        {"_id": 0}
    ).sort("fecha_inicio", -1))