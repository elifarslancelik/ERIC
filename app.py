from flask import Flask, request, jsonify, render_template, url_for
from model import ERIC
import logging
import os


# Logging settings
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Static folder
app = Flask(__name__, 
    static_folder='static',
    static_url_path='/static')

model = ERIC()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate', methods=['POST'])
def generate():
    try:
        data = request.json
        logger.debug(f"Incoming request: {data}")
        
        if not data or 'input_text' not in data or 'tags' not in data:
            return jsonify({"error": "Invalid request format"}), 400
            
        response = model.generate_response(
            data['input_text'],
            data['tags']
        )
        logger.debug(f"Response generated: {response}")
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"Error occured: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/decode/<response_id>', methods=['GET'])
def decode(response_id):
    response = model.decode_response(response_id)
    if response:
        return jsonify(response)
    return jsonify({"error": "Response not found"}), 404

@app.route('/combine', methods=['POST'])
def combine():
    data = request.json
    response = model.combine_responses(
        data['response_ids'],
        data['new_prompt']
    )
    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=False) 