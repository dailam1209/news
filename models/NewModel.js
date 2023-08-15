const mongoose = require('mongoose');

const NewSchema = mongoose.Schema({
    name: { type: String, require: true },
    url: { type: String, require: true },
    image: { type: String, require: true },
    createAt: {
        type: Date,
        default: Date.now()
    }
});

module.exports = mongoose.model("New", NewSchema);
