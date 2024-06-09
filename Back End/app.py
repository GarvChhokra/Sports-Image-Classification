from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
from LayerScale import LayerScale
import os
from PIL import Image
from io import BytesIO
import base64
import numpy as np

app = Flask(__name__)
CORS(app)

folder_path = '/mnt/01DA8A2A0D7127B0/College/Semester5/COMP258/Project/AI/'
model = tf.keras.models.load_model(folder_path+'model.keras', custom_objects={
                                   'LayerScale': LayerScale})

# Get categories from 100 classes/train folder
categories = []

for category in os.listdir(folder_path+'100 classes/train'):
    categories.append(category)

# Sort the categories
categories = sorted(categories)


@app.route('/predict', methods=['POST'])
def predict():
    # Get the base64 encoded image from the request
    data = request.get_json()
    image = data['image']

    # Create a PIL image from the base64 encoded image
    image = Image.open(BytesIO(base64.b64decode(image)))
    image = image.resize((224, 224))
    image = image.convert('RGB')
    image = np.array(image) / 255.0
    image = tf.expand_dims(image, axis=0)

    # Predict the class
    prediction = model.predict(image)

    # Get the class name
    class_index = tf.math.argmax(prediction[0]).numpy()
    class_name = categories[class_index]

    return jsonify({'class': class_name})


if __name__ == '__main__':
    app.run(debug=False)
