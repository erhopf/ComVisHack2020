from flask import Flask, request
import ocr

app = Flask(__name__)
app.config['JSON_AS_ASCII'] = False


@app.route('/')
def index():
    return "Please supply a route."


@app.route('/ocr', methods=['POST'])
def get_text():
    data = request.get_json()
    image_uri = data['image_uri']
    response = ocr.read_image(image_uri)
    return response
