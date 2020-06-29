const permissions = require('../../wrappers/permissions')
const settings = require("../../settings")

module.exports = async function(msg){
	//Check if settings allow this command
	if(settings.modCommands.enabled === false) throw "The modCommands module is disabled"
	if(settings.modCommands.removeMinimod === false) throw "The removeMinimod command module is disabled"

	//Author must be an moderator
    if(!(await permissions.IsModerator(msg.member))) throw "You are not a moderator"
	
	//There must be a mention
	var firstMention = msg.mentions.users.first()
	if(!firstMention) throw 'You must mention someone'
	let target = (await msg.guild.members.fetch()).get(firstMention.id)
	if(!target) throw 'Could not find user...'
	
	//Can't remove mini-mod from someone whos not a mini mod
	if(!(await permissions.IsMiniModerator(target))) throw "That member is not a mini-moderator"

	//Find the role
	var role = msg.guild.roles.cache.find(role => role.name.toLowerCase() === "mini-moderator")
	if(!role) throw "Could not find a role named 'mini-moderator' in this guild. This means the user is already not a mini-moderator"
	//Removes the role from the target
	await target.roles.remove(role)
	msg.channel.send(`<@${target.id}> is no longer a mini-moderator`);
}