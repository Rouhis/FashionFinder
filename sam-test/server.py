from flask import Flask, request, jsonify
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
import queue
import json

mask_path = "../my-app/src/assets/data/mask.png"
if os.path.exists(mask_path):
    os.remove(mask_path)
else:
    print("There isn't a mask to delete")

    
app = Flask(__name__)
CORS(app)


@app.route("/mask/<x_value>/<y_value>")
# Launch get_mask.py as a child process, decode the output to string format and return it as json
def mask(x_value=0, y_value=0):
    print("first")
    # Run get_mask.py as a child process using subprocess.check_output. 
    # Waits for the script to finish running and returns it's output, in this case it returns what is printed inside the script.
    # This function doesn't care about what get_mask.py is returing, subprocess.check_output is only used to run this function asynchronously.
    # By doing it this way, the function will only return something after the get_mask.py has been run.
    output = subprocess.check_output(["python", "get_mask.py", x_value, y_value])
    print("second")
    # Since the subprocess.check_output() function returns the value as bytes object, the value needs to be decoded into a string.
    output_string = output.decode("utf-8")
    print("third")
    # Finally return what the get_mask.py printed as json
    return jsonify(output_string)

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
    bard_client = Bard(token='') 
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

