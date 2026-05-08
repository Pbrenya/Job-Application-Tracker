const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { poolPromise, sql } = require('../db');

// @route    GET api/applications/:id/notes
// @desc     Get all notes for an application
// @access   Private
router.get('/applications/:id/notes', auth, async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('application_id', sql.UniqueIdentifier, req.params.id)
            .input('user_id', sql.UniqueIdentifier, req.user.id)
            .query(`SELECT n.* FROM notes n
                    JOIN applications a ON n.application_id = a.id
                    WHERE n.application_id = @application_id AND a.user_id = @user_id`);
        res.json(result.recordset);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route    POST api/applications/:id/notes
// @desc     Add new note to an application
// @access   Private
router.post('/applications/:id/notes', auth, async (req, res) => {
    const { note } = req.body;
    try {
        const pool = await poolPromise;
        // Verify the application belongs to the user
        const appResult = await pool.request()
            .input('application_id', sql.UniqueIdentifier, req.params.id)
            .input('user_id', sql.UniqueIdentifier, req.user.id)
            .query('SELECT id FROM applications WHERE id = @application_id AND user_id = @user_id');

        if (appResult.recordset.length === 0) {
            return res.status(404).json({ msg: 'Application not found' });
        }

        const result = await pool.request()
            .input('application_id', sql.UniqueIdentifier, req.params.id)
            .input('note', sql.NVarChar, note)
            .query(`INSERT INTO notes (application_id, note) 
                    OUTPUT INSERTED.*
                    VALUES (@application_id, @note)`);
        res.json(result.recordset[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
