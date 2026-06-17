from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import asyncpg
import asyncio

app = Flask(__name__)
CORS(app)

DATABASE_URL = os.getenv('DATABASE_URL')

async def get_db_connection():
    try:
        conn = await asyncpg.connect(DATABASE_URL)
        return conn
    except Exception as e:
        print(f"Error conectando a DB: {e}")
        return None

async def init_db():
    conn = await get_db_connection()
    if conn is None:
        return False
    try:
        await conn.execute('''
            CREATE TABLE IF NOT EXISTS usuarios (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                nombre VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        await conn.execute('''
            INSERT INTO usuarios (email, password, nombre)
            VALUES ('admin@dani27001.com', 'admin123', 'Admin')
            ON CONFLICT (email) DO NOTHING
        ''')
        await conn.close()
        return True
    except Exception as e:
        print(f"Error inicializando DB: {e}")
        await conn.close()
        return False

async def verificar_login(email, password):
    conn = await get_db_connection()
    if conn is None:
        return {"success": False, "error": "Error de conexión a DB"}
    try:
        result = await conn.fetchrow(
            'SELECT id, email, nombre, password FROM usuarios WHERE email = $1',
            email
        )
        await conn.close()
        if result is None:
            return {"success": False, "error": "Usuario no encontrado"}
        if result['password'] != password:
            return {"success": False, "error": "Contraseña incorrecta"}
        return {
            "success": True,
            "user": {
                "id": result['id'],
                "email": result['email'],
                "nombre": result['nombre']
            }
        }
    except Exception as e:
        await conn.close()
        return {"success": False, "error": str(e)}

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        "success": True,
        "message": "API de DANI ISO 27001 funcionando",
        "endpoints": {
            "/api/login": "POST - Login de usuarios",
            "/api/health": "GET - Estado del servicio",
            "/api/test-db": "GET - Prueba de conexión a DB"
        }
    })

@app.route('/api/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        return '', 200
    try:
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "error": "Datos no válidos"}), 400
        email = data.get('email')
        password = data.get('password')
        if not email or not password:
            return jsonify({"success": False, "error": "Email y contraseña son requeridos"}), 400
        result = asyncio.run(verificar_login(email, password))
        if result['success']:
            return jsonify(result)
        else:
            status = 404 if "no encontrado" in result['error'] else 401
            return jsonify(result), status
    except Exception as e:
        print(f"Error en login: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        "success": True,
        "status": "healthy",
        "database": "NeonDB (PostgreSQL)"
    })

@app.route('/api/test-db', methods=['GET'])
def test_db():
    try:
        async def test():
            conn = await get_db_connection()
            if conn is None:
                return {"success": False, "error": "No se pudo conectar a la DB"}
            result = await conn.fetch('SELECT version()')
            await conn.close()
            return {
                "success": True,
                "version": result[0][0],
                "database": "NeonDB (PostgreSQL)"
            }
        result = asyncio.run(test())
        return jsonify(result)
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# OBLIGATORIO PARA VERCEL
handler = app

if __name__ == '__main__':
    app.run(debug=True, port=5000)