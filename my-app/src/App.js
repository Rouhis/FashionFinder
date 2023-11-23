import './App.css';
import React, {useState} from 'react';
import { Box } from '@mui/system';
import PreviewPic from './preview_pic.png'
import axios from 'axios';
import ListForProducts from './List';
import {useContext, useEffect} from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';



const App = () => {

    const [cleanedAnswer, setcleanedAnswer] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null); // New state for the image
    const [material, setMaterial] = useState("");
    const [color, setColor] = useState("");
    
    const [anchorEl2, setAnchorEl2] = React.useState(null);
    const open2 = Boolean(anchorEl2);

    const handleClick2 = (event) => {
      setAnchorEl2(event.currentTarget);
    };
    const handleClose2 = () => {
      setAnchorEl2(null);
    };


    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);

    const handleClick = (event) => {
      setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
      setAnchorEl(null);
    };



    const setMaterialValue = (value) => {
  setMaterial(value);
};

const setColorValue = (value) => {
  setColor(value);
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
            'Content-Type': 'multipart/form-data', // Important header for files
          },
        });
        setcleanedAnswer(response.data.parsedAnswer);
       } catch (error) {
        console.error('Error fetching response from Bard:', error);
      }
  
      setIsLoading(false);
    };

///////////////////////// Ladattu kuva näkyviin////////////////////////////
//    <img src={ URL.createObjectURL(selectedImage)} alt="Logo"></img>



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
        </Box>
          <div className="ConfirmButtonBox">
            <button className="ConfirmButton" variant="solid" onClick={handleAskBard} disabled={isLoading || !selectedImage}>Confirm Selection</button>
          </div>
          <Box className="PreviewBox">
        <div className="HeaderBox">
              <h5 className="BoxTitle">Preview</h5>
            </div>
              <img src={PreviewPic} alt="Logo"></img>
          </Box>
        </div>
        <div className="Middle">
          <Box className="InfoBox">
            <div className="HeaderBox">
              <h5 className="BoxTitle">Similar Products Information</h5>
            </div>
            <input type="text" placeholder="Enter material" onChange={(e) => setMaterial(e.target.value)} />
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
            <button className="ConfirmButton" variant="solid">Find Similar Products</button>
        </div>

    <div>
      <Button
        id="basic-button"
        aria-controls={open ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
      >
        Dashboard
      </Button>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        <MenuItem onClick={handleClose}>Profile</MenuItem>
        <MenuItem onClick={handleClose}>My account</MenuItem>
        <MenuItem onClick={handleClose}>Logout</MenuItem>
      </Menu>
    </div>

    <div>
      <Button
        id="basic-button"
        aria-controls={open2 ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open2 ? 'true' : undefined}
        onClick={handleClick2}
      >
        color
      </Button>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl2}
        open={open2}
        onClose={handleClose2}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        <MenuItem onClick={() => setColor("brown")}>brown</MenuItem>
        <MenuItem onClick={() => setColor("yellow")}>yellow</MenuItem>
        <MenuItem onClick={() => setColor("blue")}>blue</MenuItem>
      </Menu>
    </div>
    </div>
  );
  
}




export default App;
