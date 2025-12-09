from fastapi import Header, HTTPException
from jose import jwt
import os

SECRET = os.getenv("SECRET_JWT", "secretoSeguro")

def verificar_token(authorization: str = Header(None)):
    if authorization is None or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token inválido o ausente")

    token = authorization.split(" ")[1]

    try:
        payload = jwt.decode(token, SECRET, algorithms=["HS256"])
        return payload
    except Exception:
        raise HTTPException(status_code=401, detail="Token inválido")