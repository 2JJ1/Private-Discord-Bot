const {SlashCommandBuilder} = require("@discordjs/builders")
const settings = require("../../settings")

const roasts = require('../../flatdbs/roasts')

module.exports = {
    data: new SlashCommandBuilder()
        .setName("roast")
        .setDescription("Insults you in the text channel."),
    async execute(interaction){
        try{
            //Check if settings allow this command
            if(settings.funCommands.enabled === false) throw "The funCommands module is disabled"
            if(settings.funCommands.roast === false) throw "The roast command module is disabled"

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