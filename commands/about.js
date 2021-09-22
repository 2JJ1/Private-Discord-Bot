var {SlashCommandBuilder} = require('@discordjs/builders')

module.exports = {
    data: new SlashCommandBuilder()
        .setName("about")
        .setDescription('Lets talk about me.'),
    async execute(msg){
        msg.reply({embed: {
            description: "Check out my source code: https://github.com/2JJ1/Private-Discord-Bot\nFollow my original creator on YouTube: https://www.youtube.com/channel/UC4fs_zKuE1lsXbCLS_Y9UTA",
        }})
    }
}