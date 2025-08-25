const express = require('express');
const router = express.Router();

// --- Simple Test Route ---
// This route will listen for POST requests at /api/test/
router.post('/', (req, res) => {
  // Log the received data to your server's terminal
  console.log('--- TEST ROUTE HIT ---');
  console.log('Data received in req.body:', req.body);

  // Check if any data was received
  if (req.body && Object.keys(req.body).length > 0) {
    // If data was received, send it back as a success response
    res.status(200).json({
      message: 'Success! Data received by the server.',
      yourData: req.body
    });
  } else {
    // If no data was received, send an error message
    res.status(400).json({
      message: 'Error: No data was received in the request body.'
    });
  }
});

module.exports = router;
