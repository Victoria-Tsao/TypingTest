from flask import Flask, render_template, request, jsonify, url_for
import os
import random

app = Flask(__name__, static_folder='static', static_url_path='/static')

# Configure the upload file storage path
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # Limit upload file size to 16MB

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file was uploaded'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if file and file.filename.endswith('.txt'):
        try:
            content = file.read().decode('utf-8')
            # Split the text into paragraphs and randomly select one
            paragraphs = [p.strip() for p in content.split('\n\n') if p.strip()]
            if not paragraphs:
                return jsonify({'error': 'File content is empty'}), 400
            
            selected_text = random.choice(paragraphs)
            return jsonify({'text': selected_text})
        except Exception as e:
            return jsonify({'error': f'File reading error: {str(e)}'}), 500
    else:
        return jsonify({'error': 'Only .txt files are supported'}), 400

if __name__ == '__main__':
    app.run(debug=True) 