import os
from pymongo import MongoClient

MONGO_URI = os.getenv(
    "MONGO_URI",
    "mongodb://root:rootpassword@mongo:27017/"
)

DB_NAME = os.getenv("MONGO_DB", "GasApp_Ventas")

cliente = MongoClient(MONGO_URI)
db = cliente[DB_NAME]

coleccion_ventas = db["ventas"]
coleccion_vendedores = db["vendedores"]