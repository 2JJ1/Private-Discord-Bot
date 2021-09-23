const {SlashCommandBuilder} = require("@discordjs/builders")
const eightballResponses = require('../../flatdbs/eightball')
const settings = require("../../settings")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("8ball")
        .setDescription("Asks the gods for an answer to your yes or no question.")
        .addStringOption(option => 
            option
                .setName("question")
                .setDescription("What is your yes or no question?")
                .setRequired(true)
        ),
    async execute(interaction){
        try{
            //Check if settings allow this command
            if(settings.funCommands.enabled === false) throw "The funCommands module is disabled."
            if(settings.funCommands.eightball === false) throw "The eightball command module is disabled."

            //Question must have more than 3 words
            let question = interaction.options.getString("question", true)
            if(question.split(" ").length < 3) throw "Your question is too short."

            var response = eightballResponses[Math.floor(Math.random()*eightballResponses.length)]

            interaction.reply({embeds: [{
                title: "Magic 8-Ball",
                fields: [
                    {
                        name: "Question",
                        value: question,
                    },
                    {
                        name: "Magic Answer",
                        value: response,
                    },
                ],
            }]})
        }
        catch(e){
            if(typeof e === "string") interaction.reply(`Error: ${e}`)
            else console.error(e)
        }
    }
}