const express = require('express');
const app = express();
const port = 3001;
const cors = require('cors');
const multer = require('multer'); // Import multer

app.use(cors());

// Set up multer for file storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(express.json());

const bardCookie = 'dAgtJcyNzLShOncG4764BTL-a3oKE955sXC6MLc7jcc1lF6tzU1CX4cPlvyZn-ACS2JDKA.'; // Replace with your actual Bard AI cookie securely

app.post('/ask-bard', upload.single('image'), async (req, res) => {
    const { question } = req.body;
    const image = req.file.buffer; // The image file will be available here
    // You can now use the image buffer and question to interact with your Bard AI or any other service
    try {
        // For example, if your Bard AI can process images:
         const Bard = (await import('bard-ai')).default;
         const myBard = new Bard(bardCookie);
         const answer = await myBard.ask(question, {image: image.buffer});
         const new1Answer = answer.split('```json').join("")
         const cleanedAnswer = new1Answer.split('```').join("")
         console.log(cleanedAnswer)
         const parsedAnswer = JSON.parse(cleanedAnswer)
         const imageUrl = parsedAnswer.products[0].imageUrl;
        res.json({ cleanedAnswer,imageUrl });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
