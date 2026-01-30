const mongoose = require("mongoose");

const eventSchema = mongoose.Schema({
    assignedProfiles: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    eventTimezone: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                try {
                    Intl.DateTimeFormat(undefined, {timeZone: v});
                    return true;
                } catch (ex) {
                    return false;
                }
            },
            message: 'Invalid timezone format. Use IANA format like Asia/Kolkata'
        }
    },
    startDateTime: {
        type: Date,
        required: true
    },
    endDateTime: {
        type: Date,
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});
eventSchema.index({ assignedProfiles: 1 });
eventSchema.index({ startDateTime: 1 });

module.exports = mongoose.model('Event', eventSchema);