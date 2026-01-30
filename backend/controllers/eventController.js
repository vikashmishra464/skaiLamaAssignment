const Event = require('../models/eventModel');
const EventLog = require('../models/eventLogModel');
const User = require('../models/userModel');
const { 
    convertToUTC, 
    convertFromUTC, 
    formatDateForUser,
    isValidTimezone 
} = require('../utils/timezoneUtils');

const createEvent = async (req, res) => {
    try {
        const {
            assignedProfiles, 
            eventTimezone, 
            startDateTime, 
            endDateTime, 
            createdBy 
        } = req.body;

        if (!assignedProfiles || assignedProfiles.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'At least one profile must be assigned' 
            });
        }

        if (!isValidTimezone(eventTimezone)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid event timezone format' 
            });
        }

        if (!startDateTime || !endDateTime) {
            return res.status(400).json({ 
                success: false, 
                message: 'Start and end date/time are required' 
            });
        }
        const startUTC = convertToUTC(startDateTime, eventTimezone);
        const endUTC = convertToUTC(endDateTime, eventTimezone);

        if (endUTC <= startUTC) {
            return res.status(400).json({ 
                success: false, 
                message: 'End date/time must be after start date/time' 
            });
        }
        const users = await User.find({ _id: { $in: assignedProfiles } });
        if (users.length !== assignedProfiles.length) {
            return res.status(400).json({ 
                success: false, 
                message: 'One or more assigned profiles do not exist' 
            });
        }
        const creator = await User.findById(createdBy);
        if (!creator) {
            return res.status(400).json({ 
                success: false, 
                message: 'Creator profile does not exist' 
            });
        }

        const event = new Event({
            assignedProfiles,
            eventTimezone,
            startDateTime: startUTC,
            endDateTime: endUTC,
            createdBy
        });

        const savedEvent = await event.save();
        
        // Populate the saved event for response
        const populatedEvent = await Event.findById(savedEvent._id)
            .populate('assignedProfiles', 'profile_name')
            .populate('createdBy', 'profile_name');

        res.status(201).json({
            success: true,
            message: 'Event created successfully',
            data: populatedEvent
        });
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error',
            error: error.message 
        });
    }
};
const getUserEvents = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }
        const events = await Event.find({ 
            assignedProfiles: userId 
        })
        .populate('assignedProfiles', 'profile_name')
        .populate('createdBy', 'profile_name')
        .sort({ startDateTime: 1 });

        res.status(200).json({
            success: true,
            data: events
        });
    } catch (error) {
        console.error('Error fetching user events:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error',
            error: error.message 
        });
    }
};
const updateEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        const {
            assignedProfiles, 
            eventTimezone, 
            startDateTime, 
            endDateTime, 
            updatedBy 
        } = req.body;
        const existingEvent = await Event.findById(eventId);
        if (!existingEvent) {
            return res.status(404).json({ 
                success: false, 
                message: 'Event not found' 
            });
        }
        const updater = await User.findById(updatedBy);
        if (!updater) {
            return res.status(400).json({ 
                success: false, 
                message: 'Updater profile does not exist' 
            });
        }
        // Check if user can update this event (either assigned to them, they created it, or for legacy events with no creator/assignees)
        const isAssigned = existingEvent.assignedProfiles.some(profileId => profileId.toString() === updatedBy);
        const isCreator = existingEvent.createdBy && existingEvent.createdBy.toString() === updatedBy;
        const isLegacyEvent = !existingEvent.createdBy && existingEvent.assignedProfiles.length === 0;
        
        const canUpdate = isAssigned || isCreator || isLegacyEvent;
        
        if (!canUpdate) {
            return res.status(403).json({ 
                success: false, 
                message: 'You can only update events assigned to you or created by you' 
            });
        }
        const previousValues = {
            assignedProfiles: existingEvent.assignedProfiles,
            eventTimezone: existingEvent.eventTimezone,
            startDateTime: existingEvent.startDateTime,
            endDateTime: existingEvent.endDateTime
        };
        const updateData = {};
        if (assignedProfiles !== undefined) {
            if (!assignedProfiles || assignedProfiles.length === 0) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'At least one profile must be assigned' 
                });
            }
            const users = await User.find({ _id: { $in: assignedProfiles } });
            if (users.length !== assignedProfiles.length) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'One or more assigned profiles do not exist' 
                });
            }
            updateData.assignedProfiles = assignedProfiles;
        }
        if (eventTimezone !== undefined) {
            if (!isValidTimezone(eventTimezone)) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Invalid event timezone format' 
                });
            }
            updateData.eventTimezone = eventTimezone;
        }
        const finalTimezone = eventTimezone || existingEvent.eventTimezone;
        if (startDateTime !== undefined) {
            updateData.startDateTime = convertToUTC(startDateTime, finalTimezone);
        }
        if (endDateTime !== undefined) {
            updateData.endDateTime = convertToUTC(endDateTime, finalTimezone);
        }
        const finalStartDateTime = updateData.startDateTime || existingEvent.startDateTime;
        const finalEndDateTime = updateData.endDateTime || existingEvent.endDateTime;
        if (finalEndDateTime <= finalStartDateTime) {
            return res.status(400).json({ 
                success: false, 
                message: 'End date/time must be after start date/time' 
            });
        }
        const updatedEvent = await Event.findByIdAndUpdate(
            eventId,
            updateData,
            { new: true, runValidators: true }
        ).populate('assignedProfiles', 'profile_name')
         .populate('createdBy', 'profile_name');

        const eventLog = new EventLog({
            eventId,
            changedBy: updatedBy,
            previousValues,
            updatedValues: {
                assignedProfiles: updatedEvent.assignedProfiles,
                eventTimezone: updatedEvent.eventTimezone,
                startDateTime: updatedEvent.startDateTime,
                endDateTime: updatedEvent.endDateTime
            }
        });

        await eventLog.save();

        res.status(200).json({
            success: true,
            message: 'Event updated successfully',
            data: updatedEvent
        });
    } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error',
            error: error.message 
        });
    }
};
const getEventLogs = async (req, res) => {
    try {
        const { eventId } = req.params;
        const { userId } = req.query;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ 
                success: false, 
                message: 'Event not found' 
            });
        }
        const logs = await EventLog.find({ eventId })
            .populate('changedBy', 'profile_name')
            .sort({ timestamp: -1 });

        res.status(200).json({
            success: true,
            data: logs
        });
    } catch (error) {
        console.error('Error fetching event logs:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error',
            error: error.message 
        });
    }
};
const getAllEvents = async (req, res) => {
    try {
        const events = await Event.find()
            .populate('assignedProfiles', 'profile_name')
            .populate('createdBy', 'profile_name')
            .sort({ startDateTime: 1 });

        res.status(200).json({
            success: true,
            data: events
        });
    } catch (error) {
        console.error('Error fetching all events:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error',
            error: error.message 
        });
    }
};

module.exports = {
    createEvent,
    getUserEvents,
    updateEvent,
    getEventLogs,
    getAllEvents
};