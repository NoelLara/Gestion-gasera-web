from fastapi import FastAPI
from rutas import router as rutas_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Rutas API",
    description="Servicio para gestionar rutas, clientes y recorridos",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(rutas_router)

@app.get("/salud", tags=["salud"])
def salud():
    return {"estado": "ok"}