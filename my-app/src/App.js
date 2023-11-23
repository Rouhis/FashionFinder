import "./App.css";
import React, { useCallback, useState } from "react";
import { Box } from "@mui/system";
import PreviewPic from "./preview_pic.png";
import axios from "axios";
import ListForProducts from "./List";
import { useContext, useEffect } from "react";
import {SelectBoxMaterial, SelectBoxColor} from "./SelectBox";
import Slider from "@mui/material/Slider";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";



const App = () => {
  const [cleanedAnswer, setcleanedAnswer] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null); // New state for the image
  const [price, setPrice] = useState(1000);
  //const { color, material } = require('./SelectBox');
  const [color, setColor] = useState("");
  const [material, setMaterial] = useState("");






  const handleSliderChange = (event, newPrice) => {
    setPrice(newPrice);
    console.log("Väri ja materiaali apppjksjsjssjsjsj", material, color, newPrice)
  };

  const handleImageChange = (e) => {
    setSelectedImage(e.target.files[0]);
  };
/////////////////////////////NÄMÄ OMAAN TIEDOSTOON KIIIIIIIIIIIIITOS/////////////////////////////////////////////////
const handleSelectBoxChangeBrand = (event) => {
  setColor(event.target.value);
  console.log(event.target.value)
};

const handleSelectBoxChangeMaterial = (event) => {
  setMaterial(event.target.value);
  console.log(event.target.value)
};


const SelectBoxMaterial = ({name}) => {


return(
<FormControl sx={{ m: 1, minWidth: 120 }} size="small">
<InputLabel id="select-small-label">{name}</InputLabel>
<Select labelId="select-small-label" id="select-small" label={name} defaultValue={material} onChange={handleSelectBoxChangeMaterial}>
  <MenuItem value="">
  <em>None</em>
  </MenuItem>
  <MenuItem value={"Leather"}>Leather</MenuItem>
  <MenuItem value={"Wool"}>Wool</MenuItem>
  <MenuItem value={"Polyester"}>Polyester</MenuItem>
</Select>
</FormControl>
);
};


const SelectBoxColor = ({name}) => {


return(
<FormControl sx={{ m: 1, minWidth: 120 }} size="small">
<InputLabel id="select-small-label">{name}</InputLabel>
<Select labelId="select-small-label" id="select-small" label={name} defaultValue={color} onChange={handleSelectBoxChangeBrand}>
  <MenuItem value="">
  <em>None</em>
  </MenuItem>
  <MenuItem value={"Black"}>Black</MenuItem>
  <MenuItem value={"White"}>White</MenuItem>
  <MenuItem value={"Red"}>Red</MenuItem>
  <MenuItem value={"Yellow"}>Yellow</MenuItem>
  <MenuItem value={"Blue"}>Blue</MenuItem>
</Select>
</FormControl>
);
};
//////////////////////////////////////////////////////////////////////////////
  
    const handleAskBard = async () => {
      setIsLoading(true);
      console.log("material :", SelectBoxMaterial.material);
  
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
    return `${value}`;
  }

  function printvalue() {
    valuetext();
    document.getElementById("PriceRange").value = "76";
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
                defaultValue={1000}
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
          <ListForProducts mediaArray={cleanedAnswer} material={material} color={color} price={price} />
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
