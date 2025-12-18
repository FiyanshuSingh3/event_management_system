const express = require('express');
const { createEvent, getEvents, getEventById, deleteEvent } = require('../controllers/eventController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Public Routes
router.get('/', getEvents);
router.get('/:id', getEventById);

// Protected Routes
router.post('/', authMiddleware, createEvent);
router.delete('/:id', authMiddleware, deleteEvent);

module.exports = router;
