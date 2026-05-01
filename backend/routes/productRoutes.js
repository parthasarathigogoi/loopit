const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');

router.post('/upload', upload.single('image'), (req, res) => {
  if (req.file) {
    const imageUrl = req.file.path?.startsWith('http')
      ? req.file.path
      : `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    res.json({ imageUrl, url: imageUrl });
  } else {
    res.status(400).json({ message: 'No file uploaded' });
  }
});

module.exports = router;
