const {SlashCommandBuilder} = require("@discordjs/builders")
const eightballResponses = require('../../flatdbs/eightball')
const settings = require("../../settings")

module.exports = {
    enabled: settings.funCommands.eightball === true,
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