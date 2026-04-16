const express = require('express');
const router = express.Router();

router.post('/customer/register', (req, res) => {
    // Handle user signup logic here
    res.status(201).json({ message: 'User signed up successfully' });
});
module.exports = router;