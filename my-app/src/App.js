// Copyright (c) Meta Platforms, Inc. and affiliates.
// All rights reserved.

// This source code is licensed under the license found in the
// LICENSE file in the root directory of this source tree.

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

const styles = {
  container: {
    backgroundColor: 'black', // Main background color
    color: '#8fce00',          // Main text color
    fontFamily: 'Arial, sans-serif', // Font family
    minHeight: '100vh',       // Full height view
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#8fce00', // Button background color
    color: 'black',            // Button text color
    border: 'none',
    padding: '10px 20px',
    fontSize: '1em',
    fontWeight: 'bold',
    cursor: 'pointer',
    margin: '10px',
    borderRadius: '5px',
    // Disable button style
    ':disabled': {
      backgroundColor: 'grey',
      cursor: 'not-allowed',
    },
  },
  answer: {
    backgroundColor: '#c9f26c',
    color: 'black',
    fontSize: '1em',
    fontWeight: 'bold',
    border: '1px solid #8fce00',    // Green border
    borderRadius: '5px',
    padding: '20px',
    marginTop: '20px',
  }
};


// Define image, embedding and model paths
const IMAGE_PATH = "/assets/data/naulakko.jpg"
const IMAGE_EMBEDDING = "/assets/data/naulakko.npy"
const MODEL_DIR = "/model/sam_onnx_quantized_example.onnx"

const App = () => {
  const [answer, setAnswer] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState("") // New state for the image

  const handleImageChange = e => {
    setSelectedImage(e.target.files[0])
  }

  const handleAskBard = async () => {
    setIsLoading(true)

    const formData = new FormData()
    formData.append("image", selectedImage) // Append the image to the FormData object
    formData.append(
      "question",
      "Find me products similiar to this from zalando and return the answer in JSON format."
    ) // Append other data you want to send

    try {
      const response = await axios.post(
        "http://localhost:3001/ask-bard",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data" // Important header for files
          }
        }
      )
      setAnswer(response.data.answer)
    } catch (error) {
      console.error("Error fetching response from Bard:", error)
    }

    setIsLoading(false)
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
    const url = new URL(IMAGE_PATH, location.origin)
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
    <div style={styles.container}>
      <input type="file" onChange={handleImageChange} disabled={isLoading} />
      <button
        onClick={handleAskBard}
        // Disable button if loading or no image is selected
        //style={isLoading}
        disabled={isLoading || !selectedImage}
        style={isLoading ? { ...styles.button, ...styles.button[':disabled'] } : styles.button}
      >
        {isLoading ? "Loading..." : "Ask Bard"}
      </button>
      <div style={styles.answer}>Answer from Bard: {answer}</div>
      <Stage />
    </div>
  )
}

export default App
