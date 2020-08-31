const permissions = require('../../wrappers/permissions')
const settings = require("../../settings")

module.exports = async function(msg){
	//Check if this module is enabled
	if(settings.modCommands.enabled !== true) throw "The moderator commands module is disabled"
	if(settings.modCommands.addRoleWhitelist.length <= 0) throw "The addrole command module is disabled"

	//Only admins, moderators, and mini-moderators can use this command
	let isMod = await permissions.IsModerator(msg.member)
	let isMiniMod = await permissions.IsMiniModerator(msg.member)
	if(!isMod && !isMiniMod) throw "You can't execute that command"

	//Split the message for command parsing
	let commandSplit = msg.content.split(" ")

	//Who to add the role to
	if(!msg.mentions.users.first()) throw 'You must mention someone'
	let targetid = msg.mentions.users.first().id;
	let target = (await msg.guild.members.fetch()).get(targetid)
	if(!target) throw 'Could not find user...'
	
	//What role to add
	let role
	//First check if the role name option was specified
	if(msg.opts.name) role = msg.guild.roles.cache.find(role => role.name.toLowerCase() === msg.opts.name.toLowerCase())
	//Otherwise check if the role was mentioned
	else {
		let pattern = /<@&?(\d{17,19})>/
		for(let i=0; i<commandSplit.length; i++){
			var match = commandSplit[i].match(pattern)
			if(match != null){
				role = msg.guild.roles.cache.find(role => role.id == match[1])
				break;
			}
		}
	}
	if(!role) throw "That role doesn't exist"

	//Check if the role ID is whitelisted
	//Used find instead of indexOf for support of string and numbered role id indexes
	if(!settings.modCommands.addRoleWhitelist.find(e => e == role.id)) throw "That role is not whitelisted as removable"

	//Apply the role
	await target.roles.remove(role, `Removed by <@${msg.author.id}>`)
	
	//Confirm completion
	msg.react("✅")
}