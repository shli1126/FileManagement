const mongoose = require('mongoose')

const FileSchema = new mongoose.Schema({
    path: {
        type: String,
        required: true
    },
    fileName: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
    //password: String
})

const File = mongoose.model('File', FileSchema);

module.exports = File;