from fastapi import FastAPI
from rutas import router as rutas_usuarios
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Usuarios API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(rutas_usuarios)

@app.get("/salud", tags=["salud"])
def salud():
    return {"estado": "ok"}