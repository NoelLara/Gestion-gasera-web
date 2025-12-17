from fastapi import FastAPI
from rutas import router

app = FastAPI(title="Ventas API")

app.include_router(router)