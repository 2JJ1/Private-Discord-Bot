var {SlashCommandBuilder} = require('@discordjs/builders')

module.exports = {
    data: new SlashCommandBuilder()
        .setName("commands")
        .setDescription('Responds with the list of commands.'),
    execute(interaction){
        interaction.reply({
            embeds: [{
                fields: [
                    {
                        name: "Public Commands List",
                        value: "!8ball <question>, !joke, !meme, !roast, !compile <coding_language> <code>, !whois <@mention>, !guildinfo, !listmods, !ping, !about"
                    }
                ],
            }]
        })
    },
}