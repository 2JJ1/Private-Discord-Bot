const {SlashCommandBuilder} = require("@discordjs/builders")
const settings = require("../../settings")

const roasts = require('../../flatdbs/roasts')

module.exports = {
    enabled: settings.funCommands.roast === true,
    data: new SlashCommandBuilder()
        .setName("roast")
        .setDescription("Insults you in the text channel."),
    async execute(interaction){
        try{
            //Fetch random roast and send it
            var roast = roasts[Math.floor(Math.random() * roasts.length)]
            interaction.reply(roast)
        }
        catch(e){
            if(typeof e === "string") interaction.reply(`Error: ${e}`)
            else console.error(e)
        }
    }
}