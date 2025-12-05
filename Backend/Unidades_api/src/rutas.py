from fastapi import APIRouter, HTTPException, Depends, status
from esquemas import UnidadCrear, UnidadRespuesta, UnidadActualizar
from db import coleccion_unidades
from typing import List
from bson import ObjectId
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
import os
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

SECRET_JWT = os.getenv("SECRET_JWT", "tu_secreto_muy_seguro_aqui")
ALGORITMO = os.getenv("ALGORITMO", "HS256")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

router = APIRouter(prefix="/unidades", tags=["Unidades"])

def obtener_unidad_por_id(identificador: str):
    if not ObjectId.is_valid(identificador):
        return None
    return coleccion_unidades.find_one({"_id": ObjectId(identificador)})

def verificar_token(token: str):
    """
    Decodifica token y devuelve datos: {id, email, rol}
    Lanza HTTPException si inválido/expirado.
    """
    try:
        payload = jwt.decode(token, SECRET_JWT, algorithms=[ALGORITMO])
        return {
            "id": payload.get("id"),
            "email": payload.get("email"),
            "rol": payload.get("rol")
        }
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido o expirado")

async def obtener_usuario_actual(token: str = Depends(oauth2_scheme)):
    datos = verificar_token(token)
    if datos.get("id") is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciales inválidas")
    return datos

def es_admin(usuario: dict) -> bool:
    return usuario.get("rol") == "administrador"

def es_vendedor(usuario: dict) -> bool:
    return usuario.get("rol") == "vendedor"

@router.post("/", response_model=UnidadRespuesta, status_code=201)
def crear_unidad(datos: UnidadCrear, usuario_actual: dict = Depends(obtener_usuario_actual)):
    if not (es_admin(usuario_actual) or es_vendedor(usuario_actual)):
        raise HTTPException(status_code=403, detail="No autorizado")

    unidad_doc = {
        "numero_economico": datos.numero_economico,
        "tipo": datos.tipo,
        "capacidad_litros": datos.capacidad_litros,
        "activo": datos.activo if datos.activo is not None else True,
        "creado_en": datetime.utcnow()
    }
    
    try:
        resultado = coleccion_unidades.insert_one(unidad_doc)
    except Exception as err:
        raise HTTPException(status_code=400, detail="Numero económico duplicado o dato inválido")

    unidad_doc["id"] = str(resultado.inserted_id)
    return UnidadRespuesta(**unidad_doc)

@router.get("/", response_model=List[UnidadRespuesta])
def listar_unidades(tipo: str = None, activo: bool = None, limite: int = 100, salto: int = 0):
    filtro = {}
    if tipo:
        filtro["tipo"] = tipo
    if activo is not None:
        filtro["activo"] = activo
    cursor = coleccion_unidades.find(filtro).skip(salto).limit(limite).sort("creado_en", -1)
    resultado = []
    for doc in cursor:
        doc["id"] = str(doc["_id"])
        doc.pop("contrasena", None)
        resultado.append(UnidadRespuesta(**doc))
    return resultado

@router.get("/{id_unidad}", response_model=UnidadRespuesta)
def obtener_unidad(id_unidad: str):
    unidad = obtener_unidad_por_id(id_unidad)
    if unidad is None:
        raise HTTPException(status_code=404, detail="Unidad no encontrada")
    unidad["id"] = str(unidad["_id"])
    return UnidadRespuesta(**unidad)

@router.patch("/{id_unidad}", response_model=UnidadRespuesta)
def actualizar_unidad(id_unidad: str, datos: UnidadActualizar, usuario_actual: dict = Depends(obtener_usuario_actual)):
    if not (es_admin(usuario_actual) or es_vendedor(usuario_actual)):
        raise HTTPException(status_code=403, detail="No autorizado")

    unidad = obtener_unidad_por_id(id_unidad)
    if unidad is None:
        raise HTTPException(status_code=404, detail="Unidad no encontrada")

    actualizacion = {}
    if datos.numero_economico is not None:
        actualizacion["numero_economico"] = datos.numero_economico
    if datos.tipo is not None:
        actualizacion["tipo"] = datos.tipo
    if datos.capacidad_litros is not None:
        if datos.capacidad_litros <= 0:
            raise HTTPException(status_code=400, detail="capacidad_litros debe ser mayor que 0")
        actualizacion["capacidad_litros"] = datos.capacidad_litros
    if datos.activo is not None:
        actualizacion["activo"] = datos.activo

    if actualizacion:
        try:
            coleccion_unidades.update_one({"_id": unidad["_id"]}, {"$set": actualizacion})
        except Exception:
            raise HTTPException(status_code=400, detail="Error al actualizar (posible dato duplicado)")

    unidad = obtener_unidad_por_id(id_unidad)
    unidad["id"] = str(unidad["_id"]) if "_id" in unidad else str(unidad["_id"])
    return UnidadRespuesta(**unidad)

@router.delete("/{id_unidad}", status_code=204)
def eliminar_unidad(id_unidad: str, usuario_actual: dict = Depends(obtener_usuario_actual)):
    if not es_admin(usuario_actual):
        raise HTTPException(status_code=403, detail="No autorizado")
    unidad = obtener_unidad_por_id(id_unidad)
    if unidad is None:
        raise HTTPException(status_code=404, detail="Unidad no encontrada")
    coleccion_unidades.delete_one({"_id": unidad["_id"]})
    return {}