const {SlashCommandBuilder} = require("@discordjs/builders")
const { Set } = require("../../my_modules/discord-set");
const throttler = require("../../my_modules/throttler")
const settings = require("../../settings")

//Variables
const set = new Set();

module.exports = {
    enabled: settings.funCommands.meme === true,
    data: new SlashCommandBuilder()
        .setName("meme")
        .setDescription("Grabs a random meme online and displays it."),
    async execute(interaction){
        try{
            //Only 12 memes can be called per 5 seconds
            const throttleOptions = {
                maxCalls: 12,
                timeFrame: 5,
                burst: false
            }
            await throttler(`${interaction.guild.id}-memes`, throttleOptions)
            .catch(()=>{throw "This guild is requesting memes too fast..."})

            set.meme(interaction, ["me_irl", "Dankmemes"], { readyMade: true })
        }
        catch(e){
            if(typeof e === "string") interaction.reply(`Error: ${e}`)
            else console.error(e)
        }
    }
}