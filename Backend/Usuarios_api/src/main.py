from fastapi import FastAPI
from rutas import crear_admin_si_no_existe, router as rutas_usuarios
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

@app.on_event("startup")
def startup():
    crear_admin_si_no_existe()