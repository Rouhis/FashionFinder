import './App.css';
import React, {useState} from 'react';
import Button from '@mui/joy/Button';
import { Box } from '@mui/system';
import PreviewPic from './preview_pic.png'
import axios from 'axios';
import ListForProducts from './List';
import {useContext, useEffect} from 'react';


const App = () => {

    const [cleanedAnswer, setcleanedAnswer] = useState([]);
    const [imageUrl, setImageUrl] = useState('');
    const [name, setImagename] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null); // New state for the image

    const handleImageChange = (e) => {
      setSelectedImage(e.target.files[0]);
    };


    useEffect(() => {
      console.log('Cleaned Answer :', cleanedAnswer);
      console.log("setted image state: ", selectedImage)
    }, [cleanedAnswer,selectedImage]); // The second parameter is an array of dependencies, in this case, only cleanedAnswer
  
  
    const handleAskBard = async () => {
      setIsLoading(true);
  
      const formData = new FormData();
      formData.append('image', selectedImage); // Append the image to the FormData object
      formData.append('question', "Find me products similiar to this from zalando and return answer in ```json{products: [{id: number start from 0 ,name: product name ,brand:brand name no sex included ,price:price, urlpage: start with (en.zalando.de/men or women/?q=product name) then add product name add + in every space in product name ),etc.]}```");
  
      try {
        const response = await axios.post('http://localhost:3001/ask-bard', formData, {
          headers: {
            'Content-Type': 'multipart/form-data', // Important header for files
          },
        });
        setcleanedAnswer(response.data.parsedAnswer);
        setImageUrl(response.data.imageUrl);
        setImagename(response.data.name)
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
            <Button color="neutral" className="ConfirmButton" variant="solid" onClick={handleAskBard} disabled={isLoading || !selectedImage}>Confirm Selection</Button>
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
            <Button color="neutral" className="ConfirmButton" variant="solid">Find Similar Products</Button>
        </div>
    </div>
  );
  
}




export default App;
