const express = require('express');
const { registerForEvent, getUserRegistrations, getEventAttendees } = require('../controllers/registrationController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// All routes require auth
router.use(authMiddleware);

router.post('/', registerForEvent);
router.get('/my-registrations', getUserRegistrations);
router.get('/event/:eventId/attendees', getEventAttendees);

module.exports = router;
