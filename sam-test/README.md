# Segment anything test

In this folder there's [segment_anything](https://github.com/facebookresearch/segment-anything/tree/main/segment_anything) folder where the notebooks and get_mask.py imports needed functions from.

## Downloading the ONNX model and model checkpoint.

Please follow these [insctructions](https://github.com/facebookresearch/segment-anything#onnx-export) in the official segment anything project to export the ONNX model. To download the model checkpoint, use the [links](https://github.com/facebookresearch/segment-anything#model-checkpoints) provided by the segment anything project.

After you've exported the ONNX model inside the segment anything project and downloaded the corresponding checkpoint, come back here and put the files in this folder. 

## Run the scripts or notebooks

After the previous steps, you should be able to run the notebooks using jupyter or inside VSCode using installed python as the kernel.

The get_mask.py script uses default values to get a mask from an image, or the script can be passed 2 arguments for the x and y values.
Examples of calling the script:
default values: python get_mask.py
passed values: python get_mask.py 2000 1000

after the script has been run, there should a new image with the name mask.png in FashionFinder\my-app\src\assets\data