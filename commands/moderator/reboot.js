const permissions = require('../../wrappers/permissions')
const settings = require("../../settings")

module.exports = async function(msg){
    //Check if guild settings allow this command
	if(settings.modCommands.enabled === false) throw "The modCommands module is disabled"
    if(settings.modCommands.reboot === false) throw "The reboot command module is disabled"
    
    //Must be a mod to continue
    let isMod = await permissions.IsModerator(msg.member)
    if(isMod !== true)  throw 'You are not a moderator'
    
    //Won't be able to respond after killing, so confirm prior
    await msg.react("✅")

    //Kill the process assuming the a process manager will reboot it
	process.exit(1);
}