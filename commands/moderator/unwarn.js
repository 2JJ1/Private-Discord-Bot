var {SlashCommandBuilder} = require('@discordjs/builders')
const permissions = require('../../wrappers/permissions')
const settings = require("../../settings")

module.exports = {
	data: new SlashCommandBuilder()
		.setName("unwarn")
		.setDescription('Removes the "warned" role from the selected member.')
		.addUserOption(option => 
			option
				.setName("member")
				.setDescription("The member that you want to unwarn.")
				.setRequired(true)
		),
	async function(msg){
		//Check if this module is enabled
		if(settings.modCommands.enabled === false) throw "The modCommands module is disabled"
		if(settings.modCommands.unwarn === false) throw "The unwarn command module is disabled"

		//Only admins, moderators, and mini-moderators can use this command
		let isMod = await permissions.IsModerator(msg.member)
		let isMiniMod = await permissions.IsMiniModerator(msg.member)
		if(!isMod && !isMiniMod) throw "You can't execute that command"

		//Determine who to unwarn
		let target = msg.mentions.members.first()
		if(!target) throw 'You must mention someone in the guild'
		let targetid = target.id;

		//Fetch the warned role
		var warnRole = msg.guild.roles.cache.find(role => role.name.toLowerCase() === "warned")
		if(!warnRole) throw "The warned 'role' does not exist in this guild. This means the member already unwarned."
				
		//Removes the role
		await target.roles.remove(warnRole)
		
		msg.channel.send("Removed warned role from <@" + targetid + ">");
	}
}