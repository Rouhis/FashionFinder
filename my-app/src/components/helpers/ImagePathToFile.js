async function imagePathToFile(imagePath, fileName) {
    try {
      // Fetch the image from the given path
      const response = await fetch(imagePath);
  
      // Check if the request was successful
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  
      // Get the blob from the response
      const blob = await response.blob();
  
      // Create a file from the blob
      const file = new File([blob], fileName, {
        type: blob.type,
      });
  
      return file;
    } catch (error) {
      console.error(error);
    }
  }

  export default imagePathToFile
