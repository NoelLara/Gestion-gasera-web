from fastapi import Header, HTTPException
from jose import jwt
import os
from dotenv import load_dotenv
from pathlib import Path

env_path = Path(__file__).resolve().parents[1] / ".env"
load_dotenv(env_path)

SECRET = os.getenv("SECRET_JWT", "secretoSeguro")
ALGORITHM = "HS256"

ROLES_PERMITIDOS = {"administrador", "vendedor"}

def verificar_token(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token inválido o ausente")

    token = authorization.split(" ")[1]

    try:
        payload = jwt.decode(token, SECRET, algorithms=[ALGORITHM])

        rol = payload.get("rol")
        if rol not in ROLES_PERMITIDOS:
            raise HTTPException(status_code=403, detail="No autorizado")

        if rol == "vendedor" and payload.get("activo") is False:
            raise HTTPException(status_code=403, detail="Vendedor inactivo")

        return payload

    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=401, detail="Token inválido")