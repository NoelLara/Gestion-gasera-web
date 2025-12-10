from pydantic import BaseModel
from typing import List, Optional

class Punto(BaseModel):
    lat: float
    lng: float

class RutaBase(BaseModel):
    nombre: str
    direccion_inicial: Punto
    direccion_final: Punto
    puntos_intermedios: List[Punto] = []
    unidades_asignadas: List[int] = []
    vendedores_asignados: List[int] = []
    clientes_pendientes: List[int] = []

class RutaResponse(RutaBase):
    id: str
    clientes_atendidos: List[int] = []