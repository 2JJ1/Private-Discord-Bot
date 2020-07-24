const permissions = require('../../wrappers/permissions')
const settings = require("../../settings")

module.exports = async function(msg){
	//Check if this module is enabled
	if(settings.modCommands.enabled === false) throw "The modCommands module is disabled"
	if(settings.modCommands.slowMode === false) throw "The warn command module is disabled"

	//Only admins and moderators can use this command
	let isMod = await permissions.IsModerator(msg.member)
    if(!isMod) throw "You can't execute that command"

    //To get the time
    var time = msg.content.substring(1).toLowerCase().split(" ")[1]
    //Sanitize the time. Must be a number and shorter than the max time
    if(!/^[0-9]+$/.test(time) || time > settings.modCommands.maxSlowMode) throw `Please pick a number of seconds up to ${settings.modCommands.maxSlowMode}.`

    //Sets the slowmode
    msg.channel.setRateLimitPerUser(time, `SLOWMODE time set by <@${msg.author.id}>`)

	//Report success
	msg.reply(`Set SLOWMODE for this text channel to ${time} seconds.`)
}