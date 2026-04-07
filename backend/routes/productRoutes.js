const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  deleteProduct,
  getUserProducts,
} = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', protect, createProduct);
router.post('/upload', protect, upload.single('image'), (req, res) => {
  if (req.file) {
    res.json({ imageUrl: req.file.path });
  } else {
    res.status(400).json({ message: 'No file uploaded' });
  }
});
router.delete('/:id', protect, deleteProduct);
router.get('/user/all', protect, getUserProducts);

module.exports = router;
