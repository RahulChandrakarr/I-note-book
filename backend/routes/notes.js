const express = require('express');
const router = express.Router();
const fetchuser = require('../middlewere/fetchuser');
const Notes = require('../models/Notes');
const { body, validationResult } = require('express-validator');

// **get all the notes route notes get method
router.get('/fetchallnotes', fetchuser, async (req, res) => {
    try {
        const notes = await Notes.find({ user: req.user.id });
        res.json(notes);
    } catch (error) {
        console.error(error);
        return res.status(400).json({ errors: error, message: 'Validation failed' });
    }
});

// add a new notes using a post request
router.post('/addnote', fetchuser, [
    body('title', 'Enter a valid title').isLength({ min: 3 }),
    body('description', 'Description must be at least 5 characters').isLength({ min: 5 }),
],
    async (req, res) => {
        try {
            const { title, description, tag } = req.body;
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array(), message: 'Validation failed' });
            }
            const note = new Notes({
                title, description, tag, user: req.user.id
            });
            const saveNote = await note.save();
            res.json(saveNote);
        } catch (error) {
            console.error(error);
            return res.status(400).json({ errors: error, message: 'Validation failed' });
        }
    });

//  update privious notes 
router.delete('/deletenote/:id', fetchuser, async (req, res) => {
    try {
        // Find the note to be deleted
        const note = await Notes.findOneAndDelete({ _id: req.params.id });
        if (!note) {
            return res.status(404).send("Note Not Found");
        }

        // Check if the user owns the note
        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed to Delete Note");
        }

        res.json({ msg: "Note Deleted Successfully" });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

module.exports = router;




