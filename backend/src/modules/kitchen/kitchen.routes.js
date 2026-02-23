const express = require('express');
const router = express.Router();

router.get('/orders', (req, res) => {
  res.json({ success: true, message: 'Get kitchen orders' });
});

module.exports = router;