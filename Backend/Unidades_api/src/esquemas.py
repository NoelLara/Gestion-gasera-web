from pydantic import BaseModel, Field
from typing import Optional, Literal, List, Union
from datetime import datetime

class Cilindro(BaseModel):
    capacidad: Literal[10, 20, 30] = Field(..., example=20)
    cantidad: int = Field(..., gt=0, example=5)

class PipaCrear(BaseModel):
    tipo: Literal["pipa"] = Field("pipa")
    numero_economico: Optional[str] = Field(None, example="PIPA-01")
    capacidad_litros: int = Field(..., gt=0, example=4500)
    activo: Optional[bool] = Field(True, example=True)

class PipaActualizar(BaseModel):
    numero_economico: Optional[str]
    capacidad_litros: Optional[int]
    activo: Optional[bool]

class CamionCrear(BaseModel):
    tipo: Literal["camion"] = Field("camion")
    numero_economico: Optional[str] = Field(None, example="CAM-12")
    cilindros: List[Cilindro] = Field(..., example=[
        {"capacidad": 20, "cantidad": 5},
        {"capacidad": 30, "cantidad": 2}
    ])
    activo: Optional[bool] = Field(True, example=True)

class CamionActualizar(BaseModel):
    numero_economico: Optional[str]
    cilindros: Optional[List[Cilindro]]
    activo: Optional[bool]

UnidadCrear = Union[PipaCrear, CamionCrear]
UnidadActualizar = Union[PipaActualizar, CamionActualizar]

class UnidadRespuesta(BaseModel):
    id: str
    unidad: UnidadCrear

class AsignacionUnidadRequest(BaseModel):
    vendedores: List[int] = Field(..., min_items=1, max_items=2)

class AsignacionUnidadOut(BaseModel):
    idUnidad: str
    idVendedor: int
    fecha_inicio: datetime
    fecha_fin: Optional[datetime]
    activo: bool