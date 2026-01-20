from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ClientePublico(BaseModel):
    nombre: str
    telefono: str

class PedidoBase(BaseModel):
    idCliente: Optional[str] = None
    clientePublico: Optional[ClientePublico] = None
    tipoPedido: str  # cilindro | estacionario
    cilindros: Optional[list['CilindroPedido']] = None
    litros: Optional[float] = None   # estacionario
    precioTotal: Optional[float] = None
    direccion: str
    lat: float
    lng: float
    metodoDePago: str  # efectivo | tarjeta

class PedidoCreate(PedidoBase):
    pass

class PedidoAsignar(BaseModel):
    idRuta: Optional[str] = None
    idUnidad: Optional[str] = None
    idVendedor: Optional[int] = None

class PedidoEstado(BaseModel):
    estado: str  # pendiente | asignado | atendido | cancelado

class PedidoOut(PedidoBase):
    idPedido: int
    estado: str
    idRuta: Optional[str] = None
    idUnidad: Optional[int] = None
    idVendedor: Optional[int] = None
    fechaCreacion: datetime
    fechaAtencion: Optional[datetime] = None

class CilindroPedido(BaseModel):
    tipoCilindro: int
    cantidad: int