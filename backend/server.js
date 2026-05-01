const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const PORT = process.env.PORT || 5000;

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));

// Basic route for testing
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

console.log('LOOPIT_BACKEND_READY');
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
