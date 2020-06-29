const { Set } = require("../../my_modules/discord-set");
const throttler = require("../../my_modules/throttler")
const settings = require("../../settings")

//Variables
const set = new Set();

module.exports = async function(msg){
    //Check if settings allow this command
    if(settings.funCommands.enabled === false) throw "The funCommands module is disabled"
	if(settings.funCommands.meme === false) throw "The meme command module is disabled"

	//Only 12 memes can be called per 5 seconds
	const throttleOptions = {
		maxCalls: 12,
        timeFrame: 5,
        burst: false
	}
    await throttler(`${msg.guild.id}-memes`, throttleOptions)
    .catch(()=>{throw "This guild is requesting memes too fast..."})

    set.meme(msg.channel, ["me_irl", "Dankmemes"], { readyMade: true })
}