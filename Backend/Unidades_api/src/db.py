import os
from pymongo import MongoClient, ASCENDING

MONGO_URI = os.getenv(
    "MONGO_URI",
    "mongodb://root:rootpassword@mongo:27017/?authSource=admin"
)

MONGO_DB = os.getenv("MONGO_DB", "UnidadesDB")

client = MongoClient(MONGO_URI)
db = client[MONGO_DB]

coleccion_unidades = db["unidades"]

coleccion_unidades.create_index(
    [("numero_economico", ASCENDING)],
    unique=True,
    sparse=True
)

coleccion_unidades.create_index([("tipo", ASCENDING)])
coleccion_unidades.create_index([("activo", ASCENDING)])
coleccion_asignaciones = db["asignaciones_unidad"]