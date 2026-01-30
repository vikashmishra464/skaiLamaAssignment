const express = require('express');
const router = express.Router();
const {
    createEvent,
    getUserEvents,
    updateEvent,
    getEventLogs,
    getAllEvents
} = require('../controllers/eventController');
router.get('/', getAllEvents);
router.post('/', createEvent);
router.get('/user/:userId', getUserEvents);
router.put('/:eventId', updateEvent);
router.get('/:eventId/logs', getEventLogs);
module.exports = router;