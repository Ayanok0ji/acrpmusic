const express = require('express');
const multer  = require('multer');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB setup
mongoose.connect('mongodb://localhost/mp3hosting', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Schema setup
const musicSchema = new mongoose.Schema({
  filename: String,
  path: String
});
const Music = mongoose.model('Music', musicSchema);

// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
});
const upload = multer({ storage: storage });

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.post('/upload', upload.single('music'), (req, res) => {
  const music = new Music({
    filename: req.file.originalname,
    path: req.file.path
  });
  music.save((err) => {
    if (err) return console.error(err);
    res.redirect('/');
  });
});

app.get('/music', async (req, res) => {
  try {
    const musicList = await Music.find();
    res.json(musicList);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
