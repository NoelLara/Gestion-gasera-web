from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from rutas import router

app = FastAPI(title="Vendedores API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)