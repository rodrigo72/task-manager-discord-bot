const findOrCreateTeamMemberByDiscordId = require('../utils/findOrCreateMember.js');

module.exports = {
    name: "register",
    description: "Register a user",
    async execute(message, args) {

        let name = null;
        if (args[0]) {
            name = args[0];
        } else {
            name = message.author.username;
        }

        const discordId = message.author.id;

        await findOrCreateTeamMemberByDiscordId(discordId, name);
        message.channel.send(`Registado com sucesso.`);
    }
}
