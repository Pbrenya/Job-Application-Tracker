const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { check, validationResult } = require('express-validator');
const noteRepository = require('../repositories/notes.repository');
const logger = require('../logger');

// @route    GET api/applications/:appId/notes
// @desc     Get all notes for an application
// @access   Private
router.get('/applications/:appId/notes', auth, async (req, res, next) => {
    try {
        const notes = await noteRepository.findAllByApplicationId(req.params.appId, req.user.id);
        res.json(notes);
    } catch (err) {
        logger.error(err.message);
        next(err);
    }
});

// @route    POST api/applications/:appId/notes
// @desc     Add new note to an application
// @access   Private
router.post('/applications/:appId/notes', [auth, [
    check('note', 'Note content is required').not().isEmpty(),
]], async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { note } = req.body;
    const { appId } = req.params;
    const { id: userId } = req.user;

    try {
        const newNote = await noteRepository.create(appId, userId, note);
        if (!newNote) {
            return res.status(404).json({ msg: 'Application not found' });
        }
        res.status(201).json(newNote);
    } catch (err) {
        logger.error(err.message);
        next(err);
    }
});

// @route    PATCH api/notes/:noteId
// @desc     Update a note
// @access   Private
router.patch('/notes/:noteId', [auth, [
    check('note', 'Note content is required').not().isEmpty(),
]], async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { note } = req.body;
    const { noteId } = req.params;
    const { id: userId } = req.user;

    try {
        const updatedNote = await noteRepository.update(noteId, userId, note);
        if (!updatedNote) {
            return res.status(404).json({ msg: 'Note not found or access denied' });
        }
        res.json(updatedNote);
    } catch (err) {
        logger.error(err.message);
        next(err);
    }
});

// @route    DELETE api/notes/:noteId
// @desc     Soft delete a note
// @access   Private
router.delete('/notes/:noteId', auth, async (req, res, next) => {
    const { noteId } = req.params;
    const { id: userId } = req.user;

    try {
        const rowsAffected = await noteRepository.softDelete(noteId, userId);
        if (rowsAffected === 0) {
            return res.status(404).json({ msg: 'Note not found or access denied' });
        }
        res.json({ msg: 'Note deleted' });
    } catch (err) {
        logger.error(err.message);
        next(err);
    }
});


module.exports = router;
