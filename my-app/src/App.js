import React, { useState } from 'react';
import axios from 'axios';

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
      setAnswer(response.data.answer);
    } catch (error) {
      console.error('Error fetching response from Bard:', error);
    }

    setIsLoading(false);
  };

  return (
    <div style={styles.container}>
      <input 
        type="file" 
        onChange={handleImageChange} 
        disabled={isLoading} 
      />
      <button 
        onClick={handleAskBard} 
        disabled={isLoading || !selectedImage} // Disable button if loading or no image is selected
        style={isLoading ? { ...styles.button, ...styles.button[':disabled'] } : styles.button}
      >
        {isLoading ? 'Loading...' : 'Ask Bard'}
      </button>
      <div style={styles.answer}>Answer from Bard: {answer}</div>
    </div>
  );
};

export default App;