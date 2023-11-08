
import './App.css';
import React, {useState} from 'react';
import Button from '@mui/joy/Button';
import { Box } from '@mui/system';
import LoadPic from './load_pic.png'
import PreviewPic from './preview_pic.png'
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import Typography from '@mui/joy/Typography';
import testjacket from './jacket.png';
import axios from 'axios';


const App = () => {
    const [answer, setAnswer] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null); // New state for the image
  
    const handleImageChange = (e) => {
      setSelectedImage(e.target.files[0]);
    };
  
    const handleAskBard = async () => {
      setIsLoading(true);
  
      const formData = new FormData();
      formData.append('image', selectedImage); // Append the image to the FormData object
      formData.append('question', 'Find me products similiar to this from zalando and return the answer in JSON format.'); // Append other data you want to send
  
      try {
        const response = await axios.post('http://localhost:3001/ask-bard', formData, {
          headers: {
            'Content-Type': 'multipart/form-data', // Important header for files
          },
        });
        setAnswer(response.data.newAnswer);
       } catch (error) {
        console.error('Error fetching response from Bard:', error);
      }
  
      setIsLoading(false);
    };

  return (
    <div className="App"> 
      <h1 className="title">AI Product Finder</h1>
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
                {answer}
              </p>
            </Box>
        </div>
        <div className="Right">
      <Box className="InfoBox">
        <div className="HeaderBox">
          <h5 className="BoxTitle">Similar Products Images</h5>
        </div>
        <div className="Card">
            <Card orientation="horizontal" className="CardInfo" variant="solid">
              <img src={testjacket} alt="Logo"></img>
              <div>
                  <CardContent>
                    <Typography level="title-md" textColor="inherit">
                        Solid card
                    </Typography>
                    <Typography textColor="inherit">Description of the card.</Typography>
                  </CardContent>
                  </div>
            </Card>
        </div>
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
