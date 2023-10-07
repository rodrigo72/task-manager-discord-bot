const mongoose = require('mongoose');
const autoIncrement = require('../utils/autoIncrement.js');

const taskGroupSchema = new mongoose.Schema({
    groupId: {
        type: Number,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    tasks: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Task'
        }
    ]
});


taskGroupSchema.pre('save', async function (next) {
    if (this.isNew) {
        this.groupId = await autoIncrement(this.constructor, 'groupId');
    }
    next();
});

module.exports = mongoose.model('TaskGroup', taskGroupSchema);
