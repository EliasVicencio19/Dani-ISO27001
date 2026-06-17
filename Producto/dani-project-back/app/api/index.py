from flask import Flask, request, jsonify
# o el framework que estés usando

app = Flask(__name__)

@app.route('/api', defaults={'path': ''})
@app.route('/api/<path:path>')
def catch_all(path):
    # Tu lógica aquí
    return jsonify({"message": "API funcionando"})

# Esto es OBLIGATORIO para Vercel
handler = app