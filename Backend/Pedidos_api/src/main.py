from fastapi import FastAPI
from rutas import router

app = FastAPI(title="Pedidos API")

app.include_router(router)