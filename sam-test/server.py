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
import requests
import base64
import re
from io import BytesIO

mask_path = "../my-app/src/assets/data/mask.png"
if os.path.exists(mask_path):
    #os.remove(mask_path)
    print("lol")
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
'''
@app.route("/askbard", methods=["POST"])
def askBard():
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided"}), 400
    formdata = request.files["image"]
    question = request.form["question"]
    imagebytes = formdata.read()
    # Bard Token
    bard_client = Bard(token='dwh418eMFseWXJ_ikxIaFHRmVpLcxzpOpC1Till5oynE00auQet4Z_CPrXt84gWcXkYkvA.')
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
'''   

@app.route("/askgbt", methods=["POST"])
def askBard():
    api_key = "lmao no api key :d"
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided"}), 400
    formdata = request.files["image"]
    question = request.form["question"]
    pattern = r'\{.*\}'
    json_data = ""
    imagebytes = formdata.read()
    image = Image.open(io.BytesIO(imagebytes))
    image.save(mask_path)
    image_base64 = base64.b64encode(imagebytes)
    image_base64_string = image_base64.decode('utf-8')
    print(type(image_base64_string))
    
    headers = {
        "Content": "application/json",
        "Authorization": f"Bearer {api_key}"
    }
    payload = {
  "model": "gpt-4-vision-preview",
  "messages": [
    {
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": f"{question}"
        },
        {
          "type": "image_url",
          "image_url": {
            "url": f"data:image/jpeg;base64,{image_base64_string}"
          }
        }
      ]
    }
  ],
  "max_tokens": 300
} 
    response = requests.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload)
    #response = 'Im sorry, but I cant assist with finding real-time data or current product listings from the internet. However, I can provide an example of how you might structure the JSON response with fictional or generic product data for similar items. Below is an example JSON structure:{  "products": [    {      "id": 0,      "name": "Leather Jacket",      "brand": "Classic Gear",      "price": 99.99,      "specialName": "Leather+Jacket",      "sex": "men"    },    {      "id": 1,      "name": "Motorcycle Jacket",      "brand": "RoadRider",      "price": 129.99,      "specialName": "Motorcycle+Jacket",      "sex": "men"    },    {      "id": 2,      "name": "Bomber Jacket",      "brand": "Aviator",      "price": 89.99,      "specialName": "Bomber+Jacket",      "sex": "men"    }  ]}Please remember that the above data is hypothetical and does not represent real products or actual prices.'
    try:
    # Since response.json is a method, you need to call it to get the JSON response
        data = response.json()
        print(data)
    # Extracting the 'content' from the 'message'
        content_str = data['choices'][0]['message']['content']
        #content_str = content_str.replace("```json\n", "").replace("\n'''", "").strip()
        #content_str = content_str.replace("```", "")
        match = re.search(pattern, content_str, re.DOTALL)
        if match:
            json_str = match.group()
            try:
                json_data = json.loads(json_str)
                print("Extracted JSON:", json_data)
            except json.JSONDecodeError:
                print(":DDDDDddddDDDDD")
                return ({"error": "Extracted string is not a valid JSON"}), 500
        else:
            print(":DDDDDddddDDDDDDDDDDDDDD")
            return ({"error": "No JSON found in the text"})
    # Try to convert 'content' JSON string to dictionary
        try:
            print("dddddddd" + json_data)
            products = json_data['products']
        except json.JSONDecodeError:
            print(":DDDD")
            return jsonify({"error": "Invalid content format"}), 500
        except KeyError:
            print(":DDDDDDDD")
            return jsonify({"error": "Key 'products' not found in the content data"}), 404

        if products:
            return jsonify(products)
        else:
            print(":DDD")
            return jsonify({"error": "No products found"}), 404
    except json.JSONDecodeError:
        print(":D")
        return jsonify({"error": "Invalid JSON format in response"}), 500
    except KeyError:
        print(":DDDDdDdD")
        return jsonify({"error": "Key error in parsing response"}), 404
    
if __name__ == "__main__":
    app.run(debug=True)

