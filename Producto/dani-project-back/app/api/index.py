from flask import Flask, request, jsonify
import os

app = Flask(__name__)

@app.route('/api', defaults={'path': ''})
@app.route('/api/<path:path>', methods=['GET', 'POST', 'PUT', 'DELETE'])
def catch_all(path):
    # Tu lógica aquí
    return jsonify({
        "message": "API funcionando",
        "path": path,
        "method": request.method
    })

# Esto es OBLIGATORIO para Vercel
handler = app

# Para pruebas locales
if __name__ == '__main__':
    app.run(debug=True, port=5000)