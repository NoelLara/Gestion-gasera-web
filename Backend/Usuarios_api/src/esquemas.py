from pydantic import BaseModel, Field, EmailStr
from typing import Optional

class UsuarioCrear(BaseModel):
    nombre: str = Field(..., example="Juan Perez")
    email: EmailStr = Field(..., example="juan@example.com")
    contrasena: str = Field(..., min_length=6, example="secreto123")
    rol: str = Field(..., example="cliente")  # 'administrador', 'vendedor', 'cliente', 'usuario'

class UsuarioRespuesta(BaseModel):
    id: str
    nombre: str
    email: EmailStr
    rol: str

class UsuarioActualizar(BaseModel):
    nombre: Optional[str]
    email: Optional[EmailStr]
    contrasena: Optional[str]
    rol: Optional[str]

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenDatos(BaseModel):
    id: Optional[str] = None
    email: Optional[str] = None
    rol: Optional[str] = None