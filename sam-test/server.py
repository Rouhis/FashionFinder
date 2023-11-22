from flask import Flask, request ,jsonify
from flask_cors import CORS, cross_origin
import os
import sys
import subprocess
import cv2
import numpy as np
from segment_anything import sam_model_registry, SamPredictor
from PIL import Image
from bardapi import Bard
import io
import json

sys.path.insert(1, '../sam-test')

import get_mask

app = Flask(__name__)
CORS(app)

@app.route("/mask/<x_value>/<y_value>")
def mask(x_value=0, y_value=0):
    subprocess.Popen(["python", "get_mask.py", x_value, y_value])
    return ":DD"


@app.route("/createnpy", methods=["POST", "GET"])
def process():
    uploaded_path = "../my-app/src/assets/data/temp.png"
    file = request.files["image"]
    if file.filename != "":
        print(":DDD", file)
        file.save(uploaded_path)
        print("Processing image started")
        checkpoint = "sam_vit_h_4b8939.pth"
        model_type = "vit_h"
        sam = sam_model_registry[model_type](checkpoint=checkpoint)
        image = cv2.imread(uploaded_path)
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        sam.to(device='cuda')
        predictor = SamPredictor(sam)
        predictor.set_image(image)
        image_embedding = predictor.get_image_embedding().cpu().numpy()
        np.save("../my-app/src/assets/data/processed.npy", image_embedding)
        print("Processing image ended")
        return {"testing": ["Mask1", "Mask2"]}
    
    return

@app.route("/askbard", methods=["POST"])
def askBard():
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided"}), 400
    formdata = request.files["image"]
    question = request.form["question"]
    imagebytes = formdata.read()
    bard_client = Bard(token='dQi4my_HUFEdGt8YlL_1BXu1yZpDQXdp44YbFH5zELeErrs-7_X2FDemHPV5_-8qZT8OMw.') 
    response = bard_client.ask_about_image(question, imagebytes)
    # Assuming the response contains a JSON with the needed data
    content = response.get('content')
    if content:
        # Process the content as per the expected response format
        print(content)
        cleaned_answer = content.replace("```json", "").replace("```", "")
        print(cleaned_answer)
        parsed_answer = json.loads(cleaned_answer)
        print(parsed_answer)
        return jsonify(parsed_answer=parsed_answer)
    else:
        return jsonify({"error": "Invalid response from Bard service"}), 500


if __name__ == "__main__":
    app.run(debug=True)

