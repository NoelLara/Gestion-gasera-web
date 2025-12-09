import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://root:rootpassword@mongo:27017/")
DB_NAME = os.getenv("MONGO_DB", "GasApp")

cliente = MongoClient(MONGO_URI)
db = cliente[DB_NAME]

coleccion_vendedores = db["vendedores"]