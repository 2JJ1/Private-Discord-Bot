const permissions = require('../../wrappers/permissions')
const settings = require("../../settings")

module.exports = async function(msg){
	//Check if this module is enabled
	if(settings.modCommands.enabled === false) throw "The modCommands module is disabled"
	if(settings.modCommands.warn === false) throw "The warn command module is disabled"

	//Only admins, moderators, and mini-moderators can use this command
	let isMod = await permissions.IsModerator(msg.member)
	let isMiniMod = await permissions.IsMiniModerator(msg.member)
	if(!isMod && !isMiniMod) throw "You can't execute that command"

	//Determine who to warn
	let target = msg.mentions.members.first()
	if(!target) throw 'You must mention someone in the guild'
	let targetid = target.id;
						
	//You can only warn non-moderators
	let targetIsMod = await permissions.IsModerator(target)
	if(targetIsMod) throw "You can't warn another mod"
					
	let warningMessage = 'A moderator has marked you as warned. Please be mindful of the rules! Acting against them or participating as a disturbance can get you muted. In extreme conditions, you can even be banned.'

	//Why they are being warned
	var reason
	//If specified through an option
	if(msg.opts.reason) reason = msg.opts.reason
	//Otherwise, assume anything after the mention is the reason unless any other option is specified
	else if(Object.keys(msg.opts).length <= 0){
		let match = msg.content.match(/<@!?(\d{17,19})>/)
		if(match) reason = msg.content.substr(match.index + match[0].length + 1)
	}
	reason = (reason.length > 2000 ? reason.substr(0,2000) + "..." : reason) || "Not specified"

	warningMessage += `\n\nMessage from moderator: ${reason}`

	//Fetch the "warned" role's id
	var warnRole = msg.guild.roles.cache.find(role => role.name.toLowerCase() === "warned")
	var warnRoleId
	if(warnRole) warnRoleId = warnRole.id
	else {
		//Warned role doesn't exist, so create it
		let newRole = await msg.guild.roles.create({
			data: {
				name: "warned",
				color: 0x95a5a6,
				hoist: false,
				position: 0,
				permissions: 0
			}, 
			reason: "Attempted to warn member, but the role did not exist."
		})
		warnRoleId = newRole.id
	}

	//Apply the role
	await target.roles.add(warnRoleId, `Warned by <@${msg.author.id}> - (${reason})`)

	//Send the warned user their warning
	target.send(warningMessage)
	.then(() => msg.channel.send(`<@${targetid}> Has been warned via DM`))
	.catch(() => msg.channel.send('Failed to DM that user, but they can refer to your mention.'))
}