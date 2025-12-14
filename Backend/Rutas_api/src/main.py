from fastapi import FastAPI
from rutas import router as rutas_router

app = FastAPI(
    title="Rutas API",
    description="Servicio para gestionar rutas, clientes y recorridos",
    version="1.0.0"
)

app.include_router(rutas_router)

@app.get("/salud", tags=["salud"])
def salud():
    return {"estado": "ok"}