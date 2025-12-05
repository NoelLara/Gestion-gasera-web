from pydantic import BaseModel, Field
from typing import Optional, Literal

class UnidadCrear(BaseModel):
    numero_economico: Optional[str] = Field(None, example="ABC-123")
    tipo: Literal["pipa", "camion", "camioneta"] = Field(..., example="pipa")
    capacidad_litros: int = Field(..., gt=0, example=4500)
    activo: Optional[bool] = Field(True, example=True)

class UnidadRespuesta(UnidadCrear):
    id: str

class UnidadActualizar(BaseModel):
    numero_economico: Optional[str]
    tipo: Optional[Literal["pipa", "camion", "camioneta"]]
    capacidad_litros: Optional[int]
    activo: Optional[bool]