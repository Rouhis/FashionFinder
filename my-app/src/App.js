
import './App.css';
import * as React from 'react';
import Button from '@mui/joy/Button';
import { Box } from '@mui/system';
import LoadPic from './load_pic.png'
import PreviewPic from './preview_pic.png'
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import Typography from '@mui/joy/Typography';
import testjacket from './jacket.png';


function App() {
  const ClickHandeler = () =>{
    alert("Button clicked")
  }

  return (
    <div className="App"> 
      <h1 className="title">AI Product Finder</h1>
      <div className="Boxes">
        <div className="Left">
          <Box className="LoadImageBox">
            <div className="HeaderBox">
              <h5 className="BoxTitle">Load Image</h5>
            </div>
            <img src={LoadPic} alt="Logo"></img>
          </Box>
          <div className="ConfirmButtonBox">
            <Button color="neutral" className="ConfirmButton" variant="solid">Confirm Selection</Button>
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
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Faucibus interdum posuere lorem ipsum dolor sit amet consectetur adipiscing. In tellus integer feugiat scelerisque varius morbi enim. Et magnis dis parturient montes nascetur ridiculus. In nibh mauris cursus mattis molestie a iaculis. Condimentum mattis pellentesque id nibh tortor. Adipiscing tristique risus nec feugiat in fermentum posuere. Vitae turpis massa sed elementum tempus. A diam sollicitudin tempor id eu nisl nunc. Phasellus vestibulum lorem sed risus. Ipsum dolor sit amet consectetur. Dui id ornare arcu odio ut sem nulla pharetra diam. Ipsum dolor sit amet consectetur adipiscing elit pellentesque habitant morbi. Lacus sed turpis tincidunt id aliquet risus. Blandit aliquam etiam erat velit scelerisque in dictum non consectetur. Donec pretium vulputate sapien nec sagittis aliquam malesuada. Vulputate eu scelerisque felis imperdiet proin fermentum leo vel orci. Nibh venenatis cras sed felis eget velit aliquet sagittis id. Ipsum dolor sit amet consectetur adipiscing elit pellentesque habitant morbi. Lorem donec massa sapien faucibus et molestie.
                Lectus magna fringilla urna porttitor. Orci ac auctor augue mauris augue neque gravida in fermentum. Vivamus arcu felis bibendum ut tristique. Donec et odio pellentesque diam volutpat commodo sed egestas. Urna condimentum mattis pellentesque id nibh. Platea dictumst quisque sagittis purus. Nibh nisl condimentum id venenatis. Senectus et netus et malesuada fames ac turpis egestas. Porta nibh venenatis cras sed. Dignissim sodales ut eu sem integer vitae. Posuere ac ut consequat semper viverra nam libero justo. Vestibulum rhoncus est pellentesque elit. Diam vel quam elementum pulvinar etiam. Odio pellentesque diam volutpat commodo sed egestas egestas. Tristique senectus et netus et malesuada fames ac turpis. Purus ut faucibus pulvinar elementum integer enim neque volutpat ac
                Lectus magna fringilla urna porttitor. Orci ac auctor augue mauris augue neque gravida in fermentum. Vivamus arcu felis bibendum ut tristique. Donec et odio pellentesque diam volutpat commodo sed egestas. Urna condimentum mattis pellentesque id nibh. Platea dictumst quisque sagittis purus. Nibh nisl condimentum id venenatis. Senectus et netus et malesuada fames ac turpis egestas. Porta nibh venenatis cras sed. Dignissim sodales ut eu sem integer vitae. Posuere ac ut consequat semper viverra nam libero justo. Vestibulum rhoncus e
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
