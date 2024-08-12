const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    phoneNumber: {
        type: String,
        required: true,
        unique: true
    },
    location: {
        type: String,
        required: false
    },
    language: {
        type: String,
        required: false,
        default: 'Swahili'
    },
    alertPreferences: {
        daily: {
            type: Boolean,
            default: true
        },
        severeWeatherOnly: {
            type: Boolean,
            default: false
        }
    }
});

module.exports = mongoose.model('User', UserSchema);
