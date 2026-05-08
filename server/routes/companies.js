const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { check, validationResult } = require('express-validator');
const companyRepository = require('../repositories/companies.repository');
const logger = require('../logger');

// @route    GET api/companies
// @desc     Get all companies for a user
// @access   Private
router.get('/', auth, async (req, res, next) => {
    try {
        const companies = await companyRepository.findAllByUserId(req.user.id);
        res.json(companies);
    } catch (err) {
        logger.error(err.message);
        next(err);
    }
});

// @route    POST api/companies
// @desc     Add new company
// @access   Private
router.post('/', [auth, [
    check('name', 'Company name is required').not().isEmpty(),
    check('website', 'Please provide a valid URL for the website').optional().isURL(),
]], async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const newCompany = await companyRepository.create({ ...req.body, user_id: req.user.id });
        res.status(201).json(newCompany);
    } catch (err) {
        logger.error(err.message);
        next(err);
    }
});

// @route    GET api/companies/:id
// @desc     Get single company
// @access   Private
router.get('/:id', auth, async (req, res, next) => {
    try {
        const company = await companyRepository.findById(req.params.id, req.user.id);
        
        if (!company) {
            return res.status(404).json({ msg: 'Company not found' });
        }
        
        res.json(company);
    } catch (err) {
        logger.error(err.message);
        next(err);
    }
});

// @route    PATCH api/companies/:id
// @desc     Update company
// @access   Private
router.patch('/:id', [auth, [
    check('website', 'Please provide a valid URL for the website').optional().isURL(),
]], async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const updatedCompany = await companyRepository.update(req.params.id, req.user.id, req.body);

        if (!updatedCompany) {
            return res.status(404).json({ msg: 'Company not found' });
        }

        res.json(updatedCompany);
    } catch (err) {
        logger.error(err.message);
        next(err);
    }
});

// @route    DELETE api/companies/:id
// @desc     Soft delete company
// @access   Private
router.delete('/:id', auth, async (req, res, next) => {
    try {
        const rowsAffected = await companyRepository.softDelete(req.params.id, req.user.id);

        if (rowsAffected === 0) {
            return res.status(404).json({ msg: 'Company not found' });
        }

        res.json({ msg: 'Company deleted' });
    } catch (err) {
        logger.error(err.message);
        next(err);
    }
});

module.exports = router;
