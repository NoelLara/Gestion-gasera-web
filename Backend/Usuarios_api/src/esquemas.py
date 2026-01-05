from pydantic import BaseModel, Field, EmailStr
from typing import Optional

class UsuarioCrear(BaseModel):
    nombre: str = Field(..., example="Juan Perez")
    correo: EmailStr = Field(..., example="juan@example.com")
    contrasena: str = Field(..., min_length=6, example="secreto123")
    telefono: str = Field(
        ...,
        pattern=r"^\+?[1-9]\d{9,14}$",
        example="+5215512345678"
    )
    rol: str = Field(..., example="cliente")
    activo: bool = True

class UsuarioRespuesta(BaseModel):
    id: str
    nombre: str
    correo: EmailStr
    telefono: str
    rol: str
    activo: bool

class UsuarioActualizar(BaseModel):
    nombre: Optional[str]
    correo: Optional[EmailStr]
    contrasena: Optional[str]
    telefono: Optional[str]
    rol: Optional[str]
    activo: Optional[bool]

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenDatos(BaseModel):
    id: Optional[str] = None
    correo: Optional[str] = None
    rol: Optional[str] = None