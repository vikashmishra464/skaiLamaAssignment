const mongoose = require("mongoose");

const eventLogSchema = mongoose.Schema({
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    changedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    previousValues: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    updatedValues: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});
eventLogSchema.index({ eventId: 1, timestamp: -1 });

module.exports = mongoose.model('EventLog', eventLogSchema);