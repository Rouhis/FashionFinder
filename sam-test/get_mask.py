import numpy as np
import torch
import matplotlib.pyplot as plt
import cv2
from segment_anything import sam_model_registry, SamPredictor
import sys
from PIL import Image as im


if __name__ == "__main__":
    # number of passed arguments.
    n = len(sys.argv)
    print(f"Passed arguments amount: {n}")
    
    # Check if there are 3 arguments passed (filename, x and y).
    # If there are use the parameters as x and y values.
    if n == 3:
        xarg = sys.argv[1]
        yarg = sys.argv[2]
        print("\nx and y arguments passed:", xarg, yarg)
    else:
        xarg = ""
        yarg = ""

    # Save an image to a variable (currently uses a specific image for testing).
    image = cv2.imread('../my-app/src/assets/data/temp.png')
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    saved_mask_path = "../my-app/src/assets/data/mask.png"

    # Function for initializing the SAM model and getting a mask using x and y coordinates as input points.
    def get_mask(x = 2739.5833333333335, y = 1875):
        sys.path.append("")
        sam_checkpoint = "sam_vit_h_4b8939.pth"
        model_type = "vit_h"
        device = "cuda"
        sam = sam_model_registry[model_type](checkpoint=sam_checkpoint)
        sam.to(device=device)
        predictor = SamPredictor(sam)
        predictor.set_image(image)
        input_point = np.array([[x, y]])
        input_label = np.array([1])
        masks, scores, logits = predictor.predict(
            point_coords=input_point,
            point_labels=input_label,
            multimask_output=True,
        )
        generated_mask = masks[0]
        print(generated_mask)
        # Mask is saved in COCO RLE format. More info here: (https://github.com/facebookresearch/segment-anything#dataset).
        # All the False values in the mask are converted to white pixels, so only the masked part of the image remains with a white background.
        image[generated_mask==False] = [255,255,255]

        # Convert the mask from a numpy.ndarray to image using PIL's Image module.
        print(type(image))
        img_from_array = im.fromarray(image)

        # Convert the image to RGBA fomat get the data of the image.
        img = img_from_array.convert("RGBA")
        datas = img.getdata()

        # Use the image data and convert the white pixels to a transparent background.
        newData = []
        for item in datas:
            if item[0] == 255 and item[1] == 255 and item[2] == 255:
                newData.append((255, 255, 255, 0))
            else:
                newData.append(item)

        img.putdata(newData)
        
        # Change the size of the image to a smaller one. 
        img.save(saved_mask_path, "PNG")

    # Check if the parameters were given properly, if so use the given parameters for the get_mask function.
    # If the parameters weren't passed properly, call the get_mask function with default values.
    # Default values will get a hoodie as a mask.
    if xarg and yarg != "":
        get_mask(xarg, yarg)
    else:
        get_mask()