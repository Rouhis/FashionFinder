// Copyright (c) Meta Platforms, Inc. and affiliates.
// All rights reserved.

// This source code is licensed under the license found in the
// LICENSE file in the root directory of this source tree.
import './App.css';
import Button from '@mui/joy/Button';
import { Box } from '@mui/system';
import ListForProducts from './List';
import { InferenceSession } from "onnxruntime-web"
import React, { useContext, useEffect, useState } from "react"
import axios from "axios"
import "./assets/scss/App.scss"
import { handleImageScale } from "./components/helpers/scaleHelper"
import { onnxMaskToImage } from "./components/helpers/maskUtils"
import { modelData } from "./components/helpers/onnxModelAPI"
import Stage from "./components/Stage"
import AppContext from "./components/hooks/createContext"
const ort = require("onnxruntime-web")
/* @ts-ignore */
import npyjs from "npyjs"
import DynamicMask from './components/DynamicMask';

// Define image, embedding and model paths
const IMAGE_PATH = "/assets/data/naulakko.jpg"
const IMAGE_EMBEDDING = "/assets/data/processed.npy"
const MODEL_DIR = "/assets/sam_onnx_quantized_example.onnx"
let imageofmask = ""
let xcoord = 0
let ycoord = 0

export const test = async (testing, click) => {
  console.log("clicks:", click[0])
  imageofmask = testing.src
  xcoord = click[0].x
  ycoord = click[0].y
}

const App = () => {

    const [cleanedAnswer, setcleanedAnswer] = useState([]);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [maskLoaded, setMaskLoaded] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState("")
    const [material, setMaterial] = useState("");
    const [color, setColor] = useState("");

    const onMaskClick = async () => {
      if (imageofmask != "") {
        try {
          test = await fetch(`http://localhost:5000/mask/${xcoord}/${ycoord}`).then(
            res => res.json()
          ).then(
            data => {
              setData(data)
              console.log(":DDDD", data)
            }
          )
        } catch (e) {
          console.log("Server is not on", e)
        }
        setMaskLoaded(true)
      } else {
        console.log("Mask wasn't clicked")
      }
    }

  const handleImageChange = async event => {
    setIsLoading(true);
    const imgFormData = new FormData()
    const file = event.target.files[0];
    // Perform file validation and read the file if necessary
    // ...
    // After the file is read and is ready to be shown on the preview
    const imageUrl = URL.createObjectURL(file);
    imgFormData.append("image", file)
    const backendres = await axios.post("http://localhost:5000/createnpy", imgFormData, {
      headers: {
        'Content-Type': 'multipart/form-data', // Important header for files
      },
    })
    console.log(":DDDDDDDDDDDDDD", backendres)
    setData(backendres)
    setImageLoaded(true);
    setIsLoading(false);
    setSelectedImage(file);
    loadImage(imageUrl); // Call loadImage with the new image URL
  };

  
  const loadImage = async (url) => {
    try {
      const img = new Image()
      img.src = url
      img.onload = () => {
        const { height, width, samScale } = handleImageScale(img)
        setModelScale({
          height: height, // original image height
          width: width, // original image width
          samScale: samScale // scaling factor for image which has been resized to longest side 1024
        })
        img.width = width
        img.height = height
        setImage(img) // Here you will set the image in the context or state
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    onMaskClick()
  }, [imageofmask])

  //Test logs to see that states have updated correctly
  useEffect(() => {
    console.log('Cleaned Answer :', cleanedAnswer);
    console.log("setted image state: ", selectedImage)
  }, [cleanedAnswer,".assets/data/mask.png"]); // The second parameter is an array of dependencies, in this case, only cleanedAnswer

  const handleAskBard = async () => {
    setIsLoading(true);

    const formData = new FormData();
    formData.append('image', selectedImage); // Append the image to the FormData object
    formData.append('question', "Find me products similiar to this from zalando and return answer in json{products: [{id: number start from 0 ,name: product name without color and sex,brand:brand name no sex included ,price:price, specialName: product name with + symbol in every space no sex included, sex: (product sex men or women with lower case)etc.]}dont add anything after json");

    try {
      const response = await axios.post('http://localhost:5000/askbard', formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Important header for files
        },
      });
      setcleanedAnswer(response.data.parsed_answer);
     } catch (error) {
      console.error('Error fetching response from Bard:', error);
    }
    setIsLoading(false);
  }

  const {
    clicks: [clicks],
    image: [, setImage],
    maskImg: [, setMaskImg]
  } = useContext(AppContext)
  const [model, setModel] = useState(null) // ONNX model
  const [tensor, setTensor] = useState(null) // Image embedding tensor

  // The ONNX model expects the input to be rescaled to 1024.
  // The modelScale state variable keeps track of the scale values.
  const [modelScale, setModelScale] = useState(null)

  // Initialize the ONNX model. load the image, and load the SAM
  // pre-computed image embedding
  useEffect(() => {
    // Initialize the ONNX model
    const initModel = async () => {
      try {
        if (MODEL_DIR === undefined) return
        const URL = MODEL_DIR
        const model = await InferenceSession.create(URL)
        setModel(model)
      } catch (e) {
        console.log(e)
      }
    }
    initModel()

    // Load the Segment Anything pre-computed embedding
    Promise.resolve(loadNpyTensor(IMAGE_EMBEDDING, "float32")).then(embedding =>
      setTensor(embedding)
    )
  }, [data])
  

  // Decode a Numpy file into a tensor.
  const loadNpyTensor = async (tensorFile, dType) => {
    let npLoader = new npyjs()
    const npArray = await npLoader.load(tensorFile)
    const tensor = new ort.Tensor(dType, npArray.data, npArray.shape)
    return tensor
  }

  // Run the ONNX model every time clicks has changed
  useEffect(() => {
    runONNX()
  }, [clicks])

  const runONNX = async () => {
    try {
      if (
        model === null ||
        clicks === null ||
        tensor === null ||
        modelScale === null
      )
        return
      else {
        // Preapre the model input in the correct format for SAM.
        // The modelData function is from onnxModelAPI.tsx.
        const feeds = modelData({
          clicks,
          tensor,
          modelScale
        })
        if (feeds === undefined) return
        // Run the SAM ONNX model with the feeds returned from modelData()
        const results = await model.run(feeds)
        const output = results[model.outputNames[0]]
        // The predicted mask returned from the ONNX model is an array which is
        // rendered as an HTML image using onnxMaskToImage() from maskUtils.tsx.
        setMaskImg(onnxMaskToImage(output.data, output.dims[2], output.dims[3]))
      }
    } catch (e) {
      console.log(e)
    }
  }

  return (
    <div className="App"> 
      <h1 className="title">Fashion Finder</h1>
      <input type="text" placeholder="Enter material" onChange={(e) => setMaterial(e.target.value)} />
            <input type="text" placeholder="Enter color" onChange={(e) => setColor(e.target.value)} />
      <div className="Boxes">
        <div className="Left">
          <Box className="LoadImageBox">
            <div className="HeaderBox">
              <h5 className="BoxTitle">Load Image</h5>
            </div>
            <input 
          type="file" 
          onChange={handleImageChange} 
          disabled={isLoading} 
        
        />
        </Box>
          <div className="ConfirmButtonBox">
            <Button color="neutral" className="ConfirmButton" variant="solid">Confirm Selection</Button>
          </div>
          <Box className="PreviewBox">
        <div className="HeaderBox">
              <h5 className="BoxTitle">Preview</h5>
            </div>
              <DynamicMask />
          </Box>
        </div>
        <div className="Middle">
          <Box className="InfoBox">
            <div className="HeaderBox">
              <h5 className="BoxTitle">Similar Products Information</h5>
            </div>
              <div style={{display: "flex", flexDirection: "row", justifyContent: "flex-start", overflow: "hidden"}}>
                {imageLoaded && <Stage />}
              </div>
            </Box>
        </div>
        <div className="Right">
      <Box className="InfoBox">
        <div className="HeaderBox">
          <h5 className="BoxTitle">Similar Products Images</h5>
        </div>
      <ListForProducts mediaArray={cleanedAnswer} material={material} color={color} />
      </Box>
    </div>
      </div>
      <div className="ConfirmButtonBox">
            <Button color="neutral" className="ConfirmButton" variant="solid" onClick={handleAskBard} disabled={isLoading || !selectedImage}>Find Similar Products</Button>
        </div>
    </div>
  );
};

export default App;