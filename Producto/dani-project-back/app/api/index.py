from flask import Flask, request, jsonify
import os
import traceback

app = Flask(__name__)

# Ruta principal de la API
@app.route('/api', defaults={'path': ''})
@app.route('/api/<path:path>', methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])
def catch_all(path):
    try:
        # Log para depuración
        print(f"Petición a /api/{path} - Método: {request.method}")
        
        return jsonify({
            "success": True,
            "message": "API funcionando correctamente",
            "path": path,
            "method": request.method,
            "data": request.get_json() if request.is_json else None
        })
    except Exception as e:
        print(f"Error en API: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

# Ruta para verificar estado
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "database": "NeonDB (PostgreSQL)",
        "environment": "Vercel"
    })

# Manejador para Vercel (OBLIGATORIO)
handler = app

# Para pruebas locales
if __name__ == '__main__':
    app.run(debug=True, port=5000)