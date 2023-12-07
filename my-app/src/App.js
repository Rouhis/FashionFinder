// Copyright (c) Meta Platforms, Inc. and affiliates.
// All rights reserved.

// This source code is licensed under the license found in the
// LICENSE file in the root directory of this source tree.
import "./App.css";
import "./assets/scss/App.scss";
import { handleImageScale } from "./components/helpers/scaleHelper";
import { onnxMaskToImage } from "./components/helpers/maskUtils";
import { modelData } from "./components/helpers/onnxModelAPI";
import Stage from "./components/Stage";
import AppContext from "./components/hooks/createContext";
import ImagePathToFile from "./components/helpers/ImagePathToFile";
import { Box } from "@mui/system";
import Slider from "@mui/material/Slider";
import ListForProducts from "./List";
import { InferenceSession } from "onnxruntime-web";
import React, { useContext, useEffect, useState, useCallback, useRef } from "react";
import Lottie, { useLottieInteractivity } from "lottie-react";
import loading from "./assets/data/loading.json";
import pigeon from "./assets/data/pigeon.json";
import upload from "./assets/data/upload.json";
import error from "./assets/data/error.json"
//import {loading, pigeon, upload} from "./assets/data/";
import axios from "axios";
import { SelectBoxMaterial, SelectBoxColor } from "./SelectBox";
/* @ts-ignore */
import npyjs from "npyjs";

const ort = require("onnxruntime-web");

// Define embedded image and model paths
const IMAGE_EMBEDDING = "/assets/data/processed.npy";
const MODEL_DIR = "./assets/sam_onnx_quantized_example.onnx";

const App = () => {
  const uploadRef = useRef()
  // Create state variables that aren't used through the app context
  const [cleanedAnswer, setcleanedAnswer] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null); // New state for the image
  const [price, setPrice] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(null);
  const [maskLoaded, setMaskLoaded] = useState(false);
  const [data, setData] = useState("");
  const [uploadLottieState, setUploadLottieState] = useState(false);
  const [loadingLottieState, setLoadingLottieState] = useState(false);
  const [isApiKey, setIsApiKey] = useState(true)
  const [errorLottieState, setErrorLottieState] = useState(false);

  //Set Price State value
  const handleSliderChange = (event, newPrice) => {
    setPrice(newPrice);
  };

  const handleImageChange = async (event) => {
    setImageLoaded(false)
    uploadRef.current.play()
    setUploadLottieState(true); // Start playing the upload lottie
    setIsLoading(true);
    const imgFormData = new FormData(); // Creates new formdata element
    const file = event.target.files[0];
    // Perform file validation and read the file if necessary

    // After the file is read and is ready to be shown on the preview
    const imageUrl = URL.createObjectURL(file);
    imgFormData.append("image", file); // Append the selected image/file to the formdata with the name: "image" and value: selected file
    /**
     * Send a fetch request to the python server's createnpy endpoint using axios.post.
     * parameters for axios.post:
     * @param {URL} "http://localhost:5000/createnpy" URL for the backend endpoint
     * @param {data} imgFormData FormData, that has the image file with name "image"
     * @param {headers} headers When sending FormData, it's important to include the headers in the request
     */
    const backendres = await axios.post(
      "http://127.0.0.1:8000/createnpy",
      imgFormData,
      {
        headers: {
          "Content-Type": "multipart/form-data", // Important header for files
        },
      }
    );
    setData(backendres);
    setImageLoaded(true);
    setIsLoading(false);
    setSelectedImage(file);
    loadImage(imageUrl); // Call loadImage with the new image URL
    setUploadLottieState(false); // Hides the loading lottie when the image is showing on the screen
  };

  const loadImage = async (url) => {
    try {
      const img = new Image();
      img.src = url;
      img.onload = () => {
        const { height, width, samScale } = handleImageScale(img);
        setModelScale({
          height: height, // original image height
          width: width, // original image width
          samScale: samScale, // scaling factor for image which has been resized to longest side 1024
        });
        img.width = width;
        img.height = height;
        setImage(img); // Here you will set the image in the context or state
      };
    } catch (error) {
      console.log(error);
    }
  };

  //Test logs to see that states have updated correctly
  useEffect(() => {
    //console.log('Cleaned Answer :', cleanedAnswer);
    //console.log("setted image state: ", selectedImage)
  }, [cleanedAnswer, ".assets/data/mask.png"]); // The second parameter is an array of dependencies, in this case, only cleanedAnswer

  const handleAskBard = async () => {
    setErrorLottieState(true)
    setLoadingLottieState(true)
    setIsApiKey(true)
    setIsLoading(true);
    let image = selectedImage;

    const formData = new FormData();
    let newFIle = await ImagePathToFile(
      "./assets/data/mask.png",
      "mask.png"
    ).then((file) => {
      console.log(file);
      image = file;
    });
    console.log(newFIle);
    formData.append("image", image); // Append the image to the FormData object
    formData.append(
      "question",
      "Find me products similiar to this from any place and return answer in json format {products: [{id: number start from 0 ,name: product name without color and sex,brand:brand name no sex included ,price:price, specialName: product name with + symbol in every space no sex included, sex: (product sex men or women with lower case)etc.]} dont add anything after json"
    );

    try {
      const response = await axios.post(
        "http://localhost:8000/askgbt",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data", // Important header for files
          },
        }
      );
      console.log(":DD" + response);
      console.log(":DD" + response.data)
      console.log(cleanedAnswer + ":DDADD")
      setcleanedAnswer(response.data);
      console.log(cleanedAnswer + " djoiadioawdiadipadipdhipdhipadhipwadhipadwhiapdwhiapdwhiwadh")
    } catch (error) {
      console.error("Error fetching response from Gbt:", error);
      setIsApiKey(false)
    }
    setIsLoading(false);
    setLoadingLottieState(false)
    setErrorLottieState(false)
  };

  // Create state variables used through the app context
  const {
    clicks: [clicks],
    image: [, setImage],
    maskImg: [, setMaskImg],
    maskedImg: [maskedImg, setMaskedImg],
    material: [material, setMaterial],
    color: [color, setColor],
  } = useContext(AppContext);
  const [model, setModel] = useState(null); // ONNX model
  const [tensor, setTensor] = useState(null); // Image embedding tensor

  // The ONNX model expects the input to be rescaled to 1024.
  // The modelScale state variable keeps track of the scale values.
  const [modelScale, setModelScale] = useState(null);

  // Initialize the ONNX model. load the image, and load the SAM
  // pre-computed image embedding
  useEffect(() => {
    // Initialize the ONNX model
    const initModel = async () => {
      try {
        if (MODEL_DIR === undefined) return;
        const URL = MODEL_DIR;
        const model = await InferenceSession.create(URL);
        setModel(model);
      } catch (e) {
        console.log(e);
      }
    };
    initModel();

    // Load the Segment Anything pre-computed embedding
    Promise.resolve(loadNpyTensor(IMAGE_EMBEDDING, "float32")).then(
      (embedding) => setTensor(embedding)
    );
  }, [data]);

  // Decode a Numpy file into a tensor.
  const loadNpyTensor = async (tensorFile, dType) => {
    let npLoader = new npyjs();
    const npArray = await npLoader.load(tensorFile);
    const tensor = new ort.Tensor(dType, npArray.data, npArray.shape);
    return tensor;
  };

  // Run the ONNX model every time clicks has changed
  useEffect(() => {
    runONNX();
  }, [clicks]);

  const runONNX = async () => {
    try {
      if (
        model === null ||
        clicks === null ||
        tensor === null ||
        modelScale === null
      )
        return;
      else {
        // Preapre the model input in the correct format for SAM.
        // The modelData function is from onnxModelAPI.tsx.
        const feeds = modelData({
          clicks,
          tensor,
          modelScale,
        });
        if (feeds === undefined) return;
        // Run the SAM ONNX model with the feeds returned from modelData()
        const results = await model.run(feeds);
        const output = results[model.outputNames[0]];
        // The predicted mask returned from the ONNX model is an array which is
        // rendered as an HTML image using onnxMaskToImage() from maskUtils.tsx.
        setMaskImg(
          onnxMaskToImage(output.data, output.dims[2], output.dims[3])
        );
      }
    } catch (e) {
      console.log(e);
    }
  };

  function valuetext(value) {
    return `${value}`;
  }

  function printvalue() {
    valuetext();
    document.getElementById("PriceRange").value = "76";
  }

  useEffect(() => {
    if (uploadRef.current) {
      uploadRef.current.goToAndStop(1000)// Got to frame 1000 and stop
    }
  }, [])

  return (
    <div className="App">
      <div className="TitleHeader">
        <img src="./assets/data/logo192.png" style={{ width: 100 }}></img>
        <h1 className="title">Fashion Finder</h1>
      </div>
      <div className="Boxes">
        <div className="Left">
          <div className="HeaderBox">
            <h5 className="BoxTitle">Upload image of the desired clothing</h5>
          </div>
          <Box className="ToBeMaskedImg" style={{ height: 581 }}>
            {/** 
             * Show lottie when the lottieState is true (when use uploads an image and is waiting for it to show on the screen) 
             * Show the uploaded image that lets the user hover over it and preview masks. (Tool custom component has the mask preview functionality which is inside the stage component)
             * Show a lottie when there's no uploaded image displayed.
            */}
            {imageLoaded && <div><Stage /></div>}
            {!imageLoaded && <Lottie lottieRef={uploadRef} animationData={upload} style={{ width: 300 }} loop={false} onComplete={() => {
              uploadRef.current.goToAndStop(3000)
            }} />}
            <input
              type="file"
              onChange={handleImageChange}
              disabled={isLoading}
            />
          </Box>
        </div>
        <div className="Middle">
          <div className="HeaderBox">
            <h5 className="BoxTitle">Selected Clothing</h5>
          </div>
          <div className="OptionBox">
            <SelectBoxMaterial name={"Material"}></SelectBoxMaterial>

            <SelectBoxColor name={"Color"}></SelectBoxColor>

            <Box sx={{ width: 170 }}>
              <label>Max price</label>
              <Slider
                id="PriceRange"
                max={1000}
                min={0}
                valueLabelDisplay="auto"
                getAriaValueText={valuetext}
                onChange={handleSliderChange}
              />
            </Box>
          </div>
          <Box className="InfoBox">
            {maskedImg ? (
              <img
                src={maskedImg ? maskedImg.src : undefined}
                alt="Image of a mask"
              ></img>
            ) : (
              <div>
                {" "}
                <Lottie
                  animationData={pigeon}
                  loop={true}
                  style={{ height: 200 }}
                />{" "}
                <p style={{ textAlign: "center" }}>No mask selected</p>{" "}
              </div>
            )}
          </Box>
        </div>
        <div className="Right">
          <div className="HeaderBox">
            <h5 className="BoxTitle">Similar Products</h5>
          </div>
          <Box className="SimilarProducts">
            {loadingLottieState && <div style={{display: "flex", alignItems: "center", flexDirection: "column"}}><Lottie animationData={loading} style={{ width: 300 }} loop={true} /></div>}
            {/* Check if the backend returned a json with an error 
              * or if user doesn't have the correct API key and the server returns and error
              * If either is true show a lottie with text on the rightmost box, and if neither was true, return products on the box
              */}
            {
              cleanedAnswer.error || !isApiKey ?
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <Lottie animationData={error} style={{ width: 300 }} loop={true} />
                  <p style={{ textAlign: "center", padding: "10%" }}>Please try again and check that you are using the correct API key</p>
                </div> :
                <ListForProducts
                  mediaArray={cleanedAnswer}
                  material={material}
                  color={color}
                />
            }
          </Box>
          <div className="ConfirmButtonBox">
            <button
              className="ConfirmButton"
              variant="solid"
              disabled={isLoading || !selectedImage}
            >
              Make search again
            </button>
          </div>
        </div>
      </div>
      <div className="ConfirmButtonBox">
        <button className="ConfirmButton" variant="solid" onClick={handleAskBard} disabled={isLoading || !selectedImage}>
          Find Similar Products
        </button>
      </div>
    </div>
  );
};

export default App;
