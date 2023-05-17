const express = require('express');
const router = express.Router();
const path = require('path');

/* 
    PAGE ROUTES 
*/
router.get('/search-by-location', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'search-by-location.html'));
});

router.get('/search-by-type-location', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'search-by-type-location.html'));
});

router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

module.exports = router