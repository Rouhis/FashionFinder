from flask import Flask, request
from flask_cors import CORS, cross_origin
import os
import sys
import subprocess
import cv2
import numpy as np
from segment_anything import sam_model_registry, SamPredictor

sys.path.insert(1, '../sam-test')

import get_mask

app = Flask(__name__)
cors = CORS(app, resources={r"/mask/*": {"origins": "*"}, r"/createnpy": {"origins": "*"}})

@app.route("/mask/<x_value>/<y_value>")
def mask(x_value=0, y_value=0):
    subprocess.run(["python", "get_mask.py", x_value, y_value])


@app.route("/createnpy", methods=["POST"])
@cross_origin()
def process():
    file = request.files["file"]
    if file.filename != "":
        file.save("uploaded_file")

    #print("Processing image started")
    #checkpoint = "sam_vit_h_4b8939.pth"
    #model_type = "vit_h"
    #sam = sam_model_registry[model_type](checkpoint=checkpoint)
    #image = cv2.imread(img)
    #image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    #sam.to(device='cuda')
    #predictor = SamPredictor(sam)
    #predictor.set_image(image)
    #image_embedding = predictor.get_image_embedding().cpu().numpy()
    #np.save("../my-app/src/assets/data/processed.npy", image_embedding)
    #print("Processing image ended")


if __name__ == "__main__":
    app.run(debug=True)
