const db = require('../db');

// Register for an Event
exports.registerForEvent = async (req, res) => {
    const { eventId, ticketType } = req.body;
    const userId = req.user.id;

    if (!eventId) {
        return res.status(400).json({ message: 'Event ID is required' });
    }

    try {
        // Check if event exists
        const [events] = await db.query('SELECT * FROM events WHERE id = ?', [eventId]);
        if (events.length === 0) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Check if already registered
        const [existing] = await db.query('SELECT * FROM registrations WHERE event_id = ? AND user_id = ?', [eventId, userId]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'You are already registered for this event' });
        }

        // Create Registration (Mocking Payment as 'paid')
        await db.query(
            'INSERT INTO registrations (event_id, user_id, ticket_type, status, payment_status) VALUES (?, ?, ?, ?, ?)',
            [eventId, userId, ticketType || 'General', 'confirmed', 'paid']
        );

        res.status(201).json({ message: 'Registration successful', status: 'confirmed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get User's Registrations
exports.getUserRegistrations = async (req, res) => {
    const userId = req.user.id;

    try {
        const query = `
            SELECT r.*, e.title, e.date, e.location 
            FROM registrations r 
            JOIN events e ON r.event_id = e.id 
            WHERE r.user_id = ?
            ORDER BY r.registration_date DESC
        `;
        const [registrations] = await db.query(query, [userId]);
        res.json(registrations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get Event Attendees (Organizer Only)
exports.getEventAttendees = async (req, res) => {
    const { eventId } = req.params;
    const userId = req.user.id; // Requester

    try {
        // Verify Organizer
        const [events] = await db.query('SELECT organizer_id FROM events WHERE id = ?', [eventId]);
        if (events.length === 0) return res.status(404).json({ message: 'Event not found' });

        if (events[0].organizer_id !== userId) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const query = `
            SELECT r.*, u.username, u.email 
            FROM registrations r 
            JOIN users u ON r.user_id = u.id 
            WHERE r.event_id = ?
        `;
        const [attendees] = await db.query(query, [eventId]);
        res.json(attendees);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
