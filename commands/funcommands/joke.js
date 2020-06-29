const { Set } = require("../../my_modules/discord-set");
const settings = require("../../settings")

//Variables
const set = new Set();

module.exports = async function(msg){
    //Check if settings allow this command
    if(settings.funCommands.enabled === false) throw "The funCommands module is disabled"
	if(settings.funCommands.joke === false) throw "The joke command module is disabled"

    let res = set.joke({type: "general"});
    let _msg = await msg.channel.send(`${res.setup}`)
    setTimeout(function(){
        _msg.edit(`${res.setup}\n${res.punchline}`)
    }, 3000)
}