from flask import Flask, request
from flask_cors import CORS, cross_origin
import os
import sys
import subprocess
import cv2
import numpy as np
from segment_anything import sam_model_registry, SamPredictor
from PIL import Image

sys.path.insert(1, '../sam-test')

import get_mask

app = Flask(__name__)
CORS(app)

@app.route("/mask/<x_value>/<y_value>")
def mask(x_value=0, y_value=0):
    subprocess.run(["python", "get_mask.py", x_value, y_value])
    return ":DD"


@app.route("/createnpy", methods=["POST", "GET"])
def process():
    uploaded_path = "../my-app/src/assets/data/temp.png"
    file = request.files["image"]
    if file.filename != "":
        print(":DDD", file)
        file.save(uploaded_path)
        print(":DDD", file)
        print("Processing image started")
        checkpoint = "sam_vit_h_4b8939.pth"
        model_type = "vit_h"
        print("testi")
        sam = sam_model_registry[model_type](checkpoint=checkpoint)
        print("crash?")
        image = cv2.imread(uploaded_path)
        print(":DD", image)
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        sam.to(device='cuda')
        predictor = SamPredictor(sam)
        predictor.set_image(image)
        image_embedding = predictor.get_image_embedding().cpu().numpy()
        np.save("../my-app/src/assets/data/processed.npy", image_embedding)
        print("Processing image ended")
        return {"testing": ["Mask1", "Mask2"]}
    
    return

if __name__ == "__main__":
    app.run(debug=True)
