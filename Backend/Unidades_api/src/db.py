from pymongo import MongoClient, ASCENDING

usuario = "root"
password = "rootpassword"
host = "mongo"
puerto = 27017

uri = f"mongodb://{usuario}:{password}@{host}:{puerto}/?authSource=admin"

client = MongoClient(uri)

db = client["UnidadesDB"]
coleccion_unidades = db["unidades"]

coleccion_unidades.create_index([("numero_economico", ASCENDING)], unique=True, sparse=True)
coleccion_unidades.create_index([("tipo", ASCENDING)])
coleccion_unidades.create_index([("activo", ASCENDING)])