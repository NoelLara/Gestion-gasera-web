from pymongo import MongoClient, ASCENDING

usuario = "root"
password = "rootpassword"
host = "mongo"
puerto = 27017

uri = f"mongodb://{usuario}:{password}@{host}:{puerto}/?authSource=admin"

client = MongoClient(uri)

db = client["UsuariosDB"]
coleccion_usuarios = db["usuarios"]

coleccion_usuarios.create_index([("email", ASCENDING)], unique=True)
coleccion_usuarios.create_index([("rol", ASCENDING)])