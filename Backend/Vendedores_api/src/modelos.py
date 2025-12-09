from pydantic import BaseModel, EmailStr

class VendedorBase(BaseModel):
    nombre: str
    telefono: str
    email: EmailStr
    activo: bool = True

class VendedorOut(VendedorBase):
    idVendedor: int