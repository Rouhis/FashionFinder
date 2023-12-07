from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
import os
import sys
import subprocess
import cv2
import numpy as np
from segment_anything import sam_model_registry, SamPredictor
from PIL import Image
#from bardapi import Bard
import io
import queue
import json
import requests
import base64
import re
from io import BytesIO

# Define app and use Cors with default arguments. Cors is now allowed for all domains on all routes
app = Flask(__name__)
CORS(app)


# Route for creating a mask when user clicks a mask preview on the image
# Takes x_value and y_value as arguments and passes them to get_mask.py script. X and Y are the coordinates for where the user clicks
@app.route("/mask/<x_value>/<y_value>")
# Launch get_mask.py as a child process, decode the output to string format and return it as json
def mask(x_value=0, y_value=0):
    print("Masking started")
    # Run get_mask.py as a child process using subprocess.check_output. 
    # Waits for the script to finish running and returns it's output, in this case it returns what is printed inside the script.
    # This function doesn't care about what get_mask.py is returing, subprocess.check_output is only used to run this function asynchronously.
    # By doing it this way, the function will only return something after the get_mask.py has been run.
    output = subprocess.check_output(["python", "get_mask.py", x_value, y_value])
    output_string = output.decode("utf-8") # Since the subprocess.check_output() function returns the value as bytes object, the value needs to be decoded into a string.
    print("Masking ended")
    return jsonify(output_string) # Return what the get_mask.py printed as json

# Route for creating an npy file of the image the user uploads on the website
# This npy file is required for SAM to create the blue masks on top of the selected image, when the user hovers their cursor over the image
@app.route("/createnpy", methods=["POST", "GET"])
def process():
    uploaded_path = "../my-app/src/assets/data/temp.png" # Define the path to where the npy file will be saved
     # Get the image file from the request using the appended "image" name. 
     # The name needs to be the same as the one that's appended to the form data in the front end 
    file = request.files["image"]
    if file.filename != "": # Check if the filename in the request is not empty, if it's not empty there should be an actual image in the request
        print(":DDD", file)
        file.save(uploaded_path) # Save the file to the data folder so it can be easily accessed later
        print("Processing image started")
        # Checkpoint for the model. Download from here: (https://github.com/facebookresearch/segment-anything#model-checkpoints) and place it in the same folder as this script
        checkpoint = "sam_vit_h_4b8939.pth"
        model_type = "vit_h" # Type of the model. Use the same type as the checkpoint
        sam = sam_model_registry[model_type](checkpoint=checkpoint) # Initialize the model
        image = cv2.imread(uploaded_path) # Save the image to a variable
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB) # Change the colours of the image to a specific type
        sam.to(device='cuda') # Define the device SAM should use
        predictor = SamPredictor(sam) # Create predictor, this is what creates the mask
        predictor.set_image(image) # Give the predictor the image for masking
        image_embedding = predictor.get_image_embedding().cpu().numpy() # Create the image embedding which is an npy file
        np.save("../my-app/src/assets/data/processed.npy", image_embedding) # Save the npy file to the data folder
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

# Define the Flask route for handling POST requests at "/askgbt"
@app.route("/askgbt", methods=["POST"])
def askGbt():
    # OpenAI API key, replace "APIKEY HERE" with your actual API key
    api_key = "API KEY HERE"

    # Check if 'image' is present in the POST request
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided"}), 400

    # Get the image file and question from the POST request
    formdata = request.files["image"]
    question = request.form["question"]

    # Regular expression pattern for extracting JSON content from the OpenAI response
    pattern = r'\{.*\}'

    # Read the image bytes and save it to a file
    imagebytes = formdata.read()
    image = Image.open(io.BytesIO(imagebytes))
    image.save("../my-app/src/assets/data/mask.png")

    # Convert the image to base64 format
    image_base64 = base64.b64encode(imagebytes)
    image_base64_string = image_base64.decode('utf-8')

    # Print the type of the base64-encoded image string
    print(type(image_base64_string))

    # Set headers for the OpenAI API request
    headers = {
        "Content": "application/json",
        "Authorization": f"Bearer {api_key}"
    }

    # Prepare payload for the OpenAI API request
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

    # Make a POST request to the OpenAI API
    response = requests.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload)

    # Try to handle the OpenAI API response
    try:
        # Extract the 'content' from the 'message'
        content_str = response.json()['choices'][0]['message']['content']

        # Clean the extracted JSON string
        match = re.search(pattern, content_str, re.DOTALL)
        if match:
            # Extracted JSON string
            match_group = match.group()
            clean_json_string = match_group.replace(" ", "").replace("\n", "") # Remove all whitespaces and linebreaks to handle the text easier
            print("xddd", clean_json_string)
            # Check if the given result isn't in proper json format, if it isn't add the missing brackets
            # match.group() should never end in "," and instead always end in "}" but content_str has ended in "," before so this is here just incase
            if clean_json_string.endswith(","):
                print("endswithtest")
                clean_json_string = clean_json_string + "]}"


            # There is a problem where sometimes the value of content_str json ends before the last item's closing bracket } 
            # and the last 2 ]} brackets are missing too, but based on testing,
            # match.group() always ends on }, so it'll remove the incompleted product and show only up to the last completed product in the json.
            # So match.group()'s value should always be either a proper json, or incompleted json that's missing the last closing brackets.
            # With this code we can check if the json is incomplete, and if it is, add the missing brackets to the end of the incompleted json.
            # Since we remove the whitespaces and line breaks from the json, we can just add the missing brackets to the variable
            print("match group", clean_json_string)
            if not clean_json_string.endswith("]}"):
                clean_json_string = clean_json_string + "]}"

            # Attempt to parse the cleaned JSON string
            try:
                json_data = json.loads(clean_json_string)
                print("Extracted JSON:", json_data)
            except json.JSONDecodeError:
                return ({"error": "Extracted string is not a valid JSON"}), 500
        else:
            return ({"error": "No JSON found in the text"})

        # Try to extract 'products' from the parsed JSON data
        try:
            products = json_data['products']
            print("products", products)
        except json.JSONDecodeError:
            return jsonify({"error": "Invalid content format"}), 500
        except KeyError:
            return jsonify({"error": "Key 'products' not found in the content data"}), 404

        # Check if 'products' exist and return the response
        if products:
            return jsonify(products)
        else:
            return jsonify({"error": "No products found"}), 404
    except json.JSONDecodeError:
        return jsonify({"error": "Invalid JSON format in response"}), 500
    except KeyError:
        return jsonify({"error": "Key error in parsing response"}), 404

    
if __name__ == "__main__":
    app.run(debug=True)

