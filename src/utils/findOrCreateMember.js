const TeamMember = require('../schemas/TeamMember.js');

const findOrCreateTeamMemberByDiscordId = async (discordId, username) => {
    try {
        let teamMember = await TeamMember.findOne({discordId: discordId}).exec();
        if (! teamMember) 
            await TeamMember.create({discordId: discordId, name: username});
    } catch (error) {
        console.error('Error finding or creating team member:', error);
    }
}

module.exports = findOrCreateTeamMemberByDiscordId;