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
import { handleImageScale } from "./components/helpers/scaleHelper"
import { onnxMaskToImage } from "./components/helpers/maskUtils"
import { modelData } from "./components/helpers/onnxModelAPI"
import Stage from "./components/Stage"
import AppContext from "./components/hooks/createContext"
const ort = require("onnxruntime-web")
/* @ts-ignore */
import npyjs from "npyjs"

// Define image, embedding and model paths
const IMAGE_PATH = "/assets/data/naulakko.jpg"
const IMAGE_EMBEDDING = "/assets/data/naulakko.npy"
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
    const [isLoading, setIsLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null); // New state for the image
    const [data, setData] = useState([{}])

    useEffect(() => {
      fetch(`http://localhost:5000/mask/${xcoord}/${ycoord}`).then(
          res => res.json()
      ).then(
        data => {
          setData(data)
          console.log(":DDDD", data)
        }
      )
    }, [imageofmask])

  console.log(":PP", data) 

  const handleImageChange = (e) => {
    setSelectedImage(e.target.files[0]);
  };

  //Test logs to see that states have updated correctly
  useEffect(() => {
    console.log('Cleaned Answer :', cleanedAnswer);
    console.log("setted image state: ", selectedImage)
  }, [cleanedAnswer,selectedImage]); // The second parameter is an array of dependencies, in this case, only cleanedAnswer

  const handleAskBard = async () => {
    setIsLoading(true);

    const formData = new FormData();
    formData.append('image', selectedImage); // Append the image to the FormData object
    formData.append('question', "Find me products similiar to this from zalando and return answer in ```json{products: [{id: number start from 0 ,name: product name ,brand:brand name no sex included ,price:price, link: start with (en.zalando.de/men or women/?q=product name) then add product name add + in every space in product name ),etc.]}```");

    try {
      const response = await axios.post('http://localhost:3001/ask-bard', formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Important header for files
        },
      });
      setcleanedAnswer(response.data.parsedAnswer);
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

    // Load the image
    const url = new URL(IMAGE_PATH, window.location.origin)
    loadImage(url)

    // Load the Segment Anything pre-computed embedding
    Promise.resolve(loadNpyTensor(IMAGE_EMBEDDING, "float32")).then(embedding =>
      setTensor(embedding)
    )
  }, [])

  const loadImage = async url => {
    try {
      const img = new Image()
      img.src = url.href
      img.onload = () => {
        const { height, width, samScale } = handleImageScale(img)
        setModelScale({
          height: height, // original image height
          width: width, // original image width
          samScale: samScale // scaling factor for image which has been resized to longest side 1024
        })
        img.width = width
        img.height = height
        setImage(img)
      }
    } catch (error) {
      console.log(error)
    }
  }

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
        <Stage />
        </Box>
          <div className="ConfirmButtonBox">
            <Button color="neutral" className="ConfirmButton" variant="solid">Confirm Selection</Button>
          </div>
          <Box className="PreviewBox">
        <div className="HeaderBox">
              <h5 className="BoxTitle">Preview</h5>
            </div>
              <img src={""} alt="Logo"></img>
          </Box>
        </div>
        <div className="Middle">
          <Box className="InfoBox">
            <div className="HeaderBox">
              <h5 className="BoxTitle">Similar Products Information</h5>
            </div>
              <p className="InfoText">
                
              </p>
            </Box>
        </div>
        <div className="Right">
      <Box className="InfoBox">
        <div className="HeaderBox">
          <h5 className="BoxTitle">Similar Products Images</h5>
        </div>
      <ListForProducts mediaArray={cleanedAnswer}/>
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