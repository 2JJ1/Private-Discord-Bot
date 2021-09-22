var {SlashCommandBuilder} = require('@discordjs/builders')

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription('Bot responds with latency.'),
    async execute(interaction){
        let m = await interaction.reply({content: "...", fetchReply: true})
        m.edit(`Pong! Latency is ${m.createdTimestamp - interaction.createdTimestamp}ms.`)
    },
}