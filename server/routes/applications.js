const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { check, validationResult } = require('express-validator');
const applicationRepository = require('../repositories/applications.repository');
const logger = require('../logger');

// @route    GET api/applications
// @desc     Get all applications for a user
// @access   Private
router.get('/', auth, async (req, res, next) => {
    try {
        const applications = await applicationRepository.findAllByUserId(req.user.id);
        res.json(applications);
    } catch (err) {
        logger.error(err.message);
        next(err);
    }
});

// @route    POST api/applications
// @desc     Add new application
// @access   Private
router.post('/', [auth, [
    check('company_id', 'Company is required').not().isEmpty(),
    check('job_title', 'Job title is required').not().isEmpty(),
    check('stage_id', 'Stage is required').not().isEmpty(),
]], async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const newApplication = await applicationRepository.create({ ...req.body, user_id: req.user.id });
        res.json(newApplication);
    } catch (err) {
        logger.error(err.message);
        next(err);
    }
});

// @route    GET api/applications/:id
// @desc     Get single application
// @access   Private
router.get('/:id', auth, async (req, res, next) => {
    try {
        const application = await applicationRepository.findById(req.params.id, req.user.id);
        
        if (!application) {
            return res.status(404).json({ msg: 'Application not found' });
        }
        
        res.json(application);
    } catch (err) {
        logger.error(err.message);
        next(err);
    }
});

// @route    PATCH api/applications/:id
// @desc     Update application
// @access   Private
router.patch('/:id', auth, async (req, res, next) => {
    try {
        const updatedApplication = await applicationRepository.update(req.params.id, req.user.id, req.body);

        if (!updatedApplication) {
            return res.status(404).json({ msg: 'Application not found' });
        }

        res.json(updatedApplication);
    } catch (err) {
        logger.error(err.message);
        next(err);
    }
});

// @route    DELETE api/applications/:id
// @desc     Soft delete application
// @access   Private
router.delete('/:id', auth, async (req, res, next) => {
    try {
        const rowsAffected = await applicationRepository.softDelete(req.params.id, req.user.id);

        if (rowsAffected === 0) {
            return res.status(404).json({ msg: 'Application not found' });
        }

        res.json({ msg: 'Application deleted' });
    } catch (err) {
        logger.error(err.message);
        next(err);
    }
});

module.exports = router;
