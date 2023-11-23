import "./App.css";
import React, { useState } from "react";
import { Box } from "@mui/system";
import PreviewPic from "./preview_pic.png";
import axios from "axios";
import ListForProducts from "./List";
import { useContext, useEffect } from "react";
import {SelectBoxMaterial, SelectBoxColor} from "./SelectBox";
import Slider from "@mui/material/Slider";


const App = () => {
  const [cleanedAnswer, setcleanedAnswer] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null); // New state for the image
  const [price, setPrice] = useState(0);
  const [material, setMaterial] = useState("");
  const [color, setColor] = useState("");

  const handleSliderChange = (event, newPrice) => {
    setPrice(newPrice);
  };


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
      console.log("material :", material);
  
      const formData = new FormData();
      formData.append('image', selectedImage); // Append the image to the FormData object
      formData.append('question', "Find me products similiar to this from zalando and return answer in ```json{products: [{id: number start from 0 ,name: product name without color and sex,brand:brand name no sex included ,price:price, specialName: product name with + symbol in every space no sex included, sex: (product sex men or women with lower case)etc.]}``` dont add anything after json");
  
      try {
        const response = await axios.post('http://localhost:3001/ask-bard', formData, {
          headers: {
            "Content-Type": "multipart/form-data", // Important header for files
          },
        }
      );
      setcleanedAnswer(response.data.parsedAnswer);
    } catch (error) {
      console.error("Error fetching response from Bard:", error);
    }

    setIsLoading(false);
  };

  function valuetext(value) {
    return `${value}°C`;
  }

  function printvalue() {
    valuetext();
    document.getElementById("PriceRange").value = "76";
    console.log("perse");
  }

  ///////////////////////// Ladattu kuva näkyviin////////////////////////////
  //    <img src={ URL.createObjectURL(selectedImage)} alt="Logo"></img>

  return (
    <div className="App">
      <h1 className="title">Fashion Finder</h1>
      <div className="Boxes">
        <div className="Left">
          <div className="HeaderBox">
            <h5 className="BoxTitle">Upload image of the desired clothing</h5>
          </div>
          <Box className="LoadImageBox">
            <input
              type="file"
              onChange={handleImageChange}
              disabled={isLoading}
            />
          </Box>
          <div className="ConfirmButtonBox">
            <button
              className="ConfirmButton"
              variant="solid"
              onClick={handleAskBard}
              disabled={isLoading || !selectedImage}
            >
              Confirm Selection
            </button>
          </div>
        </div>
        <div className="Middle">
          <div className="HeaderBox">
            <h5 className="BoxTitle">Selected Clothing</h5>
          </div>
          <div className="OptionBox">
            <SelectBoxMaterial name={"Material"} ></SelectBoxMaterial>
            <SelectBoxColor name={"Color"} id="ColorBox"></SelectBoxColor>
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
            <p className="InfoText"></p>
          </Box>
        </div>
        <div className="Right">
          <div className="HeaderBox">
            <h5 className="BoxTitle">Similar Products Images</h5>
          </div>
          <Box className="InfoBox">
          <ListForProducts mediaArray={cleanedAnswer} material={material} color={color} />
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
        <button className="ConfirmButton" variant="solid" onClick={printvalue}>
          Find Similar Products
        </button>
      </div>
      </div>
      
  );
};

export default App;
