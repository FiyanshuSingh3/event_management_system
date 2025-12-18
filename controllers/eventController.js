const db = require('../db');

// Create Event
exports.createEvent = async (req, res) => {
    const { title, description, date, location, price } = req.body;
    const organizer_id = req.user.id;

    if (!title || !date || !location) {
        return res.status(400).json({ message: 'Please provide title, date, and location' });
    }

    try {
        const [result] = await db.query(
            'INSERT INTO events (organizer_id, title, description, date, location, price) VALUES (?, ?, ?, ?, ?, ?)',
            [organizer_id, title, description, date, location, price || 0.00]
        );
        res.status(201).json({ message: 'Event created', eventId: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get All Events (with Search and Filters)
exports.getEvents = async (req, res) => {
    const { search, location, category } = req.query;
    let query = 'SELECT * FROM events WHERE 1=1';
    const params = [];

    if (search) {
        query += ' AND (title LIKE ? OR description LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
    }

    if (location) {
        query += ' AND location LIKE ?';
        params.push(`%${location}%`);
    }

    // Sort by Date Descending
    query += ' ORDER BY date ASC';

    try {
        const [events] = await db.query(query, params);
        res.json(events);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get Single Event
exports.getEventById = async (req, res) => {
    try {
        const [events] = await db.query('SELECT events.*, users.username as organizer FROM events JOIN users ON events.organizer_id = users.id WHERE events.id = ?', [req.params.id]);

        if (events.length === 0) {
            return res.status(404).json({ message: 'Event not found' });
        }

        res.json(events[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete Event (Organizer only - Optional but good for management)
exports.deleteEvent = async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM events WHERE id = ? AND organizer_id = ?', [req.params.id, req.user.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Event not found or unauthorized' });
        }

        res.json({ message: 'Event deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
