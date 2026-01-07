from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from esquemas import UsuarioCrear, UsuarioRespuesta, UsuarioActualizar, Token, TokenDatos, UsuarioVendedorCrear, UsuarioVendedorActualizar
from db import coleccion_usuarios
from passlib.context import CryptContext
from jose import jwt, JWTError
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta
from bson import ObjectId
import httpx

load_dotenv()

SECRET_JWT = os.getenv("SECRET_JWT", "secretoSeguro")
ALGORITMO = os.getenv("ALGORITMO", "HS256")
EXPIRACION_MINUTOS = int(os.getenv("EXPIRACION_MINUTOS", "60"))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

router = APIRouter()

VENDEDORES_URL = "http://vendedoresGas_api:8002"

def hashear_contrasena(contrasena: str) -> str:
    return pwd_context.hash(contrasena)

def verificar_contrasena(contrasena: str, hash_contrasena: str) -> bool:
    return pwd_context.verify(contrasena, hash_contrasena)

def crear_token(datos: dict, minutos: int = EXPIRACION_MINUTOS) -> str:
    payload = datos.copy()
    payload["exp"] = datetime.utcnow() + timedelta(minutes=minutos)
    return jwt.encode(payload, SECRET_JWT, algorithm=ALGORITMO)

def obtener_usuario_por_correo(correo: str):
    return coleccion_usuarios.find_one({"correo": correo})

def obtener_usuario_por_id(identificador: str):
    if not ObjectId.is_valid(identificador):
        return None
    return coleccion_usuarios.find_one({"_id": ObjectId(identificador)})

async def obtener_usuario_actual(token: str = Depends(oauth2_scheme)) -> dict:
    try:
        payload = jwt.decode(token, SECRET_JWT, algorithms=[ALGORITMO])
        usuario_id = payload.get("id")
        if not usuario_id:
            raise HTTPException(status_code=401, detail="Credenciales inválidas")
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido o expirado")

    usuario = obtener_usuario_por_id(usuario_id)
    if not usuario:
        raise HTTPException(status_code=401, detail="Usuario no existe")

    usuario["id"] = str(usuario["_id"])
    return usuario

def usuario_es_admin(usuario: dict) -> bool:
    return usuario.get("rol") == "administrador"

@router.post("/usuarios", response_model=UsuarioRespuesta, status_code=201)
def crear_usuario(datos: UsuarioCrear):
    roles_permitidos = {"administrador", "vendedor", "cliente", "usuario"}

    if datos.rol not in roles_permitidos:
        raise HTTPException(status_code=400, detail="Rol no permitido")

    if obtener_usuario_por_correo(datos.correo):
        raise HTTPException(status_code=400, detail="Correo ya registrado")

    usuario_doc = {
        "nombre": datos.nombre,
        "correo": datos.correo,
        "telefono": datos.telefono,
        "contrasena": hashear_contrasena(datos.contrasena),
        "rol": datos.rol,
        "creado_en": datetime.utcnow(),
        "activo": datos.activo
    }

    resultado = coleccion_usuarios.insert_one(usuario_doc)
    usuario_doc["id"] = str(resultado.inserted_id)
    usuario_doc.pop("contrasena", None)

    return UsuarioRespuesta(**usuario_doc)

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    usuario = obtener_usuario_por_correo(form_data.username)

    if not usuario or not verificar_contrasena(form_data.password, usuario["contrasena"]):
        raise HTTPException(
            status_code=400,
            detail="Correo o contraseña incorrectos"
        )

    if usuario["rol"] == "vendedor" and not usuario.get("activo", False):
        raise HTTPException(
            status_code=403,
            detail="Vendedor inactivo. Contacta al administrador"
        )

    datos_token = {
        "id": str(usuario["_id"]),
        "correo": usuario["correo"],
        "rol": usuario["rol"],
        "activo": usuario["activo"]
    }

    token = crear_token(datos_token)
    return Token(access_token=token)

@router.get("/usuarios/{id_usuario}", response_model=UsuarioRespuesta)
def obtener_usuario(id_usuario: str, usuario_actual: dict = Depends(obtener_usuario_actual)):
    if usuario_actual["rol"] != "administrador" and usuario_actual["id"] != id_usuario:
        raise HTTPException(status_code=403, detail="No autorizado")

    usuario = obtener_usuario_por_id(id_usuario)
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    usuario["id"] = str(usuario["_id"])
    usuario.pop("contrasena", None)
    return UsuarioRespuesta(**usuario)

@router.patch("/usuarios/{id_usuario}", response_model=UsuarioRespuesta)
def actualizar_usuario(
    id_usuario: str,
    datos: UsuarioActualizar,
    usuario_actual: dict = Depends(obtener_usuario_actual)
):
    if usuario_actual["rol"] == "administrador":
        raise HTTPException(
            status_code=403,
            detail="El administrador no puede modificar usuarios"
        )

    if usuario_actual["id"] != id_usuario:
        raise HTTPException(
            status_code=403,
            detail="No puedes modificar otro usuario"
        )

    usuario = obtener_usuario_por_id(id_usuario)
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    actualizacion = {}

    if datos.nombre:
        actualizacion["nombre"] = datos.nombre

    if datos.correo:
        existente = obtener_usuario_por_correo(datos.correo)
        if existente and str(existente["_id"]) != id_usuario:
            raise HTTPException(status_code=400, detail="Correo ya en uso")
        actualizacion["correo"] = datos.correo

    if datos.telefono:
        actualizacion["telefono"] = datos.telefono

    if datos.contrasena:
        actualizacion["contrasena"] = hashear_contrasena(datos.contrasena)

    if datos.rol:
        raise HTTPException(
            status_code=403,
            detail="No está permitido cambiar el rol"
        )

    if not actualizacion:
        raise HTTPException(
            status_code=400,
            detail="No hay datos para actualizar"
        )

    coleccion_usuarios.update_one(
        {"_id": usuario["_id"]},
        {"$set": actualizacion}
    )

    usuario = obtener_usuario_por_id(id_usuario)
    usuario["id"] = str(usuario["_id"])
    usuario.pop("contrasena", None)

    return UsuarioRespuesta(**usuario)

@router.get("/me", response_model=UsuarioRespuesta)
def obtener_mi_perfil(usuario_actual: dict = Depends(obtener_usuario_actual)):
    usuario = usuario_actual.copy()
    usuario["id"] = str(usuario["_id"])
    usuario.pop("contrasena", None)
    return UsuarioRespuesta(**usuario)

def crear_admin_si_no_existe():
    admin = coleccion_usuarios.find_one({"correo": "admin@correo.com"})

    if admin:
        print("Admin ya existe")
        return

    admin_data = {
        "nombre": "admin",
        "correo": "admin@correo.com",
        "telefono": "2281234567",
        "contrasena": hashear_contrasena("admin123"),
        "rol": "administrador",
        "creado_en": datetime.utcnow(),
        "activo": True
    }

    coleccion_usuarios.insert_one(admin_data)
    print("Admin creado correctamente")

@router.delete("/usuarios/{id_usuario}", status_code=204)
def eliminar_usuario(id_usuario: str, usuario_actual: dict = Depends(obtener_usuario_actual)):
    if usuario_actual["rol"] != "administrador" and usuario_actual["id"] != id_usuario:
        raise HTTPException(status_code=403, detail="No autorizado")

    usuario = obtener_usuario_por_id(id_usuario)
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    coleccion_usuarios.delete_one({"_id": usuario["_id"]})
    return

@router.get("/clientes", response_model=list[UsuarioRespuesta])
def listar_clientes(usuario_actual: dict = Depends(obtener_usuario_actual)):
    if usuario_actual["rol"] != "administrador":
        raise HTTPException(status_code=403, detail="No autorizado")

    clientes = []
    for u in coleccion_usuarios.find({"rol": "cliente"}):
        u["id"] = str(u["_id"])
        u.pop("contrasena", None)
        clientes.append(u)

    return clientes

@router.post("/usuarios/vendedor", response_model=UsuarioRespuesta, status_code=201)
def crear_usuario_y_vendedor(
    datos: UsuarioVendedorCrear,
    usuario_actual: dict = Depends(obtener_usuario_actual),
    token: str = Depends(oauth2_scheme)
):
    if usuario_actual["rol"] != "administrador":
        raise HTTPException(status_code=403, detail="Solo admin puede crear vendedores")

    if coleccion_usuarios.find_one({"correo": datos.correo}):
        raise HTTPException(status_code=400, detail="Correo ya registrado")

    contrasena_predeterminada = "vendedor123"
    usuario_doc = {
        "nombre": datos.nombre,
        "correo": datos.correo,
        "telefono": datos.telefono,
        "contrasena": hashear_contrasena(contrasena_predeterminada),
        "rol": "vendedor",
        "creado_en": datetime.utcnow(),
        "activo": datos.activo
    }

    resultado = coleccion_usuarios.insert_one(usuario_doc)
    usuario_id = str(resultado.inserted_id)

    vendedor_payload = {
        "nombre": datos.nombre,
        "correo": datos.correo,
        "telefono": datos.telefono,
        "activo": datos.activo,
        "idUsuario": usuario_id
    }

    try:
        with httpx.Client(timeout=5) as client:
            r = client.post(
                f"{VENDEDORES_URL}/vendedores",
                json=vendedor_payload,
                headers={
                    "Authorization": f"Bearer {token}"
                }
            )

            if r.status_code != 201:
                coleccion_usuarios.delete_one({"_id": resultado.inserted_id})
                raise HTTPException(
                    status_code=500,
                    detail=f"No se pudo crear vendedor: {r.text}"
                )

    except Exception as e:
        coleccion_usuarios.delete_one({"_id": resultado.inserted_id})
        raise HTTPException(
            status_code=500,
            detail=f"Error creando vendedor: {str(e)}"
        )

    usuario_doc["id"] = usuario_id
    usuario_doc.pop("contrasena", None)

    return UsuarioRespuesta(**usuario_doc)

@router.patch("/usuarios/vendedor/{id_usuario}", response_model=UsuarioRespuesta)
def admin_actualizar_vendedor(
    id_usuario: str,
    datos: UsuarioVendedorActualizar,
    usuario_actual: dict = Depends(obtener_usuario_actual)
):
    if usuario_actual["rol"] != "administrador":
        raise HTTPException(403, detail="Solo admin")

    usuario = obtener_usuario_por_id(id_usuario)
    if not usuario:
        raise HTTPException(404, detail="Usuario no encontrado")

    actualizacion = datos.model_dump(exclude_none=True)

    if not actualizacion:
        raise HTTPException(400, detail="Nada para actualizar")

    coleccion_usuarios.update_one(
        {"_id": usuario["_id"]},
        {"$set": actualizacion}
    )

    usuario = obtener_usuario_por_id(id_usuario)
    usuario["id"] = str(usuario["_id"])
    usuario.pop("contrasena", None)

    return UsuarioRespuesta(**usuario)

@router.get("/usuarios/interno/{id_usuario}")
def obtener_usuario_interno(id_usuario: str):
    usuario = obtener_usuario_por_id(id_usuario)
    if not usuario:
        raise HTTPException(404, "Usuario no encontrado")

    return {
        "id": str(usuario["_id"]),
        "nombre": usuario["nombre"]
    }