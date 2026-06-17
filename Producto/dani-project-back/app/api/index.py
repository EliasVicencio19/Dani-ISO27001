from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import asyncpg
import asyncio
import json
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Permite peticiones del frontend

# Obtener URL de NeonDB desde variables de entorno
DATABASE_URL = os.getenv('DATABASE_URL')

# ===== FUNCIONES DE BASE DE DATOS =====
async def get_db_connection():
    """Obtiene una conexión a NeonDB"""
    try:
        conn = await asyncpg.connect(DATABASE_URL)
        return conn
    except Exception as e:
        print(f"Error conectando a DB: {e}")
        return None

async def init_db():
    """Crea las tablas si no existen"""
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
        
        # Insertar usuario de prueba si no existe
        await conn.execute('''
            INSERT INTO usuarios (email, password, nombre)
            VALUES ('ciso@empresa.com', '123456', 'CISO')
            ON CONFLICT (email) DO NOTHING
        ''')
        
        await conn.close()
        return True
    except Exception as e:
        print(f"Error inicializando DB: {e}")
        await conn.close()
        return False

# ===== FUNCIONES ASÍNCRONAS PARA OPERACIONES DE DB =====
async def async_login(email, password):
    """Función asíncrona para el login"""
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
        
        # Verificar contraseña (en producción, usar hash)
        if result['password'] != password:
            return {"success": False, "error": "Contraseña incorrecta"}
        
        # Login exitoso
        return {
            "success": True,
            "message": "Login exitoso",
            "user": {
                "id": result['id'],
                "email": result['email'],
                "nombre": result['nombre']
            }
        }
        
    except Exception as e:
        await conn.close()
        return {"success": False, "error": str(e)}

async def async_test_db():
    """Función asíncrona para probar la DB"""
    conn = await get_db_connection()
    if conn is None:
        return {"success": False, "error": "No se pudo conectar a la DB"}
    
    try:
        result = await conn.fetch('SELECT version()')
        await conn.close()
        return {
            "success": True,
            "message": "Conexión a NeonDB exitosa",
            "version": result[0][0]
        }
    except Exception as e:
        await conn.close()
        return {"success": False, "error": str(e)}

# ===== RUTAS DE LA API =====
@app.route('/api', defaults={'path': ''})
@app.route('/api/<path:path>', methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])
def catch_all(path):
    # Manejar CORS para OPTIONS
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        # Ruta de login
        if path == 'login' and request.method == 'POST':
            return handle_login()
        
        # Ruta de salud
        if path == 'health':
            return jsonify({
                "status": "healthy",
                "database": "NeonDB (PostgreSQL)",
                "timestamp": datetime.now().isoformat()
            })
        
        # Ruta de prueba de base de datos
        if path == 'test-db':
            return handle_test_db()
        
        # Ruta por defecto
        return jsonify({
            "success": True,
            "message": "API funcionando con NeonDB",
            "path": path,
            "method": request.method
        })
        
    except Exception as e:
        print(f"Error: {str(e)}")
        import traceback
        print(traceback.format_exc())
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

# ===== MANEJADORES DE RUTAS (SINCRÓNICOS) =====
def handle_login():
    """Maneja el login de usuarios (sincrónico)"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "error": "Datos no válidos"}), 400
        
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({"success": False, "error": "Email y contraseña son requeridos"}), 400
        
        # Ejecutar la función asíncrona de login
        result = asyncio.run(async_login(email, password))
        
        if result['success']:
            return jsonify(result)
        else:
            return jsonify(result), 404 if "no encontrado" in result['error'] else 401
            
    except Exception as e:
        print(f"Error en login: {str(e)}")
        import traceback
        print(traceback.format_exc())
        return jsonify({"success": False, "error": str(e)}), 500

def handle_test_db():
    """Prueba la conexión a la base de datos (sincrónico)"""
    try:
        # Ejecutar la función asíncrona de prueba
        result = asyncio.run(async_test_db())
        
        if result['success']:
            return jsonify(result)
        else:
            return jsonify(result), 500
            
    except Exception as e:
        print(f"Error en test-db: {str(e)}")
        import traceback
        print(traceback.format_exc())
        return jsonify({"success": False, "error": str(e)}), 500

# ===== INICIALIZACIÓN =====
# Inicializar la base de datos al arrancar
try:
    asyncio.run(init_db())
    print("Base de datos inicializada correctamente")
except Exception as e:
    print(f"Error inicializando DB: {e}")

# Obligatorio para Vercel
handler = app

if __name__ == '__main__':
    app.run(debug=True, port=5000)