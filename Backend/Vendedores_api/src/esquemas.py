from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class VendedorBase(BaseModel):
    nombre: str
    telefono: str = Field(
        ...,
        pattern=r"^[0-9\-+\s]{7,15}$",
        example="555-123-4567"
    )
    correo: EmailStr
    activo: bool = True

class VendedorOut(VendedorBase):
    idVendedor: int