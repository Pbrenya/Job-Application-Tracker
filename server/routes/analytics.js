const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const analyticsRepository = require('../repositories/analytics.repository');
const logger = require('../logger');

// @route    GET api/analytics
// @desc     Get application analytics for a user
// @access   Private
router.get('/', auth, async (req, res, next) => {
    try {
        const stats = await analyticsRepository.getStats(req.user.id);
        res.json(stats);
    } catch (err) {
        logger.error(err.message);
        next(err);
    }
});

module.exports = router;
