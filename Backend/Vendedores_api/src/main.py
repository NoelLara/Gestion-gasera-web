from fastapi import FastAPI
from rutas import router

app = FastAPI(title="Vendedores API")

app.include_router(router)