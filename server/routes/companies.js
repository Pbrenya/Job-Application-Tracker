const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// @route    GET api/companies
// @desc     Get all companies for a user
// @access   Private
router.get('/', auth, (req, res) => {
    res.send('Get all companies');
});

// @route    POST api/companies
// @desc     Add new company
// @access   Private
router.post('/', auth, (req, res) => {
    res.send('Add new company');
});

module.exports = router;
