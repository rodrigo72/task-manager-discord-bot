const mongoose = require('mongoose');
const autoIncrement = require('../utils/autoIncrement.js');

const teamMemberSchema = new mongoose.Schema({
    name: {
        type: String,
        required: false,
        unique: true
    },
    memberId: {
        type: Number,
        unique: true
    },
    discordId: {
        type: String,
        required: true,
        unique: true
    },
    roles: {
        Collaborator: {
            type: Number,
            default: 1111
        },
        Manager: {
            type: Number,
            default: 0
        },
        Admin: {
            type: Number,
            default: 0
        }
    },
    assignedTasks: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Task'
        }
    ]
});

teamMemberSchema.pre('save', async function (next) {
    if (this.isNew) {
        this.memberId = await autoIncrement(this.constructor, 'memberId');
    }
    next();
});

module.exports = mongoose.model('TeamMember', teamMemberSchema);
