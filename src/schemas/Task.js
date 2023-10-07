const mongoose = require('mongoose');
const autoIncrement = require('../utils/autoIncrement.js');

const taskSchema = new mongoose.Schema({
    taskId: {
        type: Number,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    beginDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    completionPercentage: {
        type: Number,
        required: false
    },
    assignedTeamMembers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'TeamMember'
        }
    ],
    taskGroup: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TaskGroup'
    }
});

taskSchema.pre('save', async function (next) {
    if (this.isNew) {
        this.taskId = await autoIncrement(this.constructor, 'taskId');
    }
    next();
});

module.exports = mongoose.model('Task', taskSchema);
