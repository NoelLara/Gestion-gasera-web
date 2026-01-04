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

SECRET_JWT = os.getenv("SECRET_JWT", "secretoSeguro")
ALGORITMO = os.getenv("ALGORITMO", "HS256")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

router = APIRouter(prefix="/unidades", tags=["Unidades"])

def obtener_unidad_por_id(identificador: str):
    if not ObjectId.is_valid(identificador):
        return None
    return coleccion_unidades.find_one({"_id": ObjectId(identificador)})

def verificar_token(token: str):
    """
    Decodifica token y devuelve datos: {id, correo, rol}
    Lanza HTTPException si inválido/expirado.
    """
    try:
        payload = jwt.decode(token, SECRET_JWT, algorithms=[ALGORITMO])
        return {
            "id": payload.get("id"),
            "correo": payload.get("correo"),
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

    unidad_doc = datos.dict()
    unidad_doc["activo"] = unidad_doc.get("activo", True)
    unidad_doc["creado_en"] = datetime.utcnow()

    try:
        resultado = coleccion_unidades.insert_one(unidad_doc)
    except Exception:
        raise HTTPException(status_code=400, detail="Número económico duplicado o dato inválido")

    return UnidadRespuesta(
        id=str(resultado.inserted_id),
        unidad=datos
    )

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
        unidad = doc.copy()
        unidad.pop("_id")
        unidad.pop("creado_en", None)

        resultado.append(
            UnidadRespuesta(
                id=str(doc["_id"]),
                unidad=unidad
            )
        )

    return resultado

@router.get("/{id_unidad}", response_model=UnidadRespuesta)
def obtener_unidad(id_unidad: str):
    unidad = obtener_unidad_por_id(id_unidad)
    if unidad is None:
        raise HTTPException(status_code=404, detail="Unidad no encontrada")

    unidad_data = unidad.copy()
    unidad_data.pop("_id")
    unidad_data.pop("creado_en", None)

    return UnidadRespuesta(
        id=str(unidad["_id"]),
        unidad=unidad_data
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
    if unidad is None:
        raise HTTPException(status_code=404, detail="Unidad no encontrada")

    actualizacion = datos.dict(exclude_unset=True)

    if actualizacion:
        try:
            coleccion_unidades.update_one(
                {"_id": unidad["_id"]},
                {"$set": actualizacion}
            )
        except Exception:
            raise HTTPException(status_code=400, detail="Error al actualizar")

    unidad_actualizada = obtener_unidad_por_id(id_unidad)
    unidad_data = unidad_actualizada.copy()
    unidad_data.pop("_id")
    unidad_data.pop("creado_en", None)

    return UnidadRespuesta(
        id=str(unidad_actualizada["_id"]),
        unidad=unidad_data
    )

@router.delete("/{id_unidad}", status_code=204)
def eliminar_unidad(id_unidad: str, usuario_actual: dict = Depends(obtener_usuario_actual)):
    if not es_admin(usuario_actual):
        raise HTTPException(status_code=403, detail="No autorizado")

    unidad = obtener_unidad_por_id(id_unidad)
    if unidad is None:
        raise HTTPException(status_code=404, detail="Unidad no encontrada")

    coleccion_unidades.delete_one({"_id": unidad["_id"]})