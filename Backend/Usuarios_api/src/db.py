import os
from pymongo import MongoClient, ASCENDING

MONGO_URI = os.environ["MONGO_URI"]
MONGO_DB = os.environ["MONGO_DB"]

client = MongoClient(MONGO_URI)

db = client[MONGO_DB]
coleccion_usuarios = db["usuarios"]

coleccion_usuarios.create_index([("correo", ASCENDING)], unique=True)
coleccion_usuarios.create_index([("rol", ASCENDING)])