const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        require: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    //add file to each user
    fileIDlogs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'File'
    }],
});

const User = mongoose.model('User', UserSchema);

module.exports = User;