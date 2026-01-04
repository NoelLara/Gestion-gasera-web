from pydantic import BaseModel
from typing import List

class Punto(BaseModel):
    calle: str
    numero: str
    lat: float
    lng: float

class RutaBase(BaseModel):
    nombre: str
    direccion_inicial: Punto
    direccion_final: Punto
    puntos_intermedios: List[Punto] = []
    unidades_asignadas: List[str] = []
    vendedores_asignados: List[str] = []
    clientes_pendientes: List[str] = []

class RutaResponse(RutaBase):
    id: str
    clientes_atendidos: List[str] = []