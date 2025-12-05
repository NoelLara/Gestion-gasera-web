from fastapi import FastAPI
from rutas import router as rutas_unidades
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Unidades API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(rutas_unidades)

@app.get("/salud", tags=["salud"])
def salud():
    return {"estado": "ok"}