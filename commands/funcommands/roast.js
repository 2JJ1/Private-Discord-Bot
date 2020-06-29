const settings = require("../../settings")

const roasts = require('../../flatdbs/roasts')

module.exports = async function(msg){
    //Check if settings allow this command
    if(settings.funCommands.enabled === false) throw "The funCommands module is disabled"
	if(settings.funCommands.roast === false) throw "The roast command module is disabled"

    //Fetch random roast and send it
    var roast = roasts[Math.floor(Math.random() * roasts.length)]
    msg.channel.send(roast)
}