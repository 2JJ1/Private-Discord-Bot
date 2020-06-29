const eightballResponses = require('../../flatdbs/eightball')
const settings = require("../../settings")

module.exports = async function(msg){
    //Check if settings allow this command
    if(settings.funCommands.enabled === false) throw "The funCommands module is disabled"
	if(settings.funCommands.eightball === false) throw "The eightball command module is disabled"

    if(msg.content.split(" ").length < 3) throw "Your question is too short."

    var response = eightballResponses[Math.floor(Math.random()*eightballResponses.length)]
    msg.reply(response)
}