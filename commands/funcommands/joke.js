const {SlashCommandBuilder} = require("@discordjs/builders")
const { Set } = require("../../my_modules/discord-set");
const settings = require("../../settings")

//Variables
const set = new Set();

module.exports = {
    data: new SlashCommandBuilder()
        .setName("joke")
        .setDescription("Replies with a random joke."),
    async execute(interaction){
        try{
            //Check if settings allow this command
            if(settings.funCommands.enabled === false) throw "The funCommands module is disabled"
            if(settings.funCommands.joke === false) throw "The joke command module is disabled"

            let res = set.joke({type: "general"});
            await interaction.reply(`${res.setup}`)
            setTimeout(function(){
                interaction.editReply(`${res.setup}\n${res.punchline}`)
            }, 3000)
        }
        catch(e){
            if(typeof e === "string") interaction.reply(`Error: ${e}`)
            else console.error(e)
        }
    }
}