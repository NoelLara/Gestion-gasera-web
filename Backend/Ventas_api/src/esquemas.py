from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ClientePublico(BaseModel):
    nombre: str
    telefono: str

class VentaBase(BaseModel):
    idPedido: int
    tipoVenta: str  # cilindro | estacionario

    cantidad: Optional[int] = None
    litros: Optional[float] = None

    precioTotal: float

    idCliente: Optional[str] = None
    clientePublico: Optional[ClientePublico] = None

    idVendedor: int
    idUnidad: Optional[str] = None
    idRuta: Optional[str] = None

class VentaCreate(VentaBase):
    pass

class VentaOut(VentaBase):
    idVenta: int
    fechaVenta: datetime